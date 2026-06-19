# Coach IA GLP-1 — Rapport quotidien 2026-06-19

## KPIs

| Métrique | Valeur | vs Veille |
|---|---|---|
| Messages totaux (24h) | 80 | +73.9% ↑ (hier : 46) |
| Conversations | 15 | — |
| Messages utilisateur | 40 | — |
| Messages par conversation | 5.3 | — |
| Durée moyenne (convs actives) | ~4m30s | — |
| Taux LLM | 100% | — |
| Taux Fallback-v1 | 0% | ✓ |

### Breakdown LLM

| Modèle | Réponses |
|---|---|
| llama-3.3-70b-versatile (Groq) | 24 (60%) |
| mistral-small-latest | 16 (40%) |
| fallback-v1 | 0 (0%) |

> **Note** : Le champ `intent` est `NULL` pour 100% des 40 réponses assistant. Il n'est renseigné que pour les détections d'arnaques (variable `detectedIntent`) — le LLM ne l'écrit pas lui-même.

---

## Ce qui marche bien

- **Zéro fallback-v1** sur toute la journée : la chaîne LLM (Groq → Mistral → Groq 8B) est parfaitement résiliente.
- **Flux éligibilité remboursement** : les conversations `8439cfb4` et `91545f33` montrent le Coach collectant les infos une à une (poids/taille → IMC → comorbidités → suivi nutritionnel) avant de donner un verdict clair.
- **Orientation carte des prix** : les convs `77414aa3`, `8d6a870f` et `0aa3e033` montrent le lien `/outils/carte-prix-pharmacies/` correctement fourni avec demande de ville.
- **Forte hausse du trafic** : +74% de messages par rapport à hier — signal positif post-lancement du remboursement (15 juin 2026).
- **Questions simples** : les convs à 2 messages (prix, ordonnance, remboursement de base) sont gérées proprement et rapidement.

---

## Problèmes détectés

### 🔴 CRITIQUE — Erreur de produit + réponse hors sujet

**Conv `b61784ba`** | 6 messages | Mounjaro diarrhée

- **Message user** : "effet secondaire" (premier message, sans préciser le médicament)
- **Réponse Coach** : *"Les effets secondaires les plus fréquents de **Saxenda** incluent les troubles digestifs..."* → Le Coach a choisi Saxenda sans que l'user l'ait mentionné. Aucun signal dans la conversation ne justifie Saxenda.
- **Ce qu'il aurait dû répondre** : Demander quel traitement (Ozempic, Wegovy, Mounjaro…) avant de répondre.

Puis :

- **Message user** : "mou jaro diahree" (Mounjaro, diarrhée) → **"Oui, conseils"**
- **Réponse Coach** : *"Avant de commencer un traitement GLP-1, il est essentiel de préparer votre historique médical complet..."* → Complètement hors sujet. L'user est **déjà sous Mounjaro** et demandait des conseils pratiques pour gérer la diarrhée.
- **Ce qu'il aurait dû répondre** : "Pour réduire la diarrhée sous Mounjaro : manger lentement, éviter les aliments gras/épicés, fractionner les repas, s'hydrater. Ça s'atténue en 2-4 semaines. Veux-tu une liste d'aliments à privilégier ?"

---

### 🔴 CRITIQUE — Violation du système prompt (primo-prescription)

**Conv `8439cfb4`** | 10 messages | Éligibilité, Compiègne

- **Message user** : "Ou dois-je aller pour avoir un prise en charge pour le wegony"
- **Réponse Coach** : *"tu devrais consulter un médecin spécialiste, comme un endocrinologue ou un nutritionniste, **ou ton médecin traitant**"*
- **Le système prompt dit explicitement** : *"⚠️ NE DIS JAMAIS que le médecin traitant peut INITIER la primo-prescription du remboursement obésité, ni 'faire le dossier' de primo-prescription"*
- **Ce qu'il aurait dû répondre** : "Pour ouvrir le remboursement à 65%, la primo-prescription doit être faite en Centre Spécialisé de l'Obésité (CSO) ou CHU — pas chez le médecin traitant. À Compiègne, le CHU de Compiègne-Noyon est l'option la plus proche. Veux-tu leurs coordonnées ?"

---

### 🟠 SÉRIEUX — Incohérence contextuelle (invente une action de l'user)

**Conv `0efd9a87`** | 10 messages | Stylo Ozempic 1.5ml → 3ml

- L'user demandait comment gérer la transition entre stylos. Après "Oui je veux bien", le Coach bascule vers des généralités sur "questions à poser au médecin".
- **Problème majeur** : sans prompt de l'user, le Coach répond soudainement *"Vous avez injecté 0,5 mg d'Ozempic ce matin avec le nouveau stylo 3ml"* — **information inventée** que l'user n'a pas fournie. Le Coach confond ce qu'il *suppose* avec ce que l'user a dit.
- L'user répond ensuite "J'ai injecté ce matin la dose 0.50 sur le stylo de 3ml" (confirmant l'action) mais le contexte est déjà perdu.
- **Alternance tutoiement/vouvoiement** dans la même réponse : "poser toutes **vos** questions" puis "Veux-**tu**".

---

### 🟠 SÉRIEUX — Reformulation interdite + réponse tronquée

**Conv `91545f33`** | 8 messages | Patient 1 an sous Mounjaro, 35kg perdus

- **Violation système prompt** : *"Tu as donc perdu 35 kg en 1 an avec Mounjaro, c'est incroyable!"* → reformule exactement ce que l'user vient de dire (interdit selon la règle 1 du prompt : "Ne reformule JAMAIS ce que la personne vient de dire").
- **Réponse tronquée** : la dernière réponse se termine par *"Veux-tu que je te prépare une **checklist** avec les documents à apporter à"* — coupée net. Limite de 220 tokens atteinte en plein milieu d'une phrase.

---

### 🟠 SÉRIEUX — Incompréhension répétée sur 5 échanges

**Conv `7f5c3302`** | 10 messages | Gélules reçues sans commande

- La situation est simple : l'user avait commandé des gélules GLP-1 il y a 3 mois (abonnement, probablement arnaque) et en reçoit maintenant sans les avoir recommandées.
- Le Coach pose 4 fois les mêmes questions ("Où les avez-vous achetées ?", "Avez-vous une ordonnance ?") sans comprendre que l'user dit "je n'ai RIEN commandé récemment".
- **Erreur de forme** : le Coach dit *"N'injectez pas ces produits"* pour des **gélules** — on n'injecte pas des gélules.
- La bonne réponse dès le 2e message aurait été : "Il s'agit peut-être d'un abonnement automatique déclenché par ta première commande. Contacte le vendeur pour annuler et signale sur signal.conso.gouv.fr si c'est une arnaque."

---

### 🟡 MINEUR — Terme médical approximatif

**Conv `7b5b520a`** | 4 messages | Arrêt du GLP-1

- Le Coach mentionne *"NOIAN"* pour l'effet visuel rare lié au sémaglutide. Le terme correct est **NAION** (Neuropathie Optique Ischémique Antérieure Non-artéritique). Risque de confusion pour un patient qui rechercherait l'information.

---

### 🟡 MINEUR — Répétition du même lien (x3)

**Conv `8d6a870f`** | 10 messages | Prix Wegovy, Angoulême

- Le lien vers la carte des prix est fourni 3 fois dans la même conversation, avec des formulations quasi identiques. Expérience redondante, l'user avait compris dès le premier envoi.

---

## Actions recommandées

### 1. Augmenter `max_tokens` (urgent)

**Fichier** : `supabase/functions/ai-coach/index.ts`, ligne 685

```diff
-              max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 220,
+              max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 350,
```

220 tokens est insuffisant pour les réponses structurées (checklist, étapes remboursement). Des réponses sont coupées en pleine phrase, ce qui nuit à la confiance. 350 reste conversationnel tout en évitant les troncatures.

---

### 2. Correction système prompt — effet secondaire sans médicament cité

Ajouter dans la section `SEGMENTS DE VISITEURS` ou `TON APPROCHE` :

```diff
+- Si quelqu'un dit "effet secondaire" sans préciser le médicament : demande TOUJOURS lequel (Ozempic, Wegovy, Mounjaro, Saxenda…) AVANT de répondre. Ne suppose jamais un médicament par défaut.
```

---

### 3. Correction système prompt — contexte patient existant

Ajouter dans la section `TON APPROCHE` :

```diff
+- Si le contexte montre que l'utilisateur est DÉJÀ sous traitement (il le mentionne, ou l'historique de la conversation le confirme), ne lui donne JAMAIS des conseils pour "démarrer" un traitement. Réponds dans le contexte du traitement en cours.
```

---

### 4. Renforcement de la règle primo-prescription

La règle existe déjà mais n'est pas respectée (conv `8439cfb4`). La reformuler plus directement :

```diff
- ⚠️ NE DIS JAMAIS que le médecin traitant peut INITIER la primo-prescription du remboursement obésité...
+ ⚠️ RÈGLE ABSOLUE : Pour le remboursement obésité 65%, la primo-prescription se fait UNIQUEMENT en CSO (Centre Spécialisé de l'Obésité) ou CHU. Quand on te demande "où aller pour le remboursement", réponds TOUJOURS "CSO ou CHU" en premier, puis précise que le généraliste peut renouveler ensuite. Ne mentionne JAMAIS le médecin traitant comme point d'entrée pour la primo-prescription obésité.
```

---

### 5. Correction terme médical NOIAN → NAION

Dans le system prompt, section `CONTEXTE IMPORTANT`, ajouter :

```diff
+- L'effet visuel rare lié au sémaglutide s'appelle **NAION** (Neuropathie Optique Ischémique Antérieure Non-artéritique), PAS "NOIAN". Utilise toujours "NAION" et précise que c'est très rare.
```

---

### 6. Idées d'articles basées sur les questions sans bonne réponse

Ces sujets sont revenus dans les conversations mais le RAG n'a pas fourni de contexte pertinent :

| Sujet | Conversation | Priorité |
|---|---|---|
| Gérer la diarrhée sous Mounjaro (conseils pratiques) | `b61784ba` | Haute |
| Différence stylos Ozempic 1.5ml vs 3ml (nombre de doses, utilisation) | `0efd9a87` | Haute |
| Comment annuler un abonnement à des compléments GLP-1 suspects | `7f5c3302` | Moyenne |
| Arrêt du GLP-1 : protocole progressif et suivi | `7b5b520a` | Moyenne |

---

## Conversations marquantes

### Top 3 (engagement + qualité)

#### 1. `8439cfb4` — Éligibilité + Compiègne (15m28s, 10 messages)
Patient IMC 42.1 (132kg/1.77m) qui vérifie son éligibilité au remboursement. Le Coach collecte les infos une à une, calcule l'IMC en direct, confirme l'éligibilité et oriente vers un CSO/CHU à Compiègne. Longue durée = fort engagement. Le seul défaut : "ou ton médecin traitant" dans la primo-prescription (voir problème critique ci-dessus).

#### 2. `91545f33` — Patient Mounjaro 1 an, 35kg perdus (2m28s, 8 messages)
Patient déjà en traitement, fort résultat (-35kg). Le Coach gère bien le contexte, confirme l'éligibilité (IMC 45.3), donne les étapes concrètes pour le remboursement. Dommage que la dernière réponse soit tronquée et que le Coach viole la règle anti-reformulation au démarrage.

#### 3. `e6a03633` — Réduire la facture Mounjaro 10mg (42s, 4 messages)
Patient passé de 85kg à 70kg, cherche à alléger ses dépenses. Le Coach comprend vite et propose 3 options pertinentes (remboursement obésité, ordonnance 3 mois, mutuelle). Réponse claire et actionnable.

---

### Pires 3 (à corriger en priorité)

#### 1. `b61784ba` — Effets secondaires Mounjaro (34s, 6 messages)
Erreur produit (Saxenda mentionné spontanément), puis réponse hors sujet pour "démarrer un traitement" alors que l'user demandait comment gérer la diarrhée en cours. Deux bugs majeurs en 6 messages.

#### 2. `0efd9a87` — Stylo Ozempic 1.5ml → 3ml (2m12s, 10 messages)
10 échanges pour une question simple sur la différence entre deux stylos. Le Coach invente une action de l'user ("vous avez injecté ce matin"), alterne vouvoiement/tutoiement, et ne donne jamais de conseils pratiques concrets sur la gestion du changement de stylo.

#### 3. `7f5c3302` — Gélules reçues sans commande (4m6s, 10 messages)
5 échanges pour comprendre une situation claire (probable abonnement automatique). Le Coach pose 4 fois les mêmes questions, dit "n'injectez pas" pour des gélules, et ne propose pas la solution évidente (annuler l'abonnement + signal.conso.gouv.fr).
