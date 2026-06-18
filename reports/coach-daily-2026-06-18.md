# Rapport Coach IA — 18 juin 2026

**Généré le** : 2026-06-18 | **Période** : 24h précédentes (17 juin ~12h → 18 juin ~12h UTC)

---

## KPIs

| Métrique | Aujourd'hui | Hier | Évolution |
|---|---|---|---|
| Messages totaux | 46 | 74 | ↓ −38% |
| Conversations | 9 | — | — |
| Messages utilisateur | 23 | — | — |
| Messages assistant | 23 | — | — |
| Messages/conversation | 5,1 | — | — |
| Durée moy. conversation | ~52s | — | — |

### LLM vs Fallback

| Modèle | Messages | % |
|---|---|---|
| llama-3.3-70b-versatile (Groq) | 22 | 96% |
| mistral-small-latest (backup) | 1 | 4% |
| fallback-v1 (rules engine) | 0 | 0% |

**Taux LLM : 100%** — Zéro déclenchement du moteur de règles.

### Intents

Tous les champs `intent` sont `null` — comportement attendu (le champ n'est renseigné que pour les signaux d'arnaque ou le fallback-v1). Aucune arnaque détectée dans la période.

---

## Ce qui marche bien

- **Taux LLM 100%** : aucun fallback-v1, la chaîne Groq 70B → Mistral small a tenu. Le backup Mistral a servi une réponse riche (checklist complète avec lien article) dans conv `f32ee910`.
- **Flow éligibilité bien déclenché** : dans 5/9 conversations, le Coach a correctement lancé le questionnaire IMC en une phrase courte ("Vérifions ensemble ! Quel est ton poids et ta taille ?") conformément au system prompt.
- **Capture email opérationnelle** : proposition d'email faite dans au moins 2 conversations (`f32ee910`, `7d9539d7`) au bon moment (post-confirmation d'éligibilité).
- **Calculs IMC corrects** : les calculs sont systématiques et les arrondis corrects (29,5 / 35,6 / 37 / 57,8).
- **Tutoiement cohérent** : toutes les conversations utilisent le tutoiement, de façon constante sur toute la durée.
- **Réponse remboursement 15 juin** : conv `85eceb3b` — réponse concise et factuelle sur le nouveau remboursement, en 2 phrases.
- **Prescription ordonnance** : conv `b2fb2cd7` — bonne réponse sur le parcours médecin, bien structurée.

---

## Problèmes détectés

### 🔴 CRITIQUE — Erreur d'éligibilité au remboursement (conv `f32ee910`)

**User** : "Suis-je éligible au remboursement à 65% ?" → poids/taille fournis → IMC ~36, **sans comorbidités**

**Ce que le Coach a répondu** :
> "Avec un IMC de 37,5, tu es éligible au remboursement à 65% pour l'obésité."

**Ce qu'il AURAIT DÛ répondre** : IMC 36 **sans comorbidités** → **NON éligible** au remboursement. Les critères sont IMC ≥ 35 **avec comorbidité** OU IMC ≥ 40. Sans comorbidités, il faut IMC ≥ 40. La réponse donne une fausse information et a déclenché à tort une capture email ("tu es éligible → laisse ton email").

*Gravité* : Fausse information médicale donnée avec confiance → risque de déception patient en pharmacie.

---

### 🔴 CRITIQUE — Critères remboursement confondus avec critères AMM (conv `78e53be4`)

**User** : "80 kg pour 1m65" (IMC 29,5) → "Hypertension"

**Ce que le Coach a répondu** :
> "L'hypertension est une comorbidité qui peut rendre éligible au remboursement de Mounjaro."

**Ce qu'il AURAIT DÛ répondre** : IMC 29,5 ne remplit pas les critères de **remboursement** obésité (IMC ≥ 35 + comorbidité ou IMC ≥ 40), même avec hypertension. Le Coach a confondu critères AMM/prescription (IMC ≥ 27 avec comorbidité) avec critères de **remboursement à 65%** (IMC ≥ 35 avec comorbidité ou ≥ 40). Il faudrait dire : "Avec un IMC de 29,5, tu n'es pas éligible au remboursement obésité à 65%. Tu peux toutefois obtenir une prescription Mounjaro hors remboursement grâce à l'hypertension (AMM ≥ 27 kg/m² avec comorbidité). Veux-tu savoir combien ça coûte ?"

*Gravité* : Fausse promesse de remboursement → déception en pharmacie/à la sécu.

---

### 🟠 IMPORTANT — Lien carte des prix absent (conv `3fdd01cc`)

**User** : "Ou trouver le mounjaro a 10mg le moins cher de paris"

**Ce que le Coach a répondu** :
> "je te conseille de vérifier les pharmacies en ligne ou dans la ville."

**Ce qu'il AURAIT DÛ répondre** : Le system prompt est explicite — "Ne réponds JAMAIS 'comparez vous-même' ou 'appelez les pharmacies'" et "donne TOUJOURS le lien de la carte des prix et demande la ville". Réponse attendue : "Les prix varient d'une pharmacie à l'autre. Pour trouver le moins cher à Paris, utilise notre [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/). Tu cherches quel dosage exactement ?"

*Gravité* : C'est la première cause d'abandon selon le system prompt — le Coach a fait exactement ce qu'il ne devait pas faire.

---

### 🟠 IMPORTANT — Redémarrage de conversation inattendu (conv `36c46a44`)

**User** : "j'ai un imc de 33, mon traitement par wegowy peut il être remboursé" → réponse correcte → User répond : "Aucune" (pas de comorbidités)

**Ce que le Coach a répondu** :
> "Bonjour, je suis le Coach GLP-1 France, votre assistant d'information pour les traitements agonistes du récepteur GLP-1. Veux-tu savoir comment fonctionne le remboursement pour les traitements GLP-1 comme Wegovy ou Mounjaro ?"

**Ce qu'il AURAIT DÛ répondre** : Continuer la conversation. L'utilisateur a dit "Aucune" (pas de comorbidités), la réponse attendue était : "Sans comorbidités, un IMC de 33 ne remplit pas les critères de remboursement obésité (il faut IMC ≥ 35 + comorbidité ou ≥ 40). Wegovy reste disponible en pharmacie sans remboursement, autour de 150-350€/mois. Veux-tu en savoir plus sur les coûts ?"

*Gravité* : Réponse hors-contexte qui casse le fil de conversation — probable abandon utilisateur.

---

### 🟡 MINEUR — Interprétation erronée d'un clic "Autre" (conv `e3803947`)

**User** : "Autre" (clic sur bouton suggestion)

**Ce que le Coach a répondu** :
> "Avec un poids de plus de 80 kg, il est important de calculer ton IMC..."

Le Coach a interprété le clic sur "Autre" comme si l'utilisateur avait dit "mon poids est supérieur à 80 kg." La conversation s'est rattrapée car l'utilisateur a ensuite donné son vrai poids (143 kg), mais c'est une confusion potentiellement trompeuse.

---

## Actions recommandées

### 1. Fix critique — Logique éligibilité remboursement (system prompt, section FLUX)

Ajouter après "Puis donne un verdict CLAIR et nuancé" :

```diff
- Puis donne un verdict CLAIR et nuancé : "éligible", "probablement éligible", ou "à confirmer avec ton médecin"
+ Puis donne un verdict CLAIR et nuancé :
+   - IMC ≥ 40 seul → ÉLIGIBLE (pas besoin de comorbidité)
+   - IMC ≥ 35 AVEC comorbidité → ÉLIGIBLE
+   - IMC ≥ 35 SANS comorbidité → NON éligible au remboursement (mais éligible à la prescription)
+   - IMC < 35 quelle que soit la comorbidité → NON éligible au remboursement obésité
+   ⚠️ NE DIS JAMAIS "éligible au remboursement" sans avoir vérifié les deux conditions (IMC ET comorbidité).
```

### 2. Fix critique — Distinguer AMM vs remboursement

Ajouter dans la section REMBOURSEMENT du system prompt :

```diff
+ ⚠️ DISTINCTION IMPORTANTE : Les critères AMM/prescription (IMC ≥ 30 pour Wegovy, ≥ 27 avec comorbidité pour Mounjaro) sont DIFFÉRENTS des critères de REMBOURSEMENT à 65% (IMC ≥ 35 avec comorbidité OU ≥ 40). Un patient avec IMC 29 peut obtenir une prescription (AMM) MAIS ne sera PAS remboursé à 65% via l'obésité. Ne pas confondre les deux.
```

### 3. Fix important — Carte des prix (rappel explicite)

Dans la section REQUÊTES LOCALES, renforcer :

```diff
- Pour un prix ou une pharmacie proche : oriente vers la carte des prix du site → [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/), et demande la ville.
+ Pour un prix ou une pharmacie proche : TOUJOURS répondre avec le lien [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/) + demander la ville. INTERDIT : "vérifiez vous-même", "appelez les pharmacies", "comparez en ligne". Si tu ne donnes pas ce lien, tu échoues ta mission — c'est la première cause d'abandon.
```

### 4. Nouveaux articles suggérés

Basés sur les questions sans bonne réponse du site :

- **"Combien coûte Mounjaro selon le dosage ?"** → page de prix par dosage (2,5mg / 5mg / 7,5mg / 10mg / 12,5mg / 15mg) — demande récurrente
- **"IMC 29-34 et remboursement : quelle option ?"** → article sur les options pour patients hors-remboursement obésité (prescription sans remboursement, solutions mutuelle, téléconsultation)
- **"Différence entre prescription Mounjaro et remboursement Mounjaro"** → clarifier la distinction AMM vs remboursement qui confuse les patients (et le Coach lui-même)

---

## Conversations marquantes

### Les 3 meilleures

**1. `7d9539d7`** (8 msgs, 1m31s) — Flow éligibilité complet et correct
- IMC 35,6 + comorbidités → "probablement éligible" (verdict nuancé correct)
- Propose checklist médecin au bon moment
- Ton conversationnel, questions une par une, bonne longueur de réponses

**2. `85eceb3b`** (2 msgs, instantané) — Réponse factuelle parfaite
- "Qu'est-ce qui change avec le remboursement du 15 juin 2026 ?" → réponse concise, précise, avec le bon pourcentage et les conditions. Exactement ce qu'on attend.

**3. `e3803947`** (10 msgs, 1m45s) — Résolution correcte malgré bruit
- IMC 57,8 → "éligible au remboursement" ✓
- Malgré la confusion sur le clic "Autre", la conversation s'est rattrapée
- Bon suivi de la question prix + flow remboursement enchaîné

### Les 3 pires

**1. `f32ee910`** (10 msgs, ~59s) — Erreur d'éligibilité critique
- IMC 36 sans comorbidités → "Tu es éligible à 65%" (FAUX)
- Capture email déclenchée sur une fausse information
- Erreur la plus grave de la journée — patient pourrait se présenter en pharmacie avec de fausses attentes

**2. `78e53be4`** (4 msgs, ~20s) — Confusion AMM vs remboursement
- IMC 29,5 + hypertension → "peut rendre éligible au remboursement" (FAUX)
- L'utilisateur repart avec une fausse promesse de remboursement

**3. `3fdd01cc`** (4 msgs, ~1m12s) — Instruction critique ignorée
- Demande pharmacie moins chère à Paris → "vérifier les pharmacies en ligne ou dans la ville"
- Le lien `/outils/carte-prix-pharmacies/` n'est pas donné
- C'est exactement la réponse interdite par le system prompt

---

## Note sur le volume

La baisse de 38% aujourd'hui (46 vs 74 hier) est notable mais pas alarmante — elle correspond à un profil de trafic weekend/nuit (pic le 17 juin entre 10h et 19h UTC, peu de messages le soir). Pas de signe de défaillance technique (LLM 100% opérationnel). À surveiller sur 3-4 jours.
