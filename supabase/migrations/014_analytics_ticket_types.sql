-- Migration 014 : Ajouter les ticket_types pour l'agent analytics
-- Date: 2026-03-14
-- Description: Etend les ticket_types avec content_refresh et seo_optimization
--   pour permettre a l'agent analytics de creer des tickets actionnables

ALTER TABLE correction_tickets DROP CONSTRAINT IF EXISTS correction_tickets_ticket_type_check;
ALTER TABLE correction_tickets ADD CONSTRAINT correction_tickets_ticket_type_check
  CHECK (ticket_type IN (
    -- Types fact-check
    'price_update', 'info_outdated', 'false_claim', 'missing_info', 'context_fr',
    -- Types validator
    'missing_description', 'broken_link', 'missing_image', 'seo_issue',
    'duplicate_content', 'sync_issue', 'content_quality', 'heading_issue',
    'html_issue', 'build_error',
    -- Types analytics
    'content_refresh', 'seo_optimization'
  ));
