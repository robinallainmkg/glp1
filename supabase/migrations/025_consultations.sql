-- 025_consultations.sql
-- "Consultation privée" GLP-1 : achat one-shot 3€ (paiement Stripe unique),
-- débloque le Coach en mode consultation (illimité + perso) pendant 48h.

CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text,
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'active',   -- active | expired | refunded
  amount_total integer,                    -- montant payé en centimes (ex: 300)
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  intake jsonb,                            -- données d'intake collectées pendant la consultation
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Recherche rapide de la consultation active d'un user
CREATE INDEX IF NOT EXISTS idx_consultations_user_active
  ON public.consultations (user_id, expires_at DESC);

-- Idempotence webhook : une session Stripe ne crée qu'une consultation
CREATE UNIQUE INDEX IF NOT EXISTS idx_consultations_session
  ON public.consultations (stripe_session_id) WHERE stripe_session_id IS NOT NULL;

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- L'utilisateur lit ses propres consultations (pour savoir s'il a un accès actif).
-- Les inserts/updates se font via les edge functions (service role, bypass RLS).
DROP POLICY IF EXISTS "consultations_select_own" ON public.consultations;
CREATE POLICY "consultations_select_own" ON public.consultations
  FOR SELECT USING (auth.uid() = user_id);
