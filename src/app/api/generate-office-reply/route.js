// src/app/api/generate-office-reply/route.js

import { NextResponse } from "next/server";
import { analyzeInquiry, isRelevantInquiry } from "@/lib/supabase-office";
import { generateOfficeReply } from "@/lib/ai-office";

export async function POST(request) {
  try {
    const { customerEmail, signature } = await request.json();

    if (!customerEmail || customerEmail.trim() === "") {
      return NextResponse.json({ error: "No email provided." }, { status: 400 });
    }

    // Off-topic guardrail
    if (!isRelevantInquiry(customerEmail)) {
      return NextResponse.json(
        {
          error: "off_topic",
          message: "This email doesn't appear to be related to office space."
        },
        { status: 422 }
      );
    }

    const analysis   = await analyzeInquiry(customerEmail);
    const draftReply = await generateOfficeReply(customerEmail, analysis, signature);

    console.log("[Office] Signals:", JSON.stringify(analysis.signals));
    console.log("[Office] Best matches:", analysis.bestMatches.map(s => `${s.name} (${s._score})`));

    return NextResponse.json({
      draft:    draftReply,
      spaces:   analysis.bestMatches,
      analysis: {
        signals:            analysis.signals,
        spaceTypes:         analysis.spaceTypes,
        capacities:         analysis.capacities,
        locations:          analysis.locations,
        amenities:          analysis.amenities,
        pricingTiers:       analysis.pricingTiers,
        timeframes:         analysis.timeframes,
        compliance:         analysis.compliance,
        industry:           analysis.industry,
        availability:       analysis.availability,
        isUrgent:           analysis.isUrgent,
        wantsTour:          analysis.wantsTour,
        tourTime:           analysis.tourTime,
        wantsCall:          analysis.wantsCall,
        hasComplianceNeeds: analysis.hasComplianceNeeds,
      },
    });
  } catch (error) {
    console.error("Error in generate-office-reply:", error.message);
    return NextResponse.json(
      { error: `Something went wrong: ${error.message}` },
      { status: 500 }
    );
  }
}
