import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://glp1-france.fr',
  base: '/',
  output: 'static',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Inclure explicitement les nouveaux guides avec haute priorité
      customPages: [
        'https://glp1-france.fr/guides/suivi-medical-glp1/',
        'https://glp1-france.fr/guides/communautes-glp1/',
        'https://glp1-france.fr/guides/alimentation-personnalisee-glp1/',
        'https://glp1-france.fr/guides/guides-age-glp1/'
      ]
    }),
    tailwind()
  ],
  redirects: {
    // Médicaments spécifiques → Guides
    '/collections/medicaments-glp1/wegovy-avis': '/traitements-glp1/guide-complet-wegovy/',
    '/collections/medicaments-glp1/saxenda-prix': '/glp1-cout/prix-saxenda-france/',
    '/collections/medicaments-glp1/ozempic-injection-prix': '/glp1-cout/prix-ozempic-france/',
    '/collections/medicaments-glp1/mounjaro-effet-secondaire': '/traitements-glp1/guide-complet-mounjaro/',
    '/collections/medicaments-glp1/mounjaro-injection-pour-maigrir': '/traitements-glp1/guide-complet-mounjaro/',
    '/collections/medicaments-glp1/victoza-posologie': '/traitements-glp1/guide-complet-victoza/',
    '/collections/medicaments-glp1/victoza-rupture': '/traitements-glp1/guide-complet-victoza/',
    '/collections/medicaments-glp1/trulicity-ou-ozempic': '/traitements-glp1/guide-complet-trulicity/',
    '/collections/medicaments-glp1/trulicity-danger': '/traitements-glp1/guide-complet-trulicity/',
    
    // Suppression /collections/ - Wildcards marchent en Astro
    '/collections/glp1-cout/[...slug]': '/glp1-cout/[...slug]',
    '/collections/glp1-perte-de-poids/[...slug]': '/glp1-perte-de-poids/[...slug]',
    '/collections/glp1-diabete/[...slug]': '/glp1-diabete/[...slug]',
    '/collections/alternatives-glp1/[...slug]': '/alternatives-glp1/[...slug]',
    '/collections/regime-glp1/[...slug]': '/regime-glp1/[...slug]',
    '/collections/effets-secondaires-glp1/[...slug]': '/effets-secondaires-glp1/[...slug]',
    '/collections/recherche-glp1/[...slug]': '/recherche-glp1/[...slug]',
    '/collections/avant-apres-glp1/[...slug]': '/avant-apres-glp1/[...slug]',
    '/collections/temoignages/[...slug]': '/temoignages/[...slug]',
    '/collections/medecins-glp1-france/[...slug]': '/medecins-glp1-france/[...slug]',
    '/collections/medicaments-glp1/[...slug]': '/traitements-glp1/[...slug]',
    '/collections/traitements-glp1/[...slug]': '/traitements-glp1/[...slug]',
    
    // Annuaire → medecins-glp1-france
    '/annuaire/[...slug]': '/medecins-glp1-france/[...slug]',
    
    // Guides déplacés
    '/guides/guide-complet-trulicity/': '/traitements-glp1/guide-complet-trulicity/',
    '/guides/guide-complet-januvia/': '/traitements-glp1/guide-complet-januvia/',
    '/guides/guide-complet-mounjaro/': '/traitements-glp1/guide-complet-mounjaro/',
    '/guides/guide-complet-ozempic/': '/traitements-glp1/guide-complet-ozempic/',
    '/guides/guide-complet-wegovy/': '/traitements-glp1/guide-complet-wegovy/',
    '/guides/guide-complet-saxenda/': '/traitements-glp1/guide-complet-saxenda/',
    
    // Pages backup → homepage
    '/index-backup-original/': '/',
    '/diagnostic-live-content-backup/': '/',
    '/quel-traitement-glp1-choisir-backup/': '/',
    '/quel-traitement-glp1-choisir-fixed/': '/',
    '/test-affiliation/': '/',
    '/admin-stats-new/': '/',
    
    // Anciennes pages
    '/medicaments-glp1/[...slug]': '/traitements-glp1/[...slug]',
    '/experts/': '/',
    '/produits-recommandes/': '/',
    '/guide-debutant/': '/',
    '/guide-glp1-perte-de-poids/': '/',
    '/guide-beaute-perte-de-poids-glp1/': '/',
    '/qu-est-ce-que-glp1/': '/',
    
    // Témoignages
    '/temoignage-marie-transformation-glp1/': '/temoignages/',
    '/temoignage-sophie-transformation-glp1/': '/temoignages/',
    '/temoignage-laurent-transformation-glp1/': '/temoignages/',
    '/pages-statiques/serena-williams-glp1/': '/temoignages/',
    
    // Légal
    '/legal/confidentialite/': '/politique-confidentialite/',
    '/legal/cgu/': '/mentions-legales/',
    
    // Mounjaro spécifiques
    '/medicaments-glp1/mounjaro-prix-france/': '/glp1-cout/prix-mounjaro-france/',
    '/mounjaro-prix/': '/glp1-cout/prix-mounjaro-france/',
    '/mounjaro/': '/traitements-glp1/guide-complet-mounjaro/',
    
    // Anciennes redirections (conservées pour compatibilité)
    '/nouveaux-medicaments-perdre-poids/': '/guides/qu-est-ce-que-glp1/',
   '/medicaments-glp1': '/collections/glp1-cout/',
    '/temoignages-glp1/': '/temoignages/'
  },
  server: {
    port: 4321,
    host: '127.0.0.1',  // Force IPv4
    open: true
  },
  build: {
    format: 'directory'
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro']
          }
        }
      }
    },
  // No custom optimizeDeps exclusions
  }
});
