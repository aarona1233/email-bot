// src/app/api/health/reseed/route.js
// ─────────────────────────────────────────────────────────
// POST: injects one synthetic test email through the REAL
// ingestion pipeline (database write -> keyword heuristic ->
// local classifier) — not a mock, the actual code path real
// mail takes. If something's broken, this shows exactly which
// stage failed instead of you waiting around for real mail to
// eventually reveal it.
//
// DELETE: cleans up every test email this has ever created, so
// they don't pile up in the real triage queue.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { supabase } from "@/lib/supabase-office";
import { ingestEmail } from "@/lib/inbox";

const TEST_TAG = "system-check";

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const stamp = Date.now();
  const messageId = `${TEST_TAG}-${stamp}`;

  try {
    const { created, email } = await ingestEmail({
      from: `System Check <${TEST_TAG}+${stamp}@coalitionspace.internal>`,
      subject: `[SYSTEM CHECK] Pipeline test — ${new Date().toLocaleString()}`,
      body: `This is an automated test email from the admin diagnostics panel, verifying the full ingestion pipeline end to end: database write, keyword heuristic, and local classifier.

For a realistic test payload: we are looking for a private office for 4 people in New York, monthly.

Safe to reject or delete after reviewing.`,
      messageId, // timestamped — never collides, never dedupes
    });

    if (!created) {
      return NextResponse.json(
        { ok: false, error: "Insert reported as a duplicate, which shouldn't happen with a timestamped id. Something's odd with the dedupe check itself." },
        { status: 500 }
      );
    }

    // ingestEmail() already awaits classification internally before
    // returning, so re-fetching now gets the classified result —
    // this is what actually proves the classifier stage worked too,
    // not just the insert.
    const { data: finalRow, error: fetchError } = await supabase
      .from("inbox_emails")
      .select("*")
      .eq("id", email.id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { ok: false, error: `Insert succeeded (id ${email.id}) but re-fetch failed: ${fetchError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      email: finalRow,
      pipeline: {
        databaseWrite:     true, // if we're here, the insert above succeeded
        heuristicRan:      finalRow.heuristic_prediction !== null,
        classifierRan:     finalRow.category !== null,
        classifierResult:  finalRow.category
          ? `${finalRow.category} (${finalRow.category_confidence} confidence)`
          : "Did not complete — check the classifier provider is reachable (see health checks above)",
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: `Pipeline failed before completing: ${err.message}` }, { status: 500 });
  }
}

export async function DELETE() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { error: deleteError, count } = await supabase
    .from("inbox_emails")
    .delete({ count: "exact" })
    .ilike("message_id", `${TEST_TAG}-%`);

  if (deleteError) {
    return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}
