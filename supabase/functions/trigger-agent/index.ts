// supabase/functions/trigger-agent/index.ts
// Edge Function : proxy pour declencher un workflow GitHub Actions
// depuis le dashboard admin (sans token dans le navigateur).
//
// Usage : POST /functions/v1/trigger-agent
// Body  : { "agent": "editorial", "ticket_id": "UUID" }
//
// Secret requis : PRIVATEHERE (token GitHub avec permissions repo + workflow)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GITHUB_REPO = "robinallainmkg/glp1";

const ALLOWED_AGENTS: Record<string, string> = {
  editorial: "editorial-agent.yml",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST uniquement" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { agent, ticket_id } = await req.json();

    // Validation
    if (!agent || !ALLOWED_AGENTS[agent]) {
      return new Response(
        JSON.stringify({ error: `Agent invalide. Autorises : ${Object.keys(ALLOWED_AGENTS).join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!ticket_id || typeof ticket_id !== "string") {
      return new Response(
        JSON.stringify({ error: "ticket_id requis (UUID)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Token GitHub stocke dans les secrets Supabase
    const githubToken = Deno.env.get("PRIVATEHERE");
    if (!githubToken) {
      return new Response(
        JSON.stringify({ error: "Secret PRIVATEHERE non configure" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Appel GitHub Actions API
    const workflowFile = ALLOWED_AGENTS[agent];
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflowFile}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: "production",
          inputs: {
            ticket_id: ticket_id,
            limit: "1",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`GitHub API error (${response.status}):`, errText);
      return new Response(
        JSON.stringify({ error: `GitHub API erreur (${response.status})` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // 204 No Content = succes
    return new Response(
      JSON.stringify({ ok: true, agent, ticket_id, workflow: workflowFile }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Erreur trigger-agent:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
