export async function GET() {
  const baseUrl = 'https://glp1-france.fr';

  // Toutes les pages avec leurs metadonnees SEO
  // Synchronise avec le contenu reel du site (mars 2026)
  const allPages = [
    // Page d'accueil
    { url: '', priority: '1.0', changefreq: 'daily' },

    // Pages statiques importantes
    { url: '/contact/', priority: '0.8', changefreq: 'monthly' },
    { url: '/partenaires/', priority: '0.6', changefreq: 'monthly' },
    { url: '/temoignages/', priority: '0.8', changefreq: 'weekly' },
    { url: '/articles/', priority: '0.8', changefreq: 'weekly' },
    { url: '/outils/calculateur-cout/', priority: '0.8', changefreq: 'monthly' },

    // Guides
    { url: '/guides/qu-est-ce-que-glp1/', priority: '0.9', changefreq: 'monthly' },
    { url: '/guides/quel-traitement-glp1-choisir/', priority: '1.0', changefreq: 'weekly' },
    { url: '/guides/guide-beaute-perte-de-poids-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/nouveaux-medicaments-perdre-poids/', priority: '0.9', changefreq: 'weekly' },
    { url: '/guides/guide-complet-wegovy/', priority: '0.9', changefreq: 'weekly' },
    { url: '/guides/suivi-medical-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/communautes-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/guides/alimentation-personnalisee-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/guides-age-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/guides/faq-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/interactions-medicamenteuses-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/psychologie-motivation-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/guides/sport-activite-physique-glp1/', priority: '0.7', changefreq: 'monthly' },

    // Pages legales
    { url: '/legal/mentions-legales/', priority: '0.3', changefreq: 'yearly' },
    { url: '/legal/confidentialite/', priority: '0.3', changefreq: 'yearly' },
    { url: '/legal/cgu/', priority: '0.3', changefreq: 'yearly' },

    // --- Collections index ---
    { url: '/collections/traitements-glp1/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/glp1-cout/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/effets-secondaires-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/medecins-glp1-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/recherche-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/glp1-perte-de-poids/', priority: '0.8', changefreq: 'weekly' },
    { url: '/collections/temoignages/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/glp1-diabete/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/avant-apres-glp1/', priority: '0.7', changefreq: 'monthly' },

    // --- Traitements GLP-1 (10 articles) ---
    { url: '/collections/traitements-glp1/guide-complet-ozempic/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/traitements-glp1/guide-complet-mounjaro/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/traitements-glp1/guide-complet-wegovy/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/traitements-glp1/guide-complet-saxenda/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/traitements-glp1/guide-complet-trulicity/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/traitements-glp1/guide-complet-victoza/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/traitements-glp1/guide-complet-rybelsus/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/traitements-glp1/guide-complet-zepbound/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/traitements-glp1/centres-mounjaro-france/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/traitements-glp1/wegovy-dosage/', priority: '0.7', changefreq: 'monthly' },

    // --- Prix GLP-1 (15 articles) ---
    { url: '/collections/glp1-cout/prix-ozempic-france/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/glp1-cout/prix-mounjaro-france/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/glp1-cout/prix-wegovy-france/', priority: '0.9', changefreq: 'weekly' },
    { url: '/collections/glp1-cout/prix-saxenda-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/prix-trulicity-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/prix-victoza-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/prix-rybelsus-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/prix-zepbound-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/acheter-wegovy-en-france/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/remboursement-glp1-2026/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/wegovy-remboursement-mutuelle/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/wegovy-prix/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/saxenda-prix-pharmacie/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/operation-pour-maigrir-prix/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/glp1-cout/anneau-gastrique-prix-cmu/', priority: '0.7', changefreq: 'monthly' },

    // --- Effets secondaires (11 articles) ---
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-ozempic/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-mounjaro/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-wegovy/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-saxenda/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-trulicity/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-victoza/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-rybelsus/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/effets-secondaires-zepbound/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/ozempic-danger/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/wegovy-danger/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/effets-secondaires-glp1/insulevel-effet-indesirable/', priority: '0.6', changefreq: 'monthly' },

    // --- Medecins et cliniques (3 articles) ---
    { url: '/collections/medecins-glp1-france/clinique-pour-obesite/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/medecins-glp1-france/diabetologue-paris/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/medecins-glp1-france/endocrinologue-pour-maigrir/', priority: '0.8', changefreq: 'monthly' },

    // --- Recherche (1 article) ---
    { url: '/collections/recherche-glp1/recherche-clinique-glp1/', priority: '0.7', changefreq: 'monthly' },

    // --- Regime GLP-1 (15 articles) ---
    { url: '/collections/regime-glp1/regime-cetogene-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-mediterraneen-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-dash-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-paleo-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-sans-sucre-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-detox-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-chrono-nutrition-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/regime-mounjaro-optimal/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/jeune-intermittent-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/glp1-proteines/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/glp1-portion-alimentaire/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/glp1-micronutriments/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/glp1-calories-journalieres/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/glp1-index-glycemique/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/regime-glp1/isglt2-liste/', priority: '0.6', changefreq: 'monthly' },

    // --- Alternatives GLP-1 (14 articles) ---
    { url: '/collections/alternatives-glp1/alternatives-naturelles-ozempic/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/alternatives-bio-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/semaglutide-naturel/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/berberine-glp1/', priority: '0.7', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/cannelle-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/chrome-diabete/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/vinaigre-cidre-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/phytotherapie-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/plantes-diabete/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/homeopathie-diabete/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/supplements-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/acupuncture-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/meditation-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/alternatives-glp1/peut-on-guerir-du-diabete/', priority: '0.6', changefreq: 'monthly' },

    // --- Perte de poids GLP-1 (2 articles) ---
    { url: '/collections/glp1-perte-de-poids/glp1-perte-de-poids/', priority: '0.8', changefreq: 'monthly' },
    { url: '/collections/glp1-perte-de-poids/guide-complet-glp1-2025-france/', priority: '0.8', changefreq: 'monthly' },

    // --- Temoignages (4 articles) ---
    { url: '/collections/temoignages/marie-transformation-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/temoignages/laurent-transformation-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/temoignages/sophie-transformation-glp1/', priority: '0.6', changefreq: 'monthly' },
    { url: '/collections/temoignages/serena-williams-glp1/', priority: '0.6', changefreq: 'monthly' },
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
