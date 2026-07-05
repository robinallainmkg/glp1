#!/usr/bin/env node

/**
 * Script de correction des thumbnails manquants
 * Assigne des images pertinentes aux guides selon leur contenu
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mapping intelligent des guides vers les images existantes
const thumbnailMappings = {
  // Guides traitements GLP-1
  'guide-complet-wegovy.md': '/images/thumbnails/wegovy.jpg',
  'guide-complet-ozempic.md': '/images/thumbnails/ozempic-medical-guide.jpg',
  'guide-complet-saxenda.md': '/images/thumbnails/guide-complet-saxenda.webp',
  'guide-complet-mounjaro.md': '/images/thumbnails/mounjaro-blue.webp',
  'guide-complet-trulicity.md': '/images/thumbnails/trulicity.jpg',
  'guide-complet-victoza.md': '/images/thumbnails/victoza-medical-guide.jpg',
  'guide-complet-rybelsus.md': '/images/thumbnails/rybelsus-medical-guide.jpg',
  
  // Prix par traitement
  'prix-wegovy-france.md': '/images/thumbnails/prix-wegovy-france-illus.jpg',
  'prix-ozempic-france.md': '/images/thumbnails/prix-ozempic-france-illus.jpg',
  'prix-saxenda-france.md': '/images/thumbnails/prix-saxenda-france-illus.jpg',
  'prix-trulicity-france.md': '/images/thumbnails/prix-trulicity-france-illus.jpg',
  'prix-victoza-france.md': '/images/thumbnails/prix-victoza-france-illus.jpg',
  'prix-rybelsus-france.md': '/images/thumbnails/prix-rybelsus-france-illus.jpg',
  'prix-mounjaro-france.md': '/images/thumbnails/mounjaro-blue.webp',
  
  // Effets secondaires
  'effets-secondaires-wegovy.md': '/images/thumbnails/effets-secondaires-wegovy-illus.jpg',
  'effets-secondaires-ozempic.md': '/images/thumbnails/effets-secondaires-ozempic-illus.jpg',
  'effets-secondaires-saxenda.md': '/images/thumbnails/effets-secondaires-saxenda-illus.jpg',
  'effets-secondaires-trulicity.md': '/images/thumbnails/effets-secondaires-trulicity-illus.jpg',
  'effets-secondaires-victoza.md': '/images/thumbnails/effets-secondaires-victoza-illus.jpg',
  'effets-secondaires-rybelsus.md': '/images/thumbnails/effets-secondaires-rybelsus-illus.jpg',
  'effets-secondaires-mounjaro.md': '/images/thumbnails/mounjaro-blue.webp',
  
  // Régimes spécialisés
  'regime-mounjaro-optimal.md': '/images/thumbnails/mounjaro-blue.webp',
  'regime-cetogene-glp1.md': '/images/thumbnails/regime-cetogene-glp1.jpg',
  'regime-mediterraneen-glp1.md': '/images/thumbnails/regime-mediterraneen-glp1.jpg',
  'regime-paleo-glp1.md': '/images/thumbnails/regime-paleo-glp1.jpg',
  'regime-dash-glp1.md': '/images/thumbnails/regime-dash-glp1..jpg',
  'regime-detox-glp1.md': '/images/thumbnails/regime-detox-glp1.jpg',
  'regime-sans-sucre-glp1.md': '/images/thumbnails/regime-sans-sucre-glp1.jpg',
  'regime-chrono-nutrition-glp1.md': '/images/thumbnails/regime-chrono-nutrition-glp1.jpg',
  'jeune-intermittent-glp1.md': '/images/thumbnails/jeune-intermittent-glp.jpg',
  
  // Nutrition détaillée
  'glp1-micronutriments.md': '/images/thumbnails/glp1-micronutriments.jpg',
  'glp1-proteines.md': '/images/thumbnails/glp1-proteines.jpg',
  'glp1-portion-alimentaire.md': '/images/thumbnails/glp1-portion-alimentaire.jpg',
  'glp1-index-glycemique.md': '/images/thumbnails/glp1-index-glycemique.jpg',
  'glp1-calories-journalieres.md': '/images/thumbnails/glp1-calories-journalieres.jpg',
  
  // Médecins et cliniques
  'diabetologue-paris.md': '/images/thumbnails/diabetologue-paris.jpg',
  'endocrinologue-pour-maigrir.md': '/images/thumbnails/endocrinologue-pour-maigrir.jpg',
  'endocrinologue-pour-maigrir-new.md': '/images/thumbnails/endocrinologue-pour-maigrir-new.jpg',
  'clinique-pour-obesite.md': '/images/thumbnails/clinique-pour-obesite.jpg',
  'clinique-pour-obesite-new.md': '/images/thumbnails/clinique-pour-obesite-new.jpg',
  
  // Alternatives naturelles
  'alternatives-naturelles-ozempic.md': '/images/thumbnails/alternatives-naturelles-ozempic-illus.jpg',
  'berberine-glp1.md': '/images/thumbnails/berberine-glp1-illus.jpg',
  'cannelle-glp1.md': '/images/thumbnails/cannelle-glp1-illus.jpg',
  'chrome-diabete.md': '/images/thumbnails/chrome-diabete-illus.jpg',
  'semaglutide-naturel.md': '/images/thumbnails/semaglutide-naturel-illus.jpg',
  'supplements-glp1.md': '/images/thumbnails/supplements-glp1-illus.jpg',
  'vinaigre-cidre-glp1.md': '/images/thumbnails/vinaigre-cidre-glp1-illus.jpg',
  'phytotherapie-glp1.md': '/images/thumbnails/phytotherapie-glp1-illus.jpg',
  'homeopathie-diabete.md': '/images/thumbnails/homeopathie-diabete-illus.jpg',
  'meditation-glp1.md': '/images/thumbnails/meditation-glp1-illus.jpg',
  'acupuncture-glp1.md': '/images/thumbnails/acupuncture-glp1-illus.jpg',
  
  // Témoignages
  'marie-transformation-glp1.md': '/images/thumbnails/avant-apres-glp1.jpg',
  'sophie-transformation-glp1.md': '/images/thumbnails/avant-apres-glp1.jpg',
  'laurent-transformation-glp1.md': '/images/thumbnails/avant-apres-glp1.jpg',
  'serena-williams-glp1.md': '/images/thumbnails/serena.webp',
  
  // Recherche et science
  'recherche-clinique-glp1.md': '/images/thumbnails/recherche-clinique-glp1.jpg',
  'isglt2-liste.md': '/images/thumbnails/isglt2-liste.jpg',
  
  // Pages coûts spécialisées
  'anneau-gastrique-prix-cmu.md': '/images/thumbnails/anneau-gastrique-prix-cmu-illus.jpg',
  'operation-pour-maigrir-prix.md': '/images/thumbnails/operation-pour-maigrir-prix.jpg',
  'acheter-wegovy-en-france.md': '/images/thumbnails/acheter-wegovy-en-france-illus.jpg',
  'wegovy-remboursement-mutuelle.md': '/images/thumbnails/wegovy-remboursement-mutuelle-illus.jpg',
  
  // Pages statiques
  'partenaires.md': '/images/thumbnails/partenaires-illus.jpg',
  'homepage.md': '/images/thumbnails/homepage-illus.jpg'
};

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return null;
  
  const [, frontmatter, body] = match;
  return { frontmatter, body, fullMatch: match[0] };
}

// Fonction pour corriger le thumbnail d'un fichier
function fixThumbnail(filePath, correctThumbnail) {
  const content = readFileSync(filePath, 'utf-8');
  const parsed = extractFrontmatter(content);
  
  if (!parsed) {
    console.log(`   ❌ Pas de frontmatter dans ${filePath}`);
    return false;
  }
  
  let newFrontmatter = parsed.frontmatter;
  
  // Corriger ou ajouter thumbnail
  if (newFrontmatter.includes('thumbnail:')) {
    newFrontmatter = newFrontmatter.replace(/thumbnail:\s*["']?[^"'\n]*["']?/, `thumbnail: "${correctThumbnail}"`);
  } else if (newFrontmatter.includes('image:')) {
    newFrontmatter = newFrontmatter.replace(/image:\s*["']?[^"'\n]*["']?/, `image: "${correctThumbnail}"`);
  } else {
    // Ajouter après title si possible
    if (newFrontmatter.includes('title:')) {
      newFrontmatter = newFrontmatter.replace(/(title:\s*["'][^"']*["'][^\n]*\n)/, `$1thumbnail: "${correctThumbnail}"\n`);
    } else {
      newFrontmatter = `thumbnail: "${correctThumbnail}"\n` + newFrontmatter;
    }
  }
  
  // Ajouter thumbnailAlt si absent
  if (!newFrontmatter.includes('thumbnailAlt:')) {
    const titleMatch = newFrontmatter.match(/title:\s*["']([^"']*)["']/);
    const title = titleMatch ? titleMatch[1] : 'Article';
    newFrontmatter = newFrontmatter.replace(/(thumbnail:\s*["'][^"']*["'][^\n]*\n)/, `$1thumbnailAlt: "Illustration pour ${title}"\n`);
  }
  
  const newContent = content.replace(parsed.frontmatter, newFrontmatter);
  
  if (newContent !== content) {
    writeFileSync(filePath, newContent, 'utf-8');
    return true;
  }
  
  return false;
}

// Fonction principale
function fixAllThumbnails() {
  console.log('🎨 CORRECTION INTELLIGENTE DES THUMBNAILS');
  console.log('==========================================\n');
  
  const contentDir = join(__dirname, '..', 'src', 'content');
  const publicDir = join(__dirname, '..', 'public');
  
  let fixedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  
  for (const [filename, thumbnailPath] of Object.entries(thumbnailMappings)) {
    try {
      // Chercher le fichier dans tous les sous-dossiers
      const possiblePaths = [
        join(contentDir, filename),
        join(contentDir, 'traitements-glp1', filename),
        join(contentDir, 'glp1-cout', filename),
        join(contentDir, 'regime-glp1', filename),
        join(contentDir, 'effets-secondaires-glp1', filename),
        join(contentDir, 'alternatives-glp1', filename),
        join(contentDir, 'medecins-glp1-france', filename),
        join(contentDir, 'temoignages', filename),
        join(contentDir, 'recherche-glp1', filename),
        join(contentDir, 'pages-statiques', filename)
      ];
      
      let filePath = null;
      for (const path of possiblePaths) {
        if (existsSync(path)) {
          filePath = path;
          break;
        }
      }
      
      if (!filePath) {
        console.log(`⏭️ ${filename} - Fichier non trouvé`);
        notFoundCount++;
        continue;
      }
      
      // Vérifier que l'image de destination existe
      const imageFullPath = join(publicDir, thumbnailPath.replace(/^\//, ''));
      if (!existsSync(imageFullPath)) {
        console.log(`🖼️ ${filename} - Image manquante: ${thumbnailPath}`);
        continue;
      }
      
      // Corriger le thumbnail
      const success = fixThumbnail(filePath, thumbnailPath);
      
      if (success) {
        console.log(`✅ ${filename} → ${thumbnailPath}`);
        fixedCount++;
      } else {
        console.log(`⏭️ ${filename} - Déjà correct`);
      }
      
    } catch (error) {
      console.log(`❌ ${filename} - Erreur: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n==========================================');
  console.log('📊 RÉSULTATS:');
  console.log(`✅ Thumbnails corrigés: ${fixedCount}`);
  console.log(`⏭️ Fichiers non trouvés: ${notFoundCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📂 Total traité: ${Object.keys(thumbnailMappings).length}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 Correction terminée! Toutes les images sont maintenant assignées intelligemment.');
  }
}

// Exécution
fixAllThumbnails();
