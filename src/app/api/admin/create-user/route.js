// src/app/api/admin/create-user/route.js
// Admin-only: creates a new login for a teammate. Uses the
// service role's admin API — this is the ONE place we're
// allowed to create auth users from server code.
//
// POST body: { email, password, display_name, role }

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase-office";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  // Confirm the CALLER is an admin before letting them create anyone
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { email, password, display_name, role } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email verification — internal tool, admin-provisioned
    user_metadata: {
      display_name: display_name || email.split("@")[0],
      role: role === "admin" ? "admin" : "member",
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, userId: data.user.id });
}
