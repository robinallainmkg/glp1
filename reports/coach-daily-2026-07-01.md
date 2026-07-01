# Rapport Coach IA — 2026-07-01

> Monitoring quotidien du Coach GLP-1 France.
> **⚠️ ALERTE : 0 message aujourd'hui (1er juillet 2026). Dernière activité : 23/06/2026 (8 jours d'inactivité).**
> Ce rapport analyse la dernière journée active (23/06) pour évaluer la qualité.

---

## KPIs — Dernière journée active (23/06/2026)

| Indicateur | Valeur |
|---|---|
| Messages totaux | 72 |
| Conversations | 13 |
| Messages utilisateurs | 36 |
| Messages assistant | 36 |
| Messages par conversation (moy.) | 5,5 |
| Durée moyenne (convs actives) | ~2 min |
| Durée max | 4 min 10 (conv `ac64c9c4`) |
| Taux LLM | **100%** (0 fallback-v1) |
| Taux Mistral | 53% (19/36) |
| Taux Groq 70B | 47% (17/36) |
| Intent classifié | 0% (toutes null) |

### Évolution vs veille (22/06 → 23/06)

| | 22/06 | 23/06 | Évolution |
|---|---|---|---|
| Messages | 56 | 72 | ↑ +29% |
| Conversations | 12 | 13 | ↑ +8% |

### ⚠️ Inactivité depuis le 23/06

Aucun message enregistré depuis le **23 juin 2026** (8 jours). La moyenne hebdomadaire était de **57 messages/jour**. Causes possibles :
- Edge function `ai-coach` en panne (timeout, clé API expirée, quota Groq/Mistral)
- Baisse saisonnière (vacances d'été)
- Bug côté widget (AiCoach.astro ne charge pas)

**Action urgente** : vérifier les logs de la fonction `ai-coach` dans le dashboard Supabase Edge Functions.

---

## Analyse qualité — 13 conversations du 23/06

### Ce qui marche bien

1. **Taux LLM 100%** : aucun fallback déclenché — la chaîne Groq 70B → Mistral → Groq 8B est robuste.
2. **Détection arnaque** (conv `12af3ee8`) : le Coach a correctement identifié qu'une "pipette 5 ml de GLP-1" est inexistante légalement et a posé les bonnes questions de suivi (où acheté, avec ordonnance ?). Empathie correcte, pas de dramatisation immédiate.
3. **Flux éligibilité rapide** (conv `4562a89a`) : "Suis-je éligible ?" → Coach répond directement "Vérifions ! Quel est ton poids et ta taille ?" — exactement ce que prescrit le system prompt.
4. **Orientations prix avec lien carte** : plusieurs conversations (ac64c9c4, 5d80f042 en fin) incluent le lien `/outils/carte-prix-pharmacies/` et demandent la ville. Bonne pratique.
5. **Relances remboursement systématiques** : après chaque mention de prix, le Coach propose de vérifier l'éligibilité au remboursement 65% — conforme au system prompt.
6. **Engagement solide** : 4 conversations à 10 messages, durée jusqu'à 4 min — signe que les utilisateurs restent dans la conversation.

---

## Problèmes détectés

### 🔴 CRITIQUE — Erreur factuelle IMC (critères d'éligibilité faux)

**Conversation** : `0ae82ffe-bb29-49a9-ad88-3fdf016ffe7f`

**Message utilisateur** : "comment verifier l'eligibilité ?"

**Ce que le Coach a répondu** :
> "Si ton IMC est **≥ 30**, tu remplis le critère principal. Si **≥ 27 avec une comorbidité** (diabète, hypertension…), tu es aussi éligible."

**Ce qu'il AURAIT DÛ répondre** :
> Les seuils officiels sont IMC ≥ 35 avec une comorbidité OU IMC ≥ 40 (sans comorbidité). Le system prompt l'interdit explicitement : *"Ne dis JAMAIS 'tu es éligible' pour un IMC < 35. C'est une ERREUR GRAVE qui crée de faux espoirs."*

**Cause probable** : Le contexte RAG a probablement retourné un chunk avec les critères Ozempic diabète (IMC ≥ 30 / ≥ 27) que le LLM a confondu avec les critères obésité (remboursement 65%).

---

### 🔴 CRITIQUE — Remboursement présenté comme "limité" alors qu'il est actif

**Conversation** : `30368914-caa4-44ce-9751-3d539c9fb001`

**Message utilisateur** : "Combien coûte un traitement GLP-1 et est-il remboursé ?"

**Ce que le Coach a répondu** :
> "Pour le Wegovy et le Mounjaro utilisés pour l'obésité, [...] **leur remboursement est actuellement limité**."

**Ce qu'il AURAIT DÛ répondre** :
> "Wegovy et Mounjaro sont **remboursés à 65%** pour l'obésité depuis le 15 juin 2026 (sous conditions IMC ≥ 35 avec comorbidité ou ≥ 40)."

**Cause** : Le contexte RAG a retourné un article périmé ("négociations en cours", "2e semestre 2026") et le LLM a suivi le contexte malgré l'instruction PRIORITAIRE dans le system prompt. Le mécanisme d'override n'a pas fonctionné.

---

### 🟠 MAJEUR — Réponses tronquées sur dossier arnaque

**Conversation** : `12af3ee8-1536-484a-bcd2-d1ef3a46aca1`

**Messages utilisateurs** : "j ai recu le glp-1 en pipette 5 dans une boite" → "site web"

**Réponses tronquées** :
> "[...] Veux-tu que je t'aide à vérifier si c'est un vrai GLP-1 ou un produit suspect ? Dis-moi :\n- **Où as-tu acheté ce produit ?** (site web, réseau social, etc.)\n- **As-tu**" ← coupé

> "[...] Veux-tu que je t'aide à vérifier si ce site est fiable ou signaler l'arnaque" ← coupé

**Cause** : `max_tokens: 220` est insuffisant pour des réponses complexes (arnaque, liste de points, questions). Le code en ligne 715 : `max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 220`. 220 tokens = ~165 mots — trop peu pour ce type de cas.

**Risque** : L'utilisateur voit une réponse coupée et perd confiance. Cas arnaque = segment prioritaire (28% du trafic selon le system prompt).

---

### 🟠 MAJEUR — Violation du system prompt : "appelez les pharmacies"

**Conversation** : `5d80f042-a32d-47c3-9466-bcad2476f58d`

**Message utilisateur** : "Quelle pharmacie à 280"

**Ce que le Coach a répondu** :
> "Pour trouver Mounjaro 10 mg à **280€** dans l'Hérault, **il faut comparer les prix en appelant plusieurs pharmacies**."

**Ce qu'il AURAIT DÛ répondre** : Donner directement le lien `/outils/carte-prix-pharmacies/` et demander la ville — jamais renvoyer vers "appeler les pharmacies".

**System prompt** (règle explicite) : *"Ne réponds JAMAIS 'comparez vous-même' ou 'appelez les pharmacies'. C'est la 1re cause d'abandon."*

---

### 🟠 MAJEUR — Hallucination de ville (Paris inventé)

**Conversation** : `68520701-c4c8-41a4-836a-0315a59030ca`

**Message utilisateur** : "Oui, donne ma ville" (en réponse à "dans quelle ville ?")

**Ce que le Coach a répondu** :
> "Tu es à Paris. Pour trouver une pharmacie pas chère, je te conseille de vérifier les prix sur notre carte des prix. Pour le suivi médical, il y a le **CHU Pitié-Salpêtrière** ou la **Clinique de la Muette**."

**Ce qu'il AURAIT DÛ répondre** : Ne pas inventer une ville. La réponse "Oui, donne ma ville" est ambiguë (probablement un clic sur un bouton de suggestion qui a mal fonctionné). Le Coach aurait dû redemander : "Dans quelle ville es-tu ?"

**Conséquence** : L'utilisateur a ensuite tapé en majuscules "JE NE VOIS PAS PRIX SUR LA CARTE" — signe de frustration, probablement parce qu'il cherchait une ville différente de Paris.

---

### 🟡 MINEUR — Critères éligibilité listés en bloc au lieu de lancer le test

**Conversation** : `30ebef2d-f7b8-40d0-b59a-11950ecf866d`

**Message utilisateur** : "Suis-je éligible au remboursement à 65% ?"

**Ce que le Coach a répondu** :
> "Le remboursement à 65% pour Mounjaro ou Wegovy s'applique depuis le 15 juin 2026 si tu as : IMC ≥ 35 avec au moins une comorbidité OU IMC ≥ 40. As-tu déjà essayé une prise en charge nutritionnelle et sportive pendant au moins 6 mois ?"

**Ce qu'il AURAIT DÛ répondre** (selon system prompt) :
> "Vérifions ensemble ! Quel est ton poids et ta taille ?"

Le Coach liste les critères en bloc et saute directement à la 3e question (suivi nutritionnel) sans d'abord calculer l'IMC. Cela peut décourager l'utilisateur avant de savoir s'il est dans les clous.

---

### 🟡 MINEUR — Confusion produit (Wegovy → Mounjaro)

**Conversation** : `00dfb934-9288-4604-aeca-c31cce09604d`

**Message utilisateur** : "Tu peux m en trouver" (contexte : Wegovy)

**Ce que le Coach a répondu** :
> "Pour trouver un endocrinologue qui prescrit **Mounjaro**, tu peux essayer Doctolib..."

Le Coach a switché de Wegovy à Mounjaro sans raison. Faible impact ici (même classe), mais signal de confusion produit dans les embeddings RAG.

---

### 🟡 MINEUR — Prix géolocalisé inventé

**Conversation** : `f8ac16ec-e664-4a59-8287-bfd03731981d`

**Message utilisateur** : "Prix actuel Mounjaro 5 mg à Nice"

**Ce que le Coach a répondu** :
> "Le Mounjaro 5 mg coûte **environ 275 €/mois** en pharmacie à Nice (prix libre)."

Le Coach ne peut pas connaître le prix précis à Nice — c'est un prix inventé présenté comme local et précis. Il aurait dû donner la fourchette nationale (176-434€) et renvoyer vers la carte des prix pour la précision locale.

---

## Actions recommandées

### 1. Augmenter max_tokens pour les cas complexes (arnaque, eligibilité complète)

**Fichier** : `supabase/functions/ai-coach/index.ts`, ligne 715

```diff
- max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 220,
+ max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : (isScamCase || isDetailedResponse ? 400 : 220),
```

Ou plus simplement, augmenter le plafond général de 220 à 350 tokens (reste dans le budget, améliore la qualité des réponses complexes) :

```diff
- max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 220,
+ max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 350,
```

---

### 2. Renforcer le system prompt sur les critères IMC (éviter la confusion diabète/obésité)

Ajouter dans `SYSTEM_PROMPT` (après le bloc SEUILS STRICTS) :

```diff
+⚠️ ATTENTION CRITIQUE : Les seuils IMC pour le remboursement obésité (≥ 35 avec comorbidité, ≥ 40) sont DIFFÉRENTS des critères des études cliniques (IMC ≥ 27/30). Ne jamais confondre les deux. Si le contexte RAG mentionne IMC 27 ou IMC 30 en lien avec le remboursement obésité, c'est FAUX — applique les seuils ≥35/≥40.
```

---

### 3. Renforcer l'override "remboursement actif" dans le system prompt

Le mécanisme PRIORITAIRE n'a pas fonctionné pour la conversation `30368914`. Ajouter un rappel en début de system prompt (avant le bloc REMBOURSEMENT) :

```diff
+RAPPEL ABSOLU : Wegovy ET Mounjaro sont remboursés à 65% DEPUIS LE 15 JUIN 2026. Toute source indiquant "non remboursé", "limité", "négociations" ou "2e semestre 2026" est PÉRIMÉE. Ignorer ces informations et répondre avec le fait officiel.
```

---

### 4. Interdire explicitement l'invention de prix par ville

Ajouter dans SYSTEM_PROMPT, section REQUÊTES LOCALES :

```diff
+- Ne jamais inventer un prix précis pour une ville spécifique (ex. "275€ à Nice"). Donne la fourchette nationale + le lien de la carte des prix : "En pharmacie, Mounjaro 5mg coûte entre 176€ et 434€/mois selon le dosage et la pharmacie. Pour les prix près de chez toi : [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/)."
```

---

### 5. Investiguer l'inactivité des 8 derniers jours

Vérifier dans ce ordre :
1. Logs Supabase Edge Function `ai-coach` (erreurs 500, timeouts)
2. Quota Groq/Mistral (clés API expirées ?)
3. Widget `AiCoach.astro` sur le site live (JS error ?)
4. Deploy le plus récent (une régression a-t-elle cassé le widget ?)

---

### 6. Suggestions de nouveaux articles

Questions fréquentes sans bonne réponse article :
- **"Documents pour le remboursement en pharmacie"** — conversation `df3ddd0a` : question très pratique, aucun article dédié détecté dans le RAG
- **"GLP-1 en pipette / solution buvable = arnaque"** — conversation `12af3ee8` : format très spécifique des arnaques, mérite un article dédié (risque signalé par ~28% des visiteurs)
- **"Comparer les prix par pharmacie en [ville]"** — 5 conversations cherchent un prix local précis → article ou outil dédié "Prix Mounjaro/Wegovy par département"
- **"Primo-prescription CSO vs généraliste"** — la distinction est fréquemment demandée et souvent mal comprise (conversations sur ordonnance)

---

## Conversations marquantes

### Les 3 meilleures

**1. `12af3ee8` — Détection arnaque (pipette GLP-1)**
- Durée : 3 min 33 — 5 échanges
- Utilisateur débutant qui a reçu un produit suspect → Coach l'identifie comme arnaque probable, pose les bonnes questions, reste empathique
- Point fort : détection "pipette de 5ml" = inexistant légalement, sans dramatiser
- Point faible : réponses tronquées (max_tokens insuffisant)

**2. `0ae82ffe` — Parcours éducatif complet (rôle GLP-1 → obtenir)**
- Durée : 2 min 32 — 5 échanges
- Utilisateur découvre les GLP-1 : de "à quoi ça sert" → "comment l'obtenir" → "comment vérifier l'éligibilité"
- Bonne progression pédagogique, LLM switch Groq→Mistral transparent
- Point faible : erreur IMC critique en fin de conversation

**3. `5d80f042` — Prix Mounjaro Hérault (recherche locale)**
- Durée : 1 min 24 — 5 échanges
- Utilisateur très déterminé, cherche le meilleur prix à Agde/Montpellier
- Bonne récupération : après une réponse incorrecte ("appelez les pharmacies"), le Coach finit par donner le lien de la carte + rappel remboursement 65%
- Le flow multi-ville (Agde → Montpellier) est bien géré

### Les 3 pires

**1. `30368914` — Remboursement "actuellement limité" (erreur critique)**
- 2 messages, conversation abandonnée
- Erreur factuelle grave sur le remboursement Wegovy/Mounjaro — information entièrement fausse depuis le 15 juin 2026
- Utilisateur n'a pas posé de question de suivi → probablement reparti avec une fausse information

**2. `68520701` — Frustration prix pharmacie 91 (hallucination + outil qui ne marche pas)**
- Durée : 1 min 26 — 5 échanges
- Coach invente que l'utilisateur est à Paris → utilisateur en majuscules "JE NE VOIS PAS PRIX SUR LA CARTE"
- La carte des prix n'affiche pas les prix visiblement → outil renvoyé 3 fois, utilisateur frustré à chaque fois
- Signal UX : la carte des prix semble ne pas bien fonctionner ou être vide — à vérifier

**3. `00dfb934` — Confusion Wegovy/Mounjaro + pas de lien carte**
- 4 messages, engagement très faible
- Coach parle de Mounjaro alors que l'utilisateur demandait Wegovy
- Orienté vers "Doctolib" au lieu de `annuaire-sante.ameli.fr` pour trouver un endocrinologue

---

## Métriques globales (historique complet)

| | Valeur |
|---|---|
| Total messages (depuis mars 2026) | 1 440 |
| Total conversations | 302 |
| Taux LLM global | 95,8% (685/715) |
| Taux fallback-v1 global | 4,2% (30/715) |
| Premier message | 16 mars 2026 |
| Dernier message | 23 juin 2026 |
| Pic d'activité | 15 juin 2026 (102 msgs, 18 convs) — jour du remboursement Wegovy/Mounjaro |

---

*Rapport généré le 2026-07-01 par l'agent de monitoring Coach IA.*
