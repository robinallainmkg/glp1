import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await sb.from('articles').select('id, slug').limit(10);
if (error) { console.error(error); process.exit(1); }
console.log('Sample articles:', JSON.stringify(data, null, 2));
