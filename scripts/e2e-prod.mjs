// Test réel de bout en bout contre le site en ligne et la vraie base Supabase : npm run e2e:prod [adresse]
// Crée un parent de test (déjà confirmé, aucun e-mail envoyé), lui fait créer des enfants par l'API en ligne, connecte chaque enfant
// avec SES identifiants, change un mot de passe, supprime un enfant, puis EFFACE tout ce qui a été créé (même en cas d'échec).
// Utilise .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY). Aucune clé n'est affichée.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(readFileSync(new URL("../.env", import.meta.url), "utf8").replace(/^﻿/, "").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trim().startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }));
const URL_ = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_ANON_KEY, SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const site = (process.argv[2] ?? "https://decli-math.vercel.app").replace(/\/$/, "");
if (!URL_ || !ANON || !SERVICE) { console.error("ECHEC .env incomplet (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)"); process.exit(1); }

let fails = 0;
const ok = (c, m, extra = "") => { console.log((c ? "OK   " : "ECHEC ") + m + (c || !extra ? "" : " — " + extra)); if (!c) fails++; };
const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(URL_, SERVICE, noSession);
const CHILD_DOMAIN = "eleves.declickmath.invalid";
const api = async (body, token) => {
  const r = await fetch(`${site}/api/children`, { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
  return { status: r.status, json: await r.json().catch(() => ({})) };
};
const loginAs = async (identifier, password) => {
  const c = createClient(URL_, ANON, noSession);
  const email = identifier.includes("@") ? identifier : `${identifier}@${CHILD_DOMAIN}`;
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  return { client: c, session: data?.session ?? null, error };
};

const stamp = Date.now();
const parentEmail = `e2e-declick-${stamp}@example.com`, parentPwd = `Test${stamp}x9`;
const created = []; // ids à effacer
try {
  // 0. réglages publics de l'authentification
  const settings = await (await fetch(`${URL_}/auth/v1/settings`, { headers: { apikey: ANON } })).json().catch(() => ({}));
  console.log(`INFO confirmation d'e-mail à l'inscription : ${settings.mailer_autoconfirm ? "désactivée" : "ACTIVÉE (le parent doit cliquer le lien reçu)"}`);

  // 1. parent de test, comme créé par l'inscription (profil rempli par le déclencheur handle_new_user)
  const { data: pu, error: pe } = await admin.auth.admin.createUser({ email: parentEmail, password: parentPwd, email_confirm: true, user_metadata: { role: "parent", name: "Parent Test E2E", country: "CI" } });
  ok(!pe && pu?.user, "parent de test créé", pe?.message);
  if (!pu?.user) throw new Error("parent non créé");
  created.push(pu.user.id);
  const { data: prof } = await admin.from("profiles").select("id, role, name").eq("id", pu.user.id).single();
  ok(prof?.role === "parent", "profil parent créé par la base (déclencheur)", JSON.stringify(prof));

  // 2. connexion du parent, comme sur l'écran « Parent »
  const p = await loginAs(parentEmail, parentPwd);
  ok(!!p.session, "le parent se connecte avec e-mail + mot de passe", p.error?.message);
  const token = p.session?.access_token;

  // 3. le parent crée des accès pour ses enfants (appel du site en ligne, comme le bouton « Créer l'accès »)
  const made = await api({ action: "create", children: [{ name: "Bola", level: "3e" }, { name: "Sosthène", level: "4e" }] }, token);
  const kids = made.json.created ?? [];
  ok(made.status === 200 && kids.length === 2, "le parent crée 2 accès enfants via /api/children", `${made.status} ${JSON.stringify(made.json)}`);
  kids.forEach((k) => created.push(k.id));
  ok(kids.every((k) => /^[a-z0-9]+\.\d{4}$/.test(k.login) && k.password?.length === 8), "chaque enfant reçoit un identifiant et un mot de passe à lui");
  ok(new Set(kids.map((k) => k.password)).size === kids.length, "mots de passe différents d'un enfant à l'autre");

  // 4. chaque enfant se connecte avec SES identifiants sur l'écran « Élève »
  for (const k of kids) {
    const c = await loginAs(k.login, k.password);
    ok(!!c.session, `${k.name} se connecte avec « ${k.login} » et son mot de passe`, c.error?.message);
    if (c.session) {
      const { data: me, error: me_e } = await c.client.from("profiles").select("name, role, parent_id, level").eq("id", c.session.user.id).single();
      ok(me?.role === "student" && me?.parent_id === pu.user.id, `${k.name} : profil élève rattaché au parent`, me_e?.message);
      const { data: others } = await c.client.from("profiles").select("id").neq("id", c.session.user.id);
      ok(!(others ?? []).some((o) => o.id === pu.user.id), `${k.name} ne voit pas le profil du parent`);
    }
  }
  const bad = await loginAs(kids[0].login, "mauvaisMDP1");
  ok(!bad.session, "un mauvais mot de passe est refusé");
  const short = await loginAs(kids[0].login.split(".")[0], kids[0].password);
  ok(!short.session, "le prénom seul (sans le numéro) ne suffit pas");

  // 5. le parent lit ses enfants et gère leurs accès
  const { data: mine } = await p.client.from("profiles").select("id, name, login").eq("parent_id", pu.user.id);
  ok((mine ?? []).length === 2 && (mine ?? []).every((m) => kids.some((k) => k.id === m.id && k.login === m.login)), "le parent voit ses 2 enfants (et leurs identifiants) depuis son espace");

  const [k0, k1] = kids;
  const rp = await api({ action: "reset-password", childId: k0.id }, token);
  ok(rp.status === 200 && rp.json.password && rp.json.password !== k0.password, "nouveau mot de passe généré pour un enfant", JSON.stringify(rp.json));
  ok(!(await loginAs(k0.login, k0.password)).session, "l'ancien mot de passe ne marche plus");
  ok(!!(await loginAs(k0.login, rp.json.password)).session, "le nouveau mot de passe marche");
  ok(!!(await loginAs(k1.login, k1.password)).session, "l'autre enfant n'est pas touché");

  const rl = await api({ action: "reset-login", childId: k0.id }, token);
  ok(rl.status === 200 && rl.json.login && rl.json.login !== k0.login, "nouvel identifiant généré", JSON.stringify(rl.json));
  ok(!!(await loginAs(rl.json.login, rp.json.password)).session && !(await loginAs(k0.login, rp.json.password)).session, "le nouvel identifiant marche, l'ancien est refusé");

  // 6. sécurité : un autre parent ne peut pas toucher aux enfants
  const { data: ou } = await admin.auth.admin.createUser({ email: `e2e-declick-b-${stamp}@example.com`, password: parentPwd, email_confirm: true, user_metadata: { role: "parent", name: "Autre Parent E2E", country: "CI" } });
  if (ou?.user) created.push(ou.user.id);
  const o = await loginAs(`e2e-declick-b-${stamp}@example.com`, parentPwd);
  ok((await api({ action: "delete", childId: k1.id }, o.session?.access_token)).status === 404, "un autre parent ne peut pas supprimer l'enfant");
  ok((await api({ action: "reset-password", childId: k1.id }, o.session?.access_token)).status === 404, "un autre parent ne peut pas changer son mot de passe");
  ok((await api({ action: "create", children: [{ name: "X", level: "3e" }] }, undefined)).status === 401, "sans connexion : refusé");
  ok((await api({ action: "create", children: [{ name: "X", level: "3e" }] }, (await loginAs(k1.login, k1.password)).session?.access_token)).status === 403, "un élève ne peut pas créer d'accès");

  // 7. suppression d'un enfant par le parent
  const del = await api({ action: "delete", childId: k1.id }, token);
  ok(del.status === 200, "le parent supprime l'accès d'un enfant", JSON.stringify(del.json));
  ok(!(await loginAs(k1.login, k1.password)).session, "l'enfant supprimé ne peut plus se connecter");
  const { data: left } = await admin.from("profiles").select("id").eq("id", k1.id);
  ok((left ?? []).length === 0, "son profil a disparu de la base");

  // 8. inscription : enfants saisis à l'inscription (appel « provision », sans connexion, comme juste après l'inscription)
  const { data: su } = await admin.auth.admin.createUser({ email: `e2e-declick-c-${stamp}@example.com`, password: parentPwd, email_confirm: false, user_metadata: { role: "parent", name: "Parent Inscription E2E", country: "CI", pending_children: [{ name: "Awa", level: "6e" }, { name: "Koffi", level: "tle", serie: "C" }] } });
  if (su?.user) created.push(su.user.id);
  const prov = await api({ action: "provision", userId: su?.user?.id });
  const pk = prov.json.created ?? [];
  pk.forEach((k) => created.push(k.id));
  ok(prov.status === 200 && pk.length === 2, "inscription : les enfants saisis reçoivent leurs accès tout de suite (sans attendre la confirmation du parent)", `${prov.status} ${JSON.stringify(prov.json)}`);
  for (const k of pk) ok(!!(await loginAs(k.login, k.password)).session, `inscription : ${k.name} se connecte avec « ${k.login} »`);
  ok((await api({ action: "provision", userId: su?.user?.id })).status === 403, "inscription : l'opération ne peut pas être rejouée");
} catch (e) {
  const cause = e?.cause ? ` (${e.cause.code ?? e.cause.message ?? e.cause})` : "";
  ok(false, "le test s'est arrêté", `${e.message}${cause} — vérifiez votre connexion Internet, puis relancez`);
} finally {
  // nettoyage : tout ce que le test a créé est effacé (les profils et la progression partent en cascade).
  // Un compte déjà supprimé par le test lui-même compte comme effacé ; on balaie aussi les restes d'un test interrompu.
  const gone = async (id) => { const { data } = await admin.auth.admin.getUserById(id); return !data?.user; };
  for (const id of created) if (!(await gone(id))) await admin.auth.admin.deleteUser(id);
  try {
    const { data: all } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    for (const u of all?.users ?? []) if (u.email?.startsWith("e2e-declick-")) await admin.auth.admin.deleteUser(u.id);
  } catch { /* balayage facultatif */ }
  const left = [];
  for (const id of created) if (!(await gone(id))) left.push(id);
  const { data: rest } = created.length ? await admin.from("profiles").select("id").in("id", created) : { data: [] };
  ok(left.length === 0 && (rest ?? []).length === 0, `nettoyage : les ${created.length} comptes de test sont effacés (aucune trace dans la base)`);
}
console.log(fails ? `\n${fails} échec(s)` : "\nTout est en ordre : le parcours parent → enfants fonctionne en ligne");
process.exit(fails ? 1 : 0);
