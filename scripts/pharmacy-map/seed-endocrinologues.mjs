#!/usr/bin/env node
/**
 * Seed endocrinologues depuis l'Annuaire Santé RPPS (data.gouv.fr) + géocodage BAN.
 *
 * Source : https://www.data.gouv.fr/datasets/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professionnels-intervenant-dans-le-systeme-de-sante-rpps
 * Filtre : savoir-faire = "Endocrinologie et métabolisme" (~3800 praticiens)
 * Géocodage : BAN api-adresse.data.gouv.fr (gratuit, officiel)
 *
 * Usage :
 *   node scripts/pharmacy-map/seed-endocrinologues.mjs [--limit N] [--dry-run]
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import { createReadStream, existsSync } from 'node:fs';

const CSV_PATH = 'tmp-data/ps-activite.txt';
const BAN_ENDPOINT = 'https://api-adresse.data.gouv.fr/search/';
const BATCH_SIZE = 200;
const GEOCODE_CONCURRENCY = 8;
const GEOCODE_DELAY_MS = 120;

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_IDX = process.argv.indexOf('--limit');
const LIMIT = LIMIT_IDX > -1 ? parseInt(process.argv[LIMIT_IDX + 1], 10) : Infinity;

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!existsSync(CSV_PATH)) {
  console.error(`CSV non trouvé : ${CSV_PATH}`);
  console.error("Télécharger avec : curl -sL 'https://static.data.gouv.fr/resources/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professionnels-intervenant-dans-le-systeme-de-sante-rpps/20260418-084824/ps-libreacces-personne-activite.txt' -o " + CSV_PATH);
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

function buildAddress(row) {
  // Col index dans ps-libreacces-personne-activite.txt (0-indexed)
  //  28: Numéro Voie
  //  31: Libellé type voie
  //  32: Libellé Voie
  //  35: Code postal
  //  37: Libellé commune
  const parts = [row[28], row[31], row[32]].filter(Boolean).map((s) => s.trim()).filter(Boolean);
  return parts.join(' ') || null;
}

function practiceMode(code) {
  const map = { L: 'libéral', S: 'salarié', H: 'hospitalier', A: 'autre' };
  return map[code] || code || null;
}

// BAN geocoder — retourne {lat, lng, quality} ou null
async function geocode(address, postalCode, city) {
  if (!address && !city) return null;
  const q = [address, postalCode, city].filter(Boolean).join(' ');
  const url = BAN_ENDPOINT + '?q=' + encodeURIComponent(q) + '&limit=1&autocomplete=0';
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'glp1-france seed bot' } });
    if (!r.ok) return null;
    const d = await r.json();
    const hit = d?.features?.[0];
    if (!hit) return null;
    const [lng, lat] = hit.geometry.coordinates;
    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      quality: hit.properties?.type || 'unknown',
      score: hit.properties?.score || 0,
    };
  } catch { return null; }
}

// Pool de géocodage (concurrency limitée)
async function geocodeBatch(rows) {
  const out = [];
  let idx = 0;
  async function worker() {
    while (idx < rows.length) {
      const i = idx++;
      const row = rows[i];
      const result = await geocode(row.address, row.postal_code, row.city);
      if (result && result.score > 0.3) {
        row.lat = result.lat;
        row.lng = result.lng;
        row.geocode_quality = result.quality;
      }
      out[i] = row;
      await new Promise((r) => setTimeout(r, GEOCODE_DELAY_MS));
    }
  }
  await Promise.all(Array.from({ length: GEOCODE_CONCURRENCY }, worker));
  return out;
}

async function upsertBatch(rows) {
  if (DRY_RUN) {
    console.log(`[dry-run] ${rows.length} rows sample:`, rows[0]);
    return;
  }
  const { error } = await supabase
    .from('healthcare_professionals')
    .upsert(rows, { onConflict: 'rpps', ignoreDuplicates: false });
  if (error) {
    console.error('upsert error:', error.message);
    throw error;
  }
}

async function main() {
  console.error(`[seed-endo] start${DRY_RUN ? ' (DRY-RUN)' : ''}`);
  const t0 = Date.now();

  const parser = parse({
    delimiter: '|',
    quote: false,
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
  });

  let scanned = 0;
  let kept = 0;
  let skippedDupe = 0;
  const seen = new Set();
  let pending = [];

  const src = createReadStream(CSV_PATH).pipe(parser);
  for await (const row of src) {
    scanned += 1;
    if (scanned === 1) continue; // header
    if (scanned % 200000 === 0) {
      console.error(`  scan ${scanned.toLocaleString()} · endocrino ${kept.toLocaleString()}`);
    }

    // Col 16 "Libellé savoir-faire" = "Endocrinologie et métabolisme"
    const savoirFaire = row[16] || '';
    if (!/endocrinologie/i.test(savoirFaire)) continue;

    const rpps = row[2]; // Identification nationale PP
    if (!rpps) continue;
    if (seen.has(rpps)) { skippedDupe += 1; continue; }
    seen.add(rpps);

    const postal = (row[35] || '').trim();
    const city = (row[37] || '').trim();

    pending.push({
      rpps,
      profession_type: 'endocrinologue',
      civility: (row[4] || row[6] || '').trim() || null,
      first_name: (row[8] || '').trim() || null,
      last_name: (row[7] || '').trim(),
      specialties: savoirFaire ? [savoirFaire] : null,
      practice_mode: practiceMode(row[17]),
      structure_name: (row[24] || '').trim() || null,
      address: buildAddress(row),
      postal_code: postal || null,
      city: city || null,
      city_slug: slugify(city),
      department: departmentFromPostal(postal),
      lat: null,
      lng: null,
      geocode_quality: null,
      phone: (row[40] || '').trim() || null,
      email: (row[43] || '').trim() || null,
      finess: (row[21] || '').trim() || null,
      is_active: true,
    });

    kept += 1;
    if (kept >= LIMIT) break;
  }

  console.error(`[seed-endo] scanned ${scanned.toLocaleString()} rows · kept ${kept} endocrinologues · ${skippedDupe} duplicates skipped`);
  console.error(`[seed-endo] geocoding via BAN (concurrency ${GEOCODE_CONCURRENCY}, delay ${GEOCODE_DELAY_MS}ms)…`);

  // Geocode
  const geocoded = await geocodeBatch(pending);
  const withGeo = geocoded.filter((r) => r.lat !== null).length;
  console.error(`[seed-endo] geocoded ${withGeo}/${geocoded.length} successfully`);

  // Batch insert
  for (let i = 0; i < geocoded.length; i += BATCH_SIZE) {
    const batch = geocoded.slice(i, i + BATCH_SIZE);
    await upsertBatch(batch);
    if (i % (BATCH_SIZE * 5) === 0) {
      console.error(`  inserted ${Math.min(i + BATCH_SIZE, geocoded.length)}/${geocoded.length}`);
    }
  }

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  const report = {
    ok: true,
    scanned,
    kept,
    geocoded: withGeo,
    duration_s: Number(dt),
  };
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error('[seed-endo] fatal:', err);
  console.log(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
