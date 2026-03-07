#!/usr/bin/env node

/**
 * Crée la table editorial_queue dans Supabase.
 * Usage: node scripts/database/create-editorial-tables.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createEditorialQueue() {
  console.log('🚀 Création de la table editorial_queue...\n');

  try {
    // 1. Create the editorial_queue table
    console.log('📋 Création table editorial_queue...');
    const { error: tableError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS editorial_queue (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          fact_check_id UUID NOT NULL REFERENCES fact_check_results(id) ON DELETE CASCADE,
          article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
          claim_original TEXT NOT NULL,
          realite_actuelle TEXT NOT NULL,
          source_reference TEXT,
          urgence VARCHAR(20) NOT NULL DEFAULT 'moyen',
          section_originale TEXT,
          section_corrigee TEXT,
          explication_correction TEXT,
          model_used VARCHAR(100),
          tokens_used INTEGER,
          statut VARCHAR(30) NOT NULL DEFAULT 'requested'
            CHECK (statut IN ('requested', 'processing', 'pending_review', 'approved', 'rejected', 'applied')),
          requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          processed_at TIMESTAMP WITH TIME ZONE,
          reviewed_at TIMESTAMP WITH TIME ZONE,
          reviewed_by VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    if (tableError) throw tableError;
    console.log('  ✅ Table créée');

    // 2. Create indexes
    console.log('📋 Création des index...');
    const { error: idxError } = await supabase.rpc('exec', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_editorial_queue_statut ON editorial_queue(statut);
        CREATE INDEX IF NOT EXISTS idx_editorial_queue_article_id ON editorial_queue(article_id);
        CREATE INDEX IF NOT EXISTS idx_editorial_queue_fact_check_id ON editorial_queue(fact_check_id);
        CREATE INDEX IF NOT EXISTS idx_editorial_queue_urgence ON editorial_queue(urgence);
        CREATE INDEX IF NOT EXISTS idx_editorial_queue_requested_at ON editorial_queue(requested_at DESC);
      `
    });
    if (idxError) throw idxError;
    console.log('  ✅ Index créés');

    // 3. Enable RLS
    console.log('📋 Configuration RLS...');
    const { error: rlsError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE editorial_queue ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "editorial_queue_read_all" ON editorial_queue FOR SELECT USING (true);
        CREATE POLICY IF NOT EXISTS "editorial_queue_write_service" ON editorial_queue FOR ALL USING (auth.role() = 'service_role');
        CREATE POLICY IF NOT EXISTS "editorial_queue_insert_anon" ON editorial_queue FOR INSERT WITH CHECK (statut = 'requested');
      `
    });
    // RLS errors are ok if policies already exist
    if (rlsError && !rlsError.message.includes('already exists')) {
      console.log('  ⚠️ RLS warning:', rlsError.message);
    } else {
      console.log('  ✅ RLS configuré');
    }

    console.log('\n✅ Table editorial_queue prête !');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

createEditorialQueue();
