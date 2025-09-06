import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const redirects = new Map([
    // Redirections des pages 404 courantes
    ['/pages-statiques/', '/'],
    ['/pages-statiques', '/'],
    ['/pages-statiques/serena-williams-glp1/', '/temoignages/'],
    ['/articles/undefined/', '/articles/'],
    ['/collections/undefined/', '/collections/'],
    
    // Anciennes URLs vers nouvelles structure
    ['/medicaments-glp1/', '/collections/traitements-glp1/'],
    ['/glp1-cout/', '/collections/glp1-cout/'],
    ['/effets-secondaires-glp1/', '/collections/effets-secondaires-glp1/'],
    ['/medecins-glp1-france/', '/collections/medecins-glp1-france/'],
    ['/regime-glp1/', '/collections/regime-glp1/'],
    ['/alternatives-glp1/', '/collections/alternatives-glp1/'],
    ['/glp1-perte-de-poids/', '/collections/glp1-perte-de-poids/'],
    
    // Pages spécifiques
    ['/ozempic-prix/', '/collections/glp1-cout/prix-ozempic-france/'],
    ['/wegovy-prix/', '/collections/glp1-cout/prix-wegovy-france/'],
    ['/saxenda-prix/', '/collections/glp1-cout/prix-saxenda-france/'],
    ['/mounjaro-prix/', '/collections/glp1-cout/prix-mounjaro-france/'],
    
    // Guides déplacés
    ['/qu-est-ce-que-glp1/', '/guides/qu-est-ce-que-glp1/'],
    ['/quel-traitement-glp1-choisir/', '/guides/quel-traitement-glp1-choisir/'],
    ['/guide-beaute-perte-de-poids-glp1/', '/guides/guide-beaute-perte-de-poids-glp1/'],
    
    // Pages légales
    ['/mentions-legales/', '/legal/mentions-legales/'],
    ['/politique-confidentialite/', '/legal/politique-confidentialite/'],
    
    // Outils
    ['/produits-recommandes/', '/outils/produits-recommandes/'],
  ]);

  return new Response(`
# Fichier de redirections pour Netlify
${Array.from(redirects.entries())
  .map(([from, to]) => `${from} ${to} 301`)
  .join('\n')}

# Redirection générale pour toutes les pages non trouvées
/* /404.html 404
  `, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
