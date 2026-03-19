// supabase/functions/stripe-webhook/index.ts
// Edge Function : Gère les webhooks Stripe pour les abonnements Coach Premium
//
// POST /functions/v1/stripe-webhook
// Body : Stripe event (raw)
// Headers : stripe-signature
// No CORS needed (called by Stripe servers)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // 1. Verify Stripe signature
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(`Signature invalide: ${err.message}`, { status: 400 });
    }

    // 2. Idempotency check
    const { data: existing } = await supabase
      .from("subscription_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    // 3. Process event
    console.log(`Processing event: ${event.type} (${event.id})`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, event.id);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice, event.id);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, event.id);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, event.id);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, event.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

// --- Event Handlers ---

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, eventId: string) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userId = session.metadata?.supabase_user_id;

  if (!userId) {
    // Fallback: find user by stripe_customer_id
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();
    if (!profile) {
      console.error("No user found for customer:", customerId);
      return;
    }
    await updateSubscription(profile.user_id, subscriptionId, customerId, eventId);
  } else {
    await updateSubscription(userId, subscriptionId, customerId, eventId);
  }
}

async function updateSubscription(userId: string, subscriptionId: string, customerId: string, eventId: string) {
  // Fetch subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const status = subscription.status === "trialing" ? "trialing" : "active";
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const priceId = subscription.items.data[0]?.price?.id || null;

  await supabase
    .from("user_profiles")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      subscription_period_end: periodEnd,
      subscription_price_id: priceId,
      is_subscribed: true,
      subscription_plan: "premium",
    })
    .eq("user_id", userId);

  await logEvent(userId, eventId, "checkout.session.completed", { subscriptionId, status, priceId });
  console.log(`User ${userId} subscribed (${status})`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice, eventId: string) {
  const customerId = invoice.customer as string;
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) return;

  const subscriptionId = invoice.subscription as string;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    await supabase
      .from("user_profiles")
      .update({
        subscription_status: "active",
        subscription_period_end: periodEnd,
        is_subscribed: true,
      })
      .eq("user_id", profile.user_id);
  }

  await logEvent(profile.user_id, eventId, "invoice.paid", { amount: invoice.amount_paid });
  console.log(`Invoice paid for user ${profile.user_id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, eventId: string) {
  const customerId = invoice.customer as string;
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) return;

  await supabase
    .from("user_profiles")
    .update({ subscription_status: "past_due" })
    .eq("user_id", profile.user_id);

  await logEvent(profile.user_id, eventId, "invoice.payment_failed", {
    attempt: invoice.attempt_count,
    amount: invoice.amount_due,
  });
  console.log(`Payment failed for user ${profile.user_id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, eventId: string) {
  const customerId = subscription.customer as string;
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) return;

  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const priceId = subscription.items.data[0]?.price?.id || null;
  const isActive = ["active", "trialing"].includes(subscription.status);

  await supabase
    .from("user_profiles")
    .update({
      subscription_status: subscription.status,
      subscription_period_end: periodEnd,
      subscription_price_id: priceId,
      is_subscribed: isActive,
      stripe_subscription_id: subscription.id,
    })
    .eq("user_id", profile.user_id);

  await logEvent(profile.user_id, eventId, "customer.subscription.updated", {
    status: subscription.status,
    priceId,
  });
  console.log(`Subscription updated for user ${profile.user_id}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, eventId: string) {
  const customerId = subscription.customer as string;
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) return;

  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  await supabase
    .from("user_profiles")
    .update({
      subscription_status: "canceled",
      subscription_period_end: periodEnd,
      is_subscribed: false,
    })
    .eq("user_id", profile.user_id);

  await logEvent(profile.user_id, eventId, "customer.subscription.deleted", {
    periodEnd,
  });
  console.log(`Subscription canceled for user ${profile.user_id}, access until ${periodEnd}`);
}

// --- Helpers ---

async function logEvent(userId: string, stripeEventId: string, eventType: string, metadata: Record<string, unknown>) {
  await supabase.from("subscription_events").insert({
    user_id: userId,
    stripe_event_id: stripeEventId,
    event_type: eventType,
    metadata,
  });
}
