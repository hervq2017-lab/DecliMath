# Plan de lancement DeclickMath

Règle : on ne passe à la phase suivante que lorsque tous les tests de la phase en cours sont verts. Un test rouge = on corrige, on relance toute la phase, puis on avance.

Commandes de contrôle de référence :
- `npx tsx scripts/check-content.ts` doit afficher `0 échec(s)`
- `npm run build` doit se terminer sans erreur

## Phase 0 — Base saine (avant tout développement)
- [ ] `App.tsx` sans erreur de syntaxe (ligne 111) et `tsc --noEmit` sans erreur
- [ ] `ciam-tle-d-a.ts` (erreur `**` ligne 65) corrigé
- [ ] `check-content` : 0 échec, plus aucune « variété faible » sur les gabarits CIAM (6ème à Terminale)
- [ ] `npm run build` OK
- [ ] Mise en place d'un dépôt git, d'un `.gitignore` (PDF, `dist`, `node_modules`) et d'un premier commit
- [ ] Les PDF des manuels sortent du dossier du projet (non publiés)
- **Test de sortie :** les 3 commandes ci-dessus passent sur une copie propre du projet

## Phase 1 — Qualité du contenu (maths)
- [ ] Relire les 50 premiers gabarits au hasard par niveau : énoncé clair, réponse juste, aides utiles, référence au manuel exacte
- [ ] Vérifier les pages citées des propriétés Terminale SM (chap. 1 à 8) sur le manuel
- [ ] Test automatique : 300 graines × tous les gabarits, aucune réponse NaN, QCM valides, énoncés sans « undefined »
- [ ] Test d'unicité : aucun doublon d'identifiant, toutes les notions d'un gabarit existent dans le référentiel
- [ ] Liste des notions sans gabarit par niveau et décision : à écrire, ou masquer « bientôt disponible »
- [ ] Relecture par au moins un enseignant par niveau (6ème–3ème, Seconde, Première, Terminale)
- **Test de sortie :** 0 erreur signalée par l'enseignant sur l'échantillon, sinon correction puis nouvel échantillon

## Phase 2 — Parcours élève sans compte (local)
- [ ] Choisir niveau et série, lancer un exercice, voir l'aide, voir le corrigé
- [ ] « Autre contexte » et « Autres valeurs » changent vraiment l'énoncé
- [ ] « Ai-je compris ? » : règle ≥ 75 % et deux contextes réussis
- [ ] Épreuve chronométrée : note sur 20, corrigé par notion
- [ ] Rubrique Propriétés et renvoi vers la notion
- [ ] Recherche, navigation, retour arrière
- **Test de sortie :** parcours complet déroulé à la main sur 3 niveaux, plus tests automatiques de l'état (`store.ts`)

## Phase 3 — Backend et comptes (Supabase)
- [ ] Autoriser le connecteur Supabase, créer le projet, schéma des tables (profils, rôles, enfants, tentatives, contrôles, épreuves, paiements)
- [ ] Authentification réelle (email + mot de passe haché), réinitialisation du mot de passe
- [ ] Règles d'accès par ligne : un élève ne voit que ses données, un parent que celles de ses enfants
- [ ] Consentement parental enregistré (date, version des conditions)
- [ ] Migration : `store.ts` lit et écrit sur le serveur, `localStorage` seulement en cache
- [ ] Mode hors ligne : les tentatives se synchronisent au retour du réseau
- **Tests de sortie :** invitation parent-enfant par QR à usage unique, activité invisible avant acceptation, création du mot de passe par l'élève, suivi visible après acceptation, révocation et suspension vérifiées, tentative d'accès aux données d'un autre compte refusée

## Phase 4 — Parent, corrigés et suivi
- [ ] Parent : voir la progression de l'enfant, règle du corrigé (autoriser, différer, bloquer)
- [ ] Les tentatives avec corrigé consulté sont tracées
- [ ] Niveaux « maîtrisé » et « expert » calculés selon les règles de `ARCHITECTURE.md`
- **Test de sortie :** scénarios écrits (enfant réussit, échoue, regarde le corrigé) avec résultat attendu, tous conformes

## Phase 5 — Paiement manuel
- [ ] Offres et prix, page d'abonnement
- [ ] Envoi d'une preuve de paiement, validation par l'administrateur, activation de l'accès
- [ ] Accès limité tant que le paiement n'est pas validé (accès gratuit défini : quels niveaux, combien d'exercices)
- [ ] Notifications (email) au parent et à l'administrateur
- **Test de sortie :** achat de bout en bout avec un faux paiement, refus d'une preuve, expiration de l'abonnement

## Phase 6 — Performance et appareils
- [ ] Chargement par niveau (code-splitting) : poids initial < 500 Ko
- [ ] Test sur téléphone Android bas de gamme et connexion lente (3G simulée)
- [ ] Mode hors ligne pour les exercices déjà chargés
- [ ] Accessibilité de base : taille du texte, contrastes, clavier
- **Test de sortie :** page d'accueil interactive en moins de 5 s en 3G simulée, aucun défilement horizontal sur téléphone

## Phase 7 — Sécurité et conformité
- [ ] Conditions d'utilisation, politique de confidentialité, mentions légales (mineurs, données personnelles)
- [ ] Aucune clé secrète dans le code, variables d'environnement sur l'hébergeur
- [ ] Limitation des tentatives de connexion, validation des champs
- [ ] Clarifier le droit d'auteur du contenu inspiré des manuels CIAM avant de vendre
- **Test de sortie :** revue de sécurité du code (`/security-review`), tentative d'accès non autorisé échoue

## Phase 8 — Mise en ligne et bêta fermée
- [ ] Hébergement (Vercel), nom de domaine, HTTPS
- [ ] Sauvegardes de la base, suivi des erreurs, moyen de contacter le support
- [ ] Bêta avec 2 à 3 classes (20 à 50 élèves) pendant 2 semaines
- [ ] Collecte des retours : erreurs de contenu, bugs, difficultés
- **Test de sortie :** aucun bloquant ouvert, taux d'erreur serveur < 1 %, retours corrigés

## Phase 9 — Lancement et extension
- [ ] Lancement public en maths
- [ ] Ensuite : physique-chimie, anglais, autres pays
- [ ] Terminale SE (D) et Littéraire terminés par l'autre session et revus avec la même grille que la Phase 1

## Suivi des défauts
Chaque défaut trouvé est noté ici avec phase, description, correction et re-test :

| # | Phase | Défaut | Corrigé | Re-testé |
|---|---|---|---|---|
