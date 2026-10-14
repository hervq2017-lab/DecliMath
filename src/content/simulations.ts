// Simulations : l'élève modifie des paramètres et observe les conséquences.
// Chaque simulation suit le cycle « prédire → manipuler → constater → expliquer » ; les calculs sont des fonctions
// pures (testées par scripts/check-methodes.ts) et les situations sont ancrées dans la vie quotidienne.
import { N } from "./core";
import type { LevelId, Subject } from "../curriculum";

export interface Param { id: string; label: string; unit: string; min: number; max: number; step: number; def: number }
export interface Point { x: number; y: number }
export interface Prediction {
  question: string;
  /** Paramètres de départ de l'expérience, puis ce qu'on change. */
  from: Record<string, number>;
  to: Record<string, number>;
  /** Sortie observée (id d'une sortie) */
  watch: string;
  options: string[];
  /** Calculé par le code à partir de la simulation, jamais saisi à la main. */
  answer: (sim: Simulation) => number;
  explain: string;
}
export interface Challenge { text: string; hint: string; ok: (v: Record<string, number>) => boolean; done: string }
export interface Simulation {
  id: string;
  title: string;
  subject: Subject;
  level: LevelId;
  notionId: string;
  scene: string;
  params: Param[];
  /** Sorties affichées : valeur et unité. */
  outputs: { id: string; label: string; unit: string; fmt?: (x: number) => string }[];
  compute: (v: Record<string, number>) => Record<string, number>;
  /** Courbe : y en fonction du paramètre `x`, les autres paramètres étant fixés. */
  curve: { x: string; y: string; xLabel: string; yLabel: string; samples: number };
  prediction: Prediction;
  challenge: Challenge;
  lesson: string;
}

const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
export const defaults = (sim: Simulation) => Object.fromEntries(sim.params.map((p) => [p.id, p.def])) as Record<string, number>;

/** Échantillonne la courbe de la simulation en faisant varier un seul paramètre. */
export function sampleCurve(sim: Simulation, values: Record<string, number>): Point[] {
  const p = sim.params.find((q) => q.id === sim.curve.x)!;
  return Array.from({ length: sim.curve.samples }, (_, i) => {
    const x = p.min + ((p.max - p.min) * i) / (sim.curve.samples - 1);
    return { x, y: sim.compute({ ...values, [p.id]: x })[sim.curve.y] };
  });
}

// ---------- 1. Mon petit commerce (fonctions) ----------
// n clients = 300 − prix/5 ; bénéfice = (prix − coût) × n − frais fixes.
const commerce: Simulation = {
  id: "commerce", title: "Mon petit commerce", subject: "maths", level: "2nde", notionId: N("maths", "2nde", "Fonctions : image et antécédent"),
  scene: "Tu vends des beignets au bord de la route. Plus tu les vends cher, moins tu as de clients : à chaque 100 FCFA de plus, 20 clients en moins.",
  params: [
    { id: "prix", label: "Prix d'un beignet", unit: "FCFA", min: 400, max: 1500, step: 50, def: 600 },
    { id: "cout", label: "Coût de fabrication", unit: "FCFA", min: 100, max: 600, step: 50, def: 400 },
    { id: "frais", label: "Frais fixes du jour", unit: "FCFA", min: 0, max: 20000, step: 1000, def: 5000 },
  ],
  outputs: [
    { id: "clients", label: "Clients", unit: "" },
    { id: "recette", label: "Recette", unit: "FCFA" },
    { id: "benefice", label: "Bénéfice", unit: "FCFA" },
  ],
  compute: ({ prix, cout, frais }) => {
    const clients = Math.max(0, 300 - prix / 5);
    return { clients, recette: prix * clients, benefice: (prix - cout) * clients - frais };
  },
  curve: { x: "prix", y: "benefice", xLabel: "Prix (FCFA)", yLabel: "Bénéfice (FCFA)", samples: 45 },
  prediction: {
    question: "Le prix passe de 600 à 900 FCFA (coût 400, frais 5 000). Le bénéfice va…",
    from: { prix: 600, cout: 400, frais: 5000 }, to: { prix: 900, cout: 400, frais: 5000 }, watch: "benefice",
    options: ["augmenter", "diminuer", "rester pareil"],
    answer: (sim) => { const a = sim.compute({ prix: 600, cout: 400, frais: 5000 }).benefice, b = sim.compute({ prix: 900, cout: 400, frais: 5000 }).benefice; return b > a ? 0 : b < a ? 1 : 2; },
    explain: "Chaque beignet rapporte plus (prix − coût), mais il y a moins de clients. Ici le gain par beignet l'emporte, jusqu'à un certain prix : après, perdre des clients coûte plus que ce que tu gagnes en augmentant.",
  },
  challenge: {
    text: "Trouve un prix qui rapporte au moins 50 000 FCFA de bénéfice (coût 400, frais 5 000).",
    hint: "Regarde la courbe : le bénéfice monte puis redescend. Cherche le sommet.",
    ok: (v) => v.cout === 400 && v.frais === 5000 && commerce.compute(v).benefice >= 50000,
    done: "Bravo ! Le bénéfice est maximal quand on trouve le bon équilibre entre le gain par beignet et le nombre de clients.",
  },
  lesson: "Le bénéfice dépend du prix selon une courbe en cloche (une fonction du second degré) : trop bas, tu gagnes peu par beignet ; trop haut, tu perds les clients. Le sommet est le meilleur prix.",
};

// ---------- 2. Loi d'Ohm ----------
const ohm: Simulation = {
  id: "ohm", title: "Loi d'Ohm : tension, résistance, courant", subject: "physique", level: "3e", notionId: N("physique", "3e", "Tension et loi d'Ohm"),
  scene: "Une pile alimente une petite lampe à travers un conducteur ohmique. Tu choisis la tension de la pile et la résistance, et tu lis le courant.",
  params: [
    { id: "U", label: "Tension de la pile", unit: "V", min: 1, max: 12, step: 0.5, def: 6 },
    { id: "R", label: "Résistance", unit: "Ω", min: 10, max: 200, step: 10, def: 60 },
  ],
  outputs: [{ id: "I", label: "Intensité du courant", unit: "A", fmt: (x) => round(x, 3).toString().replace(".", ",") }, { id: "P", label: "Puissance dissipée", unit: "W", fmt: (x) => round(x, 3).toString().replace(".", ",") }],
  compute: ({ U, R }) => ({ I: U / R, P: (U * U) / R }),
  curve: { x: "U", y: "I", xLabel: "Tension U (V)", yLabel: "Courant I (A)", samples: 23 },
  prediction: {
    question: "On double la résistance (de 60 Ω à 120 Ω) avec la même pile de 6 V. Le courant va…",
    from: { U: 6, R: 60 }, to: { U: 6, R: 120 }, watch: "I", options: ["doubler", "être divisé par 2", "ne pas changer"],
    answer: (sim) => { const a = sim.compute({ U: 6, R: 60 }).I, b = sim.compute({ U: 6, R: 120 }).I; return Math.abs(b - 2 * a) < 1e-9 ? 0 : Math.abs(b - a / 2) < 1e-9 ? 1 : 2; },
    explain: "I = U ÷ R. Une résistance plus grande « freine » davantage le courant : si R double, I est divisé par 2.",
  },
  challenge: {
    text: "Règle la pile et la résistance pour obtenir un courant de 0,05 A (50 mA) avec une pile de 6 V.",
    hint: "I = U ÷ R, donc R = U ÷ I.",
    ok: (v) => v.U === 6 && Math.abs(ohm.compute(v).I - 0.05) < 1e-9,
    done: "Oui : R = 6 ÷ 0,05 = 120 Ω. C'est ainsi qu'on choisit la résistance qui protège une petite lampe ou une LED.",
  },
  lesson: "Pour un conducteur ohmique, U = R × I : la tension et le courant sont proportionnels (la courbe est une droite passant par l'origine) et la pente vaut 1 ÷ R.",
};

// ---------- 3. Vitesse, distance, temps ----------
const route: Simulation = {
  id: "route", title: "Un voyage en car", subject: "maths", level: "cm2", notionId: N("maths", "cm2", "Vitesse, distance, temps"),
  scene: "Un car doit parcourir 240 km. Tu choisis sa vitesse moyenne et tu regardes combien de temps dure le voyage.",
  params: [{ id: "v", label: "Vitesse moyenne", unit: "km/h", min: 30, max: 120, step: 10, def: 60 }],
  outputs: [{ id: "t", label: "Durée du voyage", unit: "h", fmt: (x) => round(x, 2).toString().replace(".", ",") }],
  compute: ({ v }) => ({ t: 240 / v }),
  curve: { x: "v", y: "t", xLabel: "Vitesse (km/h)", yLabel: "Durée (h)", samples: 31 },
  prediction: {
    question: "Le car double sa vitesse (de 40 à 80 km/h). La durée du voyage va…",
    from: { v: 40 }, to: { v: 80 }, watch: "t", options: ["doubler", "être divisée par 2", "ne pas changer"],
    answer: (sim) => { const a = sim.compute({ v: 40 }).t, b = sim.compute({ v: 80 }).t; return Math.abs(b - 2 * a) < 1e-9 ? 0 : Math.abs(b - a / 2) < 1e-9 ? 1 : 2; },
    explain: "t = d ÷ v. Pour une même distance, aller deux fois plus vite prend deux fois moins de temps.",
  },
  challenge: {
    text: "À quelle vitesse faut-il rouler pour faire les 240 km en 3 heures ?",
    hint: "v = d ÷ t = 240 ÷ 3.",
    ok: (v) => Math.abs(route.compute(v).t - 3) < 1e-9,
    done: "Oui : 240 ÷ 3 = 80 km/h. Dans la vraie vie, la vitesse moyenne tient compte des arrêts et de l'état de la route.",
  },
  lesson: "Distance = vitesse × temps. À distance fixée, la durée est inversement proportionnelle à la vitesse : la courbe n'est pas une droite mais une hyperbole.",
};

// ---------- 4. L'échelle contre le mur (Pythagore) ----------
const echelle: Simulation = {
  id: "echelle", title: "L'échelle contre le mur", subject: "maths", level: "4e", notionId: N("maths", "4e", "Théorème de Pythagore"),
  scene: "Une échelle de 4 m est posée contre un mur. Tu choisis à quelle distance du mur on place son pied et tu regardes à quelle hauteur elle arrive.",
  params: [{ id: "d", label: "Distance du pied au mur", unit: "m", min: 0.5, max: 3.5, step: 0.1, def: 1.5 }],
  outputs: [{ id: "h", label: "Hauteur atteinte sur le mur", unit: "m", fmt: (x) => round(x, 2).toString().replace(".", ",") }],
  compute: ({ d }) => ({ h: Math.sqrt(16 - d * d) }),
  curve: { x: "d", y: "h", xLabel: "Distance au mur (m)", yLabel: "Hauteur (m)", samples: 31 },
  prediction: {
    question: "On éloigne le pied de l'échelle du mur (de 1 m à 3 m). La hauteur atteinte va…",
    from: { d: 1 }, to: { d: 3 }, watch: "h", options: ["augmenter", "diminuer", "rester pareille"],
    answer: (sim) => { const a = sim.compute({ d: 1 }).h, b = sim.compute({ d: 3 }).h; return b > a ? 0 : b < a ? 1 : 2; },
    explain: "L'échelle est l'hypoténuse (4 m) : h² + d² = 4². Quand d grandit, d² grandit, donc h² = 16 − d² diminue.",
  },
  challenge: {
    text: "Place le pied de l'échelle pour qu'elle atteigne une fenêtre située à 3,5 m du sol (à 10 cm près).",
    hint: "d² = 4² − 3,5² = 16 − 12,25 = 3,75.",
    ok: (v) => Math.abs(echelle.compute(v).h - 3.5) <= 0.1,
    done: "Oui : d = √3,75 ≈ 1,94 m. Pythagore permet de placer l'échelle sans mesurer en grimpant !",
  },
  lesson: "Dans le triangle rectangle formé par le mur, le sol et l'échelle : h² + d² = (longueur de l'échelle)². La hauteur atteinte diminue de plus en plus vite quand on éloigne le pied.",
};

export const SIMULATIONS: Simulation[] = [commerce, ohm, route, echelle];
export const simulationById = (id: string) => SIMULATIONS.find((s) => s.id === id);
