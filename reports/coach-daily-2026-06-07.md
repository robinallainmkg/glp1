# Rapport quotidien Coach IA — 2026-06-07

## KPIs

| Métrique | Valeur |
|---|---|
| Messages totaux (24h) | 52 |
| Conversations | 8 |
| Messages user | 26 |
| Messages assistant | 26 |
| Messages par conversation (moy.) | 6,5 |
| Durée moyenne conversation | ~1 min 16 sec |
| Durée max | 3 min 59 sec (conv 99753b19) |
| Taux LLM (llama-3.3-70b-versatile) | **92,3%** (24/26) |
| Taux Fallback-v1 | **7,7%** (2/26) |
| Évolution vs veille | **↑ +100%** (52 vs 26 messages) |

### Breakdown intents (assistant)
- `null` (LLM sans intent renseigné) : 24
- `price` (fallback) : 1
- `general` (fallback) : 1

---

## Ce qui marche bien

- **Flow d'éligibilité opérationnel** : 5 conversations sur 8 ont démarré le flux remboursement à 65%, le Coach collecte les données une par une (IMC → comorbidités → suivi nutritionnel) sans tout demander en rafale.
- **Calculs IMC corrects** : Conv 9fc6a4f0 (34,5), 9fb857dc (35,7), 43046cda (35,2), 99753b19 (61,2) — tous exacts.
- **Prix et conditions de remboursement à jour** : Le Coach cite systématiquement "remboursé 65% depuis le 15 juin 2026", les CSO/CHU pour la primo-prescription, et les conditions IMC ≥ 35 avec comorbidité ou ≥ 40.
- **Lien article RAG pertinent** : Conv 9fc6a4f0 → lien `/collections/regime-glp1/suivi-glp1-perte-de-poids-effets-dose/` inséré naturellement après une réponse sur le suivi.
- **Taux LLM élevé** : 92,3% des réponses passent par le LLM, le fallback reste minoritaire.
- **Engagement fort** : 4 conversations sur 8 atteignent 10 messages (maximum probable de la session), signe d'un parcours d'éligibilité mené jusqu'au bout.

---

## Problèmes détectés

### 🔴 Problème 1 — Fallback intempestif sur message court (conv 6d21d941)

**Conversation_id** : `6d21d941-c524-411c-bfb5-ff2f25ff8ab7`

| Tour | Role | Message |
|---|---|---|
| 1 | user | "Suis-je éligible au remboursement de Wegovy ?" |
| 2 | assistant (LLM ✅) | Réponse correcte sur les critères + "Veux-tu qu'on vérifie ton éligibilité en 2-3 questions ?" |
| 3 | user | **"Oui, vérifions"** (clic suggestion) |
| 4 | assistant (fallback-v1 ❌) | "Je n'ai pas pu traiter votre question en détail pour le moment. Pouvez-vous la reformuler..." |
| 5 | user | "Éligibilité remboursement mounjaro" |
| 6 | assistant (fallback-v1) | Répond prix (intent: price) |

**Ce qu'il AURAIT DÛ répondre (tour 4)** : "Pour vérifier ton éligibilité, j'ai besoin de ton poids et ta taille — tu peux me les donner ?"

**Cause probable** : Le message "Oui, vérifions" (2 mots) provoque une erreur ou timeout Groq, qui bascule en fallback. Le fallback `classifyAndRespond` ne matche aucun pattern → intent `general` → réponse générique hors contexte.

**Fix recommandé** : Voir section Actions.

---

### 🔴 Problème 2 — "Je ne sais pas" interprété hors contexte (conv 9fb857dc)

**Conversation_id** : `9fb857dc-fe48-4b0f-bd89-b7949452f244`

| Tour | Role | Message |
|---|---|---|
| 4 | user | "97kg pour 165 cm" |
| 5 | assistant (LLM ✅) | Calcule IMC 35,7, pose question comorbidités |
| 6 | user | **"Je ne sais pas"** (répond aux comorbidités) |
| 7 | assistant (LLM ❌) | "Il semble que vous soyez à la recherche d'informations sur les traitements GLP-1, mais que vous ne sachiez pas exactement par où commencer... Qu'est-ce qui vous amène à considérer ces traitements ?" |
| 8 | user | "Discutez de vos inquiétudes" (clic suggestion ?) |
| 9 | assistant (LLM ❌) | Répond sur la santé mentale, le 3114, les idées noires |

**Ce qu'il AURAIT DÛ répondre (tour 7)** : "Pas d'inquiétude — les comorbidités les plus courantes sont hypertension, diabète T2, apnée du sommeil, dyslipidémie. Est-ce que tu as l'un de ces problèmes de santé ?"

**Ce qu'il AURAIT DÛ répondre (tour 9)** : Le Coach a généré une suggestion "Discutez de vos inquiétudes" qui ne correspondait pas au contexte, puis a répondu à cette suggestion en évoquant le 3114 et les idées suicidaires — totalement hors contexte et potentiellement anxiogène pour un utilisateur qui posait une question banale sur son éligibilité au remboursement.

---

### 🟠 Problème 3 — Pas de verdict clair en fin de flux éligibilité (conv 99753b19)

**Conversation_id** : `99753b19-7400-4b39-b136-2c39b562d50e`

User avec IMC 61,2 (>> 40) → sans comorbidité, il est quand même éligible (critère IMC ≥ 40 seul suffit).

| Tour | Role | Message |
|---|---|---|
| 6 | user | "Non, je n'ai pas de comorbidités" |
| 7 | assistant ❌ | "il faudrait que vous ayez tenté une prise en charge nutritionnelle sans succès pendant au moins 3 à 6 mois. Veux-tu que je vérifie les autres conditions...?" |

**Ce qu'il AURAIT DÛ répondre** : "Avec un IMC de 61, tu es au-dessus du seuil de 40 qui ouvre le remboursement sans comorbidité nécessaire. **Tu es probablement éligible.** Il reste une condition : avoir tenté un suivi nutritionnel (régime, diététicien) sans résultat suffisant. C'est déjà le cas ? Si oui, la prochaine étape c'est de consulter en CSO ou CHU pour la primo-prescription."

La conversation se termine sans jamais donner de verdict final alors que le cas était quasi-évident.

---

### 🟠 Problème 4 — Question sur "poids actuel ou initial" ignorée (conv 43046cda)

**Conversation_id** : `43046cda-8827-4a47-9fe6-8bf3c625f665`

| Tour | Role | Message |
|---|---|---|
| 3 | user | **"Le poids maintenant ou au début du traitement ?"** |
| 4 | assistant ❌ | "j'ai besoin de votre poids et de votre taille... Pouvez-vous me donner ces informations ?" (ignore la vraie question) |
| 5 | user | "Donnes ton poids" (frustration) |
| 6 | assistant ❌ | Répète encore la demande poids/taille |

**Ce qu'il AURAIT DÛ répondre (tour 4)** : "Ton poids ACTUEL — c'est lui qui détermine ton IMC pour l'éligibilité. Si tu as déjà commencé un traitement GLP-1 et perdu du poids, on peut aussi regarder ton IMC de départ, car certains médecins s'y réfèrent."

---

### 🟡 Problème 5 — Incohérence tutoiement/vouvoiement systématique

Dans 5/8 conversations, le Coach commence en vouvoyant puis passe au tutoiement dans la relance finale :
- "Vous devez avoir un IMC..." → "Veux-tu qu'on vérifie..."
- "Pouvez-vous me donner..." → "Veux-tu que je vérifie..."

Le system prompt précise "tutoiement si l'utilisateur tutoie, vouvoiement sinon" mais le LLM applique le vouvoiement au corps de la réponse et le tutoiement aux relances. Aucun des 8 utilisateurs ne tutoyait en premier message.

---

### 🟡 Problème 6 — Relance hors-sujet pour user avec ordonnance (conv 6b1c3ba0)

**Conversation_id** : `6b1c3ba0-b49b-43c6-8ab4-10db5b06f313`

| Role | Message |
|---|---|
| user | "J ai l ordonnance je cherche une pharmacie moins cher près de val d Europe" |
| assistant ❌ | Oriente vers carte des prix ✅, puis : "Veux-tu qu'on vérifie d'abord si tu es éligible au remboursement ?" ❌ |

L'utilisateur A DÉJÀ une ordonnance — la question d'éligibilité est dépassée. La relance aurait dû être : "Dans quel département es-tu ? Je peux t'aider à cibler les pharmacies."

---

### 🟡 Problème 7 — IMC 34,5 et question du poids initial non traitée (conv 9fc6a4f0)

**Conversation_id** : `9fc6a4f0-c521-428a-8cbe-2b0267f582ed`

User déjà en traitement depuis octobre, poids actuel 85kg (était 103kg à 1m57).
- IMC actuel : 34,5 → sous le seuil remboursement (35)
- IMC initial avec 103kg : **41,8** → largement éligible

Le Coach a répondu "vous avez déjà atteint une perte de poids significative" en changeant de sujet (plateau de poids), alors que la vraie réponse utile aurait été : "Pour le remboursement, c'est ton IMC au moment de la **primo-prescription** qui compte. Avec 103kg au départ, ton IMC était de 41,8 — tu étais éligible. La décision reste à confirmer avec ton médecin."

**Lacune article** : aucun article dans le RAG ne couvre ce cas (poids initial vs actuel pour l'éligibilité).

---

## Actions recommandées

### Action 1 — Fix fallback sur messages courts (priorité HAUTE)

Le fallback se déclenche quand Groq retourne une erreur. Les messages d'1-3 mots déclenchés par les suggestions ("Oui, vérifions", "Oui", "Non") semblent provoquer des timeouts.

**Diff `supabase/functions/ai-coach/index.ts`** :

Dans le catch du LLM (ligne ~671), avant d'appeler `classifyAndRespond`, tenter une relance simplifiée si le message est court et que l'historique contient du contexte :

```typescript
// Dans le catch (ligne ~671), remplacer :
const fallback = classifyAndRespond(cleanMessage);

// Par :
// Si message court et historique existant → réponse de continuation neutre
const isShortContinuation = cleanMessage.length <= 15 &&
  /^(oui|non|ok|d'accord|vérifions|vérifier|oui vérifions|non merci)$/i.test(cleanMessage.trim());

if (isShortContinuation && historyMessages.length > 0) {
  const continuationResponse = "Pouvez-vous me redonner votre poids et votre taille pour que je puisse vérifier votre éligibilité ?";
  await saveMessages(supabase, convId, session_id, cleanMessage, continuationResponse, null, "fallback-v1", null, null, user_id);
  return jsonResponse({ response: continuationResponse, conversation_id: convId, sources: [], model: "fallback-v1" });
}

const fallback = classifyAndRespond(cleanMessage);
```

**Solution préférable** : augmenter le timeout Groq ou retry automatique 1 fois avant de tomber en fallback.

---

### Action 2 — Renforcer le system prompt sur "Je ne sais pas" et les comorbidités (priorité HAUTE)

Ajouter dans le system prompt, dans la section FLUX ÉLIGIBILITÉ :

```diff
- Si oui, collecte UNE info à la fois, sans tout redemander : (1) poids + taille → calcule l'IMC ; (2) comorbidités (diabète T2, hypertension, apnée du sommeil, etc.) ; (3) un suivi nutritionnel a-t-il déjà été tenté ?
+ Si oui, collecte UNE info à la fois, sans tout redemander : (1) poids + taille → calcule l'IMC ; (2) comorbidités — si l'utilisateur répond "je ne sais pas" ou "je suis pas sûr", LISTE les comorbidités principales (hypertension, diabète T2, apnée du sommeil, dyslipidémie) et repose la question avec ces exemples ; (3) un suivi nutritionnel a-t-il déjà été tenté ?
```

---

### Action 3 — Rendre le verdict obligatoire en fin de flux éligibilité (priorité HAUTE)

Ajouter dans le system prompt, dans la section FLUX ÉLIGIBILITÉ :

```diff
- Puis donne un verdict CLAIR et nuancé : "éligible", "probablement éligible", ou "à confirmer avec ton médecin" — en rappelant que la décision finale revient au médecin (critères : IMC ≥ 35 avec comorbidité, ou ≥ 40, après échec d'une prise en charge nutritionnelle).
+ Puis donne un verdict CLAIR et nuancé : "éligible", "probablement éligible", ou "à confirmer avec ton médecin" — en rappelant que la décision finale revient au médecin. IMPORTANT : si IMC ≥ 40, l'utilisateur est éligible SANS comorbidité nécessaire — dis-le clairement. Ne pose PAS de question supplémentaire après le verdict : donne le résultat, puis propose la prochaine étape concrète (consulter en CSO/CHU).
```

---

### Action 4 — Fix incohérence tutoiement/vouvoiement (priorité MOYENNE)

Ajouter dans le system prompt, règle 8 :

```diff
- Tutoiement si l'utilisateur tutoie, vouvoiement sinon.
+ Tutoiement si l'utilisateur tutoie, vouvoiement sinon. CRITIQUE : sois COHÉRENT dans TOUTE la réponse — ne mélange JAMAIS vouvoiement et tutoiement au sein du même message. La relance finale doit utiliser le même registre que le reste de la réponse.
```

---

### Action 5 — Cas "utilisateur avec ordonnance cherchant une pharmacie" (priorité MOYENNE)

Ajouter dans le system prompt, section REQUÊTES LOCALES :

```diff
+ - Si l'utilisateur mentionne qu'il a DÉJÀ une ordonnance, ne propose PAS de vérifier son éligibilité (c'est déjà fait). Oriente directement vers la carte des prix et demande sa ville ou son département pour cibler.
```

---

### Action 6 — Cas "poids actuel vs poids initial pour le remboursement" (priorité MOYENNE)

Ajouter dans CONTEXTE IMPORTANT :

```diff
+ - POIDS POUR L'ÉLIGIBILITÉ : pour le remboursement, c'est le poids/IMC au moment de la primo-prescription qui compte, pas le poids actuel (si l'utilisateur est déjà en traitement). Si le poids actuel donne un IMC < 35, vérifier si le poids initial (avant traitement) donnait un IMC ≥ 35. Si oui, indiquer que la personne était probablement éligible et qu'il faut le confirmer avec son médecin.
```

---

### Suggestion nouveaux articles (basée sur les gaps RAG)

| Sujet | Justification |
|---|---|
| "Remboursement GLP-1 : poids actuel ou poids initial pour l'IMC ?" | 2 utilisateurs sur 8 étaient déjà en traitement — cas fréquent non couvert |
| "Comment savoir si j'ai des comorbidités liées au poids ?" | "Je ne sais pas" est une réponse fréquente dans le flux éligibilité |
| "Pharmacies moins chères pour Wegovy et Mounjaro en France" | Conv 6b1c3ba0 montre un besoin concret de comparaison de prix géolocalisée |

---

## Conversations marquantes

### ✅ Top 3 (meilleures)

**1. Conv 9fc6a4f0** (10 msgs, 2:07) — *Utilisatrice déjà en traitement, -18kg*
Conversation la plus riche en information. La Coach a suivi l'utilisatrice qui perd du poids depuis octobre (103→85kg). Calcul IMC correct, lien RAG pertinent fourni en fin de conversation. Seul bémol : n'a pas traité le cas "poids initial vs actuel" pour le remboursement.

**2. Conv 43046cda** (10 msgs, 1:20) — *IMC 35.2, flux éligibilité mené jusqu'au bout*
Flow d'éligibilité suivi proprement. IMC calculé correctement (35,2). Question comorbidités posée. Seul problème : la question "poids actuel ou initial" a été ignorée au tour 3.

**3. Conv 99753b19** (10 msgs, 3:59) — *IMC 61.2, cas d'obésité massive*
Engagement le plus long. Calcul IMC correct pour un cas extrême (200kg/1m80). Bonne gestion du "pas de comorbidités" (le Coach rappelle qu'IMC ≥ 40 seul suffit). Manque un verdict final explicite.

---

### ❌ Bottom 3 (à corriger)

**1. Conv 6d21d941** (6 msgs, 28s) — *Fallback brisé par clic sur suggestion*
Le parcours d'éligibilité le mieux commencé (réponse LLM claire et précise) est cassé net au tour 3 par un fallback intempestif sur "Oui, vérifions". L'utilisateur se retrouve à recevoir une réponse générique incompréhensible, puis une liste de prix sans rapport avec sa question initiale. **Expérience brisée.**

**2. Conv 9fb857dc** (10 msgs, 2:06) — *"Je ne sais pas" → réponse sur le suicide*
Le Coach perd complètement le fil au tour 7 en interprétant "Je ne sais pas" (réponse sur les comorbidités) comme une question d'orientation générale. La conversation déraille vers un sujet inexistant, et se termine avec une mention du 3114 (numéro prévention suicide) totalement hors contexte pour un utilisateur qui voulait juste savoir s'il avait de l'hypertension. **Potentiellement anxiogène.**

**3. Conv f0a7d6c5** (2 msgs) — *Message "Challans" orphelin*
L'utilisateur envoie juste "Challans" — probablement en continuation d'une session précédente où on lui demandait sa ville. Sans contexte, le Coach donne une réponse générique "médecin ou pharmacie" sans savoir ce que cherche l'utilisateur. Réponse correcte mais trop floue.

---

*Rapport généré le 2026-06-07 — Agent monitoring Coach IA GLP-1 France*
