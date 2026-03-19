const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
const RUN_ID = '9e776063-c794-4b3e-b523-9fc0c28c00ad';

const { issues } = require('./validator_issues.json');

async function run() {
  // Fetch article IDs from Supabase
  const { data: articles, error: artError } = await supabase
    .from('articles')
    .select('id, slug, collection');

  if (artError) { console.error('Error fetching articles:', artError.message); return; }

  // Build slug -> id map (try multiple slug formats)
  const slugMap = {};
  for (const a of articles) {
    slugMap[a.slug] = a.id;
    // Also map simple slug (last part)
    const parts = a.slug.split('/');
    const simpleSlug = parts[parts.length - 1];
    if (!slugMap[simpleSlug]) slugMap[simpleSlug] = a.id;
    // Map collection/slug
    if (a.collection) {
      slugMap[a.collection + '/' + simpleSlug] = a.id;
    }
  }

  const seoWarnings = issues.filter(i => i.check_type === 'seo_meta' && i.severity === 'warning');
  console.log('Processing ' + seoWarnings.length + ' SEO warnings...');

  let ticketsCreated = 0;
  let ticketsSkipped = 0;

  for (const w of seoWarnings) {
    const articleId = slugMap[w.slug] || slugMap[w.file ? w.file.split('/').pop().replace('.md', '') : w.slug];

    if (!articleId) {
      console.log('  No article_id for slug: ' + w.slug + ' (skipping)');
      ticketsSkipped++;
      continue;
    }

    // Check if ticket already exists
    const { data: existing } = await supabase.from('correction_tickets')
      .select('id')
      .eq('slug', w.slug)
      .eq('ticket_type', 'seo_issue')
      .in('statut', ['approved', 'in_progress'])
      .limit(1);

    if (existing && existing.length > 0) {
      ticketsSkipped++;
      continue;
    }

    const { error } = await supabase.from('correction_tickets').insert({
      article_id: articleId,
      slug: w.slug,
      title: 'SEO: ' + w.message,
      source_agent: 'validator',
      ticket_type: 'seo_issue',
      urgence: 'warning',
      before_exact: w.message,
      after_suggested: 'Inclure le mainKeyword dans le title pour optimiser le SEO',
      claim_original: w.message,
      realite_actuelle: 'Le mainKeyword doit etre present dans le title pour optimiser le positionnement',
      statut: 'approved'
    });
    if (error) {
      console.error('  Error creating ticket for ' + w.slug + ':', error.message);
    } else {
      ticketsCreated++;
    }
  }

  console.log('Tickets created: ' + ticketsCreated);
  console.log('Tickets skipped (no article_id or duplicate): ' + ticketsSkipped);
  console.log('Done.');
}

run().catch(console.error);
