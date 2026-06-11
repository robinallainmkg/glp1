# Rapport Coach IA — 2026-06-11

## KPIs

| Métrique | Valeur |
|---|---|
| Messages totaux (24h) | 54 |
| Conversations | 10 |
| Messages utilisateur | 27 |
| Messages assistant | 27 |
| Messages par conversation (moy.) | 5,4 |
| Durée moyenne conversation | ~1m03s |
| Taux LLM | 100% (0 fallback-v1) |
| Évolution vs veille | ↓ -10% (54 vs 60) |

### Breakdown LLM

| Modèle | Messages | % |
|---|---|---|
| llama-3.3-70b-versatile | 16 | 59% |
| llama-3.1-8b-instant | 8 | 30% |
| mistral-small-latest | 3 | 11% |
| fallback-v1 | 0 | 0% |

### Intent tracking

Tous les champs `intent` sont `null` dans la DB — la détection d'intent ne remonte pas lors des appels LLM (seul `scam:severity` est écrit si détecté, ce qui ne s'est pas produit aujourd'hui).

---

## Ce qui marche bien

1. **Couverture LLM 100%** — Aucun fallback-v1 déclenché. La chaîne de résilience Groq 70B → 8B → Mistral fonctionne.
2. **Questions médicales complexes bien gérées** — `cf8606fb` (kystes pancréas/GLP-1) : réponse nuancée, lien article pertinent vers `/collections/effets-secondaires-glp1/glp1-pancreatite-risque-ozempic-pancreas-symptomes/`, pivot élégant vers éligibilité.
3. **Flux éligibilité cohérent** — `6f78d87c` et `cf8606fb` lancent correctement le diagnostic IMC en mini-questions séquentielles.
4. **Liens articles pertinents** — mistral-small-latest injecte systématiquement des liens RAG bien ciblés (Mounjaro, endocrinologue, reprise de poids).
5. **Ton rassurant** — `692e784d` (patient ayant déjà perdu 15 kg) : réponse nuancée sans alarmer sur la perte d'éligibilité.

---

## Problèmes détectés

### 🔴 P1 — CRITIQUE : llama-3.1-8b hallucine des données médicales

**Conversation `0d3ed6f8` — Invention d'un médicament**

- Message user : `"j'ai déjà une ordonnance mais pas le dossier"`
- Réponse coach (llama-3.1-8b) : *"Si tu as déjà une ordonnance pour **Ozempic**, mais pas le dossier nécessaire..."*
- **Problème** : L'utilisateur n'a jamais mentionné Ozempic. Le modèle a inventé un médicament.
- **Aurait dû répondre** : Demander de quel médicament il s'agit, ou répondre de façon générique sur "ton traitement GLP-1".

---

**Conversation `0d3ed6f8` — Violation de la règle primo-prescription**

- Message user : `"est ce que mon medecin généraliste pour faire le dossier de prescription"`
- Réponse coach (llama-3.1-8b) : *"Depuis juin 2025, votre médecin traitant est pleinement habilité à initier et renouveler la prescription de Wegovy ou Mounjaro pour l'obésité."*
- **Problème** : Violation directe de la règle critique du system prompt : *"NE DIS JAMAIS que le médecin traitant peut INITIER la primo-prescription du remboursement obésité [...] Pas de 'depuis juin 2025 le médecin traitant peut initier' — c'est inexact."* Le modèle reproduit exactement la formulation interdite.
- **Aurait dû répondre** : "La primo-prescription ouvrant droit au remboursement doit être faite dans un CSO ou CHU. Ton généraliste peut ensuite renouveler."

---

### 🔴 P2 — CRITIQUE : llama-3.1-8b hallucine un IMC sans données

**Conversation `6f78d87c` — IMC calculé sans poids**

- Messages précédents : user a dit `"Je donne mon poids"` (sans chiffre) puis `"1m70"` (taille seulement)
- Réponse coach (llama-3.1-8b) : *"Votre IMC est de 35,5 kg/m²."* puis *"De plus, il est recommandé de discuter [...] d'un examen d'ostéodensitometrie (DEXA)..."*
- **Problème** : Le modèle invente un IMC à partir d'une taille seule, sans poids connu. Il invente aussi une recommandation DEXA totalement hors-sujet.
- **Aurait dû répondre** : "Merci pour ta taille. J'ai besoin de ton poids pour calculer ton IMC. Peux-tu me donner ton poids en kg ?"

---

### 🟠 P3 — Incohérence tutoiement/vouvoiement dans les conversations multi-modèles

**Conversations `6f78d87c`, `b3e1439c`, `020c7c2c`**

- llama-3.3-70b et llama-3.1-8b utilisent le vouvoiement ("Vous pouvez", "votre")
- mistral-small-latest passe au tutoiement ("te", "tu")
- Certaines réponses llama-3.1-8b mélangent les deux dans la même phrase : *"Veux-tu que je vérifie si vous avez des comorbidités..."*
- **Impact** : Rupture de cohérence perçue par l'utilisateur, sentiment d'interlocuteur changeant.

---

### 🟠 P4 — Violation règle "Je ne peux pas donner une pharmacie spécifique"

**Conversation `020c7c2c`**

- Message user : `"yeah"` (confirmation de chercher une pharmacie pour Mounjaro 5mg)
- Réponse coach (mistral-small-latest) : *"**Je ne peux pas te donner le nom d'une pharmacie spécifique**, car les prix varient..."*
- **Problème** : Le system prompt interdit explicitement cette formulation (règle REQUÊTES LOCALES) : *"Ne dis JAMAIS 'je ne peux pas donner une pharmacie spécifique'"*. La suite de la réponse est correcte (lien carte des prix), mais l'intro est interdite.

---

### 🟡 P5 — Réponse trop longue et chiffres potentiellement hallucités

**Conversation `cbb94a0f` — Effets secondaires Mounjaro vs Wegovy**

- Message user : `"effets secondaire entre mounjaro et wegowy"`
- Réponse coach (llama-3.1-8b) : 200+ mots avec tableau de pourcentages précis (nausées 20-30%, vomissements 8-12%, etc.) → très au-delà des 60-120 mots requis. Les chiffres par indication (ex: diarrhée 15-20% Mounjaro vs 25-35% Wegovy) semblent inventés faute de données RAG fiables.
- De plus, la réponse suivante mentionne *"Trulicity"* que l'utilisateur n'avait jamais évoqué.

---

### 🟡 P6 — Violation règle "notre page" / "nos articles"

**Conversation `b3e1439c`**

- Réponse coach (llama-3.3-70b) : *"comme indiqué sur **notre page dédiée aux centres Mounjaro en France**"*
- **Problème** : Violation de la règle 11 du system prompt : *"Ne dis JAMAIS 'd'après nos articles', 'selon nos guides' ou toute formulation qui s'appuie sur 'nos' contenus."*

---

### 🟡 P7 — Répétition de réponse identique sans progression

**Conversation `b3e1439c`**

- L'utilisateur dit deux fois de suite `"Oui, trouve un centre"` (Marseille)
- Le Coach (llama-3.1-8b) reproduit quasi mot pour mot la même réponse que la fois précédente (mêmes 3 points : Doctolib, SFE, RéPPOP)
- **Aurait dû répondre** : Proposer une étape concrète différente (ex : offrir la checklist email, donner les coordonnées du CHU de la Timone ou de l'hôpital Nord à Marseille).

---

### 🟡 P8 — Utilisateur anglophone non pris en charge

**Conversations `020c7c2c` et `47a7d4e2`**

- Les deux utilisateurs écrivent en anglais (`"what is the cheapest pharmacy..."`, `"I got an email from you..."`)
- Le Coach répond exclusivement en français (conforme règle 7)
- Mais aucune reconnaissance de la langue : pas de "I notice you're writing in English — our service is in French" ou équivalent
- Risque de désengagement élevé pour les utilisateurs anglophones.

---

## Actions recommandées

### 1. Renforcer le system prompt sur les données manquantes (diff)

Ajouter après la règle 9 (concision) :

```diff
+ 14. Ne jamais inférer ni inventer un médicament que l'utilisateur n'a pas nommé. Si le médicament est inconnu, demande lequel.
+ 15. Ne jamais calculer un IMC, une dose ou un prix sans avoir TOUTES les données nécessaires. Si une donnée manque, demande-la d'abord.
```

### 2. Déplacer llama-3.1-8b-instant en 3e position (après mistral)

Dans `supabase/functions/ai-coach/index.ts`, modifier `LLM_CHAIN` :

```diff
 const LLM_CHAIN = [
   { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.3-70b-versatile" },
-  { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.1-8b-instant" },
   { url: "https://api.mistral.ai/v1/chat/completions", key: mistralKey, model: "mistral-small-latest" },
+  { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.1-8b-instant" },
 ];
```

llama-3.1-8b présente un taux d'hallucination élevé dans les conversations multi-tours. mistral-small-latest est plus fiable (meilleur respect du system prompt, bons liens RAG). llama-3.1-8b reste en dernier recours pour éviter les timeouts.

### 3. Ajouter règle cohérence tu/vous

Ajouter après la règle 8 du system prompt :

```diff
+ 8b. Maintiens STRICTEMENT la même forme d'adresse (tu OU vous) tout au long de la conversation. Détecte dès le 1er message de l'utilisateur : s'il tutoie, tutoie toujours ; s'il vouvoie ou est neutre, vouvoie. Ne change JAMAIS en cours de conversation.
```

### 4. Renforcer la règle "ne jamais dire je ne peux pas"

Modifier la règle REQUÊTES LOCALES pour la rendre encore plus explicite :

```diff
- Ne dis JAMAIS "je ne peux pas donner une pharmacie spécifique"
+ Ne dis JAMAIS "je ne peux pas...", "il m'est impossible...", "je n'ai pas accès..." pour les pharmacies ou les médecins. Donne directement le lien et demande la ville.
```

### 5. Ajouter une règle anti-répétition

```diff
+ 16. Si l'utilisateur répète une demande déjà adressée, ne réponds JAMAIS la même chose. Propose une ressource différente, demande plus de détails (ville, profil, médicament) ou propose la checklist personnalisée par email.
```

### 6. Gérer les utilisateurs anglophones

Ajouter dans le system prompt :

```diff
+ 7b. Si un utilisateur écrit en anglais, réponds en français mais reconnais brièvement : "Our service is in French — I'll answer in French: [réponse]." Cela évite l'abandon sans sacrifier la règle de langue.
```

### 7. Nouveaux articles suggérés (gaps identifiés)

D'après les questions sans réponse satisfaisante :
- **"Comment faire le dossier de remboursement Wegovy/Mounjaro ?"** — guide étape par étape du dossier CSO/CHU (très demandé : 2 conversations en 24h)
- **"Trouver un médecin GLP-1 par ville"** — pages dédiées par grande ville (Marseille, Clichy/IDF, Antibes/PACA) déjà demandées
- **"Différences effets secondaires Mounjaro vs Wegovy"** — comparatif chiffré officiel (études SURMOUNT vs STEP)
- **"GLP-1 pour ceux qui veulent perdre du poids sans obésité sévère"** — distinction obésité vs surpoids, durée traitement, remboursement

---

## Conversations marquantes

### Les 3 meilleures

**1. `cf8606fb`** — Question médicale sérieuse sur les kystes hépatiques/pancréatiques
- Utilisateur préoccupé par des effects secondaires rares
- Coach : réponse factuelle, nuancée, sans dramatiser, lien article sur la pancréatite GLP-1 → excellent
- Pivot naturel vers le diagnostic d'éligibilité → engagement maintenu

**2. `44bab4bf`** — Durée du traitement GLP-1 pour perte de poids
- Question ouverte et légitime
- Coach : réponse concise, non définitive, lien pertinent sur la reprise de poids après arrêt
- Format idéal : < 80 mots, 1 lien, 1 relance

**3. `692e784d`** — Patient déjà sous traitement, question sur éligibilité après progression
- Contexte riche (déjà -15kg, passage obèse sévère → modéré)
- Coach : réponse nuancée qui rappelle les critères sans trancher à la place du médecin → approprié

### Les 3 pires

**1. `0d3ed6f8`** — Double violation critique
- Invention d'un médicament (Ozempic non mentionné)
- Information médicale fausse sur la primo-prescription par le généraliste
- Modèle fautif : llama-3.1-8b-instant (× 2 sur × 2 messages)

**2. `6f78d87c`** — Hallucination d'IMC (35,5) sans données de poids
- L'utilisateur avait dit "Je donne mon poids" sans chiffre ; le Coach a inventé un IMC
- Recommandation DEXA totalement hors-sujet ajoutée en bonus
- Le modèle suivant (mistral) a corrigé avec IMC = 48,3 → le user a pu se rendre compte de l'erreur

**3. `cbb94a0f`** — Réponse trop longue + chiffres probablement inventés + Trulicity sorti de nulle part
- 200+ mots au lieu de 60-120
- Chiffres d'effets secondaires précis sans source RAG → hallucination probable
- Mention de Trulicity non demandé dans le message suivant
