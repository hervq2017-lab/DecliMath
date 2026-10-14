# Architecture contenu — RéussiteScolaire (CI → Terminale, zones XOF/XAF)

## Couches

| Couche | Fichier | Rôle |
|---|---|---|
| Référentiel | `src/curriculum.ts` | 13 niveaux (CI…Tle), 14 pays + examens de fin de cycle, squelette de notions (id stable `matière:niveau:titre`) |
| Gabarits | `src/content/*.ts` | Un gabarit = une compétence. `contexts` (marché, école, moto, labo…) × `seed` (valeurs) |
| Cours | `src/content/lessons.ts` | Cours par notion, statut `draft` / `validated` |
| Moteur | `src/engine.ts` | Entraînement, contrôle de compréhension, assemblage d'épreuves |
| État | `src/store.ts` | Comptes, tentatives, contrôles, épreuves, règles de maîtrise et de corrigé |

## Règles pédagogiques implémentées

- **Multi-contexte** : « Autre contexte » change la scène (même compétence, autre situation).
- **Multi-valeurs dans un même contexte** : « Mêmes situation, autres valeurs ».
- **Ai-je compris ?** : 4 questions sans aide, 2 contextes × 2 jeux de valeurs ; réussi si ≥ 75 % et les deux contextes sont réussis.
- **Maîtrisé** : ≥ 3 réussites sans corrigé dans ≥ 2 contextes. **Expert** : maîtrisé + contrôle réussi.
- **Épreuves** : composition de niveau, ou examen blanc de fin de cycle (CM2 / 3e / Tle, nom selon le pays). Chrono, sans aide, notée /20, corrigé par notion à la fin.
- **Corrigé** : Autoriser / Différer / Bloquer par le parent ; consultation avant tentative tracée.

## Ajouter du contenu

1. Notion absente → l'ajouter dans `SKELETON` (`curriculum.ts`).
2. Écrire un gabarit : `mk(id, nid(...), difficulté, gen)` puis `register(...)`. `gen(ctx, rng)` renvoie énoncé, réponse, 4 aides, corrigé.
3. `npx esbuild scripts/check-content.ts --bundle --platform=node --format=esm --outfile=scripts/.out.mjs && node scripts/.out.mjs` : vérifie chaque gabarit × contexte × 40 valeurs, et affiche la couverture.

## Production à l'échelle (générateurs + IA)

- **Calcul / physique** : gabarits paramétrés (réponse calculée par le code, donc toujours juste). L'IA peut proposer le *code* du gabarit, relu et testé par `check-content`.
- **Anglais, cours, énoncés littéraires** : l'IA produit des brouillons JSON (`status: "draft"`) ; un enseignant valide avant publication. Les pools QCM d'anglais n'ont aujourd'hui qu'un item par contexte : « autres valeurs » n'y varie pas encore, à enrichir en priorité.
- Les noms d'examens par pays (`COUNTRIES`) et les programmes par niveau sont à faire valider par des enseignants locaux (programmes nationaux différents d'un pays à l'autre, notamment la physique-chimie avant la 4ème et les séries du lycée).

## Étapes suivantes

1. Backend (Supabase) : comptes réels, consentement parental, historique serveur.
2. Séries du lycée (A, C, D, S…) et profils d'examen par pays (épreuves, coefficients, durées officielles).
3. Pipeline de génération IA + file de validation enseignant.
4. Remplir les 45 notions « bientôt disponibles » ; physique-chimie 6ème–5ème si les programmes locaux l'incluent.
