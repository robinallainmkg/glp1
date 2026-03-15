-- =============================================================================
-- 015: Table analytics_data — données GA4 + GSC synchronisées
-- Utilisée par l'agent strategist pour orienter les décisions
-- =============================================================================

-- Données Google Analytics (pages vues, sessions, etc.)
CREATE TABLE IF NOT EXISTS ga_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  article_slug TEXT,
  date DATE NOT NULL,
  pageviews INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  avg_time_on_page NUMERIC(8,2) DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  source TEXT, -- organic, direct, social, referral
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_path, date, source)
);

-- Données Google Search Console (impressions, clics, positions)
CREATE TABLE IF NOT EXISTS gsc_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  article_slug TEXT,
  query TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr NUMERIC(5,4) DEFAULT 0,
  position NUMERIC(6,2) DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_path, query, date)
);

-- Décisions du strategist
CREATE TABLE IF NOT EXISTS strategist_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  decision_type TEXT NOT NULL, -- 'priority_boost', 'content_refresh', 'new_content', 'launch_agent', 'skip'
  target_slug TEXT, -- article concerné
  target_agent TEXT, -- agent à lancer
  reason TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_ga_metrics_date ON ga_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_ga_metrics_slug ON ga_metrics(article_slug);
CREATE INDEX IF NOT EXISTS idx_gsc_metrics_date ON gsc_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_metrics_slug ON gsc_metrics(article_slug);
CREATE INDEX IF NOT EXISTS idx_gsc_metrics_query ON gsc_metrics(query);
CREATE INDEX IF NOT EXISTS idx_strategist_decisions_type ON strategist_decisions(decision_type);
CREATE INDEX IF NOT EXISTS idx_strategist_decisions_applied ON strategist_decisions(applied);

-- RLS
ALTER TABLE ga_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategist_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ga_metrics_anon" ON ga_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "gsc_metrics_anon" ON gsc_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "strategist_decisions_anon" ON strategist_decisions FOR ALL USING (true) WITH CHECK (true);
