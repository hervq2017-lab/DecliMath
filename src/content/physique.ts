import { ContextDef, fr, int, N, num, pick, register, round, Rng, Template, Instance } from "./core";

const p = (level: Parameters<typeof N>[1], title: string) => N("physique", level, title);
const H = (a: string, b: string, c: string, d: string): [string, string, string, string] => [a, b, c, d];
const mk = (id: string, notionId: string, difficulty: 1 | 2 | 3, contexts: ContextDef[], gen: (ctx: string, r: Rng) => Instance): Template =>
  ({ id, notionId, difficulty, contexts, gen });

const ELEC: ContextDef[] = [
  { id: "maison", label: "À la maison" },
  { id: "atelier", label: "À l'atelier" },
  { id: "solaire", label: "Énergie solaire" },
];
const MOVE: ContextDef[] = [
  { id: "moto", label: "Moto-taxi" },
  { id: "pirogue", label: "Pirogue" },
  { id: "camion", label: "Camion" },
];
const LAB: ContextDef[] = [
  { id: "labo", label: "Au laboratoire" },
  { id: "quotidien", label: "Vie quotidienne" },
];
const appareil = (c: string) => (c === "maison" ? "un ventilateur" : c === "atelier" ? "une perceuse" : "une lampe alimentée par un panneau solaire");
const engin = (c: string) => (c === "moto" ? "Une moto-taxi" : c === "pirogue" ? "Une pirogue à moteur" : "Un camion");

register(
  mk("p-4e-rho", p("4e", "Masse volumique"), 1, LAB, (c, r) => {
    const V = int(r, 2, 9) * 50, rho = pick(r, [0.8, 1.0, 2.7, 7.8]);
    const m = round(rho * V, 1);
    return {
      statement: c === "labo" ? `Un échantillon a un volume de ${V} cm³ et une masse de ${fr(m)} g. Calculer sa masse volumique en g/cm³.` : `Un bidon de ${V} cm³ de liquide pèse ${fr(m)} g. Quelle est la masse volumique du liquide (g/cm³) ?`,
      answer: num(rho, 0.01, "g/cm³"),
      hints: H("On compare la masse et le volume occupé.", "La masse volumique est une masse par unité de volume.", "ρ = m / V.", `${fr(m)} ÷ ${V}.`),
      solution: `ρ = ${fr(m)} / ${V} = ${fr(rho)} g/cm³.`,
    };
  }),
  mk("p-4e-int", p("4e", "Circuit électrique et intensité"), 1, ELEC, (c, r) => {
    const i1 = int(r, 1, 6) / 10, i2 = int(r, 1, 6) / 10;
    return {
      statement: `Dans un circuit de ${c === "solaire" ? "panneau solaire" : "dérivation"}, deux branches parallèles alimentent ${appareil(c)} et une lampe. Elles sont traversées par ${fr(i1)} A et ${fr(i2)} A. Quelle intensité (A) dans la branche principale ?`,
      answer: num(round(i1 + i2, 2), 0.005, "A"),
      hints: H("Le courant se partage dans les branches.", "Loi des nœuds : le courant total est conservé.", "I = I₁ + I₂.", `${fr(i1)} + ${fr(i2)}.`),
      solution: `I = ${fr(i1)} + ${fr(i2)} = ${fr(round(i1 + i2, 2))} A.`,
    };
  }),
  mk("p-3e-ohm", p("3e", "Tension et loi d'Ohm"), 2, ELEC, (c, r) => {
    const R = pick(r, [10, 20, 50, 100, 220]), I = pick(r, [0.1, 0.2, 0.5, 1, 2]);
    return {
      statement: `${appareil(c)[0].toUpperCase() + appareil(c).slice(1)} se comporte comme un conducteur ohmique de ${R} Ω, traversé par un courant de ${fr(I)} A. Quelle tension (V) à ses bornes ?`,
      answer: num(round(R * I, 2), 0.01, "V"),
      hints: H("On cherche la tension aux bornes d'un résistor.", "Relie tension, résistance et intensité.", "Loi d'Ohm : U = R × I.", `${R} × ${fr(I)}.`),
      solution: `U = R·I = ${R} × ${fr(I)} = ${fr(round(R * I, 2))} V.`,
    };
  }),
  mk("p-3e-puiss", p("3e", "Puissance et énergie électriques"), 2, ELEC, (c, r) => {
    const U = pick(r, [12, 220]), I = pick(r, [0.5, 1, 2, 5]), t = int(r, 2, 8);
    const P = U * I;
    return {
      statement: `${appareil(c)[0].toUpperCase() + appareil(c).slice(1)} fonctionne sous ${U} V avec ${fr(I)} A pendant ${t} h. Quelle énergie (Wh) consomme-t-il ?`,
      answer: num(P * t, 0.5, "Wh"),
      hints: H("On veut l'énergie consommée sur une durée.", "Commence par la puissance.", "P = U × I puis E = P × t.", `P = ${U} × ${fr(I)} = ${P} W.`),
      solution: `P = ${P} W ; E = ${P} × ${t} = ${P * t} Wh.`,
    };
  }),
  mk("p-3e-poids", p("3e", "Poids et masse"), 1, LAB, (c, r) => {
    const m = int(r, 2, 80), g = 10;
    return {
      statement: c === "labo" ? `Un objet a une masse de ${m} kg. Calculer son poids sur Terre (g = 10 N/kg).` : `Un sac de ciment de ${m} kg est posé au sol. Quel poids (N) exerce-t-il ? (g = 10 N/kg)`,
      answer: num(m * g, 0, "N"),
      hints: H("Le poids est une force liée à l'attraction terrestre.", "Il dépend de la masse et de g.", "P = m × g.", `${m} × 10.`),
      solution: `P = ${m} × 10 = ${m * g} N.`,
    };
  }),
  mk("p-2nde-n", p("2nde", "Quantité de matière"), 2, LAB, (c, r) => {
    const M = pick(r, [18, 44, 58.5, 98]), n = pick(r, [0.5, 1, 2, 0.25]);
    const m = round(n * M, 2);
    return {
      statement: c === "labo" ? `On dispose de ${fr(m)} g d'une espèce de masse molaire ${fr(M)} g/mol. Calculer la quantité de matière (mol).` : `Une cuisinière dissout ${fr(m)} g de sel (M = ${fr(M)} g/mol). Combien de moles a-t-elle utilisées ?`,
      answer: num(n, 0.01, "mol"),
      hints: H("On convertit une masse en nombre de moles.", "Utilise la masse molaire.", "n = m / M.", `${fr(m)} ÷ ${fr(M)}.`),
      solution: `n = ${fr(m)} / ${fr(M)} = ${fr(n)} mol.`,
    };
  }),
  mk("p-2nde-conc", p("2nde", "Concentration d'une solution"), 2, LAB, (c, r) => {
    const n = pick(r, [0.1, 0.2, 0.5]), V = pick(r, [0.25, 0.5, 1, 2]);
    return {
      statement: c === "labo" ? `On dissout ${fr(n)} mol de soluté dans ${fr(V)} L de solution. Calculer la concentration (mol/L).` : `Une solution de traitement de l'eau contient ${fr(n)} mol de produit pour ${fr(V)} L. Quelle est sa concentration (mol/L) ?`,
      answer: num(round(n / V, 3), 0.002, "mol/L"),
      hints: H("On compare la quantité de soluté au volume total.", "C'est une quantité de matière par litre.", "C = n / V.", `${fr(n)} ÷ ${fr(V)}.`),
      solution: `C = ${fr(n)} / ${fr(V)} = ${fr(round(n / V, 3))} mol/L.`,
    };
  }),
  mk("p-2nde-son", p("2nde", "Ondes sonores"), 1, MOVE, (c, r) => {
    const v = 340, d = pick(r, [340, 680, 1020, 1360]);
    return {
      statement: `${c === "pirogue" ? "Un pêcheur" : c === "moto" ? "Un conducteur" : "Un chauffeur"} entend l'écho de son klaxon après réflexion sur une falaise située à ${d / 2} m. L'écho revient après combien de secondes ? (v = 340 m/s, aller-retour)`,
      answer: num(d / v, 0.01, "s"),
      hints: H("Le son fait un aller-retour.", "Distance totale = 2 × distance à la falaise.", "t = d / v.", `d totale = ${d} m.`),
      solution: `t = ${d} / 340 = ${fr(d / v)} s.`,
    };
  }),
  mk("p-1ere-ec", p("1ere", "Énergie cinétique"), 2, MOVE, (c, r) => {
    const m = c === "camion" ? int(r, 4, 12) * 1000 : c === "moto" ? int(r, 1, 3) * 100 : int(r, 2, 6) * 100;
    const kmh = c === "pirogue" ? pick(r, [18, 36]) : pick(r, [36, 54, 72]);
    const v = kmh / 3.6, Ec = round(0.5 * m * v * v, 0);
    return {
      statement: `${engin(c)} de masse ${m} kg se déplace à ${kmh} km/h. Calculer son énergie cinétique (J).`,
      answer: num(Ec, 2, "J"),
      hints: H("On cherche l'énergie liée au mouvement.", "Convertis la vitesse en m/s.", "Ec = ½ m v².", `v = ${kmh}/3,6 = ${fr(round(v, 2))} m/s.`),
      solution: `Ec = ½ × ${m} × (${fr(round(v, 2))})² ≈ ${Ec} J.`,
    };
  }),
  mk("p-tle-newton", p("tle", "Deuxième loi de Newton"), 2, MOVE, (c, r) => {
    const m = c === "camion" ? int(r, 4, 10) * 1000 : int(r, 2, 8) * 100, F = c === "camion" ? int(r, 4, 20) * 1000 : int(r, 2, 9) * 100;
    return {
      statement: `${engin(c)} de masse ${m} kg subit une force motrice résultante de ${F} N. Calculer son accélération (m/s², arrondie au centième).`,
      answer: num(round(F / m, 2), 0.01, "m/s²"),
      hints: H("On cherche comment la vitesse varie.", "Relie force résultante, masse et accélération.", "ΣF = m·a donc a = F/m.", `${F} ÷ ${m}.`),
      solution: `a = ${F}/${m} ≈ ${fr(round(F / m, 2))} m/s².`,
    };
  }),
  mk("p-tle-onde", p("tle", "Propagation d'une onde"), 2, MOVE.slice(0, 2).concat(LAB.slice(0, 1)), (c, r) => {
    const v = pick(r, [340, 1500, 3e8]), f = pick(r, [200, 500, 1000, 2000]);
    const lambda = v / f;
    return {
      statement: c === "labo" ? `Une onde de fréquence ${f} Hz se propage à ${v} m/s. Calculer sa longueur d'onde (m).` : `Un sonar ${c === "pirogue" ? "de pêche" : "de recul"} émet à ${f} Hz dans un milieu où l'onde se propage à ${v} m/s. Longueur d'onde (m) ?`,
      answer: num(round(lambda, 4), Math.max(0.0005, lambda * 0.002), "m"),
      hints: H("λ est la période spatiale de l'onde.", "Relie célérité, fréquence et longueur d'onde.", "λ = v / f.", `${v} ÷ ${f}.`),
      solution: `λ = ${v}/${f} = ${fr(round(lambda, 4))} m.`,
    };
  }),
  mk("p-tle-ph", p("tle", "pH et concentration"), 2, LAB, (c, r) => {
    const mant = pick(r, [2, 3, 4, 5]), k = int(r, 2, 5);
    const v = round(-Math.log10(mant * 10 ** -k), 2);
    return {
      statement: c === "labo" ? `[H₃O⁺] = ${mant}×10⁻${k} mol/L. Calculer le pH (arrondi au centième).` : `Le jus de citron dilué a une concentration en ions oxonium de ${mant}×10⁻${k} mol/L. Quel est son pH (au centième) ?`,
      answer: num(v, 0.015),
      hints: H("Le pH mesure l'acidité.", "Il se calcule avec un logarithme décimal.", "pH = −log[H₃O⁺].", `pH = ${k} − log(${mant}).`),
      solution: `pH = −log(${mant}×10⁻${k}) ≈ ${fr(v)}.`,
    };
  }),
);
