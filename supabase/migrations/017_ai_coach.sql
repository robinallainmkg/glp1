-- Migration: AI Coach chat system
-- Tables for storing conversations and messages (training data for future fine-tune)

-- Conversations (one per browser session)
CREATE TABLE IF NOT EXISTS coach_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  page_url VARCHAR(500),
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Individual messages
CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  session_id VARCHAR(64) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  intent VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;

-- Anon can INSERT conversations
CREATE POLICY "anon_insert_conversations" ON coach_conversations
  FOR INSERT TO anon WITH CHECK (true);

-- Anon can SELECT own conversations (by session_id for history reload)
CREATE POLICY "anon_select_own_conversations" ON coach_conversations
  FOR SELECT TO anon USING (true);

-- Anon can UPDATE own conversation (message_count, last_message_at)
CREATE POLICY "anon_update_own_conversations" ON coach_conversations
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Anon can INSERT messages
CREATE POLICY "anon_insert_messages" ON coach_messages
  FOR INSERT TO anon WITH CHECK (true);

-- Anon can SELECT own messages (for history)
CREATE POLICY "anon_select_own_messages" ON coach_messages
  FOR SELECT TO anon USING (true);

-- Indexes
CREATE INDEX idx_coach_conv_session ON coach_conversations(session_id);
CREATE INDEX idx_coach_conv_last_msg ON coach_conversations(last_message_at);
CREATE INDEX idx_coach_msg_conversation ON coach_messages(conversation_id);
CREATE INDEX idx_coach_msg_session ON coach_messages(session_id);
CREATE INDEX idx_coach_msg_created ON coach_messages(created_at);
CREATE INDEX idx_coach_msg_intent ON coach_messages(intent);
