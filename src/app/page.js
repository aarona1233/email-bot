// src/app/page.js
// ─────────────────────────────────────────────────────────
// Root now redirects straight to the inbox — the new landing page.
// The manual copy/paste flow lives at /manual.
// ─────────────────────────────────────────────────────────
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/inbox");
}
