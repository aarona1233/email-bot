// src/lib/followup-ai.js
// ─────────────────────────────────────────────────────────
// Writes the actual follow-up email. Kept short, warm, and
// genuinely professional — the "why are you wasting my
// precious tokens" energy stays in code comments and internal
// labels, never in what the customer actually receives.
// ─────────────────────────────────────────────────────────

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
7. Sign off simply as "Coalition Space" — no fabricated personal name
8. If a first name is available, use "Hi [FirstName]," otherwise use "Hi there,"`;

  const userMessage = `Original email sent to this customer:
"${sentEmail.sent_body}"

Customer name (if known): ${firstNameGuess || "unknown"}
This is follow-up #${followUpNumber}.

Write the follow-up email now. Output ONLY the email body — no subject line, no explanation.`;

  return { systemPrompt, userMessage };
}

// ── Provider calls — same pattern as ai-office.js ─────────

async function callClaude(systemPrompt, userMessage) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Claude API error");
  return data.content[0].text;
}

async function callOpenAI(systemPrompt, userMessage) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 400,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenAI API error");
  return data.choices[0].message.content;
}

async function callOllama(systemPrompt, userMessage) {
  const model = process.env.OLLAMA_MODEL || "llama3.2";
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Ollama error ${response.status}`);
  const data = await response.json();
  if (!data.message?.content) throw new Error("Unexpected Ollama response");
  return data.message.content;
}

async function callGemini(systemPrompt, userMessage) {
  const model = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini API error");
  return data.candidates[0].content.parts[0].text;
}

// ── Main export ───────────────────────────────────────────

export async function generateFollowUpDraft(sentEmail, followUpNumber = 1) {
  const { systemPrompt, userMessage } = buildPrompt(sentEmail, followUpNumber);

  const provider = process.env.AI_PROVIDER || "claude";
  console.log(`[FollowUp AI] Provider: ${provider} | Follow-up #${followUpNumber} for ${sentEmail.customer_address}`);

  let body;
  switch (provider) {
    case "claude":  body = await callClaude(systemPrompt, userMessage);  break;
    case "openai":  body = await callOpenAI(systemPrompt, userMessage); break;
    case "ollama":  body = await callOllama(systemPrompt, userMessage); break;
    case "gemini":  body = await callGemini(systemPrompt, userMessage); break;
    default:
      throw new Error(`Unknown AI_PROVIDER: "${provider}"`);
  }

  const subject = followUpNumber > 1
    ? `Re: ${sentEmail.sent_subject || "Your Inquiry"} — following up again`
    : `Re: ${sentEmail.sent_subject || "Your Inquiry"} — just checking in`;

  return { subject, body: body.trim() };
}
