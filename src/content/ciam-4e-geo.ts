// CIAM 4ème : activités géométriques (chap. 1 à 9 du manuel). Les démonstrations et tracés ne se corrigent pas
// automatiquement : on travaille ici les propriétés, les mesures et les calculs qui s'y appuient.
import { choice, fr, gcd, int, num, pick, register, round, Rng } from "./core";
import { ciam, H, Item, QCM, qcmOf, shuffle, sup } from "./ciam-kit";

const mk = ciam("4e", "ciam4");
const BOOK = "CIAM 4ème";
const CALC = [{ id: "calcul", label: "Calcul" }];
const SIT = [{ id: "pur", label: "Calcul direct" }, { id: "situation", label: "En situation" }];
const PI = 3.14;
const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [20, 21, 29], [15, 20, 25], [10, 24, 26]];

register(
  // ===== Chapitre 2 : Symétries =====
  mk("sym-propriete", "Symétries et translations", 1, { skill: "Propriétés des symétries centrale et orthogonale", ref: `${BOOK}, chap. 2 §2.1 (p. 20) et ex. 2.a-2.b (p. 21)`, kw: ["symétrie centrale", "symétrie orthogonale", "image", "conservation", "droites parallèles"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Par une symétrie centrale, l'image d'une droite est…", good: "une droite parallèle à la première", bad: ["une droite perpendiculaire à la première", "une demi-droite", "un segment"], why: "Par une symétrie centrale, une droite a pour image une droite qui lui est parallèle (ou elle-même si elle passe par le centre)." },
      { q: "Par une symétrie orthogonale d'axe (L), une droite perpendiculaire à (L) a pour image…", good: "elle-même", bad: ["une droite parallèle à (L)", "un point", "une droite sécante qui n'est pas perpendiculaire à (L)"], why: "Une droite perpendiculaire à l'axe est sa propre image par la symétrie orthogonale." },
      { q: "Par une symétrie centrale de centre O, une droite qui passe par O a pour image…", good: "elle-même", bad: ["une droite parallèle différente", "une droite perpendiculaire", "un cercle"], why: "Une droite passant par le centre est sa propre image par la symétrie centrale." },
      { q: "Deux droites parallèles ont pour images par une symétrie…", good: "deux droites parallèles", bad: ["deux droites perpendiculaires", "deux droites sécantes", "une seule droite"], why: "Une symétrie conserve le parallélisme." },
      { q: "Deux droites perpendiculaires ont pour images par une symétrie…", good: "deux droites perpendiculaires", bad: ["deux droites parallèles", "deux droites confondues", "deux droites sécantes non perpendiculaires"], why: "Une symétrie conserve l'orthogonalité." },
      { q: "Un cercle a pour image par une symétrie…", good: "un cercle de même rayon", bad: ["un cercle de rayon double", "un disque", "une ellipse"], why: "Une symétrie conserve les longueurs : l'image d'un cercle est un cercle de même rayon." },
      { q: "Un angle a pour image par une symétrie…", good: "un angle de même mesure", bad: ["un angle de mesure double", "un angle supplémentaire", "un angle nul"], why: "Une symétrie conserve les mesures d'angles." },
      { q: "Le milieu d'un segment a pour image par une symétrie…", good: "le milieu de l'image de ce segment", bad: ["un sommet de l'image du segment", "le centre de symétrie", "un point quelconque"], why: "Une symétrie conserve les milieux." },
    ];
    return qcmOf(r, pool, "Une symétrie ne déforme pas les figures.");
  }, QCM),
  mk("sym-demontrer", "Symétries et translations", 2, { skill: "Utiliser une symétrie : longueurs et périmètres des images", ref: `${BOOK}, chap. 2 §3, énoncés 1 et 2 (p. 22-23) et ex. 3.a-3.b`, kw: ["symétrie", "image", "longueur", "superposables", "périmètre"] }, (c, r) => {
    const a = int(r, 3, 15), b = int(r, 3, 15), d = int(r, 3, 15);
    const k = int(r, 0, 1);
    void c;
    if (k === 0) return { statement: `Les points A', B' et C' sont les images de A, B et C par une symétrie. AB = ${a} cm, BC = ${b} cm et CA = ${d} cm. Quel est le périmètre du triangle A'B'C' (en cm) ?`, answer: num(a + b + d), hints: H("Une symétrie conserve les longueurs.", "A'B' = AB, B'C' = BC et C'A' = CA.", "Le périmètre est la somme des trois côtés.", `${a} + ${b} + ${d}.`), solution: `A'B'C' a les mêmes côtés que ABC : ${a} + ${b} + ${d} = ${a + b + d} cm.` };
    return { statement: `Le triangle ABC a pour aire ${a * b} cm². Son image A'B'C' par une symétrie orthogonale est-elle de même aire ? Quelle est l'aire de A'B'C' (en cm²) ?`, answer: num(a * b), hints: H("Les triangles ABC et A'B'C' sont superposables.", "Une symétrie conserve les longueurs et les angles.", "Deux triangles superposables ont la même aire.", "Recopie."), solution: `Triangles superposables : même aire, ${a * b} cm².` };
  }, CALC),

  // ===== Chapitre 3 : Distances =====
  mk("dist-axe-median", "Distances", 2, { skill: "Axe médian de deux droites parallèles : distance", ref: `${BOOK}, chap. 3 §2.1, ex. 2.a-2.c (p. 36)`, kw: ["axe médian", "droites parallèles", "équidistant", "distance"] }, (c, r) => {
    const d = int(r, 4, 40);
    void c;
    if (int(r, 0, 1) === 0) return { statement: `(D₁) et (D₂) sont deux droites parallèles distantes de ${d} cm. Un point M appartient à leur axe médian. À quelle distance de (D₁) se trouve-t-il (en cm) ?`, answer: num(d / 2), hints: H("L'axe médian est la médiatrice d'un segment qui joint (D₁) à (D₂) perpendiculairement.", "Un point de l'axe médian est équidistant des deux droites.", "Distance à (D₁) = moitié de la distance entre les droites.", `${d} ÷ 2.`), solution: `Distance de M à (D₁) = ${d} ÷ 2 = ${fr(d / 2)} cm.` };
    return { statement: `Un point M est à ${fr(d / 2)} cm de chacune de deux droites parallèles (D₁) et (D₂). Quelle est la distance entre (D₁) et (D₂) (en cm) ?`, answer: num(d), hints: H("M est équidistant des deux droites : il est sur leur axe médian.", "La distance entre les droites est la somme des deux distances.", `${fr(d / 2)} + ${fr(d / 2)}.`, "Additionne."), solution: `${fr(d / 2)} + ${fr(d / 2)} = ${d} cm.` };
  }, SIT),
  mk("dist-bissectrice", "Distances", 2, { skill: "Points équidistants des côtés d'un angle (bissectrice)", ref: `${BOOK}, chap. 3 §2.2 (p. 37) et ex. 2.d-2.e (p. 38)`, kw: ["bissectrice", "équidistant", "supports des côtés", "angle", "axes de symétrie"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "M appartient à la bissectrice de l'angle AOB. Que peut-on dire des distances de M à (OA) et à (OB) ?", good: "Elles sont égales", bad: ["La première est le double de la seconde", "Elles sont nulles", "On ne peut rien dire"], why: "Si un point appartient à la bissectrice d'un angle, alors il est équidistant des supports des côtés de cet angle." },
      { q: "Un point est équidistant des droites sécantes (OA) et (OB). Où se trouve-t-il ?", good: "Sur l'un des deux axes de symétrie de ces droites", bad: ["Sur (OA) seulement", "Au milieu de [AB]", "Il n'existe pas"], why: "Si un point est équidistant de deux droites sécantes, alors il appartient à l'un des axes de symétrie de ces deux droites." },
      { q: "Combien deux droites sécantes non perpendiculaires ont-elles d'axes de symétrie ?", good: "Deux", bad: ["Un", "Trois", "Aucun"], why: "Deux droites sécantes ont deux axes de symétrie : les bissectrices des angles qu'elles forment, perpendiculaires entre elles." },
      { q: "Les deux axes de symétrie de deux droites sécantes sont…", good: "perpendiculaires entre eux", bad: ["parallèles", "confondus", "sécants sans être perpendiculaires"], why: "Les deux bissectrices (d'angles adjacents supplémentaires) sont perpendiculaires." },
    ];
    return qcmOf(r, pool, "Pense à « équidistant ».");
  }, QCM),
  mk("dist-cercles", "Distances", 3, { skill: "Position relative de deux cercles (OO′ et rayons)", ref: `${BOOK}, chap. 3 §3.1 (p. 38-39) et ex. 3.a-3.d`, kw: ["cercles tangents", "cercles sécants", "disjoints", "OO'", "r + r'", "r − r'"] }, (_c, r) => {
    const R = int(r, 5, 12), rr = int(r, 2, R - 1);
    const cases = [
      { d: R + rr, v: "tangents extérieurement", why: `OO' = r + r' = ${R + rr}` },
      { d: R - rr, v: "tangents intérieurement", why: `OO' = r − r' = ${R - rr}` },
      { d: R + rr + int(r, 1, 5), v: "disjoints (extérieurs)", why: `OO' > r + r'` },
      { d: Math.max(0, R - rr - int(r, 1, Math.max(1, R - rr))), v: "disjoints (l'un dans l'autre)", why: `OO' < r − r'` },
      { d: int(r, R - rr + 1, R + rr - 1), v: "sécants", why: `r − r' < OO' < r + r'` },
    ];
    const cs = pick(r, cases);
    const opts = ["tangents extérieurement", "tangents intérieurement", "disjoints (extérieurs)", "disjoints (l'un dans l'autre)", "sécants"];
    return { statement: `Deux cercles ont pour rayons ${R} cm et ${rr} cm, et la distance entre leurs centres est OO' = ${cs.d} cm. Comment sont-ils ?`, answer: choice(r, opts, opts.indexOf(cs.v)), hints: H("On compare OO' à r + r' et à r − r'.", `r + r' = ${R + rr} et r − r' = ${R - rr}.`, "Si OO' est entre les deux : sécants ; si OO' est égal à l'une des valeurs : tangents.", "Au-dessus de r + r' ou en dessous de r − r' : disjoints."), solution: `r + r' = ${R + rr} ; r − r' = ${R - rr} ; OO' = ${cs.d} : ${cs.why} : cercles ${cs.v}.` };
  }, QCM),
  mk("dist-droite-cercle", "Distances", 2, { skill: "Position d'une droite et d'un cercle (distance OH et rayon)", ref: `${BOOK}, chap. 3 §3.2, propriétés (p. 40) et ex. 3.a-3.b`, kw: ["tangente", "sécante", "disjointe", "OH", "rayon", "cercle et droite"] }, (_c, r) => {
    const R = int(r, 2, 10), d = int(r, 1, 14);
    const v = d < R ? "sécants (deux points communs)" : d === R ? "tangents (un seul point commun)" : "disjoints (aucun point commun)";
    const opts = ["sécants (deux points communs)", "tangents (un seul point commun)", "disjoints (aucun point commun)"];
    return { statement: `Un cercle de centre O a pour rayon ${R} cm. H est le pied de la perpendiculaire à une droite (D) passant par O, avec OH = ${d} cm. Que sont (D) et le cercle ?`, answer: choice(r, opts, opts.indexOf(v)), hints: H("On compare OH et le rayon.", "OH < r : deux points communs.", "OH = r : un seul point commun (tangente). OH > r : aucun point commun.", `Compare ${d} et ${R}.`), solution: `OH = ${d}, r = ${R} : ${d < R ? "OH < r" : d === R ? "OH = r" : "OH > r"} : ${v}.` };
  }, QCM),
  mk("dist-tangente", "Distances", 3, { skill: "Tangente à un cercle : rayon perpendiculaire", ref: `${BOOK}, chap. 3 §3.3, ex. 3.a-3.d (p. 40-41)`, kw: ["tangente", "point de contact", "rayon", "perpendiculaire", "Pythagore"] }, (_c, r) => {
    const [a, b, h] = pick(r, TRIPLES.slice(0, 6));
    return { statement: `Un cercle de centre O a pour rayon ${a} cm. Une tangente touche le cercle en T. Un point A de cette tangente est tel que TA = ${b} cm. Quelle est la distance OA (en cm) ?`, answer: num(h), hints: H("La tangente est perpendiculaire au rayon au point de contact.", "Le triangle OTA est rectangle en T.", `OA² = OT² + TA² = ${a}² + ${b}².`, `${a * a} + ${b * b} = ${h * h}.`), solution: `OTA rectangle en T : OA² = ${a}² + ${b}² = ${h * h}, donc OA = ${h} cm.` };
  }, [{ id: "tangente", label: "Tangente" }]),

  // ===== Chapitre 4 : Triangle =====
  mk("tri-milieux", "Droite des milieux", 2, { skill: "Droite des milieux : longueur de la moitié du troisième côté", ref: `${BOOK}, chap. 4 §1.1-1.2, ex. 1.a-1.c (p. 46-47) et ex. 1-6 (p. 59)`, kw: ["droite des milieux", "milieux", "moitié", "parallèle au troisième côté"] }, (c, r) => {
    const BC = 2 * int(r, 3, 20);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: c === "pur" ? `Dans le triangle ABC, I et J sont les milieux de [AB] et [AC]. BC = ${BC} cm. Calcule IJ.` : `Un triangle de jardin ABC a un côté BC de ${BC} m. Un chemin relie les milieux I de [AB] et J de [AC]. Quelle est sa longueur (en m) ?`, answer: num(BC / 2), hints: H("I et J sont les milieux de deux côtés : (IJ) est la droite des milieux.", "IJ est égal à la moitié de BC.", "IJ = BC ÷ 2.", `${BC} ÷ 2.`), solution: `IJ = BC ÷ 2 = ${BC} ÷ 2 = ${BC / 2}.` };
    if (t === 1) return { statement: `Dans le triangle ABC, I et J sont les milieux de [AB] et [AC] et IJ = ${BC / 2} cm. Calcule BC (en cm).`, answer: num(BC), hints: H("(IJ) est la droite des milieux.", "IJ = BC ÷ 2.", "BC = 2 × IJ.", `2 × ${BC / 2}.`), solution: `BC = 2 × IJ = 2 × ${BC / 2} = ${BC} cm.` };
    const AB = 2 * int(r, 3, 15), AC = 2 * int(r, 3, 15);
    return { statement: `Dans le triangle ABC, AB = ${AB} cm, BC = ${BC} cm et AC = ${AC} cm. I, J, K sont les milieux de [BC], [CA] et [AB]. Quel est le périmètre du triangle IJK (en cm) ?`, answer: num((AB + BC + AC) / 2), hints: H("Chaque côté de IJK est une droite des milieux.", "Chaque côté de IJK vaut la moitié du côté parallèle de ABC.", "Le périmètre de IJK est la moitié de celui de ABC.", `(${AB} + ${BC} + ${AC}) ÷ 2.`), solution: `IJ = ${AB / 2}, JK = ${BC / 2}, KI = ${AC / 2} : périmètre ${(AB + BC + AC) / 2} cm.` };
  }, SIT),
  mk("tri-milieux-prop", "Droite des milieux", 2, { skill: "Droite des milieux : parallélisme et milieu du troisième côté", ref: `${BOOK}, chap. 4 §1.1-1.2 (p. 46-47)`, kw: ["droite des milieux", "parallèle", "milieu", "réciproque", "triangle"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Dans un triangle ABC, I est le milieu de [AB] et J le milieu de [AC]. Que peut-on dire de (IJ) et (BC) ?", good: "(IJ) est parallèle à (BC)", bad: ["(IJ) est perpendiculaire à (BC)", "(IJ) est confondue avec (BC)", "(IJ) coupe (BC) en son milieu"], why: "La droite qui passe par les milieux de deux côtés est parallèle au support du troisième côté." },
      { q: "Dans un triangle ABC, I est le milieu de [AB] et la droite (D) passe par I et est parallèle à (BC). Que peut-on dire de (D) ?", good: "Elle passe par le milieu de [AC]", bad: ["Elle passe par C", "Elle est confondue avec (AC)", "Elle est perpendiculaire à (AC)"], why: "Une droite passant par le milieu d'un côté et parallèle à un autre côté passe par le milieu du troisième côté." },
      { q: "Dans le triangle ABC rectangle en B, la médiatrice de [BC] coupe [AC] en I. Que peut-on dire de I ?", good: "I est le milieu de [AC]", bad: ["I est confondu avec A", "I est le pied de la hauteur issue de B", "I est confondu avec B"], why: "La médiatrice de [BC] est perpendiculaire à (BC) donc parallèle à (AB) et passe par le milieu de [BC] : elle passe par le milieu de [AC]." },
      { q: "I, J, K sont les milieux des côtés d'un triangle ABC. Quelle est la nature du quadrilatère formé par A, K, I et J (K sur [AB], I sur [BC], J sur [AC]) ?", good: "Un parallélogramme", bad: ["Un trapèze quelconque", "Un cerf-volant", "Un rectangle à coup sûr"], why: "(IJ) // (AB) et (KI) // (AC) par la droite des milieux : AKIJ a ses côtés opposés parallèles." },
    ];
    return qcmOf(r, pool, "Pense à la droite des milieux.");
  }, QCM),
  mk("tri-medianes", "Droites particulières d'un triangle", 2, { skill: "Médianes et centre de gravité (aux 2/3 depuis le sommet)", ref: `${BOOK}, chap. 4 §2.3, ex. 2.e-2.g (p. 50-51)`, kw: ["médiane", "centre de gravité", "2/3", "concourantes"] }, (c, r) => {
    const m = 3 * int(r, 2, 14);
    const t = int(r, 0, 2);
    void c;
    if (t === 0) return { statement: `G est le centre de gravité du triangle ABC et A' est le milieu de [BC]. La médiane [AA'] mesure ${m} cm. Calcule AG (en cm).`, answer: num((2 * m) / 3), hints: H("Le centre de gravité est situé aux 2/3 de chaque médiane à partir du sommet.", "AG = (2/3) × AA'.", `${m} ÷ 3 × 2.`, "Calcule."), solution: `AG = (2/3) × ${m} = ${(2 * m) / 3} cm.` };
    if (t === 1) return { statement: `G est le centre de gravité du triangle ABC et A' est le milieu de [BC]. AG = ${(2 * m) / 3} cm. Calcule GA' (en cm).`, answer: num(m / 3), hints: H("AG vaut les 2/3 de la médiane AA'.", `AA' = ${(2 * m) / 3} ÷ 2 × 3 = ${m}.`, "GA' = AA' − AG.", `${m} − ${(2 * m) / 3}.`), solution: `AA' = ${m} ; GA' = ${m} − ${(2 * m) / 3} = ${m / 3} cm.` };
    const pool: Item[] = [
      { q: "Chaque médiane d'un triangle le partage en deux triangles…", good: "de même aire", bad: ["isocèles", "rectangles", "équilatéraux"], why: "Une médiane partage un triangle en deux triangles de même aire (même hauteur, bases égales)." },
      { q: "Combien de médianes un triangle a-t-il, et que peut-on dire d'elles ?", good: "Trois, elles sont concourantes", bad: ["Deux, elles sont parallèles", "Trois, elles sont parallèles", "Une seule"], why: "Les trois médianes d'un triangle sont concourantes ; leur point commun est le centre de gravité." },
    ];
    return qcmOf(r, pool, "Pense au centre de gravité.");
  }, [{ id: "mediane", label: "Médianes" }]),
  mk("tri-hauteurs", "Droites particulières d'un triangle", 2, { skill: "Hauteurs, bissectrices, cercles inscrit et circonscrit : points de concours", ref: `${BOOK}, chap. 4 §2.1-2.2 (p. 48-49) et ex. 7 (p. 59)`, kw: ["orthocentre", "hauteurs", "bissectrices", "cercle inscrit", "cercle circonscrit", "concourantes"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Comment s'appelle le point de concours des trois hauteurs d'un triangle ?", good: "L'orthocentre", bad: ["Le centre de gravité", "Le centre du cercle inscrit", "Le centre du cercle circonscrit"], why: "Les trois hauteurs sont concourantes ; leur point commun est l'orthocentre." },
      { q: "Le point de concours des trois médiatrices des côtés d'un triangle est…", good: "le centre du cercle circonscrit", bad: ["le centre du cercle inscrit", "le centre de gravité", "l'orthocentre"], why: "Il est équidistant des trois sommets : c'est le centre du cercle circonscrit." },
      { q: "Le point de concours des trois bissectrices des angles d'un triangle est…", good: "le centre du cercle inscrit", bad: ["le centre du cercle circonscrit", "le centre de gravité", "l'orthocentre"], why: "Les trois bissectrices sont concourantes ; leur point commun est le centre du cercle inscrit." },
      { q: "Dans un triangle équilatéral, le centre de gravité est aussi…", good: "l'orthocentre, le centre du cercle circonscrit et le centre du cercle inscrit", bad: ["seulement l'orthocentre", "seulement le centre du cercle inscrit", "aucun de ces points"], why: "Dans un triangle équilatéral, ces quatre points sont confondus." },
      { q: "Quel est l'orthocentre d'un triangle rectangle en A ?", good: "Le point A", bad: ["Le milieu de l'hypoténuse", "Le point B", "Le pied de la hauteur issue de A"], why: "Deux hauteurs sont les côtés de l'angle droit : elles se coupent en A." },
      { q: "Un cercle inscrit dans un triangle est…", good: "intérieur au triangle et tangent aux supports de ses côtés", bad: ["extérieur au triangle", "passant par les trois sommets", "centré au milieu d'un côté"], why: "On appelle cercle inscrit dans un triangle le cercle intérieur à ce triangle et tangent aux supports de ses côtés." },
    ];
    return qcmOf(r, pool, "Associe chaque droite à son point de concours.");
  }, QCM),
  mk("tri-isocele-axe", "Droites particulières d'un triangle", 2, { skill: "Triangle isocèle : axe de symétrie (médiatrice, bissectrice, hauteur, médiane)", ref: `${BOOK}, chap. 4 §3 (p. 52-53)`, kw: ["triangle isocèle", "axe de symétrie", "bissectrice", "hauteur", "médiane"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "ABC est isocèle en A. L'axe de symétrie de ABC est à la fois…", good: "la médiatrice de [BC], la bissectrice de l'angle Â, la hauteur et la médiane issues de A", bad: ["la médiatrice de [AB] seulement", "la bissectrice de B̂ seulement", "la hauteur issue de B"], why: "L'axe de symétrie d'un triangle isocèle est à la fois la médiatrice de sa base, la bissectrice, la hauteur et la médiane passant par son sommet principal." },
      { q: "Dans un triangle, une droite est à la fois bissectrice et hauteur. Que peut-on dire du triangle ?", good: "Il est isocèle", bad: ["Il est rectangle", "Il est équilatéral à coup sûr", "Il est quelconque"], why: "Si une droite est à la fois bissectrice et hauteur, alors le triangle est isocèle." },
      { q: "Dans un triangle, une droite est à la fois hauteur et médiane. Que peut-on dire du triangle ?", good: "Il est isocèle", bad: ["Il est rectangle", "Il est équilatéral à coup sûr", "Il est quelconque"], why: "Si une droite est à la fois hauteur et médiane, alors le triangle est isocèle." },
      { q: "ABC est isocèle en A et H est le milieu de [BC]. Que peut-on dire de (AH) et (BC) ?", good: "(AH) est perpendiculaire à (BC)", bad: ["(AH) est parallèle à (BC)", "(AH) est confondue avec (BC)", "AH = BC"], why: "(AH) est la médiane issue de A, donc aussi la hauteur : (AH) ⊥ (BC)." },
    ];
    return qcmOf(r, pool, "Dans un triangle isocèle, l'axe de symétrie cumule quatre rôles.");
  }, QCM),
  mk("pyth-hypotenuse", "Triangle rectangle", 2, { skill: "Théorème de Pythagore : calculer l'hypoténuse", ref: `${BOOK}, chap. 4 §4.1, ex. 4.a-4.c (p. 54-55) et ex. 11-14 (p. 60)`, kw: ["pythagore", "hypoténuse", "triangle rectangle", "carré", "diagonale"] }, (c, r) => {
    const [a, b, h] = pick(r, TRIPLES);
    return { statement: c === "pur" ? `ABC est rectangle en A, AB = ${a} cm et AC = ${b} cm. Calcule BC.` : `Un rectangle de ${a} cm sur ${b} cm a pour diagonale d (en cm). Calcule d.`, answer: num(h), hints: H("On cherche l'hypoténuse d'un triangle rectangle.", "Le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.", `BC² = ${a}² + ${b}² = ${a * a} + ${b * b}.`, `BC² = ${h * h} donc BC = ${h}.`), solution: `BC² = ${a}² + ${b}² = ${a * a + b * b}, donc BC = ${h} cm.` };
  }, SIT),
  mk("pyth-cote", "Triangle rectangle", 2, { skill: "Théorème de Pythagore : calculer un côté de l'angle droit", ref: `${BOOK}, chap. 4 §4.1, ex. 4.a-4.b (p. 55) et ex. 15-17 (p. 60)`, kw: ["pythagore", "côté", "triangle rectangle", "échelle", "hauteur"] }, (c, r) => {
    const [a, b, h] = pick(r, TRIPLES);
    return { statement: c === "pur" ? `ABC est rectangle en A, BC = ${h} cm et AB = ${a} cm. Calcule AC.` : `Une échelle de ${h} m est posée contre un mur ; son pied est à ${a} m du mur. À quelle hauteur (en m) touche-t-elle le mur ?`, answer: num(b), hints: H("On cherche un côté de l'angle droit.", "Le carré de l'hypoténuse est la somme des carrés des deux autres côtés.", `AC² = BC² − AB² = ${h * h} − ${a * a}.`, `AC² = ${b * b}.`), solution: `AC² = ${h}² − ${a}² = ${h * h - a * a}, donc AC = ${b}.` };
  }, SIT),
  mk("pyth-reciproque", "Triangle rectangle", 2, { skill: "Réciproque de Pythagore : le triangle est-il rectangle ?", ref: `${BOOK}, chap. 4 §4.2, ex. 4.d-4.g (p. 55-56) et ex. 18-20 (p. 60)`, kw: ["réciproque de pythagore", "triangle rectangle", "carré", "vérifier"] }, (_c, r) => {
    const [a, b, h] = pick(r, TRIPLES);
    const ok = int(r, 0, 1) === 0;
    const hh = ok ? h : h + pick(r, [1, 2, -1]);
    return { statement: `Un triangle a pour côtés ${a} cm, ${b} cm et ${hh} cm. Est-il rectangle ?`, answer: choice(r, ["Oui, rectangle", "Non, pas rectangle"], ok ? 0 : 1), hints: H("On applique la réciproque du théorème de Pythagore.", "Compare le carré du plus grand côté à la somme des carrés des deux autres.", `${Math.max(a, b, hh)}² = ${Math.max(a, b, hh) ** 2}.`, `${a}² + ${b}² = ${a * a + b * b} (si ${hh} est le plus grand).`), solution: `${hh}² = ${hh * hh} ; ${a}² + ${b}² = ${a * a + b * b} : ${ok ? "égalité, donc le triangle est rectangle" : "pas d'égalité, donc le triangle n'est pas rectangle"}.` };
  }, QCM),
  mk("pyth-hauteur", "Triangle rectangle", 3, { skill: "Triangle rectangle : a × h = b × c (hauteur sur l'hypoténuse)", ref: `${BOOK}, chap. 4 §4.3, ex. 4.h (p. 56-57)`, kw: ["hauteur", "hypoténuse", "aire", "a × h = b × c", "distance à la droite"] }, (_c, r) => {
    const [b, c, a] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]]);
    const h = round((b * c) / a, 4);
    return { statement: `Un triangle ABC est rectangle en A avec AB = ${b} cm, AC = ${c} cm et BC = ${a} cm. Quelle est la distance de A à la droite (BC) (en cm) ?`, answer: num(h, 0.01), hints: H("C'est la hauteur issue de A.", "L'aire du triangle se calcule de deux façons.", `Aire = ${b} × ${c} ÷ 2 = BC × h ÷ 2.`, `h = ${b} × ${c} ÷ ${a}.`), solution: `${a} × h = ${b} × ${c} = ${b * c}, donc h = ${b * c} ÷ ${a} = ${fr(h)} cm.` };
  }, CALC),

  // ===== Chapitre 5 : Translations et vecteurs =====
  mk("vec-egalite", "Vecteurs", 2, { skill: "Égalité de vecteurs et parallélogramme", ref: `${BOOK}, chap. 5 §2.2, ex. 2.b-2.e (p. 69-71)`, kw: ["vecteurs égaux", "parallélogramme", "AB = DC", "même milieu"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "ABCD est un parallélogramme. Quel vecteur est égal à AB ?", good: "DC", bad: ["CD", "BC", "AD"], why: "Dans un parallélogramme ABCD, AB = DC (même direction, même sens, même longueur)." },
      { q: "ABCD est un parallélogramme. Quel vecteur est égal à AD ?", good: "BC", bad: ["CB", "AB", "DC"], why: "Dans un parallélogramme ABCD, AD = BC." },
      { q: "On a AB = DC (vecteurs). Que peut-on dire du quadrilatère ABCD ?", good: "C'est un parallélogramme", bad: ["C'est un losange à coup sûr", "C'est un trapèze isocèle", "C'est un rectangle à coup sûr"], why: "AB = DC équivaut à : [AC] et [BD] ont le même milieu, c'est-à-dire que ABCD est un parallélogramme (éventuellement aplati)." },
      { q: "I est le milieu de [AB]. Quelle égalité vectorielle est vraie ?", good: "AI = IB", bad: ["AI = BI", "AI = AB", "IA = IB"], why: "I est le milieu de [AB] équivaut à AI = IB." },
      { q: "I est le milieu de [AB]. Quelle égalité vectorielle est vraie ?", good: "IA + IB = 0 (vecteur nul)", bad: ["IA + IB = AB", "IA = IB", "IA − IB = 0"], why: "I milieu de [AB] équivaut à IA + IB = 0 (vecteur nul)." },
      { q: "Deux vecteurs opposés ont…", good: "même direction, même longueur, sens contraires", bad: ["même sens et même longueur", "même sens et longueurs différentes", "des directions différentes"], why: "Deux vecteurs opposés ont la même direction, la même longueur, mais des sens contraires : AB = −BA." },
    ];
    return qcmOf(r, pool, "Vérifie direction, sens et longueur.");
  }, QCM),
  mk("vec-chasles", "Vecteurs", 3, { skill: "Relation de Chasles : simplifier une somme de vecteurs", ref: `${BOOK}, chap. 5 §2.3-2.4 (p. 71-73) et ex. 2.i`, kw: ["chasles", "somme de vecteurs", "AB + BC = AC", "vecteur nul"] }, (_c, r) => {
    const L = ["A", "B", "C", "D", "E", "F"];
    const k = int(r, 3, 4);
    const pts = shuffle(r, L).slice(0, k + 1);
    const chain = Array.from({ length: k }, (_, i) => `${pts[i]}${pts[i + 1]}`);
    const closed = int(r, 0, 3) === 0;
    const endp = closed ? pts[0] : pts[k];
    const full = chain.slice(0, k - 1);
    const lastP = closed ? pts[0] : pts[k];
    const chain2 = [...full, `${pts[k - 1]}${lastP}`];
    const good = closed ? "0 (vecteur nul)" : `${pts[0]}${endp}`;
    const opts = closed ? ["0 (vecteur nul)", `${pts[0]}${pts[1]}`, `${pts[1]}${pts[0]}`, `${pts[0]}${pts[k - 1]}`] : [good, `${endp}${pts[0]}`, `${pts[0]}${pts[k - 1]}`, "0 (vecteur nul)"];
    return { statement: `Simplifie la somme de vecteurs ${chain2.map((x) => `${x}`).join(" + ")}.`, answer: choice(r, [...new Set(opts)], 0), hints: H("On applique la relation de Chasles de proche en proche.", "AB + BC = AC.", "L'extrémité de chaque vecteur est l'origine du suivant.", `Le résultat va de ${pts[0]} à ${endp}.`), solution: `${chain2.join(" + ")} = ${closed ? "0 (on revient au point de départ)" : `${pts[0]}${endp}`}.` };
  }, QCM),
  mk("vec-translation", "Symétries et translations", 2, { skill: "Translation : propriétés et image d'un point", ref: `${BOOK}, chap. 5 §3 (p. 74-75)`, kw: ["translation", "vecteur", "image", "MM' = AB", "conservation"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "M' est l'image de M par la translation de vecteur AB. Quelle égalité est vraie ?", good: "MM' = AB (vecteurs)", bad: ["AM = MM'", "MM' = BA", "M'M = AB"], why: "L'image de M par la translation de vecteur AB est M' signifie MM' = AB." },
      { q: "Par une translation, l'image d'une droite est…", good: "une droite de même direction", bad: ["une droite perpendiculaire", "une demi-droite", "un point"], why: "Une droite a pour image une droite de même direction." },
      { q: "Par une translation, un segment [AB] a pour image un segment…", good: "de même longueur", bad: ["de longueur double", "de longueur moitié", "perpendiculaire"], why: "Une translation conserve les longueurs." },
      { q: "Par une translation, un cercle a pour image…", good: "un cercle de même rayon", bad: ["un cercle de rayon double", "un disque", "une droite"], why: "L'image d'un cercle est un cercle de même rayon." },
      { q: "Par une translation, un angle a pour image…", good: "un angle de même mesure", bad: ["un angle supplémentaire", "un angle de mesure double", "un angle droit"], why: "Une translation conserve les mesures d'angles." },
      { q: "Le milieu d'un segment a pour image par une translation…", good: "le milieu de l'image du segment", bad: ["une extrémité de l'image", "le point de départ du vecteur", "un point quelconque"], why: "Une translation conserve les milieux." },
    ];
    return qcmOf(r, pool, "Une translation « fait glisser » la figure sans la déformer.");
  }, QCM),

  // ===== Chapitre 6 : Projection et repérage =====
  mk("rep-coordonnees", "Projection et repérage", 1, { skill: "Coordonnées d'un point : abscisse et ordonnée", ref: `${BOOK}, chap. 6 §2.1-2.2, ex. 2.a-2.e (p. 85-87) et ex. 21-26 (p. 88-89)`, kw: ["abscisse", "ordonnée", "coordonnées", "repère", "symétrique"] }, (_c, r) => {
    const x = (int(r, 0, 1) ? 1 : -1) * int(r, 1, 9), y = (int(r, 0, 1) ? 1 : -1) * int(r, 1, 9);
    const t = int(r, 0, 3);
    const S = (n: number) => (n < 0 ? `−${-n}` : String(n));
    const qs = [
      { q: `Le point A a pour coordonnées (${S(x)} ; ${S(y)}). Quelle est son abscisse ?`, v: x, why: "La première coordonnée est l'abscisse." },
      { q: `Le point A a pour coordonnées (${S(x)} ; ${S(y)}). Quelle est son ordonnée ?`, v: y, why: "La deuxième coordonnée est l'ordonnée." },
      { q: `Dans un repère orthogonal, A a pour coordonnées (${S(x)} ; ${S(y)}). Quelle est l'ordonnée de son symétrique par rapport à l'axe des abscisses (OI) ?`, v: -y, why: "La symétrie par rapport à (OI) conserve l'abscisse et change le signe de l'ordonnée." },
      { q: `Dans un repère orthogonal, A a pour coordonnées (${S(x)} ; ${S(y)}). Quelle est l'abscisse de son symétrique par rapport à l'axe des ordonnées (OJ) ?`, v: -x, why: "La symétrie par rapport à (OJ) change le signe de l'abscisse et conserve l'ordonnée." },
    ][t];
    return { statement: qs.q, answer: num(qs.v), hints: H("On lit les coordonnées dans l'ordre : abscisse, puis ordonnée.", "(OI) est l'axe des abscisses et (OJ) l'axe des ordonnées.", "Une symétrie par rapport à un axe change le signe d'une coordonnée.", "Fais un petit repère."), solution: qs.why };
  }, [{ id: "reperage", label: "Repérage" }]),
  mk("rep-centre", "Projection et repérage", 2, { skill: "Symétrique par rapport à l'origine : coordonnées opposées", ref: `${BOOK}, chap. 6 §2.2, ex. 2.a (p. 85) et ex. 25 (p. 89)`, kw: ["symétrique par rapport à O", "coordonnées opposées", "repère"] }, (_c, r) => {
    const x = (int(r, 0, 1) ? 1 : -1) * int(r, 1, 9), y = (int(r, 0, 1) ? 1 : -1) * int(r, 1, 9);
    const wantX = int(r, 0, 1) === 0;
    return { statement: `Dans un repère, A a pour coordonnées (${x < 0 ? "−" : ""}${Math.abs(x)} ; ${y < 0 ? "−" : ""}${Math.abs(y)}). Quelle est ${wantX ? "l'abscisse" : "l'ordonnée"} du symétrique de A par rapport à l'origine O ?`, answer: num(wantX ? -x : -y), hints: H("O est le milieu de [AA'].", "Les coordonnées du symétrique sont les opposées de celles de A.", "Change le signe.", `L'opposé de ${wantX ? x : y}.`), solution: `Symétrique : (${-x} ; ${-y}) : ${wantX ? "abscisse" : "ordonnée"} ${wantX ? -x : -y}.` };
  }, CALC),
  mk("proj-calcul", "Projection et repérage", 2, { skill: "Projection orthogonale : distance et projeté", ref: `${BOOK}, chap. 6 §1 et ex. 1-13 (p. 87-88)`, kw: ["projection", "projeté orthogonal", "distance à une droite", "milieu"] }, (c, r) => {
    const [a, b, h] = pick(r, TRIPLES.slice(0, 5));
    const k = int(r, 0, 1);
    void c;
    if (k === 0) return { statement: `A est un point et H son projeté orthogonal sur la droite (D). B est un point de (D) tel que HB = ${a} cm. AH = ${b} cm. Quelle est la distance AB (en cm) ?`, answer: num(h), hints: H("Le triangle AHB est rectangle en H.", "On applique Pythagore.", `AB² = AH² + HB² = ${b * b} + ${a * a}.`, `AB² = ${h * h}.`), solution: `AB² = ${b}² + ${a}² = ${h * h}, donc AB = ${h} cm.` };
    const x = (int(r, 0, 1) ? 1 : -1) * int(r, 1, 9), y = (int(r, 0, 1) ? 1 : -1) * int(r, 1, 9);
    const onI = int(r, 0, 1) === 0;
    return { statement: `Dans un repère orthogonal (O, I, J), A a pour coordonnées (${x < 0 ? "−" : ""}${Math.abs(x)} ; ${y < 0 ? "−" : ""}${Math.abs(y)}). Quelle est ${onI ? "l'abscisse" : "l'ordonnée"} de son projeté orthogonal sur ${onI ? "(OI)" : "(OJ)"} ?`, answer: num(onI ? x : y), hints: H("Le projeté orthogonal de A sur un axe est le pied de la perpendiculaire à cet axe.", onI ? "Sur (OI), il garde l'abscisse de A." : "Sur (OJ), il garde l'ordonnée de A.", "L'autre coordonnée est nulle sur l'axe.", "Recopie la bonne coordonnée."), solution: `Le projeté de A sur ${onI ? "(OI)" : "(OJ)"} a pour ${onI ? "abscisse" : "ordonnée"} ${onI ? x : y}.` };
  }, CALC),

  // ===== Chapitre 7 : Angle au centre, polygones réguliers =====
  mk("arc-longueur", "Angle au centre et polygones réguliers", 2, { skill: "Longueur d'un arc de cercle (proportionnelle à l'angle au centre)", ref: `${BOOK}, chap. 7 §1, ex. 1.a-1.b (p. 93-94) et ex. 2-6 (p. 97)`, kw: ["arc de cercle", "angle au centre", "longueur", "proportionnel", "π"] }, (c, r) => {
    const R = pick(r, [2, 3, 4, 5, 10, 20]), ang = pick(r, [30, 45, 60, 90, 120, 135, 180]);
    const L = round((2 * PI * R * ang) / 360, 2);
    return { statement: c === "pur" ? `Un cercle a pour rayon ${R} cm. Quelle est la longueur de l'arc intercepté par un angle au centre de ${ang}° (en cm, π ≈ 3,14, arrondie au centième) ?` : `Un rond-point a pour rayon ${R} m. Un virage suit un arc de cercle intercepté par un angle au centre de ${ang}°. Quelle distance (en m) parcourt-on dans ce virage ? (π ≈ 3,14, arrondie au centième)`, answer: num(L, 0.01), hints: H("La longueur d'un arc est proportionnelle à l'angle au centre.", `Le cercle entier (360°) mesure 2 × 3,14 × ${R} = ${fr(round(2 * PI * R, 4))}.`, `L = ${fr(round(2 * PI * R, 4))} × ${ang} ÷ 360.`, "Calcule."), solution: `Périmètre : 2 × 3,14 × ${R} = ${fr(round(2 * PI * R, 4))} ; arc = ${fr(round(2 * PI * R, 4))} × ${ang} ÷ 360 ≈ ${fr(L)}.` };
  }, SIT),
  mk("arc-angle", "Angle au centre et polygones réguliers", 3, { skill: "Angle au centre à partir de la longueur d'un arc", ref: `${BOOK}, chap. 7, ex. 5-6, 20-21 (p. 97-98)`, kw: ["angle au centre", "arc de cercle", "longueur", "périmètre", "fraction du cercle"] }, (_c, r) => {
    const d = pick(r, [16, 8, 12, 10, 6]);
    const ang = 360 / d;
    return { statement: `Un arc de cercle mesure 1/${d} du périmètre du cercle. Quelle est la mesure de l'angle au centre qui l'intercepte (en °) ?`, answer: num(ang, 0.01, "°"), hints: H("L'angle au centre est proportionnel à la longueur de l'arc.", "Un tour complet fait 360°.", `L'angle vaut 360° ÷ ${d}.`, "Calcule."), solution: `360 ÷ ${d} = ${fr(ang)}°.` };
  }, CALC),
  mk("poly-regulier", "Angle au centre et polygones réguliers", 2, { skill: "Polygone régulier : angle au centre et côtés", ref: `${BOOK}, chap. 7 §2.2, ex. 2.a (p. 95-96) et ex. 12-13 (p. 97)`, kw: ["polygone régulier", "angle au centre", "360", "pentagone", "hexagone", "octogone"] }, (_c, r) => {
    const n = pick(r, [3, 4, 5, 6, 8, 9, 10, 12]);
    const name = { 3: "triangle équilatéral", 4: "carré", 5: "pentagone régulier", 6: "hexagone régulier", 8: "octogone régulier", 9: "ennéagone régulier", 10: "décagone régulier", 12: "dodécagone régulier" }[n as 3 | 4 | 5 | 6 | 8 | 9 | 10 | 12];
    return { statement: `Quelle est la mesure (en °) de l'angle au centre qui intercepte un côté d'un ${name} ?`, answer: num(360 / n, 0.001, "°"), hints: H("Un polygone régulier est inscrit dans un cercle, ses côtés ont même longueur.", "Les angles au centre sont égaux.", `Il y a ${n} angles au centre qui font 360° en tout.`, `360 ÷ ${n}.`), solution: `360° ÷ ${n} = ${fr(360 / n)}°.` };
  }, [{ id: "poly", label: "Polygones réguliers" }]),

  // ===== Chapitre 8 : Solides de l'espace =====
  mk("sol-prisme-cylindre", "Solides de l'espace", 2, { skill: "Volume et aire latérale d'un prisme ou d'un cylindre", ref: `${BOOK}, chap. 8 §4, tableau (p. 109) et ex. 15-17 (p. 111-112)`, kw: ["volume", "aire latérale", "prisme", "cylindre", "B × h", "P × h"] }, (c, r) => {
    const R = pick(r, [2, 3, 4, 5, 7]), h = int(r, 3, 15);
    const k = int(r, 0, 3);
    if (k === 0) return { statement: c === "pur" ? `Calcule le volume d'un cylindre de rayon ${R} cm et de hauteur ${h} cm (π ≈ 3,14), en cm³.` : `Un bidon cylindrique a un rayon de ${R} dm et une hauteur de ${h} dm. Quel est son volume (en dm³, π ≈ 3,14) ?`, answer: num(round(PI * R * R * h, 3), 0.01), hints: H("V = B × h.", `B est l'aire du disque de base : 3,14 × ${R}².`, `B = ${fr(round(PI * R * R, 3))}.`, `${fr(round(PI * R * R, 3))} × ${h}.`), solution: `V = 3,14 × ${R}² × ${h} = ${fr(round(PI * R * R * h, 3))}.` };
    if (k === 1) return { statement: `Calcule l'aire latérale d'un cylindre de rayon ${R} cm et de hauteur ${h} cm (π ≈ 3,14), en cm².`, answer: num(round(2 * PI * R * h, 3), 0.01), hints: H("Aire latérale = périmètre de la base × hauteur.", `Périmètre de la base : 2 × 3,14 × ${R}.`, `${fr(round(2 * PI * R, 3))}.`, `${fr(round(2 * PI * R, 3))} × ${h}.`), solution: `A = 2 × 3,14 × ${R} × ${h} = ${fr(round(2 * PI * R * h, 3))}.` };
    const a = int(r, 3, 12), b = int(r, 3, 12), H0 = int(r, 3, 12);
    if (k === 2) return { statement: `Un prisme droit a pour base un triangle rectangle de côtés de l'angle droit ${a} cm et ${b} cm, et pour hauteur ${H0} cm. Calcule son volume (en cm³).`, answer: num((a * b * H0) / 2), hints: H("V = B × h.", `B = ${a} × ${b} ÷ 2.`, `B = ${(a * b) / 2}.`, `${(a * b) / 2} × ${H0}.`), solution: `V = (${a} × ${b} ÷ 2) × ${H0} = ${(a * b * H0) / 2} cm³.` };
    return { statement: `Un prisme droit a pour base un rectangle de ${a} cm sur ${b} cm, et pour hauteur ${H0} cm. Calcule son aire latérale (en cm²).`, answer: num(2 * (a + b) * H0), hints: H("Aire latérale = périmètre de la base × hauteur.", `Périmètre de la base : 2 × (${a} + ${b}) = ${2 * (a + b)}.`, `${2 * (a + b)} × ${H0}.`, "Calcule."), solution: `A = 2 × (${a} + ${b}) × ${H0} = ${2 * (a + b) * H0} cm².` };
  }, SIT),
  mk("sol-sphere", "Solides de l'espace", 3, { skill: "Aire et volume d'une sphère ou d'une boule", ref: `${BOOK}, chap. 8 §4, tableau (p. 109), ex. 4.a et ex. 15-24 (p. 111-112)`, kw: ["sphère", "boule", "aire", "volume", "4πr²", "4πr³/3"] }, (_c, r) => {
    const R = pick(r, [3, 6, 9, 12, 15, 21]);
    const k = int(r, 0, 1);
    if (k === 0) return { statement: `Calcule l'aire d'une sphère de rayon ${R} cm (π ≈ 3,14), en cm².`, answer: num(round(4 * PI * R * R, 3), 0.01), hints: H("A = 4 π r².", `r² = ${R * R}.`, `4 × 3,14 × ${R * R}.`, "Calcule."), solution: `A = 4 × 3,14 × ${R}² = ${fr(round(4 * PI * R * R, 3))} cm².` };
    return { statement: `Calcule le volume d'une boule de rayon ${R} cm (π ≈ 3,14), en cm³.`, answer: num(round((4 * PI * R ** 3) / 3, 3), 0.01), hints: H("V = 4 π r³ ÷ 3.", `r³ = ${R ** 3}.`, `4 × 3,14 × ${R ** 3} ÷ 3.`, "Calcule."), solution: `V = 4 × 3,14 × ${R}³ ÷ 3 = ${fr(round((4 * PI * R ** 3) / 3, 3))} cm³.` };
  }, CALC),
  mk("sol-vocabulaire", "Solides de l'espace", 1, { skill: "Prismes, pyramides, cônes : vocabulaire et dénombrement", ref: `${BOOK}, chap. 8 §1 et §3 (p. 100-108) et ex. 4 (p. 110)`, kw: ["pyramide", "prisme", "cône", "faces", "arêtes", "sommets"] }, (_c, r) => {
    const c0 = int(r, 3, 9);
    const q = int(r, 0, 2);
    const v = [c0 + 1, 2 * c0, c0 + 1][q];
    const what = ["de faces", "d'arêtes", "de sommets"][q];
    return { statement: `Une pyramide a une base à ${c0} côtés. Combien a-t-elle ${what} ?`, answer: num(v), hints: H("Une pyramide a une base et des faces latérales triangulaires.", "Les faces latérales ont un sommet commun.", `Compte : ${c0} sommets à la base plus le sommet de la pyramide.`, "Fais un dessin."), solution: [`${c0} faces latérales et 1 base : ${c0 + 1}.`, `${c0} arêtes à la base et ${c0} arêtes latérales : ${2 * c0}.`, `${c0} sommets à la base et le sommet : ${c0 + 1}.`][q] };
  }, [{ id: "denombrement", label: "Dénombrement" }]),

  // ===== Chapitre 9 : Droites et plans de l'espace =====
  mk("espace-proprietes", "Droites et plans de l'espace", 2, { skill: "Droites et plans de l'espace : détermination et positions", ref: `${BOOK}, chap. 9 §1-2 (p. 114-117)`, kw: ["droite", "plan", "déterminer", "perpendiculaire à un plan", "sécante", "parallèles"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Dans l'espace, combien de droites passent par deux points distincts ?", good: "Une seule", bad: ["Deux", "Aucune", "Une infinité"], why: "Dans l'espace, deux points distincts déterminent une droite et une seule." },
      { q: "Combien de plans passent par trois points non alignés ?", good: "Un seul", bad: ["Deux", "Aucun", "Une infinité"], why: "Trois points non alignés déterminent un plan et un seul." },
      { q: "Combien de plans contiennent une droite donnée ?", good: "Autant qu'on veut (une infinité)", bad: ["Un seul", "Deux", "Aucun"], why: "On peut trouver autant de plans que l'on veut contenant une droite donnée (comme une porte autour de ses gonds)." },
      { q: "Deux droites sécantes déterminent…", good: "un plan et un seul", bad: ["deux plans", "aucun plan", "une infinité de plans"], why: "Deux droites sécantes déterminent un plan et un seul." },
      { q: "Deux droites parallèles déterminent…", good: "un plan et un seul", bad: ["deux plans", "aucun plan", "une infinité de plans"], why: "Deux droites parallèles déterminent un plan et un seul." },
      { q: "Une droite est perpendiculaire à un plan lorsqu'elle est…", good: "perpendiculaire à deux droites sécantes de ce plan", bad: ["parallèle à deux droites de ce plan", "perpendiculaire à une seule droite de ce plan", "contenue dans ce plan"], why: "Une droite est perpendiculaire à un plan lorsqu'elle est perpendiculaire à deux droites sécantes de ce plan." },
      { q: "Une droite et un plan ont un seul point commun. On dit qu'ils sont…", good: "sécants", bad: ["parallèles", "confondus", "perpendiculaires"], why: "Une droite et un plan sécants ont un point commun et un seul." },
      { q: "Une droite qui passe par deux points d'un plan est…", good: "contenue dans ce plan", bad: ["parallèle à ce plan", "perpendiculaire à ce plan", "sécante à ce plan en un point"], why: "La droite qui passe par deux points d'un plan est contenue dans ce plan." },
    ];
    return qcmOf(r, pool, "Pense au cube ou à une porte qui tourne sur ses gonds.");
  }, QCM),
);
void gcd; void sup;
