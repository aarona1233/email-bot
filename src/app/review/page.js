"use client";
// src/app/office/review/page.js
// ─────────────────────────────────────────────────────────
// Review page for office space replies.
// Shows matched spaces as cards with all their details,
// then the editable AI draft, then approve & send.
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Badge color by availability status
const AVAILABILITY_STYLES = {
  "Available":   { background: "#dcfce7", color: "#16a34a" },
  "Booked":      { background: "#fee2e2", color: "#dc2626" },
  "Maintenance": { background: "#fef9c3", color: "#ca8a04" },
};

// Icon by space type
const TYPE_ICONS = {
  "Private Office": "🏢",
  "Hot Desk":       "💻",
  "Meeting Room":   "📋",
  "Event Space":    "🎉",
};

export default function OfficeReviewPage() {
  const router = useRouter();

  const [draft,    setDraft]    = useState("");
  const [spaces,   setSpaces]   = useState([]);
  const [analysis, setAnalysis] = useState({});
  const [address,  setAddress]  = useState("");
  const [original, setOriginal] = useState("");
  const [subject,  setSubject]  = useState("Re: Space Inquiry");
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const savedDraft    = sessionStorage.getItem("office_draft");
    const savedSpaces   = sessionStorage.getItem("office_spaces");
    const savedAnalysis = sessionStorage.getItem("office_analysis");
    const savedAddress  = sessionStorage.getItem("office_address");
    const savedOriginal = sessionStorage.getItem("office_original");

    if (!savedDraft) { router.push("/"); return; }

    setDraft(savedDraft);
    setSpaces(JSON.parse(savedSpaces   || "[]"));
    setAnalysis(JSON.parse(savedAnalysis || "{}"));
    setAddress(savedAddress || "");
    setOriginal(savedOriginal || "");
  }, [router]);

  // Strategy 1: pull URLs from space_images join (from DB)
  const dbImageUrls = spaces.flatMap((s) =>
    s.space_images && s.space_images.length > 0
      ? s.space_images
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((img) => img.url)
      : []
  ).filter(Boolean);

  // Strategy 2: parse [ATTACH IMAGE: url] tags directly from AI draft text
  // This is the fallback — if the DB join didn't survive sessionStorage,
  // we still get the URLs because the AI copied them into the draft.
  const draftImageUrls = (draft.match(/\[ATTACH IMAGE:\s*([^\]]+)\]/g) || [])
    .map((tag) => tag.replace(/\[ATTACH IMAGE:\s*/, "").replace(/\]$/, "").trim())
    .filter(Boolean);

  // Merge both sources, deduplicate
  const imageUrls = [...new Set([...dbImageUrls, ...draftImageUrls])];

  async function handleSend() {
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: address,
          subject,
          body: draft,
          imageUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      sessionStorage.clear();
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <main style={styles.page}>
        <div style={{ ...styles.card, textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
          <h2 style={styles.title}>Reply Sent!</h2>
          <p style={{ color: "#666" }}>Your reply was sent to {address}.</p>
          <button onClick={() => router.push("/")} style={styles.button}>
            Handle Another Inquiry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => router.push("/")} style={styles.backBtn}>
          ← Back
        </button>

        <h1 style={styles.title}>Review Draft</h1>
        <p style={styles.subtitle}>
          Check the matched spaces and draft below. Edit anything, then send.
        </p>

        {/* Original inquiry */}
        <section style={styles.section}>
          <label style={styles.label}>📥 Original Inquiry</label>
          <div style={styles.originalEmail}>{original}</div>
        </section>

        {/* Analysis badges — what the bot detected */}
        {Object.keys(analysis).length > 0 && (
          <div style={styles.analysisBadges}>
            <p style={styles.analysisTitle}>🔍 Detected from inquiry:</p>
            <div style={styles.badgeRow}>
              {analysis.isUrgent && (
                <span style={{ ...styles.infoBadge, background: "#fee2e2", color: "#dc2626" }}>
                  🚨 Urgent
                </span>
              )}
              {analysis.spaceTypes?.map((t) => (
                <span key={t} style={styles.infoBadge}>🏢 {t}</span>
              ))}
              {analysis.capacities?.map((c) => (
                <span key={c} style={styles.infoBadge}>👥 {c}</span>
              ))}
              {analysis.locations?.map((loc) => (
                <span key={loc} style={styles.infoBadge}>📍 {loc}</span>
              ))}
              {analysis.timeframes?.map((t) => (
                <span key={t} style={styles.infoBadge}>⏱️ {t}</span>
              ))}
              {analysis.pricingTiers?.map((p) => (
                <span key={p} style={styles.infoBadge}>💰 {p}</span>
              ))}
              {analysis.amenities?.map((a) => (
                <span key={a} style={styles.infoBadge}>✓ {a}</span>
              ))}
              {analysis.compliance?.map((c) => (
                <span key={c} style={{ ...styles.infoBadge, background: "#fef9c3", color: "#92400e" }}>
                  ⚖️ {c}
                </span>
              ))}
              {analysis.industry?.map((i) => (
                <span key={i} style={styles.infoBadge}>🏭 {i}</span>
              ))}
              {analysis.wantsTour && (
                <span style={styles.infoBadge}>
                  👋 Tour{analysis.tourTime ? ` — ${analysis.tourTime}` : ""}
                </span>
              )}
              {analysis.wantsCall && (
                <span style={styles.infoBadge}>📞 Call requested</span>
              )}
              {analysis.availability?.map((a) => (
                <span key={a} style={styles.infoBadge}>📅 {a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Matched spaces */}
        {spaces.length > 0 && (
          <section style={styles.section}>
            <label style={styles.label}>
              🏢 Spaces Found ({spaces.length})
            </label>
            <div style={styles.spaceGrid}>
              {spaces.map((space) => {
                const availStyle = AVAILABILITY_STYLES[space.availability] || AVAILABILITY_STYLES["Available"];
                const icon = TYPE_ICONS[space.type] || "🏢";

                return (
                  <div key={space.id} style={styles.spaceCard}>
                    {/* Space image */}
                    {space.space_images && space.space_images.length > 0 ? (
                      <img src={space.space_images[0].url} alt={space.name} style={styles.spaceImage} />
                    ) : (
                      <div style={styles.spaceImagePlaceholder}>{icon}</div>
                    )}

                    <div style={styles.spaceBody}>
                      {/* Name + availability */}
                      <div style={styles.spaceHeader}>
                        <strong style={styles.spaceName}>{icon} {space.name}</strong>
                        <span style={{ ...styles.badge, ...availStyle }}>
                          {space.availability}
                        </span>
                      </div>

                      {/* Type + capacity */}
                      <p style={styles.spaceMeta}>
                        {space.type} · {space.capacity} people · {space.floor}
                      </p>

                      {/* Pricing */}
                      <div style={styles.priceRow}>
                        {space.hourly_rate  && <span style={styles.price}>${space.hourly_rate}/hr</span>}
                        {space.daily_rate   && <span style={styles.price}>${space.daily_rate}/day</span>}
                        {space.monthly_rate && <span style={styles.price}>${space.monthly_rate}/mo</span>}
                      </div>

                      {/* Amenities */}
                      <div style={styles.amenitiesRow}>
                        {space.amenities?.split(",").slice(0, 4).map((a, i) => (
                          <span key={i} style={styles.amenityTag}>{a.trim()}</span>
                        ))}
                        {space.amenities?.split(",").length > 4 && (
                          <span style={styles.amenityTag}>
                            +{space.amenities.split(",").length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Subject */}
        <section style={styles.section}>
          <label style={styles.label}>Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.input}
          />
        </section>

        {/* Editable draft */}
        <section style={styles.section}>
          <label style={styles.label}>✏️ AI Draft — Edit Freely</label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={styles.textarea}
            rows={16}
          />
        </section>

        {/* Images being attached */}
        {imageUrls.length > 0 && (
          <section style={styles.section}>
            <label style={styles.label}>📎 Photos Being Attached</label>
            <div style={styles.imageRow}>
              {imageUrls.map((url, i) => (
                <img key={i} src={url} alt={`Space ${i + 1}`} style={styles.attachedImage} />
              ))}
            </div>
          </section>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
          Sending to: <strong>{address}</strong>
        </p>

        <button
          onClick={handleSend}
          disabled={sending}
          style={sending ? { ...styles.button, background: "#86efac", cursor: "not-allowed" } : styles.button}
        >
          {sending ? "Sending..." : "✅ Approve & Send"}
        </button>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%)",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', sans-serif",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "780px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
    height: "fit-content",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#1e3a5f",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    padding: 0,
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e3a5f",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "28px",
  },
  section: { marginBottom: "28px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "10px",
  },
  originalEmail: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    maxHeight: "120px",
    overflowY: "auto",
  },
  analysisBadges: {
    background: "#f0f6ff",
    border: "1px solid #c7d9f5",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "24px",
  },
  analysisTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#1e3a5f",
    margin: "0 0 8px 0",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  infoBadge: {
    fontSize: "12px",
    background: "#e0eaff",
    color: "#1e3a5f",
    padding: "3px 10px",
    borderRadius: "99px",
    fontWeight: "500",
  },
  spaceGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  spaceCard: {
    display: "flex",
    gap: "14px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  spaceImage: {
    width: "100px",
    minWidth: "100px",
    height: "100px",
    objectFit: "cover",
  },
  spaceImagePlaceholder: {
    width: "100px",
    minWidth: "100px",
    height: "100px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },
  spaceBody: {
    padding: "12px 14px 12px 0",
    flex: 1,
  },
  spaceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  spaceName: {
    fontSize: "14px",
    color: "#1a1a2e",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "99px",
  },
  spaceMeta: {
    fontSize: "12px",
    color: "#666",
    margin: "0 0 8px 0",
  },
  priceRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  price: {
    fontSize: "12px",
    fontWeight: "600",
    background: "#f0fdf4",
    color: "#16a34a",
    padding: "2px 8px",
    borderRadius: "6px",
    border: "1px solid #bbf7d0",
  },
  amenitiesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
  },
  amenityTag: {
    fontSize: "11px",
    background: "#f1f5f9",
    color: "#475569",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
    lineHeight: "1.6",
    outline: "none",
    color: "#1a1a2e",
  },
  imageRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  attachedImage: {
    width: "120px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "12px",
    padding: "10px",
    background: "#fef2f2",
    borderRadius: "6px",
  },
};