// Rendu des onglets admin (serveur) avec des données : aucune exception, textes attendus présents.
import { renderToString } from "react-dom/server";
import { signUp, update, uid } from "../src/store";
import { addPayment, decidePayment } from "../src/adminActions";
import { AccountsTab, ContentTab, JournalTab, PaymentsTab } from "../src/pages/AdminTabs";
import { createElement as h } from "react";

let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log("ÉCHEC", m); } else console.log("ok   ", m); };
signUp({ role: "parent", name: "Parent A", email: "p@x.ci", password: "secret1", country: "CI" });
const adminId = uid();
update((s) => ({ ...s, users: [...s.users, { id: adminId, role: "admin" as const, name: "Admin", email: "a@x.ci", password: "x", country: "CI" }], sessionId: adminId }));
const pid = (() => { let i = ""; update((s) => { i = s.users.find((u) => u.email === "p@x.ci")!.id; return s; }); return i; })();
addPayment(adminId, { userId: pid, amount: 5000, currency: "XOF", method: "Mobile money", reference: "TX42", months: 2 });
const r = (c: () => ReturnType<typeof h>) => renderToString(c());
const c1 = r(() => h(ContentTab)); ok(c1.includes("Contenu de maths par classe") && c1.includes("Terminale") && !/undefined|NaN/.test(c1), "onglet Contenu");
const c2 = r(() => h(AccountsTab)); ok(c2.includes("Parent A") && c2.includes("p@x.ci") && !/undefined|NaN/.test(c2), "onglet Comptes");
const c3 = r(() => h(PaymentsTab)); ok(c3.includes("TX42") && c3.includes("Valider") && !/undefined|NaN/.test(c3), "onglet Paiements (en attente)");
let pay = ""; update((s) => { pay = s.payments[0].id; return s; });
decidePayment(adminId, pay, true);
const c4 = r(() => h(PaymentsTab)); console.log(["Abonnements actifs", "Parent A", "XOF encaiss"].map((x) => x + ":" + c4.includes(x)).join(" "));
ok(c4.includes("Abonnements actifs") && c4.includes("Parent A") && c4.includes("encaiss"), "onglet Paiements (validé)");
const c5 = r(() => h(JournalTab)); ok(c5.includes("Paiement validé") && c5.includes("Paiement enregistré"), "onglet Journal");
console.log(fail ? `${fail} échec(s)` : "tous les tests passent"); process.exit(fail ? 1 : 0);
