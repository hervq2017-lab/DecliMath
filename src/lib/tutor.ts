// Tuteur pédagogique. Il fonctionne SANS service externe : il s'appuie sur les aides graduées de chaque exercice,
// sur le diagnostic d'erreur et sur une bibliothèque d'explications « pourquoi ça marche ».
// Il est conçu pour qu'un modèle de langage puisse être branché plus tard à la place de `answerQuestion`
// (même entrée/sortie) : voir l'interface TutorBackend.
import type { LevelId } from "../curriculum";

export interface Concept {
  id: string;
  title: string;
  /** Mots (sans accents, minuscules) qui déclenchent cette explication. */
  keywords: string[];
  /** À partir de quelle classe c'est expliqué. */
  level: LevelId;
  /** Explication en 2 ou 3 temps, du plus intuitif au plus formel. */
  explain: string[];
  /** Question de vérification : l'élève doit appliquer, pas répéter. */
  check: { q: string; options: string[]; index: number; ok: string; ko: string };
}

export const CONCEPTS: Concept[] = [
  {
    id: "sens-inegalite", title: "Pourquoi le sens d'une inégalité change quand on multiplie par un nombre négatif", level: "4e",
    keywords: ["inegalite", "inequation", "sens", "negatif", "inverse", "change le sens", "retourne"],
    explain: [
      "Prends une inégalité vraie : 2 < 3. Multiplie les deux côtés par −1 : tu obtiens −2 et −3.",
      "Sur la droite graduée, −2 est plus à droite que −3. Donc −2 > −3 : l'ordre s'est retourné.",
      "Multiplier par un nombre négatif « retourne » la droite graduée (c'est un miroir autour de 0). Les nombres changent de côté, donc le sens du signe change aussi. Multiplier par un nombre positif ne fait que dilater : l'ordre est conservé.",
    ],
    check: { q: "Résous −2x > 6.", options: ["x < −3", "x > −3", "x < 3"], index: 0, ok: "Oui ! On divise par −2 (négatif), donc > devient < : x < −3.", ko: "Presque : on divise par −2, un nombre négatif, donc le signe > devient <. Et 6 ÷ (−2) = −3. La réponse est x < −3." },
  },
  {
    id: "distributivite", title: "Pourquoi k(a + b) = ka + kb (la distributivité)", level: "5e",
    keywords: ["distribuer", "distributivite", "developper", "parenthese", "facteur"],
    explain: [
      "Imagine un rectangle de hauteur 3 et de largeur 4 + 5. Son aire est 3 × (4 + 5) = 3 × 9 = 27.",
      "Coupe-le en deux rectangles : un de largeur 4 (aire 3 × 4 = 12), un de largeur 5 (aire 3 × 5 = 15). Les deux ensemble : 12 + 15 = 27.",
      "Le facteur 3 sert donc aux DEUX morceaux : 3(4 + 5) = 3×4 + 3×5. Oublier de multiplier le deuxième terme, c'est oublier un morceau du rectangle.",
    ],
    check: { q: "Développe 4(x + 3).", options: ["4x + 3", "4x + 12", "x + 12"], index: 1, ok: "Oui : 4 multiplie x ET 3, donc 4x + 12.", ko: "Le 4 doit multiplier les deux termes : 4 × x = 4x et 4 × 3 = 12. La réponse est 4x + 12." },
  },
  {
    id: "meme-denominateur", title: "Pourquoi il faut un même dénominateur pour additionner des fractions", level: "5e",
    keywords: ["denominateur", "fraction", "additionner fractions", "meme denominateur", "ppcm"],
    explain: [
      "Une baguette coupée en 2 : tu en manges 1/2. Une autre coupée en 3 : tu en manges 1/3. Combien en as-tu mangé en tout ? Les morceaux n'ont pas la même taille, on ne peut pas les compter ensemble.",
      "Coupe tout en 6 morceaux égaux : 1/2 = 3/6 et 1/3 = 2/6. Maintenant les morceaux sont identiques : 3 morceaux + 2 morceaux = 5 morceaux de 1/6.",
      "Donc 1/2 + 1/3 = 5/6. Le dénominateur dit la TAILLE des morceaux : il ne s'additionne pas. On additionne seulement le nombre de morceaux (les numérateurs).",
    ],
    check: { q: "Calcule 1/2 + 1/4.", options: ["2/6", "3/4", "1/6"], index: 1, ok: "Oui : 1/2 = 2/4, donc 2/4 + 1/4 = 3/4.", ko: "Mets au même dénominateur : 1/2 = 2/4. Puis 2/4 + 1/4 = 3/4." },
  },
  {
    id: "regle-des-signes", title: "Pourquoi (−) × (−) = (+)", level: "5e",
    keywords: ["signe", "signes", "moins fois moins", "negatif fois negatif", "relatif", "relatifs"],
    explain: [
      "Pense en dettes. Si tu gagnes 3 000 FCFA chaque jour pendant 2 jours : +3 000 × 2 = +6 000.",
      "Si on te RETIRE une dette de 3 000 FCFA (−3 000) pendant 2 jours, c'est comme gagner 3 000 par jour : −(−3 000) × 2 = +6 000. Retirer une dette, c'est s'enrichir.",
      "Règle : même signe → résultat positif ; signes différents → résultat négatif.",
    ],
    check: { q: "Calcule (−4) × (−5).", options: ["−20", "20", "−9"], index: 1, ok: "Oui : deux signes moins donnent un plus, 4 × 5 = 20.", ko: "Deux négatifs multipliés donnent un positif : (−4) × (−5) = +20." },
  },
  {
    id: "equation-balance", title: "Pourquoi on fait la même chose des deux côtés d'une équation", level: "5e",
    keywords: ["equation", "isoler", "inconnue", "balance", "des deux cotes", "passer de l'autre cote"],
    explain: [
      "Une équation est une balance à l'équilibre : x + 7 = 12 veut dire que les deux plateaux pèsent pareil.",
      "Si tu retires 7 d'un plateau, la balance penche. Pour qu'elle reste équilibrée, tu retires 7 aussi de l'autre : x = 12 − 7 = 5.",
      "« Passer un terme de l'autre côté en changeant de signe » est juste un raccourci pour « faire l'opération contraire des deux côtés ».",
    ],
    check: { q: "Résous x + 7 = 12.", options: ["x = 19", "x = 5", "x = −5"], index: 1, ok: "Oui : on retire 7 des deux côtés, x = 5.", ko: "On retire 7 des deux côtés : x = 12 − 7 = 5." },
  },
  {
    id: "pythagore", title: "Pourquoi a² + b² = c² dans un triangle rectangle (Pythagore)", level: "4e",
    keywords: ["pythagore", "hypotenuse", "triangle rectangle", "carre"],
    explain: [
      "Construis un carré sur chaque côté du triangle rectangle. L'aire du carré sur un côté de longueur a est a × a = a².",
      "Pour un triangle 3-4-5 : les petits carrés ont pour aires 9 et 16. Le grand carré, sur l'hypoténuse, a pour aire 25 = 9 + 16.",
      "Pythagore dit que c'est toujours vrai : l'aire du grand carré = somme des aires des deux autres. On additionne des AIRES (des carrés), puis on revient à la longueur avec la racine carrée.",
    ],
    check: { q: "Les côtés de l'angle droit mesurent 6 et 8. Combien mesure l'hypoténuse ?", options: ["14", "10", "100"], index: 1, ok: "Oui : 36 + 64 = 100, et √100 = 10.", ko: "6² + 8² = 36 + 64 = 100. Mais 100 est un carré : l'hypoténuse vaut √100 = 10." },
  },
  {
    id: "pourcentage", title: "Que veut dire « pour cent » (pourcentage) ?", level: "5e",
    keywords: ["pourcentage", "pour cent", "pourcent", "remise", "reduction", "%"],
    explain: [
      "« 25 % » se lit « 25 pour cent » : 25 parts sur 100, donc 25/100 = un quart.",
      "Pour prendre 25 % de 80 : 80 × 25/100 = 20. On calcule TOUJOURS sur le nombre de départ.",
      "Une remise de 25 % sur 80 FCFA enlève 20 FCFA : le nouveau prix est 80 − 20 = 60 FCFA.",
    ],
    check: { q: "Quel est le prix final d'un article à 2 000 FCFA avec 10 % de remise ?", options: ["1 800 FCFA", "2 200 FCFA", "1 990 FCFA"], index: 0, ok: "Oui : 10 % de 2 000 = 200 ; 2 000 − 200 = 1 800.", ko: "10 % de 2 000 = 2 000 × 10 / 100 = 200. Une remise se retranche : 2 000 − 200 = 1 800 FCFA." },
  },
  {
    id: "proportionnalite", title: "Pourquoi passer par l'unité en proportionnalité", level: "6e",
    keywords: ["proportionnalite", "regle de trois", "unite", "proportionnel", "tableau"],
    explain: [
      "Si 4 cahiers coûtent 1 000 FCFA, tous les cahiers coûtent le même prix : on peut chercher le prix d'UN cahier.",
      "1 000 ÷ 4 = 250 FCFA le cahier. Avec ce prix unitaire, on peut répondre pour n'importe quelle quantité : 7 cahiers → 7 × 250.",
      "Deux grandeurs sont proportionnelles quand on passe de l'une à l'autre en multipliant toujours par le même nombre (ici 250).",
    ],
    check: { q: "5 stylos coûtent 750 FCFA. Combien coûtent 8 stylos ?", options: ["1 200 FCFA", "1 050 FCFA", "930 FCFA"], index: 0, ok: "Oui : 750 ÷ 5 = 150 ; 150 × 8 = 1 200.", ko: "Un stylo coûte 750 ÷ 5 = 150 FCFA. Donc 8 stylos : 150 × 8 = 1 200 FCFA." },
  },
  {
    id: "division-zero", title: "Pourquoi on ne peut pas diviser par zéro", level: "5e",
    keywords: ["zero", "diviser par zero", "division par zero"],
    explain: [
      "Diviser 6 par 2, c'est chercher le nombre qui, multiplié par 2, donne 6 : c'est 3.",
      "Diviser 6 par 0, ce serait chercher un nombre qui, multiplié par 0, donne 6. Mais 0 × n'importe quoi = 0, jamais 6. Il n'y a aucun résultat possible.",
      "Et 0 ÷ 0 ? Tous les nombres conviendraient (0 × n = 0 pour tout n) : le résultat ne serait pas unique. Dans les deux cas la division est impossible.",
    ],
    check: { q: "Pourquoi 5 ÷ 0 n'existe pas ?", options: ["Parce que c'est trop grand", "Aucun nombre multiplié par 0 ne donne 5", "Parce que le résultat est 0"], index: 1, ok: "Oui : 0 × n = 0 pour tout n, jamais 5.", ko: "Diviser par 0 voudrait dire trouver n tel que 0 × n = 5. C'est impossible, car 0 × n = 0 toujours." },
  },
  {
    id: "fonction-affine", title: "Que représentent a et b dans f(x) = ax + b", level: "3e",
    keywords: ["fonction affine", "coefficient directeur", "ordonnee a l'origine", "droite", "pente"],
    explain: [
      "Un taxi-moto fait payer 500 FCFA de prise en charge, puis 200 FCFA par kilomètre : prix = 200 × km + 500.",
      "b = 500 est le prix à 0 km (là où la droite coupe l'axe vertical). a = 200 est ce qu'on ajoute pour chaque kilomètre en plus : la pente de la droite.",
      "Entre deux points de la droite, a = (variation de f) ÷ (variation de x). Plus a est grand, plus la droite monte vite.",
    ],
    check: { q: "f(x) = 3x + 2. Quelle est la valeur de f(4) ?", options: ["14", "9", "24"], index: 0, ok: "Oui : 3 × 4 + 2 = 14.", ko: "On remplace x par 4 : f(4) = 3 × 4 + 2 = 12 + 2 = 14." },
  },
  {
    id: "discriminant", title: "À quoi sert le discriminant Δ", level: "1ere",
    keywords: ["discriminant", "delta", "second degre", "trinome", "racines"],
    explain: [
      "L'équation ax² + bx + c = 0 se lit sur la parabole : ses solutions sont les points où la parabole coupe l'axe horizontal.",
      "Δ = b² − 4ac se calcule avant de chercher x et prévient : Δ > 0 → la parabole coupe l'axe 2 fois (deux solutions) ; Δ = 0 → elle le touche en un point ; Δ < 0 → elle ne le coupe pas (aucune solution réelle).",
      "Δ apparaît sous la racine carrée dans la formule (−b ± √Δ) ÷ 2a : on ne peut pas prendre la racine carrée d'un nombre négatif, d'où « pas de solution » quand Δ < 0.",
    ],
    check: { q: "Pour x² + 2x + 5 = 0, on trouve Δ = −16. Combien de solutions réelles ?", options: ["2", "1", "0"], index: 2, ok: "Oui : Δ < 0, donc aucune solution réelle.", ko: "Δ est négatif : √Δ n'existe pas dans les réels. L'équation n'a aucune solution réelle." },
  },
  {
    id: "derivee", title: "Que mesure la dérivée", level: "1ere",
    keywords: ["derivee", "deriver", "tangente", "taux de variation", "nombre derive"],
    explain: [
      "Sur une route, la vitesse à un instant est la distance parcourue sur un très petit intervalle de temps, divisée par cet intervalle.",
      "C'est la même idée pour une fonction : f′(a) est la pente de la courbe en x = a, c'est-à-dire la pente de la tangente (la droite qui « touche » la courbe).",
      "Si f′(a) > 0, la courbe monte en a ; si f′(a) < 0, elle descend ; si f′(a) = 0, la tangente est horizontale (sommet ou creux possible).",
    ],
    check: { q: "f′(2) = −3. Que fait la courbe de f autour de x = 2 ?", options: ["Elle monte", "Elle descend", "Elle est horizontale"], index: 1, ok: "Oui : pente négative → la courbe descend.", ko: "f′(2) est la pente de la tangente en 2. Elle est négative : la courbe descend." },
  },
];

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Cherche l'explication la plus proche de la question de l'élève (par mots-clés). */
export function findConcept(question: string): Concept | null {
  const q = strip(question);
  let best: { c: Concept; score: number } | null = null;
  for (const c of CONCEPTS) {
    const score = c.keywords.reduce((t, k) => (q.includes(strip(k)) ? t + (k.length > 6 ? 2 : 1) : t), 0);
    if (score > 0 && (!best || score > best.score)) best = { c, score };
  }
  return best?.c ?? null;
}

/**
 * Interface d'un tuteur : permet de brancher plus tard un modèle de langage (via un serveur) à la place des règles ci-dessous.
 * Aucune clé d'API ne doit jamais se trouver dans l'application : l'appel passerait par un serveur.
 */
export interface TutorBackend {
  answerQuestion(question: string, ctx: { level: LevelId; notionTitle?: string }): Promise<string>;
}

/** Échelle d'aide socratique d'un exercice : la réponse n'est donnée qu'en tout dernier recours. */
export const HELP_LADDER = [
  "Dis-moi avec tes mots : que cherche-t-on dans cet exercice, et quelles données as-tu ?",
  "Un coup de pouce pour comprendre l'énoncé :",
  "Voici la méthode à suivre :",
  "Voici la première étape chiffrée :",
] as const;
