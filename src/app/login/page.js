"use client";
// src/app/login/page.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { colors, glass, pageBackground } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode,  setMfaCode]  = useState("");
  const [stage,    setStage]    = useState("password");
  const [factorId, setFactorId] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.[0];
        if (!totpFactor) throw new Error("MFA required but no factor found.");
        setFactorId(totpFactor.id);
        setStage("mfa");
      } else {
        router.push("/inbox");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeErr) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: mfaCode,
      });
      if (verifyErr) throw verifyErr;

      router.push("/inbox");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Coalition Space</h1>
        <p style={styles.subtitle}>Sign in to the email reply bot</p>

        {error && <p style={styles.error}>{error}</p>}

        {stage === "password" ? (
          <form onSubmit={handlePasswordSubmit}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit}>
            <p style={styles.mfaNote}>Enter the 6-digit code from your authenticator app.</p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              style={{ ...styles.input, textAlign: "center", fontSize: "22px", letterSpacing: "8px" }}
              autoFocus
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Verifying…" : "Verify"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    ...pageBackground,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "24px",
  },
  card: {
    ...glass.panelStrong,
    padding: "44px 40px",
    width: "100%",
    maxWidth: "400px",
  },
  title:    { fontSize: "23px", fontWeight: "700", color: colors.textPrimary, margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: colors.textSecondary, margin: "0 0 26px 0" },
  label: {
    display: "block", fontSize: "12px", fontWeight: "600",
    color: colors.textSecondary, marginBottom: "6px", marginTop: "16px",
  },
  input: {
    ...glass.input,
    width: "100%", padding: "12px 16px",
    fontSize: "14px", boxSizing: "border-box",
  },
  button: {
    ...glass.buttonPrimary,
    width: "100%", marginTop: "26px", padding: "14px",
    fontSize: "14.5px",
  },
  mfaNote: { fontSize: "13px", color: colors.textSecondary, marginBottom: "16px", lineHeight: "1.5" },
  error: {
    color: "#fca5a5", fontSize: "13px", marginBottom: "14px",
    padding: "11px 14px", background: colors.dangerSoft,
    border: "1px solid rgba(248,113,113,0.25)", borderRadius: "12px",
  },
};
