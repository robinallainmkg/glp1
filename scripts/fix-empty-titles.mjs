#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'content');

// Génération automatique de titres basés sur les slugs
function generateTitleFromSlug(slug) {
  // Dictionnaire de conversion pour les termes techniques
  const conversions = {
    'glp1': 'GLP-1',
    'glp-1': 'GLP-1',
    'ozempic': 'Ozempic',
    'wegovy': 'Wegovy',
    'saxenda': 'Saxenda',
    'mounjaro': 'Mounjaro',
    'trulicity': 'Trulicity',
    'victoza': 'Victoza',
    'semaglutide': 'Sémaglutide',
    'liraglutide': 'Liraglutide',
    'dulaglutide': 'Dulaglutide',
    'tirzepatide': 'Tirzepatide',
    'diabete': 'Diabète',
    'regime': 'Régime',
    'medicament': 'Médicament',
    'medicaments': 'Médicaments',
    'prix': 'Prix',
    'cout': 'Coût',
    'remboursement': 'Remboursement',
    'effets-secondaires': 'Effets Secondaires',
    'perte-de-poids': 'Perte de Poids',
    'avant-apres': 'Avant-Après',
    'avis': 'Avis',
    'forum': 'Forum',
    'france': 'France',
    'pharmacie': 'Pharmacie',
    'ordonnance': 'Ordonnance',
    'posologie': 'Posologie',
    'dosage': 'Dosage',
    'injection': 'Injection',
    'stylo': 'Stylo',
    'danger': 'Danger',
    'risques': 'Risques',
    'alternatives': 'Alternatives',
    'naturel': 'Naturel',
    'naturelles': 'Naturelles'
  };
  
  // Convertir le slug en titre
  let title = slug
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => {
      // Vérifier le dictionnaire
      if (conversions[word.toLowerCase()]) {
        return conversions[word.toLowerCase()];
      }
      // Capitalisation normale
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
  
  return title;
}

function generateDescriptionFromSlug(slug, title) {
  // Patterns de description selon le type d'article
  const patterns = {
    prix: `Découvrez le prix de ${title} en France, remboursement Sécurité Sociale et options d'achat.`,
    cout: `Guide complet des coûts de ${title} : prix, remboursement et comparaisons.`,
    avis: `Avis patients et médecins sur ${title} : efficacité, effets secondaires et retours d'expérience.`,
    effets: `Effets secondaires de ${title} : guide complet des risques et précautions à prendre.`,
    dosage: `Dosage et posologie de ${title} : guide médical pour une utilisation optimale.`,
    injection: `Guide d'injection ${title} : technique, fréquence et conseils pratiques.`,
    danger: `Dangers et risques de ${title} : informations essentielles pour votre sécurité.`,
    alternative: `Alternatives naturelles à ${title} : options thérapeutiques et solutions complémentaires.`,
    regime: `Régime alimentaire avec ${title} : conseils nutrition et plan alimentaire adapté.`,
    diabete: `${title} et diabète : guide complet pour les patients diabétiques.`,
    default: `Guide complet sur ${title} : informations médicales, conseils et recommandations d'experts.`
  };
  
  // Détecter le type d'article
  if (slug.includes('prix') || slug.includes('cout')) {
    return patterns.prix;
  } else if (slug.includes('avis') || slug.includes('forum')) {
    return patterns.avis;
  } else if (slug.includes('effet') || slug.includes('secondaire')) {
    return patterns.effets;
  } else if (slug.includes('dosage') || slug.includes('posologie')) {
    return patterns.dosage;
  } else if (slug.includes('injection') || slug.includes('stylo')) {
    return patterns.injection;
  } else if (slug.includes('danger') || slug.includes('risque')) {
    return patterns.danger;
  } else if (slug.includes('alternative') || slug.includes('naturel')) {
    return patterns.alternative;
  } else if (slug.includes('regime') || slug.includes('nutrition')) {
    return patterns.regime;
  } else if (slug.includes('diabete')) {
    return patterns.diabete;
  } else {
    return patterns.default;
  }
}

function fixEmptyTitleAndDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraire le frontmatter et le body
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!frontmatterMatch) return { status: 'error', error: 'No frontmatter found' };
    
    const frontmatter = frontmatterMatch[1];
    const body = frontmatterMatch[2];
    
    // Extraire le slug pour générer le titre
    const slugMatch = frontmatter.match(/slug:\s*[""']([^""']+)[""']/);
    if (!slugMatch) return { status: 'error', error: 'No slug found' };
    
    const slug = slugMatch[1];
    
    // Vérifier si le titre est vide
    const titleMatch = frontmatter.match(/title:\s*[""']([^""']*)[""']/);
    let needsTitleFix = false;
    let needsDescFix = false;
    
    if (!titleMatch || !titleMatch[1] || titleMatch[1].trim() === '') {
      needsTitleFix = true;
    }
    
    // Vérifier si la description est vide
    const descMatch = frontmatter.match(/description:\s*[""']([^""']*)[""']/);
    if (!descMatch || !descMatch[1] || descMatch[1].trim() === '') {
      needsDescFix = true;
    }
    
    if (!needsTitleFix && !needsDescFix) {
      return { status: 'ok', message: 'Title and description already present' };
    }
    
    // Générer le nouveau titre et description
    const newTitle = generateTitleFromSlug(slug);
    const newDescription = generateDescriptionFromSlug(slug, newTitle);
    
    // Remplacer dans le frontmatter
    let newFrontmatter = frontmatter;
    
    if (needsTitleFix) {
      newFrontmatter = newFrontmatter.replace(
        /title:\s*[""'][^""']*[""']/,
        `title: "${newTitle}"`
      );
    }
    
    if (needsDescFix) {
      newFrontmatter = newFrontmatter.replace(
        /description:\s*[""'][^""']*[""']/,
        `description: "${newDescription}"`
      );
    }
    
    // Corriger aussi thumbnailAlt si nécessaire
    if (newFrontmatter.includes('thumbnailAlt: "Illustration pour l\'article "')) {
      newFrontmatter = newFrontmatter.replace(
        /thumbnailAlt:\s*[""']Illustration pour l'article [""']/,
        `thumbnailAlt: "Illustration pour l'article ${newTitle}"`
      );
    }
    
    // Reconstruire le fichier
    const newContent = `---\n${newFrontmatter}\n---\n${body}`;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    return {
      status: 'fixed',
      title: newTitle,
      description: newDescription.substring(0, 60) + '...'
    };
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function fixCollection(collection) {
  const collectionPath = path.join(collectionsPath, collection);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`⚠️  Collection non trouvée: ${collection}`);
    return;
  }
  
  console.log(`\n📁 Correction collection: ${collection}`);
  
  const files = fs.readdirSync(collectionPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(collectionPath, file));
  
  console.log(`  📄 ${files.length} articles à vérifier`);
  
  const results = [];
  for (const file of files) {
    const result = fixEmptyTitleAndDescription(file);
    const fileName = path.basename(file);
    
    if (result.status === 'fixed') {
      console.log(`  ✅ ${fileName} → "${result.title}"`);
    } else if (result.status === 'ok') {
      console.log(`  ⚪ ${fileName} (déjà correct)`);
    } else {
      console.error(`  ❌ ${fileName}: ${result.error}`);
    }
    results.push(result);
  }
  
  const fixed = results.filter(r => r.status === 'fixed').length;
  const ok = results.filter(r => r.status === 'ok').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`  📊 ${fixed} corrigés, ${ok} corrects, ${errors} erreurs`);
  
  return results;
}

async function main() {
  console.log('🔧 CORRECTION DES TITRES ET DESCRIPTIONS VIDES');
  console.log('=' .repeat(50));
  
  const collections = [
    'medicaments-glp1',
    'glp1-perte-de-poids', 
    'glp1-cout',
    'effets-secondaires-glp1',
    'glp1-diabete',
    'regime-glp1',
    'medecins-glp1-france',
    'recherche-glp1',
    'alternatives-glp1'
  ];
  
  const allResults = [];
  
  for (const collection of collections) {
    const results = fixCollection(collection);
    if (results) allResults.push(...results);
  }
  
  const totalFixed = allResults.filter(r => r.status === 'fixed').length;
  const totalOk = allResults.filter(r => r.status === 'ok').length;
  const totalErrors = allResults.filter(r => r.status === 'error').length;
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RÉSULTATS GLOBAUX:');
  console.log(`✅ Articles corrigés: ${totalFixed}`);
  console.log(`⚪ Articles déjà corrects: ${totalOk}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📄 Total: ${allResults.length}`);
  
  console.log('\n🎉 Correction terminée !');
}

main().catch(console.error);
