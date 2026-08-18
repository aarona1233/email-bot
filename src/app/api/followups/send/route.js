// src/app/api/followups/send/route.js
// Human clicks "Send" on a queued follow-up. Requires a
// logged-in session — that person's signature gets applied.
// POST body: { id, subject?, body? }

import { NextResponse } from "next/server";
import { sendFollowUp } from "@/lib/followup";
import { getSessionUser } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase-office";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const { id, subject, body } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const result = await sendFollowUp(id, {
      subject,
      body,
      humanUserId: user.id,
      sentByName: profile?.display_name || user.email,
    });

    return NextResponse.json({ ok: true, emailId: result.id });
  } catch (error) {
    console.error("Error in followups/send:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
