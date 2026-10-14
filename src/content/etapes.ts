// Exercices « pas à pas » : l'élève saisit chaque étape de son raisonnement, pas seulement le résultat final.
// Chaque étape a une réponse calculée par le code, un indice, une explication du « pourquoi » et les erreurs
// typiques de cette étape (valeur fausse probable → type d'erreur + message ciblé).
import { Answer, checkAnswer, choice, gcd, int, N, num, parseNumeric, pick, Rng, rng } from "./core";
import { diagnose } from "./erreurs";
import type { LevelId } from "../curriculum";

export interface WrongCase { value: number; tag: string; message: string }
export interface StepQ {
  prompt: string;
  answer: Answer;
  hint: string;
  /** Pourquoi on fait cela : montré après la réponse. */
  why: string;
  wrong?: WrongCase[];
}
export interface EtapeInstance { statement: string; steps: StepQ[]; conclusion: string }
export interface Etape {
  id: string;
  notionId: string;
  level: LevelId;
  title: string;
  difficulty: 1 | 2 | 3;
  gen: (r: Rng) => EtapeInstance;
}

export const ETAPES: Etape[] = [];
export const etapeById = (id: string) => ETAPES.find((e) => e.id === id);
export const etapesFor = (notionId: string) => ETAPES.filter((e) => e.notionId === notionId);
export const instancierEtape = (e: Etape, seed: number) => e.gen(rng(seed * 6271 + e.id.length * 131));

// ---------- Aides de rédaction ----------
/** « + 5 » ou « − 5 » (vrai signe moins). */
const plus = (n: number) => (n >= 0 ? `+ ${n}` : `− ${-n}`);
/** Nombre relatif entre parenthèses si négatif. */
const par = (n: number) => (n < 0 ? `(−${-n})` : String(n));
/** Écriture avec vrai signe moins. */
const m = (n: number) => String(n).replace("-", "−");
/** Coefficient devant x : 1x → x, −1x → −x. */
const coef = (a: number, v = "x") => (a === 1 ? v : a === -1 ? `−${v}` : `${m(a)}${v}`);
/** Terme « + 3x² », « − x² » (coefficient 1 omis). */
const tm = (n: number, v: string) => `${n < 0 ? "−" : "+"} ${Math.abs(n) === 1 ? "" : Math.abs(n)}${v}`;
const nonZero = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
const round2 = (x: number) => Math.round(x * 100) / 100;

function define(e: Etape) { ETAPES.push(e); }

// ---------- 6ème : périmètre et aire ----------
define({
  id: "et-rectangle", notionId: N("maths", "6e", "Périmètres et aires"), level: "6e", title: "Périmètre et aire d'un rectangle", difficulty: 1,
  gen: (r) => {
    const L = int(r, 6, 20), l = int(r, 3, L - 1);
    const lieu = pick(r, ["un champ", "une cour d'école", "un terrain de volley", "un jardin"]);
    return {
      statement: `${lieu[0].toUpperCase()}${lieu.slice(1)} rectangulaire mesure ${L} m de long et ${l} m de large. On veut clôturer son contour (périmètre), puis connaître sa surface (aire).`,
      steps: [
        { prompt: "Combien vaut la longueur plus la largeur (L + l), en mètres ?", answer: num(L + l), hint: "Additionne les deux dimensions.", why: "Le contour contient deux longueurs et deux largeurs : c'est 2 fois (L + l).", wrong: [{ value: L * l, tag: "perimetre-aire", message: "Tu as multiplié : c'est ce qu'on fait pour l'AIRE. Pour le contour, on additionne." }] },
        { prompt: "Quel est le périmètre, en mètres ?", answer: num(2 * (L + l)), hint: "Périmètre = 2 × (L + l).", why: "On fait le tour complet : 2 longueurs + 2 largeurs.", wrong: [{ value: L + l, tag: "perimetre-aire", message: "C'est le demi-périmètre. Il faut faire le tour complet : double ce résultat." }, { value: L * l, tag: "perimetre-aire", message: "Tu as calculé l'aire. Le périmètre est la longueur du contour." }] },
        { prompt: "Quelle est l'aire, en m² ?", answer: num(L * l), hint: "Aire = L × l.", why: "L'aire compte les carrés de 1 m sur 1 m qui couvrent la surface : L lignes de l carrés.", wrong: [{ value: 2 * (L + l), tag: "perimetre-aire", message: "Tu as donné le périmètre. L'aire est la surface : on multiplie L par l." }] },
      ],
      conclusion: `Périmètre : ${2 * (L + l)} m. Aire : ${L * l} m².`,
    };
  },
});

// ---------- CM2 : règle de trois ----------
define({
  id: "et-regle-de-trois", notionId: N("maths", "cm2", "Règle de trois"), level: "cm2", title: "Règle de trois : passer par l'unité", difficulty: 1,
  gen: (r) => {
    const n1 = int(r, 3, 9), unit = int(r, 2, 12) * 50, T = n1 * unit, n2 = int(r, 2, 14);
    const chose = pick(r, ["cahiers", "mangues", "ballons", "sachets de riz"]);
    return {
      statement: `${n1} ${chose} coûtent ${T.toLocaleString("fr-FR")} FCFA. Combien coûtent ${n2} ${chose} (au même prix) ?`,
      steps: [
        { prompt: "Combien coûte UN seul article, en FCFA ?", answer: num(unit), hint: `Partage le prix total (${T}) entre les ${n1} articles.`, why: "Passer par l'unité rend le calcul simple : une fois le prix d'un article connu, on peut en acheter autant qu'on veut.", wrong: [{ value: T * n1, tag: "unite-oubliee", message: "Tu as multiplié. Pour trouver le prix d'UN article, on partage (on divise) le prix total." }, { value: n1 / T, tag: "inverse", message: "Tu as divisé dans le mauvais sens : c'est le prix total divisé par le nombre d'articles." }] },
        { prompt: `Combien coûtent ${n2} articles, en FCFA ?`, answer: num(unit * n2), hint: `Multiplie le prix d'un article par ${n2}.`, why: "Le prix est proportionnel au nombre d'articles : n articles coûtent n fois le prix d'un seul.", wrong: [{ value: T + n2, tag: "calcul", message: "On n'additionne pas : le prix est proportionnel au nombre d'articles, donc on multiplie." }] },
      ],
      conclusion: `${n2} ${chose} coûtent ${(unit * n2).toLocaleString("fr-FR")} FCFA.`,
    };
  },
});

// ---------- 5ème : fractions et pourcentages ----------
define({
  id: "et-fractions-somme", notionId: N("maths", "5e", "Opérations sur les fractions"), level: "5e", title: "Additionner deux fractions", difficulty: 2,
  gen: (r) => {
    const dens = [2, 3, 4, 5, 6, 8, 9, 10, 12];
    let q = pick(r, dens), s = pick(r, dens);
    while (q === s) s = pick(r, dens);
    const p = int(r, 1, q - 1), t = int(r, 1, s - 1);
    const L = lcm(q, s), n1 = p * (L / q), n2 = t * (L / s), N_ = n1 + n2;
    const value = N_ / L;
    const wrongSum = (p + t) / (q + s);
    const steps: StepQ[] = [
      { prompt: `Quel est le plus petit dénominateur commun à ${q} et ${s} ?`, answer: num(L), hint: `Cherche le plus petit nombre qui est dans la table de ${q} ET dans la table de ${s}.`, why: "On ne peut additionner que des parts de MÊME taille : il faut des morceaux identiques.", wrong: [{ value: q + s, tag: "fractions-additionnees", message: "On n'additionne jamais les dénominateurs. On cherche un nombre dans les deux tables." }, ...(q * s !== L ? [{ value: q * s, tag: "denominateur-commun", message: `${q * s} convient, mais ce n'est pas le plus petit : le PPCM est ${L}.` }] : [])] },
      { prompt: `${p}/${q} = ?/${L}. Quel est le numérateur ?`, answer: num(n1), hint: `${q} × ? = ${L}. Multiplie le numérateur ${p} par le même nombre.`, why: "Multiplier haut et bas par le même nombre ne change pas la valeur de la fraction.", wrong: [{ value: p, tag: "denominateur-commun", message: "Tu as changé le dénominateur sans changer le numérateur : la fraction n'est plus la même. Multiplie les deux par le même nombre." }] },
      { prompt: `${t}/${s} = ?/${L}. Quel est le numérateur ?`, answer: num(n2), hint: `${s} × ? = ${L}. Multiplie ${t} par le même nombre.`, why: "Même règle pour la deuxième fraction.", wrong: [{ value: t, tag: "denominateur-commun", message: "Multiplie le numérateur par le même nombre que le dénominateur." }] },
      { prompt: `Quelle est la fraction ${n1}/${L} + ${n2}/${L} ? Écris-la sous la forme a/b (par exemple 7/12).`, answer: num(value, 1e-6), hint: `Additionne les numérateurs (${n1} + ${n2}) et garde le dénominateur ${L}.`, why: "Les parts ont la même taille : on compte simplement combien il y en a en tout.", wrong: [{ value: wrongSum, tag: "fractions-additionnees", message: "Tu as additionné les numérateurs ET les dénominateurs. Le dénominateur ne change pas." }] },
    ];
    return { statement: `Calcule ${p}/${q} + ${t}/${s}.`, steps, conclusion: `${p}/${q} + ${t}/${s} = ${N_}/${L}${gcd(N_, L) > 1 ? ` = ${N_ / gcd(N_, L)}/${L / gcd(N_, L)}` : ""}.` };
  },
});

define({
  id: "et-remise", notionId: N("maths", "5e", "Pourcentages"), level: "5e", title: "Prix après une remise", difficulty: 1,
  gen: (r) => {
    const p = pick(r, [10, 20, 25, 30, 40, 50]);
    const P = pick(r, [2000, 2500, 4000, 5000, 7500, 8000, 12000, 15000, 20000]);
    const remise = (P * p) / 100;
    return {
      statement: `Un pagne coûte ${P.toLocaleString("fr-FR")} FCFA. Pendant les soldes, on fait ${p} % de remise. Quel est le nouveau prix ?`,
      steps: [
        { prompt: "Quel est le montant de la remise, en FCFA ?", answer: num(remise), hint: `${p} % de ${P} = ${P} × ${p} ÷ 100.`, why: "Un pourcentage se calcule toujours sur le prix de départ : p % de P, c'est P × p ÷ 100.", wrong: [{ value: P * p, tag: "pourcentage-sans-base", message: "Tu as oublié de diviser par 100 : « pour cent » veut dire « pour 100 »." }, { value: P - remise, tag: "pourcentage-ajoute", message: "C'est déjà le prix final. Ici on cherche d'abord combien on enlève." }] },
        { prompt: "Quel est le prix final, en FCFA ?", answer: num(P - remise), hint: "Prix final = prix de départ − remise.", why: "Une remise est une réduction : le prix diminue.", wrong: [{ value: P + remise, tag: "pourcentage-ajoute", message: "Une remise se retranche, elle ne s'ajoute pas." }] },
      ],
      conclusion: `Prix final : ${(P - remise).toLocaleString("fr-FR")} FCFA.`,
    };
  },
});

// ---------- 4ème : équations, développement, Pythagore ----------
define({
  id: "et-equation-1", notionId: N("maths", "4e", "Équations du premier degré"), level: "4e", title: "Résoudre ax + b = c", difficulty: 1,
  gen: (r) => {
    const a = int(r, 2, 9), x = nonZero(r, -9, 12), b = nonZero(r, -15, 15), c = a * x + b;
    return {
      statement: `Résous l'équation ${a}x ${plus(b)} = ${m(c)}.`,
      steps: [
        { prompt: `On annule ${plus(b)} des deux côtés pour isoler ${a}x. Combien vaut ${m(c)} ${b >= 0 ? "−" : "+"} ${Math.abs(b)} ?`, answer: num(c - b), hint: `Pour annuler ${plus(b)}, on fait l'opération contraire des deux côtés.`, why: "Une équation est une balance : ce qu'on fait d'un côté, on le fait de l'autre. L'opération contraire d'une addition est une soustraction.", wrong: [{ value: c + b, tag: "terme-mal-deplace", message: `Tu as fait ${m(c)} ${plus(b)}. Pour supprimer ${plus(b)} à gauche, on fait l'inverse : ${m(c)} ${b >= 0 ? "−" : "+"} ${Math.abs(b)}.` }] },
        { prompt: `Il reste ${a}x = ${m(c - b)}. Combien vaut x ?`, answer: num(x), hint: `${a}x veut dire ${a} × x : l'opération contraire est la division par ${a}.`, why: "x est multiplié par " + a + " ; pour l'isoler on divise par " + a + " des deux côtés.", wrong: [{ value: (c - b) * a, tag: "operation-non-inversee", message: `Tu as multiplié par ${a}. Comme x est DÉJÀ multiplié par ${a}, on divise.` }, { value: (c - b) - a, tag: "operation-non-inversee", message: `On ne soustrait pas ${a} : ${a}x est un produit, on divise par ${a}.` }] },
        { prompt: `Vérification : calcule ${a} × ${par(x)} ${plus(b)}. Tu dois retrouver ${m(c)}.`, answer: num(c), hint: "Remplace x par ta solution.", why: "Vérifier évite toute erreur : si le résultat est faux, la solution n'est pas la bonne.", wrong: [] },
      ],
      conclusion: `x = ${m(x)}.`,
    };
  },
});

define({
  id: "et-equation-2", notionId: N("maths", "4e", "Équations du premier degré"), level: "4e", title: "Résoudre ax + b = cx + d", difficulty: 2,
  gen: (r) => {
    const c = int(r, 1, 6), a = c + int(r, 1, 6), x = nonZero(r, -8, 10), b = nonZero(r, -12, 12), d = a * x + b - c * x;
    return {
      statement: `Résous l'équation ${coef(a)} ${plus(b)} = ${coef(c)} ${plus(d)}.`,
      steps: [
        { prompt: `On rassemble les x à gauche : ${coef(a)} − ${coef(c)} = ?x. Quel est le coefficient ?`, answer: num(a - c), hint: `Soustrais ${c}x des deux côtés : ${a} − ${c}.`, why: "On veut un seul côté avec des x, l'autre avec des nombres.", wrong: [{ value: a + c, tag: "terme-mal-deplace", message: `${c}x change de côté, donc il change de signe : on soustrait ${c}x (et non +).` }] },
        { prompt: `On rassemble les nombres à droite : ${m(d)} − (${m(b)}) = ?`, answer: num(d - b), hint: `Enlève ${m(b)} des deux côtés.`, why: "Un terme qui change de côté change de signe.", wrong: [{ value: d + b, tag: "terme-mal-deplace", message: `Le terme ${plus(b)} traverse le « = » : son signe change, donc on le retranche.` }] },
        { prompt: `Il reste ${a - c}x = ${m(d - b)}. Combien vaut x ?`, answer: num(x), hint: `Divise par ${a - c}.`, why: "Dernière étape : isoler x en divisant par son coefficient.", wrong: [{ value: (d - b) * (a - c), tag: "operation-non-inversee", message: "x est multiplié par son coefficient : on divise, on ne multiplie pas." }] },
      ],
      conclusion: `x = ${m(x)}.`,
    };
  },
});

define({
  id: "et-developper", notionId: N("maths", "4e", "Calcul littéral : développer"), level: "4e", title: "Développer k(ax + b)", difficulty: 2,
  gen: (r) => {
    const k = pick(r, [-6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]), a = int(r, 1, 7), b = nonZero(r, -9, 9), n = int(r, 2, 6);
    const ka = k * a, kb = k * b, val = ka * n + kb;
    return {
      statement: `Développe ${k < 0 ? `(−${-k})` : k}(${coef(a)} ${plus(b)}), puis calcule la valeur pour x = ${n}.`,
      steps: [
        { prompt: "Quel est le coefficient de x dans le développement ?", answer: num(ka), hint: `Multiplie ${par(k)} par ${a}.`, why: "k(ax + b) : le facteur k multiplie le premier terme ax.", wrong: [{ value: a, tag: "oubli-distribution", message: "Tu as oublié de multiplier par " + par(k) + " : le facteur extérieur multiplie chaque terme." }] },
        { prompt: "Quel est le terme constant (sans x) dans le développement ?", answer: num(kb), hint: `Multiplie ${par(k)} par ${par(b)} : pense à la règle des signes.`, why: "Le facteur k multiplie AUSSI le deuxième terme b : c'est la distributivité.", wrong: [{ value: b, tag: "oubli-distribution", message: `Tu as recopié ${par(b)} : le ${par(k)} doit multiplier aussi ce terme.` }, { value: -kb, tag: "signe", message: "Vérifie la règle des signes : (+)×(+)=+, (−)×(−)=+, (+)×(−)=−." }] },
        { prompt: `Pour x = ${n}, quelle est la valeur de ${coef(ka)} ${plus(kb)} ?`, answer: num(val), hint: `Calcule ${par(ka)} × ${n}, puis ajoute ${par(kb)}.`, why: "On remplace x par sa valeur dans l'expression développée.", wrong: [{ value: ka * n + b, tag: "oubli-distribution", message: "Ton calcul utilise b au lieu de k×b : tu as oublié de distribuer." }] },
      ],
      conclusion: `${k}(${coef(a)} ${plus(b)}) = ${coef(ka)} ${plus(kb)} ; pour x = ${n}, on obtient ${m(val)}.`,
    };
  },
});

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
define({
  id: "et-pythagore-hyp", notionId: N("maths", "4e", "Théorème de Pythagore"), level: "4e", title: "Pythagore : calculer l'hypoténuse", difficulty: 1,
  gen: (r) => {
    const [a0, b0, c0] = pick(r, TRIPLES), k = int(r, 1, 3), a = a0 * k, b = b0 * k, c = c0 * k;
    return {
      statement: `Un triangle ABC est rectangle en A, avec AB = ${a} cm et AC = ${b} cm. Calcule BC.`,
      steps: [
        { prompt: "Quel côté est l'hypoténuse (en face de l'angle droit) ?", answer: choice(r, ["BC (en face de l'angle droit A)", "AB", "AC"], 0), hint: "L'angle droit est en A. Le côté opposé à A est…", why: "Pythagore ne s'applique qu'avec l'hypoténuse : le côté opposé à l'angle droit.", wrong: [] },
        { prompt: `Calcule AB² + AC² = ${a}² + ${b}².`, answer: num(a * a + b * b), hint: `${a}² = ${a} × ${a} et ${b}² = ${b} × ${b}.`, why: "Dans un triangle rectangle : BC² = AB² + AC².", wrong: [{ value: a + b, tag: "carre-oublie", message: "Tu as additionné les longueurs. Il faut d'abord les mettre AU CARRÉ." }, { value: 2 * a + 2 * b, tag: "carre-oublie", message: "Élever au carré, c'est multiplier par soi-même (a × a), pas par 2." }] },
        { prompt: `Donc BC² = ${a * a + b * b}. Combien vaut BC ?`, answer: num(c), hint: "Cherche le nombre qui multiplié par lui-même donne ce résultat.", why: "BC² est un carré : pour obtenir BC, on prend la racine carrée.", wrong: [{ value: a * a + b * b, tag: "racine-oubliee", message: "C'est BC² : il faut prendre la racine carrée pour obtenir BC." }, { value: (a * a + b * b) / 2, tag: "racine-oubliee", message: "Diviser par 2 n'est pas la racine carrée. Cherche le nombre qui, multiplié par lui-même, donne le résultat." }] },
      ],
      conclusion: `BC = ${c} cm.`,
    };
  },
});

define({
  id: "et-pythagore-cote", notionId: N("maths", "4e", "Théorème de Pythagore"), level: "4e", title: "Pythagore : calculer un côté", difficulty: 2,
  gen: (r) => {
    const [a0, b0, c0] = pick(r, TRIPLES), k = int(r, 1, 3), a = a0 * k, b = b0 * k, c = c0 * k;
    const wrongSum = round2(Math.sqrt(a * a + c * c));
    return {
      statement: `Un triangle EFG est rectangle en E, avec FG = ${c} cm et EF = ${a} cm. Calcule EG.`,
      steps: [
        { prompt: `FG est-il l'hypoténuse ? Quelle égalité écrit-on ? Calcule d'abord FG² (le carré du côté le plus long).`, answer: num(c * c), hint: `FG² = ${c} × ${c}.`, why: "L'hypoténuse FG est en face de l'angle droit E : FG² = EF² + EG².", wrong: [{ value: c, tag: "carre-oublie", message: "Il faut élever FG au carré." }] },
        { prompt: `EG² = FG² − EF² = ${c * c} − ${a * a}. Combien vaut EG² ?`, answer: num(b * b), hint: "On cherche un côté de l'angle droit : on SOUSTRAIT les carrés.", why: "Comme FG² = EF² + EG², on a EG² = FG² − EF².", wrong: [{ value: c * c + a * a, tag: "hypotenuse-confondue", message: "Tu as additionné : on additionne les carrés des côtés de l'angle droit pour trouver l'hypoténuse. Ici, l'hypoténuse est connue, donc on soustrait." }] },
        { prompt: `Combien vaut EG ?`, answer: num(b, 0.01), hint: `Racine carrée de ${b * b}.`, why: "On revient de EG² à EG avec la racine carrée.", wrong: [{ value: wrongSum, tag: "hypotenuse-confondue", message: "Tu as additionné les carrés. Quand on connaît l'hypoténuse, on soustrait." }, { value: b * b, tag: "racine-oubliee", message: "C'est EG² : il faut encore la racine carrée." }] },
      ],
      conclusion: `EG = ${b} cm.`,
    };
  },
});

// ---------- 3ème : systèmes, fonctions affines ----------
define({
  id: "et-systeme", notionId: N("maths", "3e", "Systèmes d'équations"), level: "3e", title: "Système x + y = S ; x − y = D", difficulty: 2,
  gen: (r) => {
    const x = int(r, 3, 15), y = int(r, 1, x - 1), S = x + y, D = x - y;
    return {
      statement: `Résous le système : x + y = ${S} et x − y = ${D}.`,
      steps: [
        { prompt: "On additionne les deux équations membre à membre. Que vaut 2x ?", answer: num(S + D), hint: `(x + y) + (x − y) = ${S} + ${D}. Les y s'annulent.`, why: "En additionnant, +y et −y s'annulent : il ne reste qu'une inconnue.", wrong: [{ value: S - D, tag: "terme-mal-deplace", message: `${S} − ${D} donne 2y, pas 2x : pour éliminer y, on additionne.` }] },
        { prompt: "Combien vaut x ?", answer: num(x), hint: "Divise par 2.", why: "2x = nombre : on divise par le coefficient de x.", wrong: [{ value: S + D, tag: "operation-non-inversee", message: "Tu as oublié de diviser par 2 : on a trouvé 2x, pas x." }] },
        { prompt: `Avec x + y = ${S}, combien vaut y ?`, answer: num(y), hint: `y = ${S} − x.`, why: "On remplace x par sa valeur dans une des équations.", wrong: [{ value: x - S, tag: "signe", message: `y = ${S} − x, pas l'inverse : le signe est faux.` }] },
      ],
      conclusion: `x = ${x} et y = ${y}.`,
    };
  },
});

define({
  id: "et-fonction-affine", notionId: N("maths", "3e", "Fonctions linéaires et affines"), level: "3e", title: "Trouver une fonction affine f(x) = ax + b", difficulty: 2,
  gen: (r) => {
    const a = nonZero(r, -5, 6), b = nonZero(r, -8, 10), p = int(r, 0, 3), q = p + int(r, 2, 5), n = int(r, 4, 9);
    const u = a * p + b, v = a * q + b, fn = a * n + b;
    return {
      statement: `f est une fonction affine telle que f(${p}) = ${m(u)} et f(${q}) = ${m(v)}. Calcule f(${n}).`,
      steps: [
        { prompt: `Que vaut f(${q}) − f(${p}) ?`, answer: num(v - u), hint: `${m(v)} − (${m(u)}).`, why: "Pour une fonction affine, la variation de f est a fois la variation de x.", wrong: [{ value: u - v, tag: "signe", message: "Tu as soustrait dans l'autre sens : c'est « arrivée − départ »." }] },
        { prompt: `Quel est le coefficient a = (f(${q}) − f(${p})) ÷ (${q} − ${p}) ?`, answer: num(a), hint: `Divise ${m(v - u)} par ${q - p}.`, why: "a est le taux de variation : la pente de la droite.", wrong: [{ value: v - u, tag: "operation-non-inversee", message: `Il faut diviser par ${q - p} (l'écart entre les x).` }] },
        { prompt: `Quel est b ? Utilise f(${p}) = a × ${p} + b, donc b = ${m(u)} − ${par(a)} × ${p}.`, answer: num(b), hint: "Remplace x par " + p + " et isole b.", why: "Une fois a connu, un seul point de la droite suffit à trouver b.", wrong: [{ value: u + a * p, tag: "terme-mal-deplace", message: "Le terme a×x change de côté : il change de signe, on le retranche." }] },
        { prompt: `Calcule f(${n}) = ${par(a)} × ${n} ${plus(b)}.`, answer: num(fn), hint: "Remplace x par " + n + ".", why: "Maintenant que f(x) = ax + b est connue, on peut calculer n'importe quelle image.", wrong: [] },
      ],
      conclusion: `f(x) = ${coef(a)} ${plus(b)} et f(${n}) = ${m(fn)}.`,
    };
  },
});

// ---------- 2nde : inéquation avec multiplication par un nombre négatif ----------
define({
  id: "et-inequation-negatif", notionId: N("maths", "2nde", "Équations et inéquations"), level: "2nde", title: "Inéquation : diviser par un nombre négatif", difficulty: 2,
  gen: (r) => {
    const a = int(r, 2, 7), x0 = nonZero(r, -8, 9), b = nonZero(r, -10, 12), c = b - a * x0;
    const gt = r() < 0.5; // −ax + b > c  ou  −ax + b < c
    const sym = gt ? ">" : "<";
    const result = gt ? "<" : ">"; // le sens s'inverse
    const options = [`x ${result} ${m(x0)}`, `x ${sym} ${m(x0)}`];
    return {
      statement: `Résous l'inéquation −${a}x ${plus(b)} ${sym} ${m(c)}.`,
      steps: [
        { prompt: `On retire ${m(b)} des deux côtés : −${a}x ${sym} ${m(c)} − (${m(b)}). Combien vaut le membre de droite ?`, answer: num(c - b), hint: "Même règle que pour une équation : on retire b des deux côtés.", why: "Ajouter ou retrancher le même nombre des deux côtés ne change pas le sens d'une inégalité.", wrong: [{ value: c + b, tag: "terme-mal-deplace", message: "Pour supprimer " + plus(b) + " à gauche, on fait l'opération contraire." }] },
        { prompt: `On divise par −${a}. Quelle est la valeur de la borne : ${m(c - b)} ÷ (−${a}) ?`, answer: num(x0), hint: `Un nombre divisé par un nombre négatif change de signe.`, why: "On isole x en divisant par son coefficient −" + a + ".", wrong: [{ value: -x0, tag: "signe", message: "Attention à la règle des signes : négatif ÷ négatif = positif." }] },
        { prompt: `Après la division par −${a} (négatif !), quelle est la bonne conclusion ?`, answer: choice(r, options, 0), hint: "Exemple : 2 < 3, mais en multipliant par −1 : −2 > −3. L'ordre s'est inversé.", why: `Multiplier ou diviser par un nombre NÉGATIF inverse l'ordre : sur la droite graduée, les nombres sont « retournés » (−2 est plus à droite que −3). Donc ${sym} devient ${result}.`, wrong: [] },
      ],
      conclusion: `Solution : x ${result} ${m(x0)}.`,
    };
  },
});

// ---------- 1ère : discriminant, dérivées ----------
define({
  id: "et-second-degre", notionId: N("maths", "1ere", "Second degré"), level: "1ere", title: "Résoudre ax² + bx + c = 0", difficulty: 2,
  gen: (r) => {
    const a = pick(r, [1, 1, 2, 3]);
    let x1 = nonZero(r, -7, 7), x2 = nonZero(r, -7, 7);
    while (x1 === x2 || x1 + x2 === 0) x2 = nonZero(r, -7, 7);
    if (x1 > x2) [x1, x2] = [x2, x1];
    const b = -a * (x1 + x2), c = a * x1 * x2, delta = b * b - 4 * a * c, sq = Math.abs(a * (x1 - x2));
    const poly = `${a === 1 ? "" : a}x² ${tm(b, "x")} ${plus(c)}`;
    return {
      statement: `Résous l'équation ${poly} = 0.`,
      steps: [
        { prompt: `a = ${a}, b = ${m(b)}, c = ${m(c)}. Calcule le discriminant Δ = b² − 4ac.`, answer: num(delta), hint: `b² = ${b * b} ; 4ac = 4 × ${par(a)} × ${par(c)}.`, why: "Δ dit combien de solutions il y a : Δ > 0 → deux solutions.", wrong: [{ value: b * b + 4 * a * c, tag: "discriminant-signe", message: "Δ = b² − 4ac : le signe devant 4ac est un MOINS. Fais attention si c est négatif." }] },
        { prompt: `Quelle est la racine carrée de Δ = ${delta} ?`, answer: num(sq), hint: "Cherche le nombre positif dont le carré vaut Δ.", why: "Les solutions utilisent √Δ.", wrong: [{ value: delta / 2, tag: "racine-oubliee", message: "Diviser par 2 n'est pas prendre la racine carrée." }] },
        { prompt: `Plus petite solution : x₁ = (−b − √Δ) ÷ (2a).`, answer: num(x1), hint: `−b = ${m(-b)} ; 2a = ${2 * a}.`, why: "Formule du cours : x = (−b ± √Δ) ÷ 2a. Attention : c'est −b, l'opposé de b.", wrong: [{ value: (b - sq) / (2 * a), tag: "signe", message: "Dans la formule, c'est −b (l'opposé de b), pas b." }] },
        { prompt: `Plus grande solution : x₂ = (−b + √Δ) ÷ (2a).`, answer: num(x2), hint: "Même calcul avec +√Δ.", why: "Les deux solutions ne diffèrent que par le signe devant √Δ.", wrong: [{ value: (b + sq) / (2 * a), tag: "signe", message: "N'oublie pas : c'est −b, l'opposé de b." }] },
      ],
      conclusion: `Solutions : ${m(x1)} et ${m(x2)}.`,
    };
  },
});

define({
  id: "et-derivee-poly", notionId: N("maths", "1ere", "Dérivation (1ère)"), level: "1ere", title: "Dériver un polynôme de degré 3", difficulty: 2,
  gen: (r) => {
    const a = nonZero(r, -4, 5), b = nonZero(r, -5, 6), c = nonZero(r, -6, 8), d = nonZero(r, -9, 9), n = int(r, 1, 4);
    const f1 = 3 * a * n * n + 2 * b * n + c;
    return {
      statement: `Soit f(x) = ${coef(a, "x³")} ${tm(b, "x²")} ${tm(c, "x")} ${plus(d)}. Calcule f′(${n}).`,
      steps: [
        { prompt: "Dans f′(x), quel est le coefficient de x² ? (dérivée de " + coef(a, "x³") + ")", answer: num(3 * a), hint: "(xⁿ)′ = n·xⁿ⁻¹ : on multiplie par l'exposant 3.", why: "Dériver x³ donne 3x² : l'exposant descend devant et diminue de 1.", wrong: [{ value: a, tag: "derivee-puissance", message: "Tu as gardé a. Il faut multiplier par l'exposant : 3 × " + par(a) + "." }, { value: 2 * a, tag: "derivee-puissance", message: "L'exposant de x³ est 3 (et non 2) : 3 × " + par(a) + "." }] },
        { prompt: "Quel est le coefficient de x dans f′(x) ? (dérivée de " + coef(b, "x²") + ")", answer: num(2 * b), hint: "(x²)′ = 2x.", why: "Même règle : x² donne 2x.", wrong: [{ value: b, tag: "derivee-puissance", message: "Il faut multiplier par l'exposant 2." }] },
        { prompt: `Quelle est la dérivée de ${coef(c)} ? Donne le nombre qui reste dans f′(x).`, answer: num(c), hint: "(x)′ = 1.", why: "La dérivée de c·x est c. La constante d disparaît (sa dérivée est 0).", wrong: [{ value: 0, tag: "derivee-puissance", message: "Dériver c·x donne c, pas 0. Seule la constante seule donne 0." }] },
        { prompt: `Maintenant f′(x) = ${coef(3 * a, "x²")} ${tm(2 * b, "x")} ${plus(c)}. Calcule f′(${n}).`, answer: num(f1), hint: `Remplace x par ${n}.`, why: "f′(n) est le coefficient directeur de la tangente en x = " + n + ".", wrong: [{ value: 3 * a * n * n * n + 2 * b * n * n + c * n, tag: "calcul", message: "Tu as calculé f(x) sans dériver. Utilise f′(x) = …" }] },
      ],
      conclusion: `f′(x) = ${coef(3 * a, "x²")} ${tm(2 * b, "x")} ${plus(c)} et f′(${n}) = ${m(f1)}.`,
    };
  },
});

// ---------- Terminale : dérivée d'un produit ----------
define({
  id: "et-derivee-produit", notionId: N("maths", "tle", "Logarithme et exponentielle"), level: "tle", title: "Dériver (ax + b)·eˣ", difficulty: 3,
  gen: (r) => {
    const a = nonZero(r, -4, 5), b = nonZero(r, -6, 7);
    return {
      statement: `Soit f(x) = (${coef(a)} ${plus(b)})·eˣ. Calcule f′(0).`,
      steps: [
        { prompt: "On pose u(x) = " + coef(a) + " " + plus(b) + " et v(x) = eˣ. Que vaut u′(x) ?", answer: num(a), hint: "La dérivée de ax + b est a.", why: "u est une fonction affine : sa dérivée est son coefficient directeur.", wrong: [{ value: b, tag: "derivee-puissance", message: "La dérivée de ax + b est a (la constante b disparaît)." }] },
        { prompt: "Que vaut v(0) = e⁰ ? (et v′(x) = eˣ, donc v′(0) a la même valeur)", answer: num(1), hint: "Tout nombre non nul puissance 0 vaut 1.", why: "La fonction exponentielle est sa propre dérivée.", wrong: [{ value: 0, tag: "calcul", message: "e⁰ = 1, comme tout nombre non nul à la puissance 0." }] },
        { prompt: "Calcule f′(0) = u′(0)·v(0) + u(0)·v′(0). Rappel : u(0) = " + m(b) + ".", answer: num(a + b), hint: `${m(a)} × 1 + ${par(b)} × 1.`, why: "Pour un produit : (u·v)′ = u′·v + u·v′.", wrong: [{ value: a, tag: "derivee-produit", message: "Tu as calculé u′·v′ seulement. La formule est u′v + uv′ : deux termes." }, { value: a * b, tag: "derivee-produit", message: "La dérivée d'un produit n'est PAS le produit des dérivées : (uv)′ = u′v + uv′." }] },
      ],
      conclusion: `f′(x) = (${coef(a)} ${plus(a + b)})·eˣ, donc f′(0) = ${m(a + b)}.`,
    };
  },
});

// ---------- Vérification d'une étape ----------
export interface StepVerdict { ok: boolean; tag: string | null; message: string | null }
/** Vérifie la saisie d'une étape : bonne, erreur typique de cette étape (message ciblé) ou erreur générale. */
export function checkStep(step: StepQ, input: string): StepVerdict {
  if (checkAnswer(step.answer, input)) return { ok: true, tag: null, message: null };
  if (step.answer.kind === "number") {
    const n = parseNumeric(input);
    const hit = Number.isFinite(n) ? step.wrong?.find((w) => Math.abs(w.value - n) <= Math.max(step.answer.kind === "number" ? step.answer.tol : 0, 1e-6)) : undefined;
    if (hit) return { ok: false, tag: hit.tag, message: hit.message };
  }
  return { ok: false, tag: diagnose(step.answer, input), message: null };
}
