# Rapport quotidien Coach IA — 2026-06-08

**Période couverte** : 2026-06-07 17h00 → 2026-06-08 09h00 UTC  
**Généré le** : 2026-06-08

---

## KPIs

| Métrique | Valeur | vs Veille |
|---|---|---|
| Messages totaux | 30 | 52 → 30 ↓ −42 % |
| Conversations | 5 | — |
| Messages user | 15 | — |
| Messages assistant | 15 | — |
| Msgs / conversation | 6,0 | — |
| Durée moyenne conv. (hors 0s) | ~74 s | — |
| Taux LLM (llama-3.3-70b) | 93,3 % (14/15) | — |
| Taux fallback-v1 | 6,7 % (1/15) | — |

**Breakdown par intent** : 14 messages assistant sans intent renseigné (null), 1 fallback "general".

> ⚠️ Volume en forte baisse : −42 % vs veille (52 → 30 messages). À surveiller sur les prochains jours pour distinguer variation normale d'une tendance.

---

## Ce qui marche bien

- **Flux éligibilité remboursement bien déclenché** : les 3 conversations qui abordent le remboursement (`9fc6a4f0`, `ac555b17`, `1a33d47e`) déclenchent toutes spontanément le mini-flow "vérifions en 2-3 questions". La proposition est naturelle et le taux d'acceptation est de 100 % (3/3 users ont répondu "Oui, vérifions").
- **Calcul IMC correct** (9fc6a4f0) : le Coach a bien calculé 90 / (1,57)² = 36,5 et utilisé la valeur numérique pour qualifier l'éligibilité.
- **Réponse effets secondaires pertinente** (56798666) : conseils pratiques précis (injection le soir, petits repas, hydratation), sans minimiser ni alarmer.
- **Taux LLM élevé** : 93,3 % des réponses via Groq/Llama, le fallback ne se déclenche qu'en cas d'erreur API, pas en mode dégradé permanent.
- **Orientation médecin correcte** : aucun renvoi vers un prestataire commercial, toujours `annuaire-sante.ameli.fr`.

---

## Problèmes détectés

### 🔴 Problème 1 — Erreur médicale sur l'éligibilité au remboursement (critique)

**Conversation** : `9fc6a4f0-c521-428a-8cbe-2b0267f582ed`  
**Message user** : `"1m57 et 90kils"` (après calcul d'IMC demandé)  
**Ce que le Coach a répondu** :  
> "Avec un IMC de 36,5, vous êtes éligible au remboursement du traitement GLP-1 **sans nécessité de comorbidité**, car votre IMC est supérieur à 35."

**Ce qu'il AURAIT DÛ répondre** :  
> "Ton IMC est de 36,5. Bonne nouvelle, tu es dans la zone d'éligibilité (IMC ≥ 35). Il reste une condition : as-tu une comorbidité liée au poids (diabète T2, hypertension, apnée du sommeil...) ? C'est nécessaire pour IMC entre 35 et 40."

**Explication** : La règle officielle est IMC ≥ 35 **avec au moins une comorbidité** OR IMC ≥ 40 **sans comorbidité**. Le Coach a appliqué un raccourci erroné ("IMC > 35 = éligible sans comorbidité") alors qu'il avait correctement énoncé la règle au tour précédent. Cet utilisateur a peut-être été induit en erreur sur son éligibilité réelle.

---

### 🔴 Problème 2 — Fallback v1 déclenché au milieu d'un flux LLM actif

**Conversation** : `ac555b17-e173-4aaf-a018-a4d1b13dddb5`  
**Message user** : `"Oui, j'ai des comorbidités"` (4e échange, en plein flow d'éligibilité)  
**Ce que le Coach a répondu** (fallback-v1, intent=general) :  
> "Je n'ai pas pu traiter votre question en détail pour le moment. Pouvez-vous la reformuler ou préciser votre situation ?"

**Ce qu'il AURAIT DÛ répondre** :  
> "Parfait. Et quel est votre IMC ? (Si vous ne le connaissez pas, donnez-moi votre poids et votre taille, je calcule.)"

**Explication** : Le message "Oui, j'ai des comorbidités" est arrivé avec `intent=general` stocké sur le message user, ce qui suggère une erreur côté Groq API (timeout ou rate-limit) au moment de ce message précis. Le fallback-v1 classifie "général" tout ce qu'il ne reconnaît pas, et renvoie une réponse d'erreur générique qui casse complètement le flux. La conversation s'est arrêtée ici.

---

### 🟠 Problème 3 — Relance hors contexte (remboursement après plainte d'effets secondaires)

**Conversation** : `56798666-d689-4757-b0ef-9aaca1449d2e`  
**Message user** : Long message décrivant diarrhées intenses et vomissements après passage Mounjaro 2,5 → 5 mg  
**Relance du Coach** : `"Veux-tu que je vérifie si tu as droit au remboursement à 65% ?"`  
**Ce qu'il AURAIT DÛ proposer** :  
> "Ces effets s'atténuent généralement en 2 à 4 semaines. Si ça persiste au-delà de 48h ou si tu ne peux pas t'alimenter, dis-le à ton médecin. Veux-tu des conseils pour mieux gérer les jours qui suivent l'injection ?"

**Explication** : La personne décrit de la souffrance physique. Proposer un check de remboursement à ce moment est empathiquement inapproprié et va à l'encontre de la règle du system prompt ("UNE relance utile qui fait avancer la personne"). La relance correcte ici est un suivi sur ses symptômes ou des conseils pratiques.

---

### 🟡 Problème 4 — Réponses répétitives sans progression

**Conversation** : `d994d150-5cbc-4194-bb6d-5756153507a5`  
**Message user** : `"Non, je cherche un médecin"` (2e échange)  
**Ce que le Coach a répondu** : Copie quasi-identique de sa réponse précédente sur médecin traitant / annuaire-sante.ameli.fr / CSO  
**Ce qu'il AURAIT DÛ faire** :  
> Demander directement "Dans quelle ville es-tu ?" pour cibler l'annuaire, ou proposer d'aller directement sur la carte.

**Explication** : Le Coach ignore le feedback implicite de l'utilisateur ("je veux un médecin, pas un check d'éligibilité") et répète la même réponse. Le system prompt dit explicitement "Si la personne enchaîne, GUIDE-la pas à pas avec des mini-questions courtes — une à la fois".

---

### 🟡 Problème 5 — Question non répondue (mentions sur l'ordonnance)

**Conversation** : `9fc6a4f0-c521-428a-8cbe-2b0267f582ed`  
**Message user** : `"Quelles mentions doivent figurer sur l'ordonnance ?"`  
**Ce que le Coach a répondu** : Parle de la validité de l'ordonnance (3 mois), puis oriente vers un médecin — ne liste JAMAIS les mentions demandées.  
**Ce qu'il AURAIT DÛ répondre** :  
> "Sur l'ordonnance pour un GLP-1, le médecin doit indiquer : le nom du médicament + dosage, la posologie (dose hebdomadaire + paliers de montée), la durée (en général 3 mois), et — pour le remboursement obésité — la mention du diagnostic (obésité, IMC) et du parcours de soins. Veux-tu qu'on vérifie si tu es éligible au remboursement ?"

---

### 🟡 Problème 6 — Intent tracking non fonctionnel (14/15 null)

Les champs `intent` sont `null` sur 93 % des messages assistant. Le champ `detectedIntent` dans le code est uniquement renseigné en cas de signaux d'arnaque (`scam:high/low`). Pour les questions classiques (remboursement, effets secondaires, prescription), l'intent reste null. Cela rend le dashboard editorial aveugle aux tendances de sujets.

---

## Actions recommandées

### Action 1 — Corriger la règle IMC dans le system prompt (priorité critique)

**Fichier** : `supabase/functions/ai-coach/index.ts`, section `CONTEXTE IMPORTANT`

```diff
- - REMBOURSEMENT (FAIT OFFICIEL, PRIORITAIRE) : Wegovy ET Mounjaro sont remboursés à 65% par l'Assurance Maladie pour l'obésité à partir du 15 juin 2026 (arrêté du 23 mai 2026, publié au JO le 28 mai), sous conditions (IMC ≥ 35 avec comorbidité ou IMC ≥ 40, après échec d'une prise en charge nutritionnelle, primo-prescription en CSO/CHU, renouvellement possible par le généraliste).
+ - REMBOURSEMENT (FAIT OFFICIEL, PRIORITAIRE) : Wegovy ET Mounjaro sont remboursés à 65% par l'Assurance Maladie pour l'obésité à partir du 15 juin 2026 (arrêté du 23 mai 2026, publié au JO le 28 mai), sous conditions : (A) IMC ≥ 35 kg/m² AVEC au moins une comorbidité liée au poids (diabète T2, HTA, apnée du sommeil, etc.) OU (B) IMC ≥ 40 kg/m² SANS comorbidité obligatoire. ⚠️ RÈGLE ABSOLUE : un IMC compris entre 35 et 40 NÉCESSITE une comorbidité — ne jamais dire "éligible sans comorbidité" pour un IMC < 40. Après échec d'une prise en charge nutritionnelle, primo-prescription en CSO/CHU, renouvellement possible par le généraliste.
```

---

### Action 2 — Améliorer la relance contextuelle pour les effets secondaires

**Fichier** : `supabase/functions/ai-coach/index.ts`, section `TON APPROCHE`

Ajouter après la règle sur les relances :

```diff
+ - Si l'utilisateur décrit des effets secondaires, des douleurs ou une préoccupation médicale ACTIVE, la relance doit porter sur ses symptômes ou ses prochaines étapes médicales. Ne propose JAMAIS le check de remboursement dans ce contexte.
```

---

### Action 3 — Éviter les réponses répétitives

Dans le system prompt, ajouter dans `RÈGLES ABSOLUES` :

```diff
+ 14. Si une information a déjà été donnée dans ce fil de conversation, ne la répète pas. Avance vers la prochaine étape : demande la ville, calcule l'IMC, propose le flux éligibilité. Chaque réponse doit faire progresser la conversation.
```

---

### Action 4 — Corriger le fallback sur réponses courtes de suivi

**Problème technique** : Quand le LLM échoue (timeout Groq), le fallback `classifyAndRespond` est appelé. Sur un message court comme "Oui, j'ai des comorbidités", il matche le pattern `general` et renvoie le message d'erreur générique.

**Fix suggéré** dans `classifyAndRespond` — détecter les réponses courtes en contexte de flow :

```typescript
// Ajouter avant la boucle INTENT_PATTERNS dans classifyAndRespond :
// Si message très court (< 30 chars) et semble être une réponse de flow,
// renvoyer un message plus adapté
if (message.trim().length < 30) {
  return {
    intent: 'followup',
    response: "Je rencontre une difficulté technique momentanée. Pouvez-vous répéter votre dernière réponse ? Je reprends là où on en était."
  };
}
```

---

### Action 5 — Ajouter l'intent tracking pour les sujets principaux

Modifier la ligne `detectedIntent` dans la section `saveMessages` pour tracer les intents LLM courants :

```typescript
// Après la réponse Groq, détecter l'intent à partir du message user :
const detectedIntent = scamSignals.isScamRelated 
  ? `scam:${scamSignals.severity}` 
  : detectBasicIntent(cleanMessage);  // nouvelle fonction

// Ajouter la fonction :
function detectBasicIntent(msg: string): string | null {
  if (/rembours|prise en charge|65%/i.test(msg)) return 'reimbursement';
  if (/ordonnance|prescri|médecin|consulter/i.test(msg)) return 'prescription';
  if (/effet|secondaire|nausée|vomis|douleur/i.test(msg)) return 'side_effects';
  if (/prix|coût|combien|tarif/i.test(msg)) return 'price';
  if (/éligible|éligibilité|IMC|conditions/i.test(msg)) return 'eligibility';
  return null;
}
```

---

### Suggestion d'article basée sur les questions sans bonne réponse

| Question détectée | Article suggéré |
|---|---|
| "Quelles mentions doivent figurer sur l'ordonnance ?" | `/collections/traitements-glp1/ordonnance-glp1-mentions-obligatoires/` — Guide pratique des mentions requises sur une ordonnance GLP-1 (dosage, diagnostic, CSO, validité) |
| "Je cherche une prescription en ligne" | `/collections/traitements-glp1/teleconsultation-glp1-comment-obtenir-prescription/` — Téléconsultation et GLP-1 : est-ce possible et comment ça marche ? |

---

## Conversations marquantes

### Les 3 meilleures

**1. `9fc6a4f0` — Flow éligibilité complet (10 messages, 1m35s)**  
La plus longue et la plus productive. L'utilisateur commence par une question sur l'ordonnance, accepte le check d'éligibilité, donne son IMC calculé, et finit par dire qu'il a déjà un médecin. Le Coach a bien guidé le parcours, calculé l'IMC correctement, proposé une checklist de consultation. Dommage pour l'erreur sur les comorbidités au milieu.

**2. `56798666` — Question médicale réelle (4 messages, 1m01s)**  
Utilisateur sous traitement actif (Mounjaro), décrit ses effets secondaires précisément. Réponse du Coach factuelle et utile sur la gestion des GI effects. C'est exactement le type de valeur que le Coach doit apporter — un vrai soutien pendant le traitement.

**3. `d994d150` — Parcours prescription (6 messages, 1m08s)**  
L'utilisateur cherche une ordonnance, puis spécifiquement un médecin, puis une prescription en ligne. Le Coach reste cohérent et indépendant (pas de référence commerciale) sur 3 échanges successifs, même si les réponses manquent de progression.

### Les 3 pires

**1. `ac555b17` — Fallback cassant (8 messages, 1m10s)**  
Conversation prometteuse (éligibilité Wegovy) qui s'effondre au 4e échange quand le LLM échoue et que le fallback répond "Je n'ai pas pu traiter votre question". L'utilisateur a probablement quitté le site sur cette note.

**2. `56798666` — Relance remboursement hors contexte**  
La réponse sur les effets secondaires est bonne, mais la relance "Veux-tu que je vérifie si tu as droit au remboursement ?" après une description de souffrance physique est la pire relance possible. Ternit une bonne réponse technique.

**3. `1a33d47e` — Conversation abandonnée (2 messages, 0s)**  
Seul échange : l'utilisateur pose une question sur l'éligibilité, reçoit une réponse qui demande son IMC et ses comorbidités, puis ne répond plus. Soit le format de la réponse (2 questions d'un coup) a découragé, soit décrochage technique.

---

## Synthèse

Le Coach fonctionne bien techniquement (93 % LLM, flow éligibilité bien déclenché, bonne maîtrise des règles de non-prescription). Les problèmes principaux sont :
1. Une **erreur médicale critique** sur la règle IMC 35-40 + comorbidité (à corriger en urgence dans le system prompt)
2. Un **fallback mal géré** sur les messages courts en milieu de flux (correctif simple en code)
3. Des **relances parfois inadaptées au contexte émotionnel** (règle à ajouter au system prompt)

Le volume en baisse (−42 %) mérite surveillance mais n'est pas alarmant sur un seul jour.
