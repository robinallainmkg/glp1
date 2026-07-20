// Données villes partagées par les pages prix locales (/pharmacies/[ville]/prix-*).
// Top N villes par nombre de pharmacies + CSO du département (primo-prescription).
// Doit rester synchronisé avec priceCitySlugs dans src/pages/pharmacies/[ville].astro.
import fs from 'node:fs';
import path from 'node:path';

export const PRICE_CITIES_LIMIT = 200;

export interface PriceCityPath {
  params: { ville: string };
  props: {
    city: string;
    department: string;
    pharmacies: { name: string; postal: string }[];
    csos: { name: string; city: string; postal_code: string; phone: string | null; parent_hospital: string | null }[];
  };
}

export function getPriceCityPaths(limit: number = PRICE_CITIES_LIMIT): PriceCityPath[] {
  const dataPath = path.resolve(process.cwd(), 'public/data/pharmacies.json');
  const csoPath = path.resolve(process.cwd(), 'public/data/cso.json');
  let pharmacies: { schema: string[]; rows: any[][] } = { schema: [], rows: [] };
  let csos: any[] = [];
  try { pharmacies = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); } catch {}
  try { csos = JSON.parse(fs.readFileSync(csoPath, 'utf-8')); } catch {}

  const iName = pharmacies.schema.indexOf('name');
  const iCity = pharmacies.schema.indexOf('city');
  const iSlug = pharmacies.schema.indexOf('city_slug');
  const iCP = pharmacies.schema.indexOf('postal_code');
  const iDept = pharmacies.schema.indexOf('department');

  const byCity: Record<string, { slug: string; city: string; department: string; pharmacies: { name: string; postal: string }[] }> = {};
  for (const row of pharmacies.rows) {
    const slug = row[iSlug];
    if (!slug) continue;
    if (!byCity[slug]) byCity[slug] = { slug, city: row[iCity], department: String(row[iDept]), pharmacies: [] };
    byCity[slug].pharmacies.push({ name: row[iName], postal: row[iCP] });
  }

  const csosByDept: Record<string, any[]> = {};
  for (const c of csos) {
    const d = String(c.department);
    if (!csosByDept[d]) csosByDept[d] = [];
    csosByDept[d].push(c);
  }

  return Object.values(byCity)
    .sort((a, b) => b.pharmacies.length - a.pharmacies.length)
    .slice(0, limit)
    .map((c) => ({
      params: { ville: c.slug },
      props: {
        city: c.city,
        department: c.department,
        pharmacies: c.pharmacies.sort((a, b) => String(a.postal).localeCompare(String(b.postal))),
        csos: (csosByDept[c.department] || []).slice(0, 4).map((x) => ({
          name: x.name,
          city: x.city,
          postal_code: x.postal_code,
          phone: x.phone ?? null,
          parent_hospital: x.parent_hospital ?? null,
        })),
      },
    }));
}

// "PARIS" → "Paris", "AIX EN PROVENCE" → "Aix En Provence"
export function titleCaseCity(s: string): string {
  return (s || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
