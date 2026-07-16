// src/app/api/inbox/fetch/route.js
// ─────────────────────────────────────────────────────────
// POST here to pull new emails from the real mailbox over IMAP.
// Returns a summary of what was ingested.
//
// POST /api/inbox/fetch   body: { limit?: number }
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { fetchInboxOverImap } from "@/lib/imap-fetch";

export async function POST(request) {
  try {
    let limit = 25;
    try {
      const body = await request.json();
      if (body?.limit) limit = Number(body.limit);
    } catch {
      // no body sent — use default
    }

    const summary = await fetchInboxOverImap({ limit, markSeen: true });

    console.log("[IMAP] Fetch complete:", summary);

    return NextResponse.json({
      ok: true,
      ...summary,
    });
  } catch (error) {
    console.error("Error in inbox/fetch:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
