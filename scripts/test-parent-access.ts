// Test de la création / régénération des accès enfants (logique du store, sans navigateur).
const mem = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };

const { signUpParent, logIn, logOut, regenerateAccess, regenerateLogin, addChildren, studentsOf, currentUser, modeFor } = await import("../src/store");
const store = await import("../src/store");

let fails = 0;
const ok = (c: boolean, m: string) => { console.log((c ? "OK   " : "ECHEC ") + m); if (!c) fails++; };
const st = () => { let s: any; store.update((x) => (s = x, x)); return s as import("../src/store").State; };

ok(signUpParent({ name: "Awa", email: "awa@test.com", password: "motdepasse1", country: "CI", children: [] }) !== null, "refuse un parent sans enfant");
ok(signUpParent({ name: "Awa", email: "awa@test.com", password: "motdepasse1", country: "CI",
  children: [{ name: "Koffi", level: "tle", serie: "C" }, { name: "Élodie", level: "3e" }, { name: "Koffi", level: "6e" }] }) === null, "inscription parent avec 3 enfants");
const parent = currentUser(st())!;
const kids = studentsOf(st(), parent.id);
ok(parent.role === "parent" && kids.length === 3, "3 enfants rattachés au parent");
ok(kids[0].level === "tle" && kids[0].serie === "C" && kids[1].level === "3e" && kids[2].level === "6e", "classes et série respectées");
ok(new Set(kids.map((k) => k.email)).size === 3, "identifiants uniques (deux Koffi inclus)");
ok(kids.every((k) => /^[a-z0-9]+\.\d{4}$/.test(k.email) && k.password.length === 8), "format identifiant / mot de passe");
ok(kids.every((k) => modeFor(st(), k.id) === "deferred"), "règle de corrigé « différer » par défaut");

const [k0] = kids; const oldPwd = k0.password;
logOut();
ok(logIn(k0.email, oldPwd) === null && currentUser(st())?.id === k0.id, "l'enfant se connecte avec ses accès");
ok(currentUser(st())?.role === "student", "session élève");
logOut();
ok(logIn(k0.email.toUpperCase(), oldPwd) === null, "identifiant insensible à la casse");
logOut();
logIn("awa@test.com", "motdepasse1");

let prev = oldPwd; let unique = true; let oldRefused = true;
for (let i = 0; i < 200; i++) {
  const np = regenerateAccess(parent.id, k0.id)!;
  if (np === prev) unique = false;
  logOut(); if (logIn(k0.email, prev) === null) oldRefused = false; logOut();
  if (logIn(k0.email, np) !== null) oldRefused = false; logOut();
  logIn("awa@test.com", "motdepasse1"); prev = np;
}
ok(unique && oldRefused, "200 régénérations : chaque nouveau mot de passe marche, l'ancien est refusé");

const oldLogin = k0.email;
regenerateLogin(parent.id, k0.id);
const k0b = st().users.find((u) => u.id === k0.id)!;
ok(k0b.email !== oldLogin && logIn(oldLogin, prev) !== null, "nouvel identifiant : l'ancien est refusé");
logOut(); ok(logIn(k0b.email, k0b.password) === null, "nouvel identifiant fonctionne"); logOut();

logIn("awa@test.com", "motdepasse1");
ok(regenerateAccess(parent.id, "inconnu") === null, "refuse un enfant inexistant");
signUpParent({ name: "Moussa", email: "m@test.com", password: "motdepasse2", country: "SN", children: [{ name: "Fatou", level: "cm2" }] });
const other = currentUser(st())!;
ok(regenerateAccess(other.id, k0.id) === null, "un parent ne peut pas régénérer l'accès de l'enfant d'un autre");

logOut(); logIn("awa@test.com", "motdepasse1");
addChildren(parent.id, [{ name: "Ibrahim", level: "2nde" }, { name: "  ", level: "cp" }]);
ok(studentsOf(st(), parent.id).length === 4, "ajout ultérieur d'un enfant (prénom vide ignoré)");

console.log(fails ? `\n${fails} échec(s)` : "\nTous les tests passent");
process.exit(fails ? 1 : 0);
