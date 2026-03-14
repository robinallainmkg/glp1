#!/usr/bin/env node

/**
 * Agent Editorial — Redige after_final pour les tickets de correction approuves.
 *
 * Workflow :
 *   1. Lit les tickets correction_tickets avec statut 'approved' ou 'revision_needed'
 *   2. Lit le fichier markdown de l'article depuis le repo
 *   3. Appelle Claude Sonnet pour produire after_final
 *   4. Met a jour le ticket avec after_final, statut -> 'ready_to_deploy'
 *
 * Usage :
 *   node scripts/editorial-agent.mjs                     # traite tous les tickets approuves
 *   node scripts/editorial-agent.mjs --limit 5           # 5 tickets max
 *   node scripts/editorial-agent.mjs --ticket-id UUID    # un seul ticket
 *
 * Secrets requis :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// --- Configuration ---

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;
const SYSTEM_PROMPT_PATH = path.resolve(__dirname, '../n8n/prompts/editorial-system-prompt.md');

// --- Charge .env si present (pour execution locale) ---
const dotenvPath = path.join(PROJECT_ROOT, '.env');
if (fs.existsSync(dotenvPath)) {
  fs.readFileSync(dotenvPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
}

// Parse CLI arguments
const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const ticketIdIndex = args.indexOf('--ticket-id');
const LIMIT = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 0;
const SINGLE_TICKET_ID = ticketIdIndex !== -1 ? args[ticketIdIndex + 1] : null;

// --- Validate environment ---

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY requis');
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
 * Trouve le fichier markdown source d'un article par son slug.
 */
async function findArticleFile(slug) {
  // slug format: "collection/article-name" or "astro-pages/path/name"
  const parts = slug.split('/');

  if (parts[0] === 'astro-pages') {
    // Astro page: src/pages/{rest}.astro
    const astroPath = parts.slice(1).join('/') + '.astro';
    const fullPath = path.join(PROJECT_ROOT, 'src/pages', astroPath);
    if (fs.existsSync(fullPath)) return fullPath;
    return null;
  }

  // Markdown article: src/content/{collection}/{name}.md
  const collection = parts[0];
  const name = parts.slice(1).join('/');
  const fullPath = path.join(PROJECT_ROOT, 'src/content', collection, name + '.md');
  if (fs.existsSync(fullPath)) return fullPath;

  // Fallback: glob search
  const matches = await glob(`src/content/**/${name}.md`, { cwd: PROJECT_ROOT });
  if (matches.length > 0) return path.join(PROJECT_ROOT, matches[0]);

  return null;
}

/**
 * Extrait le contexte autour de before_exact dans le fichier.
 */
function extractContext(fileContent, beforeExact, contextLines = 15) {
  const idx = fileContent.indexOf(beforeExact);
  if (idx === -1) return null;

  const beforeText = fileContent.substring(0, idx);
  const afterText = fileContent.substring(idx + beforeExact.length);

  const linesBefore = beforeText.split('\n').slice(-contextLines).join('\n');
  const linesAfter = afterText.split('\n').slice(0, contextLines).join('\n');

  return `${linesBefore}\n${beforeExact}\n${linesAfter}`;
}

/**
 * Detecte le format du passage (liste, tableau, titre, paragraphe).
 */
function detectFormat(beforeExact) {
  const trimmed = beforeExact.trimStart();
  if (/^[-*]\s/.test(trimmed)) return 'un element de liste a puces';
  if (/^\|/.test(trimmed)) return 'un element de tableau';
  if (/^#{1,6}\s/.test(trimmed)) return 'un titre ou sous-titre';
  return 'un paragraphe';
}

/**
 * Extrait 2-3 phrases voisines pour donner un exemple du style de l'article.
 */
function extractStyleSample(fileContent, beforeExact) {
  const idx = fileContent.indexOf(beforeExact);
  if (idx === -1) return '';

  const beforeText = fileContent.substring(0, idx);
  const afterText = fileContent.substring(idx + beforeExact.length);

  // Prendre quelques lignes non-vides avant et apres comme echantillon de style
  const linesBefore = beforeText.split('\n').filter(l => l.trim().length > 20).slice(-2);
  const linesAfter = afterText.split('\n').filter(l => l.trim().length > 20).slice(0, 2);

  const samples = [...linesBefore, ...linesAfter].slice(0, 3);
  return samples.length > 0 ? samples.join('\n') : '';
}

/**
 * Recupere les tickets a traiter.
 */
async function fetchTickets() {
  let query = supabase
    .from('correction_tickets')
    .select('*')
    .in('statut', ['approved', 'revision_needed'])
    .order('urgence', { ascending: true })
    .order('created_at', { ascending: true });

  if (SINGLE_TICKET_ID) {
    query = supabase
      .from('correction_tickets')
      .select('*')
      .eq('id', SINGLE_TICKET_ID);
  }

  if (LIMIT > 0) {
    query = query.limit(LIMIT);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Erreur recuperation tickets:', error.message);
    process.exit(1);
  }
  return data || [];
}

/**
 * Traite un ticket : genere after_final via Claude.
 */
async function processTicket(ticket) {
  const startTime = Date.now();

  // Mark as in_progress
  await supabase
    .from('correction_tickets')
    .update({ statut: 'in_progress' })
    .eq('id', ticket.id);

  // Log start
  await supabase.from('agent_logs').insert({
    agent_type: 'editorial',
    article_id: ticket.article_id,
    status: 'started',
    metadata: { slug: ticket.slug, ticket_id: ticket.id, model: MODEL }
  });

  try {
    // Find and read the source file
    const filePath = await findArticleFile(ticket.slug);
    let fileContent = '';
    let context = '';

    if (filePath) {
      fileContent = fs.readFileSync(filePath, 'utf8');
      context = extractContext(fileContent, ticket.before_exact) || '';

      if (!fileContent.includes(ticket.before_exact)) {
        console.warn(`  WARN: before_exact non trouve mot pour mot dans ${filePath}`);
      }
    }

    const styleSample = fileContent ? extractStyleSample(fileContent, ticket.before_exact) : '';

    const userMessage = `# Ticket de correction #${ticket.id.substring(0, 8)}

**Article** : ${ticket.title}
**Slug** : ${ticket.slug}
**Type** : ${ticket.ticket_type}
**Urgence** : ${ticket.urgence}

## Passage a corriger (before_exact)

\`\`\`markdown
${ticket.before_exact}
\`\`\`

## Correction proposee par le fact-checker (after_suggested)

\`\`\`markdown
${ticket.after_suggested}
\`\`\`

## Claim problematique

> ${ticket.claim_original}

## Realite actuelle (verifiee)

${ticket.realite_actuelle}

## Source de reference

${ticket.source_reference || 'Non specifiee'}

${ticket.human_note ? `## Note de l'humain (PRIORITAIRE)

> ${ticket.human_note}

**Tu DOIS respecter les instructions de cette note.**` : ''}

${context ? `## Contexte dans l'article (extrait autour du passage)

\`\`\`markdown
${context}
\`\`\`` : ''}

## Format du passage

Le passage a corriger est **${detectFormat(ticket.before_exact)}**.
Adapte after_final au meme format tout en respectant les regles de redaction.

${styleSample ? `## Style de l'article (exemples de phrases voisines)

\`\`\`
${styleSample}
\`\`\`

Aligne le ton et le niveau de detail de ta correction sur ce style.` : ''}

---

Redige after_final : la version definitive qui remplacera before_exact dans le markdown.`;

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
      throw new Error(`Pas de JSON valide dans la reponse Claude`);
    }

    const result = JSON.parse(jsonMatch[0]);
    const durationMs = Date.now() - startTime;
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    // Update ticket with after_final + modifications list
    const updateData = {
      after_final: result.after_final,
      model_used: MODEL,
      tokens_used: tokensUsed,
      statut: 'ready_to_deploy'
    };

    const { error: updateError } = await supabase
      .from('correction_tickets')
      .update(updateData)
      .eq('id', ticket.id);

    if (updateError) {
      throw new Error(`Erreur mise a jour ticket: ${updateError.message}`);
    }

    // Log success
    await supabase.from('agent_logs').insert({
      agent_type: 'editorial',
      article_id: ticket.article_id,
      status: 'success',
      duration_ms: durationMs,
      tokens_used: tokensUsed,
      metadata: {
        slug: ticket.slug,
        ticket_id: ticket.id,
        model: MODEL,
        confiance: result.confiance,
        explication: result.explication
      }
    });

    return {
      id: ticket.id,
      slug: ticket.slug,
      confiance: result.confiance,
      tokens_used: tokensUsed,
      duration_ms: durationMs
    };

  } catch (err) {
    const durationMs = Date.now() - startTime;

    // Revert to approved on error
    await supabase
      .from('correction_tickets')
      .update({ statut: 'approved' })
      .eq('id', ticket.id);

    // Log error
    await supabase.from('agent_logs').insert({
      agent_type: 'editorial',
      article_id: ticket.article_id,
      status: 'error',
      duration_ms: durationMs,
      error: err.message,
      metadata: { slug: ticket.slug, ticket_id: ticket.id, model: MODEL }
    });

    console.error(`  ${ticket.slug}: ${err.message}`);
    return { id: ticket.id, slug: ticket.slug, error: err.message };
  }
}

// --- Main ---

async function main() {
  console.log('Agent Editorial GLP1 (Ticket-Based)');
  console.log(`   Modele : ${MODEL}`);
  if (SINGLE_TICKET_ID) console.log(`   Ticket cible : ${SINGLE_TICKET_ID}`);
  if (LIMIT > 0) console.log(`   Limite : ${LIMIT} tickets`);
  console.log('');

  // 1. Fetch tickets
  const tickets = await fetchTickets();
  console.log(`${tickets.length} ticket(s) a traiter\n`);

  if (tickets.length === 0) {
    console.log('Aucun ticket a traiter');
    return;
  }

  // 2. Process each ticket sequentially
  const results = [];
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    console.log(`[${i + 1}/${tickets.length}] ${ticket.slug} — ${ticket.ticket_type} (${ticket.urgence})`);

    const result = await processTicket(ticket);
    results.push(result);

    if (!result.error) {
      console.log(`  OK — confiance: ${result.confiance}% — ready_to_deploy`);
    }

    // Delay between API calls
    if (i < tickets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 3. Summary
  const successful = results.filter(r => !r.error);
  const errors = results.filter(r => r.error);

  console.log('\n---');
  console.log(`Traites     : ${successful.length}`);
  console.log(`Erreurs     : ${errors.length}`);
  console.log('---');
  console.log('\nDashboard : https://glp1-france.fr/admin/editorial');

  // 4. Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const output = [
      `total=${tickets.length}`,
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
  console.error('Erreur fatale:', err);
  process.exit(1);
});
