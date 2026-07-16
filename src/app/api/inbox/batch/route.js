// src/app/api/inbox/batch/route.js
// ─────────────────────────────────────────────────────────
// Takes a list of email IDs, approves them all, and generates
// a draft reply for each. Returns the batch of drafts ready
// for the user to review one by one.
//
// POST /api/inbox/batch   body: { ids: [1,2,3], signature?: string }
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getEmail, reviewEmail } from "@/lib/inbox";
import { analyzeInquiry, isRelevantInquiry } from "@/lib/supabase-office";
import { generateOfficeReply } from "@/lib/ai-office";

export async function POST(request) {
  try {
    const { ids, signature } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of email ids to batch process." },
        { status: 400 }
      );
    }

    const results = [];

    for (const id of ids) {
      const email = await getEmail(id);
      if (!email) {
        results.push({ id, ok: false, error: "Not found" });
        continue;
      }

      try {
        // Mark approved (writes training data)
        await reviewEmail(id, true, null, "batch");

        // Off-topic guard — flag but don't hard fail the batch
        if (!isRelevantInquiry(email.body)) {
          results.push({
            id,
            ok: true,
            warning: "flagged off-topic by heuristic",
            from: email.from_address,
            subject: email.subject,
            draft: null,
          });
          continue;
        }

        // Generate the draft
        const analysis = await analyzeInquiry(email.body);
        const draft    = await generateOfficeReply(email.body, analysis, signature || "");

        results.push({
          id,
          ok: true,
          from: email.from_address,
          subject: email.subject,
          originalBody: email.body,
          draft,
          spaces: analysis.bestMatches,
          analysis: {
            spaceTypes:   analysis.spaceTypes,
            capacities:   analysis.capacities,
            locations:    analysis.locations,
            amenities:    analysis.amenities,
            pricingTiers: analysis.pricingTiers,
            isUrgent:     analysis.isUrgent,
            wantsTour:    analysis.wantsTour,
            wantsCall:    analysis.wantsCall,
          },
        });
      } catch (err) {
        results.push({ id, ok: false, error: err.message });
      }
    }

    const succeeded = results.filter((r) => r.ok && r.draft).length;
    console.log(`[Batch] Processed ${ids.length} emails, ${succeeded} drafts generated`);

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error("Error in inbox/batch:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
