#!/usr/bin/env node

/**
 * Applique la migration 003_factcheck_system.sql sur Supabase
 * via l'API REST (sans CLI Supabase).
 *
 * Usage :
 *   node scripts/deployment/apply-supabase-migration.mjs
 *   node scripts/deployment/apply-supabase-migration.mjs --dry-run
 *
 * Nécessite : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const DRY_RUN = process.argv.includes('--dry-run');
const MIGRATION_FILE = path.resolve('supabase/migrations/003_factcheck_system.sql');

const supabaseUrl = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkTablesExist() {
  const tables = ['articles', 'fact_check_results', 'agent_logs'];
  const results = {};

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    results[table] = !error || !error.message.includes('does not exist');
  }

  return results;
}

async function applyMigrationViaRPC(sql) {
  // Essayer d'exécuter via la fonction RPC pg_execute (si disponible)
  // Sinon, guider l'utilisateur vers le SQL Editor de Supabase
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json'
    }
  });

  return response;
}

async function main() {
  console.log('🗄️  Migration Supabase — Système Fact-Check (Phase 1)');
  console.log('');

  // Vérifier si le fichier de migration existe
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Fichier de migration introuvable : ${MIGRATION_FILE}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log(`📄 Migration : ${path.basename(MIGRATION_FILE)}`);
  console.log(`   Taille    : ${sql.length} caractères`);
  console.log('');

  // Vérifier l'état actuel des tables
  console.log('🔍 Vérification des tables existantes...');
  const tableStatus = await checkTablesExist();

  for (const [table, exists] of Object.entries(tableStatus)) {
    console.log(`   ${exists ? '✅' : '⬜'} ${table}`);
  }
  console.log('');

  const allExist = Object.values(tableStatus).every(Boolean);
  if (allExist) {
    console.log('✅ Toutes les tables existent déjà !');
    console.log('');

    // Vérifier la vue
    const { data: viewData, error: viewError } = await supabase
      .from('latest_fact_checks')
      .select('*')
      .limit(1);

    if (!viewError) {
      console.log('✅ Vue latest_fact_checks : OK');
    } else {
      console.log('⚠️  Vue latest_fact_checks : manquante ou erreur');
      console.log(`   ${viewError.message}`);
    }

    console.log('');
    console.log('ℹ️  Si vous souhaitez recréer les tables, supprimez-les d\'abord dans Supabase.');
    return;
  }

  if (DRY_RUN) {
    console.log('🔍 Mode dry-run — la migration ne sera pas appliquée.');
    console.log('');
    console.log('SQL à exécuter :');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    return;
  }

  // Supabase n'expose pas d'API pour exécuter du SQL brut via REST.
  // On guide l'utilisateur vers le SQL Editor.
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('⚠️  Supabase ne permet pas l\'exécution de SQL brut via l\'API REST.');
  console.log('');
  console.log('📋 Pour appliquer la migration, suivez ces étapes :');
  console.log('');
  console.log('   1. Ouvrez le SQL Editor de Supabase :');
  console.log(`      ${supabaseUrl.replace('.supabase.co', '')}`);
  console.log('      → Dashboard → SQL Editor → New Query');
  console.log('');
  console.log('   2. Collez le contenu du fichier :');
  console.log(`      ${MIGRATION_FILE}`);
  console.log('');
  console.log('   3. Cliquez sur "Run" pour exécuter');
  console.log('');
  console.log('   4. Relancez ce script pour vérifier :');
  console.log('      node scripts/deployment/apply-supabase-migration.mjs');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Copier le SQL dans le presse-papier si possible (pour faciliter)
  console.log('💡 Le SQL a aussi été affiché ci-dessous pour un copier-coller facile :');
  console.log('');
  console.log(sql);
}

main().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
