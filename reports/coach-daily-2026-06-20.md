# Coach IA GLP-1 — Rapport quotidien du 2026-06-20

Période analysée : 2026-06-19 ~12h UTC → 2026-06-20 ~12h UTC

---

## KPIs

| Métrique | Valeur |
|---|---|
| Messages totaux | 42 |
| Conversations | 9 |
| Messages utilisateurs | 21 |
| Messages assistants | 21 |
| Msgs / conversation (moy.) | 4,7 |
| Conversations à 6 msgs (max) | 5 |
| Durée moyenne engagement | ~1m50s (hors outlier) |
| Durée max (conv. outlier) | 5h11m (`389a0cc7`) |

### Répartition LLM
| Modèle | Messages | % |
|---|---|---|
| Mistral Small (fallback 2) | 13 | 62% |
| Llama 3.3 70B Groq (primaire) | 8 | 38% |
| Fallback v1 (rules engine) | 0 | 0% |

> Groq est le modèle primaire mais est saturé (~62% des requêtes basculent vers Mistral). Aucun fallback règles déclenché — bonne résilience.

### Intents détectés
| Intent | Nb |
|---|---|
| NULL (LLM sans scam pattern) | 21 |

> ⚠️ **100% des intents sont NULL** — le champ n'est rempli que lors de détection scam, ce qui donne zéro visibilité sur les thèmes abordés.

### Évolution vs veille
| | Aujourd'hui | Hier | Δ |
|---|---|---|---|
| Messages totaux | 42 | 80 | **↓ -47,5%** |

> Chute significative. Peut s'expliquer par un effet week-end (samedi vs vendredi) mais mérite surveillance si cela se confirme lundi.

---

## Ce qui marche bien

1. **Zéro fallback v1** — La chaîne LLM Groq → Mistral → Groq 8B est robuste, aucun message n'a reçu une réponse purement règle-métier.

2. **Information remboursement 65% correcte et prioritaire** — Toutes les réponses sur le remboursement Wegovy/Mounjaro (depuis le 15/06/2026) sont conformes au fait officiel encodé dans le system prompt. Le Coach ne dit jamais "non remboursé" pour ces molécules.

3. **Flux éligibilité déclenché au bon moment** (conv. `dca8a1c7`, 1er tour Llama) — Quand l'utilisateur donne son contexte de perte de poids, le Coach demande immédiatement poids et taille ("Quel est ton poids et ta taille actuels ?") — conforme au flux éligibilité du system prompt.

4. **Géolocalisation réussie** (conv. `f8dc1713`) — Quand l'utilisateur donne "62480 le portel", le Coach identifie correctement Le Portel (Pas-de-Calais) et oriente vers le CSO de Lille (CHU Huriez). Réponse précise et utile.

5. **CSS + remboursement bien géré** (conv. `60a81aba`) — La Complémentaire Santé Solidaire est bien expliquée : remboursement à 65% par l'AM + reste à charge couvert par CSS. Réponse rassurante et exacte.

6. **Engagement élevé** — 5 conversations sur 9 ont atteint le maximum de 6 messages, signe que les utilisateurs restent engagés jusqu'à obtenir une réponse satisfaisante.

---

## Problèmes détectés

### 🔴 CRITIQUE — Contradiction médicale (Coach dit "Oui éligible" pour IMC 25,2)

**Conversation** : `dca8a1c7`  
**Message user** : "aujourd'hui je fais 59 kilos pour 1m53"  
**Ce que le Coach a répondu (Mistral)** :
> "Oui, tu es éligible au remboursement à 65% depuis le 15 juin 2026 ! Avec 59 kg pour 1,53 m, ton IMC est d'environ **25,2** (poids normal). Pour le remboursement Wegovy, il faut un IMC ≥ 35 avec comorbidité (hypertension, diabète, apnée du sommeil…) ou ≥ 40."

**Ce qu'il AURAIT DÛ répondre** :
> "Avec un IMC de 25,2 (poids normal), tu n'es malheureusement **pas éligible** au remboursement Wegovy pour l'obésité (il faut un IMC ≥ 35 avec comorbidité ou ≥ 40). Mais ta situation hépatique (foie + GGT) mérite un suivi médical spécialisé. Veux-tu que je t'aide à trouver un médecin spécialisé en troubles métaboliques près de chez toi ?"

**Pourquoi c'est grave** : Le Coach dit "Oui, tu es éligible" en ouverture, ce que l'utilisateur retient en premier. La correction suit dans la même phrase mais c'est trop tard — l'utilisateur peut avoir arrêté de lire. Erreur médicale pouvant induire en erreur sur des droits financiers.

**Cause probable** : Groq 70B saturé → Mistral prend le relais sans relire le calcul IMC précédent. La condition saysEligible dans le code (`/\béligibl/i.test(cleanResponse)`) a même déclenché `offer_capture: true` sur ce message erroné.

---

### 🔴 CRITIQUE — Réponses tronquées en base de données

**Conversation** : `b9127bdc`  
**Deux réponses consécutives** se terminent par `"[[S"` au lieu de `"[[SUGGESTIONS]] ..."`.

**Message user** : "Suis je éligible si je pèse 100 kg pour 1m57 et je suis suivi par une nutritionniste medecin au sein d'un.cabinet medical ?"  
**Réponse tronquée Coach** :
> "...Veux-tu que je t'aide à trouver un médecin spécialisé près de chez toi pour discuter de tes options ? Ou préfères-tu d'abord vérifier les détails de ton éligibilité ? [[S"

**Ce qu'il AURAIT DÛ répondre** : La réponse est correcte dans son contenu (IMC 40,6 = éligible potentiellement) mais tronquée avant `[[SUGGESTIONS]]`. L'utilisateur n'a pas vu les suggestions cliquables. De plus, au 2ème tour (user dit "Je prefere verifier les details"), le Coach répète quasi la même réponse au lieu de progresser vers les comorbidités.

**Cause probable** : Limite de la colonne `content` dans `coach_messages` ou troncature dans `saveMessages()`. À vérifier : `SELECT character_maximum_length FROM information_schema.columns WHERE table_name='coach_messages' AND column_name='content'`.

---

### 🟠 IMPORTANT — Répétition exacte de réponse sur code postal

**Conversation** : `a5f84e85`  
**Message user** : "Wegovy 31320" (après que le Coach a demandé la ville)  
**Ce que le Coach a répondu (Llama)** : Exactement la même réponse que précédemment — "Pour trouver une pharmacie... [lien carte] Pouvez-vous me donner la ville ?"  
**Ce qu'il AURAIT DÛ répondre** :
> "31320, c'est dans le secteur de Toulouse ! Voici la carte des prix dans cette zone : [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/). Pour Wegovy, les pharmacies en Haute-Garonne ont souvent des stocks."

**Cause probable** : Llama n'a pas interprété "Wegovy 31320" comme un code postal + produit. La détection de code postal (`extractDepartmentCode`) existe dans le code mais s'applique uniquement au flux `detectDoctorIntent`. Elle n'est pas activée pour les requêtes pharmacie. Le message "Wegovy 31320" n'a pas déclenché `DOCTOR_PATTERNS` donc pas de context `doctorContext` injecté.

---

### 🟠 IMPORTANT — Re-présentation du Coach en mid-conversation

**Conversation** : `f8dc1713`, 3ème tour  
**Ce que le Coach a répondu (Mistral)** :
> "Bonjour, je suis le Coach GLP-1 France. Pour obtenir une ordonnance..."

**Ce qu'il AURAIT DÛ répondre** : Répondre directement sans se re-présenter. La règle 8 du system prompt est explicite : "Tu salues... UNIQUEMENT au tout premier message ; ensuite tu réponds directement, sans re-saluer."

**Cause probable** : Mistral (modèle de fallback) ne respecte pas toujours cette consigne, notamment quand l'historique de conversation est récupéré mais que le modèle change en mid-session.

---

### 🟡 MINEUR — Violation règle 11 : "notre carte"

**Conversation** : `05988984`  
**Message user** : "Qu elle pharmacie pour mounjaro 10mg la moins chere"  
**Problème** : Le Coach répond "je te conseille de consulter **notre** carte des prix en pharmacie". La règle 11 interdit "nos contenus" — formulation à éviter.

**Fix** : Remplacer "notre carte des prix" par "la carte des prix de GLP-1 France" ou simplement "la carte des prix en pharmacie".

---

### 🟡 MINEUR — Flux éligibilité non respecté (liste conditions au lieu de lancer)

**Conversation** : `389a0cc7`, 2ème tour  
**Message user** : "suis-je éligible au remboursement a 65%"  
**Ce que le Coach a répondu (Mistral)** : Liste les conditions (IMC ≥ 35, comorbidités, primo-prescription CSO/CHU) puis propose de vérifier.  
**Ce qu'il AURAIT DÛ répondre** (selon system prompt) :
> "Vérifions ensemble ! Quel est ton poids et ta taille ?"

La règle est explicite : "Ne liste JAMAIS les critères en bloc — LANCE le test tout de suite."

---

### 🟡 MINEUR — Hypothèse produit erronée

**Conversation** : `ede8bca7`  
**Message user** : "Je souhaite acheter"  
**Ce que le Coach a répondu** : Répond en supposant que l'utilisateur veut acheter du Wegovy.  
**Ce qu'il AURAIT DÛ répondre** : "Acheter quel traitement ? Ozempic, Wegovy, Mounjaro ou autre ?" avant de supposer.

---

### 🟡 MINEUR — Mélange vouvoiement/tutoiement

**Conversation** : `60a81aba`, 1er tour (Llama)  
Même réponse : "vous pouvez bénéficier" ... "Veux-tu vérifier". L'utilisateur avait écrit "j'aurais" (neutre, pas de tutoiement explicite). Le Coach aurait dû choisir un registre et s'y tenir.

---

## Actions recommandées

### 1. Fix immédiat — Règle anti-contradiction éligibilité (system prompt)

Ajouter dans le SYSTEM_PROMPT, dans le flux SUIS-JE ÉLIGIBLE :

```diff
- Puis donne un verdict CLAIR et nuancé : "éligible", "probablement éligible", ou "à confirmer avec ton médecin"
+ Puis donne un verdict CLAIR et nuancé. ⚠️ RÈGLE ABSOLUE : Ne commence JAMAIS une réponse par "Oui, tu es éligible" si tu vas ensuite expliquer que les critères ne sont pas remplis. Si l'IMC calculé ne satisfait pas les critères, dis IMMÉDIATEMENT "Avec un IMC de X, tu n'es pas éligible" — jamais "Oui" suivi d'un "mais". La contradiction crée une fausse espérance.
```

### 2. Fix moyen terme — Détecter le code postal dans les requêtes pharmacie

Dans `index.ts`, étendre la détection de code postal au-delà du flux médecin. Ajouter un contexte `pharmacyContext` si le message contient un code postal ET des termes de disponibilité/pharmacie :

```typescript
// Après isDoctorSearch, ajouter :
const isPharmacySearch = /pharmacie|disponible|trouver|stock|où.*acheter|prix/i.test(cleanMessage);
const postalCode = extractDepartmentCode(cleanMessage);
let pharmacyContext = '';
if (isPharmacySearch && postalCode) {
  pharmacyContext = `\n\n🗺️ INSTRUCTION : L'utilisateur a fourni le code postal/département ${postalCode}. Utilise cette info pour personnaliser : mentionne la région, oriente vers la carte des prix en pharmacie avec ce contexte géographique. Ne redemande pas la ville.`;
}
```

Et dans `userMessageWithContext`, ajouter `${pharmacyContext}` aux injections de contexte.

### 3. Fix prompt — Règle "notre" → reformulation neutre

Remplacer dans le system prompt, section REQUÊTES LOCALES :

```diff
- oriente vers la carte des prix du site → [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/)
+ oriente vers la carte des prix → [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/) (ne dis jamais "notre carte" — dis "la carte des prix GLP-1 France" ou simplement "la carte des prix")
```

### 4. Fix technique — Investiguer troncature colonne `content`

```sql
-- Vérifier la limite de la colonne
SELECT character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'coach_messages' AND column_name = 'content';

-- Identifier tous les messages tronqués
SELECT id, conversation_id, length(content), right(content, 50)
FROM coach_messages
WHERE content LIKE '%[[S%' AND length(content) = (
  SELECT character_maximum_length FROM information_schema.columns 
  WHERE table_name='coach_messages' AND column_name='content'
);
```

Si la colonne a une limite, migrer vers `TEXT` (illimité) :
```sql
ALTER TABLE coach_messages ALTER COLUMN content TYPE TEXT;
```

### 5. Fix prompt — Renforcer règle "pas de re-salutation"

Ajouter en règle 8 un exemple explicite pour les modèles de fallback :

```diff
- Tu salues ("Bonjour"/"Salut") et te présentes UNIQUEMENT au tout premier message
+ Tu salues ("Bonjour"/"Salut") et te présentes UNIQUEMENT au tout premier message. ⚠️ Ne te re-présente JAMAIS dans une conversation en cours, même si tu prends le relais d'un autre modèle. Si tu vois de l'historique, c'est que la conversation est déjà engagée — réponds directement.
```

### 6. Suivi intent — Classifier les thèmes côté LLM

Le champ `intent` est NULL à 100% pour les conversations LLM. Envisager d'ajouter une instruction au system prompt pour que le LLM retourne un tag d'intent (ex : `[[INTENT:price]]`) en fin de réponse, parsé comme `[[SUGGESTIONS]]`.

### Articles manquants / sujets sans bonne réponse

- **"Wegovy + foie + GGT"** (conv. `dca8a1c7`) : L'utilisateur prend Wegovy pour une NASH/stéatose hépatique. Aucun article sur le site n'aborde Wegovy + bénéfices hépatiques (GGT, stéatose). Article à créer : *"Wegovy et santé du foie : effets sur la stéatose hépatique et les GGT"*.
- **"CSS et remboursement GLP-1"** (conv. `60a81aba`) : Sujet de niche très demandé. Article à créer : *"Complémentaire Santé Solidaire (CSS) et remboursement Wegovy/Mounjaro : ce que vous devez savoir"*.
- **"Code postal → pharmacie"** : 2 conversations sur 9 cherchaient une pharmacie par localisation. La carte des prix est bien orientée mais l'UX gagnerait à être mentionnée plus proactivement.

---

## Conversations marquantes

### 3 meilleures

**1. `f8dc1713` — Géolocalisation CSO précise (⭐⭐⭐)**  
L'utilisateur de Le Portel (62480) cherchait une ordonnance. Le Coach a identifié Le Portel, a su que le CSO le plus proche est le CHU Huriez à Lille, et a fourni une réponse géographiquement précise et médicalement correcte. Durée : 1m25s, 6 messages d'engagement.

**2. `60a81aba` — Cas CSS bien résolu (⭐⭐⭐)**  
Question technique sur la Complémentaire Santé Solidaire. Le Coach a expliqué clairement la mécanique CSS + AM = 100% pour l'utilisatrice déjà sous Wegovy avec accord AM. Réponse rassurante, exacte, et l'utilisatrice a confirmé ("oui"). Durée : 1m52s.

**3. `e2e072c4` — Exploration multi-molécules bien conduite (⭐⭐)**  
L'utilisateur a exploré qui peut prescrire Mounjaro, puis Ozempic, puis Wegovy dans la même conversation — 3 questions en 3 tours. Le Coach (Mistral) a répondu à chaque fois de façon précise en distinguant les molécules et les circuits de prescription. Durée : 1m58s.

### 3 pires

**1. `dca8a1c7` — Contradiction "Oui éligible" pour IMC 25,2 (🔴)**  
Le Coach dit "Oui, tu es éligible au remboursement à 65%" pour quelqu'un avec un IMC de 25,2 — le contraire de la réalité. C'est la pire réponse de la journée : une erreur médicale sur un droit financier qui peut induire l'utilisateur en erreur lors de démarches administratives.

**2. `b9127bdc` — Deux réponses tronquées consécutives + non-progression (🔴)**  
Les deux réponses se coupent à `[[S`. L'utilisateur (IMC 40,6, éligible) s'est vu refuser les suggestions cliquables deux fois de suite. De plus, après avoir dit "je préfère vérifier mon éligibilité", le Coach n'a pas progressé vers la question suivante (comorbidités) mais a répété quasi la même réponse.

**3. `a5f84e85` — Code postal ignoré, réponse copiée-collée (🟠)**  
L'utilisateur a donné "Wegovy 31320" (code postal Haute-Garonne) et le Coach a répété mot pour mot la même réponse générique en redemandant la ville. Mauvaise expérience qui aurait pu briser l'engagement — l'utilisateur a eu la bonne réponse seulement au 3ème message, via Mistral.

---

*Rapport généré automatiquement le 2026-06-20 — Coach IA GLP-1 France v2 (Groq Llama 3.3 70B + Mistral Small)*
