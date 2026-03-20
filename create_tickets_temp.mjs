// Create correction tickets for actionable issues found during validation
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

async function supabaseRequest(path, method, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

const BASE_DIR = 'C:/Users/robin/glp1/glp1/src/content';

function getAllMdFiles(dir, result = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fullPath = join(dir, e.name);
    if (e.isDirectory()) getAllMdFiles(fullPath, result);
    else if (e.name.endsWith('.md') || e.name.endsWith('.mdx')) result.push(fullPath);
  }
  return result;
}

function extractFrontmatter(content) {
  if (!content.startsWith('---')) return { fm: null, body: content };
  const end = content.indexOf('---', 3);
  if (end === -1) return { fm: null, body: content };
  return { fm: content.slice(3, end).trim(), body: content.slice(end + 3).trim() };
}

function parseYaml(fmText) {
  const fields = {};
  const dupKeys = [];
  const seenKeys = [];
  let currentKey = null;
  let currentVal = [];

  for (const line of fmText.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)/);
    if (m && !line.startsWith(' ') && !line.startsWith('\t')) {
      if (currentKey) {
        const v = currentVal.join('\n').trim();
        if (seenKeys.includes(currentKey)) dupKeys.push(currentKey);
        seenKeys.push(currentKey);
        if (!(currentKey in fields)) fields[currentKey] = v;
      }
      currentKey = m[1];
      currentVal = [m[2]];
    } else if (currentKey) {
      currentVal.push(line);
    }
  }
  if (currentKey) {
    const v = currentVal.join('\n').trim();
    if (seenKeys.includes(currentKey)) dupKeys.push(currentKey);
    seenKeys.push(currentKey);
    if (!(currentKey in fields)) fields[currentKey] = v;
  }
  return { fields, dupKeys };
}

// Gather tickets to create
const tickets = [];
const files = getAllMdFiles(BASE_DIR).slice(0, 100);

// Issue 1: Description too long
for (const filepath of files) {
  let content;
  try { content = readFileSync(filepath, 'utf-8'); } catch { continue; }

  const slug = basename(filepath).replace(/\.mdx?$/, '');
  const dir = basename(dirname(filepath));
  const { fm, body } = extractFrontmatter(content);
  if (!fm) continue;

  const { fields, dupKeys } = parseYaml(fm);
  const description = (fields.description || '').replace(/^["']|["']$/g, '').trim();

  // Ticket for description too long (> 160 chars)
  if (description.length > 160) {
    tickets.push({
      slug: `${dir}/${slug}`,
      title: `Description trop longue: ${slug}`,
      source_agent: 'validator',
      ticket_type: 'seo_meta_fix',
      urgence: 'low',
      before_exact: description,
      after_suggested: description.slice(0, 157) + '...',
      claim_original: `Description de ${description.length} caractères dépasse la limite de 160`,
      realite_actuelle: 'La description doit faire entre 120 et 160 caractères pour un affichage optimal dans Google',
      statut: 'approved',
    });
  }

  // Ticket for duplicate YAML keys (critical)
  if (dupKeys.length > 0) {
    tickets.push({
      slug: `${dir}/${slug}`,
      title: `Clés YAML dupliquées: ${slug}`,
      source_agent: 'validator',
      ticket_type: 'frontmatter_fix',
      urgence: 'high',
      before_exact: `Clés dupliquées: ${dupKeys.join(', ')}`,
      after_suggested: `Supprimer les clés dupliquées: ${dupKeys.join(', ')}`,
      claim_original: `Le fichier contient des clés YAML dupliquées: ${dupKeys.join(', ')}`,
      realite_actuelle: 'Les clés YAML dupliquées peuvent causer des comportements inattendus et des erreurs de build',
      statut: 'approved',
    });
  }
}

console.log(`Tickets to create: ${tickets.length}`);

// Get article IDs from Supabase for the slugs
let ticketsCreated = 0;
let ticketsFailed = 0;

for (const ticket of tickets) {
  // Try to find the article
  const searchSlug = ticket.slug.split('/').pop(); // just the slug part
  const res = await supabaseRequest(
    `articles?slug=ilike.*${encodeURIComponent(searchSlug)}*&select=id,slug&limit=5`,
    'GET'
  );

  let articleId = null;
  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    // Find best match
    const exact = res.data.find(a => a.slug === ticket.slug || a.slug.endsWith('/' + searchSlug));
    articleId = exact ? exact.id : res.data[0].id;
  }

  // Insert ticket
  const ticketPayload = {
    article_id: articleId,
    slug: ticket.slug,
    title: ticket.title,
    source_agent: ticket.source_agent,
    ticket_type: ticket.ticket_type,
    urgence: ticket.urgence,
    before_exact: ticket.before_exact,
    after_suggested: ticket.after_suggested,
    claim_original: ticket.claim_original,
    realite_actuelle: ticket.realite_actuelle,
    statut: ticket.statut,
  };

  // Try upsert with on conflict do nothing approach
  const insertRes = await supabaseRequest('correction_tickets', 'POST', ticketPayload);

  if (insertRes.ok) {
    console.log(`TICKET_CREATED: ${ticket.slug} (${ticket.ticket_type})`);
    ticketsCreated++;
  } else if (insertRes.status === 409 || (typeof insertRes.data === 'object' && insertRes.data?.code === '23505')) {
    console.log(`TICKET_EXISTS: ${ticket.slug} (${ticket.ticket_type}) - already exists, skipping`);
  } else {
    console.log(`TICKET_FAILED: ${ticket.slug}: ${JSON.stringify(insertRes.data).slice(0, 100)}`);
    ticketsFailed++;
  }
}

console.log(`\nTickets created: ${ticketsCreated}`);
console.log(`Tickets failed: ${ticketsFailed}`);
console.log(`Tickets skipped (already exist): ${tickets.length - ticketsCreated - ticketsFailed}`);
