# Rapport Coach IA — 17 juin 2026

**Période analysée** : 16/06/2026 12h00 → 17/06/2026 12h00 (UTC)
**Conversations** : 12 | **Messages** : 74 | **Modèle principal** : Llama-3.3-70B (Groq)

---

## KPIs

| Métrique | Aujourd'hui | Hier | Évolution |
|---|---|---|---|
| Messages totaux | 74 | 58 | ↑ +27.6% |
| Conversations | 12 | — | — |
| Messages user | 37 | — | — |
| Messages assistant | 37 | — | — |
| Msgs / conv (moy.) | **6.2** | — | — |
| Durée moy. conv. | ~2m31s | — | — |

### Taux LLM vs Fallback

| Modèle | Réponses | % |
|---|---|---|
| llama-3.3-70b-versatile (Groq) | 28 | 75.7% |
| mistral-small-latest (fallback) | 9 | 24.3% |
| fallback-v1 (rule-based) | **0** | 0% |

**→ 100% de disponibilité LLM. Aucune interruption de service.**
Le basculement Groq → Mistral (24.3%) s'est déclenché lors des pics de charge, conformément à la chaîne de résilience.

### Distribution par intent

Tous les intents sont `null` — comportement normal quand aucun signal arnaque n'est détecté. L'intent `scam:*` ne s'est pas déclenché sur ces 24h.

### Engagement par conversation

| conversation_id | Msgs | Durée |
|---|---|---|
| e6a6b359 | 10 | 1m05s |
| 2fe64f83 | 10 | 4m55s |
| 0b0a9a54 | 10 | 11m22s |
| 30ad94c0 | 8 | 1m33s |
| f9b27cfa | 8 | 1m58s |
| a6fc5aec | 6 | 2m22s |
| d6bc71f5 | 6 | 19s ⚠️ |
| 008ca6f9 | 4 | 28s |
| d495f814 | 4 | 37s |
| a14655c5 | 4 | 30s |
| 2c086658 | 2 | 0s |
| 38150a36 | 2 | 0s |

---

## Ce qui marche bien

1. **Flux éligibilité parfaitement suivi** (conv `e6a6b359`) — L'utilisateur demande son éligibilité Wegovy, le Coach collecte l'IMC (30), constate la non-éligibilité, ferme proprement. Exactement conforme au system prompt.

2. **Calcul IMC automatique et correct** (conv `30ad94c0`) — "162 cm, 138 kg" → IMC 52.6 calculé instantanément, verdict éligibilité confirmé, capture email proposée au bon moment.

3. **Résilience 100%** — 0% de fallback rule-based. La chaîne Groq → Mistral absorbe les pics sans dégradation visible pour l'utilisateur.

4. **Information remboursement 15 juin 2026 bien intégrée** — Toutes les réponses mentionnent le remboursement à 65% (Wegovy/Mounjaro) avec les bonnes conditions (IMC ≥ 35 comorbidité ou ≥ 40, primo-prescription CSO/CHU).

5. **Honnêteté sur les limitations** (conv `a6fc5aec`) — "Je n'ai pas encore de carte interactive en temps réel" est une bonne réponse plutôt qu'une promesse impossible.

6. **Orientation médicale CSO/CHU correcte** — Plusieurs conversations identifient correctement que le médecin traitant ne peut pas initier la primo-prescription pour le remboursement obésité.

7. **Volume en nette hausse** : +27.6% vs veille — le Coach gagne en visibilité.

---

## Problèmes détectés

### 🔴 CRITIQUE — Hallucination RAG (conv `2fe64f83`)

**Situation** : Conversation sur le remboursement Mounjaro (document à fournir en pharmacie).

| Tour | Rôle | Message |
|---|---|---|
| 3 | user | *"oui"* (réponse à "Veux-tu vérifier ton éligibilité ?") |
| 4 | assistant | **"Le stylo d'Ozempic 3ml est une nouvelle présentation qui remplace progressivement l'ancien stylo de 1,5 ml. Veux-tu savoir comment cela affecte ton traitement ?"** |

**Ce qu'il AURAIT DÛ répondre** : "Quel est ton poids et ta taille ? Je calcule ton IMC."

**Diagnostic** : Le RAG a probablement récupéré un chunk sur le stylo Ozempic, et le LLM l'a utilisé quand l'user a dit "oui" sans autre contexte — confusion produit (Mounjaro vs Ozempic) et perte totale du fil. C'est la pire réponse observée dans ce rapport.

---

### 🔴 CRITIQUE — Perte de contexte sur "Oui, vérifions" (conv `d6bc71f5`)

| Tour | Rôle | Message |
|---|---|---|
| 2 | assistant | "Pour vérifier ton éligibilité au remboursement du Mounjaro, il faut d'abord calculer ton IMC. Quel est ton poids et ta taille ?" |
| 3 | user | *"Oui, vérifions"* |
| 4 | assistant | **"Tu cherches des informations sur les traitements GLP-1. Qu'est-ce qui t'intéresse particulièrement ? Les résultats des traitements, les conditions pour obtenir un remboursement ou peut-être les alternatives ?"** |

**Ce qu'il AURAIT DÛ répondre** : "Quel est ton poids et ta taille ?"

**Diagnostic** : Le Coach a perdu le contexte de la question posée et a relancé une question d'amorce générique. L'utilisateur a abandonné ("Autre" puis silence).

---

### 🟠 MAJEUR — Réponse ignorant le "non" de l'utilisateur (conv `f9b27cfa`)

| Tour | Rôle | Message |
|---|---|---|
| 4 | assistant | "Est-ce que ton médecin nutritionniste fait partie d'un CSO ou d'un CHU ?" |
| 5 | user | *"non"* |
| 6 | assistant | **"Ton médecin nutritionniste fait partie d'un CSO ou d'un CHU ? Si oui, ton traitement est déjà éligible au remboursement à 65% depuis le 15 juin 2026. Il te suffit de présenter ton ordonnance en pharmacie avec ta carte Vitale."** |

**Ce qu'il AURAIT DÛ répondre** : Indiquer que la primo-prescription hors CSO/CHU ne permet pas d'ouvrir le droit au remboursement obésité, et proposer de trouver un CSO pour une nova-prescription.

**Diagnostic** : Le LLM a ignoré la réponse "non" et a répondu à la branche "oui". Probablement un bug de gestion d'ordre des messages dans l'historique ou une mauvaise lecture du contexte.

---

### 🟠 MAJEUR — Confusion ALD obésité vs ALD diabète (conv `0b0a9a54`)

| Tour | Rôle | Message |
|---|---|---|
| 3 | user | "QUEL remboursement je suis déjà en ALD?" |
| 4 | assistant | **"Si ton diabète de type 2 est reconnu comme Affection de Longue Durée (ALD), ton traitement GLP-1 pourrait être remboursé à 100 % par l'Assurance Maladie."** |
| 5 | user | "JE n'ai pas de diabète je suis en ALD pour mon obésité" |

**Ce qu'il AURAIT DÛ répondre** : "L'ALD obésité t'ouvre droit au remboursement à 65% pour Wegovy ou Mounjaro depuis le 15 juin 2026 (IMC ≥ 35 comorbidité ou ≥ 40, primo-prescription en CSO/CHU). Ce n'est pas un remboursement à 100% comme pour le diabète en ALD."

**Impact** : L'information "remboursé à 100%" est factuellement fausse pour une ALD obésité. L'utilisateur a potentiellement reçu une information incorrecte.

---

### 🟡 MINEUR — Tutoiement non respecté (convs `30ad94c0`, `a6fc5aec`, `008ca6f9`)

**Règle** (system prompt, §8) : *"Tutoiement si l'utilisateur tutoie, vouvoiement sinon."*

Exemples de violation :
- Conv `30ad94c0` : user écrit "je cherche un medecin" (neutre, sans tutoiement) → Coach répond "Super ! Vérifions ensemble… Quel est **ton** poids et **ta** taille ?"
- Conv `a6fc5aec` : user écrit "Vers qui dois-je me tourner" (vouvoiement implicite) → Coach alterne tutoiement et vouvoiement.

---

### 🟡 MINEUR — Violation règle "nos contenus" (conv `008ca6f9`)

**Règle** (system prompt, §11) : *"Ne dis JAMAIS 'nos articles', 'nos guides', 'notre carte'…"*

Conv `008ca6f9`, tour 4 : *"Pour trouver une pharmacie près de chez toi à Nantes qui dispense Wegovy ou d'autres médicaments GLP-1, utilise **notre** carte des prix en pharmacie."*

---

## Actions recommandées

### 1. Fix hallucination RAG sur réponse "oui/non" courte

**Problème** : Quand l'utilisateur répond "oui", "non", "ok", "d'accord" à une question du Coach, le LLM perd le fil et peut injecter un sujet RAG sans rapport.

**Diff system prompt (section STYLE)** — ajouter après la règle §9 :

```diff
+ 14. Quand l'utilisateur répond par un mot court sans nouveau sujet ("oui", "non", "ok", "d'accord", 
+     "allez-y", "c'est parti", "Oui, vérifions"), NE DÉMARRE JAMAIS un nouveau sujet. Continue 
+     EXACTEMENT le fil en cours : si tu venais de poser une question (ex: "Quel est ton poids ?"),
+     pose la même question à nouveau ou enchaîne naturellement. IGNORE le contexte RAG si 
+     celui-ci introduit un sujet différent de celui de la conversation.
```

### 2. Fix tutoiement — règle plus explicite

**Diff system prompt (§8)** :

```diff
- Tutoiement si l'utilisateur tutoie, vouvoiement sinon.
+ Tutoiement UNIQUEMENT si l'utilisateur utilise "tu/toi/te/ton/ta" dans ses messages. 
+ Vouvoie (vous/votre/vos) par défaut jusqu'au premier signal de tutoiement explicite. 
+ Ne tutoie PAS sur la base d'un style informel ou d'une faute de frappe.
```

### 3. Fix ALD obésité — clarifier la note remboursement

**Diff system prompt (section CONTEXTE IMPORTANT)** — ajouter après le paragraphe ALD :

```diff
+ - ALD OBÉSITÉ ≠ ALD DIABÈTE : L'ALD pour obésité n'ouvre PAS droit à un remboursement à 100%.
+   Elle facilite la prise en charge mais le taux reste 65% pour Wegovy/Mounjaro (sous conditions IMC).
+   Seule l'ALD diabète de type 2 permet le remboursement à 65% (et 100% avec complémentaire) 
+   pour Ozempic. Ne confonds JAMAIS les deux cas.
```

### 4. Fix formulation "notre carte"

**Diff system prompt (§11)** :

```diff
- Ne dis JAMAIS "d'après nos articles", "selon nos guides" ou toute formulation qui s'appuie sur "nos" contenus.
+ Ne dis JAMAIS "d'après nos articles", "selon nos guides", "notre carte", "notre outil", "notre site" 
+ ou toute formulation qui s'appuie sur "nos" contenus. Utilise : "la carte des prix disponible sur 
+ le site", "le calculateur d'éligibilité", "glp1-france.fr" — jamais "notre".
```

### 5. Nouveaux articles suggérés (basés sur les questions sans bonne réponse)

| Sujet | Justification |
|---|---|
| "Pharmacien refuse le remboursement Mounjaro/Wegovy : que faire ?" | Conv `2fe64f83` — utilisateur bloqué en pharmacie, pas d'article dédié |
| "ALD obésité et GLP-1 : remboursement depuis le 15 juin 2026" | Conv `0b0a9a54` — confusion fréquente ALD diabète vs obésité |
| "Documents à fournir en pharmacie pour le remboursement Wegovy/Mounjaro" | Demande explicite dans `2fe64f83`, vague dans le RAG actuel |
| "Primo-prescription CSO/CHU : trouver un centre spécialisé près de chez soi" | Demandé dans `f9b27cfa`, `30ad94c0`, `a6fc5aec` — très fréquent |
| "Mon médecin traitant peut-il renouveler mon Wegovy/Mounjaro ?" | Plusieurs utilisateurs confus sur la distinction primo/renouvellement |

---

## Conversations marquantes

### ✅ Top 3 — Meilleures

**1. `30ad94c0` (8 msgs, 1m33s) — Parcours complet exemplaire**
- User cherche médecin à Mantes-la-Jolie → orientation CSO/CHU correcte → IMC 52.6 calculé automatiquement → éligibilité confirmée → capture email proposée. Conversazione fluide, Mistral Small prend le relais sans rupture de qualité.

**2. `f9b27cfa` (8 msgs, 1m58s) — Cas complexe bien géré (sauf 1 ratage)**
- Utilisateur avec situation détaillée (Mounjaro depuis 30 mai, nutritionniste indépendant, IMC 40). Le Coach a correctement identifié que le médecin indépendant ne permet pas la primo-prescription remboursée et oriente vers un CSO. La qualité des réponses Mistral est nettement supérieure à Llama sur ce cas.

**3. `e6a6b359` (10 msgs, 1m05s) — Flux éligibilité parfait**
- Protocole "suis-je éligible ?" respecté à la lettre : IMC collecté, verdict "non éligible" clair (IMC 30 < 35), fin propre sans pression.

---

### ⚠️ Top 3 — Pires

**1. `2fe64f83` (10 msgs, 4m55s) — Hallucination grave + confusion produit**
- Réponse sur l'Ozempic stylo 3ml complètement hors-sujet alors que la conversation porte sur le remboursement Mounjaro. C'est la pire réponse observée et un risque de désinformation.

**2. `d6bc71f5` (6 msgs, 19s) — Abandon après perte de contexte**
- 19 secondes de conversation, utilisateur abandonné après que le Coach a ignoré "Oui, vérifions" et relancé une question générique. Abandon brutal.

**3. `0b0a9a54` (10 msgs, 11m22s) — Information incorrecte ALD**
- Information "remboursé à 100%" fausse pour une ALD obésité. L'utilisateur a passé 11 minutes à clarifier sa situation, le Coach a répondu avec la mauvaise information initiale.

---

## Synthèse priorités

| Priorité | Action | Impact |
|---|---|---|
| 🔴 P1 | Patch system prompt : règle anti-dérive sur réponses courtes | Élimine les hallucinations RAG hors-contexte |
| 🔴 P1 | Patch system prompt : ALD obésité ≠ ALD diabète | Évite désinformation médicale |
| 🟠 P2 | Patch system prompt : tutoiement explicite | Cohérence ton sur ~30% des conversations |
| 🟠 P2 | Créer article "Pharmacien refuse remboursement Mounjaro/Wegovy" | RAG aura réponse précise pour cas bloquant |
| 🟡 P3 | Créer article "Primo-prescription CSO/CHU : trouver un centre" | Requête très fréquente, article manquant |
