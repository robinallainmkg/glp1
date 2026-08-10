# PLAN CROISSANCE 30 JOURS — 10/08 → 10/09/2026

Demandé par Robin le 09/08 (« fait un plan d'action pour qu'on puisse progresser fortement — garde en tête trafic / monétisation du dossier »).
Établi sur les données du run 09/08. Focus : **trafic** (objectif 2) au service de la **monétisation Dossier** (objectif 1).

## Constat de départ (les 4 chiffres qui comptent)

1. **Recovery GSC 39 %** — et la perte est CONCENTRÉE : 4 pages money (carte-prix, prix-mounjaro-france, prix-wegovy-france, prix-ozempic-france) faisaient ~60 % des clics baseline ; prix-mounjaro-france est à 2 clics/7j vs 411 sur la baseline (indexée mais reléguée post-suspension).
2. **Baisse actuelle = demande saisonnière** (positions stables, impressions -50 % sur les requêtes money, CTR stable) → la rentrée fin août est une fenêtre : il faut que les pages soient réparées AVANT.
3. **Funnel Dossier : K1 0,99 %** (144 sessions funnel/30j sur 14 515) → 6 dossiers → 3 payés → **1 remboursé** (« réponse ChatGPT décevante »). Le goulot est double : exposition (K1) ET valeur perçue du produit livré.
4. **Machine à contenu à l'arrêt** : content-plan épuisé le 09/08 → 0 article publiable = 0 nouveau point d'entrée SEO.

## AXE 1 — Réparer les 4 pages money avant la rentrée (trafic)

| # | Action | Qui | Quand |
|---|---|---|---|
| 1.1 | **Refresh complet 1 page money par run** (ordre : prix-mounjaro-france → prix-wegovy-france → prix-ozempic-france → carte-prix) : données août 2026 revérifiées, FAQ enrichie, updatedAt, ajout des liens vers les hubs pharmacies (la fraîcheur + le signal de mise à jour sont nos seuls leviers de repositionnement on-page) | Routine (autonome) | 4 prochains runs |
| 1.2 | Après chaque refresh : URL en tête de file gsc-submission-queue.md pour re-inspection | Routine → Robin | au fil de l'eau |
| 1.3 | **Maillage dept → national** : ajouter dans PrixDeptContent.astro le lien vers la page prix nationale du médicament (306 pages, 1 template). Les pages ville le font déjà. | Routine (autonome) | prochain run |
| 1.4 | **Énigme « ozempic wegovy penurie »** (396 imp/7j, position 3-4, 0 clic depuis 3 semaines malgré nouveau title) : analyse SERP réelle (WebSearch) pour identifier la feature qui capte le clic | Routine (autonome) | prochain run |
| 1.5 | Suivi hebdo indexation palier 2 pharmacies (851 pages actives, 3 638 imp/7j) : si les clics suivent (>50/sem), proposer palier 3 à Robin — pas avant | Routine → décision Robin | ~fin août |

## AXE 2 — Monétisation : exposition x2 + réparer la valeur produit

| # | Action | Qui | Quand |
|---|---|---|---|
| 2.1 | **Email J0 de livraison automatique post-achat** (« votre dossier est prêt » + lien /mon-espace/dossier/) — aujourd'hui, l'acheteur qui ferme l'onglet Stripe n'a AUCUN moyen de retrouver son dossier (cause racine du fiasco Mazzella). Implémentation : appel send-feedback-email depuis stripe-webhook après generate-dossier | Routine (autonome, backlog K1 n°6) | prochain run |
| 2.2 | **Audit qualité du dossier généré** : générer un dossier de test, le lire comme un client, lister les sections faibles (verdict générique ? CSO réels du département ? reste à charge chiffré ?). Rapport → si l'amélioration touche la promesse produit : specs à Robin ; sinon exécution directe | Routine, puis décision Robin si structurel | sous 3 runs |
| 2.3 | Suivi indexation /outils/test-eligibilite/ (soumise GSC 09/08) : premières impressions attendues sous ~1 semaine ; si 0 imp au 16/08 → re-signalement unique | Routine | chaque run |
| 2.4 | Séquences email : maintien J0/J+3/J+7 leads + relance checkout (fait systématiquement) ; **J+7 Lamia due le 10/08** | Routine | chaque run |
| 2.5 | K1 item 5 : encarts test-éligibilité sur pages prix ville/dept — **constaté déjà en place le 09/08** (templates vérifiés). Rien à faire, suivre K1 | — | — |

## AXE 3 — Relancer la machine à contenu (4 sujets ajoutés au plan)

Ajoutés à content-plan.md le 09/08 (veto 24 h — « go plan » de Robin = publiables dès demain) :
- **P1a. Délai de rendez-vous CSO/CHU 2026 : combien de temps, comment accélérer (courrier d'adressage type)** — l'intention exacte de nos clients payants ; cas vécu Coach 08/08 (patiente Lille, CHU injoignable). Contenu funnel : CTA Dossier natif.
- **P1b. Suivi nutritionnel 6 mois : comment le documenter pour être remboursé** — le critère bloquant de 2 leads sur 3 cette semaine (verdicts eligible_apres_suivi).
- **P2a. Ozempic pour maigrir : prix réel et pourquoi il n'est pas remboursé pour l'obésité** — 144 imp/14j pos 14,6, 0 clic, aucune page sur l'intent « maigrir » (distinct de prix-ozempic-france, intent diabète).
- **P3a. Retraite yoga et perte de poids en France : le comparatif** — roadmap retraites validée (cluster leader, pos 8 à J+14).

Cadence 1 article/run maintenue. Boucle de mesure : colonne Suivi J+7/J+30 à remplir cette semaine pour les 8 articles publiés depuis le 01/08 (premières échéances J+7 les 08-14/08) ; 2 articles invisibles à J+30 sur un même cluster = stop cluster.

## Cibles au 10/09 (mesurées dans chaque rapport A0)

- **Recovery GSC : 39 % → 55 %+** (refresh money pages + rentrée + maillage)
- **K1 : 0,99 % → 2 %** (indexation test-éligibilité + articles funnel P1)
- **Ventes nettes : 2 → 8-10 cumulées** (mécanique : K1 2 % × K2-K4 constants ≈ 6 ventes/mois)
- **0 nouveau remboursement** (email J0 + qualité dossier)
- Échec assumé si au 25/08 la demande ne remonte pas à la rentrée → pivot : analyse SERP concurrentielle complète des 5 requêtes têtes (J7 audit) et révision du plan.

## Décisions demandées à Robin

1. **« go plan »** → les 4 sujets d'articles sont publiables dès demain (sinon veto 24 h par défaut).
2. **« go dossier »** → j'audite et j'améliore le contenu du dossier généré (sans toucher au prix de 4,99 €).
3. Palier 3 pharmacies : PAS maintenant — je te le reproposerai avec les chiffres de clics du palier 2 (~fin août).
