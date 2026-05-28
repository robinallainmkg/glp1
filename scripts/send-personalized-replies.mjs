import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import dotenv from 'dotenv';
dotenv.config();

const SMTP_CONFIG = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: { user: process.env.IMAP_USER, pass: process.env.IMAP_PASS }
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
      <p style="margin: 0 0 12px 0; font-size: 14px;">Il peut r&eacute;pondre &agrave; toutes vos questions sur les traitements GLP-1, l'alimentation et le suivi m&eacute;dical.</p>
      <a href="${SITE}/?utm_source=email&utm_medium=sav&utm_campaign=${campaign}#coach" style="display: inline-block; background: #059669; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Parler au Coach IA &rarr;</a>
    </div>`;
}

function annetteCTA(campaign) {
  return `
    <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0;"><strong>&#129657; Besoin d'un accompagnement m&eacute;dical ?</strong></p>
      <p style="margin: 0 0 8px 0; font-size: 14px;">Notre partenaire <strong>Annette.care</strong> propose un suivi di&eacute;t&eacute;tique + acc&egrave;s &agrave; des m&eacute;decins partenaires pour la prescription GLP-1.</p>
      <p style="margin: 0 0 12px 0; font-size: 14px;">&#127873; Code promo : <strong>CARE50</strong> &mdash; 50% sur le 1er mois (24,50&euro; au lieu de 49&euro;)</p>
      <a href="https://www.annette.care/?utm_source=glp1france&utm_medium=email_sav&utm_campaign=${campaign}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">D&eacute;couvrir Annette.care &rarr;</a>
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
  // === 4 DIAGNOSTIC CONTACTS → Coach IA + Annette ===
  {
    to: 'mabireemilie97@gmail.com',
    contactId: 91,
    campaign: 'diagnostic_followup',
    subject: 'Votre diagnostic GLP-1 — Prochaines étapes',
    html: wrap(`
    <p>Bonjour Emilie,</p>
    <p>Merci d'avoir compl&eacute;t&eacute; notre diagnostic GLP-1. Nous avons bien re&ccedil;u vos informations.</p>
    <p>D'apr&egrave;s votre profil, les traitements GLP-1 pourraient &ecirc;tre une option int&eacute;ressante pour vous. Voici les prochaines &eacute;tapes que nous vous recommandons :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Consulter notre Coach IA</strong> qui peut r&eacute;pondre &agrave; toutes vos questions sur les traitements, les prix, l'&eacute;ligibilit&eacute; et le suivi</li>
      <li><strong>Obtenir un accompagnement m&eacute;dical</strong> avec un sp&eacute;cialiste pour &eacute;valuer votre &eacute;ligibilit&eacute; &agrave; une prescription</li>
    </ul>
    ${coachCTA('diagnostic_followup')}
    ${annetteCTA('diagnostic_followup')}
    <p>N'h&eacute;sitez pas &agrave; nous recontacter si vous avez des questions.</p>`)
  },
  {
    to: 'ludina85@hotmail.fr',
    contactId: 87,
    campaign: 'diagnostic_followup',
    subject: 'Votre diagnostic GLP-1 — Prochaines étapes',
    html: wrap(`
    <p>Bonjour,</p>
    <p>Merci d'avoir compl&eacute;t&eacute; notre diagnostic GLP-1. Nous avons bien re&ccedil;u vos informations.</p>
    <p>Votre profil sugg&egrave;re que les traitements GLP-1 pourraient vous apporter des r&eacute;sultats significatifs. Voici ce que nous vous recommandons :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Parlez &agrave; notre Coach IA</strong> &mdash; il peut vous orienter sur les traitements adapt&eacute;s, les prix et les d&eacute;marches pour obtenir une prescription</li>
      <li><strong>Consultez un sp&eacute;cialiste</strong> pour un accompagnement personnalis&eacute; et une &eacute;valuation m&eacute;dicale</li>
    </ul>
    ${coachCTA('diagnostic_followup')}
    ${annetteCTA('diagnostic_followup')}
    <p>N'h&eacute;sitez pas &agrave; revenir vers nous.</p>`)
  },
  {
    to: 'lola.schwoerer@hotmail.fr',
    contactId: 86,
    campaign: 'diagnostic_followup',
    subject: 'Votre diagnostic GLP-1 — Prochaines étapes',
    html: wrap(`
    <p>Bonjour Lola,</p>
    <p>Merci d'avoir compl&eacute;t&eacute; notre diagnostic GLP-1.</p>
    <p>Bonne nouvelle : votre pratique sportive r&eacute;guli&egrave;re est un excellent facteur qui amplifie les r&eacute;sultats des traitements GLP-1. Voici nos recommandations :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Notre Coach IA</strong> peut vous aider &agrave; identifier le traitement le plus adapt&eacute; &agrave; votre profil et r&eacute;pondre &agrave; toutes vos questions</li>
      <li><strong>Un accompagnement m&eacute;dical</strong> vous permettra d'&eacute;valuer votre &eacute;ligibilit&eacute; et d'obtenir une prescription si adapt&eacute;e</li>
    </ul>
    ${coachCTA('diagnostic_followup')}
    ${annetteCTA('diagnostic_followup')}
    <p>N'h&eacute;sitez pas &agrave; nous recontacter.</p>`)
  },
  {
    to: 'thoeli@free.fr',
    contactId: 85,
    campaign: 'diagnostic_followup',
    subject: 'Votre diagnostic GLP-1 — Prochaines étapes',
    html: wrap(`
    <p>Bonjour,</p>
    <p>Merci d'avoir compl&eacute;t&eacute; notre diagnostic GLP-1. Nous avons bien re&ccedil;u vos informations.</p>
    <p>Vous avez indiqu&eacute; pr&eacute;f&eacute;rer une approche progressive &mdash; c'est exactement ce que permettent les traitements GLP-1, avec une mont&eacute;e de dose graduelle. Voici nos recommandations :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Consultez notre Coach IA</strong> pour explorer les options de traitement et comprendre le protocole progressif</li>
      <li><strong>Un accompagnement m&eacute;dical sp&eacute;cialis&eacute;</strong> peut vous guider dans la d&eacute;marche d'obtention d'une prescription</li>
    </ul>
    ${coachCTA('diagnostic_followup')}
    ${annetteCTA('diagnostic_followup')}
    <p>N'h&eacute;sitez pas &agrave; revenir vers nous si vous avez des questions.</p>`)
  },

  // === 5 SCAM VICTIMS → Explain we're NOT the seller ===
  {
    to: 'sophiegudefin@gmail.com',
    contactId: 90,
    campaign: 'scam_alert',
    subject: 'Re: Votre message — GLP1 France ≠ vendeur de compléments',
    html: wrap(`
    <p>Bonjour Sophie,</p>
    <p>Nous avons bien re&ccedil;u votre message et nous comprenons votre frustration.</p>
    <p><strong>Important : GLP1 France est un site d'information ind&eacute;pendant.</strong> Nous ne vendons aucun produit, compl&eacute;ment alimentaire ou m&eacute;dicament. Nous n'avons aucun lien avec les sites qui vendent des &laquo; g&eacute;lules GLP-1 &raquo; ou &laquo; GLP-Diet &raquo;.</p>
    <p>Voici les d&eacute;marches que nous vous recommandons :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Faites opposition aupr&egrave;s de votre banque</strong> pour bloquer tout pr&eacute;l&egrave;vement futur et demander un remboursement</li>
      <li><strong>Signalez l'arnaque sur <a href="https://www.signal.conso.gouv.fr/" style="color: #059669;">SignalConso</a></strong> (service officiel de la DGCCRF)</li>
      <li><strong>D&eacute;posez plainte</strong> sur <a href="https://www.pre-plainte-en-ligne.gouv.fr/" style="color: #059669;">pr&eacute;-plainte en ligne</a> ou au commissariat</li>
      <li><strong>Contactez votre banque</strong> pour contester le pr&eacute;l&egrave;vement (proc&eacute;dure de chargeback)</li>
    </ul>
    <p>Ces arnaques utilisent des noms proches de &laquo; GLP-1 &raquo; pour tromper les consommateurs. Les vrais traitements GLP-1 (Ozempic, Wegovy, Mounjaro) sont des m&eacute;dicaments sur ordonnance, jamais vendus en ligne sans prescription.</p>
    ${coachCTA('scam_alert')}
    <p>Nous esp&eacute;rons que vous pourrez r&eacute;cup&eacute;rer votre argent. Bon courage.</p>`)
  },
  {
    to: 'cg65.gaillardou@gmail.fr',
    contactId: 89,
    campaign: 'scam_alert',
    subject: 'Re: Prélèvement non autorisé — GLP1 France ≠ vendeur',
    html: wrap(`
    <p>Bonjour,</p>
    <p>Nous avons bien re&ccedil;u votre message concernant un pr&eacute;l&egrave;vement de 44,88&euro; non autoris&eacute;.</p>
    <p><strong>Important : GLP1 France est un site d'information ind&eacute;pendant.</strong> Nous ne vendons aucun produit et n'effectuons aucun pr&eacute;l&egrave;vement. Nous n'avons aucun lien avec &laquo; GLP-Diet &raquo; ou tout autre vendeur de compl&eacute;ments.</p>
    <p>Voici les d&eacute;marches urgentes &agrave; effectuer :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Faites opposition imm&eacute;diatement</strong> aupr&egrave;s de votre banque pour bloquer les pr&eacute;l&egrave;vements et demander un remboursement</li>
      <li><strong>Signalez sur <a href="https://www.signal.conso.gouv.fr/" style="color: #059669;">SignalConso</a></strong> (service officiel de la DGCCRF)</li>
      <li><strong>D&eacute;posez plainte</strong> sur <a href="https://www.pre-plainte-en-ligne.gouv.fr/" style="color: #059669;">pr&eacute;-plainte en ligne</a></li>
    </ul>
    <p>Les vrais traitements GLP-1 (Ozempic, Wegovy, Mounjaro) sont des m&eacute;dicaments sur ordonnance, jamais vendus en ligne sous forme de compl&eacute;ments.</p>
    ${coachCTA('scam_alert')}
    <p>Bon courage dans vos d&eacute;marches.</p>`)
  },
  {
    to: 'arlette.antzenberger@yahoo.fr',
    contactId: 88,
    campaign: 'scam_alert',
    subject: 'Re: Votre commande — GLP1 France ≠ vendeur de compléments',
    html: wrap(`
    <p>Bonjour,</p>
    <p>Nous avons re&ccedil;u votre message concernant une commande de 3 flacons sans confirmation.</p>
    <p><strong>Important : GLP1 France est un site d'information ind&eacute;pendant.</strong> Nous ne vendons aucun produit, compl&eacute;ment alimentaire ou m&eacute;dicament. Si vous avez pass&eacute; commande sur un autre site, il ne s'agit pas de nous.</p>
    <p>Voici ce que nous vous recommandons :</p>
    <ul style="line-height: 1.8;">
      <li><strong>V&eacute;rifiez le site exact</strong> o&ugrave; vous avez command&eacute; (historique navigateur, email de confirmation)</li>
      <li><strong>Contactez votre banque</strong> pour faire opposition si n&eacute;cessaire</li>
      <li><strong>Signalez sur <a href="https://www.signal.conso.gouv.fr/" style="color: #059669;">SignalConso</a></strong> si vous pensez &ecirc;tre victime d'une arnaque</li>
      <li><strong>D&eacute;posez plainte</strong> si un pr&eacute;l&egrave;vement a &eacute;t&eacute; effectu&eacute; sans votre accord</li>
    </ul>
    <p>Les vrais traitements GLP-1 sont des m&eacute;dicaments sur ordonnance, jamais vendus en ligne sous forme de compl&eacute;ments.</p>
    ${coachCTA('scam_alert')}
    <p>N'h&eacute;sitez pas &agrave; nous recontacter si nous pouvons vous aider autrement.</p>`)
  },
  {
    to: 'laurencebossard@msn.com',
    contactId: 84,
    campaign: 'scam_alert',
    subject: 'Re: Brûlures d\'estomac et commande non sollicitée — GLP1 France ≠ vendeur',
    html: wrap(`
    <p>Bonjour Laurence,</p>
    <p>Nous avons re&ccedil;u votre message concernant des br&ucirc;lures d'estomac et un 2&egrave;me flacon non command&eacute;.</p>
    <p><strong>Important : GLP1 France est un site d'information ind&eacute;pendant.</strong> Nous ne vendons aucun produit. Si vous recevez des flacons non command&eacute;s, il s'agit probablement d'une pratique commerciale abusive d'un autre site.</p>
    <p><strong>Concernant vos br&ucirc;lures d'estomac :</strong> arr&ecirc;tez imm&eacute;diatement de prendre ce produit et consultez votre m&eacute;decin. Les compl&eacute;ments vendus en ligne sous l'appellation &laquo; GLP-1 &raquo; ne sont <strong>pas</strong> de vrais traitements GLP-1 et peuvent pr&eacute;senter des risques.</p>
    <p><strong>D&eacute;marches recommand&eacute;es :</strong></p>
    <ul style="line-height: 1.8;">
      <li><strong>Consultez votre m&eacute;decin</strong> pour les effets ind&eacute;sirables</li>
      <li><strong>Faites opposition &agrave; votre banque</strong> pour bloquer tout pr&eacute;l&egrave;vement futur</li>
      <li><strong>Refusez le colis</strong> non command&eacute; (vous n'&ecirc;tes pas oblig&eacute;e de payer un produit non sollicit&eacute;)</li>
      <li><strong>Signalez sur <a href="https://www.signal.conso.gouv.fr/" style="color: #059669;">SignalConso</a></strong></li>
    </ul>
    ${coachCTA('scam_alert')}
    <p>Prenez soin de vous.</p>`)
  },
  {
    to: 'leelooodallas@live.fr',
    contactId: null,
    incomingEmailId: null,
    campaign: 'scam_alert',
    subject: 'Re: Votre message — GLP1 France ≠ vendeur de compléments',
    html: wrap(`
    <p>Bonjour,</p>
    <p>Nous avons re&ccedil;u votre message.</p>
    <p><strong>Important : GLP1 France est un site d'information ind&eacute;pendant.</strong> Nous ne vendons aucun produit, compl&eacute;ment alimentaire ou m&eacute;dicament. Si vous avez achet&eacute; un produit sur un site diff&eacute;rent, il ne s'agit pas de nous.</p>
    <p>Si vous avez &eacute;t&eacute; victime d'une arnaque, voici les d&eacute;marches recommand&eacute;es :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Faites opposition aupr&egrave;s de votre banque</strong></li>
      <li><strong>Signalez sur <a href="https://www.signal.conso.gouv.fr/" style="color: #059669;">SignalConso</a></strong></li>
      <li><strong>D&eacute;posez plainte</strong> sur <a href="https://www.pre-plainte-en-ligne.gouv.fr/" style="color: #059669;">pr&eacute;-plainte en ligne</a></li>
    </ul>
    <p>Les vrais traitements GLP-1 (Ozempic, Wegovy, Mounjaro) sont des m&eacute;dicaments sur ordonnance, jamais vendus en ligne sous forme de g&eacute;lules ou compl&eacute;ments.</p>
    ${coachCTA('scam_alert')}
    <p>Bon courage.</p>`)
  }
];

async function sendAll() {
  const transporter = nodemailer.createTransport(SMTP_CONFIG);
  let sent = 0, failed = 0;

  for (const email of emails) {
    try {
      const info = await transporter.sendMail({
        from: FROM,
        to: email.to,
        subject: email.subject,
        html: email.html
      });
      console.log(`✅ Envoyé à ${email.to} -> ${info.messageId}`);
      sent++;

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
        console.log('  📧 Copie IMAP Sent (HTML)');
      } catch (imapErr) {
        console.log('  ⚠️ IMAP copy failed:', imapErr.message);
      }

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
        if (res.ok) console.log('  📊 Supabase loggé');
        else console.log('  ⚠️ Supabase:', res.status, await res.text());
      } catch (e) {
        console.log('  ⚠️ DB log failed:', e.message);
      }

      if (email.contactId) {
        try {
          await fetch(`${SUPA_URL}/rest/v1/contacts?id=eq.${email.contactId}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPA_KEY,
              'Authorization': `Bearer ${SUPA_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ status: 'replied', updated_at: new Date().toISOString() })
          });
          console.log('  ✏️ Contact #' + email.contactId + ' -> replied');
        } catch (e) {}
      }

    } catch (err) {
      console.log(`❌ ECHEC ${email.to}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Terminé : ${sent} envoyés, ${failed} échecs ===`);
}

sendAll();
