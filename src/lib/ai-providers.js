// src/lib/ai-providers.js
// ─────────────────────────────────────────────────────────
// Single shared place that knows how to talk to every AI
// provider (Claude, OpenAI, Ollama, Gemini). Previously this
// exact same block of 4 functions was copy-pasted in both
// ai-office.js and followup-ai.js — this is the one copy now.
//
// Two call sites for two different jobs, both go through here:
//   - callProvider()     free-text generation (email drafts)
//   - callProviderJSON() structured classification, parses
//                        and validates the model's JSON output
//                        defensively since local models
//                        occasionally return malformed JSON
// ─────────────────────────────────────────────────────────

async function callClaude(systemPrompt, userMessage, model = "claude-opus-4-6", maxTokens = 1500) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Claude API error");
  return data.content[0].text;
}

async function callOpenAI(systemPrompt, userMessage, model = "gpt-4o", maxTokens = 1500) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
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

async function callOllama(systemPrompt, userMessage, model) {
  const resolvedModel = model || process.env.OLLAMA_MODEL || "llama3.2";
  const host = process.env.OLLAMA_HOST_URL || "http://localhost:11434";

  const response = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: resolvedModel,
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

async function callGemini(systemPrompt, userMessage, model = "gemini-1.5-flash") {
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

/**
 * Free-text generation — used for anything that produces an
 * email body a human will read (replies, follow-up drafts).
 *
 * @param {string} provider  "claude" | "openai" | "ollama" | "gemini"
 */
export async function callProvider(provider, systemPrompt, userMessage, { model, maxTokens } = {}) {
  switch (provider) {
    case "claude":  return callClaude(systemPrompt, userMessage, model, maxTokens);
    case "openai":  return callOpenAI(systemPrompt, userMessage, model, maxTokens);
    case "ollama":  return callOllama(systemPrompt, userMessage, model);
    case "gemini":  return callGemini(systemPrompt, userMessage, model);
    default:
      throw new Error(`Unknown AI provider: "${provider}". Use claude, openai, ollama, or gemini.`);
  }
}

/**
 * Structured/JSON generation — used for classification, where
 * the model must return parseable JSON, not prose. Local models
 * occasionally wrap JSON in prose or markdown fences despite
 * instructions, so this extracts the first {...} block rather
 * than assuming the whole response is clean JSON.
 *
 * Never throws on a malformed response — returns null instead,
 * so callers can fall back to a safe default (e.g. "uncertain")
 * rather than crashing the ingestion pipeline over a bad
 * classification.
 */
export async function callProviderJSON(provider, systemPrompt, userMessage, opts = {}) {
  const strictSystemPrompt = `${systemPrompt}

CRITICAL: Respond with ONLY a single JSON object. No markdown fences, no explanation before or after, no prose. Just the raw JSON object starting with { and ending with }.`;

  let raw;
  try {
    raw = await callProvider(provider, strictSystemPrompt, userMessage, opts);
  } catch (err) {
    console.error(`[ai-providers] ${provider} call failed:`, err.message);
    return null;
  }

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error(`[ai-providers] No JSON object found in response:`, raw.slice(0, 200));
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch (err) {
    console.error(`[ai-providers] JSON parse failed:`, err.message, "raw:", match[0].slice(0, 200));
    return null;
  }
}

/**
 * Lightweight connectivity check for any provider — used by the
 * admin health page. Returns detailed, specific failure reasons
 * rather than a generic "failed" so an admin can actually tell
 * what's wrong without digging through logs.
 *
 * For Ollama this checks the server is reachable AND the
 * specific model is actually pulled (the two most common local
 * setup failures). For hosted providers it makes one minimal
 * real API call to confirm the key is valid — cheap (5 tokens).
 */
export async function pingProvider(provider, model) {
  const start = Date.now();

  if (provider === "ollama") {
    const host = process.env.OLLAMA_HOST_URL || "http://localhost:11434";
    const resolvedModel = model || process.env.OLLAMA_MODEL || "llama3.2";

    try {
      const pingRes = await fetch(host, { signal: AbortSignal.timeout(4000) });
      if (!pingRes.ok) {
        return { ok: false, detail: `Ollama responded with HTTP ${pingRes.status} — is it actually running?` };
      }
    } catch (err) {
      return {
        ok: false,
        detail: err.name === "TimeoutError"
          ? "Ollama did not respond within 4s — check it's running and OLLAMA_HOST_URL is correct."
          : `Could not reach Ollama at ${host}: ${err.message}`,
      };
    }

    try {
      const tagsRes = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(4000) });
      const tagsData = await tagsRes.json();
      const installed = (tagsData.models || []).map((m) => m.name);
      const found = installed.some((m) => m === resolvedModel || m.startsWith(resolvedModel));

      if (!found) {
        return {
          ok: false,
          detail: `Ollama is running, but model "${resolvedModel}" is not installed. Run: ollama pull ${resolvedModel}. Currently installed: ${installed.join(", ") || "none"}`,
        };
      }
      return { ok: true, detail: `Ollama reachable, model "${resolvedModel}" installed`, latencyMs: Date.now() - start };
    } catch (err) {
      return { ok: false, detail: `Ollama reachable but /api/tags failed: ${err.message}` };
    }
  }

  // Hosted providers — confirm the key exists before even trying,
  // so the failure message points at the actual missing env var.
  const keyEnvVar = {
    claude: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    gemini: "GEMINI_API_KEY",
  }[provider];

  if (keyEnvVar && !process.env[keyEnvVar]) {
    return { ok: false, detail: `${keyEnvVar} is not set in .env.local` };
  }

  try {
    await callProvider(provider, "Respond with only the word OK.", "OK", { model, maxTokens: 5 });
    return { ok: true, detail: `${provider} API key is valid`, latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, detail: err.message };
  }
}
