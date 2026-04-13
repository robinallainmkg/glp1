-- =============================================================================
-- Managed Agent Orchestrator — central tables for GLP1-EU multi-country pilot
-- Used by the Anthropic Managed Agent running in the cloud + the local bridge.
-- =============================================================================

-- 1. Countries targeted by the orchestrator
CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY,              -- ISO-3166-1 alpha-2, e.g. 'DE'
  name TEXT NOT NULL,
  language TEXT NOT NULL,             -- e.g. 'de-DE'
  tld TEXT,                           -- e.g. 'glp1-deutschland.de'
  market_score NUMERIC,               -- 0-100 from Phase 0
  priority INTEGER,                   -- 1-5, lower is higher prio
  regulatory_framework JSONB,         -- sources, constraints, ad rules
  whitelisted_sources TEXT[],         -- domains allowed for fact-check
  pivot_keywords TEXT[],
  status TEXT DEFAULT 'candidate'     -- candidate | validated | bootstrapping | live | paused
    CHECK (status IN ('candidate','validated','bootstrapping','live','paused')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Deployments — one row per country site
CREATE TABLE IF NOT EXISTS deployments (
  id SERIAL PRIMARY KEY,
  country_code TEXT REFERENCES countries(code) ON DELETE CASCADE,
  github_repo TEXT,
  supabase_project_ref TEXT,
  hosting_target TEXT,                -- 'hostinger' | 'cf_pages'
  domain TEXT,
  phase TEXT DEFAULT 'bootstrap'      -- bootstrap | editorial | live | maintenance
    CHECK (phase IN ('bootstrap','editorial','live','maintenance')),
  articles_published INTEGER DEFAULT 0,
  cpa_partners_signed INTEGER DEFAULT 0,
  last_pipeline_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_deployments_country ON deployments(country_code);

-- 3. Orchestrator singleton state — persistent memory between cloud runs
CREATE TABLE IF NOT EXISTS orchestrator_state (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  current_phase TEXT,                 -- 'phase_0' | 'phase_1' | ... | 'maintenance'
  active_countries TEXT[],
  budget_cumulative_usd NUMERIC DEFAULT 0,
  budget_month TEXT,                  -- 'YYYY-MM' for reset logic
  last_cycle_at TIMESTAMPTZ,
  last_report_at TIMESTAMPTZ,
  notes JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Decisions log — every arbitration the orchestrator makes
CREATE TABLE IF NOT EXISTS orchestrator_decisions (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMPTZ DEFAULT now(),
  kind TEXT,                          -- 'prioritize' | 'budget_track' | 'escalate' | 'launch_agent' | ...
  country_code TEXT,
  rationale TEXT,
  payload JSONB
);
CREATE INDEX IF NOT EXISTS idx_decisions_ts ON orchestrator_decisions(ts DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_country ON orchestrator_decisions(country_code);

-- 5. Weekly progress reports
CREATE TABLE IF NOT EXISTS orchestrator_reports (
  id SERIAL PRIMARY KEY,
  iso_week TEXT,                      -- '2026-W15'
  generated_at TIMESTAMPTZ DEFAULT now(),
  summary_md TEXT,                    -- full markdown report
  metrics JSONB,                      -- structured KPIs per country
  incidents JSONB,
  budget_spent_usd NUMERIC,
  human_decisions_pending JSONB
);
CREATE INDEX IF NOT EXISTS idx_reports_week ON orchestrator_reports(iso_week);

-- 6. Partner outreach — prospection CPA tracking
CREATE TABLE IF NOT EXISTS partner_outreach (
  id SERIAL PRIMARY KEY,
  country_code TEXT REFERENCES countries(code) ON DELETE SET NULL,
  partner_name TEXT,
  partner_kind TEXT,                  -- 'teleconsult' | 'coaching' | 'pharmacy'
  website TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'identified'    -- identified | contacted | negotiating | signed | declined
    CHECK (status IN ('identified','contacted','negotiating','signed','declined')),
  first_contacted_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  cpa_value_eur NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_outreach_country_status ON partner_outreach(country_code, status);

-- RLS: permissive for anon (orchestrator uses anon key via bridge)
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrator_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrator_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrator_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_outreach ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='countries' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON countries FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='deployments' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON deployments FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orchestrator_state' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON orchestrator_state FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orchestrator_decisions' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON orchestrator_decisions FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orchestrator_reports' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON orchestrator_reports FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='partner_outreach' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON partner_outreach FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
END$$;

-- Seed singleton row
INSERT INTO orchestrator_state (id, current_phase, budget_month)
VALUES ('singleton', 'phase_0', to_char(now(), 'YYYY-MM'))
ON CONFLICT (id) DO NOTHING;
