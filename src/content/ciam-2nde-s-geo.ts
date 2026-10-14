// CIAM Seconde S : chapitres 1 (angles inscrits, polygones réguliers), 6 (homothétie, rotation) et 7 (géométrie de l'espace).
// Énoncés originaux, réponses calculées par le code. Les tracés du manuel ne se corrigent pas automatiquement :
// on en garde les calculs (mesures, longueurs, coordonnées) et les propriétés de cours.
import { choice, fr, int, num, pick, register, round, Rng } from "./core";
import { ciam, H, Item, QCM, qcmOf, withWrong } from "./ciam-kit";

const mk = ciam("2nde", "ciam2g");
const BOOK = "CIAM 2nde S";
const FR = [{ id: "calcul", label: "Calcul" }];
const rad = (d: number) => (d * Math.PI) / 180;
const sinD = (d: number) => Math.sin(rad(d));
const cosD = (d: number) => Math.cos(rad(d));
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => round(x, 2);
const rnd = (r: Rng) => (int(r, 0, 1) === 0 ? -1 : 1);
const lin = (a: number, b: number, v: string) => {
  const t1 = a === 1 ? v : a === -1 ? `−${v}` : `${a < 0 ? "−" : ""}${Math.abs(a)}${v}`;
  return b === 0 ? t1 : `${t1} ${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
};
/** Mesure principale en degrés, dans ]−180 ; 180]. */
const principal = (d: number) => { let x = ((d % 360) + 360) % 360; if (x > 180) x -= 360; return x; };

const AI = "Angles inscrits — série C";
const HO = "Homothéties — série C";
const RO = "Rotations — série C";
const ES = "Droites et plans de l'espace — série C";

// ---------- Géométrie de l'espace : solides en coordonnées pour classer les positions par le calcul ----------
type V3 = [number, number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const zero = (v: V3) => Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]) < 1e-9;
interface Solid { name: string; pts: Record<string, V3>; edges: [string, string][]; intro: string }
const CUBE: Solid = {
  name: "cube",
  pts: { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] },
  edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["E", "F"], ["F", "G"], ["G", "H"], ["H", "E"], ["A", "E"], ["B", "F"], ["C", "G"], ["D", "H"]],
  intro: "Dans le cube ABCDEFGH (ABCD est la face inférieure, EFGH la face supérieure, [AE], [BF], [CG] et [DH] sont les arêtes verticales)",
};
const TETRA: Solid = {
  name: "tétraèdre",
  pts: { S: [0, 0, 1], A: [0, 0, 0], B: [2, 0, 0], C: [0, 2, 0] },
  edges: [["S", "A"], ["S", "B"], ["S", "C"], ["A", "B"], ["B", "C"], ["A", "C"]],
  intro: "Dans le tétraèdre SABC",
};
const PYRA: Solid = {
  name: "pyramide",
  pts: { S: [1, 1, 2], A: [0, 0, 0], B: [2, 0, 0], C: [2, 2, 0], D: [0, 2, 0] },
  edges: [["S", "A"], ["S", "B"], ["S", "C"], ["S", "D"], ["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"]],
  intro: "Dans la pyramide SABCD (la base ABCD est un carré)",
};
type Rel = "Parallèles" | "Sécantes" | "Non coplanaires";
const relLines = (s: Solid, e1: [string, string], e2: [string, string]): Rel => {
  const p1 = s.pts[e1[0]], d1 = sub(s.pts[e1[1]], p1), p2 = s.pts[e2[0]], d2 = sub(s.pts[e2[1]], p2);
  const c = cross(d1, d2);
  if (zero(c)) return "Parallèles";
  return Math.abs(dot(sub(p2, p1), c)) < 1e-9 ? "Sécantes" : "Non coplanaires";
};
const REL: Rel[] = ["Parallèles", "Sécantes", "Non coplanaires"];
const nameE = (e: [string, string]) => `(${e[0]}${e[1]})`;
const sameLine = (a: [string, string], b: [string, string]) => a[0] === b[0] && a[1] === b[1];

register(
  // ===== Chapitre 1 : Angles inscrits et polygones réguliers =====
  mk("ai-inscrit-centre", AI, 2, { skill: "Angle inscrit et angle au centre associé", ref: `${BOOK}, chap. 1 §1.1, théorème (p. 8) et ex. 1-2 (p. 23)`, kw: ["angle inscrit", "angle au centre", "arc intercepté", "demi", "diamètre"] }, (_c, r) => {
    const t = int(r, 0, 3);
    if (t === 0) { const x = 2 * int(r, 20, 80); return { statement: `Sur un cercle de centre O, A et B sont deux points et M est un point du grand arc AB (l'angle inscrit AMB est aigu). L'angle au centre AOB mesure ${x}°. Quelle est la mesure de l'angle inscrit AMB (en degrés) ?`, answer: num(x / 2), hints: H("On compare un angle inscrit et l'angle au centre qui intercepte le même arc.", "Quand l'angle inscrit est aigu : mes AMB = ½ mes AOB.", `Divise ${x} par 2.`, "Un angle inscrit vaut la moitié de l'angle au centre."), solution: `mes AMB = ½ × ${x}° = ${x / 2}°.` }; }
    if (t === 1) { const a = int(r, 20, 80); return { statement: `Un angle inscrit aigu AMB mesure ${a}°. Quelle est la mesure de l'angle au centre associé AOB (en degrés) ?`, answer: num(2 * a), hints: H("L'angle au centre est associé à l'angle inscrit qui intercepte le même arc.", "mes AOB = 2 × mes AMB quand AMB est aigu.", `Double ${a}.`, "L'angle au centre vaut le double."), solution: `mes AOB = 2 × ${a}° = ${2 * a}°.` }; }
    if (t === 2) { const x = 2 * int(r, 30, 80); return { statement: `Sur un cercle de centre O, l'angle au centre AOB mesure ${x}° et M est un point du petit arc AB (l'angle inscrit AMB est obtus). Quelle est la mesure de l'angle AMB (en degrés) ?`, answer: num(180 - x / 2), hints: H("L'angle inscrit intercepte ici le grand arc : il est obtus.", "Dans ce cas, mes AMB = 180° − ½ mes AOB.", `½ × ${x} = ${x / 2}.`, `180 − ${x / 2}.`), solution: `mes AMB = 180° − ½ × ${x}° = ${180 - x / 2}°.` }; }
    const a = int(r, 20, 70);
    return { statement: `[AB] est un diamètre d'un cercle et M est un autre point du cercle. Dans le triangle AMB, l'angle MAB mesure ${a}°. Quelle est la mesure de l'angle MBA (en degrés) ?`, answer: num(90 - a), hints: H("Quand [AB] est un diamètre, l'angle au centre AOB est plat.", "Alors l'angle inscrit AMB mesure la moitié de 180°.", "Le triangle AMB est rectangle en M.", `Dans un triangle, la somme des angles vaut 180° : 90 + ${a} + ?`), solution: `L'angle AOB est plat (180°), donc mes AMB = 90°. Alors mes MBA = 180° − 90° − ${a}° = ${90 - a}°.` };
  }, FR),
  mk("ai-tangente", AI, 2, { skill: "Angle formé par une corde et la tangente ; tangentes issues d'un point", ref: `${BOOK}, chap. 1 §1.2, propriété (p. 9) et ex. 1-2 (p. 23)`, kw: ["tangente", "corde", "demi-tangente", "angle inscrit", "angle au centre"] }, (_c, r) => {
    const t = int(r, 0, 3);
    if (t === 0) { const x = 2 * int(r, 25, 85); return { statement: `[AB] est une corde d'un cercle de centre O ; l'angle au centre AOB mesure ${x}°. T est un point de la demi-tangente en A située dans le demi-plan de frontière (AB) qui ne contient pas O. Quelle est la mesure de TAB (en degrés) ?`, answer: num(x / 2), hints: H("L'angle entre la tangente et la corde joue le rôle d'un angle inscrit.", "mes TAB = ½ mes AOB.", `Divise ${x} par 2.`, "Même calcul qu'un angle inscrit."), solution: `mes TAB = ½ × ${x}° = ${x / 2}°.` }; }
    if (t === 1) { const a = int(r, 20, 80); return { statement: `Une demi-tangente [AT) et une corde [AB] d'un cercle de centre O forment un angle TAB aigu de ${a}°. Quelle est la mesure de l'angle au centre AOB (en degrés) ?`, answer: num(2 * a), hints: H("L'angle TAB est égal à un angle inscrit qui intercepte l'arc AB.", "mes TAB = ½ mes AOB.", `Double ${a}.`, "L'angle au centre est le double."), solution: `mes AOB = 2 × ${a}° = ${2 * a}°.` }; }
    if (t === 2) { const m = 10 * int(r, 4, 10); return { statement: `Depuis un point M extérieur à un cercle de centre O, on mène les tangentes (MA) et (MB), A et B étant sur le cercle. L'angle AMB mesure ${m}°. Quelle est la mesure de l'angle au centre AOB (en degrés) ?`, answer: num(180 - m), hints: H("Les tangentes (MA) et (MB) sont perpendiculaires aux rayons [OA] et [OB].", "Le quadrilatère OAMB a deux angles droits en A et en B.", "La somme des angles d'un quadrilatère convexe vaut 360°.", `360 − 90 − 90 − ${m}.`), solution: `Dans OAMB : mes AOB = 360° − 90° − 90° − ${m}° = ${180 - m}°.` }; }
    const x = 2 * int(r, 30, 80);
    return { statement: `[AB] est une corde d'un cercle de centre O ; l'angle au centre AOB mesure ${x}°. T′ est un point de l'autre demi-tangente en A (celle qui forme avec [AB] un angle obtus). Quelle est la mesure de T′AB (en degrés) ?`, answer: num(180 - x / 2), hints: H("Les deux demi-tangentes en A forment ensemble un angle plat.", "mes TAB = ½ mes AOB et mes T′AB = 180° − mes TAB.", `½ × ${x} = ${x / 2}.`, `180 − ${x / 2}.`), solution: `mes T′AB = 180° − ½ × ${x}° = ${180 - x / 2}°.` };
  }, FR),
  mk("ai-arcs", AI, 2, { skill: "Angles inscrits qui interceptent le même arc ; longueur d'un arc", ref: `${BOOK}, chap. 1 §1.3, propriétés 1 à 4 (p. 10) et ex. 2 et 10 (p. 23)`, kw: ["même arc", "arc de cercle", "longueur d'un arc", "bissectrice", "supplémentaires"] }, (_c, r) => {
    const t = int(r, 0, 3);
    if (t === 0) { const a = int(r, 25, 85); return { statement: `A et B sont deux points d'un cercle. M et M′ sont deux points du même arc AB. L'angle AMB mesure ${a}°. Quelle est la mesure de l'angle AM′B (en degrés) ?`, answer: num(a), hints: H("M et M′ sont du même côté de (AB).", "Deux angles inscrits qui interceptent le même arc ont même mesure.", "AMB et AM′B interceptent l'arc AB.", "Recopie la mesure."), solution: `Les angles AMB et AM′B interceptent le même arc : mes AM′B = ${a}°.` }; }
    if (t === 1) { const a = int(r, 30, 85); return { statement: `M est un point de l'arc AB et N un point de l'autre arc AB d'un même cercle. L'angle AMB mesure ${a}°. Quelle est la mesure de l'angle ANB (en degrés) ?`, answer: num(180 - a), hints: H("M et N sont de part et d'autre de (AB).", "Si M est sur l'arc AB et N sur l'arc complémentaire, AMB et ANB sont supplémentaires.", "Supplémentaires : la somme vaut 180°.", `180 − ${a}.`), solution: `mes ANB = 180° − ${a}° = ${180 - a}°.` }; }
    if (t === 2) { const R = int(r, 2, 12), a = int(r, 20, 85); const L = round(Math.PI * R * a / 90, 2); return { statement: `Un cercle a pour rayon ${R} cm. Un angle inscrit aigu AMB mesure ${a}°. Quelle est la longueur de l'arc AB intercepté (en cm, arrondie au centième) ?`, answer: num(L, 0.01), hints: H("L'arc intercepté correspond à l'angle au centre associé.", `L'angle au centre AOB mesure 2 × ${a} = ${2 * a}°.`, "La longueur d'un arc de x° vaut x/360 × 2πR.", `${2 * a}/360 × 2 × π × ${R}.`), solution: `AOB = ${2 * a}°, donc arc AB = ${2 * a}/360 × 2π × ${R} ≈ ${fr(L)} cm.` }; }
    const th = 2 * int(r, 15, 40);
    return { statement: `Un angle inscrit AMB aigu mesure ${th}°. La bissectrice de l'angle AMB recoupe le cercle de centre O en P. Quelle est la mesure de l'angle au centre AOP (en degrés) ?`, answer: num(th), hints: H("La bissectrice partage l'angle AMB en deux angles égaux.", `mes AMP = ${th}/2 = ${th / 2}°.`, "L'angle au centre associé à AMP est le double.", `2 × ${th / 2}.`), solution: `mes AMP = ${th / 2}°, donc mes AOP = 2 × ${th / 2}° = ${th}° (P partage l'arc AB en deux arcs égaux).` };
  }, FR),
  mk("ai-quad-calcul", AI, 2, { skill: "Quadrilatère inscriptible : angles opposés", ref: `${BOOK}, chap. 1 §3.2-3.3, théorèmes (p. 14-15) et ex. 14-16 (p. 24)`, kw: ["quadrilatère inscriptible", "angles opposés", "supplémentaires", "cocycliques", "quadrilatère croisé"] }, (_c, r) => {
    const t = int(r, 0, 3);
    if (t === 0) { const a = int(r, 50, 130); return { statement: `ABCD est un quadrilatère convexe inscrit dans un cercle. L'angle A mesure ${a}°. Quelle est la mesure de l'angle C (en degrés) ?`, answer: num(180 - a), hints: H("ABCD est convexe et inscrit.", "Ses angles opposés sont supplémentaires.", "A et C sont opposés.", `180 − ${a}.`), solution: `mes C = 180° − ${a}° = ${180 - a}°.` }; }
    if (t === 1) { const b = int(r, 55, 125); return { statement: `ABCD est un quadrilatère convexe inscrit dans un cercle. L'angle B mesure ${b}°. Quelle est la mesure de l'angle D (en degrés) ?`, answer: num(180 - b), hints: H("Quelle est la propriété d'un quadrilatère convexe inscriptible ?", "Les angles opposés sont supplémentaires.", "B et D sont opposés.", `180 − ${b}.`), solution: `mes D = 180° − ${b}° = ${180 - b}°.` }; }
    if (t === 2) { const a = int(r, 40, 110); return { statement: `ABCD est un quadrilatère croisé inscrit dans un cercle. L'angle A mesure ${a}°. Quelle est la mesure de l'angle C (en degrés) ?`, answer: num(a), hints: H("Le quadrilatère est croisé.", "Pour un quadrilatère croisé inscriptible, deux angles opposés ont même mesure.", "A et C sont opposés.", "Recopie la mesure de A."), solution: `Quadrilatère croisé inscrit : mes C = mes A = ${a}°.` }; }
    const x = int(r, 20, 45), p = int(r, 0, 20), q = 180 - 3 * x - p;
    return { statement: `Dans un quadrilatère convexe ABCD, mes A = ${lin(2, p, "x")}° et mes C = ${lin(1, q, "x")}°. Pour quelle valeur de x ce quadrilatère est-il inscriptible ?`, answer: num(x), hints: H("Un quadrilatère convexe est inscriptible si et seulement si deux angles opposés sont supplémentaires.", "Écris mes A + mes C = 180.", `(2x + ${p}) + (x + ${q}) = 180.`, "Résous l'équation."), solution: `3x + ${p + q} = 180, donc x = ${180 - p - q} ÷ 3 = ${x}.` };
  }, FR),
  mk("ai-quad-cours", AI, 2, { skill: "Quadrilatères inscriptibles : questions de cours", ref: `${BOOK}, chap. 1 §3, théorèmes et cas particuliers (p. 13-16) et ex. 3.a-3.b (p. 16)`, kw: ["inscriptible", "rectangle", "trapèze isocèle", "parallélogramme", "cocycliques", "croisé"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Un quadrilatère convexe est inscriptible si et seulement si…", good: "deux de ses angles opposés sont supplémentaires", bad: ["deux de ses angles opposés sont égaux", "ses quatre côtés sont égaux", "ses diagonales sont perpendiculaires"], why: "C'est le théorème de la page 15." },
      { q: "Un quadrilatère croisé est inscriptible si et seulement si…", good: "deux de ses angles opposés ont même mesure", bad: ["deux de ses angles opposés sont supplémentaires", "ses diagonales ont même longueur", "tous ses angles sont droits"], why: "C'est le théorème de la page 14 pour les quadrilatères croisés." },
      { q: "Parmi les parallélogrammes, lesquels sont inscriptibles ?", good: "Les rectangles (et donc les carrés)", bad: ["Les losanges", "Tous les parallélogrammes", "Aucun"], why: "Dans un parallélogramme les angles opposés sont égaux ; ils doivent aussi être supplémentaires, donc droits." },
      { q: "Un trapèze est inscriptible si et seulement si…", good: "il est isocèle", bad: ["il est rectangle", "ses bases ont même longueur", "ses diagonales sont perpendiculaires"], why: "Un trapèze inscriptible est isocèle, et réciproquement." },
      { q: "Un quadrilatère convexe qui a deux angles opposés droits est-il inscriptible ?", good: "Oui", bad: ["Non", "Seulement si c'est un carré", "Seulement s'il est croisé"], why: "Deux angles droits sont supplémentaires : c'est un cas particulier du théorème (p. 15)." },
      { q: "Des points qui appartiennent à un même cercle sont dits…", good: "cocycliques", bad: ["colinéaires", "coplanaires", "concourants"], why: "Le vocabulaire est donné page 14." },
      { q: "Par combien de cercles passent quatre sommets d'un quadrilatère inscriptible ?", good: "Un seul", bad: ["Deux", "Une infinité", "Aucun"], why: "Il n'existe qu'un cercle passant par trois points non alignés, donc le cercle est unique." },
      { q: "Quels losanges sont inscriptibles ?", good: "Les carrés", bad: ["Tous", "Aucun", "Ceux dont la grande diagonale vaut deux fois la petite"], why: "Un losange est un parallélogramme : il doit être un rectangle, donc un carré." },
    ];
    return qcmOf(r, pool, "Rappelle-toi les théorèmes sur les angles opposés.");
  }, QCM),
  mk("ai-arc-capable", AI, 3, { skill: "Arc capable d'un angle : rayon et distance au centre", ref: `${BOOK}, chap. 1 §2.2-2.3, propriété (p. 11-13) et ex. 10-11 (p. 23)`, kw: ["arc capable", "lieu géométrique", "angle θ", "rayon", "corde"] }, (_c, r) => {
    const c = int(r, 2, 12), th = pick(r, [30, 45, 60, 90, 120, 150]);
    const R = r2(c / (2 * sinD(th)));
    if (int(r, 0, 1) === 0) return { statement: `A et B sont deux points tels que AB = ${c} cm. Les points M tels que mes AMB = ${th}° décrivent deux arcs de cercle. Quel est le rayon de ces arcs (en cm, arrondi au centième) ?`, answer: num(R, 0.01), hints: H("Les points M sont sur un cercle passant par A et B.", "Dans le triangle AMB inscrit dans ce cercle : AB / sin AMB = 2R.", `R = AB / (2 sin ${th}°).`, `${c} ÷ (2 × ${fr(r2(sinD(th)))}).`), solution: `R = ${c} / (2 sin ${th}°) ≈ ${fr(R)} cm.` };
    const th2 = pick(r, [30, 45, 60]);
    const d = r2((c / 2) / Math.tan(rad(th2)));
    return { statement: `AB = ${c} cm. L'arc capable de l'angle ${th2}° d'extrémités A et B (arc qui contient les points M tels que mes AMB = ${th2}°) est porté par un cercle de centre O. Quelle est la distance de O à la droite (AB) (en cm, arrondie au centième) ?`, answer: num(d, 0.01), hints: H("L'angle au centre AOB vaut le double de l'angle inscrit.", `mes AOB = 2 × ${th2} = ${2 * th2}°.`, `Dans le triangle rectangle OIA (I milieu de [AB]) : tan(${th2}°) = IA / OI.`, `OI = ${c / 2} ÷ tan ${th2}°.`), solution: `OI = IA / tan ${th2}° = ${fr(c / 2)} / tan ${th2}° ≈ ${fr(d)} cm.` };
  }, FR),
  mk("ai-sinus-aire", AI, 2, { skill: "Sinus d'un angle quelconque et aire d'un triangle", ref: `${BOOK}, chap. 1 §4.1-4.2 (p. 17-18) et ex. 23 (p. 24)`, kw: ["sinus", "angle obtus", "aire d'un triangle", "1/2 bc sin A", "supplémentaire"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const b = int(r, 4, 14), c = int(r, 4, 14), A = pick(r, [30, 45, 60, 90, 120, 135, 150]); const S = r2(0.5 * b * c * sinD(A)); return { statement: `Dans un triangle ABC, AB = ${c} cm, AC = ${b} cm et mes BAC = ${A}°. Quelle est l'aire du triangle (en cm², arrondie au centième) ?`, answer: num(S, 0.01), hints: H("On connaît deux côtés et l'angle qu'ils forment.", "𝒜 = ½ × bc × sin A.", `½ × ${b} × ${c} × sin ${A}°.`, `sin ${A}° ≈ ${fr(r2(sinD(A)))}.`), solution: `𝒜 = ½ × ${b} × ${c} × sin ${A}° ≈ ${fr(S)} cm².` }; }
    if (t === 1) { const a = int(r, 20, 80); return { statement: `Un angle aigu mesure ${a}°. Quelle est la mesure de l'angle obtus qui a le même sinus ?`, answer: num(180 - a), hints: H("Le sinus d'un angle obtus est égal au sinus de son supplémentaire.", "Deux angles supplémentaires ont même sinus.", "Cherche l'angle obtus supplémentaire.", `180 − ${a}.`), solution: `sin(180° − ${a}°) = sin ${a}°, donc l'angle obtus vaut ${180 - a}°.` }; }
    const b = int(r, 4, 12), c = int(r, 4, 12), A = pick(r, [30, 45, 60, 90]); const S = 0.5 * b * c * sinD(A);
    return { statement: `Un triangle a pour aire ${fr(r2(S))} cm² (valeur arrondie au centième). Deux de ses côtés mesurent ${b} cm et ${c} cm et forment un angle qui n'est pas obtus. Quelle est la mesure de cet angle (en degrés, arrondie à l'unité) ?`, answer: num(A, 1), hints: H("L'aire est donnée par ½ bc sin A.", `sin A = 2𝒜 / (bc) = ${fr(r2(S))} × 2 / ${b * c}.`, "Utilise la fonction sin⁻¹ de la calculatrice.", "L'angle est aigu."), solution: `sin A = ${fr(r2(2 * S / (b * c)))}, donc A ≈ ${A}°.` };
  }, FR),
  mk("ai-theoreme-sinus", AI, 3, { skill: "Théorème des sinus : a / sin A = 2R", ref: `${BOOK}, chap. 1 §4.3, propriété (p. 18) et ex. 22, 24 (p. 24), ex. 4.b (p. 20)`, kw: ["théorème des sinus", "rayon du cercle circonscrit", "2R", "a/sin A", "périmètre"] }, (_c, r) => {
    const t = int(r, 0, 3);
    if (t === 0) { const a = int(r, 3, 14), A = pick(r, [30, 45, 60, 90, 120, 135, 150]); const R = r2(a / (2 * sinD(A))); return { statement: `Dans un triangle ABC, BC = ${a} cm et mes BAC = ${A}°. Quel est le rayon du cercle circonscrit (en cm, arrondi au centième) ?`, answer: num(R, 0.01), hints: H("On cherche le rayon du cercle circonscrit.", "Théorème des sinus : a / sin A = 2R.", `R = ${a} / (2 sin ${A}°).`, `sin ${A}° ≈ ${fr(r2(sinD(A)))}.`), solution: `R = ${a} / (2 sin ${A}°) ≈ ${fr(R)} cm.` }; }
    if (t === 1) { const R = int(r, 2, 10), A = pick(r, [30, 45, 60, 90, 120, 135, 150]); const a = r2(2 * R * sinD(A)); return { statement: `Un triangle ABC est inscrit dans un cercle de rayon ${R} cm. L'angle A mesure ${A}°. Quelle est la longueur du côté BC (en cm, arrondie au centième) ?`, answer: num(a, 0.01), hints: H("Théorème des sinus : a / sin A = 2R.", "a = 2R sin A.", `2 × ${R} × sin ${A}°.`, `sin ${A}° ≈ ${fr(r2(sinD(A)))}.`), solution: `BC = 2 × ${R} × sin ${A}° ≈ ${fr(a)} cm.` }; }
    if (t === 2) { const a = int(r, 4, 14), A = pick(r, [30, 45, 60, 90]), B = pick(r, [30, 45, 60, 75].filter((x) => x + A < 170)); const b = r2(a * sinD(B) / sinD(A)); return { statement: `Dans un triangle ABC, BC = ${a} cm, mes A = ${A}° et mes B = ${B}°. Quelle est la longueur de AC (en cm, arrondie au centième) ?`, answer: num(b, 0.01), hints: H("On connaît un côté et son angle opposé, puis un autre angle.", "a / sin A = b / sin B.", `b = a × sin B / sin A = ${a} × sin ${B}° / sin ${A}°.`, "Calcule avec la calculatrice."), solution: `AC = ${a} × sin ${B}° / sin ${A}° ≈ ${fr(b)} cm.` }; }
    const a = int(r, 3, 12), be = pick(r, [30, 40, 50, 65, 70, 75]); const A = 180 - 2 * be; const R = a / (2 * sinD(A)); const per = r2(a + 4 * R * sinD(be));
    return { statement: `Un triangle ABC est tel que BC = ${a} cm et mes ABC = mes ACB = ${be}°. Quel est son périmètre (en cm, arrondi au centième) ?`, answer: num(per, 0.02), hints: H("Les angles B et C sont égaux : le triangle est isocèle en A.", `mes A = 180 − 2 × ${be} = ${A}°.`, "R = a / (2 sin A) puis AB = 2R sin C.", "Périmètre = BC + 2 AB."), solution: `A = ${A}° ; R = ${a} / (2 sin ${A}°) ≈ ${fr(r2(R))} ; AB = AC = 2R sin ${be}° ; périmètre ≈ ${fr(per)} cm.` };
  }, FR),
  mk("ai-poly-angle", AI, 1, { skill: "Polygone régulier : angle au centre et angle d'un sommet", ref: `${BOOK}, chap. 1 §5.1-5.3 (p. 20-22) et ex. 30 (p. 24)`, kw: ["polygone régulier", "angle au centre", "360/n", "hexagone", "pentagone"] }, (_c, r) => {
    const n = pick(r, [3, 4, 5, 6, 8, 9, 10, 12]);
    const names: Record<number, string> = { 3: "triangle équilatéral", 4: "carré", 5: "pentagone régulier", 6: "hexagone régulier", 8: "octogone régulier", 9: "ennéagone régulier", 10: "décagone régulier", 12: "dodécagone régulier" };
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Un ${names[n]} est inscrit dans un cercle de centre O. Quelle est la mesure de l'angle au centre AOB formé par deux sommets consécutifs (en degrés) ?`, answer: num(360 / n), hints: H("Les n sommets partagent le tour complet en angles égaux.", "Un tour complet vaut 360°.", `Divise 360 par ${n}.`, "C'est l'angle au centre."), solution: `mes AOB = 360° / ${n} = ${fr(360 / n)}°.` };
    if (t === 1) return { statement: `Un ${names[n]} ABC… est inscrit dans un cercle de centre O. I est le milieu de [AB]. Quelle est la mesure de l'angle AOI (en degrés) ?`, answer: num(180 / n), hints: H("Le triangle AOB est isocèle en O.", `mes AOB = 360 / ${n}.`, "(OI) est la médiatrice de [AB] : elle coupe l'angle AOB en deux.", `AOI = 180 / ${n}.`), solution: `mes AOB = ${fr(360 / n)}°, donc mes AOI = ${fr(180 / n)}°.` };
    return { statement: `Quelle est la mesure de chaque angle intérieur d'un ${names[n]} (en degrés) ?`, answer: num(180 - 360 / n), hints: H("Le triangle AOB est isocèle en O.", `mes AOB = 360 / ${n}.`, "Dans AOB, les deux angles à la base sont égaux.", "Chaque angle du polygone est le double d'un angle à la base."), solution: `Angle intérieur = 180° − ${fr(360 / n)}° = ${fr(180 - 360 / n)}°.` };
  }, FR),
  mk("ai-poly-calcul", AI, 3, { skill: "Polygone régulier : côté, apothème, aire, couronne", ref: `${BOOK}, chap. 1 §5.3 (p. 21-22) et ex. 5.b-5.c (p. 22) et ex. 27-31 (p. 24)`, kw: ["apothème", "côté", "aire", "polygone régulier", "couronne", "hexagone", "rayon du cercle circonscrit"] }, (_c, r) => {
    const n = pick(r, [3, 4, 5, 6, 8, 10, 12]), R = int(r, 2, 10);
    const w: Record<number, string> = { 3: "triangle équilatéral", 4: "carré", 5: "pentagone régulier", 6: "hexagone régulier", 8: "octogone régulier", 10: "décagone régulier", 12: "dodécagone régulier" };
    const half = 180 / n, a = 2 * R * sinD(half), h = R * cosD(half), S = (n / 2) * R * R * sinD(360 / n);
    const t = int(r, 0, 4);
    if (t === 0) return { statement: `Un ${w[n]} est inscrit dans un cercle de rayon ${R} cm. Quelle est la longueur de son côté (en cm, arrondie au centième) ?`, answer: num(r2(a), 0.01), hints: H("Le triangle AOB est isocèle en O, d'angle au sommet 360/n.", "Avec le milieu I de [AB] : AI = R sin(180/n).", `AB = 2R sin(${fr(half)}°).`, "Calcule."), solution: `AB = 2 × ${R} × sin ${fr(half)}° ≈ ${fr(r2(a))} cm.` };
    if (t === 1) return { statement: `Un ${w[n]} est inscrit dans un cercle de rayon ${R} cm. Quel est son apothème (en cm, arrondi au centième) ?`, answer: num(r2(h), 0.01), hints: H("L'apothème est la distance du centre à un côté.", "Dans le triangle rectangle OIA : OI = R cos(180/n).", `OI = ${R} × cos ${fr(half)}°.`, "Calcule."), solution: `h = ${R} × cos ${fr(half)}° ≈ ${fr(r2(h))} cm.` };
    if (t === 2) return { statement: `Un ${w[n]} est inscrit dans un cercle de rayon ${R} cm. Quelle est son aire (en cm², arrondie au centième) ?`, answer: num(r2(S), 0.02), hints: H("Le polygone se découpe en n triangles isocèles de sommet O.", "Aire d'un triangle AOB = ½ R² sin(360/n).", `Multiplie par ${n}.`, "Calcule."), solution: `𝒜 = ${n} × ½ × ${R}² × sin ${fr(360 / n)}° ≈ ${fr(r2(S))} cm².` };
    if (t === 3) { const cour = Math.PI * R * R * sinD(half) ** 2; return { statement: `Un ${w[n]} est inscrit dans un cercle de rayon ${R} cm. Quelle est l'aire de la couronne comprise entre le cercle circonscrit et le cercle inscrit (en cm², arrondie au centième) ?`, answer: num(r2(cour), 0.02), hints: H("Le cercle inscrit a pour rayon l'apothème h.", "Aire de la couronne = πR² − πh².", `R = ${R}, h = ${R} cos ${fr(half)}°.`, "Calcule."), solution: `π(R² − h²) = π × ${R}² × sin² ${fr(half)}° ≈ ${fr(r2(cour))} cm².` }; }
    const side = r2(a);
    return { statement: `Un ${w[n]} a pour côté ${fr(side)} cm. Quel est le rayon du cercle circonscrit (en cm, arrondi au centième) ?`, answer: num(R, 0.02), hints: H("Le côté vaut a = 2R sin(180/n).", `R = a / (2 sin ${fr(half)}°).`, `${fr(side)} / (2 × ${fr(r2(sinD(half)))}).`, "Calcule."), solution: `R = ${fr(side)} / (2 sin ${fr(half)}°) ≈ ${R} cm.` };
  }, FR),

  // ===== Chapitre 6 : Homothétie =====
  mk("ho-coordonnees", HO, 2, { skill: "Image d'un point par une homothétie (coordonnées)", ref: `${BOOK}, chap. 6 §1.1 (p. 98) et ex. 9 (p. 113)`, kw: ["homothétie", "image d'un point", "coordonnées", "OM' = k OM", "rapport"] }, (_c, r) => {
    const k = pick(r, [2, 3, -2, -3, 4, 0.5, -0.5, -1, 5]);
    const cx = int(r, -4, 4), cy = int(r, -4, 4);
    const q = Math.abs(k) === 0.5 ? 2 : 1;
    const dx = q * int(r, -4, 4), dy = q * int(r, -4, 4);
    const x = cx + dx, y = cy + dy;
    const xi = cx + k * dx, yi = cy + k * dy;
    const absc = int(r, 0, 1) === 0;
    const centre = cx === 0 && cy === 0 ? "O" : `Ω(${n2(cx)} ; ${n2(cy)})`;
    return { statement: `Dans un repère, h est l'homothétie de centre ${centre} et de rapport ${n2(k)}. M a pour coordonnées (${n2(x)} ; ${n2(y)}). Quelle est ${absc ? "l'abscisse" : "l'ordonnée"} de M′ = h(M) ?`, answer: num(absc ? xi : yi), hints: H("M′ vérifie ΩM′ = k ΩM (vecteurs).", "Les coordonnées du vecteur ΩM′ sont k fois celles de ΩM.", `ΩM a pour coordonnées (${n2(dx)} ; ${n2(dy)}).`, `${absc ? "x′" : "y′"} = ${absc ? cx : cy} + ${par(k)} × ${par(absc ? dx : dy)}.`), solution: `ΩM (${n2(dx)} ; ${n2(dy)}), donc ΩM′ (${n2(k * dx)} ; ${n2(k * dy)}) et M′ (${n2(xi)} ; ${n2(yi)}).` };
  }, FR),
  mk("ho-rapport", HO, 2, { skill: "Rapport d'une homothétie (points alignés, relation vectorielle)", ref: `${BOOK}, chap. 6 §1.1 et §3.1 (p. 98, 105) et ex. 1-5 (p. 100, 113)`, kw: ["rapport", "homothétie", "centre", "relation vectorielle", "OM' = k OM", "alignés"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const k = pick(r, [2, 3, -2, -3, 4, -1, 0.5, -0.5]); const c = int(r, -5, 5), d = (Math.abs(k) === 0.5 ? 2 : 1) * (int(r, 1, 4)) * rnd(r), a = c + d, a2 = c + k * d; return { statement: `Sur une droite graduée, O a pour abscisse ${n2(c)}, A a pour abscisse ${n2(a)} et A′ a pour abscisse ${n2(a2)}. A′ est l'image de A par l'homothétie de centre O. Quel est son rapport ?`, answer: num(k), hints: H("OA′ = k OA (vecteurs).", `OA = ${n2(a - c)} et OA′ = ${n2(a2 - c)}.`, "k = OA′ / OA (mesures algébriques).", "Divise."), solution: `k = (${n2(a2)} − ${par(c)}) / (${n2(a)} − ${par(c)}) = ${n2(a2 - c)} / ${n2(a - c)} = ${n2(k)}.` }; }
    if (t === 1) { const m = int(r, 2, 6) * rnd(r), form = int(r, 0, 1); if (form === 0) return { statement: `A, B et C sont trois points distincts tels que AC + ${m < 0 ? "(" + n2(m) + ")" : n2(m)} AB = 0 (vecteurs). Quel est le rapport de l'homothétie de centre A qui transforme B en C ?`, answer: num(-m), hints: H("L'homothétie de centre A et de rapport k envoie B en C si AC = k AB.", `AC = −${par(m)} AB.`, "Isole AC dans la relation.", "Lis le coefficient de AB."), solution: `AC = ${n2(-m)} AB, donc k = ${n2(-m)}.` }; return { statement: `A, B et C sont trois points distincts tels que BC = ${n2(m)} BA (vecteurs). Quel est le rapport de l'homothétie de centre B qui transforme A en C ?`, answer: num(m), hints: H("L'homothétie de centre B et de rapport k envoie A en C si BC = k BA.", "Compare avec la relation donnée.", "Le coefficient de BA est le rapport.", "Recopie-le."), solution: `BC = ${n2(m)} BA, donc k = ${n2(m)}.` }; }
    const k = pick(r, [2, 3, -2, -3, 4, 5, 0.5, -0.5]); const c = int(r, -5, 5), d = (Math.abs(k) === 0.5 ? 2 : 1) * int(r, 1, 4) * rnd(r), a = c + d;
    return { statement: `Sur une droite graduée, O a pour abscisse ${n2(c)} et A a pour abscisse ${n2(a)}. Quelle est l'abscisse de l'image A′ de A par l'homothétie de centre O et de rapport ${n2(k)} ?`, answer: num(c + k * d), hints: H("OA′ = k OA (vecteurs).", `OA = ${n2(d)}.`, `OA′ = ${par(k)} × ${par(d)}.`, "Ajoute l'abscisse de O."), solution: `OA′ = ${n2(k * d)}, donc l'abscisse de A′ est ${n2(c)} + ${par(k * d)} = ${n2(c + k * d)}.` };
  }, FR),
  mk("ho-centre", HO, 3, { skill: "Déterminer le centre d'une homothétie (A, A′ et k donnés)", ref: `${BOOK}, chap. 6 §3.1, propriété (p. 106) et ex. 4-5, 7 (p. 113) et ex. 3.a (p. 108)`, kw: ["centre d'une homothétie", "AO = 1/(1−k) AA'", "rapport", "points alignés"] }, (_c, r) => {
    const k = pick(r, [2, 3, -2, -3, 4, 0.5, -1, -0.5]);
    const o = int(r, -6, 6), d = (Math.abs(k) === 0.5 ? 2 : 1) * int(r, 1, 5) * rnd(r), a = o + d, a2 = o + k * d;
    return { statement: `Sur une droite graduée, A a pour abscisse ${n2(a)} et son image A′ par une homothétie de rapport ${n2(k)} a pour abscisse ${n2(a2)}. Quelle est l'abscisse du centre O de l'homothétie ?`, answer: num(o), hints: H("O est le centre : OA′ = k OA.", "Traduis avec les abscisses : (a′ − o) = k (a − o).", `${n2(a2)} − o = ${par(k)} × (${n2(a)} − o).`, "Résous l'équation en o."), solution: `a′ − o = k(a − o) ⇒ o = (a′ − k a)/(1 − k) = (${n2(a2)} − ${par(k * a)}) / ${n2(1 - k)} = ${n2(o)}.` };
  }, FR),
  mk("ho-longueur-aire", HO, 2, { skill: "Longueurs, rayons et aires par une homothétie", ref: `${BOOK}, chap. 6 §2.2, « Longueurs et aires » (p. 103) et ex. 2.c (p. 104)`, kw: ["homothétie", "rapport", "longueur", "aire", "k²", "cercle", "rayon"] }, (_c, r) => {
    const k = pick(r, [2, 3, -2, -3, 0.5, 1.5, -0.5, 4, 2.5]);
    const t = int(r, 0, 3);
    if (t === 0) { const l = int(r, 2, 15); return { statement: `Un segment mesure ${l} cm. Quelle est la longueur de son image par une homothétie de rapport ${n2(k)} (en cm) ?`, answer: num(round(Math.abs(k) * l, 4)), hints: H("Une homothétie multiplie les longueurs par |k|.", "L'image d'un segment de longueur l a pour longueur |k| l.", `|${n2(k)}| = ${fr(Math.abs(k))}.`, `${fr(Math.abs(k))} × ${l}.`), solution: `${fr(Math.abs(k))} × ${l} = ${fr(round(Math.abs(k) * l, 4))} cm.` }; }
    if (t === 1) { const S = int(r, 2, 20); return { statement: `Une figure a pour aire ${S} cm². Quelle est l'aire de son image par une homothétie de rapport ${n2(k)} (en cm²) ?`, answer: num(round(k * k * S, 4)), hints: H("Les aires sont multipliées par k².", `k² = ${fr(k * k)}.`, `${fr(k * k)} × ${S}.`, "Calcule."), solution: `k² = ${fr(k * k)}, donc l'aire de l'image vaut ${fr(k * k)} × ${S} = ${fr(round(k * k * S, 4))} cm².` }; }
    if (t === 2) { const rr = int(r, 2, 9); return { statement: `Un cercle a pour rayon ${rr} cm. Quel est le rayon de son image par une homothétie de rapport ${n2(k)} (en cm) ?`, answer: num(round(Math.abs(k) * rr, 4)), hints: H("L'image d'un cercle de centre I et de rayon r est un cercle de centre I′.", "Son rayon est |k| r.", `|${n2(k)}| × ${rr}.`, "Calcule."), solution: `Rayon = |${n2(k)}| × ${rr} = ${fr(round(Math.abs(k) * rr, 4))} cm.` }; }
    const k2 = pick(r, [2, 3, 4, 5]); const S = int(r, 2, 12);
    return { statement: `Une homothétie transforme une figure en une figure d'aire ${k2 * k2 * S} cm². L'aire de la figure initiale est ${S} cm². Quelle est la valeur positive du rapport de l'homothétie ?`, answer: num(k2), hints: H("𝒜′ = k² 𝒜.", `k² = ${k2 * k2 * S} / ${S}.`, "Prends la racine carrée.", "On cherche la valeur positive."), solution: `k² = ${k2 * k2 * S} / ${S} = ${k2 * k2}, donc k = ${k2} (ou −${k2}).` };
  }, FR),
  mk("ho-reciproque", HO, 1, { skill: "Homothétie réciproque : rapport 1/k", ref: `${BOOK}, chap. 6 §1.2, propriété 3 (p. 99) et ex. 1.b (p. 100)`, kw: ["réciproque", "1/k", "transformation réciproque", "homothétie"] }, (_c, r) => {
    const k = pick(r, [2, 4, 5, -2, -4, -5, 0.5, 0.25, -0.5, 10, -10, 8]);
    return { statement: `h est l'homothétie de centre O et de rapport ${n2(k)}. Quel est le rapport de sa transformation réciproque h⁻¹ ?`, answer: num(round(1 / k, 6)), hints: H("h⁻¹ est aussi une homothétie de centre O.", "Le rapport de h⁻¹ est l'inverse de celui de h.", `1 / ${par(k)}.`, "Calcule."), solution: `h⁻¹ est l'homothétie de centre O et de rapport 1/${par(k)} = ${n2(round(1 / k, 6))}.` };
  }, FR),
  mk("ho-analytique", HO, 3, { skill: "Reconnaître une homothétie par son expression analytique", ref: `${BOOK}, chap. 6, ex. 10-12 (p. 113)`, kw: ["homothétie", "expression analytique", "centre", "rapport", "(x ; y)", "point invariant"] }, (_c, r) => {
    const a = pick(r, [2, 3, -2, -3, 4, -1, 5]);
    const p = int(r, -4, 4), q = int(r, -4, 4);
    const b = (1 - a) * p, c = (1 - a) * q;
    const t = int(r, 0, 2);
    const ask = t === 0 ? "Quel est le rapport k" : t === 1 ? "Quelle est l'abscisse du centre" : "Quelle est l'ordonnée du centre";
    const val = t === 0 ? a : t === 1 ? p : q;
    return { statement: `Dans un repère, f associe à tout point M(x ; y) le point M′(${lin(a, b, "x")} ; ${lin(a, c, "y")}). C'est une homothétie. ${ask} ?`, answer: num(val), hints: H("Une homothétie de rapport k ≠ 1 a un seul point invariant : son centre.", "Cherche le point tel que x′ = x et y′ = y.", `${lin(a, b, "x")} = x donne x = ${b} / ${1 - a}.`, "Le rapport est le coefficient de x et de y."), solution: `Rapport : ${n2(a)}. Point invariant : x = ${n2(b)} / ${n2(1 - a)} = ${n2(p)} et y = ${n2(c)} / ${n2(1 - a)} = ${n2(q)}. Le centre est (${n2(p)} ; ${n2(q)}).` };
  }, FR),
  mk("ho-cours", HO, 2, { skill: "Propriétés de l'homothétie : conservation et point invariant", ref: `${BOOK}, chap. 6 §1.2 et §2 (p. 98-103) et ex. 2.a-2.d (p. 104)`, kw: ["homothétie", "point invariant", "conserve", "alignement", "parallélisme", "angles orientés", "milieu"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quel est le seul point invariant d'une homothétie de rapport différent de 1 ?", good: "Son centre", bad: ["Aucun point", "Tous les points", "Le milieu de deux points quelconques"], why: "Propriété 2 (p. 99) : M = h(M) ⇔ OM = 0, donc M = O." },
      { q: "Une homothétie de rapport −1 est…", good: "la symétrie centrale de même centre", bad: ["une symétrie orthogonale", "une translation", "l'identité"], why: "Si k = −1, OM′ = −OM : c'est la symétrie de centre O (p. 98)." },
      { q: "Une homothétie de rapport 1 est…", good: "l'application identité", bad: ["la symétrie centrale", "une translation", "une rotation"], why: "Si k = 1, chaque point est son propre image (p. 98)." },
      { q: "Par une homothétie, l'image d'une droite (AB) est…", good: "une droite parallèle à (AB)", bad: ["une droite perpendiculaire à (AB)", "un cercle", "un point"], why: "Propriété (1) p. 101 : l'image de (AB) est (A′B′), parallèle à (AB)." },
      { q: "Quelle propriété n'est PAS conservée par toute homothétie ?", good: "Les distances", bad: ["L'alignement", "Le parallélisme", "Les angles orientés"], why: "Les longueurs sont multipliées par |k| : l'homothétie n'est pas, en général, une isométrie (p. 111)." },
      { q: "Par une homothétie, l'image du milieu d'un segment est…", good: "le milieu du segment image", bad: ["le centre de l'homothétie", "le symétrique du centre", "un point quelconque"], why: "Toute homothétie conserve le milieu (p. 102)." },
      { q: "Par une homothétie, deux droites perpendiculaires ont pour images…", good: "deux droites perpendiculaires", bad: ["deux droites parallèles", "deux droites sécantes quelconques", "deux droites confondues"], why: "Toute homothétie conserve l'orthogonalité (p. 102)." },
      { q: "Un triangle et son image par une homothétie sont…", good: "semblables", bad: ["isométriques", "symétriques", "toujours confondus"], why: "L'homothétie conserve les angles ; les longueurs sont proportionnelles (p. 103)." },
      { q: "Pour un point M, son image M′ par une homothétie de centre O et le point O sont…", good: "alignés", bad: ["toujours à même distance de O", "toujours perpendiculaires", "toujours confondus"], why: "Propriété 1 (p. 98) : OM′ = k OM, donc O, M, M′ sont alignés." },
    ];
    return qcmOf(r, pool, "Relie à OM′ = k OM.");
  }, QCM),

  // ===== Chapitre 6 : Rotation =====
  mk("ro-definition", RO, 1, { skill: "Définition de la rotation : cas particuliers", ref: `${BOOK}, chap. 6 §4.1-4.2 (p. 108-109) et ex. 13-14 (p. 113)`, kw: ["rotation", "quart de tour", "symétrie centrale", "angle", "centre", "point invariant"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle rotation de centre O est la symétrie centrale de centre O ?", good: "La rotation d'angle π", bad: ["La rotation d'angle π/2", "La rotation d'angle 0", "La rotation d'angle −π/2"], why: "Si α = π, M′ est le symétrique de M par rapport à O (p. 109)." },
      { q: "Quelle rotation de centre O est l'application identité ?", good: "La rotation d'angle 0", bad: ["La rotation d'angle π", "La rotation d'angle π/2", "Aucune"], why: "Si α = 0, tout point M est son image (p. 109)." },
      { q: "Quelle est la rotation de centre O et d'angle π/2 ?", good: "Le quart de tour direct", bad: ["Le quart de tour indirect", "La symétrie centrale", "Le demi-tour"], why: "α = π/2 : quart de tour direct ; α = −π/2 : quart de tour indirect (p. 109)." },
      { q: "Quelle est la rotation de centre O et d'angle −π/2 ?", good: "Le quart de tour indirect", bad: ["Le quart de tour direct", "La symétrie centrale", "L'identité"], why: "α = −π/2 est le quart de tour indirect (p. 109)." },
      { q: "Quel est le seul point invariant d'une rotation d'angle non nul ?", good: "Son centre", bad: ["Aucun point", "Le milieu du segment [MM′]", "Tous les points"], why: "Propriété 1 (p. 109) : le seul point invariant est le centre." },
      { q: "Quelle est la transformation réciproque de la rotation de centre O et d'angle α ?", good: "La rotation de centre O et d'angle −α", bad: ["La rotation de centre O et d'angle α", "L'homothétie de centre O et de rapport −1", "La symétrie centrale"], why: "Propriété 2 (p. 109) : la réciproque de r(O, α) est r(O, −α)." },
      { q: "Si M′ est l'image de M ≠ O par la rotation de centre O et d'angle α, que vaut OM′ ?", good: "OM", bad: ["2 OM", "OM × α", "OM / 2"], why: "Par définition OM′ = OM : la rotation conserve la distance au centre." },
    ];
    return qcmOf(r, pool, "Reviens à la définition : OM′ = OM et (OM, OM′) = α.");
  }, QCM),
  mk("ro-coordonnees", RO, 2, { skill: "Image d'un point par une rotation d'angle π/2, −π/2 ou π (coordonnées)", ref: `${BOOK}, chap. 6 §4.1, exemples (p. 109) et ex. 13-14, 26 (p. 113-114)`, kw: ["rotation", "quart de tour", "coordonnées", "image d'un point", "centre"] }, (_c, r) => {
    const ang = pick(r, [90, -90, 180]);
    const cx = int(r, -3, 3), cy = int(r, -3, 3), dx = int(r, -5, 5), dy = int(r, -5, 5);
    const [ex, ey] = ang === 90 ? [-dy, dx] : ang === -90 ? [dy, -dx] : [-dx, -dy];
    const centre = cx === 0 && cy === 0 ? "O" : `Ω(${n2(cx)} ; ${n2(cy)})`;
    const label = ang === 90 ? "du quart de tour direct (angle π/2)" : ang === -90 ? "du quart de tour indirect (angle −π/2)" : "de la rotation d'angle π (demi-tour)";
    const absc = int(r, 0, 1) === 0;
    return { statement: `Le plan est muni d'un repère orthonormé direct. r est la rotation de centre ${centre} ${label}. M a pour coordonnées (${n2(cx + dx)} ; ${n2(cy + dy)}). Quelle est ${absc ? "l'abscisse" : "l'ordonnée"} de r(M) ?`, answer: num(absc ? cx + ex : cy + ey), hints: H("On travaille avec le vecteur ΩM, de coordonnées (x ; y) dans le repère centré en Ω.", "Quart de tour direct : (x ; y) → (−y ; x). Quart de tour indirect : (x ; y) → (y ; −x). Demi-tour : (−x ; −y).", `ΩM a pour coordonnées (${n2(dx)} ; ${n2(dy)}).`, "Ajoute ensuite les coordonnées de Ω."), solution: `ΩM (${n2(dx)} ; ${n2(dy)}) devient ΩM′ (${n2(ex)} ; ${n2(ey)}), donc r(M) = (${n2(cx + ex)} ; ${n2(cy + ey)}).` };
  }, FR),
  mk("ro-polygone", RO, 2, { skill: "Rotation et polygone régulier : angle entre deux sommets", ref: `${BOOK}, chap. 6 §4.3 (p. 110) et ex. 4.d (p. 112) et ex. 17, 22 (p. 114)`, kw: ["rotation", "polygone régulier", "sommets", "angle de la rotation", "hexagone", "centre"] }, (_c, r) => {
    const n = pick(r, [5, 6, 8, 9, 10, 12]);
    const letters = "ABCDEFGHIJKL".split("");
    const i = int(r, 0, n - 1), step = int(r, 1, n - 1), j = (i + step) % n;
    const name: Record<number, string> = { 5: "pentagone", 6: "hexagone", 8: "octogone", 9: "ennéagone", 10: "décagone", 12: "dodécagone" };
    const ang = (360 / n) * step;
    if (int(r, 0, 1) === 0) return { statement: `${letters.slice(0, n).join("")} est un ${name[n]} régulier de centre O, dont les sommets sont rangés dans le sens direct. Quelle est la mesure (en degrés, entre 0 et 360) de la rotation de centre O, dans le sens direct, qui transforme ${letters[i]} en ${letters[j]} ?`, answer: num(ang), hints: H("Les sommets consécutifs sont séparés par un angle au centre constant.", `Cet angle vaut 360 / ${n}.`, `De ${letters[i]} à ${letters[j]} dans le sens direct, il y a ${step} « pas ».`, `${step} × ${fr(360 / n)}.`), solution: `360 / ${n} = ${fr(360 / n)}° par pas ; ${step} pas : ${step} × ${fr(360 / n)} = ${fr(ang)}°.` };
    const idx = letters.slice(0, n);
    const opts = withWrong(letters[j], [letters[(j + 1) % n], letters[(j + n - 1) % n], letters[(i + 2 * step) % n], letters[(i + n - step) % n]]);
    const options = [letters[j], ...opts].slice(0, 4);
    void idx;
    return { statement: `${letters.slice(0, n).join("")} est un ${name[n]} régulier de centre O, de sens direct. On note r la rotation de centre O et d'angle ${fr(ang)}° (sens direct). Quelle est l'image de ${letters[i]} par r ?`, answer: choice(r, options, 0), hints: H("Un pas entre deux sommets consécutifs vaut 360 / n.", `Ici : ${fr(360 / n)}°.`, `${fr(ang)} / ${fr(360 / n)} = ${step} pas.`, `Compte ${step} sommets à partir de ${letters[i]} dans le sens direct.`), solution: `${fr(ang)} / ${fr(360 / n)} = ${step} pas dans le sens direct : l'image de ${letters[i]} est ${letters[j]}.` };
  }, QCM),
  mk("ro-composee", RO, 3, { skill: "Composée de deux symétries orthogonales d'axes sécants : rotation d'angle double", ref: `${BOOK}, chap. 6 §4.3-4.4 (p. 109-110) et ex. 20, 22-23 (p. 114)`, kw: ["rotation", "symétries orthogonales", "axes sécants", "composée", "angle double", "hexagone"] }, (_c, r) => {
    const th = pick(r, [15, 20, 30, 36, 40, 45, 50, 60, 75, 80]) * rnd(r);
    const dir = th > 0;
    return { statement: `(D) et (D′) sont deux droites sécantes en O ; l'angle orienté (D, D′) mesure ${n2(th)}°. On applique la symétrie d'axe (D) puis la symétrie d'axe (D′). Le résultat est une rotation de centre O : quelle est la mesure principale de son angle (en degrés, entre −180 et 180) ?`, answer: num(principal(2 * th)), hints: H("« S(D) suivie de S(D′) » est une rotation de centre O.", "Son angle est le double de l'angle orienté (D, D′).", `2 × ${par(th)}.`, "Ramène le résultat dans l'intervalle ]−180 ; 180]."), solution: `Angle = 2 × ${par(th)}° = ${n2(2 * th)}°, soit ${n2(principal(2 * th))}° en mesure principale${dir ? "" : " (sens indirect)"}.` };
  }, FR),
  mk("ro-distance", RO, 3, { skill: "Rotation : conservation des longueurs et corde AA′", ref: `${BOOK}, chap. 6 §4.4, propriété fondamentale (p. 110-111) et ex. 17-18 (p. 114)`, kw: ["rotation", "isométrie", "conserve les distances", "A'B' = AB", "triangle isocèle", "angle"] }, (_c, r) => {
    if (int(r, 0, 1) === 0) { const l = int(r, 3, 15), a = pick(r, [30, 45, 60, 90, 120, 150]); return { statement: `r est une rotation d'angle ${a}°. A′ et B′ sont les images de A et B, avec AB = ${l} cm. Quelle est la longueur A′B′ (en cm) ?`, answer: num(l), hints: H("Une rotation est une isométrie.", "Elle conserve les distances.", "A′B′ = AB.", "Recopie la longueur."), solution: `A′B′ = AB = ${l} cm.` }; }
    const rr = int(r, 2, 10), a = pick(r, [45, 60, 90, 120, 150, 180]); const d = r2(2 * rr * sinD(a / 2));
    return { statement: `r est la rotation de centre O et d'angle ${a}°. A est un point tel que OA = ${rr} cm et A′ = r(A). Quelle est la longueur AA′ (en cm, arrondie au centième) ?`, answer: num(d, 0.01), hints: H("OA′ = OA, et l'angle AOA′ vaut l'angle de la rotation.", "Le triangle OAA′ est isocèle en O.", "Avec le milieu I de [AA′] : AI = OA sin(α/2).", `AA′ = 2 × ${rr} × sin ${a / 2}°.`), solution: `AA′ = 2 × ${rr} × sin ${a / 2}° ≈ ${fr(d)} cm.` };
  }, FR),
  mk("ro-cours", RO, 2, { skill: "Propriétés de la rotation : conservation", ref: `${BOOK}, chap. 6 §4.4-4.5 (p. 110-111) et ex. 4.b (p. 112)`, kw: ["rotation", "isométrie", "conserve", "milieu", "angles orientés", "parallélisme", "image d'un cercle"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Qu'appelle-t-on une isométrie ?", good: "Une transformation du plan qui conserve les distances", bad: ["Une transformation qui conserve seulement les angles", "Une transformation qui multiplie les longueurs par k", "Une transformation qui fixe tous les points"], why: "Définition de la remarque p. 111." },
      { q: "Laquelle de ces transformations n'est en général PAS une isométrie ?", good: "L'homothétie", bad: ["La rotation", "La translation", "La symétrie orthogonale"], why: "L'homothétie de rapport k multiplie les longueurs par |k| (p. 111)." },
      { q: "L'image d'un cercle par une rotation est…", good: "un cercle de même rayon", bad: ["un cercle de rayon double", "une droite", "une ellipse"], why: "Propriété (4) p. 111 : un cercle est transformé en un cercle de même rayon." },
      { q: "Par une rotation, un angle orienté a pour image…", good: "un angle orienté égal", bad: ["son opposé", "son supplémentaire", "un angle nul"], why: "Propriété (2) p. 111 : la rotation conserve les angles orientés (alors que la symétrie orthogonale les change en leur opposé)." },
      { q: "Deux droites parallèles ont pour images par une rotation…", good: "deux droites parallèles", bad: ["deux droites perpendiculaires", "deux droites confondues", "deux droites sécantes"], why: "Propriété (3) p. 111." },
      { q: "L'image d'un rectangle par une rotation est…", good: "un rectangle", bad: ["un parallélogramme quelconque", "un trapèze", "un losange"], why: "Une rotation conserve parallélisme, orthogonalité et longueurs (ex. 4.b p. 112) ; l'image d'un carré est un carré." },
      { q: "Toute rotation se décompose sous la forme…", good: "« S(D) suivie de S(D′) » avec (D) et (D′) sécantes en O", bad: ["« une translation suivie d'une homothétie »", "« S(D) suivie de S(D′) » avec (D) // (D′)", "Aucune décomposition n'existe"], why: "Propriété de la page 110 : toute rotation de centre O est la composée de deux symétries orthogonales d'axes sécants en O." },
    ];
    return qcmOf(r, pool, "Une rotation est une isométrie.");
  }, QCM),

  // ===== Chapitre 7 : Géométrie de l'espace =====
  mk("es-position-droites", ES, 2, { skill: "Position relative de deux arêtes d'un solide", ref: `${BOOK}, chap. 7 §1.4, tableau (p. 120-121) et ex. 2.e (p. 129) et ex. 1 à 10 (p. 130-131)`, kw: ["droites coplanaires", "non coplanaires", "sécantes", "parallèles", "cube", "tétraèdre", "pyramide"] }, (_c, r) => {
    const s = pick(r, [CUBE, CUBE, TETRA, PYRA]);
    let e1 = pick(r, s.edges), e2 = pick(r, s.edges);
    while (sameLine(e1, e2)) e2 = pick(r, s.edges);
    const rel = relLines(s, e1, e2);
    return { statement: `${s.intro}, quelle est la position relative des droites ${nameE(e1)} et ${nameE(e2)} ?`, answer: choice(r, ["Parallèles", "Sécantes", "Non coplanaires"], REL.indexOf(rel)), hints: H("Deux droites de l'espace sont soit coplanaires, soit non coplanaires.", "Coplanaires : parallèles (ou confondues) ou sécantes. Non coplanaires : aucun plan ne les contient toutes les deux.", "Cherche s'il existe une face ou un plan qui contient les quatre points.", "Si elles ne se coupent pas et ne sont pas parallèles, elles ne sont pas coplanaires."), solution: `Les droites ${nameE(e1)} et ${nameE(e2)} sont ${rel === "Parallèles" ? "parallèles" : rel === "Sécantes" ? "sécantes (elles ont un point commun)" : "non coplanaires : elles ne sont ni parallèles ni sécantes"}.` };
  }, [{ id: "qcm", label: "Question de cours" }]),
  mk("es-compte-aretes", ES, 3, { skill: "Compter les arêtes parallèles, sécantes ou non coplanaires à une arête", ref: `${BOOK}, chap. 7 §1.4 (p. 120-121) et ex. 2.e (p. 129)`, kw: ["arêtes", "parallèles", "sécantes", "non coplanaires", "cube", "tétraèdre", "pyramide", "compter"] }, (_c, r) => {
    const s = pick(r, [CUBE, TETRA, PYRA]);
    const e = pick(r, s.edges);
    const rel = pick(r, REL);
    const cnt = s.edges.filter((x) => !sameLine(x, e) && relLines(s, e, x) === rel).length;
    return { statement: `${s.intro}, combien d'arêtes (autres que [${e[0]}${e[1]}]) portent une droite ${rel === "Parallèles" ? "parallèle à" : rel === "Sécantes" ? "sécante à" : "non coplanaire avec"} ${nameE(e)} ?`, answer: num(cnt), hints: H("Passe en revue les autres arêtes une par une.", "Une arête parallèle a la même direction ; une arête sécante a un point commun avec la droite.", "Les autres sont non coplanaires avec elle.", "Compte soigneusement."), solution: `On trouve ${cnt} arête${cnt > 1 ? "s" : ""}.` };
  }, FR),
  mk("es-droite-plan", ES, 2, { skill: "Position d'une arête et d'un plan défini par trois sommets", ref: `${BOOK}, chap. 7 §1.2 (p. 119) et §2.2 (p. 125) et ex. 2.d (p. 129)`, kw: ["droite et plan", "incluse", "parallèle", "sécante", "plan", "arête", "face"] }, (_c, r) => {
    const s = CUBE;
    const faces: [string, string, string][] = [["A", "B", "C"], ["E", "F", "G"], ["A", "B", "F"], ["D", "C", "G"], ["A", "D", "H"], ["B", "C", "G"], ["A", "C", "G"]];
    const pl = pick(r, faces), e = pick(r, s.edges);
    const P = s.pts[pl[0]], nrm = cross(sub(s.pts[pl[1]], P), sub(s.pts[pl[2]], P));
    const d = sub(s.pts[e[1]], s.pts[e[0]]);
    let rel: string;
    if (Math.abs(dot(d, nrm)) > 1e-9) rel = "Sécante au plan";
    else rel = Math.abs(dot(sub(s.pts[e[0]], P), nrm)) < 1e-9 ? "Incluse dans le plan" : "Parallèle au plan (disjointe)";
    return { statement: `${s.intro}, quelle est la position de la droite ${nameE(e)} par rapport au plan (${pl.join("")}) ?`, answer: choice(r, ["Incluse dans le plan", "Parallèle au plan (disjointe)", "Sécante au plan"], ["Incluse dans le plan", "Parallèle au plan (disjointe)", "Sécante au plan"].indexOf(rel)), hints: H("Une droite et un plan sont : la droite incluse, ou un seul point commun, ou disjoints.", "Regarde si les deux extrémités de l'arête sont dans le plan.", "Cherche dans le plan une droite parallèle à l'arête.", "Si une droite est parallèle à une droite du plan sans y être incluse, elle est parallèle au plan."), solution: `${rel}.` };
  }, [{ id: "qcm", label: "Question de cours" }]),
  mk("es-cours", ES, 2, { skill: "Axiomes, détermination d'un plan, parallélisme dans l'espace", ref: `${BOOK}, chap. 7 §1.1-1.4 (p. 118-122) et §2.1-2.3 (p. 124-127) et ex. 6, 9 (p. 130)`, kw: ["axiome", "plan", "trois points non alignés", "droites parallèles", "plans parallèles", "tétraèdre", "coplanaires"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Combien de plans passent par trois points non alignés de l'espace ?", good: "Un seul", bad: ["Deux", "Une infinité", "Aucun"], why: "Axiome A2 (p. 118)." },
      { q: "Combien de droites passent par deux points distincts de l'espace ?", good: "Une seule", bad: ["Deux", "Une infinité", "Aucune"], why: "Axiome A1 (p. 118)." },
      { q: "Si deux points distincts A et B appartiennent à un plan, alors…", good: "la droite (AB) est incluse dans ce plan", bad: ["la droite (AB) est perpendiculaire au plan", "la droite (AB) est sécante au plan en un seul point", "(AB) est parallèle au plan sans y être incluse"], why: "Axiome A3 (p. 118)." },
      { q: "Combien de sommets, non coplanaires, un tétraèdre possède-t-il ?", good: "4", bad: ["3", "5", "2"], why: "Un tétraèdre a quatre sommets non coplanaires (p. 120)." },
      { q: "Deux droites disjointes de l'espace sont-elles forcément parallèles ?", good: "Non, elles peuvent être non coplanaires", bad: ["Oui toujours", "Oui si elles sont perpendiculaires", "Non, elles sont toujours sécantes"], why: "Remarque p. 121 : des droites disjointes peuvent être non coplanaires." },
      { q: "Deux droites non coplanaires sont…", good: "disjointes", bad: ["sécantes", "parallèles", "confondues"], why: "Propriété p. 120." },
      { q: "Par un point donné de l'espace, combien de droites passent-elles parallèlement à une droite donnée ?", good: "Une seule", bad: ["Deux", "Aucune", "Une infinité"], why: "Propriété 1 (p. 124)." },
      { q: "Deux droites parallèles à une même troisième sont…", good: "parallèles entre elles", bad: ["perpendiculaires", "sécantes", "non coplanaires"], why: "Propriété 3 (p. 124)." },
      { q: "Quel ensemble de données détermine un unique plan ?", good: "Deux droites sécantes", bad: ["Deux droites non coplanaires", "Trois points alignés", "Une droite seule"], why: "Propriétés p. 122 : trois points non alignés, une droite et un point extérieur, deux droites sécantes, deux droites strictement parallèles." },
      { q: "Quel ensemble de données détermine un unique plan ?", good: "Une droite et un point extérieur à cette droite", bad: ["Une droite et un point de cette droite", "Deux points distincts", "Trois points alignés"], why: "Propriété (2) p. 122." },
      { q: "Deux plans non parallèles sont dits…", good: "sécants : leur intersection est une droite", bad: ["sécants : leur intersection est un point", "confondus", "disjoints"], why: "Définition p. 120." },
      { q: "Deux plans parallèles à un même troisième plan sont…", good: "parallèles entre eux", bad: ["sécants", "perpendiculaires", "confondus"], why: "Propriété 2 (p. 126)." },
      { q: "Une droite parallèle à deux plans sécants est…", good: "parallèle à leur droite d'intersection", bad: ["perpendiculaire à leur droite d'intersection", "sécante à leur droite d'intersection", "incluse dans l'un des plans"], why: "Propriété 3 (p. 125)." },
      { q: "Une droite est parallèle à un plan si et seulement si…", good: "ce plan contient une droite parallèle à cette droite", bad: ["elle est perpendiculaire au plan", "elle coupe le plan en un point", "ce plan la contient sans autre condition"], why: "Propriété 1 (p. 125)." },
      { q: "Par un point donné de l'espace, combien de plans passent-ils parallèlement à un plan donné ?", good: "Un seul", bad: ["Deux", "Aucun", "Une infinité"], why: "Propriété 3 (p. 126)." },
      { q: "Si deux droites coplanaires sont respectivement parallèles à deux droites non parallèles, alors elles sont…", good: "sécantes", bad: ["parallèles", "confondues", "non coplanaires"], why: "Conséquence p. 124." },
    ];
    return qcmOf(r, pool, "Rappelle-toi les axiomes et propriétés du cours.");
  }, QCM),
  mk("es-cavaliere", ES, 2, { skill: "Perspective cavalière : longueurs dessinées et coefficient de réduction", ref: `${BOOK}, chap. 7, ex. 1 à 5 (p. 130)`, kw: ["perspective cavalière", "coefficient de réduction", "fuyante", "angle de fuite", "cube", "vraie grandeur"] }, (_c, r) => {
    const t = int(r, 0, 2);
    const k = pick(r, [0.5, 1 / 3, 0.25, Math.SQRT1_2, 0.6]);
    const kk = k === 1 / 3 ? "1/3" : k === Math.SQRT1_2 ? "√2/2" : fr(k);
    const al = pick(r, [30, 45, 60]);
    if (t === 0) { const a = int(r, 3, 12); return { statement: `Un cube d'arête ${a} cm est représenté en perspective cavalière d'angle de fuite α = ${al}° et de coefficient de réduction k = ${kk}. Quelle est la longueur, sur le dessin, d'une arête fuyante (en cm, arrondie au centième) ?`, answer: num(r2(a * k), 0.01), hints: H("Les arêtes de face sont dessinées en vraie grandeur.", "Les arêtes fuyantes sont multipliées par le coefficient de réduction k.", `${a} × ${kk}.`, "L'angle α ne change pas la longueur dessinée."), solution: `Longueur dessinée = ${a} × ${kk} ≈ ${fr(r2(a * k))} cm.` }; }
    if (t === 1) { const a = int(r, 4, 12), kd = pick(r, [0.5, 0.25, 0.6, 0.75]); const d = r2(a * kd); return { statement: `Un segment fuyant de longueur réelle ${a} cm est dessiné en perspective cavalière avec une longueur de ${fr(d)} cm. Quel est le coefficient de réduction k ?`, answer: num(kd, 0.005), hints: H("Longueur dessinée = k × longueur réelle.", "k = longueur dessinée / longueur réelle.", `${fr(d)} / ${a}.`, "Calcule."), solution: `k = ${fr(d)} / ${a} = ${fr(kd)}.` }; }
    const c = pick(r, [4, 6, 8, 10]); const hh = (c * Math.sqrt(3)) / 2;
    return { statement: `Un triangle équilatéral de côté ${c} cm est dans un plan horizontal, un de ses côtés étant vu de face. Sa hauteur est dessinée en perspective cavalière avec k = ${kk}. Quelle est la longueur dessinée de cette hauteur (en cm, arrondie au centième) ?`, answer: num(r2(hh * k), 0.01), hints: H("La hauteur issue du sommet opposé au côté vu de face est une direction fuyante.", `Hauteur réelle = c√3/2 = ${fr(r2(hh))}.`, "On la multiplie par k.", "Calcule."), solution: `Hauteur réelle ≈ ${fr(r2(hh))} cm ; dessinée : ${fr(r2(hh))} × ${kk} ≈ ${fr(r2(hh * k))} cm.` };
  }, FR),
);
