#!/usr/bin/env node

/**
 * Ingestion RAG : decoupe les articles en chunks, genere les embeddings
 * via Mistral Embed, et les stocke dans article_chunks (pgvector).
 *
 * Usage :
 *   node scripts/ingest-knowledge-base.mjs
 *   node scripts/ingest-knowledge-base.mjs --dry-run
 *
 * Necessite dans .env :
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   MISTRAL_API_KEY
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
const VERBOSE = process.argv.includes('--verbose');
const BATCH_SIZE = 20; // embeddings par batch
const BATCH_DELAY_MS = 600; // delai entre batches (rate limiting Mistral)
const MAX_CHUNK_CHARS = 3200; // ~800 tokens
const MIN_CHUNK_CHARS = 50; // ignorer les sections trop courtes

// Collections a ignorer
const SKIP_COLLECTIONS = ['temoignages', 'pages-statiques'];

// --- Supabase ---
const supabaseUrl = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mistralKey = process.env.MISTRAL_API_KEY;

if (!supabaseKey && !DRY_RUN) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  process.exit(1);
}
if (!mistralKey && !DRY_RUN) {
  console.error('❌ MISTRAL_API_KEY manquant dans .env');
  process.exit(1);
}

const supabase = DRY_RUN ? null : createClient(supabaseUrl, supabaseKey);

// --- Helpers ---
function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Nettoie le contenu markdown pour l'embedding :
 * - Supprime les commentaires HTML
 * - Supprime les blocs de code de config (affiliate, etc.)
 * - Supprime les images en markdown
 * - Garde le texte pur
 */
function cleanContent(text) {
  return text
    .replace(/<!--[\s\S]*?-->/g, '')           // commentaires HTML
    .replace(/```[\s\S]*?```/g, '')             // blocs de code
    .replace(/!\[.*?\]\(.*?\)/g, '')            // images markdown
    .replace(/<[^>]+>/g, '')                     // tags HTML
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // liens → texte seul
    .replace(/\n{3,}/g, '\n\n')                 // espaces multiples
    .trim();
}

/**
 * Decoupe un article markdown en chunks par heading H2.
 * Si une section depasse MAX_CHUNK_CHARS, decoupe par paragraphes.
 */
function chunkArticle(content, frontmatter) {
  const cleaned = cleanContent(content);
  const sections = cleaned.split(/^## /m);
  const chunks = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    let heading = null;
    let body = section;

    if (i > 0) {
      // Extraire le heading H2
      const lines = section.split('\n');
      heading = lines[0].replace(/^#+\s*/, '').trim();
      body = lines.slice(1).join('\n').trim();
    } else {
      heading = 'Introduction';
    }

    if (body.length < MIN_CHUNK_CHARS) continue;

    // Si le chunk est trop long, decouper par paragraphes
    if (body.length > MAX_CHUNK_CHARS) {
      const paragraphs = body.split(/\n\n+/);
      let currentChunk = '';
      let subIndex = 0;

      for (const para of paragraphs) {
        if ((currentChunk + '\n\n' + para).length > MAX_CHUNK_CHARS && currentChunk.length > MIN_CHUNK_CHARS) {
          chunks.push({
            section_heading: subIndex === 0 ? heading : `${heading} (suite ${subIndex})`,
            content: currentChunk.trim(),
          });
          currentChunk = para;
          subIndex++;
        } else {
          currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
        }
      }
      if (currentChunk.length >= MIN_CHUNK_CHARS) {
        chunks.push({
          section_heading: subIndex === 0 ? heading : `${heading} (suite ${subIndex})`,
          content: currentChunk.trim(),
        });
      }
    } else {
      chunks.push({ section_heading: heading, content: body });
    }
  }

  return chunks;
}

/**
 * Appelle l'API Mistral Embed pour un batch de textes.
 */
async function embedBatch(texts) {
  const response = await fetch('https://api.mistral.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mistralKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-embed',
      input: texts,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Mistral Embed error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.data.map(d => d.embedding);
}

// --- Main ---
async function main() {
  console.log('🚀 Ingestion knowledge base GLP-1');
  console.log(`   Content dir: ${CONTENT_DIR}`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  // 1. Trouver tous les fichiers markdown
  const mdFiles = await glob('**/*.md', { cwd: CONTENT_DIR });
  console.log(`📄 ${mdFiles.length} fichiers markdown trouves`);

  // 2. Parser et chunker
  const allChunks = [];
  let skippedFiles = 0;

  for (const relPath of mdFiles) {
    const collection = path.dirname(relPath);
    if (SKIP_COLLECTIONS.includes(collection)) {
      skippedFiles++;
      continue;
    }

    const fullPath = path.join(CONTENT_DIR, relPath);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    // Skip unpublished
    if (frontmatter.draft === true || frontmatter.published === false) {
      skippedFiles++;
      continue;
    }

    const slug = path.basename(relPath, '.md');
    const title = frontmatter.title || frontmatter.titre || slug;

    const chunks = chunkArticle(content, frontmatter);

    for (const chunk of chunks) {
      const hashInput = `${collection}|${slug}|${chunk.section_heading}|${chunk.content}`;
      allChunks.push({
        article_slug: slug,
        collection,
        title,
        section_heading: chunk.section_heading,
        content: chunk.content,
        content_hash: sha256(hashInput),
        metadata: {
          tags: frontmatter.tags || [],
          category: frontmatter.category || null,
          description: frontmatter.description || null,
        },
      });
    }
  }

  console.log(`✂️  ${allChunks.length} chunks generes (${skippedFiles} fichiers ignores)`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN — Premiers chunks :');
    for (const chunk of allChunks.slice(0, 5)) {
      console.log(`  [${chunk.collection}/${chunk.article_slug}] ${chunk.section_heading} (${chunk.content.length} chars)`);
      if (VERBOSE) {
        console.log(`    ${chunk.content.slice(0, 100)}...`);
      }
    }
    console.log(`\n  ... et ${allChunks.length - 5} autres chunks`);
    console.log('\n✅ Dry run termine. Relancez sans --dry-run pour ingerer.');
    return;
  }

  // 3. Verifier quels chunks existent deja (dedup)
  const existingHashes = new Set();
  const { data: existing } = await supabase
    .from('article_chunks')
    .select('content_hash');

  if (existing) {
    for (const row of existing) {
      existingHashes.add(row.content_hash);
    }
  }

  const newChunks = allChunks.filter(c => !existingHashes.has(c.content_hash));
  console.log(`🆕 ${newChunks.length} nouveaux chunks a ingerer (${allChunks.length - newChunks.length} deja en base)`);

  if (newChunks.length === 0) {
    console.log('✅ Rien a ingerer, tout est a jour !');
    return;
  }

  // 4. Embed par batches
  let totalEmbedded = 0;
  const batches = [];
  for (let i = 0; i < newChunks.length; i += BATCH_SIZE) {
    batches.push(newChunks.slice(i, i + BATCH_SIZE));
  }

  console.log(`\n🧠 Embedding en ${batches.length} batches de ${BATCH_SIZE}...\n`);

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const texts = batch.map(c => `${c.title} — ${c.section_heading}\n\n${c.content}`);

    try {
      const embeddings = await embedBatch(texts);

      // Upsert dans Supabase
      const rows = batch.map((chunk, i) => ({
        ...chunk,
        embedding: embeddings[i],
      }));

      const { error } = await supabase
        .from('article_chunks')
        .upsert(rows, { onConflict: 'content_hash' });

      if (error) {
        console.error(`  ❌ Batch ${batchIdx + 1} erreur Supabase:`, error.message);
      } else {
        totalEmbedded += batch.length;
        console.log(`  ✅ Batch ${batchIdx + 1}/${batches.length} — ${batch.length} chunks ingeres`);
      }

      // Rate limit delay
      if (batchIdx < batches.length - 1) {
        await sleep(BATCH_DELAY_MS);
      }
    } catch (err) {
      console.error(`  ❌ Batch ${batchIdx + 1} erreur:`, err.message);
      // Continue avec le batch suivant
    }
  }

  console.log(`\n🎉 Ingestion terminee : ${totalEmbedded}/${newChunks.length} chunks ingeres`);

  // 5. Stats finales
  const { count } = await supabase
    .from('article_chunks')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total en base : ${count} chunks`);
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
