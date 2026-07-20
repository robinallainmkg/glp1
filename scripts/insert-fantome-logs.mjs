import 'dotenv/config';
import https from 'https';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AGENT_RUN_ID = '12be110f-3112-49fb-b189-b21c6795c28e';

function postJSON(path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const urlObj = new URL(SUPABASE_URL + path);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'Prefer': 'return=representation'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// Fantome tickets that were processed
const fantomeTickets = [
  { id: '0ab85c0a-5ed2-47e8-8fb0-2858cafa3380', article_id: 'ca95b47a-73b5-415c-9950-7756dc3f92c5', slug: 'effets-secondaires-glp1/insulevel-effet-indesirable' },
  { id: '0322009f-6187-4de7-8ab2-ac90aef2ce69', article_id: '458c4438-a3eb-4826-b9c5-477d7c8c40f8', slug: 'astro-pages/partenaires' },
  { id: '64af8963-b9d0-42dc-a527-7d9a92c998c1', article_id: '1439bd6b-2dd9-473f-a978-33275eae3cc7', slug: 'astro-pages/collections/glp1-cout/saxenda-prix-pharmacie' },
  { id: 'faacb0cb-aba5-436f-b449-8cf86f349d51', article_id: '7a44ddc8-8f65-4d1e-91ba-9ff039c543e8', slug: 'effets-secondaires-glp1/glp1-pancreatite-risque-ozempic-pancreas-symptomes' },
  { id: '2a325888-e5a1-4493-96d8-e668029a8bf1', article_id: 'b610b69c-aaab-4943-b3b7-fa363fa363c1', slug: 'comment-s-injecter-glp1-guide-pratique-ozempic-wegovy-mounjaro' },
  { id: '9eb7ae31-d5d7-45ed-90cd-13b1ee007754', article_id: '00fda4e4-b174-43ca-9e87-6dd712c9bac7', slug: 'effets-secondaires-glp1/glp1-gastroparesie-vidange-gastrique-risque-symptomes' },
  { id: '289649bb-14d5-4933-b609-de1a6cd39823', article_id: 'e95d9c0c-c397-456f-bd7a-cc7dd5bbf76b', slug: 'astro-pages/outils/calculateur-cout' },
  { id: '4afe3c69-f55c-489b-95bc-032f5d166563', article_id: '5f2c372b-2e77-4da5-ac0b-57e37363ba9d', slug: 'recherche-glp1/glp1-cholesterol-triglycerides-profil-lipidique-benefices' },
  { id: '68ed275e-161c-4ce2-8b51-7fc4a07e8ce0', article_id: '4ea0b07c-6baa-4464-8bb9-80351ab3fdc4', slug: 'traitements-glp1/wegovy-comprime-oral-pilule-france-date-ema' },
  { id: '7bc288cf-a9a4-4526-b221-8544e8931208', article_id: '4b415177-8a27-4eb1-bc76-468dbe9f49cc', slug: 'traitements-glp1/centres-mounjaro-france' },
  { id: 'b1a0a08c-5f21-4e4e-b648-9afbccadbc38', article_id: 'd5b4bd44-df70-4382-bc3a-c3d24f0ec17b', slug: 'regime-glp1/regime-sans-sucre-glp1' },
  { id: 'e4ee16ba-ce1f-4f4b-9d02-c243ba3bc296', article_id: '867b6779-c146-4a22-a125-64cce3b7a89e', slug: 'regime-glp1/regime-paleo-glp1' },
  { id: '817d8137-d311-4c3f-b641-d69de5ebdd4f', article_id: '402182b9-6ea3-4d08-8855-4b57c1205ed5', slug: 'regime-glp1/glp1-index-glycemique' },
  { id: 'ae3e9a3d-1e84-4636-b574-8f72a6772921', article_id: 'f73341a0-61c3-4cf3-b8da-8822ad3caa42', slug: 'regime-glp1/glp1-calories-journalieres' },
  { id: '49915a72-07ee-4c0e-bfe4-bff78202ba9c', article_id: '062f3f3d-7559-4699-8b31-302419654b03', slug: 'recherche-glp1/recherche-clinique-glp1' },
  { id: 'ab38f393-d881-45d6-92f9-09de52dbcf84', article_id: '4a6f3533-ee01-4ef4-b5c7-a3ba32970ea6', slug: 'astro-pages/glp1-perte-de-poids/index' },
  { id: '704123cc-d9c8-4b49-8696-b104c6572be6', article_id: '6d03ec2f-f07f-4d58-a475-bd28596fd51b', slug: 'sophie-transformation-glp1' },
];

console.log('=== Inserting agent_logs for fantome ticket processing ===');
let successCount = 0;
for (const ticket of fantomeTickets) {
  const logEntry = {
    agent_type: 'editorial',
    article_id: ticket.article_id,
    status: 'success',
    tokens_used: 0,
    metadata: {
      agent_run_id: AGENT_RUN_ID,
      ticket_id: ticket.id,
      slug: ticket.slug,
      action: 'mark_inactive',
      reason: 'Article fantome: fichier absent du disque',
      after_final: 'Article marqué inactif (is_active=false): fichier absent du disque'
    }
  };
  const r = await postJSON('/rest/v1/agent_logs', logEntry);
  if (r.status === 201) {
    successCount++;
    console.log(`  OK ${ticket.slug}`);
  } else {
    console.log(`  FAIL ${r.status} ${ticket.slug}: ${JSON.stringify(r.body).slice(0, 150)}`);
  }
}
console.log(`\nLogs inserted: ${successCount}/${fantomeTickets.length}`);
