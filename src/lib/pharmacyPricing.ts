// Prix officiels GLP-1 — partagés entre la map (client) et les pages statiques (build).
// Depuis le 15/06/2026 (arrêtés JO du 28/05/2026), les prix d'Ozempic, Wegovy et Mounjaro
// sont RÉGLEMENTÉS : identiques dans toutes les pharmacies françaises. Aucune estimation.
// Sources : Base de données publique des médicaments (BDPM), Vidal, Légifrance.

export const DRUG_REF: Record<string, {
  name: string;
  note: string;
  fixed?: boolean;
  doses: { dose: string; price: number }[];
}> = {
  ozempic: {
    name: 'Ozempic',
    note: 'Remboursé 30% (diabète type 2) · 100% en ALD · prix officiel identique France entière',
    fixed: true,
    doses: [
      { dose: '0,25 mg', price: 77.60 },
      { dose: '0,5 mg', price: 77.60 },
      { dose: '1 mg', price: 77.60 },
    ],
  },
  wegovy: {
    name: 'Wegovy',
    note: 'Remboursé 65% depuis le 15/06/2026 (obésité, sous conditions) · prix réglementé identique partout',
    fixed: true,
    doses: [
      { dose: '0,25 mg', price: 146.91 },
      { dose: '0,5 mg', price: 146.91 },
      { dose: '1 mg', price: 146.91 },
      { dose: '1,7 mg', price: 169.31 },
      { dose: '2,4 mg', price: 195.10 },
    ],
  },
  mounjaro: {
    name: 'Mounjaro',
    note: 'Remboursé 65% depuis le 15/06/2026 (obésité, sous conditions) · prix réglementé identique partout',
    fixed: true,
    doses: [
      { dose: '2,5 mg', price: 176.10 },
      { dose: '5 mg', price: 237.68 },
      { dose: '7,5 mg', price: 335.95 },
      { dose: '10 mg', price: 335.95 },
      { dose: '12,5 mg', price: 433.80 },
      { dose: '15 mg', price: 433.80 },
    ],
  },
  saxenda: {
    name: 'Saxenda',
    note: 'Prix libre · non remboursé · demandez le tarif à la pharmacie',
    doses: [],
  },
};

export function computePharmacyPrices(_finess: string, _department: string) {
  // Les prix étant réglementés, ils ne dépendent plus de la pharmacie ni du département.
  const result: Record<string, { name: string; note: string; fixed: boolean; rows: { dose: string; price: number }[] }> = {};
  for (const slug of Object.keys(DRUG_REF)) {
    const ref = DRUG_REF[slug];
    result[slug] = {
      name: ref.name,
      note: ref.note,
      fixed: ref.fixed === true,
      rows: ref.doses.map((d) => ({ dose: d.dose, price: d.price })),
    };
  }
  return result;
}

export function slugifyName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
