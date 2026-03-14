#!/usr/bin/env node

/**
 * Agent Content Creator — Genere de nouveaux articles GLP-1 a partir d'opportunites SEO.
 *
 * Workflow :
 *   1. Lit les opportunites (seo_opportunities) avec statut 'approved'
 *   2. Appelle Claude Sonnet avec web search pour rediger l'article
 *   3. Sauvegarde le markdown dans src/content/[collection]/
 *   4. Met a jour l'opportunite avec statut 'content_created'
 *
 * Usage :
 *   node scripts/content-creator-agent.mjs                     # traite toutes les opportunites approuvees
 *   node scripts/content-creator-agent.mjs --limit 3           # 3 max
 *   node scripts/content-creator-agent.mjs --opportunity-id UUID  # une seule
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
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 16384;
const SYSTEM_PROMPT_PATH = path.resolve(__dirname, '../n8n/prompts/content-creator-system-prompt.md');

// --- Load .env if present (local execution) ---
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
const opportunityIdIndex = args.indexOf('--opportunity-id');
const LIMIT = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 0;
const SINGLE_ID = opportunityIdIndex !== -1 ? args[opportunityIdIndex + 1] : null;

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

// --- Retry helper for rate limits ---

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
 * Recupere les opportunites approuvees a traiter.
 */
async function fetchOpportunities() {
  let query = supabase
    .from('seo_opportunities')
    .select('*')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true });

  if (SINGLE_ID) {
    query = supabase
      .from('seo_opportunities')
      .select('*')
      .eq('id', SINGLE_ID);
  }

  if (LIMIT > 0) {
    query = query.limit(LIMIT);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Erreur recuperation opportunites:', error.message);
    process.exit(1);
  }
  return data || [];
}

/**
 * Liste les articles existants pour le contexte de liens internes.
 */
function listExistingArticles() {
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
      const slug = file.replace('.md', '');
      articles.push({ collection, slug, url: `/collections/${collection}/${slug}` });
    }
  }

  return articles;
}

/**
 * Traite une opportunite : genere l'article via Claude.
 */
async function processOpportunity(opportunity) {
  const startTime = Date.now();

  // Mark as in_progress
  await supabase
    .from('seo_opportunities')
    .update({ status: 'in_progress' })
    .eq('id', opportunity.id);

  // Log start
  await supabase.from('agent_logs').insert({
    agent_type: 'content-creator',
    status: 'started',
    metadata: {
      opportunity_id: opportunity.id,
      keyword: opportunity.keyword_main,
      model: MODEL
    }
  });

  try {
    const existingArticles = listExistingArticles();
    const today = new Date().toISOString().split('T')[0];

    const userMessage = `# Opportunite de contenu

**Mot-cle principal** : ${opportunity.keyword_main}
**Mots-cles secondaires** : ${(opportunity.keywords_secondary || []).join(', ')}
**Collection cible** : ${opportunity.collection}
**Slug suggere** : ${opportunity.suggested_slug}
**Titre suggere** : ${opportunity.suggested_title}
**Brief** : ${opportunity.content_brief || 'Rediger un article complet et informatif sur ce sujet.'}
**Date du jour** : ${today}

## Contexte : articles existants sur le site

Voici les articles existants pour creer des liens internes pertinents :

${existingArticles.map(a => `- ${a.collection}/${a.slug} → ${a.url}`).join('\n')}

## Instructions speciales

${opportunity.human_note || 'Aucune instruction specifique. Redige selon les guidelines du system prompt.'}

---

Redige l'article complet en suivant le format JSON specifie dans tes instructions.`;

    const response = await callWithRetry(() =>
      anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 20 }],
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

    // Build the markdown file
    const fm = result.frontmatter;
    const frontmatter = [
      '---',
      `title: "${fm.title}"`,
      fm.slug ? `slug: "${fm.slug}"` : `slug: "${opportunity.suggested_slug}"`,
      `description: "${fm.description}"`,
      `author: "${fm.author || 'Dr. Martin'}"`,
      `image: "${fm.image || '/images/thumbnails/' + opportunity.suggested_slug + '.jpg'}"`,
      `collection: "${fm.collection || opportunity.collection}"`,
      `category: "${fm.category || opportunity.collection}"`,
      `tags: ${JSON.stringify(fm.tags || [])}`,
      `date: "${fm.date || today}"`,
      `pubDate: "${fm.pubDate || today}"`,
      '---'
    ].join('\n');

    const markdownContent = `${frontmatter}\n\n${result.markdown_body}`;

    // Write the file
    const collection = fm.collection || opportunity.collection;
    const slug = fm.slug || opportunity.suggested_slug;
    const outputDir = path.join(PROJECT_ROOT, 'src/content', collection);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${slug}.md`);
    fs.writeFileSync(outputPath, markdownContent, 'utf8');

    console.log(`  Fichier cree : src/content/${collection}/${slug}.md`);
    console.log(`  Mots : ~${result.word_count || 'N/A'} | Confiance : ${result.confidence || 'N/A'}%`);

    // Update opportunity
    await supabase
      .from('seo_opportunities')
      .update({
        status: 'content_created',
        article_slug: `${collection}/${slug}`,
        metadata: {
          ...opportunity.metadata,
          sources_used: result.sources_used,
          internal_links: result.internal_links,
          word_count: result.word_count,
          confidence: result.confidence,
          tokens_used: tokensUsed,
          created_at_run: new Date().toISOString()
        }
      })
      .eq('id', opportunity.id);

    // Log success
    await supabase.from('agent_logs').insert({
      agent_type: 'content-creator',
      status: 'success',
      duration_ms: durationMs,
      tokens_used: tokensUsed,
      metadata: {
        opportunity_id: opportunity.id,
        keyword: opportunity.keyword_main,
        slug: `${collection}/${slug}`,
        word_count: result.word_count,
        confidence: result.confidence,
        model: MODEL
      }
    });

    return {
      id: opportunity.id,
      keyword: opportunity.keyword_main,
      slug: `${collection}/${slug}`,
      word_count: result.word_count,
      confidence: result.confidence,
      tokens_used: tokensUsed,
      duration_ms: durationMs
    };

  } catch (err) {
    const durationMs = Date.now() - startTime;

    // Revert to approved on error
    await supabase
      .from('seo_opportunities')
      .update({ status: 'approved' })
      .eq('id', opportunity.id);

    // Log error
    await supabase.from('agent_logs').insert({
      agent_type: 'content-creator',
      status: 'error',
      duration_ms: durationMs,
      error: err.message,
      metadata: {
        opportunity_id: opportunity.id,
        keyword: opportunity.keyword_main,
        model: MODEL
      }
    });

    console.error(`  ${opportunity.keyword_main}: ${err.message}`);
    return { id: opportunity.id, keyword: opportunity.keyword_main, error: err.message };
  }
}

// --- Main ---

async function main() {
  console.log('Agent Content Creator GLP1');
  console.log(`   Modele : ${MODEL}`);
  console.log(`   Web search : active (20 max/article)`);
  if (SINGLE_ID) console.log(`   Opportunite cible : ${SINGLE_ID}`);
  if (LIMIT > 0) console.log(`   Limite : ${LIMIT}`);
  console.log('');

  // 1. Fetch opportunities
  const opportunities = await fetchOpportunities();
  console.log(`${opportunities.length} opportunite(s) a traiter\n`);

  if (opportunities.length === 0) {
    console.log('Aucune opportunite approuvee a traiter');
    return;
  }

  // 2. Process each sequentially
  const results = [];
  for (let i = 0; i < opportunities.length; i++) {
    const opp = opportunities[i];
    console.log(`[${i + 1}/${opportunities.length}] "${opp.keyword_main}" → ${opp.collection}/${opp.suggested_slug}`);

    const result = await processOpportunity(opp);
    results.push(result);

    if (!result.error) {
      console.log(`  OK — ${result.word_count} mots — confiance ${result.confidence}%`);
    }

    // Delay between API calls
    if (i < opportunities.length - 1) {
      console.log('  Pause 15s...');
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }

  // 3. Summary
  const successful = results.filter(r => !r.error);
  const errors = results.filter(r => r.error);

  console.log('\n---');
  console.log(`Articles crees : ${successful.length}`);
  console.log(`Erreurs         : ${errors.length}`);
  if (successful.length > 0) {
    console.log(`Mots total      : ~${successful.reduce((s, r) => s + (r.word_count || 0), 0)}`);
  }
  console.log('---');
  console.log('\nDashboard : https://glp1-france.fr/admin/content-creator');

  // 4. Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const output = [
      `total=${opportunities.length}`,
      `created=${successful.length}`,
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
