// src/app/api/admin/users/[id]/reset-password/route.js
// ─────────────────────────────────────────────────────────
// Admin-only: set a new password for someone else's account
// directly. Uses the Supabase Auth admin API — the same
// service-role-powered API used to create accounts in the
// first place. Share the new password with them directly
// (Slack, in person, whatever) — there's no email flow here.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase-office";

export async function POST(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const { newPassword } = await request.json();

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const { error } = await supabase.auth.admin.updateUserById(id, { password: newPassword });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
