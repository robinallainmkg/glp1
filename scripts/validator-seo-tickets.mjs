import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Issues SEO les plus importantes (mainKeyword absent du title = impact direct SEO)
const seoIssues = [
  { slug: 'effets-secondaires-ozempic', collection: 'effets-secondaires-glp1', keyword: 'effets secondaires ozempic semaglutide', msg: 'mainKeyword absent du title' },
  { slug: 'glp1-chute-de-cheveux-alopecie-causes-solutions', collection: 'effets-secondaires-glp1', keyword: 'GLP-1 chute de cheveux Ozempic perte cheveux', msg: 'mainKeyword absent du title' },
  { slug: 'glp1-gastroparesie-vidange-gastrique-risque-symptomes', collection: 'effets-secondaires-glp1', keyword: 'GLP-1 gastroparesie vidange gastrique', msg: 'mainKeyword absent du title' },
  { slug: 'glp1-grossesse-fertilite-bebes-ozempic', collection: 'effets-secondaires-glp1', keyword: 'GLP-1 grossesse fertilite bebes Ozempic', msg: 'mainKeyword absent du title' },
  { slug: 'anneau-gastrique-prix-cmu', collection: 'glp1-cout', keyword: 'anneau gastrique prix remboursement CMU', msg: 'mainKeyword absent du title' },
  { slug: 'ozempic-generique-france-semaglutide-biosimilaire-date', collection: 'glp1-cout', keyword: 'ozempic generique France semaglutide biosimilaire', msg: 'mainKeyword absent du title' },
  { slug: 'quand-wegovy-rembourse-france-2026-conditions-calendrier', collection: 'glp1-cout', keyword: 'quand wegovy rembourse France 2026', msg: 'mainKeyword absent du title' },
  { slug: 'remboursement-ozempic-diabete-justificatif-prescription-guide-2026', collection: 'glp1-cout', keyword: 'remboursement Ozempic diabete justificatif prescription 2026', msg: 'mainKeyword absent du title' },
  { slug: 'glp1-diabete-type-2-guide-patient-remboursement-france-2026', collection: 'glp1-diabete', keyword: 'GLP-1 diabete type 2 guide patient remboursement France', msg: 'mainKeyword absent du title' },
  { slug: 'arret-glp1-reprise-poids-effet-yoyo-eviter', collection: 'glp1-perte-de-poids', keyword: 'arret GLP-1 reprise poids effet yoyo', msg: 'mainKeyword absent du title' },
  { slug: 'cagrisema-resultats-phase3-redefine-arrivee-france-2026', collection: 'recherche-glp1', keyword: 'CagriSema resultats essais cliniques France 2026', msg: 'mainKeyword absent du title' },
  { slug: 'glp1-addictions-alcool-tabac-opioides', collection: 'recherche-glp1', keyword: 'GLP-1 addictions alcool tabac opioides', msg: 'mainKeyword absent du title' },
  { slug: 'glp1-apnee-sommeil-saos', collection: 'recherche-glp1', keyword: 'glp1 apnee du sommeil SAOS', msg: 'mainKeyword absent du title' },
  { slug: 'glp1-arthrose-douleurs-articulaires-benefices-risques', collection: 'recherche-glp1', keyword: 'GLP-1 arthrose douleurs articulaires', msg: 'mainKeyword absent du title' },
  { slug: 'glp1-cancer-risque-protection-bilan-etudes-2026', collection: 'recherche-glp1', keyword: 'GLP-1 cancer risque protection thyroide', msg: 'mainKeyword absent du title' },
];

// Load articles for ID mapping
const slugsToFind = seoIssues.map(i => i.collection + '/' + i.slug);
const slugsToFind2 = seoIssues.map(i => i.slug);

const { data: articles, error } = await supabase
  .from('articles')
  .select('id, slug')
  .or(slugsToFind.map(s => `slug.eq.${s}`).join(',') + ',' + slugsToFind2.map(s => `slug.eq.${s}`).join(','));

if (error) {
  console.error('Error fetching articles:', error.message);
  process.exit(1);
}

const slugToId = new Map();
for (const art of articles) {
  slugToId.set(art.slug, art.id);
  const parts = art.slug.split('/');
  const last = parts[parts.length - 1];
  if (!slugToId.has(last)) slugToId.set(last, art.id);
}

console.log(`${articles.length} articles trouves, ${slugToId.size} entrees slug->id`);

// Check existing tickets to avoid duplicates
const { data: existingTickets } = await supabase
  .from('correction_tickets')
  .select('slug, ticket_type')
  .eq('source_agent', 'validator')
  .eq('ticket_type', 'seo_issue')
  .in('statut', ['approved', 'in_progress', 'ready_to_deploy']);

const existingSet = new Set((existingTickets || []).map(t => `${t.slug}:${t.ticket_type}`));
console.log(`${existingSet.size} tickets SEO deja existants`);

const ticketsToInsert = [];
for (const issue of seoIssues) {
  const key = `${issue.slug}:seo_issue`;
  if (existingSet.has(key)) {
    console.log(`Ticket deja existant: ${issue.slug}`);
    continue;
  }

  const articleId = slugToId.get(issue.collection + '/' + issue.slug) || slugToId.get(issue.slug);
  if (!articleId) {
    console.log(`Pas d'article_id pour: ${issue.slug}`);
    continue;
  }

  ticketsToInsert.push({
    article_id: articleId,
    slug: issue.slug,
    title: `[SEO] mainKeyword absent du title: ${issue.slug}`,
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: `mainKeyword "${issue.keyword}" absent du title`,
    after_suggested: `Inclure le mainKeyword "${issue.keyword}" dans le title de l'article`,
    claim_original: `SEO: mainKeyword absent du title`,
    realite_actuelle: `Le mot-cle principal "${issue.keyword}" n'apparait pas dans le title HTML, ce qui nuit au positionnement SEO. Detecte lors du validator run.`,
    statut: 'approved'
  });
}

console.log(`${ticketsToInsert.length} nouveaux tickets SEO a inserer`);

if (ticketsToInsert.length > 0) {
  for (let i = 0; i < ticketsToInsert.length; i += 20) {
    const batch = ticketsToInsert.slice(i, i + 20);
    const { error: insertErr } = await supabase.from('correction_tickets').insert(batch);
    if (insertErr) {
      console.error(`Insert error batch ${i}:`, insertErr.message);
    } else {
      console.log(`Batch insere: ${batch.length} tickets`);
    }
  }
}

console.log('Done!');
