# Plan de recovery SEO post-suspension — suivi persistant

> Cree le 28/07/2026 (demande Robin). **La routine met a jour ce fichier a CHAQUE run** :
> cocher, dater, noter le resultat chiffre. Le rapport quotidien renvoie ici au lieu de
> re-derouler le diagnostic. Objectif : 106 clics GSC/jour (baseline 15-23/06). Etat au
> 28/07 : 33 clics/jour (31%).

## Diagnostic (fige, ne pas re-debattre chaque run)

Suspension Hostinger 24/06 → 04/07. Impressions revenues a ~70% de la baseline, clics a
31% : Google a reindexe le site mais a repositionne les requetes monetisantes 3-8 places
plus bas. **4 pages faisaient ~85% des clics baseline** (carte-prix-pharmacies 438,
prix-mounjaro 411, prix-wegovy 301, prix-ozempic 242 sur 23 jours). Le recovery = remonter
ces 4 pages + faire re-crawler les 7 pages disparues de l'index. Pas de bouton magique :
reindexation manuelle + fraicheur + maillage + patience (horizon realiste 3-6 semaines).

## Actions ROBIN (bloquantes, ~15 min, personne d'autre ne peut le faire)

- [ ] **Soumettre a la reindexation GSC** (Inspection d'URL → "Demander l'indexation",
  aucune API ne permet de le faire a ta place) les 7 pages disparues :
  - /collections/glp1-cout/wegovy-remboursement-mutuelle/
  - /collections/regime-glp1/regime-mounjaro-optimal/
  - /collections/glp1-cout/baisse-prix-ozempic-wegovy-2027-france/
  - /collections/traitements-glp1/nouveau-stylo-ozempic-3ml-2026-changement-utilisation/
  - /guides/suivi-medical-glp1/
  - /collections/traitements-glp1/glp1-sopk-syndrome-ovaires-polykystiques-ozempic-wegovy/
  - /collections/effets-secondaires-glp1/effets-secondaires-mounjaro/
- [ ] **Inspecter les 4 pages tetes** dans GSC (meme outil) : verifier que Google voit la
  version a jour (titles du 27/07) et re-demander l'indexation au passage.
- [ ] (Optionnel, levier fort post-suspension) 2-3 backlinks simples : annuaires sante,
  mention presse/blog — signal de confiance externe que la routine ne peut pas fabriquer.

## Actions ROUTINE (1 bloc par run, dans cet ordre)

- [ ] **Suivi requete-par-requete des 4 pages tetes** a chaque run : position WoW de
  "ozempic prix" (13,2 au 27/07), "prix mounjaro", "prix wegovy", "carte prix pharmacie".
  Consigner ici : date → position. C'est LE thermometre du plan.
- [ ] **Rafraichir 1 page tete par run** (updatedAt, chiffres re-verifies WebSearch, FAQ) :
  - [ ] prix-mounjaro-france (recup 5% — priorite 1)
  - [ ] prix-wegovy-france (recup 5%)
  - [ ] prix-ozempic-france (recup 12%)
  - [ ] carte-prix-pharmacies (recup 18%)
- [ ] **Audit maillage cible** (J3 avance) : verifier que les pages pharmacies (20k) et
  les articles recents linkent bien les 4 pages tetes avec ancres exactes ("prix mounjaro
  france"...). Si <3 liens entrants sur une page tete → lot de liens via correction_tickets.
- [ ] **CTR** : re-evaluer les titles du 27/07 (PR #79) au run du 30-31/07. Si CTR <1,5%
  sur prix-mounjaro (1,32% au 28/07) → reecriture C1 immediate.
- [ ] **Metriques propres** : a partir du prochain run, calculer recovery/position en
  EXCLUANT /pharmacies/ (le cluster programmatique pollue la position moyenne).
- [ ] **Continuer content-plan** (1 article/run) : signaux de fraicheur + budget crawl.

## Journal (la routine ajoute une ligne datee par run)

- 28/07 : plan cree. Baseline du plan : 33 clics/j (31%), "ozempic prix" pos 13,2,
  prix-mounjaro CTR 1,32% (1 670 impr/7j). Liste reindexation transmise a Robin (ci-dessus).
