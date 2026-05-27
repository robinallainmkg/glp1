-- Platform events tracking for comprehensive analytics
CREATE TABLE IF NOT EXISTS platform_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  page_url text,
  session_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE platform_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_platform_events" ON platform_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_platform_events" ON platform_events FOR SELECT TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_platform_events_type_created ON platform_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_events_session ON platform_events(session_id);
CREATE INDEX IF NOT EXISTS idx_platform_events_page ON platform_events(page_url, created_at DESC);

-- Analytics reports storage
CREATE TABLE IF NOT EXISTS analytics_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type text NOT NULL DEFAULT 'daily',
  report_html text NOT NULL,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_analytics_reports" ON analytics_reports FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_analytics_reports" ON analytics_reports FOR SELECT TO anon USING (true);
