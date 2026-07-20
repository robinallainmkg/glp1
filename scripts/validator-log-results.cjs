require('dotenv/config');
#!/usr/bin/env node
const https = require('https');

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RUN_ID = 'a63a008d-c3a6-4a8b-becb-0c8050159cb1';

function request(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(SUPABASE_URL + endpoint);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(options, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: resp }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function insertOne(endpoint, body) {
  const r = await request('POST', endpoint, body);
  if (r.status >= 400) {
    console.warn('WARN insert failed (' + r.status + '):', r.body.slice(0, 200));
  }
  return r;
}

async function main() {
  // Insert validation_results one by one to avoid key mismatch
  const results = [
    { agent_run_id: RUN_ID, article_slug: '_global', check_type: 'html_output', severity: 'pass', message: '5 pages HTML vérifiées — title, description, canonical, lang=fr, og OK' },
    { agent_run_id: RUN_ID, article_slug: '_global', check_type: 'sitemap', severity: 'pass', message: 'Sitemap généré — 217 URLs indexées' },
    { agent_run_id: RUN_ID, article_slug: '_global', check_type: 'encoding', severity: 'pass', message: 'Aucun caractère corrompu UTF-8' },
    { agent_run_id: RUN_ID, article_slug: '_global', check_type: 'image', severity: 'pass', message: 'Aucune image manquante, aucun alt text manquant' },
    { agent_run_id: RUN_ID, article_slug: '_global', check_type: 'seo_meta', severity: 'warning', message: '95 warnings SEO — mainKeyword absent du title/description pour 50+ articles' },
    { agent_run_id: RUN_ID, article_slug: '_global', check_type: 'sync', severity: 'warning', message: '64 fichiers disque non indexés en base Supabase' },
    { agent_run_id: RUN_ID, article_slug: 'glp1-allaitement-ozempic-wegovy-post-partum-contre-indication', check_type: 'internal_link', severity: 'error', message: 'Lien cassé: /effets-secondaires-glp1/glp1-grossesse-fertilite-bebes-ozempic/ (doit être /collections/effets-secondaires-glp1/...)' },
    { agent_run_id: RUN_ID, article_slug: '_category_', check_type: 'content_quality', severity: 'warning', message: 'Contenu trop court: 5 mots (minimum 300)' },
  ];

  for (const r of results) {
    const res = await insertOne('/rest/v1/validation_results', r);
    console.log('validation_result [' + r.check_type + '/' + r.severity + ']: HTTP ' + res.status);
  }

  // Find article_id for the broken link article
  const articlesRes = await request('GET', '/rest/v1/articles?select=id,slug&slug=like.*glp1-allaitement*&limit=5', null);
  console.log('articles lookup:', articlesRes.status, articlesRes.body.slice(0, 300));

  let articleId = null;
  if (articlesRes.status === 200) {
    const articles = JSON.parse(articlesRes.body);
    if (articles.length > 0) articleId = articles[0].id;
  }

  // Create ticket for broken link
  const ticket = {
    slug: 'glp1-allaitement-ozempic-wegovy-post-partum-contre-indication',
    title: 'Lien interne cassé: chemin /effets-secondaires-glp1/ au lieu de /collections/...',
    source_agent: 'validator',
    ticket_type: 'broken_link',
    urgence: 'urgent',
    before_exact: '/effets-secondaires-glp1/glp1-grossesse-fertilite-bebes-ozempic/',
    after_suggested: '/collections/effets-secondaires-glp1/glp1-grossesse-fertilite-bebes-ozempic/',
    claim_original: 'Lien interne cassé dans article glp1-allaitement',
    realite_actuelle: 'Le lien pointe vers /effets-secondaires-glp1/ au lieu de /collections/effets-secondaires-glp1/',
    statut: 'approved'
  };
  if (articleId) ticket.article_id = articleId;

  const ticketRes = await insertOne('/rest/v1/correction_tickets', ticket);
  console.log('correction_ticket [broken_link]: HTTP ' + ticketRes.status);
}

main().catch(e => { console.error(e); process.exit(1); });
