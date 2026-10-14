// Problèmes de situation : énoncé complet + questions qui s'enchaînent, réponses saisies au clavier.
// Trois origines, jamais mélangées (champ `origine`) :
//  - "genere"  : gabarits paramétriques (src/content/ciam-*.ts), réponses calculées par le code ;
//  - "redige"  : problèmes écrits à la main (ce fichier), variantes contrôlées, chaque variante recalculée
//                par un vérificateur INDÉPENDANT (autre méthode de calcul) dans scripts/check-problemes.ts ;
//  - "annale"  : sujets d'examen réels. Refusés à l'enregistrement tant que l'autorisation de reproduction
//                n'est pas notée « obtenue » et que la référence exacte n'est pas donnée.
// Le statut dit ce qui a réellement été fait : "verifie-code" ≠ "valide-enseignant".
import { Answer, choice, fcfa, fr, int, num, pick, Rng, rng, N } from "./core";
import { LevelId, notionById } from "../curriculum";

export type Origine = "genere" | "redige" | "annale";
export type Statut = "brouillon" | "verifie-code" | "valide-enseignant";

export interface QuestionPb {
  texte: string;
  answer: Answer;
  /** Méthode attendue, en une phrase. */
  methode: string;
  /** Corrigé détaillé, une ligne par étape de calcul. */
  etapes: string[];
  /** Quatre aides progressives : reformulation, indice, méthode, première étape chiffrée (jamais la réponse). */
  hints: [string, string, string, string];
  /** Erreurs fréquentes : si la saisie est égale à `reponse`, on affiche `message` au lieu d'un simple « faux ». */
  erreurs: { reponse: number; message: string }[];
  points: number;
}
export interface InstancePb {
  enonce: string;
  questions: QuestionPb[];
}

export interface ProblemeSitue {
  id: string;
  origine: Origine;
  statut: Statut;
  titre: string;
  niveau: LevelId;
  /** Séries concernées (lycée). Vide = toutes. */
  series: string[];
  chapitre: string;
  notionId: string;
  competence: string;
  objectif: string;
  prerequis: string[];
  difficulte: 1 | 2 | 3;
  /** Identifiant de contexte enregistré dans les tentatives (la maîtrise exige ≥ 2 contextes différents). */
  contexte: string;
  contexteLabel: string;
  /** Source pédagogique. Pour une annale : référence exacte + autorisation. */
  source: { type: "original" | "manuel" | "annale"; reference: string; autorisation?: "obtenue" | "a-obtenir" };
  /** Rattachement au programme officiel du Bénin : `verifie` reste faux tant que le programme n'a pas été consulté. */
  programme: { pays: string; reference: string; verifie: boolean };
  /** Mentions à valider par un enseignant (ordres de grandeur, vocabulaire local…). */
  aValider: string[];
  tirer: (seed: number) => { instance: InstancePb; verifier: () => string[] };
}

// ---------- Registre ----------

export const PROBLEMES_SITUES: ProblemeSitue[] = [];
export function registerProbleme(...ps: ProblemeSitue[]) {
  for (const p of ps) {
    if (!notionById(p.notionId)) throw new Error(`Notion inconnue pour ${p.id}: ${p.notionId}`);
    if (p.origine === "annale" && (p.source.autorisation !== "obtenue" || !p.source.reference.trim()))
      throw new Error(`Annale ${p.id} refusée : référence exacte et autorisation de reproduction « obtenue » requises`);
    if (p.statut === "valide-enseignant") throw new Error(`${p.id} : « valide-enseignant » ne peut être posé que par une validation réelle`);
    PROBLEMES_SITUES.push(p);
  }
}
export const problemeById = (id: string) => PROBLEMES_SITUES.find((p) => p.id === id);
export const problemesFor = (notionId: string) => PROBLEMES_SITUES.filter((p) => p.notionId === notionId);
export const instancierProbleme = (p: ProblemeSitue, seed: number) => p.tirer(seed).instance;

// ---------- Aides communes ----------

const PRENOMS_BJ = ["Sènami", "Codjo", "Adjovi", "Dossou", "Fifamè", "Yacoubou", "Akpédjé", "Houénou", "Bio", "Gbèdo", "Ayaba", "Koffi"];
const sq = (x: number) => x * x;
const arr = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const ok = (cond: boolean, msg: string, errs: string[]) => { if (!cond) errs.push(msg); };

// =====================================================================
// 1. 6e — Proportionnalité : les ananas d'Allada
// =====================================================================
interface D1 { who: string; n: number; u: number; m: number; r: number }
registerProbleme({
  id: "pb-6e-ananas", origine: "redige", statut: "verifie-code", titre: "Les ananas d'Allada",
  niveau: "6e", series: [], chapitre: "Données", notionId: N("maths", "6e", "Proportionnalité"),
  competence: "Reconnaître une situation de proportionnalité et calculer avec le prix d'une unité (passage par l'unité)",
  objectif: "Passer par le prix d'un objet pour calculer un prix, une recette, un bénéfice ; ne pas raisonner par addition.",
  prerequis: ["Multiplication et division de nombres entiers", "Notion de prix unitaire"],
  difficulte: 1, contexte: "marche", contexteLabel: "Au marché",
  source: { type: "original", reference: "Rédigé pour DeclickMath, à rapprocher du chapitre « Proportionnalité » du manuel de 6ème (page à préciser)" },
  programme: { pays: "BJ", reference: "Programme béninois de 6ème non consulté (dossier docs/benin vide)", verifie: false },
  aValider: ["Prix de l'ananas à Allada et à Cotonou : ordres de grandeur", "Rattachement au programme béninois"],
  tirer(seed) {
    const r: Rng = rng(seed * 104729 + 11);
    const n = pick(r, [6, 8, 10, 12, 15, 20]);
    const u = pick(r, [150, 200, 250, 300, 350, 400]);
    let m = n + pick(r, [3, 5, 7, 9, 11]);
    if (m === n) m++;
    // marge ≠ prix d'achat : sinon le bénéfice égalerait le prix d'achat total cité dans l'indice (coïncidence trompeuse)
    const marge = pick(r, [100, 150, 200].filter((x) => x !== u));
    const d: D1 = { who: pick(r, PRENOMS_BJ), n, u, m, r: u + marge };
    const P = d.n * d.u;
    const instance: InstancePb = {
      enonce: `${d.who} achète ${d.n} ananas à Allada pour ${fcfa(P)}. Le prix payé est proportionnel au nombre d'ananas. À Cotonou, au marché Dantokpa, elle les revend ${fcfa(d.r)} l'ananas.`,
      questions: [
        {
          texte: "Quel est le prix d'achat d'un ananas (en FCFA) ?", answer: num(d.u, 0, "FCFA"),
          methode: "Prix d'un objet = prix total ÷ nombre d'objets.",
          etapes: [`Prix de ${d.n} ananas : ${fcfa(P)}`, `Prix d'un ananas : ${P} ÷ ${d.n} = ${d.u} FCFA`],
          hints: ["On cherche ce que coûte un seul ananas à l'achat.", "Le prix total est partagé en parts égales entre les ananas.", "On divise le prix payé par le nombre d'ananas.", `Calcule ${P} ÷ ${d.n}.`],
          erreurs: [{ reponse: d.r, message: "Tu as donné le prix de vente. On demande le prix d'achat (ce que coûte l'ananas à Allada)." }],
          points: 1,
        },
        {
          texte: `Combien paierait-elle pour ${d.m} ananas au même prix (en FCFA) ?`, answer: num(d.m * d.u, 0, "FCFA"),
          methode: "Passer par le prix d'un ananas, puis multiplier.",
          etapes: [`Prix d'un ananas : ${d.u} FCFA`, `Prix de ${d.m} ananas : ${d.m} × ${d.u} = ${d.m * d.u} FCFA`],
          hints: [`On cherche le prix de ${d.m} ananas.`, "Le prix est proportionnel : deux fois plus d'ananas, deux fois plus cher.", "Utilise le prix d'un ananas trouvé à la question 1.", `Multiplie ${d.u} par ${d.m}.`],
          erreurs: [{ reponse: P + (d.m - d.n), message: `Attention : ajouter ${Math.abs(d.m - d.n)} FCFA parce qu'il y a ${Math.abs(d.m - d.n)} ananas de ${d.m > d.n ? "plus" : "moins"} est faux. Chaque ananas coûte ${d.u} FCFA, pas 1 FCFA : la proportionnalité se calcule par multiplication.` }],
          points: 1,
        },
        {
          texte: `Quelle recette obtient-elle en vendant les ${d.n} ananas (en FCFA) ?`, answer: num(d.n * d.r, 0, "FCFA"),
          methode: "Recette = nombre d'ananas × prix de vente d'un ananas.",
          etapes: [`Recette : ${d.n} × ${d.r} = ${d.n * d.r} FCFA`],
          hints: ["La recette est l'argent encaissé grâce aux ventes.", "On vend chaque ananas au même prix.", "Recette = nombre d'ananas × prix de vente.", `Multiplie ${d.n} par ${d.r}.`],
          erreurs: [{ reponse: P, message: "Tu as donné ce qu'elle a payé. La recette se calcule avec le prix de VENTE." }],
          points: 1,
        },
        {
          texte: "Quel est son bénéfice (en FCFA) ?", answer: num(d.n * (d.r - d.u), 0, "FCFA"),
          methode: "Bénéfice = recette − prix d'achat total.",
          etapes: [`Recette : ${d.n * d.r} FCFA`, `Achat : ${P} FCFA`, `Bénéfice : ${d.n * d.r} − ${P} = ${d.n * (d.r - d.u)} FCFA`],
          hints: ["Le bénéfice est ce qui reste quand on a remboursé l'achat.", "Il faut comparer ce qu'elle a encaissé et ce qu'elle a dépensé.", "Bénéfice = recette − dépense.", `Soustrais ${P} à la recette de la question 3.`],
          erreurs: [{ reponse: d.n * d.r, message: "C'est la recette, pas le bénéfice : il faut encore retirer le prix d'achat." }],
          points: 1,
        },
      ],
    };
    const verifier = () => {
      const e: string[] = [];
      // Tableau de proportionnalité : prix(m) = P × m / n doit être entier et égal à m × u.
      ok((P * d.m) % d.n === 0 && (P * d.m) / d.n === d.m * d.u, "tableau de proportionnalité incohérent", e);
      ok(d.r > d.u, "prix de vente ≤ prix d'achat", e);
      ok(d.n * d.r - P === d.n * (d.r - d.u), "bénéfice incohérent", e);
      ok(d.m !== d.n, "m = n : la question 2 serait triviale", e);
      return e;
    };
    return { instance, verifier };
  },
});

// =====================================================================
// 2. 4e — Pythagore (direct + réciproque) : l'équerre du maçon
// =====================================================================
const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15]];
interface D2 { who: string; a: number; b: number; c: number; m10: number }
registerProbleme({
  id: "pb-4e-equerre", origine: "redige", statut: "verifie-code", titre: "L'équerre du maçon",
  niveau: "4e", series: [], chapitre: "Géométrie", notionId: N("maths", "4e", "Théorème de Pythagore"),
  competence: "Utiliser le théorème de Pythagore et sa réciproque pour contrôler un angle droit",
  objectif: "Calculer l'hypoténuse, comparer AC² et AB² + BC², puis conclure par la réciproque.",
  prerequis: ["Carré d'un nombre", "Triangle rectangle et hypoténuse", "Comparaison de nombres décimaux"],
  difficulte: 2, contexte: "construction", contexteLabel: "Sur un chantier",
  source: { type: "original", reference: "Rédigé pour DeclickMath, à rapprocher du chapitre « Théorème de Pythagore » du manuel de 4ème (page à préciser)" },
  programme: { pays: "BJ", reference: "Programme béninois de 4ème non consulté (dossier docs/benin vide)", verifie: false },
  aValider: ["Pratique réelle du tracé par triangle 3-4-5 : formulation à relire par un enseignant", "Rattachement au programme béninois"],
  tirer(seed) {
    const r = rng(seed * 130363 + 5);
    const [a0, b0, c0] = pick(r, TRIPLES);
    const k = pick(r, [1, 1, 2]);
    const a = a0 * k, b = b0 * k, c = c0 * k;
    const droit = r() < 0.5;
    const delta = pick(r, [2, 3, 4]) * (r() < 0.5 ? -1 : 1); // écart en dm
    const d: D2 = { who: pick(r, PRENOMS_BJ), a, b, c, m10: droit ? c * 10 : c * 10 + delta };
    const m = d.m10 / 10;
    const s = a * a + b * b;
    const m2 = arr(m * m, 2);
    const verdictDroit = Math.abs(m2 - s) < 1e-9;
    const instance: InstancePb = {
      enonce: `À Parakou, ${d.who}, maçon, implante une maison. Il plante trois piquets A, B et C tels que AB = ${a} m et BC = ${b} m. Pour savoir si l'angle en B est droit, il mesure la distance AC et trouve ${fr(m)} m.`,
      questions: [
        {
          texte: "Calcule AB² + BC² (en m²).", answer: num(s, 0, "m²"),
          methode: "Élever chaque longueur au carré puis additionner.",
          etapes: [`AB² = ${a}² = ${a * a}`, `BC² = ${b}² = ${b * b}`, `AB² + BC² = ${a * a} + ${b * b} = ${s}`],
          hints: ["On calcule la somme des carrés des deux côtés qui se rejoignent en B.", "Le carré d'un nombre, c'est ce nombre multiplié par lui-même.", "Calcule AB², puis BC², puis additionne.", `AB² = ${a} × ${a}.`],
          erreurs: [{ reponse: (a + b) * (a + b), message: `Tu as calculé (AB + BC)². Il faut le carré de chaque longueur, puis la somme : AB² + BC².` }],
          points: 1,
        },
        {
          texte: "Si l'angle en B était droit, quelle longueur AC (en m) devrait-on mesurer ?", answer: num(c, 0, "m"),
          methode: "Pythagore dans ABC rectangle en B : AC² = AB² + BC², donc AC = √(AB² + BC²).",
          etapes: [`AC² = AB² + BC² = ${s}`, `AC = √${s} = ${c} m`],
          hints: ["Dans un triangle rectangle, l'hypoténuse est le côté opposé à l'angle droit.", "Ici l'hypoténuse est [AC] : on utilise le théorème de Pythagore.", "AC² = AB² + BC², puis on prend la racine carrée.", `Cherche le nombre positif dont le carré vaut ${s}.`],
          erreurs: [{ reponse: s, message: `${s} est AC², pas AC : il reste à prendre la racine carrée.` }, { reponse: a + b, message: "On n'additionne pas les longueurs : on additionne leurs carrés, puis on prend la racine carrée." }],
          points: 1,
        },
        {
          texte: "Calcule AC² avec la mesure du maçon (en m², tu peux écrire les décimales).", answer: num(m2, 0.005, "m²"),
          methode: "Élever au carré la longueur mesurée.",
          etapes: [`AC mesuré = ${fr(m)} m`, `AC² = ${fr(m)}² = ${fr(m2)}`],
          hints: ["On utilise maintenant la longueur réellement mesurée.", "Même opération qu'avant : un carré.", `Multiplie ${fr(m)} par lui-même.`, `${fr(m)} × ${fr(m)}.`],
          erreurs: [{ reponse: arr(m * 2, 2), message: "Tu as doublé la mesure. Le carré, c'est la mesure multipliée par elle-même." }],
          points: 1,
        },
        {
          texte: "L'angle en B est-il droit ? (compare AC² et AB² + BC²)",
          answer: choice(r, ["Oui, l'angle en B est droit", "Non, l'angle en B n'est pas droit"], verdictDroit ? 0 : 1),
          methode: "Réciproque de Pythagore : si AC² = AB² + BC², alors ABC est rectangle en B ; sinon il ne l'est pas.",
          etapes: [`AB² + BC² = ${s}`, `AC² = ${fr(m2)}`, verdictDroit ? "Les deux nombres sont égaux : d'après la réciproque de Pythagore, l'angle en B est droit." : "Les deux nombres sont différents : l'angle en B n'est pas droit (sinon l'égalité de Pythagore serait vraie)."],
          hints: ["Il faut comparer deux nombres que tu viens de calculer.", "L'égalité de Pythagore n'est vraie que si l'angle est droit.", "Compare AC² (question 3) et AB² + BC² (question 1).", `Regarde si ${s} et ${fr(m2)} sont égaux.`],
          erreurs: [],
          points: 1,
        },
      ],
    };
    const verifier = () => {
      const e: string[] = [];
      // Entiers uniquement (mesure en dm) : aucune erreur d'arrondi.
      ok(sq(a) + sq(b) === sq(c), "triplet non pythagoricien", e);
      ok((sq(a) + sq(b)) * 100 === sq(d.m10) === verdictDroit, "verdict incohérent avec la comparaison exacte", e);
      ok(Math.abs(m * m - m2) < 0.0051, "AC² mal arrondi", e);
      ok(m > 0 && m < a + b, "mesure impossible : inégalité triangulaire violée", e);
      return e;
    };
    return { instance, verifier };
  },
});

// =====================================================================
// 3. 3e — Système de deux équations : deux paniers au marché
// =====================================================================
interface D3 { who: string; who2: string; x: number; y: number; a1: number; b1: number; a2: number; b2: number; a3: number; b3: number }
registerProbleme({
  id: "pb-3e-paniers", origine: "redige", statut: "verifie-code", titre: "Deux paniers au marché",
  niveau: "3e", series: [], chapitre: "Algèbre", notionId: N("maths", "3e", "Systèmes d'équations"),
  competence: "Mettre un problème en système de deux équations à deux inconnues et le résoudre",
  objectif: "Choisir les inconnues, écrire deux équations, résoudre (élimination ou substitution), puis réutiliser la solution.",
  prerequis: ["Équation du premier degré", "Distributivité", "Choix d'une inconnue"],
  difficulte: 2, contexte: "marche-systeme", contexteLabel: "Au marché de gari et de haricots",
  source: { type: "original", reference: "Rédigé pour DeclickMath, à rapprocher du chapitre « Systèmes d'équations » du manuel de 3ème (page à préciser)" },
  programme: { pays: "BJ", reference: "Programme béninois de 3ème non consulté (dossier docs/benin vide)", verifie: false },
  aValider: ["Prix du gari et du haricot au kilogramme : ordres de grandeur", "Rattachement au programme béninois"],
  tirer(seed) {
    const r = rng(seed * 15485863 + 3);
    let d: D3 | null = null;
    for (let t = 0; t < 200 && !d; t++) {
      const c = () => int(r, 1, 6);
      const [a1, b1, a2, b2, a3, b3] = [c(), c(), c(), c(), c(), c()];
      if (a1 * b2 - a2 * b1 === 0 || a3 === b3 || (a3 === a1 && b3 === b1) || (a3 === a2 && b3 === b2)) continue; // a3 ≠ b3 : sinon l'inversion x/y donnerait aussi le bon total
      d = { who: pick(r, PRENOMS_BJ), who2: pick(r, PRENOMS_BJ.filter((p) => p !== "Koffi")), x: pick(r, [400, 450, 500, 600, 650, 700, 750]), y: pick(r, [900, 1000, 1100, 1200, 1400]), a1, b1, a2, b2, a3, b3 };
      if (d.who2 === d.who) d.who2 = PRENOMS_BJ[(PRENOMS_BJ.indexOf(d.who) + 1) % PRENOMS_BJ.length];
    }
    if (!d) throw new Error("pb-3e-paniers : aucun jeu de coefficients valide");
    const T1 = d.a1 * d.x + d.b1 * d.y, T2 = d.a2 * d.x + d.b2 * d.y, T3 = d.a3 * d.x + d.b3 * d.y;
    const instance: InstancePb = {
      enonce: `Au marché, le gari et le haricot sont vendus au kilogramme, à prix fixes. ${d.who} achète ${d.a1} kg de gari et ${d.b1} kg de haricot : elle paie ${fcfa(T1)}. ${d.who2} achète ${d.a2} kg de gari et ${d.b2} kg de haricot : elle paie ${fcfa(T2)}.\nOn note x le prix d'un kilogramme de gari et y celui d'un kilogramme de haricot (en FCFA).`,
      questions: [
        {
          texte: "Quel est le prix d'un kilogramme de gari (x, en FCFA) ?", answer: num(d.x, 0, "FCFA"),
          methode: `Écrire le système ${d.a1}x + ${d.b1}y = ${T1} et ${d.a2}x + ${d.b2}y = ${T2}, puis éliminer y (ou x) et résoudre.`,
          etapes: [`Équations : ${d.a1}x + ${d.b1}y = ${T1} et ${d.a2}x + ${d.b2}y = ${T2}`, `Multiplier la 1re par ${d.b2} et la 2e par ${d.b1} : ${d.a1 * d.b2}x + ${d.b1 * d.b2}y = ${T1 * d.b2} et ${d.a2 * d.b1}x + ${d.b1 * d.b2}y = ${T2 * d.b1}`, `Soustraire : ${d.a1 * d.b2 - d.a2 * d.b1}x = ${T1 * d.b2 - T2 * d.b1}`, `x = ${T1 * d.b2 - T2 * d.b1} ÷ ${d.a1 * d.b2 - d.a2 * d.b1} = ${d.x} FCFA`],
          hints: ["On cherche le prix d'un seul kilogramme de gari.", "Chaque achat donne une équation avec deux inconnues x et y.", "Pour éliminer y, rends les coefficients de y égaux dans les deux équations, puis soustrais.", `Écris d'abord : ${d.a1}x + ${d.b1}y = ${T1}.`],
          erreurs: [{ reponse: d.y, message: "Tu as donné le prix du haricot (y). On demande x, le prix du gari." }],
          points: 2,
        },
        {
          texte: "Quel est le prix d'un kilogramme de haricot (y, en FCFA) ?", answer: num(d.y, 0, "FCFA"),
          methode: "Remplacer x par sa valeur dans une des équations, puis résoudre l'équation en y.",
          etapes: [`Avec x = ${d.x} dans ${d.a1}x + ${d.b1}y = ${T1} : ${d.a1 * d.x} + ${d.b1}y = ${T1}`, `${d.b1}y = ${T1 - d.a1 * d.x}`, `y = ${T1 - d.a1 * d.x} ÷ ${d.b1} = ${d.y} FCFA`],
          hints: ["Une fois x connu, il ne reste qu'une inconnue.", "Remplace x par sa valeur dans l'une des deux équations.", "Résous l'équation du premier degré en y obtenue.", `Calcule ${d.a1} × ${d.x}, puis retire-le de ${T1}.`],
          erreurs: [{ reponse: d.x, message: "Tu as redonné le prix du gari. Il faut maintenant trouver y avec la valeur de x." }],
          points: 2,
        },
        {
          texte: `Quel est le prix de ${d.a3} kg de gari et ${d.b3} kg de haricot (en FCFA) ?`, answer: num(T3, 0, "FCFA"),
          methode: "Utiliser les prix unitaires trouvés.",
          etapes: [`${d.a3} × ${d.x} + ${d.b3} × ${d.y} = ${d.a3 * d.x} + ${d.b3 * d.y} = ${T3} FCFA`],
          hints: ["On réutilise les deux prix trouvés.", "Chaque produit : quantité × prix du kilogramme.", "Additionne le prix du gari et celui du haricot.", `Calcule ${d.a3} × ${d.x}.`],
          erreurs: [{ reponse: d.a3 * d.y + d.b3 * d.x, message: "Vérifie quelle quantité correspond à quel produit : les kg de gari se multiplient par x, ceux de haricot par y." }],
          points: 1,
        },
      ],
    };
    const dd = d;
    const verifier = () => {
      const e: string[] = [];
      // Recherche exhaustive sur une grille de pas 50 : exactement une solution, égale à (x, y).
      const sols: [number, number][] = [];
      for (let x = 0; x <= 3000; x += 50) for (let y = 0; y <= 3000; y += 50) if (dd.a1 * x + dd.b1 * y === T1 && dd.a2 * x + dd.b2 * y === T2) sols.push([x, y]);
      ok(sols.length === 1 && sols[0][0] === dd.x && sols[0][1] === dd.y, `solution du système non unique ou différente (${JSON.stringify(sols)})`, e);
      ok(dd.a1 * dd.b2 - dd.a2 * dd.b1 !== 0, "déterminant nul", e);
      ok(T3 === dd.a3 * dd.x + dd.b3 * dd.y, "total du 3e panier incohérent", e);
      return e;
    };
    return { instance, verifier };
  },
});

// =====================================================================
// 4. Seconde — Inéquation du premier degré : deux formules de location
// =====================================================================
interface D4 { who: string; f: number; p1: number; p2: number; k: number; K: number }
registerProbleme({
  id: "pb-2nde-location", origine: "redige", statut: "verifie-code", titre: "Deux formules de location de moto",
  niveau: "2nde", series: [], chapitre: "Fonctions", notionId: N("maths", "2nde", "Équations et inéquations"),
  competence: "Modéliser une comparaison de tarifs par une inéquation du premier degré et interpréter la solution entière",
  objectif: "Exprimer deux coûts en fonction du nombre de km, résoudre l'inéquation, retenir le plus petit entier qui convient (inégalité stricte).",
  prerequis: ["Fonction affine", "Résolution d'une équation du premier degré", "Inéquation et sens de l'inégalité"],
  difficulte: 2, contexte: "transport", contexteLabel: "Transport",
  source: { type: "original", reference: "Rédigé pour DeclickMath, à rapprocher du chapitre « Équations et inéquations » du manuel de Seconde (page à préciser)" },
  programme: { pays: "BJ", reference: "Programme béninois de Seconde non consulté (dossier docs/benin vide)", verifie: false },
  aValider: ["Tarifs de location de moto : ordres de grandeur", "Rattachement au programme béninois"],
  tirer(seed) {
    const r = rng(seed * 32452843 + 7);
    const delta = pick(r, [25, 50, 75]);
    const p1 = pick(r, [50, 75, 100]);
    const f = pick(r, [1500, 2000, 2500, 3000, 3500, 4000]);
    const p2 = p1 + delta;
    const seuil = Math.floor(f / delta) + 1; // plus petit entier avec f + p1·k < p2·k
    const d: D4 = { who: pick(r, PRENOMS_BJ), f, p1, p2, k: pick(r, [30, 40, 50, 60]), K: seuil + pick(r, [15, 25, 35]) };
    const A = (k: number) => d.f + d.p1 * k, B = (k: number) => d.p2 * k;
    const instance: InstancePb = {
      enonce: `Une agence de Cotonou loue des motos à la journée. Formule A : ${fcfa(d.f)} par jour, plus ${fcfa(d.p1)} par kilomètre parcouru. Formule B : aucun forfait, mais ${fcfa(d.p2)} par kilomètre parcouru.\n${d.who} veut choisir la formule la moins chère selon le nombre de kilomètres qu'il va parcourir dans la journée.`,
      questions: [
        {
          texte: `Quel est le coût de la formule A pour ${d.k} km (en FCFA) ?`, answer: num(A(d.k), 0, "FCFA"),
          methode: "Coût A = forfait + prix du km × nombre de km.",
          etapes: [`${d.f} + ${d.p1} × ${d.k} = ${d.f} + ${d.p1 * d.k} = ${A(d.k)} FCFA`],
          hints: ["On calcule ce que coûte la formule A pour cette distance.", "Il y a une partie fixe et une partie qui dépend des km.", "Coût = forfait + prix du km × nombre de km.", `Calcule ${d.p1} × ${d.k}, puis ajoute ${d.f}.`],
          erreurs: [{ reponse: d.p1 * d.k, message: "Tu as oublié le forfait journalier de la formule A." }],
          points: 1,
        },
        {
          texte: `Quel est le coût de la formule B pour ${d.k} km (en FCFA) ?`, answer: num(B(d.k), 0, "FCFA"),
          methode: "Coût B = prix du km × nombre de km (pas de forfait).",
          etapes: [`${d.p2} × ${d.k} = ${B(d.k)} FCFA`],
          hints: ["La formule B n'a pas de forfait.", "Le coût est proportionnel à la distance.", "Coût = prix du km × nombre de km.", `Multiplie ${d.p2} par ${d.k}.`],
          erreurs: [{ reponse: d.f + d.p2 * d.k, message: "La formule B n'a pas de forfait : n'ajoute pas les " + d.f + " FCFA." }],
          points: 1,
        },
        {
          texte: "À partir de combien de kilomètres (nombre entier minimal) la formule A est-elle strictement moins chère que la formule B ?", answer: num(seuil, 0, "km"),
          methode: `Résoudre ${d.f} + ${d.p1}x < ${d.p2}x, avec x entier, puis retenir le plus petit entier qui convient.`,
          etapes: [`On veut ${d.f} + ${d.p1}x < ${d.p2}x`, `${d.f} < ${d.p2 - d.p1}x`, `x > ${d.f} ÷ ${d.p2 - d.p1} = ${fr(arr(d.f / (d.p2 - d.p1), 3))}`, `Plus petit entier strictement supérieur : ${seuil} km`],
          hints: ["On cherche à partir de quelle distance A devient avantageuse.", "A est moins cher quand f + p₁x est plus petit que p₂x : c'est une inéquation.", "Isole x : regroupe les termes en x d'un côté, le forfait de l'autre.", `Écris ${d.f} + ${d.p1}x < ${d.p2}x puis soustrais ${d.p1}x des deux côtés.`],
          erreurs: [{ reponse: Math.floor(d.f / (d.p2 - d.p1)), message: "Pour ce nombre de km, A n'est pas encore strictement moins cher (les deux formules coûtent autant, ou B reste moins chère). L'inégalité est stricte : prends l'entier suivant." }],
          points: 2,
        },
        {
          texte: `Pour ${d.K} km, quelle économie réalise-t-on en choisissant la formule A plutôt que B (en FCFA) ?`, answer: num(B(d.K) - A(d.K), 0, "FCFA"),
          methode: "Économie = coût B − coût A pour la même distance.",
          etapes: [`B(${d.K}) = ${d.p2} × ${d.K} = ${B(d.K)} FCFA`, `A(${d.K}) = ${d.f} + ${d.p1} × ${d.K} = ${A(d.K)} FCFA`, `Économie : ${B(d.K)} − ${A(d.K)} = ${B(d.K) - A(d.K)} FCFA`],
          hints: ["Il faut comparer les deux coûts pour la même distance.", "L'économie est la différence entre le coût le plus élevé et le plus faible.", "Calcule le coût de chaque formule pour ce nombre de km.", `Calcule ${d.p2} × ${d.K} pour la formule B.`],
          erreurs: [{ reponse: A(d.K) - B(d.K), message: "Ton résultat est négatif : à cette distance c'est A qui est moins cher, donc l'économie est positive. Inverse la soustraction." }],
          points: 1,
        },
      ],
    };
    const verifier = () => {
      const e: string[] = [];
      // Recherche par balayage (autre méthode que la résolution algébrique) : premier k à partir duquel A < B pour tous les k suivants.
      let first = -1;
      for (let k = 0; k <= 5000; k++) if (A(k) < B(k)) { first = k; break; }
      ok(first === seuil, `seuil algébrique ${seuil} ≠ balayage ${first}`, e);
      ok(A(first - 1) >= B(first - 1), "A déjà moins cher au km précédent", e);
      ok(d.K > seuil && B(d.K) - A(d.K) > 0, "économie non positive", e);
      ok(d.p2 > d.p1, "formule B moins chère au km : le problème perd son sens", e);
      return e;
    };
    return { instance, verifier };
  },
});

// =====================================================================
// 5. Première — Suites arithmétiques : l'épargne de la machine à coudre
// =====================================================================
interface D5 { who: string; a: number; r: number; n: number; O: number; m: number }
const S = (a: number, r: number, n: number) => (n * (2 * a + (n - 1) * r)) / 2;
registerProbleme({
  id: "pb-1ere-epargne", origine: "redige", statut: "verifie-code", titre: "L'épargne pour la machine à coudre",
  niveau: "1ere", series: [], chapitre: "Algèbre", notionId: N("maths", "1ere", "Suites arithmétiques"),
  competence: "Reconnaître une suite arithmétique, calculer un terme et une somme, résoudre une inéquation en n",
  objectif: "Utiliser uₙ = u₁ + (n − 1)r et Sₙ = n(u₁ + uₙ)/2 dans une situation d'épargne, puis trouver le premier rang qui atteint un objectif.",
  prerequis: ["Suite numérique", "Résolution d'une inéquation du second degré (ou essais méthodiques)", "Racine carrée"],
  difficulte: 3, contexte: "epargne", contexteLabel: "Épargne",
  source: { type: "original", reference: "Rédigé pour DeclickMath, à rapprocher du chapitre « Suites arithmétiques » du manuel de Première (page à préciser)" },
  programme: { pays: "BJ", reference: "Programme béninois de Première non consulté (dossier docs/benin vide)", verifie: false },
  aValider: ["Montants d'épargne et prix d'une machine à coudre : ordres de grandeur", "Séries de Première concernées par ce chapitre au Bénin", "Rattachement au programme béninois"],
  tirer(seed) {
    const r = rng(seed * 49979687 + 13);
    // On tire (a, r, m) jusqu'à trouver un objectif rond STRICTEMENT entre S(m−1) et S(m) :
    // la racine de l'inéquation n'est alors jamais entière, donc « arrondir à l'inférieur » est toujours une vraie erreur.
    let a = 0, rr = 0, m = 0, n = 0, O = 0;
    for (let t = 0; t < 500 && !O; t++) {
      a = pick(r, [2000, 2500, 3000, 4000, 5000]);
      rr = pick(r, [500, 1000, 1500]);
      m = int(r, 12, 22);
      const lo = S(a, rr, m - 1), hi = S(a, rr, m);
      for (const pas of [5000, 1000, 500]) {
        const cand = Math.floor((hi - 1) / pas) * pas;
        if (cand > lo) { O = cand; break; }
      }
    }
    if (!O) throw new Error("pb-1ere-epargne : aucun objectif rond valide");
    n = int(r, 8, Math.min(14, m - 2));
    const d: D5 = { who: pick(r, PRENOMS_BJ), a, r: rr, n, O, m };
    const un = a + (n - 1) * rr, Sn = S(a, rr, n);
    // Résolution algébrique : r·n² + (2a − r)·n − 2·O ≥ 0
    const b = 2 * a - rr, disc = b * b + 8 * rr * O;
    const racine = (-b + Math.sqrt(disc)) / (2 * rr);
    const nMin = Math.ceil(racine - 1e-9);
    const instance: InstancePb = {
      enonce: `${d.who} veut acheter une machine à coudre à ${fcfa(O)}. Elle épargne chaque mois : le 1er mois elle verse ${fcfa(a)}, et chaque mois suivant elle verse ${fcfa(rr)} de plus que le mois précédent.\nOn note uₙ son versement au n-ième mois (u₁ = ${a}).`,
      questions: [
        {
          texte: `Quel est son versement au mois ${n} (en FCFA) ?`, answer: num(un, 0, "FCFA"),
          methode: "Suite arithmétique de premier terme u₁ et de raison r : uₙ = u₁ + (n − 1) × r.",
          etapes: [`Raison : r = ${rr}`, `u${n} = ${a} + (${n} − 1) × ${rr} = ${a} + ${(n - 1) * rr} = ${un} FCFA`],
          hints: ["Chaque mois, le versement augmente du même montant : c'est une suite arithmétique.", `Entre le mois 1 et le mois ${n}, il y a ${n - 1} augmentations (et non ${n}).`, "uₙ = u₁ + (n − 1) × r.", `Calcule ${n - 1} × ${rr}, puis ajoute ${a}.`],
          erreurs: [{ reponse: a + n * rr, message: `Attention au décalage : le mois 1 correspond à u₁ = ${a}, il n'a pas encore eu d'augmentation. Pour le mois ${n}, il y a ${n - 1} augmentations, pas ${n}.` }],
          points: 2,
        },
        {
          texte: `Quelle somme totale a-t-elle épargnée au bout de ${n} mois (en FCFA) ?`, answer: num(Sn, 0, "FCFA"),
          methode: "Somme des n premiers termes : Sₙ = n × (u₁ + uₙ) ÷ 2.",
          etapes: [`u${n} = ${un}`, `S${n} = ${n} × (${a} + ${un}) ÷ 2 = ${n} × ${a + un} ÷ 2 = ${Sn} FCFA`],
          hints: ["On additionne tous les versements des mois 1 à " + n + ".", "Pour une suite arithmétique, il existe une formule qui évite d'additionner un par un.", "Sₙ = n × (premier terme + dernier terme) ÷ 2.", `Additionne ${a} et ${un}, multiplie par ${n}, puis divise par 2.`],
          erreurs: [{ reponse: n * un, message: `${n} × u${n} compte tous les mois comme s'ils valaient le dernier versement. Il faut la moyenne du premier et du dernier terme : (u₁ + u${n}) ÷ 2.` }],
          points: 2,
        },
        {
          texte: `Au bout de combien de mois (nombre entier minimal) aura-t-elle épargné au moins ${fcfa(O)} ?`, answer: num(nMin, 0, "mois"),
          methode: `Résoudre Sₙ ≥ ${O}, c'est-à-dire ${rr}n² + ${b}n − ${2 * O} ≥ 0, puis retenir le plus petit entier n qui convient.`,
          etapes: [`Sₙ = n(2 × ${a} + (n − 1) × ${rr}) ÷ 2 ≥ ${O}`, `${rr}n² + ${b}n − ${2 * O} ≥ 0`, `Racine positive : n₀ = (−${b} + √${disc}) ÷ ${2 * rr} ≈ ${fr(arr(racine, 3))}`, `Plus petit entier ≥ n₀ : n = ${nMin} mois`],
          hints: ["On cherche le premier mois où le total atteint l'objectif.", "Écris Sₙ avec la formule en n, puis compare à l'objectif : c'est une inéquation en n.", "Mets l'inéquation sous la forme (polynôme en n) ≥ 0 et cherche la racine positive.", `Développe : n(2 × ${a} + (n − 1) × ${rr}) ÷ 2 ≥ ${O}.`],
          erreurs: [{ reponse: Math.floor(racine), message: "Au rang trouvé en arrondissant à l'entier inférieur, l'objectif n'est pas encore atteint. Prends l'entier supérieur." }],
          points: 3,
        },
      ],
    };
    const verifier = () => {
      const e: string[] = [];
      // Simulation mois par mois (autre méthode que les formules).
      let verse = d.a, total = 0, first = -1, uSim = 0, sSim = 0;
      for (let k = 1; k <= 400; k++) {
        total += verse;
        if (k === d.n) { uSim = verse; sSim = total; }
        if (first < 0 && total >= d.O) first = k;
        verse += d.r;
      }
      ok(uSim === un, `u_n formule ${un} ≠ simulation ${uSim}`, e);
      ok(sSim === Sn, `S_n formule ${Sn} ≠ simulation ${sSim}`, e);
      ok(first === nMin, `rang minimal formule ${nMin} ≠ simulation ${first}`, e);
      ok(first === d.m, "objectif construit pour le mois m mais atteint à un autre mois", e);
      ok(d.n < nMin, "n ≥ rang de l'objectif : questions 2 et 3 sans intérêt", e);
      return e;
    };
    return { instance, verifier };
  },
});

// =====================================================================
// 6. Terminale C/D — Loi binomiale : le contrôle des sachets de noix de cajou
// =====================================================================
interface D6 { who: string; n: number; p: number; k: number }
const pascal = (n: number): number[] => { let row = [1]; for (let i = 0; i < n; i++) row = [1, ...row.slice(1).map((v, j) => v + row[j]), 1].slice(0, i + 2); return row; };
registerProbleme({
  id: "pb-tle-cajou", origine: "redige", statut: "verifie-code", titre: "Le contrôle des sachets de noix de cajou",
  niveau: "tle", series: ["C", "D"], chapitre: "Probabilités", notionId: N("maths", "tle", "Loi binomiale"),
  competence: "Reconnaître une loi binomiale, calculer P(X = k), P(X = 0), P(X ≥ 1) et l'espérance",
  objectif: "Justifier B(n ; p), utiliser C(n,k)pᵏ(1 − p)ⁿ⁻ᵏ, passer par l'événement contraire pour « au moins un », arrondir à 10⁻³.",
  prerequis: ["Combinaisons", "Épreuve de Bernoulli", "Événement contraire", "Arrondi"],
  difficulte: 2, contexte: "controle-qualite", contexteLabel: "Contrôle qualité",
  source: { type: "original", reference: "Rédigé pour DeclickMath, à rapprocher du chapitre « Loi binomiale » du manuel de Terminale (page à préciser)" },
  programme: { pays: "BJ", reference: "Programme béninois de Terminale non consulté (dossier docs/benin vide) ; séries C et D à confirmer", verifie: false },
  aValider: ["Séries de Terminale où la loi binomiale est au programme au Bénin", "Fréquences de défaut réalistes", "Rattachement au programme béninois"],
  tirer(seed) {
    const r = rng(seed * 86028121 + 17);
    const d: D6 = { who: pick(r, PRENOMS_BJ), n: pick(r, [6, 8, 10, 12]), p: pick(r, [0.05, 0.1, 0.2]), k: pick(r, [1, 2, 3]) };
    const q = 1 - d.p;
    const C = (n: number, k: number) => { let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return Math.round(c); };
    const pk = C(d.n, d.k) * d.p ** d.k * q ** (d.n - d.k);
    const p0 = q ** d.n;
    const pc = fr(d.p);
    const t = (x: number) => fr(arr(x, 3));
    const instance: InstancePb = {
      enonce: `Dans une coopérative de Parakou, on conditionne des noix de cajou en sachets. Chaque sachet a, indépendamment des autres, une probabilité ${pc} d'avoir un défaut de fermeture. ${d.who}, responsable qualité, prélève ${d.n} sachets au hasard (on assimile ce prélèvement à ${d.n} épreuves identiques et indépendantes). Soit X le nombre de sachets défectueux parmi ces ${d.n}.\nX suit la loi binomiale B(${d.n} ; ${pc}). Les probabilités sont à arrondir à 10⁻³.`,
      questions: [
        {
          texte: "Quel est le nombre moyen (espérance) de sachets défectueux dans un prélèvement ?", answer: num(arr(d.n * d.p, 6), 0.0005, "sachet(s)"),
          methode: "Pour X ~ B(n ; p), E(X) = n × p.",
          etapes: [`E(X) = ${d.n} × ${pc} = ${fr(arr(d.n * d.p, 6))}`],
          hints: ["On cherche la valeur moyenne de X sur beaucoup de prélèvements.", "Pour une loi binomiale, l'espérance a une formule simple.", "E(X) = n × p.", `Multiplie ${d.n} par ${pc}.`],
          erreurs: [{ reponse: arr(d.n * q, 6), message: "Tu as calculé le nombre moyen de sachets SANS défaut (n × (1 − p)). On demande le nombre moyen de sachets défectueux." }],
          points: 1,
        },
        {
          texte: "Calcule P(X = 0), la probabilité qu'aucun sachet ne soit défectueux.", answer: num(arr(p0, 3), 0.0005),
          methode: "P(X = 0) = (1 − p)ⁿ : les n sachets sont tous sans défaut.",
          etapes: [`P(X = 0) = C(${d.n},0) × ${pc}⁰ × (1 − ${pc})^${d.n} = ${fr(arr(q, 2))}^${d.n} ≈ ${t(p0)}`],
          hints: ["Aucun défaut : chaque sachet doit être sans défaut.", "Les sachets sont indépendants : on multiplie les probabilités.", "P(X = 0) = (1 − p)ⁿ.", `Calcule ${fr(arr(q, 2))} puissance ${d.n}.`],
          erreurs: [{ reponse: arr(d.p ** d.n, 3), message: "Tu as calculé la probabilité que TOUS les sachets soient défectueux (pⁿ). Pour « aucun défectueux », chaque sachet est sans défaut : (1 − p)ⁿ." }],
          points: 2,
        },
        {
          texte: `Calcule P(X = ${d.k}).`, answer: num(arr(pk, 3), 0.0005),
          methode: "P(X = k) = C(n,k) × pᵏ × (1 − p)ⁿ⁻ᵏ.",
          etapes: [`C(${d.n},${d.k}) = ${C(d.n, d.k)}`, `P(X = ${d.k}) = ${C(d.n, d.k)} × ${pc}^${d.k} × ${fr(arr(q, 2))}^${d.n - d.k} ≈ ${t(pk)}`],
          hints: [`On cherche la probabilité d'avoir exactement ${d.k} sachet(s) défectueux(x).`, "Il y a plusieurs façons de choisir lesquels sont défectueux : il faut les compter.", "P(X = k) = C(n,k) × pᵏ × (1 − p)ⁿ⁻ᵏ.", `Calcule d'abord C(${d.n},${d.k}), le nombre de choix.`],
          erreurs: [{ reponse: arr(d.p ** d.k * q ** (d.n - d.k), 3), message: `Tu as oublié le coefficient binomial C(${d.n},${d.k}) : il compte les façons de choisir quels sachets sont défectueux.` }],
          points: 3,
        },
        {
          texte: "Calcule la probabilité qu'au moins un sachet soit défectueux, P(X ≥ 1).", answer: num(arr(1 - p0, 3), 0.0005),
          methode: "Événement contraire : P(X ≥ 1) = 1 − P(X = 0).",
          etapes: [`P(X ≥ 1) = 1 − P(X = 0) = 1 − ${t(p0)} ≈ ${t(1 - p0)}`],
          hints: ["« Au moins un » regroupe beaucoup de cas : X = 1, 2, 3…", "Il est plus simple de calculer la probabilité de l'événement contraire.", "P(X ≥ 1) = 1 − P(X = 0).", "Utilise le résultat de la question 2."],
          erreurs: [{ reponse: arr(p0, 3), message: "Tu as donné P(X = 0). « Au moins un » est l'événement CONTRAIRE de « aucun » : P(X ≥ 1) = 1 − P(X = 0)." }],
          points: 2,
        },
      ],
    };
    const verifier = () => {
      const e: string[] = [];
      // Loi complète par le triangle de Pascal (autre méthode que la formule du produit) : somme = 1, valeurs concordantes.
      const row = pascal(d.n);
      const pmf = row.map((c, j) => c * d.p ** j * q ** (d.n - j));
      ok(Math.abs(pmf.reduce((s, v) => s + v, 0) - 1) < 1e-12, "la loi ne somme pas à 1", e);
      ok(Math.abs(pmf[d.k] - pk) < 1e-12, "P(X=k) formule ≠ Pascal", e);
      ok(Math.abs(pmf[0] - p0) < 1e-12, "P(X=0) formule ≠ Pascal", e);
      ok(Math.abs(pmf.slice(1).reduce((s, v) => s + v, 0) - (1 - p0)) < 1e-12, "P(X≥1) ≠ somme des P(X=j), j ≥ 1", e);
      ok(Math.abs(pmf.reduce((s, v, j) => s + j * v, 0) - d.n * d.p) < 1e-12, "espérance ≠ Σ j·P(X=j)", e);
      // Réponses arrondies : jamais trop proches d'une frontière d'arrondi (sinon la tolérance prête à confusion).
      for (const v of [pk, p0, 1 - p0]) ok(Math.abs(v * 1000 - Math.round(v * 1000 - 0.5) - 0.5) > 0.02, `valeur ${v} trop proche d'une frontière d'arrondi`, e);
      return e;
    };
    return { instance, verifier };
  },
});
