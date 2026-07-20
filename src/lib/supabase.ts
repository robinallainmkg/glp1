import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour GLP-1 France
// Variables d'environnement avec fallback sur les valeurs par défaut (dev)
const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
// La cle anon est publique par design (exposee dans le JS client) — le fallback en dur est OK
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuration Supabase manquante. Vérifiez les variables d\'environnement.');
}

// Client public (pour les requêtes authentifiées)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Client service (pour les opérations admin côté serveur)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Utilitaires de connexion
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  isConfigured: !!(supabaseUrl && supabaseAnonKey)
};

console.log('✅ Supabase configuré pour GLP-1 France:', supabaseConfig.isConfigured ? 'OK' : 'ERREUR');
