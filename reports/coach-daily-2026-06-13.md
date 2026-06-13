# Rapport Coach IA — 13 juin 2026

## KPIs

| Métrique | Valeur | vs veille |
|---|---|---|
| Messages totaux (24h) | 50 | ↓ −40.5% (84 hier) |
| Conversations | 9 | — |
| Messages utilisateur | 25 | — |
| Messages par conversation | 5.6 | — |
| Durée moyenne (convs actives) | ~2min15 | — |
| Taux LLM (vs fallback-v1) | 100% | ✅ |

### Répartition modèles
| Modèle | Réponses | % |
|---|---|---|
| llama-3.3-70b-versatile | 16 | 64% |
| llama-3.1-8b-instant | 7 | 28% |
| mistral-small-latest | 2 | 8% |
| fallback-v1 | 0 | 0% |

### Intent breakdown
- **Intent tracking non fonctionnel** : toutes les 25 réponses LLM ont `intent = null`. Le champ n'est alimenté que par le moteur de règles (fallback-v1). Sur le chemin LLM, aucun intent n'est détecté ni stocké → tableau de bord analytics aveugle.

---

## Ce qui marche bien

- **Taux LLM 100%** : la chaîne de résilience (70B → 8B → Mistral) fonctionne, zéro fallback-v1 déclenché.
- **Date de remboursement respectée** : toutes les conversations mentionnent correctement "à partir du 15 juin 2026" — la règle prioritaire du system prompt est appliquée.
- **Flow d'éligibilité IMC** (conv `8919fc43`) : le Coach a calculé correctement l'IMC (84 kg / 1,54 m² = 35,5), proposé le verdict conditionnel éligible et guidé pas à pas — c'est le comportement attendu.
- **Aucun diagnostic médical** : le Coach redirige systématiquement vers un médecin pour les décisions de traitement.
- **Article RAG pertinent** (conv `d78f7397`) : lien vers l'article pancréatite inclus, même si le choix est discutable (voir problèmes).

---

## Problèmes détectés

### 🔴 BUG CRITIQUE — Critères IMC erronés (llama-3.1-8b-instant)

**Convs concernées** : `9755fd00`, `97df2514`

Le modèle 8B répond systématiquement "IMC ≥ 30 avec comorbidité" au lieu du critère officiel "IMC ≥ 35 avec comorbidité ou ≥ 40 sans comorbidité". Il induit les utilisateurs en erreur sur leur éligibilité.

| Champ | Valeur |
|---|---|
| conv_id | `9755fd00-8e69-495f-a3ce-e8b272821ef4` |
| Message user | "Suis-je éligible au remboursement de Wegovy ?" |
| Réponse Coach (8B) | "votre IMC doit être supérieur ou égal à 35 kg/m², **ou supérieur ou égal à 30 kg/m² avec au moins une comorbidité**" |
| Réponse attendue | "IMC ≥ 35 avec au moins une comorbidité liée au poids, OU IMC ≥ 40 sans comorbidité" |

---

### 🔴 BUG CRITIQUE — "98 156" non reconnu comme poids/taille

**Conv** : `9755fd00`

L'utilisateur (très engagé, écriture en MAJUSCULES, 6 échanges) finit par donner son poids et sa taille après que le Coach le lui a demandé. Le modèle 70B qui prend le relais ne reconnaît pas les données.

| Champ | Valeur |
|---|---|
| conv_id | `9755fd00-8e69-495f-a3ce-e8b272821ef4` |
| Message user | "98 156" (98 kg, 156 cm — réponse directe à "Pouvez-vous me donner votre poids et taille ?") |
| Réponse Coach (70B) | "Il semble que vous ayez partagé des informations **sans poser une question spécifique**. Pouvez-vous me dire ce que vous aimeriez savoir..." |
| Réponse attendue | "Merci. Votre IMC est de 98 / (1,56²) = **40,3 kg/m²**. Bonne nouvelle : avec un IMC ≥ 40, vous êtes éligible au remboursement à 65% sans avoir besoin de comorbidité. Avez-vous déjà une ordonnance ou cherchez-vous à démarrer ?" |

Le Coach 70B a récupéré l'historique depuis la BDD mais n'a pas interprété "98 156" comme une réponse au contexte de la demande de poids/taille.

---

### 🔴 BUG CRITIQUE — Lien carte des prix jamais fourni

**Convs concernées** : `766f3192`, `f6ab0a2b`

Le system prompt est explicite : *"Donne TOUJOURS le lien de la carte des prix"* (`/outils/carte-prix-pharmacies/`). Aucune des conversations pharmacie ne l'a inclus. Le Coach répète "consultez notre carte des prix" sans fournir l'URL, ce qui génère de la frustration (l'utilisateur `766f3192` a eu à demander 4 fois).

| Champ | Valeur |
|---|---|
| conv_id | `766f3192-9a1e-46e4-94a3-ca41ed8ebc89` |
| Message user | "Carte des prix" (4e tentative) |
| Réponse Coach (8B) | "Pour avoir une idée des prix des GLP-1 près de chez toi, je te conseille de consulter **notre carte des prix**... Pouvez-vous me donner votre ville ?" (re-demande la ville déjà donnée!) |
| Réponse attendue | "Voici la carte directement : [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/). Tu m'as donné le 91540 — les pharmacies autour de Fontenay-le-Vicomte affichent des prix fixes pour les GLP-1 sur ordonnance (remboursés, le prix est réglementé). Veux-tu des infos sur le reste à charge après remboursement ?" |

---

### 🔴 BUG — Réponse hors sujet après dégradation de modèle

**Conv** : `766f3192`

Après la chaîne 70B → 8B → Mistral, la réponse Mistral à "Evry" (ville donnée pour trouver une pharmacie) est complètement hors sujet.

| Champ | Valeur |
|---|---|
| conv_id | `766f3192-9a1e-46e4-94a3-ca41ed8ebc89` |
| Message user | "Evry" (ville en réponse à "donne ta ville") |
| Réponse Coach (Mistral) | "Pour le Wegovy à Évry, le remboursement à 65%... Si tu as une mutuelle comme **Malakoff Humanis**, vérifie si ton contrat... Veux-tu que je t'aide à vérifier si ton contrat **Malakoff Humanis** couvre le Wegovy ?" |
| Réponse attendue | "[Carte des prix en pharmacie](/outils/carte-prix-pharmacies/) — filtre sur Évry (91000). Le prix des GLP-1 sur ordonnance est réglementé en France : idem partout. La différence se joue sur le stock disponible. Veux-tu des infos sur le remboursement ?" |

Mistral a hallucineé "Malakoff Humanis" (aucune mention de mutuelle dans la conversation).

---

### 🟠 BUG — Médication inventée (Mounjaro substitué à Wegovy)

**Conv** : `9755fd00`

| Champ | Valeur |
|---|---|
| conv_id | `9755fd00-8e69-495f-a3ce-e8b272821ef4` |
| Message user | "JE SUIS DEJA SOUS TRAIREMENT SERAIS JE REMBOURSER" (dans le contexte Wegovy) |
| Réponse Coach (8B) | "Si vous êtes déjà sous traitement avec **Mounjaro**, la perspective du remboursement est très positive..." |
| Réponse attendue | "Si vous êtes déjà sous Wegovy, oui — vous serez remboursé à 65% à partir du 15 juin 2026, sous réserve de remplir les critères IMC. Veux-tu qu'on vérifie ton éligibilité ?" |

Le 8B a substitué Mounjaro à Wegovy sans raison.

---

### 🟠 BUG — Formulation "notre" interdite (règle 11)

**Convs concernées** : `766f3192`, `f6ab0a2b`, `589243fe`

Le system prompt interdit "d'après nos articles", "selon nos guides" ou toute formulation s'appuyant sur "nos" contenus. On trouve dans 3 conversations : *"notre carte des prix en pharmacie"*, *"nos articles sur les régimes GLP-1"*. Règle systématiquement violée.

---

### 🟡 BUG MINEUR — Lien pancréatite potentiellement alarmiste

**Conv** : `d78f7397`

L'utilisateur a des douleurs abdominales classiques de début de traitement GLP-1 (dose initiale 10 mg, 5 jours, traité par pantoprazole). Le Coach a fourni un lien vers l'article "GLP-1 et Pancréatite".

Le lien vers la pancréatite est disproportionné pour ce contexte banal. Mieux vaut lier vers un article sur les effets secondaires généraux en début de traitement.

---

### 🟡 BUG MINEUR — Incohérence tutoiement/vouvoiement

**Conv** : `8919fc43`

Le Coach commence avec "Pouvez-vous" (vouvoiement), puis passe à "Veux-tu" (tutoiement) dans la même conversation, sans que l'utilisateur ait changé de registre.

---

### 🟡 BUG — Intent non tracé sur chemin LLM

Toutes les réponses LLM ont `intent = null` en base. Le système ne trackait les intents que via le fallback-v1. Le dashboard admin analytics est aveugle sur les intentions des 100% des conversations réelles. À corriger dans la fonction `saveMessages`.

---

## Actions recommandées

### 1. System prompt — Ajout de 3 règles (diff exact)

**Problème visé** : critères IMC erronés par 8B, "98 156" non reconnu, lien carte jamais fourni.

Ajouter dans la section `RÈGLES ABSOLUES` (après la règle 13) :

```diff
+14. Quand l'utilisateur fournit deux nombres en réponse à une demande de poids/taille (ex : "98 156", "84kg 1m62"), TOUJOURS les interpréter comme poids (kg) et taille (cm) et calculer l'IMC immédiatement.
+15. Pour les demandes de prix ou de pharmacie, inclure TOUJOURS le lien exact : [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/). Ne jamais écrire "notre carte" — écrire "la carte des prix".
+16. CRITÈRES DE REMBOURSEMENT OBÉSITÉ (PRIORITAIRES, NE PAS MODIFIER) : IMC ≥ 35 kg/m² avec AU MOINS UNE comorbidité liée au poids (diabète T2, HTA, apnée du sommeil…), OU IMC ≥ 40 kg/m² sans comorbidité. NE JAMAIS indiquer IMC ≥ 30 comme seuil d'éligibilité.
```

Remplacer dans la section `CONTEXTE IMPORTANT` :
```diff
-IMC ≥ 35 avec comorbidité ou IMC ≥ 40
+IMC STRICTEMENT ≥ 35 avec AU MOINS UNE comorbidité (diabète T2, HTA, apnée du sommeil, etc.), OU IMC STRICTEMENT ≥ 40 sans comorbidité. Seuil absolu. Ne jamais citer 30.
```

### 2. Intent tracking — Corriger `saveMessages` dans `index.ts`

Ligne 724 : `const detectedIntent = scamSignals.isScamRelated ? 'scam:...' : null`

Ajouter une classification d'intent basique pour le chemin LLM :

```typescript
// Classification d'intent pour analytics (best-effort, après la réponse LLM)
function inferIntent(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (/prix|co[uû]t|rembours|tarif|combien/.test(msg)) return 'price';
  if (/ordonnance|prescri|m[eé]decin|obtenir/.test(msg)) return 'prescription';
  if (/effet|secondaire|naus[eé]|douleur|ventre/.test(msg)) return 'side_effects';
  if (/éligible|éligibilité|remboursement|imc/.test(msg)) return 'eligibility';
  if (/pharmacie|près de|trouver/.test(msg)) return 'pharmacy_search';
  if (/arnaque|faux|gelule|sans ordonnance/.test(msg)) return 'scam';
  return 'general';
}
```

Puis : `const detectedIntent = scamSignals.isScamRelated ? 'scam:...' : inferIntent(cleanMessage);`

### 3. Prompt contextuel pour les données numériques

Ajouter dans la construction de `userMessageWithContext` (ligne ~624) une détection du contexte IMC :

```typescript
// Si historique demandait poids/taille et user répond avec 2 nombres
const lastAssistantAskedWeight = historyMessages.slice(-2).some(m => 
  m.role === 'assistant' && /poids|taille|kg|cm/.test(m.content)
);
const looksLikeWeightHeight = /^\s*\d{2,3}\s+\d{2,3}\s*$/.test(cleanMessage);
const weightHint = (lastAssistantAskedWeight && looksLikeWeightHeight) 
  ? `\n\n[CONTEXTE SYSTÈME : L'utilisateur fournit son poids et sa taille en réponse à ta demande. Interpréter "${cleanMessage}" comme poids=${cleanMessage.trim().split(/\s+/)[0]}kg, taille=${cleanMessage.trim().split(/\s+/)[1]}cm. Calculer l'IMC immédiatement.]`
  : '';
```

### 4. Nouveaux articles suggérés

| Sujet | Justification |
|---|---|
| "Effets secondaires la première semaine sous GLP-1 : ce qui est normal" | Conv `d78f7397` — utilisateur inquiet après 5 jours, lien pancréatite disproportionné |
| "Se préparer à son premier rendez-vous en centre de l'obésité (CSO)" | Multiple convs finissent en "consultez un médecin" sans aide concrète sur la suite |
| "Ordonnance étrangère en France : ce qui est valable" | Conv `ed08c2d9` — question précise avec audience potentielle expats/frontaliers |

---

## Conversations marquantes

### ✅ Top 3 (meilleures)

**1. `8919fc43` — Eligibility flow complet (10 messages, 2m44)**
La meilleure conversation de la journée. L'utilisateur a donné ses mesures (154cm, 84kg), le Coach a calculé l'IMC correctement (35.5), annoncé le verdict conditionnel, et proposé la checklist médecin. Le flow d'éligibilité a fonctionné comme prévu. Seul défaut : incohérence tutoiement/vouvoiement.

**2. `83d7b68f` — Réponse claire et concise (2 messages)**
Question simple "Suis-je éligible ?", réponse factuelle avec les bons critères IMC et une relance pertinente. Modèle 70B performant.

**3. `ed08c2d9` — Ordonnance anglaise (2 messages)**
Question de niche bien traitée. La règle (ordonnance UK non valide en France depuis Brexit) est correcte. Ton professionnel, orientation vers annuaire-sante.ameli.fr appropriée.

---

### ❌ Flop 3 (à corriger en priorité)

**1. `9755fd00` — Cascade d'erreurs sur utilisateur très engagé (10 messages, 6m31)**
L'utilisateur le plus motivé de la journée (4 messages en MAJUSCULES) : mauvais critères IMC (30 au lieu de 35), Mounjaro inventé à la place de Wegovy, et finalement "98 156" non reconnu comme poids/taille. La conversation se termine sur un échec total pour l'utilisateur le plus qualifié.

**2. `766f3192` — Breakdown pharmacie / cascade modèle (10 messages, 1m42)**
Pas un seul lien `/outils/carte-prix-pharmacies/` fourni en 10 messages. L'utilisateur demande "Carte des prix" explicitement et reçoit une nouvelle demande de ville. Puis la dégradation 70B→8B→Mistral produit une réponse hallucinée sur Malakoff Humanis totalement hors sujet.

**3. `589243fe` — "je vous achate" mal géré + hors sujet (6 messages)**
Le message "je vous achate" (probablement "je voudrais l'acheter") est correctement reconnu comme ambigu mais la réponse pivote sur Mounjaro/Wegovy alors que la conversation portait sur Ozempic. La réponse suivante à "Je veux plus d'info" est générique et détachée du sujet initial.
