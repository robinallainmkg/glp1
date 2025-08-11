#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Corrections pour améliorer les métadonnées des articles
const METADATA_IMPROVEMENTS = {
  // Articles avec des descriptions génériques à améliorer
  "nouveau médicament — Guide marché français.": {
    metaTitle: "Nouveau Médicament GLP-1 France 2025 | Innovations Thérapeutiques",
    metaDescription: "Découvrez les nouveaux médicaments GLP-1 disponibles en France 2025 : innovations thérapeutiques, pipelines, efficacité et accès patients."
  },
  "mounjaro injection pour maigrir — Guide marché français.": {
    metaTitle: "Mounjaro Injection Maigrir France 2025 | Efficacité Perte Poids",
    metaDescription: "Mounjaro injection pour maigrir en France 2025 : efficacité, posologie, prix, effets secondaires et témoignages patients réels."
  },
  "tirzepatide avis — Guide marché français.": {
    metaTitle: "Tirzepatide Avis France 2025 | Témoignages et Efficacité",
    metaDescription: "Tirzepatide avis France 2025 : témoignages patients, efficacité perte de poids, effets secondaires et comparaison Ozempic Wegovy."
  },
  "trulicity ou ozempic — Guide marché français.": {
    metaTitle: "Trulicity vs Ozempic France 2025 | Comparatif Complet",
    metaDescription: "Trulicity ou Ozempic France 2025 : comparaison efficacité, prix, effets secondaires, remboursement. Guide choix traitement optimal."
  },
  "mounjaro prix france — Guide marché français.": {
    metaTitle: "Mounjaro Prix France 2025 | Coût et Remboursement",
    metaDescription: "Mounjaro prix France 2025 : coût mensuel, remboursement sécurité sociale, comparaison prix pharmacies et conseils achat."
  },
  "mounjaro effet secondaire — Guide marché français.": {
    metaTitle: "Mounjaro Effets Secondaires France 2025 | Guide Sécurité",
    metaDescription: "Mounjaro effets secondaires France 2025 : fréquence, gravité, gestion et précautions. Guide complet sécurité tirzepatide."
  }
};

// Articles nécessitant des mots-clés SEO améliorés
const KEYWORD_IMPROVEMENTS = {
  "nouveau medicament": "nouveau médicament glp1 france 2025, innovation thérapeutique",
  "medicament mounjaro": "mounjaro tirzepatide france, injection perte poids",
  "mounjaro remboursement sécurité sociale": "tirzepatide remboursement france, mounjaro prix",
  "delivrance ozempic fevrier 2025": "trulicity ozempic comparaison france",
  "tirzepatide prix france": "mounjaro prix france remboursement",
  "doses mounjaro": "mounjaro effets secondaires france"
};

function improveMetadata(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Extraire le frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      return false;
    }
    
    let [, frontmatter, bodyContent] = frontmatterMatch;
    
    // Améliorer les métadonnées basées sur la description existante
    for (const [oldDescription, improvements] of Object.entries(METADATA_IMPROVEMENTS)) {
      if (frontmatter.includes(`description: ${oldDescription}`)) {
        // Améliorer la description
        frontmatter = frontmatter.replace(
          `description: ${oldDescription}`,
          `description: "${improvements.metaDescription}"`
        );
        
        // Ajouter metaTitle si absent
        if (!frontmatter.includes('metaTitle:')) {
          const titleMatch = frontmatter.match(/title: "(.+)"/);
          if (titleMatch) {
            const insertPosition = frontmatter.indexOf('description:');
            const beforeDescription = frontmatter.substring(0, insertPosition);
            const afterDescription = frontmatter.substring(insertPosition);
            frontmatter = beforeDescription + `metaTitle: "${improvements.metaTitle}"\n` + afterDescription;
          }
        }
        
        console.log(`✅ Métadonnées améliorées dans ${path.basename(filePath)}`);
        modified = true;
        break;
      }
    }
    
    // Améliorer les mots-clés
    for (const [oldKeyword, newKeyword] of Object.entries(KEYWORD_IMPROVEMENTS)) {
      if (frontmatter.includes(`keyword: ${oldKeyword}`)) {
        frontmatter = frontmatter.replace(
          `keyword: ${oldKeyword}`,
          `keyword: "${newKeyword}"`
        );
        console.log(`✅ Mot-clé amélioré: "${oldKeyword}" → "${newKeyword}"`);
        modified = true;
        break;
      }
    }
    
    // Ajouter des tags SEO si manquants pour les articles GLP-1
    if (!frontmatter.includes('tags:') && frontmatter.includes('category: glp-1')) {
      const categoryMatch = frontmatter.match(/category: (.+)/);
      if (categoryMatch) {
        const category = categoryMatch[1];
        let tags = [];
        
        if (category.includes('medications')) {
          tags = ['GLP-1', 'médicaments', 'diabète', 'obésité', 'France'];
        } else if (category.includes('perte-de-poids')) {
          tags = ['perte de poids', 'GLP-1', 'maigrir', 'obésité', 'France'];
        } else if (category.includes('effets-secondaires')) {
          tags = ['effets secondaires', 'GLP-1', 'sécurité', 'précautions', 'France'];
        }
        
        if (tags.length > 0) {
          frontmatter += `\ntags: [${tags.map(tag => `"${tag}"`).join(', ')}]`;
          console.log(`✅ Tags SEO ajoutés: ${tags.join(', ')}`);
          modified = true;
        }
      }
    }
    
    if (modified) {
      const newContent = `---\n${frontmatter}\n---\n${bodyContent}`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return false;
  }
}

function scanAndImproveMetadata(directory) {
  const files = fs.readdirSync(directory, { recursive: true });
  let totalImproved = 0;
  let totalScanned = 0;
  
  console.log(`🔍 Scan des métadonnées dans ${directory}...\n`);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    
    if (path.extname(fullPath) === '.md') {
      totalScanned++;
      
      if (improveMetadata(fullPath)) {
        totalImproved++;
        console.log(`✅ Métadonnées améliorées: ${file}\n`);
      }
    }
  }
  
  console.log(`\n📊 RÉSULTATS MÉTADONNÉES:`);
  console.log(`   • Fichiers scannés: ${totalScanned}`);
  console.log(`   • Fichiers améliorés: ${totalImproved}`);
  console.log(`   • Fichiers inchangés: ${totalScanned - totalImproved}`);
}

// Exécution
const contentDir = path.join(__dirname, '../src/content');
console.log('🎯 AMÉLIORATION DES MÉTADONNÉES SEO\n');
console.log('📋 Améliorations appliquées:');
console.log('   • MetaTitle optimisé pour chaque article');
console.log('   • MetaDescription enrichie avec mots-clés locaux');
console.log('   • Mots-clés principaux plus spécifiques');
console.log('   • Tags SEO ajoutés par catégorie\n');

scanAndImproveMetadata(contentDir);

console.log('\n🚀 ÉTAPES SUIVANTES RECOMMANDÉES:');
console.log('   1. Vérifiez le rendu des nouveaux titres sur le site');
console.log('   2. Testez les métadonnées avec un outil SEO');
console.log('   3. Surveillez les changements de positionnement');
console.log('   4. Adaptez selon les performances réelles');
