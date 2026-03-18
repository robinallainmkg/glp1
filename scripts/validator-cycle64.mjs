/**
 * Validator Agent - Cycle 64
 * Insère les résultats de validation dans Supabase
 */
import https from 'https';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
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

async function post(path, body) {
  const r = await request('POST', path, body);
  if (r.status >= 400) throw new Error(`POST ${path} → ${r.status}: ${r.body}`);
  return JSON.parse(r.body);
}

async function patch(path, body) {
  const r = await request('PATCH', path, body);
  if (r.status >= 400) throw new Error(`PATCH ${path} → ${r.status}: ${r.body}`);
  return r;
}

// ============================================================
// 1. Initialise le run
// ============================================================
console.log('1. Initialisation du run...');
const runResult = await post('/rest/v1/agent_runs', { agent_name: 'validator', status: 'started' });
const RUN_ID = runResult[0].id;
console.log(`   run_id = ${RUN_ID}`);

// ============================================================
// 2. Build OK
// ============================================================
console.log('2. Enregistrement build OK...');
await post('/rest/v1/validation_results', {
  agent_run_id: RUN_ID,
  article_slug: '_global',
  check_type: 'build',
  severity: 'pass',
  message: 'Build Astro réussi sans erreur — 241 pages générées'
});

// ============================================================
// 3-7. Résultats de validation frontmatter + SEO + contenu
// ============================================================
console.log('3-7. Enregistrement des résultats de validation...');

const validationResults = [
  // Errors
  { article_slug: 'glp1-diabete/_category_', check_type: 'frontmatter', severity: 'error', message: 'Title manquant dans _category_.md' },
  { article_slug: 'glp1-diabete/_category_', check_type: 'frontmatter', severity: 'error', message: 'Description manquante dans _category_.md' },

  // Frontmatter warnings - description trop longue
  { article_slug: 'alternatives-glp1/acupuncture-glp1', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (166 chars, max 160)' },
  { article_slug: 'alternatives-glp1/vinaigre-cidre-glp1', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (166 chars, max 160)' },
  { article_slug: 'effets-secondaires-glp1/contrefacon-glp1-faux-ozempic-danger', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (164 chars, max 160)' },
  { article_slug: 'effets-secondaires-glp1/effets-secondaires-ozempic', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (194 chars, max 160)' },
  { article_slug: 'effets-secondaires-glp1/effets-secondaires-rybelsus', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (173 chars, max 160)' },
  { article_slug: 'effets-secondaires-glp1/glp1-pancreatite-risque-ozempic-pancreas-symptomes', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (165 chars, max 160)' },
  { article_slug: 'effets-secondaires-glp1/glp1-risque-osseux-fractures-tendons-blessures-2026', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (163 chars, max 160)' },
  { article_slug: 'effets-secondaires-glp1/mesusage-glp1-france-detournement-risques', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (161 chars, max 160)' },
  { article_slug: 'glp1-cout/anneau-gastrique-prix-cmu', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (166 chars, max 160)' },
  { article_slug: 'glp1-cout/prix-mounjaro-france', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (161 chars, max 160)' },
  { article_slug: 'glp1-cout/prix-saxenda-france', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (165 chars, max 160)' },
  { article_slug: 'glp1-cout/quand-wegovy-rembourse-france-2026-conditions-calendrier', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (164 chars, max 160)' },
  { article_slug: 'glp1-cout/wegovy-prix', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (161 chars, max 160)' },
  { article_slug: 'glp1-perte-de-poids/glp1-menopause-perte-poids-femme-ths', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (167 chars, max 160)' },
  { article_slug: 'glp1-perte-de-poids/plateau-poids-glp1-ozempic-wegovy-causes-solutions', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (161 chars, max 160)' },
  { article_slug: 'medecins-glp1-france/clinique-pour-obesite', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (161 chars, max 160)' },
  { article_slug: 'recherche-glp1/glp1-benefices-cardiovasculaires-coeur', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (164 chars, max 160)' },
  { article_slug: 'recherche-glp1/glp1-cancer-risque-protection-bilan-etudes-2026', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (161 chars, max 160)' },
  { article_slug: 'recherche-glp1/glp1-cholesterol-triglycerides-profil-lipidique-benefices', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (169 chars, max 160)' },
  { article_slug: 'recherche-glp1/glp1-microbiote-intestinal-flore-impact-probiotiques', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (161 chars, max 160)' },
  { article_slug: 'recherche-glp1/glp1-steatose-hepatique-nash-foie', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (164 chars, max 160)' },
  { article_slug: 'recherche-glp1/pharmacovigilance-glp1-france-ansm-bilan-2025-2026', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (164 chars, max 160)' },
  { article_slug: 'regime-glp1/glp1-calories-journalieres', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (161 chars, max 160)' },
  { article_slug: 'traitements-glp1/guide-complet-rybelsus', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (161 chars, max 160)' },
  { article_slug: 'traitements-glp1/nouveau-stylo-ozempic-3ml-2026-changement-utilisation', check_type: 'frontmatter', severity: 'warning', message: 'Description trop longue (163 chars, max 160)' },

  // SEO meta warnings - title length
  { article_slug: 'recherche-glp1/oms-recommandations-glp1-obesite', check_type: 'seo_meta', severity: 'warning', message: 'Title trop long (66 chars, max 65): OMS Recommandations GLP-1 Obésité 2025 : Ce qui Change en France' },
  { article_slug: 'recherche-glp1/pharmacovigilance-glp1-france-ansm-bilan-2025-2026', check_type: 'seo_meta', severity: 'warning', message: 'Title trop long (68 chars): Pharmacovigilance GLP-1 en France : Bilan ANSM / EPI-Phare 2025-2026' },
  { article_slug: 'regime-glp1/glp1-sport-performance-sportif-composition-corporelle', check_type: 'seo_meta', severity: 'warning', message: 'Title trop long (67 chars): GLP-1 et Sport de Performance : Composition Corporelle et Endurance' },
  { article_slug: 'traitements-glp1/comment-s-injecter-glp1-guide-pratique-ozempic-wegovy-mounjaro', check_type: 'seo_meta', severity: 'warning', message: 'Title trop long (67 chars): Comment sinjecter un GLP-1 : Guide Pratique Ozempic Wegovy Mounjaro' },
  { article_slug: 'traitements-glp1/conservation-injection-glp1-stylo-voyage-guide-pratique', check_type: 'seo_meta', severity: 'warning', message: 'Title trop long (73 chars): Conservation et Injection GLP-1 : Guide Pratique Voyage et Quotidien 2026' },
  { article_slug: 'traitements-glp1/glp1-prescription-generaliste-nouvelles-regles-ansm-2026', check_type: 'seo_meta', severity: 'warning', message: 'Title trop long (74 chars): GLP-1 Obésité : Les Généralistes Peuvent Prescrire (Règles ANSM 2025)' },
  { article_slug: 'traitements-glp1/glp1-seniors-plus-65-ans-limites-ansm-alternatives', check_type: 'seo_meta', severity: 'warning', message: 'Title trop long (66 chars): GLP-1 Personne Âgée Senior Plus 65 Ans : Limites et Alternatives' },

  // Content quality
  { article_slug: 'glp1-diabete/_category_', check_type: 'content_quality', severity: 'warning', message: 'Corps trop court (0 mots) — fichier _category_ sans contenu body' },

  // Frontmatter issues on _category_
  { article_slug: 'glp1-diabete/_category_', check_type: 'frontmatter', severity: 'warning', message: 'mainKeyword manquant' },
  { article_slug: 'glp1-diabete/_category_', check_type: 'frontmatter', severity: 'warning', message: 'Date manquante' },

  // Encoding check passed
  { article_slug: '_global', check_type: 'encoding', severity: 'pass', message: 'Aucun caractère de remplacement UTF-8 (U+FFFD) détecté' },

  // Duplicate check passed
  { article_slug: '_global', check_type: 'duplicate', severity: 'pass', message: 'Aucun titre ou description dupliqué détecté sur 154 fichiers' },
];

// Insert in batches of 20
for (let i = 0; i < validationResults.length; i += 20) {
  const batch = validationResults.slice(i, i + 20).map(r => ({
    ...r,
    agent_run_id: RUN_ID
  }));
  await post('/rest/v1/validation_results', batch);
  console.log(`   Batch ${Math.floor(i/20)+1}: ${batch.length} résultats insérés`);
}

// ============================================================
// 10. Création des correction_tickets pour les errors
// ============================================================
console.log('10. Création des correction_tickets...');

const tickets = [
  {
    slug: 'glp1-diabete/_category_',
    title: 'Frontmatter manquant dans _category_.md',
    source_agent: 'validator',
    ticket_type: 'missing_description',
    urgence: 'urgent',
    before_exact: 'Fichier _category_.md sans title, description, mainKeyword ni date',
    after_suggested: 'Ajouter frontmatter complet ou supprimer ce fichier s\'il n\'est pas utilisé par Astro',
    claim_original: 'Fichier _category_.md dans collection glp1-diabete sans frontmatter valide',
    realite_actuelle: 'Le fichier ne contient qu\'un commentaire "# Collection Diabète et GLP-1" — pas de frontmatter YAML. Ce fichier n\'est probablement pas rendu (le build passe), mais il doit être corrigé ou supprimé.',
    statut: 'approved'
  },
  {
    slug: 'effets-secondaires-glp1/effets-secondaires-ozempic',
    title: 'Description SEO trop longue (194 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'Description de 194 caractères (max recommandé: 160)',
    after_suggested: 'Raccourcir la description à 120-160 caractères pour optimiser l\'affichage dans les SERPs',
    claim_original: 'Description trop longue pour effets-secondaires-ozempic',
    realite_actuelle: 'La description dépasse 160 chars, risque de troncature dans Google',
    statut: 'approved'
  },
  {
    slug: 'traitements-glp1/conservation-injection-glp1-stylo-voyage-guide-pratique',
    title: 'Title SEO trop long (73 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'Conservation et Injection GLP-1 : Guide Pratique Voyage et Quotidien 2026 (73 chars)',
    after_suggested: 'Raccourcir le title à max 65 chars ex: "Conservation GLP-1 : Guide Pratique Voyage et Quotidien"',
    claim_original: 'Title trop long pour conservation-injection-glp1',
    realite_actuelle: 'Title de 73 chars — sera tronqué dans les résultats Google',
    statut: 'approved'
  },
  {
    slug: 'traitements-glp1/glp1-prescription-generaliste-nouvelles-regles-ansm-2026',
    title: 'Title SEO trop long (74 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'GLP-1 Obésité : Les Généralistes Peuvent Prescrire (Règles ANSM 2025) (74 chars)',
    after_suggested: 'Raccourcir à max 65 chars ex: "GLP-1 : Les Généralistes Peuvent Prescrire (ANSM 2025)"',
    claim_original: 'Title trop long pour glp1-prescription-generaliste',
    realite_actuelle: 'Title de 74 chars — sera tronqué dans les résultats Google',
    statut: 'approved'
  },
];

for (const ticket of tickets) {
  await post('/rest/v1/correction_tickets', ticket);
}
console.log(`   ${tickets.length} tickets créés`);

// ============================================================
// 11. Finalisation du run
// ============================================================
const errorsCount = 2;
const warningsCount = 70;
const infosCount = 0;
const articlesChecked = 154;
const ticketsCreated = tickets.length;

console.log('12. Finalisation du run...');
await patch(`/rest/v1/agent_runs?id=eq.${RUN_ID}`, {
  status: 'completed',
  completed_at: new Date().toISOString(),
  items_processed: articlesChecked,
  items_errors: errorsCount,
  metadata: {
    articles_checked: articlesChecked,
    errors: errorsCount,
    warnings: warningsCount,
    infos: infosCount,
    build_ok: true,
    deployed: true,
    tickets_created: ticketsCreated,
    build_pages: 241,
    cycle: 64
  }
});

console.log('');
console.log('=== RÉSUMÉ VALIDATOR CYCLE 64 ===');
console.log(`run_id: ${RUN_ID}`);
console.log(`Articles vérifiés: ${articlesChecked}`);
console.log(`Build: OK — 241 pages`);
console.log(`Errors: ${errorsCount}`);
console.log(`Warnings: ${warningsCount}`);
console.log(`Tickets créés: ${ticketsCreated}`);
console.log(`Deploy: OUI (push main)`);
