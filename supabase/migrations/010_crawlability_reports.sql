-- Migration : Table des rapports de crawlabilite
-- Date: 2026-03-09
-- Description: Stocke les resultats d'analyse de crawlabilite du site

CREATE TABLE IF NOT EXISTS crawlability_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  summary JSONB NOT NULL,
  orphan_pages JSONB DEFAULT '[]',
  unreachable_pages JSONB DEFAULT '[]',
  deep_pages JSONB DEFAULT '[]',
  noindex_pages JSONB DEFAULT '[]',
  missing_from_sitemap JSONB DEFAULT '[]',
  sitemap_ghosts JSONB DEFAULT '[]',
  priority_issues JSONB DEFAULT '[]',
  article_scores JSONB DEFAULT '[]'
);

-- Index sur la date de creation pour trier par plus recent
CREATE INDEX IF NOT EXISTS idx_crawlability_reports_created_at ON crawlability_reports (created_at DESC);

-- RLS : lecture publique (anon key), ecriture service role uniquement
ALTER TABLE crawlability_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crawlability_reports_select_anon"
  ON crawlability_reports FOR SELECT
  TO anon USING (true);

CREATE POLICY "crawlability_reports_insert_service"
  ON crawlability_reports FOR INSERT
  TO service_role WITH CHECK (true);

CREATE POLICY "crawlability_reports_delete_service"
  ON crawlability_reports FOR DELETE
  TO service_role USING (true);
