// send-feedback-email — DÉSACTIVÉE.
// Fonction one-shot ayant servi à envoyer l'email de satisfaction au premier
// client payant du Dossier (Yanick, 2026-07-23). Neutralisée après usage :
// ne contient plus aucune logique d'envoi SMTP ni d'accès au secret Vault.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(() => new Response(JSON.stringify({ error: "gone", message: "one-shot function disabled" }), {
  status: 410,
  headers: { "Content-Type": "application/json" },
}));
