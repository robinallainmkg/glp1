-- Migration 010: Agent Teams System
-- Tables for Claude Code Agent Teams coordination and results

-- ============================================
-- 1. agent_runs — Suivi haut niveau des executions
-- ============================================
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'running', 'completed', 'error')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  items_processed INTEGER DEFAULT 0,
  items_errors INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_runs_name ON agent_runs(agent_name);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_started ON agent_runs(started_at DESC);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_runs_select" ON agent_runs FOR SELECT USING (true);
CREATE POLICY "agent_runs_insert" ON agent_runs FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "agent_runs_update" ON agent_runs FOR UPDATE USING (auth.role() = 'service_role');

-- ============================================
-- 2. seo_audit_results — Resultats d'audit SEO
-- ============================================
CREATE TABLE IF NOT EXISTS seo_audit_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  audit_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'warning', 'info', 'ok')),
  page_url TEXT,
  issue_title TEXT NOT NULL,
  issue_detail TEXT,
  recommendation TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_seo_audit_type ON seo_audit_results(audit_type);
CREATE INDEX idx_seo_audit_severity ON seo_audit_results(severity);
CREATE INDEX idx_seo_audit_run ON seo_audit_results(agent_run_id);

ALTER TABLE seo_audit_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo_audit_select" ON seo_audit_results FOR SELECT USING (true);
CREATE POLICY "seo_audit_insert" ON seo_audit_results FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 3. keyword_rankings — Suivi des mots-cles
-- ============================================
CREATE TABLE IF NOT EXISTS keyword_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  keyword_type VARCHAR(20) NOT NULL CHECK (keyword_type IN ('primary', 'secondary')),
  position INTEGER,
  previous_position INTEGER,
  search_url TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  week_number INTEGER,
  month VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rankings_article ON keyword_rankings(article_id);
CREATE INDEX idx_rankings_keyword ON keyword_rankings(keyword);
CREATE INDEX idx_rankings_week ON keyword_rankings(week_number);
CREATE INDEX idx_rankings_checked ON keyword_rankings(checked_at DESC);

ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rankings_select" ON keyword_rankings FOR SELECT USING (true);
CREATE POLICY "rankings_insert" ON keyword_rankings FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 4. content_opportunities — Opportunites de contenu
-- ============================================
CREATE TABLE IF NOT EXISTS content_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT,
  target_keyword TEXT,
  estimated_volume VARCHAR(50),
  competition VARCHAR(50),
  priority INTEGER CHECK (priority BETWEEN 1 AND 10),
  suggested_collection VARCHAR(100),
  suggested_slug TEXT,
  source_urls JSONB DEFAULT '[]'::jsonb,
  competitor_urls JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'identified'
    CHECK (status IN ('identified', 'approved', 'in_progress', 'published', 'rejected')),
  human_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_opportunities_status ON content_opportunities(status);
CREATE INDEX idx_opportunities_priority ON content_opportunities(priority);
CREATE INDEX idx_opportunities_run ON content_opportunities(agent_run_id);

ALTER TABLE content_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opportunities_select" ON content_opportunities FOR SELECT USING (true);
CREATE POLICY "opportunities_insert" ON content_opportunities FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "opportunities_update_anon" ON content_opportunities FOR UPDATE
  USING (true)
  WITH CHECK (true);
