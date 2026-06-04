# Coach IA — Rapport quotidien — 2026-05-27

## KPIs

| Métrique | Valeur | vs Veille |
|---|---|---|
| Messages totaux | 24 | ↓ -25% (hier : 32) |
| Conversations | 6 | — |
| Messages utilisateur | 12 | — |
| Messages assistant | 12 | — |
| Msgs/conversation (moy) | 4,0 | — |
| Durée moy/conv | ~2min10s | — |
| Conv la plus longue | 9min35s (8 msgs) | — |

### LLM vs Fallback

| Modèle | Réponses | % |
|---|---|---|
| llama-3.3-70b-versatile (Groq) | 9 | 75% |
| fallback-v1 (rules engine) | 3 | 25% |

### Breakdown par intent

| Intent | Nb | Note |
|---|---|---|
| null (LLM sans classification) | 9 | 75% des réponses non typées |
| price | 2 | Fallback déclenché correctement |
| general | 1 | Fallback sur "perte de vue" — inadapté |

---

## Ce qui marche bien

- **Réponse Trulicity correcte (2e tentative)** — Conv `1e59a264` : quand l'utilisateur a précisé "piqure de trulicity", le Coach a répondu correctement avec les bonnes informations et le bon lien article.
- **Gestion "pharmacie des indes"** — Conv `ba6962f2` : réponse mesurée sur un site potentiellement douteux, sans partir directement sur "arnaque", conforme au protocol du system prompt.
- **Fallback prix déclenché correctement** — Conv `a94e43cc` et `b471a84a` : le pattern `/prix|coût/` a bien fonctionné et fourni les prix à jour.
- **Lien article pertinent sur Wegovy** — Conv `ba6962f2` : le Guide Complet Wegovy était la bonne ressource pour une question sur Wegovy 1mg.

---

## Problèmes détectés

### 🔴 Problème 1 — Confusion Mounjaro/Trulicity (grave)

- **Conv** : `1e59a264-d33f-4d86-b55c-390b279038d2`
- **Message user** : "peut ton faire la piqure le soir" (contexte établi : utilisateur sous Trulicity)
- **Réponse Coach** : _"Oui, l'injection de **Mounjaro** peut se faire à n'importe quel moment de la journée..."_ + lien Mounjaro
- **Problème** : Le RAG a retourné des chunks sur Mounjaro alors que toute la conversation concernait Trulicity. Le LLM n'a pas vérifié la cohérence avec le contexte conversationnel.
- **Ce qu'il aurait dû répondre** : _"Oui, Trulicity peut être injecté le soir. L'important est de toujours le faire le même jour de la semaine, à n'importe quelle heure. [Guide Complet Trulicity](/collections/traitements-glp1/guide-complet-trulicity/)"_

---

### 🔴 Problème 2 — Mauvais lien (coût GLP-1 → chirurgie bariatrique)

- **Conv** : `e2db5f16-94c1-4df9-a0a0-1e9ac014720b`
- **Message user** : "Combien coute un traitement GLP-1 ?"
- **Réponse Coach** : _"Le coût d'un traitement GLP-1 varie. Pour plus d'informations, consulte [Prix et Coût Détaillé de ce traitement GLP-1 en France 2025](/collections/glp1-cout/**operation-pour-maigrir-prix**/)."_
- **Problème** : Le slug `operation-pour-maigrir-prix` concerne la chirurgie bariatrique, pas les prix des injectables GLP-1. Lien RAG incorrect ou slug trompeur.
- **Ce qu'il aurait dû répondre** : Donner les prix directement (comme le fait le fallback) ou pointer vers un article de la collection `glp1-cout` sur les prix des injectables.

---

### 🔴 Problème 3 — Lien Mounjaro sur contexte Trulicity (fin de conv)

- **Conv** : `1e59a264-d33f-4d86-b55c-390b279038d2`
- **Message user** : "mon medecin a accepter que je passe une semaisne sans la piqure raison personnelle"
- **Réponse Coach** : Correcte sur le fond (_"C'est une décision à prendre avec votre médecin"_) mais avec lien **[Mounjaro Dosage]** alors que l'utilisateur est clairement sous Trulicity depuis le début.
- **Ce qu'il aurait dû répondre** : Même réponse, mais avec lien Guide Trulicity ou sans lien inutile.

---

### 🟠 Problème 4 — Fallback "general" sur symptôme potentiellement grave

- **Conv** : `870b861c-356f-4885-b9b4-31a0f74656d7`
- **Message user** : "perte de vue"
- **Réponse Coach (fallback)** : Menu généraliste des sujets couverts par le coach.
- **Problème** : "Perte de vue" est un symptôme neurologique potentiellement grave (la FDA a émis un avertissement en 2024 sur la NAION — neuropathie optique ischémique — associée aux GLP-1/semaglutide). Déclencher le menu généraliste est la pire réponse possible. Le LLM aurait dû prendre en charge ce message.
- **Ce qu'il aurait dû répondre** : _"Des troubles de la vision peuvent parfois survenir avec certains traitements GLP-1. Si tu observes une baisse ou perte soudaine de la vision, consulte un médecin ou appelle le 15 rapidement — c'est un symptôme qui mérite une évaluation sans attendre. [Effets secondaires GLP-1](/collections/effets-secondaires-glp1/)"_

---

### 🟠 Problème 5 — Réponse hors-sujet sur "Ou trouver les prix ?"

- **Conv** : `a94e43cc-f432-4936-a671-132d099bf75f`
- **Message user** : "Ou trouver les différents prix ?"
- **Réponse Coach** : _"je te conseille de consulter ton médecin traitant ou un pharmacien [...] Tu peux également consulter l'annuaire-sante.ameli.fr"_
- **Problème** : L'utilisateur demande les prix, pas un médecin. La réponse dépasse le contexte de la question. Le fallback `price` s'est ensuite déclenché sur "Comparatif des prix" et a donné la bonne réponse.
- **Incohérence tutoiement** : Le LLM tutoie sans que l'utilisateur ait établi le tutoiement (règle 8 du system prompt violée).

---

### 🟡 Problème 6 — Intent null sur 75% des réponses LLM

- 9 des 12 messages assistant ont `intent = null`. Seul le fallback remplit le champ intent.
- Impact : les dashboards admin montrent des intents vides pour la majorité des échanges, la segmentation des visiteurs (problème du system prompt) est inexploitable.

---

### 🟡 Problème 7 — Réponse générique sur Wegovy 0.5mg

- **Conv** : `b471a84a-16a6-467d-a77d-fb62f10f6a0c`
- **Message user** : "Prix wegovy le moin cher en 0.5mg"
- **Réponse fallback** : prix généraux Wegovy (~280-350€/mois)
- **Problème** : Le 0.5mg est la dose de démarrage de Wegovy. Un utilisateur cherchant "le moins cher en 0.5mg" est probablement en phase de démarrage et cherche à optimiser ses coûts. La réponse ne mentionne pas que certaines pharmacies peuvent avoir des différences de prix selon la boîte, ni qu'il n'existe pas de générique.

---

## Actions recommandées

### 1. Fix urgent — Instruction RAG de cohérence médicament

Ajouter dans le system prompt une règle explicite pour forcer le LLM à rester cohérent avec le médicament mentionné dans la conversation :

```diff
+ 14. RÈGLE DE COHÉRENCE : Si l'utilisateur a mentionné un médicament spécifique
+     (Trulicity, Ozempic, Wegovy, Mounjaro, Saxenda, Victoza) dans la conversation,
+     utilise UNIQUEMENT des liens et informations sur CE médicament. N'utilise jamais
+     d'informations sur un autre GLP-1 sans le préciser explicitement.
```

### 2. Fix urgent — Ajouter pattern "symptômes oculaires/neurologiques" dans les fallbacks

Le message "perte de vue" (et variantes) doit être capturé avant le fallback `general` :

```typescript
// Ajouter dans INTENT_PATTERNS, AVANT le pattern 'general' :
{
  intent: 'urgent_symptom',
  pattern: /perte.*vue|trouble.*vision|vision.*floue|vue.*baiss|cécité|aveugl|paralys|convuls|difficul.*respir/i,
  response: "Des troubles de la vision ou des symptômes neurologiques inhabituels doivent être évalués rapidement par un médecin. Si la perte de vision est soudaine ou s'aggrave, appelez le 15 (SAMU) ou rendez-vous aux urgences sans attendre. Ce type de symptôme peut nécessiter une prise en charge immédiate."
}
```

### 3. Fix — Améliorer la réponse initiale sur les prix

Le LLM répond parfois hors-sujet quand un utilisateur demande les prix. Ajouter dans le system prompt :

```diff
+ PRIX GLP-1 : Quand quelqu'un demande le prix, le coût, ou "où trouver les prix",
+   réponds directement avec les prix (Ozempic ~78€/mois remboursé diabète T2,
+   Wegovy ~300€, Mounjaro ~350€, Saxenda ~270€). Ne renvoie pas vers un médecin
+   pour une question de prix — renvoie vers un médecin uniquement pour la prescription.
```

### 4. Fix — Tracking d'intent pour les réponses LLM

Ajouter dans la requête Groq un output structuré ou une extraction post-hoc de l'intent :

```typescript
// Option simple : détecter l'intent via les INTENT_PATTERNS côté serveur
// même pour les réponses LLM, puis stocker dans la DB
const detectedIntent = scamSignals.isScamRelated
  ? `scam:${scamSignals.severity}`
  : classifyAndRespond(cleanMessage).intent; // utiliser le classifier rules-based pour typer l'intent
```

### 5. Suggestion d'article — Troubles visuels sous GLP-1

La question "perte de vue" + la conversation sur les effets secondaires révèle un besoin de contenu :
- **Titre suggéré** : "Perte de vision et GLP-1 : ce que dit la FDA (alerte NAION 2024)"
- **Collection** : `effets-secondaires-glp1`
- **Slug** : `effets-secondaires-glp1-vision-oculaires`
- **Priorité** : Haute — sujet médical sérieux, alerte FDA récente, aucun article sur ce thème visiblement dans le RAG

### 6. Suggestion d'article — Prix Wegovy par dose

La demande "Prix wegovy le moin cher en 0.5mg" suggère un besoin de contenu granulaire :
- **Titre suggéré** : "Prix Wegovy par dose en France : 0.25mg, 0.5mg, 1mg, 1.7mg, 2.4mg"
- **Collection** : `glp1-cout`

---

## Conversations marquantes

### 3 meilleures

1. **`ba6962f2`** (4 msgs, 15s) — Gestion exemplaire de "pharmacie des indes" : réponse mesurée, sans présumer d'arnaque, information factuelle sur le risque. Le lien Guide Wegovy était pertinent.

2. **`1e59a264`** (8 msgs, 9min35s) — Conversation la plus engagée. L'utilisateur est revenu plusieurs fois, ce qui témoigne d'une vraie utilité du coach même si la qualité était inégale. La correction automatique sur la 3e question montre que le RAG peut s'améliorer quand la question est précise.

3. **`a94e43cc`** (4 msgs, 45s) — Bon exemple de self-correction : le fallback `price` sur "Comparatif des prix" a rattrapé la réponse hors-sujet du LLM. La rédondance LLM+fallback a bien fonctionné comme filet de sécurité.

### 3 pires

1. **`870b861c`** — "perte de vue" → menu généraliste. Pire réponse possible pour un symptôme potentiellement grave. À corriger en priorité absolue.

2. **`e2db5f16`** — Question prix GLP-1 → lien vers article chirurgie bariatrique. Lien RAG totalement hors-sujet qui peut induire l'utilisateur en erreur.

3. **`1e59a264` (msg 2)** — Réponse Mounjaro à une question sur Trulicity. La confusion de médicament dans un contexte médical est un problème de confiance critique.

---

*Rapport généré automatiquement le 2026-05-27. Projet Supabase : ywekaivgjzsmdocchvum.*
