// src/app/api/inbox/review/route.js
// Records the human verdict on one email.
// This is what generates your training data.
//
// POST body: { id, isValid, rejectReason?, reviewedBy? }

import { NextResponse } from "next/server";
import { reviewEmail } from "@/lib/inbox";

export async function POST(request) {
  try {
    const { id, isValid, rejectReason, reviewedBy } = await request.json();

    if (id === undefined || isValid === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: id, isValid" },
        { status: 400 }
      );
    }

    if (isValid === false && !rejectReason) {
      return NextResponse.json(
        { error: "A reject reason is required when marking an email invalid." },
        { status: 400 }
      );
    }

    const updated = await reviewEmail(id, isValid, rejectReason, reviewedBy);

    console.log(`[inbox] Email ${id} reviewed → ${isValid ? "APPROVED" : "REJECTED"}`);
    if (updated.heuristic_prediction !== isValid) {
      console.log(`[inbox] ⚠ Heuristic disagreed with human on email ${id}`);
    }

    return NextResponse.json({ ok: true, email: updated });
  } catch (error) {
    console.error("Error in inbox/review:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
