// src/app/api/admin/users/route.js
// Admin-only: list every user + their profile.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { supabase } from "@/lib/supabase-office";

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: profiles });
}
