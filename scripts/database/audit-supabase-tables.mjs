import 'dotenv/config';
// Analyse des tables Supabase - Audit complet
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('📊 AUDIT COMPLET DES TABLES SUPABASE');
console.log('====================================');

async function auditTables() {
  try {
    // Essayer de lister toutes les tables possibles connues
    const tablesToCheck = [
      // Tables principales
      'users',
      'brands', 
      'products',
      'deals',
      'affiliate_stats',
      
      // Tables potentiellement créées
      'categories',
      'product_categories',
      'user_profiles',
      'testimonials',
      'articles',
      'collections',
      'newsletter_subscribers',
      'affiliate_clicks',
      'affiliate_conversions',
      'user_activities',
      'user_sessions',
      'user_preferences',
      'medical_data',
      'glp1_treatments',
      'doctors',
      'pharmacies',
      'reviews',
      'comments',
      'tags',
      'product_tags',
      'coupons',
      'orders',
      'payments',
      'subscriptions',
      
      // Tables de test possibles
      'test_users',
      'temp_data',
      'backup_data',
      'migration_log',
      'debug_log'
    ];

    const results = [];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error, count } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          results.push({
            table,
            count: count || 0,
            status: 'EXISTS',
            data: null
          });
        }
      } catch (err) {
        // Table n'existe pas ou erreur d'accès
      }
    }

    console.log(`\n🔍 TABLES TROUVÉES (${results.length} tables):`);
    console.log('═══════════════════════════════════════');
    
    for (const result of results) {
      console.log(`\n📋 Table: ${result.table}`);
      console.log(`   📊 Enregistrements: ${result.count}`);
      
      // Analyser quelques enregistrements pour comprendre la structure
      try {
        const { data: sample } = await supabaseAdmin
          .from(result.table)
          .select('*')
          .limit(1);
        
        if (sample && sample.length > 0) {
          const columns = Object.keys(sample[0]);
          console.log(`   🔑 Colonnes (${columns.length}): ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`);
          
          // Identifier le type de table
          if (columns.includes('email') && columns.includes('password')) {
            console.log(`   🏷️  Type: TABLE UTILISATEURS`);
          } else if (columns.includes('brand_id') || columns.includes('product_id')) {
            console.log(`   🏷️  Type: TABLE AFFILIATION`);
          } else if (columns.includes('title') || columns.includes('content')) {
            console.log(`   🏷️  Type: TABLE CONTENU`);
          } else if (result.table.includes('test') || result.table.includes('temp') || result.table.includes('debug')) {
            console.log(`   🏷️  Type: ⚠️  TABLE DE TEST/DEBUG`);
          } else {
            console.log(`   🏷️  Type: TABLE SYSTÈME`);
          }
        }
      } catch (sampleError) {
        console.log(`   ❌ Erreur lecture échantillon: ${sampleError.message}`);
      }
    }

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS DE NETTOYAGE:');
    console.log('═══════════════════════════════════');
    
    const testTables = results.filter(r => 
      r.table.includes('test') || 
      r.table.includes('temp') || 
      r.table.includes('debug') || 
      r.table.includes('backup') ||
      r.count === 0
    );
    
    if (testTables.length > 0) {
      console.log('\n🗑️  TABLES À SUPPRIMER (test/vides):');
      testTables.forEach(t => {
        console.log(`   ❌ ${t.table} (${t.count} enregistrements)`);
      });
    }
    
    const emptyTables = results.filter(r => r.count === 0 && !r.table.includes('test'));
    if (emptyTables.length > 0) {
      console.log('\n📝 TABLES VIDES (à évaluer):');
      emptyTables.forEach(t => {
        console.log(`   ⚠️  ${t.table} (vide)`);
      });
    }
    
    const activeTables = results.filter(r => r.count > 0 && !testTables.includes(r));
    console.log('\n✅ TABLES ACTIVES (à conserver):');
    activeTables.forEach(t => {
      console.log(`   ✅ ${t.table} (${t.count} enregistrements)`);
    });
    
  } catch (error) {
    console.error('💥 Erreur audit:', error);
  }
}

auditTables().then(() => {
  console.log('\n🏁 Audit terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
