// instrumentation.js
// ─────────────────────────────────────────────────────────
// Runs once automatically when the Next.js server starts.
// Must live at the PROJECT ROOT (same level as package.json).
//
// IMPORTANT: register() is awaited by Next.js before the server
// starts accepting requests. We must NOT await the IMAP fetch
// itself here — only kick it off in the background — or a slow
// mailbox will hang the entire app from ever becoming reachable.
// ─────────────────────────────────────────────────────────

let isFetching = false; // guards against overlapping runs

async function runFetch(label) {
  if (isFetching) {
    console.log(`[${label}] Skipped — a fetch is already running.`);
    return;
  }
  isFetching = true;
  try {
    const { fetchInboxOverImap } = await import("./src/lib/imap-fetch.js");
    const summary = await fetchInboxOverImap({ limit: 25, markSeen: true });
    console.log(`[${label}] Fetch complete:`, summary);
  } catch (err) {
    console.error(`[${label}] Fetch failed:`, err.message);
  } finally {
    isFetching = false;
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  console.log("═".repeat(50));
  console.log("[Startup] Server starting…");

  // Fire the first fetch WITHOUT awaiting it — this lets the
  // server finish starting immediately while the fetch runs
  // in the background. .catch() prevents an unhandled rejection.
  runFetch("Startup").catch(() => {});

  console.log("[Startup] Initial fetch kicked off in background — app is ready.");
  console.log("═".repeat(50));

  // Background polling, also fire-and-forget on each tick
  const pollMs = Number(process.env.IMAP_POLL_INTERVAL_MS || 120000);

  if (pollMs > 0) {
    console.log(`[Startup] Background polling every ${pollMs / 1000}s`);
    setInterval(() => {
      runFetch("Poll").catch(() => {});
    }, pollMs);
  } else {
    console.log("[Startup] Background polling disabled (IMAP_POLL_INTERVAL_MS=0)");
  }
}
