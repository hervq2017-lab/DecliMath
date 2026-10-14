// CIAM 3ème : activités numériques (chap. 10 à 16). Énoncés originaux, réponses calculées par le code.
import { choice, fr, gcd, int, num, pick, register, round, Rng } from "./core";
import { ciam, f, H, Item, qcmOf, QCM, sup, withWrong } from "./ciam-kit";

const mk = ciam("3e", "ciam3");
const BOOK = "CIAM 3ème";
const rnd = (r: Rng) => (int(r, 0, 1) === 0 ? -1 : 1);
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const FR = [{ id: "calcul", label: "Calcul" }];
const SIT = [{ id: "pur", label: "Calcul direct" }, { id: "situation", label: "En situation" }];
/** Terme ax + b écrit proprement. */
const lin = (a: number, b: number, v = "x") => {
  const t1 = a === 0 ? "" : a === 1 ? v : a === -1 ? `−${v}` : `${a < 0 ? "−" : ""}${Math.abs(a)}${v}`;
  if (b === 0) return t1 || "0";
  return t1 ? `${t1} ${b < 0 ? "−" : "+"} ${Math.abs(b)}` : `${b < 0 ? "−" : ""}${Math.abs(b)}`;
};
/** Terme c·x^e écrit proprement (sans coefficient 1, avec signe). */
const term = (c: number, e: number, first = false) => {
  const body = e === 0 ? String(Math.abs(c)) : `${Math.abs(c) === 1 ? "" : Math.abs(c)}x${e === 1 ? "" : sup(e)}`;
  return first ? `${c < 0 ? "−" : ""}${body}` : ` ${c < 0 ? "−" : "+"} ${body}`;
};
/** n = k²·m avec m sans facteur carré. */
const sqrtParts = (n: number): [number, number] => {
  let k = 1, m = n;
  for (let d = 2; d * d <= m; d++) while (m % (d * d) === 0) { m /= d * d; k *= d; }
  return [k, m];
};
const rad = (k: number, m: number) => (m === 1 ? String(k) : k === 1 ? `√${m}` : `${k}√${m}`);

register(
  // ===== Chapitre 10 : Calcul littéral =====
  mk("lit-exposant-negatif", "Calcul littéral", 2, { skill: "Puissances d'exposant entier relatif", ref: `${BOOK}, chap. 10 §2.1, ex. 2.a et ex. 3 (p. 122, 128)`, kw: ["exposant négatif", "a⁻ⁿ", "inverse", "puissance", "écrire plus simplement"] }, (_c, r) => {
    const a = pick(r, [2, 3, 5, 10]), m = int(r, 1, 6), n = int(r, 1, 6);
    const t = int(r, 0, 3);
    if (t === 0) return { statement: `Écris ${a}${sup(m)} × ${a}⁻${sup(n)} sous la forme ${a}^p. Quelle est la valeur de p ?`, answer: num(m - n), hints: H("Même base : on additionne les exposants.", "aᵐ × aⁿ = aᵐ⁺ⁿ, même avec un exposant négatif.", `${m} + (−${n}).`, "Calcule."), solution: `${a}${sup(m)} × ${a}⁻${sup(n)} = ${a}^(${m} − ${n}) : p = ${m - n}.` };
    if (t === 1) return { statement: `Écris (${a}⁻${sup(m)})⁻${sup(n)} sous la forme ${a}^p. Quelle est la valeur de p ?`, answer: num(m * n), hints: H("(aᵐ)ⁿ = aᵐ×ⁿ.", `(−${m}) × (−${n}).`, "Le produit de deux négatifs est positif.", "Calcule."), solution: `(${a}⁻${sup(m)})⁻${sup(n)} = ${a}${sup(m * n)} : p = ${m * n}.` };
    if (t === 2) return { statement: `Écris ${a}${sup(m)} ÷ ${a}${sup(n + m)} sous la forme ${a}^p. Quelle est la valeur de p ?`, answer: num(-n), hints: H("aᵐ ÷ aⁿ = aᵐ⁻ⁿ.", `${m} − ${n + m}.`, "Le résultat est négatif.", "Calcule."), solution: `${a}${sup(m)} ÷ ${a}${sup(n + m)} = ${a}^(${m} − ${n + m}) : p = ${-n}.` };
    const v = 1 / a ** m;
    return { statement: `Quelle est la valeur de ${a}⁻${sup(m)} ?`, answer: choice(r, [`1/${a ** m}`, `−${a ** m}`, `−1/${a ** m}`, `${a ** m}`], 0), hints: H("a⁻ⁿ est l'inverse de aⁿ.", "a⁻ⁿ = 1/aⁿ.", `${a}${sup(m)} = ${a ** m}.`, "Prends l'inverse."), solution: `${a}⁻${sup(m)} = 1/${a}${sup(m)} = 1/${a ** m} (≈ ${fr(round(v, 6))}).` };
  }, FR),
  mk("lit-factoriser", "Calcul littéral", 3, { skill: "Factoriser : facteur commun et identités remarquables", ref: `${BOOK}, chap. 10 §2.3, ex. 2.c (p. 124) et ex. 7-9 (p. 128)`, kw: ["factoriser", "facteur commun", "identité remarquable", "a²−b²", "(a+b)²"] }, (_c, r) => {
    const a = int(r, 2, 9), b = int(r, 1, 9);
    const t = int(r, 0, 2);
    if (t === 0) { const good = `${a}x (x + ${b})`; const wrong = withWrong(good, [`x (${a}x + ${b})`, `${a} (x² + ${b}x)`, `${a}x (x + ${a * b})`, `(${a}x + ${b})x`]); return { statement: `Factorise ${a}x² + ${a * b}x en mettant un facteur commun en évidence.`, answer: choice(r, [good, ...wrong], 0), hints: H("On cherche le plus grand facteur commun.", `Les deux termes contiennent ${a} et x.`, `${a}x² = ${a}x × x et ${a * b}x = ${a}x × ${b}.`, "Mets-le en facteur."), solution: `${a}x² + ${a * b}x = ${a}x × x + ${a}x × ${b} = ${good}.` }; }
    if (t === 1) { const k = int(r, 2, 9); const good = `(x − ${k})(x + ${k})`; const wrong = withWrong(good, [`(x − ${k})²`, `(x + ${k})²`, `(x − ${k * k})(x + 1)`, `x(x − ${k})`]); return { statement: `Factorise x² − ${k * k}.`, answer: choice(r, [good, ...wrong], 0), hints: H("On reconnaît une différence de deux carrés.", "a² − b² = (a − b)(a + b).", `${k * k} = ${k}².`, "Applique la formule."), solution: `x² − ${k * k} = x² − ${k}² = ${good}.` }; }
    const good = `(x + ${b})²`; const wrong = withWrong(good, [`(x − ${b})²`, `(x + ${b * b})²`, `(x + ${b})(x − ${b})`, `x(x + ${2 * b})`]);
    return { statement: `Factorise x² + ${2 * b}x + ${b * b}.`, answer: choice(r, [good, ...wrong], 0), hints: H("On reconnaît le développement d'un carré.", "a² + 2ab + b² = (a + b)².", `${b * b} = ${b}² et ${2 * b}x = 2 × x × ${b}.`, "Écris le carré."), solution: `x² + ${2 * b}x + ${b * b} = (x + ${b})².` };
  }, QCM),
  mk("lit-developper", "Calcul littéral", 3, { skill: "Développer et réduire (a x + b)(c x + d)", ref: `${BOOK}, chap. 10 §2.2, ex. 2.b (p. 123) et ex. 4-6 (p. 128)`, kw: ["développer", "réduire", "double distributivité", "polynôme"] }, (_c, r) => {
    const a = int(r, 1, 6), b = rnd(r) * int(r, 1, 8), c = int(r, 1, 6), d = rnd(r) * int(r, 1, 8);
    const A = a * c, B = a * d + b * c, C = b * d;
    const pos = int(r, 0, 2);
    const ask = ["x²", "x", "constant"][pos], v = [A, B, C][pos];
    return { statement: `On développe et on réduit (${lin(a, b)})(${lin(c, d)}). Quel est ${pos === 2 ? "le terme constant" : `le coefficient de ${ask}`} du résultat ?`, answer: num(v), hints: H("On applique la double distributivité.", "(a + b)(c + d) = ac + ad + bc + bd.", `Termes en x : ${a}x × ${par(d)} et ${par(b)} × ${c}x.`, "Additionne les termes de même nature."), solution: `(${lin(a, b)})(${lin(c, d)}) = ${lin(A, 0, "x²")} ${B < 0 ? "−" : "+"} ${Math.abs(B)}x ${C < 0 ? "−" : "+"} ${Math.abs(C)}. Réponse : ${v}.` };
  }, FR),
  mk("lit-produit-nul", "Calcul littéral", 3, { skill: "Équation produit nul (a x + b)(c x + d) = 0", ref: `${BOOK}, chap. 10 §2.4, propriétés (p. 125) et ex. 26 (p. 139)`, kw: ["produit nul", "A × B = 0", "équation produit", "solutions"] }, (_c, r) => {
    const a = int(r, 1, 4), p = rnd(r) * int(r, 1, 9), c = int(r, 1, 4), q = rnd(r) * int(r, 1, 9);
    // (a x - a p)(c x - c q) = 0 → solutions p, q
    if (p === q) return { statement: "Résous (x − 3)(x + 5) = 0. Quelle est la plus grande solution ?", answer: num(3), hints: H("Un produit est nul si l'un des facteurs est nul.", "x − 3 = 0 ou x + 5 = 0.", "x = 3 ou x = −5.", "La plus grande est 3."), solution: "x = 3 ou x = −5 : la plus grande est 3." };
    const s1 = p, s2 = q;
    const big = Math.max(s1, s2), small = Math.min(s1, s2);
    const wantBig = int(r, 0, 1) === 0;
    return { statement: `Résous l'équation (${lin(a, -a * p)})(${lin(c, -c * q)}) = 0. Quelle est la ${wantBig ? "plus grande" : "plus petite"} solution ?`, answer: num(wantBig ? big : small), hints: H("Un produit est nul si l'un au moins de ses facteurs est nul.", `${lin(a, -a * p)} = 0 ou ${lin(c, -c * q)} = 0.`, `x = ${n2(s1)} ou x = ${n2(s2)}.`, "Compare les deux solutions."), solution: `${lin(a, -a * p)} = 0 ⇔ x = ${n2(s1)} ; ${lin(c, -c * q)} = 0 ⇔ x = ${n2(s2)}. La ${wantBig ? "plus grande" : "plus petite"} est ${n2(wantBig ? big : small)}.` };
  }, FR),
  mk("lit-meme-carre", "Calcul littéral", 3, { skill: "Nombres de même carré : x² = a²", ref: `${BOOK}, chap. 10 §2.4, propriétés (p. 125) et ex. 26-27 (p. 139)`, kw: ["même carré", "x² = a²", "a et −a", "racine"] }, (_c, r) => {
    const a = int(r, 2, 15);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Combien de nombres réels x vérifient x² = ${a * a} ?`, answer: num(2), hints: H("Deux nombres opposés ont le même carré.", `Les seuls nombres dont le carré est ${a * a} sont ${a} et −${a}.`, "Il y en a deux.", "Compte."), solution: `x² = ${a}² ⇔ x = ${a} ou x = −${a} : 2 solutions.` };
    if (t === 1) return { statement: `Quelle est la solution positive de l'équation x² = ${a * a} ?`, answer: num(a), hints: H("Si a² = b² et si a et b sont positifs, alors a = b.", `${a * a} = ${a}².`, "Prends la solution positive.", "Racine carrée."), solution: `x² = ${a}² ⇔ x = ${a} ou x = −${a} ; la solution positive est ${a}.` };
    return { statement: `Combien de nombres réels x vérifient x² = −${a} ?`, answer: num(0), hints: H("Un carré est toujours positif ou nul.", "x² ≥ 0 pour tout réel x.", `−${a} est négatif.`, "Aucune solution."), solution: `Un carré ne peut pas être négatif : aucune solution (0).` };
  }, FR),
  mk("lit-condition", "Calcul littéral", 3, { skill: "Fractions rationnelles : condition d'existence et valeur numérique", ref: `${BOOK}, chap. 10 §3.2, ex. 3.a-3.b (p. 126-127) et ex. 14 (p. 129)`, kw: ["fraction rationnelle", "condition d'existence", "dénominateur nul", "valeur interdite"] }, (_c, r) => {
    const a = int(r, 1, 9), b = int(r, 1, 9);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `La fraction (x + ${b}) / (x − ${a}) n'a pas de valeur numérique pour une seule valeur de x. Laquelle ?`, answer: num(a), hints: H("Le dénominateur ne peut pas être nul.", `x − ${a} = 0.`, "Résous cette équation.", `x = ${a}.`), solution: `x − ${a} = 0 ⇔ x = ${a} : la valeur interdite est ${a}.` };
    const x = int(r, 2, 9) + a;
    return { statement: `Calcule la valeur numérique de (x + ${b}) / (x − ${a}) pour x = ${x}. Donne le résultat sous forme décimale (arrondi au centième).`, answer: num(round((x + b) / (x - a), 2), 0.01), hints: H("On remplace x par sa valeur.", `Numérateur : ${x} + ${b} = ${x + b}.`, `Dénominateur : ${x} − ${a} = ${x - a}.`, "Divise."), solution: `(${x} + ${b}) / (${x} − ${a}) = ${x + b} / ${x - a} ≈ ${fr(round((x + b) / (x - a), 2))}.` };
  }, FR),
  mk("lit-polynome", "Calcul littéral", 2, { skill: "Polynômes : degré, coefficient, valeur numérique", ref: `${BOOK}, chap. 10 §3.1, ex. 3.a-3.b (p. 126) et ex. 11-13 (p. 129)`, kw: ["polynôme", "degré", "monôme", "coefficient", "valeur numérique"] }, (_c, r) => {
    const a = rnd(r) * int(r, 2, 9), b = rnd(r) * int(r, 2, 9), c = rnd(r) * int(r, 1, 9), x = rnd(r) * int(r, 1, 4);
    const t = int(r, 0, 1);
    if (t === 0) { const d = int(r, 3, 9); return { statement: `Quel est le degré du polynôme ${term(a, d, true)}${term(b, 1)}${term(c, 0)} ?`, answer: num(d), hints: H("Le degré est le plus grand exposant de x.", "On regarde chaque monôme.", `Le monôme de plus haut degré est ${term(a, d, true)}.`, "Lis l'exposant."), solution: `Le plus grand exposant de x est ${d} : degré ${d}.` }; }
    const v = a * x * x + b * x + c;
    return { statement: `Calcule la valeur numérique de ${term(a, 2, true)}${term(b, 1)}${term(c, 0)} pour x = ${par(x)}.`, answer: num(v), hints: H("On remplace x par sa valeur.", "Le carré est prioritaire.", `x² = ${x * x}.`, "Calcule chaque terme."), solution: `${a} × ${x * x} ${b * x < 0 ? "−" : "+"} ${Math.abs(b * x)} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${v}.` };
  }, FR),

  // ===== Chapitre 11 : Racines carrées =====
  mk("rac-definition", "Racines carrées", 1, { skill: "Racine carrée : définition et valeurs", ref: `${BOOK}, chap. 11 §1, ex. 1 et 2 (p. 138)`, kw: ["racine carrée", "carré parfait", "√", "calculer"] }, (_c, r) => {
    const a = int(r, 2, 20);
    const t = int(r, 0, 3);
    if (t === 0) return { statement: `Calcule √${a * a}.`, answer: num(a), hints: H("La racine carrée de a est le nombre positif dont le carré est a.", `${a} × ${a} = ${a * a}.`, "Le résultat est positif.", `${a}.`), solution: `√${a * a} = ${a} car ${a}² = ${a * a}.` };
    if (t === 1) return { statement: `Calcule (√${a})².`, answer: num(a), hints: H("(√a)² = a pour a ≥ 0.", "Le carré « défait » la racine.", `(√${a})² = ${a}.`, "Recopie."), solution: `(√${a})² = ${a}.` };
    if (t === 2) return { statement: `Calcule √(${-a} )².`.replace("√(", "√((").replace(" )²", ")²)").replace(`√((${-a})²)`, `√((−${a})²)`), answer: num(a), hints: H("√(a²) = |a|.", "La racine carrée est toujours positive.", `(−${a})² = ${a * a}.`, `√${a * a} = ${a}.`), solution: `√((−${a})²) = √${a * a} = ${a}.` };
    const d = pick(r, [0.01, 0.04, 0.09, 0.25, 0.49, 1.21, 1.44, 1.69, 2.25]);
    return { statement: `Calcule √${fr(d)}.`, answer: num(round(Math.sqrt(d), 4), 0.0001), hints: H("On cherche un décimal dont le carré est " + fr(d) + ".", "Pense à un décimal avec un chiffre après la virgule.", `${fr(round(Math.sqrt(d), 4))} × ${fr(round(Math.sqrt(d), 4))}.`, "Vérifie."), solution: `√${fr(d)} = ${fr(round(Math.sqrt(d), 4))} car ${fr(round(Math.sqrt(d), 4))}² = ${fr(d)}.` };
  }, FR),
  mk("rac-simplifier", "Racines carrées", 2, { skill: "Écrire √n sous la forme a√b", ref: `${BOOK}, chap. 11 §2.2, ex. 2.d (p. 135) et ex. 10 (p. 138)`, kw: ["simplifier", "a√b", "racine carrée", "carré parfait", "produit"] }, (c, r) => {
    const k = int(r, 2, 9), m = pick(r, [2, 3, 5, 6, 7, 10, 11]);
    const n = k * k * m;
    void c;
    const askK = int(r, 0, 1) === 0;
    return { statement: `On écrit √${n} sous la forme a√b avec b le plus petit entier possible. Quelle est la valeur de ${askK ? "a" : "b"} ?`, answer: num(askK ? k : m), hints: H("On cherche le plus grand carré parfait qui divise " + n + ".", `${n} = ${k * k} × ${m}.`, `√(${k * k} × ${m}) = √${k * k} × √${m}.`, `√${k * k} = ${k}.`), solution: `√${n} = √(${k * k} × ${m}) = ${k}√${m} : a = ${k}, b = ${m}.` };
  }, FR),
  mk("rac-produit-quotient", "Racines carrées", 2, { skill: "Racine d'un produit ou d'un quotient", ref: `${BOOK}, chap. 11 §2.2, propriétés (p. 134) et ex. 2.a-2.c (p. 135)`, kw: ["√a×√b", "√(a/b)", "produit", "quotient", "racine carrée"] }, (_c, r) => {
    const a = int(r, 2, 9), b = int(r, 2, 9);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Calcule √${a * a} × √${b * b}.`, answer: num(a * b), hints: H("√a × √b = √(a × b).", `√${a * a} = ${a} et √${b * b} = ${b}.`, `${a} × ${b}.`, "Calcule."), solution: `√${a * a} × √${b * b} = ${a} × ${b} = ${a * b}.` };
    if (t === 1) return { statement: `Calcule √${a} × √${a * 9}. Donne un entier.`, answer: num(3 * a), hints: H("√a × √b = √(a × b).", `${a} × ${a * 9} = ${a * a * 9}.`, `√${a * a * 9} = ${3 * a}.`, "Calcule."), solution: `√${a} × √${a * 9} = √(${a} × ${a * 9}) = √${a * a * 9} = ${3 * a}.` };
    return { statement: `Calcule √${a * a * b * b} ÷ √${b * b}.`, answer: num(a), hints: H("√a ÷ √b = √(a/b).", `${a * a * b * b} ÷ ${b * b} = ${a * a}.`, `√${a * a} = ${a}.`, "Calcule."), solution: `√${a * a * b * b} ÷ √${b * b} = √${a * a} = ${a}.` };
  }, FR),
  mk("rac-somme", "Racines carrées", 3, { skill: "Réduire une somme de racines carrées", ref: `${BOOK}, chap. 11 §3.1, ex. 3.a (p. 136) et ex. 20-22 (p. 139)`, kw: ["somme de racines", "réduire", "a√b", "simplifier"] }, (_c, r) => {
    const m = pick(r, [2, 3, 5, 6, 7]);
    const a = int(r, 2, 6), b = int(r, 2, 6), c = int(r, 2, 6);
    const s = a + b - c; // a√m + b√m − c√m
    return { statement: `Réduis ${rad(a, m)} + ${rad(b, m)} − ${rad(c, m)}. Quel est le coefficient de √${m} dans le résultat ?`, answer: num(a + b - c), hints: H("Les racines identiques se regroupent comme des termes en x.", `On factorise √${m}.`, `(${a} + ${b} − ${c})√${m}.`, "Calcule."), solution: `${rad(a, m)} + ${rad(b, m)} − ${rad(c, m)} = (${a} + ${b} − ${c})√${m} = ${rad(s, m)}.` };
  }, FR),
  mk("rac-somme-simplifier", "Racines carrées", 3, { skill: "Simplifier d'abord, puis réduire (√8 + √18 …)", ref: `${BOOK}, chap. 11 §3.1, ex. 3.a et ex. 10-11, 20 (p. 136-139)`, kw: ["simplifier", "somme de racines", "racine carrée", "réduire"] }, (_c, r) => {
    const m = pick(r, [2, 3, 5]);
    let k1 = int(r, 2, 6), k2 = int(r, 2, 6);
    if (k1 === k2) k2 = k1 + 1;
    const total = k1 + k2;
    return { statement: `Réduis √${k1 * k1 * m} + √${k2 * k2 * m}. Le résultat est de la forme a√${m} : quelle est la valeur de a ?`, answer: num(total), hints: H("On simplifie chaque racine.", `√${k1 * k1 * m} = ${k1}√${m} et √${k2 * k2 * m} = ${k2}√${m}.`, "Additionne les coefficients.", `${k1} + ${k2}.`), solution: `√${k1 * k1 * m} + √${k2 * k2 * m} = ${k1}√${m} + ${k2}√${m} = ${total}√${m}.` };
  }, FR),
  mk("rac-developper", "Racines carrées", 3, { skill: "Développer avec des racines carrées (identités remarquables)", ref: `${BOOK}, chap. 11 §3.1, ex. 3.b (p. 136) et ex. 21-22 (p. 139)`, kw: ["développer", "identité remarquable", "racine carrée", "(a+√b)(a−√b)", "conjuguées"] }, (_c, r) => {
    const a = int(r, 2, 9), b = pick(r, [2, 3, 5, 6, 7, 10, 11]);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Développe et réduis (${a} + √${b})(${a} − √${b}). Quelle est la valeur du résultat ?`, answer: num(a * a - b), hints: H("On reconnaît (x + y)(x − y) = x² − y².", `x = ${a} et y = √${b}.`, `${a}² − (√${b})² = ${a * a} − ${b}.`, "Calcule."), solution: `(${a} + √${b})(${a} − √${b}) = ${a}² − (√${b})² = ${a * a} − ${b} = ${a * a - b}.` };
    return { statement: `Développe (√${b} + ${a})². Le résultat s'écrit ${a * a + b} + k√${b} : quelle est la valeur de k ?`, answer: num(2 * a), hints: H("(x + y)² = x² + 2xy + y².", `x = √${b}, y = ${a}.`, `x² = ${b}, y² = ${a * a}, 2xy = 2 × ${a} × √${b}.`, "Lis le coefficient."), solution: `(√${b} + ${a})² = ${b} + ${2 * a}√${b} + ${a * a} = ${a * a + b} + ${2 * a}√${b} : k = ${2 * a}.` };
  }, FR),
  mk("rac-denominateur", "Racines carrées", 3, { skill: "Écrire un quotient sans radical au dénominateur", ref: `${BOOK}, chap. 11 §3.2, ex. 3.c (p. 137) et ex. 28 (p. 139)`, kw: ["sans radical au dénominateur", "expression conjuguée", "rationaliser", "quotient"] }, (_c, r) => {
    const n = int(r, 2, 9), m = pick(r, [2, 3, 5, 7]);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `On écrit ${n}/√${m} sans radical au dénominateur sous la forme (k√${m})/${m}. Quelle est la valeur de k ?`, answer: num(n), hints: H("On multiplie numérateur et dénominateur par √" + m + ".", `${n}/√${m} = ${n}√${m} / (√${m} × √${m}).`, `√${m} × √${m} = ${m}.`, "Lis k."), solution: `${n}/√${m} = ${n}√${m}/${m} : k = ${n}.` };
    const a = int(r, 2, 6);
    const den = a * a - m;
    return { statement: `On écrit 1/(${a} − √${m}) sans radical au dénominateur. En multipliant numérateur et dénominateur par l'expression conjuguée ${a} + √${m}, quel est le nouveau dénominateur (un entier) ?`, answer: num(den), hints: H("L'expression conjuguée de a − √b est a + √b.", "(a − √b)(a + √b) = a² − b.", `${a}² − ${m}.`, "Calcule."), solution: `(${a} − √${m})(${a} + √${m}) = ${a * a} − ${m} = ${den}.` };
  }, FR),
  mk("rac-triangle", "Racines carrées", 3, { skill: "Racines carrées et théorème de Pythagore", ref: `${BOOK}, chap. 11, ex. 3-5, 24-25 (p. 138-139)`, kw: ["racine carrée", "pythagore", "côté du carré", "triangle rectangle", "diagonale"] }, (_c, r) => {
    const a = int(r, 2, 9);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Un carré a pour aire ${2 * a * a} cm². Son côté s'écrit k√2 cm. Quelle est la valeur de k ?`, answer: num(a), hints: H("Aire = côté².", `côté² = ${2 * a * a}.`, `côté = √${2 * a * a}.`, `√(${a * a} × 2) = ${a}√2.`), solution: `côté = √${2 * a * a} = ${a}√2 cm : k = ${a}.` };
    return { statement: `Un carré de côté ${a} cm a pour diagonale d. Calcule d² (en cm²).`, answer: num(2 * a * a), hints: H("La diagonale est l'hypoténuse d'un triangle rectangle isocèle.", "d² = côté² + côté².", `${a}² + ${a}².`, "Calcule."), solution: `d² = ${a}² + ${a}² = ${2 * a * a}, donc d = ${a}√2 cm.` };
  }, FR),

  // ===== Chapitre 12 : Calcul numérique =====
  mk("num-valeur-absolue", "Calcul numérique", 2, { skill: "Valeur absolue et distance de deux nombres", ref: `${BOOK}, chap. 12 §1, ex. 1.b-1.f (p. 142-143)`, kw: ["valeur absolue", "distance", "|a − b|", "droite graduée"] }, (_c, r) => {
    const a = rnd(r) * dec1(r), b = rnd(r) * dec1(r);
    function dec1(rr: Rng) { return int(rr, 5, 99) / 10; }
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Quelle est la valeur absolue de ${par(a)} ?`, answer: num(Math.abs(a), 0.0001), hints: H("La valeur absolue d'un nombre est sa distance à zéro.", "Elle est toujours positive.", "Enlève le signe.", "Recopie."), solution: `|${n2(a)}| = ${fr(Math.abs(a))}.` };
    return { statement: `Quelle est la distance des nombres ${par(a)} et ${par(b)} ?`, answer: num(round(Math.abs(a - b), 4), 0.0001), hints: H("La distance de a et b est |a − b|.", `a − b = ${par(a)} − ${par(b)}.`, `a − b = ${n2(round(a - b, 4))}.`, "Prends la valeur absolue."), solution: `|${n2(a)} − ${par(b)}| = |${n2(round(a - b, 4))}| = ${fr(round(Math.abs(a - b), 4))}.` };
  }, FR),
  mk("num-intervalle", "Calcul numérique", 2, { skill: "Intervalles : écrire et lire un intervalle", ref: `${BOOK}, chap. 12 §2.1, ex. 2.a-2.d (p. 143-144)`, kw: ["intervalle", "borne", "ouvert", "fermé", "encadrement", "[a ; b]"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 9), b = a + int(r, 2, 10);
    const t = int(r, 0, 3);
    const A = n2(a), B = n2(b);
    const forms = [
      { ineq: `${A} ≤ x ≤ ${B}`, itv: `[${A} ; ${B}]` }, { ineq: `${A} < x ≤ ${B}`, itv: `]${A} ; ${B}]` }, { ineq: `${A} ≤ x < ${B}`, itv: `[${A} ; ${B}[` }, { ineq: `${A} < x < ${B}`, itv: `]${A} ; ${B}[` },
    ];
    const f0 = forms[t];
    return { statement: `Quel intervalle correspond à l'encadrement ${f0.ineq} ?`, answer: choice(r, forms.map((x) => x.itv), t), hints: H("Un crochet fermé « [ » ou « ] » signifie que la borne est comprise.", "Un crochet ouvert signifie qu'elle est exclue.", "≤ : borne comprise ; < : borne exclue.", "Regarde chaque inégalité."), solution: `${f0.ineq} s'écrit x ∈ ${f0.itv}.` };
  }, QCM),
  mk("num-amplitude", "Calcul numérique", 2, { skill: "Amplitude d'un intervalle", ref: `${BOOK}, chap. 12 §2.1, vocabulaire (p. 144) et ex. 2.d`, kw: ["amplitude", "intervalle", "borne", "|a − b|"] }, (_c, r) => {
    const a = rnd(r) * dec2(r), b = round(a + int(r, 5, 80) / 10, 1);
    function dec2(rr: Rng) { return int(rr, 5, 50) / 10; }
    return { statement: `Quelle est l'amplitude de l'intervalle [${n2(a)} ; ${n2(b)}] ?`, answer: num(round(b - a, 4), 0.0001), hints: H("L'amplitude est la distance entre les bornes.", "Amplitude = |a − b|.", `${n2(b)} − ${par(a)}.`, "Calcule."), solution: `|${n2(a)} − ${n2(b)}| = ${fr(round(b - a, 4))}.` };
  }, FR),
  mk("num-intersection", "Calcul numérique", 3, { skill: "Intersection et réunion d'intervalles", ref: `${BOOK}, chap. 12 §2.2, ex. 2.f (p. 145) et ex. 5-9 (p. 160)`, kw: ["intersection", "réunion", "intervalles", "∩", "∪"] }, (_c, r) => {
    const a = int(r, -9, 0), b = a + int(r, 4, 9), c = a + int(r, 1, 3), d = b + int(r, 1, 6);
    // [a ; b] ∩ [c ; d] = [c ; b] (c ≤ b)
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Quelle est la borne de gauche de l'intersection [${n2(a)} ; ${n2(b)}] ∩ [${n2(c)} ; ${n2(d)}] ?`, answer: num(c), hints: H("L'intersection contient les nombres qui sont dans les deux intervalles.", "Elle commence au plus grand des deux débuts.", `max(${n2(a)} ; ${n2(c)}).`, "Compare."), solution: `[${n2(a)} ; ${n2(b)}] ∩ [${n2(c)} ; ${n2(d)}] = [${n2(c)} ; ${n2(b)}] : borne de gauche ${n2(c)}.` };
    return { statement: `Quelle est la borne de droite de la réunion [${n2(a)} ; ${n2(b)}] ∪ [${n2(c)} ; ${n2(d)}] ?`, answer: num(d), hints: H("La réunion contient les nombres qui sont dans l'un ou l'autre.", "Ici les deux intervalles se chevauchent.", `Elle finit au plus grand des deux fins : max(${n2(b)} ; ${n2(d)}).`, "Compare."), solution: `[${n2(a)} ; ${n2(b)}] ∪ [${n2(c)} ; ${n2(d)}] = [${n2(a)} ; ${n2(d)}] : borne de droite ${n2(d)}.` };
  }, FR),
  mk("num-comparer", "Calcul numérique", 3, { skill: "Comparer des nombres réels (carrés, encadrements)", ref: `${BOOK}, chap. 12 §3, ex. 3.a-3.c (p. 147-149) et ex. 11-15 (p. 160)`, kw: ["comparer", "racines carrées", "carrés", "encadrement", "inverses"] }, (_c, r) => {
    const a = int(r, 2, 6), b = int(r, 2, 6), k = int(r, 4, 20);
    let x = a * Math.sqrt(2), y = b * Math.sqrt(3);
    const t = int(r, 0, 1);
    if (t === 0) {
      const s1 = `${a}√2`, s2 = `${b}√3`;
      const rel = a * a * 2 < b * b * 3 ? "<" : ">";
      if (a * a * 2 === b * b * 3) return { statement: "Compare 3√2 et 4. Quelle écriture est correcte ?", answer: choice(r, ["3√2 > 4", "3√2 < 4"], 0), hints: H("Pour comparer deux nombres positifs, on compare leurs carrés.", "(3√2)² = 18 et 4² = 16.", "18 > 16.", "Conclus."), solution: "(3√2)² = 18 > 16 = 4² donc 3√2 > 4." };
      return { statement: `Compare ${s1} et ${s2}. Quelle écriture est correcte ?`, answer: choice(r, [`${s1} < ${s2}`, `${s1} > ${s2}`], rel === "<" ? 0 : 1), hints: H("Pour comparer deux nombres positifs, on compare leurs carrés.", `(${s1})² = ${a * a * 2} et (${s2})² = ${b * b * 3}.`, "Le plus grand carré correspond au plus grand nombre positif.", "Compare."), solution: `(${s1})² = ${a * a * 2} et (${s2})² = ${b * b * 3} : ${s1} ${rel} ${s2}.` };
    }
    void x; void y; void k;
    const p = int(r, 2, 9);
    return { statement: `Compare 1/${p} et 1/${p + 1}. Quelle écriture est correcte ?`, answer: choice(r, [`1/${p} > 1/${p + 1}`, `1/${p} < 1/${p + 1}`], 0), hints: H("Deux nombres positifs sont rangés dans l'ordre contraire de leurs inverses.", `${p} < ${p + 1}.`, "Les inverses sont rangés en sens inverse.", "Conclus."), solution: `${p} < ${p + 1} donc 1/${p} > 1/${p + 1}.` };
  }, QCM),
  mk("num-encadrer-racine", "Calcul numérique", 3, { skill: "Encadrer une racine carrée (carrés parfaits, table)", ref: `${BOOK}, chap. 12 §4.2-4.3, ex. 4.a-4.b (p. 150-151) et ex. 24 (p. 163)`, kw: ["encadrer", "racine carrée", "approximation", "carrés parfaits", "entiers consécutifs"] }, (_c, r) => {
    const n = pick(r, [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40]);
    const lo = Math.floor(Math.sqrt(n));
    const up = int(r, 0, 1) === 1;
    return { statement: `On encadre √${n} par deux entiers consécutifs. Quel est le plus ${up ? "grand" : "petit"} des deux ?`, answer: num(up ? lo + 1 : lo), hints: H("On cherche deux carrés parfaits consécutifs autour de " + n + ".", `${lo}² = ${lo * lo} et ${lo + 1}² = ${(lo + 1) ** 2}.`, `${lo * lo} < ${n} < ${(lo + 1) ** 2}.`, "Prends la racine de chaque côté."), solution: `${lo}² = ${lo * lo} < ${n} < ${(lo + 1) ** 2} = ${lo + 1}², donc ${lo} < √${n} < ${lo + 1}.` };
  }, FR),
  mk("num-denombrement", "Calcul numérique", 2, { skill: "Problèmes de dénombrement : produits de choix", ref: `${BOOK}, chap. 12 §5, ex. 5 (p. 154) et ex. 22-24 (p. 161)`, kw: ["dénombrement", "choix", "combinaisons", "produit", "arbre"] }, (c, r) => {
    const a = int(r, 2, 6), b = int(r, 2, 6), d = int(r, 2, 5);
    const t = int(r, 0, 1);
    void c;
    if (t === 0) return { statement: `Un élève choisit une tenue : ${a} pantalons, ${b} chemises et ${d} paires de chaussures. Combien de tenues différentes peut-il composer ?`, answer: num(a * b * d), hints: H("On choisit successivement trois éléments.", "Chaque choix multiplie le nombre de possibilités.", `${a} × ${b}.`, `${a * b} × ${d}.`), solution: `${a} × ${b} × ${d} = ${a * b * d}.` };
    const n = int(r, 4, 8);
    return { statement: `Combien de nombres de deux chiffres distincts peut-on écrire avec les chiffres 1, 2, …, ${n} ?`, answer: num(n * (n - 1)), hints: H("On choisit le chiffre des dizaines, puis celui des unités.", `Dizaines : ${n} choix.`, `Unités : ${n - 1} choix (un chiffre différent).`, "Multiplie."), solution: `${n} × ${n - 1} = ${n * (n - 1)}.` };
  }, FR),

  // ===== Chapitre 13 : Équations et inéquations dans ℝ =====
  mk("eq-premier-degre", "Équations et inéquations dans ℝ", 2, { skill: "Résoudre ax + b = cx + d", ref: `${BOOK}, chap. 13 §1.1 (p. 161) et ex. 1-4 (p. 167)`, kw: ["équation", "premier degré", "ax + b = cx + d", "résoudre"] }, (_c, r) => {
    let a = 0, c = 0;
    do { a = int(r, 2, 9); c = int(r, 1, 8); } while (a === c);
    const x = rnd(r) * int(r, 1, 10), b = rnd(r) * int(r, 1, 15), d = a * x + b - c * x;
    return { statement: `Résous l'équation ${lin(a, b)} = ${lin(c, d)}.`, answer: num(x), hints: H("On regroupe les x d'un côté et les nombres de l'autre.", `Retire ${c}x aux deux membres.`, `${lin(a - c, 0)} = ${d - b}.`, "Divise par le coefficient de x."), solution: `${lin(a, b)} = ${lin(c, d)} ⇒ ${lin(a - c, 0)} = ${d - b}${Math.abs(a - c) === 1 ? "" : ` ⇒ x = ${d - b} ÷ ${a - c < 0 ? `(−${c - a})` : a - c}`} ⇒ x = ${n2(x)}.` };
  }, FR),
  mk("eq-valeur-absolue", "Équations et inéquations dans ℝ", 3, { skill: "Équation |x − a| = b", ref: `${BOOK}, chap. 13 §1.3, ex. 1.c (p. 162) et ex. 3 (p. 167)`, kw: ["valeur absolue", "|x − a| = b", "distance", "deux solutions"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 9), b = int(r, 1, 9);
    const wantBig = int(r, 0, 1) === 0;
    const form = a < 0 ? `|x + ${-a}|` : a === 0 ? "|x|" : `|x − ${a}|`;
    return { statement: `Résous l'équation ${form} = ${b}. Quelle est la ${wantBig ? "plus grande" : "plus petite"} solution ?`, answer: num(wantBig ? a + b : a - b), hints: H("|x − a| est la distance de x à a.", `On cherche les nombres dont la distance à ${n2(a)} est ${b}.`, `x = ${n2(a)} + ${b} ou x = ${n2(a)} − ${b}.`, "Choisis la bonne."), solution: `${form} = ${b} ⇔ x = ${n2(a + b)} ou x = ${n2(a - b)} : la ${wantBig ? "plus grande" : "plus petite"} est ${n2(wantBig ? a + b : a - b)}.` };
  }, FR),
  mk("ineq-premier-degre", "Équations et inéquations dans ℝ", 3, { skill: "Résoudre ax + b < cx + d", ref: `${BOOK}, chap. 13 §2.1, ex. 2.a (p. 163) et ex. 5-6 (p. 167)`, kw: ["inéquation", "premier degré", "intervalle", "résoudre", "ensemble des solutions"] }, (_c, r) => {
    let a = 0, c = 0;
    do { a = int(r, 2, 9); c = int(r, 1, 8); } while (a === c);
    const x0 = rnd(r) * int(r, 1, 10), b = rnd(r) * int(r, 1, 15), d = a * x0 + b - c * x0;
    const lt = int(r, 0, 1) === 0;
    // a x + b < c x + d ⇔ (a - c) x < d - b
    const coef = a - c, rhs = d - b;
    const flip = coef < 0;
    const out = lt ? (flip ? ">" : "<") : (flip ? "<" : ">");
    const good = `x ${out} ${n2(x0)}`;
    const bad = `x ${out === "<" ? ">" : "<"} ${n2(x0)}`;
    void rhs;
    return { statement: `Résous l'inéquation ${lin(a, b)} ${lt ? "<" : ">"} ${lin(c, d)}. Quelle est la bonne écriture des solutions ?`, answer: choice(r, [good, bad], 0), hints: H("On regroupe les x d'un côté.", `${lin(a - c, 0)} ${lt ? "<" : ">"} ${d - b}.`, flip ? "On divise par un nombre négatif : le sens change." : "On divise par un nombre positif : le sens ne change pas.", "Écris la solution."), solution: `${lin(a - c, 0)} ${lt ? "<" : ">"} ${d - b}${Math.abs(coef) === 1 && !flip ? "" : ` ⇔ x ${out} ${n2(x0)}${flip ? " (division par un négatif : le sens change)" : ""}`}.` };
  }, QCM),
  mk("eq-probleme", "Équations et inéquations dans ℝ", 3, { skill: "Mettre un problème en équation (âges, prix, vitesses)", ref: `${BOOK}, chap. 13 §3, ex. 3.a-3.c (p. 164-166) et ex. 11-23 (p. 168-169)`, kw: ["problème", "mise en équation", "âge", "prix", "inconnue"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const F = int(r, 6, 20), k = int(r, 2, 4), y = int(r, 3, 10); const P = k * F + (k - 1) * y; return { statement: `Un fils a ${F} ans et son père ${P} ans. Dans y années, l'âge du père sera ${k} fois celui du fils : ${P} + y = ${k}(${F} + y). Combien vaut y ?`, answer: num(y), hints: H("Dans y années, chacun a y ans de plus.", `${k}(${F} + y) = ${k * F} + ${k}y.`, `${P} + y = ${k * F} + ${k}y.`, "Isole y."), solution: `${P} + y = ${k * F} + ${k}y ⇒ ${P - k * F} = ${k - 1}y ⇒ y = ${y}.` }; }
    if (t === 1) { const p1 = int(r, 2, 6) * 100, p2 = int(r, 2, 6) * 100 + 100, n = int(r, 5, 20); const x = n; return { statement: `Un cahier coûte ${p1} F et un livre ${p1 + p2} F. On achète ${n} cahiers et x livres pour un total de ${n * p1 + x * (p1 + p2)} F. Combien de livres (x) a-t-on achetés ?`, answer: num(x), hints: H("On écrit le prix total avec x.", `${n} × ${p1} + x × ${p1 + p2}.`, `${n * p1} + ${p1 + p2}x = ${n * p1 + x * (p1 + p2)}.`, "Résous."), solution: `${p1 + p2}x = ${x * (p1 + p2)} ⇒ x = ${x}.` }; }
    const v = pick(r, [40, 50, 60, 80, 90]), tt = int(r, 2, 5);
    return { statement: `Un cycliste roule à ${v} km/h. Au bout de x heures, il a parcouru ${v * tt} km. L'équation est ${v}x = ${v * tt}. Combien vaut x (en heures) ?`, answer: num(tt), hints: H("Distance = vitesse × durée.", `${v}x = ${v * tt}.`, "Divise par la vitesse.", "Calcule."), solution: `x = ${v * tt} ÷ ${v} = ${tt} h.` };
  }, [{ id: "probleme", label: "Problème" }]),

  // ===== Chapitre 14 : Équations et inéquations dans ℝ × ℝ =====
  mk("sys-substitution", "Équations et inéquations dans ℝ × ℝ (couples)", 3, { skill: "Résoudre un système par substitution", ref: `${BOOK}, chap. 14 §1.2, ex. 1.b (p. 172-173) et ex. 3 (p. 181)`, kw: ["système", "substitution", "couple solution", "deux équations", "deux inconnues"] }, (_c, r) => {
    const x = rnd(r) * int(r, 1, 6), y = rnd(r) * int(r, 1, 6);
    // x + a y = s ; c x + d y = t
    let a = int(r, 1, 4), c = int(r, 2, 5), d = int(r, 1, 5);
    while (c - a * d === 0) d = int(r, 1, 5);
    const s = x + a * y, t = c * x + d * y;
    const askX = int(r, 0, 1) === 0;
    return { statement: `Résous le système  x + ${a === 1 ? "" : a}y = ${s} ;  ${c}x + ${d}y = ${t}. Quelle est la valeur de ${askX ? "x" : "y"} ?`, answer: num(askX ? x : y), hints: H("On exprime x en fonction de y dans la première équation.", `x = ${s} − ${a === 1 ? "" : a}y.`, "On remplace x dans la seconde équation.", "Résous en y, puis calcule x."), solution: `Solution : (x ; y) = (${n2(x)} ; ${n2(y)}). Vérification : ${n2(x)} + ${a === 1 ? "" : `${a} × `}${par(y)} = ${s} ; ${c} × ${par(x)} + ${d} × ${par(y)} = ${t}.` };
  }, FR),
  mk("sys-combinaison", "Équations et inéquations dans ℝ × ℝ (couples)", 3, { skill: "Résoudre un système par combinaison", ref: `${BOOK}, chap. 14 §1.3, ex. 1.c (p. 173-174) et ex. 4 (p. 181)`, kw: ["système", "combinaison", "élimination", "couple solution", "deux inconnues"] }, (_c, r) => {
    const x = rnd(r) * int(r, 1, 7), y = rnd(r) * int(r, 1, 7);
    let a = int(r, 2, 5), b = int(r, 2, 5), c = int(r, 2, 5), d = int(r, 2, 5);
    while (a * d - b * c === 0) d = int(r, 2, 5);
    const s = a * x + b * y, t = c * x - d * y;
    // a x + b y = s ; c x - d y = t → det for y: from a x + b y, c x - d y → (a)(−d) − b c ≠ 0
    if (a * -d - b * c === 0) return { statement: "Résous 2x + y = 5 ; x − y = 1. Quelle est la valeur de x ?", answer: num(2), hints: H("Additionne les deux équations.", "3x = 6.", "x = 2.", "y = 1."), solution: "3x = 6 donc x = 2 et y = 1." };
    const askX = int(r, 0, 1) === 0;
    return { statement: `Résous le système  ${a}x + ${b}y = ${s} ;  ${c}x − ${d}y = ${t}. Quelle est la valeur de ${askX ? "x" : "y"} ?`, answer: num(askX ? x : y), hints: H("On élimine une inconnue par combinaison linéaire.", "Multiplie les équations pour avoir des coefficients opposés.", "Additionne membre à membre.", "Remplace dans une équation."), solution: `Solution : (x ; y) = (${n2(x)} ; ${n2(y)}). Vérification : ${a} × ${par(x)} + ${b} × ${par(y)} = ${s} ; ${c} × ${par(x)} − ${d} × ${par(y)} = ${t}.` };
  }, FR),
  mk("sys-probleme", "Équations et inéquations dans ℝ × ℝ (couples)", 3, { skill: "Mettre un problème en système de deux équations", ref: `${BOOK}, chap. 14 §3.1, ex. 3.a (p. 179) et ex. 8-12 (p. 182)`, kw: ["problème", "système", "deux inconnues", "pièces", "prix"] }, (_c, r) => {
    const x = int(r, 3, 15), y = int(r, 3, 15);
    const p1 = pick(r, [5, 10]), p2 = pick(r, [25, 50, 100]);
    return { statement: `Dans une caisse, il y a des pièces de ${p1} F et des pièces de ${p2} F. Il y a ${x + y} pièces et la somme est ${x * p1 + y * p2} F. On pose x le nombre de pièces de ${p1} F et y celui de ${p2} F. Combien y a-t-il de pièces de ${p2} F ?`, answer: num(y), hints: H("On écrit deux équations.", `x + y = ${x + y} et ${p1}x + ${p2}y = ${x * p1 + y * p2}.`, `Remplace x = ${x + y} − y.`, "Résous."), solution: `x + y = ${x + y} ; ${p1}x + ${p2}y = ${x * p1 + y * p2} ⇒ y = ${y} (et x = ${x}).` };
  }, [{ id: "probleme", label: "Problème" }]),
  mk("sys-inequation-graphique", "Équations et inéquations dans ℝ × ℝ (couples)", 2, { skill: "Un couple vérifie-t-il une inéquation ax + by + c < 0 ?", ref: `${BOOK}, chap. 14 §2, ex. 2.a (p. 176) et ex. 7-9 (p. 182)`, kw: ["inéquation", "demi-plan", "couple", "ax + by + c", "solution"] }, (_c, r) => {
    const a = int(r, 1, 5), b = int(r, 1, 5), c0 = rnd(r) * int(r, 1, 9);
    const x = rnd(r) * int(r, 0, 5), y = rnd(r) * int(r, 0, 5);
    const v = a * x + b * y + c0;
    if (v === 0) return { statement: `Le couple (0 ; 0) vérifie-t-il l'inéquation 2x + y − 3 < 0 ?`, answer: choice(r, ["Oui", "Non"], 0), hints: H("On remplace x et y.", "2 × 0 + 0 − 3 = −3.", "−3 < 0.", "Oui."), solution: "2×0 + 0 − 3 = −3 < 0 : oui." };
    return { statement: `Le couple (${n2(x)} ; ${n2(y)}) est-il solution de l'inéquation ${a}x + ${b}y ${c0 < 0 ? "−" : "+"} ${Math.abs(c0)} < 0 ?`, answer: choice(r, ["Oui", "Non"], v < 0 ? 0 : 1), hints: H("On remplace x et y par leurs valeurs.", `${a} × ${par(x)} + ${b} × ${par(y)} ${c0 < 0 ? "−" : "+"} ${Math.abs(c0)}.`, `On obtient ${v}.`, "Compare à 0."), solution: `${a}×${par(x)} + ${b}×${par(y)} ${c0 < 0 ? "−" : "+"} ${Math.abs(c0)} = ${v} ${v < 0 ? "< 0 : oui" : "> 0 : non"}.` };
  }, QCM),

  // ===== Chapitre 15 : Applications affines =====
  mk("aff-image", "Applications affines", 1, { skill: "Image et antécédent par une application affine", ref: `${BOOK}, chap. 15 §1.1, ex. 1.a (p. 187) et ex. 1-3 (p. 194)`, kw: ["application affine", "image", "antécédent", "f(x) = ax + b"] }, (c, r) => {
    if (c === "situation") {
      const a = int(r, 2, 9) * 100, b = int(r, 1, 9) * 1000, x = int(r, 2, 9);
      return { statement: `Une location coûte ${f(b)} F de forfait plus ${f(a)} F par jour. On note f(x) = ${f(a)}x + ${f(b)} le prix pour x jours. Combien coûtent ${x} jours (en F) ?`, answer: num(a * x + b), hints: H("L'image de x est f(x).", "On remplace x par le nombre de jours.", `${f(a)} × ${x} + ${f(b)}.`, "Calcule."), solution: `f(${x}) = ${f(a)} × ${x} + ${f(b)} = ${f(a * x + b)} F.` };
    }
    const a = rnd(r) * int(r, 2, 6), b = rnd(r) * int(r, 1, 10), x = rnd(r) * int(r, 1, 8);
    if (int(r, 0, 1) === 0) return { statement: `f est l'application affine f(x) = ${lin(a, b)}. Calcule f(${n2(x)}).`, answer: num(a * x + b), hints: H("L'image de x est f(x).", "On remplace x par sa valeur.", "Calcule a × x puis ajoute b.", "Fais attention aux signes."), solution: `f(${n2(x)}) = ${a} × ${par(x)} + ${par(b)} = ${a * x + b}.` };
    const y = a * x + b;
    return { statement: `f(x) = ${lin(a, b)}. Quel est le nombre qui a pour image ${n2(y)} par f ?`, answer: num(x), hints: H("On cherche l'antécédent de " + n2(y) + ".", `On résout f(x) = ${n2(y)}.`, `${lin(a, b)} = ${n2(y)}.`, "Isole x."), solution: `${lin(a, b)} = ${n2(y)} ⇒ ${lin(a, 0)} = ${y - b} ⇒ x = ${n2(x)}.` };
  }, SIT),
  mk("aff-determiner", "Applications affines", 3, { skill: "Déterminer une application affine à partir de deux images", ref: `${BOOK}, chap. 15 §1.2, ex. 1.c (p. 188) et ex. 6-8 (p. 194)`, kw: ["application affine", "deux images", "coefficient", "f(x₁)", "f(x₂)"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 6), b = rnd(r) * int(r, 1, 10);
    const x1 = int(r, -5, 0), x2 = x1 + int(r, 1, 6);
    const askA = int(r, 0, 1) === 0;
    return { statement: `f est une application affine telle que f(${n2(x1)}) = ${n2(a * x1 + b)} et f(${n2(x2)}) = ${n2(a * x2 + b)}. Quel est ${askA ? "son coefficient a" : "son terme constant b"} ?`, answer: num(askA ? a : b), hints: H("a = (f(x₂) − f(x₁)) / (x₂ − x₁).", `a = (${n2(a * x2 + b)} − ${par(a * x1 + b)}) / (${n2(x2)} − ${par(x1)}).`, `a = ${n2(a)}.`, "Puis b = f(x₁) − a x₁."), solution: `a = ${n2(a)} ; b = ${n2(a * x1 + b)} − ${par(a)} × ${par(x1)} = ${n2(b)}.` };
  }, FR),
  mk("aff-variation", "Applications affines", 2, { skill: "Sens de variation d'une application affine", ref: `${BOOK}, chap. 15 §1.3, ex. 1.d-1.f (p. 189-190) et ex. 9-12 (p. 195)`, kw: ["croissante", "décroissante", "constante", "coefficient", "sens de variation"] }, (_c, r) => {
    const a = pick(r, [-3, -2, -1.5, -0.5, 0, 0.5, 1, 2, 4]), b = int(r, -9, 9);
    const rep = a > 0 ? "croissante" : a < 0 ? "décroissante" : "constante";
    return { statement: `L'application affine f(x) = ${fr(a)}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} est-elle croissante, décroissante ou constante ?`, answer: choice(r, ["croissante", "décroissante", "constante"], ["croissante", "décroissante", "constante"].indexOf(rep)), hints: H("Le sens de variation dépend du signe du coefficient a.", "a > 0 : croissante ; a < 0 : décroissante ; a = 0 : constante.", `Ici a = ${fr(a)}.`, "Conclus."), solution: `a = ${fr(a)} ${a > 0 ? "> 0" : a < 0 ? "< 0" : "= 0"} : f est ${rep}.` };
  }, QCM),
  mk("lin-coefficient", "Applications affines", 2, { skill: "Application linéaire : coefficient et proportionnalité", ref: `${BOOK}, chap. 15 §2.1-2.2, ex. 2.a-2.f (p. 190-191) et ex. 13-18 (p. 195)`, kw: ["application linéaire", "coefficient", "f(x) = ax", "proportionnalité", "image"] }, (c, r) => {
    const a = int(r, 2, 15) / (int(r, 0, 1) ? 1 : 2), u = int(r, 2, 12);
    const t = int(r, 0, 2);
    void c;
    if (t === 0) return { statement: `f est une application linéaire telle que f(${u}) = ${fr(round(a * u, 4))}. Quel est son coefficient ?`, answer: num(a, 0.0001), hints: H("f(x) = a x.", "a = f(u) ÷ u.", `${fr(round(a * u, 4))} ÷ ${u}.`, "Calcule."), solution: `a = ${fr(round(a * u, 4))} ÷ ${u} = ${fr(a)}.` };
    if (t === 1) { const v = int(r, 2, 12); return { statement: `f est linéaire de coefficient ${fr(a)}. Quelle est l'image de ${v} ?`, answer: num(round(a * v, 4), 0.0001), hints: H("f(x) = a x.", `f(${v}) = ${fr(a)} × ${v}.`, "Multiplie.", "Calcule."), solution: `f(${v}) = ${fr(a)} × ${v} = ${fr(round(a * v, 4))}.` }; }
    const v = int(r, 2, 12);
    return { statement: `f est linéaire de coefficient ${fr(a)}. Quel nombre a pour image ${fr(round(a * v, 4))} ?`, answer: num(v, 0.0001), hints: H("On cherche l'antécédent.", "x = f(x) ÷ a.", `${fr(round(a * v, 4))} ÷ ${fr(a)}.`, "Calcule."), solution: `x = ${fr(round(a * v, 4))} ÷ ${fr(a)} = ${v}.` };
  }, FR),
  mk("aff-probleme", "Applications affines", 3, { skill: "Résolution graphique et tarifs par tranches", ref: `${BOOK}, chap. 15 §3, exemples 1-2 (p. 192-193) et ex. 19-25 (p. 196)`, kw: ["tarif", "tranche", "facture", "lecture graphique", "application affine par morceaux"] }, (_c, r) => {
    const p1 = pick(r, [100, 115, 120, 150]), p2 = p1 + pick(r, [60, 80, 100]), s = pick(r, [10, 20, 30]);
    const x = s + int(r, 2, 15);
    const total = p1 * s + p2 * (x - s);
    return { statement: `Un tarif d'eau : ${p1} F le m³ jusqu'à ${s} m³, puis ${p2} F le m³ au-delà. Quelle est la facture (hors taxes, en F) pour ${x} m³ ?`, answer: num(total), hints: H("On sépare les deux tranches.", `Première tranche : ${p1} × ${s} = ${p1 * s}.`, `Seconde tranche : (${x} − ${s}) × ${p2} = ${(x - s) * p2}.`, "Additionne."), solution: `${p1} × ${s} + (${x} − ${s}) × ${p2} = ${p1 * s} + ${(x - s) * p2} = ${total} F.` };
  }, [{ id: "tarif", label: "Tarif par tranches" }]),

  // ===== Chapitre 16 : Statistiques =====
  mk("stat-mode", "Statistique", 1, { skill: "Mode et effectif d'une série", ref: `${BOOK}, chap. 16 §1.2, ex. 1.a-1.b (p. 202) et ex. 5-6 (p. 212)`, kw: ["mode", "effectif maximal", "modalité", "série statistique"] }, (_c, r) => {
    const effs = Array.from({ length: 5 }, () => int(r, 2, 20));
    const mx = Math.max(...effs);
    if (effs.filter((e) => e === mx).length > 1) effs[effs.indexOf(mx)] = mx + 1;
    const vals = [3, 4, 5, 6, 7].map((v) => v + int(r, 0, 1) * 0);
    const best = effs.indexOf(Math.max(...effs));
    return { statement: `Dans une série, les modalités ${vals.join(", ")} ont pour effectifs ${effs.join(", ")}. Quel est le mode de cette série ?`, answer: num(vals[best]), hints: H("Le mode est la modalité d'effectif maximal.", "Cherche le plus grand effectif.", `Le plus grand effectif est ${Math.max(...effs)}.`, "Lis la modalité correspondante."), solution: `Effectif maximal : ${Math.max(...effs)}, pour la modalité ${vals[best]} : le mode est ${vals[best]}.` };
  }, FR),
  mk("stat-secteur", "Statistique", 2, { skill: "Diagramme circulaire : angle du secteur et aire", ref: `${BOOK}, chap. 16 §1.3, ex. 1.a-1.b (p. 203-204) et ex. 1-4 (p. 212)`, kw: ["diagramme circulaire", "secteur", "angle au centre", "360", "fréquence"] }, (_c, r) => {
    const f0 = pick(r, [10, 15, 20, 25, 30, 40, 55, 60]);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Dans un diagramme circulaire, une modalité a pour fréquence ${f0} %. Quelle est la mesure de son secteur (en °) ?`, answer: num(round((f0 * 360) / 100, 2), 0.01, "°"), hints: H("Le disque entier (360°) représente 100 %.", "Tableau de proportionnalité.", `${f0} × 360 ÷ 100.`, "Calcule."), solution: `${f0} × 360 ÷ 100 = ${fr(round((f0 * 360) / 100, 2))}°.` };
    const ang = pick(r, [36, 54, 72, 90, 108, 144, 198]);
    return { statement: `Un secteur d'un diagramme circulaire mesure ${ang}°. Quelle est la fréquence de la modalité représentée (en %) ?`, answer: num(round((ang * 100) / 360, 2), 0.01), hints: H("360° correspondent à 100 %.", "Tableau de proportionnalité.", `${ang} × 100 ÷ 360.`, "Calcule."), solution: `${ang} × 100 ÷ 360 = ${fr(round((ang * 100) / 360, 2))} %.` };
  }, FR),
  mk("stat-cumul", "Statistique", 2, { skill: "Effectifs cumulés et fréquences cumulées", ref: `${BOOK}, chap. 16 §2.1, ex. 2.a-2.b (p. 205-206) et ex. 8-9 (p. 213)`, kw: ["effectif cumulé", "fréquence cumulée", "inférieur ou égal", "tableau"] }, (_c, r) => {
    const vals = [8, 10, 12, 14, 16];
    const effs = vals.map(() => int(r, 1, 12));
    const k = int(r, 1, 4);
    const cum = effs.slice(0, k + 1).reduce((s, e) => s + e, 0), T = effs.reduce((s, e) => s + e, 0);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Notes : ${vals.join(", ")} ; effectifs : ${effs.join(", ")}. Combien d'élèves ont une note inférieure ou égale à ${vals[k]} ?`, answer: num(cum), hints: H("C'est l'effectif cumulé de la modalité " + vals[k] + ".", "On additionne les effectifs des modalités inférieures ou égales.", effs.slice(0, k + 1).join(" + ") + ".", "Calcule."), solution: `${effs.slice(0, k + 1).join(" + ")} = ${cum}.` };
    return { statement: `Notes : ${vals.join(", ")} ; effectifs : ${effs.join(", ")}. Quelle est la fréquence cumulée de la modalité ${vals[k]} (en %, arrondie au centième) ?`, answer: num(round((cum * 100) / T, 2), 0.01), hints: H("Fréquence cumulée = effectif cumulé ÷ effectif total.", `Effectif cumulé : ${cum} ; effectif total : ${T}.`, `${cum} ÷ ${T} × 100.`, "Arrondis."), solution: `${cum} ÷ ${T} × 100 ≈ ${fr(round((cum * 100) / T, 2))} %.` };
  }, FR),
  mk("stat-moyenne", "Statistique", 2, { skill: "Moyenne d'une série et moyenne en classes", ref: `${BOOK}, chap. 16 §2.2 et §3.2, ex. 2.b-3.b (p. 207-211) et ex. 7-12 (p. 213)`, kw: ["moyenne", "effectif", "centre de classe", "regroupement en classes"] }, (c, r) => {
    const classes = [[0, 5], [5, 10], [10, 15], [15, 20]];
    const effs = classes.map(() => int(r, 2, 15));
    const centers = classes.map(([a, b]) => (a + b) / 2);
    const T = effs.reduce((s, e) => s + e, 0);
    const S = effs.reduce((s, e, i) => s + e * centers[i], 0);
    void c;
    return { statement: `Notes regroupées en classes [0 ; 5[, [5 ; 10[, [10 ; 15[, [15 ; 20[ avec les effectifs ${effs.join(", ")}. On prend le centre de chaque classe. Quelle est la moyenne (arrondie au centième) ?`, answer: num(round(S / T, 2), 0.01), hints: H("On remplace chaque classe par son centre.", `Centres : ${centers.join(", ")}.`, `Somme des centre × effectif : ${fr(S)}.`, `Divise par ${T}.`), solution: `Moyenne = ${fr(S)} ÷ ${T} ≈ ${fr(round(S / T, 2))}.` };
  }, FR),
  mk("stat-classe-modale", "Statistique", 2, { skill: "Classe modale et amplitude d'une classe", ref: `${BOOK}, chap. 16 §3.2, ex. 3.b (p. 209-210) et ex. 10 (p. 213)`, kw: ["classe modale", "regroupement en classes", "amplitude", "effectif"] }, (_c, r) => {
    const starts = [0, 10, 20, 30, 40];
    const effs = Array.from({ length: 5 }, () => int(r, 3, 30));
    const mx = Math.max(...effs);
    if (effs.filter((e) => e === mx).length > 1) effs[effs.indexOf(mx)] = mx + 1;
    const best = effs.indexOf(Math.max(...effs));
    return { statement: `Les classes [0 ; 10[, [10 ; 20[, [20 ; 30[, [30 ; 40[, [40 ; 50[ ont pour effectifs ${effs.join(", ")}. Quelle est la borne de gauche de la classe modale ?`, answer: num(starts[best]), hints: H("La classe modale est celle d'effectif maximal.", `L'effectif maximal est ${Math.max(...effs)}.`, "Repère la classe correspondante.", "Lis sa borne de gauche."), solution: `Effectif maximal ${Math.max(...effs)} : classe [${starts[best]} ; ${starts[best] + 10}[ ; borne de gauche ${starts[best]}.` };
  }, FR),
);
void gcd; void f; void qcmOf;
type _I = Item;
