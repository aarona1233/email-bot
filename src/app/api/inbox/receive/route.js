// src/app/api/inbox/receive/route.js
// ─────────────────────────────────────────────────────────
// Accepts an incoming email and stores it as 'pending'.
//
// Works two ways:
//   1. Webhook — your email provider POSTs here when mail
//      arrives at INBOX@yourdomain.com
//   2. Manual  — you POST the same shape by hand to test
//
// Providers send different field names, so we normalize below.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { ingestEmail } from "@/lib/inbox";

/**
 * Different providers use different JSON shapes.
 * Pull out from / subject / body regardless of who sent it.
 */
function normalizePayload(payload) {
  // Manual / generic
  if (payload.from && payload.body) {
    return {
      from:      payload.from,
      subject:   payload.subject,
      body:      payload.body,
      messageId: payload.messageId,
    };
  }

  // SendGrid Inbound Parse
  if (payload.envelope || payload.text) {
    return {
      from:      payload.from,
      subject:   payload.subject,
      body:      payload.text || payload.html,
      messageId: payload["Message-ID"],
    };
  }

  // Postmark inbound
  if (payload.FromFull || payload.TextBody) {
    return {
      from:      payload.FromFull
        ? `${payload.FromFull.Name} <${payload.FromFull.Email}>`
        : payload.From,
      subject:   payload.Subject,
      body:      payload.TextBody || payload.HtmlBody,
      messageId: payload.MessageID,
    };
  }

  // Cloudflare Email Routing worker (whatever shape you forward)
  if (payload.headers?.from) {
    return {
      from:      payload.headers.from,
      subject:   payload.headers.subject,
      body:      payload.text || payload.raw,
      messageId: payload.headers["message-id"],
    };
  }

  return null;
}

export async function POST(request) {
  try {
    // ── Optional shared-secret check ──────────────────────
    // Set INBOX_WEBHOOK_SECRET in .env.local and have your
    // provider send it as a header. Skipped if unset.
    const secret = process.env.INBOX_WEBHOOK_SECRET;
    if (secret) {
      const provided = request.headers.get("x-webhook-secret");
      if (provided !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload    = await request.json();
    const normalized = normalizePayload(payload);

    if (!normalized) {
      return NextResponse.json(
        { error: "Could not parse payload. Expected from/subject/body." },
        { status: 400 }
      );
    }

    const { created, email } = await ingestEmail(normalized);

    if (!created) {
      // Duplicate webhook delivery — acknowledge so the provider stops retrying
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
    }

    console.log(`[inbox] Stored email ${email.id} from ${email.from_address}`);
    console.log(`[inbox] Heuristic predicted: ${email.heuristic_prediction ? "VALID" : "SPAM"}`);

    return NextResponse.json({ ok: true, id: email.id }, { status: 201 });
  } catch (error) {
    console.error("Error in inbox/receive:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
