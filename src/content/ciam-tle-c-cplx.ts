// CIAM Terminale SM (série C) : chapitre 3, Nombres complexes. Énoncés originaux, réponses calculées par le code.
// Les constructions et démonstrations du manuel ne se corrigent pas automatiquement : on en garde les calculs et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtz");
const BOOK = "CIAM Terminale SM";
const NC = "Nombres complexes — série C";
const NT = "Nombres complexes et transformations du plan — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
type Z = [number, number];
const add = (a: Z, b: Z): Z => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Z, b: Z): Z => [a[0] - b[0], a[1] - b[1]];
const mul = (a: Z, b: Z): Z => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const conj = (a: Z): Z => [a[0], -a[1]];
const mod2 = (a: Z) => a[0] * a[0] + a[1] * a[1];
const div = (a: Z, b: Z): [number, number, number] => { const m = mod2(b), n = mul(a, conj(b)); return [n[0], n[1], m]; };
const pw = (a: Z, n: number): Z => { let r: Z = [1, 0]; for (let i = 0; i < n; i++) r = mul(r, a); return r; };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
/** a + bi écrit proprement. */
const zs = (z: Z) => {
  const [a, b] = z;
  const im = b === 0 ? "" : `${Math.abs(b) === 1 ? "" : fr(Math.abs(b))}i`;
  if (b === 0) return n2(a);
  if (a === 0) return `${b < 0 ? "−" : ""}${im}`;
  return `${n2(a)} ${b < 0 ? "−" : "+"} ${im}`;
};
const zp = (z: Z) => `(${zs(z)})`;
const rz = (r: Rng, k = 5): Z => [int(r, -k, k), nz(r, -k, k)];
/** Fraction a/c simplifiée. */
const fq = (a: number, c: number) => { const g = gcd(a, c) || 1; const p = a / g, q = c / g; return q === 1 ? n2(p) : `${n2(p)}/${q}`; };
const sup = (n: number) => String(n).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]).join("");
const PI_FORMS: { a: string; v: number }[] = [
  { a: "0", v: 0 }, { a: "π/6", v: Math.PI / 6 }, { a: "π/4", v: Math.PI / 4 }, { a: "π/3", v: Math.PI / 3 }, { a: "π/2", v: Math.PI / 2 },
];
void PI_FORMS;

export const TC_CPLX: Template[] = [
  // ===== 1. Étude algébrique =====
  mk("cx-operations", NC, 1, { skill: "Somme, produit et puissances de nombres complexes écrits sous forme algébrique", ref: `${BOOK}, chap. 3 §1.2, opérations dans ℂ (p. 57-58) et ex. 1.a (p. 62) et ex. 1-2 (p. 76)`, kw: ["forme algébrique", "produit", "somme", "partie réelle", "partie imaginaire", "i² = −1"] }, (_c, r) => {
    const a = rz(r, 5), b = rz(r, 5), t = int(r, 0, 3), wantRe = int(r, 0, 1) === 0;
    const lab = wantRe ? "partie réelle" : "partie imaginaire", pick2 = (z: Z) => (wantRe ? z[0] : z[1]);
    if (t === 0) { const v = add(a, b); return { statement: `z = ${zs(a)} et z′ = ${zs(b)}. Quelle est la ${lab} de z + z′ ?`, answer: num(pick2(v)), hints: H("On additionne les parties réelles entre elles, les parties imaginaires entre elles.", "(a + ib) + (a′ + ib′) = (a + a′) + i(b + b′).", `${wantRe ? `${n2(a[0])} + ${par(b[0])}` : `${n2(a[1])} + ${par(b[1])}`}.`, "Calcule."), solution: `z + z′ = ${zs(v)}.` }; }
    if (t === 1) { const v = mul(a, b); return { statement: `z = ${zs(a)} et z′ = ${zs(b)}. Quelle est la ${lab} de zz′ ?`, answer: num(pick2(v)), hints: H("On développe en utilisant i² = −1.", "(a + ib)(a′ + ib′) = (aa′ − bb′) + i(ab′ + a′b).", `aa′ − bb′ = ${n2(a[0])} × ${par(b[0])} − ${par(a[1])} × ${par(b[1])} ; ab′ + a′b = ${n2(a[0])} × ${par(b[1])} + ${par(b[0])} × ${par(a[1])}.`, "Calcule."), solution: `zz′ = ${zs(v)}.` }; }
    if (t === 2) { const n = int(r, 2, 4), v = pw(a, n); return { statement: `z = ${zs(a)}. Quelle est la ${lab} de z${sup(n)} ?`, answer: num(pick2(v)), hints: H("Calcule les puissances successives.", `z² = z × z.`, n === 2 ? "Développe (a + ib)² = a² − b² + 2iab." : `z${sup(n)} = z${sup(n - 1)} × z.`, "Utilise i² = −1."), solution: `z${sup(n)} = ${zs(v)}.` }; }
    const v = sub(a, b); return { statement: `z = ${zs(a)} et z′ = ${zs(b)}. Quelle est la ${lab} de z − z′ ?`, answer: num(pick2(v)), hints: H("z − z′ = z + (−z′).", "On soustrait parties réelles et imaginaires.", `${wantRe ? `${n2(a[0])} − ${par(b[0])}` : `${n2(a[1])} − ${par(b[1])}`}.`, "Calcule."), solution: `z − z′ = ${zs(v)}.` };
  }, FR),
  mk("cx-quotient", NC, 2, { skill: "Inverse et quotient de nombres complexes (multiplier par le conjugué)", ref: `${BOOK}, chap. 3 §1.2, inverse (p. 57-58) et ex. 1.b-1.c (p. 62) et ex. 1 (p. 76)`, kw: ["inverse", "quotient", "conjugué", "forme algébrique", "1/(a + ib)"] }, (_c, r) => {
    const a = rz(r, 5), b = rz(r, 4), [pn, qn, d] = div(a, b), wantRe = int(r, 0, 1) === 0;
    return { statement: `z = ${zs(a)} et z′ = ${zs(b)}. On écrit z/z′ = x + iy. Quelle est la valeur de ${wantRe ? "x" : "y"} (arrondie au centième) ?`, answer: num(r2((wantRe ? pn : qn) / d), 0.01), hints: H("On multiplie numérateur et dénominateur par le conjugué du dénominateur.", `Le conjugué de z′ est ${zp(conj(b))}, et z′ × conj(z′) = a² + b² = ${d}.`, `Numérateur : z × conj(z′) = ${zp(a)} × ${zp(conj(b))} = ${zs([pn, qn])}.`, `Divise par ${d}.`), solution: `z/z′ = ${zp([pn, qn])} / ${d}, donc x = ${fq(pn, d)} et y = ${fq(qn, d)}.` };
  }, FR),
  mk("cx-conjugue-module", NC, 2, { skill: "Conjugué et module d'un nombre complexe", ref: `${BOOK}, chap. 3 §1.3, conjugué et module (p. 59-60) et ex. 1.e-1.f (p. 62) et ex. 6, 8 (p. 76)`, kw: ["conjugué", "module", "|z|", "z × conj(z)", "a² + b²"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const tr = pick(r, [[3, 4], [5, 12], [8, 15], [6, 8], [7, 24], [20, 21]]), z: Z = [int(r, 0, 1) ? tr[0] : -tr[0], int(r, 0, 1) ? tr[1] : -tr[1]]; return { statement: `Quel est le module du nombre complexe z = ${zs(z)} ?`, answer: num(Math.hypot(z[0], z[1])), hints: H("|a + ib| = √(a² + b²).", `a = ${n2(z[0])}, b = ${n2(z[1])}.`, `a² + b² = ${z[0] * z[0]} + ${z[1] * z[1]}.`, "Calcule la racine carrée."), solution: `|z| = √(${z[0] * z[0]} + ${z[1] * z[1]}) = ${Math.hypot(z[0], z[1])}.` }; }
    if (t === 1) { const z = rz(r, 6), wantRe = int(r, 0, 1) === 0, w = mul(z, conj(z)); void wantRe; return { statement: `z = ${zs(z)}. Quelle est la valeur de z × z̄ (z̄ désigne le conjugué de z) ?`, answer: num(w[0]), hints: H("z z̄ = a² + b².", `a = ${n2(z[0])}, b = ${n2(z[1])}.`, "C'est un réel positif : le carré du module.", "Calcule a² + b²."), solution: `z z̄ = ${z[0] * z[0]} + ${z[1] * z[1]} = ${w[0]}.` }; }
    const a = rz(r, 4), b = rz(r, 4), v = mul(a, b);
    return { statement: `z = ${zs(a)} et z′ = ${zs(b)}. Quel est le module de zz′ (arrondi au centième) ?`, answer: num(r2(Math.sqrt(mod2(v))), 0.01), hints: H("|zz′| = |z| × |z′|.", `|z|² = ${mod2(a)} et |z′|² = ${mod2(b)}.`, `|zz′|² = ${mod2(a)} × ${mod2(b)}.`, "Prends la racine carrée."), solution: `|zz′| = √(${mod2(a)} × ${mod2(b)}) = √${mod2(a) * mod2(b)} ≈ ${fr(r2(Math.sqrt(mod2(v))))}.` };
  }, FR),
  mk("cx-reel-imaginaire", NC, 3, { skill: "Valeurs du paramètre rendant un nombre complexe réel ou imaginaire pur", ref: `${BOOK}, chap. 3 §1.1, propriété (p. 56) et ex. 3 (p. 76) et ex. 7 (p. 76)`, kw: ["réel", "imaginaire pur", "partie imaginaire nulle", "paramètre", "équation"] }, (_c, r) => {
    const a = nz(r, -4, 4), b = nz(r, -4, 4), c = nz(r, -4, 4), d = nz(r, -4, 4), real = int(r, 0, 1) === 0;
    // z = (a + c x)(b + d x i)... on prend z = (a x + b) + i (c x + d) : réel si c x + d = 0 ; imaginaire pur si a x + b = 0
    const x = real ? -d / c : -b / a;
    return { statement: `Pour quelle valeur du réel x le nombre complexe z = (${a === 1 ? "" : n2(a)}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}) + i(${c === 1 ? "" : n2(c)}x ${d < 0 ? "−" : "+"} ${Math.abs(d)}) est-il ${real ? "réel" : "imaginaire pur"} ? (Arrondis au centième.)`, answer: num(r2(x), 0.01), hints: H(real ? "z est réel si et seulement si sa partie imaginaire est nulle." : "z est imaginaire pur si et seulement si sa partie réelle est nulle.", real ? `Résous ${c === 1 ? "" : n2(c)}x ${d < 0 ? "−" : "+"} ${Math.abs(d)} = 0.` : `Résous ${a === 1 ? "" : n2(a)}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = 0.`, "Isole x.", "Divise par le coefficient de x."), solution: real ? `${n2(c)}x ${d < 0 ? "−" : "+"} ${Math.abs(d)} = 0, donc x = ${fq(-d, c)} ≈ ${fr(r2(x))}.` : `${n2(a)}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = 0, donc x = ${fq(-b, a)} ≈ ${fr(r2(x))}.` };
  }, FR),
  mk("cx-puissances-i", NC, 2, { skill: "Puissances de i (périodicité de période 4) et sommes de puissances", ref: `${BOOK}, chap. 3 §1.2, ex. 5 (p. 76)`, kw: ["i^n", "puissance de i", "i⁴ = 1", "période 4", "somme"] }, (_c, r) => {
    const n = int(r, 20, 3000), k = n % 4, v: Z = k === 0 ? [1, 0] : k === 1 ? [0, 1] : k === 2 ? [-1, 0] : [0, -1], wantRe = v[1] === 0;
    return { statement: `i${sup(n)} est ${wantRe ? "un nombre réel" : "un imaginaire pur"}. Quelle est ${wantRe ? "sa valeur" : "sa partie imaginaire"} ?`, answer: num(wantRe ? v[0] : v[1]), hints: H("i² = −1, donc i⁴ = 1 : les puissances de i se répètent tous les 4 crans.", `Divise ${n} par 4 : ${n} = 4 × ${Math.floor(n / 4)} + ${k}.`, `i${sup(n)} = i${sup(k)}.`, `i⁰ = 1, i¹ = i, i² = −1, i³ = −i.`), solution: `${n} = 4 × ${Math.floor(n / 4)} + ${k}, donc i${sup(n)} = i${sup(k)} = ${zs(v)}.` };
  }, FR),
  mk("cx-affixe-vecteur", NC, 2, { skill: "Affixe d'un vecteur, d'un milieu, d'un centre de gravité, d'un point D (parallélogramme)", ref: `${BOOK}, chap. 3 §1.2, affixes (p. 58-59) et ex. 1.d (p. 62) et ex. 2 (p. 62)`, kw: ["affixe", "milieu", "centre de gravité", "parallélogramme", "vecteur", "barycentre"] }, (_c, r) => {
    const A = rz(r, 5), B = rz(r, 5), C = rz(r, 5), t = int(r, 0, 3), wantRe = int(r, 0, 1) === 0, p = (z: Z) => (wantRe ? z[0] : z[1]), lab = wantRe ? "partie réelle" : "partie imaginaire";
    if (t === 0) return { statement: `A, B ont pour affixes ${zs(A)} et ${zs(B)}. Quelle est la ${lab} de l'affixe du vecteur AB ?`, answer: num(p(sub(B, A))), hints: H("L'affixe de AB est z_B − z_A.", `z_B − z_A = ${zp(B)} − ${zp(A)}.`, "Soustrais parties réelles et imaginaires.", "Calcule."), solution: `z_AB = ${zs(sub(B, A))}.` };
    if (t === 1) return { statement: `A et B ont pour affixes ${zs(A)} et ${zs(B)}. Quelle est la ${lab} de l'affixe du milieu I de [AB] (arrondie au centième) ?`, answer: num(r2(p(add(A, B)) / 2), 0.01), hints: H("z_I = (z_A + z_B)/2.", `${zp(A)} + ${zp(B)} = ${zs(add(A, B))}.`, "Divise par 2.", "Calcule."), solution: `z_I = ${zp(add(A, B))} / 2, donc la ${lab} vaut ${fr(r2(p(add(A, B)) / 2))}.` };
    if (t === 2) return { statement: `A, B, C ont pour affixes ${zs(A)}, ${zs(B)} et ${zs(C)}. Quelle est la ${lab} de l'affixe du centre de gravité G de ABC (arrondie au centième) ?`, answer: num(r2(p(add(add(A, B), C)) / 3), 0.01), hints: H("z_G = (z_A + z_B + z_C)/3.", `Somme : ${zs(add(add(A, B), C))}.`, "Divise par 3.", "Calcule."), solution: `z_G = ${zp(add(add(A, B), C))} / 3 : la ${lab} vaut ${fr(r2(p(add(add(A, B), C)) / 3))}.` };
    const D = sub(add(A, C), B);
    return { statement: `A, B, C ont pour affixes ${zs(A)}, ${zs(B)} et ${zs(C)}. D est le point tel que ABCD soit un parallélogramme. Quelle est la ${lab} de l'affixe de D ?`, answer: num(p(D)), hints: H("ABCD parallélogramme équivaut à AB = DC.", "z_B − z_A = z_C − z_D.", "Isole z_D.", "z_D = z_A + z_C − z_B."), solution: `z_D = ${zp(A)} + ${zp(C)} − ${zp(B)} = ${zs(D)}.` };
  }, FR),

  // ===== 2. Étude trigonométrique =====
  mk("cx-module-argument", NC, 2, { skill: "Module et argument d'un nombre complexe (arguments remarquables)", ref: `${BOOK}, chap. 3 §2.1, arguments (p. 62-63) et ex. 2.a (p. 67) et ex. 11 (p. 76)`, kw: ["module", "argument", "forme trigonométrique", "arg(z)", "angle orienté"] }, (_c, r) => {
    const rr = int(r, 1, 6), th = pick(r, [[0, "0"], [30, "π/6"], [45, "π/4"], [60, "π/3"], [90, "π/2"], [120, "2π/3"], [135, "3π/4"], [150, "5π/6"], [180, "π"], [-30, "−π/6"], [-45, "−π/4"], [-60, "−π/3"], [-90, "−π/2"], [-120, "−2π/3"], [-135, "−3π/4"], [-150, "−5π/6"]] as [number, string][]);
    const ex = (v: number, name: string): string => name; void ex;
    const al = (th[0] * Math.PI) / 180, a = rr * Math.cos(al), b = rr * Math.sin(al), A = r2(a), B = r2(b);
    if (int(r, 0, 1) === 0) return { statement: `z = ${fr(rr)}(cos θ + i sin θ) avec θ = ${th[1]}. Quelle est la partie réelle de z (arrondie au centième) ?`, answer: num(A, 0.01), hints: H("Si z = r(cos θ + i sin θ), alors Re(z) = r cos θ.", `r = ${rr}, θ = ${th[1]}.`, `cos(${th[1]}) = ${fr(r2(Math.cos(al)))}.`, "Multiplie."), solution: `Re(z) = ${rr} × cos(${th[1]}) ≈ ${fr(A)}.` };
    return { statement: `z = ${fr(rr)}(cos θ + i sin θ) avec θ = ${th[1]}. Quelle est la partie imaginaire de z (arrondie au centième) ?`, answer: num(B, 0.01), hints: H("Si z = r(cos θ + i sin θ), alors Im(z) = r sin θ.", `r = ${rr}, θ = ${th[1]}.`, `sin(${th[1]}) = ${fr(r2(Math.sin(al)))}.`, "Multiplie."), solution: `Im(z) = ${rr} × sin(${th[1]}) ≈ ${fr(B)}.` };
  }, FR),
  mk("cx-argument-degres", NC, 2, { skill: "Argument en degrés d'un nombre complexe dont la forme algébrique est simple", ref: `${BOOK}, chap. 3 §2.1, forme trigonométrique (p. 63) et ex. 2.a-2.b (p. 67)`, kw: ["argument", "mesure principale", "arg", "forme trigonométrique"] }, (_c, r) => {
    const z = pick(r, [[1, 1, 45], [-1, 1, 135], [-1, -1, -135], [1, -1, -45], [0, 2, 90], [-3, 0, 180], [0, -2, -90], [5, 0, 0], [1, 1.7320508, 60], [1.7320508, 1, 30], [-1, 1.7320508, 120], [-1.7320508, -1, -150]] as [number, number, number][]);
    const f = (x: number) => (Math.abs(x - 1.7320508) < 1e-6 ? "√3" : Math.abs(x + 1.7320508) < 1e-6 ? "−√3" : n2(x));
    const s = z[0] === 0 ? `${z[1] < 0 ? "−" : ""}${Math.abs(z[1]) === 1 ? "" : fr(Math.abs(z[1]))}i` : z[1] === 0 ? f(z[0]) : `${f(z[0])} ${z[1] < 0 ? "−" : "+"} ${Math.abs(z[1]) === 1 ? "" : f(Math.abs(z[1]))}i`;
    return { statement: `Quelle est la mesure principale, en degrés (dans ]−180 ; 180]), d'un argument de z = ${s} ?`, answer: num(z[2], 0.5), hints: H("L'argument est une mesure de l'angle orienté (e₁, OM).", "Place le point M dans le plan complexe.", "Utilise cos θ = a/|z| et sin θ = b/|z|.", "Reconnais l'angle remarquable."), solution: `arg(z) ≡ ${z[2]}° [360°].` };
  }, FR),
  mk("cx-produit-trigo", NC, 2, { skill: "Argument d'un produit, d'un quotient, d'une puissance", ref: `${BOOK}, chap. 3 §2.1, propriétés 1 et 2 (p. 64) et ex. 2.b (p. 67) et ex. 15 (p. 76)`, kw: ["argument d'un produit", "arg(zz′) = arg z + arg z′", "n arg(z)", "quotient", "puissance"] }, (_c, r) => {
    const a = nz(r, -170, 170), b = nz(r, -170, 170), n = int(r, 2, 5), t = int(r, 0, 3), main = (d: number) => { let x = ((d % 360) + 360) % 360; if (x > 180) x -= 360; return x; };
    if (t === 0) return { statement: `arg(z) ≡ ${a}° [360°] et arg(z′) ≡ ${b}° [360°]. Quelle est la mesure principale (en degrés) d'un argument de zz′ ?`, answer: num(main(a + b)), hints: H("L'argument d'un produit est la somme des arguments.", "arg(zz′) ≡ arg(z) + arg(z′).", `${a} + ${par(b)} = ${a + b}.`, "Ramène dans ]−180 ; 180]."), solution: `${a} + ${par(b)} = ${a + b} ≡ ${main(a + b)}° [360°].` };
    if (t === 1) return { statement: `arg(z) ≡ ${a}° [360°] et arg(z′) ≡ ${b}° [360°]. Quelle est la mesure principale (en degrés) d'un argument de z/z′ ?`, answer: num(main(a - b)), hints: H("L'argument d'un quotient est la différence des arguments.", "arg(z/z′) ≡ arg(z) − arg(z′).", `${a} − ${par(b)} = ${a - b}.`, "Ramène dans ]−180 ; 180]."), solution: `${a} − ${par(b)} = ${a - b} ≡ ${main(a - b)}° [360°].` };
    if (t === 2) return { statement: `arg(z) ≡ ${a}° [360°]. Quelle est la mesure principale (en degrés) d'un argument de z${sup(n)} ?`, answer: num(main(n * a)), hints: H("arg(zⁿ) ≡ n arg(z).", `${n} × ${par(a)} = ${n * a}.`, "Ramène dans ]−180 ; 180].", "Calcule."), solution: `${n} × ${par(a)} = ${n * a} ≡ ${main(n * a)}° [360°].` };
    return { statement: `arg(z) ≡ ${a}° [360°]. Quelle est la mesure principale (en degrés) d'un argument de 1/z ?`, answer: num(main(-a)), hints: H("arg(1/z) ≡ −arg(z).", `−(${a}).`, "Ramène dans ]−180 ; 180].", "Calcule."), solution: `arg(1/z) ≡ ${-a}° ≡ ${main(-a)}° [360°].` };
  }, FR),
  mk("cx-moivre", NC, 3, { skill: "Formule de Moivre : (cos α + i sin α)ⁿ", ref: `${BOOK}, chap. 3 §2.1, formule de Moivre (p. 65) et ex. 11 (p. 76)`, kw: ["Moivre", "(cos α + i sin α)ⁿ", "puissance", "cos nα + i sin nα"] }, (_c, r) => {
    const base = pick(r, [30, 45, 60, 90, 120, 135, 150]), n = int(r, 3, 20), tot = ((n * base) % 360 + 360) % 360, ang = tot > 180 ? tot - 360 : tot, cs = r2(Math.cos((ang * Math.PI) / 180)), sn = r2(Math.sin((ang * Math.PI) / 180)), re = int(r, 0, 1) === 0;
    return { statement: `On pose z = cos ${base}° + i sin ${base}°. Quelle est la ${re ? "partie réelle" : "partie imaginaire"} de z${sup(n)} (arrondie au centième) ?`, answer: num(re ? cs : sn, 0.01), hints: H("On applique la formule de Moivre.", "(cos α + i sin α)ⁿ = cos nα + i sin nα.", `n α = ${n} × ${base}° = ${n * base}°.`, "Ramène l'angle dans ]−180° ; 180°] et lis le cosinus ou le sinus."), solution: `z${sup(n)} = cos ${n * base}° + i sin ${n * base}°, soit ${re ? "cos" : "sin"}(${ang}°) ≈ ${fr(re ? cs : sn)}.` };
  }, FR),
  mk("cx-exponentielle", NC, 2, { skill: "Notation exponentielle : produit, quotient, puissance", ref: `${BOOK}, chap. 3 §2.2, notation exponentielle (p. 65) et ex. 13, 15 (p. 76)`, kw: ["forme exponentielle", "r e^{iα}", "formule d'Euler", "produit", "quotient"] }, (_c, r) => {
    const r1 = int(r, 1, 5), r2v = int(r, 1, 5), a = pick(r, [30, 45, 60, 90, 120, 135, 150, 180]), b = pick(r, [-30, -45, -60, 30, 45, 60, 90, -90]), t = int(r, 0, 2), main = (d: number) => { let x = ((d % 360) + 360) % 360; if (x > 180) x -= 360; return x; };
    const N = (m: number, d: number) => `${m === 1 ? "" : m}e^{i${d < 0 ? `(−${-d}°)` : `${d}°`}}`;
    if (t === 0) return { statement: `z = ${N(r1, a)} et z′ = ${N(r2v, b)} (angles en degrés). Quel est le module de zz′ ?`, answer: num(r1 * r2v), hints: H("Pour des nombres écrits sous forme exponentielle, on multiplie les modules.", "r e^{iα} × r′ e^{iα′} = rr′ e^{i(α + α′)}.", `${r1} × ${r2v}.`, "Calcule."), solution: `|zz′| = ${r1} × ${r2v} = ${r1 * r2v}.` };
    if (t === 1) return { statement: `z = ${N(r1, a)} et z′ = ${N(r2v, b)} (angles en degrés). Quelle est la mesure principale d'un argument de zz′ (en degrés) ?`, answer: num(main(a + b)), hints: H("On ajoute les arguments.", `${a} + ${par(b)} = ${a + b}.`, "Ramène dans ]−180 ; 180].", "Calcule."), solution: `arg(zz′) ≡ ${a + b}° ≡ ${main(a + b)}°.` };
    return { statement: `z = ${N(r1, a)} et z′ = ${N(r2v, b)} (angles en degrés). Quel est le module de z/z′ (arrondi au centième) ?`, answer: num(r2(r1 / r2v), 0.01), hints: H("Pour un quotient, on divise les modules.", "r e^{iα} / (r′ e^{iα′}) = (r/r′) e^{i(α − α′)}.", `${r1} / ${r2v}.`, "Calcule."), solution: `|z/z′| = ${r1}/${r2v} ≈ ${fr(r2(r1 / r2v))}.` };
  }, FR),
  mk("cx-racines-nieme", NC, 3, { skill: "Racines n-ièmes d'un nombre complexe : module, argument, nombre, somme", ref: `${BOOK}, chap. 3 §2.3, racines n-ièmes (p. 66-67) et ex. 2.g (p. 67) et ex. 18-20 (p. 77)`, kw: ["racine n-ième", "racines cubiques", "polygone régulier", "somme des racines", "ρ = ⁿ√r"] }, (_c, r) => {
    const n = int(r, 3, 8), R = pick(r, [8, 16, 32, 81, 64, 27, 125, 1024].filter((x) => Math.abs(Math.round(Math.pow(x, 1 / n)) ** n - x) < 1e-9 || true)), t = int(r, 0, 2);
    if (t === 0) { const rho = Math.round(Math.pow(R, 1 / n) * 1e4) / 1e4; return { statement: `Les racines ${n}-ièmes d'un nombre complexe de module ${R} ont toutes le même module. Quelle est sa valeur (arrondie au centième) ?`, answer: num(r2(rho), 0.01), hints: H("Si Z = r e^{iα}, z = ρ e^{iθ} et zⁿ = Z, alors ρⁿ = r.", `ρ = ${R}^(1/${n}).`, "C'est la racine n-ième du module.", "Utilise la calculatrice."), solution: `ρ = ${R}^(1/${n}) ≈ ${fr(r2(rho))}.` }; }
    if (t === 1) return { statement: `Combien de racines ${n}-ièmes un nombre complexe non nul admet-il, et que vaut leur somme ?`, answer: choice(r, [`${n} racines, de somme 0`, `${n} racines, de somme 1`, `${n - 1} racines, de somme 0`, `${n} racines, de somme ${n}`], 0), hints: H("Un nombre complexe non nul a exactement n racines n-ièmes.", "Leurs images sont les sommets d'un polygone régulier centré en O.", "Le centre de gravité d'un polygone régulier est son centre O.", "La somme des affixes est donc nulle."), solution: `Il y a ${n} racines n-ièmes ; leur somme est nulle (remarque p. 66).` };
    const k = int(r, 0, n - 1), arg0 = pick(r, [0, 60, 90, 120]); return { statement: `Les racines ${n}-ièmes de Z (d'argument ${arg0}°) sont zₖ = ρ e^{i(θ + 360° k/${n})} avec θ = ${arg0}°/${n}. Quelle est la mesure (en degrés) de l'argument de z${k} (non réduit, arrondie au centième) ?`, answer: num(r2(arg0 / n + (360 * k) / n), 0.01), hints: H("Les racines ont pour arguments α/n + 2kπ/n.", `En degrés : ${arg0}/${n} + 360k/${n}.`, `k = ${k}.`, "Calcule."), solution: `arg(z${k}) = ${arg0}/${n} + 360 × ${k}/${n} ≈ ${fr(r2(arg0 / n + (360 * k) / n))}°.` };
  }, FR),

  // ===== 3. Utilisations =====
  mk("cx-racine-carree", NC, 3, { skill: "Racines carrées d'un nombre complexe sous forme algébrique", ref: `${BOOK}, chap. 3 §3.1, racines carrées (p. 68) et ex. 3.a (p. 75) et ex. 23 (p. 77)`, kw: ["racine carrée", "z² = a + ib", "système", "x² − y² = a", "2xy = b"] }, (_c, r) => {
    const x = nz(r, -4, 4), y = nz(r, -4, 4), w = mul([x, y], [x, y]), wantPos = x > 0;
    return { statement: `Le nombre complexe Z = ${zs(w)} admet deux racines carrées opposées. Quelle est la partie réelle positive de ces racines carrées ?`, answer: num(Math.abs(x)), hints: H("On pose z = x + iy avec z² = Z.", `x² − y² = ${w[0]}, 2xy = ${w[1]} et x² + y² = |Z| = ${Math.sqrt(mod2(w))}.`, `Ajoute x² − y² et x² + y² pour trouver x².`, "Prends la racine carrée positive."), solution: `x² = (${w[0]} + ${Math.sqrt(mod2(w))})/2 = ${x * x}, donc x = ${Math.abs(x)} (y = ${wantPos ? y : -y}).` };
  }, FR),
  mk("cx-second-degre", NC, 3, { skill: "Équation du second degré à coefficients réels dans ℂ (Δ < 0)", ref: `${BOOK}, chap. 3 §3.1, second degré (p. 68) et ex. 3.b (p. 75) et ex. 24-26 (p. 77)`, kw: ["équation du second degré", "discriminant négatif", "solutions complexes conjuguées", "Δ", "az² + bz + c = 0"] }, (_c, r) => {
    const p = nz(r, -4, 4), q = int(r, 1, 6), a = int(r, 1, 3), b = -2 * a * p, c = a * (p * p + q * q), D = b * b - 4 * a * c, wantRe = int(r, 0, 1) === 0;
    return { statement: `On résout dans ℂ l'équation ${a === 1 ? "" : a}z² ${b < 0 ? "−" : "+"} ${Math.abs(b)}z + ${c} = 0. Son discriminant est négatif et les solutions sont conjuguées. Quelle est la ${wantRe ? "partie réelle" : "valeur absolue de la partie imaginaire"} des solutions ?`, answer: num(wantRe ? p : q), hints: H("Δ = b² − 4ac < 0 : les solutions sont (−b ± i√(−Δ)) / (2a).", `Δ = ${D}.`, `Partie réelle : −b/(2a) = ${-b}/${2 * a}.`, `Partie imaginaire : √${-D} / ${2 * a}.`), solution: `Δ = ${D} = (${Math.sqrt(-D)}i)², donc z = (${-b} ± ${Math.sqrt(-D)}i)/${2 * a} = ${p} ± ${q}i.` };
  }, FR),
  mk("cx-second-degre-complexe", NC, 3, { skill: "Équation du second degré à coefficients complexes : somme et produit des racines", ref: `${BOOK}, chap. 3 §3.1 (p. 68-69) et ex. 3.b (p. 75) et ex. 25-26 (p. 77)`, kw: ["somme et produit des racines", "az² + bz + c = 0", "racines", "z₁ + z₂ = −b/a", "z₁z₂ = c/a"] }, (_c, r) => {
    const z1 = rz(r, 4), z2 = rz(r, 4), S = add(z1, z2), Pm = mul(z1, z2), t = int(r, 0, 1);
    if (t === 0) return { statement: `Les solutions de z² + bz + c = 0 sont z₁ = ${zs(z1)} et z₂ = ${zs(z2)}. Quelle est la partie réelle de b ?`, answer: num(-S[0]), hints: H("z₁ + z₂ = −b/a avec a = 1.", `z₁ + z₂ = ${zs(S)}.`, "Donc b = −(z₁ + z₂).", "Prends la partie réelle."), solution: `b = −(z₁ + z₂) = ${zs([-S[0], -S[1]])}.` };
    return { statement: `Les solutions de z² + bz + c = 0 sont z₁ = ${zs(z1)} et z₂ = ${zs(z2)}. Quelle est la partie réelle de c ?`, answer: num(Pm[0]), hints: H("z₁ z₂ = c/a avec a = 1.", `z₁ z₂ = ${zp(z1)} × ${zp(z2)}.`, "Développe avec i² = −1.", "Prends la partie réelle."), solution: `c = z₁ z₂ = ${zs(Pm)}.` };
  }, FR),
  mk("cx-trigo-lineariser", NC, 3, { skill: "Linéarisation et expression de cos nx, sin nx (coefficients)", ref: `${BOOK}, chap. 3 §3.2, trigonométrie (p. 69-71) et ex. 3.d-3.e (p. 75)`, kw: ["linéarisation", "cos nx", "formule d'Euler", "Moivre", "Newton"] }, (_c, r) => {
    const pool: [string, string, number][] = [
      ["cos²x s'écrit a + b cos 2x. Quelle est la valeur de a ?", "cos²x = (1 + cos 2x)/2", 0.5],
      ["cos²x s'écrit a + b cos 2x. Quelle est la valeur de b ?", "cos²x = (1 + cos 2x)/2", 0.5],
      ["sin²x s'écrit a + b cos 2x. Quelle est la valeur de b ?", "sin²x = (1 − cos 2x)/2", -0.5],
      ["cos 2x s'écrit aussi 2cos²x − 1 : quel est le coefficient de cos²x dans cette écriture ?", "cos 2x = 2cos²x − 1", 2],
      ["cos 3x = 4cos³x − 3cos x. Quel est le coefficient de cos³x ?", "cos 3x = 4cos³x − 3cos x", 4],
      ["sin 3x = 3 sin x − 4 sin³x. Quel est le coefficient de sin³x ?", "sin 3x = 3 sin x − 4 sin³x", -4],
      ["sin³x s'écrit a sin x + b sin 3x. Quelle est la valeur de a ?", "sin³x = (3/4) sin x − (1/4) sin 3x", 0.75],
      ["sin³x s'écrit a sin x + b sin 3x. Quelle est la valeur de b ?", "sin³x = (3/4) sin x − (1/4) sin 3x", -0.25],
      ["sin 2x = a sin x cos x. Quelle est la valeur de a ?", "sin 2x = 2 sin x cos x", 2],
    ];
    const [q, why, v] = pick(r, pool);
    return { statement: q, answer: num(v, 0.001), hints: H("On utilise la formule de Moivre ou celles d'Euler.", "Développe (cos x + i sin x)ⁿ ou ((e^{ix} + e^{−ix})/2)ⁿ.", "Regroupe les termes de même fréquence.", "Identifie le coefficient demandé."), solution: `${why}.` };
  }, FR),
  mk("cx-produit-somme", NC, 3, { skill: "Transformation produit ↔ somme (angles remarquables)", ref: `${BOOK}, chap. 3 §3.2, produit en somme (p. 70-71) et ex. 3.f (p. 75)`, kw: ["cos a cos b", "sin a sin b", "cos p + cos q", "somme en produit", "transformation"] }, (_c, r) => {
    const a = pick(r, [30, 45, 60, 75, 90]), b = pick(r, [15, 30, 45, 60]), t = int(r, 0, 3);
    const R = (d: number) => (d * Math.PI) / 180;
    if (t === 0) return { statement: `Calcule cos ${a}° × cos ${b}° = ½[cos(${a + b}°) + cos(${a - b}°)]. Quelle est la valeur numérique (arrondie au centième) ?`, answer: num(r2(Math.cos(R(a)) * Math.cos(R(b))), 0.01), hints: H("cos a cos b = ½[cos(a + b) + cos(a − b)].", `a + b = ${a + b}° et a − b = ${a - b}°.`, "Calcule chaque cosinus.", "Fais la moyenne."), solution: `½[cos ${a + b}° + cos ${a - b}°] ≈ ${fr(r2(Math.cos(R(a)) * Math.cos(R(b))))}.` };
    if (t === 1) return { statement: `Calcule sin ${a}° × sin ${b}° = −½[cos(${a + b}°) − cos(${a - b}°)]. Quelle est la valeur numérique (arrondie au centième) ?`, answer: num(r2(Math.sin(R(a)) * Math.sin(R(b))), 0.01), hints: H("sin a sin b = −½[cos(a + b) − cos(a − b)].", `a + b = ${a + b}° et a − b = ${a - b}°.`, "Calcule chaque cosinus.", "Applique la formule."), solution: `≈ ${fr(r2(Math.sin(R(a)) * Math.sin(R(b))))}.` };
    if (t === 2) return { statement: `Calcule cos ${a}° + cos ${b}° = 2 cos(${(a + b) / 2}°) cos(${(a - b) / 2}°). Quelle est la valeur numérique (arrondie au centième) ?`, answer: num(r2(Math.cos(R(a)) + Math.cos(R(b))), 0.01), hints: H("cos p + cos q = 2 cos((p + q)/2) cos((p − q)/2).", `(p + q)/2 = ${(a + b) / 2}° et (p − q)/2 = ${(a - b) / 2}°.`, "Calcule les deux cosinus.", "Multiplie par 2."), solution: `≈ ${fr(r2(Math.cos(R(a)) + Math.cos(R(b))))}.` };
    return { statement: `Calcule sin ${a}° + sin ${b}° = 2 sin(${(a + b) / 2}°) cos(${(a - b) / 2}°). Quelle est la valeur numérique (arrondie au centième) ?`, answer: num(r2(Math.sin(R(a)) + Math.sin(R(b))), 0.01), hints: H("sin p + sin q = 2 sin((p + q)/2) cos((p − q)/2).", `(p + q)/2 = ${(a + b) / 2}° et (p − q)/2 = ${(a - b) / 2}°.`, "Calcule le sinus et le cosinus.", "Multiplie par 2."), solution: `≈ ${fr(r2(Math.sin(R(a)) + Math.sin(R(b))))}.` };
  }, FR),
  mk("cx-transfo", NT, 2, { skill: "Écriture complexe d'une translation, symétrie, homothétie, rotation : image d'un point", ref: `${BOOK}, chap. 3 §3.3, transformations et nombres complexes (p. 71-72) et ex. 3.g (p. 75) et ex. 32-35 (p. 77)`, kw: ["écriture complexe", "translation", "homothétie", "rotation", "symétrie", "image d'un point"] }, (_c, r) => {
    const z = rz(r, 5), t = int(r, 0, 4), p = (w: Z) => (int(r, 0, 1) === 0 ? w[0] : w[1]); void p;
    const wantRe = int(r, 0, 1) === 0, pick2 = (w: Z) => (wantRe ? w[0] : w[1]), lab = wantRe ? "partie réelle" : "partie imaginaire";
    if (t === 0) { const a = rz(r, 4); return { statement: `La translation de vecteur d'affixe ${zs(a)} a pour écriture complexe z′ = z + ${zp(a)}. Quelle est la ${lab} de l'image du point d'affixe ${zs(z)} ?`, answer: num(pick2(add(z, a))), hints: H("Pour une translation, z′ = z + a.", `z′ = ${zp(z)} + ${zp(a)}.`, "Additionne.", "Lis la partie demandée."), solution: `z′ = ${zs(add(z, a))}.` }; }
    if (t === 1) { const om = rz(r, 4), v = add(om, mul([-1, 0], sub(z, om))); return { statement: `Quelle est la ${lab} de l'image du point d'affixe ${zs(z)} par la symétrie de centre Ω d'affixe ${zs(om)} ?`, answer: num(pick2(v)), hints: H("Pour la symétrie de centre Ω, z′ − ω = −(z − ω).", "Donc z′ = 2ω − z.", `2 × ${zp(om)} − ${zp(z)}.`, "Calcule."), solution: `z′ = 2ω − z = ${zs(v)}.` }; }
    if (t === 2) { const om = rz(r, 3), k = pick(r, [2, 3, -2, -1, 4]), v = add(om, [k * (z[0] - om[0]), k * (z[1] - om[1])]); return { statement: `Quelle est la ${lab} de l'image du point d'affixe ${zs(z)} par l'homothétie de centre Ω d'affixe ${zs(om)} et de rapport ${n2(k)} ?`, answer: num(pick2(v)), hints: H("Pour l'homothétie de centre Ω et de rapport k, z′ − ω = k(z − ω).", `z − ω = ${zs(sub(z, om))}.`, `z′ = ω + ${par(k)}(z − ω).`, "Calcule."), solution: `z′ = ${zs(v)}.` }; }
    if (t === 3) { const om = rz(r, 3), q = pick(r, [[0, 1, "π/2"], [-1, 0, "π"], [0, -1, "−π/2"]] as [number, number, string][]), v = add(om, mul([q[0], q[1]], sub(z, om))); return { statement: `Quelle est la ${lab} de l'image du point d'affixe ${zs(z)} par la rotation de centre Ω d'affixe ${zs(om)} et d'angle ${q[2]} ?`, answer: num(pick2(v)), hints: H("Pour la rotation d'angle α et de centre Ω, z′ − ω = e^{iα}(z − ω).", `Ici e^{iα} = ${zs([q[0], q[1]])}.`, `z − ω = ${zs(sub(z, om))}.`, "Multiplie puis ajoute ω."), solution: `z′ = ω + ${zp([q[0], q[1]])}(z − ω) = ${zs(v)}.` }; }
    return { statement: `Quelle est la ${lab} de l'image du point d'affixe ${zs(z)} par la symétrie par rapport à l'axe réel ?`, answer: num(pick2(conj(z))), hints: H("La symétrie par rapport à l'axe réel a pour écriture z′ = z̄.", "On remplace z par son conjugué.", "La partie réelle est inchangée, la partie imaginaire change de signe.", "Lis la partie demandée."), solution: `z′ = ${zs(conj(z))}.` };
  }, FR),
  mk("cx-transfo-reconnaitre", NT, 3, { skill: "Reconnaître une transformation à partir de son écriture complexe z′ = az + b", ref: `${BOOK}, chap. 3 §3.3, tableau et exemples (p. 71-72) et ex. 3.g (p. 75) et ex. 34-35 (p. 77)`, kw: ["z′ = az + b", "nature", "rapport", "angle de la rotation", "centre", "point invariant"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const k = pick(r, [2, 3, -2, -3, 4, 0.5, -0.5]), om = rz(r, 4), b: Z = [om[0] * (1 - k), om[1] * (1 - k)], wantRe = int(r, 0, 1) === 0; return { statement: `La transformation d'écriture complexe z′ = ${n2(k)}z + ${zp(b)} est une homothétie. Quelle est ${wantRe ? "la partie réelle" : "la partie imaginaire"} de l'affixe de son centre ?`, answer: num(wantRe ? om[0] : om[1], 0.001), hints: H("Le centre est le point invariant : ω = aω + b.", `ω(1 − ${par(k)}) = ${zp(b)}.`, `ω = ${zp(b)} / ${n2(1 - k)}.`, "Calcule."), solution: `ω = ${zs(b)} / ${n2(1 - k)} = ${zs(om)}.` }; }
    if (t === 1) { const q = pick(r, [[0, 1, 90], [-1, 0, 180], [0, -1, -90]] as [number, number, number][]), om = rz(r, 3), b = sub(om, mul([q[0], q[1]], om)), a: Z = [q[0], q[1]]; return { statement: `La transformation d'écriture complexe z′ = ${zp(a)}z + ${zp(b)} est une rotation. Quel est son angle (en degrés, dans ]−180 ; 180]) ?`, answer: num(q[2]), hints: H("Si |a| = 1, c'est une rotation d'angle arg(a).", `a = ${zs(a)}, |a| = 1.`, "Un argument de a est l'angle de la rotation.", "Reconnais l'angle."), solution: `a = ${zs(a)} = e^{i ${q[2]}°} : angle ${q[2]}°.` }; }
    const a = pick(r, [[3, 4], [-4, 3], [5, 12], [12, -5], [8, 6]] as [number, number][]), den = Math.hypot(a[0], a[1]); return { statement: `Dans l'écriture complexe z′ = az + b, on a a = ${zs(a as Z)}. Le rapport de la similitude correspondante est |a|. Quel est-il ?`, answer: num(den), hints: H("Le rapport d'une transformation z′ = az + b est |a|.", `|a| = √(a₁² + a₂²).`, `${a[0] * a[0]} + ${a[1] * a[1]}.`, "Racine carrée."), solution: `|a| = √${a[0] * a[0] + a[1] * a[1]} = ${den}.` };
  }, FR),
  mk("cx-configurations", NT, 3, { skill: "Configurations (isocèle, équilatéral, rectangle, alignement) caractérisées par (z_C − z_A)/(z_B − z_A)", ref: `${BOOK}, chap. 3 §3.3, configurations du plan (p. 72-73) et ex. 3.j (p. 75)`, kw: ["triangle équilatéral", "rectangle isocèle", "rapport (z_C − z_A)/(z_B − z_A)", "alignés", "configuration"] }, (_c, r) => {
    const A = rz(r, 3), u = rz(r, 3), t = pick(r, [["i", [0, 1], "rectangle et isocèle en A"], ["−i", [0, -1], "rectangle et isocèle en A"], ["2i", [0, 2], "rectangle en A (mais pas isocèle)"], ["3", [3, 0], "aligné avec A et B"], ["1/2 + i√3/2", null, "équilatéral"]] as [string, Z | null, string][]);
    if (t[1]) { const B = add(A, u), C = add(A, mul(u, t[1])); return { statement: `A ${zp(A)}, B ${zp(B)} et C ${zp(C)}. Le quotient (z_C − z_A)/(z_B − z_A) vaut ${t[0]}. Que peut-on dire de ces trois points ?`, answer: choice(r, ["Triangle rectangle et isocèle en A", "Triangle rectangle en A (mais pas isocèle)", "Points alignés", "Triangle équilatéral"], t[2].startsWith("rectangle et isocèle") ? 0 : t[2].startsWith("rectangle en A") ? 1 : 2), hints: H("On regarde le module et l'argument du quotient.", "Quotient imaginaire pur : angle droit en A. Module 1 : AB = AC. Quotient réel : points alignés.", `Quotient = ${t[0]}.`, "Conclus."), solution: `(z_C − z_A)/(z_B − z_A) = ${t[0]} : ${t[2]}.` }; }
    return { statement: "Le quotient (z_C − z_A)/(z_B − z_A) vaut e^{iπ/3}. Que peut-on dire du triangle ABC ?", answer: choice(r, ["Triangle équilatéral", "Triangle rectangle et isocèle en A", "Points alignés", "Triangle rectangle en A (mais pas isocèle)"], 0), hints: H("Le module du quotient est 1 : AB = AC.", "Son argument est π/3 : l'angle en A vaut 60°.", "Un triangle isocèle d'angle au sommet 60° est équilatéral.", "Conclus."), solution: "AC = AB et l'angle en A vaut π/3 : le triangle est équilatéral." };
  }, QCM),
  mk("cx-lieu", NT, 3, { skill: "Lieu des points M(z) : |z − z_A| = R, arg(z − z_A), |z − a| = |z − b|", ref: `${BOOK}, chap. 3 §3.3, lieux géométriques (p. 73-74) et ex. 3.h-3.j (p. 75) et ex. 9 (p. 76)`, kw: ["lieu géométrique", "|z − z_A| = R", "cercle", "médiatrice", "demi-droite", "argument"] }, (_c, r) => {
    const t = int(r, 0, 2), A = rz(r, 4), R = int(r, 1, 6);
    if (t === 0) return { statement: `Quel est le rayon du cercle des points M d'affixe z tels que |z − ${zp(A)}| = ${R} ?`, answer: num(R), hints: H("|z − z_A| = AM.", "L'ensemble des points M tels que AM = R est un cercle de centre A.", "Son rayon est R.", `R = ${R}.`), solution: `C'est le cercle de centre A d'affixe ${zs(A)} et de rayon ${R}.` };
    if (t === 1) { const B = rz(r, 4); return { statement: `Les points M d'affixe z tels que |z − ${zp(A)}| = |z − ${zp(B)}| décrivent : `, answer: choice(r, ["La médiatrice de [AB]", "Le cercle de diamètre [AB]", "La droite (AB)", "Une demi-droite d'origine A"], 0), hints: H("|z − z_A| = AM et |z − z_B| = BM.", "AM = BM.", "Les points équidistants de A et B…", "…forment la médiatrice."), solution: "AM = BM : c'est la médiatrice de [AB]." }; }
    const al = pick(r, [30, 45, 60, 90]);
    return { statement: `Les points M d'affixe z tels que arg(z − ${zp(A)}) ≡ ${al}° [360°] décrivent : `, answer: choice(r, ["Une demi-droite d'origine A privée de A", "Un cercle de centre A", "Une droite entière", "Un segment"], 0), hints: H("arg(z − z_A) est une mesure de (e₁, AM).", "L'angle orienté (e₁, AM) est fixé.", "Donc M est sur une demi-droite d'origine A.", "A lui-même est exclu (z = z_A n'a pas d'argument)."), solution: `C'est la demi-droite d'origine A de vecteur directeur d'argument ${al}°, privée de A.` };
  }, QCM),
  mk("cx-cours", NC, 1, { skill: "Nombres complexes : questions de cours", ref: `${BOOK}, chap. 3 §1 à §3 (p. 56-74)`, kw: ["conjugué", "module", "argument", "Moivre", "Euler", "racines n-ièmes", "affixe"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle est la forme algébrique d'un nombre complexe ?", good: "a + ib avec a, b réels et i² = −1", bad: ["a + ib avec a, b entiers", "a + b avec i = 1", "ai + b avec i² = 1"], why: "Définition, p. 56." },
      { q: "Que vaut z z̄ pour z = a + ib ?", good: "a² + b²", bad: ["a² − b²", "2a", "a + b"], why: "Propriété, p. 59." },
      { q: "Quand un nombre complexe est-il réel ?", good: "Quand z̄ = z", bad: ["Quand z̄ = −z", "Quand |z| = 1", "Quand arg(z) = π/2"], why: "Propriété 1, p. 59." },
      { q: "|z + z′| ≤ …", good: "|z| + |z′|", bad: ["|z| − |z′|", "|z||z′|", "2|z|"], why: "Inégalité triangulaire, p. 60." },
      { q: "Si z est l'affixe d'un point M, que vaut |z| ?", good: "OM", bad: ["La mesure de (e₁, OM)", "Re(z)", "z̄"], why: "Interprétation géométrique, p. 60." },
      { q: "Que représente arg(z) ?", good: "Une mesure de l'angle orienté (e₁, OM)", bad: ["La distance OM", "Le module de z", "Le conjugué de z"], why: "Définition, p. 62." },
      { q: "Le nombre complexe nul a-t-il un argument ?", good: "Non", bad: ["Oui, 0", "Oui, π", "Oui, tous les réels"], why: "Remarque p. 63." },
      { q: "arg(zz′) ≡ …", good: "arg(z) + arg(z′) [2π]", bad: ["arg(z) × arg(z′) [2π]", "arg(z) − arg(z′) [2π]", "|z| + |z′| [2π]"], why: "Propriétés 1, p. 64." },
      { q: "Quelle est la formule de Moivre ?", good: "(cos α + i sin α)ⁿ = cos nα + i sin nα", bad: ["(cos α + i sin α)ⁿ = cos αⁿ + i sin αⁿ", "(cos α + i sin α)ⁿ = n(cos α + i sin α)", "(cos α + i sin α)ⁿ = cos α + n i sin α"], why: "Propriété p. 65." },
      { q: "Quelle est la formule d'Euler pour cos α ?", good: "cos α = (e^{iα} + e^{−iα})/2", bad: ["cos α = (e^{iα} − e^{−iα})/2", "cos α = (e^{iα} + e^{−iα})/2i", "cos α = e^{iα} + e^{−iα}"], why: "Propriétés p. 66." },
      { q: "Combien de racines n-ièmes (n ≥ 2) un nombre complexe non nul admet-il ?", good: "n", bad: ["1", "2", "Une infinité"], why: "Définition, p. 66." },
      { q: "Les images des racines n-ièmes d'un complexe non nul sont…", good: "les sommets d'un polygone régulier à n côtés inscrit dans un cercle de centre O", bad: ["alignées", "toutes confondues", "les sommets d'un carré"], why: "Propriétés, p. 66." },
      { q: "Quelle est l'écriture complexe de la translation de vecteur d'affixe a ?", good: "z′ = z + a", bad: ["z′ = az", "z′ = z̄ + a", "z′ = a − z"], why: "Tableau p. 71." },
      { q: "Quelle est l'écriture complexe de la rotation de centre Ω(ω) et d'angle α ?", good: "z′ − ω = e^{iα}(z − ω)", bad: ["z′ − ω = α(z − ω)", "z′ = e^{iα}z + ω", "z′ − ω = −(z − ω)"], why: "Tableau p. 71." },
      { q: "À quelle transformation correspond z′ = z̄ ?", good: "La symétrie par rapport à l'axe réel", bad: ["La symétrie par rapport à l'axe imaginaire", "La symétrie centrale de centre O", "La rotation d'angle π"], why: "Tableau p. 71." },
    ];
    return qcmOf(r, pool, "Reviens à la définition ou à la propriété du chapitre.");
  }, QCM),
];
void conj;
