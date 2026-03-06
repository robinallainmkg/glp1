-- Migration : Système de fact-checking automatisé (Phase 1)
-- Date: 2026-03-06
-- Description: Tables pour l'agent fact-check GLP1

-- =============================================================================
-- Table `articles` : Copie indexable des articles markdown pour le fact-checking
-- =============================================================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  collection VARCHAR(100) NOT NULL,
  author VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_fact_checked TIMESTAMP WITH TIME ZONE,
  content_hash VARCHAR(64),  -- SHA-256 pour détecter les changements
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_collection ON articles(collection);
CREATE INDEX idx_articles_last_fact_checked ON articles(last_fact_checked NULLS FIRST);
CREATE INDEX idx_articles_is_active ON articles(is_active);

-- =============================================================================
-- Table `fact_check_results` : Résultats des vérifications par l'agent
-- =============================================================================
CREATE TABLE IF NOT EXISTS fact_check_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  score_fiabilite INTEGER CHECK (score_fiabilite BETWEEN 0 AND 100),
  statut VARCHAR(20) NOT NULL CHECK (statut IN ('OK', 'À vérifier', 'Urgent')),
  points JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Format attendu pour `points` :
  -- [{"claim_original": "...", "realite_actuelle": "...", "source": "...", "urgence": "faible|moyen|urgent"}]
  sources JSONB DEFAULT '[]'::jsonb,
  model_used VARCHAR(100) DEFAULT 'claude-sonnet-4-20250514',
  tokens_used INTEGER,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fact_check_article_id ON fact_check_results(article_id);
CREATE INDEX idx_fact_check_statut ON fact_check_results(statut);
CREATE INDEX idx_fact_check_checked_at ON fact_check_results(checked_at DESC);
CREATE INDEX idx_fact_check_score ON fact_check_results(score_fiabilite);

-- =============================================================================
-- Table `agent_logs` : Journal d'exécution des agents
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_type VARCHAR(50) NOT NULL DEFAULT 'fact-check',
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'success', 'error', 'skipped')),
  duration_ms INTEGER,
  tokens_used INTEGER,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_type ON agent_logs(agent_type);
CREATE INDEX idx_agent_logs_status ON agent_logs(status);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at DESC);
CREATE INDEX idx_agent_logs_article_id ON agent_logs(article_id);

-- =============================================================================
-- Trigger updated_at automatique (réutilise la fonction existante si elle existe)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Row Level Security
-- =============================================================================

-- Articles : lecture publique, écriture service_role uniquement
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_read_all" ON articles FOR SELECT USING (true);
CREATE POLICY "articles_write_service" ON articles FOR ALL USING (auth.role() = 'service_role');

-- Fact check results : lecture publique (dashboard admin), écriture service_role
ALTER TABLE fact_check_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fact_check_read_all" ON fact_check_results FOR SELECT USING (true);
CREATE POLICY "fact_check_write_service" ON fact_check_results FOR ALL USING (auth.role() = 'service_role');

-- Agent logs : service_role uniquement
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_logs_read_all" ON agent_logs FOR SELECT USING (true);
CREATE POLICY "agent_logs_write_service" ON agent_logs FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- Vue utilitaire : derniers résultats de fact-check par article
-- =============================================================================
CREATE OR REPLACE VIEW latest_fact_checks AS
SELECT DISTINCT ON (fcr.article_id)
  fcr.id AS fact_check_id,
  a.slug,
  a.title,
  a.collection,
  fcr.score_fiabilite,
  fcr.statut,
  fcr.points,
  fcr.sources,
  fcr.checked_at,
  fcr.model_used
FROM fact_check_results fcr
JOIN articles a ON a.id = fcr.article_id
WHERE a.is_active = true
ORDER BY fcr.article_id, fcr.checked_at DESC;
