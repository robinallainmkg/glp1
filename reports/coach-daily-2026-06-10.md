# Coach IA GLP-1 — Rapport quotidien 2026-06-10

## KPIs

| Métrique | Valeur | vs veille |
|---|---|---|
| Messages totaux | 68 | +31% ↑ (52 hier) |
| Conversations | 14 | — |
| Messages utilisateur | 34 | — |
| Messages assistant | 34 | — |
| Msgs / conversation | 4.86 | — |
| Durée moyenne | ~1min23s | — |
| Taux LLM 70b | 50% (17/34) | — |
| Taux LLM 8b (fallback LLM) | 8.8% (3/34) | — |
| Taux fallback-v1 | **41.2% (14/34)** | ⚠️ ÉLEVÉ |

### Breakdown intent (réponses assistant)
| Intent | Nb |
|---|---|
| null (LLM, non classifié) | 20 |
| general (fallback générique) | 8 |
| price | 3 |
| prescription | 2 |
| availability | 1 |

---

## Ce qui marche bien

- **Réponses remboursement** : le LLM 70b applique correctement le fact officiel remboursement Wegovy/Mounjaro à 65% depuis le 15 juin 2026 (convs b5747d0e, eaf54dc2, 1259b63e, 51f94694).
- **Cas cliniques complexes** : le Coach gère bien les cas multi-critères (IMC + comorbidité + CSO + médecin traitant) — conv 51f94694 est un bon exemple.
- **Lien article pertinent** : conv bb8c19f4 (constipation Mounjaro) → lien vers l'article avis Mounjaro bien intégré.
- **Flux éligibilité** : le flux "vérifions ton éligibilité" fonctionne (conv 1259b63e) mais reste incomplet car l'utilisateur n'a pas donné les données.
- **Ton** : vouvoiement/tutoiement cohérent dans les conversations LLM.

---

## Problèmes détectés

### CRITIQUE — Erreur factuelle sur le remboursement Wegovy
**Conversation** : `5a998ca5`  
**Message user** : `Prix du wegovy`  
**Réponse Coach** : *"Wegovy n'est actuellement pas remboursé par l'Assurance Maladie en France, mais certaines mutuelles peuvent proposer une prise en charge partielle."*  
**Ce qu'il AURAIT DÛ répondre** : *"Wegovy est remboursé à 65% par l'Assurance Maladie à partir du 15 juin 2026 pour l'obésité (IMC ≥ 35 avec comorbidité ou ≥ 40), après échec d'une prise en charge nutritionnelle. Prix : 147-350€/mois selon dosage."*  
**Cause** : Le RAG a retourné un contexte périmé ("non remboursé") et le LLM l'a suivi malgré l'instruction PRIORITAIRE du system prompt. La conversation date du 09/06, veille de l'entrée en vigueur.

### ÉLEVÉ — Taux fallback 41% — Annette Care / Charles.co inconnus
**Conversations** : `507ea959`, `cab43fb7`  
**Message user** : `Tu connais Annette Care et Charles ?`  
**Réponse Coach (fallback)** : *"Je n'ai pas pu traiter votre question en détail pour le moment..."*  
**Ce qu'il AURAIT DÛ répondre** : Le system prompt CONNAÎT Annette Care et Charles.co comme plateformes de téléconsultation. Aucun pattern ne matche ces noms → fallback générique déclenché inutilement. La réponse LLM de la conv `cab43fb7` dit même "Je ne connais pas d'informations sur Annette Care ou charles.co" — réponse incorrecte.

### ÉLEVÉ — Cascade de fallbacks sur mots courts (contexte non transmis)
**Conversation** : `c6674e5d`  
Messages : `Comment obtenir une ordonnance ?` → bonne réponse LLM → `montpellier` → fallback → `ozempic` → fallback → `Quelle ville ?` → fallback  
**Problème** : L'utilisateur répond à la question "donnez votre ville" en tapant "montpellier". Le fallback ne comprend pas que c'est une réponse contextuelle. Puis "ozempic" (nom du traitement) et "Quelle ville ?" (reformulation de la question) → 3 fallbacks consécutifs. Expérience très dégradée.

### ÉLEVÉ — Erreur factuelle critères IMC par LLM 8b
**Conversation** : `a158c777`  
**Message user** : `j ai commence le traitement en 2025 et mon imc maintenant est inferieur a 35`  
**Réponse Coach (llama-3.1-8b-instant)** : *"IMC ≥ 30 kg/m² avec comorbidité"* comme critère d'éligibilité.  
**Ce qu'il AURAIT DÛ dire** : Les critères sont IMC **≥ 35** avec comorbidité, ou **≥ 40** sans. IMC ≥ 30 est un critère incorrect et potentiellement trompeur. Le modèle 8b génère des erreurs factuelles sur les données médicales.

### MOYEN — Hallucination d'URLs de pharmacies
**Conversation** : `b5747d0e`  
**Message user** : `où acheter`  
**Réponse Coach** : *"pharmacies en ligne agréées comme Pharma-gdd.com, Shop-pharmacie.fr et Newpharma.fr"*  
**Problème** : Le system prompt (règle 13) interdit de fabriquer des URLs. Le LLM a inventé des URLs de pharmacies. Risque : si ces sites ne sont pas fiables ou ont changé, l'utilisateur est mal orienté.

### MOYEN — Réponse "livraison GLP-1" trompeuse
**Conversation** : `964c7a20`  
**Message user** : `combien de temps la livraison`  
**Réponse Coach** : *"livraison dans les 24 à 48 heures si vous optez pour une livraison express"*  
**Problème** : Les GLP-1 sont des médicaments sur ordonnance. Il n'y a pas de "livraison" standard pour des médicaments (sauf pharmacies en ligne agréées). La réponse traite cela comme un e-commerce normal. Le Coach aurait dû clarifier qu'ils s'achètent en pharmacie sur ordonnance.

### MOYEN — Fallback sur "et l'Ozempic ?" (suite de conversation)
**Conversation** : `eaf54dc2`  
**Message user** : `et l'Ozempic ?` (après une question sur le prix de Mounjaro)  
**Réponse Coach** : Fallback générique ("Je n'ai pas pu traiter votre question...")  
**Ce qu'il AURAIT DÛ répondre** : Ozempic ~77€/boîte, remboursé 65% pour diabète T2. Simple question de prix, aucune raison pour un fallback.

### FAIBLE — "sans ordonnance c'est possible ?" — réponse ambiguë
**Conversation** : `eaf54dc2`  
**Message user** : `merci, sans ordonnance c'est possible ?`  
**Réponse Coach (fallback prescription)** : Répète le parcours ordonnance sans répondre clairement NON à la question.  
**Ce qu'il AURAIT DÛ dire** : "Non, il est illégal d'obtenir ou de vendre des GLP-1 injectables sans ordonnance en France. Tout site qui prétend en vendre sans ordonnance est frauduleux."

### FAIBLE — Bug timestamp messages inversés
**Conversation** : `51f94694`  
Les messages assistant et user ont des timestamps identiques dans la DB, causant un ordre potentiellement inversé à l'affichage. La réponse assistant apparaît AVANT le message user dans l'ordre de récupération.  
**Cause** : Dans `saveMessages()`, les deux messages sont insérés avec `new Date()` au même instant.

---

## Actions recommandées

### 1. Fix immédiat — Nouveau pattern `providers` dans le fallback

Ajouter dans `INTENT_PATTERNS` (avant `general`) :

```typescript
{
  intent: 'providers',
  pattern: /annette|charles\.co|qare|livi|hellocare|t[eé]l[eé]consultation|plateforme.*m[eé]decin|m[eé]decin.*ligne/i,
  response: "Des plateformes de téléconsultation permettent d'obtenir une prescription GLP-1 à distance. Parmi les exemples du paysage français : Charles.co (et sa version féminine Mia), Annette Care, Qare, Livi, Hellocare. Je ne recommande aucune plateforme en particulier. Critères d'un service sérieux : (1) vraie consultation avec un médecin inscrit à l'Ordre, (2) ordonnance délivrée seulement si médicalement justifié, (3) médicament en pharmacie — jamais vendu directement par le site."
},
```

### 2. Fix immédiat — Nouveau pattern `delivery` dans le fallback

```typescript
{
  intent: 'delivery',
  pattern: /livraison|délai.*livr|expédition|envoi.*médic|commander.*ligne/i,
  response: "Les GLP-1 injectables (Ozempic, Wegovy, Mounjaro...) sont des médicaments sur ordonnance qui s'obtiennent en pharmacie — physique ou en ligne agréée ANSM. Il n'existe aucune 'livraison sans ordonnance' légale. Si vous avez une ordonnance, votre pharmacie peut commander en 24-48h si le produit n'est pas en stock."
},
```

### 3. Fix immédiat — Rybelsus manquant dans le pattern price

Le pattern `price` ne retourne pas le prix de Rybelsus (demandé 2 fois dans conv a3f21848). Ajouter à la réponse du pattern `price` :

```
💊 Rybelsus (sémaglutide oral) : ~77€/boîte (remboursé 65% pour diabète T2)
```

### 4. Fix moyen — Retirer LLM 8b de la chaîne ou renforcer les instructions

Le modèle `llama-3.1-8b-instant` génère des erreurs factuelles médicales (critères IMC erronés). Options :
- **Option A** (recommandée) : Retirer `llama-3.1-8b-instant` de `LLM_CHAIN` et laisser uniquement 70b + mistral-small comme failover.
- **Option B** : Ajouter dans le system prompt une section "CRITÈRES EXACTS" avec les valeurs numériques en gras pour ancrer les facts.

```typescript
// Option A — dans index.ts ligne ~637
const LLM_CHAIN = [
  { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.3-70b-versatile" },
  // Supprimé: llama-3.1-8b-instant (trop d'erreurs factuelles médicales)
  { url: "https://api.mistral.ai/v1/chat/completions", key: mistralKey, model: "mistral-small-latest" },
];
```

### 5. Fix moyen — Interdire les URLs de pharmacies dans le system prompt

Ajouter à la règle 13 du system prompt :

```
Ne cite JAMAIS d'URLs ou noms de sites de pharmacies en ligne (Pharma-gdd.com, etc.) — tu ne peux pas garantir leur fiabilité. Oriente uniquement vers la carte des prix du site → [Carte des prix](/outils/carte-prix-pharmacies/) ou vers les pharmacies agréées ANSM en général.
```

### 6. Fix bas — Bug timestamp messages

Dans `saveMessages()`, ajouter +1ms sur le message assistant pour garantir l'ordre :

```typescript
// Ligne ~744, dans l'insert du coach_messages
{
  conversation_id: conversationId,
  role: "user",
  content: userMessage,
  created_at: new Date().toISOString(),  // ajouter
  ...
},
{
  conversation_id: conversationId,
  role: "assistant",
  content: assistantMessage,
  created_at: new Date(Date.now() + 1).toISOString(),  // +1ms
  ...
},
```

### 7. Renforcement system prompt — Priorité du fait remboursement

Le system prompt dit déjà d'ignorer le contexte RAG périmé sur le remboursement, mais ce n'est pas suffisant. Ajouter une vérification explicite en préambule du contexte RAG côté code :

```typescript
// Filtrer les chunks RAG qui contredisent le remboursement officiel
const filteredChunks = rankedChunks.filter((c: any) => {
  const obsolete = /non rembours|pas encore rembours|négociations|2e semestre/i.test(c.content || '');
  if (obsolete) console.warn(`RAG chunk filtré (info périmée): ${c.article_slug}`);
  return !obsolete;
});
```

---

## Suggestions d'articles

Basé sur les questions sans bonne réponse ou avec réponses incomplètes :

1. **"Rybelsus (sémaglutide oral) : prix, remboursement et différences avec Ozempic"** — 3 questions sur Rybelsus sans réponse satisfaisante.
2. **"Plateformes de téléconsultation GLP-1 en France : guide objectif 2026"** — Annette Care / Charles.co demandés 3 fois en fallback.
3. **"Constipation sous GLP-1 : causes, solutions et quand consulter"** — Question fréquente (conv bb8c19f4), bon potentiel SEO.
4. **"Mon IMC a changé avec le traitement : suis-je toujours éligible au remboursement ?"** — Cas réel de la conv a158c777, probablement commun.

---

## Conversations marquantes

### Top 3 (meilleures)

**1. `bb8c19f4`** — Question directe et utile  
"Sous mounjaro depuis presque 3 semaines je ne perds plus de poids. Je suis très très constipée que faire svp"  
→ LLM 70b : réponse concise, empathique, conseils pratiques + lien article pertinent. Exemple de bonne réponse one-shot.

**2. `51f94694`** — Cas clinique complexe bien géré  
Patient avec IMC 41 + arthrose sévère + primo-prescription en CHU Pompidou + suivi médecin traitant depuis juin 2025.  
→ LLM 70b comprend que le renouvellement peut être fait par le généraliste, donne un verdict clair "éligible" avec mention cerfa AmeliPro.

**3. `b5747d0e`** — Conversation multi-turns sur le prix Wegovy  
→ Bonne réponse initiale sur remboursement 65% avec breakdown par dosage. Conversion naturelle vers la pharmacie. (Dégradée ensuite par fallback sur "Trouve une pharmacie".)

### Top 3 (pires)

**1. `c6674e5d`** — Cascade catastrophique de fallbacks  
LLM bien parti → "montpellier" (réponse à une question du Coach) → fallback → "ozempic" → fallback → "Quelle ville ?" → fallback. L'utilisateur a posé 4 messages dont 3 déclenchent le fallback générique. Abandon certain.

**2. `a3f21848`** — Questions sur Rybelsus sans réponse satisfaisante  
"CONNAIS TU LE NOMBRE DE PATIENTS QUI UTILISENT RYBELSUS" → réponse correcte mais sans données → "DONC PAS D'ESTIMATION" → fallback générique → "QUEL EST LE PRIX" → fallback price (liste générale, Rybelsus absent) → "PRIX DE RYBELSUS" → fallback price (Rybelsus toujours absent). 4 messages, Rybelsus jamais mentionné dans les prix.

**3. `eaf54dc2`** — "et l'Ozempic ?" en fallback + "sans ordonnance ?" sans réponse claire  
Bonne première réponse sur Mounjaro → "et l'Ozempic ?" → fallback générique incompréhensible → "sans ordonnance c'est possible ?" → fallback prescription qui ne dit pas clairement NON. 2 ratés consécutifs sur des questions simples.

---

*Rapport généré le 2026-06-10 — Monitoring automatique Coach IA GLP-1 France*
