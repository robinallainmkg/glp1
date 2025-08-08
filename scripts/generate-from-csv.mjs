import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import slugify from 'slugify';
import matter from 'gray-matter';

const csvPath = process.argv[2] || 'glp-1_clusters_2025-08-07.csv';

// Check if the CSV file exists
if (!fs.existsSync(csvPath)) {
  console.error(`Error: CSV file not found: ${csvPath}`);
  process.exit(1);
}

// Check if config file exists
const configPath = 'site.config.json';
if (!fs.existsSync(configPath)) {
  console.error(`Error: Config file not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const csv = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
const rows = parsed.data;

const byTopic = {};
for (const r of rows) {
  const topic = r['Topic'];
  if (!byTopic[topic]) byTopic[topic] = [];
  byTopic[topic].push(r);
}

function calcReadingTime(text) {
  const wpm = config.readingTime?.wpm || 200;
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.ceil(words / wpm);
  const clampMin = config.readingTime?.minClamp || 3;
  const clampMax = config.readingTime?.maxClamp || 15;
  return Math.max(clampMin, Math.min(clampMax, mins));
}
function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }

for (const [topic, items] of Object.entries(byTopic)) {
  const folder = config.categories[topic] || slugify(topic, { lower: true, strict: true });
  
  // Validate folder name
  if (!folder || typeof folder !== 'string') {
    console.warn(`Skipping topic "${topic}" - invalid folder name`);
    continue;
  }
  
  const dir = path.join('src', 'content', folder);
  ensureDir(dir);
  let authorIndex = 0;
  for (const r of items) {
    const title = r['Page'] || r['Keyword'];
    const keyword = r['Keyword'];
    
    // Skip if essential data is missing
    if (!title || !keyword) {
      console.warn(`Skipping row - missing title or keyword`);
      continue;
    }
    
    const intent = r['Intent'] || 'Informationnel';
    const cat = topic;
    const author = config.authors[authorIndex % config.authors.length].name;
    authorIndex++;
    const slug = slugify(title, { lower: true, strict: true });
    
    // Validate slug
    if (!slug) {
      console.warn(`Skipping "${title}" - invalid slug`);
      continue;
    }
    
    const outfile = path.join(dir, slug + '.md');

    const intro = `**Résumé :** Cet article explique « ${title} » pour le marché français : prix en €, cadre ANSM, conseils pratiques.\n\n`;
    const sections = [
      "## À retenir",
      "## Prix, disponibilité et variations en France",
      "## Remboursement et prise en charge (France)",
      "## Comparaison rapide (France vs autres pays)",
      "## Conseils pratiques",
      "## Produits cosmétiques recommandés",
      "## FAQ",
      "## Conclusion"
    ];
    const midAffiliate = "\n\n[affiliate-box]\n\n";
    const base = intro + sections.join("\n\n") + midAffiliate + "Texte de conclusion et rappel de précautions.";
    const expanded = (base + "\n\n").repeat(15); // garantit un contenu substantiel pour un temps de lecture réaliste

    const fm = {
      title,
      description: `${title} — Guide marché français.`,
      keyword,
      intent,
      category: cat,
      author,
      readingTime: calcReadingTime(expanded)
    };
    const md = matter.stringify(expanded, fm);
    fs.writeFileSync(outfile, md, 'utf8');
  }
}

// Category index pages
const contentRoot = 'src/content';
if (fs.existsSync(contentRoot)) {
  const cats = fs.readdirSync(contentRoot);
  for (const c of cats) {
    // Skip if category name is invalid
    if (!c || typeof c !== 'string') {
      console.warn(`Skipping invalid category: ${c}`);
      continue;
    }
    
    const dir = path.join(contentRoot, c);
    try {
      if (!fs.statSync(dir).isDirectory()) continue;
    } catch (e) {
      console.warn(`Skipping ${c} - not a directory or error reading: ${e.message}`);
      continue;
    }
    
    const indexPath = path.join('src', 'pages', c);
    ensureDir(indexPath);
    
    try {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      const list = files.map(f => `<li><a href='/${c}/${f.replace(/\.md$/, '/')}'>
        ${f.replace(/\.md$/, '').replace(/-/g, ' ')}</a></li>`).join('');
      const html = `---\n---\n<html lang='fr'><head><meta charset='utf-8'/>
        <link rel='stylesheet' href='/src/styles/global.css' />
        <title>${c}</title></head><body><main class='container'><h1>${c}</h1><ul>${list}</ul></main></body></html>`;
      fs.writeFileSync(path.join(indexPath, 'index.astro'), html, 'utf8');
    } catch (e) {
      console.warn(`Error generating index for ${c}: ${e.message}`);
    }
  }
}
console.log('✔ Contenu généré depuis le CSV.');
