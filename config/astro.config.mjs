import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// Integration Astro : endpoint /__deploy pour le dashboard integration (dev only)
function integrationApi() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const PROJECT_ROOT = path.resolve(__dirname, '..');
  const AGENT_SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'integration-agent.mjs');

  // Charge .env si present (pour SUPABASE_SERVICE_ROLE_KEY)
  const dotenvPath = path.join(PROJECT_ROOT, '.env');
  const envFromFile = {};
  if (fs.existsSync(dotenvPath)) {
    fs.readFileSync(dotenvPath, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
      if (m) envFromFile[m[1]] = m[2];
    });
  }
  const agentEnv = { ...process.env, ...envFromFile };

  return {
    name: 'integration-api',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (!req.url.startsWith('/__deploy')) return next();

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
          if (req.method !== 'POST') { res.writeHead(405); res.end(JSON.stringify({ error: 'POST only' })); return; }

          let body = '';
          req.on('data', c => body += c);
          req.on('end', () => {
            try {
              const { ticket_id } = JSON.parse(body);
              if (!ticket_id) { res.writeHead(400); res.end(JSON.stringify({ error: 'ticket_id requis' })); return; }

              console.log(`\n🚀 [integration] Deploiement ticket ${ticket_id.substring(0, 8)}...`);
              const child = spawn('node', [AGENT_SCRIPT, '--local', '--ticket-id', ticket_id], {
                cwd: PROJECT_ROOT,
                env: agentEnv,
                stdio: ['ignore', 'pipe', 'pipe']
              });
              child.stdout.on('data', d => process.stdout.write(d));
              child.stderr.on('data', d => process.stderr.write(d));
              child.on('close', code => {
                console.log(code === 0
                  ? `✅ [integration] Ticket ${ticket_id.substring(0, 8)} deploye`
                  : `❌ [integration] Ticket ${ticket_id.substring(0, 8)} erreur (code ${code})`);
              });

              res.writeHead(202, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true, ticket_id }));
            } catch (err) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      }
    }
  };
}

export default defineConfig({
  site: 'https://glp1-france.fr',
  base: '/',
  output: 'static',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/admin/') && !page.includes('/test-admin/') && !page.includes('/test-supabase/') && !page.includes('/test-affiliation-multi/') && !page.includes('/admin-dashboard/') && !page.includes('/admin-stats/') && !page.includes('/demo-affiliate-sidebar/') && !page.includes('/temoignages-glp1') && !page.includes('/guide-beaute-perte-de-poids-glp1') && !page.includes('/produits-recommandes') && !page.includes('/temoignage-') && !page.includes('/diagnostic-') && !page.includes('/test-affiliation/') && !page.match(/glp1-france\.fr\/glp1-perte-de-poids\//) && !page.includes('/mentions-legales/') && !page.includes('/politique-confidentialite/') && !page.match(/glp1-france\.fr\/quel-traitement-glp1-choisir\/$/),
      customPages: [
        'https://glp1-france.fr/guides/suivi-medical-glp1/',
        'https://glp1-france.fr/guides/guides-age-glp1/'
      ]
    }),
    tailwind(),
    integrationApi()
  ],
  redirects: {
    '/collections/medicaments-glp1/wegovy-avis': '/collections/traitements-glp1/guide-complet-wegovy/',
    '/collections/medicaments-glp1/saxenda-prix': '/collections/glp1-cout/prix-saxenda-france/',
    '/collections/medicaments-glp1/ozempic-injection-prix': '/collections/glp1-cout/prix-ozempic-france/',
    '/collections/medicaments-glp1/mounjaro-effet-secondaire': '/collections/traitements-glp1/guide-complet-mounjaro/',
    '/collections/medicaments-glp1/mounjaro-injection-pour-maigrir': '/collections/traitements-glp1/guide-complet-mounjaro/',
    '/collections/medicaments-glp1/victoza-posologie': '/collections/traitements-glp1/guide-complet-victoza/',
    '/collections/medicaments-glp1/victoza-rupture': '/collections/traitements-glp1/guide-complet-victoza/',
    '/collections/medicaments-glp1/trulicity-ou-ozempic': '/collections/traitements-glp1/guide-complet-trulicity/',
    '/collections/medicaments-glp1/trulicity-danger': '/collections/traitements-glp1/guide-complet-trulicity/',
    '/guides/guide-complet-trulicity/': '/collections/traitements-glp1/guide-complet-trulicity/',
    '/guides/guide-complet-januvia/': '/collections/traitements-glp1/guide-complet-januvia/',
    '/guides/guide-complet-mounjaro/': '/collections/traitements-glp1/guide-complet-mounjaro/',
    '/guides/guide-complet-ozempic/': '/collections/traitements-glp1/guide-complet-ozempic/',
    '/guides/guide-complet-saxenda/': '/collections/traitements-glp1/guide-complet-saxenda/',
    '/index-backup-original/': '/',
    '/diagnostic-live-content-backup/': '/',
    '/quel-traitement-glp1-choisir-backup/': '/',
    '/quel-traitement-glp1-choisir-fixed/': '/',
    '/test-affiliation/': '/',
    '/admin-stats-new/': '/',
    '/experts/': '/',
    '/produits-recommandes/': '/',
    '/guide-debutant/': '/',
    '/guide-glp1-perte-de-poids/': '/',
    '/guide-beaute-perte-de-poids-glp1/': '/',
    '/qu-est-ce-que-glp1/': '/',
    '/temoignage-marie-transformation-glp1/': '/collections/temoignages/',
    '/temoignage-sophie-transformation-glp1/': '/collections/temoignages/',
    '/temoignage-laurent-transformation-glp1/': '/collections/temoignages/',
    '/pages-statiques/serena-williams-glp1/': '/collections/temoignages/',
    '/legal/confidentialite/': '/politique-confidentialite/',
    '/legal/cgu/': '/mentions-legales/',
    '/medicaments-glp1/mounjaro-prix-france/': '/collections/glp1-cout/prix-mounjaro-france/',
    '/mounjaro-prix/': '/collections/glp1-cout/prix-mounjaro-france/',
    '/mounjaro/': '/collections/traitements-glp1/guide-complet-mounjaro/',
    '/nouveaux-medicaments-perdre-poids/': '/guides/qu-est-ce-que-glp1/',
    '/medicaments-glp1': '/collections/glp1-cout/',
    '/temoignages-glp1/': '/collections/temoignages/'
  },
  server: {
    port: 4321,
    host: '127.0.0.1',
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
    server: {
      proxy: {
        '/__agent': {
          target: 'http://127.0.0.1:7854',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__agent/, ''),
        }
      }
    }
  }
});
