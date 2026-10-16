// Applique les migrations manquantes directement sur PostgreSQL via le module pg.
// Usage : node scripts/apply-migrations.mjs
// Requiert : SUPABASE_DB_URL ou construit l'URL à partir des variables .env

import pg from "pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

// Connexion directe à la base Supabase via le pooler ou le host direct
const ref = (process.env.VITE_SUPABASE_URL || "").match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!ref) { console.error("❌ VITE_SUPABASE_URL introuvable dans .env"); process.exit(1); }

// Le mot de passe DB est passé via la variable d'environnement SUPABASE_DB_PASSWORD
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
if (!dbPassword) {
  console.error("❌ Variable SUPABASE_DB_PASSWORD requise.");
  console.error("   Trouve-la dans Supabase Dashboard > Settings > Database > Connection string");
  console.error("   Puis lance : set SUPABASE_DB_PASSWORD=ton_mot_de_passe && node scripts/apply-migrations.mjs");
  process.exit(1);
}

const connectionString = `postgresql://postgres.${ref}:${dbPassword}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

const migrations = [
  "20261015000000_family_code.sql",
  "20261015000100_students_by_parent_only.sql",
  "20261015000200_student_profile_by_server.sql",
  "20261016000000_student_qr_and_auth.sql",
];

async function run() {
  console.log(`🔌 Connexion à la base Supabase (ref: ${ref})...\n`);
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("✅ Connecté !\n");

  for (const file of migrations) {
    const path = resolve(__dirname, `../supabase/migrations/${file}`);
    const sql = readFileSync(path, "utf-8");
    console.log(`⏳ Application de ${file}...`);
    try {
      await client.query(sql);
      console.log(`   ✅ OK`);
    } catch (err) {
      // Ignorer les erreurs "already exists" qui sont normales avec IF NOT EXISTS
      if (/already exists|duplicate/i.test(err.message)) {
        console.log(`   ⚠️  Déjà appliqué (ignoré)`);
      } else {
        console.error(`   ❌ Erreur: ${err.message}`);
      }
    }
  }

  // Vérification finale
  console.log("\n🔍 Vérification des tables...");
  const tables = ["profiles", "solution_modes", "student_qr_tokens"];
  for (const t of tables) {
    try {
      const { rows } = await client.query(`SELECT count(*) as n FROM ${t}`);
      console.log(`   ✅ ${t} (${rows[0].n} lignes)`);
    } catch {
      console.log(`   ❌ ${t} introuvable`);
    }
  }

  // Vérification des colonnes
  const cols = ["must_change_password", "password_customized", "family_code"];
  for (const c of cols) {
    try {
      await client.query(`SELECT ${c} FROM profiles LIMIT 0`);
      console.log(`   ✅ profiles.${c}`);
    } catch {
      console.log(`   ❌ profiles.${c} manquante`);
    }
  }

  await client.end();
  console.log("\n🎉 Terminé !");
}

run().catch((err) => {
  console.error("❌ Erreur fatale:", err.message);
  process.exit(1);
});
