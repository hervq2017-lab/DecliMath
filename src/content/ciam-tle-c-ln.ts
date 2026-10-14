// CIAM Terminale SM (série C) : chapitre 11 §2-4, Fonction logarithme népérien, fonctions comportant ln, logarithme décimal.
// Énoncés originaux, réponses calculées par le code. Les démonstrations et tracés ne se corrigent pas automatiquement :
// on en garde les propriétés algébriques, équations, inéquations, limites, dérivées, primitives, étude et applications.
import { fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf, sup } from "./ciam-kit";

const mk = ciam("tle", "ciamtn");
const BOOK = "CIAM Terminale SM";
const LN = "Fonctions logarithmes — série C";
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
/** (ln x)² + S ln x + P rédigé proprement, avec X = ln x. */
const quad = (S: number, P: number, v = "ln x") => `(ln x)²${S === 0 ? "" : ` ${S < 0 ? "−" : "+"} ${Math.abs(S) === 1 ? "" : `${Math.abs(S)} `}${v}`}${P === 0 ? "" : ` ${P < 0 ? "−" : "+"} ${Math.abs(P)}`}`;
const pl = (a: number) => `x ${a < 0 ? "−" : "+"} ${Math.abs(a)}`;

export const TC_LN: Template[] = [
  mk("ln-proprietes", LN, 2, { skill: "Propriétés algébriques : ln(ab) = ln a + ln b, ln(a/b), ln aʳ = r ln a", ref: `${BOOK}, chap. 11 §2.1, propriété fondamentale et autres propriétés (p. 240-241) et ex. 2.a (p. 244)`, kw: ["ln(ab)", "ln(a/b)", "ln aʳ = r ln a", "propriétés algébriques", "exprimer en fonction de ln 2 et ln 3"] }, (_c, r) => {
    let a = 0, b = 0; while (a === 0 && b === 0 || (Math.abs(a) < 2 && Math.abs(b) < 2 && a * b === 0)) { a = int(r, -3, 4); b = int(r, -3, 3); }
    const nu = 2 ** Math.max(a, 0) * 3 ** Math.max(b, 0), de = 2 ** Math.max(-a, 0) * 3 ** Math.max(-b, 0), wantA = int(r, 0, 1) === 0;
    const w = de === 1 ? `${nu}` : `${nu}/${de}`;
    return { statement: `On écrit ln(${w}) = α ln 2 + β ln 3 avec α et β entiers relatifs. Quelle est la valeur de ${wantA ? "α" : "β"} ?`, answer: num(wantA ? a : b), hints: H("Décompose le nombre en produit de puissances de 2 et de 3.", `${w} = 2^${a} × 3^${b}.`, "Utilise ln(ab) = ln a + ln b et ln aⁿ = n ln a.", wantA ? "α est l'exposant de 2." : "β est l'exposant de 3."), solution: `${w} = 2^${par(a)} × 3^${par(b)}, donc ln(${w}) = ${n2(a)} ln 2 + ${n2(b)} ln 3.` };
  }, FR),
  mk("ln-equation-produit", LN, 3, { skill: "Équation ln(x + a) + ln(x + b) = ln c : contraintes sur l'inconnue puis équation du second degré", ref: `${BOOK}, chap. 11 §2.3, travaux dirigés « Résolutions d'équations » (p. 243) et ex. 2.b, 2.c (p. 244)`, kw: ["équation avec logarithmes", "contraintes sur l'inconnue", "ln a = ln b", "ensemble de définition", "solution à rejeter"] }, (_c, r) => {
    const x1 = int(r, 1, 5), a = int(r, 1, 4), b = int(r, 1, 4), c = (x1 + a) * (x1 + b);
    return { statement: `Résous dans ℝ : ln(${pl(a)}) + ln(${pl(b)}) = ln ${c}. Quelle est la solution (il y en a une seule) ?`, answer: num(x1), hints: H("Contraintes : les deux arguments doivent être strictement positifs.", `Ici x > ${-Math.min(a, b)}.`, `On obtient (${pl(a)})(${pl(b)}) = ${c}, équation du second degré.`, "Garde la racine qui respecte les contraintes."), solution: `x² + ${a + b}x + ${a * b - c} = 0 a pour racines ${x1} et ${-(a + b) - x1} ; seule ${x1} convient.` };
  }, FR),
  mk("ln-equation-changement", LN, 3, { skill: "Équation (ln x)² − (p + q) ln x + pq = 0 : changement d'inconnue X = ln x", ref: `${BOOK}, chap. 11 §2.3, résolution d'équations (3) et (4) (p. 243) et ex. 2.b (p. 244)`, kw: ["changement d'inconnue", "X = ln x", "(ln x)²", "équation du second degré", "ensemble des solutions"] }, (_c, r) => {
    const p = int(r, -3, 1), q = p + int(r, 1, 3), wantMax = int(r, 0, 1) === 0, v = Math.exp(wantMax ? q : p);
    return { statement: `Résous dans ]0 ; +∞[ : ${quad(-(p + q), p * q)} = 0. Quelle est la ${wantMax ? "plus grande" : "plus petite"} solution (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H("Pose X = ln x.", `${quad(-(p + q), p * q, "X").replace("(ln x)²", "X²")} = 0 a pour racines ${n2(p)} et ${n2(q)}.`, "Reviens à x = e^X.", `La ${wantMax ? "plus grande" : "plus petite"} racine en X est ${n2(wantMax ? q : p)}.`), solution: `x = e^${par(p)} ≈ ${n2(r2(Math.exp(p)))} ou x = e^${par(q)} ≈ ${n2(r2(Math.exp(q)))}.` };
  }, FR),
  mk("ln-inequation-produit", LN, 3, { skill: "Inéquation ln x + ln(x + a) < ln b : ensemble de définition puis second degré", ref: `${BOOK}, chap. 11 §2.3, résolution d'inéquations (1), (2) (p. 243) et ex. 2.e (p. 244)`, kw: ["inéquation avec logarithmes", "contraintes sur l'inconnue", "ln a < ln b", "croissance de ln", "ensemble des solutions"] }, (_c, r) => {
    const a = int(r, 1, 4), k = int(r, 1, 4), b = k * (k + a);
    return { statement: `Résous dans ℝ : ln x + ln(${pl(a)}) < ln ${b}. L'ensemble des solutions est ]0 ; s[ : quelle est la valeur de s ?`, answer: num(k), hints: H("Contraintes : x > 0 et x + a > 0, donc x > 0.", "ln est croissante : ln u < ln v équivaut à u < v.", `x(${pl(a)}) < ${b} donne x² + ${a}x − ${b} < 0.`, "Cherche la racine positive."), solution: `x² + ${a}x − ${b} = (x − ${k})(x + ${k + a}) < 0 avec x > 0 donne 0 < x < ${k} : s = ${k}.` };
  }, FR),
  mk("ln-inequation-changement", LN, 3, { skill: "Inéquation du second degré en ln x : bornes e^s et e^t", ref: `${BOOK}, chap. 11 §2.3, résolution d'inéquations (3) et (4) (p. 244) et ex. 2.e (p. 244)`, kw: ["inéquation", "changement d'inconnue X = ln x", "(ln x)² + … ≤ 0", "intervalle solution", "e^t"] }, (_c, r) => {
    const s = int(r, -4, 1), t = s + int(r, 1, 4), S = s + t, P = s * t;
    return { statement: `Résous dans ]0 ; +∞[ : ${quad(-S, P)} ≤ 0. L'ensemble des solutions est [a ; b] : quelle est la valeur de b (arrondie au centième) ?`, answer: num(r2(Math.exp(t)), 0.01), hints: H("Pose X = ln x.", `${quad(-S, P, "X").replace("(ln x)²", "X²")} ≤ 0 : X est entre les racines ${n2(s)} et ${n2(t)}.`, `${n2(s)} ≤ ln x ≤ ${n2(t)}.`, "Applique l'exponentielle, qui est croissante."), solution: `e^${par(s)} ≤ x ≤ e^${par(t)} : b = e^${par(t)} ≈ ${n2(r2(Math.exp(t)))}.` };
  }, FR),
  mk("ln-limite-usuelle", LN, 2, { skill: "Limites usuelles : ln(1 + ax)/(bx) en 0, ln x/(x − 1) en 1", ref: `${BOOK}, chap. 11 §2.2, propriétés 2 (p. 241) et ex. 2.f (p. 244)`, kw: ["limite de ln(1 + x)/x", "ln x/(x − 1)", "nombre dérivé de ln en 1", "limite en 0"] }, (_c, r) => {
    const a = nz(r, -4, 4), b = int(r, 1, 4), t = int(r, 0, 1);
    if (t === 0) return { statement: `Quelle est la limite en 0 de f(x) = ln(1 + ${a === 1 ? "" : a === -1 ? "−" : a}x) / (${b === 1 ? "" : b}x) (arrondie au centième) ?`, answer: num(r2(a / b), 0.01), hints: H("Utilise lim ln(1 + u)/u = 1 quand u tend vers 0.", `Écris ln(1 + ${n2(a)}x)/(${b}x) = [ln(1 + ${n2(a)}x)/(${n2(a)}x)] × ${n2(a)}/${b}.`, "Le premier facteur tend vers 1.", "Calcule."), solution: `La limite est ${n2(a)}/${b} ≈ ${n2(r2(a / b))}.` };
    return { statement: `Quelle est la limite en 1 de f(x) = ln x / ${b === 1 ? "(x − 1)" : `${b}(x − 1)`} (arrondie au centième) ?`, answer: num(r2(1 / b), 0.01), hints: H("lim ln x/(x − 1) = 1 quand x tend vers 1 (nombre dérivé de ln en 1).", `Écris f(x) = (1/${b}) × ln x/(x − 1).`, "Le quotient tend vers 1.", "Calcule."), solution: `La limite est 1/${b} ≈ ${n2(r2(1 / b))}.` };
  }, FR),
  mk("ln-limite-infini", LN, 2, { skill: "Croissances comparées : ln x/x, x ln x, forme (ln x)/xⁿ", ref: `${BOOK}, chap. 11 §2.2, propriétés 3 et 4, limites aux bornes (p. 241-242) et ex. 2.f (p. 244)`, kw: ["limite de ln x/x", "x ln x", "limite en +∞", "limite en 0", "croissances comparées"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Quelle est la limite de ln x quand x tend vers +∞ ?", good: "+∞", bad: ["0", "1", "−∞"], why: "Propriété 3." },
      { q: "Quelle est la limite de ln x quand x tend vers 0 par valeurs supérieures ?", good: "−∞", bad: ["+∞", "0", "1"], why: "Propriété 3." },
      { q: "Quelle est la limite de (ln x)/x quand x tend vers +∞ ?", good: "0", bad: ["+∞", "1", "−∞"], why: "Propriété 4." },
      { q: "Quelle est la limite de x ln x quand x tend vers 0 par valeurs supérieures ?", good: "0", bad: ["−∞", "+∞", "1"], why: "Propriété 4." },
      { q: "Quelle est la limite de x − ln x quand x tend vers +∞ ?", good: "+∞", bad: ["−∞", "0", "1"], why: "x − ln x = x(1 − ln x/x), et ln x/x tend vers 0." },
      { q: "Quelle est la limite de √x ln x quand x tend vers 0 par valeurs supérieures ?", good: "0", bad: ["−∞", "+∞", "1"], why: "Avec u = √x, on a √x ln x = 2 u ln u qui tend vers 0." },
    ];
    return qcmOf(r, T, "Souviens-toi des limites usuelles de ln.");
  }, QCM),
  mk("ln-derivee-composee", LN, 2, { skill: "Dérivée de ln u : (ln u)′ = u′/u", ref: `${BOOK}, chap. 11 §3.1, dérivée de ln∘u (p. 245) et ex. 3.a, 3.b (p. 247)`, kw: ["(ln u)′ = u′/u", "dérivée de ln∘u", "u strictement positive", "dérivabilité"] }, (_c, r) => {
    const p = int(r, -4, 4), q = int(r, 1, 6), x0 = int(r, -3, 3), u = x0 * x0 + p * x0 + q;
    if (u <= 0) return { statement: "Soit f(x) = ln x. Quelle est la valeur de f′(4) (arrondie au centième) ?", answer: num(0.25, 0.01), hints: H("(ln x)′ = 1/x.", "x = 4.", "1/4.", "Calcule."), solution: "f′(4) = 1/4 = 0,25." };
    const v = (2 * x0 + p) / u;
    return { statement: `Soit f(x) = ln(${pol([1, p, q])}) (définie en ${n2(x0)}). Quelle est la valeur de f′(${n2(x0)}) (arrondie au centième) ?`, answer: num(r2(v), 0.01), hints: H("(ln u)′ = u′/u.", `u′(x) = ${pol([2, p])}.`, `u(${n2(x0)}) = ${u}.`, "Calcule le quotient."), solution: `f′(${n2(x0)}) = ${n2(2 * x0 + p)}/${u} ≈ ${n2(r2(v))}.` };
  }, FR),
  mk("ln-primitive-quotient", LN, 3, { skill: "Primitive de u′/u : ln|u|", ref: `${BOOK}, chap. 11 §3.1, primitives de u′/u (p. 245) et ex. 3.c (p. 247)`, kw: ["primitive de u′/u", "ln|u|", "u ne s'annule pas", "intervalle"] }, (_c, r) => {
    const p = int(r, -3, 3), q = int(r, 2, 6), x0 = int(r, 0, 2), x1 = x0 + int(r, 1, 3), u = (x: number) => x * x + p * x + q;
    if (u(x0) <= 0 || u(x1) <= 0) return { statement: "F est la primitive sur ]0 ; +∞[ de f(x) = 1/x telle que F(1) = 0. Quelle est la valeur de F(e) ?", answer: num(1), hints: H("Une primitive de 1/x est ln x.", "F(1) = 0 : ln 1 = 0.", "F = ln.", "ln e = 1."), solution: "F(e) = ln e = 1." };
    const val = Math.log(u(x1) / u(x0));
    return { statement: `F est la primitive sur ℝ de f(x) = (${pol([2, p])}) / (${pol([1, p, q])}) telle que F(${x0}) = 0 (le dénominateur est strictement positif). Quelle est la valeur de F(${x1}) (arrondie au centième) ?`, answer: num(r2(val), 0.01), hints: H("f est de la forme u′/u.", "Une primitive est ln u, car u > 0.", `F(x) = ln u(x) − ln u(${x0}).`, "Calcule le quotient."), solution: `F(${x1}) = ln(${u(x1)}/${u(x0)}) ≈ ${n2(r2(val))}.` };
  }, FR),
  mk("ln-nombre-e", LN, 2, { skill: "Le nombre e : ln e = 1, tangente en x = eᵏ à la courbe de ln", ref: `${BOOK}, chap. 11 §2.2, le nombre e et courbe représentative de ln (p. 242)`, kw: ["nombre e", "ln e = 1", "tangente à la courbe de ln", "ln eʳ = r", "bijection"] }, (_c, r) => {
    const k = nz(r, -4, 4);
    return { statement: `La tangente à la courbe de ln au point d'abscisse e^${par(k)} a pour équation y = mx + p. Quelle est la valeur de p ?`, answer: num(k - 1), hints: H("La tangente en a est y = (1/a)(x − a) + ln a.", `Ici a = e^${par(k)} et ln a = ${n2(k)}.`, "p = ln a − 1.", "Calcule."), solution: `p = ${n2(k)} − 1 = ${n2(k - 1)}.` };
  }, FR),
  mk("ln-etude-extremum", LN, 3, { skill: "Étude de f(x) = (ln x)² − 2k ln x + m : minimum atteint en x = eᵏ", ref: `${BOOK}, chap. 11 §3.2, étude de x ↦ −1 + (ln x)² (p. 245-246) et ex. 3.f (p. 247)`, kw: ["tableau de variation", "minimum", "(ln x)²", "dérivée", "étude de fonction"] }, (_c, r) => {
    const k = int(r, -2, 3), m = int(r, -4, 4);
    return { statement: `Soit f(x) = ${quad(-2 * k, m)} sur ]0 ; +∞[. Quelle est la valeur minimale de f ?`, answer: num(m - k * k), hints: H("f′(x) = (2 ln x − " + 2 * k + ")/x.", `f′ s'annule pour ln x = ${n2(k)}, soit x = e^${par(k)}.`, "f′ est négative avant et positive après : c'est un minimum.", `Calcule f(e^${par(k)}) = ${k * k} − ${2 * k * k} + ${m}.`), solution: `Minimum f(e^${par(k)}) = ${k * k} ${-2 * k * k < 0 ? "−" : "+"} ${Math.abs(2 * k * k)} ${m < 0 ? "−" : "+"} ${Math.abs(m)} = ${n2(m - k * k)}.` };
  }, FR),
  mk("ln-ensemble-definition", LN, 2, { skill: "Ensemble de définition de ln(ax + b) et ln(x² − k²)", ref: `${BOOK}, chap. 11 §3.2, étude de fonctions comportant ln (p. 245-246) et ex. 3.a (p. 247)`, kw: ["ensemble de définition", "argument strictement positif", "ln(ax + b)", "ln(x² − k²)"] }, (_c, r) => {
    if (int(r, 0, 1) === 0) {
      const a = int(r, 1, 4), b = nz(r, -8, 8);
      return { statement: `La fonction f(x) = ln(${a === 1 ? "" : a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}) est définie sur ]x₀ ; +∞[. Quelle est la valeur de x₀ (arrondie au centième) ?`, answer: num(r2(-b / a), 0.01), hints: H("L'argument du logarithme doit être strictement positif.", `${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} > 0.`, `x > ${n2(-b)}/${a}.`, "Calcule."), solution: `x₀ = ${n2(-b)}/${a} ≈ ${n2(r2(-b / a))}.` };
    }
    const k = int(r, 1, 6);
    return { statement: `La fonction f(x) = ln(x² − ${k * k}) est définie sur ]−∞ ; −c[ ∪ ]c ; +∞[. Quelle est la valeur de c ?`, answer: num(k), hints: H("Il faut x² − " + k * k + " > 0.", `x² > ${k * k}.`, "Donc |x| > c.", "Prends la racine carrée."), solution: `x² > ${k * k} donne |x| > ${k} : c = ${k}.` };
  }, FR),
  mk("ln-decimal-chiffres", LN, 3, { skill: "Logarithme décimal : nombre de chiffres de 2ᵐ, n = 1 + E(log p)", ref: `${BOOK}, chap. 11 §4.2, utilisation du logarithme décimal en arithmétique (p. 248)`, kw: ["logarithme décimal", "nombre de chiffres", "partie entière", "log 2 ≈ 0,30103", "log(aⁿ) = n log a"] }, (_c, r) => {
    const m = int(r, 10, 100), d = Math.floor(m * Math.log10(2)) + 1;
    return { statement: `Avec log 2 ≈ 0,30103, combien de chiffres s'écrit 2^${m} ?`, answer: num(d), hints: H("Un entier p de n chiffres vérifie n = 1 + E(log p).", `log 2^${m} = ${m} log 2.`, `${m} × 0,30103 ≈ ${fr(r2(m * 0.30103))}.`, "Prends la partie entière et ajoute 1."), solution: `log 2^${m} ≈ ${fr(r2(m * 0.30103))}, donc ${d} chiffres.` };
  }, FR),
  mk("ln-decimal-ph", LN, 2, { skill: "pH = −log[H₃O⁺] : calcul du pH d'une solution", ref: `${BOOK}, chap. 11 §4.2, utilisation du logarithme décimal en chimie (p. 248)`, kw: ["pH", "logarithme décimal", "concentration", "−log[H₃O⁺]", "solution acide"] }, (_c, r) => {
    const k = int(r, 1, 6), c = pick(r, [2, 3, 5]), pH = k - Math.log10(c);
    return { statement: `La concentration en ions H₃O⁺ d'une solution est ${c} × 10${"⁻"}${sup(k)} mol/L. Quel est son pH (arrondi au centième) ? On rappelle pH = −log[H₃O⁺].`, answer: num(r2(pH), 0.01), hints: H("Utilise log(ab) = log a + log b.", `log(${c} × 10^−${k}) = log ${c} − ${k}.`, `log ${c} ≈ ${fr(r2(Math.log10(c)))}.`, "pH = −(log c − k)."), solution: `pH = ${k} − log ${c} ≈ ${n2(r2(pH))}.` };
  }, FR),
  mk("ln-simplification-radicaux", LN, 3, { skill: "Simplifier ln(√a + √b) + ln(√a − √b) = ln(a − b)", ref: `${BOOK}, chap. 11 §2.1, propriété fondamentale (p. 240) et ex. 12 (p. 250)`, kw: ["simplifier une somme de logarithmes", "ln(ab) = ln a + ln b", "identité remarquable", "quantité conjuguée"] }, (_c, r) => {
    const a = int(r, 3, 12), b = int(r, 1, a - 1);
    return { statement: `Simplifie ln(√${a} + √${b}) + ln(√${a} − √${b}) en un seul logarithme ln(k). Quelle est la valeur de k ?`, answer: num(a - b), hints: H("Utilise ln u + ln v = ln(uv).", `(√${a} + √${b})(√${a} − √${b}) est de la forme (A + B)(A − B).`, "C'est A² − B².", "Calcule."), solution: `ln[(√${a})² − (√${b})²] = ln(${a} − ${b}) = ln ${a - b} : k = ${a - b}.` };
  }, FR),
  mk("ln-inequation-affine", LN, 2, { skill: "Inéquation ln(ax − b) > c : contrainte puis passage à l'exponentielle", ref: `${BOOK}, chap. 11 §2.2, ln a < ln b équivaut à a < b (p. 241) et ex. 25 (p. 251)`, kw: ["inéquation", "ln(ax − b) > c", "croissance de ln", "e^c", "contraintes sur l'inconnue"] }, (_c, r) => {
    const a = int(r, 1, 4), b = int(r, -5, 5), c = int(r, -1, 2), x0 = (Math.exp(c) + b) / a;
    const eb = `e${c === 1 ? "" : `^${par(c)}`}`, top = b === 0 ? eb : `${eb} ${b < 0 ? "−" : "+"} ${Math.abs(b)}`, fa = a === 1 ? top : `(${top})/${a}`;
    return { statement: `Résous dans ℝ : ln(${a === 1 ? "" : a}x${b === 0 ? "" : ` ${-b < 0 ? "−" : "+"} ${Math.abs(b)}`}) > ${n2(c)}. L'ensemble des solutions est ]s ; +∞[ : quelle est la valeur de s (arrondie au centième) ?`, answer: num(r2(x0), 0.01), hints: H("ln(u) > c équivaut à u > e^c, car ln est croissante.", `Ici ${a === 1 ? "" : a}x${b === 0 ? "" : ` ${-b < 0 ? "−" : "+"} ${Math.abs(b)}`} > ${eb}.`, "Isole x.", "Calcule."), solution: `x > ${fa} : s ≈ ${n2(r2(x0))}.` };
  }, FR),
  mk("ln-base-a", LN, 3, { skill: "Logarithme de base a : f_a(x) = ln x/ln a, f_a(aⁿ) = n", ref: `${BOOK}, chap. 11, fonction logarithme de base a (ex. 46, p. 253)`, kw: ["logarithme de base a", "ln x/ln a", "f_a(aⁿ) = n", "log₂", "changement de base"] }, (_c, r) => {
    const a = pick(r, [2, 3, 5, 10]), n = int(r, 1, 6), mul = int(r, 0, 1) === 0;
    if (mul) return { statement: `On note f_${a}(x) = ln x / ln ${a}. Quelle est la valeur de f_${a}(${a ** n})?`.replace("?", " ?"), answer: num(n), hints: H(`f_${a}(x) = ln x / ln ${a}.`, `${a ** n} = ${a}^${n}.`, `ln(${a}^${n}) = ${n} ln ${a}.`, "Simplifie."), solution: `f_${a}(${a ** n}) = ${n} ln ${a} / ln ${a} = ${n}.` };
    const k = int(r, 1, 4), e = int(r, 2, 5);
    return { statement: `On note f_${a}(x) = ln x / ln ${a}. On sait que f_${a}(x) = ${k} pour un certain x > 0. Quelle est la valeur de f_${a}(x${sup(e)}) ?`, answer: num(e * k), hints: H("f_a(xⁿ) = n f_a(x).", `Ici n = ${e}.`, `f_${a}(x) = ${k}.`, `Calcule ${e} × ${k}.`), solution: `f_${a}(x${sup(e)}) = ${e} × ${k} = ${e * k}.` };
  }, FR),
  mk("ln-cours", LN, 1, { skill: "Cours : définition de ln, propriétés, variations, nombre e, logarithme décimal", ref: `${BOOK}, chap. 11 §2-4, cours (p. 239-249)`, kw: ["logarithme népérien", "ln(ab) = ln a + ln b", "ln e = 1", "log x = ln x/ln 10", "(ln u)′ = u′/u"] }, (_c, r) => {
    const T: Item[] = [
      { q: "ln est la primitive de x ↦ 1/x sur ]0 ; +∞[ qui…", good: "s'annule en 1", bad: ["s'annule en e", "vaut 1 en 0", "vaut e en 1"], why: "Définition." },
      { q: "Pour a, b > 0, ln(ab) vaut…", good: "ln a + ln b", bad: ["ln a × ln b", "ln a − ln b", "(ln a)(ln b)"], why: "Propriété fondamentale." },
      { q: "Pour a > 0 et r rationnel, ln aʳ vaut…", good: "r ln a", bad: ["(ln a)ʳ", "ln a + r", "r + ln a"], why: "Propriété (3)." },
      { q: "ln x > 0 équivaut à…", good: "x > 1", bad: ["x > 0", "x > e", "0 < x < 1"], why: "ln est croissante et ln 1 = 0." },
      { q: "e est l'unique réel tel que…", good: "ln e = 1", bad: ["ln e = 0", "ln 1 = e", "e ln e = 1"], why: "Définition de e." },
      { q: "Si u > 0 est dérivable, (ln u)′ vaut…", good: "u′/u", bad: ["1/u", "u/u′", "u′ ln u"], why: "Dérivée de ln∘u." },
      { q: "Le logarithme décimal log x est égal à…", good: "ln x / ln 10", bad: ["ln x × ln 10", "ln 10 / ln x", "x / ln 10"], why: "Définition." },
      { q: "Quelle est la valeur de log 1000 ?", good: "3", bad: ["10", "1000", "2"], why: "log 10ʳ = r." },
    ];
    return qcmOf(r, T, "Reprends la définition et les propriétés.");
  }, QCM),
];
