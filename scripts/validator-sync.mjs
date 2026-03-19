import { readFileSync, readdirSync } from 'fs';
import { join, basename, extname, dirname, sep } from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';
const RUN_ID = '939609b1-a96c-4204-95f3-09884b5ab4cb';
const ROOT = 'C:\\Users\\robin\\glp1\\glp1';
const CONTENT_DIR = join(ROOT, 'src', 'content');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function findMarkdownFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findMarkdownFiles(fullPath));
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

// Get active articles from Supabase
const { data: dbArticles, error } = await supabase
  .from('articles')
  .select('slug, collection')
  .eq('is_active', true);

if (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
}

console.log('DB articles actifs:', dbArticles.length);

// Get files from disk
const files = findMarkdownFiles(CONTENT_DIR);
const diskFiles = new Map();
for (const file of files) {
  const slug = basename(file, extname(file));
  const collection = dirname(file).split(sep).pop();
  diskFiles.set(collection + '/' + slug, file);
}
console.log('Fichiers sur disque:', diskFiles.size);

const syncIssues = [];

// Check DB articles not on disk (ghost articles)
const META_COLLECTIONS = ['astro-pages', 'astro-guides', 'astro-legal', 'astro-temoignages',
  'astro-collections', 'astro-annuaire', 'astro-mon-espace', 'astro-articles',
  'pages-statiques'];

for (const art of dbArticles) {
  const isMetaCollection = META_COLLECTIONS.some(mc => art.collection === mc || art.collection.startsWith('astro-'));
  if (isMetaCollection) continue;

  // Try to find on disk
  const slugParts = art.slug.split('/');
  const lastSlug = slugParts[slugParts.length - 1];
  const key1 = art.collection + '/' + art.slug;
  const key2 = art.collection + '/' + lastSlug;

  const onDisk = diskFiles.has(key1) || diskFiles.has(key2);
  if (!onDisk) {
    syncIssues.push({
      slug: lastSlug,
      collection: art.collection,
      type: 'sync',
      severity: 'error',
      msg: `Article fantome (en base mais pas sur disque): ${art.slug}`
    });
  }
}

// Check disk files not in DB
const dbSlugSet = new Set();
for (const art of dbArticles) {
  const parts = art.slug.split('/');
  dbSlugSet.add(art.collection + '/' + parts[parts.length - 1]);
  dbSlugSet.add(parts[parts.length - 1]);
}

for (const [key, file] of diskFiles) {
  const slug = key.split('/')[1];
  if (slug === '_category_' || slug === 'config') continue;

  const inDb = dbSlugSet.has(key) || dbSlugSet.has(slug);
  if (!inDb) {
    syncIssues.push({
      slug,
      collection: key.split('/')[0],
      type: 'sync',
      severity: 'warning',
      msg: `Fichier sur disque non indexe en base: ${key}`
    });
  }
}

console.log('\n=== COHERENCE SUPABASE/DISQUE ===');
const ghostErrors = syncIssues.filter(i => i.severity === 'error');
const unindexedWarnings = syncIssues.filter(i => i.severity === 'warning');
console.log(`Articles fantomes (DB mais pas disque): ${ghostErrors.length}`);
ghostErrors.forEach(e => console.log(`  [ERROR] ${e.msg}`));
console.log(`Fichiers non indexes (disque mais pas DB): ${unindexedWarnings.length}`);
unindexedWarnings.slice(0, 10).forEach(w => console.log(`  [WARN] ${w.msg}`));

// Write to Supabase
if (syncIssues.length > 0) {
  const results = syncIssues.map(i => ({
    agent_run_id: RUN_ID,
    article_slug: i.slug,
    check_type: i.type,
    severity: i.severity,
    message: i.msg,
    details: { collection: i.collection }
  }));

  for (let i = 0; i < results.length; i += 50) {
    const batch = results.slice(i, i + 50);
    const { error: insertErr } = await supabase.from('validation_results').insert(batch);
    if (insertErr) console.error('Insert error:', insertErr.message);
    else process.stdout.write('.');
  }
  console.log('\ndone');
}

console.log('SYNC_TOTALS:' + JSON.stringify({ ghost: ghostErrors.length, unindexed: unindexedWarnings.length }));
