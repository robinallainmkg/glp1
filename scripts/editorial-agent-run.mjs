import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // 1. Insert agent_run
  const { data: runData, error: runError } = await supabase
    .from('agent_runs')
    .insert({ agent_name: 'editorial', status: 'started' })
    .select('id')
    .single();

  if (runError) {
    console.error('ERROR inserting agent_run:', runError.message);
    process.exit(1);
  }
  console.log('AGENT_RUN_ID:', runData.id);

  // 2. Fetch correction tickets
  const { data: tickets, error: ticketsError } = await supabase
    .from('correction_tickets')
    .select('id, article_id, slug, title, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, human_note, source_agent')
    .eq('statut', 'approved')
    .order('created_at', { ascending: true })
    .limit(20);

  if (ticketsError) {
    console.error('ERROR fetching tickets:', ticketsError.message);
  } else {
    console.log('TICKETS_COUNT:', tickets.length);
    tickets.forEach(t => console.log('TICKET:', JSON.stringify(t)));
  }

  // 3. Fetch internal link suggestions
  const { data: links, error: linksError } = await supabase
    .from('internal_link_suggestions')
    .select('id, source_slug, target_slug, anchor_text, context_sentence, link_type, priority')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .limit(15);

  if (linksError) {
    console.error('ERROR fetching links:', linksError.message);
  } else {
    console.log('LINKS_COUNT:', links.length);
    links.forEach(l => console.log('LINK:', JSON.stringify(l)));
  }

  // 4. Fetch content opportunities
  const { data: opps, error: oppsError } = await supabase
    .from('content_opportunities')
    .select('id, topic, description, target_keyword, suggested_collection, suggested_slug, source_urls')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .limit(3);

  if (oppsError) {
    console.error('ERROR fetching opportunities:', oppsError.message);
  } else {
    console.log('OPPS_COUNT:', opps.length);
    opps.forEach(o => console.log('OPP:', JSON.stringify(o)));
  }

  console.log('DONE');
  console.log('RUN_ID_FINAL:', runData.id);
}

main().catch(console.error);
