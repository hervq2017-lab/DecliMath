// Test exhaustif : Système de connexion Parent-Enfant, QR code d'activation,
// connexion rapide, suspension, sécurité transversale et persistance.
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createHash } from "node:crypto";

const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => void mem.clear(),
};

const store = await import("../src/store");
const {
  signUpParent, logIn, logOut, addChildren, resetChildPassword, toggleSuspendChild,
  changeStudentPassword, createQrToken, revokeQrTokens, verifyQrToken, consumeQrToken,
  studentsOf, acceptedStudentsOf, hasAcceptedParentLink, currentUser, modeFor, update
} = store;

let fails = 0;
const ok = (c: boolean, m: string) => {
  console.log((c ? "OK   " : "ECHEC ") + m);
  if (!c) fails++;
};
const st = () => {
  let s: any;
  update((x) => ((s = x), x));
  return s as import("../src/store").State;
};

console.log("=== TESTS 1 : LOGIQUE LOCALE & MÉTIER (STORE) ===");

// 1. Création compte parent avec 2 enfants
ok(
  signUpParent({
    name: "Fatou Diallo",
    email: "fatou@parent.sn",
    password: "Password123",
    country: "SN",
    children: [
      { name: "Amadou", level: "3e" },
      { name: "Aïcha", level: "tle", serie: "C" },
    ],
  }) === null,
  "Parent créé avec 2 enfants"
);

const parent1 = currentUser(st())!;
ok(parent1.role === "parent", "Rôle parent authentifié");
const kids = studentsOf(st(), parent1.id);
ok(kids.length === 2, "2 enfants créés et rattachés");
const [amadou, aicha] = kids;
ok(kids.every((c) => !c.password && !c.parentLinkedAt), "Les profils restent en attente sans mot de passe ni partage");
ok(acceptedStudentsOf(st(), parent1.id).length === 0, "Le parent ne voit aucun enfant avant acceptation");
ok(logIn(amadou.email, "") !== null, "Un enfant ne peut pas se connecter avant d'accepter son invitation");

// 2. Génération QR code d'invitation
logIn(parent1.email, "Password123");
const qrAct = createQrToken(parent1.id, amadou.id, "activation");
ok(qrAct !== null && qrAct.token.length > 20, "QR code d'invitation généré pour Amadou");
ok(createQrToken(parent1.id, amadou.id, "quick_login") === null, "Aucune connexion rapide avant acceptation");
const verify1 = verifyQrToken(qrAct!.token);
ok(verify1.valid && verify1.student?.id === amadou.id && verify1.purpose === "activation", "Vérification QR code valide");

// 3. Acceptation de l'invitation (usage unique + choix du mot de passe)
logOut();
const consume1 = consumeQrToken(qrAct!.token, "NouveauSecret2026");
ok(consume1.success && currentUser(st())?.id === amadou.id, "Invitation acceptée et session élève ouverte");
ok(st().users.find((u) => u.id === amadou.id)!.password === "NouveauSecret2026", "Nouveau mot de passe secret enregistré");
ok(!!st().users.find((u) => u.id === amadou.id)!.parentLinkedAt, "L'acceptation active le lien parent-enfant");
ok(acceptedStudentsOf(st(), parent1.id).length === 1 && hasAcceptedParentLink(st().users.find((u) => u.id === amadou.id)!), "Seul l'enfant ayant accepté est visible dans le suivi parent");

// 4. Enregistrement et persistance de l'activité après acceptation
update((s) => ({
  ...s,
  attempts: [
    ...s.attempts,
    {
      id: "att-1",
      studentId: amadou.id,
      templateId: "t-1",
      notionId: "notion-frac",
      ctx: "ctx",
      seed: 1234,
      correct: true,
      helpLevel: 0,
      solutionViewed: false,
      solutionViewedBeforeAttempt: false,
      kind: "practice",
      ts: Date.now(),
    },
    {
      id: "att-2",
      studentId: amadou.id,
      templateId: "t-2",
      notionId: "notion-frac",
      ctx: "ctx",
      seed: 5678,
      correct: false,
      helpLevel: 1,
      solutionViewed: false,
      solutionViewedBeforeAttempt: false,
      kind: "practice",
      ts: Date.now(),
    },
  ],
}));
logOut();
ok(logIn(amadou.email, "NouveauSecret2026") === null, "Amadou se reconnecte après acceptation");
const amadouAttempts = st().attempts.filter((a) => a.studentId === amadou.id);
ok(amadouAttempts.length === 2 && amadouAttempts[0].correct === true, "Persistance des exercices après reconnexion");
logOut();

// Re-tentative d'utilisation du même QR code
const verifyReused = verifyQrToken(qrAct!.token);
ok(!verifyReused.valid && verifyReused.error?.includes("déjà été utilisé"), "Usage unique : QR code déjà utilisé refusé");
const consumeReused = consumeQrToken(qrAct!.token, "AutrePass");
ok(!consumeReused.success, "Re-consommation refusée");

// 6. Révocation de QR code par le parent
logOut();
logIn(parent1.email, "Password123");
const qrToRevoke = createQrToken(parent1.id, aicha.id, "activation");
ok(qrToRevoke !== null, "QR code généré pour Aïcha");
revokeQrTokens(parent1.id, aicha.id);
const verifyRevoked = verifyQrToken(qrToRevoke!.token);
ok(!verifyRevoked.valid && verifyRevoked.error?.includes("révoqué"), "QR code révoqué immédiatement invalide");

// 7. QR code expiré
update((s) => ({
  ...s,
  qrTokens: (s.qrTokens ?? []).map((t) => (t.token === qrToRevoke!.token ? { ...t, revokedAt: undefined, expiresAt: Date.now() - 1000 } : t)),
}));
const verifyExpired = verifyQrToken(qrToRevoke!.token);
ok(!verifyExpired.valid && verifyExpired.error?.includes("expiré"), "QR code expiré refusé");

// 8. Suspension et réactivation du compte élève
toggleSuspendChild(parent1.id, amadou.id, true);
ok(st().users.find((u) => u.id === amadou.id)!.suspended === true, "Amadou suspendu par son parent");
logOut();
ok(logIn(amadou.email, "NouveauSecret2026") !== null, "Connexion d'Amadou refusée car suspendu");

// Génération QR code refusée quand suspendu
logIn(parent1.email, "Password123");
ok(createQrToken(parent1.id, amadou.id) === null, "Impossible de générer un QR code pour un enfant suspendu");
toggleSuspendChild(parent1.id, amadou.id, false);
ok(st().users.find((u) => u.id === amadou.id)!.suspended === false, "Amadou réactivé");
logOut();
ok(logIn(amadou.email, "NouveauSecret2026") === null, "Connexion d'Amadou de nouveau autorisée après réactivation");
logOut();

// 9. Sécurité transversale entre parents
logIn("fatou@parent.sn", "Password123");
signUpParent({
  name: "Mamadou Traoré",
  email: "mamadou@parent.ml",
  password: "Password456",
  country: "ML",
  children: [{ name: "Sekou", level: "4e" }],
});
const parent2 = currentUser(st())!;
const sekou = studentsOf(st(), parent2.id)[0];

// Le parent 1 ne peut pas manipuler Sekou (l'enfant du parent 2)
ok(createQrToken(parent1.id, sekou.id) === null, "Parent 1 ne peut pas créer de QR code pour l'enfant de Parent 2");
resetChildPassword(parent1.id, sekou.id, "Hack1234");
ok(st().users.find((u) => u.id === sekou.id)!.password !== "Hack1234", "Parent 1 ne peut pas changer le mot de passe de l'enfant de Parent 2");
toggleSuspendChild(parent1.id, sekou.id, true);
ok(st().users.find((u) => u.id === sekou.id)!.suspended !== true, "Parent 1 ne peut pas suspendre l'enfant de Parent 2");

console.log("\n=== TESTS 2 : FONCTION SERVEUR (API/CHILDREN.TS) ===");

// Configuration d'un faux serveur Supabase HTTP pour tester api/children.ts
type U = { id: string; email: string; password: string; app_metadata: any; user_metadata: any; created_at: string };
type P = Record<string, any>;
const serverUsers = new Map<string, U>();
let serverProfiles: P[] = [];
let serverTokens: P[] = [];
let seq = 100;
const newUuid = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, "0")}`;

function addServerUser(email: string, password: string, meta: any, app: any = {}): U {
  const u: U = { id: newUuid(), email, password, app_metadata: app, user_metadata: meta, created_at: new Date().toISOString() };
  serverUsers.set(u.id, u);
  serverProfiles.push({
    id: u.id,
    role: meta.role,
    name: meta.name,
    country: meta.country ?? "CI",
    level: meta.level ?? null,
    serie: meta.serie ?? null,
    parent_id: app.parent_id ?? null,
    parent_linked_at: null,
    login: app.login ?? null,
    suspended: false,
    must_change_password: true,
    password_customized: false,
  });
  return u;
}

const sendJson = (res: ServerResponse, code: number, body: unknown) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

const fakeServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    const url = new URL(req.url ?? "/", "http://x");
    const body = raw ? JSON.parse(raw) : {};
    const path = url.pathname;

    if (path === "/auth/v1/user") {
      const auth = String(req.headers.authorization ?? "");
      const u = [...serverUsers.values()].find((x) => `Bearer token-${x.id}` === auth);
      return u ? sendJson(res, 200, { id: u.id, email: u.email, app_metadata: u.app_metadata, user_metadata: u.user_metadata }) : sendJson(res, 401, { message: "invalid JWT" });
    }

    const adm = path.match(/^\/auth\/v1\/admin\/users(?:\/([^/]+))?$/);
    if (adm) {
      const id = adm[1];
      if (req.method === "POST") {
        const nu = addServerUser(body.email, body.password, body.user_metadata, body.app_metadata);
        return sendJson(res, 200, { id: nu.id, email: nu.email });
      }
      const u = id ? serverUsers.get(id) : undefined;
      if (!u) return sendJson(res, 404, { msg: "Not found" });
      if (req.method === "PUT") {
        if (body.password) u.password = body.password;
        return sendJson(res, 200, { id: u.id, email: u.email });
      }
    }

    if (path === "/rest/v1/solution_modes") return sendJson(res, 201, {});

    if (path === "/rest/v1/profiles") {
      const match = (p: P) => [...url.searchParams].every(([k, v]) => ["select", "order", "limit"].includes(k) || !v.startsWith("eq.") || String(p[k]) === v.slice(3));
      const rows = serverProfiles.filter(match);
      if (req.method === "POST") {
        serverProfiles.push(body);
        return sendJson(res, 201, {});
      }
      if (req.method === "PATCH") {
        rows.forEach((p) => Object.assign(p, body));
        return sendJson(res, 204, {});
      }
      if (String(req.headers.accept).includes("vnd.pgrst.object")) {
        return rows.length === 1 ? sendJson(res, 200, rows[0]) : sendJson(res, 406, { code: "PGRST116" });
      }
      return sendJson(res, 200, rows);
    }

    if (path === "/rest/v1/student_qr_tokens") {
      const match = (t: P) => [...url.searchParams].every(([k, v]) => {
        if (["select", "order", "limit"].includes(k)) return true;
        if (v === "is.null") return t[k] === null || t[k] === undefined;
        if (v.startsWith("eq.")) return String(t[k]) === v.slice(3);
        if (v.startsWith("gt.")) return Date.parse(t[k]) > Date.parse(v.slice(3));
        return true;
      });
      const rows = serverTokens.filter(match);
      if (req.method === "POST") {
        const row = { id: newUuid(), ...body };
        serverTokens.push(row);
        return sendJson(res, 201, {});
      }
      if (req.method === "PATCH") {
        rows.forEach((t) => Object.assign(t, body));
        return String(req.headers.prefer).includes("return=representation") ? sendJson(res, 200, rows) : sendJson(res, 204, {});
      }
      if (String(req.headers.accept).includes("vnd.pgrst.object")) {
        return rows.length === 1 ? sendJson(res, 200, rows[0]) : sendJson(res, 406, { code: "PGRST116" });
      }
      return sendJson(res, 200, rows);
    }

    sendJson(res, 404, { error: "Route mock non gérée" });
  });
});

await new Promise<void>((r) => fakeServer.listen(0, "127.0.0.1", r));
const sPort = (fakeServer.address() as { port: number }).port;
process.env.SUPABASE_URL = `http://127.0.0.1:${sPort}`;
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key-test";

const { default: apiHandler } = await import("../api/children");

async function callApi(body: unknown, token?: string): Promise<{ status: number; json: any }> {
  let status = 200, json: any;
  const res = { status(c: number) { status = c; return res; }, json(b: unknown) { json = b; }, setHeader() {} };
  await apiHandler({ method: "POST", body, headers: token ? { authorization: `Bearer ${token}` } : {} }, res);
  return { status, json };
}

const parentUser = addServerUser("p1@test.com", "pass", { role: "parent", name: "Parent Test", country: "CI" });
const childUser = addServerUser("c1@test.com", "pass", { role: "student", name: "Enfant Test", country: "CI" }, { parent_id: parentUser.id, login: "enfant.5555" });
const parentToken = `token-${parentUser.id}`;

// 1. Action create-qr par le parent
const apiCreateQr = await callApi({ action: "create-qr", childId: childUser.id, purpose: "activation" }, parentToken);
ok(apiCreateQr.status === 200 && apiCreateQr.json.token, "Serveur API : create-qr génère un token aléatoire");
const rawApiToken = apiCreateQr.json.token;
const pendingQuickQr = await callApi({ action: "create-qr", childId: childUser.id, purpose: "quick_login" }, parentToken);
ok(pendingQuickQr.status === 400, "Serveur API : aucun QR de connexion rapide avant acceptation");

// 2. Action verify-qr publique
const apiVerify = await callApi({ action: "verify-qr", token: rawApiToken });
ok(apiVerify.status === 200 && apiVerify.json.valid === true && apiVerify.json.student.login === "enfant.5555" && apiVerify.json.student.parentName === "Parent Test", "Serveur API : verify-qr valide le jeton et identifie le parent invitant");

// 3. Action consume-qr publique avec mot de passe
const apiConsume = await callApi({ action: "consume-qr", token: rawApiToken, newPassword: "MonSecretServer12" });
ok(apiConsume.status === 200 && apiConsume.json.ok === true && apiConsume.json.login === "enfant.5555", "Serveur API : consume-qr consomme le jeton et applique le mot de passe");
ok(serverUsers.get(childUser.id)!.password === "MonSecretServer12", "Serveur API : mot de passe mis à jour dans Auth");
ok(!!serverProfiles.find((p) => p.id === childUser.id)!.parent_linked_at, "Serveur API : l'acceptation active le partage parent-enfant");
const acceptedQuickQr = await callApi({ action: "create-qr", childId: childUser.id, purpose: "quick_login" }, parentToken);
ok(acceptedQuickQr.status === 200 && acceptedQuickQr.json.token, "Serveur API : le QR de connexion est disponible après acceptation");

// 4. Usage unique : verify-qr après consommation renvoie 410
const apiVerifyAgain = await callApi({ action: "verify-qr", token: rawApiToken });
ok(apiVerifyAgain.status === 410, "Serveur API : QR code consommé renvoie HTTP 410 (déjà utilisé)");

// 4b. Usage unique même si deux appareils valident exactement en même temps
const race = await callApi({ action: "create-qr", childId: childUser.id, purpose: "activation" }, parentToken);
const raced = await Promise.all([
  callApi({ action: "consume-qr", token: race.json.token, newPassword: "PremierGagnant1" }),
  callApi({ action: "consume-qr", token: race.json.token, newPassword: "SecondGagnant2" }),
]);
ok(raced.filter((r) => r.status === 200).length === 1 && raced.filter((r) => r.status === 410).length === 1, "Serveur API : deux validations simultanées, une seule réussit");
ok(["PremierGagnant1", "SecondGagnant2"].includes(serverUsers.get(childUser.id)!.password), "Serveur API : un seul mot de passe a été appliqué");

// 4c. Un QR code révoqué ou expiré ne peut pas être consommé
const revokedQr = await callApi({ action: "create-qr", childId: childUser.id, purpose: "activation" }, parentToken);
await callApi({ action: "revoke-qr", childId: childUser.id }, parentToken);
ok((await callApi({ action: "consume-qr", token: revokedQr.json.token, newPassword: "Revoque1234" })).status === 410, "Serveur API : QR code révoqué refusé");
const expiredQr = await callApi({ action: "create-qr", childId: childUser.id, purpose: "activation" }, parentToken);
serverTokens.forEach((t) => { if (t.revoked_at == null && t.used_at == null) t.expires_at = new Date(Date.now() - 1000).toISOString(); });
ok((await callApi({ action: "consume-qr", token: expiredQr.json.token, newPassword: "Expire123456" })).status === 410, "Serveur API : QR code expiré refusé");

// 4d. Mauvais jeton : refus uniforme, sans rien révéler
ok((await callApi({ action: "verify-qr", token: "n-importe-quoi" })).status === 404, "Serveur API : jeton inconnu refusé (404)");
ok(!serverTokens.some((t) => "token" in t), "Serveur API : le jeton en clair n'est jamais stocké (empreinte seulement)");

// 4e. Limite d'essais sur les actions publiques
const { qrRateLimited } = await import("../api/children");
const t0 = Date.now();
const flags = Array.from({ length: 31 }, () => qrRateLimited("203.0.113.9", t0));
ok(!flags[29] && flags[30], "Serveur API : la 31e tentative en une minute est bloquée");
ok(!qrRateLimited("203.0.113.9", t0 + 61_000), "Serveur API : la limite se relâche après une minute");

// 5. Suspension via toggle-suspend
const apiSuspend = await callApi({ action: "toggle-suspend", childId: childUser.id, suspended: true }, parentToken);
ok(apiSuspend.status === 200 && apiSuspend.json.suspended === true, "Serveur API : toggle-suspend suspend l'enfant");

// 6. Action refusée sans token parent
const apiNoAuth = await callApi({ action: "create-qr", childId: childUser.id });
ok(apiNoAuth.status === 401, "Serveur API : action parent refusée sans Bearer token");

await new Promise<void>((r) => fakeServer.close(() => r()));

console.log(fails ? `\n❌ ${fails} test(s) échoué(s)` : "\n✅ TOUS LES TESTS PARENT-ENFANT ET QR CODE PASSENT SANS ERREUR !");
if (fails) process.exit(1);
