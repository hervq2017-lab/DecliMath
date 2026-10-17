# Audit technique DeclickMath

## Synthèse

Le dépôt contient une application React/TypeScript avec authentification Supabase, API Vercel et migrations PostgreSQL/RLS. Le parcours parent-enfant par QR et la synchronisation de progression sont présents. Les contrôles locaux exécutés passent, mais ils ne prouvent ni l’état des migrations du projet Supabase en production, ni le bon fonctionnement des API hébergées.

Deux défauts confirmés ont été corrigés localement pendant cet audit :

1. L’API utilisait la clé Supabase privilégiée pour créer des comptes élèves à partir d’un simple identifiant utilisateur, sans session. Cette action anonyme a été supprimée ; les enfants en attente sont maintenant créés après la connexion confirmée du parent, via l’action `create` authentifiée.
2. La réception de progression marquait comme connues du serveur toutes les lignes locales d’un élève, y compris celles qui n’avaient pas encore été envoyées. Le suivi ne marque désormais que les identifiants réellement retournés par le serveur.

Les points les plus bloquants restant à traiter concernent l’espace administrateur en mode Supabase (données et mutations encore locales), la fiabilité des écritures/sessions Supabase, la validation du plafond enfant et la persistance des paiements. Aucune base de production n’a été interrogée ou modifiée et aucun déploiement n’a été lancé.

## Périmètre et méthode

- État initial : branche `main`, synchronisée avec `hervq/main`. `QWEN.md` et `api/migrate-check.ts` étaient déjà non suivis ; ils n’ont pas été modifiés ni ajoutés.
- Lecture des routes React, des pages parent/administrateur, des API (`children`, OCR, tuteur), du client d’authentification, du moteur de réponses, des migrations Supabase et de la configuration Vercel.
- Exécution des tests du dépôt, du contrôle TypeScript/build et du validateur de contenu. Les résultats détaillés sont consignés dans [TESTS-VALIDATION.md](./TESTS-VALIDATION.md).
- Aucun contenu de `.env` n’a été lu. Les scripts `check:deploy` et `e2e:prod` n’ont pas été lancés : ils interrogent le site en ligne. Aucune action n’a été faite sur la base ou l’hébergement de production.

## Architecture observée

| Domaine | Implémentation vérifiée |
|---|---|
| Application et routes | React 18, TypeScript, Vite et React Router dans [src/App.tsx](../src/App.tsx). Les vues sont sélectionnées selon le rôle actuellement hydraté. |
| Authentification | [src/lib/authRemote.ts](../src/lib/authRemote.ts) utilise Supabase Auth et charge les profils depuis `profiles`. Un mode local historique subsiste dans [src/store.ts](../src/store.ts). |
| Données | PostgreSQL/Supabase avec tables de profils, tentatives, révisions, épreuves, paiements et journal ; migrations dans [supabase/migrations](../supabase/migrations). |
| API serveur | [api/children.ts](../api/children.ts) utilise la clé service-role côté serveur ; [api/ocr.ts](../api/ocr.ts) et [api/tutor.ts](../api/tutor.ts) appellent des fournisseurs configurés par variables d’environnement. |
| Synchronisation | [src/lib/progressSync.ts](../src/lib/progressSync.ts) fusionne le cache local, les données Supabase et les enregistrements en attente ; le parent recharge les données périodiquement. |
| Contenu et réponses | [src/content/core.ts](../src/content/core.ts) génère les exercices de façon déterministe, parse les réponses numériques et vérifie les réponses ; `scripts/check-content.ts` teste les générateurs. |
| Déploiement | [vercel.json](../vercel.json) configure les en-têtes de sécurité, le cache QR et le fallback SPA. Le fichier ne prouve pas la configuration réelle des variables Vercel. |

## Constats vérifiés

Priorités : **P0** = bloque une fonction essentielle ou risque immédiat ; **P1** = important avant une exploitation fiable ; **P2** = à planifier ; **P3** = amélioration.

| ID | Priorité / état | Constat et preuve | Impact / suite |
|---|---|---|---|
| A-01 | P1 — corrigé localement | Après une fusion de progression, l’ancien `markKnown` prenait toutes les lignes présentes dans l’état local comme preuve d’enregistrement serveur. La nouvelle fonction `mergeFetchedRows` ne retient que les identifiants reçus dans la réponse serveur. Voir [progressSync.ts](../src/lib/progressSync.ts) et le test ajouté dans [test-progress-sync.ts](../scripts/test-progress-sync.ts). | Sans ce correctif, une tentative créée hors ligne pouvait rester uniquement dans le navigateur et ne plus être envoyée. La régression est maintenant couverte par un test ciblé. |
| A-02 | P1 — corrigé localement | L’action `provision` de [children.ts](../api/children.ts) créait des comptes avec la clé service-role à partir d’un `userId` fourni dans un appel public, sans vérifier de session. La branche anonyme a été supprimée. L’inscription sans session attend maintenant la confirmation puis la première connexion du parent dans [authRemote.ts](../src/lib/authRemote.ts) ; l’API de création vérifie un jeton parent. Test de refus ajouté dans [test-children-api.ts](../scripts/test-children-api.ts). | Empêche le déclenchement anonyme de créations par l’API privilégiée. Vérifier le parcours d’inscription confirmé sur un environnement de test avant mise en ligne. |
| A-03 | P1 — ouvert | En session Supabase, `hydrate` ne charge que le profil connecté et les profils dont il est parent. Un administrateur n’est pas parent de tous les élèves ; en outre `pullProgressNow` s’arrête pour le rôle `admin`. Les onglets comptes/paiements/journal et les actions dans [AdminTabs.tsx](../src/pages/AdminTabs.tsx) et [adminActions.ts](../src/adminActions.ts) lisent ou modifient l’état local, malgré les tables et fonctions SQL correspondantes. | L’espace admin en ligne ne dispose pas de la liste globale fiable et ses mutations ne sont pas persistées côté serveur. À traiter avec des lectures et mutations serveur autorisées (RLS ou API dédiée) et des tests d’accès administrateur/non-administrateur. |
| A-04 | P1 — ouvert | Le plafond serveur de [children.ts](../api/children.ts) est `MAX_CHILDREN = 20`. La requête de comptage ignore son champ `error` et utilise `(count ?? 0)`, ce qui peut traiter une erreur de base comme un compte vide. Le contrôle et la création sont séparés, donc deux créations concurrentes peuvent dépasser le plafond. | Échec fermé sur erreur et contrôle atomique à prévoir. La limite commerciale mentionnée dans le cahier des charges est de quatre enfants selon l’offre, mais la tarification et le système d’offres ne sont pas câblés ici ; le plafond métier n’a donc pas été changé. |
| A-05 | P1 — ouvert | Dans `flush` de [authRemote.ts](../src/lib/authRemote.ts), les empreintes `pushedProfile`/`pushedMode` sont avancées avant la réponse Supabase. En cas d’erreur, un avertissement est affiché, mais la même valeur n’est plus réessayée tant qu’un changement supplémentaire ne relance pas la synchronisation. | Des réglages de profil ou de corrigé peuvent rester locaux après une erreur réseau ou RLS. Prévoir une remise en attente explicite après échec et tester les erreurs/réessais. |
| A-06 | P1 — ouvert | `hydrate` dans [authRemote.ts](../src/lib/authRemote.ts) ne traite pas `kids.error` ni `modes.error` et transforme les résultats absents en tableaux vides. L’état local est ensuite remplacé par les profils chargés. | Une panne de lecture peut ressembler à un parent sans enfant et effacer les données de cache correspondantes sur cet appareil. Les erreurs de lecture doivent empêcher l’hydratation destructive et être remontées clairement. |
| A-07 | P1 — ouvert | Le mot de passe d’un enfant réinitialisé est gardé en clair dans `localStorage` sous `declickmath_stored_child_passwords` par `cacheChildPassword` dans [authRemote.ts](../src/lib/authRemote.ts). | Un script exécuté dans l’origine du site ou une personne ayant accès au navigateur peut récupérer ces secrets. Remplacer ce stockage durable par une remise ponctuelle contrôlée ; vérifier l’impact sur l’UX parent avant modification. |
| A-08 | P1 — ouvert | `reset-login` dans [children.ts](../api/children.ts) ignore l’erreur de la mise à jour de `profiles.login` après avoir changé l’adresse Auth. | Auth et profil peuvent diverger ; l’identifiant affiché et celui réellement accepté à la connexion ne seraient plus les mêmes. Ajouter une gestion d’échec avec compensation ou opération serveur atomique. |
| A-09 | P1 — ouvert | Le schéma définit paiements manuels et fonction `approve_payment`, mais les écrans et actions visibles reposent sur les tableaux locaux (`state.payments`, `state.users`) dans [AdminTabs.tsx](../src/pages/AdminTabs.tsx) et [adminActions.ts](../src/adminActions.ts). Aucune intégration de paiement automatisée n’est présente dans les dépendances/API observées. | L’approbation depuis l’interface n’est pas une preuve d’activation serveur en environnement Supabase. Ne pas présenter un paiement ou un abonnement comme opérationnel avant le câblage serveur, les tests d’autorisation et la définition des offres. Aucun paiement ni tarif n’a été inventé ou modifié. |
| A-10 | P2 — ouvert | Le tuteur et l’OCR sont accessibles sans authentification de compte. Leurs limites sont des `Map` en mémoire par instance dans [tutor.ts](../api/tutor.ts) et [ocr.ts](../api/ocr.ts) ; le code les décrit lui-même comme une protection « au mieux, par instance ». | Les limites peuvent ne pas être globales entre instances Vercel et ne protègent pas sûrement contre l’usage abusif des fournisseurs payants. Ajouter une limite partagée et des budgets avant montée en charge. |
| A-11 | P2 — ouvert | `checkAnswer` dans [core.ts](../src/content/core.ts) prend en charge les nombres, décimaux français et fractions, mais le validateur générateur actuel couvre 40 graines par contexte ; il ne valide pas la qualité pédagogique ni les références de cours. Le contrôle a trouvé 1 060 gabarits, 0 erreur automatique et 249/437 notions couvertes ; il signale de nombreux gabarits à faible variété, notamment des pools d’anglais. | Un succès technique ne vaut pas relecture de mathématiques/pédagogie. Faire vérifier les exercices, les programmes nationaux, les tolérances numériques et les références par des enseignants. |
| A-12 | P2 — ouvert | Le build produit un chunk principal de 2,4 Mo non compressé (environ 693 Ko gzip), au-dessus du seuil Vite de 500 Ko, et signale `eval` dans `pdfjs-dist`. [package.json](../package.json) permet le build mais ne configure pas de découpage des routes. | Risque de chargement lent sur mobile/réseau limité. Mesurer en conditions réelles puis séparer les pages et PDF sans modifier le comportement. |
| A-13 | P3 — ouvert | [20261016000000_student_qr_and_auth.sql](../supabase/migrations/20261016000000_student_qr_and_auth.sql) crée une fonction de nettoyage de jetons QR expirés, mais aucun déclenchement planifié n’a été identifié dans le dépôt. | Les lignes expirées/consommées peuvent s’accumuler. Configurer un nettoyage planifié après vérification de l’environnement d’exécution. |

## Sécurité et données

- Les migrations activent RLS sur les profils et les tables de progression. Les politiques de lecture utilisent `can_read`, et les mises à jour de profil limitent les colonnes modifiables ; voir [20261014000000_init.sql](../supabase/migrations/20261014000000_init.sql).
- La migration d’acceptation ajoute `parent_linked_at` et limite la lecture parentale aux liens acceptés ; la suspension est aussi prise en compte par les fonctions/politiques ; voir [20261017000000_parent_child_invitation_acceptance.sql](../supabase/migrations/20261017000000_parent_child_invitation_acceptance.sql).
- L’API conserve la clé `SUPABASE_SERVICE_ROLE_KEY` côté serveur. Les jetons QR sont enregistrés sous forme hachée et leur consommation utilise une mise à jour conditionnelle à usage unique.
- Ces conclusions portent sur le code et les migrations du dépôt, pas sur les politiques effectivement installées dans un projet Supabase donné. Il faut comparer celles-ci au déploiement avant de conclure sur la production.
- Les clauses de consentement existent dans le schéma, mais leur enregistrement et la conformité juridique (mineurs, confidentialité, conservation, droits sur le contenu) restent à contrôler avec les personnes compétentes.

## Limites de preuve

- Pas d’accès vérifié à l’état réel de Supabase, aux journaux Vercel, aux variables de production, au fournisseur OCR/tuteur ou à un compte utilisateur de test.
- Pas de test E2E navigateur ni de test réel du QR avec une session Auth Supabase.
- Les tests API parent-enfant utilisent un faux serveur Supabase ; ils vérifient le code métier, pas les politiques RLS réellement déployées.
- Le validateur de contenu vérifie des propriétés calculables des générateurs ; il ne constitue pas une validation professorale.
- Aucun paiement, compte ou donnée de production n’a été modifié.
