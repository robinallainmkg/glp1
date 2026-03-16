-- 019: Add user authentication support to coach tables
-- Allows users to create accounts and link their conversation history

-- Add user_id to conversations and messages
ALTER TABLE coach_conversations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE coach_messages ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Indexes for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_coach_conversations_user_id ON coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_user_id ON coach_messages(user_id);

-- Create a user profiles table for coach users
CREATE TABLE IF NOT EXISTS coach_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  total_messages integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'
);

-- RLS policies for coach_profiles
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON coach_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON coach_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow insert from service role (edge function creates profile on signup)
CREATE POLICY "Service role can insert profiles" ON coach_profiles
  FOR INSERT WITH CHECK (true);

-- Anon can also insert (for signup flow)
CREATE POLICY "Anon can insert profiles" ON coach_profiles
  FOR INSERT WITH CHECK (true);
