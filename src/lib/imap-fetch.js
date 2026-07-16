// src/lib/imap-fetch.js
// ─────────────────────────────────────────────────────────
// Connects to a real mailbox over IMAP, pulls unread emails,
// and hands them to the existing ingestEmail() pipeline.
//
// Uses imapflow (connection) + mailparser (parsing).
// Install once:  npm install imapflow mailparser
//
// Reads mailbox credentials from .env.local:
//   IMAP_HOST=imap.gmail.com
//   IMAP_PORT=993
//   IMAP_USER=inbox@yourdomain.com
//   IMAP_PASSWORD=your_app_password   (Gmail: use an App Password)
// ─────────────────────────────────────────────────────────

import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { ingestEmail } from "@/lib/inbox";

/**
 * Connects, pulls unread messages, ingests each one, and
 * (optionally) marks them as seen so they aren't re-fetched.
 *
 * @param {object} opts
 * @param {number} opts.limit       max emails to pull this run (default 25)
 * @param {boolean} opts.markSeen   mark fetched emails as read (default true)
 * @returns {object} summary { fetched, ingested, duplicates, errors, emails }
 */
export async function fetchInboxOverImap({ limit = 25, markSeen = true } = {}) {
  const host = process.env.IMAP_HOST;
  const port = Number(process.env.IMAP_PORT || 993);
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error(
      "IMAP not configured. Set IMAP_HOST, IMAP_USER, IMAP_PASSWORD in .env.local"
    );
  }

  const client = new ImapFlow({
    host,
    port,
    secure: true,
    auth: { user, pass },
    logger: false, // set to console for debugging
  });

  const summary = {
    fetched: 0,
    ingested: 0,
    duplicates: 0,
    errors: 0,
    emails: [],
  };

  await client.connect();

  // Lock the inbox so nothing else touches it mid-fetch
  const lock = await client.getMailboxLock("INBOX");

  try {
    // Find unseen messages
    const uids = await client.search({ seen: false });

    if (!uids || uids.length === 0) {
      return summary;
    }

    // Take the most recent `limit` of them
    const toFetch = uids.slice(-limit);

    for (const uid of toFetch) {
      try {
        // Download the full raw message
        const msg = await client.fetchOne(uid, { source: true }, { uid: true });
        if (!msg || !msg.source) continue;

        // Parse raw MIME into clean fields
        const parsed = await simpleParser(msg.source);

        const fromText = parsed.from?.text || "";
        const subject  = parsed.subject || "(no subject)";
        const body     = parsed.text || parsed.html?.replace(/<[^>]+>/g, " ") || "";
        const messageId = parsed.messageId || `imap-${uid}`;

        summary.fetched++;

        // Hand off to the existing ingestion pipeline.
        // This runs the keyword heuristic and stores as 'pending'.
        const { created, email } = await ingestEmail({
          from: fromText,
          subject,
          body,
          messageId,
        });

        if (created) {
          summary.ingested++;
          summary.emails.push({
            id: email.id,
            from: email.from_address,
            subject: email.subject,
          });
        } else {
          summary.duplicates++;
        }

        // Mark as seen so we don't pull it again next run
        if (markSeen) {
          await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
        }
      } catch (msgErr) {
        console.error(`IMAP message ${uid} failed:`, msgErr.message);
        summary.errors++;
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }

  return summary;
}
