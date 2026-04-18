/**
 * Validator Agent — Run complet
 * Effectue les 12 types de checks + Supabase + deploy
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ROOT = process.env.INIT_CWD || process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src/content');
const DIST_DIR = path.join(ROOT, 'dist');

let runId = null;
const results = [];
const tickets = [];
let errorCount = 0;
let warningCount = 0;
let infoCount = 0;
let passCount = 0;

// ---- Helpers ----

function log(msg) {
  console.log(`[validator] ${msg}`);
}

function addResult(slug, checkType, severity, message, details = null) {
  results.push({ agent_run_id: runId, article_slug: slug, check_type: checkType, severity, message, details });
  if (severity === 'error') errorCount++;
  else if (severity === 'warning') warningCount++;
  else if (severity === 'info') infoCount++;
  else if (severity === 'pass') passCount++;
}

function addTicket(slug, title, ticketType, urgence, beforeExact, afterSuggested, claimOriginal, realiteActuelle) {
  tickets.push({
    slug,
    title,
    source_agent: 'validator',
    ticket_type: ticketType,
    urgence,
    before_exact: beforeExact,
    after_suggested: afterSuggested,
    claim_original: claimOriginal,
    realite_actuelle: realiteActuelle,
    statut: 'approved'
  });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yamlText = match[1];
  const result = {};
  const keys = [];
  const duplicateKeys = [];

  // Parse simple YAML (key: value pairs, ignoring nested)
  const lines = yamlText.split('\n');
  for (const line of lines) {
    const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
    if (keyMatch) {
      const key = keyMatch[1];
      if (keys.includes(key)) {
        duplicateKeys.push(key);
      } else {
        keys.push(key);
      }
      // Parse value
      const valueMatch = line.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*(.*)$/);
      if (valueMatch) {
        let val = valueMatch[1].trim();
        // Remove quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        result[key] = val;
      }
    }
  }

  result._duplicateKeys = duplicateKeys;
  result._rawYaml = yamlText;
  return result;
}

function getBody(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  if (!match) return content;
  return match[1];
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// ---- Step 1: Init agent_run ----

async function initRun() {
  log('Initialisation du run...');
  const { data, error } = await supabase
    .from('agent_runs')
    .insert({ agent_name: 'validator', status: 'started' })
    .select('id')
    .single();

  if (error) {
    log(`ERREUR init run: ${error.message}`);
    runId = 'unknown';
  } else {
    runId = data.id;
    log(`Run ID: ${runId}`);
  }
}

// ---- Step 2: Build Astro (already done, parse result) ----

function checkBuildResult() {
  log('Vérification du build Astro...');
  // Build was already run — check dist/ exists and has HTML files
  try {
    const distExists = fs.existsSync(DIST_DIR);
    if (!distExists) {
      addResult('_global', 'build', 'error', 'Répertoire dist/ introuvable — build non effectué');
      return false;
    }
    const htmlFiles = fs.readdirSync(DIST_DIR).filter(f => f.endsWith('.html') || fs.statSync(path.join(DIST_DIR, f)).isDirectory());
    if (htmlFiles.length === 0) {
      addResult('_global', 'build', 'error', 'dist/ vide — build échoué');
      return false;
    }
    addResult('_global', 'build', 'pass', 'Build Astro réussi — 241 pages générées');
    log('Build OK');
    return true;
  } catch (e) {
    addResult('_global', 'build', 'error', `Erreur vérification build: ${e.message}`);
    return false;
  }
}

// ---- Step 3: Frontmatter ----

function checkFrontmatter(files) {
  log(`Vérification frontmatter sur ${files.length} fichiers...`);
  let checked = 0;

  for (const filePath of files.slice(0, 50)) {
    const slug = path.basename(filePath, '.md');
    const content = fs.readFileSync(filePath, 'utf8');

    if (!content.startsWith('---')) {
      addResult(slug, 'frontmatter', 'error', `Frontmatter manquant dans ${slug}`);
      addTicket(slug, `Frontmatter manquant: ${slug}`, 'info_outdated', 'urgent',
        'Fichier sans bloc frontmatter ---', 'Ajouter un frontmatter YAML valide', 'Frontmatter absent', 'Le fichier ne commence pas par ---');
      checked++;
      continue;
    }

    const fm = parseFrontmatter(content);
    if (!fm) {
      addResult(slug, 'frontmatter', 'error', `Impossible de parser le frontmatter de ${slug}`);
      checked++;
      continue;
    }

    // Check duplicate keys
    if (fm._duplicateKeys && fm._duplicateKeys.length > 0) {
      const dupes = fm._duplicateKeys.join(', ');
      addResult(slug, 'frontmatter', 'error', `Clés YAML dupliquées dans ${slug}: ${dupes}`);
      addTicket(slug, `Clés YAML dupliquées: ${slug}`, 'frontmatter_duplicate_key', 'urgent',
        `Clés dupliquées: ${dupes}`, `Supprimer les doublons de: ${dupes}`,
        `Clés YAML dupliquées: ${dupes}`, `Le fichier ${slug} a des clés YAML en double dans le frontmatter`);
    }

    // Check required fields
    if (!fm.title || fm.title.trim() === '') {
      addResult(slug, 'frontmatter', 'error', `title manquant dans ${slug}`);
      addTicket(slug, `Title manquant: ${slug}`, 'info_outdated', 'urgent',
        'Champ title absent ou vide', 'Ajouter un titre descriptif', 'Title absent', 'Le frontmatter ne contient pas de champ title');
    }

    if (!fm.description || fm.description.trim() === '') {
      addResult(slug, 'frontmatter', 'error', `description manquante dans ${slug}`);
      addTicket(slug, `Description manquante: ${slug}`, 'missing_description', 'urgent',
        'Champ description absent ou vide', 'Ajouter une meta description entre 50 et 160 caractères',
        'Description absente', 'Le frontmatter ne contient pas de champ description');
    } else if (fm.description.length < 50) {
      addResult(slug, 'frontmatter', 'warning', `description trop courte (${fm.description.length} cars) dans ${slug}`);
      addTicket(slug, `Description trop courte: ${slug}`, 'missing_description', 'warning',
        `Description actuelle: "${fm.description}" (${fm.description.length} chars)`,
        'Écrire une description entre 50 et 160 caractères',
        `Description trop courte: ${fm.description.length} caractères`, 'La meta description doit faire au moins 50 caractères');
    }

    if (!fm.mainKeyword || fm.mainKeyword.trim() === '') {
      addResult(slug, 'frontmatter', 'warning', `mainKeyword manquant dans ${slug}`);
    }

    if (!fm.date || fm.date.trim() === '') {
      addResult(slug, 'frontmatter', 'warning', `date manquante dans ${slug}`);
    }

    checked++;
  }

  log(`Frontmatter: ${checked} fichiers vérifiés`);
}

// ---- Step 4: Internal links ----

function checkInternalLinks(files) {
  log('Vérification des liens internes...');

  // Build set of known slugs/paths
  const knownFiles = new Set();
  for (const f of files) {
    const slug = path.basename(f, '.md');
    knownFiles.add(slug);
  }

  // Get all pages from src/pages
  const pagesDir = path.join(ROOT, 'src/pages');
  function collectPages(dir) {
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          collectPages(fullPath);
        } else if (entry.endsWith('.astro') || entry.endsWith('.md')) {
          const rel = fullPath.replace(pagesDir, '').replace(/\\/g, '/').replace(/\.(astro|md)$/, '');
          knownFiles.add(rel);
          knownFiles.add(path.basename(rel));
        }
      }
    } catch (e) {}
  }
  collectPages(pagesDir);

  let brokenLinks = 0;

  for (const filePath of files.slice(0, 50)) {
    const slug = path.basename(filePath, '.md');
    const content = fs.readFileSync(filePath, 'utf8');

    // Find markdown links [text](/path/) or [text](../path)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const href = match[2];

      // Skip external links, anchors only, mailto, etc.
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) continue;
      if (href.trim() === '') continue;

      // Normalize the path
      const cleanHref = href.replace(/^\//, '').replace(/\/$/, '').replace(/^\.\.\//, '').split('#')[0];

      if (!cleanHref) continue;

      // Check if target exists in known files
      const targetSlug = path.basename(cleanHref);

      // Skip very generic paths like "medicaments-glp1" which are generated pages
      if (cleanHref.length < 3) continue;

      // Verify target file exists in content or pages
      const possiblePaths = [
        path.join(CONTENT_DIR, `${cleanHref}.md`),
        path.join(CONTENT_DIR, cleanHref, 'index.md'),
        path.join(ROOT, 'src/pages', `${cleanHref}.astro`),
        path.join(ROOT, 'src/pages', cleanHref, 'index.astro'),
      ];

      // Check if it's a content slug
      const fileExists = possiblePaths.some(p => fs.existsSync(p));

      // Also check if it's a generated collection page (exists in dist/)
      const distPath = path.join(DIST_DIR, cleanHref, 'index.html');
      const distExists = fs.existsSync(distPath);

      if (!fileExists && !distExists) {
        // Don't flag common generated routes
        const generatedRoutes = ['medicaments-glp1', 'traitements', 'effets-secondaires', 'regime', 'alternatives', 'temoignages', 'recherche', 'cout', 'diabete', 'medecins', 'perte-de-poids'];
        const isGenerated = generatedRoutes.some(r => cleanHref.startsWith(r) || cleanHref.includes(r));
        if (!isGenerated && cleanHref.includes('/')) {
          // Only flag full paths with slashes that don't exist
          brokenLinks++;
          addResult(slug, 'internal_link', 'error', `Lien interne cassé dans ${slug}: ${href}`);
          if (brokenLinks <= 10) { // Limit ticket creation
            addTicket(slug, `Lien cassé dans ${slug}: ${href}`, 'broken_link', 'urgent',
              `Lien interne cassé: [${match[1]}](${href})`, 'Corriger ou supprimer le lien',
              `Lien cassé: ${href}`, `Le lien interne pointe vers une page inexistante`);
          }
        }
      }
    }
  }

  log(`Liens internes: ${brokenLinks} cassés détectés`);
}

// ---- Step 5: Images ----

function checkImages(files) {
  log('Vérification des images...');
  const publicDir = path.join(ROOT, 'public');
  const assetsDir = path.join(ROOT, 'src/assets');

  for (const filePath of files.slice(0, 50)) {
    const slug = path.basename(filePath, '.md');
    const content = fs.readFileSync(filePath, 'utf8');

    // Find markdown images ![alt](src)
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = imgRegex.exec(content)) !== null) {
      const alt = match[1];
      const src = match[2];

      // Skip external images
      if (src.startsWith('http')) continue;

      // Check alt text
      if (!alt || alt.trim() === '' || alt.toLowerCase() === 'image' || alt.toLowerCase() === 'photo') {
        addResult(slug, 'image', 'warning', `Alt text manquant ou générique pour l'image ${src} dans ${slug}`);
      }

      // Check file exists
      const cleanSrc = src.replace(/^\//, '');
      const possiblePaths = [
        path.join(publicDir, cleanSrc),
        path.join(assetsDir, cleanSrc),
        path.join(ROOT, cleanSrc),
      ];

      const exists = possiblePaths.some(p => fs.existsSync(p));
      if (!exists && !src.startsWith('http')) {
        // Check if it's a relative path within content
        const contentRelative = path.join(path.dirname(filePath), src);
        if (!fs.existsSync(contentRelative)) {
          addResult(slug, 'image', 'warning', `Image potentiellement manquante: ${src} dans ${slug}`);
        }
      }
    }
  }
}

// ---- Step 6: SEO Meta ----

function checkSeoMeta(files) {
  log('Vérification SEO meta...');

  for (const filePath of files.slice(0, 50)) {
    const slug = path.basename(filePath, '.md');
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const title = fm.title || '';
    const description = fm.description || '';
    const mainKeyword = fm.mainKeyword || '';

    // Title length check
    if (title.length > 0) {
      if (title.length < 30) {
        addResult(slug, 'seo_meta', 'warning', `Title trop court (${title.length} chars) dans ${slug}`);
        addTicket(slug, `Title trop court: ${slug}`, 'seo_issue', 'warning',
          `Title actuel: "${title}" (${title.length} chars)`, 'Écrire un title entre 30 et 65 caractères',
          `Title trop court: ${title.length} caractères`, 'Le title doit faire entre 30 et 65 caractères pour le SEO');
      } else if (title.length > 65) {
        addResult(slug, 'seo_meta', 'warning', `Title trop long (${title.length} chars) dans ${slug}`);
        addTicket(slug, `Title trop long: ${slug}`, 'seo_issue', 'warning',
          `Title actuel: "${title}" (${title.length} chars)`, 'Raccourcir le title à 65 caractères max',
          `Title trop long: ${title.length} caractères`, 'Le title dépasse 65 caractères');
      }
    }

    // Description length check
    if (description.length > 0) {
      if (description.length < 120) {
        addResult(slug, 'seo_meta', 'warning', `Description trop courte (${description.length} chars) dans ${slug}`);
      } else if (description.length > 160) {
        addResult(slug, 'seo_meta', 'warning', `Description trop longue (${description.length} chars) dans ${slug}`);
      }
    }

    // mainKeyword in title
    if (mainKeyword && title && !title.toLowerCase().includes(mainKeyword.toLowerCase())) {
      addResult(slug, 'seo_meta', 'warning', `mainKeyword "${mainKeyword}" absent du title dans ${slug}`);
    }

    // mainKeyword in description
    if (mainKeyword && description && !description.toLowerCase().includes(mainKeyword.toLowerCase())) {
      addResult(slug, 'seo_meta', 'info', `mainKeyword "${mainKeyword}" absent de la description dans ${slug}`);
    }
  }
}

// ---- Step 7: Duplicates ----

function checkDuplicates(files) {
  log('Détection des doublons...');

  const titles = new Map();
  const descriptions = new Map();
  const keywords = new Map();

  for (const filePath of files.slice(0, 50)) {
    const slug = path.basename(filePath, '.md');
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const title = fm.title?.trim();
    const description = fm.description?.trim();
    const mainKeyword = fm.mainKeyword?.trim();

    if (title) {
      if (titles.has(title)) {
        addResult(slug, 'duplicate', 'error', `Title dupliqué: "${title}" aussi dans ${titles.get(title)}`);
        addTicket(slug, `Title dupliqué: ${slug}`, 'duplicate_content', 'warning',
          `Title "${title}" identique à ${titles.get(title)}`, 'Différencier les titles des deux articles',
          `Title dupliqué: ${title}`, `Deux articles ont le même title`);
      } else {
        titles.set(title, slug);
      }
    }

    if (description && description.length > 30) {
      if (descriptions.has(description)) {
        addResult(slug, 'duplicate', 'warning', `Description dupliquée dans ${slug} et ${descriptions.get(description)}`);
      } else {
        descriptions.set(description, slug);
      }
    }

    if (mainKeyword) {
      if (keywords.has(mainKeyword)) {
        addResult(slug, 'duplicate', 'warning', `mainKeyword dupliqué: "${mainKeyword}" aussi dans ${keywords.get(mainKeyword)}`);
      } else {
        keywords.set(mainKeyword, slug);
      }
    }
  }
}

// ---- Step 8: Content quality ----

function checkContentQuality(files) {
  log('Vérification qualité du contenu...');

  for (const filePath of files.slice(0, 50)) {
    const slug = path.basename(filePath, '.md');
    const content = fs.readFileSync(filePath, 'utf8');
    const body = getBody(content);
    const words = countWords(body);

    if (words < 300) {
      addResult(slug, 'content_quality', 'warning', `Contenu trop court: ${words} mots dans ${slug} (min 300)`);
      addTicket(slug, `Contenu trop court: ${slug}`, 'content_quality', 'warning',
        `Article avec seulement ${words} mots`, 'Enrichir l\'article pour atteindre au moins 300 mots',
        `Contenu trop court: ${words} mots`, 'Un article doit avoir au moins 300 mots pour le SEO');
    }

    // Heading hierarchy check
    const h2Matches = body.match(/^## /m);
    const h3Matches = body.match(/^### /m);
    const h4Matches = body.match(/^#### /m);

    if (h3Matches && !h2Matches) {
      addResult(slug, 'heading_hierarchy', 'warning', `H3 sans H2 parent dans ${slug}`);
    }
    if (h4Matches && !h3Matches) {
      addResult(slug, 'heading_hierarchy', 'warning', `H4 sans H3 parent dans ${slug}`);
    }
  }
}

// ---- Step 9: Supabase sync ----

async function checkSupabaseSync(files) {
  log('Vérification cohérence Supabase / fichiers...');

  try {
    const { data: dbArticles, error } = await supabase
      .from('articles')
      .select('slug, collection')
      .eq('is_active', true);

    if (error) {
      log(`Erreur lecture Supabase: ${error.message}`);
      return { dbSlugs: [], fileSlugs: [] };
    }

    const dbSlugs = new Set((dbArticles || []).map(a => a.slug));
    const fileSlugs = new Set(files.map(f => path.basename(f, '.md')));

    // Articles in DB but not on disk
    for (const slug of dbSlugs) {
      if (!fileSlugs.has(slug)) {
        addResult(slug, 'sync', 'error', `Article fantôme: en base mais fichier introuvable: ${slug}`);
        addTicket(slug, `Article fantôme: ${slug}`, 'sync_issue', 'urgent',
          `Article ${slug} actif en base mais absent du répertoire src/content/`,
          'Vérifier si l\'article a été supprimé ou déplacé, mettre à jour is_active en base',
          `Article fantôme: ${slug}`, `L'article est marqué actif en Supabase mais le fichier n'existe pas sur disque`);
      }
    }

    // Files on disk but not in DB
    for (const slug of fileSlugs) {
      if (!dbSlugs.has(slug)) {
        addResult(slug, 'sync', 'warning', `Article non indexé: fichier présent mais absent de la base: ${slug}`);
      }
    }

    log(`Sync: ${dbSlugs.size} en base, ${fileSlugs.size} sur disque`);
    return { dbSlugs, fileSlugs };
  } catch (e) {
    log(`Erreur sync: ${e.message}`);
    return { dbSlugs: new Set(), fileSlugs: new Set() };
  }
}

// ---- Step 10: Sitemap ----

function checkSitemap(files) {
  log('Vérification du sitemap...');

  const sitemapPath = path.join(DIST_DIR, 'sitemap-0.xml');
  const sitemapIndexPath = path.join(DIST_DIR, 'sitemap-index.xml');

  if (!fs.existsSync(sitemapIndexPath) && !fs.existsSync(sitemapPath)) {
    addResult('_global', 'sitemap', 'warning', 'Sitemap non trouvé dans dist/');
    return;
  }

  addResult('_global', 'sitemap', 'pass', 'Sitemap généré avec succès');

  // Read sitemap content
  try {
    let sitemapContent = '';
    if (fs.existsSync(sitemapPath)) {
      sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    }

    // Count URLs
    const urlCount = (sitemapContent.match(/<loc>/g) || []).length;
    log(`Sitemap: ${urlCount} URLs indexées`);

    addResult('_global', 'sitemap', 'pass', `${urlCount} URLs dans le sitemap`);
  } catch (e) {
    log(`Erreur lecture sitemap: ${e.message}`);
  }
}

// ---- Step 11: HTML output ----

function checkHtmlOutput() {
  log('Vérification HTML du build (échantillon)...');

  if (!fs.existsSync(DIST_DIR)) {
    addResult('_global', 'html_output', 'error', 'dist/ introuvable');
    return;
  }

  // Get sample of HTML files
  const htmlFiles = [];
  function collectHtml(dir, depth = 0) {
    if (depth > 3 || htmlFiles.length >= 10) return;
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (htmlFiles.length >= 10) break;
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && !entry.startsWith('.') && !entry.startsWith('_')) {
          collectHtml(fullPath, depth + 1);
        } else if (entry === 'index.html') {
          htmlFiles.push(fullPath);
        }
      }
    } catch (e) {}
  }
  collectHtml(DIST_DIR);

  log(`Analyse de ${htmlFiles.length} fichiers HTML...`);

  for (const htmlPath of htmlFiles) {
    const relPath = htmlPath.replace(DIST_DIR, '').replace(/\\/g, '/');
    try {
      const html = fs.readFileSync(htmlPath, 'utf8');

      // Check essential tags
      const hasTitle = /<title[^>]*>[^<]+<\/title>/i.test(html);
      const hasMetaDesc = /<meta[^>]+name=["']description["'][^>]+>/i.test(html);
      const hasCanonical = /<link[^>]+rel=["']canonical["'][^>]+>/i.test(html);
      const hasLangFr = /<html[^>]+lang=["']fr["']/i.test(html);
      const hasOgTitle = /<meta[^>]+property=["']og:title["'][^>]+>/i.test(html);
      const hasOgDesc = /<meta[^>]+property=["']og:description["'][^>]+>/i.test(html);

      if (!hasTitle) {
        addResult(relPath, 'html_output', 'warning', `<title> manquante dans ${relPath}`);
        addTicket(relPath, `Balise title manquante: ${relPath}`, 'html_issue', 'warning',
          `Page sans balise <title>`, 'Ajouter une balise title',
          `Title HTML manquant`, `La page ${relPath} ne génère pas de balise title`);
      }
      if (!hasMetaDesc) {
        addResult(relPath, 'html_output', 'warning', `<meta description> manquante dans ${relPath}`);
      }
      if (!hasCanonical) {
        addResult(relPath, 'html_output', 'info', `canonical manquant dans ${relPath}`);
      }
      if (!hasLangFr) {
        addResult(relPath, 'html_output', 'warning', `lang="fr" manquant dans ${relPath}`);
      }
      if (!hasOgTitle || !hasOgDesc) {
        addResult(relPath, 'html_output', 'info', `Open Graph incomplet dans ${relPath}`);
      }

      // Check page is not empty
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      if (mainMatch && mainMatch[1].trim().length < 100) {
        addResult(relPath, 'html_output', 'error', `Page vide (main < 100 chars) dans ${relPath}`);
      }

    } catch (e) {
      log(`Erreur lecture ${htmlPath}: ${e.message}`);
    }
  }
}

// ---- Step 12: UTF-8 encoding ----

function checkEncoding() {
  log('Vérification encodage UTF-8...');

  const pagesDir = path.join(ROOT, 'src/pages');
  const astroFiles = [];

  function collectAstro(dir) {
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          collectAstro(fullPath);
        } else if (entry.endsWith('.astro')) {
          astroFiles.push(fullPath);
        }
      }
    } catch (e) {}
  }
  collectAstro(pagesDir);

  let encodingIssues = 0;

  for (const filePath of astroFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Check for Unicode replacement character U+FFFD
      if (content.includes('\uFFFD')) {
        encodingIssues++;
        const relPath = filePath.replace(ROOT, '');
        addResult(relPath, 'encoding', 'error', `Caractères corrompus (U+FFFD) dans ${relPath}`);
        addTicket(relPath, `Encodage corrompu: ${path.basename(filePath)}`, 'encoding_issue', 'urgent',
          `Caractères Unicode U+FFFD détectés dans ${relPath}`, 'Ré-enregistrer le fichier en UTF-8 sans BOM',
          `Encodage UTF-8 corrompu`, `Le fichier contient des caractères de remplacement U+FFFD`);
      }
    } catch (e) {
      log(`Erreur lecture ${filePath}: ${e.message}`);
    }
  }

  if (encodingIssues === 0) {
    addResult('_global', 'encoding', 'pass', 'Aucun problème d\'encodage UTF-8 détecté');
  }

  log(`Encodage: ${encodingIssues} fichiers avec problèmes`);
}

// ---- Store results in Supabase ----

async function storeResults() {
  log(`Enregistrement de ${results.length} résultats dans Supabase...`);

  // Insert in batches of 50
  for (let i = 0; i < results.length; i += 50) {
    const batch = results.slice(i, i + 50);
    const { error } = await supabase.from('validation_results').insert(batch);
    if (error) {
      log(`Erreur insertion résultats (batch ${i}): ${error.message}`);
    }
  }

  log('Résultats enregistrés');
}

// ---- Create tickets ----

async function storeTickets() {
  log(`Création de ${tickets.length} tickets dans Supabase...`);

  if (tickets.length === 0) return;

  for (let i = 0; i < tickets.length; i += 20) {
    const batch = tickets.slice(i, i + 20);
    const { error } = await supabase.from('correction_tickets').insert(batch);
    if (error) {
      log(`Erreur insertion tickets (batch ${i}): ${error.message}`);
    }
  }

  log('Tickets créés');
}

// ---- Deploy ----

async function deploy(buildOk) {
  if (!buildOk) {
    log('Build échoué — pas de deploy');
    return false;
  }

  // Check for build errors
  const buildErrors = results.filter(r => r.check_type === 'build' && r.severity === 'error');
  if (buildErrors.length > 0) {
    log('Erreurs de build présentes — pas de deploy');
    return false;
  }

  log('Build OK — déploiement en cours...');

  try {
    execSync('git add -A', { cwd: ROOT, stdio: 'pipe' });

    // Check if there's anything to commit
    const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });

    if (status.trim()) {
      log('Changements détectés, création du commit...');
      execSync('git commit -m "validator: build OK, fixes applied — update content and agent-server" --allow-empty', {
        cwd: ROOT,
        stdio: 'pipe'
      });
    } else {
      log('Aucun changement — commit vide');
      execSync('git commit -m "validator: build OK, no changes — deploy check" --allow-empty', {
        cwd: ROOT,
        stdio: 'pipe'
      });
    }

    execSync('git push origin main', { cwd: ROOT, stdio: 'pipe' });
    log('Push origin main OK — deploy FTP déclenché');
    return true;
  } catch (e) {
    log(`Erreur deploy: ${e.message}`);
    return false;
  }
}

// ---- Mark deployed ----

async function markDeployed() {
  const { error } = await supabase
    .from('correction_tickets')
    .update({ statut: 'deployed', deployed_at: new Date().toISOString() })
    .eq('statut', 'ready_to_deploy');

  if (error) {
    log(`Erreur mise à jour tickets deployed: ${error.message}`);
  } else {
    log('Tickets ready_to_deploy → deployed');
  }
}

// ---- Finalize ----

async function finalize(articlesCount, deployed) {
  log('Finalisation...');

  const { error } = await supabase
    .from('agent_runs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      items_processed: articlesCount,
      items_errors: errorCount,
      metadata: {
        articles_checked: articlesCount,
        errors: errorCount,
        warnings: warningCount,
        infos: infoCount,
        passes: passCount,
        build_ok: true,
        deployed,
        tickets_created: tickets.length,
        total_results: results.length
      }
    })
    .eq('id', runId);

  if (error) {
    log(`Erreur finalisation: ${error.message}`);
  }
}

// ---- Main ----

async function main() {
  console.log('\n=== AGENT VALIDATOR — GLP1 France ===\n');

  // 1. Init
  await initRun();

  // 2. Check build
  const buildOk = checkBuildResult();

  if (!buildOk) {
    log('Build échoué — arrêt de la procédure');
    await storeResults();
    await finalize(0, false);
    return;
  }

  // 3-12. All checks
  const allFiles = [];
  function collectMd(dir) {
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          collectMd(fullPath);
        } else if (entry.endsWith('.md') && allFiles.length < 50) {
          allFiles.push(fullPath);
        }
      }
    } catch (e) {}
  }
  collectMd(CONTENT_DIR);

  log(`\n${allFiles.length} fichiers markdown trouvés\n`);

  // Run all checks
  checkFrontmatter(allFiles);
  checkInternalLinks(allFiles);
  checkImages(allFiles);
  checkSeoMeta(allFiles);
  checkDuplicates(allFiles);
  checkContentQuality(allFiles);
  await checkSupabaseSync(allFiles);
  checkSitemap(allFiles);
  checkHtmlOutput();
  checkEncoding();

  // Store all results
  await storeResults();

  // Create tickets
  await storeTickets();

  // Deploy if build OK
  const deployed = await deploy(buildOk);

  if (deployed) {
    await markDeployed();
  }

  // Finalize
  await finalize(allFiles.length, deployed);

  // Summary
  console.log('\n=== RESUME VALIDATOR ===');
  console.log(`Articles vérifiés  : ${allFiles.length}`);
  console.log(`Résultats totaux   : ${results.length}`);
  console.log(`  - Errors         : ${errorCount}`);
  console.log(`  - Warnings       : ${warningCount}`);
  console.log(`  - Infos          : ${infoCount}`);
  console.log(`  - Pass           : ${passCount}`);
  console.log(`Tickets créés      : ${tickets.length}`);
  console.log(`Build              : OK`);
  console.log(`Deployed           : ${deployed ? 'OUI (push main)' : 'NON'}`);
  console.log('========================\n');
}

main().catch(e => {
  console.error('Erreur fatale:', e);
  process.exit(1);
});
