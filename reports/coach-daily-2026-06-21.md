# Coach IA — Rapport quotidien du 2026-06-21

Période analysée : **2026-06-20 12h UTC → 2026-06-21 12h UTC**
Généré automatiquement par l'agent de monitoring.

---

## KPIs

| Métrique | Valeur |
|---|---|
| Messages totaux (24h) | **64** |
| Conversations | **11** |
| Messages utilisateur | **32** |
| Messages assistant | **32** |
| Msgs / conversation (moy.) | **5,8** |
| Durée moyenne (convs > 2 msgs) | **~1m46s** |
| Taux LLM Groq 70B | **90,6%** (29/32) |
| Taux Mistral Small (fallback LLM) | **9,4%** (3/32) |
| Taux fallback rules-based | **0%** |
| Champ `intent` populé | **0%** (NULL partout pour LLM) |
| Évolution vs hier | **+52% ↑** (64 vs 42) |

### Breakdown conversations par volume

| conversation_id | msgs | durée |
|---|---|---|
| b619a0eb | 10 | 3m21s |
| 65814bcb | 10 | 2m02s |
| 3b2c69af | 10 | 2m33s |
| 665d91ba | 10 | 2m05s |
| bef75dfe | 8 | 0m58s |
| 273ff23c | 4 | 0m38s |
| 7a3ea8d2 | 4 | 0m47s |
| 1a1f5624 | 2 | 0s |
| 0a2cfe82 | 2 | 0s |
| 20d44167 | 2 | 0s |
| 513fb4fd | 2 | 0s |

---

## Ce qui marche bien

1. **Flux éligibilité remboursement** : Les conversations 3b2c69af et 665d91ba montrent un flux exemplaire — mini-questions une par une, calcul IMC correct, verdict clair à la fin (IMC 40,7 → éligible sans comorbidité ✓).

2. **Résilience LLM** : Le basculement Groq 70B → Mistral Small s'est déclenché proprement sur b619a0eb (messages 5 et 6), sans rupture visible pour l'utilisateur.

3. **Empathie sur cas complexes** : La conversation b619a0eb (personne âgée sous Ozempic, sarcopénie, médecin atteint de cancer) est gérée avec empathie et précision — article carences nutritionnelles cité, CSO régionaux identifiés (Bordeaux CHU Pellegrin, Poitiers pour Saintes).

4. **Protocole d'arrêt Ozempic** : Bien expliqué (diminution progressive 1mg → 0,5mg sur 4-8 semaines). Réponse de qualité médicale.

5. **Prix à jour** : Wegovy 147-350€/mois, Mounjaro 176-434€/mois, remboursement 65% depuis le 15 juin 2026 — correctement cité dans toutes les conversations concernées.

6. **Question produit inconnu** (7a3ea8d2 — "basdène") : Le coach a demandé des précisions avant de répondre, sans halluciner, puis a correctement renvoyé vers le médecin après clarification. Comportement conforme au system prompt.

7. **Capture email réussie** (0a2cfe82) : Un utilisateur (Patrick) a laissé son email en réponse à la proposition de checklist.

---

## Problèmes détectés

### 🔴 CRITIQUE — Hallucination complète de contexte

**Conversation** : `bef75dfe`
**Message user** : `"Oui"` (en réponse à "Veux-tu que je te donne le lien de la carte des prix ?")
**Réponse du Coach** : *"Tu as déjà un stylo d'Ozempic et tu te demandes si tu peux le finir avant de passer au nouveau stylo 3 ml ?"*
**Ce qu'il AURAIT DÛ répondre** : *"Voici la carte des prix : [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/). Dans quelle ville es-tu à Montpellier ?"*

**Analyse** : Le LLM (Groq 70B) a inventé un contexte inexistant (stylo Ozempic) à partir d'un "Oui" ambigu. La suite de la conversation est désynchronisée — l'user demande ensuite "Oui, donne-moi le lien" et reçoit une réponse sur le stylo Mounjaro 3ml au lieu du lien de la carte des prix pharmacies.

---

### 🔴 CRITIQUE — Réponse dupliquée mot pour mot

**Conversation** : `273ff23c`
**Message user** : `"Oui"` (en réponse à "Veux-tu que je t'aide à trouver le prix du Wegovy 2,4 mg dans le 93 ?")
**Réponse du Coach** : Identique à la réponse précédente, mot pour mot — *"Pour trouver le Wegovy 2,4 mg à un prix compétitif dans le 93, je te conseille de comparer les prix dans différentes pharmacies..."*
**Ce qu'il AURAIT DÛ répondre** : *"Voici la carte des prix : [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/). Tu peux filtrer par zone pour le 93."*

**Analyse** : Quand l'user accepte une offre, le LLM boucle sur sa réponse précédente au lieu d'avancer. L'utilisateur s'est probablement déconnecté sans réponse utile.

---

### 🟠 MAJEUR — Réponse hors-sujet sur une comorbidité

**Conversation** : `65814bcb`
**Message user** : `"Apnée du sommeil"` (réponse à "As-tu des comorbidités comme le diabète, l'hypertension ou l'apnée du sommeil ?")
**Réponse du Coach** : *"L'apnée du sommeil est un trouble du sommeil caractérisé par des pauses respiratoires répétées pendant le sommeil. Veux-tu en savoir plus sur les symptômes et les traitements, notamment avec les GLP-1 ?"*
**Ce qu'il AURAIT DÛ répondre** : *"IMC 31,5 avec apnée du sommeil — le critère pour le remboursement est IMC ≥ 35 avec comorbidité. À 31,5, tu n'es malheureusement pas éligible au remboursement de 65% pour l'obésité. Tu peux quand même obtenir Mounjaro sur ordonnance, à ton entière charge (~176-434€/mois). Veux-tu des infos sur le prix ?"*

---

### 🟠 MAJEUR — Verdict flou après données complètes

**Conversation** : `65814bcb`
**Message user** : `"Je ne peux pas être remboursé ?"` (après que le coach sait IMC=31,5 + apnée du sommeil)
**Réponse du Coach** : *"Le remboursement de Mounjaro et Wegovy dépend de plusieurs critères, notamment l'IMC et les comorbidités. Veux-tu que je vérifie si tu peux être remboursé à 65% ? Ça réduit beaucoup le coût."*
**Ce qu'il AURAIT DÛ répondre** : *"Avec un IMC de 31,5 et de l'apnée du sommeil, tu n'es pas éligible au remboursement de 65% pour l'obésité (seuil : IMC ≥ 35 avec comorbidité). Tu peux quand même avoir Mounjaro sur ordonnance à ta charge. Veux-tu des informations sur les prix ?"*

**Analyse** : Le coach propose à nouveau de "vérifier l'éligibilité" alors qu'il dispose déjà de toutes les informations. L'utilisateur part sans réponse claire.

---

### 🟡 MODÉRÉ — Réponse incomplète (première question ignorée)

**Conversation** : `1a1f5624`
**Message user** : *"J'ai mon ordonnance du médecin et je dois envoyer une fiche au médecin-conseil. Est-ce que je dois attendre un éventuel retour de leur part pour commencer les traitements et est-ce que la pharmacie pratique un tiers payant pour les remboursements ?"*
**Réponse du Coach** : Répond uniquement sur le tiers payant. N'aborde pas la question "dois-je attendre le médecin-conseil avant de commencer ?"
**Ce qu'il AURAIT DÛ répondre** : *"Non, tu n'as pas besoin d'attendre une réponse du médecin-conseil pour commencer le traitement — l'envoi de la fiche est une formalité administrative, tu peux débuter dès que tu as l'ordonnance. Pour le tiers payant, la pharmacie peut l'effectuer avec ta carte Vitale et l'ordonnance."*
**La relance proposée** ("Veux-tu que je vérifie si tu es éligible au remboursement à 65% ?") est hors-sujet — l'utilisateur a DÉJÀ une ordonnance, donc déjà éligible.

---

### 🟡 MODÉRÉ — Mélange tutoiement/vouvoiement

**Conversation** : `20d44167`
**Message user** : `"Trouve une pharmacie pas chère près de chez moi"`
**Réponse du Coach** : *"Pour trouver une pharmacie pas chère près de chez toi, je te conseille de vérifier les prix sur notre carte des prix en pharmacie : [...]. Pouvez-vous me donner la ville où tu te trouves ?"*
**Problème** : Mélange `toi/te` et `Pouvez-vous` dans la même réponse.
**Fix** : Utiliser exclusivement le tutoiement (l'user a tutoié avec "chez moi" → rule 8 du system prompt).

---

### 🟡 MINEUR — Intent NULL systématiquement pour les messages LLM

**Impact** : Le champ `intent` est NULL pour 100% des 32 réponses assistant LLM. Seul le fallback rule-based le renseigne. L'absence d'intent empêche le reporting par catégorie de questions et l'amélioration ciblée du bot.

---

## Actions recommandées

### Fix 1 — Bloquer l'hallucination sur les messages courts (PRIORITAIRE)

Ajouter dans le system prompt, section RÈGLES ABSOLUES :

```diff
+ 14. Quand le message de l'utilisateur est très court et ambigu ("Oui", "Ok", "Non", "Allez-y"...),
+     NE GÉNÈRE JAMAIS de contexte fictif. Rappelle l'étape en cours et avance concrètement :
+     si tu avais proposé un lien → donne-le ; si tu avais proposé de calculer l'IMC → demande
+     le poids et la taille. Ne suppose jamais ce que l'utilisateur voulait dire.
```

### Fix 2 — Avancer après une acceptation (PRIORITAIRE)

Ajouter dans le system prompt, section STYLE :

```diff
+ Quand l'utilisateur répond "Oui" ou accepte ta proposition, AVANCE immédiatement à l'étape
+ suivante. Ne répète JAMAIS ta réponse précédente. Exemple : tu avais proposé la carte des
+ prix → donne le lien [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/) et demande
+ la ville. Tu avais proposé de calculer l'IMC → demande poids + taille.
```

### Fix 3 — Interpréter les comorbidités déclarées comme réponses (PRIORITAIRE)

Ajouter dans la section FLUX ÉLIGIBILITÉ :

```diff
+ Quand tu viens de demander les comorbidités (diabète T2, hypertension, apnée du sommeil...),
+ si la réponse de l'utilisateur est une comorbidité connue, interprète-la DIRECTEMENT comme
+ une confirmation et continue le flux. Ne l'explique pas — utilise-la comme critère.
+ Exemple : user répond "Apnée du sommeil" → tu réponds sur l'éligibilité en tenant compte de
+ cette comorbidité, tu ne définis pas ce qu'est l'apnée.
```

### Fix 4 — Verdict d'éligibilité obligatoire et direct

Ajouter dans le system prompt, section FLUX ÉLIGIBILITÉ :

```diff
+ Dès que tu as : IMC calculé + comorbidités (ou absence confirmée), donne un verdict CLAIR
+ en une phrase :
+ - IMC ≥ 40 → "Tu es éligible au remboursement 65% (IMC ≥ 40, même sans comorbidité)."
+ - IMC ≥ 35 + comorbidité → "Tu es éligible (IMC ≥ 35 avec [comorbidité])."
+ - IMC ≥ 35 sans comorbidité → "Pas éligible pour l'instant (IMC ≥ 35 mais pas de comorbidité
+   reconnue). Tu peux quand même accéder au traitement à ta charge."
+ - IMC < 35 → "Pas éligible (IMC < 35). Tu peux quand même obtenir le traitement sur
+   ordonnance, à ta charge."
+ Ne renvoie JAMAIS l'utilisateur "vérifier" s'il t'a déjà donné toutes les infos.
```

### Fix 5 — Renseigner le champ `intent` pour les messages LLM

Dans `index.ts`, la variable `detectedIntent` est `null` dès qu'il n'y a pas de signal arnaque. Ajouter une classification post-LLM basique par mots-clés sur `cleanMessage` pour alimenter le champ `intent` :

```typescript
// Après la détection scam, avant saveMessages :
function classifyIntent(msg: string): string {
  if (/prix|co[uû]t|rembours|tarif|combien/i.test(msg)) return 'price';
  if (/ordonnance|prescri|m[eé]decin|consult|obtenir/i.test(msg)) return 'prescription';
  if (/effet|secondaire|naus[eé]|douleur|fatigue/i.test(msg)) return 'side_effects';
  if (/imc|poids|taille|éligib/i.test(msg)) return 'eligibility';
  if (/pharmacie|o[uù].*trouver|dispo/i.test(msg)) return 'availability';
  if (/r[eé]gime|nutrition|manger/i.test(msg)) return 'diet';
  if (/arrêter|stop|arrêt/i.test(msg)) return 'stop_treatment';
  return 'general';
}
const detectedIntent = scamSignals.isScamRelated
  ? `scam:${scamSignals.severity}`
  : classifyIntent(cleanMessage);
```

### Articles manquants identifiés

Sur la base des questions sans bonne réponse ou sans article RAG pertinent :

1. **"Comment arrêter progressivement l'Ozempic / Wegovy / Mounjaro"** — question fréquente (b619a0eb), aucun article ciblé détecté par le RAG.
2. **"Compatibilité GLP-1 avec les traitements thyroïdiens"** — question médicale légitime (7a3ea8d2, "basdène"), aucun contenu existant.
3. **"Trouver une pharmacie avec Mounjaro/Wegovy dans [ville]"** — 3 conversations sur ce sujet, la carte des prix est mentionnée mais aucun article guide sur la démarche.

---

## Conversations marquantes

### Les 3 meilleures

**1. b619a0eb** — Cas médical complexe, résilience LLM exemplaire
Personne âgée sous Ozempic avec sarcopénie, dénutrition, et médecin traitant indisponible (cancer). Le Coach a géré avec empathie, cité un article pertinent, expliqué le protocole d'arrêt, et identifié les CSO de Bordeaux (CHU Pellegrin) et de Poitiers. Basculement transparent vers Mistral Small. Durée : 3m21s. Score qualité : **9/10**.

**2. 665d91ba** — Flux éligibilité parfait
"Comment être remboursé" → collecte IMC (120kg/1m72 → 40,7) → verdict correct "probablement éligible" (IMC ≥ 40 sans comorbidité). Durée : 2m05s. Score qualité : **8/10**.

**3. 3b2c69af** — Accompagnement perte de poids
35 kg à perdre → calcul IMC (97,2kg/1,64m → 36,2) → orientation remboursement. Questions une par une, sans redondance. Score qualité : **7,5/10**.

### Les 3 pires

**1. bef75dfe** — Hallucination grave
L'utilisateur cherchait une pharmacie à Montpellier. Le coach a inventé un contexte fictif sur un stylo Ozempic, puis l'utilisateur a reçu une réponse sur le stylo Mounjaro 3ml au lieu du lien de la carte des prix. Score qualité : **2/10**.

**2. 273ff23c** — Réponse dupliquée, abandon probable
Utilisateur du 93 cherchant Wegovy 2,4 mg moins cher. Réponse identique deux fois de suite. L'utilisateur est probablement parti sans aide concrète. Score qualité : **3/10**.

**3. 65814bcb** — Verdict flou, confusion comorbidité
IMC 31,5 + apnée du sommeil. Le coach a expliqué ce qu'est l'apnée au lieu de l'utiliser comme critère, puis a donné un verdict vague sans conclure sur l'éligibilité. L'utilisateur a posé explicitement "Je ne peux pas être remboursé ?" sans obtenir une réponse directe. Score qualité : **4/10**.

---

*Rapport généré le 2026-06-21 par l'agent monitoring Coach IA GLP-1 France.*
