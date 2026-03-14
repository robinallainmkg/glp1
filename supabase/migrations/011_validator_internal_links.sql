-- Migration 011: Tables for validator and internal-links agents

-- Table: validation_results (agent validator)
CREATE TABLE IF NOT EXISTS validation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id UUID REFERENCES agent_runs(id),
  article_slug TEXT NOT NULL,
  check_type VARCHAR(50) NOT NULL CHECK (check_type IN ('build', 'frontmatter', 'links', 'images', 'seo_meta', 'schema')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('error', 'warning', 'info', 'pass')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: internal_link_suggestions (agent internal-links)
CREATE TABLE IF NOT EXISTS internal_link_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id UUID REFERENCES agent_runs(id),
  source_slug TEXT NOT NULL,
  target_slug TEXT NOT NULL,
  anchor_text TEXT,
  context_sentence TEXT,
  link_type VARCHAR(30) NOT NULL CHECK (link_type IN ('contextual', 'related', 'see_also', 'definition')),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  status VARCHAR(20) DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'applied', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_link_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "validation_results_anon_read" ON validation_results FOR SELECT TO anon USING (true);
CREATE POLICY "validation_results_anon_insert" ON validation_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "internal_link_suggestions_anon_read" ON internal_link_suggestions FOR SELECT TO anon USING (true);
CREATE POLICY "internal_link_suggestions_anon_insert" ON internal_link_suggestions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "internal_link_suggestions_anon_update" ON internal_link_suggestions FOR UPDATE TO anon USING (true) WITH CHECK (true);
