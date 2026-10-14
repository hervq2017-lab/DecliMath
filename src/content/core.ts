import { LevelId, nid, notionById, Subject } from "../curriculum";

// ---------- Types ----------

export type Answer =
  | { kind: "number"; value: number; tol: number; unit?: string }
  | { kind: "choice"; options: string[]; index: number };

export interface Instance {
  statement: string;
  answer: Answer;
  /** reformulation, indice, méthode, première étape */
  hints: [string, string, string, string];
  solution: string;
}

export interface ContextDef {
  id: string;
  label: string;
}

/**
 * Un gabarit = une compétence. `contexts` = scènes différentes (marché, école, moto…),
 * `seed` = jeu de valeurs différent dans une même scène.
 * Comprendre = réussir dans plusieurs contextes ET avec plusieurs jeux de valeurs.
 */
export interface Template {
  id: string;
  notionId: string;
  difficulty: 1 | 2 | 3;
  contexts: ContextDef[];
  gen: (ctx: string, r: Rng) => Instance;
  /** Compétence travaillée (libellé court affiché à l'élève et utilisé par la recherche). */
  skill?: string;
  /** Source du type d'exercice (livre, chapitre, pages) : traçabilité, pas de texte recopié. */
  ref?: string;
  /** Mots-clés de recherche. */
  keywords?: string[];
}

// ---------- Aléatoire déterministe ----------

export type Rng = () => number;
export function rng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const int = (r: Rng, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
export const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];
export const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
export const fr = (x: number) => String(x).replace(".", ",");
export const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;
export function shuffle<T>(r: Rng, xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// ---------- Contextes génériques (calcul) ----------

export const GENERIC_CTX: ContextDef[] = [
  { id: "marche", label: "Au marché" },
  { id: "ecole", label: "À l'école" },
  { id: "sport", label: "Au stade" },
  { id: "ferme", label: "Au village" },
  { id: "gare", label: "À la gare routière" },
];

const SCENES: Record<string, { things: string[]; place: string; singular: string[] }> = {
  marche: { things: ["mangues", "oranges", "tomates", "ignames"], singular: ["mangue", "orange", "tomate", "igname"], place: "au marché" },
  ecole: { things: ["cahiers", "stylos", "livres", "ardoises"], singular: ["cahier", "stylo", "livre", "ardoise"], place: "à l'école" },
  sport: { things: ["ballons", "maillots", "gourdes", "billets d'entrée"], singular: ["ballon", "maillot", "gourde", "billet d'entrée"], place: "au stade" },
  ferme: { things: ["poules", "sacs de maïs", "régimes de bananes", "chèvres"], singular: ["poule", "sac de maïs", "régime de bananes", "chèvre"], place: "au village" },
  gare: { things: ["billets", "sacs de riz", "bagages", "colis"], singular: ["billet", "sac de riz", "bagage", "colis"], place: "à la gare routière" },
};
const NAMES = ["Awa", "Moussa", "Kouadio", "Fatou", "Ibrahim", "Aminata", "Yao", "Mariam", "Seydou", "Adjoua", "Amadou", "Nadège", "Kofi", "Salimata", "Ngozi", "Tidiane"];

export interface Scene {
  who: string;
  who2: string;
  things: string; // pluriel
  thing: string; // singulier
  place: string;
}
export function scene(ctx: string, r: Rng): Scene {
  const s = SCENES[ctx] ?? SCENES.marche;
  const i = Math.floor(r() * s.things.length);
  const who = pick(r, NAMES);
  let who2 = pick(r, NAMES);
  if (who2 === who) who2 = NAMES[(NAMES.indexOf(who) + 1) % NAMES.length];
  return { who, who2, things: s.things[i], thing: s.singular[i], place: s.place };
}

export const num = (value: number, tol = 0, unit?: string): Answer => ({ kind: "number", value, tol, unit });

// ---------- Registre ----------

export const REGISTRY: Template[] = [];
export function register(...ts: Template[]) {
  for (const t of ts) {
    if (!notionById(t.notionId)) throw new Error(`Notion inconnue pour ${t.id}: ${t.notionId}`);
    if (!t.contexts.length) throw new Error(`Aucun contexte pour ${t.id}`);
    REGISTRY.push(t);
  }
}
export const N = nid;
export type { LevelId, Subject };

export const templateById = (id: string) => REGISTRY.find((t) => t.id === id);
export const templatesFor = (notionId: string) => REGISTRY.filter((t) => t.notionId === notionId);

export function instantiate(t: Template, ctx: string, seed: number): Instance {
  return t.gen(ctx, rng(seed * 7919 + hash(ctx) + hash(t.id)));
}
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

/**
 * Lit une saisie libre : entier, décimal (virgule ou point), négatif (« - » ou « − »), fraction « a/b »
 * (numérateur et dénominateur éventuellement décimaux), espaces ignorés. NaN si illisible.
 */
const DEC = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)`;
const RE_DEC = new RegExp(`^${DEC}$`);
const RE_FRAC = new RegExp(`^(${DEC})/(${DEC})$`);

export function parseNumeric(input: string): number {
  const t = input.trim().replace(/[−–—]/g, "-").replace(/[\s  ]/g, "").replace(/,/g, ".");
  const frac = t.match(RE_FRAC);
  if (frac) {
    const d = Number(frac[2]);
    return d === 0 ? NaN : Number(frac[1]) / d;
  }
  return RE_DEC.test(t) ? Number(t) : NaN;
}

export function checkAnswer(a: Answer, input: string): boolean {
  if (a.kind === "choice") return input.trim() !== "" && Number(input) === a.index;
  const n = parseNumeric(input);
  return Number.isFinite(n) && Math.abs(n - a.value) <= a.tol + 1e-9;
}

/** Construit un QCM à options mélangées à partir d'un élément de pool. */
export function choice(r: Rng, options: string[], correct: number): Answer {
  const order = shuffle(r, options.map((_, i) => i));
  return { kind: "choice", options: order.map((i) => options[i]), index: order.indexOf(correct) };
}
