// Notifications de la cloche : calculées à partir de l'activité réelle (rien n'est inventé, rien n'est stocké sauf « vu jusqu'à »).
import { LESSONS } from "../content/lessons";
import { notionById } from "../curriculum";
import type { State, User } from "../store";
import { attemptsOf, dayKey, streak } from "./stats";

export type NotifKind = "goal" | "streak" | "trophy" | "exam" | "alert" | "money" | "book" | "user";
export interface Notif {
  id: string;
  ts: number;
  kind: NotifKind;
  title: string;
  text: string;
  to?: string;
}

const DAY = 864e5;
const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

function studentNotifs(s: State, u: User, now: number): Notif[] {
  const out: Notif[] = [];
  const mine = attemptsOf(s, u.id);
  const today = startOfDay(now);
  const doneToday = mine.filter((a) => dayKey(a.ts) === dayKey(now)).length;
  const goal = u.prefs?.dailyGoal ?? 15;
  const st = streak(mine, now);
  if (mine.length === 0) out.push({ id: `start-${today}`, ts: today, kind: "book", title: "Commence ton premier exercice", text: "Choisis un cours et fais une première série de 4 exercices.", to: "/exercices" });
  else if (doneToday === 0 && st > 0) out.push({ id: `streak-${today}`, ts: today, kind: "streak", title: `Ta série de ${st} ${plural(st, "jour", "jours")} est en jeu`, text: "Fais au moins un exercice aujourd'hui pour la garder.", to: "/exercices" });
  else if (doneToday >= goal) out.push({ id: `goal-ok-${today}`, ts: today, kind: "goal", title: "Objectif du jour atteint 🎉", text: `${doneToday} exercices faits aujourd'hui, objectif ${goal}. Bravo !` });
  else if (doneToday > 0) out.push({ id: `goal-${today}`, ts: today, kind: "goal", title: `Objectif du jour : ${doneToday}/${goal}`, text: `Plus que ${goal - doneToday} ${plural(goal - doneToday, "exercice", "exercices")} pour l'atteindre.`, to: "/exercices" });
  if (u.prefs?.reminder && doneToday === 0 && new Date(now).getHours() >= 18) out.push({ id: `reminder-${today}`, ts: today + 18 * 36e5, kind: "goal", title: "Rappel de 18h00", text: "Tu n'as pas encore travaillé aujourd'hui : fais une petite série.", to: "/exercices" });
  s.checks.filter((c) => c.studentId === u.id && now - c.ts < 14 * DAY).forEach((c) => {
    const n = notionById(c.notionId);
    out.push({ id: `check-${c.id}`, ts: c.ts, kind: c.passed ? "trophy" : "alert", title: c.passed ? "Contrôle réussi" : "Contrôle à retenter", text: `${n?.title ?? "Notion"}${c.passed ? " : bien joué !" : " : relis le cours puis réessaie."}`, to: `/notion/${c.notionId}` });
  });
  s.exams.filter((e) => e.studentId === u.id && e.status === "done" && e.finishedAt && now - e.finishedAt < 14 * DAY).forEach((e) => {
    out.push({ id: `exam-${e.id}`, ts: e.finishedAt!, kind: "exam", title: "Épreuve terminée", text: `${e.label} : ${e.score ?? 0}/${e.outOf}.`, to: `/epreuve/resultat/${e.id}` });
  });
  if (!u.parentId) out.push({ id: "link-parent", ts: u.createdAt ?? 0, kind: "user", title: "Lie un parent à ton compte", text: "Il pourra suivre tes progrès. Le code se trouve dans son profil.", to: "/profil" });
  return out;
}

function parentNotifs(s: State, u: User, now: number): Notif[] {
  const out: Notif[] = [];
  const today = startOfDay(now);
  s.users.filter((k) => k.parentId === u.id).forEach((k) => {
    const mine = attemptsOf(s, k.id);
    const last = mine.length ? Math.max(...mine.map((a) => a.ts)) : 0;
    const doneToday = mine.filter((a) => dayKey(a.ts) === dayKey(now)).length;
    // une notification par exercice du jour : elle redevient « nouvelle » dès que l'enfant répond, et mène à ses réponses
    if (doneToday > 0) out.push({ id: `kid-today-${k.id}-${today}-${doneToday}`, ts: last, kind: "goal", title: `${k.name} a travaillé aujourd'hui`, text: `${doneToday} ${plural(doneToday, "exercice", "exercices")} (${mine.filter((a) => dayKey(a.ts) === dayKey(now) && a.correct).length} réussis). Voir ses réponses.`, to: `/enfant/${k.id}/reponses` });
    else if (!last) out.push({ id: `kid-none-${k.id}`, ts: k.createdAt ?? 0, kind: "alert", title: `${k.name} n'a pas encore commencé`, text: "Encouragez-le à faire une première série.", to: `/enfant/${k.id}` });
    else if (now - last > 3 * DAY) out.push({ id: `kid-idle-${k.id}-${today}`, ts: today, kind: "alert", title: `${k.name} n'a rien fait depuis ${Math.floor((now - last) / DAY)} jours`, text: "Un petit rappel peut relancer la série.", to: `/enfant/${k.id}` });
    s.checks.filter((c) => c.studentId === k.id && now - c.ts < 14 * DAY).forEach((c) => out.push({ id: `kc-${c.id}`, ts: c.ts, kind: c.passed ? "trophy" : "alert", title: `${k.name} : contrôle ${c.passed ? "réussi" : "à retenter"}`, text: notionById(c.notionId)?.title ?? "Notion", to: `/enfant/${k.id}/progres` }));
    s.exams.filter((e) => e.studentId === k.id && e.status === "done" && e.finishedAt && now - e.finishedAt < 14 * DAY).forEach((e) => out.push({ id: `ke-${e.id}`, ts: e.finishedAt!, kind: "exam", title: `${k.name} a terminé une épreuve`, text: `${e.label} : ${e.score ?? 0}/${e.outOf}.`, to: `/enfant/${k.id}/progres` }));
  });
  const kids = s.users.filter((k) => k.parentId === u.id);
  if (!kids.length) out.push({ id: "no-kid", ts: u.createdAt ?? 0, kind: "user", title: "Aucun enfant ajouté", text: "Ajoutez vos enfants depuis l'accueil : un identifiant et un mot de passe de connexion sont créés pour chacun.", to: "/" });
  else out.push({ id: `kid-access-${kids.length}`, ts: u.createdAt ?? 0, kind: "user", title: kids.length > 1 ? "Vos enfants peuvent se connecter" : `${kids[0].name} peut se connecter`, text: "Sur l'écran de connexion, il saisit son identifiant et son mot de passe, que vous retrouvez sur l'accueil.", to: "/" });
  if (u.paidUntil && u.paidUntil > now && u.paidUntil - now < 7 * DAY) out.push({ id: `plan-${u.paidUntil}`, ts: now - 1, kind: "money", title: "Votre abonnement se termine bientôt", text: `Il expire dans ${Math.ceil((u.paidUntil - now) / DAY)} ${plural(Math.ceil((u.paidUntil - now) / DAY), "jour", "jours")}.` });
  return out;
}

function adminNotifs(s: State, now: number): Notif[] {
  const out: Notif[] = [];
  const pay = (s.payments ?? []).filter((p) => p.status === "pending");
  if (pay.length) out.push({ id: `pay-${pay.length}-${Math.max(...pay.map((p) => p.ts))}`, ts: Math.max(...pay.map((p) => p.ts)), kind: "money", title: `${pay.length} ${plural(pay.length, "paiement à valider", "paiements à valider")}`, text: "Ouvrez l'onglet Paiements pour les traiter.", to: "/" });
  const drafts = LESSONS.filter((l) => l.status === "draft" && !s.validated?.[l.notionId]).length;
  if (drafts) out.push({ id: `drafts-${drafts}`, ts: startOfDay(now), kind: "book", title: `${drafts} ${plural(drafts, "cours à relire", "cours à relire")}`, text: "Validez-les dans l'onglet Pilotage." });
  s.users.filter((x) => x.role !== "admin" && x.createdAt && now - x.createdAt < 7 * DAY).forEach((x) => out.push({ id: `new-${x.id}`, ts: x.createdAt!, kind: "user", title: `Nouvelle inscription : ${x.name}`, text: `${x.role === "parent" ? "Parent" : "Élève"} · ${x.email}` }));
  return out;
}

export function notificationsFor(s: State, u: User, now = Date.now()): Notif[] {
  const list = u.role === "admin" ? adminNotifs(s, now) : u.role === "parent" ? parentNotifs(s, u, now) : studentNotifs(s, u, now);
  return list.sort((a, b) => b.ts - a.ts).slice(0, 12);
}

export const unreadCount = (list: Notif[], seen = 0) => list.filter((n) => n.ts > seen).length;
