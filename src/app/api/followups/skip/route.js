// src/app/api/followups/skip/route.js
// Human dismisses a follow-up without sending it.
// POST body: { id }

import { NextResponse } from "next/server";
import { skipFollowUp } from "@/lib/followup";
import { getSessionUser } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await skipFollowUp(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in followups/skip:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
