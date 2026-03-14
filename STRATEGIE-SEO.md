# Strategie SEO — GLP-1 France

**Derniere mise a jour** : mars 2026
**Site** : glp1-france.fr
**Stack** : Astro 4.x (static) / Hostinger / Supabase

---

## 1. Etat des lieux du site

### Inventaire du contenu (mars 2026)

| Collection | Articles | Etat |
|---|---|---|
| traitements-glp1 | 8 guides complets | Audite et corrige |
| glp1-cout | 10 articles prix/remboursement | Audite et corrige |
| effets-secondaires-glp1 | 9 articles | Audite et corrige |
| alternatives-glp1 | 14 articles | Audite, ~10 placeholder |
| regime-glp1 | 15 articles | Audite, ~10 placeholder |
| medecins-glp1-france | 5 articles (+ doublons -new) | A nettoyer |
| temoignages | 4 articles | Incomplet |
| glp1-perte-de-poids | 2 articles | Correct |
| recherche-glp1 | 1 article | Insuffisant |
| pages-statiques | 3 articles (homepage, quel-traitement, faq) | Audite et corrige |
| avant-apres-glp1 | 0 (collection vide) | A creer ou supprimer |
| glp1-diabete | 0 (collection vide) | A creer ou supprimer |
| **Pages Astro (guides/)** | 6 pages statiques | Auditees et corrigees |
| **Pages Astro (admin/)** | 3 dashboards | OK |
| **Total** | ~94 fichiers de contenu, 151 pages buildees | — |

### Problemes SEO identifies (audit mars 2026)

1. **Erreurs factuelles corrigees** : 43 fichiers avaient des prix, remboursements ou posologies incorrects — tous corriges
2. **~25 articles placeholder** dans alternatives-glp1 et regime-glp1 avec "XX-XX EUR/mois" — contenu a finaliser ou supprimer
3. **~15 liens internes casses** pointant vers `/glp1-cout/...` au lieu de `/collections/glp1-cout/...`
4. **Fichiers doublons** dans medecins-glp1-france (versions -new a cote des originaux)
5. **Pas de page /guides/index.astro** — l'URL /guides/ renvoie un 404
6. **Champ mainKeyword/secondaryKeywords** dans le schema frontmatter mais utilise dans 1 seul article sur 80+
7. **2 collections vides** (avant-apres-glp1, glp1-diabete) enregistrees dans le schema mais sans contenu
8. **Titres avec "2025"** — a mettre a jour vers 2026

### SEO technique

- Sitemap XML : genere automatiquement par Astro
- Robots.txt : present
- Schema.org : partiellement implemente (a renforcer)
- Core Web Vitals : bon (site statique, chargement rapide)
- Mobile-first : responsive via Tailwind
- HTTPS : oui (Hostinger)
- Meta descriptions : presentes sur la plupart des articles
- Alt text images : variable, a auditer

---

## 2. Recherche de mots-cles

### Mots-cles principaux (volume FR estime)

| Mot-cle | Volume/mois | Difficulte | Intent | Priorite |
|---|---|---|---|---|
| ozempic | 200k+ | Elevee | Mixte | Capter le trafic existant |
| wegovy | 80k+ | Elevee | Mixte | Capter le trafic existant |
| mounjaro | 60k+ | Moyenne | Mixte | Forte croissance |
| ozempic prix | 15k | Moyenne | Transactionnel | Page existante |
| wegovy prix | 10k | Moyenne | Transactionnel | Page existante |
| mounjaro prix france | 8k | Faible | Transactionnel | Page existante |
| ozempic perte de poids | 12k | Elevee | Informationnel | Page existante |
| glp-1 | 5k | Moyenne | Informationnel | Homepage |
| semaglutide | 4k | Moyenne | Informationnel | Guide existant |
| ozempic remboursement | 6k | Faible | Informationnel | Page existante |

### Longue traine prioritaire

| Cluster | Exemples de requetes | Vol. cumule | Pages existantes |
|---|---|---|---|
| Prix / cout | "prix ozempic pharmacie", "cout traitement wegovy par mois", "mounjaro prix en france" | 25k+ | Oui (10 articles glp1-cout) |
| Effets secondaires | "ozempic effets secondaires", "wegovy danger", "mounjaro nausees" | 20k+ | Oui (9 articles) |
| Comparaisons | "ozempic vs wegovy", "mounjaro vs ozempic", "meilleur glp1 pour maigrir" | 10k+ | Non — a creer |
| Remboursement | "ozempic rembourse secu", "wegovy rembourse 2026", "glp1 remboursement mutuelle" | 8k+ | Partiellement |
| Pratique | "ordonnance ozempic", "comment se faire prescrire wegovy", "injection ozempic" | 6k+ | Non — a creer |
| Alternatives | "alternative naturelle ozempic", "berberine glp1", "maigrir sans ozempic" | 5k+ | Oui (14 articles, dont placeholders) |
| Geographique | "endocrinologue paris glp1", "pharmacie wegovy lyon" | 3k+ | 5 articles annuaire — a enrichir |
| Questions | "peut-on acheter ozempic sans ordonnance", "ozempic fait-il maigrir", "glp1 et alcool" | 8k+ | Non — a creer (Featured Snippets) |

### Mots-cles a ne PAS cibler

- "acheter ozempic en ligne" → risque legal, pharmacie en ligne non autorisee
- "ozempic sans ordonnance" → uniquement dans un article expliquant pourquoi c'est illegal
- Tout ce qui encourage l'achat hors circuit medical

---

## 3. Architecture de contenu (silos)

### Silo 1 : Traitements GLP-1 (pilier)

```
/collections/traitements-glp1/
  guide-complet-ozempic.md         ← pilier
  guide-complet-wegovy.md          ← pilier
  guide-complet-mounjaro.md        ← pilier
  guide-complet-saxenda.md
  guide-complet-trulicity.md
  guide-complet-victoza.md
  guide-complet-rybelsus.md
  guide-complet-tirzepatide.md
```

Liens entrants : depuis tous les articles de prix, effets secondaires, comparaisons
Liens sortants : vers pages prix, effets, temoignages du meme medicament

### Silo 2 : Prix et remboursement (transactionnel)

```
/collections/glp1-cout/
  prix-ozempic-france.md
  prix-wegovy-france.md
  prix-mounjaro-france.md
  prix-saxenda-france.md
  prix-trulicity-france.md
  prix-victoza-france.md
  prix-rybelsus-france.md
  prix-zepbound-france.md         ← rediriger vers mounjaro ou disclaimer
  remboursement-glp1-2026.md
  acheter-wegovy-en-france.md
  wegovy-remboursement-mutuelle.md
  saxenda-prix-pharmacie.md
  operation-pour-maigrir-prix.md
  anneau-gastrique-prix-cmu.md
```

### Silo 3 : Effets secondaires et securite

```
/collections/effets-secondaires-glp1/
  effets-secondaires-ozempic.md
  effets-secondaires-wegovy.md
  effets-secondaires-mounjaro.md
  effets-secondaires-saxenda.md
  effets-secondaires-trulicity.md
  effets-secondaires-victoza.md
  effets-secondaires-rybelsus.md
  effets-secondaires-zepbound.md
  ozempic-danger.md
  wegovy-danger.md
  wegovy-dosage.md
```

### Silo 4 : Regime et nutrition sous GLP-1

```
/collections/regime-glp1/
  regime-mediterraneen-glp1.md
  regime-cetogene-glp1.md
  jeune-intermittent-glp1.md
  glp1-proteines.md
  glp1-calories-journalieres.md
  glp1-index-glycemique.md
  ...
```

### Silo 5 : Alternatives naturelles

```
/collections/alternatives-glp1/
  alternatives-naturelles-ozempic.md   ← pilier
  berberine-glp1.md
  vinaigre-cidre-glp1.md
  phytotherapie-glp1.md
  ...
```

### Silo 6 : Pages guides (Astro statiques)

```
/guides/
  guide-complet-wegovy.astro
  guide-complet-mounjaro.astro
  nouveaux-medicaments-perdre-poids.astro
  faq-glp1.astro
  quel-traitement-glp1-choisir.astro
  traitements-glp1-disponibles-france.astro
```

### Maillage interne

Chaque article doit avoir :
- **3 liens minimum** vers d'autres articles du meme silo
- **1-2 liens** vers un article d'un silo complementaire (prix → guide, guide → effets)
- **1 lien** vers la homepage ou une page pilier

---

## 4. Contenu a creer (priorite)

### Priorite 1 — Articles a fort volume, concurrence faible

| Article a creer | Mots-cles cibles | Vol. estime | Format |
|---|---|---|---|
| Ozempic vs Wegovy : quelle difference ? | ozempic wegovy difference, ozempic ou wegovy | 3k/mois | Comparatif + tableau |
| Mounjaro vs Ozempic : lequel choisir en 2026 ? | mounjaro ozempic comparaison | 2k/mois | Comparatif + tableau |
| Peut-on acheter Ozempic sans ordonnance en France ? | acheter ozempic sans ordonnance | 3k/mois | FAQ — Featured Snippet |
| Ozempic fait-il vraiment maigrir ? Resultats et etudes | ozempic maigrir, ozempic perte poids avis | 2k/mois | Guide + etudes |
| Comment se faire prescrire Wegovy en France | prescrire wegovy, ordonnance wegovy | 2k/mois | Guide pratique |
| GLP-1 et alcool : ce qu'il faut savoir | glp1 alcool, ozempic alcool | 600/mois | FAQ — Featured Snippet |
| Combien de temps dure un traitement GLP-1 ? | duree traitement glp1, arreter ozempic | 1k/mois | FAQ — Featured Snippet |
| Formulaire de prescription GLP-1 obligatoire (2025) | formulaire prescription ozempic | 1.5k/mois | Actu + guide pratique |

### Priorite 2 — Renforcer les silos existants

| Article a creer | Silo | Raison |
|---|---|---|
| Ozempic : posologie et injections pas a pas | traitements | Requetes pratiques |
| Wegovy : guide de la titration semaine par semaine | traitements | Requetes pratiques |
| Remboursement GLP-1 en 2026 : etat des lieux complet | glp1-cout | Mise a jour annuelle |
| GLP-1 et grossesse : risques et recommandations | effets-secondaires | Question frequente |
| GLP-1 effets secondaires long terme : ce que disent les etudes | effets-secondaires | Inquietude patient |
| Trulicity vs Ozempic pour le diabete type 2 | comparatifs (nouveau) | Volume moyen |
| Saxenda vs Wegovy : prix et efficacite compares | comparatifs (nouveau) | Volume moyen |

### Priorite 3 — Pages geographiques (SEO local)

| Page | Mots-cles |
|---|---|
| Endocrinologue GLP-1 a Paris : ou consulter ? | endocrinologue paris glp1, prescripteur ozempic paris |
| Endocrinologue GLP-1 a Lyon | endocrinologue lyon glp1 |
| Endocrinologue GLP-1 a Marseille | endocrinologue marseille glp1 |
| Pharmacie Wegovy a Paris : disponibilite et prix | pharmacie wegovy paris |

### Priorite 4 — Collections vides a remplir ou supprimer

| Collection | Decision | Action |
|---|---|---|
| avant-apres-glp1 | Creer 3-5 articles si temoignages reels disponibles | Sinon supprimer la collection |
| glp1-diabete | Creer 5-8 articles specifiques DT2 | Fort potentiel : "glp1 diabete type 2", "ozempic diabete" |

### Priorite 5 — Finaliser les articles placeholder

Les ~25 articles dans alternatives-glp1 et regime-glp1 qui contiennent "XX-XX EUR/mois" doivent etre :
- Soit completes avec du vrai contenu (prix corrects, sources, minimum 800 mots)
- Soit supprimes pour ne pas degrader la qualite globale du site

---

## 5. Optimisations techniques

### A faire (rapide)

- [ ] **Mettre a jour les titres** "2025" → "2026" dans tous les frontmatter et pages Astro
- [ ] **Corriger les ~15 liens internes casses** (`/glp1-cout/...` → `/collections/glp1-cout/...`)
- [ ] **Creer /guides/index.astro** — page hub listant tous les guides
- [ ] **Nettoyer les doublons** dans medecins-glp1-france (garder -new ou original, pas les deux)
- [ ] **Renseigner mainKeyword/secondaryKeywords** dans le frontmatter de chaque article (ou retirer ces champs du schema si non utilises)
- [ ] **Supprimer les pages de test** accessibles en production

### A faire (moyen terme)

- [ ] **Schema.org** : ajouter MedicalWebPage, FAQPage, Article sur chaque page
- [ ] **Fil d'Ariane (breadcrumb)** : ajouter un composant breadcrumb sur les pages collections
- [ ] **Sitemap** : verifier que toutes les pages sont indexees, exclure les doublons
- [ ] **Canonical URLs** : s'assurer que chaque page a un canonical correct
- [ ] **Open Graph / Twitter Cards** : verifier les balises sur toutes les pages
- [ ] **Vitesse** : auditer les Core Web Vitals via PageSpeed Insights
- [ ] **Images** : auditer les alt text manquants, convertir en WebP si pas fait

### Monitoring

| Outil | Usage | Frequence |
|---|---|---|
| Google Search Console | Positions, impressions, couverture, erreurs | Hebdomadaire |
| Google Analytics 4 | Sessions, pages vues, taux de rebond, conversions | Hebdomadaire |
| PageSpeed Insights | Core Web Vitals, score mobile/desktop | Mensuel |
| Screaming Frog / audit-seo-simple.mjs | Liens casses, titres manquants, meta duplicates | Mensuel |

---

## 6. Strategie de contenu editoriale

### Donnees de reference (prix mars 2026)

Toute creation de contenu doit utiliser ces donnees verifiees :

| Medicament | Molecule | Labo | Prix | Remboursement | Indication |
|---|---|---|---|---|---|
| Ozempic | semaglutide 1mg | Novo Nordisk | ~59,90 EUR/stylo | Oui 65% (DT2 uniquement) | Diabete type 2 |
| Wegovy | semaglutide 2,4mg | Novo Nordisk | 169-360 EUR/mois | Non | Obesite |
| Mounjaro | tirzepatide | Eli Lilly | 230-440 EUR/mois | Non | Obesite + DT2 |
| Saxenda | liraglutide 3mg | Novo Nordisk | 240-300 EUR/mois | Non | Obesite |
| Trulicity | dulaglutide | Eli Lilly | ~81 EUR/mois | Oui 65% (DT2) | Diabete type 2 |
| Victoza | liraglutide 1,8mg | Novo Nordisk | ~60,26 EUR/mois | Oui 65% (DT2) | Diabete type 2 |
| Rybelsus | semaglutide oral | Novo Nordisk | 80-110 EUR/mois | Oui 65% (DT2) | Diabete type 2 |

**Regles absolues** :
- Wegovy, Mounjaro, Saxenda ne sont PAS rembourses — ne jamais ecrire le contraire
- Zepbound n'existe PAS en France — c'est Mounjaro en Europe
- Depuis fevrier 2025 : formulaire de prescription obligatoire pour Ozempic, Trulicity, Victoza
- Numeros d'urgence : 15 (SAMU) ou 112 — JAMAIS 911

### Calendrier editorial

| Semaine | Lundi | Mercredi | Vendredi |
|---|---|---|---|
| Type | Article pilier ou comparatif | Article pratique / FAQ | Actualite ou temoignage |
| Longueur | 1200-2000 mots | 600-1000 mots | 400-800 mots |
| SEO | Mot-cle principal fort | Longue traine / Featured Snippet | Fraicheur du contenu |

### Regles de redaction SEO

1. **Titre (H1)** : 30-60 caracteres, mot-cle principal en debut, annee si pertinent
2. **Meta description** : 120-160 caracteres, inclure le benefice principal + appel a action
3. **Structure** : H1 unique → H2 (sections) → H3 (sous-sections), pas de saut de niveau
4. **Premier paragraphe** : contenir le mot-cle principal dans les 100 premiers mots
5. **Liens internes** : minimum 3 par article, ancres descriptives (pas "cliquez ici")
6. **Images** : alt text descriptif avec mot-cle si naturel, format WebP
7. **FAQ** : ajouter 3-5 questions en fin d'article pour Featured Snippets
8. **Sources** : citer les sources officielles (ANSM, HAS, VIDAL, ameli.fr) avec liens
9. **Mise a jour** : indiquer la date de derniere mise a jour dans le frontmatter
10. **Ton** : pharmacien qui explique a un patient — clair, bienveillant, precis, sans jargon excessif

### Optimisation Featured Snippets

Structure ideale pour capter les Featured Snippets Google :

```markdown
# [Question exacte en H1]

**Reponse courte** : [1-2 phrases directes repondant a la question]

## [Developpement H2]
[Paragraphe explicatif...]

## Points cles
- Point 1
- Point 2
- Point 3

## FAQ
### [Sous-question 1]
[Reponse...]

### [Sous-question 2]
[Reponse...]
```

---

## 7. KPIs et objectifs

### Objectifs a 3 mois (juin 2026)

| KPI | Baseline actuelle | Objectif | Levier |
|---|---|---|---|
| Pages indexees | ~151 | 180+ | Nouveaux articles, suppression placeholders |
| Trafic organique | A mesurer | +25% | Nouveaux articles + comparatifs |
| Position moyenne | A mesurer | < 15 | Optimisation on-page |
| Featured Snippets | 0 | 5+ | Articles FAQ structures |
| Taux de rebond | A mesurer | -10% | Maillage interne, contenu plus complet |
| Temps moyen sur page | A mesurer | +30% | Contenu enrichi, outils interactifs |

### Objectifs a 6 mois (septembre 2026)

| KPI | Objectif | Levier |
|---|---|---|
| Pages indexees | 220+ | Remplir collections vides, pages geo |
| Trafic organique | +50% vs mars 2026 | Dominer les comparatifs + FAQ |
| Backlinks | 20+ nouveaux domaines | Outils (calculateurs), contenu de reference |
| Conversions affilies | +30% | Meilleur maillage, outils interactifs |

---

## 8. Outils et scripts existants

| Outil / Script | Emplacement | Usage |
|---|---|---|
| Audit SEO simple | `scripts/audit-seo-simple.mjs` | Analyse rapide qualite contenu |
| Optimisation SEO finale | `scripts/final-seo-optimization.mjs` | Corrections SEO en lot |
| Optimisation images SEO | `scripts/maintenance/optimize-image-seo-clean.ps1` | Alt text et compression |
| Dashboard SEO admin | `src/pages/admin/seo.astro` | Vue admin des metriques SEO |
| Opportunites SEO | `seo-opportunities.js` | Liste de pages a creer |
| Fact-check agent | `scripts/fact-check-runner.mjs` | Verification automatique des contenus |
| Editorial agent | `scripts/editorial-agent.mjs` | Redaction des corrections |
| Integration agent | `scripts/integration-agent.mjs` | Application des corrections |

---

## 9. Historique des actions SEO

| Date | Action | Impact |
|---|---|---|
| Aout 2025 | Corrections SEO + affiliation (redirections 301, sitemap) | Elimination 404, meilleure indexation |
| Septembre 2025 | Audit technique complet, correction metadonnees (41 fichiers) | Homepage enrichie (37 → 2300+ mots) |
| Octobre 2025 | Optimisation titres 2025, integration feedback | 59 titres optimises |
| Octobre 2025 | Plan d'optimisation contenu + outils interactifs | Calculateur de cout cree |
| Mars 2026 | Audit factuel complet (94 fichiers, 43 corrections) | Prix, remboursements, posologies corriges |

---

## 10. Documents de reference archives

Les documents suivants ont ete consolides dans ce fichier et peuvent etre deplacees dans `docs/archive/` :

| Fichier | Contenu merge ici |
|---|---|
| `docs/archive/collections-seo.md` | Mots-cles par collection, URL structure |
| `docs/OPTIMISATION-TITRES-2025-COMPLETE.md` | Strategie titres |
| `docs/CORRECTIONS-SEO-AFFILIATION-31-08-2025.md` | Corrections techniques |
| `PLAN-AMELIORATION-DESIRABILITE.md` | Strategie conversion Mounjaro |
| `PLAN-OPTIMISATION-FEEDBACK-2025.md` | Articles a creer, KPIs |
| `CHECKLIST-OPTIMISATION.md` | Roadmap |
| `RAPPORT_FINAL_OPTIMISATION.md` | Resultats audit |
| `RAPPORT-COMPLET-OPTIMISATION.md` | Audit complet |
| `seo-opportunities.js` | Pages geo + longue traine |
| `INDEX-DOCUMENTATION.md` | Index navigation |

---

*Ce document est la reference unique pour la strategie SEO de glp1-france.fr. Toute mise a jour SEO doit etre documentee ici.*
