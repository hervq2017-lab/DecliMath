// Moteur de suivi des connaissances : le cœur partagé par les 10 méthodes d'apprentissage.
//
// Il lit tout ce que l'élève a fait (tentatives d'exercices + traces des cartes, rappels, jeux, bilans, simulations,
// tuteur, exercices pas à pas) et en déduit, par notion :
//   • la probabilité qu'elle soit acquise (suivi bayésien des connaissances, BKT) ;
//   • la solidité du souvenir dans le temps (courbe d'oubli, renforcée par les révisions espacées) ;
//   • le niveau de progression (Débutant → Expert) ;
//   • les erreurs récurrentes et les éléments à réviser aujourd'hui.
// Toutes les méthodes écrivent ici (recordAttempt / recordEvidence / reviewCard) et lisent ici (knowledgeMap).
import { templateById } from "../content/core";
import { etapeById } from "../content/etapes";
import type { Attempt, Evidence, EvidenceSource, MemItem, State } from "../store";
import { uid, update } from "../store";

export const DAY = 864e5;
const startOfDay = (ts: number) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
const sameDay = (a: number, b: number) => startOfDay(a) === startOfDay(b);

// =====================================================================================
// 1. Observations : tout ce que l'élève a fait, ramené à un score entre 0 et 1
// =====================================================================================

export interface Obs {
  ts: number;
  notionId: string;
  /** 1 = réussi du premier coup sans aide ; 0 = raté. Entre les deux : réussi avec aide. */
  score: number;
  ctx: string;
  difficulty: number;
}

/** Score d'une tentative d'exercice : l'aide et le corrigé réduisent la valeur d'une réussite. */
export function attemptScore(a: Pick<Attempt, "correct" | "near" | "helpLevel" | "solutionViewed">): number {
  if (a.correct) return a.solutionViewed ? 0.4 : a.helpLevel > 0 ? Math.max(0.55, 1 - 0.15 * a.helpLevel) : 1;
  return a.near ? 0.2 : 0;
}

function difficultyOf(templateId: string): number {
  if (templateId.startsWith("et:")) return etapeById(templateId.slice(3))?.difficulty ?? 2;
  if (templateId.startsWith("pb:")) return 2;
  return templateById(templateId)?.difficulty ?? 2;
}

export function observations(s: State, studentId: string): Obs[] {
  const out: Obs[] = [];
  for (const a of s.attempts) {
    if (a.studentId !== studentId) continue;
    out.push({ ts: a.ts, notionId: a.notionId, score: attemptScore(a), ctx: a.ctx, difficulty: difficultyOf(a.templateId) });
  }
  for (const e of s.evidence ?? []) {
    // Les étapes détaillées servent au diagnostic des erreurs ; la réussite globale de l'exercice est déjà dans les tentatives.
    if (e.studentId !== studentId || e.source === "etapes") continue;
    out.push({ ts: e.ts, notionId: e.notionId, score: e.score, ctx: e.source, difficulty: 2 });
  }
  return out.sort((x, y) => x.ts - y.ts);
}

// =====================================================================================
// 2. Suivi bayésien des connaissances (BKT)
// =====================================================================================

export const BKT = { init: 0.15, learn: 0.16, slip: 0.1, guess: 0.2 };

/** Met à jour P(connu) après une observation. Une réussite aidée est moins probante (elle peut être due à l'aide). */
export function bktUpdate(p: number, score: number): number {
  const correct = score >= 0.5;
  const guess = Math.min(0.6, BKT.guess + (1 - score) * 0.35);
  const post = correct
    ? (p * (1 - BKT.slip)) / (p * (1 - BKT.slip) + (1 - p) * guess)
    : (p * BKT.slip) / (p * BKT.slip + (1 - p) * (1 - BKT.guess));
  return post + (1 - post) * BKT.learn;
}

export const KLEVELS = ["Non commencé", "Débutant", "Intermédiaire", "Avancé", "Expert"] as const;
export type KLevel = 0 | 1 | 2 | 3 | 4;

export interface NotionKnowledge {
  notionId: string;
  n: number;
  pKnown: number;
  /** 0..1 : à quel point le souvenir est encore frais (courbe d'oubli). */
  retention: number;
  /** Connaissance utilisable aujourd'hui = acquis × souvenir. */
  strength: number;
  lastTs: number;
  /** Réussites séparées d'au moins un jour : preuve que la notion tient dans le temps. */
  spaced: number;
  contexts: number;
  level: KLevel;
  /** Le souvenir s'estompe : une petite révision suffit. */
  toRefresh: boolean;
}

const EMPTY = (notionId: string): NotionKnowledge => ({ notionId, n: 0, pKnown: 0, retention: 0, strength: 0, lastTs: 0, spaced: 0, contexts: 0, level: 0, toRefresh: false });

export function notionKnowledge(list: Obs[], notionId: string, now = Date.now()): NotionKnowledge {
  if (!list.length) return EMPTY(notionId);
  let p = BKT.init;
  let spaced = 0;
  let lastSuccess = 0;
  let cleanHard = false;
  let maxDiff = 1;
  const ctx = new Set<string>();
  for (const o of list) {
    p = bktUpdate(p, o.score);
    ctx.add(o.ctx);
    maxDiff = Math.max(maxDiff, o.difficulty);
    if (o.score >= 0.75) {
      if (lastSuccess && o.ts - lastSuccess >= 20 * 3600e3) spaced++;
      lastSuccess = o.ts;
      if (o.difficulty >= 2) cleanHard = true;
    }
  }
  const lastTs = list[list.length - 1].ts;
  const stability = Math.min(240, 4 * 2 ** spaced); // jours
  const retention = Math.exp(-Math.max(0, now - lastTs) / DAY / stability);
  const n = list.length;
  let level: KLevel = 1;
  if (n >= 3 && p >= 0.5) level = 2;
  if (n >= 5 && p >= 0.8 && ctx.size >= 2 && (cleanHard || maxDiff <= 1)) level = 3;
  if (level === 3 && spaced >= 2) level = 4;
  return { notionId, n, pKnown: p, retention, strength: p * retention, lastTs, spaced, contexts: ctx.size, level, toRefresh: p >= 0.5 && retention < 0.6 };
}

/** Connaissance de toutes les notions travaillées par l'élève. */
export function knowledgeMap(s: State, studentId: string, now = Date.now()): Map<string, NotionKnowledge> {
  const by = new Map<string, Obs[]>();
  for (const o of observations(s, studentId)) { const l = by.get(o.notionId); if (l) l.push(o); else by.set(o.notionId, [o]); }
  const out = new Map<string, NotionKnowledge>();
  for (const [id, list] of by) out.set(id, notionKnowledge(list, id, now));
  return out;
}
export const knowledgeOf = (map: Map<string, NotionKnowledge>, notionId: string) => map.get(notionId) ?? EMPTY(notionId);

/** Moyenne de la connaissance utilisable sur un groupe de notions (non commencées = 0). */
export function averageStrength(map: Map<string, NotionKnowledge>, notionIds: string[]): number {
  if (!notionIds.length) return 0;
  return notionIds.reduce((t, id) => t + knowledgeOf(map, id).strength, 0) / notionIds.length;
}

// =====================================================================================
// 3. Révisions espacées (variante de SM-2)
// =====================================================================================

/** Note de qualité 0-5 : 5 = facile, 4 = bien, 3 = difficile mais juste, ≤2 = échec. */
export function attemptQuality(a: Pick<Attempt, "correct" | "near" | "helpLevel" | "solutionViewed">): number {
  if (!a.correct) return a.near ? 2 : 1;
  if (a.solutionViewed) return 2;
  return a.helpLevel === 0 ? 5 : a.helpLevel === 1 ? 4 : 3;
}

/** Calcule le prochain passage. Un échec ramène à demain ; une réussite espace davantage (1 j, 3 j, puis ×facilité). */
export function nextReview(prev: MemItem | undefined, q: number, now: number, base: Pick<MemItem, "key" | "studentId" | "notionId">): MemItem {
  const it: MemItem = prev ?? { ...base, due: now, interval: 0, ease: 2.5, reps: 0, lapses: 0, last: 0 };
  if (prev && q >= 3 && sameDay(prev.last, now)) return { ...prev, last: now }; // plusieurs essais le même jour = une seule révision
  if (q < 3) {
    return { ...it, reps: 0, interval: 1, ease: Math.max(1.3, it.ease - 0.2), lapses: it.lapses + 1, last: now, due: startOfDay(now) + DAY };
  }
  const reps = it.reps + 1;
  const ease = Math.max(1.3, it.ease + (q === 5 ? 0.1 : q === 4 ? 0 : -0.15));
  const interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(it.interval * (q === 3 ? 1.2 : ease));
  return { ...it, reps, ease, interval, last: now, due: startOfDay(now) + interval * DAY };
}

const memKey = (studentId: string, key: string) => `${studentId}|${key}`;
export const skillKey = (templateId: string) => `s:${templateId}`;

/** Enregistre une tentative d'exercice : la trace, le diagnostic d'erreur et le planning de révision de la compétence. */
export function recordAttempt(a: Omit<Attempt, "ts">) {
  const ts = Date.now();
  update((s) => {
    const memory = { ...s.memory };
    if (a.kind !== "placement" && templateById(a.templateId)) {
      const k = memKey(a.studentId, skillKey(a.templateId));
      memory[k] = nextReview(memory[k], attemptQuality(a), ts, { key: skillKey(a.templateId), studentId: a.studentId, notionId: a.notionId });
    }
    return { ...s, attempts: [...s.attempts, { ...a, ts }], memory };
  });
}

/** Enregistre une trace d'apprentissage hors exercice (carte, rappel, jeu, bilan, simulation, tuteur, étape). */
export function recordEvidence(e: Omit<Evidence, "id" | "ts">) {
  update((s) => ({ ...s, evidence: [...(s.evidence ?? []), { ...e, id: uid(), ts: Date.now() }] }));
}

/** Note d'une carte : 1 = à revoir, 2 = difficile, 3 = bien, 4 = facile. */
export type Rating = 1 | 2 | 3 | 4;
export const RATING_LABEL: Record<Rating, string> = { 1: "À revoir", 2: "Difficile", 3: "Bien", 4: "Facile" };
const RATING_Q: Record<Rating, number> = { 1: 1, 2: 3, 3: 4, 4: 5 };
const RATING_SCORE: Record<Rating, number> = { 1: 0, 2: 0.55, 3: 0.85, 4: 1 };

export function reviewCard(studentId: string, card: { id: string; notionId: string }, rating: Rating, source: Extract<EvidenceSource, "carte" | "rappel"> = "carte") {
  const ts = Date.now();
  update((s) => {
    const k = memKey(studentId, card.id);
    return {
      ...s,
      memory: { ...s.memory, [k]: nextReview(s.memory[k], RATING_Q[rating], ts, { key: card.id, studentId, notionId: card.notionId }) },
      evidence: [...(s.evidence ?? []), { id: uid(), studentId, notionId: card.notionId, source, score: RATING_SCORE[rating], ts }],
    };
  });
}

export const memoryOf = (s: State, studentId: string) => Object.values(s.memory ?? {}).filter((m) => m.studentId === studentId);
export const dueItems = (s: State, studentId: string, now = Date.now()) => memoryOf(s, studentId).filter((m) => m.due <= now).sort((a, b) => a.due - b.due);
export const isCardKey = (key: string) => key.startsWith("c:");

/** Texte « demain », « dans 3 jours »… pour le prochain passage. */
export function dueLabel(due: number, now = Date.now()): string {
  const d = Math.round((startOfDay(due) - startOfDay(now)) / DAY);
  if (d <= 0) return "aujourd'hui";
  if (d === 1) return "demain";
  if (d < 14) return `dans ${d} jours`;
  if (d < 60) return `dans ${Math.round(d / 7)} semaines`;
  return `dans ${Math.round(d / 30)} mois`;
}

// =====================================================================================
// 4. Erreurs récurrentes
// =====================================================================================

export interface ErrorGroup {
  tag: string;
  notionId: string;
  count: number;
  last: number;
  /** Exercice (gabarit ou exercice pas à pas) où l'erreur a eu lieu : sert à proposer des exercices ciblés. */
  templateId?: string;
  /** Résolue = au moins deux réussites nettes sur la notion depuis la dernière occurrence. */
  resolved: boolean;
}

export function errorGroups(s: State, studentId: string): ErrorGroup[] {
  const groups = new Map<string, ErrorGroup>();
  const push = (tag: string, notionId: string, ts: number, templateId?: string) => {
    const k = `${notionId}|${tag}`;
    const g = groups.get(k) ?? { tag, notionId, count: 0, last: 0, templateId, resolved: false };
    g.count++;
    if (ts >= g.last) { g.last = ts; g.templateId = templateId ?? g.templateId; }
    groups.set(k, g);
  };
  for (const a of s.attempts) if (a.studentId === studentId && !a.correct && a.errTag) push(a.errTag, a.notionId, a.ts, a.templateId);
  for (const e of s.evidence ?? []) if (e.studentId === studentId && e.errTag && e.score < 0.5) push(e.errTag, e.notionId, e.ts, e.ref);
  const obs = observations(s, studentId);
  for (const g of groups.values()) g.resolved = obs.filter((o) => o.notionId === g.notionId && o.ts > g.last && o.score >= 0.75).length >= 2;
  return [...groups.values()].sort((a, b) => Number(a.resolved) - Number(b.resolved) || b.count - a.count || b.last - a.last);
}
/** Erreur « récurrente » : revenue au moins deux fois et pas encore corrigée. */
export const recurring = (g: ErrorGroup) => g.count >= 2 && !g.resolved;
