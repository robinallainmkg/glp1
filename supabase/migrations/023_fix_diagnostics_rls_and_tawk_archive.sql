-- Fix diagnostics RLS: allow anonymous inserts (public form)
-- The form at /guides/quel-traitement-glp1-choisir uses anon key
DROP POLICY IF EXISTS "Allow anonymous inserts" ON diagnostics;
DROP POLICY IF EXISTS "allow_anon_insert_diagnostics" ON diagnostics;

CREATE POLICY diagnostics_anon_insert ON diagnostics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY diagnostics_anon_select ON diagnostics FOR SELECT TO anon USING (true);

-- Archive table for Tawk.to conversations (migrated to our own Coach IA)
CREATE TABLE IF NOT EXISTS tawk_conversations_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tawk_chat_id TEXT UNIQUE NOT NULL,
  chat_date DATE NOT NULL,
  visitor_name TEXT,
  visitor_city TEXT,
  visitor_country TEXT,
  page_url TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  message_count INTEGER DEFAULT 0,
  category TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tawk_conversations_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY tawk_archive_authenticated_read
  ON tawk_conversations_archive FOR SELECT TO authenticated
  USING (true);
