// seed-training-inbox.js
// ─────────────────────────────────────────────────────────
// 25 varied emails for training/testing the triage system.
// See training_inbox_answer_key.pdf for the correct verdict
// on every single one.
//
// 5 of these come from Yimei2005730@gmail.com specifically —
// all genuinely REAL inquiries, so you can test actual Resend
// delivery and the follow-up feature against a real inbox you
// control.
//
// Run with the dev server running:
//   node seed-training-inbox.js
// ─────────────────────────────────────────────────────────

const ENDPOINT = "http://localhost:3000/api/inbox/receive";

const EMAILS = [

  // ═══════════════════════════════════════════════════════
  // FROM Yimei2005730@gmail.com — all genuinely REAL inquiries
  // ═══════════════════════════════════════════════════════
  {
    from: "Yimei Zhang <Yimei2005730@gmail.com>",
    subject: "Tour request - small office",
    body: `Hi there,
I'm looking for a private office for 2 people somewhere in Manhattan. Would love to come by for a tour this week if possible. Also curious what the monthly rate looks like.
Thanks,
Yimei`,
  },
  {
    from: "Gregory Eddie <Yimei2005730@gmail.com>",
    subject: "Question about pricing",
    body: `Hello,
Following up on office space near Penn Station. Could you send over pricing details for a small team, maybe 3-4 people? We'd want it on a monthly basis.
Best,
Gregory`,
  },
  {
    from: "Quinta Brunson <Yimei2005730@gmail.com>",
    subject: "Urgent - need space this weekend",
    body: `Hi,
This is a bit last minute but we need a meeting space for about 6 people this weekend for some client meetings. Do you have anything available on short notice?
Thank you,
Quinta`,
  },
  {
    from: "Melissa Schemmenti <Yimei2005730@gmail.com>",
    subject: "Long term lease inquiry",
    body: `Hello,
We're looking to commit to a space for about a year, team of around 15 people. Budget isn't the main concern, more so finding the right fit. What long-term options do you have?
Thanks so much,
Melissa`,
  },
  {
    from: "Tyler James Williams <Yimei2005730@gmail.com>",
    subject: "Compliance requirements - Jersey City",
    body: `Hi,
We're a small financial services firm looking for office space in Jersey City. We need something that meets FINRA requirements - segregated space, key card access, that sort of thing. Team of about 5. Can you help?
Best,
Tyler`,
  },

  // ═══════════════════════════════════════════════════════
  // REAL INQUIRIES (should be APPROVED) — other senders
  // ═══════════════════════════════════════════════════════
  {
    from: "Marcus Webb <aaron.arjunelall@gmail.com>",
    subject: "Office space",
    body: `Hi, do you have any private offices available for a team of 4? Looking in New York.
Thanks,
Marcus`,
  },
  {
    from: "Priya Nair <aaron.arjunelall@gmail.com>",
    subject: "Coworking desk options",
    body: `Hello, I'm a freelancer looking for a hot desk or coworking spot, ideally near Flatiron. What do you have and what does it cost per month?
Priya`,
  },
  {
    from: "Sofia Reyes <aaron.arjunelall@gmail.com>",
    subject: "Event space for launch party",
    body: `Hi there,
Planning a product launch event next month, expecting around 70 guests. Do you have event space available and can you send pricing and photos?
Thanks,
Sofia`,
  },
  {
    from: "Daniel Osei <aaron.arjunelall@gmail.com>",
    subject: "Office space in Kentucky?",
    body: `Hello, I'm interested in your office spaces but I'm based in Kentucky. Do you have anything in this area?
Thank you,
Daniel`,
  },
  {
    from: "Rachel Kim <aaron.arjunelall@gmail.com>",
    subject: "Large team - 60 people",
    body: `Hi, we're scaling fast and need space for about 60 people, ideally in New Jersey. What are our options?
Best,
Rachel`,
  },
  {
    from: "Tom Bradley <aaron.arjunelall@gmail.com>",
    subject: "Budget friendly options?",
    body: `Hey, looking for something affordable, under $100 a day if possible. What amenities come with your cheaper options?
Tom`,
  },
  {
    from: "Ana Lucia <aaron.arjunelall@gmail.com>",
    subject: "Space",
    body: `Hi, do you have anything available? Need it soon.
Ana`,
  },
  {
    from: "James Fitzgerald <aaron.arjunelall@gmail.com>",
    subject: "Client referral - office space",
    body: `Hello, I'm a commercial broker and I have a client looking for private office space for their team of 8, somewhere in Midtown. Could you send available options and pricing so I can pass along?
Best regards,
James Fitzgerald
Realty Partners`,
  },
  {
    from: "Wendy Liu <aaron.arjunelall@gmail.com>",
    subject: "Virtual office question",
    body: `Hi, we're a fully remote company but want a professional New York mailing address for client-facing purposes. Do you offer virtual office plans?
Thanks,
Wendy`,
  },

  // ═══════════════════════════════════════════════════════
  // TRICKY / AMBIGUOUS (mix of correct reject reasons)
  // ═══════════════════════════════════════════════════════
  {
    from: "Carl Whitman <aaron.arjunelall@gmail.com>",
    subject: "Premium space available immediately",
    body: `Hello,
We have premium private office space available near your Flatiron location, fully furnished, FINRA-compliant, ready for teams up to 15. Rates starting at $175/day. Let us know if you'd like to schedule a walkthrough - we can accommodate you as soon as this week!
Best,
Carl Whitman
Prime Office Brokers`,
  },
  {
    from: "Devon Marsh <aaron.arjunelall@gmail.com>",
    subject: "Front desk position",
    body: `Hi, I saw you might be hiring for a front desk / community associate role. I have 3 years of experience in hospitality and would love to apply. Could you point me to the application?
Thanks,
Devon`,
  },
  {
    from: "Melissa Grant <aaron.arjunelall@gmail.com>",
    subject: "Partnership opportunity",
    body: `Hi team,
I run a referral network connecting startups with flexible workspace providers. Would love to explore a partnership where we send you qualified leads in exchange for a referral fee. Open to a quick call?
Best,
Melissa`,
  },
  {
    from: "aaron.arjunelall@gmail.com",
    subject: "You're subscribed! Weekly business digest inside",
    body: `Thanks for subscribing to BizWeekly!
Your first issue is on its way. Read about trends in commercial real estate, remote work, and more.
Manage your subscription preferences here. Unsubscribe at any time.`,
  },
  {
    from: "aaron.arjunelall@gmail.com",
    subject: "You're invited: Future of Work Summit 2026",
    body: `Join 500+ leaders discussing the future of workspace and hybrid work at this year's Future of Work Summit. Early bird tickets available now.
Register today - limited seats remaining!`,
  },

  // ═══════════════════════════════════════════════════════
  // SPAM / PHISHING (should be REJECTED, varied styles)
  // ═══════════════════════════════════════════════════════
  {
    from: "Security Alert <alert@secure-banking-verify.com>",
    subject: "Action required: unusual sign-in detected",
    body: `We detected a sign-in from a new device. If this wasn't you, verify your identity immediately using the link below or your account will be locked within 24 hours.
Verify Now: [link]
Security Team`,
  },
  {
    from: "Billing Dept <billing@invoice-notify.net>",
    subject: "Invoice #88213 - Payment Overdue",
    body: `Your invoice is now 15 days overdue. Please remit payment immediately to avoid service interruption and late fees. Click here to view and pay your invoice.
Thank you,
Billing Department`,
  },
  {
    from: "Delivery Notice <noreply@parcel-tracking-us.com>",
    subject: "Your package could not be delivered",
    body: `We attempted to deliver your package today but were unable to complete delivery. Please confirm your address and reschedule delivery within 48 hours or your package will be returned to sender.
Reschedule Delivery: [link]`,
  },
  {
    from: "Investment Desk <opportunities@wealthgrowfast.io>",
    subject: "Turn $1,000 into $10,000 - limited spots",
    body: `Our proprietary AI trading algorithm has generated 400% returns for early investors. Limited spots remaining this month. Don't miss out on financial freedom.
Get Started Now: [link]`,
  },
  {
    from: "IT Support <support@password-reset-portal.com>",
    subject: "Your password expires today",
    body: `Your account password expires today. To avoid losing access, please reset your password immediately using the secure link below.
Reset Password: [link]
IT Support Team`,
  },
  {
    from: "SEO Growth Team <hello@rankboostpro.com>",
    subject: "We found 3 issues hurting your Google ranking",
    body: `Our free audit found 3 critical SEO issues on your website that are costing you visibility. Book a free 15-minute call this week to learn how to fix them.
Claim Your Free Audit`,
  },
];

async function main() {
  console.log(`Seeding ${EMAILS.length} training emails to ${ENDPOINT}\n`);

  let stored = 0, skipped = 0, failed = 0;

  for (const email of EMAILS) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...email,
          messageId: `training-${email.from}-${email.subject}`.slice(0, 150),
        }),
      });
      const data = await res.json();

      if (data.duplicate) {
        console.log(`- already seeded: ${email.subject}`);
        skipped++;
      } else if (res.ok) {
        console.log(`+ stored #${data.id}: ${email.subject}`);
        stored++;
      } else {
        console.log(`x failed: ${email.subject} - ${data.error}`);
        failed++;
      }
    } catch (err) {
      console.log(`x error: ${email.subject} - ${err.message}`);
      console.log(`  Is the dev server running on port 3000?`);
      return;
    }
  }

  console.log(`\nDone. Stored: ${stored}, Skipped (dupes): ${skipped}, Failed: ${failed}`);
  console.log(`Open http://localhost:3000/inbox`);
  console.log(`Grade the results against training_inbox_answer_key.pdf`);
}

main();
