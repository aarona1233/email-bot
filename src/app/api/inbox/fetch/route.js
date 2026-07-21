// src/app/api/inbox/fetch/route.js
// ─────────────────────────────────────────────────────────
// POST here to pull new emails from the real mailbox.
// Supports two protocols — set which one in .env.local:
//
//   INBOX_PROTOCOL=imap   (default — for Gmail, most providers)
//   INBOX_PROTOCOL=jmap   (for Fastmail, Stalwart, or your
//                          coworker's JMAP server)
//
// No code changes needed to switch — same pattern as AI_PROVIDER.
//
// POST /api/inbox/fetch   body: { limit?: number }
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    let limit = 25;
    try {
      const body = await request.json();
      if (body?.limit) limit = Number(body.limit);
    } catch {
      // no body sent — use default
    }

    const protocol = process.env.INBOX_PROTOCOL || "imap";
    console.log(`[Inbox Fetch] Using protocol: ${protocol}`);

    let summary;
    if (protocol === "jmap") {
      const { fetchInboxOverJmap } = await import("@/lib/jmap-fetch");
      summary = await fetchInboxOverJmap({ limit, markSeen: true });
    } else if (protocol === "imap") {
      const { fetchInboxOverImap } = await import("@/lib/imap-fetch");
      summary = await fetchInboxOverImap({ limit, markSeen: true });
    } else {
      throw new Error(`Unknown INBOX_PROTOCOL: "${protocol}". Use imap or jmap.`);
    }

    console.log("[Inbox Fetch] Complete:", summary);

    return NextResponse.json({ ok: true, protocol, ...summary });
  } catch (error) {
    console.error("Error in inbox/fetch:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
