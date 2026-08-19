// src/lib/followup-ai.js
// ─────────────────────────────────────────────────────────
// Writes the actual follow-up email. Kept short, warm, and
// genuinely professional — the "why are you wasting my
// precious tokens" energy stays in code comments and internal
// labels, never in what the customer actually receives.
// ─────────────────────────────────────────────────────────

import { callProvider } from "@/lib/ai-providers";
function buildPrompt(sentEmail, followUpNumber) {
  const firstNameGuess = sentEmail.customer_name
    ? sentEmail.customer_name.split(" ")[0]
    : null;

  const systemPrompt = `You write short, warm follow-up emails for Coalition Space, a coworking and private office company.

The customer was sent a reply to their inquiry and never responded. You are writing a polite check-in — NOT a guilt trip, NOT passive-aggressive, NOT demanding. The goal is simply to re-open the conversation in case they got busy or missed the original email.

RULES:
1. Keep it to 3-4 sentences maximum
2. Reference that you sent them information before, briefly restate what it was about
3. Ask a simple, low-pressure question — e.g. if they're still looking, or if their plans changed
4. This is follow-up #${followUpNumber} — if it's #2 or later, acknowledge gently that this is a second check-in without being annoyed about it
5. Never mention "tokens", AI, automation, or anything about the system sending this
6. No markdown, no asterisks, no bullet formatting
7. Sign off with a brief, warm closing on its own line — e.g. "Best," or "Thanks," — and nothing after it. Do NOT invent a name or contact block; that gets added automatically based on who's actually sending it.
8. If a first name is available, use "Hi [FirstName]," otherwise use "Hi there,"`;

  const userMessage = `Original email sent to this customer:
"${sentEmail.sent_body}"

Customer name (if known): ${firstNameGuess || "unknown"}
This is follow-up #${followUpNumber}.

Write the follow-up email now. Output ONLY the email body — no subject line, no explanation.`;

  return { systemPrompt, userMessage };
}

// ── Main export ───────────────────────────────────────────
// Provider calls live in @/lib/ai-providers — see ai-office.js
// for the same change; this used to have an identical copy.
export async function generateFollowUpDraft(sentEmail, followUpNumber = 1) {
  const { systemPrompt, userMessage } = buildPrompt(sentEmail, followUpNumber);

  const provider = process.env.AI_PROVIDER || "claude";
  console.log(`[FollowUp AI] Provider: ${provider} | Follow-up #${followUpNumber} for ${sentEmail.customer_address}`);

  const body = await callProvider(provider, systemPrompt, userMessage, { maxTokens: 400 });

  const subject = followUpNumber > 1
    ? `Re: ${sentEmail.sent_subject || "Your Inquiry"} — following up again`
    : `Re: ${sentEmail.sent_subject || "Your Inquiry"} — just checking in`;

  return { subject, body: body.trim() };
}
