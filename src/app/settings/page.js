"use client";
// src/app/settings/page.js


import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error,    setError]    = useState("");
  const [notice,   setNotice]   = useState("");
  const [scanResult, setScanResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/followups/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load settings");
      setSettings(data.settings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function update(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/followups/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled:             settings.enabled,
          wait_days:           Number(settings.wait_days),
          max_follow_ups:      Number(settings.max_follow_ups),
          scan_interval_hours: Number(settings.scan_interval_hours),
          auto_send:           settings.auto_send,
          paused_until:        settings.paused_until || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSettings(data.settings);
      setNotice("Settings saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleScanNow() {
    setScanning(true);
    setError("");
    setScanResult(null);
    try {
      const res  = await fetch("/api/followups/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setScanResult(data);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  }

  if (loading || !settings) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar active="settings" />
        <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
          <p style={styles.muted}>Loading…</p>
        </main>
      </div>
    );
  }

  const isPaused = settings.paused_until && new Date(settings.paused_until) > new Date();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="settings" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
        <div style={styles.container}>

          <h1 style={styles.title}>Follow-Up Settings</h1>
          <p style={styles.subtitle}>
            Controls the automatic nudge sent to customers who never replied.
          </p>

          {isPaused && (
            <div style={styles.pausedBanner}>
              Paused until {new Date(settings.paused_until).toLocaleDateString()} : no follow-ups will be created or sent until then.
            </div>
          )}

          {error  && <p style={styles.error}>{error}</p>}
          {notice && <p style={styles.notice}>{notice}</p>}

          {/* Master toggle */}
          <div style={styles.card}>
            <div style={styles.rowBetween}>
              <div>
                <p style={styles.cardTitle}>Enable Follow-Ups</p>
                <p style={styles.cardSub}>Master switch, turn the whole system off without losing your settings.</p>
              </div>
              <Toggle checked={settings.enabled} onChange={(v) => update("enabled", v)} />
            </div>
          </div>

          {/* Wait days + max follow-ups */}
          <div style={styles.cardRow}>
            <div style={styles.card}>
              <p style={styles.cardTitle}>Wait Period</p>
              <p style={styles.cardSub}>Days of silence before a nudge is drafted.</p>
              <div style={styles.numberRow}>
                <input
                  type="number"
                  min="0"
                  value={settings.wait_days}
                  onChange={(e) => update("wait_days", e.target.value)}
                  style={styles.numberInput}
                />
                <span style={styles.numberUnit}>days</span>
              </div>
            </div>

            <div style={styles.card}>
              <p style={styles.cardTitle}>Max Follow-Ups</p>
              <p style={styles.cardSub}>How many times to nudge one customer, ever.</p>
              <div style={styles.numberRow}>
                <input
                  type="number"
                  min="1"
                  value={settings.max_follow_ups}
                  onChange={(e) => update("max_follow_ups", e.target.value)}
                  style={styles.numberInput}
                />
                <span style={styles.numberUnit}>max</span>
              </div>
            </div>
          </div>

          {/* Scan interval */}
          <div style={styles.card}>
            <p style={styles.cardTitle}>Scan Frequency</p>
            <p style={styles.cardSub}>
              How often the background scanner checks the database for silent customers.
              A short interval doesn't send more often than your wait period allows it just checks more precisely.
            </p>
            <div style={styles.numberRow}>
              <input
                type="number"
                min="1"
                step="0.5"
                value={settings.scan_interval_hours}
                onChange={(e) => update("scan_interval_hours", e.target.value)}
                style={styles.numberInput}
              />
              <span style={styles.numberUnit}>hours between scans</span>
            </div>
          </div>

          {/* Auto-send toggle */}
          <div style={styles.card}>
            <div style={styles.rowBetween}>
              <div>
                <p style={styles.cardTitle}>Auto-Send</p>
                <p style={styles.cardSub}>
                  {settings.auto_send
                    ? "Follow-ups send automatically; no human click required."
                    : "Follow-ups wait in the queue for a human to approve and send."}
                </p>
              </div>
              <Toggle checked={settings.auto_send} onChange={(v) => update("auto_send", v)} />
            </div>
          </div>

          {/* Pause until */}
          <div style={styles.card}>
            <p style={styles.cardTitle}>Pause Until</p>
            <p style={styles.cardSub}>
              Holidays, staff out of office, anything where you don't want the bot nagging
              customers.
            </p>
            <div style={styles.numberRow}>
              <input
                type="date"
                value={settings.paused_until ? settings.paused_until.slice(0, 10) : ""}
                onChange={(e) => update("paused_until", e.target.value ? `${e.target.value}T00:00:00Z` : null)}
                style={styles.dateInput}
              />
              {settings.paused_until && (
                <button onClick={() => update("paused_until", null)} style={styles.clearBtn}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div style={styles.actions}>
            <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving…" : "Save Settings"}
            </button>
            <button onClick={handleScanNow} disabled={scanning} style={styles.scanBtn}>
              {scanning ? "Scanning…" : "Scan Now"}
            </button>
          </div>

          {settings.last_scan_at && (
            <p style={styles.lastScan}>
              Last scan: {new Date(settings.last_scan_at).toLocaleString()}
            </p>
          )}

          {scanResult && (
            <div style={styles.scanResultBox}>
              <p style={styles.cardTitle}>Last Manual Scan Result</p>
              {scanResult.ran ? (
                <p style={styles.cardSub}>
                  Found {scanResult.candidatesFound} candidate(s) — {scanResult.created} queued for review, {scanResult.sent} auto-sent, {scanResult.errors} error(s).
                </p>
              ) : (
                <p style={styles.cardSub}>Did not run: {scanResult.reason}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        ...styles.toggle,
        background: checked ? "#34d399" : "#2a2e33",
      }}
    >
      <span style={{
        ...styles.toggleKnob,
        transform: checked ? "translateX(20px)" : "translateX(2px)",
      }} />
    </button>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b0d0f",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: { maxWidth: "700px", margin: "0 auto" },

  title:    { fontSize: "26px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  subtitle: { fontSize: "14px", color: "#9aa0a6", margin: "0 0 24px 0" },

  pausedBanner: {
    background: "rgba(52,211,153,0.08)",
    border: "1px solid #34d399",
    color: "#34d399",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "13px",
    marginBottom: "20px",
  },

  card: {
    background: "#16191c",
    border: "1px solid #2a2e33",
    borderRadius: "12px",
    padding: "20px 22px",
    marginBottom: "16px",
  },
  cardRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  cardSub:   { fontSize: "12.5px", color: "#9aa0a6", margin: "0 0 14px 0", lineHeight: "1.5" },

  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center" },

  numberRow: { display: "flex", alignItems: "center", gap: "10px" },
  numberInput: {
    width: "90px",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #2a2e33",
    background: "#0b0d0f",
    color: "#e8eaed",
    fontSize: "14px",
  },
  numberUnit: { fontSize: "13px", color: "#9aa0a6" },
  dateInput: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #2a2e33",
    background: "#0b0d0f",
    color: "#e8eaed",
    fontSize: "13px",
  },
  clearBtn: {
    padding: "9px 14px",
    background: "transparent",
    border: "1px solid #2a2e33",
    color: "#9aa0a6",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer",
  },

  toggle: {
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    border: "none",
    position: "relative",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
  },
  toggleKnob: {
    position: "absolute",
    top: "2px",
    left: 0,
    width: "20px",
    height: "20px",
    borderRadius: "10px",
    background: "#fff",
    transition: "transform 0.15s",
  },

  actions: { display: "flex", gap: "10px", marginTop: "8px" },
  saveBtn: {
    flex: 1,
    padding: "13px",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a",
    border: "1px solid #8f9aa3",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  scanBtn: {
    flex: 1,
    padding: "13px",
    background: "transparent",
    color: "#34d399",
    border: "1px solid #34d399",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  lastScan: { fontSize: "11.5px", color: "#6b7278", marginTop: "10px" },

  scanResultBox: {
    marginTop: "16px",
    background: "#16191c",
    border: "1px solid #2a2e33",
    borderRadius: "10px",
    padding: "16px 18px",
  },

  muted: { color: "#9aa0a6", fontSize: "14px" },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "12px",
    padding: "10px",
    background: "#fef2f2",
    borderRadius: "6px",
  },
  notice: {
    color: "#16a34a",
    fontSize: "13px",
    marginBottom: "12px",
    padding: "10px",
    background: "rgba(52,211,153,0.08)",
    borderRadius: "6px",
  },
};
