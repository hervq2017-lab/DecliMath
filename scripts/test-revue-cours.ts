// Auto-contrôle de la relecture : des cas étalons dont la réponse est connue.
// Si un cas échoue, le détecteur est déréglé : ne pas se fier à ses résultats.
// Lancer : npx esbuild scripts/test-revue-cours.ts --bundle --platform=node --format=esm --outfile=scripts/.out-test.mjs && node scripts/.out-test.mjs
import { evaluer, verifierCalculs, relireCours, type CoursNorm } from "./lib/revue-cours-lib";

let ok = 0, ko = 0;
const t = (nom: string, cond: boolean) => { cond ? ok++ : (ko++, console.error("ÉCHEC :", nom)); };
const proche = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 1e-9;

// Évaluateur
t("priorité × avant +", proche(evaluer("2 + 3 × 4"), 14));
t("parenthèses", proche(evaluer("(2 + 3) × 4"), 20));
t("puissance", proche(evaluer("3²"), 9));
t("racine", proche(evaluer("√49"), 7));
t("virgule décimale", proche(evaluer("0,5 × 4"), 2));
t("division", proche(evaluer("12 / 4"), 3));
t("négatif", proche(evaluer("-3 + 5"), 2));
t("mal formé", evaluer("2 + × 3") === null);
t("lettre refusée", evaluer("2x + 1") === null);

// Calculs faux détectés / justes acceptés
t("faux détecté", verifierCalculs("On a 3 + 4 × 2 = 14").length === 1);
t("juste accepté", verifierCalculs("On a 3 + 4 × 2 = 11").length === 0);
t("chaîne juste", verifierCalculs("12 + 8 = 20 = 4 × 5").length === 0);
t("chaîne fausse", verifierCalculs("12 + 8 = 20 = 4 × 6").length === 1);
t("milliers", verifierCalculs("1 500 + 250 = 1 750").length === 0);
t("variable ignorée", verifierCalculs("3x + 2 = 8").length === 0);
t("f(x) ignoré", verifierCalculs("f(2) = 3 × 2 + 1 = 7").length === 0);
t("arrondi toléré", verifierCalculs("1 / 3 = 0,33").length === 0);
t("arrondi trop grossier", verifierCalculs("2 / 3 = 0,6").length === 1);
t("fraction juste", verifierCalculs("1/2 + 1/3 = 5/6").length === 0);
t("pythagore juste", verifierCalculs("3² + 4² = 9 + 16 = 25").length === 0);
t("pythagore faux", verifierCalculs("3² + 4² = 9 + 16 = 24").length === 1);

t("ln 1 = 0 ignoré", verifierCalculs("On sait que ln 1 = 0").length === 0);

// Cours étalons
const base: CoursNorm = {
  id: "maths:4e:test", niveau: "4e", titre: "Test",
  intro: "On utilise ce théorème pour trouver une longueur manquante dans un triangle rectangle.",
  etapes: [{ titre: "Repérer", corps: "On repère l'angle droit et le côté en face." }, { titre: "Calculer", corps: "On additionne les carrés des deux côtés." }],
  exemple: { probleme: "Un triangle rectangle a des côtés de 3 cm et 4 cm.", solution: "3² + 4² = 9 + 16 = 25 donc l'hypoténuse mesure 5 cm." },
  pieges: "Ne pas oublier de prendre la racine carrée à la fin du calcul.",
};
const regles = (c: CoursNorm) => relireCours(c).map((x) => x.regle);

t("cours sain : aucun bloquant", !relireCours(base).some((x) => x.gravite === "bloquant"));
t("calcul faux bloquant", regles({ ...base, exemple: { ...base.exemple, solution: "3² + 4² = 9 + 16 = 24 donc 5 cm." } }).includes("calcul-faux"));
t("(a+b)² faux", regles({ ...base, etapes: [...base.etapes, { titre: "Développer", corps: "On sait que (a + b)² = a² + b²." }] }).includes("faux-carre-somme"));
t("(a+b)² juste accepté", !regles({ ...base, etapes: [...base.etapes, { titre: "Développer", corps: "On sait que (a + b)² = a² + 2ab + b²." }] }).includes("faux-carre-somme"));
t("somme angles faux", regles({ ...base, intro: "La somme des angles d'un triangle est 360° dans tous les cas, retenons-le bien." }).includes("faux-triangle-angles"));
t("piège qui énonce l'erreur : toléré", !regles({ ...base, pieges: "Erreur fréquente : écrire (a + b)² = a² + b² alors qu'il manque 2ab." }).includes("faux-carre-somme"));
t("1 premier", regles({ ...base, etapes: [...base.etapes, { titre: "Premiers", corps: "On retient que 1 est un nombre premier." }] }).includes("faux-un-premier"));
t("vitesse inversée", regles({ ...base, etapes: [...base.etapes, { titre: "Vitesse", corps: "La formule est v = t / d." }] }).includes("faux-vitesse-inversee"));
t("exemple vide bloquant", regles({ ...base, exemple: { probleme: "", solution: "" } }).includes("structure-exemple"));
t("NaN bloquant", regles({ ...base, intro: "Le résultat vaut NaN dans ce cas particulier du calcul demandé." }).includes("texte-invalide"));
t("LaTeX brut", regles({ ...base, intro: "On calcule \\frac{1}{2} de la quantité totale donnée dans l'énoncé du problème." }).includes("latex-brut"));
t("x² = 9 → x = 3 seul", regles({ ...base, etapes: [...base.etapes, { titre: "Résoudre", corps: "x² = 9, donc x = 3." }] }).includes("x2-une-solution"));
t("x² = 9 → ± accepté", !regles({ ...base, etapes: [...base.etapes, { titre: "Résoudre", corps: "x² = 9, donc x = 3 ou x = -3." }] }).includes("x2-une-solution"));

console.log(`Auto-contrôle : ${ok} réussis, ${ko} échoués.`);
process.exit(ko ? 1 : 0);
