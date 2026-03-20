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
