// CIAM Terminale Littéraire (séries A1/A2) : fonctions polynômes et rationnelles, logarithme et exponentielle.
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtl");
const BOOK = "CIAM Terminale Littéraire";
const PR = "Étude de fonctions polynômes et de fonctions rationnelles — série A1";
const LN = "Fonction logarithme népérien — série A1";
const EX = "Fonction exponentielle népérienne — série A1";
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

export const TLA: Template[] = [
  // ===== Chapitre 3 : fonctions polynômes, fonctions rationnelles =====
  mk("pr-extremum", PR, 3, { skill: "Étude d'une fonction polynôme de degré 3 : valeur d'un extremum", ref: `${BOOK}, chap. 3 §1 (p. 36-39)`, kw: ["fonction polynôme", "dérivée", "tableau de variation", "extremum", "degré 3"] }, (c, r) => {
    const q = int(r, 1, 3), k = int(r, -4, 4);
    const wantMax = int(r, 0, 1) === 0;
    const v = wantMax ? k + 2 * q ** 3 : k - 2 * q ** 3;
    const poly = `x³ − ${3 * q * q}x${k === 0 ? "" : ` ${k < 0 ? "−" : "+"} ${Math.abs(k)}`}`;
    return { statement: `f(x) = ${poly}. Quel est le ${wantMax ? "maximum" : "minimum"} relatif de f ?`, answer: num(v), hints: H("Calcule la dérivée f′ et dresse son signe.", `f′(x) = 3x² − ${3 * q * q} = 3(x − ${q})(x + ${q}).`, `f′ change de signe en −${q} (puis en ${q}) : le maximum est en −${q}, le minimum en ${q}.`, `Calcule f(${wantMax ? `−${q}` : q}).`), solution: `${wantMax ? `f(−${q})` : `f(${q})`} = ${S(v)}.` };
  }),
  mk("pr-derivee-poly", PR, 1, { skill: "Dérivée d'un polynôme en un point (sens de variation)", ref: `${BOOK}, chap. 3 §1.1 (p. 36-39)`, kw: ["dérivée", "polynôme", "sens de variation", "nombre dérivé"] }, (c, r) => {
    const a = nz(r, -3, 3), b = int(r, -4, 4), cc = nz(r, -4, 4), d = int(r, -5, 5), x0 = int(r, -3, 3);
    const v = 3 * a * x0 * x0 + 2 * b * x0 + cc;
    return { statement: `f(x) = ${term(a, "x³", true)}${term(b, "x²", false)}${term(cc, "x", false)}${term(d, "", false)}. Calcule f′(${S(x0)}).`, answer: num(v), hints: H("(xⁿ)′ = n·xⁿ⁻¹.", `f′(x) = ${term(3 * a, "x²", true)}${term(2 * b, "x", false)}${term(cc, "", false)}.`, `Remplace x par ${S(x0)}.`, "Calcule."), solution: `f′(${S(x0)}) = ${S(v)}.` };
  }),
  mk("pr-asymptotes", PR, 2, { skill: "Asymptotes d'une fonction homographique f(x) = (ax + b)/(cx + d)", ref: `${BOOK}, chap. 3 §2.1 (p. 40-42)`, kw: ["asymptote horizontale", "asymptote verticale", "limite", "fonction rationnelle"] }, (c, r) => {
    const cc = nz(r, 1, 3), d = int(r, -6, 6);
    let a = nz(r, -4, 4), b = int(r, -6, 6);
    while (a * d - b * cc === 0) b += 1;
    const horiz = int(r, 0, 1) === 0;
    const v = horiz ? a / cc : -d / cc;
    return { statement: `La courbe de f(x) = (${lin(a, b)})/(${lin(cc, d)}) admet une asymptote ${horiz ? "horizontale d'équation y = k" : "verticale d'équation x = k"}. Quelle est la valeur de k ? (arrondi au centième)`, answer: num(round(v, 2), 0.01), hints: horiz ? H("Calcule la limite de f en +∞ (quotient des termes de plus haut degré).", "En l'infini, f(x) ≈ ax/(cx).", `Limite : a/c = ${a}/${cc}.`, "Calcule.") : H("L'asymptote verticale est en la valeur interdite (le dénominateur s'annule).", `${lin(cc, d)} = 0.`, `x = ${S(-d)}/${cc}.`, "Calcule."), solution: horiz ? `lim f = ${a}/${cc} ≈ ${S(round(v, 2))} : y = ${S(round(v, 2))}.` : `Le dénominateur s'annule en x = ${S(-d)}/${cc} ≈ ${S(round(v, 2))}.` };
  }),
  mk("pr-oblique", PR, 3, { skill: "Asymptote oblique : f(x) = mx + p + q/(x − s)", ref: `${BOOK}, chap. 3 §2.1 (p. 42) et §2.2 (p. 42-44)`, kw: ["asymptote oblique", "limite de f(x) − (ax + b)", "position relative", "fonction rationnelle"] }, (c, r) => {
    const m = nz(r, -2, 3), p = int(r, -4, 4), q = nz(r, -5, 5), s = nz(r, -3, 3);
    const ask = int(r, 0, 1);
    const L = ask === 0 ? m : p;
    return { statement: `f(x) = ${term(m, "x", true)}${term(p, "", false)} + ${q < 0 ? `(−${-q})` : q}/(x ${s < 0 ? "+" : "−"} ${Math.abs(s)}). La droite (Δ) : y = ax + b est asymptote oblique à la courbe de f. Quelle est la valeur de ${ask === 0 ? "a" : "b"} ?`, answer: num(L), hints: H("Si lim [f(x) − (ax + b)] = 0 en ±∞, la droite y = ax + b est asymptote oblique.", "Ici le terme q/(x − s) tend vers 0 en ±∞.", `f(x) − (${term(m, "x", true)}${term(p, "", false)}) = q/(x − s) → 0.`, "Lis a et b."), solution: `a = ${S(m)} et b = ${S(p)}.` };
  }),
  mk("pr-position", PR, 3, { skill: "Position relative de la courbe et de son asymptote oblique (signe de q/(x − s))", ref: `${BOOK}, chap. 3 §2.2, exemple f(x) = x + 2 − 4/(x − 1) (p. 43)`, kw: ["position relative", "asymptote oblique", "signe de f(x) − (ax + b)", "au-dessus", "au-dessous"] }, (c, r) => {
    const q = nz(r, -5, 5), s = nz(r, -3, 3);
    const x = s + (r() < 0.5 ? int(r, 1, 4) : -int(r, 1, 4));
    const diff = q / (x - s);
    const m = nz(r, 1, 2), p = int(r, -3, 3);
    return { statement: `f(x) = ${term(m, "x", true)}${term(p, "", false)} + ${q < 0 ? `(−${-q})` : q}/(x ${s < 0 ? "+" : "−"} ${Math.abs(s)}). Pour x = ${S(x)}, la courbe de f est-elle au-dessus ou au-dessous de son asymptote oblique y = ${lin(m, p)} ?`, answer: { kind: "choice", options: ["Au-dessus", "Au-dessous"], index: diff > 0 ? 0 : 1 }, hints: H("Étudie le signe de f(x) − (mx + p).", `f(x) − (mx + p) = q/(x − s) = ${S(q)}/(${S(x)} − ${P(s)}).`, `x − s = ${S(x - s)}.`, "Si la différence est positive, la courbe est au-dessus."), solution: `f(x) − (mx + p) = ${S(q)}/${P(x - s)} = ${S(round(diff, 3))} ${diff > 0 ? "> 0 : au-dessus" : "< 0 : au-dessous"}.` };
  }, QCM),
  mk("pr-centre", PR, 3, { skill: "Centre de symétrie d'une hyperbole f(x) = mx + p + q/(x − s)", ref: `${BOOK}, chap. 3 §2.2, exemples (p. 43-44)`, kw: ["centre de symétrie", "intersection des asymptotes", "hyperbole", "fonction rationnelle"] }, (c, r) => {
    const m = nz(r, 1, 3), p = int(r, -4, 4), q = nz(r, -5, 5), s = nz(r, -3, 3);
    const ox = int(r, 0, 1) === 0;
    const v = ox ? s : m * s + p;
    return { statement: `f(x) = ${term(m, "x", true)}${term(p, "", false)} + ${q < 0 ? `(−${-q})` : q}/(x ${s < 0 ? "+" : "−"} ${Math.abs(s)}). Le point Ω, intersection de l'asymptote verticale et de l'asymptote oblique, est un centre de symétrie de la courbe. Quelle est ${ox ? "l'abscisse" : "l'ordonnée"} de Ω ?`, answer: num(v), hints: H("L'asymptote verticale est x = s ; l'asymptote oblique est y = mx + p.", `s = ${S(s)}.`, ox ? "L'abscisse de Ω est s." : `L'ordonnée de Ω est m·s + p = ${m} × ${P(s)} + ${P(p)}.`, "Calcule."), solution: ox ? `Ω a pour abscisse ${S(s)}.` : `Ω a pour ordonnée ${m} × ${P(s)} + ${P(p)} = ${S(m * s + p)}.` };
  }),
  mk("pr-variation", PR, 2, { skill: "Sens de variation d'une fonction homographique (signe de ad − bc)", ref: `${BOOK}, chap. 3 §2.1 (p. 42-44)`, kw: ["fonction homographique", "dérivée", "sens de variation", "ad − bc"] }, (c, r) => {
    const cc = nz(r, 1, 3), d = int(r, -5, 5), a = nz(r, -4, 4);
    let b = int(r, -5, 5);
    if (a * d - b * cc === 0) b += 1;
    const det = a * d - b * cc;
    return { statement: `f(x) = (${lin(a, b)})/(${lin(cc, d)}). Sur chacun des intervalles de son ensemble de définition, la fonction f est-elle croissante ou décroissante ?`, answer: { kind: "choice", options: ["Croissante", "Décroissante"], index: det > 0 ? 0 : 1 }, hints: H("f′(x) = (ad − bc)/(cx + d)².", `ad − bc = ${a} × ${P(d)} − ${P(b)} × ${cc} = ${det}.`, "Le dénominateur (cx + d)² est positif.", "Le signe de f′ est celui de ad − bc."), solution: `f′(x) = ${S(det)}/(cx + d)² est ${det > 0 ? "positive : f est croissante" : "négative : f est décroissante"} sur chaque intervalle.` };
  }, QCM),
  mk("pr-cours", PR, 1, { skill: "Fonctions polynômes et rationnelles : parité, asymptotes, étude (cours)", ref: `${BOOK}, chap. 3 (p. 35-45)`, kw: ["asymptote", "polynôme", "fonction rationnelle", "parité", "axe de symétrie"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Si lim f(x) = l (réel) quand x tend vers +∞ ou −∞, la droite d'équation y = l est :", good: "une asymptote horizontale à la courbe", bad: ["une asymptote verticale", "un axe de symétrie", "une tangente en l'origine"], why: "Définition du manuel (§2.1)." },
      { q: "Si f tend vers +∞ ou −∞ quand x tend vers x₀, la droite d'équation x = x₀ est :", good: "une asymptote verticale à la courbe", bad: ["une asymptote horizontale", "une tangente", "un centre de symétrie"], why: "Définition du manuel (§2.1)." },
      { q: "La droite y = ax + b est asymptote oblique à la courbe de f si :", good: "lim [f(x) − (ax + b)] = 0 en +∞ ou en −∞", bad: ["f(x) = ax + b", "lim f(x) = a", "f′(x) = a"], why: "Définition du manuel (§2.1, asymptotes obliques)." },
      { q: "f est paire. Que peut-on dire de la droite (OJ) pour la courbe ?", good: "C'est un axe de symétrie", bad: ["C'est une asymptote", "C'est une tangente", "C'est un centre de symétrie"], why: "Exemple du manuel (§1.2) : f(−x) = f(x) donc (OJ) est un axe de symétrie." },
      { q: "Pour étudier la position relative de deux courbes de f et g, on étudie :", good: "le signe de f(x) − g(x)", bad: ["le signe de f(x) + g(x)", "le signe de f′(x) − g′(x)", "les limites de f et g"], why: "Méthode du manuel (§1.1) : f(x) − g(x) < 0 : (𝒞f) est au-dessous de (𝒞g)." },
      { q: "Pour démontrer que Ω(a ; b) est un centre de symétrie de la courbe de f, on peut montrer que :", good: "(f(a − h) + f(a + h))/2 = b pour tout h convenable", bad: ["f(a) = b seulement", "f′(a) = b", "f(a + h) = f(a − h)"], why: "Méthode du manuel (§2.2) : on calcule (f(1 − h) + f(1 + h))/2 pour Ω(1 ; 3)." },
    ];
    return qcmOf(r, pool, "Relis les définitions d'asymptote.");
  }, QCM),

  // ===== Chapitre 4 : logarithme et exponentielle =====
  mk("ln-valeur", LN, 2, { skill: "Propriétés algébriques de ln : ln(ab) = ln a + ln b, ln(aⁿ) = n ln a", ref: `${BOOK}, chap. 4 §1.2 (p. 59)`, kw: ["logarithme népérien", "ln(ab)", "ln(a/b)", "ln(aⁿ)", "propriétés algébriques"] }, (c, r) => {
    const p = int(r, 1, 5), q = int(r, 0, 3), rr = int(r, 0, 2);
    const n = 2 ** p * 3 ** q * 5 ** rr;
    return { statement: `On donne ln 2 ≈ 0,693 ; ln 3 ≈ 1,099 ; ln 5 ≈ 1,609. Sans calculatrice, exprime ln ${n} à l'aide de ces valeurs et donne-le arrondi au centième.`, answer: num(round(0.693 * p + 1.099 * q + 1.609 * rr, 2), 0.02), hints: H("Décompose le nombre en produit de puissances de 2, 3 et 5.", `${n} = 2^${p} × 3^${q} × 5^${rr}.`, "ln(aⁿ) = n·ln a et ln(ab) = ln a + ln b.", `${p} × 0,693 + ${q} × 1,099 + ${rr} × 1,609.`), solution: `ln ${n} = ${p} ln 2 + ${q} ln 3 + ${rr} ln 5 ≈ ${fr(round(0.693 * p + 1.099 * q + 1.609 * rr, 2))}.` };
  }),
  mk("ln-domaine", LN, 1, { skill: "Ensemble de définition de ln(ax + b)", ref: `${BOOK}, chap. 4 §1.1 et §3.1 (p. 58 et 68-69)`, kw: ["ensemble de définition", "ln(ax+b)", "ax + b > 0", "condition d'existence"] }, (c, r) => {
    const a = nz(r, -5, 5), b = int(r, -8, 8);
    const bound = -b / a;
    const lowerB = a > 0;
    return { statement: `f(x) = ln(${lin(a, b)}). L'ensemble de définition de f est ${lowerB ? "]k ; +∞[" : "]−∞ ; k["}. Quelle est la valeur de k ? (arrondi au centième)`, answer: num(round(bound, 2), 0.01), hints: H("ln n'est défini que pour les réels strictement positifs.", `Résous ${lin(a, b)} > 0.`, `x ${lowerB ? ">" : "<"} ${S(-b)}/${P(a)}.`, "Calcule."), solution: `${lin(a, b)} > 0 ⇔ x ${lowerB ? ">" : "<"} ${S(round(bound, 2))}, donc k = ${S(round(bound, 2))}.` };
  }),
  mk("ln-derivee", LN, 2, { skill: "Dérivée de x ↦ ln(ax + b) : a/(ax + b)", ref: `${BOOK}, chap. 4 §3.1 (p. 68)`, kw: ["dérivée", "ln(ax+b)", "a/(ax+b)", "sens de variation"] }, (c, r) => {
    const a = nz(r, -4, 4), b = int(r, -4, 6);
    const x0 = a > 0 ? Math.floor(-b / a) + int(r, 1, 5) : Math.ceil(-b / a) - int(r, 1, 5);
    const v = a / (a * x0 + b);
    return { statement: `f(x) = ln(${lin(a, b)}). Calcule f′(${S(x0)}) (arrondi au centième).`, answer: num(round(v, 2), 0.01), hints: H("(ln(ax + b))′ = a/(ax + b).", `Ici a = ${a} et b = ${b}.`, `ax₀ + b = ${a * x0 + b}.`, "Divise."), solution: `f′(x) = ${a}/(${lin(a, b)}), donc f′(${S(x0)}) = ${a}/${a * x0 + b} ≈ ${S(round(v, 2))}.` };
  }),
  mk("ln-equation", LN, 3, { skill: "Résoudre une équation avec ln : condition d'existence et vérification", ref: `${BOOK}, chap. 4 §1.4 (p. 61-62)`, kw: ["équation", "logarithme", "ensemble de définition", "ln a = ln b"] }, (c, r) => {
    const t = int(r, 0, 1);
    if (t === 0) { const p = int(r, 1, 5), k = int(r, 2, 12); const x = k - p; const ok = x + p > 0; return { statement: `Résous dans ℝ l'équation ln(x + ${p}) = ln ${k}. Quelle est la solution ?`, answer: num(x), hints: H("Condition : x + p > 0.", "ln a = ln b ⇔ a = b (a, b > 0).", `x + ${p} = ${k}.`, "Vérifie la condition."), solution: `x = ${k} − ${p} = ${x} ${ok ? "(vérifie x + p > 0)" : ""}.` }; }
    const p = int(r, 0, 4), q = int(r, 1, 5), rr = int(r, 6, 24);
    // ln(x+p) + ln(x+q) = ln r  ⇔ (x+p)(x+q) = r , avec x > -min(p,q)
    const b = p + q, cc = p * q - rr;
    const D = b * b - 4 * cc;
    const sols: number[] = [];
    if (D >= 0) for (const x of D === 0 ? [-b / 2] : [(-b - Math.sqrt(D)) / 2, (-b + Math.sqrt(D)) / 2]) if (x + p > 1e-9 && x + q > 1e-9) sols.push(round(x, 6));
    return { statement: `Combien de solutions l'équation ln(x + ${p === 0 ? "" : p}${p === 0 ? "" : ""}) + ln(x + ${q}) = ln ${rr} admet-elle dans ℝ ?`.replace("ln(x + )", "ln x"), answer: num(sols.length), hints: H("Détermine d'abord l'ensemble des x pour lesquels l'équation est définie.", "ln a + ln b = ln(ab) : on obtient (x + p)(x + q) = r.", `Développe : x² + ${b}x + ${cc} = 0 (discriminant ${D}).`, "Ne garde que les solutions qui appartiennent à l'ensemble de définition."), solution: `On garde ${sols.length} solution${sols.length > 1 ? "s" : ""} dans l'ensemble de définition.` };
  }),
  mk("ln-inequation", LN, 3, { skill: "Inéquation qⁿ < k avec logarithme : plus grand entier solution", ref: `${BOOK}, chap. 4 §1.4 (p. 62-63)`, kw: ["inéquation", "qⁿ < k", "logarithme", "entier naturel"] }, (c, r) => {
    const q = pick(r, [1.1, 1.2, 1.5, 2, 3]), k = int(r, 10, 200);
    let n = 0;
    while (q ** (n + 1) < k) n++;
    return { statement: `Quel est le plus grand entier naturel n tel que ${fr(q)}ⁿ < ${k} ?`, answer: num(n), hints: H("Prends le logarithme des deux membres : n ln q < ln k.", `ln ${fr(q)} > 0 : on peut diviser sans changer le sens.`, `n < ln ${k} / ln ${fr(q)} ≈ ${fr(round(Math.log(k) / Math.log(q), 2))}.`, "Prends le plus grand entier strictement inférieur."), solution: `n < ${fr(round(Math.log(k) / Math.log(q), 2))} : n = ${n}.` };
  }),
  mk("ln-cours", LN, 1, { skill: "Logarithme népérien : propriétés et limites (cours)", ref: `${BOOK}, chap. 4 §1 (p. 57-63)`, kw: ["logarithme népérien", "ln", "limite", "dérivée", "nombre e"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle égalité est vraie pour tous réels a, b strictement positifs ?", good: "ln(a × b) = ln a + ln b", bad: ["ln(a + b) = ln a × ln b", "ln(a × b) = ln a × ln b", "ln(a + b) = ln a + ln b"], why: "Propriété fondamentale du manuel (§1.2)." },
      { q: "Que vaut ln(1/a) pour a > 0 ?", good: "−ln a", bad: ["1/ln a", "ln a", "−1/ln a"], why: "Conséquence de la propriété fondamentale (§1.2)." },
      { q: "Quelle est la dérivée de ln sur ]0 ; +∞[ ?", good: "x ↦ 1/x", bad: ["x ↦ ln x", "x ↦ x", "x ↦ −1/x²"], why: "Propriété du manuel (§1.3)." },
      { q: "Quelle est la limite de ln x quand x tend vers 0 par valeurs positives ?", good: "−∞", bad: ["0", "+∞", "1"], why: "Propriété du manuel (§1.3)." },
      { q: "Quelle est la limite de (ln x)/x quand x tend vers +∞ ?", good: "0", bad: ["1", "+∞", "−∞"], why: "Limite remarquable du manuel (§1.3)." },
      { q: "Que vaut ln 1 ?", good: "0", bad: ["1", "e", "Non défini"], why: "ln 1 = 0 (ln est croissante sur ]0 ; +∞[ et s'annule en 1)." },
      { q: "Quel est le signe de ln a pour 0 < a < 1 ?", good: "ln a < 0", bad: ["ln a > 0", "ln a = 0", "On ne peut pas savoir"], why: "Remarque du manuel (§1.3) : ln a < 0 ⇔ 0 < a < 1." },
      { q: "Le nombre e est défini par :", good: "ln e = 1", bad: ["e = 10", "ln e = 0", "e = 3"], why: "Définition du manuel (§1.3)." },
    ];
    return qcmOf(r, pool, "Pense à la propriété fondamentale de ln.");
  }, QCM),
  mk("ex-valeur", EX, 2, { skill: "Propriétés de exp : e^(ln a) = a, e^(a+b) = eᵃ × eᵇ", ref: `${BOOK}, chap. 4 §2.1-2.2 (p. 64-65)`, kw: ["exponentielle", "eᵃ⁺ᵇ", "e^(ln a)", "propriétés"] }, (c, r) => {
    const q = int(r, 2, 9), p = int(r, 1, 3);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Simplifie e^(${p} + ln ${q}) sous la forme k × eᵖ. Quelle est la valeur de k ?`, answer: num(q), hints: H("e^(a + b) = eᵃ × eᵇ.", `e^(${p} + ln ${q}) = e^${p} × e^(ln ${q}).`, "e^(ln q) = q pour q > 0.", `k = ${q}.`), solution: `e^(${p} + ln ${q}) = ${q}·e^${p} : k = ${q}.` };
    return { statement: `Calcule e^(${p} ln ${q}) (arrondi au centième).`, answer: num(round(q ** p, 2), 0.01), hints: H("e^(p ln q) = e^(ln qᵖ).", "e^(ln a) = a pour a > 0.", `qᵖ = ${q}^${p}.`, "Calcule."), solution: `e^(${p} ln ${q}) = ${q}^${p} = ${q ** p}.` };
  }),
  mk("ex-equation", EX, 3, { skill: "Équation avec exp : poser X = eˣ", ref: `${BOOK}, chap. 5 §3.1 (p. 86-87)`, kw: ["équation", "exponentielle", "X = eˣ", "second degré"] }, (c, r) => {
    const X1 = int(r, 1, 6), k = int(r, 1, 6);
    // (X − X1)(X + k) = 0 : X² + (k − X1)X − kX1 = 0 avec X = eˣ ; solution X = X1 → x = ln X1
    const b = k - X1, cc = -k * X1;
    const x = Math.log(X1);
    return { statement: `Résous dans ℝ l'équation e^(2x) ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}eˣ ${cc < 0 ? "−" : "+"} ${Math.abs(cc)} = 0. Donne la solution arrondie au centième.`.replace(" + 0eˣ", "").replace("+ 0eˣ", ""), answer: num(round(x, 2), 0.01), hints: H("Pose X = eˣ (avec X > 0).", `X² ${b < 0 ? "−" : "+"} ${Math.abs(b)}X ${cc < 0 ? "−" : "+"} ${Math.abs(cc)} = 0 se factorise en (X − ${X1})(X + ${k}).`, `Seule la solution positive convient : X = ${X1}.`, `x = ln ${X1}.`), solution: `eˣ = ${X1} donne x = ln ${X1} ≈ ${S(round(x, 2))}.` };
  }),
  mk("ex-derivee", EX, 2, { skill: "Dérivée de e^(ax + b) et limites de exp", ref: `${BOOK}, chap. 4 §2.3 (p. 66)`, kw: ["dérivée", "exponentielle", "e^(ax+b)", "sens de variation"] }, (c, r) => {
    const a = nz(r, -3, 3), b = int(r, -2, 2), x0 = int(r, -1, 2);
    const v = a * Math.exp(a * x0 + b);
    return { statement: `f(x) = e^(${lin(a, b)}). Calcule f′(${S(x0)}) (arrondi au centième).`, answer: num(round(v, 2), 0.02), hints: H("(e^(ax + b))′ = a·e^(ax + b).", `a = ${a}.`, `e^(${a * x0 + b}) ≈ ${fr(round(Math.exp(a * x0 + b), 3))}.`, "Multiplie par a."), solution: `f′(${S(x0)}) = ${a} × e^(${a * x0 + b}) ≈ ${S(round(v, 2))}.` };
  }),
  mk("ex-cours", EX, 1, { skill: "Exponentielle népérienne : définition, propriétés, limites (cours)", ref: `${BOOK}, chap. 4 §2 (p. 63-66)`, kw: ["exponentielle", "eˣ", "réciproque de ln", "limite", "dérivée"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "L'exponentielle népérienne est :", good: "la fonction réciproque de la fonction logarithme népérien", bad: ["la dérivée de ln", "la fonction x ↦ 10ˣ", "la fonction x ↦ x²"], why: "Définition du manuel (§2.1)." },
      { q: "Pour tout réel x, eˣ est :", good: "strictement positif", bad: ["négatif", "nul pour x = 0", "égal à x + 1"], why: "Propriété immédiate du manuel (§2.1) : eᵃ > 0." },
      { q: "Que vaut eᵃ⁺ᵇ ?", good: "eᵃ × eᵇ", bad: ["eᵃ + eᵇ", "eᵃ × b", "eᵃᵇ"], why: "Propriété fondamentale du manuel (§2.2)." },
      { q: "Que vaut ln(eᵃ) ?", good: "a", bad: ["eᵃ", "1", "ln a"], why: "Propriétés immédiates du manuel (§2.1)." },
      { q: "Que vaut e^(ln a) pour a > 0 ?", good: "a", bad: ["ln a", "1", "e"], why: "Propriétés immédiates du manuel (§2.1)." },
      { q: "Quelle est la dérivée de exp ?", good: "exp elle-même", bad: ["ln", "x ↦ x·eˣ⁻¹", "x ↦ 1/eˣ"], why: "Propriété du manuel (§2.3) : la fonction exponentielle est égale à sa dérivée." },
      { q: "Quelle est la limite de eˣ quand x tend vers −∞ ?", good: "0", bad: ["−∞", "+∞", "1"], why: "Propriété du manuel (§2.3)." },
      { q: "Quelle est la limite de eˣ/x quand x tend vers +∞ ?", good: "+∞", bad: ["0", "1", "e"], why: "Limite remarquable du manuel (§2.3)." },
    ];
    return qcmOf(r, pool, "Pense à exp comme réciproque de ln.");
  }, QCM),
];
