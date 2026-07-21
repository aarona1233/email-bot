// src/app/api/inbox/batch-send/route.js
// ─────────────────────────────────────────────────────────
// Sends multiple approved drafts in one call. Each item carries
// its own recipient, subject, body, images, and — new — the
// original inquiry context so it can be logged to sent_emails
// for the end-of-day audit tab.
//
// POST body: { emails: [ { inboxId, to, subject, body, imageUrls,
//                           customerName, originalSubject,
//                           originalBody, signatureUsed } ] }
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { markReplied } from "@/lib/inbox";
import { recordSentEmail } from "@/lib/sent";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildHtml(body, imageUrls) {
  const cleanBody = body.replace(/\[ATTACH IMAGE:[^\]]*\]/g, "").trim();

  const draftImages = (body.match(/\[ATTACH IMAGE:\s*([^\]]+)\]/g) || [])
    .map((t) => t.replace(/\[ATTACH IMAGE:\s*/, "").replace(/\]$/, "").trim());

  const allImages = [...new Set([...(imageUrls || []), ...draftImages])].filter(Boolean);

  const imageHtml = allImages.map((url) => `
    <div style="margin: 20px 0;">
      <img src="${url}" alt="Property photo"
        style="max-width: 500px; width: 100%; border-radius: 8px; border: 1px solid #eee; display: block;" />
    </div>`).join("");

  return {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
        <p style="white-space: pre-line;">${cleanBody}</p>
        ${imageHtml}
      </div>`,
    cleanBody,
    allImages,
  };
}

export async function POST(request) {
  try {
    const { emails } = await request.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of emails to send." },
        { status: 400 }
      );
    }

    const results = [];

    for (const item of emails) {
      const {
        inboxId, to, subject, body, imageUrls,
        customerName, originalSubject, originalBody, signatureUsed,
      } = item;

      if (!to || !body) {
        results.push({ inboxId, ok: false, error: "Missing to or body" });
        continue;
      }

      try {
        const { html, cleanBody, allImages } = buildHtml(body, imageUrls);

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: [to],
          subject: subject || "Re: Your Inquiry",
          html,
        });

        if (error) {
          results.push({ inboxId, ok: false, error: error.message });
          continue;
        }

        // Mark the source inbox email as replied so it leaves the queue
        if (inboxId) await markReplied(inboxId);

        // Log to the sent-emails audit trail
        await recordSentEmail({
          inboxEmailId:    inboxId || null,
          customerName:    customerName || null,
          customerAddress: to,
          originalSubject: originalSubject || null,
          originalBody:    originalBody || null,
          sentSubject:     subject || "Re: Your Inquiry",
          sentBody:        cleanBody,
          imageUrls:       allImages,
          signatureUsed:   signatureUsed || null,
          aiProvider:      process.env.AI_PROVIDER || null,
          resendEmailId:   data.id,
          sentVia:         "batch",
        });

        results.push({ inboxId, ok: true, emailId: data.id, to });
      } catch (err) {
        results.push({ inboxId, ok: false, error: err.message });
      }
    }

    const sent = results.filter((r) => r.ok).length;
    console.log(`[Batch Send] ${sent}/${emails.length} sent`);

    return NextResponse.json({ ok: true, sent, total: emails.length, results });
  } catch (error) {
    console.error("Error in batch-send:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
