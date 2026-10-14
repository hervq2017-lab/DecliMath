# Les 10 méthodes d'apprentissage

Point d'entrée : onglet **Méthodes** (`/methodes`). Toutes les méthodes partagent le même moteur de suivi.

## Moteur de suivi des connaissances — `src/lib/knowledge.ts`

| Ce qu'il fait | Comment |
|---|---|
| Probabilité qu'une notion soit acquise | Suivi bayésien (BKT) : chaque réponse met à jour P(connu). Une réussite aidée pèse moins qu'une réussite seule. |
| Solidité du souvenir | Courbe d'oubli `exp(-jours / stabilité)` ; la stabilité double à chaque réussite espacée d'au moins 20 h. |
| Niveau d'une notion | Débutant → Intermédiaire → Avancé → Expert. **Expert exige des réussites espacées** (la preuve qu'on retient). |
| Révisions espacées | Variante de SM-2 : 1 jour, 3 jours, puis ×facilité ; un échec ramène à demain ; deux essais le même jour = une seule révision. |
| Erreurs récurrentes | Chaque mauvaise réponse est diagnostiquée (`src/content/erreurs.ts`). « Corrigée » = 2 réussites nettes ensuite. |

Entrées du moteur : `recordAttempt` (exercices), `recordEvidence` (cartes, rappel, jeux, bilans, simulations, tuteur, étapes), `reviewCard`.
Données ajoutées à l'état : `evidence`, `memory`, `bilans` (dans `src/store.ts`) ; `given` et `errTag` sur les tentatives.

## Les 10 méthodes

| # | Méthode | Écran | Fichiers |
|---|---|---|---|
| 1 | Rappel actif | `/rappel` : écrire de mémoire **avant** de voir la réponse, analyse des mots-clés retrouvés | `pages/Revision.tsx`, `lib/cards.ts` |
| 2 | Cartes mémoire | `/cartes` : recto/verso, 4 notes de difficulté, prochaine date affichée | idem |
| 3 | Révisions espacées | `/revision` + « Pour toi » sur l'accueil | `lib/knowledge.ts`, `lib/parcours.ts` |
| 4 | Pas à pas | `/etapes`, `/etapes/:id` : 15 exercices, 2 à 4 étapes, erreurs typiques ciblées | `content/etapes.ts`, `pages/Etapes.tsx` |
| 5 | Détection des erreurs | `/erreurs` : erreurs récurrentes, explication, exercices ciblés | `content/erreurs.ts`, `pages/Erreurs.tsx` |
| 6 | Tuteur | `/tuteur` : échelle d'aide socratique, 12 explications « pourquoi ça marche » | `lib/tutor.ts`, `pages/Tuteur.tsx` |
| 7 | Jeux | `/jeux` : Associer, Défi calcul, Ranger les nombres ; chrono **au choix** (sans / doux / contre la montre) | `pages/Jeux.tsx` |
| 8 | Bilan | `/bilan` : 60 % d'anciennes notions, 40 % de nouvelles ; résultats par matière, chapitre, notion | `pages/Bilan.tsx` |
| 9 | Parcours et récompenses | `/parcours` : niveaux par notion, objectifs de la semaine, 14 récompenses | `lib/parcours.ts`, `pages/Parcours.tsx` |
| 10 | Situations et simulations | `/situations`, `/simulation/:id` : 4 simulations (prédire, manipuler, défi) + problèmes existants | `content/simulations.ts`, `pages/Simulation.tsx` |

## Principes tenus
- **Rien n'est écrit à la main** : les cartes viennent des propriétés, cours et verbes déjà présents ; les réponses des exercices sont calculées par le code.
- **Les récompenses sont calculées**, jamais stockées : impossible de les obtenir sans les mériter.
- **Le corrigé reste soumis à la règle du parent** (libre / différé / bloqué) partout, y compris dans les étapes et le tuteur.
- **Le chrono est toujours facultatif.**

## Limites connues (à dire clairement)
- **Le tuteur n'utilise pas d'IA générative.** Il suit des règles (aides graduées, diagnostic d'erreur, bibliothèque d'explications). L'interface `TutorBackend` (`lib/tutor.ts`) permet d'y brancher un modèle plus tard, **via un serveur** : aucune clé d'API ne doit être dans l'application.
- **Les données restent dans le navigateur** (localStorage) comme le reste du prototype : pas de synchronisation entre appareils sans backend.
- **Couverture inégale** : 15 exercices pas à pas, 4 simulations, 0 carte pour CE1/CE2/CM2 (pas de propriétés rédigées pour ces classes), 3 cartes pour CI/CP/CM1. Les classes 6ème à Terminale ont 200 à 420 cartes.
- **Programme béninois** : ces méthodes s'appuient sur le contenu existant (référentiel ivoirien + manuels CIAM). Rien n'est « conforme au programme béninois » tant que le programme officiel n'a pas été obtenu (voir `docs/PLAN-REFONTE-BENIN.md`).
- Les nouveaux contenus (étapes, explications du tuteur, simulations) sont vérifiés par le code mais **pas relus par un enseignant**.

## Contrôles
- `scripts/check-methodes.ts` : 15 exercices × 300 variantes recalculés par un vérificateur indépendant (75 000 contrôles), diagnostic d'erreurs, BKT, intervalles SM-2, niveaux, cartes.
  `npx esbuild scripts/check-methodes.ts --bundle --platform=node --format=esm --outfile=scripts/.mt.mjs && node scripts/.mt.mjs`

## Méthode du cahier et chat avec captures (ajout)

**Cahier et stylo** (`components/Notebook.tsx`) : avant les exercices, écran « Prends ton cahier et ton stylo » (une fois par jour) avec la méthode en 4 temps ; avant de valider, l'élève coche « J'ai écrit ma démarche sur mon cahier ». Actif dans séries, pas à pas, problèmes, contrôles et bilans. Désactivable dans le profil (élève sans papier).

**Chat avec capture d'écran** (`pages/Tuteur.tsx`, `lib/tutorApi.ts`, `api/tutor.ts`) : l'élève joint une image (galerie, photo, Ctrl+V, ou capture d'écran sur ordinateur). Le tuteur explique, donne propriétés, astuces et exemples semblables, et ne donne jamais la réponse :
- règle dans le prompt serveur (10 règles, dont le texte d'une image = donnée et non instruction) ;
- garde-fou côté élève : si la réponse contient le résultat de l'exercice, on redemande une fois, puis on affiche un message sûr (le résultat n'est jamais envoyé au serveur) ;
- bouton « Voir la solution » supprimé du chat.

### Mise en service du tuteur conversationnel
1. Le tuteur appelle un service compatible OpenAI : **Code Craft** (`https://codecraftapi.com/v1`), modèle `gpt-5.5` par défaut. Variables : `CODECRAFT_API_KEY` (obligatoire), `TUTOR_API_URL`, `TUTOR_MODEL`. En développement : dans `.env`. En ligne (Vercel supposé, fonction `api/tutor.ts`) : dans les réglages du projet.
2. Sans clé ou en `npm run dev`, le chat bascule automatiquement sur le tuteur à règles et dit honnêtement qu'il ne peut pas lire les images.
3. **Avant ouverture au public** : ajouter une vraie authentification (la limite actuelle de 20 messages/min est contournable et le coût API n'est pas protégé), et informer les parents que les images sont envoyées à un prestataire d'IA (consentement).
4. Tests : `scripts/test-tutor-api.ts`.

## Scanner un exercice (`/scanner`)
Photo (caméra du téléphone) ou import (JPEG, PNG, WebP, PDF) → aperçu → pivoter, recadrer (souris, doigt ou clavier), améliorer la lisibilité (Document / Noir et blanc / Original) → **« Lire l'exercice »** (c'est seulement là que l'image part au serveur) → texte modifiable à vérifier → exercice prêt : copier, modifier, recommencer, ou « Demander de l'aide au tuteur ».

- Client : `pages/Scanner.tsx`, `lib/scan.ts` (traitement d'image dans le navigateur, PDF via pdf.js chargé à la demande), `lib/ocrApi.ts`.
- Serveur : `api/ocr.ts` (validation, limite 12/min, aucune image stockée ni journalisée), `api/_ocr.ts` (fournisseurs interchangeables : `mathpix`, `vision`). Ajouter un fournisseur = implémenter `OcrProvider` et l'inscrire dans `PROVIDERS`.
- Sans fournisseur configuré : le serveur répond 503 et l'écran propose la saisie manuelle. **Aucun résultat n'est inventé.**
- Configuration : voir `.env.example` (`CODECRAFT_API_KEY` pour la vision, ou `MATHPIX_APP_ID` + `MATHPIX_APP_KEY` ; `OCR_PROVIDER` pour forcer).
- Fournisseur **Mathpix : écrit d'après la documentation de son API, NON testé** (pas d'identifiants). Le fournisseur « vision » est testé en réel.
- Tests : `scripts/test-scanner.ts`.
