// CIAM Première S (SM) : barycentre, angles orientés et trigonométrie. Énoncés originaux, réponses calculées par le code.
// Notions « série C » ; les gabarits sont aussi proposés en série D quand la notion existe (voir ciam-1ere.ts).
import { choice, fr, gcd, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("1ere", "ciam1");
const BOOK = "CIAM 1ère S";
const FR = [{ id: "calcul", label: "Calcul" }];
const BA = "Barycentre — série C";
const AT = "Angles orientés et trigonométrie — série C";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

/** Angle remarquable (en radians) avec son écriture. */
const ANG: { t: string; v: number }[] = [
  { t: "0", v: 0 }, { t: "π/6", v: Math.PI / 6 }, { t: "π/4", v: Math.PI / 4 }, { t: "π/3", v: Math.PI / 3 }, { t: "π/2", v: Math.PI / 2 },
  { t: "2π/3", v: (2 * Math.PI) / 3 }, { t: "3π/4", v: (3 * Math.PI) / 4 }, { t: "5π/6", v: (5 * Math.PI) / 6 }, { t: "π", v: Math.PI },
  { t: "−π/6", v: -Math.PI / 6 }, { t: "−π/4", v: -Math.PI / 4 }, { t: "−π/3", v: -Math.PI / 3 }, { t: "−π/2", v: -Math.PI / 2 },
  { t: "−2π/3", v: (-2 * Math.PI) / 3 }, { t: "−3π/4", v: (-3 * Math.PI) / 4 }, { t: "−5π/6", v: (-5 * Math.PI) / 6 },
];

export const T1A: Template[] = [
  // ===== Chapitre 1 : Barycentre =====
  mk("bary-coef", BA, 1, { skill: "Barycentre de deux points pondérés : AG = b/(a+b) AB", ref: `${BOOK}, chap. 1 §1 (p. 6-7) et ex. 1.a-1.b (p. 10)`, kw: ["barycentre", "points pondérés", "AG", "coefficient"] }, (c, r) => {
    const a = int(r, 1, 6), b = int(r, 1, 6);
    const [p, q] = [b / gcd(b, a + b), (a + b) / gcd(b, a + b)];
    const k = round(b / (a + b), 4);
    const st = `G est le barycentre des points pondérés (A, ${a}) et (B, ${b}). On écrit AG = k·AB. Calcule k (valeur décimale arrondie au centième).`;
    return { statement: st, answer: num(round(k, 2), 0.01), hints: H("G vérifie a·GA + b·GB = 0 (vecteurs).", "Cela donne AG = b/(a+b) · AB.", `a + b = ${a + b}.`, `k = ${b}/${a + b}.`), solution: `AG = ${b}/(${a} + ${b}) AB = ${p}/${q} AB ≈ ${fr(round(k, 2))}.` };
  }),
  mk("bary-inverse", BA, 2, { skill: "Retrouver les coefficients à partir de AG = k·AB", ref: `${BOOK}, chap. 1 §1.2 (p. 7) et ex. 1.b (p. 10)`, kw: ["barycentre", "AG = k AB", "couple de coefficients"] }, (_c, r) => {
    const q = int(r, 3, 9);
    let p = int(r, 1, q - 1);
    while (gcd(p, q) !== 1) p = int(r, 1, q - 1);
    return { statement: `G est le point tel que AG = ${p}/${q} AB. G est le barycentre de (A, ${q - p}) et (B, b). Quelle est la valeur de b ?`, answer: num(p), hints: H("Si G = bar{(A,a),(B,b)} alors AG = b/(a+b) AB.", `On identifie b/(a+b) à ${p}/${q}.`, `Avec a = ${q - p}, on cherche b tel que a + b = ${q}.`, `b = ${q} − ${q - p}.`), solution: `AG = b/(a+b) AB avec a = ${q - p} et a + b = ${q} : b = ${p}.` };
  }),
  mk("bary-coord", BA, 2, { skill: "Coordonnées du barycentre de deux points", ref: `${BOOK}, chap. 1 §1.2 (p. 8) et ex. 1.c (p. 10)`, kw: ["barycentre", "coordonnées", "points pondérés", "repère"] }, (c, r) => {
    const a = int(r, 1, 5), b = int(r, 1, 5);
    const xa = int(r, -6, 6), ya = int(r, -6, 6), xb = int(r, -6, 6), yb = int(r, -6, 6);
    const xg = (a * xa + b * xb) / (a + b), yg = (a * ya + b * yb) / (a + b);
    const ox = int(r, 0, 1) === 0;
    const v = ox ? xg : yg;
    return {
      statement: `Le plan est muni d'un repère. A(${S(xa)} ; ${S(ya)}) et B(${S(xb)} ; ${S(yb)}). G est le barycentre de (A, ${a}) et (B, ${b}). Quelle est l'${ox ? "abscisse" : "ordonnée"} de G ? (arrondi au centième)`,
      answer: num(round(v, 2), 0.01),
      hints: H("x_G = (a·x_A + b·x_B)/(a + b) et de même pour y.", `a + b = ${a + b}.`, ox ? `${a} × ${P(xa)} + ${b} × ${P(xb)} = ${a * xa + b * xb}.` : `${a} × ${P(ya)} + ${b} × ${P(yb)} = ${a * ya + b * yb}.`, "Divise par a + b."),
      solution: ox ? `x_G = (${a} × ${P(xa)} + ${b} × ${P(xb)})/${a + b} = ${a * xa + b * xb}/${a + b} ≈ ${S(round(xg, 2))}.` : `y_G = (${a} × ${P(ya)} + ${b} × ${P(yb)})/${a + b} = ${a * ya + b * yb}/${a + b} ≈ ${S(round(yg, 2))}.`,
    };
  }),
  mk("bary-trois", BA, 3, { skill: "Coordonnées du barycentre de trois points", ref: `${BOOK}, chap. 1 §2.2 (p. 11-12) et ex. 2.a-2.c (p. 15)`, kw: ["barycentre", "trois points", "coordonnées", "isobarycentre", "centre de gravité"] }, (c, r) => {
    const a = int(r, 1, 4), b = int(r, 1, 4), cc = int(r, 1, 4);
    const pts = [0, 1, 2].map(() => [int(r, -5, 6), int(r, -5, 6)]);
    const s = a + b + cc;
    const x = (a * pts[0][0] + b * pts[1][0] + cc * pts[2][0]) / s;
    const y = (a * pts[0][1] + b * pts[1][1] + cc * pts[2][1]) / s;
    const ox = int(r, 0, 1) === 0;
    const w = [a, b, cc];
    const k = ox ? 0 : 1;
    const num_ = w.reduce((t, wi, i) => t + wi * pts[i][k], 0);
    return {
      statement: `Dans un repère, A(${S(pts[0][0])} ; ${S(pts[0][1])}), B(${S(pts[1][0])} ; ${S(pts[1][1])}) et C(${S(pts[2][0])} ; ${S(pts[2][1])}). G est le barycentre de (A, ${a}), (B, ${b}) et (C, ${cc}). Quelle est l'${ox ? "abscisse" : "ordonnée"} de G ? (arrondi au centième)`,
      answer: num(round(ox ? x : y, 2), 0.01),
      hints: H("On généralise la formule : (a·x_A + b·x_B + c·x_C)/(a + b + c).", `a + b + c = ${s}.`, `Numérateur = ${num_}.`, "Divise."),
      solution: `${ox ? "x" : "y"}_G = ${num_}/${s} ≈ ${S(round(ox ? x : y, 2))}.`,
    };
  }),
  mk("bary-cours", BA, 1, { skill: "Propriétés du barycentre : existence, homogénéité, ensemble des barycentres", ref: `${BOOK}, chap. 1 §1-2 (p. 6-13)`, kw: ["barycentre", "homogénéité", "a+b ≠ 0", "droite (AB)", "isobarycentre"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "À quelle condition les points pondérés (A,a) et (B,b) admettent-ils un barycentre ?", good: "a + b ≠ 0", bad: ["a ≠ b", "a et b sont positifs", "a × b ≠ 0"], why: "Le barycentre de (A,a) et (B,b) existe si et seulement si a + b ≠ 0." },
      { q: "Le barycentre de (A,2) et (B,6) est aussi le barycentre de :", good: "(A,1) et (B,3)", bad: ["(A,2) et (B,3)", "(A,1) et (B,6)", "(A,6) et (B,2)"], why: "Homogénéité : on peut multiplier tous les coefficients par un même réel non nul (ici 1/2)." },
      { q: "A et B sont deux points distincts. Quel est l'ensemble des barycentres de A et B ?", good: "La droite (AB)", bad: ["Le segment [AB] seulement", "Le milieu de [AB]", "Le plan tout entier"], why: "Théorème : l'ensemble des barycentres de deux points distincts A et B est la droite (AB)." },
      { q: "Quel est le barycentre de (A,1) et (B,1) ?", good: "Le milieu de [AB]", bad: ["Le point A", "Le point B", "Le symétrique de A par rapport à B"], why: "Avec des coefficients égaux (isobarycentre), on obtient le milieu." },
      { q: "Si G est le barycentre de (A,a) et (B,b) avec a + b ≠ 0, que vaut a·GA + b·GB (vecteurs) ?", good: "Le vecteur nul", bad: ["a + b", "Le vecteur AB", "Le réel 0"], why: "Définition : G est l'unique point tel que a·GA + b·GB = 0 (vecteur nul)." },
      { q: "Si a + b = 0 (avec a ≠ 0), le vecteur a·MA + b·MB :", good: "ne dépend pas du point M", bad: ["est toujours nul", "dépend de M", "vaut (a+b)·MG"], why: "Quand a + b = 0, a·MA + b·MB = b·AB : il est indépendant de M." },
      { q: "Où se trouve l'isobarycentre de trois points A, B, C non alignés ?", good: "Au centre de gravité du triangle ABC", bad: ["Au centre du cercle circonscrit", "À l'orthocentre", "Au milieu de [AB]"], why: "L'isobarycentre de trois points non alignés est le centre de gravité du triangle." },
      { q: "G est le barycentre de (A,3) et (B,−2). Où se trouve G par rapport au segment [AB] ?", good: "Sur la droite (AB), en dehors du segment [AB]", bad: ["Au milieu de [AB]", "À l'intérieur du segment [AB]", "Hors de la droite (AB)"], why: "Les coefficients sont de signes contraires : G est sur (AB) mais à l'extérieur du segment, du côté du plus grand coefficient en valeur absolue." },
    ];
    return qcmOf(r, pool, "Pense à la définition a·GA + b·GB = 0.");
  }, QCM),
  mk("bary-reduction", BA, 2, { skill: "Réduction de a·MA + b·MB", ref: `${BOOK}, chap. 1 §1.2 (p. 8) et ex. 1.d (p. 10)`, kw: ["réduction", "somme vectorielle", "a MA + b MB", "(a+b) MG"] }, (c, r) => {
    const a = int(r, 1, 7), b = int(r, 1, 7);
    const aa = int(r, 0, 1) === 0 ? a : -a;
    const bb = int(r, 0, 1) === 0 ? b : -b;
    const s = aa + bb;
    if (s === 0) return { statement: `G est le barycentre de (A, ${aa}) et (B, ${bb + 1}). Pour tout point M, ${aa}·MA + ${S(bb + 1)}·MB = k·MG. Quelle est la valeur de k ?`, answer: num(aa + bb + 1), hints: H("a·MA + b·MB = (a + b)·MG si a + b ≠ 0.", `a + b = ${aa} + ${bb + 1}.`, `${aa + bb + 1}.`, "Calcule."), solution: `k = a + b = ${aa + bb + 1}.` };
    return { statement: `G est le barycentre de (A, ${aa}) et (B, ${bb}). Pour tout point M, ${aa}·MA + ${S(bb)}·MB = k·MG. Quelle est la valeur de k ?`, answer: num(s), hints: H("Pour tout M : a·MA + b·MB = (a + b)·MG, si G = bar{(A,a),(B,b)}.", `a + b = ${aa} + ${P(bb)}.`, `${s}.`, "Calcule."), solution: `k = a + b = ${aa} + ${P(bb)} = ${s}.` };
  }),

  // ===== Chapitre 2 : Angles orientés et trigonométrie =====
  mk("ao-principale", AT, 2, { skill: "Mesure principale d'un angle orienté", ref: `${BOOK}, chap. 2 §1.1 (p. 24-25) et ex. 1.a (p. 26)`, kw: ["mesure principale", "angle orienté", "]−π ; π]", "congruence modulo 2π"] }, (c, r) => {
    const d = pick(r, [3, 4, 6]);
    const k = int(r, 4, 14) * 2;
    const N = (r() < 0.5 ? -1 : 1) * (k * d + int(r, 1, 2 * d - 1));
    let m = ((N % (2 * d)) + 2 * d) % (2 * d);
    if (m > d) m -= 2 * d;
    return { statement: `Un angle orienté a pour mesure ${S(N)}π/${d}. Sa mesure principale est de la forme mπ/${d}. Quelle est la valeur de m ?`, answer: num(m), hints: H("La mesure principale est l'unique mesure dans ]−π ; π].", `On retire des multiples de 2π = ${2 * d}π/${d}.`, `Divise ${N} par ${2 * d} et regarde le reste.`, `m doit être dans ]−${d} ; ${d}].`), solution: `${N} ≡ ${m} [${2 * d}], donc la mesure principale est ${S(m)}π/${d}.` };
  }),
  mk("ao-conversion", AT, 1, { skill: "Conversion degrés ↔ radians", ref: `${BOOK}, chap. 2 §1.1, remarque (p. 26)`, kw: ["radian", "degré", "conversion", "x/π = y/180"] }, (c, r) => {
    const [n, d] = pick(r, [[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [3, 2], [5, 4], [7, 6]] as [number, number][]);
    const deg = (180 * n) / d;
    return { statement: `Convertis ${n === 1 ? "" : n}π/${d} radians en degrés.`, answer: num(deg, 0.01), hints: H("x/π = y/180 (x en radians, y en degrés).", "y = 180 × x/π.", `y = 180 × ${n}/${d}.`, "Calcule."), solution: `y = 180 × ${n}/${d} = ${fr(deg)}°.` };
  }),
  mk("ao-chasles", AT, 2, { skill: "Relation de Chasles pour les angles orientés", ref: `${BOOK}, chap. 2 §2.1 (p. 27) et ex. 2.b (p. 31)`, kw: ["relation de chasles", "somme d'angles", "angle orienté"] }, (c, r) => {
    const a = pick(r, [30, 45, 60, 90, 120, 135, 150, 75, 100]);
    const b = pick(r, [30, 45, 60, 90, 120, 135, 150, 75, 110, -30, -45, -60, -90]);
    let m = (a + b) % 360;
    if (m > 180) m -= 360;
    if (m <= -180) m += 360;
    return { statement: `On donne (u,v) = ${a}° et (v,w) = ${S(b)}°. Quelle est la mesure principale de (u,w), en degrés ?`, answer: num(m), hints: H("Chasles : (u,v) + (v,w) = (u,w).", `${a} + ${P(b)} = ${a + b}.`, "Ramène à ]−180° ; 180°] en ajoutant ou retranchant 360°.", "Calcule."), solution: `(u,w) = ${a}° + ${P(b)}° = ${a + b}° ≡ ${S(m)}° [360°].` };
  }),
  mk("ao-cours", AT, 1, { skill: "Propriétés des angles orientés : opposé, colinéarité, doubles, cocyclicité", ref: `${BOOK}, chap. 2 §2 (p. 27-30)`, kw: ["angle orienté", "colinéaires", "cocycliques", "double", "tangente"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "k > 0 : que vaut (k·u, v) ?", good: "(u, v)", bad: ["(u, v) + π", "−(u, v)", "2(u, v)"], why: "Multiplier un vecteur par un réel strictement positif ne change pas l'angle orienté." },
      { q: "k < 0 : que vaut (k·u, v) ?", good: "(u, v) + π", bad: ["(u, v)", "−(u, v)", "(u, v) − π/2"], why: "Multiplier par un réel négatif retourne le vecteur : on ajoute π." },
      { q: "Que vaut (v, u) en fonction de (u, v) ?", good: "−(u, v)", bad: ["(u, v)", "(u, v) + π", "2(u, v)"], why: "Les angles (u, v) et (v, u) sont opposés." },
      { q: "À quelle condition les points A, B, C distincts sont-ils alignés ?", good: "2(AB, AC) = 0", bad: ["(AB, AC) = π/2", "2(AB, AC) = π", "(AB, AC) = π/3"], why: "2(AB,AC) = 0 équivaut à (AB,AC) = 0 ou π : les vecteurs AB et AC sont colinéaires." },
      { q: "Que signifie 2α = 0 pour un angle orienté α ?", good: "α = 0 ou α = π", bad: ["α = 0 seulement", "α = π/2", "α = π/2 ou α = −π/2"], why: "2α = 0 équivaut à α = kπ, c'est-à-dire α = 0 ou α = π (mod 2π)." },
      { q: "Que signifie 2α = π pour un angle orienté α ?", good: "α = π/2 ou α = −π/2", bad: ["α = π/2 seulement", "α = 0 ou α = π", "α = π"], why: "2α = π équivaut à α = π/2 ou α = −π/2 (mod 2π)." },
      { q: "O est le centre d'un cercle passant par A et B. M ≠ A, B. M appartient au cercle si et seulement si :", good: "2(MA, MB) = (OA, OB)", bad: ["(MA, MB) = (OA, OB)", "2(MA, MB) = 0", "(MA, MB) = π/2"], why: "Caractérisation du cercle par les angles orientés (propriété du manuel, §2.3)." },
      { q: "A, B, C, D sont quatre points distincts dont trois quelconques ne sont pas alignés. Ils sont cocycliques si et seulement si :", good: "2(CA, CB) = 2(DA, DB)", bad: ["(CA, CB) = (DB, DA)", "2(CA, CB) = 0", "(CA, CB) = (DA, DC)"], why: "Propriété du manuel : A, B, C, D sont cocycliques si et seulement si 2(CA,CB) = 2(DA,DB)." },
      { q: "Que vaut (u, v) + (v, w) ?", good: "(u, w)", bad: ["(w, u)", "(u, w) + π", "(v, u)"], why: "Relation de Chasles pour les angles orientés." },
    ];
    return qcmOf(r, pool, "Relis les propriétés du §2 du chapitre.");
  }, QCM),
  mk("trig-valeurs", AT, 1, { skill: "Lignes trigonométriques des angles remarquables", ref: `${BOOK}, chap. 2 §3.1 (p. 32) et tableau des angles remarquables`, kw: ["cosinus", "sinus", "tangente", "angles remarquables", "π/6", "π/4", "π/3"] }, (c, r) => {
    const a = pick(r, ANG.filter((x) => x.t !== "π/2" && x.t !== "−π/2"));
    const fn = pick(r, ["cos", "sin", "tan"] as const);
    const val = fn === "cos" ? Math.cos(a.v) : fn === "sin" ? Math.sin(a.v) : Math.tan(a.v);
    return { statement: `Donne la valeur de ${fn}(${a.t}) arrondie au millième.`, answer: num(round(val, 3), 0.001), hints: H("Utilise le tableau des angles remarquables et le cercle trigonométrique.", "Repère le quadrant pour trouver le signe.", fn === "tan" ? "tan = sin / cos." : "Ramène-toi à un angle du premier quadrant.", "Donne une valeur décimale."), solution: `${fn}(${a.t}) ≈ ${fr(round(val, 3))}.` };
  }),
  mk("trig-pythagore", AT, 2, { skill: "cos² + sin² = 1 : retrouver sin α connaissant cos α", ref: `${BOOK}, chap. 2 §3.1, remarques (p. 32)`, kw: ["cos² + sin² = 1", "sinus", "cosinus", "relation fondamentale"] }, (c, r) => {
    const [a, b, h] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]] as [number, number, number][]);
    const cosPos = int(r, 0, 1) === 0;
    const up = int(r, 0, 1) === 0;
    const cosv = (cosPos ? a : -a) / h;
    const sinv = (up ? b : -b) / h;
    return { statement: `α est un réel tel que cos α = ${S(cosPos ? a : -a)}/${h} et ${up ? "sin α > 0" : "sin α < 0"}. Calcule sin α (valeur décimale arrondie au centième).`, answer: num(round(sinv, 2), 0.01), hints: H("cos² α + sin² α = 1.", `sin² α = 1 − (${a}/${h})².`, `sin² α = ${b * b}/${h * h}.`, `Choisis le signe de sin α d'après l'énoncé.`), solution: `sin² α = 1 − ${a * a}/${h * h} = ${b * b}/${h * h}, donc sin α = ${up ? "" : "−"}${b}/${h} ≈ ${S(round(sinv, 2))}.` };
  }),
  mk("trig-tangente", AT, 2, { skill: "Tangente d'un angle : tan α = sin α / cos α", ref: `${BOOK}, chap. 2 §3.1, tangente (p. 32)`, kw: ["tangente", "tan α", "sin/cos", "1 + tan² α"] }, (c, r) => {
    const [a, b, h] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]] as [number, number, number][]);
    const sa = int(r, 0, 1) === 0 ? 1 : -1, sb = int(r, 0, 1) === 0 ? 1 : -1;
    const t = (sb * b) / (sa * a);
    return { statement: `cos α = ${S(sa * a)}/${h} et sin α = ${S(sb * b)}/${h}. Calcule tan α (valeur décimale arrondie au centième).`, answer: num(round(t, 2), 0.01), hints: H("tan α = sin α / cos α.", "Les dénominateurs égaux se simplifient.", `tan α = ${S(sb * b)}/${S(sa * a)}.`, "Calcule."), solution: `tan α = ${S(sb * b)}/${S(sa * a)} ≈ ${S(round(t, 2))}.` };
  }),
  mk("trig-cours", AT, 1, { skill: "Cercle trigonométrique, lignes trigonométriques : propriétés", ref: `${BOOK}, chap. 2 §3.1 (p. 32)`, kw: ["cercle trigonométrique", "périodicité", "cos² + sin² = 1", "tangente"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle est la relation fondamentale entre cos α et sin α ?", good: "cos² α + sin² α = 1", bad: ["cos α + sin α = 1", "cos α − sin α = 1", "cos² α − sin² α = 1"], why: "M(cos α ; sin α) est sur le cercle trigonométrique de rayon 1." },
      { q: "Entre quelles valeurs varient cos α et sin α ?", good: "Entre −1 et 1", bad: ["Entre 0 et 1", "Entre 0 et 2π", "Entre −π et π"], why: "Ce sont les coordonnées d'un point du cercle de rayon 1 : −1 ≤ cos α ≤ 1 et −1 ≤ sin α ≤ 1." },
      { q: "Que vaut cos(α + 2kπ), k entier relatif ?", good: "cos α", bad: ["−cos α", "sin α", "cos α + 2k"], why: "Le cosinus est 2π-périodique." },
      { q: "Pour quels réels α la tangente n'est-elle pas définie ?", good: "α = π/2 + kπ (k entier relatif)", bad: ["α = kπ", "α = 2kπ", "Pour aucun réel"], why: "tan α = sin α/cos α n'existe pas quand cos α = 0, c'est-à-dire pour α = π/2 + kπ." },
      { q: "Que vaut tan(α + kπ) (k entier relatif) ?", good: "tan α", bad: ["−tan α", "1/tan α", "tan α + k"], why: "La tangente est π-périodique." },
      { q: "Quelle est la valeur de 1 + tan² α (cos α ≠ 0) ?", good: "1/cos² α", bad: ["1/sin² α", "cos² α", "1"], why: "1 + sin²α/cos²α = (cos²α + sin²α)/cos²α = 1/cos²α." },
      { q: "Que vaut cos(π/3) ?", good: "1/2", bad: ["√3/2", "√2/2", "1"], why: "Valeur remarquable du tableau." },
      { q: "Que vaut sin(π/4) ?", good: "√2/2", bad: ["1/2", "√3/2", "1"], why: "Valeur remarquable du tableau." },
    ];
    return qcmOf(r, pool, "Pense au cercle trigonométrique.");
  }, QCM),
  mk("trig-equation", AT, 3, { skill: "Équations trigonométriques : nombre de solutions dans un intervalle", ref: `${BOOK}, chap. 2 §4 (p. 37-40)`, kw: ["équation trigonométrique", "cos x = cos a", "sin x = sin a", "solutions", "intervalle"] }, (c, r) => {
    const a = pick(r, ANG.filter((x) => Math.abs(x.v) > 1e-9 && Math.abs(Math.abs(x.v) - Math.PI) > 1e-9 && Math.abs(Math.abs(x.v) - Math.PI / 2) > 1e-9));
    const useCos = int(r, 0, 1) === 0;
    const wide = int(r, 0, 1) === 0;
    const lo = wide ? 0 : -Math.PI, hi = wide ? 2 * Math.PI : Math.PI;
    const sols = new Set<number>();
    for (let k = -4; k <= 4; k++) {
      const cand = useCos ? [a.v + 2 * k * Math.PI, -a.v + 2 * k * Math.PI] : [a.v + 2 * k * Math.PI, Math.PI - a.v + 2 * k * Math.PI];
      for (const x of cand) {
        const inI = wide ? x >= -1e-9 && x < 2 * Math.PI - 1e-9 : x > -Math.PI + 1e-9 && x <= Math.PI + 1e-9;
        if (inI) sols.add(round(x, 6));
      }
    }
    void lo; void hi;
    const I = wide ? "[0 ; 2π[" : "]−π ; π]";
    return { statement: `Combien l'équation ${useCos ? "cos" : "sin"} x = ${useCos ? "cos" : "sin"}(${a.t}) a-t-elle de solutions dans l'intervalle ${I} ?`, answer: num(sols.size), hints: H(useCos ? "cos x = cos a ⇔ x = a + 2kπ ou x = −a + 2kπ." : "sin x = sin a ⇔ x = a + 2kπ ou x = π − a + 2kπ.", "Écris les deux familles de solutions.", `Cherche les entiers k pour lesquels la solution est dans ${I}.`, "Compte les valeurs distinctes."), solution: `Il y a ${sols.size} solution${sols.size > 1 ? "s" : ""} dans ${I}.` };
  }, FR),
  mk("trig-inequation", AT, 3, { skill: "Inéquations trigonométriques : mesure de l'ensemble des solutions", ref: `${BOOK}, chap. 2 §5 (p. 41-43)`, kw: ["inéquation trigonométrique", "cos x > a", "sin x > a", "cercle trigonométrique"] }, (c, r) => {
    const th = pick(r, [[0.5, "1/2"], [Math.SQRT1_2, "√2/2"], [Math.sqrt(3) / 2, "√3/2"], [0, "0"], [-0.5, "−1/2"]] as [number, string][]);
    const useCos = int(r, 0, 1) === 0;
    let cnt = 0;
    const n = 36000;
    for (let i = 0; i < n; i++) {
      const x = -Math.PI + ((i + 0.5) * 2 * Math.PI) / n;
      if ((useCos ? Math.cos(x) : Math.sin(x)) > th[0]) cnt++;
    }
    const len = (cnt / n) * 2; // longueur / π
    return { statement: `On résout ${useCos ? "cos" : "sin"} x > ${th[1]} dans ]−π ; π]. L'ensemble des solutions est une réunion d'intervalles de longueur totale kπ. Quelle est la valeur de k ? (arrondi au centième)`, answer: num(round(len, 2), 0.01), hints: H("Trace le cercle trigonométrique et repère les points où la ligne vaut le seuil.", useCos ? "Les solutions sont les points d'abscisse supérieure au seuil." : "Les solutions sont les points d'ordonnée supérieure au seuil.", "Calcule la longueur de l'arc concerné.", "Divise par π."), solution: `La longueur totale des solutions est ${fr(round(len, 2))}π.` };
  }, FR),
];
