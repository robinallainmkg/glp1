import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Check tickets structure
const { data: tickets, error } = await sb.from('correction_tickets')
  .select('id, article_id, slug, statut')
  .eq('statut', 'approved')
  .limit(5);
if (error) { console.error('tickets:', error); }
else console.log('tickets sample:', JSON.stringify(tickets, null, 2));

// Count total approved tickets
const { count } = await sb.from('correction_tickets').select('*', { count: 'exact', head: true }).eq('statut', 'approved');
console.log('Total approved tickets:', count);

// Check internal_link_suggestions
const { data: links, error: le } = await sb.from('internal_link_suggestions')
  .select('id, source_slug, target_slug, status')
  .eq('status', 'approved')
  .limit(5);
if (le) console.error('links:', le);
else console.log('links sample:', JSON.stringify(links, null, 2));

const { count: lcount } = await sb.from('internal_link_suggestions').select('*', { count: 'exact', head: true }).eq('status', 'approved');
console.log('Total approved links:', lcount);

// Check opportunities
const { data: opps, error: oe } = await sb.from('content_opportunities')
  .select('id, topic, status')
  .eq('status', 'approved')
  .limit(5);
if (oe) console.error('opps:', oe);
else console.log('opps sample:', JSON.stringify(opps, null, 2));
