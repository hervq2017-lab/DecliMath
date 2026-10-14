// CIAM Terminale SE (série D) : calcul intégral, suites numériques, équations différentielles. Pages du manuel « CIAM Terminale SE ».
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtd");
const BOOK = "CIAM Tle SE";
const CI = "Calcul intégral — série D";
const SU = "Suites numériques — série D";
const ED = "Équations différentielles — série D";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const nz = (r: () => number, lo: number, hi: number) => { let v = 0; while (v === 0) v = lo + Math.floor(r() * (hi - lo + 1)); return v; };
const term = (a: number, v: string, first: boolean) => {
  if (a === 0) return "";
  const m = Math.abs(a) === 1 && v !== "" ? "" : String(Math.abs(a));
  return first ? `${a < 0 ? "−" : ""}${m}${v}` : ` ${a < 0 ? "−" : "+"} ${m}${v}`;
};
const lin = (a: number, b: number) => `${term(a, "x", true)}${term(b, "", a === 0)}`;
const quad = (a: number, b: number, c: number) => `${term(a, "x²", true)}${term(b, "x", a === 0)}${term(c, "", a === 0 && b === 0)}`;

export const TDD: Template[] = [
  // ===== Chapitre 7 : calcul intégral =====
  mk("ci-polynome", CI, 1, { skill: "Intégrale d'un polynôme : F(b) − F(a)", ref: `${BOOK}, chap. 7 §1.1 (p. 142) et ex. 1.a (p. 144)`, kw: ["intégrale", "primitive", "[F(x)]ₐᵇ", "F(b) − F(a)"] }, (c, r) => {
    const a = nz(r, -3, 3), b = int(r, -4, 4), cc = int(r, -5, 5);
    const lo = int(r, -2, 1), hi = lo + int(r, 1, 3);
    const F = (x: number) => (a * x ** 3) / 3 + (b * x ** 2) / 2 + cc * x;
    const v = F(hi) - F(lo);
    return { statement: `Calcule ∫ de ${S(lo)} à ${hi} de (${quad(a, b, cc)}) dx (arrondi au centième).`, answer: num(round(v, 2), 0.02), hints: H("∫ₐᵇ f(x)dx = F(b) − F(a) où F est une primitive de f.", `F(x) = ${S(round(a / 3, 3))}x³ + ${S(round(b / 2, 3))}x² + ${S(cc)}x.`, `F(${hi}) = ${S(round(F(hi), 3))} et F(${S(lo)}) = ${S(round(F(lo), 3))}.`, "Soustrais."), solution: `F(${hi}) − F(${S(lo)}) = ${S(round(v, 2))}.` };
  }),
  mk("ci-chasles", CI, 2, { skill: "Relation de Chasles et fonction définie par morceaux", ref: `${BOOK}, chap. 7 §1.2 (p. 145)`, kw: ["relation de Chasles", "intégrale", "fonction par morceaux", "linéarité"] }, (c, r) => {
    const p = nz(r, 1, 3), q = int(r, -2, 2), m = int(r, 2, 4);
    // f(x) = p x + q sur [0 ; 1] ; f(x) = −m x + (p + q + m) sur [1 ; 3] ; continue en 1
    const d = p + q + m;
    const I1 = p / 2 + q, I2 = -m * (9 - 1) / 2 + d * 2;
    return { statement: `f est définie sur [0 ; 3] par f(x) = ${lin(p, q)} si x ≤ 1, et f(x) = ${lin(-m, d)} si x ≥ 1 (f est continue). Calcule ∫ de 0 à 3 de f(x) dx (arrondi au centième).`, answer: num(round(I1 + I2, 2), 0.02), hints: H("Relation de Chasles : ∫₀³ = ∫₀¹ + ∫₁³.", `∫₀¹ (${lin(p, q)}) dx = ${S(round(I1, 3))}.`, `∫₁³ (${lin(-m, d)}) dx = ${S(round(I2, 3))}.`, "Additionne."), solution: `${S(round(I1, 3))} + ${P(round(I2, 3))} = ${S(round(I1 + I2, 2))}.` };
  }),
  mk("ci-inegalite", CI, 2, { skill: "Inégalités et intégration : signe d'une intégrale, valeur moyenne", ref: `${BOOK}, chap. 7 §1.2 (p. 146-147)`, kw: ["valeur moyenne", "inégalité de la moyenne", "intégrale positive", "encadrement"] }, (c, r) => {
    const a = int(r, 0, 2), L = int(r, 2, 4);
    // valeur moyenne de x² sur [a ; a+L] = ((a+L)^3 − a^3)/(3L)
    const b = a + L;
    const v = (b ** 3 - a ** 3) / (3 * L);
    return { statement: `Calcule la valeur moyenne de la fonction f(x) = x² sur l'intervalle [${a} ; ${b}] (arrondie au centième).`, answer: num(round(v, 2), 0.02), hints: H("La valeur moyenne de f sur [a ; b] est (1/(b − a)) ∫ₐᵇ f(x) dx.", `∫ de ${a} à ${b} de x² dx = (${b}³ − ${a}³)/3.`, `b − a = ${L}.`, "Divise."), solution: `μ = (${b ** 3} − ${a ** 3})/(3 × ${L}) = ${fr(round(v, 2))}.` };
  }),
  mk("ci-uprime", CI, 3, { skill: "Intégrales de u′uⁿ, u′eᵘ, u′/u", ref: `${BOOK}, chap. 7 §2.1 (p. 149-150) et ex. 2.b (p. 151)`, kw: ["intégrale", "u′uⁿ", "u′/u", "u′eᵘ", "primitive"] }, (c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const a = nz(r, 1, 3), b = int(r, 0, 3), n = int(r, 2, 4); const lo = 0, hi = int(r, 1, 2); const F = (x: number) => (a * x + b) ** (n + 1) / (n + 1); const v = F(hi) - F(lo); return { statement: `Calcule ∫ de 0 à ${hi} de ${a}(${lin(a, b)})^${n} dx (arrondi au centième).`, answer: num(round(v, 2), 0.02), hints: H("u′uⁿ a pour primitive uⁿ⁺¹/(n + 1).", `u(x) = ${lin(a, b)}, u′ = ${a}.`, `F(x) = (${lin(a, b)})^${n + 1}/${n + 1}.`, "F(b) − F(a)."), solution: `${S(round(v, 2))}.` }; }
    if (t === 1) { const a = nz(r, 1, 3); const hi = int(r, 1, 2); const v = Math.log((a * hi + 1) / 1); return { statement: `Calcule ∫ de 0 à ${hi} de ${a}/(${a}x + 1) dx (arrondi au centième).`, answer: num(round(v, 2), 0.02), hints: H("u′/u a pour primitive ln|u|.", `u(x) = ${a}x + 1 > 0.`, `[ln(${a}x + 1)] de 0 à ${hi}.`, `ln(${a * hi + 1}) − ln 1.`), solution: `ln ${a * hi + 1} ≈ ${S(round(v, 2))}.` }; }
    const a = nz(r, 1, 3); const hi = int(r, 1, 2); const v = (Math.exp(a * hi) - 1);
    return { statement: `Calcule ∫ de 0 à ${hi} de ${a}·e^(${a}x) dx (arrondi au centième).`, answer: num(round(v, 2), 0.02), hints: H("u′eᵘ a pour primitive eᵘ.", `u(x) = ${a}x.`, `[e^(${a}x)] de 0 à ${hi}.`, `e^${a * hi} − 1.`), solution: `e^${a * hi} − 1 ≈ ${S(round(v, 2))}.` };
  }),
  mk("ci-parties", CI, 3, { skill: "Intégration par parties : ∫ u v′ = [uv] − ∫ u′ v", ref: `${BOOK}, chap. 7 §2.3 (p. 153)`, kw: ["intégration par parties", "∫ x eˣ", "∫ x ln x", "u v′"] }, (c, r) => {
    const t = int(r, 0, 1);
    if (t === 0) { const a = nz(r, 1, 3), b = int(r, 0, 3), hi = int(r, 1, 2);
      // ∫0^hi (a x + b) e^x dx = [(a x + b − a) e^x]
      const v = (a * hi + b - a) * Math.exp(hi) - (b - a);
      return { statement: `Calcule ∫ de 0 à ${hi} de (${lin(a, b)})eˣ dx par intégration par parties (arrondi au centième).`, answer: num(round(v, 2), 0.02), hints: H("Pose u(x) = ax + b et v′(x) = eˣ.", `u′ = ${a}, v = eˣ.`, `∫ = [(${lin(a, b)})eˣ] − ${a}∫eˣdx.`, "Calcule."), solution: `= ${S(round(v, 2))}.` }; }
    const hi = int(r, 2, 4);
    // ∫1^hi x ln x dx = [x²/2 ln x] − [x²/4]
    const v = (hi * hi / 2) * Math.log(hi) - (hi * hi - 1) / 4;
    return { statement: `Calcule ∫ de 1 à ${hi} de x ln x dx par intégration par parties (arrondi au centième).`, answer: num(round(v, 2), 0.02), hints: H("Pose u = ln x et v′ = x.", "u′ = 1/x et v = x²/2.", `∫ = [x²/2 · ln x] − ∫ x/2 dx.`, "Calcule."), solution: `= ${S(round(v, 2))}.` };
  }),
  mk("ci-parite", CI, 2, { skill: "Intégrale d'une fonction paire, impaire, périodique", ref: `${BOOK}, chap. 7 §2.2 (p. 152)`, kw: ["fonction paire", "fonction impaire", "fonction périodique", "intégrale", "symétrie"] }, (c, r) => {
    const a = int(r, 1, 4);
    const t = int(r, 0, 2);
    if (t === 0) { const k = nz(r, 1, 3); const v = 2 * (k * a ** 3) / 3; return { statement: `Calcule ∫ de −${a} à ${a} de ${k}x² dx (arrondi au centième).`, answer: num(round(v, 2), 0.02), hints: H("f est paire : ∫ de −a à a = 2∫ de 0 à a.", `∫ de 0 à ${a} de ${k}x² dx = ${k}·${a}³/3.`, "Double le résultat.", "Calcule."), solution: `2 × ${fr(round(k * a ** 3 / 3, 3))} = ${S(round(v, 2))}.` }; }
    if (t === 1) { const k = nz(r, 1, 4); return { statement: `Calcule ∫ de −${a} à ${a} de ${k}x³ dx.`, answer: num(0), hints: H("f est impaire : ∫ de −a à a = 0.", "x ↦ x³ est impaire.", "L'intégrale d'une fonction impaire sur [−a ; a] est nulle.", "Conclus."), solution: "0." }; }
    return { statement: `f est périodique de période ${a} et ∫ de 0 à ${a} de f(x) dx = ${a * 3}. Quelle est la valeur de ∫ de 2 à ${2 + a} de f(x) dx ?`, answer: num(a * 3), hints: H("Si f est T-périodique, ∫ de x à x + T est indépendante de x.", `T = ${a}.`, "La translation de l'intervalle ne change pas l'intégrale.", "Conclus."), solution: `L'intégrale vaut ${a * 3}.` };
  }),
  mk("ci-aire", CI, 2, { skill: "Aire d'une partie du plan limitée par une courbe et l'axe (OI)", ref: `${BOOK}, chap. 7 §3.1 (p. 154)`, kw: ["aire", "intégrale", "courbe", "axe des abscisses", "unité d'aire"] }, (c, r) => {
    const a = int(r, 1, 4);
    const k = int(r, 1, 3);
    // f(x) = k x (a − x) positive sur [0 ; a] ; aire = k a³/6
    const v = (k * a ** 3) / 6;
    return { statement: `f(x) = ${k === 1 ? "" : k}x(${a} − x). Calcule l'aire (en unités d'aire) de la partie du plan limitée par la courbe de f et l'axe des abscisses (arrondie au centième).`, answer: num(round(v, 2), 0.02), hints: H("f est positive entre ses deux racines 0 et a.", `Aire = ∫ de 0 à ${a} de f(x) dx.`, `= ${k}[${a}x²/2 − x³/3] de 0 à ${a}.`, "Calcule."), solution: `Aire = ${k}·${a}³/6 = ${fr(round(v, 2))} u.a.` };
  }),
  mk("ci-cours", CI, 1, { skill: "Calcul intégral : définition et propriétés (cours)", ref: `${BOOK}, chap. 7 (p. 141-155)`, kw: ["intégrale", "primitive", "Chasles", "linéarité", "valeur moyenne", "aire"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "∫ de a à b de f(x)dx est défini comme :", good: "F(b) − F(a), pour une primitive F de f", bad: ["F(a) − F(b)", "f(b) − f(a)", "F(b) + F(a)"], why: "Propriété-définition du manuel (§1.1)." },
      { q: "Que vaut ∫ de b à a de f(x)dx en fonction de ∫ de a à b ?", good: "−∫ de a à b de f(x)dx", bad: ["∫ de a à b de f(x)dx", "0", "2∫ de a à b de f(x)dx"], why: "Conséquence immédiate de la définition (§1.1)." },
      { q: "Que dit la relation de Chasles ?", good: "∫ₐᶜ f = ∫ₐᵇ f + ∫ᵦᶜ f", bad: ["∫ₐᶜ f = ∫ₐᵇ f × ∫ᵦᶜ f", "∫ₐᶜ f = ∫ₐᵇ f − ∫ᵦᶜ f", "∫ₐᶜ f = f(c) − f(a)"], why: "Propriété du manuel (§1.2)." },
      { q: "Si f ≥ 0 sur [a ; b] (a < b), alors ∫ₐᵇ f(x)dx est :", good: "positive ou nulle", bad: ["négative", "toujours nulle", "égale à f(b)"], why: "Propriété du manuel (§1.2)." },
      { q: "Si f est continue et positive sur [a ; b], ∫ₐᵇ f(x)dx est :", good: "l'aire de la partie du plan limitée par la courbe, (OI) et les droites x = a, x = b", bad: ["la longueur de la courbe", "le volume sous la courbe", "la pente de la courbe"], why: "Propriété du manuel (§1.1, intégrale et aire)." },
      { q: "La valeur moyenne de f sur [a ; b] est :", good: "(1/(b − a)) ∫ₐᵇ f(x)dx", bad: ["∫ₐᵇ f(x)dx", "(f(a) + f(b))/2", "f(b) − f(a)"], why: "Définition du manuel (§1.2)." },
      { q: "Pour f impaire et continue sur [−a ; a], ∫ de −a à a de f(x)dx vaut :", good: "0", bad: ["2∫ de 0 à a", "f(a)", "a"], why: "Propriété du manuel (§2.2)." },
      { q: "La formule d'intégration par parties est :", good: "∫ₐᵇ u′v = [uv]ₐᵇ − ∫ₐᵇ uv′", bad: ["∫ₐᵇ u′v = [uv]ₐᵇ + ∫ₐᵇ uv′", "∫ₐᵇ u′v = u′v′", "∫ₐᵇ u′v = [u′v′]ₐᵇ"], why: "Propriété du manuel (§2.3)." },
    ];
    return qcmOf(r, pool, "Reviens à la définition via une primitive.");
  }, QCM),

  // ===== Chapitre 8 : suites =====
  mk("su-recurrence", SU, 2, { skill: "Termes d'une suite définie par récurrence uₙ₊₁ = a uₙ + b", ref: `${BOOK}, chap. 8 §1.1 (p. 166)`, kw: ["suite récurrente", "uₙ₊₁ = g(uₙ)", "premier terme", "terme"] }, (c, r) => {
    const a = pick(r, [0.25, 0.5, -0.5, 2, 3]), b = int(r, -4, 6), u0 = int(r, -4, 12);
    const n = int(r, 2, 4);
    let u = u0; for (let i = 0; i < n; i++) u = a * u + b;
    return { statement: `(uₙ) est définie par u₀ = ${S(u0)} et uₙ₊₁ = ${fr(a)}uₙ ${b < 0 ? "−" : "+"} ${Math.abs(b)}. Calcule u${n} (arrondi au centième).`.replace(" + 0.", "."), answer: num(round(u, 2), 0.02), hints: H("Applique la relation de récurrence de proche en proche.", `u₁ = ${fr(a)} × ${P(u0)} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${S(round(a * u0 + b, 3))}.`, "Continue jusqu'au rang demandé.", "Arrondis."), solution: `u${n} ≈ ${S(round(u, 2))}.` };
  }),
  mk("su-point-fixe", SU, 3, { skill: "Limite d'une suite récurrente convergente : point fixe de g", ref: `${BOOK}, chap. 8 §2.3 (p. 176)`, kw: ["point fixe", "limite", "g(x) = x", "suite convergente", "formule de récurrence"] }, (c, r) => {
    const a = pick(r, [0.5, 0.25, 0.2, -0.5, 0.75]), b = int(r, 1, 9);
    const l = b / (1 - a);
    return { statement: `(uₙ) est définie par u₀ = ${int(r, 0, 10)} et uₙ₊₁ = ${fr(a)}uₙ + ${b}. On admet qu'elle converge. Quelle est sa limite ? (arrondie au centième)`, answer: num(round(l, 2), 0.02), hints: H("Si (uₙ) converge vers ℓ, alors ℓ est solution de g(x) = x.", `Ici g(x) = ${fr(a)}x + ${b}.`, `ℓ = ${fr(a)}ℓ + ${b}.`, "Résous en ℓ."), solution: `ℓ = ${b}/(1 − ${P(a)}) = ${S(round(l, 2))}.` };
  }),
  mk("su-comparaison", SU, 2, { skill: "Limite d'une suite par comparaison ou opérations", ref: `${BOOK}, chap. 8 §2.2 (p. 173)`, kw: ["limite d'une suite", "comparaison", "gendarmes", "opérations sur les limites"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "uₙ = n² + sin 2n. Que peut-on dire de lim uₙ ?", good: "lim uₙ = +∞ (car uₙ ≥ n² − 1)", bad: ["lim uₙ = 0", "lim uₙ = 1", "uₙ n'a pas de limite"], why: "Exemple du manuel (§2.2) : −1 ≤ sin 2n ≤ 1 donc n² − 1 ≤ uₙ." },
      { q: "wₙ = (n² + (−1)ⁿ)/n². Quelle est sa limite ?", good: "1", bad: ["0", "+∞", "−1"], why: "Exemple du manuel (§2.2) : (n² − 1)/n² ≤ wₙ ≤ (n² + 1)/n² avec limites 1." },
      { q: "Théorème des gendarmes pour des suites : vₙ ≤ uₙ ≤ wₙ avec lim vₙ = lim wₙ = ℓ. Alors :", good: "lim uₙ = ℓ", bad: ["lim uₙ = 0", "lim uₙ = +∞", "On ne peut rien dire"], why: "Tableau récapitulatif (§2.2)." },
      { q: "Si uₙ ≥ vₙ à partir d'un certain rang et lim vₙ = +∞, alors :", good: "lim uₙ = +∞", bad: ["lim uₙ = 0", "lim uₙ = −∞", "(uₙ) est bornée"], why: "Propriété de comparaison (§2.2)." },
      { q: "Toute suite croissante et majorée est :", good: "convergente", bad: ["divergente", "constante", "décroissante"], why: "Propriété du manuel (§2.2)." },
      { q: "Toute suite croissante et non majorée :", good: "diverge vers +∞", bad: ["converge vers 0", "converge vers 1", "n'a pas de limite"], why: "Propriété du manuel (§2.2)." },
      { q: "Toute suite décroissante et minorée est :", good: "convergente", bad: ["divergente", "croissante", "non bornée"], why: "Propriété du manuel (§2.2)." },
      { q: "Pour montrer qu'une suite est minorée ou majorée définie par récurrence, on utilise :", good: "un raisonnement par récurrence", bad: ["un raisonnement par l'absurde uniquement", "une dérivation", "une intégration"], why: "Méthode des exemples du manuel (§1.1 et §2.2)." },
    ];
    return qcmOf(r, pool, "Rappelle-toi les théorèmes de convergence monotone.");
  }, QCM),
  mk("su-borne", SU, 2, { skill: "Suite minorée, majorée, bornée : trouver un majorant", ref: `${BOOK}, chap. 8 §1.1 (p. 166-169)`, kw: ["minorée", "majorée", "bornée", "suite", "récurrence"] }, (c, r) => {
    const a = pick(r, [0.5, 0.25, 0.75]), b = int(r, 1, 6);
    const M = b / (1 - a);
    const u0 = int(r, 0, Math.floor(M));
    return { statement: `(uₙ) est définie par u₀ = ${u0} et uₙ₊₁ = ${fr(a)}uₙ + ${b}. On démontre par récurrence que uₙ ≤ M pour tout n, avec M = ${fr(round(M, 2))} (point fixe de g). Quelle est la valeur de ${fr(a)} × ${fr(round(M, 2))} + ${b} ?`, answer: num(round(M, 2), 0.02), hints: H("Hérédité : si uₖ ≤ M alors a uₖ + b ≤ a M + b (a > 0).", `a M + b = ${fr(a)} × ${fr(round(M, 2))} + ${b}.`, "M est le point fixe : g(M) = M.", "Calcule."), solution: `${fr(a)} × ${fr(round(M, 2))} + ${b} = ${fr(round(M, 2))} = M, donc uₙ₊₁ ≤ M.` };
  }),
  mk("su-arithgeo", SU, 2, { skill: "Suites arithmétiques et géométriques : terme et somme", ref: `${BOOK}, chap. 8 §3 (p. 177-182)`, kw: ["suite arithmétique", "suite géométrique", "somme", "raison"] }, (c, r) => {
    const geo = int(r, 0, 1) === 0, n = int(r, 4, 9);
    if (!geo) { const u0 = int(r, -4, 10), rr = nz(r, -4, 6); let tot = 0; for (let i = 0; i < n; i++) tot += u0 + i * rr; return { statement: `(uₙ) est arithmétique de premier terme u₀ = ${S(u0)} et de raison ${S(rr)}. Calcule u₀ + u₁ + … + u${n - 1}.`, answer: num(tot), hints: H("S = (nombre de termes) × (moyenne des termes extrêmes).", `u${n - 1} = ${S(u0 + (n - 1) * rr)}.`, `${n} × (${S(u0)} + ${P(u0 + (n - 1) * rr)})/2.`, "Calcule."), solution: `S = ${S(tot)}.` }; }
    const u0 = int(r, 1, 5), q = pick(r, [2, 3, 0.5]); let tot = 0; for (let i = 0; i < n; i++) tot += u0 * q ** i;
    return { statement: `(uₙ) est géométrique de premier terme u₀ = ${u0} et de raison ${fr(q)}. Calcule u₀ + … + u${n - 1} (arrondi au centième).`, answer: num(round(tot, 2), 0.02), hints: H("S = u₀(1 − qⁿ)/(1 − q).", `qⁿ = ${fr(round(q ** n, 4))}.`, `${u0} × (1 − ${fr(round(q ** n, 4))})/(1 − ${fr(q)}).`, "Calcule."), solution: `S ≈ ${fr(round(tot, 2))}.` };
  }),
  mk("su-cours", SU, 1, { skill: "Suites : sens de variation, convergence (cours)", ref: `${BOOK}, chap. 8 (p. 165-184)`, kw: ["suite", "convergence", "monotone", "bornée", "point fixe"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Pour étudier le sens de variation d'une suite à termes positifs, on peut comparer uₙ₊₁/uₙ à :", good: "1", bad: ["0", "uₙ", "n"], why: "Méthode du manuel (§1.1)." },
      { q: "Pour une suite uₙ = f(n), on peut étudier :", good: "le sens de variation de la fonction f", bad: ["la parité de n", "la fonction f′ seulement en 0", "une équation différentielle"], why: "Méthode du manuel (§1.1)." },
      { q: "Une suite est bornée si elle est :", good: "à la fois minorée et majorée", bad: ["croissante", "convergente", "positive"], why: "Définition du manuel (§1.1)." },
      { q: "Si (uₙ) converge vers ℓ avec uₙ₊₁ = g(uₙ) et g continue, alors :", good: "g(ℓ) = ℓ", bad: ["g(ℓ) = 0", "ℓ = 0", "g′(ℓ) = 1"], why: "Propriété du manuel (§2.3) : la limite est un point fixe de g." },
      { q: "Si g(x) = x n'a pas de solution sur K, alors la suite uₙ₊₁ = g(uₙ) :", good: "est divergente", bad: ["converge vers 0", "est croissante", "est constante"], why: "Remarque du manuel (§2.3)." },
      { q: "Une suite convergente vers ℓ vérifie :", good: "|uₙ − ℓ| devient aussi petit qu'on veut à partir d'un certain rang", bad: ["uₙ = ℓ pour tout n", "uₙ est croissante", "uₙ ≥ ℓ"], why: "Approche de la notion de convergence (§2.1)." },
    ];
    return qcmOf(r, pool, "Pense aux théorèmes de convergence.");
  }, QCM),

  // ===== Chapitre 9 : équations différentielles =====
  mk("ed-premier-ordre", ED, 2, { skill: "Équation f′ + a f = 0 : solutions f(x) = k e^(−ax)", ref: `${BOOK}, chap. 9 §1.2 (p. 193) et ex. 1.a (p. 194)`, kw: ["équation différentielle", "f′ + af = 0", "k e^(−ax)", "solutions"] }, (c, r) => {
    const a = pick(r, [-6, -3, -2, -1, 1, 2, 3, 4, 5]);
    return { statement: `Les solutions de l'équation différentielle f′ + ${a < 0 ? `(−${-a})` : a}f = 0 sont les fonctions x ↦ k·e^(cx). Quelle est la valeur de c ?`, answer: num(-a), hints: H("Les solutions de f′ + af = 0 sont f(x) = k·e^(−ax).", `Ici a = ${S(a)}.`, `c = −a.`, "Calcule."), solution: `c = −${P(a)} = ${S(-a)}.` };
  }),
  mk("ed-condition", ED, 3, { skill: "Solution de f′ + af = 0 avec condition initiale f(x₀) = y₀", ref: `${BOOK}, chap. 9 §1.2 (p. 194) et ex. 1.b (p. 194)`, kw: ["condition initiale", "équation différentielle", "constante k", "solution particulière"] }, (c, r) => {
    const a = nz(r, -3, 4), x0 = nz(r, -2, 2), y0 = nz(r, -5, 6);
    // k e^(−a x0) = y0 → k = y0 e^(a x0) ; on demande f(0) = k
    const k = y0 * Math.exp(a * x0);
    return { statement: `f est la solution de f′ ${a < 0 ? "−" : "+"} ${Math.abs(a) === 1 ? "" : Math.abs(a)}f = 0 qui vérifie f(${S(x0)}) = ${S(y0)}. Calcule f(0) (arrondi au centième).`, answer: num(round(k, 2), 0.02), hints: H("f(x) = k e^(−ax).", `f(${S(x0)}) = k e^(${S(-a * x0)}) = ${S(y0)}.`, `k = ${S(y0)} e^(${S(a * x0)}).`, "f(0) = k."), solution: `f(0) = k = ${S(y0)} × e^(${S(a * x0)}) ≈ ${S(round(k, 2))}.` };
  }),
  mk("ed-second-ordre", ED, 3, { skill: "Équation f″ + af′ + bf = 0 : équation caractéristique et racines", ref: `${BOOK}, chap. 9 §1.2 (p. 195-196)`, kw: ["équation caractéristique", "f″ + af′ + bf = 0", "racines", "second ordre"] }, (c, r) => {
    const r1 = int(r, -4, 4), r2 = int(r, -4, 4);
    const a = -(r1 + r2), b = r1 * r2;
    const big = Math.max(r1, r2);
    return { statement: `L'équation différentielle f″ ${a < 0 ? "−" : "+"} ${Math.abs(a) === 1 ? "" : Math.abs(a)}f′ ${b < 0 ? "−" : "+"} ${Math.abs(b)}f = 0 a pour équation caractéristique r² + ar + b = 0 (a = ${S(a)}, b = ${S(b)}). Quelle est sa plus grande racine ?`.replace(" + 0f = 0", " = 0").replace("+ 0f′", "").replace("− 0f′", ""), answer: num(big), hints: H("Équation caractéristique : r² + a r + b = 0.", `Δ = ${S(a * a - 4 * b)}.`, `Racines : ${S(r1)} et ${S(r2)}.`, "Prends la plus grande."), solution: `Racines ${S(r1)} et ${S(r2)} : la plus grande est ${S(big)}.` };
  }),
  mk("ed-cours", ED, 1, { skill: "Équations différentielles : vocabulaire et formes des solutions (cours)", ref: `${BOOK}, chap. 9 §1 (p. 192-196)`, kw: ["équation différentielle", "conditions initiales", "équation caractéristique", "solutions"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Qu'est-ce qu'une équation différentielle ?", good: "Une équation dont l'inconnue est une fonction et où figure au moins une de ses dérivées", bad: ["Une équation avec une différence de deux nombres", "Une équation du second degré", "Une équation sans inconnue"], why: "Définition du manuel (§1.1)." },
      { q: "Les solutions de f′ + af = 0 (a ≠ 0) sont :", good: "f(x) = k e^(−ax), k ∈ ℝ", bad: ["f(x) = k e^(ax) + 1", "f(x) = a x + k", "f(x) = k ln x"], why: "Propriété du manuel (§1.2)." },
      { q: "Les conditions initiales servent à :", good: "déterminer une solution particulière parmi toutes les solutions", bad: ["trouver l'équation différentielle", "calculer la dérivée", "vérifier la continuité"], why: "Vocabulaire du manuel (§1.1 et §1.2)." },
      { q: "L'équation caractéristique de f″ + af′ + bf = 0 est :", good: "r² + ar + b = 0", bad: ["r² − ar − b = 0", "ar² + br = 0", "r + a + b = 0"], why: "Définition du manuel (§1.2)." },
      { q: "Si l'équation caractéristique a deux racines réelles r₁ ≠ r₂, les solutions sont :", good: "x ↦ A e^(r₁x) + B e^(r₂x)", bad: ["x ↦ (Ax + B)e^(rx)", "x ↦ A cos x + B sin x", "x ↦ A + Bx"], why: "Propriété du manuel (§1.2)." },
      { q: "Si l'équation caractéristique a une racine double r, les solutions sont :", good: "x ↦ (Ax + B)e^(rx)", bad: ["x ↦ A e^(rx) + B e^(−rx)", "x ↦ A e^(rx)", "x ↦ Ax + B"], why: "Propriété du manuel (§1.2)." },
    ];
    return qcmOf(r, pool, "Pense à l'équation caractéristique.");
  }, QCM),
];
