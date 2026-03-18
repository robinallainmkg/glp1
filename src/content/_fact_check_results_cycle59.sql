-- ============================================================
-- FACT-CHECK RUN - Cycle 59 - 2026-03-17
-- Agent: claude-sonnet-4-6
-- Articles vérifiés: 8 (glp1-cout + glp1-diabete)
-- Tickets créés: 10
-- Score moyen: 73/100
-- ============================================================

-- 1. Créer le run
INSERT INTO agent_runs (agent_name, status, items_processed, items_errors, metadata, completed_at)
VALUES (
  'fact-check',
  'completed',
  8,
  0,
  '{"articles_checked": 8, "tickets_created": 10, "avg_score": 73}'::jsonb,
  NOW()
);

-- Récupérer l'ID du run pour les logs (à adapter selon retour INSERT ci-dessus)
-- Pour chaque article, insérer un fact_check_result et les tickets

-- ============================================================
-- ARTICLE 1: prix-ozempic-france
-- Score: 72 - Statut: A verifier
-- Problème: Dosage Ozempic 2mg listé mais inexistant en France
-- ============================================================
DO $$
DECLARE
  v_article_id UUID;
  v_fc_id UUID;
BEGIN
  SELECT id INTO v_article_id FROM articles WHERE slug = 'prix-ozempic-france' LIMIT 1;
  IF v_article_id IS NOT NULL THEN
    INSERT INTO fact_check_results (article_id, score_fiabilite, statut, points, sources, model_used, tokens_used)
    VALUES (
      v_article_id,
      72,
      'A verifier',
      '[
        {"check": "prix_stylo", "result": "OK", "detail": "Prix 77,60€/stylo confirmé ANSM BDM"},
        {"check": "dosage_2mg", "result": "ERREUR", "detail": "Dosage 2mg mentionné mais non commercialisé en France"},
        {"check": "remboursement_30pct", "result": "OK", "detail": "Taux 30% DT2 confirmé Ameli"}
      ]'::jsonb,
      '[{"url": "https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments/ozempic-0-25-mg-0-5-mg-1-mg-solution-injectable-en-stylo-prerempli-semaglutide-levure-saccharomyces-cerevisiae", "name": "ANSM disponibilité Ozempic (0.25, 0.5, 1mg uniquement)"}]'::jsonb,
      'claude-sonnet-4-6',
      0
    ) RETURNING id INTO v_fc_id;

    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'prix-ozempic-france',
      'Prix Ozempic France 2026',
      v_fc_id,
      'info_outdated',
      'warning',
      '| 2 mg | 77,60 € | 120 € |',
      '<!-- Ligne supprimée : dosage 2mg non commercialisé en France (source ANSM 2026) -->',
      'Ozempic 2 mg disponible en France à 77,60€',
      'Le dosage Ozempic 2mg n''est pas disponible en France. Seuls les dosages 0.25mg, 0.5mg et 1mg sont commercialisés selon l''ANSM.',
      'https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments/ozempic-0-25-mg-0-5-mg-1-mg-solution-injectable-en-stylo-prerempli-semaglutide-levure-saccharomyces-cerevisiae',
      'approved',
      'claude-sonnet-4-6'
    );

    UPDATE articles SET last_fact_checked = NOW() WHERE id = v_article_id;
    INSERT INTO agent_logs (agent_type, article_id, status, tokens_used, metadata)
    VALUES ('fact-check', v_article_id, 'success', 0, '{"tickets_created": 1, "score": 72}'::jsonb);
  END IF;
END $$;

-- ============================================================
-- ARTICLE 2: remboursement-glp1-2026
-- Score: 65 - Statut: A verifier
-- Problèmes: Rybelsus listé remboursé (FAUX), Ozempic 2mg
-- ============================================================
DO $$
DECLARE
  v_article_id UUID;
  v_fc_id UUID;
BEGIN
  SELECT id INTO v_article_id FROM articles WHERE slug = 'remboursement-glp1-2026' LIMIT 1;
  IF v_article_id IS NOT NULL THEN
    INSERT INTO fact_check_results (article_id, score_fiabilite, statut, points, sources, model_used, tokens_used)
    VALUES (
      v_article_id,
      65,
      'A verifier',
      '[
        {"check": "ozempic_statut", "result": "OK", "detail": "Ozempic 30% DT2 confirmé"},
        {"check": "rybelsus_statut", "result": "ERREUR CRITIQUE", "detail": "Rybelsus listé remboursé 30% alors que HAS avis défavorable"},
        {"check": "ozempic_dosage_2mg", "result": "ERREUR", "detail": "Dosage 2mg inexistant en France"},
        {"check": "wegovy_statut", "result": "OK", "detail": "Non remboursé confirmé"},
        {"check": "mounjaro_statut", "result": "OK", "detail": "En cours négociation confirmé"}
      ]'::jsonb,
      '[
        {"url": "https://www.has-sante.fr/jcms/p_3225389/fr/rybelsus-semaglutide", "name": "HAS Rybelsus - avis défavorable au remboursement"},
        {"url": "https://www.ameli.fr/assure/actualites/ozempic-et-autres-antidiabetiques-l-assurance-maladie-renforce-le-controle-des-prescriptions", "name": "Ameli remboursement antidiabétiques"}
      ]'::jsonb,
      'claude-sonnet-4-6',
      0
    ) RETURNING id INTO v_fc_id;

    -- Ticket 1: Rybelsus faussement remboursé
    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'remboursement-glp1-2026',
      'Remboursement GLP-1 2026 : Guide par Médicament et Mutuelle',
      v_fc_id,
      'false_claim',
      'urgent',
      '| **Rybelsus** | Diabète T2 (oral) | **30%** (DT2 uniquement) | 56-77€ | ✅ Maintenu |',
      '| **Rybelsus** | Diabète T2 (oral) | **Non remboursé** (avis HAS défavorable) | 80-110€ | ❌ Non remboursé |',
      'Rybelsus est remboursé à 30% pour le diabète de type 2',
      'Rybelsus (sémaglutide oral) n''est PAS remboursé par l''Assurance Maladie en France. La HAS a rendu un avis défavorable en l''absence de bénéfice cardiovasculaire démontré et de place dans la stratégie thérapeutique.',
      'https://www.has-sante.fr/jcms/p_3225389/fr/rybelsus-semaglutide',
      'approved',
      'claude-sonnet-4-6'
    );

    -- Ticket 2: Ozempic dosage 2mg
    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'remboursement-glp1-2026',
      'Remboursement GLP-1 2026 : Guide par Médicament et Mutuelle',
      v_fc_id,
      'info_outdated',
      'warning',
      '**Ozempic (sémaglutide 0.5-2 mg)**',
      '**Ozempic (sémaglutide 0.5-1 mg)**',
      'Ozempic disponible en France en dosage 0.5-2 mg',
      'En France, Ozempic est disponible en 0.25mg, 0.5mg et 1mg uniquement. Le dosage 2mg n''est pas commercialisé selon l''ANSM.',
      'https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments/ozempic-0-25-mg-0-5-mg-1-mg-solution-injectable-en-stylo-prerempli-semaglutide-levure-saccharomyces-cerevisiae',
      'approved',
      'claude-sonnet-4-6'
    );

    UPDATE articles SET last_fact_checked = NOW() WHERE id = v_article_id;
    INSERT INTO agent_logs (agent_type, article_id, status, tokens_used, metadata)
    VALUES ('fact-check', v_article_id, 'success', 0, '{"tickets_created": 2, "score": 65}'::jsonb);
  END IF;
END $$;

-- ============================================================
-- ARTICLE 3: remboursement-ozempic-diabete-justificatif-prescription-guide-2026
-- Score: 70 - Statut: A verifier
-- Problèmes: Rybelsus remboursé (FAUX), Ozempic 2mg
-- ============================================================
DO $$
DECLARE
  v_article_id UUID;
  v_fc_id UUID;
BEGIN
  SELECT id INTO v_article_id FROM articles WHERE slug = 'remboursement-ozempic-diabete-justificatif-prescription-guide-2026' LIMIT 1;
  IF v_article_id IS NOT NULL THEN
    INSERT INTO fact_check_results (article_id, score_fiabilite, statut, points, sources, model_used, tokens_used)
    VALUES (
      v_article_id,
      70,
      'A verifier',
      '[
        {"check": "rybelsus_remboursement", "result": "ERREUR CRITIQUE", "detail": "Rybelsus listé remboursé alors que HAS avis défavorable"},
        {"check": "ozempic_2mg", "result": "ERREUR", "detail": "Dosage 2mg mentionné inexistant en France"},
        {"check": "victoza_trulicity_taux", "result": "OK", "detail": "Victoza 65%, Trulicity 65% confirmé"},
        {"check": "formulaire_obligatoire", "result": "OK", "detail": "Formulaire depuis février 2025 confirmé"}
      ]'::jsonb,
      '[{"url": "https://www.has-sante.fr/jcms/p_3225389/fr/rybelsus-semaglutide", "name": "HAS Rybelsus avis défavorable"}]'::jsonb,
      'claude-sonnet-4-6',
      0
    ) RETURNING id INTO v_fc_id;

    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'remboursement-ozempic-diabete-justificatif-prescription-guide-2026',
      'Remboursement Ozempic Diabète 2026 : Guide Justificatif',
      v_fc_id,
      'false_claim',
      'urgent',
      '- **Rybelsus** (sémaglutide oral 3 mg, 7 mg, 14 mg quotidien, Novo Nordisk) — remboursé à **30 %** (65 % en ALD diabète)',
      '- **Rybelsus** (sémaglutide oral 3 mg, 7 mg, 14 mg quotidien, Novo Nordisk) — **non remboursé** (avis HAS défavorable)',
      'Rybelsus est remboursé à 30% (65% en ALD diabète)',
      'Rybelsus n''est PAS remboursé en France. La HAS a émis un avis défavorable. Ne pas le lister parmi les médicaments remboursés.',
      'https://www.has-sante.fr/jcms/p_3225389/fr/rybelsus-semaglutide',
      'approved',
      'claude-sonnet-4-6'
    );

    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'remboursement-ozempic-diabete-justificatif-prescription-guide-2026',
      'Remboursement Ozempic Diabète 2026 : Guide Justificatif',
      v_fc_id,
      'info_outdated',
      'warning',
      '- **Ozempic** (sémaglutide 0,5 mg, 1 mg, 2 mg hebdomadaire, Novo Nordisk) — remboursé à **30 %** (65 % en ALD diabète)',
      '- **Ozempic** (sémaglutide 0,5 mg, 1 mg hebdomadaire, Novo Nordisk) — remboursé à **30 %** (65 % en ALD diabète)',
      'Ozempic disponible en France en dosage 0.5mg, 1mg et 2mg',
      'En France, Ozempic est commercialisé uniquement en 0.25mg, 0.5mg et 1mg selon la BDM ANSM. Le dosage 2mg n''est pas disponible.',
      'https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments/ozempic-0-25-mg-0-5-mg-1-mg-solution-injectable-en-stylo-prerempli-semaglutide-levure-saccharomyces-cerevisiae',
      'approved',
      'claude-sonnet-4-6'
    );

    UPDATE articles SET last_fact_checked = NOW() WHERE id = v_article_id;
    INSERT INTO agent_logs (agent_type, article_id, status, tokens_used, metadata)
    VALUES ('fact-check', v_article_id, 'success', 0, '{"tickets_created": 2, "score": 70}'::jsonb);
  END IF;
END $$;

-- ============================================================
-- ARTICLE 4: mounjaro-remboursement-securite-sociale-conditions-2026
-- Score: 82 - Statut: A verifier
-- Problème: Date avis HAS incorrecte (9 déc vs 19 nov 2025)
-- ============================================================
DO $$
DECLARE
  v_article_id UUID;
  v_fc_id UUID;
BEGIN
  SELECT id INTO v_article_id FROM articles WHERE slug = 'mounjaro-remboursement-securite-sociale-conditions-2026' LIMIT 1;
  IF v_article_id IS NOT NULL THEN
    INSERT INTO fact_check_results (article_id, score_fiabilite, statut, points, sources, model_used, tokens_used)
    VALUES (
      v_article_id,
      82,
      'A verifier',
      '[
        {"check": "has_avis_date", "result": "ERREUR", "detail": "Date avis HAS indiquée 9 déc 2025 mais document HAS daté 19 nov 2025"},
        {"check": "imc_conditions", "result": "OK", "detail": "IMC≥35 avec comorbidité confirmé par HAS"},
        {"check": "ceps_negociations", "result": "OK", "detail": "Négociations CEPS en cours confirmées"}
      ]'::jsonb,
      '[{"url": "https://www.has-sante.fr/jcms/p_3776028/fr/mounjaro-19112025-avis-ct21349", "name": "HAS avis CT21349 Mounjaro daté 19/11/2025"}]'::jsonb,
      'claude-sonnet-4-6',
      0
    ) RETURNING id INTO v_fc_id;

    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'mounjaro-remboursement-securite-sociale-conditions-2026',
      'Mounjaro Remboursement Sécurité Sociale 2026 : Guide',
      v_fc_id,
      'info_outdated',
      'warning',
      'avis favorable le 9 décembre 2025',
      'avis favorable le 19 novembre 2025',
      'La HAS a rendu un avis favorable sur Mounjaro le 9 décembre 2025',
      'La date exacte de l''avis HAS CT21349 sur Mounjaro est le 19 novembre 2025 (titre du document officiel HAS : MOUNJARO_19112025_AVIS_CT21349).',
      'https://www.has-sante.fr/jcms/p_3776028/fr/mounjaro-19112025-avis-ct21349',
      'approved',
      'claude-sonnet-4-6'
    );

    UPDATE articles SET last_fact_checked = NOW() WHERE id = v_article_id;
    INSERT INTO agent_logs (agent_type, article_id, status, tokens_used, metadata)
    VALUES ('fact-check', v_article_id, 'success', 0, '{"tickets_created": 1, "score": 82}'::jsonb);
  END IF;
END $$;

-- ============================================================
-- ARTICLE 5: remboursement-mounjaro-obesite-has-ceps-calendrier-conditions-2026
-- Score: 80 - Statut: A verifier
-- Problème: Date avis HAS incorrecte
-- ============================================================
DO $$
DECLARE
  v_article_id UUID;
  v_fc_id UUID;
BEGIN
  SELECT id INTO v_article_id FROM articles WHERE slug = 'remboursement-mounjaro-obesite-has-ceps-calendrier-conditions-2026' LIMIT 1;
  IF v_article_id IS NOT NULL THEN
    INSERT INTO fact_check_results (article_id, score_fiabilite, statut, points, sources, model_used, tokens_used)
    VALUES (
      v_article_id,
      80,
      'A verifier',
      '[
        {"check": "has_avis_date", "result": "ERREUR", "detail": "Date avis HAS 9 déc 2025 mais doc officiel daté 19 nov 2025"},
        {"check": "calendrier_ceps", "result": "OK", "detail": "Négociations CEPS confirmées"}
      ]'::jsonb,
      '[{"url": "https://www.has-sante.fr/jcms/p_3776028/fr/mounjaro-19112025-avis-ct21349", "name": "HAS avis CT21349 Mounjaro 19/11/2025"}]'::jsonb,
      'claude-sonnet-4-6',
      0
    ) RETURNING id INTO v_fc_id;

    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'remboursement-mounjaro-obesite-has-ceps-calendrier-conditions-2026',
      'Remboursement Mounjaro Obésité 2026 : HAS et CEPS',
      v_fc_id,
      'info_outdated',
      'warning',
      'avis favorable le 9 décembre 2025',
      'avis favorable le 19 novembre 2025',
      'La Commission de la Transparence HAS a rendu un avis favorable le 9 décembre 2025',
      'La date exacte de l''avis HAS CT21349 sur Mounjaro est le 19 novembre 2025 selon le document officiel de la HAS.',
      'https://www.has-sante.fr/jcms/p_3776028/fr/mounjaro-19112025-avis-ct21349',
      'approved',
      'claude-sonnet-4-6'
    );

    UPDATE articles SET last_fact_checked = NOW() WHERE id = v_article_id;
    INSERT INTO agent_logs (agent_type, article_id, status, tokens_used, metadata)
    VALUES ('fact-check', v_article_id, 'success', 0, '{"tickets_created": 1, "score": 80}'::jsonb);
  END IF;
END $$;

-- ============================================================
-- ARTICLE 6: prix-rybelsus-france
-- Score: 55 - Statut: Urgent
-- Problème: Information contradictoire sur le remboursement
-- ============================================================
DO $$
DECLARE
  v_article_id UUID;
  v_fc_id UUID;
BEGIN
  SELECT id INTO v_article_id FROM articles WHERE slug = 'prix-rybelsus-france' LIMIT 1;
  IF v_article_id IS NOT NULL THEN
    INSERT INTO fact_check_results (article_id, score_fiabilite, statut, points, sources, model_used, tokens_used)
    VALUES (
      v_article_id,
      55,
      'Urgent',
      '[
        {"check": "remboursement_statut", "result": "CONTRADICTOIRE", "detail": "FAQ dit non remboursé (avis HAS défavorable) mais aussi mentionne 65% SS - information contradictoire nécessitant correction urgente"}
      ]'::jsonb,
      '[{"url": "https://www.has-sante.fr/jcms/p_3225389/fr/rybelsus-semaglutide", "name": "HAS Rybelsus - avis défavorable au remboursement"}]'::jsonb,
      'claude-sonnet-4-6',
      0
    ) RETURNING id INTO v_fc_id;

    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'prix-rybelsus-france',
      'Prix Rybelsus France 2026 : Coût et Accessibilité',
      v_fc_id,
      'false_claim',
      'urgent',
      'Le prix officiel de Rybelsus en pharmacie est de 80-110€ par mois. Après remboursement (65% Sécurité Sociale pour le diabète de type 2 + mutuelle), le coût réel patient varie selon votre couverture.',
      'Le prix officiel de Rybelsus en pharmacie est de 80-110€ par mois. Rybelsus n''est pas remboursé par l''Assurance Maladie (avis HAS défavorable). Le coût est entièrement à la charge du patient.',
      'Rybelsus est remboursé à 65% par la Sécurité Sociale pour le diabète de type 2',
      'Rybelsus (sémaglutide oral) n''est PAS remboursé par l''Assurance Maladie en France. La HAS a rendu un avis défavorable. Prix à 100% à charge du patient.',
      'https://www.has-sante.fr/jcms/p_3225389/fr/rybelsus-semaglutide',
      'approved',
      'claude-sonnet-4-6'
    );

    UPDATE articles SET last_fact_checked = NOW() WHERE id = v_article_id;
    INSERT INTO agent_logs (agent_type, article_id, status, tokens_used, metadata)
    VALUES ('fact-check', v_article_id, 'success', 0, '{"tickets_created": 1, "score": 55}'::jsonb);
  END IF;
END $$;

-- ============================================================
-- ARTICLE 7: prix-trulicity-france
-- Score: 78 - Statut: A verifier
-- Problème: Condition de remboursement incorrecte (IMC≥30 mentionné)
-- ============================================================
DO $$
DECLARE
  v_article_id UUID;
  v_fc_id UUID;
BEGIN
  SELECT id INTO v_article_id FROM articles WHERE slug = 'prix-trulicity-france' LIMIT 1;
  IF v_article_id IS NOT NULL THEN
    INSERT INTO fact_check_results (article_id, score_fiabilite, statut, points, sources, model_used, tokens_used)
    VALUES (
      v_article_id,
      78,
      'A verifier',
      '[
        {"check": "prix", "result": "OK", "detail": "Prix ~80,12€/boîte confirmé BDM ANSM"},
        {"check": "taux_remboursement", "result": "OK", "detail": "65% pour DT2 confirmé"},
        {"check": "condition_remboursement", "result": "ERREUR", "detail": "FAQ dit IMC≥30 OR DT2 - FAUX, uniquement DT2"}
      ]'::jsonb,
      '[{"url": "https://base-donnees-publique.medicaments.gouv.fr/medicament/63787647/extrait", "name": "BDM ANSM Trulicity 1.5mg - remboursable 65% DT2"}]'::jsonb,
      'claude-sonnet-4-6',
      0
    ) RETURNING id INTO v_fc_id;

    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'prix-trulicity-france',
      'Prix Trulicity France 2026 : Remboursement et Mutuelle',
      v_fc_id,
      'false_claim',
      'warning',
      'Trulicity est remboursé à 65% par l''Assurance Maladie sous conditions : prescription médicale, IMC ≥ 30 ou diabète type 2 confirmé.',
      'Trulicity est remboursé à 65% par l''Assurance Maladie uniquement pour le traitement du diabète de type 2. L''IMC seul ne justifie pas le remboursement.',
      'Trulicity remboursé à 65% pour IMC ≥ 30 ou diabète de type 2',
      'Trulicity (dulaglutide) est remboursé à 65% uniquement dans l''indication diabète de type 2. Il n''est pas remboursé pour l''obésité ou le surpoids seuls.',
      'https://base-donnees-publique.medicaments.gouv.fr/medicament/63787647/extrait',
      'approved',
      'claude-sonnet-4-6'
    );

    UPDATE articles SET last_fact_checked = NOW() WHERE id = v_article_id;
    INSERT INTO agent_logs (agent_type, article_id, status, tokens_used, metadata)
    VALUES ('fact-check', v_article_id, 'success', 0, '{"tickets_created": 1, "score": 78}'::jsonb);
  END IF;
END $$;

-- ============================================================
-- ARTICLE 8: glp1-diabete-type-2-guide-patient-remboursement-france-2026
-- Score: 85 - Statut: A verifier
-- Problème: Ozempic dosage 2mg mentionné
-- ============================================================
DO $$
DECLARE
  v_article_id UUID;
  v_fc_id UUID;
BEGIN
  SELECT id INTO v_article_id FROM articles WHERE slug = 'glp1-diabete-type-2-guide-patient-remboursement-france-2026' LIMIT 1;
  IF v_article_id IS NOT NULL THEN
    INSERT INTO fact_check_results (article_id, score_fiabilite, statut, points, sources, model_used, tokens_used)
    VALUES (
      v_article_id,
      85,
      'A verifier',
      '[
        {"check": "ozempic_dosage", "result": "ERREUR", "detail": "Mentionne sémaglutide 0,5/1/2mg, le 2mg inexistant en France"},
        {"check": "remboursements_globaux", "result": "OK", "detail": "Taux remboursement autres molécules corrects"},
        {"check": "formulaire_2025", "result": "OK", "detail": "Formulaire obligatoire fév 2025 confirmé"}
      ]'::jsonb,
      '[{"url": "https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments/ozempic-0-25-mg-0-5-mg-1-mg-solution-injectable-en-stylo-prerempli-semaglutide-levure-saccharomyces-cerevisiae", "name": "ANSM disponibilité Ozempic uniquement 0.25/0.5/1mg"}]'::jsonb,
      'claude-sonnet-4-6',
      0
    ) RETURNING id INTO v_fc_id;

    INSERT INTO correction_tickets (article_id, slug, title, fact_check_result_id, ticket_type, urgence, before_exact, after_suggested, claim_original, realite_actuelle, source_reference, statut, model_used)
    VALUES (
      v_article_id,
      'glp1-diabete-type-2-guide-patient-remboursement-france-2026',
      'GLP-1 et Diabète Type 2 : Guide Complet Patient France 2026',
      v_fc_id,
      'info_outdated',
      'warning',
      '| **Ozempic** | Sémaglutide 0,5/1/2 mg | Diabète type 2 | Oui, 30% (avec formulaire) |',
      '| **Ozempic** | Sémaglutide 0,5/1 mg | Diabète type 2 | Oui, 30% (avec formulaire) |',
      'Ozempic existe en dosage 2mg en France',
      'Ozempic est disponible en France uniquement en dosages 0.25mg, 0.5mg et 1mg. Le dosage 2mg n''est pas commercialisé en France selon l''ANSM.',
      'https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments/ozempic-0-25-mg-0-5-mg-1-mg-solution-injectable-en-stylo-prerempli-semaglutide-levure-saccharomyces-cerevisiae',
      'approved',
      'claude-sonnet-4-6'
    );

    UPDATE articles SET last_fact_checked = NOW() WHERE id = v_article_id;
    INSERT INTO agent_logs (agent_type, article_id, status, tokens_used, metadata)
    VALUES ('fact-check', v_article_id, 'success', 0, '{"tickets_created": 1, "score": 85}'::jsonb);
  END IF;
END $$;

-- ============================================================
-- RÉSUMÉ: 8 articles vérifiés, 10 tickets créés
-- Score moyen: 73/100
-- Tickets urgents: 3 (Rybelsus faussement remboursé x2, prix-rybelsus)
-- Tickets warning: 7 (dosage 2mg Ozempic x4, date HAS Mounjaro x2, Trulicity IMC)
-- ============================================================
