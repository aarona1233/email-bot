// src/app/api/admin/users/[id]/reset-password/route.js
// ─────────────────────────────────────────────────────────
// Admin-only: set a new password for someone else's account
// directly. Uses the Supabase Auth admin API — the same
// service-role-powered API used to create accounts in the
// first place. Share the new password with them directly
// (Slack, in person, whatever) — there's no email flow here.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { supabase } from "@/lib/supabase-office";

export async function POST(request, { params }) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const { newPassword } = await request.json();

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const { error } = await supabase.auth.admin.updateUserById(id, { password: newPassword });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
