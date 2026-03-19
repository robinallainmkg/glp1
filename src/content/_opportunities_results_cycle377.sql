-- ============================================================
-- OPPORTUNITIES RUN - Cycle 377 - 2026-03-19
-- Agent: claude-sonnet-4-6
-- Méthode: inventaire src/content/ + analyse tendances GLP-1 2025-2026
-- Opportunités identifiées: 10 (sujets non encore couverts)
-- Collections couverts: 4 (effets-secondaires-glp1, glp1-perte-de-poids,
--                          recherche-glp1, traitements-glp1, temoignages)
-- ============================================================

-- ETAPE 1: Créer le run
-- Exécuter d'abord ceci et récupérer l'UUID retourné pour remplacer <RUN_ID> ci-dessous:
INSERT INTO agent_runs (agent_name, status, items_processed, items_errors, completed_at, metadata)
VALUES (
  'opportunities',
  'completed',
  10,
  0,
  NOW(),
  '{"new_opportunities": 10, "high_priority": 3, "collections_covered": 5, "total_analyzed": 10, "run_date": "2026-03-19"}'::jsonb
)
RETURNING id;

-- ============================================================
-- ETAPE 2: Insérer les opportunités (remplacer <RUN_ID> par l'UUID retourné)
-- ============================================================

-- PRIORITÉ 1 — Effets secondaires Mounjaro
-- Keyword: "effets secondaires Mounjaro tirzepatide" | Volume: HIGH | Competition: MEDIUM
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'Effets secondaires Mounjaro (tirzepatide) : guide complet et gestion semaine par semaine',
  'Mounjaro est le GLP-1 le plus prescrit en France 2025-2026 mais aucun article sur le site ne couvre ses effets secondaires spécifiques. Nausées (44%), vomissements, diarrhées, pancréatite, signal thyroïde EMA, réactions site injection — avec conseils pratiques pour les réduire.',
  'effets secondaires Mounjaro tirzepatide',
  'high', 'medium', 1,
  'effets-secondaires-glp1',
  'effets-secondaires-mounjaro-tirzepatide-guide-complet',
  '["https://www.ema.europa.eu/en/medicines/human/EPAR/mounjaro","https://ansm.sante.fr"]'::jsonb,
  '["https://www.doctissimo.fr/medicaments/mounjaro","https://www.vidal.fr/medicaments/gammes/mounjaro"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- PRIORITÉ 2 — Timeline effets GLP-1
-- Keyword: "combien de temps effet GLP-1 Ozempic semaine resultats" | Volume: HIGH | Competition: MEDIUM
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'Combien de temps prend un GLP-1 pour faire effet ? Timeline semaine par semaine',
  'Question la plus posée par les nouveaux patients. Guide pratique avec timeline : semaines 1-4 adaptation et effets secondaires, semaines 4-12 premières pertes de poids, mois 3-6 accélération, mois 6-12 plateau/objectif. Format idéal pour SEO longue traîne. Aucun article similaire sur le site.',
  'combien de temps effet GLP-1 Ozempic semaine resultats',
  'high', 'medium', 2,
  'glp1-perte-de-poids',
  'combien-temps-effet-glp1-ozempic-wegovy-resultats-semaine-par-semaine',
  '["https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9271646/","https://www.has-sante.fr"]'::jsonb,
  '["https://www.doctissimo.fr","https://www.sante-magazine.fr","https://www.passeportsante.net"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- PRIORITÉ 3 — GLP-1 et NASH/NAFLD
-- Keyword: "GLP-1 foie stéatose hépatique NASH traitement" | Volume: MEDIUM | Competition: LOW
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'GLP-1 et stéatose hépatique (NASH/NAFLD) : résultats cliniques et espoirs 2025',
  'La stéatose hépatique non alcoolique touche 25% des adultes obèses en France. L''essai ESSENCE (semaglutide) a montré une réduction significative de la stéatose et fibrose hépatique. Sujet émergent en 2025, aucun article sur le site. Potentiel élevé pour les millions de patients avec comorbidités hépatiques.',
  'GLP-1 foie stéatose hépatique NASH traitement',
  'medium', 'low', 3,
  'recherche-glp1',
  'glp1-steatose-hepatique-nash-nafld-semaglutide-resultats-2025',
  '["https://www.nejm.org","https://www.snfge.org"]'::jsonb,
  '["https://www.passeportsante.net","https://www.vidal.fr"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- PRIORITÉ 4 — Guide complet Rybelsus
-- Keyword: "Rybelsus semaglutide oral comprimé guide avis efficacité" | Volume: HIGH | Competition: MEDIUM
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'Guide complet Rybelsus (semaglutide oral comprimé) : utilisation, efficacité et avis patient',
  'Il existe déjà un article prix-rybelsus mais pas de guide complet patient : règles de prise strictes (à jeun, eau pure), courbe efficacité vs injectable, dosages 3/7/14mg, effets secondaires spécifiques de la voie orale, remboursement SS. Fort potentiel pour patients refusant les injections.',
  'Rybelsus semaglutide oral comprimé guide avis efficacité',
  'high', 'medium', 4,
  'traitements-glp1',
  'rybelsus-semaglutide-oral-guide-complet-utilisation-efficacite-avis',
  '["https://www.ema.europa.eu/en/medicines/human/EPAR/rybelsus","https://www.ameli.fr"]'::jsonb,
  '["https://www.vidal.fr/medicaments/gammes/rybelsus","https://www.doctissimo.fr"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- PRIORITÉ 5 — GLP-1 prévention cardiovasculaire SELECT
-- Keyword: "GLP-1 prévention cardiovasculaire infarctus AVC essai SELECT" | Volume: MEDIUM | Competition: LOW
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'GLP-1 et prévention cardiovasculaire : essai SELECT, infarctus et AVC — résultats France',
  'L''essai SELECT (semaglutide, -20% événements cardiovasculaires chez non-diabétiques obèses) a transformé les GLP-1 en médicaments de prévention cardio. Les cardiologues français commencent à les prescrire hors diabète. Article de fond sur les preuves, indications actuelles et prise en charge SS 2026.',
  'GLP-1 prévention cardiovasculaire infarctus AVC essai SELECT',
  'medium', 'low', 5,
  'recherche-glp1',
  'glp1-prevention-cardiovasculaire-infarctus-avc-essai-select-france-2026',
  '["https://www.nejm.org/doi/full/10.1056/NEJMoa2307563","https://www.sfcardio.fr"]'::jsonb,
  '["https://www.passeportsante.net","https://www.vidal.fr"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- PRIORITÉ 6 — Zepbound vs Mounjaro
-- Keyword: "Zepbound vs Mounjaro différence France tirzepatide" | Volume: MEDIUM | Competition: LOW
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'Zepbound vs Mounjaro : même molécule tirzepatide, deux indications — ce qui change en France',
  'Beaucoup de patients confondent Zepbound (tirzepatide pour obésité, AMM EMA 2024) et Mounjaro (tirzepatide pour diabète type 2). Article comparatif pratique : différences légales d''indication, remboursement SS en France, disponibilité en pharmacie, et pourquoi le médecin prescrit l''un plutôt que l''autre.',
  'Zepbound vs Mounjaro différence France tirzepatide',
  'medium', 'low', 6,
  'traitements-glp1',
  'zepbound-vs-mounjaro-difference-obesite-diabete-tirzepatide-france',
  '["https://www.ema.europa.eu/en/medicines/human/EPAR/zepbound","https://ansm.sante.fr"]'::jsonb,
  '["https://www.vidal.fr","https://www.doctissimo.fr"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- PRIORITÉ 7 — Arrêter Ozempic/Mounjaro protocole
-- Keyword: "comment arrêter Ozempic Mounjaro sevrage progressif protocole" | Volume: HIGH | Competition: LOW
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'Comment arrêter Ozempic ou Mounjaro : protocole de sevrage progressif et transition',
  'Distinct de l''article arret-glp1-reprise-poids (phénomène yoyo) : focus sur le COMMENT arrêter — réduction progressive des doses, suivi glycémique pour diabétiques, transition vers autre traitement, durée minimale recommandée, soutien nutritionnel renforcé. Besoin fort des patients arrêtant pour raisons financières.',
  'comment arrêter Ozempic Mounjaro sevrage progressif protocole',
  'high', 'low', 7,
  'traitements-glp1',
  'comment-arreter-ozempic-mounjaro-protocole-sevrage-progressif-transition',
  '["https://www.has-sante.fr","https://ansm.sante.fr"]'::jsonb,
  '["https://www.sante-magazine.fr","https://www.doctissimo.fr"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- PRIORITÉ 8 — GLP-1 et TCA/boulimie
-- Keyword: "GLP-1 troubles comportement alimentaire boulimie hyperphagie binge eating" | Volume: MEDIUM | Competition: LOW
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'GLP-1 et troubles du comportement alimentaire : boulimie et hyperphagie — données 2025',
  'Les GLP-1 agissent sur les circuits de récompense cérébraux et réduisent les compulsions alimentaires. Études prometteuses 2024-2025 sur la réduction des épisodes de binge eating. Sujet très recherché par les patients souffrant d''hyperphagie boulimique. Aucun article sur le site.',
  'GLP-1 troubles comportement alimentaire boulimie hyperphagie binge eating',
  'medium', 'low', 8,
  'recherche-glp1',
  'glp1-troubles-comportement-alimentaire-boulimie-hyperphagie-tca-etudes-2025',
  '["https://www.ncbi.nlm.nih.gov","https://www.ffab.fr"]'::jsonb,
  '["https://www.passeportsante.net","https://www.doctissimo.fr"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- PRIORITÉ 9 — Témoignage Wegovy post-bariatrique
-- Keyword: "temoignage Wegovy après chirurgie bariatrique sleeve reprise poids" | Volume: MEDIUM | Competition: LOW
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'Témoignage : Wegovy après chirurgie bariatrique inefficace — transformation réelle',
  'Témoignage authentique d''une patiente ayant subi une sleeve gastrectomie avec reprise de poids, puis débuté Wegovy. Profil représentatif d''une population croissante (70 000 opérés bariatriques/an en France + taux de reprise élevé). Croisement temoignages + glp1-vs-chirurgie-bariatrique.',
  'temoignage Wegovy après chirurgie bariatrique sleeve reprise poids',
  'medium', 'low', 9,
  'temoignages',
  'temoignage-femme-wegovy-apres-chirurgie-bariatrique-sleeve-reprise-poids',
  '[]'::jsonb,
  '["https://www.doctissimo.fr","https://www.sante-magazine.fr"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- PRIORITÉ 10 — GLP-1 et Alzheimer/cognition
-- Keyword: "GLP-1 Alzheimer démence déclin cognitif semaglutide étude" | Volume: MEDIUM | Competition: LOW
INSERT INTO content_opportunities (
  agent_run_id, topic, description, target_keyword,
  estimated_volume, competition, priority,
  suggested_collection, suggested_slug, source_urls, competitor_urls, status
)
SELECT
  id,
  'GLP-1 et Alzheimer / déclin cognitif : premières preuves et essai EVOKE 2026',
  'Des études observationnelles 2023-2025 suggèrent que le semaglutide réduit le risque de démence et ralentit le déclin cognitif. L''essai EVOKE (semaglutide vs Alzheimer) est en cours. Sujet très médiatisé en 2025, aucun article sur le site. Public large : aidants familiaux, seniors.',
  'GLP-1 Alzheimer démence déclin cognitif semaglutide étude',
  'medium', 'low', 10,
  'recherche-glp1',
  'glp1-alzheimer-demence-declin-cognitif-semaglutide-etude-evoke-2026',
  '["https://www.alzheimer-europe.org","https://www.ncbi.nlm.nih.gov"]'::jsonb,
  '["https://www.passeportsante.net","https://www.doctissimo.fr"]'::jsonb,
  'approved'
FROM agent_runs
WHERE agent_name = 'opportunities' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;

-- ============================================================
-- Vérification finale
-- ============================================================
SELECT id, priority, target_keyword, status, created_at
FROM content_opportunities
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY priority ASC;
