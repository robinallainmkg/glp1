-- Migration 018: AI Coach v2 — pgvector + RAG knowledge base
-- Prerequis: migration 017 (coach_conversations + coach_messages) deja appliquee

-- 1. Activer pgvector
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Table knowledge base (chunks d'articles pour RAG)
CREATE TABLE IF NOT EXISTS article_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug VARCHAR(200) NOT NULL,
  collection VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  section_heading VARCHAR(500),
  content TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL UNIQUE,
  embedding extensions.vector(1024),  -- mistral-embed dimension
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche vectorielle (ivfflat, adapte a ~400 vecteurs)
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON article_chunks USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists = 20);

CREATE INDEX IF NOT EXISTS idx_chunks_slug ON article_chunks(article_slug);
CREATE INDEX IF NOT EXISTS idx_chunks_collection ON article_chunks(collection);

-- 3. Fonction de recherche par similarite
CREATE OR REPLACE FUNCTION match_article_chunks(
  query_embedding extensions.vector(1024),
  match_threshold FLOAT DEFAULT 0.65,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  article_slug VARCHAR(200),
  collection VARCHAR(100),
  title VARCHAR(500),
  section_heading VARCHAR(500),
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.id,
    ac.article_slug,
    ac.collection,
    ac.title,
    ac.section_heading,
    ac.content,
    (1 - (ac.embedding <=> query_embedding))::FLOAT AS similarity
  FROM article_chunks ac
  WHERE 1 - (ac.embedding <=> query_embedding) > match_threshold
  ORDER BY ac.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Etendre coach_messages pour le tracking v2
ALTER TABLE coach_messages ADD COLUMN IF NOT EXISTS model VARCHAR(50);
ALTER TABLE coach_messages ADD COLUMN IF NOT EXISTS rag_sources JSONB;
ALTER TABLE coach_messages ADD COLUMN IF NOT EXISTS tokens_used INTEGER;

-- 5. Table rate limiting (geree par l'Edge Function)
CREATE TABLE IF NOT EXISTS coach_rate_limits (
  session_id VARCHAR(64) PRIMARY KEY,
  message_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  hourly_count INTEGER DEFAULT 0,
  hourly_start TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS policies
ALTER TABLE article_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_chunks"
  ON article_chunks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_read_chunks"
  ON article_chunks FOR SELECT
  TO anon
  USING (true);

ALTER TABLE coach_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_rate_limits"
  ON coach_rate_limits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
