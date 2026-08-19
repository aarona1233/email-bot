// src/lib/classifier.js
// ─────────────────────────────────────────────────────────
// Local-model classification layer. Sits between the keyword
// heuristic and human triage:
//
//   heuristic (instant, free)
//     -> local LLM classifier (this file — cheap, seconds)
//       -> human triage (unchanged, still reviews everything)
//
// The LLM never auto-approves or auto-rejects anything. It
// only sorts the pending queue into categories so a human can
// triage vendor pitches separately from customer inquiries
// separately from obvious spam — instead of everything landing
// in one undifferentiated pile.
//
// "Training" here means retrieval, not fine-tuning: every real
// human decision already made (via reject_reason, stored in
// screening_feedback) gets pulled in as few-shot examples at
// classification time. No training pipeline, no GPU, nothing
// to maintain — it just gets better as your team triages more
// email. See the research note at the bottom of this file for
// when real fine-tuning would actually be worth doing.
// ─────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase-office";
import { scanSignals, isRelevantInquiry } from "@/lib/supabase-office";
import { callProviderJSON } from "@/lib/ai-providers";

const VALID_CATEGORIES = ["customer_inquiry", "vendor_pitch", "spam", "uncertain"];

// Maps existing reject_reason strings (from the triage UI's
// dropdown, already in use) onto a category. This is how past
// human decisions become classifier training data for free —
// no new labeling work, no schema most people have to touch.
function rejectReasonToCategory(reason) {
  if (!reason) return null;
  const r = reason.toLowerCase();
  if (r.includes("vendor") || r.includes("sales pitch")) return "vendor_pitch";
  if (r.includes("spam") || r.includes("promotional") || r.includes("automated")) return "spam";
  return null; // job application, other — not useful as a 4-category example
}

/**
 * Pulls a handful of real past decisions from screening_feedback
 * to use as few-shot examples. Capped small on purpose — a
 * handful of clear examples steers a local model fine; dumping
 * in fifty just burns context for no real gain.
 */
async function getFewShotExamples() {
  const { data, error } = await supabase
    .from("screening_feedback")
    .select("email_subject, email_body, human_label, reject_reason")
    .order("created_at", { ascending: false })
    .limit(60); // pull a generous pool, then pick a small varied sample below

  if (error || !data) return [];

  const byCategory = { customer_inquiry: [], vendor_pitch: [], spam: [] };

  for (const row of data) {
    const category = row.human_label
      ? "customer_inquiry"
      : rejectReasonToCategory(row.reject_reason);
    if (category && byCategory[category].length < 2) {
      byCategory[category].push({
        subject: row.email_subject,
        snippet: (row.email_body || "").slice(0, 200),
        category,
      });
    }
  }

  return [...byCategory.customer_inquiry, ...byCategory.vendor_pitch, ...byCategory.spam];
}

function buildPrompt(email, heuristicResult, fewShotExamples) {
  const examplesText = fewShotExamples.length === 0
    ? "(No past examples yet — use your best judgment based on the definitions above.)"
    : fewShotExamples.map((ex, i) =>
        `Example ${i + 1} — subject: "${ex.subject}"\nBody snippet: "${ex.snippet}"\nCorrect category: ${ex.category}`
      ).join("\n\n");

  const systemPrompt = `You classify incoming business emails for Coalition Space, a coworking and private office company. Sort each email into exactly one category:

- "customer_inquiry": someone genuinely wants to RENT office space FROM Coalition Space
- "vendor_pitch": someone is trying to SELL something TO Coalition Space — office space, supplies, services, a business partnership, a referral arrangement. Pay close attention to DIRECTION: an email that mentions offices, pricing, and amenities is NOT automatically a customer — read whether they're asking to rent or offering to sell/lease/partner.
- "spam": phishing, scams, automated newsletters, cold outreach unrelated to the business
- "uncertain": genuinely unclear, or it doesn't fit any category above cleanly

A basic keyword scanner already flagged this email as: ${heuristicResult.isRelevant ? "possibly relevant" : "possibly irrelevant"} (it just counts keyword matches, it does not understand context or direction — you can and should disagree with it).

Real past examples from this team's own triage decisions:

${examplesText}`;

  const userMessage = `Classify this email:

From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Respond with JSON in exactly this shape:
{"category": "customer_inquiry" | "vendor_pitch" | "spam" | "uncertain", "confidence": "high" | "medium" | "low", "reasoning": "one short sentence"}`;

  return { systemPrompt, userMessage };
}

/**
 * Classifies one email. Pure function — does not touch the
 * database. Never throws: worst case returns "uncertain" with
 * low confidence, which safely routes to normal human triage
 * same as everything already does today.
 */
export async function classifyEmail({ from, subject, body }) {
  const provider = process.env.CLASSIFIER_PROVIDER || "ollama";
  const model    = process.env.CLASSIFIER_MODEL || undefined;

  const heuristicResult = { isRelevant: isRelevantInquiry(body), signals: scanSignals(body) };
  const fewShotExamples = await getFewShotExamples();
  const { systemPrompt, userMessage } = buildPrompt({ from, subject, body }, heuristicResult, fewShotExamples);

  const result = await callProviderJSON(provider, systemPrompt, userMessage, { model, maxTokens: 200 });

  if (!result || !VALID_CATEGORIES.includes(result.category)) {
    console.error(`[classifier] Invalid or missing result from ${provider}, defaulting to uncertain`);
    return { category: "uncertain", confidence: "low", reasoning: "Classifier returned an unusable response." };
  }

  console.log(`[classifier] (${provider}) -> ${result.category} (${result.confidence || "?"}) — ${email_subject_safe(subject)}`);

  return {
    category:   result.category,
    confidence: ["high", "medium", "low"].includes(result.confidence) ? result.confidence : "medium",
    reasoning:  (result.reasoning || "").slice(0, 300),
  };
}

function email_subject_safe(subject) {
  return (subject || "").slice(0, 60);
}

/**
 * Classifies one inbox_emails row by id and writes the result
 * back. This is the function ingestEmail() calls automatically
 * for every new email — the whole pipeline described above,
 * end to end, in one call.
 */
export async function classifyAndStore(id) {
  const { data: email, error } = await supabase
    .from("inbox_emails")
    .select("id, from_address, subject, body")
    .eq("id", id)
    .single();

  if (error || !email) {
    console.error(`[classifier] Could not load email ${id}:`, error?.message);
    return null;
  }

  const result = await classifyEmail({
    from: email.from_address,
    subject: email.subject,
    body: email.body,
  });

  await supabase
    .from("inbox_emails")
    .update({
      category:            result.category,
      category_confidence: result.confidence,
      category_reasoning:  result.reasoning,
      classified_at:       new Date().toISOString(),
    })
    .eq("id", id);

  return result;
}

/**
 * Backfill/utility — classifies every pending email that
 * hasn't been classified yet. Useful for a manual "Classify
 * Now" button, or for catching up rows ingested before this
 * feature existed.
 */
export async function classifyAllPending({ limit = 25 } = {}) {
  const { data: rows, error } = await supabase
    .from("inbox_emails")
    .select("id")
    .eq("status", "pending")
    .is("category", null)
    .order("received_at", { ascending: true })
    .limit(limit);

  if (error || !rows) return { classified: 0, errors: 0 };

  let classified = 0, errors = 0;
  for (const row of rows) {
    const result = await classifyAndStore(row.id);
    result ? classified++ : errors++;
  }

  return { classified, errors };
}

// ─────────────────────────────────────────────────────────
// RESEARCH NOTE — real fine-tuning, for when it's actually worth it
// ─────────────────────────────────────────────────────────
// The retrieval approach above (few-shot from screening_feedback)
// is intentionally the whole strategy for now. Real fine-tuning
// (LoRA/QLoRA via a tool like Unsloth) is a legitimate next step
// LATER, but only once BOTH of these are true:
//
//   1. You have 500+ reviewed examples — this is the threshold
//      the current fine-tuning literature converges on. Below
//      that, a fine-tuned model tends to just memorize noise.
//   2. The database schema has settled — fine-tuning bakes in
//      assumptions about categories/format that are expensive
//      to change; better to lock the shape of the data first.
//
// The real pipeline, when you get there:
//   your data -> format as instruction/response JSONL pairs
//     -> LoRA fine-tune with Unsloth (needs an NVIDIA GPU,
//        12-24GB VRAM depending on model size, ~1-4 hours)
//     -> export merged model to GGUF
//     -> `ollama create coalition-classifier -f Modelfile`
//     -> point CLASSIFIER_MODEL at the new model name
//
// Nothing else in this file changes when that day comes — the
// CLASSIFIER_PROVIDER/CLASSIFIER_MODEL env vars already support
// swapping in a custom Ollama model with zero code changes.
