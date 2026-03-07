#!/usr/bin/env node

/**
 * Agent Fact-Check — Verifie les articles GLP1 via Claude API avec web search.
 * Cree des tickets individuels dans correction_tickets pour chaque probleme detecte.
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
const MAX_TOKENS = 8192;
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
    console.error('Erreur recuperation articles:', error.message);
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
    const userMessage = `# Article a verifier

**Titre** : ${article.title}
**Collection** : ${article.collection}
**Slug** : ${article.slug}

---

${article.content}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 15 }],
      messages: [{ role: 'user', content: userMessage }]
    });

    // Extract text from response (may contain tool_use blocks for web search)
    const textBlocks = response.content.filter(b => b.type === 'text');
    const rawText = textBlocks.map(b => b.text).join('\n');

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Pas de JSON valide dans la reponse Claude pour ${article.slug}`);
    }

    const result = JSON.parse(jsonMatch[0]);
    const durationMs = Date.now() - startTime;
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    // Write result to fact_check_results
    const { data: factCheckRow, error: insertError } = await supabase
      .from('fact_check_results')
      .insert({
        article_id: article.id,
        score_fiabilite: result.score_fiabilite,
        statut: result.statut,
        points: result.tickets || [],
        sources: (result.tickets || []).map(t => t.source).filter(Boolean),
        model_used: MODEL,
        tokens_used: tokensUsed
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Erreur ecriture fact_check_results: ${insertError.message}`);
    }

    const factCheckResultId = factCheckRow.id;

    // Create individual tickets in correction_tickets
    const tickets = result.tickets || [];
    let ticketsCreated = 0;

    for (const ticket of tickets) {
      const { error: ticketError } = await supabase
        .from('correction_tickets')
        .insert({
          article_id: article.id,
          slug: article.slug,
          title: article.title,
          fact_check_result_id: factCheckResultId,
          ticket_type: ticket.ticket_type || 'info_outdated',
          urgence: ticket.urgence || 'warning',
          before_exact: ticket.before_exact,
          after_suggested: ticket.after_suggested,
          claim_original: ticket.claim_original,
          realite_actuelle: ticket.realite_actuelle,
          source_reference: ticket.source || null,
          statut: 'pending_review'
        });

      if (ticketError) {
        console.error(`  Erreur creation ticket: ${ticketError.message}`);
      } else {
        ticketsCreated++;
      }
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
        tickets_count: tickets.length,
        tickets_created: ticketsCreated
      }
    });

    return {
      slug: article.slug,
      score_fiabilite: result.score_fiabilite,
      statut: result.statut,
      tickets_count: tickets.length,
      tickets_created: ticketsCreated,
      tokens_used: tokensUsed,
      duration_ms: durationMs
    };
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

    console.error(`  ${article.slug}: ${err.message}`);
    return { slug: article.slug, error: err.message };
  }
}

function buildAlertSummary(results) {
  const urgent = results.filter(r => r.statut === 'Urgent');
  if (urgent.length === 0) return null;

  let body = `ALERTE FACT-CHECK GLP1\n\n`;
  body += `${urgent.length} article(s) necessitent une correction urgente :\n\n`;

  for (const r of urgent) {
    body += `---\n`;
    body += `${r.slug} — Score: ${r.score_fiabilite}/100 — ${r.tickets_count} ticket(s)\n`;
  }

  body += `\nDashboard : https://glp1-france.fr/admin/fact-check\n`;
  return { subject: `[GLP1] ${urgent.length} article(s) urgents — Fact-Check`, body };
}

async function sendAlertEmail(alert) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ALERT_EMAIL_TO } = process.env;

  if (!SMTP_HOST || !ALERT_EMAIL_TO) {
    console.log('Alerte email non envoyee (SMTP non configure)');
    console.log('   Resume alerte :', alert.subject);
    return;
  }

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

    console.log(`Alerte envoyee a ${ALERT_EMAIL_TO}`);
  } catch (err) {
    console.error(`Erreur envoi email: ${err.message}`);
  }
}

// --- Main ---

async function main() {
  console.log('Agent Fact-Check GLP1 (Marche FR)');
  console.log(`   Modele : ${MODEL}`);
  console.log(`   Web search : active (15 max/article)`);
  if (SINGLE_ARTICLE_ID) console.log(`   Article cible : ${SINGLE_ARTICLE_ID}`);
  if (LIMIT > 0) console.log(`   Limite : ${LIMIT} articles`);
  console.log('');

  // 1. Fetch articles
  const articles = await fetchArticles();
  console.log(`${articles.length} article(s) a verifier\n`);

  if (articles.length === 0) {
    console.log('Aucun article a traiter');
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
      const icon = result.statut === 'Urgent' ? '[URGENT]' : result.statut === 'A verifier' ? '[WARN]' : '[OK]';
      console.log(`  ${icon} Score: ${result.score_fiabilite}/100 — ${result.statut} — ${result.tickets_created} ticket(s) crees`);
    }

    // Small delay between API calls to respect rate limits
    if (i < articles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 3. Summary
  const successful = results.filter(r => !r.error);
  const errors = results.filter(r => r.error);
  const totalTickets = successful.reduce((sum, r) => sum + (r.tickets_created || 0), 0);

  console.log('\n---');
  console.log(`Verifies    : ${successful.length}`);
  console.log(`Erreurs     : ${errors.length}`);
  console.log(`Tickets crees: ${totalTickets}`);
  console.log(`Urgents     : ${results.filter(r => r.statut === 'Urgent').length}`);
  console.log(`A verifier  : ${results.filter(r => r.statut === 'A verifier').length}`);
  console.log(`OK          : ${results.filter(r => r.statut === 'OK').length}`);
  console.log('---');

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
      `urgent=${results.filter(r => r.statut === 'Urgent').length}`,
      `tickets=${totalTickets}`
    ].join('\n');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, output + '\n');
  }

  // Exit with error code if there were processing errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
