"use client";
// src/components/Sidebar.js
// ─────────────────────────────────────────────────────────
// Shared navigation sidebar. Import into any page:
//
//   import Sidebar from "@/components/Sidebar";
//   ...
//   <div style={{ display: "flex" }}>
//     <Sidebar active="inbox" />
//     <main style={{ flex: 1 }}> ...page content... </main>
//   </div>
// ─────────────────────────────────────────────────────────

import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { key: "inbox",  label: "Inbox",       icon: "📥", path: "/inbox"  },
  { key: "batch",  label: "Batch",       icon: "⚡", path: "/batch"  },
  { key: "manual", label: "Paste Email", icon: "✍️", path: "/manual" },
];

export default function Sidebar({ active }) {
  const router = useRouter();

  return (
    <nav style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🏢</span>
        <span style={styles.brandText}>Coalition Space</span>
      </div>

      <div style={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.path)}
            style={
              active === item.key
                ? { ...styles.navItem, ...styles.navItemActive }
                : styles.navItem
            }
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div style={styles.footer}>
        <span style={styles.footerText}>Email Reply Bot</span>
      </div>
    </nav>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    minWidth: "220px",
    minHeight: "100vh",
    background: "#0f2027",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    fontFamily: "'Segoe UI', sans-serif",
    position: "sticky",
    top: 0,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 8px",
    marginBottom: "32px",
  },
  brandIcon: { fontSize: "22px" },
  brandText: { color: "#fff", fontWeight: "700", fontSize: "15px" },

  nav: { display: "flex", flexDirection: "column", gap: "4px" },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 12px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "#a8c0d8",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  navItemActive: {
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
  },
  navIcon: { fontSize: "16px", width: "20px", textAlign: "center" },

  footer: { marginTop: "auto", padding: "8px" },
  footerText: { color: "#5a7a94", fontSize: "11px" },
};
