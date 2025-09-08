#!/usr/bin/env node

/**
 * Script de correction des métadonnées critiques
 * Corrige les titres et descriptions des pages identifiées dans l'audit
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mapping des métadonnées optimisées par fichier
const metadataFixes = {
  'glp1-cout/anneau-gastrique-prix-cmu.md': {
    title: 'Anneau Gastrique Prix CMU : Remboursement, Conditions et Alternatives 2025',
    description: 'Guide complet sur l\'anneau gastrique et la CMU. Prix, conditions de remboursement, alternatives GLP-1, et parcours de soins détaillé.'
  },
  'regime-glp1/glp1-index-glycemique.md': {
    title: 'Régime GLP-1 et Index Glycémique : Guide Alimentaire Expert 2025',
    description: 'Optimisez votre traitement GLP-1 avec l\'index glycémique. Plans alimentaires, aliments recommandés, et stratégies pour maximiser la perte de poids.'
  },
  'regime-glp1/glp1-micronutriments.md': {
    title: 'Micronutriments GLP-1 : Supplémentation et Vitamines Essentielles',
    description: 'Guide expert des micronutriments sous GLP-1. Supplémentation personnalisée, bilans biologiques, et prévention des carences nutritionnelles.'
  },
  'regime-glp1/glp1-portion-alimentaire.md': {
    title: 'Portions Alimentaires GLP-1 : Guide Pratique Nutrition Optimisée',
    description: 'Maîtrisez les portions alimentaires avec les GLP-1. Guides visuels, tableaux de référence, et stratégies pour éviter les effets secondaires.'
  },
  'regime-glp1/glp1-proteines.md': {
    title: 'Protéines et GLP-1 : Optimisation Muscle et Perte de Poids 2025',
    description: 'Guide expert protéines pour GLP-1. Besoins quotidiens, sources optimales, timing d\'apport, et préservation de la masse musculaire.'
  },
  'regime-glp1/regime-chrono-nutrition-glp1.md': {
    title: 'Chrono-nutrition GLP-1 : Timing Alimentaire et Efficacité Optimale',
    description: 'Combinez chrono-nutrition et GLP-1 pour maximiser les résultats. Horaires optimaux, répartition des repas, et synchronisation avec les injections.'
  },
  'regime-glp1/regime-dash-glp1.md': {
    title: 'Régime DASH et GLP-1 : Synergie Tension Artérielle et Perte de Poids',
    description: 'Associez régime DASH et GLP-1 pour double bénéfice. Plans alimentaires adaptés, contrôle tension, et optimisation cardiovasculaire.'
  },
  'regime-glp1/regime-detox-glp1.md': {
    title: 'Détox GLP-1 : Purification et Optimisation Métabolique Naturelle',
    description: 'Protocols détox compatibles GLP-1. Détoxification hépatique, élimination des toxines, et boost métabolique pour meilleurs résultats.'
  },
  'regime-glp1/regime-mediterraneen-glp1.md': {
    title: 'Régime Méditerranéen GLP-1 : Alliance Santé et Perte de Poids Durable',
    description: 'Combinez régime méditerranéen et GLP-1. Plans alimentaires méditerranéens adaptés, bénéfices santé, et stratégies long terme.'
  },
  'regime-glp1/regime-paleo-glp1.md': {
    title: 'Régime Paléo GLP-1 : Approche Ancestrale Moderne Perte de Poids',
    description: 'Adaptez le régime paléolithique aux GLP-1. Aliments autorisés, plans de repas, bénéfices métaboliques, et mise en pratique simple.'
  },
  'pages-statiques/partenaires.md': {
    title: 'Partenaires GLP-1 France : Réseau Médical et Professionnels Certifiés',
    description: 'Découvrez nos partenaires santé certifiés. Médecins spécialisés GLP-1, pharmacies partenaires, laboratoires, et professionnels de confiance.'
  }
};

// Fonction pour corriger les métadonnées d'un fichier
function fixMetadata(filePath, currentContent, newMetadata) {
  console.log(`🔧 Correction: ${filePath.split('\\').pop()}`);
  
  // Extraire le frontmatter actuel
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = currentContent.match(frontmatterRegex);
  
  if (!match) {
    console.log(`   ❌ Pas de frontmatter trouvé`);
    return currentContent;
  }
  
  let [, frontmatter, content] = match;
  
  // Remplacer ou ajouter le title
  if (frontmatter.includes('title:')) {
    frontmatter = frontmatter.replace(/title:\s*["'].*?["']/, `title: "${newMetadata.title}"`);
  } else {
    frontmatter = `title: "${newMetadata.title}"\n` + frontmatter;
  }
  
  // Remplacer ou ajouter la description
  if (frontmatter.includes('description:')) {
    frontmatter = frontmatter.replace(/description:\s*["'].*?["']/, `description: "${newMetadata.description}"`);
  } else {
    frontmatter = frontmatter + `\ndescription: "${newMetadata.description}"`;
  }
  
  const newContent = `---\n${frontmatter}\n---\n${content}`;
  
  console.log(`   ✅ Titre: ${newMetadata.title.substring(0, 50)}...`);
  console.log(`   ✅ Description: ${newMetadata.description.substring(0, 80)}...`);
  
  return newContent;
}

// Fonction principale
async function fixCriticalMetadata() {
  console.log('🚀 CORRECTION DES MÉTADONNÉES CRITIQUES');
  console.log('========================================\n');

  const contentDir = join(__dirname, '..', 'src', 'content');
  
  let fixedCount = 0;
  let errors = 0;

  for (const [relativePath, metadata] of Object.entries(metadataFixes)) {
    try {
      const filePath = join(contentDir, relativePath);
      
      // Vérifier que le fichier existe
      if (!readFileSync(filePath, 'utf-8')) {
        console.log(`⏭️ ${relativePath} - Fichier introuvable`);
        continue;
      }
      
      // Lire le contenu actuel
      const content = readFileSync(filePath, 'utf-8');
      
      // Corriger les métadonnées
      const fixedContent = fixMetadata(filePath, content, metadata);
      
      if (fixedContent !== content) {
        // Sauvegarder
        writeFileSync(filePath, fixedContent, 'utf-8');
        
        console.log(`✅ ${relativePath} - Métadonnées corrigées\n`);
        fixedCount++;
      } else {
        console.log(`⏭️ ${relativePath} - Aucun changement nécessaire\n`);
      }
      
    } catch (error) {
      console.error(`❌ Erreur ${relativePath}: ${error.message}`);
      errors++;
    }
  }

  console.log('========================================');
  console.log('📊 RÉSULTATS:');
  console.log(`✅ Fichiers corrigés: ${fixedCount}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`⏭️ Fichiers ignorés: ${Object.keys(metadataFixes).length - fixedCount - errors}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 Correction terminée! Les métadonnées sont maintenant optimisées.');
    console.log('Lancez un nouveau audit pour vérifier l\'amélioration du score SEO.');
  }
}

// Exécution
fixCriticalMetadata().catch(console.error);
