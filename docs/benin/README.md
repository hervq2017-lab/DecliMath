# Dossier de référence pédagogique — mathématiques, Bénin

État au **2026-10-13**.

## En bref

| Question | Réponse |
|---|---|
| A-t-on le programme officiel de mathématiques du Bénin (6ème → Terminale) ? | **Non.** Aucun n'a été trouvé ni téléchargé |
| A-t-on les séries du baccalauréat ? | **Oui, pour la Terminale uniquement** : 13 séries listées par le décret n° 2002-097 (article 7). Actualité à vérifier |
| A-t-on les séries de 2nde et de 1ère ? | **Non** |
| Peut-on aligner les exercices de la plateforme sur le programme béninois ? | **Pas encore.** Le référentiel actuel est **ivoirien** (DPFC-CI) et les références sont des manuels CIAM |

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| [sources.md](sources.md) | Inventaire : URL, titre, organisme, date, version, statut de chaque source, avec ce qui a réellement été téléchargé ou lu |
| [series.md](series.md) | Séries confirmées par un document officiel, avec le niveau, et ce qui reste non confirmé |
| `classes/<classe>/programme.md` | État du programme de la classe (ici : **manquant**, avec ce que les sources établissent et ce qui manque) |
| `classes/<classe>/notions.json` | Fichier prévu pour alimenter le moteur. **Vide** (`"notions": []`) tant qu'il n'y a pas de programme officiel |
| `sources/` | Copies des documents officiels ou de partenaires effectivement téléchargés, avec `SHA256SUMS.txt` |

Classes : `6e`, `5e`, `4e`, `3e`, `2nde`, `1ere`, `terminale` (la plateforme utilise l'identifiant `tle` pour la Terminale).

## Niveaux de vérification

| Niveau | Sens |
|---|---|
| `Vérifié` | Texte du passage cité lu dans un document réellement obtenu |
| `À vérifier` | Document non lu, lu par résumé automatique, lu en partie, ancien, ou émis par un tiers |
| `Officiel` / `Partenaire` / `Tiers` | Nature de l'émetteur. Seul `Officiel` peut un jour faire foi pour un programme. Un tiers ou une annale n'est **jamais** présenté comme programme officiel |

## Ce que contiennent les sources obtenues

| Source | Apporte | N'apporte pas |
|---|---|---|
| S01 décret 2002-097 | Liste des séries du baccalauréat, principe « les épreuves portent sur les programmes officiels des classes terminales » | Programme, chapitres |
| S02 / S03 INIFRCF | Nom complet, rôle de l'institut (élaborer et réviser les curricula, valider les documents curriculaires) | Aucun programme publié |
| S04 rubriques du MESTFP | Preuve que le site ne publie pas de programme (rubriques « Réformes » vide, guides d'orientation seulement) | — |
| S07 document GPE/WEZIZA | Programmes non révisés depuis plus de 20 ans ; actualisation annoncée pour la rentrée 2025-2026 | Texte des programmes |
| S08 rapport OMD 2015 | Un programme de maths APC existait et était imprimé en 2015 | Texte des programmes |

## Documents manquants (priorité décroissante)

1. **Programmes officiels de mathématiques** du secondaire général : 6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Terminale, et pour le second cycle la liste des leçons **par série**. Émetteur probable : MESTFP, DIPIQ (Direction de l'Inspection Pédagogique, de l'Innovation et de la Qualité) ou INIFRCF (Direction de Développement des Programmes d'Études).
2. **Version en vigueur** : programme APC d'origine (réécrit entre 2005 et 2012 selon S11) ou version actualisée annoncée pour 2025-2026 (S07).
3. **Arrêté annuel** des séries ouvertes et des épreuves du baccalauréat (décret 2002-097, articles 7 et 10), et une version à jour du décret.
4. **Texte organisant le second cycle** : séries enseignées en 2nde et en 1ère.
5. **Guides pédagogiques et planification des séquences** (DIPIQ), mentionnés par S11 mais non trouvés.
6. **Cadre d'Orientation Curriculaire** : en cours d'élaboration depuis juin 2026 (S09), non adopté.
7. **Décret n° 2014-360** (création de l'INIFRCF) : téléchargement coupé, seule la page 1 (titre) est lisible ; les articles sont à retélécharger.
8. **Site de l'Office du Baccalauréat** : inaccessible le 2026-10-13.

Le site du MESTFP ne publiant aucun programme, la voie la plus directe est une **demande écrite** à la DDPE de l'INIFRCF et à la DIPIQ, ou le programme papier d'un enseignant béninois (à scanner, avec la page de garde : organisme, date, version).

## Comment utiliser ce dossier ensuite

Quand un programme officiel est obtenu :

1. L'ajouter dans `sources/`, enregistrer son empreinte (`sha256sum`) et une ligne dans `sources.md` (titre, organisme, date, version, URL ou origine).
2. Remplir `classes/<classe>/notions.json` **uniquement** avec les intitulés exacts du document (champ `format_notion_prevu`), avec le numéro de page de chaque notion.
3. Seulement ensuite, établir la correspondance entre les compétences existantes de la plateforme et ces notions, **avant** de corriger les gabarits ou d'ajouter des exercices.

## Ce qui n'a pas été fait (volontairement)

- Aucun chapitre, aucune compétence, aucune série n'a été déduit du programme ivoirien, des manuels CIAM ou de cours d'enseignants.
- Aucune correspondance entre les gabarits et un programme béninois.
- Les gabarits à corriger identifiés par l'audit (`docs/PLAN-REFONTE-BENIN.md`) ne sont pas touchés, et aucun exercice n'est généralisé.
- `docs/programme-ci/` n'est pas modifié : il reste un programme **ivoirien**.
