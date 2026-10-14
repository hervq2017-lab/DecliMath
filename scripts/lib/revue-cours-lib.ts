// Relecture AUTOMATIQUE d'un cours de maths : calculs recalculés par le code, formules fausses courantes,
// structure, lisibilité par niveau. Ce n'est PAS une validation : le code repère, un humain décide.
// Aucune dépendance (ni React, ni le référentiel) : utilisable dans les scripts et dans les tests.

export type Gravite = "bloquant" | "a-corriger" | "conseil";

export interface CoursNorm {
  id: string; // ex. maths:4e:theoreme-de-pythagore
  niveau: string; // ci, cp, …, 6e, …, 2nde, 1ere, tle (ou libellé « 2nde C »)
  titre: string;
  intro: string;
  etapes: { titre: string; corps: string }[];
  exemple: { probleme: string; solution: string };
  pieges: string;
  proprietes?: { titre: string; enonce: string }[];
}

export interface Constat {
  regle: string;
  gravite: Gravite;
  message: string;
  extrait?: string;
}

// ---------- Texte ----------

/** Espaces insécables → espace ; séparateur de milliers « 1 750 » → « 1750 » ; virgule décimale conservée. */
export function normaliser(t: string): string {
  let s = (t ?? "").replace(/[   ]/g, " ");
  for (let i = 0; i < 4; i++) s = s.replace(/(\d) (?=\d{3}(?!\d))/g, "$1");
  return s;
}

const SUP: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
const isDigit = (c: string | undefined) => !!c && c >= "0" && c <= "9";
const isLetter = (c: string | undefined) => !!c && /\p{L}/u.test(c);
const OPS_BIN = new Set(["+", "×", "÷", "*", "/", "^", "·", "⋅"]);
const RUN_CHARS = new Set("0123456789 ()+-−–×÷*·⋅/^=²³⁰¹⁴⁵⁶⁷⁸⁹⁻√".split(""));

// ---------- Évaluateur arithmétique (sans eval) ----------

type Tok = { t: "num"; v: number } | { t: "op"; v: string };

function lexer(src: string): Tok[] | null {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " ") { i++; continue; }
    if (isDigit(c) || (c === "." && isDigit(src[i + 1]))) {
      let j = i;
      while (isDigit(src[j]) || ((src[j] === "." || src[j] === ",") && isDigit(src[j + 1]) && isDigit(src[j - 1]))) j++;
      out.push({ t: "num", v: Number(src.slice(i, j).replace(",", ".")) });
      i = j;
      continue;
    }
    if (SUP[c]) {
      let j = i, e = "";
      while (SUP[src[j]]) e += SUP[src[j++]];
      if (!/^-?\d+$/.test(e)) return null;
      out.push({ t: "op", v: "^" }, { t: "num", v: Number(e) });
      i = j;
      continue;
    }
    if ("+-−–".includes(c)) { out.push({ t: "op", v: "-+".includes(c) && c === "+" ? "+" : "-" }); i++; continue; }
    if ("×*·⋅".includes(c)) { out.push({ t: "op", v: "*" }); i++; continue; }
    if ("÷/".includes(c)) { out.push({ t: "op", v: "/" }); i++; continue; }
    if ("^()√".includes(c)) { out.push({ t: "op", v: c }); i++; continue; }
    return null;
  }
  return out;
}

/** Valeur d'une expression arithmétique, ou null si elle n'est pas purement numérique / mal formée. */
export function evaluer(src: string): number | null {
  const toks = lexer(src.trim());
  if (!toks || !toks.length) return null;
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === "op" && (peek() as { v: string }).v === v;
  const fail = () => { throw new Error("syntaxe"); };

  const expr = (): number => {
    let x = term();
    while (isOp("+") || isOp("-")) { const o = (toks[p++] as { v: string }).v; const y = term(); x = o === "+" ? x + y : x - y; }
    return x;
  };
  const term = (): number => {
    let x = unary();
    for (;;) {
      if (isOp("*") || isOp("/")) { const o = (toks[p++] as { v: string }).v; const y = unary(); x = o === "*" ? x * y : x / y; }
      else if (isOp("(") || isOp("√")) x *= unary(); // multiplication implicite : 2(3+4), (a)(b), 2√3
      else return x;
    }
  };
  const unary = (): number => {
    if (isOp("-")) { p++; return -unary(); }
    if (isOp("+")) { p++; return unary(); }
    return power();
  };
  const power = (): number => {
    const b = atom();
    if (isOp("^")) { p++; const e = isOp("-") ? (p++, -unaryPow()) : unaryPow(); return Math.pow(b, e); }
    return b;
  };
  const unaryPow = (): number => { const a = atom(); return isOp("^") ? (p++, Math.pow(a, unaryPow())) : a; };
  const atom = (): number => {
    const t = peek();
    if (!t) return fail() as never;
    if (t.t === "num") { p++; return t.v; }
    if (t.v === "(") { p++; const x = expr(); if (!isOp(")")) fail(); p++; return x; }
    if (t.v === "√") { p++; const x = atom(); if (x < 0) fail(); return Math.sqrt(x); }
    return fail() as never;
  };
  try {
    const v = expr();
    if (p !== toks.length || !Number.isFinite(v)) return null;
    return v;
  } catch { return null; }
}

// ---------- Vérification des égalités « a + b = c » ----------

export interface EcartCalcul { extrait: string; gauche: string; droite: string; vg: number; vd: number; arrondi: boolean }

const decimales = (s: string) => /^\d+[.,]\d+$/.test(s.trim()) ? s.trim().split(/[.,]/)[1].length : 0;
const unLitteral = (s: string) => /^[+-−]?\d+([.,]\d+)?$/.test(s.trim());

/** Trouve les suites de calculs « expr = expr (= expr) » et recalcule chaque égalité. Les parties qui touchent une lettre (variable, f(x)…) sont ignorées. */
export function verifierCalculs(texte: string): EcartCalcul[] {
  const s = normaliser(texte);
  const ecarts: EcartCalcul[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const dansSuite = RUN_CHARS.has(c) || ((c === "." || c === ",") && isDigit(s[i - 1]) && isDigit(s[i + 1]));
    if (!dansSuite) { i++; continue; }
    let j = i;
    while (j < s.length && (RUN_CHARS.has(s[j]) || ((s[j] === "." || s[j] === ",") && isDigit(s[j - 1]) && isDigit(s[j + 1])))) j++;
    let d0 = i, f0 = j;
    while (d0 < f0 && s[d0] === " ") d0++;
    while (f0 > d0 && s[f0 - 1] === " ") f0--;
    const brut = s.slice(d0, f0);
    const avant = s[d0 - 1];
    const motAvant = /([\p{L}]+)\s*$/u.exec(s.slice(Math.max(0, d0 - 12), d0))?.[1]?.toLowerCase() ?? "";
    const fonction = ["ln", "log", "exp", "cos", "sin", "tan", "arg", "pgcd", "ppcm", "card", "det", "lim"].includes(motAvant);
    const apres = s[f0];
    i = j;
    if (!brut.includes("=")) continue;

    const parts = brut.split("=").map((x) => x.trim());
    const taint: boolean[] = parts.map(() => false);
    // Début : accolé à une lettre (f(5) = …), ou commence par un opérateur binaire (suite d'une expression littérale).
    if (parts[0] === "") taint[0] = true;
    else if (fonction || isLetter(avant) || OPS_BIN.has(parts[0][0]) || (/^[-−–]\s/.test(parts[0]))) taint[0] = true;
    // Fin : lettre accolée (3x, 5a), ou opérateur final.
    const last = parts.length - 1;
    if (parts[last] === "") taint[last] = true;
    else if ((isLetter(apres) && isDigit(brut.trimEnd().slice(-1)) && brut.endsWith(brut.trimEnd())) || /[-−–+×÷*/^·⋅]$/.test(parts[last])) taint[last] = true;
    // Une partie qui commence ou finit par un opérateur est incomplète.
    parts.forEach((p, k) => { if (/^[+×÷*/^·⋅]/.test(p) || /[-−–+×÷*/^·⋅(]$/.test(p)) taint[k] = true; });

    const vals = parts.map((p, k) => (taint[k] || !p ? null : evaluer(p)));
    for (let k = 0; k + 1 < parts.length; k++) {
      const a = vals[k], b = vals[k + 1];
      if (a === null || b === null) continue;
      const d = Math.abs(a - b);
      const tol = 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
      if (d <= tol) continue;
      // Arrondi : si un côté est un décimal écrit tel quel (0,33), on tolère l'arrondi à sa dernière décimale.
      const dec = Math.max(unLitteral(parts[k]) ? decimales(parts[k]) : 0, unLitteral(parts[k + 1]) ? decimales(parts[k + 1]) : 0);
      if (dec > 0) {
        const u = Math.pow(10, -dec);
        if (d <= u / 2 + 1e-12) continue;
        ecarts.push({ extrait: brut.trim().slice(0, 90), gauche: parts[k], droite: parts[k + 1], vg: a, vd: b, arrondi: d <= u });
        continue;
      }
      ecarts.push({ extrait: brut.trim().slice(0, 90), gauche: parts[k], droite: parts[k + 1], vg: a, vd: b, arrondi: false });
    }
  }
  return ecarts;
}

// ---------- Formules et énoncés faux courants ----------

interface Faux { id: string; re: RegExp; message: string; gravite?: Gravite; sauf?: RegExp }

const S = String.raw;
export const FAUX_COURANTS: Faux[] = [
  { id: "carre-somme", re: new RegExp(S`\(\s*a\s*\+\s*b\s*\)\s*(?:²|\^2)\s*=\s*a\s*(?:²|\^2)\s*\+\s*b\s*(?:²|\^2)(?!\s*\+)`, "i"), message: "(a + b)² n'est pas égal à a² + b² : il manque le double produit, (a + b)² = a² + 2ab + b²." },
  { id: "carre-difference", re: new RegExp(S`\(\s*a\s*[-−]\s*b\s*\)\s*(?:²|\^2)\s*=\s*a\s*(?:²|\^2)\s*[-−]\s*b\s*(?:²|\^2)`, "i"), message: "(a − b)² n'est pas égal à a² − b² : (a − b)² = a² − 2ab + b²." },
  { id: "racine-somme", re: new RegExp(S`√\s*\(?\s*a\s*\+\s*b\s*\)?\s*=\s*√\s*a\s*\+\s*√\s*b`, "i"), message: "√(a + b) n'est pas égal à √a + √b (essayer a = 9, b = 16 : √25 = 5 mais 3 + 4 = 7)." },
  { id: "fraction-somme", re: new RegExp(S`\b([a-z0-9]+)\s*/\s*([a-z0-9]+)\s*\+\s*([a-z0-9]+)\s*/\s*([a-z0-9]+)\s*=\s*\(?\s*\1\s*\+\s*\3\s*\)?\s*/\s*\(?\s*\2\s*\+\s*\4\s*\)?`, "i"), message: "On n'additionne pas les numérateurs et les dénominateurs : il faut un dénominateur commun (1/2 + 1/3 = 5/6, pas 2/5)." },
  { id: "ln-somme", re: new RegExp(S`ln\s*\(?\s*a\s*\+\s*b\s*\)?\s*=\s*ln\s*\(?\s*a\s*\)?\s*\+\s*ln\s*\(?\s*b`, "i"), message: "ln(a + b) n'est pas égal à ln a + ln b : c'est ln(a × b) qui vaut ln a + ln b." },
  { id: "ln-produit", re: new RegExp(S`ln\s*\(?\s*a\s*[×*·]\s*b\s*\)?\s*=\s*ln\s*\(?\s*a\s*\)?\s*[×*·]\s*ln\s*\(?\s*b`, "i"), message: "ln(a × b) = ln a + ln b (une somme, pas un produit)." },
  { id: "triangle-angles", re: new RegExp(S`somme des angles d['’]un triangle[^.;\n]{0,40}?(?:est|vaut|=|égale?)\s*(?:à\s*)?(?:de\s*)?(?:90|100|270|360)\s*°`, "i"), message: "La somme des angles d'un triangle est 180°." },
  { id: "quadrilatere-angles", re: new RegExp(S`somme des angles d['’]un quadrilatère[^.;\n]{0,40}?(?:est|vaut|=|égale?)\s*(?:à\s*)?(?:de\s*)?(?:90|180|270)\s*°`, "i"), message: "La somme des angles d'un quadrilatère est 360°." },
  { id: "pythagore-lineaire", re: new RegExp(S`\bc\s*=\s*a\s*\+\s*b\b(?!\s*[²^])`), message: "Pythagore : c² = a² + b² (avec des carrés), pas c = a + b." },
  { id: "pythagore-sans-carre-hyp", re: new RegExp(S`\ba\s*(?:²|\^2)\s*\+\s*b\s*(?:²|\^2)\s*=\s*c(?![²\w^])`), message: "Pythagore : a² + b² = c² (le carré de l'hypoténuse), pas c." },
  { id: "perimetre-cercle", re: new RegExp(S`(?:périmètre|circonférence)[^.;\n]{0,40}=\s*π\s*r\s*(?:²|\^2)`, "i"), message: "Périmètre du cercle = 2πr ; c'est l'aire qui est πr²." },
  { id: "aire-cercle-2pir", re: new RegExp(S`aire[^.;\n]{0,40}(?:cercle|disque)[^.;\n]{0,20}=\s*2\s*π\s*r(?![²\^])`, "i"), message: "Aire du disque = πr² ; 2πr est le périmètre." },
  { id: "aire-cercle-pir", re: new RegExp(S`aire[^.;\n]{0,40}(?:cercle|disque)[^.;\n]{0,20}=\s*π\s*r(?![²\^\w])`, "i"), message: "Aire du disque = πr² (r au carré)." },
  { id: "produit-nul", re: new RegExp(S`(?:ab|a\s*[×·*]\s*b)\s*=\s*0[^.;\n]{0,30}(?:donc|alors)\s*a\s*=\s*0\s*et\s*b\s*=\s*0`, "i"), message: "Un produit est nul si l'un des facteurs est nul : a = 0 OU b = 0 (pas ET)." },
  { id: "derivee-produit", re: new RegExp(S`\(\s*u\s*[×·*]?\s*v\s*\)\s*['′’]\s*=\s*u\s*['′’]\s*[×·*]?\s*v\s*['′’]`, "i"), message: "(uv)′ = u′v + uv′, pas u′ × v′." },
  { id: "derivee-quotient", re: new RegExp(S`\(\s*u\s*/\s*v\s*\)\s*['′’]\s*=\s*u\s*['′’]\s*/\s*v\s*['′’]`, "i"), message: "(u/v)′ = (u′v − uv′)/v², pas u′/v′." },
  { id: "derivee-puissance", re: new RegExp(S`xⁿ[^.;\n]{0,15}=\s*n\s*xⁿ(?!⁻)`, "i"), message: "(xⁿ)′ = n xⁿ⁻¹ (l'exposant diminue de 1)." },
  { id: "discriminant", re: new RegExp(S`Δ\s*=\s*b\s*(?:²|\^2)\s*\+\s*4\s*a\s*c`, "i"), message: "Δ = b² − 4ac (et non + 4ac)." },
  { id: "racines-sans-moins-b", re: new RegExp(S`x\s*(?:=|₁|₂)[^.;\n−\-]{0,6}=?\s*(?:\(\s*)?b\s*±\s*√`, "i"), message: "Racines : x = (−b ± √Δ) / (2a) ; le signe moins devant b est indispensable." },
  { id: "division-par-zero", re: new RegExp(S`division par (?:zéro|0)[^.;\n]{0,40}(?:est égale?|donne|vaut|=)\s*(?:à\s*)?(?:0\b|zéro|l['’]infini|∞)`, "i"), message: "On ne peut pas diviser par zéro : l'opération n'est pas définie." },
  { id: "pourcent-aller-retour", re: new RegExp(S`augment\w+ de (\d+)\s?% puis (?:diminu\w+|baiss\w+) de \1\s?%[^.;\n]{0,50}(?:retrouv\w+|revient|même prix|identique|inchangé)`, "i"), message: "+x % puis −x % ne ramène pas au prix de départ (100 → 120 → 96 pour 20 %)." },
  { id: "un-premier", re: new RegExp(S`\b1\s+est\s+(?:un\s+)?(?:nombre\s+)?premier`, "i"), message: "1 n'est pas un nombre premier (un nombre premier a exactement deux diviseurs)." },
  { id: "deux-pas-premier", re: new RegExp(S`\b2\s+n['’]est\s+pas\s+(?:un\s+)?(?:nombre\s+)?premier`, "i"), message: "2 est un nombre premier (le seul pair)." },
  { id: "premiers-impairs", re: new RegExp(S`(?:tous\s+les\s+)?nombres\s+premiers\s+sont\s+impairs`, "i"), message: "2 est premier et pair : tous les nombres premiers sauf 2 sont impairs." },
  { id: "neuf-premier", re: new RegExp(S`\b(?:9|15|21|27|33|39|51|57)\s+est\s+(?:un\s+)?(?:nombre\s+)?premier`, "i"), message: "Ce nombre n'est pas premier (il est divisible par 3)." },
  { id: "zero-impair", re: new RegExp(S`\b0\s+est\s+(?:un\s+)?(?:nombre\s+)?impair|\b0\s+n['’]est\s+pas\s+(?:un\s+)?(?:nombre\s+)?pair`, "i"), message: "0 est un nombre pair." },
  { id: "vitesse-inversee", re: new RegExp(S`\bv\s*=\s*t\s*/\s*d\b|\bv\s*=\s*d\s*[×·*]\s*t\b|\bd\s*=\s*v\s*/\s*t\b|\bt\s*=\s*v\s*/\s*d\b|\bt\s*=\s*v\s*[×·*]\s*d\b`), message: "Vitesse : v = d / t ; distance : d = v × t ; durée : t = d / v." },
  { id: "conv-km", re: new RegExp(S`\b1\s*km\s*=\s*(?:100|10\s?000|1\s?0000)\s*m\b`), message: "1 km = 1 000 m." },
  { id: "conv-m-cm", re: new RegExp(S`\b1\s*m\s*=\s*(?:10|1\s?000)\s*cm\b`), message: "1 m = 100 cm." },
  { id: "conv-m2", re: new RegExp(S`\b1\s*m²\s*=\s*(?:100|1\s?000)\s*cm²`), message: "1 m² = 10 000 cm² (on élève la conversion au carré : 100 × 100)." },
  { id: "conv-ha", re: new RegExp(S`\b1\s*ha\s*=\s*(?:100|1\s?000|100\s?000)\s*m²`), message: "1 hectare = 10 000 m²." },
  { id: "conv-heure", re: new RegExp(S`\b1\s*h\s*=\s*(?:100|10)\s*min\b|\b1\s*min\s*=\s*(?:100|10)\s*s\b`), message: "1 h = 60 min ; 1 min = 60 s (le temps n'est pas décimal)." },
  { id: "conv-litre", re: new RegExp(S`\b1\s*L\s*=\s*(?:10|1\s?000)\s*cL\b`), message: "1 L = 100 cL." },
  { id: "racine-carre-signe", re: new RegExp(S`√\s*\(?\s*x\s*(?:²|\^2)\s*\)?\s*=\s*x(?![\w|])`, "i"), message: "√(x²) = |x|, pas x (vrai seulement si x ≥ 0).", gravite: "a-corriger", sauf: /x\s*(?:≥|>=)\s*0|positif|\|x\|/i },
];

/** Cas qui demandent le contexte : x² = k, P(A∪B), etc. */
function fauxContextuels(t: string): Constat[] {
  const out: Constat[] = [];
  const m = /x\s*(?:²|\^2)\s*=\s*(\d+)\s*[,;]?\s*(?:donc|alors|d['’]où|on a)\s*x\s*=\s*(\d+)(?!\d|[,.]\d)/i.exec(t);
  if (m) {
    const suite = t.slice(m.index + m[0].length, m.index + m[0].length + 40);
    if (!/ou\b|±|[-−]\s*\d|ou x/i.test(suite)) out.push({ regle: "x2-une-solution", gravite: "a-corriger", message: `x² = ${m[1]} a deux solutions (x = ${m[2]} ou x = −${m[2]}), pas une seule.`, extrait: m[0] });
  }
  const u = /P\(\s*A\s*∪\s*B\s*\)\s*=\s*P\(\s*A\s*\)\s*\+\s*P\(\s*B\s*\)(?!\s*[-−])/.exec(t);
  if (u && !/incompatible|disjoint|∩/i.test(t)) out.push({ regle: "proba-union", gravite: "a-corriger", message: "P(A ∪ B) = P(A) + P(B) seulement si A et B sont incompatibles ; sinon on retranche P(A ∩ B).", extrait: u[0] });
  return out;
}

// ---------- Lisibilité par niveau ----------

type Groupe = "primaire" | "college" | "lycee";
export function groupeDe(niveau: string): Groupe {
  const n = niveau.toLowerCase().replace(/\s.*$/, "").replace("è", "e").replace("é", "e");
  if (["ci", "cp", "ce1", "ce2", "cm1", "cm2"].includes(n)) return "primaire";
  if (["6e", "5e", "4e", "3e", "6eme", "5eme", "4eme", "3eme"].includes(n)) return "college";
  return "lycee";
}

const LIMITES: Record<Groupe, { moy: number; max: number }> = {
  primaire: { moy: 12, max: 22 },
  college: { moy: 20, max: 35 },
  lycee: { moy: 26, max: 45 },
};

const JARGON: Record<Groupe, string[]> = {
  primaire: ["hypoténuse", "dérivée", "fonction", "équation", "vecteur", "intervalle", "polynôme", "théorème", "propriété", "coefficient", "variable", "inconnue", "probabilité", "logarithme"],
  college: ["dérivée", "intégrale", "limite", "logarithme", "exponentielle", "primitive", "matrice", "suite arithmétique"],
  lycee: [],
};

const phrases = (t: string) => normaliser(t).split(/(?<=[.!?;:])\s+/).map((x) => x.trim()).filter((x) => x.split(/\s+/).length >= 2);
const mots = (t: string) => t.split(/\s+/).filter(Boolean).length;

// ---------- Relecture complète ----------

const nombresDe = (t: string) => (normaliser(t).match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => x.replace(",", "."));

export function relireCours(c: CoursNorm): Constat[] {
  const out: Constat[] = [];
  const add = (regle: string, gravite: Gravite, message: string, extrait?: string) => out.push({ regle, gravite, message, extrait });
  const g = groupeDe(c.niveau);

  const blocs: [string, string][] = [
    ["intro", c.intro],
    ...c.etapes.map((e, i): [string, string] => [`étape ${i + 1}`, `${e.titre}. ${e.corps}`]),
    ["exemple", `${c.exemple?.probleme ?? ""} ${c.exemple?.solution ?? ""}`],
    ["pièges", c.pieges],
    ...(c.proprietes ?? []).map((p, i): [string, string] => [`propriété ${i + 1}`, `${p.titre}. ${p.enonce}`]),
  ];

  // 1. Structure
  if (!c.intro || c.intro.trim().length < 40) add("structure-intro", "a-corriger", "Introduction absente ou trop courte (< 40 caractères).");
  if (!c.etapes || c.etapes.length < 2) add("structure-etapes", "a-corriger", "Moins de 2 étapes : la méthode n'est pas décomposée.");
  c.etapes?.forEach((e, i) => { if (!e.titre?.trim() || !e.corps?.trim()) add("structure-etape-vide", "a-corriger", `Étape ${i + 1} sans titre ou sans contenu.`); });
  if (!c.exemple?.probleme?.trim() || !c.exemple?.solution?.trim()) add("structure-exemple", "bloquant", "Exemple absent ou incomplet (énoncé ou solution vide).");
  if (!c.pieges || c.pieges.trim().length < 20) add("structure-pieges", "conseil", "Section « piège » absente ou trop courte : citer l'erreur réelle que font les élèves.");

  // 2. Texte invalide
  for (const [lieu, t] of blocs) {
    const m = /\bNaN\b|\bundefined\b|\[object|\bInfinity\b|\bTODO\b|\bXXX\b|lorem ipsum|\?\?\?/.exec(t);
    if (m) add("texte-invalide", "bloquant", `Texte invalide (« ${m[0]} ») dans : ${lieu}.`);
    if (/\\frac|\\sqrt|\\times|\$[^$]{1,40}\$|\\\(/.test(t)) add("latex-brut", "a-corriger", `Code LaTeX affiché tel quel dans : ${lieu}.`);
    if (/\b\d+\.\d+\b/.test(normaliser(t)) && !/\d+\.\d+\.\d+/.test(t)) add("virgule-decimale", "conseil", `Point décimal au lieu de la virgule dans : ${lieu} (en français : 0,5).`, (/\b\d+\.\d+\b/.exec(t) ?? [""])[0]);
  }

  // 3. Calculs recalculés
  for (const [lieu, t] of blocs) {
    for (const e of verifierCalculs(t)) {
      add(e.arrondi ? "calcul-arrondi" : "calcul-faux", e.arrondi ? "a-corriger" : "bloquant",
        `${lieu} : « ${e.gauche} » vaut ${arrondir(e.vg)} mais est donné égal à « ${e.droite} » (${arrondir(e.vd)}).${e.arrondi ? " Arrondi à vérifier." : ""}`, e.extrait);
    }
  }

  // 4. Formules et énoncés faux courants
  for (const [lieu, t] of blocs) {
    const n = normaliser(t);
    for (const f of FAUX_COURANTS) {
      const m = f.re.exec(n);
      const avertit = !!m && (lieu === "pièges" || /(?:pas|erreur|faux|fausse|piège|attention|jamais|confond\w*|≠|ne vaut|n['’]est|à éviter|contrairement)[^.;\n]{0,60}$/i.test(n.slice(Math.max(0, m.index - 70), m.index)));
      if (m && !avertit && !(f.sauf && f.sauf.test(n))) add(`faux-${f.id}`, f.gravite ?? "bloquant", `${lieu} : ${f.message}`, m[0].slice(0, 90));
    }
    for (const k of fauxContextuels(n)) add(k.regle, k.gravite, `${lieu} : ${k.message}`, k.extrait);
  }

  // 5. Exemple : la solution réutilise-t-elle les données ?
  const nbEnonce = [...new Set(nombresDe(c.exemple?.probleme ?? ""))];
  if (nbEnonce.length && c.exemple?.solution) {
    const nbSol = new Set(nombresDe(c.exemple.solution));
    if (!nbEnonce.some((x) => nbSol.has(x))) add("exemple-donnees", "conseil", "La solution de l'exemple n'utilise aucune donnée de l'énoncé : incohérence probable.");
  }
  if (c.exemple?.solution && c.exemple?.probleme && c.exemple.solution.trim() === c.exemple.probleme.trim()) add("exemple-identique", "bloquant", "Solution identique à l'énoncé.");
  if ((g === "primaire" || c.niveau.toLowerCase().startsWith("6")) && c.exemple?.probleme && mots(c.exemple.probleme) < 5) add("exemple-abstrait", "conseil", "Exemple sans situation concrète : à ce niveau, partir d'une scène connue (marché, école, village).");

  // 6. Lisibilité
  const lim = LIMITES[g];
  const corps = [c.intro, ...c.etapes.map((e) => e.corps)].join(" ");
  const ph = phrases(corps);
  if (ph.length) {
    const moy = ph.reduce((s, p) => s + mots(p), 0) / ph.length;
    const longues = ph.filter((p) => mots(p) > lim.max);
    if (moy > lim.moy) add("lisibilite-moyenne", "conseil", `Phrases longues pour ce niveau : ${moy.toFixed(0)} mots en moyenne (repère : ≤ ${lim.moy}). Couper, une idée par phrase.`);
    if (longues.length) add("lisibilite-phrase-longue", "conseil", `${longues.length} phrase(s) de plus de ${lim.max} mots.`, longues[0].slice(0, 100));
  }
  for (const mot of JARGON[g]) {
    if (new RegExp(`\\b${mot}\\b`, "i").test(corps) && !new RegExp(`${mot}[^.]{0,40}(?:c['’]est|est un|désigne|appelle)`, "i").test(corps))
      add("jargon", "conseil", `Terme technique « ${mot} » sans explication simple pour ce niveau.`);
  }
  return dedoublonner(out);
}

function arrondir(x: number) { return String(Math.round(x * 1e6) / 1e6).replace(".", ","); }
function dedoublonner(xs: Constat[]): Constat[] {
  const vu = new Set<string>();
  return xs.filter((x) => { const k = x.regle + "|" + x.message; if (vu.has(k)) return false; vu.add(k); return true; });
}

const ORDRE: Record<Gravite, number> = { bloquant: 0, "a-corriger": 1, conseil: 2 };
/** Verdict AUTOMATIQUE (pas une validation) : « refuser » dès qu'une erreur de fond est détectée. */
export function verdictAuto(cs: Constat[]): "erreur-detectee" | "a-corriger" | "rien-detecte" {
  if (cs.some((c) => c.gravite === "bloquant")) return "erreur-detectee";
  if (cs.some((c) => c.gravite === "a-corriger")) return "a-corriger";
  return "rien-detecte";
}
export const trier = (cs: Constat[]) => [...cs].sort((a, b) => ORDRE[a.gravite] - ORDRE[b.gravite]);
