// CIAM Terminale SM (série C) : chapitre 1, Arithmétique. Énoncés originaux, réponses calculées par le code.
// Les démonstrations du manuel ne se corrigent pas automatiquement : on en garde les calculs et le cours.
import { choice, fr, gcd, int, num, pick, Rng, Template } from "./core";
import { ciam, f, H, Item, QCM, qcmOf, factStr, factorize, isPrime, withWrong } from "./ciam-kit";

const mk = ciam("tle", "ciamtc");
const BOOK = "CIAM Terminale SM";
const DIV = "Divisibilité dans ℤ — série C";
const PGP = "PPCM et PGCD de deux entiers relatifs — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
const mod = (a: number, n: number) => ((a % n) + n) % n;
const powMod = (a: number, e: number, n: number) => { let r = 1, b = mod(a, n); while (e > 0) { if (e & 1) r = (r * b) % n; b = (b * b) % n; e = Math.floor(e / 2); } return r; };
const inv = (a: number, n: number) => { for (let x = 1; x < n; x++) if ((a * x) % n === 1) return x; return NaN; };
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const eu = (a: number, b: number) => { const rows: [number, number, number][] = []; while (b) { rows.push([a, b, a % b]); [a, b] = [b, a % b]; } return { g: a, rows }; };
const stepsText = (rows: [number, number, number][]) => rows.map(([a, b, r]) => `${f(a)} = ${f(b)} × ${f(Math.floor(a / b))} + ${f(r)}`).join(" ; ");
const digits = (x: number, b: number) => { const d: number[] = []; while (x > 0) { d.unshift(x % b); x = Math.floor(x / b); } return d; };
const nzr = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };

export const TC_ARITH: Template[] = [
  mk("ar-somme-recurrence", DIV, 2, { skill: "Sommes classiques démontrées par récurrence (carrés, k(k+1), cubes)", ref: `${BOOK}, chap. 1 §1.1, raisonnement par récurrence (p. 6-7) et ex. 1.c-1.d (p. 12) et ex. 1-2 (p. 28)`, kw: ["récurrence", "somme", "n(n+1)(2n+1)/6", "cubes", "démontrer par récurrence"] }, (_c, r) => {
    const n = int(r, 4, 20), t = int(r, 0, 3);
    if (t === 0) { const v = (n * (n + 1) * (2 * n + 1)) / 6; return { statement: `On démontre par récurrence que 1² + 2² + … + n² = n(n + 1)(2n + 1)/6. Quelle est la valeur de 1² + 2² + … + ${n}² ?`, answer: num(v), hints: H("La formule de l'énoncé s'applique pour tout n ≥ 1.", `Remplace n par ${n}.`, `${n} × ${n + 1} × ${2 * n + 1} ÷ 6.`, "Calcule."), solution: `${n} × ${n + 1} × ${2 * n + 1} / 6 = ${f(v)}.` }; }
    if (t === 1) { const v = (n * (n + 1) * (n + 2)) / 3; return { statement: `On démontre par récurrence que 1×2 + 2×3 + … + n(n + 1) = n(n + 1)(n + 2)/3. Quelle est la valeur de 1×2 + 2×3 + … + ${n}×${n + 1} ?`, answer: num(v), hints: H("Utilise la formule démontrée par récurrence.", `n = ${n}.`, `${n} × ${n + 1} × ${n + 2} ÷ 3.`, "Calcule."), solution: `${n} × ${n + 1} × ${n + 2} / 3 = ${f(v)}.` }; }
    if (t === 2) { const v = ((n * (n + 1)) / 2) ** 2; return { statement: `On sait que 1³ + 2³ + … + n³ = (1 + 2 + … + n)². Quelle est la valeur de 1³ + 2³ + … + ${n}³ ?`, answer: num(v), hints: H("La somme des cubes est le carré de la somme des entiers.", `1 + 2 + … + ${n} = ${n}(${n} + 1)/2.`, `Calcule ${n * (n + 1) / 2} puis élève au carré.`, "Calcule."), solution: `1 + … + ${n} = ${n * (n + 1) / 2}, et ${n * (n + 1) / 2}² = ${f(v)}.` }; }
    const v = n / (n + 1); return { statement: `On démontre par récurrence que 1/(1×2) + 1/(2×3) + … + 1/(n(n + 1)) = n/(n + 1). Quelle est la valeur de cette somme pour n = ${n} (arrondie au millième) ?`, answer: num(Math.round(v * 1000) / 1000, 0.001), hints: H("Utilise la formule n/(n + 1).", `n = ${n}.`, `${n}/${n + 1}.`, "Divise."), solution: `${n}/${n + 1} ≈ ${fr(Math.round(v * 1000) / 1000)}.` };
  }, FR),
  mk("ar-division-euclid", DIV, 2, { skill: "Division euclidienne dans ℤ (quotient et reste, a ou b négatif)", ref: `${BOOK}, chap. 1 §1.2, division euclidienne (p. 9-10) et ex. 1.e-1.f (p. 12) et ex. 7-10 (p. 28)`, kw: ["division euclidienne", "quotient", "reste", "0 ≤ r < |b|", "entier relatif"] }, (_c, r) => {
    const b = nzr(r, -25, 25), a = nzr(r, -300, 300);
    let q = Math.floor(a / b), rem = a - b * q;
    if (rem < 0) { q += b > 0 ? -1 : 1; rem = a - b * q; }
    if (rem >= Math.abs(b)) { q += b > 0 ? 1 : -1; rem = a - b * q; }
    const wantQ = int(r, 0, 1) === 0;
    return { statement: `On effectue la division euclidienne de a = ${n2(a)} par b = ${n2(b)}. Quel est ${wantQ ? "le quotient" : "le reste"} ?`, answer: num(wantQ ? q : rem), hints: H("a = bq + r avec 0 ≤ r < |b|.", "Le reste est toujours positif ou nul.", `Cherche q tel que ${n2(b)} × q soit proche de ${n2(a)} sans dépasser (reste ≥ 0).`, `r = a − bq.`), solution: `${n2(a)} = ${par(b)} × ${par(q)} + ${rem}, avec 0 ≤ ${rem} < ${Math.abs(b)}. Quotient ${n2(q)}, reste ${rem}.` };
  }, FR),
  mk("ar-division-inverse", DIV, 3, { skill: "Retrouver a connaissant le quotient et le reste (ou b)", ref: `${BOOK}, chap. 1 §1.2 (p. 9-10) et ex. 1.f (p. 12) et ex. 8, 10 (p. 28)`, kw: ["division euclidienne", "quotient", "reste", "déterminer l'entier"] }, (_c, r) => {
    const b = int(r, 5, 30), q = int(r, 2, 40), rem = int(r, 1, b - 1), a = b * q + rem;
    if (int(r, 0, 1) === 0) return { statement: `Dans la division euclidienne d'un entier naturel a par ${b}, le quotient est ${q} et le reste ${rem}. Quel est l'entier a ?`, answer: num(a), hints: H("a = bq + r.", `b = ${b}, q = ${q}, r = ${rem}.`, `${b} × ${q} + ${rem}.`, "Calcule."), solution: `a = ${b} × ${q} + ${rem} = ${a}.` };
    return { statement: `Un entier naturel a, divisé par ${b}, a pour quotient ${q} et pour reste ${rem}. Quelle est la valeur de a + ${q} + ${rem} ?`, answer: num(a + q + rem), hints: H("Calcule d'abord a.", "a = bq + r.", `a = ${b} × ${q} + ${rem}.`, "Ajoute ensuite q et r."), solution: `a = ${a} ; a + q + r = ${a} + ${q} + ${rem} = ${a + q + rem}.` };
  }, FR),
  mk("ar-numeration", DIV, 2, { skill: "Changements de base (décimal, binaire, base b, hexadécimal)", ref: `${BOOK}, chap. 1 §1.3, numération (p. 10-11) et ex. 1.g-1.h (p. 12) et ex. 11-14 (p. 28)`, kw: ["base", "binaire", "hexadécimal", "numération", "écriture en base b", "divisions successives"] }, (_c, r) => {
    const t = int(r, 0, 3);
    if (t === 0) { const b = pick(r, [2, 3, 5, 7]), x = int(r, 20, 400), d = digits(x, b); return { statement: `Écris ${x} en base ${b}. Donne le nombre formé par les chiffres (sans la barre).`, answer: num(Number(d.join(""))), hints: H("On effectue des divisions euclidiennes successives par la base.", `Divise ${x} par ${b}, puis le quotient par ${b}, etc.`, "Les restes, lus du dernier au premier, sont les chiffres.", `Premier reste : ${x % b}.`), solution: `Divisions successives par ${b} : on obtient ${x} = ${d.join("")} en base ${b}.` }; }
    if (t === 1) { const b = pick(r, [2, 3, 4, 5, 6, 7, 8]), d = Array.from({ length: int(r, 3, 5) }, () => int(r, 0, b - 1)); d[0] = int(r, 1, b - 1); const v = d.reduce((s, x) => s * b + x, 0); return { statement: `Quelle est l'écriture décimale du nombre ${d.join("")} écrit en base ${b} ?`, answer: num(v), hints: H("L'écriture en base b est un polynôme en b.", `Chaque chiffre est multiplié par une puissance de ${b}.`, `${d.map((x, i) => `${x}×${b}^${d.length - 1 - i}`).join(" + ")}.`, "Additionne."), solution: `${d.map((x, i) => `${x}×${b}^${d.length - 1 - i}`).join(" + ")} = ${v}.` }; }
    if (t === 2) { const x = int(r, 8, 255), hx = x.toString(16).toUpperCase(); return { statement: `En base seize, le nombre ${x} s'écrit ${hx}. Quel est alors le nombre de chiffres de cette écriture ?`, answer: num(hx.length), hints: H("Les chiffres de la base seize sont 0 à 9 puis A à F.", `Divise ${x} par 16 tant que possible.`, "Chaque division donne un chiffre.", "Compte les chiffres."), solution: `${x} = ${hx} en base 16 : ${hx.length} chiffre${hx.length > 1 ? "s" : ""}.` }; }
    const d = Array.from({ length: int(r, 6, 9) }, () => int(r, 0, 1)); d[0] = 1; const v = d.reduce((s, x) => s * 2 + x, 0); return { statement: `Quelle est l'écriture décimale du nombre binaire ${d.join("")} ?`, answer: num(v), hints: H("Chaque chiffre vaut 0 ou 1.", "Le chiffre de rang k pèse 2ᵏ.", "Additionne les puissances de 2 correspondant aux chiffres 1.", "Calcule."), solution: `${d.map((x, i) => (x ? `2^${d.length - 1 - i}` : "")).filter(Boolean).join(" + ")} = ${v}.` };
  }, FR),
  mk("ar-multiples-diviseurs", DIV, 2, { skill: "Multiples et diviseurs d'un entier relatif : dénombrer", ref: `${BOOK}, chap. 1 §2.1 (p. 12-13) et ex. 2.a-2.b (p. 15) et ex. 15-17 (p. 28)`, kw: ["multiples", "diviseurs", "divise", "nombre de multiples", "ensemble des diviseurs"] }, (_c, r) => {
    if (int(r, 0, 1) === 0) { const k = int(r, 3, 17), A = k * int(r, 20, 80); const lo = -A, hi = A; let c = 0; for (let x = lo; x <= hi; x++) if (x % k === 0) c++; return { statement: `Combien y a-t-il de multiples de ${k} (positifs, nuls ou négatifs) compris entre ${n2(lo)} et ${A} (bornes comprises) ?`, answer: num(c), hints: H("Les multiples de k sont les nombres kq, q ∈ ℤ.", `Cherche les q tels que ${n2(lo)} ≤ ${k}q ≤ ${A}.`, `q varie de ${n2(lo / k)} à ${A / k}.`, "Compte les valeurs entières de q."), solution: `q va de ${n2(-A / k)} à ${A / k} : ${c} multiples.` }; }
    const n = pick(r, [12, 18, 20, 24, 28, 30, 36, 40, 42, 48, 60, 72, 90, 100]); let c = 0; for (let d = 1; d <= n; d++) if (n % d === 0) c++;
    return { statement: `Combien d'entiers relatifs divisent ${n} (diviseurs positifs et négatifs) ?`, answer: num(2 * c), hints: H("Les diviseurs d'un entier relatif vont par paires d et −d.", `Cherche d'abord les diviseurs positifs de ${n}.`, `Il y en a ${c}.`, "Double pour tenir compte des négatifs."), solution: `${n} a ${c} diviseurs positifs, donc ${2 * c} diviseurs dans ℤ.` };
  }, FR),
  mk("ar-congruence-puissance", DIV, 3, { skill: "Reste de a^n modulo m (congruences, périodicité des puissances)", ref: `${BOOK}, chap. 1 §2.3, déterminations de restes (p. 15) et ex. 2.d (p. 17) et ex. 18-20, 29 (p. 28)`, kw: ["congruence", "reste", "puissance", "modulo", "périodicité"] }, (_c, r) => {
    const m = pick(r, [5, 7, 9, 11, 13]), a = int(r, 2, 12), n = int(r, 100, 3000);
    const v = powMod(a, n, m);
    const cyc: number[] = []; let x = 1; for (let i = 0; i < 12; i++) { cyc.push(x); x = (x * a) % m; }
    let period = 1; for (let k = 1; k <= 12; k++) if (cyc[k % 12] === cyc[0] && powMod(a, k, m) === 1) { period = k; break; }
    return { statement: `Quel est le reste de la division euclidienne de ${a}${String(n).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]).join("")} par ${m} ?`, answer: num(v), hints: H("On cherche une périodicité des puissances modulo " + m + ".", `Calcule ${a}⁰, ${a}¹, ${a}², … modulo ${m} jusqu'à retrouver 1.`, `On retrouve 1 pour l'exposant ${period} (au plus) : ${a}^${period} ≡ 1 [${m}].`, `Divise ${n} par ${period} et utilise le reste.`), solution: `${a}^${period} ≡ 1 [${m}] ; ${n} = ${period} × ${Math.floor(n / period)} + ${n % period}, donc ${a}^${n} ≡ ${a}^${n % period} ≡ ${v} [${m}].` };
  }, FR),
  mk("ar-congruence-calcul", DIV, 2, { skill: "Congruences : somme, produit et reste de la division", ref: `${BOOK}, chap. 1 §2.2, propriétés (p. 14) et exemples (p. 15)`, kw: ["congruence", "modulo", "compatible avec l'addition", "produit", "reste"] }, (_c, r) => {
    const n = pick(r, [7, 9, 11, 13, 25]), a = int(r, 50, 400), b = int(r, 50, 400), t = int(r, 0, 2);
    const ra = a % n, rb = b % n;
    if (t === 0) return { statement: `a = ${a} et b = ${b}. Quel est le reste de la division euclidienne de a + b par ${n} ?`, answer: num((ra + rb) % n), hints: H("La congruence est compatible avec l'addition.", `a ≡ ${ra} [${n}] et b ≡ ${rb} [${n}].`, `${ra} + ${rb} = ${ra + rb}.`, `Réduis modulo ${n}.`), solution: `a + b ≡ ${ra} + ${rb} = ${ra + rb} ≡ ${(ra + rb) % n} [${n}].` };
    if (t === 1) return { statement: `a = ${a} et b = ${b}. Quel est le reste de la division euclidienne de a × b par ${n} ?`, answer: num((ra * rb) % n), hints: H("La congruence est compatible avec la multiplication.", `a ≡ ${ra} [${n}] et b ≡ ${rb} [${n}].`, `${ra} × ${rb} = ${ra * rb}.`, `Réduis modulo ${n}.`), solution: `ab ≡ ${ra} × ${rb} = ${ra * rb} ≡ ${(ra * rb) % n} [${n}].` };
    return { statement: `a = ${a}. Quel est le reste de la division euclidienne de a² + 3a par ${n} ?`, answer: num((ra * ra + 3 * ra) % n), hints: H("Remplace a par son reste modulo " + n + ".", `a ≡ ${ra} [${n}].`, `${ra}² + 3 × ${ra} = ${ra * ra + 3 * ra}.`, `Réduis modulo ${n}.`), solution: `a² + 3a ≡ ${ra * ra + 3 * ra} ≡ ${(ra * ra + 3 * ra) % n} [${n}].` };
  }, FR),
  mk("ar-criteres", DIV, 2, { skill: "Reste modulo 3, 4, 5, 9, 11, 25 d'un nombre écrit en base dix", ref: `${BOOK}, chap. 1 §2.3, congruences particulières (p. 16) et ex. 2.f-2.g (p. 17) et ex. 24 (p. 28)`, kw: ["critères de divisibilité", "somme des chiffres", "modulo 9", "modulo 11", "chiffres"] }, (_c, r) => {
    const x = int(r, 10000, 9999999), m = pick(r, [3, 4, 5, 9, 11, 25]), s = String(x);
    const how = m === 3 || m === 9 ? `somme des chiffres ${s.split("").join(" + ")} = ${s.split("").reduce((a, c) => a + Number(c), 0)}` : m === 4 || m === 25 ? `deux derniers chiffres : ${s.slice(-2)}` : m === 5 ? `dernier chiffre : ${s.slice(-1)}` : `somme alternée des chiffres en partant de la droite`;
    return { statement: `Quel est le reste de la division euclidienne de ${f(x)} par ${m} ?`, answer: num(x % m), hints: H("On utilise les congruences des puissances de 10.", m === 3 || m === 9 ? "10 ≡ 1 modulo 3 et modulo 9 : le reste est celui de la somme des chiffres." : m === 11 ? "10 ≡ −1 modulo 11 : on alterne les signes des chiffres." : m === 5 ? "10 ≡ 0 modulo 5 : seul le dernier chiffre compte." : "10² ≡ 0 modulo 4 et 25 : seuls les deux derniers chiffres comptent.", `Ici : ${how}.`, "Réduis modulo " + m + "."), solution: `Reste de ${f(x)} par ${m} : ${x % m}.` };
  }, FR),
  mk("ar-cours-div", DIV, 1, { skill: "Divisibilité et congruences : questions de cours", ref: `${BOOK}, chap. 1 §1 et §2 (p. 6-16)`, kw: ["divise", "congruence", "récurrence", "division euclidienne", "multiple", "diviseur"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle est la condition de la division euclidienne de a par b ≠ 0 ?", good: "a = bq + r avec 0 ≤ r < |b|", bad: ["a = bq + r avec 0 < r ≤ |b|", "a = bq + r avec r quelconque", "a = bq + r avec −|b| < r < 0"], why: "Propriété p. 9 : le couple (q ; r) est unique." },
      { q: "0 est-il un diviseur d'un entier relatif ?", good: "Non, 0 ne divise aucun entier relatif", bad: ["Oui, il divise tous les entiers", "Oui, il divise seulement 0", "Oui, seulement les nombres pairs"], why: "Remarque p. 12 : on ne divise pas par 0 ; mais 0 est multiple de tout entier." },
      { q: "Si b divise a, avec a et b non nuls, alors…", good: "|b| ≤ |a|", bad: ["|a| ≤ |b|", "a = b", "a et b sont premiers entre eux"], why: "Propriété 1, p. 12." },
      { q: "Si a divise b et b divise a (a et b non nuls), alors…", good: "a = b ou a = −b", bad: ["a = b seulement", "a et b sont premiers", "a = 1"], why: "Propriété 2, p. 13." },
      { q: "Si a divise b et c, alors a divise…", good: "pb + qc pour tous entiers p et q", bad: ["seulement b + c", "seulement bc", "aucune combinaison"], why: "Propriété 3, p. 13 : combinaison linéaire." },
      { q: "a ≡ b [n] signifie que…", good: "a − b est un multiple de n", bad: ["a + b est un multiple de n", "a = b", "a divise b"], why: "Définition, p. 14." },
      { q: "a ≡ a′ [n] si et seulement si…", good: "a et a′ ont le même reste dans la division par n", bad: ["a et a′ ont le même quotient", "a divise a′", "a + a′ = n"], why: "Propriété 1, p. 14." },
      { q: "Si a ≡ b [n], que peut-on dire de aᵏ ?", good: "aᵏ ≡ bᵏ [n]", bad: ["aᵏ ≡ b [n]", "aᵏ ≡ kb [n]", "On ne peut rien dire"], why: "Remarque p. 15." },
      { q: "(ℤ, +) est…", good: "un groupe commutatif", bad: ["seulement un monoïde", "un anneau non commutatif", "un corps"], why: "p. 8 : cinq propriétés de l'addition." },
      { q: "Pour démontrer par récurrence P(n) pour n ≥ n₀, il faut…", good: "démontrer P(n₀), puis P(k) ⇒ P(k+1) pour tout k ≥ n₀", bad: ["vérifier P(n) pour quelques valeurs", "démontrer seulement P(k) ⇒ P(k+1)", "démontrer P(n) pour n = 0 et n = 1 seulement"], why: "Principe de récurrence, p. 7." },
      { q: "Quel est le plus grand élément d'une partie non vide majorée de ℤ ?", good: "Il existe toujours", bad: ["Il n'existe pas toujours", "C'est toujours 0", "C'est la borne supérieure réelle"], why: "Propriété 2, p. 9 : toute partie non vide majorée de ℤ admet un plus grand élément." },
    ];
    return qcmOf(r, pool, "Rappelle-toi la définition ou la propriété du §1-2.");
  }, QCM),

  // ===== PPCM et PGCD, nombres premiers =====
  mk("ar-pgcd-ppcm", PGP, 2, { skill: "Calculer PGCD et PPCM de deux entiers (même relatifs)", ref: `${BOOK}, chap. 1 §3.1-3.2 (p. 17-19) et ex. 3.a-3.b, 3.g (p. 24) et ex. 32-36 (p. 29)`, kw: ["PGCD", "PPCM", "plus grand commun diviseur", "plus petit commun multiple", "a×b = pgcd × ppcm"] }, (_c, r) => {
    const g = int(r, 2, 15), a = g * int(r, 2, 15), b = g * int(r, 2, 15), sa = int(r, 0, 3) === 0 ? -1 : 1, sb = int(r, 0, 3) === 0 ? -1 : 1;
    const wantG = int(r, 0, 1) === 0, G = gcd(a, b), L = lcm(a, b);
    return { statement: `Quel est le ${wantG ? "PGCD" : "PPCM"} de ${n2(sa * a)} et ${n2(sb * b)} ?`, answer: num(wantG ? G : L), hints: H("On peut se ramener aux valeurs absolues.", wantG ? "PGCD(a ; b) = PGCD(|a| ; |b|)." : "PPCM(a ; b) = PPCM(|a| ; |b|).", wantG ? "Cherche les diviseurs communs ou utilise l'algorithme d'Euclide." : "PPCM × PGCD = |ab|.", "Calcule."), solution: `PGCD(${a} ; ${b}) = ${G} et PPCM(${a} ; ${b}) = ${a} × ${b} / ${G} = ${L}.` };
  }, FR),
  mk("ar-euclide", PGP, 2, { skill: "Algorithme d'Euclide : PGCD par divisions successives", ref: `${BOOK}, chap. 1 §3.2, algorithme d'Euclide (p. 20-21) et ex. 3.c (p. 24) et ex. 35 (p. 29)`, kw: ["algorithme d'Euclide", "divisions successives", "dernier reste non nul", "PGCD"] }, (_c, r) => {
    const g = int(r, 3, 40), a = g * int(r, 20, 120), b = g * int(r, 5, 19);
    const { g: G, rows } = eu(Math.max(a, b), Math.min(a, b));
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `Détermine le PGCD de ${f(Math.max(a, b))} et ${f(Math.min(a, b))} par l'algorithme d'Euclide.`, answer: num(G), hints: H("PGCD(a ; b) = PGCD(b ; r) où r est le reste de a par b.", "Continue jusqu'à obtenir un reste nul.", "Le PGCD est le dernier reste non nul.", `Première division : ${stepsText(rows.slice(0, 1))}.`), solution: `${stepsText(rows)}. Le dernier reste non nul est ${f(G)}.` };
    return { statement: `On applique l'algorithme d'Euclide à ${f(Math.max(a, b))} et ${f(Math.min(a, b))}. Combien de divisions euclidiennes faut-il effectuer pour obtenir un reste nul ?`, answer: num(rows.length), hints: H("Chaque division remplace (a ; b) par (b ; r).", "On s'arrête quand le reste est nul.", "Compte les divisions, la dernière comprise.", `Première division : ${stepsText(rows.slice(0, 1))}.`), solution: `${stepsText(rows)}. Il y a ${rows.length} divisions.` };
  }, FR),
  mk("ar-bezout-inverse", PGP, 3, { skill: "Théorème de Bézout : inverse modulaire et coefficients de Bézout", ref: `${BOOK}, chap. 1 §3.3-3.4, Bézout et exemples (p. 21-23) et ex. 46 (p. 29)`, kw: ["Bézout", "au + bv = 1", "premiers entre eux", "inverse modulo", "coefficients de Bézout"] }, (_c, r) => {
    let a = 0, b = 0; do { a = int(r, 5, 60); b = int(r, 5, 60); } while (gcd(a, b) !== 1 || a === b);
    if (int(r, 0, 1) === 0) { const x = inv(a % b, b); return { statement: `${a} et ${b} sont premiers entre eux. Quel est l'unique entier x de {0 ; 1 ; … ; ${b - 1}} tel que ${a}x ≡ 1 [${b}] ?`, answer: num(x), hints: H("D'après Bézout, il existe u et v tels que au + bv = 1.", `Alors u est un inverse de ${a} modulo ${b}.`, `Teste les valeurs de x, ou remonte l'algorithme d'Euclide de ${a} et ${b}.`, "Vérifie que ax − 1 est multiple de b."), solution: `${a} × ${x} = ${a * x} = ${b} × ${Math.floor(a * x / b)} + 1, donc ${a} × ${x} ≡ 1 [${b}].` }; }
    const x = inv(a % b, b), y = (a * x - 1) / b; return { statement: `${a} × ${x} − ${b} × ${y} = 1. Quel est le PGCD de ${a} et ${b} ?`, answer: num(1), hints: H("C'est une égalité de la forme au + bv = 1.", "Le théorème de Bézout caractérise les entiers premiers entre eux.", "Tout diviseur commun divise 1.", "Conclus."), solution: `D'après le théorème de Bézout, ${a} et ${b} sont premiers entre eux : PGCD = 1.` };
  }, FR),
  mk("ar-diophante", PGP, 3, { skill: "Équation ax + by = c : existence et nombre de solutions entières", ref: `${BOOK}, chap. 1 §3.4, équations ax + by = c (p. 23) et ex. 1.a-1.b (p. 12) et ex. 44-46 (p. 29)`, kw: ["équation diophantienne", "ax + by = c", "solutions", "PGCD", "couples d'entiers"] }, (_c, r) => {
    const t = int(r, 0, 1);
    if (t === 0) { const a = int(r, 3, 20), b = int(r, 3, 20), g = gcd(a, b), ok = int(r, 0, 1) === 0, c = ok ? g * int(r, 1, 12) : g * int(r, 1, 12) + (g > 1 ? int(r, 1, g - 1) : 0); const has = c % g === 0; return { statement: `L'équation ${a}x + ${b}y = ${c} a-t-elle des solutions dans ℤ² ?`, answer: choice(r, ["Oui", "Non"], has ? 0 : 1), hints: H("Cherche les conditions d'existence.", "ax + by = c a des solutions si et seulement si c est un multiple de PGCD(a ; b).", `PGCD(${a} ; ${b}) = ${g}.`, `${c} est-il multiple de ${g} ?`), solution: `PGCD(${a} ; ${b}) = ${g}. ${c} ${has ? "est" : "n'est pas"} multiple de ${g} : ${has ? "il y a des solutions" : "pas de solution"}.` }; }
    const a = int(r, 2, 9), b = int(r, 2, 9), n0 = int(r, 20, 80), c = a * int(r, 1, 8) + b * int(r, 1, 8) + (n0 - 20) * 0; let cnt = 0; for (let x = 0; x * a <= c; x++) if ((c - a * x) % b === 0) cnt++;
    return { statement: `Combien de couples (x ; y) d'entiers naturels vérifient ${a}x + ${b}y = ${c} ?`, answer: num(cnt), hints: H("Il y a une infinité de solutions dans ℤ², mais peu dans ℕ².", `x doit vérifier ${a}x ≤ ${c}.`, `Pour chaque x, vérifie que ${c} − ${a}x est un multiple de ${b}.`, "Compte les couples."), solution: `On teste x = 0, 1, …, ${Math.floor(c / a)} : ${cnt} couple${cnt > 1 ? "s" : ""}.` };
  }, FR),
  mk("ar-pgcd-systeme", PGP, 3, { skill: "Systèmes PGCD(x ; y) = d et x + y = s (ou PPCM)", ref: `${BOOK}, chap. 1 §3.4, systèmes (p. 23) et ex. 37 (p. 29)`, kw: ["PGCD", "PPCM", "x + y", "couples d'entiers naturels", "système"] }, (_c, r) => {
    const d = int(r, 2, 15), k = int(r, 4, 14), s = d * k; let cnt = 0; for (let x = d; x < s; x += d) if (gcd(x, s - x) === d) cnt++;
    return { statement: `Combien de couples (x ; y) d'entiers naturels non nuls vérifient PGCD(x ; y) = ${d} et x + y = ${s} ?`, answer: num(cnt), hints: H("Écris x = " + d + "x′ et y = " + d + "y′.", `Alors x′ et y′ sont premiers entre eux et x′ + y′ = ${k}.`, `Cherche les couples (x′ ; y′) premiers entre eux de somme ${k}.`, "Chaque couple (x′ ; y′) donne un couple (x ; y)."), solution: `x′ + y′ = ${k} avec x′ ∧ y′ = 1 : ${cnt} couple${cnt > 1 ? "s" : ""} (x ; y).` };
  }, FR),
  mk("ar-premier", PGP, 2, { skill: "Reconnaître un nombre premier (critère √n)", ref: `${BOOK}, chap. 1 §4.1, nombres premiers (p. 24-26) et ex. 4.a-4.b (p. 27)`, kw: ["nombre premier", "critère", "racine carrée", "divisible", "crible d'Ératosthène"] }, (_c, r) => {
    const n = int(r, 60, 400), p = isPrime(n);
    let d = 2; while (d * d <= n && n % d) d++;
    return { statement: `Le nombre ${n} est-il premier ?`, answer: choice(r, ["Oui", "Non"], p ? 0 : 1), hints: H("Un entier non premier admet un diviseur premier d avec d² ≤ n.", `√${n} ≈ ${fr(Math.round(Math.sqrt(n) * 100) / 100)}.`, "Teste les nombres premiers 2, 3, 5, 7, 11, 13… jusqu'à √n.", "S'il y a un diviseur, n n'est pas premier."), solution: p ? `Aucun nombre premier ≤ ${Math.floor(Math.sqrt(n))} ne divise ${n} : il est premier.` : `${n} est divisible par ${d} : il n'est pas premier.` };
  }, QCM),
  mk("ar-decomposition", PGP, 2, { skill: "Décomposition en produit de facteurs premiers : nombre de diviseurs, PGCD, PPCM", ref: `${BOOK}, chap. 1 §4.2, théorème fondamental et exemples (p. 26) et ex. 4.c-4.g (p. 27)`, kw: ["facteurs premiers", "décomposition", "nombre de diviseurs", "PPCM", "PGCD", "fraction irréductible"] }, (_c, r) => {
    const n = pick(r, [60, 72, 84, 90, 120, 126, 144, 180, 210, 240, 252, 360, 420, 504, 720, 1260]);
    const t = int(r, 0, 2), fa = factorize(n);
    if (t === 0) { const nd = fa.reduce((s, [, k]) => s * (k + 1), 1); return { statement: `Combien ${n} a-t-il de diviseurs positifs ?`, answer: num(nd), hints: H("Décompose en facteurs premiers.", `${n} = ${factStr(n)}.`, "Un diviseur s'écrit avec des exposants compris entre 0 et ceux de la décomposition.", "Multiplie les (exposant + 1)."), solution: `${n} = ${factStr(n)} : ${fa.map(([, k]) => `(${k} + 1)`).join(" × ")} = ${nd} diviseurs.` }; }
    if (t === 1) { const m = pick(r, [48, 54, 75, 100, 150, 175, 200, 300].filter((x) => x !== n)); const G = gcd(n, m), L = lcm(n, m); const askG = int(r, 0, 1) === 0; return { statement: `En utilisant les décompositions en facteurs premiers de ${n} et ${m}, quel est leur ${askG ? "PGCD" : "PPCM"} ?`, answer: num(askG ? G : L), hints: H("Décompose les deux nombres.", `${n} = ${factStr(n)} et ${m} = ${factStr(m)}.`, askG ? "Prends chaque facteur premier commun avec le plus petit exposant." : "Prends chaque facteur premier avec le plus grand exposant.", "Calcule le produit."), solution: `${n} = ${factStr(n)}, ${m} = ${factStr(m)} ; PGCD = ${G}, PPCM = ${L}.` }; }
    const a = pick(r, [15, 21, 35, 33, 77, 91]), g2 = int(r, 2, 12), num1 = a * g2 * int(r, 2, 4), den = a * g2 * int(r, 5, 9); const G = gcd(num1, den); return { statement: `Quel est le dénominateur de la fraction ${num1}/${den} sous forme irréductible ?`, answer: num(den / G), hints: H("On simplifie par le PGCD.", `PGCD(${num1} ; ${den}) = ?`, "Utilise la décomposition en facteurs premiers.", "Divise le dénominateur par le PGCD."), solution: `PGCD(${num1} ; ${den}) = ${G}, donc ${num1}/${den} = ${num1 / G}/${den / G}.` };
  }, FR),
  mk("ar-fermat", PGP, 3, { skill: "Petit théorème de Fermat : reste de a^n modulo un nombre premier", ref: `${BOOK}, chap. 1 §4.3, petit théorème de Fermat (p. 27) et ex. 4.b (p. 27) et ex. 26-29 (p. 29)`, kw: ["Fermat", "a^(p−1) ≡ 1", "nombre premier", "reste", "puissance"] }, (_c, r) => {
    const p = pick(r, [5, 7, 11, 13]), a = int(r, 2, 40), n = int(r, 100, 900);
    if (a % p === 0) return { statement: `Quel est le reste de la division de 3${String(n).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]).join("")} par 7 ?`, answer: num(powMod(3, n, 7)), hints: H("7 est premier et ne divise pas 3.", "Petit théorème de Fermat : 3⁶ ≡ 1 [7].", `${n} = 6q + r.`, "Calcule 3ʳ."), solution: `3⁶ ≡ 1 [7], donc 3^${n} ≡ 3^${n % 6} ≡ ${powMod(3, n, 7)} [7].` };
    const v = powMod(a, n, p);
    return { statement: `${p} est un nombre premier et ${a} n'est pas multiple de ${p}. Quel est le reste de la division euclidienne de ${a}${String(n).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]).join("")} par ${p} ?`, answer: num(v), hints: H("Utilise le petit théorème de Fermat.", `a^(p−1) ≡ 1 [p] : ici ${a}^${p - 1} ≡ 1 [${p}].`, `Divise ${n} par ${p - 1} : ${n} = ${p - 1}q + ${n % (p - 1)}.`, "Calcule le reste de la puissance restante."), solution: `${a}^${p - 1} ≡ 1 [${p}] ; ${n} = ${p - 1} × ${Math.floor(n / (p - 1))} + ${n % (p - 1)} ; donc ${a}^${n} ≡ ${a}^${n % (p - 1)} ≡ ${v} [${p}].` };
  }, FR),
  mk("ar-cours-pgcd", PGP, 2, { skill: "PGCD, PPCM, Bézout, Gauss, nombres premiers : questions de cours", ref: `${BOOK}, chap. 1 §3 et §4 (p. 17-27)`, kw: ["Bézout", "Gauss", "PGCD", "PPCM", "nombres premiers entre eux", "nombre premier", "Fermat"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle relation lie le PGCD δ et le PPCM μ de deux entiers naturels non nuls a et b ?", good: "δμ = ab", bad: ["δ + μ = a + b", "δ = μ", "δμ = a + b"], why: "Propriété p. 22." },
      { q: "Quel est l'énoncé du théorème de Bézout ?", good: "a et b sont premiers entre eux si et seulement si il existe u, v ∈ ℤ tels que au + bv = 1", bad: ["a et b sont premiers entre eux si et seulement si ab = 1", "PGCD(a ; b) = a + b", "au + bv = 1 pour tous a et b"], why: "Théorème p. 21." },
      { q: "Quel est l'énoncé du théorème de Gauss ?", good: "Si a divise bc et si a et b sont premiers entre eux, alors a divise c", bad: ["Si a divise bc alors a divise b ou c", "Si a et b sont premiers entre eux, alors a divise bc", "Si a divise c alors a divise bc"], why: "Théorème p. 21." },
      { q: "Si a et b sont premiers entre eux, que vaut PPCM(a ; b) ?", good: "ab", bad: ["a + b", "1", "PGCD(a ; b)"], why: "Conséquence, p. 22." },
      { q: "Si a et b divisent c et sont premiers entre eux, alors…", good: "ab divise c", bad: ["a + b divise c", "a = b", "c = ab"], why: "Conséquence, p. 22." },
      { q: "Combien y a-t-il de nombres premiers ?", good: "Une infinité", bad: ["Un nombre fini", "Exactement 100", "On ne sait pas"], why: "Propriété 1, p. 25 (démonstration par l'absurde)." },
      { q: "Pour tester si n est premier, il suffit de tester les diviseurs premiers…", good: "inférieurs ou égaux à √n", bad: ["inférieurs ou égaux à n/2", "inférieurs à n²", "pairs seulement"], why: "Propriété 2, p. 25." },
      { q: "0 et 1 sont-ils des nombres premiers ?", good: "Non", bad: ["Oui tous les deux", "Seulement 1", "Seulement 0"], why: "Remarque p. 24." },
      { q: "Deux nombres premiers distincts sont…", good: "premiers entre eux", bad: ["égaux", "multiples l'un de l'autre", "de PGCD égal à leur somme"], why: "Remarque p. 24." },
      { q: "Quelle est la méthode de l'algorithme d'Euclide ?", good: "PGCD(a ; b) = PGCD(b ; r) où r est le reste de a par b, jusqu'à un reste nul", bad: ["PGCD(a ; b) = PGCD(a + b ; b)", "PGCD(a ; b) = a − b", "on divise toujours par 2"], why: "Propriétés p. 20." },
      { q: "Le petit théorème de Fermat dit que, pour p premier et a non multiple de p…", good: "a^(p−1) ≡ 1 [p]", bad: ["a^p ≡ 1 [p]", "a ≡ p [a]", "a^(p+1) ≡ 1 [p]"], why: "p. 27." },
      { q: "Deux entiers consécutifs non nuls n et n + 1 sont-ils premiers entre eux ?", good: "Oui, toujours", bad: ["Non, jamais", "Seulement s'ils sont impairs", "Seulement si n est premier"], why: "Exemple p. 21 : n(−1) + (n + 1)×1 = 1." },
    ];
    return qcmOf(r, pool, "Relis les théorèmes de Bézout et de Gauss.");
  }, QCM),
];
void withWrong;
