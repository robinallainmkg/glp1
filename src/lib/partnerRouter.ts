// Routage partenaire selon l'intention du visiteur déduite du chemin / collection / slug.
// annette = accompagnement nutritionnel (CPA 50€) — gagne sur les pages "comprendre / suivre"
// charles = téléconsultation + prescription (CPA 19€) — gagne sur les pages "accéder au traitement"

export type Partner = "annette" | "charles";

const CHARLES_COLLECTIONS = new Set<string>([
  "glp1-cout",
  "medecins-glp1-france",
  "glp1-diabete",
]);

const ANNETTE_COLLECTIONS = new Set<string>([
  "effets-secondaires-glp1",
  "regime-glp1",
  "glp1-perte-de-poids",
  "temoignages",
  "avant-apres-glp1",
]);

const CHARLES_SLUG_HINTS = [
  "prix",
  "cout",
  "tarif",
  "rembours",
  "mutuelle",
  "prescription",
  "ordonnance",
  "medecin",
  "endocrino",
  "centres",
  "centre-",
  "pharmacie",
  "acheter",
  "commander",
  "ou-trouver",
  "disponibilite",
  "penurie",
  "espagne",
  "italie",
  "allemagne",
  "belgique",
  "portugal",
  "europe",
  "etranger",
];

const ANNETTE_SLUG_HINTS = [
  "guide-complet",
  "regime",
  "alimentation",
  "nutrition",
  "menu",
  "recette",
  "effets",
  "nausee",
  "fatigue",
  "temoignage",
  "resultat",
  "avant-apres",
  "perte-de-poids",
];

export interface RouteInput {
  collection?: string;
  slug?: string;
  path?: string;
}

export function getPartnerForArticle(input: RouteInput): Partner {
  const col = (input.collection || "").toLowerCase();
  const sl = (input.slug || "").toLowerCase();
  const p = (input.path || "").toLowerCase();

  if (CHARLES_COLLECTIONS.has(col)) return "charles";
  if (ANNETTE_COLLECTIONS.has(col)) return "annette";

  const haystack = `${sl} ${p}`;
  const charlesHit = CHARLES_SLUG_HINTS.some((h) => haystack.includes(h));
  const annetteHit = ANNETTE_SLUG_HINTS.some((h) => haystack.includes(h));

  if (charlesHit && !annetteHit) return "charles";
  if (annetteHit && !charlesHit) return "annette";

  // Ambigu ou aucun match : fallback Annette (CPA plus élevé, profil evergreen)
  return "annette";
}

export function getPartnerForPath(pathname: string): Partner {
  const p = (pathname || "").toLowerCase();
  const match = p.match(/\/collections\/([^/]+)\//);
  const collection = match?.[1];
  const segs = p.split("/").filter(Boolean);
  const slug = segs[segs.length - 1];
  return getPartnerForArticle({ collection, slug, path: p });
}

export function oppositePartner(p: Partner): Partner {
  return p === "annette" ? "charles" : "annette";
}

// Hash stable dérivé du slug : permet d'alterner l'ordre de la sidebar
// de manière déterministe (même article -> même ordre, différents articles -> ordre varié).
function slugHash(slug?: string): number {
  const s = (slug || "").toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Retourne l'ordre des 2 partenaires dans la sidebar empilée.
// ~50% des articles auront le partenaire routé en premier, ~50% en second.
export function getSidebarOrder(input: RouteInput & { routed?: Partner }): [Partner, Partner] {
  const routed = input.routed ?? getPartnerForArticle(input);
  const other = oppositePartner(routed);
  const flip = slugHash(input.slug || input.path) % 2 === 1;
  return flip ? [other, routed] : [routed, other];
}
