"use client";
// src/app/admin/system/page.js
// ─────────────────────────────────────────────────────────
// Admin-only diagnostics. Run a full health check across every
// component, and force-seed a test email through the real
// pipeline to prove ingestion + heuristic + classifier are
// actually working end to end — not waiting around for real
// mail to eventually reveal a problem.
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function SystemPage() {
  const [checks,     setChecks]     = useState(null);
  const [checking,   setChecking]   = useState(false);
  const [checkedAt,  setCheckedAt]  = useState(null);
  const [error,      setError]      = useState("");

  const [seeding,    setSeeding]    = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [seedError,  setSeedError]  = useState("");

  const [clearing,   setClearing]   = useState(false);
  const [clearNotice, setClearNotice] = useState("");

  async function runHealthCheck() {
    setChecking(true);
    setError("");
    try {
      const res  = await fetch("/api/health");
      const data = await res.json();
      if (!res.ok && !data.checks) throw new Error(data.error || "Health check failed");
      setChecks(data.checks);
      setCheckedAt(data.checkedAt);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  async function handleForceSeed() {
    setSeeding(true);
    setSeedError("");
    setSeedResult(null);
    try {
      const res  = await fetch("/api/health/reseed", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Force seed failed");
      setSeedResult(data);
    } catch (err) {
      setSeedError(err.message);
    } finally {
      setSeeding(false);
    }
  }

  async function handleClearTestEmails() {
    setClearing(true);
    setClearNotice("");
    try {
      const res  = await fetch("/api/health/reseed", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Cleanup failed");
      setClearNotice(`Removed ${data.deleted} test email(s).`);
      setSeedResult(null);
    } catch (err) {
      setClearNotice(`Error: ${err.message}`);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="system" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
        <div style={styles.container}>
          <h1 style={styles.title}>System Diagnostics</h1>
          <p style={styles.subtitle}>
            Check every component the app depends on, or force a test email through the real pipeline to see exactly where something's broken.
          </p>

          {/* ── Health check ─────────────────────────────── */}
          <div style={styles.card}>
            <div style={styles.rowBetween}>
              <div>
                <p style={styles.cardTitle}>Health Check</p>
                <p style={styles.hint}>
                  {checkedAt ? `Last checked ${new Date(checkedAt).toLocaleString()}` : "Not run yet"}
                </p>
              </div>
              <button onClick={runHealthCheck} disabled={checking} style={styles.runBtn}>
                {checking ? "Checking…" : "Run Health Check"}
              </button>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {checks && (
              <div style={styles.checkList}>
                {checks.map((c, i) => (
                  <div key={i} style={styles.checkRow}>
                    <span style={c.ok ? styles.dotOk : styles.dotFail} />
                    <div style={{ flex: 1 }}>
                      <div style={styles.checkTop}>
                        <strong style={styles.checkLabel}>{c.label}</strong>
                        {c.latencyMs !== undefined && (
                          <span style={styles.latency}>{c.latencyMs}ms</span>
                        )}
                      </div>
                      <p style={c.ok ? styles.checkDetailOk : styles.checkDetailFail}>{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Force seed test email ────────────────────── */}
          <div style={styles.card}>
            <p style={styles.cardTitle}>Force Seed Test Email</p>
            <p style={styles.hint}>
              Injects one synthetic email through the real pipeline — database write, keyword heuristic, and
              local classifier — so you can immediately see which stage fails instead of waiting for real mail.
              It'll also show up in your normal Inbox queue, clearly tagged, safe to reject or delete.
            </p>

            <div style={styles.actionRow}>
              <button onClick={handleForceSeed} disabled={seeding} style={styles.runBtn}>
                {seeding ? "Running…" : "Force Seed Test Email"}
              </button>
              <button onClick={handleClearTestEmails} disabled={clearing} style={styles.clearBtn}>
                {clearing ? "Clearing…" : "Clear All Test Emails"}
              </button>
            </div>

            {clearNotice && <p style={styles.notice}>{clearNotice}</p>}
            {seedError && <p style={styles.error}>{seedError}</p>}

            {seedResult && (
              <div style={styles.pipelineResult}>
                <p style={styles.cardTitle}>Pipeline Result — Email #{seedResult.email.id}</p>

                <div style={styles.pipelineStep}>
                  <span style={styles.dotOk} />
                  <span>Database write — succeeded</span>
                </div>
                <div style={styles.pipelineStep}>
                  <span style={seedResult.pipeline.heuristicRan ? styles.dotOk : styles.dotFail} />
                  <span>
                    Keyword heuristic — {seedResult.pipeline.heuristicRan
                      ? `ran (predicted ${seedResult.email.heuristic_prediction ? "valid" : "spam"})`
                      : "did not run"}
                  </span>
                </div>
                <div style={styles.pipelineStep}>
                  <span style={seedResult.pipeline.classifierRan ? styles.dotOk : styles.dotFail} />
                  <span>Classifier — {seedResult.pipeline.classifierResult}</span>
                </div>

                <p style={styles.hint}>
                  Check <a href="/inbox" style={{ color: "#34d399" }}>/inbox</a> to see this email with both badges live.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0b0d0f", padding: "32px 24px", fontFamily: "'Segoe UI', sans-serif" },
  container: { maxWidth: "680px", margin: "0 auto" },
  title:    { fontSize: "26px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#9aa0a6", margin: "0 0 24px 0", lineHeight: "1.5" },

  card: { background: "#16191c", border: "1px solid #2a2e33", borderRadius: "12px", padding: "22px", marginBottom: "16px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  hint: { fontSize: "12.5px", color: "#9aa0a6", lineHeight: "1.5", margin: "0 0 10px 0" },

  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" },

  runBtn: {
    padding: "10px 18px",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a", border: "1px solid #8f9aa3", borderRadius: "8px",
    fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap",
  },
  clearBtn: {
    padding: "10px 18px", background: "transparent", color: "#dc2626",
    border: "1px solid #dc2626", borderRadius: "8px", fontSize: "13px",
    fontWeight: "600", cursor: "pointer",
  },
  actionRow: { display: "flex", gap: "10px", marginTop: "10px" },

  checkList: { marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" },
  checkRow: { display: "flex", gap: "10px", alignItems: "flex-start" },
  checkTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  checkLabel: { fontSize: "13.5px", color: "#e8eaed" },
  latency: { fontSize: "11px", color: "#6b7278" },
  checkDetailOk:   { fontSize: "12px", color: "#8fae94", margin: "2px 0 0 0" },
  checkDetailFail: { fontSize: "12px", color: "#f87171", margin: "2px 0 0 0" },

  dotOk:   { width: "9px", height: "9px", borderRadius: "50%", background: "#34d399", marginTop: "4px", flexShrink: 0 },
  dotFail: { width: "9px", height: "9px", borderRadius: "50%", background: "#f87171", marginTop: "4px", flexShrink: 0 },

  pipelineResult: { marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #2a2e33" },
  pipelineStep: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#c8ccd0", marginBottom: "6px" },

  notice: { color: "#16a34a", fontSize: "13px", marginTop: "10px", padding: "10px", background: "rgba(52,211,153,0.08)", borderRadius: "6px" },
  error:  { color: "#f87171", fontSize: "13px", marginTop: "10px", padding: "10px", background: "rgba(220,38,38,0.1)", borderRadius: "6px" },
};
