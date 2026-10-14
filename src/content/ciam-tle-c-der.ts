// CIAM Terminale SM (série C) : chapitre 10, Dérivation et études de fonctions. Énoncés originaux, réponses calculées par le code.
// Les tracés de courbes et les démonstrations du manuel ne se corrigent pas automatiquement : on en garde les calculs
// (dérivées, tangentes, réciproque, accroissements finis, dérivées successives, convexité, extrema, centre de symétrie) et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf, sup } from "./ciam-kit";

const mk = ciam("tle", "ciamtd");
const BOOK = "CIAM Terminale SM";
const DE = "Dérivabilité et étude de fonctions — série C";
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
const der = (c: number[]) => c.slice(0, -1).map((a, i) => a * (c.length - 1 - i));

const mul = (a: number[], b: number[]) => { const o = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { o[i + j] += x * y; })); return o; };

export const TC_DER: Template[] = [
  mk("de-composee", DE, 2, { skill: "Dérivée d'une composée : (uⁿ)′ = n u′ uⁿ⁻¹ et (√u)′ = u′/(2√u)", ref: `${BOOK}, chap. 10 §1.2, dérivées usuelles et composée de deux fonctions (p. 215) et ex. 1.d (p. 220)`, kw: ["dérivée d'une composée", "(uⁿ)′ = nu′uⁿ⁻¹", "(√u)′ = u′/(2√u)", "dérivabilité", "fonction composée"] }, (_c, r) => {
    if (int(r, 0, 1) === 0) {
      const p = int(r, -4, 4), q = int(r, -4, 4), n = int(r, 2, 4), x0 = int(r, -2, 2), u = x0 * x0 + p * x0 + q;
      return { statement: `Soit f(x) = (x² ${p < 0 ? "−" : "+"} ${Math.abs(p)}x ${q < 0 ? "−" : "+"} ${Math.abs(q)})${sup(n)}. Quelle est la valeur de f′(${n2(x0)}) ?`, answer: num(n * u ** (n - 1) * (2 * x0 + p)), hints: H("(uⁿ)′ = n u′ uⁿ⁻¹.", `u′(x) = 2x ${p < 0 ? "−" : "+"} ${Math.abs(p)} et u(${n2(x0)}) = ${u}.`, `f′(x) = ${n}(2x ${p < 0 ? "−" : "+"} ${Math.abs(p)})(…)${sup(n - 1)}.`, "Remplace x par x₀."), solution: `f′(${n2(x0)}) = ${n} × ${par(2 * x0 + p)} × ${par(u)}${sup(n - 1)} = ${n2(n * u ** (n - 1) * (2 * x0 + p))}.` };
    }
    const a = nz(r, -3, 3), s = int(r, 1, 4), x0 = int(r, -3, 3), b = s * s - a * x0 * x0;
    return { statement: `Soit f(x) = √(${pol([a, 0, b])}), définie au voisinage de ${n2(x0)}. Quelle est la valeur de f′(${n2(x0)}) (arrondie au centième) ?`, answer: num(r2((a * x0) / s), 0.01), hints: H("(√u)′ = u′/(2√u).", `u(${n2(x0)}) = ${s * s}, donc √u = ${s}.`, `u′(x) = ${n2(2 * a)}x.`, "Calcule."), solution: `f′(${n2(x0)}) = ${n2(2 * a * x0)}/(2×${s}) = ${n2(r2((a * x0) / s))}.` };
  }, FR),
  mk("de-quotient", DE, 2, { skill: "Dérivée d'un quotient (ax + b)/(cx + d) en un point", ref: `${BOOK}, chap. 10 §1.1, dérivées usuelles, (u/v)′ = (u′v − uv′)/v² (p. 215) et ex. 1.b (p. 220)`, kw: ["dérivée d'un quotient", "(u/v)′", "fonction homographique", "nombre dérivé"] }, (_c, r) => {
    const a = nz(r, -4, 4), b = int(r, -5, 5), c = nz(r, -3, 3), d = int(r, -5, 5), x0 = int(r, -3, 3);
    if (c * x0 + d === 0) return { statement: "f(x) = 1/x. Quelle est la valeur de f′(2) (arrondie au centième) ?", answer: num(-0.25, 0.01), hints: H("(1/x)′ = −1/x².", "x = 2.", "−1/4.", "Calcule."), solution: "f′(2) = −1/4 = −0,25." };
    const val = (a * d - b * c) / (c * x0 + d) ** 2;
    return { statement: `Soit f(x) = (${pol([a, b])}) / (${pol([c, d])}). Quelle est la valeur de f′(${n2(x0)}) (arrondie au centième) ?`, answer: num(r2(val), 0.01), hints: H("(u/v)′ = (u′v − uv′)/v².", `u′ = ${a}, v′ = ${c}.`, `f′(x) = (${a}×${par(d)} − ${par(b)}×${par(c)})/(${pol([c, d])})².`, "Remplace x par x₀."), solution: `f′(x) = ${n2(a * d - b * c)}/(${pol([c, d])})², donc f′(${n2(x0)}) ≈ ${n2(r2(val))}.` };
  }, FR),
  mk("de-reciproque", DE, 3, { skill: "Dérivée de la bijection réciproque : (f⁻¹)′(y₀) = 1/f′(x₀)", ref: `${BOOK}, chap. 10 §1.1, dérivée de la réciproque d'une fonction (p. 216) et ex. 1.c (p. 220)`, kw: ["bijection réciproque", "(f⁻¹)′ = 1/(f′∘f⁻¹)", "dérivée de la réciproque", "f′(x₀) ≠ 0"] }, (_c, r) => {
    const p = int(r, 1, 4), x0 = int(r, -2, 2), y0 = x0 ** 3 + p * x0, d = 3 * x0 * x0 + p;
    return { statement: `f(x) = x³ + ${p}x est une bijection de ℝ sur ℝ, de réciproque f⁻¹. On a f(${n2(x0)}) = ${n2(y0)}. Quelle est la valeur de (f⁻¹)′(${n2(y0)}) (arrondie au centième) ?`, answer: num(r2(1 / d), 0.01), hints: H("(f⁻¹)′(y₀) = 1/f′(f⁻¹(y₀)).", `f⁻¹(${n2(y0)}) = ${n2(x0)}.`, `f′(x) = 3x² + ${p}, donc f′(${n2(x0)}) = ${d}.`, "Prends l'inverse."), solution: `(f⁻¹)′(${n2(y0)}) = 1/f′(${n2(x0)}) = 1/${d} ≈ ${n2(r2(1 / d))}.` };
  }, FR),
  mk("de-arctangente", DE, 3, { skill: "Dérivée de la fonction réciproque de tan : (tan⁻¹)′(x) = 1/(1 + x²)", ref: `${BOOK}, chap. 10 §1.1, exemple de la fonction arctangente (p. 216)`, kw: ["arctangente", "tan⁻¹", "1/(1 + x²)", "réciproque de la tangente"] }, (_c, r) => {
    const a = int(r, -4, 4);
    return { statement: `Quelle est la valeur de (tan⁻¹)′(${n2(a)}) (arrondie au centième) ?`, answer: num(r2(1 / (1 + a * a)), 0.01), hints: H("(tan⁻¹)′(x) = 1/(1 + x²).", `x = ${n2(a)}.`, `1 + ${a * a} = ${1 + a * a}.`, "Calcule l'inverse."), solution: `(tan⁻¹)′(${n2(a)}) = 1/${1 + a * a} ≈ ${n2(r2(1 / (1 + a * a)))}.` };
  }, FR),
  mk("de-puissance-rationnelle", DE, 3, { skill: "Dérivée de x ↦ x^r (r rationnel) : r x^(r−1)", ref: `${BOOK}, chap. 10 §1.1, dérivées des fonctions x ↦ x^r et u^r (p. 217)`, kw: ["x^r", "puissance rationnelle", "dérivée", "r x^(r−1)", "r ∈ ℚ*"] }, (_c, r) => {
    const T: [number, number, number][] = [[4, 3, 2], [9, 3, 2], [8, 2, 3], [27, 2, 3], [16, 3, 4], [8, 1, 3], [4, 1, 2], [25, 3, 2]];
    const [x0, p, q] = pick(r, T), v = (p / q) * Math.pow(x0, p / q - 1);
    return { statement: `Soit f(x) = x^(${p}/${q}) sur ]0 ; +∞[. Quelle est la valeur de f′(${x0}) (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H("(x^r)′ = r x^(r−1).", `r − 1 = ${p}/${q} − 1 = ${p - q}/${q}.`, `${x0}^(${p - q}/${q}) = ${fr(r2(Math.pow(x0, (p - q) / q)))}.`, "Multiplie par r."), solution: `f′(${x0}) = (${p}/${q}) × ${x0}^(${p - q}/${q}) ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("de-derivabilite-intervalle", DE, 3, { skill: "Dérivabilité sur un intervalle fermé en une borne : nombre dérivé à droite", ref: `${BOOK}, chap. 10 §1.1, dérivabilité sur un intervalle (p. 214)`, kw: ["dérivabilité sur [a ; b]", "dérivable à droite", "demi-tangente", "lim (f(x) − f(a))/(x − a)", "x√x", "√x"] }, (_c, r) => {
    const T: Item[] = [
      { q: "f(x) = x√x est-elle dérivable sur [0 ; +∞[ ?", good: "Oui, car (f(x) − f(0))/x = √x tend vers 0", bad: ["Non, car √x n'est pas dérivable en 0", "Non, car f(0) n'existe pas", "Oui, car f′(x) = 1/(2√x) est définie en 0"], why: "Exemple de la page 214 : la limite du taux d'accroissement est 0." },
      { q: "g(x) = √x est-elle dérivable sur [0 ; +∞[ ?", good: "Non, car (g(x) − g(0))/x = 1/√x tend vers +∞", bad: ["Oui, car g est continue en 0", "Oui, car g′(0) = 0", "Non, car g n'est pas continue en 0"], why: "Exemple de la page 214 : le taux d'accroissement tend vers +∞." },
      { q: "Si le taux d'accroissement de f en a tend vers +∞ à droite, la courbe admet en a…", good: "une demi-tangente parallèle à (OJ)", bad: ["une tangente horizontale", "une asymptote horizontale", "aucune demi-tangente"], why: "Cas du nombre dérivé infini." },
      { q: "Une fonction dérivable sur un intervalle K est…", good: "continue sur K", bad: ["constante sur K", "monotone sur K", "positive sur K"], why: "Propriété de la page 214." },
    ];
    return qcmOf(r, T, "Étudie la limite du taux d'accroissement en la borne.");
  }, QCM),
  mk("de-accroissements-finis", DE, 3, { skill: "Inégalité des accroissements finis : m ≤ f′ ≤ M ⇒ f(a) + m(b − a) ≤ f(b) ≤ f(a) + M(b − a)", ref: `${BOOK}, chap. 10 §1.3, inégalité des accroissements finis (p. 217-218) et ex. 1.e, 1.f (p. 220)`, kw: ["inégalité des accroissements finis", "m(b − a) ≤ f(b) − f(a) ≤ M(b − a)", "majorant", "|f′| ≤ M", "encadrement"] }, (_c, r) => {
    const a = int(r, -3, 2), b = a + int(r, 1, 5), m = int(r, -3, 2), M = m + int(r, 1, 4), fa = int(r, -6, 6), up = int(r, 0, 1) === 0;
    return { statement: `f est dérivable sur [${n2(a)} ; ${n2(b)}], avec m = ${n2(m)} ≤ f′(x) ≤ M = ${n2(M)} pour tout x de cet intervalle, et f(${n2(a)}) = ${n2(fa)}. Quel est le ${up ? "meilleur majorant" : "meilleur minorant"} de f(${n2(b)}) donné par l'inégalité des accroissements finis ?`, answer: num(up ? fa + M * (b - a) : fa + m * (b - a)), hints: H("m(b − a) ≤ f(b) − f(a) ≤ M(b − a).", `b − a = ${b - a}.`, up ? `f(b) ≤ f(a) + M(b − a).` : `f(b) ≥ f(a) + m(b − a).`, "Calcule."), solution: `${up ? `f(b) ≤ ${n2(fa)} + ${par(M)}×${b - a}` : `f(b) ≥ ${n2(fa)} + ${par(m)}×${b - a}`} = ${n2(up ? fa + M * (b - a) : fa + m * (b - a))}.` };
  }, FR),
  mk("de-erreur-racine", DE, 3, { skill: "Majorer l'erreur d'une approximation de √x par l'inégalité des accroissements finis", ref: `${BOOK}, chap. 10 §1.3, inégalité des accroissements finis (p. 218) et ex. 1.f (p. 220)`, kw: ["inégalité des accroissements finis", "√x", "majorant de l'erreur", "|f(b) − f(a)| ≤ M|b − a|"] }, (_c, r) => {
    const s = pick(r, [10, 20, 30, 50, 100]), d = pick(r, [1, 2, 5]), a = s * s;
    return { statement: `On applique l'inégalité des accroissements finis à f(x) = √x sur [${a} ; ${a + d}]. Sur cet intervalle, 0 < f′(x) ≤ M avec M = f′(${a}). Quelle est la valeur de M × ${d}, qui majore √${a + d} − √${a} (arrondie à 10⁻⁵) ?`, answer: num(Math.round((d / (2 * s)) * 1e5) / 1e5, 0.00001), hints: H("f′(x) = 1/(2√x) est décroissante.", `Sur [${a} ; ${a + d}], f′(x) ≤ f′(${a}) = 1/(2×${s}).`, `L'erreur est majorée par M × (b − a) = ${d}/${2 * s}.`, "Calcule."), solution: `M = 1/${2 * s} ; M × ${d} = ${d}/${2 * s} ≈ ${fr(Math.round((d / (2 * s)) * 1e5) / 1e5)}.` };
  }, FR),
  mk("de-derivees-successives", DE, 2, { skill: "Dérivées successives d'un polynôme : f″(x₀), f⁽³⁾", ref: `${BOOK}, chap. 10 §1.4, dérivées successives d'une fonction (p. 218-219) et ex. 1.g, 1.h (p. 220)`, kw: ["dérivée seconde", "dérivées successives", "f″", "f⁽³⁾", "dérivée n-ième"] }, (_c, r) => {
    const n = int(r, 3, 4), c = [nz(r, -3, 3), ...Array.from({ length: n }, () => int(r, -5, 5))], x0 = int(r, -3, 3), k = int(r, 2, 3);
    let d = c; for (let i = 0; i < k; i++) d = der(d);
    const lab = k === 2 ? "f″" : "f⁽³⁾";
    return { statement: `Soit f(x) = ${pol(c)}. Quelle est la valeur de ${lab}(${n2(x0)}) ?`, answer: num(ev(d, x0)), hints: H("Dérive successivement.", `f′(x) = ${pol(der(c))}.`, `f″(x) = ${pol(der(der(c)))}.`, k === 3 ? `f⁽³⁾(x) = ${pol(der(der(der(c))))}.` : "Remplace x par x₀."), solution: `${lab}(x) = ${pol(d)}, donc ${lab}(${n2(x0)}) = ${n2(ev(d, x0))}.` };
  }, FR),
  mk("de-derivee-nieme-trigo", DE, 3, { skill: "Dérivée n-ième de sin et cos : sin⁽ⁿ⁾(x) = sin(x + nπ/2)", ref: `${BOOK}, chap. 10 §1.4, dérivée n-ième de x ↦ sin x, démonstration par récurrence (p. 219)`, kw: ["dérivée n-ième", "sin(x + nπ/2)", "récurrence", "cos(x + nπ/2)", "dérivées successives"] }, (_c, r) => {
    const n = int(r, 1, 30), isSin = int(r, 0, 1) === 0, m = n % 4;
    const v = isSin ? [0, 1, 0, -1][m] : [1, 0, -1, 0][m];
    return { statement: `Soit f(x) = ${isSin ? "sin x" : "cos x"}. Quelle est la valeur de f⁽${n}⁾(0) ?`, answer: num(v), hints: H(`${isSin ? "sin" : "cos"}⁽ⁿ⁾(x) = ${isSin ? "sin" : "cos"}(x + nπ/2).`, "Les dérivées se répètent avec la période 4.", `${n} = 4×${Math.floor(n / 4)} + ${m}.`, `Calcule ${isSin ? "sin" : "cos"}(${m}π/2).`), solution: `Comme ${n} ≡ ${m} (mod 4), f⁽${n}⁾(0) = ${n2(v)}.` };
  }, FR),
  mk("de-tangente-equation", DE, 2, { skill: "Équation de la tangente y = f′(x₀)(x − x₀) + f(x₀) : ordonnée à l'origine", ref: `${BOOK}, chap. 10 §1.4, position relative d'une courbe et de ses tangentes (p. 219)`, kw: ["tangente", "y = f′(x₀)(x − x₀) + f(x₀)", "ordonnée à l'origine", "nombre dérivé"] }, (_c, r) => {
    const co = [nz(r, -3, 3), int(r, -5, 5), int(r, -5, 5)], x0 = int(r, -3, 3), m = ev(der(co), x0), y0 = ev(co, x0);
    return { statement: `Soit f(x) = ${pol(co)}. La tangente à la courbe au point d'abscisse ${n2(x0)} a pour équation y = mx + p. Quelle est la valeur de p ?`, answer: num(y0 - m * x0), hints: H("y = f′(x₀)(x − x₀) + f(x₀).", `f′(${n2(x0)}) = ${n2(m)} et f(${n2(x0)}) = ${n2(y0)}.`, "p = f(x₀) − f′(x₀) x₀.", "Calcule."), solution: `p = ${n2(y0)} − ${par(m)}×${par(x0)} = ${n2(y0 - m * x0)}.` };
  }, FR),
  mk("de-convexite-inflexion", DE, 3, { skill: "Point d'inflexion : f″ s'annule en changeant de signe", ref: `${BOOK}, chap. 10 §1.4, convexité, concavité, point d'inflexion (p. 219-220)`, kw: ["point d'inflexion", "f″ s'annule en changeant de signe", "convexe", "concave", "dérivée seconde"] }, (_c, r) => {
    const k = nz(r, -3, 3), b = int(r, -5, 5), c = int(r, -5, 5), wantX = int(r, 0, 1) === 0, a3 = 3 * k;
    const co = [1, a3, b, c], x0 = -k, y0 = ev(co, x0);
    return { statement: `La courbe de f(x) = ${pol(co)} admet un unique point d'inflexion. Quelle est ${wantX ? "son abscisse" : "son ordonnée"} ?`, answer: num(wantX ? x0 : y0), hints: H("Cherche où f″ s'annule en changeant de signe.", `f″(x) = 6x ${a3 < 0 ? "−" : "+"} ${Math.abs(2 * a3)}.`, `f″(x) = 0 pour x = ${n2(x0)}.`, wantX ? "C'est l'abscisse." : `Calcule f(${n2(x0)}).`), solution: `f″ s'annule en changeant de signe en ${n2(x0)} ; f(${n2(x0)}) = ${n2(y0)}.` };
  }, FR),
  mk("de-position-tangente", DE, 2, { skill: "Position relative d'une courbe et d'une tangente selon le signe de f″", ref: `${BOOK}, chap. 10 §1.4, position relative d'une courbe et de ses tangentes (p. 219)`, kw: ["position relative", "tangente", "convexe", "concave", "f″ > 0", "au-dessus de ses tangentes"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Si f″ > 0 sur un intervalle K, la courbe est…", good: "au-dessus de ses tangentes sur K (f convexe)", bad: ["au-dessous de ses tangentes sur K", "traversée par ses tangentes", "une droite"], why: "f″ > 0 : f convexe." },
      { q: "Si f″ < 0 sur un intervalle K, la courbe est…", good: "au-dessous de ses tangentes sur K (f concave)", bad: ["au-dessus de ses tangentes sur K", "traversée par ses tangentes", "croissante"], why: "f″ < 0 : f concave." },
      { q: "Si f″ s'annule en x₀ en changeant de signe, le point d'abscisse x₀ est…", good: "un point d'inflexion : la tangente traverse la courbe", bad: ["un maximum de f", "un minimum de f", "un point anguleux"], why: "Définition du point d'inflexion." },
      { q: "La fonction x ↦ x² a une dérivée seconde constante égale à 2 : sa courbe est…", good: "convexe sur ℝ", bad: ["concave sur ℝ", "sans tangente", "d'inflexion en 0"], why: "f″ > 0." },
    ];
    return qcmOf(r, T, "Utilise le signe de f″.");
  }, QCM),
  mk("de-extremum", DE, 2, { skill: "Extremum d'un polynôme x³ − 3k²x : annulation de f′ et valeur", ref: `${BOOK}, chap. 10 §2.1, étude d'un polynôme (p. 221-222) et ex. 2.a (p. 227)`, kw: ["extremum", "tableau de variation", "f′(x) = 0", "maximum relatif", "minimum relatif", "polynôme"] }, (_c, r) => {
    const k = int(r, 1, 3), mx = int(r, 0, 1) === 0, e = int(r, -4, 4), co = [1, 0, -3 * k * k, e];
    const x0 = mx ? -k : k, y0 = ev(co, x0);
    return { statement: `Soit f(x) = ${pol(co)}. Quelle est la valeur du ${mx ? "maximum" : "minimum"} relatif de f ?`, answer: num(y0), hints: H("f′(x) = 0 donne les abscisses des extremums.", `f′(x) = 3x² − ${3 * k * k} s'annule en ±${k}.`, `Le ${mx ? "maximum relatif" : "minimum relatif"} est atteint en ${n2(x0)} (f′ passe de ${mx ? "+ à −" : "− à +"}).`, `Calcule f(${n2(x0)}).`), solution: `f(${n2(x0)}) = ${n2(y0)}.` };
  }, FR),
  mk("de-centre-symetrie", DE, 3, { skill: "Centre de symétrie : f(x) = k + (x − h)/((x − h)² + 1), fonction impaire dans le repère (Ω ; i, j)", ref: `${BOOK}, chap. 10 §2.1, étude d'une fonction rationnelle, centre de symétrie (p. 222)`, kw: ["centre de symétrie", "fonction impaire", "changement de repère", "Ω(h ; k)", "axe de symétrie"] }, (_c, r) => {
    const h = int(r, -3, 3), k = int(r, -3, 3), wantX = int(r, 0, 1) === 0, xs = h === 0 ? "x" : `(x ${h < 0 ? "+" : "−"} ${Math.abs(h)})`;
    return { statement: `Soit f(x) = ${k === 0 ? "" : `${n2(k)} + `}${xs} / (${xs}² + 1). Sa courbe admet un centre de symétrie Ω. Quelle est ${wantX ? "son abscisse" : "son ordonnée"} ?`, answer: num(wantX ? h : k), hints: H("Pose X = x − h et Y = y − k : la courbe devient celle de Y = X/(X² + 1).", "La fonction X ↦ X/(X² + 1) est impaire.", "Une fonction impaire a pour centre de symétrie l'origine du repère (Ω ; i, j).", "Lis h et k."), solution: `Dans le repère translaté de Ω(${n2(h)} ; ${n2(k)}), Y = X/(X² + 1) est impaire : le centre est Ω(${n2(h)} ; ${n2(k)}).` };
  }, FR),
  mk("de-periode", DE, 2, { skill: "Réduire l'intervalle d'étude : période de x ↦ sin(ax) ou cos(ax)", ref: `${BOOK}, chap. 10 §2.3, fonctions trigonométriques (p. 225-227) et ex. 2.f, 2.g (p. 227)`, kw: ["période", "fonction périodique", "intervalle d'étude", "2π/a", "fonction impaire"] }, (_c, r) => {
    const a = int(r, 1, 6), fn = pick(r, ["sin", "cos"]);
    return { statement: `Quelle est la plus petite période positive de f(x) = ${fn}(${a === 1 ? "" : a}x) (arrondie au centième) ?`, answer: num(r2((2 * Math.PI) / a), 0.01), hints: H(`${fn}(u) a pour période 2π.`, `On a ${fn}(${a}(x + T)) = ${fn}(${a}x + ${a}T).`, `Il faut ${a}T = 2π.`, "Calcule T."), solution: `T = 2π/${a} ≈ ${n2(r2((2 * Math.PI) / a))}.` };
  }, FR),
  mk("de-leibniz", DE, 3, { skill: "Formule de Leibniz : (fg)″ = f″g + 2f′g′ + fg″", ref: `${BOOK}, chap. 10, formule de Leibniz, ex. 40 (p. 230)`, kw: ["formule de Leibniz", "(fg)″", "dérivée seconde d'un produit", "dérivées successives"] }, (_c, r) => {
    const f = [nz(r, -3, 3), int(r, -4, 4), int(r, -4, 4)], g = [nz(r, -2, 2), int(r, -4, 4), int(r, -4, 4), int(r, -4, 4)], x0 = int(r, -2, 2);
    const f1 = der(f), f2 = der(f1), g1 = der(g), g2 = der(g1);
    const v = ev(f2, x0) * ev(g, x0) + 2 * ev(f1, x0) * ev(g1, x0) + ev(f, x0) * ev(g2, x0);
    return { statement: `Soit f(x) = ${pol(f)} et g(x) = ${pol(g)}. Quelle est la valeur de (fg)″(${n2(x0)}) ?`, answer: num(ev(der(der(mul(f, g))), x0)), hints: H("(fg)″ = f″g + 2f′g′ + fg″.", `f(${n2(x0)}) = ${n2(ev(f, x0))}, f′(${n2(x0)}) = ${n2(ev(f1, x0))}, f″(${n2(x0)}) = ${n2(ev(f2, x0))}.`, `g(${n2(x0)}) = ${n2(ev(g, x0))}, g′(${n2(x0)}) = ${n2(ev(g1, x0))}, g″(${n2(x0)}) = ${n2(ev(g2, x0))}.`, "Remplace dans la formule."), solution: `(fg)″(${n2(x0)}) = ${n2(ev(f2, x0))}×${par(ev(g, x0))} + 2×${par(ev(f1, x0))}×${par(ev(g1, x0))} + ${par(ev(f, x0))}×${par(ev(g2, x0))} = ${n2(v)}.` };
  }, FR),
  mk("de-cours", DE, 1, { skill: "Cours : dérivées usuelles, composées, réciproque, accroissements finis, études de fonctions", ref: `${BOOK}, chap. 10 « Dérivation – Études de fonctions », cours (pp. 213-227)`, kw: ["dérivées usuelles", "dérivée d'une composée", "bijection réciproque", "inégalité des accroissements finis", "point d'inflexion"] }, (_c, r) => {
    const T: Item[] = [
      { q: "La dérivée de x ↦ tan x est…", good: "1 + tan²x", bad: ["1/cos x", "−1/sin²x", "tan x"], why: "Tableau des dérivées usuelles." },
      { q: "La dérivée de x ↦ √u est…", good: "u′/(2√u)", bad: ["u′/√u", "1/(2√u)", "2u′√u"], why: "Tableau des dérivées usuelles." },
      { q: "La dérivée de x ↦ 1/v est…", good: "−v′/v²", bad: ["v′/v²", "−1/v²", "1/v′"], why: "Tableau des dérivées usuelles." },
      { q: "La dérivée de uⁿ (n ∈ ℤ*) est…", good: "n u′ uⁿ⁻¹", bad: ["n uⁿ⁻¹", "u′ uⁿ", "n u′ uⁿ"], why: "Tableau des dérivées usuelles." },
      { q: "Si f est dérivable et strictement monotone sur K avec f′ ≠ 0, la dérivée de f⁻¹ est…", good: "1/(f′∘f⁻¹)", bad: ["1/f′", "f′∘f⁻¹", "−1/f′"], why: "Propriété de la page 216." },
      { q: "Une fonction x ↦ x^r (r ∈ ℚ*, r < 1) est dérivable en 0 ?", good: "Non", bad: ["Oui toujours", "Oui si r > 0", "Seulement si r est entier"], why: "x^r est dérivable en 0 si et seulement si r ≥ 1." },
      { q: "Si |f′(x)| ≤ M sur [a ; b], alors pour tous x, y de cet intervalle…", good: "|f(x) − f(y)| ≤ M|x − y|", bad: ["f(x) ≤ M", "|f(x) − f(y)| ≥ M|x − y|", "f est constante"], why: "Inégalité des accroissements finis (propriété 2)." },
      { q: "La dérivée seconde est…", good: "la dérivée de la dérivée", bad: ["le carré de la dérivée", "la primitive de la dérivée", "la dérivée de x ↦ f(2x)"], why: "Définition des dérivées successives." },
    ];
    return qcmOf(r, T, "Reprends le tableau des dérivées usuelles.");
  }, QCM),
];
