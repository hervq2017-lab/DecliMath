import { ContextDef, fcfa, fr, GENERIC_CTX, int, N, num, pick, register, round, Rng, scene, Template, Instance, gcd } from "./core";

const m = (level: Parameters<typeof N>[1], title: string) => N("maths", level, title);
const mk = (
  id: string, notionId: string, difficulty: 1 | 2 | 3,
  gen: (ctx: string, r: Rng) => Instance, contexts: ContextDef[] = ABS,
): Template => ({ id, notionId, difficulty, contexts, gen });

/** Contextes pour le calcul abstrait : même compétence, énoncé pur ou en situation. */
const ABS: ContextDef[] = [
  { id: "pur", label: "Calcul direct" },
  { id: "situation", label: "En situation" },
];
const WHO = ["Awa", "Moussa", "Kouadio", "Fatou", "Yao", "Mariam"];
const choose = (n: number, k: number) => {
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
  return Math.round(c);
};
const H = (a: string, b: string, c: string, d: string): [string, string, string, string] => [a, b, c, d];

register(
  // ---- 6ème ----
  mk("m-6e-frac", m("6e", "Fractions"), 1, (c, r) => {
    const den = pick(r, [3, 4, 5, 6, 8]), num_ = int(r, 1, den - 1), k = int(r, 3, 12), tot = den * k;
    const s = scene(pick(r, GENERIC_CTX).id, r);
    const txt = c === "pur" ? `Calculer ${num_}/${den} de ${tot}.` : `${s.who} possède ${tot} ${s.things}. Il en vend les ${num_}/${den}. Combien en vend-il ?`;
    return { statement: txt, answer: num(k * num_), hints: H("On cherche une fraction d'une quantité.", `Partage ${tot} en ${den} parts égales.`, `Fraction d'une quantité : diviser par le dénominateur (${den}), puis multiplier par le numérateur (${num_}).`, `${tot} ÷ ${den} = ${k}.`), solution: `${tot} ÷ ${den} = ${k} ; ${k} × ${num_} = ${k * num_}.` };
  }),
  mk("m-6e-dec", m("6e", "Décimaux et opérations"), 1, (c, r) => {
    const a = round(int(r, 12, 99) / 10, 1), b = int(r, 3, 9);
    const v = round(a * b, 1);
    return {
      statement: c === "pur" ? `Calculer ${fr(a)} × ${b}.` : `Une corde mesure ${fr(a)} m. On en prend ${b} identiques bout à bout. Quelle longueur totale (en m) obtient-on ?`,
      answer: num(v, 0.001),
      hints: H("On multiplie un décimal par un entier.", "Multiplie comme si la virgule n'existait pas.", "Puis replace la virgule : il y a autant de décimales dans le résultat que dans le décimal de départ.", `${Math.round(a * 10)} × ${b} = ${Math.round(a * 10) * b}.`),
      solution: `${fr(a)} × ${b} = ${fr(v)}.`,
    };
  }),
  mk("m-6e-angles", m("6e", "Droites et angles"), 1, (c, r) => {
    const a = int(r, 20, 160);
    return {
      statement: c === "pur" ? `Deux angles sont supplémentaires. L'un mesure ${a}°. Combien mesure l'autre ?` : `Sur une feuille, une droite est coupée par un segment qui forme un angle de ${a}° d'un côté. Quel est l'angle de l'autre côté (en °) ?`,
      answer: num(180 - a, 0, "°"),
      hints: H("Deux angles côte à côte sur une droite forment un angle plat.", "Un angle plat mesure 180°.", "Angle cherché = 180° − angle connu.", `180 − ${a}.`),
      solution: `180 − ${a} = ${180 - a}°.`,
    };
  }),
  mk("m-6e-perim", m("6e", "Périmètres et aires"), 2, (c, r) => {
    const R = int(r, 2, 10);
    return {
      statement: c === "pur" ? `Calculer le périmètre d'un cercle de rayon ${R} cm (π ≈ 3,14).` : `Une roue de vélo a un rayon de ${R} dm. Quelle distance (en dm) parcourt-elle en un tour complet ? (π ≈ 3,14)`,
      answer: num(round(2 * 3.14 * R, 2), 0.01),
      hints: H("On cherche la longueur du tour du cercle.", "Cette longueur s'appelle la circonférence.", "P = 2 × π × rayon.", `2 × 3,14 × ${R}.`),
      solution: `P = 2 × 3,14 × ${R} = ${fr(round(2 * 3.14 * R, 2))}.`,
    };
  }),

  // ---- 5ème ----
  mk("m-5e-rel", m("5e", "Nombres relatifs"), 1, (c, r) => {
    const a = int(r, -15, -2), b = int(r, 3, 14);
    return {
      statement: c === "pur" ? `Calculer (${a}) + (${b}).` : `La température à l'aube était de ${a} °C (en altitude). Elle augmente de ${b} °C. Quelle est la nouvelle température ?`,
      answer: num(a + b, 0, c === "pur" ? undefined : "°C"),
      hints: H("On additionne un négatif et un positif.", "Compare les distances à zéro.", "Signe du plus grand en valeur absolue, puis soustrais les valeurs absolues.", `|${a}| = ${-a} et |${b}| = ${b}.`),
      solution: `${a} + ${b} = ${a + b}.`,
    };
  }),
  mk("m-5e-lit", m("5e", "Calcul littéral"), 2, (c, r) => {
    const a = int(r, 2, 7), b = int(r, 1, 9), x = int(r, 2, 8);
    return {
      statement: c === "pur" ? `Calculer A = ${a}x + ${b} pour x = ${x}.` : `Un taxi facture ${b} (en centaines de FCFA) de prise en charge plus ${a} par km. Combien (en centaines de FCFA) pour ${x} km ?`,
      answer: num(a * x + b),
      hints: H("On remplace la lettre par une valeur.", "Dans une expression, la multiplication est prioritaire sur l'addition.", `Remplace x par ${x} puis calcule.`, `${a} × ${x} = ${a * x}.`),
      solution: `${a} × ${x} + ${b} = ${a * x} + ${b} = ${a * x + b}.`,
    };
  }),
  mk("m-5e-tri", m("5e", "Triangles et parallélogrammes"), 1, (c, r) => {
    const a = int(r, 30, 90), b = int(r, 30, 90 - 1);
    return {
      statement: c === "pur" ? `Dans un triangle ABC, A = ${a}° et B = ${b}°. Calculer l'angle C.` : `Un toit a la forme d'un triangle : deux de ses angles mesurent ${a}° et ${b}°. Combien mesure le troisième (°) ?`,
      answer: num(180 - a - b, 0, "°"),
      hints: H("On cherche le troisième angle d'un triangle.", "La somme des angles d'un triangle est constante.", "La somme vaut 180°.", `180 − ${a} − ${b}.`),
      solution: `C = 180 − ${a} − ${b} = ${180 - a - b}°.`,
    };
  }),
  mk("m-5e-pct", m("5e", "Pourcentages"), 2, (c, r) => {
    const p = pick(r, [10, 20, 25, 30]), price = int(r, 5, 40) * 100;
    return {
      statement: c === "pur" ? `Augmenter ${price} de ${p} %.` : `Le prix d'un sac de riz est ${fcfa(price)}. Il augmente de ${p} %. Quel est le nouveau prix (en FCFA) ?`,
      answer: num(price + (price * p) / 100),
      hints: H("On ajoute une part du prix au prix de départ.", `Calcule d'abord ${p} % de ${price}.`, `Nouveau prix = ${price} × (1 + ${p}/100).`, `${p} % de ${price} = ${(price * p) / 100}.`),
      solution: `${price} + ${(price * p) / 100} = ${price + (price * p) / 100}.`,
    };
  }),

  // ---- 4ème ----
  mk("m-4e-puis", m("4e", "Puissances"), 1, (c, r) => {
    const a = int(r, 2, 5), n = int(r, 2, 4), k = int(r, 1, 3);
    return {
      statement: c === "pur" ? `Calculer ${a}^${n} × ${a}^${k}.` : `Une population de bactéries est multipliée par ${a} chaque heure. Elle vaut ${a}^${n} au départ de l'observation, puis encore ${k} heures passent. Quelle valeur atteint-elle (comme nombre entier) ?`,
      answer: num(a ** (n + k)),
      hints: H("On multiplie deux puissances de même base.", "Les exposants s'additionnent.", "aⁿ × aᵏ = aⁿ⁺ᵏ.", `Exposant total : ${n} + ${k}.`),
      solution: `${a}^${n + k} = ${a ** (n + k)}.`,
    };
  }),
  mk("m-4e-eq", m("4e", "Équations du premier degré"), 2, (c, r) => {
    const a = int(r, 2, 9), x = int(r, 1, 12), b = int(r, 1, 20);
    return {
      statement: c === "pur" ? `Résoudre ${a}x + ${b} = ${a * x + b}. Donner x.` : `${pick(r, WHO)} épargne ${b} 000 FCFA puis ajoute la même somme de x milliers FCFA pendant ${a} mois. Il obtient ${a * x + b} 000 FCFA. Combien de milliers de FCFA par mois (x) ?`,
      answer: num(x),
      hints: H("Il faut trouver la valeur inconnue x.", "Isole x en défaisant les opérations dans l'ordre inverse.", `Soustrais ${b} des deux côtés, puis divise par ${a}.`, `${a}x = ${a * x + b} − ${b} = ${a * x}.`),
      solution: `${a}x = ${a * x}, donc x = ${x}.`,
    };
  }),
  mk("m-4e-dev", m("4e", "Calcul littéral : développer"), 2, (c, r) => {
    const k = int(r, 2, 6), a = int(r, 1, 9), x = int(r, 2, 6);
    return {
      statement: c === "pur" ? `On développe B = ${k}(x + ${a}) puis on calcule B pour x = ${x}. Donner la valeur de B.` : `Un champ a ${k} rangées. Chaque rangée a x + ${a} plants avec x = ${x}. Combien de plants au total ?`,
      answer: num(k * (x + a)),
      hints: H("On applique la distributivité.", "k(a + b) = ka + kb.", `Développe : ${k}x + ${k * a}.`, `Remplace x par ${x}.`),
      solution: `${k}(x + ${a}) = ${k}x + ${k * a} = ${k * x + k * a}.`,
    };
  }),
  mk("m-4e-pyth", m("4e", "Théorème de Pythagore"), 2, (c, r) => {
    const [a, b, h] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
    return {
      statement: c === "pur" ? `Dans un triangle rectangle, les côtés de l'angle droit mesurent ${a} cm et ${b} cm. Calculer l'hypoténuse.` : `Une échelle est posée contre un mur : le pied est à ${a} m du mur et le haut touche le mur à ${b} m du sol. Quelle est la longueur de l'échelle (m) ?`,
      answer: num(h, 0, c === "pur" ? "cm" : "m"),
      hints: H("On cherche le plus grand côté d'un triangle rectangle.", "Il y a une relation entre les carrés des côtés.", "Hypoténuse² = a² + b².", `${a}² + ${b}² = ${a * a + b * b}.`),
      solution: `h² = ${a}² + ${b}² = ${a * a + b * b}, donc h = ${h}.`,
    };
  }),
  mk("m-4e-thales", m("4e", "Théorème de Thalès"), 3, (c, r) => {
    const k = pick(r, [2, 3, 4]), AM = int(r, 2, 6), AB = AM * k, ACk = int(r, 2, 6), AC = ACk * k, AN = ACk;
    return {
      statement: c === "pur"
        ? `Dans le triangle ABC, M ∈ [AB], N ∈ [AC] et (MN) // (BC). AB = ${AB}, AM = ${AM}, AC = ${AC}. Calculer AN.`
        : `Un terrain triangulaire ABC a AB = ${AB} m et AC = ${AC} m. Un chemin (MN), parallèle à (BC), coupe [AB] en M avec AM = ${AM} m et [AC] en N. Quelle est la longueur AN (m) ?`,
      answer: num(AN, 0.01, c === "pur" ? undefined : "m"),
      hints: H("Deux droites parallèles coupent deux côtés d'un triangle.", "Les rapports de longueurs sont égaux.", "AM/AB = AN/AC.", `AN = AC × AM / AB = ${AC} × ${AM} / ${AB}.`),
      solution: `AN = ${AC} × ${AM} / ${AB} = ${AN}.`,
    };
  }),

  // ---- 3ème ----
  mk("m-3e-rac", m("3e", "Racines carrées"), 2, (c, r) => {
    const k = int(r, 2, 6), a = pick(r, [2, 3, 5]);
    return {
      statement: c === "pur" ? `Écrire √${k * k * a} sous la forme k√${a}. Donner k.` : `Un carré a une aire de ${k * k * a} m². Son côté s'écrit k√${a} m. Donner k.`,
      answer: num(k),
      hints: H("On cherche un facteur carré parfait dans le radicande.", `Décompose ${k * k * a} = ${k * k} × ${a}.`, "√(a×b) = √a × √b.", `√${k * k} = ${k}.`),
      solution: `√${k * k * a} = √${k * k} × √${a} = ${k}√${a}.`,
    };
  }),
  mk("m-3e-sys", m("3e", "Systèmes d'équations"), 3, (c, r) => {
    const x = int(r, 2, 9), y = int(r, 1, 8), a = int(r, 2, 4), b = int(r, 1, 3);
    return {
      statement: c === "pur" ? `Résoudre : x + y = ${x + y} et ${a}x + ${b}y = ${a * x + b * y}. Donner x.` : `Une cantine achète x kg de riz (${a} centaines de FCFA le kg) et y kg de haricots (${b} centaines de FCFA le kg). Total : ${x + y} kg pour ${a * x + b * y} centaines de FCFA. Combien de kg de riz (x) ?`,
      answer: num(x),
      hints: H("Deux inconnues, deux équations.", "Exprime y en fonction de x avec la première équation.", "Substitue dans la seconde.", `y = ${x + y} − x.`),
      solution: `Substitution : ${a}x + ${b}(${x + y} − x) = ${a * x + b * y} donne ${a - b}x = ${a * x + b * y - b * (x + y)}, x = ${x}, y = ${y}.`,
    };
  }),
  mk("m-3e-affine", m("3e", "Fonctions linéaires et affines"), 2, (c, r) => {
    const a = int(r, 2, 6), b = int(r, 1, 9), x = int(r, 2, 10);
    return {
      statement: c === "pur" ? `Soit f(x) = ${a}x + ${b}. Calculer f(${x}).` : `Un abonnement coûte ${b} 000 FCFA plus ${a} 000 FCFA par mois. Combien (en milliers de FCFA) après ${x} mois ?`,
      answer: num(a * x + b),
      hints: H("On calcule la valeur de la fonction en un point.", "Remplace x par la valeur donnée.", `f(${x}) = ${a} × ${x} + ${b}.`, `${a} × ${x} = ${a * x}.`),
      solution: `f(${x}) = ${a * x} + ${b} = ${a * x + b}.`,
    };
  }),
  mk("m-3e-trigo", m("3e", "Trigonométrie"), 3, (c, r) => {
    const ang = pick(r, [30, 45, 60]), hyp = int(r, 4, 20);
    const v = round(hyp * Math.sin((ang * Math.PI) / 180), 2);
    return {
      statement: c === "pur" ? `Dans un triangle rectangle d'hypoténuse ${hyp} cm, un angle aigu mesure ${ang}°. Calculer le côté opposé à cet angle (arrondi au centième).` : `Une rampe de ${hyp} m forme un angle de ${ang}° avec le sol. À quelle hauteur (m) s'élève-t-elle ? (arrondi au centième)`,
      answer: num(v, 0.015),
      hints: H("On cherche un côté du triangle rectangle à l'aide d'un angle.", "Quel rapport relie le côté opposé et l'hypoténuse ?", "sin(angle) = opposé / hypoténuse.", `opposé = ${hyp} × sin(${ang}°).`),
      solution: `${hyp} × sin(${ang}°) ≈ ${fr(v)}.`,
    };
  }),
  mk("m-3e-proba", m("3e", "Probabilités élémentaires"), 1, (c, r) => {
    const rouge = int(r, 2, 8), bleu = int(r, 2, 8), tot = rouge + bleu, d = gcd(rouge, tot);
    return {
      statement: c === "pur" ? `Une urne contient ${rouge} boules rouges et ${bleu} boules bleues. On tire une boule au hasard. Probabilité d'obtenir une rouge, arrondie au centième ?` : `Dans un sac, ${rouge} jetons portent le numéro d'une équipe locale et ${bleu} celui d'une autre. On en tire un au hasard : probabilité que ce soit l'équipe locale (arrondi au centième) ?`,
      answer: num(round(rouge / tot, 2), 0.006),
      hints: H("Tirage au hasard : chances égales.", "Probabilité = cas favorables / cas possibles.", `Cas possibles : ${rouge} + ${bleu}.`, `Cas favorables : ${rouge}.`),
      solution: `${rouge}/${tot} = ${rouge / d}/${tot / d} ≈ ${fr(round(rouge / tot, 2))}.`,
    };
  }),

  // ---- Seconde ----
  mk("m-2nde-fonc", m("2nde", "Fonctions : image et antécédent"), 2, (c, r) => {
    const a = int(r, 1, 4), b = int(r, 1, 9), x = int(r, -4, 5);
    return {
      statement: c === "pur" ? `Soit f(x) = ${a}x² + ${b}. Calculer l'image de ${x}.` : `La hauteur d'une balle (en dm) est donnée par h(t) = ${a}t² + ${b} (modèle simplifié). Calculer h(${x}).`,
      answer: num(a * x * x + b),
      hints: H("L'image de x est f(x).", "Remplace x par la valeur, en gardant les parenthèses pour un nombre négatif.", `f(${x}) = ${a} × (${x})² + ${b}.`, `(${x})² = ${x * x}.`),
      solution: `${a} × ${x * x} + ${b} = ${a * x * x + b}.`,
    };
  }),
  mk("m-2nde-ineq", m("2nde", "Équations et inéquations"), 2, (c, r) => {
    const a = int(r, 2, 6), b = int(r, 1, 15), k = int(r, 20, 60);
    const x = Math.floor((k - b) / a) + 1;
    return {
      statement: c === "pur" ? `Quel est le plus petit entier x tel que ${a}x + ${b} > ${k} ?` : `Un forfait coûte ${b} FCFA de base + ${a} FCFA par SMS. Au bout de combien de SMS (plus petit entier) le coût dépasse-t-il ${k} FCFA ?`,
      answer: num(x),
      hints: H("On cherche le premier entier qui vérifie l'inégalité stricte.", "Résous l'inéquation comme une équation.", `${a}x > ${k} − ${b}, donc x > (${k} − ${b}) / ${a}.`, `(${k} − ${b}) / ${a} = ${fr(round((k - b) / a, 2))}.`),
      solution: `x > ${fr(round((k - b) / a, 2))}, donc le plus petit entier est ${x}.`,
    };
  }),
  mk("m-2nde-vect", m("2nde", "Vecteurs et coordonnées"), 2, (c, r) => {
    const xa = int(r, -4, 4), ya = int(r, -4, 4), xb = int(r, -3, 7), yb = int(r, -3, 7);
    return {
      statement: c === "pur" ? `A(${xa} ; ${ya}) et B(${xb} ; ${yb}). Calculer la première coordonnée (abscisse) du vecteur AB.` : `Un bateau part du point A(${xa} ; ${ya}) et arrive en B(${xb} ; ${yb}) sur une carte quadrillée (1 unité = 1 km). De combien de km s'est-il déplacé horizontalement (valeur algébrique) ?`,
      answer: num(xb - xa),
      hints: H("On compare l'arrivée et le départ.", "Le vecteur AB = (xB − xA ; yB − yA).", "Prends l'abscisse seulement.", `${xb} − (${xa}).`),
      solution: `xB − xA = ${xb} − (${xa}) = ${xb - xa}.`,
    };
  }),
  mk("m-2nde-denom", m("2nde", "Probabilités et dénombrement"), 2, (c, r) => {
    const n = int(r, 6, 10), k = 2;
    return {
      statement: c === "pur" ? `De combien de façons peut-on choisir ${k} éléments parmi ${n} (sans ordre) ?` : `Dans une classe, on choisit ${k} délégués parmi ${n} candidats (sans ordre). Combien de choix possibles ?`,
      answer: num(choose(n, k)),
      hints: H("On compte des groupes, l'ordre n'a pas d'importance.", "C'est une combinaison.", "C(n,2) = n(n−1)/2.", `${n} × ${n - 1} / 2.`),
      solution: `C(${n},2) = ${n} × ${n - 1} / 2 = ${choose(n, k)}.`,
    };
  }),

  // ---- Première ----
  mk("m-1ere-disc", m("1ere", "Second degré"), 2, (c, r) => {
    const a = int(r, 1, 3), b = int(r, -8, 8), cc = int(r, -6, 4);
    const D = b * b - 4 * a * cc;
    return {
      statement: c === "pur" ? `Calculer le discriminant de ${a}x² + (${b})x + (${cc}).` : `L'aire d'un enclos dépend de x selon ${a}x² + (${b})x + (${cc}) = 0. Calculer le discriminant Δ de cette équation.`,
      answer: num(D),
      hints: H("Le discriminant renseigne sur le nombre de solutions.", "Δ se calcule avec les trois coefficients.", "Δ = b² − 4ac.", `b² = ${b * b} et 4ac = ${4 * a * cc}.`),
      solution: `Δ = ${b}² − 4×${a}×(${cc}) = ${b * b} − (${4 * a * cc}) = ${D}.`,
    };
  }),
  mk("m-1ere-suite", m("1ere", "Suites arithmétiques"), 2, (c, r) => {
    const u0 = int(r, 2, 15), d = int(r, 2, 9), n = int(r, 8, 20);
    return {
      statement: c === "pur" ? `(uₙ) est arithmétique de premier terme u₀ = ${u0} et de raison ${d}. Calculer u${n}.` : `${pick(r, WHO)} participe à une tontine : le mois 0, elle verse ${u0} milliers de FCFA, puis chaque mois elle verse ${d} milliers de plus que le précédent. Combien verse-t-elle (en milliers de FCFA) le mois ${n} ?`,
      answer: num(u0 + n * d),
      hints: H("On cherche un terme éloigné d'une suite régulière.", "À chaque rang on ajoute toujours la même valeur.", "uₙ = u₀ + n × r.", `${n} × ${d} = ${n * d}.`),
      solution: `u${n} = ${u0} + ${n}×${d} = ${u0 + n * d}.`,
    };
  }),
  mk("m-1ere-deriv", m("1ere", "Dérivation (1ère)"), 2, (c, r) => {
    const a = int(r, 2, 6), b = int(r, 1, 9), cc = int(r, 1, 9), x0 = int(r, 1, 5);
    return {
      statement: c === "pur" ? `Soit f(x) = ${a}x² + ${b}x + ${cc}. Calculer f'(${x0}).` : `Le coût de fabrication est C(x) = ${a}x² + ${b}x + ${cc}. Calculer le coût marginal C'(${x0}).`,
      answer: num(2 * a * x0 + b),
      hints: H("On cherche la pente de la tangente.", "Dérive terme à terme.", "(xⁿ)' = n·xⁿ⁻¹ et la dérivée d'une constante est 0.", `f'(x) = ${2 * a}x + ${b}.`),
      solution: `f'(x) = ${2 * a}x + ${b} ; f'(${x0}) = ${2 * a * x0 + b}.`,
    };
  }),
  mk("m-1ere-sc", m("1ere", "Produit scalaire plan"), 2, (c, r) => {
    const u = [int(r, -4, 5), int(r, -4, 5)], v = [int(r, -3, 5), int(r, -4, 4)];
    return {
      statement: c === "pur" ? `Dans un repère orthonormé, u(${u.join(" ; ")}) et v(${v.join(" ; ")}). Calculer u·v.` : `Deux forces ont pour composantes (${u.join(" ; ")}) et (${v.join(" ; ")}) dans un repère orthonormé. Calculer leur produit scalaire.`,
      answer: num(u[0] * v[0] + u[1] * v[1]),
      hints: H("Le produit scalaire est un nombre.", "Avec les coordonnées dans un repère orthonormé, il se calcule directement.", "u·v = xx' + yy'.", `${u[0]} × ${v[0]} = ${u[0] * v[0]}.`),
      solution: `${u[0] * v[0]} + ${u[1] * v[1]} = ${u[0] * v[0] + u[1] * v[1]}.`,
    };
  }),
  mk("m-1ere-pcond", m("1ere", "Probabilités conditionnelles"), 2, (c, r) => {
    const pa = pick(r, [0.2, 0.4, 0.5, 0.6]), pb = pick(r, [0.25, 0.5, 0.8]);
    return {
      statement: c === "pur" ? `P(A) = ${fr(pa)} et P(B | A) = ${fr(pb)}. Calculer P(A ∩ B).` : `${fr(pa * 100)} % des élèves d'un lycée prennent le car ; parmi eux, ${fr(pb * 100)} % arrivent en retard. Quelle est la probabilité qu'un élève pris au hasard prenne le car ET arrive en retard ?`,
      answer: num(round(pa * pb, 3), 0.0006),
      hints: H("On cherche la probabilité que deux événements arrivent ensemble.", "Utilise la formule des probabilités conditionnelles.", "P(A ∩ B) = P(A) × P(B | A).", `${fr(pa)} × ${fr(pb)}.`),
      solution: `P(A∩B) = ${fr(pa)} × ${fr(pb)} = ${fr(round(pa * pb, 3))}.`,
    };
  }),

  // ---- Terminale ----
  mk("m-tle-deriv", m("tle", "Dérivation"), 3, (c, r) => {
    const a = int(r, 2, 4), b = int(r, 1, 5), n = int(r, 2, 4), x0 = int(r, 0, 2);
    const v = n * a * (a * x0 + b) ** (n - 1);
    return {
      statement: c === "pur" ? `Soit f(x) = (${a}x + ${b})^${n}. Calculer f'(${x0}).` : `La charge d'un système est f(t) = (${a}t + ${b})^${n}. Calculer la vitesse de variation f'(${x0}).`,
      answer: num(v),
      hints: H("f est une fonction composée u(x)ⁿ.", "On utilise la dérivée d'une puissance de fonction.", "(uⁿ)' = n·u'·uⁿ⁻¹.", `u = ${a}x + ${b}, u' = ${a}.`),
      solution: `f'(x) = ${n}×${a}×(${a}x+${b})^${n - 1}. f'(${x0}) = ${v}.`,
    };
  }),
  mk("m-tle-int", m("tle", "Calcul intégral"), 2, (c, r) => {
    const p = pick(r, [2, 4, 6]), q = int(r, 1, 7), b = int(r, 2, 5);
    return {
      statement: c === "pur" ? `Calculer I = ∫₀^${b} (${p}x + ${q}) dx.` : `Un débit (en L/min) vaut ${p}t + ${q}. Quel volume (L) s'écoule entre t = 0 et t = ${b} min ?`,
      answer: num((p * b * b) / 2 + q * b),
      hints: H("On calcule une aire algébrique sous une courbe.", "Il faut une primitive F, puis F(b) − F(0).", "Primitive de px + q : p·x²/2 + q·x.", `F(x) = ${p / 2}x² + ${q}x.`),
      solution: `I = F(${b}) − F(0) = ${(p * b * b) / 2 + q * b}.`,
    };
  }),
  mk("m-tle-lim", m("tle", "Limites et continuité"), 3, (c, r) => {
    const a = int(r, 2, 9), b = int(r, 1, 6), cc = int(r, 1, 4), d = int(r, 1, 5);
    return {
      statement: c === "pur" ? `Calculer la limite en +∞ de f(x) = (${a}x + ${b}) / (${cc}x + ${d}). Arrondir au centième.` : `Une population suit P(t) = (${a}t + ${b}) / (${cc}t + ${d}) (en millions). Vers quelle valeur tend-elle quand t → +∞ ? (arrondi au centième)`,
      answer: num(round(a / cc, 2), 0.006),
      hints: H("On étudie le comportement pour de très grandes valeurs.", "Les termes de plus haut degré dominent.", "Factorise x au numérateur et au dénominateur.", `Le quotient tend vers ${a}/${cc}.`),
      solution: `(${a}x+${b})/(${cc}x+${d}) = (${a}+${b}/x)/(${cc}+${d}/x) → ${a}/${cc} ≈ ${fr(round(a / cc, 2))}.`,
    };
  }),
  mk("m-tle-ln", m("tle", "Logarithme et exponentielle"), 3, (c, r) => {
    const k = pick(r, [2, 3, 5, 10, 20]);
    return {
      statement: c === "pur" ? `Résoudre eˣ = ${k}. Donner x arrondi au centième.` : `Une culture de bactéries vaut e^t (t en heures, unité de départ 1). Au bout de combien d'heures atteint-elle ${k} fois sa valeur initiale ? (arrondi au centième)`,
      answer: num(round(Math.log(k), 2), 0.006),
      hints: H("Il faut « défaire » l'exponentielle.", "La fonction réciproque de eˣ est le logarithme népérien.", "eˣ = k équivaut à x = ln(k).", `Calcule ln(${k}) à la calculatrice.`),
      solution: `x = ln(${k}) ≈ ${fr(round(Math.log(k), 2))}.`,
    };
  }),
  mk("m-tle-orth", m("tle", "Orthogonalité dans l'espace"), 2, (c, r) => {
    const u = [int(r, -4, 5), int(r, -4, 5), int(r, 1, 5)], w = [int(r, -3, 5), int(r, -4, 4), int(r, -3, 5)];
    return {
      statement: c === "pur" ? `Dans un repère orthonormé de l'espace, u(${u.join(" ; ")}) et v(${w.join(" ; ")}). Calculer u·v.` : `Deux câbles d'une antenne ont pour directions (${u.join(" ; ")}) et (${w.join(" ; ")}) dans un repère orthonormé. Calculer le produit scalaire des vecteurs directeurs.`,
      answer: num(u[0] * w[0] + u[1] * w[1] + u[2] * w[2]),
      hints: H("On cherche un nombre qui permet de tester l'orthogonalité.", "Utilise les coordonnées.", "u·v = xx' + yy' + zz'.", `${u[0]} × ${w[0]} = ${u[0] * w[0]}.`),
      solution: `${u[0] * w[0]} + ${u[1] * w[1]} + ${u[2] * w[2]} = ${u[0] * w[0] + u[1] * w[1] + u[2] * w[2]}.`,
    };
  }),
  mk("m-tle-cplx", m("tle", "Nombres complexes"), 3, (c, r) => {
    const [a, b, h] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]);
    return {
      statement: c === "pur" ? `Calculer le module de z = ${a} + ${b}i.` : `Dans le plan complexe, un point a pour affixe z = ${a} + ${b}i. À quelle distance de l'origine se trouve-t-il ?`,
      answer: num(h),
      hints: H("Le module est la distance à l'origine.", "Il s'obtient à partir des parties réelle et imaginaire.", "|a + bi| = √(a² + b²).", `${a}² + ${b}² = ${a * a + b * b}.`),
      solution: `|z| = √(${a * a} + ${b * b}) = √${a * a + b * b} = ${h}.`,
    };
  }),
  mk("m-tle-binom", m("tle", "Loi binomiale"), 3, (c, r) => {
    const n = int(r, 4, 8), k = int(r, 1, n - 1), p = pick(r, [0.2, 0.25, 0.4, 0.5]);
    const v = round(choose(n, k) * p ** k * (1 - p) ** (n - k), 3);
    return {
      statement: c === "pur" ? `X suit B(${n} ; ${fr(p)}). Calculer P(X = ${k}) à 10⁻³ près.` : `Un joueur a une probabilité ${fr(p)} de marquer un tir. Il tire ${n} fois, indépendamment. Probabilité de marquer exactement ${k} fois (à 10⁻³ près) ?`,
      answer: num(v, 0.0015),
      hints: H(`On compte les succès parmi ${n} épreuves identiques.`, "Il y a plusieurs façons de placer les succès.", "P(X = k) = C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ.", `C(${n},${k}) = ${choose(n, k)}.`),
      solution: `${choose(n, k)} × ${fr(p)}^${k} × ${fr(round(1 - p, 2))}^${n - k} ≈ ${fr(v)}.`,
    };
  }),
);
