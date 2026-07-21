// src/app/api/followups/skip/route.js
// Human dismisses a follow-up without sending it.
// POST body: { id }

import { NextResponse } from "next/server";
import { skipFollowUp } from "@/lib/followup";

export async function POST(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await skipFollowUp(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in followups/skip:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
