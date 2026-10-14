// CIAM 4ème : activités numériques (chap. 10 à 15). Énoncés originaux, réponses calculées par le code.
import { choice, fr, gcd, int, num, pick, register, round, Rng } from "./core";
import { ciam, dec, f, factStr, fracS, H, Item, qcmOf, reduce, QCM, sup, WHO, withWrong, shuffle } from "./ciam-kit";

const mk = ciam("4e", "ciam4");
const BOOK = "CIAM 4ème";
const who = (r: Rng) => pick(r, WHO);
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
const sg = (x: number) => (x < 0 ? `(−${fr(-x)})` : `(+${fr(x)})`);
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const rnd = (r: Rng) => (int(r, 0, 1) === 0 ? -1 : 1);
/** Expression ax + b écrite en texte propre. */
const lin = (a: number, b: number, v = "x") => {
  const t1 = a === 0 ? "" : a === 1 ? v : a === -1 ? `−${v}` : `${a < 0 ? "−" : ""}${Math.abs(a)}${v}`;
  if (b === 0) return t1 || "0";
  const t2 = `${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
  return t1 ? `${t1} ${t2}` : `${b < 0 ? "−" : ""}${Math.abs(b)}`;
};
const FR = [{ id: "calcul", label: "Calcul" }];
const SIT = [{ id: "pur", label: "Calcul direct" }, { id: "situation", label: "En situation" }];
/** Fraction affichée avec le signe devant : −3/5. */
const fz = (a: number, b: number) => { const [p, q] = reduce(a, b); const s = (p < 0) !== (q < 0) ? "−" : ""; const P = Math.abs(p), Q = Math.abs(q); return Q === 1 ? `${s}${P}` : `${s}${P}/${Q}`; };

register(
  // ===== Chapitre 10 : Calcul littéral =====
  mk("lit-valeur", "Calcul littéral", 1, { skill: "Calculer la valeur numérique d'une expression littérale", ref: `${BOOK}, chap. 10 §1, ex. 1.a-1.b (p. 131) et ex. 1-4 (p. 148)`, kw: ["valeur numérique", "expression littérale", "remplacer", "formule"] }, (c, r) => {
    const a = int(r, 2, 9), b = int(r, 1, 12);
    const x = c === "pur" ? rnd(r) * int(r, 1, 9) : int(r, 2, 9);
    const v = a * x + b;
    const X = x < 0 ? `(−${-x})` : String(x);
    return {
      statement: c === "pur" ? `Calcule la valeur de ${lin(a, b)} pour x = ${X}.` : `Un artisan facture ${b} F de déplacement plus ${a} F par heure de travail. Il travaille ${x} heures : quel est le prix à payer (valeur de ${lin(a, b)} pour x = ${x}), en F ?`,
      answer: num(v),
      hints: H("On remplace la lettre par sa valeur.", "Dans un produit, on écrit a x pour a × x.", `Remplace x par ${X}.`, `${a} × ${X} = ${a * x}.`),
      solution: `${a} × ${X} + ${b} = ${a * x} + ${b} = ${v}.`,
    };
  }, SIT),
  mk("lit-somme-parentheses", "Calcul littéral", 2, { skill: "Supprimer des parenthèses et réduire une somme", ref: `${BOOK}, chap. 10 §2.2, ex. 2.c-2.d (p. 132) et ex. 6-9 (p. 148)`, kw: ["supprimer les parenthèses", "réduire", "somme algébrique", "signe moins"] }, (_c, r) => {
    const a = int(r, 2, 9), b = int(r, 1, 9), d = int(r, 1, 9), e = int(r, 1, 9);
    const t = int(r, 0, 2);
    // a - (b x + d) + e  etc.
    if (t === 0) { const A = int(r, 2, 8), B = int(r, 1, 8), C = int(r, 1, 9), D = int(r, 1, 9); // A x - (B x - C) + D
      return { statement: `Réduis ${A}x − (${B}x − ${C}) + ${D}. Quel est le coefficient de x dans le résultat ? (réponds par le nombre)`, answer: num(A - B), hints: H("On supprime d'abord les parenthèses précédées du signe −.", "Un signe − devant une parenthèse change tous les signes à l'intérieur.", `A x − B x + C + D : ${A}x − ${B}x + ${C} + ${D}.`, `${A} − ${B}.`), solution: `${A}x − (${B}x − ${C}) + ${D} = ${A}x − ${B}x + ${C} + ${D} = ${lin(A - B, C + D)}. Coefficient de x : ${A - B}.` }; }
    if (t === 1) { const A = int(r, 2, 8), B = int(r, 1, 8), C = int(r, 1, 9), D = int(r, 1, 9);
      return { statement: `Réduis ${A}x + (${B} − ${C}x) − ${D}. Quel est le terme constant du résultat ? (réponds par le nombre)`, answer: num(B - D), hints: H("Un signe + devant une parenthèse ne change aucun signe.", `${A}x + ${B} − ${C}x − ${D}.`, "Regroupe les termes en x d'un côté et les nombres de l'autre.", `${B} − ${D}.`), solution: `${A}x + (${B} − ${C}x) − ${D} = ${A}x + ${B} − ${C}x − ${D} = ${lin(A - C, B - D)}. Terme constant : ${B - D}.` }; }
    const k = int(r, 2, 7);
    return { statement: `Réduis ${a}x − ${b}x + ${d}x. Quel est le coefficient du résultat ? (réponds par le nombre)`, answer: num(a - b + d), hints: H("Les trois termes sont de même nature (en x).", "On factorise x : (a − b + d) x.", `${a} − ${b} + ${d}.`, "Calcule de gauche à droite."), solution: `${a}x − ${b}x + ${d}x = (${a} − ${b} + ${d})x = ${a - b + d}x. ${k ? "" : ""}`.trim() };
  }, FR),
  mk("lit-produit-reduire", "Calcul littéral", 2, { skill: "Réduire un produit (règle des signes avec des lettres)", ref: `${BOOK}, chap. 10 §3.2, ex. 3.b et ex. 12-16 (p. 134, 148)`, kw: ["réduire un produit", "règle des signes", "a×b", "valeur numérique"] }, (_c, r) => {
    const a = rnd(r) * int(r, 2, 8), b = rnd(r) * int(r, 2, 8);
    const ab = a * b;
    return {
      statement: `Réduis le produit (${a < 0 ? "−" : ""}${Math.abs(a)} a) × (${b < 0 ? "−" : ""}${Math.abs(b)} b) sous la forme k × ab. Quelle est la valeur de k ?`,
      answer: num(ab),
      hints: H("On multiplie les coefficients, puis les lettres.", "Même signe : positif ; signes contraires : négatif.", `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(ab)}.`, "Applique la règle des signes."),
      solution: `(${a}a) × (${b}b) = (${a} × ${b}) ab = ${ab} ab. k = ${ab}.`,
    };
  }, FR),
  mk("lit-developper", "Calcul littéral", 2, { skill: "Développer a(x + y) et a(x − y)", ref: `${BOOK}, chap. 10 §3.2, ex. 3.c-3.d (p. 134-135) et ex. 17-22 (p. 148-149)`, kw: ["développer", "distributivité", "a(x+y)", "a(x−y)"] }, (_c, r) => {
    const a = rnd(r) * int(r, 2, 9), d = int(r, 1, 9);
    const sign = int(r, 0, 1) === 0 ? "+" : "−";
    const co = sign === "+" ? a * d : -a * d;
    const good = lin(a, co);
    const wrong = withWrong(good, [lin(a, -co), lin(a, a + d), lin(-a, co), lin(a + 1, co), lin(a, co + a)]);
    const A = a < 0 ? `(−${-a})` : String(a);
    return {
      statement: `Développe et réduis ${A} (x ${sign} ${d}).`,
      answer: choice(r, [good, ...wrong], 0),
      hints: H("On applique la distributivité.", "a (x + y) = a x + a y et a (x − y) = a x − a y.", `Multiplie ${A} par x et par ${d}.`, `${A} × ${d} = ${a * d}.`),
      solution: `${A} (x ${sign} ${d}) = ${a}x ${sign} ${A} × ${d} = ${good}.`,
    };
  }, QCM),
  mk("lit-double", "Calcul littéral", 3, { skill: "Développer (a + b)(x + y) et réduire", ref: `${BOOK}, chap. 10 §3.2 et §4.1, ex. 4.b (p. 135, 138) et ex. 23-28 (p. 149)`, kw: ["double distributivité", "(a+b)(c+d)", "développer", "réduire"] }, (_c, r) => {
    const a = int(r, 1, 6), b = rnd(r) * int(r, 1, 9), c = int(r, 1, 6), d = rnd(r) * int(r, 1, 9);
    // (a x + b)(c x + d) = ac x² + (ad + bc) x + bd
    const A = a * c, B = a * d + b * c, C = b * d;
    return {
      statement: `On développe et on réduit (${lin(a, b)})(${lin(c, d)}). Quel est le coefficient de x dans le résultat ?`,
      answer: num(B),
      hints: H("On applique (a + b)(c + d) = ac + ad + bc + bd.", `Termes en x : ${a}x × ${d < 0 ? `(−${-d})` : d} et ${b < 0 ? `(−${-b})` : b} × ${c}x.`, `${a} × ${d < 0 ? `(−${-d})` : d} = ${a * d} et ${b < 0 ? `(−${-b})` : b} × ${c} = ${b * c}.`, `Additionne ${a * d} et ${b * c}.`),
      solution: `(${lin(a, b)})(${lin(c, d)}) = ${A}x² ${B < 0 ? "−" : "+"} ${Math.abs(B)}x ${C < 0 ? "−" : "+"} ${Math.abs(C)}. Coefficient de x : ${B}.`,
    };
  }, FR),
  mk("lit-remarquables", "Calcul littéral", 3, { skill: "Produits remarquables : (a+b)², (a−b)², (a+b)(a−b)", ref: `${BOOK}, chap. 10 §4.2, ex. 4.b-4.c (p. 138-139) et ex. 29-35 (p. 149)`, kw: ["produits remarquables", "identités remarquables", "(a+b)²", "(a−b)²", "différence de deux carrés"] }, (_c, r) => {
    const a = int(r, 2, 12), t = int(r, 0, 3);
    const form = [`(${a} + 5)²`, `(${a} − 4)²`, `(${a} + 3)(${a} − 3)`, `(${2 * a} − 1)²`][t];
    const vals = [(a + 5) ** 2, (a - 4) ** 2, (a + 3) * (a - 3), (2 * a - 1) ** 2];
    const how = [`(a + b)² = a² + 2ab + b² : ${a}² + 2 × ${a} × 5 + 5² = ${a * a} + ${10 * a} + 25`, `(a − b)² = a² − 2ab + b² : ${a}² − 2 × ${a} × 4 + 4² = ${a * a} − ${8 * a} + 16`, `(a + b)(a − b) = a² − b² : ${a}² − 3² = ${a * a} − 9`, `(a − b)² = a² − 2ab + b² : ${2 * a}² − 2 × ${2 * a} × 1 + 1² = ${4 * a * a} − ${4 * a} + 1`][t];
    return {
      statement: `Calcule ${form} à l'aide d'un produit remarquable.`,
      answer: num(vals[t]),
      hints: H("Reconnais la forme du produit remarquable.", t === 2 ? "(a + b)(a − b) = a² − b²." : t === 0 ? "(a + b)² = a² + 2ab + b²." : "(a − b)² = a² − 2ab + b².", "Identifie a et b.", "Remplace dans la formule."),
      solution: `${how} = ${f(vals[t])}.`,
    };
  }, FR),
  mk("lit-puissances", "Calcul littéral", 2, { skill: "Propriétés des puissances d'un nombre relatif", ref: `${BOOK}, chap. 10 §3.3, ex. 3.e-3.g (p. 136-137) et ex. 36-45 (p. 150)`, kw: ["puissance", "aᵐ × aⁿ", "(aᵐ)ⁿ", "exposant", "relatif"] }, (_c, r) => {
    const a = pick(r, [2, 3, 5, 10]), m = int(r, 2, 6), n = int(r, 2, 5);
    const t = int(r, 0, 3);
    if (t === 0) return { statement: `Écris ${a}${sup(m)} × ${a}${sup(n)} sous la forme ${a}^p. Quelle est la valeur de p ?`, answer: num(m + n), hints: H("Même base : on additionne les exposants.", "aᵐ × aⁿ = aᵐ⁺ⁿ.", `${m} + ${n}.`, "Calcule."), solution: `${a}${sup(m)} × ${a}${sup(n)} = ${a}${sup(m + n)} : p = ${m + n}.` };
    if (t === 1) return { statement: `Écris (${a}${sup(m)})${sup(n)} sous la forme ${a}^p. Quelle est la valeur de p ?`, answer: num(m * n), hints: H("On élève une puissance à une puissance.", "(aᵐ)ⁿ = aᵐ×ⁿ.", `${m} × ${n}.`, "Multiplie."), solution: `(${a}${sup(m)})${sup(n)} = ${a}${sup(m * n)} : p = ${m * n}.` };
    if (t === 2) { const hi = m + n; return { statement: `Écris ${a}${sup(hi)} ÷ ${a}${sup(n)} sous la forme ${a}^p. Quelle est la valeur de p ?`, answer: num(m), hints: H("Même base : on soustrait les exposants.", "aᵐ / aⁿ = aᵐ⁻ⁿ (m > n).", `${hi} − ${n}.`, "Calcule."), solution: `${a}${sup(hi)} ÷ ${a}${sup(n)} = ${a}${sup(hi - n)} : p = ${m}.` }; }
    const pool: Item[] = [
      { q: "Quel est le signe de (−3)⁴ ?", good: "positif", bad: ["négatif", "nul", "On ne peut pas savoir"], why: "Si n est pair, (−a)ⁿ = aⁿ : (−3)⁴ = 81 est positif." },
      { q: "Quel est le signe de (−2)⁵ ?", good: "négatif", bad: ["positif", "nul", "On ne peut pas savoir"], why: "Si n est impair, (−a)ⁿ = −aⁿ : (−2)⁵ = −32 est négatif." },
      { q: "Quelle est la valeur de (−5)² ?", good: "25", bad: ["−25", "10", "−10"], why: "(−5)² = (−5) × (−5) = 25." },
      { q: "Quelle est la valeur de −5² ?", good: "−25", bad: ["25", "10", "−10"], why: "−5² = −(5 × 5) = −25 : l'exposant ne porte que sur 5." },
      { q: "Quelle est la valeur de a⁰ pour a ≠ 0 ?", good: "1", bad: ["0", "a", "Elle n'existe pas"], why: "Pour tout nombre non nul, a⁰ = 1." },
      { q: "Quelle est la valeur de (−1)¹⁵ ?", good: "−1", bad: ["1", "0", "15"], why: "L'exposant 15 est impair : (−1)¹⁵ = −1." },
    ];
    return qcmOf(r, pool, "Pense à la parité de l'exposant.");
  }, [{ id: "puissance", label: "Puissances" }]),
  mk("lit-formule", "Calcul littéral", 2, { skill: "Utiliser une formule (aire, masse volumique...) avec des lettres", ref: `${BOOK}, chap. 10 §1, ex. 1.a-1.b (p. 130-131) et ex. 5, 11 (p. 148)`, kw: ["formule", "programme de calcul", "expression littérale", "aire du trapèze"] }, (_c, r) => {
    const a = int(r, 2, 8), b = a + int(r, 1, 7), h = int(r, 2, 9);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `L'aire d'un trapèze de bases a et b et de hauteur h est A = (a + b) × h ÷ 2. Calcule A pour a = ${a}, b = ${b} et h = ${h}.`, answer: num(((a + b) * h) / 2), hints: H("On remplace les lettres par leurs valeurs.", "Calcule d'abord la parenthèse.", `${a} + ${b} = ${a + b}.`, `${a + b} × ${h} ÷ 2.`), solution: `A = (${a} + ${b}) × ${h} ÷ 2 = ${fr(((a + b) * h) / 2)}.` };
    const m = pick(r, [0.85, 1.2, 2.7, 7.8]), V = pick(r, [2, 3, 4, 5, 10]);
    return { statement: `La masse M d'un corps de masse volumique ρ et de volume V est M = ρ × V. Calcule M pour ρ = ${fr(m)} kg/dm³ et V = ${V} dm³ (en kg).`, answer: num(round(m * V, 3), 0.001), hints: H("On remplace les lettres.", "M = ρ × V.", `${fr(m)} × ${V}.`, "Calcule."), solution: `M = ${fr(m)} × ${V} = ${fr(round(m * V, 3))} kg.` };
  }, FR),

  // ===== Chapitre 11 : Nombres rationnels =====
  mk("rat-simplifier", "Nombres rationnels", 2, { skill: "Simplifier une fraction (diviseurs communs, PGCD)", ref: `${BOOK}, chap. 11 §1, ex. 1.a-1.b (p. 146) et ex. 1-5 (p. 154)`, kw: ["simplifier", "fraction irréductible", "pgcd", "diviseur commun"] }, (_c, r) => {
    let p = 0, q = 0;
    do { p = int(r, 2, 19); q = int(r, 3, 23); } while (p === q || gcd(p, q) !== 1);
    const k = int(r, 3, 24);
    const good = fracS(p, q);
    return { statement: `Rends irréductible la fraction ${p * k}/${q * k}.`, answer: choice(r, [good, ...withWrong(good, [fracS(p * 2, q * 2), fracS(p, q + 1), fracS(p + 1, q), fracS(p * k, q), fracS(p, q * k), fracS(p * 3, q * 3)])], 0), hints: H("On divise numérateur et dénominateur par leur PGCD.", `Cherche un diviseur commun à ${p * k} et ${q * k}.`, "Recommence jusqu'à ce que 1 soit le seul diviseur commun.", `Le PGCD est ${k}.`), solution: `PGCD(${p * k} ; ${q * k}) = ${k}, donc ${p * k}/${q * k} = ${good}.` };
  }, QCM),
  mk("rat-pgcd-ppcm", "Nombres rationnels", 3, { skill: "PGCD et PPCM de deux nombres (décomposition en facteurs premiers)", ref: `${BOOK}, chap. 11 §2, ex. 2.a-2.b (p. 147-148) et ex. 10-15 (p. 154)`, kw: ["pgcd", "ppcm", "facteurs premiers", "plus grand diviseur commun"] }, (c, r) => {
    const [a, b] = pick(r, [[36, 48], [28, 36], [24, 60], [18, 24], [40, 100], [45, 75], [54, 90], [72, 96], [84, 126], [60, 150], [48, 180], [32, 80], [64, 96], [42, 70], [90, 108]]);
    const g = gcd(a, b), l = lcm(a, b);
    if (int(r, 0, 1) === 0) return { statement: c === "pur" ? `Calcule le PGCD de ${a} et ${b}.` : `${who(r)} partage ${a} billes rouges et ${b} billes bleues en lots identiques, sans reste. Quel est le plus grand nombre de lots ?`, answer: num(g), hints: H("On décompose en facteurs premiers.", `${a} = ${factStr(a)} ; ${b} = ${factStr(b)}.`, "Le PGCD est le produit des facteurs communs avec le plus petit exposant.", "Calcule le produit."), solution: `${a} = ${factStr(a)} ; ${b} = ${factStr(b)}. PGCD = ${g}.` };
    return { statement: c === "pur" ? `Calcule le PPCM de ${a} et ${b}.` : `Deux cloches sonnent, l'une toutes les ${a} minutes, l'autre toutes les ${b} minutes. Elles sonnent ensemble à midi. Dans combien de minutes sonneront-elles de nouveau ensemble ?`, answer: num(l), hints: H("On décompose en facteurs premiers.", `${a} = ${factStr(a)} ; ${b} = ${factStr(b)}.`, "Le PPCM est le produit de tous les facteurs avec le plus grand exposant.", "Calcule le produit."), solution: `${a} = ${factStr(a)} ; ${b} = ${factStr(b)}. PPCM = ${l}.` };
  }, SIT),
  mk("rat-ensembles", "Nombres rationnels", 2, { skill: "Appartenance à ℕ, ℤ, D, ℚ", ref: `${BOOK}, chap. 11 §3, ex. 3.b-3.c (p. 148-149) et ex. 20-25 (p. 154)`, kw: ["ℚ", "nombre rationnel", "ℤ", "D", "décimal", "appartient"] }, (_c, r) => {
    const cases = [
      { v: "−4/5", best: "ℚ et D, pas ℤ" }, { v: "7/3", best: "ℚ, pas D" }, { v: "−12,7", best: "D et ℚ, pas ℤ" }, { v: "−9", best: "ℤ, D et ℚ, pas ℕ" }, { v: "+15", best: "ℕ, ℤ, D et ℚ" },
      { v: "1/7", best: "ℚ, pas D" }, { v: "3/4", best: "ℚ et D, pas ℤ" }, { v: "−8/2", best: "ℤ, D et ℚ, pas ℕ" }, { v: "−2/3", best: "ℚ, pas D" },
    ];
    const it = pick(r, cases);
    const opts = ["ℕ, ℤ, D et ℚ", "ℤ, D et ℚ, pas ℕ", "ℚ et D, pas ℤ", "ℚ, pas D"];
    const best = it.best === "D et ℚ, pas ℤ" ? "ℚ et D, pas ℤ" : it.best;
    return { statement: `Dans quels ensembles se trouve le nombre ${it.v} ? (ℕ entiers naturels, ℤ entiers relatifs, D décimaux relatifs, ℚ rationnels)`, answer: choice(r, opts, opts.indexOf(best)), hints: H("ℕ ⊂ ℤ ⊂ D ⊂ ℚ.", "Un nombre décimal s'écrit avec un nombre fini de chiffres après la virgule.", "Une fraction peut être égale à un entier ou à un décimal : simplifie d'abord.", "7/3 = 2,333… n'est pas décimal."), solution: `${it.v} : ${best}.` };
  }, QCM),
  mk("rat-comparer", "Nombres rationnels", 2, { skill: "Comparer deux nombres rationnels", ref: `${BOOK}, chap. 11 §3.2, ex. 3.f (p. 150) et ex. 7-9, 26-30 (p. 154-155)`, kw: ["comparer", "rationnels", "fractions", "même dénominateur", "négatifs"] }, (_c, r) => {
    let a = 1, b = 1, d1 = 2, d2 = 2;
    do { d1 = int(r, 3, 9); d2 = int(r, 3, 9); a = rnd(r) * int(r, 1, d1 + 3); b = rnd(r) * int(r, 1, d2 + 3); } while (a * d2 === b * d1 || gcd(Math.abs(a), d1) !== 1 || gcd(Math.abs(b), d2) !== 1);
    const A = fz(a, d1), B = fz(b, d2);
    const rel = a * d2 < b * d1 ? "<" : ">";
    const L = d1 * d2;
    return { statement: `Compare ${A} et ${B}. Quelle écriture est correcte ?`, answer: choice(r, [`${A} < ${B}`, `${A} > ${B}`], rel === "<" ? 0 : 1), hints: H("On compare deux rationnels.", "Réduis-les au même dénominateur positif.", `${d1} × ${d2} = ${L} est un dénominateur commun.`, `${a} × ${d2} = ${a * d2} et ${b} × ${d1} = ${b * d1}.`), solution: `${A} = ${a * d2}/${L} et ${B} = ${b * d1}/${L} : ${A} ${rel} ${B}.` };
  }, QCM),
  mk("rat-somme", "Nombres rationnels", 3, { skill: "Somme et différence de nombres rationnels", ref: `${BOOK}, chap. 11 §4.1, ex. 4.a-4.b (p. 150-151) et ex. 31-40 (p. 155)`, kw: ["somme", "différence", "rationnels", "même dénominateur", "fractions"] }, (_c, r) => {
    const [d1, d2] = pick(r, [[2, 3], [3, 4], [4, 6], [5, 10], [6, 9], [3, 5], [4, 5], [6, 8], [10, 15]]);
    let a = 1, b = 1;
    do { a = rnd(r) * int(r, 1, d1 + 2); b = rnd(r) * int(r, 1, d2 + 2); } while (gcd(Math.abs(a), d1) !== 1 || gcd(Math.abs(b), d2) !== 1);
    const L = lcm(d1, d2), A = a * (L / d1), B = b * (L / d2);
    const add = int(r, 0, 1) === 0;
    const num_ = add ? A + B : A - B;
    const good = num_ === 0 ? "0" : fz(num_, L);
    const wrong = withWrong(good, [fz(a + b, d1 + d2), fz(-(num_), L), fz(num_ + 1, L), fz(num_, L * 2), fz(a * b, d1 * d2), fz(num_ - 1, L)]);
    return { statement: `Calcule ${fz(a, d1)} ${add ? "+" : "−"} ${b < 0 ? `(${fz(b, d2)})` : fz(b, d2)} et donne le résultat sous forme irréductible.`, answer: choice(r, [good, ...wrong], 0), hints: H("On réduit au même dénominateur positif.", `Le PPCM de ${d1} et ${d2} est ${L}.`, `${fz(a, d1)} = ${a * (L / d1)}/${L} et ${fz(b, d2)} = ${b * (L / d2)}/${L}.`, `Calcule ${A} ${add ? "+" : "−"} (${B}) sur ${L}.`), solution: `${A}/${L} ${add ? "+" : "−"} (${B}/${L}) = ${num_}/${L} = ${good}.` };
  }, QCM),
  mk("rat-produit", "Nombres rationnels", 3, { skill: "Produit de deux nombres rationnels", ref: `${BOOK}, chap. 11 §4.2, ex. 4.c-4.d (p. 151) et ex. 41-46 (p. 155)`, kw: ["produit", "rationnels", "fractions", "signe"] }, (_c, r) => {
    let a = 1, b = 2, c = 1, d = 2;
    do { a = rnd(r) * int(r, 1, 8); b = int(r, 2, 9); c = rnd(r) * int(r, 1, 8); d = int(r, 2, 9); } while (gcd(Math.abs(a), b) !== 1 || gcd(Math.abs(c), d) !== 1);
    const good = fz(a * c, b * d);
    const wrong = withWrong(good, [fz(a * c, b + d), fz(-a * c, b * d), fz(a + c, b * d), fz(a * d, b * c), fz(a * c + 1, b * d)]);
    return { statement: `Calcule ${fz(a, b)} × ${c < 0 ? `(${fz(c, d)})` : fz(c, d)} et donne le résultat sous forme irréductible.`, answer: choice(r, [good, ...wrong], 0), hints: H("On multiplie deux rationnels.", "(a/b) × (c/d) = (a × c)/(b × d).", "Détermine d'abord le signe du produit.", "Simplifie ensuite."), solution: `${fz(a, b)} × ${fz(c, d)} = ${a * c}/${b * d} = ${good}.` };
  }, QCM),
  mk("rat-inverse", "Nombres rationnels", 2, { skill: "Inverse d'un nombre rationnel non nul", ref: `${BOOK}, chap. 11 §4.4, ex. 4.g (p. 152) et ex. 47-52 (p. 155)`, kw: ["inverse", "rationnel", "produit égal à 1"] }, (_c, r) => {
    let a = 0, b = 0;
    do { a = rnd(r) * int(r, 2, 13); b = int(r, 1, 11); } while (gcd(Math.abs(a), b) !== 1);
    const good = fz(b, a);
    return { statement: `Quel est l'inverse du nombre ${fz(a, b)} ?`, answer: choice(r, [good, ...withWrong(good, [fz(-b, a), fz(a, b), fz(-a, b), fz(b, b + Math.abs(a))])], 0), hints: H("Deux nombres inverses ont pour produit 1.", "L'inverse de a/b est b/a.", "Le signe est conservé.", `${fz(a, b)} × ${good} = 1.`), solution: `${fz(a, b)} × ${good} = 1 : l'inverse est ${good}.` };
  }, QCM),
  mk("rat-quotient", "Nombres rationnels", 3, { skill: "Quotient de deux nombres rationnels", ref: `${BOOK}, chap. 11 §4.5, ex. 4.h (p. 153) et ex. 53-58 (p. 155)`, kw: ["quotient", "diviser", "inverse", "rationnels"] }, (_c, r) => {
    let a = 1, b = 2, c = 1, d = 2;
    do { a = rnd(r) * int(r, 1, 7); b = int(r, 2, 9); c = rnd(r) * int(r, 1, 7); d = int(r, 2, 9); } while (gcd(Math.abs(a), b) !== 1 || gcd(Math.abs(c), d) !== 1);
    const good = fz(a * d, b * c);
    const wrong = withWrong(good, [fz(a * c, b * d), fz(-a * d, b * c), fz(b * c, a * d), fz(a * d + 1, b * c)]);
    return { statement: `Calcule ${fz(a, b)} ÷ ${c < 0 ? `(${fz(c, d)})` : fz(c, d)} et donne le résultat sous forme irréductible.`, answer: choice(r, [good, ...wrong], 0), hints: H("Diviser, c'est multiplier par l'inverse.", `L'inverse de ${fz(c, d)} est ${fz(d, c)}.`, "r ÷ s = r × (1/s).", "Multiplie puis simplifie."), solution: `${fz(a, b)} ÷ ${fz(c, d)} = ${fz(a, b)} × ${fz(d, c)} = ${good}.` };
  }, QCM),
  mk("rat-puissance", "Nombres rationnels", 3, { skill: "Puissance d'un nombre rationnel", ref: `${BOOK}, chap. 11 §4.3, ex. 4.e-4.f (p. 152)`, kw: ["puissance", "rationnel", "fraction", "exposant"] }, (_c, r) => {
    let a = 1, b = 2;
    do { a = rnd(r) * int(r, 1, 5); b = int(r, 2, 6); } while (gcd(Math.abs(a), b) !== 1);
    const n = int(r, 2, 3);
    const num_ = a ** n, den = b ** n;
    const good = fz(num_, den);
    return { statement: `Calcule (${fz(a, b)})${sup(n)}.`, answer: choice(r, [good, ...withWrong(good, [fz(a * n, b * n), fz(-num_, den), fz(num_, b), fz(a, b ** n), fz(a ** n, b ** n + 1)])], 0), hints: H("On élève numérateur et dénominateur à la puissance.", "(a/b)ⁿ = aⁿ/bⁿ.", n % 2 === 0 ? "Exposant pair : résultat positif." : "Exposant impair : le signe est conservé.", `${a < 0 ? `(−${-a})` : a}${sup(n)} = ${num_}.`), solution: `(${fz(a, b)})${sup(n)} = ${a}${sup(n)}/${b}${sup(n)} = ${good}.` };
  }, QCM),
  mk("rat-probleme", "Nombres rationnels", 3, { skill: "Fractions d'une quantité : problème en deux étapes", ref: `${BOOK}, chap. 11, ex. 59-65 (p. 159-160)`, kw: ["fraction", "problème", "reste", "partage", "deux étapes"] }, (c, r) => {
    const T = pick(r, [120, 180, 240, 360, 600, 720, 840, 1200]);
    const [d1, a1, d2, a2] = pick(r, [[3, 1, 4, 1], [2, 1, 3, 1], [4, 1, 5, 1], [5, 2, 3, 1], [6, 1, 4, 1]]);
    const used1 = (T * a1) / d1;
    const rest = T - used1;
    const used2 = (rest * a2) / d2;
    const ok = Number.isInteger(used1) && Number.isInteger(used2);
    if (!ok) return { statement: "Un fermier a 120 poules. Il en vend le tiers puis le quart du reste. Combien lui en reste-t-il ?", answer: num(60), hints: H("On travaille en deux étapes.", "Le tiers de 120 est 40.", "Il reste 80 ; le quart de 80 est 20.", "80 − 20."), solution: "120 ÷ 3 = 40 ; reste 80 ; 80 ÷ 4 = 20 ; il reste 80 − 20 = 60." };
    void c;
    return { statement: `${who(r)} a ${f(T)} F. Il en dépense les ${a1}/${d1}, puis les ${a2}/${d2} de ce qui reste. Combien lui reste-t-il (en F) ?`, answer: num(rest - used2), hints: H("On travaille en deux étapes.", `Première dépense : ${a1}/${d1} de ${f(T)}.`, `Ce qui reste : ${f(T)} − ${f(used1)} = ${f(rest)}.`, `Deuxième dépense : ${a2}/${d2} de ${f(rest)}.`), solution: `${f(T)} × ${a1}/${d1} = ${f(used1)} ; reste ${f(rest)} ; ${f(rest)} × ${a2}/${d2} = ${f(used2)} ; il reste ${f(rest)} − ${f(used2)} = ${f(rest - used2)} F.` };
  }, [{ id: "probleme", label: "Problème" }]),

  // ===== Chapitre 12 : Équations, inéquations =====
  mk("eq-additive", "Équations et inéquations dans ℚ", 1, { skill: "Résoudre x + a = b", ref: `${BOOK}, chap. 12 §1.4, ex. 1.b (p. 163-164) et ex. 18 (p. 174)`, kw: ["équation", "x + a = b", "inconnue", "solution"] }, (c, r) => {
    const a = rnd(r) * dec(r, 1, 30, 1), b = rnd(r) * dec(r, 1, 30, 1);
    const x = round(b - a, 4);
    return { statement: c === "pur" ? `Résous l'équation x + ${sg(a)} = ${sg(b)}.` : `Après une variation de ${n2(a)} °C, un thermomètre indique ${n2(b)} °C. Quelle température (en °C) indiquait-il avant ?`, answer: num(x, 0.0001), hints: H("On cherche l'inconnue.", "Pour isoler x, on ajoute l'opposé de a aux deux membres.", `x = ${sg(b)} − ${sg(a)}.`, "Calcule."), solution: `x = ${sg(b)} − ${sg(a)} = ${sg(x)}.` };
  }, SIT),
  mk("eq-multiplicative", "Équations et inéquations dans ℚ", 2, { skill: "Résoudre a x = b", ref: `${BOOK}, chap. 12 §1.5, ex. 1.c (p. 164-165) et ex. 19 (p. 174)`, kw: ["équation", "ax = b", "diviser", "inverse", "solution"] }, (c, r) => {
    const pos = c !== "pur";
    const a = (pos ? 1 : rnd(r)) * int(r, 2, 12), x = (pos ? 1 : rnd(r)) * int(r, 2, 12);
    const b = a * x;
    const A = a < 0 ? `(−${-a})` : String(a), B = b < 0 ? `(−${-b})` : String(b);
    return { statement: pos ? `${a} stylos identiques coûtent ${f(b)} F au total. En notant x le prix d'un stylo, on obtient ${a} x = ${f(b)}. Quel est le prix d'un stylo (en F) ?` : `Résous l'équation ${A} x = ${B}.`, answer: num(x), hints: H("On divise les deux membres par a.", "x = b ÷ a.", `${B} ÷ ${A}.`, "Règle des signes."), solution: `x = ${B} ÷ ${A} = ${x}.` };
  }, SIT),
  mk("eq-axb", "Équations et inéquations dans ℚ", 2, { skill: "Résoudre a x + b = c", ref: `${BOOK}, chap. 12 §1.6, ex. 1.d (p. 166) et ex. 20-22 (p. 174)`, kw: ["équation", "ax + b = c", "premier degré", "isoler x"] }, (c, r) => {
    const pos = c !== "pur";
    const a = int(r, 2, 9), x = (pos ? 1 : rnd(r)) * int(r, 1, 11), b = (pos ? 1 : rnd(r)) * int(r, 1, 20), cc = a * x + b;
    const B = b < 0 ? `(−${-b})` : String(b);
    return { statement: pos ? `Un taxi facture ${b} F de prise en charge et ${a} F par kilomètre. Le compteur affiche ${cc} F. En notant x le nombre de kilomètres, on a ${lin(a, b)} = ${cc}. Combien de kilomètres ont été parcourus ?` : `Résous l'équation ${lin(a, b)} = ${cc}.`, answer: num(x), hints: H("On isole x en deux étapes.", `Retire ${B} des deux membres.`, `${a}x = ${cc} − ${B} = ${cc - b}.`, `Divise par ${a}.`), solution: `${a}x = ${cc} − ${B} = ${cc - b} ; x = ${cc - b} ÷ ${a} = ${x}.` };
  }, SIT),
  mk("eq-deux-membres", "Équations et inéquations dans ℚ", 3, { skill: "Résoudre a x + b = c x + d", ref: `${BOOK}, chap. 12 §1.6, activité et ex. 1.e (p. 166-167) et ex. 21-23 (p. 174)`, kw: ["équation", "ax + b = cx + d", "deux membres", "inconnue des deux côtés"] }, (_c, r) => {
    let a = 0, c = 0;
    do { a = int(r, 2, 9); c = int(r, 1, 8); } while (a === c);
    const x = rnd(r) * int(r, 1, 10), b = rnd(r) * int(r, 1, 15), d = a * x + b - c * x;
    return { statement: `Résous l'équation ${lin(a, b)} = ${lin(c, d)}.`, answer: num(x), hints: H("L'inconnue est dans les deux membres.", `Retire ${c}x des deux membres.`, `${lin(a - c, b)} = ${d}.`, `${lin(a - c, 0)} = ${d - b} ; divise par ${a - c < 0 ? `(−${c - a})` : a - c}.`), solution: `${lin(a, b)} = ${lin(c, d)} ⇒ ${lin(a - c, 0)} = ${d - b} ⇒ x = ${d - b} ÷ ${a - c < 0 ? `(−${c - a})` : a - c} = ${x}.` };
  }, FR),
  mk("eq-mise-en-equation", "Résolution de problèmes", 3, { skill: "Mettre un problème en équation puis le résoudre", ref: `${BOOK}, chap. 14 §3.1 (p. 201-202) et chap. 12, ex. 1-10 (p. 173)`, kw: ["problème", "mise en équation", "inconnue", "choisir l'inconnue"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const x = int(r, 8, 40), d = int(r, 3, 20); return { statement: `Un cahier coûte x F. Trois cahiers et un stylo à ${d} F coûtent ensemble ${3 * x + d} F. L'équation est 3x + ${d} = ${3 * x + d}. Combien coûte un cahier (en F) ?`, answer: num(x), hints: H("L'inconnue x est le prix d'un cahier.", "Retire le prix du stylo.", `3x = ${3 * x + d} − ${d}.`, "Divise par 3."), solution: `3x + ${d} = ${3 * x + d} ⇒ 3x = ${3 * x} ⇒ x = ${x} F.` }; }
    if (t === 1) { const F = int(r, 5, 20), P = F * 3 + int(r, 0, 6); const y = P - 2 * F; return { statement: `Un père a ${P} ans et son fils ${F} ans. Dans y années, le père aura le double de l'âge de son fils : ${P} + y = 2(${F} + y). Résous cette équation : combien vaut y ?`, answer: num(y), hints: H("Dans y années, chacun a y ans de plus.", `Développe : 2(${F} + y) = ${2 * F} + 2y.`, `${P} + y = ${2 * F} + 2y.`, "Isole y."), solution: `${P} + y = ${2 * F} + 2y ⇒ y = ${P} − ${2 * F} = ${y}.` }; }
    const l = int(r, 3, 20), k = int(r, 2, 15), Pm = 2 * (2 * l + k);
    return { statement: `Un rectangle a pour largeur x cm et pour longueur (x + ${k}) cm. Son périmètre est ${Pm} cm : 2(x + x + ${k}) = ${Pm}. Combien vaut x ?`, answer: num(l), hints: H("On écrit le périmètre avec x.", `Divise par 2 : 2x + ${k} = ${Pm / 2}.`, `2x = ${Pm / 2} − ${k}.`, "Divise par 2."), solution: `2x + ${k} = ${Pm / 2} ⇒ 2x = ${2 * l} ⇒ x = ${l} cm.` };
  }, [{ id: "probleme", label: "Problème" }]),
  mk("ineq-regles", "Équations et inéquations dans ℚ", 2, { skill: "Inégalités et opérations : sens de l'inégalité", ref: `${BOOK}, chap. 12 §2.1, propriétés (p. 167-168)`, kw: ["inégalité", "multiplier", "nombre négatif", "sens", "ajouter"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "On a a < b. Que peut-on dire de a + 5 et b + 5 ?", good: "a + 5 < b + 5", bad: ["a + 5 > b + 5", "a + 5 = b + 5", "On ne peut rien dire"], why: "Ajouter un même nombre aux deux membres conserve le sens de l'inégalité." },
      { q: "On a a < b. Que peut-on dire de 4a et 4b ?", good: "4a < 4b", bad: ["4a > 4b", "4a = 4b", "On ne peut rien dire"], why: "Multiplier par un nombre positif conserve le sens de l'inégalité." },
      { q: "On a a < b. Que peut-on dire de −3a et −3b ?", good: "−3a > −3b", bad: ["−3a < −3b", "−3a = −3b", "On ne peut rien dire"], why: "Multiplier par un nombre négatif change le sens de l'inégalité." },
      { q: "On a −1,2 < 5,1. Que donne la multiplication par −4 ?", good: "4,8 > −20,4", bad: ["4,8 < −20,4", "−4,8 > 20,4", "4,8 = −20,4"], why: "(−1,2) × (−4) = 4,8 et 5,1 × (−4) = −20,4 ; le sens change : 4,8 > −20,4." },
      { q: "On a a < b et c < 0. Quelle comparaison est correcte ?", good: "ac > bc", bad: ["ac < bc", "ac = bc", "ac + bc = 0"], why: "Multiplier par un nombre négatif inverse le sens de l'inégalité." },
    ];
    return qcmOf(r, pool, "Regarde le signe du nombre par lequel on multiplie.");
  }, QCM),
  mk("ineq-solutions", "Équations et inéquations dans ℚ", 2, { skill: "Inéquations x + a < b : trouver les solutions", ref: `${BOOK}, chap. 12 §2.4-2.5, ex. 2.b-2.d (p. 170) et ex. 25-30 (p. 175)`, kw: ["inéquation", "solutions", "x < u", "x + a > b", "ensemble des solutions"] }, (_c, r) => {
    const a = int(r, 2, 15), b = rnd(r) * int(r, 1, 20), lt = int(r, 0, 1) === 0;
    const u = b - a;
    const good = lt ? u - int(r, 1, 6) : u + int(r, 1, 6);
    const bads = [lt ? u + int(r, 1, 4) : u - int(r, 1, 4), u, lt ? u + int(r, 5, 9) : u - int(r, 5, 9)];
    const opts = [...new Set([good, ...bads])].map(n2);
    return { statement: `Parmi ces nombres, lequel est solution de l'inéquation x + ${a} ${lt ? "<" : ">"} ${n2(b)} ?`, answer: choice(r, opts, 0), hints: H("On transforme l'inéquation.", `Retire ${a} aux deux membres : x ${lt ? "<" : ">"} ${n2(u)}.`, `Les solutions sont les nombres strictement ${lt ? "plus petits" : "plus grands"} que ${n2(u)}.`, "Teste chaque nombre."), solution: `x + ${a} ${lt ? "<" : ">"} ${n2(b)} ⇔ x ${lt ? "<" : ">"} ${n2(u)}. ${n2(good)} convient ; ${n2(u)} ne convient pas (inégalité stricte).` };
  }, QCM),
  mk("ineq-axb", "Équations et inéquations dans ℚ", 3, { skill: "Résoudre a x < b (sens selon le signe de a)", ref: `${BOOK}, chap. 12 §2.6, ex. 2.e-2.f (p. 171) et ex. 31-35 (p. 175)`, kw: ["inéquation", "ax < b", "nombre négatif", "sens", "solutions"] }, (_c, r) => {
    const a = rnd(r) * int(r, 2, 9), b = rnd(r) * int(r, 1, 30);
    const lt = int(r, 0, 1) === 0;
    // a x < b : si a>0 : x < b/a ; si a<0 : x > b/a
    const sym = lt ? "<" : ">";
    const flip = a < 0;
    const out = flip ? (lt ? ">" : "<") : sym;
    const val = fz(b, a);
    const good = `x ${out} ${val}`;
    const other = `x ${out === "<" ? ">" : "<"} ${val}`;
    return { statement: `Résous l'inéquation ${a < 0 ? `(−${-a})` : a} x ${sym} ${b < 0 ? `(−${-b})` : b}. Quelle est la bonne écriture des solutions ?`, answer: choice(r, [good, other], 0), hints: H("On divise les deux membres par a.", flip ? "a est négatif : le sens de l'inégalité change." : "a est positif : le sens ne change pas.", `Divise ${b} par ${a}.`, `${b} ÷ ${a} = ${val}.`), solution: `${a < 0 ? `(−${-a})` : a} x ${sym} ${b < 0 ? `(−${-b})` : b} ⇔ x ${out} ${val}${flip ? " (on divise par un nombre négatif : le sens change)" : ""}.` };
  }, QCM),

  // ===== Chapitre 13 : Approximations décimales =====
  mk("approx-puissances10", "Approximations décimales d'un nombre", 2, { skill: "Puissances de 10 et notation scientifique", ref: `${BOOK}, chap. 13 §1-2, ex. 2.a-2.i (p. 178-183) et ex. 1-23 (p. 190-191)`, kw: ["puissance de 10", "notation scientifique", "a × 10^p", "10⁻³"] }, (_c, r) => {
    const t = int(r, 0, 3);
    if (t === 0) { const p = int(r, 2, 9); return { statement: `Écris 0,${"0".repeat(p - 1)}1 sous la forme 10^p. Quelle est la valeur de p ?`, answer: num(-p), hints: H("Compte les décimales.", "10⁻ⁿ = 1/10ⁿ = 0,00…1 avec n chiffres après la virgule.", `Il y a ${p} chiffres après la virgule.`, "L'exposant est négatif."), solution: `0,${"0".repeat(p - 1)}1 = 10⁻${sup(p)} : p = ${-p}.` }; }
    if (t === 1) { const m = dec(r, 1, 9, 1), p = int(r, 2, 9); const N = Math.round(m * 10) * 10 ** (p - 1); return { statement: `Écris ${f(N)} en notation scientifique a × 10^p avec 1 ≤ a < 10. Quelle est la valeur de p ?`, answer: num(p), hints: H("La notation scientifique place un seul chiffre non nul avant la virgule.", "Compte de combien de rangs on déplace la virgule.", `${f(N)} = ${fr(m)} × 10^p.`, "Compte les rangs."), solution: `${f(N)} = ${fr(m)} × 10${sup(p)} : p = ${p}.` }; }
    if (t === 2) { const m = int(r, 1, 9), p = int(r, 2, 8); return { statement: `Écris ${m} × 10⁻${sup(p)} en écriture décimale. Combien de chiffres y a-t-il après la virgule ?`, answer: num(p), hints: H("Multiplier par 10⁻ᵖ décale la virgule de p rangs vers la gauche.", `${m} a la virgule juste après le chiffre ${m}.`, `On décale de ${p} rangs.`, `Le dernier chiffre est ${m}.`), solution: `${m} × 10⁻${sup(p)} = 0,${"0".repeat(p - 1)}${m} : ${p} chiffres après la virgule.` }; }
    const a = dec(r, 1, 9, 1), b = int(r, 2, 9), p = int(r, 2, 5), q = int(r, 2, 5);
    return { statement: `Calcule (${fr(a)} × 10${sup(p)}) × (${b} × 10${sup(q)}) et donne le coefficient devant 10${sup(p + q)}.`, answer: num(round(a * b, 3), 0.001), hints: H("On multiplie les coefficients et on additionne les exposants.", "(a × 10ᵖ)(b × 10ᵠ) = (a × b) × 10ᵖ⁺ᵠ.", `${fr(a)} × ${b}.`, "Calcule."), solution: `(${fr(a)} × ${b}) × 10${sup(p + q)} = ${fr(round(a * b, 3))} × 10${sup(p + q)}.` };
  }, FR),
  mk("approx-troncature", "Approximations décimales d'un nombre", 2, { skill: "Troncature, approximation par défaut et par excès, arrondi d'ordre n", ref: `${BOOK}, chap. 13 §3, ex. 3.a-3.e (p. 185-189) et ex. 24-27 (p. 191)`, kw: ["troncature", "arrondi", "approximation décimale", "par défaut", "par excès", "ordre n"] }, (_c, r) => {
    const a = int(r, 1, 30), b = pick(r, [3, 6, 7, 9, 11, 13]);
    const v = a / b;
    if (Number.isInteger(v)) return { statement: "Quel est l'arrondi d'ordre 1 de 22/7 ?", answer: num(3.1), hints: H("22 ÷ 7 = 3,142857…", "Regarde le 2ᵉ chiffre après la virgule.", "4 : on arrondit par défaut.", "3,1."), solution: "22/7 = 3,14… ; le 2ᵉ chiffre est 4 : arrondi d'ordre 1 = 3,1." };
    const n = int(r, 1, 3);
    const t = 10 ** n;
    const def = Math.floor(v * t) / t, exc = round(def + 1 / t, n);
    const next = Math.floor(v * t * 10) % 10;
    const kind = int(r, 0, 2);
    const kindTxt = ["l'approximation décimale d'ordre " + n + " par défaut", "l'approximation décimale d'ordre " + n + " par excès", "l'arrondi d'ordre " + n];
    const ans = kind === 0 ? def : kind === 1 ? exc : next >= 5 ? exc : def;
    return { statement: `Donne ${kindTxt[kind]} de ${a}/${b}.`, answer: num(round(ans, n), 0.0000001), hints: H("On calcule la division de " + a + " par " + b + ".", `${a} ÷ ${b} = ${fr(round(v, 7))}…`, kind === 2 ? `Regarde le chiffre de rang ${n + 1} : ${next}. S'il est 5 ou plus, on prend l'approximation par excès.` : "Par défaut : on garde les n premiers chiffres après la virgule ; par excès : on ajoute 1 au dernier chiffre.", `Par défaut : ${fr(def)} ; par excès : ${fr(exc)}.`), solution: `${a} ÷ ${b} = ${fr(round(v, 7))}… Par défaut : ${fr(def)} ; par excès : ${fr(exc)} ; ${kind === 2 ? `chiffre suivant ${next} → arrondi ${fr(round(ans, n))}` : `réponse ${fr(round(ans, n))}`}.` };
  }, FR),

  // ===== Chapitre 14 : Résolution de problèmes =====
  mk("prob-denombrement", "Résolution de problèmes", 2, { skill: "Dénombrement : arbres de choix et produits", ref: `${BOOK}, chap. 14 §1 (p. 194-196)`, kw: ["dénombrement", "arbre de choix", "mots", "combinaisons", "produit"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const n = int(r, 3, 6), k = int(r, 2, 3); let v = 1; for (let i = 0; i < k; i++) v *= n - i; return { statement: `On dispose de ${n} cartes portant des lettres différentes. Combien de mots de ${k} lettres (ayant un sens ou non) peut-on former en utilisant ${k} de ces cartes, sans en utiliser deux fois la même ?`, answer: num(v), hints: H("On choisit les lettres l'une après l'autre.", `Pour la première lettre : ${n} choix.`, `Pour la suivante : ${n - 1} choix${k === 3 ? `, puis ${n - 2}` : ""}.`, "Multiplie les nombres de choix."), solution: `${Array.from({ length: k }, (_, i) => n - i).join(" × ")} = ${v}.` }; }
    if (t === 1) { const a = int(r, 2, 6), b = int(r, 2, 6), c = int(r, 2, 4); return { statement: `Un menu propose ${a} entrées, ${b} plats et ${c} desserts. Combien de repas différents peut-on composer en prenant une entrée, un plat et un dessert ?`, answer: num(a * b * c), hints: H("On choisit une entrée, puis un plat, puis un dessert.", "Chaque choix multiplie le nombre de possibilités.", `${a} × ${b}.`, `${a * b} × ${c}.`), solution: `${a} × ${b} × ${c} = ${a * b * c}.` }; }
    const n = int(r, 3, 8); return { statement: `Dans un tournoi, ${n} équipes jouent chacune une fois contre chacune des autres. Combien de matchs sont joués ?`, answer: num((n * (n - 1)) / 2), hints: H("Chaque équipe joue contre les autres.", `${n} équipes, chacune joue ${n - 1} matchs.`, "Chaque match est compté deux fois.", `${n} × ${n - 1} ÷ 2.`), solution: `${n} × ${n - 1} ÷ 2 = ${(n * (n - 1)) / 2}.` };
  }, [{ id: "denombrement", label: "Dénombrement" }]),
  mk("prob-proportionnalite", "Résolution de problèmes", 2, { skill: "Problèmes de proportionnalité : rapports d'agrandissement et de réduction", ref: `${BOOK}, chap. 14 §2 (p. 197-200)`, kw: ["proportionnalité", "agrandissement", "réduction", "rapport", "pourcentage"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const W = pick(r, [20, 24, 30, 40]), k = pick(r, [50, 60, 75, 80, 120, 150]); const v = (W * k) / 100; return { statement: `Une photocopieuse réduit un document avec un rapport de ${k} %. Une largeur de ${W} cm devient quelle largeur (en cm) ?`, answer: num(v, 0.0001), hints: H("Un rapport de k % multiplie les longueurs par k/100.", `${k} % = ${fr(k / 100)}.`, `${W} × ${fr(k / 100)}.`, "Calcule."), solution: `${W} × ${k} ÷ 100 = ${fr(v)} cm.` }; }
    if (t === 1) { const k = pick(r, [2, 3, 4]); return { statement: `Les longueurs d'un document sont multipliées par ${k}. Par combien l'aire est-elle multipliée ?`, answer: num(k * k), hints: H("L'aire dépend de deux longueurs.", `Chaque longueur est multipliée par ${k}.`, "Une aire est un produit de deux longueurs.", `${k} × ${k}.`), solution: `Aire × (${k} × ${k}) = × ${k * k}.` }; }
    const k = pick(r, [20, 25, 50]); const A = pick(r, [200, 400, 800]); return { statement: `Une formule d'aire de document est réduite : l'aire est diminuée de ${k} %. Si l'aire de départ est ${A} cm², quelle est la nouvelle aire (en cm²) ?`, answer: num(A - (A * k) / 100), hints: H("Diminuer de k %, c'est enlever k % de l'aire.", `${k} % de ${A} = ${(A * k) / 100}.`, "Soustrais.", `${A} − ${(A * k) / 100}.`), solution: `${k} % de ${A} = ${(A * k) / 100} ; ${A} − ${(A * k) / 100} = ${A - (A * k) / 100} cm².` };
  }, [{ id: "propor", label: "Proportionnalité" }]),

  // ===== Chapitre 15 : Statistiques =====
  mk("stat-frequence", "Statistique", 2, { skill: "Effectif, fréquence, pourcentage d'une modalité", ref: `${BOOK}, chap. 15 §1, ex. 1.e-1.g (p. 213-214) et ex. 1-7 (p. 219)`, kw: ["fréquence", "effectif", "modalité", "pourcentage", "tableau"] }, (c, r) => {
    const tot = pick(r, [20, 25, 40, 50, 60, 80, 100, 200]);
    const part = int(r, 1, tot - 1);
    const t = int(r, 0, 2);
    if (t === 0) { const pc = round((part / tot) * 100, 2); return { statement: c === "pur" ? `Dans une enquête sur ${tot} personnes, ${part} choisissent une modalité. Quelle est sa fréquence en pourcentage (en %) ?` : `Dans une classe de ${tot} élèves, ${part} aiment le football. Quel pourcentage d'élèves cela représente-t-il (en %) ?`, answer: num(pc, 0.01), hints: H("La fréquence est le quotient de l'effectif de la modalité par l'effectif total.", `${part} ÷ ${tot}.`, "Multiplie par 100 pour obtenir un pourcentage.", "Arrondis si besoin."), solution: `${part} ÷ ${tot} × 100 = ${fr(pc)} %.` }; }
    if (t === 1) { const p = pick(r, [10, 20, 25, 40, 50, 5]); const eff = (tot * p) / 100; if (!Number.isInteger(eff)) return { statement: "Dans une classe de 40 élèves, 25 % mesurent 1,52 m. Combien d'élèves mesurent 1,52 m ?", answer: num(10), hints: H("25 % de 40.", "40 ÷ 4.", "10.", "10."), solution: "40 × 25 ÷ 100 = 10." }; return { statement: `Dans une classe de ${tot} élèves, la fréquence de la modalité « 1,52 m » est de ${p} %. Combien d'élèves mesurent 1,52 m ?`, answer: num(eff), hints: H("Effectif = fréquence × effectif total.", `${p} % de ${tot}.`, `${tot} × ${p} ÷ 100.`, "Calcule."), solution: `${tot} × ${p} ÷ 100 = ${eff}.` }; }
    const e1 = int(r, 1, 20), e2 = int(r, 1, 20), e3 = int(r, 1, 20), T = e1 + e2 + e3;
    return { statement: `Un tableau donne les effectifs ${e1}, ${e2} et ${e3} pour trois modalités. Quel est l'effectif total ?`, answer: num(T), hints: H("L'effectif total est la somme des effectifs.", `${e1} + ${e2} + ${e3}.`, "Additionne.", "La somme des fréquences vaut 1."), solution: `${e1} + ${e2} + ${e3} = ${T}.` };
  }, SIT),
  mk("stat-moyenne", "Statistique", 2, { skill: "Moyenne d'une série statistique (tableau d'effectifs)", ref: `${BOOK}, chap. 15 §2, ex. 2.a-2.b (p. 214-215) et ex. 8-12 (p. 219-220)`, kw: ["moyenne", "effectif", "tableau", "produit modalité par effectif"] }, (c, r) => {
    const vals = [4, 5, 6, 7, 8].map((v, i) => v + i + int(r, 0, 1));
    const effs = vals.map(() => int(r, 1, 8));
    const S = vals.reduce((s, v, i) => s + v * effs[i], 0), T = effs.reduce((s, e) => s + e, 0);
    const mean = round(S / T, 2);
    return { statement: c === "pur" ? `Valeurs : ${vals.join(", ")} ; effectifs respectifs : ${effs.join(", ")}. Calcule la moyenne (arrondie au centième).` : `Dans une classe, ${effs.join(", ")} élèves ont respectivement les notes ${vals.join(", ")}. Quelle est la moyenne de la classe (arrondie au centième) ?`, answer: num(mean, 0.01), hints: H("Moyenne = somme des (valeur × effectif) ÷ effectif total.", `Effectif total : ${effs.join(" + ")} = ${T}.`, `Somme : ${vals.map((v, i) => `${v}×${effs[i]}`).join(" + ")} = ${S}.`, `${S} ÷ ${T}.`), solution: `Somme des produits = ${S} ; effectif total = ${T} ; moyenne = ${S} ÷ ${T} ≈ ${fr(mean)}.` };
  }, SIT),
  mk("stat-diagramme", "Statistique", 2, { skill: "Diagramme semi-circulaire : angle au centre proportionnel à l'effectif", ref: `${BOOK}, chap. 15 §3.1, ex. 3.a-3.b (p. 216) et ex. 11, 13-14 (p. 220)`, kw: ["diagramme semi-circulaire", "angle au centre", "proportionnel", "180°"] }, (_c, r) => {
    const tot = pick(r, [30, 36, 45, 60, 90, 180]), part = int(r, 1, tot - 1);
    const ang = round((part * 180) / tot, 2);
    return { statement: `Dans un diagramme semi-circulaire (180° pour l'effectif total ${tot}), quel angle au centre représente un effectif de ${part} (en °) ?`, answer: num(ang, 0.01, "°"), hints: H("L'angle est proportionnel à l'effectif.", `L'effectif total ${tot} correspond à 180°.`, `Coefficient : 180 ÷ ${tot}.`, `${part} × 180 ÷ ${tot}.`), solution: `${part} × 180 ÷ ${tot} = ${fr(ang)}°.` };
  }, [{ id: "diagramme", label: "Diagramme" }]),
);
void shuffle;
