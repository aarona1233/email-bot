// src/app/api/followups/list/route.js
// GET /api/followups/list?status=pending_review

import { NextResponse } from "next/server";
import { listFollowUps } from "@/lib/followup";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending_review";
    const followUps = await listFollowUps(status);
    return NextResponse.json({ followUps });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
