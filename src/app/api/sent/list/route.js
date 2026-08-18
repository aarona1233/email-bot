// src/app/api/sent/list/route.js
// Returns the full sent-email audit log, newest first.
// GET /api/sent/list

import { NextResponse } from "next/server";
import { listSentEmails } from "@/lib/sent";

export async function GET() {
  try {
    const emails = await listSentEmails();
    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Error in sent/list:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
