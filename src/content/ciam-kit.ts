// Outils communs aux gabarits inspirés des manuels CIAM (un fichier par classe).
// Règle : les énoncés sont ORIGINAUX (mêmes compétences que le manuel, valeurs et contextes différents) ;
// toute réponse est calculée par le code. `ref` indique où le manuel travaille cette compétence.
import { choice, ContextDef, Instance, N, pick, Rng, shuffle, Template, round, gcd } from "./core";
import type { LevelId } from "../curriculum";

export const H = (a: string, b: string, c: string, d: string): [string, string, string, string] => [a, b, c, d];

export const PUR: ContextDef[] = [
  { id: "pur", label: "Calcul direct" },
  { id: "situation", label: "En situation" },
];
export const QCM: ContextDef[] = [{ id: "qcm", label: "Question de cours" }];

export interface Meta {
  skill: string;
  ref: string;
  kw?: string[];
}

/** Fabrique de gabarits pour une classe : mk(id, titre de notion, difficulté, méta, générateur, contextes). */
export const ciam = (level: LevelId, prefix: string) =>
  (
    id: string, notionTitle: string, difficulty: 1 | 2 | 3, meta: Meta,
    gen: (ctx: string, r: Rng) => Instance, contexts: ContextDef[] = PUR,
  ): Template => ({
    id: `${prefix}-${id}`,
    notionId: N("maths", level, notionTitle),
    difficulty, contexts, gen: (ctx, r) => tidy(gen(ctx, r)),
    skill: meta.skill, ref: meta.ref, keywords: meta.kw,
  });

/** Typographie : vrai signe moins devant un nombre (−3 et non -3), dans tous les textes affichés. */
const fixMinus = (t: string) => t.replace(/(^|[\s(=;:×÷+−/\[])-(?=\d)/g, "$1−");
const tidy = (i: Instance): Instance => ({
  ...i,
  statement: fixMinus(i.statement),
  solution: fixMinus(i.solution),
  hints: i.hints.map(fixMinus) as Instance["hints"],
  answer: i.answer.kind === "choice" ? { ...i.answer, options: i.answer.options.map(fixMinus) } : i.answer,
});

/** Écriture française d'un nombre : virgule décimale, tranches de trois chiffres à partir de 5 chiffres, vrai signe moins. */
export const f = (x: number) => {
  const s = String(round(x, 8));
  const [i, d] = s.split(".");
  const neg = i.startsWith("-");
  const digits = neg ? i.slice(1) : i;
  const g = digits.length >= 5 ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : digits;
  return (neg ? "−" : "") + g + (d ? "," + d : "");
};

/** Nombre relatif entre parenthèses : (+3) ou (−7). */
export const sg = (n: number) => (n < 0 ? `(−${f(-n)})` : `(+${f(n)})`);

export const WHO = ["Awa", "Moussa", "Kouadio", "Fatou", "Yao", "Mariam", "Seydou", "Adjoua", "Koffi", "Aminata", "Ibrahim", "Nadège"];

/** Entier aléatoire dont on contrôle le nombre de décimales : renvoie la valeur exacte (division d'entiers). */
export const dec = (r: Rng, lo: number, hi: number, digits: number) => {
  const k = 10 ** digits;
  return Math.round((lo * k + Math.floor(r() * ((hi - lo) * k + 1)))) / k;
};

/** Question à choix multiples tirée d'un pool { q, good, bad[], why } : options mélangées, une seule bonne réponse. */
export type Item = { q: string; good: string; bad: string[]; why: string };
export const qcmOf = (r: Rng, pool: Item[], hint: string): Instance => {
  const it = pick(r, pool);
  return {
    statement: it.q,
    answer: choice(r, [it.good, ...it.bad], 0),
    hints: H("Question de cours : relis la propriété correspondante.", hint, "Élimine d'abord les réponses qui contredisent la définition.", "Reviens à la définition du chapitre."),
    solution: it.why,
  };
};

/** Fraction a/b écrite en texte. */
export const fracS = (a: number, b: number) => `${a}/${b}`;
/** Fraction simplifiée. */
export const reduce = (a: number, b: number): [number, number] => { const g = gcd(Math.abs(a), Math.abs(b)) || 1; return [a / g, b / g]; };
/** Complète une bonne réponse par des distracteurs distincts (jusqu'à 3). */
export const withWrong = (good: string, wrong: string[]) => [...new Set(wrong.filter((w) => w !== good))].slice(0, 3);
export const isPrime = (n: number) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
export const factorize = (n: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let d = 2; d * d <= n; d++) { let k = 0; while (n % d === 0) { n /= d; k++; } if (k) out.push([d, k]); }
  if (n > 1) out.push([n, 1]);
  return out;
};
export const sup = (n: number) => String(n).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]).join("");
export const factStr = (n: number) => factorize(n).map(([p, k]) => (k > 1 ? `${p}${sup(k)}` : `${p}`)).join(" × ");
export { shuffle };
