// CIAM 5ème : activités numériques (chap. 10 à 16 du manuel). Énoncés originaux, réponses calculées par le code.
import { choice, fr, gcd, int, num, pick, register, round, Rng } from "./core";
import { ciam, dec, f, factorize, factStr, fracS, H, Item, isPrime, PUR, QCM, qcmOf, reduce, sg, shuffle, sup, WHO, withWrong } from "./ciam-kit";

const mk = ciam("5e", "ciam5");
const BOOK = "CIAM 5ème";
const who = (r: Rng) => pick(r, WHO);
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
const fd = (x: number, d: number) => x.toFixed(d).replace(".", ",");
const sgn = (x: number) => (x < 0 ? `(−${fr(-x)})` : `(+${fr(x)})`);
const num2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const FR = [{ id: "calcul", label: "Calcul" }];

register(
  // ===== Chapitre 12 : Puissance d'un nombre entier naturel =====
  mk("puis-calcul", "Puissances d'un nombre entier naturel", 1, { skill: "Calculer une puissance", ref: `${BOOK}, chap. 12 §1, ex. 1.b-1.c (p. 155) et ex. 3 (p. 159)`, kw: ["puissance", "exposant", "carré", "cube", "calculer"] }, (c, r) => {
    const a = int(r, 2, 9), n = int(r, 2, a <= 3 ? 6 : a <= 5 ? 4 : 3);
    const v = a ** n;
    return {
      statement: c === "pur" ? `Calcule ${a}${sup(n)}.` : n === 2 ? `Un carré a pour côté ${a} cm. Quelle est son aire (en cm²) ?` : n === 3 ? `Un cube a pour arête ${a} cm. Quel est son volume (en cm³) ?` : `Une cellule se divise en ${a} cellules chaque seconde. Combien y a-t-il de cellules après ${n} secondes (en partant d'une seule) ?`,
      answer: num(v),
      hints: H("On calcule une puissance.", `${a}${sup(n)} est le produit de ${n} facteurs égaux à ${a}.`, `${Array(n).fill(a).join(" × ")}.`, `Calcule de gauche à droite : ${a} × ${a} = ${a * a}.`),
      solution: `${a}${sup(n)} = ${Array(n).fill(a).join(" × ")} = ${f(v)}.`,
    };
  }),
  mk("puis-ecrire", "Puissances d'un nombre entier naturel", 2, { skill: "Écrire un nombre sous la forme d'une puissance (trouver l'exposant)", ref: `${BOOK}, chap. 12 §1, ex. 1.d-1.e et ex. 1-3 (p. 155, 159)`, kw: ["exposant", "puissance", "écrire sous forme de puissance", "produit de facteurs égaux"] }, (c, r) => {
    const a = pick(r, [2, 3, 4, 5, 6, 7, 10]), n = int(r, 3, a <= 3 ? 7 : 4), v = a ** n;
    void c;
    return {
      statement: `On a ${f(v)} = ${a}^□. Quel exposant faut-il écrire à la place de □ ?`,
      answer: num(n),
      hints: H("On cherche combien de facteurs égaux à " + a + " sont multipliés.", `Divise ${f(v)} par ${a} autant de fois que possible.`, "Compte le nombre de divisions.", `${a} × ${a} = ${a * a}.`),
      solution: `${Array(n).fill(a).join(" × ")} = ${f(v)}, donc l'exposant est ${n}.`,
    };
  }, [{ id: "exposant", label: "Trouver l'exposant" }]),
  mk("puis-produit", "Puissances d'un nombre entier naturel", 2, { skill: "Calculer a^m × a^n et (a × b)^p", ref: `${BOOK}, chap. 12 §2.2-2.3, ex. 2.c-2.d (p. 158) et ex. 7-9 (p. 159)`, kw: ["produit de puissances", "exposant", "a^m × a^n", "même base"] }, (c, r) => {
    void c;
    if (int(r, 0, 1) === 0) {
      const a = int(r, 2, 9), m = int(r, 2, 6), n = int(r, 2, 6);
      return {
        statement: `On écrit ${a}${sup(m)} × ${a}${sup(n)} = ${a}^□. Quel exposant faut-il écrire à la place de □ ?`,
        answer: num(m + n),
        hints: H("Deux puissances de même base sont multipliées.", `${a}${sup(m)} est ${m} facteurs ${a}, ${a}${sup(n)} est ${n} facteurs ${a}.`, "On compte tous les facteurs ensemble.", `${m} + ${n}.`),
        solution: `${a}${sup(m)} × ${a}${sup(n)} : ${m} + ${n} = ${m + n} facteurs égaux à ${a}, donc ${a}${sup(m + n)}.`,
      };
    }
    const a = pick(r, [2, 4, 5, 6, 8, 25]), b = pick(r, [5, 2, 4, 3, 125].filter((x) => x !== a)), p = int(r, 2, 3);
    const v = (a * b) ** p;
    return {
      statement: `Calcule ${a}${sup(p)} × ${b}${sup(p)} en écrivant d'abord le produit sous la forme (${a} × ${b})${sup(p)}.`,
      answer: num(v),
      hints: H("Deux puissances de même exposant sont multipliées.", `aᵖ × bᵖ = (a × b)ᵖ.`, `Calcule d'abord ${a} × ${b} = ${a * b}.`, `Puis élève ${a * b} à la puissance ${p}.`),
      solution: `${a}${sup(p)} × ${b}${sup(p)} = (${a} × ${b})${sup(p)} = ${a * b}${sup(p)} = ${f(v)}.`,
    };
  }, FR),
  mk("puis-priorite", "Puissances d'un nombre entier naturel", 2, { skill: "Priorité des puissances dans un calcul", ref: `${BOOK}, chap. 12 §2.1, ex. 2.a-2.b (p. 156-157)`, kw: ["priorité", "puissance", "parenthèses", "calcul"] }, (c, r) => {
    void c;
    const a = int(r, 2, 6), n = int(r, 2, 3), b = int(r, 2, 9), d = int(r, 2, 9);
    const t = int(r, 0, 3);
    const ex = [
      { s: `${b} + ${a}${sup(n)}`, v: b + a ** n, w: `${a}${sup(n)} = ${a ** n} ; ${b} + ${a ** n} = ${b + a ** n}.` },
      { s: `${b} × ${a}${sup(n)}`, v: b * a ** n, w: `${a}${sup(n)} = ${a ** n} ; ${b} × ${a ** n} = ${b * a ** n}.` },
      { s: `(${b} × ${a})${sup(n)}`, v: (a * b) ** n, w: `${b} × ${a} = ${a * b} ; ${a * b}${sup(n)} = ${(a * b) ** n}.` },
      { s: `${d} + ${b} × ${a}${sup(2)}`, v: d + b * a * a, w: `${a}² = ${a * a} ; ${b} × ${a * a} = ${b * a * a} ; ${d} + ${b * a * a} = ${d + b * a * a}.` },
    ][t];
    return {
      statement: `Calcule ${ex.s}.`,
      answer: num(ex.v),
      hints: H("Il y a une puissance dans le calcul.", "Les puissances sont prioritaires sur les multiplications, additions et soustractions.", "Ce qui est entre parenthèses se calcule d'abord.", "Calcule la puissance en premier."),
      solution: ex.w,
    };
  }, FR),
  mk("puis-vrai-faux", "Puissances d'un nombre entier naturel", 2, { skill: "Reconnaître une égalité vraie sur les puissances", ref: `${BOOK}, chap. 12, ex. 11 (p. 159)`, kw: ["vrai", "faux", "puissance", "égalité"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Laquelle de ces égalités est vraie ?", good: "2³ × 2⁴ = 2⁷", bad: ["2³ × 2⁴ = 4⁷", "2³ × 2⁴ = 2¹²", "2³ × 2⁴ = 2⁶"], why: "Même base : on additionne les exposants (3 + 4 = 7)." },
      { q: "Laquelle de ces égalités est vraie ?", good: "(3 × 4)² = 3² × 4²", bad: ["(3 × 4)² = 3² + 4²", "(3 × 4)² = 3 × 4²", "(3 × 4)² = 3² × 4"], why: "(a × b)² = a² × b² : 144 = 9 × 16." },
      { q: "Laquelle de ces égalités est fausse ?", good: "(3 + 4)² = 3² + 4²", bad: ["(3 × 4)² = 3² × 4²", "3² × 3³ = 3⁵", "2 × 2 × 2 = 2³"], why: "(3 + 4)² = 49 alors que 3² + 4² = 25 : une somme ne se distribue pas dans une puissance." },
      { q: "Laquelle de ces égalités est fausse ?", good: "2 × 3² = 6²", bad: ["2² × 3² = 6²", "5 × 5 × 5 = 5³", "10² × 10³ = 10⁵"], why: "2 × 3² = 18 alors que 6² = 36 ; seule 2² × 3² = (2 × 3)² = 36." },
      { q: "Laquelle de ces égalités est vraie ?", good: "5³ × 4³ = 20³", bad: ["5³ × 4³ = 20⁶", "5³ × 4³ = 9³", "5³ × 4³ = 20⁹"], why: "aᵖ × bᵖ = (a × b)ᵖ : 5³ × 4³ = (5 × 4)³ = 20³." },
      { q: "Quelle est la valeur de 0⁵ ?", good: "0", bad: ["1", "5", "Elle n'existe pas"], why: "0ⁿ = 0 pour n entier naturel plus grand que 1." },
      { q: "Quelle est la valeur de 1⁸ ?", good: "1", bad: ["8", "0", "18"], why: "1ⁿ = 1 pour n entier naturel plus grand que 1." },
      { q: "Laquelle de ces égalités est vraie ?", good: "10² × 10³ = 10⁵", bad: ["10² × 10³ = 10⁶", "10² × 10³ = 100⁵", "10² × 10³ = 10⁹"], why: "On additionne les exposants : 2 + 3 = 5." },
      { q: "Laquelle de ces égalités est fausse ?", good: "2² + 3² = 5²", bad: ["2² × 3² = 6²", "2 × 2 × 2 = 2³", "5³ × 5 = 5⁴"], why: "2² + 3² = 13 alors que 5² = 25." },
      { q: "Quelle est la valeur de 2⁵ ?", good: "32", bad: ["10", "25", "64"], why: "2 × 2 × 2 × 2 × 2 = 32." },
      { q: "Combien vaut 3 + 2 × 4² ?", good: "35", bad: ["80", "25", "50"], why: "La puissance d'abord : 4² = 16 ; 2 × 16 = 32 ; 3 + 32 = 35." },
      { q: "Laquelle de ces égalités est vraie ?", good: "(2 × 5)³ = 2³ × 5³", bad: ["(2 × 5)³ = 2 × 5³", "(2 × 5)³ = 2³ + 5³", "(2 × 5)³ = 10⁶"], why: "(a × b)ᵖ = aᵖ × bᵖ : 10³ = 1 000 = 8 × 125." },
    ];
    return qcmOf(r, pool, "Teste l'égalité avec de petits nombres.");
  }, QCM),

  // ===== Chapitre 13 : Division dans ℕ, nombres premiers =====
  mk("div-encadrer", "Division dans ℕ", 2, { skill: "Encadrer un nombre par deux multiples consécutifs", ref: `${BOOK}, chap. 13 §1.2, ex. 1.c-1.d (p. 164-165) et ex. 6-7 (p. 170)`, kw: ["multiples consécutifs", "encadrer", "quotient", "reste"] }, (c, r) => {
    const b = int(r, 4, 25), q = int(r, 3, 40), rr = int(r, 1, b - 1), a = b * q + rr;
    const low = int(r, 0, 1) === 0;
    return {
      statement: c === "pur" ? `On encadre ${a} par deux multiples consécutifs de ${b}. Quel est le ${low ? "plus petit" : "plus grand"} de ces deux multiples ?` : `Des boîtes contiennent chacune ${b} œufs. ${who(r)} a ${a} œufs. ${low ? "Combien d'œufs peut-on ranger dans des boîtes pleines ?" : "Quel est le plus petit nombre d'œufs supérieur à ce nombre qui remplit exactement des boîtes ?"}`,
      answer: num(low ? b * q : b * (q + 1)),
      hints: H("On cherche les deux multiples de " + b + " autour de " + a + ".", `Fais la division de ${a} par ${b}.`, `${a} = ${b} × ${q} + ${rr} : le quotient est ${q}.`, low ? `Le multiple du dessous est ${b} × ${q}.` : `Le multiple du dessus est ${b} × ${q + 1}.`),
      solution: `${a} = ${b} × ${q} + ${rr}, donc ${b * q} < ${a} < ${b * (q + 1)}. Réponse : ${low ? b * q : b * (q + 1)}.`,
    };
  }),
  mk("div-egalite", "Division dans ℕ", 2, { skill: "Reconnaître une égalité qui traduit une division euclidienne", ref: `${BOOK}, chap. 13, ex. 4-5 (p. 170)`, kw: ["division euclidienne", "égalité", "dividende", "diviseur", "quotient", "reste"] }, (c, r) => {
    void c;
    const b = int(r, 4, 20), q = int(r, 3, 15), rr = int(r, 1, b - 1);
    const ok = int(r, 0, 1) === 0;
    const rr2 = ok ? rr : rr + b;
    const a = b * q + rr2;
    return {
      statement: `L'égalité ${a} = ${b} × ${q} + ${rr2} traduit-elle la division euclidienne de ${a} par ${b} ?`,
      answer: choice(r, ["Oui", "Non"], ok ? 0 : 1),
      hints: H("Dans une division euclidienne, le reste est plus petit que le diviseur.", `Compare le reste ${rr2} au diviseur ${b}.`, "Si le reste est plus grand ou égal au diviseur, on peut encore ranger un groupe.", `${rr2} < ${b} ?`),
      solution: ok ? `Le reste ${rr2} est plus petit que le diviseur ${b} : oui.` : `Le reste ${rr2} n'est pas plus petit que le diviseur ${b} : non (le quotient est en réalité ${q + 1} et le reste ${rr2 - b}).`,
    };
  }, QCM),
  mk("div-conteneurs", "Division dans ℕ", 2, { skill: "Problème de partage : conteneurs pleins et reste", ref: `${BOOK}, chap. 13, ex. 1 et 9 (p. 170)`, kw: ["partage", "bouteilles", "bidons", "conteneur", "reste"] }, (_c, r) => {
    const cap = pick(r, [5, 8, 10, 12, 15, 20, 25]), n = int(r, 3, 12), total = cap * n + int(r, 1, cap - 1);
    const k = int(r, 0, 1);
    return {
      statement: k === 0
        ? `On dispose de ${total} litres d'eau à verser dans des bidons de ${cap} litres. Combien de bidons peut-on remplir complètement ?`
        : `On dispose de ${total} litres d'eau à verser dans des bidons de ${cap} litres. Combien de bidons faut-il au minimum pour y mettre toute l'eau ?`,
      answer: num(k === 0 ? n : n + 1),
      hints: H("On partage une quantité en groupes égaux.", `Divise ${total} par ${cap}.`, `${total} = ${cap} × ${n} + ${total - cap * n}.`, k === 0 ? "Le reste ne remplit pas un bidon entier." : "Le reste demande un bidon de plus."),
      solution: `${total} = ${cap} × ${n} + ${total - cap * n}. ${k === 0 ? `${n} bidons pleins.` : `${n} bidons pleins et un bidon pour le reste : ${n + 1}.`}`,
    };
  }, [{ id: "partage", label: "Partage" }]),
  mk("div-reste-critere", "Division dans ℕ", 2, { skill: "Reste de la division par 2, 3, 5 ou 9 sans poser la division", ref: `${BOOK}, chap. 13, ex. 12-13 et 21 (p. 170-171)`, kw: ["reste", "divisible", "critère", "chiffre", "sans effectuer"] }, (c, r) => {
    void c;
    const n = int(r, 1000, 99999), d = pick(r, [2, 3, 5, 9]);
    const sd = String(n).split("").reduce((s, x) => s + Number(x), 0);
    const rest = d === 2 ? n % 2 : d === 5 ? n % 5 : sd % d;
    return {
      statement: `Sans poser la division, détermine le reste de la division de ${f(n)} par ${d}.`,
      answer: num(n % d),
      hints: H("On utilise un critère de divisibilité.", d === 2 || d === 5 ? `Seul le dernier chiffre (${n % 10}) compte.` : `Le reste par ${d} est le même que celui de la somme des chiffres.`, d === 2 || d === 5 ? `Divise ${n % 10} par ${d}.` : `Somme des chiffres : ${sd}.`, `Le reste est ${rest}.`),
      solution: d === 2 || d === 5 ? `Le dernier chiffre est ${n % 10} : le reste par ${d} est ${n % d}.` : `La somme des chiffres vaut ${sd} ; ${sd} a pour reste ${sd % d} dans la division par ${d} : le reste est ${n % d}.`,
    };
  }, [{ id: "critere", label: "Critères de divisibilité" }]),
  mk("premier-reconnaitre", "Nombres premiers", 2, { skill: "Reconnaître un nombre premier", ref: `${BOOK}, chap. 13 §2, ex. 2.a-2.d (p. 166-168) et ex. 14 (p. 171)`, kw: ["nombre premier", "diviseurs", "crible d'Ératosthène", "reconnaître"] }, (_c, r) => {
    const want = int(r, 0, 1) === 0; // vrai : on cherche le premier
    const primes = [53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 223, 227, 229, 233, 239];
    const comps: number[] = [];
    for (let n = 51; n < 260; n++) if (!isPrime(n)) comps.push(n);
    const p = pick(r, primes);
    const others = shuffle(r, comps).slice(0, 3);
    if (want) return {
      statement: "Lequel de ces nombres est un nombre premier ?",
      answer: choice(r, [p, ...others].map(String), 0),
      hints: H("Un nombre premier a exactement deux diviseurs : 1 et lui-même.", "Teste la divisibilité par 2, 3, 5, 7, 11… dans l'ordre.", "Arrête-toi quand le quotient devient plus petit que le diviseur.", `Par exemple, ${others[0]} est divisible par ${factorize(others[0])[0][0]}.`),
      solution: `${p} n'est divisible par aucun nombre premier jusqu'à sa racine : il est premier. ${others.map((o) => `${o} = ${factStr(o)}`).join(" ; ")}.`,
    };
    const odd = shuffle(r, primes).slice(0, 3);
    const comp = pick(r, comps.filter((x) => x % 2 === 1 && x % 5 !== 0));
    return {
      statement: "Lequel de ces nombres n'est PAS un nombre premier ?",
      answer: choice(r, [comp, ...odd].map(String), 0),
      hints: H("On cherche l'intrus, qui a un diviseur autre que 1 et lui-même.", "Teste la divisibilité par 3, 7, 11, 13.", "Les trois autres nombres n'ont pas de diviseur.", `${comp} = ${factStr(comp)}.`),
      solution: `${comp} = ${factStr(comp)} n'est pas premier. ${odd.join(", ")} sont premiers.`,
    };
  }, QCM),
  mk("premier-decomposer", "Nombres premiers", 2, { skill: "Décomposer un nombre en produit de facteurs premiers", ref: `${BOOK}, chap. 13 §3.1, ex. 3.a (p. 168) et ex. 15-16, 22 (p. 171)`, kw: ["décomposition", "facteurs premiers", "produit de facteurs premiers"] }, (_c, r) => {
    const n = pick(r, [24, 36, 40, 45, 48, 50, 54, 60, 72, 75, 84, 90, 96, 100, 105, 108, 120, 126, 135, 140, 150, 180, 196, 200, 210, 225, 252, 270, 300, 360]);
    const fs = factorize(n);
    const q = int(r, 0, 2);
    if (q === 0) return {
      statement: `Combien de facteurs premiers différents intervient dans la décomposition de ${n} ?`,
      answer: num(fs.length),
      hints: H("Décompose d'abord " + n + " en produit de facteurs premiers.", `Divise ${n} par 2 tant que c'est possible, puis par 3, 5, 7…`, "Compte les nombres premiers différents (sans répéter).", `${n} = ${factStr(n)}.`),
      solution: `${n} = ${factStr(n)} : ${fs.length} facteur${fs.length > 1 ? "s" : ""} premier${fs.length > 1 ? "s" : ""} différent${fs.length > 1 ? "s" : ""} (${fs.map((x) => x[0]).join(", ")}).`,
    };
    if (q === 1) return {
      statement: `Quel est le plus grand facteur premier de ${n} ?`,
      answer: num(fs[fs.length - 1][0]),
      hints: H("Décompose " + n + " en facteurs premiers.", "Un facteur premier est un nombre premier qui divise " + n + ".", "Prends le plus grand.", `${n} = ${factStr(n)}.`),
      solution: `${n} = ${factStr(n)} : le plus grand facteur premier est ${fs[fs.length - 1][0]}.`,
    };
    const tot = fs.reduce((s, [, k]) => s + k, 0);
    return {
      statement: `Dans la décomposition de ${n} en produit de facteurs premiers, combien de facteurs y a-t-il au total (en comptant les répétitions) ?`,
      answer: num(tot),
      hints: H("Écris " + n + " comme un produit de nombres premiers, sans exposants.", `Par exemple 12 = 2 × 2 × 3 : 3 facteurs.`, "Compte chaque facteur autant de fois qu'il apparaît.", `${n} = ${factStr(n)}.`),
      solution: `${n} = ${factStr(n)} : ${fs.map(([p, k]) => Array(k).fill(p).join(" × ")).join(" × ")}, soit ${tot} facteurs.`,
    };
  }, FR),
  mk("premier-ppcm", "Nombres premiers", 3, { skill: "PPCM de deux nombres", ref: `${BOOK}, chap. 13 §3.2, ex. 3.b (p. 169) et ex. 18-20 (p. 171)`, kw: ["ppcm", "plus petit commun multiple", "décomposition"] }, (c, r) => {
    const [a, b] = pick(r, [[15, 20], [6, 9], [36, 42], [25, 40], [48, 18], [21, 10], [12, 18], [14, 35], [16, 24], [30, 45], [28, 42], [24, 36], [8, 12], [9, 15], [18, 30], [40, 60], [27, 36]]);
    const l = lcm(a, b);
    return {
      statement: c === "pur" ? `Calcule le PPCM de ${a} et ${b}.` : `Deux feux clignotent : l'un toutes les ${a} secondes, l'autre toutes les ${b} secondes. Ils s'allument ensemble à l'instant 0. Dans combien de secondes s'allumeront-ils ensemble pour la première fois (instant non nul) ?`,
      answer: num(l),
      hints: H("On cherche le plus petit multiple commun non nul.", `Décompose : ${a} = ${factStr(a)} et ${b} = ${factStr(b)}.`, "Prends chaque facteur premier avec son plus grand exposant.", `Le PPCM est un multiple de ${a} et de ${b}.`),
      solution: `${a} = ${factStr(a)} ; ${b} = ${factStr(b)}. PPCM = ${factStr(l)} = ${l}.`,
    };
  }),

  // ===== Chapitres 10 à 11 et 16 : Nombres décimaux relatifs =====
  mk("rel-vocabulaire", "Nombres décimaux relatifs", 1, { skill: "Positif, négatif, entier, décimal : classer un nombre relatif", ref: `${BOOK}, chap. 10 §1.2, ex. 1.c-1.d (p. 133-134) et ex. 1-3 (p. 140)`, kw: ["positif", "négatif", "ℕ", "ℤ", "D", "entier relatif", "décimal relatif"] }, (_c, r) => {
    const cases = [
      { v: "+7,2", best: "décimal relatif positif non entier" }, { v: "−4,75", best: "décimal relatif négatif non entier" }, { v: "−343", best: "entier relatif négatif" }, { v: "+18", best: "entier naturel (positif)" }, { v: "0", best: "nombre à la fois positif et négatif" },
      { v: "−0,01", best: "décimal relatif négatif non entier" }, { v: "+103", best: "entier naturel (positif)" }, { v: "−12", best: "entier relatif négatif" }, { v: "+0,007", best: "décimal relatif positif non entier" }, { v: "−9,761", best: "décimal relatif négatif non entier" },
    ];
    const it = pick(r, cases);
    const opts = ["entier naturel (positif)", "entier relatif négatif", "décimal relatif positif non entier", "décimal relatif négatif non entier"];
    const o = it.v === "0" ? ["nombre à la fois positif et négatif", ...opts.slice(0, 3)] : opts;
    return {
      statement: `Quelle est la meilleure description du nombre ${it.v} ?`,
      answer: choice(r, o, o.indexOf(it.best)),
      hints: H("On classe le nombre.", "Regarde son signe, puis s'il a une virgule avec des chiffres non nuls.", "0 est le seul nombre à la fois positif et négatif.", "ℕ ⊂ ℤ ⊂ D."),
      solution: `${it.v} est un ${it.best}.`,
    };
  }, QCM),
  mk("rel-distance-zero", "Nombres décimaux relatifs", 1, { skill: "Distance à zéro et opposé", ref: `${BOOK}, chap. 10 §3.1, p. 137 et ex. 2, 4 (p. 140)`, kw: ["distance à zéro", "opposé", "valeur absolue", "droite graduée"] }, (_c, r) => {
    const x = (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 60, int(r, 0, 2));
    if (int(r, 0, 1) === 0) return {
      statement: `Quelle est la distance à zéro du nombre ${sgn(x)} ?`,
      answer: num(Math.abs(x), 0.0001),
      hints: H("La distance à zéro est la distance du point d'abscisse " + sgn(x) + " à l'origine.", "Elle est toujours positive.", "Enlève le signe.", `Les nombres ${sgn(x)} et ${sgn(-x)} ont la même distance à zéro.`),
      solution: `La distance à zéro de ${sgn(x)} est ${fr(Math.abs(x))}.`,
    };
    return {
      statement: `Quel est l'opposé de ${sgn(x)} ?`,
      answer: num(round(-x, 6), 0.0001),
      hints: H("Deux nombres opposés sont symétriques par rapport à l'origine.", "Ils ont la même distance à zéro.", "Change le signe.", `L'opposé de ${sgn(x)} est ${sgn(-x)}.`),
      solution: `L'opposé de ${sgn(x)} est ${sgn(-x)}.`,
    };
  }, [{ id: "distance", label: "Distance à zéro, opposé" }]),
  mk("rel-comparer", "Nombres décimaux relatifs", 2, { skill: "Comparer deux nombres décimaux relatifs", ref: `${BOOK}, chap. 10 §3.2, ex. 3.a (p. 138-139) et ex. 10, 13 (p. 141)`, kw: ["comparer", "inégalité", "négatifs", "signes contraires", "plus petit"] }, (_c, r) => {
    const kind = int(r, 0, 2);
    let a = 0, b = 0;
    do {
      if (kind === 0) { a = -dec(r, 1, 9, 2); b = -dec(r, 1, 9, 2); }
      else if (kind === 1) { a = dec(r, 1, 9, 1); b = -dec(r, 1, 9, 1); }
      else { a = dec(r, 1, 9, 2); b = dec(r, 1, 9, 2); }
    } while (Math.abs(a - b) < 0.005);
    const sym = a < b ? "<" : ">";
    const opts = ["<", ">"].map((s) => `${num2(a)} ${s} ${num2(b)}`);
    return {
      statement: `Compare ${sgn(a)} et ${sgn(b)}. Quelle écriture est correcte ?`,
      answer: choice(r, opts, sym === "<" ? 0 : 1),
      hints: H("On compare deux relatifs.", kind === 0 ? "Deux négatifs : le plus petit est celui qui a la plus grande distance à zéro." : kind === 1 ? "Signes contraires : le plus petit est le négatif." : "Deux positifs : compare comme avec des décimaux.", "Aide-toi d'une droite graduée.", `Distances à zéro : ${fr(Math.abs(a))} et ${fr(Math.abs(b))}.`),
      solution: `${num2(a)} ${sym} ${num2(b)}.`,
    };
  }, QCM),
  mk("rel-ranger", "Nombres décimaux relatifs", 2, { skill: "Ranger des nombres décimaux relatifs", ref: `${BOOK}, chap. 10 §3.2, ex. 3.b-3.c (p. 139) et ex. 14-15 (p. 141)`, kw: ["ranger", "ordre croissant", "ordre décroissant", "relatifs"] }, (_c, r) => {
    let v: number[] = [];
    do { v = Array.from({ length: 4 }, () => (int(r, 0, 2) === 0 ? 1 : -1) * dec(r, 0, 9, 1)); } while (new Set(v).size < 4);
    const big = int(r, 0, 1) === 1;
    const t = big ? Math.max(...v) : Math.min(...v);
    return {
      statement: `Parmi ces nombres, lequel est le plus ${big ? "grand" : "petit"} : ${v.map((x) => sgn(x)).join(" ; ")} ?`,
      answer: choice(r, v.map((x) => num2(x)), v.indexOf(t)),
      hints: H("On compare quatre relatifs.", "Trie les négatifs et les positifs.", "Un négatif est plus petit qu'un positif ; entre deux négatifs, le plus petit est celui qui est le plus loin de zéro.", "Place-les sur une droite graduée."),
      solution: `Le plus ${big ? "grand" : "petit"} est ${num2(t)}.`,
    };
  }, QCM),
  mk("rel-somme-dec", "Nombres décimaux relatifs", 2, { skill: "Somme de deux nombres décimaux relatifs", ref: `${BOOK}, chap. 11 §1.1, règles p. 144-145, ex. 1.a-1.c et ex. 1-3, 6 (p. 145, 150)`, kw: ["somme", "addition", "signes contraires", "même signe", "décimaux relatifs"] }, (c, r) => {
    let a = 0, b = 0;
    do { a = (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 20, 1); b = (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 20, 1); } while (a === 0 || b === 0);
    const s = round(a + b, 4);
    return {
      statement: c === "pur" ? `Calcule ${sgn(a)} + ${sgn(b)}.` : `Un plongeur est à l'altitude ${num2(a)} m (par rapport à la surface de l'eau). Son altitude varie ensuite de ${num2(b)} m. Quelle est sa nouvelle altitude (en m) ?`,
      answer: num(s, 0.0001),
      hints: H("On additionne deux relatifs.", a * b > 0 ? "Même signe : on garde le signe et on additionne les distances à zéro." : "Signes contraires : on garde le signe de celui qui a la plus grande distance à zéro et on soustrait les distances.", `Distances à zéro : ${fr(Math.abs(a))} et ${fr(Math.abs(b))}.`, a * b > 0 ? `${fr(Math.abs(a))} + ${fr(Math.abs(b))} = ${fr(round(Math.abs(a) + Math.abs(b), 4))}.` : `${fr(Math.max(Math.abs(a), Math.abs(b)))} − ${fr(Math.min(Math.abs(a), Math.abs(b)))}.`),
      solution: `${sgn(a)} + ${sgn(b)} = ${sgn(s)}.`,
    };
  }),
  mk("rel-difference", "Nombres décimaux relatifs", 2, { skill: "Différence de deux nombres décimaux relatifs", ref: `${BOOK}, chap. 11 §2, ex. 2.a-2.c (p. 146-147) et ex. 4-7 (p. 150)`, kw: ["différence", "soustraction", "opposé", "a − b = a + opp b"] }, (_c, r) => {
    const a = (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 20, 1), b = (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 20, 1);
    const d = round(a - b, 4);
    return {
      statement: `Calcule ${sgn(a)} − ${sgn(b)}.`,
      answer: num(d, 0.0001),
      hints: H("On soustrait un relatif.", "La différence de a et b est la somme de a et de l'opposé de b : a − b = a + opp b.", `L'opposé de ${sgn(b)} est ${sgn(-b)}.`, `Calcule ${sgn(a)} + ${sgn(-b)}.`),
      solution: `${sgn(a)} − ${sgn(b)} = ${sgn(a)} + ${sgn(-b)} = ${sgn(d)}.`,
    };
  }, FR),
  mk("rel-somme-alg", "Nombres décimaux relatifs", 3, { skill: "Somme algébrique : écriture simplifiée et calcul", ref: `${BOOK}, chap. 11 §3, ex. 3.a-3.b (p. 147-148) et ex. 8-10 (p. 150-151)`, kw: ["somme algébrique", "écriture simplifiée", "calcul", "relatifs"] }, (_c, r) => {
    const v = Array.from({ length: 4 }, () => (int(r, 0, 1) === 0 ? -1 : 1) * int(r, 1, 30));
    const ops = [1, -1, 1].map(() => (int(r, 0, 1) === 0 ? 1 : -1));
    let total = v[0];
    let txt = `(${v[0] < 0 ? "−" : "+"}${Math.abs(v[0])})`;
    for (let i = 1; i < 4; i++) { total += ops[i - 1] * v[i]; txt += ` ${ops[i - 1] === 1 ? "+" : "−"} (${v[i] < 0 ? "−" : "+"}${Math.abs(v[i])})`; }
    return {
      statement: `Calcule la somme algébrique : ${txt}.`,
      answer: num(total),
      hints: H("Une soustraction se transforme en addition de l'opposé.", "Écris chaque terme avec son signe, puis calcule de gauche à droite.", "Tu peux regrouper les positifs d'un côté et les négatifs de l'autre.", `Premier terme : ${v[0]}.`),
      solution: `${txt} = ${num2(total)}.`,
    };
  }, FR),
  mk("rel-equation", "Nombres décimaux relatifs", 2, { skill: "Résoudre l'équation x + b = a", ref: `${BOOK}, chap. 11 §4, ex. 4.a-4.b (p. 149) et ex. 12-14 (p. 151)`, kw: ["équation", "inconnue", "solution", "x + b = a"] }, (c, r) => {
    const a = (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 30, 1), b = (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 30, 1);
    const x = round(a - b, 4);
    return {
      statement: c === "pur" ? `Résous l'équation x + ${sgn(b)} = ${sgn(a)}.` : `Un thermomètre indique ${num2(a)} °C après avoir varié de ${num2(b)} °C. Quelle température (en °C) indiquait-il au départ ?`,
      answer: num(x, 0.0001),
      hints: H("On cherche l'inconnue x.", "La solution de x + b = a est a − b.", `Calcule ${sgn(a)} − ${sgn(b)}.`, `${sgn(a)} + ${sgn(-b)}.`),
      solution: `x = ${sgn(a)} − ${sgn(b)} = ${sgn(x)}.`,
    };
  }),
  mk("rel-produit", "Nombres décimaux relatifs", 2, { skill: "Produit de deux nombres décimaux relatifs", ref: `${BOOK}, chap. 16 §1, règles p. 200 et ex. 1.a-1.e (p. 200-201)`, kw: ["produit", "multiplication", "règle des signes", "relatifs"] }, (_c, r) => {
    const a = (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 12, int(r, 0, 1)), b = (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 12, int(r, 0, 1));
    const p = round(a * b, 4);
    const t = int(r, 0, 1);
    if (t === 0) return {
      statement: `Calcule ${sgn(a)} × ${sgn(b)}.`,
      answer: num(p, 0.0001),
      hints: H("On multiplie deux relatifs.", "Même signe : le produit est positif. Signes contraires : il est négatif.", "On multiplie les distances à zéro.", `${fr(Math.abs(a))} × ${fr(Math.abs(b))} = ${fr(round(Math.abs(a) * Math.abs(b), 4))}.`),
      solution: `${sgn(a)} × ${sgn(b)} = ${sgn(p)}.`,
    };
    return {
      statement: `Quel est le signe du produit ${sgn(a)} × ${sgn(b)} ?`,
      answer: choice(r, ["positif", "négatif"], p > 0 ? 0 : 1),
      hints: H("Le signe d'un produit dépend du signe des facteurs.", "Même signe : positif. Signes contraires : négatif.", `Signe de ${sgn(a)} : ${a < 0 ? "négatif" : "positif"} ; de ${sgn(b)} : ${b < 0 ? "négatif" : "positif"}.`, "Applique la règle."),
      solution: `${a < 0 ? "−" : "+"} et ${b < 0 ? "−" : "+"} : le produit est ${p > 0 ? "positif" : "négatif"}.`,
    };
  }, [{ id: "calcul", label: "Calcul" }]),
  mk("rel-produit-inconnu", "Nombres décimaux relatifs", 3, { skill: "Trouver le facteur manquant d'un produit", ref: `${BOOK}, chap. 16 §1, activité et ex. 1.e (p. 200-201)`, kw: ["facteur manquant", "produit", "relatif", "équation"] }, (_c, r) => {
    const a = (int(r, 0, 1) === 0 ? -1 : 1) * int(r, 2, 9), x = (int(r, 0, 1) === 0 ? -1 : 1) * int(r, 2, 12);
    return {
      statement: `Trouve le nombre relatif x tel que ${sgn(a)} × x = ${sgn(a * x)}.`,
      answer: num(x),
      hints: H("On cherche un facteur manquant.", "Divise le produit par l'autre facteur.", "Applique la règle des signes pour le quotient.", `${fr(Math.abs(a * x))} ÷ ${fr(Math.abs(a))} = ${Math.abs(x)}.`),
      solution: `x = ${sgn(a * x)} ÷ ${sgn(a)} = ${sgn(x)}.`,
    };
  }, FR),
  mk("rel-intercaler", "Nombres décimaux relatifs", 3, { skill: "Compter les entiers ou décimaux relatifs entre deux nombres", ref: `${BOOK}, chap. 10, ex. 12, 17-19 (p. 141)`, kw: ["intercaler", "entre", "combien", "entiers relatifs", "chiffre après la virgule"] }, (_c, r) => {
    const lo = -int(r, 3, 15) - int(r, 0, 9) / 10, hi = int(r, 1, 20) + int(r, 1, 9) / 10;
    const k = int(r, 0, 1);
    const a = round(lo, 1), b = round(hi, 1);
    if (k === 0) {
      const n = Math.floor(b) - Math.ceil(a) + 1;
      return {
        statement: `Combien y a-t-il de nombres entiers relatifs compris entre ${num2(a)} et ${num2(b)} ?`,
        answer: num(n),
        hints: H("On compte les entiers entre les deux nombres.", `Le plus petit entier est ${Math.ceil(a)}, le plus grand ${Math.floor(b)}.`, "Compte-les, 0 compris.", `${Math.floor(b)} − (${Math.ceil(a)}) + 1.`),
        solution: `Entiers de ${num2(Math.ceil(a))} à ${num2(Math.floor(b))} : ${num2(Math.floor(b))} − ${sgn(Math.ceil(a))} + 1 = ${n}.`,
      };
    }
    const a2 = -int(r, 2, 9), b2 = a2 + 1;
    return {
      statement: `Combien y a-t-il de nombres décimaux relatifs ayant un chiffre après la virgule, strictement compris entre ${sgn(a2)} et ${sgn(b2)} ?`,
      answer: num(9),
      hints: H("Entre deux entiers consécutifs, on avance de 0,1 en 0,1.", `De ${num2(a2)} à ${num2(b2)} il y a 10 pas de 0,1.`, "Les deux extrémités ne comptent pas.", "10 − 1."),
      solution: `Il y a 10 pas de 0,1 entre ${num2(a2)} et ${num2(b2)} : 10 − 1 = 9 nombres strictement compris entre les deux.`,
    };
  }, [{ id: "denombrement", label: "Dénombrement" }]),

  // ===== Chapitre 14 : Fractions =====
  mk("frac-irred-pgcd", "Fractions", 2, { skill: "Rendre une fraction irréductible (PGCD)", ref: `${BOOK}, chap. 14 §1, ex. 1.a-1.e (p. 174-176) et ex. 1-6 (p. 185)`, kw: ["fraction irréductible", "simplifier", "pgcd", "diviseur commun"] }, (_c, r) => {
    let p = 0, q = 0;
    do { p = int(r, 1, 17); q = int(r, 2, 19); } while (p === q || gcd(p, q) !== 1);
    const k = int(r, 3, 15);
    const good = fracS(p, q);
    const wrong = withWrong(good, [fracS(p * 2, q * 2), fracS(p, q + 1), fracS(p + 1, q), fracS(p * k, q), fracS(p, q * k), fracS(p * 3, q * 3)]);
    const ask = int(r, 0, 1);
    if (ask === 0) return {
      statement: `Rends irréductible la fraction ${p * k}/${q * k}.`,
      answer: choice(r, [good, ...wrong], 0),
      hints: H("On divise numérateur et dénominateur par leur PGCD.", `Cherche un diviseur commun à ${p * k} et ${q * k}.`, "Continue jusqu'à ce que le seul diviseur commun soit 1.", `Le PGCD de ${p * k} et ${q * k} est ${k}.`),
      solution: `PGCD(${p * k} ; ${q * k}) = ${k}, donc ${p * k}/${q * k} = ${good}, fraction irréductible.`,
    };
    return {
      statement: `Quel est le PGCD de ${p * k} et ${q * k} ?`,
      answer: num(k),
      hints: H("Le PGCD est le plus grand diviseur commun.", `${p * k} = ${k} × ${p} et ${q * k} = ${k} × ${q}.`, `${p} et ${q} n'ont aucun diviseur commun autre que 1.`, "Le PGCD est le facteur commun."),
      solution: `${p * k} = ${k} × ${p} et ${q * k} = ${k} × ${q} avec ${p} et ${q} sans diviseur commun : PGCD = ${k}.`,
    };
  }, QCM),
  mk("frac-somme", "Fractions", 2, { skill: "Additionner ou soustraire deux fractions (dénominateurs différents)", ref: `${BOOK}, chap. 14 §2, ex. 2.a-2.e (p. 176-177) et ex. 7-11 (p. 185)`, kw: ["somme de fractions", "différence de fractions", "même dénominateur", "ppcm", "réduire"] }, (_c, r) => {
    const [d1, d2] = pick(r, [[2, 3], [3, 4], [4, 6], [6, 9], [5, 10], [4, 5], [6, 8], [3, 5], [10, 15], [8, 12]]);
    const a = int(r, 1, d1 - 1), b = int(r, 1, d2 - 1);
    const L = lcm(d1, d2), A = a * (L / d1), B = b * (L / d2);
    const add = int(r, 0, 1) === 0 || A <= B;
    const [n, d] = reduce(add ? A + B : A - B, L);
    const good = d === 1 ? String(n) : fracS(n, d);
    const wrong = withWrong(good, [fracS(a + b, d1 + d2), fracS(add ? a + b : Math.abs(a - b), L), fracS(n + 1, d), fracS(n, d + 1), fracS(a * b, d1 * d2), fracS(n, d * 2)]).filter((w) => !w.startsWith("0/"));
    return {
      statement: `Calcule ${fracS(a, d1)} ${add ? "+" : "−"} ${fracS(b, d2)} et donne le résultat sous forme de fraction irréductible.`,
      answer: choice(r, [good, ...wrong], 0),
      hints: H("Les dénominateurs sont différents.", `Réduis au même dénominateur : le PPCM de ${d1} et ${d2} est ${L}.`, `${fracS(a, d1)} = ${fracS(A, L)} et ${fracS(b, d2)} = ${fracS(B, L)}.`, `Calcule ${A} ${add ? "+" : "−"} ${B} sur ${L}, puis simplifie.`),
      solution: `${fracS(a, d1)} ${add ? "+" : "−"} ${fracS(b, d2)} = ${fracS(A, L)} ${add ? "+" : "−"} ${fracS(B, L)} = ${fracS(add ? A + B : A - B, L)}${fracS(add ? A + B : A - B, L) === good ? "" : ` = ${good}`}.`,
    };
  }, QCM),
  mk("frac-comparer", "Fractions", 2, { skill: "Comparer deux fractions", ref: `${BOOK}, chap. 14 §3.1, ex. 3.a-3.c (p. 178-179) et ex. 12-13 (p. 185)`, kw: ["comparer", "fractions", "même dénominateur", "même numérateur", "inégalité"] }, (_c, r) => {
    const [d1, d2] = pick(r, [[3, 4], [5, 6], [4, 5], [7, 8], [6, 9], [8, 12], [10, 15], [9, 12], [5, 8], [7, 10]]);
    const a = int(r, 1, d1 - 1), b = int(r, 1, d2 - 1);
    if (a * d2 === b * d1) return { statement: `Compare ${fracS(1, 2)} et ${fracS(2, 3)}.`, answer: choice(r, ["1/2 < 2/3", "1/2 > 2/3", "1/2 = 2/3"], 0), hints: H("Réduis au même dénominateur.", "6 est un dénominateur commun.", "3/6 et 4/6.", "3 < 4."), solution: "1/2 = 3/6 et 2/3 = 4/6 : 1/2 < 2/3." };
    const rel = a * d2 < b * d1 ? "<" : ">";
    return {
      statement: `Compare ${fracS(a, d1)} et ${fracS(b, d2)}. Quelle écriture est correcte ?`,
      answer: choice(r, ["<", ">"].map((s) => `${fracS(a, d1)} ${s} ${fracS(b, d2)}`), rel === "<" ? 0 : 1),
      hints: H("On compare deux fractions.", "Réduis-les au même dénominateur : on compare alors les numérateurs.", `${d1} × ${d2} = ${d1 * d2} est un dénominateur commun.`, `${a} × ${d2} = ${a * d2} et ${b} × ${d1} = ${b * d1}.`),
      solution: `${fracS(a, d1)} = ${fracS(a * d2, d1 * d2)} et ${fracS(b, d2)} = ${fracS(b * d1, d1 * d2)} : ${fracS(a, d1)} ${rel} ${fracS(b, d2)}.`,
    };
  }, QCM),
  mk("frac-partie-entiere", "Fractions", 2, { skill: "Partie entière d'une fraction et écriture q + r/b", ref: `${BOOK}, chap. 14 §3.3, ex. 3.f-3.g (p. 180) et ex. 15-16 (p. 185)`, kw: ["partie entière", "q + r/b", "quotient", "reste", "fraction"] }, (c, r) => {
    const b = int(r, 3, 15), q = int(r, 1, 12), rr = int(r, 1, b - 1), a = b * q + rr;
    void c;
    if (int(r, 0, 1) === 0) return {
      statement: `Quelle est la partie entière de la fraction ${fracS(a, b)} ?`,
      answer: num(q),
      hints: H("La partie entière est le plus grand entier contenu dans la fraction.", `Fais la division de ${a} par ${b}.`, "La partie entière est le quotient.", `${a} = ${b} × ${q} + ${rr}.`),
      solution: `${a} = ${b} × ${q} + ${rr}, donc ${fracS(a, b)} = ${q} + ${fracS(rr, b)} : partie entière ${q}.`,
    };
    return {
      statement: `On écrit ${fracS(a, b)} = q + r/${b} avec r < ${b}. Quelle est la valeur de r ?`,
      answer: num(rr),
      hints: H("On écrit la fraction avec sa partie entière.", `Fais la division de ${a} par ${b}.`, "r est le reste.", `${a} = ${b} × ${q} + ${rr}.`),
      solution: `${a} = ${b} × ${q} + ${rr} : q = ${q} et r = ${rr}.`,
    };
  }, [{ id: "partie", label: "Partie entière" }]),
  mk("frac-encadrement", "Fractions", 3, { skill: "Encadrer une fraction par deux décimaux consécutifs", ref: `${BOOK}, chap. 14 §3.4, ex. 3.h-3.i (p. 181-182)`, kw: ["encadrement", "fraction", "décimaux consécutifs", "calculatrice"] }, (_c, r) => {
    const b = pick(r, [3, 6, 7, 9, 11, 13]), a = int(r, 2 * b, 9 * b);
    if (a % b === 0) return { statement: `Quel est le plus petit entier qui encadre ${fracS(a + 1, b)} (parmi deux entiers consécutifs) ?`, answer: num(Math.floor((a + 1) / b)), hints: H("On cherche l'entier en dessous.", `${a + 1} ÷ ${b}.`, "La partie entière est le quotient.", "Le nombre du dessus est celui du dessous plus 1."), solution: `${a + 1} ÷ ${b} = ${fr(round((a + 1) / b, 4))}… : le plus petit entier est ${Math.floor((a + 1) / b)}.` };
    const dg = int(r, 0, 1);
    const lo = Math.floor((a / b) * 10 ** dg) / 10 ** dg;
    return {
      statement: dg === 0 ? `On encadre la fraction ${fracS(a, b)} par deux nombres entiers consécutifs. Quel est le plus petit des deux ?` : `On encadre la fraction ${fracS(a, b)} par deux décimaux consécutifs ayant un chiffre après la virgule. Quel est le plus petit des deux ?`,
      answer: num(round(lo, 1), 0.0001),
      hints: H("On calcule une valeur approchée de la fraction.", `${a} ÷ ${b} = ${fr(round(a / b, 5))}…`, dg === 0 ? "Garde la partie entière." : "Garde le premier chiffre après la virgule, sans arrondir.", "Le nombre du dessus est celui du dessous plus le pas."),
      solution: `${a} ÷ ${b} = ${fr(round(a / b, 5))}… donc ${fr(round(lo, 1))} < ${fracS(a, b)} < ${fr(round(lo + (dg === 0 ? 1 : 0.1), 1))} : le plus petit est ${fr(round(lo, 1))}.`,
    };
  }, [{ id: "encadrement", label: "Encadrement" }]),
  mk("frac-produit", "Fractions", 2, { skill: "Produit de deux fractions", ref: `${BOOK}, chap. 14 §4, ex. 4.a-4.c (p. 182-183) et ex. 17-20 (p. 186)`, kw: ["produit de fractions", "multiplier", "numérateur", "dénominateur"] }, (c, r) => {
    const a = int(r, 1, 7), b = int(r, 2, 9), d = int(r, 1, 7), e = int(r, 2, 9);
    const [n, m] = reduce(a * d, b * e);
    const good = m === 1 ? String(n) : fracS(n, m);
    const wrong = withWrong(good, [fracS(a + d, b + e), fracS(a * e, b * d), fracS(n, m + 1), fracS(n + 1, m), fracS(a * d, b + e), fracS(a * d + 1, b * e)]);
    return {
      statement: c === "pur" ? `Calcule ${fracS(a, b)} × ${fracS(d, e)} et donne le résultat sous forme irréductible.` : `Un devoir dure les ${fracS(a, b)} d'une heure. Après les ${fracS(d, e)} de ce temps, une élève regarde sa montre. Quelle fraction d'heure s'est écoulée (forme irréductible) ?`,
      answer: choice(r, [good, ...wrong], 0),
      hints: H("On multiplie deux fractions.", "(a/b) × (c/d) = (a × c)/(b × d).", `Numérateurs : ${a} × ${d} = ${a * d} ; dénominateurs : ${b} × ${e} = ${b * e}.`, "Simplifie la fraction obtenue."),
      solution: `${fracS(a, b)} × ${fracS(d, e)} = ${fracS(a * d, b * e)}${fracS(a * d, b * e) === good ? "" : ` = ${good}`}.`,
    };
  }, [{ id: "pur", label: "Calcul direct" }, { id: "situation", label: "En situation" }]),
  mk("frac-puissance", "Fractions", 3, { skill: "Puissance d'une fraction", ref: `${BOOK}, chap. 14 §4.3, ex. 4.d-4.e (p. 183-184)`, kw: ["puissance", "fraction", "(a/b)^n", "exposant"] }, (_c, r) => {
    let a = 1, b = 2; do { a = int(r, 1, 5); b = int(r, a + 1, 7); } while (gcd(a, b) !== 1);
    const n = int(r, 2, 3);
    const good = fracS(a ** n, b ** n);
    return {
      statement: `Calcule (${fracS(a, b)})${sup(n)}.`,
      answer: choice(r, [good, ...withWrong(good, [fracS(a * n, b * n), fracS(a ** n, b), fracS(a, b ** n), fracS(a * n, b)])], 0),
      hints: H("On élève une fraction à une puissance.", `(a/b)ⁿ est le produit de ${n} facteurs égaux à a/b.`, "On élève le numérateur et le dénominateur à la puissance n.", `${a}${sup(n)} = ${a ** n} et ${b}${sup(n)} = ${b ** n}.`),
      solution: `(${fracS(a, b)})${sup(n)} = ${fracS(a ** n, b ** n)}.`,
    };
  }, QCM),

  // ===== Chapitre 15 : Proportionnalité =====
  mk("prop-vitesse", "Proportionnalité", 2, { skill: "Vitesse moyenne, distance, durée", ref: `${BOOK}, chap. 15 §1.1, ex. 1.a-1.c (p. 190) et ex. 3-7 (p. 196)`, kw: ["vitesse moyenne", "distance", "durée", "km/h"] }, (c, r) => {
    const v = pick(r, [30, 40, 45, 50, 60, 75, 80, 90, 100, 120]), t = pick(r, [1.5, 2, 2.5, 3, 4, 0.5, 3.5]);
    const d = v * t;
    const k = int(r, 0, 2);
    void c;
    if (k === 0) return { statement: `Un véhicule parcourt ${f(d)} km en ${fr(t)} h à vitesse constante. Quelle est sa vitesse moyenne (en km/h) ?`, answer: num(v), hints: H("La vitesse moyenne est le quotient de la distance par la durée.", "Tableau de proportionnalité durée → distance.", `Vitesse = ${f(d)} ÷ ${fr(t)}.`, "Unité : km/h."), solution: `${f(d)} ÷ ${fr(t)} = ${v} km/h.` };
    if (k === 1) return { statement: `Un cyclo roule à ${v} km/h pendant ${fr(t)} h. Quelle distance (en km) parcourt-il ?`, answer: num(d), hints: H("Distance = vitesse × durée.", "La distance est proportionnelle à la durée.", `Le coefficient est ${v} km/h.`, `${v} × ${fr(t)}.`), solution: `${v} × ${fr(t)} = ${f(d)} km.` };
    return { statement: `Un train roule à ${v} km/h. Combien de temps (en heures) lui faut-il pour parcourir ${f(d)} km ?`, answer: num(t), hints: H("Durée = distance ÷ vitesse.", "On cherche combien de fois " + v + " km tient dans " + f(d) + " km.", `${f(d)} ÷ ${v}.`, "Le résultat est en heures."), solution: `${f(d)} ÷ ${v} = ${fr(t)} h.` };
  }, [{ id: "vitesse", label: "Vitesse" }]),
  mk("prop-debit", "Proportionnalité", 2, { skill: "Débit moyen", ref: `${BOOK}, chap. 15 §1.2, ex. 1.d-1.f (p. 191) et ex. 8-12 (p. 196)`, kw: ["débit", "volume", "durée", "litres", "m³"] }, (_c, r) => {
    const q = pick(r, [2, 3, 4, 5, 6, 8, 10, 12, 15]), t = pick(r, [10, 20, 30, 40, 50, 60]);
    const V = q * t;
    const k = int(r, 0, 2);
    if (k === 0) return { statement: `Un robinet remplit un seau de ${V} litres en ${t} secondes. Quel est son débit moyen (en l/s) ?`, answer: num(q), hints: H("Le débit moyen est le quotient du volume par la durée.", "Tableau de proportionnalité durée → volume.", `Débit = ${V} ÷ ${t}.`, "Unité : litres par seconde."), solution: `${V} ÷ ${t} = ${q} l/s.` };
    if (k === 1) return { statement: `Une pompe a un débit de ${q} litres par seconde. Quel volume (en litres) débite-t-elle en ${t} secondes ?`, answer: num(V), hints: H("Volume = débit × durée.", "Le volume est proportionnel à la durée.", `Le coefficient est ${q} l/s.`, `${q} × ${t}.`), solution: `${q} × ${t} = ${V} litres.` };
    return { statement: `Un réservoir contient ${V} litres. Une pompe de débit ${q} l/s le vide. Combien de temps (en secondes) faut-il ?`, answer: num(t), hints: H("Durée = volume ÷ débit.", `Combien de fois ${q} litres dans ${V} litres ?`, `${V} ÷ ${q}.`, "Le résultat est en secondes."), solution: `${V} ÷ ${q} = ${t} s.` };
  }, [{ id: "debit", label: "Débit" }]),
  mk("prop-masse-vol", "Proportionnalité", 2, { skill: "Masse volumique", ref: `${BOOK}, chap. 15 §1.3, ex. 1.g-1.i (p. 191) et ex. 13-16 (p. 196-197)`, kw: ["masse volumique", "masse", "volume", "kg/dm³", "g/cm³"] }, (_c, r) => {
    const rho = pick(r, [0.8, 1.5, 2.5, 2.7, 7.8, 8.9, 11.3, 13.6]), V = pick(r, [2, 3, 4, 5, 8, 10, 20, 25]);
    const m = round(rho * V, 3);
    const k = int(r, 0, 2);
    if (k === 0) return { statement: `Un objet de ${fr(V)} dm³ a une masse de ${fr(m)} kg. Quelle est sa masse volumique (en kg/dm³) ?`, answer: num(rho, 0.0001), hints: H("La masse volumique est le quotient de la masse par le volume.", "Tableau de proportionnalité volume → masse.", `${fr(m)} ÷ ${fr(V)}.`, "Unité : kg/dm³."), solution: `${fr(m)} ÷ ${fr(V)} = ${fr(rho)} kg/dm³.` };
    if (k === 1) return { statement: `Un métal a une masse volumique de ${fr(rho)} kg/dm³. Quelle est la masse (en kg) de ${fr(V)} dm³ de ce métal ?`, answer: num(m, 0.001), hints: H("Masse = masse volumique × volume.", "La masse est proportionnelle au volume.", `${fr(rho)} × ${fr(V)}.`, "Unité : kg."), solution: `${fr(rho)} × ${fr(V)} = ${fr(m)} kg.` };
    return { statement: `Un métal a une masse volumique de ${fr(rho)} kg/dm³. Quel est le volume (en dm³) d'un morceau de ${fr(m)} kg ?`, answer: num(V, 0.001), hints: H("Volume = masse ÷ masse volumique.", `Combien de fois ${fr(rho)} kg dans ${fr(m)} kg ?`, `${fr(m)} ÷ ${fr(rho)}.`, "Unité : dm³."), solution: `${fr(m)} ÷ ${fr(rho)} = ${fr(V)} dm³.` };
  }, [{ id: "masse-vol", label: "Masse volumique" }]),
  mk("prop-echelle", "Proportionnalité", 3, { skill: "Échelle d'un plan ou d'une carte", ref: `${BOOK}, chap. 15 §1.4, ex. 1.j-1.l (p. 192) et ex. 17-21 (p. 196)`, kw: ["échelle", "plan", "carte", "distance réelle", "1/50 000"] }, (_c, r) => {
    const E = pick(r, [50, 100, 200, 500, 2500, 50000, 200000, 250000]);
    const k = int(r, 0, 2);
    if (k === 0) { const cm = pick(r, [2, 3, 4, 5, 6, 8, 12]); const real = cm * E; return { statement: `Sur un plan à l'échelle 1/${f(E)}, un segment mesure ${cm} cm. Quelle est sa longueur réelle (en cm) ?`, answer: num(real), hints: H("1 cm sur le plan représente " + f(E) + " cm en réalité.", "Multiplie la mesure sur le plan par l'inverse de l'échelle.", `${cm} × ${f(E)}.`, "Mets la même unité."), solution: `${cm} × ${f(E)} = ${f(real)} cm.` }; }
    if (k === 1) { const cm = pick(r, [2, 3, 4, 5, 6, 8, 12]); return { statement: `Une distance réelle de ${f(cm * E)} cm est dessinée à l'échelle 1/${f(E)}. Quelle longueur (en cm) mesure-t-elle sur le plan ?`, answer: num(cm), hints: H("On passe de la réalité au plan.", `Divise par ${f(E)}.`, `${f(cm * E)} ÷ ${f(E)}.`, "Même unité."), solution: `${f(cm * E)} ÷ ${f(E)} = ${cm} cm.` }; }
    const plan = pick(r, [2, 4, 5, 8]), real = plan * E;
    return { statement: `Sur un plan, ${plan} cm représentent ${f(real)} cm en réalité. Quelle est l'échelle ? Donne le nombre n tel que l'échelle soit 1/n.`, answer: num(E), hints: H("L'échelle est le quotient de la distance sur le plan par la distance réelle.", "On écrit une fraction de numérateur 1.", `${plan} ÷ ${plan} = 1 et ${f(real)} ÷ ${plan}.`, "n est le deuxième nombre."), solution: `${plan}/${f(real)} = 1/${f(E)} : n = ${f(E)}.` };
  }, [{ id: "echelle", label: "Échelle" }]),
  mk("prop-pourcentage", "Proportionnalité", 2, { skill: "Calculer un pourcentage ou une part en pourcentage", ref: `${BOOK}, chap. 15 §1.5, ex. 1.m-1.o (p. 192-193) et ex. 22-25 (p. 196-197)`, kw: ["pourcentage", "bénéfice", "remise", "%", "part"] }, (c, r) => {
    const k = int(r, 0, 2);
    if (k === 0) { const part = pick(r, [10, 15, 20, 24, 30, 36, 42]), tot = pick(r, [20, 25, 40, 50, 60, 100, 200]); const pct = round((part / tot) * 100, 2); if (part >= tot) return { statement: "Calcule 25 % de 80.", answer: num(20), hints: H("25 % = 25/100.", "80 × 25 ÷ 100.", "2000 ÷ 100.", "20."), solution: "80 × 25 ÷ 100 = 20." }; return { statement: c === "pur" ? `${part} est quel pourcentage de ${tot} ?` : `Dans une classe de ${tot} élèves, ${part} sont des filles. Quel est le pourcentage de filles (en %) ?`, answer: num(pct, 0.01), hints: H("Un pourcentage est un quotient multiplié par 100.", `Calcule ${part} ÷ ${tot}.`, "Multiplie par 100.", `${part} × 100 ÷ ${tot}.`), solution: `${part} ÷ ${tot} × 100 = ${fr(pct)} %.` }; }
    if (k === 1) { const p = pick(r, [10, 20, 25, 30, 40]), T = pick(r, [200, 400, 500, 800, 1000]); const v = (T * p) / 100; return { statement: `Calcule ${p} % de ${f(T)}.`, answer: num(v), hints: H("On prend un pourcentage d'une quantité.", `${p} % = ${p}/100.`, `${f(T)} × ${p} ÷ 100.`, "Calcule le produit puis divise."), solution: `${f(T)} × ${p} ÷ 100 = ${f(v)}.` }; }
    const buy = pick(r, [2000, 2500, 4000, 5000, 8000]), pct = pick(r, [10, 20, 25, 30, 50]);
    const sell = buy + (buy * pct) / 100;
    return { statement: `Un commerçant achète un objet ${f(buy)} F et le revend ${f(sell)} F. Quel est son bénéfice en pourcentage du prix d'achat (en %) ?`, answer: num(pct), hints: H("Le bénéfice est la différence entre prix de vente et prix d'achat.", `Bénéfice = ${f(sell)} − ${f(buy)}.`, "Pourcentage = bénéfice ÷ prix d'achat × 100.", `${f(sell - buy)} ÷ ${f(buy)}.`), solution: `Bénéfice : ${f(sell - buy)} F ; ${f(sell - buy)} ÷ ${f(buy)} × 100 = ${pct} %.` };
  }),
  mk("prop-graphique", "Proportionnalité", 2, { skill: "Reconnaître un tableau de proportionnalité (graphique)", ref: `${BOOK}, chap. 15 §2, activités p. 194-195 et ex. 26 (p. 197)`, kw: ["représentation graphique", "droite", "origine", "points alignés", "tableau"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quand un tableau de correspondance est-il un tableau de proportionnalité, d'après sa représentation graphique ?", good: "Quand les points sont alignés sur une droite qui passe par l'origine", bad: ["Quand les points sont alignés sur une droite quelconque", "Quand les points forment une courbe qui monte", "Quand les points sont régulièrement espacés"], why: "Si tous les points représentant les colonnes sont sur une droite passant par l'origine du repère, le tableau est un tableau de proportionnalité." },
      { q: "Les points d'un graphique sont alignés sur une droite qui ne passe pas par l'origine. Que peut-on dire du tableau ?", good: "Ce n'est pas un tableau de proportionnalité", bad: ["C'est un tableau de proportionnalité", "Le coefficient vaut 1", "On ne peut rien dire"], why: "Pour la proportionnalité, la droite doit passer par l'origine du repère." },
      { q: "Dans un repère (O, I, J), le point A a pour abscisse (+2) et pour ordonnée (+3). Comment note-t-on ses coordonnées ?", good: "(+2 ; +3)", bad: ["(+3 ; +2)", "(+2 ; −3)", "(−2 ; +3)"], why: "On écrit toujours l'abscisse d'abord, puis l'ordonnée : (+2 ; +3)." },
      { q: "Un tableau de proportionnalité a pour coefficient 4. Où se trouvent les points qui représentent ses colonnes ?", good: "Sur une droite qui passe par l'origine du repère", bad: ["Sur une droite horizontale", "Sur un cercle de centre O", "Dispersés sans régularité"], why: "Les points d'un tableau de proportionnalité sont alignés avec l'origine." },
      { q: "Un bébé est pesé chaque mois : 2,5 kg à 0 mois, 2,7 kg à 1 mois, 2,9 kg à 2 mois… Ce tableau est-il un tableau de proportionnalité ?", good: "Non, car la masse à 0 mois n'est pas nulle (le graphique ne passe pas par l'origine)", bad: ["Oui, car la masse augmente", "Oui, car les écarts sont réguliers", "On ne peut pas savoir"], why: "À 0 mois la masse est 2,5 kg ≠ 0 : le point de départ n'est pas l'origine, le tableau n'est pas de proportionnalité." },
      { q: "Dans un repère, le point B a pour coordonnées (−3 ; +2). Quelle est son abscisse ?", good: "−3", bad: ["+2", "+3", "−2"], why: "La première coordonnée est l'abscisse : −3." },
    ];
    return qcmOf(r, pool, "Pense à la forme du graphique et au point O.");
  }, QCM),
);
