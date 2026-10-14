// CIAM Première S : second degré (équations, inéquations, problèmes) et systèmes linéaires.
import { fr, gcd, int, num, pick, Template } from "./core";
import { ciam, H, Item, PUR, QCM, qcmOf, WHO } from "./ciam-kit";

const mk = ciam("1ere", "ciam1");
const BOOK = "CIAM 1ère S";
const SD = "Équations et inéquations du second degré dans ℝ — série C";
const SL = "Systèmes d'équations linéaires dans ℝ² et dans ℝ³ — série C";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const term = (a: number, v: string, first: boolean) => {
  if (a === 0) return "";
  const m = Math.abs(a) === 1 && v !== "" ? "" : String(Math.abs(a));
  return first ? `${a < 0 ? "−" : ""}${m}${v}` : ` ${a < 0 ? "−" : "+"} ${m}${v}`;
};
/** Trinôme ax² + bx + c écrit proprement. */
const quad = (a: number, b: number, c: number, v = "x") => {
  const parts = [term(a, `${v}²`, true), term(b, v, a === 0), term(c, "", a === 0 && b === 0)];
  return parts.join("") || "0";
};
const nz = (r: () => number, lo: number, hi: number) => { let v = 0; while (v === 0) v = lo + Math.floor(r() * (hi - lo + 1)); return v; };
const det3 = (m: number[][]) =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

export const T1D: Template[] = [
  // ===== Chapitre 10 §1 : second degré =====
  mk("sd-discriminant", SD, 1, { skill: "Calculer le discriminant Δ = b² − 4ac", ref: `${BOOK}, chap. 10 §1.1 (p. 184-185) et ex. 1.a (p. 190)`, kw: ["discriminant", "Δ", "second degré", "b² − 4ac"] }, (c, r) => {
    const a = nz(r, -5, 5), b = int(r, -9, 9), cc = int(r, -9, 9);
    const d = b * b - 4 * a * cc;
    return { statement: `Calcule le discriminant Δ du polynôme P(x) = ${quad(a, b, cc)}.`, answer: num(d), hints: H("Δ = b² − 4ac.", `a = ${a}, b = ${b}, c = ${cc}.`, `b² = ${b * b} et 4ac = ${4 * a * cc}.`, "Soustrais."), solution: `Δ = ${b * b} − ${P(4 * a * cc)} = ${S(d)}.` };
  }),
  mk("sd-nb-racines", SD, 1, { skill: "Nombre de solutions de ax² + bx + c = 0 selon le signe de Δ", ref: `${BOOK}, chap. 10 §1.1, propriété et vocabulaire (p. 184-185)`, kw: ["nombre de solutions", "discriminant", "racine double", "pas de solution"] }, (c, r) => {
    const a = nz(r, -4, 4), b = int(r, -8, 8);
    const kind = int(r, 0, 2);
    let cc: number;
    if (kind === 0) { const s = int(r, 1, 4); cc = a < 0 ? Math.ceil((b * b) / (4 * a)) + s : Math.floor((b * b) / (4 * a)) + 0; } else if (kind === 1) { cc = 0; } else { cc = int(r, -6, 6); }
    let b2 = b, c2 = cc;
    if (kind === 1) { b2 = 2 * a * int(r, -3, 3); c2 = (b2 * b2) / (4 * a); }
    const d = b2 * b2 - 4 * a * c2;
    const n = d < 0 ? 0 : d === 0 ? 1 : 2;
    return { statement: `Combien de solutions réelles l'équation ${quad(a, b2, c2)} = 0 admet-elle ?`, answer: { kind: "choice", options: ["Aucune", "Une (solution double)", "Deux solutions distinctes"], index: n }, hints: H("Calcule Δ = b² − 4ac.", `Δ = ${b2 * b2} − ${P(4 * a * c2)}.`, "Δ < 0 : aucune ; Δ = 0 : une ; Δ > 0 : deux.", `Δ = ${S(d)}.`), solution: `Δ = ${S(d)} : ${["pas de solution", "une solution double", "deux solutions distinctes"][n]}.` };
  }, QCM),
  mk("sd-racines", SD, 2, { skill: "Résoudre une équation du second degré dans ℝ", ref: `${BOOK}, chap. 10 §1.1 (p. 184-185) et ex. 1.a (p. 190)`, kw: ["équation du second degré", "racines", "discriminant", "x₁", "x₂", "résoudre"] }, (c, r) => {
    const x1 = int(r, -7, 7), x2 = int(r, -7, 7);
    const a = nz(r, 1, 4) * (int(r, 0, 1) === 0 ? 1 : -1);
    const b = -a * (x1 + x2), cc = a * x1 * x2;
    const big = Math.max(x1, x2), small = Math.min(x1, x2);
    const large = int(r, 0, 1) === 0;
    const d = b * b - 4 * a * cc;
    return { statement: `Résous dans ℝ l'équation ${quad(a, b, cc)} = 0. Quelle est la ${large ? "plus grande" : "plus petite"} solution ?`, answer: num(large ? big : small), hints: H("Calcule Δ = b² − 4ac.", `Δ = ${d}.`, d === 0 ? "Δ = 0 : une racine double −b/(2a)." : `x = (−b ± √Δ)/(2a), avec √Δ = ${Math.sqrt(d)}.`, "Compare les deux solutions."), solution: d === 0 ? `Δ = 0 : x = ${S(x1)} (racine double).` : `Δ = ${d}, √Δ = ${Math.sqrt(d)} : x₁ = ${S(small)} et x₂ = ${S(big)}.` };
  }),
  mk("sd-somme-produit", SD, 2, { skill: "Somme et produit des racines : S = −b/a et P = c/a", ref: `${BOOK}, chap. 10 §1.1, propriété 1 (p. 186)`, kw: ["somme des racines", "produit des racines", "−b/a", "c/a"] }, (c, r) => {
    const x1 = int(r, -6, 6), x2 = int(r, -6, 6);
    const a = nz(r, 1, 4);
    const b = -a * (x1 + x2), cc = a * x1 * x2;
    const sum = int(r, 0, 1) === 0;
    return { statement: `L'équation ${quad(a, b, cc)} = 0 admet deux racines x₁ et x₂ (éventuellement confondues). Sans la résoudre, calcule ${sum ? "x₁ + x₂" : "x₁ × x₂"}.`, answer: num(sum ? x1 + x2 : x1 * x2), hints: H("x₁ + x₂ = −b/a et x₁x₂ = c/a.", `a = ${a}, b = ${b}, c = ${cc}.`, sum ? `−b/a = ${-b}/${a}.` : `c/a = ${cc}/${a}.`, "Simplifie."), solution: sum ? `x₁ + x₂ = −b/a = ${S(-b)}/${a} = ${S(x1 + x2)}.` : `x₁ × x₂ = c/a = ${S(cc)}/${a} = ${S(x1 * x2)}.` };
  }),
  mk("sd-racine-evidente", SD, 2, { skill: "Racine évidente : trouver l'autre racine par le produit", ref: `${BOOK}, chap. 10 §1.1, remarque et exemple (p. 186)`, kw: ["racine évidente", "produit des racines", "somme a + b + c = 0"] }, (c, r) => {
    const x2 = int(r, -6, 6);
    const a = nz(r, 1, 5);
    // 1 est racine : x1 = 1, x2 autre
    const b = -a * (1 + x2), cc = a * x2;
    return { statement: `Vérifie que 1 est une racine du polynôme P(x) = ${quad(a, b, cc)}. Quelle est l'autre racine ?`, answer: num(x2), hints: H("P(1) = a + b + c.", `P(1) = ${a} + ${P(b)} + ${P(cc)} = ${a + b + cc}.`, "Le produit des racines vaut c/a.", `x₂ = (c/a) ÷ 1.`), solution: `P(1) = 0. Le produit des racines vaut c/a = ${S(cc)}/${a} = ${S(x2)}, donc l'autre racine est ${S(x2)}.` };
  }),
  mk("sd-deux-nombres", SD, 3, { skill: "Deux nombres de somme S et de produit P", ref: `${BOOK}, chap. 10 §1.1, propriété 2 (p. 186) et p. 185-186`, kw: ["somme", "produit", "x² − Sx + P = 0", "deux nombres"] }, (c, r) => {
    const u = int(r, 1, 12), v = int(r, 1, 12);
    const Sm = u + v, Pr = u * v;
    const ctx = c === "situation";
    return { statement: ctx ? `Un terrain rectangulaire a un périmètre de ${2 * Sm} m et une aire de ${Pr} m². Quelle est sa longueur (la plus grande dimension), en mètres ?` : `Deux nombres réels positifs ont pour somme ${Sm} et pour produit ${Pr}. Quel est le plus grand de ces deux nombres ?`, answer: num(Math.max(u, v)), hints: H("Ces deux nombres sont les solutions de x² − Sx + P = 0.", `Ici : x² − ${Sm}x + ${Pr} = 0.`, `Δ = ${Sm * Sm - 4 * Pr}.`, "Prends la plus grande racine."), solution: `x² − ${Sm}x + ${Pr} = 0 a pour solutions ${Math.min(u, v)} et ${Math.max(u, v)}.` };
  }, PUR),
  mk("sd-sommet", SD, 2, { skill: "Sommet de la parabole y = ax² + bx + c", ref: `${BOOK}, chap. 10 §1.2, interprétation graphique (p. 188) et TD 1 (p. 189)`, kw: ["parabole", "sommet", "−b/2a", "extremum", "valeur maximale"] }, (c, r) => {
    const a = nz(r, -4, 4), b = int(r, -8, 8), cc = int(r, -8, 8);
    const xs = -b / (2 * a), ys = a * xs * xs + b * xs + cc;
    const ox = int(r, 0, 1) === 0;
    return { statement: `La parabole d'équation y = ${quad(a, b, cc)} a pour sommet S. Quelle est ${ox ? "l'abscisse" : "l'ordonnée"} de S ? (arrondi au centième)`, answer: num(round(ox ? xs : ys, 2), 0.01), hints: H("L'abscisse du sommet est −b/(2a).", `−b/(2a) = ${S(-b)}/${2 * a}.`, ox ? "C'est la réponse." : "L'ordonnée est P(−b/2a) = −Δ/(4a).", "Calcule."), solution: ox ? `x_S = −b/(2a) = ${S(round(xs, 2))}.` : `y_S = P(${S(round(xs, 2))}) = ${S(round(ys, 2))}.` };
  }),
  mk("sd-inequation", SD, 3, { skill: "Inéquation du second degré : signe du trinôme, nombre d'entiers solutions", ref: `${BOOK}, chap. 10 §1.2 (p. 187-188) et ex. 1.c (p. 190)`, kw: ["inéquation", "signe du trinôme", "second degré", "intervalle", "entiers"] }, (c, r) => {
    const x1 = int(r, -5, 2), w = int(r, 2, 6);
    const x2 = x1 + w;
    const a = int(r, 0, 1) === 0 ? 1 : -1;
    const b = -a * (x1 + x2), cc = a * x1 * x2;
    const strict = int(r, 0, 1) === 0;
    const pos = int(r, 0, 1) === 0;
    let n = 0;
    for (let x = -30; x <= 30; x++) {
      const v = a * (x - x1) * (x - x2);
      const ok = pos ? (strict ? v > 0 : v >= 0) : strict ? v < 0 : v <= 0;
      if (ok && x >= x1 - 8 && x <= x2 + 8) n++;
    }
    const sym = pos ? (strict ? ">" : "≥") : strict ? "<" : "≤";
    return { statement: `Combien d'entiers relatifs x compris entre ${x1 - 8} et ${x2 + 8} (bornes incluses) vérifient ${quad(a, b, cc)} ${sym} 0 ?`, answer: num(n), hints: H("Cherche les racines du trinôme.", "Utilise le signe de a à l'extérieur des racines, l'opposé entre les racines.", `Les racines sont ${S(x1)} et ${S(x2)}.`, "Compte les entiers de l'ensemble des solutions."), solution: `Racines ${S(x1)} et ${S(x2)} : on dénombre ${n} entiers.` };
  }),
  mk("sd-bicarree", SD, 3, { skill: "Équation bicarrée : changement d'inconnue X = x²", ref: `${BOOK}, chap. 10 §2.1 (p. 191) et ex. 2.a (p. 194)`, kw: ["équation bicarrée", "changement d'inconnue", "X = x²", "nombre de solutions"] }, (c, r) => {
    const X1 = pick(r, [1, 4, 9, 16, 0, -1, -4]), X2 = pick(r, [1, 4, 9, 16, 25, 0, -2]);
    const b = -(X1 + X2), cc = X1 * X2;
    let n = 0;
    const seen = new Set<number>([X1, X2]);
    for (const X of seen) { if (X > 0) n += 2; else if (X === 0) n += 1; }
    return { statement: `Combien de solutions réelles l'équation x⁴ ${b < 0 ? "−" : "+"} ${Math.abs(b)}x² ${cc < 0 ? "−" : "+"} ${Math.abs(cc)} = 0 admet-elle ?`.replace("+ 0x²", "").replace(/ [+−] 0 = 0/, " = 0").replace("x⁴ − 0x²", "x⁴").replace("x⁴ + 0x²", "x⁴"), answer: num(n), hints: H("Pose X = x² : l'équation devient X² + bX + c = 0.", `X² ${b < 0 ? "−" : "+"} ${Math.abs(b)}X ${cc < 0 ? "−" : "+"} ${Math.abs(cc)} = 0.`, `Les solutions en X sont ${[...seen].map(S).join(" et ")}.`, "Chaque X > 0 donne deux x, X = 0 donne x = 0, X < 0 n'en donne aucun."), solution: `X = ${[...seen].map(S).join(" ou X = ")} : on obtient ${n} solution${n > 1 ? "s" : ""} en x.` };
  }),
  mk("sd-irrationnelle", SD, 3, { skill: "Équation irrationnelle √(x + k) = x − m : vérifier les solutions", ref: `${BOOK}, chap. 10 §2.2 (p. 193) et ex. 2.c (p. 194)`, kw: ["équation irrationnelle", "racine carrée", "vérifier", "solution étrangère"] }, (c, r) => {
    const m = int(r, -4, 4), k = int(r, -4, 6);
    // √(x+k) = x − m  ⇔  x + k = (x−m)² et x ≥ m  ⇔ x² − (2m+1)x + m² − k = 0
    const bq = -(2 * m + 1), cq = m * m - k;
    const D = bq * bq - 4 * cq;
    const sols: number[] = [];
    if (D >= 0) { const sq = Math.sqrt(D); for (const x of D === 0 ? [-bq / 2] : [(-bq - sq) / 2, (-bq + sq) / 2]) if (x >= m - 1e-9 && x + k >= -1e-9) sols.push(round(x, 6)); }
    const ex = (e: number) => (e < 0 ? `x − ${-e}` : e === 0 ? "x" : `x + ${e}`);
    void ex;
    const L = `√(x ${k < 0 ? "−" : "+"} ${Math.abs(k)})`.replace("√(x + 0)", "√x").replace("√(x − 0)", "√x");
    const R = m === 0 ? "x" : m > 0 ? `x − ${m}` : `x + ${-m}`;
    return { statement: `Combien de solutions réelles l'équation ${L} = ${R} admet-elle ?`, answer: num(sols.length), hints: H("Élève au carré, mais n'oublie pas la condition : le second membre doit être positif.", `On obtient x² ${bq < 0 ? "−" : "+"} ${Math.abs(bq)}x ${cq < 0 ? "−" : "+"} ${Math.abs(cq)} = 0 avec x ≥ ${m}.`, `Δ = ${D}.`, "Garde seulement les solutions qui vérifient la condition."), solution: sols.length === 0 ? "Aucune racine de l'équation du second degré ne vérifie la condition : pas de solution." : `Solution${sols.length > 1 ? "s" : ""} retenue${sols.length > 1 ? "s" : ""} : ${sols.map((x) => S(round(x, 3))).join(" et ")}.` };
  }),
  mk("sd-cours", SD, 1, { skill: "Second degré : discriminant, racines, signe du trinôme (cours)", ref: `${BOOK}, chap. 10 §1 (p. 184-188)`, kw: ["discriminant", "racines", "signe du trinôme", "factorisation", "parabole"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Si Δ < 0, que peut-on dire du polynôme P(x) = ax² + bx + c ?", good: "Il n'a pas de racine et n'est pas factorisable dans ℝ", bad: ["Il a deux racines distinctes", "Il a une racine double", "Il est toujours négatif"], why: "Propriété du manuel (§1.1)." },
      { q: "Si Δ = 0, P(x) = ax² + bx + c s'écrit :", good: "a(x + b/(2a))²", bad: ["a(x − b/(2a))(x + b/(2a))", "a(x² + b/(2a))", "(x + b)²"], why: "Une racine double −b/(2a) : P(x) = a(x + b/(2a))²." },
      { q: "Si Δ > 0, quelles sont les racines de P ?", good: "(−b − √Δ)/(2a) et (−b + √Δ)/(2a)", bad: ["(−b ± Δ)/(2a)", "(b ± √Δ)/(2a)", "(−b ± √Δ)/a"], why: "Formules du manuel (§1.1)." },
      { q: "Si x₁ et x₂ sont les racines de ax² + bx + c = 0, que vaut x₁ + x₂ ?", good: "−b/a", bad: ["b/a", "c/a", "−c/a"], why: "Propriété 1 du manuel : x₁ + x₂ = −b/a et x₁x₂ = c/a." },
      { q: "Quand Δ < 0 et a > 0, quel est le signe de P(x) ?", good: "P(x) > 0 pour tout réel x", bad: ["P(x) < 0 pour tout réel x", "P(x) change de signe", "P(x) = 0 pour tout réel x"], why: "Quand Δ < 0, P(x) est du signe de a pour tout x." },
      { q: "Quand Δ > 0 et a > 0, P(x) est négatif :", good: "entre les deux racines", bad: ["à l'extérieur des deux racines", "partout", "nulle part"], why: "P(x) est du signe de −a entre les racines." },
      { q: "Quelle est l'abscisse du sommet de la parabole y = ax² + bx + c ?", good: "−b/(2a)", bad: ["b/(2a)", "−b/a", "−Δ/(4a)"], why: "Interprétation graphique du manuel (§1.2)." },
      { q: "Pour résoudre une équation irrationnelle en élevant au carré, on doit ensuite :", good: "vérifier quelles solutions conviennent à l'équation initiale", bad: ["garder toutes les solutions", "dériver l'équation", "ne garder que la plus petite solution"], why: "L'élévation au carré est une implication : certaines solutions peuvent être étrangères (§2.2)." },
    ];
    return qcmOf(r, pool, "Revois le rôle du signe de Δ.");
  }, QCM),

  // ===== Chapitre 10 §3 : systèmes linéaires =====
  mk("sl-2x2", SL, 2, { skill: "Résoudre un système de deux équations à deux inconnues", ref: `${BOOK}, chap. 10 §3 (p. 195-201)`, kw: ["système", "substitution", "combinaison", "deux équations", "inconnues"] }, (c, r) => {
    let a: number, b: number, a2: number, b2: number;
    do { a = nz(r, -4, 5); b = nz(r, -4, 5); a2 = nz(r, -4, 5); b2 = nz(r, -4, 5); } while (a * b2 - a2 * b === 0);
    const x = int(r, -5, 8), y = int(r, -5, 8);
    const c1 = a * x + b * y, c2 = a2 * x + b2 * y;
    const askX = int(r, 0, 1) === 0;
    const eq = (p: number, q: number, k: number) => `${term(p, "x", true)}${term(q, "y", false)} = ${S(k)}`;
    if (c === "situation") {
      let p1: number, q1: number, p2: number, q2: number;
      do { p1 = int(r, 2, 6); q1 = int(r, 2, 6); p2 = int(r, 1, 5); q2 = int(r, 1, 5); } while (p1 * q2 === p2 * q1);
      const px = int(r, 2, 9) * 50, py = int(r, 2, 9) * 50;
      const t1 = p1 * px + q1 * py, t2 = p2 * px + q2 * py;
      const w = pick(r, WHO);
      return { statement: `Au marché, ${w} achète ${p1} kg de manioc et ${q1} kg d'igname pour ${t1} FCFA ; un autre jour, ${p2} kg de manioc et ${q2} kg d'igname coûtent ${t2} FCFA. Quel est le prix d'un kilogramme de ${askX ? "manioc" : "igname"} (en FCFA) ?`, answer: num(askX ? px : py), hints: H("Appelle x le prix du kg de manioc et y celui du kg d'igname.", `${p1}x + ${q1}y = ${t1} et ${p2}x + ${q2}y = ${t2}.`, "Résous par substitution ou par combinaison.", "Calcule l'inconnue demandée."), solution: `x = ${px} FCFA (manioc), y = ${py} FCFA (igname).` };
    }
    return { statement: `Résous le système { ${eq(a, b, c1)} ; ${eq(a2, b2, c2)} }. Quelle est la valeur de ${askX ? "x" : "y"} ?`, answer: num(askX ? x : y), hints: H("Utilise la substitution ou la combinaison linéaire.", `Élimine une inconnue : multiplie les équations pour obtenir des coefficients opposés.`, `Déterminant : ${a} × ${P(b2)} − ${P(a2)} × ${P(b)} = ${a * b2 - a2 * b}.`, "Remplace dans une équation pour trouver l'autre inconnue."), solution: `La solution est (x ; y) = (${S(x)} ; ${S(y)}).` };
  }),
  mk("sl-nature", SL, 2, { skill: "Nombre de solutions d'un système 2×2 (déterminant)", ref: `${BOOK}, chap. 10 §3 (p. 195-197)`, kw: ["système", "une solution", "aucune solution", "infinité de solutions", "déterminant"] }, (c, r) => {
    const a = nz(r, 1, 4), b = nz(r, 1, 4);
    const k = nz(r, 2, 3);
    const t = int(r, 0, 2);
    const c1 = int(r, -5, 5);
    let a2: number, b2: number, c2: number;
    if (t === 0) { a2 = k * a; b2 = k * b; c2 = k * c1 + (r() < 0.5 ? 1 : 2); } else if (t === 1) { a2 = k * a; b2 = k * b; c2 = k * c1; } else { a2 = a + 1; b2 = b + 2; c2 = int(r, -5, 5); if (a * b2 - a2 * b === 0) b2 += 1; }
    const D = a * b2 - a2 * b;
    const idx = D !== 0 ? 0 : c2 * a === c1 * a2 && c2 * b === c1 * b2 ? 2 : 1;
    const eq = (p: number, q: number, kk: number) => `${term(p, "x", true)}${term(q, "y", false)} = ${S(kk)}`;
    return { statement: `Le système { ${eq(a, b, c1)} ; ${eq(a2, b2, c2)} } admet combien de solutions ?`, answer: { kind: "choice", options: ["Une seule", "Aucune", "Une infinité"], index: idx }, hints: H("Calcule ab' − a'b.", `ab' − a'b = ${a} × ${P(b2)} − ${P(a2)} × ${b} = ${D}.`, "Si ce nombre est non nul : une seule solution. S'il est nul, compare les seconds membres.", "Conclus."), solution: `ab' − a'b = ${D}. ${idx === 0 ? "Une seule solution." : idx === 1 ? "Les équations sont incompatibles : aucune solution." : "Les équations sont équivalentes : une infinité de solutions."}` };
  }, QCM),
  mk("sl-3x3", SL, 3, { skill: "Résoudre un système de trois équations à trois inconnues", ref: `${BOOK}, chap. 10 §3.1 (p. 195-197)`, kw: ["système", "trois équations", "trois inconnues", "substitution", "pivot de Gauss"] }, (c, r) => {
    let m: number[][];
    do { m = [0, 1, 2].map(() => [nz(r, -3, 4), nz(r, -3, 4), nz(r, -3, 4)]); } while (Math.abs(det3(m)) < 1 || m.some((row) => row.every((v) => v === row[0])));
    const x = int(r, -3, 4), y = int(r, -3, 4), z = int(r, -3, 4);
    const sol = [x, y, z];
    const t = m.map((row) => row[0] * x + row[1] * y + row[2] * z);
    const k = int(r, 0, 2);
    const eq = (row: number[], kk: number) => `${term(row[0], "x", true)}${term(row[1], "y", false)}${term(row[2], "z", false)} = ${S(kk)}`;
    return { statement: `Résous le système { ${m.map((row, i) => eq(row, t[i])).join(" ; ")} }. Quelle est la valeur de ${["x", "y", "z"][k]} ?`, answer: num(sol[k]), hints: H("Élimine une inconnue entre deux équations, puis une autre entre deux autres.", "Tu obtiens alors un système de deux équations à deux inconnues.", `Le système a une solution unique (déterminant ${det3(m)}).`, "Remplace pour trouver la dernière inconnue."), solution: `La solution est (x ; y ; z) = (${S(x)} ; ${S(y)} ; ${S(z)}).` };
  }),
  mk("sl-cours", SL, 1, { skill: "Systèmes linéaires : méthodes de résolution", ref: `${BOOK}, chap. 10 §3.1 (p. 195-197)`, kw: ["substitution", "pivot de Gauss", "système linéaire", "triplet solution"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Résoudre un système de trois équations à trois inconnues, c'est :", good: "déterminer tous les triplets (x, y, z) qui vérifient les trois équations", bad: ["trouver un seul nombre", "résoudre une seule équation", "trouver la plus grande des inconnues"], why: "Définition du manuel (§3.1)." },
      { q: "Quelles sont deux méthodes de résolution d'un système linéaire étudiées dans le manuel ?", good: "La substitution et le pivot de Gauss", bad: ["La dérivation et l'intégration", "Le théorème de Thalès et Pythagore", "La récurrence et l'absurde"], why: "Le manuel étudie la substitution et le pivot de Gauss (§3.1)." },
      { q: "Un système linéaire peut-il avoir une infinité de solutions ?", good: "Oui, par exemple si une équation est combinaison des autres", bad: ["Non, jamais", "Oui, mais seulement à deux inconnues", "Seulement si les coefficients sont nuls"], why: "Exemple du manuel : un système dont l'ensemble des solutions est { (7/3 + λ ; −4/3 ; λ), λ ∈ ℝ }." },
    ];
    return qcmOf(r, pool, "Pense aux méthodes de substitution et de pivot.");
  }, QCM),
];
void gcd;
