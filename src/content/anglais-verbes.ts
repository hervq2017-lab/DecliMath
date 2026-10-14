// Gabarits d'exercices sur les verbes anglais (réguliers et irréguliers), 6ème → Terminale.
// Les réponses sont calculées à partir de la table de verbes : elles sont donc toujours justes.
import { Answer, ContextDef, Instance, N, pick, register, Rng, shuffle, Template } from "./core";
import { irregularsUpTo, regularsUpTo, TIER_OF_LEVEL, Verbe } from "./verbes";
import type { LevelId } from "../curriculum";

const LEVELS = ["6e", "5e", "4e", "3e", "2nde", "1ere", "tle"] as const;
const SUBJ = ["Awa", "Moussa", "my sister", "the teacher", "Kofi", "we", "they", "Fatou"];
const PLURAL = new Set(["we", "they"]);
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
const WHEN = ["Yesterday", "Last week", "Two days ago", "Last year", "Last night", "In 2019"];

const form = (v: Verbe, kind: "past" | "pp") => (kind === "past" ? v.past : v.pp);
const naive = (inf: string) => (inf.endsWith("e") ? `${inf}d` : `${inf}ed`);

function choices(r: Rng, correct: string, wrong: string[], filler: string[]): { options: string[]; index: number } {
  const set = new Set<string>();
  for (const w of wrong) if (w && w !== correct) set.add(w);
  for (const f of shuffle(r, filler)) if (set.size < 3 && f !== correct) set.add(f);
  const options = shuffle(r, [correct, ...[...set].slice(0, 3)]);
  return { options, index: options.indexOf(correct) };
}
const choiceAnswer = (c: { options: string[]; index: number }): Answer => ({ kind: "choice", options: c.options, index: c.index });
const fullLine = (v: Verbe) => `${v.inf} – ${v.past} – ${v.pp} (${v.fr})`;

const HINTS = (tip: string, last: string): [string, string, string, string] => [
  "Look at the time marker or the auxiliary in the sentence.",
  tip,
  "Think of the three forms of the verb: base form, past simple, past participle.",
  last,
];

function irregularTemplate(level: LevelId): Template {
  const tier = TIER_OF_LEVEL[level] ?? 4;
  const pool = irregularsUpTo(tier);
  const contexts: ContextDef[] = [
    { id: "past", label: "Past simple" },
    { id: "participle", label: "Past participle" },
    { id: "meaning", label: "Meaning" },
  ];
  return {
    id: `a-${level}-irr`, notionId: N("anglais", level, "Irregular verbs : forms"), difficulty: tier <= 1 ? 1 : tier <= 3 ? 2 : 3, contexts,
    gen(ctx, r): Instance {
      const v = pick(r, pool);
      const others = pool.filter((x) => x.inf !== v.inf);
      if (ctx === "meaning") {
        const toFrench = r() < 0.5;
        if (toFrench) {
          const c = choices(r, v.fr, others.map((o) => o.fr), others.map((o) => o.fr));
          return { statement: `What does « ${v.inf} » mean in French?`, answer: choiceAnswer(c), hints: HINTS("Eliminate the meanings that clearly belong to other verbs.", `« ${v.inf} » = ${v.fr}.`), solution: `${fullLine(v)}.` };
        }
        const c = choices(r, v.inf, others.map((o) => o.inf), others.map((o) => o.inf));
        return { statement: `Which English verb means « ${v.fr} »?`, answer: choiceAnswer(c), hints: HINTS("Think of the English verb you already know for this action.", `The base form is « ${v.inf} ».`), solution: `${fullLine(v)}.` };
      }
      const kind = ctx === "past" ? "past" : "pp";
      const wrong = kind === "past"
        ? [v.inf, v.pp, naive(v.inf), ...others.slice(0, 6).map((o) => o.past)]
        : [v.inf, v.past, naive(v.inf), `${v.inf}ing`, ...others.slice(0, 6).map((o) => o.pp)];
      const c = choices(r, form(v, kind), wrong, others.map((o) => form(o, kind)));
      const subj = pick(r, SUBJ);
      const statement = kind === "past"
        ? `Complete with the past simple of « ${v.inf} »:
${pick(r, WHEN)}, ${subj} ____ .`
        : `Complete with the past participle of « ${v.inf} »:
${cap(subj)} ${PLURAL.has(subj) ? "have" : "has"} already ____ .`;
      return {
        statement, answer: choiceAnswer(c),
        hints: HINTS(kind === "past" ? "A finished action in the past needs the past simple (2nd form)." : "After have/has we use the past participle (3rd form).", `${v.inf} → ${form(v, kind)}.`),
        solution: `${fullLine(v)}. ${kind === "past" ? "Past simple = 2nd form." : "Past participle = 3rd form (after have/has/had or in the passive)."}`,
      };
    },
  };
}

const SOUND_LABEL = { t: "/t/", d: "/d/", id: "/ɪd/" } as const;

function regularTemplate(level: LevelId): Template {
  const tier = TIER_OF_LEVEL[level] ?? 4;
  const pool = regularsUpTo(tier);
  const contexts: ContextDef[] = [
    { id: "ed", label: "Spelling of -ed" },
    { id: "sound", label: "Pronunciation of -ed" },
    { id: "meaning", label: "Meaning" },
  ];
  return {
    id: `a-${level}-reg`, notionId: N("anglais", level, "Regular verbs : past simple"), difficulty: tier <= 1 ? 1 : tier <= 3 ? 2 : 3, contexts,
    gen(ctx, r): Instance {
      const v = pick(r, pool);
      const others = pool.filter((x) => x.inf !== v.inf);
      if (ctx === "sound") {
        const labels = ["/t/", "/d/", "/ɪd/"];
        const right = SOUND_LABEL[v.snd ?? "d"];
        return {
          statement: `How is the ending -ed pronounced in « ${v.past} »?`,
          answer: { kind: "choice", options: labels, index: labels.indexOf(right) },
          hints: [
            "Listen to the last sound of the base verb, not its spelling.",
            "After /t/ or /d/ the ending is /ɪd/; after a voiceless sound (p, k, f, s, sh, ch) it is /t/.",
            "After a voiced sound (a vowel, b, g, l, m, n, r, v, z) the ending is /d/.",
            `The base verb « ${v.inf} » ends with the sound that gives ${right}.`,
          ],
          solution: `« ${v.past} » → ${right}.`,
        };
      }
      if (ctx === "meaning") {
        const c = choices(r, v.inf, others.map((o) => o.inf), others.map((o) => o.inf));
        return { statement: `Which English verb means « ${v.fr} »?`, answer: choiceAnswer(c), hints: HINTS("Think of the English verb you already know for this action.", `The base form is « ${v.inf} ».`), solution: `${v.inf} – ${v.past} – ${v.pp} (${v.fr}). Regular verb: the past simple and the past participle are the same.` };
      }
      const rule = v.past.endsWith("ied") ? "consonant + y → -ied" : /([bdglmnprt])\1ed$/.test(v.past) && !v.inf.endsWith(v.past.slice(-3, -2)) ? "short verb ending in vowel + consonant: the consonant is doubled" : v.inf.endsWith("e") ? "verb ending in -e: add -d" : "add -ed";
      const wrong = [naive(v.inf), v.inf.endsWith("y") ? `${v.inf}ed` : `${v.inf}d`, `${v.inf}ing`, `${v.inf}s`];
      const c = choices(r, v.past, wrong, others.map((o) => o.past));
      return {
        statement: `Write the past simple of « ${v.inf} »:\n${pick(r, WHEN)}, ${pick(r, SUBJ)} ____ .`,
        answer: choiceAnswer(c),
        hints: HINTS("Regular verbs form the past simple with -ed / -d.", `Spelling rule: ${rule}.`),
        solution: `${v.inf} → ${v.past} (${rule}).`,
      };
    },
  };
}

register(...LEVELS.flatMap((l) => [irregularTemplate(l), regularTemplate(l)]));
