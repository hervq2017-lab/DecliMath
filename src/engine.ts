import "./content/maths-primaire";
import "./content/maths-secondaire";
import "./content/ciam-6e-geo";
import "./content/ciam-6e-num";
import "./content/ciam-5e-geo";
import "./content/ciam-5e-num";
import "./content/ciam-4e-num";
import "./content/ciam-4e-geo";
import "./content/ciam-3e-num";
import "./content/ciam-3e-geo";
import "./content/ciam-2nde-s";
import "./content/ciam-2nde-s-geo";
import "./content/ciam-2nde-s-vec";
import "./content/ciam-1ere";
import "./content/ciam-tle";
import "./content/problemes-situes";
import "./content/physique";
import "./content/anglais";
import "./content/anglais-verbes";
import "./content/anglais-initiation";
import {
  CYCLE_EXIT, levelById, LevelId, levelIndex, LEVELS, Notion, NOTIONS, notionsOf, Subject, subjectsAt,
} from "./curriculum";
import { instantiate, REGISTRY, rng, shuffle, Template, templateById, templatesFor } from "./content/core";

export { REGISTRY, templateById, templatesFor, instantiate };

export interface Task {
  templateId: string;
  ctx: string;
  seed: number;
}

export const taskOf = (t: Task) => {
  const tpl = templateById(t.templateId)!;
  return { tpl, inst: instantiate(tpl, t.ctx, t.seed) };
};

// ---------- Couverture ----------

export function coverage() {
  const rows = NOTIONS.map((n) => ({ n, templates: templatesFor(n.id).length }));
  const covered = rows.filter((r) => r.templates > 0).length;
  return { total: NOTIONS.length, covered, rows };
}
export const hasContent = (notionId: string) => templatesFor(notionId).length > 0;

// ---------- Entraînement ----------

/** Prochaine tâche : alterne les contextes pour que l'élève rencontre des scènes différentes. */
export function nextPractice(notionId: string, history: Task[]): Task | null {
  const tpls = templatesFor(notionId);
  if (!tpls.length) return null;
  const tpl = tpls[history.length % tpls.length];
  const seen = new Set(history.filter((h) => h.templateId === tpl.id).map((h) => h.ctx));
  const ctx = tpl.contexts.find((c) => !seen.has(c.id))?.id ?? tpl.contexts[history.length % tpl.contexts.length].id;
  return { templateId: tpl.id, ctx, seed: 1 + Math.floor(Math.random() * 1e6) };
}

/**
 * Série de 10 exercices sur UNE compétence : mêmes savoir-faire, valeurs et situations différentes.
 * Deux exercices d'une même série n'ont jamais le même énoncé (si le gabarit le permet).
 */
export function buildDrill(templateId: string, n = 10): Task[] {
  const tpl = templateById(templateId);
  if (!tpl) return [];
  const ctxs = shuffle(rng(Date.now() % 1e9), tpl.contexts.map((c) => c.id));
  const seen = new Set<string>();
  const out: Task[] = [];
  for (let tries = 0; out.length < n && tries < n * 60; tries++) {
    const ctx = ctxs[out.length % ctxs.length];
    const seed = 1 + Math.floor(Math.random() * 1e6);
    const inst = instantiate(tpl, ctx, seed);
    const sig = `${ctx}|${inst.statement}|${inst.answer.kind === "choice" ? [...inst.answer.options].sort().join("¦") : ""}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push({ templateId, ctx, seed });
  }
  while (out.length < n) out.push({ templateId, ctx: ctxs[out.length % ctxs.length], seed: 1 + Math.floor(Math.random() * 1e6) });
  return out;
}

/**
 * « Vérifier que j'ai compris » : 2 contextes × 2 jeux de valeurs, sans aide.
 * L'élève a compris s'il réussit au moins 3 sur 4, dont les deux contextes.
 */
export function buildCheck(notionId: string, seed: number): Task[] {
  const tpls = templatesFor(notionId);
  if (!tpls.length) return [];
  const r = rng(seed);
  const tpl = tpls[Math.floor(r() * tpls.length)];
  const ctxs = shuffle(r, tpl.contexts.map((c) => c.id)).slice(0, 2);
  const out: Task[] = [];
  for (const ctx of ctxs) for (let k = 0; k < 2; k++) out.push({ templateId: tpl.id, ctx, seed: 1 + Math.floor(r() * 1e6) });
  return out;
}
export function checkPassed(results: { ctx: string; correct: boolean }[]) {
  const ok = results.filter((x) => x.correct).length;
  const ctxOk = new Set(results.filter((x) => x.correct).map((x) => x.ctx));
  const ctxAll = new Set(results.map((x) => x.ctx));
  return results.length >= 2 && ok >= Math.ceil(results.length * 0.75) && ctxOk.size === ctxAll.size;
}

// ---------- Épreuves ----------

export interface ExamItem extends Task {
  notionId: string;
  points: number;
}
export interface ExamSpec {
  subject: Subject;
  level: LevelId;
  kind: "level" | "exit"; // « exit » = examen de fin de cycle
  seed: number;
}

/** Notions disponibles pour un examen : niveau courant ; pour un examen de fin de cycle, tout le cycle (poids décroissant). */
export function examScope(spec: ExamSpec): { notion: Notion; weight: number }[] {
  const lv = levelById(spec.level);
  const levels = spec.kind === "exit"
    ? LEVELS.filter((l) => l.cycle === lv.cycle && levelIndex(l.id) <= levelIndex(spec.level))
    : [lv];
  return levels.flatMap((l) =>
    notionsOf(spec.subject, l.id)
      .filter((n) => templatesFor(n.id).length)
      .map((notion) => ({ notion, weight: l.id === spec.level ? 3 : 1 })),
  );
}

/** Une épreuve sur 20 : 1 question par notion couverte, complétée en variant contextes et valeurs. */
export function buildExam(spec: ExamSpec): { items: ExamItem[]; durationMin: number; outOf: number } {
  const scope = examScope(spec);
  if (!scope.length) return { items: [], durationMin: 0, outOf: 20 };
  const r = rng(spec.seed);
  const target = Math.min(Math.max(scope.length, 6), spec.kind === "exit" ? 14 : 10);
  const picked: Notion[] = [];
  const pool = shuffle(r, scope.flatMap((s) => Array(s.weight).fill(s.notion) as Notion[]));
  // d'abord une question par notion, puis on complète selon le poids
  for (const s of shuffle(r, scope)) if (picked.length < target) picked.push(s.notion);
  for (const n of pool) if (picked.length < target) picked.push(n);
  const per = Math.floor((2000 / picked.length)) / 100;
  const items: ExamItem[] = picked.map((n, idx) => {
    const tpls = templatesFor(n.id);
    const tpl: Template = tpls[Math.floor(r() * tpls.length)];
    const ctx = tpl.contexts[Math.floor(r() * tpl.contexts.length)].id;
    return { notionId: n.id, templateId: tpl.id, ctx, seed: 1 + Math.floor(r() * 1e6) + idx, points: per };
  });
  items[items.length - 1].points = round2(20 - per * (items.length - 1)); // la dernière question absorbe l'arrondi
  return { items, durationMin: Math.max(20, items.length * 6), outOf: 20 };
}
const round2 = (x: number) => Math.round(x * 100) / 100;

export function availableSubjects(level: LevelId) {
  return subjectsAt(level);
}
export const isExitLevel = (level: LevelId) => CYCLE_EXIT[levelById(level).cycle] === level;

// ---------- Séances (design « série de 6 exercices ») ----------

import { itemsFor, itemState } from "./lib/stats";
import type { Attempt } from "./store";

const rnd = () => 1 + Math.floor(Math.random() * 1e6);

/** Série pour une notion : exercices non réussis d'abord (nouveaux/à revoir), puis révisions avec de nouvelles valeurs. */
export function buildSession(list: Attempt[], notionId: string, first?: { templateId: string; ctx: string }, n = 6): Task[] {
  const items = itemsFor(notionId);
  if (!items.length) return [];
  const rank = { review: 0, new: 1, done: 2 } as const;
  const ordered = [...items].sort((a, b) => rank[itemState(list, a)] - rank[itemState(list, b)]);
  if (first) {
    const i = ordered.findIndex((x) => x.templateId === first.templateId && x.ctx === first.ctx);
    if (i > 0) ordered.unshift(...ordered.splice(i, 1));
  }
  return Array.from({ length: n }, (_, k) => {
    const it = ordered[k % ordered.length];
    return { templateId: it.templateId, ctx: it.ctx, seed: rnd() };
  });
}

/** Défi effort : 5 exercices variés sur les notions les plus fragiles du niveau. */
export function buildChallenge(list: Attempt[], subject: Subject, level: LevelId, n = 5): Task[] {
  const notions = notionsOf(subject, level).filter((x) => templatesFor(x.id).length);
  if (!notions.length) return [];
  const score = (id: string) => {
    const mine = list.filter((a) => a.notionId === id);
    return mine.length ? mine.filter((a) => a.correct).length / mine.length : 0.5;
  };
  const sorted = [...notions].sort((a, b) => score(a.id) - score(b.id));
  return Array.from({ length: n }, (_, k) => {
    const items = itemsFor(sorted[k % sorted.length].id);
    const it = items[Math.floor(Math.random() * items.length)];
    return { templateId: it.templateId, ctx: it.ctx, seed: rnd() };
  });
}

/** Test de positionnement : 5 notions différentes du niveau, une question chacune, sans note. */
export function buildPlacement(level: LevelId): (Task & { notionId: string })[] {
  const pool = [...notionsOf("maths", level), ...notionsOf("physique", level)].filter((x) => templatesFor(x.id).length);
  const fallback = LEVELS.slice(0, levelIndex(level)).reverse().flatMap((l) => notionsOf("maths", l.id)).filter((x) => templatesFor(x.id).length);
  const chosen = shuffle(rng(Date.now() % 1e6), pool).concat(fallback).slice(0, 5);
  return chosen.map((nn) => {
    const t = templatesFor(nn.id)[0];
    return { notionId: nn.id, templateId: t.id, ctx: t.contexts[0].id, seed: rnd() };
  });
}
