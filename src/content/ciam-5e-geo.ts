// CIAM 5ème : activités géométriques (chap. 1 à 9 du manuel). Les tracés ne se corrigent pas automatiquement :
// on travaille ici les propriétés, les calculs de mesures et le vocabulaire qui s'appuient sur les figures du livre.
import { choice, fr, int, num, pick, register, round, Rng } from "./core";
import { ciam, dec, f, H, Item, QCM, qcmOf, shuffle, WHO } from "./ciam-kit";

const mk = ciam("5e", "ciam5");
const BOOK = "CIAM 5ème";
const who = (r: Rng) => pick(r, WHO);
const CALC = [{ id: "calcul", label: "Calcul" }];
const PUR2 = [{ id: "pur", label: "Calcul direct" }, { id: "situation", label: "En situation" }];

register(
  // ===== Chapitre 1 : Distance =====
  mk("dist-cercle", "Cercles", 1, { skill: "Position d'un point par rapport à un cercle (distance au centre)", ref: `${BOOK}, chap. 1 §1.2, ex. 1.a-1.b (p. 12-13) et ex. 3-4 (p. 19)`, kw: ["intérieur", "extérieur", "cercle", "disque", "distance", "rayon"] }, (_c, r) => {
    const R = int(r, 3, 9), d = int(r, 1, 14);
    const pos = d < R ? "à l'intérieur du cercle" : d === R ? "sur le cercle" : "à l'extérieur du cercle";
    const opts = ["à l'intérieur du cercle", "sur le cercle", "à l'extérieur du cercle"];
    return {
      statement: `Un cercle de centre O a pour rayon ${R} cm. Un point M est tel que OM = ${d} cm. Où se trouve M ?`,
      answer: choice(r, opts, opts.indexOf(pos)),
      hints: H("On compare la distance au centre et le rayon.", "Si OM < r, M est à l'intérieur ; si OM = r, M est sur le cercle ; si OM > r, M est à l'extérieur.", `Compare ${d} et ${R}.`, d < R ? `${d} < ${R}.` : d === R ? `${d} = ${R}.` : `${d} > ${R}.`),
      solution: `OM = ${d} et r = ${R} : ${d < R ? `${d} < ${R}` : d === R ? `${d} = ${R}` : `${d} > ${R}`}, donc M est ${pos}.`,
    };
  }, QCM),
  mk("dist-corde", "Cercles", 2, { skill: "Cordes d'un cercle : la plus longue est un diamètre", ref: `${BOOK}, chap. 1 §1.1, ex. 1 (p. 19)`, kw: ["corde", "diamètre", "plus longue", "cercle"] }, (_c, r) => {
    const R = int(r, 2, 10);
    const k = int(r, 0, 2);
    if (k === 0) return { statement: `Dans un cercle de rayon ${R} cm, quelle est la longueur de la plus longue corde (en cm) ?`, answer: num(2 * R), hints: H("Dans un cercle, les cordes les plus longues sont les diamètres.", "Un diamètre vaut deux rayons.", `2 × ${R}.`, "Aucune corde n'est plus longue."), solution: `La plus longue corde est un diamètre : 2 × ${R} = ${2 * R} cm.` };
    const L = 2 * R + int(r, 1, 5);
    if (k === 1) return { statement: `Dans un cercle de rayon ${R} cm, peut-on construire une corde de ${L} cm de longueur ? Réponds par le nombre de telles cordes (0 si impossible, 1 si possible).`, answer: num(0), hints: H("Les cordes sont au plus aussi longues qu'un diamètre.", `Le diamètre mesure ${2 * R} cm.`, `${L} > ${2 * R}.`, "Impossible."), solution: `Le diamètre (${2 * R} cm) est la plus longue corde : une corde de ${L} cm est impossible, donc 0.` };
    const l = int(r, 1, 2 * R);
    return { statement: `Dans un cercle de rayon ${R} cm, on trace une corde de ${l} cm. Cette corde est-elle un diamètre ? Réponds 1 pour oui, 0 pour non.`, answer: num(l === 2 * R ? 1 : 0), hints: H("Un diamètre mesure deux rayons.", `2 × ${R} = ${2 * R}.`, `Compare ${l} et ${2 * R}.`, "Une corde plus courte n'est pas un diamètre."), solution: `Un diamètre mesure ${2 * R} cm : ${l === 2 * R ? "oui" : "non"}.` };
  }, [{ id: "corde", label: "Cordes" }]),
  mk("dist-triangle", "Segments", 2, { skill: "Inégalité triangulaire : peut-on construire le triangle ?", ref: `${BOOK}, chap. 1 §2.1, ex. 2.a (p. 14-15) et ex. 7 (p. 20)`, kw: ["inégalité triangulaire", "triangle", "construire", "côtés", "somme"] }, (_c, r) => {
    const a = int(r, 2, 10), b = int(r, 2, 10);
    const ok = int(r, 0, 1) === 0;
    const c = ok ? int(r, Math.abs(a - b) + 1, a + b - 1) : (int(r, 0, 1) === 0 ? a + b + int(r, 1, 4) : Math.max(1, Math.abs(a - b) - int(r, 1, 3)));
    const t = [a, b, c].sort((x, y) => x - y);
    const possible = t[2] < t[0] + t[1];
    return {
      statement: `Peut-on construire un triangle dont les côtés mesurent ${a} cm, ${b} cm et ${c} cm ?`,
      answer: choice(r, ["Oui", "Non"], possible ? 0 : 1),
      hints: H("Dans un triangle, un côté est plus petit que la somme des deux autres.", "Compare le plus grand côté à la somme des deux autres.", `Plus grand côté : ${t[2]} ; somme des deux autres : ${t[0] + t[1]}.`, `${t[2]} < ${t[0] + t[1]} ?`),
      solution: `${t[2]} ${possible ? "<" : "≥"} ${t[0]} + ${t[1]} = ${t[0] + t[1]} : ${possible ? "le triangle existe" : "le triangle ne peut pas exister"}.`,
    };
  }, QCM),
  mk("dist-segment", "Segments", 2, { skill: "Points alignés : AM + MB = AB", ref: `${BOOK}, chap. 1 §2.2, ex. 2.b-2.d (p. 15-16) et ex. 9-11 (p. 20)`, kw: ["AM + MB = AB", "segment", "alignés", "distance"] }, (c, r) => {
    const AB = dec(r, 5, 18, 1), AM = round(dec(r, 1, 4, 1) + 0.3, 1);
    if (AM >= AB) return { statement: "M est un point du segment [AB] avec AM = 3 cm et AB = 8 cm. Calcule MB (en cm).", answer: num(5), hints: H("M est sur [AB].", "AM + MB = AB.", "MB = AB − AM.", "8 − 3."), solution: "MB = 8 − 3 = 5 cm." };
    const k = int(r, 0, 1);
    if (k === 0) return { statement: c === "pur" ? `M appartient au segment [AB]. AB = ${fr(AB)} cm et AM = ${fr(AM)} cm. Calcule MB.` : `Sur la route [AB] de ${fr(AB)} km, un puits M est à ${fr(AM)} km de A. Quelle est la distance MB (en km) ?`, answer: num(round(AB - AM, 1), 0.001), hints: H("M est un point du segment [AB].", "AM + MB = AB.", "MB = AB − AM.", `${fr(AB)} − ${fr(AM)}.`), solution: `MB = AB − AM = ${fr(AB)} − ${fr(AM)} = ${fr(round(AB - AM, 1))}.` };
    const MB = round(AB - AM, 1);
    return { statement: `On donne AM = ${fr(AM)} cm, MB = ${fr(MB)} cm et AB = ${fr(AB)} cm. On suppose AM + MB = AB. Que peut-on dire de M ? Réponds 1 si M appartient à [AB], 0 sinon.`, answer: num(1), hints: H("Si AM + MB = AB, alors M appartient à [AB].", `${fr(AM)} + ${fr(MB)} = ${fr(AB)}.`, "La somme est égale à AB.", "M est sur le segment."), solution: `${fr(AM)} + ${fr(MB)} = ${fr(AB)} : M appartient à [AB], donc 1.` };
  }, PUR2),
  mk("dist-cas", "Segments", 3, { skill: "Valeurs possibles d'une distance (inégalité triangulaire)", ref: `${BOOK}, chap. 1, ex. 6, 9, 15 (p. 19-21)`, kw: ["valeurs possibles", "triangle", "entier", "inégalité"] }, (_c, r) => {
    const a = int(r, 3, 10), b = int(r, 2, a - 1);
    const lo = a - b + 1, hi = a + b - 1;
    return {
      statement: `Un triangle ABC a pour côtés AB = ${a} cm et BC = ${b} cm. AC est un nombre entier de centimètres. Combien de valeurs AC peut-il prendre ?`,
      answer: num(hi - lo + 1),
      hints: H("On applique l'inégalité triangulaire aux trois côtés.", `AC doit être plus grand que ${a} − ${b} et plus petit que ${a} + ${b}.`, `${a - b} < AC < ${a + b}.`, `Compte les entiers de ${lo} à ${hi}.`),
      solution: `${a - b} < AC < ${a + b} : AC ∈ {${lo} ; … ; ${hi}}, soit ${hi - lo + 1} valeurs.`,
    };
  }, [{ id: "cas", label: "Cas possibles" }]),

  // ===== Chapitres 2 et 4 : symétries =====
  mk("sympt-propriete", "Figures symétriques par rapport à un point", 1, { skill: "Propriétés de la symétrie par rapport à un point", ref: `${BOOK}, chap. 2 §1-2 (p. 24-28)`, kw: ["symétrique", "point", "milieu", "segment", "droite parallèle", "cercle"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quel est le symétrique d'une droite par rapport à un point ?", good: "Une droite qui lui est parallèle", bad: ["Une droite qui lui est perpendiculaire", "Une demi-droite", "Une droite sécante à la première"], why: "Le symétrique d'une droite par rapport à un point est une droite qui lui est parallèle." },
      { q: "Quel est le symétrique d'un cercle de centre O et de rayon r par rapport à un point I ?", good: "Le cercle de centre O' (symétrique de O) et de même rayon r", bad: ["Le cercle de centre O et de rayon 2r", "Le cercle de centre I et de rayon r", "Un disque de rayon r"], why: "Le symétrique d'un cercle est le cercle de centre O' et de même rayon." },
      { q: "Les symétriques par rapport à un point de deux droites perpendiculaires sont…", good: "deux droites perpendiculaires", bad: ["deux droites parallèles", "deux droites confondues", "deux droites sécantes non perpendiculaires"], why: "Les symétriques par rapport à un point de deux droites perpendiculaires sont deux droites perpendiculaires." },
      { q: "Les symétriques par rapport à un point de deux droites parallèles sont…", good: "deux droites parallèles", bad: ["deux droites perpendiculaires", "deux droites sécantes", "une seule droite"], why: "Les symétriques par rapport à un point de deux droites parallèles sont deux droites parallèles." },
      { q: "Si I est le milieu de [AB], que peut-on dire du symétrique I' de I par rapport à un point O ?", good: "I' est le milieu du segment symétrique [A'B']", bad: ["I' est confondu avec O", "I' est un sommet de [A'B']", "I' n'est pas sur la droite (A'B')"], why: "Le symétrique du milieu d'un segment est le milieu du symétrique de ce segment." },
      { q: "Les points A, O et A' sont alignés avec OA = OA'. Que peut-on dire de A et A' ?", good: "Ils sont symétriques par rapport à O (O milieu de [AA'], avec O entre A et A')", bad: ["Ils sont confondus", "O n'est pas le milieu de [AA']", "A' est le symétrique de O"], why: "O est le milieu de [AA'] si A, O, A' sont alignés avec OA = OA' (O entre A et A'), donc A et A' sont symétriques par rapport à O." },
    ];
    return qcmOf(r, pool, "Pense au dessin codé de la propriété.");
  }, QCM),
  mk("sympt-calcul", "Figures symétriques par rapport à un point", 1, { skill: "Calculer une longueur ou un angle avec une symétrie centrale", ref: `${BOOK}, chap. 2 §1 (p. 24) et ex. 1-9 (p. 30-31)`, kw: ["symétrie", "point", "longueur", "milieu", "angle"] }, (c, r) => {
    const v = int(r, 4, 40);
    const k = int(r, 0, 2);
    void c;
    if (k === 0) return { statement: `A et A' sont symétriques par rapport à O et OA = ${v} cm. Calcule AA' (en cm).`, answer: num(2 * v), hints: H("O est le milieu de [AA'].", "OA = OA'.", "AA' = OA + OA'.", `2 × ${v}.`), solution: `AA' = 2 × ${v} = ${2 * v} cm.` };
    if (k === 1) return { statement: `[AB] et [A'B'] sont symétriques par rapport à un point. AB = ${v} cm. Calcule A'B' (en cm).`, answer: num(v), hints: H("Le symétrique d'un segment est un segment de même longueur.", "La symétrie conserve les longueurs.", "A'B' = AB.", "Recopie la valeur."), solution: `A'B' = AB = ${v} cm.` };
    const a = int(r, 20, 150);
    return { statement: `L'angle AOB mesure ${a}°. Son symétrique par rapport à un point est l'angle A'O'B'. Calcule la mesure de A'O'B' (en °).`, answer: num(a), hints: H("Le symétrique d'un angle est un angle de même mesure.", "La symétrie conserve les angles.", "Même mesure.", "Recopie la valeur."), solution: `Mesure de A'O'B' = mesure de AOB = ${a}°.` };
  }, CALC),
  mk("symdr-propriete", "Figures symétriques par rapport à une droite", 1, { skill: "Propriétés de la symétrie par rapport à une droite", ref: `${BOOK}, chap. 4 §1-2 (p. 50-52)`, kw: ["symétrique", "droite", "médiatrice", "axe", "point de la droite", "cercle"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "A et B sont symétriques par rapport à une droite (D). Que représente (D) pour le segment [AB] ?", good: "La médiatrice de [AB]", bad: ["Un côté de [AB]", "La parallèle à (AB) passant par A", "Un cercle de diamètre [AB]"], why: "Deux points sont symétriques par rapport à (D) signifie que (D) est la médiatrice du segment qu'ils déterminent." },
      { q: "M est un point de la droite (D). Quel est son symétrique par rapport à (D) ?", good: "M lui-même", bad: ["Le milieu de (D)", "Un point de (D) différent de M", "Il n'existe pas"], why: "Chaque point de la droite (D) est son propre symétrique par rapport à (D)." },
      { q: "Quel est le symétrique d'un cercle de centre O et de rayon r par rapport à une droite (D) ?", good: "Le cercle de centre O' (symétrique de O) et de même rayon r", bad: ["Le cercle de centre O et de rayon 2r", "Un segment de longueur 2r", "Le même cercle toujours"], why: "Le symétrique d'un cercle est le cercle de centre O' et de même rayon." },
      { q: "Les points A, B, C sont alignés. Leurs symétriques A', B', C' par rapport à une droite sont…", good: "alignés", bad: ["sur un cercle", "forment un triangle", "confondus"], why: "Si des points sont alignés, leurs symétriques par rapport à une droite sont alignés." },
      { q: "Une droite (L) coupe (D) en I. Que peut-on dire du symétrique (L') de (L) par rapport à (D) ?", good: "(L') coupe (D) en I", bad: ["(L') est parallèle à (D)", "(L') est confondue avec (D)", "(L') ne coupe pas (D)"], why: "Si (L) coupe (D) en I, son symétrique (L') coupe (D) en I (I est son propre symétrique)." },
      { q: "Le symétrique d'un segment par rapport à une droite est…", good: "un segment de même longueur", bad: ["un segment deux fois plus long", "une droite", "un point"], why: "La symétrie par rapport à une droite conserve les longueurs." },
      { q: "Le symétrique d'un angle par rapport à une droite est…", good: "un angle de même mesure", bad: ["un angle de mesure double", "un angle supplémentaire", "un angle droit"], why: "La symétrie par rapport à une droite conserve les mesures d'angles." },
    ];
    return qcmOf(r, pool, "Pense à la médiatrice.");
  }, QCM),
  mk("symdr-calcul", "Figures symétriques par rapport à une droite", 1, { skill: "Calculer avec une symétrie par rapport à une droite (distances, angles)", ref: `${BOOK}, chap. 4 §1, ex. 1.a-1.e (p. 50-51)`, kw: ["symétrie", "droite", "médiatrice", "distance", "angle", "longueur"] }, (c, r) => {
    const v = int(r, 4, 40) / 2;
    void c;
    const k = int(r, 0, 2);
    if (k === 0) return { statement: `A' est le symétrique de A par rapport à (D). La distance de A à (D) est ${fr(v)} cm. Calcule AA' (en cm).`, answer: num(2 * v), hints: H("(D) est la médiatrice de [AA'].", "Elle coupe [AA'] en son milieu.", "AA' = 2 × distance.", `2 × ${fr(v)}.`), solution: `AA' = 2 × ${fr(v)} = ${fr(2 * v)} cm.` };
    if (k === 1) return { statement: `[AB] et [A'B'] sont symétriques par rapport à une droite. AB = ${fr(v)} cm. Calcule A'B' (en cm).`, answer: num(v), hints: H("Le symétrique d'un segment est un segment de même longueur.", "La symétrie axiale conserve les longueurs.", "A'B' = AB.", "Recopie."), solution: `A'B' = AB = ${fr(v)} cm.` };
    const a = int(r, 20, 160);
    return { statement: `Un angle de ${a}° est symétrique d'un angle par rapport à une droite. Quelle est la mesure de l'angle symétrique (en °) ?`, answer: num(a), hints: H("La symétrie conserve les angles.", "Même mesure.", "Recopie la valeur.", "Pas de calcul."), solution: `Même mesure : ${a}°.` };
  }, CALC),

  // ===== Chapitre 3 : Angles =====
  mk("ang-suppl", "Angles", 1, { skill: "Angles supplémentaires et complémentaires", ref: `${BOOK}, chap. 3 §1, ex. 1.a-1.i (p. 34-35) et ex. 1-2 (p. 45)`, kw: ["supplémentaires", "complémentaires", "180", "90", "somme des mesures"] }, (c, r) => {
    const comp = int(r, 0, 1) === 0;
    const x = comp ? dec(r, 5, 85, 1) : dec(r, 5, 175, 1);
    const t = comp ? 90 : 180;
    return {
      statement: c === "pur" ? `Deux angles sont ${comp ? "complémentaires" : "supplémentaires"}. L'un mesure ${fr(x)}°. Quelle est la mesure de l'autre (en °) ?` : `Deux angles adjacents forment ${comp ? "un angle droit" : "un angle plat"}. L'un d'eux mesure ${fr(x)}°. Quelle est la mesure de l'autre (en °) ?`,
      answer: num(round(t - x, 1), 0.001, "°"),
      hints: H(comp ? "La somme de deux angles complémentaires vaut 90°." : "La somme de deux angles supplémentaires vaut 180°.", `Angle cherché = ${t}° − angle connu.`, `${t} − ${fr(x)}.`, "Soustrais."),
      solution: `${t} − ${fr(x)} = ${fr(round(t - x, 1))}°.`,
    };
  }, PUR2),
  mk("ang-sommet", "Angles", 1, { skill: "Angles opposés par le sommet", ref: `${BOOK}, chap. 3 §2, ex. 2.a-2.b (p. 36)`, kw: ["opposés par le sommet", "même mesure", "droites sécantes"] }, (_c, r) => {
    const x = int(r, 20, 160);
    if (int(r, 0, 1) === 0) return { statement: `Les droites (AC) et (BD) se coupent en O. L'angle AOB mesure ${x}°. Combien mesure l'angle COD (opposé par le sommet à AOB) ?`, answer: num(x, 0, "°"), hints: H("Deux angles opposés par le sommet ont la même mesure.", "AOB et COD sont opposés par le sommet.", "Même mesure.", "Recopie."), solution: `mes COD = mes AOB = ${x}°.` };
    return { statement: `Les droites (AC) et (BD) se coupent en O. L'angle AOB mesure ${x}°. Combien mesure l'angle BOC (en °) ?`, answer: num(180 - x, 0, "°"), hints: H("AOB et BOC sont adjacents.", "Ils forment un angle plat (A, O, C alignés).", "mes BOC = 180° − mes AOB.", `180 − ${x}.`), solution: `mes BOC = 180° − ${x}° = ${180 - x}°.` };
  }, [{ id: "sommet", label: "Angles au sommet" }]),
  mk("ang-parall", "Angles", 2, { skill: "Deux parallèles et une sécante : angles alternes-internes et correspondants", ref: `${BOOK}, chap. 3 §3.2, ex. 3.a-3.b (p. 37-38) et ex. 5, 8 (p. 45)`, kw: ["alternes-internes", "correspondants", "parallèles", "sécante", "même mesure"] }, (c, r) => {
    const x = int(r, 25, 155);
    void c;
    const type = pick(r, ["alternes-internes", "correspondants"]);
    if (int(r, 0, 1) === 0) return { statement: `Deux droites parallèles sont coupées par une sécante. Deux angles ${type} mesurent respectivement ${x}° et □. Quelle est la mesure manquante (en °) ?`, answer: num(x, 0, "°"), hints: H("Deux parallèles coupées par une sécante.", `Les angles ${type} formés ont la même mesure.`, "Recopie la valeur.", "Pas de calcul."), solution: `Deux angles ${type} formés par deux droites parallèles et une sécante ont même mesure : ${x}°.` };
    return { statement: `Deux droites (D₁) et (D₂) sont coupées par une sécante. Deux angles ${type} mesurent ${x}° et ${x}°. Que peut-on dire de (D₁) et (D₂) ?`, answer: choice(r, ["Elles sont parallèles", "Elles sont perpendiculaires", "On ne peut rien dire"], 0), hints: H("On utilise la réciproque.", `Deux angles ${type} de même mesure forment des droites parallèles.`, "Les deux mesures sont égales.", "Conclus."), solution: `Si deux droites forment avec une sécante deux angles ${type} de même mesure, alors elles sont parallèles.` };
  }, [{ id: "parallèles", label: "Parallèles et sécante" }]),
  mk("ang-parall-non", "Angles", 2, { skill: "Les droites sont-elles parallèles ? (angles alternes-internes ou correspondants)", ref: `${BOOK}, chap. 3 §3.3, ex. 9-10 (p. 46)`, kw: ["parallèles", "alternes-internes", "correspondants", "justifier", "même mesure"] }, (_c, r) => {
    const a = int(r, 30, 140), same = int(r, 0, 1) === 0;
    const b = same ? a : a + int(r, 1, 3);
    const type = pick(r, ["alternes-internes", "correspondants"]);
    return {
      statement: `Deux droites (D) et (D') sont coupées par une sécante (L). Elles déterminent deux angles ${type} de ${a}° et ${b}°. Les droites (D) et (D') sont-elles parallèles ?`,
      answer: choice(r, ["Oui", "Non"], same ? 0 : 1),
      hints: H("On compare les mesures des deux angles.", `Si deux angles ${type} ont la même mesure, les droites sont parallèles.`, "S'ils n'ont pas la même mesure, elles ne le sont pas.", `${a} et ${b}.`),
      solution: same ? `${a}° = ${b}° : les angles ${type} ont même mesure, donc (D) // (D').` : `${a}° ≠ ${b}° : les droites ne sont pas parallèles.`,
    };
  }, QCM),
  mk("ang-triangle", "Angles", 1, { skill: "Somme des angles d'un triangle : angle manquant", ref: `${BOOK}, chap. 3 §4.1, ex. 4.a-4.b (p. 41) et ex. 11, 17-19 (p. 46)`, kw: ["somme des angles", "triangle", "180", "angle manquant", "rectangle"] }, (c, r) => {
    const a = int(r, 25, 100), b = int(r, 20, 150 - a);
    const k = int(r, 0, 2);
    if (k === 0) return { statement: c === "pur" ? `Dans un triangle ABC, mes Â = ${a}° et mes B̂ = ${b}°. Calcule mes Ĉ.` : `Un toit triangulaire a deux angles de ${a}° et ${b}°. Combien mesure le troisième (°) ?`, answer: num(180 - a - b, 0, "°"), hints: H("La somme des angles d'un triangle vaut 180°.", "On connaît deux angles.", "Angle cherché = 180° − somme.", `${a} + ${b} = ${a + b}.`), solution: `Ĉ = 180° − ${a}° − ${b}° = ${180 - a - b}°.` };
    if (k === 1) { const x = int(r, 15, 75); return { statement: `Dans un triangle rectangle, un angle aigu mesure ${x}°. Quelle est la mesure de l'autre angle aigu (en °) ?`, answer: num(90 - x, 0, "°"), hints: H("Les angles aigus d'un triangle rectangle sont complémentaires.", "Leur somme vaut 90°.", "90° − angle connu.", `90 − ${x}.`), solution: `90° − ${x}° = ${90 - x}°.` }; }
    const n = int(r, 4, 8); const s = (n - 2) * 180;
    return { statement: `Quelle est la somme des mesures des angles d'un polygone convexe à ${n} côtés (en °) ?`, answer: num(s), hints: H("On découpe le polygone en triangles.", "Depuis un sommet, on trace les diagonales.", `On obtient ${n - 2} triangles.`, `${n - 2} × 180.`), solution: `${n - 2} triangles : ${n - 2} × 180° = ${s}°.` };
  }, [{ id: "pur", label: "Calcul direct" }, { id: "situation", label: "En situation" }]),
  mk("ang-polygone", "Angles", 2, { skill: "Angles d'un quadrilatère et des polygones", ref: `${BOOK}, chap. 3, ex. 4.d (p. 41) et ex. 34 (p. 48)`, kw: ["quadrilatère", "polygone", "somme des angles", "360"] }, (_c, r) => {
    const a = int(r, 60, 120), b = int(r, 60, 120), d = int(r, 60, 120);
    return { statement: `Dans un quadrilatère ABCD, mes Â = ${a}°, mes B̂ = ${b}° et mes D̂ = ${d}°. Calcule mes Ĉ (en °), sachant que la somme des angles d'un quadrilatère est 360°.`, answer: num(360 - a - b - d, 0, "°"), hints: H("Un quadrilatère se coupe en deux triangles.", "La somme de ses angles est 360°.", "Angle cherché = 360° − somme des trois autres.", `${a} + ${b} + ${d} = ${a + b + d}.`), solution: `Ĉ = 360° − ${a + b + d}° = ${360 - a - b - d}°.` };
  }, CALC),

  // ===== Chapitre 5 : Médiatrice =====
  mk("med-propriete", "Segments", 2, { skill: "Médiatrice : points équidistants et régionnement du plan", ref: `${BOOK}, chap. 5 §1 et §4 (p. 60-68)`, kw: ["médiatrice", "équidistant", "MA = MB", "demi-plan", "cercle circonscrit"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "M appartient à la médiatrice de [AB]. Que peut-on dire de MA et MB ?", good: "MA = MB", bad: ["MA = 2 × MB", "MA < MB", "MA + MB = AB"], why: "Si un point appartient à la médiatrice d'un segment, alors il est équidistant des extrémités de ce segment." },
      { q: "MA = MB. Que peut-on dire du point M ?", good: "M appartient à la médiatrice de [AB]", bad: ["M appartient au segment [AB]", "M est le milieu de [AB]", "M est sur le cercle de diamètre [AB]"], why: "Si un point est équidistant des extrémités d'un segment, il appartient à sa médiatrice." },
      { q: "Le point M est dans le demi-plan de la médiatrice de [AB] qui contient A. Que peut-on dire ?", good: "MA < MB", bad: ["MA = MB", "MA > MB", "On ne peut rien dire"], why: "La médiatrice détermine deux demi-plans : un point du demi-plan contenant A est plus proche de A : MA < MB." },
      { q: "Le point M est dans le demi-plan de la médiatrice de [AB] qui contient B. Que peut-on dire ?", good: "MA > MB", bad: ["MA = MB", "MA < MB", "MA = 0"], why: "Un point du demi-plan contenant B est plus proche de B : MA > MB." },
      { q: "Où se trouve le centre d'un cercle qui passe par deux points A et B ?", good: "Sur la médiatrice de [AB]", bad: ["Au milieu de (AB) uniquement", "Sur la droite (AB)", "N'importe où"], why: "Le centre est à égale distance de A et de B : il est sur la médiatrice de [AB]." },
      { q: "Dans un cercle, I est le milieu de la corde [AB], O est le centre. Que peut-on dire de (OI) ?", good: "(OI) est perpendiculaire à (AB)", bad: ["(OI) est parallèle à (AB)", "(OI) est confondue avec (AB)", "OI = AB"], why: "O est équidistant de A et de B : il est sur la médiatrice de [AB], et I est le milieu, donc (OI) ⊥ (AB)." },
      { q: "Comment obtient-on le centre du cercle circonscrit à un triangle ?", good: "Au point de rencontre des médiatrices de ses côtés", bad: ["Au point de rencontre de ses hauteurs", "Au milieu d'un côté", "Au sommet de l'angle droit"], why: "Le centre du cercle circonscrit est équidistant des trois sommets : il est sur les médiatrices des côtés." },
    ];
    return qcmOf(r, pool, "Pense à « équidistant ».");
  }, QCM),
  mk("med-calcul", "Segments", 2, { skill: "Utiliser la médiatrice pour calculer une longueur", ref: `${BOOK}, chap. 5 §1-2, ex. 1.a-1.e (p. 60-62)`, kw: ["médiatrice", "équidistant", "longueur", "rayon", "centre"] }, (_c, r) => {
    const x = int(r, 3, 20);
    const k = int(r, 0, 1);
    if (k === 0) { const AB = 2 * int(r, 2, 12); return { statement: `(D) est la médiatrice de [AB] et coupe (AB) en I. AB = ${AB} cm. Calcule AI (en cm).`, answer: num(AB / 2), hints: H("La médiatrice passe par le milieu du segment.", "I est le milieu de [AB].", "AI = AB ÷ 2.", `${AB} ÷ 2.`), solution: `I est le milieu de [AB] : AI = ${AB} ÷ 2 = ${AB / 2} cm.` }; }
    return { statement: `M est un point de la médiatrice de [AB]. MA = ${x} cm. Calcule MB (en cm).`, answer: num(x), hints: H("M est sur la médiatrice.", "Il est équidistant de A et de B.", "MB = MA.", "Recopie."), solution: `MB = MA = ${x} cm.` };
  }, CALC),

  // ===== Chapitre 6 : Triangles particuliers =====
  mk("tri-isocele", "Triangles", 2, { skill: "Triangle isocèle : calculer les angles", ref: `${BOOK}, chap. 6 §1, ex. 1-6 (p. 86)`, kw: ["triangle isocèle", "angles à la base", "sommet principal", "180"] }, (c, r) => {
    const base = int(r, 25, 80);
    const k = int(r, 0, 1);
    if (k === 0) return { statement: c === "pur" ? `ABC est isocèle en A et mes B̂ = ${base}°. Calcule mes Â.` : `Un pignon de maison a la forme d'un triangle isocèle dont les angles à la base mesurent ${base}°. Quel est l'angle au sommet (en °) ?`, answer: num(180 - 2 * base, 0, "°"), hints: H("Un triangle isocèle a deux angles de même mesure à la base.", "La somme des angles est 180°.", "Angle au sommet = 180° − 2 × angle à la base.", `2 × ${base} = ${2 * base}.`), solution: `Â = 180° − 2 × ${base}° = ${180 - 2 * base}°.` };
    const top = int(r, 20, 120), bs = (180 - top) / 2;
    return { statement: `ABC est isocèle en A et mes Â = ${top}°. Calcule mes B̂ (en °).`, answer: num(bs, 0.001, "°"), hints: H("Les angles à la base sont égaux.", "Leur somme est 180° − angle au sommet.", `180 − ${top} = ${180 - top}.`, `${180 - top} ÷ 2.`), solution: `B̂ = Ĉ = (180° − ${top}°) ÷ 2 = ${fr(bs)}°.` };
  }, PUR2),
  mk("tri-equilateral", "Triangles", 1, { skill: "Triangle équilatéral : angles et reconnaissance", ref: `${BOOK}, chap. 6 §2, ex. 2.a-2.b (p. 80-81)`, kw: ["triangle équilatéral", "60°", "trois angles égaux"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Combien mesure chaque angle d'un triangle équilatéral ?", good: "60°", bad: ["30°", "45°", "90°"], why: "Les trois angles sont égaux et leur somme vaut 180° : 180° ÷ 3 = 60°." },
      { q: "Un triangle a ses trois angles de même mesure. Que peut-on dire ?", good: "Il est équilatéral", bad: ["Il est rectangle", "Il est isocèle sans être équilatéral", "Il n'existe pas"], why: "Si un triangle a ses trois angles de même mesure, alors il est équilatéral." },
      { q: "Un triangle isocèle a un angle de 60°. Que peut-on dire ?", good: "Il est équilatéral", bad: ["Il est rectangle", "Il a un angle obtus", "Il n'est pas équilatéral"], why: "Un triangle isocèle qui a un angle de 60° est équilatéral." },
      { q: "Un triangle équilatéral a un côté de 7 cm. Combien mesure son périmètre (en cm) ?", good: "21", bad: ["14", "49", "7"], why: "Les trois côtés sont égaux : 3 × 7 = 21." },
      { q: "Parmi ces triangles, lequel est équilatéral ?", good: "Celui dont les trois angles mesurent 60°", bad: ["Celui dont les angles mesurent 50°, 60° et 70°", "Celui dont les angles mesurent 90°, 45° et 45°", "Celui dont les angles mesurent 30°, 60° et 90°"], why: "Un triangle est équilatéral si ses trois angles ont même mesure : 60°, 60°, 60°." },
      { q: "Un triangle ABC est isocèle en A avec Â = 60°. Combien mesurent B̂ et Ĉ ?", good: "60° chacun", bad: ["30° chacun", "45° chacun", "90° chacun"], why: "B̂ = Ĉ = (180° − 60°) ÷ 2 = 60° : le triangle est équilatéral." },
    ];
    return qcmOf(r, pool, "Pense à 180° ÷ 3.");
  }, QCM),
  mk("tri-rectangle", "Triangles", 2, { skill: "Triangle rectangle : angles, hypoténuse et cercle circonscrit", ref: `${BOOK}, chap. 6 §3, ex. 3.a-3.d (p. 81-84) et ex. 11-16 (p. 86)`, kw: ["triangle rectangle", "hypoténuse", "cercle circonscrit", "diamètre", "angles complémentaires"] }, (_c, r) => {
    const k = int(r, 0, 3);
    if (k === 0) { const x = int(r, 15, 75); return { statement: `ABC est rectangle en A et mes B̂ = ${x}°. Calcule mes Ĉ (en °).`, answer: num(90 - x, 0, "°"), hints: H("Les angles aigus d'un triangle rectangle sont complémentaires.", "mes B̂ + mes Ĉ = 90°.", "Ĉ = 90° − B̂.", `90 − ${x}.`), solution: `Ĉ = 90° − ${x}° = ${90 - x}°.` }; }
    if (k === 1) { const h = 2 * int(r, 2, 12); return { statement: `ABC est un triangle rectangle en A d'hypoténuse [BC] = ${h} cm. Quel est le rayon (en cm) du cercle circonscrit à ABC ?`, answer: num(h / 2), hints: H("Si ABC est rectangle en A, le cercle de diamètre [BC] passe par A.", "[BC] est un diamètre du cercle circonscrit.", "Rayon = BC ÷ 2.", `${h} ÷ 2.`), solution: `Le cercle circonscrit a pour diamètre [BC] : rayon = ${h} ÷ 2 = ${h / 2} cm.` }; }
    const pool: Item[] = [
      { q: "A est un point du cercle de diamètre [BC], différent de B et C. Que peut-on dire du triangle ABC ?", good: "Il est rectangle en A", bad: ["Il est équilatéral", "Il est isocèle en A", "Il est rectangle en B"], why: "Si A est un point du cercle de diamètre [BC], alors le triangle ABC est rectangle en A." },
      { q: "Un triangle a deux angles complémentaires. Que peut-on dire ?", good: "Il est rectangle", bad: ["Il est équilatéral", "Il est isocèle", "Il est obtus"], why: "Si un triangle a deux angles complémentaires, le troisième vaut 90° : il est rectangle." },
      { q: "Quel est le côté le plus long d'un triangle rectangle ?", good: "L'hypoténuse", bad: ["Le côté adjacent", "Le côté opposé à l'angle aigu", "Les trois côtés sont égaux"], why: "L'hypoténuse d'un triangle rectangle est le côté le plus long." },
    ];
    return qcmOf(r, pool, "Pense au cercle de diamètre l'hypoténuse.");
  }, [{ id: "rectangle", label: "Triangle rectangle" }]),

  // ===== Chapitre 7 : Parallélogrammes =====
  mk("para-angles", "Parallélogrammes particuliers", 2, { skill: "Angles d'un parallélogramme", ref: `${BOOK}, chap. 7 §1.2, ex. 5-8 (p. 99)`, kw: ["parallélogramme", "angles opposés", "angles consécutifs", "supplémentaires"] }, (c, r) => {
    const x = int(r, 30, 150);
    void c;
    const k = int(r, 0, 1);
    if (k === 0) return { statement: `ABCD est un parallélogramme et mes Â = ${x}°. Calcule mes Ĉ (en °).`, answer: num(x, 0, "°"), hints: H("Dans un parallélogramme, les angles des sommets opposés ont même mesure.", "Â et Ĉ sont opposés.", "Même mesure.", "Recopie."), solution: `Ĉ = Â = ${x}°.` };
    return { statement: `ABCD est un parallélogramme et mes Â = ${x}°. Calcule mes B̂ (en °).`, answer: num(180 - x, 0, "°"), hints: H("Les angles de deux sommets consécutifs sont supplémentaires.", "Â et B̂ sont consécutifs.", "B̂ = 180° − Â.", `180 − ${x}.`), solution: `B̂ = 180° − ${x}° = ${180 - x}°.` };
  }, CALC),
  mk("para-reconnaitre", "Parallélogrammes particuliers", 2, { skill: "Reconnaître un parallélogramme, un rectangle, un losange, un carré", ref: `${BOOK}, chap. 7, tableaux récapitulatifs (p. 91, 94, 97) et ex. 1-4, 9-20 (p. 99-100)`, kw: ["parallélogramme", "rectangle", "losange", "carré", "reconnaître", "diagonales"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Un quadrilatère a trois angles droits. Que peut-on affirmer ?", good: "C'est un rectangle", bad: ["C'est un losange", "C'est un trapèze quelconque", "On ne peut rien affirmer"], why: "Si un quadrilatère a trois angles droits, alors c'est un rectangle." },
      { q: "Un parallélogramme a un angle droit. Que peut-on affirmer ?", good: "C'est un rectangle", bad: ["C'est un losange", "C'est un carré", "C'est un triangle"], why: "Si un parallélogramme a un angle droit, alors c'est un rectangle." },
      { q: "Un parallélogramme a ses diagonales de même longueur. Que peut-on affirmer ?", good: "C'est un rectangle", bad: ["C'est un losange", "C'est un carré à coup sûr", "C'est un trapèze"], why: "Si un parallélogramme a ses diagonales de même longueur, alors c'est un rectangle." },
      { q: "Un quadrilatère a ses quatre côtés de même longueur. Que peut-on affirmer ?", good: "C'est un losange", bad: ["C'est un rectangle", "C'est un trapèze", "C'est un carré à coup sûr"], why: "Si un quadrilatère a ses quatre côtés de même longueur, alors c'est un losange." },
      { q: "Un parallélogramme a ses diagonales perpendiculaires. Que peut-on affirmer ?", good: "C'est un losange", bad: ["C'est un rectangle", "C'est un trapèze", "C'est un triangle"], why: "Si les diagonales d'un parallélogramme ont des supports perpendiculaires, alors c'est un losange." },
      { q: "Un parallélogramme a deux côtés consécutifs de même longueur. Que peut-on affirmer ?", good: "C'est un losange", bad: ["C'est un rectangle", "C'est un carré à coup sûr", "C'est un trapèze isocèle"], why: "Si un parallélogramme a deux côtés consécutifs de même longueur, alors c'est un losange." },
      { q: "Un carré est…", good: "à la fois un rectangle et un losange", bad: ["un rectangle seulement", "un losange seulement", "ni un rectangle ni un losange"], why: "Un carré est un rectangle et un losange." },
      { q: "Les diagonales d'un quadrilatère se coupent en leur milieu. Que peut-on affirmer ?", good: "C'est un parallélogramme", bad: ["C'est un carré", "C'est un trapèze", "C'est un cerf-volant"], why: "Si un quadrilatère a ses diagonales qui se coupent en leur milieu, alors c'est un parallélogramme." },
      { q: "Un quadrilatère a deux côtés opposés de même longueur et de supports parallèles. Que peut-on affirmer ?", good: "C'est un parallélogramme", bad: ["C'est un losange à coup sûr", "C'est un carré à coup sûr", "C'est un trapèze isocèle"], why: "Si un quadrilatère a deux côtés opposés de même longueur et de supports parallèles, alors c'est un parallélogramme." },
    ];
    return qcmOf(r, pool, "Relis les tableaux récapitulatifs.");
  }, QCM),
  mk("para-calcul", "Parallélogrammes particuliers", 2, { skill: "Rectangle et losange : longueurs des diagonales et des rayons", ref: `${BOOK}, chap. 7 §2.2 et ex. 10 (p. 92, 100)`, kw: ["rectangle", "diagonales", "cercle circonscrit", "losange", "centre"] }, (_c, r) => {
    const d = 2 * int(r, 3, 15);
    const k = int(r, 0, 1);
    if (k === 0) return { statement: `ABCD est un rectangle. Sa diagonale [AC] mesure ${d} cm. Calcule BD (en cm).`, answer: num(d), hints: H("Les diagonales d'un rectangle ont même longueur.", "AC = BD.", "Recopie.", "Pas de calcul."), solution: `BD = AC = ${d} cm.` };
    return { statement: `ABCD est un rectangle de centre O et AC = ${d} cm. Calcule le rayon du cercle circonscrit au rectangle (en cm).`, answer: num(d / 2), hints: H("Les diagonales se coupent en leur milieu O et ont même longueur.", "OA = OB = OC = OD.", "Rayon = AC ÷ 2.", `${d} ÷ 2.`), solution: `OA = OC = ${d} ÷ 2 = ${d / 2} cm : c'est le rayon du cercle circonscrit.` };
  }, CALC),

  // ===== Chapitre 8 : Polygones particuliers =====
  mk("trap-angles", "Polygones particuliers", 2, { skill: "Trapèze : calculer les angles", ref: `${BOOK}, chap. 8 §1, ex. 1-4 (p. 111)`, kw: ["trapèze", "bases", "angles", "isocèle", "rectangle"] }, (_c, r) => {
    const x = int(r, 40, 140);
    const k = int(r, 0, 2);
    if (k === 0) return { statement: `ABCD est un trapèze de bases [AB] et [DC] avec mes D̂ = ${x}°. Calcule mes Â (en °). (Les angles Â et D̂ sont de part et d'autre du côté [AD] entre les deux bases.)`, answer: num(180 - x, 0, "°"), hints: H("Les bases sont parallèles.", "Â et D̂ sont supplémentaires (angles de deux droites parallèles et d'une sécante).", "Â = 180° − D̂.", `180 − ${x}.`), solution: `Â = 180° − ${x}° = ${180 - x}°.` };
    if (k === 1) return { statement: `ABCD est un trapèze isocèle de bases [AB] et [DC] avec mes D̂ = ${x}°. Calcule mes Ĉ (en °).`, answer: num(x, 0, "°"), hints: H("Un trapèze isocèle a un axe de symétrie.", "Les angles à la base ont même mesure.", "Ĉ = D̂.", "Recopie."), solution: `Ĉ = D̂ = ${x}° (angles à la base d'un trapèze isocèle).` };
    return { statement: `Dans un trapèze rectangle ABCD de bases [AB] et [DC], l'angle D̂ est droit. Combien mesure Â (en °) ?`, answer: num(90, 0, "°"), hints: H("Les bases sont parallèles.", "Â et D̂ sont supplémentaires.", "180° − 90°.", "Â est aussi droit."), solution: "Â = 180° − 90° = 90°." };
  }, CALC),
  mk("trap-aire", "Polygones particuliers", 2, { skill: "Aire d'un trapèze", ref: `${BOOK}, chap. 8 §1.4, ex. 1.d-1.f (p. 106-107) et ex. 5-6 (p. 111)`, kw: ["aire", "trapèze", "bases", "hauteur", "(a+b)×h/2"] }, (c, r) => {
    const a = int(r, 2, 10), b = a + int(r, 1, 12), h = int(r, 2, 12);
    const A = ((a + b) * h) / 2;
    if (int(r, 0, 1) === 0) return { statement: c === "pur" ? `Calcule l'aire d'un trapèze de petite base ${a} cm, de grande base ${b} cm et de hauteur ${h} cm.` : `Un champ en forme de trapèze a pour bases ${a} m et ${b} m et pour hauteur ${h} m. Quelle est son aire (en m²) ?`, answer: num(A), hints: H("On cherche l'aire d'un trapèze.", "A = (petite base + grande base) × hauteur ÷ 2.", `${a} + ${b} = ${a + b}.`, `${a + b} × ${h} ÷ 2.`), solution: `A = (${a} + ${b}) × ${h} ÷ 2 = ${fr(A)}.` };
    return { statement: `Un trapèze a une aire de ${fr(A)} cm², des bases de ${a} cm et ${b} cm. Quelle est sa hauteur (en cm) ?`, answer: num(h, 0.001), hints: H("On connaît l'aire et les bases.", "A = (a + b) × h ÷ 2.", "h = 2 × A ÷ (a + b).", `2 × ${fr(A)} = ${fr(2 * A)}.`), solution: `h = 2 × ${fr(A)} ÷ (${a} + ${b}) = ${h} cm.` };
  }, PUR2),
  mk("polygone-reg", "Polygones particuliers", 2, { skill: "Hexagone et octogone réguliers", ref: `${BOOK}, chap. 8 §2, ex. 7-8, 12-13 (p. 111-112)`, kw: ["hexagone régulier", "octogone régulier", "angle au centre", "rayon", "périmètre"] }, (_c, r) => {
    const R = int(r, 2, 12);
    const k = int(r, 0, 4);
    if (k === 0) return { statement: `Un hexagone régulier est inscrit dans un cercle de rayon ${R} cm. Quelle est la longueur de son côté (en cm) ?`, answer: num(R), hints: H("Les six triangles formés avec le centre sont équilatéraux.", "Chaque côté est égal au rayon.", "Côté = rayon.", "Recopie."), solution: `Le côté de l'hexagone régulier est égal au rayon : ${R} cm.` };
    if (k === 1) return { statement: `Un hexagone régulier est inscrit dans un cercle de rayon ${R} cm. Quel est son périmètre (en cm) ?`, answer: num(6 * R), hints: H("Il a six côtés égaux.", "Côté = rayon.", "Périmètre = 6 × côté.", `6 × ${R}.`), solution: `Côté = ${R} cm ; périmètre = 6 × ${R} = ${6 * R} cm.` };
    if (k === 2) return { statement: "Quelle est la mesure (en °) de l'angle au centre qui intercepte un côté d'un hexagone régulier ?", answer: num(60, 0, "°"), hints: H("Le tour complet vaut 360°.", "Six côtés égaux.", "360 ÷ 6.", "60."), solution: "360° ÷ 6 = 60°." };
    if (k === 3) return { statement: "Quelle est la mesure (en °) de l'angle au centre qui intercepte un côté d'un octogone régulier ?", answer: num(45, 0, "°"), hints: H("Le tour complet vaut 360°.", "Huit côtés égaux.", "360 ÷ 8.", "45."), solution: "360° ÷ 8 = 45°." };
    return { statement: "Quelle est la somme des mesures des angles (intérieurs) d'un octogone régulier (en °) ?", answer: num(1080, 0, "°"), hints: H("On découpe l'octogone en triangles.", "Il y en a 6.", "6 × 180.", "1 080."), solution: "Un octogone se découpe en 6 triangles : 6 × 180° = 1 080°." };
  }, [{ id: "regulier", label: "Polygone régulier" }]),

  // ===== Chapitre 9 : Prisme droit, pyramide =====
  mk("prisme-denombrer", "Prisme droit", 2, { skill: "Faces, arêtes, sommets d'un prisme droit ou d'une pyramide", ref: `${BOOK}, chap. 9 §1.1 (p. 116) et §2.1, ex. 9, 16 (p. 119-122)`, kw: ["prisme droit", "pyramide", "faces", "arêtes", "sommets", "base"] }, (_c, r) => {
    const n = int(r, 3, 8);
    const prisme = int(r, 0, 1) === 0;
    const q = int(r, 0, 2);
    const nm = prisme ? `un prisme droit dont la base a ${n} côtés` : `une pyramide dont la base a ${n} côtés`;
    const v = prisme ? [n + 2, 3 * n, 2 * n][q] : [n + 1, 2 * n, n + 1][q];
    const what = ["faces", "arêtes", "sommets"][q];
    const why = prisme
      ? [`${n} faces latérales et 2 bases : ${n + 2}.`, `${n} arêtes pour chaque base et ${n} arêtes latérales : ${3 * n}.`, `${n} sommets par base : ${2 * n}.`][q]
      : [`${n} faces latérales et 1 base : ${n + 1}.`, `${n} arêtes de la base et ${n} arêtes latérales : ${2 * n}.`, `${n} sommets de la base et le sommet de la pyramide : ${n + 1}.`][q];
    return { statement: `Combien de ${what} possède ${nm} ?`, answer: num(v), hints: H("On décrit le solide.", prisme ? "Un prisme droit a deux bases superposables et des faces latérales rectangulaires." : "Une pyramide a une base et des faces latérales triangulaires qui ont un sommet commun.", "Compte base par base.", "Fais un petit dessin."), solution: why };
  }, [{ id: "denombrement", label: "Dénombrement" }]),
  mk("prisme-volume", "Prisme droit", 2, { skill: "Volume d'un prisme droit : V = aire de la base × hauteur", ref: `${BOOK}, chap. 9 §1.3, ex. 1.e-1.f (p. 118) et ex. 10-12 (p. 122)`, kw: ["volume", "prisme droit", "aire de la base", "hauteur"] }, (c, r) => {
    const t = int(r, 0, 2);
    const h = int(r, 3, 12);
    if (t === 0) { const b = 2 * int(r, 2, 8), ht = int(r, 2, 9), B = (b * ht) / 2; return { statement: c === "pur" ? `Un prisme droit a pour base un triangle de base ${b} cm et de hauteur ${ht} cm. La hauteur du prisme est ${h} cm. Calcule son volume (en cm³).` : `Une tente a la forme d'un prisme droit dont la base est un triangle de ${b} m de base et ${ht} m de hauteur. Sa longueur est ${h} m. Quel est son volume (en m³) ?`, answer: num(B * h), hints: H("V = aire de la base × hauteur du prisme.", `Aire de la base triangulaire : ${b} × ${ht} ÷ 2 = ${B}.`, `${B} × ${h}.`, "Unité : cube."), solution: `B = ${b} × ${ht} ÷ 2 = ${B} ; V = ${B} × ${h} = ${B * h}.` }; }
    if (t === 1) { const a = int(r, 2, 6), b = a + int(r, 1, 5), hh = int(r, 2, 6), B = ((a + b) * hh) / 2; return { statement: `Un prisme droit de hauteur ${h} cm a pour base un trapèze de bases ${a} cm et ${b} cm et de hauteur ${hh} cm. Calcule son volume (en cm³).`, answer: num(B * h), hints: H("V = aire de la base × hauteur.", `Aire du trapèze : (${a} + ${b}) × ${hh} ÷ 2 = ${B}.`, `${B} × ${h}.`, "Calcule."), solution: `B = (${a} + ${b}) × ${hh} ÷ 2 = ${B} ; V = ${B} × ${h} = ${B * h} cm³.` }; }
    const B = int(r, 4, 30);
    return { statement: `Un prisme droit de volume ${B * h} cm³ a une base d'aire ${B} cm². Quelle est sa hauteur (en cm) ?`, answer: num(h), hints: H("V = B × h.", "h = V ÷ B.", `${B * h} ÷ ${B}.`, "Calcule."), solution: `h = ${B * h} ÷ ${B} = ${h} cm.` };
  }),
  mk("prisme-aire", "Prisme droit", 3, { skill: "Aire latérale et aire totale d'un prisme droit", ref: `${BOOK}, chap. 9 §1.4, ex. 1.g (p. 118-119) et ex. 10-11 (p. 122)`, kw: ["aire latérale", "aire totale", "prisme droit", "périmètre de la base"] }, (_c, r) => {
    const a = 3 * int(r, 1, 4), b = 4 * int(r, 1, 4), cc = Math.round(Math.sqrt(a * a + b * b));
    const ok = a * a + b * b === cc * cc;
    const ba = ok ? a : 3, bb = ok ? b : 4, bc = ok ? cc : 5;
    const h = int(r, 2, 10);
    const per = ba + bb + bc, Aire = (ba * bb) / 2;
    const lat = per * h;
    if (int(r, 0, 1) === 0) return { statement: `Un prisme droit a pour base un triangle rectangle de côtés ${ba} cm, ${bb} cm et ${bc} cm. Sa hauteur est ${h} cm. Calcule son aire latérale (en cm²).`, answer: num(lat), hints: H("L'aire latérale est la somme des aires des faces latérales (rectangles).", "Chaque rectangle a pour dimensions un côté de la base et la hauteur.", "Aire latérale = périmètre de la base × hauteur.", `${ba} + ${bb} + ${bc} = ${per}.`), solution: `Périmètre de la base : ${per} cm ; aire latérale = ${per} × ${h} = ${lat} cm².` };
    return { statement: `Un prisme droit a pour base un triangle rectangle de côtés ${ba} cm, ${bb} cm et ${bc} cm. Sa hauteur est ${h} cm. Calcule son aire totale (en cm²).`, answer: num(lat + 2 * Aire), hints: H("L'aire totale est la somme de l'aire latérale et des aires des deux bases.", `Aire latérale : ${per} × ${h} = ${lat}.`, `Aire d'une base : ${ba} × ${bb} ÷ 2 = ${Aire}.`, `${lat} + 2 × ${Aire}.`), solution: `Aire latérale ${lat} ; deux bases : 2 × ${Aire} = ${2 * Aire} ; total ${lat + 2 * Aire} cm².` };
  }, [{ id: "aire", label: "Aires" }]),
);
void f; void who; void shuffle;
