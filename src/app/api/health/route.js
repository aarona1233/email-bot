// src/app/api/health/route.js
// ─────────────────────────────────────────────────────────
// Admin-only system diagnostics. Checks every real component
// the app depends on and returns specific, actionable failure
// messages instead of a generic "something's wrong."
//
// Supersedes the old unauthenticated /api/debug route — that
// route predates the auth system and should be deleted; this
// covers everything it did and more, properly gated.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { supabase } from "@/lib/supabase-office";
import { pingProvider } from "@/lib/ai-providers";

async function checkDatabase() {
  const start = Date.now();
  try {
    const results = await Promise.all([
      supabase.from("office_spaces").select("*", { count: "exact", head: true }),
      supabase.from("inbox_emails").select("*", { count: "exact", head: true }),
      supabase.from("sent_emails").select("*", { count: "exact", head: true }),
    ]);

    const failed = results.find((r) => r.error);
    if (failed) {
      return { ok: false, label: "Database", detail: `Query failed: ${failed.error.message}` };
    }

    const [spaces, inbox, sent] = results;
    return {
      ok: true,
      label: "Database",
      detail: `Connected — ${spaces.count ?? 0} spaces, ${inbox.count ?? 0} inbox emails, ${sent.count ?? 0} sent`,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { ok: false, label: "Database", detail: `Connection failed: ${err.message}` };
  }
}

async function checkFollowUpSettings() {
  try {
    const { data, error } = await supabase
      .from("follow_up_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single();

    if (error) return { ok: false, label: "Follow-Up Settings", detail: `No settings row found: ${error.message}. Run the schema SQL.` };

    return {
      ok: true,
      label: "Follow-Up Settings",
      detail: `enabled=${data.enabled}, auto_send=${data.auto_send}, wait_days=${data.wait_days}${data.paused_until ? `, paused until ${new Date(data.paused_until).toLocaleDateString()}` : ""}`,
    };
  } catch (err) {
    return { ok: false, label: "Follow-Up Settings", detail: err.message };
  }
}

async function checkResend() {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, label: "Resend (Email)", detail: "RESEND_API_KEY is not set in .env.local" };
  }
  if (!process.env.EMAIL_FROM) {
    return { ok: false, label: "Resend (Email)", detail: "EMAIL_FROM is not set — sends will fail even with a valid key." };
  }
  return { ok: true, label: "Resend (Email)", detail: `Key set, sending as ${process.env.EMAIL_FROM}` };
}

async function checkInboxIngestion() {
  const protocol = process.env.INBOX_PROTOCOL || "imap";

  if (protocol === "imap") {
    const missing = ["IMAP_HOST", "IMAP_USER", "IMAP_PASSWORD"].filter((k) => !process.env[k]);
    if (missing.length > 0) {
      return { ok: false, label: `Inbox Ingestion (IMAP)`, detail: `Missing: ${missing.join(", ")}` };
    }
    return { ok: true, label: "Inbox Ingestion (IMAP)", detail: `${process.env.IMAP_USER} @ ${process.env.IMAP_HOST} — use "Force Seed Test Email" below to verify the full pipeline` };
  }

  if (protocol === "jmap") {
    const hasAuth = process.env.JMAP_TOKEN || (process.env.JMAP_USERNAME && process.env.JMAP_PASSWORD);
    if (!process.env.JMAP_HOST || !hasAuth) {
      return { ok: false, label: "Inbox Ingestion (JMAP)", detail: "Missing JMAP_HOST or auth (JMAP_TOKEN or JMAP_USERNAME+JMAP_PASSWORD)" };
    }
    return { ok: true, label: "Inbox Ingestion (JMAP)", detail: `${process.env.JMAP_HOST}` };
  }

  return { ok: false, label: "Inbox Ingestion", detail: `Unknown INBOX_PROTOCOL: "${protocol}"` };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const aiProvider         = process.env.AI_PROVIDER || "claude";
  const classifierProvider = process.env.CLASSIFIER_PROVIDER || "ollama";

  const [
    database,
    followUpSettings,
    resend,
    inboxIngestion,
    aiProviderCheck,
    classifierCheck,
  ] = await Promise.all([
    checkDatabase(),
    checkFollowUpSettings(),
    checkResend(),
    checkInboxIngestion(),
    pingProvider(aiProvider, process.env.AI_MODEL).then((r) => ({ ...r, label: `AI Provider (${aiProvider})` })),
    pingProvider(classifierProvider, process.env.CLASSIFIER_MODEL).then((r) => ({ ...r, label: `Classifier (${classifierProvider})` })),
  ]);

  const checks = [database, aiProviderCheck, classifierCheck, inboxIngestion, resend, followUpSettings];
  const allOk = checks.every((c) => c.ok);

  return NextResponse.json(
    { status: allOk ? "ok" : "degraded", checkedAt: new Date().toISOString(), checks },
    { status: allOk ? 200 : 500 }
  );
}
