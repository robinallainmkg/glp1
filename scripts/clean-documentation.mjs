#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

/**
 * Script de nettoyage et consolidation de la documentation
 * Supprime les fichiers MD dupliqués et obsolètes
 */

const PROJECT_ROOT = path.resolve(process.cwd());

// Fichiers MD à conserver (essentiels)
const ESSENTIAL_FILES = [
  'README.md',
  'INDEX_DOCUMENTATION.md',
  'RESUME_RAPIDE.md',
  'INDEX_CODE_COMPLET.md', 
  'GUIDE_TECHNIQUE_DETAILLE.md',
  'GUIDE_COLLECTIONS_ARTICLES_2025.md',
  'GUIDE_DEVELOPPEMENT_LOCAL.md',
  'CHECKLIST_FINALE.md',
  'COMMANDES_GIT.md'
];

// Fichiers MD à supprimer (doublons ou obsolètes)
const FILES_TO_REMOVE = [
  'GUIDE_DEPLOYMENT.md', // Remplacé par GUIDE_DEPLOYMENT_COMPLET.md
  'MEMO_DEPLOIEMENT.md', // Informations intégrées dans autres guides
  'RESUME_MODIFICATIONS.md', // Historique obsolète
  'RESTAURATION_DESIGN.md', // Procédures obsolètes
  'GUIDE_GESTION_ARTICLES.md', // Remplacé par GUIDE_COLLECTIONS_ARTICLES_2025.md
  'TEMPLATE_REFERENCE_ADMIN.md', // Dashboard finalisé
  'README_AI.md' // Obsolète
];

function cleanDocumentation() {
  console.log('🧹 Nettoyage de la documentation...\n');

  let removedCount = 0;
  let keptCount = 0;

  // Supprimer les fichiers obsolètes
  FILES_TO_REMOVE.forEach(filename => {
    const filePath = path.join(PROJECT_ROOT, filename);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`❌ Supprimé: ${filename}`);
        removedCount++;
      } catch (error) {
        console.error(`Erreur suppression ${filename}:`, error.message);
      }
    } else {
      console.log(`⚠️  Déjà absent: ${filename}`);
    }
  });

  // Vérifier les fichiers essentiels
  console.log('\n✅ Fichiers essentiels conservés:');
  ESSENTIAL_FILES.forEach(filename => {
    const filePath = path.join(PROJECT_ROOT, filename);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filename}`);
      keptCount++;
    } else {
      console.log(`❌ MANQUANT: ${filename}`);
    }
  });

  console.log(`\n📊 Résumé:`);
  console.log(`   - Fichiers supprimés: ${removedCount}`);
  console.log(`   - Fichiers essentiels: ${keptCount}/${ESSENTIAL_FILES.length}`);
  console.log(`   - Documentation nettoyée ✨`);
}

function updateIndexDocumentation() {
  const indexPath = path.join(PROJECT_ROOT, 'INDEX_DOCUMENTATION.md');
  
  const updatedContent = `# 📚 INDEX DOCUMENTATION - GLP1 France 2025

## 🤖 POUR AGENTS IA (LECTURE PRIORITAIRE)

1. **RESUME_RAPIDE.md** ⚡ - Commandes essentielles et accès immédiat
2. **INDEX_CODE_COMPLET.md** 📋 - Architecture technique complète  
3. **GUIDE_TECHNIQUE_DETAILLE.md** 💻 - Patterns de code et exemples
4. **GUIDE_COLLECTIONS_ARTICLES_2025.md** 📝 - Standards de contenu

## 🔧 GUIDES TECHNIQUES

- **GUIDE_DEVELOPPEMENT_LOCAL.md** - Configuration environnement local
- **CHECKLIST_FINALE.md** - Vérifications avant production  
- **COMMANDES_GIT.md** - Commandes Git essentielles

## 📊 ÉTAT SYSTÈME ACTUEL

### ✅ Fonctionnalités opérationnelles
- **74 articles** répartis en **9 collections**
- **Dashboard admin** complet avec interface moderne
- **Routing dynamique** via pages \`[slug].astro\`
- **Thèmes visuels** par collection
- **Build automatique** générant 94 pages statiques

### 🎨 Collections actives
| Nom | Thème | Articles |
|-----|-------|----------|
| alternatives-glp1 | 🌱 Cyan | 2 |
| effets-secondaires-glp1 | ⚠️ Rouge | 8 |
| glp1-cout | 💰 Jaune | 11 |
| glp1-diabete | 🩺 Bleu | 8 |
| glp1-perte-de-poids | 🏃 Vert | 13 |
| medicaments-glp1 | 💊 Violet | 13 |
| medecins-glp1-france | 👨‍⚕️ Indigo | 8 |
| recherche-glp1 | 🔬 Rose | 2 |
| regime-glp1 | 🍎 Orange | 9 |

### 🔄 Prochaines étapes
- **Backend API** pour CRUD réel des articles/collections
- **Authentification** pour sécuriser le dashboard
- **CMS intégré** avec éditeur WYSIWYG

---
*Documentation nettoyée et mise à jour - 8 août 2025*  
*Version système : 2.0 stable - Toutes fonctionnalités frontend opérationnelles*`;

  try {
    fs.writeFileSync(indexPath, updatedContent, 'utf-8');
    console.log('\n📝 INDEX_DOCUMENTATION.md mis à jour');
  } catch (error) {
    console.error('Erreur mise à jour index:', error.message);
  }
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanDocumentation();
  updateIndexDocumentation();
  console.log('\n🎉 Nettoyage de la documentation terminé !');
}
