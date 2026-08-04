// Données villes partagées par les pages prix locales (/pharmacies/[ville]/prix-*).
// Top N villes par nombre de pharmacies + CSO du département (primo-prescription).
// Doit rester synchronisé avec priceCitySlugs dans src/pages/pharmacies/[ville].astro.
import fs from 'node:fs';
import path from 'node:path';

export const PRICE_CITIES_LIMIT = 500;

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

export const DEPT_LABELS: Record<string, string> = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence', '05': 'Hautes-Alpes',
  '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes', '09': 'Ariège', '10': 'Aube',
  '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal',
  '16': 'Charente', '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': "Côte-d'Or",
  '22': "Côtes-d'Armor", '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme',
  '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse',
  '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Hérault',
  '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique',
  '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire',
  '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle',
  '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme', '64': 'Pyrénées-Atlantiques',
  '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales', '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône',
  '70': 'Haute-Saône', '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines', '79': 'Deux-Sèvres',
  '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne', '83': 'Var', '84': 'Vaucluse',
  '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne',
  '90': 'Territoire de Belfort', '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': "Val-d'Oise", '971': 'Guadeloupe', '972': 'Martinique',
  '973': 'Guyane', '974': 'La Réunion', '975': 'Saint-Pierre-et-Miquelon', '976': 'Mayotte',
};

export interface PriceDeptPath {
  params: { dept: string };
  props: {
    deptLabel: string;
    totalPharmas: number;
    topCities: { slug: string; city: string; count: number; hasPricePage: boolean }[];
    csos: { name: string; city: string; postal_code: string; phone: string | null; parent_hospital: string | null }[];
  };
}

// Une page prix par département (102) : top villes du departement + CSO + total pharmacies.
export function getPriceDeptPaths(): PriceDeptPath[] {
  const dataPath = path.resolve(process.cwd(), 'public/data/pharmacies.json');
  const csoPath = path.resolve(process.cwd(), 'public/data/cso.json');
  let pharmacies: { schema: string[]; rows: any[][] } = { schema: [], rows: [] };
  let csos: any[] = [];
  try { pharmacies = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); } catch {}
  try { csos = JSON.parse(fs.readFileSync(csoPath, 'utf-8')); } catch {}

  const iCity = pharmacies.schema.indexOf('city');
  const iSlug = pharmacies.schema.indexOf('city_slug');
  const iDept = pharmacies.schema.indexOf('department');

  // Villes ayant une page prix ville (top PRICE_CITIES_LIMIT national, meme calcul que getPriceCityPaths)
  const cityCounts: Record<string, number> = {};
  for (const row of pharmacies.rows) {
    const slug = row[iSlug];
    if (slug) cityCounts[slug] = (cityCounts[slug] || 0) + 1;
  }
  const priceCitySlugs = new Set(
    Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, PRICE_CITIES_LIMIT).map(([s]) => s)
  );

  const byDept: Record<string, { total: number; cities: Record<string, { slug: string; city: string; count: number }> }> = {};
  for (const row of pharmacies.rows) {
    const dept = String(row[iDept]);
    const slug = row[iSlug];
    if (!dept || !slug) continue;
    if (!byDept[dept]) byDept[dept] = { total: 0, cities: {} };
    byDept[dept].total++;
    if (!byDept[dept].cities[slug]) byDept[dept].cities[slug] = { slug, city: row[iCity], count: 0 };
    byDept[dept].cities[slug].count++;
  }

  const csosByDept: Record<string, any[]> = {};
  for (const c of csos) {
    const d = String(c.department);
    if (!csosByDept[d]) csosByDept[d] = [];
    csosByDept[d].push(c);
  }

  return Object.entries(byDept).map(([dept, data]) => ({
    params: { dept },
    props: {
      deptLabel: DEPT_LABELS[dept] || `Département ${dept}`,
      totalPharmas: data.total,
      topCities: Object.values(data.cities)
        .sort((a, b) => b.count - a.count)
        .slice(0, 12)
        .map((c) => ({ ...c, hasPricePage: priceCitySlugs.has(c.slug) })),
      csos: (csosByDept[dept] || []).slice(0, 5).map((x) => ({
        name: x.name,
        city: x.city,
        postal_code: x.postal_code,
        phone: x.phone ?? null,
        parent_hospital: x.parent_hospital ?? null,
      })),
    },
  }));
}
