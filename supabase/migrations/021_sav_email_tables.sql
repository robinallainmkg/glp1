-- SAV Email Agent tables
-- Table: incoming_emails — Emails entrants syncs depuis IMAP
CREATE TABLE IF NOT EXISTS incoming_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  message_id TEXT UNIQUE,
  in_reply_to TEXT,
  received_at TIMESTAMPTZ,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'replied', 'ignored', 'spam')),
  category TEXT CHECK (category IN ('info_request', 'diagnostic_followup', 'remboursement', 'effets_secondaires', 'scam_victim', 'medecin', 'other')),
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: email_replies — Reponses envoyees par l'agent SAV
CREATE TABLE IF NOT EXISTS email_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incoming_email_id UUID REFERENCES incoming_emails(id),
  from_email TEXT NOT NULL DEFAULT 'robin@glp1-france.fr',
  to_email TEXT NOT NULL,
  subject TEXT,
  body_html TEXT NOT NULL,
  category TEXT,
  utm_campaign TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_to_imap BOOLEAN DEFAULT false,
  agent_run_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requetes courantes
CREATE INDEX IF NOT EXISTS idx_incoming_emails_status ON incoming_emails(status);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_from ON incoming_emails(from_email);
CREATE INDEX IF NOT EXISTS idx_email_replies_campaign ON email_replies(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_email_replies_sent ON email_replies(sent_at);

-- RLS policies (anon can read for admin dashboard)
ALTER TABLE incoming_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_incoming" ON incoming_emails FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_incoming" ON incoming_emails FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_incoming" ON incoming_emails FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_read_replies" ON email_replies FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_replies" ON email_replies FOR INSERT TO anon WITH CHECK (true);
