// src/app/api/inbox/training-export/route.js
// Downloads every labeled example as JSONL.
// This is the file you'll feed to the screening AI later.
//
// GET /api/inbox/training-export

import { NextResponse } from "next/server";
import { exportTrainingData, getHeuristicAccuracy } from "@/lib/inbox";

export async function GET() {
  try {
    const [rows, accuracy] = await Promise.all([
      exportTrainingData(),
      getHeuristicAccuracy(),
    ]);

    // JSONL = one JSON object per line. Standard for fine-tuning.
    const jsonl = rows.map((r) => JSON.stringify(r)).join("\n");

    return new NextResponse(jsonl, {
      status: 200,
      headers: {
        "Content-Type": "application/jsonl",
        "Content-Disposition": `attachment; filename="screening_training_data.jsonl"`,
        "X-Total-Examples": String(rows.length),
        "X-Heuristic-Accuracy": String(accuracy.accuracy ?? "n/a"),
      },
    });
  } catch (error) {
    console.error("Error in training-export:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
