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
    // Redirections pour les anciennes URLs qui génèrent des 404
    '/nouveaux-medicaments-perdre-poids/': '/guides/qu-est-ce-que-glp1/',
    '/regime-glp1/': '/collections/regime-glp1/',
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
