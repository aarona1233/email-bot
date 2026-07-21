// src/lib/followup.js
// ─────────────────────────────────────────────────────────
// Detects customers who went silent after a reply, drafts
// (or auto-sends) a follow-up nudge. Every knob is stored in
// follow_up_settings so the behavior is fully configurable
// from the UI — no code changes needed to adjust timing.
// ─────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase-office";
import { generateFollowUpDraft } from "@/lib/followup-ai";
import { recordSentEmail } from "@/lib/sent";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Settings ──────────────────────────────────────────────

export async function getSettings() {
  const { data, error } = await supabase
    .from("follow_up_settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    console.error("getSettings:", error.message);
    return null;
  }
  return data;
}

export async function updateSettings(patch) {
  const current = await getSettings();
  if (!current) throw new Error("No settings row found — run the schema SQL first.");

  const { data, error } = await supabase
    .from("follow_up_settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", current.id)
    .select()
    .single();

  if (error) throw new Error(`updateSettings: ${error.message}`);
  return data;
}

// ── Reading follow-up records ─────────────────────────────

export async function listFollowUps(status = "pending_review") {
  let query = supabase
    .from("follow_ups")
    .select("*, sent_emails(*)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) { console.error("listFollowUps:", error.message); return []; }
  return data;
}

export async function getFollowUp(id) {
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*, sent_emails(*)")
    .eq("id", id)
    .single();

  if (error) { console.error("getFollowUp:", error.message); return null; }
  return data;
}

// ── The core detection scan ───────────────────────────────

/**
 * Finds sent emails that have gone unanswered for `wait_days`
 * and don't already have an open/sent follow-up, then either
 * queues a draft for human approval or sends it immediately —
 * depending on the auto_send setting.
 *
 * Safe to call as often as you like — it only acts on emails
 * that are actually due, and never double-creates a follow-up
 * for the same sent email.
 */
export async function runFollowUpScan({ force = false } = {}) {
  const settings = await getSettings();
  if (!settings) throw new Error("No follow-up settings found.");

  const summary = { ran: false, reason: "", candidatesFound: 0, created: 0, sent: 0, errors: 0 };

  // ── Respect the master toggle ──────────────────────────
  if (!settings.enabled && !force) {
    summary.reason = "Follow-ups are disabled in settings.";
    return summary;
  }

  // ── Respect the pause window (the "Santa's lap" knob) ──
  if (settings.paused_until && new Date(settings.paused_until) > new Date()) {
    summary.reason = `Paused until ${settings.paused_until}.`;
    return summary;
  }

  // ── Respect the scan interval, unless forced ───────────
  if (!force && settings.last_scan_at) {
    const hoursSinceLastScan =
      (Date.now() - new Date(settings.last_scan_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastScan < Number(settings.scan_interval_hours)) {
      summary.reason = `Last scan was ${hoursSinceLastScan.toFixed(1)}h ago — interval is ${settings.scan_interval_hours}h.`;
      return summary;
    }
  }

  summary.ran = true;
  console.log("[FollowUp] Running scan…");

  // ── Find sent emails older than the wait period ────────
  const cutoff = new Date(Date.now() - settings.wait_days * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates, error: candErr } = await supabase
    .from("sent_emails")
    .select("*")
    .lte("sent_at", cutoff)
    .order("sent_at", { ascending: true });

  if (candErr) throw new Error(`Scan query failed: ${candErr.message}`);

  console.log(`[FollowUp] ${candidates.length} sent email(s) older than ${settings.wait_days} day(s)`);

  for (const sent of candidates) {
    try {
      // Has the customer replied since we sent this?
      // A reply = any inbox_emails row from the same address
      // received AFTER we sent this one.
      const { data: replies, error: replyErr } = await supabase
        .from("inbox_emails")
        .select("id")
        .eq("from_address", sent.customer_address)
        .gt("received_at", sent.sent_at)
        .limit(1);

      if (replyErr) { summary.errors++; continue; }
      if (replies && replies.length > 0) continue; // they replied — nothing to do

      // How many follow-ups already exist for this sent email?
      const { data: existing, error: existErr } = await supabase
        .from("follow_ups")
        .select("id, status")
        .eq("sent_email_id", sent.id);

      if (existErr) { summary.errors++; continue; }

      const activeCount = (existing || []).filter((f) => f.status !== "skipped").length;
      if (activeCount >= settings.max_follow_ups) continue; // already nudged enough

      // Has a follow-up already been queued or sent very recently
      // for this exact sent email? Skip re-drafting.
      const alreadyPendingOrSent = (existing || []).some(
        (f) => f.status === "pending_review" || f.status === "sent"
      );
      if (alreadyPendingOrSent && activeCount >= 1 && settings.max_follow_ups === 1) continue;

      summary.candidatesFound++;

      // ── Draft the nudge ───────────────────────────────
      const followUpNumber = activeCount + 1;
      const { subject, body } = await generateFollowUpDraft(sent, followUpNumber);

      if (settings.auto_send) {
        // Send immediately, no human click
        const { data: resendData, error: resendErr } = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: [sent.customer_address],
          subject,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;"><p style="white-space: pre-line;">${body}</p></div>`,
        });

        if (resendErr) {
          console.error(`[FollowUp] Send failed for ${sent.customer_address}:`, resendErr.message);
          summary.errors++;
          continue;
        }

        await supabase.from("follow_ups").insert({
          sent_email_id:    sent.id,
          customer_address: sent.customer_address,
          customer_name:    sent.customer_name,
          follow_up_number: followUpNumber,
          status:           "sent",
          draft_subject:    subject,
          draft_body:       body,
          resend_email_id:  resendData.id,
          sent_at:          new Date().toISOString(),
        });

        await recordSentEmail({
          customerName:    sent.customer_name,
          customerAddress: sent.customer_address,
          sentSubject:     subject,
          sentBody:        body,
          resendEmailId:   resendData.id,
          sentVia:         "followup",
        });

        summary.sent++;
        console.log(`[FollowUp] Auto-sent nudge #${followUpNumber} to ${sent.customer_address}`);
      } else {
        // Queue for human approval
        await supabase.from("follow_ups").insert({
          sent_email_id:    sent.id,
          customer_address: sent.customer_address,
          customer_name:    sent.customer_name,
          follow_up_number: followUpNumber,
          status:           "pending_review",
          draft_subject:    subject,
          draft_body:       body,
        });

        summary.created++;
        console.log(`[FollowUp] Queued nudge #${followUpNumber} for ${sent.customer_address}`);
      }
    } catch (err) {
      console.error(`[FollowUp] Error processing sent email ${sent.id}:`, err.message);
      summary.errors++;
    }
  }

  await updateSettings({ last_scan_at: new Date().toISOString() });

  console.log("[FollowUp] Scan complete:", summary);
  return summary;
}

// ── Human actions on a queued follow-up ───────────────────

export async function sendFollowUp(id, { subject, body } = {}) {
  const followUp = await getFollowUp(id);
  if (!followUp) throw new Error(`Follow-up ${id} not found`);

  const finalSubject = subject || followUp.draft_subject;
  const finalBody    = body    || followUp.draft_body;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [followUp.customer_address],
    subject: finalSubject,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;"><p style="white-space: pre-line;">${finalBody}</p></div>`,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);

  await supabase
    .from("follow_ups")
    .update({
      status: "sent",
      draft_subject: finalSubject,
      draft_body: finalBody,
      resend_email_id: data.id,
      sent_at: new Date().toISOString(),
    })
    .eq("id", id);

  await recordSentEmail({
    customerName:    followUp.customer_name,
    customerAddress: followUp.customer_address,
    sentSubject:     finalSubject,
    sentBody:        finalBody,
    resendEmailId:   data.id,
    sentVia:         "followup",
  });

  return data;
}

export async function skipFollowUp(id) {
  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "skipped" })
    .eq("id", id);
  if (error) throw new Error(`skipFollowUp: ${error.message}`);
}
