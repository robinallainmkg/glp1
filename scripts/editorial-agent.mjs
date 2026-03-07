#!/usr/bin/env node

/**
 * Agent Éditorial — Rédige les corrections d'articles basées sur les résultats fact-check.
 *
 * Workflow :
 *   1. Lit les entrées editorial_queue avec statut 'requested'
 *   2. Récupère la section de l'article original concernée
 *   3. Appelle Claude Sonnet pour rédiger la correction
 *   4. Met à jour editorial_queue avec la correction et statut 'pending_review'
 *
 * Usage :
 *   node scripts/editorial-agent.mjs                    # traite toute la queue
 *   node scripts/editorial-agent.mjs --limit 5          # 5 items max
 *   node scripts/editorial-agent.mjs --id UUID          # un seul item
 *
 * Secrets requis :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// --- Configuration ---

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;
const SYSTEM_PROMPT_PATH = path.resolve(__dirname, '../n8n/prompts/editorial-system-prompt.md');

// Parse CLI arguments
const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const idIndex = args.indexOf('--id');
const LIMIT = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 0;
const SINGLE_ID = idIndex !== -1 ? args[idIndex + 1] : null;

// --- Validate environment ---

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY requis');
  process.exit(1);
}

// --- Clients ---

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// --- Load system prompt ---

const systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');

// --- Functions ---

/**
 * Récupère les items de la queue en attente de traitement.
 */
async function fetchQueueItems() {
  let query = supabase
    .from('editorial_queue')
    .select(`
      id,
      fact_check_id,
      article_id,
      claim_original,
      realite_actuelle,
      source_reference,
      urgence,
      articles (
        id,
        slug,
        title,
        content,
        collection
      )
    `)
    .eq('statut', 'requested')
    .order('urgence', { ascending: true })  // urgent first
    .order('requested_at', { ascending: true });

  if (SINGLE_ID) {
    query = query.eq('id', SINGLE_ID);
  }

  if (LIMIT > 0) {
    query = query.limit(LIMIT);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erreur récupération queue:', error.message);
    process.exit(1);
  }
  return data || [];
}

/**
 * Extrait la section pertinente de l'article autour du claim.
 * Cherche le paragraphe/section contenant le claim original.
 */
function extractRelevantSection(articleContent, claimOriginal) {
  if (!articleContent || !claimOriginal) return null;

  // Normalize for comparison
  const normalizedClaim = claimOriginal.toLowerCase().trim();
  const lines = articleContent.split('\n');

  // Find the line containing (or closest to) the claim
  let bestLineIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    // Check for exact or partial match
    if (line.includes(normalizedClaim)) {
      bestLineIndex = i;
      bestScore = 1;
      break;
    }
    // Check for significant word overlap
    const claimWords = normalizedClaim.split(/\s+/).filter(w => w.length > 4);
    const matchingWords = claimWords.filter(w => line.includes(w));
    const score = matchingWords.length / Math.max(claimWords.length, 1);
    if (score > bestScore && score > 0.3) {
      bestScore = score;
      bestLineIndex = i;
    }
  }

  if (bestLineIndex === -1) {
    // Fallback: return first 500 chars
    return articleContent.substring(0, 500);
  }

  // Extract surrounding context (find section boundaries)
  let sectionStart = bestLineIndex;
  let sectionEnd = bestLineIndex;

  // Walk backwards to find section start (heading or empty line)
  for (let i = bestLineIndex - 1; i >= 0; i--) {
    if (lines[i].startsWith('#') || (lines[i].trim() === '' && bestLineIndex - i > 2)) {
      sectionStart = lines[i].startsWith('#') ? i : i + 1;
      break;
    }
    sectionStart = i;
  }

  // Walk forwards to find section end (next heading or empty line after content)
  for (let i = bestLineIndex + 1; i < lines.length; i++) {
    if (lines[i].startsWith('#') || (lines[i].trim() === '' && i - bestLineIndex > 3)) {
      sectionEnd = lines[i].startsWith('#') ? i - 1 : i;
      break;
    }
    sectionEnd = i;
  }

  // Ensure we don't return too much
  const maxLines = 30;
  if (sectionEnd - sectionStart > maxLines) {
    const center = bestLineIndex;
    sectionStart = Math.max(sectionStart, center - Math.floor(maxLines / 2));
    sectionEnd = Math.min(sectionEnd, center + Math.ceil(maxLines / 2));
  }

  return lines.slice(sectionStart, sectionEnd + 1).join('\n');
}

/**
 * Appelle Claude pour rédiger la correction d'une section.
 */
async function generateCorrection(item) {
  const startTime = Date.now();
  const article = item.articles;

  // Mark as processing
  await supabase
    .from('editorial_queue')
    .update({ statut: 'processing' })
    .eq('id', item.id);

  // Log start
  await supabase.from('agent_logs').insert({
    agent_type: 'editorial',
    article_id: item.article_id,
    status: 'started',
    metadata: { slug: article?.slug, queue_id: item.id, model: MODEL }
  });

  try {
    // Extract relevant section
    const sectionOriginale = extractRelevantSection(
      article?.content || '',
      item.claim_original
    );

    const userMessage = `# Correction à rédiger

**Article** : ${article?.title || 'Inconnu'}
**Collection** : ${article?.collection || 'N/A'}
**Slug** : ${article?.slug || 'N/A'}

## Claim problématique identifié par le fact-check

> ${item.claim_original}

## Réalité actuelle (vérifiée)

${item.realite_actuelle}

## Source de référence

${item.source_reference || 'Non spécifiée'}

## Urgence

${item.urgence}

## Section originale de l'article

\`\`\`markdown
${sectionOriginale || 'Section non trouvée — rédige une correction générique basée sur le claim.'}
\`\`\`

---

Rédige la version corrigée de cette section en intégrant naturellement l'information correcte.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    // Extract text
    const textBlocks = response.content.filter(b => b.type === 'text');
    const rawText = textBlocks.map(b => b.text).join('\n');

    // Parse JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Pas de JSON valide dans la réponse Claude pour ${article?.slug}`);
    }

    const result = JSON.parse(jsonMatch[0]);
    const durationMs = Date.now() - startTime;
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    // Update editorial_queue with correction
    const { error: updateError } = await supabase
      .from('editorial_queue')
      .update({
        section_originale: sectionOriginale,
        section_corrigee: result.section_corrigee,
        explication_correction: result.explication_correction,
        model_used: MODEL,
        tokens_used: tokensUsed,
        statut: 'pending_review',
        processed_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (updateError) {
      throw new Error(`Erreur mise à jour Supabase: ${updateError.message}`);
    }

    // Log success
    await supabase.from('agent_logs').insert({
      agent_type: 'editorial',
      article_id: item.article_id,
      status: 'success',
      duration_ms: durationMs,
      tokens_used: tokensUsed,
      metadata: {
        slug: article?.slug,
        queue_id: item.id,
        model: MODEL,
        confiance: result.confiance
      }
    });

    return {
      id: item.id,
      slug: article?.slug,
      confiance: result.confiance,
      tokens_used: tokensUsed,
      duration_ms: durationMs
    };

  } catch (err) {
    const durationMs = Date.now() - startTime;

    // Revert to requested on error
    await supabase
      .from('editorial_queue')
      .update({ statut: 'requested' })
      .eq('id', item.id);

    // Log error
    await supabase.from('agent_logs').insert({
      agent_type: 'editorial',
      article_id: item.article_id,
      status: 'error',
      duration_ms: durationMs,
      error: err.message,
      metadata: { slug: article?.slug, queue_id: item.id, model: MODEL }
    });

    console.error(`  ❌ ${article?.slug}: ${err.message}`);
    return { id: item.id, slug: article?.slug, error: err.message };
  }
}

// --- Main ---

async function main() {
  console.log('✏️  Agent Éditorial GLP1');
  console.log(`   Modèle : ${MODEL}`);
  if (SINGLE_ID) console.log(`   Item ciblé : ${SINGLE_ID}`);
  if (LIMIT > 0) console.log(`   Limite : ${LIMIT} items`);
  console.log('');

  // 1. Fetch queue items
  const items = await fetchQueueItems();
  console.log(`📋 ${items.length} correction(s) à rédiger\n`);

  if (items.length === 0) {
    console.log('✅ Aucune correction en attente');
    return;
  }

  // 2. Process each item sequentially
  const results = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`[${i + 1}/${items.length}] ${item.articles?.slug || 'inconnu'} — "${item.claim_original.substring(0, 60)}..."`);

    const result = await generateCorrection(item);
    results.push(result);

    if (!result.error) {
      console.log(`  ✅ Correction rédigée (confiance: ${result.confiance}%)`);
    }

    // Delay between API calls
    if (i < items.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 3. Summary
  const successful = results.filter(r => !r.error);
  const errors = results.filter(r => r.error);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Rédigées    : ${successful.length}`);
  console.log(`❌ Erreurs     : ${errors.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔗 Relecture : https://glp1-france.fr/admin/editorial');

  // 4. Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const output = [
      `total=${items.length}`,
      `processed=${successful.length}`,
      `errors=${errors.length}`
    ].join('\n');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, output + '\n');
  }

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
