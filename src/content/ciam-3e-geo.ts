// CIAM 3ème : activités géométriques (chap. 1 à 9). Les démonstrations et tracés ne se corrigent pas
// automatiquement : on travaille ici les propriétés, les mesures et les calculs qui s'y appuient.
import { choice, fr, gcd, int, num, pick, register, round, Rng } from "./core";
import { ciam, f, H, Item, QCM, qcmOf, sup } from "./ciam-kit";

const mk = ciam("3e", "ciam3");
const BOOK = "CIAM 3ème";
const rnd = (r: Rng) => (int(r, 0, 1) === 0 ? -1 : 1);
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const FR = [{ id: "calcul", label: "Calcul" }];
const SIT = [{ id: "pur", label: "Calcul direct" }, { id: "situation", label: "En situation" }];
const PI = 3.14;
const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [20, 21, 29]];
const lin = (a: number, b: number, v = "x") => {
  const t1 = a === 0 ? "" : a === 1 ? v : a === -1 ? `−${v}` : `${a < 0 ? "−" : ""}${Math.abs(a)}${v}`;
  if (b === 0) return t1 || "0";
  return t1 ? `${t1} ${b < 0 ? "−" : "+"} ${Math.abs(b)}` : `${b < 0 ? "−" : ""}${Math.abs(b)}`;
};
/** Équation de droite px + qy + r = 0 écrite proprement. */
const eqn = (p: number, q: number, rr: number) => {
  const parts: string[] = [];
  const push = (c: number, v: string) => { if (c === 0) return; const body = v === "" ? String(Math.abs(c)) : `${Math.abs(c) === 1 ? "" : Math.abs(c)}${v}`; parts.push(parts.length === 0 ? `${c < 0 ? "−" : ""}${body}` : `${c < 0 ? "−" : "+"} ${body}`); };
  push(p, "x"); push(q, "y"); push(rr, "");
  return `${parts.join(" ")} = 0`;
};
const vec = (x: number, y: number) => `(${n2(x)} ; ${n2(y)})`;

register(
  // ===== Chapitre 1 : Propriété de Thalès =====
  mk("thales-calcul", "Propriétés de Thalès dans un triangle", 2, { skill: "Théorème de Thalès : calculer une longueur", ref: `${BOOK}, chap. 1 §1.1 et ex. 1 (p. 8, 17)`, kw: ["thalès", "droites parallèles", "proportionnalité", "AM/AB", "triangle"] }, (c, r) => {
    const k = pick(r, [2, 3, 4]), AM = int(r, 2, 8), AB = AM * k, AN = int(r, 2, 8), AC = AN * k;
    const BC = int(r, 3, 12) * k, MN = BC / k;
    const t = int(r, 0, 2);
    const stmt = (q: string) => c === "pur" ? `Dans le triangle ABC, M ∈ [AB] et N ∈ [AC] avec (MN) ∥ (BC). ${q}` : `Sur un terrain triangulaire ABC, une clôture (MN) parallèle à (BC) coupe [AB] en M et [AC] en N. ${q}`;
    if (t === 0) return { statement: stmt(`AB = ${AB}, AM = ${AM}, AC = ${AC}. Calcule AN.`), answer: num(AN), hints: H("On applique le théorème de Thalès.", "AM/AB = AN/AC = MN/BC.", `${AM}/${AB} = AN/${AC}.`, `AN = ${AM} × ${AC} ÷ ${AB}.`), solution: `AM/AB = AN/AC ⇒ AN = ${AM} × ${AC} ÷ ${AB} = ${AN}.` };
    if (t === 1) return { statement: stmt(`AM = ${AM}, AB = ${AB}, BC = ${BC}. Calcule MN.`), answer: num(MN), hints: H("On applique le théorème de Thalès.", "AM/AB = MN/BC.", `${AM}/${AB} = MN/${BC}.`, `MN = ${AM} × ${BC} ÷ ${AB}.`), solution: `AM/AB = MN/BC ⇒ MN = ${AM} × ${BC} ÷ ${AB} = ${MN}.` };
    return { statement: stmt(`AN = ${AN}, AC = ${AC}, AB = ${AB}. Calcule AM.`), answer: num(AM), hints: H("On applique le théorème de Thalès.", "AM/AB = AN/AC.", `AM/${AB} = ${AN}/${AC}.`, `AM = ${AB} × ${AN} ÷ ${AC}.`), solution: `AM = ${AB} × ${AN} ÷ ${AC} = ${AM}.` };
  }, SIT),
  mk("thales-reciproque", "Propriétés de Thalès dans un triangle", 3, { skill: "Réciproque de Thalès : les droites sont-elles parallèles ?", ref: `${BOOK}, chap. 1 §1.2, ex. 1.b (p. 9-10) et ex. 2-3 (p. 17)`, kw: ["réciproque de thalès", "parallèles", "égalité des rapports", "même position"] }, (_c, r) => {
    const [p, q] = pick(r, [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5]]);
    const m = int(r, 1, 4), n = int(r, 1, 4);
    const AB = q * m, AM = p * m, AC = q * n;
    const par = int(r, 0, 1) === 0;
    const AN = par ? p * n : p * n + int(r, 1, 2);
    return { statement: `Dans le triangle ABC, M ∈ [AB] et N ∈ [AC] avec AB = ${AB}, AM = ${AM}, AC = ${AC}, AN = ${AN}. Les droites (MN) et (BC) sont-elles parallèles ?`, answer: choice(r, ["Oui", "Non"], par ? 0 : 1), hints: H("On compare les rapports AM/AB et AN/AC.", "Si les rapports sont égaux (et M, N placés dans le même ordre), les droites sont parallèles.", `AM × AC = ${AM * AC} et AN × AB = ${AN * AB}.`, "Compare."), solution: `AM × AC = ${AM * AC} ; AN × AB = ${AN * AB} : ${par ? "égaux, donc AM/AB = AN/AC et (MN) ∥ (BC)" : "différents, donc (MN) n'est pas parallèle à (BC)"}.` };
  }, QCM),
  mk("thales-quatrieme", "Propriétés de Thalès dans un triangle", 2, { skill: "Quatrième proportionnelle et produit en croix", ref: `${BOOK}, chap. 1 §2.1, ex. 2.a (p. 11-12)`, kw: ["quatrième proportionnelle", "produit en croix", "a/b = c/x", "proportion"] }, (_c, r) => {
    let a = int(r, 2, 9), b = int(r, 2, 9);
    const c = int(r, 2, 9);
    if (a === b) b = a + 1;
    const x = round((b * c) / a, 4);
    return { statement: `Quelle est la quatrième proportionnelle x des nombres ${a}, ${b} et ${c} (dans cet ordre) : ${a}/${b} = ${c}/x ? (arrondie au centième)`, answer: num(round(x, 2), 0.01), hints: H("On cherche x tel que a/b = c/x.", "Produit en croix : a × x = b × c.", `x = ${b} × ${c} ÷ ${a}.`, "Calcule."), solution: `${a} × x = ${b} × ${c} ⇒ x = ${b * c} ÷ ${a} ≈ ${fr(round(x, 2))}.` };
  }, FR),
  mk("thales-consequence", "Propriétés de Thalès dans un triangle", 3, { skill: "Conséquence de Thalès : MM'/BC = AM/AB", ref: `${BOOK}, chap. 1 §1.3, ex. 1.c-1.e (p. 10-11) et ex. 6-7 (p. 17)`, kw: ["thalès", "conséquence", "triangle", "BC", "AM/AB"] }, (_c, r) => {
    const AM = int(r, 3, 9), AB = int(r, AM + 2, 16), BC = int(r, 4, 14);
    const MN = (AM * BC) / AB;
    return { statement: `Dans un triangle ABC, la parallèle à (BC) passant par M ∈ [AB] coupe (AC) en N. AM = ${AM}, AB = ${AB} et BC = ${BC}. Calcule MN (arrondi au centième).`, answer: num(round(MN, 2), 0.01), hints: H("On utilise la conséquence du théorème de Thalès.", "MN/BC = AM/AB.", `MN = BC × AM ÷ AB.`, `${BC} × ${AM} ÷ ${AB}.`), solution: `MN = ${BC} × ${AM} ÷ ${AB} ≈ ${fr(round(MN, 2))}.` };
  }, FR),
  mk("thales-distances", "Propriétés de Thalès dans un triangle", 3, { skill: "Droites parallèles et segments proportionnels (cas général)", ref: `${BOOK}, chap. 1 §4, exemples 1-2 (p. 16) et ex. 16-17 (p. 18)`, kw: ["cas général", "droites parallèles", "segments proportionnels", "échelle", "AB/A'B'"] }, (c, r) => {
    const k = pick(r, [2, 3, 5]), AB = int(r, 2, 8), BC = int(r, 2, 8), ABp = AB * k, BCp = BC * k;
    const t = c === "situation" ? 1 : 0;
    if (t === 0) return { statement: `Trois droites parallèles coupent deux sécantes. Sur la première : AB = ${AB} et BC = ${BC}. Sur la seconde : A'B' = ${ABp}. Calcule B'C'.`, answer: num(BCp), hints: H("Des droites parallèles découpent des segments proportionnels.", "AB/A'B' = BC/B'C'.", `${AB}/${ABp} = ${BC}/B'C'.`, `B'C' = ${BC} × ${ABp} ÷ ${AB}.`), solution: `AB/A'B' = BC/B'C' ⇒ B'C' = ${BC} × ${ABp} ÷ ${AB} = ${BCp}.` };
    return { statement: `Les barreaux d'une échelle sont parallèles. Sur un montant, deux barreaux consécutifs sont séparés de ${AB} cm et ${BC} cm ; sur l'autre montant, le premier écart est ${ABp} cm. Quel est le second écart (en cm) ?`, answer: num(BCp), hints: H("Les barreaux parallèles découpent des segments proportionnels.", `Rapport : ${ABp} ÷ ${AB} = ${k}.`, `Second écart : ${BC} × ${k}.`, "Calcule."), solution: `Rapport ${k} ; ${BC} × ${k} = ${BCp} cm.` };
  }, SIT),
  mk("semblables-proprietes", "Triangles semblables", 2, { skill: "Triangles semblables : côtés proportionnels et angles égaux", ref: `${BOOK}, chap. 1 §3, propriétés (p. 14-15) et ex. 3.a-3.b`, kw: ["triangles semblables", "côtés homologues", "angles égaux", "rapport de similitude"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Deux triangles sont semblables. Que peut-on dire de leurs côtés ?", good: "Ils sont deux à deux proportionnels", bad: ["Ils sont égaux deux à deux", "Ils sont perpendiculaires", "Ils n'ont aucun lien"], why: "Si deux triangles sont semblables, alors leurs côtés sont deux à deux proportionnels." },
      { q: "Deux triangles sont semblables. Que peut-on dire de leurs angles ?", good: "Ils sont deux à deux de même mesure", bad: ["Ils sont supplémentaires", "Ils ont la même somme mais des mesures différentes", "Ils sont complémentaires"], why: "Si deux triangles sont semblables, alors leurs angles sont deux à deux de même mesure." },
      { q: "Deux triangles ont leurs angles deux à deux de même mesure. Que peut-on dire ?", good: "Ils sont semblables", bad: ["Ils sont superposables", "Ils sont isocèles", "Ils sont rectangles"], why: "Si deux triangles ont leurs angles deux à deux de même mesure, alors ils sont semblables." },
      { q: "Deux triangles ont leurs côtés deux à deux proportionnels. Que peut-on dire ?", good: "Ils sont semblables", bad: ["Ils sont superposables", "Ils sont équilatéraux", "Ils ont même aire"], why: "Si deux triangles ont leurs côtés deux à deux proportionnels, alors ils sont semblables." },
      { q: "Deux triangles équilatéraux sont-ils toujours semblables ?", good: "Oui", bad: ["Non, jamais", "Seulement s'ils ont le même périmètre", "Seulement s'ils sont superposables"], why: "Deux triangles équilatéraux ont tous leurs angles de 60° : ils sont semblables." },
      { q: "Deux triangles rectangles isocèles sont-ils toujours semblables ?", good: "Oui", bad: ["Non, jamais", "Seulement s'ils ont la même hypoténuse", "Seulement s'ils sont superposables"], why: "Leurs angles sont 90°, 45°, 45° : ils sont semblables." },
    ];
    return qcmOf(r, pool, "Pense aux angles et au rapport des côtés.");
  }, QCM),
  mk("semblables-calcul", "Triangles semblables", 3, { skill: "Triangles semblables : calculer un côté", ref: `${BOOK}, chap. 1 §3.1 et ex. 11-15 (p. 17-18)`, kw: ["triangles semblables", "côtés homologues", "rapport", "calcul"] }, (_c, r) => {
    const k = pick(r, [2, 3, 4]), a = int(r, 3, 9), b = int(r, 3, 9), cc = int(r, 3, 9);
    const t = int(r, 0, 2);
    return { statement: `Les triangles ABC et DEF sont semblables avec AB = ${a}, BC = ${b}, CA = ${cc}, et DE = ${a * k} (côté homologue de AB). Calcule ${["EF", "FD", "le rapport DE/AB"][t]}.`, answer: num([b * k, cc * k, k][t]), hints: H("Les côtés homologues sont proportionnels.", `Rapport = DE/AB = ${a * k}/${a} = ${k}.`, t === 2 ? "Le rapport est DE ÷ AB." : "Multiplie le côté correspondant par le rapport.", "Calcule."), solution: `Rapport ${k} ; ${["EF = " + b + " × " + k, "FD = " + cc + " × " + k, "DE/AB = " + k][t]} = ${[b * k, cc * k, k][t]}.` };
  }, FR),

  // ===== Chapitre 2 : Triangle rectangle, trigonométrie =====
  mk("trigo-pythagore", "Triangle rectangle", 2, { skill: "Pythagore avec des racines carrées", ref: `${BOOK}, chap. 2 §1.1-1.2, ex. 1.a (p. 22-23) et ex. 1-7 (p. 31)`, kw: ["pythagore", "hypoténuse", "triangle rectangle", "carré", "hauteur triangle équilatéral"] }, (c, r) => {
    const [a, b, h] = pick(r, TRIPLES);
    const t = int(r, 0, 2);
    void c;
    if (t === 0) return { statement: `ABC est rectangle en A avec AB = ${a} et AC = ${b}. Calcule BC.`, answer: num(h), hints: H("On applique Pythagore.", "BC² = AB² + AC².", `${a * a} + ${b * b}.`, "Racine carrée."), solution: `BC² = ${a * a} + ${b * b} = ${h * h} ; BC = ${h}.` };
    if (t === 1) return { statement: `ABC est rectangle en A avec BC = ${h} et AB = ${a}. Calcule AC.`, answer: num(b), hints: H("On applique Pythagore.", "AC² = BC² − AB².", `${h * h} − ${a * a}.`, "Racine carrée."), solution: `AC² = ${h * h} − ${a * a} = ${b * b} ; AC = ${b}.` };
    const s = int(r, 2, 10);
    return { statement: `ABC est un triangle équilatéral de côté ${2 * s} cm et H le milieu de [BC]. Calcule AH² (en cm²).`, answer: num(3 * s * s), hints: H("Dans le triangle rectangle ABH : AH² = AB² − BH².", `AB = ${2 * s} et BH = ${s}.`, `${4 * s * s} − ${s * s}.`, "Calcule."), solution: `AH² = ${(2 * s) ** 2} − ${s * s} = ${3 * s * s}, donc AH = ${s}√3 cm.` };
  }, FR),
  mk("trigo-definitions", "Triangle rectangle", 1, { skill: "Cosinus, sinus, tangente : définitions", ref: `${BOOK}, chap. 2 §2.1 et §3 (p. 23-27)`, kw: ["cosinus", "sinus", "tangente", "côté adjacent", "côté opposé", "hypoténuse"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Dans un triangle rectangle, le cosinus d'un angle aigu est le quotient…", good: "du côté adjacent par l'hypoténuse", bad: ["du côté opposé par l'hypoténuse", "du côté opposé par le côté adjacent", "de l'hypoténuse par le côté adjacent"], why: "cos = côté adjacent / hypoténuse." },
      { q: "Dans un triangle rectangle, le sinus d'un angle aigu est le quotient…", good: "du côté opposé par l'hypoténuse", bad: ["du côté adjacent par l'hypoténuse", "du côté opposé par le côté adjacent", "de l'hypoténuse par le côté opposé"], why: "sin = côté opposé / hypoténuse." },
      { q: "Dans un triangle rectangle, la tangente d'un angle aigu est le quotient…", good: "du côté opposé par le côté adjacent", bad: ["du côté adjacent par le côté opposé", "du côté opposé par l'hypoténuse", "du côté adjacent par l'hypoténuse"], why: "tan = côté opposé / côté adjacent." },
      { q: "Que vaut cos²a + sin²a pour un angle aigu a ?", good: "1", bad: ["0", "2", "tan a"], why: "cos²a + sin²a = 1." },
      { q: "Que vaut tan a en fonction de sin a et cos a ?", good: "sin a / cos a", bad: ["cos a / sin a", "sin a × cos a", "sin a + cos a"], why: "tan a = sin a / cos a." },
      { q: "Si a et b sont deux angles complémentaires, que peut-on dire de sin a et cos b ?", good: "sin a = cos b", bad: ["sin a = sin b", "sin a = −cos b", "sin a + cos b = 1"], why: "Le sinus d'un angle est égal au cosinus de son complémentaire." },
      { q: "Si a et b sont complémentaires, que vaut tan a × tan b ?", good: "1", bad: ["0", "tan(a + b)", "−1"], why: "Les tangentes de deux angles complémentaires sont inverses l'une de l'autre." },
    ];
    return qcmOf(r, pool, "SOH-CAH-TOA : opposé, adjacent, hypoténuse.");
  }, QCM),
  mk("trigo-valeurs", "Triangle rectangle", 2, { skill: "Valeurs de cos, sin, tan de 30°, 45°, 60°", ref: `${BOOK}, chap. 2 §2.4 et ex. 3.c (p. 25-27)`, kw: ["30°", "45°", "60°", "valeurs particulières", "cosinus", "sinus", "tangente"] }, (_c, r) => {
    const vals: { q: string; v: number; w: string }[] = [
      { q: "sin 30°", v: 0.5, w: "sin 30° = 1/2" }, { q: "cos 60°", v: 0.5, w: "cos 60° = 1/2" }, { q: "tan 45°", v: 1, w: "tan 45° = 1" },
      { q: "sin 90°", v: 1, w: "sin 90° = 1" }, { q: "cos 90°", v: 0, w: "cos 90° = 0" },
    ];
    const it = pick(r, vals);
    return { statement: `Quelle est la valeur de ${it.q} ?`, answer: num(it.v), hints: H("On utilise les valeurs particulières.", "sin 30° = cos 60° = 1/2 ; tan 45° = 1.", "Pense aux triangles remarquables.", "Recopie la valeur."), solution: `${it.w}.` };
  }, FR),
  mk("trigo-calcul-cote", "Triangle rectangle", 2, { skill: "Calculer un côté avec cos, sin ou tan", ref: `${BOOK}, chap. 2 §4.3, ex. 4.c (p. 30) et ex. 13-19 (p. 31-32)`, kw: ["cosinus", "sinus", "tangente", "calculer un côté", "triangle rectangle", "angle"] }, (c, r) => {
    const hyp = int(r, 5, 25), ang = pick(r, [30, 45, 60]);
    const cs = { 30: [Math.sqrt(3) / 2, 0.5, 1 / Math.sqrt(3)], 45: [Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1], 60: [0.5, Math.sqrt(3) / 2, Math.sqrt(3)] }[ang as 30 | 45 | 60];
    const t = int(r, 0, 1);
    void c;
    if (t === 0) return { statement: `Dans un triangle rectangle d'hypoténuse ${hyp} cm, un angle aigu mesure ${ang}°. Quelle est la longueur du côté opposé à cet angle (en cm, arrondie au centième) ?`, answer: num(round(hyp * cs[1], 2), 0.01), hints: H("Côté opposé et hypoténuse : on utilise le sinus.", `sin ${ang}° = côté opposé / ${hyp}.`, `côté opposé = ${hyp} × sin ${ang}°.`, "Calcule."), solution: `côté opposé = ${hyp} × sin ${ang}° ≈ ${fr(round(hyp * cs[1], 2))} cm.` };
    return { statement: `Dans un triangle rectangle d'hypoténuse ${hyp} cm, un angle aigu mesure ${ang}°. Quelle est la longueur du côté adjacent à cet angle (en cm, arrondie au centième) ?`, answer: num(round(hyp * cs[0], 2), 0.01), hints: H("Côté adjacent et hypoténuse : on utilise le cosinus.", `cos ${ang}° = côté adjacent / ${hyp}.`, `côté adjacent = ${hyp} × cos ${ang}°.`, "Calcule."), solution: `côté adjacent = ${hyp} × cos ${ang}° ≈ ${fr(round(hyp * cs[0], 2))} cm.` };
  }, SIT),
  mk("trigo-complementaires", "Triangle rectangle", 2, { skill: "Sinus et cosinus : relations et angles complémentaires", ref: `${BOOK}, chap. 2 §2.2-2.3, ex. 2.d-2.f (p. 25) et ex. 11-12 (p. 31)`, kw: ["cos² + sin² = 1", "complémentaires", "sinus", "cosinus", "calculer"] }, (_c, r) => {
    const [num_, den] = pick(r, [[3, 5], [5, 13], [8, 17], [4, 5], [12, 13], [15, 17]]);
    const other = Math.round(Math.sqrt(den * den - num_ * num_));
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Le sinus d'un angle aigu a est ${num_}/${den}. Quel est son cosinus ? Donne le numérateur du résultat écrit avec le dénominateur ${den}.`, answer: num(other), hints: H("cos²a + sin²a = 1.", `cos²a = 1 − (${num_}/${den})².`, `cos²a = ${other * other}/${den * den}.`, "Prends la racine positive."), solution: `cos²a = 1 − ${num_ * num_}/${den * den} = ${other * other}/${den * den}, donc cos a = ${other}/${den}.` };
    return { statement: `Dans un triangle ABC rectangle en B, cos Â = ${num_}/${den}. Que vaut sin Ĉ ? Donne le numérateur du résultat écrit avec le dénominateur ${den}.`, answer: num(num_), hints: H("Â et Ĉ sont complémentaires.", "sin Ĉ = cos Â.", "On recopie.", `${num_}/${den}.`), solution: `Â et Ĉ sont complémentaires : sin Ĉ = cos Â = ${num_}/${den}.` };
  }, FR),
  mk("trigo-pente", "Triangle rectangle", 3, { skill: "Tangente, pente d'une route et hauteur d'un point", ref: `${BOOK}, chap. 2, ex. 26-27, 36-38 (p. 32-33)`, kw: ["pente", "tangente", "route", "hauteur", "angle", "pourcentage"] }, (_c, r) => {
    const p = pick(r, [6, 8, 10, 12, 15, 17]), L = pick(r, [100, 200, 250, 500, 1000]);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Une route a une pente de ${p} % : elle monte de ${p} m pour 100 m parcourus horizontalement. Quelle est la tangente de l'angle de la route avec l'horizontale ?`, answer: num(p / 100, 0.0001), hints: H("La pente est le quotient dénivelé / distance horizontale.", `tan = ${p}/100.`, "C'est un nombre décimal.", "Divise."), solution: `tan = ${p} ÷ 100 = ${fr(p / 100)}.` };
    return { statement: `Une route a une pente de ${p} %. De quelle hauteur (en m) s'élève-t-on sur ${L} m parcourus horizontalement ?`, answer: num((p * L) / 100, 0.01), hints: H("Pente en % = dénivelé / distance horizontale × 100.", `Dénivelé = ${p} % de ${L}.`, `${L} × ${p} ÷ 100.`, "Calcule."), solution: `${L} × ${p} ÷ 100 = ${fr((p * L) / 100)} m.` };
  }, FR),

  // ===== Chapitre 3 : Vecteurs =====
  mk("vec-colineaires", "Vecteurs", 3, { skill: "Vecteurs colinéaires et alignement", ref: `${BOOK}, chap. 3 §3.1-3.2, ex. 3.a-3.c (p. 41-42) et ex. 14-17 (p. 45)`, kw: ["colinéaires", "même direction", "AB = k CD", "alignés", "vecteur"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Deux vecteurs non nuls AB et CD ont même direction. Que peut-on dire ?", good: "Il existe un réel k non nul tel que AB = k CD", bad: ["AB = CD", "AB et CD ont même longueur", "AB et CD sont perpendiculaires"], why: "AB et CD ont même direction équivaut à : AB = k CD pour un réel k non nul." },
      { q: "A, B et M sont alignés avec A ≠ B. Que peut-on dire ?", good: "AM = k AB pour un réel k", bad: ["AM = AB", "AM = −AB", "M est le milieu de [AB]"], why: "M ∈ (AB) équivaut à : AM et AB sont colinéaires, soit AM = k AB." },
      { q: "On a AB = 3 CD. Que peut-on dire des droites (AB) et (CD) ?", good: "Elles sont parallèles ou confondues", bad: ["Elles sont perpendiculaires", "Elles sont sécantes", "On ne peut rien dire"], why: "AB = 3 CD : les vecteurs ont même direction, donc (AB) ∥ (CD)." },
      { q: "I est le milieu de [AB]. Quelle égalité vectorielle est vraie ?", good: "AB = 2 AI", bad: ["AB = AI", "AI = 2 AB", "AB = 3 AI"], why: "I milieu de [AB] équivaut à AB = 2 AI." },
      { q: "Deux vecteurs sont orthogonaux lorsque…", good: "ce sont des vecteurs directeurs de deux droites perpendiculaires", bad: ["ils ont même direction", "ils ont même longueur", "leur somme est nulle"], why: "Deux vecteurs non nuls sont orthogonaux lorsqu'ils sont des vecteurs directeurs de deux droites perpendiculaires." },
    ];
    return qcmOf(r, pool, "Pense à la direction.");
  }, QCM),
  mk("vec-k", "Vecteurs", 3, { skill: "Écrire un vecteur en fonction d'un autre : AB = k CD", ref: `${BOOK}, chap. 3, ex. 12-13 (p. 45) et ex. 3.a`, kw: ["vecteur", "colinéaires", "k", "exprimer en fonction"] }, (_c, r) => {
    const a = int(r, 2, 6), b = int(r, 2, 6);
    const k = (a / b);
    const flip = int(r, 0, 1) === 1;
    void flip;
    return { statement: `On donne ${a} AB = ${b} CD (vecteurs, AB ≠ 0). On écrit AB = k CD. Quelle est la valeur de k (arrondie au centième) ?`, answer: num(round(b / a, 2), 0.01), hints: H("On isole AB.", "Divise les deux membres par " + a + ".", `AB = (${b}/${a}) CD.`, "Calcule k."), solution: `AB = (${b}/${a}) CD donc k = ${fr(round(b / a, 2))}.` };
  }, FR),

  // ===== Chapitre 4 : Coordonnées d'un vecteur =====
  mk("coord-vecteur", "Coordonnées d'un vecteur", 2, { skill: "Coordonnées d'un vecteur AB", ref: `${BOOK}, chap. 4 §3.1, ex. 3.a-3.c (p. 53-54) et ex. 9-11 (p. 56)`, kw: ["coordonnées d'un vecteur", "AB", "xB − xA", "yB − yA"] }, (c, r) => {
    const xa = rnd(r) * int(r, 0, 9), ya = rnd(r) * int(r, 0, 9), xb = rnd(r) * int(r, 0, 9), yb = rnd(r) * int(r, 0, 9);
    const askX = int(r, 0, 1) === 0;
    void c;
    return { statement: `Dans un repère, A(${n2(xa)} ; ${n2(ya)}) et B(${n2(xb)} ; ${n2(yb)}). Quelle est ${askX ? "la première" : "la deuxième"} coordonnée du vecteur AB ?`, answer: num(askX ? xb - xa : yb - ya), hints: H("AB (x_B − x_A ; y_B − y_A).", askX ? `x_B − x_A = ${n2(xb)} − ${par(xa)}.` : `y_B − y_A = ${n2(yb)} − ${par(ya)}.`, "Attention aux signes.", "Calcule."), solution: `AB ${vec(xb - xa, yb - ya)} : ${askX ? "première" : "deuxième"} coordonnée ${n2(askX ? xb - xa : yb - ya)}.` };
  }, FR),
  mk("coord-milieu", "Coordonnées d'un vecteur", 2, { skill: "Coordonnées du milieu d'un segment", ref: `${BOOK}, chap. 4 §3.2, ex. 3.d-3.e (p. 54) et ex. 15-16 (p. 57)`, kw: ["milieu", "coordonnées", "(xA + xB)/2", "symétrique"] }, (_c, r) => {
    const xa = rnd(r) * int(r, 0, 9), ya = rnd(r) * int(r, 0, 9), xb = xa + 2 * int(r, -4, 4), yb = ya + 2 * int(r, -4, 4);
    const askX = int(r, 0, 1) === 0;
    const sym = int(r, 0, 1) === 0;
    if (sym) return { statement: `A(${n2(xa)} ; ${n2(ya)}) et B(${n2(xb)} ; ${n2(yb)}). C est le symétrique de A par rapport à B. Quelle est ${askX ? "l'abscisse" : "l'ordonnée"} de C ?`, answer: num(askX ? 2 * xb - xa : 2 * yb - ya), hints: H("B est le milieu de [AC].", "x_B = (x_A + x_C)/2.", askX ? `x_C = 2 x_B − x_A.` : `y_C = 2 y_B − y_A.`, "Calcule."), solution: `C (${n2(2 * xb - xa)} ; ${n2(2 * yb - ya)}).` };
    return { statement: `A(${n2(xa)} ; ${n2(ya)}) et B(${n2(xb)} ; ${n2(yb)}). Quelle est ${askX ? "l'abscisse" : "l'ordonnée"} du milieu de [AB] ?`, answer: num(askX ? (xa + xb) / 2 : (ya + yb) / 2), hints: H("Les coordonnées du milieu sont les moyennes.", askX ? "(x_A + x_B) ÷ 2." : "(y_A + y_B) ÷ 2.", `${n2(askX ? xa : ya)} + ${par(askX ? xb : yb)}.`, "Divise par 2."), solution: `Milieu (${n2((xa + xb) / 2)} ; ${n2((ya + yb) / 2)}).` };
  }, FR),
  mk("coord-distance", "Coordonnées d'un vecteur", 3, { skill: "Distance de deux points dans un repère orthonormé", ref: `${BOOK}, chap. 4 §3.3, ex. 3.f-3.g (p. 55) et ex. 17-19 (p. 57)`, kw: ["distance", "repère orthonormé", "√((xB−xA)²+(yB−yA)²)", "AB"] }, (_c, r) => {
    const [a, b, h] = pick(r, TRIPLES.slice(0, 6));
    const xa = rnd(r) * int(r, 0, 5), ya = rnd(r) * int(r, 0, 5);
    const sx = rnd(r), sy = rnd(r);
    const xb = xa + sx * a, yb = ya + sy * b;
    return { statement: `Dans un repère orthonormé, A(${n2(xa)} ; ${n2(ya)}) et B(${n2(xb)} ; ${n2(yb)}). Calcule la distance AB.`, answer: num(h), hints: H("AB = √((x_B − x_A)² + (y_B − y_A)²).", `x_B − x_A = ${n2(xb - xa)} et y_B − y_A = ${n2(yb - ya)}.`, `AB² = ${a * a} + ${b * b}.`, "Racine carrée."), solution: `AB² = (${n2(xb - xa)})² + (${n2(yb - ya)})² = ${a * a} + ${b * b} = ${h * h} ; AB = ${h}.` };
  }, FR),
  mk("coord-colineaires", "Coordonnées d'un vecteur", 3, { skill: "Vecteurs colinéaires : xy' − x'y = 0", ref: `${BOOK}, chap. 4 §2.1, ex. 2.a-2.b (p. 51-52) et ex. 6, 12-14 (p. 56-57)`, kw: ["colinéaires", "xy' − x'y", "coordonnées", "alignés", "déterminant"] }, (_c, r) => {
    const x = rnd(r) * int(r, 1, 6), y = rnd(r) * int(r, 1, 6), k = rnd(r) * int(r, 2, 4);
    const ok = int(r, 0, 1) === 0;
    const xp = k * x, yp = ok ? k * y : k * y + int(r, 1, 3);
    const det = x * yp - xp * y;
    return { statement: `Les vecteurs u ${vec(x, y)} et v ${vec(xp, yp)} sont-ils colinéaires ?`, answer: choice(r, ["Oui", "Non"], det === 0 ? 0 : 1), hints: H("On calcule xy' − x'y.", `x y' = ${x} × ${par(yp)} et x' y = ${par(xp)} × ${par(y)}.`, `xy' − x'y = ${det}.`, "Si c'est nul, ils sont colinéaires."), solution: `${x} × ${par(yp)} − ${par(xp)} × ${par(y)} = ${det}${det === 0 ? " : colinéaires" : " ≠ 0 : non colinéaires"}.` };
  }, QCM),
  mk("coord-orthogonaux", "Coordonnées d'un vecteur", 3, { skill: "Vecteurs orthogonaux : xx' + yy' = 0", ref: `${BOOK}, chap. 4 §2.2, ex. 2.c-2.d (p. 52-53) et ex. 7-8 (p. 56)`, kw: ["orthogonaux", "xx' + yy'", "repère orthonormé", "perpendiculaires"] }, (_c, r) => {
    const x = rnd(r) * int(r, 1, 6), y = rnd(r) * int(r, 1, 6);
    const ok = int(r, 0, 1) === 0;
    const xp = -y * (ok ? 1 : 1), yp = x * (ok ? 1 : 1) + (ok ? 0 : int(r, 1, 2));
    const dot = x * xp + y * yp;
    return { statement: `Dans un repère orthonormé, les vecteurs u ${vec(x, y)} et v ${vec(xp, yp)} sont-ils orthogonaux ?`, answer: choice(r, ["Oui", "Non"], dot === 0 ? 0 : 1), hints: H("On calcule xx' + yy'.", `${x} × ${par(xp)} + ${y} × ${par(yp)}.`, `Résultat : ${dot}.`, "Si c'est nul, ils sont orthogonaux."), solution: `${x} × ${par(xp)} + ${y} × ${par(yp)} = ${dot}${dot === 0 ? " : orthogonaux" : " ≠ 0 : non orthogonaux"}.` };
  }, QCM),
  mk("coord-somme", "Coordonnées d'un vecteur", 2, { skill: "Somme de vecteurs et produit par un nombre (coordonnées)", ref: `${BOOK}, chap. 4 §1.2-1.3, ex. 1.f-1.g (p. 50-51) et ex. 5 (p. 56)`, kw: ["somme de vecteurs", "coordonnées", "k AB", "produit par un nombre"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 9), b = rnd(r) * int(r, 1, 9), c0 = rnd(r) * int(r, 1, 9), d = rnd(r) * int(r, 1, 9), k = rnd(r) * int(r, 2, 4);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `u ${vec(a, b)} et v ${vec(c0, d)}. Quelle est la première coordonnée de u + v ?`, answer: num(a + c0), hints: H("(x ; y) + (x' ; y') = (x + x' ; y + y').", `${n2(a)} + ${par(c0)}.`, "Additionne.", "Calcule."), solution: `u + v ${vec(a + c0, b + d)}.` };
    return { statement: `u ${vec(a, b)}. Quelle est la deuxième coordonnée du vecteur ${k < 0 ? `(−${-k})` : k} u ?`, answer: num(k * b), hints: H("k (x ; y) = (kx ; ky).", `${par(k)} × ${par(b)}.`, "Applique la règle des signes.", "Calcule."), solution: `${k} u ${vec(k * a, k * b)}.` };
  }, FR),

  // ===== Chapitre 5 : Équations de droites =====
  mk("droite-appartient", "Équations de droites", 2, { skill: "Un point appartient-il à une droite d'équation donnée ?", ref: `${BOOK}, chap. 5 §2.1, ex. 2.a (p. 63) et ex. 7, 9 (p. 68)`, kw: ["équation de droite", "appartient", "point", "couple solution"] }, (_c, r) => {
    const p = int(r, 1, 5), q = rnd(r) * int(r, 1, 5), rr = rnd(r) * int(r, 1, 9);
    const x = rnd(r) * int(r, 0, 6), y = rnd(r) * int(r, 0, 6);
    const v = p * x + q * y + rr;
    return { statement: `Le point A(${n2(x)} ; ${n2(y)}) appartient-il à la droite d'équation ${eqn(p, q, rr)} ?`, answer: choice(r, ["Oui", "Non"], v === 0 ? 0 : 1), hints: H("On remplace x et y par les coordonnées de A.", `${p} × ${par(x)} + ${par(q)} × ${par(y)} + ${par(rr)}.`, `On obtient ${v}.`, "Le point est sur la droite si le résultat est 0."), solution: `${p} × ${par(x)} + ${par(q)} × ${par(y)} + ${par(rr)} = ${v}${v === 0 ? " : oui" : " ≠ 0 : non"}.` };
  }, QCM),
  mk("droite-coefficient", "Équations de droites", 2, { skill: "Coefficient directeur d'une droite (deux points)", ref: `${BOOK}, chap. 5 §2.3, ex. 2.g-2.i (p. 64-66) et ex. 14 (p. 69)`, kw: ["coefficient directeur", "pente", "(yB − yA)/(xB − xA)", "droite"] }, (_c, r) => {
    const xa = rnd(r) * int(r, 0, 6), ya = rnd(r) * int(r, 0, 6);
    const dx = rnd(r) * int(r, 1, 5), a = rnd(r) * int(r, 1, 5);
    const xb = xa + dx, yb = ya + a * dx;
    return { statement: `La droite (AB) passe par A(${n2(xa)} ; ${n2(ya)}) et B(${n2(xb)} ; ${n2(yb)}). Quel est son coefficient directeur ?`, answer: num(a), hints: H("a = (y_B − y_A) / (x_B − x_A).", `(${n2(yb)} − ${par(ya)}) / (${n2(xb)} − ${par(xa)}).`, `${n2(yb - ya)} / ${n2(xb - xa)}.`, "Divise."), solution: `a = ${n2(yb - ya)} ÷ ${par(xb - xa)} = ${n2(a)}.` };
  }, FR),
  mk("droite-equation", "Équations de droites", 3, { skill: "Trouver y = ax + b à partir de deux points", ref: `${BOOK}, chap. 5 §2.3, ex. 2.g-2.i et ex. 5-6, 17 (p. 64-69)`, kw: ["équation réduite", "y = ax + b", "ordonnée à l'origine", "deux points"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 5), b = rnd(r) * int(r, 1, 9);
    const x1 = rnd(r) * int(r, 0, 4), x2 = x1 + int(r, 1, 4);
    const askB = int(r, 0, 1) === 0;
    return { statement: `La droite (AB) passe par A(${n2(x1)} ; ${n2(a * x1 + b)}) et B(${n2(x2)} ; ${n2(a * x2 + b)}). Elle a une équation de la forme y = ax + b. Quelle est la valeur de ${askB ? "b" : "a"} ?`, answer: num(askB ? b : a), hints: H("On calcule d'abord a.", `a = (${n2(a * x2 + b)} − ${par(a * x1 + b)}) / (${n2(x2)} − ${par(x1)}).`, `a = ${n2(a)}.`, "Puis b = y_A − a x_A."), solution: `a = ${n2(a)} ; b = ${n2(a * x1 + b)} − ${par(a)} × ${par(x1)} = ${n2(b)}.` };
  }, FR),
  mk("droite-position", "Équations de droites", 3, { skill: "Droites parallèles et perpendiculaires (coefficients directeurs)", ref: `${BOOK}, chap. 5 §3.1-3.2, ex. 3.a-3.d (p. 66-67) et ex. 23-31 (p. 70-71)`, kw: ["droites parallèles", "droites perpendiculaires", "a = a'", "a × a' = −1"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Deux droites d'équations y = ax + b et y = a'x + b' sont parallèles lorsque…", good: "a = a'", bad: ["a × a' = −1", "b = b'", "a + a' = 0"], why: "Deux droites sont parallèles si et seulement si elles ont le même coefficient directeur." },
      { q: "Dans un repère orthonormé, deux droites de coefficients directeurs a et a' sont perpendiculaires lorsque…", good: "a × a' = −1", bad: ["a = a'", "a + a' = 0", "a × a' = 1"], why: "(D) ⊥ (D') équivaut à a × a' = −1 dans un repère orthonormé." },
      { q: "Une droite d'équation x = k est…", good: "parallèle à l'axe des ordonnées", bad: ["parallèle à l'axe des abscisses", "passant par l'origine", "de coefficient directeur k"], why: "La droite x = k est parallèle à (OJ) ; elle n'a pas de coefficient directeur." },
      { q: "Une droite d'équation y = b est…", good: "parallèle à l'axe des abscisses", bad: ["parallèle à l'axe des ordonnées", "perpendiculaire à l'axe des abscisses", "de coefficient directeur b"], why: "y = b a pour coefficient directeur 0 : elle est parallèle à (OI)." },
      { q: "Une droite d'équation y = ax passe par…", good: "l'origine du repère", bad: ["le point (0 ; 1)", "le point (1 ; 1)", "aucun point particulier"], why: "Si b = 0, la droite passe par l'origine." },
    ];
    return qcmOf(r, pool, "Compare les coefficients directeurs.");
  }, QCM),
  mk("droite-perpendiculaire", "Équations de droites", 3, { skill: "Coefficient directeur d'une perpendiculaire", ref: `${BOOK}, chap. 5 §3.2, ex. 3.c-3.d (p. 67) et ex. 28-32 (p. 70-71)`, kw: ["perpendiculaire", "coefficient directeur", "a × a' = −1", "repère orthonormé"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 6);
    return { statement: `Dans un repère orthonormé, une droite (D) a pour coefficient directeur ${n2(a)}. Quel est le coefficient directeur d'une droite perpendiculaire à (D) ? (arrondi au centième)`, answer: num(round(-1 / a, 2), 0.01), hints: H("a × a' = −1.", `a' = −1 ÷ ${par(a)}.`, "Calcule l'opposé de l'inverse.", "Arrondis."), solution: `a' = −1 ÷ ${par(a)} ≈ ${fr(round(-1 / a, 2))}.` };
  }, FR),

  // ===== Chapitre 6 : Angles inscrits =====
  mk("angle-inscrit", "Angles inscrits", 2, { skill: "Angle inscrit et angle au centre : AMB = ½ AOB", ref: `${BOOK}, chap. 6 §1.2, ex. 1.c-1.d (p. 75) et ex. 7-9 (p. 78)`, kw: ["angle inscrit", "angle au centre", "moitié", "arc intercepté"] }, (c, r) => {
    const ang = 2 * int(r, 10, 85);
    const t = int(r, 0, 2);
    void c;
    if (t === 0) return { statement: `Dans un cercle de centre O, l'angle au centre AOB mesure ${ang}°. Quelle est la mesure d'un angle inscrit aigu AMB qui intercepte le même arc (en °) ?`, answer: num(ang / 2, 0.01, "°"), hints: H("Un angle inscrit aigu mesure la moitié de l'angle au centre associé.", "mes AMB = ½ mes AOB.", `${ang} ÷ 2.`, "Calcule."), solution: `mes AMB = ${ang} ÷ 2 = ${ang / 2}°.` };
    if (t === 1) return { statement: `Dans un cercle, un angle inscrit aigu AMB mesure ${ang / 2}°. Quelle est la mesure de l'angle au centre associé AOB (en °) ?`, answer: num(ang, 0.01, "°"), hints: H("L'angle au centre est le double de l'angle inscrit.", "mes AOB = 2 × mes AMB.", `2 × ${ang / 2}.`, "Calcule."), solution: `mes AOB = 2 × ${ang / 2} = ${ang}°.` };
    return { statement: `Dans un cercle de centre O, l'angle au centre AOB mesure ${ang}°. Un angle inscrit obtus AMB intercepte l'arc complémentaire. Quelle est sa mesure (en °) ?`, answer: num(180 - ang / 2, 0.01, "°"), hints: H("mes AMB = 180° − ½ mes AOB pour un angle inscrit obtus.", `½ AOB = ${ang / 2}.`, `180 − ${ang / 2}.`, "Calcule."), solution: `mes AMB = 180° − ${ang / 2}° = ${180 - ang / 2}°.` };
  }, FR),
  mk("angle-meme-arc", "Angles inscrits", 2, { skill: "Angles inscrits interceptant le même arc", ref: `${BOOK}, chap. 6 §1.3 (p. 76) et ex. 1-3 (p. 78)`, kw: ["même arc", "angles inscrits", "égaux", "arcs de même longueur"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Dans un cercle, deux angles inscrits interceptent le même arc. Que peut-on dire ?", good: "Ils ont la même mesure", bad: ["Ils sont supplémentaires", "L'un est le double de l'autre", "Ils sont complémentaires"], why: "Deux angles inscrits qui interceptent le même arc ont la même mesure." },
      { q: "Dans un cercle, deux angles inscrits interceptent deux arcs de même longueur. Que peut-on dire ?", good: "Ils ont la même mesure", bad: ["Ils sont supplémentaires", "L'un est le double de l'autre", "On ne peut rien dire"], why: "Deux angles inscrits qui interceptent deux arcs de même longueur ont la même mesure." },
      { q: "Un angle inscrit intercepte un demi-cercle (le diamètre [AB]). Que peut-on dire de cet angle ?", good: "Il est droit", bad: ["Il est aigu", "Il est obtus", "Il est plat"], why: "L'angle au centre associé est plat (180°), donc l'angle inscrit mesure 90°." },
      { q: "Les angles opposés d'un quadrilatère inscrit dans un cercle sont…", good: "supplémentaires", bad: ["complémentaires", "égaux", "droits"], why: "Si un quadrilatère est inscriptible dans un cercle, alors ses angles opposés sont supplémentaires." },
    ];
    return qcmOf(r, pool, "Pense à l'arc intercepté.");
  }, QCM),
  mk("angle-polygone-regulier", "Angles inscrits", 3, { skill: "Angles d'un polygone régulier et quadrilatère inscrit", ref: `${BOOK}, chap. 6 §2, polygone régulier et quadrilatère inscriptible (p. 76-77)`, kw: ["polygone régulier", "angle au centre", "quadrilatère inscrit", "supplémentaires", "pentagone"] }, (_c, r) => {
    const n = pick(r, [5, 6, 8, 9, 10, 12]);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Quelle est la mesure (en °) de l'angle au centre qui intercepte un côté d'un polygone régulier à ${n} côtés ?`, answer: num(360 / n, 0.001, "°"), hints: H("Un tour complet fait 360°.", `Il y a ${n} angles au centre égaux.`, `360 ÷ ${n}.`, "Calcule."), solution: `360 ÷ ${n} = ${fr(360 / n)}°.` };
    const A0 = 60 + (5 * n) % 50;
    return { statement: `Dans un quadrilatère ABCD inscrit dans un cercle, mes Â = ${A0}°. Quelle est la mesure de l'angle opposé Ĉ (en °) ?`, answer: num(180 - A0, 0.01, "°"), hints: H("Les angles opposés d'un quadrilatère inscrit sont supplémentaires.", "Â + Ĉ = 180°.", `180 − ${A0}.`, "Calcule."), solution: `Ĉ = 180° − ${A0}° = ${180 - A0}°.` };
  }, FR),

  // ===== Chapitre 7 : Symétries et translations =====
  mk("symtrans-proprietes", "Symétries et translations", 2, { skill: "Propriétés des symétries et des translations (récapitulatif)", ref: `${BOOK}, chap. 7 §1.2, propriétés (p. 83)`, kw: ["symétrie orthogonale", "symétrie centrale", "translation", "conservation", "image"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle transformation conserve les directions (une droite a pour image une droite parallèle, de même direction) ?", good: "La symétrie centrale et la translation", bad: ["La symétrie orthogonale seulement", "Aucune", "Toutes les trois, sans exception"], why: "Une symétrie centrale ou une translation donne pour image d'une droite une droite parallèle ; la symétrie orthogonale ne conserve pas toujours la direction." },
      { q: "Une figure a pour image par une symétrie ou une translation…", good: "une figure qui lui est superposable", bad: ["une figure deux fois plus grande", "une figure de même aire mais déformée", "un point"], why: "Une figure a pour image une figure qui lui est superposable." },
      { q: "Par une translation de vecteur AB, une droite parallèle à (AB) a pour image…", good: "elle-même", bad: ["une droite perpendiculaire", "un point", "une demi-droite"], why: "Une droite de vecteur directeur AB est sa propre image par la translation de vecteur AB." },
      { q: "Une droite perpendiculaire à l'axe (L) d'une symétrie orthogonale a pour image…", good: "elle-même", bad: ["une droite parallèle à (L)", "un point", "une droite oblique"], why: "Une droite perpendiculaire à l'axe est sa propre image." },
      { q: "Par une symétrie centrale de centre I, une droite passant par I a pour image…", good: "elle-même", bad: ["une droite perpendiculaire", "un cercle", "un point"], why: "Une droite passant par le centre est sa propre image par la symétrie centrale." },
    ];
    return qcmOf(r, pool, "Pense à la conservation.");
  }, QCM),

  // ===== Chapitre 8 : Rotation et homothétie =====
  mk("homothetie-image", "Rotation et homothétie", 2, { skill: "Homothétie : image d'un segment et rapport", ref: `${BOOK}, chap. 8 §2.1-2.2, ex. 2.a (p. 97-98) et ex. 7-9 (p. 100)`, kw: ["homothétie", "rapport", "OM' = k OM", "segment", "longueur"] }, (c, r) => {
    const k = pick(r, [2, 3, -2, -1, 0.5, 1.5, -3]), AB = int(r, 2, 12);
    const t = int(r, 0, 2);
    void c;
    if (t === 0) return { statement: `h est l'homothétie de rapport ${n2(k)}. Un segment [AB] mesure ${AB} cm. Quelle est la longueur de son image [A'B'] (en cm) ?`, answer: num(Math.abs(k) * AB, 0.001), hints: H("L'image de [AB] est un segment de longueur |k| × AB.", `|k| = ${fr(Math.abs(k))}.`, `${fr(Math.abs(k))} × ${AB}.`, "Calcule."), solution: `A'B' = |${n2(k)}| × ${AB} = ${fr(Math.abs(k) * AB)} cm.` };
    if (t === 1) { const OM = int(r, 2, 10); return { statement: `h est l'homothétie de centre O et de rapport ${n2(k)}. M est un point tel que OM = ${OM} cm. Quelle est la distance OM' (en cm) ?`, answer: num(Math.abs(k) * OM, 0.001), hints: H("OM' = k OM (vecteurs).", "Les distances : OM' = |k| × OM.", `${fr(Math.abs(k))} × ${OM}.`, "Calcule."), solution: `OM' = ${fr(Math.abs(k))} × ${OM} = ${fr(Math.abs(k) * OM)} cm.` }; }
    return { statement: `Une homothétie multiplie les longueurs par ${fr(Math.abs(k))}. Par combien multiplie-t-elle les aires ?`, answer: num(round(k * k, 4), 0.0001), hints: H("Une aire dépend de deux longueurs.", `Chaque longueur est multipliée par ${fr(Math.abs(k))}.`, `${fr(Math.abs(k))} × ${fr(Math.abs(k))}.`, "Calcule."), solution: `Aires multipliées par ${fr(Math.abs(k))}² = ${fr(round(k * k, 4))}.` };
  }, FR),
  mk("rotation-proprietes", "Rotation et homothétie", 2, { skill: "Rotation : propriétés (longueurs, angles, sens)", ref: `${BOOK}, chap. 8 §1.2-1.4 (p. 94-96) et ex. 1-6 (p. 100)`, kw: ["rotation", "centre", "image", "sens direct", "conservation des longueurs"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Par une rotation de centre O, l'image d'un segment est…", good: "un segment de même longueur", bad: ["un segment de longueur double", "une droite", "un point"], why: "L'image d'un segment par une rotation est un segment de même longueur." },
      { q: "Par une rotation de centre O, l'image de O est…", good: "O lui-même", bad: ["un point du cercle", "le symétrique de O", "aucun point"], why: "Le centre d'une rotation est son propre point invariant." },
      { q: "OAA' est isocèle en O et r est la rotation de centre O qui applique A sur A'. Pour un point M, que peut-on dire de OM et OM' (M' image de M par r) ?", good: "OM = OM'", bad: ["OM = 2 OM'", "OM' = 0", "OM = AA'"], why: "Une rotation de centre O conserve la distance à O : OM = OM'." },
      { q: "Sens direct, sens indirect : le sens direct est…", good: "le sens contraire des aiguilles d'une montre", bad: ["le sens des aiguilles d'une montre", "le sens horizontal", "aucun sens particulier"], why: "Dans le manuel, le sens direct est le sens inverse des aiguilles d'une montre." },
    ];
    return qcmOf(r, pool, "Une rotation fait tourner la figure sans la déformer.");
  }, QCM),

  // ===== Chapitre 9 : Pyramides et cônes =====
  mk("pyr-volume", "Pyramides et cônes", 2, { skill: "Volume d'une pyramide : V = B × h ÷ 3", ref: `${BOOK}, chap. 9 §1.2, ex. 1.b (p. 103) et ex. 2-3 (p. 111)`, kw: ["pyramide", "volume", "aire de la base", "hauteur", "B × h / 3"] }, (c, r) => {
    const a = int(r, 3, 12), h = int(r, 3, 15);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: c === "pur" ? `Une pyramide a pour base un carré de côté ${a} cm et pour hauteur ${h} cm. Calcule son volume (en cm³, arrondi au centième).` : `Une tente pyramidale a pour base un carré de ${a} m de côté et une hauteur de ${h} m. Quel est son volume (en m³, arrondi au centième) ?`, answer: num(round((a * a * h) / 3, 2), 0.01), hints: H("V = B × h ÷ 3.", `B = ${a}² = ${a * a}.`, `${a * a} × ${h} ÷ 3.`, "Calcule."), solution: `V = ${a * a} × ${h} ÷ 3 = ${fr(round((a * a * h) / 3, 2))}.` };
    if (t === 1) { const V = a * a * h; return { statement: `Une pyramide a un volume de ${V} cm³ et une base d'aire ${a * a} cm². Quelle est sa hauteur (en cm) ?`, answer: num(3 * h, 0.001), hints: H("V = B × h ÷ 3.", "h = 3 × V ÷ B.", `3 × ${V} ÷ ${a * a}.`, "Calcule."), solution: `h = 3 × ${V} ÷ ${a * a} = ${3 * h} cm.` }; }
    return { statement: `Un cube d'arête ${a} cm a pour volume ${a ** 3} cm³. Une pyramide a pour base une face du cube et pour sommet un sommet de la face opposée. Quel est son volume (en cm³) ?`, answer: num(round(a ** 3 / 3, 2), 0.01), hints: H("La pyramide a pour base une face et pour hauteur l'arête.", `B = ${a * a} et h = ${a}.`, `V = ${a * a} × ${a} ÷ 3.`, "Le tiers du cube."), solution: `V = ${a ** 3} ÷ 3 = ${fr(round(a ** 3 / 3, 2))}.` };
  }, SIT),
  mk("cone-volume", "Pyramides et cônes", 2, { skill: "Cône de révolution : volume, aire latérale (π ≈ 3,14)", ref: `${BOOK}, chap. 9 §1.4, ex. 1.e-1.f (p. 106-107) et ex. 19-25 (p. 113)`, kw: ["cône", "volume", "aire latérale", "génératrice", "rayon", "hauteur"] }, (_c, r) => {
    const [rr, h, g] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Un cône de révolution a pour rayon de base ${rr} cm et pour hauteur ${h} cm. Calcule son volume (en cm³, π ≈ 3,14, arrondi au centième).`, answer: num(round((PI * rr * rr * h) / 3, 2), 0.01), hints: H("V = B × h ÷ 3.", `B = 3,14 × ${rr}².`, `V = 3,14 × ${rr * rr} × ${h} ÷ 3.`, "Calcule."), solution: `V = 3,14 × ${rr * rr} × ${h} ÷ 3 = ${fr(round((PI * rr * rr * h) / 3, 2))} cm³.` };
    if (t === 1) return { statement: `Un cône de révolution a pour rayon de base ${rr} cm et pour génératrice ${g} cm. Calcule son aire latérale (en cm², π ≈ 3,14, arrondie au centième).`, answer: num(round(PI * rr * g, 2), 0.01), hints: H("Aire latérale = P × a ÷ 2 = π r a.", `P = 2 × 3,14 × ${rr}.`, `Aire = 3,14 × ${rr} × ${g}.`, "Calcule."), solution: `A = π r a = 3,14 × ${rr} × ${g} = ${fr(round(PI * rr * g, 2))} cm².` };
    return { statement: `Un cône de révolution a pour rayon de base ${rr} cm et pour génératrice ${g} cm. Quelle est sa hauteur (en cm) ?`, answer: num(h), hints: H("La hauteur, le rayon et la génératrice forment un triangle rectangle.", `g² = r² + h².`, `h² = ${g * g} − ${rr * rr}.`, "Racine carrée."), solution: `h² = ${g}² − ${rr}² = ${h * h} ; h = ${h} cm.` };
  }, FR),
  mk("section-reduction", "Pyramides et cônes", 3, { skill: "Section parallèle à la base : réduction (k, k², k³)", ref: `${BOOK}, chap. 9 §2.3, propriétés de réduction (p. 110) et ex. 26-28 (p. 113)`, kw: ["section", "plan parallèle à la base", "réduction", "k²", "k³", "tronc"] }, (_c, r) => {
    const SA = int(r, 6, 24), SE = int(r, 2, SA - 2);
    const k = SE / SA;
    const t = int(r, 0, 2);
    const V = pick(r, [270, 540, 1000, 2700]);
    if (t === 0) return { statement: `On coupe une pyramide de sommet S par un plan parallèle à la base. SA = ${SA} cm et SE = ${SE} cm (E ∈ [SA]). Quel est le rapport de réduction k (arrondi au centième) ?`, answer: num(round(k, 2), 0.01), hints: H("Le rapport de réduction est SE/SA.", `${SE}/${SA}.`, "Divise.", "Arrondis."), solution: `k = ${SE}/${SA} ≈ ${fr(round(k, 2))}.` };
    if (t === 1) return { statement: `Une pyramide a pour volume ${V} cm³. On la coupe par un plan parallèle à la base, à mi-hauteur : on obtient une petite pyramide réduite de rapport 1/2. Quel est le volume de la petite pyramide (en cm³) ?`, answer: num(V / 8, 0.01), hints: H("Le volume est multiplié par k³.", "k = 1/2, donc k³ = 1/8.", `${V} ÷ 8.`, "Calcule."), solution: `V' = ${V} × (1/2)³ = ${V} ÷ 8 = ${fr(V / 8)} cm³.` };
    const A = pick(r, [100, 200, 400]);
    return { statement: `L'aire latérale d'une pyramide est ${A} cm². Une section parallèle à la base donne une pyramide réduite de rapport 1/2. Quelle est l'aire latérale de la pyramide réduite (en cm²) ?`, answer: num(A / 4, 0.01), hints: H("Les aires sont multipliées par k².", "k = 1/2, donc k² = 1/4.", `${A} ÷ 4.`, "Calcule."), solution: `A' = ${A} × (1/2)² = ${A} ÷ 4 = ${A / 4} cm².` };
  }, FR),
);
void gcd; void f; void sup; void lin; void eqn;
