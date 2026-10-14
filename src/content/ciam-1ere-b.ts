// CIAM Première S : géométrie analytique du plan et transformations (translations, symétries, homothéties).
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("1ere", "ciam1");
const BOOK = "CIAM 1ère S";
const GA = "Géométrie analytique du plan — série C";
const TR = "Composées de transformations du plan — série C";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const term = (a: number, v: string, first: boolean) => {
  if (a === 0) return "";
  const m = Math.abs(a) === 1 ? "" : String(Math.abs(a));
  return first ? `${a < 0 ? "−" : ""}${m}${v}` : ` ${a < 0 ? "−" : "+"} ${m}${v}`;
};
/** Équation cartésienne ax + by + c = 0 écrite proprement. */
const eq = (a: number, b: number, c: number) => `${term(a, "x", true)}${term(b, "y", a === 0)}${c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`} = 0`;

export const T1B: Template[] = [
  // ===== Chapitre 3 : Géométrie analytique du plan =====
  mk("ga-normal", GA, 1, { skill: "Équation cartésienne d'une droite définie par un point et un vecteur normal", ref: `${BOOK}, chap. 3 §1.1 (p. 48) et ex. 1.a-1.b (p. 52)`, kw: ["vecteur normal", "équation cartésienne", "droite", "ax + by + c = 0"] }, (c, r) => {
    const a = int(r, -5, 5) || 2, b = int(r, -5, 5) || 3;
    const x0 = int(r, -5, 5), y0 = int(r, -5, 5);
    const cc = -(a * x0 + b * y0);
    return { statement: `Une droite passe par A(${S(x0)} ; ${S(y0)}) et admet le vecteur n(${S(a)} ; ${S(b)}) pour vecteur normal. Une de ses équations est ${term(a, "x", true)}${term(b, "y", false)} + c = 0. Quelle est la valeur de c ?`, answer: num(cc), hints: H("Si n(a ; b) est normal, la droite a pour équation ax + by + c = 0.", "A appartient à la droite : ses coordonnées vérifient l'équation.", `${a} × ${P(x0)} + ${P(b)} × ${P(y0)} + c = 0.`, "Isole c."), solution: `${a} × ${P(x0)} + ${P(b)} × ${P(y0)} + c = 0 donne c = ${S(cc)}.` };
  }),
  mk("ga-position", GA, 2, { skill: "Droites parallèles ou perpendiculaires d'après leurs équations", ref: `${BOOK}, chap. 3 §1.1, parallélisme et orthogonalité (p. 49) et ex. 1.c (p. 52)`, kw: ["parallèles", "perpendiculaires", "ab' − a'b = 0", "aa' + bb' = 0"] }, (c, r) => {
    const a = int(r, 1, 5), b = int(r, 1, 5);
    const k = pick(r, [1, 2, 3, -1, -2]);
    const kind = int(r, 0, 2);
    let a2: number, b2: number;
    if (kind === 0) { a2 = k * a; b2 = k * b; } else if (kind === 1) { a2 = -k * b; b2 = k * a; } else { a2 = a + int(r, 1, 3); b2 = b * 2 + 1; }
    const c1 = int(r, -6, 6), c2 = int(r, -6, 6);
    const par = a * b2 - a2 * b === 0, perp = a * a2 + b * b2 === 0;
    const idx = par ? 0 : perp ? 1 : 2;
    const sol = `ab' − a'b = ${a} × ${P(b2)} − ${P(a2)} × ${b} = ${a * b2 - a2 * b} ; aa' + bb' = ${a} × ${P(a2)} + ${b} × ${P(b2)} = ${a * a2 + b * b2}.`;
    return { statement: `Les droites (D) : ${eq(a, b, c1)} et (D') : ${eq(a2, b2, c2)} sont-elles parallèles, perpendiculaires, ou ni l'un ni l'autre ? (repère orthonormé)`, answer: { kind: "choice", options: ["Parallèles", "Perpendiculaires", "Ni parallèles ni perpendiculaires"], index: idx }, hints: H("Compare les vecteurs normaux n(a ; b) et n'(a' ; b').", "Parallèles ⇔ ab' − a'b = 0 ; perpendiculaires ⇔ aa' + bb' = 0.", sol, "Conclus."), solution: `${sol} Donc : ${["parallèles", "perpendiculaires", "ni parallèles ni perpendiculaires"][idx]}.` };
  }, QCM),
  mk("ga-distance", GA, 2, { skill: "Distance d'un point à une droite", ref: `${BOOK}, chap. 3 §1.2, propriété 2 (p. 50) et ex. 1.e (p. 52)`, kw: ["distance", "point", "droite", "|ax₀ + by₀ + c|/√(a²+b²)"] }, (c, r) => {
    const a = int(r, 1, 6), b = int(r, -6, 6) || 2, cc = int(r, -8, 8);
    const x0 = int(r, -5, 5), y0 = int(r, -5, 5);
    const d = Math.abs(a * x0 + b * y0 + cc) / Math.sqrt(a * a + b * b);
    return { statement: `Dans un repère orthonormé, calcule la distance du point A(${S(x0)} ; ${S(y0)}) à la droite (D) d'équation ${eq(a, b, cc)}. (arrondi au centième)`, answer: num(round(d, 2), 0.01), hints: H("d(A, D) = |a·x₀ + b·y₀ + c| / √(a² + b²).", `Numérateur : |${a} × ${P(x0)} + ${b} × ${P(y0)} + ${S(cc)}|.`, `= ${Math.abs(a * x0 + b * y0 + cc)}.`, `Dénominateur : √${a * a + b * b}.`), solution: `d = ${Math.abs(a * x0 + b * y0 + cc)}/√${a * a + b * b} ≈ ${fr(round(d, 2))}.` };
  }),
  mk("ga-normale", GA, 2, { skill: "Équation normale d'une droite : diviser par la norme du vecteur normal", ref: `${BOOK}, chap. 3 §1.2 (p. 49-50)`, kw: ["équation normale", "norme", "vecteur unitaire", "x cos θ + y sin θ + k = 0"] }, (c, r) => {
    const [a, b, h] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15]] as [number, number, number][]);
    const cc = int(r, -10, 10);
    const sa = int(r, 0, 1) === 0 ? 1 : -1;
    const A = sa * a;
    const x = round(A / h, 3), k = round(cc / h, 3);
    const ask = int(r, 0, 1) === 0;
    return { statement: `On écrit l'équation normale x·cos θ + y·sin θ + k = 0 de la droite d'équation ${eq(A, b, cc)}, en divisant par la norme du vecteur normal (a ; b). Quelle est la valeur de ${ask ? "cos θ" : "k"} ? (arrondi au millième)`, answer: num(ask ? x : k, 0.001), hints: H("Divise les deux membres par √(a² + b²).", `√(${A * A} + ${b * b}) = ${h}.`, ask ? `cos θ = a/${h}.` : `k = c/${h}.`, "Calcule."), solution: ask ? `cos θ = ${S(A)}/${h} ≈ ${S(x)}.` : `k = ${S(cc)}/${h} ≈ ${S(k)}.` };
  }),
  mk("ga-aire", GA, 3, { skill: "Aire d'un triangle ou d'un parallélogramme avec le déterminant", ref: `${BOOK}, chap. 3 §1.3, TD 2 (p. 52)`, kw: ["aire", "déterminant", "triangle", "parallélogramme"] }, (c, r) => {
    const A = [int(r, -4, 4), int(r, -4, 4)], B = [int(r, -4, 5), int(r, -4, 5)], C = [int(r, -4, 5), int(r, -4, 5)];
    const det = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]);
    const tri = int(r, 0, 1) === 0;
    const aire = tri ? Math.abs(det) / 2 : Math.abs(det);
    if (det === 0) C[1] += 1;
    const d2 = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]);
    const ai = tri ? Math.abs(d2) / 2 : Math.abs(d2);
    void aire;
    return { statement: `Dans un repère orthonormé direct, A(${S(A[0])} ; ${S(A[1])}), B(${S(B[0])} ; ${S(B[1])}) et C(${S(C[0])} ; ${S(C[1])}). Calcule l'aire ${tri ? "du triangle ABC" : "du parallélogramme construit sur AB et AC"}.`, answer: num(ai, 0.01), hints: H(tri ? "aire = ½ |det(AB, AC)|." : "aire = |det(AB, AC)|.", `AB(${S(B[0] - A[0])} ; ${S(B[1] - A[1])}) et AC(${S(C[0] - A[0])} ; ${S(C[1] - A[1])}).`, `det = ${S(B[0] - A[0])} × ${P(C[1] - A[1])} − ${P(C[0] - A[0])} × ${P(B[1] - A[1])} = ${S(d2)}.`, tri ? "Divise la valeur absolue par 2." : "Prends la valeur absolue."), solution: `det(AB, AC) = ${S(d2)}, donc l'aire vaut ${fr(ai)}.` };
  }),
  mk("ga-cercle-param", GA, 2, { skill: "Représentation paramétrique d'un cercle", ref: `${BOOK}, chap. 3 §2.1 (p. 53-54) et ex. 2.a-2.d (p. 57)`, kw: ["cercle", "représentation paramétrique", "x = a + r cos θ", "y = b + r sin θ"] }, (c, r) => {
    const a = int(r, -5, 5), b = int(r, -5, 5), rr = int(r, 1, 6);
    const th = pick(r, [["0", 1, 0], ["π/2", 0, 1], ["π", -1, 0], ["3π/2", 0, -1]] as [string, number, number][]);
    const ox = int(r, 0, 1) === 0;
    const v = ox ? a + rr * th[1] : b + rr * th[2];
    return { statement: `Le cercle (𝒞) a pour représentation paramétrique x = ${S(a)} + ${rr} cos θ, y = ${S(b)} + ${rr} sin θ (θ ∈ ℝ). Quelle est ${ox ? "l'abscisse" : "l'ordonnée"} du point de (𝒞) correspondant à θ = ${th[0]} ?`, answer: num(v), hints: H("On remplace θ par sa valeur.", `cos ${th[0]} = ${th[1]} et sin ${th[0]} = ${th[2]}.`, ox ? `x = ${S(a)} + ${rr} × ${P(th[1])}.` : `y = ${S(b)} + ${rr} × ${P(th[2])}.`, "Calcule."), solution: `${ox ? "x" : "y"} = ${S(v)}.` };
  }),
  mk("ga-cercle-rayon", GA, 3, { skill: "Centre et rayon d'un cercle d'après x² + y² − 2ax − 2by + c = 0", ref: `${BOOK}, chap. 3 §2.2, TD 1 (p. 54) et ex. 2.d-2.f (p. 57)`, kw: ["cercle", "centre", "rayon", "équation cartésienne", "x² + y²"] }, (c, r) => {
    const a = int(r, -4, 4), b = int(r, -4, 4), rr = int(r, 1, 6);
    const k = a * a + b * b - rr * rr;
    const ask = pick(r, ["de l'abscisse du centre", "de l'ordonnée du centre", "du rayon"]);
    const v = ask === "du rayon" ? rr : ask === "de l'abscisse du centre" ? a : b;
    const e = `x² + y²${term(-2 * a, "x", false)}${term(-2 * b, "y", false)}${k === 0 ? "" : ` ${k < 0 ? "−" : "+"} ${Math.abs(k)}`} = 0`;
    return { statement: `(𝒞) est l'ensemble des points du plan dont les coordonnées vérifient ${e}. Quelle est la valeur ${ask} de (𝒞) ?`, answer: num(v), hints: H("Mets l'équation sous la forme (x − a)² + (y − b)² = r².", "Complète les carrés en x et en y.", `Le centre est (${S(a)} ; ${S(b)}).`, `r² = ${rr * rr}.`), solution: `(x − ${P(a)})² + (y − ${P(b)})² = ${rr * rr} : centre (${S(a)} ; ${S(b)}), rayon ${rr}.` };
  }),
  mk("ga-tangente", GA, 3, { skill: "Tangente à un cercle en un point", ref: `${BOOK}, chap. 3 §2.2, TD 1 (p. 54-55)`, kw: ["tangente", "cercle", "point", "perpendiculaire au rayon"] }, (c, r) => {
    const [u, v] = pick(r, [[3, 4], [4, 3], [-3, 4], [3, -4], [5, 12], [12, 5], [0, 5], [5, 0], [-4, -3]] as [number, number][]);
    const a = int(r, -4, 4), b = int(r, -4, 4);
    const R2 = u * u + v * v;
    const x0 = a + u, y0 = b + v;
    const cc = -(u * x0 + v * y0);
    return { statement: `(𝒞) est le cercle de centre Ω(${S(a)} ; ${S(b)}) et de rayon √${R2}. A(${S(x0)} ; ${S(y0)}) est un point de (𝒞). La tangente en A a une équation de la forme ${eq(u, v, 0).replace(" = 0", "")} + c = 0. Quelle est la valeur de c ?`, answer: num(cc), hints: H("La tangente en A est perpendiculaire au rayon [ΩA] : ΩA est un vecteur normal.", `ΩA(${S(u)} ; ${S(v)}).`, `Écris que A appartient à la droite : ${u} × ${P(x0)} + ${v} × ${P(y0)} + c = 0.`, "Isole c."), solution: `ΩA(${S(u)} ; ${S(v)}) est normal à la tangente ; A en est un point : c = −(${u} × ${P(x0)} + ${v} × ${P(y0)}) = ${S(cc)}.` };
  }),
  mk("ga-cours", GA, 1, { skill: "Géométrie analytique du plan : cours (droites, cercles, distance)", ref: `${BOOK}, chap. 3 (p. 48-57)`, kw: ["vecteur normal", "distance d'un point à une droite", "cercle", "tangente"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "La droite d'équation ax + by + c = 0 admet pour vecteur normal :", good: "n(a ; b)", bad: ["n(−b ; a)", "n(b ; a)", "n(c ; a)"], why: "Propriété du manuel : n(a ; b) est normal ; u(−b ; a) est directeur." },
      { q: "La droite d'équation ax + by + c = 0 admet pour vecteur directeur :", good: "u(−b ; a)", bad: ["u(a ; b)", "u(b ; a)", "u(a ; −b)"], why: "u(−b ; a) vérifie u·n = −ab + ba = 0, donc est orthogonal à n(a ; b)." },
      { q: "Dans un repère orthonormé, (D) : ax + by + c = 0 et (D') : a'x + b'y + c' = 0 sont perpendiculaires si et seulement si :", good: "aa' + bb' = 0", bad: ["ab' − a'b = 0", "aa' − bb' = 0", "ab + a'b' = 0"], why: "Leurs vecteurs normaux sont orthogonaux : n·n' = aa' + bb' = 0." },
      { q: "(D) et (D') sont parallèles si et seulement si :", good: "ab' − a'b = 0", bad: ["aa' + bb' = 0", "aa' − bb' = 0", "ab + a'b' = 0"], why: "Leurs vecteurs normaux sont colinéaires : det(n, n') = ab' − a'b = 0." },
      { q: "La distance du point A(x₀ ; y₀) à la droite ax + by + c = 0 est :", good: "|ax₀ + by₀ + c| / √(a² + b²)", bad: ["|ax₀ + by₀ + c|", "(ax₀ + by₀ + c) / (a² + b²)", "|ax₀ + by₀| / √(a² + b²)"], why: "Propriété 2 du manuel (repère orthonormé)." },
      { q: "Quelle est une représentation paramétrique du cercle de centre Ω(a ; b) et de rayon r ?", good: "x = a + r cos θ, y = b + r sin θ", bad: ["x = a cos θ, y = b sin θ", "x = r + a cos θ, y = r + b sin θ", "x = a + r sin θ, y = b + r sin θ"], why: "M ∈ (𝒞) ⇔ ((x−a)/r)² + ((y−b)/r)² = 1 ⇔ ∃θ, x = a + r cos θ et y = b + r sin θ." },
      { q: "La tangente en A à un cercle de centre Ω est :", good: "la droite passant par A et perpendiculaire à (ΩA)", bad: ["la droite passant par A et parallèle à (ΩA)", "la droite (ΩA)", "la droite passant par Ω et perpendiculaire à (ΩA)"], why: "La tangente en A est l'ensemble des points M tels que AM·ΩA = 0." },
    ];
    return qcmOf(r, pool, "Pense aux vecteurs normaux et au produit scalaire.");
  }, QCM),

  // ===== Chapitres 4 et 5 : isométries et homothéties =====
  mk("tr-translation", TR, 1, { skill: "Expression analytique d'une translation", ref: `${BOOK}, chap. 4 §1.1 (p. 62-63) et ex. 1.a-1.f (p. 65)`, kw: ["translation", "expression analytique", "x' = x + a", "vecteur"] }, (c, r) => {
    const a = int(r, -6, 6), b = int(r, -6, 6), x = int(r, -6, 6), y = int(r, -6, 6);
    const ox = int(r, 0, 1) === 0;
    return { statement: `t est la translation de vecteur u(${S(a)} ; ${S(b)}). M a pour coordonnées (${S(x)} ; ${S(y)}). Quelle est ${ox ? "l'abscisse" : "l'ordonnée"} de M' = t(M) ?`, answer: num(ox ? x + a : y + b), hints: H("Expression analytique : x' = x + a et y' = y + b.", `Ici a = ${S(a)} et b = ${S(b)}.`, ox ? `x' = ${S(x)} + ${P(a)}.` : `y' = ${S(y)} + ${P(b)}.`, "Calcule."), solution: ox ? `x' = ${S(x)} + ${P(a)} = ${S(x + a)}.` : `y' = ${S(y)} + ${P(b)} = ${S(y + b)}.` };
  }),
  mk("tr-symetrie-axe", TR, 2, { skill: "Expression analytique d'une symétrie orthogonale d'axe particulier", ref: `${BOOK}, chap. 4 §1.2 (p. 65) et ex. 1.e (p. 65)`, kw: ["symétrie orthogonale", "axe", "expression analytique", "première bissectrice"] }, (c, r) => {
    const x = int(r, -6, 6), y = int(r, -6, 6);
    const k = int(r, -4, 4);
    const t = int(r, 0, 2);
    const ox = int(r, 0, 1) === 0;
    let xp: number, yp: number, axe: string, form: string;
    if (t === 0) { axe = `y = ${S(k)}`; xp = x; yp = -y + 2 * k; form = "x' = x et y' = −y + 2b"; } else if (t === 1) { axe = `x = ${S(k)}`; xp = -x + 2 * k; yp = y; form = "x' = −x + 2a et y' = y"; } else { axe = "y = x"; xp = y; yp = x; form = "x' = y et y' = x"; }
    return { statement: `Dans un repère orthonormé, s est la symétrie orthogonale d'axe (Δ) : ${axe}. Quelle est ${ox ? "l'abscisse" : "l'ordonnée"} de l'image du point M(${S(x)} ; ${S(y)}) par s ?`, answer: num(ox ? xp : yp), hints: H(`Pour cet axe : ${form}.`, "Ici, la droite est parallèle à un axe du repère ou est la première bissectrice.", "Remplace x, y et le paramètre de l'axe.", "Calcule."), solution: `M'(${S(xp)} ; ${S(yp)}).` };
  }),
  mk("tr-composee-sym", TR, 3, { skill: "Composée de deux symétries orthogonales d'axes parallèles", ref: `${BOOK}, chap. 4 §1.2, propriété (p. 63-64)`, kw: ["composée", "symétries orthogonales", "axes parallèles", "translation", "2OO'"] }, (c, r) => {
    const a = int(r, -5, 5);
    let a2 = int(r, -5, 5);
    if (a2 === a) a2 = a + 2;
    return { statement: `(Δ) : x = ${S(a)} et (Δ') : x = ${S(a2)}. La composée s_Δ' ∘ s_Δ est la translation de vecteur 2·OO' (O ∈ (Δ), O' projeté orthogonal de O sur (Δ')). Quelle est l'abscisse de ce vecteur de translation ?`, answer: num(2 * (a2 - a)), hints: H("Le vecteur de translation est 2·OO', où O ∈ (Δ) et O' ∈ (Δ').", "OO' est horizontal, d'abscisse a' − a.", `a' − a = ${S(a2)} − ${P(a)}.`, "Multiplie par 2."), solution: `2·OO' a pour abscisse 2 × (${S(a2)} − ${P(a)}) = ${S(2 * (a2 - a))}.` };
  }),
  mk("tr-homothetie-image", TR, 2, { skill: "Image d'un point par une homothétie (expression analytique)", ref: `${BOOK}, chap. 5 §1.1 (p. 88-89)`, kw: ["homothétie", "centre", "rapport", "expression analytique", "x' = kx + (1−k)x₀"] }, (c, r) => {
    const k = pick(r, [2, 3, -1, -2, 0.5, -0.5, 4]);
    const x0 = int(r, -4, 4), y0 = int(r, -4, 4), x = int(r, -6, 6), y = int(r, -6, 6);
    const ox = int(r, 0, 1) === 0;
    const xp = k * x + (1 - k) * x0, yp = k * y + (1 - k) * y0;
    return { statement: `h est l'homothétie de centre Ω(${S(x0)} ; ${S(y0)}) et de rapport ${S(k)}. Quelle est ${ox ? "l'abscisse" : "l'ordonnée"} de l'image de M(${S(x)} ; ${S(y)}) par h ?`, answer: num(ox ? xp : yp, 0.01), hints: H("ΩM' = k·ΩM, donc x' − x₀ = k(x − x₀) et y' − y₀ = k(y − y₀).", ox ? `x' = ${S(x0)} + ${P(k)} × (${S(x)} − ${P(x0)}).` : `y' = ${S(y0)} + ${P(k)} × (${S(y)} − ${P(y0)}).`, "Développe.", "Calcule."), solution: ox ? `x' = ${S(x0)} + ${P(k)} × ${S(x - x0)} = ${S(xp)}.` : `y' = ${S(y0)} + ${P(k)} × ${S(y - y0)} = ${S(yp)}.` };
  }),
  mk("tr-homothetie-grandeurs", TR, 1, { skill: "Homothétie : longueurs et aires (A'B' = |k|·AB)", ref: `${BOOK}, chap. 5 §1.1 (p. 88-89)`, kw: ["homothétie", "rapport", "longueur", "A'B' = k AB"] }, (c, r) => {
    const k = pick(r, [2, 3, -1, -2, 0.5, -0.5, 4, -3]);
    const L = int(r, 2, 12);
    const aire = c === "situation" ? false : int(r, 0, 1) === 0;
    return { statement: aire ? `h est une homothétie de rapport ${S(k)}. Un triangle d'aire ${L} cm² a pour image un triangle. Quelle est son aire (en cm²) ?` : `h est une homothétie de rapport ${S(k)}. Si AB = ${L} cm, que vaut A'B' (en cm) ?`, answer: num(aire ? L * k * k : L * Math.abs(k), 0.01), hints: aire ? H("Les longueurs sont multipliées par |k|.", "Les aires sont multipliées par k².", `k² = ${fr(k * k)}.`, "Multiplie.") : H("A'B' = k·AB (vecteurs), donc A'B' = |k| × AB (longueurs).", `|k| = ${fr(Math.abs(k))}.`, `${fr(Math.abs(k))} × ${L}.`, "Calcule."), solution: aire ? `Aire = ${fr(k * k)} × ${L} = ${fr(L * k * k)} cm².` : `A'B' = ${fr(Math.abs(k))} × ${L} = ${fr(L * Math.abs(k))} cm.` };
  }),
  mk("tr-cours", TR, 1, { skill: "Translations, symétries orthogonales et homothéties : propriétés", ref: `${BOOK}, chap. 4 §1 et chap. 5 §1 (p. 62-65, 88-89)`, kw: ["translation", "symétrie orthogonale", "homothétie", "composée", "réciproque"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Que vaut la composée t_u ∘ t_v de deux translations ?", good: "La translation de vecteur u + v", bad: ["La translation de vecteur u − v", "L'identité", "Une symétrie"], why: "Propriété du manuel : t_u ∘ t_v = t_{u+v} (et la composée est commutative)." },
      { q: "Quelle est la transformation réciproque de la translation t_u ?", good: "t_{−u}", bad: ["t_u", "La symétrie de centre O", "L'homothétie de rapport −1"], why: "t_u ∘ t_{−u} = Id." },
      { q: "Que vaut s_Δ ∘ s_Δ (même axe) ?", good: "L'identité", bad: ["Une translation non nulle", "Une rotation", "s_Δ"], why: "Quand les axes sont confondus, la composée est l'identité." },
      { q: "s_Δ' ∘ s_Δ avec (Δ) ∥ (Δ') est :", good: "Une translation", bad: ["Une symétrie orthogonale", "Une homothétie", "L'identité dans tous les cas"], why: "C'est la translation de vecteur 2·OO' (O ∈ Δ, O' projeté de O sur Δ')." },
      { q: "L'homothétie de centre O et de rapport −1 est :", good: "La symétrie de centre O", bad: ["L'identité", "La symétrie orthogonale d'axe passant par O", "La translation de vecteur nul"], why: "OM' = −OM : O est le milieu de [MM']." },
      { q: "Quelle est la réciproque de l'homothétie h(O, k) ?", good: "h(O, 1/k)", bad: ["h(O, −k)", "h(O, k)", "h(O, k²)"], why: "Toute homothétie est une transformation, de réciproque h(O, 1/k)." },
      { q: "h est une homothétie de rapport k, d'images A' et B' de A et B. Que peut-on écrire ?", good: "A'B' = k·AB (vecteurs)", bad: ["A'B' = AB", "A'B' = k + AB", "A'B' = −AB"], why: "Propriété caractéristique des homothéties." },
      { q: "Quels sont les points invariants d'une translation de vecteur non nul ?", good: "Aucun", bad: ["Tous les points", "Un seul point", "Les points d'une droite"], why: "Si u ≠ 0, aucun point n'est invariant (manuel p. 62)." },
    ];
    return qcmOf(r, pool, "Rappelle-toi la définition de chaque transformation.");
  }, QCM),
];
