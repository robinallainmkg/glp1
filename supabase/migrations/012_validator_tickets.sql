-- Migration 012 : Permettre au validator de creer des correction_tickets
-- Date: 2026-03-14
-- Description: Rend fact_check_result_id nullable, ajoute source_agent,
--   etend les ticket_types pour les issues techniques du validator

-- 1. Rendre fact_check_result_id nullable (le validator n'a pas de fact_check_result)
ALTER TABLE correction_tickets ALTER COLUMN fact_check_result_id DROP NOT NULL;

-- 2. Ajouter colonne source_agent pour distinguer l'origine du ticket
ALTER TABLE correction_tickets ADD COLUMN IF NOT EXISTS source_agent VARCHAR(30) DEFAULT 'fact-check';

-- 3. Etendre les ticket_types pour inclure les issues du validator
ALTER TABLE correction_tickets DROP CONSTRAINT IF EXISTS correction_tickets_ticket_type_check;
ALTER TABLE correction_tickets ADD CONSTRAINT correction_tickets_ticket_type_check
  CHECK (ticket_type IN (
    -- Types fact-check existants
    'price_update', 'info_outdated', 'false_claim', 'missing_info', 'context_fr',
    -- Types validator
    'missing_description', 'broken_link', 'missing_image', 'seo_issue',
    'duplicate_content', 'sync_issue', 'content_quality', 'heading_issue',
    'html_issue', 'build_error'
  ));

-- 4. Rendre certains champs nullable (le validator n'a pas toujours before/after)
ALTER TABLE correction_tickets ALTER COLUMN before_exact DROP NOT NULL;
ALTER TABLE correction_tickets ALTER COLUMN after_suggested DROP NOT NULL;
ALTER TABLE correction_tickets ALTER COLUMN claim_original DROP NOT NULL;
ALTER TABLE correction_tickets ALTER COLUMN realite_actuelle DROP NOT NULL;

-- 5. Index sur source_agent
CREATE INDEX IF NOT EXISTS idx_tickets_source_agent ON correction_tickets(source_agent);

-- 6. Policy insert pour anon (le validator tourne en local avec anon key)
DROP POLICY IF EXISTS "tickets_insert_anon" ON correction_tickets;
CREATE POLICY "tickets_insert_anon" ON correction_tickets
  FOR INSERT WITH CHECK (true);
