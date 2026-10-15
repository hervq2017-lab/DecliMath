// Fonction serveur (Vercel) : le parent crée et gère les accès de ses enfants. La clé SUPABASE_SERVICE_ROLE_KEY reste ICI, jamais dans l'application.
// L'appelant est identifié par son jeton de session Supabase ; il ne peut agir que sur ses propres enfants.
// Variables : SUPABASE_SERVICE_ROLE_KEY (obligatoire), VITE_SUPABASE_URL (ou SUPABASE_URL).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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

/** Code famille : mot de passe commun des comptes enfants. Créé au besoin ; `renew` en génère un nouveau et l'applique à tous les enfants. */
async function familyCode(admin: SupabaseClient, parentId: string, renew = false): Promise<string | null> {
  const { data: p } = await admin.from("profiles").select("family_code").eq("id", parentId).single();
  if (p?.family_code && !renew) return p.family_code;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newPassword();
    const { error } = await admin.from("profiles").update({ family_code: code }).eq("id", parentId);
    if (error) continue; // code déjà pris : on en tire un autre
    const { data: kids } = await admin.from("profiles").select("id").eq("parent_id", parentId);
    for (const k of kids ?? []) await admin.auth.admin.updateUserById(k.id, { password: code });
    return code;
  }
  return null;
}

interface Kid { name?: unknown; level?: unknown; serie?: unknown }
interface Body { action?: string; children?: Kid[]; childId?: string }

type Admin = ReturnType<typeof createClient>;
interface Created { id: string; name: string; login: string; password: string }

/** Crée les comptes enfants d'un parent, tous avec le code famille comme mot de passe ; renvoie null si Supabase échoue pour une raison autre qu'un identifiant déjà pris. */
async function createKids(admin: Admin, parent: { id: string; country: string }, kids: Kid[], password: string): Promise<Created[] | null> {
  const created: Created[] = [];
  for (const k of kids) {
    const name = String(k.name).trim().slice(0, 80);
    const level = /^[a-z0-9]{1,5}$/.test(String(k.level)) ? String(k.level) : "3e";
    const serie = typeof k.serie === "string" ? k.serie.slice(0, 4) : "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const login = newLogin(name);
      const { data, error } = await admin.auth.admin.createUser({
        email: `${login}@${CHILD_DOMAIN}`, password, email_confirm: true,
        app_metadata: { parent_id: parent.id, login },
        user_metadata: { role: "student", name, country: parent.country, level, serie },
      });
      if (!error && data.user) { created.push({ id: data.user.id, name, login, password }); break; }
      if (!/already|registered|exists/i.test(error?.message ?? "")) return created.length ? created : null;
    }
  }
  return created;
}

export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).json({ error: "Serveur non configuré (SUPABASE_SERVICE_ROLE_KEY manquante)." });

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
    const code = await familyCode(admin, parent.id);
    const created = code ? await createKids(admin, parent, kids, code) : null;
    if (!code || !created?.length) return res.status(500).json({ error: "Création impossible." });
    await admin.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, pending_children: [] } });
    return res.status(200).json({ created, code });
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

  if (body.action === "family" || body.action === "reset-family") {
    const code = await familyCode(admin, parent.id, body.action === "reset-family");
    return code ? res.status(200).json({ code }) : res.status(500).json({ error: "Code famille indisponible. Réessaie." });
  }

  if (body.action === "create") {
    const code = await familyCode(admin, parent.id);
    if (!code) return res.status(500).json({ error: "Code famille indisponible. Réessaie." });
    const kids = (body.children ?? []).filter((k) => typeof k.name === "string" && k.name.trim());
    if (!kids.length) return res.status(400).json({ error: "Aucun enfant à créer." });
    const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("parent_id", parent.id);
    if ((count ?? 0) + kids.length > MAX_CHILDREN) return res.status(400).json({ error: `Maximum ${MAX_CHILDREN} enfants par compte.` });
    const created = await createKids(admin, parent, kids, code);
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

  return res.status(400).json({ error: "Action inconnue." });
}
