#!/usr/bin/env node
/**
 * Seed des CSO (Centres Spécialisés de l'Obésité) depuis cso-list.json + géocodage BAN.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const BAN_ENDPOINT = 'https://api-adresse.data.gouv.fr/search/';

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function departmentFromPostal(cp) {
  if (!cp || cp.length < 2) return null;
  const d2 = cp.slice(0, 2);
  if (d2 === '97' || d2 === '98') return cp.slice(0, 3);
  if (d2 === '20') {
    const n = parseInt(cp.slice(0, 3), 10);
    return n < 202 ? '2A' : '2B';
  }
  return d2;
}

async function geocode(address, postal, city) {
  const q = [address, postal, city].filter(Boolean).join(' ');
  const url = BAN_ENDPOINT + '?q=' + encodeURIComponent(q) + '&limit=1&autocomplete=0';
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'glp1-france seed bot' } });
    if (!r.ok) return null;
    const d = await r.json();
    const hit = d?.features?.[0];
    if (!hit) return null;
    const [lng, lat] = hit.geometry.coordinates;
    return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), quality: hit.properties?.type || 'unknown' };
  } catch { return null; }
}

async function main() {
  const raw = JSON.parse(readFileSync('scripts/pharmacy-map/cso-list.json', 'utf-8'));
  const centers = raw.centers;
  console.error(`[seed-cso] ${centers.length} centers to process`);

  const rows = [];
  for (const c of centers) {
    const geo = await geocode(c.address, c.postal_code, c.city);
    await new Promise((r) => setTimeout(r, 150));
    rows.push({
      slug: c.slug,
      name: c.name,
      parent_hospital: c.parent_hospital || null,
      is_pediatric: c.is_pediatric === true,
      address: c.address,
      postal_code: c.postal_code,
      city: c.city,
      city_slug: slugify(c.city),
      department: departmentFromPostal(c.postal_code),
      lat: geo?.lat || null,
      lng: geo?.lng || null,
      phone: c.phone || null,
      website: c.website || null,
      specialties: ['obésité', 'nutrition', 'chirurgie bariatrique', 'endocrinologie'],
      finess: null,
      notes: null,
      is_active: true,
    });
    console.error(`  ${c.slug} → ${geo ? 'geocoded ' + geo.quality : 'NO GEO'}`);
  }

  const withGeo = rows.filter((r) => r.lat !== null).length;
  console.error(`[seed-cso] geocoded ${withGeo}/${rows.length}`);

  const { error } = await supabase.from('obesity_centers').upsert(rows, { onConflict: 'slug' });
  if (error) throw error;

  console.log(JSON.stringify({ ok: true, total: rows.length, geocoded: withGeo }, null, 2));
}

main().catch((err) => {
  console.error('[seed-cso] fatal:', err);
  process.exit(1);
});
