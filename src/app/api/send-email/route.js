// src/app/api/send-email/route.js
// ─────────────────────────────────────────────────────────
// Sends one email via Resend, then logs it to sent_emails.
//
// The signature is NOT trusted from the client — this route
// requires a logged-in session, looks up THAT person's own
// signature server-side, and appends it. This is what makes
// "only human-edited emails get a human signature" actually
// enforced rather than just a suggestion.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordSentEmail } from "@/lib/sent";
import { markReplied } from "@/lib/inbox";
import { getSessionUser } from "@/lib/supabase/server";
import { getHumanSignature, appendSignature } from "@/lib/signature";
import { supabase } from "@/lib/supabase-office";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // ── Require a logged-in human — this route is only ever
    // reached by a person clicking Send in the review UI ──
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const {
      to,
      subject,
      body,
      imageUrls,
      inboxEmailId,
      customerName,
      originalSubject,
      originalBody,
      aiProvider,
    } = await request.json();

    if (!to || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, body" },
        { status: 400 }
      );
    }

    // ── Parse [ATTACH IMAGE: url] tags from the draft text ──
    const draftImageUrls = (body.match(/\[ATTACH IMAGE:\s*([^\]]+)\]/g) || [])
      .map((tag) => tag.replace(/\[ATTACH IMAGE:\s*/, "").replace(/\]$/, "").trim())
      .filter(Boolean);

    const allImageUrls = [
      ...new Set([...(imageUrls || []), ...draftImageUrls])
    ].filter(Boolean);

    const cleanBody = body.replace(/\[ATTACH IMAGE:[^\]]*\]/g, "").trim();

    // ── Look up THIS logged-in person's signature and append it ──
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, signature")
      .eq("id", user.id)
      .single();

    const signature   = await getHumanSignature(user.id);
    const finalBody   = appendSignature(cleanBody, signature);

    const imageHtml = allImageUrls.length > 0
      ? allImageUrls.map((url) => `
          <div style="margin: 20px 0;">
            <img src="${url}" alt="Property photo"
              style="max-width: 500px; width: 100%; border-radius: 8px; border: 1px solid #eee; display: block;" />
          </div>`
        ).join("")
      : "";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
        <p style="white-space: pre-line;">${finalBody}</p>
        ${imageHtml}
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject: subject || "Re: Your Inquiry",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await recordSentEmail({
      inboxEmailId:    inboxEmailId    || null,
      customerName:    customerName    || null,
      customerAddress: to,
      originalSubject: originalSubject || null,
      originalBody:    originalBody    || null,
      sentSubject:     subject || "Re: Your Inquiry",
      sentBody:        finalBody,
      imageUrls:       allImageUrls,
      signatureUsed:   signature,
      aiProvider:      aiProvider || process.env.AI_PROVIDER || null,
      resendEmailId:   data.id,
      sentVia:         "manual",
      sentByUserId:    user.id,
      sentByName:      profile?.display_name || user.email,
    });

    if (inboxEmailId) {
      await markReplied(inboxEmailId);
    }

    return NextResponse.json({
      success: true,
      emailId: data.id,
      imagesSent: allImageUrls.length,
    });
  } catch (error) {
    console.error("Error in send-email:", error.message);
    return NextResponse.json(
      { error: `Failed to send email: ${error.message}` },
      { status: 500 }
    );
  }
}
