import {
  PHILOSOPHIE_CITATIONS,
  PHILOSOPHIE_EXERCISE_TYPES,
  PHILOSOPHIE_LEVELS,
} from "../src/content/philosophie";

let failures = 0;
const check = (condition: boolean, message: string) => {
  console.log(`${condition ? "OK   " : "ECHEC "}${message}`);
  if (!condition) failures++;
};

check(PHILOSOPHIE_LEVELS.map((level) => level.id).join(",") === "2nde,1ere,tle", "le parcours couvre Seconde, Première et Terminale");
check(PHILOSOPHIE_CITATIONS.length >= 8, "le dossier contient un ensemble varié de citations");
check(new Set(PHILOSOPHIE_CITATIONS.map((citation) => citation.id)).size === PHILOSOPHIE_CITATIONS.length, "chaque fiche possède un identifiant unique");
check(PHILOSOPHIE_CITATIONS.every((citation) => citation.author.trim() && citation.work.trim() && citation.reference.trim()), "chaque citation affiche auteur, œuvre et repère");
check(PHILOSOPHIE_CITATIONS.every((citation) => citation.citation.length <= 220), "les extraits de citation restent courts");
check(PHILOSOPHIE_CITATIONS.every((citation) => PHILOSOPHIE_EXERCISE_TYPES.every((type) => citation.exercises[type.id]?.length)), "chaque citation propose les quatre types d’exercice");
check(PHILOSOPHIE_CITATIONS.every((citation) => citation.correction.trim()), "chaque fiche propose une piste de correction");

console.log(failures ? `\n${failures} échec(s)` : "\n0 échec(s)");
process.exit(failures ? 1 : 0);
