// src/app/api/followups/scan/route.js
// Manually trigger a scan right now — ignores the scan
// interval (but still respects enabled + paused_until,
// unless force=true is passed).
//
// POST body: { force?: boolean }

import { NextResponse } from "next/server";
import { runFollowUpScan } from "@/lib/followup";
import { getSessionUser } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    let force = true; // manual button always bypasses the interval
    try {
      const body = await request.json();
      if (body?.force === false) force = false;
    } catch {
      // no body — default to force=true for manual trigger
    }

    const summary = await runFollowUpScan({ force });
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error("Error in followups/scan:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
