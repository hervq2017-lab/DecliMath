// CIAM Terminale SE (série D) : études de fonctions, logarithme, exponentielles, puissances. Pages du manuel « CIAM Terminale SE ».
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtd");
const BOOK = "CIAM Tle SE";
const EF = "Dérivabilité et étude de fonctions — série D";
const LG = "Fonctions logarithmes — série D";
const EP = "Fonctions exponentielles et fonctions puissances — série D";
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

export const TDC: Template[] = [
  // ===== Chapitre 3 : études de fonctions =====
  mk("ef-centre", EF, 3, { skill: "Centre de symétrie : (f(a + x) + f(a − x))/2 = b", ref: `${BOOK}, chap. 3 §1.1 (p. 60)`, kw: ["centre de symétrie", "(f(a+x)+f(a−x))/2", "translation", "fonction impaire"] }, (c, r) => {
    const a = int(r, -3, 3), b = int(r, -4, 4), k = nz(r, -3, 3);
    // f(x) = k (x − a)^3 + b : centre (a ; b)
    const x = int(r, 1, 4);
    const fa = k * (x) ** 3 + b, fb = -k * (x) ** 3 + b;
    return { statement: `f(x) = ${k === 1 ? "" : k === -1 ? "−" : k}(x ${a < 0 ? "+" : "−"} ${Math.abs(a)})³ ${b < 0 ? "−" : "+"} ${Math.abs(b)}. Le point Ω(${a} ; ${b}) est un centre de symétrie de la courbe. Calcule (f(${a} + ${x}) + f(${a} − ${x}))/2.`.replace("(x − 0)", "x").replace("(x + 0)", "x"), answer: num(b), hints: H("Ω(a ; b) est centre de symétrie si (f(a + x) + f(a − x))/2 = b.", `f(${a} + ${x}) = ${S(fa)}.`, `f(${a} − ${x}) = ${S(fb)}.`, "Calcule la demi-somme."), solution: `(${S(fa)} + ${P(fb)})/2 = ${S(b)}.` };
  }),
  mk("ef-axe", EF, 3, { skill: "Axe de symétrie x = a : f(a + h) = f(a − h)", ref: `${BOOK}, chap. 3 §1.1 (p. 60-61)`, kw: ["axe de symétrie", "f(a+h) = f(a−h)", "parabole"] }, (c, r) => {
    const a = int(r, -4, 4);
    const p = nz(r, 1, 3), q = int(r, -4, 4);
    const sym = int(r, 0, 1) === 0;
    // f(x) = p(x − a)² + q symétrique par rapport à x = a ; sinon on décale
    const axis = sym ? a : a + nz(r, -2, 2);
    const fx = `${term(p, "x²", true)}${term(-2 * p * a, "x", false)}${term(p * a * a + q, "", false)}`;
    return { statement: `f(x) = ${fx}. La droite d'équation x = ${S(axis)} est-elle un axe de symétrie de la courbe de f ?`, answer: { kind: "choice", options: ["Oui", "Non"], index: sym ? 0 : 1 }, hints: H("x = a est axe de symétrie si f(a − h) = f(a + h) pour tout h.", `Le sommet de la parabole est en x = ${S(a)} (abscisse −b/(2a)).`, "Un axe de symétrie d'une parabole passe par son sommet.", `Compare ${S(axis)} et ${S(a)}.`), solution: sym ? `Le sommet est en x = ${S(a)} : oui.` : `Le sommet est en x = ${S(a)} ≠ ${S(axis)} : non.` };
  }, QCM),
  mk("ef-asymptote-oblique", EF, 3, { skill: "Asymptote oblique de f(x) = (ax² + bx + c)/(x − s)", ref: `${BOOK}, chap. 3 §2 (p. 67-70)`, kw: ["asymptote oblique", "fonction rationnelle", "division euclidienne", "limite"] }, (c, r) => {
    const m = nz(r, 1, 3), p = int(r, -4, 4), q = nz(r, -6, 6), s = int(r, -3, 3);
    // f(x) = mx + p + q/(x − s) = (m x² + (p − m s) x − p s + q)/(x − s)
    const A = m, B = p - m * s, C = q - p * s;
    const ask = int(r, 0, 1) === 0;
    return { statement: `f(x) = (${quad(A, B, C)})/(x ${s < 0 ? "+" : "−"} ${Math.abs(s)}). La courbe de f admet une asymptote oblique d'équation y = ax + b. Quelle est la valeur de ${ask ? "a" : "b"} ?`.replace("(x − 0)", "x").replace("(x + 0)", "x"), answer: num(ask ? m : p), hints: H("Écris f(x) = ax + b + c′/(x − s) par division.", `Divise ${quad(A, B, C)} par (x ${s < 0 ? "+" : "−"} ${Math.abs(s)}).`, `Quotient : ${lin(m, p)}, reste : ${S(q)}.`, "Lis a et b."), solution: `f(x) = ${lin(m, p)} + ${P(q)}/(x − ${P(s)}) : a = ${S(m)}, b = ${S(p)}.` };
  }),
  mk("ef-bijection-continue", EF, 2, { skill: "Nombre de solutions de f(x) = k pour une fonction continue strictement monotone par intervalles", ref: `${BOOK}, chap. 1 §3.1 (p. 23) et chap. 3 §2`, kw: ["nombre de solutions", "tableau de variation", "f(x) = k", "bijection"] }, (c, r) => {
    const x0 = int(r, -3, 3), m = int(r, -5, 3);
    const a = pick(r, [1, 1, 2]);
    // f(x) = a(x − x0)² + m, minimum m
    const k = m + int(r, -3, 5);
    const nb = k > m ? 2 : k === m ? 1 : 0;
    return { statement: `f(x) = ${a === 1 ? "" : a}(x ${x0 < 0 ? "+" : "−"} ${Math.abs(x0)})² ${m < 0 ? "−" : "+"} ${Math.abs(m)}. Combien de solutions l'équation f(x) = ${S(k)} admet-elle dans ℝ ?`.replace("(x − 0)", "x").replace("(x + 0)", "x"), answer: num(nb), hints: H("f est strictement décroissante puis strictement croissante.", `Son minimum est ${S(m)} en x = ${S(x0)}.`, "k > minimum : deux solutions ; k = minimum : une ; k < minimum : aucune.", `k = ${S(k)}.`), solution: `Minimum ${S(m)} : ${nb} solution${nb > 1 ? "s" : ""}.` };
  }),
  mk("ef-cours", EF, 1, { skill: "Études de fonctions : transformations de courbes et symétries (cours)", ref: `${BOOK}, chap. 3 §1 (p. 59-66)`, kw: ["symétrie", "translation", "g(x) = f(x − α) + β", "centre de symétrie"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "La courbe de g(x) = −f(x) est celle de f transformée par :", good: "la symétrie orthogonale d'axe (OI)", bad: ["la symétrie orthogonale d'axe (OJ)", "la symétrie centrale de centre O", "la translation de vecteur OJ"], why: "Rappel du manuel (§1.1)." },
      { q: "La courbe de g(x) = f(−x) est celle de f transformée par :", good: "la symétrie orthogonale d'axe (OJ)", bad: ["la symétrie orthogonale d'axe (OI)", "la symétrie centrale de centre O", "la translation de vecteur OI"], why: "Rappel du manuel (§1.1)." },
      { q: "La courbe de g(x) = f(x − α) + β est celle de f transformée par :", good: "la translation de vecteur (α ; β)", bad: ["la translation de vecteur (−α ; β)", "l'homothétie de rapport α", "la symétrie de centre (α ; β)"], why: "Rappel du manuel (§1.1)." },
      { q: "Pour démontrer que A(a ; b) est un centre de symétrie, on peut montrer que :", good: "la fonction g(x) = f(x + a) − b est impaire", bad: ["f(a) = b", "f est impaire", "f′(a) = b"], why: "Première méthode du manuel (§1.1) : g est l'image de (𝒞f) par la translation de vecteur AO." },
      { q: "Pour qu'une droite x = a soit axe de symétrie, l'ensemble de définition doit :", good: "vérifier a − x ∈ D ⇔ a + x ∈ D", bad: ["contenir 0", "être ℝ tout entier", "être symétrique par rapport à 0"], why: "Méthode du manuel (§1.1) pour les axes de symétrie." },
    ];
    return qcmOf(r, pool, "Revois les transformations de courbes.");
  }, QCM),

  // ===== Chapitre 4 : logarithme népérien =====
  mk("ln-propriete", LG, 2, { skill: "Propriétés algébriques de ln : ln(ab), ln(a/b), ln(aʳ)", ref: `${BOOK}, chap. 4 §1.2 (p. 85-86) et ex. 1.b (p. 86)`, kw: ["logarithme népérien", "ln(ab) = ln a + ln b", "ln(aʳ) = r ln a", "encadrement"] }, (c, r) => {
    const p = int(r, 1, 5), q = int(r, 0, 3);
    const n = 2 ** p * 3 ** q;
    return { statement: `On donne ln 2 ≈ 0,693 et ln 3 ≈ 1,099. Donne une valeur approchée de ln ${n} (arrondie au centième).`, answer: num(round(p * 0.693 + q * 1.099, 2), 0.02), hints: H("ln(ab) = ln a + ln b ; ln(aʳ) = r ln a.", `${n} = 2^${p} × 3^${q}.`, `ln ${n} = ${p} ln 2 + ${q} ln 3.`, "Calcule."), solution: `ln ${n} ≈ ${p} × 0,693 + ${q} × 1,099 ≈ ${fr(round(p * 0.693 + q * 1.099, 2))}.` };
  }),
  mk("ln-equation", LG, 3, { skill: "Équation ln(u) = ln(v) : ensemble de validité", ref: `${BOOK}, chap. 4 §1.3 (p. 87) et ex. 1.e (p. 88)`, kw: ["équation", "ensemble de validité", "ln(u) = ln(v)", "ln est strictement croissante"] }, (c, r) => {
    const a = nz(r, -3, 3), b = int(r, 2, 8), q = int(r, -2, 8);
    let p = nz(r, -3, 3);
    if (a === p) p = a + 1 || 2;
    const x = (q - b) / (a - p);
    const ok = a * x + b > 1e-9 && p * x + q > 1e-9;
    return { statement: `Combien de solutions l'équation ln(${lin(a, b)}) = ln(${lin(p, q)}) admet-elle dans ℝ ?`, answer: num(ok ? 1 : 0), hints: H("Détermine d'abord l'ensemble de validité (arguments > 0).", "ln est strictement croissante : ln u = ln v ⇔ u = v.", `Résous ${lin(a, b)} = ${lin(p, q)} : x = ${S(round(x, 3))}.`, "Vérifie que cette valeur appartient à l'ensemble de validité."), solution: `x = ${S(round(x, 3))} : ${lin(a, b)} = ${S(round(a * x + b, 3))} et ${lin(p, q)} = ${S(round(p * x + q, 3))} ${ok ? "(> 0) : 1 solution" : "(pas tous deux > 0) : aucune solution"}.` };
  }),
  mk("ln-quotient", LG, 3, { skill: "Équation ln((x + a)/(x − b)) = 1", ref: `${BOOK}, chap. 4 §1.3 (p. 87) exemple 2`, kw: ["équation", "ln d'un quotient", "ln e = 1", "ensemble de validité"] }, (c, r) => {
    const a = int(r, 1, 4), b = int(r, 1, 4);
    // ln((x+a)/(x−b)) = 1 → x + a = e(x − b) → x = (a + e b)/(e − 1)
    const x = (a + Math.E * b) / (Math.E - 1);
    return { statement: `Résous dans ℝ l'équation ln((x + ${a})/(x − ${b})) = 1. La solution est (arrondie au centième) :`, answer: num(round(x, 2), 0.02), hints: H("1 = ln e.", "(x + a)/(x − b) = e.", `x + ${a} = e(x − ${b}), soit x(e − 1) = ${a} + ${b}e.`, `x = (${a} + ${b}e)/(e − 1).`), solution: `x = (${a} + ${b}e)/(e − 1) ≈ ${S(round(x, 2))} ; on vérifie que (x + ${a})/(x − ${b}) > 0.` };
  }),
  mk("ln-inequation", LG, 3, { skill: "Inéquation ln(u) < ln(v) : domaine puis comparaison des arguments", ref: `${BOOK}, chap. 4 §1.3 (p. 87-88) et ex. 1.e (p. 88)`, kw: ["inéquation", "ln", "ensemble de validité", "intersection"] }, (c, r) => {
    const a = int(r, 1, 3), b = int(r, 1, 6), q = int(r, 1, 6);
    let p = int(r, 1, 3);
    if (a === p) p = a + 1;
    let n = 0;
    for (let x = -10; x <= 10; x++) if (a * x + b > 0 && p * x + q > 0 && a * x + b < p * x + q) n++;
    return { statement: `Combien d'entiers x vérifient ln(${lin(a, b)}) < ln(${lin(p, q)}) avec −10 ≤ x ≤ 10 ?`, answer: num(n), hints: H("Domaine : les deux arguments doivent être strictement positifs.", "ln est strictement croissante : ln u < ln v ⇔ u < v.", `${lin(a, b)} < ${lin(p, q)} ⇔ ${term(a - p, "x", true)} < ${S(q - b)}.`, "Intersecte avec le domaine et compte les entiers."), solution: `${n} entier${n > 1 ? "s" : ""}.` };
  }),
  mk("ln-cours", LG, 1, { skill: "Logarithme népérien : définition et propriétés (cours)", ref: `${BOOK}, chap. 4 §1 (p. 82-88)`, kw: ["logarithme népérien", "primitive de 1/x", "ln(ab)", "bijection", "e"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Le logarithme népérien est :", good: "la primitive sur ]0 ; +∞[ de x ↦ 1/x qui s'annule en 1", bad: ["la dérivée de x ↦ 1/x", "la fonction x ↦ 10ˣ", "la primitive de x ↦ x qui s'annule en 0"], why: "Définition du manuel (§1.1)." },
      { q: "Quel est l'ensemble de définition de ln ?", good: "]0 ; +∞[", bad: ["ℝ", "[0 ; +∞[", "ℝ*"], why: "Tableau récapitulatif (§1.2)." },
      { q: "Pour a, b > 0, ln(a/b) vaut :", good: "ln a − ln b", bad: ["ln a / ln b", "ln a + ln b", "ln(a − b)"], why: "Propriété du manuel (§1.2)." },
      { q: "Pour a > 0 et r rationnel, ln(aʳ) vaut :", good: "r ln a", bad: ["(ln a)ʳ", "ln a + r", "a ln r"], why: "Propriété (4) du manuel (§1.2)." },
      { q: "ln a < 0 équivaut (a > 0) à :", good: "a < 1", bad: ["a > 1", "a < 0", "a = 1"], why: "Variations de ln (§1.2)." },
      { q: "ln est :", good: "une bijection strictement croissante de ]0 ; +∞[ dans ℝ", bad: ["une bijection de ℝ dans ℝ", "strictement décroissante", "une fonction paire"], why: "Tableau récapitulatif (§1.2)." },
      { q: "Pour résoudre ln(u) = ln(v), on commence par :", good: "déterminer l'ensemble de validité (u > 0 et v > 0)", bad: ["dériver u et v", "prendre l'exponentielle", "poser u = v sans condition"], why: "Méthode du manuel (§1.3)." },
    ];
    return qcmOf(r, pool, "Revois le tableau récapitulatif de ln.");
  }, QCM),

  // ===== Chapitre 5 : exponentielle népérienne =====
  mk("ex-simplification", EP, 1, { skill: "Simplifier une écriture avec exp et ln", ref: `${BOOK}, chap. 5 §1.1 et ex. 1.a (p. 107)`, kw: ["exponentielle", "e^(ln a)", "ln(eˣ)", "simplifier"] }, (c, r) => {
    const a = int(r, 2, 9), b = int(r, 2, 9);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Simplifie e^(ln ${a} + ln ${b}). Quelle valeur obtient-on ?`, answer: num(a * b), hints: H("e^(x + y) = eˣ × eʸ.", "e^(ln a) = a.", `${a} × ${b}.`, "Calcule."), solution: `e^(ln ${a}) × e^(ln ${b}) = ${a * b}.` };
    if (t === 1) return { statement: `Simplifie e^(ln ${a} − ln ${b}) (arrondi au centième).`, answer: num(round(a / b, 2), 0.01), hints: H("e^(x − y) = eˣ/eʸ.", "e^(ln a) = a.", `${a}/${b}.`, "Calcule."), solution: `${a}/${b} ≈ ${fr(round(a / b, 2))}.` };
    return { statement: `Simplifie ln(e^${a}) − ln(e^${b}).`, answer: num(a - b), hints: H("ln(eˣ) = x.", `ln(e^${a}) = ${a}.`, `ln(e^${b}) = ${b}.`, "Soustrais."), solution: `${a} − ${b} = ${a - b}.` };
  }),
  mk("ex-equation-simple", EP, 2, { skill: "Équation e^(x − a) = k et inéquation e^(x − a) < k", ref: `${BOOK}, chap. 5 §1.2 (p. 108)`, kw: ["équation", "exponentielle", "ln", "e^(x−a) = k", "inéquation"] }, (c, r) => {
    const a = int(r, -3, 5), k = int(r, 2, 9);
    const x = a + Math.log(k);
    return { statement: `Résous dans ℝ l'équation e^(x ${a < 0 ? "+" : "−"} ${Math.abs(a)}) = ${k}. Donne la solution arrondie au centième.`.replace("(x − 0)", "x"), answer: num(round(x, 2), 0.02), hints: H("Prends le logarithme népérien des deux membres.", `x ${a < 0 ? "+" : "−"} ${Math.abs(a)} = ln ${k}.`, `x = ${S(a)} + ln ${k}.`, `ln ${k} ≈ ${fr(round(Math.log(k), 3))}.`), solution: `x = ${S(a)} + ln ${k} ≈ ${S(round(x, 2))}.` };
  }),
  mk("ex-second-degre", EP, 3, { skill: "Équation (eˣ)² + b eˣ + c = 0 : inconnue auxiliaire X = eˣ", ref: `${BOOK}, chap. 5 §1.2 (p. 108) et ex. 1.i`, kw: ["équation polynomiale en eˣ", "inconnue auxiliaire", "X = eˣ", "second degré"] }, (c, r) => {
    const X1 = int(r, 1, 6), k = int(r, 1, 5);
    const b = k - X1, cc = -k * X1;
    return { statement: `Résous dans ℝ l'équation e^(2x) ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}eˣ ${cc < 0 ? "−" : "+"} ${Math.abs(cc)} = 0. Donne la solution arrondie au centième.`.replace("+ 0eˣ", ""), answer: num(round(Math.log(X1), 2), 0.02), hints: H("Pose X = eˣ avec X > 0.", `X² ${b < 0 ? "−" : "+"} ${Math.abs(b)}X ${cc < 0 ? "−" : "+"} ${Math.abs(cc)} = 0 admet les solutions ${X1} et −${k}.`, "eˣ > 0 : on élimine la solution négative.", `eˣ = ${X1}.`), solution: `x = ln ${X1} ≈ ${S(round(Math.log(X1), 2))}.` };
  }),

  // ===== Chapitre 6 : fonctions exponentielles de base a et puissances =====
  mk("ep-puissance", EP, 2, { skill: "Puissance réelle aᵅ = e^(α ln a)", ref: `${BOOK}, chap. 6 §1 (p. 124)`, kw: ["puissance réelle", "aᵅ", "e^(α ln a)", "exposant réel"] }, (c, r) => {
    const a = pick(r, [2, 3, 5, 10]), al = pick(r, [0.5, 1.5, 2.5, -1, -0.5, 0.3]);
    const v = a ** al;
    return { statement: `Calcule ${a}^${fr(al).replace("−", "−")} (arrondi au centième).`.replace(`^${fr(al)}`, `^(${S(al)})`), answer: num(round(v, 2), 0.02), hints: H("aᵅ = e^(α ln a) pour a > 0.", `ln ${a} ≈ ${fr(round(Math.log(a), 4))}.`, `α ln a ≈ ${fr(round(al * Math.log(a), 4))}.`, "Prends l'exponentielle."), solution: `${a}^(${S(al)}) = e^(${fr(round(al * Math.log(a), 4))}) ≈ ${S(round(v, 2))}.` };
  }),
  mk("ep-base-a", EP, 2, { skill: "Sens de variation de x ↦ aˣ selon a", ref: `${BOOK}, chap. 6 §2.1 (p. 125) et §2.2 (p. 127)`, kw: ["fonction exponentielle de base a", "croissante", "décroissante", "ln a"] }, (c, r) => {
    const a = pick(r, [0.2, 0.5, 0.8, 1.5, 2, 3, 10]);
    const inc = a > 1;
    return { statement: `La fonction x ↦ ${fr(a)}ˣ est-elle croissante ou décroissante sur ℝ ?`, answer: { kind: "choice", options: ["Croissante", "Décroissante"], index: inc ? 0 : 1 }, hints: H("(aˣ)′ = ln a × aˣ.", "aˣ > 0 : le signe de la dérivée est celui de ln a.", `ln ${fr(a)} ${inc ? "> 0" : "< 0"}.`, "Conclus."), solution: `${fr(a)} ${inc ? "> 1 : croissante" : "< 1 : décroissante"}.` };
  }, QCM),
  mk("ep-equation-base", EP, 3, { skill: "Équation aˣ = b : x = ln b / ln a", ref: `${BOOK}, chap. 6 §2.1 (p. 126) et ex. 2.a (p. 126)`, kw: ["équation exponentielle", "logarithme", "aˣ = b", "ln b / ln a"] }, (c, r) => {
    const a = pick(r, [2, 3, 5, 7]), b = int(r, 2, 40);
    const x = Math.log(b) / Math.log(a);
    return { statement: `Résous dans ℝ l'équation ${a}^x = ${b}. Donne la solution arrondie au centième.`, answer: num(round(x, 2), 0.02), hints: H("Prends le logarithme népérien des deux membres.", `x ln ${a} = ln ${b}.`, `x = ln ${b} / ln ${a}.`, `ln ${b} ≈ ${fr(round(Math.log(b), 3))} et ln ${a} ≈ ${fr(round(Math.log(a), 3))}.`), solution: `x = ln ${b}/ln ${a} ≈ ${S(round(x, 2))}.` };
  }),
  mk("ep-puissance-fonction", EP, 2, { skill: "Fonction puissance fₐ : x ↦ xᵅ, sens de variation selon le signe de α", ref: `${BOOK}, chap. 6 §3.1 (p. 128)`, kw: ["fonction puissance", "xᵅ", "bijection de ℝ₊*", "croissante", "décroissante"] }, (c, r) => {
    const al = pick(r, [-3, -1, -0.5, 0.5, 1.5, 2, 3, 0.25]);
    const inc = al > 0;
    return { statement: `La fonction x ↦ x^(${S(al)}) est-elle croissante ou décroissante sur ]0 ; +∞[ ?`, answer: { kind: "choice", options: ["Croissante", "Décroissante"], index: inc ? 0 : 1 }, hints: H("Si α > 0, fₐ est strictement croissante ; si α < 0, elle est strictement décroissante.", `α = ${S(al)}.`, "Le signe de α donne le sens de variation.", "Conclus."), solution: `α ${inc ? "> 0 : croissante" : "< 0 : décroissante"}.` };
  }, QCM),
  mk("ep-cours", EP, 1, { skill: "Exponentielles et puissances : définitions et propriétés (cours)", ref: `${BOOK}, chap. 5-6 (p. 105-131)`, kw: ["exponentielle", "puissance réelle", "aˣ", "xᵅ", "bijection"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "La fonction exp est :", good: "la bijection réciproque de ln", bad: ["la dérivée de ln", "égale à ln", "la fonction x ↦ 2ˣ"], why: "Tableau récapitulatif (chap. 5 §1)." },
      { q: "Pour tout réel x, eˣ est :", good: "strictement positif", bad: ["négatif ou nul", "supérieur à 1", "égal à x + 1"], why: "Tableau récapitulatif : eˣ > 0." },
      { q: "e^(a + b) vaut :", good: "eᵃ × eᵇ", bad: ["eᵃ + eᵇ", "eᵃᵇ", "eᵃ/eᵇ"], why: "Propriétés algébriques de exp." },
      { q: "Pour a > 0 et α réel, aᵅ est défini par :", good: "aᵅ = e^(α ln a)", bad: ["aᵅ = α ln a", "aᵅ = a + α", "aᵅ = eᵅ ln a"], why: "Définition du manuel (chap. 6 §1)." },
      { q: "Pour a > 1, la fonction x ↦ aˣ est :", good: "strictement croissante sur ℝ", bad: ["strictement décroissante", "constante", "paire"], why: "Propriété du manuel (chap. 6 §2.1)." },
      { q: "Pour 0 < a < 1, aˣ → ? quand x → +∞ :", good: "0", bad: ["+∞", "1", "a"], why: "Limites du manuel (chap. 6 §2.2)." },
      { q: "(aˣ)′ vaut :", good: "ln a × aˣ", bad: ["aˣ", "x aˣ⁻¹", "a ln x"], why: "Dérivée du manuel (chap. 6 §2.2)." },
      { q: "Pour α ≠ 0, fₐ : x ↦ xᵅ est une bijection de ]0 ; +∞[ dans :", good: "]0 ; +∞[", bad: ["ℝ", "[0 ; +∞[", "]−∞ ; 0["], why: "Propriété du manuel (chap. 6 §3.1)." },
    ];
    return qcmOf(r, pool, "Pense à aᵅ = e^(α ln a).");
  }, QCM),
];
