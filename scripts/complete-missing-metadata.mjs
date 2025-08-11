#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Templates de métadonnées par catégorie
const METADATA_TEMPLATES = {
  'glp-1 medications': {
    metaTitleTemplate: '{title} | Prix Efficacité France 2025',
    metaDescriptionTemplate: '{keyword} France 2025 : prix, efficacité, effets secondaires, remboursement. Guide médical complet et avis patients.',
    defaultKeywords: 'glp1 médicaments france, diabète traitement, perte poids injection'
  },
  'glp-1 for weight loss': {
    metaTitleTemplate: '{title} | Perte Poids France 2025',
    metaDescriptionTemplate: '{keyword} pour maigrir France 2025 : efficacité, témoignages, prescription médicale. Guide perte de poids GLP-1.',
    defaultKeywords: 'glp1 perte poids, maigrir injection, semaglutide france'
  },
  'glp-1 side effects': {
    metaTitleTemplate: '{title} | Effets Secondaires France 2025',
    metaDescriptionTemplate: '{keyword} effets secondaires France 2025 : fréquence, gravité, solutions. Guide sécurité et précautions.',
    defaultKeywords: 'glp1 effets secondaires, sécurité injection, précautions france'
  },
  'glp-1 alternatives': {
    metaTitleTemplate: '{title} | Alternatives Naturelles France 2025',
    metaDescriptionTemplate: 'Alternatives naturelles {keyword} France 2025 : solutions efficaces, comparaisons, conseils experts. Guide complet.',
    defaultKeywords: 'alternatives naturelles glp1, traitement naturel diabète, perte poids naturelle'
  },
  'glp-1 cost': {
    metaTitleTemplate: '{title} | Prix Remboursement France 2025',
    metaDescriptionTemplate: '{keyword} prix France 2025 : coût mensuel, remboursement sécurité sociale, comparaison pharmacies.',
    defaultKeywords: 'prix glp1 france, remboursement injection, coût traitement diabète'
  },
  'glp-1 for diabetes': {
    metaTitleTemplate: '{title} | Diabète Traitement France 2025',
    metaDescriptionTemplate: '{keyword} diabète France 2025 : efficacité glycémie, prescription, suivi médical. Guide diabétologue.',
    defaultKeywords: 'glp1 diabète france, traitement glycémie, injection diabète type 2'
  }
};

function generateMetadata(title, category, existingKeyword = '') {
  const template = METADATA_TEMPLATES[category] || METADATA_TEMPLATES['glp-1 medications'];
  
  // Nettoyer le titre pour metaTitle
  const cleanTitle = title.replace(/["']/g, '').substring(0, 50);
  
  // Générer metaTitle
  let metaTitle = template.metaTitleTemplate.replace('{title}', cleanTitle);
  if (metaTitle.length > 60) {
    metaTitle = cleanTitle + ' | France 2025';
  }
  
  // Utiliser le mot-clé existant ou générer un par défaut
  const keyword = existingKeyword || extractKeywordFromTitle(title) || template.defaultKeywords.split(',')[0];
  
  // Générer metaDescription
  let metaDescription = template.metaDescriptionTemplate.replace('{keyword}', keyword);
  if (metaDescription.length > 160) {
    metaDescription = `${keyword} France 2025 : guide complet, prix, efficacité et conseils pratiques.`;
  }
  
  return {
    metaTitle,
    metaDescription,
    keyword: existingKeyword || `${keyword}, france 2025`
  };
}

function extractKeywordFromTitle(title) {
  // Extraire le mot-clé principal du titre
  const cleanTitle = title.toLowerCase()
    .replace(/["':]/g, '')
    .replace(/france 2025/g, '')
    .replace(/guide complet/g, '')
    .trim();
  
  // Prendre les 2-3 premiers mots significatifs
  const words = cleanTitle.split(' ').filter(word => 
    word.length > 2 && !['pour', 'avec', 'dans', 'les', 'des', 'une', 'sans'].includes(word)
  );
  
  return words.slice(0, 3).join(' ');
}

function completeMetadata(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      console.log(`❌ Pas de frontmatter: ${path.basename(filePath)}`);
      return false;
    }
    
    let [, frontmatter, bodyContent] = frontmatterMatch;
    let modified = false;
    
    // Extraire les données existantes
    const title = frontmatter.match(/title:\s*["'](.+?)["']/)?.[1] || '';
    const category = frontmatter.match(/category:\s*(.+)/)?.[1]?.replace(/["']/g, '') || 'glp-1 medications';
    const existingKeyword = frontmatter.match(/keyword:\s*["']?(.+?)["']?$/m)?.[1] || '';
    const existingMetaTitle = frontmatter.match(/metaTitle:/);
    const existingMetaDescription = frontmatter.match(/metaDescription:/);
    
    if (!title) {
      console.log(`❌ Pas de titre trouvé: ${path.basename(filePath)}`);
      return false;
    }
    
    // Générer les métadonnées manquantes
    const metadata = generateMetadata(title, category, existingKeyword);
    
    // Ajouter metaTitle si manquant
    if (!existingMetaTitle) {
      const titleLine = frontmatter.indexOf('title:');
      const nextLine = frontmatter.indexOf('\n', titleLine);
      frontmatter = frontmatter.slice(0, nextLine) + 
                   `\nmetaTitle: "${metadata.metaTitle}"` + 
                   frontmatter.slice(nextLine);
      console.log(`✅ MetaTitle ajouté: ${metadata.metaTitle}`);
      modified = true;
    }
    
    // Ajouter metaDescription si manquant
    if (!existingMetaDescription) {
      const descriptionLine = frontmatter.indexOf('description:');
      if (descriptionLine !== -1) {
        const nextLine = frontmatter.indexOf('\n', descriptionLine);
        frontmatter = frontmatter.slice(0, nextLine) + 
                     `\nmetaDescription: "${metadata.metaDescription}"` + 
                     frontmatter.slice(nextLine);
      } else {
        frontmatter += `\nmetaDescription: "${metadata.metaDescription}"`;
      }
      console.log(`✅ MetaDescription ajoutée`);
      modified = true;
    }
    
    // Améliorer le keyword si trop générique
    if (!existingKeyword || existingKeyword.includes('Guide marché français')) {
      const keywordLine = frontmatter.indexOf('keyword:');
      if (keywordLine !== -1) {
        const nextLine = frontmatter.indexOf('\n', keywordLine);
        frontmatter = frontmatter.slice(0, keywordLine) + 
                     `keyword: "${metadata.keyword}"` + 
                     frontmatter.slice(nextLine);
      } else {
        frontmatter += `\nkeyword: "${metadata.keyword}"`;
      }
      console.log(`✅ Keyword amélioré: ${metadata.keyword}`);
      modified = true;
    }
    
    // Ajouter featured: true aux articles importants
    if (!frontmatter.includes('featured:') && 
        (title.toLowerCase().includes('ozempic') || 
         title.toLowerCase().includes('wegovy') || 
         title.toLowerCase().includes('mounjaro'))) {
      frontmatter += `\nfeatured: true`;
      console.log(`✅ Article marqué comme featured`);
      modified = true;
    }
    
    if (modified) {
      const newContent = `---\n${frontmatter}\n---\n${bodyContent}`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

function processAllFiles() {
  const contentDir = path.join(__dirname, '../src/content');
  const files = fs.readdirSync(contentDir, { recursive: true });
  
  let processed = 0;
  let modified = 0;
  
  console.log('🔧 COMPLETION DES MÉTADONNÉES MANQUANTES\n');
  
  for (const file of files) {
    if (path.extname(file) === '.md') {
      const fullPath = path.join(contentDir, file);
      processed++;
      
      console.log(`📄 Traitement: ${file}`);
      if (completeMetadata(fullPath)) {
        modified++;
        console.log(`✅ Modifié: ${file}\n`);
      } else {
        console.log(`ℹ️  Aucune modification: ${file}\n`);
      }
    }
  }
  
  console.log(`\n📊 RÉSULTATS COMPLETION MÉTADONNÉES:`);
  console.log(`   • Fichiers traités: ${processed}`);
  console.log(`   • Fichiers modifiés: ${modified}`);
  console.log(`   • Taux de completion: ${((modified/processed)*100).toFixed(1)}%`);
}

// Exécution
processAllFiles();
