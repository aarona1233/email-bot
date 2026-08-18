// src/app/api/admin/users/[id]/route.js
// ─────────────────────────────────────────────────────────
// Admin-only: view/edit ANY user's profile — display name,
// role, signature. Reset password is a separate route since
// it hits a different Supabase Auth API.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase-office";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { user };
}

export async function PATCH(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { display_name, role, signature } = await request.json();

  const patch = {};
  if (display_name !== undefined) patch.display_name = display_name;
  if (signature    !== undefined) patch.signature    = signature;
  if (role !== undefined) {
    if (!["member", "admin"].includes(role)) {
      return NextResponse.json({ error: "role must be 'member' or 'admin'" }, { status: 400 });
    }
    patch.role = role;
  }

  const { data, error: updateError } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
