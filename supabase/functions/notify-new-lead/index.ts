// supabase/functions/notify-new-lead/index.ts
// Edge Function: Send email alert when new lead data arrives
// Triggered by database webhooks on contacts, coach_conversations, user_feedback
//
// Requires Supabase secrets:
//   RESEND_API_KEY  (free: https://resend.com — 100 emails/day)
//   ALERT_EMAIL_TO  (e.g. robinallainmkg@gmail.com)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Emails to ignore (your own test accounts)
const IGNORED_EMAILS = [
  'webmaster@talika.com',
  'robinallainmkg@gmail.com',
];

serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.json();

    // Supabase webhook payload format: { type, table, record, schema, old_record }
    const { type, table, record } = payload;

    if (type !== 'INSERT' || !record) {
      return new Response(JSON.stringify({ skipped: true, reason: 'not an INSERT' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract email from record depending on table
    const email = record.email || null;

    // Skip if it's a known/ignored email
    if (email && IGNORED_EMAILS.includes(email.toLowerCase())) {
      return new Response(JSON.stringify({ skipped: true, reason: 'ignored email' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For coach_conversations, skip — we'll alert on the first message instead
    // Actually, let's alert on new conversations too (they have session_id)

    // Build alert content based on table
    let subject = '';
    let body = '';
    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    if (table === 'contacts') {
      const isNewsletter = record.newsletter === true && !record.nom && !record.telephone;
      const isDiagnostic = record.subject === 'Diagnostic GLP-1';

      if (isNewsletter) {
        subject = `📧 Nouvelle inscription newsletter: ${email}`;
        body = `<h2>📧 Nouvelle inscription newsletter</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${timestamp}</p>`;
      } else if (isDiagnostic) {
        subject = `🩺 Nouveau diagnostic complété: ${email}`;
        body = `<h2>🩺 Diagnostic GLP-1 complété</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Nom:</strong> ${record.nom || '-'}</p>
          <p><strong>Message:</strong> ${record.message || '-'}</p>
          <p><strong>Newsletter:</strong> ${record.newsletter ? 'Oui' : 'Non'}</p>
          <p><strong>Date:</strong> ${timestamp}</p>`;
      } else {
        subject = `✉️ Nouveau message contact: ${email || 'Anonyme'}`;
        body = `<h2>✉️ Nouveau message de contact</h2>
          <p><strong>Nom:</strong> ${record.nom || '-'}</p>
          <p><strong>Email:</strong> ${email || '-'}</p>
          <p><strong>Téléphone:</strong> ${record.telephone || '-'}</p>
          <p><strong>Sujet:</strong> ${record.subject || '-'}</p>
          <p><strong>Traitement:</strong> ${record.treatment || '-'}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background:#f5f5f5;padding:12px;border-left:3px solid #16a34a;margin:8px 0;">${record.message || '-'}</blockquote>
          <p><strong>Newsletter:</strong> ${record.newsletter ? 'Oui' : 'Non'}</p>
          <p><strong>Date:</strong> ${timestamp}</p>`;
      }
    } else if (table === 'coach_conversations') {
      subject = `💬 Nouvelle conversation Coach IA`;
      body = `<h2>💬 Nouvelle conversation Coach IA</h2>
        <p><strong>Session:</strong> ${record.session_id || '-'}</p>
        <p><strong>Page:</strong> ${record.page_url || '-'}</p>
        <p><strong>Date:</strong> ${timestamp}</p>
        <p><a href="https://glp1-france.fr/admin/chats/">→ Voir les chats</a></p>`;
    } else if (table === 'user_feedback') {
      subject = `⭐ Nouveau feedback: ${record.name || email || 'Anonyme'}`;
      body = `<h2>⭐ Nouveau feedback</h2>
        <p><strong>Nom:</strong> ${record.name || '-'}</p>
        <p><strong>Email:</strong> ${email || '-'}</p>
        <p><strong>Type:</strong> ${record.type || '-'}</p>
        <p><strong>Note:</strong> ${record.rating ? record.rating + '/5' : '-'}</p>
        <p><strong>Contenu:</strong></p>
        <blockquote style="background:#f5f5f5;padding:12px;border-left:3px solid #f59e0b;margin:8px 0;">${record.story || record.comment || '-'}</blockquote>
        <p><strong>Page:</strong> ${record.page_url || '-'}</p>
        <p><strong>Date:</strong> ${timestamp}</p>`;
    } else {
      return new Response(JSON.stringify({ skipped: true, reason: 'unknown table' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Wrap in email template
    const htmlBody = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:#0a0e17;color:white;padding:16px 24px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;font-size:16px;">🏥 GLP-1 France — Alerte Lead</h1>
        </div>
        <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          ${body}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="font-size:12px;color:#94a3b8;">
            <a href="https://glp1-france.fr/admin/leads/" style="color:#3b82f6;">→ Dashboard Leads & Data</a>
          </p>
        </div>
      </div>`;

    // Send email via Resend API
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const ALERT_EMAIL_TO = Deno.env.get('ALERT_EMAIL_TO') || 'robinallainmkg@gmail.com';

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set');
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GLP-1 France <onboarding@resend.dev>',
        to: [ALERT_EMAIL_TO],
        subject: subject,
        html: htmlBody,
      }),
    });

    const emailResult = await emailRes.json();

    if (!emailRes.ok) {
      console.error('Resend error:', emailResult);
      return new Response(JSON.stringify({ error: 'email send failed', detail: emailResult }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Alert sent:', subject);
    return new Response(JSON.stringify({ success: true, subject, emailId: emailResult.id }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('notify-new-lead error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
