# Rapport Coach IA — Monitoring Quotidien — 25 juin 2026

> Généré automatiquement. Données issues de Supabase (`coach_messages`, `coach_conversations`).

---

## KPIs

| Métrique | Aujourd'hui (25/06) | Hier (24/06) | Avant-hier (23/06) |
|---|---|---|---|
| Messages totaux | **0** 🔴 | 0 | 72 |
| Conversations | 0 | 0 | 10 |
| Messages user | 0 | — | ~36 |
| Messages assistant | 0 | — | ~36 |
| Msgs / conversation | — | — | 7,2 |
| Taux LLM | — | — | ~100% |
| Taux fallback-v1 | — | — | ~0% |

### Distribution modèles (23/06 — dernière journée active)
| Modèle | Messages |
|---|---|
| `mistral-small-latest` | ~20 |
| `llama-3.3-70b-versatile` | ~16 |
| `fallback-v1` | 0 |

### Évolution hebdomadaire
| Date | Messages |
|---|---|
| 18/06 | 44 |
| 19/06 | 78 |
| 20/06 | 50 |
| 21/06 | 32 |
| 22/06 | 56 |
| 23/06 | 72 |
| 24/06 | **0** 🔴 |
| 25/06 | **0** 🔴 |

---

## ⚠️ ALERTE CRITIQUE : SILENCE TOTAL DEPUIS 36H

**Le Coach IA n'a reçu AUCUN message depuis le 23 juin 2026 à 21:23 UTC**, soit plus de 36 heures d'inactivité complète. La moyenne précédente était de ~55 messages/jour.

**Causes possibles à vérifier en priorité :**
1. Edge function `ai-coach` en erreur (quota Groq/Mistral épuisé ?)
2. Widget `AiCoach.astro` non chargé sur le site (JS error ?)
3. Problème CORS ou timeout Supabase
4. Deploy cassé bloquant le widget côté frontend

**Action immédiate recommandée :** Vérifier les logs de la fonction Edge dans le dashboard Supabase + tester manuellement le widget sur glp1-france.fr.

---

## Ce qui marche bien (données du 23/06)

1. **Gestion scam excellente (conv `12af3ee8`)** — Un utilisateur signale avoir reçu un "GLP-1 en pipette 5 ml dans une boîte". Le Coach identifie immédiatement que ce format n'existe pas en France, détaille les formes légales (injection/comprimé), demande des précisions sur le site d'achat avant de conclure. Approche empathique et sans alarmisme. 

2. **Conversion remboursement bien intégrée** — Plusieurs conversations enchaînent naturellement sur l'éligibilité après une question de prix, avec la bonne formulation "Veux-tu voir si tu peux être remboursé à 65% ?" (convs `5d80f042`, `f8ac16ec`, `8aa02a94`).

3. **Précision prix locale (conv `f8ac16ec`)** — Réponse correcte sur le prix Mounjaro 5mg à Nice (~275€) avec remboursement 65% depuis le 15 juin 2026 mentionné correctement.

4. **Chaîne LLM fonctionnelle** — Basculement transparent entre `llama-3.3-70b` et `mistral-small-latest` sans fallback-v1, preuve que le fail-over multi-fournisseur fonctionne bien.

5. **Lien carte des prix bien utilisé** — Conv `5d80f042` : le Coach donne le lien `/outils/carte-prix-pharmacies/` puis demande la ville. Conforme à la règle du system prompt.

---

## Problèmes détectés

### 🔴 Problème 1 — HALLUCINATION DE LOCALISATION
**Conversation :** `68520701`  
**Message user :** `"Oui, donne ma ville"`  
**Réponse Coach :** `"Tu es à Paris. Pour trouver une pharmacie pas chère, je te conseille de vérifier les prix sur notre carte des prix en pharmacie. Pour le suivi médical, il y a le CHU Pitié-Salpêtrière ou la Clinique de la Muette."`  
**Problème :** Le Coach a **inventé "Paris"** alors qu'il n'a AUCUNE information de localisation. L'utilisateur était en réalité dans le 91 (code postal 91160 = Longjumeau, indiqué dans le message suivant). Des structures médicales inexactes ont été citées.  
**Ce qu'il aurait dû répondre :** `"Je n'ai pas accès à ta localisation — dis-moi ta ville ou ton code postal et je t'aide à trouver des pharmacies proches."`

---

### 🔴 Problème 2 — CRITÈRES D'ÉLIGIBILITÉ ERRONÉS (IMC)
**Conversation :** `0ae82ffe`  
**Message user :** `"comment verifier l'eligibilité ?"`  
**Réponse Coach :** `"Si ton IMC est ≥ 30, tu remplis le critère principal. Si ≥ 27 avec une comorbidité (diabète, hypertension…), tu es aussi éligible."`  
**Problème :** Ces seuils sont **FAUX**. Le remboursement exige IMC ≥ 35 avec comorbidité OU IMC ≥ 40 sans. Le Coach a confondu avec d'anciens critères ou ceux d'une autre indication. Cela crée de faux espoirs chez des patients avec IMC 27-34 qui ne seront PAS remboursés.  
**Ce qu'il aurait dû répondre :** `"Le remboursement à 65% s'applique si ton IMC est ≥ 35 avec au moins une comorbidité (diabète, hypertension, apnée du sommeil), ou ≥ 40 sans comorbidité. Quel est ton poids et ta taille ?"`

---

### 🟠 Problème 3 — REMBOURSEMENT WEGOVY/MOUNJARO PRÉSENTÉ COMME "LIMITÉ"
**Conversation :** `30368914`  
**Message user :** `"Combien coûte un traitement GLP-1 et est-il remboursé ?"`  
**Réponse Coach (llama-3.3-70b) :** `"Pour le Wegovy (sémaglutide 2,4 mg) et le Mounjaro (tirzépatide) utilisés pour l'obésité, les prix sont respectivement de ~250 à 290 €/mois et de 230 à 440 €/mois, mais leur remboursement est actuellement limité."`  
**Problème :** "Remboursement actuellement limité" est **FAUX depuis le 15 juin 2026**. Le system prompt indique explicitement que cette information est prioritaire et que le contexte RAG peut être périmé sur ce point. Le LLM a probablement récupéré du contexte RAG obsolète et n'a pas appliqué la règle de priorité.  
**Ce qu'il aurait dû répondre :** `"Wegovy et Mounjaro sont remboursés à 65% pour l'obésité depuis le 15 juin 2026 (arrêté du 23 mai 2026). Conditions : IMC ≥ 35 avec comorbidité ou ≥ 40, primo-prescription en CSO/CHU."`

---

### 🟠 Problème 4 — BOUCLE DE RÉPÉTITION sur vérification d'éligibilité
**Conversation :** `8aa02a94`  
**Séquence :**  
- User : `"Le Wegovy 0,5 se vend à Apothical val d Europe serris"`  
- Coach : donne le prix + `"Veux-tu que je vérifie si tu peux être remboursé à 65% ?"`  
- User : `"Oui"`  
- Coach : **répète exactement le même message de prix** + la même question de remboursement

**Problème :** Quand l'utilisateur répond "Oui", le Coach devrait lancer le flow de collecte (poids + taille). Au lieu de ça, il boucle sur la même réponse. La détection du "Oui" comme confirmation d'intérêt pour l'éligibilité ne fonctionne pas dans ce cas.

---

### 🟡 Problème 5 — RÉPONSE HORS CONTEXTE sur les prix (conv `30ebef2d`)
**Conversation :** `30ebef2d`  
**Séquence :**  
- Tour 1 : User demande l'éligibilité → Coach répond correctement  
- Tour 2 : User dit `"Prix"`  
- Coach répond : prix Trulicity et Rybelsus (molécules les moins courantes)

**Problème :** L'utilisateur a demandé des infos sur le remboursement, le Coach aurait dû répondre sur les prix de Wegovy/Mounjaro (sujets du contexte), pas sur Trulicity/Rybelsus qui sortent de nulle part.

---

### 🟡 Problème 6 — EMOJIS PICTOGRAPHIQUES dans les réponses fallback
Les patterns fallback `INTENT_PATTERNS` (code lignes 108-159 du `index.ts`) contiennent des emojis (💊, 📅, 🥩, 🍽️, etc.). Le system prompt indique "SANS emojis pictographiques". Ces patterns ne seront déclenchés qu'en cas de défaillance LLM totale, mais ils sont non conformes au style éditorial.

---

## Actions recommandées

### Action 1 (URGENT) — Diagnostiquer la panne de 36h

Vérifier dans l'ordre :
1. Dashboard Supabase → Functions → `ai-coach` → Logs des dernières 48h
2. Tester manuellement via curl :
   ```bash
   curl -X POST https://ywekaivgjzsmdocchvum.supabase.co/functions/v1/ai-coach \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ANON_KEY>" \
     -d '{"session_id":"test-monitor","message":"Bonjour"}'
   ```
3. Vérifier que le widget se charge sur glp1-france.fr (console navigateur)
4. Vérifier les quotas Groq et Mistral

---

### Action 2 (CRITIQUE) — Corriger la hallucination de localisation

Ajouter dans le system prompt, dans la section `REQUÊTES LOCALES` :

```diff
 REQUÊTES LOCALES (prix / pharmacie / médecin près de chez moi) — TRÈS FRÉQUENT :
+- ⚠️ Tu n'as JAMAIS accès à la localisation de l'utilisateur. Si quelqu'un dit "donne ma ville", "tu connais ma ville" ou formulation similaire, réponds TOUJOURS : "Je n'ai pas accès à ta localisation — dis-moi ta ville ou ton code postal ?" N'INVENTE JAMAIS de ville.
 - Ne réponds JAMAIS "comparez vous-même" ou "appelez les pharmacies". [...]
```

---

### Action 3 (CRITIQUE) — Renforcer les seuils IMC dans le system prompt

Le passage sur les seuils est déjà très détaillé, mais le LLM (notamment `mistral-small-latest`) ne l'applique pas toujours. Ajouter une instruction explicite de non-régression :

```diff
 FLUX "SUIS-JE ÉLIGIBLE AU REMBOURSEMENT ?" [...]
+⛔ RAPPEL CRITIQUE : Les seuils du remboursement obésité sont IMC ≥ 35 + comorbidité OU IMC ≥ 40. Ne JAMAIS mentionner IMC ≥ 27 ou IMC ≥ 30 comme seuil d'éligibilité au remboursement. Ces seuils sont ERRONÉS pour cette indication.
```

---

### Action 4 — Corriger les fallbacks (emojis pictographiques)

Dans `index.ts`, remplacer les emojis dans `INTENT_PATTERNS` :

```diff
-    response: "Prix des traitements GLP-1 en France (mis à jour juin 2026) :\n\n💊 Ozempic [...]"
+    response: "Prix des traitements GLP-1 en France (mis à jour juin 2026) :\n\nOzempic [...]"
```

Et dans `intent: 'diet'` :
```diff
-    response: "Un régime restrictif n'est PAS recommandé [...]\n\n🥩 Apport suffisant en protéines [...]"
+    response: "Un régime restrictif n'est PAS recommandé [...]\n\n- Apport suffisant en protéines [...]"
```

---

### Action 5 — Corriger la boucle de répétition ("Oui" → éligibilité)

Le flow d'éligibilité est déclenché par la détection de "oui" mais le LLM n'a pas assez de contexte sur ce que signifie ce "oui". Ajouter dans le system prompt :

```diff
 FLUX "SUIS-JE ÉLIGIBLE [...]"
+- Si dans la réponse précédente tu as proposé "Veux-tu qu'on vérifie ton éligibilité ?" et que l'utilisateur répond "oui", "ok", "d'accord", "vas-y" ou similaire : COMMENCE IMMÉDIATEMENT le flow en demandant le poids et la taille. Ne répète PAS ta réponse précédente.
```

---

### Suggestions de nouveaux articles (questions sans bonne réponse)

1. **"Prix Mounjaro par département"** — Plusieurs utilisateurs demandent des prix locaux (Hérault, 91, Nice). Un article ou outil dédié par région éviterait les hallucinations de prix.

2. **"Documents nécessaires pour le remboursement en pharmacie"** — Conv `df3ddd0a` : question fréquente, réponse incertaine du Coach. Un article exhaustif avec la liste exacte des documents (ordonnance, protocole de soins, carte Vitale) ancrerait les réponses.

3. **"Primo-prescription en CSO/CHU : comment trouver et prendre RDV"** — Plusieurs utilisateurs arrivent au stade de la primo-prescription mais ne savent pas concrètement comment procéder (délais, liste CHU/CSO par ville, tarifs).

---

## Conversations marquantes

### Les 3 meilleures (engagement, qualité)

**1. Conv `12af3ee8` — Gestion arnaque (pipette 5 ml, 10 msgs)**  
Gestion exemplaire d'un cas scam. Le Coach identifie immédiatement l'anomalie du format "pipette 5 ml" (inexistant pour les GLP-1 en France), informe sans dramatiser, et demande méthodiquement le site d'achat pour aider l'utilisateur. Bonne application du protocole anti-arnaque.

**2. Conv `5d80f042` — Prix Mounjaro Hérault (10 msgs)**  
Conversation bien gérée sur les prix locaux : le Coach donne des fourchettes cohérentes (280-350€ pour le 10mg dans l'Hérault), utilise le lien de la carte des prix, et enchaîne correctement sur le remboursement. Seul regret : quand l'utilisateur donne des villes (Agde, Montpellier), le Coach ne donne pas d'info concrète sur les pharmacies.

**3. Conv `f8ac16ec` — Prix Nice + remboursement (4 msgs)**  
Réponses courtes, factuelles, avec le remboursement 65% depuis le 15 juin 2026 correctement mentionné. Prix Mounjaro 5mg à Nice (~275€) crédible et localisé.

---

### Les 3 pires (à corriger en priorité)

**1. Conv `68520701` — Hallucination Paris (10 msgs)**  
Le Coach invente que l'utilisateur est à Paris, cite des hôpitaux fictifs dans la mauvaise ville (l'utilisateur est en 91). Quand la carte des prix ne montre pas les données, le Coach répond par des fourchettes génériques sans aide concrète. Conversation frustrante pour l'utilisateur (messages en majuscules "JE NE VOIS PAS PRIX SUR LA CARTE").

**2. Conv `0ae82ffe` — Seuils IMC erronés (10 msgs)**  
Faux espoir majeur : le Coach dit que IMC ≥ 27 avec comorbidité est éligible au remboursement — c'est faux. Risque de déception lors de la consultation médicale.

**3. Conv `30368914` — Remboursement "limité" (2 msgs)**  
Information périmée communiquée malgré la règle de priorité explicite dans le system prompt. Le contexte RAG a pris le dessus sur la règle absolue.

---

*Rapport généré le 2026-06-25. Prochaine vérification recommandée : après résolution de la panne.*
