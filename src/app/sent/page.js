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

export default function SentPage() {
  const [emails,   setEmails]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");

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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
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
                  onClick={() => setSelected(email)}
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
                    {email.sent_body?.slice(0, 130)}
                    {email.sent_body?.length > 130 ? "…" : ""}
                  </p>
                  <span style={styles.cardDate}>
                    {new Date(email.sent_at).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Expanded detail modal ─────────────────────────── */}
        {selected && (
          <div style={styles.overlay} onClick={() => setSelected(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
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
              </div>

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
    background: "#0b0d0f",
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
  title:    { fontSize: "26px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  subtitle: { fontSize: "14px", color: "#9aa0a6", margin: 0, maxWidth: "520px" },

  statBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    background: "#16191c",
    border: "1px solid #2a2e33",
    borderRadius: "10px",
    padding: "10px 18px",
  },
  statNumber: { fontSize: "22px", fontWeight: "700", color: "#34d399" },
  statLabel:  { fontSize: "11px", color: "#9aa0a6" },

  search: {
    width: "100%",
    padding: "11px 16px",
    borderRadius: "8px",
    border: "1px solid #2a2e33",
    background: "#16191c",
    color: "#e8eaed",
    fontSize: "13px",
    boxSizing: "border-box",
    marginBottom: "20px",
    outline: "none",
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
