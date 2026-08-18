"use client";
// src/app/login/page.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode,  setMfaCode]  = useState("");
  const [stage,    setStage]    = useState("password"); // "password" | "mfa"
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

      // Does this account have MFA enrolled and does the session
      // need a second factor before it's fully authenticated?
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
              style={{ ...styles.input, textAlign: "center", fontSize: "22px", letterSpacing: "6px" }}
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
    background: "#0b0d0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#16191c",
    border: "1px solid #2a2e33",
    borderRadius: "14px",
    padding: "40px",
    width: "100%",
    maxWidth: "380px",
  },
  title:    { fontSize: "22px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#9aa0a6", margin: "0 0 24px 0" },
  label: {
    display: "block", fontSize: "12px", fontWeight: "600",
    color: "#9aa0a6", marginBottom: "6px", marginTop: "14px",
  },
  input: {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #2a2e33", background: "#0b0d0f", color: "#e8eaed",
    fontSize: "14px", boxSizing: "border-box", outline: "none",
  },
  button: {
    width: "100%", marginTop: "22px", padding: "13px",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a", border: "1px solid #8f9aa3", borderRadius: "8px",
    fontSize: "14px", fontWeight: "700", cursor: "pointer",
  },
  mfaNote: { fontSize: "13px", color: "#9aa0a6", marginBottom: "14px" },
  error: {
    color: "#dc2626", fontSize: "13px", marginBottom: "14px",
    padding: "10px", background: "#fef2f2", borderRadius: "6px",
  },
};
