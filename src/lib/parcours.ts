// Parcours de progression, récompenses, objectifs de la semaine et « prochaines étapes ».
// Tout est CALCULÉ à partir des traces de l'élève (rien n'est stocké à part) : une récompense ne peut pas être
// obtenue sans l'avoir méritée, et elle ne disparaît pas si l'on change d'appareil.
import { hasContent } from "../engine";
import { notionById, notionsOf, subjectsAt, LevelId } from "../curriculum";
import { cardsForLevel } from "./cards";
import { dueItems, errorGroups, isCardKey, knowledgeMap, knowledgeOf, KLEVELS, memoryOf, NotionKnowledge, recurring, skillKey } from "./knowledge";
import { attemptsOf, dayKey, streak } from "./stats";
import type { State } from "../store";
import { templatesFor } from "../content/core";

export interface Badge { id: string; label: string; desc: string; value: number; goal: number; earned: boolean }

export function badgesFor(s: State, studentId: string, map = knowledgeMap(s, studentId)): Badge[] {
  const att = attemptsOf(s, studentId);
  const good = att.filter((a) => a.correct).length;
  const clean = att.filter((a) => a.correct && !a.solutionViewed && a.helpLevel === 0).length;
  const reviews = memoryOf(s, studentId).reduce((t, m) => t + m.reps + m.lapses, 0);
  const know = [...map.values()];
  const l3 = know.filter((k) => k.level >= 3).length;
  const l4 = know.filter((k) => k.level >= 4).length;
  const resolved = errorGroups(s, studentId).filter((g) => g.resolved).length;
  const sources = new Set((s.evidence ?? []).filter((e) => e.studentId === studentId).map((e) => e.source));
  if (att.some((a) => a.templateId.startsWith("et:"))) sources.add("etapes");
  const bilanBest = Math.max(0, ...s.bilans.filter((b) => b.studentId === studentId).map((b) => (b.items.length ? b.items.filter((i) => i.correct).length / b.items.length : 0)));
  const sims = (s.evidence ?? []).filter((e) => e.studentId === studentId && e.source === "simulation").length;
  const pb = att.filter((a) => a.templateId.startsWith("pb:") && a.correct).length;
  const st = streak(att);
  const B = (id: string, label: string, desc: string, value: number, goal: number): Badge => ({ id, label, desc, value: Math.min(value, goal), goal, earned: value >= goal });
  return [
    B("premier-pas", "Premier pas", "Réussir un premier exercice.", good, 1),
    B("dix-reussites", "En route", "Réussir 10 exercices.", good, 10),
    B("cent-reussites", "Persévérant", "Réussir 100 exercices.", good, 100),
    B("sans-aide", "Tout seul", "Réussir 25 exercices sans aucun indice.", clean, 25),
    B("serie-3", "3 jours de suite", "S'entraîner 3 jours d'affilée.", st, 3),
    B("serie-7", "Une semaine entière", "S'entraîner 7 jours d'affilée.", st, 7),
    B("avance", "Notion avancée", "Atteindre le niveau Avancé sur une notion.", l3, 1),
    B("expert", "Souvenir durable", "Atteindre le niveau Expert : réussir encore après plusieurs jours d'écart.", l4, 1),
    B("reviseur", "Réviseur", "Faire 20 révisions espacées (cartes ou compétences).", reviews, 20),
    B("reparateur", "Réparateur d'erreurs", "Corriger une erreur qui revenait (deux réussites nettes ensuite).", resolved, 1),
    B("bilan", "Bilan réussi", "Réussir au moins 80 % d'un bilan.", Math.round(bilanBest * 100), 80),
    B("explorateur", "Touche-à-tout", "Essayer 5 méthodes différentes (cartes, rappel, jeux, bilan, pas à pas…).", sources.size, 5),
    B("situations", "Pieds sur terre", "Réussir 5 questions de problèmes de la vie réelle.", pb, 5),
    B("simulateur", "Apprenti chercheur", "Terminer 3 simulations.", sims, 3),
  ];
}

export interface Objective { id: string; label: string; value: number; goal: number }

/** Objectifs de la semaine en cours (lundi → dimanche) : réguliers et atteignables. */
export function weeklyObjectives(s: State, studentId: string, now = Date.now()): Objective[] {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  const monday = d.getTime() - ((d.getDay() + 6) % 7) * 864e5;
  const att = attemptsOf(s, studentId).filter((a) => a.ts >= monday);
  const ev = (s.evidence ?? []).filter((e) => e.studentId === studentId && e.ts >= monday);
  const days = new Set([...att.map((a) => dayKey(a.ts)), ...ev.map((e) => dayKey(e.ts))]).size;
  const reviewsDone = ev.filter((e) => e.source === "carte" || e.source === "rappel").length;
  return [
    { id: "jours", label: "S'entraîner 4 jours", value: days, goal: 4 },
    { id: "exos", label: "Réussir 20 exercices", value: att.filter((a) => a.correct).length, goal: 20 },
    { id: "cartes", label: "Revoir 15 cartes", value: reviewsDone, goal: 15 },
  ];
}

/** Niveau d'une notion pour l'élève : « Débutant », « Avancé »… et ce qu'il faut pour monter. */
export function nextStepToward(k: NotionKnowledge): string {
  switch (k.level) {
    case 0: return "Fais un premier exercice pour commencer.";
    case 1: return "Réussis au moins 3 exercices, avec une bonne proportion de réussites, pour passer Intermédiaire.";
    case 2: return "Réussis au moins 5 exercices dans 2 situations différentes, dont un plus difficile, pour passer Avancé.";
    case 3: return "Reviens dans quelques jours et réussis à nouveau, deux fois, pour devenir Expert : c'est la preuve que tu retiens.";
    case 4: return "Tu as atteint le plus haut niveau. Une révision de temps en temps suffit à garder ce souvenir.";
  }
}
export const levelLabel = (k: NotionKnowledge) => KLEVELS[k.level];

// ---------- Prochaines étapes ----------

export interface NextAction { id: string; label: string; why: string; to: string }

/** Ce que l'élève devrait faire maintenant, par ordre d'utilité : révisions dues, erreurs récurrentes, souvenirs à rafraîchir, notions faibles, nouveautés. */
export function nextActions(s: State, studentId: string, level: LevelId, max = 4): NextAction[] {
  const map = knowledgeMap(s, studentId);
  const out: NextAction[] = [];
  const due = dueItems(s, studentId);
  if (due.length) out.push({ id: "due", label: `Réviser ${due.length} élément${due.length > 1 ? "s" : ""}`, why: "Ces notions sont à revoir aujourd'hui pour ne pas les oublier.", to: "/revision" });
  const rec = errorGroups(s, studentId).filter(recurring);
  if (rec.length) out.push({ id: "err", label: "Corriger une erreur qui revient", why: `${rec.length} erreur${rec.length > 1 ? "s" : ""} récurrente${rec.length > 1 ? "s" : ""} repérée${rec.length > 1 ? "s" : ""}.`, to: "/erreurs" });
  const notions = subjectsAt(level).flatMap((su) => notionsOf(su, level)).filter((n) => hasContent(n.id));
  const weak = notions.map((n) => ({ n, k: knowledgeOf(map, n.id) })).filter((x) => x.k.n > 0 && x.k.pKnown < 0.6).sort((a, b) => a.k.pKnown - b.k.pKnown)[0];
  if (weak) out.push({ id: "weak", label: `Renforcer « ${weak.n.title} »`, why: "C'est ta notion la plus fragile en ce moment.", to: `/notion/${encodeURIComponent(weak.n.id)}` });
  const fade = notions.map((n) => ({ n, k: knowledgeOf(map, n.id) })).filter((x) => x.k.toRefresh).sort((a, b) => a.k.retention - b.k.retention)[0];
  if (fade) out.push({ id: "fade", label: `Rafraîchir « ${fade.n.title} »`, why: "Tu la connaissais bien, mais le souvenir s'estompe.", to: `/serie/${encodeURIComponent(fade.n.id)}` });
  const fresh = notions.find((n) => knowledgeOf(map, n.id).n === 0);
  if (fresh) out.push({ id: "new", label: `Découvrir « ${fresh.title} »`, why: "Une notion de ta classe que tu n'as pas encore travaillée.", to: `/notion/${encodeURIComponent(fresh.id)}` });
  return out.slice(0, max);
}

// ---------- Cartes à revoir ----------

/** Nombre de cartes de la classe, et celles qui sont dues ou jamais vues. */
export function deckStats(s: State, studentId: string, level: LevelId, now = Date.now()) {
  const cards = cardsForLevel(level);
  const mem = memoryOf(s, studentId).filter((m) => isCardKey(m.key));
  const seen = new Set(mem.map((m) => m.key));
  const due = mem.filter((m) => m.due <= now && cards.some((c) => c.id === m.key)).length;
  return { total: cards.length, due, unseen: cards.filter((c) => !seen.has(c.id)).length, learned: mem.filter((m) => m.interval >= 7).length };
}

/** Compétences (gabarits) dont la révision est due, avec la notion à laquelle elles appartiennent. */
export function dueSkills(s: State, studentId: string, now = Date.now()) {
  return dueItems(s, studentId, now)
    .filter((m) => m.key.startsWith("s:"))
    .map((m) => ({ item: m, templateId: m.key.slice(2), notion: notionById(m.notionId) }))
    .filter((x) => x.notion && templatesFor(x.notion.id).some((t) => skillKey(t.id) === x.item.key));
}
