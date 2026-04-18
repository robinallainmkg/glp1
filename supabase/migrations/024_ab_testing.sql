-- =============================================
-- A/B Testing Infrastructure
-- Tables: ab_tests, ab_impressions, ab_conversions
-- =============================================

-- 1. ab_tests — Test definitions
CREATE TABLE IF NOT EXISTS ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  page_target text NOT NULL DEFAULT '/',
  element_selector text,
  variants jsonb NOT NULL DEFAULT '[{"id":"control","label":"Original","weight":50},{"id":"B","label":"Variante B","weight":50}]',
  primary_metric text NOT NULL DEFAULT 'cta_click',
  secondary_metrics text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  started_at timestamptz,
  ended_at timestamptz,
  min_sample_size int NOT NULL DEFAULT 1000,
  confidence_target float NOT NULL DEFAULT 0.95,
  winner_variant text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. ab_impressions — Variant exposures
CREATE TABLE IF NOT EXISTS ab_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id text NOT NULL,
  session_id text NOT NULL,
  page_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. ab_conversions — Tracked conversions
CREATE TABLE IF NOT EXISTS ab_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id text NOT NULL,
  session_id text NOT NULL,
  metric_name text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_ab_impressions_test_variant ON ab_impressions(test_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_impressions_session ON ab_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_ab_impressions_created ON ab_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_ab_conversions_test_variant ON ab_conversions(test_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_conversions_metric ON ab_conversions(test_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_ab_conversions_created ON ab_conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);

-- Deduplicate impressions: one per session per test
CREATE UNIQUE INDEX IF NOT EXISTS idx_ab_impressions_unique_session ON ab_impressions(test_id, session_id);

-- RLS policies
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_conversions ENABLE ROW LEVEL SECURITY;

-- Read access for anon (needed for client-side engine to fetch active tests)
DROP POLICY IF EXISTS "ab_tests_read" ON ab_tests;
CREATE POLICY "ab_tests_read" ON ab_tests FOR SELECT USING (true);

-- Insert access for anon (client tracks impressions & conversions)
DROP POLICY IF EXISTS "ab_impressions_insert" ON ab_impressions;
CREATE POLICY "ab_impressions_insert" ON ab_impressions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "ab_impressions_read" ON ab_impressions;
CREATE POLICY "ab_impressions_read" ON ab_impressions FOR SELECT USING (true);

DROP POLICY IF EXISTS "ab_conversions_insert" ON ab_conversions;
CREATE POLICY "ab_conversions_insert" ON ab_conversions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "ab_conversions_read" ON ab_conversions;
CREATE POLICY "ab_conversions_read" ON ab_conversions FOR SELECT USING (true);

-- Admin can manage tests (insert/update/delete)
DROP POLICY IF EXISTS "ab_tests_admin" ON ab_tests;
CREATE POLICY "ab_tests_admin" ON ab_tests FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_ab_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ab_tests_updated_at ON ab_tests;
CREATE TRIGGER ab_tests_updated_at
  BEFORE UPDATE ON ab_tests
  FOR EACH ROW EXECUTE FUNCTION update_ab_tests_updated_at();

-- Materialized view for fast stats (optional, can be refreshed periodically)
-- Using a regular view for simplicity since traffic is manageable
CREATE OR REPLACE VIEW ab_test_stats AS
SELECT
  t.id AS test_id,
  t.name AS test_name,
  t.status,
  t.primary_metric,
  v.variant_id,
  v.variant_label,
  COALESCE(imp.impression_count, 0) AS impressions,
  COALESCE(conv.conversion_count, 0) AS conversions,
  CASE WHEN COALESCE(imp.impression_count, 0) > 0
    THEN ROUND(COALESCE(conv.conversion_count, 0)::numeric / imp.impression_count * 100, 2)
    ELSE 0
  END AS conversion_rate
FROM ab_tests t
CROSS JOIN LATERAL (
  SELECT
    elem->>'id' AS variant_id,
    elem->>'label' AS variant_label
  FROM jsonb_array_elements(t.variants) AS elem
) v
LEFT JOIN (
  SELECT test_id, variant_id, COUNT(*) AS impression_count
  FROM ab_impressions
  GROUP BY test_id, variant_id
) imp ON imp.test_id = t.id AND imp.variant_id = v.variant_id
LEFT JOIN (
  SELECT test_id, variant_id, COUNT(*) AS conversion_count
  FROM ab_conversions c
  JOIN ab_tests t2 ON c.test_id = t2.id AND c.metric_name = t2.primary_metric
  GROUP BY test_id, variant_id
) conv ON conv.test_id = t.id AND conv.variant_id = v.variant_id;
