# Grille de validation d'un cours (note chaque ligne : ok / à corriger / bloquant)

## A. Exactitude (bloquant si faux)
1. Chaque définition est exacte et complète (hypothèses : « b ≠ 0 », « triangle rectangle », « x ≥ 0 »).
2. Chaque formule : vérifiée avec des valeurs simples (ex. a = 2, b = 3).
3. Chaque calcul de l'exemple : recalculé ligne par ligne, unités comprises.
4. La solution répond à la question posée (pas une autre).
5. Aucun cas limite oublié (division par 0, nombre négatif sous la racine, ensemble de définition).
6. Vocabulaire et notations du niveau (voir niveaux-et-notations.md).

## B. Pédagogie (à corriger)
1. Intro : dit à quoi sert la notion, avec une situation réelle.
2. Étapes : ordre logique, une idée par étape, verbes d'action.
3. Un exemple concret chiffré (FCFA, mètres, kg, km/h…), résolu en entier.
4. Le piège = une erreur réelle d'élèves, avec la correction.
5. Phrases courtes (≈ 12 mots primaire, 20 collège, 26 lycée), jargon expliqué à la première apparition.
6. Pas de saut de calcul qu'un élève de ce niveau ne peut pas suivre.

## C. Décision
- Un seul bloquant → `refuse` (ou `a-corriger` si correction évidente et courte), proposer le texte corrigé.
- Aucun bloquant, ≥ 1 à corriger → `a-corriger`.
- Tout ok **et** recalcul fait → `recommande-validation`. L'humain décide.
