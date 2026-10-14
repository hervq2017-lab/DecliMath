// CIAM Seconde S : chapitre 2 (vecteurs, mesure algébrique, bases et repères). Énoncés originaux, réponses calculées par le code.
// Les démonstrations et constructions du manuel ne se corrigent pas automatiquement : on en garde les calculs et le cours.
import { choice, fr, int, num, pick, register, round, Rng } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("2nde", "ciam2v");
const BOOK = "CIAM 2nde S";
const VP = "Vecteurs et points du plan — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
/** Terme « k u » écrit proprement, avec son signe (le premier terme n'a pas d'espace devant le signe). */
const term = (k: number, v: string, first: boolean) => {
  if (k === 0) return "";
  const body = `${Math.abs(k) === 1 ? "" : Math.abs(k)}${v}`;
  return first ? `${k < 0 ? "−" : ""}${body}` : ` ${k < 0 ? "−" : "+"} ${body}`;
};
const comb = (a: number, u: string, b: number, v: string) => { const s = term(a, u, true) + term(b, v, a === 0); return s || "0"; };

register(
  mk("vec-norme", VP, 2, { skill: "Norme d'un vecteur dans une base orthonormée", ref: `${BOOK}, chap. 2 §3.1, propriété (p. 39) et ex. 1.a (p. 35)`, kw: ["norme", "√(x² + y²)", "base orthonormée", "longueur d'un vecteur", "distance"] }, (c, r) => {
    const trip = pick(r, [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]]);
    const sx = int(r, 0, 1) ? -1 : 1, sy = int(r, 0, 1) ? -1 : 1;
    const [x, y, nn] = int(r, 0, 1) ? [sx * trip[0], sy * trip[1], trip[2]] : [sx * trip[1], sy * trip[0], trip[2]];
    if (c === "pur") return { statement: `Dans une base orthonormée, le vecteur u a pour coordonnées (${n2(x)} ; ${n2(y)}). Quelle est sa norme ?`, answer: num(nn), hints: H("La base est orthonormée : on peut utiliser la formule de la norme.", "‖u‖ = √(x² + y²).", `x² + y² = ${x * x} + ${y * y}.`, "Calcule la racine carrée."), solution: `‖u‖ = √(${x * x} + ${y * y}) = √${x * x + y * y} = ${nn}.` };
    const xa = int(r, -5, 5), ya = int(r, -5, 5);
    return { statement: `Le plan est muni d'un repère orthonormé. A a pour coordonnées (${n2(xa)} ; ${n2(ya)}) et B (${n2(xa + x)} ; ${n2(ya + y)}). Quelle est la distance AB ?`, answer: num(nn), hints: H("AB est la norme du vecteur AB.", `AB a pour coordonnées (${n2(x)} ; ${n2(y)}).`, "AB = √(x² + y²) dans un repère orthonormé.", "Calcule."), solution: `AB (${n2(x)} ; ${n2(y)}), donc AB = √(${x * x} + ${y * y}) = ${nn}.` };
  }),
  mk("vec-unitaire", VP, 3, { skill: "Vecteur unitaire colinéaire à un vecteur donné", ref: `${BOOK}, chap. 2 §1.3, vecteurs unitaires (p. 33)`, kw: ["vecteur unitaire", "norme 1", "u/‖u‖", "colinéaire"] }, (_c, r) => {
    const [x, y, nn] = pick(r, [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10], [4, 3, 5], [12, 5, 13], [9, 12, 15]]);
    const sx = int(r, 0, 1) ? -1 : 1, sy = int(r, 0, 1) ? -1 : 1;
    const absc = int(r, 0, 1) === 0;
    const val = round((absc ? sx * x : sy * y) / nn, 4);
    return { statement: `Dans une base orthonormée, u a pour coordonnées (${n2(sx * x)} ; ${n2(sy * y)}). Le vecteur unitaire u/‖u‖, colinéaire à u et de même sens, a pour ${absc ? "abscisse" : "ordonnée"} (arrondie au centième près si besoin) :`, answer: num(val, 0.005), hints: H("Un vecteur unitaire a pour norme 1.", "On divise u par sa norme.", `‖u‖ = √(${x * x} + ${y * y}) = ${nn}.`, `${n2(absc ? sx * x : sy * y)} ÷ ${nn}.`), solution: `‖u‖ = ${nn}, donc u/‖u‖ = (${n2(round(sx * x / nn, 4))} ; ${n2(round(sy * y / nn, 4))}).` };
  }, FR),
  mk("vec-determinant", VP, 2, { skill: "Déterminant de deux vecteurs et colinéarité", ref: `${BOOK}, chap. 2 §3.2, théorème (p. 39-40) et ex. 3.a-3.b (p. 42) et ex. 33-34 (p. 45)`, kw: ["déterminant", "xy′ − yx′", "colinéaires", "base", "non colinéaires"] }, (c, r) => {
    const x = nz(r, -6, 6), y = nz(r, -6, 6), xp = nz(r, -6, 6), yp = nz(r, -6, 6);
    if (c === "pur") return { statement: `u a pour coordonnées (${n2(x)} ; ${n2(y)}) et v (${n2(xp)} ; ${n2(yp)}) dans une base de 𝒱. Calcule det(u, v) = xy′ − yx′.`, answer: num(x * yp - y * xp), hints: H("Le déterminant se calcule avec les coordonnées dans une même base.", "det(u, v) = x y′ − y x′.", `${n2(x)} × ${par(yp)} − ${par(y)} × ${par(xp)}.`, "Calcule chaque produit."), solution: `det(u, v) = ${n2(x)} × ${par(yp)} − ${par(y)} × ${par(xp)} = ${n2(x * yp)} − ${par(y * xp)} = ${n2(x * yp - y * xp)}.` };
    const k = nz(r, -3, 3), colin = int(r, 0, 1) === 0;
    const vx = colin ? k * x : xp, vy = colin ? k * y : yp;
    const isCol = x * vy - y * vx === 0;
    return { statement: `Dans une base de 𝒱, u (${n2(x)} ; ${n2(y)}) et v (${n2(vx)} ; ${n2(vy)}). Ces vecteurs sont-ils colinéaires ?`, answer: choice(r, ["Oui", "Non"], isCol ? 0 : 1), hints: H("Deux vecteurs sont colinéaires si et seulement si leur déterminant est nul.", "det(u, v) = x y′ − y x′.", `${n2(x)} × ${par(vy)} − ${par(y)} × ${par(vx)}.`, "Compare à 0."), solution: `det(u, v) = ${n2(x)} × ${par(vy)} − ${par(y)} × ${par(vx)} = ${n2(x * vy - y * vx)}${isCol ? " : nul, donc colinéaires." : " : non nul, donc non colinéaires."}` };
  }, [{ id: "pur", label: "Calcul direct" }, { id: "qcm", label: "Colinéaires ?" }]),
  mk("vec-param-colin", VP, 3, { skill: "Trouver le paramètre pour que deux vecteurs soient colinéaires", ref: `${BOOK}, chap. 2 §3.2 (p. 39-40) et ex. 31, 34 (p. 45)`, kw: ["paramètre", "colinéaires", "déterminant", "a", "valeur"] }, (_c, r) => {
    const x = nz(r, -4, 4), y = nz(r, -4, 4);
    const k = nz(r, -3, 3);
    // v = (k·x ; t) est colinéaire à u si x·t − y·k·x = 0, soit t = k·y
    const a2 = x * k, b2 = y * k;
    return { statement: `Dans une base de 𝒱, u a pour coordonnées (${n2(x)} ; ${n2(y)}) et v (${n2(a2)} ; t). Pour quelle valeur de t les vecteurs u et v sont-ils colinéaires ?`, answer: num(b2), hints: H("Colinéaires ⇔ déterminant nul.", `${n2(x)} × t − ${par(y)} × ${par(a2)} = 0.`, "Isole t.", `t = ${n2(y)} × ${par(a2)} ÷ ${par(x)}.`), solution: `${n2(x)}t − ${par(y * a2)} = 0, donc t = ${n2(y * a2)} / ${par(x)} = ${n2(b2)}.` };
  }, FR),
  mk("vec-reduire", VP, 2, { skill: "Réduire une expression vectorielle", ref: `${BOOK}, chap. 2 §1.2, propriétés du calcul vectoriel (p. 30) et ex. 6 (p. 43)`, kw: ["calcul vectoriel", "développer", "réduire", "combinaison linéaire", "u", "v"] }, (_c, r) => {
    const a = nz(r, -5, 6), b = nz(r, -5, 6), c = nz(r, 2, 4), d = nz(r, -4, 4), e = nz(r, -4, 4), f = nz(r, -3, 4), g = nz(r, -4, 4);
    // a u + b v + c (d u + e v) + f (g u − v)
    const cu = a + c * d + f * g, cv = b + c * e - f;
    const inner1 = `${comb(d, "u", e, "v")}`, inner2 = `${comb(g, "u", -1, "v")}`;
    const expr = `${comb(a, "u", b, "v")} ${c < 0 ? "−" : "+"} ${Math.abs(c)}(${inner1}) ${f < 0 ? "−" : "+"} ${Math.abs(f) === 1 ? "" : Math.abs(f)}(${inner2})`;
    const wantU = int(r, 0, 1) === 0;
    return { statement: `Après réduction, l'expression ${expr} s'écrit pu + qv. Quelle est la valeur de ${wantU ? "p" : "q"} ?`, answer: num(wantU ? cu : cv), hints: H("On développe puis on regroupe les termes en u et en v.", "λ(au + bv) = λa u + λb v.", "Additionne les coefficients de u d'une part, de v d'autre part.", `Coefficient de ${wantU ? "u" : "v"} : somme des trois contributions.`), solution: `${expr} = (${n2(a)} + ${par(c * d)} + ${par(f * g)})u + (${n2(b)} + ${par(c * e)} + ${par(-f)})v = ${comb(cu, "u", cv, "v")}.` };
  }, FR),
  mk("vec-coordonnees-combinaison", VP, 2, { skill: "Coordonnées d'une combinaison linéaire de vecteurs", ref: `${BOOK}, chap. 2 §3.1, propriété (p. 38) et ex. 3.a (p. 42)`, kw: ["coordonnées", "somme de vecteurs", "λu", "combinaison linéaire", "base"] }, (_c, r) => {
    const ux = nz(r, -6, 6), uy = nz(r, -6, 6), vx = nz(r, -6, 6), vy = nz(r, -6, 6), a = nz(r, -3, 4), b = nz(r, -3, 4);
    const wantX = int(r, 0, 1) === 0;
    return { statement: `Dans une base de 𝒱, u (${n2(ux)} ; ${n2(uy)}) et v (${n2(vx)} ; ${n2(vy)}). Quelle est ${wantX ? "la première" : "la seconde"} coordonnée du vecteur ${comb(a, "u", b, "v")} ?`, answer: num(wantX ? a * ux + b * vx : a * uy + b * vy), hints: H("Si u(x ; y) et v(x′ ; y′), alors au + bv a pour coordonnées (ax + bx′ ; ay + by′).", `a = ${n2(a)}, b = ${n2(b)}.`, `${par(a)} × ${par(wantX ? ux : uy)} + ${par(b)} × ${par(wantX ? vx : vy)}.`, "Calcule chaque produit puis additionne."), solution: `${par(a)} × ${par(wantX ? ux : uy)} + ${par(b)} × ${par(wantX ? vx : vy)} = ${n2(wantX ? a * ux + b * vx : a * uy + b * vy)}.` };
  }, FR),
  mk("vec-base-test", VP, 3, { skill: "Savoir si (u, v) est une base de 𝒱", ref: `${BOOK}, chap. 2 §3.1-3.2 (p. 38-40) et ex. 24-25 (p. 44)`, kw: ["base", "non colinéaires", "déterminant", "(u, v) est une base"] }, (_c, r) => {
    const x = nz(r, -4, 4), y = nz(r, -4, 4);
    const base = int(r, 0, 1) === 0;
    const k = nz(r, -3, 3);
    const vx = base ? nz(r, -4, 4) : k * x, vy = base ? nz(r, -4, 4) : k * y;
    const isBase = x * vy - y * vx !== 0;
    return { statement: `Dans une base (i, j) de 𝒱, u = ${comb(x, "i", y, "j")} et v = ${comb(vx, "i", vy, "j")}. Le couple (u, v) est-il une base de 𝒱 ?`, answer: choice(r, ["Oui", "Non"], isBase ? 0 : 1), hints: H("(u, v) est une base si et seulement si u et v ne sont pas colinéaires.", "Calcule det(u, v).", `${n2(x)} × ${par(vy)} − ${par(y)} × ${par(vx)}.`, "Un déterminant non nul signifie « base »."), solution: `det(u, v) = ${n2(x)} × ${par(vy)} − ${par(y)} × ${par(vx)} = ${n2(x * vy - y * vx)}${isBase ? ", différent de 0 : (u, v) est une base." : " : u et v sont colinéaires, ce n'est pas une base."}` };
  }, QCM),
  mk("vec-changement-base", VP, 3, { skill: "Coordonnées d'un vecteur dans une nouvelle base", ref: `${BOOK}, chap. 2 §3.1, ex. 24 et 26 (p. 44)`, kw: ["changement de base", "coordonnées", "(u, v)", "base", "combinaison linéaire"] }, (_c, r) => {
    const p = nz(r, -3, 3), q = nz(r, -3, 3);
    // u = i + j ; v = i − j (base de 𝒱). Le vecteur w = p u + q v s'écrit dans (i, j) : (p + q) i + (p − q) j
    const wantI = int(r, 0, 1) === 0;
    return { statement: `(i, j) est une base de 𝒱. On pose u = i + j et v = i − j. Le vecteur w = ${comb(p, "u", q, "v")} s'écrit w = x i + y j. Quelle est la valeur de ${wantI ? "x" : "y"} ?`, answer: num(wantI ? p + q : p - q), hints: H("Remplace u et v par leurs expressions en i et j.", `w = ${par(p)}(i + j) + ${par(q)}(i − j).`, "Développe et regroupe les termes en i, puis ceux en j.", wantI ? "x = p + q." : "y = p − q."), solution: `w = ${par(p)}(i + j) + ${par(q)}(i − j) = (${n2(p)} + ${par(q)})i + (${n2(p)} − ${par(q)})j = ${comb(p + q, "i", p - q, "j")}.` };
  }, FR),
  mk("vec-mesure-algebrique", VP, 2, { skill: "Mesures algébriques sur une droite orientée (Chasles, signe)", ref: `${BOOK}, chap. 2 §2.1-2.2 (p. 36-37) et ex. 2.a-2.d (p. 37)`, kw: ["mesure algébrique", "droite orientée", "Chasles", "AB̄", "abscisse", "signe"] }, (_c, r) => {
    const t = int(r, 0, 2);
    const a = int(r, -8, 4), b = a + nz(r, -7, 7), c = b + nz(r, -7, 7);
    if (t === 0) return { statement: `Sur une droite orientée par i, les points A, B et C ont pour abscisses ${n2(a)}, ${n2(b)} et ${n2(c)}. Quelle est la mesure algébrique de (B, C) relativement à i ?`, answer: num(c - b), hints: H("La mesure algébrique de (B, C) est l'abscisse de C moins l'abscisse de B.", "BC̄ = x_C − x_B.", `${n2(c)} − ${par(b)}.`, "Calcule."), solution: `BC̄ = ${n2(c)} − ${par(b)} = ${n2(c - b)}.` };
    if (t === 1) { const ab = nz(r, -8, 8), ac = nz(r, -8, 8); return { statement: `Sur une droite orientée, les points A, B et C vérifient AB̄ = ${n2(ab)} et AC̄ = ${n2(ac)}. Quelle est la valeur de CB̄ ?`, answer: num(ab - ac), hints: H("Utilise la relation de Chasles pour les mesures algébriques.", "AC̄ + CB̄ = AB̄.", `CB̄ = AB̄ − AC̄ = ${n2(ab)} − ${par(ac)}.`, "Calcule."), solution: `CB̄ = AB̄ − AC̄ = ${n2(ab)} − ${par(ac)} = ${n2(ab - ac)}.` }; }
    const ab = nz(r, -6, 6), ac = nz(r, -6, 6);
    return { statement: `Relativement à un vecteur unitaire i, AB̄ = ${n2(ab)} et AC̄ = ${n2(ac)}. On change l'orientation de la droite (relativement à −i). Que devient le quotient AB̄ / AC̄ ?`, answer: num(round(ab / ac, 4), 0.005), hints: H("Changer d'orientation change le signe de chaque mesure algébrique.", "Le produit et le quotient de deux mesures algébriques ne dépendent pas de l'orientation.", `AB̄ / AC̄ = ${n2(ab)} / ${par(ac)}.`, "Calcule le quotient."), solution: `Le quotient reste inchangé : ${n2(ab)} / ${par(ac)} ≈ ${n2(round(ab / ac, 4))}.` };
  }, FR),
  mk("vec-gravite-chasles", VP, 3, { skill: "Centre de gravité : GA + GB + GC = 0 et relation en un point quelconque", ref: `${BOOK}, chap. 2 §1.3, propriété (p. 34) et §3.3 (p. 41) et ex. 11, 35 (p. 43, 45)`, kw: ["centre de gravité", "GA + GB + GC = 0", "3MG", "Chasles", "triangle"] }, (_c, r) => {
    const A = [int(r, -6, 6), int(r, -6, 6)], B = [int(r, -6, 6), int(r, -6, 6)], M = [int(r, -6, 6), int(r, -6, 6)];
    const C = [3 * int(r, -3, 3) - A[0] - B[0], 3 * int(r, -3, 3) - A[1] - B[1]];
    const G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    const w = [3 * (G[0] - M[0]), 3 * (G[1] - M[1])];
    const wantX = int(r, 0, 1) === 0;
    return { statement: `Dans un repère, A (${n2(A[0])} ; ${n2(A[1])}), B (${n2(B[0])} ; ${n2(B[1])}), C (${n2(C[0])} ; ${n2(C[1])}) et M (${n2(M[0])} ; ${n2(M[1])}). On rappelle que MA + MB + MC = 3 MG, où G est le centre de gravité de ABC. Quelle est ${wantX ? "la première" : "la seconde"} coordonnée du vecteur MA + MB + MC ?`, answer: num(wantX ? w[0] : w[1]), hints: H("On peut calculer chaque vecteur puis les ajouter.", "MA a pour coordonnées (x_A − x_M ; y_A − y_M), etc.", `Ou : 3 MG = 3(x_G − x_M ; y_G − y_M) avec G = ((x_A + x_B + x_C)/3 ; …).`, "Les deux méthodes donnent le même résultat."), solution: `G (${n2(G[0])} ; ${n2(G[1])}), donc 3 MG = (${n2(w[0])} ; ${n2(w[1])}).` };
  }, FR),
  mk("vec-cours", VP, 1, { skill: "Vecteurs : définitions, norme, colinéarité (cours)", ref: `${BOOK}, chap. 2 §1 à §3 (p. 28-41)`, kw: ["vecteur", "norme", "colinéaires", "Chasles", "inégalité triangulaire", "repère", "base"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Pour tous points A, B, C, que vaut AB + BC (vecteurs) ?", good: "AC", bad: ["CA", "BA", "0"], why: "Relation de Chasles (p. 29)." },
      { q: "Pour tous vecteurs u et v, quelle inégalité est toujours vraie ?", good: "‖u + v‖ ≤ ‖u‖ + ‖v‖", bad: ["‖u + v‖ = ‖u‖ + ‖v‖", "‖u + v‖ ≥ ‖u‖ + ‖v‖", "‖u + v‖ = ‖u‖ − ‖v‖"], why: "Inégalité triangulaire (p. 29)." },
      { q: "Pour un nombre réel λ et un vecteur u, que vaut ‖λu‖ ?", good: "|λ| ‖u‖", bad: ["λ ‖u‖", "‖u‖ + λ", "λ²‖u‖"], why: "Remarque p. 30 : il ne faut pas oublier la valeur absolue." },
      { q: "Deux vecteurs de même norme sont-ils forcément égaux ?", good: "Non", bad: ["Oui", "Oui s'ils sont colinéaires", "Oui s'ils ont même origine"], why: "Remarque p. 29 : ils peuvent avoir des directions ou des sens différents." },
      { q: "Quelle est la norme d'un vecteur unitaire ?", good: "1", bad: ["0", "2", "Cela dépend du repère"], why: "Définition p. 33." },
      { q: "Combien de vecteurs unitaires colinéaires à un vecteur non nul u existe-t-il ?", good: "Deux, opposés", bad: ["Un seul", "Une infinité", "Aucun"], why: "Propriété p. 33 : u/‖u‖ et −u/‖u‖." },
      { q: "Quand dit-on que deux vecteurs u et v sont colinéaires ?", good: "Quand l'un au moins est nul ou qu'ils ont même direction", bad: ["Quand ils ont même norme", "Quand ils sont perpendiculaires", "Quand ils ont même sens"], why: "Définition p. 32." },
      { q: "u et v sont non colinéaires. Si λu + μv = 0, alors…", good: "λ = μ = 0", bad: ["λ = μ", "λ = −μ", "u = 0"], why: "Propriété 3 (p. 33)." },
      { q: "Dans quel cas la formule ‖u‖ = √(x² + y²) est-elle valable ?", good: "Dans une base orthonormée", bad: ["Dans n'importe quelle base", "Seulement si x = y", "Jamais"], why: "Remarque p. 39 : elle n'est pas applicable dans une base quelconque." },
      { q: "Quand une base (i, j) est-elle orthonormée ?", good: "Quand i et j sont orthogonaux et de norme 1", bad: ["Quand i et j ont même sens", "Quand i = j", "Quand i et j sont colinéaires"], why: "Définition p. 39." },
      { q: "det(u, v) = 0 signifie que…", good: "u et v sont colinéaires", bad: ["u et v sont orthogonaux", "u = v", "u et v sont unitaires"], why: "Théorème p. 40." },
      { q: "Si M est le milieu de [AB], quelles sont les coordonnées de M dans (O, i, j) ?", good: "((x_A + x_B)/2 ; (y_A + y_B)/2)", bad: ["(x_A − x_B ; y_A − y_B)", "(x_A + x_B ; y_A + y_B)", "((x_B − x_A)/2 ; (y_B − y_A)/2)"], why: "Propriété (2) p. 41." },
      { q: "Quel point G vérifie GA + GB + GC = 0 pour un triangle ABC ?", good: "Le centre de gravité", bad: ["L'orthocentre", "Le centre du cercle circonscrit", "Le milieu de [AB]"], why: "Propriété p. 34." },
      { q: "Combien de vecteurs ayant une direction, un sens et une norme donnés existe-t-il ?", good: "Un seul", bad: ["Deux", "Une infinité", "Aucun"], why: "Propriété 2 (p. 29)." },
      { q: "Pour tout point O et tout vecteur u, combien de points M vérifient OM = u ?", good: "Un seul", bad: ["Deux", "Une infinité", "Aucun"], why: "Propriété fondamentale (p. 28)." },
    ];
    return qcmOf(r, pool, "Reviens à la définition ou à la propriété du chapitre.");
  }, QCM),
);
