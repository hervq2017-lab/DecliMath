// Fonction serveur « Scanner un exercice » : transcrit une image d'exercice via le fournisseur OCR configuré.
// L'image n'est ni stockée ni journalisée. Aucune clé ne quitte le serveur.
import { IllegibleError, OcrResult, pickProvider, UpstreamError, validateImage } from "./_ocr";

interface Req { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }
interface Res { status(code: number): Res; json(body: unknown): void; setHeader(k: string, v: string): void }

const hits = new Map<string, number[]>();
/** 12 numérisations par minute et par adresse (au mieux, par instance). Une vraie protection exige une authentification. */
export function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 12;
}

export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "méthode non autorisée" });
  const provider = pickProvider();
  if (!provider) return res.status(503).json({ error: "ocr_non_configure" });
  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0].trim() || req.socket?.remoteAddress || "?";
  if (rateLimited(ip)) return res.status(429).json({ error: "trop_de_demandes" });
  const b = (req.body ?? {}) as { image?: unknown; subject?: unknown };
  const bad = validateImage(b.image);
  if (bad) return res.status(400).json({ error: bad });
  try {
    const out: OcrResult = await provider.recognize(b.image as string, { subject: typeof b.subject === "string" ? b.subject : undefined });
    return res.status(200).json(out);
  } catch (e) {
    if (e instanceof IllegibleError) return res.status(422).json({ error: "illisible" });
    if (e instanceof UpstreamError) return res.status(502).json({ error: "service_indisponible" });
    return res.status(502).json({ error: "service_indisponible" });
  }
}
