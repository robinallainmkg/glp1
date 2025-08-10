import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://glp1-france.fr',
  base: '/',
  output: 'static',
  integrations: [sitemap()],
  server: {
    port: 4321,
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
    }
  }
});
