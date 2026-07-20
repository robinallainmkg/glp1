import 'dotenv/config';
import https from 'https';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function uuidMod4(uuid) {
  if (!uuid) return null;
  const lastPart = uuid.replace(/-/g, '').slice(-8);
  const num = parseInt(lastPart, 16);
  return num % 4;
}

function fetchJSON(path) {
  return new Promise((resolve, reject) => {
    const url = SUPABASE_URL + path;
    const options = { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

const tickets = await fetchJSON('/rest/v1/correction_tickets?statut=eq.approved&select=id,article_id,slug,title,ticket_type,urgence,before_exact,after_suggested,claim_original,realite_actuelle,source_reference,human_note,source_agent&limit=200');

const dist = {0:0,1:0,2:0,3:0,null:0};
tickets.forEach(t => {
  const m = uuidMod4(t.article_id);
  if (m === null) dist['null']++;
  else dist[m]++;
});
console.log('Distribution article_id mod4:', dist);

const filtered = tickets.filter(t => uuidMod4(t.article_id) === 3);
filtered.sort((a,b) => {
  const urgOrder = {urgent:0, warning:1, ok:2};
  const ua = urgOrder[a.urgence] ?? 2;
  const ub = urgOrder[b.urgence] ?? 2;
  return ua - ub;
});
const limited = filtered.slice(0, 20);
console.log('Partition 3 tickets:', limited.length);
for (const t of limited) {
  console.log(`  ${t.id} | ${t.urgence} | ${t.source_agent || 'fact-check'} | ${t.ticket_type} | ${t.slug}`);
}
console.log(JSON.stringify(limited));
