// src/app/api/followups/send/route.js
// Human clicks "Send" on a queued follow-up.
// POST body: { id, subject?, body? }  — subject/body optional
// overrides if the human edited the draft before sending.

import { NextResponse } from "next/server";
import { sendFollowUp } from "@/lib/followup";

export async function POST(request) {
  try {
    const { id, subject, body } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const result = await sendFollowUp(id, { subject, body });
    return NextResponse.json({ ok: true, emailId: result.id });
  } catch (error) {
    console.error("Error in followups/send:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
