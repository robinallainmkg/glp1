import 'dotenv/config';
import https from 'https';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function patchRequest(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(options, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: resp }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function postRequest(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(options, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: resp }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Links with their status
const links = [
  { id: 'f6b79dd7-3008-44e4-97d7-acb3940f1c12', source: 'traitements-glp1/glp1-seniors-plus-65-ans-limites-ansm-alternatives', target: 'effets-secondaires-glp1/glp1-osteoporose-risque-osseux', status: 'applied', note: 'Already applied in previous run' },
  { id: '49685e83-8eea-4172-8a94-fb982f4efed4', source: 'alternatives-glp1/alternatives-naturelles-ozempic', target: 'alternatives-glp1/berberine-glp1', status: 'applied', note: 'Already applied in previous run' },
  { id: '8756402a-cc71-4c25-a7b5-674de4f53a0f', source: 'effets-secondaires-glp1/contrefacon-glp1-faux-ozempic-danger', target: 'traitements-glp1/penurie-ozempic-wegovy-mounjaro-rupture-stock-france-alternatives', status: 'applied', note: 'Link inserted in penury section' },
  { id: 'f0fdebb3-6cde-46a2-8c0d-8dac4a4e5b51', source: 'recherche-glp1/glp1-insuffisance-renale-nephroprotetion-diabete', target: 'glp1-diabete/glp1-diabete-type-2-guide-patient-remboursement-france-2026', status: 'applied', note: 'Link inserted in recommendations section' },
  { id: '8e88f245-094c-48ee-a04c-d2b7bc8c772d', source: 'effets-secondaires-glp1/glp1-interactions-medicamenteuses-ozempic-wegovy-mounjaro', target: 'effets-secondaires-glp1/glp1-chirurgie-anesthesie-precautions-arret-traitement', status: 'applied', note: 'Link inserted after chirurgie anesthesie section' },
  { id: 'c4a07da8-98ee-4ff8-b55a-3e42cf5e4c93', source: 'recherche-glp1/recherche-clinique-glp1', target: 'recherche-glp1/glp1-apnee-sommeil-saos', status: 'applied', note: 'Link inserted in intro about nouvelles indications' },
  { id: '143fa6df-3185-42c6-8f28-9da70fe294e4', source: 'regime-detox-glp1', target: 'effets-secondaires-ozempic', status: 'applied', note: 'Link inserted in probiotics FAQ answer' },
  { id: 'f6172712-9b3e-4b30-beb2-d3de5c61d27f', source: 'sophie-transformation-glp1', target: 'effets-secondaires-ozempic', status: 'applied', note: 'Link inserted after first phase quote about nausées' }
];

for (const link of links) {
  const result = await patchRequest(
    '/rest/v1/internal_link_suggestions?id=eq.' + link.id,
    { status: 'applied', updated_at: new Date().toISOString() }
  );
  const statusStr = result.status === 204 ? 'OK' : 'ERR ' + result.status;
  console.log(statusStr + ' ' + link.id.substring(0,8) + '... ' + link.source + ' -> ' + link.target);
}

// Log
for (const link of links) {
  await postRequest('/rest/v1/agent_logs', {
    agent_type: 'editorial',
    status: 'success',
    metadata: { action: 'internal_link', source: link.source, target: link.target, partition: '4/4' }
  });
}
console.log('All link logs inserted');
