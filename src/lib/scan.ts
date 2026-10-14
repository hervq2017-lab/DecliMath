// Numérisation d'exercices : import (image, PDF), rotation, recadrage, amélioration de la lisibilité, export compressé.
// Tout se passe dans le navigateur de l'élève : l'image n'est envoyée au serveur qu'après sa validation explicite.

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // photo de téléphone brute ou PDF
export const MAX_SIDE = 2000; // côté maximal de travail
export const MAX_EXPORT_CHARS = 3_500_000; // reste sous la limite du serveur (4 000 000)
export const ACCEPTED = "image/jpeg,image/png,image/webp,application/pdf";

/** Message d'erreur en français si le fichier ne peut pas être traité, sinon null. */
export function validateFile(f: { type: string; size: number; name?: string }): string | null {
  const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name ?? "");
  const isImg = /^image\/(jpeg|png|webp)$/.test(f.type);
  if (!isPdf && !isImg) {
    if (/heic|heif/i.test(f.type) || /\.hei[cf]$/i.test(f.name ?? "")) return "Ce format de photo (HEIC) n'est pas lisible ici. Prends la photo directement avec le bouton « Prendre une photo », ou convertis-la en JPEG.";
    return "Format non accepté. Choisis une photo (JPEG, PNG, WebP) ou un PDF.";
  }
  if (f.size === 0) return "Ce fichier est vide.";
  if (f.size > MAX_FILE_BYTES) return "Ce fichier est trop lourd (20 Mo maximum). Réduis la qualité de la photo ou recadre-la avant de l'importer.";
  return null;
}
export const isPdf = (f: { type: string; name?: string }) => f.type === "application/pdf" || /\.pdf$/i.test(f.name ?? "");

// ---------- Réglages ----------
export type Enhance = "original" | "document" | "nb";
export const ENHANCE_LABEL: Record<Enhance, string> = { original: "Original", document: "Document", nb: "Noir et blanc" };
export interface CropRect { x: number; y: number; w: number; h: number } // fractions 0..1 de l'image tournée
export interface Edit { rotation: 0 | 90 | 180 | 270; crop: CropRect; enhance: Enhance }
export const FULL: CropRect = { x: 0, y: 0, w: 1, h: 1 };
export const DEFAULT_EDIT: Edit = { rotation: 0, crop: FULL, enhance: "document" };
export const MIN_CROP = 0.08;

/** Garde le cadre dans l'image et lui impose une taille minimale. */
export function clampCrop(c: CropRect): CropRect {
  const w = Math.min(1, Math.max(MIN_CROP, c.w)), h = Math.min(1, Math.max(MIN_CROP, c.h));
  return { x: Math.min(1 - w, Math.max(0, c.x)), y: Math.min(1 - h, Math.max(0, c.y)), w, h };
}
export const rotateBy = (r: Edit["rotation"], delta: 90 | -90): Edit["rotation"] => (((r + delta) % 360) + 360) % 360 as Edit["rotation"];

// ---------- Traitement d'image (fonctions pures sur des pixels RGBA) ----------
export interface Pixels { data: Uint8ClampedArray; width: number; height: number }

export function toGray(p: Pixels): Uint8ClampedArray {
  const g = new Uint8ClampedArray(p.width * p.height);
  for (let i = 0, j = 0; i < g.length; i++, j += 4) g[i] = (p.data[j] * 299 + p.data[j + 1] * 587 + p.data[j + 2] * 114) / 1000;
  return g;
}

function writeGray(p: Pixels, g: Uint8ClampedArray) {
  for (let i = 0, j = 0; i < g.length; i++, j += 4) { p.data[j] = p.data[j + 1] = p.data[j + 2] = g[i]; p.data[j + 3] = 255; }
}

/** « Document » : niveaux de gris, étirement du contraste entre les centiles 2 % et 98 %, fond éclairci. */
export function enhanceDocument(p: Pixels) {
  const g = toGray(p);
  const hist = new Array<number>(256).fill(0);
  for (const v of g) hist[v]++;
  const total = g.length;
  let lo = 0, hi = 255, acc = 0;
  for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= total * 0.02) { lo = i; break; } }
  acc = 0;
  for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= total * 0.02) { hi = i; break; } }
  if (hi - lo < 16) { lo = Math.max(0, lo - 8); hi = Math.min(255, lo + 32); }
  const scale = 255 / (hi - lo);
  for (let i = 0; i < g.length; i++) {
    const v = Math.min(255, Math.max(0, (g[i] - lo) * scale));
    g[i] = 255 * Math.pow(v / 255, 1.4); // le fond gris devient blanc, l'encre reste sombre
  }
  writeGray(p, g);
}

/** « Noir et blanc » : seuillage adaptatif (méthode de Bradley, image intégrale) : robuste aux ombres d'une photo prise à la main. */
export function enhanceBlackWhite(p: Pixels, sensitivity = 0.15) {
  const { width: w, height: h } = p;
  const g = toGray(p);
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) { row += g[y * w + x]; integral[(y + 1) * (w + 1) + x + 1] = integral[y * (w + 1) + x + 1] + row; }
  }
  const half = Math.max(4, Math.floor(Math.min(w, h) / 16));
  const out = new Uint8ClampedArray(g.length);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - half), y1 = Math.min(h - 1, y + half);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - half), x1 = Math.min(w - 1, x + half);
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);
      const sum = integral[(y1 + 1) * (w + 1) + x1 + 1] - integral[y0 * (w + 1) + x1 + 1] - integral[(y1 + 1) * (w + 1) + x0] + integral[y0 * (w + 1) + x0];
      out[y * w + x] = g[y * w + x] * area < sum * (1 - sensitivity) ? 0 : 255;
    }
  }
  writeGray(p, out);
}

export function applyEnhance(p: Pixels, mode: Enhance) {
  if (mode === "document") enhanceDocument(p);
  else if (mode === "nb") enhanceBlackWhite(p);
}

// ---------- Canevas ----------
function newCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}

/** Image source (photo ou page de PDF) mise à l'échelle de travail. */
export async function loadImageFile(file: Blob): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file); // respecte l'orientation EXIF des photos de téléphone
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const c = newCanvas(bmp.width * k, bmp.height * k);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c;
}

export interface PdfDoc { pages: number; render(page: number): Promise<HTMLCanvasElement> }

/** Ouvre un PDF (pdf.js chargé à la demande : il n'alourdit pas le reste de l'application). */
export async function openPdf(file: Blob): Promise<PdfDoc> {
  const pdfjs = await import("pdfjs-dist");
  const worker = (await import("pdfjs-dist/build/pdf.worker.min.js?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  return {
    pages: doc.numPages,
    async render(n) {
      const page = await doc.getPage(Math.min(Math.max(1, n), doc.numPages));
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: MAX_SIDE / Math.max(base.width, base.height) });
      const c = newCanvas(viewport.width, viewport.height);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      return c;
    },
  };
}

/** Applique rotation puis amélioration à toute l'image (aperçu avec cadre de recadrage). */
export function renderRotated(src: HTMLCanvasElement, rotation: Edit["rotation"], enhance: Enhance, maxSide = MAX_SIDE): HTMLCanvasElement {
  const swap = rotation === 90 || rotation === 270;
  const sw = swap ? src.height : src.width, sh = swap ? src.width : src.height;
  const k = Math.min(1, maxSide / Math.max(sw, sh));
  const c = newCanvas(sw * k, sh * k);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(src, (-src.width * k) / 2, (-src.height * k) / 2, src.width * k, src.height * k);
  if (enhance !== "original") {
    const img = ctx.getImageData(0, 0, c.width, c.height);
    applyEnhance(img, enhance);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(img, 0, 0);
  }
  return c;
}

/** Image finale : recadrage de l'image déjà tournée et améliorée. */
export function cropCanvas(rotated: HTMLCanvasElement, crop: CropRect): HTMLCanvasElement {
  const c = clampCrop(crop);
  const out = newCanvas(rotated.width * c.w, rotated.height * c.h);
  out.getContext("2d")!.drawImage(rotated, rotated.width * c.x, rotated.height * c.y, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

/** Exporte en JPEG en réduisant la qualité puis la taille jusqu'à passer sous la limite d'envoi. */
export function exportJpeg(c: HTMLCanvasElement): string {
  let canvas = c, q = 0.85, url = canvas.toDataURL("image/jpeg", q);
  for (let i = 0; url.length > MAX_EXPORT_CHARS && i < 8; i++) {
    if (q > 0.5) q -= 0.1;
    else { const s = newCanvas(canvas.width * 0.8, canvas.height * 0.8); s.getContext("2d")!.drawImage(canvas, 0, 0, s.width, s.height); canvas = s; }
    url = canvas.toDataURL("image/jpeg", q);
  }
  return url;
}

// ---------- Affichage lisible du texte reconnu ----------
const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "n": "ⁿ", "+": "⁺", "-": "⁻" };
const SYMBOLS: [RegExp, string][] = [
  [/\\leq?\b|\\leqslant/g, "≤"], [/\\geq?\b|\\geqslant/g, "≥"], [/\\neq\b/g, "≠"], [/\\times\b/g, "×"], [/\\cdot\b/g, "·"], [/\\div\b/g, "÷"], [/\\pm\b/g, "±"],
  [/\\infty\b/g, "∞"], [/\\in\b/g, "∈"], [/\\pi\b/g, "π"], [/\\alpha\b/g, "α"], [/\\beta\b/g, "β"], [/\\theta\b/g, "θ"], [/\\Delta\b/g, "Δ"], [/\\delta\b/g, "δ"],
  [/\\lambda\b/g, "λ"], [/\\mu\b/g, "μ"], [/\\omega\b/g, "ω"], [/\\Omega\b/g, "Ω"], [/\\rightarrow\b|\\to\b/g, "→"], [/\\Rightarrow\b/g, "⇒"], [/\\approx\b/g, "≈"],
  [/\\sum\b/g, "∑"], [/\\int\b/g, "∫"], [/\\mathbb\{R\}/g, "ℝ"], [/\\mathbb\{N\}/g, "ℕ"], [/\\mathbb\{Z\}/g, "ℤ"], [/\\mathbb\{Q\}/g, "ℚ"], [/\\mathbb\{C\}/g, "ℂ"],
  [/\\ln\b/g, "ln"], [/\\exp\b/g, "exp"], [/\\lim\b/g, "lim"], [/\\left|\\right/g, ""], [/\\,|\\;|\\!/g, " "],
];
/** Transforme les formules LaTeX simples en caractères lisibles (½ → (1)/(2), x^{2} → x², \sqrt{x} → √(x)). Le texte brut reste modifiable. */
export function prettyMath(text: string): string {
  let t = text.replace(/\$\$?/g, "");
  for (let i = 0; i < 3; i++) t = t.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, a: string, b: string) => `(${a})/(${b})`).replace(/\\sqrt\{([^{}]*)\}/g, "√($1)");
  t = t.replace(/\\sqrt\s*(\d+|[a-zA-Z])/g, "√$1"); // racine sans accolades : \sqrt50
  for (const [re, s] of SYMBOLS) t = t.replace(re, s);
  t = t.replace(/\^\{([0-9n+-]+)\}|\^([0-9n])/g, (_, a: string | undefined, b: string | undefined) => [...(a ?? b ?? "")].map((ch) => SUP[ch] ?? ch).join(""));
  t = t.replace(/_\{([^{}]*)\}/g, "_$1");
  return t.replace(/\\\\/g, "\n");
}
