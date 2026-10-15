// Test réel DANS UN NAVIGATEUR (Chrome) contre le site en ligne : npm run e2e:browser [adresse]
// Fait ce que fait un parent puis un enfant : se connecter, créer un accès, lire l'identifiant et le mot de passe affichés,
// se déconnecter, se connecter en « Élève » avec ces valeurs, supprimer l'accès. Capture d'écran à chaque étape dans scripts/.e2e-shots/.
// Prérequis : Chrome installé, puppeteer-core (npm i --no-save puppeteer-core), .env avec les clés Supabase. Efface ses comptes de test.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer-core";

const env = Object.fromEntries(readFileSync(new URL("../.env", import.meta.url), "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trim().startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }));
const site = (process.argv[2] ?? "https://decli-math.vercel.app").replace(/\/$/, "");
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
if (!chrome) { console.error("ECHEC aucun Chrome/Edge trouvé"); process.exit(1); }

const shots = new URL("./.e2e-shots/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m, extra = "") => { console.log((c ? "OK   " : "ECHEC ") + m + (c || !extra ? "" : " — " + extra)); if (!c) fails++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const stamp = Date.now(), email = `e2e-declick-ui-${stamp}@example.com`, pwd = `Test${stamp}x9`;
let parentId, browser;
try {
  const { data: pu, error } = await admin.auth.admin.createUser({ email, password: pwd, email_confirm: true, user_metadata: { role: "parent", name: "Parent UI E2E", country: "CI" } });
  if (error) throw new Error("parent de test : " + error.message);
  parentId = pu.user.id;

  browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--no-sandbox", "--window-size=1280,900"], defaultViewport: { width: 1280, height: 900 } });
  const page = await browser.newPage();
  page.on("dialog", (d) => d.accept()); // confirmations « Supprimer ? »
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const shot = (n) => page.screenshot({ path: `${shots}${n}.png` });
  const text = () => page.evaluate(() => document.body.innerText);
  const waitText = async (re, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (re.test(await text())) return true; await sleep(300); } return false; };
  const typeInto = async (sel, v) => { await page.waitForSelector(sel, { visible: true }); await page.click(sel, { clickCount: 3 }); await page.type(sel, v); };
  const clickText = async (tag, re) => { const h = await page.evaluateHandle((t, src) => [...document.querySelectorAll(t)].find((e) => new RegExp(src, "i").test(e.innerText)), tag, re.source); const el = h.asElement(); if (!el) throw new Error(`bouton introuvable : ${re}`); await el.click(); };

  // 1. le parent se connecte sur l'écran de connexion
  await page.goto(`${site}/commencer?c=login`, { waitUntil: "networkidle2", timeout: 60000 });
  await typeInto('input[name="email"]', email);
  await typeInto('input[name="password"]', pwd);
  await shot("1-connexion-parent");
  await clickText("button", /^\s*Se connecter/);
  ok(await waitText(/Accès de connexion de mes enfants/), "le parent se connecte et voit « Accès de connexion de mes enfants »");
  await shot("2-espace-parent");

  // 2. il ajoute un enfant (formulaire « Ajouter un enfant »)
  await typeInto('input[aria-label="Prénom"]', "Bola");
  await clickText("button", /Créer l'accès/);
  ok(await waitText(/Enfants enregistrés \(1\)/), "l'enfant apparaît dans « Enfants enregistrés (1) »");
  await shot("3-enfant-cree");
  const body = await text();
  const login = body.match(/Identifiant\s*:\s*([a-z0-9]+\.\d{4})/)?.[1];
  const password = body.match(/Mot de passe\s*:\s*([A-Za-z0-9]{8})\b/)?.[1];
  ok(!!login, "l'identifiant de l'enfant est affiché", login ?? "introuvable");
  ok(!!password, "le mot de passe de l'enfant est affiché", password ? "" : "introuvable (texte : « non affiché sur cet appareil » ?)");
  ok(!/Code famille/i.test(body), "plus aucune trace du code famille");

  // 3. déconnexion, puis l'enfant se connecte avec SES identifiants (onglet « Élève »)
  await clickText("button", /Déconnexion/);
  await page.goto(`${site}/commencer?c=login&r=student`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot("4-connexion-eleve");
  const formText = await text();
  ok(/Identifiant/.test(formText) && !/Code famille/i.test(formText), "l'onglet Élève demande un identifiant et un mot de passe (pas de code famille)");
  await typeInto('input[name="email"]', login ?? "");
  await typeInto('input[name="password"]', password ?? "");
  await clickText("button", /^\s*Se connecter/);
  await sleep(4000);
  const after = await text();
  await shot("5-apres-connexion-eleve");
  ok(!/incorrect/i.test(after) && !/Content de te revoir/.test(after), "l'enfant est connecté (plus sur l'écran de connexion)", after.slice(0, 140).replace(/\s+/g, " "));

  // 4. mauvais mot de passe : message clair
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await page.goto(`${site}/commencer?c=login&r=student`, { waitUntil: "networkidle2", timeout: 60000 });
  if (/Déconnexion/.test(await text())) { await clickText("button", /Déconnexion/); await page.goto(`${site}/commencer?c=login&r=student`, { waitUntil: "networkidle2" }); }
  await typeInto('input[name="email"]', login ?? "x");
  await typeInto('input[name="password"]', "mauvaisMDP1");
  await clickText("button", /^\s*Se connecter/);
  ok(await waitText(/incorrect/i, 10000), "un mauvais mot de passe affiche un message d'erreur clair");
  await shot("6-mauvais-mot-de-passe");

  ok(errors.length === 0, "aucune erreur JavaScript dans la page", errors.slice(0, 2).join(" | "));
} catch (e) {
  const cause = e?.cause ? ` (${e.cause.code ?? e.cause.message})` : "";
  ok(false, "le test s'est arrêté", e.message + cause);
} finally {
  await browser?.close().catch(() => {});
  try {
    const { data: kids } = parentId ? await admin.from("profiles").select("id").eq("parent_id", parentId) : { data: [] };
    for (const k of kids ?? []) await admin.auth.admin.deleteUser(k.id);
    if (parentId) await admin.auth.admin.deleteUser(parentId);
    const { data: left } = parentId ? await admin.from("profiles").select("id").or(`id.eq.${parentId},parent_id.eq.${parentId}`) : { data: [] };
    ok((left ?? []).length === 0, "nettoyage : parent et enfants de test effacés");
  } catch (e) { ok(false, "nettoyage impossible", e.message); }
}
console.log(fails ? `\n${fails} échec(s) — captures d'écran dans scripts/.e2e-shots/` : "\nTout est en ordre : le parcours fonctionne dans un vrai navigateur");
process.exit(fails ? 1 : 0);
