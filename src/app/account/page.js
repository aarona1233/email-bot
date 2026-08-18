"use client";
// src/app/account/page.js
// ─────────────────────────────────────────────────────────
// Every user lands here to set up their own signature — the
// one that gets used whenever THEY personally review and send
// an email. Also the entry point for MFA setup and profile
// picture upload.
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/browser";

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const [notice,    setNotice]    = useState("");
  const [mfaFactors, setMfaFactors] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/profile/me");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load profile");
      setProfile(data.profile);

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      setMfaFactors(factorsData?.totp || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: profile.display_name,
          signature:    profile.signature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setProfile(data.profile);
      setNotice("Saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setNotice("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res  = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setProfile(data.profile);
      setNotice("Profile picture updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading || !profile) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar active="account" />
        <main style={{ ...styles.page, flex: 1 }}><p style={styles.muted}>Loading…</p></main>
      </div>
    );
  }

  const initials = (profile.display_name || profile.email || "?").charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="account" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
        <div style={styles.container}>
          <h1 style={styles.title}>My Account</h1>
          <p style={styles.subtitle}>{profile.email}{profile.role === "admin" ? " · Admin" : ""}</p>

          {error  && <p style={styles.error}>{error}</p>}
          {notice && <p style={styles.notice}>{notice}</p>}

          {/* Profile picture */}
          <div style={styles.card}>
            <div style={styles.avatarRow}>
              <div style={styles.avatarWrap}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" style={styles.avatarImg} />
                ) : (
                  <div style={styles.avatarFallback}>{initials}</div>
                )}
              </div>
              <div>
                <p style={styles.cardTitle}>Profile Picture</p>
                <p style={styles.hint}>PNG, JPEG, WebP, or GIF — under 3MB.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                  id="avatar-upload"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={styles.uploadBtn}
                >
                  {uploading ? "Uploading…" : "Change Picture"}
                </button>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>Display Name</label>
            <input
              type="text"
              value={profile.display_name || ""}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              style={styles.input}
            />

            <label style={styles.label}>
              Your Signature — make it yours
            </label>
            <p style={styles.hint}>
              This goes on every email YOU personally review and send. Fully autonomous
              AI sends (like automatic follow-ups) never use this — those use a separate
              signature an admin controls in Settings.
            </p>
            <textarea
              value={profile.signature || ""}
              onChange={(e) => setProfile({ ...profile, signature: e.target.value })}
              style={styles.textarea}
              rows={4}
              placeholder={`Jane Smith | Sales Manager, Coalition Space\n(212) 555-0000 | jane@coalitionspace.com`}
            />

            <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          <div style={styles.card}>
            <div style={styles.rowBetween}>
              <div>
                <p style={styles.cardTitle}>Two-Factor Authentication</p>
                <p style={styles.hint}>
                  {mfaFactors.length > 0
                    ? "Enabled — your account requires a code at login."
                    : "Not enabled yet. Recommended for production use."}
                </p>
              </div>
              <button onClick={() => router.push("/account/mfa")} style={styles.mfaBtn}>
                {mfaFactors.length > 0 ? "Manage" : "Set Up"}
              </button>
            </div>
          </div>

          <button onClick={handleSignOut} style={styles.signOutBtn}>
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0b0d0f", padding: "32px 24px", fontFamily: "'Segoe UI', sans-serif" },
  container: { maxWidth: "560px", margin: "0 auto" },
  title:    { fontSize: "26px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#9aa0a6", margin: "0 0 24px 0" },

  card: {
    background: "#16191c", border: "1px solid #2a2e33", borderRadius: "12px",
    padding: "22px", marginBottom: "16px",
  },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center" },

  avatarRow: { display: "flex", alignItems: "center", gap: "18px" },
  avatarWrap: { flexShrink: 0 },
  avatarImg: {
    width: "64px", height: "64px", borderRadius: "50%",
    objectFit: "cover", border: "2px solid #2a2e33",
  },
  avatarFallback: {
    width: "64px", height: "64px", borderRadius: "50%",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "24px", fontWeight: "700",
  },
  uploadBtn: {
    marginTop: "8px", padding: "8px 14px", background: "transparent",
    color: "#34d399", border: "1px solid #34d399", borderRadius: "7px",
    fontSize: "12px", fontWeight: "700", cursor: "pointer",
  },

  label: { display: "block", fontSize: "12.5px", fontWeight: "700", color: "#e8eaed", marginBottom: "6px", marginTop: "14px" },
  hint:  { fontSize: "12px", color: "#9aa0a6", margin: "0 0 10px 0", lineHeight: "1.5" },
  input: {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #2a2e33", background: "#0b0d0f", color: "#e8eaed",
    fontSize: "14px", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "12px 14px", borderRadius: "8px",
    border: "1px solid #2a2e33", background: "#0b0d0f", color: "#e8eaed",
    fontSize: "13px", fontFamily: "monospace", boxSizing: "border-box", resize: "vertical",
  },
  saveBtn: {
    marginTop: "16px", padding: "11px 20px",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a", border: "1px solid #8f9aa3", borderRadius: "8px",
    fontSize: "13px", fontWeight: "700", cursor: "pointer",
  },
  mfaBtn: {
    padding: "9px 16px", background: "transparent", color: "#34d399",
    border: "1px solid #34d399", borderRadius: "8px", fontSize: "12.5px",
    fontWeight: "700", cursor: "pointer",
  },
  signOutBtn: {
    padding: "11px 20px", background: "transparent", color: "#dc2626",
    border: "1px solid #dc2626", borderRadius: "8px", fontSize: "13px",
    fontWeight: "600", cursor: "pointer",
  },
  muted: { color: "#9aa0a6", fontSize: "14px" },
  error: { color: "#dc2626", fontSize: "13px", marginBottom: "12px", padding: "10px", background: "#fef2f2", borderRadius: "6px" },
  notice: { color: "#16a34a", fontSize: "13px", marginBottom: "12px", padding: "10px", background: "rgba(52,211,153,0.08)", borderRadius: "6px" },
};
