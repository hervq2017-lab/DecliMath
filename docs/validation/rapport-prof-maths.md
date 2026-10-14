# Relecture « prof de maths » — 170 cours de maths

Date : 2026-10-13. Cet avis **ne valide rien** : seul un humain clique « Valider ».

## Résultat

| Niveau | Recommande la validation | À corriger | Total |
|---|---|---|---|
| ci | 1 | 0 | 1 |
| cp | 1 | 0 | 1 |
| cm1 | 1 | 0 | 1 |
| 6e | 13 | 0 | 13 |
| 5e | 11 | 1 | 12 |
| 4e | 9 | 3 | 12 |
| 3e | 12 | 3 | 15 |
| 2nde | 21 | 7 | 28 |
| 1ere | 26 | 13 | 39 |
| tle | 37 | 11 | 48 |
| **Total** | **132** | **38** | **170** |

Les 170 cours sont relus (6 cours de base + 164 cours du programme ivoirien), au lieu des 48 de Terminale de la première version.

## Méthode

1. Contrôle automatique (`scripts/revue-cours.ts`) : rien détecté, ce qui ne prouve pas que les cours sont corrects.
2. Relecture de chaque cours avec `grille-validation.md`, `cas-etalon.md`, `erreurs-frequentes.md` et `niveaux-et-notations.md`. Ces fichiers sont dans `.agents/skills/prof-maths/references/` du projet (le LISEZMOI pointe à tort vers `.claude/skills/`).
3. Recalcul de **87 résultats** par script (sympy) : aucun exemple de cours n'est faux.
4. Seuls **104 textes sont distincts** sur 164 cours du programme ivoirien. Les cours identiques ont le même avis (ex. « Suites numériques » sert pour 7 classes ou séries).

Règle de décision : **à corriger** si une notion annoncée par le titre ou l'intro n'est pas traitée, si une phrase est fausse à la lecture (vecteurs sans flèche, nom de théorème erroné, mot « forme canonique » mal employé), si le piège n'est pas une vraie erreur d'élève, ou si l'énoncé est ambigu. Un manque de situation concrète ou un exemple court est un **conseil**.

## Un élève qui part de zéro peut-il progresser avec ces cours ?

Pas avec le cours seul. Les calculs sont justes, mais ces fiches sont des mémos :
- médiane de **93 mots** par cours (de 60 à 139) ;
- **3 étapes d'une ligne et 1 seul exemple** dans chaque cours ;
- **6 cours sur 164** seulement ont une situation concrète (FCFA, marché, champ…) ; aucun cours de 3e, de 1ère ou de Terminale n'en a (repérage par mots-clés dans l'intro et l'énoncé) ;
- les règles sont énoncées sans être justifiées.
Le cours sert de rappel ; l'apprentissage dépend des exercices avec correction que la plateforme génère. Le vrai test est de faire travailler un élève réel sur 2 ou 3 notions, de la leçon aux exercices.

## Les 38 cours à corriger (propositions de texte dans `avis-prof-maths.json`)

- `maths:1ere:barycentre-serie-c` : « G est plus près du point au plus grand coefficient » n'est vrai que pour des coefficients de même signe. Les égalités a·GA + b·GB = 0 sont écrites sans flèches (lisibles comme des longueurs).
- `maths:1ere:barycentre-serie-d` : « G est plus près du point au plus grand coefficient » n'est vrai que pour des coefficients de même signe. Les égalités a·GA + b·GB = 0 sont écrites sans flèches (lisibles comme des longueurs).
- `maths:1ere:composees-de-transformations-du-plan-serie-c` : L'étape « Identifier » cite translation, rotation, symétrie : la symétrie glissée manque (composée d'une symétrie axiale et d'une translation de vecteur non parallèle à l'axe). L'exemple (deux translations) est trivial et n'illustre pas l'identification.
- `maths:1ere:composees-de-transformations-du-plan-serie-d` : L'étape « Identifier » cite translation, rotation, symétrie : la symétrie glissée manque (composée d'une symétrie axiale et d'une translation de vecteur non parallèle à l'axe). L'exemple (deux translations) est trivial et n'illustre pas l'identification.
- `maths:1ere:equations-et-inequations-dans-serie-a1` : L'étape 1 s'intitule « Mettre sous forme canonique » alors qu'elle consiste à tout passer dans un membre. La forme canonique est a(x − α)² + β : le mot est faux et va troubler l'élève.
- `maths:1ere:orthogonalite-dans-l-espace-serie-c` : La propriété nommée « Théorème des trois perpendiculaires » énonce « si une droite est orthogonale à un plan, elle est orthogonale à toutes les droites de ce plan » : ce n'est pas ce théorème, c'est la propriété de la droite orthogonale à un plan.
- `maths:1ere:orthogonalite-dans-l-espace-serie-d` : La propriété nommée « Théorème des trois perpendiculaires » énonce « si une droite est orthogonale à un plan, elle est orthogonale à toutes les droites de ce plan » : ce n'est pas ce théorème, c'est la propriété de la droite orthogonale à un plan.
- `maths:1ere:statistique-a-une-variable-serie-c` : L'intro annonce moyenne, médiane, quartiles, variance et écart-type ; les étapes ne traitent que moyenne, variance et écart-type. Médiane et quartiles n'ont ni étape ni exemple.
- `maths:1ere:statistique-a-une-variable-serie-d` : L'intro annonce moyenne, médiane, quartiles, variance et écart-type ; les étapes ne traitent que moyenne, variance et écart-type. Médiane et quartiles n'ont ni étape ni exemple.
- `maths:1ere:statistique-serie-a1` : L'intro annonce moyenne, médiane, quartiles, variance et écart-type ; les étapes ne traitent que moyenne, variance et écart-type. Médiane et quartiles n'ont ni étape ni exemple.
- `maths:1ere:suites-numeriques-serie-a1` : L'intro annonce « leurs limites » ; aucune étape ne les traite (elles ne figurent que dans une propriété). La somme d'une suite géométrique n'a pas d'étape non plus.
- `maths:1ere:suites-numeriques-serie-c` : L'intro annonce « leurs limites » ; aucune étape ne les traite (elles ne figurent que dans une propriété). La somme d'une suite géométrique n'a pas d'étape non plus.
- `maths:1ere:suites-numeriques-serie-d` : L'intro annonce « leurs limites » ; aucune étape ne les traite (elles ne figurent que dans une propriété). La somme d'une suite géométrique n'a pas d'étape non plus.
- `maths:2nde:calcul-litteral-serie-a` : L'intro annonce « mettre sous forme canonique » ; aucune étape ni exemple ne la traite.
- `maths:2nde:composees-de-transformations-serie-c` : L'étape « Identifier » cite translation, rotation, symétrie : la symétrie glissée manque (composée d'une symétrie axiale et d'une translation de vecteur non parallèle à l'axe). L'exemple (deux translations) est trivial et n'illustre pas l'identification.
- `maths:2nde:equations-et-inequations-dans-serie-a` : L'étape 1 s'intitule « Mettre sous forme canonique » alors qu'elle consiste à tout passer dans un membre. La forme canonique est a(x − α)² + β : le mot est faux et va troubler l'élève.
- `maths:2nde:equations-et-inequations-dans-serie-c` : L'étape 1 s'intitule « Mettre sous forme canonique » alors qu'elle consiste à tout passer dans un membre. La forme canonique est a(x − α)² + β : le mot est faux et va troubler l'élève.
- `maths:2nde:statistique-a-une-variable-serie-c` : L'intro annonce moyenne, médiane, quartiles, variance et écart-type ; les étapes ne traitent que moyenne, variance et écart-type. Médiane et quartiles n'ont ni étape ni exemple.
- `maths:2nde:statistique-serie-a` : L'intro annonce moyenne, médiane, quartiles, variance et écart-type ; les étapes ne traitent que moyenne, variance et écart-type. Médiane et quartiles n'ont ni étape ni exemple.
- `maths:2nde:vecteurs-et-points-du-plan-serie-c` : Le piège (« conclure à l'alignement avec un seul calcul de coefficient sans vérifier la colinéarité ») ne nomme pas une erreur précise. La relation de Chasles est écrite sans flèches.
- `maths:3e:equations-et-inequations-dans-couples` : Le titre est « Équations et inéquations dans ℝ × ℝ » mais seul un système de deux équations est traité ; les inéquations à deux inconnues sont absentes.
- `maths:3e:statistique` : L'étape 1 parle de quartiles sans dire comment les trouver. L'exemple (2, 4, 6, 8, 10) ne calcule que la médiane. Le piège « confondre moyenne et médiane » n'est pas illustré : dans l'exemple, moyenne et médiane valent toutes deux 6.
- `maths:3e:vecteurs` : Mêmes relations écrites sans flèche (AB + BC = AC ; AB = k·AC). De plus « AB = 2 CD donc les droites (AB) et (CD) sont parallèles » oublie le cas où elles sont confondues.
- `maths:4e:equations-et-inequations-dans` : Le titre et le piège parlent d'inéquations, mais ni les étapes ni l'exemple n'en traitent une : seule 3x − 5 = 7 est résolue.
- `maths:4e:symetries-et-translations` : Le titre et l'intro annoncent translations et symétries, mais les étapes et l'exemple ne traitent que la translation.
- `maths:4e:vecteurs` : Les relations vectorielles sont écrites sans flèche (« BA = −AB », « AB + BC = AC », « AB = DC »). Lues comme des longueurs, elles sont fausses (AB + BC = AC n'est vrai que si B est sur [AC]). L'élève ne peut pas distinguer le vecteur de la longueur.
- `maths:5e:cercles` : Le piège dit : « croire que toute droite coupant le cercle en un point est une tangente : il faut qu'elle n'ait qu'un seul point commun ». C'est la définition même de la tangente, donc ce n'est pas une erreur d'élève.
- `maths:tle:barycentre-et-lignes-de-niveaux-serie-c` : Σ aᵢ·MAᵢ = (Σ aᵢ)·MG est une égalité de vecteurs écrite sans flèches, et la condition Σ aᵢ ≠ 0 est absente de l'étape. « Cercle si k est assez grand » est vague. MA·MB = k se lit comme un produit de longueurs, pas comme un produit scalaire.
- `maths:tle:composees-de-transformations-serie-d` : L'étape « Identifier » cite translation, rotation, symétrie : la symétrie glissée manque (composée d'une symétrie axiale et d'une translation de vecteur non parallèle à l'axe). L'exemple (deux translations) est trivial et n'illustre pas l'identification.
- `maths:tle:divisibilite-dans-serie-c` : Le piège « additionner les congruences de façon incorrecte » ne nomme aucune erreur réelle, et la méthode « réduire modulo n » n'est pas expliquée.
- `maths:tle:geometrie-analytique-dans-l-espace-serie-c` : La lettre d désigne à la fois la distance et le terme constant du plan ax + by + cz + d = 0 : « d = |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²) » est ambigu.
- `maths:tle:isometries-du-plan-serie-c` : L'étape « Reconnaître : on étudie les points fixes » ne donne aucun critère. L'exemple (une symétrie axiale a une infinité de points fixes) ne montre pas comment reconnaître une isométrie.
- `maths:tle:probabilite-conditionnelle-et-variable-aleatoire-serie-c` : L'intro annonce la probabilité conditionnelle et la loi binomiale ; les étapes ne traitent que loi, espérance et variance. P(A | B) n'apparaît que dans la formule de Bayes, sans définition ni exemple.
- `maths:tle:probabilite-conditionnelle-et-variable-aleatoire-serie-d` : L'intro annonce la probabilité conditionnelle et la loi binomiale ; les étapes ne traitent que loi, espérance et variance. P(A | B) n'apparaît que dans la formule de Bayes, sans définition ni exemple.
- `maths:tle:suites-numeriques-serie-a1` : L'intro annonce « leurs limites » ; aucune étape ne les traite (elles ne figurent que dans une propriété). La somme d'une suite géométrique n'a pas d'étape non plus.
- `maths:tle:suites-numeriques-serie-a2` : L'intro annonce « leurs limites » ; aucune étape ne les traite (elles ne figurent que dans une propriété). La somme d'une suite géométrique n'a pas d'étape non plus.
- `maths:tle:suites-numeriques-serie-c` : L'intro annonce « leurs limites » ; aucune étape ne les traite (elles ne figurent que dans une propriété). La somme d'une suite géométrique n'a pas d'étape non plus.
- `maths:tle:suites-numeriques-serie-d` : L'intro annonce « leurs limites » ; aucune étape ne les traite (elles ne figurent que dans une propriété). La somme d'une suite géométrique n'a pas d'étape non plus.

## Ce qui reste hors de portée d'une relecture par IA

- **Programme béninois** : aucun programme officiel n'est dans le projet (`docs/benin/README.md`). On ne peut pas dire « conforme au programme béninois ».
- **Séries** : A1/A2 et C/D ont des textes identiques ; seul un enseignant de la série peut dire si c'est voulu.
- **Niveau CP** : la multiplication dans « Monnaie : le FCFA » est à vérifier par un enseignant de CP.
