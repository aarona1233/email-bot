// seed-demo-inbox.js
// ─────────────────────────────────────────────────────────
// Tight 8-email demo set for tomorrow. Curated for variety
// in under 2 minutes of triage: a couple of obvious spam,
// one sneaky "looks valid but isn't" case (great teaching
// moment for why human review still matters), and real
// inquiries with different signals — capacity edge case,
// long-term commitment, out-of-area, tour + pricing.
//
// Run with the dev server running:
//   node seed-demo-inbox.js
// ─────────────────────────────────────────────────────────

const ENDPOINT = "http://localhost:3000/api/inbox/receive";

const DEMO_EMAILS = [
  // ── REAL — broker, urgent, team of 4 ──────────────────
  {
    from: "Tom Holland <tomholland@example.com>",
    subject: "Office space needed this weekend",
    body: `Hello,
I'm looking for an office space in NYC this weekend for a team of 4 people. We are a broker group and just need the space to meet with some potential customers for business meetings. So hoping for at least basic amenities and accommodations.
Thank you,
Tom Holland
1234567890`,
  },

  // ── SPAM — obvious phishing ────────────────────────────
  {
    from: "Security Team <security@totally-legit-bank.com>",
    subject: "URGENT: Verify your account now",
    body: `Dear customer,
We have detected suspicious payment activities on your account, please verify your identity immediately from the link below to continue with authorization, or your account will be suspended.
Insert:link
Thanks,
Security team`,
  },

  // ── REJECT (nuance) — vendor pitch dressed as an inquiry ──
  // Heuristic likely flags this "likely valid" because it
  // mentions FINRA, amenities, teams — but read closely, this
  // person is trying to LEASE OUT their own space TO Coalition
  // Space, not asking to rent one. Great live example of why
  // the human triage step still matters.
  {
    from: "Dwight Schrute <dwight@schrutefarms-realty.com>",
    subject: "Premium space available near financial district",
    body: `Hi!
Are you interested in some office spaces that are available near the financial district? We offer FINRA requirements and amenities such as fast WiFi, copiers, computers, projectors, etc. It's made to fit teams of 20 and under. Pricing for this location starts from 150 a day and more! It can be yours as quick as today with just a call to schedule!
Reach out for any further information,
Dwight Schrute`,
  },

  // ── REJECT — job application, not a customer inquiry ──
  {
    from: "Kelly Kapoor <kellykapoor@example.com>",
    subject: "Reception job opening",
    body: `To whom it may concern,
Hi my name is Kelly Kapoor. I saw that you have a reception job opening here. I was wondering where could I go to find out more information and also to apply?
I'm very interested in this opportunity, thank you!
Kelly Kapoor`,
  },

  // ── REAL — tour request + pricing ─────────────────────
  {
    from: "Michael Scott <michaelscott@example.com>",
    subject: "Interested in touring a space",
    body: `Hello,
I see that you have amazing office spaces available in NYC. I am really interested to set up a tour to take a look at it myself as soon as possible. Also would you be able to give me a bit more information on the pricing please?
Thank you,
Michael Scott`,
  },

  // ── REAL — capacity edge case (50+ people) ────────────
  {
    from: "Gabriella Solis <gabriellasolis@example.com>",
    subject: "Space for large team in Jersey City",
    body: `Hi,
Do you have any space in Jersey City fitting for 50 plus people?
Thanks,
Gabriella Solis`,
  },

  // ── REAL — long-term, big team, flexible budget ───────
  {
    from: "Bella K. <bellak@example.com>",
    subject: "Long term office space starting August",
    body: `Hi,
Do you have any long term office spaces that are available to be rented out starting the first week of August. Interested in a space for a team of at least 20 for the next six months and pricing is not really an issue.
Just let me know, thanks,
Bella K.`,
  },

  // ── REAL — out-of-service-area edge case ──────────────
  {
    from: "Drew Starkey <drewstarkey@example.com>",
    subject: "Office space inquiry - Kentucky",
    body: `Hello,
I am very interested in your office spaces, and I'm located in Kentucky and was wondering if any were available in this area?
Thank you.
Drew Starkey`,
  },
];

async function main() {
  console.log(`Seeding ${DEMO_EMAILS.length} demo emails to ${ENDPOINT}\n`);

  for (const email of DEMO_EMAILS) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...email,
          messageId: `demo-${email.from}-${email.subject}`.slice(0, 150),
        }),
      });
      const data = await res.json();

      if (data.duplicate) {
        console.log(`↷ already seeded: ${email.subject}`);
      } else if (res.ok) {
        console.log(`✓ stored #${data.id}: ${email.subject}`);
      } else {
        console.log(`✗ failed: ${email.subject} — ${data.error}`);
      }
    } catch (err) {
      console.log(`✗ error: ${email.subject} — ${err.message}`);
      console.log(`  Is the dev server running on port 3000?`);
      return;
    }
  }

  console.log(`\nDone. Open http://localhost:3000/inbox`);
}

main();
