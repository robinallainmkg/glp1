#!/usr/bin/env node

/**
 * Script pour corriger les 404 et générer les redirections Vercel
 * Analyse le CSV des 404 et crée un fichier vercel.json avec redirects
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

// Patterns de corrections
const redirectRules = [];

brokenUrls.forEach(url => {
  let destination = url;
  let needsRedirect = false;

  // Règle 1: Supprimer /collections/ intermédiaire
  if (url.includes('/collections/')) {
    // /collections/medicaments-glp1/article/ → /medicaments-glp1/article/
    destination = url.replace('/collections/', '/');
    needsRedirect = true;
  }

  // Règle 2: URLs avec double catégorie
  if (url.match(/\/([\w-]+)\/([\w-]+)\/([\w-]+)\/$/)) {
    const parts = url.split('/').filter(Boolean);
    if (parts.length === 3) {
      // /glp1-perte-de-poids/ozempic-prix/ → /glp1-cout/prix-ozempic-france/
      const category = parts[0];
      const slug = parts[1];
      
      // Mapping spécifique
      if (slug === 'ozempic-prix') destination = '/glp1-cout/prix-ozempic-france/';
      else if (slug === 'wegovy-prix') destination = '/glp1-cout/prix-wegovy-france/';
      else if (slug === 'saxenda-prix') destination = '/glp1-cout/prix-saxenda-france/';
      else {
        // Essayer de garder juste le slug
        destination = `/${category}/${slug}/`;
      }
      needsRedirect = true;
    }
  }

  // Règle 3: Pages backup/test
  if (url.includes('backup') || url.includes('test-') || url.includes('index-')) {
    destination = '/';
    needsRedirect = true;
  }

  // Règle 4: Anciennes URLs annuaire
  if (url.includes('/annuaire/')) {
    destination = '/medecins-glp1-france/';
    needsRedirect = true;
  }

  // Règle 5: Pages guides déplacées
  if (url.includes('/guides/guide-complet-')) {
    const drug = url.match(/guide-complet-(\w+)/)?.[1];
    if (drug) {
      destination = `/traitements-glp1/guide-complet-${drug}/`;
      needsRedirect = true;
    }
  }

  // Règle 6: URLs sans trailing slash
  if (!url.endsWith('/') && !url.includes('.')) {
    destination = url + '/';
    needsRedirect = true;
  }

  if (needsRedirect && url !== destination) {
    redirectRules.push({
      source: url.endsWith('/') ? url.slice(0, -1) : url,
      destination: destination,
      permanent: true
    });
  }
});

// Dédupliquer
const uniqueRedirects = Array.from(
  new Map(redirectRules.map(r => [r.source, r])).values()
);

console.log(`✅ ${uniqueRedirects.length} redirections créées\n`);

// Grouper par type
const byType = {
  collections: uniqueRedirects.filter(r => r.source.includes('/collections/')),
  backup: uniqueRedirects.filter(r => r.source.includes('backup') || r.source.includes('test')),
  annuaire: uniqueRedirects.filter(r => r.source.includes('/annuaire/')),
  guides: uniqueRedirects.filter(r => r.source.includes('/guides/')),
  other: uniqueRedirects.filter(r => 
    !r.source.includes('/collections/') && 
    !r.source.includes('backup') && 
    !r.source.includes('/annuaire/') &&
    !r.source.includes('/guides/')
  )
};

console.log('📊 Répartition des redirections:');
console.log(`  - Collections incorrectes: ${byType.collections.length}`);
console.log(`  - Pages backup/test: ${byType.backup.length}`);
console.log(`  - Annuaire: ${byType.annuaire.length}`);
console.log(`  - Guides: ${byType.guides.length}`);
console.log(`  - Autres: ${byType.other.length}\n`);

// Lire vercel.json existant
const vercelPath = path.join(__dirname, '..', 'config', 'vercel.json');
let vercelConfig = { redirects: [] };

if (fs.existsSync(vercelPath)) {
  vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
  console.log(`📝 ${vercelConfig.redirects?.length || 0} redirections existantes trouvées`);
}

// Fusionner sans doublons
const existingSources = new Set(vercelConfig.redirects?.map(r => r.source) || []);
const newRedirects = uniqueRedirects.filter(r => !existingSources.has(r.source));

vercelConfig.redirects = [
  ...(vercelConfig.redirects || []),
  ...newRedirects.map(r => ({
    source: r.source,
    destination: r.destination,
    permanent: true
  }))
];

console.log(`➕ ${newRedirects.length} nouvelles redirections ajoutées\n`);

// Écrire vercel.json
fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2), 'utf-8');
console.log(`✅ Fichier mis à jour: ${vercelPath}`);

// Générer rapport détaillé
const reportPath = path.join(__dirname, '..', 'RAPPORT-404-FIXES.md');
const report = `# Rapport de Correction des 404

**Date:** ${new Date().toLocaleDateString('fr-FR')}
**URLs analysées:** ${brokenUrls.length}
**Redirections créées:** ${uniqueRedirects.length}

## Répartition par Type

### 1. Collections Incorrectes (${byType.collections.length})
URLs avec \`/collections/\` en trop:
${byType.collections.slice(0, 10).map(r => `- \`${r.source}\` → \`${r.destination}\``).join('\n')}
${byType.collections.length > 10 ? `... et ${byType.collections.length - 10} autres` : ''}

### 2. Pages Backup/Test (${byType.backup.length})
Pages qui n'auraient pas dû être indexées:
${byType.backup.map(r => `- \`${r.source}\` → \`${r.destination}\``).join('\n')}

### 3. Annuaire (${byType.annuaire.length})
Anciennes URLs annuaire:
${byType.annuaire.map(r => `- \`${r.source}\` → \`${r.destination}\``).join('\n')}

### 4. Guides (${byType.guides.length})
Guides déplacés:
${byType.guides.map(r => `- \`${r.source}\` → \`${r.destination}\``).join('\n')}

### 5. Autres (${byType.other.length})
${byType.other.slice(0, 20).map(r => `- \`${r.source}\` → \`${r.destination}\``).join('\n')}
${byType.other.length > 20 ? `... et ${byType.other.length - 20} autres` : ''}

## Actions Requises

### ✅ Automatique (fait)
- [x] Redirections ajoutées dans \`config/vercel.json\`
- [x] Rapport généré

### 🔧 Manuel (à faire)
- [ ] Déployer sur Vercel pour activer les redirections
- [ ] Soumettre nouveau sitemap à Google Search Console
- [ ] Demander ré-indexation des URLs corrigées
- [ ] Ajouter \`noindex\` aux pages de backup/test restantes
- [ ] Vérifier les liens internes cassés dans le contenu

## Redirections Non Gérées

URLs qui nécessitent une analyse manuelle:
${brokenUrls.filter(url => {
  const hasRedirect = uniqueRedirects.some(r => r.source === url.replace(/\/$/, ''));
  return !hasRedirect;
}).slice(0, 20).map(url => `- ${url}`).join('\n')}

## Commandes Suivantes

\`\`\`bash
# Tester les redirections localement
npm run build
npm run preview

# Déployer
git add config/vercel.json
git commit -m "Fix: Add 404 redirects for ${uniqueRedirects.length} broken URLs"
git push origin production

# Vérifier après déploiement
curl -I https://glp1-france.fr/collections/medicaments-glp1/wegovy-avis/
\`\`\`
`;

fs.writeFileSync(reportPath, report, 'utf-8');
console.log(`📄 Rapport généré: ${reportPath}\n`);

// Afficher quelques exemples
console.log('🔗 Exemples de redirections:');
uniqueRedirects.slice(0, 5).forEach(r => {
  console.log(`  ${r.source} → ${r.destination}`);
});

console.log('\n✨ Terminé! Voir RAPPORT-404-FIXES.md pour les détails.');
