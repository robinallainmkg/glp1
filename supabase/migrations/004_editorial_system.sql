-- Migration : Système éditorial (Agent Éditorial — Phase 2)
-- Date: 2026-03-07
-- Description: Table pour la file d'attente éditoriale avec corrections IA

-- =============================================================================
-- Table `editorial_queue` : Corrections rédigées par l'agent éditorial
-- =============================================================================
CREATE TABLE IF NOT EXISTS editorial_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fact_check_id UUID NOT NULL REFERENCES fact_check_results(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

  -- Point original du fact-check
  claim_original TEXT NOT NULL,
  realite_actuelle TEXT NOT NULL,
  source_reference TEXT,
  urgence VARCHAR(20) NOT NULL DEFAULT 'moyen',

  -- Correction rédigée par Claude
  section_originale TEXT,           -- Extrait de l'article original
  section_corrigee TEXT,            -- Version corrigée par l'agent
  explication_correction TEXT,      -- Justification de la correction
  model_used VARCHAR(100),
  tokens_used INTEGER,

  -- Workflow
  statut VARCHAR(30) NOT NULL DEFAULT 'requested'
    CHECK (statut IN ('requested', 'processing', 'pending_review', 'approved', 'rejected', 'applied')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_editorial_queue_statut ON editorial_queue(statut);
CREATE INDEX idx_editorial_queue_article_id ON editorial_queue(article_id);
CREATE INDEX idx_editorial_queue_fact_check_id ON editorial_queue(fact_check_id);
CREATE INDEX idx_editorial_queue_urgence ON editorial_queue(urgence);
CREATE INDEX idx_editorial_queue_requested_at ON editorial_queue(requested_at DESC);

-- =============================================================================
-- Row Level Security
-- =============================================================================
ALTER TABLE editorial_queue ENABLE ROW LEVEL SECURITY;

-- Lecture publique (dashboard admin)
CREATE POLICY "editorial_queue_read_all" ON editorial_queue FOR SELECT USING (true);

-- Écriture service_role (agent éditorial)
CREATE POLICY "editorial_queue_write_service" ON editorial_queue FOR ALL USING (auth.role() = 'service_role');

-- Insertion anon (bouton dashboard — insère uniquement avec statut 'requested')
CREATE POLICY "editorial_queue_insert_anon" ON editorial_queue
  FOR INSERT
  WITH CHECK (statut = 'requested');
