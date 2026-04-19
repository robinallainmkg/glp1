#!/usr/bin/env node
/**
 * Purge old analytics metrics from Supabase to keep disk IO manageable.
 *
 * Deletes:
 *   - gsc_metrics older than 90 days
 *   - ga_metrics older than 90 days
 *
 * Usage:
 *   node scripts/maintenance/purge-old-metrics.mjs [--dry-run] [--days 90]
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const DRY_RUN = process.argv.includes('--dry-run');
const daysIdx = process.argv.indexOf('--days');
const RETENTION_DAYS = daysIdx >= 0 ? parseInt(process.argv[daysIdx + 1]) : 90;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

if (!process.env.SUPABASE_URL) {
  console.error('Missing SUPABASE_URL');
  process.exit(1);
}

const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
console.log(`[purge] Retention: ${RETENTION_DAYS} days — deleting rows before ${cutoff}${DRY_RUN ? ' (DRY-RUN)' : ''}`);

async function purgeTable(table, dateCol) {
  if (DRY_RUN) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true }).lt(dateCol, cutoff);
    if (error) { console.error(`[purge] ${table} count error:`, error.message); return; }
    console.log(`[purge] ${table}: would delete ${count} rows`);
    return;
  }
  const { error } = await supabase.from(table).delete().lt(dateCol, cutoff);
  if (error) { console.error(`[purge] ${table} error:`, error.message); return; }
  console.log(`[purge] ${table}: deleted rows before ${cutoff}`);
}

await purgeTable('gsc_metrics', 'date');
await purgeTable('ga_metrics', 'date');

console.log('[purge] done');
