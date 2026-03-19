#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const runId = process.argv[2];
const corrections = parseInt(process.argv[3] || '0');
const links = parseInt(process.argv[4] || '0');
const articles = parseInt(process.argv[5] || '0');
const errors = parseInt(process.argv[6] || '0');
const status = process.argv[7] || 'completed';

if (!runId) {
  console.error('Usage: node editorial-finalize-run.mjs <runId> <corrections> <links> <articles> <errors> [status]');
  process.exit(1);
}

const { error } = await supabase.from('agent_runs').update({
  status,
  completed_at: new Date().toISOString(),
  items_processed: corrections + links + articles,
  items_errors: errors,
  metadata: {
    corrections_applied: corrections,
    links_inserted: links,
    articles_created: articles,
  },
}).eq('id', runId);

if (error) { console.error('Error:', error.message); process.exit(1); }
console.log('Run', status + ':', runId);
