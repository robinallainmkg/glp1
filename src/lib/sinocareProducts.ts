// Catalogue Sinocare — produits dispos via Awin (mid 114180, affid 2879557)
// Catalogue validé contre en.sinocare.com/fr (Shopify, EUR, FR localisation auto)
// Cookie window 30j (40j pour content creators), commission 8% base

export type SinocareCategory =
  | 'glucometer'
  | 'glucometer_bluetooth'
  | 'cgm'
  | 'strips'
  | 'bp_monitor'
  | 'insulin_needles';

export interface SinocareProduct {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  category: SinocareCategory;
  imageUrl: string;
  priceFromEur: number;
  rating: number;
  awinUedUrl: string;
  matchSlugs: string[];
  matchCollections: string[];
  // Tags pour scoring d'affinité contextuelle dans les articles
  affinityTags: string[];
}

export const AWIN_MID = '114180';
export const AWIN_AFFID = '2879557';

export const SINOCARE_PRODUCTS: SinocareProduct[] = [
  {
    id: 'safe-aq-smart',
    name: 'Sinocare Safe AQ Smart',
    shortDesc: 'Lecteur de glycémie compact',
    fullDesc: 'Lecteur de glycémie intelligent, portable, test indolore. Marquage CE.',
    category: 'glucometer',
    imageUrl: 'https://en.sinocare.com/cdn/shop/files/safe-aq-smart-hero.png',
    priceFromEur: 17.99,
    rating: 4.8,
    awinUedUrl: 'https://en.sinocare.com/fr/products/safe-aq-smart-blood-glucometer',
    matchSlugs: ['glucometre', 'ozempic', 'trulicity', 'rybelsus', 'victoza', 'diabete', 'glycemie', 'prescription', 'mesusage'],
    matchCollections: ['glp1-diabete', 'traitements-glp1', 'glp1-cout', 'effets-secondaires-glp1'],
    affinityTags: ['DT2', 'suivi-glycemie', 'autonomie', 'compact'],
  },
  {
    id: 'safe-aq-air',
    name: 'Sinocare Safe AQ Air Bluetooth',
    shortDesc: 'Lecteur Bluetooth — sync app smartphone',
    fullDesc: 'Glucomètre Bluetooth nouvelle génération. Synchronisation automatique avec votre smartphone, suivi des tendances dans l\'app.',
    category: 'glucometer_bluetooth',
    imageUrl: 'https://en.sinocare.com/cdn/shop/files/safe-aq-air-hero.png',
    priceFromEur: 22.99,
    rating: 4.7,
    awinUedUrl: 'https://en.sinocare.com/fr/products/sinocare-safe-aq-air-bluetooth-blood-sugar-monitor',
    matchSlugs: ['suivi', 'connecte', 'app', 'mounjaro', 'wegovy', 'ozempic', 'guide-complet', 'avis-patients'],
    matchCollections: ['traitements-glp1', 'glp1-cout', 'glp1-perte-de-poids'],
    affinityTags: ['DT2', 'tech', 'suivi-connecte', 'app-smartphone'],
  },
  {
    id: 'ican-cgm',
    name: 'Sinocare iCan i3 CGM 15 jours',
    shortDesc: 'Capteur de glycémie continue 15 jours',
    fullDesc: 'Capteur de glycémie continue (CGM) Sinocare iCan i3, autonomie 15 jours, mesure automatique via application. Idéal pour patients DT2 ou pour comprendre vos pics glycémiques sous traitement.',
    category: 'cgm',
    imageUrl: 'https://en.sinocare.com/cdn/shop/files/ican-cgm-hero.png',
    priceFromEur: 49.90,
    rating: 4.6,
    awinUedUrl: 'https://en.sinocare.com/fr/products/ican-cgm-15-days-continuous-glucose-monitoring',
    matchSlugs: ['regime', 'perte-de-poids', 'mounjaro', 'wegovy', 'plateau', 'reprise-poids', 'glycemie', 'sopk', 'syndrome-metabolique', 'index-glycemique', 'pre-diabete', 'metabolique'],
    matchCollections: ['regime-glp1', 'glp1-perte-de-poids', 'glp1-diabete', 'traitements-glp1', 'recherche-glp1'],
    affinityTags: ['premium', 'tech', 'tendances', 'data', 'DT2', 'pre-diabete'],
  },
  {
    id: 'safe-aq-pro-i',
    name: 'Sinocare Safe AQ Pro I',
    shortDesc: 'Kit complet glucomètre + bandelettes',
    fullDesc: 'Kit glucomètre Safe AQ Pro I + bandelettes incluses + lancettes + stylo. Solution complète pour démarrer le suivi de glycémie.',
    category: 'glucometer',
    imageUrl: 'https://en.sinocare.com/cdn/shop/files/safe-aq-pro-i-hero.png',
    priceFromEur: 19.99,
    rating: 4.9,
    awinUedUrl: 'https://en.sinocare.com/fr/products/sinocare-safe-aq-pro-i-blood-glucose-meter',
    matchSlugs: ['kit', 'debutant', 'demarrage', 'diabete', 'ozempic', 'trulicity', 'rybelsus', 'guide-complet'],
    matchCollections: ['glp1-diabete', 'traitements-glp1'],
    affinityTags: ['DT2', 'kit-complet', 'demarrage'],
  },
  {
    id: 'strips-50-with-lancets',
    name: 'Bandelettes Sinocare 50 pcs + lancettes',
    shortDesc: '50 bandelettes test glycémie + lancettes gratuites',
    fullDesc: '50 bandelettes de test de glycémie Sinocare avec lancettes incluses. Compatibles glucomètres Sinocare Safe AQ.',
    category: 'strips',
    imageUrl: 'https://en.sinocare.com/cdn/shop/files/strips-50-hero.png',
    priceFromEur: 16.99,
    rating: 4.8,
    awinUedUrl: 'https://en.sinocare.com/fr/products/sinocare-blood-glucose-test-strips',
    matchSlugs: ['cout', 'prix', 'remboursement', 'mutuelle', 'pharmacie', 'consommable', 'achat', 'espagne', 'allemagne', 'belgique', 'portugal', 'cross-border'],
    matchCollections: ['glp1-cout', 'glp1-diabete'],
    affinityTags: ['DT2', 'consommable', 'recurrent'],
  },
  {
    id: 'strips-100',
    name: 'Bandelettes Sinocare 100 pcs',
    shortDesc: '100 bandelettes + lancettes — pack économique',
    fullDesc: 'Pack 100 bandelettes Sinocare + lancettes gratuites. Économie pour le suivi long terme du diabète.',
    category: 'strips',
    imageUrl: 'https://en.sinocare.com/cdn/shop/files/strips-100-hero.png',
    priceFromEur: 27.99,
    rating: 5.0,
    awinUedUrl: 'https://en.sinocare.com/fr/products/100pcs-sinocare-blood-glucose-test-strips-with-free-lancets',
    matchSlugs: ['economie', 'long-terme', 'remboursement', 'cout', 'cher', 'pharmacie', 'pack'],
    matchCollections: ['glp1-cout', 'glp1-diabete'],
    affinityTags: ['DT2', 'consommable', 'pack-eco', 'long-terme'],
  },
  {
    id: 'strips-200',
    name: 'Bandelettes Sinocare 200 pcs',
    shortDesc: '200 bandelettes — stock 6 mois',
    fullDesc: 'Pack 200 bandelettes Sinocare avec lancettes. Stock pour 6 mois de suivi quotidien.',
    category: 'strips',
    imageUrl: 'https://en.sinocare.com/cdn/shop/files/strips-200-hero.png',
    priceFromEur: 49.99,
    rating: 5.0,
    awinUedUrl: 'https://en.sinocare.com/fr/products/200pcs-sinocare-glucometer-glucose-test-strips-with-free-lancets',
    matchSlugs: ['stock', 'voyage', 'expatrie', 'long-terme'],
    matchCollections: ['glp1-cout', 'glp1-diabete'],
    affinityTags: ['DT2', 'consommable', 'pack-eco', 'voyage'],
  },
  {
    id: 'bp-monitor-arm',
    name: 'Tensiomètre Sinocare bras',
    shortDesc: 'Tensiomètre haut du bras — double mémoire',
    fullDesc: 'Tensiomètre Sinocare brassard bras, mode double utilisateur, 99 mémoires/profil. Détection arythmie. Marquage CE.',
    category: 'bp_monitor',
    imageUrl: 'https://en.sinocare.com/cdn/shop/files/bp-monitor-arm-hero.png',
    priceFromEur: 34.99,
    rating: 4.9,
    awinUedUrl: 'https://en.sinocare.com/fr/products/tensiometre-au-bras-sinocare',
    matchSlugs: ['cardiovasculaire', 'tension', 'coeur', 'hypertension', 'cardio', 'effets-secondaires', 'wegovy', 'mounjaro', 'menopause', 'perte-de-poids', 'syndrome-metabolique', 'insuffisance-cardiaque'],
    matchCollections: ['effets-secondaires-glp1', 'glp1-perte-de-poids', 'recherche-glp1', 'traitements-glp1'],
    affinityTags: ['cardio', 'comorbidite', 'suivi-tension', 'menopause'],
  },
  {
    id: 'insulin-needles',
    name: 'Aiguilles stylo insuline Sinocare 32G 4mm',
    shortDesc: '100 aiguilles 32G 4mm pour stylos GLP-1',
    fullDesc: 'Boîte de 100 aiguilles 32G 4mm compatibles stylos injecteurs (Ozempic, Wegovy, Mounjaro, Trulicity, Victoza). Fines, indolores.',
    category: 'insulin_needles',
    imageUrl: 'https://en.sinocare.com/cdn/shop/files/insulin-needles-hero.png',
    priceFromEur: 14.99,
    rating: 5.0,
    awinUedUrl: 'https://en.sinocare.com/fr/products/aiguilles-pour-stylo-a-insuline-sinocare',
    matchSlugs: ['injection', 'injecter', 'piqure', 'stylo', 'aiguille', 'douleur', 'comment-s-injecter', 'conservation', 'voyage', 'nouveau-stylo'],
    matchCollections: ['traitements-glp1'],
    affinityTags: ['injection', 'consommable-stylo', 'pratique'],
  },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

/**
 * Construit l'URL Awin trackée pour un produit, un placement, et un slug d'article.
 * Format : awin1.com/cread.php?awinmid=MID&awinaffid=AFFID&clickref=CLICKREF&ued=ENCODED_URL
 */
export function buildAwinUrl(productId: string, placement: string, slug?: string): string {
  const p = SINOCARE_PRODUCTS.find(x => x.id === productId);
  if (!p) {
    // eslint-disable-next-line no-console
    console.warn(`[sinocare] product not found: ${productId}`);
    return '#';
  }
  const slugPart = slug ? slugify(slug) : 'site';
  const clickref = `glp1france_${slugify(placement)}_${slugify(productId)}_${slugPart}`.slice(0, 80);
  return `https://www.awin1.com/cread.php?awinmid=${AWIN_MID}&awinaffid=${AWIN_AFFID}&clickref=${encodeURIComponent(clickref)}&ued=${encodeURIComponent(p.awinUedUrl)}`;
}

/**
 * Retourne les produits les plus pertinents pour un article donné,
 * triés par score d'affinité (matchSlugs + matchCollections).
 */
export function getProductsForArticle(slug: string, collection?: string, limit = 3): SinocareProduct[] {
  const lowerSlug = slug.toLowerCase();
  const scored = SINOCARE_PRODUCTS.map(p => {
    let score = 0;
    for (const m of p.matchSlugs) {
      if (lowerSlug.includes(m)) score += 2;
    }
    if (collection && p.matchCollections.includes(collection)) score += 3;
    return { p, score };
  });
  return scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.p);
}

export function getProductById(id: string): SinocareProduct | undefined {
  return SINOCARE_PRODUCTS.find(p => p.id === id);
}
