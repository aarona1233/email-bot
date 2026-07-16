// src/lib/inbox.js
// ─────────────────────────────────────────────────────────
// Inbox ingestion + triage + training data capture.
// Reuses the keyword scanner from supabase-office.js so the
// heuristic prediction is stored alongside every human verdict.
// ─────────────────────────────────────────────────────────

import { supabase, scanSignals, isRelevantInquiry } from "@/lib/supabase-office";

// ─────────────────────────────────────────────────────────
// PARSING
// ─────────────────────────────────────────────────────────

/**
 * Pulls a display name and address out of a From header.
 *   "Evan Fleisch <evan@euno.ai>"  → { name: "Evan Fleisch", address: "evan@euno.ai" }
 *   "evan@euno.ai"                 → { name: null, address: "evan@euno.ai" }
 */
export function parseFromHeader(from) {
  if (!from) return { name: null, address: "" };

  const angled = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (angled) {
    return {
      name: angled[1].replace(/^["']|["']$/g, "").trim() || null,
      address: angled[2].trim().toLowerCase(),
    };
  }
  return { name: null, address: from.trim().toLowerCase() };
}

/**
 * Strips quoted reply chains and signature blocks so the
 * scanner only sees what the person actually wrote.
 * Conservative — only cuts at very obvious boundaries.
 */
export function stripQuotedText(body) {
  if (!body) return "";

  const cutMarkers = [
    /^\s*-{2,}\s*Original Message\s*-{2,}/im,
    /^\s*On .+ wrote:\s*$/im,
    /^\s*From:\s.+$/im,
    /^\s*_{10,}\s*$/m,
  ];

  let earliest = body.length;
  for (const marker of cutMarkers) {
    const m = body.match(marker);
    if (m && m.index !== undefined && m.index < earliest) {
      earliest = m.index;
    }
  }

  return body.slice(0, earliest).trim();
}

// ─────────────────────────────────────────────────────────
// INGESTION
// ─────────────────────────────────────────────────────────

/**
 * Stores an incoming email as 'pending'.
 * Also records what the keyword heuristic thought, so we can
 * later measure how often it agreed with the human.
 *
 * Returns { created: bool, email } — created=false means it
 * was a duplicate (webhook retry) and was skipped.
 */
export async function ingestEmail({ from, subject, body, messageId }) {
  const { name, address } = parseFromHeader(from);
  const cleanBody = stripQuotedText(body);

  if (!address) throw new Error("Email has no sender address");
  if (!cleanBody) throw new Error("Email has no body");

  // Baseline prediction from the existing keyword scanner.
  // We are NOT acting on this — just recording it for training.
  const heuristicPrediction = isRelevantInquiry(cleanBody);
  const heuristicSignals    = scanSignals(cleanBody);

  const { data, error } = await supabase
    .from("inbox_emails")
    .insert({
      from_name:            name,
      from_address:         address,
      subject:              subject || "(no subject)",
      body:                 cleanBody,
      status:               "pending",
      heuristic_prediction: heuristicPrediction,
      heuristic_signals:    heuristicSignals,
      message_id:           messageId || null,
    })
    .select()
    .single();

  // 23505 = unique violation → we've already stored this message
  if (error?.code === "23505") {
    return { created: false, email: null };
  }
  if (error) throw new Error(`ingestEmail: ${error.message}`);

  return { created: true, email: data };
}

// ─────────────────────────────────────────────────────────
// READING
// ─────────────────────────────────────────────────────────

export async function listEmails(status = "pending") {
  let query = supabase
    .from("inbox_emails")
    .select("*")
    .order("received_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) { console.error("listEmails:", error.message); return []; }
  return data;
}

export async function getEmail(id) {
  const { data, error } = await supabase
    .from("inbox_emails")
    .select("*")
    .eq("id", id)
    .single();

  if (error) { console.error("getEmail:", error.message); return null; }
  return data;
}

// ─────────────────────────────────────────────────────────
// REVIEW — the human verdict, and the training row it creates
// ─────────────────────────────────────────────────────────

/**
 * Records a human decision on one email.
 *
 * Two things happen atomically-ish:
 *   1. inbox_emails row is updated with the verdict
 *   2. screening_feedback row is written — this is the
 *      labeled training example for the future screening AI
 *
 * @param {number}  id            inbox_emails.id
 * @param {boolean} isValid       true = real inquiry, false = spam
 * @param {string}  rejectReason  optional, only when isValid=false
 * @param {string}  reviewedBy    optional reviewer name/email
 */
export async function reviewEmail(id, isValid, rejectReason = null, reviewedBy = null) {
  const email = await getEmail(id);
  if (!email) throw new Error(`Email ${id} not found`);

  // 1. Update the inbox row
  const { data: updated, error: updateError } = await supabase
    .from("inbox_emails")
    .update({
      status:        isValid ? "approved" : "rejected",
      is_valid:      isValid,
      reject_reason: isValid ? null : rejectReason,
      reviewed_at:   new Date().toISOString(),
      reviewed_by:   reviewedBy,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw new Error(`reviewEmail update: ${updateError.message}`);

  // 2. Write the training example
  const { error: feedbackError } = await supabase
    .from("screening_feedback")
    .insert({
      inbox_email_id:    id,
      email_subject:     email.subject,
      email_body:        email.body,
      from_address:      email.from_address,
      human_label:       isValid,
      reject_reason:     isValid ? null : rejectReason,
      heuristic_label:   email.heuristic_prediction,
      heuristic_signals: email.heuristic_signals,
    });

  if (feedbackError) {
    // Don't fail the whole review if only the training row failed —
    // the verdict is the important part. Log loudly instead.
    console.error("reviewEmail feedback insert failed:", feedbackError.message);
  }

  return updated;
}

/** Called after a draft is actually sent, so it leaves the queue. */
export async function markReplied(id) {
  const { error } = await supabase
    .from("inbox_emails")
    .update({ status: "replied" })
    .eq("id", id);
  if (error) console.error("markReplied:", error.message);
}

// ─────────────────────────────────────────────────────────
// TRAINING DATA
// ─────────────────────────────────────────────────────────

/**
 * How well is the keyword heuristic doing against human verdicts?
 * This is your baseline. Any AI screener you build later has to beat it.
 */
export async function getHeuristicAccuracy() {
  const { data, error } = await supabase
    .from("screening_feedback")
    .select("human_label, heuristic_label, heuristic_correct");

  if (error || !data || data.length === 0) {
    return { total: 0, correct: 0, accuracy: null,
             falsePositives: 0, falseNegatives: 0 };
  }

  const total   = data.length;
  const correct = data.filter((r) => r.heuristic_correct).length;

  // Heuristic said valid, human said spam → we'd have let spam through
  const falsePositives = data.filter(
    (r) => r.heuristic_label === true && r.human_label === false
  ).length;

  // Heuristic said spam, human said valid → we'd have dropped a real lead
  const falseNegatives = data.filter(
    (r) => r.heuristic_label === false && r.human_label === true
  ).length;

  return {
    total,
    correct,
    accuracy: Math.round((correct / total) * 100),
    falsePositives,
    falseNegatives,
  };
}

/**
 * Exports labeled examples as JSONL — the standard format for
 * fine-tuning and for building few-shot prompts later.
 */
export async function exportTrainingData() {
  const { data, error } = await supabase
    .from("screening_feedback")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    input: {
      from:    row.from_address,
      subject: row.email_subject,
      body:    row.email_body,
    },
    label:         row.human_label ? "valid" : "spam",
    reject_reason: row.reject_reason,
    heuristic_said: row.heuristic_label ? "valid" : "spam",
    heuristic_was_correct: row.heuristic_correct,
  }));
}
