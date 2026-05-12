#!/usr/bin/env node
// Genere dist/.htaccess depuis dist/_redirects (format Netlify)
// Hostinger = Apache, donc on a besoin de RewriteRule, pas de _redirects.
//
// Format _redirects (Netlify) :
//   /old/path /new/path 301
//
// Format .htaccess Apache :
//   RewriteRule ^old/path$ /new/path [R=301,L]

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const REDIRECTS_IN = join(DIST, '_redirects');
const HTACCESS_OUT = join(DIST, '.htaccess');

// Wildcard redirects pour les 80% des 404 (anciennes URLs sans /collections/)
const WILDCARD_REDIRECTS = [
  ['^glp1-cout/(.*)$', '/collections/glp1-cout/$1'],
  ['^glp1-perte-de-poids/(.*)$', '/collections/glp1-perte-de-poids/$1'],
  ['^glp1-diabete/(.*)$', '/collections/glp1-diabete/$1'],
  ['^effets-secondaires-glp1/(.*)$', '/collections/effets-secondaires-glp1/$1'],
  ['^regime-glp1/(.*)$', '/collections/regime-glp1/$1'],
  ['^alternatives-glp1/(.*)$', '/collections/alternatives-glp1/$1'],
  ['^medecins-glp1-france/(.*)$', '/collections/medecins-glp1-france/$1'],
  ['^recherche-glp1/(.*)$', '/collections/recherche-glp1/$1'],
  ['^avant-apres-glp1/(.*)$', '/collections/avant-apres-glp1/$1'],
  ['^traitements-glp1/(.*)$', '/collections/traitements-glp1/$1'],
  ['^collections/medicaments-glp1/(.*)$', '/collections/traitements-glp1/$1'],
  // Pages legacy temoignages-glp1 vers /collections/temoignages/
  ['^temoignages-glp1/?$', '/collections/temoignages/'],
];

function escapeRegex(s) {
  return s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

function parseNetlifyRedirects(content) {
  const lines = content.split('\n');
  const out = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    // Format: /old /new 301
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) continue;
    const from = parts[0];
    const to = parts[1];
    const code = parts[2] || '301';
    if (!from.startsWith('/') || !to.startsWith('/')) continue;
    // Skip Netlify-only patterns incompatible Apache (wildcards * et :splat)
    // Ces patterns inversent la direction (collections/* → racine/*) — pas ce qu'on veut.
    if (from.includes('*') || from.includes(':splat')) continue;
    if (to.includes(':splat') || to.includes('*')) continue;
    out.push({ from, to, code });
  }
  return out;
}

function buildHtaccess(redirects, wildcards) {
  const header = `# Auto-generated .htaccess for Hostinger (Apache)
# Source: dist/_redirects + scripts/generate-htaccess.mjs
# Do not edit by hand — regenerated at each build.

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Force HTTPS
  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # =========================================================
  # Wildcards : anciennes URLs sans /collections/ (preserve SEO)
  # =========================================================
`;

  const wildcardLines = wildcards.map(([pattern, dest]) => {
    return `  RewriteRule ${pattern} ${dest} [R=301,L,NE]`;
  }).join('\n');

  const exactHeader = `

  # =========================================================
  # Redirects exacts (depuis dist/_redirects, ${redirects.length} entrees)
  # =========================================================
`;

  const exactLines = redirects.map(({ from, to, code }) => {
    const escaped = escapeRegex(from.replace(/^\//, ''));
    return `  RewriteRule ^${escaped}$ ${to} [R=${code},L,NE]`;
  }).join('\n');

  const footer = `
</IfModule>

# =========================================================
# Cache static assets (images, CSS, JS, fonts)
# =========================================================
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Compression GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

# Sécurité : bloquer l'accès aux fichiers sensibles
<FilesMatch "^\\.(env|git|htaccess|htpasswd)|^(\\.git|node_modules|src)">
  Require all denied
</FilesMatch>
`;

  return header + wildcardLines + exactHeader + exactLines + footer;
}

function main() {
  if (!existsSync(REDIRECTS_IN)) {
    console.log('⚠️  dist/_redirects introuvable — skip .htaccess generation');
    return;
  }

  const content = readFileSync(REDIRECTS_IN, 'utf-8');
  const redirects = parseNetlifyRedirects(content);
  const htaccess = buildHtaccess(redirects, WILDCARD_REDIRECTS);

  writeFileSync(HTACCESS_OUT, htaccess, 'utf-8');
  console.log(`✅ .htaccess généré (${redirects.length} redirects exacts + ${WILDCARD_REDIRECTS.length} wildcards) → ${HTACCESS_OUT}`);
}

main();
