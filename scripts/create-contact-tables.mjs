// Script pour créer les tables de contact dans Supabase
import { supabaseAdmin } from '../src/lib/supabase.js';

async function createContactTables() {
  console.log('🚀 Création des tables de contact dans Supabase...');
  
  try {
    // SQL pour créer les tables
    const migrationSQL = `
      -- Table pour les soumissions de contact
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        age VARCHAR(20),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        treatment VARCHAR(100),
        concerns TEXT[],
        newsletter_signup BOOLEAN DEFAULT false,
        source VARCHAR(50) DEFAULT 'contact_form',
        ip_address VARCHAR(45),
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Table unifiée des utilisateurs
      CREATE TABLE IF NOT EXISTS users_unified (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        phone VARCHAR(20),
        age VARCHAR(20),
        treatment VARCHAR(100),
        concerns TEXT[],
        newsletter_subscribed BOOLEAN DEFAULT false,
        contact_submissions_count INTEGER DEFAULT 0,
        last_contact_date TIMESTAMP WITH TIME ZONE,
        source VARCHAR(50),
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Table pour les abonnés newsletter
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        unsubscribed_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true,
        source VARCHAR(50),
        ip_address VARCHAR(45)
      );
    `;

    // Exécuter la migration
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erreur lors de la création des tables:', error);
      return false;
    }

    console.log('✅ Tables créées avec succès !');
    return true;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Exécuter la migration
createContactTables().then((success) => {
  if (success) {
    console.log('🎉 Migration terminée avec succès !');
    process.exit(0);
  } else {
    console.log('💥 Échec de la migration');
    process.exit(1);
  }
});
