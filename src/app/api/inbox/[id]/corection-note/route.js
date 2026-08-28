// src/app/api/inbox/[id]/correction-note/route.js
// ─────────────────────────────────────────────────────────
// Saves a human's free-text note explaining what the classifier
// got wrong (or right) about its actual reasoning — separate
// from approve/reject, so you can write and refine it before
// making the final call.
// PATCH body: { note: string }
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { saveCorrectionNote } from "@/lib/inbox";

export async function PATCH(request, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { id } = await params;
    const { note } = await request.json();

    const email = await saveCorrectionNote(id, note);
    return NextResponse.json({ email });
  } catch (error) {
    console.error("Error in inbox/correction-note:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
