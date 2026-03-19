require('dotenv').config({path:'C:/Users/robin/glp1/glp1/.env.local'});
const {createClient} = require('@supabase/supabase-js');
const fs = require('fs');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function walk(d, a) {
  if (!a) a = [];
  fs.readdirSync(d).forEach(function(f) {
    const p = d + '/' + f;
    if (fs.statSync(p).isDirectory()) walk(p, a);
    else if (f.match(/\.(md|mdx)$/)) a.push(p);
  });
  return a;
}

sb.from('articles').select('slug,collection').eq('is_active', true).then(function(res) {
  const data = res.data;
  const error = res.error;
  if (error) { console.error(error.message); return; }

  const diskFiles = walk('C:/Users/robin/glp1/glp1/src/content').map(function(f) {
    const parts = f.replace('C:/Users/robin/glp1/glp1/src/content/', '').split('/');
    return { collection: parts[0], slug: parts[1].replace(/\.(md|mdx)$/, '') };
  });

  const diskSet = new Set(diskFiles.map(function(f) { return f.collection + '/' + f.slug; }));

  const missing = data.filter(function(a) {
    const k1 = a.collection + '/' + a.slug;
    return !diskSet.has(k1) && !diskSet.has(a.slug);
  });

  const supSet = new Set(data.map(function(a) { return a.collection + '/' + a.slug; }));
  const extra = diskFiles.filter(function(f) {
    return !supSet.has(f.collection + '/' + f.slug);
  });

  console.log('Disk files:', diskFiles.length);
  console.log('Supabase active:', data.length);
  console.log('Missing on disk (in Supabase but not on disk):', missing.length);
  missing.slice(0, 20).forEach(function(a) { console.log(' -', a.collection + '/' + a.slug); });
  console.log('Extra on disk (not in Supabase):', extra.length);
  extra.slice(0, 10).forEach(function(f) { console.log(' +', f.collection + '/' + f.slug); });
});
