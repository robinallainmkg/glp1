-- Migration : Systeme de Tickets Before/After (Phase 3)
-- Date: 2026-03-07
-- Description: Remplace editorial_queue par un systeme de tickets granulaires
--   1 probleme detecte = 1 ticket independant avec diff Before/After

-- =============================================================================
-- Table `correction_tickets` : Tickets de correction individuels
-- =============================================================================
CREATE TABLE IF NOT EXISTS correction_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Reference article
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,

  -- Reference fact-check
  fact_check_result_id UUID NOT NULL REFERENCES fact_check_results(id) ON DELETE CASCADE,

  -- Classification
  ticket_type VARCHAR(30) NOT NULL DEFAULT 'info_outdated'
    CHECK (ticket_type IN ('price_update', 'info_outdated', 'false_claim', 'missing_info')),
  urgence VARCHAR(20) NOT NULL DEFAULT 'warning'
    CHECK (urgence IN ('urgent', 'warning', 'ok')),

  -- Diff Before/After
  before_exact TEXT NOT NULL,          -- Citation mot pour mot du markdown source
  after_suggested TEXT NOT NULL,       -- Correction proposee par le fact-checker
  after_final TEXT,                    -- Version finale redigee par l'Agent Editorial

  -- Contexte fact-check
  claim_original TEXT NOT NULL,        -- Resume du claim pour affichage humain
  realite_actuelle TEXT NOT NULL,      -- Explication detaillee + source
  source_reference TEXT,               -- URL de la source

  -- Feedback humain
  human_note TEXT,                     -- Note de rejet optionnelle

  -- Workflow
  statut VARCHAR(30) NOT NULL DEFAULT 'pending_review'
    CHECK (statut IN (
      'pending_review',    -- En attente de review humaine
      'approved',          -- Approuve, pret pour l'editorial
      'rejected',          -- Rejete, archive
      'in_progress',       -- Agent editorial en cours
      'ready_to_deploy',   -- after_final pret, en attente deploy
      'deployed',          -- Applique au markdown + PR creee
      'revision_needed'    -- Rejete avec note, renvoye a l'editorial
    )),

  -- Metadata agent
  model_used VARCHAR(100),
  tokens_used INTEGER,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  deployed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- Index (idempotent)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_tickets_statut ON correction_tickets(statut);
CREATE INDEX IF NOT EXISTS idx_tickets_article_id ON correction_tickets(article_id);
CREATE INDEX IF NOT EXISTS idx_tickets_fact_check_id ON correction_tickets(fact_check_result_id);
CREATE INDEX IF NOT EXISTS idx_tickets_urgence ON correction_tickets(urgence);
CREATE INDEX IF NOT EXISTS idx_tickets_type ON correction_tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON correction_tickets(created_at DESC);

-- =============================================================================
-- Trigger updated_at (idempotent)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ticket_updated_at ON correction_tickets;
CREATE TRIGGER trigger_ticket_updated_at
  BEFORE UPDATE ON correction_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_updated_at();

-- =============================================================================
-- Row Level Security (idempotent)
-- =============================================================================
ALTER TABLE correction_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_read_all" ON correction_tickets;
CREATE POLICY "tickets_read_all" ON correction_tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "tickets_write_service" ON correction_tickets;
CREATE POLICY "tickets_write_service" ON correction_tickets FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "tickets_update_anon" ON correction_tickets;
CREATE POLICY "tickets_update_anon" ON correction_tickets
  FOR UPDATE
  USING (true)
  WITH CHECK (
    statut IN ('approved', 'rejected', 'revision_needed', 'pending_review')
  );
