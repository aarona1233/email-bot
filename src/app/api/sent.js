// src/lib/sent.js
// ─────────────────────────────────────────────────────────
// Records every email that actually goes out, so a human can
// review the full sent log at the end of the day — the
// customer's original inquiry, the exact reply that was sent,
// and their contact info, all in one place.
// ─────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase-office";

/**
 * Writes one row to sent_emails. Call this AFTER Resend
 * confirms the send succeeded — never before.
 */
export async function recordSentEmail({
  inboxEmailId   = null,
  customerName   = null,
  customerAddress,
  originalSubject = null,
  originalBody    = null,
  sentSubject,
  sentBody,
  imageUrls       = [],
  signatureUsed   = null,
  aiProvider      = null,
  resendEmailId   = null,
  sentVia         = "manual",
}) {
  const { data, error } = await supabase
    .from("sent_emails")
    .insert({
      inbox_email_id:   inboxEmailId,
      customer_name:    customerName,
      customer_address: customerAddress,
      original_subject: originalSubject,
      original_body:    originalBody,
      sent_subject:     sentSubject,
      sent_body:        sentBody,
      image_urls:       imageUrls,
      signature_used:   signatureUsed,
      ai_provider:      aiProvider,
      resend_email_id:  resendEmailId,
      sent_via:         sentVia,
    })
    .select()
    .single();

  if (error) {
    // Don't let a logging failure block the actual send response —
    // the email already went out. Just log it loudly.
    console.error("recordSentEmail failed:", error.message);
    return null;
  }

  return data;
}

/** Returns every sent email, newest first. */
export async function listSentEmails() {
  const { data, error } = await supabase
    .from("sent_emails")
    .select("*")
    .order("sent_at", { ascending: false });

  if (error) {
    console.error("listSentEmails:", error.message);
    return [];
  }
  return data;
}
