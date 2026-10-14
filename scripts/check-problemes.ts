// Contrôle qualité des problèmes de situation : chaque variante est recalculée par un vérificateur indépendant.
// Usage : npx esbuild scripts/check-problemes.ts --bundle --platform=node --format=esm --outfile=scripts/.pb.mjs && node scripts/.pb.mjs
import "../src/engine";
import { checkAnswer } from "../src/content/core";
import { PROBLEMES_SITUES, instancierProbleme, problemeById, registerProbleme } from "../src/content/problemes-situes";

const SEEDS = 500;
let bad = 0;
const fail = (id: string, seed: number, msg: string) => { if (bad++ < 40) console.log("ÉCHEC", id, "graine", seed, "—", msg); };
const contientNombre = (texte: string, v: string) => {
  for (let k = texte.indexOf(v); k >= 0; k = texte.indexOf(v, k + 1)) {
    const avant = texte[k - 1] ?? "", apres = texte[k + v.length] ?? "";
    if (!/[0-9,]/.test(avant) && !/[0-9]/.test(apres)) return true;
  }
  return false;
};
const digits = (a: { kind: string; value?: number }) => (a.kind === "number" ? String(a.value).replace(".", ",") : "");

for (const p of PROBLEMES_SITUES) {
  const stm = new Set<string>(); const answers = new Set<string>();
  for (let seed = 1; seed <= SEEDS; seed++) {
    try {
      const { instance, verifier } = p.tirer(seed);
      for (const m of verifier()) fail(p.id, seed, "vérificateur : " + m);
      stm.add(instance.enonce);
      if (/NaN|undefined|\[object|Infinity/.test(JSON.stringify(instance))) fail(p.id, seed, "texte invalide");
      instance.questions.forEach((q, qi) => {
        const tag = `q${qi + 1}`;
        if (q.answer.kind === "number") {
          if (!Number.isFinite(q.answer.value)) fail(p.id, seed, tag + " réponse non finie");
          if (!checkAnswer(q.answer, String(q.answer.value))) fail(p.id, seed, tag + " réponse refusée par le moteur");
          if (!checkAnswer(q.answer, String(q.answer.value).replace(".", ","))) fail(p.id, seed, tag + " réponse à virgule refusée");
          answers.add(`${qi}:${q.answer.value}`);
        } else if (q.answer.index < 0 || q.answer.index >= q.answer.options.length) fail(p.id, seed, tag + " QCM invalide");
        if (q.hints.some((h) => !h.trim()) || new Set(q.hints).size < 4) fail(p.id, seed, tag + " indices vides ou en double");
        if (!q.etapes.length || !q.methode.trim()) fail(p.id, seed, tag + " corrigé ou méthode vide");
        // Aucun indice ne donne la réponse finale (hors cas d'un nombre à 1 chiffre, ambigu).
        const v = digits(q.answer);
        if (v && v.length >= 3 && q.hints.some((h) => contientNombre(h, v))) fail(p.id, seed, tag + " un indice contient la réponse " + v);
        // Une erreur fréquente listée ne doit jamais être acceptée comme bonne réponse.
        for (const er of q.erreurs) if (q.answer.kind === "number" && checkAnswer(q.answer, String(er.reponse))) fail(p.id, seed, tag + " l'erreur type " + er.reponse + " est acceptée comme juste");
        if (q.answer.kind === "number" && !q.etapes.join(" ").replace(/[\s  ]/g, "").replace(/[−]/g, "-").includes(String(Math.round(q.answer.value * 1000) / 1000).replace(".", ",").replace(/[\s]/g, ""))) fail(p.id, seed, tag + " la réponse n'apparaît pas dans le corrigé");
      });
      const pts = instance.questions.reduce((s, q) => s + q.points, 0);
      if (pts <= 0) fail(p.id, seed, "barème nul");
    } catch (e) { fail(p.id, seed, "exception : " + (e as Error).message); }
  }
  console.log(`${p.id.padEnd(20)} ${p.niveau.padEnd(5)} énoncés distincts: ${String(stm.size).padStart(3)}/${SEEDS}  réponses distinctes: ${answers.size}  statut: ${p.statut}  programme vérifié: ${p.programme.verifie}`);
}
// Garde-fous du registre
const guard = (label: string, f: () => void) => { try { f(); bad++; console.log("ÉCHEC garde-fou :", label); } catch { console.log("garde-fou OK :", label); } };
const base = problemeById("pb-6e-ananas")!;
guard("annale sans autorisation refusée", () => registerProbleme({ ...base, id: "x1", origine: "annale", source: { type: "annale", reference: "BEPC 2019", autorisation: "a-obtenir" } }));
guard("annale sans référence refusée", () => registerProbleme({ ...base, id: "x2", origine: "annale", source: { type: "annale", reference: " ", autorisation: "obtenue" } }));
guard("« valide-enseignant » refusé sans validation", () => registerProbleme({ ...base, id: "x3", statut: "valide-enseignant" }));
console.log(`\n${PROBLEMES_SITUES.length} problèmes × ${SEEDS} variantes, ${bad} échec(s)`);
process.exit(bad ? 1 : 0);
