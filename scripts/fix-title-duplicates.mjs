#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'content');

function generateProperTitle(slug) {
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
    'naturelles': 'Naturelles',
    'nom': 'Nom',
    'commercial': 'Commercial',
    'ado': 'ADO'
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

function fixTitleDuplicates(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    // Détecter les patterns de doublons dans les titres
    const titlePatterns = [
      // Pattern 1: "titre"autre titre"
      /title:\s*"([^"]+)"([^"]+)"/,
      // Pattern 2: "titre"titre"
      /title:\s*"([^"]+)"\1"/,
      // Pattern 3: title avec guillemets multiples
      /title:\s*"([^"]*)"[^"]*"([^"]*)"*/
    ];
    
    for (const pattern of titlePatterns) {
      const match = newContent.match(pattern);
      if (match) {
        const fileName = path.basename(filePath, '.md');
        const properTitle = generateProperTitle(fileName);
        
        newContent = newContent.replace(
          /title:\s*"[^"]*"[^"]*"?[^"]*"?/,
          `title: "${properTitle}"`
        );
        
        hasChanges = true;
        console.log(`  🔧 Titre corrigé: "${properTitle}"`);
        break;
      }
    }
    
    // Corriger aussi la description si elle référence un mauvais titre
    if (hasChanges) {
      const titleMatch = newContent.match(/title:\s*"([^"]+)"/);
      if (titleMatch) {
        const title = titleMatch[1];
        const newDescription = `Guide complet sur ${title} : informations médicales, conseils et recommandations d'experts.`;
        
        newContent = newContent.replace(
          /description:\s*"[^"]*"/,
          `description: "${newDescription}"`
        );
        
        // Corriger thumbnailAlt aussi
        newContent = newContent.replace(
          /thumbnailAlt:\s*"[^"]*"/,
          `thumbnailAlt: "Illustration pour l'article ${title}"`
        );
        
        console.log(`  🔧 Description et thumbnailAlt mis à jour`);
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return { status: 'fixed' };
    } else {
      return { status: 'ok' };
    }
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function scanCollection(collection) {
  const collectionPath = path.join(collectionsPath, collection);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`⚠️  Collection non trouvée: ${collection}`);
    return;
  }
  
  console.log(`\n📁 Scan collection: ${collection}`);
  
  const files = fs.readdirSync(collectionPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(collectionPath, file));
  
  console.log(`  📄 ${files.length} articles à scanner`);
  
  const results = [];
  for (const file of files) {
    const result = fixTitleDuplicates(file);
    const fileName = path.basename(file);
    
    if (result.status === 'fixed') {
      console.log(`  ✅ ${fileName} - corrigé`);
    } else if (result.status === 'ok') {
      console.log(`  ⚪ ${fileName} - OK`);
    } else {
      console.error(`  ❌ ${fileName}: ${result.error}`);
    }
    results.push(result);
  }
  
  const fixed = results.filter(r => r.status === 'fixed').length;
  const ok = results.filter(r => r.status === 'ok').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`  📊 ${fixed} corrigés, ${ok} OK, ${errors} erreurs`);
  
  return results;
}

async function main() {
  console.log('🔍 DÉTECTION ET CORRECTION DES DOUBLONS DE TITRES');
  console.log('=' .repeat(55));
  
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
    const results = scanCollection(collection);
    if (results) allResults.push(...results);
  }
  
  const totalFixed = allResults.filter(r => r.status === 'fixed').length;
  const totalOk = allResults.filter(r => r.status === 'ok').length;
  const totalErrors = allResults.filter(r => r.status === 'error').length;
  
  console.log('\n' + '=' .repeat(55));
  console.log('📊 RÉSULTATS:');
  console.log(`✅ Articles corrigés: ${totalFixed}`);
  console.log(`⚪ Articles OK: ${totalOk}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📄 Total: ${allResults.length}`);
  
  if (totalErrors === 0) {
    console.log('\n🎉 Tous les titres sont maintenant corrects !');
  }
}

main().catch(console.error);
