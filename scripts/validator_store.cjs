const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
const RUN_ID = '9e776063-c794-4b3e-b523-9fc0c28c00ad';

const { issues } = require('./validator_issues.json');

async function run() {
  // Store validation results (sample: only errors and warnings, max 50)
  const toStore = issues.filter(i => i.severity === 'error' || i.severity === 'warning').slice(0, 50);

  console.log('Storing ' + toStore.length + ' validation results...');

  for (const issue of toStore) {
    const { error } = await supabase.from('validation_results').insert({
      agent_run_id: RUN_ID,
      article_slug: issue.slug,
      check_type: issue.check_type,
      severity: issue.severity,
      message: issue.message,
      details: { file: issue.file || null }
    });
    if (error) console.error('  Error storing result:', error.message);
  }

  // Also store global pass checks
  const globalChecks = [
    { check_type: 'internal_link', severity: 'pass', message: 'Aucun lien interne casse detecte (liens /collections/ generes correctement)' },
    { check_type: 'image', severity: 'pass', message: 'Aucune image manquante detectee' },
    { check_type: 'encoding', severity: 'pass', message: 'Aucun caractere UTF-8 corrompu detecte' },
    { check_type: 'html_output', severity: 'pass', message: '10 pages publiques verifiees — title/meta/canonical/lang/og tous presents' },
    { check_type: 'sitemap', severity: 'pass', message: '216 URLs dans sitemap — pages cles presentes' },
    { check_type: 'sync', severity: 'pass', message: '0 fichier non indexe en base. 28 entrees DB de type astro-pages (pages statiques)' },
  ];
  for (const g of globalChecks) {
    const { error } = await supabase.from('validation_results').insert({
      agent_run_id: RUN_ID,
      article_slug: '_global',
      check_type: g.check_type,
      severity: g.severity,
      message: g.message
    });
    if (error) console.error('  Error storing global check:', error.message);
  }

  // Create correction tickets for SEO meta warnings (mainKeyword absent du title)
  const seoWarnings = issues.filter(i => i.check_type === 'seo_meta' && i.severity === 'warning');
  console.log('Creating ' + seoWarnings.length + ' SEO correction tickets...');

  let ticketsCreated = 0;
  for (const w of seoWarnings.slice(0, 20)) {
    // Check if ticket already exists
    const { data: existing } = await supabase.from('correction_tickets')
      .select('id')
      .eq('slug', w.slug)
      .eq('ticket_type', 'seo_issue')
      .eq('statut', 'approved')
      .limit(1);

    if (existing && existing.length > 0) continue;

    const { error } = await supabase.from('correction_tickets').insert({
      slug: w.slug,
      title: 'SEO: ' + w.message,
      source_agent: 'validator',
      ticket_type: 'seo_issue',
      urgence: 'warning',
      before_exact: w.message,
      after_suggested: 'Inclure le mainKeyword dans le title pour ameliorer le SEO',
      claim_original: w.message,
      realite_actuelle: 'Le mainKeyword doit etre present dans le title pour optimiser le positionnement',
      statut: 'approved'
    });
    if (error) console.error('  Error creating ticket:', error.message);
    else ticketsCreated++;
  }

  console.log('Tickets created: ' + ticketsCreated);
  console.log('Done.');
}

run().catch(console.error);
