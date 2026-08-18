"use client";
// src/app/admin/users/page.js
// Admin-only: create teammate logins, edit anyone's info,
// reset passwords, see who has access.

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [notice,   setNotice]   = useState("");
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({ email: "", password: "", display_name: "", role: "member" });

  // ── Manage-user modal state ──────────────────────────────
  const [selected,     setSelected]     = useState(null); // the user being managed
  const [editName,     setEditName]     = useState("");
  const [editRole,     setEditRole]     = useState("member");
  const [editSignature, setEditSignature] = useState("");
  const [newPassword,  setNewPassword]  = useState("");
  const [savingEdit,   setSavingEdit]   = useState(false);
  const [resettingPw,  setResettingPw]  = useState(false);
  const [modalNotice,  setModalNotice]  = useState("");
  const [modalError,   setModalError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    setNotice("");
    try {
      const res  = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      setNotice(`Created ${form.email}. Share the password with them directly.`);
      setForm({ email: "", password: "", display_name: "", role: "member" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function openManage(u) {
    setSelected(u);
    setEditName(u.display_name || "");
    setEditRole(u.role);
    setEditSignature(u.signature || "");
    setNewPassword("");
    setModalNotice("");
    setModalError("");
  }

  async function handleSaveEdit() {
    setSavingEdit(true);
    setModalError("");
    setModalNotice("");
    try {
      const res  = await fetch(`/api/admin/users/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: editName,
          role: editRole,
          signature: editSignature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setModalNotice("Saved.");
      await load();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) {
      setModalError("Password must be at least 6 characters.");
      return;
    }
    setResettingPw(true);
    setModalError("");
    setModalNotice("");
    try {
      const res  = await fetch(`/api/admin/users/${selected.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setModalNotice(`Password reset. Share the new password with them directly.`);
      setNewPassword("");
    } catch (err) {
      setModalError(err.message);
    } finally {
      setResettingPw(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="admin" />
      <main style={{ ...styles.page, flex: 1, minWidth: 0 }}>
        <div style={styles.container}>
          <h1 style={styles.title}>Team Members</h1>
          <p style={styles.subtitle}>Everyone here shares full access — same inbox, same data, same tools.</p>

          {error  && <p style={styles.error}>{error}</p>}
          {notice && <p style={styles.notice}>{notice}</p>}

          <div style={styles.card}>
            <p style={styles.cardTitle}>Add a Teammate</p>
            <form onSubmit={handleCreate}>
              <div style={styles.formRow}>
                <input
                  type="email" placeholder="email@coalitionspace.com" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={styles.input}
                />
                <input
                  type="text" placeholder="Display name"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formRow}>
                <input
                  type="password" placeholder="Temporary password" required minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={styles.input}
                />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={styles.select}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" disabled={creating} style={styles.createBtn}>
                {creating ? "Creating…" : "Create Account"}
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <p style={styles.cardTitle}>Existing Accounts</p>
            <p style={styles.hint}>Click anyone to edit their info or reset their password.</p>
            {loading ? (
              <p style={styles.hint}>Loading…</p>
            ) : (
              <div style={styles.userList}>
                {users.map((u) => (
                  <button key={u.id} onClick={() => openManage(u)} style={styles.userRow}>
                    <div style={styles.userLeft}>
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" style={styles.avatarImg} />
                      ) : (
                        <div style={styles.avatarFallback}>
                          {(u.display_name || u.email || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <strong style={styles.userName}>{u.display_name || u.email}</strong>
                        <p style={styles.userEmail}>{u.email}</p>
                      </div>
                    </div>
                    <span style={u.role === "admin" ? styles.adminBadge : styles.memberBadge}>
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Manage user modal ─────────────────────────────── */}
        {selected && (
          <div style={styles.overlay} onClick={() => setSelected(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>

              <div style={styles.modalHeader}>
                {selected.avatar_url ? (
                  <img src={selected.avatar_url} alt="" style={styles.modalAvatarImg} />
                ) : (
                  <div style={styles.modalAvatarFallback}>
                    {(selected.display_name || selected.email || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p style={styles.modalName}>{selected.display_name || selected.email}</p>
                  <p style={styles.modalEmail}>{selected.email}</p>
                </div>
              </div>

              {modalError  && <p style={styles.error}>{modalError}</p>}
              {modalNotice && <p style={styles.notice}>{modalNotice}</p>}

              <label style={styles.modalLabel}>Display Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={styles.input}
              />

              <label style={styles.modalLabel}>Role</label>
              <select value={editRole} onChange={(e) => setEditRole(e.target.value)} style={styles.select}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>

              <label style={styles.modalLabel}>Signature</label>
              <textarea
                value={editSignature}
                onChange={(e) => setEditSignature(e.target.value)}
                style={styles.textarea}
                rows={3}
              />

              <button onClick={handleSaveEdit} disabled={savingEdit} style={styles.saveBtn}>
                {savingEdit ? "Saving…" : "Save Changes"}
              </button>

              <div style={styles.divider} />

              <label style={styles.modalLabel}>Reset Password</label>
              <p style={styles.hint}>Sets a new password immediately. Share it with them directly.</p>
              <div style={styles.resetRow}>
                <input
                  type="text"
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                />
                <button onClick={handleResetPassword} disabled={resettingPw} style={styles.resetBtn}>
                  {resettingPw ? "Resetting…" : "Reset"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0b0d0f", padding: "32px 24px", fontFamily: "'Segoe UI', sans-serif" },
  container: { maxWidth: "640px", margin: "0 auto" },
  title:    { fontSize: "26px", fontWeight: "700", color: "#e8eaed", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#9aa0a6", margin: "0 0 24px 0" },

  card: { background: "#16191c", border: "1px solid #2a2e33", borderRadius: "12px", padding: "22px", marginBottom: "16px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#e8eaed", margin: "0 0 6px 0" },

  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" },
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #2a2e33", background: "#0b0d0f", color: "#e8eaed", fontSize: "13px", boxSizing: "border-box", width: "100%", marginBottom: "10px" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #2a2e33", background: "#0b0d0f", color: "#e8eaed", fontSize: "13px", width: "100%", marginBottom: "10px" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #2a2e33", background: "#0b0d0f", color: "#e8eaed", fontSize: "12.5px", fontFamily: "monospace", boxSizing: "border-box", resize: "vertical", marginBottom: "10px" },

  createBtn: {
    marginTop: "6px", padding: "11px 20px",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a", border: "1px solid #8f9aa3", borderRadius: "8px",
    fontSize: "13px", fontWeight: "700", cursor: "pointer",
  },

  userList: { display: "flex", flexDirection: "column", gap: "4px", marginTop: "10px" },
  userRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 8px", borderRadius: "8px", border: "none", background: "transparent",
    cursor: "pointer", width: "100%", textAlign: "left",
  },
  userLeft: { display: "flex", alignItems: "center", gap: "12px" },
  avatarImg: { width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" },
  avatarFallback: {
    width: "34px", height: "34px", borderRadius: "50%",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", fontWeight: "700",
  },
  userName: { fontSize: "13.5px", color: "#e8eaed" },
  userEmail: { fontSize: "11.5px", color: "#9aa0a6", margin: "2px 0 0 0" },
  adminBadge: { fontSize: "10.5px", fontWeight: "700", color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "3px 10px", borderRadius: "99px", textTransform: "uppercase" },
  memberBadge: { fontSize: "10.5px", fontWeight: "700", color: "#9aa0a6", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "99px", textTransform: "uppercase" },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", zIndex: 50 },
  modal: { background: "#fff", borderRadius: "14px", padding: "32px", maxWidth: "440px", width: "100%", maxHeight: "88vh", overflowY: "auto", position: "relative" },
  closeBtn: { position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" },

  modalHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  modalAvatarImg: { width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" },
  modalAvatarFallback: {
    width: "48px", height: "48px", borderRadius: "50%",
    background: "#1e3a5f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px", fontWeight: "700",
  },
  modalName: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", margin: 0 },
  modalEmail: { fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" },

  modalLabel: { display: "block", fontSize: "11.5px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px", marginTop: "4px" },

  saveBtn: { width: "100%", padding: "11px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" },

  divider: { height: "1px", background: "#e2e8f0", margin: "20px 0" },

  resetRow: { display: "flex", gap: "8px", alignItems: "flex-start" },
  resetBtn: { padding: "10px 16px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "12.5px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" },

  hint: { fontSize: "12px", color: "#9aa0a6", marginBottom: "10px" },
  error: { color: "#dc2626", fontSize: "13px", marginBottom: "12px", padding: "10px", background: "#fef2f2", borderRadius: "6px" },
  notice: { color: "#16a34a", fontSize: "13px", marginBottom: "12px", padding: "10px", background: "rgba(52,211,153,0.08)", borderRadius: "6px" },
};
