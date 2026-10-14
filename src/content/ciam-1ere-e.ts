// CIAM Première S : généralités sur les fonctions et dénombrement.
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf, WHO } from "./ciam-kit";

const mk = ciam("1ere", "ciam1");
const BOOK = "CIAM 1ère S";
const GF = "Généralités sur les fonctions — série C";
const DN = "Dénombrement — série C";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const nz = (r: () => number, lo: number, hi: number) => { let v = 0; while (v === 0) v = lo + Math.floor(r() * (hi - lo + 1)); return v; };
const term = (a: number, v: string, first: boolean) => {
  if (a === 0) return "";
  const m = Math.abs(a) === 1 && v !== "" ? "" : String(Math.abs(a));
  return first ? `${a < 0 ? "−" : ""}${m}${v}` : ` ${a < 0 ? "−" : "+"} ${m}${v}`;
};
const lin = (a: number, b: number) => `${term(a, "x", true)}${term(b, "", a === 0)}`;
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const A = (n: number, p: number) => { let v = 1; for (let i = 0; i < p; i++) v *= n - i; return v; };
const C = (n: number, p: number) => A(n, p) / fact(p);

export const T1E: Template[] = [
  // ===== Chapitre 9 : Fonctions =====
  mk("gf-composition", GF, 2, { skill: "Composée de deux fonctions : (g∘f)(a) et (f∘g)(a)", ref: `${BOOK}, chap. 9 §1.2 (p. 167) et ex. 1.e (p. 172)`, kw: ["composée", "g∘f", "f∘g", "image", "fonction"] }, (c, r) => {
    const a1 = nz(r, -3, 3), b1 = int(r, -5, 5), a2 = nz(r, -3, 3), b2 = int(r, -5, 5);
    const x = int(r, -4, 4);
    const fx = a1 * x + b1;
    const gfx = a2 * fx + b2;
    const gx = a2 * x + b2;
    const fgx = a1 * gx + b1;
    const first = int(r, 0, 1) === 0;
    return { statement: `f(x) = ${lin(a1, b1)} et g(x) = ${lin(a2, b2)}. Calcule ${first ? `(g∘f)(${S(x)})` : `(f∘g)(${S(x)})`}.`, answer: num(first ? gfx : fgx), hints: H(first ? "(g∘f)(x) = g(f(x)) : on applique f d'abord." : "(f∘g)(x) = f(g(x)) : on applique g d'abord.", first ? `f(${S(x)}) = ${S(fx)}.` : `g(${S(x)}) = ${S(gx)}.`, first ? `Calcule g(${S(fx)}).` : `Calcule f(${S(gx)}).`, "Remplace et calcule."), solution: first ? `f(${S(x)}) = ${S(fx)} puis g(${S(fx)}) = ${S(gfx)}.` : `g(${S(x)}) = ${S(gx)} puis f(${S(gx)}) = ${S(fgx)}.` };
  }),
  mk("gf-operations", GF, 1, { skill: "Somme, produit, quotient de fonctions : valeur en un point", ref: `${BOOK}, chap. 9 §3.1 (p. 173)`, kw: ["somme de fonctions", "produit", "quotient", "(f+g)(x)", "(f/g)(x)"] }, (c, r) => {
    const a1 = nz(r, -3, 3), b1 = int(r, -4, 4), a2 = nz(r, -3, 3), b2 = int(r, -4, 4);
    const x = int(r, -4, 4);
    const fx = a1 * x + b1, gx = a2 * x + b2;
    const op = pick(r, ["+", "×", "÷"] as const);
    const okDiv = gx !== 0;
    const o = op === "÷" && !okDiv ? "+" : op;
    const v = o === "+" ? fx + gx : o === "×" ? fx * gx : fx / gx;
    const label = o === "+" ? "(f + g)" : o === "×" ? "(f × g)" : "(f/g)";
    return { statement: `f(x) = ${lin(a1, b1)} et g(x) = ${lin(a2, b2)}. Calcule ${label}(${S(x)}) (arrondi au centième).`, answer: num(round(v, 2), 0.01), hints: H(o === "+" ? "(f + g)(x) = f(x) + g(x)." : o === "×" ? "(fg)(x) = f(x) × g(x)." : "(f/g)(x) = f(x)/g(x), si g(x) ≠ 0.", `f(${S(x)}) = ${S(fx)}.`, `g(${S(x)}) = ${S(gx)}.`, "Combine les deux valeurs."), solution: `f(${S(x)}) = ${S(fx)} et g(${S(x)}) = ${S(gx)}, donc ${label}(${S(x)}) = ${S(round(v, 2))}.` };
  }),
  mk("gf-reciproque", GF, 2, { skill: "Bijection réciproque d'une fonction affine", ref: `${BOOK}, chap. 9 §2.2 (p. 170-171) et ex. 2.d (p. 172)`, kw: ["bijection", "réciproque", "f⁻¹", "fonction affine"] }, (c, r) => {
    const a = nz(r, -4, 4), b = int(r, -6, 6);
    const y = int(r, -8, 8);
    const x = (y - b) / a;
    return { statement: `f est la fonction définie sur ℝ par f(x) = ${lin(a, b)}. C'est une bijection de ℝ vers ℝ. Quelle est la valeur de f⁻¹(${S(y)}) ? (arrondi au centième)`, answer: num(round(x, 2), 0.01), hints: H("f⁻¹(y) est l'unique x tel que f(x) = y.", `Résous ${lin(a, b)} = ${S(y)}.`, `${a}x = ${S(y - b)}.`, "Divise par a."), solution: `f(x) = ${S(y)} équivaut à x = ${S(y - b)}/${P(a)} ≈ ${S(round(x, 2))}.` };
  }),
  mk("gf-domaine", GF, 2, { skill: "Ensemble de définition : valeurs interdites d'un quotient", ref: `${BOOK}, chap. 9 §1.2 et ex. 1.d (p. 167 et 172)`, kw: ["ensemble de définition", "dénominateur non nul", "valeur interdite", "domaine"] }, (c, r) => {
    const k = int(r, 1, 6);
    const t = int(r, 0, 2);
    if (t === 0) return { statement: `Combien de réels n'appartiennent pas à l'ensemble de définition de f(x) = (x + 1)/(x² − ${k * k}) ?`, answer: num(2), hints: H("Le dénominateur doit être non nul.", `x² − ${k * k} = 0 ⇔ x² = ${k * k}.`, `x = ${k} ou x = −${k}.`, "Compte les valeurs interdites."), solution: `x² = ${k * k} donne x = ${k} ou x = −${k} : 2 valeurs interdites.` };
    if (t === 1) return { statement: `Quel est le plus petit entier de l'ensemble de définition de f(x) = √(x − ${k}) ?`, answer: num(k), hints: H("Le radicande doit être positif ou nul.", `x − ${k} ≥ 0.`, `x ≥ ${k}.`, "Prends le plus petit entier."), solution: `D = [${k} ; +∞[ : le plus petit entier est ${k}.` };
    return { statement: `Combien de réels n'appartiennent pas à l'ensemble de définition de f(x) = 1/((x − ${k})(x + ${k + 1})) ?`, answer: num(2), hints: H("Un produit est nul si et seulement si l'un de ses facteurs est nul.", `x − ${k} = 0 ou x + ${k + 1} = 0.`, `x = ${k} ou x = −${k + 1}.`, "Compte."), solution: `Valeurs interdites : ${k} et −${k + 1}, soit 2 réels.` };
  }),
  mk("gf-cours", GF, 1, { skill: "Fonctions : injection, surjection, bijection, restriction, composition", ref: `${BOOK}, chap. 9 §1-2 (p. 166-171)`, kw: ["injective", "surjective", "bijective", "restriction", "prolongement", "composée"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Une application f de E vers F est injective si :", good: "tout élément de F a au plus un antécédent par f", bad: ["tout élément de F a au moins un antécédent", "f(E) = E", "f est la fonction identique"], why: "Définition du manuel (§2.1)." },
      { q: "Une application f de E vers F est surjective si :", good: "tout élément de F a au moins un antécédent par f", bad: ["tout élément de F a au plus un antécédent", "E = F", "f est croissante"], why: "Définition du manuel : surjective si f(E) = F." },
      { q: "Une application est bijective si et seulement si elle est :", good: "injective et surjective", bad: ["injective ou surjective", "croissante", "continue"], why: "Propriété du manuel (§2.2)." },
      { q: "f : ℝ → ℝ, x ↦ x² est-elle injective ?", good: "Non : 1 et −1 ont la même image", bad: ["Oui, elle est même bijective", "Oui, car x² ≥ 0", "On ne peut pas savoir"], why: "f(1) = f(−1) = 1 avec 1 ≠ −1 : f n'est pas injective sur ℝ." },
      { q: "f : ℝ₊ → ℝ₊, x ↦ x² est-elle bijective ?", good: "Oui, de bijection réciproque x ↦ √x", bad: ["Non, elle n'est pas injective", "Non, elle n'est pas surjective", "Oui, de bijection réciproque x ↦ x²"], why: "Exemple du manuel (§2.2) : pour x, y ≥ 0, y = x² ⇔ x = √y." },
      { q: "Que vaut (g∘f)⁻¹ pour deux bijections f et g ?", good: "f⁻¹ ∘ g⁻¹", bad: ["g⁻¹ ∘ f⁻¹", "f ∘ g", "(f⁻¹)(g⁻¹)"], why: "Propriété du manuel : (g∘f)⁻¹ = f⁻¹ ∘ g⁻¹." },
      { q: "La composition des fonctions est-elle commutative (g∘f = f∘g) ?", good: "Non, en général g∘f ≠ f∘g", bad: ["Oui, toujours", "Oui pour les fonctions affines", "On ne sait pas"], why: "Exemple du manuel (§1.2) : g∘f ≠ f∘g. Elle est en revanche associative." },
      { q: "g est la restriction de f à une partie E' de son ensemble de définition. Que dit-on de f ?", good: "f est un prolongement de g", bad: ["f est une bijection", "f est la réciproque de g", "f est la composée de g"], why: "Définition du manuel (§1.1)." },
    ];
    return qcmOf(r, pool, "Reviens aux définitions du §2.");
  }, QCM),

  // ===== Chapitre 11 : Dénombrement =====
  mk("de-puplets", DN, 1, { skill: "Nombre de p-uplets : nᵖ", ref: `${BOOK}, chap. 11 §3.1 (p. 211-212)`, kw: ["p-uplets", "nᵖ", "code", "dénombrement", "avec répétition"] }, (c, r) => {
    const n = pick(r, [2, 3, 4, 5, 6, 10]), p = int(r, 2, 5);
    const w = pick(r, WHO);
    const sit = c === "situation";
    return { statement: sit ? `Le code du cadenas de ${w} est formé de ${p} chiffres choisis parmi ${n} chiffres possibles, un même chiffre pouvant se répéter. Combien de codes différents existe-t-il ?` : `Combien y a-t-il de ${p}-uplets d'un ensemble à ${n} éléments ?`, answer: num(n ** p), hints: H("Le nombre de p-uplets d'un ensemble à n éléments est nᵖ.", `n = ${n} et p = ${p}.`, `${n}^${p}.`, "Calcule."), solution: `${n}^${p} = ${fr(n ** p)}.` };
  }),
  mk("de-arrangements", DN, 2, { skill: "Arrangements Aₙᵖ : tirages ordonnés sans répétition", ref: `${BOOK}, chap. 11 §3.2 (p. 212-213) et ex. 3.b-3.c (p. 214)`, kw: ["arrangements", "Aₙᵖ", "podium", "ordre", "sans répétition"] }, (c, r) => {
    const n = int(r, 5, 12), p = int(r, 2, 4);
    const sit = c === "situation";
    const pod = p === 2 ? "(1er et 2e)" : p === 3 ? "(1er, 2e et 3e)" : "(1er, 2e, 3e et 4e)";
    return { statement: sit ? `${n} athlètes participent à une course. Combien de podiums différents ${pod} peut-on obtenir, sans ex æquo ?` : `Calcule le nombre d'arrangements de ${p} éléments pris parmi ${n} éléments.`, answer: num(A(n, p)), hints: H("Aₙᵖ = n(n − 1)(n − 2)…(n − p + 1) : p facteurs.", `Premier facteur : ${n}.`, `Les ${p} facteurs sont : ${Array.from({ length: p }, (_, i) => n - i).join(" × ")}.`, "Multiplie."), solution: `${Array.from({ length: p }, (_, i) => n - i).join(" × ")} = ${fr(A(n, p))}.` };
  }),
  mk("de-permutations", DN, 1, { skill: "Permutations : n! et anagrammes", ref: `${BOOK}, chap. 11 §3.3 (p. 214) et ex. 3.d-3.e (p. 214)`, kw: ["permutations", "n!", "factorielle", "anagrammes"] }, (c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const n = int(r, 4, 8); return { statement: `De combien de façons peut-on ranger ${n} livres différents sur une étagère ?`, answer: num(fact(n)), hints: H("Chaque rangement est une permutation de l'ensemble des livres.", "Le nombre de permutations de n éléments est n!.", `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(" × ")}.`, "Calcule."), solution: `${n}! = ${fr(fact(n))}.` }; }
    if (t === 1) { const w = pick(r, ["AFRIQUE", "CAMEROUN", "ABIDJAN", "TOGO", "NIGER", "MALI"]); const letters = [...w]; const distinct = new Set(letters).size === letters.length; const n = letters.length; let v = fact(n); const cnt: Record<string, number> = {}; for (const l of letters) cnt[l] = (cnt[l] ?? 0) + 1; for (const k of Object.values(cnt)) v /= fact(k); void distinct; return { statement: `Combien d'anagrammes (avec ou sans sens) le mot ${w} possède-t-il ?`, answer: num(v), hints: H("Si toutes les lettres sont distinctes : n! anagrammes.", "Si une lettre est répétée k fois, on divise par k!.", `Le mot a ${n} lettres.`, "Calcule."), solution: `${n}!${Object.values(cnt).filter((k) => k > 1).map((k) => ` / ${k}!`).join("")} = ${fr(v)}.` }; }
    const n = int(r, 3, 7); return { statement: `${n} personnes participent à un repas : de combien de façons peut-on les placer autour d'une table avec ${n} places numérotées ?`, answer: num(fact(n)), hints: H("Chaque installation est une permutation des convives.", "n! façons.", `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(" × ")}.`, "Calcule."), solution: `${n}! = ${fr(fact(n))}.` };
  }),
  mk("de-combinaisons", DN, 2, { skill: "Combinaisons Cₙᵖ : choisir sans ordre", ref: `${BOOK}, chap. 11 §4 (p. 215-217)`, kw: ["combinaisons", "Cₙᵖ", "sous-ensembles", "sans ordre", "comité"] }, (c, r) => {
    const n = int(r, 5, 12), p = int(r, 2, 4);
    const sit = c === "situation";
    return { statement: sit ? `Un club compte ${n} membres. De combien de façons peut-on choisir un comité de ${p} membres (sans tenir compte de l'ordre) ?` : `Calcule le nombre de combinaisons de ${p} éléments pris parmi ${n}.`, answer: num(C(n, p)), hints: H("Cₙᵖ = Aₙᵖ / p!.", `A = ${A(n, p)}.`, `p! = ${fact(p)}.`, "Divise."), solution: `C(${n}, ${p}) = ${A(n, p)}/${fact(p)} = ${C(n, p)}.` };
  }),
  mk("de-tirages", DN, 3, { skill: "Tirage simultané : combinaisons et partition des cas", ref: `${BOOK}, chap. 11 §5 (p. 218-221)`, kw: ["tirage simultané", "combinaisons", "boules", "au moins", "exactement"] }, (c, r) => {
    const R = int(r, 3, 6), B = int(r, 3, 6), p = int(r, 2, 3);
    const k = int(r, 1, p);
    const total = C(R + B, p);
    const exact = C(R, k) * C(B, p - k);
    const atLeast = r() < 0.5;
    const v = atLeast ? [...Array(p - k + 1).keys()].reduce((t, i) => t + C(R, k + i) * C(B, p - k - i), 0) : exact;
    void total;
    return { statement: `Un sac contient ${R} boules rouges et ${B} boules bleues, indiscernables au toucher. On tire simultanément ${p} boules. Combien de tirages comportent ${atLeast ? "au moins" : "exactement"} ${k} boule${k > 1 ? "s" : ""} rouge${k > 1 ? "s" : ""} ?`, answer: num(v), hints: H("Un tirage simultané est une combinaison (pas d'ordre).", `Exactement k rouges : C(${R}, k) × C(${B}, ${p} − k).`, atLeast ? "« Au moins » : additionne les cas k, k+1, … jusqu'à p." : `C(${R}, ${k}) × C(${B}, ${p - k}).`, "Calcule."), solution: atLeast ? `Total des cas : ${v}.` : `C(${R}, ${k}) × C(${B}, ${p - k}) = ${C(R, k)} × ${C(B, p - k)} = ${v}.` };
  }),
  mk("de-ensembles", DN, 2, { skill: "Cardinal d'une réunion ; diagrammes et produit cartésien", ref: `${BOOK}, chap. 11 §1.2 et §2 (p. 205 et 208-210)`, kw: ["cardinal", "réunion", "intersection", "diagramme", "produit cartésien", "Card(A∪B)"] }, (c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const a = int(r, 10, 30), b = int(r, 10, 30), i = int(r, 2, 9); return { statement: `Dans un groupe, ${a} personnes pratiquent le football, ${b} le basket et ${i} pratiquent les deux. Combien de personnes pratiquent au moins un de ces deux sports ?`, answer: num(a + b - i), hints: H("Card(A ∪ B) = Card(A) + Card(B) − Card(A ∩ B).", `${a} + ${b} = ${a + b}.`, `${a + b} − ${i}.`, "Calcule."), solution: `${a} + ${b} − ${i} = ${a + b - i}.` }; }
    if (t === 1) { const m = int(r, 2, 6), n = int(r, 2, 7); return { statement: `Un candidat doit choisir un sujet de mathématiques parmi ${m} et un sujet de physique parmi ${n}. De combien de façons peut-il choisir ?`, answer: num(m * n), hints: H("Card(M × P) = Card(M) × Card(P).", "Les choix sont des couples (m, p).", `${m} × ${n}.`, "Calcule."), solution: `${m} × ${n} = ${m * n}.` }; }
    const nn = int(r, 3, 6); return { statement: `Un ensemble E possède ${nn} éléments. Combien de parties (sous-ensembles) E possède-t-il, y compris l'ensemble vide et E lui-même ?`, answer: num(2 ** nn), hints: H("Card(𝒫(E)) = 2ⁿ.", "Chaque élément est pris ou non pris.", `2^${nn}.`, "Calcule."), solution: `2^${nn} = ${2 ** nn}.` };
  }),
  mk("de-cours", DN, 1, { skill: "Dénombrement : outils et formules du cours", ref: `${BOOK}, chap. 11 (p. 204-217)`, kw: ["dénombrement", "arrangement", "combinaison", "permutation", "cardinal", "p-uplet"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Combien y a-t-il de p-uplets d'un ensemble à n éléments ?", good: "nᵖ", bad: ["n!", "n × p", "Aₙᵖ"], why: "Propriété du manuel (§3.1)." },
      { q: "Combien y a-t-il d'arrangements de p éléments choisis parmi n ?", good: "n(n − 1)…(n − p + 1)", bad: ["nᵖ", "n!/p!", "n × p"], why: "Aₙᵖ = n(n−1)…(n−p+1) (p facteurs), soit n!/(n−p)!." },
      { q: "Combien y a-t-il de permutations d'un ensemble à n éléments ?", good: "n!", bad: ["nⁿ", "2ⁿ", "n²"], why: "Le nombre de permutations de n éléments est n!." },
      { q: "Que vaut 0! par convention ?", good: "1", bad: ["0", "Rien, 0! n'existe pas", "−1"], why: "Convention du manuel (§3.2) : 0! = 1." },
      { q: "A est une partie d'un ensemble fini E. Que vaut Card(A) + Card(E∖A) ?", good: "Card(E)", bad: ["Card(A)", "Card(A) × Card(E∖A)", "0"], why: "Conséquence de la propriété des partitions (§2.1)." },
      { q: "Pour deux parties A et B d'un ensemble fini, Card(A ∪ B) vaut :", good: "Card(A) + Card(B) − Card(A ∩ B)", bad: ["Card(A) + Card(B)", "Card(A) × Card(B)", "Card(A) − Card(B)"], why: "Propriété du manuel (§2.1)." },
      { q: "Card(A × B) vaut :", good: "Card(A) × Card(B)", bad: ["Card(A) + Card(B)", "Card(A)ᴮ", "Card(A) − Card(B)"], why: "Propriété du produit cartésien (§2.2)." },
      { q: "Dans un tirage simultané de plusieurs objets, l'ordre des objets tirés compte-t-il ?", good: "Non : on dénombre des combinaisons", bad: ["Oui : on dénombre des arrangements", "Oui : on dénombre des permutations", "Oui : on dénombre des p-uplets"], why: "Dans un tirage simultané, l'ordre n'intervient pas : combinaisons (§4)." },
    ];
    return qcmOf(r, pool, "Demande-toi si l'ordre compte et si les répétitions sont permises.");
  }, QCM),
];
