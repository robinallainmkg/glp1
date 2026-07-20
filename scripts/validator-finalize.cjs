require('dotenv/config');
#!/usr/bin/env node
const https = require('https');

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RUN_ID = 'a63a008d-c3a6-4a8b-becb-0c8050159cb1';

function patch(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(SUPABASE_URL + endpoint);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(data)
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

async function main() {
  const metadata = {
    articles_checked: 100,
    errors: 1,
    warnings: 97,
    infos: 0,
    build_ok: true,
    deployed: true,
    duplicates_found: 0,
    sync_issues: 64,
    tickets_created: 1,
    broken_links: 1,
    seo_warnings: 95,
    html_pages_checked: 5,
    sitemap_urls: 217,
    encoding_issues: 0,
    image_issues: 0
  };

  const r = await patch('/rest/v1/agent_runs?id=eq.' + RUN_ID, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    items_processed: 100,
    items_errors: 1,
    metadata: metadata
  });
  console.log('agent_run finalize:', r.status, r.body);
}

main().catch(e => { console.error(e); process.exit(1); });
