import https from 'https';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

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

// Fetch articles to get their IDs for JOIN
const articles = await fetchJSON('/rest/v1/articles?select=id,slug&limit=500');
const articleBySlug = {};
articles.forEach(a => { articleBySlug[a.slug] = a.id; });

// Fetch internal link suggestions
const links = await fetchJSON('/rest/v1/internal_link_suggestions?status=eq.approved&select=id,source_slug,target_slug,anchor_text,context_sentence,link_type,priority&order=priority.asc&limit=100');
// Filter by source_slug's article id mod 4 = 3
const filteredLinks = links.filter(l => {
  const aid = articleBySlug[l.source_slug];
  if (!aid) return false;
  return uuidMod4(aid) === 3;
}).slice(0, 15);

console.log('Internal link suggestions (partition 3):', filteredLinks.length);
filteredLinks.forEach(l => console.log(`  ${l.id} | priority:${l.priority} | ${l.source_slug} -> ${l.target_slug} | anchor: ${l.anchor_text}`));
console.log('LINKS_JSON:' + JSON.stringify(filteredLinks));

// Fetch content opportunities
const opps = await fetchJSON('/rest/v1/content_opportunities?status=eq.approved&select=id,topic,description,target_keyword,suggested_collection,suggested_slug,source_urls&order=priority.asc&limit=50');
// Filter by id mod 4 = 3
const filteredOpps = opps.filter(o => o.id % 4 === 3).slice(0, 3);
console.log('\nContent opportunities (partition 3):', filteredOpps.length);
filteredOpps.forEach(o => console.log(`  ${o.id} | ${o.topic} | ${o.suggested_slug}`));
console.log('OPPS_JSON:' + JSON.stringify(filteredOpps));
