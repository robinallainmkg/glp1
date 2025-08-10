import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://robinallainmkg.github.io',
  base: process.env.NODE_ENV === 'production' ? '/glp1' : '/',
  output: 'static',
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
