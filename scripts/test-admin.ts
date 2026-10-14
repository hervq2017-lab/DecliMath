// Tests de l'espace admin : droits, suspension, suppression, mot de passe, paiements, journal.
import { currentUser, logIn, logOut, signUp, update, uid, State } from "../src/store";
import * as store from "../src/store";
import { startPreview, stopPreview, addPayment, decidePayment, deleteAccount, hasActivePlan, resetPassword, revokeAccess, setSuspended } from "../src/adminActions";

let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log("ÉCHEC", m); } else console.log("ok   ", m); };
const st = (): State => (store as unknown as { __s?: never }) && (null as never);
void st;
const get = (): State => { let r!: State; update((s) => { r = s; return s; }); return r; };

// comptes
ok(signUp({ role: "parent", name: "Parent A", email: "p@x.ci", password: "secret1", country: "CI" }) === null, "inscription parent");
const parent = get().users.find((u) => u.email === "p@x.ci")!;
ok(signUp({ role: "student", name: "Eleve A", email: "e@x.ci", password: "secret2", country: "CI", level: "tle", inviteCode: parent.inviteCode }) === null, "inscription élève avec code");
const eleve = get().users.find((u) => u.email === "e@x.ci")!;
const adminId = uid();
update((s) => ({ ...s, users: [...s.users, { id: adminId, role: "admin", name: "Admin", email: "a@x.ci", password: "adminpw", country: "CI" }] }));

// droits
ok(setSuspended(eleve.id, parent.id, true) !== null, "un élève ne peut pas suspendre");
ok(deleteAccount(parent.id, eleve.id) !== null, "un parent ne peut pas supprimer");
ok(addPayment(eleve.id, { userId: parent.id, amount: 1, currency: "XOF", method: "x", reference: "r", months: 1 }) !== null, "un élève ne peut pas enregistrer un paiement");
ok(get().users.find((u) => u.id === eleve.id) !== undefined && get().audit.length === 0, "aucun effet ni journal si refus");

// suspension
ok(currentUser(get())?.id === eleve.id, "élève connecté après inscription");
ok(setSuspended(adminId, eleve.id, true) === null, "suspension par admin");
ok(currentUser(get()) === null, "session ouverte coupée par la suspension");
ok(logIn("e@x.ci", "secret2") !== null && currentUser(get()) === null, "connexion refusée si suspendu");
ok(setSuspended(adminId, eleve.id, false) === null, "réactivation");
ok(logIn("e@x.ci", "secret2") === null && currentUser(get())?.id === eleve.id, "connexion autorisée après réactivation");
logOut();
ok(setSuspended(adminId, adminId, true) !== null, "un admin ne peut pas se suspendre");

// mot de passe
const r = resetPassword(adminId, eleve.id);
ok(r.error === null && !!r.password && logIn("e@x.ci", r.password!) === null, "mot de passe provisoire fonctionne");
logOut();
ok(logIn("e@x.ci", "secret2") !== null, "ancien mot de passe refusé");

// paiements
ok(addPayment(adminId, { userId: parent.id, amount: 0, currency: "XOF", method: "Virement", reference: "R1", months: 1 }) !== null, "montant 0 refusé");
ok(addPayment(adminId, { userId: parent.id, amount: 5000, currency: "XOF", method: "Virement", reference: "  ", months: 1 }) !== null, "référence vide refusée");
ok(addPayment(adminId, { userId: parent.id, amount: 5000, currency: "XOF", method: "Virement", reference: "R1", months: 0 }) !== null, "durée 0 refusée");
ok(addPayment(adminId, { userId: "inconnu", amount: 5000, currency: "XOF", method: "Virement", reference: "R1", months: 1 }) !== null, "compte inconnu refusé");
ok(addPayment(adminId, { userId: parent.id, amount: 5000, currency: "XOF", method: "Virement", reference: "R1", months: 3 }) === null, "paiement enregistré");
const pay = get().payments[0];
ok(pay.status === "pending" && !hasActivePlan(get().users.find((u) => u.id === parent.id)), "en attente : pas d'accès");
ok(decidePayment(adminId, pay.id, true) === null, "validation");
const p2 = get().users.find((u) => u.id === parent.id)!;
ok(hasActivePlan(p2) && Math.abs((p2.paidUntil! - Date.now()) / 864e5 - 90) < 1, "accès actif 3 mois");
ok(decidePayment(adminId, pay.id, false) !== null, "paiement déjà traité refusé");
addPayment(adminId, { userId: parent.id, amount: 5000, currency: "XOF", method: "Virement", reference: "R2", months: 1 });
const pay2 = get().payments[0];
ok(decidePayment(adminId, pay2.id, false, "preuve illisible") === null && get().payments[0].status === "rejected" && Math.abs((get().users.find((u) => u.id === parent.id)!.paidUntil! - p2.paidUntil!)) < 5, "refus : accès inchangé");
addPayment(adminId, { userId: parent.id, amount: 2000, currency: "XOF", method: "Virement", reference: "R3", months: 1 });
decidePayment(adminId, get().payments[0].id, true);
ok(Math.abs((get().users.find((u) => u.id === parent.id)!.paidUntil! - p2.paidUntil!) / 864e5 - 30) < 1, "renouvellement : durée cumulée");
ok(revokeAccess(adminId, parent.id) === null && !hasActivePlan(get().users.find((u) => u.id === parent.id)), "retrait d'accès");

// suppression avec données liées
update((s) => ({ ...s, attempts: [{ id: uid(), studentId: eleve.id, templateId: "t", notionId: "n", ctx: "c", seed: 1, correct: true, helpLevel: 0, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "practice", ts: Date.now() }] }));
ok(deleteAccount(adminId, parent.id) === null, "suppression du parent");
ok(get().users.find((u) => u.id === eleve.id)?.parentId === undefined && get().payments.every((p) => p.userId !== parent.id), "élève délié, paiements du parent supprimés");
ok(deleteAccount(adminId, eleve.id) === null && get().attempts.length === 0, "suppression de l'élève et de ses tentatives");
ok(deleteAccount(adminId, adminId) !== null, "un admin ne peut pas se supprimer");

// aperçu
signUp({ role: "student", name: "Eleve B", email: "b@x.ci", password: "secret3", country: "CI", level: "6e" }); logOut();
const b = get().users.find((u) => u.email === "b@x.ci")!;
const snapshot = JSON.stringify({ users: get().users, attempts: get().attempts });
ok(startPreview(b.id, b.id) !== null, "un élève ne peut pas lancer un aperçu");
update((s) => ({ ...s, sessionId: adminId }));
ok(startPreview(adminId, b.id) === null && currentUser(get())?.id === b.id && !!get().previewBackup, "aperçu : on devient l'élève");
update((s) => ({ ...s, attempts: [...s.attempts, { id: "x", studentId: b.id, templateId: "t", notionId: "n", ctx: "c", seed: 1, correct: true, helpLevel: 0, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "practice", ts: Date.now() }], users: s.users.map((u) => (u.id === b.id ? { ...u, name: "Modifié" } : u)) }));
ok(startPreview(adminId, b.id) !== null, "aperçu déjà en cours refusé");
stopPreview();
ok(currentUser(get())?.id === adminId && !get().previewBackup, "retour à l'administrateur");
ok(JSON.stringify({ users: get().users, attempts: get().attempts }) === snapshot, "aucune donnée modifiée pendant l'aperçu");
ok(get().audit.some((x) => x.action === "Aperçu du compte"), "aperçu journalisé");
update((s) => ({ ...s, users: s.users.map((u) => (u.id === b.id ? { ...u, suspended: true } : u)) }));
ok(startPreview(adminId, b.id) !== null, "aperçu d'un compte suspendu refusé");
ok(startPreview(adminId, adminId) !== null, "aperçu d'un admin refusé");

update((s) => ({ ...s, users: s.users.map((u) => (u.id === b.id ? { ...u, suspended: false } : u)), sessionId: adminId }));
startPreview(adminId, b.id); logOut();
ok(!get().previewBackup && get().sessionId === null && get().users.length > 0, "déconnexion pendant un aperçu : état réel restauré");

// journal
const a = get().audit;
ok(a.length >= 10 && a.every((x) => x.adminId === adminId && x.action && x.target), "journal rempli et attribué");
console.log(fail ? `${fail} échec(s)` : "tous les tests passent");
process.exit(fail ? 1 : 0);
