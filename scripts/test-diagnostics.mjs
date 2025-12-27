#!/usr/bin/env node

/**
 * Script pour tester et afficher les diagnostics enregistrés dans Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDiagnostics() {
  console.log('🔍 Test Supabase - Récupération des diagnostics\n');

  // Test connexion
  const { data: testData, error: testError } = await supabase
    .from('diagnostics')
    .select('*')
    .limit(1);
  
  if (testError) {
    console.error('❌ Erreur connexion:', testError);
    
    if (testError.code === '42P01') {
      console.log('\n⚠️  La table "diagnostics" n\'existe pas encore.');
      console.log('📝 Exécute ce SQL dans Supabase Dashboard → SQL Editor:\n');
      console.log('   Fichier: supabase/create-diagnostics-table.sql\n');
    }
    return;
  }
  
  console.log('✅ Connexion Supabase OK\n');

  // Récupérer les 10 derniers diagnostics
  const { data: diagnostics, error } = await supabase
    .from('diagnostics')
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Erreur récupération:', error);
    return;
  }

  if (!diagnostics || diagnostics.length === 0) {
    console.log('📭 Aucun diagnostic trouvé pour le moment.');
    console.log('\n💡 Les diagnostics seront enregistrés quand les utilisateurs complètent le formulaire sur:');
    console.log('   https://glp1-france.fr/guides/quel-traitement-glp1-choisir/\n');
    return;
  }

  console.log(`📊 ${diagnostics.length} diagnostic(s) trouvé(s):\n`);

  diagnostics.forEach((diag, index) => {
    const date = new Date(diag.completed_at);
    const formattedDate = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log(`${index + 1}. Diagnostic #${diag.id}`);
    console.log(`   📅 Date: ${formattedDate}`);
    console.log(`   🎯 Recommandation: ${diag.recommendation}`);
    
    if (diag.scores) {
      console.log(`   📊 Scores: Ozempic ${diag.scores.ozempic} | Wegovy ${diag.scores.wegovy}`);
    }
    
    if (diag.answers) {
      const answersKeys = Object.keys(diag.answers);
      console.log(`   ❓ Questions: ${answersKeys.length} réponses`);
      
      // Afficher l'objectif principal (q1)
      if (diag.answers.q1) {
        const objectifs = {
          'diabete': 'Contrôler le diabète',
          'poids': 'Perdre du poids',
          'les-deux': 'Diabète + perte de poids',
          'prevention': 'Prévention',
          'effets-secondaires': 'Réduire les effets secondaires'
        };
        console.log(`   🎯 Objectif: ${objectifs[diag.answers.q1] || diag.answers.q1}`);
      }
    }
    
    console.log('');
  });

  // Statistiques
  console.log('\n📈 STATISTIQUES:');
  
  const recommendationCounts = diagnostics.reduce((acc, diag) => {
    acc[diag.recommendation] = (acc[diag.recommendation] || 0) + 1;
    return acc;
  }, {});

  console.log('   Recommandations:');
  Object.entries(recommendationCounts).forEach(([rec, count]) => {
    console.log(`   - ${rec}: ${count}`);
  });

  // Diagnostics des dernières 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentDiagnostics = diagnostics.filter(d => new Date(d.completed_at) > oneDayAgo);
  console.log(`\n   📈 Diagnostics des dernières 24h: ${recentDiagnostics.length}`);
}

testDiagnostics().catch(console.error);
