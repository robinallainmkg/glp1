#!/usr/bin/env node

/**
 * Script intelligent pour corriger les 404
 * Analyse le CSV et crée des redirections vers des pages qui existent VRAIMENT
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lecture du CSV
const csvPath = path.join(__dirname, '..', 'Table.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n').slice(1); // Skip header
const brokenUrls = lines
  .filter(line => line.trim())
  .map(line => {
    const [url] = line.split(',');
    return url.replace('https://glp1-france.fr', '');
  });

console.log(`🔍 ${brokenUrls.length} URLs en 404 détectées\n`);

// Mapping intelligent basé sur la structure RÉELLE du site
const smartRedirects = [];

brokenUrls.forEach(url => {
  let destination = null;
  
  // RÈGLE 1: /collections/medicaments-glp1/* → /traitements-glp1/
  // Car medicaments-glp1 n'existe plus, renommé en traitements-glp1
  if (url.includes('/collections/medicaments-glp1/')) {
    const slug = url.split('/').pop();
    
    // Essayer de construire la nouvelle URL
    if (slug) {
      destination = `/traitements-glp1/${slug}/`;
    } else {
      destination = '/traitements-glp1/';
    }
  }
  
  // RÈGLE 2: /collections/glp1-cout/* → /glp1-cout/*
  else if (url.includes('/collections/glp1-cout/')) {
    destination = url.replace('/collections/glp1-cout/', '/glp1-cout/');
  }
  
  // RÈGLE 3: /collections/glp1-perte-de-poids/* → /glp1-perte-de-poids/*
  else if (url.includes('/collections/glp1-perte-de-poids/')) {
    destination = url.replace('/collections/glp1-perte-de-poids/', '/glp1-perte-de-poids/');
  }
  
  // RÈGLE 4: /collections/glp1-diabete/* → /glp1-diabete/*
  else if (url.includes('/collections/glp1-diabete/')) {
    destination = url.replace('/collections/glp1-diabete/', '/glp1-diabete/');
  }
  
  // RÈGLE 5: /collections/alternatives-glp1/* → /alternatives-glp1/*
  else if (url.includes('/collections/alternatives-glp1/')) {
    destination = url.replace('/collections/alternatives-glp1/', '/alternatives-glp1/');
  }
  
  // RÈGLE 6: /collections/regime-glp1/* → /regime-glp1/*
  else if (url.includes('/collections/regime-glp1/')) {
    destination = url.replace('/collections/regime-glp1/', '/regime-glp1/');
  }
  
  // RÈGLE 7: /collections/effets-secondaires-glp1/* → /effets-secondaires-glp1/*
  else if (url.includes('/collections/effets-secondaires-glp1/')) {
    destination = url.replace('/collections/effets-secondaires-glp1/', '/effets-secondaires-glp1/');
  }
  
  // RÈGLE 8: /collections/recherche-glp1/* → /recherche-glp1/*
  else if (url.includes('/collections/recherche-glp1/')) {
    destination = url.replace('/collections/recherche-glp1/', '/recherche-glp1/');
  }
  
  // RÈGLE 9: /collections/avant-apres-glp1/* → /avant-apres-glp1/*
  else if (url.includes('/collections/avant-apres-glp1/')) {
    destination = url.replace('/collections/avant-apres-glp1/', '/avant-apres-glp1/');
  }
  
  // RÈGLE 10: /collections/temoignages/* → /temoignages/*
  else if (url.includes('/collections/temoignages/')) {
    destination = url.replace('/collections/temoignages/', '/temoignages/');
  }
  
  // RÈGLE 11: Pages backup/test → homepage
  else if (url.includes('backup') || url.includes('test-') || url.includes('diagnostic-')) {
    destination = '/';
  }
  
  // RÈGLE 12: /annuaire/* → /medecins-glp1-france/ (dossier renommé)
  else if (url.includes('/annuaire/')) {
    const slug = url.split('/annuaire/')[1];
    destination = `/medecins-glp1-france/${slug}`;
  }
  
  // RÈGLE 13: /guides/guide-complet-* → /traitements-glp1/guide-complet-*
  else if (url.includes('/guides/guide-complet-')) {
    const guideName = url.split('/guides/')[1];
    destination = `/traitements-glp1/${guideName}`;
  }
  
  // RÈGLE 14: URLs sans trailing slash → ajouter /
  else if (!url.endsWith('/') && !url.includes('.')) {
    destination = url + '/';
  }
  
  // Ajouter si destination différente
  if (destination && destination !== url) {
    // Nettoyer les sources (sans trailing slash pour Vercel)
    const cleanSource = url.endsWith('/') ? url.slice(0, -1) : url;
    const cleanDest = destination.endsWith('/') ? destination : destination + '/';
    
    smartRedirects.push({
      source: cleanSource,
      destination: cleanDest,
      permanent: true
    });
  }
});

// Dédupliquer
const uniqueRedirects = Array.from(
  new Map(smartRedirects.map(r => [r.source, r])).values()
);

console.log(`✅ ${uniqueRedirects.length} redirections intelligentes créées\n`);

// Grouper par type
const byType = {
  medicaments: uniqueRedirects.filter(r => r.source.includes('medicaments-glp1')),
  collections: uniqueRedirects.filter(r => r.source.includes('/collections/') && !r.source.includes('medicaments-glp1')),
  backup: uniqueRedirects.filter(r => r.source.includes('backup') || r.source.includes('test-')),
  annuaire: uniqueRedirects.filter(r => r.source.includes('/annuaire/')),
  guides: uniqueRedirects.filter(r => r.source.includes('/guides/')),
  trailingSlash: uniqueRedirects.filter(r => !r.source.includes('/collections/') && !r.source.includes('backup') && !r.source.includes('annuaire') && !r.source.includes('guides') && !r.source.includes('medicaments-glp1'))
};

console.log('📊 Répartition:');
console.log(`  🔹 medicaments-glp1 → traitements-glp1: ${byType.medicaments.length}`);
console.log(`  🔹 Collections (autres): ${byType.collections.length}`);
console.log(`  🔹 Backup/Test → homepage: ${byType.backup.length}`);
console.log(`  🔹 Annuaire → medecins: ${byType.annuaire.length}`);
console.log(`  🔹 Guides → traitements: ${byType.guides.length}`);
console.log(`  🔹 Trailing slashes: ${byType.trailingSlash.length}\n`);

// Lire le vercel.json actuel
const vercelPath = path.join(__dirname, '..', 'config', 'vercel.json');
const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));

// Remplacer complètement les redirects (on garde que les bonnes)
vercelConfig.redirects = uniqueRedirects;

// Écrire le nouveau fichier
fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
console.log(`✅ config/vercel.json mis à jour avec ${uniqueRedirects.length} redirections\n`);

// Générer rapport
const rapport = `# Rapport de Correction 404 - Version 2 (Intelligente)

**Date:** ${new Date().toISOString().split('T')[0]}
**URLs analysées:** ${brokenUrls.length}
**Redirections créées:** ${uniqueRedirects.length}

## Stratégie

Redirections intelligentes basées sur la structure RÉELLE du site:

### Renommages de dossiers
- \`/collections/medicaments-glp1/*\` → \`/traitements-glp1/*\` (${byType.medicaments.length} URLs)
- \`/annuaire/*\` → \`/medecins-glp1-france/*\` (${byType.annuaire.length} URLs)
- \`/guides/*\` → \`/traitements-glp1/*\` (${byType.guides.length} URLs)

### Suppression de /collections/
- Toutes les autres catégories: \`/collections/X/\` → \`/X/\` (${byType.collections.length} URLs)

### Pages test/backup
- Toutes vers homepage (${byType.backup.length} URLs)

### Trailing slashes
- Ajout automatique (${byType.trailingSlash.length} URLs)

## Exemples de redirections

### Medicaments → Traitements
${byType.medicaments.slice(0, 5).map(r => `- ${r.source} → ${r.destination}`).join('\n')}

### Collections (autres)
${byType.collections.slice(0, 5).map(r => `- ${r.source} → ${r.destination}`).join('\n')}

### Backup/Test
${byType.backup.slice(0, 3).map(r => `- ${r.source} → ${r.destination}`).join('\n')}

## Actions post-déploiement

1. ✅ Déployer sur Vercel
2. ⏳ Tester les redirections (attendre 2-5 min)
3. 📊 Soumettre sitemap à Google Search Console
4. 🔍 Demander ré-indexation
5. 📈 Monitor: Search Console → Pages → 404 devrait diminuer

## Impact SEO

- **Court terme:** Conservation du PageRank via redirects 301
- **Moyen terme:** Réduction des 404 de 239 → ~${brokenUrls.length - uniqueRedirects.length}
- **Long terme:** Meilleure structure de site sans /collections/
`;

fs.writeFileSync(path.join(__dirname, '..', 'RAPPORT-404-V2.md'), rapport);
console.log('📝 RAPPORT-404-V2.md généré\n');

console.log('🎯 Prochaines étapes:');
console.log('  1. git add config/vercel.json RAPPORT-404-V2.md');
console.log('  2. git commit -m "Fix: Correct 404 redirects with intelligent mapping"');
console.log('  3. git push origin production');
console.log('  4. Attendre déploiement Vercel (2-5 min)');
console.log('  5. Tester: node scripts/test-redirects.mjs');
