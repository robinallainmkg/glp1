#!/usr/bin/env node

/**
 * Script de détection des liens cassés sur le site GLP-1 France
 * Analyse tous les liens internes et détecte les 404
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  baseUrl: 'https://glp1-france.com', // URL de production
  outputFile: path.join(__dirname, '../broken-links-report.json'),
  checkExternalLinks: false, // Pour éviter de spammer les sites externes
};

// Stockage des résultats
const results = {
  scannedFiles: 0,
  totalLinks: 0,
  brokenLinks: [],
  suspiciousLinks: [],
  redirectsNeeded: [],
  summary: {}
};

// Regex pour extraire les liens
const LINK_PATTERNS = [
  // Liens markdown
  /\[([^\]]+)\]\(([^)]+)\)/g,
  // Liens HTML href
  /href=["']([^"']+)["']/g,
  // Liens Astro
  /to=["']([^"']+)["']/g,
  // window.location
  /window\.location\.(href|replace)\s*=\s*["']([^"']+)["']/g,
];

// Extensions de fichiers à analyser
const ANALYZABLE_EXTENSIONS = ['.md', '.astro', '.js', '.ts', '.jsx', '.tsx'];

/**
 * Extrait tous les liens d'un contenu
 */
function extractLinks(content, filePath) {
  const links = new Set();
  
  LINK_PATTERNS.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      let link;
      
      if (pattern.source.includes('window.location')) {
        link = match[2]; // Pour window.location, le lien est en position 2
      } else {
        link = match[1] || match[2]; // Pour les autres, prendre le premier groupe non-null
      }
      
      // Filtrer les liens valides
      if (link && 
          !link.startsWith('mailto:') && 
          !link.startsWith('tel:') && 
          !link.startsWith('javascript:') &&
          !link.startsWith('#') &&
          !link.includes('{{') &&
          !link.includes('${')) {
        links.add(link);
      }
    }
  });
  
  return Array.from(links);
}

/**
 * Vérifie si un chemin de fichier existe
 */
function checkInternalPath(linkPath) {
  // Normaliser le chemin
  let normalizedPath = linkPath;
  
  // Supprimer les paramètres de query et fragments
  normalizedPath = normalizedPath.split('?')[0].split('#')[0];
  
  // Ajouter index.html si nécessaire
  if (normalizedPath.endsWith('/')) {
    normalizedPath += 'index.html';
  }
  
  // Chemins à vérifier
  const pathsToCheck = [
    // Pages statiques
    path.join(CONFIG.srcDir, 'pages', normalizedPath.slice(1)),
    path.join(CONFIG.srcDir, 'pages', normalizedPath.slice(1) + '.astro'),
    
    // Collections content
    path.join(CONFIG.srcDir, 'content', normalizedPath.slice(1).replace('/index.html', '.md')),
    
    // Public assets
    path.join(__dirname, '../public', normalizedPath.slice(1)),
    
    // Dist (build output) - si disponible
    path.join(__dirname, '../dist', normalizedPath.slice(1)),
  ];
  
  return pathsToCheck.some(p => fs.existsSync(p));
}

/**
 * Analyse un fichier et extrait ses liens
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const links = extractLinks(content, filePath);
    
    results.scannedFiles++;
    results.totalLinks += links.length;
    
    console.log(`📄 ${path.relative(CONFIG.srcDir, filePath)}: ${links.length} liens trouvés`);
    
    links.forEach(link => {
      analyzeLink(link, filePath);
    });
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'analyse de ${filePath}:`, error.message);
  }
}

/**
 * Analyse un lien spécifique
 */
function analyzeLink(link, sourceFile) {
  const isExternal = link.startsWith('http://') || link.startsWith('https://');
  const isInternal = link.startsWith('/');
  const isRelative = !isExternal && !isInternal;
  
  const linkInfo = {
    link,
    sourceFile: path.relative(CONFIG.srcDir, sourceFile),
    type: isExternal ? 'external' : isInternal ? 'internal' : 'relative'
  };
  
  if (isInternal) {
    // Vérifier les liens internes
    if (!checkInternalPath(link)) {
      console.log(`🔗 Lien cassé détecté: ${link} dans ${linkInfo.sourceFile}`);
      results.brokenLinks.push(linkInfo);
      
      // Suggérer des redirections
      suggestRedirect(link);
    }
  } else if (isRelative) {
    // Liens relatifs suspects
    if (link.includes('../') || link.includes('./')) {
      results.suspiciousLinks.push(linkInfo);
    }
  }
  
  // Détecter les patterns problématiques
  detectProblematicPatterns(link, linkInfo);
}

/**
 * Suggère des redirections pour les liens cassés
 */
function suggestRedirect(brokenLink) {
  const suggestions = [];
  
  // Patterns de redirection courrants
  const redirectPatterns = [
    // Ancienne structure vers nouvelle
    {
      pattern: /^\/medicaments-glp1\/(.+)/,
      replacement: '/collections/medicaments-glp1/$1'
    },
    {
      pattern: /^\/pages-statiques\/(.+)/,
      replacement: '/collections/temoignages/$1'
    },
    {
      pattern: /^\/glp1-cout\/(.+)/,
      replacement: '/collections/glp1-cout/$1'
    },
    // Ajoutez d'autres patterns selon vos besoins
  ];
  
  redirectPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(brokenLink)) {
      const newPath = brokenLink.replace(pattern, replacement);
      suggestions.push(newPath);
    }
  });
  
  if (suggestions.length > 0) {
    results.redirectsNeeded.push({
      brokenLink,
      suggestions
    });
  }
}

/**
 * Détecte les patterns problématiques dans les liens
 */
function detectProblematicPatterns(link, linkInfo) {
  // URLs malformées
  if (link.includes('//') && !link.startsWith('http')) {
    results.suspiciousLinks.push({
      ...linkInfo,
      issue: 'Double slash detected'
    });
  }
  
  // Extensions manquantes
  if (link.startsWith('/') && !link.includes('.') && !link.endsWith('/')) {
    results.suspiciousLinks.push({
      ...linkInfo,
      issue: 'Missing trailing slash or extension'
    });
  }
}

/**
 * Scanne récursivement tous les fichiers
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer certains dossiers
      if (!['node_modules', '.git', 'dist', '.astro'].includes(file)) {
        scanDirectory(filePath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(filePath);
      if (ANALYZABLE_EXTENSIONS.includes(ext)) {
        analyzeFile(filePath);
      }
    }
  });
}

/**
 * Génère le rapport final
 */
function generateReport() {
  results.summary = {
    totalScannedFiles: results.scannedFiles,
    totalLinks: results.totalLinks,
    brokenLinksCount: results.brokenLinks.length,
    suspiciousLinksCount: results.suspiciousLinks.length,
    redirectsNeededCount: results.redirectsNeeded.length,
    healthScore: Math.round((1 - results.brokenLinks.length / Math.max(results.totalLinks, 1)) * 100)
  };
  
  // Sauvegarder le rapport
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));
  
  // Afficher le résumé
  console.log('\n📊 RAPPORT DE SANTÉ DES LIENS');
  console.log('================================');
  console.log(`📄 Fichiers analysés: ${results.summary.totalScannedFiles}`);
  console.log(`🔗 Liens totaux: ${results.summary.totalLinks}`);
  console.log(`❌ Liens cassés: ${results.summary.brokenLinksCount}`);
  console.log(`⚠️  Liens suspects: ${results.summary.suspiciousLinksCount}`);
  console.log(`🔄 Redirections suggérées: ${results.summary.redirectsNeededCount}`);
  console.log(`💯 Score de santé: ${results.summary.healthScore}%`);
  
  if (results.brokenLinks.length > 0) {
    console.log('\n🔴 LIENS CASSÉS DÉTECTÉS:');
    results.brokenLinks.slice(0, 10).forEach(link => {
      console.log(`  - ${link.link} (dans ${link.sourceFile})`);
    });
    
    if (results.brokenLinks.length > 10) {
      console.log(`  ... et ${results.brokenLinks.length - 10} autres`);
    }
  }
  
  if (results.redirectsNeeded.length > 0) {
    console.log('\n🔄 REDIRECTIONS SUGGÉRÉES:');
    results.redirectsNeeded.slice(0, 5).forEach(redirect => {
      console.log(`  ${redirect.brokenLink} → ${redirect.suggestions[0]}`);
    });
  }
  
  console.log(`\n📋 Rapport complet sauvegardé: ${CONFIG.outputFile}`);
}

/**
 * Fonction principale
 */
function main() {
  console.log('🚀 Démarrage de l\'analyse des liens...\n');
  
  // Vérifier que le dossier src existe
  if (!fs.existsSync(CONFIG.srcDir)) {
    console.error(`❌ Dossier source introuvable: ${CONFIG.srcDir}`);
    process.exit(1);
  }
  
  // Scanner tous les fichiers
  scanDirectory(CONFIG.srcDir);
  
  // Générer le rapport
  generateReport();
  
  // Code de sortie
  process.exit(results.brokenLinks.length > 0 ? 1 : 0);
}

// Lancer le script
main();
