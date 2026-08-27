// middleware.js
// ─────────────────────────────────────────────────────────
// Runs on every request. Refreshes the auth session cookie
// and redirects to /login if there's no logged-in user —
// except for the login page itself, static assets, and the
// inbox webhook (that one's public on purpose — it's hit by
// mail providers with no browser session, protected instead
// by its own INBOX_WEBHOOK_SECRET check inside the route).
// ─────────────────────────────────────────────────────────
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
const PUBLIC_PATHS = ["/login", "/api/inbox/receive"];
export async function middleware(request) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/inbox";
    return NextResponse.redirect(url);
  }
  return response;
}
export const config = {
  matcher: [
    // Run on everything except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
