// CIAM Première S : vecteurs de l'espace et orthogonalité dans l'espace.
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("1ere", "ciam1");
const BOOK = "CIAM 1ère S";
const VE = "Vecteurs de l'espace — série C";
const OR = "Orthogonalité dans l'espace — série C";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const rnd = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const trip = (v: number[]) => `(${v.map(S).join(" ; ")})`;
const det3 = (a: number[], b: number[], c: number[]) =>
  a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);

export const T1C: Template[] = [
  // ===== Chapitre 7 : Vecteurs de l'espace =====
  mk("ve-coord", VE, 1, { skill: "Coordonnées d'un vecteur, d'un milieu, d'un barycentre dans l'espace", ref: `${BOOK}, chap. 7 §2.2 (p. 132-134) et ex. 2.c-2.e (p. 135)`, kw: ["coordonnées", "vecteur", "milieu", "barycentre", "espace", "repère"] }, (c, r) => {
    const A = [rnd(r, -5, 5), rnd(r, -5, 5), rnd(r, -5, 5)], B = [rnd(r, -5, 5), rnd(r, -5, 5), rnd(r, -5, 5)];
    const k = rnd(r, 0, 2), t = rnd(r, 0, 2);
    const ax = ["l'abscisse", "l'ordonnée", "la cote"][k];
    if (t === 0) { const v = B[k] - A[k]; return { statement: `Dans un repère de l'espace, A${trip(A)} et B${trip(B)}. Quelle est ${ax} du vecteur AB ?`, answer: num(v), hints: H("AB a pour coordonnées (x_B − x_A ; y_B − y_A ; z_B − z_A).", `On cherche ${ax}.`, `${S(B[k])} − ${P(A[k])}.`, "Calcule."), solution: `${S(B[k])} − ${P(A[k])} = ${S(v)}.` }; }
    if (t === 1) { const v = (A[k] + B[k]) / 2; return { statement: `Dans un repère de l'espace, A${trip(A)} et B${trip(B)}. Quelle est ${ax} du milieu I de [AB] ?`, answer: num(v, 0.01), hints: H("I a pour coordonnées ((x_A + x_B)/2 ; (y_A + y_B)/2 ; (z_A + z_B)/2).", `On cherche ${ax}.`, `(${S(A[k])} + ${P(B[k])})/2.`, "Calcule."), solution: `(${S(A[k])} + ${P(B[k])})/2 = ${S(v)}.` }; }
    const Cc = [rnd(r, -5, 5), rnd(r, -5, 5), rnd(r, -5, 5)];
    const a = rnd(r, 1, 3), b = rnd(r, 1, 3), cc = rnd(r, 1, 3);
    const v = (a * A[k] + b * B[k] + cc * Cc[k]) / (a + b + cc);
    return { statement: `Dans un repère de l'espace, A${trip(A)}, B${trip(B)} et C${trip(Cc)}. G est le barycentre de (A, ${a}), (B, ${b}) et (C, ${cc}). Quelle est ${ax} de G ? (arrondi au centième)`, answer: num(round(v, 2), 0.01), hints: H("G a pour coordonnées (Σ aᵢxᵢ)/(a + b + c), etc.", `a + b + c = ${a + b + cc}.`, `Numérateur : ${a * A[k] + b * B[k] + cc * Cc[k]}.`, "Divise."), solution: `${ax} = ${S(a * A[k] + b * B[k] + cc * Cc[k])}/${a + b + cc} ≈ ${S(round(v, 2))}.` };
  }),
  mk("ve-norme", VE, 2, { skill: "Norme d'un vecteur et distance de deux points (repère orthonormé)", ref: `${BOOK}, chap. 7 §2.1 (p. 132) et §3 (p. 136-142)`, kw: ["norme", "distance", "repère orthonormé", "espace", "longueur"] }, (c, r) => {
    const [a, b, d, h] = pick(r, [[1, 2, 2, 3], [2, 3, 6, 7], [4, 4, 7, 9], [2, 6, 9, 11], [1, 4, 8, 9], [6, 6, 7, 11]] as number[][]);
    const sg = () => (r() < 0.5 ? -1 : 1);
    const u = [sg() * a, sg() * b, sg() * d];
    const A = [rnd(r, -3, 3), rnd(r, -3, 3), rnd(r, -3, 3)];
    const B = [A[0] + u[0], A[1] + u[1], A[2] + u[2]];
    return { statement: `Dans un repère orthonormé de l'espace, A${trip(A)} et B${trip(B)}. Calcule la distance AB.`, answer: num(h), hints: H("AB = √((x_B−x_A)² + (y_B−y_A)² + (z_B−z_A)²).", `AB a pour coordonnées ${trip(u)}.`, `${a * a} + ${b * b} + ${d * d} = ${h * h}.`, `√${h * h}.`), solution: `AB = √(${a * a} + ${b * b} + ${d * d}) = √${h * h} = ${h}.` };
  }),
  mk("ve-scalaire", VE, 2, { skill: "Produit scalaire de deux vecteurs de l'espace (base orthonormée)", ref: `${BOOK}, chap. 7 §3.1 (p. 136-138)`, kw: ["produit scalaire", "espace", "orthogonaux", "coordonnées"] }, (c, r) => {
    const u = [rnd(r, -4, 4), rnd(r, -4, 4), rnd(r, -4, 4)], v = [rnd(r, -4, 4), rnd(r, -4, 4), rnd(r, -4, 4)];
    const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    return { statement: `Dans une base orthonormée de l'espace, u${trip(u)} et v${trip(v)}. Calcule le produit scalaire u·v.`, answer: num(dot), hints: H("u·v = xx' + yy' + zz' dans une base orthonormée.", `${S(u[0])} × ${P(v[0])} = ${u[0] * v[0]}.`, `Ajoute ${P(u[1] * v[1])} et ${P(u[2] * v[2])}.`, "Calcule."), solution: `u·v = ${S(u[0] * v[0])} + ${P(u[1] * v[1])} + ${P(u[2] * v[2])} = ${S(dot)}.` };
  }),
  mk("ve-orthogonaux", VE, 3, { skill: "Vecteurs orthogonaux : déterminer un paramètre", ref: `${BOOK}, chap. 7 §3.1 (p. 136) : u·v = 0 ⇔ u ⊥ v`, kw: ["orthogonaux", "produit scalaire nul", "paramètre", "espace"] }, (c, r) => {
    const m = rnd(r, -5, 5);
    const u = [rnd(r, 1, 4), rnd(r, -4, 4), rnd(r, 1, 4)];
    const v1 = rnd(r, -4, 4), v2 = rnd(r, -4, 4);
    // u·v = u0*v1 + u1*v2 + u2*m = 0 ; on fixe m puis on calcule le paramètre manquant
    const z = rnd(r, 1, 4);
    const x = -(u[1] * v2 + u[2] * z) / u[0];
    void m; void v1;
    return { statement: `Dans une base orthonormée, u${trip(u)} et v(x ; ${S(v2)} ; ${S(z)}). Pour quelle valeur de x les vecteurs u et v sont-ils orthogonaux ? (arrondi au centième)`, answer: num(round(x, 2), 0.01), hints: H("u ⊥ v ⇔ u·v = 0.", `u·v = ${u[0]}x + ${P(u[1] * v2)} + ${P(u[2] * z)}.`, `${u[0]}x = ${S(-(u[1] * v2 + u[2] * z))}.`, "Divise."), solution: `${u[0]}x + ${P(u[1] * v2)} + ${P(u[2] * z)} = 0 donne x = ${S(round(x, 2))}.` };
  }),
  mk("ve-coplanaires", VE, 3, { skill: "Vecteurs coplanaires : w est-il combinaison linéaire de u et v ?", ref: `${BOOK}, chap. 7 §1.4 (p. 126-128) et ex. 2.a-2.d (p. 135)`, kw: ["coplanaires", "combinaison linéaire", "base", "non coplanaires"] }, (c, r) => {
    const u = [rnd(r, -3, 3), rnd(r, -3, 3), rnd(r, -3, 3)], v = [rnd(r, -3, 3), rnd(r, -3, 3), rnd(r, -3, 3)];
    const l = rnd(r, -3, 3), mu = rnd(r, -3, 3);
    const co = r() < 0.5;
    const w = [l * u[0] + mu * v[0], l * u[1] + mu * v[1], l * u[2] + mu * v[2]];
    if (!co) w[rnd(r, 0, 2)] += rnd(r, 1, 2);
    const d = det3(u, v, w);
    const yes = d === 0;
    return { statement: `Dans l'espace, u${trip(u)}, v${trip(v)} et w${trip(w)}. Les vecteurs u, v et w sont-ils coplanaires ?`, answer: { kind: "choice", options: ["Oui", "Non"], index: yes ? 0 : 1 }, hints: H("Trois vecteurs sont coplanaires s'il existe une combinaison linéaire nulle non triviale (ou si l'un est combinaison des deux autres).", "Si u et v ne sont pas colinéaires : cherche λ et μ tels que w = λu + μv.", "On peut aussi calculer le déterminant des trois vecteurs : nul ⇔ coplanaires.", `Déterminant = ${d}.`), solution: `Le déterminant des coordonnées vaut ${d} : ${yes ? "les vecteurs sont coplanaires" : "les vecteurs ne sont pas coplanaires"}.` };
  }, QCM),
  mk("ve-cours", VE, 1, { skill: "Vecteurs de l'espace : colinéarité, coplanarité, bases, repères (cours)", ref: `${BOOK}, chap. 7 §1-2 (p. 124-134)`, kw: ["colinéaires", "coplanaires", "base", "repère", "tétraèdre", "barycentre"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quand deux vecteurs non nuls u et v sont-ils colinéaires ?", good: "S'il existe un réel λ tel que v = λu", bad: ["S'ils ont la même norme", "S'ils sont orthogonaux", "S'ils ont le même point d'origine"], why: "Définition du manuel (§1.1 et remarque p. 125)." },
      { q: "Combien de vecteurs faut-il pour former une base de l'espace ?", good: "Trois vecteurs non coplanaires", bad: ["Deux vecteurs non colinéaires", "Quatre vecteurs", "Trois vecteurs quelconques"], why: "Une base de l'espace est un triplet de vecteurs non coplanaires." },
      { q: "Trois vecteurs u, v, w sont non coplanaires si et seulement si :", good: "λu + μv + νw = 0 entraîne λ = μ = ν = 0", bad: ["Ils ont la même norme", "Ils sont deux à deux orthogonaux", "w = u + v"], why: "Propriété 3 du manuel (§1.4)." },
      { q: "O, A, B, C sont quatre points. (O ; OA, OB, OC) est un repère de l'espace si et seulement si :", good: "O, A, B, C sont non coplanaires", bad: ["O, A, B, C sont alignés", "O, A, B, C sont coplanaires", "OA = OB = OC"], why: "Les vecteurs OA, OB, OC doivent être non coplanaires : O, A, B, C sont les sommets d'un tétraèdre." },
      { q: "Quand une base (i, j, k) est-elle orthonormée ?", good: "Quand ses vecteurs sont deux à deux orthogonaux et unitaires", bad: ["Quand ses vecteurs sont de même norme", "Quand ses vecteurs sont coplanaires", "Quand ses vecteurs sont colinéaires"], why: "Définition du manuel (§2.1)." },
      { q: "u(x ; y ; z) et u'(x' ; y' ; z') dans une base. Que valent les coordonnées de u + u' ?", good: "(x + x' ; y + y' ; z + z')", bad: ["(xx' ; yy' ; zz')", "(x − x' ; y − y' ; z − z')", "(x + y + z ; x' + y' + z')"], why: "Propriété du manuel (§2.1)." },
      { q: "Le centre de gravité d'un tétraèdre ABCD est :", good: "l'isobarycentre des quatre sommets", bad: ["le milieu d'une arête", "le centre de gravité d'une face", "le sommet A"], why: "G est le barycentre de (A,1), (B,1), (C,1), (D,1) (exemple p. 125)." },
      { q: "Si u et v sont colinéaires, que peut-on dire des vecteurs u, v et w, pour tout vecteur w ?", good: "Ils sont coplanaires", bad: ["Ils ne sont jamais coplanaires", "Ils sont orthogonaux", "Ils forment une base"], why: "Remarque du manuel (§1.4) : si u et v sont colinéaires, u, v, w sont coplanaires." },
    ];
    return qcmOf(r, pool, "Rappelle-toi les définitions du §1.4.");
  }, QCM),

  // ===== Chapitre 6 : Orthogonalité dans l'espace =====
  mk("or-cours", OR, 1, { skill: "Droites et plans orthogonaux : définitions et propriétés", ref: `${BOOK}, chap. 6 (p. 108-114)`, kw: ["droite orthogonale à un plan", "droites orthogonales", "plan médiateur", "sphère circonscrite"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quand une droite (D) est-elle orthogonale à un plan (P) ?", good: "Quand elle est orthogonale à deux droites sécantes de (P)", bad: ["Quand elle est orthogonale à une droite de (P)", "Quand elle est parallèle à une droite de (P)", "Quand elle coupe (P)"], why: "Définition du manuel (§1.2) ; une droite orthogonale à deux droites parallèles d'un plan n'est pas forcément orthogonale à ce plan." },
      { q: "Une droite orthogonale à un plan est orthogonale à :", good: "toute droite de ce plan", bad: ["une seule droite de ce plan", "aucune droite de ce plan", "seulement les droites passant par son pied"], why: "Propriété fondamentale du manuel (p. 110)." },
      { q: "Par un point A passent combien de plans orthogonaux à une droite (D) donnée ?", good: "Un seul", bad: ["Aucun", "Deux", "Une infinité"], why: "Étant donné un point A et une droite (D), il existe un unique plan passant par A et orthogonal à (D)." },
      { q: "Par un point A passent combien de droites orthogonales à un plan (P) donné ?", good: "Une seule", bad: ["Aucune", "Deux", "Une infinité"], why: "Étant donné un point A et un plan (P), il existe une unique droite passant par A et orthogonale à (P)." },
      { q: "Que représente l'ensemble des points de l'espace équidistants de deux points distincts A et B ?", good: "Le plan médiateur de [AB]", bad: ["La droite (AB)", "Le milieu de [AB]", "Une sphère de diamètre [AB]"], why: "Plan orthogonal à (AB) passant par le milieu de [AB] (TD 2, p. 113)." },
      { q: "Quel est l'ensemble des points équidistants de trois points non alignés A, B, C ?", good: "La droite orthogonale au plan (ABC) passant par le centre du cercle circonscrit", bad: ["Le plan (ABC)", "Le centre de gravité de ABC", "Une sphère"], why: "C'est l'axe du cercle circonscrit à ABC (TD 2, p. 113)." },
      { q: "(AB) et (FG) sont deux arêtes d'un cube ABCDEFGH, toutes deux orthogonales à (DH). Sont-elles forcément parallèles ?", good: "Non", bad: ["Oui, toujours", "Oui, si le cube est un pavé", "On ne peut pas savoir"], why: "Remarque du manuel (p. 109) : deux droites orthogonales à une même troisième ne sont pas forcément parallèles." },
      { q: "Combien de points de l'espace sont équidistants des quatre sommets d'un tétraèdre ABCD ?", good: "Un seul : le centre de la sphère circonscrite", bad: ["Aucun", "Une infinité", "Quatre"], why: "Théorème du manuel (p. 113-114)." },
    ];
    return qcmOf(r, pool, "Reviens à la définition d'une droite orthogonale à un plan.");
  }, QCM),
  mk("or-cube", OR, 2, { skill: "Longueurs dans un cube : diagonale d'une face, diagonale du cube", ref: `${BOOK}, ex. 1.f (p. 114) : cube d'arête a`, kw: ["cube", "diagonale", "arête", "distance", "espace"] }, (c, r) => {
    const a = rnd(r, 2, 9);
    const t = rnd(r, 0, 2);
    const v = t === 0 ? a * Math.SQRT2 : t === 1 ? a * Math.sqrt(3) : (Math.sqrt(3) / 4) * 2 * a * a;
    const q = t === 0 ? `la diagonale AC d'une face` : t === 1 ? `la diagonale AG du cube` : `l'aire du triangle équilatéral ACF`;
    return { statement: `ABCDEFGH est un cube d'arête ${a} cm. Calcule ${q} (arrondi au centième, en ${t === 2 ? "cm²" : "cm"}).`, answer: num(round(v, 2), 0.01), hints: H(t === 0 ? "Le triangle ABC est rectangle isocèle en B." : t === 1 ? "AG² = AC² + CG² : le triangle ACG est rectangle en C." : "Ses trois côtés sont des diagonales de faces, de longueur a√2.", t === 0 ? "AC² = AB² + BC² = 2a²." : t === 1 ? "AC² = 2a², donc AG² = 3a²." : "Aire d'un équilatéral de côté c : (√3/4) c².", "Remplace par la valeur de l'arête.", `a = ${a}.`), solution: t === 0 ? `AC = ${a}√2 ≈ ${fr(round(v, 2))}.` : t === 1 ? `AG = ${a}√3 ≈ ${fr(round(v, 2))}.` : `Côté = ${a}√2, aire = (√3/4) × ${2 * a * a} ≈ ${fr(round(v, 2))}.` };
  }),
];
