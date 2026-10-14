// Client de la reconnaissance de texte (serveur : api/ocr.ts). N'est appelé qu'après validation explicite de l'élève.
export interface OcrOk { kind: "ok"; text: string; uncertain: string[]; provider: string }
export type OcrFail = { kind: "unconfigured" | "illegible" | "busy" | "invalid" | "unavailable" | "cancelled"; message: string };
export type OcrOutcome = OcrOk | OcrFail;

const MSG: Record<OcrFail["kind"], string> = {
  unconfigured: "La lecture automatique n'est pas activée sur cette version. Tu peux recopier l'énoncé à la main dans la zone de texte.",
  illegible: "Je n'arrive pas à lire cet exercice. Reprends la photo : bien à plat, bien éclairée, sans reflet, avec le texte net.",
  busy: "Tu as envoyé beaucoup de documents. Attends une minute avant de recommencer.",
  invalid: "Cette image n'a pas pu être envoyée (format ou taille). Reprends la photo ou recadre-la davantage.",
  unavailable: "Le service de lecture est momentanément indisponible. Réessaie dans un instant, ou recopie l'énoncé à la main.",
  cancelled: "Lecture annulée.",
};

export async function recognize(image: string, subject: string | undefined, signal?: AbortSignal): Promise<OcrOutcome> {
  let r: Response;
  try {
    r = await fetch("/api/ocr", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image, subject }), signal });
  } catch (e) {
    return (e as Error).name === "AbortError" ? { kind: "cancelled", message: MSG.cancelled } : { kind: "unavailable", message: MSG.unavailable };
  }
  if (r.status === 429) return { kind: "busy", message: MSG.busy };
  if (r.status === 400) return { kind: "invalid", message: MSG.invalid };
  if (r.status === 422) return { kind: "illegible", message: MSG.illegible };
  let j: { text?: string; uncertain?: string[]; provider?: string; error?: string } = {};
  try { j = await r.json(); } catch { /* en développement sans serveur, /api renvoie une page HTML */ }
  if (r.status === 503 && j.error === "ocr_non_configure") return { kind: "unconfigured", message: MSG.unconfigured };
  if (r.ok && typeof j.text === "string" && j.text.trim()) return { kind: "ok", text: j.text, uncertain: Array.isArray(j.uncertain) ? j.uncertain : [], provider: j.provider ?? "?" };
  return { kind: "unavailable", message: MSG.unavailable };
}
