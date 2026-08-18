// src/app/page.js
// ─────────────────────────────────────────────────────────
// Root now redirects to /login — that's the landing page.
// If the person is already signed in, middleware.js catches
// this immediately and bounces them straight to /inbox instead,
// so a logged-in visit to "/" still lands where you'd expect.
// ─────────────────────────────────────────────────────────
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
