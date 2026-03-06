#!/usr/bin/env node

/**
 * Synchronise les articles markdown (src/content/) vers la table `articles` de Supabase.
 *
 * Usage :
 *   node scripts/sync-articles-to-supabase.mjs
 *   node scripts/sync-articles-to-supabase.mjs --dry-run
 *
 * Nécessite : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { glob } from 'glob';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// --- Configuration ---
const CONTENT_DIR = path.resolve('src/content');
const DRY_RUN = process.argv.includes('--dry-run');

// Collections à ignorer (pas des articles factuels)
const SKIP_COLLECTIONS = ['pages-statiques', 'temoignages'];

// --- Supabase client (service role pour écriture) ---
const supabaseUrl = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// --- Fonctions utilitaires ---

function computeHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function extractSlug(filePath, collection) {
  const basename = path.basename(filePath, '.md');
  // Slug unique = collection/basename pour éviter les collisions
  return `${collection}/${basename}`;
}

async function getExistingArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('slug, content_hash');

  if (error) {
    console.error('❌ Erreur lecture articles existants:', error.message);
    return new Map();
  }

  return new Map(data.map(a => [a.slug, a.content_hash]));
}

// --- Main ---

async function main() {
  console.log('📄 Synchronisation des articles vers Supabase...');
  if (DRY_RUN) console.log('   (mode dry-run — aucune écriture)');
  console.log('');

  // 1. Lire tous les fichiers markdown
  const mdFiles = await glob('*/*.md', { cwd: CONTENT_DIR });
  console.log(`📂 ${mdFiles.length} fichiers markdown trouvés`);

  // 2. Récupérer les articles existants dans Supabase
  const existing = await getExistingArticles();
  console.log(`🗄️  ${existing.size} articles déjà dans Supabase`);
  console.log('');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // 3. Traiter chaque fichier
  for (const relativePath of mdFiles) {
    const collection = path.dirname(relativePath);

    if (SKIP_COLLECTIONS.includes(collection)) {
      skipped++;
      continue;
    }

    const fullPath = path.join(CONTENT_DIR, relativePath);
    const rawContent = fs.readFileSync(fullPath, 'utf8');
    const { data: frontmatter, content } = matter(rawContent);
    const contentHash = computeHash(rawContent);
    const slug = extractSlug(fullPath, collection);

    // Vérifier si le contenu a changé
    const existingHash = existing.get(slug);
    if (existingHash === contentHash) {
      skipped++;
      continue;
    }

    const article = {
      slug,
      title: frontmatter.title || path.basename(relativePath, '.md'),
      content: content.trim(),
      collection,
      author: frontmatter.author || null,
      published_at: frontmatter.publishedAt || frontmatter.pubDate || null,
      updated_at: frontmatter.updatedAt || null,
      content_hash: contentHash,
      is_active: frontmatter.published !== false,
      synced_at: new Date().toISOString()
    };

    if (DRY_RUN) {
      const action = existingHash ? 'UPDATE' : 'INSERT';
      console.log(`  [${action}] ${slug} — "${article.title}"`);
      if (existingHash) updated++;
      else created++;
      continue;
    }

    // Upsert dans Supabase
    const { error } = await supabase
      .from('articles')
      .upsert(article, { onConflict: 'slug' });

    if (error) {
      console.error(`  ❌ ${slug}: ${error.message}`);
      errors++;
    } else {
      const action = existingHash ? '🔄' : '✅';
      console.log(`  ${action} ${slug}`);
      if (existingHash) updated++;
      else created++;
    }
  }

  // 4. Résumé
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Créés   : ${created}`);
  console.log(`🔄 Mis à jour : ${updated}`);
  console.log(`⏭️  Ignorés   : ${skipped}`);
  if (errors > 0) console.log(`❌ Erreurs  : ${errors}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
