// 📝 OPTIMISATION TITRES ARTICLES 2025
// Réécrire les titres pour qu'ils soient plus clairs et engageants

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('📝 OPTIMISATION TITRES ARTICLES 2025\n');

// Patterns de titres à améliorer
const titlePatterns = {
  // Remplacer 2024 par 2025
  '2024': '2025',
  
  // Améliorer les formulations génériques
  'Guide': 'Guide Complet',
  'Comment': 'Comment Bien',
  'Tout savoir': 'Guide Complet 2025',
  'Les effets': 'Effets Secondaires',
  'Prix': 'Prix et Remboursement 2025',
  'Avis': 'Avis Médical et Témoignages 2025',
  'Posologie': 'Posologie et Mode d\'emploi 2025',
  'Efficacité': 'Efficacité Prouvée'
};

// Mots-clés importants à préserver
const importantKeywords = [
  'GLP-1', 'Ozempic', 'Wegovy', 'Mounjaro', 'Saxenda',
  'semaglutide', 'dulaglutide', 'liraglutide', 'tirzepatide',
  'diabète', 'perte de poids', 'minceur', 'maigrir',
  'effets secondaires', 'posologie', 'prix', 'avis',
  'prescription', 'ordonnance', 'remboursement'
];

// Templates de titres optimisés par catégorie
const titleTemplates = {
  guide: (keyword, year = '2025') => `Guide Complet ${keyword} ${year} : Tout Savoir`,
  avis: (keyword, year = '2025') => `${keyword} Avis ${year} : Efficacité et Témoignages Réels`,
  prix: (keyword, year = '2025') => `${keyword} Prix ${year} : Coût et Remboursement`,
  posologie: (keyword) => `${keyword} Posologie : Comment Bien l'Utiliser ?`,
  effets: (keyword) => `${keyword} Effets Secondaires : Guide Complet de Prévention`,
  vs: (keyword1, keyword2, year = '2025') => `${keyword1} vs ${keyword2} ${year} : Comparatif Complet`,
  perte_poids: (keyword, year = '2025') => `${keyword} Perte de Poids ${year} : Résultats et Témoignages`,
  prescription: (keyword, year = '2025') => `${keyword} sur Ordonnance ${year} : Comment l'Obtenir ?`
};

// Fonction pour extraire les mots-clés d'un titre
function extractKeywords(title) {
  const found = [];
  importantKeywords.forEach(keyword => {
    if (title.toLowerCase().includes(keyword.toLowerCase())) {
      found.push(keyword);
    }
  });
  return found;
}

// Fonction pour déterminer la catégorie d'un article
function categorizeArticle(title, content = '') {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  if (titleLower.includes('avis') || titleLower.includes('témoignage')) return 'avis';
  if (titleLower.includes('prix') || titleLower.includes('coût') || titleLower.includes('remboursement')) return 'prix';
  if (titleLower.includes('posologie') || titleLower.includes('dose') || titleLower.includes('utiliser')) return 'posologie';
  if (titleLower.includes('effet') && titleLower.includes('secondaire')) return 'effets';
  if (titleLower.includes(' vs ') || titleLower.includes('comparaison')) return 'vs';
  if (titleLower.includes('perte') && titleLower.includes('poids')) return 'perte_poids';
  if (titleLower.includes('prescription') || titleLower.includes('ordonnance')) return 'prescription';
  return 'guide';
}

// Fonction pour générer un nouveau titre optimisé
function generateOptimizedTitle(currentTitle, category, keywords, slug) {
  // Nettoyer le titre actuel
  let cleanTitle = currentTitle
    .replace(/["""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  
  // Remplacer 2024 par 2025
  cleanTitle = cleanTitle.replace(/2024/g, '2025');
  
  // Si le titre est déjà bon (contient 2025 et des mots-clés), on le garde
  if (cleanTitle.includes('2025') && cleanTitle.length > 20 && keywords.length > 0) {
    return cleanTitle;
  }
  
  // Sinon, générer un nouveau titre basé sur la catégorie
  const mainKeyword = keywords[0] || extractMainKeywordFromSlug(slug);
  const template = titleTemplates[category];
  
  if (template && mainKeyword) {
    if (category === 'vs' && keywords.length > 1) {
      return template(keywords[0], keywords[1]);
    }
    return template(mainKeyword);
  }
  
  // Fallback : améliorer le titre existant
  return improveExistingTitle(cleanTitle, keywords);
}

// Fonction pour extraire le mot-clé principal du slug
function extractMainKeywordFromSlug(slug) {
  const slugKeywords = slug.split('-');
  for (const keyword of importantKeywords) {
    if (slug.toLowerCase().includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  // Chercher des combinaisons
  if (slug.includes('ozempic')) return 'Ozempic';
  if (slug.includes('wegovy')) return 'Wegovy';
  if (slug.includes('mounjaro')) return 'Mounjaro';
  if (slug.includes('saxenda')) return 'Saxenda';
  if (slug.includes('semaglutide')) return 'Semaglutide';
  if (slug.includes('glp1') || slug.includes('glp-1')) return 'GLP-1';
  return 'GLP-1'; // Fallback
}

// Fonction pour améliorer un titre existant
function improveExistingTitle(title, keywords) {
  let improved = title;
  
  // Ajouter 2025 si pas présent
  if (!improved.includes('2025') && !improved.includes('2024')) {
    improved = `${improved} 2025`;
  }
  
  // Améliorer les formulations
  Object.entries(titlePatterns).forEach(([old, replacement]) => {
    improved = improved.replace(new RegExp(old, 'gi'), replacement);
  });
  
  // Capitaliser correctement
  improved = improved.replace(/\b\w/g, letter => letter.toUpperCase());
  
  return improved;
}

// Fonction pour analyser et proposer des améliorations de titre
async function analyzeTitles() {
  const collections = ['glp1-perte-de-poids', 'medicaments-glp1', 'effets-secondaires-glp1', 'guide-glp1'];
  const improvements = [];
  
  for (const collection of collections) {
    const collectionPath = join(rootDir, 'src', 'content', collection);
    
    if (!fs.existsSync(collectionPath)) continue;
    
    const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extraire le frontmatter
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) continue;
      
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
      const slugMatch = frontmatter.match(/slug:\s*["']?([^"'\n]+)["']?/);
      
      if (!titleMatch) continue;
      
      const currentTitle = titleMatch[1].trim();
      const slug = slugMatch ? slugMatch[1].trim() : file.replace('.md', '');
      
      // Analyser le titre
      const keywords = extractKeywords(currentTitle);
      const category = categorizeArticle(currentTitle, content);
      const optimizedTitle = generateOptimizedTitle(currentTitle, category, keywords, slug);
      
      // Vérifier si une amélioration est nécessaire
      const needsImprovement = 
        currentTitle !== optimizedTitle ||
        currentTitle.includes('2024') ||
        currentTitle.length < 20 ||
        !currentTitle.includes('2025');
      
      if (needsImprovement) {
        improvements.push({
          file: `${collection}/${file}`,
          currentTitle,
          optimizedTitle,
          category,
          keywords,
          slug,
          priority: calculatePriority(currentTitle, optimizedTitle)
        });
      }
    }
  }
  
  return improvements.sort((a, b) => b.priority - a.priority);
}

// Fonction pour calculer la priorité d'amélioration
function calculatePriority(current, optimized) {
  let priority = 0;
  
  if (current.includes('2024')) priority += 10; // Urgent : mise à jour année
  if (current.length < 20) priority += 8; // Titre trop court
  if (!current.includes('Guide') && !current.includes('Avis')) priority += 6; // Manque clarté
  if (optimized.length > current.length) priority += 4; // Titre plus descriptif
  if (!current.includes('2025')) priority += 5; // Manque année actuelle
  
  return priority;
}

// Fonction pour appliquer les améliorations
async function applyTitleImprovements(improvements, applyAll = false) {
  console.log(`\n🔧 Application des améliorations${applyAll ? ' (TOUTES)' : ' (TOP 10)'}...\n`);
  
  const toApply = applyAll ? improvements : improvements.slice(0, 10);
  let applied = 0;
  
  for (const improvement of toApply) {
    try {
      const filePath = join(rootDir, 'src', 'content', improvement.file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Remplacer le titre dans le frontmatter
      const newContent = content.replace(
        /title:\s*["']?[^"'\n]+["']?/,
        `title: "${improvement.optimizedTitle}"`
      );
      
      fs.writeFileSync(filePath, newContent, 'utf-8');
      applied++;
      
      console.log(`✅ ${improvement.file}`);
      console.log(`   Ancien : "${improvement.currentTitle}"`);
      console.log(`   Nouveau: "${improvement.optimizedTitle}"`);
      console.log(`   Catégorie: ${improvement.category}, Priorité: ${improvement.priority}\n`);
      
    } catch (error) {
      console.log(`❌ Erreur sur ${improvement.file}: ${error.message}`);
    }
  }
  
  console.log(`\n🎯 Résumé: ${applied}/${toApply.length} titres améliorés`);
  return applied;
}

// Exécution principale
async function main() {
  try {
    console.log('🔍 Analyse des titres d\'articles...\n');
    
    const improvements = await analyzeTitles();
    
    console.log(`📊 Analyse terminée: ${improvements.length} améliorations proposées\n`);
    
    if (improvements.length === 0) {
      console.log('✅ Tous les titres sont déjà optimisés !');
      return;
    }
    
    // Afficher le top 10
    console.log('🏆 TOP 10 des améliorations prioritaires:\n');
    improvements.slice(0, 10).forEach((improvement, index) => {
      console.log(`${index + 1}. ${improvement.file} (priorité: ${improvement.priority})`);
      console.log(`   Actuel  : "${improvement.currentTitle}"`);
      console.log(`   Proposé : "${improvement.optimizedTitle}"`);
      console.log(`   Mots-clés: ${improvement.keywords.join(', ') || 'aucun'}\n`);
    });
    
    // Appliquer toutes les améliorations
    await applyTitleImprovements(improvements, true);
    
    console.log('\n🎉 Toutes les améliorations ont été appliquées !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

main();
