// CIAM Terminale SM (série C) : chapitre 14, Intégration. Énoncés originaux, réponses calculées par le code.
// Les démonstrations, constructions et tracés du manuel ne se corrigent pas automatiquement : on en garde les calculs
// (intégrales, aires, volumes, valeur moyenne, techniques, méthode des rectangles) et le cours.
import { fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf, sup } from "./ciam-kit";

const mk = ciam("tle", "ciamtg");
const BOOK = "CIAM Terminale SM";
const CI = "Calcul intégral — série C";
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
    const ab = Math.abs(a), body = e === 0 ? fr(ab) : `${ab === 1 ? "" : fr(ab)}t${e > 1 ? sup(e) : ""}`;
    s += s === "" ? `${a < 0 ? "−" : ""}${body}` : ` ${a < 0 ? "−" : "+"} ${body}`;
  });
  return s || "0";
};
const ev = (c: number[], x: number) => c.reduce((acc, a) => acc * x + a, 0);
/** Primitive nulle en 0 d'un polynôme. */
const prim = (c: number[]) => [...c.map((a, i) => a / (c.length - i)), 0];
const integ = (c: number[], a: number, b: number) => { const P = prim(c); return ev(P, b) - ev(P, a); };

export const TC_INTEG: Template[] = [
  mk("in-polynome", CI, 1, { skill: "Intégrale d'un polynôme : F(b) − F(a) avec F primitive", ref: `${BOOK}, chap. 14 §1.1, définition de l'intégrale et vocabulaire (p. 296-297)`, kw: ["intégrale", "F(b) − F(a)", "primitive", "[F(t)]ₐᵇ", "bornes"] }, (_c, r) => {
    const c = [nz(r, -3, 3), int(r, -4, 4), int(r, -4, 4)], a = int(r, -2, 1), b = a + int(r, 1, 3), v = integ(c, a, b);
    return { statement: `Calcule ∫ de ${n2(a)} à ${n2(b)} de (${pol(c)}) dt (arrondi au centième).`, answer: num(r2(v), 0.01), hints: H("Cherche une primitive F de la fonction.", `F(t) = ${pol(prim(c).slice(0, -1).concat([0])).replace(/ \+ 0$/, "")}.`, "Calcule F(b) − F(a).", "Réduis."), solution: `∫ = F(${n2(b)}) − F(${n2(a)}) ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("in-inversion-bornes", CI, 1, { skill: "Intégrale entre a et a, bornes inversées : ∫ₐᵃ = 0 et ∫ᵇₐ = −∫ₐᵇ", ref: `${BOOK}, chap. 14 §1.1, propriétés 1 (p. 297)`, kw: ["bornes inversées", "∫ₐᵃ f = 0", "∫ᵇₐ f = −∫ₐᵇ f", "intégrale"] }, (_c, r) => {
    const A = nz(r, -9, 9);
    return { statement: `On sait que ∫ de 1 à 4 de f(t) dt = ${n2(A)}. Quelle est la valeur de ∫ de 4 à 1 de f(t) dt ?`, answer: num(-A), hints: H("∫ᵇₐ f = −∫ₐᵇ f.", "On échange les bornes.", "Change le signe.", "Conclus."), solution: `∫ de 4 à 1 = −${par(A)} = ${n2(-A)}.` };
  }, FR),
  mk("in-chasles", CI, 2, { skill: "Relation de Chasles : ∫ₐᶜ = ∫ₐᵇ + ∫ᵇᶜ", ref: `${BOOK}, chap. 14 §1.2, relation de Chasles (p. 298-299)`, kw: ["relation de Chasles", "∫ₐᵇ + ∫ᵇᶜ = ∫ₐᶜ", "intégrale", "bornes"] }, (_c, r) => {
    const A = nz(r, -9, 9), B = nz(r, -9, 9), want = int(r, 0, 1) === 0;
    return want
      ? { statement: `On sait que ∫ de 0 à 2 de f = ${n2(A)} et ∫ de 2 à 5 de f = ${n2(B)}. Quelle est la valeur de ∫ de 0 à 5 de f ?`, answer: num(A + B), hints: H("Chasles : ∫ₐᶜ = ∫ₐᵇ + ∫ᵇᶜ.", "Ici a = 0, b = 2, c = 5.", "Additionne.", "Calcule."), solution: `∫ de 0 à 5 = ${n2(A)} + ${par(B)} = ${n2(A + B)}.` }
      : { statement: `On sait que ∫ de 0 à 5 de f = ${n2(A + B)} et ∫ de 0 à 2 de f = ${n2(A)}. Quelle est la valeur de ∫ de 2 à 5 de f ?`, answer: num(B), hints: H("Chasles : ∫₀⁵ = ∫₀² + ∫₂⁵.", "Isole ∫₂⁵.", "Soustrais.", "Calcule."), solution: `∫ de 2 à 5 = ${n2(A + B)} − ${par(A)} = ${n2(B)}.` };
  }, FR),
  mk("in-linearite", CI, 2, { skill: "Linéarité : ∫(αf + βg) = α∫f + β∫g", ref: `${BOOK}, chap. 14 §1.2, linéarité de l'intégrale (p. 299)`, kw: ["linéarité", "∫(αf + βg)", "somme d'intégrales", "intégrale"] }, (_c, r) => {
    const A = nz(r, -6, 6), B = nz(r, -6, 6), al = nz(r, -4, 4), be = nz(r, -4, 4);
    return { statement: `On sait que ∫ de 0 à 3 de f = ${n2(A)} et ∫ de 0 à 3 de g = ${n2(B)}. Calcule ∫ de 0 à 3 de (${al === 1 ? "" : al === -1 ? "−" : al}f ${be < 0 ? "−" : "+"} ${Math.abs(be) === 1 ? "" : Math.abs(be)}g).`, answer: num(al * A + be * B), hints: H("L'intégrale est linéaire.", `∫(${al}f + ${par(be)}g) = ${al}∫f + ${par(be)}∫g.`, `${al} × ${par(A)} + ${par(be)} × ${par(B)}.`, "Calcule."), solution: `${al}×${par(A)} + ${par(be)}×${par(B)} = ${n2(al * A + be * B)}.` };
  }, FR),
  mk("in-aire-unites", CI, 2, { skill: "Aire sous une courbe positive en unités d'aire puis en cm²", ref: `${BOOK}, chap. 14 §1.1, interprétation graphique de l'intégrale (p. 297-298)`, kw: ["aire", "unité d'aire", "interprétation graphique", "cm²", "fonction positive"] }, (_c, r) => {
    const k = int(r, 1, 4), u = pick(r, [1, 2, 3, 4]), v = integ([1, 0, 0], 0, k) * u * u;
    return { statement: `La fonction f(t) = t² est positive. L'unité graphique est ${u} cm sur chaque axe. Quelle est, en cm², l'aire du domaine délimité par la courbe de f, l'axe des abscisses et les droites x = 0 et x = ${k} (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H("L'aire en unités d'aire est ∫₀ᵏ t² dt.", `∫₀^${k} t² dt = ${k}³/3.`, `Une unité d'aire vaut ${u} × ${u} = ${u * u} cm².`, "Multiplie."), solution: `${k ** 3}/3 × ${u * u} ≈ ${n2(r2(v))} cm².` };
  }, FR),
  mk("in-aire-entre-courbes", CI, 3, { skill: "Aire entre deux courbes : ∫ₐᵇ [g(t) − f(t)] dt avec f ≤ g", ref: `${BOOK}, chap. 14 §3.1, calculs d'aires (p. 309)`, kw: ["aire entre deux courbes", "∫(g − f)", "domaine délimité", "unité d'aire", "f ≤ g"] }, (_c, r) => {
    const m = int(r, 1, 5), type = int(r, 0, 1);
    if (type === 0) return { statement: `Calcule l'aire, en unités d'aire, du domaine délimité par la parabole y = x² et la droite y = ${m}x (arrondie au centième).`, answer: num(r2(m ** 3 / 6), 0.01), hints: H("Cherche les abscisses d'intersection : x² = " + m + "x.", `Elles valent 0 et ${m}, et ${m}x ≥ x² sur [0 ; ${m}].`, `Aire = ∫₀^${m} (${m}t − t²) dt.`, "Calcule."), solution: `Aire = [${m}t²/2 − t³/3]₀^${m} = ${m ** 3}/6 ≈ ${n2(r2(m ** 3 / 6))}.` };
    return { statement: `Calcule l'aire, en unités d'aire, du domaine délimité par la parabole y = x² et la droite y = ${m * m} (arrondie au centième).`, answer: num(r2((4 * m ** 3) / 3), 0.01), hints: H(`x² = ${m * m} donne x = ±${m}.`, `Sur [−${m} ; ${m}], ${m * m} ≥ x².`, `Aire = ∫ de −${m} à ${m} de (${m * m} − t²) dt.`, "Utilise la parité."), solution: `Aire = 2 × [${m * m}t − t³/3]₀^${m} = ${4 * m ** 3}/3 ≈ ${n2(r2((4 * m ** 3) / 3))}.` };
  }, FR),
  mk("in-inegalite-moyenne", CI, 2, { skill: "Inégalité de la moyenne : m(b − a) ≤ ∫ₐᵇ f ≤ M(b − a)", ref: `${BOOK}, chap. 14 §1.3, inégalité de la moyenne (p. 300-301) et ex. 1.c (p. 301)`, kw: ["inégalité de la moyenne", "m(b − a) ≤ ∫ ≤ M(b − a)", "encadrement", "minorant", "majorant"] }, (_c, r) => {
    const a = int(r, 1, 4), b = a + int(r, 1, 3), wantMin = int(r, 0, 1) === 0, v = wantMin ? (b - a) / b ** 2 : (b - a) / a ** 2;
    return { statement: `La fonction f(t) = 1/t² est décroissante sur [${a} ; ${b}]. L'inégalité de la moyenne donne un encadrement de ∫ de ${a} à ${b} de dt/t². Quel est le ${wantMin ? "minorant" : "majorant"} obtenu (arrondi au centième) ?`, answer: num(r2(v), 0.01), hints: H("Pour t dans [a ; b], f(b) ≤ f(t) ≤ f(a).", `f(${b}) = 1/${b * b} et f(${a}) = 1/${a * a}.`, `On multiplie par b − a = ${b - a}.`, wantMin ? "Prends f(b)(b − a)." : "Prends f(a)(b − a)."), solution: `${wantMin ? `${b - a}/${b * b}` : `${b - a}/${a * a}`} ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("in-valeur-moyenne", CI, 2, { skill: "Valeur moyenne d'une fonction sur [a ; b] : μ = (1/(b − a)) ∫ₐᵇ f", ref: `${BOOK}, chap. 14 §1.3, valeur moyenne d'une fonction (p. 300)`, kw: ["valeur moyenne", "μ = 1/(b − a) ∫ f", "intégrale", "moyenne d'une fonction"] }, (_c, r) => {
    const c = [nz(r, -3, 3), int(r, -4, 4), int(r, -4, 4)], a = int(r, -2, 1), b = a + int(r, 1, 3), mu = integ(c, a, b) / (b - a);
    return { statement: `Quelle est la valeur moyenne de f(t) = ${pol(c)} sur [${n2(a)} ; ${n2(b)}] (arrondie au centième) ?`, answer: num(r2(mu), 0.01), hints: H("μ = 1/(b − a) × ∫ₐᵇ f(t) dt.", `b − a = ${b - a}.`, "Calcule l'intégrale avec une primitive.", "Divise."), solution: `μ = (1/${b - a}) × ${n2(r2(integ(c, a, b)))} ≈ ${n2(r2(mu))}.` };
  }, FR),
  mk("in-primitives-usuelles", CI, 2, { skill: "Intégrales du type ∫u′/u, ∫u′eᵘ, ∫u′uᵅ avec le tableau des primitives usuelles", ref: `${BOOK}, chap. 14 §2.1, utilisation des primitives usuelles (p. 302)`, kw: ["∫ u′/u", "ln|u|", "∫ u′eᵘ", "∫ u′uᵅ", "tableau des primitives"] }, (_c, r) => {
    const t = int(r, 0, 2), k = int(r, 1, 4);
    if (t === 0) return { statement: `Calcule ∫ de 0 à ${k} de 2t/(t² + 1) dt (arrondi au centième).`, answer: num(r2(Math.log(k * k + 1)), 0.01), hints: H("La fonction est de la forme u′/u avec u = t² + 1.", "Une primitive est ln(t² + 1).", `ln(${k * k + 1}) − ln 1.`, "Calcule."), solution: `[ln(t² + 1)]₀^${k} = ln ${k * k + 1} ≈ ${n2(r2(Math.log(k * k + 1)))}.` };
    if (t === 1) return { statement: `Calcule ∫ de 0 à ${k} de 2t·e^(t²) dt (arrondi au centième).`, answer: num(r2(Math.exp(k * k) - 1), 0.01), hints: H("La fonction est de la forme u′eᵘ avec u = t².", "Une primitive est e^(t²).", `e^${k * k} − e⁰.`, "Calcule."), solution: `[e^(t²)]₀^${k} = e^${k * k} − 1 ≈ ${n2(r2(Math.exp(k * k) - 1))}.` };
    const n = int(r, 2, 4);
    return { statement: `Calcule ∫ de 0 à ${k} de 2t(t² + 1)${sup(n)} dt (arrondi au centième).`, answer: num(r2(((k * k + 1) ** (n + 1) - 1) / (n + 1)), 0.01), hints: H("La fonction est de la forme u′uⁿ avec u = t² + 1.", `Une primitive est u${sup(n + 1)}/${n + 1}.`, `(${k * k + 1}${sup(n + 1)} − 1)/${n + 1}.`, "Calcule."), solution: `[(t² + 1)${sup(n + 1)}/${n + 1}]₀^${k} = ${(k * k + 1) ** (n + 1) - 1}/${n + 1} ≈ ${n2(r2(((k * k + 1) ** (n + 1) - 1) / (n + 1)))}.` };
  }, FR),
  mk("in-parties", CI, 3, { skill: "Intégration par parties : ∫uv′ = [uv] − ∫u′v (ln t, t eᵗ, t cos t)", ref: `${BOOK}, chap. 14 §2.1, intégration par parties (p. 302-303) et ex. 2.b (p. 308)`, kw: ["intégration par parties", "∫ uv′ = [uv] − ∫ u′v", "choix de u et v′", "t ln t", "t eᵗ"] }, (_c, r) => {
    const t = int(r, 0, 2), k = int(r, 1, 4);
    if (t === 0) return { statement: `Calcule ∫ de 1 à ${k + 1} de ln t dt (arrondi au centième). On pourra poser u = ln t et v′ = 1.`, answer: num(r2((k + 1) * Math.log(k + 1) - k), 0.01), hints: H("u = ln t, v′ = 1, donc u′ = 1/t, v = t.", "∫ ln t = [t ln t] − ∫ dt.", `[t ln t − t]₁^${k + 1}.`, "Calcule."), solution: `= ${k + 1} ln ${k + 1} − ${k + 1} + 1 ≈ ${n2(r2((k + 1) * Math.log(k + 1) - k))}.` };
    if (t === 1) return { statement: `Calcule ∫ de 0 à ${k} de t·eᵗ dt (arrondi au centième). On pourra poser u = t et v′ = eᵗ.`, answer: num(r2((k - 1) * Math.exp(k) + 1), 0.01), hints: H("u = t, v′ = eᵗ, donc u′ = 1, v = eᵗ.", "∫ t eᵗ = [t eᵗ] − ∫ eᵗ.", `[(t − 1)eᵗ]₀^${k}.`, "Calcule."), solution: `= ${k - 1}e^${k} + 1 ≈ ${n2(r2((k - 1) * Math.exp(k) + 1))}.` };
    return { statement: "Calcule ∫ de 0 à π/2 de t cos t dt (arrondi au centième). On pourra poser u = t et v′ = cos t.", answer: num(r2(Math.PI / 2 - 1), 0.01), hints: H("u = t, v′ = cos t, donc u′ = 1, v = sin t.", "∫ t cos t = [t sin t] − ∫ sin t.", "[t sin t + cos t]₀^(π/2).", "Calcule."), solution: "= π/2 − 1 ≈ 0,57." };
  }, FR),
  mk("in-changement-affine", CI, 3, { skill: "Changement de variable affine : ∫ₐᵇ f(αt + β) dt = (1/α) ∫ f(u) du", ref: `${BOOK}, chap. 14 §2.1, changement de variable affine (p. 303)`, kw: ["changement de variable affine", "u = αt + β", "du = α dt", "∫ f(αt + β)", "nouvelles bornes"] }, (_c, r) => {
    const al = nz(r, -3, 3), be = int(r, -2, 3), a = int(r, 0, 2), b = a + int(r, 1, 2), n = int(r, 2, 3), lo = al * a + be, hi = al * b + be, v = (hi ** (n + 1) - lo ** (n + 1)) / ((n + 1) * al);
    return { statement: `Calcule ∫ de ${a} à ${b} de (${al === 1 ? "" : al === -1 ? "−" : al}t ${be < 0 ? "−" : "+"} ${Math.abs(be)})${sup(n)} dt (arrondi au centième).`.replace(" + 0)", ")"), answer: num(r2(v), 0.01), hints: H(`Pose u = ${al}t ${be < 0 ? "−" : "+"} ${Math.abs(be)} : du = ${al} dt.`, `Les nouvelles bornes sont ${lo} et ${hi}.`, `∫ = (1/${al}) ∫ de ${lo} à ${hi} de u${sup(n)} du.`, "Calcule."), solution: `= (1/${par(al)}) × (${par(hi)}${sup(n + 1)} − ${par(lo)}${sup(n + 1)})/${n + 1} ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("in-parite", CI, 2, { skill: "Intégrale sur [−a ; a] : fonction paire (2∫₀ᵃ) ou impaire (0)", ref: `${BOOK}, chap. 14 §2.1, intégration de fonctions paires, impaires, périodiques (p. 303-306)`, kw: ["fonction paire", "fonction impaire", "intervalle symétrique", "∫₋ₐᵃ", "2∫₀ᵃ"] }, (_c, r) => {
    const a = int(r, 1, 4), p = nz(r, -4, 4), q = nz(r, -4, 4), odd = int(r, 0, 1) === 0;
    return odd
      ? { statement: `Calcule ∫ de −${a} à ${a} de (${p}t³ ${q < 0 ? "−" : "+"} ${Math.abs(q)}t) dt.`, answer: num(0), hints: H("Étudie la parité de la fonction.", "t ↦ pt³ + qt est impaire.", "Sur [−a ; a], l'intégrale d'une fonction impaire est nulle.", "Conclus."), solution: "La fonction est impaire : l'intégrale vaut 0." }
      : { statement: `Calcule ∫ de −${a} à ${a} de (${p}t² ${q < 0 ? "−" : "+"} ${Math.abs(q)}) dt (arrondi au centième).`, answer: num(r2(2 * integ([p, 0, q], 0, a)), 0.01), hints: H("La fonction est paire.", "∫₋ₐᵃ f = 2∫₀ᵃ f.", `Primitive : ${p}t³/3 ${q < 0 ? "−" : "+"} ${Math.abs(q)}t.`, "Calcule."), solution: `= 2 × (${p}×${a ** 3}/3 ${q < 0 ? "−" : "+"} ${Math.abs(q)}×${a}) ≈ ${n2(r2(2 * integ([p, 0, q], 0, a)))}.` };
  }, FR),
  mk("in-periodique", CI, 3, { skill: "Intégrale d'une fonction périodique sur une période : indépendante de la position", ref: `${BOOK}, chap. 14 §2.1, intégration de fonctions périodiques (p. 304-306)`, kw: ["fonction périodique", "période", "∫ₐ^(a+T)", "cos 2t", "translation"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Si f est continue et T-périodique, ∫ de a à a + T de f(t) dt est…", good: "indépendante de a", bad: ["nulle", "égale à f(a)", "égale à T"], why: "Propriété 2 de la page 304." },
      { q: "La valeur de ∫ de π/2 à 3π/2 de cos 2t dt est…", good: "0", bad: ["1", "π", "−1"], why: "La période de cos 2t est π, et ∫₀^π cos 2t dt = 0." },
      { q: "La période de t ↦ cos 2t est…", good: "π", bad: ["2π", "π/2", "4π"], why: "cos(2(t + π)) = cos 2t." },
      { q: "Pour f continue 2π-périodique, ∫ de 0 à 2π de f(t) dt et ∫ de −π à π de f(t) dt sont…", good: "égales", bad: ["opposées", "différentes", "nulles"], why: "Intégrale sur une période." },
    ];
    return qcmOf(r, T, "Utilise la translation du domaine d'une période.");
  }, QCM),
  mk("in-linearisation", CI, 3, { skill: "Intégrale de cos²t ou sin²t par linéarisation : cos²t = (1 + cos 2t)/2", ref: `${BOOK}, chap. 14 §1.2, exemple de ∫ cos²t dt (p. 299) et §2.2, polynômes trigonométriques (p. 305)`, kw: ["linéarisation", "cos²t = (1 + cos 2t)/2", "sin²t", "polynôme trigonométrique", "intégrale"] }, (_c, r) => {
    const cos = int(r, 0, 1) === 0, k = int(r, 1, 4), b = (k * Math.PI) / 2, v = b / 2 + (cos ? 1 : -1) * Math.sin(2 * b) / 4;
    return { statement: `Calcule ∫ de 0 à ${k === 1 ? "π/2" : k === 2 ? "π" : k === 3 ? "3π/2" : "2π"} de ${cos ? "cos²t" : "sin²t"} dt (arrondi au centième).`, answer: num(r2(v), 0.01), hints: H(cos ? "cos²t = (1 + cos 2t)/2." : "sin²t = (1 − cos 2t)/2.", `Une primitive de ${cos ? "cos²t" : "sin²t"} est t/2 ${cos ? "+" : "−"} sin(2t)/4.`, "Calcule en la borne supérieure, puis en 0.", "Réduis."), solution: `= ${fr(r2(b / 2))} ${cos ? "+" : "−"} sin(${k}π)/4 ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("in-rectangles", CI, 3, { skill: "Méthode des rectangles : sₙ = ((b − a)/n) Σ f(xᵢ) et majoration de l'erreur M(b − a)²/(2n)", ref: `${BOOK}, chap. 14 §2.3, calcul approché d'une intégrale, méthode des rectangles (p. 307-308)`, kw: ["méthode des rectangles", "valeur approchée", "|A − sₙ| ≤ M(b − a)²/(2n)", "subdivision", "erreur"] }, (_c, r) => {
    if (int(r, 0, 1) === 0) {
      const n = int(r, 3, 6), a = int(r, 0, 1), b = a + int(r, 1, 2), h = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) s += (a + i * h) ** 2;
      return { statement: `On approche ∫ de ${a} à ${b} de t² dt par sₙ = ((b − a)/n) Σ f(xᵢ), i de 0 à n − 1, avec n = ${n}. Quelle est la valeur de s${n} (arrondie au centième) ?`, answer: num(r2(h * s), 0.01), hints: H(`Pas h = (b − a)/n = ${fr(r2(h))}.`, "xᵢ = a + ih.", "Additionne f(xᵢ) pour i de 0 à n − 1.", "Multiplie par h."), solution: `s${n} ≈ ${n2(r2(h * s))}.` };
    }
    const M = int(r, 1, 4), L = int(r, 1, 3), e = int(r, 2, 4);
    let n = 1; while ((M * L * L) / (2 * n) > 10 ** -e) n++;
    return { statement: `|f′| est majorée par M = ${M} sur [a ; b] avec b − a = ${L}. Quel est le plus petit entier n tel que M(b − a)²/(2n) ≤ 10⁻${"⁰¹²³⁴⁵⁶⁷⁸⁹"[e]} ?`, answer: num(n), hints: H("L'erreur est majorée par M(b − a)²/(2n).", `Ici M(b − a)² = ${M * L * L}.`, `Il faut ${M * L * L}/(2n) ≤ 10^−${e}.`, `n ≥ ${M * L * L}/(2×10^−${e}).`), solution: `n ≥ ${(M * L * L) / (2 * 10 ** -e)} : n = ${n}.` };
  }, FR),
  mk("in-volume", CI, 3, { skill: "Volume d'un solide : V = ∫ₐᵇ S(z) dz (cône, boule)", ref: `${BOOK}, chap. 14 §3.1, calculs de volumes (p. 310)`, kw: ["calcul de volume", "V = ∫ S(z) dz", "section", "cône", "boule", "(4/3)πR³"] }, (_c, r) => {
    if (int(r, 0, 1) === 0) {
      const B = int(r, 3, 12), h = int(r, 2, 8);
      return { statement: `Un cône a une base d'aire ${B} (unités d'aire) et une hauteur ${h}. La section par un plan à la cote z a pour aire S(z) = ${B}·z²/${h * h}. Quel est son volume V = ∫₀^${h} S(z) dz (arrondi au centième) ?`, answer: num(r2((B * h) / 3), 0.01), hints: H("V = ∫₀ʰ S(z) dz.", `Une primitive de ${B}z²/${h * h} est ${B}z³/${3 * h * h}.`, `V = ${B}×${h ** 3}/${3 * h * h}.`, "Simplifie."), solution: `V = ${B}h/3 = ${B * h}/3 ≈ ${n2(r2((B * h) / 3))}.` };
    }
    const R = int(r, 1, 5);
    return { statement: `La section d'une boule de rayon ${R} par le plan de cote z (−${R} ≤ z ≤ ${R}) est un disque d'aire S(z) = π(${R * R} − z²). Quel est le volume de la boule, V = ∫ de −${R} à ${R} de S(z) dz, divisé par π (arrondi au centième) ?`, answer: num(r2((4 * R ** 3) / 3), 0.01), hints: H("V = ∫₋ᴿᴿ π(R² − z²) dz.", "Utilise la parité : 2∫₀ᴿ.", `Primitive : ${R * R}z − z³/3.`, "Calcule."), solution: `V/π = 2(${R ** 3} − ${R ** 3}/3) = ${4 * R ** 3}/3 ≈ ${n2(r2((4 * R ** 3) / 3))}.` };
  }, FR),
  mk("in-cinematique", CI, 2, { skill: "Distance parcourue : d = ∫ v(t) dt (chute libre d = ½gt²)", ref: `${BOOK}, chap. 14 §1.1, interprétation cinématique de l'intégrale (p. 298)`, kw: ["interprétation cinématique", "vitesse", "distance parcourue", "∫ v(t) dt", "chute"] }, (_c, r) => {
    const a = int(r, 2, 15), g = 9.8, d = (g * a * a) / 2;
    return { statement: `Un corps est lâché sans vitesse initiale et sa vitesse est v(t) = 9,8t (en m/s). Quelle distance parcourt-il en ${a} secondes (arrondie au centième) ?`, answer: num(r2(d), 0.01), hints: H("d = ∫ de 0 à a de v(t) dt.", "Une primitive de 9,8t est 4,9t².", `d = 4,9 × ${a}².`, "Calcule."), solution: `d = [4,9t²]₀^${a} = ${n2(r2(d))} m.` };
  }, FR),
  mk("in-derivee-integrale", CI, 3, { skill: "Fonction définie par une intégrale : G(x) = ∫ de x à 2x de f(t) dt, G′(x) = 2f(2x) − f(x)", ref: `${BOOK}, chap. 14 §3.2, fonctions x ↦ ∫ₐ^x f et x ↦ ∫_{α(x)}^{β(x)} f (p. 311)`, kw: ["fonction définie par une intégrale", "G′(x)", "primitive", "bornes variables", "2f(2x) − f(x)"] }, (_c, r) => {
    const x0 = int(r, 0, 6), v = 2 / (1 + 4 * x0 * x0) - 1 / (1 + x0 * x0);
    return { statement: `Soit G(x) = ∫ de x à 2x de dt/(1 + t²). Quelle est la valeur de G′(${x0}) (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H("Si F est une primitive de f, G(x) = F(2x) − F(x).", "G′(x) = 2f(2x) − f(x).", `f(t) = 1/(1 + t²) : G′(x) = 2/(1 + 4x²) − 1/(1 + x²).`, `Remplace x par ${x0}.`), solution: `G′(${x0}) = 2/${1 + 4 * x0 * x0} − 1/${1 + x0 * x0} ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("in-ln-integrale", CI, 2, { skill: "ln x = ∫ de 1 à x de dt/t : définition du logarithme comme intégrale", ref: `${BOOK}, chap. 14 §1.1, propriété 2, exemple du logarithme népérien (p. 297)`, kw: ["∫ 1/t dt", "ln x", "primitive qui s'annule en 1", "intégrale"] }, (_c, r) => {
    const a = int(r, 2, 9);
    return { statement: `Calcule ∫ de 1 à ${a} de dt/t (arrondi au centième).`, answer: num(r2(Math.log(a)), 0.01), hints: H("Une primitive de 1/t est ln t sur ]0 ; +∞[.", `∫ = ln ${a} − ln 1.`, "ln 1 = 0.", "Calcule."), solution: `∫ = ln ${a} ≈ ${n2(r2(Math.log(a)))}.` };
  }, FR),
  mk("in-cours", CI, 1, { skill: "Cours : intégrale, relation de Chasles, linéarité, comparaison, techniques", ref: `${BOOK}, chap. 14 « Intégration », cours (p. 295-311)`, kw: ["intégrale", "relation de Chasles", "linéarité", "intégration par parties", "valeur moyenne"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Pour f continue sur K et F une primitive de f, ∫ de a à b de f(t) dt vaut…", good: "F(b) − F(a)", bad: ["F(a) − F(b)", "F(b) + F(a)", "f(b) − f(a)"], why: "Définition." },
      { q: "Si f est continue et positive sur [a ; b], ∫ₐᵇ f(t) dt est…", good: "l'aire (en unités d'aire) du domaine sous la courbe", bad: ["la longueur de la courbe", "la pente moyenne", "toujours égale à f(b) − f(a)"], why: "Interprétation graphique." },
      { q: "Si f ≤ g sur [a ; b] (a ≤ b), alors…", good: "∫ₐᵇ f ≤ ∫ₐᵇ g", bad: ["∫ₐᵇ f ≥ ∫ₐᵇ g", "∫ₐᵇ f = ∫ₐᵇ g", "f′ ≤ g′"], why: "Propriété 2 de la page 299." },
      { q: "L'intégration par parties s'écrit…", good: "∫ₐᵇ u v′ = [uv]ₐᵇ − ∫ₐᵇ u′ v", bad: ["∫ₐᵇ u v′ = [uv]ₐᵇ + ∫ₐᵇ u′ v", "∫ₐᵇ u v′ = ∫ₐᵇ u′ × ∫ₐᵇ v", "∫ₐᵇ u v′ = [u′v]ₐᵇ"], why: "Propriété de la page 302." },
      { q: "Si f est impaire et continue sur [−a ; a], alors ∫₋ₐᵃ f vaut…", good: "0", bad: ["2∫₀ᵃ f", "f(a)", "a"], why: "Propriétés 1 de la page 303." },
      { q: "La valeur moyenne de f sur [a ; b] est…", good: "(1/(b − a)) ∫ₐᵇ f(t) dt", bad: ["∫ₐᵇ f(t) dt", "(f(a) + f(b))/2", "(b − a) ∫ₐᵇ f(t) dt"], why: "Définition de la page 300." },
      { q: "Le volume d'un solide limité par z = a et z = b est…", good: "∫ₐᵇ S(z) dz", bad: ["S(b) − S(a)", "(b − a)S(a)", "∫ₐᵇ S′(z) dz"], why: "Propriété de la page 310." },
    ];
    return qcmOf(r, T, "Reprends la définition de l'intégrale.");
  }, QCM),
];
