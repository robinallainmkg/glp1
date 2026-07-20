import 'dotenv/config';
#!/usr/bin/env node

/**
 * Test connexion Supabase et récupère les derniers contacts reçus
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Test Supabase - Récupération des contacts\n');

async function testContacts() {
  try {
    // Test connexion
    const { data: testData, error: testError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur connexion:', testError);
      
      if (testError.code === '42P01') {
        console.log('\n⚠️  La table "contacts" n\'existe pas encore.');
        console.log('📝 Exécute ce SQL dans Supabase Dashboard → SQL Editor:\n');
        console.log('   Fichier: supabase/create-contacts-table.sql\n');
      }
      return;
    }
    
    console.log('✅ Connexion Supabase OK\n');
    
    // Récupérer les 10 derniers contacts
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Erreur récupération:', error);
      return;
    }
    
    if (!contacts || contacts.length === 0) {
      console.log('📭 Aucun contact trouvé pour le moment.');
      console.log('\n💡 Les contacts seront enregistrés quand les utilisateurs soumettent le formulaire sur:');
      console.log('   https://glp1-france.fr/contact/\n');
      return;
    }
    
    console.log(`📊 ${contacts.length} contacts trouvés:\n`);
    
    contacts.forEach((contact, index) => {
      console.log(`${index + 1}. ${contact.nom || contact.email}`);
      console.log(`   📧 Email: ${contact.email}`);
      console.log(`   📞 Tel: ${contact.telephone || 'Non fourni'}`);
      console.log(`   📝 Sujet: ${contact.subject || 'Non spécifié'}`);
      console.log(`   💬 Message: ${contact.message ? contact.message.substring(0, 80) + (contact.message.length > 80 ? '...' : '') : 'Vide'}`);
      console.log(`   📅 Date: ${new Date(contact.created_at).toLocaleString('fr-FR')}`);
      console.log('');
    });
    
    // Vérifier les contacts des 24 dernières heures
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentContacts } = await supabase
      .from('contacts')
      .select('*')
      .gte('created_at', yesterday.toISOString());
    
    console.log(`\n📈 Contacts des dernières 24h: ${recentContacts?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testContacts();
