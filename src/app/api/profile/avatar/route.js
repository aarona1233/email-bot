// src/app/api/profile/avatar/route.js
// ─────────────────────────────────────────────────────────
// Handles profile picture upload. Browser sends the image as
// multipart form data; this uploads it to Supabase Storage
// via the service role client (bypasses storage RLS by
// design, same as everything else in this app) and saves the
// resulting public URL onto the logged-in user's profile.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase-office";

const MAX_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Use a PNG, JPEG, WebP, or GIF image." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image must be under 3MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.type.split("/")[1];
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl;

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("Error in profile/avatar:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
