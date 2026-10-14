import { nid } from "../curriculum";
import { exemplesTle } from "./exemples-cours-tle";
import { COURS_CI } from "./cours-ci";
import { COURS_EN_CI } from "./cours-anglais-ci";

export interface Lesson {
  notionId: string;
  intro: string;
  steps: { title: string; body: string }[];
  example: { problem: string; solution: string };
  /** exemples supplémentaires résolus */
  more?: { problem: string; solution: string }[];
  pitfalls: string;
  /** brouillon généré par IA ou validé par un enseignant */
  status: "draft" | "validated";
}

const LESSONS_BASE: Lesson[] = [
  {
    notionId: nid("maths", "ci", "Addition simple"),
    intro: "Additionner, c'est rassembler des objets pour savoir combien il y en a en tout.",
    steps: [
      { title: "Je rassemble", body: "On met les deux groupes ensemble." },
      { title: "Je compte", body: "Je pars du plus grand nombre et j'avance du plus petit." },
    ],
    example: { problem: "Awa a 5 mangues. On lui en donne 3. Combien en a-t-elle ?", solution: "5 + 3 = 8. Elle a 8 mangues." },
    pitfalls: "Ne pas compter deux fois le même objet.",
    status: "draft",
  },
  {
    notionId: nid("maths", "cp", "Monnaie : le FCFA"),
    intro: "Le franc CFA (FCFA) sert à payer. On calcule le prix total puis la monnaie rendue.",
    steps: [
      { title: "Prix total", body: "Nombre d'articles × prix d'un article." },
      { title: "Monnaie", body: "Argent donné − prix total." },
    ],
    example: { problem: "3 stylos à 100 FCFA. Tu donnes 500 FCFA. Monnaie ?", solution: "3 × 100 = 300 ; 500 − 300 = 200 FCFA." },
    pitfalls: "Ne pas soustraire avant d'avoir calculé le prix total.",
    status: "draft",
  },
  {
    notionId: nid("maths", "cm1", "Proportionnalité"),
    intro: "Deux grandeurs sont proportionnelles si on passe de l'une à l'autre en multipliant toujours par le même nombre.",
    steps: [
      { title: "Passer par l'unité", body: "Divise le prix total par le nombre d'articles pour trouver le prix d'un article." },
      { title: "Multiplier", body: "Multiplie ce prix unitaire par la nouvelle quantité." },
    ],
    example: { problem: "4 cahiers coûtent 1 000 FCFA. Prix de 7 cahiers ?", solution: "1 000 ÷ 4 = 250 ; 250 × 7 = 1 750 FCFA." },
    pitfalls: "Vérifier que le prix unitaire reste le même quand on achète plus.",
    status: "draft",
  },
  {
    notionId: nid("maths", "4e", "Théorème de Pythagore"),
    intro: "Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.",
    steps: [
      { title: "Identifier l'hypoténuse", body: "C'est le côté en face de l'angle droit, le plus long." },
      { title: "Appliquer", body: "a² + b² = c², avec c l'hypoténuse." },
      { title: "Extraire la racine", body: "c = √(a² + b²)." },
    ],
    example: { problem: "Côtés de l'angle droit : 3 et 4.", solution: "c² = 9 + 16 = 25 donc c = 5." },
    pitfalls: "Ne pas additionner des carrés quand on cherche un côté de l'angle droit : on soustrait alors.",
    status: "draft",
  },
  {
    notionId: nid("maths", "3e", "Fonctions linéaires et affines"),
    intro: "Une fonction affine f(x) = ax + b a pour représentation une droite. a est le coefficient directeur, b l'ordonnée à l'origine.",
    steps: [
      { title: "Calculer une image", body: "Remplace x par la valeur donnée." },
      { title: "Trouver a", body: "a = (f(x₂) − f(x₁)) / (x₂ − x₁)." },
    ],
    example: { problem: "f(x) = 2x + 3. Image de 5 ?", solution: "f(5) = 2×5 + 3 = 13." },
    pitfalls: "Ne pas confondre l'image (on remplace x) et l'antécédent (on résout une équation).",
    status: "draft",
  },
  {
    notionId: nid("maths", "tle", "Loi binomiale"),
    intro: "On répète n épreuves identiques et indépendantes à deux issues (succès / échec).",
    steps: [
      { title: "Reconnaître le modèle", body: "n épreuves, probabilité de succès p constante." },
      { title: "Formule", body: "P(X = k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ." },
    ],
    example: { problem: "B(4 ; 0,5), P(X=2) ?", solution: "C(4,2)=6 ; 6 × 0,25 × 0,25 = 0,375." },
    pitfalls: "Oublier le coefficient binomial.",
    status: "draft",
  },
  {
    notionId: nid("physique", "3e", "Tension et loi d'Ohm"),
    intro: "Pour un conducteur ohmique, la tension à ses bornes est proportionnelle à l'intensité qui le traverse.",
    steps: [
      { title: "Relation", body: "U = R × I (U en V, R en Ω, I en A)." },
      { title: "Convertir", body: "Passe les mA en A (÷ 1000) avant de calculer." },
    ],
    example: { problem: "R = 100 Ω, I = 0,2 A.", solution: "U = 100 × 0,2 = 20 V." },
    pitfalls: "Mélanger mA et A.",
    status: "draft",
  },
  {
    notionId: nid("physique", "tle", "Deuxième loi de Newton"),
    intro: "Dans un référentiel galiléen, la somme des forces appliquées à un système est égale au produit de sa masse par son accélération.",
    steps: [
      { title: "Système et bilan", body: "Choisis le système puis liste les forces." },
      { title: "Projeter", body: "ΣF = m·a, projetée sur un axe." },
    ],
    example: { problem: "m = 1 000 kg, F = 3 000 N.", solution: "a = F/m = 3 m/s²." },
    pitfalls: "Masse en kg obligatoire.",
    status: "draft",
  },
  {
    notionId: nid("anglais", "tle", "Temps verbaux (B2)"),
    intro: "Choisir le bon temps selon le repère de temps de la phrase.",
    steps: [
      { title: "Repère daté", body: "yesterday, in 2019 → preterit." },
      { title: "Depuis / pendant", body: "since, for + situation toujours vraie → present perfect." },
      { title: "Antériorité", body: "by the time + passé → past perfect." },
    ],
    example: { problem: "She ___ in Dakar since 2018.", solution: "has lived (since → present perfect)." },
    pitfalls: "Pas de present perfect avec une date précise du passé.",
    status: "draft",
  },
];

/** Cours de base + cours originaux du programme ivoirien (les cours de base priment en cas de doublon). */
export const LESSONS: Lesson[] = [...LESSONS_BASE, ...[...COURS_CI, ...COURS_EN_CI].filter((c) => !LESSONS_BASE.some((b) => b.notionId === c.notionId))]
  .map((l) => { const more = exemplesTle(l.notionId); return more ? { ...l, more } : l; });

export const lessonFor = (notionId: string) => LESSONS.find((l) => l.notionId === notionId);
