// Vérifie tous les gabarits : pas d'exception, réponses finies, bons contextes, couverture.
import { REGISTRY, instantiate, checkAnswer } from "../src/content/core";
import "../src/engine";
import { coverage, buildExam, examScope } from "../src/engine";
import { LEVELS, SUBJECT_LABEL, Subject } from "../src/curriculum";

let bad = 0;
for (const t of REGISTRY) {
  for (const c of t.contexts) {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      try {
        const i = instantiate(t, c.id, seed);
        seen.add(i.statement);
        const a = i.answer;
        if (a.kind === "number") {
          if (!Number.isFinite(a.value)) throw new Error("réponse non finie");
          if (!checkAnswer(a, String(a.value))) throw new Error("réponse refusée");
        } else if (a.index < 0 || a.index >= a.options.length || new Set(a.options).size !== a.options.length) throw new Error("QCM invalide");
        if (/NaN|undefined|\[object/.test(i.statement + i.solution + i.hints.join(""))) throw new Error("texte invalide: " + i.statement);
      } catch (e) { bad++; console.log("ÉCHEC", t.id, c.id, seed, (e as Error).message); break; }
    }
    if (seen.size < 3 && t.id.startsWith("m-") === false) console.log("variété faible (QCM):", t.id, c.id, seen.size);
  }
}
const cov = coverage();
console.log(`${REGISTRY.length} gabarits, ${cov.covered}/${cov.total} notions couvertes, ${bad} échec(s)`);
for (const s of ["maths", "physique", "anglais"] as Subject[]) {
  console.log(SUBJECT_LABEL[s], LEVELS.map((l) => `${l.label}:${cov.rows.filter((r) => r.n.subject === s && r.n.level === l.id && r.templates).length}/${cov.rows.filter((r) => r.n.subject === s && r.n.level === l.id).length}`).join(" "));
}
const ex = buildExam({ subject: "maths", level: "3e", kind: "exit", seed: 5 });
console.log("épreuve maths 3e:", ex.items.length, "questions", ex.durationMin, "min", ex.outOf, "pts; scope", examScope({ subject: "maths", level: "3e", kind: "exit", seed: 5 }).length);
process.exit(bad ? 1 : 0);
