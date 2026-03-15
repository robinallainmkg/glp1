-- Migration: Create seo_opportunities table
-- Used by: seo-opportunity-agent.mjs, content-creator-agent.mjs
-- Date: 2026-03-14

CREATE TABLE IF NOT EXISTS seo_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Classification
  priority INTEGER DEFAULT 99,
  type TEXT NOT NULL DEFAULT 'new_article' CHECK (type IN ('new_article', 'enrich_existing', 'update_needed', 'trending')),
  potential TEXT DEFAULT 'medium' CHECK (potential IN ('high', 'medium', 'low')),

  -- Keyword data
  keyword_main TEXT NOT NULL,
  keywords_secondary TEXT[] DEFAULT '{}',

  -- Content suggestion
  suggested_title TEXT,
  suggested_slug TEXT,
  collection TEXT,
  content_brief TEXT,
  rationale TEXT,
  competitor_coverage TEXT,
  estimated_searches TEXT,

  -- Human review
  human_note TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
    status IN ('pending_review', 'approved', 'rejected', 'in_progress', 'content_created', 'published')
  ),
  article_slug TEXT, -- slug de l'article cree (apres content_created)

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for agent queries
CREATE INDEX IF NOT EXISTS idx_seo_opportunities_status ON seo_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_seo_opportunities_keyword ON seo_opportunities(keyword_main);
CREATE INDEX IF NOT EXISTS idx_seo_opportunities_priority ON seo_opportunities(priority);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_seo_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_seo_opportunities_updated_at
  BEFORE UPDATE ON seo_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_opportunities_updated_at();

-- RLS (Row Level Security)
ALTER TABLE seo_opportunities ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on seo_opportunities"
  ON seo_opportunities
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow anon read access (for admin dashboard)
CREATE POLICY "Anon read access on seo_opportunities"
  ON seo_opportunities
  FOR SELECT
  USING (true);

-- Allow anon update (for admin dashboard status changes)
CREATE POLICY "Anon update access on seo_opportunities"
  ON seo_opportunities
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
