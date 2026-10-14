// Référentiel : niveaux, pays (zones XOF/XAF) et squelette de notions CI → Tle.
// Le squelette est volontairement plus large que le contenu écrit : l'écart est
// visible dans l'interface (« bientôt ») et mesuré par coverage().

import { SKELETON_CI_MATHS, SKELETON_CI_ANGLAIS } from "./content/skeleton-ci";

export type Subject = "maths" | "physique" | "anglais";
export const SUBJECT_LABEL: Record<Subject, string> = {
  maths: "Mathématiques",
  physique: "Physique-chimie",
  anglais: "Anglais",
};

export type LevelId =
  | "ci" | "cp" | "ce1" | "ce2" | "cm1" | "cm2"
  | "6e" | "5e" | "4e" | "3e" | "2nde" | "1ere" | "tle";

export interface Level {
  id: LevelId;
  label: string;
  cycle: "primaire" | "college" | "lycee";
}

export const LEVELS: Level[] = [
  { id: "ci", label: "CI", cycle: "primaire" },
  { id: "cp", label: "CP", cycle: "primaire" },
  { id: "ce1", label: "CE1", cycle: "primaire" },
  { id: "ce2", label: "CE2", cycle: "primaire" },
  { id: "cm1", label: "CM1", cycle: "primaire" },
  { id: "cm2", label: "CM2", cycle: "primaire" },
  { id: "6e", label: "6ème", cycle: "college" },
  { id: "5e", label: "5ème", cycle: "college" },
  { id: "4e", label: "4ème", cycle: "college" },
  { id: "3e", label: "3ème", cycle: "college" },
  { id: "2nde", label: "Seconde", cycle: "lycee" },
  { id: "1ere", label: "Première", cycle: "lycee" },
  { id: "tle", label: "Terminale", cycle: "lycee" },
];

export const levelById = (id: LevelId) => LEVELS.find((l) => l.id === id)!;
export const levelIndex = (id: LevelId) => LEVELS.findIndex((l) => l.id === id);
export const CYCLE_EXIT: Record<Level["cycle"], LevelId> = { primaire: "cm2", college: "3e", lycee: "tle" };

/** Matières disponibles par niveau (physique-chimie : de la 4ème à la Terminale). */
export function subjectsAt(level: LevelId): Subject[] {
  return levelIndex(level) >= levelIndex("4e") ? ["maths", "physique", "anglais"] : ["maths", "anglais"];
}

export interface Country {
  code: string;
  name: string;
  zone: "XOF" | "XAF";
  /** Examens de fin de cycle (noms à faire valider par des enseignants locaux). */
  exams: { primaire: string; college: string; lycee: string };
  /** Opérateurs mobile money courants (à confirmer pays par pays avant le lancement). */
  mobileMoney: string[];
}

export const COUNTRIES: Country[] = [
  { code: "CI", name: "Côte d'Ivoire", zone: "XOF", exams: { primaire: "CEPE", college: "BEPC", lycee: "BAC" }, mobileMoney: ["Orange Money", "MTN MoMo", "Moov Money", "Wave"] },
  { code: "SN", name: "Sénégal", zone: "XOF", exams: { primaire: "CFEE", college: "BFEM", lycee: "BAC" }, mobileMoney: ["Orange Money", "Wave", "Free Money"] },
  { code: "ML", name: "Mali", zone: "XOF", exams: { primaire: "CEP", college: "DEF", lycee: "BAC" }, mobileMoney: ["Orange Money", "Moov Money"] },
  { code: "BF", name: "Burkina Faso", zone: "XOF", exams: { primaire: "CEP", college: "BEPC", lycee: "BAC" }, mobileMoney: ["Orange Money", "Moov Money"] },
  { code: "BJ", name: "Bénin", zone: "XOF", exams: { primaire: "CEP", college: "BEPC", lycee: "BAC" }, mobileMoney: ["MTN MoMo", "Moov Money"] },
  { code: "TG", name: "Togo", zone: "XOF", exams: { primaire: "CEPD", college: "BEPC", lycee: "BAC" }, mobileMoney: ["Moov Money", "T-Money"] },
  { code: "NE", name: "Niger", zone: "XOF", exams: { primaire: "CFEPD", college: "BEPC", lycee: "BAC" }, mobileMoney: ["Orange Money", "Moov Money"] },
  { code: "GW", name: "Guinée-Bissau", zone: "XOF", exams: { primaire: "Examen de fin de primaire", college: "Examen de fin de collège", lycee: "Examen de fin de lycée" }, mobileMoney: ["Orange Money", "MTN MoMo"] },
  { code: "CM", name: "Cameroun (francophone)", zone: "XAF", exams: { primaire: "CEP", college: "BEPC", lycee: "BAC" }, mobileMoney: ["Orange Money", "MTN MoMo"] },
  { code: "GA", name: "Gabon", zone: "XAF", exams: { primaire: "CEP", college: "BEPC", lycee: "BAC" }, mobileMoney: ["Airtel Money", "Moov Money"] },
  { code: "CG", name: "Congo-Brazzaville", zone: "XAF", exams: { primaire: "CEPE", college: "BEPC", lycee: "BAC" }, mobileMoney: ["MTN MoMo", "Airtel Money"] },
  { code: "TD", name: "Tchad", zone: "XAF", exams: { primaire: "CEPE", college: "BEF", lycee: "BAC" }, mobileMoney: ["Airtel Money", "Moov Money"] },
  { code: "CF", name: "Centrafrique", zone: "XAF", exams: { primaire: "CEPE", college: "BEPC", lycee: "BAC" }, mobileMoney: ["Orange Money", "Moov Money"] },
  { code: "GQ", name: "Guinée équatoriale", zone: "XAF", exams: { primaire: "Examen de fin de primaire", college: "Examen de fin de collège", lycee: "Examen de fin de lycée" }, mobileMoney: [] },
];
export const countryByCode = (c: string) => COUNTRIES.find((x) => x.code === c) ?? COUNTRIES[0];

export function examName(country: string, level: LevelId): string | null {
  const lv = levelById(level);
  return CYCLE_EXIT[lv.cycle] === level ? countryByCode(country).exams[lv.cycle] : null;
}

// ---------- Squelette de notions ----------

export interface Notion {
  id: string;
  subject: Subject;
  level: LevelId;
  chapter: string;
  title: string;
}

const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Identifiant stable d'une notion : sujet:niveau:titre. */
export const nid = (subject: Subject, level: LevelId, title: string) => `${subject}:${level}:${slug(title)}`;

type Skeleton = Record<Subject, Partial<Record<LevelId, Record<string, string[]>>>>;

const SKELETON: Skeleton = {
  maths: {
    ci: { Nombres: ["Compter jusqu'à 20", "Nombres jusqu'à 100"], Calcul: ["Addition simple", "Soustraction simple"], Géométrie: ["Formes géométriques"] },
    cp: { Nombres: ["Nombres jusqu'à 1000"], Calcul: ["Addition posée", "Soustraction posée", "Tables de multiplication"], Grandeurs: ["Monnaie : le FCFA", "Mesurer des longueurs"] },
    ce1: { Nombres: ["Nombres jusqu'à 10 000"], Calcul: ["Multiplication", "Division : le partage"], Grandeurs: ["Heure et durées", "Périmètre"] },
    ce2: { Nombres: ["Nombres jusqu'à 100 000", "Fractions simples"], Calcul: ["Multiplication posée", "Division posée"], Grandeurs: ["Masses et capacités"], Géométrie: ["Angles droits"] },
    cm1: { Nombres: ["Grands nombres", "Nombres décimaux"], Calcul: ["Proportionnalité"], Grandeurs: ["Aire du rectangle"], Géométrie: ["Triangles"] },
    cm2: { Nombres: ["Pourcentages simples"], Calcul: ["Règle de trois", "Moyenne"], Grandeurs: ["Vitesse, distance, temps", "Aires et volumes"] },
    "6e": { Nombres: ["Fractions", "Décimaux et opérations"], Géométrie: ["Droites et angles", "Périmètres et aires"], Données: ["Proportionnalité", "Statistiques simples"] },
    "5e": { Nombres: ["Nombres relatifs", "Opérations sur les fractions"], Algèbre: ["Calcul littéral"], Géométrie: ["Triangles et parallélogrammes"], Données: ["Pourcentages"] },
    "4e": { Algèbre: ["Puissances", "Équations du premier degré", "Calcul littéral : développer"], Géométrie: ["Théorème de Pythagore", "Théorème de Thalès"], Données: ["Statistiques"] },
    "3e": { Algèbre: ["Racines carrées", "Systèmes d'équations"], Fonctions: ["Fonctions linéaires et affines"], Géométrie: ["Trigonométrie", "Thalès et Pythagore"], Probabilités: ["Probabilités élémentaires"] },
    "2nde": { Fonctions: ["Fonctions : image et antécédent", "Équations et inéquations"], Géométrie: ["Vecteurs et coordonnées"], Probabilités: ["Probabilités et dénombrement"], Données: ["Statistiques descriptives"] },
    "1ere": { Algèbre: ["Second degré", "Suites arithmétiques"], Analyse: ["Dérivation (1ère)"], Géométrie: ["Produit scalaire plan"], Probabilités: ["Probabilités conditionnelles"] },
    tle: { Analyse: ["Dérivation", "Calcul intégral", "Limites et continuité", "Logarithme et exponentielle"], "Algèbre et géométrie": ["Orthogonalité dans l'espace", "Nombres complexes"], Probabilités: ["Loi binomiale"] },
  },
  physique: {
    "4e": { Matière: ["Mélanges et corps purs", "Masse volumique"], Électricité: ["Circuit électrique et intensité"], Lumière: ["Propagation de la lumière"] },
    "3e": { Électricité: ["Tension et loi d'Ohm", "Puissance et énergie électriques"], Matière: ["Atomes et ions", "Réactions chimiques"], Mécanique: ["Poids et masse"] },
    "2nde": { Matière: ["Quantité de matière", "Concentration d'une solution"], Mouvement: ["Forces et mouvement"], Ondes: ["Ondes sonores"], Optique: ["Lentilles convergentes"] },
    "1ere": { Énergie: ["Énergie cinétique"], Matière: ["Acides et bases"], Mouvement: ["Travail d'une force"], Électricité: ["Condensateur et dipôle RC"] },
    tle: { Matière: ["pH et concentration", "Cinétique chimique"], Mouvement: ["Deuxième loi de Newton"], Ondes: ["Propagation d'une onde"], "Physique nucléaire": ["Radioactivité"] },
  },
  anglais: {
    ci: { Vocabulaire: ["Greetings", "Colours and numbers", "Classroom words", "My body"] },
    cp: { Vocabulaire: ["Family and friends", "Animals", "Numbers 1 to 20", "Fruits and vegetables"] },
    ce1: { Vocabulaire: ["School objects", "Days and months", "Weather"], Expression: ["Classroom commands"] },
    ce2: { Grammaire: ["I am / you are"], Vocabulaire: ["Food and drinks", "Clothes", "Rooms and furniture"] },
    cm1: { Grammaire: ["Present simple (routine)"], Vocabulaire: ["Daily routine", "Telling the time", "Places in town"] },
    cm2: { Grammaire: ["Present continuous", "Past simple : introduction", "Can and can't", "Prepositions of place"], Expression: ["Asking questions (wh-)"] },
    "6e": { Verbes: ["Irregular verbs : forms", "Regular verbs : past simple"], Grammaire: ["To be and to have", "Articles and plurals"] },
    "5e": { Verbes: ["Irregular verbs : forms", "Regular verbs : past simple"], Grammaire: ["Past simple", "Comparatives and superlatives"] },
    "4e": { Verbes: ["Irregular verbs : forms", "Regular verbs : past simple"], Grammaire: ["Future with will", "Present perfect : introduction"] },
    "3e": { Verbes: ["Irregular verbs : forms", "Regular verbs : past simple"], Grammaire: ["First conditional", "Passive voice : introduction", "Reported speech : introduction"] },
    "2nde": { Verbes: ["Irregular verbs : forms", "Regular verbs : past simple"], Grammaire: ["Tenses revision", "Modal verbs"] },
    "1ere": { Verbes: ["Irregular verbs : forms", "Regular verbs : past simple"], Grammaire: ["Past perfect", "Second conditional"] },
    tle: { Verbes: ["Irregular verbs : forms", "Regular verbs : past simple"], Grammaire: ["Temps verbaux (B2)"], Expression: ["Connecteurs logiques", "Reading comprehension"] },
  },
};

// Fusion du programme officiel ivoirien (maths 6ème → Tle séries A/C/D ; anglais 6ème → 3ème et Tle) : n'ajoute que les titres absents.
const CI_EXTRA: [Subject, Partial<Record<LevelId, Record<string, string[]>>>][] = [["maths", SKELETON_CI_MATHS], ["anglais", SKELETON_CI_ANGLAIS]];
for (const [subject, extra] of CI_EXTRA) {
  for (const [lv, chapters] of Object.entries(extra) as [LevelId, Record<string, string[]>][]) {
    const dst = (SKELETON[subject][lv] ??= {});
    const present = new Set(Object.values(dst).flat());
    for (const [chapter, titles] of Object.entries(chapters)) {
      const add = titles.filter((t) => !present.has(t));
      if (add.length) dst[chapter] = [...(dst[chapter] ?? []), ...add];
    }
  }
}

export const NOTIONS: Notion[] = (Object.keys(SKELETON) as Subject[]).flatMap((subject) =>
  LEVELS.flatMap((lv) =>
    Object.entries(SKELETON[subject][lv.id] ?? {}).flatMap(([chapter, titles]) =>
      titles.map((title) => ({ id: nid(subject, lv.id, title), subject, level: lv.id, chapter, title })),
    ),
  ),
);

export const notionById = (id: string) => NOTIONS.find((n) => n.id === id);
export const notionsOf = (subject: Subject, level: LevelId) =>
  NOTIONS.filter((n) => n.subject === subject && n.level === level);

// ---------- Séries du lycée (A, A1, A2, C, D) ----------
/** Série citée dans le titre d'une notion (« … série C »), ou null si la notion est commune. */
export const serieOfNotion = (n: Notion) => /série ([A-Z][0-9]?)\s*$/.exec(n.title)?.[1] ?? null;
/** Séries proposées pour une classe (selon les notions du référentiel). */
export const seriesAt = (level: LevelId) =>
  [...new Set(NOTIONS.filter((n) => n.level === level).map(serieOfNotion).filter((x): x is string => !!x))].sort();
/** Une notion propre à une série n'est visible que pour cette série ; sans série choisie, tout est visible. */
export const notionVisible = (n: Notion, serie?: string) => {
  const tag = serieOfNotion(n);
  return !tag || !serie || tag === serie;
};
