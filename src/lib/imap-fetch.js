// src/lib/imap-fetch.js
// ─────────────────────────────────────────────────────────
// Connects to a real mailbox over IMAP, pulls unread emails,
// and hands them to the existing ingestEmail() pipeline.
// Now with verbose logging so failures are obvious.
//
// npm install imapflow mailparser
// ─────────────────────────────────────────────────────────

import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { ingestEmail } from "@/lib/inbox";

export async function fetchInboxOverImap({ limit = 25, markSeen = true } = {}) {
  const host = process.env.IMAP_HOST;
  const port = Number(process.env.IMAP_PORT || 993);
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASSWORD;

  console.log("─".repeat(50));
  console.log("[IMAP] Starting fetch");
  console.log(`[IMAP] Host: ${host || "MISSING"}`);
  console.log(`[IMAP] Port: ${port}`);
  console.log(`[IMAP] User: ${user || "MISSING"}`);
  console.log(`[IMAP] Password set: ${pass ? "yes (" + pass.length + " chars)" : "NO - MISSING"}`);

  if (!host || !user || !pass) {
    throw new Error(
      "IMAP not configured. Set IMAP_HOST, IMAP_USER, IMAP_PASSWORD in .env.local and RESTART the server."
    );
  }

  const client = new ImapFlow({
    host,
    port,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  const summary = { fetched: 0, ingested: 0, duplicates: 0, errors: 0, emails: [] };

  try {
    console.log("[IMAP] Connecting…");
    await client.connect();
    console.log("[IMAP] Connected successfully");
  } catch (connErr) {
    console.error("[IMAP] CONNECTION FAILED:", connErr.message);
    throw new Error(`IMAP connection failed: ${connErr.message}`);
  }

  const lock = await client.getMailboxLock("INBOX");

  try {
    // How many total messages are in the mailbox?
    const status = await client.status("INBOX", { messages: true, unseen: true });
    console.log(`[IMAP] Mailbox has ${status.messages} total, ${status.unseen} unseen`);

    // Fetch ALL messages by sequence range and check the unseen flag
    // ourselves. This avoids UID-vs-sequence mismatches entirely.
    console.log("[IMAP] Fetching all messages with range 1:* …");

    // ── Pass 1: fully drain the fetch iterator first ────────
    // We do NOT touch flags while this is running. Modifying
    // flags mid-fetch can desync the IMAP stream with Gmail
    // and cause the connection to hang after the first message.
    let iterated = 0;
    const toProcess = []; // { seq, uid, source }

    for await (const message of client.fetch(
      "1:*",
      { source: true, flags: true }
    )) {
      iterated++;
      const flags = message.flags ? [...message.flags] : [];
      const isSeen = flags.includes("\\Seen");

      console.log(`[IMAP] Message seq=${message.seq} uid=${message.uid} seen=${isSeen} hasSource=${!!message.source}`);

      if (!isSeen && toProcess.length < limit) {
        toProcess.push({ seq: message.seq, uid: message.uid, source: message.source });
      }
    }
    console.log(`[IMAP] Fetch drained. ${iterated} total, ${toProcess.length} queued to process.`);

    // ── Pass 2: parse + ingest, fetch loop is fully closed now ──
    const seqsToMarkSeen = [];

    for (const { seq, uid, source } of toProcess) {
      try {
        if (!source) {
          console.log(`[IMAP] uid ${uid}: message.source empty, skipping`);
          continue;
        }

        const parsed = await simpleParser(source);
        const fromText  = parsed.from?.text || "";
        const subject   = parsed.subject || "(no subject)";
        const body      = parsed.text || parsed.html?.replace(/<[^>]+>/g, " ") || "";
        const messageId = parsed.messageId || `imap-${uid}`;

        summary.fetched++;
        console.log(`[IMAP] Parsed: "${subject}" from ${fromText}`);

        const { created, email } = await ingestEmail({ from: fromText, subject, body, messageId });

        if (created) {
          summary.ingested++;
          summary.emails.push({ id: email.id, from: email.from_address, subject: email.subject });
          console.log(`[IMAP]   → stored as inbox #${email.id}`);
        } else {
          summary.duplicates++;
          console.log(`[IMAP]   → duplicate, skipped`);
        }

        seqsToMarkSeen.push(seq);
      } catch (msgErr) {
        console.error(`[IMAP] Message ${uid} failed:`, msgErr.message);
        summary.errors++;
      }
    }

    // ── Pass 3: mark everything seen in ONE batch call ──────
    // Only now that the fetch stream is completely closed.
    if (markSeen && seqsToMarkSeen.length > 0) {
      const seqRange = seqsToMarkSeen.join(",");
      console.log(`[IMAP] Marking seen: ${seqRange}`);
      await client.messageFlagsAdd(seqRange, ["\\Seen"]);
    }
  } finally {
    lock.release();
    await client.logout();
    console.log(`[IMAP] Done. Fetched ${summary.fetched}, ingested ${summary.ingested}, dupes ${summary.duplicates}, errors ${summary.errors}`);
    console.log("─".repeat(50));
  }

  return summary;
}
