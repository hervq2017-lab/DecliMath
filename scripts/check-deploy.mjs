// Vérifie le site en ligne depuis le terminal : npm run check:deploy [adresse]
// La fonction api/children répond 401 (« Connexion requise ») quand SUPABASE_SERVICE_ROLE_KEY est bien configurée sur Vercel,
// et 503 (« Serveur non configuré ») quand la variable manque en Production.
const base = (process.argv[2] ?? "https://decli-math.vercel.app").replace(/\/$/, "");
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK   " : "ECHEC ") + m); if (!c) fails++; };
const get = (p, init) => fetch(base + p, { signal: AbortSignal.timeout(90000), ...init });

try {
  const home = await get("/");
  const html = await home.text();
  ok(home.status === 200 && html.includes('id="root"'), `page d'accueil en ligne (${base})`);
  const js = html.match(/assets\/index-[^"]+\.js/)?.[0];
  const bundle = js ? await (await get("/" + js)).text() : "";
  ok(/[a-z0-9]{20}\.supabase\.co/.test(bundle), "l'application est reliée à VOTRE projet Supabase (VITE_SUPABASE_URL présente au build)");
  // Une vraie clé publique est un JWT complet (3 segments) ; sans la variable VITE_SUPABASE_ANON_KEY au build, le site reste en mode local.
  ok(/eyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/.test(bundle), "la clé publique (VITE_SUPABASE_ANON_KEY) est présente au build : sans elle le site reste en mode local");
  ok(!/Code famille/.test(bundle), "version à jour : plus de code famille");

  const spa = await get("/commencer?c=login");
  ok(spa.status === 200, "routage /commencer (rewrite vercel.json)");

  const api = await get("/api/children", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "create", children: [{ name: "Test", level: "3e" }] }) });
  const j = await api.json().catch(() => ({}));
  ok(api.status !== 503, `api/children : clés serveur configurées en Production${api.status === 503 ? " — " + j.error : ""}`);
  ok(api.status === 401, "api/children refuse un appel sans connexion (401)");
} catch (e) {
  ok(false, "site injoignable : " + e.message);
}
console.log(fails ? `\n${fails} échec(s)` : "\nTout est en ordre");
process.exit(fails ? 1 : 0);
