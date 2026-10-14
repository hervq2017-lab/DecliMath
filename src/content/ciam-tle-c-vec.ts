// CIAM Terminale SM (série C) : chapitre 2, Calcul vectoriel (barycentres, lignes de niveau, produit vectoriel).
// Énoncés originaux, réponses calculées par le code. Les constructions et démonstrations du manuel ne se corrigent pas
// automatiquement : on en garde les calculs (coordonnées, longueurs, aires, volumes) et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, f, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtv");
const BOOK = "CIAM Terminale SM";
const BL = "Barycentre et lignes de niveaux — série C";
const GE = "Géométrie analytique dans l'espace — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
const n2 = (x: number) => (x < 0 ? `−${fr(x * -1)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
type V3 = [number, number, number];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (a: V3) => Math.sqrt(dot(a, a));
const pt = (p: V3) => `(${n2(p[0])} ; ${n2(p[1])} ; ${n2(p[2])})`;
const rv = (r: Rng, k = 5): V3 => [int(r, -k, k), int(r, -k, k), int(r, -k, k)];
const sq = (x: number) => `${fr(r2(x))}`;
/** Combinaison linéaire écrite proprement : 4MA − MB − 2MC. */
const lc = (cs: number[], names: string[]) => cs.map((c, i) => (c === 0 ? "" : `${i === 0 ? (c < 0 ? "−" : "") : c < 0 ? " − " : " + "}${Math.abs(c) === 1 ? "" : Math.abs(c)}${names[i]}`)).join("") || "0";

export const TC_VEC: Template[] = [
  // ===== 1. Barycentre de n points pondérés =====
  mk("bar-coordonnees", BL, 2, { skill: "Coordonnées du barycentre de points pondérés (plan ou espace)", ref: `${BOOK}, chap. 2 §1.2, coordonnées du barycentre (p. 35) et ex. 1.d (p. 38) et ex. 8 (p. 50)`, kw: ["barycentre", "points pondérés", "coordonnées", "isobarycentre", "coefficients"] }, (_c, r) => {
    const n = int(r, 2, 3), al = Array.from({ length: n }, () => nz(r, -3, 5));
    let S = al.reduce((s, a) => s + a, 0); if (S === 0) { al[0] += 1; S = 1; }
    const P: V3[] = al.map(() => rv(r, 6)), k = int(r, 0, 2);
    const G = [0, 1, 2].map((i) => al.reduce((s, a, j) => s + a * P[j][i], 0) / S);
    const lab = ["x", "y", "z"][k], names = ["A", "B", "C"].slice(0, n);
    return { statement: `Dans l'espace muni d'un repère, ${names.map((m, j) => `${m} ${pt(P[j])}`).join(", ")}. G est le barycentre des points pondérés ${names.map((m, j) => `(${m}, ${n2(al[j])})`).join(", ")}. Quelle est la coordonnée ${lab} de G (arrondie au centième) ?`, answer: num(r2(G[k]), 0.01), hints: H("La somme des coefficients n'est pas nulle : le barycentre existe.", "x_G = Σ αᵢ xᵢ / Σ αᵢ (de même pour y et z).", `Σ αᵢ = ${al.map(n2).join(" + ")} = ${S}.`, `Calcule Σ αᵢ ${lab}ᵢ puis divise par ${S}.`), solution: `${lab}_G = (${al.map((a, j) => `${par(a)} × ${par(P[j][k])}`).join(" + ")}) / ${S} = ${n2(al.reduce((s, a, j) => s + a * P[j][k], 0))}/${S} ≈ ${fr(r2(G[k]))}.` };
  }, FR),
  mk("bar-reduction", BL, 3, { skill: "Réduire Σ αᵢ MAᵢ (somme nulle ou non nulle) et vecteur constant", ref: `${BOOK}, chap. 2 §1.2, réduction de la somme (p. 35) et ex. 1.c (p. 38) et ex. 5 (p. 50)`, kw: ["réduction", "Σ αᵢ MAᵢ", "(Σ αᵢ) MG", "vecteur indépendant de M", "somme nulle"] }, (_c, r) => {
    const a = nz(r, -4, 5), b = nz(r, -4, 5), c = nz(r, -4, 5), S = a + b + c;
    if (S !== 0) return { statement: `Pour tout point M, on réduit ${lc([a, b, c], ["MA", "MB", "MC"])} en k MG, où G est le barycentre de (A, ${n2(a)}), (B, ${n2(b)}), (C, ${n2(c)}). Quelle est la valeur de k ?`, answer: num(S), hints: H("Si la somme des coefficients est non nulle, Σ αᵢ MAᵢ = (Σ αᵢ) MG.", `Calcule ${n2(a)} + ${par(b)} + ${par(c)}.`, "C'est le coefficient devant MG.", "Additionne."), solution: `k = ${n2(a)} + ${par(b)} + ${par(c)} = ${S}.` };
    const b2 = nz(r, -4, 4), c2 = nz(r, -4, 4), a2 = -(b2 + c2), A = rv(r, 4), B = rv(r, 4), C = rv(r, 4), k = int(r, 0, 2);
    const v = b2 * (B[k] - A[k]) + c2 * (C[k] - A[k]);
    return { statement: `Les coefficients ${n2(a2)}, ${n2(b2)} et ${n2(c2)} ont une somme nulle : le vecteur u = ${lc([a2, b2, c2], ["MA", "MB", "MC"])} ne dépend pas de M. Avec A ${pt(A)}, B ${pt(B)} et C ${pt(C)}, quelle est la ${["première", "deuxième", "troisième"][k]} coordonnée de u ?`, answer: num(v), hints: H("Comme u ne dépend pas de M, on peut choisir M = A.", `Alors u = ${lc([b2, c2], ["AB", "AC"])}.`, `AB (${sub(B, A).map(n2).join(" ; ")}) et AC (${sub(C, A).map(n2).join(" ; ")}).`, "Calcule la coordonnée demandée."), solution: `u = ${lc([b2, c2], ["AB", "AC"])}, donc la coordonnée vaut ${par(b2)} × ${par(B[k] - A[k])} + ${par(c2)} × ${par(C[k] - A[k])} = ${n2(v)}.` };
  }, FR),
  mk("bar-coefficient", BL, 2, { skill: "Écrire un point comme barycentre : coefficients à partir d'une relation vectorielle", ref: `${BOOK}, chap. 2 §1.3 (p. 36-37) et ex. 1.a-1.b, 1.f (p. 38) et ex. 5-6 (p. 50)`, kw: ["barycentre", "relation vectorielle", "AG = β/(α+β+γ) AB + …", "coefficients", "colinéaire"] }, (_c, r) => {
    const a = int(r, 1, 4), b = nz(r, -3, 5), c = int(r, 1, 4), S = a + b + c;
    if (S === 0) return { statement: "Calcule 2 + 3.", answer: num(5), hints: H("Additionne.", "2 + 3.", "5.", "5."), solution: "2 + 3 = 5." };
    const wantB = int(r, 0, 1) === 0;
    return { statement: `G est le barycentre des points pondérés (A, ${a}), (B, ${n2(b)}) et (C, ${c}). On écrit AG = λAB + μAC. Quelle est la valeur de ${wantB ? "λ" : "μ"} (arrondie au centième) ?`, answer: num(r2((wantB ? b : c) / S), 0.01), hints: H("Pour tout M, Σ αᵢ MAᵢ = (Σ αᵢ) MG ; avec M = A, on obtient une relation entre AG, AB et AC.", `${n2(b)}AB + ${c}AC = ${S}AG.`, "Divise par la somme des coefficients.", `${wantB ? "λ" : "μ"} = ${n2(wantB ? b : c)} / ${S}.`), solution: `AG = (${n2(b)}AB + ${c}AC)/${S}, donc ${wantB ? "λ" : "μ"} = ${n2(wantB ? b : c)}/${S} ≈ ${fr(r2((wantB ? b : c) / S))}.` };
  }, FR),
  mk("bar-partiel", BL, 3, { skill: "Barycentre partiel : associativité (poids du barycentre partiel)", ref: `${BOOK}, chap. 2 §1.2, barycentres partiels (p. 36) et §1.4 (p. 37) et ex. 3-4, 12 (p. 50)`, kw: ["barycentre partiel", "associativité", "centre de gravité", "tétraèdre", "isobarycentre"] }, (_c, r) => {
    const a = int(r, 1, 4), b = int(r, 1, 5), c = int(r, 1, 5), d = int(r, 1, 4);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `G est le barycentre de (A, ${a}), (B, ${b}), (C, ${c}), (D, ${d}). H est le barycentre partiel de (B, ${b}) et (C, ${c}). Par associativité, G est le barycentre de (A, ${a}), (H, p), (D, ${d}). Quelle est la valeur de p ?`, answer: num(b + c), hints: H("On remplace plusieurs points par leur barycentre partiel.", "Ce barycentre est affecté de la somme des coefficients remplacés.", `${b} + ${c}.`, "Additionne."), solution: `p = ${b} + ${c} = ${b + c}.` };
    return { statement: `ABCD est un tétraèdre, G son centre de gravité et G′ celui du triangle BCD. Sachant que G est le barycentre de (A, 1) et (G′, p), quelle est la valeur de p ?`, answer: num(3), hints: H("G est l'isobarycentre de A, B, C, D (coefficients 1).", "G′ est l'isobarycentre de B, C, D : on le remplace par (G′, 1 + 1 + 1).", "Écris G comme barycentre de (A, 1) et (G′, ?).", "Additionne les trois coefficients."), solution: `GA + GB + GC + GD = 0 ⇔ GA + 3GG′ = 0 : G = bar{(A, 1), (G′, 3)}, donc p = 3.` };
  }, FR),
  mk("bar-niveau-cercle", BL, 3, { skill: "Ligne de niveau de M ↦ Σ αᵢ MAᵢ² (somme non nulle) : cercle, rayon", ref: `${BOOK}, chap. 2 §2.1, 1ᵉʳ cas (p. 39) et exemple du rectangle (p. 39) et ex. 2.a (p. 43) et ex. 20-23 (p. 51)`, kw: ["ligne de niveau", "MA² + MB² = k", "cercle", "centre G", "rayon", "isobarycentre"] }, (_c, r) => {
    const R = int(r, 2, 9), d = 2 * int(r, 1, 6), k = 2 * R * R + (d * d) / 2;
    return { statement: `A et B sont deux points tels que AB = ${d}. On cherche l'ensemble des points M tels que MA² + MB² = ${k}. C'est un cercle. Quel est son rayon ?`, answer: num(R), hints: H("La somme des coefficients vaut 2, non nulle : la ligne de niveau est un cercle de centre G (milieu de [AB]).", "Σ αᵢ MAᵢ² = (Σ αᵢ) MG² + Σ αᵢ GAᵢ².", `GA² = GB² = (${d}/2)² = ${(d * d) / 4}.`, `2MG² + ${d * d / 2} = ${k}, donc MG² = ?`), solution: `2MG² + 2 × ${(d * d) / 4} = ${k}, donc MG² = ${R * R} et le rayon vaut ${R}.` };
  }, FR),
  mk("bar-niveau-rapport", BL, 3, { skill: "Ligne de niveau de M ↦ MA/MB : cercle d'Apollonius", ref: `${BOOK}, chap. 2 §2.2, rapport MA/MB (p. 41) et ex. 2.b (p. 43)`, kw: ["MA/MB = k", "cercle d'Apollonius", "diamètre [IJ]", "barycentre", "médiatrice"] }, (_c, r) => {
    const k = pick(r, [2, 3, 1 / 2, 2 / 3, 3 / 2, 1 / 3, 3 / 4, 4 / 3, 5 / 3]), d = int(r, 3, 12);
    const ka = k === 1 / 2 ? "1/2" : k === 2 / 3 ? "2/3" : k === 3 / 2 ? "3/2" : k === 1 / 3 ? "1/3" : k === 3 / 4 ? "3/4" : k === 4 / 3 ? "4/3" : k === 5 / 3 ? "5/3" : String(k);
    const R = (k * d) / Math.abs(1 - k * k);
    return { statement: `A et B sont deux points tels que AB = ${d}. L'ensemble des points M tels que MA/MB = ${ka} est un cercle. Quel est son rayon (arrondi au centième) ?`, answer: num(r2(R), 0.01), hints: H("Pour k ≠ 1, MA/MB = k équivaut à MA² − k²MB² = 0.", "C'est le cercle de centre le barycentre de (A, 1), (B, −k²) et de rayon k·AB / |1 − k²|.", `k = ${ka}, AB = ${d}.`, `${ka} × ${d} ÷ |1 − ${ka}²|.`), solution: `Rayon = k·AB/|1 − k²| = ${ka} × ${d} / |1 − ${ka}²| ≈ ${fr(r2(R))}.` };
  }, FR),
  mk("bar-niveau-droite", BL, 3, { skill: "Ligne de niveau lorsque Σ αᵢ = 0 : droite perpendiculaire à (AB)", ref: `${BOOK}, chap. 2 §2.1, 2ᵉ cas (p. 40) et exemples (p. 40-41)`, kw: ["MA² − MB² = k", "droite", "somme des coefficients nulle", "vecteur normal", "perpendiculaire à (AB)"] }, (_c, r) => {
    const d = int(r, 2, 10), k = int(r, -20, 30);
    const x = (k + d * d) / (2 * d);
    return { statement: `A(0 ; 0) et B(${d} ; 0) dans un repère orthonormé. L'ensemble des points M tels que MA² − MB² = ${n2(k)} est une droite perpendiculaire à (AB). Quelle est son abscisse x (arrondie au centième) ?`, answer: num(r2(x), 0.01), hints: H("La somme des coefficients (1 et −1) est nulle : la ligne de niveau est une droite.", "Avec M(x ; y) : MA² = x² + y² et MB² = (x − " + d + ")² + y².", `MA² − MB² = 2${d}x − ${d * d}.`, `Résous 2 × ${d} × x − ${d * d} = ${n2(k)}.`), solution: `${2 * d}x − ${d * d} = ${n2(k)}, donc x = ${n2(k + d * d)}/${2 * d} ≈ ${fr(r2(x))}.` };
  }, FR),
  mk("bar-niveau-angle", BL, 3, { skill: "Ligne de niveau de M ↦ Mes(MA, MB) : arc de cercle, angle au centre, rayon", ref: `${BOOK}, chap. 2 §2.3, propriétés 1 et 2 (p. 42) et exemples (p. 43) et ex. 2.d (p. 43)`, kw: ["Mes(MA, MB)", "arc capable", "angle orienté", "angle au centre", "demi-cercle", "cocycliques"] }, (_c, r) => {
    const a = pick(r, [30, 45, 60, 75, 120, 135, 150]), d = int(r, 3, 12), R = d / (2 * Math.sin((a * Math.PI) / 180));
    if (int(r, 0, 1) === 0) return { statement: `A et B sont deux points distincts et O est le centre de l'arc des points M tels que Mes(MA, MB) = ${a}°. Quelle est la mesure de l'angle au centre Mes(OA, OB) (en degrés) ?`, answer: num(2 * a), hints: H("Un angle inscrit mesure la moitié de l'angle au centre qui intercepte le même arc.", "Mes(OA, OB) = 2 Mes(MA, MB) (modulo 2π).", `2 × ${a}.`, "Calcule."), solution: `Mes(OA, OB) = 2 × ${a}° = ${2 * a}° (modulo 360°).` };
    return { statement: `AB = ${d}. Les points M tels que Mes(MA, MB) = ${a}° décrivent un arc de cercle passant par A et B. Quel est le rayon de ce cercle (arrondi au centième) ?`, answer: num(r2(R), 0.01), hints: H("Le théorème des sinus donne le rayon du cercle circonscrit à AMB.", "AB / sin(AMB) = 2R.", `R = ${d} / (2 sin ${a}°).`, "Calcule."), solution: `R = ${d} / (2 sin ${a}°) ≈ ${fr(r2(R))}.` };
  }, FR),
  mk("bar-cours", BL, 1, { skill: "Barycentres et lignes de niveau : questions de cours", ref: `${BOOK}, chap. 2 §1 et §2 (p. 34-42)`, kw: ["barycentre", "homogénéité", "associativité", "isobarycentre", "ligne de niveau", "somme des coefficients"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "À quelle condition les points pondérés (Aᵢ, αᵢ) admettent-ils un barycentre ?", good: "Σ αᵢ ≠ 0", bad: ["Σ αᵢ = 0", "tous les αᵢ sont positifs", "les Aᵢ sont alignés"], why: "Théorème, p. 34." },
      { q: "Que devient le barycentre si on multiplie tous les coefficients par un réel k ≠ 0 ?", good: "Il est inchangé", bad: ["Il est multiplié par k", "Il est divisé par k", "Il disparaît"], why: "Propriété d'homogénéité, p. 34." },
      { q: "Comment appelle-t-on le barycentre de points pondérés affectés de coefficients égaux ?", good: "L'isobarycentre", bad: ["Le barycentre partiel", "Le point invariant", "Le centre de symétrie"], why: "Remarque p. 34." },
      { q: "Si Σ αᵢ = 0, que dire du vecteur Σ αᵢ MAᵢ ?", good: "Il est indépendant de M", bad: ["Il est nul pour tout M", "Il dépend de M", "Il n'existe pas"], why: "Propriété de réduction, p. 35." },
      { q: "Quel est l'ensemble des barycentres de deux points distincts A et B ?", good: "La droite (AB)", bad: ["Le segment [AB]", "Le cercle de diamètre [AB]", "Le plan (AB)"], why: "Propriété p. 36." },
      { q: "Quel est l'ensemble des barycentres de trois points non alignés A, B, C ?", good: "Le plan (ABC)", bad: ["Le triangle ABC", "La droite (AB)", "L'espace entier"], why: "Propriété p. 37." },
      { q: "Quelle propriété permet de remplacer plusieurs points par leur barycentre partiel ?", good: "L'associativité", bad: ["La commutativité", "L'homogénéité", "La réduction"], why: "Propriété des barycentres partiels, p. 36." },
      { q: "Si Σ αᵢ ≠ 0, la ligne de niveau de M ↦ Σ αᵢ MAᵢ² est…", good: "∅, un point ou un cercle de centre G", bad: ["une droite", "toujours un cercle", "toujours un point"], why: "Propriété p. 39." },
      { q: "Si Σ αᵢ = 0 et u = Σ αᵢ OAᵢ ≠ 0, la ligne de niveau de M ↦ Σ αᵢ MAᵢ² est…", good: "une droite de vecteur normal u", bad: ["un cercle", "∅ toujours", "un plan"], why: "Propriété p. 40." },
      { q: "Pour k > 0, k ≠ 1, la ligne de niveau de M ↦ MA/MB est…", good: "le cercle de diamètre [IJ]", bad: ["la médiatrice de [AB]", "la droite (AB)", "un point"], why: "Propriété p. 41." },
      { q: "Pour k = 1, la ligne de niveau de M ↦ MA/MB est…", good: "la médiatrice de [AB]", bad: ["un cercle", "la droite (AB)", "l'ensemble vide"], why: "§2.2, p. 41." },
      { q: "L'ensemble des points M tels que Mes(MA, MB) = 0 est…", good: "la droite (AB) privée du segment [AB]", bad: ["le segment [AB]", "un cercle", "la médiatrice de [AB]"], why: "Propriétés 1, p. 42." },
    ];
    return qcmOf(r, pool, "Reviens à la condition Σ αᵢ ≠ 0 ou = 0.");
  }, QCM),

  // ===== 3. Produit vectoriel =====
  mk("pv-orientation", GE, 2, { skill: "Orientation d'une base de l'espace : directe ou indirecte", ref: `${BOOK}, chap. 2 §3.1 (p. 44) et ex. 3.a (p. 49) et ex. 28, 33 (p. 51)`, kw: ["base directe", "base indirecte", "orientation", "bonhomme d'Ampère", "cube", "permutation"] }, (_c, r) => {
    const P: Record<string, V3> = { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] };
    const L = Object.keys(P);
    for (let tries = 0; tries < 200; tries++) {
      const pick2 = (): [string, string] => { let a = pick(r, L), b = pick(r, L); while (a === b) b = pick(r, L); return [a, b]; };
      const vs = [pick2(), pick2(), pick2()], v = vs.map(([a, b]) => sub(P[b], P[a])), det = dot(v[0], cross(v[1], v[2]));
      if (det === 0) continue;
      return { statement: `ABCDEFGH est un cube tel que (AB, AD, AE) soit une base directe. La base (${vs.map(([a, b]) => `${a}${b}`).join(", ")}) est-elle directe ou indirecte ?`, answer: choice(r, ["Directe", "Indirecte"], det > 0 ? 0 : 1), hints: H("On compare avec la base directe (AB, AD, AE).", "Permuter deux vecteurs ou en remplacer un par son opposé change l'orientation.", `Écris chaque vecteur avec AB, AD, AE : ${vs.map(([a, b], i) => `${a}${b} (${v[i].join(" ; ")})`).join(", ")}.`, "Le signe du déterminant des trois vecteurs donne l'orientation."), solution: `Le déterminant des coordonnées dans la base (AB, AD, AE) vaut ${det} : la base est ${det > 0 ? "directe" : "indirecte"}.` };
    }
    return { statement: "(AB, AD, AE) est-elle une base directe ?", answer: choice(r, ["Directe", "Indirecte"], 0), hints: H("Par hypothèse.", "Oui.", "Oui.", "Oui."), solution: "Par hypothèse." };
  }, QCM),
  mk("pv-coordonnees", GE, 2, { skill: "Coordonnées du produit vectoriel dans une base orthonormée directe", ref: `${BOOK}, chap. 2 §3.2, expression analytique (p. 46-47) et ex. 3.d (p. 49)`, kw: ["produit vectoriel", "coordonnées", "déterminants", "(yz′ − zy′ ; zx′ − xz′ ; xy′ − yx′)"] }, (_c, r) => {
    const u = rv(r, 4), v = rv(r, 4), w = cross(u, v), k = int(r, 0, 2);
    return { statement: `Dans une base orthonormée directe, u (${u.map(n2).join(" ; ")}) et v (${v.map(n2).join(" ; ")}). Quelle est la ${["première", "deuxième", "troisième"][k]} coordonnée de u ∧ v ?`, answer: num(w[k]), hints: H("On utilise l'expression analytique du produit vectoriel.", "u ∧ v = (yz′ − zy′ ; zx′ − xz′ ; xy′ − yx′).", k === 0 ? `${n2(u[1])} × ${par(v[2])} − ${par(u[2])} × ${par(v[1])}.` : k === 1 ? `${n2(u[2])} × ${par(v[0])} − ${par(u[0])} × ${par(v[2])}.` : `${n2(u[0])} × ${par(v[1])} − ${par(u[1])} × ${par(v[0])}.`, "Calcule les deux produits puis soustrais."), solution: `u ∧ v = (${w.map(n2).join(" ; ")}).` };
  }, FR),
  mk("pv-calcul-algebrique", GE, 3, { skill: "Règles de calcul : (au + bv) ∧ (cu + dv) = (ad − bc) u ∧ v", ref: `${BOOK}, chap. 2 §3.2, propriétés 2 (p. 46) et ex. 3.c (p. 49) et ex. 32 (p. 51)`, kw: ["produit vectoriel", "bilinéaire", "antisymétrique", "u ∧ u = 0", "développer"] }, (_c, r) => {
    const a = nz(r, -4, 4), b = nz(r, -4, 4), c = nz(r, -4, 4), d = nz(r, -4, 4), e = a * d - b * c;
    return { statement: `u et v sont deux vecteurs non colinéaires et w = u ∧ v. On pose p = (${lc([a, b], ["u", "v"])}) ∧ (${lc([c, d], ["u", "v"])}). On écrit p = λw. Quelle est la valeur de λ ?`, answer: num(e), hints: H("Le produit vectoriel est bilinéaire, antisymétrique, et u ∧ u = 0.", "Développe : (au + bv) ∧ (cu + dv) = ac u∧u + ad u∧v + bc v∧u + bd v∧v.", "u ∧ u = v ∧ v = 0 et v ∧ u = −(u ∧ v).", "λ = ad − bc."), solution: `λ = ${a} × ${par(d)} − ${par(b)} × ${par(c)} = ${n2(e)}.` };
  }, FR),
  mk("pv-aire-triangle", GE, 3, { skill: "Aire d'un triangle : ½ ‖AB ∧ AC‖", ref: `${BOOK}, chap. 2 §3.3, calculs d'aire (p. 49) et ex. 3.f (p. 49) et ex. 30-31 (p. 51)`, kw: ["aire d'un triangle", "produit vectoriel", "‖AB ∧ AC‖", "norme"] }, (_c, r) => {
    for (;;) {
      const A = rv(r, 4), B = rv(r, 4), C = rv(r, 4), w = cross(sub(B, A), sub(C, A));
      if (norm(w) === 0) continue;
      const S = norm(w) / 2;
      return { statement: `Dans un repère orthonormé direct, A ${pt(A)}, B ${pt(B)} et C ${pt(C)}. Quelle est l'aire du triangle ABC (arrondie au centième) ?`, answer: num(r2(S), 0.01), hints: H("𝒜 = ½ ‖AB ∧ AC‖.", `AB (${sub(B, A).map(n2).join(" ; ")}) et AC (${sub(C, A).map(n2).join(" ; ")}).`, "Calcule le produit vectoriel AB ∧ AC puis sa norme.", "Divise par 2."), solution: `AB ∧ AC = (${w.map(n2).join(" ; ")}), norme √${dot(w, w)} ≈ ${sq(norm(w))} ; aire ≈ ${fr(r2(S))}.` };
    }
  }, FR),
  mk("pv-volume-tetraedre", GE, 3, { skill: "Volume d'un tétraèdre : ⅙ |(AB ∧ AC) · AD|", ref: `${BOOK}, chap. 2 §3.3, calculs de volume (p. 49) et ex. 3.f (p. 49)`, kw: ["volume d'un tétraèdre", "produit mixte", "(AB ∧ AC).AD", "1/6"] }, (_c, r) => {
    for (;;) {
      const A = rv(r, 3), B = rv(r, 3), C = rv(r, 3), D = rv(r, 3), m = dot(cross(sub(B, A), sub(C, A)), sub(D, A));
      if (m === 0) continue;
      return { statement: `Dans un repère orthonormé direct, A ${pt(A)}, B ${pt(B)}, C ${pt(C)} et D ${pt(D)}. Quel est le volume du tétraèdre ABCD (arrondi au centième) ?`, answer: num(r2(Math.abs(m) / 6), 0.01), hints: H("V = ⅙ |(AB ∧ AC) · AD|.", "Calcule d'abord AB ∧ AC.", "Fais ensuite le produit scalaire avec AD.", "Prends la valeur absolue puis divise par 6."), solution: `(AB ∧ AC) · AD = ${n2(m)} ; V = |${n2(m)}| / 6 ≈ ${fr(r2(Math.abs(m) / 6))}.` };
    }
  }, FR),
  mk("pv-alignement", GE, 2, { skill: "Reconnaître trois points alignés avec AB ∧ AC = 0", ref: `${BOOK}, chap. 2 §3.2, remarque (p. 47) et ex. 3.d (p. 49)`, kw: ["points alignés", "produit vectoriel nul", "colinéaires", "AB ∧ AC = 0"] }, (_c, r) => {
    const A = rv(r, 4), u = rv(r, 3), al = int(r, 0, 1) === 0, k = nz(r, -3, 3), B: V3 = [A[0] + u[0], A[1] + u[1], A[2] + u[2]], C: V3 = al ? [A[0] + k * u[0], A[1] + k * u[1], A[2] + k * u[2]] : rv(r, 5);
    const w = cross(sub(B, A), sub(C, A)), ok = w[0] === 0 && w[1] === 0 && w[2] === 0;
    return { statement: `Dans un repère orthonormé direct, A ${pt(A)}, B ${pt(B)} et C ${pt(C)}. Les points A, B, C sont-ils alignés ?`, answer: choice(r, ["Oui", "Non"], ok ? 0 : 1), hints: H("A, B, C alignés équivaut à AB ∧ AC = 0.", `AB (${sub(B, A).map(n2).join(" ; ")}) et AC (${sub(C, A).map(n2).join(" ; ")}).`, "Calcule les trois coordonnées de AB ∧ AC.", "Si l'une est non nulle, ils ne sont pas alignés."), solution: `AB ∧ AC = (${w.map(n2).join(" ; ")}) ${ok ? "= 0 : alignés." : "≠ 0 : non alignés."}` };
  }, QCM),
  mk("pv-plan-equation", GE, 3, { skill: "Équation d'un plan déterminé par trois points (normal AB ∧ AC)", ref: `${BOOK}, chap. 2 §3.3, équation d'un plan (p. 47) et ex. 3.e (p. 49)`, kw: ["équation d'un plan", "vecteur normal", "AB ∧ AC", "trois points non alignés", "ax + by + cz + d = 0"] }, (_c, r) => {
    for (;;) {
      const A = rv(r, 4), B = rv(r, 4), C = rv(r, 4), n = cross(sub(B, A), sub(C, A));
      if (n[0] === 0 && n[1] === 0 && n[2] === 0) continue;
      const d = -(n[0] * A[0] + n[1] * A[1] + n[2] * A[2]);
      return { statement: `Dans un repère orthonormé direct, A ${pt(A)}, B ${pt(B)} et C ${pt(C)} définissent un plan. En prenant pour vecteur normal AB ∧ AC = (${n.map(n2).join(" ; ")}), le plan a une équation de la forme ${lc(n, ["x", "y", "z"])} + d = 0. Quelle est la valeur de d ?`, answer: num(d), hints: H("A appartient au plan : ses coordonnées vérifient l'équation.", "Remplace x, y, z par les coordonnées de A.", `${n2(n[0])} × ${par(A[0])} + ${par(n[1])} × ${par(A[1])} + ${par(n[2])} × ${par(A[2])} + d = 0.`, "Isole d."), solution: `d = −(${n2(n[0] * A[0])} + ${par(n[1] * A[1])} + ${par(n[2] * A[2])}) = ${n2(d)}.` };
    }
  }, FR),
  mk("pv-distance-plan", GE, 3, { skill: "Distance d'un point à un plan : |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²)", ref: `${BOOK}, chap. 2 §3.3, distance à un plan (p. 48-49) et ex. 3.e-3.f (p. 49)`, kw: ["distance d'un point à un plan", "équation cartésienne", "projeté orthogonal", "|ax₀ + by₀ + cz₀ + d|"] }, (_c, r) => {
    for (;;) {
      const n = rv(r, 4), d = int(r, -8, 8), M = rv(r, 5), N = norm(n);
      if (N === 0) continue;
      const num0 = Math.abs(dot(n, M) + d), D = num0 / N;
      return { statement: `Dans un repère orthonormé, (𝒫) est le plan d'équation ${lc(n, ["x", "y", "z"])} ${d < 0 ? "−" : "+"} ${Math.abs(d)} = 0 et M ${pt(M)}. Quelle est la distance de M à (𝒫) (arrondie au centième) ?`, answer: num(r2(D), 0.01), hints: H("On utilise la formule de la distance d'un point à un plan.", "d = |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²).", `Numérateur : |${n2(n[0])}×${par(M[0])} + ${par(n[1])}×${par(M[1])} + ${par(n[2])}×${par(M[2])} + ${par(d)}|.`, `Dénominateur : √${dot(n, n)}.`), solution: `d = ${n2(num0)} / √${dot(n, n)} ≈ ${fr(r2(D))}.` };
    }
  }, FR),
  mk("pv-distance-droite", GE, 3, { skill: "Distance d'un point à une droite : ‖MA ∧ u‖ / ‖u‖", ref: `${BOOK}, chap. 2 §3.3, distance à une droite (p. 48) et ex. 3.f (p. 49)`, kw: ["distance d'un point à une droite", "‖MA ∧ u‖", "vecteur directeur", "projeté orthogonal"] }, (_c, r) => {
    for (;;) {
      const A = rv(r, 4), u = rv(r, 3), M = rv(r, 5), w = cross(sub(M, A), u);
      if (norm(u) === 0 || norm(w) === 0) continue;
      const D = norm(w) / norm(u);
      return { statement: `Dans un repère orthonormé direct, (𝒟) est la droite passant par A ${pt(A)} et de vecteur directeur u (${u.map(n2).join(" ; ")}). Quelle est la distance du point M ${pt(M)} à (𝒟) (arrondie au centième) ?`, answer: num(r2(D), 0.01), hints: H("On utilise la formule MH = ‖MA ∧ u‖ / ‖u‖.", `MA (${sub(A, M).map(n2).join(" ; ")}).`, "Calcule MA ∧ u puis sa norme.", "Divise par ‖u‖."), solution: `MA ∧ u a pour norme √${dot(w, w)} ; ‖u‖ = √${dot(u, u)} ; distance ≈ ${fr(r2(D))}.` };
    }
  }, FR),
  mk("pv-plans", GE, 3, { skill: "Positions relatives de deux plans : parallèles, perpendiculaires, sécants", ref: `${BOOK}, chap. 2 §3.3, positions relatives de deux plans (p. 47-48)`, kw: ["plans perpendiculaires", "vecteurs normaux", "n ∧ n′", "n · n′ = 0", "plans parallèles"] }, (_c, r) => {
    const n = rv(r, 3), t = int(r, 0, 2);
    if (n[0] === 0 && n[1] === 0 && n[2] === 0) n[0] = 1;
    let n2v: V3;
    if (t === 0) { const k = nz(r, -3, 3); n2v = [k * n[0], k * n[1], k * n[2]]; }
    else if (t === 1) { do { n2v = rv(r, 3); } while (dot(n, n2v) === 0 || (cross(n, n2v)[0] === 0 && cross(n, n2v)[1] === 0 && cross(n, n2v)[2] === 0)); n2v = [n2v[0], n2v[1], n2v[2]]; const c = cross(n, rv(r, 3)); n2v = c[0] === 0 && c[1] === 0 && c[2] === 0 ? [n[1], -n[0], 0] : c; if (n2v[0] === 0 && n2v[1] === 0 && n2v[2] === 0) n2v = [1, 0, 0]; }
    else { do { n2v = rv(r, 3); } while (dot(n, n2v) === 0); }
    const w = cross(n, n2v), par0 = w[0] === 0 && w[1] === 0 && w[2] === 0, perp = dot(n, n2v) === 0;
    const rel = par0 ? "Parallèles" : perp ? "Perpendiculaires" : "Sécants non perpendiculaires";
    return { statement: `Deux plans ont pour vecteurs normaux n (${n.map(n2).join(" ; ")}) et n′ (${n2v.map(n2).join(" ; ")}) dans un repère orthonormé direct. Quelle est leur position ?`, answer: choice(r, ["Parallèles", "Perpendiculaires", "Sécants non perpendiculaires"], ["Parallèles", "Perpendiculaires", "Sécants non perpendiculaires"].indexOf(rel)), hints: H("On compare les vecteurs normaux.", "n ∧ n′ = 0 : plans parallèles ; sinon sécants. n · n′ = 0 : plans perpendiculaires.", `n ∧ n′ = (${w.map(n2).join(" ; ")}).`, `n · n′ = ${n2(dot(n, n2v))}.`), solution: `n ∧ n′ = (${w.map(n2).join(" ; ")}), n · n′ = ${n2(dot(n, n2v))} : plans ${rel.toLowerCase()}.` };
  }, QCM),
  mk("pv-cours", GE, 1, { skill: "Produit vectoriel : questions de cours", ref: `${BOOK}, chap. 2 §3.1-3.2 (p. 44-47)`, kw: ["produit vectoriel", "base directe", "colinéaires", "i ∧ j = k", "norme", "sin"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle est la norme de u ∧ v pour u et v non colinéaires, A, B, C tels que AB = u, AC = v ?", good: "‖u‖ ‖v‖ sin(BÂC)", bad: ["‖u‖ ‖v‖ cos(BÂC)", "‖u‖ + ‖v‖", "‖u‖ ‖v‖"], why: "Définition, p. 45." },
      { q: "Que vaut u ∧ v si u et v sont colinéaires ?", good: "Le vecteur nul", bad: ["‖u‖‖v‖", "1", "Un vecteur unitaire"], why: "Définition, p. 45." },
      { q: "Pour tous vecteurs u et v, que vaut v ∧ u ?", good: "−(u ∧ v)", bad: ["u ∧ v", "0", "‖u‖‖v‖"], why: "Propriétés 2 (1), p. 46." },
      { q: "(O, i, j, k) est orthonormé direct. Que vaut i ∧ j ?", good: "k", bad: ["−k", "j", "0"], why: "Exemple p. 45." },
      { q: "(O, i, j, k) est orthonormé direct. Que vaut j ∧ i ?", good: "−k", bad: ["k", "i", "0"], why: "Exemple p. 45." },
      { q: "Le vecteur u ∧ v (non nul) est…", good: "orthogonal à u et à v", bad: ["colinéaire à u", "égal à u + v", "de même direction que v"], why: "Définition, p. 45 (direction)." },
      { q: "Comment le triplet (u, v, u ∧ v) est-il orienté ?", good: "C'est une base directe", bad: ["C'est une base indirecte", "Ce n'est jamais une base", "Cela dépend de u"], why: "Définition, p. 45 (sens)." },
      { q: "Si on permute deux vecteurs d'une base, son orientation…", good: "change", bad: ["ne change pas", "devient nulle", "reste directe"], why: "Remarques, p. 44." },
      { q: "Permuter circulairement (i, j, k) en (j, k, i) …", good: "ne change pas l'orientation", bad: ["change l'orientation", "donne une base non orthonormée", "est impossible"], why: "Remarques, p. 44." },
      { q: "Pour démontrer que A, B, C sont alignés avec le produit vectoriel, on montre que…", good: "AB ∧ AC = 0", bad: ["AB · AC = 0", "AB ∧ AC = AB", "AB = AC"], why: "Méthode, p. 47." },
      { q: "Si deux plans ont des vecteurs normaux n et n′ tels que n ∧ n′ = 0, ces plans sont…", good: "parallèles", bad: ["perpendiculaires", "sécants", "confondus obligatoirement"], why: "Méthode, p. 48." },
      { q: "Si deux plans ont n · n′ = 0, ils sont…", good: "perpendiculaires", bad: ["parallèles", "confondus", "disjoints"], why: "Méthode, p. 48." },
    ];
    return qcmOf(r, pool, "Reviens à la définition de u ∧ v (direction, sens, norme).");
  }, QCM),
];
void f; void sq;
