// src/lib/jmap-fetch.js
// ─────────────────────────────────────────────────────────
// Connects to a real JMAP mail server, pulls unread emails,
// and hands them to the existing ingestEmail() pipeline.
// No extra npm packages needed — JMAP is plain HTTP + JSON,
// so we use the built-in fetch().
//
// Reads credentials from .env.local:
//   JMAP_HOST=https://mail.example.com     (the server's base URL)
//   JMAP_USERNAME=you@example.com
//   JMAP_PASSWORD=your_password_or_token
//
// Some JMAP servers use a bearer token instead of a password —
// if your coworker gives you a "token" or "API key" instead of
// a password, set JMAP_TOKEN instead of JMAP_PASSWORD and we'll
// use Bearer auth automatically.
//   JMAP_TOKEN=abc123...
// ─────────────────────────────────────────────────────────

import { ingestEmail } from "@/lib/inbox";

/**
 * Every JMAP server exposes a "session" document at a well-known
 * URL. It tells us the API endpoint, the account ID, and what
 * the server supports. This is always the first call.
 */
async function getSession(host, authHeader) {
  const sessionUrl = `${host.replace(/\/$/, "")}/.well-known/jmap`;

  const res = await fetch(sessionUrl, {
    headers: { Authorization: authHeader },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JMAP session request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json();
}

/**
 * JMAP calls are "batched" — you send an array of method calls
 * in one request and get an array of results back. This helper
 * sends one batch and returns the results.
 */
async function jmapCall(apiUrl, authHeader, methodCalls) {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
      ],
      methodCalls,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JMAP call failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.methodResponses;
}

/**
 * Pulls unread emails from the inbox mailbox and ingests each one.
 *
 * @param {object} opts
 * @param {number} opts.limit      max emails to pull this run (default 25)
 * @param {boolean} opts.markSeen  mark fetched emails as read (default true)
 */
export async function fetchInboxOverJmap({ limit = 25, markSeen = true } = {}) {
  const host     = process.env.JMAP_HOST;
  const username = process.env.JMAP_USERNAME;
  const password = process.env.JMAP_PASSWORD;
  const token    = process.env.JMAP_TOKEN;

  console.log("─".repeat(50));
  console.log("[JMAP] Starting fetch");
  console.log(`[JMAP] Host: ${host || "MISSING"}`);
  console.log(`[JMAP] Auth: ${token ? "bearer token" : username ? `basic (${username})` : "MISSING"}`);

  if (!host || (!token && (!username || !password))) {
    throw new Error(
      "JMAP not configured. Set JMAP_HOST + either JMAP_TOKEN, or JMAP_USERNAME + JMAP_PASSWORD, in .env.local"
    );
  }

  // Build the auth header — Bearer token takes priority if both are set
  const authHeader = token
    ? `Bearer ${token}`
    : `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

  const summary = { fetched: 0, ingested: 0, duplicates: 0, errors: 0, emails: [] };

  // ── Step 1: get the session — tells us the API URL + account ID ──
  console.log("[JMAP] Fetching session...");
  const session = await getSession(host, authHeader);

  const accountId = session.primaryAccounts?.["urn:ietf:params:jmap:mail"];
  const apiUrl = session.apiUrl;

  if (!accountId || !apiUrl) {
    throw new Error("JMAP session response is missing accountId or apiUrl — unexpected server response.");
  }
  console.log(`[JMAP] Session OK. Account: ${accountId}`);

  // ── Step 2: find the Inbox mailbox ID ──────────────────
  const [mailboxResult] = await jmapCall(apiUrl, authHeader, [
    ["Mailbox/query", { accountId, filter: { role: "inbox" } }, "c1"],
  ]);
  const inboxId = mailboxResult[1].ids[0];

  if (!inboxId) throw new Error("Could not find an Inbox mailbox on this account.");
  console.log(`[JMAP] Inbox mailbox id: ${inboxId}`);

  // ── Step 3: query unread emails in the inbox ───────────
  const [queryResult] = await jmapCall(apiUrl, authHeader, [
    [
      "Email/query",
      {
        accountId,
        filter: { inMailbox: inboxId, hasKeyword: undefined, notKeyword: "$seen" },
        sort: [{ property: "receivedAt", isAscending: false }],
        limit,
      },
      "c2",
    ],
  ]);

  const emailIds = queryResult[1].ids || [];
  console.log(`[JMAP] Found ${emailIds.length} unseen email(s)`);

  if (emailIds.length === 0) {
    return summary;
  }

  // ── Step 4: fetch the full content of those emails ─────
  const [getResult] = await jmapCall(apiUrl, authHeader, [
    [
      "Email/get",
      {
        accountId,
        ids: emailIds,
        properties: [
          "id", "subject", "from", "receivedAt",
          "bodyValues", "textBody", "htmlBody",
        ],
        fetchTextBodyValues: true,
        fetchHTMLBodyValues: true,
      },
      "c3",
    ],
  ]);

  const emails = getResult[1].list || [];

  // ── Step 5: parse + ingest each one ────────────────────
  for (const email of emails) {
    try {
      const fromObj  = email.from?.[0] || {};
      const fromText = fromObj.name ? `${fromObj.name} <${fromObj.email}>` : fromObj.email || "";
      const subject  = email.subject || "(no subject)";

      // Pull plain text body from bodyValues (JMAP stores body parts
      // separately from the structure that references them)
      let body = "";
      const textPart = email.textBody?.[0];
      if (textPart && email.bodyValues?.[textPart.partId]) {
        body = email.bodyValues[textPart.partId].value;
      } else {
        const htmlPart = email.htmlBody?.[0];
        if (htmlPart && email.bodyValues?.[htmlPart.partId]) {
          body = email.bodyValues[htmlPart.partId].value.replace(/<[^>]+>/g, " ");
        }
      }

      summary.fetched++;
      console.log(`[JMAP] Parsed: "${subject}" from ${fromText}`);

      const { created, email: stored } = await ingestEmail({
        from: fromText,
        subject,
        body,
        messageId: email.id,
      });

      if (created) {
        summary.ingested++;
        summary.emails.push({ id: stored.id, from: stored.from_address, subject: stored.subject });
        console.log(`[JMAP]   -> stored as inbox #${stored.id}`);
      } else {
        summary.duplicates++;
        console.log(`[JMAP]   -> duplicate, skipped`);
      }
    } catch (err) {
      console.error(`[JMAP] Email ${email.id} failed:`, err.message);
      summary.errors++;
    }
  }

  // ── Step 6: mark them all as seen in one batch call ────
  if (markSeen && emails.length > 0) {
    console.log(`[JMAP] Marking ${emails.length} email(s) as seen`);
    const updates = {};
    for (const email of emails) {
      updates[email.id] = { "keywords/$seen": true };
    }
    await jmapCall(apiUrl, authHeader, [
      ["Email/set", { accountId, update: updates }, "c4"],
    ]);
  }

  console.log(`[JMAP] Done. Fetched ${summary.fetched}, ingested ${summary.ingested}, dupes ${summary.duplicates}, errors ${summary.errors}`);
  console.log("─".repeat(50));

  return summary;
}
