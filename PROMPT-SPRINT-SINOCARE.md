# Sprint 4 semaines — Full test monétisation Sinocare via Awin

Copie/colle TOUT ce qui suit dans une nouvelle session Claude Code. Le repo est dans `C:\Users\robin\glp1\glp1`. Supabase MCP, Google Service Account, Awin (advertiser ID Sinocare 114180) sont déjà configurés.

---

## Mission

Saturer le site glp1-france.fr de mentions naturelles de produits Sinocare dans le contenu des articles, avec **8 types de placements différents** et **6-7 produits différents** mappés à l'intent de chaque article. L'objectif : remplacer le banner publicitaire (CTR 0,17%) par des **mentions contextuelles natives** qui peuvent atteindre 1-3% de CTR. Mesurer le ROI sur 4 semaines avec tracking `clickref` granulaire.

**Tu n'es pas un agent autonome — tu présentes ton travail, le user valide, tu commit/push.**

## Contexte projet (lire d'abord)

- `CLAUDE.md` à la racine (règles projet, stack, ne pas réintroduire Charles, etc.)
- `MEMORY.md` dans `C:\Users\robin\.claude\projects\C--Users-robin-glp1-glp1\memory\` (état stratégique)

**Stack** : Astro 4 static, Hostinger FTP, build via `npm run astro:build`. **NE PAS** changer en SSR/hybrid.

**Branche unique** : `main`. Push = deploy auto via GitHub Actions (~3-5 min en scoped mode, ~30 min en full sync si fichier shared touché).

**État monétisation actuel** :
- **Sinocare** = seul advertiser Awin actif (mid 114180, EPC 0,17€, CR 7,12%)
- **Annette** = lien direct (pas Awin), top performer actuel à 15 clics/10j sur pages régime/effets/perte-poids
- **Banner Sinocare global** sur toutes les pages (BaseLayout, StaticLayout, UnifiedLayout) — CTR très bas
- **Sidebar + inline + bottom CTAs** sur pages GLP-1 (regex large)
- **GlucoPulse** en pause (page orpheline `/produits/glucopulse/`, ne PAS réactiver)
- **Sensilab** validé Awin mais pas encore intégré (awinmid à venir du user)
- **GA4** synced via service account (`scripts/sync-analytics.mjs`, voir `C:\Users\robin\.gcloud\README.md`)

## Phase 1 — Catalogue produits Sinocare (jour 1, ~2h)

### 1.1 Récupérer le catalogue Awin
Demande au user de te fournir, via son dashboard Awin (programme Sinocare 114180) :
- Liste des produits avec **deeplinks Awin individuels** (pas le générique vers sinocare.com)
- Images officielles
- Prix indicatifs
- Catégorie (lecteur / bandelettes / tensiomètre / balance / oxymètre / thermomètre)

Si le user n'a pas le temps, propose des produits cibles à partir des connaissances génériques (Safe AQ Smart, Safe AQ Voice, AOJ-30A tensiomètre, AOJ-50A balance, oxymètre, thermomètre IR). Marque-les comme `awinmid_TBD` dans le code, à remplacer plus tard.

### 1.2 Créer `src/lib/sinocareProducts.ts`
Structure :
```ts
export interface SinocareProduct {
  id: string;
  name: string;
  shortDesc: string;
  category: 'glucometer' | 'strips' | 'bp_monitor' | 'scale' | 'oximeter' | 'thermometer';
  imageUrl: string;          // public/images/sinocare/<id>.jpg
  priceEur: number;
  awinDeeplink: string;      // URL complète Awin avec awinmid + awinaffid
  matchSlugs: string[];      // regex partiels pour matcher articles pertinents
  matchCollections: string[]; // 'glp1-diabete', 'glp1-perte-de-poids', etc.
}

export const SINOCARE_PRODUCTS: SinocareProduct[] = [
  { id: 'safe-aq-smart', name: 'Safe AQ Smart', category: 'glucometer',
    matchSlugs: ['ozempic', 'trulicity', 'victoza', 'rybelsus', 'diabete', 'glycemie'],
    matchCollections: ['glp1-diabete'],
    /* ... */
  },
  // ...
];

// Helper : retourne les produits adaptés à un article donné
export function getProductsForArticle(slug: string, collection?: string): SinocareProduct[];

// Helper : génère deeplink avec clickref unique
export function buildAwinUrl(product: SinocareProduct, placement: string, slug: string): string;
```

## Phase 2 — 8 composants Astro réutilisables (jour 2-3, ~1 jour)

Crée dans `src/components/sinocare/` (nouveau dossier) :

### `ProductMention.astro`
Mention inline dans un paragraphe (lien hyperlinké court). Pour insertion dans markdown via syntaxe MDX ou via composant import.
```html
<ProductMention productId="safe-aq-smart" placement="inline" />
→ rendu : <a href="awin..." rel="sponsored">Sinocare Safe AQ Smart</a>
```

### `ProductCard.astro`
Carte minimaliste avec image + titre + prix + CTA bouton. Pour intégrer en bordure d'article (entre 2 paragraphes).

### `ProductCompare.astro`
Encart "Comparer 3 produits" avec table (modèle / prix / specs / lien chacun).

### `ProductBulletList.astro`
Liste à puces avec produit en première ligne, link inline naturel.

### `ProductCallout.astro`
Encart vert/orange "💡 Pratique" avec recommandation produit (style médical, factuel).

### `ProductImageWithCaption.astro`
Visuel produit + caption + lien (style éditorial).

### `DoctorQuote.astro` ⚠️
Citation médecin avec mention produit. **À utiliser SEULEMENT pour des produits avec recommandation médicale réelle**, pas fake. Tu peux citer le **Dr Marie Dubois** (auteure du site, voir `/auteurs/dr-marie-dubois/`) **uniquement si la recommandation est factuelle** ("le Dr. Dubois recommande à ses patients DT2 sous Trulicity un lecteur fiable comme [link]"). Pas de fausse autorité.

### `ProductFooter.astro`
Encart en fin d'article style "Le matériel mentionné dans cet article : [3 liens produits]". Comme une bibliographie de produits.

**Pour chaque composant** :
- Image + texte + lien Awin
- `clickref` unique : `glp1france_<componentType>_<productId>_<articleSlug>`
- Disclosure "lien sponsorisé" en petit
- `rel="sponsored noopener"` `target="_blank"`
- Styles scoped CSS (PAS d'inline styles, leçon du audit précédent)
- Responsive mobile
- Pas plus de 80-120 lignes par composant

## Phase 3 — Audit des 80 articles top trafic (jour 4)

Query Supabase pour obtenir les 80 pages article les plus visitées (30 derniers jours) :
```sql
SELECT page_path, SUM(sessions) AS sessions
FROM ga_metrics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  AND page_path ~ '^/collections/'
GROUP BY page_path
ORDER BY sessions DESC LIMIT 80;
```

Pour chaque article :
1. Lire le markdown source (`src/content/<collection>/<slug>.md`)
2. Identifier 2-4 emplacements naturels pour mentions produit
3. Choisir le produit Sinocare matché via `getProductsForArticle()`
4. Choisir le type de placement (varier les 8 types pour pouvoir comparer)
5. Préparer un commit avec les modifications

**Règles éditoriales (importantes)** :
- ✅ Mention factuelle : "Beaucoup de patients utilisent un lecteur connecté type Sinocare Safe AQ Smart"
- ✅ Contextuelle : si l'article parle d'hypoglycémie, mentionner naturellement la surveillance glycémique
- ❌ Pas de surenchère : pas plus de 3 mentions Sinocare par article (sinon ça fait pub agressive)
- ❌ Pas de fausses citations médicales
- ❌ Pas de "achetez maintenant !!" — ton éditorial
- ✅ Disclosure : footer "lien sponsorisé" sur chaque mention

## Phase 4 — Implémentation par sprints

### Sprint 1 (semaine 1) — 20 articles top trafic
Concentre sur les pages qui font le plus de sessions :
- prix-mounjaro-france (622 sess/10j)
- prix-wegovy-france (349)
- prix-ozempic-france (230)
- wegovy-remboursement-mutuelle (250)
- carte-prix-pharmacies (204) — pas un article mais reformuler le widget partenaire
- guide-complet-ozempic (DT2 fit fort)
- guide-complet-trulicity, victoza, rybelsus
- glp1-perte-de-poids/* (audience balance Sinocare AOJ-50A)
- effets-secondaires-mounjaro
- 10 autres

**Pour chaque article modifié** : commit message clair, message format :
```
feat(content): integrate Sinocare mentions in <article-slug>

- <X> placements : <list types>
- Products mentioned: <list products>
- Tracking : <list clickref patterns>
```

### Sprint 2 (semaine 2) — Extension 40 articles
Tous les guides traitements + articles régime + effets secondaires + DT2.

### Sprint 3 (semaine 3) — Analyse
**Query Supabase + dashboard Awin** :
```sql
-- Clics par placement type + produit
SELECT 
  campaign, -- = clickref pattern
  COUNT(*) AS clicks,
  COUNT(DISTINCT page_url) AS unique_pages,
  COUNT(DISTINCT session_id) AS sessions
FROM affiliate_clicks
WHERE partner = 'sinocare' AND created_at >= '2026-05-12'  -- start sprint
GROUP BY campaign
ORDER BY clicks DESC;
```

Croiser avec **Awin dashboard** (conversions, EPC, commission par `clickref`). Identifier :
- Top 5 placement types (par clicks et par CR)
- Top 5 products (par revenue)
- Top 5 articles monétisés
- Bottom 5 placements flops (à retirer)

### Sprint 4 (semaine 4) — Optimisation
- Retirer les placements zéro
- Doubler les top 3 placements sur 20 articles supplémentaires
- A/B test wording sur les top mentions (2 variantes pour les 5 articles les plus visités)

## Phase 5 — Livrables finaux

Produit pour le user à la fin :
- `SPRINT-SINOCARE-RAPPORT.md` à la racine : 
  - Trafic mensuel projeté + actuel
  - Clics Sinocare avant/pendant/après sprint
  - Revenu généré (Awin commission)
  - Top placements / produits / articles
  - Recommandations pour le mois suivant
- `src/lib/sinocareProducts.ts` configuré et maintenu à jour
- 80 articles modifiés avec mentions produit naturelles
- 8 composants Astro réutilisables propres
- Documentation `src/components/sinocare/README.md` pour usage futur

## Garde-fous critiques

- **NE JAMAIS** réactiver Charles ou réintroduire `CharlesCTA`
- **NE JAMAIS** réactiver GlucoPulse comme produit (page orpheline OK, mais aucun entry point)
- **PAS** de fausses citations médicales (E-E-A-T YMYL santé)
- **TOUJOURS** disclosure "sponsorisé" sur les liens affiliés
- **NE PAS** dépasser 3 mentions Sinocare par article
- **NE PAS** modifier la nav (SiteHeader / SiteFooter) sans demande explicite
- **NE PAS** toucher au sync GA / service account (déjà OK)
- **NE PAS** commiter `secrets/` ou clés
- **NE PAS** push sans build local OK
- **VÉRIFIER** visuellement chaque article modifié (Claude in Chrome ou preview) avant commit
- **DEPLOYER PAR SPRINT** (1 commit par batch d'articles, pas un commit géant)

## Tools disponibles

- Tous les outils Read/Edit/Write/Glob/Grep/Bash
- Supabase MCP (`mcp__100191b9-c65d-4d9c-9c03-438c9d242175__execute_sql`)
- Google Analytics via `scripts/sync-analytics.mjs --days 30`
- Claude in Chrome pour la vérif visuelle
- WebSearch pour vérifier specs produits Sinocare
- WebFetch pour récupérer info Awin dashboard si dispo

## Pour démarrer

1. **Lire** `CLAUDE.md`, `MEMORY.md`, ce fichier complet
2. **Demander au user** :
   - L'awinmid Sensilab (si dispo, pour intégration optionnelle parallèle)
   - Le catalogue produits Awin avec deeplinks (idéalement screenshot du Link Builder Awin)
   - L'accord pour démarrer le Sprint 1
3. **Setup phase 1** : créer `src/lib/sinocareProducts.ts` avec ce qu'on a (deeplinks à compléter)
4. **Présenter le plan détaillé** au user pour validation avant de toucher les articles markdown
