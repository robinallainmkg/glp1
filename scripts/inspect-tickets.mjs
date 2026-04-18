#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const { data: tickets, error } = await supabase
  .from('correction_tickets')
  .select('id, slug, ticket_type, urgence, source_agent, before_exact, after_suggested, human_note, claim_original, realite_actuelle')
  .eq('statut', 'approved')
  .order('urgence', { ascending: false })
  .order('created_at', { ascending: true })
  .limit(20);

if (error) { console.error(error); process.exit(1); }

for (const t of tickets) {
  console.log('---');
  console.log('ID:', t.id.slice(0,8), '| slug:', t.slug);
  console.log('type:', t.ticket_type, '| urgence:', t.urgence, '| source_agent:', t.source_agent);
  console.log('before_exact:', JSON.stringify((t.before_exact || '').slice(0,100)));
  console.log('after_suggested:', JSON.stringify((t.after_suggested || '').slice(0,100)));
  console.log('human_note:', JSON.stringify((t.human_note || '').slice(0,100)));
  console.log('claim_original:', JSON.stringify((t.claim_original || '').slice(0,100)));
  console.log('realite_actuelle:', JSON.stringify((t.realite_actuelle || '').slice(0,100)));
}
