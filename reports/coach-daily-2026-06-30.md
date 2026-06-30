# Rapport Coach IA — 30 juin 2026

> **ALERTE CRITIQUE : PANNE TOTALE — 7 jours sans aucun message (24 juin → 30 juin)**

---

## KPIs

| Métrique | Aujourd'hui (30/06) | Hier (29/06) | J-7 (23/06) | Évolution |
|---|---|---|---|---|
| Messages totaux | **0** | **0** | 72 | ↓↓↓ |
| Conversations | **0** | **0** | 13 | ↓↓↓ |
| Messages / conv | — | — | 5,5 | — |
| Taux LLM | — | — | ~95% Groq+Mistral | — |
| Taux fallback-v1 | — | — | ~5% | — |

### Activité des 14 derniers jours

| Date | Messages | Conversations |
|---|---|---|
| 2026-06-23 | 72 | 13 |
| 2026-06-22 | 56 | 12 |
| 2026-06-21 | 32 | 6 |
| 2026-06-20 | 50 | 9 |
| 2026-06-19 | 78 | 14 |
| 2026-06-18 | 66 | 12 |
| 2026-06-17 | 38 | 8 |
| 2026-06-16 | 60 | 10 |
| **2026-06-24** | **0** | **0** |
| **2026-06-25** | **0** | **0** |
| **2026-06-26** | **0** | **0** |
| **2026-06-27** | **0** | **0** |
| **2026-06-28** | **0** | **0** |
| **2026-06-29** | **0** | **0** |
| **2026-06-30** | **0** | **0** |

**Dernier message reçu : 2026-06-23 21:23:40 UTC**  
**Total base : 1 440 messages depuis mars 2026**

---

## ALERTE CRITIQUE — Panne de 7 jours

Le Coach IA est **silencieux depuis le 24 juin 2026** (7 jours consécutifs à zéro). Cela représente une perte estimée de **~400 conversations** et d'un revenu Dossier GLP-1 potentiel significatif.

### Causes probables (à vérifier en priorité)

1. **Clé API Groq ou Mistral expirée** — La chaîne LLM tombe en silence si les deux clés échouent. Le fallback-v1 devrait prendre le relai mais n'enregistre rien non plus = problème en amont.
2. **Widget AiCoach cassé côté front** — Un déploiement FTP entre le 23 et le 24 juin a pu rompre le composant `AiCoach.astro` ou son initialisation JS.
3. **CORS / Edge Function muette** — La fonction `ai-coach` pourrait retourner 500 ou être inaccessible sans enregistrer dans `coach_messages`.
4. **Daily limit IP bloquant tous les visiteurs** — Improbable mais un bug dans la logique `ipDailyKey` pourrait bloquer toutes les IPs.

### Actions correctives immédiates

```bash
# 1. Vérifier les logs de l'Edge Function
# → Dashboard Supabase > Edge Functions > ai-coach > Logs

# 2. Tester l'Edge Function directement
curl -X POST https://ywekaivgjzsmdocchvum.supabase.co/functions/v1/ai-coach \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" \
  -d '{"session_id":"test-debug-001","message":"Bonjour"}'

# 3. Vérifier les déploiements FTP entre le 23 et 24 juin
# → GitHub Actions > deploy-hostinger.yml > runs du 23-24 juin

# 4. Tester le widget sur le site live
# → Ouvrir glp1-france.fr, inspecter la console JS, chercher erreurs réseau
```

---

## Analyse qualité — Dernière journée active (23 juin 2026)

*Basée sur 72 messages / 13 conversations. Analyse de 12 conversations complètes.*

### Modèles utilisés
- `llama-3.3-70b-versatile` (Groq) : ~55% des réponses assistant
- `mistral-small-latest` (Mistral) : ~45% (fallback rate-limit Groq)
- `fallback-v1` : 0 occurrences visibles

---

## Ce qui marche bien

1. **Protocole arnaque exemplaire** (`12af3ee8`) : Quand l'utilisateur révèle avoir reçu un "GLP-1 en pipette 5 dans une boite", le Coach identifie correctement le produit suspect, reste empathique et sans jugement, liste les types de produits douteux possibles. Très bon respect du protocole anti-arnaque.

2. **Funnel éligibilité** (`4562a89a`) : "Suis-je éligible au remboursement de Wegovy ?" → "Vérifions ensemble ! Quel est ton poids et ta taille ?" — Réponse parfaite : courte, actionnable, lance le flux IMC immédiatement sans lister les critères en bloc.

3. **Prix locaux précis** (`f8ac16ec`, `5d80f042`) : Pour les requêtes de prix géolocalisées (Nice, Hérault), le Coach donne des fourchettes de prix pertinentes et enchaîne systématiquement sur le remboursement. Bon flux.

4. **Chaîne LLM multi-fournisseurs** : La bascule Groq → Mistral fonctionne correctement (visible dans les modèles utilisés). Aucune erreur de failover observée le 23 juin.

---

## Problèmes détectés

### 🔴 CRITIQUE — Erreurs factuelles

**Problème 1 : Seuils IMC erronés**
- **Conv** : `0ae82ffe-bb29-49a9-ad88-3fdf016ffe7f`
- **Message user** : "comment vérifier l'éligibilité ?"
- **Réponse Coach** : "Si ton IMC est **≥ 30**, tu remplis le critère principal. Si **≥ 27 avec une comorbidité** (diabète, hypertension…), tu es aussi éligible."
- **Ce qu'il AURAIT DÛ répondre** : Les seuils corrects sont **IMC ≥ 35 avec comorbidité** ou **IMC ≥ 40** (sans comorbidité). Les seuils ≥30 et ≥27 correspondent aux anciens critères de prescription de l'AMM (avant remboursement obésité), pas aux critères de remboursement de la Sécurité Sociale.
- **Impact** : Crée de faux espoirs pour des patients IMC 28-34 qui ne seront pas remboursés.

**Problème 2 : Remboursement nié pour Wegovy/Mounjaro**
- **Conv** : `30368914-caa4-44ce-9751-3d539c9fb001`
- **Message user** : "Combien coûte un traitement GLP-1 et est-il remboursé ?"
- **Réponse Coach** : "...pour le Wegovy (sémaglutide 2,4 mg) et le Mounjaro (tirzépatide) utilisés pour l'obésité, les prix sont respectivement de ~250 à 290 €/mois et de 230 à 440 €/mois, **mais leur remboursement est actuellement limité**."
- **Ce qu'il AURAIT DÛ répondre** : "Wegovy et Mounjaro sont **remboursés à 65%** pour l'obésité depuis le 15 juin 2026 (IMC ≥ 35 avec comorbidité ou ≥ 40, primo-prescription en CSO/CHU)."
- **Impact** : Désinformation majeure. Le system prompt est pourtant explicite sur ce point ("⚠️ CE FAIT EST PRIORITAIRE SUR LE CONTEXTE").

**Problème 3 : Réponse tronquée mid-phrase**
- **Conv** : `12af3ee8-1536-484a-bcd2-d1ef3a46aca1`
- **Réponse** : se termine par "As-tu" (coupée net) — visible dans la réponse du 21:23:20 UTC
- **Cause** : `max_tokens: 220` insuffisant quand Mistral génère une réponse longue (liste à puces + avertissement). La réponse était trop longue et a été coupée côté LLM.

### 🟠 QUALITÉ — Comportements incorrects

**Problème 4 : Hallucination géographique**
- **Conv** : `68520701-c4c8-41a4-836a-0315a59030ca`
- **Message user** : "Oui, donne ma ville" (réponse ambiguë — l'user voulait dire "je vais te donner ma ville")
- **Réponse Coach** : "Tu es à Paris."
- **Ce qu'il AURAIT DÛ répondre** : "Dans quelle ville es-tu ?" — il ne connaît pas la ville.

**Problème 5 : Boucle de répétition sur "Oui"**
- **Conv** : `8aa02a94-bf15-4a40-a130-58b26d8e1ceb`
- **Message user** : "Oui" (après que le Coach avait proposé de vérifier le remboursement)
- **Réponse Coach** : réponse identique mot pour mot à la précédente — le Coach n'a pas compris que "Oui" était une acceptation et a rebouclé.
- **Ce qu'il AURAIT DÛ répondre** : Lancer le flux éligibilité : "Quel est ton poids et ta taille ?"

**Problème 6 : Violation règle "ne jamais dire d'appeler les pharmacies"**
- **Conv** : `5d80f042-a32d-47c3-9466-bcad2476f58d`
- **Réponse Coach** : "il faut comparer les prix en appelant plusieurs pharmacies"
- **Ce qu'il AURAIT DÛ répondre** : Donner directement la carte des prix + demander la ville précise. Le system prompt (ligne 81) interdit explicitement "appelez les pharmacies".

**Problème 7 : Carte des prix inutilisable**
- **Conv** : `68520701-c4c8-41a4-836a-0315a59030ca`
- **User** (en majuscules) : "JE NE VOIS PAS PRIX SUR LA CARTE"
- **Problème systémique** : Plusieurs utilisateurs sont renvoyés vers `/outils/carte-prix-pharmacies/` mais ne trouvent pas de prix. L'outil est peut-être vide, cassé, ou l'UX n'est pas claire.
- **Impact** : Frustration, abandon, perte de confiance.

**Problème 8 : Salutation erronée (Bonjour/Bonsoir)**
- **Conv** : `12af3ee8-1536-484a-bcd2-d1ef3a46aca1`
- User dit "Bonsoir" → Coach répond "Bonjour !"
- Mineur mais perceptible.

**Problème 9 : Document inventé**
- **Conv** : `df3ddd0a-ab65-4d34-b3e4-f1498fcc1be2`
- **Réponse Coach** : "Le justificatif de prescription complété et signé par le médecin" — ce document n'existe pas tel quel en pharmacie française pour les GLP-1. La réponse correcte est : carte Vitale + ordonnance médicale + carte mutuelle.

**Problème 10 : Prix Wegovy 0.5mg sous-évalué**
- **Conv** : `5887800f-e894-424b-8794-c4135cc41857`
- **Réponse** : "le coût mensuel estimé est d'environ 210 € pour ce dosage [Wegovy 0.5mg]"
- **Correct** : Wegovy 0.5mg ≈ 147€/mois (dosage d'induction, pas le plein prix). 210€ n'est pas le prix officiel.

---

## Actions recommandées

### 1. URGENT — Diagnostiquer la panne (7 jours)

Vérifier dans cet ordre :
1. Logs Supabase Edge Function `ai-coach`
2. Test curl direct de l'Edge Function
3. Inspecter les GitHub Actions deploys du 23-24 juin
4. Tester le widget sur le site live (console navigateur)

### 2. Fix system prompt — Seuils IMC

Le LLM confond parfois les seuils AMM (prescription) avec les seuils remboursement SS. Ajouter dans le system prompt :

```diff
 FLUX "SUIS-JE ÉLIGIBLE AU REMBOURSEMENT ?" :
+⚠️ NE PAS CONFONDRE les seuils AMM (prescription possible dès IMC ≥ 27-30 selon produit) avec
+les seuils REMBOURSEMENT SS (IMC ≥ 35 avec comorbidité OU ≥ 40). Ces derniers sont STRICTS.
+Si quelqu'un demande l'éligibilité au REMBOURSEMENT, toujours appliquer les seuils SS, jamais les seuils AMM.
```

### 3. Fix system prompt — Répétition sur "Oui"

Ajouter une règle :
```diff
+- Si l'utilisateur répond "Oui", "Ok", "Vas-y", "C'est parti" à une question que tu as posée,
+  considère-le comme une ACCEPTATION et passe à l'étape suivante. Ne répète jamais la même réponse.
```

### 4. Fix max_tokens — Réponses tronquées

Dans `index.ts`, ligne 715 :
```diff
-max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 220,
+max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 350,
```
220 tokens est trop court pour les réponses avec listes. 350 permet des réponses complètes sans dépasser le budget LLM.

### 5. Carte des prix — Bug UX

L'outil `/outils/carte-prix-pharmacies/` semble vide ou cassé. Plusieurs utilisateurs le signalent. **Vérifier si les données de prix sont bien à jour** dans la base et si le composant frontend affiche correctement les prix. Si l'outil est vide, ne plus le recommander jusqu'à la résolution.

Workaround à ajouter dans le system prompt :
```diff
 Pour un prix ou une pharmacie proche : oriente vers la carte des prix du site →
-[Carte des prix en pharmacie](/outils/carte-prix-pharmacies/)
+[Carte des prix en pharmacie](/outils/carte-prix-pharmacies/), et précise qu'il faut
+sélectionner un département dans le filtre pour voir les prix.
```

### 6. Articles à créer (questions sans bonne réponse)

- **"Prix Mounjaro par département"** — Forte demande géolocalisée (Hérault, Nice, 91, Normandie). Un article avec tableau des prix par région aiderait le RAG.
- **"Documents nécessaires pour le remboursement GLP-1 en pharmacie"** — Question posée directement, pas de bonne réponse dans la base.
- **"Que faire si la carte des prix ne fonctionne pas ?"** — FAQ pratique pour gérer la frustration de l'outil.

---

## Conversations marquantes

### Les 3 meilleures

1. **`12af3ee8`** (Pipette arnaque) — Excellent protocole anti-arnaque. Le Coach a bien identifié le produit suspect, rassuré l'utilisateur, et demandé des informations complémentaires avant de conclure. Modèle de la catégorie arnaque.

2. **`f8ac16ec`** (Prix / Nice) — Flux prix + éligibilité très propre. Réponses concises, prix corrects pour Mounjaro 5mg, enchaînement naturel vers le remboursement. 3 échanges bien construits.

3. **`5d80f042`** (Hérault / Agde / Montpellier) — Conversation géolocalisée qui aboutit à un lien utile avec la carte des prix. Bon suivi de la ville donnée par l'utilisateur.

### Les 3 pires

1. **`68520701`** (Pharmacie pas chère / 91) — Le Coach a inventé "Tu es à Paris", n'a pas résolu le problème de carte des prix vide malgré 3 relances user en majuscules, et a répété le même lien sans valeur ajoutée. 8 messages, aucune résolution.

2. **`30368914`** (Prix remboursement) — Erreur factuelle grave : a dit que le remboursement Wegovy/Mounjaro était "limité" alors qu'il est actif depuis le 15 juin. 1 seul échange, information fausse.

3. **`0ae82ffe`** (Éligibilité / IMC) — A donné les seuils IMC incorrects (≥30 au lieu de ≥35). 7 échanges dont plusieurs basés sur de fausses informations d'éligibilité.

---

*Rapport généré le 2026-06-30 — Monitoring automatique Coach IA GLP-1 France*
