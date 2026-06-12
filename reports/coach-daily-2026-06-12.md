# Rapport quotidien Coach IA — 2026-06-12

> Période analysée : 2026-06-11 14h00 UTC → 2026-06-12 12h00 UTC (38h)  
> Source : table `coach_messages`, projet Supabase `ywekaivgjzsmdocchvum`

---

## KPIs

| Métrique | Aujourd'hui | Hier | Variation |
|---|---|---|---|
| Messages totaux | **86** | 54 | +59% ↑ |
| Conversations | **16** | ~10 (estimé) | +60% ↑ |
| Messages utilisateur | **43** | ~27 | +59% ↑ |
| Messages par conv (moy) | **5,4** | ~5,4 | = |
| Durée moy. (convs engagées) | **~2:26** | n/a | — |

### Distribution des modèles (43 réponses assistant)

| Modèle | Nb | % |
|---|---|---|
| llama-3.1-8b-instant | 20 | 46% |
| llama-3.3-70b-versatile | 18 | 42% |
| mistral-small-latest | 5 | 12% |
| fallback-v1 | 0 | 0% |

→ **100% LLM**, 0 fallback déclenché. Le 8b est désormais en tête — signe que le 70b sature en tokens/min sur Groq.

### Breakdown par intent

| Intent | Nb |
|---|---|
| `null` (non classifié) | 42 (97,7%) |
| `scam:low` | 1 (2,3%) |

→ L'intent tracker est quasi inopérant : 97,7% des réponses n'ont pas d'intent. C'est un problème de monitoring, pas de fonctionnement (le LLM répond correctement mais ne passe pas par le classifieur).

### Engagement

| Nb messages | Nb convs |
|---|---|
| 10 | 3 |
| 8 | 3 |
| 6 | 1 |
| 4 | 3 |
| 2 | 5 (abandonné au 1er échange) |

---

## Ce qui marche bien

1. **Zéro fallback** — La chaîne LLM (70b → 8b → mistral) absorbe toute la charge sans jamais tomber sur le moteur de règles. Résilience excellente.

2. **Détection scam correcte** (conv `3743ac35`) — L'intent `scam:low` s'est déclenché proprement sur "Je vais l'acheter sans ordonnance". Le Coach a correctement rappelé l'illégalité et redirigé vers un médecin sans dramatiser.

3. **Flux éligibilité bien orchestré par Mistral** (conv `962adf32`, messages 3-5) — Mistral-small a géré le flux "vérification IMC" proprement : question courte, lien article pertinent, relance naturelle. C'est le meilleur modèle du pipeline sur ce type de flux.

4. **Réponse Mounjaro/CSO par Mistral** (conv `b83209b3`) — Réponse dense et précise sur les conditions de remboursement avec mention explicite CSO/CHU pour la primo-prescription. Format structuré, lien relance, exactement ce qu'attendait le system prompt.

5. **Gestion de l'information remboursement 15 juin** — La majorité des réponses sur le remboursement intègre correctement la date officielle du 15 juin 2026 et le taux 65%.

6. **Conversations longues** — 6 conversations dépassent 8 messages. Taux d'engagement élevé pour un chat sans account.

---

## Problèmes détectés

### 🔴 CRITIQUE — Hallucination "Foundayo" (médicament inexistant)

- **conv** : `224a4424-1773-4f92-8021-d7eae956fbb9`
- **Message user** : `Ongentys 50 mg`
- **Réponse Coach** : *"Si vous cherchez des informations sur les traitements GLP-1, je peux vous aider avec des médicaments comme Wegovy ou **Foundayo**."*
- **Problème** : "Foundayo" n'existe pas. Hallucination pure du modèle `llama-3.3-70b-versatile`. Wegovy est correct, mais il aurait dû citer Ozempic/Mounjaro/Wegovy, pas un médicament inventé.
- **Réponse attendue** : *"Ongentys traite la maladie de Parkinson, pas le surpoids ou le diabète. Si tu cherches un GLP-1 (Ozempic, Wegovy, Mounjaro…), je peux t'aider. Tu veux des infos sur lequel ?"*

---

### 🔴 CRITIQUE — Calcul Harris-Benedict hors sujet (message tronqué non détecté)

- **conv** : `962adf32-7fa4-4bc4-b853-6cb078cd75db`
- **Message user** : `135kg pour1,` (message manifestement tronqué — la taille n'est pas terminée)
- **Réponse Coach** : Calcul des besoins caloriques via Harris-Benedict avec une taille **inventée de 1,75 m**, formules pour hommes et femmes, tableau d'activité… 200+ mots complètement hors sujet.
- **Problème** : Le 8b n'a pas détecté le message tronqué. Au lieu de demander la taille complète, il a inventé une valeur et calculé des besoins caloriques — information qui n'a aucun rapport avec l'éligibilité au remboursement GLP-1.
- **Réponse attendue** : *"Je n'ai pas vu la taille complète — pouvez-vous la préciser ? (ex : 135 kg pour 1,72 m)"*

---

### 🔴 GRAVE — Confusion de produit Mounjaro/Wegovy

- **conv** : `9755fd00-8e69-495f-a3ce-e8b272821ef4`
- **Message user** : `JE SUIS DEJA SOUS TRAIREMENT SERAIS JE REMBOURSER` (contexte : traitement Wegovy)
- **Réponse Coach** : *"Si vous êtes déjà sous traitement avec **Mounjaro**, la perspective du remboursement est très positive…"*
- **Problème** : L'utilisateur parle de Wegovy depuis le début de la conversation. Le Coach substitue Mounjaro. Confusion de produit sur le sujet le plus sensible du moment (annonce remboursement).
- **Réponse attendue** : *"Oui — si vous êtes sous Wegovy et que vous remplissez les critères (IMC ≥ 35 avec comorbidité ou ≥ 40), votre traitement sera remboursé à 65 % dès le 15 juin 2026. On vérifie votre éligibilité ?"*

---

### 🔴 GRAVE — "98 156" non interprété comme poids/taille

- **conv** : `9755fd00-8e69-495f-a3ce-e8b272821ef4`
- **Message user** : `98 156` (suite à la demande de poids + taille)
- **Réponse Coach** : *"Il semble que vous ayez partagé des informations sans poser une question spécifique…"*
- **Problème** : Le Coach venait de demander poids + taille. L'utilisateur répond "98 156" (98 kg, 156 cm → IMC = 40,3 → éligible sans comorbidité). Le 70b ne fait pas le lien. IMC de 40,3 est au-dessus du seuil et l'utilisateur aurait dû recevoir un verdict positif immédiat.
- **Réponse attendue** : *"Avec 98 kg pour 1,56 m, ton IMC est de 40,3 — au-dessus du seuil de 40 qui permet le remboursement sans comorbidité. Tu es donc éligible à 65 % dès le 15 juin. On prépare ton dossier ?"*

---

### 🟠 MOYEN — Carte des prix jamais fournie (violation répétée du system prompt)

- **convs concernées** : `eab30870` (3 échanges), `b449721d` (1er échange)
- **Problème** : Le system prompt est explicite : *"Pour un prix ou une pharmacie proche : oriente vers la carte des prix du site → [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/)"*. Dans les deux conversations, le Coach dit "consulter la carte des prix sur notre site" **sans jamais fournir le lien** `/outils/carte-prix-pharmacies/`. C'est la 1re cause d'abandon selon le system prompt.
- **Fix requis** : Renforcer l'instruction dans le system prompt avec le lien en dur.

---

### 🟠 MOYEN — Architecture RAG exposée à l'utilisateur

- **conv** : `962adf32-7fa4-4bc4-b853-6cb078cd75db`
- **Message user** : `Oui` (après avoir dit vouloir vérifier son éligibilité)
- **Réponse Coach** : *"Malheureusement, le contexte factuel fourni ne permet pas de déterminer si vous êtes éligible… Les informations fournies concernent la transition vers le nouveau stylo Ozempic 3ml…"*
- **Problème** : Le 8b expose au visiteur qu'il travaille avec un "contexte factuel" issu du RAG, et qu'il ne peut pas répondre car ce contexte est hors sujet. C'est une fuite d'architecture qui brise la confiance et ne fait pas avancer la conversation.
- **Réponse attendue** : Si le contexte RAG est hors sujet, ignorer et continuer le flux : *"Pour vérifier ton éligibilité, quelle est ta taille et ton poids ?"*

---

### 🟠 MOYEN — Double réponse simultanée (bug de concurrence)

- **conv** : `683ee426-50e2-4cd9-be64-feebcfb2944a`
- **Timestamps** : deux réponses assistant à `07:28:32` et `07:28:35` (3 secondes d'écart, modèles différents 70b et 8b)
- **Cause probable** : L'utilisateur a envoyé deux messages très rapprochés ("Je parle que mounjaro…" puis "poche"), chacun a déclenché une requête indépendante. Le résultat est deux réponses assistant affichées à la suite dans le même tour, ce qui désoriente l'utilisateur.
- **Fix** : Implémenter un debounce côté widget (300-500ms) avant d'envoyer au backend.

---

### 🟠 MOYEN — Confusion remboursement Diabète T2 ALD vs Obésité (Mounjaro)

- **conv** : `683ee426-50e2-4cd9-be64-feebcfb2944a`
- **Message user** : `Je parle que mounjaro. Diabète type 2 en ald reconnu ai je droit?`
- **Réponse Coach** : Répond que "Mounjaro peut être utilisé en complément d'un régime" et redirige vers le remboursement obésité 15 juin → confond les deux voies.
- **Problème** : Un patient diabète T2 ALD avec Mounjaro a droit au remboursement via la voie **diabète** (Mounjaro est indiqué T2), distincte du remboursement obésité. Le Coach ne fait pas cette distinction et parle d'obésité alors que l'utilisateur a décrit un contexte diabète.
- **Réponse attendue** : *"Oui — Mounjaro est remboursé pour le diabète de type 2 via votre ALD30. Si votre médecin vous l'a prescrit dans ce cadre, c'est remboursé indépendamment du décret obésité du 15 juin. Vérifiez avec votre pharmacien que l'ordonnance mentionne bien 'diabète de type 2'."*

---

### 🟡 MINEUR — Lien article hors sujet pour question Mounjaro

- **conv** : `b449721d-e45d-4e49-9dd6-985d4204117a`
- **Contexte** : Question sur le prix Mounjaro 7,5 mg à Roissy-en-Brie
- **Réponse Coach** : Lien vers *"Nouveau Stylo Ozempic 3ml 2026 : Guide Patients"* → complètement hors sujet pour une question sur Mounjaro.
- **Cause** : Le RAG a probablement retourné un chunk sur le stylo Ozempic, et le modèle l'a utilisé sans vérifier la pertinence.

---

### 🟡 MINEUR — Réponse incorrecte sur ordonnance anglaise

- **conv** : `ed08c2d9-a306-44c0-8c7d-783ea4215be7`
- **Message user** : `Pourrai je acheter du mounjaro avec une ordonnance anglaise ?`
- **Réponse Coach** : *"L'ordonnance anglaise n'est pas valable en France."*
- **Problème** : Affirmation catégorique sans nuance. La réalité est plus complexe (UK post-Brexit, directives de reconnaissance mutuelle limitées). Une pharmacie française peut théoriquement honorer une ordonnance étrangère à sa discrétion.
- **Réponse attendue** : *"En général, les pharmacies françaises n'honorent pas les ordonnances étrangères (dont britanniques depuis le Brexit). En pratique, mieux vaut consulter un médecin français — une téléconsultation peut se faire rapidement. Veux-tu que je t'oriente ?"*

---

## Actions recommandées

### 1. Fix system prompt — Lien carte des prix en dur (priorité haute)

L'instruction actuelle ne suffit pas. Le modèle ignore le lien. Remplacer dans le system prompt :

```diff
- Pour un prix ou une pharmacie proche : oriente vers la carte des prix du site → [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/), et demande la ville pour cibler.
+ Pour un prix ou une pharmacie proche : donne TOUJOURS ce lien exact cliquable dans ta réponse : [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/). Ne dis jamais "sur notre site" sans le lien. Demande ensuite la ville.
```

---

### 2. Fix system prompt — Détection messages tronqués et chiffres poids/taille (priorité haute)

Ajouter dans le bloc "FLUX ÉLIGIBILITÉ" :

```diff
+ - Si l'utilisateur donne deux nombres (ex : "98 156", "75 161") après que tu as demandé poids et taille, interprète-les comme poids (kg) et taille (cm) dans cet ordre, calcule l'IMC et donne un verdict immédiatement.
+ - Si le message contient un chiffre suivi d'une virgule sans suite (ex : "135kg pour1,"), demande poliment de compléter la taille plutôt que d'inventer une valeur.
```

---

### 3. Fix system prompt — Distinction remboursement Diabète T2 vs Obésité pour Mounjaro (priorité haute)

Ajouter dans le bloc CONTEXTE IMPORTANT :

```diff
+ - REMBOURSEMENT MOUNJARO DIABÈTE T2 : Mounjaro (tirzépatide) est également remboursé pour le diabète de type 2 via la voie habituelle (AMM diabète, prise en charge ALD30 si applicable). Ce remboursement est DISTINCT du remboursement obésité du 15 juin 2026. Un patient diabétique ALD qui prend Mounjaro pour son diabète n'a PAS besoin du décret obésité pour être remboursé — sa caisse le prend en charge via l'ALD. Fais toujours la distinction et ne redirige pas un patient diabétique vers les critères IMC obésité.
```

---

### 4. Déprioriser llama-3.1-8b-instant dans la chaîne LLM (priorité haute)

Le 8b est maintenant en tête de file (46% des réponses) et génère les erreurs les plus graves (Harris-Benedict, exposition RAG, confusion produit). Deux options :

**Option A** — Inverser la chaîne de fallback : `mistral-small → 70b → 8b` (mistral-small est plus fiable sur les flux structurés).

**Option B** — Conserver l'ordre mais ajouter une instruction dans le system prompt spécifique au 8b (non faisable dynamiquement).

**Recommandation** : Option A. Modifier dans `index.ts` :

```diff
  const LLM_CHAIN = [
-   { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.3-70b-versatile" },
-   { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.1-8b-instant" },
-   { url: "https://api.mistral.ai/v1/chat/completions", key: mistralKey, model: "mistral-small-latest" },
+   { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.3-70b-versatile" },
+   { url: "https://api.mistral.ai/v1/chat/completions", key: mistralKey, model: "mistral-small-latest" },
+   { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.1-8b-instant" },
  ];
```

---

### 5. Fix widget — Debounce anti-double envoi (priorité moyenne)

Ajouter un debounce de 400ms dans `AiCoach.astro` avant d'appeler l'Edge Function, pour éviter que deux messages rapprochés génèrent deux appels simultanés.

---

### 6. Fix system prompt — Ordonnances étrangères (priorité basse)

```diff
+ - ORDONNANCES ÉTRANGÈRES : Une pharmacie française n'est généralement pas tenue d'honorer une ordonnance étrangère (y compris britannique depuis le Brexit). Conseille de consulter un médecin français, y compris en téléconsultation. Ne dis pas catégoriquement "pas valable" — dis "généralement non acceptée, mieux vaut une consultation française".
```

---

### 7. Nouveaux articles suggérés (questions sans bonne réponse)

| Sujet détecté | Volume | Priorité |
|---|---|---|
| "Ordonnance déjà existante suffit-elle pour remboursement ?" | 2 convs | Haute |
| "Remboursement Mounjaro pour diabète T2 ALD (hors obésité)" | 1 conv | Haute |
| "Stylo Ozempic 3ml : nombre d'aiguilles incluses" | 1 conv | Moyenne |
| "Ordonnance étrangère (UK, Belgique) valable en France ?" | 1 conv | Moyenne |
| "Comment basculer sur le remboursement si déjà sous traitement ?" | 3 convs | Haute |

---

## Conversations marquantes

### Les 3 meilleures

**1. `962adf32` (Wegovy éligibilité 65%, 135 kg)** — Malgré une chute au passage 70b→8b, les 3 réponses Mistral-small sont exemplaires : flux éligibilité propre, collecte IMC pas à pas, lien article pertinent, ton adapté, longueur correcte. Montre la qualité atteignable.

**2. `3743ac35` (achat sans ordonnance → médecin Angoulême)** — Détection scam correcte, ton non-dramatique, redirection naturelle vers un médecin. La conversation a duré 3:46 et s'est bien terminée sur l'orientation géographique. Bon exemple de gestion de l'intention douteuse.

**3. `b83209b3` (Mounjaro remboursement, carte vitale)** — La réponse Mistral sur "j'ai ma carte vitale" est la meilleure réponse de la journée : structure claire, conditions précises, mention CSO/CHU, relance éligibilité en une phrase.

### Les 3 pires

**1. `962adf32` — Réponse Harris-Benedict (message "135kg pour1,")** : Le 8b a inventé une taille, calculé des besoins caloriques via Harris-Benedict (200 mots hors sujet) et exposé son architecture RAG dans la réponse précédente. Deux erreurs critiques dans une seule conversation.

**2. `9755fd00` — Confusion Mounjaro/Wegovy + non-compréhension "98 156"** : L'utilisateur demande spécifiquement sur Wegovy, le Coach répond Mounjaro ; puis donne ses mesures (98 kg, 156 cm, IMC 40,3 → éligible) et le Coach répond "vous n'avez pas posé de question". Double échec sur la conversation la plus longue de la journée (6:32).

**3. `224a4424` — Hallucination "Foundayo"** : Une seule réponse, une seule phrase, un médicament inventé. Risque réputationnel direct si l'utilisateur recherche "Foundayo".

---

*Rapport généré le 2026-06-12 par le monitoring automatique du Coach IA GLP-1 France.*
