// CIAM Terminale SM (série C) : chapitre 7, Coniques. Énoncés originaux, réponses calculées par le code.
// Les constructions point par point et les démonstrations du manuel ne se corrigent pas automatiquement : on en garde
// les calculs (équation réduite, éléments caractéristiques, tangentes, nature d'une courbe) et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamtq");
const BOOK = "CIAM Terminale SM";
const CO = "Coniques — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
/** Terme ± a à la suite d'une expression : « + 3 » ou « − 3 » (rien si a = 0). */
const tail = (a: number) => (a === 0 ? "" : ` ${a < 0 ? "−" : "+"} ${Math.abs(a)}`);
/** (x − h)² ou x² */
const sqx = (v: string, h: number) => (h === 0 ? `${v}²` : `(${v} ${h > 0 ? "−" : "+"} ${Math.abs(h)})²`);

export const TC_CONIQ: Template[] = [
  mk("co-nature-excentricite", CO, 1, { skill: "Nature d'une conique d'après son excentricité", ref: `${BOOK}, chap. 7 §1.1, définitions (p. 149) et ex. 1.b (p. 153)`, kw: ["conique", "excentricité", "parabole", "ellipse", "hyperbole", "foyer", "directrice"] }, (_c, r) => {
    const e = pick(r, [0.5, 0.75, 1, 1, 1.5, 2, 3, 0.8, 0.25, 4 / 3]), nat = e === 1 ? "Une parabole" : e < 1 ? "Une ellipse" : "Une hyperbole";
    return { statement: `(Γ) est l'ensemble des points M du plan tels que MF/MH = ${fr(Math.round(e * 100) / 100)}, où H est le projeté orthogonal de M sur une droite (𝒟) ne contenant pas F. Quelle est la nature de (Γ) ?`, answer: choice(r, ["Une parabole", "Une ellipse", "Une hyperbole", "Un cercle"], ["Une parabole", "Une ellipse", "Une hyperbole"].indexOf(nat)), hints: H("MF/MH = e définit une conique de foyer F et de directrice (𝒟).", "e = 1 : parabole ; 0 < e < 1 : ellipse ; e > 1 : hyperbole.", `Ici e = ${fr(Math.round(e * 100) / 100)}.`, "Compare e à 1."), solution: `e = ${fr(Math.round(e * 100) / 100)} ${e === 1 ? "= 1" : e < 1 ? "< 1" : "> 1"} : ${nat.toLowerCase()}.` };
  }, QCM),
  mk("co-sommets-focal", CO, 2, { skill: "Sommets sur l'axe focal d'une conique : barycentres de (F, 1), (K, ±e)", ref: `${BOOK}, chap. 7 §1.1, propriété 2 (p. 149) et ex. 1.b (p. 153)`, kw: ["sommets", "axe focal", "excentricité", "barycentre", "distance du foyer à la directrice"] }, (_c, r) => {
    const d = int(r, 3, 12), e = pick(r, [0.5, 2, 3, 0.25, 1.5, 4].filter((x) => (d * x) % 1 === 0 || true)), asked = int(r, 0, 1);
    const A = (d * e) / (1 + e), A2 = (d * e) / Math.abs(1 - e);
    return { statement: `Une conique de foyer F et de directrice (𝒟) a pour excentricité ${fr(e)} (e ≠ 1). K est le projeté orthogonal de F sur (𝒟) et FK = ${d}. Les sommets A et A′ sont les barycentres de (F, 1), (K, ${asked === 0 ? "e" : "−e"}). Quelle est la distance de F au sommet ${asked === 0 ? "A" : "A′"} (arrondie au centième) ?`, answer: num(r2(asked === 0 ? A : A2), 0.01), hints: H("A = bar{(F, 1), (K, e)} donne FA = e/(1 + e) FK.", "A′ = bar{(F, 1), (K, −e)} donne FA′ = e/(1 − e) FK en mesure algébrique.", `FK = ${d}, e = ${fr(e)}.`, "Calcule la longueur."), solution: asked === 0 ? `FA = ${fr(e)}/(1 + ${fr(e)}) × ${d} ≈ ${fr(r2(A))}.` : `FA′ = ${fr(e)}/|1 − ${fr(e)}| × ${d} ≈ ${fr(r2(A2))}.` };
  }, FR),
  mk("co-parabole-equation", CO, 2, { skill: "Équation réduite d'une parabole y² = 2px (p = distance du foyer à la directrice)", ref: `${BOOK}, chap. 7 §1.2, équation réduite d'une parabole (p. 150) et ex. 1.a, 1.c (p. 153)`, kw: ["parabole", "y² = 2px", "paramètre", "foyer", "directrice", "sommet"] }, (_c, r) => {
    const p = int(r, 1, 10), ask = int(r, 0, 2);
    if (ask === 0) return { statement: `Une parabole a pour foyer F et pour directrice (𝒟) avec d(F, 𝒟) = ${p}. Dans le repère (S, i, j) avec i = SF/SF (S sommet), elle a pour équation y² = 2px. Quelle est la valeur de 2p ?`, answer: num(2 * p), hints: H("Le paramètre p est la distance du foyer à la directrice.", `p = ${p}.`, "L'équation est y² = 2px.", "Calcule 2p."), solution: `y² = 2 × ${p} x = ${2 * p}x.` };
    if (ask === 1) return { statement: `Dans un repère orthonormé, la parabole d'équation y² = ${2 * p}x a pour sommet O. Quelle est l'abscisse de son foyer ?`, answer: num(p / 2, 0.001), hints: H("Pour y² = 2ax, le foyer est F(a/2 ; 0).", `2a = ${2 * p}, donc a = ${p}.`, "Divise a par 2.", "Calcule."), solution: `F(${fr(p / 2)} ; 0).` };
    return { statement: `Dans un repère orthonormé, la parabole d'équation y² = ${2 * p}x a pour directrice (𝒟) : x = c. Quelle est la valeur de c ?`, answer: num(-p / 2, 0.001), hints: H("Pour y² = 2ax, la directrice est x = −a/2.", `a = ${p}.`, "Calcule −a/2.", "Lis la valeur."), solution: `(𝒟) : x = ${n2(-p / 2)}.` };
  }, FR),
  mk("co-parabole-elements", CO, 2, { skill: "Éléments d'une parabole d'équation y² = 2ax ou x² = 2ay (foyer, directrice, paramètre)", ref: `${BOOK}, chap. 7 §2.1, éléments caractéristiques de la parabole (p. 154) et ex. 1.e (p. 153)`, kw: ["parabole", "foyer", "directrice", "paramètre |a|", "axe focal", "y² = 2ax"] }, (_c, r) => {
    const a = nz(r, -8, 8), horiz = int(r, 0, 1) === 0, ask = int(r, 0, 2);
    const eq = horiz ? `y² = ${n2(2 * a)}x` : `x² = ${n2(2 * a)}y`;
    return { statement: `Dans un repère orthonormé, la parabole (𝒫) a pour équation ${eq}. ${ask === 0 ? "Quel est son paramètre p ?" : ask === 1 ? `Quelle est ${horiz ? "l'abscisse" : "l'ordonnée"} de son foyer (arrondie au centième) ?` : "Quelle est la valeur de c dans l'équation de sa directrice " + (horiz ? "x" : "y") + " = c (arrondie au centième) ?"}`, answer: num(ask === 0 ? Math.abs(a) : ask === 1 ? r2(a / 2) : r2(-a / 2), 0.01), hints: H("Pour y² = 2ax ou x² = 2ay : paramètre |a|, foyer à a/2 du sommet, directrice à −a/2.", `2a = ${n2(2 * a)}, donc a = ${n2(a)}.`, "Le foyer a pour coordonnée a/2 sur l'axe focal.", "La directrice a pour équation x = −a/2 (ou y = −a/2)."), solution: `a = ${n2(a)} : paramètre ${Math.abs(a)}, foyer ${horiz ? `(${fr(r2(a / 2))} ; 0)` : `(0 ; ${fr(r2(a / 2))})`}, directrice ${horiz ? "x" : "y"} = ${n2(r2(-a / 2))}.` };
  }, FR),
  mk("co-parabole-tangente", CO, 3, { skill: "Tangente en un point d'une parabole : yy₀ = a(x + x₀)", ref: `${BOOK}, chap. 7 §2.1, équation de la tangente (p. 155) et ex. 2.a, 2.c (p. 156)`, kw: ["tangente", "parabole", "yy₀ = a(x + x₀)", "point de la parabole", "équation de tangente"] }, (_c, r) => {
    const a = nz(r, -4, 4), t = nz(r, -3, 3), Y = 2 * t * a, X = (Y * Y) / (2 * a);
    return { statement: `Dans un repère orthonormé, M₀(${n2(X)} ; ${n2(Y)}) appartient à la parabole d'équation y² = ${n2(2 * a)}x. La tangente en M₀ a pour équation yy₀ = a(x + x₀). Quel est son coefficient directeur (arrondi au centième) ?`, answer: num(r2(a / Y), 0.01), hints: H("Remplace a, x₀ et y₀ dans yy₀ = a(x + x₀).", `${n2(Y)}y = ${n2(a)}(x + ${par(X)}).`, "Isole y : le coefficient de x est a/y₀.", "Calcule."), solution: `y = (${n2(a)}/${n2(Y)})(x + ${par(X)}) : coefficient directeur ${fr(r2(a / Y))}.` };
  }, FR),
  mk("co-parabole-regionnement", CO, 2, { skill: "Position d'un point par rapport à une parabole (intérieur, extérieur, sur la courbe)", ref: `${BOOK}, chap. 7 §1.1 (p. 149) et §2.1, régionnement (p. 155)`, kw: ["intérieur", "extérieur", "régionnement du plan", "y² < 2ax", "MF < MH"] }, (_c, r) => {
    const a = int(r, 1, 6), x = int(r, -3, 8), y = int(r, -8, 8), v = y * y - 2 * a * x, pos = v < 0 ? 0 : v > 0 ? 1 : 2;
    return { statement: `Dans un repère orthonormé, (𝒫) est la parabole d'équation y² = ${2 * a}x. Où se trouve le point M(${n2(x)} ; ${n2(y)}) ?`, answer: choice(r, ["À l'intérieur de (𝒫)", "À l'extérieur de (𝒫)", "Sur (𝒫)"], pos), hints: H("M est intérieur à (𝒫) si MF < MH, c'est-à-dire y² < 2ax.", "M est extérieur si y² > 2ax.", `y² = ${y * y} et 2ax = ${2 * a * x}.`, "Compare."), solution: `y² = ${y * y} ${v < 0 ? "<" : v > 0 ? ">" : "="} ${2 * a * x} = 2ax : M est ${["à l'intérieur de", "à l'extérieur de", "sur"][pos]} (𝒫).` };
  }, QCM),
  mk("co-ellipse-parametres", CO, 2, { skill: "Ellipse x²/a² + y²/b² = 1 : c = √(a² − b²), excentricité, foyers, sommets", ref: `${BOOK}, chap. 7 §1.2, ellipse (p. 151-152) et ex. 1.f (p. 153) et §3.1, éléments caractéristiques (p. 158)`, kw: ["ellipse", "demi-distance focale", "excentricité e = c/a", "foyers", "sommets", "a² − b²"] }, (_c, r) => {
    const tr = pick(r, [[5, 3, 4], [13, 5, 12], [10, 6, 8], [5, 4, 3], [17, 8, 15], [10, 8, 6], [25, 7, 24], [13, 12, 5]]), [a, b, c] = tr, ask = int(r, 0, 2);
    return { statement: `Dans un repère orthonormé, l'ellipse (ℰ) a pour équation x²/${a * a} + y²/${b * b} = 1. ${ask === 0 ? "Quelle est la demi-distance focale c ?" : ask === 1 ? "Quelle est son excentricité (arrondie au centième) ?" : "Quelle est l'abscisse positive de ses foyers ?"}`, answer: num(ask === 1 ? r2(c / a) : c, 0.01), hints: H("Pour x²/a² + y²/b² = 1 avec a > b, c² = a² − b².", `a² = ${a * a}, b² = ${b * b}.`, ask === 1 ? "e = c/a." : "c = √(a² − b²).", "Calcule."), solution: `c = √(${a * a} − ${b * b}) = ${c} ; e = c/a = ${c}/${a} ≈ ${fr(r2(c / a))} ; foyers (±${c} ; 0).` };
  }, FR),
  mk("co-ellipse-directrice", CO, 3, { skill: "Directrices d'une ellipse : x = ±a²/c", ref: `${BOOK}, chap. 7 §1.2, ellipse (p. 151-152) et §3.1, éléments caractéristiques (p. 158)`, kw: ["directrices", "ellipse", "a²/c", "foyer", "excentricité"] }, (_c, r) => {
    const [a, b, c] = pick(r, [[5, 3, 4], [13, 5, 12], [10, 6, 8], [5, 4, 3], [25, 7, 24], [13, 12, 5], [10, 8, 6]]);
    return { statement: `L'ellipse d'équation x²/${a * a} + y²/${b * b} = 1 a pour foyer F(${c} ; 0). Quelle est l'abscisse de la directrice associée à F (arrondie au centième) ?`, answer: num(r2((a * a) / c), 0.01), hints: H("La directrice associée au foyer F(c ; 0) a pour équation x = a²/c.", `a² = ${a * a} et c = ${c}.`, `${a * a} ÷ ${c}.`, "Calcule."), solution: `x = a²/c = ${a * a}/${c} ≈ ${fr(r2((a * a) / c))}.` };
  }, FR),
  mk("co-ellipse-bifocale", CO, 2, { skill: "Définition bifocale de l'ellipse : MF + MF′ = 2a", ref: `${BOOK}, chap. 7 §3.2, définition bifocale (p. 160-161) et ex. 3.d (p. 161)`, kw: ["définition bifocale", "MF + MF′ = 2a", "ellipse", "foyers", "méthode du jardinier"] }, (_c, r) => {
    const a = int(r, 3, 12), c = int(r, 1, a - 1), t = int(r, 0, 2);
    if (t === 0) return { statement: `Un point M de l'ellipse (ℰ) de foyers F et F′ vérifie MF = ${a - 1} et MF′ = ${a + 1} (MF + MF′ = ${2 * a}). Quel est le demi-grand axe a ?`, answer: num(a), hints: H("L'ellipse est l'ensemble des points tels que MF + MF′ = 2a.", `MF + MF′ = ${a - 1} + ${a + 1}.`, "Divise par 2.", "Calcule."), solution: `2a = ${2 * a}, donc a = ${a}.` };
    if (t === 1) { const b = Math.sqrt(a * a - c * c); return { statement: `Une ellipse a pour foyers F et F′ avec FF′ = ${2 * c} et est l'ensemble des points M tels que MF + MF′ = ${2 * a}. Quel est le carré b² du demi-petit axe (arrondi au centième) ?`, answer: num(r2(a * a - c * c), 0.01), hints: H("FF′ = 2c et MF + MF′ = 2a.", `c = ${c}, a = ${a}.`, "b² = a² − c².", "Calcule."), solution: `b² = ${a * a} − ${c * c} = ${a * a - c * c} (b ≈ ${fr(r2(b))}).` }; }
    const d1 = int(r, 1, 2 * a - 1); return { statement: `Une ellipse a pour foyers F, F′ et MF + MF′ = ${2 * a} pour tout point M de l'ellipse. Si un point M a pour distance ${d1} à F, quelle est sa distance à F′ ?`, answer: num(2 * a - d1), hints: H("MF + MF′ = 2a.", `MF′ = 2a − MF.`, `${2 * a} − ${d1}.`, "Calcule."), solution: `MF′ = ${2 * a} − ${d1} = ${2 * a - d1}.` };
  }, FR),
  mk("co-ellipse-tangente", CO, 3, { skill: "Tangente en un point d'une ellipse : xx₀/a² + yy₀/b² = 1", ref: `${BOOK}, chap. 7 §3.1, tangente à l'ellipse (p. 159) et ex. 3.a (p. 161)`, kw: ["tangente", "ellipse", "xx₀/a² + yy₀/b² = 1", "point de contact"] }, (_c, r) => {
    const P: [number, number, number, number][] = [[3, 0, 9, 4], [0, 2, 9, 4], [4, 3, 25, 9], [-3, 4, 25, 16], [5, 0, 25, 9], [0, -3, 25, 9], [-4, -3, 25, 9], [3, -4, 25, 16]];
    const [px, py, pa, pb] = pick(r, P), cx = px / pa, cy = py / pb, wantX = int(r, 0, 1) === 0;
    return { statement: `Dans un repère orthonormé, le point M₀(${n2(px)} ; ${n2(py)}) appartient à l'ellipse d'équation x²/${pa} + y²/${pb} = 1. Sa tangente en M₀ a pour équation αx + βy = 1. Quelle est la valeur de ${wantX ? "α" : "β"} (arrondie au centième) ?`, answer: num(r2(wantX ? cx : cy), 0.01), hints: H("La tangente en M₀(x₀ ; y₀) a pour équation xx₀/a² + yy₀/b² = 1.", `x₀/a² = ${n2(px)}/${pa} et y₀/b² = ${n2(py)}/${pb}.`, "Identifie α et β.", "Calcule."), solution: `α = ${n2(px)}/${pa} ≈ ${fr(r2(cx))} ; β = ${n2(py)}/${pb} ≈ ${fr(r2(cy))}.` };
  }, FR),
  mk("co-hyperbole-elements", CO, 2, { skill: "Hyperbole x²/a² − y²/b² = 1 : c = √(a² + b²), excentricité, asymptotes, directrices", ref: `${BOOK}, chap. 7 §1.2, hyperbole (p. 152) et §4.1, éléments caractéristiques (p. 164) et ex. 1.f (p. 153)`, kw: ["hyperbole", "asymptotes", "y = ±(b/a)x", "c = √(a² + b²)", "excentricité", "foyers", "directrices"] }, (_c, r) => {
    const [a, b, c] = pick(r, [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17], [15, 8, 17]]), ask = int(r, 0, 3);
    return { statement: `Dans un repère orthonormé, l'hyperbole (ℋ) a pour équation x²/${a * a} − y²/${b * b} = 1. ${ask === 0 ? "Quelle est la demi-distance focale c ?" : ask === 1 ? "Quelle est son excentricité (arrondie au centième) ?" : ask === 2 ? "Quel est le coefficient directeur positif de ses asymptotes (arrondi au centième) ?" : "Quelle est l'abscisse positive de sa directrice associée au foyer de coordonnées positives (arrondie au centième) ?"}`, answer: num(ask === 0 ? c : ask === 1 ? r2(c / a) : ask === 2 ? r2(b / a) : r2((a * a) / c), 0.01), hints: H("Pour x²/a² − y²/b² = 1, c² = a² + b².", `a² = ${a * a}, b² = ${b * b}.`, ask === 0 ? "c = √(a² + b²)." : ask === 1 ? "e = c/a." : ask === 2 ? "Les asymptotes sont y = ±(b/a)x." : "Les directrices sont x = ±a²/c.", "Calcule."), solution: `c = √(${a * a} + ${b * b}) = ${c} ; e = ${c}/${a} ≈ ${fr(r2(c / a))} ; asymptotes y = ±${fr(r2(b / a))}x ; directrices x = ±${fr(r2((a * a) / c))}.` };
  }, FR),
  mk("co-hyperbole-bifocale", CO, 2, { skill: "Définition bifocale de l'hyperbole : |MF − MF′| = 2a", ref: `${BOOK}, chap. 7 §4.2, définition bifocale (p. 165-166) et ex. 4.a (p. 166)`, kw: ["définition bifocale", "|MF − MF′| = 2a", "hyperbole", "foyers"] }, (_c, r) => {
    const a = int(r, 2, 8), d1 = int(r, a + 1, a + 9), s = int(r, 0, 1) === 0;
    return { statement: `Un point M de l'hyperbole de foyers F et F′ vérifie |MF − MF′| = ${2 * a}. Si MF = ${d1}, quelle est la valeur de MF′ ${s ? "(la plus grande)" : "(la plus petite)"} ?`, answer: num(s ? d1 + 2 * a : Math.abs(d1 - 2 * a)), hints: H("Sur l'hyperbole, |MF − MF′| = 2a.", `MF′ = MF ± ${2 * a}.`, s ? "Prends le signe +." : "Prends le signe − (la distance reste positive).", "Calcule."), solution: s ? `MF′ = ${d1} + ${2 * a} = ${d1 + 2 * a}.` : `MF′ = |${d1} − ${2 * a}| = ${Math.abs(d1 - 2 * a)}.` };
  }, FR),
  mk("co-hyperbole-tangente", CO, 3, { skill: "Tangente en un point d'une hyperbole : xx₀/a² − yy₀/b² = 1", ref: `${BOOK}, chap. 7 §4.1, tangente à l'hyperbole (p. 164)`, kw: ["tangente", "hyperbole", "xx₀/a² − yy₀/b² = 1", "point de contact"] }, (_c, r) => {
    const P: [number, number, number, number][] = [[3, 0, 9, 4], [-3, 0, 9, 4], [5, 0, 25, 9], [-5, 0, 25, 16], [2, 0, 4, 1], [-2, 0, 4, 9]];
    const [x0, y0, a2, b2] = pick(r, P), al = x0 / a2, be = -y0 / b2;
    return { statement: `Dans un repère orthonormé, M₀(${n2(x0)} ; ${n2(y0)}) appartient à l'hyperbole d'équation x²/${a2} − y²/${b2} = 1. Sa tangente en M₀ a pour équation αx + βy = 1. Quelle est la valeur de α (arrondie au centième) ?`, answer: num(r2(al), 0.01), hints: H("La tangente en M₀(x₀ ; y₀) a pour équation xx₀/a² − yy₀/b² = 1.", `Le coefficient de x est x₀/a² = ${n2(x0)}/${a2}.`, "C'est α.", "Calcule."), solution: `α = ${n2(x0)}/${a2} ≈ ${fr(r2(al))} ; β = −${n2(y0)}/${b2} = ${fr(r2(be))}.` };
  }, FR),
  mk("co-nature-equation", CO, 3, { skill: "Nature de la courbe Ax² + By² + 2Cx + 2Dy + E = 0 : parabole, ellipse, hyperbole, cercle", ref: `${BOOK}, chap. 7 §1.3, courbes d'équations Ax² + By² + 2Cx + 2Dy + E = 0 (p. 152-153) et ex. 1.g (p. 153)`, kw: ["Ax² + By² + 2Cx + 2Dy + E = 0", "nature", "forme canonique", "ellipse", "hyperbole", "parabole", "centre"] }, (_c, r) => {
    const t = int(r, 0, 3), h = int(r, -3, 3), k = int(r, -3, 3), a = int(r, 1, 3), b = int(r, 1, 3);
    const OPT = ["Une parabole", "Une ellipse", "Une hyperbole", "Un cercle"];
    if (t === 0) { const p = int(r, 1, 3); return { statement: `Quelle est la nature de la courbe d'équation ${sqx("y", k)} = ${4 * p}${h === 0 ? "x" : `(x ${h > 0 ? "−" : "+"} ${Math.abs(h)})`} ?`, answer: choice(r, OPT, 0), hints: H("Un seul des deux carrés apparaît.", "C'est de la forme Y² = 2pX avec X = x − h et Y = y − k.", "Une parabole a une équation Y² = 2pX.", "Parabole."), solution: `Y² = ${4 * p}X : parabole de sommet (${n2(h)} ; ${n2(k)}).` }; }
    if (t === 1) return { statement: `Quelle est la nature de la courbe d'équation ${sqx("x", h)}/${a * a + 1} + ${sqx("y", k)}/${b * b + 4} = 1 ?`, answer: choice(r, OPT, 1), hints: H("Les deux carrés sont positifs et additionnés.", "Les dénominateurs sont distincts : ce n'est pas un cercle.", "La forme est X²/a² + Y²/b² = 1.", "Ellipse."), solution: `Ellipse de centre (${n2(h)} ; ${n2(k)}).` };
    if (t === 2) return { statement: `Quelle est la nature de la courbe d'équation ${sqx("x", h)}/${a * a} − ${sqx("y", k)}/${b * b} = 1 ?`, answer: choice(r, OPT, 2), hints: H("Les deux carrés sont de signes opposés.", "La forme est X²/a² − Y²/b² = 1.", `Le centre est (${n2(h)} ; ${n2(k)}).`, "Hyperbole."), solution: `Hyperbole de centre (${n2(h)} ; ${n2(k)}).` };
    const R = int(r, 1, 6); return { statement: `Quelle est la nature de la courbe d'équation ${sqx("x", h)} + ${sqx("y", k)} = ${R * R} ?`, answer: choice(r, OPT, 3), hints: H("Les deux carrés ont le même coefficient.", "(x − h)² + (y − k)² = R² est un cercle.", `R² = ${R * R}.`, "Cercle."), solution: `Cercle de centre (${n2(h)} ; ${n2(k)}) et de rayon ${R}.` };
  }, QCM),
  mk("co-centre-translation", CO, 3, { skill: "Centre d'une conique à centre : mise sous forme canonique", ref: `${BOOK}, chap. 7 §1.3 (p. 152-153) et ex. 1.g (p. 153)`, kw: ["centre d'une ellipse", "forme canonique", "complétion du carré", "translation du repère"] }, (_c, r) => {
    const h = nz(r, -4, 4), k = nz(r, -4, 4), A = int(r, 1, 3), B = A + int(r, 1, 2), wantX = int(r, 0, 1) === 0;
    const C = -A * h, D = -B * k, E0 = A * h * h + B * k * k - 1;
    const sx = (c: number, v: string) => (c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${Math.abs(2 * c)}${v}`);
    return { statement: `La courbe d'équation ${A === 1 ? "" : A}x² + ${B}y²${sx(C, "x")}${sx(D, "y")}${tail(E0)} = 0 est une ellipse. Quelle est ${wantX ? "l'abscisse" : "l'ordonnée"} de son centre ?`, answer: num(wantX ? h : k), hints: H("On met chaque variable sous forme canonique.", `${A}x² ${C < 0 ? "−" : "+"} ${Math.abs(2 * C)}x = ${A}[(x ${-h < 0 ? "−" : "+"} ${Math.abs(h)})² − ${h * h}].`, "Fais de même pour y.", "Le centre est (h ; k)."), solution: `On obtient ${A}(x ${-h < 0 ? "−" : "+"} ${Math.abs(h)})² + ${B}(y ${-k < 0 ? "−" : "+"} ${Math.abs(k)})² = 1 : centre (${n2(h)} ; ${n2(k)}).` };
  }, FR),
  mk("co-cours", CO, 1, { skill: "Coniques : questions de cours", ref: `${BOOK}, chap. 7 §1 à §4 (p. 148-166)`, kw: ["conique", "foyer", "directrice", "excentricité", "ellipse", "hyperbole", "parabole", "asymptotes"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quel est l'axe focal d'une conique ?", good: "La droite passant par le foyer F et perpendiculaire à la directrice", bad: ["La directrice", "La tangente au sommet", "La droite (FM) pour un point M quelconque"], why: "Propriété 1, p. 149." },
      { q: "Une conique d'excentricité e ≠ 1 coupe son axe focal en…", good: "deux points distincts (les sommets)", bad: ["un seul point", "aucun point", "une infinité de points"], why: "Propriété 2, p. 149." },
      { q: "Une parabole coupe son axe focal en…", good: "un seul point : son sommet", bad: ["deux points", "aucun point", "trois points"], why: "Propriété 2, p. 149." },
      { q: "M est intérieur à une conique de foyer F, directrice (𝒟), excentricité e lorsque…", good: "MF < e MH", bad: ["MF > e MH", "MF = e MH", "MF = MH toujours"], why: "Définition, p. 149." },
      { q: "Quelle est l'équation réduite d'une parabole de paramètre p ?", good: "y² = 2px", bad: ["y = 2px", "y² = px²", "x² + y² = 2p"], why: "Propriété, p. 150." },
      { q: "Que représente le paramètre p d'une parabole ?", good: "La distance du foyer à la directrice", bad: ["La distance du foyer au sommet", "L'excentricité", "La longueur de l'axe focal"], why: "p. 150." },
      { q: "Quelle est l'équation réduite d'une ellipse (a > b > 0) ?", good: "x²/a² + y²/b² = 1", bad: ["x²/a² − y²/b² = 1", "x²/a + y²/b = 1", "x²/a² + y²/b² = 0"], why: "p. 152." },
      { q: "Pour une ellipse, la relation entre a, b et c est…", good: "b² = a² − c²", bad: ["b² = a² + c²", "c² = a² + b²", "b = a − c"], why: "p. 152." },
      { q: "Pour une hyperbole x²/a² − y²/b² = 1, la relation entre a, b et c est…", good: "c² = a² + b²", bad: ["c² = a² − b²", "c = a + b", "b² = a² + c²"], why: "p. 152." },
      { q: "Quelles sont les asymptotes de l'hyperbole x²/a² − y²/b² = 1 ?", good: "y = (b/a)x et y = −(b/a)x", bad: ["y = (a/b)x et y = −(a/b)x", "x = ±a", "y = ±b"], why: "p. 164." },
      { q: "L'ellipse est l'ensemble des points M tels que…", good: "MF + MF′ = 2a (avec FF′ = 2c < 2a)", bad: ["|MF − MF′| = 2a", "MF = MF′", "MF × MF′ = a²"], why: "Définition bifocale, p. 161." },
      { q: "L'hyperbole est l'ensemble des points M tels que…", good: "|MF − MF′| = 2a (avec FF′ = 2c > 2a)", bad: ["MF + MF′ = 2a", "MF = MF′", "MF/MF′ = a"], why: "Définition bifocale, p. 166." },
      { q: "Quel est le centre de symétrie d'une conique à centre ?", good: "Le milieu du segment [AA′] des deux sommets de l'axe focal", bad: ["Le foyer", "Le sommet A", "Le point K de la directrice"], why: "Conséquences, p. 151." },
      { q: "La tangente à la parabole y² = 2ax en M₀(x₀ ; y₀) a pour équation…", good: "yy₀ = a(x + x₀)", bad: ["yy₀ = 2a(x − x₀)", "y = a x₀", "y − y₀ = x − x₀"], why: "Propriété, p. 155." },
    ];
    return qcmOf(r, pool, "Reviens à la définition de la conique.");
  }, QCM),
];
