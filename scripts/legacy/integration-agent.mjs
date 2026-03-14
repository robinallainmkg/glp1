#!/usr/bin/env node

/**
 * Agent Integration — Applique les corrections validees aux fichiers markdown.
 *
 * Workflow :
 *   1. Lit les tickets correction_tickets avec statut 'ready_to_deploy'
 *   2. Trouve le fichier markdown de l'article dans le repo
 *   3. Remplace before_exact par after_final (ou after_suggested en fallback)
 *   4. Commit + push sur branche claude/fix-[ticket_id_short]
 *   5. Cree une PR GitHub via gh CLI
 *   6. Met a jour le ticket avec statut -> 'deployed'
 *
 * Usage :
 *   node scripts/integration-agent.mjs --local                     # modifie les fichiers, pas de git (recommande)
 *   node scripts/integration-agent.mjs --local --ticket-id UUID    # un seul ticket, mode local
 *   node scripts/integration-agent.mjs --limit 5                   # 5 tickets max (mode GitHub Actions)
 *   node scripts/integration-agent.mjs --ticket-id UUID            # un seul ticket (mode GitHub Actions)
 *   node scripts/integration-agent.mjs --dry-run                   # simule sans modifier les fichiers
 *
 * Secrets requis :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   GITHUB_TOKEN (pour creer les PR)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { glob } from 'glob';
import { createClient } from '@supabase/supabase-js';

// --- Configuration ---

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BASE_BRANCH = 'production';

// Parse CLI arguments
const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const ticketIdIndex = args.indexOf('--ticket-id');
const LIMIT = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 0;
const SINGLE_TICKET_ID = ticketIdIndex !== -1 ? args[ticketIdIndex + 1] : null;
const DRY_RUN = args.includes('--dry-run');
const LOCAL_MODE = args.includes('--local');

// --- Validate environment ---

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.PRIVATEHERE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}

if (!GITHUB_TOKEN && !DRY_RUN && !LOCAL_MODE) {
  console.error('GITHUB_TOKEN requis pour creer les PR (ou utilisez --dry-run / --local)');
  process.exit(1);
}

// --- Client Supabase ---

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// --- Functions ---

function git(command) {
  return execSync(`git ${command}`, { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
}

/**
 * Trouve le fichier markdown source d'un article par son slug.
 */
async function findArticleFile(slug) {
  const parts = slug.split('/');

  if (parts[0] === 'astro-pages') {
    const astroPath = parts.slice(1).join('/') + '.astro';
    const fullPath = path.join(PROJECT_ROOT, 'src/pages', astroPath);
    if (fs.existsSync(fullPath)) return fullPath;
    return null;
  }

  // Markdown article: src/content/{collection}/{name}.md
  const collection = parts[0];
  const name = parts.slice(1).join('/');
  const fullPath = path.join(PROJECT_ROOT, 'src/content', collection, name + '.md');
  if (fs.existsSync(fullPath)) return fullPath;

  // Fallback: glob search
  const matches = await glob(`src/content/**/${name}.md`, { cwd: PROJECT_ROOT });
  if (matches.length > 0) return path.join(PROJECT_ROOT, matches[0]);

  return null;
}

/**
 * Recupere les tickets ready_to_deploy.
 */
async function fetchTickets() {
  let query = supabase
    .from('correction_tickets')
    .select('*')
    .eq('statut', 'ready_to_deploy')
    .order('urgence', { ascending: true })
    .order('created_at', { ascending: true });

  if (SINGLE_TICKET_ID) {
    query = supabase
      .from('correction_tickets')
      .select('*')
      .eq('id', SINGLE_TICKET_ID);
  }

  if (LIMIT > 0) {
    query = query.limit(LIMIT);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Erreur recuperation tickets:', error.message);
    process.exit(1);
  }
  return data || [];
}

/**
 * Traite un ticket : applique la correction au fichier markdown.
 */
async function processTicket(ticket) {
  const startTime = Date.now();
  const ticketShort = ticket.id.substring(0, 8);
  const branchName = `claude/fix-${ticketShort}`;

  // Log start
  await supabase.from('agent_logs').insert({
    agent_type: 'integration',
    article_id: ticket.article_id,
    status: 'started',
    metadata: { slug: ticket.slug, ticket_id: ticket.id, branch: branchName, dry_run: DRY_RUN }
  });

  try {
    // 1. Find the source file
    const filePath = await findArticleFile(ticket.slug);
    if (!filePath) {
      throw new Error(`Fichier non trouve pour slug: ${ticket.slug}`);
    }

    const relativePath = path.relative(PROJECT_ROOT, filePath);

    // 2. Read file and determine replacement text
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const replacement = ticket.after_final || ticket.after_suggested;
    if (!replacement) {
      throw new Error('Ni after_final ni after_suggested disponible pour le remplacement');
    }

    // 3. Check if correction is already applied
    if (fileContent.includes(replacement)) {
      console.log(`  Correction deja presente dans ${relativePath} — marquage deployed`);

      await supabase
        .from('correction_tickets')
        .update({ statut: 'deployed', deployed_at: new Date().toISOString() })
        .eq('id', ticket.id);

      const durationMs = Date.now() - startTime;
      await supabase.from('agent_logs').insert({
        agent_type: 'integration',
        article_id: ticket.article_id,
        status: 'success',
        duration_ms: durationMs,
        metadata: { slug: ticket.slug, ticket_id: ticket.id, file: relativePath, already_applied: true, local: LOCAL_MODE }
      });

      return { id: ticket.id, slug: ticket.slug, file: relativePath, already_applied: true };
    }

    // 4. Find and replace — exact match, then fuzzy match
    let newContent = null;

    // Strip markdown for comparison: **bold**, *italic*, - list items, ### headers
    const stripMd = s => s.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
                          .replace(/^[-*]\s+/gm, '')
                          .replace(/^#{1,6}\s+/gm, '');
    const normalize = s => stripMd(s).replace(/\s+/g, ' ').trim();

    console.log(`  before_exact (${ticket.before_exact.length} chars): "${ticket.before_exact.substring(0, 80)}..."`);

    if (fileContent.includes(ticket.before_exact)) {
      // Exact match
      console.log('  → Match exact');
      newContent = fileContent.replace(ticket.before_exact, replacement);
    } else {
      // Fuzzy: find a line/block in the file that matches after stripping markdown
      const needle = normalize(ticket.before_exact);
      console.log(`  → Pas de match exact, recherche normalisee: "${needle.substring(0, 80)}..."`);
      const lines = fileContent.split('\n');

      // Sliding window over lines (1 to 10 lines)
      for (let i = 0; i < lines.length; i++) {
        let window = '';
        for (let j = i; j < lines.length && j < i + 10; j++) {
          window += (j > i ? '\n' : '') + lines[j];
          if (normalize(window).includes(needle)) {
            const fullWindow = lines.slice(i, j + 1).join('\n');
            newContent = fileContent.replace(fullWindow, replacement);
            console.log(`  → Match normalise trouve (lignes ${i + 1}-${j + 1}): "${fullWindow.substring(0, 80)}..."`);
            break;
          }
        }
        if (newContent) break;
      }

      if (!newContent) {
        // Log nearby content to help debug
        const needleWords = needle.split(' ').slice(0, 4).join(' ');
        const nearLines = lines.map((l, i) => [l, i]).filter(([l]) => l.toLowerCase().includes(needleWords.toLowerCase().split(' ')[0]));
        if (nearLines.length > 0) {
          console.error(`  Lignes proches trouvees :`);
          nearLines.forEach(([l, i]) => console.error(`    L${i + 1}: ${l.substring(0, 120)}`));
        }
        throw new Error(`before_exact non trouve dans ${relativePath}. Ni exact ni normalise.`);
      }
    }

    if (newContent === fileContent) {
      throw new Error('Le remplacement n\'a produit aucun changement');
    }

    if (DRY_RUN) {
      console.log(`  [DRY-RUN] Remplacement dans ${relativePath}`);
      console.log(`  [DRY-RUN] before_exact (${ticket.before_exact.length} chars) -> replacement (${replacement.length} chars)`);

      const durationMs = Date.now() - startTime;
      await supabase.from('agent_logs').insert({
        agent_type: 'integration',
        article_id: ticket.article_id,
        status: 'success',
        duration_ms: durationMs,
        metadata: { slug: ticket.slug, ticket_id: ticket.id, dry_run: true, file: relativePath }
      });

      return { id: ticket.id, slug: ticket.slug, file: relativePath, dry_run: true };
    }

    // 5a. Mode local : modifier le fichier, pas de git
    if (LOCAL_MODE) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`  [LOCAL] Fichier modifie : ${relativePath}`);

      // Update ticket status
      await supabase
        .from('correction_tickets')
        .update({
          statut: 'deployed',
          deployed_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      const durationMs = Date.now() - startTime;
      await supabase.from('agent_logs').insert({
        agent_type: 'integration',
        article_id: ticket.article_id,
        status: 'success',
        duration_ms: durationMs,
        metadata: {
          slug: ticket.slug,
          ticket_id: ticket.id,
          file: relativePath,
          local: true
        }
      });

      return { id: ticket.id, slug: ticket.slug, file: relativePath, local: true };
    }

    // 5b. Mode GitHub Actions : branch, commit, push, PR
    // Save current branch to restore later
    const currentBranch = git('rev-parse --abbrev-ref HEAD');

    // Ensure we start from latest production
    git(`fetch origin ${BASE_BRANCH}`);
    git(`checkout -b ${branchName} origin/${BASE_BRANCH}`);

    // Write the modified file
    fs.writeFileSync(filePath, newContent, 'utf8');

    // Stage and commit
    git(`add "${relativePath}"`);
    const commitMsg = `fix: correction ${ticket.ticket_type} — ${ticket.slug}\n\nTicket: ${ticket.id}\nType: ${ticket.ticket_type}\nUrgence: ${ticket.urgence}\n\nReplacement automatique via integration-agent.`;
    // Use a temp file for the commit message to avoid shell escaping issues
    const commitMsgPath = path.join(PROJECT_ROOT, '.git', 'INTEGRATION_COMMIT_MSG');
    fs.writeFileSync(commitMsgPath, commitMsg, 'utf8');
    git(`commit -F "${commitMsgPath}"`);
    fs.unlinkSync(commitMsgPath);

    // Push
    git(`push origin ${branchName}`);

    // 6. Create PR via GitHub API
    const repoSlug = getRepoSlug();
    const prTitle = `[Auto] Correction ${ticket.ticket_type}: ${ticket.title || ticket.slug}`;
    const prBody = [
      `## Correction automatique`,
      ``,
      `**Ticket:** \`${ticket.id}\``,
      `**Article:** ${ticket.title} (\`${ticket.slug}\`)`,
      `**Type:** ${ticket.ticket_type}`,
      `**Urgence:** ${ticket.urgence}`,
      ``,
      `### Diff`,
      ``,
      `**Avant :**`,
      '```',
      ticket.before_exact,
      '```',
      ``,
      `**Apres :**`,
      '```',
      replacement,
      '```',
      ``,
      ticket.source_reference ? `**Source :** ${ticket.source_reference}` : '',
      ``,
      `---`,
      `Genere par \`integration-agent.mjs\``,
    ].filter(Boolean).join('\n');

    const prUrl = await createPR(repoSlug, branchName, BASE_BRANCH, prTitle, prBody);

    // 7. Return to original branch
    git(`checkout ${currentBranch}`);

    // 8. Update ticket status
    await supabase
      .from('correction_tickets')
      .update({
        statut: 'deployed',
        deployed_at: new Date().toISOString()
      })
      .eq('id', ticket.id);

    const durationMs = Date.now() - startTime;
    await supabase.from('agent_logs').insert({
      agent_type: 'integration',
      article_id: ticket.article_id,
      status: 'success',
      duration_ms: durationMs,
      metadata: {
        slug: ticket.slug,
        ticket_id: ticket.id,
        branch: branchName,
        file: relativePath,
        pr_url: prUrl
      }
    });

    return { id: ticket.id, slug: ticket.slug, file: relativePath, branch: branchName, pr_url: prUrl };

  } catch (err) {
    const durationMs = Date.now() - startTime;

    // Try to clean up: go back to original branch
    try {
      const currentBranch = git('rev-parse --abbrev-ref HEAD');
      if (currentBranch.startsWith('claude/fix-')) {
        git('checkout production');
        git(`branch -D ${currentBranch}`);
      }
    } catch (_) {
      // Cleanup failed, ignore
    }

    await supabase.from('agent_logs').insert({
      agent_type: 'integration',
      article_id: ticket.article_id,
      status: 'error',
      duration_ms: durationMs,
      error: err.message,
      metadata: { slug: ticket.slug, ticket_id: ticket.id }
    });

    console.error(`  ${ticket.slug}: ${err.message}`);
    return { id: ticket.id, slug: ticket.slug, error: err.message };
  }
}

/**
 * Detecte le slug du repo GitHub (owner/repo).
 */
function getRepoSlug() {
  const remoteUrl = git('remote get-url origin');
  // Handle HTTPS: https://github.com/owner/repo.git
  const httpsMatch = remoteUrl.match(/github\.com\/([^/]+\/[^/.]+)/);
  if (httpsMatch) return httpsMatch[1];
  // Handle SSH: git@github.com:owner/repo.git
  const sshMatch = remoteUrl.match(/github\.com:([^/]+\/[^/.]+)/);
  if (sshMatch) return sshMatch[1];
  throw new Error(`Impossible de parser le remote URL: ${remoteUrl}`);
}

/**
 * Cree une Pull Request via l'API GitHub.
 */
async function createPR(repoSlug, head, base, title, body) {
  const response = await fetch(`https://api.github.com/repos/${repoSlug}/pulls`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, body, head, base })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur creation PR (${response.status}): ${errText}`);
  }

  const pr = await response.json();
  return pr.html_url;
}

// --- Main ---

async function main() {
  console.log('Agent Integration GLP1');
  console.log(`   Base branch : ${BASE_BRANCH}`);
  if (LOCAL_MODE) console.log('   Mode : LOCAL (modification fichier, pas de git)');
  if (DRY_RUN) console.log('   Mode : DRY-RUN (aucune modification)');
  if (SINGLE_TICKET_ID) console.log(`   Ticket cible : ${SINGLE_TICKET_ID}`);
  if (LIMIT > 0) console.log(`   Limite : ${LIMIT} tickets`);
  console.log('');

  // 1. Fetch tickets
  const tickets = await fetchTickets();
  console.log(`${tickets.length} ticket(s) a deployer\n`);

  if (tickets.length === 0) {
    console.log('Aucun ticket a deployer');
    return;
  }

  // 2. Process each ticket sequentially
  const results = [];
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    console.log(`[${i + 1}/${tickets.length}] ${ticket.slug} — ${ticket.ticket_type} (${ticket.urgence})`);

    const result = await processTicket(ticket);
    results.push(result);

    if (!result.error) {
      if (result.dry_run) {
        console.log(`  [DRY-RUN] OK — ${result.file}`);
      } else if (result.local) {
        console.log(`  [LOCAL] OK — ${result.file}`);
      } else {
        console.log(`  OK — PR: ${result.pr_url}`);
      }
    }
  }

  // 3. Summary
  const successful = results.filter(r => !r.error);
  const errors = results.filter(r => r.error);

  console.log('\n---');
  console.log(`Deployes    : ${successful.length}`);
  console.log(`Erreurs     : ${errors.length}`);
  if (!DRY_RUN && successful.length > 0) {
    console.log('\nPR creees :');
    successful.filter(r => r.pr_url).forEach(r => console.log(`  ${r.slug} → ${r.pr_url}`));
  }
  console.log('---');

  // 4. Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const output = [
      `total=${tickets.length}`,
      `deployed=${successful.length}`,
      `errors=${errors.length}`
    ].join('\n');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, output + '\n');
  }

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
