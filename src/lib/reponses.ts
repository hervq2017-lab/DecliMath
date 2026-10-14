// Réponses de l'élève relues par le parent : énoncé et bonne réponse sont recalculés depuis (modèle, contexte, graine), rien n'est dupliqué.
import { taskOf } from "../engine";
import type { Answer } from "../content/core";
import type { Attempt } from "../store";

export interface AnswerView {
  statement: string;
  given: string;
  expected: string;
  solution?: string;
}

const fmt = (a: Answer) => (a.kind === "choice" ? `${String.fromCharCode(65 + a.index)}. ${a.options[a.index]}` : String(a.value).replace(".", ",") + (a.unit ? ` ${a.unit}` : ""));

/** Reconstitue ce que l'élève a vu et répondu ; null si le modèle d'exercice n'existe plus. */
export function answerView(a: Attempt): AnswerView | null {
  try {
    const { inst } = taskOf({ templateId: a.templateId, ctx: a.ctx, seed: a.seed });
    const raw = (a.given ?? "").trim();
    const given = !raw ? "(sans réponse)" : inst.answer.kind === "choice" ? inst.answer.options[Number(raw)] ?? raw : raw;
    return { statement: inst.statement, given, expected: fmt(inst.answer), solution: inst.solution };
  } catch {
    return null;
  }
}

/** Séries d'exercices : tentatives rapprochées (moins de 30 min d'écart) du même élève. */
export function sessionsOf(list: Attempt[], gap = 30 * 60 * 1000): Attempt[][] {
  const sorted = [...list].sort((a, b) => a.ts - b.ts);
  const out: Attempt[][] = [];
  for (const a of sorted) {
    const cur = out[out.length - 1];
    if (cur && a.ts - cur[cur.length - 1].ts <= gap) cur.push(a); else out.push([a]);
  }
  return out;
}
