export type PhilosophieExerciseType = "comprendre" | "analyser" | "discuter" | "dissertation";
export type PhilosophieLevel = "2nde" | "1ere" | "tle";

export const PHILOSOPHIE_LEVELS: { id: PhilosophieLevel; label: string }[] = [
  { id: "2nde", label: "Seconde" },
  { id: "1ere", label: "Première" },
  { id: "tle", label: "Terminale" },
];

export const PHILOSOPHIE_EXERCISE_TYPES: { id: PhilosophieExerciseType; label: string; description: string }[] = [
  { id: "comprendre", label: "Comprendre une citation", description: "Reformuler, définir les notions et éclairer le sens." },
  { id: "analyser", label: "Analyser un raisonnement", description: "Dégager la thèse, les étapes de l’argument et les présupposés." },
  { id: "discuter", label: "Discuter une thèse", description: "Construire une objection, une réponse et un exemple." },
  { id: "dissertation", label: "Préparer une dissertation", description: "Formuler un problème et organiser un plan argumenté." },
];

export interface PhilosophieCitation {
  id: string;
  theme: string;
  citation: string;
  author: string;
  work: string;
  reference: string;
  note?: string;
  exercises: Record<PhilosophieExerciseType, string[]>;
  correction: string;
}

const prompts = (
  comprendre: string[],
  analyser: string[],
  discuter: string[],
  dissertation: string[],
): PhilosophieCitation["exercises"] => ({ comprendre, analyser, discuter, dissertation });

export const PHILOSOPHIE_CITATIONS: PhilosophieCitation[] = [
  {
    id: "socrate-examen",
    theme: "Conscience et vérité",
    citation: "« Une vie sans examen ne vaut pas la peine d’être vécue. »",
    author: "Socrate, rapporté par Platon",
    work: "Apologie de Socrate",
    reference: "38a",
    note: "La formulation française varie selon les traductions.",
    exercises: prompts(
      ["Reformule cette idée sans reprendre les mots de la citation. Que signifie ici « examiner sa vie » ?"],
      ["Quelle thèse Socrate défend-il ? Distingue l’examen de soi d’un simple regret après une erreur."],
      ["L’examen de soi rend-il nécessairement plus heureux ? Construis une objection et une réponse."],
      ["Peut-on vivre sans se questionner ? Formule le problème, puis propose un plan en deux ou trois parties."],
    ),
    correction: "Piste : distinguer vivre biologiquement et mener une vie réfléchie. Une bonne discussion peut reconnaître que l’examen éclaire nos choix, tout en demandant s’il suffit à bien vivre.",
  },
  {
    id: "descartes-cogito",
    theme: "Conscience et vérité",
    citation: "« Je pense, donc je suis. »",
    author: "René Descartes",
    work: "Discours de la méthode",
    reference: "quatrième partie",
    exercises: prompts(
      ["Explique pourquoi le fait de penser peut, selon Descartes, établir que le sujet existe."],
      ["Repère le raisonnement exprimé par « donc ». Quelle certitude est recherchée et sur quoi repose-t-elle ?"],
      ["La pensée suffit-elle à définir toute l’existence d’une personne ? Donne un argument et un contre-argument."],
      ["Suis-je d’abord une conscience qui pense ? Construis une problématique et un plan progressif."],
    ),
    correction: "Piste : le doute peut porter sur les choses extérieures, mais douter est encore penser. Discuter ensuite la réduction de l’identité à la pensée.",
  },
  {
    id: "pascal-roseau",
    theme: "Conscience et vérité",
    citation: "« L’homme n’est qu’un roseau, le plus faible de la nature ; mais c’est un roseau pensant. »",
    author: "Blaise Pascal",
    work: "Pensées",
    reference: "fragment généralement numéroté 200 (édition Brunschvicg)",
    note: "La numérotation des fragments dépend de l’édition.",
    exercises: prompts(
      ["Explique le contraste entre la fragilité du roseau et la puissance de la pensée."],
      ["Identifie les deux dimensions opposées de la condition humaine mises en relation."],
      ["La pensée rend-elle l’être humain supérieur à la nature, ou seulement conscient de sa fragilité ? Justifie les deux réponses."],
      ["La conscience de notre faiblesse est-elle une force ? Propose un plan qui confronte au moins deux réponses."],
    ),
    correction: "Piste : opposer la puissance matérielle de la nature à la capacité humaine de savoir qu’elle peut être détruite. Éviter de conclure trop vite que penser rend invulnérable.",
  },
  {
    id: "rousseau-liberte",
    theme: "Liberté et politique",
    citation: "« L’homme est né libre, et partout il est dans les fers. »",
    author: "Jean-Jacques Rousseau",
    work: "Du contrat social",
    reference: "livre I, chapitre 1",
    exercises: prompts(
      ["Que représentent les « fers » dans cette formule ? Donne une reformulation de l’opposition entre naissance et société."],
      ["Analyse le paradoxe : comment une liberté présentée comme naturelle peut-elle être limitée par la vie en société ?"],
      ["Toute règle limite-t-elle la liberté ? Distingue une contrainte arbitraire d’une loi commune."],
      ["La société est-elle un obstacle ou une condition de la liberté ? Formule le problème et organise un plan."],
    ),
    correction: "Piste : distinguer liberté naturelle et liberté civile. Une loi peut restreindre certaines actions et protéger en même temps une liberté partagée.",
  },
  {
    id: "kant-lumieres",
    theme: "Raison et liberté",
    citation: "« Sapere aude ! Aie le courage de te servir de ton propre entendement ! »",
    author: "Emmanuel Kant",
    work: "Réponse à la question : Qu’est-ce que les Lumières ?",
    reference: "1784",
    note: "« Sapere aude » est une formule latine reprise par Kant.",
    exercises: prompts(
      ["Explique la différence entre penser par soi-même et simplement refuser l’avis des autres."],
      ["Quelle attitude Kant encourage-t-il ? Repère le rôle du courage dans l’usage de la raison."],
      ["Peut-on penser par soi-même tout en apprenant des autres ? Construis une objection puis une réponse."],
      ["Penser par soi-même, est-ce se libérer ? Construis une problématique et un plan argumenté."],
    ),
    correction: "Piste : l’autonomie n’est pas l’ignorance des savoirs transmis. Elle suppose d’examiner les raisons, plutôt que d’obéir sans jugement.",
  },
  {
    id: "epictete-jugement",
    theme: "Liberté et bonheur",
    citation: "« Ce ne sont pas les choses qui troublent les hommes, mais les jugements qu’ils portent sur les choses. »",
    author: "Épictète",
    work: "Manuel",
    reference: "chapitre 5",
    note: "Traduction française usuelle ; la formulation varie selon les éditions.",
    exercises: prompts(
      ["Illustre la différence entre un événement et le jugement porté sur cet événement."],
      ["Quelle distinction entre ce qui arrive et la manière de l’interpréter soutient la citation ?"],
      ["Nos jugements expliquent-ils toujours notre souffrance ? Présente une limite à cette thèse."],
      ["Le bonheur dépend-il de nous ? Construis un plan qui distingue ce que nous maîtrisons de ce qui nous échappe."],
    ),
    correction: "Piste : distinguer l’événement, l’interprétation et la réaction. Nuancer : les circonstances matérielles ou la violence subie ne disparaissent pas par un simple changement de jugement.",
  },
  {
    id: "aristote-politique",
    theme: "Société et politique",
    citation: "« L’homme est par nature un animal politique. »",
    author: "Aristote",
    work: "Les Politiques",
    reference: "livre I, chapitre 2",
    note: "Traduction française d’une formule grecque ; le terme « politique » renvoie à la vie dans la cité.",
    exercises: prompts(
      ["Explique ce que signifie « vivre politiquement » au-delà du fait d’habiter au même endroit."],
      ["Quel lien la formule établit-elle entre la nature humaine et la vie collective ?"],
      ["L’être humain peut-il se construire seul ? Donne un exemple qui soutient puis un exemple qui limite la thèse."],
      ["La société est-elle nécessaire à l’humanité ? Présente une problématique et un plan en plusieurs étapes."],
    ),
    correction: "Piste : examiner le langage, l’éducation et les règles communes comme conditions de la vie collective. Éviter de confondre vivre en groupe et participer à une organisation politique.",
  },
  {
    id: "marx-transformer",
    theme: "Travail et action",
    citation: "« Les philosophes n’ont fait qu’interpréter le monde de différentes manières ; ce qui importe, c’est de le transformer. »",
    author: "Karl Marx",
    work: "Thèses sur Feuerbach",
    reference: "thèse XI",
    exercises: prompts(
      ["Reformule l’opposition entre interpréter le monde et le transformer."],
      ["Quelle critique Marx adresse-t-il à une pensée qui se contente de décrire la réalité ?"],
      ["L’action peut-elle transformer le monde sans le comprendre ? Défends deux réponses."],
      ["Faut-il agir pour connaître le monde ? Organise une discussion entre réflexion et action."],
    ),
    correction: "Piste : faire apparaître la complémentarité possible entre compréhension et action. Une transformation sans connaissance peut reproduire les problèmes qu’elle voulait résoudre.",
  },
  {
    id: "spinoza-liberte",
    theme: "Liberté et bonheur",
    citation: "« Les hommes se croient libres parce qu’ils sont conscients de leurs actions et ignorants des causes qui les déterminent. »",
    author: "Baruch Spinoza",
    work: "Éthique",
    reference: "partie III, proposition 2, scolie",
    exercises: prompts(
      ["Distingue le sentiment d’être libre et la connaissance des causes de nos actions."],
      ["Quel raisonnement relie, dans cette citation, conscience de l’action et ignorance de ses causes ?"],
      ["Connaître les causes de ses choix supprime-t-il toute liberté ? Propose une objection et une réponse."],
      ["Sommes-nous libres ou déterminés ? Construis une problématique sans réduire le sujet à une réponse oui/non."],
    ),
    correction: "Piste : distinguer absence de cause et compréhension des causes. Discuter la possibilité d’une liberté comme action plus lucide, plutôt que comme choix sans détermination.",
  },
  {
    id: "descartes-bon-sens",
    theme: "Raison et vérité",
    citation: "« Le bon sens est la chose du monde la mieux partagée. »",
    author: "René Descartes",
    work: "Discours de la méthode",
    reference: "première partie",
    exercises: prompts(
      ["Explique le sens de « bon sens » dans cette formule et reformule l’idée principale."],
      ["Pourquoi Descartes remarque-t-il que chacun estime en être bien pourvu ? Quel rôle la méthode joue-t-elle ensuite ?"],
      ["Avoir raison naturellement suffit-il pour bien juger ? Compare l’importance des capacités et celle de la méthode."],
      ["La raison suffit-elle à distinguer le vrai du faux ? Propose un plan qui examine ses conditions et ses limites."],
    ),
    correction: "Piste : ne pas confondre posséder une faculté de juger avec l’utiliser correctement. Examiner le rôle de la méthode, des preuves et des préjugés.",
  },
];
