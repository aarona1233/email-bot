"use client";
// src/app/followups/page.js
// ─────────────────────────────────────────────────────────
// Queue of drafted nudges waiting for a human click (only
// populated when auto_send is OFF in Settings). Same
// card + expand-modal pattern as Inbox/Batch/Sent.
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";

const TABS = [
  { key: "pending_review", label: "Pending" },
  { key: "sent",           label: "Sent"    },
  { key: "skipped",        label: "Skipped" },
  { key: "all",            label: "All"     },
];

export default function FollowUpsPage() {
  const [tab,      setTab]      = useState("pending_review");
  const [items,    setItems]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`/api/followups/list?status=${tab}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setItems(data.followUps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  function openItem(item) {
    setSelected(item);
    setEditBody(item.draft_body || "");
  }

  async function handleSend(item) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/followups/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, body: editBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSkip(item) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/followups/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Skip failed");
      }
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="followups" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
        <div style={styles.container}>

          <h1 style={styles.title}>Follow-Ups</h1>
          <p style={styles.subtitle}>
            Customers who went quiet after a reply. Review the drafted nudge, edit if needed, send or skip.
          </p>

          <div style={styles.tabs}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={tab === t.key ? { ...styles.tab, ...styles.tabActive } : styles.tab}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && <p style={styles.error}>{error}</p>}

          {loading ? (
            <p style={styles.muted}>Loading…</p>
          ) : items.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.muted}>Nothing here right now.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {items.map((item) => (
                <button key={item.id} onClick={() => openItem(item)} style={styles.card}>
                  <div style={styles.cardTop}>
                    <strong style={styles.cardName}>
                      {item.customer_name || item.customer_address}
                    </strong>
                    <span style={styles.numBadge}>nudge #{item.follow_up_number}</span>
                  </div>
                  <span style={styles.cardAddress}>{item.customer_address}</span>
                  <span style={styles.cardSubject}>{item.draft_subject}</span>
                  <p style={styles.cardPreview}>
                    {item.draft_body?.slice(0, 130)}
                    {item.draft_body?.length > 130 ? "…" : ""}
                  </p>
                  <span style={styles.cardDate}>
                    Original sent {item.sent_emails ? new Date(item.sent_emails.sent_at).toLocaleDateString() : "—"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div style={styles.overlay} onClick={() => !busy && setSelected(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelected(null)} style={styles.closeBtn} disabled={busy}>✕</button>

              <div style={styles.contactBlock}>
                <p style={styles.modalLabel}>Contact</p>
                <p style={styles.contactName}>{selected.customer_name || "(name not captured)"}</p>
                <p style={styles.contactEmail}>{selected.customer_address}</p>
              </div>

              {selected.sent_emails && (
                <>
                  <p style={styles.modalLabel}>Original Email Sent (no reply since)</p>
                  <div style={styles.emailBubble}>{selected.sent_emails.sent_body}</div>
                </>
              )}

              <p style={styles.modalLabel}>Drafted Follow-Up — Edit Freely</p>
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                style={styles.textarea}
                rows={8}
              />

              {selected.status === "pending_review" ? (
                <div style={styles.actions}>
                  <button onClick={() => handleSkip(selected)} disabled={busy} style={styles.skipBtn}>
                    Skip
                  </button>
                  <button onClick={() => handleSend(selected)} disabled={busy} style={styles.sendBtn}>
                    {busy ? "Sending…" : "Send Follow-Up"}
                  </button>
                </div>
              ) : (
                <p style={styles.statusNote}>
                  Status: <strong>{selected.status}</strong>
                  {selected.sent_at ? ` — ${new Date(selected.sent_at).toLocaleString()}` : ""}
                </p>
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
    background: "#0b0d0f",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: { maxWidth: "1100px", margin: "0 auto" },

  title:    { fontSize: "26px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  subtitle: { fontSize: "14px", color: "#9aa0a6", margin: "0 0 20px 0", maxWidth: "560px" },

  tabs: { display: "flex", gap: "8px", marginBottom: "20px" },
  tab: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #2a2e33",
    background: "transparent",
    color: "#9aa0a6",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  tabActive: {
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a",
    border: "1px solid #8f9aa3",
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
  numBadge: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#0d7a4f",
    background: "#dcfce7",
    padding: "2px 8px",
    borderRadius: "99px",
  },
  cardAddress: { fontSize: "11px", color: "#94a3b8" },
  cardSubject: { fontSize: "12.5px", fontWeight: "600", color: "#334155" },
  cardPreview: { fontSize: "12px", color: "#64748b", margin: "2px 0", lineHeight: "1.5" },
  cardDate: { fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" },

  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px", zIndex: 50,
  },
  modal: {
    background: "#fff", borderRadius: "14px", padding: "32px",
    maxWidth: "640px", width: "100%", maxHeight: "88vh",
    overflowY: "auto", position: "relative",
  },
  closeBtn: {
    position: "absolute", top: "16px", right: "16px",
    background: "none", border: "none", fontSize: "18px",
    cursor: "pointer", color: "#94a3b8",
  },

  contactBlock: {
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "10px", padding: "14px 16px", marginBottom: "18px",
  },
  contactName: { fontSize: "15px", fontWeight: "700", color: "#14532d", margin: "2px 0" },
  contactEmail: { fontSize: "12.5px", color: "#16a34a", margin: 0 },

  modalLabel: {
    fontSize: "11px", fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.5px",
    margin: "14px 0 6px 0",
  },
  emailBubble: {
    background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
    padding: "14px", fontSize: "13px", color: "#334155", lineHeight: "1.6",
    whiteSpace: "pre-wrap", maxHeight: "180px", overflowY: "auto",
  },
  textarea: {
    width: "100%", padding: "14px", borderRadius: "8px",
    border: "1px solid #ddd", fontSize: "13px", lineHeight: "1.6",
    boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif",
    resize: "vertical", color: "#1a1a2e",
  },

  actions: { display: "flex", gap: "10px", marginTop: "16px" },
  sendBtn: {
    flex: 2, padding: "13px", background: "#16a34a", color: "#fff",
    border: "none", borderRadius: "8px", fontSize: "14px",
    fontWeight: "700", cursor: "pointer",
  },
  skipBtn: {
    flex: 1, padding: "13px", background: "#fef2f2", color: "#dc2626",
    border: "1px solid #fecaca", borderRadius: "8px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer",
  },
  statusNote: { fontSize: "13px", color: "#64748b", marginTop: "16px" },

  muted: { color: "#9aa0a6", fontSize: "14px" },
  empty: { textAlign: "center", padding: "60px 0" },
  error: {
    color: "#dc2626", fontSize: "13px", marginTop: "12px",
    padding: "10px", background: "#fef2f2", borderRadius: "6px",
  },
};
