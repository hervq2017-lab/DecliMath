// CIAM Première S : assemblage des gabarits. Les notions « série C » communes à la série D sont dupliquées en D.
import { register, Template } from "./core";
import { notionById, nid } from "../curriculum";
import { T1A } from "./ciam-1ere-a";
import { T1B } from "./ciam-1ere-b";
import { T1C } from "./ciam-1ere-c";
import { T1D } from "./ciam-1ere-d";
import { T1E } from "./ciam-1ere-e";
import { T1F } from "./ciam-1ere-f";
import { T1G } from "./ciam-1ere-g";

const ALL: Template[] = [...T1A, ...T1B, ...T1C, ...T1D, ...T1E, ...T1F, ...T1G];

/** Notions de Première série D qui existent dans le skeleton (même titre que la série C). */
const D_OK = new Set([
  "Barycentre", "Angles orientés et trigonométrie", "Équations et inéquations du second degré dans ℝ", "Systèmes d'équations linéaires dans ℝ² et dans ℝ³",
  "Généralités sur les fonctions", "Limites et continuité", "Extension de la notion de limite", "Dérivation", "Étude et représentation graphique d'une fonction",
  "Suites numériques", "Statistique à une variable", "Dénombrement", "Orthogonalité dans l'espace", "Composées de transformations du plan",
]);

const toD = (t: Template): Template | null => {
  const n = notionById(t.notionId);
  const m = n && /^(.*) — série C$/.exec(n.title);
  if (!m || !D_OK.has(m[1])) return null;
  return { ...t, id: `${t.id}-d`, notionId: nid("maths", "1ere", `${m[1]} — série D`) };
};

register(...ALL, ...ALL.map(toD).filter((x): x is Template => x !== null));
