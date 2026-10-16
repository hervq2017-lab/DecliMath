// Test de la fonction serveur api/children.ts (accès des enfants) contre un FAUX serveur Supabase local : rien ne touche la production.
// Le faux serveur imite juste ce qu'utilise la fonction : session (/auth/v1/user), lecture/écriture de profiles, comptes (admin/users).
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

type U = { id: string; email: string; password: string; app_metadata: any; user_metadata: any; created_at: string };
type P = Record<string, any>;
const users = new Map<string, U>();
let profiles: P[] = [];
const solutionModes: P[] = [];
let seq = 0;
const newId = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, "0")}`;

function addUser(email: string, password: string, meta: any, app: any = {}, forceProfile = false): U {
  const u: U = { id: newId(), email, password, app_metadata: app, user_metadata: meta, created_at: new Date().toISOString() };
  users.set(u.id, u);
  if (meta.role !== "parent" && !forceProfile) return u; // comme la vraie base : le déclencheur ne crée que les profils parents
  profiles.push({ id: u.id, role: meta.role, name: meta.name, country: meta.country ?? "CI", level: meta.level ?? null, serie: meta.serie ?? null, parent_id: app.parent_id ?? null, login: app.login ?? null, suspended: false });
  return u;
}
const tokenOf = (u: U) => `tok-${u.id}`;
const send = (res: ServerResponse, code: number, body: unknown, headers: Record<string, string> = {}) => { res.writeHead(code, { "content-type": "application/json", ...headers }); res.end(JSON.stringify(body)); };
const fmt = (u: U) => ({ id: u.id, email: u.email, aud: "authenticated", app_metadata: u.app_metadata, user_metadata: u.user_metadata, created_at: u.created_at, identities: [{}] });

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    const url = new URL(req.url ?? "/", "http://x");
    const body = raw ? JSON.parse(raw) : {};
    const path = url.pathname;
    if (path === "/auth/v1/user") {
      const u = [...users.values()].find((x) => `Bearer ${tokenOf(x)}` === req.headers.authorization);
      return u ? send(res, 200, fmt(u)) : send(res, 401, { message: "invalid JWT" });
    }
    const adm = path.match(/^\/auth\/v1\/admin\/users(?:\/([^/]+))?$/);
    if (adm) {
      const id = adm[1];
      if (req.method === "POST") {
        if ([...users.values()].some((x) => x.email === body.email)) return send(res, 422, { msg: "A user with this email address has already been registered" });
        return send(res, 200, fmt(addUser(body.email, body.password, body.user_metadata, body.app_metadata)));
      }
      const u = id ? users.get(id) : undefined;
      if (!u) return send(res, 404, { msg: "User not found" });
      if (req.method === "GET") return send(res, 200, fmt(u));
      if (req.method === "PUT") {
        if (body.password) u.password = body.password;
        if (body.email) u.email = body.email;
        if (body.app_metadata) u.app_metadata = body.app_metadata;
        if (body.user_metadata) u.user_metadata = body.user_metadata;
        return send(res, 200, fmt(u));
      }
      if (req.method === "DELETE") { users.delete(u.id); profiles = profiles.filter((p) => p.id !== u.id); return send(res, 200, {}); }
    }
    if (path === "/rest/v1/solution_modes" && req.method === "POST") { solutionModes.push(body); return send(res, 201, {}); }
    if (path === "/rest/v1/profiles" && req.method === "POST") {
      if (profiles.some((p) => body.login && p.login === body.login)) return send(res, 409, { code: "23505", message: "duplicate key value violates unique constraint profiles_login_key" });
      profiles.push({ suspended: false, ...body });
      return send(res, 201, {});
    }
    if (path === "/rest/v1/profiles") {
      const match = (p: P) => [...url.searchParams].every(([k, v]) => ["select", "order", "limit"].includes(k) || !v.startsWith("eq.") || String(p[k]) === v.slice(3));
      const rows = profiles.filter(match);
      if (req.method === "PATCH") { rows.forEach((p) => Object.assign(p, body)); return send(res, 204, {}); }
      if (req.method === "HEAD") return send(res, 200, {}, { "content-range": `0-0/${rows.length}` });
      if (String(req.headers.accept).includes("vnd.pgrst.object")) return rows.length === 1 ? send(res, 200, rows[0]) : send(res, 406, { code: "PGRST116", message: "no rows" });
      return send(res, 200, rows);
    }
    send(res, 404, { error: "non géré par le faux serveur : " + req.method + " " + path });
  });
});
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const port = (server.address() as { port: number }).port;
process.env.SUPABASE_URL = `http://127.0.0.1:${port}`;
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-test";
const { default: handler } = await import("../api/children");

let fails = 0;
const ok = (c: boolean, m: string) => { console.log((c ? "OK   " : "ECHEC ") + m); if (!c) fails++; };
async function call(body: unknown, token?: string): Promise<{ status: number; json: any }> {
  let status = 200, json: any;
  const res = { status(c: number) { status = c; return res; }, json(b: unknown) { json = b; }, setHeader() {} };
  await handler({ method: "POST", body, headers: token ? { authorization: `Bearer ${token}` } : {} }, res);
  return { status, json };
}

const awa = addUser("awa@test.com", "x", { role: "parent", name: "Awa", country: "CI" });
const moussa = addUser("m@test.com", "x", { role: "parent", name: "Moussa", country: "SN" });
const kid = addUser("kid@test.com", "x", { role: "student", name: "Eleve" }, {}, true);
const T = tokenOf(awa);

ok((await call({ action: "create", children: [{ name: "Bola", level: "3e" }] })).status === 401, "sans connexion : refusé");
ok((await call({ action: "create", children: [{ name: "Bola", level: "3e" }] }, tokenOf(kid))).status === 403, "un élève ne peut pas créer d'accès");

const made = await call({ action: "create", children: [{ name: "Bola", level: "3e" }, { name: "Sosthène", level: "4e", serie: "" }, { name: "Bola", level: "6e" }] }, T);
const kids: { id: string; name: string; login: string; password: string }[] = made.json.created ?? [];
ok(made.status === 200 && kids.length === 3, "création de 3 enfants");
ok(kids.every((k) => /^[a-z0-9]+\.\d{4}$/.test(k.login) && k.password.length === 8), "identifiant « prenom.1234 » et mot de passe de 8 caractères");
ok(new Set(kids.map((k) => k.login)).size === 3 && new Set(kids.map((k) => k.password)).size === 3, "identifiants et mots de passe tous différents");
ok(kids.every((k) => users.get(k.id)?.password === k.password && users.get(k.id)?.email === `${k.login}@eleves.declickmath.invalid`), "le compte créé correspond à ce que voit le parent (connexion possible)");
ok(kids.every((k) => profiles.find((p) => p.id === k.id)?.parent_id === awa.id), "chaque enfant est rattaché au parent");
ok(kids.every((k) => profiles.find((p) => p.id === k.id)?.login === k.login && profiles.find((p) => p.id === k.id)?.role === "student"), "le profil de chaque élève est créé par le serveur, avec son identifiant");
ok(kids.every((k) => solutionModes.some((m) => m.student_id === k.id && m.mode === "deferred")), "corrigé « différé » par défaut pour chaque élève");

const [b0, b1] = kids;
const rp = await call({ action: "reset-password", childId: b0.id }, T);
ok(rp.status === 200 && rp.json.password && rp.json.password !== b0.password && users.get(b0.id)!.password === rp.json.password, "nouveau mot de passe : appliqué et renvoyé au parent");
ok(users.get(b1.id)!.password === b1.password, "le mot de passe des autres enfants ne change pas");
ok(users.get(b0.id)!.email === `${b0.login}@eleves.declickmath.invalid`, "l'identifiant ne change pas avec le mot de passe");
const customPassword = await call({ action: "reset-password", childId: kids[2].id, customPassword: "custom123" }, T);
ok(customPassword.status === 200 && customPassword.json.password === "custom123" && users.get(kids[2].id)!.password === "custom123", "l'ancien champ customPassword reste compatible");
const password = await call({ action: "reset-password", childId: kids[2].id, password: "custom456" }, T);
ok(password.status === 200 && password.json.password === "custom456" && users.get(kids[2].id)!.password === "custom456", "le champ password est accepté");

const rl = await call({ action: "reset-login", childId: b0.id }, T);
ok(rl.status === 200 && rl.json.login !== b0.login && users.get(b0.id)!.password === rp.json.password, "nouvel identifiant : changé, mot de passe conservé");

const other = tokenOf(moussa);
ok((await call({ action: "reset-password", childId: b1.id }, other)).status === 404, "un autre parent ne peut pas changer le mot de passe");
ok((await call({ action: "reset-login", childId: b1.id }, other)).status === 404, "un autre parent ne peut pas changer l'identifiant");
ok((await call({ action: "delete", childId: b1.id }, other)).status === 404 && users.has(b1.id), "un autre parent ne peut pas supprimer l'enfant");
ok((await call({ action: "delete", childId: awa.id }, T)).status === 404 && users.has(awa.id), "le parent ne peut pas se supprimer lui-même par cette route");

const del = await call({ action: "delete", childId: b1.id }, T);
ok(del.status === 200 && !users.has(b1.id) && !profiles.some((p) => p.id === b1.id), "suppression : compte et profil disparaissent");
ok(users.has(b0.id) && users.has(kids[2].id), "les autres enfants restent");
ok((await call({ action: "delete", childId: b1.id }, T)).status === 404, "supprimer deux fois : introuvable");

const many = await call({ action: "create", children: Array.from({ length: 20 }, (_, i) => ({ name: `E${i}`, level: "6e" })) }, T);
ok(many.status === 400, "plafond de 20 enfants par parent respecté");
ok((await call({ action: "inconnue" }, T)).status === 400, "action inconnue refusée");

server.close();
console.log(fails ? `\n${fails} échec(s)` : "\nTous les tests passent");
process.exit(fails ? 1 : 0);
