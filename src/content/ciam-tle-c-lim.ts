// CIAM Terminale SM (série C) : chapitre 9, Limites et continuité. Énoncés originaux, réponses calculées par le code.
// Les démonstrations et les tracés du manuel ne se corrigent pas automatiquement : on en garde les calculs
// (limites, asymptotes, continuité, image d'un intervalle, racines et puissances) et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf, sup } from "./ciam-kit";

const mk = ciam("tle", "ciamtl");
const BOOK = "CIAM Terminale SM";
const LC = "Limites et continuité — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
/** Polynôme en x, coefficients du plus haut degré au plus bas. */
const pol = (c: number[]) => {
  const n = c.length - 1;
  let s = "";
  c.forEach((a, i) => {
    const e = n - i;
    if (a === 0) return;
    const ab = Math.abs(a), body = e === 0 ? fr(ab) : `${ab === 1 ? "" : fr(ab)}x${e > 1 ? sup(e) : ""}`;
    s += s === "" ? `${a < 0 ? "−" : ""}${body}` : ` ${a < 0 ? "−" : "+"} ${body}`;
  });
  return s || "0";
};
const INF = ["+∞", "−∞", "0", "un réel non nul"];

export const TC_LIM: Template[] = [
  mk("li-polynome-infini", LC, 1, { skill: "Limite d'un polynôme en ±∞ : celle de son terme de plus haut degré", ref: `${BOOK}, chap. 9 §1, limites de référence et opérations (p. 194-197) et ex. 1.a-1.c (p. 198)`, kw: ["limite en l'infini", "polynôme", "terme de plus haut degré", "limite de référence"] }, (_c, r) => {
    const n = int(r, 2, 4), a = nz(r, -4, 4), co = [a, ...Array.from({ length: n }, () => int(r, -5, 5))], plus = int(r, 0, 1) === 0;
    const pos = plus ? a > 0 : (a > 0) === (n % 2 === 0);
    return { statement: `Quelle est la limite de f(x) = ${pol(co)} quand x tend vers ${plus ? "+∞" : "−∞"} ?`, answer: choice(r, INF, pos ? 0 : 1), hints: H("En l'infini, un polynôme a la même limite que son terme de plus haut degré.", `Ce terme est ${pol([a, ...Array(n).fill(0)])}.`, `x${sup(n)} tend vers +∞ ${plus ? "" : n % 2 === 0 ? "(exposant pair)" : "en changeant de signe (exposant impair)"}.`, "Applique le signe de a."), solution: `Le terme dominant ${pol([a, ...Array(n).fill(0)])} tend vers ${pos ? "+∞" : "−∞"}.` };
  }, QCM),
  mk("li-rationnelle-degres", LC, 2, { skill: "Limite d'une fonction rationnelle en ±∞ : comparaison des degrés", ref: `${BOOK}, chap. 9 §1, fonctions rationnelles (p. 195-196) et ex. 1.d (p. 198)`, kw: ["fonction rationnelle", "limite en l'infini", "degré du numérateur", "terme de plus haut degré"] }, (_c, r) => {
    const p = int(r, 1, 3), q = int(r, 1, 3), a = nz(r, -5, 5), b = nz(r, -5, 5), plus = int(r, 0, 1) === 0;
    const N = [a, ...Array.from({ length: p }, () => int(r, -4, 4))], D = [b, ...Array.from({ length: q }, () => int(r, -4, 4))];
    let ans: number, sol: string;
    if (p < q) { ans = 2; sol = "Le degré du dénominateur est supérieur : la limite est 0."; }
    else if (p === q) { ans = 3; sol = `Les degrés sont égaux : la limite est ${n2(a)}/${par(b)} = ${n2(r2(a / b))}, un réel non nul.`; }
    else {
      const neg = (a * b < 0) !== (!plus && (p - q) % 2 === 1);
      ans = neg ? 1 : 0; sol = `Le quotient des termes dominants est ${n2(a / b)}x${p - q > 1 ? sup(p - q) : ""} qui tend vers ${neg ? "−∞" : "+∞"}.`;
    }
    return { statement: `Quelle est la limite de f(x) = (${pol(N)}) / (${pol(D)}) quand x tend vers ${plus ? "+∞" : "−∞"} ?`, answer: choice(r, INF, ans), hints: H("En l'infini, on garde les termes de plus haut degré.", `Numérateur de degré ${p}, dénominateur de degré ${q}.`, "Compare les degrés.", "Conclus."), solution: sol };
  }, QCM),
  mk("li-rationnelle-egale", LC, 2, { skill: "Limite en l'infini d'un quotient de polynômes de même degré : quotient des coefficients dominants", ref: `${BOOK}, chap. 9 §1, fonctions rationnelles (p. 195-196) et ex. 1.d (p. 198)`, kw: ["limite en l'infini", "quotient des coefficients dominants", "fonction rationnelle", "asymptote horizontale"] }, (_c, r) => {
    const p = int(r, 1, 3), a = nz(r, -6, 6), b = nz(r, -6, 6);
    const N = [a, ...Array.from({ length: p }, () => int(r, -5, 5))], D = [b, ...Array.from({ length: p }, () => int(r, -5, 5))];
    return { statement: `Quelle est la limite en +∞ de f(x) = (${pol(N)}) / (${pol(D)}) (arrondie au centième) ?`, answer: num(r2(a / b), 0.01), hints: H("Numérateur et dénominateur ont le même degré.", "La limite est celle du quotient des termes de plus haut degré.", `${n2(a)}x${p > 1 ? sup(p) : ""} / ${par(b)}x${p > 1 ? sup(p) : ""} = ${n2(a)}/${par(b)}.`, "Calcule."), solution: `La limite est ${n2(a)}/${par(b)} ≈ ${n2(r2(a / b))}.` };
  }, FR),
  mk("li-cote-pole", LC, 2, { skill: "Limite à droite ou à gauche en un réel où le dénominateur s'annule (signe)", ref: `${BOOK}, chap. 9 §1, limites en un réel (p. 194-195) et ex. 1.e (p. 198)`, kw: ["limite à droite", "limite à gauche", "signe du dénominateur", "x₀", "1/(x − x₀)"] }, (_c, r) => {
    const k = nz(r, -5, 5), x0 = int(r, -4, 4), e = int(r, 1, 2), droite = int(r, 0, 1) === 0;
    const den = `(x ${x0 < 0 ? "+" : "−"} ${Math.abs(x0)})`.replace("(x − 0)", "x");
    const ds = `${x0 === 0 ? "x" : den}${e === 2 ? "²" : ""}`;
    const positive = e === 2 ? true : droite;
    const pos = (k > 0) === positive;
    return { statement: `Quelle est la limite de f(x) = ${k}/${ds.replace(/^x²$/, "x²")} quand x tend vers ${n2(x0)} ${e === 2 ? "" : droite ? "par valeurs supérieures" : "par valeurs inférieures"} ?`.replace("  ", " "), answer: choice(r, ["+∞", "−∞", "0", "un réel non nul"], pos ? 0 : 1), hints: H("Le dénominateur tend vers 0 : étudie son signe près de x₀.", e === 2 ? "Un carré est positif." : droite ? "x > x₀ donc x − x₀ > 0." : "x < x₀ donc x − x₀ < 0.", `Le numérateur vaut ${n2(k)}, du signe de ${k > 0 ? "+" : "−"}.`, "Applique la règle des signes."), solution: `Le dénominateur tend vers 0 par valeurs ${positive ? "positives" : "négatives"} et ${n2(k)} est ${k > 0 ? "positif" : "négatif"} : la limite est ${pos ? "+∞" : "−∞"}.` };
  }, QCM),
  mk("li-conjugue", LC, 3, { skill: "Forme indéterminée ∞ − ∞ avec un radical : multiplier par la quantité conjuguée", ref: `${BOOK}, chap. 9 §1, travaux dirigés sur les radicaux (p. 197) et ex. 1.f (p. 198), ex. 13 (p. 210)`, kw: ["quantité conjuguée", "forme indéterminée", "∞ − ∞", "radical", "√(x² + px + q) − x"] }, (_c, r) => {
    const p = nz(r, -8, 8), q = int(r, -4, 4);
    return { statement: `Quelle est la limite en +∞ de f(x) = √(${pol([1, p, q])}) − x (arrondie au centième) ?`, answer: num(r2(p / 2), 0.01), hints: H("C'est une forme indéterminée ∞ − ∞ : multiplie par la quantité conjuguée √(…) + x.", `Le numérateur devient ${pol([1, p, q])} − x² = ${pol([p, q])}.`, `Divise par x : le quotient tend vers ${n2(p)}/(1 + 1).`, "Calcule."), solution: `f(x) = (${pol([p, q])}) / (√(${pol([1, p, q])}) + x), de limite ${n2(p)}/2 = ${n2(r2(p / 2))}.` };
  }, FR),
  mk("li-composee", LC, 3, { skill: "Limite d'une composée : racine d'un quotient de fonctions affines", ref: `${BOOK}, chap. 9 §1, limite d'une fonction composée (p. 196) et ex. 1.d (p. 198)`, kw: ["fonction composée", "limite d'une composée", "racine carrée", "quotient"] }, (_c, r) => {
    const c = int(r, 1, 3), k = int(r, 1, 4), a = c * k * k, b = int(r, -5, 5), d = int(r, 1, 6);
    return { statement: `Quelle est la limite en +∞ de f(x) = √((${pol([a, b])}) / (${pol([c, d])})) ?`, answer: num(k), hints: H("Détermine d'abord la limite de la fonction à l'intérieur de la racine.", `(${pol([a, b])}) / (${pol([c, d])}) tend vers ${a}/${c} = ${k * k}.`, "Compose ensuite avec la racine carrée, continue en k².", "Calcule."), solution: `Le quotient tend vers ${k * k}, donc f tend vers √${k * k} = ${k}.` };
  }, FR),
  mk("li-encadrement", LC, 3, { skill: "Théorème d'encadrement : limite de (ax + b sin x)/(x + c)", ref: `${BOOK}, chap. 9 §1, théorèmes de comparaison et d'encadrement (p. 196-197) et ex. 1.c (p. 198)`, kw: ["encadrement", "théorème des gendarmes", "sin x", "comparaison", "|sin x| ≤ 1"] }, (_c, r) => {
    const a = nz(r, -5, 5), b = nz(r, -4, 4), c = int(r, 1, 6), cos = int(r, 0, 1) === 0, fn = cos ? "cos x" : "sin x";
    const bt = `${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : fr(Math.abs(b))}${fn}`;
    return { statement: `Quelle est la limite en +∞ de f(x) = (${pol([a, 0])} ${bt}) / (x + ${c}) ?`, answer: num(a), hints: H("Divise le numérateur et le dénominateur par x.", `|${fn}| ≤ 1 donc ${fn}/x tend vers 0 par encadrement.`, "Le terme (x + c)/x tend vers 1.", "Conclus."), solution: `Après division par x, f(x) = (${n2(a)} + ${n2(b)}·${fn}/x) / (1 + ${c}/x) tend vers ${n2(a)}.` };
  }, FR),
  mk("li-asymptote-horizontale", LC, 2, { skill: "Asymptote horizontale y = l d'une fonction homographique", ref: `${BOOK}, chap. 9 §2, asymptote horizontale (p. 199-200) et ex. 2.a (p. 201)`, kw: ["asymptote horizontale", "y = l", "limite finie en l'infini", "fonction homographique"] }, (_c, r) => {
    const c = nz(r, -4, 4), a = nz(r, -8, 8), b = int(r, -6, 6), d = nz(r, -6, 6);
    return { statement: `La courbe de f(x) = (${pol([a, b])}) / (${pol([c, d])}) admet une asymptote horizontale d'équation y = l en +∞. Quelle est la valeur de l (arrondie au centième) ?`, answer: num(r2(a / c), 0.01), hints: H("l est la limite de f en +∞.", "Compare les termes de plus haut degré.", `l = ${n2(a)}/${par(c)}.`, "Calcule."), solution: `l = ${n2(a)}/${par(c)} ≈ ${n2(r2(a / c))}.` };
  }, FR),
  mk("li-asymptote-verticale", LC, 2, { skill: "Asymptote verticale x = x₀ : valeur qui annule le dénominateur", ref: `${BOOK}, chap. 9 §2, asymptote verticale (p. 199) et ex. 2.b (p. 201)`, kw: ["asymptote verticale", "x = x₀", "dénominateur nul", "limite infinie"] }, (_c, r) => {
    const x0 = nz(r, -6, 6), c = nz(r, -3, 3), a = nz(r, -5, 5), b = int(r, -6, 6);
    if (a * x0 + b === 0) return { statement: `La courbe de f(x) = 1/(x ${x0 < 0 ? "+" : "−"} ${Math.abs(x0)}) admet une asymptote verticale x = x₀. Quelle est la valeur de x₀ ?`, answer: num(x0), hints: H("Cherche la valeur interdite.", "Le dénominateur s'annule en x₀.", `x ${x0 < 0 ? "+" : "−"} ${Math.abs(x0)} = 0.`, "Résous."), solution: `x₀ = ${n2(x0)}.` };
    return { statement: `La courbe de f(x) = (${pol([a, b])}) / (${pol([c, -c * x0])}) admet une asymptote verticale d'équation x = x₀. Quelle est la valeur de x₀ ?`, answer: num(x0), hints: H("Cherche la valeur qui annule le dénominateur sans annuler le numérateur.", `${pol([c, -c * x0])} = 0.`, `Le numérateur ne s'annule pas en x₀ : ${a}×${par(x0)} + ${par(b)} ≠ 0.`, "Résous."), solution: `${pol([c, -c * x0])} = 0 donne x₀ = ${n2(x0)}, et le numérateur y vaut ${a * x0 + b} ≠ 0.` };
  }, FR),
  mk("li-asymptote-oblique", LC, 3, { skill: "Asymptote oblique y = mx + p : division euclidienne de (ax² + bx + c)/(x − x₀)", ref: `${BOOK}, chap. 9 §2, asymptote oblique (p. 200-202) et ex. 2.c (p. 202), ex. 16-17 (p. 211)`, kw: ["asymptote oblique", "y = ax + b", "division", "f(x) − (ax + b) tend vers 0"] }, (_c, r) => {
    const m = nz(r, -3, 3), x0 = nz(r, -3, 3), u = int(r, -5, 5), v = int(r, -6, 6), ask = int(r, 0, 1);
    const p = u + m * x0, rest = v + x0 * p;
    return { statement: `Soit f(x) = (${pol([m, u, v])}) / (x ${x0 < 0 ? "+" : "−"} ${Math.abs(x0)}). La courbe admet en +∞ une asymptote oblique d'équation y = ax + b. Quelle est la valeur de ${ask === 0 ? "a" : "b"} ?`, answer: num(ask === 0 ? m : p), hints: H("Effectue la division de ax² + bx + c par x − x₀.", `Le quotient commence par ${n2(m)}x.`, `${pol([m, u, v])} = (x ${x0 < 0 ? "+" : "−"} ${Math.abs(x0)})(${pol([m, p])}) + ${n2(rest)}.`, "Le reste divisé par x − x₀ tend vers 0."), solution: `f(x) = ${pol([m, p])} + ${n2(rest)}/(x ${x0 < 0 ? "+" : "−"} ${Math.abs(x0)}) : l'asymptote est y = ${pol([m, p])}.` };
  }, FR),
  mk("li-branche-parabolique", LC, 3, { skill: "Branches infinies : limite de f(x)/x et direction asymptotique", ref: `${BOOK}, chap. 9 §2, branches infinies (p. 202-203) et ex. 2.d (p. 203), ex. 14-15 (p. 211)`, kw: ["branche parabolique", "direction asymptotique", "f(x)/x", "branche infinie"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Si f(x)/x tend vers +∞ quand x tend vers +∞, la courbe admet…", good: "une branche parabolique de direction (Oy)", bad: ["une branche parabolique de direction (Ox)", "une asymptote oblique", "une asymptote horizontale"], why: "Cas f(x)/x → ±∞ du cours." },
      { q: "Si f(x) tend vers +∞ et f(x)/x tend vers 0 quand x tend vers +∞, la courbe admet…", good: "une branche parabolique de direction (Ox)", bad: ["une branche parabolique de direction (Oy)", "une asymptote verticale", "une asymptote oblique"], why: "Cas f(x)/x → 0 du cours." },
      { q: "Si f(x)/x tend vers a ≠ 0 et f(x) − ax tend vers b, la courbe admet…", good: "l'asymptote oblique y = ax + b", bad: ["une branche parabolique de direction (Ox)", "une asymptote verticale", "une branche parabolique de direction (Oy)"], why: "Définition de l'asymptote oblique." },
      { q: "Si f(x)/x tend vers a ≠ 0 et f(x) − ax tend vers +∞, la courbe admet…", good: "une branche parabolique de direction la droite y = ax", bad: ["l'asymptote oblique y = ax", "une asymptote horizontale", "une branche parabolique de direction (Oy)"], why: "Cas a fini non nul, f(x) − ax infini." },
      { q: "La courbe de x ↦ x² admet en +∞…", good: "une branche parabolique de direction (Oy)", bad: ["une asymptote oblique", "une branche parabolique de direction (Ox)", "une asymptote horizontale"], why: "x²/x = x tend vers +∞." },
      { q: "La courbe de x ↦ √x admet en +∞…", good: "une branche parabolique de direction (Ox)", bad: ["une branche parabolique de direction (Oy)", "une asymptote oblique", "une asymptote verticale"], why: "√x/x = 1/√x tend vers 0." },
    ];
    return qcmOf(r, T, "Étudie la limite de f(x)/x.");
  }, QCM),
  mk("li-continuite-raccord", LC, 3, { skill: "Continuité en x₀ d'une fonction définie par morceaux : valeur de raccord", ref: `${BOOK}, chap. 9 §3, continuité en un point (p. 203-204) et ex. 22 (p. 211)`, kw: ["continuité en un point", "fonction définie par morceaux", "limite à gauche", "limite à droite", "f(x₀)"] }, (_c, r) => {
    const c = nz(r, -4, 4), kind = int(r, 0, 1);
    if (kind === 0) {
      const m = 2 * c;
      return { statement: `f est définie par f(x) = (x² − ${c * c}) / (x ${c < 0 ? "+" : "−"} ${Math.abs(c)}) si x ≠ ${n2(c)}, et f(${n2(c)}) = m. Quelle valeur de m rend f continue en ${n2(c)} ?`, answer: num(m), hints: H("f est continue en x₀ si sa limite en x₀ est f(x₀).", `Factorise : x² − ${c * c} = (x − ${par(c)})(x + ${par(c)}).`, "Simplifie par x − x₀.", "Calcule la limite."), solution: `Pour x ≠ ${n2(c)}, f(x) = x ${c < 0 ? "−" : "+"} ${Math.abs(c)}, de limite ${n2(m)} : m = ${n2(m)}.` };
    }
    const a = nz(r, -3, 3), b = int(r, -4, 4), d = nz(r, -3, 3), x0 = int(r, -2, 2), m = a * x0 + b - d * x0;
    return { statement: `f(x) = ${pol([a, b])} si x ≤ ${n2(x0)} et f(x) = ${pol([d])}${d === 0 ? "" : ""} + m si x > ${n2(x0)}. Quelle valeur de m rend f continue en ${n2(x0)} ?`.replace(`${pol([d])} + m`, `${pol([d, 0])} + m`), answer: num(m), hints: H("f est continue en x₀ si les limites à gauche et à droite sont égales à f(x₀).", `À gauche : ${a}×${par(x0)} + ${par(b)} = ${a * x0 + b}.`, `À droite : ${d}×${par(x0)} + m.`, "Égalise."), solution: `${a * x0 + b} = ${d * x0} + m donc m = ${n2(m)}.` };
  }, FR),
  mk("li-valeurs-intermediaires", LC, 2, { skill: "Théorème des valeurs intermédiaires : nombre de solutions de f(x) = k pour f continue strictement monotone", ref: `${BOOK}, chap. 9 §3, théorème des valeurs intermédiaires et bijection (p. 205-206) et ex. 3.c (p. 209) et ex. 25 (p. 211)`, kw: ["théorème des valeurs intermédiaires", "continue strictement monotone", "bijection", "f(x) = k", "nombre de solutions"] }, (_c, r) => {
    const a = int(r, -4, 2), b = a + int(r, 2, 5), fa = int(r, -9, 4), fb = fa + int(r, 3, 12), up = int(r, 0, 1) === 0;
    const lo = fa, hi = fb, y0 = up ? fa : fb, y1 = up ? fb : fa;
    const k = int(r, lo - 4, hi + 4), has = k >= lo && k <= hi;
    return { statement: `f est continue et strictement ${up ? "croissante" : "décroissante"} sur [${n2(a)} ; ${n2(b)}], avec f(${n2(a)}) = ${n2(y0)} et f(${n2(b)}) = ${n2(y1)}. Combien de solutions l'équation f(x) = ${n2(k)} admet-elle dans [${n2(a)} ; ${n2(b)}] ?`, answer: num(has ? 1 : 0), hints: H("L'image de [a ; b] est l'intervalle fermé d'extrémités f(a) et f(b).", `Ici l'image est [${n2(lo)} ; ${n2(hi)}].`, `${n2(k)} appartient-il à cet intervalle ?`, "Si oui, il y a une unique solution, sinon aucune."), solution: `L'image est [${n2(lo)} ; ${n2(hi)}] et ${n2(k)} ${has ? "y appartient : une solution unique" : "n'y appartient pas : aucune solution"}.` };
  }, FR),
  mk("li-image-intervalle", LC, 3, { skill: "Image d'un intervalle par une fonction continue strictement monotone, avec limites aux bornes", ref: `${BOOK}, chap. 9 §3, image d'un intervalle (tableau, p. 206) et ex. 3.b (p. 209) et ex. 24 (p. 211)`, kw: ["image d'un intervalle", "continue strictement monotone", "limite aux bornes", "tableau de variation"] }, (_c, r) => {
    const c = nz(r, -3, 3), x0 = int(r, -3, 3), a = nz(r, -6, 6), b = int(r, -6, 6);
    if (a * x0 + b === 0) return { statement: `f(x) = 1/x sur ]0 ; +∞[ est continue et strictement décroissante. Quelle est la borne finie de l'intervalle image f(]0 ; +∞[) ?`, answer: num(0), hints: H("Calcule les limites aux bornes.", "En 0 par valeurs supérieures, f tend vers +∞.", "En +∞, f tend vers 0.", "L'image est ]0 ; +∞[."), solution: "f(]0 ; +∞[) = ]0 ; +∞[ : la borne finie est 0." };
    return { statement: `f(x) = (${pol([a, b])}) / (${pol([c, -c * x0])}) est continue et strictement monotone sur ]${n2(x0)} ; +∞[. Son image est un intervalle ouvert dont une borne est finie : quelle est-elle (arrondie au centième) ?`, answer: num(r2(a / c), 0.01), hints: H("Les bornes de l'image sont les limites aux bornes de l'intervalle.", `En x₀ = ${n2(x0)}, f tend vers ±∞.`, "En +∞, f tend vers le quotient des coefficients dominants.", "Calcule."), solution: `En +∞, f tend vers ${n2(a)}/${par(c)} ≈ ${n2(r2(a / c))} : c'est la borne finie.` };
  }, FR),
  mk("li-racine-nieme", LC, 2, { skill: "Racine n-ième d'un réel : ⁿ√x pour x ≥ 0 (et n impair pour x < 0)", ref: `${BOOK}, chap. 9 §3, fonction racine n-ième (p. 207) et ex. 30 (p. 211)`, kw: ["racine n-ième", "ⁿ√x", "bijection réciproque", "x ↦ xⁿ"] }, (_c, r) => {
    const n = int(r, 2, 5), v = int(r, 1, 4), odd = n % 2 === 1, neg = odd && int(r, 0, 1) === 0, x = (neg ? -1 : 1) * v ** n;
    const nm = n === 2 ? "√" : n === 3 ? "∛" : n === 4 ? "⁴√" : "⁵√";
    return { statement: `Calcule ${nm}${neg ? `(${n2(x)})` : n2(x)}.`, answer: num(neg ? -v : v), hints: H("La racine n-ième est la bijection réciproque de x ↦ xⁿ.", `Cherche un nombre dont la puissance ${n} vaut ${n2(x)}.`, `${v}${sup(n)} = ${v ** n}.`, neg ? "n est impair : on peut prendre l'opposé." : "Le résultat est positif."), solution: `${nm}${neg ? `(${n2(x)})` : n2(x)} = ${n2(neg ? -v : v)}.` };
  }, FR),
  mk("li-puissance-rationnelle", LC, 3, { skill: "Puissance rationnelle : x^(p/q) = (ᵠ√x)^p", ref: `${BOOK}, chap. 9 §3, puissances rationnelles (p. 207-208) et ex. 30 (p. 211)`, kw: ["puissance rationnelle", "x^(p/q)", "racine q-ième", "exposant rationnel"] }, (_c, r) => {
    const B: [number, number][] = [[8, 3], [27, 3], [16, 4], [81, 4], [4, 2], [9, 2], [25, 2], [32, 5], [64, 3], [125, 3]];
    const [x, q] = pick(r, B), root = Math.round(x ** (1 / q)), p = int(r, 1, 3), minus = int(r, 0, 1) === 0, val = root ** p;
    return { statement: `Calcule ${x}^(${minus ? "−" : ""}${p}/${q}) (arrondi au centième).`, answer: num(r2(minus ? 1 / val : val), 0.01), hints: H("x^(p/q) = (ᵠ√x)^p.", `La racine ${q}-ième de ${x} est ${root}.`, `${root}^${p} = ${val}.`, minus ? "L'exposant est négatif : prends l'inverse." : "Calcule."), solution: `${x}^(${minus ? "−" : ""}${p}/${q}) = ${minus ? `1/${val}` : val} ≈ ${n2(r2(minus ? 1 / val : val))}.` };
  }, FR),
  mk("li-trigonometrie", LC, 2, { skill: "Limites en 0 : sin(ax)/(bx), tan(ax)/(bx) et (1 − cos ax)/x²", ref: `${BOOK}, chap. 9, limites usuelles de sin x/x et (1 − cos x)/x² (cours p. 193-194) et ex. 2, 3, 6, 11 (p. 210)`, kw: ["sin x / x", "tan x / x", "(1 − cos x)/x²", "limite en 0", "limite usuelle"] }, (_c, r) => {
    const a = nz(r, -5, 5), b = nz(r, 1, 5), t = int(r, 0, 2);
    const ax = `${a === 1 ? "" : a === -1 ? "−" : a}x`, bx = `${b === 1 ? "" : b}x`;
    if (t === 2) return { statement: `Quelle est la limite en 0 de f(x) = (1 − cos(${ax})) / (${bx})² (arrondie au centième) ?`, answer: num(r2((a * a) / (2 * b * b)), 0.01), hints: H("Utilise lim (1 − cos u)/u² = 1/2 quand u tend vers 0.", `Écris (1 − cos(${ax}))/(${bx})² = [(1 − cos(${ax}))/(${ax})²] × (${ax})²/(${bx})².`, `Le second facteur vaut ${a * a}/${b * b}.`, "Multiplie par 1/2."), solution: `La limite est (1/2) × ${a * a}/${b * b} ≈ ${n2(r2((a * a) / (2 * b * b)))}.` };
    const fn = t === 0 ? "sin" : "tan";
    return { statement: `Quelle est la limite en 0 de f(x) = ${fn}(${ax}) / (${bx}) (arrondie au centième) ?`, answer: num(r2(a / b), 0.01), hints: H(`Utilise lim ${fn}(u)/u = 1 quand u tend vers 0.`, `Écris ${fn}(${ax})/(${bx}) = [${fn}(${ax})/(${ax})] × (${ax})/(${bx}).`, `Le second facteur vaut ${n2(a)}/${b}.`, "Multiplie."), solution: `La limite est 1 × ${n2(a)}/${b} ≈ ${n2(r2(a / b))}.` };
  }, FR),
  mk("li-prolongement", LC, 3, { skill: "Prolongement par continuité en 0 : valeur de f(0)", ref: `${BOOK}, chap. 9 §3, continuité et prolongement (p. 203-205) et ex. 18, 22, 23 (p. 211)`, kw: ["prolongement par continuité", "f(0) = a", "limite en 0", "sin x / x"] }, (_c, r) => {
    const a = nz(r, -5, 5), t = int(r, 0, 1);
    if (t === 0) { const p = nz(r, -6, 6); return { statement: `f(x) = (x² ${p < 0 ? "−" : "+"} ${Math.abs(p)}x)/x pour x ≠ 0. Quelle valeur de f(0) prolonge f par continuité en 0 ?`, answer: num(p), hints: H("Cherche la limite de f en 0.", "Simplifie par x pour x ≠ 0.", `f(x) = x ${p < 0 ? "−" : "+"} ${Math.abs(p)}.`, "Calcule en x = 0."), solution: `Pour x ≠ 0, f(x) = x ${p < 0 ? "−" : "+"} ${Math.abs(p)}, de limite ${n2(p)} : f(0) = ${n2(p)}.` }; }
    return { statement: `f(x) = sin(${a === 1 ? "" : a === -1 ? "−" : a}x) / x pour x ≠ 0. Quelle valeur de f(0) prolonge f par continuité en 0 ?`, answer: num(a), hints: H("Cherche la limite de f en 0.", "Utilise lim sin(u)/u = 1.", `sin(${n2(a)}x)/x = ${n2(a)} × sin(${n2(a)}x)/(${n2(a)}x).`, "Conclus."), solution: `La limite en 0 vaut ${n2(a)} : f(0) = ${n2(a)}.` };
  }, FR),
  mk("li-dichotomie", LC, 2, { skill: "Résolution approchée par dichotomie : choix de la moitié et incertitude", ref: `${BOOK}, chap. 9 §3.4, travaux dirigés « Résolution approchée d'une équation » (p. 208-209) et ex. 3.d (p. 209), ex. 25-26 (p. 211)`, kw: ["dichotomie", "balayage", "valeur approchée", "milieu", "amplitude de l'intervalle"] }, (_c, r) => {
    if (int(r, 0, 1) === 0) {
      const k = pick(r, [2, 3, 5, 6, 7, 10]), a = 1, b = 4, m = (a + b) / 2, left = m * m > k;
      return { statement: `On cherche par dichotomie la solution positive de x² = ${k} dans [${a} ; ${b}]. On pose f(x) = x² − ${k}. Le milieu est ${fr(m)}. La solution se trouve dans [${a} ; ${fr(m)}] ou dans [${fr(m)} ; ${b}] : réponds 1 pour la première moitié, 2 pour la seconde.`, answer: num(left ? 1 : 2), hints: H("Calcule f(milieu).", `f(${fr(m)}) = ${fr(m * m - k)}.`, "f est croissante sur [1 ; 4] : si f(milieu) > 0, la solution est à gauche.", "Conclus."), solution: `f(${fr(m)}) = ${fr(m * m - k)} ${left ? "> 0 : la solution est dans la première moitié" : "< 0 : la solution est dans la seconde moitié"}.` };
    }
    const amp = pick(r, [1, 2, 0.5, 4]), eps = pick(r, [0.1, 0.01, 0.001]);
    let n = 0; while (amp / 2 ** n > eps) n++;
    return { statement: `On applique la dichotomie à un intervalle initial d'amplitude ${fr(amp)}. Après n étapes l'amplitude est ${fr(amp)}/2ⁿ. Quel est le plus petit entier n tel que l'amplitude soit inférieure ou égale à ${fr(eps)} ?`, answer: num(n), hints: H("À chaque étape, l'amplitude est divisée par 2.", `Cherche n tel que ${fr(amp)}/2ⁿ ≤ ${fr(eps)}.`, `Teste les puissances de 2 : 2⁵ = 32, 2⁷ = 128, 2¹⁰ = 1 024.`, "Prends le plus petit entier qui convient."), solution: `Pour n = ${n}, ${fr(amp)}/${2 ** n} ≈ ${fr(Math.round((amp / 2 ** n) * 1e5) / 1e5)} ≤ ${fr(eps)}, et n − 1 ne convient pas.` };
  }, FR),
  mk("li-cours", LC, 1, { skill: "Cours : limites de référence, continuité et théorème des valeurs intermédiaires", ref: `${BOOK}, chap. 9 « Limites et continuité », cours (pp. 193-211)`, kw: ["limites de référence", "continuité", "théorème des valeurs intermédiaires", "fonction continue", "composée"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Quelle est la limite en +∞ de 1/x ?", good: "0", bad: ["+∞", "1", "−∞"], why: "Limite de référence." },
      { q: "Quelle est la limite en 0 par valeurs supérieures de 1/x ?", good: "+∞", bad: ["0", "−∞", "1"], why: "Limite de référence." },
      { q: "Quelle est la limite en 0 par valeurs inférieures de 1/x ?", good: "−∞", bad: ["+∞", "0", "1"], why: "Limite de référence." },
      { q: "Une fonction polynôme est…", good: "continue sur ℝ", bad: ["continue seulement sur ℝ*", "discontinue en 0", "continue sur ℝ sauf en ses racines"], why: "Propriété du cours." },
      { q: "Une fonction rationnelle est continue…", good: "sur tout intervalle inclus dans son ensemble de définition", bad: ["sur ℝ", "seulement en 0", "uniquement là où son numérateur s'annule"], why: "Propriété du cours." },
      { q: "Si f est continue sur [a ; b] et f(a)×f(b) < 0, alors…", good: "f s'annule au moins une fois dans ]a ; b[", bad: ["f est strictement monotone", "f s'annule exactement une fois", "f est positive"], why: "Corollaire du théorème des valeurs intermédiaires." },
      { q: "Si f est continue sur I et si f(x) est du type forme indéterminée, peut-on conclure directement ?", good: "Non, il faut lever l'indétermination", bad: ["Oui, la limite est 0", "Oui, la limite est +∞", "Oui, la limite est 1"], why: "Une forme indéterminée se transforme avant de conclure." },
      { q: "Si f est continue et strictement monotone sur un intervalle I, alors f réalise…", good: "une bijection de I sur f(I)", bad: ["une bijection de I sur ℝ", "une fonction paire", "une fonction constante"], why: "Théorème de la bijection." },
      { q: "Si u(x) → l et g est continue en l, alors g(u(x)) tend vers…", good: "g(l)", bad: ["l", "g(x)", "0"], why: "Limite d'une composée." },
    ];
    return qcmOf(r, T, "Reviens aux limites de référence et aux théorèmes du cours.");
  }, QCM),
];
