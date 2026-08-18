"use client";
// src/components/Sidebar.js

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const NAV_ITEMS = [
  { key: "inbox",     label: "Inbox",       path: "/inbox"     },
  { key: "batch",     label: "Batch",       path: "/batch"     },
  { key: "sent",      label: "Sent",        path: "/sent"      },
  { key: "followups", label: "Follow-Ups",  path: "/followups" },
  { key: "settings",  label: "Settings",    path: "/settings"  },
  { key: "manual",    label: "Paste Email", path: "/manual"    },
];

const ADMIN_ITEMS = [
  { key: "admin", label: "Team", path: "/admin/users" },
];

export default function Sidebar({ active }) {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch("/api/profile/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setProfile(data.profile))
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const items = profile?.role === "admin" ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;
  const isAdmin = profile?.role === "admin";
  const initials = (profile?.display_name || profile?.email || "?").charAt(0).toUpperCase();

  return (
    <nav style={styles.sidebar}>
      {/* User identity — front and center */}
      <button
        onClick={() => router.push("/account")}
        style={active === "account" ? { ...styles.userCard, ...styles.userCardActive } : styles.userCard}
      >
        <div style={styles.avatarWrap}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarFallback}>{initials}</div>
          )}
          {isAdmin && <span style={styles.crown}>★</span>}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            {profile ? (profile.display_name || profile.email) : "…"}
          </span>
          {isAdmin && <span style={styles.adminPill}>Admin</span>}
        </div>
      </button>

      <div style={styles.brand}>
        <span style={styles.brandText}>Coalition Space</span>
      </div>

      <div style={styles.nav}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.path)}
            style={active === item.key ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div style={styles.footer}>
        <button onClick={handleSignOut} style={styles.signOutBtn}>Sign Out</button>
      </div>
    </nav>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    minWidth: "220px",
    minHeight: "100vh",
    background: "#101214",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    padding: "20px 16px",
    fontFamily: "'Segoe UI', sans-serif",
    position: "sticky",
    top: 0,
  },

  userCard: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px", borderRadius: "10px",
    border: "1px solid transparent", background: "transparent",
    cursor: "pointer", width: "100%", textAlign: "left",
    marginBottom: "18px",
  },
  userCardActive: { background: "rgba(255,255,255,0.06)", border: "1px solid #2a2e33" },

  avatarWrap: { position: "relative", flexShrink: 0 },
  avatarImg: {
    width: "38px", height: "38px", borderRadius: "50%",
    objectFit: "cover", border: "1px solid #2a2e33",
  },
  avatarFallback: {
    width: "38px", height: "38px", borderRadius: "50%",
    background: "linear-gradient(180deg, #e4e7eb 0%, #b8c0c9 100%)",
    color: "#14251a", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "15px", fontWeight: "700",
  },
  crown: {
    position: "absolute", top: "-4px", right: "-4px",
    fontSize: "13px", color: "#fbbf24",
    background: "#101214", borderRadius: "50%",
    width: "16px", height: "16px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  userInfo: { display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 },
  userName: {
    fontSize: "13px", fontWeight: "700", color: "#e8eaed",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  adminPill: {
    fontSize: "9.5px", fontWeight: "700", color: "#34d399",
    background: "rgba(52,211,153,0.12)", padding: "2px 7px",
    borderRadius: "99px", textTransform: "uppercase",
    width: "fit-content",
  },

  brand: { padding: "0 8px", marginBottom: "18px" },
  brandText: { color: "#6b7278", fontWeight: "600", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.5px" },

  nav: { display: "flex", flexDirection: "column", gap: "2px" },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 12px", borderRadius: "6px",
    border: "1px solid transparent", borderLeft: "2px solid transparent",
    background: "transparent", color: "#8b9198",
    fontSize: "14px", fontWeight: "500", cursor: "pointer",
    textAlign: "left", width: "100%",
  },
  navItemActive: {
    background: "rgba(52, 211, 153, 0.08)",
    borderLeft: "2px solid #34d399",
    color: "#e8eaed",
    fontWeight: "600",
  },

  footer: { marginTop: "auto" },
  signOutBtn: {
    width: "100%", padding: "9px 12px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)", color: "#6b7278",
    borderRadius: "6px", fontSize: "12px", cursor: "pointer",
  },
};
