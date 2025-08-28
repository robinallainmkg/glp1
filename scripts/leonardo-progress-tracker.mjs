#!/usr/bin/env node

/**
 * Script de suivi pour génération Leonardo.AI
 * Organise les tâches par priorité et suit les progrès
 */

import fs from 'fs/promises';
import path from 'path';

const thumbnailsDir = 'public/images/thumbnails';
const progressFile = 'scripts/leonardo-progress.json';

// Priorités par collection
const collectionPriorities = {
  'medicaments-glp1': { priority: 1, count: 39, desc: 'MÉDICAMENTS (Priorité MAX)' },
  'glp1-perte-de-poids': { priority: 2, count: 16, desc: 'PERTE DE POIDS (Très important)' },
  : { priority: 3, count: 15, desc: 'DIABÈTE (Important)' },
  'regime-glp1': { priority: 4, count: 14, desc: 'RÉGIMES (Moyen)' },
  'glp1-cout': { priority: 5, count: 5, desc: 'COÛTS (Moyen)' },
  'medecins-glp1-france': { priority: 6, count: 5, desc: 'MÉDECINS (Faible)' },
  'recherche-glp1': { priority: 7, count: 2, desc: 'RECHERCHE (Faible)' }
};

async function initProgress() {
  const defaultProgress = {
    startDate: new Date().toISOString(),
    totalArticles: 96,
    leonardoCreditsUsed: 0,
    leonardoCreditsDaily: 150,
    collections: Object.entries(collectionPriorities).map(([name, info]) => ({
      name,
      priority: info.priority,
      totalCount: info.count,
      completed: 0,
      description: info.desc,
      status: 'pending'
    })),
    dailyProgress: [],
    completed: 0,
    remaining: 96
  };

  try {
    await fs.access(progressFile);
    const existing = JSON.parse(await fs.readFile(progressFile, 'utf-8'));
    return existing;
  } catch {
    await fs.writeFile(progressFile, JSON.stringify(defaultProgress, null, 2));
    return defaultProgress;
  }
}

async function checkCurrentProgress() {
  try {
    // Compter les images par type
    const files = await fs.readdir(thumbnailsDir);
    const jpgFiles = files.filter(f => f.endsWith('.jpg'));
    const svgFiles = files.filter(f => f.endsWith('.svg'));
    
    // Charger le progrès actuel
    const progress = await initProgress();
    
    console.log('🎨 LEONARDO.AI - SUIVI DE PROGRESSION\n');
    
    // Statistiques générales
    console.log('📊 STATISTIQUES GÉNÉRALES:');
    console.log(`✅ Images JPG générées: ${jpgFiles.length}`);
    console.log(`🎨 Images SVG restantes: ${svgFiles.length}`);
    console.log(`📈 Progression globale: ${Math.round((jpgFiles.length/(jpgFiles.length+svgFiles.length))*100)}%`);
    console.log(`💳 Crédits Leonardo utilisés: ${progress.leonardoCreditsUsed || 0}/150 (aujourd'hui)\n`);
    
    // Progression par priorité
    console.log('🎯 PROGRESSION PAR PRIORITÉ:\n');
    
    for (const collection of progress.collections.sort((a, b) => a.priority - b.priority)) {
      const status = collection.completed === collection.totalCount ? '✅' : 
                    collection.completed > 0 ? '🟡' : '⏳';
      const percent = Math.round((collection.completed / collection.totalCount) * 100);
      
      console.log(`${status} PRIORITÉ ${collection.priority}: ${collection.description}`);
      console.log(`   Progression: ${collection.completed}/${collection.totalCount} (${percent}%)`);
      
      if (collection.completed < collection.totalCount) {
        const remaining = collection.totalCount - collection.completed;
        console.log(`   ⏳ Restant: ${remaining} images`);
      }
      console.log('');
    }
    
    // Prochaines actions
    console.log('🚀 PROCHAINES ACTIONS RECOMMANDÉES:\n');
    
    const nextCollection = progress.collections
      .filter(c => c.completed < c.totalCount)
      .sort((a, b) => a.priority - b.priority)[0];
    
    if (nextCollection) {
      console.log(`🎯 PRIORITÉ ACTUELLE: ${nextCollection.description}`);
      console.log(`📁 Collection: ${nextCollection.name}`);
      console.log(`📊 Progression: ${nextCollection.completed}/${nextCollection.totalCount}`);
      console.log(`⏳ Images restantes: ${nextCollection.totalCount - nextCollection.completed}\n`);
      
      // Conseils selon les crédits restants
      const creditsRemaining = 150 - (progress.leonardoCreditsUsed || 0);
      console.log(`💳 Crédits restants aujourd'hui: ${creditsRemaining}`);
      
      if (creditsRemaining >= 20) {
        console.log('✅ Vous pouvez continuer la génération aujourd\'hui');
      } else if (creditsRemaining > 0) {
        console.log('⚠️  Peu de crédits restants, terminez la session actuelle');
      } else {
        console.log('🔄 Crédits épuisés, revenez demain (150 nouveaux crédits)');
      }
    } else {
      console.log('🎉 TOUTES LES IMAGES GÉNÉRÉES ! Félicitations !');
    }
    
    console.log('\n💡 COMMANDES UTILES:');
    console.log('📋 Voir les prompts: cat scripts/leonardo-prompts-optimized.txt');
    console.log('🔄 Mettre à jour le progrès: node scripts/update-leonardo-progress.mjs');
    console.log('📊 Vérifier les images: node scripts/check-image-progress.mjs');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkCurrentProgress();
