# Prompt d'intégration — Cours originaux de maths (programme ivoirien 6ème → Terminale A/C/D)

À coller dans Claude Code, à la racine du projet DeclickMath.

---

Contexte : le projet (Vite + React + TypeScript) contient déjà un référentiel `src/curriculum.ts` (notions identifiées par `nid(matière, niveau, titre)`), des cours dans `src/content/lessons.ts` et des propriétés dans `src/content/proprietes.ts`. Les fichiers suivants ont déjà été ajoutés :

- `src/content/cours-ci.ts` : `COURS_CI` (164 cours au format `Lesson`, statut "draft") et `PROPRIETES_CI` (propriétés par leçon, clé = niveau ou niveau-série : "6e", "2nde-c", "tle-d"…).
- `src/content/skeleton-ci.ts` : `SKELETON_CI_MATHS`, fusionné dans `SKELETON.maths` par `curriculum.ts` (lycée : titres suffixés « — série A/C/D », chapitres « Série X · thème »).
- `src/content/lessons.ts` : `LESSONS` = cours de base + `COURS_CI` (les cours de base priment sur un identifiant identique).
- Sources et revue : `docs/cours-ci/` (xlsx pour relecture par les enseignants, json, ce prompt).

Tâches, dans l'ordre. Après chaque tâche, lance `npx tsc --noEmit` et `npm run build`, et corrige avant de continuer.

1. **Vérifier l'existant** : lance le script de contrôle de contenu décrit dans `docs/ARCHITECTURE.md` et affiche la couverture. Les notions ajoutées n'ont pas de gabarit d'exercice : elles doivent apparaître comme « bientôt » sans erreur. Corrige toute régression.
2. **Séries du lycée** : le type `LevelId` n'a pas de série. Ajoute un profil élève « série » (A, C, D ; A1/A2 pour la Terminale A) pour 2nde, 1ère et Tle, stocké dans `store.ts`, avec sélection à l'inscription ou dans le profil. Filtre la liste des notions de maths du lycée selon cette série : une notion dont le titre contient « — série X » n'est visible que pour la série X. Les notions sans mention de série restent visibles pour tous. Ne casse pas les autres matières ni les niveaux collège/primaire.
3. **Affichage des cours** : sur la page d'une notion, affiche le cours (`lessonFor`) : principe, étapes, exemple, piège. Affiche en dessous une section distincte « Propriétés » issue de `PROPRIETES_CI` (retrouve l'entrée par `notionId`). Ajoute un badge « brouillon — en attente de validation » tant que `status` vaut "draft".
4. **Validation enseignant** : ajoute un écran simple (ou un export) listant les cours en brouillon avec un bouton pour passer en "validated". Les cours rédigés par IA ne doivent jamais être marqués validés automatiquement.
5. **Gabarits d'exercices** : par ordre de priorité, écris des gabarits (`mk` + `register`) dont la réponse est calculée par le code, pour les notions de 3ème (préparation BEPC) puis de Terminale C/D. Une notion à la fois, avec `check-content` après chacune.
6. **Correspondance CIAM** : si l'utilisateur dépose les tables des matières CIAM dans `docs/ciam/`, remplis la colonne « Chapitre CIAM correspondant » du fichier xlsx (renvoi de chapitre uniquement). N'inclus jamais de texte, d'exercice ni de corrigé du manuel CIAM.

Règles : ne copie aucun contenu protégé (manuels CIAM, sujets d'examen officiels) ; garde les cours en "draft" jusqu'à validation humaine ; les réponses des exercices sont calculées par le code ; réponds en français ; fais un commit par tâche.
