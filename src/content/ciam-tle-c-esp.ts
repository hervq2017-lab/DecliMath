// CIAM Terminale SM (série C) : chapitre 6, Applications de l'espace (projections, translations, homothéties, réflexions, demi-tours).
// Énoncés originaux, réponses calculées par le code. Les constructions et démonstrations du manuel ne se corrigent pas
// automatiquement : on en garde les calculs (coordonnées, expressions analytiques, points invariants) et le cours.
import { choice, fr, int, num, pick, Rng, Template } from "./core";
import { ciam, H, Item, QCM, qcmOf } from "./ciam-kit";

const mk = ciam("tle", "ciamte");
const BOOK = "CIAM Terminale SM";
const GE = "Géométrie analytique dans l'espace — série C";
const FR = [{ id: "calcul", label: "Calcul" }];
type V3 = [number, number, number];
const n2 = (x: number) => (x < 0 ? `−${fr(-x)}` : fr(x));
const par = (x: number) => (x < 0 ? `(−${fr(-x)})` : fr(x));
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (r: Rng, lo: number, hi: number) => { let v = 0; while (v === 0) v = int(r, lo, hi); return v; };
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const pt = (p: V3) => `(${p.map(n2).join(" ; ")})`;
const rv = (r: Rng, k = 5): V3 => [int(r, -k, k), int(r, -k, k), int(r, -k, k)];
const AX = ["x", "y", "z"], ORD = ["première", "deuxième", "troisième"];
const lc = (cs: number[], names: string[]) => cs.map((c, i) => (c === 0 ? "" : `${i === 0 ? (c < 0 ? "−" : "") : c < 0 ? " − " : " + "}${Math.abs(c) === 1 && names[i] ? "" : Math.abs(c)}${names[i]}`)).join("") || "0";

export const TC_ESP: Template[] = [
  mk("es-proj-plan-axes", GE, 2, { skill: "Projection sur un plan z = c parallèlement à un axe : image d'un point", ref: `${BOOK}, chap. 6 §1.2, expression analytique d'une projection (p. 127) et ex. 1.e-1.f (p. 128)`, kw: ["projection", "plan z = c", "parallèlement à l'axe", "expression analytique", "image d'un point"] }, (_c, r) => {
    const c = int(r, -5, 5), M = rv(r, 6), k = int(r, 0, 2);
    return { statement: `p est la projection sur le plan d'équation z = ${n2(c)}, parallèlement à la droite de vecteur directeur k (0 ; 0 ; 1). Quelle est la ${ORD[k]} coordonnée de l'image du point M ${pt(M)} ?`, answer: num(k === 2 ? c : M[k]), hints: H("p est la projection sur z = c parallèlement à l'axe (Oz).", "L'expression analytique est x′ = x ; y′ = y ; z′ = c.", `M a pour coordonnées ${pt(M)}.`, "Lis la coordonnée demandée."), solution: `p(M) = (${n2(M[0])} ; ${n2(M[1])} ; ${n2(c)}).` };
  }, FR),
  mk("es-proj-droite", GE, 2, { skill: "Projection sur une droite x = a, y = b parallèlement à un plan z = 0 : image d'un point", ref: `${BOOK}, chap. 6 §1.2, expression analytique (p. 127)`, kw: ["projection sur une droite", "parallèlement à un plan", "x′ = a", "y′ = b", "z′ = z"] }, (_c, r) => {
    const a = int(r, -4, 4), b = int(r, -4, 4), M = rv(r, 6), k = int(r, 0, 2);
    return { statement: `q est la projection sur la droite d'équations x = ${n2(a)}, y = ${n2(b)}, parallèlement au plan de vecteurs directeurs i et j. Quelle est la ${ORD[k]} coordonnée de l'image du point M ${pt(M)} ?`, answer: num(k === 0 ? a : k === 1 ? b : M[2]), hints: H("q projette sur la droite parallèlement au plan (xOy).", "Son expression analytique est x′ = a ; y′ = b ; z′ = z.", `M a pour coordonnées ${pt(M)}.`, "Lis la coordonnée demandée."), solution: `q(M) = (${n2(a)} ; ${n2(b)} ; ${n2(M[2])}).` };
  }, FR),
  mk("es-proj-orthogonale", GE, 3, { skill: "Projeté orthogonal d'un point sur un plan d'équation ax + by + cz + d = 0", ref: `${BOOK}, chap. 6 §1.3, travaux dirigés (p. 127-128) et ex. 1.e (p. 128)`, kw: ["projection orthogonale", "plan", "projeté", "vecteur normal", "coordonnées du projeté"] }, (_c, r) => {
    for (;;) {
      const n = rv(r, 3), d = int(r, -6, 6), M = rv(r, 5), nn = dot(n, n);
      if (nn === 0) continue;
      const t = -(dot(n, M) + d) / nn, H3 = [0, 1, 2].map((i) => M[i] + t * n[i]), k = int(r, 0, 2);
      return { statement: `Dans un repère orthonormé, (𝒫) est le plan d'équation ${lc(n, AX)} ${d < 0 ? "−" : "+"} ${Math.abs(d)} = 0 et M ${pt(M)}. Quelle est la ${ORD[k]} coordonnée du projeté orthogonal de M sur (𝒫) (arrondie au centième) ?`, answer: num(r2(H3[k]), 0.01), hints: H("Le projeté H vérifie MH = t n où n est un vecteur normal à (𝒫).", `n = ${pt(n)}.`, `H = M + t n et H ∈ (𝒫) donne t = −(n·M + d)/‖n‖² = ${n2(-(dot(n, M) + d))}/${nn}.`, "Calcule les coordonnées de H."), solution: `t = ${n2(-(dot(n, M) + d))}/${nn} ; H = ${pt(H3.map((v) => r2(v)) as V3)}.` };
    }
  }, FR),
  mk("es-translation", GE, 1, { skill: "Image d'un point par une translation de l'espace : x′ = x + a", ref: `${BOOK}, chap. 6 §2.1, expression analytique d'une translation (p. 129) et ex. 2.a-2.b (p. 133)`, kw: ["translation", "vecteur", "expression analytique", "x′ = x + a", "image"] }, (_c, r) => {
    const u = rv(r, 4), M = rv(r, 5), k = int(r, 0, 2);
    return { statement: `t est la translation de vecteur u ${pt(u)}. Quelle est la ${ORD[k]} coordonnée de l'image du point M ${pt(M)} ?`, answer: num(M[k] + u[k]), hints: H("Pour une translation de vecteur (a ; b ; c), x′ = x + a, y′ = y + b, z′ = z + c.", `u = ${pt(u)}.`, `${n2(M[k])} + ${par(u[k])}.`, "Calcule."), solution: `t(M) = (${n2(M[0] + u[0])} ; ${n2(M[1] + u[1])} ; ${n2(M[2] + u[2])}).` };
  }, FR),
  mk("es-homothetie", GE, 2, { skill: "Homothétie de l'espace : expression analytique x′ = kx + (1 − k)a et image d'un point", ref: `${BOOK}, chap. 6 §2.2, expression analytique d'une homothétie (p. 131) et ex. 2.a (p. 133) et ex. 2.e (p. 133)`, kw: ["homothétie", "centre Ω", "rapport k", "x′ = kx + (1 − k)a", "image d'un point"] }, (_c, r) => {
    const k = pick(r, [2, 3, -2, -1, 4, 0.5, -3]), O = rv(r, 3), M = rv(r, 5), ask = int(r, 0, 3), c = O.map((v) => (1 - k) * v), im = M.map((v, i) => k * v + c[i]);
    if (ask < 3) return { statement: `h est l'homothétie de centre Ω ${pt(O)} et de rapport ${n2(k)}. Quelle est la ${ORD[ask]} coordonnée de l'image du point M ${pt(M)} ?`, answer: num(im[ask], 0.001), hints: H("Pour l'homothétie de centre Ω(a ; b ; c) et de rapport k, x′ = kx + (1 − k)a.", `(1 − k) = ${n2(1 - k)}.`, `${AX[ask]}′ = ${n2(k)} × ${par(M[ask])} + ${n2(1 - k)} × ${par(O[ask])}.`, "Calcule."), solution: `h(M) = ${pt(im as V3)}.` };
    const f = int(r, 0, 2); return { statement: `h est l'application d'expression analytique x′ = ${n2(k)}x + ${par(c[0])} ; y′ = ${n2(k)}y + ${par(c[1])} ; z′ = ${n2(k)}z + ${par(c[2])}. C'est une homothétie de rapport ${n2(k)}. Quelle est la ${ORD[f]} coordonnée de son centre ?`, answer: num(O[f], 0.001), hints: H("Le centre est l'unique point invariant : x = kx + p.", `(1 − k)x = ${n2(c[f])}.`, `x = ${n2(c[f])}/${n2(1 - k)}.`, "Calcule."), solution: `${AX[f]}_Ω = ${n2(c[f])}/${n2(1 - k)} = ${n2(O[f])}.` };
  }, FR),
  mk("es-composee-homotheties", GE, 3, { skill: "Composée de deux homothéties de l'espace : rapport, translation, centre", ref: `${BOOK}, chap. 6 §2.2, composées (p. 131-132) et ex. 2.f (p. 133)`, kw: ["composée de deux homothéties", "rapport kk′", "translation", "centre", "kk′ = 1"] }, (_c, r) => {
    const k1 = pick(r, [2, 3, -2, 0.5, -1, 4]), k2 = pick(r, [2, 3, -2, 0.5, -1, 4, 1 / k1, -1 / k1]), t = int(r, 0, 1), kk = k1 * k2;
    if (t === 0) return { statement: `h₁ est une homothétie de rapport ${n2(k1)} et h₂ une homothétie de rapport ${n2(Math.round(k2 * 1e6) / 1e6)} (centres distincts). Quel est le rapport de h₂∘h₁ s'il s'agit d'une homothétie (arrondi au centième) ?`, answer: num(r2(kk), 0.01), hints: H("Le rapport de la composée est le produit des rapports.", `${n2(k1)} × ${par(Math.round(k2 * 1e6) / 1e6)}.`, "Si ce produit vaut 1, c'est une translation.", "Calcule."), solution: `k = ${n2(k1)} × ${par(Math.round(k2 * 1e6) / 1e6)} = ${n2(r2(kk))}.` };
    return { statement: `h₁ est une homothétie de rapport ${n2(k1)} et h₂ une homothétie de rapport ${n2(Math.round((1 / k1) * 1e6) / 1e6)}, de centres distincts. La composée h₂∘h₁ est…`, answer: choice(r, ["une translation", "une homothétie de rapport 1", "l'identité", "une symétrie centrale"], 0), hints: H("Le produit des rapports est k × 1/k = 1.", "Si kk′ = 1, la composée est une translation (ou l'identité si les centres sont confondus).", "Les centres sont distincts.", "Ce n'est donc pas l'identité."), solution: "kk′ = 1 et centres distincts : h₂∘h₁ est une translation non nulle." };
  }, QCM),
  mk("es-reflexion-plan", GE, 3, { skill: "Réflexion de plan z = c : expression analytique et image", ref: `${BOOK}, chap. 6 §3.1, expression analytique d'une réflexion (p. 135) et ex. 3.1 (p. 139-140)`, kw: ["réflexion", "symétrie orthogonale par rapport à un plan", "z′ = −z + 2c", "plan médiateur"] }, (_c, r) => {
    const c = int(r, -4, 4), M = rv(r, 6), k = int(r, 0, 2);
    return { statement: `s est la réflexion de plan (Π) d'équation z = ${n2(c)}. Quelle est la ${ORD[k]} coordonnée de l'image du point M ${pt(M)} ?`, answer: num(k === 2 ? -M[2] + 2 * c : M[k]), hints: H("L'expression analytique de la réflexion de plan z = c est x′ = x ; y′ = y ; z′ = −z + 2c.", `2c = ${n2(2 * c)}.`, `M a pour coordonnées ${pt(M)}.`, "Lis la coordonnée demandée."), solution: `s(M) = (${n2(M[0])} ; ${n2(M[1])} ; ${n2(-M[2] + 2 * c)}).` };
  }, FR),
  mk("es-reflexion-quelconque", GE, 3, { skill: "Image d'un point par la réflexion d'un plan quelconque ax + by + cz + d = 0", ref: `${BOOK}, chap. 6 §3.3, expression analytique d'une réflexion (p. 139-140) et ex. 3.1 (p. 139)`, kw: ["réflexion", "plan", "symétrique orthogonal", "milieu", "vecteur normal"] }, (_c, r) => {
    for (;;) {
      const n = rv(r, 3), d = int(r, -6, 6), M = rv(r, 5), nn = dot(n, n);
      if (nn === 0) continue;
      const t = -(dot(n, M) + d) / nn, S = [0, 1, 2].map((i) => M[i] + 2 * t * n[i]), k = int(r, 0, 2);
      return { statement: `Dans un repère orthonormé, (Π) est le plan d'équation ${lc(n, AX)} ${d < 0 ? "−" : "+"} ${Math.abs(d)} = 0. Quelle est la ${ORD[k]} coordonnée du symétrique de M ${pt(M)} par rapport à (Π) (arrondie au centième) ?`, answer: num(r2(S[k]), 0.01), hints: H("Le milieu de [MM′] est le projeté orthogonal H de M sur (Π).", `n = ${pt(n)} est normal à (Π).`, `M′ = M + 2t n avec t = −(n·M + d)/‖n‖² = ${n2(-(dot(n, M) + d))}/${nn}.`, "Calcule."), solution: `M′ = ${pt(S.map((v) => r2(v)) as V3)}.` };
    }
  }, FR),
  mk("es-demi-tour", GE, 3, { skill: "Demi-tour d'axe parallèle à un axe du repère : x′ = −x + 2a, y′ = −y + 2b", ref: `${BOOK}, chap. 6 §3.2, expression analytique d'un demi-tour (p. 137-138)`, kw: ["demi-tour", "symétrie orthogonale par rapport à une droite", "x′ = −x + 2a", "axe (Δ)"] }, (_c, r) => {
    const a = int(r, -4, 4), b = int(r, -4, 4), M = rv(r, 6), k = int(r, 0, 2);
    return { statement: `s est le demi-tour d'axe (Δ) de système d'équations x = ${n2(a)}, y = ${n2(b)} (parallèle à (Oz)). Quelle est la ${ORD[k]} coordonnée de l'image du point M ${pt(M)} ?`, answer: num(k === 0 ? -M[0] + 2 * a : k === 1 ? -M[1] + 2 * b : M[2]), hints: H("Pour l'axe d'équations x = a, y = b, l'expression analytique est x′ = −x + 2a ; y′ = −y + 2b ; z′ = z.", `2a = ${n2(2 * a)} et 2b = ${n2(2 * b)}.`, `M a pour coordonnées ${pt(M)}.`, "Lis la coordonnée demandée."), solution: `s(M) = (${n2(-M[0] + 2 * a)} ; ${n2(-M[1] + 2 * b)} ; ${n2(M[2])}).` };
  }, FR),
  mk("es-composees", GE, 3, { skill: "Composée de réflexions ou de demi-tours : translation, demi-tour ou symétrie centrale", ref: `${BOOK}, chap. 6 §3.1-3.2, composées (p. 135-139)`, kw: ["composée de réflexions", "plans parallèles", "plans perpendiculaires", "demi-tours", "symétrie centrale", "translation"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "La composée de deux réflexions de plans parallèles est…", good: "une translation de vecteur normal à ces plans", bad: ["un demi-tour", "une symétrie centrale", "une homothétie"], why: "Propriétés, p. 136." },
      { q: "La composée de deux réflexions de plans perpendiculaires suivant une droite (Δ) est…", good: "le demi-tour d'axe (Δ)", bad: ["la symétrie centrale", "une translation", "l'identité"], why: "Propriétés 2, p. 137." },
      { q: "La composée de deux demi-tours d'axes parallèles est…", good: "une translation de vecteur orthogonal à ces axes", bad: ["un demi-tour", "une rotation", "une symétrie centrale"], why: "Propriétés 1, p. 138." },
      { q: "La composée de deux demi-tours d'axes perpendiculaires en A est…", good: "le demi-tour dont l'axe est la perpendiculaire commune à ces deux axes en A", bad: ["la symétrie centrale de centre A", "une translation", "l'identité"], why: "Propriétés 2, p. 138." },
      { q: "La composée d'un demi-tour d'axe (Δ) et d'une réflexion de plan (Π) orthogonal à (Δ) en A est…", good: "la symétrie centrale de centre A", bad: ["un demi-tour", "une translation", "l'identité"], why: "Propriétés, p. 139." },
      { q: "Toute translation de vecteur u non nul est la composée de…", good: "deux réflexions de plans parallèles de vecteur normal u", bad: ["deux réflexions de plans sécants", "une réflexion et un demi-tour", "deux homothéties"], why: "Propriétés, p. 136." },
      { q: "Combien de plans de symétrie un cube possède-t-il ?", good: "9", bad: ["3", "6", "12"], why: "Travaux dirigés, p. 141." },
      { q: "Combien d'axes de symétrie (demi-tours) un cube possède-t-il ?", good: "9", bad: ["3", "6", "13"], why: "Travaux dirigés, p. 141-142." },
    ];
    return qcmOf(r, pool, "Pense aux composées dans le plan : axes parallèles, axes sécants.");
  }, QCM),
  mk("es-proprietes-cours", GE, 1, { skill: "Applications de l'espace : questions de cours", ref: `${BOOK}, chap. 6 §1 à §3 (p. 124-141)`, kw: ["projection", "translation", "homothétie", "isométrie", "réflexion", "demi-tour", "application affine"] }, (_c, r) => {
    const pool: Item[] = [
      { q: "Qu'est-ce qu'une isométrie de l'espace ?", good: "Une application de l'espace dans lui-même qui conserve la distance", bad: ["Une application qui conserve seulement les angles", "Une application qui multiplie les distances par k", "Une application constante"], why: "Rappel p. 124." },
      { q: "Une isométrie de l'espace conserve…", good: "l'alignement, le parallélisme, l'orthogonalité, les aires et les volumes", bad: ["seulement les distances", "seulement les angles", "ni les aires ni les volumes"], why: "Rappel p. 124." },
      { q: "Une projection de l'espace est…", good: "une application affine", bad: ["une isométrie", "une homothétie", "une transformation bijective"], why: "Conséquence, p. 126." },
      { q: "Quel est l'ensemble des points invariants d'une projection sur un plan (𝒫) ?", good: "Le plan (𝒫)", bad: ["Un point", "Une droite", "L'espace entier"], why: "Propriétés, p. 125." },
      { q: "L'image de l'espace par une projection sur un plan (𝒫) est…", good: "le plan (𝒫)", bad: ["l'espace", "une droite", "un point"], why: "Propriétés, p. 125." },
      { q: "Quels sont les points invariants d'une translation de vecteur non nul ?", good: "Aucun", bad: ["Tous", "Un seul", "Une droite"], why: "Définition, p. 129." },
      { q: "Une homothétie de rapport k multiplie les volumes par…", good: "|k|³", bad: ["k", "k²", "|k|"], why: "Remarques, p. 130 (aires k², volumes |k|³)." },
      { q: "Qu'est-ce que la réflexion de plan (Π) ?", good: "La symétrie orthogonale par rapport au plan (Π)", bad: ["La symétrie centrale", "Une translation", "Un demi-tour"], why: "Définition, p. 134." },
      { q: "Quel est l'ensemble des points invariants d'un demi-tour d'axe (Δ) ?", good: "La droite (Δ)", bad: ["Un plan", "Un point", "L'espace entier"], why: "Remarques, p. 137." },
      { q: "Le plan médiateur de [AB] est…", good: "le plan orthogonal à (AB) en son milieu", bad: ["le plan contenant (AB)", "le plan parallèle à (AB)", "la droite (AB)"], why: "Propriété, p. 133." },
    ];
    return qcmOf(r, pool, "Reviens à la définition de la transformation.");
  }, QCM),
];
