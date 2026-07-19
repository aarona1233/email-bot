"use client";
// src/app/batch/page.js
// ─────────────────────────────────────────────────────────
// Batch workflow:
//   1. "Fetch New Emails" pulls from IMAP into the queue
//   2. Select which pending emails to process (checkboxes)
//   3. "Generate Drafts" primes them all through the reply bot
//   4. Step through each generated draft, edit, and send
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const REJECT_REASONS = [
  "Spam / promotional",
  "Not about office space",
  "Vendor or sales pitch",
  "Job application",
  "Automated / no-reply",
  "Other",
];

export default function BatchPage() {
  const router = useRouter();

  const [emails,    setEmails]    = useState([]);
  const [selected,  setSelected]  = useState(new Set());
  const [drafts,    setDrafts]    = useState([]);   // generated batch
  const [signature, setSignature] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [fetching,  setFetching]  = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error,     setError]     = useState("");
  const [notice,    setNotice]    = useState("");
  const [expanded,  setExpanded]  = useState(null);   // email opened in modal
  const [rejecting, setRejecting] = useState(null);   // email being rejected (shows reason picker)
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [editingDraft, setEditingDraft] = useState(null); // draft opened for editing
  const [testMode,  setTestMode]  = useState(false);      // redirect all to test address
  const [testEmail, setTestEmail] = useState("");         // the test redirect address
  const [sending,   setSending]   = useState(false);
  const [sentIds,   setSentIds]   = useState(new Set());

  // ── Load pending emails ────────────────────────────────
  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/inbox/list?status=pending");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Load failed");
      setEmails(data.emails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  // ── Fetch new mail over IMAP ───────────────────────────
  async function handleFetch() {
    setFetching(true);
    setError("");
    setNotice("");
    try {
      const res  = await fetch("/api/inbox/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 25 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fetch failed");

      setNotice(
        `Fetched ${data.fetched}, added ${data.ingested} new` +
        (data.duplicates ? `, ${data.duplicates} already seen` : "") +
        (data.errors ? `, ${data.errors} errors` : "")
      );
      await loadPending();
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  // ── Reject a single pending email ──────────────────────
  async function handleReject(email) {
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
      setRejecting(null);
      setExpanded(null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(email.id);
        return next;
      });
      await loadPending();
      setNotice(`Rejected: ${email.subject}`);
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Selection helpers ──────────────────────────────────
  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function selectAll() {
    if (selected.size === emails.length) setSelected(new Set());
    else setSelected(new Set(emails.map((e) => e.id)));
  }

  // ── Generate drafts for the whole selected batch ───────
  async function handleGenerate() {
    if (selected.size === 0) {
      setError("Select at least one email first.");
      return;
    }
    setProcessing(true);
    setError("");
    setNotice("");
    try {
      const res  = await fetch("/api/inbox/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], signature }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch failed");

      const withDrafts = data.results.filter((r) => r.ok && r.draft);
      setDrafts(withDrafts);
      setNotice(`Generated ${withDrafts.length} drafts. Review each below.`);
      setSelected(new Set());
      await loadPending();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  // ── Open one draft in the full review editor ───────────
  function openInReview(draft) {
    sessionStorage.setItem("office_draft",     draft.draft);
    sessionStorage.setItem("office_spaces",    JSON.stringify(draft.spaces || []));
    sessionStorage.setItem("office_analysis",  JSON.stringify(draft.analysis || {}));
    sessionStorage.setItem("office_address",   testMode && testEmail ? testEmail : draft.from);
    sessionStorage.setItem("office_original",  draft.originalBody);
    sessionStorage.setItem("office_signature", signature);
    sessionStorage.setItem("office_inbox_id",  String(draft.id));
    router.push("/review");
  }

  // ── Edit a draft's body inline ─────────────────────────
  function updateDraftBody(id, newBody) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, draft: newBody } : d))
    );
  }

  // ── Collect image URLs from a draft's spaces ───────────
  function draftImageUrls(draft) {
    const fromSpaces = (draft.spaces || []).flatMap((s) =>
      s.space_images && s.space_images.length > 0
        ? s.space_images
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((img) => img.url)
        : []
    );
    return [...new Set(fromSpaces)].filter(Boolean);
  }

  // ── Batch send ALL generated drafts at once ────────────
  async function handleBatchSend() {
    setSending(true);
    setError("");
    setNotice("");
    try {
      const payload = drafts
        .filter((d) => !sentIds.has(d.id))
        .map((d) => ({
          inboxId:   d.id,
          to:        testMode && testEmail ? testEmail : d.from,
          subject:   `Re: ${d.subject}`,
          body:      d.draft,
          imageUrls: draftImageUrls(d),
        }));

      if (payload.length === 0) {
        setNotice("Nothing to send — all drafts already sent.");
        setSending(false);
        return;
      }

      const res  = await fetch("/api/inbox/batch-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch send failed");

      const newSent = new Set(sentIds);
      data.results.filter((r) => r.ok).forEach((r) => newSent.add(r.inboxId));
      setSentIds(newSent);

      const failed = data.results.filter((r) => !r.ok);
      setNotice(
        `Sent ${data.sent}/${data.total}` +
        (testMode ? ` (redirected to ${testEmail})` : "") +
        (failed.length ? ` — ${failed.length} failed` : "")
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="batch" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>⚡ Batch Processing</h1>
            <p style={styles.subtitle}>
              Pull new mail, select a batch, and generate all replies at once.
            </p>
          </div>
          <div style={styles.headerBtns}>
            <button onClick={() => router.push("/inbox")} style={styles.secondaryBtn}>
              Triage View
            </button>
            <button
              onClick={handleFetch}
              disabled={fetching}
              style={styles.fetchBtn}
            >
              {fetching ? "Fetching…" : "⬇ Fetch New Emails"}
            </button>
          </div>
        </div>

        {notice && <p style={styles.notice}>{notice}</p>}
        {error  && <p style={styles.error}>{error}</p>}

        {/* Signature */}
        <label style={styles.label}>Signature applied to this batch</label>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder={`Jane Smith | Sales Manager, Coalition Space\n(212) 555-0000 | jane@coalitionspace.com`}
          style={styles.signatureBox}
          rows={3}
        />

        {/* Selection controls */}
        <div style={styles.controls}>
          <button onClick={selectAll} style={styles.linkBtn}>
            {selected.size === emails.length && emails.length > 0
              ? "Deselect all"
              : "Select all"}
          </button>
          <span style={styles.count}>{selected.size} selected</span>
          <button
            onClick={handleGenerate}
            disabled={processing || selected.size === 0}
            style={
              processing || selected.size === 0
                ? { ...styles.generateBtn, ...styles.btnDisabled }
                : styles.generateBtn
            }
          >
            {processing ? "Generating…" : `Generate ${selected.size} Drafts →`}
          </button>
        </div>

        {/* Pending email list */}
        {loading ? (
          <p style={styles.muted}>Loading…</p>
        ) : emails.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "36px", margin: 0 }}>📭</p>
            <p style={styles.muted}>No pending emails. Fetch new mail to begin.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {emails.map((email) => (
              <label key={email.id} style={styles.row}>
                <input
                  type="checkbox"
                  checked={selected.has(email.id)}
                  onChange={() => toggle(email.id)}
                  style={styles.checkbox}
                />
                <div style={styles.rowContent}>
                  <div style={styles.rowTop}>
                    <strong style={styles.rowFrom}>
                      {email.from_name || email.from_address}
                    </strong>
                    <span
                      style={{
                        ...styles.guessBadge,
                        background: email.heuristic_prediction ? "#dcfce7" : "#fee2e2",
                        color:      email.heuristic_prediction ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {email.heuristic_prediction ? "likely valid" : "likely spam"}
                    </span>
                  </div>
                  <span style={styles.rowSubject}>{email.subject}</span>
                  <span style={styles.rowPreview}>
                    {email.body.slice(0, 120)}…
                  </span>
                  <div style={styles.rowBtnGroup}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpanded(email);
                      }}
                      style={styles.expandBtn}
                    >
                      Read full email →
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setRejecting(email);
                        setRejectReason(REJECT_REASONS[0]);
                      }}
                      style={styles.rejectLinkBtn}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Generated drafts — editable, batch sendable */}
        {drafts.length > 0 && (
          <div style={styles.draftsSection}>
            <h2 style={styles.draftsTitle}>
              📝 Generated Drafts ({drafts.length})
            </h2>

            {/* Test-mode redirect */}
            <div style={styles.testModeBar}>
              <label style={styles.testToggle}>
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                />
                <span>Test mode — redirect all sends to one address</span>
              </label>
              {testMode && (
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  style={styles.testInput}
                />
              )}
            </div>

            <p style={styles.muted}>
              Edit any draft inline, open the full editor, or send the whole batch.
            </p>

            <div style={styles.draftList}>
              {drafts.map((d) => {
                const isSent = sentIds.has(d.id);
                const recipient = testMode && testEmail ? testEmail : d.from;
                return (
                  <div
                    key={d.id}
                    style={{
                      ...styles.draftCardFull,
                      opacity: isSent ? 0.55 : 1,
                    }}
                  >
                    <div style={styles.draftHead}>
                      <div>
                        <strong style={styles.draftTo}>To: {recipient}</strong>
                        <span style={styles.draftSubject}> · {d.subject}</span>
                      </div>
                      {isSent && <span style={styles.sentBadge}>✓ Sent</span>}
                    </div>

                    {editingDraft === d.id ? (
                      <textarea
                        value={d.draft}
                        onChange={(e) => updateDraftBody(d.id, e.target.value)}
                        style={styles.draftEditor}
                        rows={12}
                        autoFocus
                      />
                    ) : (
                      <p style={styles.draftBodyText}>{d.draft}</p>
                    )}

                    <div style={styles.draftActions}>
                      {editingDraft === d.id ? (
                        <button
                          onClick={() => setEditingDraft(null)}
                          style={styles.saveBtn}
                        >
                          ✓ Done editing
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingDraft(d.id)}
                          style={styles.editBtn}
                          disabled={isSent}
                        >
                          ✏️ Edit inline
                        </button>
                      )}
                      <button
                        onClick={() => openInReview(d)}
                        style={styles.fullEditBtn}
                        disabled={isSent}
                      >
                        Open full editor (photos) →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Batch send footer */}
            <div style={styles.batchSendBar}>
              <span style={styles.muted}>
                {drafts.filter((d) => !sentIds.has(d.id)).length} ready to send
                {testMode && testEmail ? ` → all to ${testEmail}` : ""}
              </span>
              <button
                onClick={handleBatchSend}
                disabled={sending || (testMode && !testEmail)}
                style={
                  sending || (testMode && !testEmail)
                    ? { ...styles.batchSendBtn, ...styles.btnDisabled }
                    : styles.batchSendBtn
                }
              >
                {sending ? "Sending…" : `📤 Send All (${drafts.filter((d) => !sentIds.has(d.id)).length})`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Expanded email modal ─────────────────────────── */}
      {expanded && (
        <div style={styles.overlay} onClick={() => setExpanded(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setExpanded(null)} style={styles.closeBtn}>
              ✕
            </button>

            <p style={styles.modalLabel}>From</p>
            <p style={styles.modalValue}>
              {expanded.from_name
                ? `${expanded.from_name} <${expanded.from_address}>`
                : expanded.from_address}
            </p>

            <p style={styles.modalLabel}>Subject</p>
            <p style={styles.modalValue}>{expanded.subject}</p>

            <p style={styles.modalLabel}>Received</p>
            <p style={styles.modalValue}>
              {new Date(expanded.received_at).toLocaleString()}
            </p>

            <p style={styles.modalLabel}>Full Body</p>
            <div style={styles.modalBody}>{expanded.body}</div>

            {expanded.heuristic_signals &&
              Object.keys(expanded.heuristic_signals).length > 0 && (
                <>
                  <p style={styles.modalLabel}>Signals detected</p>
                  <div style={styles.signalRow}>
                    {Object.entries(expanded.heuristic_signals).flatMap(
                      ([category, labels]) =>
                        (labels || []).map((l) => (
                          <span key={`${category}-${l}`} style={styles.signalBadge}>
                            {l}
                          </span>
                        ))
                    )}
                  </div>
                </>
              )}

            {rejecting?.id === expanded.id ? (
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
                <div style={styles.modalActions}>
                  <button onClick={() => setRejecting(null)} style={styles.secondaryBtn}>
                    Back
                  </button>
                  <button onClick={() => handleReject(expanded)} style={styles.rejectBtn}>
                    Confirm Reject
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.modalActions}>
                <button
                  onClick={() => { setRejecting(expanded); setRejectReason(REJECT_REASONS[0]); }}
                  style={styles.rejectBtn}
                >
                  ✕ Reject
                </button>
                <button
                  onClick={() => {
                    toggle(expanded.id);
                    setExpanded(null);
                  }}
                  style={styles.modalSelectBtn}
                >
                  {selected.has(expanded.id) ? "✓ Selected — click to deselect" : "Select for batch"}
                </button>
              </div>
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
    background: "linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%)",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  headerBtns: { display: "flex", gap: "10px" },
  title:    { fontSize: "26px", fontWeight: "700", color: "#fff", margin: "0 0 4px 0" },
  subtitle: { fontSize: "14px", color: "#a8c0d8", margin: 0 },

  fetchBtn: {
    padding: "10px 18px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 16px",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#a8c0d8",
    marginBottom: "6px",
  },
  signatureBox: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: "13px",
    fontFamily: "monospace",
    boxSizing: "border-box",
    marginBottom: "20px",
    resize: "vertical",
  },

  controls: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#7dd3fc",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  count: { color: "#a8c0d8", fontSize: "13px" },
  generateBtn: {
    marginLeft: "auto",
    padding: "11px 20px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnDisabled: { background: "#64748b", cursor: "not-allowed" },

  list: { display: "flex", flexDirection: "column", gap: "8px" },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    background: "#fff",
    borderRadius: "10px",
    padding: "14px 16px",
    cursor: "pointer",
  },
  checkbox: { marginTop: "3px", width: "16px", height: "16px", cursor: "pointer" },
  rowContent: { flex: 1, display: "flex", flexDirection: "column", gap: "3px" },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  rowFrom: { fontSize: "14px", color: "#1a1a2e" },
  guessBadge: {
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "99px",
  },
  rowSubject: { fontSize: "13px", fontWeight: "600", color: "#334155" },
  rowPreview: { fontSize: "12px", color: "#94a3b8" },

  draftsSection: {
    marginTop: "36px",
    paddingTop: "24px",
    borderTop: "1px solid rgba(255,255,255,0.15)",
  },
  draftsTitle: { fontSize: "18px", fontWeight: "700", color: "#fff", margin: "0 0 4px 0" },
  draftGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "14px",
    marginTop: "16px",
  },
  draftCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "16px",
    textAlign: "left",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontFamily: "inherit",
  },
  draftHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    color: "#1a1a2e",
  },
  draftArrow: { color: "#16a34a", fontSize: "12px", fontWeight: "600" },
  draftSubject: { fontSize: "12px", fontWeight: "600", color: "#475569" },
  draftPreview: { fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.5" },

  notice: {
    color: "#16a34a",
    fontSize: "13px",
    padding: "10px 14px",
    background: "#f0fdf4",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    padding: "10px 14px",
    background: "#fef2f2",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  muted: { color: "#a8c0d8", fontSize: "14px" },
  empty: { textAlign: "center", padding: "50px 0" },

  expandBtn: {
    alignSelf: "flex-start",
    marginTop: "4px",
    background: "none",
    border: "none",
    color: "#3b82f6",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
  },
  rowBtnGroup: {
    display: "flex",
    gap: "14px",
    marginTop: "4px",
  },
  rejectLinkBtn: {
    background: "none",
    border: "none",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    marginBottom: "4px",
  },
  rejectBtn: {
    padding: "12px 20px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
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
    maxHeight: "300px",
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
  modalActions: { marginTop: "24px" },
  modalSelectBtn: {
    width: "100%",
    padding: "12px",
    background: "#1e3a5f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  testModeBar: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  testToggle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#fbbf24",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  testInput: {
    flex: 1,
    minWidth: "220px",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(0,0,0,0.2)",
    color: "#fff",
    fontSize: "13px",
  },
  draftList: { display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" },
  draftCardFull: {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px",
  },
  draftTo: { fontSize: "13px", color: "#1a1a2e" },
  draftBodyText: {
    fontSize: "13px",
    color: "#334155",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "14px",
    margin: "10px 0",
    maxHeight: "220px",
    overflowY: "auto",
  },
  draftEditor: {
    width: "100%",
    fontSize: "13px",
    lineHeight: "1.6",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
    margin: "10px 0",
    resize: "vertical",
  },
  draftActions: { display: "flex", gap: "10px" },
  editBtn: {
    padding: "8px 14px",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "8px 14px",
    background: "#dcfce7",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  fullEditBtn: {
    padding: "8px 14px",
    background: "none",
    color: "#3b82f6",
    border: "none",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  sentBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#16a34a",
    background: "#dcfce7",
    padding: "3px 10px",
    borderRadius: "99px",
  },
  batchSendBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,0.15)",
  },
  batchSendBtn: {
    padding: "13px 24px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
};
