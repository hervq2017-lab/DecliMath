// Sujets imprimables : situation de départ → tâche → problèmes (1, 2, 3…) → consignes et questions.
// Les questions viennent des gabarits existants (réponses calculées par le code, donc toujours justes).
import { Answer, instantiate, rng, shuffle, templatesFor } from "./content/core";
import { situationFor, Situation } from "./content/situations";
import { countryByCode, examName, levelById, LevelId, notionById, NOTIONS, Subject, SUBJECT_LABEL } from "./curriculum";
import { examScope } from "./engine";
import { PROBLEMES, Probleme } from "./content/problemes";

export interface PaperQuestion {
  n: string; // « 1.1 »
  text: string;
  points: number;
  choices?: string[];
  unit?: string;
  answer: string;
  solution: string;
}
export interface PaperProblem {
  title: string; // « Problème 1 »
  /** Situation propre au problème (problèmes de synthèse). */
  enonce?: string;
  subtitle?: string;
  competence: string;
  consigne: string;
  questions: PaperQuestion[];
}
export interface Paper {
  kind: "interro" | "examen";
  title: string;
  country: string;
  subjectLabel: string;
  levelLabel: string;
  durationMin: number;
  outOf: 20;
  situation: Situation;
  problems: PaperProblem[];
  presentationPoints: number;
  seed: number;
}

export interface PaperSpec {
  kind: "interro" | "examen";
  country: string;
  level: LevelId;
  subject: Subject;
  /** Chapitre : une notion. Examen : laissé vide, on tire dans le niveau / le cycle. */
  notionId?: string;
  exam?: "level" | "exit";
  seed: number;
}

const CONSIGNES = [
  "Lis attentivement l'énoncé, repère les données utiles, puis rédige ta solution étape par étape.",
  "Justifie chaque calcul ; donne le résultat avec son unité et termine par une phrase de réponse.",
  "Vérifie que ton résultat est vraisemblable avant de passer à la question suivante.",
];

function answerText(a: Answer): { text: string; unit?: string } {
  if (a.kind === "choice") return { text: `${String.fromCharCode(65 + a.index)}. ${a.options[a.index]}` };
  return { text: String(a.value).replace(".", ",") + (a.unit ? ` ${a.unit}` : ""), unit: a.unit };
}

const out0 = (): PaperQuestion[] => [];

function questionsFor(notionId: string, count: number, r: () => number, startAt: number, problemNo: number): PaperQuestion[] {
  // exercices de la notion d'abord, puis ceux des autres notions du même chapitre : les questions d'un problème diffèrent vraiment
  const own = notionById(notionId);
  const byDiff = (ids: string[]) => ids.flatMap((id) => templatesFor(id)).sort((a, b) => a.difficulty - b.difficulty);
  const siblings = own ? NOTIONS.filter((n) => n.id !== notionId && n.subject === own.subject && n.level === own.level && n.chapter === own.chapter).map((n) => n.id) : [];
  const tpls = [...byDiff([notionId]), ...byDiff(siblings)];
  if (!tpls.length) return out0();
  const out: PaperQuestion[] = [];
  for (let k = 0; k < count; k++) {
    const tpl = tpls[(startAt + k) % tpls.length];
    // on privilégie la mise en situation, sinon on alterne les contextes disponibles
    const ctx = (tpl.contexts.find((c) => c.id === "situation") ?? tpl.contexts[Math.floor(r() * tpl.contexts.length)]).id;
    const inst = instantiate(tpl, ctx, 1 + Math.floor(r() * 1e6));
    const ans = answerText(inst.answer);
    out.push({
      n: `${problemNo}.${k + 1}`, text: inst.statement, points: 0, unit: ans.unit,
      choices: inst.answer.kind === "choice" ? inst.answer.options : undefined,
      answer: ans.text, solution: inst.solution,
    });
  }
  return out;
}

export function buildPaper(spec: PaperSpec): Paper {
  const r = rng(spec.seed);
  const lv = levelById(spec.level);
  const country = countryByCode(spec.country);
  let notionIds: string[];
  let nProblems: number;
  let perProblem: number;
  let title: string;
  let duration: number;

  if (spec.kind === "interro" && spec.notionId) {
    notionIds = [spec.notionId, spec.notionId, spec.notionId];
    nProblems = 3; perProblem = 2; duration = 45;
    title = `Interrogation — ${notionById(spec.notionId)?.title ?? ""}`;
  } else {
    const exit = spec.exam === "exit";
    const scope = examScope({ subject: spec.subject, level: spec.level, kind: exit ? "exit" : "level", seed: spec.seed });
    const weighted = shuffle(r, scope.flatMap((s) => Array(s.weight).fill(s.notion.id) as string[]));
    const uniq = [...new Set(weighted)];
    if (!uniq.length) {
      return { kind: "examen", title: SUBJECT_LABEL[spec.subject], country: country.name, subjectLabel: SUBJECT_LABEL[spec.subject], levelLabel: lv.label, durationMin: 0, outOf: 20, situation: { contexte: "", circonstance: "", tache: "" }, problems: [], presentationPoints: 2, seed: spec.seed };
    }
    nProblems = Math.min(exit ? 4 : 3, uniq.length);
    notionIds = uniq.slice(0, nProblems);
    while (notionIds.length < nProblems) notionIds.push(notionIds[notionIds.length - 1]);
    perProblem = exit ? 2 : 2; duration = exit ? 120 : 90;
    const label = exit ? `Examen blanc ${examName(spec.country, spec.level) ?? lv.label}` : `Composition ${lv.label}`;
    title = `${label} — ${SUBJECT_LABEL[spec.subject]}`;
  }

  // Problèmes de synthèse (niveau épreuve) écrits à la main : maths uniquement, quand la classe en possède
  const bank = spec.subject === "maths" ? PROBLEMES.filter((h) => h.level === spec.level) : [];
  let hard: Probleme[] = [];
  if (spec.kind === "interro" && spec.notionId) {
    const ch = notionById(spec.notionId)?.chapter;
    hard = shuffle(r, bank.filter((h) => ch && h.chapters.includes(ch))).slice(0, 1);
  } else {
    hard = shuffle(r, bank).slice(0, Math.min(2, Math.max(0, nProblems - 1)));
  }

  // barème : 18 points sur les problèmes (parts égales par problème), 2 points pour la présentation
  const budget = Math.floor(1800 / nProblems);
  const cents = (list: PaperQuestion[], weights: number[], total: number) => {
    const sum = weights.reduce((x, y) => x + y, 0);
    let left = total;
    list.forEach((q, k) => {
      const c = k === list.length - 1 ? left : Math.floor((total * weights[k]) / sum);
      q.points = c / 100; left -= c;
    });
  };
  const problems: PaperProblem[] = [];
  hard.forEach((h, i) => {
    const qs: PaperQuestion[] = h.questions.map((q, k) => ({ n: `${i + 1}.${k + 1}`, text: q.text, points: 0, answer: q.answer, solution: q.solution }));
    cents(qs, h.questions.map((q) => q.w), budget);
    problems.push({ title: `Problème ${i + 1}`, subtitle: h.titre, enonce: h.enonce, competence: h.chapters.join(", "), consigne: CONSIGNES[i % CONSIGNES.length], questions: qs });
  });
  for (let i = problems.length; i < nProblems; i++) {
    const nid = notionIds[i];
    const questions = questionsFor(nid, perProblem, r, i * perProblem, i + 1);
    cents(questions, questions.map(() => 1), budget);
    const notion = notionById(nid);
    problems.push({ title: `Problème ${i + 1}`, competence: notion ? `${notion.chapter} · ${notion.title}` : "", consigne: CONSIGNES[i % CONSIGNES.length], questions });
  }
  // l'arrondi des problèmes est absorbé par la dernière question pour que le total fasse exactement 18
  const lastQs = problems[problems.length - 1].questions;
  const sumAll = problems.flatMap((p) => p.questions).reduce((x, q) => x + Math.round(q.points * 100), 0);
  lastQs[lastQs.length - 1].points = Math.round((lastQs[lastQs.length - 1].points * 100 + (1800 - sumAll))) / 100;

  const chapter = spec.kind === "interro"
    ? notionById(spec.notionId!)?.chapter ?? ""
    : [...new Set(notionIds.map((n) => notionById(n)?.chapter).filter(Boolean))].join(", ");
  const situation = situationFor({ subject: spec.subject, country: spec.country, levelLabel: lv.label, chapter, problems: nProblems }, r);

  return {
    kind: spec.kind, title, country: country.name, subjectLabel: SUBJECT_LABEL[spec.subject], levelLabel: lv.label,
    durationMin: duration, outOf: 20, situation, problems, presentationPoints: 2, seed: spec.seed,
  };
}
