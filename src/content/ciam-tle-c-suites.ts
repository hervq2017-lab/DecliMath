// CIAM Terminale SM (série C) : chapitre 13, Suites numériques. Énoncés originaux, réponses calculées par le code.
// Les démonstrations par récurrence et les constructions graphiques du manuel ne se corrigent pas automatiquement :
// on en garde les calculs (monotonie, bornes, sommes, limites, point fixe, contraction, Newton) et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf, sup } from "./ciam-kit";

const mk = ciam("tle", "ciamtu");
const BOOK = "CIAM Terminale SM";
const SU = "Suites numériques — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
const INF = ["+∞", "−∞", "0", "un réel non nul"];
const sgn = (a: number, t: string) => `${a < 0 ? "−" : "+"} ${Math.abs(a) === 1 ? "" : Math.abs(a)}${t}`;

export const TC_SUITES: Template[] = [
  mk("su-bornes", SU, 2, { skill: "Suite bornée : encadrer uₙ = a + b cos n ou a + b sin n par deux nombres réels", ref: `${BOOK}, chap. 13 §1.1, suites bornées (p. 276-277) et ex. 1.b (p. 279)`, kw: ["suite minorée", "suite majorée", "suite bornée", "minorant", "majorant", "|cos n| ≤ 1"] }, (_c, r) => {
    const a = int(r, -5, 5), b = nz(r, -4, 4), fn = pick(r, ["cos n", "sin n"]), lo = int(r, 0, 1) === 0;
    return { statement: `Soit uₙ = ${a} ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : `${Math.abs(b)} `}${fn}. Quel est le meilleur ${lo ? "minorant" : "majorant"} entier de la suite déduit de l'encadrement −1 ≤ ${fn} ≤ 1 ?`, answer: num(lo ? a - Math.abs(b) : a + Math.abs(b)), hints: H(`On a −1 ≤ ${fn} ≤ 1.`, `Multiplie par ${n2(b)}${b < 0 ? " (le sens change)" : ""}.`, `Ajoute ${n2(a)}.`, lo ? "Prends la borne inférieure." : "Prends la borne supérieure."), solution: `${n2(a - Math.abs(b))} ≤ uₙ ≤ ${n2(a + Math.abs(b))}.` };
  }, FR),
  mk("su-monotonie-homographique", SU, 2, { skill: "Sens de variation de uₙ = (an + b)/(n + c) par le signe de uₙ₊₁ − uₙ", ref: `${BOOK}, chap. 13 §1.2, suites monotones (p. 277-278) et ex. 1.d (p. 279)`, kw: ["suite croissante", "suite décroissante", "uₙ₊₁ − uₙ", "sens de variation", "monotone"] }, (_c, r) => {
    const a = nz(r, -4, 4), b = int(r, -6, 6), c = int(r, 1, 5), d = a * c - b;
    if (d === 0) return { statement: "Soit uₙ = (2n + 1)/(n + 3). Réponds 1 si la suite est croissante, 2 si elle est décroissante.", answer: num(1), hints: H("Calcule uₙ₊₁ − uₙ.", "On trouve 5/((n + 4)(n + 3)).", "Ce nombre est strictement positif.", "La suite est croissante."), solution: "uₙ₊₁ − uₙ > 0 : croissante." };
    return { statement: `Soit uₙ = (${a === 1 ? "" : a === -1 ? "−" : a}n ${b < 0 ? "−" : "+"} ${Math.abs(b)}) / (n + ${c}). Réponds 1 si la suite est croissante, 2 si elle est décroissante.`, answer: num(d > 0 ? 1 : 2), hints: H("Calcule uₙ₊₁ − uₙ.", `uₙ₊₁ − uₙ = ${n2(d)} / ((n + ${c + 1})(n + ${c})).`, "Le dénominateur est positif.", "Le signe est celui de ac − b."), solution: `uₙ₊₁ − uₙ = ${n2(d)}/((n + ${c + 1})(n + ${c})), de signe ${d > 0 ? "positif : croissante" : "négatif : décroissante"}.` };
  }, FR),
  mk("su-monotonie-rang", SU, 3, { skill: "Monotonie à partir d'un certain rang : wₙ = ln n + k/√n croissante pour n ≥ k²/4", ref: `${BOOK}, chap. 13 §1.2, exemple de wₙ = ln n + 4/√n (p. 277)`, kw: ["à partir d'un certain rang", "suite croissante", "fonction associée", "dérivée", "ln n + k/√n"] }, (_c, r) => {
    const k = int(r, 3, 12), v = Math.ceil((k * k) / 4);
    return { statement: `Soit wₙ = ln n + ${k}/√n, associée à f(x) = ln x + ${k}/√x. On a f′(x) = (2√x − ${k}) / (2x√x). À partir de quel plus petit entier n₀ la suite est-elle croissante ?`, answer: num(v), hints: H("f est croissante lorsque f′(x) ≥ 0.", `2√x − ${k} ≥ 0 équivaut à √x ≥ ${fr(k / 2)}.`, `Donc x ≥ ${fr((k * k) / 4)}.`, "Prends le plus petit entier."), solution: `x ≥ ${fr((k * k) / 4)} : n₀ = ${v}.` };
  }, FR),
  mk("su-arithmetique-somme", SU, 1, { skill: "Suite arithmétique : terme uₙ = u₀ + nr et somme des N premiers termes N/2 (u₀ + u_{N−1})", ref: `${BOOK}, chap. 13 §1.3, tableau récapitulatif (p. 278) et ex. 1.g (p. 279)`, kw: ["suite arithmétique", "raison r", "uₙ = u₀ + nr", "somme des n premiers termes", "N/2 (u₀ + u_{N−1})"] }, (_c, r) => {
    const u0 = int(r, -6, 6), q = nz(r, -4, 4), N = int(r, 5, 20), S = (N * (2 * u0 + (N - 1) * q)) / 2;
    return { statement: `(uₙ) est la suite arithmétique de premier terme u₀ = ${n2(u0)} et de raison ${n2(q)}. Quelle est la somme S = u₀ + u₁ + … + u${N - 1} des ${N} premiers termes ?`, answer: num(S), hints: H("S = N/2 × (premier terme + dernier terme).", `u${N - 1} = ${n2(u0)} + ${N - 1} × ${par(q)} = ${n2(u0 + (N - 1) * q)}.`, `S = ${N}/2 × (${n2(u0)} + ${par(u0 + (N - 1) * q)}).`, "Calcule."), solution: `S = ${N}/2 × (${n2(u0)} + ${par(u0 + (N - 1) * q)}) = ${n2(S)}.` };
  }, FR),
  mk("su-geometrique-somme", SU, 2, { skill: "Suite géométrique : somme des n premiers termes u₀(1 − qⁿ)/(1 − q)", ref: `${BOOK}, chap. 13 §1.3, tableau récapitulatif (p. 278) et ex. 1.h (p. 279)`, kw: ["suite géométrique", "raison q", "u₀(1 − qⁿ)/(1 − q)", "somme", "q ≠ 1"] }, (_c, r) => {
    const u0 = nz(r, -6, 6), q = pick(r, [2, 3, -2, 0.5]), N = int(r, 3, 8), S = (u0 * (1 - q ** N)) / (1 - q);
    return { statement: `(uₙ) est la suite géométrique de premier terme u₀ = ${n2(u0)} et de raison ${n2(q)}. Quelle est la somme des ${N} premiers termes (arrondie au centième) ?`, answer: num(r2(S), 0.01), hints: H("S = u₀ × (1 − qⁿ)/(1 − q).", `Ici n = ${N}.`, `q${sup(N)} = ${fr(q ** N)}.`, "Calcule."), solution: `S = ${n2(u0)} × (1 − ${par(q ** N)})/(1 − ${par(q)}) ≈ ${n2(r2(S))}.` };
  }, FR),
  mk("su-sommes-classiques", SU, 2, { skill: "Sommes Σk, Σk², Σk³ : n(n + 1)/2, n(n + 1)(2n + 1)/6, n²(n + 1)²/4", ref: `${BOOK}, chap. 13 §1.3, exemples d'utilisation (p. 278) et ex. 1.g (p. 279)`, kw: ["somme des carrés", "somme des cubes", "n(n + 1)(2n + 1)/6", "n²(n + 1)²/4", "Σ k²"] }, (_c, r) => {
    const n = int(r, 3, 12), p = int(r, 1, 3), v = p === 1 ? (n * (n + 1)) / 2 : p === 2 ? (n * (n + 1) * (2 * n + 1)) / 6 : (n * n * (n + 1) ** 2) / 4;
    return { statement: `Calcule S = 1${p === 1 ? "" : sup(p)} + 2${p === 1 ? "" : sup(p)} + … + ${n}${p === 1 ? "" : sup(p)}.`, answer: num(v), hints: H(p === 1 ? "Σk = n(n + 1)/2." : p === 2 ? "Σk² = n(n + 1)(2n + 1)/6." : "Σk³ = n²(n + 1)²/4.", `Ici n = ${n}.`, "Remplace n.", "Calcule."), solution: `S = ${v}.` };
  }, FR),
  mk("su-recurrence-terme", SU, 1, { skill: "Calcul des premiers termes d'une suite définie par récurrence uₙ₊₁ = a uₙ + b", ref: `${BOOK}, chap. 13 §1, suites définies par une formule de récurrence (p. 275-276) et ex. 1.a (p. 279)`, kw: ["formule de récurrence", "premiers termes", "uₙ₊₁ = f(uₙ)", "calcul de termes"] }, (_c, r) => {
    const u0 = int(r, -3, 3), a = nz(r, -3, 3), b = int(r, -4, 4), k = int(r, 2, 5);
    let u = u0; for (let i = 0; i < k; i++) u = a * u + b;
    return { statement: `(uₙ) est définie par u₀ = ${n2(u0)} et uₙ₊₁ = ${a === 1 ? "" : a === -1 ? "−" : a}uₙ ${b < 0 ? "−" : "+"} ${Math.abs(b)}. Quelle est la valeur de u${k} ?`, answer: num(u), hints: H("Calcule les termes un à un.", `u₁ = ${n2(a * u0 + b)}.`, "Continue jusqu'au rang demandé.", "Vérifie ton dernier calcul."), solution: `On trouve u${k} = ${n2(u)}.` };
  }, FR),
  mk("su-limite-fonction", SU, 2, { skill: "Limite de uₙ = f(n) : mêmes limites en +∞ que la fonction f", ref: `${BOOK}, chap. 13 §2.2, limite d'une suite du type uₙ = f(n) (p. 281) et ex. 2.a (p. 285)`, kw: ["limite d'une suite", "uₙ = f(n)", "lim uₙ = lim f(x)", "suite convergente"] }, (_c, r) => {
    const a = nz(r, -4, 4), b = int(r, -5, 5), d = nz(r, 1, 4), e = int(r, 0, 4), t = int(r, 0, 1);
    if (t === 0) return { statement: `Quelle est la limite de la suite uₙ = n sin(${a}/n) ?`, answer: num(a), hints: H("Pose x = 1/n qui tend vers 0.", `uₙ = sin(${n2(a)}x)/x.`, `lim sin(u)/u = 1 donne ${n2(a)}.`, "Conclus."), solution: `La limite vaut ${n2(a)}.` };
    return { statement: `Quelle est la limite de la suite uₙ = (${a === 1 ? "" : a === -1 ? "−" : a}n² ${b < 0 ? "−" : "+"} ${Math.abs(b)}) / (${d}n + ${e})² (arrondie au centième) ?`, answer: num(r2(a / (d * d)), 0.01), hints: H("Compare les degrés : numérateur et dénominateur sont de degré 2.", `Le dénominateur vaut ${d * d}n² + …`, `Le quotient des termes dominants est ${n2(a)}/${d * d}.`, "Calcule."), solution: `La limite est ${n2(a)}/${d * d} ≈ ${n2(r2(a / (d * d)))}.` };
  }, FR),
  mk("su-croissances-comparees", SU, 2, { skill: "Limites de aⁿ, nᵅ, ln n : tableau et croissances comparées", ref: `${BOOK}, chap. 13 §2.2, croissances comparées des suites (aⁿ), (nᵅ) et (ln n) (p. 282-283)`, kw: ["suite géométrique", "limite de aⁿ", "nᵅ", "ln n", "croissances comparées"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Si −1 < a < 1, la suite (aⁿ) a pour limite…", good: "0", bad: ["1", "+∞", "elle n'a pas de limite"], why: "Tableau p. 282." },
      { q: "Si a > 1, la suite (aⁿ) a pour limite…", good: "+∞", bad: ["0", "1", "elle n'a pas de limite"], why: "Tableau p. 282." },
      { q: "Si a ≤ −1, la suite (aⁿ)…", good: "n'a pas de limite", bad: ["tend vers 0", "tend vers −∞", "tend vers 1"], why: "Tableau p. 282." },
      { q: "Si α < 0, la suite (nᵅ) a pour limite…", good: "0", bad: ["+∞", "1", "−∞"], why: "Tableau p. 282." },
      { q: "La limite de (ln n)/n² est…", good: "0", bad: ["+∞", "1", "−∞"], why: "Propriété (1)." },
      { q: "La limite de n²/2ⁿ est…", good: "0", bad: ["+∞", "1", "2"], why: "Propriété (2) : aⁿ l'emporte sur nᵅ pour a > 1." },
      { q: "La limite de n³ − 2ⁿ⁺² est…", good: "−∞", bad: ["+∞", "0", "1"], why: "2ⁿ(n³/2ⁿ − 4) avec n³/2ⁿ → 0." },
      { q: "La limite de √n / ln n est…", good: "+∞", bad: ["0", "1", "−∞"], why: "Propriété (1) : nᵅ l'emporte sur ln n." },
    ];
    return qcmOf(r, T, "Rappelle-toi qui l'emporte : aⁿ, nᵅ ou ln n.");
  }, QCM),
  mk("su-quotient-geometrique", SU, 3, { skill: "Limite de (p·aⁿ − q·bⁿ)/(p′·aⁿ + q′·bⁿ) : factoriser par le terme dominant", ref: `${BOOK}, chap. 13 §2.2, exemple uₙ = (3ⁿ − 2ⁿ)/(3ⁿ + 2ⁿ) (p. 283) et ex. 2.c (p. 285)`, kw: ["limite d'un quotient", "suite géométrique", "terme dominant", "(2/3)ⁿ → 0"] }, (_c, r) => {
    const a = int(r, 3, 6), b = int(r, 2, a - 1), p = nz(r, -4, 4), q = nz(r, -4, 4), p2 = nz(r, -4, 4), q2 = nz(r, -4, 4);
    return { statement: `Quelle est la limite de la suite uₙ = (${p}·${a}ⁿ ${q < 0 ? "−" : "+"} ${Math.abs(q)}·${b}ⁿ) / (${p2}·${a}ⁿ ${q2 < 0 ? "−" : "+"} ${Math.abs(q2)}·${b}ⁿ) (arrondie au centième) ?`, answer: num(r2(p / p2), 0.01), hints: H(`Factorise par ${a}ⁿ, le terme dominant.`, `(${b}/${a})ⁿ tend vers 0 car 0 < ${b}/${a} < 1.`, `Il reste ${n2(p)}/${par(p2)}.`, "Calcule."), solution: `La limite est ${n2(p)}/${par(p2)} ≈ ${n2(r2(p / p2))}.` };
  }, FR),
  mk("su-comparaison", SU, 3, { skill: "Théorèmes de comparaison et des gendarmes pour les suites", ref: `${BOOK}, chap. 13 §2.2, propriétés de comparaison 1 et 2 (p. 283-284) et ex. 2.d (p. 285)`, kw: ["théorème des gendarmes", "comparaison", "uₙ ≥ vₙ", "encadrement", "limite infinie"] }, (_c, r) => {
    const a = nz(r, -4, 4), t = int(r, 0, 2);
    if (t === 0) return { statement: `Quelle est la limite de uₙ = ${a === 1 ? "" : a === -1 ? "−" : a}n + sin n ?`, answer: choice(r, ["+∞", "−∞", "0", "un réel non nul"], a > 0 ? 0 : 1), hints: H("−1 ≤ sin n ≤ 1.", `uₙ est comparée à ${n2(a)}n ${a > 0 ? "− 1" : "+ 1"}.`, `${n2(a)}n tend vers ${a > 0 ? "+∞" : "−∞"}.`, "Applique le théorème de comparaison."), solution: `uₙ ${a > 0 ? `≥ ${a === 1 ? "" : a}n − 1` : `≤ ${a === -1 ? "−" : n2(a)}n + 1`} : limite ${a > 0 ? "+∞" : "−∞"}.` };
    if (t === 1) return { statement: `Quelle est la limite de uₙ = (${a === 1 ? "" : a === -1 ? "−" : a}n + cos n)/(n + 1) (arrondie au centième) ?`, answer: num(a), hints: H("Divise par n.", "cos n/n tend vers 0 par encadrement.", "(n + 1)/n tend vers 1.", "Conclus."), solution: `La limite est ${n2(a)}.` };
    return { statement: `Quelle est la limite de uₙ = ${a === 1 ? "" : a === -1 ? "−" : a}cos(n)/n ?`, answer: num(0), hints: H("|cos n| ≤ 1.", `|uₙ| ≤ ${Math.abs(a)}/n.`, "Le majorant tend vers 0.", "Théorème des gendarmes."), solution: `|uₙ| ≤ ${Math.abs(a)}/n tend vers 0 : la limite est 0.` };
  }, FR),
  mk("su-limite-puissance-e", SU, 3, { skill: "Image d'une suite par une fonction : lim (1 + a/n)ⁿ = eᵃ", ref: `${BOOK}, chap. 13 §2.2, image d'une suite par une fonction, exemple (1 + 1/n)ⁿ → e (p. 284)`, kw: ["image d'une suite par une fonction", "(1 + 1/n)ⁿ", "e", "ln(1 + x)/x", "eⁿˡⁿ"] }, (_c, r) => {
    const a = nz(r, -3, 3);
    return { statement: `Quelle est la limite de la suite uₙ = (1 + ${n2(a)}/n)ⁿ (arrondie au centième) ?`, answer: num(r2(Math.exp(a)), 0.01), hints: H("Écris uₙ = e^(n ln(1 + a/n)).", `n ln(1 + ${n2(a)}/n) = ${n2(a)} × ln(1 + x)/x avec x = ${n2(a)}/n.`, `lim ln(1 + x)/x = 1 donc l'exposant tend vers ${n2(a)}.`, "Compose avec exp."), solution: `La limite est e^${par(a)} ≈ ${n2(r2(Math.exp(a)))}.` };
  }, FR),
  mk("su-point-fixe", SU, 2, { skill: "Limite éventuelle d'une suite uₙ₊₁ = f(uₙ) : résoudre f(x) = x", ref: `${BOOK}, chap. 13 §3.1, suites définies par récurrence, propriété f(l) = l (p. 286-287)`, kw: ["point fixe", "f(l) = l", "suite récurrente", "limite", "uₙ₊₁ = f(uₙ)"] }, (_c, r) => {
    if (int(r, 0, 1) === 0) {
      const a = pick(r, [0.5, 0.25, 2 / 3, 0.75, -0.5]), l = int(r, -6, 8), b = l * (1 - a);
      return { statement: `La suite (uₙ) vérifie uₙ₊₁ = ${fr(r2(a))}uₙ ${b < 0 ? "−" : "+"} ${fr(Math.abs(r2(b)))} et converge. Quelle est sa limite (arrondie au centième) ?`, answer: num(l), hints: H("Si uₙ converge vers l, alors l = f(l).", `l = ${fr(r2(a))}l ${b < 0 ? "−" : "+"} ${fr(Math.abs(r2(b)))}.`, "Résous cette équation.", `l = ${fr(r2(b))}/(1 − ${par(r2(a))}).`), solution: `l(1 − ${par(r2(a))}) = ${n2(r2(b))} donc l ≈ ${n2(l)}.` };
    }
    const p = int(r, 1, 4), q = int(r, 1, 4), l = (p + Math.sqrt(p * p + 4 * q)) / 2;
    return { statement: `La suite (vₙ) de termes positifs vérifie vₙ₊₁ = ${p} + ${q}/vₙ et converge. Quelle est sa limite (arrondie au centième) ?`, answer: num(r2(l), 0.01), hints: H("l vérifie l = f(l), avec l > 0.", `l = ${p} + ${q}/l, soit l² − ${p}l − ${q} = 0.`, "Garde la racine positive.", `l = (${p} + √(${p * p + 4 * q}))/2.`), solution: `l = (${p} + √${p * p + 4 * q})/2 ≈ ${n2(r2(l))}.` };
  }, FR),
  mk("su-contraction", SU, 3, { skill: "Majoration |uₙ − l| ≤ kⁿ |u₀ − l| : rang à partir duquel l'erreur est inférieure à 10⁻ᵖ", ref: `${BOOK}, chap. 13 §3.1 (p. 287) et TD 1, méthode du point fixe (p. 288-289)`, kw: ["inégalité des accroissements finis", "|uₙ − l| ≤ kⁿ|u₀ − l|", "valeur approchée", "méthode du point fixe", "précision 10⁻ᵖ"] }, (_c, r) => {
    const k = pick(r, [1 / 2, 1 / 4, 1 / 3, 1 / 5]), e = int(r, 2, 6), c = pick(r, [1, 2]), kk = k === 1 / 2 ? "1/2" : k === 1 / 4 ? "1/4" : k === 1 / 3 ? "1/3" : "1/5";
    let n = 0; while (c * k ** n > 10 ** -e) n++;
    return { statement: `On sait que |uₙ − l| ≤ (${kk})ⁿ × ${c} pour tout n. Quel est le plus petit entier n garantissant |uₙ − l| ≤ 10⁻${sup(e)} ?`.replace(`10⁻${sup(e)}`, `10⁻${String(e).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]).join("")}`), answer: num(n), hints: H("Cherche n tel que (k)ⁿ × c ≤ 10⁻ᵖ.", `Passe aux logarithmes : n ≥ ln(${c} × 10^${e})/ln(${kk.split("/")[1]}).`, "Prends l'entier immédiatement supérieur.", "Vérifie avec la calculatrice."), solution: `Le plus petit entier est n = ${n}.` };
  }, FR),
  mk("su-newton", SU, 3, { skill: "Méthode de Newton : uₙ₊₁ = uₙ − f(uₙ)/f′(uₙ), avec f(x) = x² − a", ref: `${BOOK}, chap. 13 §3.2, TD 2, méthode de Newton (p. 288-289)`, kw: ["méthode de Newton", "x − f(x)/f′(x)", "tangente", "valeur approchée", "suite récurrente"] }, (_c, r) => {
    const a = pick(r, [2, 3, 5, 7, 10]), u0 = int(r, 2, 4), k = int(r, 1, 3);
    let u = u0; for (let i = 0; i < k; i++) u = u - (u * u - a) / (2 * u);
    return { statement: `On applique la méthode de Newton à f(x) = x² − ${a} avec u₀ = ${u0} et uₙ₊₁ = uₙ − f(uₙ)/f′(uₙ). Quelle est la valeur de u${k} (arrondie au centième) ?`, answer: num(r2(u), 0.01), hints: H("f′(x) = 2x.", "uₙ₊₁ = uₙ − (uₙ² − a)/(2uₙ) = (uₙ + a/uₙ)/2.", `u₁ = (${u0} + ${a}/${u0})/2.`, "Itère."), solution: `u${k} ≈ ${n2(r2(u))} (valeur proche de √${a} ≈ ${n2(r2(Math.sqrt(a)))}).` };
  }, FR),
  mk("su-monotone-limite", SU, 2, { skill: "Limite d'une suite monotone : théorème de convergence et suites non bornées", ref: `${BOOK}, chap. 13 §2.3, limite d'une suite monotone (p. 285)`, kw: ["suite croissante et majorée", "convergente", "suite non majorée", "limite +∞", "suite monotone"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Une suite croissante et majorée est…", good: "convergente", bad: ["divergente", "constante", "décroissante"], why: "Propriété de la page 285." },
      { q: "Une suite décroissante et minorée est…", good: "convergente", bad: ["divergente", "croissante", "tend vers −∞"], why: "Propriété de la page 285." },
      { q: "Une suite croissante et non majorée a pour limite…", good: "+∞", bad: ["−∞", "0", "un réel"], why: "Remarque de la page 285." },
      { q: "Une suite décroissante et non minorée a pour limite…", good: "−∞", bad: ["+∞", "0", "un réel"], why: "Remarque de la page 285." },
      { q: "Si (uₙ) converge vers l et uₙ₊₁ = f(uₙ) avec f continue en l, alors…", good: "f(l) = l", bad: ["f(l) = 0", "f′(l) = 0", "l = u₀"], why: "Propriété de la page 286." },
      { q: "Une suite convergente a…", good: "une limite unique", bad: ["deux limites au plus", "une limite non unique", "toujours une limite nulle"], why: "Remarque de la page 280." },
    ];
    return qcmOf(r, T, "Reprends les théorèmes sur les suites monotones.");
  }, QCM),
  mk("su-cours", SU, 1, { skill: "Cours : suites bornées, monotones, convergentes, limites usuelles", ref: `${BOOK}, chap. 13 « Suites numériques », cours (p. 275-289)`, kw: ["suite bornée", "suite convergente", "suite divergente", "limite d'une suite", "uₙ₊₁ = f(uₙ)"] }, (_c, r) => {
    const T: Item[] = [
      { q: "Une suite est bornée si elle est…", good: "à la fois minorée et majorée", bad: ["croissante", "convergente seulement", "positive"], why: "Définition." },
      { q: "Une suite (uₙ) telle que uₙ₊₁ − uₙ > 0 pour tout n est…", good: "strictement croissante", bad: ["décroissante", "constante", "bornée"], why: "Définition de la monotonie." },
      { q: "Pour une suite géométrique de raison q, la somme des n premiers termes (q ≠ 1) est…", good: "u₀(1 − qⁿ)/(1 − q)", bad: ["u₀(1 − qⁿ⁺¹)/(1 + q)", "n u₀ q", "u₀ qⁿ"], why: "Tableau p. 278." },
      { q: "Une suite convergente est…", good: "une suite qui a une limite finie", bad: ["une suite croissante", "une suite bornée seulement", "une suite qui tend vers 0 seulement"], why: "Définition." },
      { q: "La suite de terme général sin(nπ/2) est…", good: "divergente, sans limite", bad: ["convergente vers 0", "convergente vers 1", "tend vers +∞"], why: "Remarque de la page 280." },
      { q: "Une suite (uₙ) définie par uₙ = f(n) avec f de limite l en +∞…", good: "converge aussi vers l", bad: ["converge vers f(l)", "diverge", "est croissante"], why: "Propriété de la page 281." },
      { q: "Toute suite convergente est…", good: "bornée", bad: ["monotone", "croissante", "décroissante"], why: "Propriété classique, p. 276-285." },
    ];
    return qcmOf(r, T, "Reprends les définitions du chapitre.");
  }, QCM),
];
void INF;
