# Audit SEO général — 17/08/2026 (demande Robin : « plan d'amélioration rapidement »)

Données : GSC 28 j (18/07 → 15/08, sync réparée le 17/08), GA à jour, repo au commit d09e24e, checks live du jour.

## Verdict en 5 chiffres

| Constat | Chiffre | Lecture |
|---|---|---|
| URLs dans le sitemap | **25 284** | dont ~22 000 pages pharmacies programmatiques |
| Pages ayant eu ≥ 1 impression Google en 28 j | **1 631 (6,5 %)** | 93,5 % du site est invisible pour Google |
| Requêtes ≥ 100 imp avec 3+ pages du site en concurrence | **42 sur 61 (69 %)** | cannibalisation massive sur les requêtes qui comptent |
| Articles publiés sans aucune impression 28 j | **~130 sur ~206** | les 2/3 du vrai contenu ne produisent rien |
| Pages money effondrées | prix-mounjaro pos **27**, prix-wegovy pos **41** | les 2 pages qui faisaient ~220 clics/sem en juin sont pages 3-4 |

**Diagnostic d'ensemble** : le socle technique est sain (canonicals, robots, sitemap, noindex admin, redirects — tout vérifié OK aujourd'hui). Le problème est **structurel et de confiance** : après la suspension de juin, Google a rétrogradé le domaine ; or 94 % de l'index soumis est constitué de pages programmatiques quasi identiques dont 93 % ne sont jamais montrées. Ce poids mort dilue le crawl et la qualité perçue du domaine précisément au moment où il faut la reconstruire. S'y ajoutent une cannibalisation interne sur 2/3 des requêtes à volume et un déficit d'autorité (backlinks) jamais comblé.

## Détail par dimension

### 1. Indexation & architecture (LE problème n°1)
- Cluster pharmacies : ~22 000 URLs, **1 546 actives (7 %)**, 12 614 imp / **171 clics en 28 j**.
  - Sous-cluster **pages prix ville/dept : 227 actives, 2 820 imp, 57 clics (CTR 2 %)** → la seule partie qui travaille.
  - Pages pharmacie individuelles (~20 100) : ~1 300 actives, ~114 clics/28 j → **0,005 clic/page/mois**. Contenu quasi dupliqué (nom + adresse + mêmes prix officiels partout).
- Collections (le contenu editorial) : 74 pages actives seulement, mais **25 576 imp** (2× le cluster pharmacies avec 100× moins de pages).
- Conclusion : l'essentiel de la valeur SEO vient de ~75 pages ; 24 000 URLs consomment du budget de crawl et envoient un signal qualité médiocre.

### 2. Cannibalisation (problème n°2)
- 42 requêtes ≥ 100 imp/28 j servies par 3+ pages. Exemples mesurés : « ozempic prix france » 14 pages, « ozempic prix pharmacie » 19 pages, « ozempic sans ordonnance » 4 pages (l'article dédié pos 27-31 pendant que prix-ozempic-france capte à pos 8-13).
- Effet : positions instables, aucun consensus de page canonique côté Google, CTR dilué.

### 3. Positions des pages money
- prix-mounjaro-france : 143 imp / 0 clic / pos 27 (14-15/08) — vs ~125 clics/sem en juin.
- prix-wegovy-france : pos ~41 — vs ~92 clics/sem en juin.
- wegovy-remboursement-mutuelle : absente du top (60 clics/sem en juin).
- Actions déjà faites aujourd'hui : ancres contextuelles depuis la carte des prix (PR #125). Restent : réindexation manuelle (Robin), consolidation cannibalisation, autorité.

### 4. On-page
- 156/220 fichiers sans `seoTitle` dédié (fallback sur `title`, souvent keyword-stuffé sur les articles de mars : « GLP-1 Grossesse Fertilité Ozempic : Risques et Conseils »).
- Priorité : ne PAS traiter les 156 aveuglément — traiter d'abord les ~74 pages qui ont des impressions (impact réel), au rythme C1.

### 5. E-E-A-T
- Bylines humaines probablement fictives encore présentes : **« Julien Lefèvre » (11 articles)**, « Sophie D. », « Marie L. », « Laurent M. », « Karim Benali » (1 chacun). Risque légal/E-E-A-T signalé depuis le 14/07 — à neutraliser (→ « Rédaction GLP-1 France »).
- 14 brouillons `published: false` dont 7 avec placeholders de template — à purger ou finaliser (décision en attente depuis le 16/08).
- Points positifs : sources citées dans les articles récents, dates de mise à jour réelles, pas de fausse expérience.

### 6. Technique (RAS — vérifié aujourd'hui)
- Canonicals corrects (home, articles, pages pharmacies), robots.txt propre (admin bloqué + noindex meta confirmé), sitemap déclaré et à jour, redirect zepbound→mounjaro 301, home 200. Crawl-delay inutile pour Google mais inoffensif.

### 7. Autorité (déficit de fond)
- Outreach backlinks : 2 emails envoyés le 11/08 (CNAO, Ligue contre l'obésité), 0 réponse. C'est tout.
- Après une pénalité de confiance, c'est le levier le plus différenciant et le moins travaillé du site.

## PLAN D'AMÉLIORATION (priorisé, avec qui fait quoi)

### P0 — Décisions structurantes (Robin, cette semaine)

1. **Dégraisser l'index programmatique** — la recommandation forte de cet audit. Passer en `noindex` + retirer du sitemap les pages pharmacie INDIVIDUELLES sans clic sur 28 j (~19 800 pages), en GARDANT : les 906 pages prix ville/dept, les hubs villes/CP, et toute page individuelle ayant eu ≥ 1 clic. Effet attendu : budget de crawl et signal qualité reconcentrés sur ~2 000 URLs utiles ; réversible à tout moment. Risque accepté : ~100 clics/28 j du long tail individuel. **[décision : « go dégraissage » / « non »]**
2. **Chantier cannibalisation** : go pour traiter les 42 requêtes multi-pages, 5/jour par la routine (choix de la canonique, ajustement des titles concurrents, maillage convergent). **[« go cannibalisation »]**
3. **Réindexation manuelle** (2 min) : Inspection d'URL → « Demander une indexation » pour prix-mounjaro-france, prix-wegovy-france, wegovy-remboursement-mutuelle, regime-mounjaro-optimal.
4. **Bylines fictives → « Rédaction GLP-1 France »** (15 fichiers). **[« go bylines »]**
5. **Brouillons** : « supprime » ou « pipeline » (en attente depuis le 16/08).

### P1 — Routine (démarre dès demain, sans besoin de Robin)

6. **seoTitle/seoDescription des ~74 pages à impressions** (série C1, 3-5/jour, les plus vues d'abord).
7. **Réactivation des ~130 articles invisibles** : par lots de 5 — refresh daté + maillage entrant depuis les pages actives + file GSC ; fusion/suppression proposée pour les doublons résiduels.
8. **Backlinks vague 2** : drafts prêts au prochain run (associations patients, annuaires santé, presse santé FR) — envoi direct sur le modèle de la vague 1 sauf veto.
9. **Suivi** : section « PLAN RECOVERY » dans chaque rapport quotidien : positions des 4 pages effondrées, avancement cannibalisation (x/42), articles réactivés (x/130), réponses outreach.

### Ce qui n'est PAS le problème (ne pas y perdre de temps)
- Technique on-site (canonicals, sitemap, robots, redirects) : sain.
- Vitesse de publication : le plan de contenu a couvert les requêtes à demande mesurée ; publier plus n'adressera pas la rétrogradation.
- Le sous-cluster pages prix ville/dept : il travaille (CTR 2 %) — le conserver tel quel.

## Séquencement proposé

- **J0 (aujourd'hui)** : audit livré ; ancres carte→pages money déjà en prod ; demandes P0 posées.
- **J+1 → J+7** : sur go Robin — dégraissage préparé en PR dédiée (généré + testé en build avant merge) ; cannibalisation 5 requêtes/jour ; bylines ; C1 en série ; backlinks vague 2.
- **J+14** : point d'étape chiffré (positions pages money, % pages actives, clics/28 j) dans le rapport quotidien.
- **J+30** : verdict du dégraissage (impressions/clics du cluster conservé vs avant).
