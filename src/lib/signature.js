// src/lib/signature.js
// ─────────────────────────────────────────────────────────
// Resolves WHICH signature goes on an email, and appends it.
//
// The rule: a HUMAN signature is only ever used when a human
// actually reviewed/edited/clicked send on that specific email.
// Anything the AI sends with no human in the loop (auto_send
// follow-ups) gets the separate, admin-configured AI signature
// instead — never a specific person's name.
// ─────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase-office";

/** The signature belonging to a specific logged-in human. */
export async function getHumanSignature(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("signature, display_name")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("getHumanSignature:", error?.message);
    return null;
  }

  return data.signature || `${data.display_name || "Coalition Space"}`;
}

/** The one shared signature for fully-autonomous AI sends. */
export async function getAiSignature() {
  const { data, error } = await supabase
    .from("follow_up_settings")
    .select("ai_signature")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    console.error("getAiSignature:", error?.message);
    return "Coalition Space Team";
  }

  return data.ai_signature || "Coalition Space Team";
}

/** Appends a signature to the end of an email body. */
export function appendSignature(body, signature) {
  const cleanBody = (body || "").trim();
  if (!signature) return cleanBody;
  return `${cleanBody}\n\n${signature}`;
}
