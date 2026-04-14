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

function coachCTA(campaign) {
  return `
    <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #059669;">
      <p style="margin: 0 0 8px 0;"><strong>&#128172; Notre Coach IA est disponible 24h/24</strong></p>
      <p style="margin: 0 0 12px 0; font-size: 14px;">Il peut r&eacute;pondre &agrave; toutes vos questions sur les traitements GLP-1, l'alimentation et le suivi.</p>
      <a href="${SITE}/?utm_source=email&utm_medium=sav&utm_campaign=${campaign}#coach" style="display: inline-block; background: #059669; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Parler au Coach IA &rarr;</a>
    </div>`;
}

function wrap(body) {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">GLP1 France</h1>
  </div>
  <div style="padding: 24px; background: #f8faf9; border-radius: 0 0 12px 12px;">
    ${body}
    <p>Bien cordialement,<br><strong>L'&eacute;quipe GLP1 France</strong><br>
    <a href="${SITE}/?utm_source=email&utm_medium=sav" style="color: #059669;">glp1-france.fr</a></p>
  </div>
</div>`;
}

const emails = [
  {
    to: 'sylvia.cadart@laposte.net',
    contactId: 10,
    campaign: 'contact_reply',
    subject: 'Votre question sur la stabilisation sous Mounjaro',
    html: wrap(`
    <p>Bonjour Sylvie,</p>
    <p>Merci pour votre message et f&eacute;licitations pour vos r&eacute;sultats avec Mounjaro &mdash; 10 kg en 2 mois, c'est remarquable !</p>
    <p>Votre question sur la stabilisation est essentielle. Voici les points cl&eacute;s :</p>
    <ul style="line-height: 1.8;">
      <li><strong>L'arr&ecirc;t brutal n'est pas recommand&eacute;</strong> &mdash; une diminution progressive du dosage est pr&eacute;f&eacute;rable, en accord avec votre m&eacute;decin</li>
      <li><strong>La phase de stabilisation</strong> commence g&eacute;n&eacute;ralement apr&egrave;s 6-9 mois de traitement, quand le poids se stabilise naturellement</li>
      <li><strong>L'alimentation et l'activit&eacute; physique</strong> prennent le relais pour maintenir les r&eacute;sultats</li>
    </ul>
    <p>Notre article d&eacute;taill&eacute; sur le sujet :</p>
    <p>&rarr; <a href="${SITE}/collections/glp1-perte-de-poids/arret-glp1-reprise-poids-effet-yoyo-eviter/?utm_source=email&utm_medium=sav&utm_campaign=contact_reply" style="color: #059669;">Arr&ecirc;t GLP-1 : comment &eacute;viter la reprise de poids</a></p>
    ${coachCTA('contact_reply')}
    <p>N'h&eacute;sitez pas &agrave; revenir vers nous si vous avez d'autres questions.</p>`)
  },
  {
    to: 'cathy_mitrani@yahoo.fr',
    contactId: 8,
    campaign: 'diagnostic_reply',
    subject: 'Votre diagnostic GLP-1 — Recommandation Mounjaro',
    html: wrap(`
    <p>Bonjour,</p>
    <p>Merci d'avoir compl&eacute;t&eacute; notre diagnostic GLP-1. Votre profil orientait vers <strong>Mounjaro (tirzépatide)</strong> &mdash; un traitement tr&egrave;s efficace avec des r&eacute;sultats souvent sup&eacute;rieurs aux autres GLP-1.</p>
    <p>Nous avons not&eacute; que le budget est un crit&egrave;re important pour vous. Voici ce qu'il faut savoir :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Prix actuel</strong> : entre 230 et 440 &euro;/mois selon le dosage (non rembours&eacute; pour le moment)</li>
      <li><strong>Bonne nouvelle</strong> : la HAS a donn&eacute; un avis favorable au remboursement en d&eacute;cembre 2025, les n&eacute;gociations sont en cours</li>
      <li><strong>Alternative</strong> : Ozempic est rembours&eacute; &agrave; 30% pour le diab&egrave;te de type 2</li>
    </ul>
    <p>&rarr; <a href="${SITE}/collections/glp1-cout/prix-mounjaro-france/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Guide complet prix Mounjaro France</a></p>
    ${coachCTA('diagnostic_reply')}
    <p>N'h&eacute;sitez pas &agrave; nous recontacter pour toute question.</p>`)
  },
  {
    to: 'danielle.ortais@yahoo.fr',
    contactId: 6,
    campaign: 'diagnostic_reply',
    subject: 'Votre diagnostic GLP-1 — Recommandation Wegovy',
    html: wrap(`
    <p>Bonjour,</p>
    <p>Merci d'avoir compl&eacute;t&eacute; notre diagnostic GLP-1. Votre profil orientait vers <strong>Wegovy (s&eacute;maglutide 2,4 mg)</strong> &mdash; le traitement de r&eacute;f&eacute;rence pour la perte de poids.</p>
    <p>Voici les informations essentielles :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Wegovy</strong> est disponible en France depuis avril 2024</li>
      <li><strong>Prix</strong> : entre 200 et 320 &euro;/mois selon le dosage</li>
      <li><strong>Remboursement</strong> : pas encore pris en charge, mais attendu courant 2026</li>
      <li><strong>Votre exercice r&eacute;gulier</strong> est un excellent facteur qui amplifie les r&eacute;sultats</li>
    </ul>
    <p>&rarr; <a href="${SITE}/collections/traitements-glp1/guide-complet-wegovy/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Guide complet Wegovy</a></p>
    <p>&rarr; <a href="${SITE}/collections/glp1-cout/prix-wegovy-france/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Prix Wegovy en France</a></p>
    ${coachCTA('diagnostic_reply')}
    <p>N'h&eacute;sitez pas &agrave; nous recontacter pour toute question.</p>`)
  }
];

async function sendAll() {
  const transporter = nodemailer.createTransport(SMTP_CONFIG);

  for (const email of emails) {
    try {
      // 1. Send via SMTP
      const info = await transporter.sendMail({
        from: FROM,
        to: email.to,
        subject: email.subject,
        html: email.html
      });
      console.log(`\u2705 SMTP sent to ${email.to} -> ${info.messageId}`);

      // 2. Copy to IMAP Sent folder
      try {
        const imap = new ImapFlow({ ...IMAP_CONFIG, logger: false });
        await imap.connect();
        const raw = [
          `From: ${FROM}`,
          `To: ${email.to}`,
          `Subject: ${email.subject}`,
          `Content-Type: text/html; charset=utf-8`,
          `Date: ${new Date().toUTCString()}`,
          `Message-ID: ${info.messageId}`,
          '',
          email.html
        ].join('\r\n');
        await imap.append('INBOX.Sent', raw, ['\\Seen']);
        await imap.logout();
        console.log('  \uD83D\uDCE7 IMAP copy saved to Sent');
      } catch (imapErr) {
        console.log('  \u26A0\uFE0F IMAP copy failed:', imapErr.message);
      }

      // 3. Log in Supabase
      try {
        const res = await fetch(`${SUPA_URL}/rest/v1/email_replies`, {
          method: 'POST',
          headers: {
            'apikey': SUPA_KEY,
            'Authorization': `Bearer ${SUPA_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            from_email: 'robin@glp1-france.fr',
            to_email: email.to,
            subject: email.subject,
            body_html: email.html,
            category: email.campaign,
            utm_campaign: email.campaign,
            sent_at: new Date().toISOString(),
            sent_to_imap: true
          })
        });
        if (res.ok) console.log('  \uD83D\uDCCA Supabase logged');
        else console.log('  \u26A0\uFE0F Supabase error:', res.status, await res.text());
      } catch (e) {
        console.log('  \u26A0\uFE0F DB log failed:', e.message);
      }

      // 4. Update contact status
      try {
        const res = await fetch(`${SUPA_URL}/rest/v1/contacts?id=eq.${email.contactId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPA_KEY,
            'Authorization': `Bearer ${SUPA_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ status: 'replied', updated_at: new Date().toISOString() })
        });
        if (res.ok) console.log('  \u270F\uFE0F Contact status -> replied');
      } catch (e) {}

    } catch (err) {
      console.log(`\u274C FAILED ${email.to}: ${err.message}`);
    }
  }

  console.log('\nDone!');
}

sendAll();
