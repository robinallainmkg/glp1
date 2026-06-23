# Rapport Coach IA — 23 juin 2026

**Généré le** : 2026-06-23 | **Période analysée** : 24h (22 juin 12h → 23 juin 12h UTC)

---

## KPIs

| Métrique | Aujourd'hui | Hier | Évolution |
|---|---|---|---|
| Messages totaux | 58 | 24 | **↑ +141%** |
| Conversations | 12 | — | — |
| Messages utilisateurs | 29 | — | — |
| Messages assistants | 29 | — | — |
| Messages / conversation (moy.) | 4,8 | — | — |
| Durée moy. conversations actives | ~2:30 min | — | — |

### LLM vs Fallback

| Modèle | Réponses | % |
|---|---|---|
| llama-3.3-70b-versatile (Groq) | 26 | 89,7% |
| mistral-small-latest | 3 | 10,3% |
| fallback-v1 | 0 | 0% |

**→ 100% LLM** — aucun fallback déclenché. La chaîne de résilience fonctionne bien.

### Intent tracking

**⚠️ 100% des intents sont NULL** — le champ `intent` n'est jamais renseigné dans les 24 dernières heures. Seul le champ `model` est populé. À investiguer côté edge function (le `detectedIntent` ne semble pas être persisté).

### Engagement par conversation

| Conversation | Messages | Durée |
|---|---|---|
| f1a7e484 | 10 | 4:28 |
| 0bbe9a72 | 10 | 3:25 |
| 5559f33d | 10 | 2:19 |
| ac64c9c4 | 6 | 4:10 |
| bed30ab9 | 6 | 0:46 |
| a835269e | 4 | 0:47 |
| 6 × autres | 2 chacune | 0:00 |

---

## Ce qui marche bien

1. **La phrase d'accroche "Vérifions ensemble !"** (conv `bed30ab9`, `5559f33d`) est engageante et conforme au système prompt — les utilisateurs y répondent et restent dans la conversation.
2. **Calcul IMC correct** (conv `bed30ab9`) : l'utilisateur donne 1m93/125kg, le coach calcule IMC 34,6 correctement.
3. **Information remboursement 15 juin 2026** systématiquement mentionnée et correcte dans toutes les conversations concernées.
4. **Redirection carte des prix** (conv `a3dceb0c`, `ac64c9c4`) : le coach envoie vers `/outils/carte-prix-pharmacies/` pour les requêtes locales, conformément aux règles.
5. **Réponse la plus concise et précise** (conv `f16ad883`) : "Avec le remboursement à 65%, ton reste à charge est de 35%... soit environ 80 à 154€/mois sans mutuelle" — exactement dans les clous (calcul correct de 35% de 230-434€).
6. **Taux de conversations longues élevé** : 3 conversations à 10 messages = signal fort d'utilité perçue.

---

## Problèmes détectés

### 🔴 CRITIQUE — Faux verdict d'éligibilité (IMC < 35)

**Conversation** : `5559f33d` | **Timestamp** : 2026-06-22 13:52

**Message utilisateur** : "30 ou plus" (en réponse à "quel est ton IMC ?")

**Réponse du Coach** :
> "Avec un IMC de 30 ou plus, tu es éligible au remboursement de Wegovy pour l'obésité, sous conditions. Le remboursement à 65% s'applique pour les personnes ayant un IMC ≥ 35 avec comorbidité ou ≥ 40. Veux-tu vérifier si tu as droit au remboursement à 65% ?"

**Ce qu'il AURAIT DÛ répondre** (selon les règles strictes du system prompt) :
> "Ton IMC est en dessous de 30 ou aux alentours... Le remboursement cible l'obésité (IMC ≥ 35 avec comorbidité ou ≥ 40). Ton IMC est en dessous des seuils actuels. Parles-en à ton médecin pour d'autres options."

**Analyse** : La réponse est auto-contradictoire — elle dit "tu es éligible" puis rappelle les conditions qui ne sont pas remplies (IMC ≥ 35). Le system prompt dit explicitement : **"Ne dis JAMAIS 'tu es éligible' pour un IMC < 35. C'est une ERREUR GRAVE qui crée de faux espoirs."** Violation directe.

---

### 🔴 CRITIQUE — Faux verdict d'éligibilité (IMC 34,6 avec comorbidités)

**Conversation** : `bed30ab9` | **Timestamp** : 2026-06-22 10:47

**Messages utilisateur** :
1. "1m93 pour 125kg" → Coach calcule IMC 34,6 ✓
2. "oui, j'ai de l'hypertension + apnée sommeil"

**Réponse du Coach** :
> "Avec un IMC de 34,6 et des comorbidités comme l'hypertension et l'apnée du sommeil, tu es **probablement éligible** au remboursement à 65%."

**Ce qu'il AURAIT DÛ répondre** :
> "Ton IMC est de 34,6, juste en dessous du seuil de 35. Le remboursement nécessite un IMC ≥ 35 avec comorbidité ou ≥ 40. Même avec hypertension et apnée du sommeil, tu n'atteins pas encore le seuil. Consulte un médecin en CSO/CHU — il évaluera ta situation complète, et parfois d'autres options existent."

**Analyse** : IMC 34,6 + comorbidités = seuil 30-34.9 avec comorbidités → système prompt clair : "Pas encore éligible au remboursement (il faut IMC ≥ 35 avec comorbidité)". Le mot "probablement" ne suffit pas à neutraliser le faux espoir créé.

---

### 🟠 IMPORTANT — Confusion nom de famille / ville

**Conversation** : `0bbe9a72` | **Timestamp** : 2026-06-22 17:22

**Message utilisateur** : "MERCI  CORDIALEMENT C VIALE" (signature de l'utilisateur, "C VIALE" = initiale prénom + nom de famille)

**Réponse du Coach (Mistral)** :
> "Merci pour **ta ville, Viale** ! Le remboursement à 65% pour Mounjaro est possible depuis le 15 juin 2026..."

**Ce qu'il AURAIT DÛ faire** : Identifier que "C VIALE" est une signature, pas une ville. Demander la ville : "D'accord ! Pour vous aider à trouver un médecin, dans quelle ville habitez-vous ?"

**Analyse** : L'utilisateur écrit en majuscules avec une signature formelle (probable personne âgée). Le modèle Mistral a confondu le nom de famille avec une ville. Heureusement l'utilisateur a continué et donné "TOULON" ensuite, mais l'expérience est mauvaise.

---

### 🟠 IMPORTANT — Erreur factuelle : lettre d'adressage CSO

**Conversation** : `f1a7e484` | **Timestamp** : 2026-06-22 13:30

**Message utilisateur** : "dois je avoir une lettre d'adressage de mon medecin"

**Réponse du Coach** :
> "Non, une lettre d'adressage de ton médecin n'est pas nécessaire pour obtenir un rendez-vous dans un centre spécialisé de l'obésité (CSO) ou un CHU."

**Ce qu'il AURAIT DÛ répondre** :
> "En pratique, beaucoup de CSO demandent un courrier de ton médecin traitant pour fixer un rendez-vous — c'est conseillé même si ce n'est pas obligatoire partout. Ton généraliste peut te le faire facilement. Ça accélère aussi la prise en charge."

**Analyse** : La plupart des CSO recommandent ou exigent une lettre d'adressage du médecin traitant. Répondre "non, pas nécessaire" de façon catégorique est factuellement risqué et pourrait mener l'utilisateur à se présenter sans dossier préparé.

---

### 🟠 IMPORTANT — Coach promet une liste de CSO mais ne la fournit pas

**Conversation** : `f1a7e484` | **Timestamp** : 2026-06-22 13:28

**Message utilisateur** : "oui  code postal 59790"

**Réponse du Coach** :
> "Je peux te donner accès à la liste des centres qui proposent le traitement Mounjaro. Veux-tu que je te donne le lien pour trouver les centres près de chez toi ?"

**Problème** : Le coach promet une liste et pose encore une question alors qu'il DEVRAIT simplement donner le lien directement. L'utilisateur a déjà donné son code postal. Il y a eu une relance inutile, et le coach ne propose jamais de lien concret (ni `/outils/` ni annuaire-sante.ameli.fr ciblé pour le 59).

---

### 🟡 MINEUR — Mention de l'Espagne hors contexte

**Conversation** : `0945ebf0` | **Timestamp** : 2026-06-22 18:53

**Message utilisateur** : "Est ce que cette pharmacie vend mounjaro" (référence à "cette" pharmacie — probablement une pharmacie en ligne suspecte)

**Réponse du Coach** :
> "Oui, certaines pharmacies en ligne dans l'UE vendent Mounjaro, mais il faut une ordonnance valide d'un médecin. **Veux-tu que je te donne les étapes pour acheter Mounjaro légalement en Espagne ?**"

**Problème** : Aucun élément dans la conversation ne suggère que l'utilisateur est en Espagne ou veut acheter en Espagne. Le coach devait d'abord poser 2-3 questions (quel site ? avec ordonnance ? produit reçu ?) avant de valider l'achat en ligne.

---

### 🟡 MINEUR — Incohérence tutoiement/vouvoiement

**Conversation** : `0bbe9a72`

L'utilisateur écrit en capitales avec une signature formelle ("C VIALE"), signalant un profil senior qui vouvoie. Le coach alterne entre "tu" et "vous" dans la même conversation selon les messages (certains coaches tutoient, d'autres vouvoient). Le système prompt précise : "Tutoiement si l'utilisateur tutoie, vouvoiement sinon."

---

## Actions recommandées

### 1. CORRECTIF URGENT — Renforcer les règles IMC dans le system prompt

Le guard "Ne dis JAMAIS éligible pour IMC < 35" existe dans le prompt mais est violé. Il faut l'amplifier avec des exemples négatifs explicites **en début de section**.

**Diff suggéré** dans `SYSTEM_PROMPT` (section `FLUX "SUIS-JE ÉLIGIBLE"`), remplacer :

```
- Ne dis JAMAIS "tu es éligible" pour un IMC < 35. C'est une ERREUR GRAVE qui crée de faux espoirs.
```

par :

```
- ⛔ RÈGLE ABSOLUE : Ne dis JAMAIS "tu es éligible" (ni "probablement éligible", ni "sous conditions") pour un IMC < 35. IMC 34.9 + hypertension = NON ÉLIGIBLE. IMC 30 = NON ÉLIGIBLE. C'est une ERREUR GRAVE qui crée de faux espoirs médicaux et juridiques.
- EXEMPLE CORRECT pour IMC 34.6 + comorbidités : "Ton IMC est de 34,6, juste sous le seuil de 35. Même avec des comorbidités, tu n'es pas encore éligible au remboursement — il faut IMC ≥ 35. Parles-en à ton médecin, qui pourra évaluer d'autres options en CSO/CHU."
```

### 2. CORRECTIF — Lettre d'adressage CSO

Ajouter dans la section `ORIENTATION MÉDICALE` du system prompt :

```
- LETTRE D'ADRESSAGE : Bien que non obligatoire légalement, la plupart des CSO/CHU la demandent en pratique. Conseiller TOUJOURS de demander une lettre d'adressage au médecin traitant avant de prendre RDV au CSO — c'est une bonne pratique qui facilite la prise en charge.
```

### 3. CORRECTIF — Ne jamais promettre de liste sans la donner

Ajouter dans les règles de local queries :

```
- Pour les CSO/CHU proches : ne demande JAMAIS "veux-tu que je te donne le lien ?" si l'utilisateur a déjà donné sa ville/CP. Donne directement le lien annuaire-sante.ameli.fr et précise de chercher "centre spécialisé de l'obésité" dans leur département.
```

### 4. CORRECTIF — Détection signature vs ville

Le modèle confond les signatures ("C VIALE") avec des villes. Ajouter dans le system prompt :

```
- Quand un utilisateur signe son message ("Cordialement X", "Merci, Y"), c'est une formule de politesse : X ou Y est son prénom ou nom, PAS une ville. Si tu as besoin de la ville, re-demande-la explicitement.
```

### 5. TRACKING — Intent non renseigné

Le champ `intent` est null pour tous les messages (côté edge function, le `detectedIntent` ne semble pas atteindre `saveMessages` dans le chemin LLM — seul le path fallback le remplit). Vérifier ligne 771 dans `index.ts` : `const detectedIntent = scamSignals.isScamRelated ? \`scam:${scamSignals.severity}\` : null;` — pour les messages normaux l'intent reste null. Envisager d'extraire l'intent depuis le LLM ou le classifier côté serveur.

### 6. Nouveaux articles suggérés (questions sans réponse parfaite)

| Question récurrente | Article suggéré |
|---|---|
| "Mon médecin ne m'a pas donné le document pour le remboursement" | "Que faire si votre médecin ne fait pas la primo-prescription pour le remboursement Mounjaro/Wegovy ?" |
| "Délais d'attente en CSO" | "CSO et CHU : comment réduire les délais d'attente en 2026 (Wegovy, Mounjaro)" |
| "Lettre d'adressage pour CSO" | FAQ pratique "Rendez-vous CSO : quel dossier préparer ?" |
| "Pharmacies en ligne UE" | "Acheter du Mounjaro ou Wegovy en ligne : quels risques ?" (guide anti-arnaque nuancé) |

---

## Conversations marquantes

### ✅ Top 3 (qualité + engagement)

**1. `f1a7e484` — 10 messages, 4:28** *(meilleure conversation globale)*
Utilisateur avec IMC 47 + comorbidités, déjà éligible, cherche un CSO. Engagement maximal, questions précises et concrètes (code postal 59790, lettre d'adressage). Le coach a bien guidé sur la primo-prescription CSO/CHU. Seul bémol : la promesse de liste sans livraison, et l'erreur sur la lettre d'adressage.

**2. `bed30ab9` — 6 messages, 0:46** *(flux éligibilité rapide)*
Très bon exemple de flux "Vérifions ensemble !". L'utilisateur donne poids/taille en 46 secondes, le coach calcule l'IMC, demande les comorbidités. Enchaînement fluide. Dommage que la conclusion soit erronée (IMC 34.6 "probablement éligible").

**3. `f16ad883` — 2 messages** *(réponse prix parfaite)*
Question directe sur le coût avec remboursement → réponse Mistral exemplaire : calcul correct, précise le reste à charge (80-154€/mois), mentionne la mutuelle pour aller à 0€. Exactement dans les clous du system prompt.

---

### ❌ Top 3 (à corriger en priorité)

**1. `5559f33d` — 10 messages, 2:19** *(erreur critique éligibilité)*
L'utilisateur a reposé 3 fois la même question sur l'éligibilité Wegovy. Le coach a demandé l'IMC correctement mais a ensuite validé un IMC 30 comme "éligible" — erreur grave, fausse espoir. La conversation longue masque un problème de fond : les re-demandes répétées suggèrent que l'utilisateur ne comprenait pas les réponses.

**2. `0bbe9a72` — 10 messages, 3:25** *(confusion nom/ville + vouvoiement)*
Utilisateur senior (majuscules, signature "C VIALE"), frustré par le problème de remboursement Mounjaro. Le coach confond son nom avec une ville (Viale → "merci pour ta ville !"). Malgré tout l'utilisateur a persisté et donné Toulon — la résilience de l'utilisateur a sauvé la conversation.

**3. `f1a7e484` — 10 messages, 4:28** *(erreur factuell lettre d'adressage + promesse non tenue)*
Paradoxalement la meilleure et la pire conversation : la plus longue, la plus engagée, mais avec une erreur factuelle potentiellement problématique (lettre d'adressage CSO) et une promesse de liste CSO jamais tenue.

---

*Rapport généré automatiquement par l'agent de monitoring Coach IA — GLP-1 France.*
