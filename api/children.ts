// Fonction serveur (Vercel) : le parent crée et gère les accès de ses enfants. La clé SUPABASE_SERVICE_ROLE_KEY reste ICI, jamais dans l'application.
// L'appelant est identifié par son jeton de session Supabase ; il ne peut agir que sur ses propres enfants.
// Variables : SUPABASE_SERVICE_ROLE_KEY (obligatoire), VITE_SUPABASE_URL (ou SUPABASE_URL).
import { createClient } from "@supabase/supabase-js";
import { randomInt } from "node:crypto";

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

interface Kid { name?: unknown; level?: unknown; serie?: unknown }
interface Body { action?: string; children?: Kid[]; childId?: string }

type Admin = ReturnType<typeof createClient>;
interface Created { id: string; name: string; login: string; password: string }

/** Crée les comptes enfants d'un parent : chacun reçoit son propre identifiant et son propre mot de passe ; renvoie null si Supabase échoue pour une raison autre qu'un identifiant déjà pris. */
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
      const { error: pe } = await admin.from("profiles").insert({ id: data.user.id, role: "student", name, login, country: parent.country, level, serie: serie || null, parent_id: parent.id });
      const { error: se } = pe ? { error: pe } : await admin.from("solution_modes").insert({ student_id: data.user.id, mode: "deferred" });
      if (pe || se) {
        await admin.auth.admin.deleteUser(data.user.id); // on ne laisse pas de compte sans profil
        if (pe?.code === "23505") continue; // identifiant déjà pris : on en tire un autre
        return created.length ? created : null;
      }
      created.push({ id: data.user.id, name, login, password });
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

  // Inscription d'un parent : ses enfants doivent pouvoir se connecter tout de suite, sans attendre la confirmation de l'e-mail du parent.
  // Pas de jeton ici (le parent n'a pas encore de session) : l'identifiant du compte, que seul l'inscrit connaît, suffit ; les enfants
  // viennent des métadonnées enregistrées à l'inscription, jamais de la requête, et l'opération ne marche qu'une fois, juste après l'inscription.
  const early = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {}) as Body & { userId?: string };
  if (early.action === "provision") {
    const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: u } = await admin.auth.admin.getUserById(String(early.userId ?? ""));
    const user = u?.user;
    const pending = user?.user_metadata?.pending_children as Kid[] | undefined;
    if (!user || user.user_metadata?.role !== "parent" || !pending?.length || Date.now() - Date.parse(user.created_at) > 30 * 60_000) return res.status(403).json({ error: "Création refusée." });
    const kids = pending.filter((k) => typeof k.name === "string" && k.name.trim()).slice(0, MAX_CHILDREN);
    const { data: parent } = await admin.from("profiles").select("id, country").eq("id", user.id).single();
    if (!parent) return res.status(404).json({ error: "Profil du parent introuvable." });
    const created = await createKids(admin, parent, kids);
    if (!created?.length) return res.status(500).json({ error: "Création impossible." });
    await admin.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, pending_children: [] } });
    return res.status(200).json({ created });
  }

  const auth = String(req.headers.authorization ?? "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Connexion requise." });

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: who, error: whoErr } = await admin.auth.getUser(token);
  if (whoErr || !who.user) return res.status(401).json({ error: "Session invalide. Reconnecte-toi." });
  const { data: parent } = await admin.from("profiles").select("id, role, country, suspended").eq("id", who.user.id).single();
  if (!parent || parent.role !== "parent" || parent.suspended) return res.status(403).json({ error: "Réservé aux parents." });

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {}) as Body;

  if (body.action === "create") {
    const kids = (body.children ?? []).filter((k) => typeof k.name === "string" && k.name.trim());
    if (!kids.length) return res.status(400).json({ error: "Aucun enfant à créer." });
    const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("parent_id", parent.id);
    if ((count ?? 0) + kids.length > MAX_CHILDREN) return res.status(400).json({ error: `Maximum ${MAX_CHILDREN} enfants par compte.` });
    const created = await createKids(admin, parent, kids);
    if (created === null) return res.status(500).json({ error: "Création impossible." });
    return res.status(200).json({ created });
  }

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

  // Nouveau mot de passe pour un enfant (identifiant inchangé) ; le parent le lit à l'écran et le transmet.
  if (body.action === "reset-password") {
    const childId = String(body.childId ?? "");
    const { data: child } = await admin.from("profiles").select("id").eq("id", childId).eq("parent_id", parent.id).eq("role", "student").single();
    if (!child) return res.status(404).json({ error: "Enfant introuvable." });
    const password = newPassword();
    const { error } = await admin.auth.admin.updateUserById(child.id, { password });
    if (error) return res.status(500).json({ error: "Changement impossible." });
    return res.status(200).json({ id: child.id, password });
  }

  // Supprime l'accès d'un enfant : son compte, son profil et sa progression disparaissent (suppression en cascade). Irréversible.
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
