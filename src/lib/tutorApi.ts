// Client du tuteur conversationnel (serveur : api/tutor.ts) et garde-fou « jamais la réponse ».
import type { Answer } from "../content/core";

export interface ChatTurn { role: "user" | "assistant"; content: string }
export interface TutorContext { subject?: string; level?: string; notion?: string; statement?: string; properties?: string[] }
export type TutorResult =
  | { kind: "reply"; reply: string }
  | { kind: "unavailable" } // pas de serveur ou clé non configurée : on retombe sur le tuteur à règles
  | { kind: "error"; message: string };

const SAFE_FALLBACK = "Je ne vais pas te donner le résultat : c'est toi qui vas le trouver. Dis-moi ce que tu as écrit sur ton cahier, et on regarde ensemble l'étape où tu bloques.";

/** La réponse du tuteur contient-elle le résultat de l'exercice ? (le résultat n'est jamais envoyé au serveur : contrôle côté élève) */
export function leaksAnswer(reply: string, answer: Answer | undefined): boolean {
  if (!answer || answer.kind !== "number") return false;
  const text = reply.replace(/−/g, "-").replace(/(\d),(\d)/g, "$1.$2");
  const v = String(Math.round(answer.value * 1e6) / 1e6);
  const esc = v.replace(/[.\-]/g, (c) => "\\" + c);
  if (Math.abs(answer.value) >= 10 || !Number.isInteger(answer.value)) return new RegExp(`(^|[^\\d.])${esc}(?![\\d]|\\.\\d)`).test(text);
  // petit entier : seulement s'il est présenté comme un résultat (« = 4 », « la réponse est 4 »…)
  return new RegExp(`(=|est|vaut|donne|trouve|résultat|réponse)\\s*:?\\s*${esc}(?![\\d.])`, "i").test(text);
}

async function call(messages: ChatTurn[], image: string | undefined, context: TutorContext): Promise<TutorResult> {
  let r: Response;
  try {
    r = await fetch("/api/tutor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages, image, context }) });
  } catch {
    return { kind: "unavailable" };
  }
  if (r.status === 429) return { kind: "error", message: "Tu envoies beaucoup de messages : attends une minute, et en attendant, écris ta démarche sur ton cahier." };
  if (r.status === 400) return { kind: "error", message: "Je n'ai pas pu lire ton message ou ton image. Essaie avec une image plus petite ou un message plus court." };
  if (!r.ok) return { kind: "unavailable" };
  try {
    const j = (await r.json()) as { reply?: string };
    return j.reply ? { kind: "reply", reply: j.reply.replace(/\$/g, "") } : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" }; // en développement, /api renvoie une page HTML
  }
}

/** Interroge le tuteur ; si sa réponse révèle le résultat, on redemande une fois, puis on remplace par un message sûr. */
export async function askTutor(messages: ChatTurn[], image: string | undefined, context: TutorContext, answer?: Answer): Promise<TutorResult> {
  const first = await call(messages, image, context);
  if (first.kind !== "reply" || !leaksAnswer(first.reply, answer)) return first;
  const last = messages[messages.length - 1];
  const again = await call([...messages.slice(0, -1), { ...last, content: `${last.content}\n\n(Rappel : ne donne ni le résultat ni la solution. Reformule avec une propriété et une question.)` }], image, context);
  if (again.kind === "reply" && !leaksAnswer(again.reply, answer)) return again;
  return { kind: "reply", reply: SAFE_FALLBACK };
}

// ---------- Images : capture, appareil photo, collage ----------

const MAX_SIDE = 1280;

/** Réduit l'image (max 1280 px) et la compresse en JPEG : rapide à envoyer, même en connexion lente. */
export async function toJpegDataUrl(source: Blob | HTMLVideoElement): Promise<string> {
  const bmp = source instanceof Blob ? await createImageBitmap(source) : null;
  const w0 = bmp ? bmp.width : (source as HTMLVideoElement).videoWidth, h0 = bmp ? bmp.height : (source as HTMLVideoElement).videoHeight;
  const k = Math.min(1, MAX_SIDE / Math.max(w0, h0));
  const c = document.createElement("canvas");
  c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage((bmp ?? source) as CanvasImageSource, 0, 0, c.width, c.height);
  bmp?.close();
  return c.toDataURL("image/jpeg", 0.8);
}

export const canCaptureScreen = () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getDisplayMedia && !/Android|iPhone|iPad/i.test(navigator.userAgent);

/** Capture d'écran : l'élève choisit la fenêtre ou l'onglet qui contient l'exercice. */
export async function captureScreen(): Promise<string> {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  try {
    const v = document.createElement("video");
    v.srcObject = stream; v.muted = true;
    await v.play();
    await new Promise((r) => setTimeout(r, 250)); // laisse l'image se stabiliser
    return await toJpegDataUrl(v);
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

/** Image collée (Ctrl+V d'une capture d'écran). */
export const imageFromClipboard = (e: ClipboardEvent | React.ClipboardEvent) => {
  const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
  return item?.getAsFile() ?? null;
};
