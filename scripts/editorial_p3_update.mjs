import 'dotenv/config';
import https from 'https';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function patchRequest(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
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
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
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

const tickets = [
  { id: '140111d6-f39f-4d93-8c5f-0e980fa3c12d', after_final: 'Titre mis a jour: "Wegovy Effets Secondaires Danger : Guide et Precautions 2026" (60 chars) - mainKeyword integre.' },
  { id: '3614595c-df97-432b-adfb-18fd4e71f138', after_final: 'Titre contient deja le mainKeyword. Ticket resolu sans modification (faux positif).' },
  { id: '6bb24797-bc12-4585-8db3-d96cb795cb3b', after_final: 'Titre mis a jour: "Remboursement Mounjaro Obesite HAS CEPS Calendrier 2026" (55 chars) - mainKeyword complet integre.' },
  { id: 'e6000441-1d78-488d-a37e-42c890dfbddd', after_final: 'Titre contient deja le mainKeyword. Ticket resolu sans modification (faux positif).' },
  { id: '4afe3c69-f55c-489b-95bc-032f5d166563', after_final: 'Fichier existe bien sur disque. Synchronisation correcte, is_active=true maintenu.' },
  { id: '68ed275e-161c-4ce2-8b51-7fc4a07e8ce0', after_final: 'Fichier traitements-glp1/wegovy-comprime-oral-pilule-france-date-ema.md existe sur disque. Synchronisation correcte.' },
  { id: '7bc288cf-a9a4-4526-b221-8544e8931208', after_final: 'Article centres-mounjaro-france insere dans articles (collection=traitements-glp1, is_active=true).' },
  { id: '49915a72-07ee-4c0e-bfe4-bff78202ba9c', after_final: 'Article recherche-clinique-glp1 insere dans articles (collection=recherche-glp1, is_active=true).' },
  { id: 'ae3e9a3d-1e84-4636-b574-8f72a6772921', after_final: 'Article glp1-calories-journalieres insere dans articles (collection=regime-glp1, is_active=true).' },
  { id: '817d8137-d311-4c3f-b641-d69de5ebdd4f', after_final: 'Fichier regime-glp1/glp1-index-glycemique.md existe sur disque. is_active=true deja en DB. Synchronisation correcte.' },
  { id: 'e4ee16ba-ce1f-4f4b-9d02-c243ba3bc296', after_final: 'Fichier regime-glp1/regime-paleo-glp1.md existe sur disque. is_active=true deja en DB. Synchronisation correcte.' },
  { id: 'b1a0a08c-5f21-4e4e-b648-9afbccadbc38', after_final: 'Fichier regime-glp1/regime-sans-sucre-glp1.md existe sur disque. is_active=true deja en DB. Synchronisation correcte.' },
  { id: '704123cc-d9c8-4b49-8696-b104c6572be6', after_final: 'Article fantome sophie-transformation-glp1 : fichier absent sur disque. is_active mis a false dans articles table.' },
  { id: 'c2311931-7471-4138-80d5-7e984e78c28a', after_final: 'ozempic-proces-effets-secondaires-recours-juridique-france insere dans articles (collection=effets-secondaires-glp1, is_active=true).' },
  { id: '9c5af53b-bc1d-4954-9afc-85a503f4faf6', after_final: 'ozempic-generique-france-semaglutide-biosimilaire-date insere dans articles (collection=glp1-cout, is_active=true).' },
  { id: 'e84e5541-a0d8-44e5-9a93-c9dcf42713b3', after_final: 'quand-wegovy-rembourse-france-2026-conditions-calendrier deja present en DB (is_active=true). Ticket resolu.' },
  { id: '7dcb495d-32a8-47a8-a970-86a1445f0084', after_final: 'plateau-poids-glp1-ozempic-wegovy-causes-solutions deja present en DB (is_active=true). Lien brise corrige dans meme fichier.' },
  { id: '6f2ccb6a-4acc-48ff-9866-c56019371922', after_final: 'reprise-poids-glp1-4-fois-plus-rapide-etude-2026 deja present en DB (is_active=true). Ticket resolu.' },
  { id: '3f46dca2-955e-46d6-b79c-25e4205571ae', after_final: 'pharmacovigilance-glp1-france-ansm-bilan-2025-2026 deja present en DB (is_active=true). Ticket resolu.' },
  { id: '43a3bc44-bc4f-45be-9813-5d9224e65454', after_final: 'wegovy-comprime-oral-pilule-france-date-ema deja present en DB (is_active=true). Ticket resolu.' },
  { id: '5a225f0e-0d87-4749-8e75-19f74dcf6e76', after_final: 'Lien corrige dans plateau-poids : /regime-glp1/glp1-carences-nutritionnelles... -> /collections/regime-glp1/glp1-carences-nutritionnelles... (prefixe /collections/ ajoute).' },
  { id: '491be700-68f2-4487-8752-dfa375715eb8', after_final: 'Titre actuel 58 chars < 65. Ticket resolu (faux positif - titre deja conforme).' },
];

for (const ticket of tickets) {
  const result = await patchRequest(
    '/rest/v1/correction_tickets?id=eq.' + ticket.id,
    { statut: 'ready_to_deploy', after_final: ticket.after_final, updated_at: new Date().toISOString() }
  );
  const status = result.status === 204 ? 'OK' : 'ERR ' + result.status + ' ' + result.body.substring(0, 80);
  console.log(status + ' ' + ticket.id.substring(0, 8));
}

for (const ticket of tickets) {
  await postRequest('/rest/v1/agent_logs', {
    agent_type: 'editorial',
    status: 'success',
    metadata: { ticket_id: ticket.id, action: 'correction', source_agent: 'validator', partition: '3/3 (o-z)' }
  });
}
console.log('Done. ' + tickets.length + ' tickets updated to ready_to_deploy.');
