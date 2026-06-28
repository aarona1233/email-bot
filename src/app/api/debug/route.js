// src/app/api/debug/route.js
// ─────────────────────────────────────────────────────────
// Temporary debug endpoint — DELETE before going to production
// Visit: http://localhost:3000/api/debug
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-office";

export async function GET() {
  const results = {};

  // Test 1: Can we reach Supabase at all?
  try {
    const { data, error } = await supabase
      .from("office_spaces")
      .select("id, name, type")
      .limit(5);

    results.connection = error
      ? { ok: false, error: error.message, hint: error.hint }
      : { ok: true, rowCount: data.length, sample: data };
  } catch (e) {
    results.connection = { ok: false, fatal: e.message };
  }

  // Test 2: Count total rows in office_spaces
  try {
    const { count, error } = await supabase
      .from("office_spaces")
      .select("*", { count: "exact", head: true });

    results.officeSpacesCount = error
      ? { ok: false, error: error.message }
      : { ok: true, count };
  } catch (e) {
    results.officeSpacesCount = { ok: false, fatal: e.message };
  }

  // Test 3: Count total rows in space_images
  try {
    const { count, error } = await supabase
      .from("space_images")
      .select("*", { count: "exact", head: true });

    results.spaceImagesCount = error
      ? { ok: false, error: error.message }
      : { ok: true, count };
  } catch (e) {
    results.spaceImagesCount = { ok: false, fatal: e.message };
  }

  // Test 4: Try the full join query that the app actually uses
  try {
    const { data, error } = await supabase
      .from("office_spaces")
      .select(`
        id, name, type, monthly_rate,
        space_images ( id, url, caption, sort_order )
      `)
      .limit(3);

    results.joinQuery = error
      ? { ok: false, error: error.message, hint: error.hint }
      : {
          ok: true,
          rowCount: data.length,
          sample: data.map(s => ({
            id: s.id,
            name: s.name,
            imageCount: s.space_images?.length ?? 0,
            firstImage: s.space_images?.[0]?.url ?? "none"
          }))
        };
  } catch (e) {
    results.joinQuery = { ok: false, fatal: e.message };
  }

  // Test 5: Check env vars are set (don't expose the values)
  results.envVars = {
    SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_URL_VALUE: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/supabase\.co.*/, "supabase.co/..."),
    SUPABASE_KEY_SET: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_KEY_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
    AI_PROVIDER: process.env.AI_PROVIDER || "not set",
  };

  const allOk = results.connection?.ok && results.joinQuery?.ok;

  return NextResponse.json(results, { status: allOk ? 200 : 500 });
}