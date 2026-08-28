"use client";
// src/app/sent/page.js
// ─────────────────────────────────────────────────────────
// End-of-day audit log. Every email that actually went out,
// as a card. Click a card to expand it — shows the customer's
// original inquiry, the exact reply that was sent, contact
// info, and any attached photos, so a human can quickly spot
// a hallucination or wrong detail and reach out to fix it.
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { colors, glass, pageBackground, type, ensureMotionStyles } from "@/lib/theme";

// Maps a follow-up status "tone" to a badge color — kept as a
// lookup rather than inline logic so it's easy to scan at a glance.
function followupBadgeStyle(tone) {
  const base = {
    fontSize: "10.5px", fontWeight: "600", padding: "3px 9px",
    borderRadius: "999px", whiteSpace: "nowrap",
  };
  switch (tone) {
    case "due":    return { ...base, background: "#fef3c7", color: "#92400e" }; // due now — worth noticing
    case "action": return { ...base, background: "#dbeafe", color: "#1d4ed8" }; // needs a human click
    case "done":   return { ...base, background: "#dcfce7", color: "#16a34a" }; // already handled
    case "pending":return { ...base, background: "#f1f5f9", color: "#64748b" }; // counting down, nothing to do yet
    default:       return { ...base, background: "#f1f5f9", color: "#94a3b8" }; // disabled / paused / unknown
  }
}

export default function SentPage() {
  const [emails,   setEmails]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");

  // Follow-up-now flow — lives entirely inside the modal
  const [followUpBusy,   setFollowUpBusy]   = useState(false);
  const [followUpResult, setFollowUpResult] = useState(null); // { status, id, subject, body }
  const [followUpError,  setFollowUpError]  = useState("");
  const [timerInput,      setTimerInput]      = useState("");
  const [savingTimer,     setSavingTimer]     = useState(false);
  const [timerNotice,     setTimerNotice]     = useState("");
  const [followUpDraft,  setFollowUpDraft]  = useState("");
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

  const loadSent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/sent/list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setEmails(data.emails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSent(); }, [loadSent]);
  useEffect(() => { ensureMotionStyles(); }, []);

  const filtered = emails.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.customer_address?.toLowerCase().includes(q) ||
      e.customer_name?.toLowerCase().includes(q) ||
      e.sent_subject?.toLowerCase().includes(q) ||
      e.sent_body?.toLowerCase().includes(q)
    );
  });

  async function handleSaveTimer(clear = false) {
    setSavingTimer(true);
    setTimerNotice("");
    try {
      const waitDaysOverride = clear ? null : Number(timerInput);
      if (!clear && (!Number.isFinite(waitDaysOverride) || waitDaysOverride < 0)) {
        throw new Error("Enter a whole number of days, 0 or more.");
      }

      const res  = await fetch(`/api/sent/${selected.id}/followup-timer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waitDaysOverride }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save timer");

      setSelected(data.email);
      setTimerInput(data.email.followup_wait_days_override != null ? String(data.email.followup_wait_days_override) : "");
      setTimerNotice(clear ? "Reset to the global default." : "Custom timer saved.");
      await loadSent();
    } catch (err) {
      setTimerNotice(`Error: ${err.message}`);
    } finally {
      setSavingTimer(false);
    }
  }

  async function handleFollowUpNow(sentEmail) {
    setFollowUpBusy(true);
    setFollowUpError("");
    setFollowUpResult(null);
    try {
      const res  = await fetch("/api/followups/create-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentEmailId: sentEmail.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create follow-up");

      if (data.status === "blocked") {
        setFollowUpError(data.reason);
      } else {
        setFollowUpResult(data);
        setFollowUpDraft(data.body || "");
      }
    } catch (err) {
      setFollowUpError(err.message);
    } finally {
      setFollowUpBusy(false);
    }
  }

  async function handleSendQueuedFollowUp() {
    setSendingFollowUp(true);
    setFollowUpError("");
    try {
      const res = await fetch("/api/followups/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: followUpResult.id, body: followUpDraft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setFollowUpResult((prev) => ({ ...prev, status: "sent" }));
    } catch (err) {
      setFollowUpError(err.message);
    } finally {
      setSendingFollowUp(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", ...pageBackground }}>
      <Sidebar active="sent" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
        <div style={styles.container}>

          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Sent</h1>
              <p style={styles.subtitle}>
                Every email that actually went out — review for accuracy, reach out if something's wrong.
              </p>
            </div>
            <div style={styles.statBadge}>
              <span style={styles.statNumber}>{emails.length}</span>
              <span style={styles.statLabel}>total sent</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search by customer, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />

          {error && <p style={styles.error}>{error}</p>}

          {loading ? (
            <p style={styles.muted}>Loading…</p>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.muted}>
                {emails.length === 0 ? "Nothing sent yet." : "No matches for that search."}
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filtered.map((email) => (
                <button
                  key={email.id}
                  onClick={() => {
                    setSelected(email);
                    setFollowUpResult(null);
                    setFollowUpError("");
                    setFollowUpDraft("");
                    setTimerInput(email.followup_wait_days_override != null ? String(email.followup_wait_days_override) : "");
                    setTimerNotice("");
                  }}
                  style={styles.card}
                >
                  <div style={styles.cardTop}>
                    <strong style={styles.cardName}>
                      {email.customer_name || email.customer_address}
                    </strong>
                    <span style={styles.viaBadge}>{email.sent_via}</span>
                  </div>
                  <span style={styles.cardAddress}>{email.customer_address}</span>
                  <span style={styles.cardSubject}>{email.sent_subject}</span>
                  <p style={styles.cardPreview}>
                    {email.sent_body?.slice(0, 260)}
                    {email.sent_body?.length > 260 ? "…" : ""}
                  </p>
                  <div style={styles.cardFooter}>
                    <span style={styles.cardDate}>
                      {new Date(email.sent_at).toLocaleString()}
                    </span>
                    {email.followup_status && (
                      <span style={followupBadgeStyle(email.followup_status.tone)}>
                        {email.followup_status.label}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Expanded detail modal ─────────────────────────── */}
        {selected && (
          <div className="materialize-backdrop" style={styles.overlay} onClick={() => setSelected(null)}>
            <div className="materialize-in chromatic-edge" style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelected(null)} style={styles.closeBtn}>
                ✕
              </button>

              {/* Contact info — front and center so a human can act on it */}
              <div style={styles.contactBlock}>
                <p style={styles.modalLabel}>Contact</p>
                <p style={styles.contactName}>
                  {selected.customer_name || "(name not captured)"}
                </p>
                <a href={`mailto:${selected.customer_address}`} style={styles.contactEmail}>
                  {selected.customer_address}
                </a>
                <p style={styles.contactMeta}>
                  Sent {new Date(selected.sent_at).toLocaleString()} · via {selected.sent_via}
                  {selected.ai_provider ? ` · ${selected.ai_provider}` : ""}
                </p>

                {!followUpResult && (
                  <button
                    onClick={() => handleFollowUpNow(selected)}
                    disabled={followUpBusy}
                    style={styles.followUpBtn}
                  >
                    {followUpBusy ? "Drafting…" : "Follow Up Now"}
                  </button>
                )}

                {followUpError && (
                  <p style={styles.followUpError}>{followUpError}</p>
                )}

                {/* Per-email follow-up timer — overrides the global
                    default in Settings for this one email only */}
                <div style={styles.timerBox}>
                  <p style={styles.modalLabel}>Follow-up timer for this email</p>
                  <p style={styles.timerHint}>
                    {selected.followup_wait_days_override != null
                      ? `Currently overridden to ${selected.followup_wait_days_override} day(s). Leave blank and Reset to go back to the global default.`
                      : "Currently using the global default from Settings. Set a number below to override it just for this email."}
                  </p>
                  <div style={styles.timerRow}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 2"
                      value={timerInput}
                      onChange={(e) => setTimerInput(e.target.value)}
                      style={styles.timerInput}
                    />
                    <span style={styles.timerUnit}>days</span>
                    <button
                      onClick={() => handleSaveTimer(false)}
                      disabled={savingTimer || timerInput === ""}
                      style={styles.timerSaveBtn}
                    >
                      {savingTimer ? "Saving…" : "Save"}
                    </button>
                    {selected.followup_wait_days_override != null && (
                      <button
                        onClick={() => handleSaveTimer(true)}
                        disabled={savingTimer}
                        style={styles.timerResetBtn}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {timerNotice && (
                    <p style={timerNotice.startsWith("Error") ? styles.followUpError : styles.timerNoticeOk}>
                      {timerNotice}
                    </p>
                  )}
                </div>
              </div>

              {followUpResult && (
                <div style={styles.followUpBox}>
                  {followUpResult.status === "sent" ? (
                    <>
                      <p style={styles.modalLabel}>Follow-Up — Sent</p>
                      <div style={{ ...styles.emailBubble, ...styles.emailBubbleSent }}>
                        {followUpDraft || followUpResult.body}
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={styles.modalLabel}>Follow-Up Draft — Edit Freely</p>
                      <p style={styles.colSubject}>{followUpResult.subject}</p>
                      <textarea
                        value={followUpDraft}
                        onChange={(e) => setFollowUpDraft(e.target.value)}
                        style={styles.followUpTextarea}
                        rows={6}
                      />
                      <button
                        onClick={handleSendQueuedFollowUp}
                        disabled={sendingFollowUp}
                        style={styles.followUpSendBtn}
                      >
                        {sendingFollowUp ? "Sending…" : "Send Follow-Up Now"}
                      </button>
                    </>
                  )}
                </div>
              )}

              <div style={styles.twoCol}>
                {/* Original inquiry */}
                <div style={styles.col}>
                  <p style={styles.modalLabel}>Customer's Original Inquiry</p>
                  <p style={styles.colSubject}>{selected.original_subject || "—"}</p>
                  <div style={styles.emailBubble}>
                    {selected.original_body || "(not captured for this send)"}
                  </div>
                </div>

                {/* What was actually sent */}
                <div style={styles.col}>
                  <p style={styles.modalLabel}>AI Reply — As Sent</p>
                  <p style={styles.colSubject}>{selected.sent_subject}</p>
                  <div style={{ ...styles.emailBubble, ...styles.emailBubbleSent }}>
                    {selected.sent_body}
                  </div>
                </div>
              </div>

              {selected.image_urls && selected.image_urls.length > 0 && (
                <>
                  <p style={styles.modalLabel}>Photos Attached</p>
                  <div style={styles.imageRow}>
                    {selected.image_urls.map((url, i) => (
                      <img key={i} src={url} alt={`Attachment ${i + 1}`} style={styles.attachedImage} />
                    ))}
                  </div>
                </>
              )}

              {selected.signature_used && (
                <>
                  <p style={styles.modalLabel}>Signature Used</p>
                  <div style={styles.signatureBlock}>{selected.signature_used}</div>
                </>
              )}
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  title:    { ...type.pageTitle },
  subtitle: { ...type.pageSubtitle, maxWidth: "520px" },

  statBadge: {
    ...glass.panel,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    padding: "10px 18px",
  },
  statNumber: { fontSize: "22px", fontWeight: "700", color: "#34d399" },
  statLabel:  { fontSize: "11px", color: "#9aa0a6" },

  search: {
    ...glass.input,
    width: "100%",
    padding: "11px 16px",
    fontSize: "13px",
    boxSizing: "border-box",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "14px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
    textAlign: "left",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    fontFamily: "inherit",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardName: { fontSize: "14px", color: "#1a1a2e" },
  viaBadge: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#475569",
    background: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: "99px",
    textTransform: "capitalize",
  },
  cardAddress: { fontSize: "11px", color: "#94a3b8" },
  cardSubject: { fontSize: "12.5px", fontWeight: "600", color: "#334155" },
  cardPreview: { fontSize: "12px", color: "#64748b", margin: "2px 0", lineHeight: "1.5" },
  cardDate: { fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
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
    maxWidth: "900px",
    width: "100%",
    maxHeight: "88vh",
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

  contactBlock: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "16px 18px",
    marginBottom: "22px",
  },
  contactName: { fontSize: "16px", fontWeight: "700", color: "#14532d", margin: "2px 0" },
  contactEmail: { fontSize: "13px", color: "#16a34a", fontWeight: "600", textDecoration: "none" },
  contactMeta: { fontSize: "11px", color: "#4d7c5f", marginTop: "6px" },

  followUpBtn: {
    marginTop: "12px",
    padding: "9px 16px",
    background: "#14532d",
    color: "#dcfce7",
    border: "1px solid #16a34a",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: "700",
    cursor: "pointer",
  },
  followUpError: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#dc2626",
  },
  timerBox: {
    marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e2e8f0",
  },
  timerHint: { fontSize: "11.5px", color: "#64748b", margin: "0 0 10px 0", lineHeight: "1.5" },
  timerRow: { display: "flex", alignItems: "center", gap: "8px" },
  timerInput: {
    width: "70px", padding: "8px 10px", borderRadius: "8px",
    border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box",
  },
  timerUnit: { fontSize: "12.5px", color: "#64748b" },
  timerSaveBtn: {
    padding: "8px 14px", background: "#16a34a", color: "#fff", border: "none",
    borderRadius: "8px", fontSize: "12.5px", fontWeight: "700", cursor: "pointer",
  },
  timerResetBtn: {
    padding: "8px 14px", background: "transparent", color: "#64748b",
    border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "12.5px",
    fontWeight: "600", cursor: "pointer",
  },
  timerNoticeOk: { marginTop: "8px", fontSize: "12px", color: "#16a34a" },
  followUpBox: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "16px 18px",
    marginBottom: "20px",
  },
  followUpTextarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #bbf7d0",
    fontSize: "13px",
    lineHeight: "1.6",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
    resize: "vertical",
    color: "#14532d",
    marginBottom: "10px",
  },
  followUpSendBtn: {
    padding: "10px 18px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  modalLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 4px 0",
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  col: { display: "flex", flexDirection: "column" },
  colSubject: { fontSize: "13px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 8px 0" },

  emailBubble: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "13px",
    color: "#334155",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    maxHeight: "320px",
    overflowY: "auto",
    flex: 1,
  },
  emailBubbleSent: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
  },

  imageRow: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" },
  attachedImage: {
    width: "110px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  signatureBlock: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "12px",
    color: "#475569",
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
  },

  muted: { color: "#9aa0a6", fontSize: "14px" },
  empty: { textAlign: "center", padding: "60px 0" },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "12px",
    padding: "10px",
    background: "#fef2f2",
    borderRadius: "6px",
  },
};
