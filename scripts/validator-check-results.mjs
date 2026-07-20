import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ywekaivgjzsmdocchvum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: runs } = await supabase.from('agent_runs')
  .select('id, created_at, status, metadata')
  .eq('agent_name', 'validator')
  .order('created_at', { ascending: false })
  .limit(3);

console.log('Validator runs:', runs?.map(r => ({ id: r.id, status: r.status, created: r.created_at?.substring(0, 19) })));

const runId = runs?.[0]?.id;
console.log('Latest run ID:', runId);

if (runId) {
  const { data: results } = await supabase.from('validation_results')
    .select('check_type, severity, article_slug, message')
    .eq('agent_run_id', runId);

  console.log('\nResults for this run:', results?.length || 0);
  const bySev = {};
  for (const r of (results || [])) {
    bySev[r.severity] = (bySev[r.severity] || 0) + 1;
  }
  console.log('By severity:', bySev);

  const warnings = (results || []).filter(r => r.severity === 'warning');
  const errors = (results || []).filter(r => r.severity === 'error');

  console.log('\nErrors:', errors.length);
  errors.forEach(r => console.log(' -', r.check_type, ':', r.message?.substring(0, 100)));

  console.log('\nWarnings:', warnings.length);
  warnings.forEach(r => console.log(' -', r.check_type, ':', r.message?.substring(0, 100)));
}
