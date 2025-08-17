import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour GLP-1 France
// Utilisation directe des variables d'environnement pour Astro
const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

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
