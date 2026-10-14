# Validation des cours par le « prof de maths »
- Skill : `.claude/skills/prof-maths/` (dans Claude Code : demander « utilise prof-maths pour relire maths:4e:… »).
- Contrôle automatique : `npx esbuild scripts/revue-cours.ts --bundle --platform=node --format=esm --outfile=scripts/.out-revue.mjs && node scripts/.out-revue.mjs --niveau 4e` (option `--sortie docs/validation/revue-auto` pour écrire un rapport).
- Auto-contrôle du détecteur : `npx esbuild scripts/test-revue-cours.ts --bundle --platform=node --format=esm --outfile=scripts/.out-test.mjs && node scripts/.out-test.mjs`.
- Les avis vont dans `docs/validation/avis-prof-maths.json`. **Seul un humain valide** (bouton « Valider »).
