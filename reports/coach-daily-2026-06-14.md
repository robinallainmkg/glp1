# Rapport Coach IA — 14 juin 2026

> Généré le 2026-06-14 | Projet Supabase : ywekaivgjzsmdocchvum

---

## KPIs 24 dernières heures

| Métrique | Aujourd'hui | Hier | Évolution |
|---|---|---|---|
| Messages totaux | 30 | 50 | ↓ -40% |
| Conversations | 6 | — | — |
| Messages user | 15 | — | — |
| Messages assistant | 15 | — | — |
| Msgs / conversation (moy.) | 5,0 | — | — |

**Modèles utilisés (LLM path) :**
| Modèle | Appels |
|---|---|
| llama-3.3-70b-versatile | 13 (87%) |
| llama-3.1-8b-instant | 2 (13%) |
| fallback-v1 (rules engine) | 0 |

**Taux LLM :** 100% (aucun fallback-v1 déclenché)

**Tracking d'intent :** 15/15 intents `NULL` — anomalie de tracking (voir section Problèmes).

**Durée moyenne des conversations engagées :**
- `cc09113e` : 2 min 12s (10 msgs)
- `dc246e08` : 12h 30 (8 msgs — session multi-jour)
- `6fde3e32` : 39s (4 msgs)
- `c39f5afc` : 38s (4 msgs)
- `d78f7397` : 0s (2 msgs — one-shot)
- `9e864907` : 0s (2 msgs — one-shot)

---

## Ce qui marche bien

1. **IMC flow fluide** (`cc09113e`) : le Coach a bien guidé l'utilisatrice pas à pas — d'abord son objectif, puis poids + taille, calcul IMC 41,7, verdict "éligible" clair. Flow conversationnel conforme au système prompt.

2. **Réponse chirurgie pertinente** (`d78f7397`) : à la question "Attendre 1 semaine" (avant chirurgie), réponse factuelle, concise, avec lien RAG `/collections/effets-secondaires-glp1/glp1-interactions-medicamenteuses-ozempic-wegovy-mounjaro/` pertinent.

3. **Empathie immédiate** (`c39f5afc`) : face à une utilisatrice vomissant depuis 12h, le ton rassurant du premier message est correct — pas de panique inutile.

4. **Gestion "ezez"** (`dc246e08`) : quand l'utilisateur envoie un message vide/test, le Coach gère élégamment sans erreur.

5. **Tutoiement/vouvoiement cohérent** : le Coach respecte le registre de chaque utilisateur dans toutes les conversations analysées.

---

## Problèmes détectés

### 🔴 CRITIQUE — Urgence médicale non reconnue

**Conversation :** `c39f5afc`
**Message user :** *"J'ai fait ma première injection wegovy 0,25 vendredi soir. Je suis sortie hier et j'ai trop bu. Cette nuit et encore 12h après je vomis tout ce que je bois et j'ai la diarrhée"*
**Puis :** *"Comment rester hydratée si je vomis l'eau ?"*

**Ce que le Coach a répondu :** Conseils de tisanes de camomille et petites gorgées d'eau.

**Ce qu'il AURAIT DÛ répondre :**
> Vomissements persistants depuis 12h et incapacité à garder l'eau, c'est une situation qui mérite une attention médicale rapide. Je te conseille d'appeler le 15 (SAMU) ou de contacter ton médecin traitant dès maintenant pour éviter une déshydratation. Pour les tisanes et petites gorgées, c'est bon en complément mais ça ne remplace pas une évaluation médicale dans ce cas.

Le système prompt stipule : *"si quelqu'un décrit des symptômes graves ACTUELS et URGENTS (vomissements persistants) → appeler le 15 (SAMU)"*. 12h de vomissements impossibilité de garder l'eau = urgence médicale, notamment avec une injection de semaglutide récente + alcool (interaction potentielle sur la vidange gastrique).

---

### 🔴 CRITIQUE — Contexte oublié, réponse hors-sujet

**Conversation :** `dc246e08`
**Contexte :** L'utilisateur revient 12h plus tard sur une conversation sur les effets secondaires et dit "Oui, discutons".

**Ce que le Coach a répondu (llama-3.1-8b, ~300 mots) :**
Longue liste de conseils pour "discuter avec son médecin AVANT de commencer un traitement GLP-1" — intake questionnaire, questions à poser, etc.

**Ce qu'il AURAIT DÛ répondre :**
La personne est déjà sous traitement et gère ses effets secondaires. Le Coach aurait dû continuer sur ce sujet : proposer des conseils concrets sur la gestion quotidienne (alimentation, hydratation, timing des prises) ou demander quel effet secondaire est le plus gênant.

---

### 🟠 IMPORTANT — Message dupliqué (bug technique)

**Conversation :** `cc09113e`
**Observation :** Le même message assistant ("Pour vérifier ton éligibilité au remboursement de Wegovy, il faut considérer ton IMC...") apparaît **deux fois** à 43 secondes d'intervalle (18:14:31 et 18:15:14), en réponse à deux messages user différents ("Suis-je éligible" et "Oui, je donne mes infos").

**Cause probable :** L'utilisatrice a renvoyé un message avant de recevoir la réponse → la fonction `saveMessages` a créé deux paires user/assistant au lieu d'associer le 2e message user à la réponse existante.

**Impact :** 2 messages en trop dans le comptage, expérience utilisateur dégradée (réponse répétée).

---

### 🟠 IMPORTANT — Réponse trop longue (violation règle 9)

**Conversation :** `cc09113e`, dernier message (llama-3.1-8b)
**Contexte :** Utilisatrice dit "Non, je connais déjà un médecin"
**Réponse réelle :** ~250 mots avec liste à puces de conseils pour choisir un médecin.
**Ce qu'il aurait dû répondre (40-80 mots) :**
> Parfait ! Parle-lui de ton IMC de 41,7 — tu es directement éligible au remboursement à 65% à partir du 15 juin 2026, sans comorbidités nécessaires. Pour la primo-prescription du remboursement, elle doit se faire dans un centre spécialisé (CSO/CHU), pas chez ton généraliste. Veux-tu que je t'envoie une checklist pour ton rendez-vous ?

De plus, l'email capture n'a **pas été proposée** alors que l'éligibilité était confirmée — c'est le moment exact prévu par le système prompt.

---

### 🟡 MODÉRÉ — "Zepbound" cité au lieu de "Mounjaro"

**Conversation :** `6fde3e32`
**Réponse Coach :** *"avec Zepbound, on observe une perte de poids moyenne de 15-20%"*

**Problème :** Zepbound est la marque US du tirzépatide. En France, le produit commercialisé est **Mounjaro**. Zepbound est inconnu du grand public français et peut créer de la confusion.

**Correction :** Toujours citer Mounjaro (ou "tirzépatide / Mounjaro") dans le contexte français.

---

### 🟡 MODÉRÉ — "Notre carte" (violation règle 11)

**Conversation :** `9e864907`
**Message user :** "Trouve une pharmacie près de chez moi"
**Réponse Coach :** *"je te recommande d'utiliser notre carte des prix en pharmacie"*

**Problème :** La règle 11 interdit explicitement *"nos articles", "nos guides"* ou toute formulation possessive. De plus, le lien cliquable `/outils/carte-prix-pharmacies/` n'est pas fourni dans la réponse.

**Ce qu'il aurait dû dire :**
> Je peux t'aider ! La [carte des prix en pharmacie](/outils/carte-prix-pharmacies/) te permettra de comparer directement. Tu es dans quelle ville ?

---

### 🟡 MODÉRÉ — Lien Insulevel hors-sujet

**Conversation :** `dc246e08`
**Réponse Coach :** lien vers `/collections/effets-secondaires-glp1/insulevel-effet-indesirable/`

**Problème :** "Insulevel" est un complément alimentaire (régulateur de glycémie), pas un médicament GLP-1. Proposer ce lien en réponse à une question sur les effets secondaires du GLP-1 induit l'utilisateur en erreur. Le RAG a probablement retourné ce chunk par similarité sémantique (glycémie/glucose), mais c'est hors-contexte.

---

### 🟡 MODÉRÉ — Intent tracking toujours NULL

**Observation :** 100% des `intent` en base sont `NULL` pour les messages du LLM path.

**Cause :** Dans `index.ts` ligne 734 :
```typescript
const detectedIntent = scamSignals.isScamRelated ? `scam:${scamSignals.severity}` : null;
```
L'intent n'est stocké que si des signaux d'arnaque sont détectés. Pour toutes les autres questions (effets secondaires, prix, remboursement, médecin...), `intent` reste `NULL`.

**Impact :** Impossible de suivre la répartition des questions, impossible de détecter les volumes par type de requête.

---

### 🟢 MINEUR — [[SUGGESTIONS]]/[[OPTIONS]] absents dans plusieurs réponses

Le système prompt requiert à la toute fin de CHAQUE réponse des choix cliquables au format `[[SUGGESTIONS]]` ou `[[OPTIONS]]`. Plusieurs réponses examinées ne respectent pas cette règle, notamment la conversation `d78f7397` (one-shot) et `9e864907`.

---

## Actions recommandées

### 1. Correction urgente du system prompt — Urgence médicale (vomissements)

Le seuil pour déclencher le protocole SAMU est trop imprécis. Ajouter une clarification :

**Diff proposé dans `SYSTEM_PROMPT` (ligne 35) :**
```diff
-4. UNIQUEMENT si quelqu'un décrit des symptômes graves ACTUELS et URGENTS (douleur abdominale sévère, vomissements persistants, pensées suicidaires, réaction allergique), tu dis d'appeler le 15 (SAMU). Sinon, tu orientes calmement vers un médecin.
+4. UNIQUEMENT si quelqu'un décrit des symptômes graves ACTUELS et URGENTS, tu dis d'appeler le 15 (SAMU) ou de consulter en urgence. Cela inclut : douleur abdominale sévère, vomissements persistants depuis plus de 6h ou incapacité à garder l'eau (risque déshydratation), pensées suicidaires, réaction allergique (œdème, urticaire généralisée). Pour les vomissements ou nausées modérés des premières semaines, oriente calmement vers le médecin traitant sans alarmer.
```

### 2. Correction "Zepbound" — Contexte France uniquement

Ajouter dans `CONTEXTE IMPORTANT` :
```diff
+- NOMS FRANCE UNIQUEMENT : cite toujours les marques françaises : Mounjaro (tirzépatide), Wegovy / Ozempic (sémaglutide), Saxenda (liraglutide). NE JAMAIS citer Zepbound (marque US du tirzépatide, inconnue en France).
```

### 3. Fix du tracking intent côté code

Dans `index.ts`, enrichir la détection d'intent pour le LLM path :

```typescript
// Après ligne 526 (scam detection)
function detectTopicIntent(message: string): string {
  const lower = message.toLowerCase();
  if (/prix|coût|rembours|tarif|combien/.test(lower)) return 'price';
  if (/effet|secondaire|naus|vomis|diarr|constip|fatigue/.test(lower)) return 'side_effects';
  if (/ordonnance|prescri|médecin|consult|obtenir/.test(lower)) return 'prescription';
  if (/poids|maigri|kilo|perte/.test(lower)) return 'weight';
  if (/pharmacie|trouver|stock|rupture/.test(lower)) return 'availability';
  if (/diab|glyc|insuline/.test(lower)) return 'diabetes';
  if (/arnaque|fraud|faux|sans ordonnance/.test(lower)) return 'scam';
  return 'general';
}

// Ligne 734, remplacer :
const detectedIntent = scamSignals.isScamRelated ? `scam:${scamSignals.severity}` : null;
// Par :
const detectedIntent = scamSignals.isScamRelated
  ? `scam:${scamSignals.severity}`
  : detectTopicIntent(cleanMessage);
```

### 4. Contraindre la longueur pour llama-3.1-8b

Le modèle 8B (fallback de rate-limit) ne respecte pas la contrainte 40-80 mots. Ajouter une instruction spécifique dans le system prompt qui soit encore plus explicite pour les modèles moins capables :

```diff
+⚠️ RAPPEL CRITIQUE LONGUEUR : ta réponse (hors [[SUGGESTIONS]]/[[OPTIONS]]) NE DOIT PAS DÉPASSER 80 mots. Compte tes mots avant d'envoyer. Si tu as plusieurs points, n'en donne qu'un et propose d'approfondir.
```

### 5. Email capture manquée → ajouter dans le flow éligibilité

Lorsque l'éligibilité est confirmée ET que l'utilisateur dit déjà avoir un médecin, le coach devrait automatiquement proposer la checklist. Ajouter dans `FLUX "SUIS-JE ÉLIGIBLE ?"` :

```diff
+- Si l'utilisateur dit avoir déjà un médecin après un verdict "éligible" : PROPOSE IMMÉDIATEMENT la checklist email. "Top ! Pour ton rendez-vous, je peux t'envoyer une checklist personnalisée (documents à apporter, questions à poser, conditions du remboursement). Ton email ?"
```

### 6. Articles suggérés — Questions sans bonne réponse

| Question détectée | Article à créer |
|---|---|
| Wegovy + alcool (interactions, risques) | `/collections/effets-secondaires-glp1/wegovy-alcool-interactions/` |
| Vomissements persistants sous GLP-1 — quand consulter en urgence | `/collections/effets-secondaires-glp1/glp1-vomissements-quand-consulter/` |
| Hydratation quand on vomit sous GLP-1 | Peut être section dans l'article effets secondaires existant |

---

## Conversations marquantes

### Les 3 meilleures

**1. `cc09113e` — Flow remboursement (8 messages, 2min12)**
Conversation la plus engagée de la journée. Le Coach guide efficacement une utilisatrice (IMC 41,7) depuis la question d'éligibilité jusqu'au calcul IMC et orientation médecin. Modèle 70B majoritaire. Quelques imperfections (réponse trop longue en fin, email capture manquée) mais le flow global est excellent.

**2. `d78f7397` — Réponse chirurgie (one-shot)**
Réponse parfaite : concise, factuelle, lien RAG pertinent, vouvoiement adapté. C'est ce que doit être une réponse one-shot.

**3. `c39f5afc` — Gestion effets secondaires (4 messages, 38s)**
La première partie de la conversation est bien gérée (empathie, tutoiement correct, questionnement utile). La dégradation sur la gestion de l'urgence est le seul point noir.

---

### Les 3 pires

**1. `c39f5afc` — Urgence médicale non reconnue**
12 heures de vomissements + impossible de garder l'eau → le Coach propose de la camomille. **Risque médico-légal réel.** Ce cas illustre la nécessité absolue de renforcer la détection d'urgence.

**2. `dc246e08` — Perte de contexte + réponse hors-sujet (llama-3.1-8b)**
L'utilisateur est déjà sous traitement et pose des questions sur les effets secondaires. Après 12h de pause, le Coach (en fallback 8B) lui explique comment choisir un médecin AVANT de commencer. Réponse de 300+ mots, totalement hors-sujet.

**3. `9e864907` — Abandon rapide (pharmacie locale)**
L'utilisateur demande une pharmacie proche, le Coach répond sans donner de lien cliquable et dit "notre carte" (violation règle 11). L'utilisateur n'a pas répondu. C'est précisément le cas d'abandon que le système prompt cherche à éviter : *"Ne réponds JAMAIS 'je ne peux pas' — c'est la 1re cause d'abandon."*

---

## Métriques complémentaires à surveiller

- **Taux d'abandon one-shot** : 2/6 conversations = 33% (conversations à 2 messages seulement) → identifier les questions sans relance réussie
- **Fallback 8B** : 2/15 réponses (13%) — surveiller si le taux monte avec la croissance du volume
- **Email captures déclenchées** : 0 sur 6 conversations, dont au moins 1 où l'éligibilité était confirmée → **KPI à 0 = perte de revenus directe**
- **Volume J-1 :** -40% vs veille. À surveiller sur la semaine pour distinguer fluctuation normale vs tendance.
