// supabase/functions/relance-dossiers/index.ts
// Relance automatique des dossiers GLP-1 abandonnes avant paiement.
// Invoquee quotidiennement par pg_cron (via pg_net) avec la service role key.
// Le mot de passe SMTP est lu depuis Vault via public.get_secret (service_role only).
//
// Cible : dossiers "pending" crees il y a plus de 4h et moins de 7 jours,
// avec email, jamais relances (relance_sent_at IS NULL). Une seule relance par dossier.
//
// SMTP implemente en direct (Deno.connectTls) : denomailer produisait un
// MAIL FROM rejete par le Postfix de Hostinger (553 sender address rejected).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MIN_AGE_HOURS = 4;
const MAX_AGE_DAYS = 7;
const SITE = "https://glp1-france.fr";
const CAMPAIGN = "dossier_relance";
const FROM_EMAIL = "robin@glp1-france.fr";
const SMTP_HOST = "smtp.hostinger.com";
const SMTP_PORT = 465;

// --- Client SMTP minimal (TLS implicite port 465) ---
class SmtpError extends Error {
  constructor(message: string, public transcript: string[]) {
    super(message);
  }
}

async function smtpSend(opts: {
  username: string;
  password: string;
  to: string;
  subject: string;
  html: string;
}) {
  const conn = await Deno.connectTls({ hostname: SMTP_HOST, port: SMTP_PORT });
  const reader = conn.readable.getReader();
  const writer = conn.writable.getWriter();
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const transcript: string[] = [];
  let buffer = "";

  async function readReply(): Promise<string> {
    // Une reponse se termine par une ligne "NNN " (espace apres le code)
    while (true) {
      const lines = buffer.split("\r\n");
      for (const line of lines) {
        if (/^\d{3} /.test(line)) {
          const reply = buffer;
          buffer = "";
          transcript.push(`S: ${reply.trim()}`);
          return reply;
        }
      }
      const { value, done } = await reader.read();
      if (done) throw new SmtpError("connexion fermee par le serveur", transcript);
      buffer += dec.decode(value);
    }
  }

  async function cmd(command: string, expect: number[], redact = false): Promise<string> {
    transcript.push(`C: ${redact ? "[redacted]" : command}`);
    await writer.write(enc.encode(command + "\r\n"));
    const reply = await readReply();
    const code = parseInt(reply.slice(0, 3), 10);
    if (!expect.includes(code)) {
      throw new SmtpError(`"${redact ? "[redacted]" : command}" -> ${reply.trim()}`, transcript);
    }
    return reply;
  }

  try {
    await readReply(); // banniere 220
    await cmd(`EHLO ${SMTP_HOST}`, [250]);
    await cmd("AUTH LOGIN", [334]);
    await cmd(btoa(opts.username), [334], true);
    await cmd(btoa(opts.password), [235], true);
    await cmd(`MAIL FROM:<${FROM_EMAIL}>`, [250]);
    await cmd(`RCPT TO:<${opts.to}>`, [250, 251]);
    await cmd("DATA", [354]);

    const subjectB64 = btoa(String.fromCharCode(...new TextEncoder().encode(opts.subject)));
    const headers = [
      `From: "GLP1 France" <${FROM_EMAIL}>`,
      `To: <${opts.to}>`,
      `Subject: =?utf-8?B?${subjectB64}?=`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: base64`,
    ].join("\r\n");

    // Corps en base64 (evite le dot-stuffing et les soucis d'encodage)
    const htmlB64 = btoa(String.fromCharCode(...new TextEncoder().encode(opts.html)))
      .replace(/(.{76})/g, "$1\r\n");

    await cmd(`${headers}\r\n\r\n${htmlB64}\r\n.`, [250]);
    await cmd("QUIT", [221]);
  } finally {
    try { reader.releaseLock(); writer.releaseLock(); conn.close(); } catch { /* deja fermee */ }
  }
}

// --- Email de relance ---
function wrap(body: string): string {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: #1a3c34; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">GLP1 France</h1>
  </div>
  <div style="padding: 24px; background: #f8faf9; border-radius: 0 0 12px 12px;">
    ${body}
    <p>Bien cordialement,<br><strong>L'&eacute;quipe GLP1 France</strong><br>
    <a href="${SITE}/?utm_source=email&utm_medium=sav" style="color: #16a34a;">glp1-france.fr</a></p>
  </div>
</div>`;
}

function buildEmail(dossier: { prenom?: string | null }) {
  const prenom = dossier.prenom ? ` ${dossier.prenom}` : "";
  const subject = "Votre Dossier GLP-1 personnalisé vous attend";
  const body = `
  <p>Bonjour${prenom},</p>
  <p>Vous avez commenc&eacute; la pr&eacute;paration de votre <strong>Dossier GLP-1 personnalis&eacute;</strong> sur glp1-france.fr, mais la commande n'a pas &eacute;t&eacute; finalis&eacute;e.</p>
  <p>Votre dossier comprend :</p>
  <ul style="line-height: 1.8;">
    <li>Votre <strong>verdict d'&eacute;ligibilit&eacute;</strong> au remboursement &agrave; 65%</li>
    <li>La <strong>checklist compl&egrave;te</strong> pour votre rendez-vous m&eacute;decin</li>
    <li>Les <strong>CSO / CHU les plus proches</strong> de chez vous</li>
    <li>Les <strong>questions &agrave; poser</strong> &agrave; votre m&eacute;decin</li>
  </ul>
  <p>Le tout pr&ecirc;t &agrave; imprimer, pour <strong>4,99&nbsp;&euro;</strong>.</p>
  <div style="text-align: center; margin: 24px 0;">
    <a href="${SITE}/dossier-glp1/?utm_source=email&utm_medium=sav&utm_campaign=${CAMPAIGN}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Finaliser mon dossier &rarr;</a>
  </div>
  <p style="font-size: 14px; color: #555;">Une question avant de vous d&eacute;cider ? Notre <a href="${SITE}/?utm_source=email&utm_medium=sav&utm_campaign=${CAMPAIGN}#coach" style="color: #16a34a;">Coach IA</a> est disponible gratuitement 24h/24.</p>`;
  return { subject, html: wrap(body) };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST uniquement" }), { status: 405 });
  }

  // Seule la service role key peut invoquer cette fonction (verify_jwt laisse passer l'anon key).
  // verify_jwt=true garantit une signature valide ; on verifie ici le claim role.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  let role = "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    role = payload.role || "";
  } catch { /* token illisible -> role vide */ }
  if (role !== "service_role") {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

  const { data: smtpPass, error: secretError } = await supabase.rpc("get_secret", {
    secret_name: "smtp_pass",
  });
  if (secretError || !smtpPass) {
    console.error("Impossible de lire smtp_pass depuis Vault:", secretError);
    return new Response(JSON.stringify({ error: "smtp_pass introuvable" }), { status: 500 });
  }

  const maxCreated = new Date(Date.now() - MIN_AGE_HOURS * 3600 * 1000).toISOString();
  const minCreated = new Date(Date.now() - MAX_AGE_DAYS * 86400 * 1000).toISOString();

  const { data: dossiers, error } = await supabase
    .from("dossiers")
    .select("id, email, prenom, created_at")
    .eq("status", "pending")
    .is("relance_sent_at", null)
    .not("email", "is", null)
    .lt("created_at", maxCreated)
    .gt("created_at", minCreated);

  if (error) {
    console.error("Erreur requete dossiers:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!dossiers || dossiers.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "Aucun dossier a relancer" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: Array<{ id: string; email: string; ok: boolean; error?: string; transcript?: string[] }> = [];

  for (const dossier of dossiers) {
    const { subject, html } = buildEmail(dossier);
    try {
      await smtpSend({
        username: FROM_EMAIL,
        password: smtpPass,
        to: dossier.email,
        subject,
        html,
      });

      // Marquer relance envoyee immediatement pour eviter tout double envoi
      await supabase
        .from("dossiers")
        .update({ relance_sent_at: new Date().toISOString() })
        .eq("id", dossier.id);

      await supabase.from("email_replies").insert({
        from_email: FROM_EMAIL,
        to_email: dossier.email,
        subject,
        body_html: html,
        category: CAMPAIGN,
        utm_campaign: CAMPAIGN,
        sent_at: new Date().toISOString(),
        sent_to_imap: false,
      });

      results.push({ id: dossier.id, email: dossier.email, ok: true });
      console.log(`Relance envoyee a ${dossier.email} (dossier ${dossier.id})`);
    } catch (err) {
      const transcript = err instanceof SmtpError ? err.transcript : undefined;
      results.push({ id: dossier.id, email: dossier.email, ok: false, error: (err as Error).message, transcript });
      console.error(`Erreur envoi ${dossier.email}:`, err);
    }
  }

  const sent = results.filter((r) => r.ok).length;
  return new Response(JSON.stringify({ sent, total: dossiers.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
