// Audit pédagogique des gabarits de maths : mesure, ne juge pas. Usage :
//   npx esbuild scripts/audit-pedagogique.ts --bundle --platform=node --format=esm --outfile=scripts/.audit.mjs && node scripts/.audit.mjs
import "../src/engine";
import { REGISTRY, instantiate } from "../src/content/core";
import { LEVELS, notionById } from "../src/curriculum";

const SEEDS = 30;
const SITUATION = /FCFA|marché|village|élève|classe|école|stade|gare|km|litre|kg|champ|terrain|récolte|prix|boutique|commerçant|budget|moto|taxi|bus|sac |poule|maïs|clou|tonne|salaire|épargne|banque|intérêt|usine|production|âge|tarif|recette|bénéfice|euros?|\bm²|hectare|ferme|agricult|puits|réservoir|échelle|toit|mur|route|trajet|vitesse/i;
const PUR = /^(Calcule|Calculer|Résou|Développ|Factoris|Simplifi|Détermine|Donne|Écris|Ecris|Mets|Trouve|Quel est|Quelle est|Combien)/i;
const mentions = (text: string, v: string) => {
  let from = 0;
  for (;;) {
    const k = text.indexOf(v, from); if (k < 0) return false;
    const before = text[k - 1] ?? "", after = text[k + v.length] ?? "";
    if (!/[\d,]/.test(before) && !/\d/.test(after)) return true;
    from = k + 1;
  }
};
const digitsOut = (s: string) => s.replace(/[-−]?\d+([.,]\d+)?/g, "#");

interface Row { id: string; level: string; notion: string; skill: string; ctxs: number; hasRef: boolean; situ: number; pur: number; distinctStmt: number; distinctReasoning: number; leak: number; noAnswerInSolution: number; dupHints: number; qcm: boolean; n: number }
const rows: Row[] = [];
for (const t of REGISTRY) {
  const notion = notionById(t.notionId)!;
  if (notion.subject !== "maths") continue;
  let situ = 0, pur = 0, leak = 0, noAns = 0, dup = 0, n = 0;
  const stm = new Set<string>(), reasoning = new Set<string>();
  let qcm = false;
  for (const c of t.contexts) for (let seed = 1; seed <= SEEDS; seed++) {
    const i = instantiate(t, c.id, seed); n++;
    stm.add(digitsOut(i.statement)); reasoning.add(digitsOut(i.solution));
    const hasSit = SITUATION.test(i.statement);
    if (hasSit) situ++;
    if (!hasSit && PUR.test(i.statement.trim())) pur++;
    if (i.answer.kind === "choice") { qcm = true; continue; }
    const v = String(Math.round(i.answer.value * 1000) / 1000).replace(".", ",");
    const big = Math.abs(i.answer.value) >= 10 || !Number.isInteger(i.answer.value);
    if (big && i.hints.slice(0, 3).some((h) => mentions(h, v))) leak++;
    const norm = (x: string) => x.replace(/[\s  ]/g, "").replace(/[−–]/g, "-");
    if (!norm(i.solution).includes(norm(v))) noAns++;
    if (new Set(i.hints).size < 4 || i.hints.some((h) => !h.trim())) dup++;
  }
  rows.push({ id: t.id, level: notion.level, notion: notion.title, skill: t.skill ?? "", ctxs: t.contexts.length, hasRef: !!t.ref, situ: situ / n, pur: pur / n, distinctStmt: stm.size, distinctReasoning: reasoning.size, leak: leak / n, noAnswerInSolution: noAns / n, dupHints: dup / n, qcm, n });
}
const pct = (x: number) => Math.round(x * 100) + "%";
console.log(`\n=== AUDIT MATHS : ${rows.length} gabarits, ${SEEDS} graines × contextes ===\n`);
console.log("Niveau      gabarits notions  avec-réf  QCM  énoncé-situé  calcul-pur  contextes(moy)  même-raisonnement");
for (const l of LEVELS) {
  const r = rows.filter((x) => x.level === l.id); if (!r.length) continue;
  const avg = (f: (x: Row) => number) => r.reduce((s, x) => s + f(x), 0) / r.length;
  const same = r.filter((x) => x.distinctReasoning <= x.ctxs * 2).length; // solution identique au chiffre près (à la mise en scène près)
  console.log(`${l.label.padEnd(10)} ${String(r.length).padStart(8)} ${String(new Set(r.map((x) => x.notion)).size).padStart(7)} ${pct(r.filter((x) => x.hasRef).length / r.length).padStart(8)} ${String(r.filter((x) => x.qcm).length).padStart(5)} ${pct(avg((x) => x.situ)).padStart(12)} ${pct(avg((x) => x.pur)).padStart(11)} ${avg((x) => x.ctxs).toFixed(1).padStart(14)} ${pct(same / r.length).padStart(18)}`);
}
const tot = (f: (x: Row) => boolean) => rows.filter(f).length;
console.log(`\nSans référence manuel : ${tot((x) => !x.hasRef)} / ${rows.length}`);
console.log(`Gabarits dont ≥ 80 % des énoncés sont du calcul pur (aucune situation) : ${tot((x) => x.pur >= 0.8)}`);
console.log(`Gabarits sans aucune situation ni formulation « calcul pur » : ${tot((x) => x.situ === 0 && x.pur < 0.2)}`);
console.log(`Gabarits dont la raisonnement ne change qu'au chiffre près (≤ 2 formes de solution / contexte) : ${tot((x) => x.distinctReasoning <= x.ctxs * 2)}`);
console.log(`Gabarits où un indice 1-3 donne la réponse (≥ 10 % des cas) : ${tot((x) => x.leak >= 0.1)}`);
console.log(`Gabarits où la réponse n'apparaît pas dans le corrigé (≥ 10 % des cas) : ${tot((x) => x.noAnswerInSolution >= 0.1 && !x.qcm)}`);
console.log(`Gabarits avec indices vides ou en double : ${tot((x) => x.dupHints > 0)}`);
console.log("\n--- Liste : calcul pur (≥ 80 %) par niveau ---");
for (const l of LEVELS) { const r = rows.filter((x) => x.level === l.id && x.pur >= 0.8); if (r.length) console.log(l.label, r.length, "ex:", r.slice(0, 3).map((x) => x.skill || x.id).join(" | ")); }
console.log("\n--- Indices qui donnent la réponse (exemples) ---");
for (const x of rows.filter((x) => x.leak >= 0.1).slice(0, 8)) console.log(`${x.id} (${pct(x.leak)}) ${x.skill}`);
console.log("\n--- Réponse absente du corrigé (exemples) ---");
for (const x of rows.filter((x) => x.noAnswerInSolution >= 0.1 && !x.qcm).slice(0, 8)) console.log(`${x.id} (${pct(x.noAnswerInSolution)}) ${x.skill}`);

if (process.env.SAMPLE) {
  for (const id of process.env.SAMPLE.split(",")) {
    const t = REGISTRY.find((x) => x.id === id)!; const i = instantiate(t, t.contexts[0].id, 3);
    console.log("\n#", id, "\n", i.statement, "\n RÉP:", JSON.stringify(i.answer), "\n HINTS:", i.hints, "\n SOL:", i.solution);
  }
}
