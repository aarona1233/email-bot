// src/app/api/sent/[id]/followup-timer/route.js
// ─────────────────────────────────────────────────────────
// Sets or clears a per-email follow-up timer override.
// PATCH body: { waitDaysOverride: number | null }
// null clears the override, reverting that email to whatever
// the global default in Settings currently is.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase-office";

export async function PATCH(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const { waitDaysOverride } = await request.json();

  const value = (waitDaysOverride === null || waitDaysOverride === undefined)
    ? null
    : Number(waitDaysOverride);

  if (value !== null && (!Number.isFinite(value) || value < 0)) {
    return NextResponse.json(
      { error: "waitDaysOverride must be a non-negative number, or null to clear it." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("sent_emails")
    .update({ followup_wait_days_override: value })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ email: data });
}
