// src/lib/supabase/server.js
// ─────────────────────────────────────────────────────────
// Cookie-aware server-side Supabase client — used ONLY to
// check "who is logged in" (auth.getUser()) inside middleware,
// Server Components, and API routes. Uses the anon key, same
// as the browser client — it reads the session cookie, it does
// NOT bypass RLS. For actual app data queries, API routes use
// the service-role client from @/lib/supabase-office instead.
// ─────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component that can't set cookies —
            // middleware handles the actual refresh in that case.
          }
        },
      },
    }
  );
}

/**
 * Convenience helper: returns the logged-in user (or null),
 * for use at the top of any API route that needs to check
 * "is someone logged in" before doing anything.
 */
export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
