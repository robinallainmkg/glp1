#!/usr/bin/env node
/**
 * Fix tickets sync_issue pour partition 3/4
 * - "Fichier sur disque mais absent en base" → upsert articles
 * - "Marqué actif mais fichier absent" → set is_active=false
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PARTITION = 3;
const PARTITION_TOTAL = 4;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const PROJECT_ROOT = path.resolve(process.cwd());
const CONTENT_DIR = path.join(PROJECT_ROOT, 'src', 'content');

function log(msg) { console.log(`[sync-fix-p${PARTITION}] ${msg}`); }
function err(msg) { console.error(`[sync-fix-p${PARTITION}] ❌ ${msg}`); }

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash | 0;
  }
  return hash;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  });
  return fm;
}

async function findContentFile(slug) {
  // Le slug peut contenir un slash (ex: effets-secondaires-glp1/glp1-gastroparesie...)
  const parts = slug.split('/');
  const baseSlug = parts[parts.length - 1];
  const collection = parts.length > 1 ? parts[0] : null;

  const patterns = collection
    ? [`${CONTENT_DIR}/${collection}/${baseSlug}.md`]
    : [`${CONTENT_DIR}/**/${baseSlug}.md`];

  for (const pattern of patterns) {
    const files = await glob(pattern.replace(/\\/g, '/'));
    if (files.length > 0) return files[0];
  }
  // Try without collection prefix
  const files2 = await glob(`${CONTENT_DIR.replace(/\\/g, '/')}/**/${baseSlug}.md`);
  if (files2.length > 0) return files2[0];
  return null;
}

async function main() {
  // Fetch sync_issue tickets (approved)
  const { data: allTickets, error } = await supabase
    .from('correction_tickets')
    .select('id, article_id, slug, ticket_type, before_exact, after_suggested, source_agent')
    .eq('ticket_type', 'sync_issue')
    .in('statut', ['approved', 'ready_to_deploy'])
    .limit(100);

  if (error) { err(error.message); return; }
  if (!allTickets?.length) { log('Aucun ticket sync_issue'); return; }

  // Filter by partition
  const tickets = allTickets.filter(t => {
    const hash = simpleHash(t.article_id || t.slug);
    return Math.abs(hash) % PARTITION_TOTAL === PARTITION;
  });

  log(`${allTickets.length} tickets sync_issue → ${tickets.length} pour partition ${PARTITION}`);

  for (const ticket of tickets) {
    const before = ticket.before_exact || '';
    log(`\nTicket ${ticket.id.slice(0,8)}: ${ticket.slug}`);

    if (before.startsWith('Fichier sur disque mais absent en base')) {
      // Need to upsert into articles table
      const slug = ticket.slug;
      const filePath = await findContentFile(slug);

      if (!filePath) {
        log(`  Fichier introuvable: ${slug}`);
        await supabase.from('correction_tickets')
          .update({ statut: 'rejected', after_final: 'Fichier introuvable sur disque' })
          .eq('id', ticket.id);
        continue;
      }

      const content = readFileSync(filePath, 'utf-8');
      const fm = extractFrontmatter(content);
      const title = fm.title || fm.seoTitle || slug;
      const collectionMatch = filePath.match(/src[/\\]content[/\\]([^/\\]+)/);
      const collection = collectionMatch ? collectionMatch[1] : 'traitements-glp1';
      const baseSlug = slug.split('/').pop();

      const { error: upsertError } = await supabase.from('articles').upsert({
        slug: baseSlug,
        collection,
        title,
        content,
        is_active: true,
      }, { onConflict: 'slug', ignoreDuplicates: false });

      if (upsertError) {
        err(`Upsert article ${slug}: ${upsertError.message}`);
      } else {
        log(`  ✓ Article inséré en base: ${title} (${collection}/${baseSlug})`);
        await supabase.from('correction_tickets')
          .update({ statut: 'ready_to_deploy', after_final: `Article indexé: ${collection}/${baseSlug}` })
          .eq('id', ticket.id);
      }

    } else if (before.includes('marqué actif en Supabase mais fichier absent')) {
      // Set is_active=false for this article
      const slug = ticket.slug.split('/').pop();
      const { error: updateError } = await supabase.from('articles')
        .update({ is_active: false })
        .eq('slug', slug);

      if (updateError) {
        err(`Update is_active ${slug}: ${updateError.message}`);
      } else {
        log(`  ✓ Article désactivé: ${slug}`);
        await supabase.from('correction_tickets')
          .update({ statut: 'ready_to_deploy', after_final: `Article désactivé (fichier absent): ${slug}` })
          .eq('id', ticket.id);
      }

    } else {
      log(`  Sync issue non reconnu: ${before.slice(0, 80)}`);
    }
  }

  log('\n✓ Sync fixes terminés');
}

main().catch(e => { console.error(e); process.exit(1); });
