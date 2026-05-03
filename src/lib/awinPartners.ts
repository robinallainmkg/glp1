// Registry centralisé des partenaires affiliés Awin (compte 2879557, robinallainmkg@gmail.com).
//
// Comment utiliser :
//   import { getAwinPartner, isPartnerActive } from '../lib/awinPartners';
//   const lesFurets = getAwinPartner('lesfurets');
//   if (lesFurets.active) { /* render real CTA */ } else { /* fallback honnête */ }
//
// Quand un advertiser passe ACTIVE :
//   1. Récupérer le deeplink final via Awin Link Builder (Generate a Link → choose advertiser)
//   2. Mettre à jour `awinmid`, `deeplinkUrl`, et passer `active: true` ici
//   3. Ajouter `awinmid` dans AffiliateTracker.AWIN_MID_TO_PARTNER (sinon clics = "awin_unknown")
//   4. Le composant CTA dédié (ex: LesFuretsCTA) bascule automatiquement en mode "live"

export type IntentBucket =
  | "mutuelle"           // remboursement, comparateur mutuelle
  | "prescription"       // téléconsultation, ordonnance, médecin
  | "cross_border"       // pharmacie EU, cross-border
  | "diabetes"           // suivi glycémie DT2
  | "supplements"        // compléments minceur/digestifs
  | "cosmetics";         // cosmétique anti-âge

export interface AwinPartner {
  id: string;
  awinmid: string;
  name: string;
  intent: IntentBucket;
  active: boolean;          // true quand validation Awin reçue + deeplink testé
  deeplinkBase: string;     // sans clickref ; clickref ajouté à l'usage
  ued: string;              // landing page (encoded à l'usage)
  cpaEstimate: string;      // pour reporting interne (info)
  notes?: string;
}

const AWIN_AFFID = "2879557";

function buildDeeplink(awinmid: string, ued: string, clickref: string): string {
  return (
    `https://www.awin1.com/cread.php?awinmid=${awinmid}` +
    `&awinaffid=${AWIN_AFFID}` +
    `&clickref=${encodeURIComponent(clickref)}` +
    `&ued=${encodeURIComponent(ued)}`
  );
}

export function awinDeeplink(partner: AwinPartner, clickrefContext: string): string {
  const clickref = `glp1france_${clickrefContext}`;
  return buildDeeplink(partner.awinmid, partner.ued, clickref);
}

// ----------------------------------------------------------------------------
// Registre des partenaires (mai 2026)
// ----------------------------------------------------------------------------

export const AWIN_PARTNERS: Record<string, AwinPartner> = {
  sinocare: {
    id: "sinocare",
    awinmid: "114180",
    name: "Sinocare",
    intent: "diabetes",
    active: true,
    deeplinkBase: "https://www.awin1.com/cread.php",
    ued: "https://www.sinocare.com/",
    cpaEstimate: "8-15% commission produit",
    notes: "Lecteurs glycémie + bandelettes. Active depuis avril 2026.",
  },

  // ⏳ EN ATTENTE DE VALIDATION — passer `active: true` une fois validé
  lesfurets: {
    id: "lesfurets",
    awinmid: "TBD",
    name: "LesFurets",
    intent: "mutuelle",
    active: false,
    deeplinkBase: "https://www.awin1.com/cread.php",
    ued: "https://www.lesfurets.com/mutuelle-sante",
    cpaEstimate: "30-80€/lead mutuelle",
    notes: "Comparateur assurance/mutuelle FR. Cible : pages prix/remboursement.",
  },

  doktorabc: {
    id: "doktorabc",
    awinmid: "TBD",
    name: "DoktorABC",
    intent: "prescription",
    active: false,
    deeplinkBase: "https://www.awin1.com/cread.php",
    ued: "https://www.doktorabc.com/fr/",
    cpaEstimate: "15-40€/consultation",
    notes: "Téléconsultation médicale + prescription. Cible : pages prescription/médecins.",
  },

  docmorris: {
    id: "docmorris",
    awinmid: "TBD",
    name: "DocMorris",
    intent: "cross_border",
    active: false,
    deeplinkBase: "https://www.awin1.com/cread.php",
    ued: "https://www.docmorris.fr/",
    cpaEstimate: "5-10% commission panier",
    notes: "Pharmacie en ligne UE (basée NL/DE). Cible : 5 articles cross-border.",
  },

  redcare: {
    id: "redcare",
    awinmid: "TBD",
    name: "Redcare Pharmacie",
    intent: "cross_border",
    active: false,
    deeplinkBase: "https://www.awin1.com/cread.php",
    ued: "https://www.redcare-pharmacie.fr/",
    cpaEstimate: "5-10% commission panier",
    notes: "Pharmacie en ligne UE (ex Shop Apotheke). Backup DocMorris.",
  },

  sensilab: {
    id: "sensilab",
    awinmid: "TBD",
    name: "Sensilab",
    intent: "supplements",
    active: false,
    deeplinkBase: "https://www.awin1.com/cread.php",
    ued: "https://www.sensilab.fr/",
    cpaEstimate: "10-25% commission produit",
    notes: "Compléments minceur. Cible : pages régime/perte-de-poids (cross-sell, low priority).",
  },

  slimeafit: {
    id: "slimeafit",
    awinmid: "TBD",
    name: "Slimeafit",
    intent: "supplements",
    active: false,
    deeplinkBase: "https://www.awin1.com/cread.php",
    ued: "https://www.slimeafit.com/",
    cpaEstimate: "10-25% commission produit",
    notes: "Compléments minceur. Cross-sell régime, low priority.",
  },
};

export function getAwinPartner(id: string): AwinPartner | null {
  return AWIN_PARTNERS[id] ?? null;
}

export function isPartnerActive(id: string): boolean {
  return AWIN_PARTNERS[id]?.active === true;
}

// Retourne le 1er partenaire actif pour une intention donnée (ou null)
export function getActivePartnerForIntent(intent: IntentBucket): AwinPartner | null {
  for (const p of Object.values(AWIN_PARTNERS)) {
    if (p.active && p.intent === intent) return p;
  }
  return null;
}

// Map awinmid → partner.id pour AffiliateTracker (synchroniser manuellement ou exporter)
export function getAwinmidToIdMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of Object.values(AWIN_PARTNERS)) {
    if (p.awinmid && p.awinmid !== "TBD") map[p.awinmid] = p.id;
  }
  return map;
}
