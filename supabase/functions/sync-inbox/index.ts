// supabase/functions/sync-inbox/index.ts
// Sync IMAP robin@glp1-france.fr (Hostinger) -> table incoming_emails.
// Remplace la sync locale (scripts/sync-emails.mjs) qui ne tournait que sur le
// poste de Robin et s'est arretee le 20/05. Ici cote serveur, mot de passe lu
// depuis Vault (public.get_secret 'smtp_pass'), invocable par pg_cron.
// Protege par un token dans le body (verify_jwt=false).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ImapFlow } from "npm:imapflow@1.2.14";

// Valeur réelle définie au déploiement + dans le job pg_cron `sync-inbox-15min`.
// Redigée ici pour ne pas committer le secret dans le repo (garder les deux en phase si redéploiement).
const GUARD_TOKEN = Deno.env.get("SYNC_INBOX_TOKEN") ?? "<set-at-deploy>";
const IMAP_HOST = "imap.hostinger.com";
const IMAP_PORT = 993;
const IMAP_USER = "robin@glp1-france.fr";

const IGNORED = [
  "robinallainmkg@gmail.com",
  "robin@glp1-france.fr",
  "noreply@",
  "no-reply@",
  "mailer-daemon@",
  "webmaster@talika.com",
];

function isIgnored(email: string): boolean {
  if (!email) return true;
  const l = email.toLowerCase();
  return IGNORED.some((x) => l.includes(x));
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST uniquement" }), { status: 405 });
  }

  let body: { token?: string; sinceDays?: number } = {};
  try { body = await req.json(); } catch { /* vide */ }
  if (body.token !== GUARD_TOKEN) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  const sinceDays = Math.min(Math.max(body.sinceDays ?? 30, 1), 120);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: pass, error: secretErr } = await supabase.rpc("get_secret", { secret_name: "smtp_pass" });
  if (secretErr || !pass) {
    return new Response(JSON.stringify({ error: "smtp_pass introuvable", detail: secretErr }), { status: 500 });
  }

  const client = new ImapFlow({
    host: IMAP_HOST, port: IMAP_PORT, secure: true,
    auth: { user: IMAP_USER, pass },
    logger: false,
  });

  const result = { synced: 0, skipped: 0, ignored: 0, total: 0, yanick: [] as string[] };

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    const { data: existing } = await supabase.from("incoming_emails").select("message_id");
    const seen = new Set((existing || []).map((e: any) => e.message_id));

    const sinceDate = new Date(Date.now() - sinceDays * 86400 * 1000);

    for await (const msg of client.fetch({ since: sinceDate }, { envelope: true, source: true, uid: true })) {
      result.total++;
      const env = msg.envelope;
      if (!env) continue;
      const messageId = env.messageId || `uid-${msg.uid}`;
      if (seen.has(messageId)) { result.skipped++; continue; }

      const from = (env.from && env.from[0]) || {};
      const fromEmail = from.address || "";
      const fromName = from.name || "";
      if (isIgnored(fromEmail)) { result.ignored++; continue; }

      let bodyText = "";
      if (msg.source) {
        const src = typeof msg.source === "string" ? msg.source : new TextDecoder().decode(msg.source);
        const headerEnd = src.indexOf("\r\n\r\n");
        if (headerEnd !== -1) bodyText = src.substring(headerEnd + 4);
        const m = src.match(/Content-Type: text\/plain[^\r\n]*\r\n(?:Content-Transfer-Encoding:[^\r\n]*\r\n)?\r\n([\s\S]*?)(?:\r\n--|\r\n\.\r\n|$)/i);
        if (m) bodyText = m[1].trim();
        bodyText = bodyText
          .replace(/=\r\n/g, "")
          .replace(/=([0-9A-F]{2})/gi, (_: string, h: string) => String.fromCharCode(parseInt(h, 16)))
          .substring(0, 5000);
      }

      const record = {
        message_id: messageId,
        from_email: fromEmail,
        from_name: fromName || null,
        to_email: IMAP_USER,
        subject: env.subject || null,
        body_text: bodyText || null,
        received_at: env.date ? new Date(env.date).toISOString() : new Date().toISOString(),
        category: "inbox",
      };

      const { error } = await supabase.from("incoming_emails").upsert(record, { onConflict: "message_id" });
      if (!error) {
        result.synced++;
        if (fromEmail.toLowerCase().includes("kym.beaute")) {
          result.yanick.push(`${env.subject || "(no subject)"} @ ${record.received_at}`);
        }
      }
    }

    await client.logout();
  } catch (err) {
    try { await client.logout(); } catch { /* deja ferme */ }
    return new Response(JSON.stringify({ error: (err as Error).message, ...result }), { status: 500 });
  }

  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
});
