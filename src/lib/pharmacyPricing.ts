// Estimation des prix GLP-1 par pharmacie — logique partagée entre la map (client)
// et les pages statiques générées au build (server-side).
// Même algorithme : hash déterministe (FINESS + drug + dose) × variance département.

export const DRUG_REF: Record<string, {
  name: string;
  note: string;
  fixed?: boolean;
  doses: { dose: string; price: number }[];
}> = {
  ozempic: {
    name: 'Ozempic',
    note: 'Remboursé 65% en bithérapie metformine / 30% en trithérapie insuline (DT2) · prix CEPS identique France entière',
    fixed: true,
    doses: [
      { dose: '0,25 mg', price: 80.18 },
      { dose: '0,5 mg', price: 80.18 },
      { dose: '1 mg', price: 80.18 },
      { dose: '2 mg', price: 80.18 },
    ],
  },
  wegovy: {
    name: 'Wegovy',
    note: 'Prix libéré · non remboursé · estimation par pharmacie',
    doses: [
      { dose: '0,25 mg', price: 135 },
      { dose: '0,5 mg', price: 135 },
      { dose: '1 mg', price: 170 },
      { dose: '1,7 mg', price: 230 },
      { dose: '2,4 mg', price: 270 },
    ],
  },
  mounjaro: {
    name: 'Mounjaro',
    note: 'Prix libéré · non remboursé · estimation par pharmacie',
    doses: [
      { dose: '2,5 mg', price: 220 },
      { dose: '5 mg', price: 260 },
      { dose: '7,5 mg', price: 320 },
      { dose: '10 mg', price: 375 },
      { dose: '12,5 mg', price: 420 },
      { dose: '15 mg', price: 470 },
    ],
  },
  saxenda: {
    name: 'Saxenda',
    note: 'Prix libéré · non remboursé · pack 5 stylos',
    doses: [
      { dose: '6 mg/ml', price: 280 },
    ],
  },
};

const PREMIUM_DEPTS = new Set(['75', '92', '78', '06', '69', '13', '74', '77', '93', '94', '91', '95']);
const RURAL_DEPTS = new Set(['23', '15', '48', '19', '46', '55', '39', '52', '58', '43', '04']);

function pharmaSeed(finess: string, drug: string, dose: string): number {
  const s = String(finess) + '|' + drug + '|' + dose;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function estimatePrice(
  basePrice: number,
  finess: string,
  department: string,
  drug: string,
  dose: string,
): number {
  const seed = pharmaSeed(finess, drug, dose);
  let factor = 0.92 + ((seed % 161) / 1000);
  if (PREMIUM_DEPTS.has(department)) factor += 0.05 + ((seed % 101) / 1000);
  else if (RURAL_DEPTS.has(department)) factor -= 0.06 + ((seed % 41) / 1000);
  return Math.round(basePrice * factor * 100) / 100;
}

export function computePharmacyPrices(finess: string, department: string) {
  const result: Record<string, { name: string; note: string; fixed: boolean; rows: { dose: string; price: number }[] }> = {};
  for (const slug of Object.keys(DRUG_REF)) {
    const ref = DRUG_REF[slug];
    result[slug] = {
      name: ref.name,
      note: ref.note,
      fixed: ref.fixed === true,
      rows: ref.doses.map((d) => ({
        dose: d.dose,
        price: ref.fixed ? d.price : estimatePrice(d.price, finess, department, slug, d.dose),
      })),
    };
  }
  return result;
}

export function slugifyName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
