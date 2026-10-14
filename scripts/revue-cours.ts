// Relecture automatique des cours de maths. Produit un rapport ; ne valide RIEN (la validation reste humaine, bouton « Valider »).
// Usage : npx esbuild scripts/revue-cours.ts --bundle --platform=node --format=esm --outfile=scripts/.out-revue.mjs && node scripts/.out-revue.mjs [--niveau 4e] [--id maths:4e:slug] [--json] [--sortie docs/validation/revue-auto]
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { LESSONS } from "../src/content/lessons";
import { relireCours, trier, verdictAuto, type CoursNorm } from "./lib/revue-cours-lib";

const arg = (n: string) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const flag = (n: string) => process.argv.includes(`--${n}`);

const niveauFiltre = arg("niveau");
const idFiltre = arg("id");
const sortie = arg("sortie");

function norm(l: any): CoursNorm {
  const [, niveau = "?"] = String(l.notionId).split(":");
  return {
    id: l.notionId, niveau, titre: l.title ?? l.titre ?? l.notionId.split(":").pop(),
    intro: l.intro ?? "",
    etapes: (l.steps ?? []).map((s: any) => ({ titre: s.title ?? "", corps: s.body ?? "" })),
    exemple: { probleme: l.example?.problem ?? "", solution: l.example?.solution ?? "" },
    pieges: Array.isArray(l.pitfalls) ? l.pitfalls.join(" ") : String(l.pitfalls ?? ""),
  };
}

const cours = (LESSONS as any[])
  .filter((l) => String(l.notionId).startsWith("maths:"))
  .map(norm)
  .filter((c) => (!niveauFiltre || c.niveau === niveauFiltre) && (!idFiltre || c.id === idFiltre));

const resultats = cours.map((c) => {
  const constats = trier(relireCours(c));
  return { id: c.id, niveau: c.niveau, verdict: verdictAuto(constats), constats };
});

const nb = (v: string) => resultats.filter((r) => r.verdict === v).length;
const resume = { total: resultats.length, erreurDetectee: nb("erreur-detectee"), aCorriger: nb("a-corriger"), rienDetecte: nb("rien-detecte") };

if (flag("json") || sortie) {
  const json = JSON.stringify({ genereLe: new Date().toISOString(), avertissement: "Relecture automatique. Rien n'est validé : un enseignant décide.", resume, resultats }, null, 2);
  if (sortie) {
    mkdirSync(dirname(sortie), { recursive: true });
    writeFileSync(`${sortie}.json`, json);
    const md = [`# Relecture automatique des cours de maths`, ``, `Rien n'est validé automatiquement. « Rien détecté » ne veut pas dire « correct » : cela veut dire que ces vérifications n'ont rien trouvé.`, ``,
      `Total ${resume.total} · erreur détectée ${resume.erreurDetectee} · à corriger ${resume.aCorriger} · rien détecté ${resume.rienDetecte}`, ``,
      ...resultats.filter((r) => r.constats.length).flatMap((r) => [`## ${r.id} — ${r.verdict}`, ...r.constats.map((c) => `- [${c.gravite}] ${c.message}${c.extrait ? ` (« ${c.extrait} »)` : ""}`), ``])].join("\n");
    writeFileSync(`${sortie}.md`, md);
  } else console.log(json);
} else {
  console.log(`Cours de maths relus : ${resume.total}`);
  console.log(`  erreur détectée : ${resume.erreurDetectee} · à corriger : ${resume.aCorriger} · rien détecté : ${resume.rienDetecte}`);
  for (const r of resultats.filter((x) => x.verdict !== "rien-detecte")) {
    console.log(`\n${r.id} → ${r.verdict}`);
    for (const c of r.constats.filter((x) => x.gravite !== "conseil")) console.log(`  [${c.gravite}] ${c.message}`);
  }
}
