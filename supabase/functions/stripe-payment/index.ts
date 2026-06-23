// supabase/functions/stripe-payment/index.ts
// Edge Function : Crée une session Stripe Checkout pour un paiement UNIQUE
// — Consultation privée GLP-1 (3€) ou Dossier GLP-1 Personnalisé (4.99€)
//
// POST /functions/v1/stripe-payment
// Body : { product: 'consultation' | 'dossier', dossier_data?: {...} }
// Headers : Authorization: Bearer <supabase_jwt>  (optionnel pour dossier)
// Returns : { url: string }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SITE_URL = "https://glp1-france.fr";

const PRODUCTS = {
  consultation: { price: 300, name: "Consultation privée GLP-1", desc: "Bilan personnalisé + 48h de questions avec le Coach IA" },
  dossier: { price: 499, name: "Mon Dossier GLP-1 Personnalisé", desc: "Dossier d'éligibilité complet : verdict, checklist médecin, CSO le plus proche, estimation financière" },
};

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const product = body.product || "consultation";
    const productInfo = PRODUCTS[product as keyof typeof PRODUCTS];

    if (!productInfo) {
      return new Response(JSON.stringify({ error: "Produit invalide" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Auth: required for consultation, optional for dossier (can use email)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = body.email || null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        userEmail = user.email || userEmail;
      }
    }

    // Consultation requires auth
    if (product === "consultation" && !userId) {
      return new Response(JSON.stringify({ error: "Non authentifié — un compte est requis pour la consultation" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Dossier requires at least an email
    if (product === "dossier" && !userEmail) {
      return new Response(JSON.stringify({ error: "Email requis pour recevoir votre dossier" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For dossier: create the dossier record with intake data
    let dossierId: string | null = null;
    if (product === "dossier" && body.dossier_data) {
      const d = body.dossier_data;
      const { data: newDossier, error: insertErr } = await supabase
        .from("dossiers")
        .insert({
          session_id: body.session_id || null,
          user_id: userId,
          email: userEmail,
          prenom: d.prenom || null,
          poids_kg: d.poids_kg,
          taille_cm: d.taille_cm,
          comorbidites: d.comorbidites || [],
          ville: d.ville || null,
          suivi_nutritionnel: d.suivi_nutritionnel || false,
          traitement_souhaite: d.traitement_souhaite || null,
          conversation_id: body.conversation_id || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("Dossier insert error:", insertErr);
        return new Response(JSON.stringify({ error: "Erreur création dossier" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      dossierId = newDossier?.id;
    }

    // Stripe customer
    let stripeCustomerId: string | undefined;
    if (userId) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .single();
      stripeCustomerId = profile?.stripe_customer_id;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userEmail!, metadata: { supabase_user_id: userId },
        });
        stripeCustomerId = customer.id;
        await supabase.from("user_profiles")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("user_id", userId);
      }
    }

    const successUrl = product === "dossier"
      ? `${SITE_URL}/mon-espace/dossier/?status=success&dossier_id=${dossierId}&session_id={CHECKOUT_SESSION_ID}`
      : `${SITE_URL}/mon-espace/consultation/?status=success&session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl = product === "dossier"
      ? `${SITE_URL}/mon-espace/dossier/?status=cancel`
      : `${SITE_URL}/mon-espace/consultation/?status=cancel`;

    const sessionParams: any = {
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: productInfo.price,
          product_data: { name: productInfo.name, description: productInfo.desc },
        },
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      locale: "fr",
      metadata: {
        product,
        ...(userId && { supabase_user_id: userId }),
        ...(dossierId && { dossier_id: dossierId }),
      },
      payment_intent_data: {
        metadata: {
          product,
          ...(userId && { supabase_user_id: userId }),
          ...(dossierId && { dossier_id: dossierId }),
        },
      },
    };

    // Add customer if we have one; otherwise use customer_email for guest checkout
    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
    } else if (userEmail) {
      sessionParams.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update dossier with Stripe session ID
    if (dossierId) {
      await supabase.from("dossiers")
        .update({ stripe_session_id: session.id })
        .eq("id", dossierId);
    }

    return new Response(JSON.stringify({ url: session.url, dossier_id: dossierId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Stripe payment error:", error);
    return new Response(JSON.stringify({ error: error.message || "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
