export async function GET() {
  const baseUrl = 'https://glp1-france.fr';
  
  const staticPages = [
    '',
    '/nouveaux-medicaments-perdre-poids/',
    '/qu-est-ce-que-glp1/',
    '/glp1-cout/',
    '/medicaments-glp1/',
    '/glp1-perte-de-poids/',
    '/effets-secondaires-glp1/',
    '/glp1-diabete/',
    '/regime-glp1/',
    '/alternatives-glp1/',
    '/medecins-glp1-france/',
    '/recherche-glp1/',
    '/experts/',
    '/avant-apres-glp1/',
    '/guide-beaute-perte-de-poids-glp1/'
  ];

  const dynamicPages = [
    // Collection glp1-perte-de-poids
    '/glp1-perte-de-poids/ozempic-prix/',
    '/glp1-perte-de-poids/ozempic-effets-secondaires-forum/',
    '/glp1-perte-de-poids/avant-apres-glp1/',
    '/glp1-perte-de-poids/medicament-pour-maigrir-tres-puissant/',
    
    // Collection effets-secondaires-glp1
    '/effets-secondaires-glp1/ozempic-danger/',
    '/effets-secondaires-glp1/wegovy-danger/',
    '/effets-secondaires-glp1/wegovy-dosage/',
    
    // Collection glp1-cout
    '/glp1-cout/wegovy-prix/',
    '/glp1-cout/acheter-wegovy-en-france/',
    '/glp1-cout/saxenda-prix-pharmacie/',
    '/glp1-cout/wegovy-remboursement-mutuelle/',
    
    // Autres collections importantes
    '/medicaments-glp1/ozempic-posologie/',
    '/glp1-diabete/diabete-type-2-traitement/',
    '/alternatives-glp1/alternatives-naturelles-glp1/'
  ];

  const allPages = [...staticPages, ...dynamicPages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page === '' ? 'weekly' : page.includes('prix') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.includes('nouveaux-medicaments') || page.includes('qu-est-ce-que') ? '0.9' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
