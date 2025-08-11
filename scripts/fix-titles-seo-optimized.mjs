#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping des titres à corriger avec des versions SEO-optimisées
const TITLE_CORRECTIONS = {
  // Titres trop courts ou vagues
  "Nouveau médicament": "Nouveau Médicament GLP-1 France 2025 : Innovations et Disponibilité",
  "Wegovy danger": "Wegovy Dangers et Risques : Guide Sécurité Complet France 2025",
  "Wegovy dosage": "Wegovy Dosage France : Posologie Optimale et Ajustements 2025",
  "Glp-1": "GLP-1 France : Guide Complet Traitement Diabète et Perte Poids 2025",
  "Glp inhibitors": "Inhibiteurs GLP-1 France : Mécanisme et Efficacité Thérapeutique 2025",
  "diabète du pied et GLP-1": "Diabète du Pied et GLP-1 : Prévention et Traitement France 2025",
  "diabète rétinopathie et GLP-1": "Diabète Rétinopathie GLP-1 : Protection Oculaire France 2025",
  "diabète sport et GLP-1": "Diabète Sport GLP-1 : Optimiser Performance et Glycémie 2025",
  "diabète urgence et GLP-1": "Diabète Urgence GLP-1 : Gestion Crise Hyperglycémique 2025",
  "diabète gestationnel et GLP-1": "Diabète Gestationnel GLP-1 : Sécurité Grossesse France 2025",
  "diabète régime avec GLP-1": "Diabète Régime GLP-1 : Alimentation Optimale France 2025",
  "recherche clinique GLP-1": "Recherche Clinique GLP-1 : Dernières Études France 2025",
  "GLP-1 et diabète de type 1": "GLP-1 Diabète Type 1 : Applications Thérapeutiques 2025",
  "GLP-1 et neuropathie diabétique": "GLP-1 Neuropathie Diabétique : Traitement Douleurs 2025",
  "GLP-1 et réduction HbA1c": "GLP-1 Réduction HbA1c : Efficacité Contrôle Glycémique 2025",
  "GLP-1 et auto-surveillance glycémique": "GLP-1 Auto-surveillance Glycémique : Guide Pratique 2025",
  "GLP-1 et néphropathie diabétique": "GLP-1 Néphropathie Diabétique : Protection Rénale 2025",
  "GLP-1 et carnet diabétique": "GLP-1 Carnet Diabétique : Suivi Optimisé France 2025",
  "GLP-1 et interaction avec insuline": "GLP-1 Insuline Interaction : Association Thérapeutique 2025",
  
  // Titres sans contexte français
  "Combien de dose dans un stylo ozempic": "Ozempic Stylo Dosage : Combien d'Injections par Stylo France 2025",
  "mounjaro injection pour maigrir": "Mounjaro Injection Maigrir : Efficacité Perte Poids France 2025",
  "mounjaro effet secondaire": "Mounjaro Effets Secondaires : Guide Complet Sécurité France 2025",
  "mounjaro prix france": "Mounjaro Prix France 2025 : Coût et Remboursement Détaillés",
  "tirzepatide avis": "Tirzepatide Avis France 2025 : Efficacité et Témoignages Patients",
  "trulicity ou ozempic": "Trulicity vs Ozempic France 2025 : Comparatif Complet Efficacité",
  "orlistat avant apres": "Orlistat Avant Après : Résultats Réels Perte Poids France 2025",
  "januvia autre nom": "Januvia Autres Noms : Génériques et Alternatives France 2025",
  "metformine autre nom": "Metformine Autres Noms : Génériques Disponibles France 2025",
  "dulaglutide nom commercial": "Dulaglutide Nom Commercial : Trulicity Prix France 2025",
  "medicament prise de poid": "Médicament Prise Poids Rapide : Solutions Efficaces France 2025",
  "ado médicament": "Médicament ADO Diabète : Antidiabétiques Oraux France 2025",
  "traitements médicamenteux": "Traitements Médicamenteux Diabète : Guide Complet France 2025",
  
  // Améliorer les titres existants moyens
  "médicament pour maigrir très puissant": "Médicament Maigrir Très Puissant : Top 5 Solutions France 2025",
  "medicament americain pour maigrir": "Médicament Américain Maigrir : Innovations USA France 2025",
  "médicament anti obésité novo nordisk": "Novo Nordisk Anti-Obésité : Wegovy Ozempic Guide France 2025",
  "nouveau traitement diabète type 2 injection": "Nouveau Traitement Diabète Type 2 Injection : GLP-1 France 2025",
  "medicaments qui augmentent la glycemie": "Médicaments Augmentent Glycémie : Liste et Précautions 2025"
};

// Correspondances metaTitle
const META_TITLE_CORRECTIONS = {
  "Nouveau médicament": "Nouveau Médicament GLP-1 France 2025 | Guide Innovation",
  "Wegovy danger": "Wegovy Dangers France 2025 | Risques et Précautions",
  "Wegovy dosage": "Wegovy Dosage France 2025 | Posologie Optimale",
  "Glp-1": "GLP-1 France 2025 | Traitement Diabète Perte Poids",
  "Glp inhibitors": "Inhibiteurs GLP-1 France 2025 | Mécanisme Action"
};

// Correspondances metaDescription
const META_DESCRIPTION_CORRECTIONS = {
  "Nouveau médicament": "Découvrez les nouveaux médicaments GLP-1 disponibles en France 2025 : innovations thérapeutiques, efficacité, prix et disponibilité.",
  "Wegovy danger": "Wegovy dangers et risques en France 2025 : effets secondaires, contre-indications et précautions d'usage. Guide sécurité complet.",
  "Wegovy dosage": "Wegovy dosage optimal en France 2025 : posologie recommandée, ajustements et protocole d'administration. Guide pratique complet.",
  "Glp-1": "GLP-1 France 2025 : guide complet des traitements diabète et perte de poids. Efficacité, prix, remboursement et conseils pratiques.",
  "Glp inhibitors": "Inhibiteurs GLP-1 France 2025 : mécanisme d'action, efficacité thérapeutique et applications cliniques. Guide scientifique complet."
};

function fixTitlesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Extraire le frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      console.log(`❌ Pas de frontmatter trouvé dans ${filePath}`);
      return false;
    }
    
    let [, frontmatter, bodyContent] = frontmatterMatch;
    
    // Correction du title
    for (const [oldTitle, newTitle] of Object.entries(TITLE_CORRECTIONS)) {
      const titleRegex = new RegExp(`title:\\s*["']${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g');
      if (titleRegex.test(frontmatter)) {
        frontmatter = frontmatter.replace(titleRegex, `title: "${newTitle}"`);
        console.log(`✅ Titre corrigé: "${oldTitle}" → "${newTitle}"`);
        modified = true;
        break;
      }
    }
    
    // Correction du metaTitle si absent ou à corriger
    for (const [oldTitle, newMetaTitle] of Object.entries(META_TITLE_CORRECTIONS)) {
      if (frontmatter.includes(`title: "${oldTitle}"`)) {
        if (!frontmatter.includes('metaTitle:')) {
          frontmatter += `\nmetaTitle: "${newMetaTitle}"`;
          console.log(`✅ metaTitle ajouté: "${newMetaTitle}"`);
          modified = true;
        }
        break;
      }
    }
    
    // Correction du metaDescription si absent ou à corriger
    for (const [oldTitle, newMetaDescription] of Object.entries(META_DESCRIPTION_CORRECTIONS)) {
      if (frontmatter.includes(`title: "${oldTitle}"`)) {
        if (!frontmatter.includes('metaDescription:')) {
          frontmatter += `\nmetaDescription: "${newMetaDescription}"`;
          console.log(`✅ metaDescription ajouté: "${newMetaDescription}"`);
          modified = true;
        }
        break;
      }
    }
    
    // Correction du H1 dans le contenu
    for (const [oldTitle, newTitle] of Object.entries(TITLE_CORRECTIONS)) {
      const h1Regex = new RegExp(`^# ${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm');
      if (h1Regex.test(bodyContent)) {
        bodyContent = bodyContent.replace(h1Regex, `# ${newTitle}`);
        console.log(`✅ H1 corrigé dans le contenu`);
        modified = true;
        break;
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

function scanAndFixTitles(directory) {
  const files = fs.readdirSync(directory, { recursive: true });
  let totalFixed = 0;
  let totalScanned = 0;
  
  console.log(`🔍 Scan des fichiers dans ${directory}...\n`);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    
    if (path.extname(fullPath) === '.md') {
      totalScanned++;
      console.log(`📄 Traitement: ${file}`);
      
      if (fixTitlesInFile(fullPath)) {
        totalFixed++;
        console.log(`✅ Modifié: ${file}\n`);
      } else {
        console.log(`ℹ️  Aucune modification: ${file}\n`);
      }
    }
  }
  
  console.log(`\n📊 RÉSULTATS:`);
  console.log(`   • Fichiers scannés: ${totalScanned}`);
  console.log(`   • Fichiers modifiés: ${totalFixed}`);
  console.log(`   • Fichiers inchangés: ${totalScanned - totalFixed}`);
}

// Exécution
const contentDir = path.join(__dirname, '../src/content');
console.log('🚀 CORRECTION AUTOMATIQUE DES TITRES SEO\n');
console.log('📋 Critères de correction:');
console.log('   • Ajouter le contexte français (France 2025)');
console.log('   • Inclure des mots-clés SEO pertinents');
console.log('   • Rendre les titres plus descriptifs et attractifs');
console.log('   • Optimiser pour les recherches locales\n');

scanAndFixTitles(contentDir);

console.log('\n🎯 RECOMMANDATIONS POST-CORRECTION:');
console.log('   1. Vérifiez les nouveaux titres sur le site local');
console.log('   2. Testez la pertinence SEO avec vos mots-clés');
console.log('   3. Adaptez si nécessaire selon vos metrics');
console.log('   4. Monitorer les changements de ranking');
