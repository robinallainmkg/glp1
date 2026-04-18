import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ywekaivgjzsmdocchvum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs'
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
