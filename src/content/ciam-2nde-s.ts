// CIAM Seconde S : activités numériques, géométriques et statistiques. Énoncés originaux, réponses calculées par le code.
// Notions du skeleton « série C » ; chaque gabarit indique le chapitre et les pages du manuel.
import { choice, fr, gcd, int, num, pick, register, round, Rng } from "./core";
import { ciam, H, Item, QCM, qcmOf, sup, withWrong } from "./ciam-kit";

const mk = ciam("2nde", "ciam2");
const BOOK = "CIAM 2nde S";
const rnd = (r: Rng) => (int(r, 0, 1) === 0 ? -1 : 1);
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const FR = [{ id: "calcul", label: "Calcul" }];
const lin = (a: number, b: number, v = "x") => {
  const t1 = a === 0 ? "" : a === 1 ? v : a === -1 ? `−${v}` : `${a < 0 ? "−" : ""}${Math.abs(a)}${v}`;
  if (b === 0) return t1 || "0";
  return t1 ? `${t1} ${b < 0 ? "−" : "+"} ${Math.abs(b)}` : `${b < 0 ? "−" : ""}${Math.abs(b)}`;
};
/** Trinôme ax² + bx + c écrit proprement. */
const quad = (a: number, b: number, c: number) => {
  const parts: string[] = [];
  const push = (k: number, v: string) => { if (k === 0) return; const body = v === "" ? String(Math.abs(k)) : `${Math.abs(k) === 1 ? "" : Math.abs(k)}${v}`; parts.push(parts.length === 0 ? `${k < 0 ? "−" : ""}${body}` : ` ${k < 0 ? "−" : "+"} ${body}`); };
  push(a, "x²"); push(b, "x"); push(c, "");
  return parts.join("") || "0";
};
const N = (t: string) => `maths:2nde:${t}`;
void N;

const NR = "Ensemble des nombres réels — série C";
const PF = "Polynômes et fractions rationnelles — série C";
const EQ = "Équations et inéquations dans ℝ — série C";
const INEQ2 = "Inéquations dans ℝ × ℝ (couples) — série C";
const GF = "Généralités sur les fonctions — série C";
const EF = "Étude de fonctions élémentaires — série C";
const ST = "Statistique à une variable — série C";
const VP = "Vecteurs et points du plan — série C";
const PS = "Produit scalaire — série C";
const AO = "Angles orientés et trigonométrie — série C";

register(
  // ===== Chapitre 8 : Ensemble des nombres réels =====
  mk("nr-rationnel", "Ensemble des nombres réels — série C", 1, { skill: "Rationnel ou irrationnel ? Reconnaître la nature d'un nombre", ref: `${BOOK}, chap. 8 §1 (p. 136-138)`, kw: ["rationnel", "irrationnel", "√2", "π", "nombre réel"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Lequel de ces nombres est irrationnel ?", good: "√2", bad: ["−4/7", "0,125", "1,3333… (3 répété à l'infini)"], why: "√2 ne peut pas s'écrire comme quotient de deux entiers (démonstration par l'absurde du manuel, p. 137) ; les autres sont rationnels." },
      { q: "Lequel de ces nombres est rationnel ?", good: "0,375", bad: ["√3", "π", "√5"], why: "0,375 = 3/8 est le quotient de deux entiers ; √3, √5 et π sont irrationnels." },
      { q: "Quelle inclusion est correcte ?", good: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ", bad: ["ℝ ⊂ ℚ ⊂ ℤ ⊂ ℕ", "ℤ ⊂ ℕ ⊂ ℚ ⊂ ℝ", "ℚ ⊂ ℤ ⊂ ℕ ⊂ ℝ"], why: "Les entiers naturels sont des entiers relatifs, qui sont des rationnels, qui sont des réels." },
      { q: "Quelle est la démarche d'un raisonnement par l'absurde pour prouver qu'une proposition (p) est vraie ?", good: "Supposer que (non p) est vraie et aboutir à une contradiction", bad: ["Vérifier (p) sur quelques exemples", "Supposer (p) vraie et vérifier qu'elle est cohérente", "Montrer que (p) est évidente"], why: "On suppose la négation de (p) vraie, on en déduit une proposition manifestement fausse : donc (p) est vraie." },
      { q: "Combien de nombres réels dont le carré est 2 existe-t-il ?", good: "Deux : √2 et −√2", bad: ["Un seul : √2", "Aucun", "Une infinité"], why: "x² = a (a > 0) équivaut à x = √a ou x = −√a : ici x = √2 ou x = −√2." },
      { q: "Parmi ces nombres, lequel est constructible à la règle et au compas ?", good: "√2", bad: ["Aucun, car ils sont tous irrationnels", "π", "Aucun nombre irrationnel n'est constructible"], why: "√2 est la longueur de la diagonale d'un carré de côté 1 : constructible. π n'est pas constructible (Lindemann, 1882)." },
    ];
    return qcmOf(r, pool, "Pense à la définition d'un nombre rationnel (a/b).");
  }, QCM),
  mk("nr-calculs", "Ensemble des nombres réels — série C", 2, { skill: "Calculs dans ℝ : fractions, puissances, racines", ref: `${BOOK}, chap. 8 §1.5 et ex. 1.a-1.e (p. 138-140)`, kw: ["calculs dans ℝ", "puissances", "racines carrées", "fractions", "simplifier"] }, (_c, r) => {
    const a = int(r, 2, 6), b = int(r, 2, 6), m = int(r, 2, 5);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Calcule (${a}${sup(m)} × ${a}${sup(m + 1)}) ÷ ${a}${sup(2 * m)}. Écris le résultat sous la forme ${a}^p : quelle est la valeur de p ?`, answer: num(1), hints: H("On utilise aᵐ × aⁿ = aᵐ⁺ⁿ et aᵐ ÷ aⁿ = aᵐ⁻ⁿ.", `Exposant au numérateur : ${m} + ${m + 1} = ${2 * m + 1}.`, `${2 * m + 1} − ${2 * m}.`, "Calcule."), solution: `${a}${sup(2 * m + 1)} ÷ ${a}${sup(2 * m)} = ${a}¹ : p = 1.` };
    if (t === 1) return { statement: `Calcule √${a * a * b} ÷ √${b}.`, answer: num(a), hints: H("√x ÷ √y = √(x/y) pour y > 0.", `${a * a * b} ÷ ${b} = ${a * a}.`, `√${a * a} = ${a}.`, "Calcule."), solution: `√${a * a * b} ÷ √${b} = √${a * a} = ${a}.` };
    return { statement: `Calcule 1/${a} + 1/${a + 1} − 1/${a * (a + 1)}. Donne le résultat sous forme décimale arrondie au centième.`, answer: num(round(1 / a + 1 / (a + 1) - 1 / (a * (a + 1)), 2), 0.01), hints: H("On réduit au même dénominateur.", `${a} × ${a + 1} = ${a * (a + 1)}.`, `${a + 1}/${a * (a + 1)} + ${a}/${a * (a + 1)} − 1/${a * (a + 1)}.`, "Additionne les numérateurs."), solution: `(${a + 1} + ${a} − 1)/${a * (a + 1)} = ${2 * a}/${a * (a + 1)} ≈ ${fr(round(1 / a + 1 / (a + 1) - 1 / (a * (a + 1)), 2))}.` };
  }, FR),
  mk("nr-ordre", "Ensemble des nombres réels — série C", 2, { skill: "Ordre dans ℝ : propriétés des inégalités", ref: `${BOOK}, chap. 8 §2.1, propriétés (p. 140-141)`, kw: ["inégalités", "ordre", "ajouter", "multiplier", "nombre négatif"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "a ≤ b. Que peut-on dire de a + c et b + c, pour tout réel c ?", good: "a + c ≤ b + c", bad: ["a + c ≥ b + c", "a + c = b + c", "On ne peut rien dire"], why: "Ajouter un même nombre aux deux membres conserve le sens de l'inégalité." },
      { q: "a ≤ b et c ≥ 0. Que peut-on dire de ac et bc ?", good: "ac ≤ bc", bad: ["ac ≥ bc", "ac = bc", "ac < 0"], why: "Multiplier par un nombre positif conserve le sens." },
      { q: "a ≤ b et c ≤ 0. Que peut-on dire de ac et bc ?", good: "ac ≥ bc", bad: ["ac ≤ bc", "ac = bc", "ac > 0"], why: "Multiplier par un nombre négatif change le sens." },
      { q: "a ≤ b et c ≤ d. Que peut-on dire de a + c et b + d ?", good: "a + c ≤ b + d", bad: ["a + c ≥ b + d", "a − c ≤ b − d", "a + c = b + d"], why: "On peut additionner membre à membre des inégalités de même sens." },
      { q: "2 ≤ 3 et 1 ≤ 5. A-t-on 2 − 1 ≥ 3 − 5 ?", good: "Oui, mais ce n'est pas une règle générale : on ne soustrait pas membre à membre", bad: ["Non, c'est faux", "Oui, et c'est une règle générale", "On ne peut pas calculer"], why: "2 − 1 = 1 ≥ −2 = 3 − 5 : vrai ici, mais il n'existe pas de règle pour soustraire membre à membre des inégalités." },
      { q: "a et b sont strictement positifs et a ≤ b. Que peut-on dire de 1/a et 1/b ?", good: "1/a ≥ 1/b", bad: ["1/a ≤ 1/b", "1/a = 1/b", "1/a < 0"], why: "Pour deux nombres strictement positifs, a ≤ b équivaut à 1/a ≥ 1/b." },
      { q: "a et b sont positifs avec a ≤ b. Que peut-on dire de a² et b² ?", good: "a² ≤ b²", bad: ["a² ≥ b²", "a² = b²", "On ne peut rien dire"], why: "Pour a et b positifs : a ≤ b équivaut à a² ≤ b² (et à √a ≤ √b)." },
    ];
    return qcmOf(r, pool, "Regarde le signe du nombre par lequel on multiplie.");
  }, QCM),
  mk("nr-encadrement", "Ensemble des nombres réels — série C", 3, { skill: "Encadrer une somme, une différence, un produit", ref: `${BOOK}, chap. 8 §2.2, TD 2-3 (p. 142-143) et ex. 2.d (p. 145)`, kw: ["encadrement", "somme", "différence", "produit", "quotient"] }, (_c, r) => {
    const a1 = int(r, 1, 5), a2 = a1 + int(r, 1, 4), b1 = int(r, 1, 5), b2 = b1 + int(r, 1, 4);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `On a ${a1} ≤ a ≤ ${a2} et ${b1} ≤ b ≤ ${b2}. Quelle est la plus petite valeur possible de a + b ?`, answer: num(a1 + b1), hints: H("On additionne membre à membre.", `${a1} + ${b1} ≤ a + b ≤ ${a2} + ${b2}.`, "Le minimum est la borne de gauche.", "Calcule."), solution: `${a1 + b1} ≤ a + b ≤ ${a2 + b2} : la plus petite valeur est ${a1 + b1}.` };
    if (t === 1) return { statement: `On a ${a1} ≤ a ≤ ${a2} et ${b1} ≤ b ≤ ${b2}. Quelle est la plus grande valeur possible de a − b ?`, answer: num(a2 - b1), hints: H("On encadre d'abord −b.", `−${b2} ≤ −b ≤ −${b1}.`, "Puis on additionne les encadrements.", `${a2} − ${b1}.`), solution: `${a1 - b2} ≤ a − b ≤ ${a2 - b1} : la plus grande valeur est ${a2 - b1}.` };
    return { statement: `On a ${a1} ≤ a ≤ ${a2} et ${b1} ≤ b ≤ ${b2} (nombres positifs). Quelle est la plus grande valeur possible de a × b ?`, answer: num(a2 * b2), hints: H("Pour des nombres positifs, on multiplie membre à membre.", `${a1} × ${b1} ≤ ab ≤ ${a2} × ${b2}.`, "Le maximum est la borne de droite.", "Calcule."), solution: `${a1 * b1} ≤ ab ≤ ${a2 * b2} : la plus grande valeur est ${a2 * b2}.` };
  }, FR),
  mk("nr-partie-entiere", "Ensemble des nombres réels — série C", 2, { skill: "Partie entière d'un réel", ref: `${BOOK}, chap. 8 §2.1, définition (p. 141) et ex. 3-4, 16 (p. 143, 153)`, kw: ["partie entière", "E(x)", "n ≤ x < n + 1"] }, (_c, r) => {
    const x = rnd(r) * (int(r, 11, 99) / 10);
    const E = Math.floor(x);
    return { statement: `Quelle est la partie entière E(x) de x = ${n2(x)} ?`, answer: num(E), hints: H("E(x) est l'unique entier n tel que n ≤ x < n + 1.", "C'est le plus grand entier inférieur ou égal à x.", x < 0 ? "Pour un négatif, l'entier est « en dessous » : −2,3 se situe entre −3 et −2." : "Garde la partie avant la virgule.", `${E} ≤ ${n2(x)} < ${E + 1}.`), solution: `${E} ≤ ${n2(x)} < ${E + 1} donc E(${n2(x)}) = ${n2(E)}.` };
  }, FR),
  mk("nr-majorant", "Ensemble des nombres réels — série C", 3, { skill: "Majorant, minorant, maximum, minimum", ref: `${BOOK}, chap. 8 §2.3, définitions (p. 144-145)`, kw: ["majorant", "minorant", "maximum", "minimum", "intervalle"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quel est le maximum de l'intervalle [0 ; 1] ?", good: "1", bad: ["0", "Il n'a pas de maximum", "0,5"], why: "1 appartient à [0 ; 1] et est supérieur ou égal à tout élément." },
      { q: "L'intervalle ]−∞ ; a[ admet-il un maximum ?", good: "Non", bad: ["Oui, a", "Oui, a − 1", "Oui, 0"], why: "a n'appartient pas à l'intervalle, et pour tout M < a, le nombre (a + M)/2 est dans l'intervalle et plus grand que M." },
      { q: "ℕ est-il majoré dans ℝ ?", good: "Non, mais il est minoré (par 0)", bad: ["Oui, par 1 000", "Oui et non minoré", "Ni majoré ni minoré"], why: "ℕ est minoré par 0, −1, −π… mais n'est pas majoré." },
      { q: "A est l'ensemble des inverses des entiers naturels non nuls (1, 1/2, 1/3, …). Quel est son maximum ?", good: "1", bad: ["0", "Il n'en a pas", "1/2"], why: "Pour tout entier n ≥ 1, 1/n ≤ 1, et 1 appartient à A." },
      { q: "A est l'ensemble des inverses des entiers naturels non nuls. Admet-il un minimum ?", good: "Non (0 est un minorant mais n'appartient pas à A)", bad: ["Oui, 0", "Oui, 1", "Oui, 1/2"], why: "0 est un minorant mais n'est pas dans A, et A n'a pas de plus petit élément." },
      { q: "Une partie finie de ℝ admet-elle un maximum et un minimum ?", good: "Oui, toujours (si elle est non vide)", bad: ["Non, jamais", "Seulement un maximum", "Seulement si elle contient 0"], why: "Toute partie finie non vide de ℝ admet un maximum et un minimum." },
    ];
    return qcmOf(r, pool, "Un maximum doit appartenir à l'ensemble.");
  }, QCM),
  mk("nr-valeur-absolue", "Ensemble des nombres réels — série C", 2, { skill: "Valeur absolue et distance dans ℝ", ref: `${BOOK}, chap. 8 §3.1-3.2, propriétés (p. 146-148) et ex. 19-23 (p. 153)`, kw: ["valeur absolue", "distance", "|x − y|", "inéquation |x − a| ≤ r"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 9), x = rnd(r) * int(r, 1, 12);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Calcule |${par(x)} − ${par(a)}| (la distance des réels ${n2(x)} et ${n2(a)}).`, answer: num(Math.abs(x - a)), hints: H("La distance de x et y est |x − y|.", `x − a = ${n2(x - a)}.`, "On prend la valeur absolue.", "Calcule."), solution: `|${n2(x)} − ${par(a)}| = |${n2(x - a)}| = ${Math.abs(x - a)}.` };
    if (t === 1) { const rr = int(r, 1, 6); return { statement: `Combien de nombres entiers x vérifient |x − ${par(a)}| ≤ ${rr} ?`, answer: num(2 * rr + 1), hints: H("|x − a| ≤ r équivaut à a − r ≤ x ≤ a + r.", `${n2(a - rr)} ≤ x ≤ ${n2(a + rr)}.`, "Compte les entiers de l'intervalle fermé.", `(a + r) − (a − r) + 1.`), solution: `x ∈ [${n2(a - rr)} ; ${n2(a + rr)}] : ${2 * rr + 1} entiers.` }; }
    const rr = int(r, 1, 6);
    return { statement: `Résous |x − ${par(a)}| = ${rr}. Quelle est la somme des deux solutions ?`, answer: num(2 * a), hints: H("|x − a| = r équivaut à x = a + r ou x = a − r.", `Solutions : ${n2(a + rr)} et ${n2(a - rr)}.`, "Additionne-les.", `2a.`), solution: `x = ${n2(a + rr)} ou x = ${n2(a - rr)} ; somme : ${n2(2 * a)}.` };
  }, FR),
  mk("nr-valeurs-approchees", "Ensemble des nombres réels — série C", 3, { skill: "Valeur approchée à ε près et incertitude", ref: `${BOOK}, chap. 8 §3.2, valeurs approchées (p. 147-148) et ex. 24-29 (p. 153)`, kw: ["valeur approchée", "incertitude", "ε", "à 10⁻ⁿ près", "calcul approché"] }, (_c, r) => {
    const m = int(r, 2, 6), x = 3.14159;
    const eps = pick(r, [0.01, 0.001, 0.005, 0.05]);
    const ok = int(r, 0, 1) === 0;
    const y = ok ? round(x + eps / 2, 5) : round(x + 2 * eps, 5);
    return { statement: `Le nombre ${fr(y)} est-il une valeur approchée de π (≈ ${fr(x)}…) à ${fr(eps)} près ?`, answer: choice(r, ["Oui", "Non"], Math.abs(y - x) <= eps ? 0 : 1), hints: H("y est une valeur approchée de x à ε près si |x − y| ≤ ε.", `|π − ${fr(y)}| ≈ ${fr(round(Math.abs(y - x), 5))}.`, `ε = ${fr(eps)}.`, "Compare."), solution: `|x − y| ≈ ${fr(round(Math.abs(y - x), 5))} ${Math.abs(y - x) <= eps ? "≤" : ">"} ${fr(eps)} : ${Math.abs(y - x) <= eps ? "oui" : "non"}.${m ? "" : ""}` };
  }, QCM),

  // ===== Chapitre 9 : Fonctions =====
  mk("fonc-image", "Généralités sur les fonctions — série C", 1, { skill: "Image et antécédent par une fonction", ref: `${BOOK}, chap. 9 §1.1 (p. 156) et ex. 1.a-1.c (p. 161)`, kw: ["image", "antécédent", "fonction", "f(x)", "calculer"] }, (_c, r) => {
    const a = int(r, 1, 5), b = rnd(r) * int(r, 1, 9), x = rnd(r) * int(r, 1, 6);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `f est la fonction définie sur ℝ par f(x) = ${quad(a, 0, b)}. Calcule f(${par(x)}).`, answer: num(a * x * x + b), hints: H("On remplace x par sa valeur.", `x² = ${x * x}.`, `${a} × ${x * x} ${b < 0 ? "−" : "+"} ${Math.abs(b)}.`, "Calcule."), solution: `f(${n2(x)}) = ${a} × ${x * x} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${a * x * x + b}.` };
    if (t === 1) { const y = a * x * x + b; return { statement: `f(x) = ${quad(a, 0, b)}. Combien de nombres réels ont pour image ${y} ?`, answer: num(x === 0 ? 1 : 2), hints: H("On résout f(x) = " + y + ".", `${a}x² = ${y - b}.`, `x² = ${(y - b) / a}.`, x === 0 ? "x² = 0 : une seule solution." : "Deux nombres opposés."), solution: x === 0 ? `x² = 0 : une seule solution (0).` : `x² = ${x * x} : x = ${Math.abs(x)} ou x = ${-Math.abs(x)} : 2 antécédents.` }; }
    return { statement: `f(x) = ${lin(a, b)}. Quel est l'antécédent de ${n2(a * x + b)} ?`, answer: num(x), hints: H("On résout f(x) = " + n2(a * x + b) + ".", `${lin(a, b)} = ${n2(a * x + b)}.`, `${a}x = ${n2(a * x)}.`, "Divise."), solution: `${lin(a, b)} = ${n2(a * x + b)} ⇒ x = ${n2(x)}.` };
  }, FR),
  mk("fonc-ensemble-def", "Généralités sur les fonctions — série C", 3, { skill: "Ensemble de définition d'une fonction", ref: `${BOOK}, chap. 9 §1.3, ex. 1.d (p. 159, 161)`, kw: ["ensemble de définition", "dénominateur", "racine carrée", "contraintes d'exécution"] }, (_c, r) => {
    const a = int(r, 1, 9), b = int(r, 1, 9);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Quelle est la valeur de x qui n'appartient PAS à l'ensemble de définition de f(x) = 1/(x − ${a}) ?`, answer: num(a), hints: H("Un dénominateur ne peut pas être nul.", `x − ${a} = 0.`, "Résous.", `x = ${a}.`), solution: `x − ${a} = 0 ⇔ x = ${a} : D = ℝ \\ {${a}}.` };
    if (t === 1) return { statement: `f(x) = √(x − ${a}). Quel est le plus petit nombre appartenant à l'ensemble de définition ?`, answer: num(a), hints: H("Une racine carrée exige un radicande positif ou nul.", `x − ${a} ≥ 0.`, `x ≥ ${a}.`, "Le plus petit est la borne."), solution: `x − ${a} ≥ 0 ⇔ x ≥ ${a} : D = [${a} ; +∞[ ; plus petit nombre : ${a}.` };
    return { statement: `f(x) = √(${a} − x) / (x + ${b}). Combien d'entiers positifs ou nuls inférieurs à ${a + 3} ne sont PAS dans l'ensemble de définition ?`, answer: num(Math.max(0, a + 3 - (a + 1))), hints: H("Il faut ${a} − x ≥ 0 et x + b ≠ 0.", `x ≤ ${a} et x ≠ −${b}.`, `Les entiers de 0 à ${a + 2} qui dépassent ${a} sont exclus.`, "Compte-les."), solution: `D = ]−∞ ; ${a}] \\ {−${b}} : les entiers ${a + 1} à ${a + 2} sont exclus, soit ${Math.max(0, a + 2 - a)} entiers.` };
  }, FR),
  mk("fonc-variation", "Généralités sur les fonctions — série C", 3, { skill: "Sens de variation : lecture d'un tableau de variation", ref: `${BOOK}, chap. 9 §3.2, définitions et exemple (p. 166-167) et ex. 3.c (p. 168)`, kw: ["tableau de variation", "croissante", "décroissante", "maximum", "minimum"] }, (_c, r) => {
    const a = int(r, -4, 0), m1 = a + int(r, 2, 4), b = m1 + int(r, 2, 4);
    const fa = int(r, -3, 4), fm = fa + int(r, 2, 6), fb = fm - int(r, 2, 6);
    const t = int(r, 0, 2);
    const tab = `f est croissante sur [${n2(a)} ; ${n2(m1)}] de ${n2(fa)} à ${n2(fm)}, puis décroissante sur [${n2(m1)} ; ${n2(b)}] de ${n2(fm)} à ${n2(fb)}.`;
    if (t === 0) return { statement: `${tab} Quel est le maximum de f sur [${n2(a)} ; ${n2(b)}] ?`, answer: num(fm), hints: H("La fonction monte puis descend.", "Le maximum est atteint là où elle change de sens.", `Valeur en ${n2(m1)} : ${n2(fm)}.`, "Lis la valeur."), solution: `Le maximum est f(${n2(m1)}) = ${n2(fm)}.` };
    if (t === 1) return { statement: `${tab} f est-elle croissante sur [${n2(a)} ; ${n2(b)}] tout entier ?`, answer: choice(r, ["Oui", "Non"], 1), hints: H("Une fonction croissante ne descend jamais.", "Après le changement de sens elle décroît.", "Sur l'intervalle entier elle n'est pas monotone.", "Non."), solution: `f décroît sur [${n2(m1)} ; ${n2(b)}] : elle n'est pas croissante sur tout l'intervalle.` };
    return { statement: `${tab} Quel est le plus petit des deux nombres f(${n2(a)}) et f(${n2(b)}) ?`, answer: num(Math.min(fa, fb)), hints: H("Le minimum de f sur l'intervalle est atteint à une extrémité.", `f(${n2(a)}) = ${n2(fa)} et f(${n2(b)}) = ${n2(fb)}.`, "Compare les deux valeurs.", "Prends la plus petite."), solution: `f(${n2(a)}) = ${n2(fa)} ; f(${n2(b)}) = ${n2(fb)} : le plus petit est ${n2(Math.min(fa, fb))}.` };
  }, FR),
  mk("fonc-croissance-demo", "Généralités sur les fonctions — série C", 3, { skill: "Montrer qu'une fonction est strictement croissante (taux d'accroissement)", ref: `${BOOK}, chap. 9 §3.3, TD (p. 168) et ex. 3.a`, kw: ["taux d'accroissement", "croissante", "(f(v) − f(u))/(v − u)", "signe"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 6), b = int(r, 1, 9);
    const strict = a > 0;
    return { statement: `f(x) = ${lin(a, b)}. Pour u ≠ v, le quotient (f(v) − f(u))/(v − u) est un nombre constant. Quelle est sa valeur ?`, answer: num(a), hints: H("On calcule le taux d'accroissement de f entre u et v.", `f(v) − f(u) = ${a}(v − u).`, "On simplifie par (v − u).", `Le quotient est ${n2(a)}.`), solution: `(f(v) − f(u))/(v − u) = ${a}(v − u)/(v − u) = ${n2(a)} : f est strictement ${strict ? "croissante" : "décroissante"} sur ℝ.` };
  }, FR),
  mk("fonc-parite", "Étude de fonctions élémentaires — série C", 2, { skill: "Fonction carré, valeur absolue, partie entière : propriétés", ref: `${BOOK}, chap. 9, ex. 1.e et chap. 12 §2.2 (p. 207-211)`, kw: ["fonction carré", "valeur absolue", "partie entière", "symétrie", "parabole"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "La fonction carré x ↦ x² est…", good: "décroissante sur ]−∞ ; 0] et croissante sur [0 ; +∞[", bad: ["croissante sur ℝ", "décroissante sur ℝ", "croissante sur ]−∞ ; 0] et décroissante sur [0 ; +∞["], why: "u < v ≤ 0 ⇒ u² > v² (décroissante) ; 0 ≤ u < v ⇒ u² < v² (croissante) ; minimum 0 en 0." },
      { q: "Quel est le minimum de la fonction carré sur ℝ ?", good: "0, atteint en 0", bad: ["1, atteint en 1", "Elle n'a pas de minimum", "−1"], why: "x² ≥ 0 pour tout réel x et 0² = 0." },
      { q: "La représentation graphique de la fonction valeur absolue est symétrique par rapport à…", good: "l'axe des ordonnées (OJ)", bad: ["l'axe des abscisses (OI)", "l'origine O", "la droite y = x"], why: "|−x| = |x| : la courbe est symétrique par rapport à l'axe des ordonnées." },
      { q: "Que vaut E(−2,3) ?", good: "−3", bad: ["−2", "2", "−2,3"], why: "−3 ≤ −2,3 < −2 : la partie entière est −3." },
      { q: "La fonction partie entière est…", good: "une fonction en escalier définie sur ℝ", bad: ["une fonction affine", "décroissante sur ℝ", "continue sur ℝ"], why: "Pour tout n entier, E(x) = n sur [n ; n + 1[ : fonction en escalier (constante par intervalles)." },
      { q: "La fonction valeur absolue est…", good: "une fonction affine par intervalles", bad: ["une fonction affine sur ℝ", "constante sur ℝ", "croissante sur ℝ"], why: "Elle coïncide avec −x sur ]−∞ ; 0] et avec x sur [0 ; +∞[." },
    ];
    return qcmOf(r, pool, "Dessine la courbe de la fonction.");
  }, QCM),
  mk("fonc-affine-intervalles", "Étude de fonctions élémentaires — série C", 3, { skill: "Fonction affine par intervalles : calculer une image", ref: `${BOOK}, chap. 12 §1, ex. 1.a-1.e (p. 206-210)`, kw: ["fonction affine par intervalles", "intervalles", "valeur pivot", "image"] }, (_c, r) => {
    const s = int(r, 1, 6), a1 = rnd(r) * int(r, 1, 4), b1 = int(r, -6, 6), a2 = rnd(r) * int(r, 1, 4);
    const b2 = (a1 - a2) * s + b1; // continuité en s
    const x = r() < 0.5 ? s - int(r, 1, 5) : s + int(r, 1, 5);
    const v = x <= s ? a1 * x + b1 : a2 * x + b2;
    return { statement: `f est définie par f(x) = ${lin(a1, b1)} si x ≤ ${s}, et f(x) = ${lin(a2, b2)} si x > ${s}. Calcule f(${par(x)}).`, answer: num(v), hints: H("On repère l'intervalle auquel x appartient.", x <= s ? `${n2(x)} ≤ ${s} : on utilise la première expression.` : `${n2(x)} > ${s} : on utilise la seconde expression.`, "Remplace x.", "Calcule."), solution: `${n2(x)} ${x <= s ? "≤" : ">"} ${s} : f(${n2(x)}) = ${n2(v)}.` };
  }, FR),
  mk("fonc-affine-valeur-absolue", "Étude de fonctions élémentaires — série C", 3, { skill: "Fonction contenant une valeur absolue : écrire sans |…|", ref: `${BOOK}, chap. 12 §1.1, fonction dont l'expression contient des valeurs absolues (p. 207-208) et ex. 1.c`, kw: ["valeur absolue", "valeur pivot", "affine par intervalles", "|ax + b|"] }, (_c, r) => {
    const a = int(r, 2, 5), p = rnd(r) * int(r, 1, 6), x0 = rnd(r) * int(r, 1, 5);
    const x = x0;
    const val = Math.abs(a * x - a * p);
    return { statement: `Calcule |${lin(a, -a * p)}| pour x = ${par(x)}.`, answer: num(val), hints: H("On calcule d'abord ce qui est à l'intérieur.", `${a} × ${par(x)} − ${par(a * p)} = ${n2(a * x - a * p)}.`, "Puis la valeur absolue.", "Prends l'opposé si c'est négatif."), solution: `|${n2(a * x - a * p)}| = ${val}.` };
  }, FR),
  mk("fonc-image-ensemble", "Généralités sur les fonctions — série C", 3, { skill: "Image directe et image réciproque d'un ensemble", ref: `${BOOK}, chap. 9 §2.2-2.3 (p. 162-164) et ex. 2.b (p. 165)`, kw: ["image directe", "image réciproque", "f(E)", "intervalle"] }, (_c, r) => {
    const a = int(r, 1, 4), lo = int(r, -3, 0), hi = lo + int(r, 2, 5);
    const pool = int(r, 0, 1);
    if (pool === 0) return { statement: `f(x) = ${a}x ${r() < 0.5 ? "+" : "−"} 1 est croissante sur ℝ. On pose f(x) = ${a}x + 1. Quelle est la borne supérieure de l'image directe f([${n2(lo)} ; ${n2(hi)}]) ?`, answer: num(a * hi + 1), hints: H("f est croissante : l'image d'un intervalle est un intervalle.", `f(${n2(lo)}) et f(${n2(hi)}).`, "La borne supérieure est f(hi).", "Calcule."), solution: `f([${n2(lo)} ; ${n2(hi)}]) = [${n2(a * lo + 1)} ; ${n2(a * hi + 1)}] : borne supérieure ${n2(a * hi + 1)}.` };
    return { statement: `f(x) = x². Combien de nombres entiers appartiennent à l'image réciproque de [0 ; 9] ?`, answer: num(7), hints: H("On cherche les x tels que 0 ≤ x² ≤ 9.", "−3 ≤ x ≤ 3.", "Compte les entiers de −3 à 3.", "7."), solution: `f⁻¹([0 ; 9]) = [−3 ; 3] : les entiers −3, −2, −1, 0, 1, 2, 3 : 7 entiers.` };
  }, FR),

  // ===== Chapitre 10 : Polynômes et fractions rationnelles =====
  mk("poly-degre", "Polynômes et fractions rationnelles — série C", 2, { skill: "Degré, somme et produit de polynômes", ref: `${BOOK}, chap. 10 §1, ex. 1.a-1.d et 2-3 (p. 176-186)`, kw: ["polynôme", "degré", "somme", "produit", "coefficient"] }, (_c, r) => {
    const d1 = int(r, 2, 6), d2 = int(r, 2, 6);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `P est un polynôme de degré ${d1} et Q un polynôme de degré ${d2}. Quel est le degré de P × Q ?`, answer: num(d1 + d2), hints: H("Les termes de plus haut degré se multiplient.", `x${sup(d1)} × x${sup(d2)} = x${sup(d1 + d2)}.`, "Les degrés s'additionnent.", `${d1} + ${d2}.`), solution: `d°(PQ) = ${d1} + ${d2} = ${d1 + d2}.` };
    if (t === 1) { const lo = Math.min(d1, d2), hi = Math.max(d1, d2); return { statement: `P est de degré ${hi} et Q de degré ${lo} avec ${lo} < ${hi}. Quel est le degré de P + Q ?`, answer: num(hi), hints: H("Le terme de plus haut degré ne s'annule pas.", `P a un terme en x${sup(hi)}, Q n'en a pas.`, "Le degré de la somme est le plus grand.", "Recopie."), solution: `Si d°(P) ≠ d°(Q), d°(P + Q) = max = ${hi}.` }; }
    const a = int(r, 1, 5), b = int(r, 1, 5);
    return { statement: `Quel est le coefficient de x² dans le produit (x + ${a})(x + ${b}) ?`, answer: num(1), hints: H("On développe.", `x² + ${a + b}x + ${a * b}.`, "Lis le coefficient.", "1."), solution: `(x + ${a})(x + ${b}) = x² + ${a + b}x + ${a * b} : le coefficient de x² est 1.` };
  }, FR),
  mk("poly-racines", "Polynômes et fractions rationnelles — série C", 2, { skill: "Racine d'un polynôme", ref: `${BOOK}, chap. 10 §1.1 et §3.1 (p. 176-182) et ex. 1.d (p. 186)`, kw: ["racine", "P(α) = 0", "polynôme", "évidente"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 5), b = rnd(r) * int(r, 1, 5);
    const c = -(a + b), d = a * b; // x² + c x + d, racines a,b
    const x = pick(r, [a, b, a + 1, b - 1]);
    const v = x * x + c * x + d;
    return { statement: `P(x) = ${quad(1, c, d)}. Le nombre ${n2(x)} est-il une racine de P ?`, answer: choice(r, ["Oui", "Non"], v === 0 ? 0 : 1), hints: H("α est racine de P si P(α) = 0.", `Calcule P(${n2(x)}).`, `${x * x} ${c * x < 0 ? "−" : "+"} ${Math.abs(c * x)} ${d < 0 ? "−" : "+"} ${Math.abs(d)} = ${v}.`, "Compare à 0."), solution: `P(${n2(x)}) = ${n2(v)} ${v === 0 ? "= 0 : oui" : "≠ 0 : non"}.` };
  }, QCM),
  mk("poly-forme-canonique", "Polynômes et fractions rationnelles — série C", 3, { skill: "Forme canonique d'un trinôme", ref: `${BOOK}, chap. 10 §2.1, cas général et méthode (p. 178-179)`, kw: ["forme canonique", "a(x + α)² + β", "trinôme", "second degré"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 4), al = rnd(r) * int(r, 1, 5), be = rnd(r) * int(r, 1, 9);
    // a(x+al)^2 + be = a x² + 2 a al x + a al² + be
    const A = a, B = 2 * a * al, C = a * al * al + be;
    const asked = int(r, 0, 1);
    return { statement: `On met ${quad(A, B, C)} sous la forme canonique a(x + α)² + β. Quelle est la valeur de ${asked === 0 ? "α" : "β"} ?`, answer: num(asked === 0 ? al : be), hints: H("On met a en facteur puis on complète le carré.", `${quad(A, B, C)} = ${A}(x² + ${fr(B / A)}x) ${C < 0 ? "−" : "+"} ${Math.abs(C)}.`, `α = b/(2a) = ${B}/${2 * A}.`, "β = c − a α²."), solution: `${quad(A, B, C)} = ${A}(x ${al < 0 ? "−" : "+"} ${Math.abs(al)})² ${be < 0 ? "−" : "+"} ${Math.abs(be)} : α = ${n2(al)}, β = ${n2(be)}.` };
  }, FR),
  mk("poly-racines-trinome", "Polynômes et fractions rationnelles — série C", 3, { skill: "Racines d'un trinôme et factorisation", ref: `${BOOK}, chap. 10 §2.1, factorisation d'un polynôme du second degré (p. 179) et ex. 2.a (p. 180)`, kw: ["racines", "factoriser", "trinôme", "différence de deux carrés"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 7), b = rnd(r) * int(r, 1, 7);
    if (a === b) return { statement: "P(x) = x² − 4x + 3. Quelle est la plus grande racine ?", answer: num(3), hints: H("On factorise.", "(x − 1)(x − 3).", "Racines 1 et 3.", "3."), solution: "x² − 4x + 3 = (x − 1)(x − 3) : racines 1 et 3." };
    const s = a + b, p = a * b;
    return { statement: `P(x) = ${quad(1, -s, p)}. Quelle est la plus grande racine de P ?`, answer: num(Math.max(a, b)), hints: H("On cherche deux nombres de somme " + n2(s) + " et de produit " + n2(p) + ".", `Les racines vérifient x₁ + x₂ = ${n2(s)} et x₁ x₂ = ${n2(p)}.`, `P(x) = (x − ${par(a)})(x − ${par(b)}).`, "Compare."), solution: `P(x) = (x − ${par(a)})(x − ${par(b)}) : racines ${n2(a)} et ${n2(b)} ; la plus grande est ${n2(Math.max(a, b))}.` };
  }, FR),
  mk("poly-signe", "Polynômes et fractions rationnelles — série C", 3, { skill: "Signe d'un trinôme", ref: `${BOOK}, chap. 10 §2.1, étude du signe (p. 179-180) et ex. 2.b`, kw: ["signe", "trinôme", "tableau de signes", "entre les racines"] }, (_c, r) => {
    const a = int(r, 1, 6), b = a + int(r, 1, 6);
    const sgn = int(r, 0, 1) === 0 ? 1 : -1;
    const A = sgn; const B = -sgn * (a + b), C = sgn * a * b;
    const x = int(r, 0, 1) === 0 ? Math.floor((a + b) / 2) + (a + b) % 2 * 0 : b + int(r, 1, 3);
    const val = A * x * x + B * x + C;
    const neg = val < 0;
    return { statement: `P(x) = ${quad(A, B, C)} (racines ${a} et ${b}). Le nombre P(${x}) est-il négatif ?`, answer: choice(r, ["Oui", "Non"], neg ? 0 : 1), hints: H("Un trinôme est du signe de a à l'extérieur des racines.", `Ici a = ${A}.`, `${x} est ${x > a && x < b ? "entre les racines" : "à l'extérieur des racines"}.`, `P(${x}) = ${val}.`), solution: `P(${x}) = ${val} : ${neg ? "négatif" : "positif ou nul"}.` };
  }, QCM),
  mk("poly-division", "Polynômes et fractions rationnelles — série C", 3, { skill: "Factoriser par x − α (racine évidente)", ref: `${BOOK}, chap. 10 §3.2, coefficients indéterminés et division euclidienne (p. 182-183)`, kw: ["division euclidienne", "x − α", "racine évidente", "coefficients indéterminés"] }, (_c, r) => {
    const al = rnd(r) * int(r, 1, 3), b = rnd(r) * int(r, 1, 4), c = rnd(r) * int(r, 1, 4);
    // P(x) = (x - al)(x^2 + b x + c) = x^3 + (b - al) x^2 + (c - al b) x - al c
    const p2 = b - al, p1 = c - al * b, p0 = -al * c;
    const asked = int(r, 0, 1);
    return { statement: `P(x) = x³ ${p2 < 0 ? "−" : "+"} ${Math.abs(p2)}x² ${p1 < 0 ? "−" : "+"} ${Math.abs(p1)}x ${p0 < 0 ? "−" : "+"} ${Math.abs(p0)} admet ${n2(al)} pour racine. On écrit P(x) = (x − ${par(al)})(x² + bx + c). Quelle est la valeur de ${asked === 0 ? "b" : "c"} ?`, answer: num(asked === 0 ? b : c), hints: H("On développe (x − α)(x² + bx + c).", `On trouve x³ + (b − ${par(al)})x² + (c − ${par(al)}b)x − ${par(al)}c.`, "On identifie les coefficients.", asked === 0 ? `b − ${par(al)} = ${n2(p2)}.` : `−${par(al)}c = ${n2(p0)}.`), solution: `Par identification : b = ${n2(b)} et c = ${n2(c)} : P(x) = (x − ${par(al)})(x² ${b < 0 ? "−" : "+"} ${Math.abs(b)}x ${c < 0 ? "−" : "+"} ${Math.abs(c)}).` };
  }, FR),
  mk("frac-ensemble-def", "Polynômes et fractions rationnelles — série C", 3, { skill: "Fraction rationnelle : ensemble de définition et simplification", ref: `${BOOK}, chap. 10 §4.1, simplification de fractions rationnelles (p. 184) et ex. 4.a-4.b (p. 185)`, kw: ["fraction rationnelle", "ensemble de définition", "racines du dénominateur", "simplifier"] }, (_c, r) => {
    const a = int(r, 1, 6), b = int(r, 1, 6);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Combien de nombres réels n'appartiennent PAS à l'ensemble de définition de f(x) = (x + 1)/(x² − ${a * a}) ?`, answer: num(2), hints: H("On exclut les racines du dénominateur.", `x² − ${a * a} = 0.`, `x = ${a} ou x = −${a}.`, "Compte."), solution: `x² − ${a * a} = (x − ${a})(x + ${a}) : valeurs interdites ${a} et −${a} : 2.` };
    return { statement: `Simplifie f(x) = (x² − ${b * b})/(x − ${b}) pour x ≠ ${b}. Pour x = ${b + 2}, quelle est la valeur de la fraction simplifiée ?`, answer: num(2 * b + 2), hints: H("On factorise le numérateur.", `x² − ${b * b} = (x − ${b})(x + ${b}).`, `f(x) = x + ${b} pour x ≠ ${b}.`, `${b + 2} + ${b}.`), solution: `f(x) = x + ${b} : f(${b + 2}) = ${2 * b + 2}.` };
  }, FR),

  // ===== Chapitre 11 : Équations et inéquations dans ℝ =====
  mk("eq-contraintes", "Équations et inéquations dans ℝ — série C", 2, { skill: "Équations avec fractions : contraintes sur l'inconnue", ref: `${BOOK}, chap. 11 §1.1-1.2, exemples (p. 190-191) et ex. 3 (p. 202)`, kw: ["contraintes sur l'inconnue", "équation", "fractions", "dénominateur"] }, (_c, r) => {
    const a = int(r, 1, 6), b = int(r, 1, 6);
    const x = int(r, 2, 8) + a;
    // (x+b)/(x-a) = k  → pick k so x solution
    const val = (x + b) / (x - a);
    if (!Number.isInteger(val)) return { statement: "Résous (x + 3)/(x − 1) = 2. Quelle est la solution ?", answer: num(5), hints: H("Contrainte : x ≠ 1.", "x + 3 = 2(x − 1).", "x = 5.", "5 ≠ 1."), solution: "x + 3 = 2x − 2 ⇒ x = 5 (5 ≠ 1 : acceptable)." };
    return { statement: `Résous (x + ${b})/(x − ${a}) = ${val}. Quelle est la solution ?`, answer: num(x), hints: H(`Contrainte : x ≠ ${a}.`, `x + ${b} = ${val}(x − ${a}).`, `${val}x − ${val * a} = x + ${b}.`, "Isole x."), solution: `x + ${b} = ${val}x − ${val * a} ⇒ ${val - 1}x = ${b + val * a} ⇒ x = ${x} (≠ ${a} : acceptable).` };
  }, FR),
  mk("eq-polynomiale", "Équations et inéquations dans ℝ — série C", 3, { skill: "Équation du second degré (somme et produit des racines)", ref: `${BOOK}, chap. 11 §1.2, méthode (p. 192) et chap. 10 §2 (p. 178-180)`, kw: ["équation du second degré", "racines", "forme canonique", "discriminant"] }, (_c, r) => {
    let a = rnd(r) * int(r, 1, 8), b = rnd(r) * int(r, 1, 8);
    if (a === b) b = a + 1;
    const s = a + b, p = a * b;
    const asked = int(r, 0, 2);
    const ans = [Math.max(a, b), Math.min(a, b), s][asked];
    const lbl = ["la plus grande solution", "la plus petite solution", "la somme des solutions"][asked];
    return { statement: `Résous l'équation ${quad(1, -s, p)} = 0. Quelle est ${lbl} ?`, answer: num(ans), hints: H("On cherche deux nombres de somme " + n2(s) + " et de produit " + n2(p) + ".", `x₁ + x₂ = ${n2(s)} ; x₁ x₂ = ${n2(p)}.`, `Les solutions sont ${n2(a)} et ${n2(b)}.`, "Réponds à la question."), solution: `${quad(1, -s, p)} = (x − ${par(a)})(x − ${par(b)}) : solutions ${n2(a)} et ${n2(b)}.` };
  }, FR),
  mk("ineq-polynome", "Équations et inéquations dans ℝ — série C", 3, { skill: "Inéquation du second degré : ensemble de solutions", ref: `${BOOK}, chap. 11 §2-3, ex. 2.a-2.d (p. 194-197)`, kw: ["inéquation", "second degré", "signe", "ensemble de solutions", "tableau de signes"] }, (_c, r) => {
    const a = int(r, -5, 0), b = a + int(r, 2, 6);
    const neg = int(r, 0, 1) === 0;
    const mid = Math.floor((a + b) / 2);
    const cand = [a - 1, mid, b + 1, a, b];
    const x = pick(r, cand);
    const val = (x - a) * (x - b);
    const sol = neg ? val < 0 : val > 0;
    return { statement: `On résout (x − ${par(a)})(x − ${par(b)}) ${neg ? "<" : ">"} 0. Le nombre ${n2(x)} est-il solution ?`, answer: choice(r, ["Oui", "Non"], sol ? 0 : 1), hints: H("On étudie le signe du produit.", `Les racines sont ${n2(a)} et ${n2(b)}.`, "Un trinôme de coefficient 1 est positif à l'extérieur des racines.", `(${n2(x)} − ${par(a)})(${n2(x)} − ${par(b)}) = ${val}.`), solution: `(${n2(x)} − ${par(a)})(${n2(x)} − ${par(b)}) = ${val} : ${sol ? "solution" : "pas solution"}.` };
  }, QCM),
  mk("eq-valeurs-absolues", "Équations et inéquations dans ℝ — série C", 3, { skill: "Équation |f(x)| = |g(x)| et |ax + b| = c", ref: `${BOOK}, chap. 11 §4.1, exemples et méthode (p. 199) et ex. 4.a-4.b (p. 200)`, kw: ["valeur absolue", "|f(x)| = |g(x)|", "deux cas", "équation"] }, (_c, r) => {
    const a = int(r, 2, 5), b = rnd(r) * int(r, 1, 8), c = int(r, 1, 9);
    const t = int(r, 0, 1);
    if (t === 0) { const x1 = (c - b) / a, x2 = (-c - b) / a; return { statement: `Résous |${lin(a, b)}| = ${c}. Quelle est la plus grande solution (arrondie au centième) ?`, answer: num(round(Math.max(x1, x2), 2), 0.01), hints: H("|u| = c (c > 0) équivaut à u = c ou u = −c.", `${lin(a, b)} = ${c} ou ${lin(a, b)} = −${c}.`, `x = ${fr(round(x1, 3))} ou x = ${fr(round(x2, 3))}.`, "Prends la plus grande."), solution: `x = ${fr(round(x1, 2))} ou x = ${fr(round(x2, 2))}.` }; }
    const p = int(r, 1, 5), q = int(r, 1, 5);
    // |x - p| = |x + q| → x = (p - q)/2
    return { statement: `Résous |x − ${p}| = |x + ${q}|. Quelle est l'unique solution ?`, answer: num((p - q) / 2, 0.001), hints: H("Deux nombres de même valeur absolue sont égaux ou opposés.", `x − ${p} = x + ${q} (impossible) ou x − ${p} = −(x + ${q}).`, `2x = ${p - q}.`, "Divise par 2."), solution: `x − ${p} = −x − ${q} ⇒ 2x = ${p - q} ⇒ x = ${fr((p - q) / 2)}.` };
  }, FR),
  mk("eq-mise-en-equation", "Équations et inéquations dans ℝ — série C", 3, { skill: "Mettre un problème en équation (cinq étapes)", ref: `${BOOK}, chap. 11 §2.2, méthode (p. 195) et ex. 4-12 (p. 202-203)`, kw: ["problème", "mise en équation", "inconnue", "vérification", "conclusion"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const x = int(r, 8, 20), d = int(r, 3, 12); const aire = x * (x + d); return { statement: `Un champ rectangulaire a une largeur de x m et une longueur de (x + ${d}) m. Son aire est ${aire} m². On résout x² + ${d}x − ${aire} = 0. Quelle est la largeur positive (en m) ?`, answer: num(x), hints: H("On résout l'équation du second degré.", `On cherche x tel que x(x + ${d}) = ${aire}.`, `Teste ${x}.`, `${x} × ${x + d} = ${aire}.`), solution: `x(x + ${d}) = ${aire} ⇒ x = ${x} m (l'autre solution est négative).` }; }
    if (t === 1) { const P = int(r, 6, 20) * 100, k = int(r, 2, 5); return { statement: `Un prix augmente de ${k * 10} %, puis le nouveau prix est de ${P + (P * k * 10) / 100} F. Quel était le prix initial (en F) ? (on pose p l'inconnue : 1,${k} p = ${P + (P * k * 10) / 100})`, answer: num(P), hints: H("Une hausse de t % multiplie par 1 + t/100.", `Coefficient : 1,${k}.`, `p = ${P + (P * k * 10) / 100} ÷ 1,${k}.`, "Calcule."), solution: `p = ${P + (P * k * 10) / 100} ÷ 1,${k} = ${P} F.` }; }
    const v1 = int(r, 40, 70), d = int(r, 120, 300);
    return { statement: `Un voyageur parcourt ${d} km à la vitesse moyenne de ${v1} km/h. En notant t la durée (en h), on a ${v1}t = ${d}. Quelle est la durée (arrondie au centième d'heure) ?`, answer: num(round(d / v1, 2), 0.01), hints: H("Distance = vitesse × durée.", `${v1}t = ${d}.`, "t = d ÷ v.", "Calcule."), solution: `t = ${d} ÷ ${v1} ≈ ${fr(round(d / v1, 2))} h.` };
  }, [{ id: "probleme", label: "Problème" }]),

  // ===== Chapitre 12 : Inéquations dans ℝ × ℝ =====
  mk("ineq2-demi-plan", "Inéquations dans ℝ × ℝ (couples) — série C", 2, { skill: "Inéquation ax + by + c < 0 : le point est-il dans le demi-plan ?", ref: `${BOOK}, chap. 13 §1.3, théorème fondamental (p. 223) et ex. 1.c (p. 225)`, kw: ["demi-plan", "inéquation", "ax + by + c", "couple solution"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 5), b = rnd(r) * int(r, 1, 5), c0 = rnd(r) * int(r, 1, 9);
    const x = rnd(r) * int(r, 0, 5), y = rnd(r) * int(r, 0, 5);
    const v = a * x + b * y + c0;
    if (v === 0) return { statement: "Le point O(0 ; 0) vérifie-t-il x + y − 3 < 0 ?", answer: choice(r, ["Oui", "Non"], 0), hints: H("On remplace x et y.", "0 + 0 − 3 = −3.", "−3 < 0.", "Oui."), solution: "0 + 0 − 3 = −3 < 0 : oui." };
    const eq = `${lin(a, 0, "x")}${b < 0 ? " −" : " +"} ${Math.abs(b)}y${c0 < 0 ? " −" : " +"} ${Math.abs(c0)}`;
    return { statement: `Le point M(${n2(x)} ; ${n2(y)}) vérifie-t-il l'inéquation ${eq} < 0 ?`, answer: choice(r, ["Oui", "Non"], v < 0 ? 0 : 1), hints: H("On remplace x et y par les coordonnées de M.", `${a} × ${par(x)} + ${par(b)} × ${par(y)} + ${par(c0)}.`, `On obtient ${n2(v)}.`, "Compare à 0."), solution: `${eq.replace("x", `(${n2(x)})`).replace("y", `(${n2(y)})`)} = ${n2(v)} ${v < 0 ? "< 0 : oui" : "> 0 : non"}.`.replace(/\(([^)]*)\)\)/g, "($1)") };
  }, QCM),
  mk("ineq2-determinant", "Inéquations dans ℝ × ℝ (couples) — série C", 3, { skill: "Système de deux équations : déterminant et nombre de solutions", ref: `${BOOK}, chap. 13 §1.4, utilisation du déterminant (p. 224-225) et ex. 1.a (p. 225)`, kw: ["déterminant", "système", "solution unique", "ab' − a'b"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 5), b = rnd(r) * int(r, 1, 5), a2 = rnd(r) * int(r, 1, 5), b2 = rnd(r) * int(r, 1, 5);
    const det = a * b2 - a2 * b;
    return { statement: `Le système  ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}y = 1 ;  ${a2}x ${b2 < 0 ? "−" : "+"} ${Math.abs(b2)}y = 2 a pour déterminant ab′ − a′b. Quelle est sa valeur ?`, answer: num(det), hints: H("det = ab′ − a′b.", `a = ${a}, b = ${b}, a′ = ${a2}, b′ = ${b2}.`, `${a} × ${par(b2)} − ${par(a2)} × ${par(b)}.`, "Calcule."), solution: `det = ${a} × ${par(b2)} − ${par(a2)} × ${par(b)} = ${det}${det === 0 ? " : le système n'a pas de couple solution unique" : " ≠ 0 : un seul couple solution"}.` };
  }, FR),
  mk("ineq2-systeme", "Inéquations dans ℝ × ℝ (couples) — série C", 3, { skill: "Résoudre un système de deux équations à deux inconnues", ref: `${BOOK}, chap. 13 §1.4, ex. 1.a (p. 225) et chap. 13 §2.1 (p. 226)`, kw: ["système", "substitution", "combinaison", "couple", "deux inconnues"] }, (_c, r) => {
    const x = rnd(r) * int(r, 1, 6), y = rnd(r) * int(r, 1, 6);
    let a = int(r, 1, 5), b = int(r, 1, 5), c = int(r, 1, 5), d = int(r, 1, 5);
    while (a * d - b * c === 0) d = int(r, 1, 6);
    const s = a * x + b * y, t = c * x - d * y;
    const asked = int(r, 0, 1);
    return { statement: `Résous le système  ${a}x + ${b}y = ${s} ;  ${c}x − ${d}y = ${t}. Quelle est la valeur de ${asked === 0 ? "x" : "y"} ?`, answer: num(asked === 0 ? x : y), hints: H("On élimine une inconnue.", "Multiplie les équations pour avoir des coefficients opposés.", "Additionne membre à membre.", "Remplace dans une équation."), solution: `Solution : (x ; y) = (${n2(x)} ; ${n2(y)}). Vérification : ${a}×${par(x)} + ${b}×${par(y)} = ${s} ; ${c}×${par(x)} − ${d}×${par(y)} = ${t}.` };
  }, FR),

  // ===== Chapitre 14 : Statistique à une variable =====
  mk("stat-vocabulaire", "Statistique à une variable — série C", 1, { skill: "Vocabulaire : caractère, modalité, effectif, fréquence", ref: `${BOOK}, chap. 14 §1 (p. 236-238)`, kw: ["caractère qualitatif", "quantitatif", "modalité", "effectif", "fréquence"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Le genre d'un ouvrage de bibliothèque (roman, poésie, manuel…) est un caractère…", good: "qualitatif", bad: ["quantitatif discret", "quantitatif continu", "aléatoire"], why: "Les modalités ne sont pas numériques : caractère qualitatif." },
      { q: "Le nombre d'enfants par foyer est un caractère…", good: "quantitatif", bad: ["qualitatif", "ni quantitatif ni qualitatif", "toujours regroupé en classes"], why: "Les modalités sont des nombres : caractère quantitatif." },
      { q: "Quelle est la somme des fréquences de toutes les modalités d'une série ?", good: "1 (ou 100 %)", bad: ["0", "L'effectif total", "Elle dépend de la série"], why: "Σ fᵢ = (1/N) Σ nᵢ = N/N = 1." },
      { q: "Si N est l'effectif total, la fréquence de la modalité xᵢ d'effectif nᵢ vaut…", good: "nᵢ / N", bad: ["N / nᵢ", "nᵢ × N", "nᵢ − N"], why: "fᵢ = nᵢ / N, nombre de l'intervalle [0 ; 1]." },
      { q: "Que signifie Σᵢ₌₁⁹ nᵢ ?", good: "La somme des effectifs nᵢ pour i variant de 1 à 9", bad: ["Le produit des nᵢ", "La moyenne des nᵢ", "Le plus grand des nᵢ"], why: "Σ désigne la somme : n₁ + n₂ + … + n₉." },
      { q: "Les notes sont regroupées en classes [0 ; 8[, [8 ; 10[, [10 ; 12[… Quel est ce type de caractère ?", good: "Quantitatif à modalités regroupées en classes", bad: ["Qualitatif", "Quantitatif à modalités non regroupées", "Aléatoire"], why: "Chaque classe correspond à une catégorie (refusés, admissibles…) : caractère quantitatif regroupé en classes." },
    ];
    return qcmOf(r, pool, "Pense à la nature du caractère.");
  }, QCM),
  mk("stat-cumuls", "Statistique à une variable — série C", 2, { skill: "Effectifs cumulés et fréquences cumulées", ref: `${BOOK}, chap. 14 §1.3, ex. 1.b (p. 237-239)`, kw: ["effectif cumulé croissant", "effectif cumulé décroissant", "fréquence cumulée", "tableau"] }, (_c, r) => {
    const vals = [3, 4, 5, 6, 7];
    const effs = vals.map(() => int(r, 1, 12));
    const N = effs.reduce((s, e) => s + e, 0);
    const k = int(r, 1, 3);
    const cum = effs.slice(0, k + 1).reduce((s, e) => s + e, 0);
    const dec = effs.slice(k).reduce((s, e) => s + e, 0);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Modalités ${vals.join(", ")} ; effectifs ${effs.join(", ")}. Quel est l'effectif cumulé croissant de la modalité ${vals[k]} ?`, answer: num(cum), hints: H("C'est la somme des effectifs des modalités inférieures ou égales à " + vals[k] + ".", effs.slice(0, k + 1).join(" + ") + ".", "Additionne.", "Calcule."), solution: `N${k + 1} = ${effs.slice(0, k + 1).join(" + ")} = ${cum}.` };
    if (t === 1) return { statement: `Modalités ${vals.join(", ")} ; effectifs ${effs.join(", ")}. Quel est l'effectif cumulé décroissant de la modalité ${vals[k]} ?`, answer: num(dec), hints: H("C'est la somme des effectifs des modalités supérieures ou égales à " + vals[k] + ".", effs.slice(k).join(" + ") + ".", "Additionne.", "Calcule."), solution: `N′${k + 1} = ${effs.slice(k).join(" + ")} = ${dec}.` };
    return { statement: `Modalités ${vals.join(", ")} ; effectifs ${effs.join(", ")}. Quelle est la fréquence cumulée croissante de la modalité ${vals[k]} (en %, arrondie au centième) ?`, answer: num(round((cum * 100) / N, 2), 0.01), hints: H("Fréquence cumulée = effectif cumulé ÷ effectif total.", `Effectif cumulé : ${cum} ; effectif total : ${N}.`, `${cum} ÷ ${N} × 100.`, "Arrondis."), solution: `${cum} ÷ ${N} × 100 ≈ ${fr(round((cum * 100) / N, 2))} %.` };
  }, FR),
  mk("stat-moyenne-mediane", "Statistique à une variable — série C", 2, { skill: "Moyenne, mode et médiane", ref: `${BOOK}, chap. 14 §3, ex. 3.a-3.b (p. 242-245)`, kw: ["moyenne", "mode", "médiane", "effectif", "tableau"] }, (_c, r) => {
    const vals = [8, 9, 10, 11, 12, 13];
    const effs = vals.map(() => int(r, 1, 8));
    const N = effs.reduce((s, e) => s + e, 0), S = effs.reduce((s, e, i) => s + e * vals[i], 0);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Notes ${vals.join(", ")} ; effectifs ${effs.join(", ")}. Quelle est la moyenne (arrondie au centième) ?`, answer: num(round(S / N, 2), 0.01), hints: H("Moyenne = Σ nᵢ xᵢ ÷ N.", `N = ${N}.`, `Σ nᵢ xᵢ = ${S}.`, `${S} ÷ ${N}.`), solution: `x̄ = ${S} ÷ ${N} ≈ ${fr(round(S / N, 2))}.` };
    if (t === 1) { const mx = Math.max(...effs); if (effs.filter((e) => e === mx).length > 1) effs[effs.indexOf(mx)] += 1; const best = effs.indexOf(Math.max(...effs)); return { statement: `Notes ${vals.join(", ")} ; effectifs ${effs.join(", ")}. Quel est le mode ?`, answer: num(vals[best]), hints: H("Le mode est la modalité d'effectif maximal.", `Le plus grand effectif est ${Math.max(...effs)}.`, "Repère la modalité.", "Lis."), solution: `Effectif maximal ${Math.max(...effs)} : mode ${vals[best]}.` }; }
    let acc = 0, med = vals[vals.length - 1];
    const NN = effs.reduce((s, e) => s + e, 0);
    for (let i = 0; i < vals.length; i++) { acc += effs[i]; if (acc >= NN / 2) { med = vals[i]; break; } }
    const even = NN % 2 === 0;
    if (even) { const cumul: number[] = []; let a2 = 0; for (const e of effs) { a2 += e; cumul.push(a2); } const lo = vals[cumul.findIndex((c) => c >= NN / 2)], hi = vals[cumul.findIndex((c) => c >= NN / 2 + 1)]; if (lo !== hi) return { statement: `Notes ${vals.join(", ")} ; effectifs ${effs.join(", ")} (effectif total ${NN}). Quelle est la plus petite valeur de l'intervalle médian ?`, answer: num(lo), hints: H("Avec un effectif pair, l'intervalle médian est entre les deux valeurs centrales.", `Les valeurs centrales sont aux rangs ${NN / 2} et ${NN / 2 + 1}.`, "Utilise les effectifs cumulés.", "Lis."), solution: `Rang ${NN / 2} : ${lo} ; rang ${NN / 2 + 1} : ${hi} ; intervalle médian [${lo} ; ${hi}].` }; return { statement: `Notes ${vals.join(", ")} ; effectifs ${effs.join(", ")} (effectif total ${NN}). Quelle est la médiane ?`, answer: num(lo), hints: H("On cherche la valeur du rang central.", `Rang ${NN / 2}.`, "Utilise les effectifs cumulés.", "Lis."), solution: `Les deux valeurs centrales sont égales à ${lo} : médiane ${lo}.` }; }
    return { statement: `Notes ${vals.join(", ")} ; effectifs ${effs.join(", ")} (effectif total ${NN}). Quelle est la médiane ?`, answer: num(med), hints: H("La médiane partage la série en deux groupes de même effectif.", `Rang central : ${(NN + 1) / 2}.`, "Utilise les effectifs cumulés croissants.", "Lis."), solution: `Rang ${(NN + 1) / 2} : médiane ${med}.` };
  }, FR),
  mk("stat-dispersion", "Statistique à une variable — série C", 3, { skill: "Écart moyen, variance et écart type", ref: `${BOOK}, chap. 14 §4.1-4.2 (p. 245-246) et ex. 4 (p. 248)`, kw: ["écart moyen", "variance", "écart type", "formule de König", "dispersion"] }, (_c, r) => {
    const x = Array.from({ length: 4 }, () => int(r, 8, 14));
    const m = x.reduce((s, v) => s + v, 0) / x.length;
    const V = x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length;
    const em = x.reduce((s, v) => s + Math.abs(v - m), 0) / x.length;
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Série des notes : ${x.join(", ")} (effectifs 1). La moyenne est ${fr(m)}. Calcule l'écart moyen (arrondi au centième).`, answer: num(round(em, 2), 0.01), hints: H("Écart moyen = moyenne des |xᵢ − x̄|.", x.map((v) => `|${v} − ${fr(m)}|`).join(" + ") + ".", `Somme = ${fr(round(x.reduce((s, v) => s + Math.abs(v - m), 0), 3))}.`, "Divise par 4."), solution: `e = ${fr(round(x.reduce((s, v) => s + Math.abs(v - m), 0), 3))} ÷ 4 ≈ ${fr(round(em, 2))}.` };
    if (t === 1) return { statement: `Série des notes : ${x.join(", ")} (effectifs 1). La moyenne est ${fr(m)}. Calcule la variance (arrondie au centième).`, answer: num(round(V, 2), 0.01), hints: H("Variance = moyenne des carrés des écarts à la moyenne.", x.map((v) => `(${v} − ${fr(m)})²`).join(" + ") + ".", `Somme = ${fr(round(V * 4, 3))}.`, "Divise par 4."), solution: `V = ${fr(round(V * 4, 3))} ÷ 4 ≈ ${fr(round(V, 2))}.` };
    return { statement: `Série des notes : ${x.join(", ")} (effectifs 1). La variance est ${fr(round(V, 4))}. Calcule l'écart type (arrondi au centième).`, answer: num(round(Math.sqrt(V), 2), 0.01), hints: H("L'écart type est la racine carrée de la variance.", `σ = √${fr(round(V, 4))}.`, "Utilise la calculatrice.", "Arrondis."), solution: `σ = √${fr(round(V, 4))} ≈ ${fr(round(Math.sqrt(V), 2))}.` };
  }, FR),
  mk("stat-graphiques", "Statistique à une variable — série C", 2, { skill: "Choisir un graphique et calculer un angle ou une aire", ref: `${BOOK}, chap. 14 §2 (p. 239-241)`, kw: ["diagramme circulaire", "diagramme en bâtons", "histogramme", "secteur", "angle"] }, (_c, r) => {
    const f0 = pick(r, [5, 10, 20, 25, 35, 40, 50]);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Dans un diagramme circulaire, une modalité de fréquence ${f0} % est représentée par un secteur. Quel est son angle (en °) ?`, answer: num((f0 * 360) / 100, 0.01, "°"), hints: H("360° correspondent à 100 %.", "Proportionnalité.", `${f0} × 360 ÷ 100.`, "Calcule."), solution: `${f0} × 360 ÷ 100 = ${(f0 * 360) / 100}°.` };
    if (t === 1) return { statement: `Dans un diagramme semi-circulaire, une modalité de fréquence ${f0} % est représentée par un secteur. Quel est son angle (en °) ?`, answer: num((f0 * 180) / 100, 0.01, "°"), hints: H("180° correspondent à 100 %.", "Proportionnalité.", `${f0} × 180 ÷ 100.`, "Calcule."), solution: `${f0} × 180 ÷ 100 = ${(f0 * 180) / 100}°.` };
    const pool: Item[] = [
      { q: "Quel graphique est adapté à un caractère qualitatif ?", good: "Un diagramme à bandes ou circulaire", bad: ["Un histogramme uniquement", "Un diagramme cumulatif uniquement", "Aucun graphique"], why: "Les diagrammes à bandes et circulaires conviennent aux caractères qualitatifs ; histogrammes et bâtons aux quantitatifs." },
      { q: "Dans un histogramme, l'aire d'un rectangle est proportionnelle…", good: "à l'effectif (ou à la fréquence) de la classe", bad: ["à la largeur de la classe seulement", "à la moyenne de la classe", "au nombre de classes"], why: "Chaque rectangle a pour base l'amplitude de la classe et pour aire une quantité proportionnelle à son effectif." },
    ];
    return qcmOf(r, pool, "Relis le chapitre sur les graphiques.");
  }, QCM),

  // ===== Géométrie : vecteurs, produit scalaire, droites et cercles, trigonométrie =====
  mk("vec-points-milieu", "Vecteurs et points du plan — série C", 2, { skill: "Milieu, centre de gravité et colinéarité par les coordonnées", ref: `${BOOK}, chap. 2 (p. 27-46) et ex. 27-30 (p. 77)`, kw: ["milieu", "centre de gravité", "colinéaires", "coordonnées", "vecteur"] }, (_c, r) => {
    const xa = rnd(r) * int(r, 0, 8), ya = rnd(r) * int(r, 0, 8), xb = xa + 2 * int(r, -4, 4), yb = ya + 2 * int(r, -4, 4);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `A(${n2(xa)} ; ${n2(ya)}) et B(${n2(xb)} ; ${n2(yb)}). Quelle est l'abscisse du milieu de [AB] ?`, answer: num((xa + xb) / 2), hints: H("Les coordonnées du milieu sont les moyennes.", "(x_A + x_B)/2.", `${n2(xa)} + ${par(xb)}.`, "Divise par 2."), solution: `x_I = (${n2(xa)} + ${par(xb)})/2 = ${n2((xa + xb) / 2)}.` };
    if (t === 1) { const xc = xa + int(r, -4, 6) * 3, yc = ya + int(r, -4, 6) * 3; return { statement: `A(${n2(xa)} ; ${n2(ya)}), B(${n2(xb)} ; ${n2(yb)}) et C(${n2(xc)} ; ${n2(yc)}). Quelle est l'abscisse du centre de gravité G de ABC ?`, answer: num(round((xa + xb + xc) / 3, 3), 0.001), hints: H("G a pour coordonnées la moyenne de celles des trois sommets.", "x_G = (x_A + x_B + x_C)/3.", `${n2(xa)} + ${par(xb)} + ${par(xc)}.`, "Divise par 3."), solution: `x_G = ${n2(xa + xb + xc)}/3 ≈ ${fr(round((xa + xb + xc) / 3, 3))}.` }; }
    const k = rnd(r) * int(r, 2, 4), u = rnd(r) * int(r, 1, 5), v = rnd(r) * int(r, 1, 5);
    return { statement: `Les vecteurs u (${n2(u)} ; ${n2(v)}) et w (${n2(k * u)} ; ${n2(k * v)}) sont-ils colinéaires ?`, answer: choice(r, ["Oui", "Non"], 0), hints: H("Deux vecteurs sont colinéaires si xy′ − x′y = 0.", `${n2(u)} × ${par(k * v)} − ${par(k * u)} × ${par(v)}.`, "Calcule.", "Résultat nul."), solution: `${u} × ${k * v} − ${k * u} × ${v} = 0 : colinéaires.` };
  }, QCM),
  mk("ps-definition", "Produit scalaire — série C", 2, { skill: "Produit scalaire : calcul avec la norme et l'angle", ref: `${BOOK}, chap. 4 §1.2, exemples et propriétés (p. 62) et ex. 1.a-1.c (p. 66)`, kw: ["produit scalaire", "norme", "cos", "u·v", "angle"] }, (_c, r) => {
    const nu = int(r, 2, 8), nv = int(r, 2, 8);
    const ang = pick(r, [0, 60, 90, 120, 180]);
    const c = { 0: 1, 60: 0.5, 90: 0, 120: -0.5, 180: -1 }[ang as 0 | 60 | 90 | 120 | 180];
    const v = round(nu * nv * c, 4);
    return { statement: `‖u‖ = ${nu}, ‖v‖ = ${nv} et l'angle (u, v) mesure ${ang}°. Calcule u · v.`, answer: num(v, 0.0001), hints: H("u · v = ‖u‖ × ‖v‖ × cos(u, v).", `cos ${ang}° = ${fr(c)}.`, `${nu} × ${nv} × ${par(c)}.`, "Calcule."), solution: `u · v = ${nu} × ${nv} × cos ${ang}° = ${nu * nv} × ${par(c)} = ${n2(v)}.` };
  }, FR),
  mk("ps-orthogonal", "Produit scalaire — série C", 2, { skill: "Vecteurs orthogonaux : u · v = 0", ref: `${BOOK}, chap. 4 §2.1, propriété (p. 66) et ex. 1.d`, kw: ["orthogonaux", "u·v = 0", "perpendiculaires", "cercle de diamètre"] }, (_c, r) => {
    const x = rnd(r) * int(r, 1, 6), y = rnd(r) * int(r, 1, 6);
    const ok = int(r, 0, 1) === 0;
    const xp = -y, yp = x + (ok ? 0 : int(r, 1, 3));
    const dot = x * xp + y * yp;
    return { statement: `Dans un repère orthonormé, u (${n2(x)} ; ${n2(y)}) et v (${n2(xp)} ; ${n2(yp)}). Ces vecteurs sont-ils orthogonaux ?`, answer: choice(r, ["Oui", "Non"], dot === 0 ? 0 : 1), hints: H("u · v = xx′ + yy′.", `${n2(x)} × ${par(xp)} + ${n2(y)} × ${par(yp)}.`, `Résultat : ${dot}.`, "Orthogonaux si c'est 0."), solution: `u · v = ${dot}${dot === 0 ? " = 0 : orthogonaux" : " ≠ 0 : non orthogonaux"}.` };
  }, QCM),
  mk("ps-formule", "Produit scalaire — série C", 3, { skill: "Formules du produit scalaire : (u + v)², polarisation", ref: `${BOOK}, chap. 4 §2.2, propriétés et autre expression (p. 68) et ex. 2.a-2.d`, kw: ["(u + v)²", "norme", "polarisation", "développer", "carré scalaire"] }, (_c, r) => {
    const nu = int(r, 2, 6), nv = int(r, 2, 6), dot = int(r, -6, 8);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `‖u‖ = ${nu}, ‖v‖ = ${nv} et u · v = ${n2(dot)}. Calcule ‖u + v‖².`, answer: num(nu * nu + nv * nv + 2 * dot), hints: H("(u + v)² = u² + 2 u·v + v².", `u² = ${nu * nu} et v² = ${nv * nv}.`, `${nu * nu} + ${nv * nv} + 2 × ${par(dot)}.`, "Calcule."), solution: `‖u + v‖² = ${nu * nu} + ${nv * nv} + ${n2(2 * dot)} = ${nu * nu + nv * nv + 2 * dot}.` };
    return { statement: `‖u + v‖² = ${nu * nu + nv * nv + 2 * dot}, ‖u‖ = ${nu} et ‖v‖ = ${nv}. Calcule u · v.`, answer: num(dot), hints: H("u · v = (‖u + v‖² − ‖u‖² − ‖v‖²)/2.", `${nu * nu + nv * nv + 2 * dot} − ${nu * nu} − ${nv * nv}.`, "Divise par 2.", "Calcule."), solution: `u · v = (${nu * nu + nv * nv + 2 * dot} − ${nu * nu} − ${nv * nv})/2 = ${n2(dot)}.` };
  }, FR),
  mk("ps-relations-metriques", "Produit scalaire — série C", 3, { skill: "Théorème d'Al Kashi et théorème de la médiane", ref: `${BOOK}, chap. 4 §3.2-3.3, propriétés (p. 69-71) et ex. 3.a-3.d (p. 72)`, kw: ["al kashi", "théorème de la médiane", "a² = b² + c² − 2bc cos A", "triangle"] }, (_c, r) => {
    const b = int(r, 3, 9), c = int(r, 3, 9);
    const A = pick(r, [60, 90, 120]);
    const cosA = { 60: 0.5, 90: 0, 120: -0.5 }[A as 60 | 90 | 120];
    const a2 = b * b + c * c - 2 * b * c * cosA;
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Dans un triangle ABC, AB = ${c}, AC = ${b} et Â = ${A}°. Calcule BC² (relation d'Al Kashi).`, answer: num(a2), hints: H("a² = b² + c² − 2bc cos Â.", `cos ${A}° = ${fr(cosA)}.`, `${b * b} + ${c * c} − 2 × ${b} × ${c} × ${par(cosA)}.`, "Calcule."), solution: `BC² = ${b * b} + ${c * c} − ${2 * b * c} × ${par(cosA)} = ${fr(a2)}.` };
    const a = int(r, 2, 8) * 2;
    const m2 = (2 * b * b + 2 * c * c - a * a) / 4;
    return { statement: `Dans un triangle ABC, AB = ${c}, AC = ${b} et BC = ${a}. A′ est le milieu de [BC]. Calcule AA′² (théorème de la médiane).`, answer: num(round(m2, 4), 0.001), hints: H("AB² + AC² = 2 AA′² + BC²/2.", `${c * c} + ${b * b} = 2 AA′² + ${a * a / 2}.`, `AA′² = (${b * b + c * c} − ${a * a / 2}) ÷ 2.`, "Calcule."), solution: `AA′² = (${b * b + c * c} − ${fr(a * a / 2)}) ÷ 2 = ${fr(round(m2, 4))}.` };
  }, FR),
  mk("ps-analytique", "Produit scalaire — série C", 3, { skill: "Forme analytique du produit scalaire et angle", ref: `${BOOK}, chap. 4 §4.1-4.2 (p. 72-74) et ex. 4.a-4.c (p. 74)`, kw: ["forme analytique", "xx' + yy'", "norme", "angle", "repère orthonormé"] }, (_c, r) => {
    const x = rnd(r) * int(r, 1, 6), y = rnd(r) * int(r, 1, 6), xp = rnd(r) * int(r, 1, 6), yp = rnd(r) * int(r, 1, 6);
    const dot = x * xp + y * yp;
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Dans un repère orthonormé, u (${n2(x)} ; ${n2(y)}) et v (${n2(xp)} ; ${n2(yp)}). Calcule u · v.`, answer: num(dot), hints: H("u · v = xx′ + yy′.", `${n2(x)} × ${par(xp)} + ${n2(y)} × ${par(yp)}.`, "Calcule chaque produit.", "Additionne."), solution: `u · v = ${n2(x * xp)} + ${n2(y * yp)} = ${n2(dot)}.` };
    const [a, b, h] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
    return { statement: `Dans un repère orthonormé, u (${a} ; ${b}). Quelle est la norme de u ?`, answer: num(h), hints: H("‖u‖ = √(x² + y²).", `${a * a} + ${b * b}.`, `${a * a + b * b}.`, "Racine carrée."), solution: `‖u‖ = √(${a * a} + ${b * b}) = √${h * h} = ${h}.` };
  }, FR),
  mk("droite-vecteur-directeur", "Vecteurs et points du plan — série C", 3, { skill: "Équation cartésienne d'une droite (vecteur directeur ou normal)", ref: `${BOOK}, chap. 5 §1.1-1.2 (p. 80-83) et ex. 2 (p. 92)`, kw: ["équation cartésienne", "vecteur directeur", "vecteur normal", "droite", "ax + by + c = 0"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 5), b = rnd(r) * int(r, 1, 5), cc = rnd(r) * int(r, 1, 9);
    const eq = `${lin(a, 0, "x")}${b < 0 ? " −" : " +"} ${Math.abs(b)}y${cc < 0 ? " −" : " +"} ${Math.abs(cc)} = 0`;
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Une droite (D) a pour équation cartésienne ${eq}. Quelle est la première coordonnée d'un vecteur normal n (a ; b) à (D) ?`, answer: num(a), hints: H("Si (D) : ax + by + c = 0, alors n (a ; b) est normal.", "Lis le coefficient de x.", "Recopie.", "Pas de calcul."), solution: `n (${n2(a)} ; ${n2(b)}) est un vecteur normal : première coordonnée ${n2(a)}.` };
    if (t === 1) return { statement: `Une droite (D) a pour équation cartésienne ${eq}. Quelle est la première coordonnée du vecteur directeur u (−b ; a) ?`, answer: num(-b), hints: H("Si (D) : ax + by + c = 0, alors u (−b ; a) est directeur.", `b = ${n2(b)}.`, "Prends l'opposé.", "Calcule."), solution: `u (${n2(-b)} ; ${n2(a)}) est un vecteur directeur de (D).` };
    const xa = rnd(r) * int(r, 0, 5), ya = rnd(r) * int(r, 0, 5);
    return { statement: `Une droite passe par A(${n2(xa)} ; ${n2(ya)}) et a pour vecteur normal n (${n2(a)} ; ${n2(b)}). Elle a pour équation ${n2(a)}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}y + c = 0. Quelle est la valeur de c ?`, answer: num(-(a * xa + b * ya)), hints: H("A appartient à (D) : ses coordonnées vérifient l'équation.", `${n2(a)} × ${par(xa)} + ${n2(b)} × ${par(ya)} + c = 0.`, `c = −(${n2(a * xa + b * ya)}).`, "Calcule."), solution: `c = −(${n2(a)} × ${par(xa)} + ${n2(b)} × ${par(ya)}) = ${n2(-(a * xa + b * ya))}.` };
  }, FR),
  mk("cercle-equation", "Vecteurs et points du plan — série C", 3, { skill: "Équation d'un cercle (centre et rayon, ou diamètre)", ref: `${BOOK}, chap. 5 §2.1-2.2 (p. 89-90) et ex. 2.a-2.c (p. 91)`, kw: ["équation de cercle", "centre", "rayon", "x² + y² − 2ax − 2by + c = 0", "diamètre"] }, (_c, r) => {
    const a = rnd(r) * int(r, 0, 5), b = rnd(r) * int(r, 0, 5), R = int(r, 1, 6);
    const c = a * a + b * b - R * R;
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Un cercle a pour centre I(${n2(a)} ; ${n2(b)}) et pour rayon ${R}. Il a pour équation (x − ${par(a)})² + (y − ${par(b)})² = R². Quelle est la valeur de R² ?`, answer: num(R * R), hints: H("M ∈ cercle ⇔ IM² = R².", `R = ${R}.`, `R² = ${R} × ${R}.`, "Calcule."), solution: `(x − ${par(a)})² + (y − ${par(b)})² = ${R * R}.` };
    if (t === 1) { const sg = (k: number, v: string) => (k === 0 ? "" : ` ${k < 0 ? "−" : "+"} ${Math.abs(k) === 1 ? "" : Math.abs(k)}${v}`); return { statement: `Un cercle a pour équation x² + y²${sg(-2 * a, "x")}${sg(-2 * b, "y")}${c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`} = 0. Quel est son rayon ?`, answer: num(R), hints: H("x² + y² − 2ax − 2by + c = 0 est un cercle si a² + b² − c > 0.", `a = ${n2(a)}, b = ${n2(b)}, c = ${n2(c)}.`, `R² = a² + b² − c = ${a * a + b * b} − ${par(c)}.`, "Racine carrée."), solution: `R² = ${a * a} + ${b * b} − ${par(c)} = ${R * R} : R = ${R}.` }; }
    const xa = rnd(r) * int(r, 0, 4), ya = rnd(r) * int(r, 0, 4), xb = xa + 2 * int(r, 1, 4), yb = ya + 2 * int(r, 1, 4);
    return { statement: `A(${n2(xa)} ; ${n2(ya)}) et B(${n2(xb)} ; ${n2(yb)}) sont les extrémités d'un diamètre d'un cercle. Quelle est l'abscisse de son centre ?`, answer: num((xa + xb) / 2), hints: H("Le centre est le milieu du diamètre.", "(x_A + x_B)/2.", `${n2(xa)} + ${n2(xb)}.`, "Divise par 2."), solution: `x_I = (${n2(xa)} + ${n2(xb)})/2 = ${n2((xa + xb) / 2)}.` };
  }, FR),
  mk("trigo-radian", "Angles orientés et trigonométrie — série C", 1, { skill: "Radians et degrés : conversions", ref: `${BOOK}, chap. 3 §1.1 (p. 48) et ex. 1.a-1.b (p. 52)`, kw: ["radian", "degré", "conversion", "π", "mesure d'un angle"] }, (_c, r) => {
    const deg = pick(r, [30, 45, 60, 90, 120, 135, 150, 180, 270]);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Convertis ${deg}° en radians. Donne la valeur arrondie au centième (π ≈ 3,1416).`, answer: num(round((deg * Math.PI) / 180, 2), 0.01), hints: H("180° correspondent à π radians.", "Tableau de proportionnalité.", `x = π ÷ 180 × ${deg}.`, "Calcule."), solution: `${deg} × π ÷ 180 ≈ ${fr(round((deg * Math.PI) / 180, 2))} rad.` };
    return { statement: `Un angle mesure ${fr(round((deg * Math.PI) / 180, 4))} radians. Quelle est sa mesure en degrés (arrondie à l'unité) ?`, answer: num(deg, 1), hints: H("π radians correspondent à 180°.", "x° = y × 180 ÷ π.", "Utilise la calculatrice.", "Arrondis."), solution: `${fr(round((deg * Math.PI) / 180, 4))} × 180 ÷ π ≈ ${deg}°.` };
  }, FR),
  mk("trigo-valeurs", "Angles orientés et trigonométrie — série C", 2, { skill: "Cosinus et sinus des angles remarquables", ref: `${BOOK}, chap. 3 §2.3, tableau (p. 55) et ex. 2.c (p. 57)`, kw: ["cosinus", "sinus", "π/6", "π/4", "π/3", "angles remarquables"] }, (_c, r) => {
    const rows: { a: string; c: string; s: string }[] = [
      { a: "0", c: "1", s: "0" }, { a: "π/6", c: "√3/2", s: "1/2" }, { a: "π/4", c: "√2/2", s: "√2/2" }, { a: "π/3", c: "1/2", s: "√3/2" }, { a: "π/2", c: "0", s: "1" },
    ];
    const it = pick(r, rows);
    const cos = int(r, 0, 1) === 0;
    const good = cos ? it.c : it.s;
    const all = ["1", "0", "1/2", "√2/2", "√3/2"];
    const wrong = withWrong(good, all).slice(0, 3);
    return { statement: `Quelle est la valeur de ${cos ? "cos" : "sin"}(${it.a}) ?`, answer: choice(r, [good, ...wrong], 0), hints: H("On utilise le tableau des valeurs remarquables.", "cos : 1, √3/2, √2/2, 1/2, 0 pour 0, π/6, π/4, π/3, π/2.", "sin : 0, 1/2, √2/2, √3/2, 1.", "Lis la case."), solution: `${cos ? "cos" : "sin"}(${it.a}) = ${good}.` };
  }, QCM),
  mk("trigo-cercle", "Angles orientés et trigonométrie — série C", 2, { skill: "Cercle trigonométrique : signes et relations", ref: `${BOOK}, chap. 3 §2.3-2.4, propriétés (p. 54-56) et ex. 2.b (p. 57)`, kw: ["cercle trigonométrique", "signe du cosinus", "cos² + sin² = 1", "angles associés"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Pour tout réel α, que vaut cos²α + sin²α ?", good: "1", bad: ["0", "2", "tan α"], why: "OM = 1 donc cos²α + sin²α = 1." },
      { q: "cos(−α) = …", good: "cos α", bad: ["−cos α", "sin α", "−sin α"], why: "Les images de α et −α sont symétriques par rapport à (AA′) : même abscisse, ordonnées opposées." },
      { q: "sin(−α) = …", good: "−sin α", bad: ["sin α", "cos α", "−cos α"], why: "Les ordonnées sont opposées : sin(−α) = −sin α." },
      { q: "Pour α ∈ ]0 ; π/2[, quel est le signe de cos α et de sin α ?", good: "Tous deux positifs", bad: ["cos négatif, sin positif", "cos positif, sin négatif", "Tous deux négatifs"], why: "Dans le premier quadrant, l'abscisse et l'ordonnée sont positives." },
      { q: "Pour α ∈ ]π/2 ; π[, quel est le signe de cos α ?", good: "Négatif", bad: ["Positif", "Nul", "On ne peut pas savoir"], why: "Dans le deuxième quadrant, l'abscisse est négative." },
      { q: "cos(π − α) = …", good: "−cos α", bad: ["cos α", "sin α", "−sin α"], why: "Les images de α et π − α sont symétriques par rapport à (BB′) : abscisses opposées." },
      { q: "sin(π − α) = …", good: "sin α", bad: ["−sin α", "cos α", "−cos α"], why: "Même ordonnée : sin(π − α) = sin α." },
      { q: "cos(π/2 − α) = …", good: "sin α", bad: ["cos α", "−sin α", "−cos α"], why: "Angles complémentaires : cos(π/2 − α) = sin α." },
      { q: "Un réel α appartient à ]−π ; π]. Quelle est la mesure principale d'un angle orienté ?", good: "Le nombre de ]−π ; π] qui le mesure", bad: ["Le nombre de [0 ; 2π[", "Toujours positif", "Toujours π"], why: "La mesure principale d'un angle orienté est un réel de l'intervalle ]−π ; π]." },
    ];
    return qcmOf(r, pool, "Dessine le cercle trigonométrique.");
  }, QCM),
  mk("trigo-tangente", "Angles orientés et trigonométrie — série C", 3, { skill: "Tangente d'un angle : tan α = sin α / cos α", ref: `${BOOK}, chap. 3 §2.5 (p. 56-57) et ex. 2.d (p. 57)`, kw: ["tangente", "tan α", "1 + tan²α", "sin α / cos α"] }, (_c, r) => {
    const [s, c, t] = pick(r, [[3, 4, 0.75], [4, 3, 4 / 3], [5, 12, 5 / 12], [8, 15, 8 / 15], [1, 1, 1]]);
    return { statement: `Pour un angle α, sin α = ${s}/${Math.hypot(s, c)} et cos α = ${c}/${Math.hypot(s, c)}. Quelle est la valeur de tan α (arrondie au centième) ?`, answer: num(round(t, 2), 0.01), hints: H("tan α = sin α / cos α.", `${s}/${Math.hypot(s, c)} ÷ ${c}/${Math.hypot(s, c)}.`, `Les dénominateurs se simplifient : ${s}/${c}.`, "Calcule."), solution: `tan α = ${s}/${c} ≈ ${fr(round(t, 2))}.` };
  }, FR),
  mk("angle-oriente", "Angles orientés et trigonométrie — série C", 2, { skill: "Angles orientés : sens direct et mesure principale", ref: `${BOOK}, chap. 3 §1.2-1.4 (p. 49-51) et ex. 1.c-1.d (p. 52)`, kw: ["angle orienté", "sens direct", "mesure principale", "Chasles"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Dans le plan orienté, quel est le sens direct (ou trigonométrique) ?", good: "Le sens inverse des aiguilles d'une montre", bad: ["Le sens des aiguilles d'une montre", "Le sens horizontal", "Aucun sens particulier"], why: "On choisit en général pour sens direct le sens inverse des aiguilles d'une montre." },
      { q: "Quelle est la mesure principale de l'angle orienté plat ?", good: "π", bad: ["−π", "π/2", "0"], why: "La mesure principale de l'angle plat orienté est π (et non −π)." },
      { q: "Quelle est la mesure principale de l'angle droit direct ?", good: "π/2", bad: ["−π/2", "π", "0"], why: "L'angle droit direct a pour mesure principale π/2 ; l'angle droit indirect −π/2." },
      { q: "Quels angles ont la même mesure principale ?", good: "Des angles orientés égaux", bad: ["Des angles supplémentaires", "Des angles opposés", "Des angles complémentaires"], why: "Des angles orientés sont égaux si et seulement s'ils ont la même mesure principale." },
      { q: "Par une symétrie orthogonale, un angle orienté a pour image…", good: "son opposé", bad: ["le même angle orienté", "son supplémentaire", "un angle nul"], why: "La symétrie orthogonale transforme un angle orienté en son opposé ; la translation et la symétrie centrale le conservent." },
      { q: "Pour un triangle ABC de sens direct, Mes(AB, AC) est…", good: "positive (à π près en tenant compte de la mesure principale)", bad: ["toujours nulle", "toujours égale à π", "toujours négative"], why: "Dans un triangle de sens direct, Mes(AB, AC) = Â > 0 d'après les exemples du manuel (p. 51)." },
    ];
    return qcmOf(r, pool, "Pense au sens trigonométrique.");
  }, QCM),
);
void gcd; void INEQ2; void GF; void EF; void ST; void VP; void PS; void AO; void NR; void PF; void EQ;
