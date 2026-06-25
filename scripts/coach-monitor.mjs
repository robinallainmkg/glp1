import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMonitoring() {
  console.log('=== MONITORING COACH IA - 25 juin 2026 ===\n');

  // 1. Volume global 24h
  const { data: vol24, error: e1 } = await supabase.rpc('execute_sql', {
    sql: `SELECT count(*) as messages, count(DISTINCT conversation_id) as conversations,
      count(CASE WHEN role = 'user' THEN 1 END) as user_msgs
      FROM coach_messages WHERE created_at > now() - interval '24 hours'`
  });
  
  if (e1) {
    // Fallback: use table queries
    console.log('Note: execute_sql RPC not available, using table queries');
  }

  // Volume 24h via table query
  const { data: msgs24, error: em1 } = await supabase
    .from('coach_messages')
    .select('id, conversation_id, role, model, intent, created_at, content')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  
  if (em1) {
    console.error('Error fetching messages:', em1);
    return;
  }

  console.log('--- VOLUME 24H ---');
  const total = msgs24?.length || 0;
  const convIds = new Set(msgs24?.map(m => m.conversation_id));
  const userMsgs = msgs24?.filter(m => m.role === 'user').length;
  const assistantMsgs = msgs24?.filter(m => m.role === 'assistant').length;
  console.log(`Messages totaux: ${total}`);
  console.log(`Conversations distinctes: ${convIds.size}`);
  console.log(`Messages user: ${userMsgs}`);
  console.log(`Messages assistant: ${assistantMsgs}`);
  console.log(`Msgs/conv moyenne: ${convIds.size > 0 ? (total / convIds.size).toFixed(1) : 0}`);

  // LLM vs Fallback
  console.log('\n--- LLM vs FALLBACK ---');
  const modelCounts = {};
  msgs24?.filter(m => m.role === 'assistant').forEach(m => {
    const model = m.model || 'null';
    modelCounts[model] = (modelCounts[model] || 0) + 1;
  });
  Object.entries(modelCounts).sort(([,a],[,b]) => b - a).forEach(([model, count]) => {
    console.log(`${model}: ${count}`);
  });

  // Intent breakdown
  console.log('\n--- INTENTS ---');
  const intentCounts = {};
  msgs24?.filter(m => m.role === 'assistant').forEach(m => {
    const intent = m.intent || 'null';
    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
  });
  Object.entries(intentCounts).sort(([,a],[,b]) => b - a).forEach(([intent, count]) => {
    console.log(`${intent}: ${count}`);
  });

  // Conversations engagement
  console.log('\n--- CONVERSATIONS (msgs par conv) ---');
  const convMsgCount = {};
  const convTimes = {};
  msgs24?.forEach(m => {
    convMsgCount[m.conversation_id] = (convMsgCount[m.conversation_id] || 0) + 1;
    if (!convTimes[m.conversation_id]) convTimes[m.conversation_id] = { min: m.created_at, max: m.created_at };
    else {
      if (m.created_at < convTimes[m.conversation_id].min) convTimes[m.conversation_id].min = m.created_at;
      if (m.created_at > convTimes[m.conversation_id].max) convTimes[m.conversation_id].max = m.created_at;
    }
  });
  const sortedConvs = Object.entries(convMsgCount).sort(([,a],[,b]) => b - a);
  sortedConvs.forEach(([id, count]) => {
    const times = convTimes[id];
    const dur = times ? Math.round((new Date(times.max) - new Date(times.min)) / 1000) : 0;
    console.log(`${id.slice(0,8)}: ${count} msgs, durée ${dur}s`);
  });

  // Veille comparison
  const { data: msgs48, error: em2 } = await supabase
    .from('coach_messages')
    .select('id, created_at')
    .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  console.log('\n--- COMPARAISON VEILLE ---');
  console.log(`Aujourd\'hui (24h): ${total} messages`);
  console.log(`Hier (24h-48h): ${msgs48?.length || 0} messages`);
  const diff = total - (msgs48?.length || 0);
  const pct = msgs48?.length > 0 ? ((diff / msgs48.length) * 100).toFixed(0) : 'N/A';
  console.log(`Évolution: ${diff > 0 ? '+' : ''}${diff} (${pct}%)`);

  // Full conversations for quality analysis
  console.log('\n=== CONVERSATIONS COMPLÈTES 24H ===');
  const allMsgs = msgs24 || [];
  
  // Group by conversation
  const convMap = {};
  allMsgs.forEach(m => {
    if (!convMap[m.conversation_id]) convMap[m.conversation_id] = [];
    convMap[m.conversation_id].push(m);
  });
  
  // Sort by time
  Object.values(convMap).forEach(msgs => msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
  
  // Output full conversations
  Object.entries(convMap).forEach(([convId, msgs]) => {
    console.log(`\n=== CONV ${convId.slice(0,8)} (${msgs.length} msgs) ===`);
    msgs.forEach(m => {
      console.log(`[${m.role.toUpperCase()}] model=${m.model||'n/a'} intent=${m.intent||'n/a'}`);
      console.log(m.content?.slice(0, 400) || '');
      console.log('---');
    });
  });

  return { total, convIds: convIds.size, yesterday: msgs48?.length || 0, modelCounts, intentCounts, convMap };
}

runMonitoring().catch(console.error);
