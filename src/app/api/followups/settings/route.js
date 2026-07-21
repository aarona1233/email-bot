// src/app/api/followups/settings/route.js
// GET  -> current settings
// POST -> update settings (partial patch)

import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/followup";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const patch = await request.json();

    // Basic sanity guards — don't let the UI write nonsense
    if (patch.wait_days !== undefined && patch.wait_days < 0) {
      return NextResponse.json({ error: "wait_days must be >= 0" }, { status: 400 });
    }
    if (patch.scan_interval_hours !== undefined && patch.scan_interval_hours <= 0) {
      return NextResponse.json({ error: "scan_interval_hours must be > 0" }, { status: 400 });
    }
    if (patch.max_follow_ups !== undefined && patch.max_follow_ups < 1) {
      return NextResponse.json({ error: "max_follow_ups must be >= 1" }, { status: 400 });
    }

    const settings = await updateSettings(patch);
    console.log("[FollowUp] Settings updated:", patch);
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
