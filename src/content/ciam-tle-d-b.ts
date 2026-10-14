// CIAM Terminale SE (série D) : dérivée et primitives. Pages du manuel « CIAM Terminale SE ».
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtd");
const BOOK = "CIAM Tle SE";
const DE = "Dérivabilité et étude de fonctions — série D";
const PR = "Primitives — série D";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const nz = (r: () => number, lo: number, hi: number) => { let v = 0; while (v === 0) v = lo + Math.floor(r() * (hi - lo + 1)); return v; };
const term = (a: number, v: string, first: boolean) => {
  if (a === 0) return "";
  const m = Math.abs(a) === 1 && v !== "" ? "" : String(Math.abs(a));
  return first ? `${a < 0 ? "−" : ""}${m}${v}` : ` ${a < 0 ? "−" : "+"} ${m}${v}`;
};
const bound = (b: number, a: number) => (b % a === 0 ? S(-b / a) : `−${b}/${a}`);
const lin = (a: number, b: number) => `${term(a, "x", true)}${term(b, "", a === 0)}`;
const quad = (a: number, b: number, c: number) => `${term(a, "x²", true)}${term(b, "x", a === 0)}${term(c, "", a === 0 && b === 0)}`;

export const TDB: Template[] = [
  // ===== Chapitre 2 §1-2 : dérivation =====
  mk("de-gauche-droite", DE, 2, { skill: "Nombres dérivés à gauche et à droite : f(x) = |x − a|·g", ref: `${BOOK}, chap. 2 §1.2 (p. 37-38)`, kw: ["dérivabilité à gauche", "dérivabilité à droite", "nombre dérivé", "valeur absolue", "point anguleux"] }, (c, r) => {
    const a = int(r, -3, 4), k = nz(r, -4, 4);
    const left = int(r, 0, 1) === 0;
    // f(x) = k·x·|x − a| ; en a : f(a) = 0 ; f'_d(a) = k·a, f'_g(a) = −k·a
    const v = (left ? -1 : 1) * k * a;
    return { statement: `f(x) = ${term(k, "x", true)}·|x ${a < 0 ? "+" : "−"} ${Math.abs(a)}|. Quel est le nombre dérivé de f à ${left ? "gauche" : "droite"} en ${S(a)} ?`.replace("|x − 0|", "|x|").replace("|x + 0|", "|x|"), answer: num(v), hints: H("Pour x < a, |x − a| = −(x − a) ; pour x > a, |x − a| = x − a.", `Le taux (f(x) − f(a))/(x − a) vaut ${left ? "−" : ""}${term(k, "x", true)} ${left ? "(à gauche)" : "(à droite)"}.`, `Prends la limite quand x tend vers ${S(a)}.`, "Remplace x par a."), solution: `f′${left ? "g" : "d"}(${S(a)}) = ${left ? "−" : ""}${P(k)} × ${P(a)} = ${S(v)}.` };
  }),
  mk("de-tangente-verticale", DE, 2, { skill: "Dérivabilité de √ en 0 et tangente verticale", ref: `${BOOK}, chap. 2 §1.2 (p. 39)`, kw: ["tangente verticale", "racine carrée", "non dérivable", "limite infinie du taux"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "La fonction racine carrée est-elle dérivable en 0 ?", good: "Non : le taux (√x − 0)/x = 1/√x tend vers +∞", bad: ["Oui, sa dérivée en 0 est 0", "Oui, sa dérivée en 0 est 1", "Oui, car elle est continue en 0"], why: "Exemple introductif du manuel (§1.2)." },
      { q: "Que dire de la courbe de x ↦ √x au point d'abscisse 0 ?", good: "Elle admet une tangente verticale", bad: ["Elle admet une tangente horizontale", "Elle n'a pas de tangente", "Elle admet une asymptote horizontale"], why: "Si la limite du taux de variation est infinie, la courbe admet une tangente verticale (§1.2)." },
      { q: "f(x) = x√x est-elle dérivable en 0 ?", good: "Oui, et f′(0) = 0", bad: ["Non, car √x n'est pas dérivable en 0", "Oui, et f′(0) = 1", "Non, car f n'est pas continue"], why: "Exemple 1 du manuel (§1.2) : le taux x√x/x = √x tend vers 0." },
      { q: "Si f est dérivable en x₀, alors :", good: "f admet une tangente non verticale en M₀(x₀ ; f(x₀))", bad: ["f admet une tangente verticale", "f est nulle en x₀", "f′(x₀) = 0"], why: "Interprétation géométrique de la dérivabilité (§1.1)." },
      { q: "Quand f est dérivable à gauche et à droite en x₀ avec f′g(x₀) ≠ f′d(x₀), M₀ est :", good: "un point anguleux de la courbe", bad: ["un point d'inflexion", "un extremum", "un point à tangente verticale"], why: "Vocabulaire du manuel (§1.2)." },
      { q: "f est dérivable en x₀ si et seulement si :", good: "f est dérivable à gauche et à droite en x₀, avec f′g(x₀) = f′d(x₀)", bad: ["f est continue en x₀", "f est définie en x₀", "f′g(x₀) = 0"], why: "Propriété du manuel (§1.2)." },
    ];
    return qcmOf(r, pool, "Étudie la limite du taux de variation.");
  }, QCM),
  mk("de-puissance", DE, 2, { skill: "Dérivée de uⁿ : n·u′·uⁿ⁻¹", ref: `${BOOK}, chap. 2 §2.2 (p. 43) et ex. 2.c (p. 43)`, kw: ["dérivée d'une puissance", "n u′ uⁿ⁻¹", "fonction composée", "dérivée"] }, (c, r) => {
    const a = nz(r, -3, 3), b = int(r, -4, 4), n = int(r, 2, 6), x0 = int(r, -2, 3);
    const u = a * x0 + b;
    const v = n * a * u ** (n - 1);
    return { statement: `f(x) = (${lin(a, b)})^${n}. Calcule f′(${S(x0)}).`, answer: num(v), hints: H("(uⁿ)′ = n·u′·uⁿ⁻¹.", `u(x) = ${lin(a, b)} et u′(x) = ${S(a)}.`, `u(${S(x0)}) = ${S(u)}.`, `f′(${S(x0)}) = ${n} × ${P(a)} × ${P(u)}^${n - 1}.`), solution: `f′(${S(x0)}) = ${n} × ${P(a)} × ${P(u)}^${n - 1} = ${S(v)}.` };
  }),
  mk("de-trigo", DE, 2, { skill: "Dérivée de cos(u) et sin(u) : −u′ sin u, u′ cos u", ref: `${BOOK}, chap. 2 §2.2 (p. 43) et ex. 2.c (p. 43)`, kw: ["dérivée", "cos u", "sin u", "composée", "trigonométrie"] }, (c, r) => {
    const a = nz(r, -3, 3);
    const t = pick(r, [["0", 0], ["π/2", Math.PI / 2], ["π", Math.PI], ["π/4", Math.PI / 4], ["π/6", Math.PI / 6]] as [string, number][]);
    const isCos = int(r, 0, 1) === 0;
    // f(x) = cos(ax)  → f′ = −a sin(ax) ; f(x)= sin(ax) → a cos(ax) ; évalué en x0 tel que a x0 = angle
    const val = isCos ? -a * Math.sin(t[1]) : a * Math.cos(t[1]);
    return { statement: `f(x) = ${isCos ? "cos" : "sin"}(${a === 1 ? "" : a === -1 ? "−" : a}x). Calcule f′(x₀) pour x₀ tel que ${a === 1 ? "" : a === -1 ? "−" : a}x₀ = ${t[0]} (arrondi au centième).`, answer: num(round(val, 2), 0.01), hints: H(isCos ? "(cos u)′ = −u′ sin u." : "(sin u)′ = u′ cos u.", `u(x) = ${a}x donc u′(x) = ${S(a)}.`, `Évalue ${isCos ? "sin" : "cos"}(${t[0]}).`, "Multiplie."), solution: `f′(x₀) = ${isCos ? `−${P(a)} × sin(${t[0]})` : `${P(a)} × cos(${t[0]})`} ≈ ${S(round(val, 2))}.` };
  }),
  mk("de-reciproque", DE, 3, { skill: "Nombre dérivé de la bijection réciproque : (f⁻¹)′(α) = 1/f′(f⁻¹(α))", ref: `${BOOK}, chap. 2 §2.3 (p. 44-45) et ex. 2.d-2.e (p. 45)`, kw: ["bijection réciproque", "dérivée de la réciproque", "1/f′(β)", "nombre dérivé"] }, (c, r) => {
    const b = int(r, 1, 4), n = pick(r, [2, 3]);
    // f(x) = x^n + b x sur ]0 ; +∞[ , β donné, α = f(β)
    const beta = int(r, 1, 3);
    const alpha = beta ** n + b * beta;
    const fp = n * beta ** (n - 1) + b;
    return { statement: `f(x) = x${n === 2 ? "²" : "³"} + ${b === 1 ? "" : b}x est une bijection de ]0 ; +∞[ sur ]0 ; +∞[. Calcule (f⁻¹)′(${alpha}) (arrondi au millième).`, answer: num(round(1 / fp, 3), 0.001), hints: H("(f⁻¹)′(α) = 1/f′(β) où β = f⁻¹(α).", `Cherche β tel que f(β) = ${alpha} : β = ${beta}.`, `f′(x) = ${n === 2 ? "2x" : "3x²"} + ${b}, donc f′(${beta}) = ${fp}.`, `1/${fp}.`), solution: `β = ${beta}, f′(${beta}) = ${fp}, donc (f⁻¹)′(${alpha}) = 1/${fp} ≈ ${fr(round(1 / fp, 3))}.` };
  }),
  mk("de-accroissements", DE, 3, { skill: "Inégalité des accroissements finis : |f(a) − f(b)| ≤ M|a − b|", ref: `${BOOK}, chap. 2 §2.5 (p. 47-48) et ex. 2.f-2.h (p. 48)`, kw: ["inégalité des accroissements finis", "majorant de la dérivée", "|f(a) − f(b)|", "encadrement"] }, (c, r) => {
    const M = int(r, 2, 9), a = int(r, 1, 6), d = int(r, 1, 5);
    return { statement: `f est dérivable sur ℝ et, pour tout réel x, |f′(x)| ≤ ${M}. Quelle est la plus grande valeur que peut prendre |f(${a + d}) − f(${a})| d'après l'inégalité des accroissements finis ?`, answer: num(M * d), hints: H("Si |f′(x)| ≤ M sur K, alors |f(a) − f(b)| ≤ M|a − b|.", `|${a + d} − ${a}| = ${d}.`, `M = ${M}.`, `${M} × ${d}.`), solution: `|f(${a + d}) − f(${a})| ≤ ${M} × ${d} = ${M * d}.` };
  }),
  mk("de-variations", DE, 2, { skill: "Sens de variation et extremum d'une fonction dérivable", ref: `${BOOK}, chap. 2 §2.5 (p. 47)`, kw: ["sens de variation", "extremum relatif", "dérivée", "changement de signe"] }, (c, r) => {
    const x0 = int(r, -4, 4), m = int(r, -6, 6);
    const a = nz(r, 1, 3) * (int(r, 0, 1) === 0 ? 1 : -1);
    // f(x) = a(x − x0)² + m : extremum m en x0
    const fx = `${term(a, "x²", true)}${term(-2 * a * x0, "x", false)}${term(a * x0 * x0 + m, "", false)}`;
    return { statement: `f(x) = ${fx}. Quel est ${a > 0 ? "le minimum" : "le maximum"} de f sur ℝ ?`, answer: num(m), hints: H("f′ s'annule en changeant de signe en l'extremum.", `f′(x) = ${term(2 * a, "x", true)}${term(-2 * a * x0, "", false)}.`, `f′(x) = 0 pour x = ${S(x0)}.`, `Calcule f(${S(x0)}).`), solution: `Extremum en x = ${S(x0)} : f(${S(x0)}) = ${S(m)}.` };
  }),
  mk("de-cours", DE, 1, { skill: "Dérivation : définitions, tableaux de dérivées (cours)", ref: `${BOOK}, chap. 2 §1-2 (p. 36-48)`, kw: ["dérivée", "tableau des dérivées", "composée", "bijection réciproque", "accroissements finis"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "(u × v)′ vaut :", good: "u′v + uv′", bad: ["u′v′", "u′v − uv′", "u′ + v′"], why: "Tableau des opérations (§2.4)." },
      { q: "(u/v)′ vaut (v ≠ 0) :", good: "(u′v − uv′)/v²", bad: ["u′/v′", "(u′v + uv′)/v²", "u′v/v²"], why: "Tableau des opérations (§2.4)." },
      { q: "(1/v)′ vaut (v ≠ 0) :", good: "−v′/v²", bad: ["1/v′", "v′/v²", "−1/v²"], why: "Tableau des opérations (§2.4)." },
      { q: "(√u)′ vaut (u > 0) :", good: "u′/(2√u)", bad: ["1/(2√u)", "u′/√u", "2u′√u"], why: "Tableau des compositions (§2.4)." },
      { q: "(tan x)′ vaut :", good: "1/cos² x", bad: ["1/sin² x", "−1/cos² x", "cos x"], why: "Tableau des dérivées (§2.4) : (tan)′ = 1 + tan² = 1/cos²." },
      { q: "(v∘u)′ vaut :", good: "u′ × (v′∘u)", bad: ["u′ × v′", "(u′∘v) × v′", "u′ + v′∘u"], why: "Dérivée d'une composée (§2.4)." },
      { q: "φ est bijective de K dans L, dérivable avec φ′(β) ≠ 0 et α = φ(β). Alors (φ⁻¹)′(α) vaut :", good: "1/φ′(β)", bad: ["φ′(β)", "−1/φ′(β)", "1/φ′(α)"], why: "Propriété du manuel (§2.3)." },
      { q: "Si |f′(x)| ≤ M sur un intervalle, alors pour a, b de cet intervalle :", good: "|f(a) − f(b)| ≤ M|a − b|", bad: ["|f(a) − f(b)| ≥ M|a − b|", "f(a) = f(b)", "f est constante"], why: "Inégalité des accroissements finis (§2.5)." },
      { q: "f est dérivable sur K. Si f′ est strictement positive sur K (sauf en des points isolés où elle s'annule), alors :", good: "f est strictement croissante sur K", bad: ["f est constante sur K", "f est strictement décroissante sur K", "f est paire"], why: "Tableau du manuel (§2.5)." },
    ];
    return qcmOf(r, pool, "Reprends les tableaux de dérivées du §2.4.");
  }, QCM),

  // ===== Chapitre 2 §3 : primitives =====
  mk("pr-verification", PR, 1, { skill: "Vérifier qu'une fonction est une primitive de f sur K", ref: `${BOOK}, chap. 2 §3.1 (p. 49-50) et ex. 3.a (p. 50)`, kw: ["primitive", "vérifier", "dérivée de F", "F′ = f"] }, (c, r) => {
    const a = nz(r, 1, 5), n = int(r, 2, 5), k = int(r, -5, 5);
    const good = int(r, 0, 1) === 0;
    // F(x) = a x^(n+1)/(n+1)... choisir f(x)=a x^n, F(x)= a x^(n+1)/(n+1) + k
    const fx = `${a}x^${n}`;
    const exp = n + 1;
    const coef = good ? `${a}/${n + 1}` : `${a}`;
    return { statement: `f(x) = ${fx}. La fonction F(x) = ${coef}·x^${exp} ${k < 0 ? "−" : "+"} ${Math.abs(k)} est-elle une primitive de f sur ℝ ?`.replace(" + 0 est", " est").replace(" − 0 est", " est"), answer: { kind: "choice", options: ["Oui", "Non"], index: good ? 0 : 1 }, hints: H("F est une primitive de f si F′ = f.", `F′(x) = ${good ? `(${a}/${n + 1}) × ${n + 1}` : `${a} × ${n + 1}`}·x^${n}.`, `Simplifie : F′(x) = ${good ? a : a * (n + 1)}x^${n}.`, "Compare avec f."), solution: good ? `F′(x) = ${a}x^${n} = f(x) : oui.` : `F′(x) = ${a * (n + 1)}x^${n} ≠ f(x) : non.` };
  }, QCM),
  mk("pr-polynome", PR, 2, { skill: "Primitive d'un polynôme prenant une valeur donnée en x₀", ref: `${BOOK}, chap. 2 §3.1 (p. 50) et ex. 3.b, 3.d (p. 50 et 54)`, kw: ["primitive", "condition initiale", "polynôme", "constante d'intégration"] }, (c, r) => {
    const a = nz(r, 1, 4), b = int(r, -4, 4), cc = int(r, -6, 6);
    const x0 = int(r, -2, 3), y0 = int(r, -6, 9);
    // f(x) = 3a x² + 2b x + c  → F(x) = a x³ + b x² + c x + k
    const G = a * x0 ** 3 + b * x0 ** 2 + cc * x0;
    const k = y0 - G;
    return { statement: `f(x) = ${term(3 * a, "x²", true)}${term(2 * b, "x", false)}${term(cc, "", false)}. Soit F la primitive de f sur ℝ qui prend la valeur ${S(y0)} en x₀ = ${S(x0)}. Quelle est la valeur de F(0) ?`, answer: num(k), hints: H("Les primitives de f sont G + k.", `G(x) = ${term(a, "x³", true)}${term(b, "x²", false)}${term(cc, "x", false)}.`, `G(${S(x0)}) + k = ${S(y0)}.`, "F(0) = G(0) + k = k."), solution: `G(${S(x0)}) = ${S(G)} donc k = ${S(y0)} − ${P(G)} = ${S(k)} et F(0) = ${S(k)}.` };
  }),
  mk("pr-composee", PR, 3, { skill: "Primitive de u′·uⁿ, u′/√u, u′/uⁿ : valeur de la constante", ref: `${BOOK}, chap. 2 §3.2 (p. 51-52) et §3.3 (p. 53)`, kw: ["primitive", "u′uⁿ", "u′/√u", "composée", "tableau des primitives"] }, (c, r) => {
    const t = int(r, 0, 2);
    const x0 = int(r, 0, 3);
    const a = nz(r, 1, 3), b = int(r, 1, 5);
    const u = a * x0 + b;
    if (t === 0) { const n = int(r, 2, 4); // f = a(ax+b)^n → F = (ax+b)^(n+1)/(n+1)
      const v = u ** (n + 1) / (n + 1);
      return { statement: `f(x) = ${a}(${lin(a, b)})^${n}. F est la primitive de f sur ℝ qui s'annule en 0 ; calcule F(${x0}) (arrondi au centième).`.replace("F(0)", "F(0)"), answer: num(round(v - b ** (n + 1) / (n + 1), 2), 0.02), hints: H("u′uⁿ a pour primitive uⁿ⁺¹/(n + 1).", `Ici u(x) = ${lin(a, b)}, u′ = ${a}.`, `G(x) = (${lin(a, b)})^${n + 1}/${n + 1}.`, "Ajuste la constante pour F(0) = 0 puis calcule F(x₀)."), solution: `F(${x0}) = G(${x0}) − G(0) = ${fr(round(v - b ** (n + 1) / (n + 1), 2))}.` }; }
    if (t === 1) { const v = 2 * Math.sqrt(a * x0 + b) - 2 * Math.sqrt(b); return { statement: `f(x) = ${a}/√(${lin(a, b)}) sur ]${bound(b, a)} ; +∞[. F est la primitive de f qui s'annule en 0 ; calcule F(${x0}) (arrondi au centième).`, answer: num(round(v, 2), 0.02), hints: H("u′/√u a pour primitive 2√u.", `u(x) = ${lin(a, b)}.`, `G(x) = 2√(${lin(a, b)}).`, "Retire G(0) pour que F(0) = 0."), solution: `F(${x0}) = 2√${u} − 2√${b} ≈ ${S(round(v, 2))}.` }; }
    const n = int(r, 2, 4); // f = u'/u^n
    const G = (x: number) => -1 / ((n - 1) * (a * x + b) ** (n - 1));
    const v = G(x0) - G(0);
    return { statement: `f(x) = ${a}/(${lin(a, b)})^${n} sur ]${bound(b, a)} ; +∞[. F est la primitive de f qui s'annule en 0 ; calcule F(${x0}) (arrondi au millième).`, answer: num(round(v, 3), 0.002), hints: H("u′/uⁿ a pour primitive −1/((n − 1)uⁿ⁻¹).", `u(x) = ${lin(a, b)}, n = ${n}.`, `G(x) = −1/(${n - 1}(${lin(a, b)})^${n - 1}).`, "F(x) = G(x) − G(0)."), solution: `F(${x0}) = G(${x0}) − G(0) ≈ ${S(round(v, 3))}.` };
  }),
  mk("pr-trigo", PR, 2, { skill: "Primitives de cos(ax + b) et sin(ax + b)", ref: `${BOOK}, chap. 2 §3.2 (p. 52) et tableau (p. 53)`, kw: ["primitive", "cos(ax+b)", "sin(ax+b)", "tableau des primitives"] }, (c, r) => {
    const a = nz(r, 1, 5);
    const isCos = int(r, 0, 1) === 0;
    return { statement: `La fonction f(x) = ${isCos ? "cos" : "sin"}(${a}x) admet pour primitives F(x) = k·${isCos ? "sin" : "cos"}(${a}x) + C. Quelle est la valeur de k (arrondi au centième) ?`, answer: num(round(isCos ? 1 / a : -1 / a, 2), 0.01), hints: H(isCos ? "(sin(ax))′ = a cos(ax)." : "(cos(ax))′ = −a sin(ax).", `Divise par ${a} pour retrouver f.`, isCos ? `k = 1/${a}.` : `k = −1/${a}.`, "Calcule."), solution: `k = ${isCos ? "" : "−"}1/${a} ≈ ${S(round(isCos ? 1 / a : -1 / a, 2))}.` };
  }),
  mk("pr-tableau", PR, 1, { skill: "Tableau des primitives usuelles", ref: `${BOOK}, chap. 2 §3.2 (p. 53)`, kw: ["primitives usuelles", "tableau des primitives", "tan x", "2√x", "−1/x"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Une primitive de x ↦ 1/√x sur ]0 ; +∞[ est :", good: "x ↦ 2√x", bad: ["x ↦ √x", "x ↦ −1/(2√x)", "x ↦ ln x"], why: "Tableau du manuel (§3.2)." },
      { q: "Une primitive de x ↦ 1/cos²x sur ]−π/2 ; π/2[ est :", good: "x ↦ tan x", bad: ["x ↦ −tan x", "x ↦ 1/sin x", "x ↦ cos x"], why: "Tableau du manuel (§3.2)." },
      { q: "Une primitive de x ↦ 1/x² sur ]0 ; +∞[ est :", good: "x ↦ −1/x", bad: ["x ↦ 1/x", "x ↦ −2/x³", "x ↦ ln x"], why: "Tableau du manuel : pour 1/xʳ, −1/((r − 1)xʳ⁻¹)." },
      { q: "Une primitive de x ↦ sin x sur ℝ est :", good: "x ↦ −cos x", bad: ["x ↦ cos x", "x ↦ −sin x", "x ↦ tan x"], why: "Tableau du manuel (§3.2)." },
      { q: "Si f est continue sur un intervalle K, alors f :", good: "admet une primitive sur K", bad: ["est dérivable sur K", "est nulle sur K", "est croissante sur K"], why: "Condition d'existence admise par le manuel (§3.1)." },
      { q: "Deux primitives d'une même fonction sur un intervalle diffèrent :", good: "d'une constante", bad: ["d'un facteur", "d'une fonction affine", "de rien (elles sont égales)"], why: "Si F est une primitive de f, les primitives de f sont F + c (§3.1)." },
      { q: "Combien de primitives de f sur K prennent la valeur y₀ en x₀ ?", good: "Une seule", bad: ["Aucune", "Deux", "Une infinité"], why: "Propriété du manuel (§3.1) : existence et unicité de la primitive avec condition initiale." },
      { q: "Une primitive de u′·uⁿ (n ≠ −1) est :", good: "uⁿ⁺¹/(n + 1)", bad: ["uⁿ", "n·uⁿ⁻¹", "uⁿ⁺¹"], why: "Tableau des opérations et compositions (§3.2)." },
    ];
    return qcmOf(r, pool, "Dérive la réponse pour vérifier.");
  }, QCM),
];
void pick;
