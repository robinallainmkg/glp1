# Rapport Coach IA GLP-1 France — 2026-05-28

> Période analysée : 27 mai 2026 14:44 → 28 mai 2026 (dernières 24h)

---

## KPIs

| Métrique | Valeur |
|---|---|
| Messages totaux | 16 |
| Conversations | 7 |
| Messages utilisateurs | 8 |
| Messages par conversation | 2,3 |
| Durée moyenne | ~37s (6 conv instantanées + 1 à 4min16s) |
| Taux LLM (Groq/Llama) | 87,5% (7/8 réponses) |
| Taux Fallback-v1 | 12,5% (1/8 réponses) |
| Volume vs veille | 16 vs 24 → **↓ -33%** |

### Breakdown par intent

| Intent | Nb |
|---|---|
| Non classifié (null) | 6 |
| prescription | 1 |
| scam:low | 1 |

---

## Ce qui marche bien

- **Réponses factbox concises** : conv `97e0e40f` (prix Wegovy) et `72772734` (dosages Mounjaro) — réponses directes, factuelles, sous 60 mots, lien article pertinent fourni.
- **Lien RAG toujours présent** : sur les 7 conversations, 5 réponses incluent un lien article en rapport avec la question.
- **Gestion du hors-sujet** : conv `ab3d1ffb` ("ça va ?") — le Coach répond sobrement et recentre sans brusquer.
- **Tutoiement/vouvoiement cohérent** : respect du registre de l'utilisateur sur toutes les conversations observées.
- **Deuxième échange scam conv `486dfdc4`** : réponse bien calibrée, lien anti-contrefaçon pertinent, message court.

---

## Problèmes détectés

### P1 — Hallucination RAG sur message géographique ambigu
**Conversation** : `dbc91795-31c0-49dc-b422-cac3e007c424`

| | Contenu |
|---|---|
| Message user | `Coutiches` |
| Réponse Coach | "Pour obtenir des informations sur le coût et les alternatives de l'anneau gastrique, je vous recommande de consulter l'article [Anneau Gastrique Prix CMU...]" |
| Ce qu'il aurait dû répondre | Demander une clarification : "Je n'ai pas compris ta question — peux-tu préciser ce que tu cherches ?" |

**Diagnostic** : "Coutiches" est une commune du Nord (59). Le RAG a probablement matchéé "Coutiches" → proche de "coûts" via le vecteur sémantique → article anneau gastrique. Le LLM n'a pas détecté que le message était un nom propre sans contexte. Gravité : modérée (réponse confuse et inutile, mais pas dangereuse).

---

### P2 — Information erronée sur les prix en pharmacie
**Conversation** : `090b10bd-a67d-42d8-89a5-73e8d7862bd1`

| | Contenu |
|---|---|
| Message user | `bonjour dans quel pharmacie est ce le moins cher pour le munjaro a marseille merci` |
| Réponse Coach | "Le prix de Mounjaro peut varier selon les pharmacies. Je vous conseille de comparer les tarifs dans plusieurs pharmacies à Marseille..." |
| Ce qu'il aurait dû répondre | "En France, le prix des médicaments sur ordonnance est réglementé par l'État : il est identique dans toutes les pharmacies. Mounjaro coûte environ 300-400€/mois (non remboursé). [Prix Mounjaro 2026]" |

**Diagnostic** : Le prix des médicaments sur ordonnance est fixé réglementairement en France (CEPS/ANSM), il ne varie pas entre officines. Conseiller de "comparer" est incorrect et crée une attente fausse. De plus, aucun lien article prix Mounjaro n'a été fourni malgré la question directe.

---

### P3 — Réponse hâtive sur arnaque sans poser de questions (violation règle 6)
**Conversation** : `486dfdc4-0fac-4d45-9adc-8e3150ec5416` — 1er échange

| | Contenu |
|---|---|
| Message user | `J ai commandé des patches Glp1 par carte bancaire quand vais je les.recevoir` |
| Réponse Coach | "Il est probable que vous avez acheté un produit douteux. Les GLP-1 authentiques ne se vendent qu'en pharmacie sur ordonnance..." |
| Ce qu'il aurait dû répondre | "Les GLP-1 médicamenteux n'existent pas sous forme de patches — c'est un format qui n'existe pas pour ces traitements. Sur quel site as-tu commandé ? As-tu déjà reçu le produit ?" |

**Diagnostic** : Le system prompt règle 6 est explicite : "pose d'abord 2-3 questions pour comprendre avant de donner ton avis". La conclusion immédiate ("produit douteux") viole cette règle, même si elle est techniquement justifiée (patches GLP-1 = produit inexistant). La reformulation proposée reste factuelle mais engage le dialogue plutôt que d'imposer un jugement.

---

### P4 — Edge function déployée désynchronisée du repo (CRITIQUE)
**Conversation** : `b7a5d38c-5016-42d5-98ca-bb0e43ef0759`

| | Contenu |
|---|---|
| Message user | `je souhaite le le faire prescrire` |
| Réponse Coach (fallback-v1) | Mention d'Annette.care + code CARE50 + lien UTM `utm_medium=chat_coach` |
| Code repo actuel (fallback prescription) | Redirige vers `annuaire-sante.ameli.fr` — **aucune mention d'Annette** |

**Diagnostic** : La version déployée de la Edge Function `ai-coach` contient encore des références Annette.care dans le fallback `prescription`, alors que le fichier `supabase/functions/ai-coach/index.ts` du repo ne les contient plus. Cela crée une incohérence entre le system prompt actuel (qui interdit explicitement les orientations commerciales : "Tu n'orientes vers AUCUN service commercial ni partenaire prive") et le comportement réel observé. Il faut redéployer la fonction.

---

## Actions recommandées

### Action 1 — Redéployer la Edge Function (urgent)
La version repo est propre. Redéployer pour aligner le comportement réel :
```bash
supabase functions deploy ai-coach --project-ref ywekaivgjzsmdocchvum
```

### Action 2 — Protéger le LLM contre les messages sans sens clair
Ajouter dans le system prompt, après la règle 9 :

```diff
+ 14. Si le message reçu est incompréhensible, trop court (< 3 mots significatifs) ou semble être un nom propre/lieu sans contexte clair, ne devine JAMAIS l'intention. Réponds : "Je n'ai pas compris ta question — peux-tu préciser ce que tu cherches ?"
```

### Action 3 — Corriger l'information sur les prix en pharmacie
Ajouter dans `CONTEXTE IMPORTANT` du system prompt :

```diff
+ - En France, le prix des médicaments sur ordonnance est réglementé par l'État (accord CEPS) et est identique dans toutes les pharmacies. Ne jamais dire qu'il "peut varier selon les pharmacies".
```

### Action 4 — Lien article sur prix Mounjaro dans le RAG
La question `090b10bd` n'a pas reçu de lien malgré la disponibilité d'un article prix. Vérifier que l'article `/collections/glp1-cout/mounjaro-prix/` (ou équivalent) est bien vectorisé dans `article_chunks`.

### Action 5 — Améliorer la concision de la première réponse conv `090b10bd`
La réponse actuelle (54 mots) est dans les limites mais répond à côté. Lier la règle de prix réglementé à l'article pertinent serait un meilleur pattern.

---

## Suggestion de nouveaux articles

| Sujet | Raison |
|---|---|
| "Mounjaro dans les pharmacies à [ville] — où trouver ?" | Question géolocalisée sur la disponibilité (fréquente) |
| "GLP-1 patches, sprays, gélules : les faux produits qui circulent en 2026" | Améliorerait la détection RAG sur les "patches GLP-1" |
| "Prix réglementés des GLP-1 en France : pourquoi c'est le même prix partout" | Répondrait directement à la question `090b10bd` |

---

## Conversations marquantes

### Les 3 meilleures

| # | Conv ID | Pourquoi |
|---|---|---|
| 1 | `72772734` | Question précise → réponse concise + lien dosage Mounjaro. Exemple parfait du pattern attendu. |
| 2 | `97e0e40f` | Prix Wegovy demandé → réponse en 1 phrase + lien. Ultra-efficace. |
| 3 | `486dfdc4` | Conversation la plus engagée (4 msgs, 4min). 2ème échange scam bien géré avec lien anti-contrefaçon. |

### Les 3 pires

| # | Conv ID | Pourquoi |
|---|---|---|
| 1 | `dbc91795` | Hallucination sur "Coutiches" → réponse hors-sujet sur l'anneau gastrique. |
| 2 | `090b10bd` | Information erronée sur la variabilité des prix en pharmacie. |
| 3 | `b7a5d38c` | Fallback déployé obsolète → mention Annette.care incohérente avec le system prompt actuel. |

---

*Rapport généré automatiquement le 2026-05-28 — Agent monitoring Coach IA*
