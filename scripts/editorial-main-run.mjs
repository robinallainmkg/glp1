#!/usr/bin/env node
/**
 * Agent Editorial — Run principal (cycle courant)
 * Gere: corrections fact-check, seo_issue (title trop long), missing_description,
 *       heading_issue (H1 manquant ou double), broken_link, duplicate_key, sync_issue
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY manquante');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const PROJECT_ROOT = process.cwd();
const CONTENT_DIR = path.join(PROJECT_ROOT, 'src', 'content');

let runId = null;
const stats = { corrections: 0, links: 0, articles: 0, errors: 0 };
const processedTicketIds = [];

function log(msg) { console.log('[editorial] ' + msg); }
function err(msg) { console.error('[editorial] ERROR: ' + msg); }

async function findContentFile(slug) {
  // slug can be "collection/file" or just "file"
  const patterns = [
    CONTENT_DIR + '/**/' + slug + '.md',
    CONTENT_DIR + '/**/' + slug + '.mdx',
  ];
  for (const pattern of patterns) {
    const files = await glob(pattern.replace(/\\/g, '/'));
    if (files.length > 0) return files[0];
  }
  return null;
}

function applyCorrection(content, before, after) {
  if (!before) return null;
  if (content.includes(before)) {
    return content.replace(before, after || '');
  }
  const trimmed = before.trim();
  if (content.includes(trimmed)) {
    return content.replace(trimmed, (after || '').trim());
  }
  return null;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Shorten a title to be under maxLen characters, trimming at a word boundary
function shortenTitle(title, maxLen) {
  if (title.length <= maxLen) return title;
  // Try to cut at last space before maxLen
  let cut = title.lastIndexOf(' ', maxLen - 1);
  if (cut < maxLen * 0.6) cut = maxLen - 1;
  return title.slice(0, cut).replace(/[:\s,]+$/, '').trim();
}

// Parse frontmatter block from content, return { frontmatter, body, raw }
function parseFrontmatter(content) {
  const match = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n)([\s\S]*)$/);
  if (!match) return null;
  return { open: match[1], fm: match[2], close: match[3], body: match[4] };
}

// Replace a frontmatter field value
function replaceFmField(fm, field, newValue) {
  // Match: field: "value" or field: value
  const re = new RegExp('^(' + escapeRegex(field) + ':\\s*)("?)([^"\\n]*)("?)\\s*$', 'm');
  if (re.test(fm)) {
    return fm.replace(re, '$1"' + newValue.replace(/"/g, "'") + '"');
  }
  return fm;
}

// Get frontmatter field value
function getFmField(fm, field) {
  const re = new RegExp('^' + escapeRegex(field) + ':\\s*"?([^"\\n]*)"?\\s*$', 'm');
  const m = fm.match(re);
  return m ? m[1].trim() : null;
}

async function initRun() {
  const { data, error } = await supabase
    .from('agent_runs')
    .insert({ agent_name: 'editorial', status: 'started' })
    .select('id')
    .single();
  if (error) throw error;
  runId = data.id;
  log('Run ID: ' + runId);
}

async function processCorrections() {
  log('=== ETAPE 2 : CORRECTIONS ===');

  const { data: tickets, error } = await supabase
    .from('correction_tickets')
    .select('id, article_id, slug, title, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, human_note, source_agent')
    .eq('statut', 'approved')
    .order('urgence', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(20);

  if (error) { err('Fetch tickets: ' + error.message); return; }
  if (!tickets || tickets.length === 0) { log('Aucun ticket approved'); return; }

  log(tickets.length + ' tickets a traiter');

  for (const ticket of tickets) {
    try {
      log('Ticket ' + ticket.id.slice(0,8) + ' — ' + ticket.slug + ' [' + ticket.ticket_type + '/' + ticket.urgence + '] src=' + ticket.source_agent);

      // Skip sync_issue (no file change needed — DB-only)
      if (ticket.ticket_type === 'sync_issue') {
        log('  SKIP: sync_issue (traitement manuel requis)');
        await supabase.from('correction_tickets')
          .update({ statut: 'rejected', after_final: 'sync_issue: correction manuelle requise' })
          .eq('id', ticket.id);
        continue;
      }

      await supabase.from('correction_tickets').update({ statut: 'in_progress' }).eq('id', ticket.id);

      const filePath = await findContentFile(ticket.slug);
      if (!filePath) {
        err('Fichier non trouve pour slug: ' + ticket.slug);
        await supabase.from('correction_tickets').update({ statut: 'approved' }).eq('id', ticket.id);
        stats.errors++;
        continue;
      }

      let content = readFileSync(filePath, 'utf-8');
      let afterFinal = ticket.after_suggested || '';
      let changed = false;

      const type = ticket.ticket_type;

      if (type === 'seo_issue' && ticket.claim_original && ticket.claim_original.includes('Title trop long')) {
        // Title is too long — shorten the frontmatter title
        const parsed = parseFrontmatter(content);
        if (parsed) {
          const currentTitle = getFmField(parsed.fm, 'title');
          if (currentTitle && currentTitle.length > 60) {
            const newTitle = shortenTitle(currentTitle, 60);
            if (newTitle !== currentTitle) {
              const newFm = replaceFmField(parsed.fm, 'title', newTitle);
              content = parsed.open + newFm + parsed.close + parsed.body;
              afterFinal = newTitle;
              changed = true;
              log('  Title reduit: "' + currentTitle.slice(0,50) + '" -> "' + newTitle + '"');
            } else {
              log('  Title deja court: ' + currentTitle.length + ' chars, skip');
            }
          } else {
            log('  Title OK ou absent, skip');
          }
        }
      }
      else if (type === 'missing_description') {
        // Add or fix meta description
        const parsed = parseFrontmatter(content);
        if (parsed) {
          const existing = getFmField(parsed.fm, 'description');
          if (!existing) {
            // Generate a description
            const titleInFile = getFmField(parsed.fm, 'title') || ticket.title || ticket.slug;
            const desc = 'Tout savoir sur ' + titleInFile.slice(0, 80) + ' : traitements GLP-1, remboursement, effets secondaires et conseils medicaux en France.';
            const newFm = parsed.fm + 'description: "' + desc.replace(/"/g, "'").slice(0, 160) + '"\n';
            content = parsed.open + newFm + parsed.close + parsed.body;
            afterFinal = desc.slice(0, 160);
            changed = true;
            log('  Description ajoutee: ' + afterFinal.slice(0,60));
          } else {
            log('  Description deja presente, skip: ' + existing.slice(0,50));
            await supabase.from('correction_tickets')
              .update({ statut: 'rejected', after_final: 'description deja presente: ' + existing.slice(0,80) })
              .eq('id', ticket.id);
            continue;
          }
        }
      }
      else if (type === 'heading_issue') {
        const claimLower = (ticket.claim_original || '').toLowerCase();
        if (claimLower.includes('h1 manquant') || claimLower.includes('pas de balise h1')) {
          // No H1 — the first markdown # heading is likely H2+ or title in frontmatter needs promoting
          const parsed = parseFrontmatter(content);
          if (parsed) {
            // Check if there's any # heading in body
            if (!/^# /m.test(parsed.body)) {
              const titleInFile = getFmField(parsed.fm, 'title') || ticket.title || ticket.slug;
              content = parsed.open + parsed.fm + parsed.close + '# ' + titleInFile + '\n\n' + parsed.body;
              afterFinal = '# ' + titleInFile + ' (H1 ajoute)';
              changed = true;
              log('  H1 ajoute: # ' + titleInFile.slice(0,50));
            } else {
              log('  H1 deja present, skip');
              await supabase.from('correction_tickets')
                .update({ statut: 'rejected', after_final: 'H1 deja present dans le fichier' })
                .eq('id', ticket.id);
              continue;
            }
          }
        } else if (claimLower.includes('plusieurs h1') || claimLower.includes('2 balises h1')) {
          // Multiple H1 — demote all but the first
          const parsed = parseFrontmatter(content);
          if (parsed) {
            let h1Count = 0;
            const newBody = parsed.body.replace(/^# (.+)$/mg, function(match, text) {
              h1Count++;
              if (h1Count === 1) return match; // keep first H1
              return '## ' + text; // demote subsequent H1 to H2
            });
            if (newBody !== parsed.body) {
              content = parsed.open + parsed.fm + parsed.close + newBody;
              afterFinal = 'H1 supplementaires demotes en H2';
              changed = true;
              log('  H1 dupliques corriges (demotes en H2)');
            } else {
              log('  Pas de H1 dupliques trouves, skip');
              await supabase.from('correction_tickets')
                .update({ statut: 'rejected', after_final: 'pas de H1 dupliques trouves dans le fichier' })
                .eq('id', ticket.id);
              continue;
            }
          }
        } else {
          log('  heading_issue non reconnu: ' + ticket.claim_original);
          await supabase.from('correction_tickets')
            .update({ statut: 'rejected', after_final: 'heading_issue non reconnu' })
            .eq('id', ticket.id);
          continue;
        }
      }
      else if (type === 'broken_link') {
        // before_exact should be the broken link markdown
        const urlMatch = ticket.before_exact && ticket.before_exact.match(/\[([^\]]+)\]\([^)]+\)/);
        if (urlMatch && content.includes(ticket.before_exact)) {
          content = content.replace(ticket.before_exact, urlMatch[1]);
          afterFinal = urlMatch[1];
          changed = true;
          log('  Lien casse supprime: ' + ticket.before_exact.slice(0,60));
        } else if (ticket.before_exact && ticket.after_suggested && content.includes(ticket.before_exact)) {
          content = content.replace(ticket.before_exact, ticket.after_suggested);
          afterFinal = ticket.after_suggested;
          changed = true;
        } else {
          log('  Lien casse introuvable dans le fichier');
          await supabase.from('correction_tickets')
            .update({ statut: 'rejected', after_final: 'lien introuvable dans le fichier' })
            .eq('id', ticket.id);
          stats.errors++;
          continue;
        }
      }
      else if (ticket.before_exact && ticket.after_suggested && content.includes(ticket.before_exact)) {
        // Generic before/after replacement (fact-check, content_refresh, etc.)
        content = content.replace(ticket.before_exact, ticket.after_suggested);
        afterFinal = ticket.after_suggested;
        changed = true;
        log('  Remplacement generique applique');
      }
      else {
        // Cannot apply
        err('Ticket non traitable: type=' + type + ', before_exact=' + JSON.stringify((ticket.before_exact || '').slice(0,50)));
        await supabase.from('correction_tickets')
          .update({ statut: 'rejected', after_final: 'non traitable: ' + type + ' sans before/after applicables' })
          .eq('id', ticket.id);
        stats.errors++;
        continue;
      }

      if (changed) {
        writeFileSync(filePath, content, 'utf-8');
      }

      await supabase.from('correction_tickets')
        .update({ statut: 'ready_to_deploy', after_final: afterFinal })
        .eq('id', ticket.id);
      await supabase.from('agent_logs').insert({
        agent_type: 'editorial',
        article_id: ticket.article_id,
        status: 'success',
        metadata: { ticket_id: ticket.id, action: 'correction', type: type, source_agent: ticket.source_agent, slug: ticket.slug },
      });

      processedTicketIds.push(ticket.id);
      stats.corrections++;
      log('  OK: corrige (fichier ' + (changed ? 'modifie' : 'inchange') + ')');

    } catch (e) {
      err('Ticket ' + ticket.id + ': ' + e.message);
      await supabase.from('correction_tickets').update({ statut: 'approved' }).eq('id', ticket.id);
      stats.errors++;
    }
  }

  log('Corrections: ' + stats.corrections + ' appliquees, ' + stats.errors + ' erreurs');
}

async function processInternalLinks() {
  log('=== ETAPE 3 : MAILLAGE INTERNE ===');

  const { data: suggestions, error } = await supabase
    .from('internal_link_suggestions')
    .select('id, source_slug, target_slug, anchor_text, context_sentence, link_type, priority')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .limit(15);

  if (error) { err('Fetch links: ' + error.message); return; }
  if (!suggestions || suggestions.length === 0) { log('Aucune suggestion approuvee'); return; }

  log(suggestions.length + ' suggestions a traiter');

  const linksPerArticle = {};

  for (const sug of suggestions) {
    try {
      linksPerArticle[sug.source_slug] = linksPerArticle[sug.source_slug] || 0;
      if (linksPerArticle[sug.source_slug] >= 2) {
        log('  Skip ' + sug.source_slug + ' (max 2 liens/article atteint)');
        continue;
      }

      const filePath = await findContentFile(sug.source_slug);
      if (!filePath) {
        log('  Fichier source non trouve: ' + sug.source_slug);
        await supabase.from('internal_link_suggestions').update({ status: 'rejected' }).eq('id', sug.id);
        continue;
      }

      let content = readFileSync(filePath, 'utf-8');
      const anchor = sug.anchor_text;

      if (!anchor || !content.includes(anchor)) {
        log('  Ancre "' + anchor + '" introuvable dans ' + sug.source_slug);
        await supabase.from('internal_link_suggestions').update({ status: 'rejected' }).eq('id', sug.id);
        continue;
      }

      const anchorInLink = new RegExp('\\[' + escapeRegex(anchor) + '\\]\\(');
      if (anchorInLink.test(content)) {
        log('  "' + anchor + '" deja un lien dans ' + sug.source_slug);
        await supabase.from('internal_link_suggestions').update({ status: 'rejected' }).eq('id', sug.id);
        continue;
      }

      const collectionMatch = filePath.match(/src[/\\]content[/\\]([^/\\]+)/);
      const collection = collectionMatch ? collectionMatch[1] : 'traitements-glp1';
      const targetUrl = '/' + collection + '/' + sug.target_slug + '/';

      const newContent = content.replace(anchor, '[' + anchor + '](' + targetUrl + ')');
      writeFileSync(filePath, newContent, 'utf-8');
      linksPerArticle[sug.source_slug]++;

      await supabase.from('internal_link_suggestions').update({ status: 'applied' }).eq('id', sug.id);
      await supabase.from('agent_logs').insert({
        agent_type: 'editorial',
        status: 'success',
        metadata: { action: 'internal_link', source: sug.source_slug, target: sug.target_slug, anchor },
      });

      stats.links++;
      log('  OK: lien ajoute [' + anchor + '](' + targetUrl + ') dans ' + sug.source_slug);

    } catch (e) {
      err('Suggestion ' + sug.id + ': ' + e.message);
      stats.errors++;
    }
  }

  log('Liens: ' + stats.links + ' ajoutes');
}

async function processOpportunities() {
  log('=== ETAPE 4 : CREATION ARTICLES ===');

  const { data: opps, error } = await supabase
    .from('content_opportunities')
    .select('id, topic, description, target_keyword, suggested_collection, suggested_slug, source_urls')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .limit(3);

  if (error) { err('Fetch opps: ' + error.message); return; }
  if (!opps || opps.length === 0) { log('Aucune opportunite approuvee'); return; }

  log(opps.length + ' opportunites a traiter');

  for (const opp of opps.slice(0, 3)) {
    try {
      log('Opportunite: ' + opp.topic + ' -> /' + opp.suggested_collection + '/' + opp.suggested_slug);

      await supabase.from('content_opportunities').update({ status: 'in_progress' }).eq('id', opp.id);

      const collection = opp.suggested_collection || 'traitements-glp1';
      const slug = opp.suggested_slug;
      const targetDir = path.join(CONTENT_DIR, collection);
      const filePath = path.join(targetDir, slug + '.md');

      if (existsSync(filePath)) {
        log('  Fichier deja existant: ' + filePath);
        await supabase.from('content_opportunities').update({ status: 'approved' }).eq('id', opp.id);
        continue;
      }

      const article = generateArticle(opp);
      writeFileSync(filePath, article, 'utf-8');
      log('  Fichier cree: ' + filePath);

      await supabase.from('articles').upsert(
        { slug, collection, title: opp.topic, is_active: true },
        { onConflict: 'slug', ignoreDuplicates: true }
      );

      await supabase.from('content_opportunities').update({ status: 'published' }).eq('id', opp.id);
      await supabase.from('agent_logs').insert({
        agent_type: 'editorial',
        status: 'success',
        metadata: { action: 'create_article', slug, collection, topic: opp.topic },
      });

      stats.articles++;
      log('  OK: article cree');

    } catch (e) {
      err('Opportunite ' + opp.id + ': ' + e.message);
      await supabase.from('content_opportunities').update({ status: 'approved' }).eq('id', opp.id);
      stats.errors++;
    }
  }

  log('Articles crees: ' + stats.articles);
}

function generateArticle(opp) {
  const title = opp.topic;
  const keyword = opp.target_keyword || opp.topic;
  const today = new Date().toISOString().split('T')[0];

  return `---
title: "${title}"
description: "Tout savoir sur ${keyword} en France : indications, posologie, remboursement, effets secondaires et conseils medicaux pour les patients."
publishDate: ${today}
author: "Equipe medicale GLP1-France"
tags: ["GLP-1", "${keyword}", "traitement", "obesite"]
---

# ${title}

${opp.description || 'Decouvrez tout ce qu\'il faut savoir sur ' + keyword + '.'}

## Qu\'est-ce que ${keyword} ?

${keyword} est un sujet important pour les patients traites avec des medicaments GLP-1 en France. Ces traitements revolutionnent la prise en charge de l\'obesite et du diabete de type 2.

Les traitements GLP-1 agissent en imitant l\'hormone naturelle GLP-1 produite par l\'intestin apres un repas. Ils regulant l\'appetit, ralentissent la vidange gastrique et ameliorent le controle glycemique.

## Indications et utilisation

Ces traitements sont prescrits dans plusieurs situations :

- **Obesite** (IMC >= 30 kg/m2) avec ou sans comorbidites
- **Surpoids** (IMC >= 27 kg/m2) avec au moins une comorbidite liee au poids
- **Diabete de type 2** en complement des mesures hygienodietetiques

Le traitement s\'inscrit toujours dans une prise en charge globale incluant alimentation equilibree et activite physique.

## Medicaments disponibles en France

Plusieurs medicaments GLP-1 sont disponibles :

**Ozempic (semaglutide)** — Developpe pour le diabete de type 2, injection hebdomadaire.

**Wegovy (semaglutide haute dose)** — Approuve pour l\'obesite, remboursement en cours d\'evaluation en France.

**Saxenda (liraglutide)** — Pour l\'obesite, injection quotidienne, non rembourse en France.

**Mounjaro (tirzepatide)** — Double agoniste GIP/GLP-1, resultats prometteurs.

## Remboursement en France

- **Ozempic** est rembourse pour le diabete de type 2 (liste I)
- **Wegovy** n\'est pas encore rembourse pour l\'obesite seule
- **Saxenda** n\'est pas rembourse en France

Le cout mensuel sans remboursement varie entre 150 EUR et 350 EUR.

## Effets secondaires courants

Les effets indesirables les plus frequents :

- Nausees (surtout en debut de traitement)
- Vomissements
- Diarrhee ou constipation
- Douleurs abdominales

Ces effets s\'attenuent generalement apres les premieres semaines grace a la titration progressive.

## Conseils pratiques

Consultez votre medecin traitant avant de commencer un traitement GLP-1. Un bilan complet est necessaire pour evaluer indications et contre-indications.

## Conclusion

${keyword} represente une avancee therapeutique significative. Parlez-en a votre medecin pour savoir si ce traitement vous convient.

*Cet article est a titre informatif uniquement. Il ne remplace pas l\'avis d\'un professionnel de sante.*
`;
}

async function main() {
  log('Demarrage agent editorial');
  try {
    await initRun();
    await processCorrections();
    await processInternalLinks();
    await processOpportunities();

    log('');
    log('=== RESUME ===');
    log('Corrections : ' + stats.corrections);
    log('Liens       : ' + stats.links);
    log('Articles    : ' + stats.articles);
    log('Erreurs     : ' + stats.errors);
    log('Run ID      : ' + runId);
    log('==============');

    process.stdout.write('\n__RESULT__' + JSON.stringify({ runId, ...stats }) + '__END__\n');

  } catch (e) {
    err('Erreur fatale: ' + e.message);
    if (runId) {
      await supabase.from('agent_runs').update({
        status: 'error',
        metadata: { error: e.message },
      }).eq('id', runId);
    }
    process.exit(1);
  }
}

main();
