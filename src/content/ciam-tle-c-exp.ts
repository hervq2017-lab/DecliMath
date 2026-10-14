// CIAM Terminale SM (série C) : chapitre 12, Fonctions exponentielles et fonctions puissances. Énoncés originaux, réponses
// calculées par le code. Les démonstrations et tracés du manuel ne se corrigent pas automatiquement : on en garde les calculs
// (propriétés, équations, inéquations, limites, dérivées, primitives, bases a, puissances) et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf, sup } from "./ciam-kit";

const mk = ciam("tle", "ciamtx");
const BOOK = "CIAM Terminale SM";
const EX = "Fonctions exponentielles et fonctions puissances — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
const ex = (k: number) => (k === 1 ? "eˣ" : `e^(${n2(k)}x)`);
const INF = ["+∞", "−∞", "0", "un réel non nul"];

export const TC_EXP: Template[] = [
  mk("ex-simplifier", EX, 2, { skill: "Simplifier e^(a + ln p)/e^(b + ln q) = (p/q) e^(a − b)", ref: `${BOOK}, chap. 12 §1.1, notation eˣ et propriétés (p. 256-257) et ex. 1.a (p. 259)`, kw: ["propriété fondamentale", "e^(a + b) = eᵃeᵇ", "e^(ln x) = x", "simplifier une expression", "exponentielle"] }, (_c, r) => {
    const a = int(r, 0, 4), b = int(r, 0, 4), p = int(r, 2, 6), q = int(r, 2, 6), v = (p / q) * Math.exp(a - b);
    return { statement: `Simplifie A = e^(${a} + ln ${p}) / e^(${b} + ln ${q}) puis donne une valeur approchée de A au centième.`, answer: num(r2(v), 0.01), hints: H("Utilise e^(a + b) = eᵃ eᵇ et e^(ln x) = x.", `e^(${a} + ln ${p}) = ${p} e^${a}, e^(${b} + ln ${q}) = ${q} e^${b}.`, `A = (${p}/${q}) e^(${a - b}).`, "Calcule avec la calculatrice."), solution: `A = (${p}/${q}) e^${par(a - b)} ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("ex-equation-X", EX, 3, { skill: "Équation e²ˣ − (m + n)eˣ + mn = 0 : changement d'inconnue X = eˣ", ref: `${BOOK}, chap. 12 §1.3, travaux dirigés « Résolutions d'équations et d'inéquations » (p. 258-259) et ex. 1.b (p. 259)`, kw: ["changement d'inconnue", "X = eˣ", "équation du second degré", "e^x + 1 n'a pas de solution", "ln"] }, (_c, r) => {
    const m = int(r, 1, 4), n = m + int(r, 1, 4), S = m + n, P = m * n;
    return { statement: `Résous dans ℝ : e²ˣ − ${S === 1 ? "" : S}eˣ + ${P} = 0. Quelle est la plus grande solution (arrondie au centième) ?`, answer: num(r2(Math.log(n)), 0.01), hints: H("Pose X = eˣ, avec X > 0.", `X² − ${S}X + ${P} = 0 a pour racines ${m} et ${n}.`, "Reviens à x = ln X.", "Prends la plus grande racine."), solution: `eˣ = ${m} ou eˣ = ${n}, donc x = ln ${m} ≈ ${n2(r2(Math.log(m)))} ou x = ln ${n} ≈ ${n2(r2(Math.log(n)))}.` };
  }, FR),
  mk("ex-inequation", EX, 2, { skill: "Inéquation e^(ax + b) < c : croissance de l'exponentielle et logarithme", ref: `${BOOK}, chap. 12 §1.2, sens de variation, eᵃ < eᵇ ⇔ a < b (p. 257) et ex. 1.c (p. 259)`, kw: ["inéquation", "croissance de exp", "eᵃ < eᵇ", "ln", "ensemble des solutions"] }, (_c, r) => {
    const a = int(r, 1, 4), b = int(r, -4, 4), c = int(r, 2, 20), s = (Math.log(c) - b) / a;
    return { statement: `Résous dans ℝ : e^(${a === 1 ? "" : a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}) < ${c}. L'ensemble des solutions est ]−∞ ; s[ : quelle est la valeur de s (arrondie au centième) ?`.replace(" + 0)", ")"), answer: num(r2(s), 0.01), hints: H("exp est strictement croissante : on passe au logarithme sans changer le sens.", `${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} < ln ${c}.`, `x < (ln ${c} ${-b < 0 ? "−" : "+"} ${Math.abs(b)})/${a}.`, "Calcule."), solution: `s = (ln ${c} ${-b < 0 ? "−" : "+"} ${Math.abs(b)})/${a} ≈ ${n2(r2(s))}.` };
  }, FR),
  mk("ex-derivee-composee", EX, 2, { skill: "Dérivée de eᵘ : (eᵘ)′ = u′eᵘ", ref: `${BOOK}, chap. 12 §2.1, dérivée de exp∘u (p. 260) et ex. 2.a (p. 265)`, kw: ["(eᵘ)′ = u′eᵘ", "dérivée de exp∘u", "e^(−x²)", "dérivabilité"] }, (_c, r) => {
    const a = nz(r, -3, 3), b = int(r, -3, 3), x0 = int(r, -2, 2), u = a * x0 * x0 + b * x0, du = 2 * a * x0 + b, v = du * Math.exp(u);
    return { statement: `Soit f(x) = e^(${a === 1 ? "" : a === -1 ? "−" : a}x²${b === 0 ? "" : ` ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}x`}). Quelle est la valeur de f′(${n2(x0)}) (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H("(eᵘ)′ = u′eᵘ.", `u′(x) = ${n2(2 * a)}x${b === 0 ? "" : ` ${b < 0 ? "−" : "+"} ${Math.abs(b)}`}.`, `u(${n2(x0)}) = ${n2(u)} et u′(${n2(x0)}) = ${n2(du)}.`, "Calcule u′ eᵘ."), solution: `f′(${n2(x0)}) = ${n2(du)} × e^${par(u)} ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("ex-primitive", EX, 3, { skill: "Primitive de u′eᵘ : eᵘ", ref: `${BOOK}, chap. 12 §2.1, primitives de u′eᵘ (p. 260) et ex. 2.b (p. 265)`, kw: ["primitive", "u′eᵘ", "eᵘ", "condition initiale"] }, (_c, r) => {
    const a = nz(r, -2, 2), b = int(r, -2, 2), y0 = int(r, -3, 3), val = Math.exp(a + b) + (y0 - 1);
    return { statement: `F est la primitive sur ℝ de f(x) = (${a === 1 ? "" : a === -1 ? "−" : 2 * a}x${b === 0 ? "" : ` ${b < 0 ? "−" : "+"} ${Math.abs(b)}`})e^(${a === 1 ? "" : a === -1 ? "−" : a}x²${b === 0 ? "" : ` ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}x`}) telle que F(0) = ${n2(y0)}. Quelle est la valeur de F(1) (arrondie au centième) ?`.replace(`(${a === 1 ? "" : a === -1 ? "−" : 2 * a}x`, `(${n2(2 * a)}x`), answer: num(r2(val), 0.01), hints: H("f est de la forme u′eᵘ.", `Une primitive est eᵘ avec u(x) = ${n2(a)}x²${b === 0 ? "" : ` ${b < 0 ? "−" : "+"} ${Math.abs(b)}x`}.`, `F(x) = eᵘ + c, et F(0) = 1 + c = ${n2(y0)}.`, "Calcule F(1)."), solution: `c = ${n2(y0 - 1)} ; F(1) = e^${par(a + b)} + ${par(y0 - 1)} ≈ ${n2(r2(val))}.` };
  }, FR),
  mk("ex-limite-zero", EX, 2, { skill: "Limite usuelle en 0 : (e^(ax) − 1)/(bx) = a/b", ref: `${BOOK}, chap. 12 §1.2, propriété 2, lim (eˣ − 1)/x = 1 (p. 258) et TD, calculs de limites (p. 259)`, kw: ["lim (eˣ − 1)/x = 1", "nombre dérivé de exp en 0", "limite en 0", "taux d'accroissement"] }, (_c, r) => {
    const a = nz(r, -4, 4), b = int(r, 1, 4);
    return { statement: `Quelle est la limite en 0 de f(x) = (e^(${a === 1 ? "" : a === -1 ? "−" : a}x) − 1) / (${b === 1 ? "" : b}x) (arrondie au centième) ?`, answer: num(r2(a / b), 0.01), hints: H("Utilise lim (eᵘ − 1)/u = 1 quand u tend vers 0.", `Écris (e^(${n2(a)}x) − 1)/(${b}x) = [(e^(${n2(a)}x) − 1)/(${n2(a)}x)] × ${n2(a)}/${b}.`, "Le premier facteur tend vers 1.", "Calcule."), solution: `La limite est ${n2(a)}/${b} ≈ ${n2(r2(a / b))}.` };
  }, FR),
  mk("ex-limite-rationnelle", EX, 2, { skill: "Limites de (aeˣ + b)/(ceˣ + d) en +∞ et en −∞", ref: `${BOOK}, chap. 12 §1.3, calculs de limites (p. 259) et ex. 1.d (p. 259)`, kw: ["limite en +∞", "limite en −∞", "X = eˣ", "quotient", "fonction exponentielle"] }, (_c, r) => {
    const a = nz(r, -5, 5), b = nz(r, -5, 5), c = nz(r, -5, 5), d = nz(r, -5, 5), plus = int(r, 0, 1) === 0;
    return { statement: `Quelle est la limite en ${plus ? "+∞" : "−∞"} de f(x) = (${a}eˣ ${b < 0 ? "−" : "+"} ${Math.abs(b)}) / (${c}eˣ ${d < 0 ? "−" : "+"} ${Math.abs(d)}) (arrondie au centième) ?`, answer: num(r2(plus ? a / c : b / d), 0.01), hints: H("Pose X = eˣ.", plus ? "En +∞, X tend vers +∞ : on garde les termes dominants." : "En −∞, X tend vers 0 : on remplace eˣ par 0.", plus ? `La limite est ${n2(a)}/${par(c)}.` : `La limite est ${n2(b)}/${par(d)}.`, "Calcule."), solution: `La limite est ${plus ? `${n2(a)}/${par(c)}` : `${n2(b)}/${par(d)}`} ≈ ${n2(r2(plus ? a / c : b / d))}.` };
  }, FR),
  mk("ex-croissance-comparee", EX, 2, { skill: "Croissances comparées : eˣ/x, xeˣ en −∞, xᵅe⁻ˣ, (ln x)/xᵅ", ref: `${BOOK}, chap. 12 §1.2, limites aux bornes (p. 258) et §3.2, croissance comparée de ln x, eˣ, xᵅ (p. 267-268)`, kw: ["croissances comparées", "eˣ/x", "xeˣ", "xᵅe⁻ˣ", "forme indéterminée", "limite de référence"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Quelle est la limite en +∞ de eˣ/x ?", good: "+∞", bad: ["0", "1", "−∞"], why: "Propriété (3) : eˣ l'emporte sur x." },
      { q: "Quelle est la limite en −∞ de xeˣ ?", good: "0", bad: ["−∞", "+∞", "1"], why: "Propriété (4)." },
      { q: "Quelle est la limite en +∞ de x²e⁻ˣ ?", good: "0", bad: ["+∞", "1", "−∞"], why: "Croissance comparée : xᵅe⁻ˣ tend vers 0." },
      { q: "Quelle est la limite en +∞ de (ln x)/√x ?", good: "0", bad: ["+∞", "1", "−∞"], why: "Propriété (1) avec α = 1/2." },
      { q: "Quelle est la limite en 0 par valeurs supérieures de √x ln x ?", good: "0", bad: ["−∞", "+∞", "1"], why: "Propriété (2) avec α = 1/2." },
      { q: "Quelle est la limite en +∞ de x − eˣ ?", good: "−∞", bad: ["+∞", "0", "1"], why: "x − eˣ = x(1 − eˣ/x), et eˣ/x tend vers +∞." },
      { q: "Quelle est la limite en +∞ de eˣ/ln x ?", good: "+∞", bad: ["0", "1", "−∞"], why: "eˣ l'emporte sur ln x." },
    ];
    return qcmOf(r, T, "Rappelle-toi qui l'emporte : exp, puissance ou ln.");
  }, QCM),
  mk("ex-tangente", EX, 2, { skill: "Tangente à la courbe de exp au point d'abscisse x₀ : y = e^(x₀)(x − x₀ + 1)", ref: `${BOOK}, chap. 12 §1.2, courbe représentative et dérivée de exp (p. 257-258)`, kw: ["tangente", "(exp)′ = exp", "e^(x₀)", "ordonnée à l'origine"] }, (_c, r) => {
    const x0 = int(r, -4, 3), p = Math.exp(x0) * (1 - x0);
    return { statement: `La tangente à la courbe de l'exponentielle au point d'abscisse ${n2(x0)} a pour équation y = mx + p. Quelle est la valeur de p (arrondie au centième) ?`, answer: num(r2(p), 0.01), hints: H("(exp)′ = exp.", `f(${n2(x0)}) = f′(${n2(x0)}) = e^${par(x0)}.`, "y = e^(x₀)(x − x₀) + e^(x₀).", "p = e^(x₀)(1 − x₀)."), solution: `p = e^${par(x0)}(1 − ${par(x0)}) ≈ ${n2(r2(p))}.` };
  }, FR),
  mk("ex-base-a", EX, 3, { skill: "Exponentielle de base a : aˣ = e^(x ln a), (aˣ)′ = ln a × aˣ", ref: `${BOOK}, chap. 12 §2.3, fonctions exponentielles de base a (p. 262)`, kw: ["aˣ = e^(x ln a)", "base a", "(aˣ)′ = ln a aˣ", "exponentielle de base 10", "ln aˣ = x ln a"] }, (_c, r) => {
    const a = pick(r, [2, 3, 5, 10]), x0 = int(r, 0, 3), v = Math.log(a) * a ** x0;
    return { statement: `Soit f(x) = ${a}ˣ. Quelle est la valeur de f′(${x0}) (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H(`${a}ˣ = e^(x ln ${a}).`, `f′(x) = ln ${a} × ${a}ˣ.`, `ln ${a} ≈ ${fr(r2(Math.log(a)))}.`, `Multiplie par ${a}^${x0} = ${a ** x0}.`), solution: `f′(${x0}) = ln ${a} × ${a ** x0} ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("ex-equation-base-2", EX, 3, { skill: "Équation 2^(2x) − S·2ˣ + P = 0 : changement d'inconnue X = 2ˣ", ref: `${BOOK}, chap. 12 §2.4, travaux dirigés « Résolution d'équation » (p. 264) et ex. 2.f (p. 265)`, kw: ["équation en 2ˣ", "X = 2ˣ", "équation du second degré", "exponentielle de base a"] }, (_c, r) => {
    const m = int(r, -4, 2), n = m + int(r, 1, 4), S = 2 ** m + 2 ** n, P = 2 ** (m + n), fm = (v: number) => (Number.isInteger(v) ? `${v}` : fr(v));
    return { statement: `Résous dans ℝ : 2^(2x) − ${fm(S)}·2ˣ + ${fm(P)} = 0. Quelle est la plus grande solution ?`, answer: num(n), hints: H("Pose X = 2ˣ, avec X > 0.", `X² − ${fm(S)}X + ${fm(P)} = 0 a pour racines ${fm(2 ** m)} et ${fm(2 ** n)}.`, "Reviens à x : 2ˣ = 2ᵏ équivaut à x = k.", "Choisis la plus grande."), solution: `2ˣ = ${fm(2 ** m)} ou 2ˣ = ${fm(2 ** n)}, donc x = ${n2(m)} ou x = ${n2(n)}.` };
  }, FR),
  mk("ex-cosinus-hyperbolique", EX, 2, { skill: "Chaînette : ch x = (eˣ + e⁻ˣ)/2, minimum 1 en 0", ref: `${BOOK}, chap. 12 §2.4, travaux dirigés « La chaînette » (p. 264)`, kw: ["chaînette", "cosinus hyperbolique", "(eˣ + e⁻ˣ)/2", "fonction paire", "minimum"] }, (_c, r) => {
    const x0 = pick(r, [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]), v = (Math.exp(x0) + Math.exp(-x0)) / 2;
    return { statement: `Soit φ(x) = (eˣ + e⁻ˣ)/2 (cosinus hyperbolique). Quelle est la valeur de φ(${fr(x0)}) (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H("Calcule e^x et e^(−x).", `e^${fr(x0)} ≈ ${fr(r2(Math.exp(x0)))}.`, `e^(−${fr(x0)}) ≈ ${fr(r2(Math.exp(-x0)))}.`, "Fais la demi-somme."), solution: `φ(${fr(x0)}) = (e^${fr(x0)} + e^(−${fr(x0)}))/2 ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("ex-cloche", EX, 3, { skill: "Courbe en cloche f(x) = e^(−ax²) : points d'inflexion en ±1/√(2a)", ref: `${BOOK}, chap. 12 §2.2, étude de x ↦ e^(−x²) (p. 260-261)`, kw: ["e^(−x²)", "courbe en cloche", "point d'inflexion", "dérivée seconde", "courbe de Gauss"] }, (_c, r) => {
    const a = pick(r, [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]);
    return { statement: `La courbe de f(x) = e^(−${a === 1 ? "" : fr(a)}x²) admet deux points d'inflexion d'abscisses ±t. Quelle est la valeur de t (arrondie au centième) ?`, answer: num(r2(1 / Math.sqrt(2 * a)), 0.01), hints: H("f′(x) = −2ax e^(−ax²).", `f″(x) = (4a²x² − 2a) e^(−ax²) avec a = ${fr(a)}.`, "f″ s'annule en changeant de signe pour 4a²x² = 2a.", `x² = 1/(2a), soit x = 1/√(${fr(2 * a)}).`), solution: `t = 1/√(${fr(2 * a)}) ≈ ${n2(r2(1 / Math.sqrt(2 * a)))}.` };
  }, FR),
  mk("ex-puissance-derivee", EX, 3, { skill: "Fonction puissance g_α(x) = xᵅ : g′(x) = α x^(α−1)", ref: `${BOOK}, chap. 12 §3.1, étude de la fonction x ↦ xᵅ (p. 265-266)`, kw: ["fonction puissance", "xᵅ = e^(α ln x)", "dérivée αx^(α−1)", "exposant réel"] }, (_c, r) => {
    const al = pick(r, [1.5, 2.5, -0.5, 0.3, -1.5, Math.SQRT2, 3.2]), x0 = int(r, 1, 4), v = al * x0 ** (al - 1), name = al === Math.SQRT2 ? "√2" : fr(al);
    return { statement: `Soit g(x) = x^${al < 0 ? `(${name.replace("-", "−")})` : name} sur ]0 ; +∞[. Quelle est la valeur de g′(${x0}) (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H("xᵅ = e^(α ln x).", `g′(x) = α x^(α−1) avec α = ${name}.`, `g′(${x0}) = α × ${x0}^(α − 1).`, "Calcule avec la calculatrice."), solution: `g′(${x0}) = ${name} × ${x0}^(${fr(r2(al - 1))}) ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("ex-puissance-etude", EX, 3, { skill: "Étude de xᵅ aux bornes : limites en 0 et +∞, branche infinie selon α", ref: `${BOOK}, chap. 12 §3.1, études aux bornes et tableau de variation de g_α (p. 265-266)`, kw: ["xᵅ", "limite en 0", "limite en +∞", "branche parabolique", "direction asymptotique", "α > 1", "0 < α < 1"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Si α > 0, la limite de xᵅ quand x tend vers 0 par valeurs supérieures est…", good: "0", bad: ["+∞", "1", "−∞"], why: "α ln x tend vers −∞." },
      { q: "Si α < 0, la limite de xᵅ quand x tend vers 0 par valeurs supérieures est…", good: "+∞", bad: ["0", "1", "−∞"], why: "α ln x tend vers +∞." },
      { q: "Si α < 0, la limite de xᵅ en +∞ est…", good: "0", bad: ["+∞", "1", "−∞"], why: "α ln x tend vers −∞." },
      { q: "Si α > 1, la courbe de xᵅ admet en +∞ une branche parabolique de direction…", good: "(OJ)", bad: ["(OI)", "la droite y = x", "aucune direction"], why: "xᵅ/x = e^((α−1) ln x) tend vers +∞." },
      { q: "Si 0 < α < 1, la courbe de xᵅ admet en +∞ une branche parabolique de direction…", good: "(OI)", bad: ["(OJ)", "la droite y = x", "aucune direction"], why: "xᵅ/x tend vers 0." },
      { q: "La fonction x ↦ xᵅ est strictement croissante sur ]0 ; +∞[ si…", good: "α > 0", bad: ["α < 0", "α < 1", "α > 1 seulement"], why: "Sa dérivée est αx^(α−1), du signe de α." },
      { q: "Pour x > 0, xᵅ est défini par…", good: "e^(α ln x)", bad: ["α e^(ln x)", "ln(x^α) × α", "e^(x ln α)"], why: "Définition de la fonction puissance." },
    ];
    return qcmOf(r, T, "Écris xᵅ = e^(α ln x) et étudie α ln x.");
  }, QCM),
  mk("ex-primitive-puissance", EX, 3, { skill: "Primitive de u′uᵅ (α ≠ −1) : u^(α+1)/(α + 1)", ref: `${BOOK}, chap. 12 §3.1, propriété 2, primitive de u′uᵅ (p. 267)`, kw: ["primitive", "u′uᵅ", "u^(α+1)/(α + 1)", "exposant réel"] }, (_c, r) => {
    const al = pick(r, [0.5, 1.5, 2, 3, -2, -0.5, 2.5]), x1 = pick(r, [1, 2, 3]), u0 = 1, u1 = 1 + x1 * x1, val = (u1 ** (al + 1) - u0 ** (al + 1)) / (al + 1);
    return { statement: `F est la primitive sur ℝ de f(x) = 2x(1 + x²)^${al < 0 ? `(${fr(al).replace("-", "−")})` : fr(al)} telle que F(0) = 0. Quelle est la valeur de F(${x1}) (arrondie au centième) ?`, answer: num(r2(val), 0.01), hints: H("f est de la forme u′uᵅ avec u = 1 + x².", `Une primitive est u^(α+1)/(α + 1), avec α + 1 = ${fr(r2(al + 1))}.`, "Ajuste la constante pour que F(0) = 0.", `Calcule F(${x1}) = (${u1}^(α+1) − 1)/(α + 1).`), solution: `F(${x1}) = (${u1}^${fr(r2(al + 1))} − 1)/${fr(r2(al + 1))} ≈ ${n2(r2(val))}.` };
  }, FR),
  mk("ex-equation-base-a", EX, 2, { skill: "Équation aᵘ = aᵛ avec a > 0, a ≠ 1 : égalité des exposants", ref: `${BOOK}, chap. 12 §2.3, exponentielles de base a (p. 262) et ex. 22 (p. 272)`, kw: ["équation exponentielle", "aˣ = aʸ", "base a", "égalité des exposants", "ln"] }, (_c, r) => {
    const a = pick(r, [2, 3, 5]), p = int(r, 1, 4), q = int(r, -3, 3), k = int(r, 1, 3), x = (k - q) / p;
    return { statement: `Résous dans ℝ : ${a}^(${p === 1 ? "" : p}x ${q < 0 ? "−" : "+"} ${Math.abs(q)}) = ${a ** k}. Quelle est la solution (arrondie au centième) ?`.replace(" + 0)", ")"), answer: num(r2(x), 0.01), hints: H(`Écris ${a ** k} = ${a}^${k}.`, "aᵘ = aᵛ équivaut à u = v car a > 0 et a ≠ 1.", `${p}x ${q < 0 ? "−" : "+"} ${Math.abs(q)} = ${k}.`, "Résous."), solution: `${p}x = ${k - q}, donc x = ${n2(r2(x))}.` };
  }, FR),
  mk("ex-inequation-base-a", EX, 3, { skill: "Inéquation aˣ < c : le sens dépend de a > 1 ou 0 < a < 1", ref: `${BOOK}, chap. 12 §2.3, exponentielles de base a (p. 262) et ex. 24 (p. 272)`, kw: ["inéquation exponentielle", "base a < 1", "sens de l'inégalité", "ln a < 0", "aˣ"] }, (_c, r) => {
    const a = pick(r, [2, 3, 0.5, 0.1]), c = pick(r, [4, 8, 10, 100]), s = Math.log(c) / Math.log(a), less = a > 1;
    return { statement: `Résous dans ℝ : (${fr(a)})ˣ < ${c}. Les solutions sont ${less ? "]−∞ ; s[" : "]s ; +∞["} : quelle est la valeur de s (arrondie au centième) ?`, answer: num(r2(s), 0.01), hints: H(`(${fr(a)})ˣ = e^(x ln ${fr(a)}).`, `ln ${fr(a)} ${a < 1 ? "< 0 : l'inégalité change de sens" : "> 0 : le sens est conservé"}.`, `x ${less ? "<" : ">"} ln ${c} / ln ${fr(a)}.`, "Calcule."), solution: `s = ln ${c}/ln ${fr(a)} ≈ ${n2(r2(s))}.` };
  }, FR),
  mk("ex-limite-base-a", EX, 2, { skill: "Limites de aˣ en ±∞ selon a < 1 ou a > 1", ref: `${BOOK}, chap. 12 §2.3, aˣ = e^(x ln a) (p. 262) et ex. 25 (p. 272)`, kw: ["limite de aˣ", "a > 1", "0 < a < 1", "e^(x ln a)", "limite en l'infini"] }, (_c, r) => {
    const a = pick(r, [2, 3, 0.5, 0.1, 1.5, 0.8]), plus = int(r, 0, 1) === 0, big = (a > 1) === plus;
    return { statement: `Quelle est la limite de (${fr(a)})ˣ quand x tend vers ${plus ? "+∞" : "−∞"} ?`, answer: choice(r, INF, big ? 0 : 2), hints: H(`(${fr(a)})ˣ = e^(x ln ${fr(a)}).`, `ln ${fr(a)} est ${a > 1 ? "positif" : "négatif"}.`, `x ln ${fr(a)} tend vers ${big ? "+∞" : "−∞"}.`, "Compose avec exp."), solution: `La limite est ${big ? "+∞" : "0"}.` };
  }, QCM),
  mk("ex-puissances-ecriture", EX, 2, { skill: "Propriétés des puissances réelles : aˣ⁺ʸ = aˣaʸ, (aˣ)ʸ = aˣʸ", ref: `${BOOK}, chap. 12 §2.3, propriétés 2 (p. 262) et ex. 28 (p. 272)`, kw: ["aˣ⁺ʸ", "(aˣ)ʸ = aˣʸ", "écrire sous la forme aᵇ", "exposants"] }, (_c, r) => {
    const p = int(r, -3, 3), q = nz(r, -3, 3), m = int(r, 2, 4), n = int(r, 1, 3), t = int(r, 0, 1);
    if (t === 0) return { statement: `Écris a^${par(p)} × a^${par(q)} sous la forme aᵇ (a > 0). Quelle est la valeur de b ?`, answer: num(p + q), hints: H("aˣ⁺ʸ = aˣ × aʸ.", "On additionne les exposants.", `${n2(p)} + ${par(q)}.`, "Calcule."), solution: `b = ${n2(p)} + ${par(q)} = ${n2(p + q)}.` };
    return { statement: `Écris (a^${par(q)})^${m} × a^${n} sous la forme aᵇ (a > 0). Quelle est la valeur de b ?`, answer: num(q * m + n), hints: H("(aˣ)ʸ = aˣʸ puis aˣ⁺ʸ = aˣ aʸ.", `(a^${par(q)})^${m} = a^${n2(q * m)}.`, `On additionne ${n2(q * m)} et ${n}.`, "Calcule."), solution: `b = ${n2(q * m)} + ${n} = ${n2(q * m + n)}.` };
  }, FR),
  mk("ex-cours", EX, 1, { skill: "Cours : exponentielle, notation eˣ, propriétés, bases a et fonctions puissances", ref: `${BOOK}, chap. 12, cours (p. 255-268)`, kw: ["fonction exponentielle", "eˣ", "e^(a + b) = eᵃeᵇ", "(eˣ)′ = eˣ", "aˣ = e^(x ln a)"] }, (_c, r) => {
    const T: Item[] = [
      { q: "La fonction exponentielle est…", good: "la bijection réciproque de ln", bad: ["la dérivée de ln", "la primitive de ln", "la fonction x ↦ x^e"], why: "Définition." },
      { q: "Pour tous réels a et b, e^(a + b) vaut…", good: "eᵃ × eᵇ", bad: ["eᵃ + eᵇ", "eᵃ × b", "eᵃᵇ"], why: "Propriété fondamentale." },
      { q: "Pour tout réel x, ln(eˣ) vaut…", good: "x", bad: ["eˣ", "1", "ln x"], why: "ln et exp sont réciproques." },
      { q: "La dérivée de eˣ est…", good: "eˣ", bad: ["xeˣ⁻¹", "e", "1/eˣ"], why: "Propriété 1." },
      { q: "Pour tout réel x, eˣ ≥ …", good: "x + 1", bad: ["x", "2x", "x − 1"], why: "La courbe est au-dessus de sa tangente en J." },
      { q: "e⁻ᵃ vaut…", good: "1/eᵃ", bad: ["−eᵃ", "eᵃ", "1/e"], why: "Propriété (1)." },
      { q: "Pour a > 0, aˣ est défini par…", good: "e^(x ln a)", bad: ["x ln a", "e^(a ln x)", "ln(a)ˣ"], why: "Définition de l'exponentielle de base a." },
      { q: "L'exponentielle de base 10 est la bijection réciproque…", good: "du logarithme décimal", bad: ["du logarithme népérien", "de la racine carrée", "de la fonction exp"], why: "Remarque de la page 262." },
    ];
    return qcmOf(r, T, "Reprends la définition de exp.");
  }, QCM),
];
void ex; void choice; void INF; void sup;
