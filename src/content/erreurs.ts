// Types d'erreurs reconnus par le suivi des connaissances.
// Les erreurs « génériques » sont devinées en comparant la réponse de l'élève à la bonne réponse ;
// les erreurs « spécifiques » sont déclarées par les exercices pas à pas (étapes), qui savent précisément ce qu'a fait l'élève.
import { Answer, parseNumeric } from "./core";

export interface ErrInfo {
  label: string;
  /** Ce qu'on dit à l'élève : comprendre l'erreur, pas seulement la corriger. */
  advice: string;
}

export const ERR_TAGS: Record<string, ErrInfo> = {
  // ----- génériques (déduites de la réponse numérique) -----
  signe: { label: "Erreur de signe", advice: "Ton résultat est l'opposé du bon. Regarde chaque signe − : quand tu retranches ou que tu passes un terme de l'autre côté, le signe change." },
  "puissance-10": { label: "Virgule ou zéros mal placés", advice: "Ton résultat est 10 ou 100 fois trop grand (ou trop petit). Vérifie la place de la virgule et le nombre de zéros." },
  "decalage-1": { label: "Erreur d'un cran", advice: "Tu es à 1 près : souvent un oubli ou un doublon à une extrémité (compter les deux bouts, oublier de retirer 1…). Recompte avec un petit exemple." },
  inverse: { label: "Nombre renversé", advice: "Tu as donné l'inverse du bon résultat. Vérifie ce qui doit être au numérateur et ce qui doit être au dénominateur." },
  operande: { label: "Donnée recopiée", advice: "Ta réponse est un nombre de l'énoncé : tu t'es arrêté(e) avant la fin du calcul. Demande-toi : qu'est-ce que l'énoncé veut que je trouve ?" },
  proche: { label: "Calcul presque juste", advice: "Tu y es presque : la méthode semble bonne, mais une étape de calcul est fausse. Refais le calcul lentement, une opération à la fois." },
  calcul: { label: "Méthode à revoir", advice: "Ta réponse est éloignée du résultat. Relis l'énoncé, repère ce qu'on cherche, puis reprends la méthode du cours étape par étape." },
  illisible: { label: "Réponse mal écrite", advice: "Ta réponse n'est pas un nombre lisible. Écris un nombre (ou une fraction a/b) sans lettres ni symboles." },
  confusion: { label: "Mauvais choix de réponse", advice: "Tu as choisi une réponse qui ressemble à la bonne. Relis chaque proposition en cherchant ce qui la rend fausse." },
  // ----- spécifiques (exercices pas à pas) -----
  "oubli-distribution": { label: "Oubli de distribuer", advice: "Quand on multiplie k(a + b), le facteur k multiplie chaque terme de la parenthèse : k×a ET k×b." },
  "operation-non-inversee": { label: "Opération mal inversée", advice: "Pour isoler x, on fait l'opération contraire : on soustrait ce qu'on a ajouté, on divise ce qu'on a multiplié." },
  "terme-mal-deplace": { label: "Terme déplacé sans changer de signe", advice: "Quand un terme change de côté du signe =, il change de signe (+ devient −, − devient +)." },
  "signe-inegalite": { label: "Sens de l'inégalité non changé", advice: "Quand on multiplie ou divise les deux côtés par un nombre NÉGATIF, l'ordre s'inverse : < devient > (et inversement)." },
  "fractions-additionnees": { label: "Numérateurs et dénominateurs additionnés", advice: "On n'additionne pas les dénominateurs ! On les met d'abord au même dénominateur, puis on additionne seulement les numérateurs." },
  "denominateur-commun": { label: "Dénominateur commun mal trouvé", advice: "Le dénominateur commun doit être un multiple des deux dénominateurs ; le plus petit est le PPCM." },
  "carre-oublie": { label: "Carré non calculé", advice: "Dans a² + b² = c², il faut élever chaque longueur AU CARRÉ avant d'additionner." },
  "racine-oubliee": { label: "Racine carrée oubliée", advice: "a² + b² donne le carré de l'hypoténuse : il faut prendre la racine carrée pour obtenir la longueur." },
  "hypotenuse-confondue": { label: "Hypoténuse confondue avec un côté", advice: "L'hypoténuse est le côté opposé à l'angle droit : c'est le plus long. Pour un côté de l'angle droit, on SOUSTRAIT les carrés." },
  "pourcentage-ajoute": { label: "Remise ajoutée au lieu d'être retranchée", advice: "Une remise diminue le prix : prix final = prix − remise." },
  "pourcentage-sans-base": { label: "Pourcentage appliqué au mauvais nombre", advice: "Un pourcentage se calcule sur le prix de départ : p % de P = P × p ÷ 100." },
  "discriminant-signe": { label: "Erreur dans le discriminant", advice: "Δ = b² − 4ac : attention au signe de 4ac quand a ou c est négatif, et à (−b)² = b²." },
  "derivee-puissance": { label: "Dérivée d'une puissance mal calculée", advice: "(x^n)' = n·x^(n−1) : on multiplie par l'exposant, puis l'exposant diminue de 1." },
  "perimetre-aire": { label: "Périmètre et aire confondus", advice: "Le périmètre est la longueur du contour (on additionne des longueurs) ; l'aire mesure la surface (on multiplie)." },
  "derivee-produit": { label: "Dérivée d'un produit mal calculée", advice: "(u·v)' n'est PAS u'·v' : la formule est (u·v)' = u'·v + u·v'." },
  "unite-oubliee": { label: "Passage à l'unité oublié", advice: "En proportionnalité, on peut d'abord chercher la valeur pour UNE unité (division), puis multiplier." },
};

export const errInfo = (tag: string): ErrInfo => ERR_TAGS[tag] ?? { label: "Erreur", advice: "Relis l'énoncé et le cours, puis recommence pas à pas." };

/**
 * Devine le type d'erreur d'une réponse fausse en la comparant à la bonne.
 * Renvoie null si la réponse est juste. L'ordre compte : on cherche d'abord les erreurs les plus précises.
 */
export function diagnose(a: Answer, given: string, statement = ""): string | null {
  if (a.kind === "choice") return Number(given) === a.index ? null : "confusion";
  const n = parseNumeric(given);
  if (!Number.isFinite(n)) return "illisible";
  const v = a.value;
  if (Math.abs(n - v) <= a.tol + 1e-9) return null;
  if (v !== 0 && Math.abs(n + v) <= a.tol + 1e-9) return "signe";
  if (v !== 0 && n !== 0) {
    const q = Math.abs(n / v);
    if ([10, 100, 1000, 0.1, 0.01, 0.001].some((k) => Math.abs(q - k) <= k * 1e-6)) return "puissance-10";
  }
  if (Number.isInteger(v) && Math.abs(v) >= 5 && Math.abs(Math.abs(n - v) - 1) < 1e-9) return "decalage-1";
  if (v !== 0 && Math.abs(v) !== 1 && Math.abs(n - 1 / v) < 1e-6) return "inverse";
  if (v !== 0 && Math.abs(n - v) / Math.abs(v) <= 0.15) return "proche";
  const given_ = (statement.match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => Number(x.replace(",", ".")));
  if (given_.some((x) => Math.abs(x - n) < 1e-9)) return "operande";
  return "calcul";
}
