#!/usr/bin/env node

/**
 * Agent SEO Opportunity Finder — Detecte les opportunites de contenu GLP-1.
 *
 * Workflow :
 *   1. Lit les articles existants du site (src/content/)
 *   2. Appelle Claude Sonnet avec web search pour analyser le marche
 *   3. Insere les opportunites dans seo_opportunities (Supabase)
 *
 * Usage :
 *   node scripts/seo-opportunity-agent.mjs               # analyse complete
 *   node scripts/seo-opportunity-agent.mjs --focus "new"  # focus sur nouveaux sujets
 *   node scripts/seo-opportunity-agent.mjs --focus "enrich" # focus sur enrichissement
 *
 * Secrets requis :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import matter from 'gray-matter';

// --- Configuration ---

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8192;
const SYSTEM_PROMPT_PATH = path.resolve(__dirname, '../n8n/prompts/seo-opportunity-system-prompt.md');

// --- Load .env if present ---
const dotenvPath = path.join(PROJECT_ROOT, '.env');
if (fs.existsSync(dotenvPath)) {
  fs.readFileSync(dotenvPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
}

// Parse CLI arguments
const args = process.argv.slice(2);
const focusIndex = args.indexOf('--focus');
const FOCUS = focusIndex !== -1 ? args[focusIndex + 1] : 'all';

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

// --- Retry helper ---

async function callWithRetry(fn, { maxRetries = 4, baseDelay = 60000 } = {}) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err?.status === 429 ||
        err?.error?.error?.type === 'rate_limit_error' ||
        (err.message && err.message.includes('rate_limit'));

      if (!isRateLimit || attempt === maxRetries) {
        throw err;
      }

      const retryAfter = err?.headers?.['retry-after'];
      const delay = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : baseDelay * Math.pow(2, attempt);

      console.log(`  Rate limit, retry dans ${Math.round(delay / 1000)}s (essai ${attempt + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// --- Functions ---

/**
 * Scanne les articles existants et extrait les metadonnees.
 */
function scanExistingContent() {
  const contentDir = path.join(PROJECT_ROOT, 'src/content');
  const articles = [];

  if (!fs.existsSync(contentDir)) return articles;

  const collections = fs.readdirSync(contentDir).filter(d =>
    fs.statSync(path.join(contentDir, d)).isDirectory()
  );

  for (const collection of collections) {
    const dir = path.join(contentDir, collection);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const { data: fm } = matter(content);
        const wordCount = content.split(/\s+/).length;

        articles.push({
          collection,
          slug: file.replace('.md', ''),
          title: fm.title || file,
          tags: fm.tags || [],
          description: fm.description || '',
          word_count: wordCount,
          date: fm.date || fm.pubDate || 'unknown'
        });
      } catch {
        // Skip malformed files
      }
    }
  }

  return articles;
}

/**
 * Lance l'analyse SEO via Claude.
 */
async function analyzeOpportunities(existingArticles) {
  const startTime = Date.now();

  // Log start
  await supabase.from('agent_logs').insert({
    agent_type: 'seo-opportunity',
    status: 'started',
    metadata: { model: MODEL, focus: FOCUS, articles_count: existingArticles.length }
  });

  try {
    // Build content inventory summary
    const collectionSummary = {};
    for (const article of existingArticles) {
      if (!collectionSummary[article.collection]) {
        collectionSummary[article.collection] = [];
      }
      collectionSummary[article.collection].push({
        slug: article.slug,
        title: article.title,
        tags: article.tags,
        word_count: article.word_count
      });
    }

    const focusInstruction = {
      all: 'Analyse complete : nouveaux sujets + enrichissements + mises a jour',
      new: 'Focus uniquement sur les NOUVEAUX articles a creer (sujets absents du site)',
      enrich: 'Focus sur les articles existants a ENRICHIR ou METTRE A JOUR'
    }[FOCUS] || 'Analyse complete';

    const userMessage = `# Inventaire du site glp1-france.fr

**Date** : ${new Date().toISOString().split('T')[0]}
**Nombre d'articles** : ${existingArticles.length}
**Focus demande** : ${focusInstruction}

## Articles existants par collection

${Object.entries(collectionSummary).map(([col, arts]) =>
  `### ${col} (${arts.length} articles)\n${arts.map(a =>
    `- **${a.title}** (${a.slug}) — ${a.word_count} mots — tags: ${a.tags.join(', ')}`
  ).join('\n')}`
).join('\n\n')}

---

Analyse le marche GLP-1 en France via web search et identifie les opportunites de contenu.
Propose entre 5 et 15 opportunites classees par priorite.`;

    const response = await callWithRetry(() =>
      anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 25 }],
        messages: [{ role: 'user', content: userMessage }]
      })
    );

    // Extract text
    const textBlocks = response.content.filter(b => b.type === 'text');
    const rawText = textBlocks.map(b => b.text).join('\n');

    // Parse JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Pas de JSON valide dans la reponse Claude');
    }

    const result = JSON.parse(jsonMatch[0]);
    const durationMs = Date.now() - startTime;
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    return { result, durationMs, tokensUsed };

  } catch (err) {
    const durationMs = Date.now() - startTime;

    await supabase.from('agent_logs').insert({
      agent_type: 'seo-opportunity',
      status: 'error',
      duration_ms: durationMs,
      error: err.message,
      metadata: { model: MODEL, focus: FOCUS }
    });

    throw err;
  }
}

/**
 * Insere les opportunites dans Supabase.
 */
async function saveOpportunities(result, tokensUsed, durationMs) {
  const opportunities = result.opportunities || [];
  let inserted = 0;

  for (const opp of opportunities) {
    // Check if a similar opportunity already exists (same keyword)
    const { data: existing } = await supabase
      .from('seo_opportunities')
      .select('id')
      .eq('keyword_main', opp.keyword_main)
      .in('status', ['pending_review', 'approved', 'in_progress', 'content_created'])
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  Skip: "${opp.keyword_main}" — opportunite deja existante`);
      continue;
    }

    const { error } = await supabase
      .from('seo_opportunities')
      .insert({
        priority: opp.priority || 99,
        type: opp.type || 'new_article',
        potential: opp.potential || 'medium',
        keyword_main: opp.keyword_main,
        keywords_secondary: opp.keywords_secondary || [],
        suggested_title: opp.suggested_title,
        suggested_slug: opp.suggested_slug,
        collection: opp.collection,
        content_brief: opp.content_brief || '',
        rationale: opp.rationale || '',
        competitor_coverage: opp.competitor_coverage || '',
        estimated_searches: opp.estimated_monthly_searches || '',
        status: 'pending_review',
        metadata: {
          analysis_date: result.analysis_date,
          existing_coverage_score: result.existing_coverage_score
        }
      });

    if (error) {
      console.error(`  Erreur insertion "${opp.keyword_main}": ${error.message}`);
    } else {
      inserted++;
      const icon = opp.potential === 'high' ? '[HIGH]' : opp.potential === 'medium' ? '[MED]' : '[LOW]';
      console.log(`  ${icon} ${opp.type} — "${opp.keyword_main}" → ${opp.collection}/${opp.suggested_slug}`);
    }
  }

  // Save trends
  const trends = result.trends_detected || [];
  for (const trend of trends) {
    console.log(`  TREND: ${trend.trend} (${trend.urgency})`);
  }

  // Save enrichment suggestions
  const enrichments = result.enrichment_suggestions || [];
  for (const enr of enrichments) {
    const { data: existing } = await supabase
      .from('seo_opportunities')
      .select('id')
      .eq('type', 'enrich_existing')
      .eq('suggested_slug', enr.existing_slug)
      .in('status', ['pending_review', 'approved'])
      .limit(1);

    if (existing && existing.length > 0) continue;

    await supabase
      .from('seo_opportunities')
      .insert({
        priority: enr.priority === 'high' ? 1 : enr.priority === 'medium' ? 5 : 10,
        type: 'enrich_existing',
        potential: enr.priority || 'medium',
        keyword_main: enr.existing_slug,
        keywords_secondary: [],
        suggested_title: `Enrichir: ${enr.existing_slug}`,
        suggested_slug: enr.existing_slug,
        collection: enr.existing_slug.split('/')[0] || '',
        content_brief: `Sujets manquants: ${(enr.missing_topics || []).join(', ')}`,
        rationale: 'Enrichissement detecte par l\'agent SEO',
        status: 'pending_review'
      });

    console.log(`  ENRICH: ${enr.existing_slug} — ${(enr.missing_topics || []).join(', ')}`);
  }

  // Log success
  await supabase.from('agent_logs').insert({
    agent_type: 'seo-opportunity',
    status: 'success',
    duration_ms: durationMs,
    tokens_used: tokensUsed,
    metadata: {
      model: MODEL,
      focus: FOCUS,
      opportunities_found: opportunities.length,
      opportunities_inserted: inserted,
      trends_count: trends.length,
      enrichments_count: enrichments.length,
      coverage_score: result.existing_coverage_score
    }
  });

  return { inserted, total: opportunities.length, trends: trends.length, enrichments: enrichments.length };
}

// --- Main ---

async function main() {
  console.log('Agent SEO Opportunity Finder GLP1');
  console.log(`   Modele : ${MODEL}`);
  console.log(`   Web search : active (25 max)`);
  console.log(`   Focus : ${FOCUS}`);
  console.log('');

  // 1. Scan existing content
  const existingArticles = scanExistingContent();
  console.log(`${existingArticles.length} articles existants analyses\n`);

  // 2. Analyze opportunities
  console.log('Analyse du marche en cours (web search)...\n');
  const { result, durationMs, tokensUsed } = await analyzeOpportunities(existingArticles);

  console.log(`Score couverture actuelle : ${result.existing_coverage_score || 'N/A'}/100\n`);

  // 3. Save to Supabase
  console.log('Opportunites detectees :\n');
  const stats = await saveOpportunities(result, tokensUsed, durationMs);

  // 4. Summary
  console.log('\n---');
  console.log(`Opportunites trouvees  : ${stats.total}`);
  console.log(`Nouvelles inserees     : ${stats.inserted}`);
  console.log(`Tendances detectees    : ${stats.trends}`);
  console.log(`Enrichissements        : ${stats.enrichments}`);
  console.log(`Tokens utilises        : ${tokensUsed}`);
  console.log(`Duree                  : ${Math.round(durationMs / 1000)}s`);
  console.log('---');
  console.log('\nDashboard : https://glp1-france.fr/admin/seo');

  // 5. Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const output = [
      `opportunities=${stats.total}`,
      `inserted=${stats.inserted}`,
      `trends=${stats.trends}`,
      `enrichments=${stats.enrichments}`
    ].join('\n');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, output + '\n');
  }
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
