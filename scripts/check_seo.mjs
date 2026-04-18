import { readFileSync } from 'fs';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { config } from 'dotenv';
config();

const files = globSync('src/content/**/*.md');
const slugsToCheck = [
  'glp1-sport-performance-sportif-composition-corporelle',
  'contrefacon-glp1-faux-ozempic-danger',
  'avant-apres-glp1-resultats-reels',
  'glp1-neuropathie-optique-vision-yeux-semaglutide-noian',
  'glp1-goutte-acide-urique-risque-etude-2026',
  'effets-secondaires-rybelsus',
  'guide-complet-rybelsus',
  'glp1-calories-journalieres',
  'glp1-interactions-medicamenteuses-ozempic-wegovy-mounjaro',
  'glp1-relachement-cutane-peau-corps-perte-poids-solutions',
  'glp1-chirurgie-anesthesie-precautions-arret-traitement',
  'glp1-grossesse-preconception-arret-traitement-fertilite',
  'glp1-idees-suicidaires-risque-semaglutide-etude',
  'remboursement-wegovy-mounjaro-securite-sociale-2026',
  'remboursement-mounjaro-obesite-has-ceps-calendrier-conditions-2026',
  'guide-complet-glp1-2025-france',
  'glp1-perte-de-poids',
  'recherche-clinique-glp1',
  'acheter-wegovy-en-france',
];

for (const file of files) {
  const normalized = file.split('\\').join('/');
  const parts = normalized.split('/');
  const basename = parts[parts.length - 1].replace('.md', '');
  if (!slugsToCheck.includes(basename)) continue;

  const content = readFileSync(file, 'utf8');
  const { data } = matter(content);
  const title = data.title || '';
  const desc = data.description || '';
  const kw = data.mainKeyword || '';

  const titleLen = title.length;
  const descLen = desc.length;
  const kwInTitle = kw ? title.toLowerCase().includes(kw.toLowerCase()) : null;
  const hasKw = !!kw;

  const needsFix = titleLen > 65 || descLen > 160 || !hasKw || kwInTitle === false;
  if (needsFix) {
    console.log('FIX:' + normalized);
    if (titleLen > 65) console.log('  TITLE_TOO_LONG:' + titleLen + ':' + title);
    if (descLen > 160) console.log('  DESC_TOO_LONG:' + descLen);
    if (!hasKw) console.log('  NO_KEYWORD');
    if (kwInTitle === false) console.log('  KW_NOT_IN_TITLE:' + kw + '|||' + title);
  } else {
    console.log('OK:' + basename);
  }
}
