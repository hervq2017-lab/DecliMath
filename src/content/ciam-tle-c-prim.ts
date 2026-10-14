// CIAM Terminale SM (série C) : chapitre 11 §1, Primitives d'une fonction. Énoncés originaux, réponses calculées par le code.
// Les démonstrations et travaux dirigés du manuel (existence, polynômes trigonométriques) ne se corrigent pas automatiquement :
// on en garde les calculs de primitives, la condition initiale et le cours.
import { fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf, sup } from "./ciam-kit";

const mk = ciam("tle", "ciamtr");
const BOOK = "CIAM Terminale SM";
const PR = "Primitives — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
const pol = (c: number[]) => {
  const n = c.length - 1;
  let s = "";
  c.forEach((a, i) => {
    const e = n - i;
    if (a === 0) return;
    const ab = Math.abs(a), body = e === 0 ? fr(ab) : `${ab === 1 ? "" : fr(ab)}x${e > 1 ? sup(e) : ""}`;
    s += s === "" ? `${a < 0 ? "−" : ""}${body}` : ` ${a < 0 ? "−" : "+"} ${body}`;
  });
  return s || "0";
};
const ev = (c: number[], x: number) => c.reduce((acc, a) => acc * x + a, 0);

export const TC_PRIM: Template[] = [
  mk("pr-reconnaitre", PR, 1, { skill: "Reconnaître une primitive d'un polynôme : F′ = f", ref: `${BOOK}, chap. 11 §1.1, définition d'une primitive (p. 234) et ex. 1.a (p. 239)`, kw: ["primitive", "F′ = f", "vérifier qu'une fonction est une primitive", "dérivée"] }, (_c, r) => {
    const a = nz(r, -3, 3), b = nz(r, -3, 3), c = int(r, -5, 5), f = [3 * a, 2 * b, c], F = [a, b, c, 0];
    const wrong = [[3 * a, 2 * b, c, 0], [a, b, c, 0].map((x, i) => (i === 0 ? x + 1 : x)), [a, 2 * b, c, 0]];
    const it: Item = { q: `Laquelle de ces fonctions est une primitive sur ℝ de f(x) = ${pol(f)} ?`, good: `F(x) = ${pol(F)}`, bad: wrong.map((w) => `F(x) = ${pol(w)}`), why: `La dérivée de ${pol(F)} est ${pol(f)}.` };
    return qcmOf(r, [it], "Dérive chaque proposition.");
  }, QCM),
  mk("pr-polynome-condition", PR, 2, { skill: "Primitive d'un polynôme prenant une valeur donnée en un point : constante c = y₀ − F₀(x₀)", ref: `${BOOK}, chap. 11 §1.1, propriété 2 (p. 235) et §1.2, primitives des fonctions élémentaires (p. 235) et ex. 1.b, 1.d (p. 239)`, kw: ["primitive", "condition initiale", "F(x₀) = y₀", "constante d'intégration", "x ↦ xⁿ⁺¹/(n + 1)"] }, (_c, r) => {
    const a = nz(r, -3, 3), b = nz(r, -3, 3), c = int(r, -5, 5), x0 = int(r, -2, 2), y0 = int(r, -6, 6), F0 = [a, b, c, 0], k = y0 - ev(F0, x0);
    return { statement: `Soit f(x) = ${pol([3 * a, 2 * b, c])}. La primitive F de f sur ℝ telle que F(${n2(x0)}) = ${n2(y0)} s'écrit F(x) = ${pol(F0)} + k. Quelle est la valeur de k ?`, answer: num(k), hints: H("Une primitive de xⁿ est xⁿ⁺¹/(n + 1).", `Une primitive de f est ${pol(F0)}.`, `On impose F(${n2(x0)}) = ${n2(y0)}.`, "Résous en k."), solution: `${n2(ev(F0, x0))} + k = ${n2(y0)}, donc k = ${n2(k)}.` };
  }, FR),
  mk("pr-inverse-puissance", PR, 2, { skill: "Primitive de x ↦ 1/xⁿ (n ≥ 2) : −1/((n − 1)xⁿ⁻¹), sur ]0 ; +∞[", ref: `${BOOK}, chap. 11 §1.2, primitives de fonctions élémentaires (p. 235)`, kw: ["primitive", "1/xⁿ", "−1/((n − 1)xⁿ⁻¹)", "intervalle ]0 ; +∞["] }, (_c, r) => {
    const n = int(r, 2, 4), y0 = int(r, -3, 3), x1 = pick(r, [2, 3, 4]), k = y0 + 1 / (n - 1), val = -1 / ((n - 1) * x1 ** (n - 1)) + k;
    return { statement: `F est la primitive sur ]0 ; +∞[ de f(x) = 1/x${sup(n)} telle que F(1) = ${n2(y0)}. Quelle est la valeur de F(${x1}) (arrondie au centième) ?`, answer: num(r2(val), 0.01), hints: H("Une primitive de 1/xⁿ est −1/((n − 1)xⁿ⁻¹).", `F(x) = −1/(${n - 1}x${n - 1 > 1 ? sup(n - 1) : ""}) + k.`, `F(1) = ${n2(y0)} donne k = ${fr(r2(k))}.`, `Calcule F(${x1}).`), solution: `F(x) = −1/(${n - 1}x${n - 1 > 1 ? sup(n - 1) : ""}) + ${fr(r2(k))}, donc F(${x1}) ≈ ${n2(r2(val))}.` };
  }, FR),
  mk("pr-racine", PR, 2, { skill: "Primitive de x ↦ a/√x : 2a√x + k", ref: `${BOOK}, chap. 11 §1.2, primitives de fonctions élémentaires (p. 235) et ex. 1.d (p. 239)`, kw: ["primitive", "1/√x", "2√x", "intervalle ]0 ; +∞["] }, (_c, r) => {
    const a = nz(r, -3, 3), s0 = pick(r, [1, 2, 3]), s1 = pick(r, [4, 5, 6]), y0 = int(r, -4, 4), val = y0 + 2 * a * (s1 - s0);
    return { statement: `F est la primitive sur ]0 ; +∞[ de f(x) = ${a === 1 ? "" : a === -1 ? "−" : a}/√x telle que F(${s0 * s0}) = ${n2(y0)}. Quelle est la valeur de F(${s1 * s1}) ?`, answer: num(val), hints: H("Une primitive de 1/√x est 2√x.", `F(x) = ${n2(2 * a)}√x + k.`, `F(${s0 * s0}) = ${n2(2 * a * s0)} + k = ${n2(y0)}.`, `Calcule F(${s1 * s1}).`), solution: `k = ${n2(y0 - 2 * a * s0)} ; F(${s1 * s1}) = ${n2(2 * a * s1)} + ${par(y0 - 2 * a * s0)} = ${n2(val)}.` };
  }, FR),
  mk("pr-composee", PR, 3, { skill: "Primitive de u′uⁿ : uⁿ⁺¹/(n + 1)", ref: `${BOOK}, chap. 11 §1.2, primitives de u′ × (v′∘u) (p. 236-237) et ex. 1.c (p. 239)`, kw: ["u′uⁿ", "uⁿ⁺¹/(n + 1)", "primitive d'une composée", "u′ × (v′∘u)"] }, (_c, r) => {
    const p = int(r, -3, 3), q = int(r, -3, 3), n = int(r, 2, 3), x1 = pick(r, [1, 2]);
    const u = (x: number) => x * x + p * x + q, val = (u(x1) ** (n + 1) - u(0) ** (n + 1)) / (n + 1);
    return { statement: `F est la primitive sur ℝ de f(x) = (${pol([2, p])})(${pol([1, p, q])})${sup(n)} telle que F(0) = 0. Quelle est la valeur de F(${x1}) (arrondie au centième) ?`, answer: num(r2(val), 0.01), hints: H("f est de la forme u′uⁿ avec u(x) = " + pol([1, p, q]) + ".", `Une primitive est uⁿ⁺¹/(n + 1) = (${pol([1, p, q])})${sup(n + 1)}/${n + 1}.`, "Ajuste la constante pour que F(0) = 0.", `Calcule F(${x1}).`), solution: `F(x) = [u(x)${sup(n + 1)} − u(0)${sup(n + 1)}]/${n + 1} ; F(${x1}) = (${u(x1)}${sup(n + 1)} − ${par(u(0))}${sup(n + 1)})/${n + 1} ≈ ${n2(r2(val))}.` };
  }, FR),
  mk("pr-trigonometrique", PR, 2, { skill: "Primitive de x ↦ k sin(ax) et k cos(ax) : −(k/a) cos(ax), (k/a) sin(ax)", ref: `${BOOK}, chap. 11 §1.2, primitives de fonctions trigonométriques (p. 235-238) et ex. 1.a, 1.d (p. 239)`, kw: ["primitive", "sin(ax + b)", "−cos", "k sin(ax)", "cos(ax)"] }, (_c, r) => {
    const a = int(r, 1, 4), k = nz(r, -4, 4), y0 = int(r, -4, 4), sin = int(r, 0, 1) === 0;
    return sin
      ? { statement: `F est la primitive sur ℝ de f(x) = ${k === 1 ? "" : k === -1 ? "−" : k}sin(${a === 1 ? "" : a}x) telle que F(0) = ${n2(y0)}. On écrit F(x) = −(${n2(k)}/${a}) cos(${a === 1 ? "" : a}x) + c. Quelle est la valeur de c (arrondie au centième) ?`, answer: num(r2(y0 + k / a), 0.01), hints: H("Une primitive de sin(ax) est −cos(ax)/a.", "F(0) = −k/a + c car cos 0 = 1.", `c = ${n2(y0)} + ${n2(k)}/${a}.`, "Calcule."), solution: `F(0) = −${par(k)}/${a} + c = ${n2(y0)}, donc c = ${n2(r2(y0 + k / a))}.` }
      : { statement: `F est la primitive sur ℝ de f(x) = ${k === 1 ? "" : k === -1 ? "−" : k}cos(${a === 1 ? "" : a}x) telle que F(0) = ${n2(y0)}. On écrit F(x) = (${n2(k)}/${a}) sin(${a === 1 ? "" : a}x) + c. Quelle est la valeur de c ?`, answer: num(y0), hints: H("Une primitive de cos(ax) est sin(ax)/a.", "sin 0 = 0.", "F(0) = c.", "Conclus."), solution: `F(0) = c = ${n2(y0)}.` };
  }, FR),
  mk("pr-sinus-puissance", PR, 3, { skill: "Primitive de x ↦ cos x sinⁿx : sinⁿ⁺¹x/(n + 1)", ref: `${BOOK}, chap. 11 §1.2, primitives de u′uⁿ et u′ cos u (p. 236-238) et ex. 1.c (p. 239)`, kw: ["cos x sinⁿx", "u′uⁿ", "sinⁿ⁺¹x/(n + 1)", "primitive trigonométrique"] }, (_c, r) => {
    const a = nz(r, -4, 4), n = int(r, 1, 4);
    return { statement: `F est la primitive sur ℝ de f(x) = ${a === 1 ? "" : a === -1 ? "−" : a}cos x sin${sup(n)}x telle que F(0) = 0. Quelle est la valeur de F(π/2) (arrondie au centième) ?`, answer: num(r2(a / (n + 1)), 0.01), hints: H("f est de la forme a u′uⁿ avec u = sin x.", `Une primitive est a sin${sup(n + 1)}x/${n + 1}.`, "F(0) = 0 impose la constante nulle.", "sin(π/2) = 1."), solution: `F(π/2) = ${n2(a)}/${n + 1} ≈ ${n2(r2(a / (n + 1)))}.` };
  }, FR),
  mk("pr-tangente-carre", PR, 3, { skill: "Primitive de tan²x = (1 + tan²x) − 1 : tan x − x", ref: `${BOOK}, chap. 11 §1.2, primitives de la somme de deux fonctions, exemple tan²x (p. 236)`, kw: ["tan²x", "1 + tan²x", "tan x − x", "primitive"] }, (_c, r) => {
    const a = nz(r, -4, 4), val = a * (1 - Math.PI / 4);
    return { statement: `F est la primitive sur ]−π/2 ; π/2[ de f(x) = ${a === 1 ? "" : a === -1 ? "−" : a}tan²x telle que F(0) = 0. Quelle est la valeur de F(π/4) (arrondie au centième) ?`, answer: num(r2(val), 0.01), hints: H("tan²x = (1 + tan²x) − 1.", "Une primitive de 1 + tan²x est tan x.", `Une primitive de f est ${n2(a)}(tan x − x).`, "Calcule en π/4 (tan(π/4) = 1)."), solution: `F(π/4) = ${n2(a)}(1 − π/4) ≈ ${n2(r2(val))}.` };
  }, FR),
  mk("pr-cours", PR, 1, { skill: "Cours : primitives, existence et unicité à une constante près", ref: `${BOOK}, chap. 11 §1.1-1.3, primitives, propriétés 1 et 2, travaux dirigés (p. 234-238)`, kw: ["primitive", "fonction continue", "constante", "unicité", "F(x₀) = y₀"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Si f est continue sur un intervalle K, alors…", good: "f admet une primitive sur K", bad: ["f est dérivable sur K", "f admet une unique primitive sur K", "f est constante sur K"], why: "Propriété admise." },
      { q: "Si F est une primitive de f sur K, les autres primitives sont…", good: "les fonctions x ↦ F(x) + c, avec c réel", bad: ["les fonctions x ↦ cF(x)", "uniquement F", "les fonctions x ↦ F(x + c)"], why: "Propriété 1." },
      { q: "Combien de primitives de f sur K prennent la valeur y₀ en x₀ ?", good: "Une seule", bad: ["Aucune", "Deux", "Une infinité"], why: "Propriété 2." },
      { q: "Une primitive de x ↦ x² sur ℝ est…", good: "x ↦ x³/3", bad: ["x ↦ 2x", "x ↦ x³", "x ↦ x²/2"], why: "Tableau des primitives usuelles." },
      { q: "Une primitive de u′/√u sur un intervalle où u > 0 est…", good: "2√u", bad: ["√u", "1/(2√u)", "u/√u"], why: "Tableau de la page 236." },
      { q: "Une primitive de x ↦ cos x sur ℝ est…", good: "x ↦ sin x", bad: ["x ↦ −sin x", "x ↦ −cos x", "x ↦ tan x"], why: "Tableau des primitives usuelles." },
      { q: "Une primitive de 1 + tan²x sur ]−π/2 ; π/2[ est…", good: "tan x", bad: ["1/cos x", "−tan x", "tan²x"], why: "Tableau des primitives usuelles." },
      { q: "La fonction g définie par g(x) = 0 si x ≠ 0 et g(0) = 1 admet-elle une primitive sur ℝ ?", good: "Non", bad: ["Oui, la fonction nulle", "Oui, x ↦ x", "Oui, une infinité"], why: "Travaux dirigés, p. 237-238." },
    ];
    return qcmOf(r, T, "Reprends les propriétés 1 et 2.");
  }, QCM),
];
