#!/usr/bin/env node

/**
 * Agent Fact-Check — Vérifie les articles GLP1 via Claude API avec web search.
 *
 * Usage :
 *   node scripts/fact-check-runner.mjs                    # tous les articles
 *   node scripts/fact-check-runner.mjs --limit 5          # 5 articles max
 *   node scripts/fact-check-runner.mjs --article-id UUID  # un seul article
 *
 * Secrets requis (variables d'environnement) :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
 *
 * Optionnel :
 *   ALERT_EMAIL_TO, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
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
const SYSTEM_PROMPT_PATH = path.resolve(__dirname, '../n8n/prompts/fact-check-system-prompt.md');

// Parse CLI arguments
const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const articleIdIndex = args.indexOf('--article-id');
const LIMIT = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 0;
const SINGLE_ARTICLE_ID = articleIdIndex !== -1 ? args[articleIdIndex + 1] : null;

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

async function fetchArticles() {
  let query = supabase
    .from('articles')
    .select('id, slug, title, content, collection')
    .eq('is_active', true)
    .order('last_fact_checked', { ascending: true, nullsFirst: true });

  if (SINGLE_ARTICLE_ID) {
    query = query.eq('id', SINGLE_ARTICLE_ID);
  }

  if (LIMIT > 0) {
    query = query.limit(LIMIT);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erreur récupération articles:', error.message);
    process.exit(1);
  }
  return data || [];
}

async function factCheckArticle(article) {
  const startTime = Date.now();

  // Log start
  await supabase.from('agent_logs').insert({
    agent_type: 'fact-check',
    article_id: article.id,
    status: 'started',
    metadata: { slug: article.slug, model: MODEL }
  });

  try {
    const userMessage = `# Article à vérifier

**Titre** : ${article.title}
**Collection** : ${article.collection}
**Slug** : ${article.slug}

---

${article.content}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 10 }],
      messages: [{ role: 'user', content: userMessage }]
    });

    // Extract text from response (may contain tool_use blocks for web search)
    const textBlocks = response.content.filter(b => b.type === 'text');
    const rawText = textBlocks.map(b => b.text).join('\n');

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Pas de JSON valide dans la réponse Claude pour ${article.slug}`);
    }

    const result = JSON.parse(jsonMatch[0]);
    const durationMs = Date.now() - startTime;
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    // Write result to fact_check_results
    const { error: insertError } = await supabase
      .from('fact_check_results')
      .insert({
        article_id: article.id,
        score_fiabilite: result.score_fiabilite,
        statut: result.statut,
        points: result.points || [],
        sources: (result.points || []).map(p => p.source).filter(Boolean),
        model_used: MODEL,
        tokens_used: tokensUsed
      });

    if (insertError) {
      throw new Error(`Erreur écriture Supabase: ${insertError.message}`);
    }

    // Update last_fact_checked on article
    await supabase
      .from('articles')
      .update({ last_fact_checked: new Date().toISOString() })
      .eq('id', article.id);

    // Log success
    await supabase.from('agent_logs').insert({
      agent_type: 'fact-check',
      article_id: article.id,
      status: 'success',
      duration_ms: durationMs,
      tokens_used: tokensUsed,
      metadata: {
        slug: article.slug,
        model: MODEL,
        score: result.score_fiabilite,
        statut: result.statut,
        points_count: (result.points || []).length
      }
    });

    return { slug: article.slug, ...result, tokens_used: tokensUsed, duration_ms: durationMs };
  } catch (err) {
    const durationMs = Date.now() - startTime;

    // Log error
    await supabase.from('agent_logs').insert({
      agent_type: 'fact-check',
      article_id: article.id,
      status: 'error',
      duration_ms: durationMs,
      error: err.message,
      metadata: { slug: article.slug, model: MODEL }
    });

    console.error(`  ❌ ${article.slug}: ${err.message}`);
    return { slug: article.slug, error: err.message };
  }
}

function buildAlertSummary(results) {
  const urgent = results.filter(r => r.statut === 'Urgent');
  if (urgent.length === 0) return null;

  let body = `⚠️ ALERTE FACT-CHECK GLP1\n\n`;
  body += `${urgent.length} article(s) nécessitent une correction urgente :\n\n`;

  for (const r of urgent) {
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    body += `📄 ${r.slug}\n`;
    body += `   Score : ${r.score_fiabilite}/100\n`;
    for (const p of (r.points || [])) {
      if (p.urgence === 'urgent') {
        body += `   🔴 ${p.claim_original}\n`;
        body += `      → ${p.realite_actuelle}\n`;
      }
    }
    body += '\n';
  }

  body += `\n🔗 Dashboard : https://glp1-france.fr/admin/fact-check\n`;
  return { subject: `[GLP1] ⚠️ ${urgent.length} article(s) urgents — Fact-Check`, body };
}

async function sendAlertEmail(alert) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ALERT_EMAIL_TO } = process.env;

  if (!SMTP_HOST || !ALERT_EMAIL_TO) {
    console.log('📧 Alerte email non envoyée (SMTP non configuré)');
    console.log('   Résumé alerte :', alert.subject);
    return;
  }

  // Dynamic import to avoid requiring nodemailer when not needed
  // nodemailer is only needed for email alerts
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: (SMTP_PORT || '587') === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    await transporter.sendMail({
      from: SMTP_USER,
      to: ALERT_EMAIL_TO,
      subject: alert.subject,
      text: alert.body
    });

    console.log(`📧 Alerte envoyée à ${ALERT_EMAIL_TO}`);
  } catch (err) {
    console.error(`📧 Erreur envoi email: ${err.message}`);
    // Don't fail the whole run for email errors
  }
}

// --- Main ---

async function main() {
  console.log('🔍 Agent Fact-Check GLP1');
  console.log(`   Modèle : ${MODEL}`);
  console.log(`   Web search : activé`);
  if (SINGLE_ARTICLE_ID) console.log(`   Article ciblé : ${SINGLE_ARTICLE_ID}`);
  if (LIMIT > 0) console.log(`   Limite : ${LIMIT} articles`);
  console.log('');

  // 1. Fetch articles
  const articles = await fetchArticles();
  console.log(`📂 ${articles.length} article(s) à vérifier\n`);

  if (articles.length === 0) {
    console.log('✅ Aucun article à traiter');
    return;
  }

  // 2. Fact-check each article sequentially (rate limits)
  const results = [];
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i + 1}/${articles.length}] ${article.slug}...`);

    const result = await factCheckArticle(article);
    results.push(result);

    if (!result.error) {
      const icon = result.statut === 'Urgent' ? '🔴' : result.statut === 'À vérifier' ? '🟡' : '🟢';
      console.log(`  ${icon} Score: ${result.score_fiabilite}/100 — ${result.statut} (${result.points?.length || 0} points)`);
    }

    // Small delay between API calls to respect rate limits
    if (i < articles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 3. Summary
  const successful = results.filter(r => !r.error);
  const errors = results.filter(r => r.error);
  const urgentCount = results.filter(r => r.statut === 'Urgent').length;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Vérifiés  : ${successful.length}`);
  console.log(`❌ Erreurs   : ${errors.length}`);
  console.log(`🔴 Urgents   : ${urgentCount}`);
  console.log(`🟡 À vérifier: ${results.filter(r => r.statut === 'À vérifier').length}`);
  console.log(`🟢 OK        : ${results.filter(r => r.statut === 'OK').length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 4. Send alert if urgent articles found
  const alert = buildAlertSummary(results);
  if (alert) {
    await sendAlertEmail(alert);
  }

  // 5. Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const output = [
      `total=${articles.length}`,
      `checked=${successful.length}`,
      `errors=${errors.length}`,
      `urgent=${urgentCount}`
    ].join('\n');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, output + '\n');
  }

  // Exit with error code if there were processing errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
