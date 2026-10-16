// Fonction serveur (Vercel) : le parent crée et gère les accès de ses enfants, génère des QR codes d'activation/connexion
// et administre le statut de ses comptes élèves. La clé SUPABASE_SERVICE_ROLE_KEY reste ICI, jamais dans l'application.
// L'appelant parent est identifié par son jeton de session Supabase ; il ne peut agir que sur ses propres enfants.
// Les actions publiques (verify-qr, consume-qr) vérifient la validité cryptographique du jeton QR à usage unique.
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes, randomInt } from "node:crypto";

interface Req { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> }
interface Res { status(code: number): Res; json(body: unknown): void; setHeader(k: string, v: string): void }

const CHILD_DOMAIN = "eleves.declickmath.invalid"; // identique à src/lib/authRemote.ts
const PWD_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sans caractères ambigus
const MAX_CHILDREN = 20;

const newPassword = () => Array.from({ length: 8 }, () => PWD_CHARS[randomInt(PWD_CHARS.length)]).join("");
const newLogin = (name: string) => {
  const base = name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "eleve";
  return `${base}.${randomInt(1000, 10000)}`;
};
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const generateToken = () => randomBytes(32).toString("hex");

/** Limite par adresse des actions publiques liées au QR code (au mieux, par instance) : 30 appels par minute. */
const qrHits = new Map<string, number[]>();
export function qrRateLimited(ip: string, now = Date.now()): boolean {
  const recent = (qrHits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  qrHits.set(ip, recent);
  return recent.length > 30;
}

interface Kid { name?: unknown; level?: unknown; serie?: unknown; password?: unknown }
interface Body {
  action?: string;
  children?: Kid[];
  childId?: string;
  password?: string;
  customPassword?: string;
  purpose?: "activation" | "quick_login";
  token?: string;
  newPassword?: string;
  suspended?: boolean;
}

type Admin = ReturnType<typeof createClient<any>>;
interface Created { id: string; name: string; login: string }

/** Prend le jeton en une seule opération : si deux appels arrivent ensemble, un seul réussit (usage unique garanti par la base). */
async function claimToken(admin: Admin, id: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { data } = await admin.from("student_qr_tokens").update({ used_at: now }).eq("id", id).is("used_at", null).is("revoked_at", null).gt("expires_at", now).select("id");
  return !!data?.length;
}

/** Crée les comptes en attente : le mot de passe définitif appartient à l'élève, lors de l'acceptation. */
async function createKids(admin: Admin, parent: { id: string; country: string }, kids: Kid[]): Promise<Created[] | null> {
  const created: Created[] = [];
  for (const k of kids) {
    const name = String(k.name).trim().slice(0, 80);
    const level = /^[a-z0-9]{1,5}$/.test(String(k.level)) ? String(k.level) : "3e";
    const serie = typeof k.serie === "string" ? k.serie.slice(0, 4) : "";
    const password = newPassword();
    for (let attempt = 0; attempt < 5; attempt++) {
      const login = newLogin(name);
      const { data, error } = await admin.auth.admin.createUser({
        email: `${login}@${CHILD_DOMAIN}`, password, email_confirm: true,
        app_metadata: { parent_id: parent.id, login },
        user_metadata: { role: "student", name, country: parent.country, level, serie },
      });
      if (error || !data.user) {
        if (!/already|registered|exists/i.test(error?.message ?? "")) return created.length ? created : null;
        continue;
      }
      // Le profil de l'élève est créé ici (le déclencheur de la base ne gère que les parents : GoTrue n'enregistre app_metadata qu'après coup).
      const { error: pe } = await admin.from("profiles").insert({
        id: data.user.id, role: "student", name, login, country: parent.country, level, serie: serie || null, parent_id: parent.id,
        must_change_password: true, password_customized: false,
      });
      const { error: se } = pe ? { error: pe } : await admin.from("solution_modes").insert({ student_id: data.user.id, mode: "deferred" });
      if (pe || se) {
        await admin.auth.admin.deleteUser(data.user.id); // on ne laisse pas de compte sans profil
        if (pe?.code === "23505") continue; // identifiant déjà pris : on en tire un autre
        return created.length ? created : null;
      }
      created.push({ id: data.user.id, name, login });
      break;
    }
  }
  return created;
}

export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const missing = [!url && "SUPABASE_URL (ou VITE_SUPABASE_URL)", !key && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean).join(" et ");
    return res.status(503).json({ error: `Serveur non configuré (${missing} manquante).` });
  }

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const rawBody = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {}) as Body & { userId?: string };

  // =========================================================================
  // ACTIONS PUBLIQUES (Ne requièrent pas de session parent : vérification et utilisation du jeton QR)
  // =========================================================================

  // 1. Inscription rapide lors de l'enregistrement du parent
  if (rawBody.action === "provision") {
    const { data: u } = await admin.auth.admin.getUserById(String(rawBody.userId ?? ""));
    const user = u?.user;
    const pending = user?.user_metadata?.pending_children as Kid[] | undefined;
    if (!user || user.user_metadata?.role !== "parent" || !pending?.length || Date.now() - Date.parse(user.created_at) > 30 * 60_000) return res.status(403).json({ error: "Création refusée." });
    const kids = pending.filter((k) => typeof k.name === "string" && k.name.trim()).slice(0, MAX_CHILDREN);
    const { data: parent } = await admin.from("profiles").select("id, country, name").eq("id", user.id).single();
    if (!parent) return res.status(404).json({ error: "Profil du parent introuvable." });
    const created = await createKids(admin, parent, kids);
    if (!created?.length) return res.status(500).json({ error: "Création impossible." });
    await admin.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, pending_children: [] } });
    return res.status(200).json({ created });
  }

  if (rawBody.action === "verify-qr" || rawBody.action === "consume-qr") {
    const fwd = req.headers["x-forwarded-for"];
    const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0].trim() || "?";
    if (qrRateLimited(ip)) return res.status(429).json({ error: "Trop d'essais. Réessaie dans une minute." });
  }

  // 2. Vérification d'un QR code (l'élève a scanné le QR code avec son téléphone/tablette)
  if (rawBody.action === "verify-qr") {
    const rawToken = String(rawBody.token ?? "").trim();
    if (!rawToken) return res.status(400).json({ error: "Jeton QR manquant." });
    const tokenHash = hashToken(rawToken);

    const { data: row, error: tokenErr } = await admin
      .from("student_qr_tokens")
      .select("id, student_id, purpose, expires_at, used_at, revoked_at")
      .eq("token_hash", tokenHash)
      .single();

    if (tokenErr || !row) return res.status(404).json({ error: "Ce QR code est introuvable ou invalide." });
    if (row.revoked_at) return res.status(410).json({ error: "Ce QR code a été révoqué par le parent." });
    if (row.used_at) return res.status(410).json({ error: "Ce QR code a déjà été utilisé." });
    if (Date.parse(row.expires_at) < Date.now()) return res.status(410).json({ error: "Ce QR code a expiré. Demande un nouveau code à ton parent." });

    const { data: student, error: studentErr } = await admin
      .from("profiles")
      .select("id, name, login, level, serie, country, parent_id, parent_linked_at, suspended, must_change_password, password_customized")
      .eq("id", row.student_id)
      .single();

    if (studentErr || !student) return res.status(404).json({ error: "Compte élève introuvable." });
    if (student.suspended) return res.status(403).json({ error: "Ce compte élève est actuellement suspendu." });
    if (row.purpose === "quick_login" && !student.parent_linked_at) return res.status(403).json({ error: "Accepte d'abord l'invitation de ton parent avec le QR code d'activation." });
    const { data: parentProfile, error: parentErr } = await admin.from("profiles").select("name").eq("id", student.parent_id).single();
    if (parentErr || !parentProfile) return res.status(500).json({ error: "Profil du parent invitant introuvable." });

    return res.status(200).json({
      valid: true,
      purpose: row.purpose,
      student: {
        id: student.id,
        name: student.name,
        login: student.login,
        level: student.level,
        serie: student.serie,
        country: student.country,
        parentName: parentProfile.name,
        mustChangePassword: student.must_change_password,
        passwordCustomized: student.password_customized,
      },
    });
  }

  // 3. Consommation d'un QR code (activation avec choix du mot de passe ou connexion rapide sécurisée)
  if (rawBody.action === "consume-qr") {
    const rawToken = String(rawBody.token ?? "").trim();
    if (!rawToken) return res.status(400).json({ error: "Jeton QR manquant." });
    const tokenHash = hashToken(rawToken);

    const { data: row, error: tokenErr } = await admin
      .from("student_qr_tokens")
      .select("id, student_id, purpose, expires_at, used_at, revoked_at")
      .eq("token_hash", tokenHash)
      .single();

    if (tokenErr || !row) return res.status(404).json({ error: "Ce QR code est introuvable ou invalide." });
    if (row.revoked_at) return res.status(410).json({ error: "Ce QR code a été révoqué par le parent." });
    if (row.used_at) return res.status(410).json({ error: "Ce QR code a déjà été utilisé." });
    if (Date.parse(row.expires_at) < Date.now()) return res.status(410).json({ error: "Ce QR code a expiré." });

    const { data: student } = await admin
      .from("profiles")
      .select("id, name, login, country, level, serie, parent_id, parent_linked_at, suspended")
      .eq("id", row.student_id)
      .single();

    if (!student) return res.status(404).json({ error: "Compte élève introuvable." });
    if (student.suspended) return res.status(403).json({ error: "Ce compte élève est suspendu." });

    if (row.purpose === "activation") {
      const newPassword = String(rawBody.newPassword ?? "").trim();
      if (newPassword.length < 6) return res.status(400).json({ error: "Le mot de passe doit comporter au moins 6 caractères." });

      // Invalider le jeton immédiatement (usage unique, atomique)
      if (!(await claimToken(admin, row.id))) return res.status(410).json({ error: "Ce QR code a déjà été utilisé." });

      // Appliquer le mot de passe personnalisé de l'élève
      const { error: pwdErr } = await admin.auth.admin.updateUserById(student.id, { password: newPassword });
      if (pwdErr) {
        await admin.from("student_qr_tokens").update({ used_at: null }).eq("id", row.id);
        return res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe." });
      }

      const { error: profileErr } = await admin.from("profiles").update({
        must_change_password: false,
        password_customized: true,
        parent_linked_at: student.parent_linked_at ?? new Date().toISOString(),
      }).eq("id", student.id);
      if (profileErr) return res.status(500).json({ error: "Mot de passe enregistré, mais l'invitation n'a pas pu être validée. Demande à ton parent de créer un nouveau QR code." });
      return res.status(200).json({
        ok: true,
        purpose: "activation",
        login: student.login,
      });
    }

    if (row.purpose === "quick_login") {
      if (!student.parent_linked_at) return res.status(403).json({ error: "Accepte d'abord l'invitation de ton parent avec le QR code d'activation." });
      if (!(await claimToken(admin, row.id))) return res.status(410).json({ error: "Ce QR code a déjà été utilisé." });
      const email = `${student.login}@${CHILD_DOMAIN}`;
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      if (linkErr || !linkData) {
        return res.status(500).json({ error: "Impossible d'ouvrir la session rapide." });
      }
      return res.status(200).json({
        ok: true,
        purpose: "quick_login",
        login: student.login,
        actionLink: linkData.properties?.action_link,
        hashedToken: linkData.properties?.hashed_token,
      });
    }

    return res.status(400).json({ error: "Action QR inconnue." });
  }

  // =========================================================================
  // ACTIONS PARENT (Vérification du Bearer token Supabase)
  // =========================================================================

  const auth = String(req.headers.authorization ?? "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Connexion requise." });

  const { data: who, error: whoErr } = await admin.auth.getUser(token);
  if (whoErr || !who.user) return res.status(401).json({ error: "Session invalide. Reconnecte-toi." });
  const { data: parent } = await admin.from("profiles").select("id, role, country, suspended").eq("id", who.user.id).single();
  if (!parent || parent.role !== "parent" || parent.suspended) return res.status(403).json({ error: "Réservé aux parents." });

  const body = rawBody;

  // Créer un ou plusieurs enfants
  if (body.action === "create") {
    const kids = (body.children ?? []).filter((k) => typeof k.name === "string" && k.name.trim());
    if (!kids.length) return res.status(400).json({ error: "Aucun enfant à créer." });
    const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("parent_id", parent.id);
    if ((count ?? 0) + kids.length > MAX_CHILDREN) return res.status(400).json({ error: `Maximum ${MAX_CHILDREN} enfants par compte.` });
    const created = await createKids(admin, parent, kids);
    if (created === null) return res.status(500).json({ error: "Création impossible." });
    return res.status(200).json({ created });
  }

  // Générer un nouveau QR code (activation ou connexion rapide)
  if (body.action === "create-qr") {
    const childId = String(body.childId ?? "");
    const purpose = body.purpose === "quick_login" ? "quick_login" : "activation";
    const { data: child } = await admin.from("profiles").select("id, name, login, suspended").eq("id", childId).eq("parent_id", parent.id).eq("role", "student").single();
    if (!child) return res.status(404).json({ error: "Enfant introuvable." });
    if (child.suspended) return res.status(400).json({ error: "Le compte de cet enfant est suspendu. Réactivez-le d'abord." });
    if (purpose === "quick_login") {
      const { data: accepted, error } = await admin.from("profiles").select("parent_linked_at").eq("id", child.id).single();
      if (error) return res.status(500).json({ error: "Impossible de vérifier l'acceptation de l'invitation." });
      if (!accepted?.parent_linked_at) return res.status(400).json({ error: "L'enfant doit d'abord accepter son invitation." });
    }

    // Révoquer les anciens jetons non consommés pour cette même fin
    const { error: revokeErr } = await admin.from("student_qr_tokens").update({ revoked_at: new Date().toISOString() }).eq("student_id", child.id).eq("purpose", purpose).is("used_at", null).is("revoked_at", null);
    if (revokeErr) return res.status(500).json({ error: "Impossible de remplacer l'ancien QR code." });

    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    // Activation valable 48 heures (2880 min) ; connexion rapide valable 15 minutes
    const durationMinutes = purpose === "quick_login" ? 15 : 2880;
    const expiresAt = new Date(Date.now() + durationMinutes * 60_000).toISOString();

    const { error: insErr } = await admin.from("student_qr_tokens").insert({
      student_id: child.id,
      token_hash: tokenHash,
      purpose,
      expires_at: expiresAt,
      created_by: parent.id,
    });
    if (insErr) return res.status(500).json({ error: "Impossible de créer le jeton QR." });

    return res.status(200).json({
      childId: child.id,
      token: rawToken,
      purpose,
      expiresAt: Date.parse(expiresAt),
    });
  }

  // Révoquer immédiatement tous les QR codes d'un enfant
  if (body.action === "revoke-qr") {
    const childId = String(body.childId ?? "");
    const { data: child } = await admin.from("profiles").select("id").eq("id", childId).eq("parent_id", parent.id).eq("role", "student").single();
    if (!child) return res.status(404).json({ error: "Enfant introuvable." });
    const { error } = await admin.from("student_qr_tokens").update({ revoked_at: new Date().toISOString() }).eq("student_id", child.id).is("used_at", null).is("revoked_at", null);
    if (error) return res.status(500).json({ error: "Impossible de révoquer le QR code." });
    return res.status(200).json({ ok: true });
  }

  // Suspendre ou réactiver le compte d'un enfant
  if (body.action === "toggle-suspend") {
    const childId = String(body.childId ?? "");
    const { data: child } = await admin.from("profiles").select("id, suspended").eq("id", childId).eq("parent_id", parent.id).eq("role", "student").single();
    if (!child) return res.status(404).json({ error: "Enfant introuvable." });
    const suspended = typeof body.suspended === "boolean" ? body.suspended : !child.suspended;
    if (suspended) {
      const { error: revokeErr } = await admin.from("student_qr_tokens").update({ revoked_at: new Date().toISOString() }).eq("student_id", child.id).is("used_at", null).is("revoked_at", null);
      if (revokeErr) return res.status(500).json({ error: "Impossible de révoquer les invitations actives." });
    }
    const { error: upErr } = await admin.from("profiles").update({ suspended }).eq("id", child.id);
    if (upErr) return res.status(500).json({ error: "Changement de statut impossible." });
    const { error: banErr } = await admin.auth.admin.updateUserById(child.id, { ban_duration: suspended ? "876000h" : "none" });
    if (banErr) {
      const { error: rollbackErr } = await admin.from("profiles").update({ suspended: child.suspended }).eq("id", child.id);
      return res.status(500).json({ error: rollbackErr ? "La connexion n'a pas été suspendue et le statut du profil doit être vérifié." : "Le statut du compte n'a pas pu être appliqué à la connexion." });
    }
    return res.status(200).json({ id: child.id, suspended });
  }

  // Régénérer l'identifiant d'un enfant
  if (body.action === "reset-login") {
    const childId = String(body.childId ?? "");
    const { data: child } = await admin.from("profiles").select("id, name").eq("id", childId).eq("parent_id", parent.id).single();
    if (!child) return res.status(404).json({ error: "Enfant introuvable." });
    for (let attempt = 0; attempt < 5; attempt++) {
      const login = newLogin(child.name);
      const { error } = await admin.auth.admin.updateUserById(child.id, { email: `${login}@${CHILD_DOMAIN}`, email_confirm: true, app_metadata: { parent_id: parent.id, login } });
      if (error) { if (/already|registered|exists/i.test(error.message)) continue; return res.status(500).json({ error: "Changement impossible." }); }
      await admin.from("profiles").update({ login }).eq("id", child.id);
      return res.status(200).json({ id: child.id, login });
    }
    return res.status(500).json({ error: "Changement impossible." });
  }

  // Nouveau mot de passe (généré ou choisi par le parent)
  if (body.action === "reset-password") {
    const childId = String(body.childId ?? "");
    const { data: child } = await admin.from("profiles").select("id").eq("id", childId).eq("parent_id", parent.id).eq("role", "student").single();
    if (!child) return res.status(404).json({ error: "Enfant introuvable." });
    const requestedPassword = typeof body.password === "string" ? body.password : body.customPassword;
    const customPassword = typeof requestedPassword === "string" ? requestedPassword.trim() : "";
    const password = customPassword.length >= 6 ? customPassword : newPassword();
    const { error } = await admin.auth.admin.updateUserById(child.id, { password });
    if (error) return res.status(500).json({ error: "Changement impossible." });
    await admin.from("profiles").update({ must_change_password: true }).eq("id", child.id);
    return res.status(200).json({ id: child.id, password });
  }

  // Supprime l'accès d'un enfant : compte, profil et progression disparaissent en cascade
  if (body.action === "delete") {
    const childId = String(body.childId ?? "");
    const { data: child } = await admin.from("profiles").select("id").eq("id", childId).eq("parent_id", parent.id).eq("role", "student").single();
    if (!child) return res.status(404).json({ error: "Enfant introuvable." });
    const { error } = await admin.auth.admin.deleteUser(child.id);
    if (error) return res.status(500).json({ error: "Suppression impossible. Réessaie." });
    return res.status(200).json({ id: child.id });
  }

  return res.status(400).json({ error: "Action inconnue." });
}
