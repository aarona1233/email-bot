// src/app/api/health/route.js
// ─────────────────────────────────────────────────────────
// Hit this endpoint to check if everything is connected.
// Visit http://localhost:3000/api/health in your browser.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-office";

// ── Check Supabase ────────────────────────────────────────
async function checkSupabase() {
  try {
    const { data, error } = await supabase
      .from("office_spaces")
      .select("count")
      .limit(1);

    if (error) throw new Error(error.message);
    return { ok: true, message: "Connected to Supabase" };
  } catch (err) {
    return { ok: false, message: `Supabase error: ${err.message}` };
  }
}

// ── Check Ollama ──────────────────────────────────────────
async function checkOllama() {
  const model = process.env.OLLAMA_MODEL || "llama3.2";

  try {
    // First check if Ollama server is even running
    const pingRes = await fetch("http://localhost:11434", {
      signal: AbortSignal.timeout(3000), // give up after 3 seconds
    });

    if (!pingRes.ok) throw new Error("Ollama server not responding");

    // Then check if the specific model is actually downloaded
    const modelsRes = await fetch("http://localhost:11434/api/tags");
    const modelsData = await modelsRes.json();

    const installedModels = modelsData.models?.map((m) => m.name) || [];

    // Model names sometimes have ":latest" appended, so check both
    const modelInstalled = installedModels.some(
      (m) => m === model || m === `${model}:latest` || m.startsWith(model)
    );

    if (!modelInstalled) {
      return {
        ok: false,
        message: `Ollama is running but model "${model}" is not installed. Run: ollama pull ${model}`,
        installedModels: installedModels,
      };
    }

    return {
      ok: true,
      message: `Ollama running with model "${model}"`,
      installedModels: installedModels,
    };
  } catch (err) {
    if (err.name === "TimeoutError") {
      return {
        ok: false,
        message: "Ollama is not running. Start it or download it from ollama.com",
      };
    }
    return { ok: false, message: `Ollama error: ${err.message}` };
  }
}

// ── Check Claude ──────────────────────────────────────────
async function checkClaude() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, message: "ANTHROPIC_API_KEY is not set in .env.local" };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }],
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 401) return { ok: false, message: "Claude API key is invalid" };
    if (!res.ok) return { ok: false, message: `Claude returned status ${res.status}` };

    return { ok: true, message: "Claude API key is valid and working" };
  } catch (err) {
    return { ok: false, message: `Claude error: ${err.message}` };
  }
}

// ── Check OpenAI ──────────────────────────────────────────
async function checkOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, message: "OPENAI_API_KEY is not set in .env.local" };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 401) return { ok: false, message: "OpenAI API key is invalid" };
    if (!res.ok) return { ok: false, message: `OpenAI returned status ${res.status}` };

    return { ok: true, message: "OpenAI API key is valid and working" };
  } catch (err) {
    return { ok: false, message: `OpenAI error: ${err.message}` };
  }
}

// ── Check Gemini ──────────────────────────────────────────
async function checkGemini() {
  if (!process.env.GEMINI_API_KEY) {
    return { ok: false, message: "GEMINI_API_KEY is not set in .env.local" };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (res.status === 400 || res.status === 403) {
      return { ok: false, message: "Gemini API key is invalid" };
    }
    if (!res.ok) return { ok: false, message: `Gemini returned status ${res.status}` };

    return { ok: true, message: "Gemini API key is valid and working" };
  } catch (err) {
    return { ok: false, message: `Gemini error: ${err.message}` };
  }
}

// ── Main handler ──────────────────────────────────────────
export async function GET() {
  const provider = process.env.AI_PROVIDER || "claude";

  // Always check Supabase
  const supabaseStatus = await checkSupabase();

  // Only check the active AI provider
  let aiStatus;
  switch (provider) {
    case "claude":  aiStatus = await checkClaude();  break;
    case "openai":  aiStatus = await checkOpenAI();  break;
    case "ollama":  aiStatus = await checkOllama();  break;
    case "gemini":  aiStatus = await checkGemini();  break;
    default:
      aiStatus = { ok: false, message: `Unknown provider: "${provider}"` };
  }

  const allOk = supabaseStatus.ok && aiStatus.ok;

  return NextResponse.json(
    {
      status: allOk ? "ok" : "error",
      provider: provider,
      checks: {
        supabase: supabaseStatus,
        ai: aiStatus,
      },
    },
    { status: allOk ? 200 : 500 }
  );
}