// src/app/api/send-email/route.js
// ─────────────────────────────────────────────────────────
// Sends one email via Resend, then logs it to sent_emails
// so it shows up in the /sent audit tab. Accepts a few extra
// context fields beyond the original to/subject/body/imageUrls
// — all optional, all just for the audit log.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordSentEmail } from "@/lib/sent";
import { markReplied } from "@/lib/inbox";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const {
      to,
      subject,
      body,
      imageUrls,
      // ── optional context, used only for the sent-log audit trail ──
      inboxEmailId,
      customerName,
      originalSubject,
      originalBody,
      signatureUsed,
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
      ...new Set([
        ...(imageUrls || []),
        ...draftImageUrls,
      ])
    ].filter(Boolean);

    console.log("[send-email] imageUrls from client:", imageUrls?.length ?? 0);
    console.log("[send-email] imageUrls from draft:", draftImageUrls.length);
    console.log("[send-email] total images to send:", allImageUrls.length);

    const cleanBody = body
      .replace(/\[ATTACH IMAGE:[^\]]*\]/g, "")
      .trim();

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

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
        <p style="white-space: pre-line;">${cleanBody}</p>
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

    // ── Log to the sent-emails audit trail ─────────────────
    // Only happens after Resend confirms success above.
    await recordSentEmail({
      inboxEmailId:    inboxEmailId    || null,
      customerName:    customerName    || null,
      customerAddress: to,
      originalSubject: originalSubject || null,
      originalBody:    originalBody    || null,
      sentSubject:     subject || "Re: Your Inquiry",
      sentBody:        cleanBody,
      imageUrls:       allImageUrls,
      signatureUsed:   signatureUsed || null,
      aiProvider:      aiProvider || process.env.AI_PROVIDER || null,
      resendEmailId:   data.id,
      sentVia:         "manual",
    });

    // If this reply came from an inbox inquiry, mark it replied
    // so it drops out of the pending/approved queues.
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
