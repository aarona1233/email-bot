// instrumentation.js
// ─────────────────────────────────────────────────────────
// Runs once automatically when the Next.js server starts.
// Must live at the PROJECT ROOT (same level as package.json).
//
// Supports both IMAP and JMAP — set INBOX_PROTOCOL in .env.local
// to choose which one runs. Same switch used by the fetch route.
//
// IMPORTANT: register() is awaited by Next.js before the server
// starts accepting requests. We must NOT await the fetch itself
// here — only kick it off in the background — or a slow mailbox
// will hang the entire app from ever becoming reachable.
// ─────────────────────────────────────────────────────────

let isFetching = false; // guards against overlapping mail fetches
let isScanning = false; // guards against overlapping follow-up scans

async function runFetch(label) {
  if (isFetching) {
    console.log(`[${label}] Skipped — a fetch is already running.`);
    return;
  }
  isFetching = true;
  try {
    const protocol = process.env.INBOX_PROTOCOL || "imap";
    let summary;

    if (protocol === "jmap") {
      const { fetchInboxOverJmap } = await import("./src/lib/jmap-fetch.js");
      summary = await fetchInboxOverJmap({ limit: 25, markSeen: true });
    } else {
      const { fetchInboxOverImap } = await import("./src/lib/imap-fetch.js");
      summary = await fetchInboxOverImap({ limit: 25, markSeen: true });
    }

    console.log(`[${label}] (${protocol}) Fetch complete:`, summary);
  } catch (err) {
    console.error(`[${label}] Fetch failed:`, err.message);
  } finally {
    isFetching = false;
  }
}

// ── Follow-up scan ────────────────────────────────────────
// Checked on a short fixed tick (15 min), but runFollowUpScan
// internally decides whether it's actually DUE based on the
// scan_interval_hours setting, the enabled toggle, and the
// paused_until date — so this ticking often, itself, costs
// nothing when nothing is due.
async function runScan(label) {
  if (isScanning) {
    console.log(`[${label}] Skipped — a follow-up scan is already running.`);
    return;
  }
  isScanning = true;
  try {
    const { runFollowUpScan } = await import("./src/lib/followup.js");
    const summary = await runFollowUpScan({ force: false });
    if (summary.ran) {
      console.log(`[${label}] Follow-up scan complete:`, summary);
    }
    // when summary.ran is false it's just "not due yet" or "disabled" —
    // not worth logging every 15 minutes
  } catch (err) {
    console.error(`[${label}] Follow-up scan failed:`, err.message);
  } finally {
    isScanning = false;
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  console.log("═".repeat(50));
  console.log("[Startup] Server starting…");

  runFetch("Startup").catch(() => {});

  console.log("[Startup] Initial fetch kicked off in background — app is ready.");
  console.log("═".repeat(50));

  const pollMs = Number(process.env.IMAP_POLL_INTERVAL_MS || 120000);

  if (pollMs > 0) {
    console.log(`[Startup] Background mail polling every ${pollMs / 1000}s`);
    setInterval(() => {
      runFetch("Poll").catch(() => {});
    }, pollMs);
  } else {
    console.log("[Startup] Background mail polling disabled (IMAP_POLL_INTERVAL_MS=0)");
  }

  // Follow-up scan ticks every 15 minutes. Whether it actually
  // DOES anything on a given tick is entirely controlled by the
  // settings in the database (enabled, scan_interval_hours,
  // paused_until) — adjust those from the Settings page, not here.
  const followUpTickMs = 15 * 60 * 1000;
  console.log(`[Startup] Follow-up scan ticking every ${followUpTickMs / 60000}min (actual frequency controlled by Settings)`);
  setInterval(() => {
    runScan("FollowUp Tick").catch(() => {});
  }, followUpTickMs);

  // Also run one check shortly after startup, in the background
  runScan("FollowUp Startup").catch(() => {});
}
