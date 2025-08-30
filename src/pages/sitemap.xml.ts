export async function GET() {
  const baseUrl = 'https://glp1-france.fr';

  const staticPages = [
    '',
    '/contact/',
    '/partenaires/',
    '/temoignages/',
    '/guides/experts/',
    '/guides/qu-est-ce-que-glp1/',
    '/guides/quel-traitement-glp1-choisir/',
    '/guides/guide-beaute-perte-de-poids-glp1/',
    '/guides/nouveaux-medicaments-perdre-poids/',
    '/guides/guide-complet-wegovy/',
    '/legal/mentions-legales/',
    '/legal/politique-confidentialite/',
    '/outils/produits-recommandes/'
  ];

  const collectionPages = [
    // Collections principales
    '/collections/traitements-glp1/',
    '/collections/glp1-cout/',
    '/collections/effets-secondaires-glp1/',
    '/collections/medecins-glp1-france/',
    '/collections/recherche-glp1/',
    '/collections/regime-glp1/',
    '/collections/alternatives-glp1/',
    '/collections/glp1-perte-de-poids/',

    // Pages de traitements spécifiques
    '/collections/traitements-glp1/guide-complet-ozempic/',
    '/collections/traitements-glp1/guide-complet-mounjaro/',
    '/collections/traitements-glp1/guide-complet-wegovy/',
    '/collections/traitements-glp1/guide-complet-saxenda/',
    '/collections/traitements-glp1/guide-complet-trulicity/',
    '/collections/traitements-glp1/guide-complet-victoza/',
    '/collections/traitements-glp1/guide-complet-rybelsus/',

    // Pages de prix importantes
    '/collections/glp1-cout/prix-ozempic-france/',
    '/collections/glp1-cout/prix-mounjaro-france/',
    '/collections/glp1-cout/prix-wegovy-france/',
    '/collections/glp1-cout/prix-saxenda-france/',
    '/collections/glp1-cout/prix-trulicity-france/',
    '/collections/glp1-cout/prix-victoza-france/',
    '/collections/glp1-cout/prix-rybelsus-france/',
    '/collections/glp1-cout/wegovy-remboursement-mutuelle/',
    '/collections/glp1-cout/acheter-wegovy-en-france/',
    '/collections/glp1-cout/saxenda-prix-pharmacie/',
    '/collections/glp1-cout/wegovy-prix/',
    '/collections/glp1-cout/anneau-gastrique-prix-cmu/',
    '/collections/glp1-cout/operation-pour-maigrir-prix/',

    // Pages d'effets secondaires
    '/collections/effets-secondaires-glp1/effets-secondaires-ozempic/',
    '/collections/effets-secondaires-glp1/effets-secondaires-mounjaro/',
    '/collections/effets-secondaires-glp1/effets-secondaires-wegovy/',
    '/collections/effets-secondaires-glp1/effets-secondaires-saxenda/',
    '/collections/effets-secondaires-glp1/effets-secondaires-trulicity/',
    '/collections/effets-secondaires-glp1/effets-secondaires-victoza/',
    '/collections/effets-secondaires-glp1/effets-secondaires-rybelsus/',
    '/collections/effets-secondaires-glp1/ozempic-danger/',
    '/collections/effets-secondaires-glp1/wegovy-danger/',
    '/collections/effets-secondaires-glp1/wegovy-dosage/',
    '/collections/effets-secondaires-glp1/insulevel-effet-indesirable/',

    // Pages de médecins et cliniques
    '/collections/medecins-glp1-france/clinique-pour-obesite/',
    '/collections/medecins-glp1-france/clinique-pour-obesite-new/',
    '/collections/medecins-glp1-france/diabetologue-paris/',
    '/collections/medecins-glp1-france/endocrinologue-pour-maigrir/',
    '/collections/medecins-glp1-france/endocrinologue-pour-maigrir-new/',

    // Pages de recherche
    '/collections/recherche-glp1/glp-inhibitors/',
    '/collections/recherche-glp1/recherche-clinique-glp1/',

    // Pages de régime et nutrition
    '/collections/regime-glp1/glp1-calories-journalieres/',
    '/collections/regime-glp1/glp1-index-glycemique/',
    '/collections/regime-glp1/glp1-micronutriments/',
    '/collections/regime-glp1/glp1-portion-alimentaire/',
    '/collections/regime-glp1/glp1-proteines/',
    '/collections/regime-glp1/isglt2-liste/',
    '/collections/regime-glp1/jeune-intermittent-glp1/',
    '/collections/regime-glp1/regime-cetogene-glp1/',
    '/collections/regime-glp1/regime-chrono-nutrition-glp1/',
    '/collections/regime-glp1/regime-dash-glp1/',
    '/collections/regime-glp1/regime-detox-glp1/',
    '/collections/regime-glp1/regime-mediterraneen-glp1/',
    '/collections/regime-glp1/regime-paleo-glp1/',
    '/collections/regime-glp1/regime-sans-sucre-glp1/',

    // Pages d'alternatives
    '/collections/alternatives-glp1/alternatives-bio-glp1/',
    '/collections/alternatives-glp1/alternatives-naturelles-ozempic/',
    '/collections/alternatives-glp1/berberine-glp1/',
    '/collections/alternatives-glp1/cannelle-glp1/',
    '/collections/alternatives-glp1/chrome-diabete/',
    '/collections/alternatives-glp1/homeopathie-diabete/',
    '/collections/alternatives-glp1/meditation-glp1/',
    '/collections/alternatives-glp1/peut-on-guerir-du-diabete/',
    '/collections/alternatives-glp1/plantes-diabete/',
    '/collections/alternatives-glp1/semaglutide-naturel/',
    '/collections/alternatives-glp1/supplements-glp1/',
    '/collections/alternatives-glp1/vinaigre-cidre-glp1/',
    '/collections/alternatives-glp1/yoga-diabete/',

    // Pages de perte de poids
    '/collections/glp1-perte-de-poids/avant-apres-glp1/',
    '/collections/glp1-perte-de-poids/chirurgie-bariatrique/',
    '/collections/glp1-perte-de-poids/combien-de-dose-dans-un-stylo-ozempic/',
    '/collections/glp1-perte-de-poids/diabete-amaigrissement-rapide/',
    '/collections/glp1-perte-de-poids/glp1-perte-de-poids/',
    '/collections/glp1-perte-de-poids/medicament-americain-pour-maigrir/',
    '/collections/glp1-perte-de-poids/medicament-pour-maigrir-tres-puissant/',
    '/collections/glp1-perte-de-poids/medicament-pour-maigrir-tres-puissant-en-pharmacie/',
    '/collections/glp1-perte-de-poids/medicament-pour-perdre-du-ventre-en-1-semaine/',
    '/collections/glp1-perte-de-poids/obesite-severe-prise-en-charge/',
    '/collections/glp1-perte-de-poids/ou-trouver-ozempic/',
    '/collections/glp1-perte-de-poids/ozempic-effets-secondaires-forum/',
    '/collections/glp1-perte-de-poids/ozempic-prix/',
    '/collections/glp1-perte-de-poids/ozempic-regime/',
    '/collections/glp1-perte-de-poids/personne-obese/',
    '/collections/glp1-perte-de-poids/pilule-qui-fait-maigrir/'
  ];

  const allPages = [...staticPages, ...collectionPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page === '' ? 'weekly' :
                  page.includes('prix') || page.includes('cout') ? 'weekly' :
                  page.includes('traitement') || page.includes('guide') ? 'monthly' :
                  'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' :
                page.includes('guide-complet') || page.includes('nouveaux-medicaments') ? '0.9' :
                page.includes('collections/') ? '0.8' :
                '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
