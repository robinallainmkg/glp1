#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

function request(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + endpoint);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // Get active articles from Supabase
  const articles = await request('/rest/v1/articles?is_active=eq.true&select=slug,collection&limit=1000');
  const dbSlugs = new Set(articles.map(a => a.slug));

  // Get files on disk
  function getFiles(dir) {
    let r = [];
    if (!fs.existsSync(dir)) return r;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) r = r.concat(getFiles(full));
      else if (e.name.endsWith('.md')) r.push(path.basename(full, '.md'));
    }
    return r;
  }
  const diskSlugs = new Set(getFiles('src/content'));

  const inDbNotDisk = [...dbSlugs].filter(s => !diskSlugs.has(s));
  const onDiskNotDb = [...diskSlugs].filter(s => !dbSlugs.has(s));

  console.log('DB articles (active):', dbSlugs.size);
  console.log('Disk files:', diskSlugs.size);
  console.log('In DB but NOT on disk (phantom):', inDbNotDisk.length);
  inDbNotDisk.slice(0, 10).forEach(s => console.log('  PHANTOM:', s));
  console.log('On disk but NOT in DB (unindexed):', onDiskNotDb.length);
  onDiskNotDb.slice(0, 10).forEach(s => console.log('  UNINDEXED:', s));

  console.log(JSON.stringify({ dbCount: dbSlugs.size, diskCount: diskSlugs.size, phantoms: inDbNotDisk, unindexed: onDiskNotDb }));
}

main().catch(e => { console.error(e); process.exit(1); });
