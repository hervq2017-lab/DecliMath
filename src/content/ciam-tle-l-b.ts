// CIAM Terminale Littéraire (séries A1/A2) : systèmes, suites, statistique, probabilités.
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf, WHO } from "./ciam-kit";

const mk = ciam("tle", "ciamtl");
const BOOK = "CIAM Terminale Littéraire";
const SL = "Systèmes linéaires dans ℝ × ℝ (couples) — série A1";
const SU = "Suites numériques — série A1";
const ST = "Statistique à deux variables — série A1";
const PB = "Probabilités — série A1";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const nz = (r: () => number, lo: number, hi: number) => { let v = 0; while (v === 0) v = lo + Math.floor(r() * (hi - lo + 1)); return v; };
const term = (a: number, v: string, first: boolean) => {
  if (a === 0) return "";
  const m = Math.abs(a) === 1 && v !== "" ? "" : String(Math.abs(a));
  return first ? `${a < 0 ? "−" : ""}${m}${v}` : ` ${a < 0 ? "−" : "+"} ${m}${v}`;
};

export const TLB: Template[] = [
  // ===== Chapitre 5 : équations, inéquations, systèmes =====
  mk("sl-2x2", SL, 2, { skill: "Résoudre un système de deux équations à deux inconnues", ref: `${BOOK}, chap. 5 §2.1 (p. 83) et ex. 2.a (p. 85)`, kw: ["système", "deux équations", "deux inconnues", "substitution", "combinaison"] }, (c, r) => {
    let a: number, b: number, a2: number, b2: number;
    do { a = nz(r, -4, 5); b = nz(r, -4, 5); a2 = nz(r, -4, 5); b2 = nz(r, -4, 5); } while (a * b2 - a2 * b === 0);
    const x = int(r, -4, 8), y = int(r, -4, 8);
    const askX = int(r, 0, 1) === 0;
    const eq = (p: number, q: number, k: number) => `${term(p, "x", true)}${term(q, "y", false)} = ${S(k)}`;
    if (c === "situation") {
      let p1: number, q1: number, p2: number, q2: number;
      do { p1 = int(r, 2, 6); q1 = int(r, 2, 6); p2 = int(r, 1, 5); q2 = int(r, 1, 5); } while (p1 * q2 === p2 * q1);
      const px = int(r, 2, 9) * 50, py = int(r, 2, 9) * 50;
      const w = pick(r, WHO);
      return { statement: `À la buvette du lycée, ${w} achète ${p1} cocas et ${q1} croissants pour ${p1 * px + q1 * py} FCFA ; son ami achète ${p2} cocas et ${q2} croissants pour ${p2 * px + q2 * py} FCFA. Quel est le prix d'${askX ? "un coca" : "un croissant"} (en FCFA) ?`, answer: num(askX ? px : py), hints: H("Appelle x le prix d'un coca et y celui d'un croissant.", `${p1}x + ${q1}y = ${p1 * px + q1 * py} et ${p2}x + ${q2}y = ${p2 * px + q2 * py}.`, "Résous par substitution ou combinaison.", "Calcule l'inconnue demandée."), solution: `Un coca coûte ${px} FCFA et un croissant ${py} FCFA.` };
    }
    return { statement: `Résous le système { ${eq(a, b, a * x + b * y)} ; ${eq(a2, b2, a2 * x + b2 * y)} }. Quelle est la valeur de ${askX ? "x" : "y"} ?`, answer: num(askX ? x : y), hints: H("Utilise la substitution ou la combinaison linéaire.", "Élimine une inconnue en obtenant des coefficients opposés.", `Déterminant : ${a} × ${P(b2)} − ${P(a2)} × ${P(b)} = ${a * b2 - a2 * b}.`, "Remplace dans une équation pour trouver l'autre inconnue."), solution: `La solution est (x ; y) = (${S(x)} ; ${S(y)}).` };
  }),
  mk("sl-probleme", SL, 2, { skill: "Mettre un problème en système : pourcentages et effectifs", ref: `${BOOK}, chap. 5 §2.1 (p. 83) et ex. 15 (p. 90)`, kw: ["problème", "mise en équation", "système", "effectif"] }, (c, r) => {
    const x = int(r, 10, 40), y = int(r, 10, 40);
    const g1 = int(r, 2, 6) * 100, p1 = int(r, 1, 5) * 50;
    // x bons × g1 − y mauvais × p1 = net ; x + y = N
    const N = x + y, net = g1 * x - p1 * y;
    return { statement: `Un père donne ${g1} FCFA à son fils pour chaque problème correctement résolu et lui en reprend ${p1} FCFA pour chaque problème mal résolu. Après ${N} problèmes, le fils a gagné ${net} FCFA. Combien de problèmes a-t-il résolus correctement ?`, answer: num(x), hints: H("Désigne par x le nombre de problèmes justes et y le nombre de problèmes faux.", `x + y = ${N} et ${g1}x − ${p1}y = ${net}.`, "Résous le système.", "Lis x."), solution: `x = ${x} problèmes justes et y = ${y} faux.` };
  }),
  mk("sl-inequations", SL, 3, { skill: "Système d'inéquations : un point appartient-il à la région ?", ref: `${BOOK}, chap. 5 §2.2 (p. 84-85)`, kw: ["système d'inéquations", "région du plan", "demi-plan", "point"] }, (c, r) => {
    const a1 = nz(r, 1, 4), b1 = nz(r, 1, 4), c1 = int(r, 8, 30);
    const a2 = nz(r, 1, 4), b2 = nz(r, 1, 4), c2 = int(r, 8, 30);
    const x = int(r, 0, 10), y = int(r, 0, 10);
    const ok = x >= 0 && y >= 0 && a1 * x + b1 * y <= c1 && a2 * x + b2 * y <= c2;
    return { statement: `On considère le système { x ≥ 0 ; y ≥ 0 ; ${a1}x + ${b1}y ≤ ${c1} ; ${a2}x + ${b2}y ≤ ${c2} }. Le point (${x} ; ${y}) est-il solution de ce système ?`, answer: { kind: "choice", options: ["Oui", "Non"], index: ok ? 0 : 1 }, hints: H("Remplace x et y par les coordonnées dans chaque inéquation.", `${a1} × ${x} + ${b1} × ${y} = ${a1 * x + b1 * y} (à comparer à ${c1}).`, `${a2} × ${x} + ${b2} × ${y} = ${a2 * x + b2 * y} (à comparer à ${c2}).`, "Il faut que les quatre inéquations soient vérifiées."), solution: `${a1 * x + b1 * y} ${a1 * x + b1 * y <= c1 ? "≤" : ">"} ${c1} et ${a2 * x + b2 * y} ${a2 * x + b2 * y <= c2 ? "≤" : ">"} ${c2} : ${ok ? "le point est solution" : "le point n'est pas solution"}.` };
  }, QCM),
  mk("sl-programmation", SL, 3, { skill: "Programmation linéaire : bénéfice maximal sur la région des contraintes", ref: `${BOOK}, chap. 5 §2.2, problème de la couturière (p. 84-85)`, kw: ["programmation linéaire", "bénéfice maximal", "contraintes", "sommets"] }, (c, r) => {
    const a1 = int(r, 2, 5), b1 = int(r, 2, 5), c1 = int(r, 10, 12) * 10;
    const a2 = int(r, 1, 4), b2 = int(r, 3, 6), c2 = int(r, 10, 12) * 10;
    const p = int(r, 2, 6) * 1000, q = int(r, 2, 6) * 1000;
    const feas = (x: number, y: number) => x >= -1e-9 && y >= -1e-9 && a1 * x + b1 * y <= c1 + 1e-9 && a2 * x + b2 * y <= c2 + 1e-9;
    const det = a1 * b2 - a2 * b1;
    const cands: [number, number][] = [[0, 0], [c1 / a1, 0], [c2 / a2, 0], [0, c1 / b1], [0, c2 / b2]];
    if (det !== 0) cands.push([(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det]);
    const best = Math.max(...cands.filter(([x, y]) => feas(x, y)).map(([x, y]) => p * x + q * y));
    return { statement: `Un atelier fabrique x objets de type 1 et y objets de type 2 avec les contraintes x ≥ 0, y ≥ 0, ${a1}x + ${b1}y ≤ ${c1} et ${a2}x + ${b2}y ≤ ${c2}. Le bénéfice est B = ${p}x + ${q}y (en FCFA). Quel est le bénéfice maximal (en FCFA, arrondi à l'unité) ? On ne demande pas que x et y soient entiers.`, answer: num(Math.round(best), 2), hints: H("Le maximum de B est atteint en un sommet de la région des solutions.", "Calcule les sommets : intersections des droites avec les axes et des deux droites entre elles.", "Ne garde que ceux qui vérifient toutes les contraintes.", "Calcule B en chaque sommet et prends le plus grand."), solution: `Le bénéfice maximal vaut ${fr(Math.round(best))} FCFA.` };
  }),

  // ===== Chapitre 6 : suites =====
  mk("su-capital", SU, 2, { skill: "Capital placé à intérêts simples ou composés", ref: `${BOOK}, chap. 6 §1.2 (p. 94)`, kw: ["intérêts simples", "intérêts composés", "capital", "taux annuel"] }, (c, r) => {
    const C0 = int(r, 5, 50) * 10000, i = pick(r, [0.02, 0.03, 0.04, 0.05, 0.06]), n = int(r, 2, 8);
    const simple = int(r, 0, 1) === 0;
    const v = simple ? C0 * (1 + n * i) : C0 * (1 + i) ** n;
    return { statement: `Un capital de ${fr(C0)} FCFA est placé à intérêts ${simple ? "simples" : "composés"} au taux annuel de ${fr(i * 100)} %. Quel est le capital acquis au bout de ${n} ans (arrondi à l'unité) ?`, answer: num(Math.round(v), 2), hints: H(simple ? "Intérêts simples : Cₙ = C₀(1 + n·i)." : "Intérêts composés : Cₙ = C₀(1 + i)ⁿ.", `i = ${fr(i)} et n = ${n}.`, simple ? `1 + ${n} × ${fr(i)} = ${fr(round(1 + n * i, 4))}.` : `(1 + ${fr(i)})^${n} ≈ ${fr(round((1 + i) ** n, 5))}.`, "Multiplie par C₀."), solution: `Cₙ ≈ ${fr(Math.round(v))} FCFA.` };
  }),
  mk("su-arithmetique", SU, 2, { skill: "Suite arithmétique : terme général et somme", ref: `${BOOK}, chap. 6 §1.1 (p. 94)`, kw: ["suite arithmétique", "raison", "uₙ = u₀ + nr", "somme"] }, (c, r) => {
    const u0 = int(r, -6, 12), rr = nz(r, -5, 6), n = int(r, 5, 20);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `(uₙ) est une suite arithmétique de premier terme u₀ = ${S(u0)} et de raison ${S(rr)}. Calcule u${n}.`, answer: num(u0 + n * rr), hints: H("uₙ = u₀ + n·r.", `n = ${n}, r = ${S(rr)}.`, `${n} × ${P(rr)} = ${n * rr}.`, "Ajoute u₀."), solution: `u${n} = ${S(u0 + n * rr)}.` };
    let tot = 0; for (let i = 0; i < n; i++) tot += u0 + i * rr;
    return { statement: `(uₙ) est arithmétique de premier terme u₀ = ${S(u0)} et de raison ${S(rr)}. Calcule la somme des ${n} premiers termes u₀ + … + u${n - 1}.`, answer: num(tot), hints: H("S = (nombre de termes) × (moyenne des termes extrêmes).", `Dernier terme : u${n - 1} = ${S(u0 + (n - 1) * rr)}.`, `${n} × (${S(u0)} + ${P(u0 + (n - 1) * rr)})/2.`, "Calcule."), solution: `S = ${S(tot)}.` };
  }),
  mk("su-geometrique", SU, 2, { skill: "Suite géométrique : terme général et somme", ref: `${BOOK}, chap. 6 §1.1 (p. 94) et §2.3 (p. 97)`, kw: ["suite géométrique", "raison", "uₙ = u₀ qⁿ", "bactéries"] }, (c, r) => {
    const u0 = int(r, 1, 6) * 50, q = pick(r, [2, 3, 1.5, 0.5]), n = int(r, 3, 8);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Une population de bactéries compte ${u0} individus au départ et ${q === 2 ? "double" : q === 3 ? "triple" : `est multipliée par ${fr(q)}`} toutes les heures. Combien y en a-t-il au bout de ${n} heures ?`, answer: num(round(u0 * q ** n, 2), 0.01), hints: H("La suite est géométrique : Pₙ = P₀ × qⁿ.", `q = ${fr(q)}.`, `q^${n} = ${fr(round(q ** n, 4))}.`, "Multiplie par P₀."), solution: `P${n} = ${fr(u0)} × ${fr(q)}^${n} = ${fr(round(u0 * q ** n, 2))}.` };
    let tot = 0; for (let i = 0; i < n; i++) tot += u0 * q ** i;
    return { statement: `(uₙ) est géométrique de premier terme u₀ = ${u0} et de raison ${fr(q)}. Calcule la somme des ${n} premiers termes (arrondie au centième).`, answer: num(round(tot, 2), 0.02), hints: H("S = (1er terme) × (1 − qⁿ)/(1 − q) si q ≠ 1.", `q^${n} = ${fr(round(q ** n, 4))}.`, `${u0} × (1 − ${fr(round(q ** n, 4))})/(1 − ${fr(q)}).`, "Calcule."), solution: `S ≈ ${fr(round(tot, 2))}.` };
  }),
  mk("su-variation", SU, 1, { skill: "Sens de variation d'une suite arithmétique ou géométrique", ref: `${BOOK}, chap. 6 §2.2-2.3 (p. 97)`, kw: ["sens de variation", "suite arithmétique", "suite géométrique", "croissante", "décroissante"] }, (c, r) => {
    const geo = int(r, 0, 1) === 0;
    if (!geo) { const rr = nz(r, -6, 6); return { statement: `(uₙ) est une suite arithmétique de raison ${S(rr)}. Est-elle croissante ou décroissante ?`, answer: { kind: "choice", options: ["Croissante", "Décroissante"], index: rr > 0 ? 0 : 1 }, hints: H("Regarde le signe de la raison.", "r > 0 : croissante ; r < 0 : décroissante.", `r = ${S(rr)}.`, "Conclus."), solution: `r ${rr > 0 ? "> 0 : croissante" : "< 0 : décroissante"}.` }; }
    const q = pick(r, [0.5, 0.8, 1.2, 2, 3]);
    return { statement: `(uₙ) est une suite géométrique à termes positifs de raison ${fr(q)}. Est-elle croissante ou décroissante ?`, answer: { kind: "choice", options: ["Croissante", "Décroissante"], index: q > 1 ? 0 : 1 }, hints: H("Compare la raison à 1.", "q > 1 : croissante ; q < 1 : décroissante.", `q = ${fr(q)}.`, "Conclus."), solution: `q ${q > 1 ? "> 1 : croissante" : "< 1 : décroissante"}.` };
  }, QCM),
  mk("su-limite", SU, 2, { skill: "Limite d'une suite : convergente ou divergente", ref: `${BOOK}, chap. 6 §3 (p. 98-100)`, kw: ["limite d'une suite", "convergente", "divergente", "limite unique"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Une suite est convergente si elle :", good: "a une limite finie", bad: ["est croissante", "est positive", "a pour limite +∞"], why: "Définition du manuel (§3)." },
      { q: "Une suite est divergente si elle :", good: "n'est pas convergente", bad: ["est décroissante", "est négative", "est géométrique"], why: "Définition du manuel (§3)." },
      { q: "Si une suite a une limite, cette limite est :", good: "unique", bad: ["toujours 0", "toujours positive", "toujours finie"], why: "Propriété du manuel (§3)." },
      { q: "La suite de terme général vₙ = 1 − n²/4 :", good: "a pour limite −∞ (divergente)", bad: ["a pour limite 1", "a pour limite 0", "a pour limite +∞"], why: "Exemple du manuel (§3) : lim vₙ = −∞." },
      { q: "Pour une suite de terme général (−1)ⁿ :", good: "il n'y a pas de limite", bad: ["la limite est 1", "la limite est −1", "la limite est 0"], why: "Exemple du manuel : wₙ vaut 1 si n est pair et −1 si n est impair." },
    ];
    return qcmOf(r, pool, "Reprends la définition de la convergence.");
  }, QCM),

  // ===== Chapitre 7 : statistique =====
  mk("st-ecart-type", ST, 3, { skill: "Moyenne, variance et écart type d'une série à un caractère", ref: `${BOOK}, chap. 7 §2.2 (p. 113-114)`, kw: ["moyenne", "variance", "écart type", "régularité", "série statistique"] }, (c, r) => {
    const k = int(r, 4, 6);
    const base = int(r, 60, 70);
    const xs = Array.from({ length: k }, (_, i) => base + i);
    const ns = xs.map(() => int(r, 1, 9));
    const N = ns.reduce((a, b) => a + b, 0);
    const m = xs.reduce((t, x, i) => t + x * ns[i], 0) / N;
    const V = xs.reduce((t, x, i) => t + ns[i] * (x - m) ** 2, 0) / N;
    const askV = int(r, 0, 1) === 0;
    return { statement: `Temps d'une nageuse (en secondes) sur ${N} compétitions : ${xs.map((x, i) => `${x} s (${ns[i]} fois)`).join(" ; ")}. Calcule ${askV ? "la variance" : "l'écart type"} de cette série (arrondi au centième).`, answer: num(round(askV ? V : Math.sqrt(V), 2), 0.02), hints: H("La variance est la moyenne des carrés des écarts à la moyenne.", `Moyenne x̄ = ${fr(round(m, 3))}.`, `V ≈ ${fr(round(V, 3))}.`, askV ? "C'est la réponse." : "σ = √V."), solution: askV ? `V ≈ ${fr(round(V, 2))}.` : `V ≈ ${fr(round(V, 2))}, σ ≈ ${fr(round(Math.sqrt(V), 2))}.` };
  }),
  mk("st-mayer", ST, 3, { skill: "Ajustement linéaire par la méthode de Mayer", ref: `${BOOK}, chap. 7 §3.2 (p. 117-118)`, kw: ["méthode de Mayer", "nuage de points", "point moyen", "droite d'ajustement", "sous-nuages"] }, (c, r) => {
    const n = 2 * int(r, 3, 4);
    const a0 = nz(r, 2, 12), b0 = int(r, 20, 60);
    const xs = Array.from({ length: n }, (_, i) => i + 1);
    const ys = xs.map((x) => Math.round(a0 * x + b0 + (r() - 0.5) * 20));
    const h = n / 2;
    const g = (arr: number[][]) => [arr.reduce((t, p) => t + p[0], 0) / arr.length, arr.reduce((t, p) => t + p[1], 0) / arr.length];
    const pts = xs.map((x, i) => [x, ys[i]]);
    const G1 = g(pts.slice(0, h)), G2 = g(pts.slice(h));
    const a = (G2[1] - G1[1]) / (G2[0] - G1[0]), b = G1[1] - a * G1[0];
    const xp = n + int(r, 1, 3);
    const ask = int(r, 0, 1) === 0;
    return { statement: `Chiffre d'affaires (en millions de FCFA) d'une entreprise pendant ${n} années consécutives : ${pts.map(([x, y]) => `année ${x} : ${y}`).join(" ; ")}. On ajuste le nuage par la droite de Mayer (deux sous-nuages de même effectif). ${ask ? "Quel est son coefficient directeur (arrondi au centième) ?" : `Quelle valeur prévoit-elle pour l'année ${xp} (arrondi au dixième) ?`}`, answer: num(ask ? round(a, 2) : round(a * xp + b, 1), ask ? 0.02 : 0.2), hints: H("Partage le nuage en deux sous-nuages de même effectif (les points dans l'ordre).", `G₁ ≈ (${fr(round(G1[0], 2))} ; ${fr(round(G1[1], 2))}) et G₂ ≈ (${fr(round(G2[0], 2))} ; ${fr(round(G2[1], 2))}).`, "La droite de Mayer est la droite (G₁G₂).", ask ? "Calcule (y₂ − y₁)/(x₂ − x₁)." : `Utilise y = ax + b avec a ≈ ${fr(round(a, 3))} et b ≈ ${fr(round(b, 3))}.`), solution: ask ? `a = (${fr(round(G2[1], 2))} − ${fr(round(G1[1], 2))})/(${fr(round(G2[0], 2))} − ${fr(round(G1[0], 2))}) ≈ ${fr(round(a, 2))}.` : `y = ${fr(round(a, 3))}x + ${fr(round(b, 3))} donne ${fr(round(a * xp + b, 1))} pour x = ${xp}.` };
  }),
  mk("st-point-moyen", ST, 1, { skill: "Point moyen d'un nuage de points", ref: `${BOOK}, chap. 7 §3.1 (p. 116-117)`, kw: ["point moyen", "nuage de points", "moyenne", "série double"] }, (c, r) => {
    const k = int(r, 4, 6);
    const pts = Array.from({ length: k }, () => [int(r, 1, 20), int(r, 5, 80)]);
    const mx = pts.reduce((t, p) => t + p[0], 0) / k, my = pts.reduce((t, p) => t + p[1], 0) / k;
    const ox = int(r, 0, 1) === 0;
    return { statement: `Série double (x ; y) : ${pts.map((p) => `(${p[0]} ; ${p[1]})`).join(", ")}. Quelle est ${ox ? "l'abscisse" : "l'ordonnée"} du point moyen G du nuage ? (arrondi au centième)`, answer: num(round(ox ? mx : my, 2), 0.01), hints: H("Le point moyen a pour coordonnées les moyennes de x et de y.", `Il y a ${k} points.`, ox ? `Somme des x : ${pts.reduce((t, p) => t + p[0], 0)}.` : `Somme des y : ${pts.reduce((t, p) => t + p[1], 0)}.`, "Divise par le nombre de points."), solution: ox ? `x̄ = ${pts.reduce((t, p) => t + p[0], 0)}/${k} ≈ ${fr(round(mx, 2))}.` : `ȳ = ${pts.reduce((t, p) => t + p[1], 0)}/${k} ≈ ${fr(round(my, 2))}.` };
  }),
  mk("st-cours", ST, 1, { skill: "Statistique : série double, nuage de points, ajustement linéaire (cours)", ref: `${BOOK}, chap. 7 §3 (p. 116-118)`, kw: ["série double", "nuage de points", "séries marginales", "point moyen", "Mayer"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Qu'appelle-t-on série statistique à deux caractères (ou série double) ?", good: "L'ensemble des couples (x, y) associés aux individus d'une population", bad: ["Deux séries sans lien entre elles", "Une série à deux classes", "Une série avec deux modes"], why: "Définition du manuel (§3.1)." },
      { q: "Que représente le nuage de points d'une série double ?", good: "L'ensemble des points de coordonnées (xᵢ ; yᵢ)", bad: ["La droite de régression", "Le point moyen seul", "L'histogramme de x"], why: "Définition du manuel (§3.1)." },
      { q: "Quelles sont les coordonnées du point moyen G d'un nuage ?", good: "(x̄ ; ȳ), les moyennes des deux séries marginales", bad: ["(médiane de x ; médiane de y)", "(x₁ ; y₁)", "(écart type de x ; écart type de y)"], why: "Définition du manuel (§3.1)." },
      { q: "Dans la méthode de Mayer, on partage le nuage en :", good: "deux sous-nuages disjoints de même effectif, dans l'ordre des points", bad: ["trois sous-nuages", "deux sous-nuages d'effectifs quelconques", "deux sous-nuages au hasard"], why: "Méthode du manuel (§3.2)." },
      { q: "La droite de Mayer est :", good: "la droite (G₁G₂) passant par les points moyens des deux sous-nuages", bad: ["la droite passant par le premier et le dernier point", "la droite passant par l'origine", "la droite horizontale y = ȳ"], why: "Méthode du manuel (§3.2)." },
      { q: "L'écart type d'une série mesure :", good: "la régularité (la dispersion) de la série", bad: ["la valeur la plus fréquente", "la moyenne", "le nombre de classes"], why: "Définition du manuel (§2.2) : « L'écart type sert à mesurer la régularité »." },
    ];
    return qcmOf(r, pool, "Reprends les définitions du §3.");
  }, QCM),

  // ===== Chapitre 8 : probabilités =====
  mk("pb-laplace", PB, 1, { skill: "Probabilité en situation d'équiprobabilité : cas favorables / cas possibles", ref: `${BOOK}, chap. 8 §2.1 (p. 130)`, kw: ["équiprobabilité", "formule de Laplace", "cas favorables", "cas possibles", "urne"] }, (c, r) => {
    const b = int(r, 2, 6), rr = int(r, 2, 6), v = int(r, 2, 6);
    const N = b + rr + v;
    const col = pick(r, ["blanche", "rouge", "verte"] as const);
    const k = col === "blanche" ? b : col === "rouge" ? rr : v;
    return { statement: `Une urne contient ${b} boules blanches, ${rr} boules rouges et ${v} boules vertes, indiscernables au toucher. On tire une boule au hasard. Quelle est la probabilité de tirer une boule ${col} ? (valeur décimale arrondie au centième)`, answer: num(round(k / N, 2), 0.01), hints: H("En équiprobabilité : P(A) = (nombre de cas favorables)/(nombre de cas possibles).", `Cas possibles : ${N}.`, `Cas favorables : ${k}.`, `P = ${k}/${N}.`), solution: `P = ${k}/${N} ≈ ${fr(round(k / N, 2))}.` };
  }),
  mk("pb-reunion", PB, 2, { skill: "Probabilité d'une réunion : P(A∪B) = P(A) + P(B) − P(A∩B)", ref: `${BOOK}, chap. 8 §2.1 (p. 131-132) et ex. 2.b (p. 133)`, kw: ["réunion", "intersection", "P(A ∪ B)", "événements"] }, (c, r) => {
    const N = int(r, 20, 60);
    const i = int(r, 2, 6);
    const a = int(r, i + 2, Math.floor(N / 2) + i), b = int(r, i + 2, N - a + i);
    return { statement: `Dans une classe de ${N} élèves, ${a} pratiquent la natation, ${b} pratiquent le judo et ${i} pratiquent les deux sports. On choisit un élève au hasard. Quelle est la probabilité qu'il pratique au moins un des deux sports ? (arrondi au centième)`, answer: num(round((a + b - i) / N, 2), 0.01), hints: H("P(A ∪ B) = P(A) + P(B) − P(A ∩ B).", `P(A) = ${a}/${N}, P(B) = ${b}/${N}, P(A ∩ B) = ${i}/${N}.`, `(${a} + ${b} − ${i})/${N}.`, "Calcule."), solution: `P = (${a} + ${b} − ${i})/${N} = ${a + b - i}/${N} ≈ ${fr(round((a + b - i) / N, 2))}.` };
  }),
  mk("pb-contraire", PB, 1, { skill: "Probabilité de l'événement contraire : P(Ā) = 1 − P(A)", ref: `${BOOK}, chap. 8 §2.1 (p. 131)`, kw: ["événement contraire", "P(A) + P(Ā) = 1", "probabilité"] }, (c, r) => {
    const F = int(r, 10, 40), G = int(r, 5, 30);
    return { statement: `Une classe compte ${F} filles et ${G} garçons. Un élève est absent. Quelle est la probabilité que l'élève absent soit un garçon ? (arrondi au centième)`, answer: num(round(G / (F + G), 2), 0.01), hints: H("Les événements « fille » et « garçon » sont contraires : P(G) = 1 − P(F).", `P(F) = ${F}/${F + G}.`, `1 − ${F}/${F + G}.`, "Calcule."), solution: `P(G) = 1 − ${F}/${F + G} = ${G}/${F + G} ≈ ${fr(round(G / (F + G), 2))}.` };
  }),
  mk("pb-deux-des", PB, 2, { skill: "Loi de probabilité du lancer de deux dés (somme ou nombre de 6)", ref: `${BOOK}, chap. 8 §2.1-2.2 (p. 131-133)`, kw: ["deux dés", "loi de probabilité", "somme", "équiprobabilité", "36 cas"] }, (c, r) => {
    const t = int(r, 0, 1);
    if (t === 0) { const s = int(r, 3, 11); let cnt = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === s) cnt++; return { statement: `On lance deux dés parfaits numérotés de 1 à 6 et on fait la somme des nombres obtenus. Quelle est la probabilité d'obtenir une somme égale à ${s} ? (arrondi au millième)`, answer: num(round(cnt / 36, 3), 0.001), hints: H("Il y a 6 × 6 = 36 couples équiprobables.", `Compte les couples (a, b) de somme ${s}.`, `Il y en a ${cnt}.`, `${cnt}/36.`), solution: `P = ${cnt}/36 ≈ ${fr(round(cnt / 36, 3))}.` }; }
    const k = int(r, 0, 2); const cnt = k === 0 ? 25 : k === 1 ? 10 : 1;
    return { statement: `On lance deux dés parfaits. Quelle est la probabilité d'obtenir exactement ${k} fois le 6 ? (arrondi au millième)`, answer: num(round(cnt / 36, 3), 0.001), hints: H("36 couples équiprobables.", k === 0 ? "Aucun 6 : 5 × 5 couples." : k === 1 ? "Un seul 6 : 2 × 5 couples." : "Deux 6 : 1 couple.", `Cas favorables : ${cnt}.`, `${cnt}/36.`), solution: `P = ${cnt}/36 ≈ ${fr(round(cnt / 36, 3))}.` };
  }),
  mk("pb-arbre", PB, 2, { skill: "Dénombrer avec un arbre de choix puis calculer une probabilité", ref: `${BOOK}, chap. 8 §3.1 (p. 133)`, kw: ["arbre de choix", "dénombrement", "probabilité", "modèles"] }, (c, r) => {
    const m = int(r, 2, 4), t = int(r, 3, 6);
    const fav = int(r, 1, t - 1);
    return { statement: `Un magasin propose ${m} types de canapés, chacun existant en ${t} revêtements. Un modèle est tiré au sort parmi tous les modèles. Quelle est la probabilité que le modèle ait l'un des ${fav} revêtements « neufs » ? (arrondi au centième)`, answer: num(round(fav / t, 2), 0.01), hints: H("L'arbre de choix compte m × t modèles équiprobables.", `Nombre de modèles : ${m} × ${t} = ${m * t}.`, `Modèles favorables : ${m} × ${fav} = ${m * fav}.`, `${m * fav}/${m * t}.`), solution: `P = ${m * fav}/${m * t} ≈ ${fr(round(fav / t, 2))}.` };
  }),
  mk("pb-cours", PB, 1, { skill: "Probabilités : vocabulaire et propriétés (cours)", ref: `${BOOK}, chap. 8 §1-2 (p. 126-132)`, kw: ["univers", "événement", "événements incompatibles", "équiprobabilité", "P(A)"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Qu'appelle-t-on univers d'une expérience aléatoire ?", good: "L'ensemble de tous les résultats possibles", bad: ["Un seul résultat", "Le résultat le plus probable", "Le nombre de résultats"], why: "Définition du manuel (§1.2)." },
      { q: "Deux événements incompatibles A et B vérifient :", good: "A ∩ B = ∅", bad: ["A ∪ B = Ω", "A = B", "A ⊂ B"], why: "Vocabulaire du manuel (§1.2) : événements incompatibles A ∩ B = ∅." },
      { q: "La probabilité d'un événement est :", good: "un nombre compris entre 0 et 1", bad: ["un nombre entier positif", "un nombre négatif", "un nombre supérieur à 1"], why: "Propriété du manuel (§2.1)." },
      { q: "Que vaut la probabilité de l'événement certain ?", good: "1", bad: ["0", "1/2", "Elle dépend de l'expérience"], why: "Propriété du manuel (§2.1)." },
      { q: "Que vaut P(A) + P(Ā) ?", good: "1", bad: ["0", "P(A)", "2"], why: "Propriété des événements contraires (§2.1)." },
      { q: "Si A et B sont incompatibles, P(A ∪ B) vaut :", good: "P(A) + P(B)", bad: ["P(A) × P(B)", "P(A) − P(B)", "1"], why: "Remarque du manuel (§2.1)." },
      { q: "Dans une situation d'équiprobabilité à n éventualités, la probabilité d'un événement élémentaire est :", good: "1/n", bad: ["n", "1/2", "n/2"], why: "Propriété du manuel (§1.3)." },
      { q: "Quand parle-t-on d'équiprobabilité ?", good: "Quand les événements élémentaires ont la même probabilité", bad: ["Quand il n'y a que deux issues", "Quand l'expérience est répétée", "Quand l'univers est infini"], why: "Vocabulaire du manuel (§1.3)." },
    ];
    return qcmOf(r, pool, "Reviens aux définitions du chapitre 8.");
  }, QCM),
];
