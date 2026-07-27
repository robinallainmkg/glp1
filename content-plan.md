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

- [ ] **1. Qui peut prescrire Mounjaro ou Wegovy pour être remboursé ? (généraliste vs CSO/CHU)** — collection `medecins-glp1-france`. Preuve : question littérale de la cliente n°2 ("la pharmacie m'a dit de chercher un médecin prescripteur habilité, où en trouver un ?") ; la page télémédecine prend déjà des clics. Angle : primo-prescription CSO/CHU, rôle exact du généraliste (renouvellement), que faire si le généraliste a prescrit à tort, comment trouver le CSO le plus proche (mode d'emploi annuaire ameli, pas de liste inventée). CTA : Dossier 4,99 €. Suivi : —
- [ ] **2. La pharmacie refuse de délivrer Mounjaro/Wegovy : pourquoi et que faire** — collection `traitements-glp1`. Preuve : pain point client n°2 ; requêtes "pharmacie refuse" à vérifier par WebSearch au moment de la rédaction. Angle : les 4 causes réelles de refus (primo-prescription non conforme, accord préalable, rupture, ordonnance non sécurisée) + parcours de déblocage étape par étape. Suivi : —

### P2 — Quick wins sur demande GSC mesurée

- [ ] **3. Prix des GLP-1 en pharmacie : le tableau complet 2026 (Ozempic, Wegovy, Mounjaro, Saxenda, Trulicity, Rybelsus)** — collection `glp1-cout`. Preuve : "glp-1 en pharmacie prix" 201 imp/7j pos 8,1 CTR 0,5% sans page parfaitement dédiée. Angle : LE tableau de référence, prix BDPM sourcés, remboursement par indication, lien carte pharmacies. Suivi : —
- [ ] **4. Acheter Wegovy ou Mounjaro en Espagne : prix réels et ce qui est légal** — collection `glp1-cout`. Preuve : "wegovy prix pharmacie espagne" 131 imp/7j pos 7,0 ; keywords "mounjaro prix espagne" déjà présents sur nos pages sans contenu dédié. Angle : comparatif prix officiel FR/ES sourcé, règles douanières/ordonnance UE (sourcées), pourquoi le remboursement FR change le calcul. Prudence légale : que du sourcé. Suivi : —

### P3 — Cluster retraites (leadership : déjà position 8 sur "retraite perte de poids" à J+14)

- [ ] **5. Cure thermale obésité : les stations agréées et la procédure de remboursement Sécu** — collection `retraites-bien-etre`. Preuve : "cure thermale minceur remboursé" pos 28,8 SANS page dédiée ; roadmap validée. Liste des stations sourcée (CNETh / ameli), procédure accord préalable. Suivi : —
- [ ] **6. Brides-les-Bains : avis, prix, résultats — la station minceur de référence** — collection `retraites-bien-etre`. Preuve : requêtes "brides les bains cure minceur/amaigrissement avis" déjà en imp (pos 37-55) sur notre top-10. Prix vérifiables uniquement (site officiel). Suivi : —
- [ ] **7. Combien coûte une retraite perte de poids en France ? (grille 2026)** — collection `retraites-bien-etre`. Roadmap 13/07 ; requête d'intention commerciale du cluster. Suivi : —
- [ ] **8. Vittel, Capvern, Contrexéville : les 3 cures thermales minceur comparées (avis, prix)** — collection `retraites-bien-etre`. Roadmap validée ; regroupe 3 sujets en 1 comparatif honnête. Suivi : —
- [ ] **9. Jeûne et randonnée : comparatif des organisateurs labellisés FFJR** — collection `retraites-bien-etre`. Roadmap validée ; zéro affiliation, prix sourcés. Suivi : —

### P4 — Fond de roadmap

- [ ] **10. Camp / séjour perte de poids pour adulte en France ("fat camp")** — `retraites-bien-etre`. Preuve : "camp perte de poids france" + "fat camp france" (pos 7 !) en imp sur le cluster. Suivi : —
- [ ] **11. Peau relâchée après perte de poids GLP-1 : solutions (sport, nutrition, médecine esthétique)** — `effets-secondaires-glp1`. Pont vers retraites/Morpheus8 SANS promesse commerciale. Suivi : —
- [ ] **12. Ozempic 2 mg : pourquoi il n'est pas disponible en France** — `traitements-glp1`. FAQ récurrente de la page prix, format court. Suivi : —

## Backlog candidat (ajouts de la routine — publiables au run suivant leur ajout, veto Robin 24h)

_(vide — la routine ajoute ici : sujet, requête cible, preuve de demande chiffrée, collection proposée)_

## Publiés

_(la routine déplace ici les items cochés : date, URL, imp J+7, imp J+30)_
