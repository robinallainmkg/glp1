-- Relance automatique des dossiers abandonnes (pending sans paiement)
-- Colonne pour marquer qu'un email de relance a ete envoye (une seule relance par dossier)
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS relance_sent_at timestamptz;
