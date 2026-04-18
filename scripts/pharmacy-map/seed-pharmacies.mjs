#!/usr/bin/env node
/**
 * Seed des pharmacies françaises depuis t-finess (data.gouv.fr / Atlasanté).
 *
 * Usage :
 *   node scripts/pharmacy-map/seed-pharmacies.mjs [--dry-run] [--limit N]
 *
 * Requiert :
 *   SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env
 *
 * Source :
 *   https://www.data.gouv.fr/datasets/referentiel-finess-t-finess
 *   → CSV mis à jour tous les 2 mois par Atlasanté (géocodage via BAN)
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import { createReadStream, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';

const CSV_URL = 'https://static.data.gouv.fr/resources/referentiel-finess-t-finess/20260316-074833/t-finess.csv';
const CSV_PATH = 'tmp-data/t-finess.csv';
const BATCH_SIZE = 500;
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.indexOf('--limit');
const LIMIT = LIMIT_ARG > -1 ? parseInt(process.argv[LIMIT_ARG + 1], 10) : Infinity;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
if (!existsSync(CSV_PATH)) {
  console.error(`CSV non trouvé : ${CSV_PATH}`);
  console.error(`Télécharger avec : curl -sL "${CSV_URL}" -o ${CSV_PATH}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildAddress(row) {
  const parts = [row.adresse_num_voie, row.adresse_type_voie, row.adresse_nom_voie, row.adresse_lieuditbp]
    .map((s) => (s || '').trim())
    .filter(Boolean);
  return parts.join(' ') || null;
}

function departmentFromPostal(cp) {
  if (!cp || cp.length < 2) return null;
  const d2 = cp.slice(0, 2);
  if (d2 === '97' || d2 === '98') return cp.slice(0, 3); // DOM
  if (d2 === '20') {
    // Corse : 2A (20000-20190) ou 2B (20200-20620)
    const n = parseInt(cp.slice(0, 3), 10);
    return n < 202 ? '2A' : '2B';
  }
  return d2;
}

function parseFloatSafe(s) {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

async function upsertBatch(rows) {
  if (DRY_RUN) {
    console.log(`[dry-run] ${rows.length} rows :`, rows.slice(0, 2));
    return;
  }
  const { error } = await supabase
    .from('pharmacies')
    .upsert(rows, { onConflict: 'finess', ignoreDuplicates: false });
  if (error) {
    console.error('Batch upsert error:', error.message);
    console.error('Sample row :', rows[0]);
    throw error;
  }
}

async function main() {
  console.log(`Seed pharmacies depuis ${CSV_PATH}${DRY_RUN ? ' (DRY-RUN)' : ''}`);
  const t0 = Date.now();

  const parser = parse({
    columns: true,
    delimiter: ',',
    quote: '"',
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
  });

  let scanned = 0;
  let kept = 0;
  let batch = [];

  const src = createReadStream(CSV_PATH).pipe(parser);

  for await (const row of src) {
    scanned += 1;
    if (scanned % 50000 === 0) {
      console.log(`  scan ${scanned.toLocaleString()}… gardés ${kept.toLocaleString()}`);
    }

    // Filtre : pharmacies d'officine (categ_code 620), état ACTUEL, type ET
    if (row.categ_code !== '620') continue;
    if (row.etat !== 'ACTUEL') continue;
    if (row.type !== 'ET') continue;

    const lng = parseFloatSafe(row.geoloc_4326_long);
    const lat = parseFloatSafe(row.geoloc_4326_lat);
    // On écarte les rows sans géoloc (quelques % — réintégrables plus tard via BAN)
    if (lng === null || lat === null) continue;

    const city = (row.adresse_lib_routage || '').trim();
    const postal = (row.adresse_code_postal || '').trim();

    batch.push({
      finess: row.finess,
      name: (row.rs || '').trim(),
      address: buildAddress(row),
      postal_code: postal || null,
      city: city || null,
      city_slug: slugify(city),
      department: departmentFromPostal(postal),
      lat,
      lng,
      phone: (row.telephone || '').trim() || null,
      is_active: true,
    });

    kept += 1;
    if (kept >= LIMIT) break;

    if (batch.length >= BATCH_SIZE) {
      await upsertBatch(batch);
      batch = [];
    }
  }

  if (batch.length) await upsertBatch(batch);

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\nFini : ${kept.toLocaleString()} pharmacies gardées sur ${scanned.toLocaleString()} scannées, en ${dt}s.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
