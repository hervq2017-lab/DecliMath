# Refonte pédagogique — programme béninois : audit et plan

Mesures produites par `scripts/audit-pedagogique.ts` (1 009 gabarits de maths × 30 graines × contextes). Les indicateurs sont des **heuristiques** : ils repèrent, ils ne jugent pas.

## 1. Constat

| Point | Mesure | Lecture |
|---|---|---|
| Programme de référence | `docs/benin/` est **vide** ; le référentiel (`skeleton-ci.ts`, `programme-maths-ci.ts`) est le programme **ivoirien** (DPFC-CI), les références sont des manuels **CIAM** | Aucune conformité au programme béninois ne peut être affirmée aujourd'hui |
| Références manuel | 955 / 1 009 gabarits ont une référence (chapitre, exercices, pages), 54 n'en ont pas (primaire) | Références **non revérifiées** page par page dans cet audit |
| Énoncés « calcul pur » (≥ 80 % sans situation) | 188 gabarits (6e : 17, 5e : 11, 4e : 15, 3e : 18, 2nde : 10, 1ère : 34, Tle : 83) | Normal en analyse/algèbre pure ; à traiter surtout de la 6e à la 3e |
| Énoncés situés | 3 à 15 % des énoncés du collège/lycée (primaire : 40–67 %) | La contextualisation est faible là où elle serait utile |
| Un seul raisonnement par gabarit | 577 gabarits : seules les valeurs changent (≤ 2 formes de corrigé par contexte) | Voulu pour s'entraîner, mais ce n'est pas de la résolution de problème |
| Contextes par gabarit | 1,1 à 1,7 au collège/lycée (5 au primaire) | « Autre contexte » ne change presque rien au secondaire |
| Indices 1–3 qui donnent la réponse | 54 gabarits (≥ 10 % des variantes) | À corriger (le 3e indice doit rester une méthode) |
| Réponse absente du corrigé | 29 gabarits (≥ 10 % des variantes) | À relire |
| Indices vides ou en double | 2 gabarits | À corriger |
| Réponses | 100 % numériques ou QCM | Pas d'expressions algébriques ni de démonstrations |
| Séries | Seules A, A1, A2, C, D existent ; B, E, F, G… absentes | Séries béninoises à confirmer avec un enseignant |
| Noms | `NAMES` (core.ts) : 16 prénoms ouest-africains dont plusieurs ivoiriens ou ghanéens (Kouadio, Yao, Adjoua, Kofi), aucun prénom typiquement béninois | À compléter par des prénoms béninois |
| Problèmes de synthèse existants | 16 dans `problemes.ts`, **uniquement pour l'impression** ; réponses en texte libre, non corrigeables par le moteur | Jamais utilisés en entraînement interactif |

## 2. Ce qui est fait (lot pilote)

- Moteur « problème de situation » : `src/content/problemes-situes.ts` (énoncé, plusieurs questions, réponses typées, 4 indices, erreurs fréquentes, étapes, source, statut). Trois origines distinctes : `genere`, `redige`, `annale`.
- Garde-fous du registre : une annale est **refusée** sans référence exacte et sans autorisation « obtenue » ; le statut « valide-enseignant » est **refusé** (il ne peut venir que d'une vraie validation).
- Page `src/pages/Probleme.tsx` (`/probleme/:id`, `?seed=` pour rejouer une variante), lien depuis la page de notion. Les tentatives sont enregistrées avec `notionId` et un contexte propre : elles comptent dans la règle de maîtrise « ≥ 3 réussites dans ≥ 2 contextes ».
- 6 problèmes : 6e proportionnalité, 4e Pythagore, 3e systèmes, 2nde inéquations, 1ère suites arithmétiques, Tle loi binomiale.
- `scripts/check-problemes.ts` : 500 variantes par problème, **vérificateur indépendant** (balayage, simulation, recherche exhaustive, triangle de Pascal), indices sans réponse, erreurs types jamais acceptées comme justes.

Statut de tous les problèmes : `verifie-code`. **Aucun n'est validé par un enseignant, aucun n'est rattaché à une page du programme béninois.**

## 3. Plan priorisé

1. **Obtenir le programme officiel béninois** (6ème → Tle, par série) dans `docs/benin/`, et la liste des séries. Tant que ce n'est pas fait, rien n'est « conforme ».
2. **Relecture par un enseignant béninois** des 6 problèmes pilotes (ordres de grandeur des prix, vocabulaire, niveau de difficulté), puis passage manuel de `verifie-code` à `valide-enseignant`.
3. **Corriger les 54 gabarits dont les indices donnent la réponse** et les 29 gabarits dont le corrigé ne contient pas la réponse (listés par `audit-pedagogique.ts`).
4. **Étendre les problèmes** : 2 à 3 par notion, d'abord Terminale C/D (examens), 3e (BEPC), puis 6e–4e ; au moins deux contextes différents par notion.
5. **Réponses non numériques** (fractions comme objets, expressions) : prévoir un type de réponse « expression » avec comparaison algébrique, avant d'écrire des problèmes qui en ont besoin.
6. **Annales** : seulement avec autorisation écrite et référence exacte (session, épreuve, exercice) ; sinon, problèmes **inspirés** et marqués `redige`.
7. Ajouter des prénoms béninois à `NAMES` pour les gabarits secondaires.
