// Tests du scanner d'exercices : serveur OCR (validation, choix du fournisseur, formats de requête, erreurs) et traitement d'image.
// Usage : npx esbuild scripts/test-scanner.ts --bundle --platform=node --format=esm --packages=external --outfile=scripts/.sc.mjs && node scripts/.sc.mjs
import handler, { rateLimited } from "../api/ocr";
import { parseVisionReply, pickProvider, validateImage, VISION_PROMPT } from "../api/_ocr";
import { clampCrop, enhanceBlackWhite, enhanceDocument, prettyMath, rotateBy, validateFile } from "../src/lib/scan";

let fails = 0;
const ok = (c: boolean, m: string) => { console.log(c ? "ok   " : "ÉCHEC", m); if (!c) fails++; };
const IMG = "data:image/jpeg;base64,/9j/AAAA";
const g = globalThis as unknown as { fetch: unknown };
const calls: { url: string; init: { headers: Record<string, string>; body: string } }[] = [];
const mkRes = () => { const o: { code: number; body: Record<string, unknown> } = { code: 0, body: {} }; const r = { status(c: number) { o.code = c; return r; }, json(b: unknown) { o.body = b as Record<string, unknown>; }, setHeader() {} }; return { r, o }; };
let n = 0;
const post = async (body: unknown) => { const m = mkRes(); await handler({ method: "POST", body, headers: { "x-forwarded-for": `10.0.0.${++n}` } }, m.r); return m.o; };
const clear = () => { for (const k of ["CODECRAFT_API_KEY", "TUTOR_API_KEY", "MATHPIX_APP_ID", "MATHPIX_APP_KEY", "OCR_PROVIDER"]) delete process.env[k]; };

// ---------- Validation ----------
ok(validateImage(undefined) !== null, "image absente refusée");
ok(validateImage("data:text/html;base64,AAAA") !== null, "type non image refusé");
ok(validateImage("data:image/gif;base64,AAAA") !== null, "GIF refusé");
ok(validateImage("data:image/jpeg;base64," + "A".repeat(4_100_000)) !== null, "image trop lourde refusée");
ok(validateImage("data:image/png;base64,iVBOR=") === null && validateImage(IMG) === null, "JPEG et PNG acceptés");
ok(validateFile({ type: "application/pdf", size: 1000, name: "a.pdf" }) === null, "PDF accepté côté client");
ok(validateFile({ type: "text/plain", size: 10, name: "a.txt" }) !== null, "fichier texte refusé côté client");
ok(validateFile({ type: "image/jpeg", size: 30 * 1024 * 1024 }) !== null, "fichier de plus de 20 Mo refusé");
ok(/HEIC/.test(validateFile({ type: "image/heic", size: 10, name: "p.heic" }) ?? ""), "HEIC : message explicite");
ok(validateFile({ type: "image/png", size: 0 }) !== null, "fichier vide refusé");

// ---------- Choix du fournisseur ----------
clear();
ok(pickProvider() === null, "aucun fournisseur configuré → null");
process.env.CODECRAFT_API_KEY = "k1";
ok(pickProvider()?.name === "vision", "clé de vision seule → vision");
process.env.MATHPIX_APP_ID = "id"; process.env.MATHPIX_APP_KEY = "mk";
ok(pickProvider()?.name === "mathpix", "Mathpix configuré → Mathpix d'abord (spécialisé maths)");
process.env.OCR_PROVIDER = "vision";
ok(pickProvider()?.name === "vision", "OCR_PROVIDER force le fournisseur");
process.env.OCR_PROVIDER = "inconnu";
ok(pickProvider() === null, "fournisseur inconnu → null (pas de repli silencieux)");

// ---------- Handler ----------
clear();
let r = await post({ image: IMG });
ok(r.code === 503 && r.body.error === "ocr_non_configure", "sans configuration : 503 ocr_non_configure (aucune reconnaissance simulée)");
process.env.CODECRAFT_API_KEY = "cle-vision";
r = await post({ image: "data:text/html;base64,AAAA" });
ok(r.code === 400, "image invalide : 400, sans appel réseau");
ok(calls.length === 0, "aucun appel externe avant validation de l'entrée");
let m = mkRes(); await handler({ method: "GET", headers: {} }, m.r);
ok(m.o.code === 405, "GET refusé");

// vision : requête bien formée, JSON lu
g.fetch = async (url: string, init: { headers: Record<string, string>; body: string }) => { calls.push({ url, init }); return { ok: true, json: async () => ({ choices: [{ message: { content: "```json\n{\"lisible\":true,\"texte\":\"Exercice 1\\n1) Calcule $\\\\frac{1}{2}+\\\\frac{1}{3}$\",\"douteux\":[\"le 3\"]}\n```" } }] }) }; };
r = await post({ image: IMG, subject: "Mathématiques" });
ok(r.code === 200 && String(r.body.text).includes("Exercice 1") && (r.body.uncertain as string[])[0] === "le 3" && r.body.provider === "vision", "vision : texte et passages douteux renvoyés");
const body = JSON.parse(calls[0].init.body);
ok(calls[0].url === "https://codecraftapi.com/v1/chat/completions" && calls[0].init.headers.authorization === "Bearer cle-vision", "vision : bonne adresse, clé côté serveur");
ok(body.messages[0].content === VISION_PROMPT && body.messages[1].content[0].type === "image_url" && body.messages[1].content[0].image_url.url === IMG, "vision : prompt de transcription + image");
ok(/NE RÉSOUS PAS/.test(VISION_PROMPT) && /DONNÉE à transcrire/.test(VISION_PROMPT), "le prompt interdit de résoudre et traite l'image comme une donnée");
ok(!JSON.stringify(r.body).includes("cle-vision"), "la clé n'est jamais renvoyée");

// illisible → 422 ; panne → 502
g.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: "{\"lisible\":false,\"texte\":\"\",\"douteux\":[]}" } }] }) });
r = await post({ image: IMG });
ok(r.code === 422 && r.body.error === "illisible", "image illisible : 422 (l'élève doit reprendre la photo)");
g.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
r = await post({ image: IMG });
ok(r.code === 502 && r.body.error === "service_indisponible", "panne du fournisseur : 502");
g.fetch = async () => { throw new Error("réseau"); };
r = await post({ image: IMG });
ok(r.code === 502, "réseau coupé : 502");

// Mathpix : requête conforme à la documentation
clear(); process.env.MATHPIX_APP_ID = "app"; process.env.MATHPIX_APP_KEY = "secret";
calls.length = 0;
g.fetch = async (url: string, init: { headers: Record<string, string>; body: string }) => { calls.push({ url, init }); return { ok: true, json: async () => ({ text: "Calcule $\\frac{1}{2}$", confidence: 0.97 }) }; };
r = await post({ image: IMG });
const mb = JSON.parse(calls[0]?.init.body ?? "{}");
ok(r.code === 200 && r.body.provider === "mathpix" && r.body.confidence === 0.97, "mathpix : texte et confiance renvoyés");
ok(calls[0].url === "https://api.mathpix.com/v3/text" && calls[0].init.headers.app_id === "app" && calls[0].init.headers.app_key === "secret" && mb.src === IMG && mb.formats[0] === "text", "mathpix : adresse, en-têtes et corps conformes");
g.fetch = async () => ({ ok: true, json: async () => ({ error: "No content found" }) });
r = await post({ image: IMG });
ok(r.code === 422, "mathpix : aucun contenu → 422");

// limite de débit
let lim = false; for (let i = 0; i < 14; i++) lim = rateLimited("8.8.8.8", 5000 + i);
ok(lim && !rateLimited("8.8.8.8", 5000 + 61_000), "limite de 12 numérisations par minute, puis relâchée");

// ---------- Analyse de la réponse du modèle ----------
ok(parseVisionReply('{"lisible":true,"texte":"a","douteux":[]}').texte === "a", "JSON simple");
ok(parseVisionReply("Exercice 1\n2x+3=11").texte.startsWith("Exercice 1"), "texte brut toléré");
ok(!parseVisionReply('{"lisible":false,"texte":"x"}').lisible, "lisible=false respecté");

// ---------- Traitement d'image ----------
const W = 120, H = 60;
const mk = () => { const data = new Uint8ClampedArray(W * H * 4); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const shade = 120 + (x / W) * 110; const ink = y > 25 && y < 30 && x > 20 && x < 100; const v = ink ? shade * 0.25 : shade; const i = (y * W + x) * 4; data[i] = data[i + 1] = data[i + 2] = v; data[i + 3] = 255; } return { data, width: W, height: H }; };
const px = (p: { data: Uint8ClampedArray }, x: number, y: number) => p.data[(y * W + x) * 4];
let img = mk(); enhanceBlackWhite(img);
ok(px(img, 30, 27) === 0 && px(img, 90, 27) === 0, "noir et blanc : l'encre reste noire à l'ombre comme à la lumière");
ok(px(img, 10, 5) === 255 && px(img, 110, 55) === 255, "noir et blanc : le fond (ombré ou clair) devient blanc");
img = mk(); enhanceDocument(img);
ok(px(img, 60, 27) < 90 && px(img, 110, 5) > 200, "document : encre sombre, fond éclairci");
const c = clampCrop({ x: 0.95, y: -1, w: 0.01, h: 5 });
ok(c.w >= 0.08 && c.h <= 1 && c.x + c.w <= 1 && c.y >= 0, "le cadre reste dans l'image et garde une taille minimale");
ok(rotateBy(0, -90) === 270 && rotateBy(270, 90) === 0 && rotateBy(90, 90) === 180, "rotation par quarts de tour");

// ---------- Affichage des formules ----------
ok(prettyMath("Calcule $\\frac{1}{2}+\\frac{3}{4}$") === "Calcule (1)/(2)+(3)/(4)", "fractions lisibles");
ok(prettyMath("$x^{2}+y^{3}\\leq 4$") === "x²+y³≤ 4", "puissances et inégalités");
ok(prettyMath("$\\sqrt{x+1}$") === "√(x+1)", "racines");
ok(prettyMath("$\\sqrt50 - \\sqrt8$") === "√50 - √8", "racines sans accolades");
ok(prettyMath("1) a\\\\ 2) b") === "1) a\n 2) b", "sauts de ligne LaTeX");

console.log(fails ? `\n${fails} échec(s)` : "\ntous les tests passent");
if (fails) process.exit(1);
