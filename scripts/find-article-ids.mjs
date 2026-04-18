import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('C:/Users/robin/glp1/glp1/scripts/supabase_articles_temp.json', 'utf8'));

const slugsToFind = [
  'vinaigre-cidre-glp1',
  'effets-secondaires-rybelsus',
  'quand-wegovy-rembourse-france-2026-conditions-calendrier',
  'glp1-menopause-perte-poids-femme-ths',
  'nouveau-stylo-ozempic-3ml-2026-changement-utilisation',
  'operation-pour-maigrir-prix',
  'glp1-pancreatite-risque-ozempic-pancreas-symptomes',
  'glp1-osteoporose-risque-osseux',
  'temoignage-laurent-transformation-glp1',
  'temoignage-sophie-transformation-glp1',
  'temoignage-marie-transformation-glp1'
];

const found = {};
for (const a of articles) {
  const baseslug = a.slug.includes('/') ? a.slug.split('/').pop() : a.slug;
  if (slugsToFind.includes(baseslug) || slugsToFind.includes(a.slug)) {
    found[baseslug] = { id: null, slug: a.slug }; // we don't have IDs in this file
  }
}

console.log('Found slugs:', JSON.stringify(found, null, 2));
const notFound = slugsToFind.filter(s => !found[s]);
console.log('NOT FOUND:', notFound);
