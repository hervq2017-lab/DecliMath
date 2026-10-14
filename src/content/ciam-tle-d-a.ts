// CIAM Terminale SE (série D) : limites et continuité. Réponses calculées par le code ; pages du manuel « CIAM Terminale SE ».
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtd");
const BOOK = "CIAM Tle SE";
const LI = "Limites et continuité — série D";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const nz = (r: () => number, lo: number, hi: number) => { let v = 0; while (v === 0) v = lo + Math.floor(r() * (hi - lo + 1)); return v; };
const term = (a: number, v: string, first: boolean) => {
  if (a === 0) return "";
  const m = Math.abs(a) === 1 && v !== "" ? "" : String(Math.abs(a));
  return first ? `${a < 0 ? "−" : ""}${m}${v}` : ` ${a < 0 ? "−" : "+"} ${m}${v}`;
};
const quad = (a: number, b: number, c: number) => `${term(a, "x²", true)}${term(b, "x", a === 0)}${term(c, "", a === 0 && b === 0)}`;

export const TDA: Template[] = [
  mk("li-prolongement", LI, 2, { skill: "Prolongement par continuité : valeur de g(a) pour f(x) = (x² + px + q)/(x − a)", ref: `${BOOK}, chap. 1 §1.1 (p. 10) et ex. 1.a, 1.d (p. 10)`, kw: ["prolongement par continuité", "limite en a", "factoriser", "fonction auxiliaire"] }, (c, r) => {
    const a = int(r, -4, 4), s = int(r, -4, 4);
    // (x − a)(x − s) = x² − (a+s)x + a s ; limite en a de f = a − s
    const num_ = quad(1, -(a + s), a * s);
    const v = a - s;
    return { statement: `f est définie sur ℝ∖{${S(a)}} par f(x) = (${num_})/(x ${a < 0 ? "+" : "−"} ${Math.abs(a)}). f admet un prolongement par continuité en ${S(a)} ; on pose g(${S(a)}) = ℓ. Quelle est la valeur de ℓ ?`.replace("(x − 0)", "x").replace("(x + 0)", "x"), answer: num(v), hints: H("g(a) doit être égal à la limite de f en a.", `Factorise le numérateur par (x − ${P(a)}).`, `${num_} = (x − ${P(a)})(x − ${P(s)}).`, "Simplifie puis remplace x par a."), solution: `Pour x ≠ ${S(a)}, f(x) = x − ${P(s)}, donc ℓ = ${S(a)} − ${P(s)} = ${S(v)}.` };
  }),
  mk("li-continuite-param", LI, 3, { skill: "Continuité d'une fonction définie par morceaux : déterminer un paramètre", ref: `${BOOK}, chap. 1 §1.1 (p. 9) et ex. 1.b-1.c, 1.34-1.35 (p. 10 et 34)`, kw: ["continuité", "limite à gauche", "limite à droite", "paramètre", "fonction définie par morceaux"] }, (c, r) => {
    const x0 = nz(r, -3, 3), k = int(r, -4, 4), m = int(r, -5, 5);
    const a = (x0 * x0 + k - m) / x0;
    return { statement: `f est définie sur ℝ par f(x) = ${quad(1, 0, k)} si x ≤ ${S(x0)}, et f(x) = a·x ${m < 0 ? "−" : "+"} ${Math.abs(m)} si x > ${S(x0)}. Pour quelle valeur de a la fonction f est-elle continue en ${S(x0)} ? (arrondi au centième)`.replace(" + 0 si", " si").replace(" − 0 si", " si"), answer: num(round(a, 2), 0.01), hints: H("f est continue en x₀ si limite à gauche = limite à droite = f(x₀).", `Limite à gauche : f(${S(x0)}) = ${S(x0 * x0 + k)}.`, `Limite à droite : a × ${P(x0)} + ${P(m)}.`, "Écris l'égalité et résous."), solution: `${S(x0 * x0 + k)} = ${P(x0)}a + ${P(m)} donne a = ${S(round(a, 2))}.` };
  }),
  mk("li-racine-composee", LI, 2, { skill: "Limite d'une fonction composée avec une racine carrée", ref: `${BOOK}, chap. 1 §1.2 (p. 12-13)`, kw: ["fonction composée", "racine carrée", "limite", "√f"] }, (c, r) => {
    const a = nz(r, 1, 3), b = int(r, -4, 4), x0 = int(r, -2, 3);
    let cc = int(r, 1, 9);
    if (a * x0 * x0 + b * x0 + cc < 1) cc = 1 - a * x0 * x0 - b * x0;
    const rad = a * x0 * x0 + b * x0 + cc;
    return { statement: `Calcule la limite en ${S(x0)} de f(x) = √(${quad(a, b, cc)}) (arrondie au centième).`, answer: num(round(Math.sqrt(rad), 2), 0.01), hints: H("Si lim u(x) = l ≥ 0 alors lim √u(x) = √l.", `lim (${quad(a, b, cc)}) = ${rad}.`, `√${rad}.`, "Calcule."), solution: `lim f = √${rad} ≈ ${S(round(Math.sqrt(rad), 2))}.` };
  }),
  mk("li-conjuguee", LI, 3, { skill: "Limite en +∞ de √(x² + bx + c) − x (expression conjuguée)", ref: `${BOOK}, chap. 1 §1.4 (p. 15-16)`, kw: ["expression conjuguée", "forme indéterminée", "∞ − ∞", "racine carrée"] }, (c, r) => {
    const b = nz(r, -6, 6), cc = int(r, -4, 4);
    return { statement: `Calcule la limite en +∞ de f(x) = √(x² ${b < 0 ? "−" : "+"} ${Math.abs(b)}x ${cc < 0 ? "−" : "+"} ${Math.abs(cc)}) − x.`.replace(" + 0)", ")").replace(" − 0)", ")"), answer: num(b / 2, 0.01), hints: H("Forme indéterminée ∞ − ∞ : multiplie et divise par l'expression conjuguée.", `√(x² + bx + c) − x = (bx + c)/(√(x² + bx + c) + x).`, "Mets x en facteur au numérateur et au dénominateur.", `La limite est b/2 = ${b}/2.`), solution: `lim f = ${b}/2 = ${S(b / 2)}.` };
  }),
  mk("li-quotient-racine", LI, 3, { skill: "Limite en ±∞ de (ax + b)/√(cx² + d)", ref: `${BOOK}, chap. 1 §1.4, ex. 1.j (p. 15-16)`, kw: ["limite en l'infini", "racine carrée", "quotient", "factoriser"] }, (c, r) => {
    const a = nz(r, -4, 5), b = int(r, -4, 4), q = pick(r, [1, 4, 9, 16]), d = int(r, 1, 6);
    const plus = int(r, 0, 1) === 0;
    const v = (plus ? 1 : -1) * a / Math.sqrt(q);
    return { statement: `Calcule la limite en ${plus ? "+∞" : "−∞"} de f(x) = (${term(a, "x", true)}${term(b, "", false)})/√(${q}x² + ${d}) (arrondie au centième).`, answer: num(round(v, 2), 0.01), hints: H("Mets x en facteur : √(cx² + d) = |x|√(c + d/x²).", plus ? "En +∞, |x| = x." : "En −∞, |x| = −x.", "Simplifie par x ; les termes en 1/x et 1/x² tendent vers 0.", `La limite est ${plus ? "" : "−"}a/√c.`), solution: `lim f = ${plus ? "" : "−"}${a}/√${q} = ${S(round(v, 2))}.` };
  }),
  mk("li-taux", LI, 3, { skill: "Limites en 0 : (√(x + k²) − k)/x et sin(ax)/x", ref: `${BOOK}, chap. 1 §1.4, taux de variation (p. 16)`, kw: ["taux de variation", "dérivée", "limite en 0", "sin x / x"] }, (c, r) => {
    const t = int(r, 0, 1);
    if (t === 0) { const k = int(r, 1, 5); return { statement: `Calcule la limite en 0 de f(x) = (√(x + ${k * k}) − ${k})/x (arrondie au millième).`, answer: num(round(1 / (2 * k), 3), 0.001), hints: H("C'est le taux de variation de x ↦ √x en a = k².", "Sa dérivée est 1/(2√x).", `f′(${k * k}) = 1/(2 × ${k}).`, "Calcule."), solution: `La limite vaut 1/(2√${k * k}) = 1/${2 * k} ≈ ${fr(round(1 / (2 * k), 3))}.` }; }
    const a = nz(r, -5, 5);
    return { statement: `Calcule la limite en 0 de f(x) = sin(${a === 1 ? "" : a === -1 ? "−" : a}x)/x.`, answer: num(a), hints: H("On sait que sin u / u → 1 quand u → 0.", `Écris sin(${a}x)/x = ${a} × sin(${a}x)/(${a}x).`, "Le quotient tend vers 1.", `Limite : ${a}.`), solution: `lim = ${S(a)}.` };
  }),
  mk("li-reciproque", LI, 3, { skill: "Bijection réciproque : calcul de φ⁻¹(y) pour x² − 2px + c sur [p ; +∞[", ref: `${BOOK}, chap. 1 §3.1-3.2 (p. 23-27)`, kw: ["bijection", "bijection réciproque", "antécédent", "équation f(x) = y"] }, (c, r) => {
    const p = int(r, 1, 4), cc = int(r, -3, 5);
    const ymin = cc - p * p;
    const y = ymin + int(r, 1, 12);
    const x = p + Math.sqrt(y - cc + p * p);
    return { statement: `f est la fonction définie sur [${p} ; +∞[ par f(x) = ${quad(1, -2 * p, cc)}. C'est une bijection de [${p} ; +∞[ dans [${S(ymin)} ; +∞[. Calcule f⁻¹(${S(y)}) (arrondi au centième).`, answer: num(round(x, 2), 0.01), hints: H("f⁻¹(y) est l'unique antécédent de y dans [p ; +∞[.", `Résous x² − ${2 * p}x + ${S(cc)} = ${S(y)} avec x ≥ ${p}.`, `(x − ${p})² = ${S(y - cc + p * p)}.`, `x = ${p} + √${S(y - cc + p * p)}.`), solution: `f⁻¹(${S(y)}) = ${p} + √${y - cc + p * p} ≈ ${S(round(x, 2))}.` };
  }),
  mk("li-image-intervalle", LI, 2, { skill: "Image d'un intervalle par une fonction continue strictement monotone", ref: `${BOOK}, chap. 1 §2.1 (p. 19-20)`, kw: ["image d'un intervalle", "continue", "strictement monotone", "f([α ; β])"] }, (c, r) => {
    const k = int(r, -5, 5), p = int(r, -3, 0), q = int(r, 1, 3);
    const up = int(r, 0, 1) === 0;
    const f = (x: number) => (up ? x ** 3 + k : k - x ** 3);
    const lo = Math.min(f(p), f(q)), hi = Math.max(f(p), f(q));
    const askHi = int(r, 0, 1) === 0;
    return { statement: `f(x) = ${up ? "" : "−"}x³ ${k < 0 ? "−" : "+"} ${Math.abs(k)}. L'image de l'intervalle [${S(p)} ; ${q}] par f est l'intervalle [m ; M]. Quelle est la valeur de ${askHi ? "M" : "m"} ?`.replace(" + 0.", "."), answer: num(askHi ? hi : lo), hints: H("f est continue et strictement " + (up ? "croissante" : "décroissante") + " sur ℝ.", up ? "f([α ; β]) = [f(α) ; f(β)]." : "f([α ; β]) = [f(β) ; f(α)].", `f(${S(p)}) = ${S(f(p))} et f(${q}) = ${S(f(q))}.`, "Lis la borne demandée."), solution: `f([${S(p)} ; ${q}]) = [${S(lo)} ; ${S(hi)}].` };
  }),
  mk("li-zero", LI, 3, { skill: "Théorème des valeurs intermédiaires : localiser le zéro de x³ + x + c", ref: `${BOOK}, chap. 1 §2.2 (p. 21-22) : balayage et dichotomie`, kw: ["zéro d'une fonction", "balayage", "dichotomie", "encadrement", "valeurs intermédiaires"] }, (c, r) => {
    const k = int(r, -30, 30);
    const f = (x: number) => x ** 3 + x + k;
    let lo = -10, hi = 10;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; }
    const n = Math.ceil(lo + 1e-12);
    return { statement: `f(x) = x³ + x ${k < 0 ? "−" : "+"} ${Math.abs(k)} est continue et strictement croissante sur ℝ. L'équation f(x) = 0 a une unique solution α. Quel est l'entier n tel que n − 1 < α ≤ n ?`.replace(" + 0 est", " est").replace(" − 0 est", " est"), answer: num(n), hints: H("f est strictement croissante : cherche un changement de signe.", "Calcule f aux entiers consécutifs (méthode de balayage).", `Teste f(${n - 1}) = ${S(f(n - 1))} et f(${n}) = ${S(f(n))}.`, "Le changement de signe donne l'encadrement."), solution: `f(${n - 1}) = ${S(f(n - 1))} < 0 ≤ f(${n}) = ${S(f(n))} : ${n - 1} < α ≤ ${n}.` };
  }),
  mk("li-cours", LI, 1, { skill: "Limites et continuité : propriétés du cours", ref: `${BOOK}, chap. 1 (p. 8-28)`, kw: ["limite", "continuité", "formes indéterminées", "bijection", "valeurs intermédiaires"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelles sont les quatre formes indéterminées du manuel ?", good: "∞ − ∞ ; 0 × ∞ ; 0/0 ; ∞/∞", bad: ["∞ + ∞ ; 0 + ∞ ; 0/∞ ; ∞/0", "0 × 0 ; 1^∞ ; ∞ × ∞ ; 0 − ∞", "∞ − 0 ; 1/0 ; ∞/1 ; 0/1"], why: "Notation du manuel (§1.2) : formes indéterminées ∞ − ∞, 0 × ∞, 0/0 et ∞/∞." },
      { q: "f est définie en a. f est continue en a si et seulement si :", good: "la limite à gauche et la limite à droite en a sont égales à f(a)", bad: ["f(a) = 0", "f est dérivable en a", "f est croissante en a"], why: "Propriété du manuel (§1.1)." },
      { q: "f n'est pas définie en a mais admet une limite finie ℓ en a. Que peut-on faire ?", good: "La prolonger par continuité en posant g(a) = ℓ", bad: ["Elle est forcément dérivable en a", "Elle est forcément nulle en a", "Rien : elle n'est pas prolongeable"], why: "Définition du prolongement par continuité (§1.1)." },
      { q: "Si f ≥ g et lim g = +∞, alors :", good: "lim f = +∞", bad: ["lim f = 0", "lim f = −∞", "On ne peut pas conclure"], why: "Propriété de comparaison du manuel (§1.3)." },
      { q: "g ≤ f ≤ h avec lim g = lim h = l. Que vaut lim f ?", good: "l", bad: ["0", "+∞", "On ne peut pas conclure"], why: "Théorème d'encadrement (§1.3)." },
      { q: "f est continue sur [a ; b], f(a) et f(b) sont de signes contraires. Que peut-on affirmer ?", good: "L'équation f(x) = 0 a au moins une solution dans [a ; b]", bad: ["L'équation f(x) = 0 a exactement une solution", "f est strictement monotone", "f est dérivable"], why: "Propriété du manuel (§2.2) ; l'unicité demande en plus la stricte monotonie." },
      { q: "f est continue et strictement monotone sur un intervalle K. Alors f :", good: "détermine une bijection de K sur f(K)", bad: ["est une bijection de K sur K", "est dérivable sur K", "est paire"], why: "Propriété du manuel (§3.2)." },
      { q: "φ est une bijection continue strictement croissante d'un intervalle K sur L. Que dire de φ⁻¹ ?", good: "Elle est continue et strictement croissante sur L", bad: ["Elle est décroissante", "Elle n'est pas continue", "Elle est constante"], why: "Propriété du manuel (§3.2) : φ et φ⁻¹ ont le même sens de variation." },
      { q: "Pour n impair, x ↦ xⁿ définit une bijection de :", good: "ℝ dans ℝ", bad: ["ℝ dans ℝ₊", "ℝ₊ dans ℝ₋", "ℝ dans {0}"], why: "Fonctions puissances (§3.3) : pour n impair, fₙ est strictement croissante sur ℝ avec limites −∞ et +∞." },
      { q: "x ↦ x² est-elle injective sur ℝ ?", good: "Non : deux nombres opposés ont la même image", bad: ["Oui, elle est bijective", "Oui, car elle est continue", "Oui, car elle est paire"], why: "Application injective : images distinctes pour des éléments distincts ; (−1)² = 1² (§3.1)." },
    ];
    return qcmOf(r, pool, "Reprends les définitions du chapitre 1.");
  }, QCM),
];
