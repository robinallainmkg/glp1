import { createClient } from '@supabase/supabase-js';

// Configuration depuis les variables d'environnement
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Fonctions utilitaires
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('french_cities')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Erreur connexion Supabase:', error);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Échec connexion Supabase:', error);
    return false;
  }
}

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseKey,
  isConfigured: !!(supabaseUrl && supabaseKey)
};

export default supabase;
