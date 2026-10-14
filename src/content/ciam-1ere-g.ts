// CIAM Première S : suites numériques et statistique (séries regroupées en classes).
import { fr, int, num, pick, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("1ere", "ciam1");
const BOOK = "CIAM 1ère S";
const SU = "Suites numériques — série C";
const ST = "Statistique à une variable — série C";
const S = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const P = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const nz = (r: () => number, lo: number, hi: number) => { let v = 0; while (v === 0) v = lo + Math.floor(r() * (hi - lo + 1)); return v; };
const term = (a: number, v: string, first: boolean) => {
  if (a === 0) return "";
  const m = Math.abs(a) === 1 && v !== "" ? "" : String(Math.abs(a));
  return first ? `${a < 0 ? "−" : ""}${m}${v}` : ` ${a < 0 ? "−" : "+"} ${m}${v}`;
};

export const T1G: Template[] = [
  // ===== Chapitre 15 : Suites numériques =====
  mk("su-explicite", SU, 1, { skill: "Calculer un terme d'une suite définie par une formule explicite", ref: `${BOOK}, chap. 15 §1.1 (p. 284) et ex. 1 (p. 286)`, kw: ["suite", "terme général", "formule explicite", "uₙ", "rang"] }, (c, r) => {
    const t = int(r, 0, 2);
    const n = int(r, 3, 12);
    if (t === 0) { const a = nz(r, 1, 4), b = int(r, -3, 5), cc = int(r, 1, 4), d = int(r, 1, 6); const v = (a * n + b) / (cc * n + d); return { statement: `(uₙ) est la suite définie pour tout entier naturel n par uₙ = (${term(a, "n", true)}${term(b, "", false)})/(${term(cc, "n", true)}${term(d, "", false)}). Calcule u${n} (arrondi au centième).`, answer: num(round(v, 2), 0.01), hints: H("On remplace n par sa valeur.", `Numérateur : ${a} × ${n} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${a * n + b}.`, `Dénominateur : ${cc} × ${n} + ${d} = ${cc * n + d}.`, "Divise."), solution: `u${n} = ${a * n + b}/${cc * n + d} ≈ ${S(round(v, 2))}.` }; }
    if (t === 1) { const k = int(r, 1, 30); return { statement: `(uₙ) est la suite définie par uₙ = n² − ${k}. Calcule u${n}.`, answer: num(n * n - k), hints: H("On remplace n par sa valeur.", `${n}² = ${n * n}.`, `${n * n} − ${k}.`, "Calcule."), solution: `u${n} = ${n * n} − ${k} = ${n * n - k}.` }; }
    const a = nz(r, 1, 5), b = int(r, -8, 8); const v = a * n + b; const rang = n; return { statement: `(uₙ) est la suite définie par uₙ = ${term(a, "n", true)}${term(b, "", false)}. Quel est le terme de rang ${rang} ?`, answer: num(v), hints: H("Le terme de rang n est uₙ.", `n = ${rang}.`, `${a} × ${rang} ${b < 0 ? "−" : "+"} ${Math.abs(b)}.`, "Calcule."), solution: `u${rang} = ${v}.` };
  }),
  mk("su-recurrence", SU, 2, { skill: "Calculer un terme d'une suite définie par récurrence", ref: `${BOOK}, chap. 15 §1.1 (p. 284) et ex. 1.c, 1.e (p. 286)`, kw: ["suite récurrente", "uₙ₊₁", "premier terme", "relation de récurrence"] }, (c, r) => {
    const a = pick(r, [2, 3, -1, -2, 0.5]), b = int(r, -4, 5), u0 = int(r, -3, 4);
    const k = int(r, 3, 5);
    let u = u0;
    for (let i = 0; i < k; i++) u = a * u + b;
    const rel = `uₙ₊₁ = ${a === 0.5 ? "½uₙ" : a === -1 ? "−uₙ" : `${a}uₙ`}${b === 0 ? "" : ` ${b < 0 ? "−" : "+"} ${Math.abs(b)}`}`;
    return { statement: `(uₙ) est définie par u₀ = ${S(u0)} et, pour tout entier naturel n, ${rel}. Calcule u${k}.`, answer: num(round(u, 3), 0.01), hints: H("On calcule les termes de proche en proche.", `u₁ = ${a} × ${P(u0)} + ${P(b)} = ${S(round(a * u0 + b, 3))}.`, "Continue avec la même règle.", `Il faut aller jusqu'à u${k}.`), solution: `En appliquant ${k} fois la relation : u${k} = ${S(round(u, 3))}.` };
  }),
  mk("su-arithmetique", SU, 2, { skill: "Suite arithmétique : uₙ = u₀ + nr", ref: `${BOOK}, chap. 15 §3.1 (p. 291-292) et ex. 3.a-3.c`, kw: ["suite arithmétique", "raison", "uₙ = u₀ + nr", "premier terme"] }, (c, r) => {
    const u0 = int(r, -6, 10), rr = nz(r, -5, 6), n = int(r, 5, 20);
    const t = int(r, 0, 1);
    if (t === 0) return { statement: `(uₙ) est une suite arithmétique de premier terme u₀ = ${S(u0)} et de raison ${S(rr)}. Calcule u${n}.`, answer: num(u0 + n * rr), hints: H("Pour tout n : uₙ = u₀ + n·r.", `n = ${n}, r = ${S(rr)}.`, `${n} × ${P(rr)} = ${n * rr}.`, "Ajoute u₀."), solution: `u${n} = ${S(u0)} + ${n} × ${P(rr)} = ${S(u0 + n * rr)}.` };
    const p = int(r, 1, 4), q = p + int(r, 2, 5);
    const up = u0 + p * rr, uq = u0 + q * rr;
    return { statement: `(uₙ) est une suite arithmétique avec u${p} = ${S(up)} et u${q} = ${S(uq)}. Quelle est sa raison ?`, answer: num(rr), hints: H("uₙ = uₖ + (n − k)·r.", `u${q} − u${p} = (${q} − ${p})·r.`, `${S(uq)} − ${P(up)} = ${S(uq - up)}.`, `Divise par ${q - p}.`), solution: `r = (${S(uq)} − ${P(up)})/(${q} − ${p}) = ${S(rr)}.` };
  }),
  mk("su-geometrique", SU, 2, { skill: "Suite géométrique : uₙ = u₀ qⁿ", ref: `${BOOK}, chap. 15 §3.2 (p. 293-294)`, kw: ["suite géométrique", "raison", "uₙ = u₀ qⁿ", "quotient"] }, (c, r) => {
    const u0 = nz(r, -4, 5), q = pick(r, [2, 3, -2, 0.5, 10, -1]);
    const n = int(r, 3, 8);
    const v = u0 * q ** n;
    return { statement: `(uₙ) est une suite géométrique de premier terme u₀ = ${S(u0)} et de raison ${S(q)}. Calcule u${n}.`, answer: num(round(v, 4), 0.001), hints: H("Pour tout n : uₙ = u₀ × qⁿ.", `q^${n} = ${S(round(q ** n, 4))}.`, `${S(u0)} × ${P(round(q ** n, 4))}.`, "Calcule."), solution: `u${n} = ${S(u0)} × ${P(q)}^${n} = ${S(round(v, 4))}.` };
  }),
  mk("su-somme", SU, 3, { skill: "Somme de termes consécutifs d'une suite arithmétique ou géométrique", ref: `${BOOK}, chap. 15 §3.1-3.2 (p. 292 et 294)`, kw: ["somme", "termes consécutifs", "n(a+b)/2", "a(1−qⁿ)/(1−q)"] }, (c, r) => {
    const geo = int(r, 0, 1) === 0;
    const n = int(r, 4, 10);
    if (!geo) { const a = int(r, -3, 8), rr = nz(r, -3, 5); let tot = 0; for (let i = 0; i < n; i++) tot += a + i * rr; const last = a + (n - 1) * rr; return { statement: `(uₙ) est une suite arithmétique de premier terme u₀ = ${S(a)} et de raison ${S(rr)}. Calcule la somme u₀ + u₁ + … + u${n - 1} (${n} termes).`, answer: num(tot), hints: H("La somme de n termes consécutifs est n fois la demi-somme des termes extrêmes.", `Dernier terme : u${n - 1} = ${S(last)}.`, `${n} × (${S(a)} + ${P(last)})/2.`, "Calcule."), solution: `S = ${n} × (${S(a)} + ${P(last)})/2 = ${S(tot)}.` }; }
    const a = int(r, 1, 5), q = pick(r, [2, 3, 0.5, -2]); let tot = 0; for (let i = 0; i < n; i++) tot += a * q ** i;
    return { statement: `(uₙ) est une suite géométrique de premier terme u₀ = ${a} et de raison ${S(q)}. Calcule la somme u₀ + u₁ + … + u${n - 1} (${n} termes, arrondie au millième).`, answer: num(round(tot, 3), 0.002), hints: H("Si q ≠ 1 : S = a × (1 − qⁿ)/(1 − q).", `a = ${a}, q = ${S(q)}, n = ${n}.`, `qⁿ = ${S(round(q ** n, 4))}.`, "Calcule."), solution: `S = ${a} × (1 − ${P(round(q ** n, 4))})/(1 − ${P(q)}) = ${S(round(tot, 3))}.` };
  }),
  mk("su-nature", SU, 2, { skill: "Reconnaître une suite arithmétique, géométrique ou ni l'une ni l'autre", ref: `${BOOK}, chap. 15 §3 (p. 291-293), méthodes de démonstration`, kw: ["suite arithmétique", "suite géométrique", "différence constante", "quotient constant"] }, (c, r) => {
    const t = int(r, 0, 2);
    let txt: string, f: (n: number) => number;
    if (t === 0) { const a = nz(r, -3, 4), b = int(r, -5, 5); txt = `${term(a, "n", true)}${term(b, "", false)}`; f = (n) => a * n + b; } else if (t === 1) { const a = nz(r, 1, 4), q = pick(r, [2, 3, -2]); txt = `${a} × ${q < 0 ? `(−${-q})` : q}ⁿ`; f = (n) => a * q ** n; } else { const k = int(r, 1, 5); txt = `n² + ${k}`; f = (n) => n * n + k; }
    const arith = [0, 1, 2, 3].every((n) => f(n + 1) - f(n) === f(1) - f(0));
    const geo = [0, 1, 2, 3].every((n) => f(n) !== 0 && f(n + 1) * f(0) === f(n) * f(1));
    const idx = arith ? 0 : geo ? 1 : 2;
    return { statement: `La suite (uₙ) est définie par uₙ = ${txt}. Est-elle arithmétique, géométrique, ou ni l'une ni l'autre ?`, answer: { kind: "choice", options: ["Arithmétique", "Géométrique", "Ni arithmétique ni géométrique"], index: idx }, hints: H("Calcule uₙ₊₁ − uₙ (arithmétique : constante) et uₙ₊₁/uₙ (géométrique : constant).", `u₀ = ${S(f(0))}, u₁ = ${S(f(1))}, u₂ = ${S(f(2))}.`, `u₁ − u₀ = ${S(f(1) - f(0))} ; u₂ − u₁ = ${S(f(2) - f(1))}.`, "Compare aussi les quotients."), solution: idx === 0 ? `uₙ₊₁ − uₙ = ${S(f(1) - f(0))} est constant : suite arithmétique.` : idx === 1 ? "uₙ₊₁/uₙ est constant : suite géométrique." : "Ni la différence ni le quotient de deux termes consécutifs n'est constant." };
  }, QCM),
  mk("su-variation", SU, 2, { skill: "Sens de variation d'une suite : signe de uₙ₊₁ − uₙ", ref: `${BOOK}, chap. 15 §2.2 (p. 288) et ex. 2.b (p. 290)`, kw: ["sens de variation", "croissante", "décroissante", "uₙ₊₁ − uₙ", "monotone"] }, (c, r) => {
    const t = int(r, 0, 2);
    let txt: string, f: (n: number) => number;
    if (t === 0) { const k = int(r, 1, 6); txt = `n² + ${k}`; f = (n) => n * n + k; } else if (t === 1) { const a = nz(r, -3, 3), b = int(r, -5, 5); txt = `${term(a, "n", true)}${term(b, "", false)}`; f = (n) => a * n + b; } else { const k = int(r, 1, 6); txt = `${k} − n²`; f = (n) => k - n * n; }
    const inc = Array.from({ length: 30 }, (_, n) => f(n + 1) - f(n)).every((d) => d >= 0);
    const dec = Array.from({ length: 30 }, (_, n) => f(n + 1) - f(n)).every((d) => d <= 0);
    const idx = inc && !dec ? 0 : dec && !inc ? 1 : 2;
    return { statement: `(uₙ) est définie pour tout n ∈ ℕ par uₙ = ${txt}. Quel est son sens de variation ?`, answer: { kind: "choice", options: ["Croissante", "Décroissante", "Constante"], index: inc && dec ? 2 : idx }, hints: H("Étudie le signe de uₙ₊₁ − uₙ.", `u₀ = ${S(f(0))}, u₁ = ${S(f(1))}, u₂ = ${S(f(2))}.`, `uₙ₊₁ − uₙ = ${S(f(2) - f(1))} pour n = 1.`, "Conclus avec le signe de cette différence pour tout n."), solution: `uₙ₊₁ − uₙ est ${inc && dec ? "nul" : inc ? "positif" : "négatif"} pour tout n : la suite est ${inc && dec ? "constante" : inc ? "croissante" : "décroissante"}.` };
  }, QCM),
  mk("su-limite", SU, 2, { skill: "Limite d'une suite : (qⁿ), uₙ = f(n)", ref: `${BOOK}, chap. 15 §2.3 et §3.2 (p. 288-290 et 294-295)`, kw: ["limite d'une suite", "convergente", "divergente", "qⁿ", "limite"] }, (c, r) => {
    const t = int(r, 0, 1);
    if (t === 0) { const q = pick(r, [2, 3, 1.5, 0.5, 0.2, 1, -0.5, -2, -1]); const ans = q > 1 ? "+∞" : q === 1 ? "1" : q > -1 ? "0" : "Pas de limite"; const opts = ["+∞", "0", "1", "Pas de limite"]; const qs = q === 0.5 ? "1/2" : q === 0.2 ? "1/5" : q === -0.5 ? "(−1/2)" : q < 0 ? `(−${-q})` : String(q).replace(".", ","); return { statement: `Quelle est la limite de la suite (qⁿ) pour q = ${qs} quand n tend vers +∞ ?`.replace("q = 1/2 ", "q = 1/2 "), answer: { kind: "choice", options: opts, index: opts.indexOf(ans) }, hints: H("Distingue q > 1, q = 1, 0 < q < 1, −1 < q < 0, q ≤ −1.", "Si q > 1 : +∞ ; si q = 1 : 1 ; si |q| < 1 : 0 ; si q ≤ −1 : pas de limite.", `Ici q = ${qs}.`, "Conclus."), solution: `Pour q = ${qs} : ${ans === "Pas de limite" ? "la suite n'a pas de limite" : `la limite est ${ans}`}.` }; }
    const a = nz(r, -4, 5), b = int(r, -4, 4), cc = nz(r, 1, 4), d = int(r, 1, 5);
    return { statement: `Quelle est la limite de la suite uₙ = (${term(a, "n", true)}${term(b, "", false)})/(${term(cc, "n", true)}${term(d, "", false)}) quand n tend vers +∞ ? (arrondi au centième)`, answer: num(round(a / cc, 2), 0.01), hints: H("uₙ = f(n) : la limite est celle de f en +∞.", "En +∞, le quotient de deux polynômes de même degré a pour limite le quotient des coefficients dominants.", `${a}/${cc}.`, "Calcule."), solution: `lim uₙ = ${a}/${cc} ≈ ${S(round(a / cc, 2))}.` };
  }, QCM),
  mk("su-cours", SU, 1, { skill: "Suites numériques : vocabulaire et propriétés (cours)", ref: `${BOOK}, chap. 15 (p. 284-295)`, kw: ["suite", "arithmétique", "géométrique", "majorée", "convergente", "monotone"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Qu'est-ce qu'une suite numérique ?", good: "Une fonction de ℕ vers ℝ", bad: ["Une fonction de ℝ vers ℕ", "Une équation du second degré", "Une liste de points alignés"], why: "Définition du manuel (§1.1)." },
      { q: "Une suite (uₙ) est arithmétique de raison r si :", good: "uₙ₊₁ = uₙ + r pour tout n", bad: ["uₙ₊₁ = r × uₙ pour tout n", "uₙ = r × n²", "uₙ₊₁ = uₙ²"], why: "Définition du manuel (§3.1)." },
      { q: "Une suite (uₙ) est géométrique de raison q si :", good: "uₙ₊₁ = q × uₙ pour tout n", bad: ["uₙ₊₁ = uₙ + q pour tout n", "uₙ = q + n", "uₙ₊₁ = uₙ + n"], why: "Définition du manuel (§3.2)." },
      { q: "Que vaut uₙ pour une suite arithmétique de premier terme u₀ et de raison r ?", good: "u₀ + n·r", bad: ["u₀ × rⁿ", "u₀ + r", "u₀ · n + r²"], why: "Propriété du manuel (§3.1)." },
      { q: "Que vaut uₙ pour une suite géométrique de premier terme u₀ et de raison q ?", good: "u₀ × qⁿ", bad: ["u₀ + n·q", "u₀ × n·q", "u₀ · qⁿ⁺¹"], why: "Propriété du manuel (§3.2)." },
      { q: "Une suite est majorée si :", good: "il existe un réel M tel que uₙ ≤ M pour tout n", bad: ["tous ses termes sont positifs", "elle est croissante", "elle a une limite"], why: "Définition du manuel (§2.1)." },
      { q: "(uₙ) est croissante si et seulement si :", good: "uₙ ≤ uₙ₊₁ pour tout n", bad: ["uₙ ≥ uₙ₊₁ pour tout n", "uₙ > 0 pour tout n", "uₙ = uₙ₊₁ pour tout n"], why: "Propriété du manuel (§2.2)." },
      { q: "Une suite convergente est une suite qui :", good: "a une limite finie", bad: ["est croissante", "est bornée uniquement", "a pour limite +∞"], why: "Définition du manuel (§2.3)." },
      { q: "Que vaut 1 + 2 + 3 + … + n ?", good: "n(n + 1)/2", bad: ["n²", "n(n − 1)", "n(n + 1)"], why: "Exemple du manuel (§3.1) : somme de termes consécutifs d'une suite arithmétique." },
      { q: "Que vaut la somme des n premiers nombres impairs 1 + 3 + 5 + … + (2n − 1) ?", good: "n²", bad: ["n(n + 1)", "2n − 1", "n²/2"], why: "Exemple du manuel (§3.1)." },
    ];
    return qcmOf(r, pool, "Reprends les définitions du chapitre.");
  }, QCM),

  // ===== Chapitre 16 : Statistique =====
  ...(() => {
    /** Série en classes : bornes a₀ < a₁ < … ; effectifs. */
    const serie = (r: () => number) => {
      const k = int(r, 4, 5), w = pick(r, [5, 10, 2]), a0 = int(r, 0, 4) * w;
      const bornes = Array.from({ length: k + 1 }, (_, i) => a0 + i * w);
      const eff = Array.from({ length: k }, () => int(r, 3, 20));
      return { k, w, bornes, eff };
    };
    const cl = (b: number[], i: number) => `[${b[i]} ; ${b[i + 1]}[`;
    const tab = (s: ReturnType<typeof serie>) => s.eff.map((e, i) => `${cl(s.bornes, i)} : ${e}`).join(" ; ");
    return [
      mk("st-cumules", ST, 1, { skill: "Effectifs cumulés croissants et décroissants", ref: `${BOOK}, chap. 16 §1.1 (p. 302-303)`, kw: ["effectifs cumulés", "croissant", "décroissant", "classes", "statistique"] }, (c, r) => {
        const s = serie(r);
        const i = int(r, 1, s.k - 1);
        const inc = int(r, 0, 1) === 0;
        const v = inc ? s.eff.slice(0, i + 1).reduce((a, b) => a + b, 0) : s.eff.slice(i).reduce((a, b) => a + b, 0);
        return { statement: `Série statistique (classe : effectif) : ${tab(s)}. Quel est l'effectif cumulé ${inc ? "croissant" : "décroissant"} de la classe ${cl(s.bornes, i)} ?`, answer: num(v), hints: H(inc ? "L'effectif cumulé croissant de la classe k est n₁ + … + nₖ." : "L'effectif cumulé décroissant de la classe k est nₖ + … + nₚ.", inc ? `Additionne les effectifs des classes jusqu'à ${cl(s.bornes, i)}.` : `Additionne les effectifs depuis ${cl(s.bornes, i)} jusqu'à la dernière classe.`, `Effectifs concernés : ${(inc ? s.eff.slice(0, i + 1) : s.eff.slice(i)).join(" + ")}.`, "Calcule."), solution: `${(inc ? s.eff.slice(0, i + 1) : s.eff.slice(i)).join(" + ")} = ${v}.` };
      }),
      mk("st-moyenne", ST, 2, { skill: "Moyenne d'une série regroupée en classes (centres de classes)", ref: `${BOOK}, chap. 16 §1.2 (p. 305)`, kw: ["moyenne", "centre de classe", "effectif", "série statistique"] }, (c, r) => {
        const s = serie(r);
        const cen = s.bornes.slice(0, -1).map((b) => b + s.w / 2);
        const N = s.eff.reduce((a, b) => a + b, 0);
        const sum = cen.reduce((t, x, i) => t + x * s.eff[i], 0);
        const m = sum / N;
        return { statement: `Série statistique (classe : effectif) : ${tab(s)}. Calcule la moyenne de cette série (arrondie au centième).`, answer: num(round(m, 2), 0.01), hints: H("On remplace chaque classe par son centre xᵢ : x̄ = (Σ nᵢxᵢ)/N.", `Centres : ${cen.map(fr).join(" ; ")}. N = ${N}.`, `Σ nᵢxᵢ = ${fr(sum)}.`, "Divise par N."), solution: `x̄ = ${fr(sum)}/${N} ≈ ${fr(round(m, 2))}.` };
      }),
      mk("st-classe-modale", ST, 1, { skill: "Classe modale et mode", ref: `${BOOK}, chap. 16 §1.2 (p. 304)`, kw: ["classe modale", "mode", "effectif maximal", "série statistique"] }, (c, r) => {
        const s = serie(r);
        const mx = Math.max(...s.eff);
        const idxs = s.eff.map((e, i) => (e === mx ? i : -1)).filter((i) => i >= 0);
        if (idxs.length > 1) s.eff[idxs[1]] -= 1;
        const i = s.eff.indexOf(Math.max(...s.eff));
        const mode = s.bornes[i] + s.w / 2;
        return { statement: `Série statistique (classe : effectif) : ${tab(s)}. Quel est le centre de la classe modale (le mode de la série) ?`, answer: num(mode, 0.01), hints: H("La classe modale est la classe d'effectif maximal.", `L'effectif maximal est ${Math.max(...s.eff)}.`, `Classe modale : ${cl(s.bornes, i)}.`, "Calcule son centre."), solution: `Classe modale ${cl(s.bornes, i)}, de centre ${fr(mode)}.` };
      }),
      mk("st-mediane", ST, 3, { skill: "Médiane d'une série en classes (interpolation linéaire)", ref: `${BOOK}, chap. 16 §1.1 et §1.2 (p. 303-305)`, kw: ["médiane", "interpolation linéaire", "effectifs cumulés", "polygone"] }, (c, r) => {
        const s = serie(r);
        const N = s.eff.reduce((a, b) => a + b, 0);
        const half = N / 2;
        let cum = 0, i = 0;
        for (; i < s.k; i++) { if (cum + s.eff[i] >= half) break; cum += s.eff[i]; }
        const med = s.bornes[i] + ((half - cum) / s.eff[i]) * s.w;
        return { statement: `Série statistique (classe : effectif) : ${tab(s)}. Calcule la médiane par interpolation linéaire (arrondie au centième).`, answer: num(round(med, 2), 0.01), hints: H("La médiane partage l'effectif total en deux : on cherche la valeur dont l'effectif cumulé croissant est N/2.", `N = ${N}, N/2 = ${fr(half)}.`, `La classe médiane est ${cl(s.bornes, i)} (effectif cumulé avant elle : ${cum}).`, "Interpole linéairement dans cette classe."), solution: `M = ${s.bornes[i]} + (${fr(half)} − ${cum})/${s.eff[i]} × ${s.w} ≈ ${fr(round(med, 2))}.` };
      }),
      mk("st-ecart-type", ST, 3, { skill: "Variance et écart type d'une série en classes (formule de Kœnig)", ref: `${BOOK}, chap. 16 §1.3 (p. 305)`, kw: ["variance", "écart type", "formule de Kœnig", "dispersion"] }, (c, r) => {
        const s = serie(r);
        const cen = s.bornes.slice(0, -1).map((b) => b + s.w / 2);
        const N = s.eff.reduce((a, b) => a + b, 0);
        const m = cen.reduce((t, x, i) => t + x * s.eff[i], 0) / N;
        const V = cen.reduce((t, x, i) => t + s.eff[i] * x * x, 0) / N - m * m;
        const askV = int(r, 0, 1) === 0;
        return { statement: `Série statistique (classe : effectif) : ${tab(s)}. Calcule ${askV ? "la variance" : "l'écart type"} de cette série (arrondi au centième).`, answer: num(round(askV ? V : Math.sqrt(V), 2), 0.02), hints: H("V = (1/N) Σ nᵢxᵢ² − x̄² (formule de Kœnig).", `Centres : ${cen.map(fr).join(" ; ")} ; moyenne x̄ ≈ ${fr(round(m, 3))}.`, `V ≈ ${fr(round(V, 3))}.`, askV ? "C'est la réponse." : "L'écart type est σ = √V."), solution: askV ? `V ≈ ${fr(round(V, 2))}.` : `V ≈ ${fr(round(V, 2))}, σ = √V ≈ ${fr(round(Math.sqrt(V), 2))}.` };
      }),
      mk("st-cours", ST, 1, { skill: "Séries en classes : définitions de la moyenne, de la médiane et des caractéristiques de dispersion", ref: `${BOOK}, chap. 16 §1 (p. 302-305)`, kw: ["classe modale", "médiane", "moyenne", "variance", "écart type", "polygone des effectifs"] }, (_c, r) => {
        const pool: Item[] = [
          { q: "Qu'appelle-t-on classe modale d'une série en classes ?", good: "La classe d'effectif maximal", bad: ["La classe du milieu", "La classe de plus grande amplitude", "La classe contenant la moyenne"], why: "Définition du manuel (§1.2)." },
          { q: "Comment calcule-t-on la moyenne d'une série en classes ?", good: "En remplaçant chaque classe par son centre et en pondérant par les effectifs", bad: ["En prenant la moyenne des bornes inférieures", "En prenant la classe modale", "En additionnant les effectifs"], why: "Définition du manuel (§1.2) : x̄ = (1/N) Σ nᵢxᵢ." },
          { q: "Qu'est-ce que la médiane d'une série statistique ?", good: "Le nombre qui partage la population en deux parties de même effectif", bad: ["La valeur la plus fréquente", "La moyenne des valeurs extrêmes", "Le centre de la classe modale"], why: "Définition du manuel (§1.2)." },
          { q: "Comment obtient-on la médiane sur les polygones des effectifs cumulés ?", good: "C'est l'abscisse du point d'ordonnée N/2 (ou 50 %)", bad: ["C'est l'ordonnée du point d'abscisse N/2", "C'est le point le plus haut du polygone", "C'est l'abscisse du dernier point"], why: "Remarque du manuel (§1.2)." },
          { q: "La formule de Kœnig donne la variance par :", good: "V = (1/N) Σ nᵢxᵢ² − x̄²", bad: ["V = (1/N) Σ nᵢxᵢ − x̄", "V = x̄²", "V = √σ"], why: "Remarque du manuel (§1.3)." },
          { q: "L'écart type σ est :", good: "la racine carrée de la variance", bad: ["le carré de la variance", "la moyenne des écarts", "égal à la médiane"], why: "Définition du manuel (§1.3) : σ = √V." },
          { q: "L'effectif cumulé croissant d'une classe est :", good: "la somme des effectifs de cette classe et de toutes les classes précédentes", bad: ["l'effectif de la classe seule", "la somme des effectifs des classes suivantes", "le produit des effectifs"], why: "Définition du manuel (§1.1)." },
        ];
        return qcmOf(r, pool, "Reprends les définitions du §1.");
      }, QCM),
    ];
  })(),
];
