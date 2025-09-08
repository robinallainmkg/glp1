// Script pour corriger les métadonnées critiques (titres et descriptions trop courts)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content');

console.log('🔧 CORRECTION DES MÉTADONNÉES CRITIQUES');
console.log('='.repeat(50));

// Améliorations prédéfinies pour les titres courts
const titleImprovements = {
  "GLP-1 Micronutriments": "GLP-1 et Micronutriments : Guide Complet des Vitamines et Minéraux Essentiels",
  "GLP-1 Proteines": "GLP-1 et Protéines : Optimiser l'Apport Protéique avec les Traitements Anti-Diabète",
  "GLP-1 Index Glycémique": "GLP-1 et Index Glycémique : Maîtriser la Glycémie avec les Bons Aliments",
  "GLP-1 Portion Alimentaire": "GLP-1 et Portions Alimentaires : Guide des Quantités Optimales pour Perdre du Poids",
  "GLP-1 Calories Journalières": "GLP-1 et Calories Journalières : Calculer ses Besoins Énergétiques pour Maigrir",
  "Régime Cétogène GLP-1": "Régime Cétogène et GLP-1 : Association Efficace pour une Perte de Poids Rapide",
  "Régime Dash GLP-1": "Régime DASH et GLP-1 : Combiner Hypertension et Diabète pour une Santé Optimale",
  "Régime Détox GLP-1": "Régime Détox et GLP-1 : Purifier l'Organisme tout en Traitant le Diabète",
  "Régime Méditerranéen GLP-1": "Régime Méditerranéen et GLP-1 : L'Alliance Parfaite Santé-Minceur",
  "Régime Paléo GLP-1": "Régime Paléolithique et GLP-1 : Retour aux Sources pour Perdre du Poids",
  "Régime Chrono-Nutrition GLP-1": "Chrono-Nutrition et GLP-1 : Manger au Bon Moment pour Optimiser les Effets"
};

// Descriptions améliorées
const descriptionImprovements = {
  "glp1-micronutriments": "Découvrez les micronutriments essentiels à surveiller sous traitement GLP-1. Guide complet des vitamines, minéraux et compléments alimentaires pour optimiser votre perte de poids et maintenir une santé optimale.",
  "glp1-proteines": "Apprenez à optimiser votre apport en protéines avec les traitements GLP-1. Conseils pratiques, sources de qualité et quantités recommandées pour préserver la masse musculaire tout en perdant du poids.",
  "glp1-index-glycemique": "Maîtrisez l'index glycémique des aliments avec les GLP-1. Guide pratique pour choisir les bons glucides, stabiliser la glycémie et maximiser l'efficacité de votre traitement anti-diabète.",
  "glp1-portion-alimentaire": "Guide des portions alimentaires optimales sous traitement GLP-1. Apprenez à adapter les quantités, gérer la satiété et maximiser la perte de poids avec des portions équilibrées et adaptées.",
  "glp1-calories-journalieres": "Calculez vos besoins caloriques journaliers avec les GLP-1. Méthodes de calcul, adaptation selon le traitement et conseils pour un déficit calorique sain et durable pour perdre du poids efficacement.",
  "regime-cetogene-glp1": "Associer régime cétogène et GLP-1 pour une perte de poids accélérée. Guide complet, avantages, précautions et protocole détaillé pour combiner ces deux approches minceur efficaces.",
  "regime-dash-glp1": "Régime DASH et traitements GLP-1 : la combinaison idéale pour diabétiques hypertendus. Plan alimentaire détaillé, bénéfices santé et conseils pratiques pour une approche nutritionnelle complète.",
  "regime-detox-glp1": "Programme détox adapté aux traitements GLP-1. Purifiez votre organisme tout en optimisant l'efficacité de votre traitement diabète avec des aliments détoxifiants et des protocoles sécurisés.",
  "regime-mediterraneen-glp1": "Adoptez le régime méditerranéen avec les GLP-1 pour une santé optimale. Menu type, aliments clés et conseils pour combiner tradition culinaire saine et traitement moderne du diabète.",
  "regime-paleo-glp1": "Régime paléolithique et GLP-1 : retour à une alimentation ancestrale pour perdre du poids. Guide pratique, aliments autorisés et adaptation du paléo aux contraintes des traitements modernes.",
  "regime-chrono-nutrition-glp1": "Optimisez vos GLP-1 avec la chrono-nutrition. Apprenez quand manger quoi pour maximiser l'efficacité de votre traitement, synchroniser hormones et métabolisme pour une perte de poids naturelle."
};

let correctedFiles = 0;
let errors = 0;

// Fonction pour corriger un fichier
function correctFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(contentDir, filePath);
    
    // Extraire le frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      console.log(`⚠️  ${relativePath}: Pas de frontmatter`);
      return;
    }
    
    let frontmatter = frontmatterMatch[1];
    let needsUpdate = false;
    
    // Extraire titre actuel
    const titleMatch = frontmatter.match(/^title:\s*["']?([^"'\n]+)["']?$/m);
    const descMatch = frontmatter.match(/^description:\s*["']?([^"'\n]+)["']?$/m);
    const slugMatch = frontmatter.match(/^slug:\s*["']?([^"'\n]+)["']?$/m);
    
    if (titleMatch) {
      const currentTitle = titleMatch[1].trim();
      const newTitle = titleImprovements[currentTitle];
      
      if (newTitle) {
        frontmatter = frontmatter.replace(
          /^title:\s*["']?[^"'\n]+["']?$/m,
          `title: "${newTitle}"`
        );
        needsUpdate = true;
        console.log(`✅ ${relativePath}: Titre amélioré`);
        console.log(`   Ancien: ${currentTitle}`);
        console.log(`   Nouveau: ${newTitle}`);
      } else if (currentTitle.length < 30) {
        // Génération automatique pour les titres très courts
        const autoTitle = generateBetterTitle(currentTitle, slugMatch?.[1]);
        if (autoTitle) {
          frontmatter = frontmatter.replace(
            /^title:\s*["']?[^"'\n]+["']?$/m,
            `title: "${autoTitle}"`
          );
          needsUpdate = true;
          console.log(`🔄 ${relativePath}: Titre auto-généré`);
          console.log(`   Ancien: ${currentTitle}`);
          console.log(`   Nouveau: ${autoTitle}`);
        }
      }
    }
    
    // Corriger description si nécessaire
    if (slugMatch) {
      const slug = slugMatch[1];
      const newDescription = descriptionImprovements[slug];
      
      if (newDescription) {
        if (descMatch) {
          frontmatter = frontmatter.replace(
            /^description:\s*["']?[^"'\n]+["']?$/m,
            `description: "${newDescription}"`
          );
        } else {
          // Ajouter description après le title
          frontmatter = frontmatter.replace(
            /^title:\s*["']?[^"'\n]+["']?$/m,
            `$&\ndescription: "${newDescription}"`
          );
        }
        needsUpdate = true;
        console.log(`📝 ${relativePath}: Description améliorée`);
      } else if (descMatch) {
        const currentDesc = descMatch[1].trim();
        if (currentDesc.length < 120) {
          const autoDesc = generateBetterDescription(titleMatch?.[1], slug);
          if (autoDesc) {
            frontmatter = frontmatter.replace(
              /^description:\s*["']?[^"'\n]+["']?$/m,
              `description: "${autoDesc}"`
            );
            needsUpdate = true;
            console.log(`🔄 ${relativePath}: Description auto-générée`);
          }
        }
      }
    }
    
    if (needsUpdate) {
      const newContent = content.replace(
        /^---\s*\n[\s\S]*?\n---/,
        `---\n${frontmatter}\n---`
      );
      
      fs.writeFileSync(filePath, newContent, 'utf-8');
      correctedFiles++;
    }
    
  } catch (error) {
    console.log(`❌ Erreur ${filePath}: ${error.message}`);
    errors++;
  }
}

// Génération automatique de titres améliorés
function generateBetterTitle(currentTitle, slug) {
  const titleTemplates = {
    'prix': 'Prix et Coût Détaillé de {treatment} en France 2025',
    'effet': 'Effets Secondaires de {treatment} : Guide Complet et Précautions',
    'guide': 'Guide Complet {treatment} : Efficacité, Posologie et Conseils',
    'danger': 'Dangers et Risques de {treatment} : Ce qu\'il Faut Savoir',
    'dosage': 'Dosage Optimal de {treatment} : Protocole et Ajustements'
  };
  
  if (slug) {
    for (const [key, template] of Object.entries(titleTemplates)) {
      if (slug.includes(key)) {
        const treatment = extractTreatmentName(slug);
        return template.replace('{treatment}', treatment);
      }
    }
  }
  
  // Fallback générique
  if (currentTitle.length < 30) {
    return `${currentTitle} : Guide Complet et Conseils Pratiques 2025`;
  }
  
  return null;
}

// Génération automatique de descriptions
function generateBetterDescription(title, slug) {
  const baseTemplates = {
    'prix': 'Découvrez le prix détaillé de {treatment} en France. Coût, remboursement, comparaison des pharmacies et conseils pour économiser sur votre traitement GLP-1.',
    'effet': 'Guide complet des effets secondaires de {treatment}. Symptômes, fréquence, gestion et conseils pour minimiser les risques de votre traitement anti-diabète.',
    'guide': 'Guide complet de {treatment} : efficacité, posologie, contre-indications et conseils pratiques pour optimiser votre traitement GLP-1 et perdre du poids.',
    'danger': 'Analyse des dangers et risques de {treatment}. Précautions, contre-indications et conseils de sécurité pour un usage optimal de ce traitement GLP-1.',
    'dosage': 'Protocole de dosage optimal de {treatment}. Instructions détaillées, ajustements progressifs et conseils pour maximiser l\'efficacité de votre traitement.'
  };
  
  if (slug) {
    for (const [key, template] of Object.entries(baseTemplates)) {
      if (slug.includes(key)) {
        const treatment = extractTreatmentName(slug);
        return template.replace('{treatment}', treatment);
      }
    }
  }
  
  return `Guide détaillé sur ${title || 'ce traitement GLP-1'}. Informations complètes, conseils pratiques et recommandations d'experts pour optimiser votre prise en charge.`;
}

// Extraire le nom du traitement depuis le slug
function extractTreatmentName(slug) {
  const treatments = {
    'mounjaro': 'Mounjaro',
    'ozempic': 'Ozempic',
    'wegovy': 'Wegovy',
    'saxenda': 'Saxenda',
    'trulicity': 'Trulicity',
    'victoza': 'Victoza',
    'rybelsus': 'Rybelsus',
    'zepbound': 'Zepbound'
  };
  
  for (const [key, name] of Object.entries(treatments)) {
    if (slug.includes(key)) {
      return name;
    }
  }
  
  return 'ce traitement GLP-1';
}

// Scanner et corriger tous les fichiers
function scanAndCorrect(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanAndCorrect(fullPath);
    } else if (file.endsWith('.md')) {
      correctFile(fullPath);
    }
  });
}

// Exécution principale
console.log('\n📂 Scan et correction des métadonnées...');
scanAndCorrect(contentDir);

console.log('\n' + '='.repeat(50));
console.log('📊 RÉSULTATS DE LA CORRECTION');
console.log('='.repeat(50));
console.log(`✅ Fichiers corrigés: ${correctedFiles}`);
console.log(`❌ Erreurs: ${errors}`);

if (correctedFiles > 0) {
  console.log('\n🎯 ACTIONS SUIVANTES RECOMMANDÉES:');
  console.log('├─ Vérifier les modifications avec git diff');
  console.log('├─ Tester le build avec npm run build');
  console.log('├─ Valider les métadonnées dans les pages');
  console.log('└─ Committer les améliorations');
  
  console.log('\n✨ Métadonnées optimisées pour un meilleur SEO !');
} else {
  console.log('\n💡 Aucune correction nécessaire - métadonnées déjà optimisées');
}

console.log('\n' + '='.repeat(50));
