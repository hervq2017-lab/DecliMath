// CIAM 6ème : activités géométriques (chapitres 1 à 8).
// Les tracés du manuel ne se corrigent pas automatiquement : on garde ici les compétences de calcul,
// de vocabulaire et de propriétés qui s'y appuient.
import { choice, fr, int, num, pick, register, round, Rng, shuffle } from "./core";
import { ciam, dec, f, H, QCM, WHO } from "./ciam-kit";

const mk = ciam("6e", "ciam6");
const BOOK = "CIAM 6ème";

/** QCM à partir d'un pool { q, good, bad[] } : options mélangées, une seule bonne réponse. */
type Item = { q: string; good: string; bad: string[]; why: string };
const qcm = (r: Rng, pool: Item[], hint: string) => {
  const it = pick(r, pool);
  return {
    statement: it.q,
    answer: choice(r, [it.good, ...it.bad], 0),
    hints: H("Question de cours : relis la propriété correspondante.", hint, "Élimine d'abord les réponses qui contredisent la définition.", "Reviens à la définition du chapitre."),
    solution: it.why,
  };
};

register(
  // ================= Chapitre 1 : Droites =================
  mk("droites-compte", "Droites et points", 2, { skill: "Compter les droites passant par des points", ref: `${BOOK}, chap. 1, ex. 51-52 (p. 28)`, kw: ["droites", "points", "alignés", "compter"] }, (c, r) => {
    const n = int(r, 3, 8), v = (n * (n - 1)) / 2;
    return {
      statement: c === "pur"
        ? `On marque ${n} points tels que trois quelconques d'entre eux ne sont jamais alignés. Combien de droites distinctes passent par deux de ces points ?`
        : `${n} villages sont placés de sorte que trois quelconques ne soient jamais alignés. Chaque paire de villages doit être reliée par une piste rectiligne. Combien de pistes faut-il tracer ?`,
      answer: num(v),
      hints: H("On compte les droites déterminées par deux points.", "Par deux points distincts, il passe une seule droite.", `Chaque point peut être relié aux ${n - 1} autres ; chaque droite est alors comptée deux fois.`, `${n} × ${n - 1} ÷ 2.`),
      solution: `${n} × ${n - 1} ÷ 2 = ${v}.`,
    };
  }),
  mk("segments-compte", "Droites et points", 2, { skill: "Compter les segments sur une droite", ref: `${BOOK}, chap. 1 §4.2, ex. 4.g (p. 21)`, kw: ["segments", "extrémités", "alignés", "compter"] }, (c, r) => {
    const n = int(r, 3, 8), v = (n * (n - 1)) / 2;
    return {
      statement: c === "pur"
        ? `Sur une droite, on place ${n} points. Combien de segments peut-on nommer dont les extrémités sont deux de ces points ?`
        : `Sur une route rectiligne, il y a ${n} bornes kilométriques. On peut mesurer la distance entre deux bornes quelconques. Combien de distances différentes (de segments) peut-on ainsi considérer ?`,
      answer: num(v),
      hints: H("On compte les segments dont les extrémités sont deux des points.", "Un segment [AB] est le même que le segment [BA].", `Chaque point forme un segment avec les ${n - 1} autres, mais chaque segment est compté deux fois.`, `${n} × ${n - 1} ÷ 2.`),
      solution: `${n} × ${n - 1} ÷ 2 = ${v}.`,
    };
  }),
  mk("droites-proprietes", "Droites et points", 1, { skill: "Droites parallèles, perpendiculaires, sécantes : les propriétés", ref: `${BOOK}, chap. 1 §2-3 (p. 13-19)`, kw: ["parallèles", "perpendiculaires", "sécantes", "propriété"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "(D₁) ⊥ (D) et (D₂) ⊥ (D). Que peut-on dire de (D₁) et (D₂) ?", good: "Elles sont parallèles", bad: ["Elles sont perpendiculaires", "Elles sont sécantes en un point", "On ne peut rien dire"], why: "Deux droites perpendiculaires à une même droite sont parallèles." },
      { q: "(D₁) // (D₂) et (D₂) // (D₃). Que peut-on dire de (D₁) et (D₃) ?", good: "Elles sont parallèles", bad: ["Elles sont perpendiculaires", "Elles sont sécantes en un point", "Elles sont forcément confondues"], why: "Deux droites étant parallèles, une droite parallèle à l'une est parallèle à l'autre." },
      { q: "(D₁) // (D₂) et (D) ⊥ (D₁). Que peut-on dire de (D) et (D₂) ?", good: "(D) est perpendiculaire à (D₂)", bad: ["(D) est parallèle à (D₂)", "(D) est sécante à (D₂) mais pas perpendiculaire", "On ne peut rien dire"], why: "Deux droites étant parallèles, une droite perpendiculaire à l'une est perpendiculaire à l'autre." },
      { q: "(D₁) // (D₂) et (L) est sécante à (D₁). Que peut-on dire de (L) et (D₂) ?", good: "(L) est sécante à (D₂)", bad: ["(L) est parallèle à (D₂)", "(L) est confondue avec (D₂)", "(L) ne coupe pas (D₂)"], why: "Deux droites étant parallèles, une droite sécante à l'une est sécante à l'autre." },
      { q: "Combien de droites perpendiculaires à une droite (D) peut-on tracer en passant par un point A donné ?", good: "Une seule", bad: ["Aucune", "Deux", "Autant qu'on veut"], why: "Par un point, on ne peut tracer qu'une seule droite perpendiculaire à une droite donnée." },
      { q: "Combien de droites perpendiculaires à (D) peut-on tracer en tout, sans imposer de point de passage ?", good: "Autant qu'on veut", bad: ["Une seule", "Deux", "Aucune"], why: "On peut tracer autant de perpendiculaires à (D) qu'on veut ; elles sont toutes parallèles entre elles." },
      { q: "Deux droites sécantes ont…", good: "un seul point commun", bad: ["deux points communs", "aucun point commun", "une infinité de points communs"], why: "Des droites sécantes sont des droites qui ont un seul point commun." },
      { q: "(D₁) ⊥ (D) et (D₂) // (D₁). Que peut-on dire de (D₂) et (D) ?", good: "Elles sont perpendiculaires", bad: ["Elles sont parallèles", "Elles sont confondues", "On ne peut rien dire"], why: "(D₂) est parallèle à (D₁) et (D) est perpendiculaire à (D₁) : (D) est donc aussi perpendiculaire à (D₂)." },
      { q: "Par un point A donné, combien de droites parallèles à une droite (D) (qui ne passe pas par A) peut-on tracer ?", good: "Une seule", bad: ["Aucune", "Deux", "Autant qu'on veut"], why: "Par un point extérieur à (D), il passe une seule droite parallèle à (D)." },
      { q: "Quand dit-on que trois points sont alignés ?", good: "Quand ils appartiennent à une même droite", bad: ["Quand ils sont à égale distance les uns des autres", "Quand ils forment un triangle", "Quand l'un d'eux est le milieu des deux autres"], why: "Des points alignés sont des points d'une même droite." },
    ];
    return qcm(r, pool, "Pense au dessin codé de la propriété.");
  }, QCM),

  // ================= Chapitre 2 : Mesures de segments =================
  mk("conversion-longueurs", "Segments", 1, { skill: "Convertir des longueurs", ref: `${BOOK}, chap. 2 §1.2, ex. 1.h et 11-14 (p. 34-39)`, kw: ["conversion", "longueurs", "km", "m", "cm", "mm", "unités"] }, (c, r) => {
    const U = ["km", "hm", "dam", "m", "dm", "cm", "mm"], E = [3, 2, 1, 0, -1, -2, -3];
    const i = int(r, 0, 6);
    let j = int(r, 0, 6);
    if (j === i) j = (i + 2) % 7;
    const v = pick(r, [3, 12, 4.5, 0.75, 8.2, 1.51, 16.8, 2.165, 0.23, 35, 0.9, 127]);
    const k = E[i] - E[j]; // k > 0 : on passe à une unité plus petite → on multiplie
    const res = round(v * 10 ** k, 6);
    return {
      statement: c === "pur" ? `Convertis ${f(v)} ${U[i]} en ${U[j]}.` : `Sur son cahier, ${pick(r, WHO)} lit qu'un segment mesure ${f(v)} ${U[i]}. Quelle est sa mesure en ${U[j]} ?`,
      answer: num(res, 0, U[j]),
      hints: H("On change d'unité de longueur.", "Aide-toi du tableau de conversion : km, hm, dam, m, dm, cm, mm.", `Chaque unité vaut 10 fois la suivante. De ${U[i]} à ${U[j]}, il y a ${Math.abs(k)} rang${Math.abs(k) > 1 ? "s" : ""}.`, k > 0 ? `${U[j]} est plus petit que ${U[i]} : on multiplie par ${f(10 ** k)}.` : `${U[j]} est plus grand que ${U[i]} : on divise par ${f(10 ** -k)}.`),
      solution: `De ${U[i]} à ${U[j]} : ${Math.abs(k)} rang${Math.abs(k) > 1 ? "s" : ""}, on ${k > 0 ? "multiplie" : "divise"} par ${f(10 ** Math.abs(k))}. ${f(v)} ${U[i]} = ${f(res)} ${U[j]}.`,
    };
  }),
  mk("milieu-calcul", "Segments", 1, { skill: "Calculer avec le milieu d'un segment", ref: `${BOOK}, chap. 2 §2.1, ex. 2.f-2.g, 18 (p. 36-39)`, kw: ["milieu", "segment", "moitié", "double"] }, (c, r) => {
    const sens = int(r, 0, 1);
    const unit = pick(r, ["cm", "mm", "m"]);
    const half = int(r, 4, 90) / (pick(r, [1, 2]));
    const whole = round(half * 2, 2);
    const s = pick(r, WHO);
    if (sens === 0) {
      return {
        statement: c === "pur" ? `I est le milieu du segment [AB]. AI = ${fr(half)} ${unit}. Calcule AB.` : `${s} partage un ruban en deux morceaux égaux au point I. Le premier morceau mesure ${fr(half)} ${unit}. Quelle est la longueur totale du ruban (en ${unit}) ?`,
        answer: num(whole, 0, unit),
        hints: H("On connaît une moitié du segment.", "Le milieu est à égale distance des extrémités : AI = IB.", "AB = AI + IB = 2 × AI.", `2 × ${fr(half)}.`),
        solution: `Les deux morceaux sont égaux : longueur totale = 2 × ${fr(half)} = ${fr(whole)} ${unit}.`,
      };
    }
    return {
      statement: c === "pur" ? `O est le milieu du segment [CP]. CP = ${fr(whole)} ${unit}. Calcule CO.` : `${s} coupe un fil de ${fr(whole)} ${unit} en deux parties égales. Quelle est la longueur de chaque partie (en ${unit}) ?`,
      answer: num(half, 0, unit),
      hints: H("On connaît le segment entier.", "Le milieu partage le segment en deux segments de même longueur.", "CO = CP ÷ 2.", `${fr(whole)} ÷ 2.`),
      solution: `CO = CP ÷ 2 = ${fr(whole)} ÷ 2 = ${fr(half)} ${unit}.`,
    };
  }),
  mk("distances-alignes", "Segments", 1, { skill: "Calculer une distance entre points alignés", ref: `${BOOK}, chap. 2, ex. 9-10 et 31-34 (p. 39-41)`, kw: ["alignés", "distance", "AM", "MB", "AB"] }, (c, r) => {
    const a = dec(r, 2, 9, 1), b = dec(r, 2, 9, 1), tot = round(a + b, 1);
    const cherche = int(r, 0, 2);
    const s = pick(r, WHO);
    if (cherche === 0) {
      return {
        statement: c === "pur" ? `M est un point du segment [AB]. AM = ${fr(a)} cm et MB = ${fr(b)} cm. Calcule AB.` : `${s} marche de A jusqu'à un point M de la route [AB] : ${fr(a)} km. Il reste ${fr(b)} km à parcourir pour arriver en B. Quelle est la distance AB (en km) ?`,
        answer: num(tot, 0.001),
        hints: H("On cherche la longueur du segment entier.", "M est entre A et B.", "AB = AM + MB.", `${fr(a)} + ${fr(b)}.`),
        solution: `AB = AM + MB = ${fr(a)} + ${fr(b)} = ${fr(tot)}.`,
      };
    }
    const known = cherche === 1 ? a : b;
    return {
      statement: c === "pur" ? `M est un point du segment [AB]. AB = ${fr(tot)} cm et AM = ${fr(known)} cm. Calcule MB.` : `${s} doit parcourir ${fr(tot)} km de A à B et arrive au point M après ${fr(known)} km. Combien reste-t-il à parcourir (en km) ?`,
      answer: num(round(tot - known, 1), 0.001),
      hints: H("On cherche une partie du segment.", "M est entre A et B : AM + MB = AB.", "MB = AB − AM.", `${fr(tot)} − ${fr(known)}.`),
      solution: `MB = AB − AM = ${fr(tot)} − ${fr(known)} = ${fr(round(tot - known, 1))}.`,
    };
  }),
  mk("milieu-deux-etapes", "Segments", 3, { skill: "Milieu et distances : un calcul en deux étapes", ref: `${BOOK}, chap. 2, ex. 33 (p. 41)`, kw: ["milieu", "alignés", "IM", "deux étapes"] }, (c, r) => {
    const a = int(r, 2, 6), b = a + int(r, 2, 8);
    const am = (a + b) / 2, im = round(am - a, 1);
    return {
      statement: c === "pur"
        ? `A, I et B sont alignés dans cet ordre, avec AI = ${a} et IB = ${b} (même unité). M est le milieu de [AB]. Calcule IM.`
        : `Sur une piste, les bornes A, I et B sont alignées dans cet ordre : AI = ${a} km et IB = ${b} km. Un poste de secours M est placé au milieu de [AB]. À quelle distance de la borne I se trouve-t-il (en km) ?`,
      answer: num(im, 0.001),
      hints: H("Il faut d'abord trouver AB, puis AM.", "M est le milieu de [AB] donc AM = AB ÷ 2.", "Puis IM = AM − AI (M est entre I et B car AM > AI).", `AB = ${a} + ${b} = ${a + b}.`),
      solution: `AB = ${a} + ${b} = ${a + b} ; AM = ${a + b} ÷ 2 = ${fr(am)} ; IM = AM − AI = ${fr(am)} − ${a} = ${fr(im)}.`,
    };
  }),
  mk("mediatrice", "Segments", 1, { skill: "Médiatrice d'un segment : définition et propriétés", ref: `${BOOK}, chap. 2 §2.2 (p. 36)`, kw: ["médiatrice", "milieu", "perpendiculaire"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle phrase définit la médiatrice d'un segment [AB] ?", good: "La droite perpendiculaire à (AB) qui passe par le milieu de [AB]", bad: ["La droite parallèle à (AB) qui passe par le milieu de [AB]", "La droite perpendiculaire à (AB) qui passe par A", "La demi-droite d'origine A qui passe par B"], why: "La médiatrice d'un segment est la droite qui passe par le milieu du segment et qui est perpendiculaire à son support." },
      { q: "(D) est la médiatrice de [AB] et coupe (AB) en I. Que peut-on dire de I ?", good: "I est le milieu de [AB]", bad: ["I est confondu avec A", "I est le point le plus éloigné de B", "I est l'un des deux points A ou B"], why: "La médiatrice passe par le milieu du segment : I est le milieu de [AB], donc AI = IB." },
      { q: "Parmi ces propriétés, laquelle est vraie pour la médiatrice (D) d'un segment [AB] qui coupe (AB) en I ?", good: "AI = IB et (D) ⊥ (AB)", bad: ["AI = 2 × IB et (D) // (AB)", "I = A et (D) ⊥ (AB)", "AI = IB et (D) // (AB)"], why: "Une médiatrice passe par le milieu I de [AB] (donc AI = IB) et est perpendiculaire à (AB)." },
      { q: "(D) est la médiatrice de [AB]. Quelle est la position de (D) par rapport à (AB) ?", good: "(D) est perpendiculaire à (AB)", bad: ["(D) est parallèle à (AB)", "(D) est confondue avec (AB)", "(D) est sécante à (AB) sans être perpendiculaire"], why: "La médiatrice est perpendiculaire au support du segment." },
    ];
    return qcm(r, pool, "Une médiatrice combine deux informations : le milieu et la perpendiculaire.");
  }, QCM),

  // ================= Chapitre 3 : Cercles =================
  mk("cercle-rayon-diametre", "Cercles et disques", 1, { skill: "Rayon, diamètre, centre d'un cercle", ref: `${BOOK}, chap. 3 §1 (p. 44-45)`, kw: ["rayon", "diamètre", "cercle", "centre"] }, (c, r) => {
    const v = pick(r, [2, 3, 4, 5, 6.5, 7, 8, 9, 12]);
    const k = int(r, 0, 2);
    const s = pick(r, WHO);
    if (k === 0) return {
      statement: c === "pur" ? `Le point A appartient au cercle de centre I et de rayon ${fr(v)} cm. Combien mesure IA ?` : `${s} plante un piquet en I et tend une corde de ${fr(v)} m jusqu'à un point A, puis trace le cercle en gardant la corde tendue. Quelle est la distance IA (en m) ?`,
      answer: num(v),
      hints: H("A est un point du cercle.", "Tous les points du cercle sont à la même distance du centre.", "Cette distance est le rayon.", "IA = rayon."),
      solution: `A appartient au cercle de centre I, donc IA = rayon = ${fr(v)}.`,
    };
    if (k === 1) return {
      statement: c === "pur" ? `[AB] est un diamètre d'un cercle de rayon ${fr(v)} cm. Combien mesure AB ?` : `Un bassin circulaire a un rayon de ${fr(v)} m. Quelle est sa largeur d'un bord à l'autre en passant par le centre (en m) ?`,
      answer: num(2 * v),
      hints: H("On cherche le diamètre.", "Un diamètre passe par le centre et joint deux points du cercle.", "Diamètre = 2 × rayon.", `2 × ${fr(v)}.`),
      solution: `Diamètre = 2 × rayon = 2 × ${fr(v)} = ${fr(2 * v)}.`,
    };
    return {
      statement: c === "pur" ? `Un cercle a un diamètre de ${fr(2 * v)} cm. Quel est son rayon ?` : `Une table ronde a un diamètre de ${fr(2 * v)} dm. Quel est son rayon (en dm) ?`,
      answer: num(v),
      hints: H("On cherche le rayon.", "Le rayon est la moitié du diamètre.", "Rayon = diamètre ÷ 2.", `${fr(2 * v)} ÷ 2.`),
      solution: `Rayon = ${fr(2 * v)} ÷ 2 = ${fr(v)}.`,
    };
  }),
  mk("perimetre-cercle", "Cercles et disques", 2, { skill: "Périmètre d'un cercle (π ≈ 3,14)", ref: `${BOOK}, chap. 3 §3, ex. 3.b-3.c (p. 49-50)`, kw: ["périmètre", "cercle", "circonférence", "pi", "π"] }, (c, r) => {
    const k = int(r, 0, 2);
    const R = pick(r, [2, 3, 4, 5, 6, 7, 8, 10, 15, 25]);
    if (k === 0) return {
      statement: c === "pur" ? `Calcule une valeur approchée du périmètre d'un cercle de rayon ${R} cm (prends π ≈ 3,14).` : `Une roue de charrette a un rayon de ${R} dm. Quelle distance (en dm) parcourt-elle en un tour complet ? (π ≈ 3,14)`,
      answer: num(round(6.28 * R, 2), 0.01),
      hints: H("On cherche la longueur du tour du cercle.", "On l'appelle le périmètre.", "P = 2 × π × rayon.", `2 × 3,14 × ${R}.`),
      solution: `P = 2 × 3,14 × ${R} = ${fr(round(6.28 * R, 2))}.`,
    };
    if (k === 1) return {
      statement: c === "pur" ? `Calcule une valeur approchée du périmètre d'un cercle de diamètre ${2 * R} cm (π ≈ 3,14).` : `Un puits rond a un diamètre de ${2 * R} dm. Quelle est la longueur de la margelle qui l'entoure (en dm) ? (π ≈ 3,14)`,
      answer: num(round(3.14 * 2 * R, 2), 0.01),
      hints: H("On connaît le diamètre.", "P = π × diamètre.", "Multiplie le diamètre par 3,14.", `3,14 × ${2 * R}.`),
      solution: `P = 3,14 × ${2 * R} = ${fr(round(3.14 * 2 * R, 2))}.`,
    };
    const P = round(6.28 * R, 2);
    return {
      statement: c === "pur" ? `Un cercle a pour périmètre ${fr(P)} cm. Calcule son rayon (π ≈ 3,14).` : `Le tour d'un terre-plein circulaire mesure ${fr(P)} m. Quel est son rayon (en m) ? (π ≈ 3,14)`,
      answer: num(R, 0.01),
      hints: H("On connaît le périmètre et on cherche le rayon.", "P = 2 × π × rayon.", "Rayon = P ÷ (2 × 3,14).", `2 × 3,14 = 6,28.`),
      solution: `Rayon = ${fr(P)} ÷ 6,28 = ${R}.`,
    };
  }),
  mk("aire-disque", "Cercles et disques", 2, { skill: "Aire d'un disque (π ≈ 3,14)", ref: `${BOOK}, chap. 3 §3, ex. 3.d (p. 49-50)`, kw: ["aire", "disque", "pi", "π", "πr²"] }, (c, r) => {
    const R = pick(r, [2, 2.5, 3, 4, 5, 6, 7.5, 10]);
    const A = round(3.14 * R * R, 4);
    const diam = int(r, 0, 1) === 1;
    return {
      statement: c === "pur"
        ? (diam ? `Calcule une valeur approchée de l'aire d'un disque de diamètre ${fr(2 * R)} cm (π ≈ 3,14).` : `Calcule une valeur approchée de l'aire d'un disque de rayon ${fr(R)} cm (π ≈ 3,14).`)
        : `Une place ronde a un ${diam ? `diamètre de ${fr(2 * R)}` : `rayon de ${fr(R)}`} m. On veut la recouvrir de gazon. Quelle surface (en m², valeur approchée, π ≈ 3,14) faut-il recouvrir ?`,
      answer: num(A, 0.01),
      hints: H("On cherche l'aire d'un disque.", diam ? "Commence par trouver le rayon : la moitié du diamètre." : "On connaît le rayon.", "A = rayon × rayon × π.", `${fr(R)} × ${fr(R)} × 3,14.`),
      solution: `A = ${fr(R)} × ${fr(R)} × 3,14 = ${fr(A)}.`,
    };
  }),

  // ================= Triangles (chap. 1 §5 et chap. 3 §2) =================
  mk("triangles-vocabulaire", "Triangles", 1, { skill: "Triangle isocèle, équilatéral, rectangle : vocabulaire", ref: `${BOOK}, chap. 1 §5 (p. 21-22) et chap. 3 §2 (p. 45-48)`, kw: ["isocèle", "équilatéral", "rectangle", "hypoténuse", "hauteur", "base"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quel triangle a ses trois côtés de même longueur ?", good: "Le triangle équilatéral", bad: ["Le triangle rectangle", "Le triangle isocèle qui n'est pas équilatéral", "Aucun triangle"], why: "Un triangle équilatéral est un triangle qui a ses trois côtés de même longueur." },
      { q: "SMA est un triangle isocèle en A. Quels côtés ont la même longueur ?", good: "[AS] et [AM]", bad: ["[SM] et [MA]", "[SM] et [SA]", "Les trois côtés"], why: "Un triangle isocèle en A a ses deux côtés issus de A de même longueur : AS = AM. Le côté [SM] est la base." },
      { q: "ABC est isocèle en A. Quelle est sa base ?", good: "[BC]", bad: ["[AB]", "[AC]", "[AH] où H est le pied de la hauteur issue de A"], why: "La base d'un triangle isocèle en A est le côté opposé au sommet principal A, c'est-à-dire [BC]." },
      { q: "ABC est un triangle rectangle en B. Quel côté est l'hypoténuse ?", good: "[AC]", bad: ["[AB]", "[BC]", "On ne peut pas savoir"], why: "L'hypoténuse est le côté opposé à l'angle droit : ici [AC], opposé au sommet B." },
      { q: "Un triangle qui a deux côtés de même longueur est appelé…", good: "un triangle isocèle", bad: ["un triangle rectangle", "un triangle équilatéral à coup sûr", "un quadrilatère"], why: "Un triangle isocèle est un triangle qui a deux côtés de même longueur." },
      { q: "Qu'est-ce qu'un triangle rectangle ?", good: "Un triangle qui a deux côtés dont les supports sont perpendiculaires", bad: ["Un triangle qui a deux côtés de même longueur", "Un triangle qui a ses trois côtés de même longueur", "Un triangle dont les trois angles sont aigus"], why: "Un triangle rectangle est un triangle qui a deux côtés dont les supports sont perpendiculaires (il a un angle droit)." },
      { q: "Qu'est-ce qu'une hauteur d'un triangle ?", good: "La droite qui passe par un sommet et qui est perpendiculaire au support du côté opposé", bad: ["La droite qui passe par un sommet et par le milieu du côté opposé", "La droite parallèle à un côté qui passe par le sommet opposé", "Le segment qui joint les milieux de deux côtés"], why: "Une hauteur d'un triangle est la droite passant par un sommet et perpendiculaire au support du côté opposé." },
      { q: "Deux triangles ont leurs trois côtés respectivement de même longueur. Que peut-on dire de ces triangles ?", good: "Ils sont superposables", bad: ["Ils sont forcément rectangles", "Ils sont forcément équilatéraux", "On ne peut rien dire"], why: "Deux triangles qui ont leurs trois côtés respectivement de même longueur sont superposables." },
    ];
    return qcm(r, pool, "Pense à la définition du triangle.");
  }, QCM),
  mk("triangle-nombres", "Triangles", 1, { skill: "Hauteurs, côtés, sommets d'un triangle", ref: `${BOOK}, chap. 1 §5.1 (p. 21-22)`, kw: ["hauteur", "côtés", "sommets", "quadrilatère", "diagonales"] }, (c, r) => {
    const q = [
      { t: "Combien un triangle a-t-il de hauteurs ?", v: 3, why: "Un triangle a trois sommets et une hauteur issue de chaque sommet : 3 hauteurs." },
      { t: "Combien un triangle a-t-il de côtés ?", v: 3, why: "Un triangle a 3 côtés." },
      { t: "Combien un quadrilatère a-t-il de diagonales ?", v: 2, why: "Un quadrilatère a 4 sommets : les diagonales joignent les sommets opposés, il y en a 2." },
      { t: "Combien un quadrilatère a-t-il de côtés ?", v: 4, why: "Un quadrilatère a 4 côtés." },
    ];
    const it = pick(r, q);
    void c;
    return { statement: it.t, answer: num(it.v), hints: H("Question de vocabulaire.", "Relis le vocabulaire du chapitre 1, §5.", "Compte les sommets.", "Fais un petit dessin."), solution: it.why };
  }, QCM),
  mk("triangle-perimetre", "Triangles", 1, { skill: "Périmètre d'un triangle", ref: `${BOOK}, chap. 6, ex. 3.l-3.n (p. 83)`, kw: ["périmètre", "triangle", "isocèle", "équilatéral"] }, (c, r) => {
    const k = int(r, 0, 2);
    const u = pick(r, ["cm", "m", "dam"]);
    if (k === 0) {
      const a = dec(r, 5, 15, 1), b = dec(r, 5, 15, 1), d = dec(r, 5, 15, 1), P = round(a + b + d, 1);
      return {
        statement: c === "pur" ? `Calcule le périmètre d'un triangle dont les côtés mesurent ${fr(a)} ${u}, ${fr(b)} ${u} et ${fr(d)} ${u}.` : `Un jardin triangulaire a pour côtés ${fr(a)} ${u}, ${fr(b)} ${u} et ${fr(d)} ${u}. Quelle longueur de clôture (en ${u}) faut-il pour en faire le tour ?`,
        answer: num(P, 0.001, u),
        hints: H("Le périmètre est la longueur du tour de la figure.", "On additionne les longueurs des trois côtés.", "P = a + b + c.", `${fr(a)} + ${fr(b)} + ${fr(d)}.`),
        solution: `P = ${fr(a)} + ${fr(b)} + ${fr(d)} = ${fr(P)} ${u}.`,
      };
    }
    if (k === 1) {
      const a = dec(r, 5, 14, 1), b = dec(r, 3, 12, 1), P = round(2 * a + b, 1);
      return {
        statement: c === "pur" ? `PAE est un triangle isocèle en E. PE = EA = ${fr(a)} ${u} et PA = ${fr(b)} ${u}. Calcule son périmètre.` : `Un fanion a la forme d'un triangle isocèle : deux côtés de ${fr(a)} ${u} et la base de ${fr(b)} ${u}. Quel est son périmètre (en ${u}) ?`,
        answer: num(P, 0.001, u),
        hints: H("Un triangle isocèle a deux côtés de même longueur.", "Il y a deux côtés égaux et une base.", "P = 2 × côté égal + base.", `2 × ${fr(a)} + ${fr(b)}.`),
        solution: `P = 2 × ${fr(a)} + ${fr(b)} = ${fr(P)} ${u}.`,
      };
    }
    const a = dec(r, 3, 15, 1);
    return {
      statement: c === "pur" ? `Un triangle équilatéral a pour côté ${fr(a)} ${u}. Calcule son périmètre.` : `Un panneau a la forme d'un triangle équilatéral de ${fr(a)} ${u} de côté. Quelle est la longueur de son contour (en ${u}) ?`,
      answer: num(round(3 * a, 1), 0.001, u),
      hints: H("Les trois côtés ont la même longueur.", "Un triangle équilatéral a ses trois côtés égaux.", "P = 3 × côté.", `3 × ${fr(a)}.`),
      solution: `P = 3 × ${fr(a)} = ${fr(round(3 * a, 1))} ${u}.`,
    };
  }),
  mk("triangle-aire", "Triangles", 2, { skill: "Aire d'un triangle (base × hauteur ÷ 2)", ref: `${BOOK}, chap. 6 §3, ex. 3.j-3.k (p. 82-83)`, kw: ["aire", "triangle", "base", "hauteur"] }, (c, r) => {
    const b = int(r, 4, 20), h = int(r, 3, 14);
    const A = (b * h) / 2;
    const inv = int(r, 0, 1) === 1 && b % 2 === 0;
    if (inv) {
      const A2 = (b * h) / 2;
      return {
        statement: c === "pur" ? `Un triangle EFG a pour aire ${fr(A2)} m². Le côté [EF] mesure ${b} m. Quelle est la hauteur correspondante (en m) ?` : `Un champ triangulaire a une surface de ${fr(A2)} m². Un de ses côtés mesure ${b} m. Quelle est la hauteur relative à ce côté (en m) ?`,
        answer: num(h, 0.001),
        hints: H("On connaît l'aire et la base, on cherche la hauteur.", "A = (base × hauteur) ÷ 2.", "hauteur = 2 × A ÷ base.", `2 × ${fr(A2)} = ${fr(2 * A2)}.`),
        solution: `hauteur = 2 × ${fr(A2)} ÷ ${b} = ${h}.`,
      };
    }
    return {
      statement: c === "pur" ? `Dans le triangle PQR, [QR] = ${b} cm et la hauteur correspondante mesure ${h} cm. Calcule l'aire du triangle PQR.` : `Une voile triangulaire a une base de ${b} dm et une hauteur de ${h} dm. Quelle est son aire (en dm²) ?`,
      answer: num(A, 0.001),
      hints: H("On cherche l'aire d'un triangle.", "L'aire d'un triangle est la moitié d'un rectangle de même base et de même hauteur.", "A = (base × hauteur) ÷ 2.", `${b} × ${h} = ${b * h}.`),
      solution: `A = (${b} × ${h}) ÷ 2 = ${fr(A)}.`,
    };
  }),

  // ================= Chapitre 4 : Angles =================
  mk("angles-adjacents", "Angles", 1, { skill: "Angles adjacents : ajouter et retrancher des mesures", ref: `${BOOK}, chap. 4 §1.2, ex. 1.l (p. 56-57) et ex. 17-18 (p. 62)`, kw: ["angles adjacents", "mesure", "somme", "BAC", "BAD"] }, (c, r) => {
    const a = int(r, 15, 80), b = int(r, 15, 90);
    if (int(r, 0, 1) === 0) return {
      statement: c === "pur" ? `Les angles BAC et CAD sont adjacents. mes BAC = ${a}° et mes CAD = ${b}°. Calcule mes BAD.` : `Un éventail s'ouvre en deux étapes : d'abord un angle de ${a}°, puis un angle adjacent de ${b}°. De quel angle total (en °) l'éventail est-il ouvert ?`,
      answer: num(a + b, 0, "°"),
      hints: H("Deux angles adjacents se suivent sans se chevaucher.", "Ils ont le même sommet et un côté commun.", "La mesure de l'angle total est la somme des deux mesures.", `${a} + ${b}.`),
      solution: `mes BAD = mes BAC + mes CAD = ${a} + ${b} = ${a + b}°.`,
    };
    return {
      statement: c === "pur" ? `Les angles ABC et CBD sont adjacents. mes ABD = ${a + b}° et mes ABC = ${a}°. Calcule mes CBD.` : `Une porte s'ouvre de ${a + b}° au total. La première partie de l'ouverture est de ${a}°. De quel angle (en °) s'ouvre la seconde partie ?`,
      answer: num(b, 0, "°"),
      hints: H("On connaît l'angle total et un des deux angles adjacents.", "mes ABD = mes ABC + mes CBD.", "mes CBD = mes ABD − mes ABC.", `${a + b} − ${a}.`),
      solution: `mes CBD = ${a + b} − ${a} = ${b}°.`,
    };
  }),
  mk("angles-plat-droit", "Angles", 1, { skill: "Angle droit et angle plat : calculer un angle manquant", ref: `${BOOK}, chap. 4 §1.2 (p. 55-56) et ex. 19-20 (p. 62)`, kw: ["angle droit", "angle plat", "90", "180", "supplémentaires", "complémentaires"] }, (c, r) => {
    const flat = int(r, 0, 1) === 1;
    const total = flat ? 180 : 90;
    const x = flat ? int(r, 20, 160) : int(r, 10, 80);
    return {
      statement: c === "pur"
        ? (flat ? `Les points A, O et B sont alignés (AOB est un angle plat). C est un point extérieur à la droite (AB) et mes AOC = ${x}°. Calcule mes COB.` : `L'angle XOY est droit. [OZ] est une demi-droite à l'intérieur de cet angle, avec mes XOZ = ${x}°. Calcule mes ZOY.`)
        : (flat ? `Un robinet tourne sur une demi-circonférence (un angle plat) en deux temps. La première rotation est de ${x}°. Quelle est la seconde rotation (en °) ?` : `Un coin de feuille forme un angle droit. On le coupe en deux par un pli : la première partie mesure ${x}°. Combien mesure la seconde (en °) ?`),
      answer: num(total - x, 0, "°"),
      hints: H(flat ? "Les deux angles adjacents forment un angle plat." : "Les deux angles adjacents forment un angle droit.", `${flat ? "Un angle plat" : "Un angle droit"} mesure ${total}°.`, `Angle cherché = ${total}° − angle connu.`, `${total} − ${x}.`),
      solution: `${total} − ${x} = ${total - x}°.`,
    };
  }),
  mk("angles-bissectrice", "Angles", 2, { skill: "Bissectrice d'un angle", ref: `${BOOK}, chap. 4 §3, ex. 39-40 (p. 60-64)`, kw: ["bissectrice", "angle", "moitié"] }, (c, r) => {
    const half = int(r, 10, 85);
    if (int(r, 0, 1) === 0) return {
      statement: c === "pur" ? `mes ABC = ${2 * half}°. (BM) est la bissectrice de l'angle ABC. Calcule mes ABM.` : `Un compas est ouvert d'un angle de ${2 * half}°. Une règle placée en bissectrice le partage en deux parts égales. Quelle est la mesure de chaque part (en °) ?`,
      answer: num(half, 0, "°"),
      hints: H("La bissectrice partage l'angle en deux angles de même mesure.", "Chaque angle obtenu vaut la moitié de l'angle de départ.", "mes ABM = mes ABC ÷ 2.", `${2 * half} ÷ 2.`),
      solution: `mes ABM = ${2 * half} ÷ 2 = ${half}°.`,
    };
    return {
      statement: c === "pur" ? `(FK) est la bissectrice de l'angle EFG. mes EFK = ${half}°. Calcule mes EFG.` : `Une porte s'ouvre en deux parties égales de ${half}° chacune de part et d'autre d'un axe qui est la bissectrice. Quel est l'angle total d'ouverture (en °) ?`,
      answer: num(2 * half, 0, "°"),
      hints: H("On connaît la moitié de l'angle cherché.", "La bissectrice partage l'angle en deux angles de même mesure.", "mes EFG = 2 × mes EFK.", `2 × ${half}.`),
      solution: `mes EFG = 2 × ${half} = ${2 * half}°.`,
    };
  }),
  mk("angles-nature", "Angles", 1, { skill: "Reconnaître un angle aigu, droit, obtus, plat, nul", ref: `${BOOK}, chap. 4 §1.2, ex. 1.i (p. 55-57)`, kw: ["aigu", "obtus", "droit", "plat", "nul"] }, (_c, r) => {
    const cases: [number, string][] = [
      [int(r, 5, 85), "aigu"], [90, "droit"], [int(r, 95, 175), "obtus"], [180, "plat"], [0, "nul"],
    ];
    const [x, good] = pick(r, cases);
    const names = ["aigu", "droit", "obtus", "plat", "nul"];
    const opts = names.slice(0, 4).includes(good) ? ["aigu", "droit", "obtus", "plat"] : ["aigu", "obtus", "plat", "nul"];
    return {
      statement: `Un angle mesure ${x}°. Quelle est sa nature ?`,
      answer: choice(r, opts, opts.indexOf(good)),
      hints: H("On classe un angle d'après sa mesure.", "Droit : 90°. Plat : 180°. Nul : 0°.", "Aigu : entre 0° et 90°. Obtus : entre 90° et 180°.", `Compare ${x} avec 90 et 180.`),
      solution: `${x}° → angle ${good}.`,
    };
  }, QCM),
  mk("angles-secantes", "Angles", 3, { skill: "Deux droites sécantes : calculer les angles formés", ref: `${BOOK}, chap. 4, ex. 21 (p. 62)`, kw: ["sécantes", "angle opposé", "angles adjacents", "supplémentaires"] }, (c, r) => {
    const x = int(r, 25, 80);
    const target = int(r, 0, 1);
    const ans = target === 0 ? 180 - x : x;
    const what = target === 0 ? "BOC" : "COD";
    void c;
    return {
      statement: `Les droites (AC) et (BD) se coupent en O. mes AOB = ${x}°. Calcule mes ${what}.`,
      answer: num(ans, 0, "°"),
      hints: H("Deux droites sécantes forment quatre angles.", target === 0 ? "AOB et BOC sont adjacents et forment un angle plat (A, O, C alignés)." : "BOC et COD sont adjacents et forment un angle plat (B, O, D alignés).", target === 0 ? "mes BOC = 180° − mes AOB." : "Calcule d'abord mes BOC = 180° − mes AOB, puis mes COD = 180° − mes BOC.", target === 0 ? `180 − ${x}.` : `180 − ${x} = ${180 - x}, puis 180 − ${180 - x}.`),
      solution: target === 0 ? `A, O, C sont alignés : mes BOC = 180° − ${x}° = ${180 - x}°.` : `mes BOC = 180° − ${x}° = ${180 - x}° ; B, O, D sont alignés : mes COD = 180° − ${180 - x}° = ${x}°.`,
    };
  }, [{ id: "figure", label: "Droites sécantes" }]),

  // ================= Chapitre 5 : Symétrie par rapport à un point =================
  mk("sympoint-milieu", "Figures symétriques par rapport à un point", 1, { skill: "Symétrique d'un point : O est le milieu", ref: `${BOOK}, chap. 5 §1 (p. 66-67)`, kw: ["symétrique", "centre de symétrie", "milieu", "point"] }, (c, r) => {
    const o = int(r, 8, 30), a = int(r, 1, o - 1);
    if (int(r, 0, 1) === 0) return {
      statement: c === "pur" ? `Sur une droite graduée, O a pour abscisse ${o} et A a pour abscisse ${a}. A' est le symétrique de A par rapport à O. Quelle est l'abscisse de A' ?` : `Sur une piste graduée en mètres, la borne O est au repère ${o} et un arbre A au repère ${a}. On plante un arbre A' symétrique de A par rapport à O. À quel repère ?`,
      answer: num(2 * o - a),
      hints: H("A et A' sont symétriques par rapport à O.", "O est le milieu du segment [AA'].", `La distance OA' est égale à la distance OA : ${o - a}.`, `${o} + ${o - a}.`),
      solution: `O est le milieu de [AA'] : OA = ${o} − ${a} = ${o - a}, donc A' est à ${o} + ${o - a} = ${2 * o - a}.`,
    };
    const L = int(r, 4, 40) / 2;
    return {
      statement: c === "pur" ? `M et P sont symétriques par rapport au point O. OM = ${fr(L)} cm. Calcule MP.` : `Deux balises M et P sont placées symétriquement de part et d'autre d'un phare O. La balise M est à ${fr(L)} km du phare. Quelle est la distance MP (en km) ?`,
      answer: num(2 * L),
      hints: H("M et P sont symétriques par rapport à O.", "O est le milieu de [MP] : OM = OP.", "MP = OM + OP = 2 × OM.", `2 × ${fr(L)}.`),
      solution: `O est le milieu de [MP] : MP = 2 × OM = 2 × ${fr(L)} = ${fr(2 * L)}.`,
    };
  }),
  mk("sympoint-conservation", "Figures symétriques par rapport à un point", 1, { skill: "Une symétrie conserve longueurs, angles, périmètres", ref: `${BOOK}, chap. 5 §2 (p. 68-70)`, kw: ["conservation", "longueur", "angle", "périmètre", "symétrique"] }, (c, r) => {
    const k = int(r, 0, 2);
    const v = int(r, 8, 60);
    const what = [
      { t: `Le segment [AB] mesure ${v} cm. [A'B'] est son symétrique par rapport à un point O. Quelle est la longueur de [A'B'] (en cm) ?`, s: `Un segment et son symétrique par rapport à un point ont la même longueur : A'B' = AB = ${v} cm.`, u: "cm" },
      { t: `Dans le triangle ABC, l'angle en A mesure ${v}°. A'B'C' est le symétrique de ABC par rapport à un point O. Combien mesure l'angle en A' (en °) ?`, s: `Deux angles symétriques par rapport à un point ont la même mesure : ${v}°.`, u: "°" },
      { t: `Le triangle ABC a pour périmètre ${v} cm. A'B'C' est son symétrique par rapport à un point O. Quel est le périmètre de A'B'C' (en cm) ?`, s: `Les côtés symétriques ont les mêmes longueurs : le périmètre de A'B'C' est ${v} cm.`, u: "cm" },
    ][k];
    void c;
    return { statement: what.t, answer: num(v, 0, what.u), hints: H("Une symétrie centrale « déplace » la figure sans la déformer.", "Longueurs et angles sont conservés.", "La réponse est la même valeur que dans la figure de départ.", "Recopie la valeur du départ."), solution: what.s };
  }, [{ id: "propriete", label: "Propriété de la symétrie" }]),
  mk("sympoint-centre", "Figures symétriques par rapport à un point", 1, { skill: "Reconnaître une figure qui a un centre de symétrie", ref: `${BOOK}, chap. 5 §3 (p. 71) et chap. 6 §1.2 (p. 79)`, kw: ["centre de symétrie", "cercle", "parallélogramme", "rectangle", "carré", "losange"] }, (_c, r) => {
    const yes = ["Un cercle", "Un rectangle", "Un carré", "Un parallélogramme", "Un losange"];
    const no = ["Un triangle équilatéral", "Un triangle isocèle", "Un triangle rectangle", "Un triangle quelconque"];
    if (int(r, 0, 1) === 0) {
      const good = pick(r, yes);
      return {
        statement: "Laquelle de ces figures admet un centre de symétrie ?",
        answer: choice(r, [good, ...shuffle(r, no).slice(0, 3)], 0),
        hints: H("Un centre de symétrie O : chaque point de la figure a son symétrique par rapport à O dans la figure.", "Pense aux diagonales qui se coupent en leur milieu.", "Un triangle n'a aucun centre de symétrie.", "Cherche la figure à quatre côtés ou ronde."),
        solution: `${good} admet un centre de symétrie (le centre du cercle, ou le point d'intersection des diagonales). Un triangle n'en a pas.`,
      };
    }
    const good = pick(r, no);
    return {
      statement: "Laquelle de ces figures n'admet PAS de centre de symétrie ?",
      answer: choice(r, [good, ...shuffle(r, yes).slice(0, 3)], 0),
      hints: H("On cherche l'intrus.", "Un cercle, un rectangle, un carré, un parallélogramme ont un centre de symétrie.", "Les diagonales d'un parallélogramme se coupent en leur milieu : ce point est son centre de symétrie.", "Un triangle n'a pas de centre de symétrie."),
      solution: `${good} n'a pas de centre de symétrie. Les autres figures en ont un (centre du cercle, point d'intersection des diagonales).`,
    };
  }, QCM),

  // ================= Chapitre 6 : Parallélogrammes =================
  mk("para-perimetre", "Parallélogrammes", 1, { skill: "Périmètre : parallélogramme, rectangle, carré", ref: `${BOOK}, chap. 6 §3, ex. 3.a-3.d (p. 83)`, kw: ["périmètre", "rectangle", "carré", "parallélogramme", "côté"] }, (c, r) => {
    const k = int(r, 0, 3);
    const u = pick(r, ["m", "cm", "dm"]);
    const a = dec(r, 5, 18, 1), b = dec(r, 3, 12, 1);
    if (k === 0) {
      const P = round(2 * (a + b), 1);
      return {
        statement: c === "pur" ? `Calcule le périmètre d'un parallélogramme dont deux côtés consécutifs mesurent ${fr(a)} ${u} et ${fr(b)} ${u}.` : `Un champ en forme de parallélogramme a deux côtés consécutifs de ${fr(a)} ${u} et ${fr(b)} ${u}. Quelle longueur de grillage (en ${u}) faut-il pour l'entourer ?`,
        answer: num(P, 0.001, u),
        hints: H("Le périmètre est la longueur du contour.", "Les côtés opposés d'un parallélogramme ont la même longueur.", "P = 2 × (a + b).", `${fr(a)} + ${fr(b)} = ${fr(round(a + b, 1))}.`),
        solution: `P = 2 × (${fr(a)} + ${fr(b)}) = ${fr(P)} ${u}.`,
      };
    }
    if (k === 1) {
      const P = round(2 * (a + b), 1);
      return {
        statement: c === "pur" ? `Un parallélogramme a pour périmètre ${fr(P)} ${u}. L'un de ses côtés mesure ${fr(a)} ${u}. Calcule la longueur de l'autre côté.` : `Le contour d'une parcelle en parallélogramme mesure ${fr(P)} ${u}. Un côté mesure ${fr(a)} ${u}. Quelle est la longueur du côté voisin (en ${u}) ?`,
        answer: num(b, 0.001, u),
        hints: H("On connaît le périmètre et un côté, on cherche l'autre.", "P = 2 × (a + b), donc a + b est la moitié du périmètre.", `a + b = ${fr(P)} ÷ 2 = ${fr(round(P / 2, 1))}.`, "b = (P ÷ 2) − a."),
        solution: `P ÷ 2 = ${fr(round(P / 2, 1))} ; b = ${fr(round(P / 2, 1))} − ${fr(a)} = ${fr(b)} ${u}.`,
      };
    }
    if (k === 2) {
      const c1 = int(r, 3, 15), P = 4 * c1;
      return {
        statement: c === "pur" ? `Le périmètre d'un carré est ${P} ${u}. Calcule la longueur de son côté.` : `Une cour carrée est entourée par ${P} ${u} de mur. Quelle est la longueur d'un côté (en ${u}) ?`,
        answer: num(c1, 0.001, u),
        hints: H("Un carré a quatre côtés égaux.", "P = 4 × côté.", "côté = P ÷ 4.", `${P} ÷ 4.`),
        solution: `côté = ${P} ÷ 4 = ${c1} ${u}.`,
      };
    }
    const L = int(r, 8, 30), l = int(r, 3, L - 1), P = 2 * (L + l);
    return {
      statement: c === "pur" ? `Le périmètre d'un rectangle est ${P} ${u} et sa longueur est ${L} ${u}. Calcule sa largeur.` : `Un terrain rectangulaire a un périmètre de ${P} ${u} et une longueur de ${L} ${u}. Quelle est sa largeur (en ${u}) ?`,
      answer: num(l, 0.001, u),
      hints: H("On connaît le périmètre et la longueur d'un rectangle.", "P = 2 × (L + l).", `L + l = ${P} ÷ 2 = ${P / 2}.`, `l = ${P / 2} − ${L}.`),
      solution: `L + l = ${P} ÷ 2 = ${P / 2} ; l = ${P / 2} − ${L} = ${l} ${u}.`,
    };
  }),
  mk("para-aire", "Parallélogrammes", 2, { skill: "Aire : rectangle, carré, parallélogramme", ref: `${BOOK}, chap. 6 §3, ex. 3.e-3.i (p. 82-83)`, kw: ["aire", "rectangle", "carré", "parallélogramme", "base", "hauteur"] }, (c, r) => {
    const k = int(r, 0, 3);
    const L = dec(r, 4, 15, 1), l = dec(r, 3, 12, 1);
    if (k === 0) return {
      statement: c === "pur" ? `Calcule l'aire d'un rectangle dont les côtés mesurent ${fr(L)} m et ${fr(l)} m.` : `Une salle rectangulaire mesure ${fr(L)} m sur ${fr(l)} m. Quelle est sa surface au sol (en m²) ?`,
      answer: num(round(L * l, 2), 0.01),
      hints: H("On cherche l'aire d'un rectangle.", "A = longueur × largeur.", "Multiplie les deux dimensions.", `${fr(L)} × ${fr(l)}.`),
      solution: `A = ${fr(L)} × ${fr(l)} = ${fr(round(L * l, 2))} m².`,
    };
    if (k === 1) {
      const a = int(r, 3, 9), A = a * a;
      return {
        statement: c === "pur" ? `Calcule l'aire d'un carré de ${a} m de côté.` : `Un carrelage carré mesure ${a} dm de côté. Quelle est son aire (en dm²) ?`,
        answer: num(A),
        hints: H("On cherche l'aire d'un carré.", "A = côté × côté.", `Multiplie ${a} par lui-même.`, `${a} × ${a}.`),
        solution: `A = ${a} × ${a} = ${A}.`,
      };
    }
    if (k === 2) {
      const b = int(r, 6, 20), h = int(r, 3, 12), A = b * h;
      return {
        statement: c === "pur" ? `Un parallélogramme EFGH a pour aire ${A} m². Le côté [EF] mesure ${b} m. Quelle est la hauteur correspondante (en m) ?` : `Un champ en parallélogramme a une surface de ${A} m². Un côté mesure ${b} m. Quelle est la hauteur relative à ce côté (en m) ?`,
        answer: num(h, 0.001),
        hints: H("On connaît l'aire et la base, on cherche la hauteur.", "A = base × hauteur.", "hauteur = A ÷ base.", `${A} ÷ ${b}.`),
        solution: `hauteur = ${A} ÷ ${b} = ${h} m.`,
      };
    }
    const b = int(r, 5, 18), h = int(r, 3, 10);
    return {
      statement: c === "pur" ? `Calcule l'aire d'un parallélogramme de base ${b} cm et de hauteur ${h} cm.` : `Une plaque en forme de parallélogramme a une base de ${b} dm et une hauteur de ${h} dm. Quelle est son aire (en dm²) ?`,
      answer: num(b * h),
      hints: H("On cherche l'aire d'un parallélogramme.", "Il faut la base et la hauteur correspondante (perpendiculaire à la base).", "A = base × hauteur.", `${b} × ${h}.`),
      solution: `A = ${b} × ${h} = ${b * h}.`,
    };
  }),
  mk("para-proprietes", "Parallélogrammes", 1, { skill: "Diagonales et côtés d'un parallélogramme", ref: `${BOOK}, chap. 6 §1 (p. 77-80)`, kw: ["parallélogramme", "diagonales", "milieu", "côtés opposés"] }, (c, r) => {
    const d1 = int(r, 4, 24), d2 = int(r, 4, 24);
    const which = c === "propriete" ? 2 : int(r, 0, 1);
    if (which === 0) return {
      statement: c === "calcul" && int(r, 0, 1) === 0 ? `ABCD est un parallélogramme de centre M. AC = ${d1} cm. Calcule AM.` : `Dans un cerf-volant en parallélogramme ABCD, les deux baguettes se croisent en M. La baguette [AC] mesure ${d1} cm. Quelle est la longueur AM (en cm) ?`,
      answer: num(d1 / 2),
      hints: H("Les diagonales d'un parallélogramme se coupent en leur milieu.", "M est le milieu de [AC].", "AM = AC ÷ 2.", `${d1} ÷ 2.`),
      solution: `M est le milieu de [AC] : AM = ${d1} ÷ 2 = ${fr(d1 / 2)}.`,
    };
    if (which === 1) return {
      statement: int(r, 0, 1) === 0 ? `ABCD est un parallélogramme. AB = ${d1} cm et BC = ${d2} cm. Calcule DC + AD.` : `Un cadre est un parallélogramme ABCD avec AB = ${d1} cm et BC = ${d2} cm. Quelle est la somme DC + AD (en cm) ?`,
      answer: num(d1 + d2),
      hints: H("Les côtés opposés d'un parallélogramme ont la même longueur.", "DC = AB et AD = BC.", "DC + AD = AB + BC.", `${d1} + ${d2}.`),
      solution: `DC = AB = ${d1} et AD = BC = ${d2} ; DC + AD = ${d1 + d2}.`,
    };
    const pool: Item[] = [
      { q: "Les diagonales d'un quadrilatère se coupent en leur milieu. Que peut-on affirmer ?", good: "C'est un parallélogramme", bad: ["C'est un carré", "C'est un triangle", "C'est un trapèze"], why: "Lorsque les diagonales d'un quadrilatère se coupent en leur milieu, ce quadrilatère est un parallélogramme." },
      { q: "Un quadrilatère a ses côtés opposés de même longueur. Que peut-on affirmer ?", good: "C'est un parallélogramme", bad: ["C'est un rectangle", "C'est un losange", "On ne peut rien affirmer"], why: "Un quadrilatère qui a ses côtés opposés de même longueur est un parallélogramme." },
      { q: "Un rectangle est…", good: "un parallélogramme", bad: ["un triangle", "un cercle", "un quadrilatère sans propriété particulière"], why: "Un rectangle est un parallélogramme (il a ses angles droits)." },
      { q: "Un losange est…", good: "un parallélogramme", bad: ["un triangle", "un trapèze quelconque", "un quadrilatère sans propriété"], why: "Un losange est un parallélogramme dont les côtés ont la même longueur." },
    ];
    return qcm(r, pool, "Pense aux diagonales et aux côtés opposés.");
  }, [{ id: "calcul", label: "Calcul" }, { id: "propriete", label: "Propriété" }]),

  // ================= Chapitre 7 : Symétrie par rapport à une droite =================
  mk("symaxe-distance", "Figures symétriques par rapport à une droite", 1, { skill: "Symétrique d'un point par rapport à une droite : distances", ref: `${BOOK}, chap. 7 §1 (p. 90-92)`, kw: ["symétrique", "droite", "médiatrice", "axe", "distance"] }, (c, r) => {
    const d = int(r, 2, 40) / 2;
    if (int(r, 0, 1) === 0) return {
      statement: c === "pur" ? `A' est le symétrique de A par rapport à la droite (D). A est à ${fr(d)} cm de (D). Calcule AA'.` : `Un miroir est une droite (D). Une bougie A est à ${fr(d)} dm du miroir. Quelle est la distance entre la bougie et son image A' (en dm) ?`,
      answer: num(2 * d),
      hints: H("A et A' sont symétriques par rapport à (D).", "(D) est la médiatrice de [AA'].", "Elle coupe [AA'] en son milieu I : AI = IA'.", `AA' = 2 × ${fr(d)}.`),
      solution: `(D) est la médiatrice de [AA'], donc AA' = 2 × ${fr(d)} = ${fr(2 * d)}.`,
    };
    return {
      statement: c === "pur" ? `A et A' sont symétriques par rapport à (D). AA' = ${fr(2 * d)} cm. À quelle distance de (D) se trouve A ?` : `Un objet et son image dans un miroir (D) sont distants de ${fr(2 * d)} dm. À quelle distance du miroir se trouve l'objet (en dm) ?`,
      answer: num(d),
      hints: H("A et A' sont symétriques par rapport à (D).", "(D) est la médiatrice de [AA'].", "La distance de A à (D) est la moitié de AA'.", `${fr(2 * d)} ÷ 2.`),
      solution: `(D) est la médiatrice de [AA'] : la distance de A à (D) est ${fr(2 * d)} ÷ 2 = ${fr(d)}.`,
    };
  }),
  mk("symaxe-conservation", "Figures symétriques par rapport à une droite", 1, { skill: "Une symétrie axiale conserve longueurs et angles", ref: `${BOOK}, chap. 7 §2 (p. 93-94)`, kw: ["conservation", "symétrique", "longueur", "angle", "droite"] }, (c, r) => {
    const k = int(r, 0, 2);
    const v = int(r, 8, 60);
    const what = [
      { t: `[AB] mesure ${v} cm. [A'B'] est son symétrique par rapport à une droite (D). Quelle est la longueur A'B' (en cm) ?`, s: `Deux segments symétriques par rapport à une droite ont la même longueur : A'B' = AB = ${v} cm.`, u: "cm" },
      { t: `Un angle de ${v}° est reflété dans un miroir (symétrie par rapport à une droite). Combien mesure l'angle symétrique (en °) ?`, s: `Une symétrie axiale conserve les mesures d'angles : ${v}°.`, u: "°" },
      { t: `Le triangle ABC a pour périmètre ${v} cm. A'B'C' est son symétrique par rapport à une droite (D). Quel est le périmètre de A'B'C' (en cm) ?`, s: `Les segments symétriques ont les mêmes longueurs : le périmètre de A'B'C' est ${v} cm.`, u: "cm" },
    ][k];
    void c;
    return { statement: what.t, answer: num(v, 0, what.u), hints: H("Une symétrie par rapport à une droite ne déforme pas la figure.", "Longueurs et angles sont conservés.", "La réponse est la même valeur que dans la figure de départ.", "Recopie la valeur du départ."), solution: what.s };
  }, [{ id: "propriete", label: "Propriété de la symétrie" }]),
  mk("symaxe-axes", "Figures symétriques par rapport à une droite", 1, { skill: "Compter les axes de symétrie d'une figure", ref: `${BOOK}, chap. 7 §3 et ex. 30-32, 40, 45 (p. 96-105)`, kw: ["axes de symétrie", "rectangle", "carré", "losange", "triangle équilatéral", "triangle isocèle"] }, (_c, r) => {
    const fig: [string, number, string][] = [
      ["un triangle équilatéral", 3, "les trois médiatrices de ses côtés"],
      ["un rectangle (qui n'est pas un carré)", 2, "les médiatrices de ses côtés"],
      ["un carré", 4, "les deux médiatrices des côtés et les deux diagonales"],
      ["un losange (qui n'est pas un carré)", 2, "les droites qui portent ses diagonales"],
      ["un triangle isocèle (qui n'est pas équilatéral)", 1, "la médiatrice de sa base"],
      ["un triangle rectangle isocèle", 1, "la médiatrice de son hypoténuse"],
      ["un parallélogramme quelconque (ni rectangle, ni losange)", 0, "aucune droite ne convient : il n'a qu'un centre de symétrie"],
    ];
    const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
    if (int(r, 0, 2) === 0) {
      const target = pick(r, [3, 4, 0]);
      const good = fig.find((x) => x[1] === target)!;
      const picked: typeof fig = [];
      for (const o of shuffle(r, fig.filter((x) => x[1] !== target))) if (picked.length < 3 && !picked.some((p) => p[1] === o[1] && p[0] === o[0])) picked.push(o);
      return {
        statement: `Quelle figure a exactement ${target} axe${target > 1 ? "s" : ""} de symétrie ?`,
        answer: choice(r, [good[0], ...picked.map((x) => x[0])].map(cap), 0),
        hints: H("Un axe de symétrie partage la figure en deux parties qui se superposent par pliage.", "Plie mentalement chaque figure.", "Pense aux médiatrices des côtés et aux diagonales.", "Élimine les figures qui n'ont pas le bon nombre d'axes."),
        solution: `${cap(good[0])} a ${good[1]} axe${good[1] > 1 ? "s" : ""} de symétrie : ${good[2]}.`,
      };
    }
    const [name, n, why] = pick(r, fig);
    return {
      statement: `Combien ${name} a-t-il d'axes de symétrie ?`,
      answer: num(n),
      hints: H("Un axe de symétrie partage la figure en deux parties qui se superposent par pliage.", "Plie mentalement la figure.", "Pense aux médiatrices des côtés et aux diagonales.", "Dessine rapidement la figure."),
      solution: `${cap(name)} a ${n} axe${n > 1 ? "s" : ""} de symétrie : ${why}.`,
    };
  }, QCM),
  mk("losange", "Figures symétriques par rapport à une droite", 2, { skill: "Losange : périmètre et aire", ref: `${BOOK}, chap. 7 §3.2-3.3, ex. 3.d-3.e (p. 98-99) et ex. 37-39 (p. 104)`, kw: ["losange", "diagonales", "aire", "périmètre"] }, (c, r) => {
    const k = int(r, 0, 3);
    const u = pick(r, ["m", "cm"]);
    if (k === 0) { const a = int(r, 4, 25); return {
      statement: c === "pur" ? `Calcule le périmètre d'un losange dont les côtés mesurent ${a} ${u}.` : `Un cerf-volant a la forme d'un losange de ${a} ${u} de côté. Quelle longueur de ficelle borde son contour (en ${u}) ?`,
      answer: num(4 * a), hints: H("Les côtés d'un losange ont tous la même longueur.", "Un losange a 4 côtés égaux.", "P = 4 × côté.", `4 × ${a}.`), solution: `P = 4 × ${a} = ${4 * a} ${u}.`,
    }; }
    if (k === 1) { const a = int(r, 5, 40); return {
      statement: c === "pur" ? `Le périmètre d'un losange est ${4 * a} ${u}. Calcule la longueur de ses côtés.` : `Un cadre en losange a un contour de ${4 * a} ${u}. Quelle est la longueur de chaque côté (en ${u}) ?`,
      answer: num(a), hints: H("Les quatre côtés d'un losange sont égaux.", "P = 4 × côté.", "côté = P ÷ 4.", `${4 * a} ÷ 4.`), solution: `côté = ${4 * a} ÷ 4 = ${a} ${u}.`,
    }; }
    const d1 = int(r, 4, 16), d2 = int(r, 3, 14);
    if (k === 2) return {
      statement: c === "pur" ? `Calcule l'aire d'un losange dont les diagonales mesurent ${d1} ${u} et ${d2} ${u}.` : `Une vitre en losange a des diagonales de ${d1} dm et ${d2} dm. Quelle est son aire (en dm²) ?`,
      answer: num((d1 * d2) / 2), hints: H("On cherche l'aire d'un losange.", "On utilise les longueurs des deux diagonales.", "A = (1/2) × a × b.", `${d1} × ${d2} = ${d1 * d2}.`), solution: `A = ${d1} × ${d2} ÷ 2 = ${fr((d1 * d2) / 2)}.`,
    };
    const A = (d1 * d2) / 2;
    return {
      statement: c === "pur" ? `L'aire d'un losange est ${fr(A)} cm² et une diagonale mesure ${d1} cm. Calcule l'autre diagonale.` : `Un losange a une aire de ${fr(A)} cm² et une de ses diagonales mesure ${d1} cm. Combien mesure l'autre diagonale (en cm) ?`,
      answer: num(d2, 0.001), hints: H("On connaît l'aire et une diagonale.", "A = (a × b) ÷ 2.", "b = 2 × A ÷ a.", `2 × ${fr(A)} = ${fr(2 * A)}.`), solution: `b = 2 × ${fr(A)} ÷ ${d1} = ${d2}.`,
    };
  }),

  // ================= Chapitre 8 : Pavés et cylindres droits =================
  mk("pave-vocabulaire", "Pavés droits et cylindres droits", 1, { skill: "Faces, arêtes, sommets d'un pavé droit", ref: `${BOOK}, chap. 8 §1.1 (p. 108) et ex. 4 (p. 114)`, kw: ["pavé droit", "faces", "arêtes", "sommets", "cube"] }, (c, r) => {
    const q = [
      { t: "Combien un pavé droit a-t-il de faces ?", v: 6, s: "Un pavé droit a 6 faces rectangulaires." },
      { t: "Combien un pavé droit a-t-il d'arêtes ?", v: 12, s: "Un pavé droit a 12 arêtes : 4 sur le dessus, 4 sur le dessous et 4 qui les relient." },
      { t: "Combien un pavé droit a-t-il de sommets ?", v: 8, s: "Un pavé droit a 8 sommets : 4 en haut et 4 en bas." },
      { t: "Combien un cube a-t-il de faces ?", v: 6, s: "Un cube a 6 faces, toutes des carrés." },
      { t: "Combien un cube a-t-il de sommets ?", v: 8, s: "Un cube est un pavé droit : il a 8 sommets." },
      { t: "Combien un cube a-t-il d'arêtes ?", v: 12, s: "Un cube est un pavé droit : il a 12 arêtes, toutes de même longueur." },
      { t: "Combien d'arêtes partent d'un même sommet d'un pavé droit ?", v: 3, s: "Trois arêtes partent de chaque sommet : une longueur, une largeur et une hauteur." },
      { t: "Un pavé droit repose sur l'une de ses faces (sa base). Combien a-t-il de faces latérales ?", v: 4, s: "Un pavé droit a 6 faces : 2 bases et 4 faces latérales." },
      { t: "Combien un pavé droit a-t-il de paires de faces opposées ?", v: 3, s: "Les 6 faces se regroupent en 3 paires de faces opposées (deux faces sans arête commune)." },
      { t: "Combien un cylindre droit a-t-il de bases ?", v: 2, s: "Un cylindre droit a deux bases : deux disques superposables." },
      { t: "Combien de petits cubes de 1 cm d'arête faut-il pour remplir un cube de 2 cm d'arête ?", v: 8, s: "2 × 2 × 2 = 8 petits cubes." },
    ];
    const it = pick(r, q);
    void c;
    return { statement: it.t, answer: num(it.v), hints: H("Question de description du solide.", "Imagine une boîte en carton.", "Compte les faces, les arêtes (segments) et les sommets (coins).", "Dessine un pavé droit."), solution: it.s };
  }, QCM),
  mk("pave-volume", "Pavés droits et cylindres droits", 2, { skill: "Volume d'un pavé droit et d'un cube", ref: `${BOOK}, chap. 8 §1.5, ex. 1.c-1.e (p. 110-111) et ex. 5-7 (p. 114)`, kw: ["volume", "pavé droit", "cube", "arête", "cm³", "dm³"] }, (c, r) => {
    const k = int(r, 0, 3);
    if (k === 0) {
      const a = int(r, 3, 12), b = int(r, 2, 9), h = int(r, 2, 8);
      return {
        statement: c === "pur" ? `Calcule le volume d'un pavé droit dont les arêtes mesurent ${a} cm, ${b} cm et ${h} cm.` : `Une caisse a pour dimensions ${a} dm, ${b} dm et ${h} dm. Quel est son volume (en dm³) ?`,
        answer: num(a * b * h),
        hints: H("On cherche le volume d'un pavé droit.", "V = a × b × c.", "Multiplie les trois arêtes.", `${a} × ${b} = ${a * b}.`),
        solution: `V = ${a} × ${b} × ${h} = ${a * b * h}.`,
      };
    }
    if (k === 1) {
      const a = int(r, 2, 9), b = int(r, 2, 7), h = int(r, 2, 6), V = a * b * h;
      return {
        statement: c === "pur" ? `Un pavé droit a un volume de ${V} m³ et deux arêtes de ${a} m et ${b} m. Calcule la troisième arête.` : `Un conteneur de ${V} m³ a une longueur de ${a} m et une largeur de ${b} m. Quelle est sa hauteur (en m) ?`,
        answer: num(h),
        hints: H("On connaît le volume et deux arêtes.", "V = a × b × c.", "c = V ÷ (a × b).", `${a} × ${b} = ${a * b}.`),
        solution: `c = ${V} ÷ (${a} × ${b}) = ${V} ÷ ${a * b} = ${h} m.`,
      };
    }
    if (k === 2) {
      const a = int(r, 2, 12);
      return {
        statement: c === "pur" ? `Calcule le volume d'un cube de ${a} cm d'arête.` : `Un dé géant a la forme d'un cube de ${a} dm d'arête. Quel est son volume (en dm³) ?`,
        answer: num(a ** 3),
        hints: H("Un cube est un pavé droit dont toutes les arêtes sont égales.", "V = a × a × a.", "Multiplie trois fois l'arête.", `${a} × ${a} = ${a * a}.`),
        solution: `V = ${a} × ${a} × ${a} = ${a ** 3}.`,
      };
    }
    const a = int(r, 2, 9), b = int(r, 2, 9), h = int(r, 2, 9);
    return {
      statement: c === "pur" ? `Un pavé droit a pour arêtes ${a} dm, ${b} dm et ${h * 10} cm. Calcule son volume en dm³.` : `Une caisse mesure ${a} dm de long, ${b} dm de large et ${h * 10} cm de haut. Quel est son volume (en dm³) ?`,
      answer: num(a * b * h),
      hints: H("Les arêtes ne sont pas toutes dans la même unité.", "Convertis tout en dm : 10 cm = 1 dm.", `${h * 10} cm = ${h} dm.`, `${a} × ${b} × ${h}.`),
      solution: `${h * 10} cm = ${h} dm ; V = ${a} × ${b} × ${h} = ${a * b * h} dm³.`,
    };
  }),
  mk("cube-petits-cubes", "Pavés droits et cylindres droits", 3, { skill: "Gros cube peint : compter les petits cubes", ref: `${BOOK}, chap. 8, ex. 11 (p. 115)`, kw: ["cube", "petits cubes", "faces peintes", "dénombrement"] }, (c, r) => {
    const n = int(r, 3, 8);
    const q = int(r, 0, 3);
    const data = [
      { t: "aucune face peinte", v: (n - 2) ** 3, s: `Ce sont les cubes intérieurs : (${n} − 2)³ = ${(n - 2) ** 3}.` },
      { t: "exactement une face peinte", v: 6 * (n - 2) ** 2, s: `Chaque face a (${n} − 2)² = ${(n - 2) ** 2} cubes de ce type ; 6 faces : ${6 * (n - 2) ** 2}.` },
      { t: "exactement deux faces peintes", v: 12 * (n - 2), s: `Chaque arête a ${n - 2} cubes de ce type ; 12 arêtes : ${12 * (n - 2)}.` },
      { t: "trois faces peintes", v: 8, s: "Ce sont les cubes des 8 coins." },
    ][q];
    void c;
    return {
      statement: `Un gros cube de ${n} petits cubes d'arête est assemblé avec ${n ** 3} petits cubes, puis peint sur toutes ses faces extérieures. Combien de petits cubes ont ${data.t} ?`,
      answer: num(data.v),
      hints: H("On compte les petits cubes selon leur position dans le gros cube.", "Les coins, les arêtes, les faces et l'intérieur n'ont pas le même nombre de faces peintes.", "Retire les deux couches extérieures pour compter l'intérieur.", `Une rangée compte ${n} petits cubes, ${n - 2} sans les coins.`),
      solution: data.s,
    };
  }, [{ id: "denombrement", label: "Dénombrement" }]),
  mk("cylindre", "Pavés droits et cylindres droits", 3, { skill: "Cylindre droit : aire latérale et volume (π ≈ 3,14)", ref: `${BOOK}, chap. 8 §2.3, ex. 2.g-2.h (p. 113) et ex. 9-10 (p. 114)`, kw: ["cylindre", "volume", "aire latérale", "rayon", "hauteur", "pi"] }, (c, r) => {
    const R = pick(r, [2, 3, 4, 5, 10]), h = int(r, 2, 12);
    const k = int(r, 0, 2);
    if (k === 0) {
      const V = round(3.14 * R * R * h, 2);
      return {
        statement: c === "pur" ? `Calcule le volume d'un cylindre droit de rayon ${R} cm et de hauteur ${h} cm (π ≈ 3,14).` : `Une boîte de conserve cylindrique a un rayon de ${R} cm et une hauteur de ${h} cm. Quel est son volume (en cm³, π ≈ 3,14) ?`,
        answer: num(V, 0.01),
        hints: H("On cherche le volume d'un cylindre droit.", "V = aire de la base × hauteur.", `L'aire de la base est celle d'un disque : 3,14 × ${R} × ${R}.`, `3,14 × ${R * R} = ${fr(round(3.14 * R * R, 2))}.`),
        solution: `V = 3,14 × ${R} × ${R} × ${h} = ${fr(V)} cm³.`,
      };
    }
    if (k === 1) {
      const L = round(2 * 3.14 * R * h, 2);
      return {
        statement: c === "pur" ? `Calcule l'aire de la surface latérale d'un cylindre droit de rayon ${R} cm et de hauteur ${h} cm (π ≈ 3,14).` : `On colle une étiquette sur le tour d'une boîte cylindrique de rayon ${R} cm et de hauteur ${h} cm. Quelle est son aire (en cm², π ≈ 3,14) ?`,
        answer: num(L, 0.01),
        hints: H("La surface latérale se déplie en rectangle.", "Sa longueur est le périmètre de la base, sa largeur est la hauteur.", `Périmètre de la base : 2 × 3,14 × ${R}.`, `${fr(round(2 * 3.14 * R, 2))} × ${h}.`),
        solution: `A = (2 × 3,14 × ${R}) × ${h} = ${fr(L)} cm².`,
      };
    }
    const V = round(3.14 * R * R * h, 2);
    return {
      statement: c === "pur" ? `Un cylindre de rayon ${R} cm a un volume de ${fr(V)} cm³ (π ≈ 3,14). Calcule sa hauteur.` : `Un seau cylindrique de rayon ${R} dm contient ${fr(V)} dm³ lorsqu'il est plein (π ≈ 3,14). Quelle est sa hauteur (en dm) ?`,
      answer: num(h, 0.01),
      hints: H("On connaît le volume et le rayon, on cherche la hauteur.", "V = 3,14 × rayon² × hauteur.", "hauteur = V ÷ (3,14 × rayon²).", `3,14 × ${R * R} = ${fr(round(3.14 * R * R, 2))}.`),
      solution: `hauteur = ${fr(V)} ÷ ${fr(round(3.14 * R * R, 2))} = ${h}.`,
    };
  }),
  mk("capacite-litres", "Pavés droits et cylindres droits", 3, { skill: "Volumes et litres : 1 dm³ = 1 litre", ref: `${BOOK}, chap. 8, ex. 10 et 18-21 (p. 114-116)`, kw: ["litres", "capacité", "dm³", "réservoir", "débit"] }, (c, r) => {
    const a = pick(r, [1.2, 2, 2.5, 3, 4, 5]), b = pick(r, [1, 1.5, 2, 3]), h = pick(r, [1, 1.5, 2]);
    const V = round(a * b * h * 1000, 3); // litres
    void c;
    return {
      statement: `Un réservoir en forme de pavé droit a pour dimensions intérieures ${fr(a)} m, ${fr(b)} m et ${fr(h)} m. Quelle est sa capacité en litres ? (1 dm³ = 1 l)`,
      answer: num(V, 0.001, "l"),
      hints: H("On cherche une capacité : volume puis conversion.", "1 m³ = 1 000 dm³ et 1 dm³ = 1 litre.", "Calcule V = a × b × c en m³, puis multiplie par 1 000.", `${fr(a)} × ${fr(b)} × ${fr(h)} = ${fr(round(a * b * h, 3))} m³.`),
      solution: `V = ${fr(a)} × ${fr(b)} × ${fr(h)} = ${fr(round(a * b * h, 3))} m³ = ${fr(round(a * b * h * 1000, 3))} dm³ = ${fr(V)} litres.`,
    };
  }, [{ id: "reservoir", label: "Réservoir" }]),
);
