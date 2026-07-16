// src/lib/ai-office.js
// ─────────────────────────────────────────────────────────
// Prompt builder for Coalition Space email replies.
// Supports custom signatures per user.
// Trained on real example replies from Coalition Space.
// ─────────────────────────────────────────────────────────

// ── Real example replies ──────────────────────────────────
// These train the AI on tone and response strategy.
// Replace names/signatures in examples with placeholders
// so the AI uses the custom signature instead.
const EXAMPLE_REPLIES = [
  {
    situation: "Client needs 2-person private office at 485 Madison Ave, monthly, wants photos and tour",
    inquiry: "Hi, I'm looking for a private office at your 485 Madison Ave location for a team of 2. We'd need it monthly. Can you send over some photos and pricing? We'd love to come by for a tour as well. Best, John",
    reply: `Hi John!

Thank you for reaching out to us about our private office at the 485 Madison Ave location! I think we have exactly what you need for your team of two people.

The monthly pricing at this location is $2,000, and all of our private offices are fully-furnished and ready for immediate move-in, including a professional business address, conferencing, housekeeping, and high-speed Internet.

We'd love to have you by for a tour! What time this week or next week works best for you?

Here are some attached photos of this office location:

[YOUR SIGNATURE]`,
  },
  {
    situation: "Urgent FINRA/broker dealer compliance request, 6 people, New Jersey, key card and segregated entrance required",
    inquiry: "Hi, We are a newly registered broker dealer firm and need a segregated office space for 6 people in New Jersey. We require key card access and a separate entrance per FINRA requirements. We need this ASAP. Best, Michael",
    reply: `Hi Michael!

Thank you for reaching out to us about your urgent needs, and we'd love to help you choose your best option. I think we have an office that is perfect for your requirements. This private office in Jersey City is located at 10 Exchange Place, and it fits your requirements of a capacity of six people, key card access, and a separate entrance per FINRA requirements.

We have open availability for this location as soon as tomorrow. The monthly pricing is $1,800.

I look forward to hearing more from you, and please reach out at any time.

[YOUR SIGNATURE]`,
  },
  {
    situation: "Client needs 1-2 person private office, immediate move-in, New York, no budget given",
    inquiry: "Thank you for reaching out about private office spaces the need is immediate and it's for 1/2 people. Please send options over for your New York locations.",
    reply: `Hi Venus, appreciate your note and happy to share availability! Is there a budget or start date in mind? Just want a few more details so we can highlight the best options for your client.

Thank you!

[YOUR SIGNATURE]`,
  },
  {
    situation: "Real Coalition Space inquiry — RE: 462-468 Seventh Ave",
    inquiry: `Hi Asia,

This is what the are looking for: 

*  Budget: $4,000-$5,000 per month

*  Space type: A carve-out within a shared office (with a co-tenant)

 

Layout needs:

*	A couple of private offices

*	A few cubicles
*	Access to shared kitchen, break room, and conference rooms

	 

Do you have anything for them? 

 

Best, 

Cesar`,
    reply: `Hi Cesar! We have three brand new floors, fully-furnished and ready for immediate move-in that match your requirements. Attaching some photos of the space here, but looks amazing IRL. Are you available to meet my director, Tom, and see space this week?

 

Thank you!

[YOUR SIGNATURE]`,
  },
  {
    situation: "Real Coalition Space inquiry — RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, Unit",
    inquiry: `Hey Asia just following up on the price and square footage of this space?

 

All the best,

Graham

 

 

  

Graham Janovic`,
    reply: `Hi Graham! It's roughly around 6,000 SF, beautiful open space. My director, Tom, will give you a call to share more details!

[YOUR SIGNATURE]`,
  },
  {
    situation: "Real Coalition Space inquiry — RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, Unit",
    inquiry: `I just need to know pricing?

 

 

  

Graham Janovic`,
    reply: `Hi Graham! It's $39,000/mo. Let us know if you need further details or if you'd like to meet, we're flexible!

[YOUR SIGNATURE]`,
  },
  {
    situation: "Real Coalition Space inquiry — RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, Unit",
    inquiry: `How many offices/conference rooms/ phone booths/ desks does this unit have?

 

 

  

Graham Janovic`,
    reply: `Hi Graham! This is an enterprise space, but on the other floors, there's 47 offices, 3 conference rooms, 3 phone booths, and several hot desk and nook areas available. I'll also include those options in the 4th floorplan here and some photos.

[YOUR SIGNATURE]`,
  },
  {
    situation: "Real Coalition Space inquiry — RE: 485 Madison Ave, 7th Floor, New York, NY 10022, United S",
    inquiry: `Good Morning Asia,

Can you share what you have for 5-8 people who need 1-2 offices and bullpen of sorts?

photos?
asking?

Thanks,

Marcus Craddock
Senior Advisor
Cresa
1133 Avenue of the Americas, Suite 2900
New York, NY 10036
United States`,
    reply: `Hi Marcus! Absolutely, highlighting options here and confirming flexibility to tour anytime this week or next ðŸ˜Š

[YOUR SIGNATURE]`,
  },
  {
    situation: "Real Coalition Space inquiry — RE: Adam | 462 Seventh Ave, NY",
    inquiry: `i am open, but have a budget of 2500 per month....so please keep that in mind.`,
    reply: `Hi Adam, got it! We're attaching options here for both 462 Seventh Avenue and Tower 45. We'll write a note to check in early September if you'd like to stop by and see the spaces in-person. In the meanwhile, you're welcome to reach out here anytime ðŸ˜Š

[YOUR SIGNATURE]`,
  },
];

// ── Format a space for the AI prompt ─────────────────────
function formatSpace(space, label = "") {
  const pricing = [];
  if (space.hourly_rate)  pricing.push(`$${space.hourly_rate}/hour`);
  if (space.daily_rate)   pricing.push(`$${space.daily_rate}/day`);
  if (space.monthly_rate) pricing.push(`$${space.monthly_rate}/month`);

  const images = space.space_images && space.space_images.length > 0
    ? space.space_images
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img) => `Image${img.caption ? ` (${img.caption})` : ""}: ${img.url}`)
        .join("\n")
    : "Image: none";

  return `
${label ? `[${label}] ` : ""}SPACE: ${space.name}
Type: ${space.type}
Description: ${space.description}
Capacity: Up to ${space.capacity} people
Pricing: ${pricing.join(" | ") || "Contact for pricing"}
Availability: ${space.availability}
Location: ${space.address}, ${space.floor}
Amenities: ${space.amenities}
Match score: ${space._score ?? "N/A"}
${images}
`.trim();
}

// ── Build the full prompt ─────────────────────────────────
function buildPrompt(customerEmail, analysis, signature) {
  const {
    bestMatches,
    alternatives,
    isUrgent,
    wantsTour,
    tourTime,
    wantsCall,
    hasComplianceNeeds,
    spaceTypes,
    capacities,
    locations,
    amenities,
    pricingTiers,
    timeframes,
    compliance,
    industry,
    availability,
  } = analysis;

  // Fallback signature if none provided
  const signatureBlock = signature && signature.trim()
    ? signature.trim()
    : "Coalition Space Team\nPrivate & Shared Workspace | Meeting Rooms | Virtual Offices | Events\nhello@coalitionspace.com\nNew York | Jersey City | Denver";

  // Plain-English summary of detected signals
  const inquiryContext = [
    spaceTypes.length   > 0 && `Space type requested: ${spaceTypes.join(", ")}`,
    capacities.length   > 0 && `Capacity needed: ${capacities.join(", ")}`,
    locations.length    > 0 && `Preferred location(s): ${locations.join(", ")}`,
    timeframes.length   > 0 && `Timeframe: ${timeframes.join(", ")}`,
    isUrgent                 && `URGENT — client needs space immediately`,
    pricingTiers.length > 0 && `Pricing interest: ${pricingTiers.join(", ")}`,
    availability.length > 0 && `Availability inquiry: ${availability.join(", ")}`,
    amenities.length    > 0 && `Amenities requested: ${amenities.join(", ")}`,
    compliance.length   > 0 && `COMPLIANCE REQUIREMENTS: ${compliance.join(", ")} — needs segregated private space`,
    industry.length     > 0 && `Industry: ${industry.join(", ")}`,
    wantsTour                && `Tour requested${tourTime ? ` — preferred time: ${tourTime}` : ""}`,
    wantsCall                && `Wants a call or Zoom`,
  ].filter(Boolean).join("\n");

  // Best matching spaces (top 4)
  const bestContext = bestMatches.length === 0
    ? "No strong matches found in database."
    : bestMatches.slice(0, 4).map((s) => formatSpace(s, "BEST MATCH")).join("\n\n---\n\n");

  // Alternative spaces (top 3)
  const altContext = alternatives.length === 0
    ? ""
    : `\n\nALTERNATIVE OPTIONS (partial match — mention briefly):\n` +
      alternatives.slice(0, 3).map((s) => formatSpace(s, "ALTERNATIVE")).join("\n\n---\n\n");

  const examplesText = EXAMPLE_REPLIES.map((ex, i) => `
EXAMPLE ${i + 1} — Situation: ${ex.situation}
Client wrote: "${ex.inquiry}"
Reply:
${ex.reply}
`).join("\n---\n");

  const systemPrompt = `You are a sales representative at Coalition Space — a professional coworking and private office company with locations across New York, New Jersey, and Denver.

You write email replies to client inquiries about office space. Your style is warm, direct, and efficient. You never write walls of text. You get to the point fast.

Here are real examples of how replies are written. Note that [YOUR SIGNATURE] in the examples is a placeholder — always use the actual signature provided to you:
${examplesText}

KEY RULES — follow these exactly:
1. Always open with "Hi [FirstName]," — extract the first name from the email signature or sender name
2. If the client is missing key info (budget, start date, team size), ask for it briefly like Example 1 — don't dump all options on them
3. If the client gave enough info, share the BEST MATCH spaces and pricing directly
4. Always mention ALTERNATIVE spaces briefly at the end as other options — even if imperfect, say "We also have X which might work depending on your needs"
5. If the client wants a call or Zoom, offer one immediately — keep it very short like Example 3
6. If compliance requirements are mentioned (FINRA, broker dealer, etc.), acknowledge them and confirm you have segregated private spaces that can meet those needs
7. If a client wants a tour, confirm availability and ask for preferred time if not given
8. For pricing questions mention terms: Month-to-Month, 3-Month, 6-Month, 12-Month. 3-month minimum avoids the 10% fee
9. Include move-in requirements when sharing detailed pricing: first month rent, security deposit, keycard fee ($8.95/mo/person)
10. Always end with the EXACT signature block provided below — do not modify it
11. IMAGE RULE — this is critical: scan the space data above for any lines that start with "Image:" and contain a real URL (not the word "none"). If you find real Image URLs, copy them EXACTLY as written and add one line per image before the signature: [ATTACH IMAGE: <exact_url>]. If ALL Image lines say "Image: none" or no Image lines exist, do NOT include any [ATTACH IMAGE] lines whatsoever. Do NOT invent URLs. Do NOT guess URLs. Do NOT construct URLs from property names or addresses. Only real URLs copied verbatim from the data.
12. Never make up availability, pricing, or space details — only use what is in the database
13. Always give a recommendation even if the match is imperfect — explain what does and doesn't match

SIGNATURE — use this exactly at the end of every email:
${signatureBlock}`;

  const userMessage = `A client sent this inquiry:

"${customerEmail}"

What we detected about this inquiry:
${inquiryContext || "No specific signals detected — treat as a general inquiry and ask what they need"}

BEST MATCHING SPACES from our database:
${bestContext}
${altContext}

Write a reply email now. Always include at least one recommendation even if it is not a perfect match.`;

  return { systemPrompt, userMessage };
}

// ── Provider calls ────────────────────────────────────────

async function callClaude(systemPrompt, userMessage) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Claude API error");
  return data.content[0].text;
}

async function callOpenAI(systemPrompt, userMessage) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenAI API error");
  return data.choices[0].message.content;
}

async function callOllama(systemPrompt, userMessage) {
  const model = process.env.OLLAMA_MODEL || "llama3.2";
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Ollama error ${response.status}`);
  const data = await response.json();
  if (!data.message?.content) throw new Error("Unexpected Ollama response");
  return data.message.content;
}

async function callGemini(systemPrompt, userMessage) {
  const model = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini API error");
  return data.candidates[0].content.parts[0].text;
}

// ── Main export ───────────────────────────────────────────
export async function generateOfficeReply(customerEmail, analysis, signature = "") {
  const { systemPrompt, userMessage } = buildPrompt(customerEmail, analysis, signature);

  const provider = process.env.AI_PROVIDER || "claude";
  console.log(`[AI Office] Provider: ${provider} | Urgent: ${analysis.isUrgent} | Compliance: ${analysis.hasComplianceNeeds} | Spaces: ${analysis.bestMatches.length}`);

  switch (provider) {
    case "claude":  return await callClaude(systemPrompt, userMessage);
    case "openai":  return await callOpenAI(systemPrompt, userMessage);
    case "ollama":  return await callOllama(systemPrompt, userMessage);
    case "gemini":  return await callGemini(systemPrompt, userMessage);
    default:
      throw new Error(`Unknown AI_PROVIDER: "${provider}". Use claude, openai, ollama, or gemini.`);
  }
}
