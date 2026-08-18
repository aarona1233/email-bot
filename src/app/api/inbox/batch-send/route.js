// src/app/api/inbox/batch-send/route.js
// ─────────────────────────────────────────────────────────
// Sends multiple approved drafts in one call. Requires a
// logged-in session — the signature applied to EVERY email
// in the batch is that logged-in person's own signature,
// looked up server-side, never trusted from the client.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { markReplied } from "@/lib/inbox";
import { recordSentEmail } from "@/lib/sent";
import { getSessionUser } from "@/lib/supabase/server";
import { getHumanSignature, appendSignature } from "@/lib/signature";
import { supabase } from "@/lib/supabase-office";

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

  return { cleanBody, allImages, imageHtml };
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const { emails } = await request.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of emails to send." },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, signature")
      .eq("id", user.id)
      .single();

    const signature = await getHumanSignature(user.id);
    const sentByName = profile?.display_name || user.email;

    const results = [];

    for (const item of emails) {
      const { inboxId, to, subject, body, imageUrls, customerName, originalSubject, originalBody } = item;

      if (!to || !body) {
        results.push({ inboxId, ok: false, error: "Missing to or body" });
        continue;
      }

      try {
        const { cleanBody, allImages, imageHtml } = buildHtml(body, imageUrls);
        const finalBody = appendSignature(cleanBody, signature);

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: [to],
          subject: subject || "Re: Your Inquiry",
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;"><p style="white-space: pre-line;">${finalBody}</p>${imageHtml}</div>`,
        });

        if (error) {
          results.push({ inboxId, ok: false, error: error.message });
          continue;
        }

        if (inboxId) await markReplied(inboxId);

        await recordSentEmail({
          inboxEmailId:    inboxId || null,
          customerName:    customerName || null,
          customerAddress: to,
          originalSubject: originalSubject || null,
          originalBody:    originalBody || null,
          sentSubject:     subject || "Re: Your Inquiry",
          sentBody:        finalBody,
          imageUrls:       allImages,
          signatureUsed:   signature,
          aiProvider:      process.env.AI_PROVIDER || null,
          resendEmailId:   data.id,
          sentVia:         "batch",
          sentByUserId:    user.id,
          sentByName,
        });

        results.push({ inboxId, ok: true, emailId: data.id, to });
      } catch (err) {
        results.push({ inboxId, ok: false, error: err.message });
      }
    }

    const sent = results.filter((r) => r.ok).length;
    console.log(`[Batch Send] ${sent}/${emails.length} sent by ${sentByName}`);

    return NextResponse.json({ ok: true, sent, total: emails.length, results });
  } catch (error) {
    console.error("Error in batch-send:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
