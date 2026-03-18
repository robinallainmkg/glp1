import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { globSync } from 'glob';

config({ path: '.env' });

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const RUN_ID = 'f5beac8a-dab8-4bc2-9a43-59382ae35aa4';

// UUID → numeric mod 5 (use last 8 hex digits of UUID)
function uuidMod5(uuid) {
  const hex = uuid.replace(/-/g, '');
  const last8 = hex.slice(-8);
  return parseInt(last8, 16) % 5;
}

// Get all articles
const { data: allArticles, error: ae } = await sb.from('articles').select('id, slug, title');
if (ae) { console.error('articles error:', ae); process.exit(1); }

const partition4Articles = allArticles.filter(a => uuidMod5(a.id) === 4);
const partitionIds = new Set(partition4Articles.map(a => a.id));
console.log(`Partition 4: ${partition4Articles.length} articles`);
partition4Articles.slice(0, 10).forEach(a => console.log(`  ${a.id} → ${a.slug}`));

// Get ALL approved tickets then filter
const { data: allTickets, error: te } = await sb.from('correction_tickets')
  .select('id, article_id, slug, title, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, human_note, source_agent, statut')
  .eq('statut', 'approved')
  .order('urgence', { ascending: false })
  .order('created_at', { ascending: true });

if (te) { console.error('tickets error:', te); process.exit(1); }

// Filter by urgence priority then partition
const urgenceOrder = { urgent: 0, warning: 1, ok: 2 };
const tickets = allTickets
  .filter(t => partitionIds.has(t.article_id))
  .sort((a, b) => (urgenceOrder[a.urgence] ?? 2) - (urgenceOrder[b.urgence] ?? 2))
  .slice(0, 20);

console.log(`\nTickets to process: ${tickets.length}`);
tickets.forEach(t => console.log(`  [${t.urgence}] ${t.slug} — ${t.ticket_type} (${t.source_agent || 'fact-check'})`));

// Get ALL approved links, filter by source slug → article in partition 4
const slugToId = Object.fromEntries(allArticles.map(a => [a.slug.replace(/^[^/]+\//, ''), a.id]));
const slugToIdFull = Object.fromEntries(allArticles.map(a => [a.slug, a.id]));

const { data: allLinks, error: le } = await sb.from('internal_link_suggestions')
  .select('id, source_slug, target_slug, anchor_text, context_sentence, link_type, priority')
  .eq('status', 'approved')
  .order('priority', { ascending: true });

if (le) { console.error('links error:', le); process.exit(1); }

const links = allLinks.filter(l => {
  const artId = slugToIdFull[l.source_slug] || slugToId[l.source_slug];
  return artId && partitionIds.has(artId);
}).slice(0, 15);

console.log(`\nLinks to process: ${links.length}`);
links.forEach(l => console.log(`  ${l.source_slug} → ${l.target_slug}`));

// Get opportunities partitioned by opportunity id
const { data: allOpps, error: oe } = await sb.from('content_opportunities')
  .select('id, topic, description, target_keyword, suggested_collection, suggested_slug, source_urls')
  .eq('status', 'approved')
  .order('priority', { ascending: true });

if (oe) { console.error('opps error:', oe); process.exit(1); }

const opps = allOpps.filter(o => uuidMod5(o.id) === 4).slice(0, 3);
console.log(`\nOpportunities to process: ${opps.length}`);
opps.forEach(o => console.log(`  ${o.topic}`));

// Export for later use
const exportData = { tickets, links, opps, partitionIds: [...partitionIds] };
writeFileSync('scripts/.editorial_p4_data.json', JSON.stringify(exportData, null, 2));
console.log('\nData saved to scripts/.editorial_p4_data.json');
