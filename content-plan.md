# PLAN DE CONTENU SEO — todolist de la routine (validé Robin 27/07/2026)

Ce fichier est la **source de vérité** de la création de contenu. La routine quotidienne :
1. Prend le **premier sujet non coché** (ordre = priorité), rédige l'article, le publie (commit + PR + merge + deploy vert), coche la case avec la date et l'URL.
2. **Maximum 1 article par run.** Qualité > cadence : un article annulé vaut mieux qu'un article inventé.
3. Mesure et note dans ce fichier la performance de chaque article publié : impressions GSC à **J+7** et **J+30** (colonne Suivi). Si un article est invisible à J+7 → l'ajouter à la liste de réindexation GSC du rapport.
4. Peut **ajouter des sujets au backlog** (section en bas, avec preuve de demande GSC/WebSearch) mais ne publie un sujet du backlog qu'au run SUIVANT son ajout — fenêtre de veto de 24h pour Robin.
5. Robin peut réordonner, supprimer ou ajouter des sujets en éditant ce fichier directement.

## Règles de rédaction (non négociables)

- **Chaque chiffre est sourcé (lien) ou supprimé.** Sources officielles d'abord : ANSM, HAS, BDPM, ameli, JO/arrêtés, sites officiels des établissements. WebSearch obligatoire pendant la rédaction.
- **Zéro fausse expérience** ("j'ai testé" interdit sauf vécu réel documenté). Byline : `Rédaction GLP-1 France` (pas de médecin fictif).
- Marque **Zepbound interdite** (DMCA) — dire "tirzépatide" ou "Mounjaro".
- 900-1 600 mots, structure H2/H3 propre, FAQ schema 3-5 questions, meta title ≤ 65 cars avec le mot-clé en tête, description ≤ 155 cars.
- **Maillage** : ≥ 3 liens sortants vers nos pages (dont 1 vers le funnel : test d'éligibilité ou Dossier si pertinent) + ajouter ≥ 2 liens entrants depuis des articles existants dans le même commit.
- Thumbnail SVG **unique** (DA verte #1a3c34 / #16a34a) dans `public/images/thumbnails/`.
- URLs articles : `/collections/<collection>/<slug>/`.

## File prioritaire

### P1 — Parcours de soins (l'intention exacte de nos 2 premiers clients payants)


### P2 — Quick wins sur demande GSC mesurée

### P3 — Cluster retraites (leadership : déjà position 8 sur "retraite perte de poids" à J+14)

- [x] **5. Cure thermale obésité : les stations agréées et la procédure de remboursement Sécu** — publié le 04/08/2026 → https://glp1-france.fr/collections/retraites-bien-etre/cure-thermale-obesite-stations-agreees-remboursement/ — sources : service-public.fr F751 (18 jours, forfait thermal 65 %, surveillance 70 %, plafonds ressources 14 664,38 €/21 996,57 €, hébergement 97,50 €, 1 cure/an), location-cure.net (liste 14 stations AD), medecinethermale.fr (orientation AD surpoids/obésité). Cible : « cure thermale minceur remboursé » (pos 28,8 sans page dédiée). Maillage entrant : brides-les-bains-avis + wegovy-rembourse-cure-thermale. Suivi : imp J+7 (~11/08) : — ; imp J+30 (~03/09) : —
- [x] **6. Brides-les-Bains : avis, prix, résultats — la station minceur de référence** — DÉJÀ COUVERT (constat routine 05/08) : article publié le 14/07/2026 (PR #51, phase 2) → https://glp1-france.fr/collections/retraites-bien-etre/brides-les-bains-avis-prix-resultats-cure-minceur/ — l'item était resté non coché par erreur. Suivi : —
- [x] **7. Combien coûte une retraite perte de poids en France ? (grille 2026)** — DÉJÀ COUVERT (constat routine 05/08) : article `combien-coute-retraite-bien-etre-france-prix-2026` publié (phase 2, live). Suivi : —
- [x] **8. Vittel, Capvern, Contrexéville : les 3 cures thermales minceur comparées (avis, prix)** — publié le 05/08/2026 → https://glp1-france.fr/collections/retraites-bien-etre/vittel-capvern-contrexeville-cure-thermale-minceur-comparatif/ — sources : officiel-thermalisme.com (Capvern AD 542,45 €, RH 574,51 €, double 829,70 €, ETP surpoids ≥ 7 h prise en charge depuis 2025, saison 06/04-31/10), thermes-vittel.com (saison 23/03-28/11, acompte 55 €, activités 9,50-13 €), thermes-contrexeville.fr (saison 30/03-14/11, 72 soins/18j, top 10 lescuristes 2023), lescuristes.fr (Maâthermes 5 stations, 3,86 kg à 14 mois). Maillage entrant : cure-thermale-obesite + brides-les-bains. Suivi : imp J+7 (~12/08) : — ; imp J+30 (~04/09) : —
- [x] **9. Jeûne et randonnée : comparatif des organisateurs labellisés FFJR** — publié le 07/08/2026 → https://glp1-france.fr/collections/retraites-bien-etre/jeune-randonnee-organisateurs-ffjr-comparatif-prix/ — sources : ffjr.com/la-federation/qui-sommes-nous (création 2003 par les 7 premiers accompagnateurs formés par le couple Bölling, ~130 centres labellisés, >130 professionnels, charte « majeurs en bonne santé ne nécessitant pas de prise en charge médicale », Buchinger 7 jours ou moins, consentement éclairé écrit), ffjr.com/les-sejours-en-pratique (jus matin / bouillon filtré soir, mono-diète, groupes <10 / 10-15 / >15, journées 9h30-21h), fiches organisateurs FFJR Ardèche (Graziella 640 €, Château de Liviers 670 €, O fil de l'eau 890 €), jeune-detox-et-randonnee.fr (720 €/6 nuits, Boisseuil 87, exclusions dont « traitements médicaux lourds »), jeux-jeune-rando.com (+80 € sportif, +100 € yoga), ANSES NUT2009sa0099 (amaigrissement = accompagnement médical). Angle différenciant : la charte FFJR exclut de fait les patients sous GLP-1 (prise en charge médicale en cours) — personne ne le dit. Maillage entrant : jeune-sous-wegovy-mounjaro + meilleures-retraites-perte-de-poids. Suivi : imp J+7 (~14/08) : — ; imp J+30 (~06/09) : —

### P4 — Fond de roadmap

- [ ] **10. Camp / séjour perte de poids pour adulte en France ("fat camp")** — `retraites-bien-etre`. Preuve : "camp perte de poids france" + "fat camp france" (pos 7 !) en imp sur le cluster. Suivi : —
- [ ] **11. Peau relâchée après perte de poids GLP-1 : solutions (sport, nutrition, médecine esthétique)** — `effets-secondaires-glp1`. Pont vers retraites/Morpheus8 SANS promesse commerciale. Suivi : —
- [ ] **12. Ozempic 2 mg : pourquoi il n'est pas disponible en France** — `traitements-glp1`. FAQ récurrente de la page prix, format court. Suivi : —

## Backlog candidat (ajouts de la routine — publiables au run suivant leur ajout, veto Robin 24h)

_(vide — la routine ajoute ici : sujet, requête cible, preuve de demande chiffrée, collection proposée)_

## Publiés

- [x] **4. Acheter Wegovy ou Mounjaro en Espagne : prix réels et ce qui est légal** — publié le 03/08/2026 → https://glp1-france.fr/collections/glp1-cout/acheter-wegovy-mounjaro-espagne-prix-legalite/ — sources : Merca2 15/05/2026 (Sanidad ne finance pas la tirzépatide), miglp1.com (Wegovy ES ~136-292 €/dosage, baisse Novo mars 2026), Holvia (Mounjaro ES 207,91-446,07 €), europa.eu (directive 2011/24/UE art. 11, ordonnance transfrontalière), douane.gouv.fr (règle des 3 mois usage personnel). Angle : depuis remboursement 65 % + baisses françaises, l'Espagne n'est presque jamais rentable. Cible : « wegovy prix pharmacie espagne » (131 imp/7j pos 7,0). Maillage entrant : prix-glp1-pharmacie-tableau-2026 + acheter-wegovy-allemagne-prix. Suivi : imp J+7 (~10/08) : — ; imp J+30 (~02/09) : —

- [x] **3. Prix des GLP-1 en pharmacie : le tableau complet 2026 (Ozempic, Wegovy, Mounjaro, Saxenda, Trulicity, Rybelsus)** — publié le 02/08/2026 → https://glp1-france.fr/collections/glp1-cout/prix-glp1-pharmacie-tableau-2026/ — sources : BDPM (Ozempic 77,60 € / Trulicity 81,14 €), Vidal 37850 (Wegovy 146,91-195,10 € / Mounjaro 176,10-433,80 €, remb 65 % 15/06/2026), Moniteur des pharmacies (Saxenda non remboursé, prix libre), HAS avis défavorable Rybelsus. Cible : « glp-1 en pharmacie prix » (201 imp/7j pos 8,1). Maillage entrant : prix-ozempic-france + pharmacie-refuse-delivrer. Suivi : imp J+7 (~09/08) : — ; imp J+30 (~01/09) : —

- [x] **2. La pharmacie refuse de délivrer Mounjaro/Wegovy : pourquoi et que faire** — publié le 01/08/2026 (run 2) → https://glp1-france.fr/collections/traitements-glp1/pharmacie-refuse-delivrer-mounjaro-wegovy-que-faire/ — sources : Vidal 37850, ameli espace pharmacien (dispositif d'aide à la prescription AGLP-1), FSPF circulaire 2026-30, ANSM disponibilité. Angle ajusté vs plan : les 4 causes documentées sont formulaire ITR manquant, prescripteur non habilité, critères non remplis, rupture (l'« accord préalable » et l'« ordonnance non sécurisée » du plan n'ont pas de source officielle pour Wegovy/Mounjaro — non retenus). Preuve GSC : « formulaire remboursement mounjaro » pos 7,7 ; « ou trouver le mounjaro le moins cher » 173 imp/28j. Maillage entrant : article qui-peut-prescrire + article pénurie. Suivi : imp J+7 (~08/08) : — ; imp J+30 (~31/08) : —
- [x] **1. Qui peut prescrire Mounjaro ou Wegovy pour être remboursé ? (généraliste vs CSO/CHU)** — publié le 01/08/2026 → https://glp1-france.fr/collections/medecins-glp1-france/qui-peut-prescrire-mounjaro-wegovy-rembourse/ — sources : arrêtés des 10-12/06/2026 (Vidal 37850/37934), ameli.fr, Santé.fr (41 CSO), Moniteur des pharmacies (règle 6 mois / -5 %). Maillage entrant : article généraliste + article télémédecine. Suivi : imp J+7 (~08/08) : — ; imp J+30 (~31/08) : —
