const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const BASE = path.join(__dirname, '..');
const contentDir = path.join(BASE, 'src', 'content');

function getAllMdFiles(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) results.push(...getAllMdFiles(full));
      else if (entry.name.endsWith('.md')) results.push(full);
    }
  } catch(e) {}
  return results;
}

async function run() {
  const { data: dbArticles, error } = await supabase
    .from('articles')
    .select('slug, collection')
    .eq('is_active', true);

  if (error) { console.error('Supabase error:', error.message); return; }

  const files = getAllMdFiles(contentDir);
  const fileSlugs = new Set();
  for (const f of files) {
    const rel = path.relative(contentDir, f).replace(/\\/g, '/');
    const slug = path.basename(f, '.md');
    const collection = rel.split('/')[0];
    // Store both forms: slug alone and collection/slug
    fileSlugs.add(slug);
    fileSlugs.add(collection + '/' + slug);
  }

  const dbSlugs = new Set(dbArticles.map(a => a.slug));
  const dbSlugsSimple = new Set(dbArticles.map(a => {
    // normalize: if slug contains /, take last part
    const parts = a.slug.split('/');
    return parts[parts.length - 1];
  }));

  // Articles in DB but not on disk
  const phantoms = [];
  for (const a of dbArticles) {
    const slug = a.slug;
    const simpleslug = slug.includes('/') ? slug.split('/').pop() : slug;
    if (!fileSlugs.has(slug) && !fileSlugs.has(simpleslug)) {
      phantoms.push(slug);
    }
  }

  // Files on disk but not in DB
  const unindexed = [];
  for (const f of files) {
    const slug = path.basename(f, '.md');
    if (!dbSlugs.has(slug) && !dbSlugsSimple.has(slug)) {
      const rel = path.relative(contentDir, f).replace(/\\/g, '/');
      unindexed.push(rel);
    }
  }

  console.log('Total DB active: ' + dbArticles.length);
  console.log('Total files: ' + files.length);
  console.log('Phantoms (in DB not on disk): ' + phantoms.length);
  for (const p of phantoms.slice(0, 10)) console.log('  PHANTOM: ' + p);
  console.log('Unindexed (on disk not in DB): ' + unindexed.length);
  for (const u of unindexed.slice(0, 10)) console.log('  UNINDEXED: ' + u);

  fs.writeFileSync(path.join(__dirname, 'validator_sync.json'), JSON.stringify({ phantoms, unindexed }, null, 2));
  console.log('Saved to scripts/validator_sync.json');
}

run().catch(console.error);
