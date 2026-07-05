#!/usr/bin/env node

/**
 * Script pour corriger les redirections spécifiques des médicaments
 * Redirige les anciennes URLs /collections/medicaments-glp1/* vers les guides correspondants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire le vercel.json
const vercelPath = path.join(__dirname, '..', 'vercel.json');
const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));

// Mapping intelligent: slug → guide correspondant
const medicamentRedirects = {
  // Wegovy
  'wegovy-avis': '/traitements-glp1/guide-complet-wegovy/',
  'wegovy-prix': '/glp1-cout/prix-wegovy-france/',
  'wegovy-effets-secondaires': '/effets-secondaires-glp1/effets-secondaires-wegovy/',
  
  // Ozempic
  'ozempic-injection-prix': '/glp1-cout/prix-ozempic-france/',
  'ozempic-avis': '/traitements-glp1/guide-complet-ozempic/',
  'ozempic-prix': '/glp1-cout/prix-ozempic-france/',
  
  // Mounjaro
  'mounjaro-effet-secondaire': '/traitements-glp1/guide-complet-mounjaro/',
  'mounjaro-injection-pour-maigrir': '/traitements-glp1/guide-complet-mounjaro/',
  'mounjaro-prix': '/glp1-cout/prix-mounjaro-france/',
  'mounjaro-avis': '/traitements-glp1/guide-complet-mounjaro/',
  
  // Saxenda
  'saxenda-prix': '/glp1-cout/prix-saxenda-france/',
  'saxenda-avis': '/traitements-glp1/guide-complet-saxenda/',
  
  // Trulicity
  'trulicity-ou-ozempic': '/traitements-glp1/guide-complet-trulicity/',
  'trulicity-danger': '/traitements-glp1/guide-complet-trulicity/',
  'trulicity-prix': '/glp1-cout/prix-trulicity-france/',
  
  // Victoza
  'victoza-posologie': '/traitements-glp1/guide-complet-victoza/',
  'victoza-rupture': '/traitements-glp1/guide-complet-victoza/',
  'victoza-prix': '/glp1-cout/prix-victoza-france/',
  
  // Rybelsus
  'rybelsus-prix': '/glp1-cout/prix-rybelsus-france/',
  'rybelsus-avis': '/traitements-glp1/guide-complet-rybelsus/',
  
};

let fixed = 0;

// Parcourir les redirects et corriger
vercelConfig.redirects = vercelConfig.redirects.map(redirect => {
  // Si c'est une URL /collections/medicaments-glp1/*
  if (redirect.source.startsWith('/collections/medicaments-glp1/')) {
    const slug = redirect.source.split('/').pop();
    
    // Si on a un mapping spécifique
    if (medicamentRedirects[slug]) {
      fixed++;
      console.log(`✅ ${slug} → ${medicamentRedirects[slug]}`);
      return {
        ...redirect,
        destination: medicamentRedirects[slug]
      };
    }
  }
  
  return redirect;
});

// Écrire le fichier
fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));

console.log(`\n✅ ${fixed} redirections corrigées dans vercel.json`);
console.log('\n🎯 Prochaines étapes:');
console.log('  1. git add vercel.json');
console.log('  2. git commit -m "Fix: Redirect medicament URLs to specific guide pages"');
console.log('  3. git push origin production');
