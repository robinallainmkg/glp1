const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/robin/glp1/glp1';
const CONTENT_DIR = path.join(ROOT, 'src/content');
const PAGES_DIR = path.join(ROOT, 'src/pages');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ASSETS_DIR = path.join(ROOT, 'src/assets');

// Collections that have dynamic [slug].astro pages under /collections/
const DYNAMIC_COLLECTION_CATEGORIES = [
  'alternatives-glp1',
  'avant-apres-glp1',
  'effets-secondaires-glp1',
  'glp1-cout',
  'glp1-diabete',
  'glp1-perte-de-poids',
  'medecins-glp1-france',
  'medicaments-glp1',
  'recherche-glp1',
  'regime-glp1',
  'temoignages',
  'traitements-glp1',
];

// Also /glp1-perte-de-poids/ has a dynamic [slug].astro
const DIRECT_DYNAMIC_PAGES = [
  'glp1-perte-de-poids',
  'annuaire',
];

function getAllMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...getAllMdFiles(full));
    } else if (item.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function slugToRelativePath(slug) {
  return slug.replace(/^\/+/, '').replace(/\/+$/, '');
}

function contentFileExists(category, slug) {
  const mdFile = path.join(CONTENT_DIR, category, slug + '.md');
  return fs.existsSync(mdFile);
}

function checkPageExists(linkPath) {
  const rel = slugToRelativePath(linkPath);
  if (!rel) return true; // root path

  // Check if it's a /collections/{category}/{slug}/ path
  const collMatch = rel.match(/^collections\/([^/]+)\/([^/]+)$/);
  if (collMatch) {
    const category = collMatch[1];
    const slug = collMatch[2];
    // Check for static astro file first
    const staticAstro = path.join(PAGES_DIR, 'collections', category, slug + '.astro');
    if (fs.existsSync(staticAstro)) return true;
    // Check for index.astro
    const indexAstro = path.join(PAGES_DIR, 'collections', category, slug, 'index.astro');
    if (fs.existsSync(indexAstro)) return true;
    // Check dynamic [slug].astro exists for this category AND content file exists
    const dynamicAstro = path.join(PAGES_DIR, 'collections', category, '[slug].astro');
    if (fs.existsSync(dynamicAstro) && contentFileExists(category, slug)) return true;
    return false;
  }

  // Check /collections/{category}/ (index)
  const collIndexMatch = rel.match(/^collections\/([^/]+)$/);
  if (collIndexMatch) {
    const category = collIndexMatch[1];
    const indexAstro = path.join(PAGES_DIR, 'collections', category, 'index.astro');
    if (fs.existsSync(indexAstro)) return true;
    return false;
  }

  // Check direct dynamic pages like /glp1-perte-de-poids/{slug}/
  for (const dynamicBase of DIRECT_DYNAMIC_PAGES) {
    const dynMatch = rel.match(new RegExp(`^${dynamicBase}\\/([^/]+)$`));
    if (dynMatch) {
      const slug = dynMatch[1];
      const dynamicAstro = path.join(PAGES_DIR, dynamicBase, '[slug].astro');
      if (fs.existsSync(dynamicAstro) && contentFileExists(dynamicBase, slug)) return true;
      // Also check static file
      const staticAstro = path.join(PAGES_DIR, dynamicBase, slug + '.astro');
      if (fs.existsSync(staticAstro)) return true;
      const indexAstro = path.join(PAGES_DIR, dynamicBase, slug, 'index.astro');
      if (fs.existsSync(indexAstro)) return true;
      return false;
    }
  }

  // Check as astro file
  const astroFile = path.join(PAGES_DIR, rel + '.astro');
  if (fs.existsSync(astroFile)) return true;

  // Check as index.astro
  const astroIndex = path.join(PAGES_DIR, rel, 'index.astro');
  if (fs.existsSync(astroIndex)) return true;

  // Do NOT accept content .md files as valid for direct non-collections paths.
  // Content files are only served via /collections/{category}/{slug}/.

  return false;
}

function checkImageExists(src, mdFilePath) {
  if (src.startsWith('/')) {
    const rel = src.replace(/^\/+/, '');
    if (fs.existsSync(path.join(PUBLIC_DIR, rel))) return true;
    if (fs.existsSync(path.join(ASSETS_DIR, rel))) return true;
    return false;
  }
  if (src.startsWith('../') || src.startsWith('./') || !src.startsWith('http')) {
    const dir = path.dirname(mdFilePath);
    const resolved = path.resolve(dir, src);
    if (fs.existsSync(resolved)) return true;
    if (fs.existsSync(path.join(PUBLIC_DIR, src))) return true;
    return false;
  }
  return true; // external
}

function extractLinks(content) {
  const linkRegex = /(?<!!)\[([^\]]*)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({ text: match[1], url: match[2].trim().split(' ')[0] });
  }
  return links;
}

function extractImages(content) {
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = [];
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    images.push({ alt: match[1], src: match[2].trim().split(' ')[0] });
  }
  return images;
}

function getSlug(filePath) {
  return filePath.replace(CONTENT_DIR + path.sep, '').replace(/\\/g, '/');
}

function resolveRelativeLink(url, mdFilePath) {
  // Convert relative link to an absolute path relative to src/
  const mdDir = path.dirname(mdFilePath);
  const resolved = path.resolve(mdDir, url);
  const srcDir = path.join(ROOT, 'src');
  // Should be under src/content/ or src/pages/ - map to URL path
  let rel = resolved.replace(srcDir, '').replace(/\\/g, '/').replace(/^\//, '');
  // Strip .md extension if present
  rel = rel.replace(/\.md$/, '');
  // If it's under content/, strip the "content/" prefix to get the URL path
  // Actually relative links from content files might point to other content files
  // We need to figure out what URL they resolve to
  // Content files are typically at /collections/{category}/{slug}/
  // So ../effets-secondaires-glp1/ozempic-danger resolves to effets-secondaires-glp1/ozempic-danger
  // Strip "content/" prefix
  if (rel.startsWith('content/')) {
    rel = rel.substring('content/'.length);
  }
  return '/' + rel;
}

const mdFiles = getAllMdFiles(CONTENT_DIR);
console.error(`Found ${mdFiles.length} markdown files`);

const broken_links = [];
const missing_images = [];
const missing_alt = [];

for (const mdFile of mdFiles) {
  const slug = getSlug(mdFile);
  const content = fs.readFileSync(mdFile, 'utf8');

  // Check links
  const links = extractLinks(content);
  for (const { text, url } of links) {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) continue;
    if (url.startsWith('#')) continue;

    let resolvedPath = url;
    if (url.startsWith('../') || url.startsWith('./')) {
      resolvedPath = resolveRelativeLink(url, mdFile);
    }

    const cleanPath = resolvedPath.split('?')[0].split('#')[0];

    if (!checkPageExists(cleanPath)) {
      broken_links.push({ slug, link: url, resolved: cleanPath, severity: 'error' });
    }
  }

  // Check images
  const images = extractImages(content);
  for (const { alt, src } of images) {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      if (!alt || alt.trim() === '') {
        missing_alt.push({ slug, src, severity: 'warning' });
      }
      continue;
    }
    if (!alt || alt.trim() === '') {
      missing_alt.push({ slug, src, severity: 'warning' });
    }
    if (!checkImageExists(src, mdFile)) {
      missing_images.push({ slug, src, severity: 'error' });
    }
  }
}

const result = {
  summary: {
    total_files: mdFiles.length,
    broken_links_count: broken_links.length,
    missing_images_count: missing_images.length,
    missing_alt_count: missing_alt.length
  },
  broken_links,
  missing_images,
  missing_alt
};

console.log(JSON.stringify(result, null, 2));
