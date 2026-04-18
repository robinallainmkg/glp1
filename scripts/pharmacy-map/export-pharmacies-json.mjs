#!/usr/bin/env node
/**
 * Export des pharmacies depuis Supabase vers public/data/pharmacies.json
 * + prix les plus récents par pharmacie/drug vers public/data/latest-prices.json
 *
 * À lancer avant chaque build (cf. package.json "prebuild" ou GitHub Action).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function ensureDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

async function fetchAll(tableOrView, columns, pageSize = 1000) {
  // PostgREST Supabase cap = 1000 rows par requête par défaut.
  // On pagine et on continue tant qu'on reçoit la page complète.
  const out = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from(tableOrView)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

async function main() {
  console.log('Export pharmacies…');
  const pharmacies = await fetchAll(
    'pharmacies',
    'id,finess,name,city,city_slug,postal_code,department,lat,lng',
  );
  console.log(`  ${pharmacies.length.toLocaleString()} pharmacies`);

  // Format compact : array de tuples ordonnés pour réduire la taille JSON
  // [id, finess, name, city, city_slug, postal_code, department, lat, lng]
  const compact = {
    schema: ['id', 'finess', 'name', 'city', 'city_slug', 'postal_code', 'department', 'lat', 'lng'],
    rows: pharmacies.map((p) => [
      p.id,
      p.finess,
      p.name,
      p.city,
      p.city_slug,
      p.postal_code,
      p.department,
      p.lat,
      p.lng,
    ]),
  };

  const pharmaciesPath = 'public/data/pharmacies.json';
  ensureDir(pharmaciesPath);
  writeFileSync(pharmaciesPath, JSON.stringify(compact));
  console.log(`  → ${pharmaciesPath}`);

  console.log('Export latest prices…');
  const prices = await fetchAll(
    'pharmacy_latest_prices',
    'pharmacy_id,drug_slug,dose,price_eur,source,submitted_at',
  );
  console.log(`  ${prices.length.toLocaleString()} prix`);

  // Index par pharmacy_id → liste de prix
  const byPharmacy = {};
  for (const row of prices) {
    (byPharmacy[row.pharmacy_id] ||= []).push({
      d: row.drug_slug,
      dose: row.dose,
      p: Number(row.price_eur),
      s: row.source,
      t: row.submitted_at,
    });
  }

  const pricesPath = 'public/data/latest-prices.json';
  ensureDir(pricesPath);
  writeFileSync(pricesPath, JSON.stringify(byPharmacy));
  console.log(`  → ${pricesPath}`);

  // Stats globales pour la page
  const statsByDrug = {};
  for (const row of prices) {
    const s = (statsByDrug[row.drug_slug] ||= { count: 0, official: 0, user: 0, scraped: 0 });
    s.count += 1;
    s[row.source === 'official_ceps' ? 'official' : row.source] += 1;
  }
  // Endocrinologues
  console.log('Export endocrinologues…');
  const endos = await fetchAll(
    'healthcare_professionals',
    'id,rpps,civility,first_name,last_name,structure_name,city,city_slug,postal_code,department,lat,lng,practice_mode,phone,specialties',
  );
  const endosGeo = endos.filter((e) => e.lat !== null);
  console.log(`  ${endos.length} endocrinologues (${endosGeo.length} géocodés)`);
  const endoCompact = {
    schema: ['id', 'rpps', 'civility', 'first_name', 'last_name', 'structure', 'city', 'city_slug', 'cp', 'dept', 'lat', 'lng', 'mode', 'phone'],
    rows: endosGeo.map((e) => [
      e.id, e.rpps, e.civility, e.first_name, e.last_name, e.structure_name,
      e.city, e.city_slug, e.postal_code, e.department, e.lat, e.lng,
      e.practice_mode, e.phone,
    ]),
  };
  writeFileSync('public/data/endocrinologues.json', JSON.stringify(endoCompact));
  console.log(`  → public/data/endocrinologues.json`);

  // CSO
  console.log('Export CSO…');
  const csos = await fetchAll(
    'obesity_centers',
    'id,slug,name,parent_hospital,is_pediatric,address,city,city_slug,postal_code,department,lat,lng,phone,website,specialties',
  );
  writeFileSync('public/data/cso.json', JSON.stringify(csos));
  console.log(`  ${csos.length} CSO → public/data/cso.json`);

  const statsPath = 'public/data/pharmacy-stats.json';
  writeFileSync(
    statsPath,
    JSON.stringify({
      pharmacies: pharmacies.length,
      prices: prices.length,
      endocrinologues: endosGeo.length,
      cso: csos.length,
      by_drug: statsByDrug,
      updated_at: new Date().toISOString(),
    }),
  );
  console.log(`  → ${statsPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
