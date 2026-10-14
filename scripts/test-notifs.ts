// Tests des notifications : contenu concret par rôle, non-lu / lu, pas de doublon ni de texte invalide.
import { signUp, update, uid, State, markNotificationsSeen, User } from "../src/store";
import { notificationsFor, unreadCount } from "../src/lib/notifications";
import { addPayment } from "../src/adminActions";
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log("ÉCHEC", m); } else console.log("ok   ", m); };
const get = (): State => { let r!: State; update((s) => { r = s; return s; }); return r; };
const user = (e: string): User => get().users.find((u) => u.email === e)!;
const att = (studentId: string, ts: number, correct = true) => ({ id: uid(), studentId, templateId: "t", notionId: "maths:6e:x", ctx: "c", seed: 1, correct, helpLevel: 0, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "practice" as const, ts });
const now = Date.now(), DAY = 864e5;

signUp({ role: "parent", name: "Maman", email: "p@x.ci", password: "secret1", country: "CI" });
signUp({ role: "student", name: "Awa", email: "e@x.ci", password: "secret2", country: "CI", level: "tle", inviteCode: user("p@x.ci").inviteCode });
const e = user("e@x.ci"), p = user("p@x.ci");
let n = notificationsFor(get(), e, now);
ok(n.some((x) => x.title.includes("premier exercice")), "élève neuf : invitation à commencer");
ok(!n.some((x) => x.title.includes("parent")), "élève lié : pas de rappel de parent");
update((s) => ({ ...s, attempts: [att(e.id, now - 2 * DAY), att(e.id, now - DAY)] }));
n = notificationsFor(get(), e, now);
ok(n.some((x) => x.title.includes("série de 2 jours")), "série en jeu quand rien aujourd'hui");
update((s) => ({ ...s, attempts: [...s.attempts, att(e.id, now - 1000), att(e.id, now - 500)] }));
n = notificationsFor(get(), e, now);
ok(n.some((x) => x.title.includes("Objectif du jour : 2/15")) && !n.some((x) => x.title.includes("série")), "objectif en cours 2/15");
update((s) => ({ ...s, attempts: [...s.attempts, ...Array.from({ length: 13 }, () => att(e.id, now - 100))] }));
n = notificationsFor(get(), e, now);
ok(n.some((x) => x.title.includes("Objectif du jour atteint")), "objectif atteint");
update((s) => ({ ...s, checks: [{ id: "c1", studentId: e.id, notionId: "maths:6e:x", passed: true, ts: now - 3600000 }, { id: "c2", studentId: e.id, notionId: "maths:6e:y", passed: false, ts: now - 7200000 }, { id: "c3", studentId: e.id, notionId: "maths:6e:z", passed: true, ts: now - 30 * DAY }] }));
n = notificationsFor(get(), e, now);
ok(n.filter((x) => x.kind === "trophy").length === 1 && n.filter((x) => x.kind === "alert").length === 1, "contrôles récents seulement (14 j)");
ok(n.every((x) => x.title && x.text && !/undefined|NaN|\[object/.test(x.title + x.text)), "textes valides");
ok(new Set(n.map((x) => x.id)).size === n.length && n.length <= 12, "identifiants uniques, 12 max");
ok(n.every((x, i) => i === 0 || n[i - 1].ts >= x.ts), "triées du plus récent au plus ancien");
const before = unreadCount(n, e.notifSeen);
markNotificationsSeen(e.id);
const after = unreadCount(notificationsFor(get(), user("e@x.ci"), Date.now()), user("e@x.ci").notifSeen);
ok(before > 0 && after === 0, `lu après ouverture (${before} → ${after})`);

// parent
let pn = notificationsFor(get(), p, now);
ok(pn.some((x) => x.title.includes("Awa a travaillé aujourd'hui") && x.to === `/enfant/${e.id}/reponses`), "parent : activité de l'enfant du jour");
ok(pn.some((x) => x.title.includes("Awa : contrôle réussi")), "parent : contrôle réussi de l'enfant");
update((s) => ({ ...s, attempts: s.attempts.filter((a) => a.ts < now - 5 * DAY) }));
update((s) => ({ ...s, attempts: [att(e.id, now - 5 * DAY)] }));
pn = notificationsFor(get(), p, now);
ok(pn.some((x) => x.title.includes("rien fait depuis 5 jours")), "parent : enfant inactif depuis 5 jours");
update((s) => ({ ...s, users: s.users.map((u) => (u.id === p.id ? { ...u, paidUntil: now + 3 * DAY } : u)) }));
ok(notificationsFor(get(), user("p@x.ci"), now).some((x) => x.kind === "money" && x.text.includes("3 jours")), "parent : abonnement bientôt fini");

// admin
const adminId = uid();
update((s) => ({ ...s, users: [...s.users, { id: adminId, role: "admin" as const, name: "Admin", email: "a@x.ci", password: "x", country: "CI" }] }));
addPayment(adminId, { userId: p.id, amount: 5000, currency: "XOF", method: "Virement", reference: "R1", months: 1 });
const an = notificationsFor(get(), user("a@x.ci"), Date.now());
ok(an.some((x) => x.title.includes("1 paiement à valider")), "admin : paiement à valider");
ok(an.some((x) => x.title.includes("Nouvelle inscription")), "admin : nouvelles inscriptions");
console.log(fail ? `${fail} échec(s)` : "tous les tests passent"); process.exit(fail ? 1 : 0);
