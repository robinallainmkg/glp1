require('dotenv').config({path:'C:/Users/robin/glp1/glp1/.env.local'});
const {createClient} = require('@supabase/supabase-js');
const fs = require('fs');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const CONTENT_DIR = 'C:/Users/robin/glp1/glp1/src/content';

function walk(d, a) {
  if (!a) a = [];
  fs.readdirSync(d).forEach(function(f) {
    const p = d + '/' + f;
    if (fs.statSync(p).isDirectory()) walk(p, a);
    else if (f.match(/\.(md|mdx)$/)) a.push(p);
  });
  return a;
}

function getField(yaml, key) {
  const lines = yaml.split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    const m = lines[i].match(new RegExp('^' + key + '\s*:\s*(.*)'));
    if (m) {
      var v = m[1].trim().replace(/^"|"$|^'|'$/g, '');
      return v || null;
    }
  }
  return null;
}

const files = walk(CONTENT_DIR);
const warnings = [];

for (var fi = 0; fi < Math.min(100, files.length); fi++) {
  const f = files[fi];
  const rel = f.replace('C:/Users/robin/glp1/glp1/', '');
  const raw = fs.readFileSync(f, 'utf8');
  const fm_match = raw.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!fm_match) continue;
  const yaml = fm_match[1];
  
  const title = getField(yaml, 'title');
  const desc = getField(yaml, 'description');
  const kw = getField(yaml, 'mainKeyword');
  
  if (title && kw && !title.toLowerCase().includes(kw.toLowerCase())) {
    warnings.push({ file: rel, issue: 'seo_optimization', desc: 'mainKeyword "' + kw + '" absent du title. File: ' + rel });
  }
  if (desc && desc.length < 120) {
    warnings.push({ file: rel, issue: 'seo_optimization', desc: 'Description trop courte (' + desc.length + ' chars, min 120). File: ' + rel });
  }
  if (desc && desc.length > 160) {
    warnings.push({ file: rel, issue: 'seo_optimization', desc: 'Description trop longue (' + desc.length + ' chars, max 160). File: ' + rel });
  }
}

// Also add HTML warnings
var htmlWarnings = [
  { file: 'dist/admin-stats/index.html', issue: 'seo_optimization', desc: 'Page admin-stats manque meta description, lang=fr, og:title' },
  { file: 'dist/alternatives-glp1/alternatives-naturelles-glp1/index.html', issue: 'seo_optimization', desc: 'Page alternatives-naturelles-glp1 manque meta description, lang=fr, og:title' }
];

var allWarnings = warnings.concat(htmlWarnings);
console.log('Total warnings to insert:', allWarnings.length);

// Insert tickets - limit to 20
var toInsert = allWarnings.slice(0, 20).map(function(w) {
  return {
    source_agent: 'validator',
    type: w.issue,
    urgence: 'low',
    statut: 'approved',
    description: w.desc,
    file_path: w.file
  };
});

sb.from('correction_tickets').upsert(toInsert, { onConflict: 'source_agent,type,file_path', ignoreDuplicates: true }).then(function(res) {
  if (res.error) {
    console.log('Upsert error (trying insert):', res.error.message);
    // Try simple insert
    sb.from('correction_tickets').insert(toInsert).then(function(r2) {
      if (r2.error) console.log('Insert error:', r2.error.message);
      else console.log('Inserted OK');
    });
  } else {
    console.log('Tickets inserted/updated OK');
  }
});
