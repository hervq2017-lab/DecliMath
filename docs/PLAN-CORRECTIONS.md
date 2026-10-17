# Plan de corrections DeclickMath

Ce plan suit les constats de [l’audit technique](./AUDIT-TECHNIQUE.md). Les règles tarifaires et les opérations de production restent inchangées sans validation explicite.

| Ordre | Sujet | Action prévue | Validation attendue | État |
|---|---|---|---|---|
| 1 | Création anonyme d’élèves (A-02) | Supprimer l’action sans session et attendre une session authentifiée du parent avant de créer les élèves. | API refuse `provision` sans session ; parcours signup/confirmation/connexion testé sur un projet de test. | Correctif local fait ; E2E Auth restant. |
| 2 | Progression hors ligne (A-01) | Marquer connues uniquement les lignes retournées par Supabase, pas le cache conservé. | Test de régression différencie lignes locales non envoyées et lignes reçues. | Correctif local fait et testé. |
| 3 | Hydratation et écritures profil (A-05, A-06, A-08) | Faire échouer explicitement l’hydratation si une lecture nécessaire échoue ; réessayer les écritures et traiter la divergence Auth/profil sans succès simulé. | Tests pour erreur de lecture, erreur réseau d’écriture, répétition, compensation et affichage de l’erreur. | À faire. |
| 4 | Règle de plafond enfant (A-04) | Refuser la création si le comptage échoue et rendre l’application du plafond concurrente/atomique côté base. Comparer avec la limite par offre annoncée avant tout changement de valeur. | Tests limite, limite dépassée, erreur DB, créations simultanées ; aucune migration destructive. | À faire ; valeur métier non modifiée. |
| 5 | Espace administrateur (A-03) | Charger les données admin via accès serveur vérifié et persister comptes, paiements et journal au lieu de l’état local. | Tests de rôle, RLS, lecture globale admin, refus non-admin, persistance après reconnexion et aperçu sans écriture. | À faire ; nécessite conception serveur. |
| 6 | Paiements/abonnements (A-09) | Définir explicitement le processus commercial et les offres, puis câbler le flux manuel existant au serveur. Une passerelle ne sera ajoutée qu’après décision et configuration approuvée. | Paiement fictif bout en bout, double validation, refus, expiration, journal, tests d’accès. | À faire ; aucune offre/passerelle inventée. |
| 7 | Secrets enfant (A-07) | Remplacer la conservation persistante en clair par une remise temporaire/ponctuelle adaptée au parcours parent. | Tests d’absence de mot de passe dans `localStorage`, renouvellement et récupération. | À faire ; UX à préserver. |
| 8 | Abus des API OCR/tuteur (A-10) | Mettre en place une limitation distribuée, des quotas et une authentification/autorisation compatibles avec les comptes élèves. | Tests inter-instances simulés, appels anonymes, budgets/erreurs fournisseur. | À faire ; coûts potentiels à évaluer. |
| 9 | Qualité pédagogique (A-11) | Augmenter le contrôle automatique de graines et faire relire un échantillon représentatif avec références et programmes locaux. | Rapport par matière/niveau, aucune erreur de génération, validation enseignante documentée. | À faire ; contrôle automatique actuel sans erreur mais insuffisant seul. |
| 10 | Performance (A-12) | Mesurer le parcours mobile puis découper les bundles et différer le chargement des modules lourds. | Build sans bundle initial au-dessus de la cible retenue, test mobile réseau lent, absence de régression. | À faire. |
| 11 | Nettoyage des QR (A-13) | Planifier la fonction de purge après vérification du service de planification disponible. | Test de rétention et suppression uniquement des jetons éligibles. | À faire. |

## Ordre d’exécution

Les corrections sûres locales et les tests associés passent avant les changements serveur plus larges. Les sujets qui modifient une règle commerciale, exigent une configuration payante ou touchent à la production restent bloqués jusqu’à accord. Avant tout déploiement, comparer les migrations appliquées au dépôt et exécuter le parcours sur un environnement de test.
