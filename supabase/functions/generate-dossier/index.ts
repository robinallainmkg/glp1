// supabase/functions/generate-dossier/index.ts
// Edge Function : Génère le "Dossier GLP-1 Personnalisé" (HTML → stocké)
//
// POST /functions/v1/generate-dossier
// Body : { dossier_id } (appelé après paiement confirmé via webhook)
// Returns : { success, pdf_url }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// CSO par région (principaux centres spécialisés obésité)
const CSO_DIRECTORY: Record<string, string[]> = {
  "75": ["CSO Pitié-Salpêtrière (Paris 13e) — 01 42 17 57 53", "CSO Hôpital Européen Georges-Pompidou (Paris 15e) — 01 56 09 37 52"],
  "13": ["CSO CHU Marseille Timone — 04 91 38 60 00", "CSO Hôpital Nord Marseille — 04 91 96 86 75"],
  "69": ["CSO Hospices Civils de Lyon — 04 78 86 14 84"],
  "31": ["CSO CHU Toulouse Larrey — 05 61 32 27 29"],
  "33": ["CSO CHU Bordeaux — 05 56 79 58 13"],
  "59": ["CSO CHU Lille — 03 20 44 45 46"],
  "44": ["CSO CHU Nantes — 02 44 76 83 53"],
  "67": ["CSO CHU Strasbourg — 03 88 11 62 93"],
  "34": ["CSO CHU Montpellier — 04 67 33 84 28"],
  "06": ["CSO CHU Nice — 04 92 03 64 61"],
  "35": ["CSO CHU Rennes — 02 99 28 37 56"],
  "54": ["CSO CHU Nancy — 03 83 15 35 81"],
  "63": ["CSO CHU Clermont-Ferrand — 04 73 75 15 29"],
  "76": ["CSO CHU Rouen — 02 32 88 90 81"],
  "21": ["CSO CHU Dijon — 03 80 29 36 47"],
  "29": ["CSO CHU Brest — 02 98 34 73 65"],
  "42": ["CSO CHU Saint-Étienne — 04 77 82 83 21"],
  "37": ["CSO CHU Tours — 02 47 47 38 07"],
  "25": ["CSO CHU Besançon — 03 81 66 82 28"],
  "14": ["CSO CHU Caen — 02 31 06 45 86"],
  "45": ["CSO CHU Orléans — 02 38 51 44 44"],
  "974": ["CSO CHU La Réunion — 02 62 90 60 50"],
  "971": ["CSO CHU Guadeloupe — 05 90 89 10 10"],
  "972": ["CSO CHU Martinique — 05 96 55 20 00"],
};

function getDeptFromVille(ville: string): string | null {
  const match = ville.match(/\b(\d{2,3})\b/);
  if (match) return match[1];
  const cityToDept: Record<string, string> = {
    paris: "75", marseille: "13", lyon: "69", toulouse: "31", bordeaux: "33",
    lille: "59", nantes: "44", strasbourg: "67", montpellier: "34", nice: "06",
    rennes: "35", nancy: "54", clermont: "63", rouen: "76", dijon: "21",
    brest: "29", "saint-etienne": "42", "saint-étienne": "42", tours: "37",
    besancon: "25", besançon: "25", caen: "14", orleans: "45", orléans: "45",
    grenoble: "38", toulon: "83", angers: "49", reims: "51", "le mans": "72",
    amiens: "80", limoges: "87", perpignan: "66", metz: "57", "aix-en-provence": "13",
  };
  const lower = ville.toLowerCase().trim();
  return cityToDept[lower] || null;
}

function getEligibilityVerdict(imc: number, comorbidites: string[], suiviNutritionnel: boolean): { eligible: boolean; verdict: string; detail: string } {
  const hasComorbidity = comorbidites.length > 0;
  const comorbList = comorbidites.join(", ");

  if (imc >= 40) {
    return {
      eligible: true,
      verdict: "ÉLIGIBLE",
      detail: `Votre IMC de ${imc} est supérieur ou égal à 40. Vous remplissez le critère principal d'éligibilité au remboursement à 65% par l'Assurance Maladie, même sans comorbidité associée.${suiviNutritionnel ? " Votre suivi nutritionnel antérieur renforce votre dossier." : " Important : un échec documenté de prise en charge nutritionnelle sera demandé."}`
    };
  }
  if (imc >= 35 && hasComorbidity) {
    return {
      eligible: true,
      verdict: "ÉLIGIBLE",
      detail: `Votre IMC de ${imc} (≥ 35) associé à ${comorbList} vous rend éligible au remboursement à 65%.${suiviNutritionnel ? " Votre suivi nutritionnel antérieur renforce votre dossier." : " Important : un échec documenté de prise en charge nutritionnelle sera demandé."}`
    };
  }
  if (imc >= 35 && !hasComorbidity) {
    return {
      eligible: false,
      verdict: "NON ÉLIGIBLE EN L'ÉTAT",
      detail: `Votre IMC de ${imc} atteint le seuil de 35, mais le remboursement nécessite au moins une comorbidité associée (diabète T2, hypertension, apnée du sommeil, dyslipidémie, stéatose hépatique…). Consultez votre médecin : certaines comorbidités non diagnostiquées pourraient être présentes.`
    };
  }
  if (imc >= 30) {
    return {
      eligible: false,
      verdict: "NON ÉLIGIBLE AU REMBOURSEMENT",
      detail: `Votre IMC de ${imc} est en dessous du seuil de 35 requis pour le remboursement. Les traitements GLP-1 restent possibles sur prescription médicale, mais à votre charge (ou avec prise en charge mutuelle partielle).${hasComorbidity ? ` Vos comorbidités (${comorbList}) seront néanmoins prises en compte par votre médecin.` : ""}`
    };
  }
  return {
    eligible: false,
    verdict: "NON ÉLIGIBLE",
    detail: `Votre IMC de ${imc} est inférieur à 30. Les traitements GLP-1 pour l'obésité ciblent les patients avec un IMC ≥ 35 (avec comorbidité) ou ≥ 40. Parlez-en à votre médecin pour d'autres approches adaptées à votre situation.`
  };
}

function generateDossierHTML(d: any, verdict: any, csoList: string[]): string {
  const dateStr = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  const comorbStr = d.comorbidites?.length > 0 ? d.comorbidites.join(", ") : "Aucune déclarée";
  const prenomDisplay = d.prenom || "Patient";

  const eligibleColor = verdict.eligible ? "#16a34a" : "#dc2626";
  const eligibleBg = verdict.eligible ? "#f0fdf4" : "#fef2f2";

  const traitementInfo = d.traitement_souhaite || "Non précisé";

  const prixEstimation = verdict.eligible
    ? `<p><strong>Coût estimé après remboursement :</strong></p>
       <ul>
         <li>Wegovy : ~51-123€/mois (au lieu de 147-350€)</li>
         <li>Mounjaro : ~62-152€/mois (au lieu de 176-434€)</li>
       </ul>
       <p>Votre mutuelle peut couvrir une partie ou la totalité du reste à charge (ticket modérateur). Vérifiez votre contrat.</p>`
    : `<p><strong>Coût sans remboursement :</strong></p>
       <ul>
         <li>Wegovy : 147-350€/mois selon dosage</li>
         <li>Mounjaro : 176-434€/mois selon dosage</li>
         <li>Saxenda : ~270€/mois</li>
       </ul>
       <p>Certaines mutuelles proposent un forfait "médicaments non remboursés" — vérifiez votre contrat.</p>`;

  // Intro CSO adaptée : pour un non-éligible, on ne parle pas de "primo-prescription
  // ouvrant droit au remboursement" (ça ne le concerne pas), mais de repère utile.
  const csoIntro = verdict.eligible
    ? "Pour la primo-prescription ouvrant droit au remboursement, rendez-vous dans un CSO ou CHU :"
    : "Si votre situation évolue vers l'éligibilité, ou pour une évaluation spécialisée de l'obésité, voici les centres de référence de votre région :";
  const csoIntroNoList = verdict.eligible
    ? "La primo-prescription doit être faite dans un Centre Spécialisé de l'Obésité (CSO) ou un CHU."
    : "Pour une évaluation spécialisée (ou si votre situation évolue vers l'éligibilité), les Centres Spécialisés de l'Obésité (CSO) et CHU sont les structures de référence.";
  const csoSection = csoList.length > 0
    ? `<h2>🏥 Centre(s) spécialisé(s) près de chez vous</h2>
       <p>${csoIntro}</p>
       <ul>${csoList.map(c => `<li>${c}</li>`).join("")}</ul>
       <p>Annuaire complet : <strong>annuaire-sante.ameli.fr</strong></p>`
    : `<h2>🏥 Trouver un centre spécialisé</h2>
       <p>${csoIntroNoList}</p>
       <p>Trouvez le plus proche sur : <strong>annuaire-sante.ameli.fr</strong></p>
       <p>Vous pouvez aussi appeler votre ARS régionale pour être orienté(e).</p>`;

  // Parcours / checklist / questions : adaptés au verdict.
  // Un acheteur NON éligible ne doit PAS recevoir un guide "primo-prescription CSO/CHU"
  // qui contredit son verdict — on l'oriente vers son médecin traitant et les bonnes étapes.
  const parcoursSection = verdict.eligible
    ? `<h2>📝 Parcours concret — les étapes</h2>
<ol>
  <li><strong>Prendre RDV</strong> dans un CSO/CHU (voir ci-dessus) pour la primo-prescription</li>
  <li><strong>Consultation initiale</strong> : le médecin évalue votre dossier et décide du traitement adapté</li>
  <li><strong>Ordonnance</strong> délivrée si médicalement justifié</li>
  <li><strong>Pharmacie</strong> : achat du médicament avec votre ordonnance et carte Vitale</li>
  <li><strong>Suivi</strong> : contrôle à 1 mois, puis tous les 3 mois. Le renouvellement peut se faire chez votre médecin traitant</li>
</ol>`
    : `<h2>📝 Parcours concret — les étapes pour votre situation</h2>
<p>En l'état, votre profil n'ouvre pas le remboursement à 65% (voir verdict ci-dessus). Voici les étapes utiles et honnêtes pour avancer :</p>
<ol>
  <li><strong>Consultez votre médecin traitant</strong> pour faire le point sur votre poids, vos comorbidités et vos objectifs</li>
  <li><strong>Bilan de santé</strong> : il peut prescrire un bilan (glycémie, bilan lipidique, hépatique…) pour évaluer précisément votre situation et d'éventuelles comorbidités non diagnostiquées</li>
  <li><strong>Prise en charge nutritionnelle structurée</strong> : c'est la première étape recommandée — et un prérequis si votre situation évolue vers l'éligibilité</li>
  <li><strong>Options de traitement</strong> : un GLP-1 reste possible sur prescription médicale <em>à votre charge</em> (voir estimation ci-dessus) ; discutez-en avec votre médecin, ainsi que des autres approches</li>
  <li><strong>Réévaluation</strong> : si votre IMC ou vos comorbidités évoluent, votre éligibilité au remboursement peut changer — refaites le point avec votre médecin</li>
</ol>`;

  const checklistSection = verdict.eligible
    ? `<div class="checklist">
  <h2>✅ Checklist pour votre rendez-vous</h2>
  <p>Apportez ces documents à votre consultation en CSO/CHU :</p>
  <ul>
    <li>Carte Vitale et attestation de mutuelle</li>
    <li>Lettre du médecin traitant (si vous en avez une)</li>
    <li>Résultats de prise de sang récents (glycémie, HbA1c, bilan lipidique, bilan hépatique)</li>
    <li>Historique des régimes / suivis nutritionnels tentés (dates, durées, résultats)</li>
    <li>Liste de vos traitements en cours</li>
    <li>Carnet de poids si vous en tenez un</li>
    <li>Résultats d'examens liés aux comorbidités (polysomnographie pour apnée, etc.)</li>
  </ul>
</div>`
    : `<div class="checklist">
  <h2>✅ Checklist pour votre rendez-vous chez le médecin</h2>
  <p>Apportez ces éléments à votre consultation (médecin traitant) :</p>
  <ul>
    <li>Carte Vitale et attestation de mutuelle</li>
    <li>Historique de votre poids et des régimes / suivis nutritionnels déjà tentés</li>
    <li>Liste de vos traitements en cours</li>
    <li>Résultats de prise de sang récents, si vous en avez</li>
    <li>Vos objectifs et vos questions notés à l'avance</li>
  </ul>
</div>`;

  const questionsSection = verdict.eligible
    ? `<h2>❓ Questions à poser au médecin</h2>
<ul class="questions">
  <li>Quel traitement GLP-1 est le plus adapté à ma situation (Wegovy, Mounjaro, autre) ?</li>
  <li>Quel dosage de départ et quel protocole d'escalade ?</li>
  <li>Quels effets secondaires dois-je anticiper et comment les gérer ?</li>
  <li>Quel suivi nutritionnel recommandez-vous en parallèle ?</li>
  <li>À quelle fréquence dois-je revenir en consultation ?</li>
  <li>Mon médecin traitant pourra-t-il renouveler l'ordonnance ?</li>
  <li>Y a-t-il des contre-indications avec mes traitements actuels ?</li>
  <li>Que se passe-t-il si j'arrête le traitement ?</li>
</ul>`
    : `<h2>❓ Questions à poser au médecin</h2>
<ul class="questions">
  <li>Quelles approches sont adaptées à ma situation actuelle (IMC ${d.imc}) ?</li>
  <li>Un suivi nutritionnel structuré est-il recommandé dans mon cas, et par qui ?</li>
  <li>Quels examens permettraient de mieux évaluer ma situation et mes comorbidités ?</li>
  <li>Dans quelles conditions pourrais-je devenir éligible au remboursement d'un GLP-1 ?</li>
  <li>Un traitement GLP-1 est-il pertinent pour moi même sans remboursement, et à quel coût ?</li>
  <li>Comment surveiller au mieux ma santé et mes facteurs de risque ?</li>
</ul>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Dossier GLP-1 Personnalisé — ${prenomDisplay}</title>
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { color: #1a3c34; border-bottom: 3px solid #16a34a; padding-bottom: 10px; }
  h2 { color: #1a3c34; margin-top: 30px; }
  .header { text-align: center; margin-bottom: 30px; }
  .header img { width: 60px; }
  .header p { color: #666; font-size: 0.9em; }
  .verdict-box { background: ${eligibleBg}; border: 2px solid ${eligibleColor}; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .verdict-box h3 { color: ${eligibleColor}; margin-top: 0; font-size: 1.4em; }
  .profil-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  .profil-table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
  .profil-table td:first-child { font-weight: bold; width: 40%; color: #374151; }
  .checklist { background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .checklist li { margin: 8px 0; }
  .checklist li::marker { content: "✅ "; }
  .questions li { margin: 8px 0; }
  .questions li::marker { content: "❓ "; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666; font-size: 0.85em; text-align: center; }
  .disclaimer { background: #fef3cd; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 0.9em; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>

<div class="header">
  <h1>🩺 Dossier GLP-1 Personnalisé</h1>
  <p>Préparé pour <strong>${prenomDisplay}</strong> — ${dateStr}</p>
  <p>glp1-france.fr — Information indépendante sur les traitements GLP-1</p>
</div>

<h2>📋 Votre profil</h2>
<table class="profil-table">
  <tr><td>Prénom</td><td>${prenomDisplay}</td></tr>
  <tr><td>Poids</td><td>${d.poids_kg} kg</td></tr>
  <tr><td>Taille</td><td>${d.taille_cm} cm</td></tr>
  <tr><td>IMC calculé</td><td><strong>${d.imc}</strong></td></tr>
  <tr><td>Comorbidités</td><td>${comorbStr}</td></tr>
  <tr><td>Suivi nutritionnel antérieur</td><td>${d.suivi_nutritionnel ? "Oui" : "Non / Non précisé"}</td></tr>
  <tr><td>Traitement envisagé</td><td>${traitementInfo}</td></tr>
  <tr><td>Ville</td><td>${d.ville || "Non précisée"}</td></tr>
</table>

<div class="verdict-box">
  <h3>${verdict.eligible ? "✅" : "⚠️"} Verdict : ${verdict.verdict}</h3>
  <p>${verdict.detail}</p>
</div>

<h2>💰 Estimation financière</h2>
${prixEstimation}

${csoSection}

${parcoursSection}

${checklistSection}

${questionsSection}

<div class="disclaimer">
  <strong>⚠️ Avertissement</strong> : Ce dossier est un document d'information basé sur les données que vous avez fournies. Il ne constitue pas un avis médical. Seul un médecin peut poser un diagnostic et prescrire un traitement. Les critères d'éligibilité au remboursement sont vérifiés par le médecin prescripteur.
</div>

<div class="footer">
  <p>Dossier généré par GLP-1 France — glp1-france.fr</p>
  <p>Information indépendante • Aucun lien commercial avec les laboratoires</p>
  <p>Données de remboursement à jour au 15 juin 2026 (arrêté du 23 mai 2026)</p>
</div>

</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST uniquement" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { dossier_id } = await req.json();
    if (!dossier_id) {
      return new Response(JSON.stringify({ error: "dossier_id requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Fetch dossier data
    const { data: dossier, error: fetchErr } = await supabase
      .from("dossiers")
      .select("*")
      .eq("id", dossier_id)
      .single();

    if (fetchErr || !dossier) {
      return new Response(JSON.stringify({ error: "Dossier non trouvé" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (dossier.status !== "paid") {
      return new Response(JSON.stringify({ error: "Paiement non confirmé" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Calculate eligibility
    const imc = dossier.imc || (dossier.poids_kg / ((dossier.taille_cm / 100) ** 2));
    const verdict = getEligibilityVerdict(
      Math.round(imc * 10) / 10,
      dossier.comorbidites || [],
      dossier.suivi_nutritionnel || false
    );

    // 3. Find nearest CSO
    const dept = dossier.ville ? getDeptFromVille(dossier.ville) : null;
    const csoList = dept && CSO_DIRECTORY[dept] ? CSO_DIRECTORY[dept] : [];

    // 4. Generate HTML
    const dossierWithImc = { ...dossier, imc: Math.round(imc * 10) / 10 };
    const html = generateDossierHTML(dossierWithImc, verdict, csoList);

    // 5. Store HTML in Supabase Storage
    const fileName = `dossier-${dossier_id}.html`;
    const { error: uploadErr } = await supabase.storage
      .from("dossiers")
      .upload(fileName, new Blob([html], { type: "text/html" }), {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      // Fallback: store HTML directly in the record
    }

    // 6. Get public URL
    const { data: urlData } = supabase.storage.from("dossiers").getPublicUrl(fileName);
    const pdfUrl = urlData?.publicUrl || null;

    // 7. Update dossier record
    await supabase.from("dossiers").update({
      status: "generated",
      eligible: verdict.eligible,
      verdict: verdict.verdict,
      pdf_url: pdfUrl,
      generated_at: new Date().toISOString(),
    }).eq("id", dossier_id);

    return new Response(JSON.stringify({
      success: true,
      pdf_url: pdfUrl,
      eligible: verdict.eligible,
      verdict: verdict.verdict,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Generate dossier error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
