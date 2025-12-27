#!/usr/bin/env node

/**
 * SOLUTION ULTIME: Générer redirects depuis Table.csv et les injecter dans dist/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Génération des redirects Vercel depuis CSV\n');

// Lire le CSV
const csvPath = path.join(__dirname, '..', 'Table.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').slice(1);
const brokenUrls = lines
  .filter(line => line.trim())
  .map(line => {
    const [url] = line.split(',');
    return url.replace('https://glp1-france.fr', '').trim();
  })
  .filter(url => url);

console.log(`📋 ${brokenUrls.length} URLs en 404 détectées\n`);

const redirects = [];

brokenUrls.forEach(url => {
  let destination = null;
  
  // RÈGLE 1: Médicaments spécifiques → Guides
  if (url.includes('/medicaments-glp1/wegovy')) destination = '/traitements-glp1/guide-complet-wegovy/';
  else if (url.includes('/medicaments-glp1/mounjaro')) destination = '/traitements-glp1/guide-complet-mounjaro/';
  else if (url.includes('/medicaments-glp1/ozempic')) destination = '/traitements-glp1/guide-complet-ozempic/';
  else if (url.includes('/medicaments-glp1/saxenda')) destination = '/glp1-cout/prix-saxenda-france/';
  else if (url.includes('/medicaments-glp1/trulicity')) destination = '/traitements-glp1/guide-complet-trulicity/';
  else if (url.includes('/medicaments-glp1/victoza')) destination = '/traitements-glp1/guide-complet-victoza/';
  
  // RÈGLE 2: Suppression /collections/ par catégorie
  else if (url.includes('/collections/glp1-cout/')) {
    destination = url.replace('/collections/glp1-cout/', '/glp1-cout/');
  }
  else if (url.includes('/collections/glp1-perte-de-poids/')) {
    destination = url.replace('/collections/glp1-perte-de-poids/', '/glp1-perte-de-poids/');
  }
  else if (url.includes('/collections/glp1-diabete/')) {
    destination = url.replace('/collections/glp1-diabete/', '/glp1-diabete/');
  }
  else if (url.includes('/collections/alternatives-glp1/')) {
    destination = url.replace('/collections/alternatives-glp1/', '/alternatives-glp1/');
  }
  else if (url.includes('/collections/regime-glp1/')) {
    destination = url.replace('/collections/regime-glp1/', '/regime-glp1/');
  }
  else if (url.includes('/collections/effets-secondaires-glp1/')) {
    destination = url.replace('/collections/effets-secondaires-glp1/', '/effets-secondaires-glp1/');
  }
  else if (url.includes('/collections/recherche-glp1/')) {
    destination = url.replace('/collections/recherche-glp1/', '/recherche-glp1/');
  }
  else if (url.includes('/collections/avant-apres-glp1/')) {
    destination = url.replace('/collections/avant-apres-glp1/', '/avant-apres-glp1/');
  }
  else if (url.includes('/collections/temoignages/')) {
    destination = url.replace('/collections/temoignages/', '/temoignages/');
  }
  else if (url.includes('/collections/medecins-glp1-france/')) {
    destination = url.replace('/collections/medecins-glp1-france/', '/medecins-glp1-france/');
  }
  else if (url.includes('/collections/medicaments-glp1/')) {
    destination = url.replace('/collections/medicaments-glp1/', '/traitements-glp1/');
  }
  else if (url.includes('/collections/traitements-glp1/')) {
    destination = url.replace('/collections/traitements-glp1/', '/traitements-glp1/');
  }
  
  // RÈGLE 3: Annuaire → medecins
  else if (url.includes('/annuaire/')) {
    destination = url.replace('/annuaire/', '/medecins-glp1-france/');
  }
  
  // RÈGLE 4: Guides déplacés
  else if (url.includes('/guides/guide-complet-')) {
    const guideName = url.split('/guides/')[1];
    destination = `/traitements-glp1/${guideName}`;
  }
  
  // RÈGLE 5: Pages backup/test
  else if (url.includes('backup') || url.includes('test-') || url.includes('diagnostic-')) {
    destination = '/';
  }
  
  // RÈGLE 6: Pages qui n'existent plus → homepage ou catégorie
  else if (url.startsWith('/medicaments-glp1/')) {
    destination = url.replace('/medicaments-glp1/', '/traitements-glp1/');
  }
  else if (url.includes('/experts')) destination = '/';
  else if (url.includes('/produits-recommandes')) destination = '/';
  else if (url.includes('/guide-debutant')) destination = '/';
  else if (url.includes('/qu-est-ce-que-glp1')) destination = '/';
  
  // RÈGLE 7: Témoignages
  else if (url.includes('temoignage-')) destination = '/temoignages/';
  else if (url.includes('serena-williams')) destination = '/temoignages/';
  
  // RÈGLE 8: Pages sans trailing slash
  else if (!url.endsWith('/') && !url.includes('.')) {
    destination = url + '/';
  }
  
  // Ajouter si on a une destination
  if (destination && destination !== url) {
    // Nettoyer
    const cleanSource = url.endsWith('/') ? url.slice(0, -1) : url;
    const cleanDest = destination.endsWith('/') ? destination : destination + '/';
    
    redirects.push({
      source: cleanSource,
      destination: cleanDest,
      permanent: true
    });
  }
});

// Dédupliquer
const uniqueRedirects = Array.from(
  new Map(redirects.map(r => [r.source, r])).values()
);

console.log(`✅ ${uniqueRedirects.length} redirections uniques générées\n`);

// Créer dist/_redirects
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.log('⚠️  dist/ n\'existe pas, lancer npm run build d\'abord');
  process.exit(1);
}

const redirectsContent = uniqueRedirects
  .map(r => `${r.source} ${r.destination} 301`)
  .join('\n');

fs.writeFileSync(path.join(distPath, '_redirects'), redirectsContent);
console.log(`✅ Créé dist/_redirects avec ${uniqueRedirects.length} redirections`);

// Créer dist/vercel.json (Vercel le lira)
const vercelConfig = {
  redirects: uniqueRedirects
};

fs.writeFileSync(
  path.join(distPath, 'vercel.json'),
  JSON.stringify(vercelConfig, null, 2)
);

console.log(`✅ Créé dist/vercel.json`);
console.log('\n🎯 Fichiers prêts pour déploiement Vercel');
console.log(`📊 Couverture: ${Math.round(uniqueRedirects.length/brokenUrls.length*100)}% des 404s`);

