-- ============================================================================
-- Migration 022: Subscription system for Coach Premium
-- Adds Stripe integration columns, daily message counting, subscription events
-- ============================================================================

-- 1. Add Stripe columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_price_id TEXT;

-- 2. Daily message counts for free tier rate limiting (3 msg/day)
CREATE TABLE IF NOT EXISTS daily_message_counts (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Auto-cleanup old rows (keep 30 days)
CREATE INDEX IF NOT EXISTS idx_daily_message_counts_date ON daily_message_counts(date);

-- 3. Subscription events audit log (idempotency for webhooks)
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);

-- 4. RLS policies

-- daily_message_counts: users can read their own
ALTER TABLE daily_message_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily counts"
  ON daily_message_counts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access daily counts"
  ON daily_message_counts FOR ALL
  USING (auth.role() = 'service_role');

-- subscription_events: service role only
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access subscription events"
  ON subscription_events FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Function to clean old daily_message_counts (run periodically)
CREATE OR REPLACE FUNCTION cleanup_daily_message_counts()
RETURNS void AS $$
BEGIN
  DELETE FROM daily_message_counts WHERE date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
