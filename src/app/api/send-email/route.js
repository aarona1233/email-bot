// src/app/api/send-email/route.js

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { to, subject, body, imageUrls } = await request.json();

    if (!to || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, body" },
        { status: 400 }
      );
    }

    // ── Parse [ATTACH IMAGE: url] tags from the draft text ──
    // This catches any URLs the AI embedded in the draft that
    // may not have made it through the imageUrls array.
    const draftImageUrls = (body.match(/\[ATTACH IMAGE:\s*([^\]]+)\]/g) || [])
      .map((tag) => tag.replace(/\[ATTACH IMAGE:\s*/, "").replace(/\]$/, "").trim())
      .filter(Boolean);

    // Merge passed imageUrls + draft-parsed URLs, deduplicate
    const allImageUrls = [
      ...new Set([
        ...(imageUrls || []),
        ...draftImageUrls,
      ])
    ].filter(Boolean);

    console.log("[send-email] imageUrls from client:", imageUrls?.length ?? 0);
    console.log("[send-email] imageUrls from draft:", draftImageUrls.length);
    console.log("[send-email] total images to send:", allImageUrls.length);
    console.log("[send-email] URLs:", allImageUrls);

    // ── Clean the body — strip [ATTACH IMAGE:] tags from visible text ──
    const cleanBody = body
      .replace(/\[ATTACH IMAGE:[^\]]*\]/g, "")
      .trim();

    // ── Build image HTML ──────────────────────────────────
    const imageHtml = allImageUrls.length > 0
      ? allImageUrls.map((url) => `
          <div style="margin: 20px 0;">
            <img
              src="${url}"
              alt="Property photo"
              style="max-width: 500px; width: 100%; border-radius: 8px; border: 1px solid #eee; display: block;"
            />
          </div>`
        ).join("")
      : "";

    // ── Build HTML email ──────────────────────────────────
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
        <p style="white-space: pre-line;">${cleanBody}</p>
        ${imageHtml}
      </div>
    `;

    // ── Send via Resend ───────────────────────────────────
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
