#!/usr/bin/env node
/**
 * Agent Editorial — Instance 4/4
 * Traite uniquement les articles où abs(hashtext(article_id::text)) % 4 = 3
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { glob } from 'glob';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PARTITION = 3;
const PARTITION_TOTAL = 4;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const PROJECT_ROOT = path.resolve(process.cwd());
const CONTENT_DIR = path.join(PROJECT_ROOT, 'src', 'content');

let runId = null;
const stats = { corrections: 0, links: 0, articles: 0, errors: 0 };
const processedTicketIds = [];

// ─── Utilitaires ────────────────────────────────────────────────────────────

function log(msg) { console.log(`[editorial-p${PARTITION}] ${msg}`); }
function err(msg) { console.error(`[editorial-p${PARTITION}] ❌ ${msg}`); }

async function sql(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql_editorial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SQL error: ${text}`);
  }
  return res.json();
}

async function findContentFile(slug) {
  const patterns = [
    `${CONTENT_DIR}/**/${slug}.md`,
    `${CONTENT_DIR}/**/${slug}.mdx`,
  ];
  for (const pattern of patterns) {
    const files = await glob(pattern.replace(/\\/g, '/'));
    if (files.length > 0) return files[0];
  }
  return null;
}

function applyCorrection(content, before, after) {
  if (!content.includes(before)) {
    // Essai avec trim
    const trimmed = before.trim();
    if (content.includes(trimmed)) {
      return content.replace(trimmed, after.trim());
    }
    return null;
  }
  return content.replace(before, after);
}

// ─── Init agent run ──────────────────────────────────────────────────────────

async function initRun() {
  const { data, error } = await supabase
    .from('agent_runs')
    .insert({ agent_name: 'editorial-p3', status: 'started' })
    .select('id')
    .single();
  if (error) throw error;
  runId = data.id;
  log(`Run ID: ${runId}`);
}

// ─── Mode 1 : Corrections ────────────────────────────────────────────────────

async function processCorrections() {
  log('=== MODE CORRECTIONS ===');

  // Fetch tickets pour notre partition (UUIDs hashés)
  // On récupère tous les tickets approved et on filtre côté JS
  const { data: allTickets, error } = await supabase
    .from('correction_tickets')
    .select(`
      id, article_id, slug, title, ticket_type, urgence,
      before_exact, after_suggested, claim_original, realite_actuelle,
      source_reference, human_note, source_agent
    `)
    .eq('statut', 'approved')
    .order('urgence', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) { err(`Fetch tickets: ${error.message}`); return; }
  if (!allTickets?.length) { log('Aucun ticket approved'); return; }

  // Filtrer par partition
  const tickets = allTickets.filter(t => {
    const hash = simpleHash(t.article_id);
    return Math.abs(hash) % PARTITION_TOTAL === PARTITION;
  });

  log(`${allTickets.length} tickets total → ${tickets.length} pour partition ${PARTITION}`);
  if (!tickets.length) { log('Aucun ticket pour cette partition'); return; }

  const toProcess = tickets.slice(0, 20); // Max 20 par run

  for (const ticket of toProcess) {
    try {
      log(`Ticket ${ticket.id.slice(0, 8)} — ${ticket.slug} [${ticket.ticket_type}/${ticket.urgence}]`);

      // Mark in_progress
      await supabase
        .from('correction_tickets')
        .update({ statut: 'in_progress' })
        .eq('id', ticket.id);

      // Find file
      const filePath = await findContentFile(ticket.slug);
      if (!filePath) {
        err(`Fichier non trouvé pour slug: ${ticket.slug}`);
        await supabase.from('correction_tickets').update({ statut: 'approved' }).eq('id', ticket.id);
        stats.errors++;
        continue;
      }

      let content = readFileSync(filePath, 'utf-8');
      let afterFinal = ticket.after_suggested;
      let changed = false;

      const source = ticket.source_agent || 'fact-check';

      if (source === 'validator') {
        // Traitements validator
        const result = handleValidatorTicket(ticket, content);
        if (result) { content = result.content; afterFinal = result.afterFinal; changed = true; }
      } else {
        // fact-check, analytics, etc.
        const newContent = applyCorrection(content, ticket.before_exact, ticket.after_suggested);
        if (newContent) {
          content = newContent;
          afterFinal = ticket.after_suggested;
          changed = true;
        } else {
          err(`Texte 'before' introuvable dans ${ticket.slug}`);
          // Marquer rejected plutôt que de bloquer
          await supabase
            .from('correction_tickets')
            .update({ statut: 'rejected', after_final: 'before_exact introuvable dans le fichier' })
            .eq('id', ticket.id);
          stats.errors++;
          continue;
        }
      }

      if (changed) {
        writeFileSync(filePath, content, 'utf-8');
      }

      // Update ticket
      await supabase
        .from('correction_tickets')
        .update({ statut: 'ready_to_deploy', after_final: afterFinal })
        .eq('id', ticket.id);

      // Log
      await supabase.from('agent_logs').insert({
        agent_type: 'editorial',
        article_id: ticket.article_id,
        status: 'success',
        metadata: { ticket_id: ticket.id, action: 'correction', source_agent: source, slug: ticket.slug },
      });

      processedTicketIds.push(ticket.id);
      stats.corrections++;
      log(`  ✓ Corrigé (${changed ? 'fichier modifié' : 'no-op'})`);

    } catch (e) {
      err(`Ticket ${ticket.id}: ${e.message}`);
      await supabase.from('correction_tickets').update({ statut: 'approved' }).eq('id', ticket.id);
      stats.errors++;
    }
  }

  log(`Corrections: ${stats.corrections} appliquées`);
}

function handleValidatorTicket(ticket, content) {
  const type = ticket.ticket_type;
  let modified = content;

  if (type === 'missing_description') {
    // Générer une meta description depuis after_suggested ou le contenu
    const desc = ticket.after_suggested ||
      `Informations complètes sur ${ticket.title} : traitements GLP-1, médicaments disponibles, remboursement et conseils médicaux en France.`;
    // Insérer dans le frontmatter si absent
    if (!modified.includes('description:')) {
      modified = modified.replace(
        /^(---\n[\s\S]*?)(---)$/m,
        (_, front, close) => `${front}description: "${desc.replace(/"/g, "'").slice(0, 160)}"\n${close}`
      );
      return { content: modified, afterFinal: desc };
    }
  }

  if (type === 'broken_link') {
    // Supprimer le lien cassé (remplacer [texte](url) par texte seul)
    const urlMatch = ticket.before_exact?.match(/\[([^\]]+)\]\([^)]+\)/);
    if (urlMatch) {
      modified = modified.replace(ticket.before_exact, urlMatch[1]);
      return { content: modified, afterFinal: urlMatch[1] };
    }
  }

  if (type === 'content_quality' || type === 'seo_issue' || type === 'seo_optimization' || type === 'content_refresh') {
    if (ticket.before_exact && ticket.after_suggested) {
      const newContent = applyCorrection(modified, ticket.before_exact, ticket.after_suggested);
      if (newContent) return { content: newContent, afterFinal: ticket.after_suggested };
    }
  }

  // Fallback: appliquer before→after si disponibles
  if (ticket.before_exact && ticket.after_suggested) {
    const newContent = applyCorrection(modified, ticket.before_exact, ticket.after_suggested);
    if (newContent) return { content: newContent, afterFinal: ticket.after_suggested };
  }

  return null;
}

// ─── Mode 2 : Maillage Interne ───────────────────────────────────────────────

async function processInternalLinks() {
  log('=== MODE MAILLAGE INTERNE ===');

  const { data: allSuggestions, error } = await supabase
    .from('internal_link_suggestions')
    .select('id, source_slug, target_slug, anchor_text, context_sentence, link_type, priority')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .limit(100);

  if (error) { err(`Fetch links: ${error.message}`); return; }
  if (!allSuggestions?.length) { log('Aucune suggestion approuvée'); return; }

  // Filtrer par partition sur source_slug hash
  const suggestions = allSuggestions.filter(s => {
    const hash = simpleHash(s.source_slug);
    return Math.abs(hash) % PARTITION_TOTAL === PARTITION;
  });

  log(`${allSuggestions.length} suggestions total → ${suggestions.length} pour partition ${PARTITION}`);
  if (!suggestions.length) { log('Aucune suggestion pour cette partition'); return; }

  const toProcess = suggestions.slice(0, 15);

  // Compteur de liens par article (max 2)
  const linksPerArticle = {};

  for (const sug of toProcess) {
    try {
      linksPerArticle[sug.source_slug] = linksPerArticle[sug.source_slug] || 0;
      if (linksPerArticle[sug.source_slug] >= 2) {
        log(`  Skip ${sug.source_slug} (max 2 liens/article atteint)`);
        continue;
      }

      const filePath = await findContentFile(sug.source_slug);
      if (!filePath) {
        log(`  Fichier source non trouvé: ${sug.source_slug}`);
        await supabase.from('internal_link_suggestions').update({ status: 'rejected' }).eq('id', sug.id);
        continue;
      }

      let content = readFileSync(filePath, 'utf-8');

      // Construire l'URL cible
      const targetUrl = buildTargetUrl(sug.target_slug, filePath);

      // Trouver une occurrence naturelle de l'anchor_text
      const anchor = sug.anchor_text;
      if (!anchor || !content.includes(anchor)) {
        log(`  Ancre "${anchor}" introuvable dans ${sug.source_slug}`);
        await supabase.from('internal_link_suggestions').update({ status: 'rejected' }).eq('id', sug.id);
        continue;
      }

      // Vérifier que l'ancre n'est pas déjà un lien
      const anchorInLink = new RegExp(`\\[${escapeRegex(anchor)}\\]\\(`);
      if (anchorInLink.test(content)) {
        log(`  "${anchor}" déjà un lien dans ${sug.source_slug}`);
        await supabase.from('internal_link_suggestions').update({ status: 'rejected' }).eq('id', sug.id);
        continue;
      }

      // Remplacer la première occurrence par un lien
      const newContent = content.replace(anchor, `[${anchor}](${targetUrl})`);
      if (newContent === content) {
        log(`  Remplacement échoué pour "${anchor}"`);
        await supabase.from('internal_link_suggestions').update({ status: 'rejected' }).eq('id', sug.id);
        continue;
      }

      writeFileSync(filePath, newContent, 'utf-8');
      linksPerArticle[sug.source_slug]++;

      await supabase.from('internal_link_suggestions').update({ status: 'applied' }).eq('id', sug.id);
      await supabase.from('agent_logs').insert({
        agent_type: 'editorial',
        status: 'success',
        metadata: { action: 'internal_link', source: sug.source_slug, target: sug.target_slug, anchor },
      });

      stats.links++;
      log(`  ✓ Lien ajouté: [${anchor}](${targetUrl}) dans ${sug.source_slug}`);

    } catch (e) {
      err(`Suggestion ${sug.id}: ${e.message}`);
      stats.errors++;
    }
  }

  log(`Liens: ${stats.links} ajoutés`);
}

function buildTargetUrl(targetSlug, sourceFilePath) {
  // Déduire la collection depuis le chemin source si possible
  const collectionMatch = sourceFilePath.match(/src[/\\]content[/\\]([^/\\]+)/);
  const collection = collectionMatch ? collectionMatch[1] : 'traitements-glp1';
  return `/${collection}/${targetSlug}/`;
}

// ─── Mode 3 : Création d'articles ───────────────────────────────────────────

async function processOpportunities() {
  log('=== MODE CREATION ===');

  const { data: opps, error } = await supabase
    .from('content_opportunities')
    .select('id, topic, description, target_keyword, suggested_collection, suggested_slug, source_urls')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .limit(3);

  if (error) { err(`Fetch opps: ${error.message}`); return; }
  if (!opps?.length) { log('Aucune opportunité approuvée'); return; }

  // Filtrer par partition
  const myOpps = opps.filter(o => {
    const hash = simpleHash(o.id);
    return Math.abs(hash) % PARTITION_TOTAL === PARTITION;
  });

  log(`${opps.length} opportunités total → ${myOpps.length} pour partition ${PARTITION}`);
  if (!myOpps.length) { log('Aucune opportunité pour cette partition'); return; }

  for (const opp of myOpps.slice(0, 2)) {
    try {
      log(`Opportunité: ${opp.topic} → ${opp.suggested_slug}`);

      await supabase.from('content_opportunities').update({ status: 'in_progress' }).eq('id', opp.id);

      const collection = opp.suggested_collection || 'traitements-glp1';
      const slug = opp.suggested_slug;
      const targetDir = path.join(CONTENT_DIR, collection);
      const filePath = path.join(targetDir, `${slug}.md`);

      if (existsSync(filePath)) {
        log(`  Fichier déjà existant: ${filePath}`);
        await supabase.from('content_opportunities').update({ status: 'approved' }).eq('id', opp.id);
        continue;
      }

      // Lire des articles existants de la même collection pour le style
      const existingFiles = await glob(`${targetDir.replace(/\\/g, '/')}/*.md`);
      let styleExample = '';
      if (existingFiles.length > 0) {
        styleExample = readFileSync(existingFiles[0], 'utf-8').slice(0, 800);
      }

      const article = generateArticle(opp, styleExample);
      writeFileSync(filePath, article, 'utf-8');

      // Insérer en base
      await supabase.from('articles').upsert({
        slug,
        collection,
        title: opp.topic,
        content: article,
        is_active: true,
      }, { onConflict: 'slug', ignoreDuplicates: true });

      await supabase.from('content_opportunities').update({ status: 'published' }).eq('id', opp.id);
      await supabase.from('agent_logs').insert({
        agent_type: 'editorial',
        status: 'success',
        metadata: { action: 'create_article', slug, collection, topic: opp.topic },
      });

      stats.articles++;
      log(`  ✓ Article créé: ${filePath}`);

    } catch (e) {
      err(`Opportunité ${opp.id}: ${e.message}`);
      await supabase.from('content_opportunities').update({ status: 'approved' }).eq('id', opp.id);
      stats.errors++;
    }
  }

  log(`Articles créés: ${stats.articles}`);
}

function generateArticle(opp, styleExample) {
  const title = opp.topic;
  const keyword = opp.target_keyword || opp.topic;
  const slug = opp.suggested_slug;
  const today = new Date().toISOString().split('T')[0];

  return `---
title: "${title}"
description: "Tout savoir sur ${keyword} en France : indications, posologie, remboursement, effets secondaires et conseils médicaux pour les patients."
publishDate: ${today}
author: "Équipe médicale GLP1-France"
tags: ["GLP-1", "${keyword}", "traitement", "obésité"]
---

# ${title}

${opp.description || `Découvrez tout ce qu'il faut savoir sur ${keyword}.`}

## Qu'est-ce que ${keyword} ?

${keyword} est un sujet important pour les patients traités avec des médicaments GLP-1 en France. Ces traitements révolutionnent la prise en charge de l'obésité et du diabète de type 2, offrant de nouvelles perspectives thérapeutiques.

Les traitements GLP-1 (agonistes du récepteur au GLP-1) agissent en imitant l'hormone naturelle GLP-1 produite par l'intestin après un repas. Ils régulent l'appétit, ralentissent la vidange gastrique et améliorent le contrôle glycémique.

## Indications et utilisation

Ces traitements sont prescrits dans plusieurs situations :

- **Obésité** (IMC ≥ 30 kg/m²) avec ou sans comorbidités
- **Surpoids** (IMC ≥ 27 kg/m²) avec au moins une comorbidité liée au poids
- **Diabète de type 2** en complément des mesures hygiéno-diététiques

Le traitement s'inscrit toujours dans une prise en charge globale incluant une alimentation équilibrée et une activité physique régulière. Il ne remplace pas ces mesures — il les complète et les renforce.

## Médicaments disponibles en France

Plusieurs médicaments GLP-1 sont disponibles sur le marché français :

**Ozempic (sémaglutide)** — Initialement développé pour le diabète de type 2, il est également utilisé hors AMM dans certains cas d'obésité. Il s'administre en injection sous-cutanée hebdomadaire.

**Wegovy (sémaglutide haute dose)** — Spécifiquement approuvé pour l'obésité, avec une dose hebdomadaire plus élevée qu'Ozempic. Son remboursement en France est en cours d'évaluation.

**Victoza et Saxenda (liraglutide)** — Le liraglutide existe en deux formulations : Victoza pour le diabète et Saxenda pour l'obésité, en injection quotidienne.

**Mounjaro (tirzépatide)** — Un double agoniste GIP/GLP-1 plus récent, avec des résultats prometteurs sur la perte de poids.

## Remboursement en France

La question du remboursement est centrale pour les patients français. Actuellement :

- **Ozempic** est remboursé pour le diabète de type 2 (liste I)
- **Wegovy** n'est pas encore remboursé pour l'obésité seule
- **Saxenda** n'est pas remboursé en France
- Des négociations sont en cours avec la HAS pour élargir les remboursements

Le coût mensuel sans remboursement varie entre 150 € et 350 € selon le médicament et la dose. Avec l'Assurance Maladie pour le diabète, la prise en charge est de 65 % sur la base du tarif de remboursement.

## Effets secondaires courants

Les effets indésirables les plus fréquents sont gastro-intestinaux :

- Nausées (surtout en début de traitement)
- Vomissements
- Diarrhée ou constipation
- Douleurs abdominales

Ces effets sont généralement temporaires et s'atténuent après les premières semaines. La titration progressive des doses aide à les minimiser.

Des effets plus rares mais importants à surveiller incluent les pancréatites, les problèmes de thyroïde et les troubles de la vésicule biliaire. Votre médecin vous informera des signes d'alerte à surveiller.

## Conseils pratiques

**Avant de commencer un traitement GLP-1**, consultez votre médecin traitant ou un spécialiste (endocrinologue, diabétologue). Un bilan complet est nécessaire pour évaluer les indications, les contre-indications et les objectifs thérapeutiques.

**Pendant le traitement**, respectez scrupuleusement les doses prescrites. N'augmentez pas la dose sans avis médical. Signalez tout effet indésirable inhabituel à votre équipe soignante.

**Alimentation et activité physique** restent essentielles. Ces traitements sont des outils, non des solutions miracles. Les meilleurs résultats sont obtenus avec une approche globale de changement de mode de vie.

## Questions fréquentes

**Combien de temps dure le traitement ?** Le traitement est généralement poursuivi à long terme tant qu'il reste efficace et bien toléré. L'arrêt entraîne souvent une reprise du poids.

**Peut-on utiliser ces médicaments pendant la grossesse ?** Non. Ces médicaments sont contre-indiqués pendant la grossesse et l'allaitement. Une contraception efficace est recommandée pendant le traitement.

**Y a-t-il des interactions médicamenteuses ?** Ces médicaments peuvent modifier l'absorption d'autres médicaments pris par voie orale. Informez votre médecin de tous vos traitements en cours.

## Conclusion

${keyword} représente une avancée thérapeutique significative pour de nombreux patients. Si vous souhaitez savoir si ce type de traitement vous convient, parlez-en à votre médecin. Il pourra évaluer votre situation personnelle et vous orienter vers la solution la plus adaptée à vos besoins.

*Cet article est à titre informatif uniquement. Il ne remplace pas l'avis d'un professionnel de santé.*
`;
}

// ─── Git commit ───────────────────────────────────────────────────────────────

async function gitCommit() {
  const total = stats.corrections + stats.links + stats.articles;
  if (total === 0) {
    log('Aucune modification — pas de commit');
    return false;
  }

  try {
    execSync('git add src/content/', { cwd: PROJECT_ROOT, stdio: 'pipe' });

    const status = execSync('git status --porcelain src/content/', { cwd: PROJECT_ROOT }).toString();
    if (!status.trim()) {
      log('Aucun changement dans src/content/ — pas de commit');
      return false;
    }

    const msg = `editorial: apply ${stats.corrections} corrections, ${stats.links} links, ${stats.articles} new articles (partition ${PARTITION}/${PARTITION_TOTAL})`;
    execSync(`git commit -m "${msg}"`, { cwd: PROJECT_ROOT, stdio: 'pipe' });
    log(`✓ Commit: ${msg}`);
    return true;
  } catch (e) {
    err(`Git commit: ${e.message}`);
    return false;
  }
}

// ─── Finalisation ─────────────────────────────────────────────────────────────

async function finalizeRun(committed) {
  if (!runId) return;

  await supabase.from('agent_runs').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    items_processed: stats.corrections + stats.links + stats.articles,
    items_errors: stats.errors,
    metadata: {
      corrections_applied: stats.corrections,
      links_inserted: stats.links,
      articles_created: stats.articles,
      tickets_deployed: processedTicketIds.length,
      committed,
      partition: PARTITION,
    },
  }).eq('id', runId);

  log(`\n═══════════ RÉSUMÉ ═══════════`);
  log(`Corrections : ${stats.corrections}`);
  log(`Liens       : ${stats.links}`);
  log(`Articles    : ${stats.articles}`);
  log(`Erreurs     : ${stats.errors}`);
  log(`Commit      : ${committed ? '✓' : '–'}`);
  log(`══════════════════════════════`);
}

// ─── Hash simple (non-crypto) pour partitionnement UUID ─────────────────────

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash | 0; // Convert to 32bit integer
  }
  return hash;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  log(`Démarrage — partition ${PARTITION}/${PARTITION_TOTAL}`);
  try {
    await initRun();
    await processCorrections();
    await processInternalLinks();
    await processOpportunities();
    const committed = await gitCommit();
    await finalizeRun(committed);
  } catch (e) {
    err(`Erreur fatale: ${e.message}`);
    if (runId) {
      await supabase.from('agent_runs').update({
        status: 'error',
        metadata: { error: e.message, partition: PARTITION },
      }).eq('id', runId);
    }
    process.exit(1);
  }
}

main();
