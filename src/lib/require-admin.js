// src/lib/require-admin.js
// ─────────────────────────────────────────────────────────
// Shared admin gate. Previously this exact check (get session
// user -> look up their profile -> confirm role==='admin') was
// copy-pasted inline in every admin route. One copy now.
//
// Usage in a route handler:
//   const { user, error } = await requireAdmin();
//   if (error) return error;
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase-office";

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { error: NextResponse.json({ error: "Could not verify permissions." }, { status: 500 }) };
  }

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }

  return { user, error: null };
}
