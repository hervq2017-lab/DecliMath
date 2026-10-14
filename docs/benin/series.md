# Séries du baccalauréat béninois

Seule source officielle lue qui **liste** des séries : le **Décret n° 2002-097 du 04 mars 2002** (S01), article 7, qui concerne l'**examen du baccalauréat**, c'est-à-dire la classe de **Terminale**. Le texte précise que la liste est « susceptible de modification » et que les séries réellement ouvertes sont fixées chaque année par arrêté ministériel (arrêté non retrouvé).

## Séries listées par l'article 7 du décret (S01)

| Série | Intitulé dans le décret | Niveau auquel le texte la rattache | Corroboration |
|---|---|---|---|
| A1 | Lettres – Langues | Terminale (examen) | Code utilisé dans le guide universitaire 2021-2022 (S05) |
| A2 | Lettres – Sciences Humaines | Terminale (examen) | S05 |
| B | Lettres – Sciences Sociales | Terminale (examen) | S05 |
| C | Sciences et Techniques | Terminale (examen) | S05 |
| D | Biologie – Géologie | Terminale (examen) | S05 |
| E | Mathématiques et Techniques | Terminale (examen) | S05 |
| F1 | Construction Mécanique | Terminale (examen) | S05 |
| F2 | Électronique | Terminale (examen) | S05 |
| F3 | Électrotechnique | Terminale (examen) | S05 |
| F4 | Génie Civil | Terminale (examen) | S05 |
| G1 | Techniques Administratives | Terminale (examen) | S05 |
| G2 | Techniques Quantitatives de Gestion | Terminale (examen) | S05 |
| G3 | Techniques Commerciales | Terminale (examen) | S05 |

Les intitulés sont recopiés du texte OCR du décret, avec la ponctuation corrigée (l'OCR donne par exemple « L,ettres »). Contrôle visuel du scan conseillé avant publication.

La colonne « Corroboration » dit seulement que le code apparaît dans un document officiel du ministère de l'Enseignement supérieur. Elle **ne confirme pas** l'intitulé ni que la série est ouverte aujourd'hui.

## Ce qui n'est **pas** confirmé

| Point | Statut |
|---|---|
| Séries enseignées en **2nde** et **1ère** (si elles existent comme telles) | **Non documenté** : aucun texte officiel lu ne dit à quelle classe commence chaque série |
| Séries du **premier cycle** (6ème à 3ème) | Aucune : le profil UNESCO (S06) décrit un premier cycle commun, avec des options (physique-chimie, langues) |
| Codes **DEAT, DT, EA, HR** vus dans le guide universitaire (S05) | **À vérifier** : employés sans définition dans les passages lus |
| Série « Eau et Assainissement », HR, MIA, « 14 séries » du Bac 2026 | **À vérifier** : évoqués par Wikipédia (S12) et un extrait de presse (S13), jamais par un texte officiel lu |
| Les séries **C** et **D** sont-elles celles où la plateforme enseigne la loi binomiale, les complexes, etc. ? | **Non établi** : dépend du programme de Terminale, non disponible |
| Coefficients et durées de l'épreuve de mathématiques par série | Les annexes du décret contiennent des tableaux (par exemple, l'OCR de la série C donne « Maths, coefficient 6, 4 h »), mais l'OCR est confus par endroits et l'article 10 renvoie à un arrêté. **À vérifier sur le scan avant tout usage** |

## Lien avec la plateforme

Le référentiel actuel de la plateforme (`src/curriculum.ts`) propose les séries **A, A1, A2, C, D** : elles viennent du programme **ivoirien**. Les séries **B, E, F1-F4, G1-G3** du décret béninois n'y existent pas. Aucune modification n'a été faite : l'ajout d'une série dépend de l'existence d'un programme de mathématiques documenté pour elle.

## Documents manquants pour ce fichier

1. Le dernier **arrêté annuel** fixant les séries ouvertes et les épreuves (art. 7 et 10 du décret).
2. Le **texte organisant le second cycle** (classes de 2nde, 1ère, Terminale et séries) : non retrouvé.
3. Une version à jour du **décret de 2002** ou son abrogation éventuelle.
