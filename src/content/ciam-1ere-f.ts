// CIAM Première S : limites et continuité, dérivation, études de fonctions.
import { fr, gcd, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("1ere", "ciam1");
const BOOK = "CIAM 1ère S";
const LI = "Limites et continuité — série C";
const DE = "Dérivation — série C";
const EF = "Étude et représentation graphique d'une fonction — série C";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const nz = (r: () => number, lo: number, hi: number) => { let v = 0; while (v === 0) v = lo + Math.floor(r() * (hi - lo + 1)); return v; };
const term = (a: number, v: string, first: boolean) => {
  if (a === 0) return "";
  const m = Math.abs(a) === 1 && v !== "" ? "" : String(Math.abs(a));
  return first ? `${a < 0 ? "−" : ""}${m}${v}` : ` ${a < 0 ? "−" : "+"} ${m}${v}`;
};
const sup = (n: number) => (n === 1 ? "" : n === 2 ? "²" : n === 3 ? "³" : `^${n}`);
/** Polynôme écrit à partir de ses coefficients (degré décroissant). */
const poly = (co: number[]) => {
  const d = co.length - 1;
  let out = "";
  co.forEach((a, i) => {
    const k = d - i;
    if (a === 0) return;
    out += term(a, k === 0 ? "" : `x${sup(k)}`, out === "");
  });
  return out || "0";
};
const frac = (a: number, b: number) => { const g = gcd(Math.abs(a), Math.abs(b)) || 1; let n = a / g, d = b / g; if (d < 0) { n = -n; d = -d; } return d === 1 ? S(n) : `${S(n)}/${d}`; };

export const T1F: Template[] = [
  // ===== Chapitre 12 : Limites et continuité =====
  mk("li-rationnelle", LI, 3, { skill: "Limite en ±∞ d'une fonction rationnelle (quotient des monômes de plus haut degré)", ref: `${BOOK}, chap. 12 §2.3 (p. 235-236) et ex. 2.a (p. 238)`, kw: ["limite en l'infini", "fonction rationnelle", "monôme de plus haut degré", "quotient"] }, (c, r) => {
    const m = int(r, 1, 3), n = int(r, 1, 3);
    const co = (d: number) => Array.from({ length: d + 1 }, (_, i) => (i === 0 ? nz(r, -4, 4) : int(r, -4, 4)));
    const A = co(m), B = co(n);
    const plus = int(r, 0, 1) === 0;
    const a = A[0], b = B[0];
    let ans: string;
    if (m < n) ans = "0";
    else if (m === n) ans = frac(a, b);
    else {
      let sign = Math.sign(a) * Math.sign(b);
      if (!plus) sign *= (m - n) % 2 === 0 ? 1 : -1;
      ans = sign > 0 ? "+∞" : "−∞";
    }
    const opts = [...new Set([ans, "0", "+∞", "−∞", frac(a, b), frac(b, a)])].slice(0, 4);
    if (!opts.includes(ans)) opts[0] = ans;
    const sh = opts;
    return { statement: `Calcule la limite de f(x) = (${poly(A)})/(${poly(B)}) quand x tend vers ${plus ? "+∞" : "−∞"}.`, answer: { kind: "choice", options: sh, index: sh.indexOf(ans) }, hints: H("En l'infini, la limite d'une fraction rationnelle est celle du quotient des monômes de plus haut degré.", `Numérateur : ${term(a, `x${sup(m)}`, true)} ; dénominateur : ${term(b, `x${sup(n)}`, true)}.`, m < n ? "Le degré du numérateur est plus petit : la limite est 0." : m === n ? "Les degrés sont égaux : la limite est le quotient des coefficients dominants." : "Le degré du numérateur est plus grand : la limite est infinie ; étudie le signe.", "Conclus."), solution: `lim f(x) = lim (${term(a, `x${sup(m)}`, true)})/(${term(b, `x${sup(n)}`, true)}) = ${ans}.` };
  }, QCM),
  mk("li-polynome", LI, 1, { skill: "Limite en ±∞ d'une fonction polynôme (monôme de plus haut degré)", ref: `${BOOK}, chap. 12 §2.3 (p. 235)`, kw: ["limite", "polynôme", "plus haut degré", "infini"] }, (c, r) => {
    const d = int(r, 2, 4);
    const co = Array.from({ length: d + 1 }, (_, i) => (i === 0 ? nz(r, -3, 3) : int(r, -5, 5)));
    const plus = int(r, 0, 1) === 0;
    let sign = Math.sign(co[0]);
    if (!plus && d % 2 === 1) sign = -sign;
    const ans = sign > 0 ? "+∞" : "−∞";
    return { statement: `Quelle est la limite de f(x) = ${poly(co)} quand x tend vers ${plus ? "+∞" : "−∞"} ?`, answer: { kind: "choice", options: ["+∞", "−∞", "0", "Un nombre fini non nul"], index: sign > 0 ? 0 : 1 }, hints: H("En l'infini, un polynôme a la même limite que son monôme de plus haut degré.", `Monôme dominant : ${term(co[0], `x${sup(d)}`, true)}.`, plus ? "Quand x → +∞, xⁿ → +∞." : d % 2 === 0 ? "Quand x → −∞, xⁿ → +∞ si n pair." : "Quand x → −∞, xⁿ → −∞ si n impair.", "Tiens compte du signe du coefficient."), solution: `lim f(x) = lim ${term(co[0], `x${sup(d)}`, true)} = ${ans}.` };
  }, QCM),
  mk("li-facteur", LI, 2, { skill: "Forme indéterminée 0/0 : factoriser par (x − x₀) et simplifier", ref: `${BOOK}, chap. 12 §2.3, limite en 2 de (x²−4)/(x²+2x−8) (p. 236)`, kw: ["forme indéterminée", "0/0", "factoriser", "simplifier", "limite en x₀"] }, (c, r) => {
    const x0 = int(r, -4, 4), q = int(r, -4, 4);
    // (x − x0)(x − q) / (x − x0) → x0 − q ; on écrit sous forme développée
    const num_ = [1, -(x0 + q), x0 * q];
    const val = x0 - q;
    return { statement: `Calcule la limite de f(x) = (${poly(num_)})/(x ${x0 < 0 ? "+" : "−"} ${Math.abs(x0)}) quand x tend vers ${S(x0)}.`.replace("x − 0", "x").replace("x + 0", "x"), answer: num(val), hints: H("Numérateur et dénominateur s'annulent en x₀ : forme indéterminée.", `Factorise le numérateur par (x − ${P(x0)}).`, `${poly(num_)} = (x − ${P(x0)})(x − ${P(q)}).`, "Simplifie puis remplace x par x₀."), solution: `f(x) = x − ${P(q)} pour x ≠ ${S(x0)}, donc la limite vaut ${S(x0)} − ${P(q)} = ${S(val)}.` };
  }),
  mk("li-inverse", LI, 2, { skill: "Limite d'un inverse : 1/(x − a) à gauche et à droite de a", ref: `${BOOK}, chap. 12 §1.2 et §2.2 (p. 227-229, 234)`, kw: ["limite à gauche", "limite à droite", "1/(x−a)", "asymptote verticale"] }, (c, r) => {
    const a = int(r, -5, 5);
    const k = nz(r, -3, 3);
    const right = int(r, 0, 1) === 0;
    const s = (right ? 1 : -1) * Math.sign(k);
    return { statement: `Calcule la limite de f(x) = ${k}/(x ${a < 0 ? "+" : "−"} ${Math.abs(a)}) quand x tend vers ${S(a)} ${right ? "par valeurs supérieures (à droite)" : "par valeurs inférieures (à gauche)"}.`.replace("x − 0", "x").replace("x + 0", "x").replace(`${k}/`, k < 0 ? `(−${-k})/` : `${k}/`), answer: { kind: "choice", options: ["+∞", "−∞", "0", "Pas de limite"], index: s > 0 ? 0 : 1 }, hints: H("Le dénominateur tend vers 0 : étudie son signe.", right ? "x > a donc x − a > 0 (proche de 0)." : "x < a donc x − a < 0 (proche de 0).", `Le numérateur vaut ${S(k)}.`, "Un nombre non nul divisé par un « petit » nombre de signe donné est « grand » de signe le produit."), solution: `Le dénominateur tend vers 0 ${right ? "par valeurs positives" : "par valeurs négatives"} et le numérateur est ${k > 0 ? "positif" : "négatif"} : la limite est ${s > 0 ? "+∞" : "−∞"}.` };
  }, QCM),
  mk("li-sinus", LI, 3, { skill: "Limite de sin(ax)/(bx) en 0", ref: `${BOOK}, chap. 12 §2.2 et TD (p. 235 et 237)`, kw: ["sin x / x", "limite en 0", "changement de variable", "gendarmes"] }, (c, r) => {
    const a = nz(r, -5, 5), b = nz(r, -5, 5);
    const v = a / b;
    return { statement: `Calcule la limite en 0 de f(x) = sin(${a === 1 ? "" : a === -1 ? "−" : a}x)/(${b === 1 ? "" : b === -1 ? "−" : b}x). (arrondi au centième)`, answer: num(round(v, 2), 0.01), hints: H("On sait que sin u / u → 1 quand u → 0.", `Écris f(x) = (sin(ax)/(ax)) × (a/b).`, `Le premier facteur tend vers 1.`, `a/b = ${a}/${b}.`), solution: `f(x) = (sin(${a}x)/(${a}x)) × ${a}/${P(b)} → 1 × ${a}/${P(b)} = ${S(round(v, 2))}.` };
  }),
  mk("li-continuite", LI, 3, { skill: "Continuité d'une fonction définie par morceaux : trouver un paramètre", ref: `${BOOK}, chap. 12 §3 (p. 238-242) : f continue en x₀ ⇔ lim f(x) = f(x₀)`, kw: ["continuité", "fonction par morceaux", "paramètre", "limite à gauche", "limite à droite"] }, (c, r) => {
    const x0 = nz(r, -3, 3), k = int(r, -4, 4), m = int(r, -5, 5);
    // f(x) = x² + k si x ≤ x0 ; f(x) = a x + m si x > x0. Continuité : x0² + k = a x0 + m
    const a = (x0 * x0 + k - m) / x0;
    return { statement: `f est définie par f(x) = ${poly([1, 0, k])} si x ≤ ${S(x0)}, et f(x) = a·x ${m < 0 ? "−" : "+"} ${Math.abs(m)} si x > ${S(x0)}. Pour quelle valeur de a la fonction f est-elle continue en ${S(x0)} ? (arrondi au centième)`.replace(" + 0 si", " si").replace(" − 0 si", " si"), answer: num(round(a, 2), 0.01), hints: H("f est continue en x₀ si la limite à gauche, la limite à droite et f(x₀) sont égales.", `À gauche : ${S(x0 * x0 + k)} (valeur de x² + k en ${S(x0)}).`, `À droite : a × ${P(x0)} + ${P(m)}.`, "Écris l'égalité et résous en a."), solution: `${S(x0 * x0 + k)} = ${P(x0)}a + ${P(m)} donne a = ${S(round(a, 2))}.` };
  }),
  mk("li-cours", LI, 1, { skill: "Limites : propriétés, opérations, formes indéterminées (cours)", ref: `${BOOK}, chap. 12 (p. 226-238)`, kw: ["limite", "forme indéterminée", "gendarmes", "limite à gauche", "continuité"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "lim f(x) = +∞ et lim g(x) = −∞ quand x → x₀. Que peut-on dire de lim (f + g)(x) ?", good: "Forme indéterminée : on ne peut pas conclure directement", bad: ["+∞", "−∞", "0"], why: "Dans la table de la somme, (+∞) + (−∞) est un cas d'indétermination (§2.2)." },
      { q: "lim f(x) = 0 et lim g(x) = +∞. Que peut-on dire de lim (f × g)(x) ?", good: "Forme indéterminée : on ne peut pas conclure directement", bad: ["0", "+∞", "1"], why: "Le produit 0 × ∞ est une forme indéterminée (§2.2)." },
      { q: "Si f est définie en x₀ et admet une limite en x₀, alors :", good: "lim f(x) = f(x₀)", bad: ["lim f(x) = 0", "lim f(x) = +∞", "f est dérivable en x₀"], why: "Propriété du manuel (§1.2)." },
      { q: "Théorème des gendarmes : g ≤ f ≤ h et lim g = lim h = l. Que vaut lim f ?", good: "l", bad: ["0", "l/2", "On ne peut pas savoir"], why: "Théorème d'encadrement (§2.1)." },
      { q: "lim 1/x quand x → +∞ vaut :", good: "0", bad: ["+∞", "1", "−∞"], why: "Limite de fonction élémentaire (§1.1)." },
      { q: "lim 1/x² quand x → 0 vaut :", good: "+∞", bad: ["0", "−∞", "1"], why: "1/x² est positif et x² tend vers 0 : la limite est +∞ (§1.2)." },
      { q: "Quelle limite remarquable a-t-on en 0 ?", good: "lim sin x / x = 1", bad: ["lim sin x / x = 0", "lim sin x / x = +∞", "lim sin x / x = π"], why: "Résultat établi au TD §2.4 du chapitre." },
      { q: "lim f(x) = l (réel) quand x → +∞ : que dit-on de la droite y = l ?", good: "C'est une asymptote horizontale à la courbe", bad: ["C'est une tangente", "C'est un axe de symétrie", "C'est la courbe de f"], why: "Définition d'une asymptote parallèle à l'axe des abscisses (chap. 14 §1.3)." },
    ];
    return qcmOf(r, pool, "Revois les tableaux d'opérations sur les limites.");
  }, QCM),

  // ===== Chapitre 13 : Dérivation =====
  mk("de-nombre-derive", DE, 1, { skill: "Nombre dérivé d'une fonction en x₀", ref: `${BOOK}, chap. 13 §1.1 et §2.1 (p. 244-250) et ex. 1.a (p. 249)`, kw: ["nombre dérivé", "f'(x₀)", "dérivée", "taux d'accroissement"] }, (c, r) => {
    const a = nz(r, -4, 4), b = int(r, -6, 6), cc = int(r, -6, 6), x0 = int(r, -3, 3);
    return { statement: `f(x) = ${poly([a, b, cc])}. Calcule le nombre dérivé f'(${S(x0)}).`, answer: num(2 * a * x0 + b), hints: H("La dérivée de ax² + bx + c est 2ax + b.", `f'(x) = ${term(2 * a, "x", true)}${term(b, "", false)}.`, `f'(${S(x0)}) = 2 × ${P(a)} × ${P(x0)} + ${P(b)}.`, "Calcule."), solution: `f'(x) = ${term(2 * a, "x", true)}${term(b, "", false)}, donc f'(${S(x0)}) = ${S(2 * a * x0 + b)}.` };
  }),
  mk("de-tangente", DE, 2, { skill: "Équation de la tangente en un point : y − f(x₀) = f'(x₀)(x − x₀)", ref: `${BOOK}, chap. 13 §1.1, interprétation graphique (p. 245) et ex. 1.b (p. 249)`, kw: ["tangente", "équation", "coefficient directeur", "ordonnée à l'origine"] }, (c, r) => {
    const a = nz(r, -3, 3), b = int(r, -5, 5), cc = int(r, -5, 5), x0 = int(r, -3, 3);
    const fx = a * x0 * x0 + b * x0 + cc, fp = 2 * a * x0 + b;
    const k = fx - fp * x0;
    const ask = int(r, 0, 1) === 0;
    return { statement: `(𝒞) est la courbe de f(x) = ${poly([a, b, cc])}. La tangente à (𝒞) au point d'abscisse ${S(x0)} a pour équation y = mx + p. Quelle est la valeur de ${ask ? "m" : "p"} ?`, answer: num(ask ? fp : k), hints: H("Équation : y = f'(x₀)(x − x₀) + f(x₀).", `f(${S(x0)}) = ${S(fx)} et f'(${S(x0)}) = ${S(fp)}.`, `m = f'(x₀) = ${S(fp)}.`, `p = f(x₀) − m·x₀ = ${S(fx)} − ${P(fp)} × ${P(x0)}.`), solution: `y = ${S(fp)}(x − ${P(x0)}) + ${P(fx)}, donc y = ${term(fp, "x", true)}${term(k, "", false)} : m = ${S(fp)}, p = ${S(k)}.` };
  }),
  mk("de-produit", DE, 2, { skill: "Dérivée d'un produit (uv)' = u'v + uv'", ref: `${BOOK}, chap. 13 §2.2 (p. 252) et ex. 2 (p. 256)`, kw: ["dérivée d'un produit", "u'v + uv'", "dérivée", "règle de dérivation"] }, (c, r) => {
    const a = nz(r, -3, 3), b = int(r, -4, 4), cc = nz(r, -3, 3), d = int(r, -4, 4), x0 = int(r, -3, 3);
    // f(x) = (ax+b)(cx²+d) ; f' = a(cx²+d) + (ax+b)(2cx)
    const v = a * (cc * x0 * x0 + d) + (a * x0 + b) * 2 * cc * x0;
    return { statement: `f(x) = (${poly([a, b])})(${poly([cc, 0, d])}). Calcule f'(${S(x0)}).`, answer: num(v), hints: H("On pose u = ax + b et v = cx² + d : (uv)' = u'v + uv'.", `u' = ${S(a)} et v' = ${S(2 * cc)}x.`, `f'(${S(x0)}) = u'(${S(x0)})·v(${S(x0)}) + u(${S(x0)})·v'(${S(x0)}).`, "Calcule."), solution: `u' v + u v' = ${S(a)} × ${S(cc * x0 * x0 + d)} + ${S(a * x0 + b)} × ${S(2 * cc * x0)} = ${S(v)}.` };
  }),
  mk("de-extremum", DE, 3, { skill: "Extremum relatif : annulation de f' avec changement de signe", ref: `${BOOK}, chap. 13 §3.1 (p. 257-258)`, kw: ["extremum", "minimum", "maximum", "dérivée s'annule", "tableau de variation"] }, (c, r) => {
    const q = int(r, 1, 3), k = int(r, -5, 5);
    // f(x) = x³ − 3q²x + k : f'(x) = 3(x−q)(x+q) ; max en −q = k + 2q³ ; min en q = k − 2q³
    const wantMax = int(r, 0, 1) === 0;
    const v = wantMax ? k + 2 * q ** 3 : k - 2 * q ** 3;
    return { statement: `f(x) = ${poly([1, 0, -3 * q * q, k])}. Quel est le ${wantMax ? "maximum" : "minimum"} relatif de f ?`, answer: num(v), hints: H("Calcule f'(x) et étudie son signe.", `f'(x) = 3x² − ${3 * q * q} = 3(x − ${q})(x + ${q}).`, `f' s'annule en ${q} et −${q} en changeant de signe : ${wantMax ? `maximum en −${q}` : `minimum en ${q}`}.`, `Calcule f(${wantMax ? `−${q}` : q}).`), solution: `${wantMax ? `f(−${q})` : `f(${q})`} = ${S(v)}.` };
  }),
  mk("de-approximation", DE, 3, { skill: "Approximation affine : f(x₀ + h) ≈ f(x₀) + f'(x₀)h", ref: `${BOOK}, chap. 13 §3.2 (p. 258-260)`, kw: ["approximation affine", "f(x₀+h)", "valeur approchée", "dérivée"] }, (c, r) => {
    const t = int(r, 0, 1);
    const h = pick(r, [0.01, 0.02, 0.05, -0.01, -0.02, 0.03]);
    if (t === 0) { const x0 = pick(r, [4, 9, 16, 25, 36]); const rt = Math.sqrt(x0); const v = rt + h / (2 * rt); return { statement: `En utilisant l'approximation affine de f(x) = √x en ${x0}, donne une valeur approchée de √${fr(x0 + h)} (arrondi à 10⁻⁴).`, answer: num(round(v, 4), 0.0002), hints: H("f(x₀ + h) ≈ f(x₀) + f'(x₀)·h.", `f'(x) = 1/(2√x), donc f'(${x0}) = 1/${2 * rt}.`, `h = ${S(h)}.`, `${rt} + ${S(h)}/${2 * rt}.`), solution: `√${fr(x0 + h)} ≈ ${rt} + ${S(h)}/${2 * rt} ≈ ${S(round(v, 4))}.` }; }
    const x0 = pick(r, [2, 4, 5, 10]); const v = 1 / x0 - h / (x0 * x0); return { statement: `En utilisant l'approximation affine de f(x) = 1/x en ${x0}, donne une valeur approchée de 1/${fr(x0 + h)} (arrondi à 10⁻⁴).`, answer: num(round(v, 4), 0.0002), hints: H("f(x₀ + h) ≈ f(x₀) + f'(x₀)·h.", `f'(x) = −1/x², donc f'(${x0}) = −1/${x0 * x0}.`, `h = ${S(h)}.`, `1/${x0} − ${S(h)}/${x0 * x0}.`), solution: `1/${fr(x0 + h)} ≈ 1/${x0} − ${S(h)}/${x0 * x0} ≈ ${S(round(v, 4))}.` };
  }),
  mk("de-vitesse", DE, 2, { skill: "Vitesse instantanée : nombre dérivé de la fonction position", ref: `${BOOK}, chap. 13 §1.1, travaux dirigés (p. 248-249)`, kw: ["vitesse instantanée", "dérivée", "chute libre", "position"] }, (c, r) => {
    const t0 = int(r, 1, 4);
    const g = 9.81;
    const v = g * t0;
    return { statement: `Une noix de coco tombe d'un cocotier. La distance parcourue (en mètres) au bout de t secondes est x(t) = ½·g·t², avec g = 9,81 m/s². Quelle est la vitesse instantanée (en m/s) à l'instant t = ${t0} s ?`, answer: num(round(v, 2), 0.01), hints: H("La vitesse instantanée est le nombre dérivé de x en t₀.", "x'(t) = g·t.", `x'(${t0}) = 9,81 × ${t0}.`, "Calcule."), solution: `v(${t0}) = x'(${t0}) = 9,81 × ${t0} = ${fr(round(v, 2))} m/s.` };
  }),
  mk("de-cours", DE, 1, { skill: "Dérivation : définition, dérivées usuelles, variations (cours)", ref: `${BOOK}, chap. 13 (p. 244-260)`, kw: ["dérivée", "nombre dérivé", "tangente", "variations", "extremum"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Si f est dérivable en x₀, alors :", good: "f est continue en x₀", bad: ["f est dérivable partout", "f(x₀) = 0", "f'(x₀) = 0"], why: "Propriété du manuel (§1.1). La réciproque est fausse (x ↦ |x| en 0)." },
      { q: "f(x) = |x| est-elle dérivable en 0 ?", good: "Non : les nombres dérivés à gauche (−1) et à droite (1) diffèrent", bad: ["Oui, f'(0) = 0", "Oui, f'(0) = 1", "Oui, car |x| est continue en 0"], why: "Exemple du manuel (§1.1) : g n'est pas dérivable en 0." },
      { q: "Quelle est la dérivée de x ↦ x² ?", good: "x ↦ 2x", bad: ["x ↦ x", "x ↦ 2", "x ↦ x²/2"], why: "Propriété du manuel (§2.1)." },
      { q: "Quelle est la dérivée de x ↦ 1/x sur ℝ* ?", good: "x ↦ −1/x²", bad: ["x ↦ 1/x²", "x ↦ −1/x", "x ↦ ln x"], why: "Propriété du manuel (§2.1)." },
      { q: "Quelle est la dérivée de x ↦ √x sur ]0 ; +∞[ ?", good: "x ↦ 1/(2√x)", bad: ["x ↦ 2√x", "x ↦ 1/√x", "x ↦ √x/2"], why: "Propriété du manuel (§2.1). √x n'est pas dérivable en 0." },
      { q: "Quelle est la dérivée de x ↦ sin x ?", good: "x ↦ cos x", bad: ["x ↦ −cos x", "x ↦ −sin x", "x ↦ tan x"], why: "Propriétés 2 du manuel (§2.1) : (sin)' = cos et (cos)' = −sin." },
      { q: "f est dérivable sur un intervalle K. f est croissante sur K si et seulement si :", good: "f' ≥ 0 sur K", bad: ["f' = 0 sur K", "f ≥ 0 sur K", "f' > 1 sur K"], why: "Théorème du manuel (§3.1)." },
      { q: "f' s'annule en x₀ en changeant de signe. Que peut-on dire de f ?", good: "f admet un extremum relatif en x₀", bad: ["f n'est pas dérivable en x₀", "f est constante", "f admet une asymptote"], why: "Propriété du manuel (§3.1)." },
      { q: "(u + v)' vaut :", good: "u' + v'", bad: ["u'v + uv'", "u'v'", "u + v"], why: "Dérivée de la somme (§2.2)." },
      { q: "(u·v)' vaut :", good: "u'v + uv'", bad: ["u'v'", "u' + v'", "u'v − uv'"], why: "Dérivée du produit (§2.2)." },
    ];
    return qcmOf(r, pool, "Reprends les propriétés du §2.");
  }, QCM),

  // ===== Chapitre 14 : Études de fonctions =====
  mk("ef-parite", EF, 2, { skill: "Parité d'une fonction : paire, impaire ou ni l'une ni l'autre", ref: `${BOOK}, chap. 14 §1.1 (p. 266-267)`, kw: ["fonction paire", "fonction impaire", "f(−x)", "symétrie", "parité"] }, (c, r) => {
    const kind = int(r, 0, 2);
    const a = nz(r, -3, 3), b = nz(r, 1, 3);
    let txt: string, fx: (x: number) => number;
    if (kind === 0) { txt = `${term(a, "x²", true)}${term(b, "", false)}`; fx = (x) => a * x * x + b; } else if (kind === 1) { txt = `${term(a, "x³", true)}${term(b, "x", false)}`; fx = (x) => a * x ** 3 + b * x; } else { txt = `${term(a, "x²", true)}${term(b, "x", false)}`; fx = (x) => a * x * x + b * x; }
    const even = [1, 2, 3].every((x) => fx(-x) === fx(x)), odd = [1, 2, 3].every((x) => fx(-x) === -fx(x));
    const idx = even ? 0 : odd ? 1 : 2;
    return { statement: `La fonction f définie sur ℝ par f(x) = ${txt} est-elle paire, impaire, ou ni l'une ni l'autre ?`, answer: { kind: "choice", options: ["Paire", "Impaire", "Ni paire ni impaire"], index: idx }, hints: H("Calcule f(−x) et compare à f(x) et −f(x).", `f(−x) = ${txt.replace(/x/g, "(−x)")}.`, "Paire : f(−x) = f(x). Impaire : f(−x) = −f(x).", "Conclus."), solution: `f(−x) ${idx === 0 ? "= f(x) : f est paire" : idx === 1 ? "= −f(x) : f est impaire" : "n'est ni égal à f(x) ni à −f(x) : f n'est ni paire ni impaire"}.` };
  }, QCM),
  mk("ef-periode", EF, 2, { skill: "Période d'une fonction trigonométrique sin(kx + φ), cos(kx + φ), tan(kx + φ)", ref: `${BOOK}, chap. 14 §1.1, fonctions périodiques (p. 267-268)`, kw: ["période", "fonction périodique", "sin(kx)", "2π/k"] }, (c, r) => {
    const k = pick(r, [2, 3, 4, 5, 0.5]);
    const fn = pick(r, ["sin", "cos", "tan"] as const);
    const p = fn === "tan" ? 1 / k : 2 / k; // en multiples de π
    return { statement: `Quelle est la plus petite période positive de f(x) = ${fn}(${k === 0.5 ? "x/2" : `${k}x`}) ? Donne le résultat sous la forme p·π et indique p (arrondi au centième).`, answer: num(round(p, 2), 0.01), hints: H(fn === "tan" ? "La tangente est π-périodique : tan(kx) a pour période π/k." : "Le sinus et le cosinus sont 2π-périodiques : sin(kx) a pour période 2π/k.", `k = ${fr(k)}.`, fn === "tan" ? `π/${fr(k)}.` : `2π/${fr(k)}.`, "Donne le coefficient de π."), solution: `Période = ${fr(round(p, 2))}π.` };
  }),
  mk("ef-asymptotes", EF, 2, { skill: "Asymptotes d'une fonction homographique f(x) = (ax + b)/(cx + d)", ref: `${BOOK}, chap. 14 §1.3 et §2.2 (p. 269-270 et 274)`, kw: ["asymptote", "fonction homographique", "asymptote verticale", "asymptote horizontale"] }, (c, r) => {
    const cc = nz(r, 1, 3), d = int(r, -6, 6);
    let a = nz(r, -4, 4), b = int(r, -6, 6);
    while (a * d - b * cc === 0) b += 1;
    const horiz = int(r, 0, 1) === 0;
    const v = horiz ? a / cc : -d / cc;
    return { statement: `La courbe de f(x) = (${term(a, "x", true)}${term(b, "", false)})/(${term(cc, "x", true)}${term(d, "", false)}) admet une asymptote ${horiz ? "horizontale d'équation y = k" : "verticale d'équation x = k"}. Quelle est la valeur de k ? (arrondi au centième)`, answer: num(round(v, 2), 0.01), hints: horiz ? H("Calcule la limite de f en +∞.", "En l'infini, f(x) ≈ ax/(cx).", `Limite : a/c = ${a}/${cc}.`, "Calcule.") : H("L'asymptote verticale est en la valeur interdite.", "Le dénominateur s'annule en x = −d/c.", `cx + d = 0 pour x = ${S(-d)}/${cc}.`, "Calcule."), solution: horiz ? `lim f = ${a}/${cc} ≈ ${S(round(v, 2))} : y = ${S(round(v, 2))}.` : `Le dénominateur s'annule en x = ${S(-d)}/${cc} ≈ ${S(round(v, 2))} : x = ${S(round(v, 2))}.` };
  }),
  mk("ef-oblique", EF, 3, { skill: "Asymptote oblique d'une fonction f(x) = mx + p + q/(x + s)", ref: `${BOOK}, chap. 14 §1.3, asymptotes obliques (p. 270) et §2.2 (p. 274)`, kw: ["asymptote oblique", "y = ax + b", "limite de f(x) − (ax + b)", "fonction rationnelle"] }, (c, r) => {
    const m = nz(r, -3, 3), p = int(r, -4, 4), q = nz(r, -4, 4), s = nz(r, -4, 4);
    const ask = int(r, 0, 1) === 0;
    return { statement: `f(x) = ${term(m, "x", true)}${term(p, "", false)} + ${q < 0 ? `(−${-q})` : q}/(x ${s < 0 ? "−" : "+"} ${Math.abs(s)}). La courbe de f admet une asymptote oblique d'équation y = ax + b. Quelle est la valeur de ${ask ? "a" : "b"} ?`, answer: num(ask ? m : p), hints: H("f(x) − (mx + p) = q/(x + s) tend vers 0 en ±∞.", "Donc la droite y = mx + p est asymptote à la courbe.", "Identifie a (coefficient de x) et b (constante).", "Lis les coefficients."), solution: `f(x) − (${term(m, "x", true)}${term(p, "", false)}) = ${q}/(x ${s < 0 ? "−" : "+"} ${Math.abs(s)}) → 0 : a = ${S(m)} et b = ${S(p)}.` };
  }),
  mk("ef-cours", EF, 1, { skill: "Étude de fonctions : domaine, parité, symétries, asymptotes, plan d'étude", ref: `${BOOK}, chap. 14 (p. 266-275)`, kw: ["étude de fonction", "axe de symétrie", "centre de symétrie", "asymptote", "tableau de variation"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Quelle est la symétrie de la courbe d'une fonction paire (repère orthogonal) ?", good: "Symétrie par rapport à l'axe des ordonnées", bad: ["Symétrie par rapport à l'origine", "Symétrie par rapport à l'axe des abscisses", "Aucune symétrie"], why: "Une fonction paire a une courbe symétrique par rapport à (OJ)." },
      { q: "Quelle est la symétrie de la courbe d'une fonction impaire ?", good: "L'origine O est un centre de symétrie", bad: ["L'axe (OJ) est un axe de symétrie", "L'axe (OI) est un axe de symétrie", "Aucune symétrie"], why: "Définition du manuel (§1.1)." },
      { q: "f est périodique de période p. Que traduit cela graphiquement ?", good: "La courbe est globalement invariante par la translation de vecteur p·OI", bad: ["La courbe est symétrique par rapport à (OJ)", "La courbe admet une asymptote", "La courbe passe par l'origine"], why: "Propriété du manuel (§1.1)." },
      { q: "Si lim f(x) = l (réel fini) quand x → +∞, que peut-on dire ?", good: "La droite y = l est une asymptote horizontale", bad: ["La droite x = l est une asymptote verticale", "f est périodique", "f admet un maximum en l"], why: "Définition d'une asymptote parallèle à l'axe des abscisses (§1.3)." },
      { q: "Si lim f(x) = ±∞ quand x tend vers x₀ (à gauche ou à droite), que peut-on dire ?", good: "La droite x = x₀ est une asymptote verticale", bad: ["La droite y = x₀ est une asymptote horizontale", "f est continue en x₀", "f est dérivable en x₀"], why: "Définition d'une asymptote parallèle à l'axe des ordonnées (§1.3)." },
      { q: "Pour montrer que la droite x = a est un axe de symétrie de la courbe, il suffit de montrer que :", good: "pour tout h, a − h et a + h sont dans D_f et f(a − h) = f(a + h)", bad: ["f(a) = 0", "f' (a) = 1", "f est périodique de période a"], why: "Méthode du manuel (§1.2)." },
      { q: "Quelle est la nature de la courbe de f(x) = (ax + b)/(cx + d) avec c ≠ 0 (et ad − bc ≠ 0) ?", good: "Une hyperbole", bad: ["Une parabole", "Une droite", "Un cercle"], why: "Les fonctions homographiques ont pour courbe une hyperbole (§2.2)." },
      { q: "Pour étudier f quand elle est paire, il suffit de l'étudier sur :", good: "D_f ∩ ℝ₊, puis de compléter par symétrie", bad: ["ℝ₋ seulement sans symétrie", "[0 ; 1]", "Un seul point"], why: "Remarque du manuel (§1.1)." },
    ];
    return qcmOf(r, pool, "Pense à la signification graphique de chaque propriété.");
  }, QCM),
];
void gcd;
