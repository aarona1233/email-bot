// src/lib/supabase-office.js
// ─────────────────────────────────────────────────────────
// Flexible signal detection for Coalition Space inquiries.
// Uses scored fuzzy matching instead of binary checks —
// spaces are ranked by how well they match, and the AI
// always gets recommendations even on partial matches.
// ─────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnon);

// ─────────────────────────────────────────────────────────
// SIGNAL MAPS
// Each entry is { patterns: [...strings to match], category, label }
// Multiple patterns can map to the same signal.
// ─────────────────────────────────────────────────────────

const SIGNAL_MAP = [

  // ── Space type ────────────────────────────────────────
  {
    category: "spaceType",
    label: "Private Office",
    patterns: [
      "private office", "private space", "office space",
      "my own office", "dedicated office", "exclusive office",
    ],
  },
  {
    category: "spaceType",
    label: "Hot Desk",
    patterns: [
      "hot desk", "hot-desk", "coworking", "co-working",
      "shared desk", "flex desk", "open desk", "drop in",
    ],
  },
  {
    category: "spaceType",
    label: "Meeting Room",
    patterns: [
      "meeting room", "conference room", "boardroom",
      "board room", "huddle room", "conference space",
      "presentation room", "meeting space",
    ],
  },
  {
    category: "spaceType",
    label: "Event Space",
    patterns: [
      "event space", "event venue", "venue", "event room",
      "loft", "rooftop", "gathering space", "function room",
    ],
  },
  {
    category: "spaceType",
    label: "Virtual Office",
    patterns: [
      "virtual office", "virtual address", "mail handling only",
      "business address only", "remote address",
    ],
  },
  {
    category: "spaceType",
    label: "Day Office",
    patterns: [
      "day office", "day pass", "drop in office",
      "occasional office", "part time office",
    ],
  },
  {
    category: "spaceType",
    label: "Team Space",
    patterns: [
      "team space", "team room", "team office",
      "group space", "collaborative space",
    ],
  },

  // ── Capacity ──────────────────────────────────────────
  // Written-out numbers AND digits, flexible spacing
  {
    category: "capacity",
    label: "1 person",
    patterns: ["one person", "1 person", "just me", "myself",
      "solo", "individual", "single person", "for one"],
  },
  {
    category: "capacity",
    label: "2 people",
    patterns: ["two people", "2 people", "two person", "2 person",
      "pair", "duo", "1/2 people", "1-2 people", "one or two",
      "couple of people", "for two"],
  },
  {
    category: "capacity",
    label: "3 people",
    patterns: ["three people", "3 people", "three person", "3 person",
      "trio", "for three", "2/3 people", "2-3 people"],
  },
  {
    category: "capacity",
    label: "4 people",
    patterns: ["four people", "4 people", "four person", "4 person",
      "four-person", "4-person", "team of four", "team of 4",
      "four member", "4 member", "3/4 people", "3-4 people"],
  },
  {
    category: "capacity",
    label: "5 people",
    patterns: ["five people", "5 people", "five person", "5 person",
      "team of five", "team of 5", "4/5 people", "4-5 people"],
  },
  {
    category: "capacity",
    label: "6 people",
    patterns: ["six people", "6 people", "six person", "6 person",
      "team of six", "team of 6", "5/6 people", "5-6 people"],
  },
  {
    category: "capacity",
    label: "7-10 people",
    patterns: ["seven people", "7 people", "eight people", "8 people",
      "nine people", "9 people", "ten people", "10 people",
      "team of seven", "team of eight", "team of ten",
      "7-10 people", "small team"],
  },
  {
    category: "capacity",
    label: "10+ people",
    patterns: ["ten plus", "10+", "more than ten", "large team",
      "big team", "growing team", "expanding team",
      "eleven", "twelve", "fifteen", "twenty"],
  },

  // ── Time frame / Urgency ──────────────────────────────
  {
    category: "timeframe",
    label: "Immediate",
    patterns: ["immediate", "immediately", "right away", "asap",
      "as soon as possible", "urgent", "urgently",
      "need it now", "right now", "today", "tomorrow",
      "this week", "short notice", "straight away"],
  },
  {
    category: "timeframe",
    label: "Near term",
    patterns: ["next week", "next month", "coming weeks",
      "soon", "in the near future", "shortly",
      "within the month", "before end of month"],
  },
  {
    category: "timeframe",
    label: "Specific date",
    patterns: ["on the", "starting", "from the", "beginning of",
      "first of", "date", "schedule", "by the"],
  },

  // ── Pricing tier ──────────────────────────────────────
  {
    category: "pricingTier",
    label: "Hourly",
    patterns: ["hourly", "by the hour", "per hour", "a few hours",
      "half day", "half-day", "couple hours"],
  },
  {
    category: "pricingTier",
    label: "Daily",
    patterns: ["daily", "day rate", "per day", "by the day",
      "full day", "day pass", "day office"],
  },
  {
    category: "pricingTier",
    label: "Monthly",
    patterns: ["monthly", "month to month", "month-to-month",
      "per month", "monthly pricing", "monthly rate",
      "monthly cost", "monthly fee", "ongoing",
      "long term", "long-term", "lease", "permanent"],
  },
  {
    category: "pricingTier",
    label: "Short term",
    patterns: ["short term", "short-term", "temporary",
      "a few months", "couple months", "3 months",
      "three months", "6 months", "six months"],
  },
  {
    category: "pricingTier",
    label: "General pricing inquiry",
    patterns: ["pricing", "price", "cost", "rate", "rates",
      "how much", "fee", "fees", "budget", "spend",
      "spending", "set up fee", "setup fee",
      "what does it run", "what's the cost", "starting up"],
  },

  // ── Locations ─────────────────────────────────────────
  {
    category: "location",
    label: "New York",
    patterns: ["new york", "new york city", "nyc", "ny"],
  },
  {
    category: "location",
    label: "Manhattan",
    patterns: ["manhattan"],
  },
  {
    category: "location",
    label: "Flatiron",
    patterns: ["flatiron", "flat iron", "23rd street", "23rd",
      "116 w 23rd", "w 23rd"],
  },
  {
    category: "location",
    label: "Bryant Park",
    patterns: ["bryant park", "42nd street", "midtown"],
  },
  {
    category: "location",
    label: "Penn Station",
    patterns: ["penn station", "penn", "34th street",
      "462 seventh ave", "seventh ave", "35th street",
      "seventh avenue", "7th ave", "7th avenue"],
  },
  {
    category: "location",
    label: "Garment District",
    patterns: ["garment district", "garment", "fashion district"],
  },
  {
    category: "location",
    label: "Grand Central",
    patterns: ["grand central", "park avenue", "madison avenue",
      "madison ave", "east side"],
  },
  {
    category: "location",
    label: "Upper West Side",
    patterns: ["67th", "columbus", "upper west side", "uws",
      "upper west", "broadway and"],
  },
  {
    category: "location",
    label: "Times Square",
    patterns: ["times square", "47th", "48th", "49th"],
  },
  {
    category: "location",
    label: "New Jersey",
    patterns: ["new jersey", "nj", "jersey"],
  },
  {
    category: "location",
    label: "Jersey City",
    patterns: ["jersey city", "hoboken", "exchange place"],
  },
  {
    category: "location",
    label: "Denver",
    patterns: ["denver", "colorado", "co "],
  },

  // ── Amenities ─────────────────────────────────────────
  {
    category: "amenity",
    label: "High speed internet",
    patterns: ["high speed internet", "high-speed internet",
      "internet access", "wifi", "wi-fi", "wireless",
      "broadband", "vpn", "ethernet", "wired internet"],
  },
  {
    category: "amenity",
    label: "Printing",
    patterns: ["printing", "printer", "copier", "copy machine",
      "print access", "scanner"],
  },
  {
    category: "amenity",
    label: "Phone / Landline",
    patterns: ["landline", "landline phone", "phone line",
      "phone number", "phone booth", "dedicated phone",
      "telephone", "desk phone"],
  },
  {
    category: "amenity",
    label: "Mail and package handling",
    patterns: ["mail", "package", "mail handling",
      "package handling", "mail service", "packages",
      "professional business address", "business address",
      "mailing address"],
  },
  {
    category: "amenity",
    label: "Reception",
    patterns: ["reception", "receptionist", "front desk",
      "concierge", "greeter", "welcoming"],
  },
  {
    category: "amenity",
    label: "Housekeeping",
    patterns: ["housekeeping", "cleaning", "janitorial",
      "cleaned", "maintained", "tidied"],
  },
  {
    category: "amenity",
    label: "Shared kitchen",
    patterns: ["kitchen", "shared kitchen", "kitchenette",
      "break room", "coffee", "tea", "refreshments",
      "coffee and tea", "beverages"],
  },
  {
    category: "amenity",
    label: "Common area",
    patterns: ["common area", "common areas", "lounge",
      "shared space", "communal area", "breakout area",
      "common spaces"],
  },
  {
    category: "amenity",
    label: "Conference rooms",
    patterns: ["conference room", "meeting room", "boardroom",
      "conference facilities", "meeting facilities"],
  },
  {
    category: "amenity",
    label: "Storage",
    patterns: ["storage", "file storage", "storage space",
      "excess files", "document storage", "locker",
      "filing cabinet"],
  },
  {
    category: "amenity",
    label: "Dedicated computers / servers",
    patterns: ["computer", "computers", "server", "servers",
      "dedicated computer", "workstation", "equipment",
      "hardware"],
  },
  {
    category: "amenity",
    label: "Shredder / disposal",
    patterns: ["shredder", "shredding", "garbage disposal",
      "secure disposal", "document shredding"],
  },
  {
    category: "amenity",
    label: "Standard amenities",
    patterns: ["standard amenities", "standard features",
      "usual amenities", "typical amenities",
      "basic amenities", "included amenities"],
  },

  // ── Compliance / Security ─────────────────────────────
  {
    category: "compliance",
    label: "FINRA / Broker Dealer",
    patterns: ["finra", "broker dealer", "broker-dealer",
      "broker", "dealer", "bd license", "sipc",
      "sec registration", "registered investment"],
  },
  {
    category: "compliance",
    label: "Segregated space",
    patterns: ["segregated", "segregated space", "separate space",
      "isolated space", "dedicated space", "exclusive use",
      "no shared", "not shared"],
  },
  {
    category: "compliance",
    label: "Secure access",
    patterns: ["key card", "keycard", "key fob", "secure access",
      "access control", "separate entrance", "private entrance",
      "separate door", "dedicated entrance", "secure door"],
  },
  {
    category: "compliance",
    label: "Sub-lease arrangement",
    patterns: ["sub lease", "sublease", "sub-lease",
      "sub leasing", "subleasing", "within a larger",
      "larger building", "within larger office"],
  },
  {
    category: "compliance",
    label: "Legal / Regulated industry",
    patterns: ["legal", "law firm", "attorney", "lawyer",
      "regulated", "compliance", "license", "licensed",
      "regulatory", "legal entity", "llc", "corporation",
      "financial services", "hedge fund", "fund manager"],
  },

  // ── Tour / Visit ──────────────────────────────────────
  {
    category: "tourRequest",
    label: "Tour requested",
    patterns: ["tour", "come by", "visit", "stop by",
      "see the space", "view the space", "walk through",
      "walkthrough", "test drive", "check it out",
      "look around", "show me", "can i see",
      "schedule a tour", "book a tour"],
  },

  // ── Call / Communication ──────────────────────────────
  {
    category: "callRequest",
    label: "Wants a call",
    patterns: ["call", "phone call", "zoom", "zoom call",
      "video call", "speak", "chat", "phone number",
      "ring", "dial", "talk", "arrange a call",
      "schedule a call", "get on a call", "connect"],
  },

  // ── Availability ──────────────────────────────────────
  {
    category: "availability",
    label: "Checking availability",
    patterns: ["availability", "available", "open",
      "coming up", "any openings", "any spaces open",
      "what do you have", "what's available",
      "anything available", "do you have"],
  },
  {
    category: "availability",
    label: "Short term availability",
    patterns: ["short term", "temporary", "few months",
      "trial", "try it out", "test it out"],
  },
  {
    category: "availability",
    label: "Long term availability",
    patterns: ["long term", "permanent", "ongoing",
      "indefinitely", "stay for a while"],
  },

  // ── Industry hints ────────────────────────────────────
  {
    category: "industry",
    label: "Finance / Legal",
    patterns: ["legal", "law", "finance", "financial",
      "investment", "trading", "hedge fund", "private equity",
      "accounting", "tax", "audit"],
  },
  {
    category: "industry",
    label: "Tech / Startup",
    patterns: ["startup", "start-up", "tech", "technology",
      "software", "app", "saas", "developer", "engineers",
      "product team", "remote team"],
  },
  {
    category: "industry",
    label: "Creative",
    patterns: ["creative", "design", "agency", "marketing",
      "media", "production", "studio", "content"],
  },
];

// ─────────────────────────────────────────────────────────
// SIGNAL SCANNER
// Runs the email text against every entry in SIGNAL_MAP.
// Returns a structured object of everything detected.
// ─────────────────────────────────────────────────────────

export function scanSignals(emailText) {
  const lower = emailText.toLowerCase();
  const detected = {};

  for (const signal of SIGNAL_MAP) {
    const matched = signal.patterns.some((p) => lower.includes(p.toLowerCase()));
    if (matched) {
      if (!detected[signal.category]) {
        detected[signal.category] = [];
      }
      // Avoid duplicate labels in the same category
      if (!detected[signal.category].includes(signal.label)) {
        detected[signal.category].push(signal.label);
      }
    }
  }

  // ── Written-out team size fallback ──────────────────────
  // Catches generic "team" mentions without a specific number
  if (!detected.capacity && /\bteam\b/i.test(lower)) {
    detected.capacity = ["Team (size unspecified)"];
  }

  return detected;
}

// ─────────────────────────────────────────────────────────
// OFF-TOPIC GUARDRAIL
// Returns false if the email has zero relevant signals.
// ─────────────────────────────────────────────────────────

export function isRelevantInquiry(emailText) {
  const signals = scanSignals(emailText);
  // Must match at least one signal in any category
  return Object.keys(signals).length > 0;
}

// ─────────────────────────────────────────────────────────
// SPACE SCORING
// Ranks spaces by how well they match the detected signals.
// Always returns ALL spaces but sorted best-match first.
// Even a space that only partially matches gets included
// so the AI can mention it as an alternative.
// ─────────────────────────────────────────────────────────

function scoreSpace(space, signals) {
  let score = 0;
  const spaceLower = [
    space.name,
    space.type,
    space.description,
    space.amenities,
    space.address,
    space.floor,
  ].join(" ").toLowerCase();

  // ── Space type match (highest weight) ─────────────────
  if (signals.spaceType) {
    for (const type of signals.spaceType) {
      if (spaceLower.includes(type.toLowerCase())) score += 10;
    }
  }

  // ── Capacity match ────────────────────────────────────
  if (signals.capacity && space.capacity) {
    for (const cap of signals.capacity) {
      // Extract numbers from capacity label e.g. "4 people" → 4
      const nums = cap.match(/\d+/g);
      if (nums) {
        const requested = Math.max(...nums.map(Number));
        // Score based on how close the space capacity is
        if (space.capacity >= requested && space.capacity <= requested + 2) {
          score += 8; // perfect or just slightly bigger
        } else if (space.capacity >= requested) {
          score += 4; // fits but bigger than needed
        } else {
          score -= 2; // too small (but still show it)
        }
      }
    }
  }

  // ── Amenity match ─────────────────────────────────────
  if (signals.amenity) {
    for (const amenity of signals.amenity) {
      const amenityLower = amenity.toLowerCase();
      if (spaceLower.includes(amenityLower)) score += 3;
      // Partial word match (e.g. "printing" matches "printer")
      const firstWord = amenityLower.split(" ")[0];
      if (firstWord.length > 4 && spaceLower.includes(firstWord)) score += 1;
    }
  }

  // ── Location match ────────────────────────────────────
  if (signals.location) {
    for (const loc of signals.location) {
      if (spaceLower.includes(loc.toLowerCase())) score += 6;
    }
  }

  // ── Compliance match ──────────────────────────────────
  if (signals.compliance) {
    // Compliance clients need private offices
    if (space.type === "Private Office") score += 5;
    for (const comp of signals.compliance) {
      if (spaceLower.includes(comp.toLowerCase())) score += 3;
    }
  }

  // ── Pricing tier match ────────────────────────────────
  if (signals.pricingTier) {
    for (const tier of signals.pricingTier) {
      if (tier === "Hourly"   && space.hourly_rate)  score += 2;
      if (tier === "Daily"    && space.daily_rate)   score += 2;
      if (tier === "Monthly"  && space.monthly_rate) score += 2;
    }
  }

  return score;
}

// ─────────────────────────────────────────────────────────
// DATABASE QUERIES (all include space_images join)
// ─────────────────────────────────────────────────────────

const SPACE_SELECT = `
  *,
  space_images (
    url,
    caption,
    sort_order
  )
`;

export async function getAllSpaces() {
  const { data, error } = await supabase
    .from("office_spaces")
    .select(SPACE_SELECT)
    .order("type");
  if (error) { console.error("getAllSpaces:", error.message); return []; }
  return data;
}

export async function findSpacesByType(type) {
  const { data, error } = await supabase
    .from("office_spaces")
    .select(SPACE_SELECT)
    .ilike("type", `%${type}%`);
  if (error) { console.error("findSpacesByType:", error.message); return []; }
  return data;
}

export async function findSpacesByLocation(location) {
  const { data, error } = await supabase
    .from("office_spaces")
    .select(SPACE_SELECT)
    .ilike("address", `%${location}%`);
  if (error) { console.error("findSpacesByLocation:", error.message); return []; }
  return data;
}

// ─────────────────────────────────────────────────────────
// MAIN ANALYSIS FUNCTION
// ─────────────────────────────────────────────────────────

export async function analyzeInquiry(emailText) {

  // 1. Scan for all signals
  const signals = scanSignals(emailText);

  console.log("[Signals detected]", JSON.stringify(signals, null, 2));

  // 2. Pull spaces from DB
  // Always fetch all spaces so we can score and rank them.
  // If compliance is detected, bias toward private offices
  // but still include others as alternatives.
  let spaces = await getAllSpaces();

  // 3. Score and rank every space
  const scoredSpaces = spaces
    .map((space) => ({
      ...space,
      _score: scoreSpace(space, signals),
    }))
    .sort((a, b) => b._score - a._score);

  // 4. Split into best matches and alternatives
  const topScore   = scoredSpaces[0]?._score ?? 0;
  const threshold  = Math.max(topScore * 0.5, 1); // anything above 50% of best score

  const bestMatches    = scoredSpaces.filter((s) => s._score >= threshold);
  const alternatives   = scoredSpaces.filter((s) => s._score < threshold);

  // 5. Build convenience flags for the AI prompt
  const isUrgent          = !!signals.timeframe?.some((t) =>
    ["Immediate"].includes(t));
  const wantsTour         = !!signals.tourRequest?.length;
  const wantsCall         = !!signals.callRequest?.length;
  const hasComplianceNeeds = !!signals.compliance?.length;

  // 6. Detect preferred tour time from email text
  let tourTime = null;
  if (wantsTour) {
    const tourTimePatterns = [
      /after\s+(\d+\s*(?:am|pm)?)/i,
      /(\d+\s*(?:am|pm))\s*[-–]\s*(\d+\s*(?:am|pm))/i,
      /(morning|afternoon|evening|weekday|weekend)/i,
    ];
    for (const p of tourTimePatterns) {
      const m = emailText.match(p);
      if (m) { tourTime = m[0]; break; }
    }
  }

  return {
    signals,              // full map of everything detected
    bestMatches,          // spaces most likely to fit
    alternatives,         // spaces that partially match
    allSpaces: scoredSpaces, // everything ranked
    isUrgent,
    wantsTour,
    tourTime,
    wantsCall,
    hasComplianceNeeds,
    // Convenience accessors
    spaceTypes:    signals.spaceType   || [],
    capacities:    signals.capacity    || [],
    locations:     signals.location    || [],
    amenities:     signals.amenity     || [],
    pricingTiers:  signals.pricingTier || [],
    timeframes:    signals.timeframe   || [],
    compliance:    signals.compliance  || [],
    industry:      signals.industry    || [],
    availability:  signals.availability || [],
  };
}