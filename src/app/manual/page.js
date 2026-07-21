"use client";
// src/app/manual/page.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function OfficePage() {
  const router = useRouter();

  const [customerEmail,   setCustomerEmail]   = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [signature,       setSignature]       = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

  async function handleGenerate() {
    if (!customerEmail.trim()) {
      setError("Please paste the customer's email.");
      return;
    }
    if (!customerAddress.trim()) {
      setError("Please enter the customer's email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-office-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail, signature }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "off_topic") {
          setError("That doesn't look like an office space inquiry. Please paste a client email asking about renting or booking a space.");
          return;
        }
        throw new Error(data.error || "Unknown error");
      }

      sessionStorage.setItem("office_draft",     data.draft);
      sessionStorage.setItem("office_spaces",    JSON.stringify(data.spaces));
      sessionStorage.setItem("office_analysis",  JSON.stringify(data.analysis));
      sessionStorage.setItem("office_address",   customerAddress);
      sessionStorage.setItem("office_original",  customerEmail);
      sessionStorage.setItem("office_signature", signature);

      router.push("/review");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="manual" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.icon}></span>
          <div>
            <h1 style={styles.title}>Office Space Reply Bot</h1>
            <p style={styles.subtitle}>
              Paste a client inquiry and generate a reply with pricing,
              availability, location, amenities, and photos.
            </p>
          </div>
        </div>

        {/* Client email address */}
        <label style={styles.label}>Client&apos;s Email Address</label>
        <input
          type="email"
          placeholder="client@company.com"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          style={styles.input}
        />

        {/* Paste their inquiry */}
        <label style={styles.label}>Paste Their Inquiry</label>
        <textarea
          placeholder={`Hi, we're a team of 6 looking for a private office space for the next 3 months. Do you have anything available? We'd also need a meeting room a couple times a week...`}
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          style={styles.textarea}
          rows={8}
        />

        {/* Your signature */}
        <label style={styles.label}>Your Signature</label>
        <textarea
          placeholder={`Jane Smith | Sales Manager, Coalition Space\n(212) 555-0000 | jane@coalitionspace.com\nNew York | New Jersey | Denver`}
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          style={{ ...styles.textarea, fontFamily: "monospace", fontSize: "13px" }}
          rows={4}
        />

        {/* Tips */}
        <div style={styles.tips}>
          <p style={styles.tipsTitle}>The AI will automatically detect:</p>
          <div style={styles.tipGrid}>
            <span style={styles.tip}>Space type requested</span>
            <span style={styles.tip}>⏱️ Hourly / daily / monthly</span>
            <span style={styles.tip}>Team size needs</span>
            <span style={styles.tip}>Availability &amp; urgency</span>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? "Generating reply..." : "Generate Reply →"}
        </button>
      </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b0d0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "660px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "32px",
  },
  icon: {
    fontSize: "40px",
    lineHeight: 1,
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0d1f13",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
    lineHeight: "1.5",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    marginBottom: "20px",
    boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    resize: "vertical",
    marginBottom: "20px",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
    lineHeight: "1.6",
    outline: "none",
  },
  tips: {
    background: "#f0f6ff",
    border: "1px solid #c7d9f5",
    borderRadius: "8px",
    padding: "14px 16px",
    marginBottom: "20px",
  },
  tipsTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0d1f13",
    margin: "0 0 10px 0",
  },
  tipGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
  },
  tip: {
    fontSize: "12px",
    color: "#555",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a",
    border: "1px solid #8f9aa3",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  buttonDisabled: {
    background: "#8aa8c8",
    cursor: "not-allowed",
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