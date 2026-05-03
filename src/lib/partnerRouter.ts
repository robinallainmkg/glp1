// Routage partenaire selon l'intention du visiteur déduite du chemin / collection / slug.
// PIVOT 2026-05 : Charles retiré (CPA 19€ qui ne convertit pas, mismatch d'intention).
// Remplacé par "mutuelle" (CPA 50-150€/lead via Awin — Magnolia, Acheel, Apicil, Henner, Alan).
//
// annette  = accompagnement nutritionnel (CPA 50€) — pages "comprendre / suivre / régime"
// mutuelle = guide / comparateur mutuelle qui rembourse GLP-1 — pages "prix / remboursement / accès"

export type Partner = "annette" | "mutuelle";

// Slugs des "destinations" — pages vers lesquelles les CTAs partenaires pointent.
// Si l'utilisateur est DÉJÀ sur une destination, le CTA correspondant créerait un self-loop.
// Dans ce cas on bascule vers le partenaire opposé pour éviter de renvoyer vers la même page.
const MUTUELLE_DESTINATION_SLUGS = new Set<string>([
  "wegovy-remboursement-mutuelle",
  // Ajouter ici les autres pages cibles des CTAs mutuelle si on en crée
]);

const ANNETTE_DESTINATION_SLUGS = new Set<string>([
  // Annette = lien externe annette.care, pas de self-loop possible
  // (laissé vide intentionnellement)
]);

const MUTUELLE_COLLECTIONS = new Set<string>([
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

const MUTUELLE_SLUG_HINTS = [
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
  "secu",
  "ameli",
  "has",
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

  // Anti-self-loop : si on est sur une page de destination, on ne propose pas le CTA
  // qui pointerait vers cette même page.
  const onMutuelleDestination = MUTUELLE_DESTINATION_SLUGS.has(sl);
  const onAnnetteDestination = ANNETTE_DESTINATION_SLUGS.has(sl);

  if (onMutuelleDestination) return "annette";
  if (onAnnetteDestination) return "mutuelle";

  if (MUTUELLE_COLLECTIONS.has(col)) return "mutuelle";
  if (ANNETTE_COLLECTIONS.has(col)) return "annette";

  const haystack = `${sl} ${p}`;
  const mutuelleHit = MUTUELLE_SLUG_HINTS.some((h) => haystack.includes(h));
  const annetteHit = ANNETTE_SLUG_HINTS.some((h) => haystack.includes(h));

  if (mutuelleHit && !annetteHit) return "mutuelle";
  if (annetteHit && !mutuelleHit) return "annette";

  // Ambigu ou aucun match : fallback Annette (CPA stable, profil evergreen)
  return "annette";
}

// Indique si la page courante est une "destination" partenaire — utile pour le layout
// pour décider de masquer la sidebar du partenaire correspondant.
export function isPartnerDestination(input: RouteInput): Partner | null {
  const sl = (input.slug || "").toLowerCase();
  if (MUTUELLE_DESTINATION_SLUGS.has(sl)) return "mutuelle";
  if (ANNETTE_DESTINATION_SLUGS.has(sl)) return "annette";
  return null;
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
  return p === "annette" ? "mutuelle" : "annette";
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
