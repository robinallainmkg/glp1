-- Migration : Systeme de suivi budgetaire
-- Date: 2026-03-08
-- Description: Tables pour le suivi des depenses (abonnements, API, budget limite)

-- Configuration budget (limite mensuelle, taux de change)
CREATE TABLE IF NOT EXISTS budget_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  monthly_limit DECIMAL(10,2) DEFAULT 200.00,
  eur_usd_rate DECIMAL(6,4) DEFAULT 0.9200,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserer la config par defaut
INSERT INTO budget_config (monthly_limit, eur_usd_rate) VALUES (200.00, 0.9200);

-- Abonnements fixes mensuels
CREATE TABLE IF NOT EXISTS budget_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consommation API Anthropic par mois
CREATE TABLE IF NOT EXISTS budget_api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL, -- format YYYY-MM
  model TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour requetes par mois
CREATE INDEX IF NOT EXISTS idx_budget_api_usage_month ON budget_api_usage(month);

-- RLS : permettre lecture/ecriture via anon key (dashboard admin)
ALTER TABLE budget_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_config_select_anon" ON budget_config FOR SELECT USING (true);
CREATE POLICY "budget_config_update_anon" ON budget_config FOR UPDATE USING (true);

CREATE POLICY "budget_subs_select_anon" ON budget_subscriptions FOR SELECT USING (true);
CREATE POLICY "budget_subs_insert_anon" ON budget_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "budget_subs_update_anon" ON budget_subscriptions FOR UPDATE USING (true);
CREATE POLICY "budget_subs_delete_anon" ON budget_subscriptions FOR DELETE USING (true);

CREATE POLICY "budget_api_select_anon" ON budget_api_usage FOR SELECT USING (true);
CREATE POLICY "budget_api_insert_anon" ON budget_api_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "budget_api_update_anon" ON budget_api_usage FOR UPDATE USING (true);
