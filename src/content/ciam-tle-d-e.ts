// CIAM Terminale SE (série D) : nombres complexes, géométrie et transformations. Pages du manuel « CIAM Terminale SE ».
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtd");
const BOOK = "CIAM Tle SE";
const NC = "Nombres complexes — série D";
const NG = "Nombres complexes et géométrie du plan — série D";
const TR = "Composées de transformations — série D";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const nz = (r: () => number, lo: number, hi: number) => { let v = 0; while (v === 0) v = lo + Math.floor(r() * (hi - lo + 1)); return v; };
/** a + bi écrit proprement. */
const cx = (a: number, b: number) => {
  if (b === 0) return S(a);
  const im = Math.abs(b) === 1 ? "i" : `${fr(Math.abs(b))}i`;
  if (a === 0) return `${b < 0 ? "−" : ""}${im}`;
  return `${S(a)} ${b < 0 ? "−" : "+"} ${im}`;
};
const ANG = [
  { t: "π/6", v: Math.PI / 6 }, { t: "π/4", v: Math.PI / 4 }, { t: "π/3", v: Math.PI / 3 }, { t: "π/2", v: Math.PI / 2 },
  { t: "2π/3", v: (2 * Math.PI) / 3 }, { t: "3π/4", v: (3 * Math.PI) / 4 }, { t: "5π/6", v: (5 * Math.PI) / 6 },
  { t: "−π/6", v: -Math.PI / 6 }, { t: "−π/4", v: -Math.PI / 4 }, { t: "−π/3", v: -Math.PI / 3 }, { t: "−π/2", v: -Math.PI / 2 },
  { t: "−2π/3", v: (-2 * Math.PI) / 3 }, { t: "−3π/4", v: (-3 * Math.PI) / 4 },
];

export const TDE: Template[] = [
  // ===== Chapitre 10 : nombres complexes =====
  mk("nc-operations", NC, 1, { skill: "Somme et produit de nombres complexes en forme algébrique (i² = −1)", ref: `${BOOK}, chap. 10 §1.1 (p. 207)`, kw: ["nombres complexes", "i² = −1", "produit", "somme", "forme algébrique"] }, (c, r) => {
    const a = int(r, -5, 5), b = nz(r, -5, 5), cc = int(r, -5, 5), d = nz(r, -5, 5);
    const prod = int(r, 0, 1) === 0;
    const re = prod ? a * cc - b * d : a + cc, im = prod ? a * d + b * cc : b + d;
    const askRe = int(r, 0, 1) === 0;
    return { statement: `z = ${cx(a, b)} et z′ = ${cx(cc, d)}. Quelle est la ${askRe ? "partie réelle" : "partie imaginaire"} de ${prod ? "z × z′" : "z + z′"} ?`, answer: num(askRe ? re : im), hints: H(prod ? "(a + ib)(c + id) = (ac − bd) + i(ad + bc)." : "(a + ib) + (c + id) = (a + c) + i(b + d).", prod ? `ac − bd = ${a * cc} − ${P(b * d)}.` : `a + c = ${a} + ${P(cc)} et b + d = ${b} + ${P(d)}.`, askRe ? "Calcule la partie réelle." : "Calcule la partie imaginaire.", "Conclus."), solution: `${prod ? "z × z′" : "z + z′"} = ${cx(re, im)}.` };
  }),
  mk("nc-conjugue-inverse", NC, 2, { skill: "Écrire 1/z ou z/z′ sous forme algébrique avec le conjugué", ref: `${BOOK}, chap. 10 §1.4 (p. 211-212)`, kw: ["conjugué", "quotient", "inverse", "forme algébrique"] }, (c, r) => {
    const a = nz(r, -4, 4), b = nz(r, -4, 4), cc = nz(r, -4, 4), d = nz(r, -4, 4);
    const den = cc * cc + d * d;
    // (a + ib)/(c + id) = ((ac + bd) + i(bc − ad))/den
    const re = (a * cc + b * d) / den, im = (b * cc - a * d) / den;
    const askRe = int(r, 0, 1) === 0;
    return { statement: `Écris (${cx(a, b)})/(${cx(cc, d)}) sous forme algébrique. Quelle est la ${askRe ? "partie réelle" : "partie imaginaire"} ? (arrondie au centième)`, answer: num(round(askRe ? re : im, 2), 0.01), hints: H("Multiplie le numérateur et le dénominateur par le conjugué du dénominateur.", `z·z̄ = ${cc}² + ${d}² = ${den}.`, `Numérateur : (${cx(a, b)})(${cx(cc, -d)}) = ${cx(a * cc + b * d, b * cc - a * d)}.`, `Divise par ${den}.`), solution: `Quotient = (${cx(a * cc + b * d, b * cc - a * d)})/${den} ≈ ${cx(round(re, 2), round(im, 2))}.` };
  }),
  mk("nc-module", NC, 1, { skill: "Module et conjugué d'un nombre complexe", ref: `${BOOK}, chap. 10 §1.4 (p. 211)`, kw: ["module", "conjugué", "|z| = √(a² + b²)", "z z̄"] }, (c, r) => {
    const [a, b, m] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [1, 1, Math.SQRT2], [2, 1, Math.sqrt(5)], [1, 2, Math.sqrt(5)], [3, 1, Math.sqrt(10)]] as [number, number, number][]);
    const sa = int(r, 0, 1) === 0 ? 1 : -1, sb = int(r, 0, 1) === 0 ? 1 : -1;
    return { statement: `Calcule le module de z = ${cx(sa * a, sb * b)} (arrondi au centième).`, answer: num(round(m, 2), 0.01), hints: H("|a + ib| = √(a² + b²).", `a² + b² = ${a * a + b * b}.`, `√${a * a + b * b}.`, "Calcule."), solution: `|z| = √${a * a + b * b} ≈ ${fr(round(m, 2))}.` };
  }),
  mk("nc-egalite", NC, 2, { skill: "Égalité de deux nombres complexes : parties réelle et imaginaire", ref: `${BOOK}, chap. 10 §1.2 (p. 208)`, kw: ["égalité de nombres complexes", "partie réelle", "partie imaginaire", "x réel", "imaginaire pur"] }, (c, r) => {
    const a = nz(r, -4, 4), b = nz(r, -4, 4), x = int(r, -5, 5), y = int(r, -5, 5);
    // x + i y = (a x ... ) simple : (2x − 1) + i(x + y) = a + i b → x = (a+1)/2 ...
    const A = 2 * x + y, B = x - y;
    const askX = int(r, 0, 1) === 0;
    return { statement: `Soit x et y deux réels tels que (2x + y) + i(x − y) = ${cx(A, B)}. Quelle est la valeur de ${askX ? "x" : "y"} ?`, answer: num(askX ? x : y), hints: H("Deux nombres complexes sont égaux si et seulement si ils ont même partie réelle et même partie imaginaire.", `2x + y = ${S(A)} et x − y = ${S(B)}.`, "Additionne les deux équations : 3x = ...", "Remplace pour trouver l'autre inconnue."), solution: `x = ${S(x)} et y = ${S(y)}.` };
    void a; void b;
  }),
  mk("nc-trigo", NC, 2, { skill: "Forme trigonométrique : module et argument d'un nombre complexe", ref: `${BOOK}, chap. 10 §2.2 (p. 214-215)`, kw: ["forme trigonométrique", "module", "argument", "r(cos θ + i sin θ)"] }, (c, r) => {
    const t = pick(r, [[1, 1, "π/4", Math.PI / 4], [1, Math.sqrt(3), "π/3", Math.PI / 3], [-1, 1, "3π/4", (3 * Math.PI) / 4], [1, -1, "−π/4", -Math.PI / 4], [Math.sqrt(3), 1, "π/6", Math.PI / 6], [-1, -Math.sqrt(3), "−2π/3", (-2 * Math.PI) / 3]] as [number, number, string, number][]);
    const [a, b, th] = t;
    const mod = Math.hypot(a, b);
    const w = (x: number) => (Math.abs(x - Math.sqrt(3)) < 1e-9 ? "√3" : Math.abs(x + Math.sqrt(3)) < 1e-9 ? "−√3" : S(x));
    const askMod = int(r, 0, 1) === 0;
    return { statement: askMod ? `Calcule le module de z = ${w(a)} ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : w(Math.abs(b))}i.`.replace("+ i", "+ i") : `Quel est l'argument principal de z = ${w(a)} ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : w(Math.abs(b))}i ? (en radians, arrondi au centième)`, answer: num(round(askMod ? mod : t[3], 2), 0.02), hints: H(askMod ? "|z| = √(a² + b²)." : "θ est solution de cos θ = a/r et sin θ = b/r.", `r = √(${round(a * a, 3)} + ${round(b * b, 3)}) = ${fr(round(mod, 3))}.`, askMod ? "Calcule." : `cos θ = ${fr(round(a / mod, 3))} et sin θ = ${fr(round(b / mod, 3))}.`, "Conclus."), solution: askMod ? `|z| = ${fr(round(mod, 2))}.` : `θ = ${th} ≈ ${S(round(t[3], 2))}.` };
  }),
  mk("nc-produit-trigo", NC, 3, { skill: "Produit, quotient, puissance : modules et arguments", ref: `${BOOK}, chap. 10 §2.2 (p. 217)`, kw: ["produit de complexes", "arguments", "|zz′| = |z||z′|", "arg(zⁿ)", "forme exponentielle"] }, (c, r) => {
    const r1 = int(r, 1, 4), r2 = int(r, 1, 4);
    const k1 = int(r, -3, 3), k2 = int(r, -3, 3);
    const n = int(r, 2, 4);
    const t = int(r, 0, 2);
    // arguments en π/12 unités
    const a1 = k1, a2 = k2; // multiples de π/6
    if (t === 0) { const mod = r1 * r2; return { statement: `z = ${r1}e^(i·${a1}π/6) et z′ = ${r2}e^(i·${a2}π/6). Quel est le module de z × z′ ?`.replace("i·0π/6", "i·0").replace(`·${a1}π`, `·${S(a1)}π`).replace(`·${a2}π`, `·${S(a2)}π`), answer: num(mod), hints: H("|zz′| = |z| × |z′|.", `|z| = ${r1}, |z′| = ${r2}.`, `${r1} × ${r2}.`, "Calcule."), solution: `|zz′| = ${mod}.` }; }
    if (t === 1) { return { statement: `z = ${r1}e^(i·${S(a1)}π/6) et z′ = ${r2}e^(i·${S(a2)}π/6). Un argument de z × z′ est kπ/6 ; quelle est la valeur de k ?`, answer: num(a1 + a2), hints: H("arg(zz′) = arg z + arg z′ (à 2π près).", `${S(a1)} + ${P(a2)}.`, "Calcule k.", "Conclus."), solution: `k = ${S(a1)} + ${P(a2)} = ${S(a1 + a2)}.` }; }
    const mod = r1 ** n;
    return { statement: `z = ${r1}e^(i·${S(a1)}π/6). Quel est le module de z^${n} ?`, answer: num(mod), hints: H("|zⁿ| = |z|ⁿ.", `|z| = ${r1}.`, `${r1}^${n}.`, "Calcule."), solution: `|z^${n}| = ${mod}.` };
  }),
  mk("nc-moivre", NC, 3, { skill: "Formule de Moivre : (cos θ + i sin θ)ⁿ = cos nθ + i sin nθ", ref: `${BOOK}, chap. 10 §2.3 (p. 218)`, kw: ["formule de Moivre", "puissance", "cos nθ", "sin nθ"] }, (c, r) => {
    const a = pick(r, ANG.slice(0, 7));
    const n = int(r, 2, 6);
    const askCos = int(r, 0, 1) === 0;
    const v = askCos ? Math.cos(n * a.v) : Math.sin(n * a.v);
    return { statement: `Calcule la ${askCos ? "partie réelle" : "partie imaginaire"} de (cos(${a.t}) + i sin(${a.t}))^${n} (arrondie au centième).`, answer: num(round(v, 2), 0.02), hints: H("Moivre : (cos θ + i sin θ)ⁿ = cos nθ + i sin nθ.", `nθ = ${n} × ${a.t}.`, askCos ? `Partie réelle : cos(${n}θ).` : `Partie imaginaire : sin(${n}θ).`, "Calcule."), solution: `${askCos ? `cos(${n} × ${a.t})` : `sin(${n} × ${a.t})`} ≈ ${S(round(v, 2))}.` };
  }),
  mk("nc-racines", NC, 3, { skill: "Racines n-ièmes d'un nombre complexe : nombre et module", ref: `${BOOK}, chap. 10 §3.1 (p. 219-220)`, kw: ["racines n-ièmes", "zⁿ = Z", "∜ρ", "n solutions"] }, (c, r) => {
    const n = int(r, 2, 6), rho = pick(r, [8, 16, 27, 64, 81, 32]);
    const ask = int(r, 0, 1) === 0;
    return { statement: ask ? `Combien de solutions l'équation z^${n} = ${rho}e^(iπ/3) admet-elle dans ℂ ?` : `Les solutions de z^${n} = ${rho}e^(iπ/3) ont toutes le même module. Quel est-il ? (arrondi au centième)`, answer: num(ask ? n : round(rho ** (1 / n), 2), ask ? 0.01 : 0.02), hints: H("Pour Z ≠ 0, l'équation zⁿ = Z a exactement n solutions : z_k = ⁿ√ρ·e^(i(θ + 2kπ)/n).", "Le module de chaque solution est ⁿ√ρ.", ask ? `Il y en a ${n}.` : `ⁿ√ρ = ${rho}^(1/${n}).`, "Conclus."), solution: ask ? `${n} solutions.` : `Module = ${rho}^(1/${n}) ≈ ${fr(round(rho ** (1 / n), 2))}.` };
  }),
  mk("nc-cours", NC, 1, { skill: "Nombres complexes : définitions et propriétés (cours)", ref: `${BOOK}, chap. 10 (p. 205-220)`, kw: ["nombres complexes", "conjugué", "module", "argument", "Moivre", "Euler"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quel nombre imaginaire i vérifie-t-on dans ℂ ?", good: "i² = −1", bad: ["i² = 1", "i = −1", "i = √2"], why: "Propriété-définition du manuel (§1.1)." },
      { q: "a + ib = a′ + ib′ (a, b, a′, b′ réels) équivaut à :", good: "a = a′ et b = b′", bad: ["a + b = a′ + b′", "a = b′", "ab = a′b′"], why: "Propriété du manuel (§1.2)." },
      { q: "Le conjugué de z = a + ib est :", good: "z̄ = a − ib", bad: ["z̄ = −a + ib", "z̄ = b + ia", "z̄ = a + ib"], why: "Définition du manuel (§1.4)." },
      { q: "z × z̄ vaut (z = a + ib) :", good: "a² + b²", bad: ["a² − b²", "2a", "(a + b)²"], why: "Propriétés du manuel (§1.4)." },
      { q: "Le module de z = a + ib est :", good: "√(a² + b²)", bad: ["a + b", "a² + b²", "√(a² − b²)"], why: "Définition du manuel (§1.4)." },
      { q: "eⁱᶿ vaut :", good: "cos θ + i sin θ", bad: ["cos θ − i sin θ", "sin θ + i cos θ", "cos θ × sin θ"], why: "Notation d'Euler (§2.2)." },
      { q: "La formule de Moivre dit que (cos θ + i sin θ)ⁿ vaut :", good: "cos nθ + i sin nθ", bad: ["n cos θ + i n sin θ", "cosⁿθ + i sinⁿθ", "cos θ + i sin nθ"], why: "Formule de Moivre (§2.3)." },
      { q: "cos θ s'exprime avec les exponentielles (formule d'Euler) par :", good: "(eⁱᶿ + e⁻ⁱᶿ)/2", bad: ["(eⁱᶿ − e⁻ⁱᶿ)/2", "(eⁱᶿ + e⁻ⁱᶿ)/(2i)", "eⁱᶿ × e⁻ⁱᶿ"], why: "Formules d'Euler (§2.3)." },
      { q: "Pour Z ≠ 0 et n entier non nul, zⁿ = Z admet :", good: "exactement n solutions dans ℂ", bad: ["une seule solution", "deux solutions", "aucune solution"], why: "Racines n-ièmes (§3.1)." },
    ];
    return qcmOf(r, pool, "Reprends les définitions de i, du conjugué et du module.");
  }, QCM),

  // ===== Chapitre 11 : complexes et géométrie =====
  mk("ng-distance", NG, 1, { skill: "Affixe d'un vecteur et distance AB = |z_B − z_A|", ref: `${BOOK}, chap. 11 §1.1 (p. 230)`, kw: ["affixe", "distance", "|z_B − z_A|", "vecteur", "module"] }, (c, r) => {
    const zA = [int(r, -4, 4), int(r, -4, 4)], zB = [int(r, -4, 4), int(r, -4, 4)];
    const ask = int(r, 0, 1) === 0;
    const d = Math.hypot(zB[0] - zA[0], zB[1] - zA[1]);
    return { statement: ask ? `A et B ont pour affixes z_A = ${cx(zA[0], zA[1])} et z_B = ${cx(zB[0], zB[1])}. Quelle est la partie réelle de l'affixe du vecteur AB ?` : `A et B ont pour affixes z_A = ${cx(zA[0], zA[1])} et z_B = ${cx(zB[0], zB[1])}. Calcule la distance AB (arrondie au centième).`, answer: num(ask ? zB[0] - zA[0] : round(d, 2), ask ? 0.01 : 0.02), hints: H("z_AB = z_B − z_A et AB = |z_B − z_A|.", `z_B − z_A = ${cx(zB[0] - zA[0], zB[1] - zA[1])}.`, ask ? "Lis la partie réelle." : `AB = √(${(zB[0] - zA[0]) ** 2} + ${(zB[1] - zA[1]) ** 2}).`, "Calcule."), solution: ask ? `z_AB = ${cx(zB[0] - zA[0], zB[1] - zA[1])}.` : `AB ≈ ${fr(round(d, 2))}.` };
  }),
  mk("ng-configurations", NG, 3, { skill: "Alignement, parallélogramme, orthogonalité avec des affixes", ref: `${BOOK}, chap. 11 §1.2 (p. 231)`, kw: ["alignement", "parallélogramme", "orthogonalité", "affixes", "z_AC/z_AB"] }, (c, r) => {
    const A = [int(r, -3, 3), int(r, -3, 3)];
    const u = [nz(r, -3, 3), nz(r, -3, 3)];
    const kind = int(r, 0, 2);
    const k = pick(r, [2, -1, 3, -2]);
    let B = [A[0] + u[0], A[1] + u[1]], C: number[], ans = 0;
    if (kind === 0) { C = [A[0] + k * u[0], A[1] + k * u[1]]; ans = 0; } else if (kind === 1) { C = [A[0] - k * u[1], A[1] + k * u[0]]; ans = 1; } else { C = [A[0] + u[0] + int(r, 1, 2), A[1] + u[1] + int(r, 1, 2)]; ans = 2; }
    if (kind === 2) { const ux = C[0] - A[0], uy = C[1] - A[1]; if (u[0] * uy - u[1] * ux === 0 || u[0] * ux + u[1] * uy === 0) C = [C[0] + 1, C[1]]; }
    const cr = u[0] * (C[1] - A[1]) - u[1] * (C[0] - A[0]), dt = u[0] * (C[0] - A[0]) + u[1] * (C[1] - A[1]);
    const idx = cr === 0 ? 0 : dt === 0 ? 1 : 2;
    void ans;
    return { statement: `A, B, C ont pour affixes ${cx(A[0], A[1])} ; ${cx(B[0], B[1])} ; ${cx(C[0], C[1])}. Les points A, B, C sont-ils alignés, les droites (AB) et (AC) sont-elles perpendiculaires, ou ni l'un ni l'autre ?`, answer: { kind: "choice", options: ["A, B, C sont alignés", "(AB) ⊥ (AC)", "Ni l'un ni l'autre"], index: idx }, hints: H("Calcule le quotient (z_C − z_A)/(z_B − z_A).", "Réel non nul : points alignés. Imaginaire pur non nul : droites perpendiculaires.", `z_B − z_A = ${cx(u[0], u[1])} et z_C − z_A = ${cx(C[0] - A[0], C[1] - A[1])}.`, "Conclus."), solution: `Le quotient est ${idx === 0 ? "réel : alignés" : idx === 1 ? "imaginaire pur : perpendiculaires" : "ni réel ni imaginaire pur"}.` };
  }, QCM),
  mk("ng-ecriture", TR, 2, { skill: "Écriture complexe d'une translation, d'une symétrie, d'une rotation de centre O", ref: `${BOOK}, chap. 11 §2.1 (p. 232)`, kw: ["écriture complexe", "translation", "symétrie", "rotation", "z′ = z + b"] }, (c, r) => {
    const t = int(r, 0, 3);
    const a = int(r, -4, 4), b = int(r, -4, 4), x = int(r, -4, 4), y = int(r, -4, 4);
    const z = cx(x, y);
    if (t === 0) { const re = x + a, im = y + b; return { statement: `t est la translation de vecteur d'affixe ${cx(a, b)}. Quelle est la partie imaginaire de l'image du point d'affixe ${z} ?`, answer: num(im), hints: H("z′ = z + b.", `b = ${cx(a, b)}.`, `z′ = ${z} + (${cx(a, b)}).`, "Lis la partie imaginaire."), solution: `z′ = ${cx(re, im)}.` }; }
    if (t === 1) { return { statement: `s est la symétrie d'axe (OI) (axe des réels). Quelle est la partie imaginaire de l'image du point d'affixe ${z} ?`, answer: num(-y), hints: H("L'écriture complexe de la symétrie d'axe (OI) est z′ = z̄.", `z̄ = ${cx(x, -y)}.`, "Lis la partie imaginaire.", "Conclus."), solution: `z′ = ${cx(x, -y)}.` }; }
    if (t === 2) { return { statement: `s est la symétrie de centre O. Quelle est la partie réelle de l'image du point d'affixe ${z} ?`, answer: num(-x), hints: H("L'écriture complexe de la symétrie de centre O est z′ = −z.", `−z = ${cx(-x, -y)}.`, "Lis la partie réelle.", "Conclus."), solution: `z′ = ${cx(-x, -y)}.` }; }
    const th = pick(r, [["π/2", 0, 1], ["π", -1, 0], ["−π/2", 0, -1]] as [string, number, number][]);
    // rotation d'angle th : multiplication par e^{iθ} = c + i s
    const re = x * th[1] - y * th[2], im = x * th[2] + y * th[1];
    return { statement: `ρ est la rotation de centre O et d'angle ${th[0]}. Quelle est la partie réelle de l'image du point d'affixe ${z} ?`, answer: num(re), hints: H("L'écriture complexe de la rotation de centre O et d'angle θ est z′ = e^(iθ)·z.", `e^(i·${th[0]}) = ${cx(th[1], th[2])}.`, `z′ = (${cx(th[1], th[2])})(${z}).`, "Lis la partie réelle."), solution: `z′ = ${cx(re, im)}.` };
  }),
  mk("ng-cours", NG, 1, { skill: "Nombres complexes et géométrie : propriétés du cours", ref: `${BOOK}, chap. 11 (p. 229-232)`, kw: ["affixe", "angle orienté", "rotation", "translation", "alignement"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "L'affixe du vecteur AB est :", good: "z_B − z_A", bad: ["z_A − z_B", "z_A + z_B", "z_A × z_B"], why: "Propriété du manuel (§1.1)." },
      { q: "mes(AB, CD) est égal à :", good: "arg((z_D − z_C)/(z_B − z_A)) à 2kπ près", bad: ["arg((z_B − z_A)/(z_D − z_C))", "arg(z_D − z_C) × arg(z_B − z_A)", "|z_D − z_C|/|z_B − z_A|"], why: "Propriété du manuel (§1.1, angle orienté de vecteurs)." },
      { q: "A, B, C sont alignés (distincts) si et seulement si (z_C − z_A)/(z_B − z_A) est :", good: "un réel non nul", bad: ["un imaginaire pur non nul", "égal à 1", "de module 1"], why: "Propriété du manuel (§1.2)." },
      { q: "(AB) ⊥ (CD) si et seulement si (z_D − z_C)/(z_B − z_A) est :", good: "un imaginaire pur non nul", bad: ["un réel", "égal à −1", "de module 1"], why: "Propriété du manuel (§1.2)." },
      { q: "AB = CD (vecteurs égaux) équivaut à :", good: "z_B − z_A = z_D − z_C", bad: ["|z_B| = |z_D|", "z_A = z_C", "z_B + z_A = z_D + z_C"], why: "Propriété du manuel (§1.2)." },
      { q: "La translation de vecteur d'affixe b a pour écriture complexe :", good: "z′ = z + b", bad: ["z′ = b z", "z′ = z̄ + b", "z′ = z − b²"], why: "Propriété du manuel (§2.1)." },
      { q: "L'écriture complexe de la symétrie d'axe (OI) est :", good: "z′ = z̄", bad: ["z′ = −z", "z′ = −z̄", "z′ = iz"], why: "Propriété du manuel (§2.1)." },
      { q: "La rotation de centre O et d'angle θ a pour écriture complexe :", good: "z′ = e^(iθ) z", bad: ["z′ = θ z", "z′ = z + e^(iθ)", "z′ = z̄ e^(iθ)"], why: "Propriété du manuel (§2.1)." },
    ];
    return qcmOf(r, pool, "Traduis chaque configuration avec des affixes.");
  }, QCM),
];
void pick;
