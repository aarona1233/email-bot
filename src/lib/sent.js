// src/lib/sent.js
// ─────────────────────────────────────────────────────────
// Records every email that actually goes out, so a human can
// review the full sent log at the end of the day — the
// customer's original inquiry, the exact reply that was sent,
// and their contact info, all in one place.
// ─────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase-office";
import { getSettings } from "@/lib/followup";

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
  sentByUserId    = null,
  sentByName      = null,
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
      sent_by_user_id:  sentByUserId,
      sent_by_name:     sentByName,
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
// Works out, per sent email, what to actually show for its follow-up
// status — a real countdown, or the honest reason there isn't one
// (already followed up, follow-ups turned off, or currently paused).
// Kept as a pure function so the date math is easy to reason about
// and test in isolation from the database calls around it.
function computeFollowupStatus(sentEmail, settings, latestFollowUpBySentId) {
  const existing = latestFollowUpBySentId.get(sentEmail.id);
  if (existing) {
    if (existing.status === "sent")           return { label: "Follow-up sent", tone: "done" };
    if (existing.status === "pending_review") return { label: "Follow-up drafted — needs review", tone: "action" };
    if (existing.status === "skipped")        return { label: "Follow-up skipped", tone: "muted" };
    return { label: "Follow-up in progress", tone: "muted" };
  }

  if (!settings) return { label: "Follow-up status unknown", tone: "muted" };
  if (!settings.enabled) return { label: "Follow-ups disabled", tone: "muted" };

  if (settings.paused_until && new Date(settings.paused_until) > new Date()) {
    const pausedDate = new Date(settings.paused_until).toLocaleDateString();
    return { label: `Paused until ${pausedDate}`, tone: "muted" };
  }

  const sentAt   = new Date(sentEmail.sent_at);
  const waitDays = sentEmail.followup_wait_days_override ?? settings.wait_days ?? 5;
  const dueAt    = new Date(sentAt.getTime() + waitDays * 24 * 60 * 60 * 1000);
  const msLeft   = dueAt.getTime() - Date.now();
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));

  const isCustom = sentEmail.followup_wait_days_override != null;
  const customTag = isCustom ? " (custom timer)" : "";

  if (daysLeft > 0) {
    return { label: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left${customTag}`, tone: "pending" };
  }
  return { label: `Due now${customTag}`, tone: "due" };
}

export async function listSentEmails() {
  const [emailsResult, settings, followUpsResult] = await Promise.all([
    supabase.from("sent_emails").select("*").order("sent_at", { ascending: false }),
    getSettings(),
    supabase.from("follow_ups").select("sent_email_id, status").order("created_at", { ascending: false }),
  ]);

  if (emailsResult.error) {
    console.error("listSentEmails:", emailsResult.error.message);
    return [];
  }

  // Most recent follow-up per sent email wins, since results are
  // already ordered newest-first — first one seen per id is kept.
  const latestFollowUpBySentId = new Map();
  for (const f of followUpsResult.data || []) {
    if (!latestFollowUpBySentId.has(f.sent_email_id)) {
      latestFollowUpBySentId.set(f.sent_email_id, f);
    }
  }

  return (emailsResult.data || []).map((email) => ({
    ...email,
    followup_status: computeFollowupStatus(email, settings, latestFollowUpBySentId),
  }));
}
