# Tests et validation DeclickMath

## Exécutés localement

| Commande | Résultat | Couverture / remarques |
|---|---|---|
| `npm run verify` | Réussi après les corrections locales. | Lance `tsc --noEmit`, `npm test` et `vite build`. Les tests parent-enfant, QR, API et synchronisation passent ; TypeScript est sans erreur. |
| `npx tsx scripts/check-content.ts` | 0 échec automatique. | 1 060 gabarits générés ; 249/437 notions ont au moins un gabarit. Le script teste 40 graines par contexte, relève des avertissements de variété faible et n’atteste pas la correction pédagogique. |
| `git diff --check` | Réussi. | Vérifie les espaces blancs des changements. |

Le build Vite émet les avertissements déjà constatés : usage de `eval` dans `pdfjs-dist` et bundle principal dépassant 500 Ko non compressé. Ils ne bloquent pas la compilation.

## Tests de régression ajoutés

- `scripts/test-children-api.ts` : un appel sans session demandant l’action historique `provision` reçoit désormais `401`.
- `scripts/test-progress-sync.ts` : une ligne locale conservée pendant la fusion n’est pas incluse parmi les identifiants effectivement récupérés du serveur ; seules les lignes serveur peuvent être marquées connues.

## Non exécutés intentionnellement

- `npm run check:deploy`, `npm run e2e:prod` : ces scripts appellent le site public. Le cahier des charges interdit tout changement/déploiement de production sans validation explicite ; aucun test de production n’était nécessaire pour les corrections locales.
- `npm run e2e:browser` : aucun parcours avec projet Supabase de test et comptes dédiés n’a été configuré.
- SQL réel, migrations, RLS et opérations Auth : évalués sur les migrations versionnées et par des faux serveurs de test, pas sur une base distante.
- Tests fournisseur OCR/tuteur et paiement : aucun secret ni service de test n’a été utilisé.

## Suite de validation avant mise en ligne

1. Vérifier les migrations présentes sur une base Supabase de test et les comparer à `supabase/migrations`.
2. Tester inscription, confirmation e-mail, création authentifiée d’enfant, QR usage unique, mot de passe élève, suspension, suppression et progression hors ligne sur appareils distincts.
3. Tester permissions croisées parent/enfant/admin au niveau API et RLS.
4. Valider le parcours administrateur et les paiements avec des données fictives uniquement.
5. Faire une relecture enseignante du contenu et vérifier l’expérience mobile avant toute validation de production.
