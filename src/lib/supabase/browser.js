// src/lib/supabase/browser.js
// ─────────────────────────────────────────────────────────
// Client-side Supabase client — ONLY for auth operations
// (sign in, sign out, MFA enroll/verify) that run in the
// browser. This uses the publishable/anon key, which now has
// zero table access thanks to RLS — it can only do Auth API
// calls (login, MFA), never touch office_spaces, sent_emails,
// etc. Those all go through our own Next.js API routes.
// ─────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
