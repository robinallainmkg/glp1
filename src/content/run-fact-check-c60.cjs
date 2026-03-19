#!/usr/bin/env node
/**
 * Fact-Check Agent — Cycle 60 — 2026-03-19
 * Insère les résultats de fact-check dans Supabase via API REST
 */
'use strict';
const https = require('https');

const SUPA_HOST = 'ywekaivgjzsmdocchvum.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: SUPA_HOST,
      path: path,
      method: method,
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(opts, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch(e) { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function log(msg) { process.stdout.write('[fact-check-c60] ' + msg + '\n'); }
function err(msg) { process.stderr.write('[fact-check-c60] ERROR: ' + msg + '\n'); }

// ─── Données du cycle 60 ─────────────────────────────────────────────────────

const ARTICLES = [
  {
    slug: 'wegovy-vs-mounjaro-comparatif-2026',
    score: 72,
    statut: 'A verifier',
    points: [
      { check: 'has_avis_wegovy_tableau', result: 'ERREUR CRITIQUE', detail: "Tableau indique avis HAS Wegovy en fev. 2026 — faux, l'avis est du 4 décembre 2024 (CT3870)" },
      { check: 'ozempic_dosage_max', result: 'ERREUR', detail: "Texte dit jusqu'à 2mg maximum pour Ozempic — non commercialisé en France selon ANSM" },
      { check: 'prix_wegovy_mounjaro', result: 'OK', detail: 'Prix 169-360€ Wegovy et 230-440€ Mounjaro cohérents' },
      { check: 'resultats_cliniques', result: 'OK', detail: 'Études STEP et SURMOUNT correctement citées' },
      { check: 'date_has_mounjaro', result: 'OK', detail: 'Date avis HAS Mounjaro 19 nov 2025 correcte' }
    ],
    sources: [
      { url: 'https://www.has-sante.fr/jcms/p_3749476/fr/wegovy-04122024-avis-ct3870', name: 'HAS avis CT3870 Wegovy - 4 décembre 2024' },
      { url: 'https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments/ozempic-0-25-mg-0-5-mg-1-mg-solution-injectable-en-stylo-prerempli-semaglutide-levure-saccharomyces-cerevisiae', name: 'ANSM BDM Ozempic - uniquement 0.25/0.5/1mg disponibles' }
    ],
    tickets: [
      {
        ticket_type: 'false_claim',
        urgence: 'urgent',
        before_exact: '| **Remboursement SS** | Non (avis HAS favorable fev. 2026) | Non (avis HAS favorable nov. 2025) |',
        after_suggested: '| **Remboursement SS** | Non (avis HAS favorable déc. 2024) | Non (avis HAS favorable nov. 2025) |',
        claim_original: "L'avis HAS favorable pour Wegovy date de février 2026",
        realite_actuelle: "L'avis de la Commission de la Transparence de la HAS sur Wegovy (CT3870) date du 4 décembre 2024. Le tableau présente une date erronée qui contredit le texte même de l'article.",
        source_reference: 'https://www.has-sante.fr/jcms/p_3749476/fr/wegovy-04122024-avis-ct3870'
      },
      {
        ticket_type: 'info_outdated',
        urgence: 'warning',
        before_exact: "le meme principe actif qu'Ozempic mais a un dosage plus eleve (jusqu'a 2,4 mg par semaine contre 2 mg maximum pour Ozempic)",
        after_suggested: "le meme principe actif qu'Ozempic mais a un dosage plus eleve (jusqu'a 2,4 mg par semaine contre 1 mg maximum pour Ozempic en France)",
        claim_original: "Ozempic est disponible jusqu'à 2mg par semaine en France",
        realite_actuelle: "Ozempic est commercialisé en France uniquement en 0,25 mg, 0,5 mg et 1 mg selon ANSM. Le dosage 2mg n'est pas disponible en France.",
        source_reference: 'https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments/ozempic-0-25-mg-0-5-mg-1-mg-solution-injectable-en-stylo-prerempli-semaglutide-levure-saccharomyces-cerevisiae'
      }
    ]
  },
  {
    slug: 'nouveaux-glp1-orforglipron-cagrisema-2026',
    score: 60,
    statut: 'A verifier',
    points: [
      { check: 'orforglipron_poids_perte', result: 'ERREUR CRITIQUE', detail: "Article cite 14,7-15,8% perte de poids pour orforglipron — ERRONÉ, données ATTAIN-1 montrent 7,5-11,2% selon dose à 72 semaines" },
      { check: 'orforglipron_duree_etude', result: 'ERREUR', detail: "Article dit 36 semaines — ATTAIN-1 est à 72 semaines" },
      { check: 'cagrisema_resultats', result: 'OK', detail: 'Résultats CagriSema REDEFINE 1 (-22,7%) cohérents' },
      { check: 'statut_reglementaire', result: 'OK', detail: "Statut EMA en cours d'évaluation correct" }
    ],
    sources: [
      { url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2410263', name: 'ATTAIN-1 orforglipron résultats phase 3 - NEJM 2025' }
    ],
    tickets: [
      {
        ticket_type: 'false_claim',
        urgence: 'urgent',
        before_exact: "- **Perte de poids** : 14,7 à 15,8% sur 36 semaines pour l'indication obésité",
        after_suggested: "- **Perte de poids** : 7,5 à 11,2% sur 72 semaines pour l'indication obésité (selon dose dans ATTAIN-1)",
        claim_original: "Orforglipron cause une perte de poids de 14,7 à 15,8% sur 36 semaines",
        realite_actuelle: "Les études de phase 3 ATTAIN-1 publiées en 2025 montrent une perte de poids de 7,5% (6mg) à 11,2% (36mg) à 72 semaines. Les chiffres 14-15% correspondent aux résultats de Wegovy, pas de l'orforglipron. La durée est 72 semaines, pas 36.",
        source_reference: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2410263'
      }
    ]
  },
  {
    slug: 'remboursement-glp1-2026',
    score: 62,
    statut: 'A verifier',
    points: [
      { check: 'trulicity_taux_remboursement', result: 'ERREUR CRITIQUE', detail: "Tableau liste Trulicity remboursé 30% — FAUX, taux est 65% (BDM ANSM)" },
      { check: 'victoza_taux_remboursement', result: 'ERREUR CRITIQUE', detail: "Tableau liste Victoza remboursé 30% — FAUX, taux est 65%" },
      { check: 'ozempic_statut', result: 'OK', detail: 'Ozempic 30% DT2 confirmé' },
      { check: 'wegovy_statut', result: 'OK', detail: 'Non remboursé confirmé' },
      { check: 'mounjaro_statut', result: 'OK', detail: 'En cours négociation confirmé' }
    ],
    sources: [
      { url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/63787647/extrait', name: 'BDM ANSM Trulicity 1.5mg - remboursable 65%' },
      { url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/62745855/extrait', name: 'BDM ANSM Victoza 1.8mg - remboursable 65%' }
    ],
    tickets: [
      {
        ticket_type: 'false_claim',
        urgence: 'urgent',
        before_exact: '| **Trulicity** | Diabète T2 | **30%** (DT2 uniquement) | ~57€ | ✅ Maintenu |',
        after_suggested: '| **Trulicity** | Diabète T2 | **65%** (DT2 uniquement) | ~28€ | ✅ Maintenu |',
        claim_original: 'Trulicity est remboursé à 30% pour le diabète de type 2',
        realite_actuelle: "Trulicity (dulaglutide) est remboursé à 65% par l'Assurance Maladie pour le diabète de type 2. Ce taux est confirmé par la BDM ANSM et cohérent avec les articles prix-trulicity-france et glp1-diabete-guide du site.",
        source_reference: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/63787647/extrait'
      },
      {
        ticket_type: 'false_claim',
        urgence: 'urgent',
        before_exact: '| **Victoza** | Diabète T2 | **30%** (DT2 uniquement) | ~42€ | ✅ Maintenu |',
        after_suggested: '| **Victoza** | Diabète T2 | **65%** (DT2 uniquement) | ~28€ | ✅ Maintenu |',
        claim_original: 'Victoza est remboursé à 30% pour le diabète de type 2',
        realite_actuelle: "Victoza (liraglutide) est remboursé à 65% par l'Assurance Maladie pour le diabète de type 2, comme Trulicity. Ce taux est confirmé par la BDM ANSM.",
        source_reference: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/62745855/extrait'
      }
    ]
  },
  {
    slug: 'prix-ozempic-france',
    score: 78,
    statut: 'A verifier',
    points: [
      { check: 'prix_stylo_ozempic', result: 'OK', detail: 'Prix 77,60€/stylo confirmé BDM ANSM' },
      { check: 'remboursement_ozempic_30pct', result: 'OK', detail: 'Taux 30% DT2 confirmé' },
      { check: 'trulicity_taux_comparatif', result: 'ERREUR', detail: "Tableau comparaison liste Trulicity remboursé 30% — FAUX, c'est 65%" }
    ],
    sources: [
      { url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/63787647/extrait', name: 'BDM ANSM Trulicity - remboursable 65%' }
    ],
    tickets: [
      {
        ticket_type: 'false_claim',
        urgence: 'warning',
        before_exact: '| Trulicity | ~81 € | 30% (DT2 uniquement) |',
        after_suggested: '| Trulicity | ~81 € | 65% (DT2 uniquement) |',
        claim_original: 'Trulicity est remboursé à 30% pour le diabète de type 2',
        realite_actuelle: "Trulicity (dulaglutide) est remboursé à 65% pour le diabète de type 2 selon la BDM ANSM — et non 30%.",
        source_reference: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/63787647/extrait'
      }
    ]
  },
  {
    slug: 'orforglipron-pilule-glp1-lilly-france-date',
    score: 88,
    statut: 'OK',
    points: [
      { check: 'perte_poids_orforglipron', result: 'OK', detail: '7,5-11,2% à 72 semaines cohérent avec données ATTAIN-1 publiées' },
      { check: 'comparaison_wegovy', result: 'OK', detail: 'Comparaison correcte avec Wegovy 15-17%' },
      { check: 'statut_ema', result: 'OK', detail: 'Dépôt AMM EMA 2025 confirmé' }
    ],
    sources: [
      { url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2410263', name: 'ATTAIN-1 - résultats phase 3 orforglipron (NEJM 2025)' }
    ],
    tickets: []
  },
  {
    slug: 'cagrisema-resultats-phase3-redefine-arrivee-france-2026',
    score: 90,
    statut: 'OK',
    points: [
      { check: 'redefine1_resultats', result: 'OK', detail: 'Perte de poids -22,7% à 68 semaines cohérent avec publications' },
      { check: 'reimagine2_resultats', result: 'OK', detail: 'Résultats DT2 cohérents' },
      { check: 'comparaison_mounjaro', result: 'OK', detail: 'Comparaison avec SURMOUNT-1 (-20,9%) correcte' }
    ],
    sources: [
      { url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2409741', name: 'REDEFINE 1 - CagriSema phase 3 (NEJM 2025)' }
    ],
    tickets: []
  },
  {
    slug: 'mounjaro-remboursement-securite-sociale-conditions-2026',
    score: 85,
    statut: 'A verifier',
    points: [
      { check: 'has_avis_date', result: 'NOTE', detail: "Erreurs couvertes par tickets cycle 59 non encore appliqués" },
      { check: 'imc_conditions', result: 'OK', detail: 'IMC≥35 avec comorbidité confirmé' },
      { check: 'ceps_negociations', result: 'OK', detail: 'Négociations CEPS en cours confirmées' }
    ],
    sources: [
      { url: 'https://www.has-sante.fr/jcms/p_3776028/fr/mounjaro-19112025-avis-ct21349', name: 'HAS avis CT21349 Mounjaro - 19 novembre 2025' }
    ],
    tickets: []
  },
  {
    slug: 'victoza-arret-commercialisation-alternative-2026',
    score: 87,
    statut: 'OK',
    points: [
      { check: 'arret_victoza_2026', result: 'OK', detail: 'Arrêt commercialisation Victoza fin 2026 confirmé' },
      { check: 'saxenda_non_concerne', result: 'OK', detail: 'Saxenda (liraglutide 3mg) non concerné correct' },
      { check: 'alternative_ozempic', result: 'OK', detail: 'Ozempic présenté comme alternative principale correcte' }
    ],
    sources: [
      { url: 'https://www.vidal.fr/actualites/29854-victoza-retrait-du-marche-francais-en-2026.html', name: 'Vidal - Victoza retrait du marché français en 2026' }
    ],
    tickets: []
  }
];

async function main() {
  log('=== Fact-Check Agent Cycle 60 - 2026-03-19 ===');

  // 1. Créer le run
  const runRes = await apiRequest('POST', '/rest/v1/agent_runs', {
    agent_name: 'fact-check',
    status: 'started'
  });

  if (!Array.isArray(runRes.data) || !runRes.data[0]) {
    err('Impossible de créer le run: ' + JSON.stringify(runRes.data));
    process.exit(1);
  }
  const runId = runRes.data[0].id;
  log('Run ID: ' + runId);

  // 2. Récupérer les articles
  const slugsParam = ARTICLES.map(a => a.slug).join(',');
  const artsRes = await apiRequest('GET',
    '/rest/v1/articles?slug=in.(' + slugsParam + ')&select=id,slug,title',
    null
  );
  const articleMap = {};
  for (const a of (Array.isArray(artsRes.data) ? artsRes.data : [])) {
    articleMap[a.slug] = a;
  }
  log('Articles trouvés: ' + Object.keys(articleMap).length + '/' + ARTICLES.length);

  let totalTickets = 0;
  let errorsCount = 0;

  // 3. Traiter chaque article
  for (const art of ARTICLES) {
    const dbArt = articleMap[art.slug];
    if (!dbArt) {
      log('SKIP: ' + art.slug + ' non trouvé en Supabase');
      continue;
    }

    log('\n[' + art.statut + '] ' + art.slug + ' — Score: ' + art.score + '/100');

    // Insérer fact_check_result
    const fcRes = await apiRequest('POST', '/rest/v1/fact_check_results', {
      article_id: dbArt.id,
      score_fiabilite: art.score,
      statut: art.statut,
      points: art.points,
      sources: art.sources,
      model_used: 'claude-sonnet-4-6',
      tokens_used: 0
    });

    if (!Array.isArray(fcRes.data) || !fcRes.data[0]) {
      err('fact_check_result insert failed: ' + JSON.stringify(fcRes.data));
      errorsCount++;
      continue;
    }
    const fcId = fcRes.data[0].id;
    log('  fact_check_result: ' + fcId);

    // Vérifier tickets existants
    const existingRes = await apiRequest('GET',
      '/rest/v1/correction_tickets?article_id=eq.' + dbArt.id +
      '&source_agent=eq.fact-check&statut=not.in.(deployed,rejected)&select=ticket_type',
      null
    );
    const existingTypes = new Set((Array.isArray(existingRes.data) ? existingRes.data : []).map(t => t.ticket_type));

    // Insérer les tickets
    for (const ticket of art.tickets) {
      if (existingTypes.has(ticket.ticket_type)) {
        log('  SKIP ticket ' + ticket.ticket_type + ' (déjà existant actif)');
        continue;
      }

      const tRes = await apiRequest('POST', '/rest/v1/correction_tickets', {
        article_id: dbArt.id,
        slug: art.slug,
        title: dbArt.title || art.slug,
        fact_check_result_id: fcId,
        ticket_type: ticket.ticket_type,
        urgence: ticket.urgence,
        before_exact: ticket.before_exact,
        after_suggested: ticket.after_suggested,
        claim_original: ticket.claim_original,
        realite_actuelle: ticket.realite_actuelle,
        source_reference: ticket.source_reference,
        statut: 'approved',
        model_used: 'claude-sonnet-4-6',
        source_agent: 'fact-check'
      });

      if (!Array.isArray(tRes.data) || !tRes.data[0]) {
        err('  Ticket insert failed: ' + JSON.stringify(tRes.data));
        errorsCount++;
      } else {
        log('  ✓ Ticket [' + ticket.urgence + '] ' + ticket.ticket_type);
        totalTickets++;
      }
    }

    // Mettre à jour last_fact_checked
    await apiRequest('PATCH', '/rest/v1/articles?id=eq.' + dbArt.id, {
      last_fact_checked: new Date().toISOString()
    });

    // Log
    await apiRequest('POST', '/rest/v1/agent_logs', {
      agent_type: 'fact-check',
      article_id: dbArt.id,
      status: 'success',
      tokens_used: 0,
      metadata: { tickets_created: art.tickets.length, score: art.score, run_id: runId }
    });

    log('  ✓ last_fact_checked mis à jour');
  }

  // 4. Score moyen
  const avgScore = Math.round(ARTICLES.reduce((s, a) => s + a.score, 0) / ARTICLES.length);
  log('\nScore moyen: ' + avgScore + '/100');
  log('Tickets créés: ' + totalTickets);

  // 5. Finaliser le run
  await apiRequest('PATCH', '/rest/v1/agent_runs?id=eq.' + runId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    items_processed: ARTICLES.length,
    items_errors: errorsCount,
    metadata: {
      articles_checked: ARTICLES.length,
      tickets_created: totalTickets,
      avg_score: avgScore,
      cycle: 60,
      date: '2026-03-19',
      issues_found: [
        'Date HAS Wegovy erronée (fev.2026 au lieu de déc.2024) dans wegovy-vs-mounjaro',
        "Orforglipron résultats ERRONÉS: 14-15% cités (chiffres Wegovy) au lieu de 7-11% ATTAIN-1",
        'Trulicity taux remboursement 30% au lieu de 65% dans remboursement-glp1-2026',
        'Victoza taux remboursement 30% au lieu de 65% dans remboursement-glp1-2026',
        'Trulicity taux 30% dans tableau comparatif prix-ozempic-france'
      ]
    }
  });

  log('\n=== Fact-Check Cycle 60 terminé ===');
  log('Run ID: ' + runId);
}

main().catch(function(e) {
  console.error('FATAL:', e);
  process.exit(1);
});
