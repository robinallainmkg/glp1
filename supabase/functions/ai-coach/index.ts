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
const MAX_RAG_CHUNKS = 5;
const RAG_THRESHOLD = 0.65;
const MAX_INPUT_LENGTH = 500;
const MAX_RESPONSE_TOKENS = 1200;
const RATE_LIMIT_WINDOW_MIN = 10;
const RATE_LIMIT_WINDOW_MAX = 20;
const RATE_LIMIT_HOURLY_MAX = 60;

const SYSTEM_PROMPT = `Tu es le Coach GLP-1 France, un assistant d'information specialise dans les traitements agonistes du recepteur GLP-1 (semaglutide, tirzepatide, liraglutide, dulaglutide) en France.

TON APPROCHE — ECOUTER D'ABORD, INFORMER ENSUITE :
- Tu commences TOUJOURS par comprendre la situation de la personne avant de donner des informations.
- Tu poses des questions courtes et bienveillantes pour clarifier : quel produit ? quel contexte ? quel objectif ? suivi medical ?
- Tu ne fais JAMAIS peur inutilement. Tu restes calme, rassurant et factuel.
- Tu ne tires JAMAIS de conclusions hatives sur la situation de quelqu'un.
- Quand quelqu'un mentionne un produit douteux, tu poses d'abord des questions (quel produit exactement ? ou achete ? prescrit par un medecin ?) avant de donner ton avis.

REGLES ABSOLUES :
1. Tu ne poses JAMAIS de diagnostic medical. Tu ne recommandes JAMAIS un traitement specifique.
2. Tu renvoies TOUJOURS vers un medecin pour toute decision medicale.
3. Tu ne prescris RIEN. Tu informes uniquement.
4. UNIQUEMENT si quelqu'un decrit des symptomes graves ACTUELS et URGENTS (douleur abdominale severe, vomissements persistants, pensees suicidaires, reaction allergique), tu dis d'appeler le 15 (SAMU). Sinon, tu orientes calmement vers un medecin.
5. Tu ne vends RIEN. GLP-1 France est un site d'information independant.
6. Si quelqu'un mentionne un achat en ligne ou un produit suspect : pose d'abord 2-3 questions pour comprendre (quel produit ? ou achete ? avec ordonnance ?). Ne suppose PAS d'emblee qu'il s'agit d'une arnaque. Donne ensuite une information mesuree selon les reponses.
7. Tu reponds UNIQUEMENT en francais.
8. Ton chaleureux, accessible, bienveillant mais professionnel. Tutoiement si l'utilisateur tutoie, vouvoiement sinon.
9. Reponses concises (max 150 mots). Va droit au but, pas de formules creuses.
10. N'ajoute JAMAIS de disclaimer medical en fin de reponse (il y en a deja un affiche sous le chat).
11. Ne dis JAMAIS "d'apres nos articles", "selon nos guides" ou toute formulation qui s'appuie sur "nos" contenus.
12. Ne termine JAMAIS par une phrase promotionnelle.
13. Quand tu mentionnes un sujet couvert par le site, propose un lien utile au format : [Titre](URL). Utilise UNIQUEMENT les URLs fournies dans le contexte RAG. Ne fabrique JAMAIS d'URL.

CONTEXTE IMPORTANT :
- Les vrais GLP-1 injectables (Ozempic, Wegovy, Mounjaro, Saxenda, Trulicity, Victoza) ne se vendent QU'en pharmacie sur ordonnance en France
- Il existe des arnaques (faux GLP-1 en gelules vendus en ligne) mais il existe aussi des complements alimentaires legaux (berbérine, etc.) — ne pas tout melanger
- Si quelqu'un a achete un produit douteux et s'inquiete : le rassurer d'abord, poser des questions, puis informer factuellement
- Prix approximatifs : Ozempic ~77 EUR/mois (rembourse 65% pour diabete T2), Wegovy ~300 EUR/mois (non rembourse), Mounjaro ~350 EUR/mois (non rembourse)
- Si la personne est victime d'arnaque averee : orienter calmement vers signal.conso.gouv.fr et pre-plainte-en-ligne.gouv.fr

CONSULTER UN SPECIALISTE / TROUVER UN MEDECIN — ORIENTE VERS ANNETTE :
Quand quelqu'un cherche un medecin, un specialiste, une prescription ou un accompagnement, ta PREMIERE reponse doit orienter vers Annette.care :
- "Pour consulter un specialiste GLP-1, je te recommande Annette.care. Leurs medecins partenaires assurent la primo-prescription si tu es eligible, ainsi que le renouvellement d'ordonnance. En plus, tu beneficies d'un suivi dietetique complet."
- Donne TOUJOURS le lien : [Decouvrir Annette.care](https://www.annette.care/?utm_source=glp1france&utm_medium=chat_coach&utm_campaign=partenariat_coach)
- Mentionne le code CARE50 (50% sur le 1er mois, soit 24,50 EUR).
- Note : 4.8/5 sur Google, 2 000+ patients accompagnes.
- Ne demande PAS le departement ou code postal. Ne propose PAS de chercher dans un annuaire. Annette est LA solution.
- Si la personne insiste pour un medecin hors Annette (medecin traitant, CHU), oriente alors vers annuaire-sante.ameli.fr en complement.

PARTENAIRE ANNETTE.CARE — QUAND MENTIONNER :
Annette.care est notre partenaire sante. Mentionne-le naturellement dans ces cas :
- Question sur prescription, ordonnance, eligibilite, renouvellement → medecins partenaires Annette
- Question sur accompagnement, suivi, nutrition, regime, coaching → dieteticiens Annette
- Question sur perte de poids, motivation, effets secondaires → programme complet Annette
- Question sur prix/cout du traitement → mentionne que Annette aide aussi sur le parcours de soins
- Pour les questions purement informatives (c'est quoi un GLP-1 ? effets secondaires ?), reponds d'abord factuellement, puis propose Annette si pertinent.
- Sois naturel, pas commercial. Exemple : "Annette.care est notre partenaire de confiance pour ca" ou "Les medecins d'Annette peuvent t'aider".

SEGMENTS DE VISITEURS (adapter la reponse) :
- ~28% sont des victimes d'arnaques (ont achete de faux GLP-1 en ligne, souvent 29-80 EUR). Etre empathique, ne pas juger, proposer les recours.
- ~16% ont une intention d'achat directe. Expliquer le parcours legal (medecin → ordonnance → pharmacie). Proposer Annette si besoin de prescription.
- ~10% ont des questions medicales (diabete, compatibilite). Orienter vers le medecin apres information factuelle.
- Le reste sont des curieux qui cherchent a comprendre les GLP-1.`;

// --- Fallback v1 (rules engine) ---
const INTENT_PATTERNS: Array<{ intent: string; pattern: RegExp; response: string }> = [
  {
    intent: 'scam',
    pattern: /arnaque|fraud|escroqu|contref|fak/i,
    response: "Je comprends votre inquietude. Pour mieux vous aider, j'aurais besoin de quelques details :\n\n• Quel produit avez-vous achete exactement ?\n• Sur quel site ou plateforme ?\n• Avez-vous deja recu le produit ?\n\nSi vous pensez avoir ete victime d'une arnaque, sachez que vous pouvez signaler sur signal.conso.gouv.fr et faire opposition sur votre carte bancaire."
  },
  {
    intent: 'selling',
    pattern: /vend|achet|command|produit|stock|livr/i,
    response: "GLP-1 France est un site d'information independant, nous ne vendons aucun produit.\n\nLes traitements GLP-1 injectables sont des medicaments sur ordonnance. Le parcours :\n1. Consultation medecin traitant ou endocrinologue\n2. Ordonnance si indique medicalement\n3. Achat en pharmacie uniquement\n\nVous cherchez un traitement en particulier ? Je peux vous informer."
  },
  {
    intent: 'price',
    pattern: /prix|co[uû]t|rembours|tarif|cher|combien/i,
    response: "Prix indicatifs des traitements GLP-1 en France :\n\n💊 Ozempic : ~77,60€/boite (rembourse 65% pour diabete T2)\n💊 Wegovy : ~280-350€/mois (non rembourse, negociation CEPS en cours)\n💊 Mounjaro : ~300-400€/mois (non rembourse)\n💊 Saxenda : ~270€/mois (non rembourse)\n\nSeul Ozempic est rembourse, et uniquement pour le diabete de type 2."
  },
  {
    intent: 'device',
    pattern: /stylo|inject|piqu|marche pas|kwikpen|flextouch|bloqu/i,
    response: "Si votre stylo injecteur ne fonctionne pas, verifiez :\n\n1. ✅ L'aiguille est bien vissee\n2. ✅ La dose est selectionnee (pas a 0)\n3. ✅ La cartouche n'est pas vide\n4. ✅ Conservation au frigo (2-8°C avant ouverture)\n5. ✅ Pas expire\n\nSi le probleme persiste, contactez votre pharmacien ou le laboratoire fabricant. Ne forcez jamais le mecanisme."
  },
  {
    intent: 'diabetes',
    pattern: /diab[eè]t|glyc[eé]mi|insuline|type 2|hba1c/i,
    response: "Plusieurs GLP-1 sont specifiquement indiques pour le diabete de type 2 :\n\n• Ozempic (semaglutide) — le plus prescrit\n• Trulicity (dulaglutide)\n• Victoza (liraglutide)\n\nLa decision depend de votre traitement actuel et de votre HbA1c. Consultez votre endocrinologue pour adapter votre traitement."
  },
  {
    intent: 'diet',
    pattern: /r[eé]gime|nutrition|aliment|manger|repas|prot[eé]ine/i,
    response: "Un regime restrictif n'est PAS recommande avec un traitement GLP-1. Privilegiez :\n\n🥩 Apport suffisant en proteines (preserver la masse musculaire)\n🍽️ Aliments faciles a digerer (nausees frequentes au debut)\n💧 Hydratation importante\n🥗 Petites portions, repas frequents\n\nPour un suivi dietetique personnalise adapte a votre traitement GLP-1, [Annette.care](https://www.annette.care/?utm_source=glp1france&utm_medium=chat_coach&utm_campaign=partenariat_coach) propose un accompagnement avec des dieteticiens certifies (code CARE50 : -50% le 1er mois)."
  },
  {
    intent: 'weight',
    pattern: /perte.*poids|maigri|kilos?|pas.*perdu|combien.*perd/i,
    response: "Les resultats varient selon les personnes :\n\n📅 Semaines 1-4 : premiers effets (reduction appetit)\n📅 Mois 1-3 : perte progressive (2-5 kg/mois en moyenne)\n📅 Mois 3-6 : resultats les plus significatifs\n\nEn moyenne, les etudes montrent une perte de 10-15% du poids initial sur 12-18 mois.\n\nSi apres 3 mois sans resultat, parlez-en a votre medecin (dose a ajuster ?)."
  },
  {
    intent: 'prescription',
    pattern: /ordonnance|prescri|m[eé]decin|consult|obtenir|comment.*avoir|sp[eé]cialiste/i,
    response: "Pour consulter un specialiste GLP-1, je vous recommande [Annette.care](https://www.annette.care/?utm_source=glp1france&utm_medium=chat_coach&utm_campaign=partenariat_coach) :\n\n🩺 Medecins partenaires qui assurent la primo-prescription (si eligibilite)\n🔄 Renouvellement d'ordonnance sans file d'attente\n🥗 Suivi dietetique personnalise avec dieteticiens certifies\n⭐ 4.8/5 sur Google — 2 000+ patients accompagnes\n\nAvec le code **CARE50**, le premier mois est a 24,50€ au lieu de 49€."
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
  // Check if last assistant message asked for department (follow-up)
  const lastAssistant = history.filter(m => m.role === 'assistant').pop();
  if (lastAssistant && /d[eé]partement|code postal|r[eé]gion|localisation/.test(lastAssistant.content)) {
    // User might be replying with just a number
    if (/^\d{2,5}$/.test(message.trim())) return true;
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
    response: "Je suis le Coach GLP-1, specialise dans l'information sur les traitements GLP-1 en France. Je peux vous aider sur :\n\n• Les prix et remboursements\n• Comment obtenir une ordonnance\n• Les problemes de stylo injecteur\n• L'alimentation sous GLP-1\n• La perte de poids attendue\n• Les arnaques a eviter\n\nPosez-moi votre question !"
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
          return jsonResponse({ error: "rate_limit", message: "Limite horaire atteinte. Reessayez plus tard." }, 429);
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
        return jsonResponse({ error: "rate_limit", message: "Trop de messages. Reessayez dans quelques minutes." }, 429);
      }
      if (newHourlyCount >= RATE_LIMIT_HOURLY_MAX) {
        return jsonResponse({ error: "rate_limit", message: "Limite horaire atteinte. Reessayez plus tard." }, 429);
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
    let premiumProfile: any = null;

    if (!user_id && clientIp !== "unknown") {
      // Anonymous users: 5 messages/day by IP
      const ANON_DAILY_LIMIT = 5;
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
          message: "Vous avez utilise vos 5 messages gratuits du jour. Creez un compte gratuit pour continuer, ou passez a Premium pour des echanges illimites !",
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

      const isPremium = userProfile && (
        userProfile.subscription_status === "active" ||
        userProfile.subscription_status === "trialing" ||
        (userProfile.subscription_status === "canceled" &&
         userProfile.subscription_period_end &&
         new Date(userProfile.subscription_period_end) > new Date())
      );
      isPremiumUser = !!isPremium;

      const isInTrial = userProfile?.trial_end && new Date(userProfile.trial_end) > new Date();
      if (isInTrial) isPremiumUser = true;

      // Fetch full profile for premium personalization
      if (isPremiumUser) {
        const { data: fullProfile } = await supabase
          .from("user_profiles")
          .select("prenom, treatment, current_dose, weight_current, weight_goal, sport_level, diet_type, height_cm, age, gender")
          .eq("user_id", user_id)
          .single();
        premiumProfile = fullProfile;
      }

      if (!isPremium && !isInTrial) {
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
            message: "Vous avez atteint la limite de 3 messages gratuits par jour. Passez a Coach Premium pour des echanges illimites !",
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
      // --- 1. Embed + load history in parallel ---
      const [embedResponse, { data: history }] = await Promise.all([
        fetch("https://api.mistral.ai/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${mistralKey}`,
          },
          body: JSON.stringify({
            model: "mistral-embed",
            input: [cleanMessage],
          }),
        }),
        supabase
          .from("coach_messages")
          .select("role, content")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: false })
          .limit(isPremiumUser ? 20 : MAX_HISTORY),
      ]);

      if (!embedResponse.ok) {
        throw new Error(`Mistral embed error: ${embedResponse.status}`);
      }

      const embedData = await embedResponse.json();
      const queryEmbedding = embedData.data[0].embedding;

      const historyMessages = (history || [])
        .reverse()
        .map((m: any) => ({ role: m.role, content: m.content }));

      // --- 2. Search pgvector for relevant chunks ---
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
      const rankedChunks = (chunks || []).map((c: any) => ({
        ...c,
        similarity: pageSlug && c.article_slug === pageSlug
          ? Math.min(c.similarity + 0.1, 1.0)
          : c.similarity,
      })).sort((a: any, b: any) => b.similarity - a.similarity);

      const ragContext = rankedChunks
        .map((c: any) => `---\nArticle: ${c.title} (/collections/${c.collection}/${c.article_slug}/)\nSection: ${c.section_heading || "Introduction"}\n${c.content}\n---`)
        .join("\n\n");

      const sources = rankedChunks.map((c: any) => ({
        slug: c.article_slug,
        collection: c.collection,
        title: c.title,
        similarity: c.similarity,
      }));

      // --- 3b. Doctor directory search ---
      const isDoctorSearch = detectDoctorIntent(cleanMessage, historyMessages);
      let doctorContext = '';

      if (isDoctorSearch) {
        // Redirect to Annette — primary action for doctor/specialist queries
        doctorContext = `\n\n🩺 INSTRUCTION PRIORITAIRE — REDIRECTION ANNETTE :
L'utilisateur cherche un medecin ou specialiste. Tu DOIS recommander Annette.care EN PREMIER :
- "Pour consulter un specialiste GLP-1, je te recommande Annette.care. Leurs medecins partenaires assurent la primo-prescription si tu es eligible, et le renouvellement d'ordonnance."
- Donne le lien : [Decouvrir Annette.care](https://www.annette.care/?utm_source=glp1france&utm_medium=chat_coach&utm_campaign=partenariat_coach)
- Mentionne : 4.8/5 Google, 2 000+ patients, code CARE50 (-50% le 1er mois).
- Ne demande PAS le departement. Ne propose PAS d'annuaire. Annette est LA solution.
- En complement seulement : le medecin traitant peut aussi orienter.`;
      }

      // --- 4. Build messages for LLM ---
      // Inject scam alert if detected
      let scamContext = '';
      if (scamSignals.isScamRelated) {
        scamContext = `\n\n⚠️ ALERTE INTERNE (ne pas montrer au user) : Signaux d'arnaque detectes (${scamSignals.signals.join(', ')}). Severite: ${scamSignals.severity}. Applique le protocole anti-arnaque : empathie d'abord, questions pour comprendre, puis information factuelle sur les recours si confirme.`;
      }

      // Build article links hint from RAG sources
      const articleLinks = rankedChunks
        .filter((c: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.article_slug === c.article_slug) === i)
        .slice(0, 3)
        .map((c: any) => `- [${c.title}](/collections/${c.collection}/${c.article_slug}/)`)
        .join('\n');
      const linksHint = articleLinks ? `\n\nLiens d'articles disponibles (utilise-les si pertinent dans ta reponse) :\n${articleLinks}` : '';

      const userMessageWithContext = ragContext
        ? `Contexte factuel (utilise ces informations pour repondre sans mentionner leur source) :\n\n${ragContext}${linksHint}${scamContext}${doctorContext}\n\nQuestion de l'utilisateur : ${cleanMessage}`
        : `${cleanMessage}${scamContext}${doctorContext}`;

      // Build system prompt with premium personalization
      let systemPrompt = SYSTEM_PROMPT;
      if (isPremiumUser && premiumProfile) {
        const p = premiumProfile;
        systemPrompt += `\n\nPROFIL UTILISATEUR PREMIUM (personnalise tes reponses) :
- Prenom : ${p.prenom || 'inconnu'}
- Traitement : ${p.treatment || 'non renseigne'} ${p.current_dose || ''}
- Poids actuel : ${p.weight_current || '?'} kg, objectif : ${p.weight_goal || '?'} kg
- Taille : ${p.height_cm || '?'} cm, Age : ${p.age || '?'} ans, Genre : ${p.gender || '?'}
- Activite : ${p.sport_level || 'non renseigne'}
- Regime : ${p.diet_type || 'non renseigne'}
Utilise le prenom et adapte tes conseils a ce profil.`;
      }

      const messages = [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: userMessageWithContext },
      ];

      // --- 5. Call Groq LLM ---
      const llmResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.3,
          max_tokens: MAX_RESPONSE_TOKENS,
          top_p: 0.9,
        }),
      });

      if (!llmResponse.ok) {
        const errText = await llmResponse.text();
        throw new Error(`Groq error (${llmResponse.status}): ${errText}`);
      }

      const llmData = await llmResponse.json();
      const assistantResponse = llmData.choices[0]?.message?.content || "Desole, je n'ai pas pu generer une reponse.";
      const tokensUsed = llmData.usage?.total_tokens || null;

      // --- 6. Save messages ---
      const detectedIntent = scamSignals.isScamRelated ? `scam:${scamSignals.severity}` : null;
      await saveMessages(
        supabase, convId, session_id, cleanMessage, assistantResponse,
        detectedIntent, "llama-3.3-70b-versatile",
        sources.length > 0 ? sources : null,
        tokensUsed,
        user_id
      );

      return jsonResponse({
        response: assistantResponse,
        conversation_id: convId,
        sources: sources.slice(0, 3), // max 3 sources to display
        model: "llama-3.3-70b-versatile",
        ...(dailyRemaining !== null && { daily_remaining: dailyRemaining }),
      });

    } catch (llmError) {
      // --- Fallback v1 si LLM echoue ---
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
  // Batch insert both messages + update conversation in parallel
  await Promise.all([
    supabase.from("coach_messages").insert([
      {
        conversation_id: conversationId,
        session_id: sessionId,
        role: "user",
        content: userMessage,
        intent,
        model: null,
        rag_sources: null,
        tokens_used: null,
        user_id: userId || null,
      },
      {
        conversation_id: conversationId,
        session_id: sessionId,
        role: "assistant",
        content: assistantMessage,
        intent,
        model,
        rag_sources: ragSources,
        tokens_used: tokensUsed || null,
        user_id: userId || null,
      },
    ]),
    supabase
      .from("coach_conversations")
      .select("message_count")
      .eq("id", conversationId)
      .single()
      .then(({ data: conv }: any) => {
        if (conv) {
          return supabase
            .from("coach_conversations")
            .update({ message_count: (conv.message_count || 0) + 2 })
            .eq("id", conversationId);
        }
      }),
  ]);
}
