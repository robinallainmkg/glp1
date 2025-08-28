// 📊 VÉRIFICATION TITRES OPTIMISÉS 2025
// Vérifier que tous les titres sont maintenant optimisés et à jour

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('📊 VÉRIFICATION TITRES OPTIMISÉS 2025\n');

// Fonction pour analyser les titres optimisés
async function verifyOptimizedTitles() {
  const collections = ['glp1-perte-de-poids', 'medicaments-glp1', 'effets-secondaires-glp1', 'guide-glp1'];
  const stats = {
    total: 0,
    with2025: 0,
    withGuide: 0,
    withKeywords: 0,
    tooShort: 0,
    optimized: 0
  };
  
  const examples = {
    excellent: [],
    good: [],
    needsWork: []
  };

  for (const collection of collections) {
    const collectionPath = join(rootDir, 'src', 'content', collection);
    
    if (!fs.existsSync(collectionPath)) continue;
    
    const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.md'));
    
    console.log(`\n📁 Collection: ${collection} (${files.length} articles)`);
    
    for (const file of files) {
      const filePath = join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extraire le frontmatter
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) continue;
      
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
      
      if (!titleMatch) continue;
      
      const title = titleMatch[1].trim();
      stats.total++;
      
      // Analyser le titre
      const has2025 = title.includes('2025');
      const hasGuide = title.toLowerCase().includes('guide') || title.toLowerCase().includes('avis');
      const hasKeywords = /ozempic|wegovy|mounjaro|saxenda|glp-1|semaglutide|dulaglutide|liraglutide|tirzepatide/i.test(title);
      const isLongEnough = title.length >= 20;
      
      if (has2025) stats.with2025++;
      if (hasGuide) stats.withGuide++;
      if (hasKeywords) stats.withKeywords++;
      if (!isLongEnough) stats.tooShort++;
      
      // Calculer le score d'optimisation
      let score = 0;
      if (has2025) score += 2;
      if (hasGuide) score += 2;
      if (hasKeywords) score += 3;
      if (isLongEnough) score += 2;
      if (title.includes(':')) score += 1; // Structure claire
      
      if (score >= 8) {
        stats.optimized++;
        examples.excellent.push(`✅ ${title} (${score}/10)`);
      } else if (score >= 6) {
        examples.good.push(`🔶 ${title} (${score}/10)`);
      } else {
        examples.needsWork.push(`❌ ${title} (${score}/10)`);
      }
    }
  }
  
  return { stats, examples };
}

// Fonction pour afficher les recommandations
function showRecommendations(stats, examples) {
  console.log('\n📈 STATISTIQUES GLOBALES:');
  console.log(`   📄 Total articles: ${stats.total}`);
  console.log(`   📅 Avec "2025": ${stats.with2025} (${Math.round(stats.with2025/stats.total*100)}%)`);
  console.log(`   📖 Avec "Guide/Avis": ${stats.withGuide} (${Math.round(stats.withGuide/stats.total*100)}%)`);
  console.log(`   🔑 Avec mots-clés: ${stats.withKeywords} (${Math.round(stats.withKeywords/stats.total*100)}%)`);
  console.log(`   📏 Trop courts (<20 car): ${stats.tooShort} (${Math.round(stats.tooShort/stats.total*100)}%)`);
  console.log(`   ✅ Optimisés (8+/10): ${stats.optimized} (${Math.round(stats.optimized/stats.total*100)}%)`);
  
  console.log('\n🏆 EXEMPLES DE TITRES EXCELLENTS:');
  examples.excellent.slice(0, 5).forEach(title => console.log(`   ${title}`));
  
  if (examples.good.length > 0) {
    console.log('\n🔶 TITRES CORRECTS À AMÉLIORER:');
    examples.good.slice(0, 3).forEach(title => console.log(`   ${title}`));
  }
  
  if (examples.needsWork.length > 0) {
    console.log('\n❌ TITRES À RETRAVAILLER:');
    examples.needsWork.slice(0, 3).forEach(title => console.log(`   ${title}`));
  }
  
  // Calcul du score global
  const globalScore = Math.round(
    (stats.with2025 * 0.2 + 
     stats.withGuide * 0.2 + 
     stats.withKeywords * 0.3 + 
     (stats.total - stats.tooShort) * 0.15 + 
     stats.optimized * 0.15) / stats.total * 100
  );
  
  console.log(`\n🎯 SCORE GLOBAL D'OPTIMISATION: ${globalScore}/100`);
  
  if (globalScore >= 90) {
    console.log('🚀 EXCELLENT ! Vos titres sont parfaitement optimisés.');
  } else if (globalScore >= 75) {
    console.log('✅ TRÈS BIEN ! Quelques améliorations mineures possibles.');
  } else if (globalScore >= 60) {
    console.log('🔶 CORRECT. Des améliorations sont recommandées.');
  } else {
    console.log('❌ À AMÉLIORER. Une optimisation supplémentaire est nécessaire.');
  }
}

// Fonction pour générer des recommandations spécifiques
function generateSpecificRecommendations(examples) {
  console.log('\n💡 RECOMMANDATIONS SPÉCIFIQUES:');
  
  if (examples.needsWork.length > 0) {
    console.log('   🔧 Pour les titres à retravailler:');
    console.log('     - Ajouter "2025" pour la fraîcheur');
    console.log('     - Inclure "Guide Complet" ou "Avis" pour la clarté');
    console.log('     - Ajouter des mots-clés GLP-1 pertinents');
    console.log('     - Structurer avec ":" pour plus de lisibilité');
  }
  
  if (examples.good.length > 0) {
    console.log('   ⚡ Pour les titres corrects:');
    console.log('     - Ajouter des sous-titres explicites après ":"');
    console.log('     - Inclure des bénéfices ou promesses');
    console.log('     - Optimiser la longueur (25-60 caractères)');
  }
  
  console.log('\n📋 MODÈLES DE TITRES RECOMMANDÉS:');
  console.log('   • "Guide Complet [Médicament] 2025 : Tout Savoir"');
  console.log('   • "[Médicament] Avis 2025 : Efficacité et Témoignages"');
  console.log('   • "[Médicament] Prix 2025 : Coût et Remboursement"');
  console.log('   • "[Médicament] Effets Secondaires : Guide de Prévention"');
  console.log('   • "[Médicament] Posologie : Comment Bien l\'Utiliser"');
}

// Exécution principale
async function main() {
  try {
    console.log('🔍 Analyse des titres optimisés...\n');
    
    const { stats, examples } = await verifyOptimizedTitles();
    
    showRecommendations(stats, examples);
    generateSpecificRecommendations(examples);
    
    console.log('\n🎉 Analyse terminée ! Vos titres sont maintenant plus engageants et SEO-friendly.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

main();
