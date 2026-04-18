#!/usr/bin/env node
// scripts/sync-emails.mjs
// Sync incoming emails from robin@glp1-france.fr (Hostinger IMAP) → Supabase
//
// Usage:
//   node scripts/sync-emails.mjs                  # sync last 50 emails
//   node scripts/sync-emails.mjs --all            # sync all emails
//   node scripts/sync-emails.mjs --since 7        # sync last 7 days
//
// Requires .env:
//   IMAP_HOST=imap.hostinger.com
//   IMAP_PORT=993
//   IMAP_USER=robin@glp1-france.fr
//   IMAP_PASS=your-password
//   SUPABASE_URL=https://ywekaivgjzsmdocchvum.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=your-service-key

import { ImapFlow } from 'imapflow';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manually
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

const IMAP_HOST = process.env.IMAP_HOST || 'imap.hostinger.com';
const IMAP_PORT = parseInt(process.env.IMAP_PORT || '993');
const IMAP_USER = process.env.IMAP_USER || 'robin@glp1-france.fr';
const IMAP_PASS = process.env.IMAP_PASS;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Emails to ignore
const IGNORED_EMAILS = [
  'webmaster@talika.com',
  'robinallainmkg@gmail.com',
  'robin@glp1-france.fr',
  'noreply@',
  'no-reply@',
  'mailer-daemon@',
];

if (!IMAP_PASS) {
  console.error('IMAP_PASS is required. Set it in .env or environment.');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Parse args
const args = process.argv.slice(2);
const syncAll = args.includes('--all');
const sinceIdx = args.indexOf('--since');
const sinceDays = sinceIdx !== -1 ? parseInt(args[sinceIdx + 1] || '7') : 30;

function isIgnored(email) {
  if (!email) return true;
  const lower = email.toLowerCase();
  return IGNORED_EMAILS.some(ignored => lower.includes(ignored));
}

function extractText(part) {
  if (!part) return '';
  if (typeof part === 'string') return part;
  if (Buffer.isBuffer(part)) return part.toString('utf-8');
  return String(part);
}

async function syncEmails() {
  console.log(`\n📩 Syncing emails from ${IMAP_USER}...`);
  console.log(`   IMAP: ${IMAP_HOST}:${IMAP_PORT}`);
  console.log(`   Mode: ${syncAll ? 'ALL' : `last ${sinceDays} days`}`);

  const client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: {
      user: IMAP_USER,
      pass: IMAP_PASS,
    },
    logger: false,
  });

  try {
    await client.connect();
    console.log('   Connected to IMAP ✅');

    // Open INBOX
    const mailbox = await client.mailboxOpen('INBOX');
    console.log(`   Mailbox: ${mailbox.exists} messages total`);

    // Build search criteria
    let searchCriteria;
    if (syncAll) {
      searchCriteria = { all: true };
    } else {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - sinceDays);
      searchCriteria = { since: sinceDate };
    }

    // Get existing message IDs to avoid duplicates
    const { data: existing } = await supabase
      .from('incoming_emails')
      .select('message_id');
    const existingIds = new Set((existing || []).map(e => e.message_id));
    console.log(`   Already synced: ${existingIds.size} emails`);

    // Fetch messages
    let synced = 0;
    let skipped = 0;
    let ignored = 0;

    for await (const msg of client.fetch(searchCriteria, {
      envelope: true,
      source: true,
      uid: true,
    })) {
      const envelope = msg.envelope;
      if (!envelope) continue;

      const messageId = envelope.messageId || `uid-${msg.uid}`;

      // Skip if already synced
      if (existingIds.has(messageId)) {
        skipped++;
        continue;
      }

      // Extract sender
      const from = envelope.from?.[0] || {};
      const fromEmail = from.address || '';
      const fromName = from.name || '';

      // Skip ignored senders
      if (isIgnored(fromEmail)) {
        ignored++;
        continue;
      }

      // Extract body text from source
      let bodyText = '';
      if (msg.source) {
        const source = extractText(msg.source);
        // Simple text extraction - get content after headers
        const headerEnd = source.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          bodyText = source.substring(headerEnd + 4);
          // Clean up base64/quoted-printable roughly
          if (bodyText.length > 5000) bodyText = bodyText.substring(0, 5000);
          // Try to extract plain text from multipart
          const textMatch = source.match(/Content-Type: text\/plain[^\r\n]*\r\n(?:Content-Transfer-Encoding:[^\r\n]*\r\n)?\r\n([\s\S]*?)(?:\r\n--|\r\n\.\r\n|$)/i);
          if (textMatch) {
            bodyText = textMatch[1].trim();
          }
        }
      }

      // Clean body text
      bodyText = bodyText
        .replace(/=\r\n/g, '')  // quoted-printable soft line breaks
        .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))  // QP decode
        .substring(0, 5000);  // Limit size

      const record = {
        message_id: messageId,
        from_email: fromEmail,
        from_name: fromName || null,
        to_email: IMAP_USER,
        subject: envelope.subject || null,
        body_text: bodyText || null,
        received_at: envelope.date ? new Date(envelope.date).toISOString() : new Date().toISOString(),
        category: 'inbox',
      };

      const { error } = await supabase
        .from('incoming_emails')
        .upsert(record, { onConflict: 'message_id' });

      if (error) {
        console.error(`   ❌ Error inserting email from ${fromEmail}:`, error.message);
      } else {
        synced++;
        console.log(`   ✅ ${fromName || fromEmail}: ${envelope.subject || '(no subject)'}`);
      }
    }

    console.log(`\n📊 Sync complete:`);
    console.log(`   ✅ Synced: ${synced}`);
    console.log(`   ⏭️  Already exists: ${skipped}`);
    console.log(`   🚫 Ignored (own emails): ${ignored}`);

    await client.logout();
  } catch (err) {
    console.error('❌ IMAP sync error:', err.message);
    try { await client.logout(); } catch {}
    process.exit(1);
  }
}

syncEmails();
