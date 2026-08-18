// src/app/api/inbox/list/route.js
// Returns emails filtered by status, plus heuristic accuracy stats.
// GET /api/inbox/list?status=pending

import { NextResponse } from "next/server";
import { listEmails, getHeuristicAccuracy } from "@/lib/inbox";
import { getSessionUser } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const [emails, accuracy] = await Promise.all([
      listEmails(status),
      getHeuristicAccuracy(),
    ]);

    return NextResponse.json({ emails, accuracy });
  } catch (error) {
    console.error("Error in inbox/list:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
