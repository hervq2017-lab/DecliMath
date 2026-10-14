// CIAM Terminale SM (série C) : chapitre 5, Similitudes directes du plan. Énoncés originaux, réponses calculées par le code.
// Les constructions, lieux et démonstrations du manuel ne se corrigent pas automatiquement : on en garde les calculs
// (écriture complexe, rapport, angle, centre, image) et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamts");
const BOOK = "CIAM Terminale SM";
const SD = "Similitudes directes du plan — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
type Z = [number, number];
const add = (a: Z, b: Z): Z => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Z, b: Z): Z => [a[0] - b[0], a[1] - b[1]];
const mul = (a: Z, b: Z): Z => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const div = (a: Z, b: Z): Z => { const m = b[0] * b[0] + b[1] * b[1], n = mul(a, [b[0], -b[1]]); return [n[0] / m, n[1] / m]; };
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
const zs = (z: Z) => {
  const [a, b] = z, im = b === 0 ? "" : `${Math.abs(b) === 1 ? "" : fr(Math.abs(b))}i`;
  if (b === 0) return n2(a);
  if (a === 0) return `${b < 0 ? "−" : ""}${im}`;
  return `${n2(a)} ${b < 0 ? "−" : "+"} ${im}`;
};
const zp = (z: Z) => `(${zs(z)})`;
const main = (d: number) => { let x = ((d % 360) + 360) % 360; if (x > 180) x -= 360; return x; };
/** Angle (degrés) et module d'un complexe à coordonnées entières « propres ». */
const polar = (z: Z) => ({ k: Math.hypot(z[0], z[1]), a: (Math.atan2(z[1], z[0]) * 180) / Math.PI });
/** Multiplicateurs a = k e^{iα} à coordonnées entières : (rapport, angle en degrés). */
const MULT: [Z, number, string][] = [[[1, 1], 45, "√2"], [[1, -1], -45, "√2"], [[-1, 1], 135, "√2"], [[-1, -1], -135, "√2"], [[0, 2], 90, "2"], [[2, 0], 0, "2"], [[-3, 0], 180, "3"], [[0, -4], -90, "4"], [[3, 4], 53.13, "5"], [[2, 2], 45, "2√2"], [[0, 1], 90, "1"], [[1, 0], 0, "1"]];

export const TC_SIMIL: Template[] = [
  mk("sd-ecriture", SD, 2, { skill: "Écriture complexe z′ = az + b : rapport |a|, angle arg(a)", ref: `${BOOK}, chap. 5 §1.1, écriture complexe (p. 106-107) et ex. 1.a (p. 110) et ex. 1 (p. 119)`, kw: ["similitude directe", "z′ = az + b", "rapport", "angle", "module de a", "argument de a"] }, (_c, r) => {
    const [a, ang, k] = pick(r, MULT), b = [int(r, -4, 4), int(r, -4, 4)] as Z, ask = int(r, 0, 1);
    return { statement: `s est l'application du plan d'écriture complexe z′ = ${zp(a)}z + ${zp(b)}. C'est une similitude directe. Quel est ${ask === 0 ? "son rapport (arrondi au centième)" : "son angle (en degrés, arrondi au centième)"} ?`, answer: ask === 0 ? num(r2(polar(a).k), 0.01) : num(r2(ang), 0.01), hints: H("Pour z′ = az + b, le rapport est |a| et l'angle est un argument de a.", `a = ${zs(a)}.`, ask === 0 ? `|a| = √(${a[0] * a[0]} + ${a[1] * a[1]}).` : "Utilise cos α = Re(a)/|a| et sin α = Im(a)/|a|.", "Calcule."), solution: `|a| = ${k} ≈ ${fr(r2(polar(a).k))} ; arg(a) ≈ ${fr(r2(ang))}°.` };
  }, FR),
  mk("sd-centre", SD, 3, { skill: "Centre d'une similitude directe : ω = b/(1 − a)", ref: `${BOOK}, chap. 5 §1.1, méthode (p. 106-107) et ex. 1.a (p. 110) et ex. 4.1 (p. 119)`, kw: ["centre d'une similitude", "point invariant", "ω = b/(1 − a)", "z = az + b", "éléments caractéristiques"] }, (_c, r) => {
    for (;;) {
      const a = pick(r, MULT)[0] as Z, om: Z = [int(r, -4, 4), int(r, -4, 4)];
      if (a[0] === 1 && a[1] === 0) continue;
      const b = sub(om, mul(a, om)), wantRe = int(r, 0, 1) === 0;
      return { statement: `s est la similitude directe d'écriture complexe z′ = ${zp(a)}z + ${zp(b)}. Quelle est la ${wantRe ? "partie réelle" : "partie imaginaire"} de l'affixe de son centre ?`, answer: num(wantRe ? om[0] : om[1], 0.001), hints: H("Le centre est l'unique point invariant : z = az + b.", "ω = b/(1 − a).", `1 − a = ${zs(sub([1, 0], a))}.`, "Divise b par 1 − a."), solution: `ω = b/(1 − a) = ${zp(b)}/${zp(sub([1, 0], a))} = ${zs(om)}.` };
    }
  }, FR),
  mk("sd-ecrire", SD, 3, { skill: "Écrire la similitude de centre Ω, rapport k, angle α", ref: `${BOOK}, chap. 5 §1.1, forme z′ − ω = k e^{iα}(z − ω) (p. 106-107) et ex. 1.b (p. 110) et ex. 2 (p. 119)`, kw: ["écriture complexe", "centre", "rapport", "angle", "z′ − ω = k e^{iα}(z − ω)"] }, (_c, r) => {
    const [m, ang, k] = pick(r, MULT.filter((x) => x[2] !== "5" && x[2] !== "2√2")), om: Z = [int(r, -3, 3), int(r, -3, 3)];
    const b = sub(om, mul(m, om)), wantRe = int(r, 0, 1) === 0;
    return { statement: `s est la similitude directe de centre Ω d'affixe ${zs(om)}, de rapport ${k} et d'angle ${ang}°. Son écriture complexe est z′ = az + b. Quelle est la ${wantRe ? "partie réelle" : "partie imaginaire"} de b ?`, answer: num(wantRe ? b[0] : b[1]), hints: H("z′ − ω = k e^{iα}(z − ω).", `a = k e^{iα} = ${zs(m)}.`, "Donc b = ω − aω.", `b = ${zp(om)} − ${zp(m)} × ${zp(om)}.`), solution: `b = ω − aω = ${zs(b)}.` };
  }, FR),
  mk("sd-image", SD, 2, { skill: "Image d'un point par une similitude directe d'écriture complexe donnée", ref: `${BOOK}, chap. 5 §1.1-1.3 (p. 106-110) et ex. 1.c-1.e (p. 110)`, kw: ["image d'un point", "similitude directe", "affixe", "z′ = az + b"] }, (_c, r) => {
    const a = pick(r, MULT)[0] as Z, b: Z = [int(r, -4, 4), int(r, -4, 4)], z: Z = [int(r, -4, 4), int(r, -4, 4)], w = add(mul(a, z), b), wantRe = int(r, 0, 1) === 0;
    return { statement: `s a pour écriture complexe z′ = ${zp(a)}z + ${zp(b)}. Quelle est la ${wantRe ? "partie réelle" : "partie imaginaire"} de l'affixe de l'image du point d'affixe ${zs(z)} ?`, answer: num(wantRe ? w[0] : w[1]), hints: H("Remplace z par l'affixe donnée.", `${zp(a)} × ${zp(z)} = ${zs(mul(a, z))}.`, `Ajoute b = ${zs(b)}.`, "Lis la partie demandée."), solution: `z′ = ${zs(mul(a, z))} + ${zp(b)} = ${zs(w)}.` };
  }, FR),
  mk("sd-composee", SD, 3, { skill: "Composée et réciproque de similitudes directes : rapport et angle", ref: `${BOOK}, chap. 5 §1.1, composée de similitudes (p. 107) et ex. 1.c (p. 110) et ex. 3 (p. 119)`, kw: ["composée", "réciproque", "rapport kk′", "angle α + α′", "groupe des similitudes directes"] }, (_c, r) => {
    const [m1, a1] = pick(r, MULT.filter((x) => ["2", "3", "4", "1", "√2"].includes(x[2]))), [m2, a2] = pick(r, MULT.filter((x) => ["2", "3", "4", "1", "√2"].includes(x[2]))), t = int(r, 0, 2), k1 = polar(m1).k, k2 = polar(m2).k;
    if (t === 0) return { statement: `s₁ a pour rapport ${fr(r2(k1))} et angle ${a1}° ; s₂ a pour rapport ${fr(r2(k2))} et angle ${a2}°. La composée s₂∘s₁ est une similitude directe. Quel est son rapport (arrondi au centième) ?`, answer: num(r2(k1 * k2), 0.01), hints: H("Les rapports se multiplient.", "k(s₂∘s₁) = k₁ × k₂.", `${fr(r2(k1))} × ${fr(r2(k2))}.`, "Calcule."), solution: `k = ${fr(r2(k1))} × ${fr(r2(k2))} ≈ ${fr(r2(k1 * k2))}.` };
    if (t === 1) return { statement: `s₁ a pour rapport ${fr(r2(k1))} et angle ${a1}° ; s₂ a pour rapport ${fr(r2(k2))} et angle ${a2}°. Quelle est la mesure principale de l'angle de s₂∘s₁ (en degrés) ?`, answer: num(main(a1 + a2), 0.01), hints: H("Les angles s'ajoutent.", "α(s₂∘s₁) = α₁ + α₂.", `${a1} + ${par(a2)} = ${a1 + a2}.`, "Ramène dans ]−180 ; 180]."), solution: `${a1} + ${par(a2)} = ${a1 + a2} ≡ ${main(a1 + a2)}°.` };
    return { statement: `s est une similitude directe de rapport ${fr(r2(k1))} et d'angle ${a1}°. Quel est l'angle de sa réciproque s⁻¹ (en degrés, mesure principale) ?`, answer: num(main(-a1), 0.01), hints: H("La réciproque a pour rapport 1/k et pour angle −α.", `−(${a1}).`, "Ramène dans ]−180 ; 180].", "Calcule."), solution: `Angle de s⁻¹ = −${par(a1)}° ≡ ${main(-a1)}°.` };
  }, FR),
  mk("sd-deux-points", SD, 3, { skill: "Similitude directe qui transforme A en A′ et B en B′ : rapport, angle, écriture", ref: `${BOOK}, chap. 5 §2.1, deux points et leurs images (p. 112-113) et ex. 2.d (p. 118) et ex. 3 (p. 119)`, kw: ["deux points et leurs images", "A′B′/AB", "(AB, A′B′)", "similitude unique", "écriture complexe"] }, (_c, r) => {
    for (;;) {
      const a = pick(r, MULT)[0] as Z, b: Z = [int(r, -3, 3), int(r, -3, 3)], A: Z = [int(r, -3, 3), int(r, -3, 3)], B: Z = [int(r, -3, 3), int(r, -3, 3)];
      if (A[0] === B[0] && A[1] === B[1]) continue;
      const A2 = add(mul(a, A), b), B2 = add(mul(a, B), b), q = div(sub(B2, A2), sub(B, A)), ask = int(r, 0, 2);
      return { statement: `A d'affixe ${zs(A)} a pour image A′ d'affixe ${zs(A2)}, et B d'affixe ${zs(B)} a pour image B′ d'affixe ${zs(B2)} par une similitude directe s. Écrite z′ = az + b, quelle est ${ask === 0 ? "la partie réelle de a" : ask === 1 ? "la partie imaginaire de a" : "la partie réelle de b"} ?`, answer: num(ask === 0 ? q[0] : ask === 1 ? q[1] : A2[0] - (q[0] * A[0] - q[1] * A[1]), 0.001), hints: H("a = (z_{B′} − z_{A′})/(z_B − z_A).", `z_B′ − z_A′ = ${zs(sub(B2, A2))} et z_B − z_A = ${zs(sub(B, A))}.`, "Divise les deux complexes.", "Puis b = z_{A′} − a z_A."), solution: `a = ${zs(q as Z)} ; b = ${zs(sub(A2, mul(q as Z, A)))}.` };
    }
  }, FR),
  mk("sd-proprietes", SD, 2, { skill: "Effet d'une similitude de rapport k : longueurs, aires, angles", ref: `${BOOK}, chap. 5 §1.2, similitudes et configurations (p. 108) et ex. 5 (p. 119)`, kw: ["similitude directe", "rapport k", "aires", "k²", "longueurs", "conserve les angles orientés"] }, (_c, r) => {
    const k = pick(r, [2, 3, 0.5, 1.5, 4, 2.5]), t = int(r, 0, 2);
    if (t === 0) { const L = int(r, 2, 12); return { statement: `Une similitude directe de rapport ${fr(k)} transforme un segment de longueur ${L} cm. Quelle est la longueur de l'image (en cm) ?`, answer: num(r2(k * L), 0.01), hints: H("Une similitude de rapport k multiplie les longueurs par k.", "M′N′ = k MN.", `${fr(k)} × ${L}.`, "Calcule."), solution: `${fr(k)} × ${L} = ${fr(r2(k * L))} cm.` }; }
    if (t === 1) { const S = int(r, 2, 20); return { statement: `Une similitude directe de rapport ${fr(k)} transforme une figure d'aire ${S} cm². Quelle est l'aire de l'image (en cm²) ?`, answer: num(r2(k * k * S), 0.01), hints: H("Une similitude de rapport k multiplie les aires par k².", `k² = ${fr(k * k)}.`, `${fr(k * k)} × ${S}.`, "Calcule."), solution: `${fr(k * k)} × ${S} = ${fr(r2(k * k * S))} cm².` }; }
    const R = int(r, 2, 8); return { statement: `Un cercle de rayon ${R} cm a pour image, par une similitude directe de rapport ${fr(k)}, un cercle. Quel est son rayon (en cm) ?`, answer: num(r2(k * R), 0.01), hints: H("L'image d'un cercle est un cercle.", "Son rayon est multiplié par k.", `${fr(k)} × ${R}.`, "Calcule."), solution: `Rayon = ${fr(k)} × ${R} = ${fr(r2(k * R))} cm.` };
  }, FR),
  mk("sd-reduite", SD, 3, { skill: "Forme réduite : s = h∘r (homothétie et rotation de même centre)", ref: `${BOOK}, chap. 5 §1.1, vocabulaire (p. 106) et remarques (p. 107)`, kw: ["forme réduite", "homothétie", "rotation", "centre", "h∘r"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "La composée h∘r d'une homothétie h de centre Ω et d'une rotation r de même centre Ω est appelée…", good: "forme réduite de la similitude directe", bad: ["écriture analytique", "symétrie glissée", "groupe des isométries"], why: "Vocabulaire, p. 106." },
      { q: "Quelle similitude directe a pour rapport 1 et pour angle α ?", good: "Une rotation d'angle α", bad: ["Une homothétie", "Une symétrie orthogonale", "Une symétrie glissée"], why: "Remarques, p. 107." },
      { q: "Une homothétie de rapport k < 0 est une similitude directe de…", good: "rapport −k et d'angle π", bad: ["rapport k et d'angle 0", "rapport 1 et d'angle π", "rapport k et d'angle π/2"], why: "Remarques, p. 107." },
      { q: "Une translation est une similitude directe de…", good: "rapport 1 et d'angle nul", bad: ["rapport 0", "rapport 2 et d'angle nul", "rapport 1 et d'angle π"], why: "Remarques, p. 107." },
      { q: "Quels éléments caractérisent une similitude directe qui n'est pas une translation ?", good: "Son centre, son rapport et son angle", bad: ["Son axe et son rapport", "Seulement son centre", "Son vecteur et son angle"], why: "Vocabulaire, p. 106." },
      { q: "L'ensemble des similitudes directes du plan, muni de la loi ∘, est…", good: "un groupe de transformations", bad: ["un ensemble sans inverse", "un corps", "un groupe d'ordre 4"], why: "Propriétés, p. 107." },
    ];
    return qcmOf(r, pool, "Relis la définition de la forme réduite.");
  }, QCM),
  mk("sd-cours", SD, 1, { skill: "Similitudes directes : questions de cours", ref: `${BOOK}, chap. 5 §1 et §2 (p. 106-116)`, kw: ["similitude directe", "propriété caractéristique", "M′N′ = kMN", "Ptolémée", "centre", "triangles semblables"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle est la propriété caractéristique d'une similitude directe de rapport k et d'angle α ?", good: "M′N′ = k MN et (MN, M′N′) = α pour tous M ≠ N", bad: ["M′N′ = MN", "M′N′ = k + MN", "(MN, M′N′) = π pour tous M, N"], why: "Propriété 1, p. 108." },
      { q: "Une similitude directe conserve…", good: "l'alignement, le parallélisme, l'orthogonalité et les angles orientés", bad: ["les longueurs", "les aires", "uniquement les distances"], why: "Tableau, p. 108." },
      { q: "Une similitude directe multiplie les aires par…", good: "k²", bad: ["k", "2k", "√k"], why: "Tableau, p. 108." },
      { q: "Combien existe-t-il de similitudes directes de centre Ω transformant A (≠ Ω) en A′ (≠ Ω) ?", good: "Une seule", bad: ["Deux", "Une infinité", "Aucune"], why: "Propriété p. 111." },
      { q: "Combien existe-t-il de similitudes directes transformant A en A′ et B en B′ (A ≠ B, A′ ≠ B′) ?", good: "Une seule", bad: ["Deux", "Une infinité", "Aucune"], why: "Propriété p. 112." },
      { q: "Quel théorème se démontre avec une similitude directe de centre B transformant D en C ?", good: "Le théorème de Ptolémée", bad: ["Le théorème de Thalès", "Le théorème de Pythagore", "Le théorème de Gauss"], why: "Similitudes et démonstrations, p. 116." },
      { q: "Si les droites (AB) et (A′B′) sont parallèles, la similitude directe qui transforme A en A′ et B en B′ est…", good: "une translation ou une homothétie", bad: ["une rotation de centre quelconque", "une symétrie", "une symétrie glissée"], why: "Construction du centre, p. 113." },
      { q: "Si les droites (AB) et (A′B′) sont sécantes en I, le centre Ω de la similitude vérifie…", good: "Ω est sur les cercles circonscrits à IAA′ et IBB′", bad: ["Ω est le milieu de [AA′]", "Ω = I toujours", "Ω est sur la droite (AB)"], why: "2ᵉ cas, p. 113-114." },
    ];
    return qcmOf(r, pool, "Reviens à la propriété caractéristique.");
  }, QCM),
];
void choice;
