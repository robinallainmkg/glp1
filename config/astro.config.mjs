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
