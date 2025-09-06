export async function GET() {
  const baseUrl = 'https://glp1-france.fr';

  // Toutes les pages avec leurs métadonnées SEO
  const allPages = [
    // Page d'accueil
    { url: '', priority: '1.0', changefreq: 'daily' },
    
    // Pages statiques importantes
    { url: '/contact/', priority: '0.8', changefreq: 'monthly' },
    { url: '/partenaires/', priority: '0.6', changefreq: 'monthly' },
    { url: '/temoignages/', priority: '0.8', changefreq: 'weekly' },
    { url: '/guides/experts/', priority: '0.9', changefreq: 'weekly' },
    { url: '/guides/qu-est-ce-que-glp1/', priority: '0.9', changefreq: 'monthly' },
    { url: '/guides/quel-traitement-glp1-choisir/', priority: '1.0', changefreq: 'weekly' },
    { url: '/guides/guide-beaute-perte-de-poids-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/nouveaux-medicaments-perdre-poids/', priority: '0.9', changefreq: 'weekly' },
    { url: '/guides/guide-complet-wegovy/', priority: '0.9', changefreq: 'weekly' },
    { url: '/guides/suivi-medical-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/communautes-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/guides/alimentation-personnalisee-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/guides-age-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/legal/mentions-legales/', priority: '0.3', changefreq: 'yearly' },
    { url: '/legal/confidentialite/', priority: '0.3', changefreq: 'yearly' },
    { url: '/legal/cgu/', priority: '0.3', changefreq: 'yearly' },

    // Collections principales
    { url: '/collections/traitements-glp1/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/glp1-cout/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/effets-secondaires-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/medecins-glp1-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/recherche-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/glp1-perte-de-poids/', priority: '0.8', changefreq: 'weekly' },

    // Pages de traitements spécifiques (priorité élevée)
    { url: '/collections/traitements-glp1/guide-complet-ozempic/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/traitements-glp1/guide-complet-mounjaro/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/traitements-glp1/guide-complet-wegovy/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/traitements-glp1/guide-complet-saxenda/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/traitements-glp1/guide-complet-trulicity/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/traitements-glp1/guide-complet-victoza/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/traitements-glp1/guide-complet-rybelsus/', priority: '0.8', changefreq: 'monthly' },

    // Pages de prix importantes (fréquence élevée pour SEO)
    { url: '/collections/glp1-cout/prix-ozempic-france/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/glp1-cout/prix-mounjaro-france/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/glp1-cout/prix-wegovy-france/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/glp1-cout/prix-saxenda-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/prix-trulicity-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/prix-victoza-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/prix-rybelsus-france/', priority: '0.8', changefreq: 'monthly' },

    // Pages d'effets secondaires
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-ozempic/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-mounjaro/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-wegovy/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-saxenda/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-trulicity/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-victoza/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-rybelsus/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/ozempic-danger/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/wegovy-danger/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/wegovy-dosage/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/insulevel-effet-indesirable/', priority: '0.6', changefreq: 'monthly' },

    // Pages de médecins et cliniques
    { url: '/collections/medecins-glp1-france/clinique-pour-obesite/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/medecins-glp1-france/clinique-pour-obesite-new/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/medecins-glp1-france/diabetologue-paris/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/medecins-glp1-france/endocrinologue-pour-maigrir/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/medecins-glp1-france/endocrinologue-pour-maigrir-new/', priority: '0.8', changefreq: 'monthly' },

    // Pages de recherche
    { url: '/collections/recherche-glp1/recherche-medicament-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/recherche-glp1/etude-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/recherche-glp1/nouveau-medicament-amaigrissant/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/recherche-glp1/nouveau-medicament-obesite/', priority: '0.7', changefreq: 'monthly' },

    // Pages de régime
    { url: '/collections/regime-glp1/regime-pour-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-glp1-aliments-a-eviter/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-glp1-petit-dejeuner/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-glp1-repas/', priority: '0.7', changefreq: 'monthly' },

    // Pages d'alternatives
    { url: '/collections/alternatives-glp1/alternative-naturelle-ozempic/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/alternative-naturelle-wegovy/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/medicament-naturel-glp1/', priority: '0.7', changefreq: 'monthly' },

    // Pages de perte de poids
    { url: '/collections/glp1-perte-de-poids/pilule-miracle-perdre-poids/', priority: '0.8', changefreq: 'weekly' },
    { url: '/collections/glp1-perte-de-poids/injection-pour-perdre-du-poids/', priority: '0.8', changefreq: 'weekly' },
    { url: '/collections/glp1-perte-de-poids/nouveau-medicament-pour-perdre-du-poids/', priority: '0.8', changefreq: 'weekly' },
    { url: '/collections/glp1-perte-de-poids/ozempic-regime/', priority: '0.8', changefreq: 'weekly' },
    { url: '/collections/glp1-perte-de-poids/personne-obese/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/glp1-perte-de-poids/pilule-qui-fait-maigrir/', priority: '0.8', changefreq: 'weekly' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
