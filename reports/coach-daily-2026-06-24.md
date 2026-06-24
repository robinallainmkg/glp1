# Rapport Coach IA — 24 juin 2026

Période analysée : 2026-06-23 12h UTC → 2026-06-24 12h UTC

---

## KPIs

| Métrique | Valeur | vs Veille |
|---|---|---|
| Messages totaux | 64 | ↑ +10.3% (veille : 58) |
| Conversations | 11 | — |
| Messages user | 32 | — |
| Messages coach | 32 | — |
| Messages par conv (moy.) | 5.8 | — |
| Durée moy. conv actives | ~1m45s | — |
| Taux LLM | 100% (32/32) | — |
| Taux Fallback v1 | 0% | — |
| Taux intent renseigné | 0% (0/32) | ⚠️ BUG |

**Répartition LLM :**
- `mistral-small-latest` : 19 réponses (59%)
- `llama-3.3-70b-versatile` : 13 réponses (41%)

---

## Ce qui marche bien

1. **Gestion produit suspect (conv 12af3ee8)** — Un utilisateur signale avoir reçu un GLP-1 "en pipette de 5 ml". Le Coach a correctement identifié la potentielle contrefaçon, expliqué les formes légales (stylo prérempli uniquement), sans dramatiser, en posant des questions pour comprendre la situation (où acheté ? ordonnance ?). Bon équilibre empathie / information factuelle.

2. **Parcours éducatif complet (conv 0ae82ffe)** — L'utilisateur part de "à quoi sert le GLP-1 ?" et termine 5 échanges plus tard sur le calcul d'IMC pour l'éligibilité. Le Coach a guidé pas à pas, en une idée à la fois. Bonne progression pédagogique.

3. **Réponse rapide eligibilité (conv 4562a89a)** — Sur "Suis-je éligible au remboursement de Wegovy ?", le Coach répond immédiatement "Vérifions ensemble ! Quel est ton poids et ta taille ?" — conformément à la règle du system prompt. Parfait.

4. **Gestion frustration utilisateur (conv 68520701 msg 4)** — Quand l'user écrit "JE NE VOIS PAS PRIX SUR LA CARTE" (caps lock, frustration), le Coach s'excuse et donne les fourchettes de prix directement. Bon pivot.

5. **Zéro fallback v1** — Tous les messages ont été traités par LLM. Bonne résilience de la chaîne Groq/Mistral.

---

## Problèmes détectés

### 🔴 P1 — Hallucination géolocalisation
**Conv :** `68520701`
**Échange :**
- User : "Oui, donne ma ville"
- Coach : "Tu es à Paris. Pour trouver une pharmacie pas chère, je te conseille de vérifier les prix sur notre carte des prix en pharmacie."

**Problème :** Le bot a affirmé que l'utilisateur est à Paris sans aucune donnée de localisation. Pure hallucination.
**Ce qu'il aurait dû répondre :** "Dans quelle ville es-tu ?" — et rien d'autre.

---

### 🔴 P2 — Violation règle "ne jamais dire d'appeler les pharmacies"
**Conv :** `5d80f042`
**Échange :**
- User : "Quelle pharmacie à 280" (ville déjà donnée : Hérault) → Bot demande la ville
- User : "Agde"
- Coach : "Pour trouver Mounjaro 10 mg à un bon prix à Agde, je te conseille de vérifier les prix en appelant plusieurs pharmacies."

**Problème :** Violation directe de la règle 81 du system prompt ("Ne réponds JAMAIS 'comparez vous-même' ou 'appelez les pharmacies'. C'est la 1re cause d'abandon.").
**Ce qu'il aurait dû répondre :** Donner le lien de la carte des prix `/outils/carte-prix-pharmacies/` et proposer de vérifier l'éligibilité au remboursement.

---

### 🔴 P3 — Réponse dupliquée sur "Oui"
**Conv :** `8aa02a94`
**Échange :**
- User : "Le Wegovy 0,5 se vend à Apothical val d Europe serris"
- Coach : "Le Wegovy 0,5 mg/ml coûte environ 147€ en pharmacie française [...] Veux-tu que je vérifie si tu peux être remboursé à 65% ?"
- User : "Oui"
- Coach : *(réponse IDENTIQUE à la précédente)* "Le Wegovy 0,5 mg/ml coûte environ 147€ en pharmacie française [...] Veux-tu que je vérifie si tu peux être remboursé à 65% ?"

**Problème :** L'assistant a ignoré le "Oui" (réponse à sa propre relance) et répété le même message. L'utilisateur a cliqué "Oui, je veux vérifier l'éligibilité" et a reçu le même prix au lieu de la collecte IMC.
**Ce qu'il aurait dû répondre :** Lancer le test éligibilité — "Vérifions ensemble ! Quel est ton poids et ta taille ?"

---

### 🟠 P4 — Violation règle "lancer le test éligibilité" (liste en bloc)
**Conv :** `30ebef2d`
**Échange :**
- User : "Suis-je éligible au remboursement à 65% ?"
- Coach : "Le remboursement à 65% pour Mounjaro ou Wegovy s'applique depuis le 15 juin 2026 si tu as : **IMC ≥ 35 avec au moins une comorbidité** [...] **Ou IMC ≥ 40** [...] As-tu déjà essayé une prise en charge nutritionnelle..."

**Problème :** Le system prompt dit explicitement : "Si quelqu'un demande 'suis-je éligible ?' : ne liste JAMAIS les critères en bloc — LANCE le test tout de suite : 'Vérifions ensemble ! Quel est ton poids et ta taille ?'"
**Ce qu'il aurait dû répondre :** "Vérifions ensemble ! Quel est ton poids et ta taille ?"

---

### 🟠 P5 — Mélange vouvoiement/tutoiement
**Conv :** `68520701`
**Échange :**
- User : "Trouve une pharmacie pas chère près de chez moi"
- Coach : "je te conseille de vérifier les prix [...] **Pouvez-vous** me donner **ta** ville [...]"

**Problème :** "Pouvez-vous" (vouvoiement) + "ta ville" (tutoiement) dans la même phrase. Rupture du registre.

---

### 🟠 P6 — Prix hyper-local inventé
**Conv :** `f8ac16ec`
**Échange :**
- User : "Prix actuel Mounjaro 5 mg à Nice"
- Coach : "Le Mounjaro 5 mg coûte **environ 275€/mois** en pharmacie à Nice"

**Problème :** Le Coach donne un prix précis "à Nice" alors qu'il ne dispose pas de données temps-réel par pharmacie. C'est une estimation nationale présentée comme locale. Risque de créer de fausses attentes.
**Ce qu'il aurait dû répondre :** Donner la fourchette nationale (230-440€) + renvoyer vers la carte des prix pour trouver les pharmacies de Nice.

---

### 🟡 P7 — Mauvais greeting temporel
**Conv :** `12af3ee8`
**Échange :**
- User : "Bonsoir" (21h20)
- Coach : "**Bonjour** ! Je suis le Coach GLP-1 France."

**Problème :** Réponse "Bonjour" à 21h20 quand l'utilisateur dit "Bonsoir". Détail, mais perceptible.

---

### 🟡 P8 — Intent NULL sur 100% des messages LLM
**Toutes les conversations**

**Problème :** La colonne `intent` est `null` pour tous les messages générés par LLM (`mistral-small-latest`, `llama-3.3-70b-versatile`). Seul le fallback v1 renseigne cet champ. Dans le code (`index.ts`, ligne 771) : `const detectedIntent = scamSignals.isScamRelated ? \`scam:${scamSignals.severity}\` : null;` — l'intent vaut toujours `null` en l'absence de signal arnaque. Zéro messages avec signal arnaque aujourd'hui → 0/32 intents renseignés. Cela rend le dashboard Opportunités inutilisable et empêche l'analytics par intent.

---

### 🟡 P9 — Zéro proposition Dossier GLP-1 (4,99€)
**Toutes les conversations**

**Problème :** Le system prompt (ligne 86-92) indique de proposer le Dossier "dès que tu as collecté poids + taille + comorbidités". Dans conv `0ae82ffe`, le Coach a collecté IMC (explicitement calculé) et comorbidités (suite à relance), mais n'a **jamais** proposé le Dossier. Conv `8aa02a94` idem — price intent fort, remboursement abordé, mais aucune proposition. 0/11 conversations avec tentative de conversion Dossier.

---

## Actions recommandées

### 1. Fix système : intent tracking LLM

**Fichier :** `supabase/functions/ai-coach/index.ts`

Ajouter une classification d'intent côté LLM en analysant le message user. Diff suggéré après la ligne 537 :

```diff
-    const scamSignals = detectScamSignals(cleanMessage);
+    const scamSignals = detectScamSignals(cleanMessage);
+
+    // Classify intent from user message for analytics
+    function classifyIntent(msg: string): string {
+      const m = msg.toLowerCase();
+      if (/prix|co[uû]t|combien|tarif|cher/.test(m)) return 'price';
+      if (/rembours|eligibl|sécu|mutuelle|prise en charge/.test(m)) return 'reimbursement';
+      if (/ordonnance|prescri|médecin|docteur|endocrinologue|consultation/.test(m)) return 'prescription';
+      if (/effet|secondaire|nausée|vomis|douleur|diarrhée/.test(m)) return 'side_effects';
+      if (/pharmacie|trouver|disponible|stock/.test(m)) return 'availability';
+      if (/arnaque|contrefait|pipette|gelule|en ligne|sans ordonnance/.test(m)) return 'scam';
+      if (/imc|poids|taille|maigrir|kilos|obésité/.test(m)) return 'eligibility';
+      if (/diabète|glycémie|insuline/.test(m)) return 'diabetes';
+      return 'general';
+    }
+    const detectedIntentBase = classifyIntent(cleanMessage);
```

Et ligne 771, remplacer :
```diff
-     const detectedIntent = scamSignals.isScamRelated ? `scam:${scamSignals.severity}` : null;
+     const detectedIntent = scamSignals.isScamRelated ? `scam:${scamSignals.severity}` : detectedIntentBase;
```

---

### 2. Fix system prompt : anti-hallucination localisation

**Fichier :** `supabase/functions/ai-coach/index.ts` — `SYSTEM_PROMPT`

Ajouter dans la section "REQUÊTES LOCALES" (après ligne 82) :

```diff
+- ⚠️ INTERDICTION ABSOLUE : Ne JAMAIS inférer ou inventer la localisation de l'utilisateur. Si tu ne connais pas sa ville, demande-la. Ne dis JAMAIS "Tu es à [ville]" sans que l'utilisateur l'ait explicitement dit.
```

---

### 3. Fix system prompt : détection "Oui" après relance remboursement

Ajouter dans la section "FLUX SUIS-JE ÉLIGIBLE" :

```diff
+- Si l'utilisateur répond "Oui" ou "oui" à une relance "Veux-tu vérifier ton éligibilité ?", lance IMMÉDIATEMENT le test : "Vérifions ensemble ! Quel est ton poids et ta taille ?" — ne répète JAMAIS la question précédente.
```

---

### 4. Fix system prompt : greeting adapté au moment de la journée

```diff
- Tu salues ("Bonjour"/"Salut") et te présentes UNIQUEMENT au tout premier message
+ Tu salues au moment de la journée ("Bonjour" avant 18h, "Bonsoir" à partir de 18h) et te présentes UNIQUEMENT au tout premier message
```

---

### 5. Fix system prompt : renforcer la règle "appeler les pharmacies"

La règle existe (ligne 81-82) mais n'est pas assez forte. Reformuler :

```diff
- Ne réponds JAMAIS "comparez vous-même" ou "appelez les pharmacies". C'est la 1re cause d'abandon.
+ ⚠️ INTERDIT ABSOLU : Ne dis JAMAIS "appelez les pharmacies", "comparez vous-même", "vérifiez en appelant". C'est une faute grave qui fait quitter l'utilisateur. Donne TOUJOURS le lien [Carte des prix](/outils/carte-prix-pharmacies/) et demande la ville.
```

---

### 6. Cohérence tutoiement/vouvoiement

La règle existe mais le LLM la viole parfois en mélangeant les deux dans une même phrase. Ajouter :

```diff
+ ⚠️ Tutoiement/vouvoiement : choisis l'un OU l'autre dans chaque réponse et sois COHÉRENT dans la même phrase. Ne jamais mélanger "Pouvez-vous" et "ta" dans la même phrase.
```

---

### 7. Suggestions de nouveaux articles

Questions sans article pertinent identifié ce jour :
- **"GLP-1 en pipette / solution buvable"** → Article sur les contrefaçons et formes illégales de GLP-1. Très recherché (scam segment ~28%).
- **"Prix par pharmacie dans ma ville"** → Guide ou outil "comparer les prix par département" (conv 68520701, 5d80f042) — les utilisateurs s'attendent à un outil localisé opérationnel.
- **"Documents pour le remboursement en pharmacie"** → Checklist pratique ordonnance + justificatifs + CSO/CHU. Question simple mais récurrente.

---

## Conversations marquantes

### Les 3 meilleures

| # | Conv ID | Pourquoi |
|---|---|---|
| 1 | `12af3ee8` | Gestion exemplaire d'un produit suspect en pipette : empathie, questions progressives, info claire sans paniquer. Conversation la plus engagée (10 msgs, 3m33s). |
| 2 | `0ae82ffe` | Parcours pédagogique complet : curiosité → mécanisme → comment obtenir → éligibilité. 10 msgs, 2m32s. Bon exemple de funnel organique. |
| 3 | `f8ac16ec` | Court (4 msgs), direct, correct sur pricing + remboursement. Abandon propre après le prix Nice. |

### Les 3 pires

| # | Conv ID | Pourquoi |
|---|---|---|
| 1 | `68520701` | Hallucination "Tu es à Paris" + vouvoiement/tutoiement mélangés + frustration user visible (caps lock) + carte des prix non fonctionnelle non résolue. |
| 2 | `8aa02a94` | Réponse dupliquée sur "Oui". L'user a dit oui au remboursement et a reçu le même message. Expérience cassée. |
| 3 | `30ebef2d` | Violation règle éligibilité (liste en bloc) + sur la 2e question "Prix", le bot donne Trulicity/Rybelsus alors que le contexte immédiat portait sur Wegovy/Mounjaro pour l'obésité. |

---

*Rapport généré automatiquement par le monitoring Coach IA — 2026-06-24*
