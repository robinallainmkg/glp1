# AUDIT CONTENU — GLP1 France

> **Date** : 2026-03-08
> **Auditeur** : Claude (audit manuel complet)
> **Sources de reference** : ameli.fr, has-sante.fr, ansm.sante.fr, vidal.fr, legifrance.gouv.fr
> **Build** : ✅ 151 pages, 0 erreurs (14.57s)

---

## Synthese

| Categorie | Fichiers audites | Corrections | Erreurs critiques |
|-----------|-----------------|-------------|-------------------|
| traitements-glp1 | 9 | 8 corriges | Faux remboursements, indications incorrectes |
| glp1-cout | 15 | 13 corriges | Prix faux, faux remboursements generalises |
| effets-secondaires-glp1 | 12 | 8 corriges | Numero urgence US (911), dose Wegovy fausse |
| pages Astro (guides) | 14 | 4 corriges | Prix faux, faux remboursements, prix Wegovy |
| pages-statiques | 3 | 3 corriges | Prix faux, faux remboursements generalises |
| glp1-perte-de-poids | 2 | 1 corrige | Prix faux, faux remboursement obesite |
| medecins-glp1-france | 5 | 2 corriges | Prix Ozempic/Wegovy faux |
| regime-glp1 | 15 | 3 corriges | Prix Ozempic/Trulicity faux |
| alternatives-glp1 | 14 | 1 corrige | Prix Ozempic faux |
| temoignages | 4 | 0 | RAS |
| recherche-glp1 | 1 | 0 | Contenu placeholder |

**Total : ~94 fichiers audites, ~43 fichiers corriges**

---

## Erreurs systemiques trouvees

### 1. CRITIQUE : Faux remboursement des traitements anti-obesite
**Trouve dans** : ~30 fichiers
**Erreur** : Wegovy, Mounjaro et Saxenda presentes comme "rembourses a 65%" voire "a 100%"
**Realite** : Aucun de ces trois medicaments n'est rembourse en France (mars 2026)
**Statut** : ✅ CORRIGE partout

### 2. CRITIQUE : Prix completement faux
**Trouve dans** : ~40 fichiers
**Erreurs typiques** :
- Ozempic : "73€/mois" ou "78€" ou "90-130€" → reel : ~59,90€/stylo
- Wegovy : "70-100€" ou "120-140€" ou "270€/stylo" → reel : 169-360€/mois
- Saxenda : "60-80€" ou "89€" ou "165€" → reel : 240-300€/mois
- Mounjaro : "179,80€" ou "312€" → reel : 230-440€/mois
- Trulicity : "50-70€" ou "85-95€" ou "89€" → reel : ~81€/mois
- Victoza : "40-60€" ou "75-85€" ou "95€" → reel : ~60,26€/mois (baisse fev 2025)
- Rybelsus : "50-70€" ou "125€" → reel : 80-110€/mois
**Statut** : ✅ CORRIGE partout

### 3. IMPORTANT : Numero d'urgence americain
**Trouve dans** : 6 fichiers effets-secondaires
**Erreur** : "911 ou urgences" au lieu de "15 (SAMU) ou 112"
**Statut** : ✅ CORRIGE partout

### 4. IMPORTANT : Formulaire prescription obligatoire manquant
**Depuis** : 1er fevrier 2025 (ANSM)
**Concerne** : Ozempic, Trulicity, Victoza
**Statut** : ✅ Ajoute dans les articles concernes

### 5. IMPORTANT : Zepbound presente comme existant en France
**Realite** : Zepbound est le nom commercial US — en Europe/France = Mounjaro
**Statut** : ✅ Disclaimer ajoute dans guide-complet-zepbound.md, effets-secondaires-zepbound.md et prix-zepbound-france.md

### 6. IMPORTANT : Dose max Wegovy manquante
**Fichier** : wegovy-dosage.md
**Erreur** : Dose max indiquee a 1,7 mg au lieu de 2,4 mg
**Statut** : ✅ CORRIGE — 5e palier (2,4 mg semaine 17+) ajoute

---

## Donnees de reference (mars 2026)

### Medicaments rembourses (diabete de type 2, 65% SS, 100% ALD)

| Medicament | Molecule | Prix | Posologie | Formulaire |
|-----------|----------|------|-----------|-----------|
| Ozempic | Semaglutide inj. | ~59,90€/stylo | 0,25-2 mg/sem | Oui (fev 2025) |
| Trulicity | Dulaglutide | ~81€/mois | 0,75-4,5 mg/sem | Oui (fev 2025) |
| Victoza | Liraglutide 1,8mg | ~60,26€/mois | 0,6-1,8 mg/jour | Oui (fev 2025) |
| Rybelsus | Semaglutide oral | 80-110€/mois | 3-14 mg/jour | Non |

### Medicaments NON rembourses (obesite)

| Medicament | Molecule | Labo | Prix | Posologie | Dispo FR |
|-----------|----------|------|------|-----------|----------|
| Wegovy | Semaglutide 2,4mg | Novo Nordisk | 169-360€/mois | 0,25-2,4 mg/sem | Oct 2024 |
| Mounjaro | Tirzepatide | Eli Lilly | 230-440€/mois | 2,5-15 mg/sem | Nov 2024 |
| Saxenda | Liraglutide 3mg | Novo Nordisk | 240-300€/mois | 0,6-3 mg/jour | Depuis 2015 |

### Medicaments inexistants en France

| Nom US | Equivalent FR | Note |
|--------|---------------|------|
| Zepbound | Mounjaro | Meme molecule (tirzepatide), meme labo (Eli Lilly) |

---

## Statut detaille par collection

### Collection : traitements-glp1 (9 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| guide-complet-ozempic.md | ✅ CORRIGE | Faux remboursement obesite, indication erronee, dose Saxenda fausse (1,8→3mg) |
| guide-complet-wegovy.md | ✅ CORRIGE | Faux "rembourse a 100%", ajout formulaire |
| guide-complet-mounjaro.md | ✅ CORRIGE | Faux remboursement, Zepbound comme alternative distincte corrige |
| guide-complet-saxenda.md | ✅ CORRIGE | Faux "rembourse a 100%" |
| guide-complet-trulicity.md | ✅ CORRIGE | Ajout info formulaire fev 2025 |
| guide-complet-victoza.md | ✅ CORRIGE | Ajout formulaire, prix actualise (60,26€) |
| guide-complet-rybelsus.md | ✅ CORRIGE | Taux remboursement precise (65% DT2) |
| guide-complet-zepbound.md | ✅ CORRIGE | Disclaimer Zepbound = Mounjaro en Europe |
| centres-mounjaro-france.md | ✅ VERIFIE | Prix Mounjaro ~285€ acceptable (fourchette 230-440€) |

### Collection : glp1-cout (15 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| prix-ozempic-france.md | ✅ CORRIGE | 8 edits : prix, remboursement, comparaisons |
| prix-wegovy-france.md | ✅ CORRIGE | Tous prix 73€→169-360€, faux remboursement retire, budgets corriges |
| prix-mounjaro-france.md | ✅ CORRIGE | Fabricant Novo→Eli Lilly, prix 179€→230-440€, faux rembours. retire |
| prix-saxenda-france.md | ✅ CORRIGE | 7 corrections prix (70-80€→240-300€), faux remboursement retire |
| prix-trulicity-france.md | ✅ CORRIGE | 7 edits : fabricant→Eli Lilly, prix→~81€, formulaire ajoute |
| prix-victoza-france.md | ✅ CORRIGE | 7 edits : prix→60,26€, formulaire, baisse fev 2025 |
| prix-rybelsus-france.md | ✅ CORRIGE | 6 edits : prix→80-110€, comparaisons |
| prix-zepbound-france.md | ✅ CORRIGE | 9 edits : disclaimer Zepbound, fabricant, prix, fausses grandes surfaces |
| wegovy-prix.md | ✅ CORRIGE | Prix→169-360€, budgets annuels corriges, faux remboursement retire |
| acheter-wegovy-en-france.md | ✅ CORRIGE | Faux generiques retires, prix corrige |
| wegovy-remboursement-mutuelle.md | ✅ CORRIGE | Faux remboursement retire, prix corrige |
| saxenda-prix-pharmacie.md | ✅ CORRIGE | Prix corriges dans 4 fichiers |
| remboursement-glp1-2026.md | ✅ CORRIGE | 6 edits : distinction DT2/obesite, faux rembours. retire |
| anneau-gastrique-prix-cmu.md | ✅ VERIFIE | Contenu chirurgie bariatrique — pas d'erreur GLP-1 |
| operation-pour-maigrir-prix.md | ✅ VERIFIE | Contenu chirurgie bariatrique — pas d'erreur GLP-1 |

### Collection : effets-secondaires-glp1 (12 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| effets-secondaires-ozempic.md | ✅ CORRIGE | 911→15/SAMU ou 112 |
| effets-secondaires-wegovy.md | ✅ CORRIGE | 911→15/SAMU ou 112 |
| effets-secondaires-saxenda.md | ✅ CORRIGE | 911→15/SAMU ou 112 |
| effets-secondaires-trulicity.md | ✅ CORRIGE | 911→15/SAMU ou 112 |
| effets-secondaires-victoza.md | ✅ CORRIGE | 911→15/SAMU ou 112 |
| effets-secondaires-rybelsus.md | ✅ CORRIGE | 911→15/SAMU ou 112 |
| effets-secondaires-mounjaro.md | ✅ VERIFIE | RAS — bon contenu |
| effets-secondaires-zepbound.md | ✅ CORRIGE | Disclaimer Zepbound = Mounjaro ajoute |
| wegovy-dosage.md | ✅ CORRIGE | Dose max 1,7→2,4 mg, 5e palier ajoute |
| ozempic-danger.md | ✅ VERIFIE | RAS — bon contenu, numeros corrects |
| wegovy-danger.md | ✅ VERIFIE | Contenu generique mais pas d'erreur factuelle |
| insulevel-effet-indesirable-new.md | ⚠️ NOTE | Article sur complement alimentaire, pas un GLP-1 |

### Pages Astro guides (14 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| faq-glp1.astro | ✅ CORRIGE | Prix corrige, distinction DT2/obesite ajoutee |
| nouveaux-medicaments-perdre-poids.astro | ✅ CORRIGE | 5 edits : prix cartes, tableau cout, FAQ remboursement |
| guide-complet-wegovy.astro | ✅ CORRIGE | Prix 272€/stylo→169-360€/mois, conclusion 1088€→169-360€ |
| quel-traitement-glp1-choisir.astro | ✅ CORRIGE | Fausse recommandation Ozempic "mieux rembourse" retiree |
| qu-est-ce-que-glp1.astro | ✅ VERIFIE | Posologies correctes |
| alimentation-personnalisee-glp1.astro | ✅ VERIFIE | Pas de claims prix/remboursement |
| communautes-glp1.astro | ✅ VERIFIE | Pas de claims prix/remboursement |
| experts.astro | ✅ VERIFIE | Pas de claims medicaux specifiques |
| guide-beaute-perte-de-poids-glp1.astro | ✅ VERIFIE | Lead magnet — pas de claims medicaux |
| guides-age-glp1.astro | ✅ VERIFIE | Pas de claims prix/remboursement |
| interactions-medicamenteuses-glp1.astro | ✅ VERIFIE | Pas de claims prix |
| psychologie-motivation-glp1.astro | ✅ VERIFIE | Pas de claims prix |
| sport-activite-physique-glp1.astro | ✅ VERIFIE | Pas de claims prix |
| suivi-medical-glp1.astro | ✅ VERIFIE | Pas de claims prix |

### Collection : pages-statiques (3 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| homepage.md | ✅ CORRIGE | 7 prix corriges, colonne remboursement ajoutee, fabricants corriges |
| quel-traitement-glp1-choisir.md | ✅ CORRIGE | 6 sections : prix, remboursement, budgets, tableaux comparatifs |
| partenaires.md | ✅ VERIFIE | Pas de claims prix |

### Collection : glp1-perte-de-poids (2 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| guide-complet-glp1-2025-france.md | ✅ CORRIGE | Faux remboursement obesite retire, 6 corrections prix, tableau corrige |
| glp1-perte-de-poids.md | ✅ VERIFIE | Pas de prix specifiques errones (liens affilies OK) |

### Collection : medecins-glp1-france (5 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| clinique-pour-obesite.md | ✅ CORRIGE | Ozempic 73€→59,90€, Wegovy "en cours evaluation"→"non rembourse" |
| clinique-pour-obesite-new.md | ✅ CORRIGE | Idem |
| diabetologue-paris.md | ✅ VERIFIE | Tarifs consultations OK, pas de prix medicaments |
| endocrinologue-pour-maigrir.md | ✅ VERIFIE | Tarifs consultations OK |
| endocrinologue-pour-maigrir-new.md | ✅ VERIFIE | Tarifs consultations OK |

### Collection : alternatives-glp1 (14 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| alternatives-naturelles-ozempic.md | ✅ CORRIGE | Ozempic 73€→59,90€ |
| 13 autres fichiers | ⚠️ NOTE | Contenu template/placeholder ("XX-XX€/mois") — pas des erreurs factuelles mais articles inacheves |

### Collection : regime-glp1 (15 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| glp1-calories-journalieres.md | ✅ CORRIGE | Ozempic 73€→59,90€, Trulicity 85€→81€, Saxenda 89€→240-300€ |
| jeune-intermittent-glp1.md | ✅ CORRIGE | Ozempic 73€→59,90€, Trulicity 85€→81€ |
| regime-cetogene-glp1.md | ✅ CORRIGE | Ozempic 73€→59,90€, Trulicity 85€→81€ |
| isglt2-liste.md | ✅ VERIFIE | Pas de prix GLP-1 |
| regime-mounjaro-optimal.md | ✅ VERIFIE | Article regime specifique |
| 10 autres fichiers | ⚠️ NOTE | Contenu template/placeholder — articles inacheves |

### Collection : temoignages (4 fichiers)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| 4 fichiers | ✅ VERIFIE | Dosages narratifs plausibles, pas de claims prix/remboursement |

### Collection : recherche-glp1 (1 fichier)

| Fichier | Statut | Corrections |
|---------|--------|-------------|
| recherche-clinique-glp1.md | ⚠️ NOTE | Contenu template/placeholder |

---

## Observations supplementaires

### Articles template/placeholder
Environ 25 fichiers dans les collections alternatives-glp1, regime-glp1 et recherche-glp1 contiennent du contenu genere par template avec des placeholders "XX-XX€/mois". Ces articles n'ont pas d'erreur factuelle a proprement parler mais ne sont pas publication-ready.

### Fichier insulevel
`insulevel-effet-indesirable-new.md` traite d'un complement alimentaire, pas d'un medicament GLP-1. A considerer si cet article a sa place dans la collection effets-secondaires-glp1.

### Fichiers dupliques
Deux paires de fichiers quasi-identiques dans medecins-glp1-france :
- `clinique-pour-obesite.md` / `clinique-pour-obesite-new.md`
- `endocrinologue-pour-maigrir.md` / `endocrinologue-pour-maigrir-new.md`
