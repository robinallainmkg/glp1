import https from 'https';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';
const AGENT_RUN_ID = '12be110f-3112-49fb-b189-b21c6795c28e';

function fetchJSON(path) {
  return new Promise((resolve, reject) => {
    const url = SUPABASE_URL + path;
    const options = { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('JSON parse error: ' + data.slice(0,200))); }
      });
    }).on('error', reject);
  });
}

function patchJSON(path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const urlObj = new URL(SUPABASE_URL + path);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'PATCH',
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

// Step 1: Fetch all sync_issue tickets that are approved
console.log('=== Fetching sync_issue tickets (approved) ===');
const tickets = await fetchJSON(
  '/rest/v1/correction_tickets?statut=eq.approved&ticket_type=eq.sync_issue&select=id,article_id,slug,title,ticket_type,urgence,before_exact,after_suggested,source_agent&limit=200'
);

if (!Array.isArray(tickets)) {
  console.error('Unexpected response:', tickets);
  process.exit(1);
}

console.log(`Total sync_issue approved tickets: ${tickets.length}`);

// Categorize tickets
const fantomeTickets = tickets.filter(t =>
  (t.before_exact && t.before_exact.toLowerCase().includes('fantôme')) ||
  (t.before_exact && t.before_exact.toLowerCase().includes('fantome')) ||
  (t.after_suggested && t.after_suggested.toLowerCase().includes('is_active=false')) ||
  (t.after_suggested && t.after_suggested.toLowerCase().includes('inactif'))
);

const nonIndexeTickets = tickets.filter(t =>
  (t.before_exact && t.before_exact.toLowerCase().includes('non index')) ||
  (t.after_suggested && t.after_suggested.toLowerCase().includes('indexer')) ||
  (t.after_suggested && t.after_suggested.toLowerCase().includes('insérer'))
);

const otherTickets = tickets.filter(t =>
  !fantomeTickets.includes(t) && !nonIndexeTickets.includes(t)
);

console.log(`\nCategorized:`);
console.log(`  Fantome (mark inactive): ${fantomeTickets.length}`);
console.log(`  Non-indexe (file exists, not in DB): ${nonIndexeTickets.length}`);
console.log(`  Other: ${otherTickets.length}`);

console.log('\n=== All tickets details ===');
for (const t of tickets) {
  console.log(`\n  ID: ${t.id}`);
  console.log(`  Slug: ${t.slug}`);
  console.log(`  Article ID: ${t.article_id}`);
  console.log(`  Before: ${t.before_exact}`);
  console.log(`  After: ${t.after_suggested}`);
  console.log(`  Source agent: ${t.source_agent}`);
  console.log(`  Urgence: ${t.urgence}`);
}

console.log('\n=== Processing Fantome tickets ===');
for (const ticket of fantomeTickets) {
  console.log(`\nProcessing fantome ticket: ${ticket.id} | slug: ${ticket.slug}`);

  // Step 1: Mark ticket in_progress
  const r1 = await patchJSON(
    `/rest/v1/correction_tickets?id=eq.${ticket.id}`,
    { statut: 'in_progress', updated_at: new Date().toISOString() }
  );
  console.log(`  in_progress: ${r1.status}`);

  // Step 2: Mark article inactive (if article_id exists)
  if (ticket.article_id) {
    const r2 = await patchJSON(
      `/rest/v1/articles?id=eq.${ticket.article_id}`,
      { is_active: false, updated_at: new Date().toISOString() }
    );
    console.log(`  article is_active=false: ${r2.status}`);
  } else {
    // Try by slug
    const r2 = await patchJSON(
      `/rest/v1/articles?slug=eq.${encodeURIComponent(ticket.slug)}`,
      { is_active: false, updated_at: new Date().toISOString() }
    );
    console.log(`  article is_active=false (by slug): ${r2.status}`);
  }

  // Step 3: Mark ticket ready_to_deploy
  const r3 = await patchJSON(
    `/rest/v1/correction_tickets?id=eq.${ticket.id}`,
    {
      statut: 'ready_to_deploy',
      after_final: 'Article marqué inactif (is_active=false): fichier absent du disque',
      updated_at: new Date().toISOString()
    }
  );
  console.log(`  ready_to_deploy: ${r3.status}`);

  // Step 4: Insert agent_log
  const logEntry = {
    agent_name: 'editorial',
    run_id: AGENT_RUN_ID,
    level: 'info',
    message: `Fantome article marked inactive: ${ticket.slug}`,
    metadata: {
      ticket_id: ticket.id,
      article_id: ticket.article_id,
      slug: ticket.slug,
      action: 'mark_inactive',
      before: ticket.before_exact,
      after: 'Article marqué inactif (is_active=false): fichier absent du disque'
    },
    created_at: new Date().toISOString()
  };
  const r4 = await postJSON('/rest/v1/agent_logs', logEntry);
  console.log(`  agent_log: ${r4.status}`);
}

console.log('\n=== Processing Non-Indexe tickets (mark in_progress only) ===');
for (const ticket of nonIndexeTickets) {
  console.log(`\nProcessing non-indexe ticket: ${ticket.id} | slug: ${ticket.slug}`);
  const r1 = await patchJSON(
    `/rest/v1/correction_tickets?id=eq.${ticket.id}`,
    { statut: 'in_progress', updated_at: new Date().toISOString() }
  );
  console.log(`  in_progress: ${r1.status}`);
}

console.log('\n=== DONE ===');
console.log(`Fantome tickets processed: ${fantomeTickets.length}`);
console.log(`Non-indexe tickets marked in_progress: ${nonIndexeTickets.length}`);
console.log(`Other tickets untouched: ${otherTickets.length}`);
