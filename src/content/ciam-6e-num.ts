// CIAM 6ème : activités numériques (chapitres 9 à 15).
// Chaque gabarit reprend une compétence travaillée dans les exercices du manuel, avec des valeurs et des
// situations originales ; la réponse est toujours calculée par le code (jamais saisie à la main).
import { choice, fr, gcd, int, num, pick, register, round, Rng, shuffle } from "./core";
import { ciam, dec, f, H, PUR, QCM, sg, WHO } from "./ciam-kit";

const mk = ciam("6e", "ciam6");
const BOOK = "CIAM 6ème";
const who = (r: Rng) => pick(r, WHO);
/** Écriture avec un nombre fixé de décimales (conserve les zéros : 4,50). */
const fd = (x: number, d: number) => x.toFixed(d).replace(".", ",");
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
const divisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);

type Item = { q: string; good: string; bad: string[]; why: string };

register(
  // ================= Chapitre 9 : Nombres entiers naturels, multiples, diviseurs =================
  mk("entiers-consecutifs", "Nombres entiers naturels", 1, { skill: "Dénombrer des nombres entiers consécutifs", ref: `${BOOK}, chap. 9 §1.3, ex. 1.m (p. 123) et ex. 15-18 (p. 130)`, kw: ["consécutifs", "dénombrement", "combien de nombres", "dernier"] }, (c, r) => {
    const k = int(r, 0, 2);
    if (k === 0) {
      const a = int(r, 3, 40), b = a + int(r, 8, 60), n = b - a + 1;
      return {
        statement: c === "pur" ? `Combien y a-t-il de nombres entiers naturels consécutifs de ${a} à ${b} (${a} et ${b} compris) ?` : `Les maillots d'une équipe sont numérotés de ${a} à ${b}, sans trou. Combien de maillots y a-t-il ?`,
        answer: num(n),
        hints: H("On compte les nombres de la liste.", "Les deux extrémités sont comptées.", `De 1 à ${b} il y en a ${b} ; on retire ceux de 1 à ${a - 1}.`, `${b} − ${a} + 1.`),
        solution: `${b} − ${a} + 1 = ${n}.`,
      };
    }
    if (k === 1) {
      const b = int(r, 20, 150);
      return {
        statement: c === "pur" ? `Combien y a-t-il de nombres entiers naturels consécutifs de 0 à ${b} ?` : `Un compteur affiche tous les nombres entiers de 0 à ${b}, un par un. Combien de nombres différents a-t-il affichés ?`,
        answer: num(b + 1),
        hints: H("On compte tous les nombres, y compris 0.", "De 1 à n il y a n nombres.", "Le nombre 0 s'ajoute à la liste.", `${b} + 1.`),
        solution: `De 1 à ${b} : ${b} nombres ; avec 0 : ${b} + 1 = ${b + 1}.`,
      };
    }
    const n = int(r, 20, 300);
    return {
      statement: c === "pur" ? `Quel est le dernier des ${n} premiers nombres entiers naturels ?` : `Un stade numérote ses places à partir de 0. Il y a ${n} places. Quel est le numéro de la dernière place ?`,
      answer: num(n - 1),
      hints: H("La liste commence à 0.", "Le premier nombre est 0, le deuxième est 1…", "Le dernier de n nombres est n − 1.", `${n} − 1.`),
      solution: `Les nombres vont de 0 à ${n} − 1 = ${n - 1}.`,
    };
  }),
  mk("entiers-chiffres", "Nombres entiers naturels", 1, { skill: "Écrire un nombre d'après la position de ses chiffres", ref: `${BOOK}, chap. 9, ex. 9 (p. 130)`, kw: ["chiffre", "unités", "dizaines", "centaines", "unités de mille", "écriture"] }, (c, r) => {
    const m = int(r, 1, 9), ce = int(r, 0, 9), d = int(r, 0, 9), u = int(r, 0, 9);
    const dm = int(r, 0, 1) === 1 ? int(r, 1, 9) : 0;
    const v = dm * 10000 + m * 1000 + ce * 100 + d * 10 + u;
    void c;
    return {
      statement: `Écris le nombre dont ${dm ? `${dm} est le chiffre des dizaines de mille, ` : ""}${m} est le chiffre des unités de mille, ${ce} celui des centaines, ${d} celui des dizaines et ${u} celui des unités.`,
      answer: num(v),
      hints: H("On reconstruit un nombre à partir de ses chiffres.", "Chaque position a une valeur : unités, dizaines, centaines, unités de mille…", "Écris les chiffres dans l'ordre, du plus grand rang au plus petit.", `${dm ? `${dm}, ` : ""}${m}, ${ce}, ${d}, ${u}.`),
      solution: `${dm ? `${dm} ` : ""}${m} ${ce} ${d} ${u} → ${f(v)}.`,
    };
  }, [{ id: "ecriture", label: "Écriture d'un nombre" }]),
  mk("multiples-voisins", "Multiples et diviseurs", 1, { skill: "Multiple qui suit ou qui précède", ref: `${BOOK}, chap. 9 §2, ex. 2.a (p. 125) et ex. 21 (p. 131)`, kw: ["multiple", "suit", "précède", "table"] }, (c, r) => {
    const m = int(r, 6, 19), k = int(r, 5, 60), n = m * k;
    const suit = int(r, 0, 1) === 1;
    return {
      statement: c === "pur" ? `${f(n)} est un multiple de ${m}. Quel est le multiple de ${m} qui ${suit ? "suit" : "précède"} ${f(n)} ?` : `Des paquets contiennent chacun ${m} bonbons. ${who(r)} a exactement ${k} paquets, soit ${f(n)} bonbons. Combien de bonbons y aurait-il avec un paquet de ${suit ? "plus" : "moins"} ?`,
      answer: num(suit ? n + m : n - m),
      hints: H("Les multiples de " + m + " sont espacés de " + m + ".", "On passe d'un multiple au suivant en ajoutant " + m + ".", suit ? `Multiple suivant = ${f(n)} + ${m}.` : `Multiple précédent = ${f(n)} − ${m}.`, suit ? `${f(n)} + ${m}.` : `${f(n)} − ${m}.`),
      solution: suit ? `${f(n)} + ${m} = ${f(n + m)}.` : `${f(n)} − ${m} = ${f(n - m)}.`,
    };
  }),
  mk("multiples-plus-petit", "Multiples et diviseurs", 2, { skill: "Plus petit multiple supérieur à un nombre ; multiples jusqu'à N", ref: `${BOOK}, chap. 9 §2, ex. 23 et 62 (p. 131-133)`, kw: ["multiple", "plus petit multiple", "combien de multiples"] }, (c, r) => {
    const m = int(r, 4, 15);
    if (int(r, 0, 1) === 0) {
      const n = int(r, 50, 400);
      const ans = (Math.floor(n / m) + 1) * m;
      return {
        statement: c === "pur" ? `Quel est le plus petit multiple de ${m} strictement plus grand que ${n} ?` : `Des cartons de ${m} bouteilles sont empilés. ${who(r)} ne veut avoir que des cartons pleins et dépasser ${n} bouteilles. Quel est le plus petit nombre de bouteilles possible ?`,
        answer: num(ans),
        hints: H("On cherche un multiple de " + m + " juste au-dessus de " + n + ".", `Divise ${n} par ${m} (division euclidienne).`, "Le multiple suivant est (quotient + 1) × " + m + ".", `${n} = ${m} × ${Math.floor(n / m)} + ${n % m}.`),
        solution: `${n} ÷ ${m} : quotient ${Math.floor(n / m)} ; le multiple suivant est ${m} × ${Math.floor(n / m) + 1} = ${ans}.`,
      };
    }
    const N = int(r, 40, 150), q = Math.floor(N / m);
    return {
      statement: c === "pur" ? `Combien y a-t-il de multiples de ${m} parmi les nombres entiers de 1 à ${N} (compris) ?` : `Dans une rue, les maisons sont numérotées de 1 à ${N}. Une maison sur ${m} (la ${m}ᵉ, la ${2 * m}ᵉ, etc.) a un portail rouge. Combien de maisons ont un portail rouge ?`,
      answer: num(q),
      hints: H("On compte les multiples de " + m + " dans la liste.", `Les multiples sont ${m}, ${2 * m}, ${3 * m}, …`, `Divise ${N} par ${m} : le quotient donne le nombre de multiples.`, `${N} = ${m} × ${q} + ${N % m}.`),
      solution: `${N} ÷ ${m} : quotient entier ${q}. Il y a ${q} multiples de ${m} de 1 à ${N}.`,
    };
  }),
  mk("divisibilite-criteres", "Multiples et diviseurs", 1, { skill: "Reconnaître un nombre divisible par 2, 3, 5, 9, 10", ref: `${BOOK}, chap. 9 §3.2, ex. 3.d (p. 126-127) et ex. 32-34 (p. 131)`, kw: ["divisible", "critère", "caractère de divisibilité", "2", "3", "5", "9", "10"] }, (_c, r) => {
    const d = pick(r, [2, 3, 5, 9, 10]);
    let nums: number[] = [], good = 0;
    for (let t = 0; t < 400; t++) {
      nums = Array.from({ length: 4 }, () => int(r, 100, 9999));
      if (new Set(nums).size < 4) continue;
      if (nums.filter((n) => n % d === 0).length === 1) { good = nums.findIndex((n) => n % d === 0); break; }
    }
    if (nums.filter((n) => n % d === 0).length !== 1) { nums = [1236, 1237, 1239 + (d === 5 ? 1 : 0), 4001]; good = nums.findIndex((n) => n % d === 0); if (good < 0) { nums[0] = d * 100; good = 0; } }
    const rule = { 2: "il se termine par 0, 2, 4, 6 ou 8", 3: "la somme de ses chiffres est un multiple de 3", 5: "il se termine par 0 ou 5", 9: "la somme de ses chiffres est un multiple de 9", 10: "il se termine par 0" }[d as 2 | 3 | 5 | 9 | 10];
    const sd = (n: number) => String(n).split("").reduce((s, x) => s + Number(x), 0);
    return {
      statement: `Lequel de ces nombres est divisible par ${d} ?`,
      answer: choice(r, nums.map((n) => f(n)), good),
      hints: H(`On cherche le nombre qui est un multiple de ${d}.`, `Un nombre est divisible par ${d} lorsque ${rule}.`, d === 3 || d === 9 ? "Calcule la somme des chiffres de chaque nombre." : "Regarde le dernier chiffre de chaque nombre.", d === 3 || d === 9 ? `Par exemple, ${f(nums[0])} : somme ${sd(nums[0])}.` : `Par exemple, ${f(nums[0])} se termine par ${nums[0] % 10}.`),
      solution: `${f(nums[good])} est divisible par ${d} car ${rule}${d === 3 || d === 9 ? ` (somme des chiffres : ${sd(nums[good])})` : ""}.`,
    };
  }, QCM),
  mk("divisibilite-chiffre", "Multiples et diviseurs", 2, { skill: "Trouver les chiffres qui rendent un nombre divisible", ref: `${BOOK}, chap. 9, ex. 35-39 (p. 132)`, kw: ["divisible", "chiffre manquant", "case", "critère"] }, (c, r) => {
    const d = pick(r, [2, 3, 5, 9]);
    const p = int(r, 10, 99);
    const cnt = Array.from({ length: 10 }, (_, k) => k).filter((k) => (p * 10 + k) % d === 0);
    void c;
    return {
      statement: `${p}□ est un nombre entier naturel de trois chiffres (□ est son chiffre des unités). Par combien de chiffres différents peut-on remplacer □ pour que ce nombre soit divisible par ${d} ?`,
      answer: num(cnt.length),
      hints: H("On cherche tous les chiffres possibles pour la case.", `Teste chacun des chiffres de 0 à 9 avec le critère de divisibilité par ${d}.`, d === 3 || d === 9 ? `La somme ${Math.floor(p / 10)} + ${p % 10} + □ doit être un multiple de ${d}.` : `Le critère de divisibilité par ${d} porte sur le dernier chiffre.`, "Compte les chiffres qui conviennent."),
      solution: `Chiffres possibles : ${cnt.join(", ")}. Il y en a ${cnt.length}.`,
    };
  }, [{ id: "case", label: "Chiffre manquant" }]),
  mk("diviseurs-nombre", "Multiples et diviseurs", 2, { skill: "Compter les diviseurs d'un nombre", ref: `${BOOK}, chap. 9 §3.3, ex. 3.h (p. 129) et ex. 43-48 (p. 132)`, kw: ["diviseurs", "ensemble des diviseurs", "combien de diviseurs"] }, (c, r) => {
    const n = pick(r, [12, 14, 15, 16, 18, 20, 21, 24, 25, 28, 30, 32, 35, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 72, 84, 90, 96, 100, 13, 17, 19, 23, 29, 31, 37]);
    const ds = divisors(n);
    void c;
    return {
      statement: `Combien le nombre ${n} a-t-il de diviseurs ? (compte 1 et ${n} lui-même)`,
      answer: num(ds.length),
      hints: H("On cherche tous les nombres qui divisent " + n + ".", "Cherche les produits de deux entiers qui valent " + n + ".", "Teste 1, 2, 3, … jusqu'à ce que les paires se répètent.", `Par exemple 1 × ${n} = ${n}.`),
      solution: `Diviseurs de ${n} : ${ds.join(" ; ")}. Il y en a ${ds.length}.`,
    };
  }, [{ id: "liste", label: "Liste des diviseurs" }]),
  mk("pgcd-ppcm", "Multiples et diviseurs", 3, { skill: "Plus grand diviseur commun, plus petit multiple commun", ref: `${BOOK}, chap. 9, ex. 68-69 (p. 134)`, kw: ["pgcd", "ppcm", "diviseur commun", "multiple commun"] }, (c, r) => {
    const [a, b] = pick(r, [[6, 8], [12, 18], [4, 6], [10, 15], [8, 12], [9, 12], [14, 21], [15, 20], [16, 24], [18, 24], [6, 9], [10, 25], [12, 16], [20, 30], [24, 36], [15, 25], [9, 15], [14, 35], [18, 27], [8, 20], [12, 15], [21, 28]]);
    const g = gcd(a, b), l = lcm(a, b);
    if (int(r, 0, 1) === 0) return {
      statement: c === "pur" ? `Quel est le plus grand diviseur commun à ${a} et ${b} ?` : `${who(r)} veut partager ${a} mangues et ${b} oranges en lots identiques, sans en laisser. Quel est le plus grand nombre de lots possible ?`,
      answer: num(g),
      hints: H("On cherche un diviseur commun aux deux nombres.", `Écris la liste des diviseurs de ${a} et celle de ${b}.`, "Prends le plus grand nombre qui figure dans les deux listes.", `Diviseurs de ${a} : ${divisors(a).join(", ")}.`),
      solution: `Diviseurs de ${a} : ${divisors(a).join(", ")} ; de ${b} : ${divisors(b).join(", ")}. Le plus grand en commun est ${g}.`,
    };
    return {
      statement: c === "pur" ? `Quel est le plus petit multiple commun non nul à ${a} et ${b} ?` : `Un bus passe toutes les ${a} minutes et un autre toutes les ${b} minutes. Ils partent ensemble à 6 h. Dans combien de minutes repartiront-ils ensemble pour la première fois ?`,
      answer: num(l),
      hints: H("On cherche un multiple commun, le plus petit non nul.", `Écris les multiples de ${a} puis ceux de ${b}.`, "Repère le premier nombre (non nul) présent dans les deux listes.", `Multiples de ${a} : ${[1, 2, 3, 4].map((k) => k * a).join(", ")}…`),
      solution: `Multiples de ${a} : ${[1, 2, 3, 4, 5].map((k) => k * a).join(", ")}… ; de ${b} : ${[1, 2, 3, 4, 5].map((k) => k * b).join(", ")}… Le premier commun est ${l}.`,
    };
  }),
  mk("multiple-diviseur-egalite", "Multiples et diviseurs", 1, { skill: "Utiliser une égalité : multiple, diviseur, divisible", ref: `${BOOK}, chap. 9 §3.1, ex. 3.a-3.c (p. 126) et ex. 29-31 (p. 131)`, kw: ["multiple", "diviseur", "divisible par", "égalité", "vocabulaire"] }, (c, r) => {
    const d = int(r, 7, 29), k = int(r, 6, 45), n = d * k;
    if (int(r, 0, 1) === 0) {
      void c;
      return {
        statement: `Complète l'égalité : ${f(n)} = ${d} × □. Quel nombre faut-il écrire dans la case ?`,
        answer: num(k),
        hints: H("On cherche le facteur manquant d'une multiplication.", `${f(n)} est un multiple de ${d}.`, `Facteur manquant = ${f(n)} ÷ ${d}.`, `${f(n)} ÷ ${d}.`),
        solution: `${f(n)} ÷ ${d} = ${k}, donc ${f(n)} = ${d} × ${k}.`,
      };
    }
    const pool: Item[] = [
      { q: `${f(n)} = ${d} × ${k}. Laquelle de ces phrases est vraie ?`, good: `${d} est un diviseur de ${f(n)}`, bad: [`${f(n)} est un diviseur de ${d}`, `${d} est un multiple de ${k}`, `${k} est un multiple de ${f(n)}`], why: `Comme ${f(n)} = ${d} × ${k}, ${f(n)} est un multiple de ${d} et ${d} est un diviseur de ${f(n)}.` },
    ];
    const it = pool[0];
    return { statement: it.q, answer: choice(r, [it.good, ...it.bad], 0), hints: H("On lit l'égalité avec le vocabulaire : multiple, diviseur.", "Si a = b × c, alors a est un multiple de b.", "Le diviseur est le petit nombre qui « entre » dans le grand.", `${d} × ${k} = ${f(n)}.`), solution: it.why };
  }, [{ id: "vocab", label: "Vocabulaire" }]),

  // ================= Chapitre 10 : Comparaison des nombres décimaux =================
  mk("decimal-parties", "Nombres décimaux", 1, { skill: "Partie entière et partie décimale", ref: `${BOOK}, chap. 10 §1.1, ex. 1.a (p. 136) et ex. 1-2 (p. 143)`, kw: ["partie entière", "partie décimale", "décimal"] }, (c, r) => {
    const dg = int(r, 1, 3), I = int(r, 1, 399);
    const D = int(r, 1, 10 ** dg - 1);
    const x = I + D / 10 ** dg, part = round(D / 10 ** dg, dg);
    void c;
    const ent = int(r, 0, 1) === 0;
    return {
      statement: `${ent ? "Quelle est la partie entière" : "Quelle est la partie décimale"} du nombre décimal ${fd(x, dg)} ?`,
      answer: num(ent ? I : part),
      hints: H("Un nombre décimal s'écrit : partie entière + partie décimale.", "La partie entière est à gauche de la virgule.", "La partie décimale est le nombre plus petit que 1 formé par les chiffres après la virgule.", `${fd(x, dg)} = ${I} + ${fd(part, dg)}.`),
      solution: `${fd(x, dg)} = ${I} + ${fd(part, dg)}. ${ent ? `Partie entière : ${I}.` : `Partie décimale : ${fd(part, dg)}.`}`,
    };
  }, [{ id: "parties", label: "Décomposer un décimal" }]),
  mk("decimal-position", "Nombres décimaux", 1, { skill: "Position d'un chiffre dans un nombre décimal", ref: `${BOOK}, chap. 10 §1.2, ex. 1.c (p. 136-137) et ex. 10-11 (p. 143)`, kw: ["chiffre", "dixièmes", "centièmes", "millièmes", "unités", "position"] }, (_c, r) => {
    const ip = Array.from({ length: 5 }, () => int(r, 1, 9)), dp = Array.from({ length: 3 }, () => int(r, 1, 9));
    const pos = [
      { n: "dizaines de mille", d: ip[0] }, { n: "unités de mille", d: ip[1] }, { n: "centaines", d: ip[2] },
      { n: "dizaines", d: ip[3] }, { n: "unités", d: ip[4] }, { n: "dixièmes", d: dp[0] }, { n: "centièmes", d: dp[1] }, { n: "millièmes", d: dp[2] },
    ];
    const p = pick(r, pos);
    const txt = `${ip[0]}${ip[1]} ${ip[2]}${ip[3]}${ip[4]},${dp.join("")}`;
    return {
      statement: `Dans le nombre ${txt}, quel est le chiffre des ${p.n} ?`,
      answer: num(p.d),
      hints: H("Chaque chiffre a un nom selon sa place.", "À gauche de la virgule : unités, dizaines, centaines, unités de mille…", "À droite de la virgule : dixièmes, centièmes, millièmes.", `Repère la virgule, puis avance rang par rang.`),
      solution: `Dans ${txt}, le chiffre des ${p.n} est ${p.d}.`,
    };
  }, [{ id: "rang", label: "Rang d'un chiffre" }]),
  mk("decimal-comparer", "Nombres décimaux", 1, { skill: "Comparer deux nombres décimaux", ref: `${BOOK}, chap. 10 §2, ex. 1.b (p. 136) et ex. 5, 18-22 (p. 143-144)`, kw: ["comparer", "plus grand", "plus petit", "inférieur", "supérieur", "décimaux"] }, (_c, r) => {
    const t = int(r, 0, 3);
    let A: string, B: string, a: number, b: number;
    if (t === 0) { const u = int(r, 1, 9), d = int(r, 1, 9); a = u + d / 10; b = u + d / 100; A = fd(a, 1); B = fd(b, 2); }
    else if (t === 1) { a = dec(r, 1, 30, 2); do { b = dec(r, 1, 30, 2); } while (Math.abs(a - b) < 0.005); A = fd(a, 2); B = fd(b, 2); }
    else if (t === 2) { a = dec(r, 1, 20, 1); b = a; A = fd(a, 1); B = fd(b, int(r, 2, 3)); }
    else { const u = int(r, 1, 9), d = int(r, 1, 9); a = u + d / 10; b = u + d / 1000; A = fd(a, 1); B = fd(b, 3); }
    if (int(r, 0, 1) === 1) { [A, B] = [B, A]; [a, b] = [b, a]; }
    const A1 = Math.round(a * 1000), B1 = Math.round(b * 1000);
    const rel = A1 < B1 ? 0 : A1 === B1 ? 1 : 2;
    const sym = ["<", "=", ">"];
    return {
      statement: `Compare ces deux nombres : ${A} et ${B}. Quelle écriture est correcte ?`,
      answer: choice(r, sym.map((s) => `${A} ${s} ${B}`), rel),
      hints: H("On compare deux nombres décimaux.", "Compare d'abord les parties entières.", "Si elles sont égales, compare les dixièmes, puis les centièmes, puis les millièmes (ajoute des zéros pour t'aider).", `Écris les deux nombres avec le même nombre de décimales.`),
      solution: `${A} ${sym[rel]} ${B}.`,
    };
  }, QCM),
  mk("decimal-ranger", "Nombres décimaux", 2, { skill: "Trouver le plus grand / le plus petit d'une liste de décimaux", ref: `${BOOK}, chap. 10 §2, ex. 32-35 (p. 144)`, kw: ["ranger", "ordre croissant", "ordre décroissant", "plus petit", "plus grand"] }, (_c, r) => {
    let vals: number[] = [];
    do { vals = Array.from({ length: 4 }, () => dec(r, 0, 9, int(r, 1, 3))); } while (new Set(vals.map((v) => Math.round(v * 1000))).size < 4 || new Set(vals.map((v) => fr(v))).size < 4);
    const big = int(r, 0, 1) === 1;
    const target = big ? Math.max(...vals) : Math.min(...vals);
    return {
      statement: `Parmi ces nombres, lequel est le plus ${big ? "grand" : "petit"} : ${vals.map((v) => fr(v)).join(" ; ")} ?`,
      answer: choice(r, vals.map((v) => fr(v)), vals.indexOf(target)),
      hints: H("On compare quatre décimaux.", "Compare les parties entières d'abord.", "Ensuite compare chiffre après chiffre après la virgule (ajoute des zéros au besoin).", "Ne te laisse pas piéger par le nombre de chiffres après la virgule."),
      solution: `Le plus ${big ? "grand" : "petit"} est ${fr(target)}.`,
    };
  }, QCM),
  mk("decimal-encadrer", "Nombres décimaux", 2, { skill: "Encadrer un décimal", ref: `${BOOK}, chap. 10 §2-3, ex. 42-46 (p. 145)`, kw: ["encadrer", "encadrement", "entiers consécutifs", "chiffre après la virgule"] }, (_c, r) => {
    const up = int(r, 0, 1) === 1;
    const enc = (xx: number, dg: number, lo: number, hi: number) => {
      const ans = up ? hi : lo;
      const what = dg === 1 ? "deux nombres décimaux consécutifs ayant un chiffre après la virgule" : "deux nombres entiers naturels consécutifs";
      return {
        statement: `On encadre ${fr(xx)} par ${what}. Quel est le plus ${up ? "grand" : "petit"} des deux ?`,
        answer: num(ans),
        hints: H("Un encadrement donne un nombre juste en dessous et un nombre juste au-dessus.", `Les deux nombres sont consécutifs : ils diffèrent de ${dg === 1 ? "0,1" : "1"}.`, dg === 1 ? "Garde seulement le chiffre des dixièmes pour avoir le nombre du dessous." : "La partie entière donne le nombre du dessous.", up ? "Le nombre du dessus est celui du dessous augmenté du pas." : "Garde la partie voulue et supprime le reste."),
        solution: `${fr(lo)} < ${fr(xx)} < ${fr(hi)}. Le plus ${up ? "grand" : "petit"} est ${fr(ans)}.`,
      };
    };
    let X = 0;
    if (int(r, 0, 1) === 0) {
      do { X = int(r, 201, 9999); } while (X % 10 === 0);
      const lo = round(Math.floor(X / 10) / 10, 1);
      return enc(X / 100, 1, lo, round(lo + 0.1, 1));
    }
    do { X = int(r, 12, 499); } while (X % 10 === 0);
    const lo = Math.floor(X / 10);
    return enc(X / 10, 0, lo, lo + 1);
  }, [{ id: "enc", label: "Encadrement" }]),
  mk("decimal-entre", "Nombres décimaux", 3, { skill: "Compter les décimaux compris entre deux nombres", ref: `${BOOK}, chap. 10, ex. 62-64 (p. 146)`, kw: ["combien de nombres décimaux", "entre", "chiffres après la virgule"] }, (_c, r) => {
    const lo = dec(r, 1, 40, 1), hi = round(lo + 0.1, 1), q = int(r, 2, 3);
    const n = 10 ** (q - 1) - 1;
    const pas = q === 2 ? "0,01" : "0,001";
    return {
      statement: `Combien y a-t-il de nombres décimaux, écrits avec au plus ${q} chiffres après la virgule, qui sont strictement compris entre ${fr(lo)} et ${fr(hi)} ?`,
      answer: num(n),
      hints: H("On compte les décimaux d'une certaine précision entre deux nombres consécutifs.", `Entre ${fr(lo)} et ${fr(hi)}, avance de ${pas} en ${pas}.`, `Il y a ${10 ** (q - 1)} pas de taille ${pas} entre ${fr(lo)} et ${fr(hi)}.`, "Retire les deux extrémités, qui ne comptent pas."),
      solution: `Entre ${fr(lo)} et ${fr(hi)} il y a ${10 ** (q - 1)} pas de ${pas}, donc ${10 ** (q - 1)} − 1 = ${n} nombres strictement compris entre les deux.`,
    };
  }, [{ id: "entre", label: "Combien entre deux nombres ?" }]),

  // ================= Chapitre 11 : Addition, soustraction, multiplication des décimaux =================
  mk("op-addition", "Décimaux et opérations", 1, { skill: "Additionner et soustraire des nombres décimaux", ref: `${BOOK}, chap. 11 §1, ex. 1.a-1.b (p. 149) et ex. 1-3 (p. 160)`, kw: ["addition", "soustraction", "somme", "différence", "décimaux", "terme manquant"] }, (c, r) => {
    const k = int(r, 0, 2);
    if (k === 0) {
      const x = dec(r, 10, 900, 1), y = int(r, 100, 999), z = dec(r, 10, 99, 2), s = round(x + y + z, 2);
      return {
        statement: c === "pur" ? `Calcule ${fr(x)} + ${y} + ${fr(z)}.` : `${who(r)} achète trois articles : ${fr(x)} F, ${y} F et ${fr(z)} F. Quel est le total à payer (en F) ?`,
        answer: num(s, 0.001),
        hints: H("On additionne trois nombres décimaux.", "Aligne les virgules les unes sous les autres.", "Complète avec des zéros pour avoir le même nombre de décimales.", `${fr(x)} + ${y} = ${fr(round(x + y, 2))}.`),
        solution: `${fr(x)} + ${y} + ${fr(z)} = ${fr(s)}.`,
      };
    }
    if (k === 1) {
      const a = dec(r, 200, 2000, 2), b = dec(r, 1, 199, 2), d = round(a - b, 2);
      return {
        statement: c === "pur" ? `Calcule ${fr(a)} − ${fr(b)}.` : `Une planche mesure ${fr(a)} cm. On en coupe ${fr(b)} cm. Quelle longueur (en cm) reste-t-il ?`,
        answer: num(d, 0.001),
        hints: H("On soustrait deux nombres décimaux.", "Aligne les virgules, comme pour une addition.", "Complète avec des zéros pour avoir le même nombre de décimales.", `Contrôle : ton résultat + ${fr(b)} doit redonner ${fr(a)}.`),
        solution: `${fr(a)} − ${fr(b)} = ${fr(d)}.`,
      };
    }
    const a = dec(r, 10, 400, 2), tot = int(r, 5, 9) * 100, ans = round(tot - a, 2);
    return {
      statement: c === "pur" ? `Quel nombre faut-il écrire dans la case : ${fr(a)} + □ = ${tot} ?` : `${who(r)} doit payer ${tot} F et a déjà versé ${fr(a)} F. Combien reste-t-il à verser (en F) ?`,
      answer: num(ans, 0.001),
      hints: H("On cherche le terme manquant d'une addition.", "Terme manquant = total − terme connu.", "C'est une soustraction.", `${tot} − ${fr(a)}.`),
      solution: `${tot} − ${fr(a)} = ${fr(ans)}.`,
    };
  }),
  mk("op-multiplication", "Décimaux et opérations", 2, { skill: "Multiplier des nombres décimaux", ref: `${BOOK}, chap. 11 §2, ex. 2.a-2.c (p. 151) et exemples p. 150`, kw: ["multiplication", "produit", "décimaux", "facteurs"] }, (c, r) => {
    const k = int(r, 0, 2);
    if (k === 0) {
      const a = dec(r, 2, 30, 1), b = dec(r, 2, 9, 1), p = round(a * b, 2);
      return {
        statement: c === "pur" ? `Calcule ${fr(a)} × ${fr(b)}.` : `Un rectangle mesure ${fr(a)} m de long et ${fr(b)} m de large. Quelle est son aire (en m²) ?`,
        answer: num(p, 0.001),
        hints: H("On multiplie deux décimaux.", "Multiplie comme si les virgules n'existaient pas.", "Le produit a autant de décimales que les deux facteurs ensemble.", `${Math.round(a * 10)} × ${Math.round(b * 10)} = ${Math.round(a * 10) * Math.round(b * 10)}.`),
        solution: `${Math.round(a * 10)} × ${Math.round(b * 10)} = ${Math.round(a * 10) * Math.round(b * 10)} ; 2 décimales : ${fr(p)}.`,
      };
    }
    if (k === 1) {
      const price = int(r, 3, 13) * 50, w = dec(r, 1, 6, 1), p = round(price * w, 2);
      return {
        statement: c === "pur" ? `Calcule ${fr(w)} × ${price}.` : `${who(r)} achète ${fr(w)} kg de viande à ${price} F le kilogramme. Quel est le prix à payer (en F) ?`,
        answer: num(p, 0.001),
        hints: H("On multiplie une masse par un prix au kilogramme.", "Prix total = masse × prix du kg.", "Multiplie comme avec des entiers puis place la virgule.", `${Math.round(w * 10)} × ${price} = ${Math.round(w * 10) * price}.`),
        solution: `${fr(w)} × ${price} = ${fr(p)}.`,
      };
    }
    const m = int(r, 20, 90) * 1000 + 500 * int(r, 0, 1);
    return {
      statement: c === "pur" ? `Calcule ${f(m)} × 12.` : `Un employé gagne ${f(m)} F par mois. Quel est son salaire annuel (en F) ?`,
      answer: num(m * 12),
      hints: H("Une année compte 12 mois.", "Salaire annuel = salaire mensuel × 12.", "Multiplie d'abord par 10 puis par 2 et additionne.", `${f(m)} × 10 = ${f(m * 10)}.`),
      solution: `${f(m)} × 12 = ${f(m * 12)}.`,
    };
  }),
  mk("op-estimation", "Décimaux et opérations", 2, { skill: "Estimer une somme en arrondissant à la centaine", ref: `${BOOK}, chap. 11 §1.3, ex. 1.c (p. 149-150)`, kw: ["estimation", "arrondir", "centaine", "somme", "ordre de grandeur"] }, (c, r) => {
    const v = Array.from({ length: 3 }, () => { let x; do { x = int(r, 100, 6999); } while (x % 100 === 50); return x; });
    const est = v.map((x) => Math.round(x / 100) * 100);
    return {
      statement: c === "pur" ? `Arrondis chacun des nombres ${v.join(", ")} à la centaine la plus proche, puis additionne les trois nombres obtenus.` : `${who(r)} veut estimer vite le prix d'un pagne à ${v[0]} F, d'une chemise à ${v[1]} F et d'un pantalon à ${v[2]} F. Chaque prix est arrondi à la centaine la plus proche. Quelle estimation du total obtient-on (en F) ?`,
      answer: num(est[0] + est[1] + est[2]),
      hints: H("On remplace chaque prix par un nombre rond.", "Une centaine, c'est un multiple de 100.", "Regarde les deux derniers chiffres : moins de 50 on arrondit vers le bas, plus de 50 vers le haut.", `${v[0]} → ${est[0]}.`),
      solution: `${v.map((x, i) => `${x} → ${est[i]}`).join(" ; ")}. Somme : ${est.join(" + ")} = ${est[0] + est[1] + est[2]}.`,
    };
  }),
  mk("op-dernier-chiffre", "Décimaux et opérations", 2, { skill: "Contrôler une multiplication par le dernier chiffre", ref: `${BOOK}, chap. 11 §2.4, ex. 2.f (p. 152)`, kw: ["contrôle", "dernier chiffre", "erreur", "multiplication"] }, (_c, r) => {
    const a = int(r, 12, 99), b = int(r, 12, 99), p = a * b;
    const cas = int(r, 0, 2);
    const shown = cas === 0 ? p : cas === 1 ? p + pick(r, [1, 2, 3, 4, 6, 7, 8, 9]) : p + 10 * int(r, 1, 9);
    const bad = shown % 10 !== (a % 10 * (b % 10)) % 10;
    const o1 = "Non : le dernier chiffre prouve que ce résultat est faux", o2 = "Le dernier chiffre est cohérent : le résultat peut être juste (mais le test ne le prouve pas)";
    return {
      statement: `Un élève trouve ${a} × ${b} = ${f(shown)}. Le test du dernier chiffre permet-il de rejeter ce résultat ?`,
      answer: choice(r, [o1, o2], bad ? 0 : 1),
      hints: H("On ne regarde que le dernier chiffre du produit.", "Le dernier chiffre du produit est le dernier chiffre du produit des deux derniers chiffres.", `${a % 10} × ${b % 10} = ${(a % 10) * (b % 10)}.`, `Compare avec le dernier chiffre de ${f(shown)}, qui est ${shown % 10}.`),
      solution: `${a % 10} × ${b % 10} = ${(a % 10) * (b % 10)} : le produit doit finir par ${((a % 10) * (b % 10)) % 10}. ${f(shown)} finit par ${shown % 10} : ${bad ? "le résultat est faux." : "pas d'erreur détectée par ce test."}`,
    };
  }, QCM),
  mk("op-priorites", "Décimaux et opérations", 2, { skill: "Priorités opératoires : parenthèses, × avant +", ref: `${BOOK}, chap. 11 §3.2, ex. 21-24 (p. 162) et ex. 38 (p. 164)`, kw: ["priorité", "parenthèses", "ordre des opérations", "calcul", "programme de calcul"] }, (c, r) => {
    const a = int(r, 3, 40), b = int(r, 2, 9), d = int(r, 2, 12);
    const t = int(r, 0, 3);
    if (t === 0) return {
      statement: c === "pur" ? `Calcule ${a} + ${b} × ${d}.` : `${who(r)} achète une banane à ${a} F et ${b} oranges à ${d} F l'une. Quel est le prix total (en F) ?`,
      answer: num(a + b * d),
      hints: H("Il y a une addition et une multiplication.", "La multiplication est prioritaire sur l'addition.", `Calcule d'abord ${b} × ${d}.`, `${b} × ${d} = ${b * d}.`),
      solution: `${a} + ${b} × ${d} = ${a} + ${b * d} = ${a + b * d}.`,
    };
    if (t === 1) return {
      statement: c === "pur" ? `Calcule (${a} + ${b}) × ${d}.` : `M. Diarra achète pour chacun de ses ${d} enfants une chemise à ${a} F et un cartable à ${b} F. Combien dépense-t-il en tout (en F) ?`,
      answer: num((a + b) * d),
      hints: H("Il y a des parenthèses.", "Une opération entre parenthèses est prioritaire.", `Calcule d'abord ${a} + ${b}.`, `${a} + ${b} = ${a + b}.`),
      solution: `(${a} + ${b}) × ${d} = ${a + b} × ${d} = ${(a + b) * d}.`,
    };
    if (t === 2) { const s = a * b + int(r, 1, 30); return { statement: `Calcule ${s} − ${a} × ${b}.`, answer: num(s - a * b), hints: H("Il y a une soustraction et une multiplication.", "La multiplication est prioritaire sur la soustraction.", `Calcule d'abord ${a} × ${b}.`, `${a} × ${b} = ${a * b}.`), solution: `${s} − ${a} × ${b} = ${s} − ${a * b} = ${s - a * b}.` }; }
    const e = int(r, 2, 9);
    return {
      statement: `Calcule ${a} × ${b} + ${d} × ${e}.`,
      answer: num(a * b + d * e),
      hints: H("Il y a deux multiplications reliées par une addition.", "Les multiplications sont prioritaires.", "Calcule chaque produit, puis additionne.", `${a} × ${b} = ${a * b} et ${d} × ${e} = ${d * e}.`),
      solution: `${a} × ${b} + ${d} × ${e} = ${a * b} + ${d * e} = ${a * b + d * e}.`,
    };
  }),
  mk("op-regrouper", "Décimaux et opérations", 2, { skill: "Calculer vite en regroupant les facteurs", ref: `${BOOK}, chap. 11 §3.1, ex. 3.b (p. 154-155) et ex. 26 (p. 163)`, kw: ["calcul rapide", "regrouper", "facteurs", "produit", "25 × 4"] }, (c, r) => {
    const [p, q, g] = pick(r, [[25, 4, 100], [125, 8, 1000], [5, 2, 10], [50, 2, 100], [2.5, 4, 10]]);
    const x = dec(r, 2, 60, int(r, 1, 3));
    void c;
    return {
      statement: `Calcule astucieusement P = ${fr(p)} × ${fr(x)} × ${q}.`,
      answer: num(round(x * g, 6), 0.0001),
      hints: H("Certains facteurs se regroupent pour donner un nombre rond.", `${fr(p)} × ${q} = ${g}.`, "On peut changer l'ordre des facteurs d'un produit.", `P = ${fr(x)} × (${fr(p)} × ${q}) = ${fr(x)} × ${g}.`),
      solution: `${fr(p)} × ${q} = ${g} ; P = ${fr(x)} × ${g} = ${fr(round(x * g, 6))}.`,
    };
  }, [{ id: "astuce", label: "Calcul astucieux" }]),
  mk("op-mental", "Décimaux et opérations", 1, { skill: "Calcul mental : additions, retrancher un nombre en 9", ref: `${BOOK}, chap. 11 §3.1, Calcul rapide (p. 154-156)`, kw: ["calcul mental", "calcul rapide", "mentalement", "retrancher"] }, (c, r) => {
    const k = int(r, 0, 2);
    void c;
    if (k === 0) { const a = int(r, 26, 78), b = int(r, 17, 69); return { statement: `Calcule mentalement ${a} + ${b}.`, answer: num(a + b), hints: H("Additionne les dizaines puis les unités.", `Décompose ${b} = ${Math.floor(b / 10) * 10} + ${b % 10}.`, "Ajoute les dizaines, puis les unités.", `${a} + ${Math.floor(b / 10) * 10} = ${a + Math.floor(b / 10) * 10}.`), solution: `${a} + ${b} = ${a + b}.` }; }
    if (k === 1) { const m = pick(r, [9, 19, 29, 39, 49]), a = int(r, 51, 98); return { statement: `Calcule mentalement ${a} − ${m}.`, answer: num(a - m), hints: H("On retranche un nombre terminé par 9.", `Retranche ${m + 1} puis ajoute 1.`, `${a} − ${m + 1} = ${a - m - 1}.`, `${a - m - 1} + 1.`), solution: `${a} − ${m} = ${a} − ${m + 1} + 1 = ${a - m}.` }; }
    const a = int(r, 12, 49); return { statement: `Calcule mentalement ${a} × 4.`, answer: num(a * 4), hints: H("Multiplier par 4, c'est multiplier par 2 deux fois.", `${a} × 2 = ${a * 2}.`, `${a * 2} × 2.`, "Double, puis double encore."), solution: `${a} × 2 = ${a * 2} ; ${a * 2} × 2 = ${a * 4}.` };
  }, [{ id: "mental", label: "Calcul mental" }]),
  mk("op-distributivite", "Décimaux et opérations", 2, { skill: "Multiplier une somme ou une différence par un nombre (distributivité)", ref: `${BOOK}, chap. 11 §3.3, propriétés et exemple 1 (p. 158) et ex. 3.f-3.g (p. 159)`, kw: ["distributivité", "développer", "multiplier une somme", "multiplier une différence", "calcul mental"] }, (c, r) => {
    const x = int(r, 3, 9);
    if (int(r, 0, 1) === 0) {
      const t = int(r, 2, 9) * 10, u = int(r, 2, 9), n = t + u, v = x * n;
      return {
        statement: c === "pur" ? `Calcule ${x} × ${n} en écrivant ${n} = ${t} + ${u} et en utilisant la propriété : ${x} × (${t} + ${u}).` : `${x} sacs contiennent chacun ${n} oranges. En écrivant ${n} = ${t} + ${u}, calcule le nombre total d'oranges.`,
        answer: num(v),
        hints: H("On multiplie une somme par un nombre.", "Pour multiplier une somme par un nombre, on multiplie chaque terme de la somme par ce nombre puis on additionne.", `${x} × ${t} = ${x * t} et ${x} × ${u} = ${x * u}.`, `${x * t} + ${x * u}.`),
        solution: `${x} × ${n} = ${x} × (${t} + ${u}) = ${x} × ${t} + ${x} × ${u} = ${x * t} + ${x * u} = ${v}.`,
      };
    }
    const a = int(r, 2, 6) * 10, m = a - 1, v = x * m;
    return {
      statement: c === "pur" ? `Calcule ${x} × ${m} en écrivant ${m} = ${a} − 1 et en utilisant la propriété : ${x} × (${a} − 1).` : `${x} caisses contiennent chacune ${m} bouteilles. En écrivant ${m} = ${a} − 1, calcule le nombre total de bouteilles.`,
      answer: num(v),
      hints: H("On multiplie une différence par un nombre.", "Pour multiplier une différence par un nombre, on multiplie chaque terme par ce nombre puis on soustrait les produits.", `${x} × ${a} = ${x * a} et ${x} × 1 = ${x}.`, `${x * a} − ${x}.`),
      solution: `${x} × ${m} = ${x} × (${a} − 1) = ${x} × ${a} − ${x} × 1 = ${x * a} − ${x} = ${v}.`,
    };
  }),
  mk("op-mental-9-11", "Décimaux et opérations", 2, { skill: "Multiplier mentalement par 9 ou par 11", ref: `${BOOK}, chap. 11 §3.3, Calcul rapide (p. 158-159)`, kw: ["calcul mental", "multiplier par 9", "multiplier par 11", "calcul rapide"] }, (c, r) => {
    void c;
    if (int(r, 0, 1) === 0) {
      const a = int(r, 12, 79);
      return {
        statement: `Calcule mentalement ${a} × 9, en écrivant 9 = 10 − 1.`,
        answer: num(a * 9),
        hints: H("Multiplier par 9 se fait en deux temps.", `${a} × 9 = ${a} × (10 − 1).`, `${a} × 10 = ${a * 10}.`, `${a * 10} − ${a}.`),
        solution: `${a} × 9 = ${a} × (10 − 1) = ${a * 10} − ${a} = ${a * 9}.`,
      };
    }
    const d = int(r, 1, 9), u = int(r, 1, 9), n = 10 * d + u;
    return {
      statement: `Calcule mentalement ${n} × 11 : ${d + u > 9 ? `la somme des chiffres (${d} + ${u}) dépasse 9, on retient 1` : `la somme des chiffres (${d} + ${u}) ne dépasse pas 9`}.`,
      answer: num(n * 11),
      hints: H("Multiplier un nombre de deux chiffres par 11.", `${n} × 11 = ${n} × 10 + ${n}.`, `${n} × 10 = ${n * 10}.`, `${n * 10} + ${n}.`),
      solution: `${n} × 11 = ${n} × 10 + ${n} = ${n * 10} + ${n} = ${n * 11}.`,
    };
  }, [{ id: "mental", label: "Calcul mental" }]),
  mk("op-programme", "Décimaux et opérations", 2, { skill: "Traduire un programme de calcul écrit en français", ref: `${BOOK}, chap. 11 §3.4, ex. 3.i-3.j (p. 160) et ex. 19-21 (p. 162)`, kw: ["programme de calcul", "écriture en ligne", "somme", "produit", "différence"] }, (c, r) => {
    void c;
    const a = dec(r, 2, 9, 1), b = int(r, 2, 9), d = dec(r, 2, 9, 1), e = int(r, 2, 9);
    const t = int(r, 0, 3);
    const out = [
      { s: `Calcule la somme du produit de ${fr(a)} par ${b} et du produit de ${fr(d)} par ${e}.`, v: round(a * b + d * e, 4), w: `${fr(a)} × ${b} + ${fr(d)} × ${e} = ${fr(round(a * b, 4))} + ${fr(round(d * e, 4))} = ${fr(round(a * b + d * e, 4))}.` },
      { s: `Calcule le produit de la somme de ${fr(a)} et de ${fr(d)} par ${b}.`, v: round((a + d) * b, 4), w: `(${fr(a)} + ${fr(d)}) × ${b} = ${fr(round(a + d, 4))} × ${b} = ${fr(round((a + d) * b, 4))}.` },
      { s: `Calcule la différence entre le produit de ${fr(a + 10)} par ${b + 2} et ${fr(b)}.`, v: round((a + 10) * (b + 2) - b, 4), w: `${fr(a + 10)} × ${b + 2} − ${fr(b)} = ${fr(round((a + 10) * (b + 2), 4))} − ${fr(b)} = ${fr(round((a + 10) * (b + 2) - b, 4))}.` },
      { s: `Calcule la somme de ${fr(a)} et du produit de ${b} par ${e}.`, v: round(a + b * e, 4), w: `${fr(a)} + ${b} × ${e} = ${fr(a)} + ${b * e} = ${fr(round(a + b * e, 4))}.` },
    ][t];
    return {
      statement: out.s,
      answer: num(out.v, 0.0001),
      hints: H("Traduis la phrase en écriture mathématique.", "« Somme » = addition, « produit » = multiplication, « différence » = soustraction.", "Repère l'opération principale, puis ce qu'il y a à l'intérieur.", "Écris l'expression en ligne, puis applique les priorités."),
      solution: out.w,
    };
  }, [{ id: "programme", label: "Programme de calcul" }]),
  mk("op-preuve9", "Décimaux et opérations", 3, { skill: "Preuve par 9", ref: `${BOOK}, chap. 11 §2.4 (p. 153-154) et chap. 12 §3.3 (p. 177)`, kw: ["preuve par 9", "somme des chiffres", "contrôle"] }, (c, r) => {
    const red = (n: number) => { let s = String(n); while (s.length > 1) s = String(s.split("").reduce((t, x) => t + Number(x), 0)); return s === "9" ? 0 : Number(s); };
    void c;
    if (int(r, 0, 1) === 0) {
      const n = int(r, 100, 99999);
      return {
        statement: `Pour la preuve par 9, on additionne les chiffres de ${f(n)}, puis on recommence jusqu'à obtenir un seul chiffre (en remplaçant 9 par 0). Quel chiffre obtient-on ?`,
        answer: num(red(n)),
        hints: H("On réduit un nombre à un seul chiffre.", "Additionne tous ses chiffres.", "Si le résultat a deux chiffres, recommence.", "Remplace 9 par 0 à la fin."),
        solution: `${String(n).split("").join(" + ")} = ${String(n).split("").reduce((t, x) => t + Number(x), 0)} → ${red(n)}.`,
      };
    }
    const a = int(r, 12, 99), b = int(r, 12, 99), p = a * b;
    const cas = int(r, 0, 2);
    const shown = cas === 0 ? p : cas === 1 ? p + pick(r, [1, 2, 3, 4, 5, 6, 7, 8]) : p + 9 * int(r, 1, 9);
    const lhs = red(red(a) * red(b));
    const ok = lhs === red(shown);
    const o1 = "Non : la preuve par 9 montre que le résultat est faux", o2 = "La preuve par 9 ne détecte pas d'erreur (le résultat peut être juste)";
    return {
      statement: `Un élève trouve ${a} × ${b} = ${f(shown)}. Peut-on rejeter ce résultat grâce à la preuve par 9 ?`,
      answer: choice(r, [o1, o2], ok ? 1 : 0),
      hints: H("On compare deux chiffres obtenus avec la preuve par 9.", `Réduis ${a} et ${b} à un chiffre, multiplie ces deux chiffres et réduis encore.`, `Réduis aussi ${f(shown)}.`, `Chiffres de ${a} : ${red(a)} ; de ${b} : ${red(b)}.`),
      solution: `${a} → ${red(a)} ; ${b} → ${red(b)} ; produit : ${red(a) * red(b)} → ${lhs}. Résultat annoncé : ${f(shown)} → ${red(shown)}. ${ok ? "Les deux chiffres sont égaux : aucune erreur détectée." : "Les chiffres sont différents : le résultat est faux."}`,
    };
  }, QCM),

  // ================= Chapitre 12 : Division =================
  mk("div-euclidienne", "Division", 1, { skill: "Division euclidienne : quotient, reste, dividende", ref: `${BOOK}, chap. 12 §1.1, ex. 1.e (p. 170)`, kw: ["division euclidienne", "quotient", "reste", "dividende", "diviseur"] }, (c, r) => {
    const b = int(r, 3, 30), q = int(r, 5, 60), rr = int(r, 1, b - 1), a = b * q + rr;
    const k = int(r, 0, 2);
    if (k === 0) return {
      statement: c === "pur" ? `Effectue la division euclidienne de ${f(a)} par ${b}. Quel est le quotient entier ?` : `${who(r)} répartit ${f(a)} mangues dans des cageots de ${b} mangues. Combien de cageots pleins obtient-on ?`,
      answer: num(q),
      hints: H("On cherche combien de fois " + b + " « entre » dans " + f(a) + ".", `Cherche le plus grand multiple de ${b} qui ne dépasse pas ${f(a)}.`, "Pose la division.", `${b} × ${q} = ${b * q}.`),
      solution: `${f(a)} = ${b} × ${q} + ${rr}. Le quotient entier est ${q}.`,
    };
    if (k === 1) return {
      statement: c === "pur" ? `Effectue la division euclidienne de ${f(a)} par ${b}. Quel est le reste ?` : `${who(r)} répartit ${f(a)} mangues dans des cageots de ${b} mangues. Combien de mangues ne rentrent pas dans un cageot plein ?`,
      answer: num(rr),
      hints: H("Le reste est ce qui n'a pas pu être réparti.", "Le reste est toujours plus petit que le diviseur.", `Calcule ${b} × quotient, puis retranche-le de ${f(a)}.`, `${f(a)} − ${b * q}.`),
      solution: `${f(a)} = ${b} × ${q} + ${rr}. Le reste est ${rr}.`,
    };
    return {
      statement: c === "pur" ? `Dans une division, le diviseur est ${b}, le quotient entier est ${q} et le reste est ${rr}. Quel est le dividende ?` : `Un agriculteur a rempli ${q} sacs de ${b} kg et il lui reste ${rr} kg. Quelle masse (en kg) avait-il au départ ?`,
      answer: num(a),
      hints: H("On cherche le dividende.", "Dividende = diviseur × quotient + reste.", `${b} × ${q} = ${b * q}.`, `${b * q} + ${rr}.`),
      solution: `${b} × ${q} + ${rr} = ${b * q} + ${rr} = ${f(a)}.`,
    };
  }),
  mk("div-exces", "Division", 2, { skill: "Quotient entier par défaut et par excès", ref: `${BOOK}, chap. 12 §1.1, ex. 1.d (p. 169)`, kw: ["quotient par excès", "quotient par défaut", "division"] }, (c, r) => {
    const b = int(r, 4, 20), q = int(r, 4, 30), rr = int(r, 1, b - 1), a = b * q + rr;
    const exces = int(r, 0, 1) === 1;
    return {
      statement: c === "pur" ? `Quel est le quotient entier par ${exces ? "excès" : "défaut"} de la division de ${a} par ${b} ?` : `On veut transporter ${a} personnes avec des minibus de ${b} places. Combien de minibus faut-il au minimum pour ${exces ? "que tout le monde soit transporté" : "remplir complètement des minibus (sans en commencer un incomplet)"} ?`,
      answer: num(exces ? q + 1 : q),
      hints: H("Le reste est non nul : le partage ne tombe pas juste.", "Par défaut : on garde le quotient entier. Par excès : on ajoute 1.", `${a} = ${b} × ${q} + ${rr}.`, exces ? `${q} + 1.` : `Le quotient entier est ${q}.`),
      solution: `${a} = ${b} × ${q} + ${rr}. Par défaut : ${q} ; par excès : ${q + 1}. Réponse : ${exces ? q + 1 : q}.`,
    };
  }),
  mk("div-approchee", "Division", 2, { skill: "Quotient décimal approché par défaut (dixième, centième)", ref: `${BOOK}, chap. 12 §1.2, ex. 1.f (p. 171) et exemples p. 170`, kw: ["quotient approché", "au dixième près", "au centième près", "division décimale"] }, (c, r) => {
    const b = int(r, 3, 40), a = int(r, 30, 2000), p = int(r, 1, 2);
    const q = Math.floor((a * 10 ** p) / b) / 10 ** p;
    return {
      statement: c === "pur" ? `Calcule le quotient de ${f(a)} par ${b} au ${p === 1 ? "dixième" : "centième"} près (par défaut).` : `${f(a)} F sont partagés équitablement entre ${b} personnes. Quelle part (en F) chacun reçoit-il au ${p === 1 ? "dixième" : "centième"} près par défaut ?`,
      answer: num(round(q, p), 0.0001),
      hints: H("On cherche une valeur approchée du quotient.", "Pose la division ; après le quotient entier, ajoute une virgule et continue.", `Arrête-toi au ${p === 1 ? "premier" : "deuxième"} chiffre après la virgule, sans arrondir.`, `Le quotient entier de ${a} par ${b} est ${Math.floor(a / b)}.`),
      solution: `${f(a)} ÷ ${b} = ${fr(round(a / b, 4))}… Au ${p === 1 ? "dixième" : "centième"} près par défaut : ${fr(round(q, p))}.`,
    };
  }),
  mk("div-puissances", "Division", 1, { skill: "Multiplier et diviser par 10, 100, 1 000, 0,1, 0,01, 0,001", ref: `${BOOK}, chap. 12 §2, ex. 2.a-2.b (p. 174) et ex. de la p. 173`, kw: ["multiplier par 10", "diviser par 100", "virgule", "0,1", "0,01", "décaler"] }, (c, r) => {
    const dx = int(r, 0, 3);
    const X = int(r, 1, 9999), x = X / 10 ** dx;
    const s = pick(r, [1, 2, 3]), mult = int(r, 0, 1) === 0, small = int(r, 0, 1) === 1;
    const k = small ? 10 ** -s : 10 ** s;
    const ktxt = small ? (s === 1 ? "0,1" : s === 2 ? "0,01" : "0,001") : f(10 ** s);
    const v = round(mult ? x * k : x / k, 8);
    void c;
    return {
      statement: `Calcule sans poser l'opération : ${fr(x)} ${mult ? "×" : ":"} ${ktxt}.`,
      answer: num(v, 0.0000001),
      hints: H("On décale la virgule.", small ? "Multiplier par 0,1 revient à diviser par 10 ; diviser par 0,1 revient à multiplier par 10." : "Multiplier par 10, 100, 1 000 déplace la virgule vers la droite ; diviser, vers la gauche.", `Nombre de rangs : ${s}.`, mult !== small ? "La virgule va vers la droite (le nombre grandit)." : "La virgule va vers la gauche (le nombre diminue)."),
      solution: `${fr(x)} ${mult ? "×" : ":"} ${ktxt} = ${fr(v)}.`,
    };
  }, [{ id: "decalage", label: "Décaler la virgule" }]),
  mk("div-quotient-egal", "Division", 2, { skill: "Même quotient : multiplier ou diviser dividende et diviseur", ref: `${BOOK}, chap. 12 §3.1, propriétés 1 et 2 (p. 175) et ex. 3.b (p. 175)`, kw: ["quotient", "même nombre", "dividende", "diviseur", "calcul mental"] }, (c, r) => {
    const q = int(r, 2, 15);
    void c;
    if (int(r, 0, 1) === 0) {
      const b0 = pick(r, [15, 25, 12, 35, 6, 8]), sc = pick(r, [10, 100]);
      const A = q * b0 * sc, B = b0 * sc;
      return {
        statement: `Calcule mentalement ${f(A)} : ${f(B)}.`,
        answer: num(q),
        hints: H("Le quotient ne change pas si on divise dividende et diviseur par le même nombre.", `Divise les deux nombres par ${sc}.`, `${f(A)} ÷ ${sc} = ${f(q * b0)} ; ${f(B)} ÷ ${sc} = ${b0}.`, `${q * b0} : ${b0}.`),
        solution: `${f(A)} : ${f(B)} = ${f(q * b0)} : ${b0} = ${q}.`,
      };
    }
    const d = pick(r, [0.06, 0.04, 0.5, 0.25, 0.2, 0.8, 0.12]);
    const A = round(q * d, 6);
    return {
      statement: `Calcule ${fr(A)} : ${fr(d)}.`,
      answer: num(q),
      hints: H("On divise un décimal par un décimal.", `Multiplie le dividende et le diviseur par ${d < 0.1 ? 100 : 10} pour obtenir un diviseur entier.`, "Le quotient ne change pas.", `${fr(A)} × ${d < 0.1 ? 100 : 10} = ${fr(round(A * (d < 0.1 ? 100 : 10), 6))}.`),
      solution: `${fr(A)} : ${fr(d)} = ${fr(round(A * (d < 0.1 ? 100 : 10), 6))} : ${fr(round(d * (d < 0.1 ? 100 : 10), 6))} = ${q}.`,
    };
  }, [{ id: "quotient-egal", label: "Quotients égaux" }]),
  mk("div-decimale", "Division", 3, { skill: "Diviser un décimal par un entier ou un décimal (valeur approchée)", ref: `${BOOK}, chap. 12 §3.1-3.2, ex. 3.a et 3.c (p. 174-176)`, kw: ["division", "décimal", "quotient au centième près", "quotient au dixième près"] }, (c, r) => {
    const b = int(r, 3, 12);
    const A = int(r, 100, 9999), da = int(r, 1, 2);
    const a = A / 10 ** da;
    const p = int(r, 1, 2);
    const q = Math.floor((A * 10 ** p) / (b * 10 ** da)) / 10 ** p;
    return {
      statement: c === "pur" ? `Calcule le quotient de ${fr(a)} par ${b} au ${p === 1 ? "dixième" : "centième"} près par défaut.` : `Un tissu de ${fr(a)} m est coupé en ${b} morceaux égaux. Quelle longueur (en m) a chaque morceau, au ${p === 1 ? "dixième" : "centième"} près par défaut ?`,
      answer: num(round(q, p), 0.0001),
      hints: H("On divise un décimal par un entier.", "On divise d'abord la partie entière, puis on met la virgule au quotient et on continue.", "Descends les chiffres un par un après la virgule.", `La partie entière ${Math.floor(a)} divisée par ${b} donne ${Math.floor(Math.floor(a) / b)}.`),
      solution: `${fr(a)} ÷ ${b} ≈ ${fr(round(q, p))} (par défaut).`,
    };
  }),

  // ================= Chapitre 13 : Fractions =================
  mk("frac-egales", "Fractions", 1, { skill: "Fractions égales : trouver un terme manquant", ref: `${BOOK}, chap. 13 §1.2, ex. 1.a et ex. 7-8 (p. 184, 191)`, kw: ["fractions égales", "numérateur", "dénominateur", "multiplier", "diviser"] }, (c, r) => {
    const a = int(r, 1, 9), b = int(r, a + 1, 12), k = int(r, 2, 9);
    void c;
    if (int(r, 0, 1) === 0) return {
      statement: `Complète : ${a}/${b} = □/${b * k}. Quel nombre faut-il écrire à la place de □ ?`,
      answer: num(a * k),
      hints: H("On cherche une fraction égale à " + a + "/" + b + ".", "On ne change pas une fraction en multipliant son numérateur et son dénominateur par le même nombre.", `${b} × ${k} = ${b * k} : par quel nombre a-t-on multiplié le dénominateur ?`, `Multiplie aussi ${a} par ${k}.`),
      solution: `${b} × ${k} = ${b * k}, donc ${a} × ${k} = ${a * k} : ${a}/${b} = ${a * k}/${b * k}.`,
    };
    return {
      statement: `Complète : ${a * k}/${b * k} = □/${b}. Quel nombre faut-il écrire à la place de □ ?`,
      answer: num(a),
      hints: H("On simplifie une fraction.", "On ne change pas une fraction en divisant son numérateur et son dénominateur par le même nombre.", `${b * k} ÷ ${k} = ${b}.`, `Divise aussi ${a * k} par ${k}.`),
      solution: `${b * k} ÷ ${k} = ${b}, donc ${a * k} ÷ ${k} = ${a} : ${a * k}/${b * k} = ${a}/${b}.`,
    };
  }, [{ id: "terme", label: "Terme manquant" }]),
  mk("frac-simplifier", "Fractions", 2, { skill: "Simplifier une fraction au maximum", ref: `${BOOK}, chap. 13 §1.3, ex. 1.b (p. 184) et ex. 9-12 (p. 191)`, kw: ["simplifier", "fraction irréductible", "diviseur commun"] }, (_c, r) => {
    let p = 0, q = 0;
    do { p = int(r, 1, 13); q = int(r, 2, 15); } while (p === q || gcd(p, q) !== 1);
    const k = pick(r, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
    const shown = `${p * k}/${q * k}`, good = `${p}/${q}`;
    const cand: string[] = [];
    for (const d of divisors(k)) if (d > 1 && d < k) cand.push(`${p * d}/${q * d}`);
    cand.push(`${p}/${q + 1}`, `${p + 1}/${q}`, `${p * k}/${q}`, `${p}/${q * k}`);
    const wrong = [...new Set(cand)].filter((x) => x !== good && x !== shown).slice(0, 3);
    return {
      statement: `Simplifie le plus possible la fraction ${shown}.`,
      answer: choice(r, [good, ...wrong], 0),
      hints: H("On cherche une fraction égale, avec des nombres plus petits.", "Cherche un diviseur commun au numérateur et au dénominateur.", "Recommence jusqu'à ce qu'il n'y ait plus de diviseur commun autre que 1.", `${p * k} et ${q * k} sont tous les deux des multiples de ${k}.`),
      solution: `${p * k} ÷ ${k} = ${p} et ${q * k} ÷ ${k} = ${q} : ${shown} = ${good}. Cette fraction ne peut plus être simplifiée (pgcd = 1).`,
    };
  }, QCM),
  mk("frac-decimales", "Fractions", 2, { skill: "Fractions décimales et nombres décimaux", ref: `${BOOK}, chap. 13 §1.4, ex. 1.c-1.e (p. 185-186) et ex. 13-14 (p. 191)`, kw: ["fraction décimale", "décimal", "dénominateur 10", "100", "1000"] }, (c, r) => {
    const dg = int(r, 1, 3), X = int(r, 11, 9999), x = X / 10 ** dg, den = 10 ** dg;
    void c;
    if (int(r, 0, 1) === 0) return {
      statement: `Complète : ${fd(x, dg)} = □/${f(den)}. Quel nombre faut-il écrire à la place de □ ?`,
      answer: num(X),
      hints: H("On écrit un décimal sous forme de fraction décimale.", `Le dénominateur ${f(den)} correspond à ${dg} chiffre${dg > 1 ? "s" : ""} après la virgule.`, "Le numérateur est le nombre sans la virgule.", `Retire la virgule de ${fd(x, dg)}.`),
      solution: `${fd(x, dg)} = ${f(X)}/${f(den)}.`,
    };
    return {
      statement: `Écris ${f(X)}/${f(den)} sous forme de nombre décimal.`,
      answer: num(x, 0.0000001),
      hints: H("Une fraction décimale a pour dénominateur 10, 100, 1 000…", `Diviser par ${f(den)} revient à déplacer la virgule de ${dg} rang${dg > 1 ? "s" : ""} vers la gauche.`, `Place la virgule de façon à avoir ${dg} chiffre${dg > 1 ? "s" : ""} après la virgule.`, `${f(X)} : ${f(den)}.`),
      solution: `${f(X)}/${f(den)} = ${fd(x, dg)}.`,
    };
  }, [{ id: "decimale", label: "Fraction décimale" }]),
  mk("frac-somme-diff", "Fractions", 2, { skill: "Additionner et soustraire des fractions de même dénominateur", ref: `${BOOK}, chap. 13 §2.1-2.2, ex. 2.a et 2.b (p. 186-188) et ex. 15-16 (p. 191)`, kw: ["somme de fractions", "différence de fractions", "même dénominateur", "additionner"] }, (_c, r) => {
    const d = int(r, 3, 15);
    let a = int(r, 1, d + 3), b = int(r, 1, d + 3);
    const add = int(r, 0, 1) === 0;
    if (!add && a === b) b = a + 1;
    const lo = Math.max(a, b), hi = Math.min(a, b);
    const x = add ? a : lo, y = add ? b : hi, res = add ? a + b : lo - hi;
    const good = `${res}/${d}`;
    const wrongs = [...new Set([`${res}/${2 * d}`, `${x * y}/${d}`, `${res}/${d + d + 1}`, `${x + y}/${d}`, `${Math.abs(x - y) + 1}/${d}`, `${res + 1}/${d}`, `${res + 2}/${d}`].filter((s) => s !== good))].slice(0, 3);
    return {
      statement: `Calcule ${x}/${d} ${add ? "+" : "−"} ${y}/${d}.`,
      answer: choice(r, [good, ...wrongs], 0),
      hints: H("Les deux fractions ont le même dénominateur.", `On ${add ? "additionne" : "soustrait"} les numérateurs et on garde le dénominateur.`, "Le dénominateur ne change pas.", `${x} ${add ? "+" : "−"} ${y} = ${res}.`),
      solution: `${x}/${d} ${add ? "+" : "−"} ${y}/${d} = (${x} ${add ? "+" : "−"} ${y})/${d} = ${good}.`,
    };
  }, QCM),
  mk("frac-entier-fois", "Fractions", 2, { skill: "Produit d'un entier par une fraction", ref: `${BOOK}, chap. 13 §2.3, ex. 2.c et ex. 17 (p. 189, 191)`, kw: ["produit", "entier par une fraction", "multiplier une fraction"] }, (_c, r) => {
    const n = int(r, 2, 9), a = int(r, 1, 12), d = int(r, 2, 13);
    const good = `${n * a}/${d}`;
    const wrongs = [...new Set([`${n * a}/${n * d}`, `${n + a}/${d}`, `${a}/${n * d}`, `${n * a}/${d * d}`].filter((s) => s !== good))].slice(0, 3);
    return {
      statement: `Calcule ${n} × ${a}/${d}.`,
      answer: choice(r, [good, ...wrongs], 0),
      hints: H("On multiplie un entier par une fraction.", `${n} × ${a}/${d} signifie ${a}/${d} répété ${n} fois.`, "On multiplie le numérateur par l'entier et on garde le dénominateur.", `${n} × ${a} = ${n * a}.`),
      solution: `${n} × ${a}/${d} = (${n} × ${a})/${d} = ${good}.`,
    };
  }, QCM),
  mk("frac-quantite", "Fractions", 2, { skill: "Prendre une fraction d'une quantité ; fraction restante", ref: `${BOOK}, chap. 13 §2.3 « Prendre une fraction de… », ex. 2.d (p. 189) et ex. 21-23, 41-42 (p. 192-194)`, kw: ["fraction d'une quantité", "prendre une fraction", "fraction restante", "reste"] }, (c, r) => {
    const k = int(r, 0, 2);
    const d = pick(r, [3, 4, 5, 6, 8, 9, 10]);
    if (k === 0) {
      const a = int(r, 1, d - 1), unit = int(r, 5, 120) * (d <= 5 ? 20 : 10), V = unit * d;
      return {
        statement: c === "pur" ? `Calcule ${a}/${d} de ${f(V)}.` : `Un ouvrier gagne ${f(V)} F par mois. Son loyer représente les ${a}/${d} de son salaire. Quel est le loyer (en F) ?`,
        answer: num((V / d) * a),
        hints: H("On cherche une fraction d'une quantité.", `Divise la quantité par ${d}.`, `Multiplie ensuite par ${a}.`, `${f(V)} ÷ ${d} = ${f(V / d)}.`),
        solution: `${f(V)} ÷ ${d} = ${f(V / d)} ; ${f(V / d)} × ${a} = ${f((V / d) * a)}.`,
      };
    }
    if (k === 1) {
      const a = int(r, 1, Math.floor(d / 2)), b = int(r, 1, Math.floor((d - a) / 2) || 1);
      const S = d * pick(r, [10, 20, 30, 50, 100]);
      const rest = S * (d - a - b) / d;
      return {
        statement: c === "pur" ? `Une somme S = ${f(S)} est partagée : on en prend ${a}/${d}, puis ${b}/${d}. Quelle quantité reste-t-il ?` : `${who(r)} a ${f(S)} F. Les ${a}/${d} de cette somme servent à acheter des cahiers, puis les ${b}/${d} un cartable. Combien reste-t-il (en F) ?`,
        answer: num(rest),
        hints: H("On cherche ce qui reste après deux dépenses.", "Additionne d'abord les deux fractions dépensées.", `Fraction dépensée : (${a} + ${b})/${d}. Fraction restante : 1 − cela.`, `Fraction restante : ${d - a - b}/${d}.`),
        solution: `Dépensé : ${a}/${d} + ${b}/${d} = ${a + b}/${d}. Reste : ${d - a - b}/${d} de ${f(S)} = ${f(S / d)} × ${d - a - b} = ${f(rest)}.`,
      };
    }
    const m = pick(r, [5, 10, 15, 20, 30, 40, 45]);
    const g = gcd(m, 60), good = `${m / g}/${60 / g}`;
    const wrongs = [...new Set([`${m}/100`, `1/${m}`, `${60 / g}/${m / g}`, `${m}/${60 + m}`].filter((s) => s !== good))].slice(0, 3);
    return {
      statement: `${m} minutes représentent quelle fraction d'une heure (simplifiée au maximum) ?`,
      answer: choice(r, [good, ...wrongs], 0),
      hints: H("Une heure compte 60 minutes.", `La fraction est ${m}/60.`, "Simplifie cette fraction.", `Divise ${m} et 60 par ${g}.`),
      solution: `${m}/60 = ${good}.`,
    };
  }),

  // ================= Chapitre 14 : Proportionnalité =================
  mk("prop-situation", "Proportionnalité", 1, { skill: "Reconnaître une situation de proportionnalité", ref: `${BOOK}, chap. 14 §1.2, ex. 1.a (p. 197) et ex. 1 (p. 206)`, kw: ["proportionnalité", "situation", "tableau", "proportionnel"] }, (_c, r) => {
    const yes = [
      "Le périmètre d'un carré et la longueur de son côté",
      "Le prix à payer et le nombre de cahiers achetés (même prix pour chaque cahier)",
      "La consommation d'essence d'une voiture et la distance parcourue à vitesse constante",
      "La distance parcourue et la durée à vitesse constante",
      "Le prix d'un tissu et sa longueur (même prix pour chaque mètre)",
      "La masse de riz achetée et son prix (même prix pour chaque kilogramme)",
      "La quantité de farine et le nombre de gâteaux fabriqués avec la même recette",
      "Le périmètre d'un cercle et son diamètre",
    ];
    const no = [
      "La taille d'une personne et son âge",
      "L'âge d'un enfant et sa pointure",
      "Le nombre de personnes dans une classe et la température dehors",
      "L'aire d'un carré et la longueur de son côté",
      "L'aire d'un disque et la longueur de son rayon",
      "La hauteur d'un arbre et son âge",
      "La masse d'une personne et son âge",
      "Le numéro d'un élève sur la liste et sa note",
    ];
    if (int(r, 0, 1) === 0) {
      const g = pick(r, yes);
      return {
        statement: "Laquelle de ces situations est une situation de proportionnalité ?",
        answer: choice(r, [g, ...shuffle(r, no).slice(0, 3)], 0),
        hints: H("Deux grandeurs sont proportionnelles si l'on passe de l'une à l'autre en multipliant par un même nombre.", "Si l'une double, l'autre double aussi.", "Teste avec un exemple : une personne de 10 ans fait-elle deux fois la taille d'un enfant de 5 ans ?", "Cherche le coefficient qui reste le même."),
        solution: `${g} : on passe d'une grandeur à l'autre en multipliant par un même nombre (le coefficient de proportionnalité).`,
      };
    }
    const g = pick(r, no);
    return {
      statement: "Laquelle de ces situations n'est PAS une situation de proportionnalité ?",
      answer: choice(r, [g, ...shuffle(r, yes).slice(0, 3)], 0),
      hints: H("On cherche l'intrus.", "Deux grandeurs proportionnelles : si l'une double, l'autre double aussi.", "Teste avec un exemple simple (doubler une des grandeurs).", "Cherche la situation où le doublement ne marche pas."),
      solution: `${g} : on ne passe pas d'une grandeur à l'autre en multipliant par un même nombre. Ce n'est pas une situation de proportionnalité.`,
    };
  }, QCM),
  mk("prop-regle-trois", "Proportionnalité", 2, { skill: "Calculer avec un tableau de proportionnalité (coefficient, prix unitaire)", ref: `${BOOK}, chap. 14 §2.1-2.2, activités p. 198-199 et ex. 3-6 (p. 206)`, kw: ["coefficient de proportionnalité", "prix unitaire", "règle de trois", "tableau"] }, (c, r) => {
    const u = pick(r, [25, 30, 40, 45, 50, 60, 75, 120]);
    const n1 = pick(r, [4, 5, 6, 8, 10, 12]), n2 = pick(r, [3, 7, 9, 15, 18, 20, 25]);
    const p1 = u * n1, p2 = u * n2;
    const inv = int(r, 0, 1) === 1;
    const s = who(r);
    const obj = c === "pur" ? "objet" : "galette";
    const ob = (n: number) => `${n} ${obj}${n > 1 ? "s" : ""}`;
    if (!inv) return {
      statement: c === "pur" ? `Dans un tableau de proportionnalité, ${ob(n1)} coûtent ${f(p1)} F. Combien coûtent ${ob(n2)} (en F) ?` : `${ob(n1)} coûtent ${f(p1)} F. ${s} achète ${ob(n2)}. Quel est le prix à payer (en F) ?`,
      answer: num(p2),
      hints: H("Le prix est proportionnel au nombre d'articles.", `Cherche le prix d'un article (le coefficient) : ${f(p1)} ÷ ${n1}.`, `Prix d'un article : ${f(u)} F. Multiplie par ${n2}.`, `${f(u)} × ${n2}.`),
      solution: `Prix d'un article : ${f(p1)} ÷ ${n1} = ${f(u)} F. ${ob(n2)} : ${f(u)} × ${n2} = ${f(p2)} F.`,
    };
    return {
      statement: c === "pur" ? `Dans un tableau de proportionnalité, ${ob(n1)} coûtent ${f(p1)} F. Combien d'objets peut-on acheter avec ${f(p2)} F ?` : `${ob(n1)} coûtent ${f(p1)} F. ${s} dispose de ${f(p2)} F. Combien de galettes peut-on acheter ?`,
      answer: num(n2),
      hints: H("Le nombre d'articles est proportionnel à la somme dépensée.", `Cherche d'abord le prix d'un article : ${f(p1)} ÷ ${n1}.`, `Prix d'un article : ${f(u)} F. Combien de fois ${f(u)} dans ${f(p2)} ?`, `${f(p2)} ÷ ${f(u)}.`),
      solution: `Prix d'un article : ${f(p1)} ÷ ${n1} = ${f(u)} F. Nombre d'articles : ${f(p2)} ÷ ${f(u)} = ${n2}.`,
    };
  }),
  mk("prop-additive", "Proportionnalité", 2, { skill: "Utiliser la somme dans un tableau de proportionnalité", ref: `${BOOK}, chap. 14 §3.1-3.3 (p. 201-203) et ex. 3.b-3.c, 14 (p. 207)`, kw: ["propriété additive", "somme", "tableau de proportionnalité", "mentalement"] }, (c, r) => {
    const u = pick(r, [15, 20, 25, 30, 40, 50, 60]);
    const a = int(r, 2, 8), b = int(r, 2, 8);
    void c;
    return {
      statement: `Dans un tableau de proportionnalité, ${a} objets coûtent ${f(u * a)} F et ${b} objets coûtent ${f(u * b)} F. Sans calculer le prix d'un objet, combien coûtent ${a + b} objets (en F) ?`,
      answer: num(u * (a + b)),
      hints: H("Dans un tableau de proportionnalité, les nombres d'une colonne s'additionnent comme ceux de l'autre.", `${a + b} = ${a} + ${b}.`, `Le prix de ${a + b} objets est la somme des prix de ${a} objets et de ${b} objets.`, `${f(u * a)} + ${f(u * b)}.`),
      solution: `${a + b} = ${a} + ${b}, donc le prix est ${f(u * a)} + ${f(u * b)} = ${f(u * (a + b))} F.`,
    };
  }, [{ id: "somme", label: "Propriété additive" }]),
  mk("prop-pourcentage", "Proportionnalité", 2, { skill: "Pourcentages : part, réduction, taxe", ref: `${BOOK}, chap. 14 §2.3 et ex. 7-13 (p. 199, 206-207)`, kw: ["pourcentage", "remise", "réduction", "TVA", "taxe", "%"] }, (c, r) => {
    const k = int(r, 0, 2);
    if (k === 0) {
      const p = pick(r, [5, 10, 20, 25, 30, 32, 40, 50]), Q = pick(r, [20, 50, 100, 150, 200, 250, 400, 500]);
      return {
        statement: c === "pur" ? `Calcule ${p} % de ${Q}.` : `Une crème contient ${p} % de beurre. Quelle masse de beurre y a-t-il dans ${Q} g de crème (en g) ?`,
        answer: num(round((Q * p) / 100, 4), 0.001),
        hints: H("On cherche une part exprimée en pourcentage.", `${p} % signifie ${p} pour 100.`, `Calcule Q × ${p} ÷ 100.`, `${Q} × ${p} = ${Q * p}.`),
        solution: `${Q} × ${p} ÷ 100 = ${fr(round((Q * p) / 100, 4))}.`,
      };
    }
    if (k === 1) {
      const p = pick(r, [10, 15, 20, 25, 30]), P = pick(r, [8000, 10000, 12000, 15000, 20000, 25000, 40000]);
      const ans = P - (P * p) / 100;
      return {
        statement: c === "pur" ? `Un prix de ${f(P)} F baisse de ${p} %. Quel est le nouveau prix (en F) ?` : `Un magasin affiche : « Remise de ${p} % sur les anciens prix ». Un vêtement valait ${f(P)} F. Quel est son nouveau prix (en F) ?`,
        answer: num(ans),
        hints: H("On enlève une partie du prix.", `Calcule d'abord la remise : ${p} % de ${f(P)}.`, "Nouveau prix = ancien prix − remise.", `${p} % de ${f(P)} = ${f((P * p) / 100)}.`),
        solution: `Remise : ${f(P)} × ${p} ÷ 100 = ${f((P * p) / 100)} ; ${f(P)} − ${f((P * p) / 100)} = ${f(ans)}.`,
      };
    }
    const HT = pick(r, [40000, 56000, 60000, 80000, 100000, 120000]);
    const tva = (HT * 25) / 100;
    return {
      statement: c === "pur" ? `Le prix hors taxe (HT) est ${f(HT)} F. La TVA est de 25 % du prix HT. Quel est le prix toutes taxes comprises (TTC) en F ?` : `Une réparation est facturée ${f(HT)} F hors taxe. La TVA de 25 % s'ajoute. Quel montant TTC doit-on payer (en F) ?`,
      answer: num(HT + tva),
      hints: H("Le TTC est le prix HT plus la taxe.", "La taxe est 25 % du prix HT.", "Calcule d'abord la TVA.", `25 % de ${f(HT)} = ${f(HT)} ÷ 4 = ${f(tva)}.`),
      solution: `TVA : ${f(HT)} × 25 ÷ 100 = ${f(tva)} ; TTC = ${f(HT)} + ${f(tva)} = ${f(HT + tva)} F.`,
    };
  }),
  mk("prop-echelle", "Proportionnalité", 3, { skill: "Échelles : de la carte au terrain et inversement", ref: `${BOOK}, chap. 14 §4, ex. 4.c (p. 205) et ex. 19-22 (p. 207-208)`, kw: ["échelle", "carte", "plan", "distance réelle", "1/250 000"] }, (c, r) => {
    const E = pick(r, [50000, 100000, 250000, 500000]);
    const cm = dec(r, 2, 15, 1);
    const km = round((cm * E) / 100000, 4);
    void c;
    if (int(r, 0, 1) === 0) return {
      statement: `Sur une carte à l'échelle 1/${f(E)}, deux villes sont distantes de ${fr(cm)} cm. Quelle est la distance réelle entre ces deux villes (en km) ?`,
      answer: num(km, 0.001),
      hints: H("L'échelle relie la carte à la réalité.", `1 cm sur la carte correspond à ${f(E)} cm sur le terrain.`, "Multiplie la mesure sur la carte par l'échelle, puis convertis de cm en km (100 000 cm = 1 km).", `${fr(cm)} × ${f(E)} = ${f(cm * E)} cm.`),
      solution: `${fr(cm)} × ${f(E)} = ${f(round(cm * E, 2))} cm = ${fr(km)} km.`,
    };
    const dkm = pick(r, [10, 20, 25, 40, 50, 60, 75, 100, 120]);
    const dc = round((dkm * 100000) / E, 4);
    return {
      statement: `Une carte est à l'échelle 1/${f(E)}. Deux villes sont distantes de ${dkm} km en réalité. Quelle distance (en cm) les sépare sur la carte ?`,
      answer: num(dc, 0.01),
      hints: H("On passe de la réalité à la carte.", "Convertis d'abord les km en cm : 1 km = 100 000 cm.", `On divise par ${f(E)}.`, `${dkm} km = ${f(dkm * 100000)} cm.`),
      solution: `${dkm} km = ${f(dkm * 100000)} cm ; ${f(dkm * 100000)} ÷ ${f(E)} = ${fr(dc)} cm.`,
    };
  }),

  // ================= Chapitre 15 : Nombres décimaux relatifs =================
  mk("rel-oppose", "Nombres décimaux relatifs", 1, { skill: "Opposé d'un nombre relatif", ref: `${BOOK}, chap. 15 §2.1 (p. 214) et ex. 4 (p. 219)`, kw: ["opposé", "relatif", "signe", "abscisse"] }, (c, r) => {
    const x = int(r, 0, 9) === 0 ? 0 : (int(r, 0, 1) === 0 ? -1 : 1) * dec(r, 1, 150, int(r, 0, 2));
    void c;
    return {
      statement: `Quel est l'opposé du nombre ${sg(x)} ?`,
      answer: num(round(-x, 6)),
      hints: H("Deux nombres opposés sont symétriques par rapport à l'origine.", "Ils ont la même distance à zéro mais des signes contraires.", "Change le signe du nombre.", x === 0 ? "L'opposé de 0 est 0." : `L'opposé de ${sg(x)} est ${sg(-x)}.`),
      solution: x === 0 ? "L'opposé de 0 est 0." : `L'opposé de ${sg(x)} est ${sg(-x)}.`,
    };
  }, [{ id: "oppose", label: "Opposé" }]),
  mk("rel-somme", "Nombres décimaux relatifs", 2, { skill: "Somme de deux nombres entiers relatifs", ref: `${BOOK}, chap. 15 §3, ex. 3.b (p. 218) et ex. 5-7, 13-15 (p. 219-220)`, kw: ["somme", "relatifs", "positifs", "négatifs", "addition de relatifs"] }, (c, r) => {
    let a = 0, b = 0;
    do { a = int(r, -30, 30); b = int(r, -30, 30); } while (a === 0 || b === 0);
    const s = a + b;
    if (c === "pur") return {
      statement: `Calcule ${sg(a)} + ${sg(b)}.`,
      answer: num(s),
      hints: H("On additionne deux nombres relatifs.", a * b > 0 ? "Même signe : on additionne les distances à zéro et on garde le signe." : "Signes contraires : on soustrait les distances à zéro et on garde le signe de celui qui est le plus loin de zéro.", `Distances à zéro : ${Math.abs(a)} et ${Math.abs(b)}.`, a * b > 0 ? `${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}.` : `${Math.max(Math.abs(a), Math.abs(b))} − ${Math.min(Math.abs(a), Math.abs(b))} = ${Math.abs(Math.abs(a) - Math.abs(b))}.`),
      solution: `${sg(a)} + ${sg(b)} = ${sg(s)}.`,
    };
    const x = Math.abs(a), y = Math.abs(b);
    return {
      statement: `Pour suivre Yago sur un mât glissant, son frère Doro note un nombre positif quand Yago monte et un nombre négatif quand il descend (la valeur est la hauteur en mètres). Yago ${a > 0 ? "monte" : "descend"} de ${x} m, puis ${b > 0 ? "monte" : "descend"} de ${y} m. Quel nombre relatif résume son déplacement total ?`,
      answer: num(s),
      hints: H("Chaque déplacement est un nombre relatif.", "Monter = nombre positif ; descendre = nombre négatif.", `Les deux déplacements sont ${sg(a)} et ${sg(b)}.`, `Calcule ${sg(a)} + ${sg(b)}.`),
      solution: `${sg(a)} + ${sg(b)} = ${sg(s)}.`,
    };
  }),
  mk("rel-ensembles", "Nombres décimaux relatifs", 2, { skill: "Appartenance à ℕ, ℤ, D (entiers naturels, relatifs, décimaux relatifs)", ref: `${BOOK}, chap. 15 §1.2, ex. 1.d-1.e (p. 212) et ex. 3 (p. 219)`, kw: ["ℕ", "ℤ", "ensemble", "entier relatif", "décimal relatif", "appartient"] }, (_c, r) => {
    const cases: { v: string; best: string }[] = [
      { v: "+7", best: "ℕ (entiers naturels)" }, { v: "0", best: "ℕ (entiers naturels)" }, { v: "12", best: "ℕ (entiers naturels)" }, { v: "+345", best: "ℕ (entiers naturels)" }, { v: "2 024", best: "ℕ (entiers naturels)" }, { v: "+93", best: "ℕ (entiers naturels)" },
      { v: "−56", best: "ℤ (entiers relatifs) mais pas ℕ" }, { v: "−14", best: "ℤ (entiers relatifs) mais pas ℕ" }, { v: "−1 993", best: "ℤ (entiers relatifs) mais pas ℕ" }, { v: "−343", best: "ℤ (entiers relatifs) mais pas ℕ" }, { v: "−12", best: "ℤ (entiers relatifs) mais pas ℕ" }, { v: "−124", best: "ℤ (entiers relatifs) mais pas ℕ" },
      { v: "−14,5", best: "D (décimaux relatifs) mais pas ℤ" }, { v: "+0,5", best: "D (décimaux relatifs) mais pas ℤ" }, { v: "12,75", best: "D (décimaux relatifs) mais pas ℤ" }, { v: "−17,2", best: "D (décimaux relatifs) mais pas ℤ" }, { v: "3,14", best: "D (décimaux relatifs) mais pas ℤ" }, { v: "−4,75", best: "D (décimaux relatifs) mais pas ℤ" },
    ];
    const it = pick(r, cases);
    const opts = ["ℕ (entiers naturels)", "ℤ (entiers relatifs) mais pas ℕ", "D (décimaux relatifs) mais pas ℤ"];
    return {
      statement: `Quelle est la description la plus précise du nombre ${it.v} ?`,
      answer: choice(r, opts, opts.indexOf(it.best)),
      hints: H("On range le nombre dans le plus petit ensemble possible.", "ℕ ⊂ ℤ ⊂ D : tout entier naturel est un entier relatif, tout entier relatif est un décimal relatif.", "Regarde le signe, puis s'il y a une virgule avec des chiffres non nuls.", "Un nombre négatif n'est pas un entier naturel."),
      solution: `${it.v} est ${it.best}.`,
    };
  }, QCM),
  mk("rel-bilan", "Nombres décimaux relatifs", 2, { skill: "Un bilan est un nombre relatif (goal-average, recettes − dépenses)", ref: `${BOOK}, chap. 15 §1.1 (p. 210) et §3.1 (p. 216)`, kw: ["bilan", "goal average", "recettes", "dépenses", "relatif", "différence"] }, (c, r) => {
    const a = int(r, 0, 40), b = int(r, 0, 40);
    void c;
    if (int(r, 0, 1) === 0) return {
      statement: `Une équipe de football a marqué ${a} buts et encaissé ${b} buts. Quel est son goal différentiel (buts marqués − buts encaissés), écrit comme un nombre relatif ?`,
      answer: num(a - b),
      hints: H("Le goal différentiel est une différence.", "Buts marqués − buts encaissés.", "Le résultat est positif si l'équipe a marqué plus qu'elle n'a encaissé, négatif sinon.", `${a} − ${b}.`),
      solution: `${a} − ${b} = ${f(a - b)}.`,
    };
    return {
      statement: `Un commerçant a eu ${a} milliers de F de recettes et ${b} milliers de F de dépenses dans la journée. Quel est son bilan (recettes − dépenses), écrit comme un nombre relatif en milliers de F ?`,
      answer: num(a - b),
      hints: H("Le bilan est une différence.", "Recettes − dépenses.", "Positif si le commerçant gagne de l'argent, négatif s'il en perd.", `${a} − ${b}.`),
      solution: `${a} − ${b} = ${f(a - b)}.`,
    };
  }, [{ id: "bilan", label: "Bilan relatif" }]),
);

