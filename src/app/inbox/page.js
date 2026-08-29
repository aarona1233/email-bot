"use client";
// src/app/inbox/page.js
// ─────────────────────────────────────────────────────────
// Triage queue. Shows every pending email as a card.
// Click a card → read the full email → Approve or Reject.
//
// Approve  = valid inquiry. Labels it, then generates a draft
//            reply and sends you to /review.
// Reject   = spam / off-topic. Labels it with a reason.
//
// Every decision writes a training example to screening_feedback.
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { colors, glass, pageBackground, type, ensureMotionStyles } from "@/lib/theme";

const REJECT_REASONS = [
  "Spam / promotional",
  "Not about office space",
  "Vendor or sales pitch",
  "Job application",
  "Automated / no-reply",
  "Other",
];

const STATUS_TABS = [
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all",      label: "All"      },
];

// What the local LLM classifier decided — display label + color
// per category. "spam" deliberately reuses the same red as the
// heuristic's "likely spam" so the two signals read consistently.
function categoryLabel(category) {
  switch (category) {
    case "customer_inquiry": return "customer";
    case "vendor_pitch":     return "vendor pitch";
    case "spam":             return "spam";
    case "uncertain":        return "uncertain";
    default:                 return category;
  }
}

function categoryBadgeStyle(category) {
  switch (category) {
    case "customer_inquiry": return { background: "#dbeafe", color: "#1d4ed8" };
    case "vendor_pitch":     return { background: "#fef3c7", color: "#92400e" };
    case "spam":             return { background: "#fee2e2", color: "#dc2626" };
    case "uncertain":        return { background: "#f1f5f9", color: "#64748b" };
    default:                 return { background: "#f1f5f9", color: "#64748b" };
  }
}

export default function InboxPage() {
  const router = useRouter();

  const [tab,      setTab]      = useState("pending");
  const [emails,   setEmails]   = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [selected, setSelected] = useState(null);   // the open email
  const [loading,  setLoading]  = useState(true);
  const [busy,     setBusy]     = useState(false);
  const [profile,  setProfile]  = useState(null);
  const [correctionNote, setCorrectionNote] = useState("");
  const [savingNote,     setSavingNote]     = useState(false);
  const [noteNotice,     setNoteNotice]     = useState("");
  const [error,    setError]    = useState("");
  const [classifying, setClassifying] = useState(false);

  // Reject modal state
  const [rejecting,    setRejecting]    = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);

  // ── DEBUG: on-screen log so we can see failures over IP ──
  const [debugLog, setDebugLog] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const log = useCallback((msg) => {
    const line = `${new Date().toLocaleTimeString()} — ${msg}`;
    console.log("[INBOX DEBUG]", line);
    setDebugLog((prev) => [...prev, line]);
  }, []);

  const loadEmails = useCallback(async () => {
    setLoading(true);
    setError("");
    const url = `/api/inbox/list?status=${tab}`;
    log(`Fetch START → ${url}`);
    log(`Page origin: ${typeof window !== "undefined" ? window.location.origin : "unknown"}`);

    // Timeout guard so a hang shows an error instead of spinning forever
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      log("Fetch TIMED OUT after 10s — aborting");
      controller.abort();
    }, 10000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      log(`Fetch responded: HTTP ${res.status} ${res.statusText}`);
      log(`Content-Type: ${res.headers.get("content-type")}`);

      const raw = await res.text();
      log(`Raw body length: ${raw.length} chars`);
      log(`Raw body preview: ${raw.slice(0, 120)}`);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        log(`JSON PARSE FAILED: ${parseErr.message}`);
        throw new Error(`Response was not JSON. Got: ${raw.slice(0, 80)}`);
      }

      if (!res.ok) throw new Error(data.error || "Failed to load");

      log(`Parsed OK. Emails: ${data.emails?.length ?? 0}, accuracy: ${data.accuracy?.total ?? 0} reviewed`);
      setEmails(data.emails);
      setAccuracy(data.accuracy);
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        log("Request aborted (timeout). Likely cross-origin block or network issue.");
        setError("Request timed out. Check the debug panel below.");
      } else {
        log(`ERROR: ${err.name}: ${err.message}`);
        setError(err.message);
      }
    } finally {
      setLoading(false);
      log("Fetch DONE (loading set false)");
    }
  }, [tab, log]);

  useEffect(() => { loadEmails(); }, [loadEmails]);
  useEffect(() => { ensureMotionStyles(); }, []);

  // Admin-only debug panel needs to know the current user's role
  useEffect(() => {
    fetch("/api/profile/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setProfile(data.profile))
      .catch(() => {});
  }, []);

  // Classify pending mail automatically the moment the page loads,
  // instead of requiring a manual click every time — handleClassifyPending
  // already only touches rows with category IS NULL, so this is cheap
  // to re-run on every visit; there's simply nothing to do once caught up.
  useEffect(() => { handleClassifyPending(); }, []);

  async function handleSaveCorrectionNote() {
    setSavingNote(true);
    setNoteNotice("");
    try {
      const res  = await fetch(`/api/inbox/${selected.id}/correction-note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: correctionNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");
      setSelected(data.email);
      setNoteNotice("Saved — this will inform future classifications.");
      await loadEmails();
    } catch (err) {
      setNoteNotice(`Error: ${err.message}`);
    } finally {
      setSavingNote(false);
    }
  }

  async function handleClassifyPending() {
    setClassifying(true);
    setError("");
    try {
      const res  = await fetch("/api/inbox/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 25 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Classification failed");
      await loadEmails();
    } catch (err) {
      setError(err.message);
    } finally {
      setClassifying(false);
    }
  }

  // ── Approve: label it, generate a draft, go to review ──
  async function handleApprove(email) {
    setBusy(true);
    setError("");
    try {
      // 1. Record the human verdict (writes training row)
      const reviewRes = await fetch("/api/inbox/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: email.id, isValid: true }),
      });
      if (!reviewRes.ok) {
        const d = await reviewRes.json();
        throw new Error(d.error || "Review failed");
      }

      // 2. Hand off to the existing reply bot
      const genRes = await fetch("/api/generate-office-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail: email.body, signature: "" }),
      });
      const genData = await genRes.json();

      if (!genRes.ok) {
        if (genData.error === "off_topic") {
          throw new Error(
            "Approved, but the reply bot flagged this as off-topic. " +
            "You may want to reject it instead."
          );
        }
        throw new Error(genData.error || "Draft generation failed");
      }

      // 3. Prime the review page exactly like the manual flow does
      sessionStorage.setItem("office_draft",     genData.draft);
      sessionStorage.setItem("office_spaces",    JSON.stringify(genData.spaces));
      sessionStorage.setItem("office_analysis",  JSON.stringify(genData.analysis));
      sessionStorage.setItem("office_address",   email.from_address);
      sessionStorage.setItem("office_original",  email.body);
      sessionStorage.setItem("office_signature", "");
      sessionStorage.setItem("office_inbox_id",  String(email.id));

      router.push("/review");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  // ── Reject: label it as spam with a reason ─────────────
  async function handleReject(email) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/inbox/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: email.id,
          isValid: false,
          rejectReason,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Reject failed");
      }
      setRejecting(false);
      setSelected(null);
      await loadEmails();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", ...pageBackground }}>
      <Sidebar active="inbox" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
      <div style={styles.container}>

        {profile?.role === "admin" && (
          <>
            <button
              onClick={() => setShowDebug((v) => !v)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#8b9198",
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              {showDebug ? "Hide" : "Show"} debug panel
            </button>

            {showDebug && (
              <div style={{
                background: "#16191c",
                border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "14px 16px",
            marginBottom: "20px",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#9aa0a6",
            maxHeight: "220px",
            overflowY: "auto",
          }}>
            <div style={{ color: colors.accent, fontWeight: "bold", marginBottom: "8px" }}>
              DEBUG — loading: {String(loading)} | emails: {emails.length} | error: {error || "none"}
            </div>
            {debugLog.length === 0
              ? <div style={{ color: "#5a6067" }}>Waiting for first fetch…</div>
              : debugLog.map((line, i) => (
                  <div key={i} style={{ marginBottom: "2px" }}>{line}</div>
                ))
            }
            <button
              onClick={loadEmails}
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                background: "#1c1f22",
                color: "#e8eaed",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Retry fetch
            </button>
          </div>
        )}
          </>
        )}

        {/* One unified glass surface for title + stats + tabs —
            Apple's own guidance treats a title and any controls
            pinned directly beneath it as a single "hard style"
            glass block, not separate floating pieces. */}
        <div style={styles.pageHeaderBlock}>
          <div style={styles.header}>
            <div>
              <h1 style={type.pageTitle}>Inbox Triage</h1>
              <p style={type.pageSubtitle}>
                Review incoming inquiries. Every decision trains the future screening AI.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleClassifyPending} disabled={classifying} style={styles.secondaryBtn}>
                {classifying ? "Classifying…" : "Classify Pending"}
              </button>
              <button onClick={() => router.push("/manual")} style={styles.secondaryBtn}>
                Manual Reply →
              </button>
            </div>
          </div>

          {/* Heuristic scoreboard */}
          {accuracy && accuracy.total > 0 && (
            <div style={styles.statsBar}>
              <div style={styles.stat}>
                <span style={type.statNumber}>{accuracy.total}</span>
                <span style={type.statLabel}>Reviewed</span>
              </div>
              <div style={styles.stat}>
                <span style={type.statNumber}>{accuracy.accuracy}%</span>
                <span style={type.statLabel}>Keyword scanner accuracy</span>
              </div>
              <div style={styles.stat}>
                <span style={{ ...type.statNumber, color: "#f87171" }}>
                  {accuracy.falsePositives}
                </span>
                <span style={type.statLabel}>Spam it would let through</span>
              </div>
              <div style={styles.stat}>
                <span style={{ ...type.statNumber, color: "#fbbf24" }}>
                  {accuracy.falseNegatives}
                </span>
                <span style={type.statLabel}>Real leads it would drop</span>
              </div>
              <a href="/api/inbox/training-export" style={styles.exportBtn}>
                ⬇ Export training data
              </a>
            </div>
          )}

          {/* Tabs — capsule shaped, per the shape system's rule
              that primary controls use capsules, not rounded rects */}
          <div style={styles.tabs}>
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSelected(null); }}
                style={tab === t.key ? { ...styles.tab, ...styles.tabActive } : styles.tab}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Email grid */}
        {loading ? (
          <p style={styles.muted}>Loading…</p>
        ) : emails.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}></p>
            <p style={styles.muted}>No {tab} emails.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => {
                  setSelected(email);
                  setRejecting(false);
                  setCorrectionNote(email.classifier_correction_note || "");
                  setNoteNotice("");
                }}
                style={styles.card}
              >
                <div style={styles.cardTop}>
                  <strong style={styles.cardFrom}>
                    {email.from_name || email.from_address}
                  </strong>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {/* Classifier category is the one signal shown on cards —
                        it's strictly more capable than the keyword scanner
                        (it understands direction: vendor pitch vs customer,
                        not just present/absent keywords). The scanner's raw
                        guess still exists and still matters, but for
                        comparison purposes, not as a second card-level
                        verdict — see the modal, and the accuracy scoreboard
                        at the top of this page. */}
                    {email.category ? (
                      <span style={{ ...styles.guessBadge, ...categoryBadgeStyle(email.category) }}>
                        {categoryLabel(email.category)}
                      </span>
                    ) : (
                      <span style={{ ...styles.guessBadge, background: "#f1f5f9", color: "#64748b" }}>
                        not yet classified
                      </span>
                    )}
                  </div>
                </div>

                <p style={styles.cardSubject}>{email.subject}</p>
                <p style={styles.cardPreview}>
                  {(email.body || "").slice(0, 280)}
                  {(email.body || "").length > 140 ? "…" : ""}
                </p>

                <div style={styles.cardFoot}>
                  <span style={styles.cardDate}>
                    {new Date(email.received_at).toLocaleString()}
                  </span>
                  {email.status !== "pending" && (
                    <span
                      style={{
                        ...styles.statusBadge,
                        background: email.is_valid ? "#dcfce7" : "#fee2e2",
                        color:      email.is_valid ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {email.status}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail modal ─────────────────────────────────── */}
      {selected && (
        <div className="materialize-backdrop" style={styles.overlay} onClick={() => !busy && setSelected(null)}>
          <div className="materialize-in chromatic-edge" style={styles.modal} onClick={(e) => e.stopPropagation()}>

            <button
              onClick={() => setSelected(null)}
              style={styles.closeBtn}
              disabled={busy}
            >
              ✕
            </button>

            <p style={styles.modalLabel}>From</p>
            <p style={styles.modalValue}>
              {selected.from_name
                ? `${selected.from_name} <${selected.from_address}>`
                : selected.from_address}
            </p>

            <p style={styles.modalLabel}>Subject</p>
            <p style={styles.modalValue}>{selected.subject}</p>

            <p style={styles.modalLabel}>Body</p>
            <div style={styles.modalBody}>{selected.body}</div>

            {/* What the local LLM classifier decided, and why */}
            {selected.category && (
              <>
                <p style={styles.modalLabel}>Classifier verdict</p>
                <div style={styles.signalRow}>
                  <span style={{ ...styles.signalBadge, ...categoryBadgeStyle(selected.category) }}>
                    {categoryLabel(selected.category)}
                    {selected.category_confidence ? ` · ${selected.category_confidence} confidence` : ""}
                  </span>
                </div>
                {selected.category_reasoning && (
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", fontStyle: "italic" }}>
                    "{selected.category_reasoning}"
                  </p>
                )}

                {/* Keyword scanner's guess — shown here as a comparison
                    point, not a second verdict. It's dumb pattern-matching,
                    computed before any AI or human ever looked at this
                    email, kept around specifically to judge whether it's
                    still worth having (see the accuracy scoreboard at the
                    top of the page) — not as competing advice. */}
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>Keyword scanner alone would have guessed:</span>
                  <span
                    style={{
                      fontSize: "10.5px", fontWeight: "600", padding: "2px 8px", borderRadius: "999px",
                      background: selected.heuristic_prediction ? "#f0fdf4" : "#fef2f2",
                      color:      selected.heuristic_prediction ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {selected.heuristic_prediction ? "likely valid" : "likely spam"}
                  </span>
                </div>

                {/* Point out flaws in the classifier's actual reasoning —
                    not just the verdict. This gets shown to the LLM
                    verbatim on future classifications as an explicit
                    correction, not reduced to a bare category label. */}
                <p style={{ ...styles.modalLabel, marginTop: "14px" }}>
                  What did it get wrong about its reasoning? (optional)
                </p>
                <textarea
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder={`e.g. "Even a two-word message asking for space is a real inquiry — don't default to uncertain just because it's short."`}
                  rows={3}
                  style={styles.correctionTextarea}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                  <button
                    onClick={handleSaveCorrectionNote}
                    disabled={savingNote}
                    style={styles.saveNoteBtn}
                  >
                    {savingNote ? "Saving…" : "Save note"}
                  </button>
                  {noteNotice && <span style={{ fontSize: "11.5px", color: "#16a34a" }}>{noteNotice}</span>}
                </div>
              </>
            )}

            {/* Signals the keyword scanner picked up */}
            {selected.heuristic_signals &&
              Object.keys(selected.heuristic_signals).length > 0 && (
                <>
                  <p style={styles.modalLabel}>Signals detected</p>
                  <div style={styles.signalRow}>
                    {Object.entries(selected.heuristic_signals).flatMap(
                      ([category, labels]) =>
                        labels.map((l) => (
                          <span key={`${category}-${l}`} style={styles.signalBadge}>
                            {l}
                          </span>
                        ))
                    )}
                  </div>
                </>
              )}

            {selected.status !== "pending" ? (
              <div style={styles.reviewedNote}>
                Already reviewed — marked{" "}
                <strong>{selected.is_valid ? "valid" : "invalid"}</strong>
                {selected.reject_reason ? ` (${selected.reject_reason})` : ""}.
              </div>
            ) : rejecting ? (
              <>
                <p style={styles.modalLabel}>Why is this not a valid inquiry?</p>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={styles.select}
                >
                  {REJECT_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div style={styles.actions}>
                  <button
                    onClick={() => setRejecting(false)}
                    style={styles.secondaryBtn}
                    disabled={busy}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleReject(selected)}
                    style={styles.rejectBtn}
                    disabled={busy}
                  >
                    {busy ? "Saving…" : "Confirm Reject"}
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.actions}>
                <button
                  onClick={() => setRejecting(true)}
                  style={styles.rejectBtn}
                  disabled={busy}
                >
                  ✕ Reject
                </button>
                <button
                  onClick={() => handleApprove(selected)}
                  style={styles.approveBtn}
                  disabled={busy}
                >
                  {busy ? "Generating draft…" : "✓ Approve & Draft Reply"}
                </button>
              </div>
            )}

            {error && <p style={styles.error}>{error}</p>}
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: { maxWidth: "1100px", margin: "0 auto" },

  pageHeaderBlock: {
    ...glass.pageHeader,
    padding: "24px 26px 18px",
    marginBottom: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
  },

  statsBar: {
    display: "flex",
    gap: "28px",
    alignItems: "center",
    borderTop: `1px solid ${colors.glassBorder}`,
    paddingTop: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  stat:      { display: "flex", flexDirection: "column" },
  exportBtn: {
    marginLeft: "auto",
    fontSize: "12.5px",
    color: colors.textPrimary,
    background: "rgba(255,255,255,0.07)",
    border: `1px solid ${colors.glassBorderStrong}`,
    padding: "8px 16px",
    borderRadius: glass.radiusPill,
    textDecoration: "none",
    fontWeight: "600",
  },

  tabs: {
    display: "flex",
    gap: "6px",
    borderTop: `1px solid ${colors.glassBorder}`,
    paddingTop: "14px",
  },
  tab: { ...glass.tab },
  tabActive: { ...glass.tabActive },

  secondaryBtn: {
    ...glass.buttonSecondary,
    padding: "9px 16px",
    fontSize: "13px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px",
    textAlign: "left",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontFamily: "inherit",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
  cardFrom: { fontSize: "14px", color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  guessBadge: {
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "99px",
    whiteSpace: "nowrap",
  },
  cardSubject: { fontSize: "13px", fontWeight: "600", color: "#334155", margin: 0 },
  cardPreview: { fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.5" },
  cardFoot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
  },
  cardDate: { fontSize: "11px", color: "#94a3b8" },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "99px",
    textTransform: "capitalize",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 50,
  },
  modal: {
    background: "#fff",
    borderRadius: "14px",
    padding: "32px",
    maxWidth: "640px",
    width: "100%",
    maxHeight: "85vh",
    overflowY: "auto",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#94a3b8",
  },
  modalLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "16px 0 4px 0",
  },
  correctionTextarea: {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid #cbd5e1", fontSize: "12.5px", fontFamily: "inherit",
    boxSizing: "border-box", resize: "vertical", color: "#1a1a2e",
  },
  saveNoteBtn: {
    padding: "8px 14px", background: "#16a34a", color: "#fff", border: "none",
    borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer",
  },
  modalValue: { fontSize: "14px", color: "#1a1a2e", margin: 0 },
  modalBody: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    maxHeight: "240px",
    overflowY: "auto",
  },
  signalRow: { display: "flex", flexWrap: "wrap", gap: "5px" },
  signalBadge: {
    fontSize: "11px",
    background: "#e0eaff",
    color: "#1e3a5f",
    padding: "2px 8px",
    borderRadius: "99px",
  },

  actions: { display: "flex", gap: "10px", marginTop: "24px" },
  approveBtn: {
    flex: 2,
    padding: "13px",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a",
    border: "1px solid #8f9aa3",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  rejectBtn: {
    flex: 1,
    padding: "13px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  reviewedNote: {
    marginTop: "20px",
    padding: "12px 14px",
    background: "#f1f5f9",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#475569",
  },

  empty:     { textAlign: "center", padding: "60px 0" },
  emptyIcon: { fontSize: "40px", margin: "0 0 8px 0" },
  muted:     { color: "#9aa0a6", fontSize: "14px" },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    marginTop: "12px",
    padding: "10px",
    background: "#fef2f2",
    borderRadius: "6px",
  },
};
