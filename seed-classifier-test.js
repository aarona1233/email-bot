// seed-classifier-test.js
// ─────────────────────────────────────────────────────────
// 30 emails built specifically to stress-test the new local
// classifier (customer_inquiry / vendor_pitch / spam / uncertain)
// — not just the old valid/spam heuristic. See
// classifier_test_answer_key.pdf for ground truth.
//
// Heavy on vendor_pitch on purpose since that's the whole point
// of the new feature — paper, chairs, coffee service, the exact
// scenarios discussed when this was designed.
//
// Run with the dev server running:
//   node seed-classifier-test.js
// ─────────────────────────────────────────────────────────

const ENDPOINT = "http://localhost:3000/api/inbox/receive";

const EMAILS = [

  // ═══════════════════════════════════════════════════════
  // CUSTOMER_INQUIRY (8) — genuinely wants to rent FROM us
  // ═══════════════════════════════════════════════════════
  {
    from: "Nadia Farouk <nadia.farouk@example.com>",
    subject: "Private office for 3",
    body: `Hi, looking for a private office for a team of 3, somewhere in Manhattan. Could you send pricing and availability?
Thanks,
Nadia`,
  },
  {
    from: "Owen Baptiste <owen.baptiste@example.com>",
    subject: "Tour this week?",
    body: `Hello, would love to tour a space this week if possible. Team of 5, ideally Flatiron area.
Owen`,
  },
  {
    from: "Grace Whitfield <grace.whitfield@example.com>",
    subject: "Urgent - client meeting space",
    body: `Hi there, need a meeting room for tomorrow morning, about 8 people. Anything available on short notice?
Grace`,
  },
  {
    from: "Marcus Delgado <marcus.delgado@example.com>",
    subject: "Long term - team of 25",
    body: `Hello, we're expanding and need a long term space for about 25 people starting in 2 months. Budget is flexible, more concerned with finding the right location.
Best,
Marcus`,
  },
  {
    from: "Ines Kovac <ines.kovac@example.com>",
    subject: "FINRA compliant space needed",
    body: `Hi, small financial advisory firm here. Need office space that meets FINRA requirements, segregated area, key card access. Team of 4, Jersey City preferred.
Thanks,
Ines`,
  },
  {
    from: "Tariq Osman <tariq.osman@example.com>",
    subject: "Hot desk pricing",
    body: `Hey, what's the monthly cost for a hot desk? Just need somewhere to work a few days a week.
Tariq`,
  },
  {
    from: "Beatrix Lindqvist <beatrix.l@example.com>",
    subject: "Holiday party venue",
    body: `Hi, looking for event space for a company holiday party, around 45 people. Do you have anything available in December and can you send photos?
Beatrix`,
  },
  {
    from: "Samuel Achterberg <samuel.a@example.com>",
    subject: "Virtual office - mailing address",
    body: `Hello, we're remote but want a professional NYC address for client correspondence. Do you offer virtual office plans?
Sam`,
  },

  // ═══════════════════════════════════════════════════════
  // VENDOR_PITCH (10) — selling something TO us, star of this test
  // ═══════════════════════════════════════════════════════
  {
    from: "Patricia Nunez <pnunez@apexofficesupply.com>",
    subject: "Bulk pricing on office paper and printer supplies",
    body: `Hi there, we supply office paper, toner, and printer supplies to coworking operators across the tri-state area. Happy to put together a bulk quote for your locations - would love to set up a call.
Best,
Patricia
Apex Office Supply`,
  },
  {
    from: "Greg Iwu <greg@modernfurnitureco.com>",
    subject: "Ergonomic chairs for your locations",
    body: `Hello, we manufacture ergonomic office chairs and would love to discuss outfitting your spaces. We work with several coworking brands in NYC already. Can send a catalog and pricing if you're interested.
Greg
Modern Furniture Co`,
  },
  {
    from: "Lauren Chase <lauren@freshbrewservices.com>",
    subject: "Office coffee service",
    body: `Hi, we provide coffee and water cooler service to office buildings around Manhattan - full setup, restocking, maintenance included. Would you be open to a quick chat about your locations?
Lauren
Fresh Brew Services`,
  },
  {
    from: "Derek Holloway <derek@primeclean.biz>",
    subject: "Commercial cleaning contract",
    body: `Hello, Prime Clean handles nightly commercial cleaning for several office buildings in your area. We'd love to bid on service for your locations. Let me know if you'd like a quote.
Derek`,
  },
  {
    from: "Carl Whitman <carl@primeofficebrokers.com>",
    subject: "Premium space available immediately",
    body: `Hello,
We have premium private office space available near your Flatiron location, fully furnished, FINRA-compliant, ready for teams up to 15. Rates starting at $175/day. Let us know if you'd like to schedule a walkthrough!
Best,
Carl Whitman
Prime Office Brokers`,
  },
  {
    from: "Melissa Grant <mgrant@growthpartnersllc.com>",
    subject: "Partnership opportunity - referral network",
    body: `Hi team, I run a referral network connecting startups with flexible workspace providers. Would love to explore a partnership where we send you qualified leads in exchange for a referral fee. Open to a quick call?
Best,
Melissa`,
  },
  {
    from: "Andre Kim <andre@securedeskip.com>",
    subject: "IT support and network services for your buildings",
    body: `Hello, we provide managed IT support, network setup, and security services for coworking spaces. Given the number of tenants you manage, wanted to see if you'd be interested in a proposal.
Andre
SecureDesk IP`,
  },
  {
    from: "Jenny Oduya <jenny@risingstaffing.com>",
    subject: "Staffing solutions for your front desk / community team",
    body: `Hi there, we specialize in placing front desk and community management staff for coworking companies. Happy to discuss your current hiring needs, no obligation.
Jenny
Rising Staffing Solutions`,
  },
  {
    from: "Victor Palmieri <victor@shieldcoverage.com>",
    subject: "Commercial property insurance review",
    body: `Hello, we work with several coworking operators to review commercial property and liability coverage - often find savings compared to existing policies. Would you be open to a no-cost review of your current plan?
Victor
Shield Coverage Group`,
  },
  {
    from: "Renee Castillo <renee@brightsignageco.com>",
    subject: "Custom signage and branding for your locations",
    body: `Hi, we do custom signage, wayfinding, and branded wall graphics for commercial spaces. Saw your Flatiron location and thought it could use a refresh - happy to send some concepts.
Renee
Bright Signage Co`,
  },

  // ═══════════════════════════════════════════════════════
  // SPAM (6) — varied phishing/scam styles
  // ═══════════════════════════════════════════════════════
  {
    from: "Account Security <noreply@verify-account-now.net>",
    subject: "Your account will be suspended in 24 hours",
    body: `We detected unusual activity on your account. Verify your identity immediately or access will be suspended.
Verify Now: [link]`,
  },
  {
    from: "HR Payroll <payroll@directdeposit-update.com>",
    subject: "Update your direct deposit information",
    body: `We noticed an issue processing your direct deposit. Please confirm your banking details by replying to this email with your account and routing number.
HR Department`,
  },
  {
    from: "Domain Renewal <renew@domain-expiry-notice.com>",
    subject: "Your domain expires today - renew now",
    body: `This is a final notice. Your domain registration expires today. Renew immediately to avoid losing your website.
Renew Now: [link]`,
  },
  {
    from: "Lottery Commission <claims@intl-lottery-winners.org>",
    subject: "Congratulations! You've won $2,500,000",
    body: `We are pleased to inform you that your email address has been selected as a winner in our international lottery draw. To claim your prize, please provide your full name, address, and bank details.`,
  },
  {
    from: "Crypto Signals Pro <alerts@cryptosignalspro.io>",
    subject: "Our AI predicted the last 3 market moves - join free",
    body: `Our proprietary AI trading signals have a 94% accuracy rate. Join our free Telegram group before spots fill up and start trading like a pro today.`,
  },
  {
    from: "Software License <licensing@office-suite-renewal.com>",
    subject: "Your software license has expired",
    body: `Your office software license expired and your documents are at risk. Click below to renew and restore full access immediately.
Renew License: [link]`,
  },

  // ═══════════════════════════════════════════════════════
  // UNCERTAIN (6) — genuinely ambiguous, good honesty test
  // ═══════════════════════════════════════════════════════
  {
    from: "R. Palmer <rpalmer99@example.com>",
    subject: "Question",
    body: `Interested, let's talk.`,
  },
  {
    from: "info@citywideconnect.com",
    subject: "Following up",
    body: `Hi, following up on our conversation. Let me know your thoughts on moving forward when you get a chance.
Thanks`,
  },
  {
    from: "Dana Whitcombe <dana.w@bizsolutionsgroup.com>",
    subject: "Quick question about your space",
    body: `Hi, do you have anything available? Also wondering if you take on partners for events. Let me know either way.
Dana`,
  },
  {
    from: "office@flexspacenetwork.org",
    subject: "Network inquiry",
    body: `Hello, we're part of a flexible workspace network and wanted to connect regarding potential opportunities. Are you the right contact for this?`,
  },
  {
    from: "T. Ibrahim <tibrahim@example.com>",
    subject: "Re: space",
    body: `Yes that could work. What's next?`,
  },
  {
    from: "contact@newventuregroup.co",
    subject: "Introduction",
    body: `Hi, reaching out to introduce our group and explore whether there's a fit for working together. Happy to share more details on a call.
Best regards`,
  },
];

async function main() {
  console.log(`Seeding ${EMAILS.length} classifier test emails to ${ENDPOINT}\n`);

  let stored = 0, skipped = 0, failed = 0;

  for (const email of EMAILS) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...email,
          messageId: `classifier-test-${email.from}-${email.subject}`.slice(0, 150),
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
  console.log(`Open http://localhost:3000/inbox and click "Classify Pending"`);
  console.log(`Grade the results against classifier_test_answer_key.pdf`);
}

main();
