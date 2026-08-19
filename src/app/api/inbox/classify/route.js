// src/app/api/inbox/classify/route.js
// Manually trigger classification of any pending emails that
// haven't been sorted yet. Session-gated like every other
// action route — same pattern as /api/inbox/fetch.
//
// POST body: { limit?: number }

import { NextResponse } from "next/server";
import { classifyAllPending } from "@/lib/classifier";
import { getSessionUser } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    let limit = 25;
    try {
      const body = await request.json();
      if (body?.limit) limit = Number(body.limit);
    } catch {
      // no body — use default
    }

    const result = await classifyAllPending({ limit });
    console.log("[inbox/classify] Result:", result);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Error in inbox/classify:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
