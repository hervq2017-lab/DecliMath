// Situations de départ (contexte → circonstance → tâche) pour habiller un sujet,
// à la manière des épreuves par compétences : une situation, puis des problèmes à résoudre.
import { pick, Rng } from "./core";
import type { Subject } from "../curriculum";

export interface Situation {
  contexte: string;
  circonstance: string;
  tache: string;
}

interface Place { villes: string[]; marche: string; ecoles: string[] }

/** Lieux vraisemblables par pays (noms génériques d'établissements, pas de vrais élèves ni parents). */
const PLACES: Record<string, Place> = {
  BJ: { villes: ["Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Natitingou"], marche: "Dantokpa", ecoles: ["du centre", "de la paix", "du lac", "de la liberté"] },
  CI: { villes: ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "San-Pédro"], marche: "Adjamé", ecoles: ["du centre", "de la paix", "des palmiers", "de la lagune"] },
  SN: { villes: ["Dakar", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor"], marche: "Sandaga", ecoles: ["du centre", "de la teranga", "du fleuve", "de l'avenir"] },
  ML: { villes: ["Bamako", "Sikasso", "Ségou", "Mopti", "Kayes"], marche: "de Médina Coura", ecoles: ["du centre", "du Niger", "de l'espoir", "de l'avenir"] },
  BF: { villes: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora"], marche: "de Rood Woko", ecoles: ["du centre", "de l'espoir", "du Faso", "de l'avenir"] },
  TG: { villes: ["Lomé", "Kara", "Sokodé", "Atakpamé", "Kpalimé"], marche: "d'Assigamé", ecoles: ["du centre", "de l'espoir", "de la paix", "de l'avenir"] },
  NE: { villes: ["Niamey", "Zinder", "Maradi", "Tahoua", "Dosso"], marche: "du Grand Marché", ecoles: ["du centre", "du fleuve", "de l'espoir", "de l'avenir"] },
  GW: { villes: ["Bissau", "Bafatá", "Gabú", "Bissorã"], marche: "de Bandim", ecoles: ["du centre", "de l'espoir", "de l'avenir"] },
  CM: { villes: ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Bamenda"], marche: "Mokolo", ecoles: ["du centre", "de l'unité", "de l'espoir", "de l'avenir"] },
  GA: { villes: ["Libreville", "Port-Gentil", "Franceville", "Oyem"], marche: "de Mont-Bouët", ecoles: ["du centre", "de l'estuaire", "de l'espoir", "de l'avenir"] },
  CG: { villes: ["Brazzaville", "Pointe-Noire", "Dolisie", "Owando"], marche: "Total", ecoles: ["du centre", "du fleuve", "de l'espoir", "de l'avenir"] },
  TD: { villes: ["N'Djamena", "Moundou", "Sarh", "Abéché"], marche: "Dembé", ecoles: ["du centre", "du Chari", "de l'espoir", "de l'avenir"] },
  CF: { villes: ["Bangui", "Bimbo", "Berbérati", "Bambari"], marche: "Km5", ecoles: ["du centre", "de l'Oubangui", "de l'espoir", "de l'avenir"] },
  GQ: { villes: ["Malabo", "Bata", "Ebebiyín"], marche: "central", ecoles: ["du centre", "de l'espoir", "de l'avenir"] },
  GN: { villes: ["Conakry", "Kindia", "Kankan", "Labé"], marche: "de Madina", ecoles: ["du centre", "de l'espoir", "de l'avenir"] },
  CD: { villes: ["Kinshasa", "Lubumbashi", "Goma", "Kisangani"], marche: "central", ecoles: ["du centre", "de l'espoir", "de l'avenir"] },
};
const placeOf = (country: string) => PLACES[country] ?? PLACES.CI;

const PRENOMS = ["Koffi", "Aminata", "Moussa", "Fifamè", "Yao", "Mariam", "Codjo", "Adjoua", "Seydou", "Sènami", "Ibrahim", "Nadège", "Kader", "Awa"];
const MATIERES_LABEL: Record<Subject, string> = { maths: "mathématiques", physique: "sciences physiques", anglais: "anglais" };

export function situationFor(opts: { subject: Subject; country: string; levelLabel: string; chapter: string; problems: number }, r: Rng): Situation {
  const { subject, country, levelLabel, chapter, problems } = opts;
  const pl = placeOf(country);
  const ville = pick(r, pl.villes);
  const nom = pick(r, PRENOMS), nom2 = pick(r, PRENOMS.filter((p) => p !== nom));
  const school = `Collège ${pick(r, pl.ecoles)}`;
  const s = problems > 1 ? "s" : "";

  if (subject === "anglais") {
    return {
      contexte: `Your school in ${ville} is welcoming a group of English-speaking students for a cultural exchange week. ${nom} and ${nom2}, pupils in ${levelLabel}, are in charge of the welcome booklet.`,
      circonstance: `To prepare it, your teacher gives you ${problems} short exercise${s} on « ${chapter} ». The corrected answers will be used in the booklet.`,
      tache: "Read each situation carefully, then answer the questions in good English. Justify your choices when you are asked to.",
    };
  }
  const variantes: Situation[] = subject === "physique"
    ? [
        { contexte: `Le club de sciences du ${school}, à ${ville}, prépare une exposition ouverte aux parents et aux voisins du quartier. ${nom}, élève de ${levelLabel}, est chargé(e) de la fiche « ${chapter} ».`, circonstance: `Pour valider sa fiche, l'équipe doit répondre à ${problems} problème${s} posé${s} par le professeur, avec des mesures et des données réelles.`, tache: `Aide ${nom} : résous les problèmes en rédigeant ta démarche, en écrivant les formules utilisées et en donnant les unités.` },
        { contexte: `Dans la ville de ${ville}, ${nom} et ${nom2}, élèves de ${levelLabel}, accompagnent leur oncle technicien au marché ${pl.marche} pour comprendre le fonctionnement de ses appareils.`, circonstance: `Sur place, ils doivent résoudre ${problems} problème${s} en lien avec le thème « ${chapter} » avant de pouvoir installer correctement le matériel.`, tache: "À partir des informations de chaque problème, mène les calculs et justifie chaque réponse." },
      ]
    : [
        { contexte: `Le ${school}, à ${ville}, organise la foire des métiers et des mathématiques. ${nom} et ${nom2}, élèves de ${levelLabel}, tiennent le stand de leur classe et doivent faire des calculs justes devant les visiteurs.`, circonstance: `Pour préparer le stand, le professeur leur confie ${problems} problème${s} sur le thème « ${chapter} ».`, tache: "Résous les problèmes en présentant clairement ta démarche : données utiles, calculs, résultat avec son unité et phrase de conclusion." },
        { contexte: `${nom}, élève de ${levelLabel} à ${ville}, aide sa famille qui tient une petite boutique près du marché ${pl.marche}. Elle veut vérifier ses comptes et organiser son stock avec plus de rigueur.`, circonstance: `Pour cela, ${nom} doit traiter ${problems} problème${s} liés au thème « ${chapter} ».`, tache: `Aide ${nom} à résoudre ces problèmes : tu dois rédiger ta solution et vérifier que tes résultats sont vraisemblables.` },
        { contexte: `Le conseil des élèves du ${school} (${ville}) prépare un projet pour améliorer la vie de l'établissement. Les délégués de ${levelLabel} ont besoin de chiffres justes pour convaincre le directeur.`, circonstance: `Le professeur de ${MATIERES_LABEL[subject]} leur propose ${problems} problème${s} sur le thème « ${chapter} » pour s'entraîner avant la présentation.`, tache: "Résous les problèmes un par un, rédige tes calculs et conclus par une phrase." },
      ];
  return pick(r, variantes);
}
