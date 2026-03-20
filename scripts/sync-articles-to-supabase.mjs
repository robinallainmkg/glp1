#!/usr/bin/env node

/**
 * Synchronise TOUT le contenu du site vers la table `articles` de Supabase :
 *   - Articles markdown (src/content/*\/*.md)
 *   - Pages Astro avec contenu textuel (src/pages/**\/*.astro)
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
const PAGES_DIR = path.resolve('src/pages');
const DRY_RUN = process.argv.includes('--dry-run');

// Collections markdown à ignorer (pas des articles factuels)
const SKIP_COLLECTIONS = ['temoignages'];

// Patterns de pages Astro à ignorer (admin, test, utilitaires, redirections dynamiques)
const SKIP_ASTRO_PATTERNS = [
  /^_disabled\//,       // Pages désactivées
  /^_utils\//,          // Utilitaires internes
  /^admin/,             // Pages admin
  /^test-/,             // Pages de test
  /^demo-/,             // Pages de démo
  /^images\//,          // Génération d'images
  /^404\.astro$/,       // Page 404
  /\[.*\]\.astro$/,     // Routes dynamiques ([slug].astro, [city].astro, [...slug].astro)
];

// Seuil minimum de texte extrait (en caractères) pour qu'une page Astro soit indexée
const MIN_TEXT_LENGTH = 200;

// --- Supabase client (service role pour écriture) ---
const supabaseUrl = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey && !DRY_RUN) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  process.exit(1);
}

const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// --- Fonctions utilitaires ---

function computeHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function extractSlug(filePath, collection) {
  // IMPORTANT: Always use short slug (basename only, no collection prefix)
  // This avoids duplicates like "glp1-cout/prix-mounjaro-france" vs "prix-mounjaro-france"
  const basename = path.basename(filePath, '.md');
  return basename;
}

/**
 * Extrait le texte visible d'un template Astro (partie après le frontmatter ---).
 * Supprime les balises HTML, les blocs <style> et <script>, et normalise les espaces.
 */
function extractTextFromAstro(rawContent) {
  // Séparer le frontmatter Astro (entre --- et ---) du template
  const parts = rawContent.split('---');
  // Le template commence après le 2ème ---
  const template = parts.length >= 3 ? parts.slice(2).join('---') : rawContent;

  // Supprimer les blocs <style>...</style> et <script>...</script>
  let text = template
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  // Supprimer les expressions Astro/JSX entre accolades { ... }
  text = text.replace(/\{[^}]*\}/g, ' ');

  // Supprimer les balises HTML mais garder le contenu textuel
  text = text.replace(/<[^>]+>/g, ' ');

  // Décoder les entités HTML courantes
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Normaliser les espaces
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Extrait les métadonnées d'un fichier Astro depuis le frontmatter JS.
 * Cherche un objet `metadata` ou des variables `title`/`description`.
 */
function extractAstroMetadata(rawContent) {
  const parts = rawContent.split('---');
  const frontmatter = parts.length >= 3 ? parts[1] : '';

  const metadata = {};

  // Chercher const metadata = { title: '...', ... }
  const metadataMatch = frontmatter.match(/(?:const\s+)?metadata\s*=\s*\{([\s\S]*?)\};/);
  if (metadataMatch) {
    const block = metadataMatch[1];
    const titleMatch = block.match(/title\s*:\s*['"`]([^'"`]+)['"`]/);
    const descMatch = block.match(/description\s*:\s*['"`]([^'"`]+)['"`]/);
    const authorMatch = block.match(/author\s*:\s*['"`]([^'"`]+)['"`]/);
    const publishedMatch = block.match(/publishedAt\s*:\s*['"`]([^'"`]+)['"`]/);
    const updatedMatch = block.match(/updatedAt\s*:\s*['"`]([^'"`]+)['"`]/);
    const categoryMatch = block.match(/category\s*:\s*['"`]([^'"`]+)['"`]/);

    if (titleMatch) metadata.title = titleMatch[1];
    if (descMatch) metadata.description = descMatch[1];
    if (authorMatch) metadata.author = authorMatch[1];
    if (publishedMatch) metadata.publishedAt = publishedMatch[1];
    if (updatedMatch) metadata.updatedAt = updatedMatch[1];
    if (categoryMatch) metadata.category = categoryMatch[1];
  }

  // Fallback: chercher title="..." ou title='...' dans les props du layout
  if (!metadata.title) {
    const titlePropMatch = rawContent.match(/title\s*=\s*["']([^"']+)["']/);
    if (titlePropMatch) metadata.title = titlePropMatch[1];
  }

  if (!metadata.description) {
    const descPropMatch = rawContent.match(/description\s*=\s*["']([^"']+)["']/);
    if (descPropMatch) metadata.description = descPropMatch[1];
  }

  return metadata;
}

/**
 * Détecte si un fichier Astro est une simple page de redirection.
 */
function isRedirectPage(rawContent) {
  // Vérifier les patterns de redirection courants
  return (
    rawContent.includes('window.location.replace(') ||
    rawContent.includes('Astro.redirect(') ||
    (rawContent.includes('meta http-equiv="refresh"') && !rawContent.includes('<section'))
  );
}

async function getExistingArticles() {
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from('articles')
    .select('slug, content_hash');

  if (error) {
    console.error('❌ Erreur lecture articles existants:', error.message);
    return new Map();
  }

  return new Map(data.map(a => [a.slug, a.content_hash]));
}

/**
 * Upsert ou log un article (markdown ou Astro).
 */
async function upsertArticle(article, existing, counters) {
  const existingHash = existing.get(article.slug);
  if (existingHash === article.content_hash) {
    counters.skipped++;
    return;
  }

  if (DRY_RUN) {
    const action = existingHash ? 'UPDATE' : 'INSERT';
    console.log(`  [${action}] ${article.slug} — "${article.title}"`);
    if (existingHash) counters.updated++;
    else counters.created++;
    return;
  }

  const { error } = await supabase
    .from('articles')
    .upsert(article, { onConflict: 'slug' });

  if (error) {
    console.error(`  ❌ ${article.slug}: ${error.message}`);
    counters.errors++;
  } else {
    const action = existingHash ? '🔄' : '✅';
    console.log(`  ${action} ${article.slug}`);
    if (existingHash) counters.updated++;
    else counters.created++;
  }
}

// --- Main ---

async function main() {
  console.log('📄 Synchronisation de TOUT le contenu vers Supabase...');
  if (DRY_RUN) console.log('   (mode dry-run — aucune écriture)');
  console.log('');

  // Récupérer les articles existants dans Supabase
  const existing = await getExistingArticles();
  console.log(`🗄️  ${existing.size} articles déjà dans Supabase`);
  console.log('');

  const counters = { created: 0, updated: 0, skipped: 0, errors: 0 };

  // ──────────────────────────────────────────────
  // PARTIE 1 : Articles Markdown (src/content/)
  // ──────────────────────────────────────────────
  const mdFiles = await glob('*/*.md', { cwd: CONTENT_DIR });
  console.log(`📂 ${mdFiles.length} fichiers markdown trouvés`);

  for (const relativePath of mdFiles) {
    const collection = path.dirname(relativePath);

    if (SKIP_COLLECTIONS.includes(collection)) {
      counters.skipped++;
      continue;
    }

    const fullPath = path.join(CONTENT_DIR, relativePath);
    const rawContent = fs.readFileSync(fullPath, 'utf8');
    const { data: frontmatter, content } = matter(rawContent);
    const contentHash = computeHash(rawContent);
    const slug = extractSlug(fullPath, collection);

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

    await upsertArticle(article, existing, counters);
  }

  // ──────────────────────────────────────────────
  // PARTIE 2 : Pages Astro (src/pages/)
  // ──────────────────────────────────────────────
  const astroFiles = await glob('**/*.astro', { cwd: PAGES_DIR });
  console.log(`\n🌐 ${astroFiles.length} fichiers Astro trouvés`);

  let astroIndexed = 0;
  let astroSkipped = 0;

  for (const relativePath of astroFiles) {
    // Vérifier les patterns à ignorer
    if (SKIP_ASTRO_PATTERNS.some(pattern => pattern.test(relativePath))) {
      astroSkipped++;
      continue;
    }

    const fullPath = path.join(PAGES_DIR, relativePath);
    const rawContent = fs.readFileSync(fullPath, 'utf8');

    // Ignorer les pages de redirection
    if (isRedirectPage(rawContent)) {
      astroSkipped++;
      continue;
    }

    // Extraire le texte visible
    const textContent = extractTextFromAstro(rawContent);

    // Ignorer les pages avec trop peu de contenu textuel
    if (textContent.length < MIN_TEXT_LENGTH) {
      astroSkipped++;
      continue;
    }

    // Extraire les métadonnées
    const metadata = extractAstroMetadata(rawContent);
    const contentHash = computeHash(rawContent);

    // Construire le slug : astro-pages/chemin/nom
    const baseName = relativePath.replace(/\.astro$/, '');
    const slug = `astro-pages/${baseName}`;

    // Déterminer la collection logique à partir du chemin
    const pathParts = relativePath.split('/');
    const collection = pathParts.length > 1
      ? `astro-${pathParts[0]}`
      : 'astro-pages';

    const article = {
      slug,
      title: metadata.title || baseName.split('/').pop().replace(/-/g, ' '),
      content: textContent,
      collection,
      author: metadata.author || null,
      published_at: metadata.publishedAt || null,
      updated_at: metadata.updatedAt || null,
      content_hash: contentHash,
      is_active: true,
      synced_at: new Date().toISOString()
    };

    await upsertArticle(article, existing, counters);
    astroIndexed++;
  }

  console.log(`   ✅ ${astroIndexed} pages Astro indexées, ⏭️ ${astroSkipped} ignorées`);

  // ──────────────────────────────────────────────
  // Résumé final
  // ──────────────────────────────────────────────
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Créés     : ${counters.created}`);
  console.log(`🔄 Mis à jour : ${counters.updated}`);
  console.log(`⏭️  Ignorés   : ${counters.skipped}`);
  if (counters.errors > 0) console.log(`❌ Erreurs   : ${counters.errors}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
