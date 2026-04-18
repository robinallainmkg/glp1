#!/usr/bin/env node
/**
 * Mark all ready_to_deploy tickets for partition 3 as deployed
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PARTITION = 3;
const PARTITION_TOTAL = 4;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash | 0;
  }
  return hash;
}

async function main() {
  // Get all ready_to_deploy tickets
  const { data: tickets, error } = await supabase
    .from('correction_tickets')
    .select('id, article_id, slug')
    .eq('statut', 'ready_to_deploy')
    .limit(200);

  if (error) { console.error(error.message); return; }
  if (!tickets?.length) { console.log('Aucun ticket ready_to_deploy'); return; }

  // Filter by partition
  const myTickets = tickets.filter(t => {
    const hash = simpleHash(t.article_id || t.slug);
    return Math.abs(hash) % PARTITION_TOTAL === PARTITION;
  });

  console.log(`${tickets.length} tickets ready_to_deploy → ${myTickets.length} pour partition ${PARTITION}`);

  if (!myTickets.length) return;

  const ids = myTickets.map(t => t.id);

  const { error: updateError } = await supabase
    .from('correction_tickets')
    .update({ statut: 'deployed', deployed_at: new Date().toISOString() })
    .in('id', ids);

  if (updateError) {
    console.error('Update error:', updateError.message);
  } else {
    console.log(`✓ ${ids.length} tickets marqués deployed`);
    ids.forEach(id => console.log(' -', id.slice(0, 8)));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
