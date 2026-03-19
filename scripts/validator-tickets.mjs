/**
 * Validator — Create correction tickets with article_id resolution
 * Run after validator-run.mjs to insert tickets that were blocked by article_id constraint
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src/content');

function log(msg) { console.log(`[validator-tickets] ${msg}`); }

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const yamlText = match[1];
  const result = {};
  const keys = [];
  const duplicateKeys = [];
  const lines = yamlText.split('\n');
  for (const line of lines) {
    const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
    if (keyMatch) {
      const key = keyMatch[1];
      if (keys.includes(key)) duplicateKeys.push(key);
      else keys.push(key);
      const valueMatch = line.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*(.*)$/);
      if (valueMatch) {
        let val = valueMatch[1].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        result[key] = val;
      }
    }
  }
  result._duplicateKeys = duplicateKeys;
  return result;
}

function getBody(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1] : content;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

async function main() {
  console.log('\n=== VALIDATOR TICKETS — GLP1 France ===\n');

  // Load all articles from Supabase to build slug→id map
  log('Chargement des articles Supabase...');
  const { data: allArticles, error: artError } = await supabase
    .from('articles')
    .select('id, slug');

  if (artError) {
    log(`Erreur chargement articles: ${artError.message}`);
    return;
  }

  // Build slug map — slugs are stored as collection/slug or just slug
  const slugToId = new Map();
  for (const art of allArticles) {
    slugToId.set(art.slug, art.id);
    // Also map just the basename (part after last /)
    const parts = art.slug.split('/');
    const basename = parts[parts.length - 1];
    if (!slugToId.has(basename)) slugToId.set(basename, art.id);
    // Also with collection prefix variations
    if (parts.length >= 2) {
      const collectionSlug = `${parts[0]}/${basename}`;
      if (!slugToId.has(collectionSlug)) slugToId.set(collectionSlug, art.id);
    }
  }
  log(`${allArticles.length} articles chargés, ${slugToId.size} entrées slug→id`);

  // Collect markdown files
  const allFiles = [];
  function collectMd(dir) {
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) collectMd(fullPath);
        else if (entry.endsWith('.md') && allFiles.length < 50) allFiles.push(fullPath);
      }
    } catch (e) {}
  }
  collectMd(CONTENT_DIR);

  log(`${allFiles.length} fichiers markdown à analyser`);

  const tickets = [];

  function getArticleId(slug, collection) {
    // Try various slug formats: collection/slug is the primary format in DB
    const candidates = [
      `${collection}/${slug}`,
      slug,
      slug.replace(/-/g, '_'),
      `${collection}/${slug}`.replace(/-/g, '_'),
    ];
    for (const c of candidates) {
      if (slugToId.has(c)) return slugToId.get(c);
    }
    return null;
  }

  function addTicket(slug, collection, title, ticketType, urgence, beforeExact, afterSuggested, claimOriginal, realiteActuelle) {
    const articleId = getArticleId(slug, collection);
    if (!articleId) {
      // Skip ticket if no article_id found — article not in DB
      return;
    }
    tickets.push({
      article_id: articleId,
      slug,
      title,
      source_agent: 'validator',
      ticket_type: ticketType,
      urgence,
      before_exact: beforeExact,
      after_suggested: afterSuggested,
      claim_original: claimOriginal,
      realite_actuelle: realiteActuelle,
      statut: 'approved'
    });
  }

  // ---- Run all checks and generate tickets ----

  const titles = new Map();
  const descriptions = new Map();
  const keywords = new Map();

  for (const filePath of allFiles) {
    const slug = path.basename(filePath, '.md');
    const collection = path.basename(path.dirname(filePath));
    const content = fs.readFileSync(filePath, 'utf8');

    // --- Frontmatter checks ---
    if (!content.startsWith('---')) {
      addTicket(slug, collection, `Frontmatter manquant: ${slug}`, 'info_outdated', 'urgent',
        'Fichier sans bloc frontmatter ---', 'Ajouter un frontmatter YAML valide',
        'Frontmatter absent', 'Le fichier ne commence pas par ---');
      continue;
    }

    const fm = parseFrontmatter(content);
    if (!fm) continue;

    if (fm._duplicateKeys && fm._duplicateKeys.length > 0) {
      const dupes = fm._duplicateKeys.join(', ');
      addTicket(slug, collection, `Clés YAML dupliquées: ${slug}`, 'frontmatter_duplicate_key', 'urgent',
        `Clés dupliquées: ${dupes}`, `Supprimer les doublons de: ${dupes}`,
        `Clés YAML dupliquées: ${dupes}`, `Le fichier ${slug} a des clés YAML en double dans le frontmatter`);
    }

    const title = fm.title?.trim() || '';
    const description = fm.description?.trim() || '';
    const mainKeyword = fm.mainKeyword?.trim() || '';

    if (!title) {
      addTicket(slug, collection, `Title manquant: ${slug}`, 'info_outdated', 'urgent',
        'Champ title absent ou vide', 'Ajouter un titre descriptif', 'Title absent', 'Le frontmatter ne contient pas de champ title');
    }

    if (!description) {
      addTicket(slug, collection, `Description manquante: ${slug}`, 'missing_description', 'urgent',
        'Champ description absent ou vide', 'Ajouter une meta description entre 50 et 160 caractères',
        'Description absente', 'Le frontmatter ne contient pas de champ description');
    } else if (description.length < 50) {
      addTicket(slug, collection, `Description trop courte: ${slug}`, 'missing_description', 'warning',
        `Description actuelle: "${description}" (${description.length} chars)`,
        'Écrire une description entre 50 et 160 caractères',
        `Description trop courte: ${description.length} caractères`, 'La meta description doit faire au moins 50 caractères');
    }

    // --- SEO Meta checks ---
    if (title.length > 0 && title.length < 30) {
      addTicket(slug, collection, `Title trop court: ${slug}`, 'seo_issue', 'warning',
        `Title actuel: "${title}" (${title.length} chars)`, 'Écrire un title entre 30 et 65 caractères',
        `Title trop court: ${title.length} caractères`, 'Le title doit faire entre 30 et 65 caractères pour le SEO');
    } else if (title.length > 65) {
      addTicket(slug, collection, `Title trop long: ${slug}`, 'seo_issue', 'warning',
        `Title actuel: "${title}" (${title.length} chars)`, 'Raccourcir le title à 65 caractères max',
        `Title trop long: ${title.length} caractères`, 'Le title dépasse 65 caractères');
    }

    // --- Duplicates ---
    if (title) {
      if (titles.has(title)) {
        addTicket(slug, collection, `Title dupliqué: ${slug}`, 'duplicate_content', 'warning',
          `Title "${title}" identique à ${titles.get(title)}`, 'Différencier les titles des deux articles',
          `Title dupliqué: ${title}`, `Deux articles ont le même title`);
      } else {
        titles.set(title, slug);
      }
    }

    if (description && description.length > 30) {
      if (descriptions.has(description)) {
        addTicket(slug, collection, `Description dupliquée: ${slug}`, 'duplicate_content', 'warning',
          `Description identique à ${descriptions.get(description)}`, 'Écrire une description unique pour cet article',
          `Description dupliquée`, `Deux articles ont la même meta description`);
      } else {
        descriptions.set(description, slug);
      }
    }

    if (mainKeyword) {
      if (keywords.has(mainKeyword)) {
        addTicket(slug, collection, `Keyword dupliqué: ${slug}`, 'duplicate_content', 'warning',
          `mainKeyword "${mainKeyword}" aussi ciblé par ${keywords.get(mainKeyword)}`, 'Choisir un keyword différent ou fusionner les articles',
          `Keyword dupliqué: ${mainKeyword}`, `Deux articles ciblent le même mot-clé principal`);
      } else {
        keywords.set(mainKeyword, slug);
      }
    }

    // --- Content quality ---
    const body = getBody(content);
    const words = countWords(body);
    if (words < 300) {
      addTicket(slug, collection, `Contenu trop court: ${slug}`, 'content_quality', 'warning',
        `Article avec seulement ${words} mots`, 'Enrichir l\'article pour atteindre au moins 300 mots',
        `Contenu trop court: ${words} mots`, 'Un article doit avoir au moins 300 mots pour le SEO');
    }
  }

  log(`${tickets.length} tickets avec article_id valide prêts à insérer`);

  if (tickets.length === 0) {
    log('Aucun ticket à insérer');
    return;
  }

  // Check for existing tickets to avoid duplicates (same slug + ticket_type + statut approved)
  log('Vérification des doublons de tickets existants...');
  const { data: existingTickets } = await supabase
    .from('correction_tickets')
    .select('slug, ticket_type')
    .eq('source_agent', 'validator')
    .in('statut', ['approved', 'in_progress']);

  const existingSet = new Set((existingTickets || []).map(t => `${t.slug}:${t.ticket_type}`));
  const newTickets = tickets.filter(t => !existingSet.has(`${t.slug}:${t.ticket_type}`));

  log(`${existingSet.size} tickets existants, ${newTickets.length} nouveaux tickets à insérer`);

  if (newTickets.length === 0) {
    log('Tous les tickets existent déjà');
    return;
  }

  // Insert in batches
  let inserted = 0;
  let failed = 0;
  for (let i = 0; i < newTickets.length; i += 20) {
    const batch = newTickets.slice(i, i + 20);
    const { error } = await supabase.from('correction_tickets').insert(batch);
    if (error) {
      log(`Erreur batch ${i}: ${error.message}`);
      failed += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  console.log(`\n=== TICKETS CRÉÉS ===`);
  console.log(`Insérés  : ${inserted}`);
  console.log(`Échoués  : ${failed}`);
  console.log(`Total    : ${newTickets.length}`);
  console.log(`====================\n`);
}

main().catch(e => {
  console.error('Erreur fatale:', e);
  process.exit(1);
});
