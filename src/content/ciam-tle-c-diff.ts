// CIAM Terminale SM (série C) : chapitre 15, Équations différentielles. Énoncés originaux, réponses calculées par le code.
// Les démonstrations et les montages physiques du manuel ne se corrigent pas automatiquement : on en garde les résolutions
// (y′ = f, y″ = g, y′ − ay = 0, y″ + ω²y = 0, y″ + ay′ + by = 0, conditions initiales, second membre) et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtf");
const BOOK = "CIAM Terminale SM";
const ED = "Équations différentielles — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };

/** y″ + ay′ + by = 0 (ou y′ + ay = 0) proprement écrit. */
const eq2 = (a: number, b: number) => `y″${a === 0 ? "" : ` ${a < 0 ? "−" : "+"} ${Math.abs(a) === 1 ? "" : Math.abs(a)}y′`}${b === 0 ? "" : ` ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y`} = 0`;
const eq1 = (a: number) => `y′ ${a < 0 ? "+" : "−"} ${Math.abs(a) === 1 ? "" : Math.abs(a)}y = 0`;

export const TC_DIFF: Template[] = [
  mk("ed-primitive-condition", ED, 2, { skill: "y′ = f(x) avec condition initiale : primitive puis constante", ref: `${BOOK}, chap. 15 §1.2, équations du type y′ = f(x) (p. 322-323) et ex. 1.a, 1.b (p. 323)`, kw: ["y′ = f(x)", "primitive", "condition initiale", "solution sur un intervalle", "constante c"] }, (_c, r) => {
    const a = nz(r, -4, 4), x0 = int(r, -2, 2), y0 = int(r, -6, 6), x1 = int(r, -3, 3), c = y0 - a * x0 ** 3;
    return { statement: `Soit (E) : y′ = ${n2(3 * a)}x². Sa solution sur ℝ vérifiant y(${n2(x0)}) = ${n2(y0)} prend quelle valeur en ${n2(x1)} ?`, answer: num(a * x1 ** 3 + c), hints: H("Les solutions sont x ↦ a x³ + c.", `Ici a = ${n2(a)} car 3a = ${n2(3 * a)}.`, `y(${n2(x0)}) = ${n2(a * x0 ** 3)} + c = ${n2(y0)}, donc c = ${n2(c)}.`, `Calcule y(${n2(x1)}).`), solution: `y(x) = ${n2(a)}x³ + ${par(c)} ; y(${n2(x1)}) = ${n2(a * x1 ** 3 + c)}.` };
  }, FR),
  mk("ed-seconde-derivee", ED, 3, { skill: "y″ = g(x) avec deux conditions initiales : intégrer deux fois", ref: `${BOOK}, chap. 15 §1.2, équations du type y″ = g(x) (p. 323) et ex. 1.c, 1.d (p. 323)`, kw: ["y″ = g(x)", "deux conditions initiales", "primitive", "c₁", "c₂"] }, (_c, r) => {
    const k = int(r, 1, 3), y0 = int(r, -5, 5), yp0 = int(r, -5, 5), x1 = int(r, 1, 3), v = (1 / (k * k)) * Math.exp(-k * x1) + (yp0 + 1 / k) * x1 + (y0 - 1 / (k * k));
    return { statement: `Soit (E) : y″ = e^(−${k === 1 ? "" : k}x). Sa solution sur ℝ vérifiant y(0) = ${n2(y0)} et y′(0) = ${n2(yp0)} prend quelle valeur en ${x1} (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H(`y′ = −(1/${k})e^(−${k === 1 ? "" : k}x) + c₁.`, `y = (1/${k * k})e^(−${k === 1 ? "" : k}x) + c₁x + c₂.`, `y′(0) = ${n2(yp0)} donne c₁ = ${fr(r2(yp0 + 1 / k))} ; y(0) = ${n2(y0)} donne c₂ = ${fr(r2(y0 - 1 / (k * k)))}.`, `Calcule y(${x1}).`), solution: `y(${x1}) ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("ed-ordre1-solution", ED, 1, { skill: "Solutions de y′ − ay = 0 : y = k e^(ax)", ref: `${BOOK}, chap. 15 §2.1, solution générale (p. 324) et ex. 2.a (p. 331)`, kw: ["y′ − ay = 0", "k e^(ax)", "solution générale", "équation linéaire du premier ordre"] }, (_c, r) => {
    const a = nz(r, -5, 5), x1 = int(r, -1, 2), k = nz(r, -3, 3);
    return { statement: `Les solutions sur ℝ de ${eq1(a)} sont les fonctions x ↦ k e^(ax). Quelle est la valeur de a ?`, answer: num(a), hints: H("y′ − ay = 0 se réécrit y′ = ay.", `Ici y′ ${a < 0 ? "+" : "−"} ${Math.abs(a)}y = 0, donc y′ = ${n2(a)}y.`, "Les solutions sont k e^(ax).", "Lis a."), solution: `y′ = ${n2(a)}y : a = ${n2(a)}.` };
  }, FR),
  mk("ed-ordre1-condition", ED, 2, { skill: "y′ − ay = 0 avec y(x₀) = y₀ : y = y₀ e^(a(x − x₀))", ref: `${BOOK}, chap. 15 §2.1, solution vérifiant une condition initiale (p. 324-325) et ex. 2.b (p. 331)`, kw: ["condition initiale", "y(x₀) = y₀", "y₀e^(a(x − x₀))", "unique solution"] }, (_c, r) => {
    const a = nz(r, -3, 3), x0 = int(r, -2, 2), y0 = nz(r, -5, 5), x1 = x0 + int(r, 1, 3), v = y0 * Math.exp(a * (x1 - x0));
    return { statement: `Soit y la solution sur ℝ de ${eq1(a)} vérifiant y(${n2(x0)}) = ${n2(y0)}. Quelle est la valeur de y(${n2(x1)}) (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H("y(x) = k e^(ax) avec a = " + n2(a) + ".", `y(${n2(x0)}) = ${n2(y0)} donne k = ${n2(y0)} e^(−${par(a)}×${par(x0)}).`, `y(x) = ${n2(y0)} e^(${n2(a)}(x − ${par(x0)})).`, `Remplace x par ${n2(x1)}.`), solution: `y(${n2(x1)}) = ${n2(y0)} e^${par(a * (x1 - x0))} ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("ed-ordre1-population", ED, 3, { skill: "Modèle y′ = ay : taux a = (1/Δt) ln(y₂/y₁) et date d'atteinte d'une valeur", ref: `${BOOK}, chap. 15 §2.2, évolution d'une population (p. 325)`, kw: ["évolution d'une population", "vitesse proportionnelle", "h′ = ah", "ln", "croissance exponentielle"] }, (_c, r) => {
    const p1 = pick(r, [4.75, 3, 2, 5]), p2 = p1 * pick(r, [1.2, 1.5, 2]), dt = pick(r, [5, 10]), tgt = p2 * pick(r, [2, 3]), a = Math.log(p2 / p1) / dt, t = dt + Math.log(tgt / p1) / a;
    return { statement: `Une population (en millions d'habitants) évolue avec une vitesse proportionnelle à son effectif : h′ = ah. Elle vaut ${fr(p1)} à t = 0 et ${fr(r2(p2))} à t = ${dt}. Au bout de combien d'années t atteint-elle ${fr(r2(tgt))} millions (arrondi au centième) ?`.replace(`${fr(r2(tgt))}`, `${fr(r2(tgt))}`), answer: num(r2(Math.log(tgt / p1) / a), 0.1), hints: H("h(t) = p₁ e^(at).", `a = (1/${dt}) ln(${fr(r2(p2))}/${fr(p1)}).`, `On résout ${fr(p1)} e^(at) = ${fr(r2(tgt))}.`, "t = ln(tgt/p₁)/a."), solution: `a ≈ ${fr(r2(a))} ; t = ln(${fr(r2(tgt))}/${fr(p1)})/a ≈ ${n2(r2(Math.log(tgt / p1) / a))}.` };
  }, FR),
  mk("ed-decharge-rc", ED, 3, { skill: "Décharge d'un condensateur : q′ + q/(RC) = 0, q(t) = q₀ e^(−t/(RC))", ref: `${BOOK}, chap. 15 §2.2, décharge d'un condensateur dans un circuit RC (p. 325-326)`, kw: ["circuit RC", "décharge", "q′ + q/(RC) = 0", "q₀e^(−t/RC)", "temps de décharge"] }, (_c, r) => {
    const C = pick(r, [100, 200, 500]), R = pick(r, [1, 2, 5]), RC = (C * 1e-6) * (R * 1000), pct = pick(r, [1, 5, 10]), t = RC * Math.log(100 / pct);
    return { statement: `Un condensateur de capacité C = ${C} µF se décharge dans un conducteur de résistance R = ${R} kΩ : q′ + q/(RC) = 0. On le considère déchargé lorsque q vaut ${pct} % de q₀. Au bout de combien de secondes (arrondi à 10⁻³) ?`, answer: num(Math.round(t * 1000) / 1000, 0.001), hints: H("q(t) = q₀ e^(−t/(RC)).", `RC = ${C}×10⁻⁶ × ${R * 1000} = ${fr(Math.round(RC * 1e6) / 1e6)} s.`, `On résout e^(−t/RC) = ${pct}/100.`, "t = RC ln(100/" + pct + ")."), solution: `t = ${fr(Math.round(RC * 1e6) / 1e6)} × ln ${100 / pct} ≈ ${fr(Math.round(t * 1000) / 1000)} s.` };
  }, FR),
  mk("ed-ordre2-pulsation", ED, 2, { skill: "y″ + ω²y = 0 : solutions A cos ωx + B sin ωx, identifier ω", ref: `${BOOK}, chap. 15 §3.1, équations du type y″ + ω²y = 0 (p. 326-327) et ex. 3.a (p. 331)`, kw: ["y″ + ω²y = 0", "A cos ωx + B sin ωx", "pulsation", "oscillateur"] }, (_c, r) => {
    const w = int(r, 1, 6), A = int(r, -4, 4), B = int(r, -4, 4), x1 = pick(r, [Math.PI / (2 * w), Math.PI / w]), v = A * Math.cos(w * x1) + B * Math.sin(w * x1);
    if (int(r, 0, 1) === 0) return { statement: `Les solutions de y″ + ${w * w}y = 0 sont les fonctions x ↦ A cos(ωx) + B sin(ωx). Quelle est la valeur de ω ?`, answer: num(w), hints: H("y″ + ω²y = 0.", `ω² = ${w * w}.`, "ω > 0.", "Prends la racine."), solution: `ω = √${w * w} = ${w}.` };
    return { statement: `Soit y la solution de y″ + ${w * w}y = 0 avec y(0) = ${n2(A)} et y′(0) = ${n2(B * w)}. Quelle est la valeur de y(π/${2 * w}) ?`, answer: num(B), hints: H(`y(x) = A cos(${w}x) + B sin(${w}x).`, `y(0) = A = ${n2(A)} et y′(0) = ${w}B = ${n2(B * w)}.`, `B = ${n2(B)}.`, `cos(π/2) = 0 et sin(π/2) = 1 en x = π/${2 * w}.`), solution: `y(π/${2 * w}) = ${n2(A)}×0 + ${par(B)}×1 = ${n2(B)}.` };
  }, FR),
  mk("ed-ordre2-delta", ED, 2, { skill: "Équation caractéristique r² + ar + b = 0 : discriminant et forme des solutions", ref: `${BOOK}, chap. 15 §3.2, équation caractéristique et tableau (p. 327-328) et ex. 3.b, 3.c (p. 331)`, kw: ["équation caractéristique", "discriminant", "Δ = a² − 4b", "solution double", "solutions complexes conjuguées"] }, (_c, r) => {
    const a = int(r, -6, 6), b = int(r, -8, 9), D = a * a - 4 * b, OPT = ["(Ax + B)e^(rx)", "Ae^(r₁x) + Be^(r₂x)", "e^(αx)(A cos βx + B sin βx)", "A cos ωx + B sin ωx"];
    return { statement: `Quelle est la forme des solutions de ${eq2(a, b)} ?`, answer: choice(r, OPT, D === 0 ? 0 : D > 0 ? 1 : 2), hints: H("Écris l'équation caractéristique r² + ar + b = 0.", `Δ = ${a}² − 4×${par(b)} = ${D}.`, "Compare Δ à 0.", "Utilise le tableau du cours."), solution: `Δ = ${D}${D === 0 ? " : solution double" : D > 0 ? " > 0 : deux racines réelles" : " < 0 : racines complexes conjuguées"}.` };
  }, QCM),
  mk("ed-ordre2-racines", ED, 3, { skill: "y″ + ay′ + by = 0 avec Δ > 0 : racines r₁, r₂ de l'équation caractéristique", ref: `${BOOK}, chap. 15 §3.2, équation y″ + ay′ + by = 0, exemple y″ + 3y′ − 10y = 0 (p. 328) et ex. 3.c (p. 331)`, kw: ["équation caractéristique", "racines réelles", "Ae^(r₁x) + Be^(r₂x)", "y″ + ay′ + by = 0"] }, (_c, r) => {
    const r1 = int(r, -5, 3), r2v = r1 + int(r, 1, 5), a = -(r1 + r2v), b = r1 * r2v, big = int(r, 0, 1) === 0;
    return { statement: `Les solutions de ${eq2(a, b)} s'écrivent Ae^(r₁x) + Be^(r₂x) avec r₁ < r₂. Quelle est la valeur de ${big ? "r₂" : "r₁"} ?`, answer: num(big ? r2v : r1), hints: H("L'équation caractéristique est r² + ar + b = 0.", `Somme des racines = ${n2(-a)}, produit = ${n2(b)}.`, `Elles valent ${n2(r1)} et ${n2(r2v)}.`, big ? "r₂ est la plus grande." : "r₁ est la plus petite."), solution: `r² ${a < 0 ? "−" : "+"} ${Math.abs(a) === 1 ? "" : Math.abs(a)}r ${b < 0 ? "−" : "+"} ${Math.abs(b)} = 0 a pour racines ${n2(r1)} et ${n2(r2v)}.` };
  }, FR),
  mk("ed-ordre2-complexe", ED, 3, { skill: "Δ < 0 : solutions e^(αx)(A cos βx + B sin βx), α + iβ racine caractéristique", ref: `${BOOK}, chap. 15 §3.2, cas Δ < 0, exemple y″ − 4y′ + 13y = 0 (p. 328) et ex. 3.d (p. 331)`, kw: ["Δ < 0", "racines complexes conjuguées", "e^(αx)(A cos βx + B sin βx)", "équation caractéristique"] }, (_c, r) => {
    const al = int(r, -3, 3), be = int(r, 1, 4), a = -2 * al, b = al * al + be * be, wantB = int(r, 0, 1) === 0;
    return { statement: `Les solutions de ${eq2(a, b)} s'écrivent e^(αx)(A cos βx + B sin βx) avec β > 0. Quelle est la valeur de ${wantB ? "β" : "α"} ?`, answer: num(wantB ? be : al), hints: H("Équation caractéristique : r² + ar + b = 0.", `Δ = ${a * a - 4 * b} < 0.`, `Les racines sont ${n2(al)} ± ${be}i.`, wantB ? "β est la partie imaginaire." : "α est la partie réelle."), solution: `r = ${n2(al)} ± ${be}i : α = ${n2(al)}, β = ${be}.` };
  }, FR),
  mk("ed-ordre2-condition", ED, 3, { skill: "y″ + ay′ + by = 0 avec y(0) et y′(0) donnés : constantes A et B", ref: `${BOOK}, chap. 15 §3.2, solution vérifiant une condition initiale (p. 329) et ex. 3.e (p. 331)`, kw: ["conditions initiales", "y(x₀) = y₀", "y′(x₀) = z₀", "unique solution", "constantes A et B"] }, (_c, r) => {
    const r1 = int(r, -3, 2), r2v = r1 + int(r, 1, 3), a = -(r1 + r2v), b = r1 * r2v, y0 = int(r, -5, 5), z0 = int(r, -5, 5);
    const A = (z0 - r2v * y0) / (r1 - r2v), B = y0 - A, x1 = 1, v = A * Math.exp(r1 * x1) + B * Math.exp(r2v * x1);
    return { statement: `Soit y la solution de ${eq2(a, b)} vérifiant y(0) = ${n2(y0)} et y′(0) = ${n2(z0)}. On écrit y(x) = Ae^(${r1 === 1 ? "" : r1 === -1 ? "−" : n2(r1)}x) + Be^(${r2v === 1 ? "" : r2v === -1 ? "−" : n2(r2v)}x). Quelle est la valeur de A (arrondie au centième) ?`, answer: num(r2(A), 0.01), hints: H("Les solutions sont Ae^(r₁x) + Be^(r₂x).", `y(0) = A + B = ${n2(y0)}.`, `y′(0) = ${n2(r1)}A + ${n2(r2v)}B = ${n2(z0)}.`, "Résous le système."), solution: `A ≈ ${n2(r2(A))} et B ≈ ${n2(r2(B))}.` };
  }, FR),
  mk("ed-second-membre", ED, 3, { skill: "y′ + ay = cos x : solution particulière p cos x + q sin x par identification", ref: `${BOOK}, chap. 15 §3.3, travaux dirigés « Équation différentielle avec second membre » (p. 329-330)`, kw: ["second membre", "solution particulière", "identification", "p cos x + q sin x", "y′ + 2y = cos x"] }, (_c, r) => {
    const a = int(r, 1, 4), wantP = int(r, 0, 1) === 0, p = a / (a * a + 1), q = 1 / (a * a + 1);
    return { statement: `On cherche une solution particulière de y′ + ${a === 1 ? "" : a}y = cos x sous la forme g(x) = p cos x + q sin x. Quelle est la valeur de ${wantP ? "p" : "q"} (arrondie au centième) ?`, answer: num(r2(wantP ? p : q), 0.01), hints: H("Calcule g′(x) = −p sin x + q cos x.", `g′ + ${a === 1 ? "" : a}g = (q + ${a === 1 ? "" : a}p) cos x + (−p + ${a === 1 ? "" : a}q) sin x.`, `On impose q + ${a === 1 ? "" : a}p = 1 et −p + ${a === 1 ? "" : a}q = 0.`, "Résous le système."), solution: `p = ${a}/${a * a + 1} ≈ ${n2(r2(p))} ; q = 1/${a * a + 1} ≈ ${n2(r2(q))}.` };
  }, FR),
  mk("ed-cours", ED, 1, { skill: "Cours : équation différentielle, ordre, solution, courbe intégrale, solutions types", ref: `${BOOK}, chap. 15 « Équations différentielles », cours (p. 321-330)`, kw: ["équation différentielle", "ordre", "solution", "courbe intégrale", "équation caractéristique"] }, (_c, r) => {
    const T: Item[] = [
      { q: "L'ordre d'une équation différentielle est…", good: "le plus grand ordre de dérivation qui y intervient", bad: ["le nombre de ses solutions", "le degré de y", "le nombre de termes"], why: "Vocabulaire de la page 322." },
      { q: "Résoudre (ou intégrer) une équation différentielle sur K, c'est…", good: "déterminer toutes ses solutions sur K", bad: ["trouver une seule solution", "dériver y", "calculer y(0)"], why: "Vocabulaire de la page 322." },
      { q: "La courbe représentative d'une solution est appelée…", good: "courbe intégrale", bad: ["courbe caractéristique", "courbe primitive", "courbe unique"], why: "Vocabulaire de la page 322." },
      { q: "Les solutions de y′ − ay = 0 sont…", good: "x ↦ k e^(ax)", bad: ["x ↦ k e^(−ax)", "x ↦ ax + k", "x ↦ k/a"], why: "Propriété de la page 324." },
      { q: "Les solutions de y″ + ω²y = 0 sont…", good: "x ↦ A cos ωx + B sin ωx", bad: ["x ↦ A e^(ωx)", "x ↦ Ax + B", "x ↦ A cos x + B sin x"], why: "Propriété de la page 327." },
      { q: "L'équation caractéristique de y″ + ay′ + by = 0 est…", good: "r² + ar + b = 0", bad: ["ar² + r + b = 0", "r² − ar + b = 0", "r + a + b = 0"], why: "Définition de la page 327." },
      { q: "Pour y′ − ay = 0, par un point donné (x₀ ; y₀) passent…", good: "une seule courbe intégrale", bad: ["aucune courbe intégrale", "deux courbes intégrales", "une infinité de courbes intégrales"], why: "Propriété de la page 324." },
    ];
    return qcmOf(r, T, "Reprends le vocabulaire et les solutions types.");
  }, QCM),
];
