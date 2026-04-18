import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { execSync } from 'child_process';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const CONTENT_DIR = 'C:/Users/robin/glp1/glp1/src/content';
const PROJECT_DIR = 'C:/Users/robin/glp1/glp1';
const PARTITION = 3;

function getPartition(uuid) {
  if (!uuid) return -1;
  const hex = uuid.replace(/-/g, '').slice(0, 8);
  const num = BigInt('0x' + hex);
  return Number(num % 4n);
}

async function findContentFile(slug) {
  const base = slug.split('/').pop();
  const patterns = [
    `${CONTENT_DIR}/**/${base}.md`,
    `${CONTENT_DIR}/${slug}.md`,
  ];
  for (const pattern of patterns) {
    const files = await glob(pattern.replace(/\\/g, '/'));
    if (files.length > 0) return files[0].replace(/\\/g, '/');
  }
  return null;
}

async function main() {
  console.log('=== Editorial Agent Instance 4/4 (partition=3) ===');

  // 1. Insert agent run
  const { data: run, error: runErr } = await supabase
    .from('agent_runs')
    .insert({ agent_name: 'editorial', status: 'started' })
    .select('id').single();
  if (runErr) { console.error('Failed to insert agent_run:', runErr.message); return; }
  const runId = run.id;
  console.log('Run ID:', runId);

  // 2. Fetch all approved tickets
  const { data: allTickets, error: tickErr } = await supabase
    .from('correction_tickets')
    .select('id, article_id, slug, title, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, human_note, source_agent')
    .eq('statut', 'approved')
    .order('created_at', { ascending: true })
    .limit(100);

  if (tickErr) { console.error('Ticket fetch error:', tickErr.message); return; }

  const myTickets = allTickets.filter(t => getPartition(t.article_id) === PARTITION);
  myTickets.sort((a, b) => {
    const urgOrder = { urgent: 0, warning: 1, ok: 2 };
    return (urgOrder[a.urgence] ?? 2) - (urgOrder[b.urgence] ?? 2);
  });

  console.log(`Total approved: ${allTickets.length}, Partition 3: ${myTickets.length}`);
  myTickets.forEach(t => console.log(`  - ${t.slug} [${t.ticket_type}/${t.source_agent}/${t.urgence}]`));

  let correctionsApplied = 0;
  const processedTicketIds = [];
  const modifiedFiles = new Set();

  for (const ticket of myTickets.slice(0, 20)) {
    console.log(`\nTicket: ${ticket.id.slice(0,8)} | ${ticket.slug} | ${ticket.ticket_type} | ${ticket.source_agent}`);

    await supabase.from('correction_tickets').update({ statut: 'in_progress' }).eq('id', ticket.id);

    const filePath = await findContentFile(ticket.slug);
    if (!filePath) {
      console.warn(`  File not found: ${ticket.slug}`);
      await supabase.from('correction_tickets').update({ statut: 'approved' }).eq('id', ticket.id);
      continue;
    }
    console.log(`  File: ${filePath}`);

    let fileContent = readFileSync(filePath, 'utf8');
    let afterFinal = null;
    let changed = false;
    const sourceAgent = ticket.source_agent || 'fact-check';

    if (sourceAgent === 'validator') {
      switch (ticket.ticket_type) {
        case 'missing_description': {
          const title = (fileContent.match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1] || ticket.slug;
          const desc = (ticket.after_suggested || `${title} - informations completes pour les patients francais sur les traitements GLP-1.`).slice(0, 155);
          if (/^description:/m.test(fileContent)) {
            fileContent = fileContent.replace(/^description:.*$/m, `description: "${desc}"`);
          } else {
            fileContent = fileContent.replace(/(^---\n)([\s\S]*?)(^---)/m, (m, open, body, close) => {
              return `${open}description: "${desc}"\n${body}${close}`;
            });
          }
          afterFinal = desc;
          changed = true;
          console.log(`  Added description: ${desc.slice(0,60)}...`);
          break;
        }
        case 'broken_link': {
          if (ticket.before_exact && fileContent.includes(ticket.before_exact)) {
            if (ticket.after_suggested) {
              fileContent = fileContent.replace(ticket.before_exact, ticket.after_suggested);
              afterFinal = ticket.after_suggested;
              changed = true;
              console.log(`  Fixed broken link`);
            } else {
              const linkMatch = ticket.before_exact.match(/\[([^\]]+)\]\([^)]+\)/);
              if (linkMatch) {
                fileContent = fileContent.replace(ticket.before_exact, linkMatch[1]);
                afterFinal = linkMatch[1];
                changed = true;
                console.log(`  Removed broken link, kept text`);
              } else {
                afterFinal = 'skipped - no fix available';
              }
            }
          } else {
            console.warn(`  before_exact not found`);
            afterFinal = 'skipped - text not found';
          }
          break;
        }
        case 'seo_issue': {
          if (ticket.before_exact && ticket.after_suggested && fileContent.includes(ticket.before_exact)) {
            fileContent = fileContent.replace(ticket.before_exact, ticket.after_suggested);
            afterFinal = ticket.after_suggested;
            changed = true;
            console.log(`  Fixed SEO issue`);
          } else {
            afterFinal = 'skipped';
          }
          break;
        }
        default:
          console.log(`  Unhandled type: ${ticket.ticket_type}`);
          afterFinal = 'skipped';
      }
    } else if (sourceAgent === 'fact-check') {
      if (ticket.before_exact && fileContent.includes(ticket.before_exact) && ticket.after_suggested) {
        fileContent = fileContent.replace(ticket.before_exact, ticket.after_suggested);
        afterFinal = ticket.after_suggested;
        changed = true;
        console.log(`  Applied fact-check correction`);
      } else {
        console.warn(`  Fact-check: cannot apply (before not found or no suggestion)`);
        afterFinal = 'skipped';
      }
    } else if (sourceAgent === 'analytics') {
      if (ticket.before_exact && ticket.after_suggested && fileContent.includes(ticket.before_exact)) {
        fileContent = fileContent.replace(ticket.before_exact, ticket.after_suggested);
        afterFinal = ticket.after_suggested;
        changed = true;
        console.log(`  Applied analytics correction`);
      } else {
        console.warn(`  Analytics: cannot apply`);
        afterFinal = 'skipped';
      }
    } else if (sourceAgent === 'seo-audit') {
      if (ticket.before_exact && ticket.after_suggested && fileContent.includes(ticket.before_exact)) {
        fileContent = fileContent.replace(ticket.before_exact, ticket.after_suggested);
        afterFinal = ticket.after_suggested;
        changed = true;
        console.log(`  Applied seo-audit correction`);
      } else {
        afterFinal = 'skipped';
      }
    } else {
      console.log(`  Unknown source_agent: ${sourceAgent}`);
      afterFinal = 'skipped';
    }

    if (changed) {
      writeFileSync(filePath, fileContent, 'utf8');
      modifiedFiles.add(filePath);
      correctionsApplied++;
    }

    await supabase.from('correction_tickets').update({
      statut: 'ready_to_deploy',
      after_final: afterFinal,
      updated_at: new Date().toISOString()
    }).eq('id', ticket.id);

    await supabase.from('agent_logs').insert({
      agent_type: 'editorial',
      article_id: ticket.article_id,
      status: changed ? 'success' : 'skipped',
      metadata: { ticket_id: ticket.id, action: 'correction', source_agent: sourceAgent, changed }
    });

    processedTicketIds.push(ticket.id);
  }

  console.log(`\n=== Corrections: ${correctionsApplied} applied, ${processedTicketIds.length} processed ===`);

  // 3. Internal link suggestions
  const { data: allLinks } = await supabase
    .from('internal_link_suggestions')
    .select('id, source_slug, target_slug, anchor_text, context_sentence, link_type, priority')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .limit(60);

  let linksInserted = 0;
  const linkCounts = {};

  if (allLinks && allLinks.length > 0) {
    console.log(`\nInternal link suggestions: ${allLinks.length}`);
    for (const link of allLinks) {
      if ((linkCounts[link.source_slug] || 0) >= 2) continue;

      const filePath = await findContentFile(link.source_slug);
      if (!filePath) {
        await supabase.from('internal_link_suggestions').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', link.id);
        continue;
      }

      let fileContent = readFileSync(filePath, 'utf8');
      const targetUrl = link.target_slug.includes('/') ? `/${link.target_slug}/` : `/${link.target_slug}/`;
      const anchor = link.anchor_text;

      if (anchor && fileContent.includes(anchor) && !fileContent.includes(`[${anchor}](`)) {
        const newContent = fileContent.replace(anchor, `[${anchor}](${targetUrl})`);
        if (newContent !== fileContent) {
          writeFileSync(filePath, newContent, 'utf8');
          modifiedFiles.add(filePath);
          linkCounts[link.source_slug] = (linkCounts[link.source_slug] || 0) + 1;
          linksInserted++;
          console.log(`  Link: ${link.source_slug} -> ${targetUrl} [${anchor}]`);
          await supabase.from('internal_link_suggestions').update({ status: 'applied', updated_at: new Date().toISOString() }).eq('id', link.id);
          await supabase.from('agent_logs').insert({
            agent_type: 'editorial',
            status: 'success',
            metadata: { action: 'internal_link', source: link.source_slug, target: link.target_slug }
          });
          continue;
        }
      }

      console.warn(`  Cannot insert naturally: ${link.source_slug} -> "${anchor || 'no anchor'}"`);
      await supabase.from('internal_link_suggestions').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', link.id);
    }
  } else {
    console.log('\nNo approved internal link suggestions.');
  }

  console.log(`\n=== Links inserted: ${linksInserted} ===`);

  // 4. Content opportunities
  const { data: opps } = await supabase
    .from('content_opportunities')
    .select('id, topic, description, target_keyword, suggested_collection, suggested_slug, source_urls')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .limit(3);

  let articlesCreated = 0;
  if (opps && opps.length > 0) {
    console.log(`\nContent opportunities: ${opps.length} (skipping creation in partition mode)`);
  } else {
    console.log('\nNo approved content opportunities.');
  }

  // 5. Git commit + push
  const filesChanged = [...modifiedFiles];
  console.log(`\nModified files: ${filesChanged.length}`);
  filesChanged.forEach(f => console.log(`  ${f}`));

  if (filesChanged.length > 0) {
    try {
      const gitFiles = filesChanged.map(f => `"${f}"`).join(' ');
      execSync(`git -C "${PROJECT_DIR}" add ${gitFiles}`, { stdio: 'pipe' });
      const msg = `editorial: apply ${correctionsApplied} corrections, ${linksInserted} links, ${articlesCreated} new articles (partition 4/4)`;
      execSync(`git -C "${PROJECT_DIR}" commit -m "${msg}"`, { stdio: 'pipe' });
      console.log('Git commit done');

      execSync(`git -C "${PROJECT_DIR}" push origin main`, { stdio: 'pipe' });
      console.log('Pushed to main');

      if (processedTicketIds.length > 0) {
        await supabase.from('correction_tickets').update({
          statut: 'deployed',
          deployed_at: new Date().toISOString()
        }).in('id', processedTicketIds).eq('statut', 'ready_to_deploy');
      }
    } catch (e) {
      console.error('Git error:', e.message);
      if (e.stderr) console.error(e.stderr.toString());
    }
  } else {
    console.log('No file changes — skipping git commit.');
    if (processedTicketIds.length > 0) {
      await supabase.from('correction_tickets').update({
        statut: 'deployed',
        deployed_at: new Date().toISOString()
      }).in('id', processedTicketIds).eq('statut', 'ready_to_deploy');
    }
  }

  // 6. Finalize run
  await supabase.from('agent_runs').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    items_processed: processedTicketIds.length + linksInserted + articlesCreated,
    items_errors: 0,
    metadata: {
      corrections_applied: correctionsApplied,
      links_inserted: linksInserted,
      articles_created: articlesCreated,
      tickets_processed: processedTicketIds.length,
      partition: '4/4'
    }
  }).eq('id', runId);

  console.log('\n=== DONE ===');
  console.log(`Corrections: ${correctionsApplied} | Links: ${linksInserted} | Articles: ${articlesCreated}`);
}

main().catch(console.error);
