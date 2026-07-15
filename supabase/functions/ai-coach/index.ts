// supabase/functions/ai-coach/index.ts
// Edge Function : Coach IA GLP-1 v2 — RAG + LLM
//
// POST /functions/v1/ai-coach
// Body : { session_id, message, conversation_id?, page_url? }
// Returns : { response, conversation_id, sources[] }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Configuration ---
const MAX_HISTORY = 6;
const MAX_RAG_CHUNKS = 3;
const RAG_THRESHOLD = 0.72;
const MAX_INPUT_LENGTH = 500;
const MAX_RESPONSE_TOKENS = 700;
const RATE_LIMIT_WINDOW_MIN = 10;
const RATE_LIMIT_WINDOW_MAX = 20;
const RATE_LIMIT_HOURLY_MAX = 60;

const SYSTEM_PROMPT = `Tu es le Coach GLP-1 France, un assistant d'information spécialisé dans les traitements agonistes du récepteur GLP-1 (sémaglutide, tirzépatide, liraglutide, dulaglutide) en France.

TON APPROCHE — UTILE ET ENGAGEANTE :
- Va droit au but dès la première phrase. Ne reformule JAMAIS ce que la personne vient de dire ("D'accord, vous avez arrêté..." est INTERDIT).
- Réponds D'ABORD à la question posée, clairement et factuellement.
- PUIS termine par UNE relance utile qui fait avancer la personne — une offre concrète, jamais un interrogatoire. Exemples : "Veux-tu que je vérifie si tu as droit au remboursement à 65% ?", "Je peux t'aider à trouver le prix près de chez toi — dans quelle ville es-tu ?", "Veux-tu les étapes concrètes pour obtenir ton traitement ?". UNE seule relance, jamais deux. Après une réponse PRIX sur Wegovy ou Mounjaro, enchaîne TOUJOURS sur le remboursement : "Veux-tu voir si tu peux être remboursé à 65% ? Ça réduit beaucoup le coût."
- Si la personne enchaîne, GUIDE-la pas à pas avec des mini-questions courtes (IMC, comorbidités, ville…), une à la fois, sans tout redemander.
- Tu restes calme, rassurant et factuel. Tu ne fais JAMAIS peur inutilement et ne tires pas de conclusions hâtives.
- Quand quelqu'un mentionne un produit douteux, pose UNE question pour comprendre avant de donner ton avis.

RÈGLES ABSOLUES :
1. Tu ne poses JAMAIS de diagnostic médical. Tu ne recommandes JAMAIS un traitement spécifique.
2. Tu renvoies TOUJOURS vers un médecin pour toute décision médicale.
3. Tu ne prescris RIEN. Tu informes uniquement.
4. UNIQUEMENT si quelqu'un décrit des symptômes graves ACTUELS et URGENTS (douleur abdominale sévère, vomissements persistants, pensées suicidaires, réaction allergique), tu dis d'appeler le 15 (SAMU). Sinon, tu orientes calmement vers un médecin.
5. Tu ne vends RIEN. GLP-1 France est un site d'information indépendant.
6. Si quelqu'un mentionne un achat en ligne ou un produit suspect : pose d'abord 2-3 questions pour comprendre (quel produit ? où acheté ? avec ordonnance ?). Ne suppose PAS d'emblée qu'il s'agit d'une arnaque. Donne ensuite une information mesurée selon les réponses.
7. Tu réponds UNIQUEMENT en français.
8. Ton chaleureux, accessible, bienveillant mais professionnel. Tutoiement si l'utilisateur tutoie, vouvoiement sinon. Tu salues ("Bonjour"/"Salut") et te présentes UNIQUEMENT au tout premier message ; ensuite tu réponds directement, sans re-saluer ni répéter le prénom à chaque fois.
9. COURT et CONVERSATIONNEL : 40-80 mots max, JAMAIS un pavé. Comme un vrai chat : une idée à la fois, et tu poses souvent une question pour avancer pas à pas plutôt que de tout déballer. Exception : prix/remboursement, donne les chiffres clés — mais reste bref. ⚠️ Cette règle tient AUSSI au 3e/4e message et quand le contexte fourni est long : tu ne RECOPIES JAMAIS le contexte, tu réponds en 2-3 phrases puis tu proposes d'approfondir. Si tu as plusieurs points (ex : liste de questions à poser), n'en donne que 2-3 et propose le reste.
10. N'ajoute JAMAIS de disclaimer médical en fin de réponse (il y en a déjà un affiché sous le chat).
11. Ne dis JAMAIS "d'après nos articles", "selon nos guides" ou toute formulation qui s'appuie sur "nos" contenus.
12. Ne termine JAMAIS par une phrase promotionnelle.
13. Réponds TOUJOURS à la question directement dans le chat. Ne renvoie JAMAIS uniquement vers un article sans répondre — ça fait quitter le chat. Donne d'abord ta réponse, puis si un article est pertinent, ajoute-le en complément : "Pour aller plus loin : [Titre](URL)". Utilise UNIQUEMENT les URLs fournies dans le contexte RAG. Ne fabrique JAMAIS d'URL.
14. Ne répète JAMAIS une réponse déjà donnée dans la conversation. Si l'utilisateur repose la même question ou insiste, c'est que ta réponse précédente ne l'a pas aidé : apporte un élément NOUVEAU, reformule autrement, ou reconnais honnêtement la limite ("Je n'ai pas le prix pharmacie par pharmacie, mais voici comment le trouver…"). Recopier ta réponse précédente est la pire chose à faire.
15. Quand la personne donne son prénom, recopie-le EXACTEMENT comme elle l'a écrit (même orthographe, ne modifie ni n'ajoute JAMAIS de lettres).

CONTEXTE IMPORTANT :
- Les vrais GLP-1 injectables (Ozempic, Wegovy, Mounjaro, Saxenda, Trulicity, Victoza) ne se vendent QU'en pharmacie sur ordonnance en France
- Il existe des arnaques (faux GLP-1 en gélules vendus en ligne) mais il existe aussi des compléments alimentaires légaux (berbérine, etc.) — ne pas tout mélanger
- Si quelqu'un a acheté un produit douteux et s'inquiète : le rassurer d'abord, poser des questions, puis informer factuellement
- REMBOURSEMENT (FAIT OFFICIEL, PRIORITAIRE) : Wegovy ET Mounjaro sont remboursés à 65% par l'Assurance Maladie pour l'obésité depuis le 15 juin 2026 (arrêté du 23 mai 2026, publié au JO le 28 mai), sous conditions (IMC ≥ 35 avec comorbidité ou IMC ≥ 40, après échec d'une prise en charge nutritionnelle, primo-prescription en CSO/CHU, renouvellement possible par le généraliste). Ozempic reste remboursé 65% pour le diabète T2. ⚠️ CE FAIT EST PRIORITAIRE SUR LE CONTEXTE : si le contexte factuel récupéré indique "non remboursé", "pas encore remboursé", "2e semestre 2026", "négociations en cours" ou similaire, c'est PÉRIMÉ — ignore-le et applique le fait officiel ci-dessus. Ne dis JAMAIS que Wegovy ou Mounjaro ne sont pas remboursés, même si le contexte parle de "perte de poids" : ils SONT remboursés à 65% pour l'obésité (sous conditions) depuis le 15 juin 2026. Ne réponds jamais simplement "non remboursé" pour ces deux médicaments — précise toujours le remboursement obésité.
- Prix : Ozempic ~77€/boîte (remboursé 65% diabète T2). Wegovy ~147-350€/mois selon dosage (remboursé 65% obésité depuis le 15 juin 2026). Mounjaro ~176-434€/mois selon dosage (remboursé 65% obésité depuis le 15 juin 2026). Saxenda ~270€/mois (non remboursé).
- IMPORTANT : Quand un patient demande le remboursement, donne une réponse COMPLÈTE et NUANCÉE : mentionne les conditions d'éligibilité (IMC), le parcours (prescription initiale en CSO/CHU), le taux (65%), et conseille de vérifier auprès de sa mutuelle pour le reste à charge. Ne sois jamais trop affirmatif sans nuance.
- Si la personne est victime d'arnaque avérée : orienter calmement vers signal.conso.gouv.fr et pré-plainte-en-ligne.gouv.fr

ORIENTATION MÉDICALE (PRESCRIPTION / MÉDECIN / SUIVI) :
- Pour une prescription ou un médecin : oriente vers le médecin traitant, un endocrinologue ou un médecin de l'obésité. Pour la primo-prescription ouvrant droit au remboursement obésité, elle doit être faite dans un centre spécialisé de l'obésité (CSO) ou un CHU ; le renouvellement peut ensuite se faire chez le généraliste. Annuaire officiel : annuaire-sante.ameli.fr.
- ⚠️ NE DIS JAMAIS que le médecin traitant peut INITIER la primo-prescription du remboursement obésité, ni "faire le dossier" de primo-prescription : c'est FAUX. La primo-prescription se fait en CSO/CHU ; le généraliste ne fait que RENOUVELER ensuite. Pas de "depuis juin 2025 le médecin traitant peut initier" — c'est inexact.
- Tu es indépendant : tu ne touches aucune commission et ne fais la promotion d'AUCUN service. Tu peux toutefois INFORMER de façon neutre et objective sur les options existantes (voir "PRESTATAIRES EN LIGNE" ci-dessous), sans en recommander une plutôt qu'une autre.

PRESTATAIRES EN LIGNE / TÉLÉCONSULTATION (tu CONNAIS le paysage et tu en parles de façon NEUTRE et OBJECTIVE — aucune promotion, aucun dénigrement) :
- Un vrai GLP-1 injectable ne s'obtient JAMAIS "sans ordonnance" : il faut une prescription d'un médecin inscrit à l'Ordre, après une vraie consultation (en cabinet OU en téléconsultation).
- Voie classique : médecin traitant, endocrinologue, médecin de l'obésité ; primo-prescription en CSO/CHU pour ouvrir le remboursement obésité.
- Voie téléconsultation : des plateformes mettent en relation avec des médecins français à distance. Exemples connus du paysage français : Qare, Livi, Hellocare, Doctolib. Cite-les comme EXEMPLES si on te le demande, sans en privilégier une et sans promettre une ordonnance (le médecin peut refuser si ce n'est pas justifié).
- Si on te demande "est-ce fiable ?", donne les critères d'un service sérieux : (1) vraie téléconsultation avec un médecin identifiable inscrit à l'Ordre ; (2) ordonnance délivrée seulement si médicalement justifié ; (3) médicament retiré en pharmacie PHYSIQUE, jamais vendu par le site lui-même.
- ⚠️ VENTE EN LIGNE INTERDITE : en France, les pharmacies en ligne (même agréées) ne peuvent vendre QUE des médicaments SANS ordonnance. Les GLP-1 sont à prescription obligatoire → ils ne peuvent JAMAIS être achetés en ligne légalement. Ne suggère JAMAIS une "pharmacie en ligne", une "liste de pharmacies en ligne" ou un achat sur internet pour un GLP-1. Tout site qui en vend en ligne est illégal (contrefaçons probables).
- 🚩 Arnaque (à signaler calmement, sans dramatiser) : un site qui VEND directement de l'Ozempic/Wegovy/Mounjaro, "sans ordonnance", à prix cassé, paiement crypto/virement, sans aucune consultation = illégal et dangereux (contrefaçons). Ce ne sont PAS des prestataires sérieux.

FLUX "SUIS-JE ÉLIGIBLE AU REMBOURSEMENT ?" (à PROPOSER dès qu'on parle de prix, de remboursement, ou de comment commencer) :
- ⚠️ Ne propose ce flux QU'UNE SEULE FOIS par conversation. Si l'utilisateur a dit "non", "plus tard" ou l'a ignoré, ne répète JAMAIS la proposition.
- ⚠️ Si quelqu'un demande "suis-je éligible ?" : ne liste JAMAIS les critères en bloc — LANCE le test tout de suite. Réponse COURTE + demande sa 1re info : "Vérifions ensemble ! Quel est ton poids et ta taille ?" (pour calculer l'IMC). Sinon, propose-le : "Le remboursement à 65% s'applique depuis le 15 juin 2026. Veux-tu qu'on vérifie ton éligibilité en 2-3 questions ?"
- Si oui, collecte UNE info à la fois, sans tout redemander : (1) poids + taille → calcule l'IMC ; (2) comorbidités (diabète T2, hypertension, apnée du sommeil, etc.) ; (3) un suivi nutritionnel a-t-il déjà été tenté ?
- ⚠️ SEUILS STRICTS — NE JAMAIS DIRE "ÉLIGIBLE" SI LES CRITÈRES NE SONT PAS REMPLIS :
  • IMC < 30 → "Le remboursement cible l'obésité (IMC ≥ 35 avec comorbidité ou ≥ 40). Ton IMC est en dessous des seuils. Parles-en à ton médecin pour d'autres options."
  • IMC 30-34.9 SANS comorbidité confirmée → "Ton IMC est de X, juste en dessous du seuil de 35. Le remboursement nécessite un IMC ≥ 35 avec comorbidité ou ≥ 40. Parles-en à ton médecin — il évaluera ta situation complète."
  • IMC 30-34.9 AVEC comorbidité → "Pas encore éligible au remboursement (il faut IMC ≥ 35 avec comorbidité), mais ton médecin peut évaluer d'autres options. Consulte en CSO/CHU."
  • IMC 35-39.9 SANS comorbidité → "Ton IMC est de X. Le remboursement à 65% nécessite aussi au moins une comorbidité (diabète, hypertension, apnée du sommeil…). As-tu un de ces problèmes ?"
  • IMC 35-39.9 AVEC comorbidité → ÉLIGIBLE. "Tu sembles éligible au remboursement à 65% ! Prochaine étape : prendre RDV dans un CSO ou CHU pour la primo-prescription."
  • IMC ≥ 40 → ÉLIGIBLE (même sans comorbidité). "Avec un IMC de X, tu es éligible au remboursement à 65%. Prochaine étape : prendre RDV dans un CSO ou CHU."
- Ne dis JAMAIS "tu es éligible" pour un IMC < 35. C'est une ERREUR GRAVE qui crée de faux espoirs.
- Termine en proposant le suivi dans le temps (voir CONVERSION).

REQUÊTES LOCALES (prix / pharmacie / médecin près de chez moi) — TRÈS FRÉQUENT :
- Ne réponds JAMAIS "comparez vous-même" ou "appelez les pharmacies". C'est la 1re cause d'abandon.
- Pour un prix ou une pharmacie proche : oriente vers la carte des prix du site → [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/), et demande la ville pour cibler. Ne dis JAMAIS "je ne peux pas donner une pharmacie spécifique" : donne TOUJOURS le lien de la carte des prix et demande la ville. C'est la 1re cause d'abandon.
- Pour un médecin proche : annuaire-sante.ameli.fr (+ un CSO/CHU pour la primo-prescription du remboursement).

CONVERSION — DOSSIER GLP-1 PERSONNALISÉ (4,99€) :
- C'est le PRODUIT PRINCIPAL. Aide vraiment d'abord, puis propose le dossier au BON MOMENT.
- QUAND proposer : dès que tu as collecté poids + taille + comorbidités (= tu peux calculer l'IMC et donner un verdict), OU quand la personne demande les étapes concrètes pour commencer.
- COMMENT proposer (EXACTEMENT cette formulation, adaptée au tutoiement/vouvoiement) : "D'ailleurs, je peux te préparer ton **Dossier GLP-1 personnalisé** : un document complet avec ton verdict d'éligibilité, la checklist pour ton RDV médecin, les CSO/CHU près de chez toi, et l'estimation de ton reste à charge — tout prêt à imprimer pour ton médecin. C'est 4,99€."
- Puis ajoute en fin de réponse : [[SUGGESTIONS]] Oui, je veux mon dossier | Plus tard
- Si la personne dit OUI → collecte UNIQUEMENT ce qui MANQUE. La plupart des infos (poids, taille, comorbidités) ont déjà été données pendant le test d'éligibilité : NE LES REDEMANDE JAMAIS. En général il ne manque que : (1) prénom, (2) ville (pour le CSO le plus proche). Pose ces 2 questions EN UNE SEULE FOIS : "Super ! Il me faut juste ton prénom et ta ville, et ton dossier est prêt." Le traitement envisagé est OPTIONNEL (déduis-le de la conversation, sinon "non précisé"). Quand tu as prénom + ville, dis "Ton dossier est prêt !" et le système affichera le bouton de paiement. OBJECTIF : passer du OUI au dossier prêt en 1-2 échanges MAXIMUM.
- Quand tu as TOUTES les infos réelles, termine ta réponse par ce tag (le front-end le détecte) : [[DOSSIER_READY]] suivi du JSON avec les VRAIES valeurs de la conversation. Exemple de format : [[DOSSIER_READY]] {"prenom":"Marie","poids_kg":85,"taille_cm":168,"comorbidites":["diabète T2"],"ville":"Lyon","suivi_nutritionnel":true,"traitement_souhaite":"Wegovy"}. RÈGLES ABSOLUES POUR CE TAG : (1) N'émets [[DOSSIER_READY]] QUE si le prénom a été LITTÉRALEMENT ÉCRIT par l'utilisateur dans la conversation — s'il n'a pas encore donné son prénom, demande-le d'abord sans déclencher le tag. (2) poids_kg et taille_cm doivent être des NOMBRES issus de la conversation (ex: 85, 168) — jamais une variable, une lettre seule ou un point d'interrogation. (3) ville doit être le nom de la ville réelle dite par l'utilisateur. (4) Si l'une de ces valeurs est inconnue → NE PAS déclencher le tag, demander l'info manquante d'abord.
- NE propose le dossier qu'UNE SEULE FOIS par conversation. Si la personne dit "plus tard" ou ignore, n'insiste pas.
- Formule-le comme un SERVICE utile pour préparer son RDV, jamais comme une pub.

SEGMENTS DE VISITEURS (adapter la réponse) :
- ~28% sont des victimes d'arnaques (ont acheté de faux GLP-1 en ligne, souvent 29-80 EUR). Être empathique, ne pas juger, proposer les recours.
- ~16% ont une intention d'achat directe. Expliquer le parcours légal (médecin → ordonnance → pharmacie) et orienter vers un médecin pour la prescription.
- ~10% ont des questions médicales (diabète, compatibilité). Orienter vers le médecin après information factuelle.
- Le reste sont des curieux qui cherchent à comprendre les GLP-1.

STYLE — CHAT SYMPA, PAS UN ARTICLE (TRÈS IMPORTANT) :
- Parle comme un humain dans un chat : court, chaleureux, une idée à la fois. Tu POSES des questions pour comprendre avant de tout expliquer.
- À la TOUTE FIN de CHAQUE réponse, propose des choix cliquables, au format EXACT (RIEN après cette ligne, et ne mentionne JAMAIS ce format dans le texte visible) :
  • Question à PLUSIEURS réponses possibles (symptômes, objectifs, ce qui te concerne…) → [[OPTIONS]] Nausées | Diarrhée | Fatigue | Aucun
  • Question à réponse UNIQUE (oui/non, étape suivante) → [[SUGGESTIONS]] Oui, vérifions | Plus tard
- 2 à 5 choix, COURTS (max 4 mots), formulés du point de vue de l'utilisateur. Utilise [[OPTIONS]] OU [[SUGGESTIONS]], jamais les deux dans la même réponse.`;

// --- Fallback v1 (rules engine) ---
const INTENT_PATTERNS: Array<{ intent: string; pattern: RegExp; response: string }> = [
  {
    intent: 'scam',
    pattern: /arnaque|fraud|escroqu|contref|fak/i,
    response: "Je comprends votre inquiétude. Pour mieux vous aider, j'aurais besoin de quelques détails :\n\n• Quel produit avez-vous acheté exactement ?\n• Sur quel site ou plateforme ?\n• Avez-vous déjà reçu le produit ?\n\nSi vous pensez avoir été victime d'une arnaque, sachez que vous pouvez signaler sur signal.conso.gouv.fr et faire opposition sur votre carte bancaire."
  },
  {
    intent: 'selling',
    pattern: /vendez|achet|command[eé]|en stock|livr(aison|er)/i,
    response: "GLP-1 France est un site d'information indépendant, nous ne vendons aucun produit.\n\nLes traitements GLP-1 injectables sont des médicaments sur ordonnance. Le parcours :\n1. Consultation médecin traitant ou endocrinologue\n2. Ordonnance si indiqué médicalement\n3. Achat en pharmacie uniquement\n\nVous cherchez un traitement en particulier ? Je peux vous informer."
  },
  {
    intent: 'price',
    pattern: /prix|co[uû]t|rembours|tarif|cher|combien/i,
    response: "Prix des traitements GLP-1 en France (mis à jour juin 2026) :\n\n💊 Ozempic : ~77€/boîte (remboursé 65% pour diabète T2)\n💊 Wegovy : ~147-350€/mois selon dosage (remboursé 65% depuis le 15 juin 2026 pour obésité — IMC ≥ 35 avec comorbidité ou ≥ 40)\n💊 Mounjaro : ~176-434€/mois selon dosage (remboursé 65% depuis le 15 juin 2026, mêmes conditions)\n💊 Saxenda : ~270€/mois (non remboursé)\n\nLa prescription initiale doit être faite dans un centre spécialisé (CSO/CHU). Vérifiez aussi auprès de votre mutuelle pour le reste à charge."
  },
  {
    intent: 'device',
    pattern: /stylo|inject|piqu|marche pas|kwikpen|flextouch|bloqu/i,
    response: "Si votre stylo injecteur ne fonctionne pas, vérifiez :\n\n1. ✅ L'aiguille est bien vissée\n2. ✅ La dose est sélectionnée (pas à 0)\n3. ✅ La cartouche n'est pas vide\n4. ✅ Conservation au frigo (2-8°C avant ouverture)\n5. ✅ Pas expiré\n\nSi le problème persiste, contactez votre pharmacien ou le laboratoire fabricant. Ne forcez jamais le mécanisme."
  },
  {
    intent: 'diabetes',
    pattern: /diab[eè]t|glyc[eé]mi|insuline|type 2|hba1c/i,
    response: "Plusieurs GLP-1 sont spécifiquement indiqués pour le diabète de type 2 :\n\n• Ozempic (sémaglutide) — le plus prescrit\n• Trulicity (dulaglutide)\n• Victoza (liraglutide)\n\nLa décision dépend de votre traitement actuel et de votre HbA1c. Consultez votre endocrinologue pour adapter votre traitement."
  },
  {
    intent: 'diet',
    pattern: /r[eé]gime|nutrition|aliment|manger|repas|prot[eé]ine/i,
    response: "Un régime restrictif n'est PAS recommandé avec un traitement GLP-1. Privilégiez :\n\n🥩 Apport suffisant en protéines (préserver la masse musculaire)\n🍽️ Aliments faciles à digérer (nausées fréquentes au début)\n💧 Hydratation importante\n🥗 Petites portions, repas fréquents\n\nPour un suivi personnalisé, parlez-en à votre médecin ou à un diététicien. Vous pouvez aussi me poser vos questions au quotidien — voulez-vous des idées de repas adaptés ?"
  },
  {
    intent: 'weight',
    pattern: /perte.*poids|maigri|kilos?|pas.*perdu|combien.*perd/i,
    response: "Les résultats varient selon les personnes :\n\n📅 Semaines 1-4 : premiers effets (réduction appétit)\n📅 Mois 1-3 : perte progressive (2-5 kg/mois en moyenne)\n📅 Mois 3-6 : résultats les plus significatifs\n\nEn moyenne, les études montrent une perte de 10-15% du poids initial sur 12-18 mois.\n\nSi après 3 mois sans résultat, parlez-en à votre médecin (dose à ajuster ?)."
  },
  {
    intent: 'prescription',
    pattern: /ordonnance|prescri|m[eé]decin|consult|obtenir|comment.*avoir|sp[eé]cialiste/i,
    response: "Les traitements GLP-1 (Ozempic, Wegovy, Mounjaro…) sont délivrés uniquement sur ordonnance. Le parcours est simple :\n\n1. Consultation avec votre médecin traitant, un endocrinologue ou un médecin de l'obésité.\n2. Remboursement obésité (65 %, depuis le 15 juin 2026) : la première prescription doit être réalisée dans un centre spécialisé de l'obésité (CSO) ou un CHU, puis le renouvellement peut se faire chez votre généraliste.\n3. Délivrance en pharmacie, sur présentation de l'ordonnance.\n\nPour trouver un praticien près de chez vous : annuaire-sante.ameli.fr.\n\nSouhaitez-vous qu'on vérifie ensemble, en 2-3 questions, si vous êtes éligible au remboursement ?"
  },
  {
    intent: 'side_effects',
    pattern: /effet|secondaire|naus[eé]|vomis|diarrh|constip|fatigue|mal\s*(de|au)|douleur|vue|vision|cheveu|chute|peau/i,
    response: "Les effets secondaires les plus fréquents des GLP-1 sont digestifs (nausées, vomissements, diarrhée), surtout en début de traitement ou lors des montées de dose.\n\nIls s'atténuent généralement en 2-4 semaines. Si un effet secondaire vous inquiète ou persiste, parlez-en à votre médecin — il pourra ajuster la dose ou le traitement."
  },
  {
    intent: 'availability',
    pattern: /disponible|rupture|stock|trouver|pharmacie|o[uù].*acheter|pas.*trouv/i,
    response: "Les GLP-1 sont disponibles en pharmacie sur ordonnance. Certains traitements connaissent des tensions d'approvisionnement ponctuelles.\n\nSi votre pharmacie est en rupture, demandez-lui de vérifier la disponibilité chez ses grossistes ou contactez d'autres pharmacies du secteur. Votre médecin peut aussi adapter la prescription si nécessaire."
  }
];

// --- Doctor search detection ---
const DOCTOR_PATTERNS = [
  /m[eé]decin/i,
  /docteur/i,
  /endocrinologue/i,
  /nutritionniste/i,
  /sp[eé]cialiste/i,
  /consultation/i,
  /ordonnance/i,
  /prescri/i,
  /qui (peut|pourrait) me prescrire/i,
  /o[uù] (trouver|consulter|aller|voir)/i,
  /pas de m[eé]decin/i,
  /recommander.*m[eé]decin/i,
  /centre.*ob[eé]sit/i,
  /CSO/i,
];

const DEPT_PATTERNS: Array<{ pattern: RegExp; code: string }> = [
  // Direct department codes (2 or 3 digits)
  { pattern: /\b(0[1-9]|[1-9][0-9]|2[AB]|97[1-6])\b/, code: '$0' },
  // Postal codes (5 digits) — extract first 2 digits
  { pattern: /\b(0[1-9]\d{3}|[1-8]\d{4}|9[0-5]\d{3}|97[1-6]\d{2})\b/, code: '$0' },
];

function detectDoctorIntent(message: string, history: Array<{ role: string; content: string }>): boolean {
  // Check current message
  if (DOCTOR_PATTERNS.some(p => p.test(message))) return true;
  // Check if last assistant message asked for location (department OR city name)
  const lastAssistant = history.filter(m => m.role === 'assistant').pop();
  if (lastAssistant && /d[eé]partement|code postal|r[eé]gion|localisation|quelle ville|dans quelle/i.test(lastAssistant.content)) {
    // Accept numeric dept code OR a city/place name (letters, spaces, hyphens, apostrophes)
    if (/^\d{2,5}$/.test(message.trim())) return true;
    if (/^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\-']{1,40}$/.test(message.trim())) return true;
  }
  return false;
}

function extractDepartmentCode(message: string): string | null {
  // Try postal code first (5 digits)
  const postalMatch = message.match(/\b(0[1-9]\d{3}|[1-8]\d{4}|9[0-5]\d{3}|97[1-6]\d{2})\b/);
  if (postalMatch) {
    const code = postalMatch[1].substring(0, 2);
    // Handle Corsica (20 → 2A/2B, but we'll use 20)
    return code === '20' ? '20' : code;
  }
  // Try 2-digit department code
  const deptMatch = message.match(/\b(0[1-9]|[1-9][0-9]|2[AB])\b/);
  if (deptMatch) return deptMatch[1];
  // Try 3-digit (DOM-TOM)
  const domMatch = message.match(/\b(97[1-6])\b/);
  if (domMatch) return domMatch[1];
  return null;
}

// --- IMC extraction (garde-fou éligibilité) ---
// Le LLM a déjà annoncé "éligible" à des IMC < 35 malgré les seuils du prompt.
// On calcule donc l'IMC côté serveur à partir des messages user et on injecte
// le verdict correct dans le contexte : le modèle n'a plus à faire le calcul.
function extractImc(userTexts: string[]): { imc: number; poids: number; taille: number } | null {
  let poids: number | null = null;
  let taille: number | null = null;
  for (const t of userTexts) {
    if (taille === null) {
      // "1m75", "1,75", "1.75", "1 m 75"
      const m1 = t.match(/\b[12]\s*[m,.]\s*(\d{2})\b/i);
      // "175 cm"
      const m2 = t.match(/\b(1[2-9]\d|2[0-2]\d)\s*cm\b/i);
      if (m1) taille = (t.match(/\b(2)\s*[m,.]/) ? 200 : 100) + parseInt(m1[1], 10);
      else if (m2) taille = parseInt(m2[1], 10);
    }
    if (poids === null) {
      // "135 kg", "105 kilos"
      const p1 = t.match(/\b(\d{2,3})(?:[,.]\d)?\s*(?:kg|kilos?)\b/i);
      if (p1) poids = parseInt(p1[1], 10);
      else if (taille !== null) {
        // "1m75 135" — nombre nu après la taille (exclut âges "46 ans" et la taille elle-même)
        const stripped = t.replace(/\b[12]\s*[m,.]\s*\d{2}\b/i, ' ').replace(/\b\d{2,3}\s*(ans|cm)\b/gi, ' ');
        const p2 = stripped.match(/\b(\d{2,3})\b/);
        if (p2) {
          const n = parseInt(p2[1], 10);
          if (n >= 40 && n <= 300) poids = n;
        }
      }
    }
    if (poids !== null && taille !== null) break;
  }
  if (poids === null || taille === null || taille < 120 || taille > 230) return null;
  const imc = poids / Math.pow(taille / 100, 2);
  if (imc < 10 || imc > 90) return null;
  return { imc, poids, taille };
}

function buildImcVerdictContext(imcData: { imc: number; poids: number; taille: number }): string {
  const { imc, poids, taille } = imcData;
  let verdict: string;
  if (imc >= 40) {
    verdict = "ÉLIGIBLE au remboursement 65% (IMC ≥ 40, comorbidité non requise), sous réserve d'un échec de prise en charge nutritionnelle. Prochaine étape : primo-prescription en CSO/CHU.";
  } else if (imc >= 35) {
    verdict = "éligible UNIQUEMENT si au moins une comorbidité est confirmée (diabète T2, hypertension, apnée du sommeil…). Sans comorbidité → NON éligible. Demande d'abord les comorbidités avant tout verdict.";
  } else {
    verdict = "NON ÉLIGIBLE au remboursement (IMC < 35, seuils : IMC ≥ 35 avec comorbidité ou IMC ≥ 40). INTERDICTION ABSOLUE de dire \"tu es éligible\" ou \"vous êtes éligible\". Dis-le avec tact et oriente vers le médecin pour évaluer d'autres options.";
  }
  return `\n\n⚠️ VERDICT CALCULÉ PAR LE SYSTÈME (fiable, PRIORITAIRE sur tout autre calcul) : poids ${poids} kg, taille ${taille} cm → IMC = ${imc.toFixed(1)}. Verdict remboursement : ${verdict} Ta réponse DOIT être cohérente avec ce verdict — ne recalcule pas toi-même.`;
}

// --- Scam signal detection ---
const SCAM_PATTERNS = [
  { pattern: /\b(gelule|comprime|capsule|pilule)s?\b.*\b(glp|ozempic|wegovy|semaglutide|mounjaro)\b/i, signal: 'fake_form' },
  { pattern: /\b(ozempic|wegovy|semaglutide|mounjaro|saxenda).*\b(gelule|comprime|capsule|pilule)s?\b/i, signal: 'fake_form' },
  { pattern: /\b(achete?r?|command[eé]|pay[eé]|re[cç]u)\b.*\b(en ligne|sur internet|sur (un )?site|par courrier)\b/i, signal: 'online_purchase' },
  { pattern: /\b(site|lien|url)\b.*\b(ozempic|wegovy|mounjaro|glp|semaglutide)\b/i, signal: 'suspicious_url' },
  { pattern: /\b(arnaque|escroqu|fraud|contrefaçon|faux|fake|douteux|louche|suspect)\b/i, signal: 'explicit_scam' },
  { pattern: /\b(pas re[cç]u|jamais livr[eé]|rembourse|litige|plainte)\b/i, signal: 'post_scam' },
  { pattern: /\b\d{2,3}\s*€?\s*(euros?|eur)\b.*\b(achete|paye|coute)\b/i, signal: 'suspicious_price' },
  { pattern: /\bsans ordonnance\b/i, signal: 'no_prescription' },
];

function detectScamSignals(message: string): { isScamRelated: boolean; signals: string[]; severity: 'none' | 'low' | 'high' } {
  const signals: string[] = [];
  for (const { pattern, signal } of SCAM_PATTERNS) {
    if (pattern.test(message)) signals.push(signal);
  }
  if (signals.length === 0) return { isScamRelated: false, signals: [], severity: 'none' };
  const highSeverity = signals.some(s => ['fake_form', 'post_scam', 'explicit_scam'].includes(s));
  return { isScamRelated: true, signals, severity: highSeverity ? 'high' : 'low' };
}

function classifyAndRespond(message: string): { intent: string; response: string } {
  const lower = message.toLowerCase();
  for (const { intent, pattern, response } of INTENT_PATTERNS) {
    if (pattern.test(lower)) {
      return { intent, response };
    }
  }
  return {
    intent: 'general',
    response: "Je n'ai pas pu traiter votre question en détail pour le moment. Pouvez-vous la reformuler ou préciser votre situation ? Par exemple :\n\n• Quel traitement vous concerne (Ozempic, Wegovy, Mounjaro...) ?\n• S'agit-il d'un effet secondaire, d'un prix, d'une ordonnance ?\n\nJe ferai de mon mieux pour vous aider."
  };
}

// --- CORS headers ---
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
};

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// --- Main handler ---
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "POST uniquement" }, 405);
  }

  try {
    const { session_id, message, conversation_id, page_url, user_id } = await req.json();

    // --- Input validation ---
    if (!session_id || typeof session_id !== "string") {
      return jsonResponse({ error: "session_id requis" }, 400);
    }
    if (!message || typeof message !== "string") {
      return jsonResponse({ error: "message requis" }, 400);
    }
    const cleanMessage = message.trim().slice(0, MAX_INPUT_LENGTH);
    if (cleanMessage.length === 0) {
      return jsonResponse({ error: "message vide" }, 400);
    }

    // --- Supabase client (service role) ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- Rate limiting (session + IP) ---
    const now = new Date();
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    // Check IP-level rate limit (stricter, prevents localStorage bypass)
    if (clientIp !== "unknown") {
      const ipKey = `ip:${clientIp}`;
      const { data: ipRate } = await supabase
        .from("coach_rate_limits")
        .select("*")
        .eq("session_id", ipKey)
        .single();

      if (ipRate) {
        const ipHourlyElapsed = (now.getTime() - new Date(ipRate.hourly_start).getTime()) / 60000;
        let ipHourlyCount = ipRate.hourly_count;
        let ipHourlyStart = ipRate.hourly_start;
        if (ipHourlyElapsed > 60) { ipHourlyCount = 0; ipHourlyStart = now.toISOString(); }
        if (ipHourlyCount >= RATE_LIMIT_HOURLY_MAX) {
          return jsonResponse({ error: "rate_limit", message: "Limite horaire atteinte. Réessayez plus tard." }, 429);
        }
        await supabase.from("coach_rate_limits").update({
          hourly_count: ipHourlyCount + 1, hourly_start: ipHourlyStart,
          message_count: (ipRate.message_count || 0) + 1,
        }).eq("session_id", ipKey);
      } else {
        await supabase.from("coach_rate_limits").insert({
          session_id: ipKey, message_count: 1, window_start: now.toISOString(),
          hourly_count: 1, hourly_start: now.toISOString(),
        });
      }
    }

    // Session-level rate limit
    const { data: rateData } = await supabase
      .from("coach_rate_limits")
      .select("*")
      .eq("session_id", session_id)
      .single();

    if (rateData) {
      const windowStart = new Date(rateData.window_start);
      const hourlyStart = new Date(rateData.hourly_start);
      const windowElapsed = (now.getTime() - windowStart.getTime()) / 60000;
      const hourlyElapsed = (now.getTime() - hourlyStart.getTime()) / 60000;

      let newCount = rateData.message_count;
      let newWindowStart = rateData.window_start;
      let newHourlyCount = rateData.hourly_count;
      let newHourlyStart = rateData.hourly_start;

      if (windowElapsed > RATE_LIMIT_WINDOW_MIN) {
        newCount = 0;
        newWindowStart = now.toISOString();
      }
      if (hourlyElapsed > 60) {
        newHourlyCount = 0;
        newHourlyStart = now.toISOString();
      }

      if (newCount >= RATE_LIMIT_WINDOW_MAX) {
        return jsonResponse({ error: "rate_limit", message: "Trop de messages. Réessayez dans quelques minutes." }, 429);
      }
      if (newHourlyCount >= RATE_LIMIT_HOURLY_MAX) {
        return jsonResponse({ error: "rate_limit", message: "Limite horaire atteinte. Réessayez plus tard." }, 429);
      }

      await supabase
        .from("coach_rate_limits")
        .update({
          message_count: newCount + 1,
          window_start: newWindowStart,
          hourly_count: newHourlyCount + 1,
          hourly_start: newHourlyStart,
        })
        .eq("session_id", session_id);
    } else {
      await supabase.from("coach_rate_limits").insert({
        session_id,
        message_count: 1,
        window_start: now.toISOString(),
        hourly_count: 1,
        hourly_start: now.toISOString(),
      });
    }

    // --- Daily message limit (anonymous = 5/day by IP, free registered = 3/day, premium = unlimited) ---
    let dailyRemaining: number | null = null;
    let isPremiumUser = false;
    let hasConsultation = false;
    let premiumProfile: any = null;

    if (!user_id && clientIp !== "unknown") {
      // Anonymous users: 12 messages/day by IP.
      // ⚠️ Ne PAS redescendre sous ~10 : le flux éligibilité + collecte Dossier
      // demande 8-10 messages user — à 5/jour le funnel Dossier était
      // mathématiquement impossible à compléter (0 [[DOSSIER_READY]] en 30 jours).
      const ANON_DAILY_LIMIT = 12;
      const today = new Date().toISOString().split("T")[0];
      const ipDailyKey = `daily:${clientIp}:${today}`;
      const { data: ipDaily } = await supabase
        .from("coach_rate_limits")
        .select("message_count")
        .eq("session_id", ipDailyKey)
        .single();

      const ipDayCount = ipDaily?.message_count || 0;
      if (ipDayCount >= ANON_DAILY_LIMIT) {
        return jsonResponse({
          error: "daily_limit",
          message: "Vous avez utilisé vos 5 messages gratuits du jour. Créez un compte gratuit pour continuer, ou passez à Premium pour des échanges illimités !",
          upgrade_url: "/tarifs/",
          signup_url: "/mon-espace/",
          remaining: 0,
        }, 429);
      }

      await supabase.from("coach_rate_limits").upsert(
        { session_id: ipDailyKey, message_count: ipDayCount + 1, window_start: now.toISOString(), hourly_count: 0, hourly_start: now.toISOString() },
        { onConflict: "session_id" }
      );
      dailyRemaining = ANON_DAILY_LIMIT - 1 - ipDayCount;
    }

    if (user_id) {
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("is_subscribed, subscription_status, subscription_period_end, trial_end")
        .eq("user_id", user_id)
        .single();

      // Premium = abonnement actif, OU trial/canceled dont la periode payee court encore.
      // (Un trial expire NE donne PLUS l'acces premium — fix du bug "premium gratuit a vie".)
      const periodEndFuture = userProfile?.subscription_period_end
        && new Date(userProfile.subscription_period_end) > new Date();
      const isPremium = userProfile && (
        userProfile.subscription_status === "active" ||
        ((userProfile.subscription_status === "trialing" || userProfile.subscription_status === "canceled") && periodEndFuture)
      );
      isPremiumUser = !!isPremium;

      const isInTrial = userProfile?.trial_end && new Date(userProfile.trial_end) > new Date();
      if (isInTrial) isPremiumUser = true;

      // Consultation privée active (one-shot 3€) → accès illimité + mode consultation
      const { data: activeConsult } = await supabase
        .from("consultations")
        .select("id")
        .eq("user_id", user_id)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .limit(1)
        .maybeSingle();
      hasConsultation = !!activeConsult;

      // Fetch full profile for premium / consultation personalization
      if (isPremiumUser || hasConsultation) {
        const { data: fullProfile } = await supabase
          .from("user_profiles")
          .select("prenom, treatment, current_dose, weight_current, weight_goal, sport_level, diet_type, height_cm, age, gender")
          .eq("user_id", user_id)
          .single();
        premiumProfile = fullProfile;
      }

      if (!isPremium && !isInTrial && !hasConsultation) {
        // Free tier: enforce 3 messages/day
        const today = new Date().toISOString().split("T")[0];
        const { data: dailyCount } = await supabase
          .from("daily_message_counts")
          .select("message_count")
          .eq("user_id", user_id)
          .eq("date", today)
          .single();

        const count = dailyCount?.message_count || 0;
        if (count >= 3) {
          return jsonResponse({
            error: "daily_limit",
            message: "Vous avez atteint la limite de 3 messages gratuits par jour. Passez à Coach Premium pour des échanges illimités !",
            upgrade_url: "/tarifs/",
            remaining: 0,
          }, 429);
        }

        // Increment daily count
        await supabase.from("daily_message_counts").upsert(
          { user_id, date: today, message_count: count + 1 },
          { onConflict: "user_id,date" }
        );
        dailyRemaining = 2 - count; // remaining after this message
      }
    }
    // Non-authenticated users: existing session/IP rate limits apply (above)

    // --- Conversation management ---
    let convId = conversation_id;
    if (!convId) {
      const { data: existingConv } = await supabase
        .from("coach_conversations")
        .select("id")
        .eq("session_id", session_id)
        .order("last_message_at", { ascending: false })
        .limit(1)
        .single();

      if (existingConv) {
        convId = existingConv.id;
      } else {
        const { data: newConv } = await supabase
          .from("coach_conversations")
          .insert({
            session_id,
            page_url: page_url || null,
            user_agent: req.headers.get("user-agent") || null,
            user_id: user_id || null,
          })
          .select("id")
          .single();
        convId = newConv?.id;
      }
    }

    // Update last_message_at
    await supabase
      .from("coach_conversations")
      .update({ last_message_at: now.toISOString() })
      .eq("id", convId);

    // --- Try LLM path (Groq + RAG) ---
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const mistralKey = Deno.env.get("MISTRAL_API_KEY");

    if (!groqKey || !mistralKey) {
      // No API keys configured — use fallback
      console.warn("API keys not configured, using fallback v1");
      const fallback = classifyAndRespond(cleanMessage);
      await saveMessages(supabase, convId, session_id, cleanMessage, fallback.response, fallback.intent, "fallback-v1", null, null, user_id);
      return jsonResponse({ response: fallback.response, conversation_id: convId, sources: [], model: "fallback-v1" });
    }

    // --- Scam detection layer ---
    const scamSignals = detectScamSignals(cleanMessage);

    try {
      // --- 1. Load history (toujours disponible, indépendant du RAG) ---
      const { data: history } = await supabase
        .from("coach_messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: false })
        .limit(isPremiumUser ? 20 : MAX_HISTORY);

      const historyMessages = (history || [])
        .reverse()
        .map((m: any) => ({ role: m.role, content: m.content }));

      // --- 2. RAG (best-effort) : embed Mistral + recherche pgvector.
      //     NE DOIT JAMAIS bloquer la réponse. Si Mistral rate-limit (429) ou
      //     est indisponible, on répond quand même via Groq, sans contexte RAG. ---
      let rankedChunks: any[] = [];
      try {
        // Enrichir la requête RAG si le message est une confirmation courte ("Oui", "Ok"…)
        // pour éviter d'embedder hors contexte et d'injecter un article sans rapport.
        const isShortConfirmation = cleanMessage.length <= 12
          || /^(oui|non|ok|ouais|si|d'accord|dacord|yes|no|peut-être|peut etre|bah|bien|super|parfait|voilà|voila)$/i.test(cleanMessage.trim());
        const ragQueryText = isShortConfirmation
          ? (() => {
              const lastAssistantMsg = historyMessages.filter((m: any) => m.role === 'assistant').pop();
              return lastAssistantMsg ? `${lastAssistantMsg.content.slice(0, 200)} ${cleanMessage}` : cleanMessage;
            })()
          : cleanMessage;

        const embedResponse = await fetch("https://api.mistral.ai/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${mistralKey}`,
          },
          body: JSON.stringify({
            model: "mistral-embed",
            input: [ragQueryText],
          }),
        });

        if (!embedResponse.ok) {
          throw new Error(`Mistral embed error: ${embedResponse.status}`);
        }

        const embedData = await embedResponse.json();
        const queryEmbedding = embedData.data[0].embedding;

        const { data: chunks, error: chunksError } = await supabase
          .rpc("match_article_chunks", {
            query_embedding: queryEmbedding,
            match_threshold: RAG_THRESHOLD,
            match_count: MAX_RAG_CHUNKS,
          });

        if (chunksError) {
          console.error("pgvector search error:", chunksError);
        }

        // Boost chunks from the current page
        const pageSlug = page_url ? page_url.replace(/^\/|\/$/g, '').split('/').pop() : null;
        rankedChunks = (chunks || []).map((c: any) => ({
          ...c,
          similarity: pageSlug && c.article_slug === pageSlug
            ? Math.min(c.similarity + 0.1, 1.0)
            : c.similarity,
        })).sort((a: any, b: any) => b.similarity - a.similarity);
      } catch (ragError) {
        console.warn("RAG indisponible, réponse sans contexte:", (ragError as Error).message);
        // rankedChunks reste [] → le bot répond quand même
      }

      const PRODUCT_KEYWORDS: Record<string, RegExp> = {
        ozempic: /ozempic|s[eé]maglutide.*inject/i,
        wegovy: /wegovy/i,
        mounjaro: /mounjaro|tirzepatide/i,
        saxenda: /saxenda|liraglutide.*poids/i,
        trulicity: /trulicity|dulaglutide/i,
        rybelsus: /rybelsus|s[eé]maglutide.*oral/i,
      };
      const userProduct = Object.entries(PRODUCT_KEYWORDS).find(([, rx]) => rx.test(cleanMessage))?.[0];
      const filteredChunks = userProduct
        ? rankedChunks.filter((c: any) => {
            const chunkText = `${c.title} ${c.content || ''}`.toLowerCase();
            const otherProducts = Object.keys(PRODUCT_KEYWORDS).filter(p => p !== userProduct);
            const isAboutOtherProduct = otherProducts.some(p => chunkText.includes(p) && !chunkText.includes(userProduct));
            return !isAboutOtherProduct;
          })
        : rankedChunks;

      const ragContext = filteredChunks
        .map((c: any) => `---\nArticle: ${c.title} (/collections/${c.collection}/${c.article_slug}/)\nSection: ${c.section_heading || "Introduction"}\n${(c.content || '').slice(0, 600)}\n---`)
        .join("\n\n");

      const sources = filteredChunks.map((c: any) => ({
        slug: c.article_slug,
        collection: c.collection,
        title: c.title,
        similarity: c.similarity,
      }));

      // --- 3b. Doctor directory search ---
      const isDoctorSearch = detectDoctorIntent(cleanMessage, historyMessages);
      let doctorContext = '';

      if (isDoctorSearch) {
        // Check if eligibility check was already proposed in this conversation
        const eligibilityAlreadyProposed = historyMessages.some(
          (m: any) => m.role === 'assistant' && /éligibilit|suis-je éligible|vérifions.*éligib|éligib.*vérifions/i.test(m.content)
        );

        // Détecter si le message est une réponse ville (suite à "dans quelle ville es-tu ?")
        const lastAssistantForCity = historyMessages.filter((m: any) => m.role === 'assistant').pop();
        const isCityReply = lastAssistantForCity
          && /quelle ville|dans quelle/i.test(lastAssistantForCity.content)
          && /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\-']{1,40}$/.test(cleanMessage.trim());
        const cityHint = isCityReply
          ? `\n- L'utilisateur répond à ta question sur sa ville : sa ville est "${cleanMessage.trim()}". Aide-le directement pour cette ville. Ne dis JAMAIS "je ne comprends pas" — c'est le nom de sa ville.`
          : '';

        doctorContext = `\n\n🩺 INSTRUCTION : L'utilisateur cherche un médecin ou spécialiste. Oriente-le calmement, sans aucun service commercial :${cityHint}
- Médecin traitant, endocrinologue ou médecin de l'obésité. Pour la primo-prescription ouvrant droit au remboursement obésité : centre spécialisé de l'obésité (CSO) ou CHU.
- Annuaire officiel : annuaire-sante.ameli.fr.
- ⚠️ NE DIS JAMAIS qu'il n'y a pas de CSO ou de spécialiste dans une ville française. Toutes les grandes villes ont un CHU avec un service de nutrition/obésité (ex : CHU Purpan à Toulouse, CHU de Nantes, AP-HP à Paris, CHU de Lyon, CHU Bordeaux, CHU Marseille, CHU Lille, CHU Strasbourg, CHU Rennes, CHU Montpellier, CHU Grenoble, CHU Nice). Si tu n'as pas les coordonnées exactes d'un CSO, dis : "Tu peux trouver le CSO le plus proche sur [annuaire-sante.ameli.fr](https://annuaire-sante.ameli.fr/) → filtre 'Centres spécialisés de l'obésité'." Ne propose jamais un hôpital dans une autre ville que celle demandée.
- Si la personne donne sa ville, confirme qu'un spécialiste y existe, donne le nom du CHU local si tu le connais, oriente vers l'annuaire pour les coordonnées exactes.${eligibilityAlreadyProposed ? '\n- La vérification d\'éligibilité a DÉJÀ été proposée dans cette conversation : ne la propose plus, réponds directement.' : '\n- Puis propose UNE SEULE FOIS : "Veux-tu qu\'on vérifie d\'abord si tu es éligible au remboursement ?"'}`;
      }

      // --- 4. Build messages for LLM ---
      // Inject scam alert if detected
      let scamContext = '';
      if (scamSignals.isScamRelated) {
        scamContext = `\n\n⚠️ ALERTE INTERNE (ne pas montrer au user) : Signaux d'arnaque détectés (${scamSignals.signals.join(', ')}). Sévérité: ${scamSignals.severity}. Applique le protocole anti-arnaque : empathie d'abord, questions pour comprendre, puis information factuelle sur les recours si confirmé.`;
      }

      // Build article links hint from RAG sources
      const articleLinks = filteredChunks
        .filter((c: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.article_slug === c.article_slug) === i)
        .slice(0, 3)
        .map((c: any) => `- [${c.title}](/collections/${c.collection}/${c.article_slug}/)`)
        .join('\n');
      const linksHint = articleLinks ? `\n\nLiens d'articles disponibles (utilise-les si pertinent dans ta réponse) :\n${articleLinks}` : '';

      // Garde-fou éligibilité : IMC calculé côté serveur, verdict injecté
      const userTexts = [cleanMessage, ...historyMessages.filter((m: any) => m.role === 'user').map((m: any) => m.content).reverse()];
      const imcData = extractImc(userTexts);
      const imcContext = imcData ? buildImcVerdictContext(imcData) : '';

      const userMessageWithContext = ragContext
        ? `Contexte factuel (utilise ces informations pour répondre sans mentionner leur source) :\n\n${ragContext}${linksHint}${scamContext}${doctorContext}${imcContext}\n\nQuestion de l'utilisateur : ${cleanMessage}`
        : `${cleanMessage}${scamContext}${doctorContext}${imcContext}`;

      // Build system prompt with premium personalization
      let systemPrompt = SYSTEM_PROMPT;
      if (isPremiumUser && premiumProfile) {
        const p = premiumProfile;
        systemPrompt += `\n\nPROFIL UTILISATEUR PREMIUM (personnalise tes réponses) :
- Prénom : ${p.prenom || 'inconnu'}
- Traitement : ${p.treatment || 'non renseigné'} ${p.current_dose || ''}
- Poids actuel : ${p.weight_current || '?'} kg, objectif : ${p.weight_goal || '?'} kg
- Taille : ${p.height_cm || '?'} cm, Âge : ${p.age || '?'} ans, Genre : ${p.gender || '?'}
- Activité : ${p.sport_level || 'non renseigné'}
- Régime : ${p.diet_type || 'non renseigné'}
Utilise le prénom et adapte tes conseils à ce profil.`;
      }

      // Mode CONSULTATION (achat one-shot 3€) — le Coach joue le rôle d'un médecin en RDV
      if (hasConsultation) {
        systemPrompt += `\n\n=== MODE CONSULTATION PRIVÉE (l'utilisateur a PAYÉ une consultation) ===
Tu mènes une vraie consultation, comme un médecin en rendez-vous. Déroulé :
1. ACCUEIL bref : explique que tu vas faire un point complet et personnalisé sur sa situation.
2. INTAKE — pose les questions UNE PAR UNE (n'enchaîne jamais tout d'un coup) : est-il déjà sous traitement ? poids et taille (→ IMC) ? comorbidités (diabète T2, hypertension, apnée du sommeil…) ? objectifs ? une prise en charge nutritionnelle a-t-elle déjà été tentée ?
3. BILAN — quand tu as assez d'infos, donne un bilan personnalisé STRUCTURÉ : verdict d'éligibilité au remboursement 65% (clair, avec le pourquoi), traitement + dosage de départ adaptés, prix et reste à charge estimés, parcours concret (primo-prescription en CSO/CHU), checklist pour le rendez-vous médecin.
4. Q&A — réponds ensuite à TOUTES ses questions, en profondeur et de façon personnalisée.
Reste factuel, ne pose pas de diagnostic médical définitif, rappelle que la décision finale revient au médecin. Pas de limite de longueur : sois complet. NE propose NI capture email NI abonnement pendant la consultation (il a déjà payé) ; tu pourras seulement, à la toute fin, suggérer de continuer le suivi avec le Coach Premium.`;
      }

      const messages = [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: userMessageWithContext },
      ];

      // --- 5. Chaîne de secours multi-fournisseurs (résilience rate-limit) ---
      // Le plan gratuit Groq plafonne à ~12k tokens/min PAR modèle. En conversation, le
      // 70B sature (429). On bascule alors : Groq 70B → Groq 8B → Mistral. Chaque modèle
      // a son PROPRE quota → pour tomber sur le fallback il faudrait que 3 modèles sur
      // 2 fournisseurs soient saturés en même temps → dead-end quasi impossible.
      const LLM_CHAIN = [
        { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.3-70b-versatile" },
        { url: "https://api.mistral.ai/v1/chat/completions", key: mistralKey, model: "mistral-small-latest" },
        { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.1-8b-instant" },
      ];
      let llmResponse: Response | null = null;
      let usedModel = LLM_CHAIN[0].model;
      for (const link of LLM_CHAIN) {
        let linkOk = false;
        for (let attempt = 0; attempt < 2; attempt++) {
          llmResponse = await fetch(link.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${link.key}`,
            },
            body: JSON.stringify({
              model: link.model,
              messages,
              temperature: 0.3,
              max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 220,
              top_p: 0.9,
            }),
          });
          if (llmResponse.ok) { linkOk = true; usedModel = link.model; break; }
          // 5xx = transitoire → 1 retry court. 429 = quota épuisé → fournisseur suivant.
          if (attempt === 0 && llmResponse.status >= 500) {
            await new Promise((r) => setTimeout(r, 600));
            continue;
          }
          break;
        }
        if (linkOk) break;
      }

      if (!llmResponse || !llmResponse.ok) {
        const errText = llmResponse ? await llmResponse.text() : "no response";
        throw new Error(`LLM chain error (${llmResponse?.status}): ${errText}`);
      }

      const llmData = await llmResponse.json();
      const assistantResponse = llmData.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";
      const tokensUsed = llmData.usage?.total_tokens || null;

      // Extraire les réponses suggérées émises par le LLM : [[SUGGESTIONS]] a | b | c
      let suggestions: string[] = [];
      let cleanResponse = assistantResponse;
      const suggMatch = assistantResponse.match(/\[\[SUGGESTIONS\]\]\s*([^\n]+)\s*$/);
      if (suggMatch) {
        suggestions = suggMatch[1].split('|').map((s: string) => s.trim()).filter((s: string) => s.length > 0 && s.length <= 40).slice(0, 3);
        cleanResponse = assistantResponse.replace(/\n*\s*\[\[SUGGESTIONS\]\][^\n]*\s*$/, '').trim();
      }

      // Options multi-select (style typeform) : [[OPTIONS]] a | b | c
      let options: string[] = [];
      const optMatch = cleanResponse.match(/\[\[OPTIONS\]\]\s*([^\n]+)\s*$/);
      if (optMatch) {
        options = optMatch[1].split('|').map((s: string) => s.trim()).filter((s: string) => s.length > 0 && s.length <= 40).slice(0, 6);
        cleanResponse = cleanResponse.replace(/\n*\s*\[\[OPTIONS\]\][^\n]*\s*$/, '').trim();
      }

      // Dossier GLP-1 ready tag: [[DOSSIER_READY]] {...json...}
      // Regex tolérante : capture tout après le tag jusqu'à la fin (le JSON peut
      // contenir des objets/tableaux imbriqués que l'ancien [^}]+ cassait).
      let dossierData: any = null;
      const dossierMatch = cleanResponse.match(/\[\[DOSSIER_READY\]\]\s*(\{[\s\S]*\})\s*$/);
      if (dossierMatch) {
        try { dossierData = JSON.parse(dossierMatch[1]); } catch { /* ignore parse error */ }
        cleanResponse = cleanResponse.replace(/\n*\s*\[\[DOSSIER_READY\]\][\s\S]*$/, '').trim();
        // Reject if placeholder values remain (prenom="X", poids_kg not a number, etc.)
        if (dossierData) {
          const isValid =
            typeof dossierData.prenom === 'string' && dossierData.prenom.length > 0 && dossierData.prenom !== 'X' &&
            typeof dossierData.poids_kg === 'number' && !isNaN(dossierData.poids_kg) &&
            typeof dossierData.taille_cm === 'number' && !isNaN(dossierData.taille_cm) &&
            typeof dossierData.ville === 'string' && dossierData.ville.length > 0 && dossierData.ville !== '...';
          if (!isValid) {
            console.warn("[[DOSSIER_READY]] rejeté : données incomplètes ou placeholders", JSON.stringify(dossierData));
            dossierData = null;
          }
        }
      }

      // Moment chaud → on propose la capture email (le funnel convertit à 0 sans capture).
      const saysEligible = /\béligibl/i.test(cleanResponse);
      const saysNotEligible = /\b(pas|plus)\b[^.]{0,25}éligibl|éligibl[^.]{0,25}\bsi\b/i.test(cleanResponse);
      const doctorStep = /annuaire-sante\.ameli|prendre rendez-vous|checklist personnalisée/i.test(cleanResponse);
      const offerCapture = !hasConsultation && !dossierData && ((saysEligible && !saysNotEligible) || doctorStep);

      // --- 6. Save messages ---
      const patternIntent = INTENT_PATTERNS.find(({ pattern }) => pattern.test(cleanMessage))?.intent || "general";
      const detectedIntent = scamSignals.isScamRelated ? `scam:${scamSignals.severity}` : patternIntent;
      await saveMessages(
        supabase, convId, session_id, cleanMessage, cleanResponse,
        detectedIntent, usedModel,
        sources.length > 0 ? sources : null,
        tokensUsed,
        user_id
      );

      return jsonResponse({
        response: cleanResponse,
        conversation_id: convId,
        sources: sources.slice(0, 3), // max 3 sources to display
        model: usedModel,
        ...(suggestions.length > 0 && { suggestions }),
        ...(options.length > 0 && { options }),
        ...(dossierData && { dossier_ready: true, dossier_data: dossierData }),
        ...(offerCapture && { offer_capture: true, capture_prompt: "Laisse-moi ton email et je t'envoie ta checklist personnalisée pour ton rendez-vous médecin (étapes, questions à poser, documents) — on garde ton résultat." }),
        ...(dailyRemaining !== null && { daily_remaining: dailyRemaining }),
      });

    } catch (llmError) {
      // --- Fallback v1 si LLM échoue ---
      console.error("LLM error, falling back to v1:", llmError);
      const fallback = classifyAndRespond(cleanMessage);
      await saveMessages(supabase, convId, session_id, cleanMessage, fallback.response, fallback.intent, "fallback-v1", null, null, user_id);
      return jsonResponse({
        response: fallback.response,
        conversation_id: convId,
        sources: [],
        model: "fallback-v1",
        ...(dailyRemaining !== null && { daily_remaining: dailyRemaining }),
      });
    }

  } catch (err) {
    console.error("Erreur ai-coach:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});

// --- Helper: save user + assistant messages ---
async function saveMessages(
  supabase: any,
  conversationId: string,
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
  intent: string | null,
  model: string,
  ragSources: any | null,
  tokensUsed?: number | null,
  userId?: string | null,
) {
  // Insert user then assistant sequentially so created_at timestamps are distinct,
  // ensuring correct ordering when history is loaded (ORDER BY created_at ASC).
  await supabase.from("coach_messages").insert({
    conversation_id: conversationId,
    session_id: sessionId,
    role: "user",
    content: userMessage,
    intent,
    model: null,
    rag_sources: null,
    tokens_used: null,
    user_id: userId || null,
  });
  await supabase.from("coach_messages").insert({
    conversation_id: conversationId,
    session_id: sessionId,
    role: "assistant",
    content: assistantMessage,
    intent,
    model,
    rag_sources: ragSources,
    tokens_used: tokensUsed || null,
    user_id: userId || null,
  });
  // Update conversation message count
  const { data: conv } = await supabase
    .from("coach_conversations")
    .select("message_count")
    .eq("id", conversationId)
    .single();
  if (conv) {
    await supabase
      .from("coach_conversations")
      .update({ message_count: (conv.message_count || 0) + 2 })
      .eq("id", conversationId);
  }
}
