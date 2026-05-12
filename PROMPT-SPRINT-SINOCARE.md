# Full intégration Sinocare — 1 session, tout shippé aujourd'hui

Copie/colle TOUT ce qui suit dans une nouvelle session Claude Code. Le repo est dans `C:\Users\robin\glp1\glp1`. Supabase MCP, Google Service Account, Awin (advertiser ID Sinocare 114180) sont déjà configurés.

---

## Mission

**En UNE session aujourd'hui**, intégrer Sinocare massivement dans le site :
- Catalogue produits avec deeplinks Awin réels (récupérés via le navigateur du user)
- 8 composants Astro réutilisables pour 8 types de placements différents
- Mentions naturelles dans ~30-50 articles top trafic, mixant produits × placements
- Tracking `clickref` granulaire par placement × produit × article
- Build OK, commit propre par batch, push sur main

**Toutes les phases d'analyse + optimisation (semaines suivantes) sont hors scope de cette session.** Tu fais le ship, le user analysera dans 2-3 semaines avec les data Awin + Supabase.

## Contexte projet (lire en premier)

- `CLAUDE.md` à la racine — règles projet, stack, garde-fous
- `MEMORY.md` dans `C:\Users\robin\.claude\projects\C--Users-robin-glp1-glp1\memory\` — état stratégique

**Stack** : Astro 4 static, Hostinger FTP, build via `npm run astro:build`. Push main → deploy auto GitHub Actions.

**État monétisation actuel** :
- **Sinocare** = seul advertiser Awin actif (mid 114180, EPC 0,17€, CR 7,12%)
- **Annette** = top performer actuel (lien direct, ~15 clics/10j) sur pages régime/effets/perte-poids — **NE PAS TOUCHER**
- Banner global Sinocare déjà en prod sur toutes les pages (`SinocareBanner` dans BaseLayout/StaticLayout/UnifiedLayout) → CTR 0,17% (insuffisant, on remplace par mentions naturelles)
- Sidebar + inline + bottom Sinocare sur pages GLP-1 déjà en prod
- **GlucoPulse** en pause, page orpheline `/produits/glucopulse/` — **NE PAS RÉACTIVER**

**Trafic actuel** : ~10 000 sessions/mois, 45% obésité GLP-1, 10% DT2, 20% pharmacies. Top pages : prix-mounjaro (622 sess/10j), prix-wegovy (349), wegovy-remboursement-mutuelle (250), prix-ozempic (230), carte-prix-pharmacies (204).

---

## Phase 1 — Catalogue Awin (30-45 min)

**Le user est déjà loggé** sur son compte Awin Publisher (compte 2879557). Tu navigues toi-même.

### URL exacte du Link Builder
```
https://ui.awin.com/link-builder/fr/awin/publisher/2879557
```

### Procédure (Claude in Chrome)
1. `mcp__Claude_in_Chrome__navigate` → URL ci-dessus
2. Filtrer/chercher advertiser **Sinocare** (mid 114180) — onglet "advertisers" ou search
3. Pour chaque produit (Safe AQ Smart, Safe AQ Voice, Bandelettes, AOJ-30A tensiomètre, AOJ-50A balance, Oxymètre, Thermomètre IR) :
   - Si Awin permet deeplink par URL produit : copier le **deeplink Awin complet** (commence par `https://www.awin1.com/cread.php?awinmid=114180&awinaffid=2879557&clickref=&ued=<URL_produit_sinocare>`)
   - Si pas dispo : utiliser deeplink générique avec ued = page produit sinocare.com correspondante
4. Récupérer aussi : nom produit, prix indicatif, catégorie. Image : si dispo dans Awin Creative Library, screenshot via Claude in Chrome ou note l'URL d'image

### Livrable : `src/lib/sinocareProducts.ts`
```ts
export interface SinocareProduct {
  id: string;
  name: string;
  shortDesc: string;
  category: 'glucometer' | 'strips' | 'bp_monitor' | 'scale' | 'oximeter' | 'thermometer';
  imageUrl?: string;          // URL Awin creative ou local path public/images/sinocare/
  priceEur: number;
  awinUedUrl: string;         // URL Sinocare cible (le `ued` du deeplink, sans le wrapper Awin)
  matchSlugs: string[];       // patterns à matcher dans slugs articles
  matchCollections: string[]; // collections matchées
}

export const SINOCARE_PRODUCTS: SinocareProduct[] = [
  // 6-7 produits remplis avec les vrais deeplinks
];

const AWIN_MID = '114180';
const AWIN_AFFID = '2879557';

export function buildAwinUrl(productId: string, placement: string, slug: string): string {
  const p = SINOCARE_PRODUCTS.find(x => x.id === productId);
  if (!p) return '';
  const clickref = `glp1france_${placement}_${productId}_${slug}`.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return `https://www.awin1.com/cread.php?awinmid=${AWIN_MID}&awinaffid=${AWIN_AFFID}&clickref=${encodeURIComponent(clickref)}&ued=${encodeURIComponent(p.awinUedUrl)}`;
}

export function getProductsForArticle(slug: string, collection?: string): SinocareProduct[] {
  // match slugs + collections, return top 2-3 products relevant
}
```

---

## Phase 2 — 8 composants Astro (1-1h30)

Crée dossier `src/components/sinocare/` avec ces 8 composants. Chacun ~80-120 lignes max, scoped CSS (pas d'inline), responsive, accessible, `rel="sponsored noopener"`, `target="_blank"`, disclosure "Lien sponsorisé" en petit.

### `ProductMention.astro`
Hyperlinked text inline, court (1-2 mots cliquables dans un paragraphe). Pour utilisation en markdown : passer en HTML brut `<a href="..." rel="sponsored">Sinocare Safe AQ Smart</a>` via composant ou directement dans le markdown des articles.

### `ProductCard.astro`
Carte minimaliste 320px max : image + titre + prix + CTA bouton. Insertion entre 2 paragraphes article.

### `ProductCompare.astro`
Table "Comparer X produits" — 2-3 colonnes (modèle / prix / specs principales / CTA chacun).

### `ProductBulletList.astro`
Liste à puces stylée avec premier item = produit Sinocare (hyperlink inline naturel).

### `ProductCallout.astro`
Encart "💡 Pratique" vert pastel (style médical/conseil) avec produit recommandé.

### `ProductImageWithCaption.astro`
Image produit pleine largeur + caption (mode éditorial), avec lien Awin.

### `DoctorQuote.astro` ⚠️
Citation **Dr Marie Dubois** (auteure du site, page `/auteurs/dr-marie-dubois/`) avec mention produit. **Recommandation factuelle uniquement** ("pour le suivi sous Trulicity, j'oriente mes patients vers un lecteur fiable comme [X]"). Pas de fausse autorité ni de claim médical inventé.

### `ProductFooter.astro`
Encart fin d'article style "Matériel mentionné dans cet article" → 2-3 produits cités avec liens, bibliographie de produits.

**Props standard pour TOUS les composants** :
```ts
interface Props {
  productId: string;        // id du SINOCARE_PRODUCTS
  placement: string;        // type placement pour clickref ('inline', 'card', 'compare', etc.)
  slug?: string;            // slug article courant (auto-injecté si possible via Astro.url)
}
```

Chaque composant utilise `buildAwinUrl(productId, placement, slug)` pour générer le lien tracké.

---

## Phase 3 — Audit + mapping articles (30 min)

### Query Supabase pour top trafic
```sql
SELECT page_path, SUM(sessions) AS sessions
FROM ga_metrics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  AND page_path ~ '^/collections/'
GROUP BY page_path
ORDER BY sessions DESC LIMIT 50;
```

### Pareto : viser 30-50 articles qui font 80% du trafic article
Probables top buckets :
- Prix : prix-mounjaro, prix-wegovy, prix-ozempic, prix-saxenda, prix-rybelsus, prix-trulicity, prix-zepbound (7 articles)
- Remboursement : wegovy-remboursement-mutuelle + cluster 8 mutuelles (9 articles)
- Cross-border : 5 articles Espagne/Allemagne/Belgique/Portugal/Europe
- Guides traitements : guide-complet-{ozempic, wegovy, mounjaro, trulicity, victoza, rybelsus, saxenda, zepbound} (8 articles)
- Effets secondaires : effets-mounjaro, wegovy, ozempic + spécifiques (5-8 articles)
- Perte de poids : guides perte-poids (5 articles)
- Régime : régime-mounjaro-optimal, guides alimentation (5 articles)

Total : ~40-50 articles top trafic.

### Mapping produit × placement par bucket
| Bucket article | Produit Sinocare prioritaire | Placement type prioritaire |
|---|---|---|
| Prix DT2 (Ozempic, Trulicity, Victoza, Rybelsus) | Safe AQ Smart + Bandelettes | ProductCard + Callout |
| Prix obésité (Mounjaro, Wegovy, Saxenda, Zepbound) | **AOJ-50A balance** ⭐ + Safe AQ Smart (cross-sell) | ProductCallout + Compare |
| Remboursement / mutuelle | Safe AQ Smart (cher à long terme → suivi mutuelle) | ProductMention inline |
| Cross-border | Pack bandelettes (cher chez l'étranger) | ProductCard + Footer |
| Guides traitements | Lecteur adapté au traitement + Bandelettes | ProductCard + DoctorQuote |
| Effets secondaires (hypo/hyper) | Safe AQ Voice (audio alarmes) | ProductCallout |
| Perte de poids | **AOJ-50A balance** ⭐ + Tensiomètre AOJ-30A | ProductCompare |
| Régime alimentaire | AOJ-50A balance + Glucomètre (suivi post-meal) | ProductBulletList |

### Règle d'or
- **Max 3 mentions Sinocare par article** (sinon ça fait pub agressive)
- Varier les placement types par article (test ANOVA possible)
- Mentions naturelles, contextuelles, jamais agressives

---

## Phase 4 — Implémentation massive dans les articles (2-3h)

**Approche** : modifier les fichiers markdown directement dans `src/content/<collection>/<slug>.md`.

### Workflow par article (~3-5 min/article)
1. Read le markdown source
2. Identifier 2-3 emplacements naturels (entre 2 paragraphes, dans une liste, après un H2 spécifique)
3. Choisir produit via `getProductsForArticle(slug, collection)`
4. Insérer composant via `import` Astro + JSX, OU lien brut HTML pour mentions inline simples
5. Vérifier que le rendu est cohérent (visuel via Claude in Chrome si doute)

### Pour insérer un composant Astro dans un markdown
Dans un .md (avec collections Astro) :
```markdown
---
title: ...
---

Texte d'article...

import ProductCard from '../../components/sinocare/ProductCard.astro';
<ProductCard productId="aoj-50a-balance" placement="card" slug="prix-mounjaro-france" />

Suite du texte...
```

OU plus simple : insérer le lien HTML directement (pas besoin de composant pour ProductMention) :
```markdown
Beaucoup de patients utilisent un [lecteur connecté Sinocare Safe AQ Smart](https://www.awin1.com/cread.php?awinmid=114180&awinaffid=2879557&clickref=glp1france_inline_safe-aq-smart_prix-mounjaro&ued=...) pour suivre l'effet du traitement.
```

**Préférence** : composants Astro pour ProductCard/ProductCompare/ProductCallout/etc. (visuels), liens markdown brut pour ProductMention inline (text-only).

### Batches de commits
Pour faciliter le rollback si problème, **un commit par batch de 5-10 articles** :
- Batch 1 : 7 articles prix
- Batch 2 : 9 articles mutuelles
- Batch 3 : 5 articles cross-border
- Batch 4 : 8 articles guides traitements
- Batch 5 : 6-8 articles effets secondaires
- Batch 6 : 5 articles perte-poids
- Batch 7 : 5 articles régime

Messages de commit format :
```
feat(content): integrate Sinocare mentions in <bucket> (N articles)

- Products: <list>
- Placements: <list types>
- Tracking patterns: glp1france_<placement>_<product>_<slug>
```

---

## Phase 5 — Build + verify + push (30 min)

1. `npm run astro:build` — vérifier 0 erreur
2. Si la session a Claude in Chrome : ouvrir 3-5 articles sur le dev server (localhost:4327) pour vérif visuelle (no broken layout, pas de double lien, disclosure visible)
3. Push final : `git push origin main`
4. Wait deploy (notification GitHub Actions, ~3-5 min en scoped mode)
5. Vérif prod sur 2-3 pages live

---

## Phases suivantes (hors scope cette session, pour info)

- **Semaine 2-3** : laisser tourner, attendre data Awin + Supabase
- **Semaine 4** : analyse query (`affiliate_clicks` par `clickref`), identifier top placements/produits/articles, retirer les flops, doubler les gagnants, A/B test wording

Le user lancera une nouvelle session pour ces phases avec un rapport demandé.

---

## Garde-fous critiques

- **NE JAMAIS** réactiver Charles, CharlesCTA, CharlesSidebar (supprimés)
- **NE JAMAIS** réactiver GlucoPulse (page orpheline volontaire)
- **NE PAS** toucher à Annette (top performer actuel)
- **NE PAS** dépasser 3 mentions Sinocare par article
- **PAS** de fausses citations médicales du Dr Dubois (E-E-A-T YMYL)
- **TOUJOURS** disclosure "lien sponsorisé" visible
- **NE PAS** modifier nav (SiteHeader/Footer) sauf demande explicite
- **NE PAS** toucher au sync GA / service account
- **NE PAS** commit `secrets/`, `.env`, clés
- **NE PAS** push sans build local OK
- **Output Astro reste `static`** (PAS de SSR/hybrid)

## Tools disponibles

- Read/Edit/Write/Glob/Grep/Bash (built-in)
- Supabase MCP (`mcp__100191b9-c65d-4d9c-9c03-438c9d242175__execute_sql`)
- Claude in Chrome (`mcp__Claude_in_Chrome__navigate`, `javascript_tool`, `computer`, `tabs_context_mcp`)
- GA via `scripts/sync-analytics.mjs` (sync déjà à jour)
- WebSearch / WebFetch

## Pour démarrer

1. **Lire** `CLAUDE.md`, `MEMORY.md`, ce fichier entier
2. **Naviguer via Claude in Chrome** sur `https://ui.awin.com/link-builder/fr/awin/publisher/2879557` (user déjà loggé). Récupérer les deeplinks Sinocare.
3. **Setup** : `src/lib/sinocareProducts.ts` avec catalogue rempli
4. **Build les 8 composants** Astro dans `src/components/sinocare/`
5. **Query Supabase** pour la liste des top articles
6. **Implémenter les mentions** dans les articles markdown, batch par batch, avec commit/push par batch
7. **Final** : verify prod + résumé final au user

**Demande au user en début** :
- L'awinmid Sensilab si dispo (pour intégration bonus parallèle)
- Confirmation de proceed sans validation intermédiaire (one-shot ship)
