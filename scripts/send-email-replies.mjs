#!/usr/bin/env node
// scripts/send-email-replies.mjs
// Send draft email replies from Supabase via Hostinger SMTP
//
// Usage:
//   node scripts/send-email-replies.mjs
//
// Requires .env:
//   SMTP_HOST=smtp.hostinger.com
//   SMTP_PORT=465
//   SMTP_USER=robin@glp1-france.fr
//   SMTP_PASS=your-password
//   SUPABASE_URL=https://ywekaivgjzsmdocchvum.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=your-service-key

import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    });
  } catch { /* no .env file */ }
}
loadEnv();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER || 'robin@glp1-france.fr';
const SMTP_PASS = process.env.SMTP_PASS;
const IMAP_HOST = process.env.IMAP_HOST || 'imap.hostinger.com';
const IMAP_PORT = parseInt(process.env.IMAP_PORT || '993');
const IMAP_USER = process.env.IMAP_USER || SMTP_USER;
const IMAP_PASS = process.env.IMAP_PASS || SMTP_PASS;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SMTP_PASS) {
  console.error('SMTP_PASS manquant dans .env');
  process.exit(1);
}
if (!SUPABASE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

// Copy sent email to IMAP Sent folder
async function copyToSent(reply) {
  const imap = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: { user: IMAP_USER, pass: IMAP_PASS },
    logger: false,
  });

  try {
    await imap.connect();
    const date = new Date().toUTCString();
    const rawEmail = [
      `From: "GLP-1 France" <${SMTP_USER}>`,
      `To: ${reply.to_email}`,
      `Subject: ${reply.subject}`,
      `Date: ${date}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      reply.body_html,
    ].join('\r\n');

    // Try common Sent folder names
    const sentFolders = ['INBOX.Sent', 'Sent', 'Sent Messages', 'INBOX.Sent Messages'];
    let appended = false;
    for (const folder of sentFolders) {
      try {
        await imap.append(folder, rawEmail, ['\\Seen']);
        appended = true;
        break;
      } catch { /* try next */ }
    }
    if (!appended) console.log('    ⚠️ Dossier Sent introuvable');
    await imap.logout();
  } catch (err) {
    console.log(`    ⚠️ Copie IMAP Sent echouee: ${err.message}`);
    try { await imap.logout(); } catch {}
  }
}

async function main() {
  // Fetch unsent replies
  const { data: replies, error } = await supabase
    .from('email_replies')
    .select('*')
    .is('sent_at', null)
    .order('id');

  if (error) {
    console.error('Erreur Supabase:', error.message);
    process.exit(1);
  }

  if (!replies || replies.length === 0) {
    console.log('Aucune reponse a envoyer.');
    return;
  }

  console.log(`${replies.length} reponse(s) a envoyer...\n`);

  for (const reply of replies) {
    try {
      console.log(`Envoi → ${reply.to_email} | ${reply.subject}`);

      await transporter.sendMail({
        from: `"GLP-1 France" <${SMTP_USER}>`,
        to: reply.to_email,
        subject: reply.subject,
        html: reply.body_html,
      });

      // Copy to IMAP Sent folder
      await copyToSent(reply);

      // Mark as sent
      await supabase
        .from('email_replies')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', reply.id);

      // Update incoming email status
      if (reply.incoming_email_id) {
        await supabase
          .from('incoming_emails')
          .update({ status: 'replied', replied_at: new Date().toISOString() })
          .eq('id', reply.incoming_email_id);
      }

      console.log(`  ✅ Envoye\n`);
    } catch (err) {
      console.error(`  ❌ Erreur: ${err.message}\n`);
    }
  }

  console.log('Termine.');
}

main();
