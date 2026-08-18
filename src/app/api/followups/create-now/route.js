// src/app/api/followups/create-now/route.js
// ─────────────────────────────────────────────────────────
// The "Follow Up Now" button on the Sent tab. Generates (and
// if auto_send is on, immediately sends) a follow-up for one
// specific sent email — bypassing the wait period and scan
// schedule entirely, since this is a direct human decision
// about one customer, not the automated bulk scan.
//
// POST body: { sentEmailId }
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createFollowUpNow } from "@/lib/followup";
import { getSessionUser } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const { sentEmailId } = await request.json();
    if (!sentEmailId) {
      return NextResponse.json({ error: "Missing sentEmailId" }, { status: 400 });
    }

    const result = await createFollowUpNow(sentEmailId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in followups/create-now:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
