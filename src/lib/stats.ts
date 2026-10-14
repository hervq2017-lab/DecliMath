import { templatesFor } from "../content/core";
import { NOTIONS } from "../curriculum";
import type { Attempt, State } from "../store";

const DAY = 864e5;
export const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Points d'effort : réussite 20 (10 si corrigé vu), « presque » 10, erreur 0 : jamais de points perdus. */
export const pointsOf = (a: Attempt) => (a.correct ? (a.solutionViewed ? 10 : 20) : a.near ? 10 : 0);

export const attemptsOf = (s: State, id: string) => s.attempts.filter((a) => a.studentId === id);

export function streak(list: Attempt[], now = Date.now()) {
  const days = new Set(list.map((a) => dayKey(a.ts)));
  let t = startOfDay(now);
  if (!days.has(dayKey(t))) t -= DAY; // la série tient jusqu'à la fin de la journée
  let n = 0;
  while (days.has(dayKey(t))) {
    n++;
    t -= DAY;
  }
  return n;
}

/** Semaine en cours, lundi → dimanche. */
export function weekDays(list: Attempt[], now = Date.now()) {
  const today = startOfDay(now);
  const dow = (new Date(today).getDay() + 6) % 7; // 0 = lundi
  const monday = today - dow * DAY;
  return Array.from({ length: 7 }, (_, i) => {
    const t = monday + i * DAY;
    const inDay = list.filter((a) => dayKey(a.ts) === dayKey(t));
    return { label: "LMMJVSD"[i], date: new Date(t).getDate(), active: inDay.length > 0, today: i === dow, future: t > today, points: inDay.reduce((s, a) => s + pointsOf(a), 0) };
  });
}

export function weekTrend(list: Attempt[], now = Date.now()) {
  const sum = (from: number, to: number) => list.filter((a) => a.ts >= from && a.ts < to).reduce((s, a) => s + pointsOf(a), 0);
  const end = startOfDay(now) + DAY;
  const cur = sum(end - 7 * DAY, end), prev = sum(end - 14 * DAY, end - 7 * DAY);
  return { cur, prev, pct: prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null };
}

/** Durée estimée : somme des écarts entre tentatives (plafonnés à 3 min) + 1 min par début de séance. */
export function minutesSpent(list: Attempt[]) {
  const ts = list.map((a) => a.ts).sort((a, b) => a - b);
  let ms = 0;
  ts.forEach((t, i) => {
    const gap = i === 0 ? Infinity : t - ts[i - 1];
    ms += gap > 10 * 60000 ? 60000 : Math.min(gap, 3 * 60000);
  });
  return Math.round(ms / 60000);
}

// ---------- Exercices ciblés = gabarit × contexte ----------

export interface Item {
  key: string;
  templateId: string;
  ctx: string;
  label: string;
  difficulty: number;
}
export const itemsFor = (notionId: string): Item[] =>
  templatesFor(notionId).flatMap((t) =>
    t.contexts.map((c) => ({ key: `${t.id}|${c.id}`, templateId: t.id, ctx: c.id, label: t.skill ? `${t.skill} — ${c.label}` : c.label, difficulty: t.difficulty })),
  );

// ---------- Compétences : s'exercer à fond jusqu'à maîtriser ----------

/** Une série = 10 exercices ; compétence maîtrisée = au moins 8 sur 10 réussis du premier coup et sans indice. */
export const SKILL_ROUND = 10;
export const SKILL_GOAL = 8;

export interface SkillInfo {
  templateId: string;
  notionId: string;
  label: string;
  ref?: string;
  difficulty: number;
}
export const skillsFor = (notionId: string): SkillInfo[] =>
  templatesFor(notionId).map((t) => ({
    templateId: t.id, notionId, label: t.skill ?? notionTitle(notionId), ref: t.ref, difficulty: t.difficulty,
  }));

/**
 * Résultats des 10 derniers exercices distincts de la compétence (un exercice = une graine).
 * Réussi = premier essai juste, sans indice ni corrigé : c'est ce qui prouve que la notion est acquise.
 */
export function skillProgress(list: Attempt[], templateId: string) {
  const first = new Map<number, Attempt>();
  for (const a of [...list].filter((x) => x.templateId === templateId && x.kind === "practice").sort((x, y) => x.ts - y.ts)) {
    if (!first.has(a.seed)) first.set(a.seed, a);
  }
  const last = [...first.values()].slice(-SKILL_ROUND);
  const results = last.map((a) => a.correct && a.helpLevel === 0 && !a.solutionViewed);
  const ok = results.filter(Boolean).length;
  const total = first.size;
  return {
    results, ok, total,
    mastered: results.length >= SKILL_ROUND && ok >= SKILL_GOAL,
    started: total > 0,
  };
}

export type ItemState = "done" | "review" | "new";
export function itemState(list: Attempt[], item: Item): ItemState {
  const mine = list.filter((a) => a.templateId === item.templateId && a.ctx === item.ctx);
  if (mine.some((a) => a.correct)) return "done";
  return mine.length ? "review" : "new";
}

/** Avancement d'une notion = moyenne, sur ses compétences, de la part de l'objectif de maîtrise atteinte (8 réussites sans aide sur les 10 derniers exercices). */
export function notionPercent(list: Attempt[], notionId: string) {
  const tpls = templatesFor(notionId);
  if (!tpls.length) return 0;
  const sum = tpls.reduce((acc, t) => acc + Math.min(1, skillProgress(list, t.id).ok / SKILL_GOAL), 0);
  return Math.round((sum / tpls.length) * 100);
}

export function progressLabel(pct: number, status: string): string {
  if (status === "expert" || status === "mastered") return "Maîtrisé";
  if (status === "none") return "Nouveau";
  if (status === "fragile") return "À revoir";
  if (pct >= 80) return "Presque !";
  if (pct === 0) return "En cours";
  return `${pct} %`;
}

// ---------- Historique ----------

export function history(list: Attempt[]) {
  const map = new Map<string, { notionId: string; day: number; count: number; points: number; ts: number }>();
  for (const a of list) {
    if (a.kind === "placement") continue;
    const k = `${a.notionId}|${dayKey(a.ts)}`;
    const e = map.get(k) ?? { notionId: a.notionId, day: startOfDay(a.ts), count: 0, points: 0, ts: 0 };
    e.count++;
    e.points += pointsOf(a);
    e.ts = Math.max(e.ts, a.ts);
    map.set(k, e);
  }
  return [...map.values()].sort((a, b) => b.ts - a.ts);
}

export function relativeDay(ts: number, now = Date.now()) {
  const diff = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  if (diff <= 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return new Date(ts).toLocaleDateString("fr-FR", { weekday: "short" }).replace(/^./, (c) => c.toUpperCase());
}

export const notionTitle = (id: string) => NOTIONS.find((n) => n.id === id)?.title ?? id;

// ---------- Courbe de progrès (7 jours / 30 jours / 3 mois) ----------

export type Range = "7" | "30" | "90";
const MONTHS_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

/** Points d'effort par point de la courbe : jour (7 j, 30 j) ou semaine (3 mois). */
export function pointsSeries(list: Attempt[], range: Range, now = Date.now()) {
  const today = startOfDay(now);
  const sumDay = (t: number, days = 1) => list.filter((a) => a.ts >= t && a.ts < t + days * DAY).reduce((s, a) => s + pointsOf(a), 0);
  if (range === "7") {
    const w = weekDays(list, now);
    return w.map((d, i) => ({ label: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i], value: d.points, future: d.future }));
  }
  if (range === "30") {
    return Array.from({ length: 30 }, (_, i) => {
      const t = today - (29 - i) * DAY;
      const d = new Date(t);
      return { label: i % 5 === 4 || i === 0 ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}` : "", value: sumDay(t), future: false };
    });
  }
  return Array.from({ length: 13 }, (_, i) => {
    const t = today - (12 - i) * 7 * DAY - 6 * DAY;
    const d = new Date(t);
    return { label: i % 2 === 0 ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}` : "", value: sumDay(t, 7), future: false };
  });
}

/** Total sur la période et évolution par rapport à la période précédente de même durée. */
export function rangeTotal(list: Attempt[], range: Range, now = Date.now()) {
  const n = Number(range);
  const end = startOfDay(now) + DAY;
  const sum = (from: number, to: number) => list.filter((a) => a.ts >= from && a.ts < to).reduce((s, a) => s + pointsOf(a), 0);
  const cur = sum(end - n * DAY, end), prev = sum(end - 2 * n * DAY, end - n * DAY);
  return { cur, pct: prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null };
}

export const LEVEL_STEPS = [
  { name: "Débutant", from: 0 }, { name: "Confirmé", from: 500 }, { name: "Expert", from: 1500 }, { name: "Maître", from: 3000 },
];
/** Niveau d'effort selon le total de points depuis le début. */
export function effortLevel(total: number) {
  let i = 0;
  while (i < LEVEL_STEPS.length - 1 && total >= LEVEL_STEPS[i + 1].from) i++;
  const next = LEVEL_STEPS[i + 1];
  return { name: LEVEL_STEPS[i].name, next: next?.name ?? null, floor: LEVEL_STEPS[i].from, ceil: next?.from ?? total, pct: next ? Math.round(((total - LEVEL_STEPS[i].from) / (next.from - LEVEL_STEPS[i].from)) * 100) : 100 };
}

export const timeLabel = (ts: number) => new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
