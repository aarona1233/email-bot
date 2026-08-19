"use client";
// src/app/account/mfa/page.js
// TOTP MFA enrollment: enroll -> scan QR -> verify code -> done.

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/browser";

// Converts the raw SVG string Supabase returns into something every
// browser can actually render. "data:image/svg+xml;utf8,..." looks
// standard but "utf8" isn't a real MIME charset token in this
// position — Firefox tolerates it as a shorthand, Chrome/Safari/Edge
// are inconsistent. Base64 is universally supported everywhere, so
// that's the safe default. Also handles the case where a different
// SDK version hands back an already-complete data URI instead of
// raw SVG markup, so this works regardless of what shape comes back.
function svgToDataUri(svgString) {
  if (!svgString) return "";
  if (svgString.startsWith("data:")) return svgString;

  try {
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (err) {
    console.error("[MFA] base64 encode failed, falling back to percent-encoding:", err);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  }
}

export default function MfaSetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [factors,  setFactors]  = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode,   setQrCode]   = useState(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [secret,   setSecret]   = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [code,     setCode]     = useState("");
  const [error,    setError]    = useState("");
  const [notice,   setNotice]   = useState("");
  const [busy,     setBusy]     = useState(false);

  const loadFactors = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp || []);
  }, [supabase]);

  useEffect(() => { loadFactors(); }, [loadFactors]);

  async function startEnroll() {
    setBusy(true);
    setError("");
    try {
      // The collision is on friendly_name, not status — every factor
      // defaults to an empty friendly name, so ANY existing factor
      // (verified or not) blocks a new enrollment. Since this app
      // only supports one active factor per person anyway, clear
      // out everything first for a guaranteed clean slate.
      const { data: existingFactors, error: listErr } = await supabase.auth.mfa.listFactors();
      if (listErr) throw listErr;

      for (const stale of existingFactors?.totp || []) {
        const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId: stale.id });
        if (unenrollErr) {
          throw new Error(`Couldn't remove existing factor before re-enrolling: ${unenrollErr.message}`);
        }
      }

      // Unique name too, as a second layer of defense against
      // the exact collision that caused this in the first place.
      const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `authenticator-${Date.now()}`,
      });
      if (enrollErr) throw enrollErr;

      console.log("[MFA enroll] response:", data);

      if (!data?.totp?.qr_code) {
        throw new Error("Supabase didn't return a QR code in the response — check the browser console for the raw response.");
      }

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setImgFailed(false);
      setEnrolling(true);
    } catch (err) {
      console.error("[MFA enroll] failed:", err);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyEnroll() {
    setBusy(true);
    setError("");
    try {
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeErr) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId, challengeId: challenge.id, code,
      });
      if (verifyErr) throw verifyErr;

      setNotice("MFA enabled!");
      setEnrolling(false);
      setQrCode(null);
      await loadFactors();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnenroll(factorId) {
    setBusy(true);
    setError("");
    try {
      const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId });
      if (unenrollErr) throw unenrollErr;
      await loadFactors();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="account" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
        <div style={styles.container}>
          <button onClick={() => router.push("/account")} style={styles.backBtn}>← Back</button>
          <h1 style={styles.title}>Two-Factor Authentication</h1>
          <p style={styles.subtitle}>Requires a code from an authenticator app (Google Authenticator, Authy, etc.) at login.</p>

          {error  && <p style={styles.error}>{error}</p>}
          {notice && <p style={styles.notice}>{notice}</p>}

          {factors.length > 0 && !enrolling && (
            <div style={styles.card}>
              <p style={styles.cardTitle}>Enabled</p>
              {factors.map((f) => (
                <div key={f.id} style={styles.factorRow}>
                  <span style={styles.hint}>{f.friendly_name || "Authenticator"} — added {new Date(f.created_at).toLocaleDateString()}</span>
                  <button onClick={() => handleUnenroll(f.id)} disabled={busy} style={styles.removeBtn}>Remove</button>
                </div>
              ))}
            </div>
          )}

          {!enrolling && factors.length === 0 && (
            <div style={styles.card}>
              <p style={styles.cardTitle}>Not enabled</p>
              <p style={styles.hint}>Add an authenticator app for a second layer of security.</p>
              <button onClick={startEnroll} disabled={busy} style={styles.enrollBtn}>
                Set Up Authenticator
              </button>
            </div>
          )}

          {enrolling && qrCode && (
            <div style={styles.card}>
              <p style={styles.cardTitle}>Scan this QR code</p>
              <div style={styles.qrWrap}>
                {imgFailed ? (
                  <p style={{ fontSize: "12px", color: "#dc2626", textAlign: "center", margin: 0 }}>
                    QR image failed to render in this browser — no problem, just use the manual code below instead.
                  </p>
                ) : (
                  <img
                    src={svgToDataUri(qrCode)}
                    alt="MFA QR code"
                    style={styles.qrImg}
                    onError={() => setImgFailed(true)}
                  />
                )}
              </div>
              <p style={styles.hint}>Can't scan? Enter this code manually: <code style={styles.secretCode}>{secret}</code></p>

              <label style={styles.label}>Enter the 6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ ...styles.input, textAlign: "center", fontSize: "20px", letterSpacing: "6px" }}
              />
              <button onClick={verifyEnroll} disabled={busy} style={styles.enrollBtn}>
                {busy ? "Verifying…" : "Verify & Enable"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0b0d0f", padding: "32px 24px", fontFamily: "'Segoe UI', sans-serif" },
  container: { maxWidth: "480px", margin: "0 auto" },
  backBtn: { background: "none", border: "none", color: "#34d399", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "16px", padding: 0 },
  title:    { fontSize: "22px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#9aa0a6", margin: "0 0 24px 0", lineHeight: "1.5" },

  card: { background: "#16191c", border: "1px solid #2a2e33", borderRadius: "12px", padding: "22px", marginBottom: "16px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#e8eaed", margin: "0 0 8px 0" },
  hint: { fontSize: "12.5px", color: "#9aa0a6", lineHeight: "1.5" },

  factorRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" },
  removeBtn: { padding: "6px 12px", background: "transparent", color: "#dc2626", border: "1px solid #dc2626", borderRadius: "6px", fontSize: "11.5px", cursor: "pointer" },

  qrWrap: { display: "flex", justifyContent: "center", background: "#fff", padding: "16px", borderRadius: "10px", marginBottom: "12px" },
  qrImg: { width: "180px", height: "180px" },
  secretCode: { background: "#0b0d0f", padding: "2px 6px", borderRadius: "4px", color: "#34d399" },

  label: { display: "block", fontSize: "12.5px", fontWeight: "700", color: "#e8eaed", margin: "14px 0 6px 0" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #2a2e33", background: "#0b0d0f", color: "#e8eaed", boxSizing: "border-box" },

  enrollBtn: {
    width: "100%", marginTop: "14px", padding: "12px",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a", border: "1px solid #8f9aa3", borderRadius: "8px",
    fontSize: "13px", fontWeight: "700", cursor: "pointer",
  },
  error: { color: "#dc2626", fontSize: "13px", marginBottom: "12px", padding: "10px", background: "#fef2f2", borderRadius: "6px" },
  notice: { color: "#16a34a", fontSize: "13px", marginBottom: "12px", padding: "10px", background: "rgba(52,211,153,0.08)", borderRadius: "6px" },
};
