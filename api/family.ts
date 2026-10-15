// Fonction serveur (Vercel), sans connexion requise : à partir d'un code famille, renvoie les prénoms des enfants et leur identifiant.
// L'enfant choisit son prénom puis se connecte avec (identifiant, code famille). Le code a 54^8 combinaisons possibles.
// Variables : SUPABASE_SERVICE_ROLE_KEY (obligatoire), VITE_SUPABASE_URL (ou SUPABASE_URL).
import { createClient } from "@supabase/supabase-js";

interface Req { method?: string; body?: unknown }
interface Res { status(code: number): Res; json(body: unknown): void; setHeader(k: string, v: string): void }

export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).json({ error: "Serveur non configuré (SUPABASE_SERVICE_ROLE_KEY manquante)." });

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {}) as { code?: unknown };
  const code = String(body.code ?? "").trim();
  if (!/^[A-Za-z0-9]{8}$/.test(code)) return res.status(400).json({ error: "Code famille invalide." });

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: parent } = await admin.from("profiles").select("id, suspended").eq("family_code", code).eq("role", "parent").maybeSingle();
  if (!parent || parent.suspended) return res.status(404).json({ error: "Code famille inconnu." });
  const { data: kids } = await admin.from("profiles").select("name, login, level, serie").eq("parent_id", parent.id).eq("suspended", false).order("created_at");
  return res.status(200).json({ children: (kids ?? []).filter((k) => k.login) });
}
