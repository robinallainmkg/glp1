import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ywekaivgjzsmdocchvum.supabase.co',
  process.env.SUPABASE_ANON_KEY
);

// Check exact timestamps of last messages
const { data: lastMsgs } = await supabase
  .from('coach_messages')
  .select('id, conversation_id, role, model, intent, created_at, content')
  .order('created_at', { ascending: false })
  .limit(30);

console.log('=== LAST 30 MESSAGES ===');
lastMsgs?.forEach(m => {
  console.log(`${m.created_at} [${m.role}] model=${m.model||'n/a'} intent=${m.intent||'n/a'}`);
  console.log(`  ${m.content?.slice(0, 150)}`);
});

// Get message counts per day last 7 days
const { data: weekMsgs } = await supabase
  .from('coach_messages')
  .select('created_at, role, model, conversation_id, content, intent')
  .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  .order('created_at', { ascending: true });

console.log('\n=== MESSAGES PAR JOUR (7 derniers jours) ===');
const byDay = {};
weekMsgs?.forEach(m => {
  const day = m.created_at.split('T')[0];
  byDay[day] = (byDay[day] || 0) + 1;
});
Object.entries(byDay).forEach(([day, count]) => console.log(`${day}: ${count} messages`));

// Full conversations last 48h for quality analysis
const { data: msgs48h } = await supabase
  .from('coach_messages')
  .select('id, conversation_id, role, model, intent, created_at, content')
  .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
  .order('conversation_id')
  .order('created_at');

console.log('\n=== CONVERSATIONS COMPLÈTES 48H ===');
const convMap = {};
msgs48h?.forEach(m => {
  if (!convMap[m.conversation_id]) convMap[m.conversation_id] = [];
  convMap[m.conversation_id].push(m);
});

Object.entries(convMap).forEach(([convId, msgs]) => {
  console.log(`\n--- CONV ${convId} (${msgs.length} msgs) ---`);
  msgs.forEach(m => {
    const time = new Date(m.created_at).toLocaleTimeString('fr-FR');
    console.log(`[${time}] [${m.role.toUpperCase()}] model=${m.model||'n/a'} intent=${m.intent||'n/a'}`);
    console.log(m.content || '(vide)');
    console.log('');
  });
});

