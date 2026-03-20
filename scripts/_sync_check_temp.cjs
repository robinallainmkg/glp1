const fs = require("fs");
const path = require("path");
process.chdir("C:/Users/robin/glp1/glp1");

const data = JSON.parse(fs.readFileSync("supabase_articles.json", "utf8"));
console.log("Supabase active:", data.length);

function walk(dir) {
  const files = [];
  try {
    for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) files.push(...walk(full));
      else if (e.name.endsWith(".md")) files.push(full);
    }
  } catch(err) {}
  return files;
}

const mdFiles = walk("src/content");
const diskSlugs = new Set(mdFiles.map(f => path.basename(f, ".md")));
console.log("Disk files:", mdFiles.length);

const ghosts = [];
for (const art of data) {
  const col = art.collection || "";
  if (col.indexOf("astro") >= 0) continue;
  const slug = art.slug;
  const segs = slug.split("/");
  const base = segs[segs.length - 1];
  const has = diskSlugs.has(base);
  if (!has) ghosts.push({slug, col, base});
}

console.log("Ghosts:", ghosts.length);
for (const g of ghosts.slice(0,20)) console.log(" -", g.slug, "[" + g.col + "] base:" + g.base);
if (ghosts.length > 20) console.log("... +" + (ghosts.length-20) + " more");
