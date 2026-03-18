import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Get all articles to find partition 4
const { data: allArticles, error: artErr } = await sb.from('articles').select('id, slug, title');
if (artErr) { console.error('articles error:', artErr); process.exit(1); }

const partition4 = allArticles.filter(a => a.id % 5 === 4);
console.log(`Partition 4: ${partition4.length} articles`);
console.log(partition4.map(a => `${a.id}: ${a.slug}`).join('\n'));

const ids = partition4.map(a => a.id);

if (!ids.length) { console.log('No articles in partition 4'); process.exit(0); }

// Get tickets
const { data: tickets, error: tickErr } = await sb.from('correction_tickets')
  .select('id, article_id, slug, title, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, human_note, source_agent, statut')
  .eq('statut', 'approved')
  .in('article_id', ids)
  .order('created_at', { ascending: true })
  .limit(20);

if (tickErr) { console.error('tickets error:', tickErr); process.exit(1); }
console.log(`\nTickets approved: ${tickets.length}`);
console.log(JSON.stringify(tickets, null, 2));
