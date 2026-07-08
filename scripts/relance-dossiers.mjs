// Relance automatique des dossiers GLP-1 abandonnes avant paiement.
// Cible : dossiers en statut "pending" crees il y a plus de 4h et moins de 7 jours,
// avec un email, et jamais relances (relance_sent_at IS NULL).
// Une seule relance par dossier. Lance quotidiennement par GitHub Actions.

import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import dotenv from 'dotenv';
dotenv.config();

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
};

const IMAP_CONFIG = {
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT),
  secure: true,
  auth: { user: process.env.IMAP_USER, pass: process.env.IMAP_PASS }
};

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FROM = '"GLP1 France" <robin@glp1-france.fr>';
const SITE = 'https://glp1-france.fr';
const CAMPAIGN = 'dossier_relance';

// Fenetre de relance : abandonne depuis au moins 4h, pas plus vieux que 7 jours
const MIN_AGE_HOURS = 4;
const MAX_AGE_DAYS = 7;

function buildEmail(dossier) {
  const prenom = dossier.prenom ? ` ${dossier.prenom}` : '';
  const subject = 'Votre Dossier GLP-1 personnalisé vous attend';
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

function wrap(body) {
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

async function supaFetch(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...rest,
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    }
  });
  return res;
}

async function main() {
  const maxCreated = new Date(Date.now() - MIN_AGE_HOURS * 3600 * 1000).toISOString();
  const minCreated = new Date(Date.now() - MAX_AGE_DAYS * 86400 * 1000).toISOString();

  const res = await supaFetch(
    `dossiers?status=eq.pending&relance_sent_at=is.null&email=not.is.null` +
    `&created_at=lt.${maxCreated}&created_at=gt.${minCreated}&select=id,email,prenom,created_at`
  );
  if (!res.ok) {
    console.error(`Erreur Supabase: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const dossiers = await res.json();

  if (!dossiers.length) {
    console.log('Aucun dossier abandonne a relancer.');
    return;
  }

  console.log(`${dossiers.length} dossier(s) abandonne(s) a relancer\n`);
  const transporter = nodemailer.createTransport(SMTP_CONFIG);

  for (const dossier of dossiers) {
    const { subject, html } = buildEmail(dossier);

    try {
      const info = await transporter.sendMail({ from: FROM, to: dossier.email, subject, html });
      console.log(`✅ Relance envoyee a ${dossier.email} (dossier ${dossier.id}) -> ${info.messageId}`);

      // Marquer le dossier comme relance AVANT toute autre etape non critique,
      // pour eviter un double envoi si la suite echoue
      const patchRes = await supaFetch(`dossiers?id=eq.${dossier.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ relance_sent_at: new Date().toISOString() })
      });
      if (patchRes.ok) console.log('  ✏️ relance_sent_at mis a jour');
      else console.log(`  ⚠️ PATCH dossiers echoue: ${patchRes.status}`);

      // Copie IMAP Sent
      try {
        const imap = new ImapFlow({ ...IMAP_CONFIG, logger: false });
        await imap.connect();
        const raw = [
          `From: ${FROM}`,
          `To: ${dossier.email}`,
          `Subject: ${subject}`,
          `Content-Type: text/html; charset=utf-8`,
          `Date: ${new Date().toUTCString()}`,
          `Message-ID: ${info.messageId}`,
          '',
          html
        ].join('\r\n');
        await imap.append('INBOX.Sent', raw, ['\\Seen']);
        await imap.logout();
        console.log('  📧 IMAP copie Sent OK');
      } catch (imapErr) {
        console.log('  ⚠️ IMAP copy failed:', imapErr.message);
      }

      // Log dans email_replies
      const logRes = await supaFetch('email_replies', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          from_email: 'robin@glp1-france.fr',
          to_email: dossier.email,
          subject,
          body_html: html,
          category: CAMPAIGN,
          utm_campaign: CAMPAIGN,
          sent_at: new Date().toISOString(),
          sent_to_imap: true
        })
      });
      if (logRes.ok) console.log('  📊 Supabase logged\n');
      else console.log(`  ⚠️ Supabase log error: ${logRes.status}\n`);

    } catch (err) {
      console.log(`❌ ERREUR ${dossier.email}: ${err.message}\n`);
    }
  }

  console.log('Done!');
}

main();
