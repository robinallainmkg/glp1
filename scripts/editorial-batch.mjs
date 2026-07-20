import 'dotenv/config';
#!/usr/bin/env node
/**
 * Editorial batch script — inserts internal links + fixes meta descriptions
 * Then updates Supabase statuses
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content');

const supabase = createClient(
  'https://ywekaivgjzsmdocchvum.supabase.co',
  process.env.SUPABASE_ANON_KEY
);

// Build slug→filepath index once
function buildSlugIndex() {
  const index = {};
  const dirs = fs.readdirSync(CONTENT_DIR);
  for (const dir of dirs) {
    const dirPath = path.join(CONTENT_DIR, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const slugMatch = content.match(/^slug:\s*["']?([^"'\n]+)["']?/m);
      if (slugMatch) {
        index[slugMatch[1].trim()] = filePath;
      }
      // Also index by filename without .md
      const baseName = file.replace('.md', '');
      if (!index[baseName]) index[baseName] = filePath;
    }
  }
  return index;
}

const slugIndex = buildSlugIndex();
console.log(`Index: ${Object.keys(slugIndex).length} articles indexés`);

// Find article file by slug (handles collection/slug format)
function findArticleFile(slug) {
  // Direct match
  if (slugIndex[slug]) return slugIndex[slug];
  // Strip collection prefix (e.g., "glp1-cout/prix-ozempic" → "prix-ozempic")
  if (slug.includes('/')) {
    const bareSlug = slug.split('/').pop();
    if (slugIndex[bareSlug]) return slugIndex[bareSlug];
  }
  return null;
}

// ===== INTERNAL LINKS =====
async function insertInternalLinks() {
  console.log('\n=== INSERTION LIENS INTERNES ===');

  const { data: links, error } = await supabase
    .from('internal_link_suggestions')
    .select('*')
    .eq('status', 'approved')
    .order('priority', { ascending: false })
    .limit(80);

  if (error) { console.error('Erreur fetch liens:', error); return 0; }
  console.log(`${links.length} liens approuvés à insérer`);

  let inserted = 0;
  let skipped = 0;
  const updatedIds = [];

  for (const link of links) {
    const filePath = findArticleFile(link.source_slug);
    if (!filePath) {
      console.log(`  SKIP: fichier non trouvé pour ${link.source_slug}`);
      skipped++;
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const targetUrl = `/${link.target_slug}/`;

    // Skip if link already exists in the file
    if (content.includes(targetUrl)) {
      console.log(`  SKIP: lien vers ${link.target_slug} déjà présent dans ${link.source_slug}`);
      skipped++;
      updatedIds.push(link.id); // Mark as applied anyway
      continue;
    }

    const anchor = link.anchor_text;
    if (!anchor) { skipped++; continue; }

    // Split into frontmatter and body
    const fmEnd = content.indexOf('---', content.indexOf('---') + 3);
    if (fmEnd === -1) { skipped++; continue; }
    const frontmatter = content.substring(0, fmEnd + 3);
    let body = content.substring(fmEnd + 3);

    // Find anchor text in body — simple case-insensitive search
    const escapedAnchor = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const simpleRegex = new RegExp(escapedAnchor, 'i');
    const simpleMatch = body.match(simpleRegex);

    if (!simpleMatch) {
      console.log(`  SKIP: ancre "${anchor}" non trouvée dans ${link.source_slug}`);
      skipped++;
      continue;
    }

    // Check if already inside an <a> tag or markdown link
    const idx = simpleMatch.index;
    const before = body.substring(Math.max(0, idx - 200), idx);
    const after = body.substring(idx, Math.min(body.length, idx + anchor.length + 200));

    // Skip if inside <a>...</a> or [...](...)
    const openA = before.lastIndexOf('<a ');
    const closeA = before.lastIndexOf('</a>');
    if (openA > closeA) {
      console.log(`  SKIP: ancre "${anchor}" déjà linkée (HTML) dans ${link.source_slug}`);
      skipped++;
      updatedIds.push(link.id);
      continue;
    }
    const openBracket = before.lastIndexOf('[');
    const closeBracket = before.lastIndexOf(']');
    if (openBracket > closeBracket && after.includes('](')) {
      console.log(`  SKIP: ancre "${anchor}" déjà linkée (MD) dans ${link.source_slug}`);
      skipped++;
      updatedIds.push(link.id);
      continue;
    }

    // Insert the link
    body = body.substring(0, simpleMatch.index) +
           `<a href="${targetUrl}">${simpleMatch[0]}</a>` +
           body.substring(simpleMatch.index + simpleMatch[0].length);

    fs.writeFileSync(filePath, frontmatter + body, 'utf-8');
    console.log(`  ✅ ${link.source_slug} → ${link.target_slug} (ancre: "${anchor}")`);
    inserted++;
    updatedIds.push(link.id);
  }

  // Update status in Supabase
  if (updatedIds.length > 0) {
    const batchSize = 50;
    for (let i = 0; i < updatedIds.length; i += batchSize) {
      const batch = updatedIds.slice(i, i + batchSize);
      const { error: updateError } = await supabase
        .from('internal_link_suggestions')
        .update({ status: 'applied', updated_at: new Date().toISOString() })
        .in('id', batch);
      if (updateError) console.error('Erreur update statut:', updateError);
    }
  }

  console.log(`\nRésultat liens: ${inserted} insérés, ${skipped} skippés, ${updatedIds.length} marqués applied`);
  return inserted;
}

// ===== META DESCRIPTIONS =====
async function fixMetaDescriptions() {
  console.log('\n=== FIX META DESCRIPTIONS ===');

  const { data: tickets, error } = await supabase
    .from('correction_tickets')
    .select('*')
    .eq('statut', 'approved')
    .eq('ticket_type', 'missing_description')
    .order('created_at', { ascending: true })
    .limit(25);

  if (error) { console.error('Erreur fetch tickets:', error); return 0; }
  console.log(`${tickets.length} tickets meta description`);

  let fixed = 0;
  const fixedIds = [];

  for (const ticket of tickets) {
    const slug = ticket.slug;
    const filePath = findArticleFile(slug);
    if (!filePath) {
      console.log(`  SKIP: fichier non trouvé pour ${slug}`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Extract frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    let fm = fmMatch[1];

    // Check if description exists
    const descMatch = fm.match(/^description:\s*["']?(.*?)["']?\s*$/m);

    if (!descMatch || !descMatch[1] || descMatch[1].trim() === '') {
      // Missing description — generate from title + mainKeyword
      const titleMatch = fm.match(/^title:\s*["']?(.*?)["']?\s*$/m);
      const kwMatch = fm.match(/^mainKeyword:\s*["']?(.*?)["']?\s*$/m);
      const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ');
      const kw = kwMatch ? kwMatch[1] : '';

      // Generate a description under 160 chars
      let desc = title;
      if (kw && !title.toLowerCase().includes(kw.toLowerCase())) {
        desc = `${kw} : ${title}`;
      }
      desc = `${desc}. Guide complet, avis et informations vérifiées.`;
      if (desc.length > 160) desc = desc.substring(0, 157) + '...';

      // Add description to frontmatter
      if (fm.includes('description:')) {
        fm = fm.replace(/^description:\s*["']?\s*["']?\s*$/m, `description: "${desc}"`);
      } else {
        fm = fm.replace(/^(title:.*)$/m, `$1\ndescription: "${desc}"`);
      }

      content = content.replace(/^---\n[\s\S]*?\n---/, `---\n${fm}\n---`);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✅ ${slug}: description ajoutée (${desc.length} car.)`);
      fixed++;
      fixedIds.push(ticket.id);
    } else if (descMatch[1].length > 160) {
      // Description too long — truncate
      let desc = descMatch[1].substring(0, 157) + '...';
      fm = fm.replace(/^description:\s*["']?.*?["']?\s*$/m, `description: "${desc}"`);
      content = content.replace(/^---\n[\s\S]*?\n---/, `---\n${fm}\n---`);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✅ ${slug}: description raccourcie (${desc.length} car.)`);
      fixed++;
      fixedIds.push(ticket.id);
    } else {
      console.log(`  SKIP: ${slug} description OK (${descMatch[1].length} car.)`);
      fixedIds.push(ticket.id);
    }
  }

  // Update ticket status
  if (fixedIds.length > 0) {
    const { error: updateError } = await supabase
      .from('correction_tickets')
      .update({ statut: 'deployed', updated_at: new Date().toISOString() })
      .in('id', fixedIds);
    if (updateError) console.error('Erreur update tickets:', updateError);
  }

  console.log(`\nRésultat meta: ${fixed} fixées, ${fixedIds.length} tickets traités`);
  return fixed;
}

// ===== MAIN =====
async function main() {
  console.log('🚀 Editorial Batch — Début');
  console.log('Date:', new Date().toISOString());

  const linksInserted = await insertInternalLinks();
  const metaFixed = await fixMetaDescriptions();

  console.log('\n=== RÉSUMÉ ===');
  console.log(`Liens internes insérés: ${linksInserted}`);
  console.log(`Meta descriptions fixées: ${metaFixed}`);
  console.log('✅ Batch terminé');
}

main().catch(console.error);
