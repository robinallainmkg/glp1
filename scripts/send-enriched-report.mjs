#!/usr/bin/env node
import 'dotenv/config';
import { createTransport } from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER || 'robin@glp1-france.fr';
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rapport GLP-1 France</title></head>
<body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: #1e3a5f; color: white; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 22px;">Rapport Quotidien GLP-1 France</h1>
      <p style="margin: 8px 0 0; opacity: 0.85;">Jeudi 2 avril 2026</p>
    </div>

    <!-- SECTION 1 : B2B -->
    <div style="background: #eff6ff; border-left: 5px solid #2563eb; margin: 20px; padding: 20px; border-radius: 8px;">
      <h2 style="color: #1d4ed8; margin: 0 0 6px;">&#x1F91D; SECTION 1 — Prospection Partenaires B2B</h2>
      <p style="color: #3b82f6; font-size: 13px; margin: 0 0 16px;"><em>Professionnels de santé &amp; e-commerce démarchés pour des partenariats d'affiliation — PAS des patients</em></p>

      <!-- Résumé chiffres clés -->
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
        <tr>
          <td style="padding: 16px; text-align: center; border-right: 1px solid #dbeafe;">
            <div style="font-size: 32px; font-weight: bold; color: #1d4ed8;">9</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Envoyés aujourd'hui</div>
          </td>
          <td style="padding: 16px; text-align: center; border-right: 1px solid #dbeafe;">
            <div style="font-size: 32px; font-weight: bold; color: #0284c7;">3</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Ouverts (33%)</div>
          </td>
          <td style="padding: 16px; text-align: center; border-right: 1px solid #dbeafe;">
            <div style="font-size: 32px; font-weight: bold; color: #059669;">0</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Réponses</div>
          </td>
          <td style="padding: 16px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #dc2626;">0</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Bounces</div>
          </td>
        </tr>
      </table>

      <!-- Par type de partenaire -->
      <h3 style="color: #1d4ed8; font-size: 14px; margin: 0 0 8px;">Par type de partenaire</h3>
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 16px; font-size: 13px;">
        <tr style="background: #dbeafe;">
          <th style="padding: 10px 12px; text-align: left;">Type</th>
          <th style="padding: 10px 12px; text-align: center;">Envoyés</th>
          <th style="padding: 10px 12px; text-align: center;">Ouverts</th>
          <th style="padding: 10px 12px; text-align: center;">Réponses</th>
          <th style="padding: 10px 12px; text-align: center;">Bounces</th>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-top: 1px solid #e2e8f0;">clinique_teleconsultation</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;">9</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;">3</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;">0</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;">0</td>
        </tr>
      </table>

      <!-- Détail des envois -->
      <h3 style="color: #1d4ed8; font-size: 14px; margin: 0 0 8px;">Détail des envois du jour</h3>
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 16px; font-size: 12px;">
        <tr style="background: #dbeafe;">
          <th style="padding: 8px 10px; text-align: left;">Société</th>
          <th style="padding: 8px 10px; text-align: left;">Email</th>
          <th style="padding: 8px 10px; text-align: center;">Variant</th>
          <th style="padding: 8px 10px; text-align: center;">Envoyé (UTC)</th>
          <th style="padding: 8px 10px; text-align: center;">Ouverture</th>
        </tr>
        <tr>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">Centre Obesite</td>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">secretariatosty@mutualitelimousine.fr</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">A</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">07:55</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">—</td>
        </tr>
        <tr style="background:#f8fafc">
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">Doctolib</td>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">martin.durand@email.com</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">A</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">07:57</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">—</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">Doctolib</td>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">camille.dupont@email.fr</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">B</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">07:58</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">—</td>
        </tr>
        <tr style="background:#f8fafc">
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">Doctolib</td>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">laboratoire@exemple.com</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">A</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">08:00</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">&#x26A0;&#xFE0F; 15s (auto-pixel probable)</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">Doctolib</td>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">centre_imagerie@exemple.com</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">B</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">08:01</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">&#x26A0;&#xFE0F; 28s (auto-pixel probable)</td>
        </tr>
        <tr style="background:#f8fafc">
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">Doctolib</td>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">pharmacie@exemple.com</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">B</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">08:02</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">&#x26A0;&#xFE0F; 4s (auto-pixel probable)</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">Doctolib</td>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">nom@email.com</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">B</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">08:04</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">—</td>
        </tr>
        <tr style="background:#f8fafc">
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">Doctolib</td>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">nom@mail.com</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">B</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">08:06</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">—</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">Doctolib</td>
          <td style="padding: 8px 10px; border-top: 1px solid #e2e8f0;">julia@doctolib.fr</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">B</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">08:07</td>
          <td style="padding: 8px 10px; text-align: center; border-top: 1px solid #e2e8f0;">—</td>
        </tr>
      </table>

      <!-- Erreur SMTP -->
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px;">
        &#x274C; <strong>1 échec SMTP</strong> : jean.dupont@email.fr — Invalid login: 454 4.3.0 Try again later
      </div>

      <!-- A/B Test -->
      <h3 style="color: #1d4ed8; font-size: 14px; margin: 0 0 8px;">A/B Test — Objets email (cumulé tous les envois)</h3>
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 16px; font-size: 13px;">
        <tr style="background: #dbeafe;">
          <th style="padding: 10px 12px; text-align: left;">Variant</th>
          <th style="padding: 10px 12px; text-align: center;">Envoyés</th>
          <th style="padding: 10px 12px; text-align: center;">Ouverts</th>
          <th style="padding: 10px 12px; text-align: center;">Taux ouverture</th>
        </tr>
        <tr style="background: #dcfce7;">
          <td style="padding: 10px 12px; border-top: 1px solid #e2e8f0;">&#x1F3C6; A (gagnant)</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;">15</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;">10</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;"><strong>66.7%</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-top: 1px solid #e2e8f0;">B</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;">20</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;">6</td>
          <td style="padding: 10px 12px; text-align: center; border-top: 1px solid #e2e8f0;">30.0%</td>
        </tr>
      </table>

      <!-- Insights B2B -->
      <div style="background: #dbeafe; border-radius: 6px; padding: 12px 16px; font-size: 13px;">
        <strong>&#x1F4A1; Insights B2B :</strong><br>
        &bull; Warmup J2 — limite 10/jour — 9 envoyés (1 échec SMTP temporaire)<br>
        &bull; Seul type de partenaire today : <em>clinique_teleconsultation</em><br>
        &bull; Les 3 ouvertures ont toutes un délai &lt;30s → pixels anti-spam automatiques, pas de lectures humaines<br>
        &bull; Variant A domine : 66.7% vs 30.0% — privilégier A pour les prochains envois<br>
        &bull; &#x26A0;&#xFE0F; Beaucoup d'emails génériques scrappés (exemple.com, email.com...) — qualité prospects à améliorer<br>
        &bull; 36 nouveaux prospects découverts, 73 doublons filtrés<br>
        &bull; Bounce rate : 0% &#x2705; (sous le seuil de 5% — campagne continue)
      </div>
    </div>

    <!-- Scraping summary -->
    <div style="margin: 0 20px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 13px;">
      <h3 style="margin: 0 0 8px; color: #475569; font-size: 14px;">&#x1F50D; Scraping du jour</h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        <li>36 nouveaux prospects découverts (10 sites directs + 8 requêtes DuckDuckGo)</li>
        <li>73 doublons ignorés (déjà en base)</li>
        <li>50 emails vérifiés par DNS MX — 43 valides, 7 invalides (Sentry Wix + domaines inexistants)</li>
        <li>Aucun follow-up envoyé (trop tôt — J2 du pipeline)</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="background: #1e3a5f; color: white; padding: 16px; text-align: center; font-size: 12px;">
      <p style="margin: 0;">GLP-1 France — Rapport automatique quotidien — 2 avril 2026</p>
      <p style="margin: 4px 0 0; opacity: 0.7;">Généré par le pipeline de prospection automatisé (Claude Code)</p>
    </div>
  </div>
</body>
</html>`;

const info = await transporter.sendMail({
  from: 'Robin Allain — GLP-1 France <robin@glp1-france.fr>',
  to: 'robinallainmkg@gmail.com',
  subject: '🤝 Prospection B2B : 9 envoyés — GLP-1 France 2 avril 2026',
  html,
});

console.log('✅ Rapport enrichi envoyé:', info.messageId);
