"use client";
// src/components/Sidebar.js
// ─────────────────────────────────────────────────────────
// Shared navigation sidebar. Import into any page:
//
//   import Sidebar from "@/components/Sidebar";
//   ...
//   <div style={{ display: "flex", minHeight: "100vh" }}>
//     <Sidebar active="inbox" />
//     <main style={{ flex: 1 }}> ...page content... </main>
//   </div>
// ─────────────────────────────────────────────────────────

import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { key: "inbox",     label: "Inbox",       path: "/inbox"     },
  { key: "batch",     label: "Batch",       path: "/batch"     },
  { key: "sent",      label: "Sent",        path: "/sent"      },
  { key: "followups", label: "Follow-Ups",  path: "/followups" },
  { key: "settings",  label: "Settings",    path: "/settings"  },
  { key: "manual",    label: "Paste Email", path: "/manual"    },
];

export default function Sidebar({ active }) {
  const router = useRouter();

  return (
    <nav style={styles.sidebar}>
      <div style={styles.brand}>
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
    background: "#101214",
    borderRight: "1px solid rgba(255,255,255,0.06)",
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
  brandText: { color: "#e8eaed", fontWeight: "700", fontSize: "15px" },

  nav: { display: "flex", flexDirection: "column", gap: "2px" },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid transparent",
    borderLeft: "2px solid transparent",
    background: "transparent",
    color: "#8b9198",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  navItemActive: {
    background: "rgba(52, 211, 153, 0.08)",
    borderLeft: "2px solid #34d399",
    color: "#e8eaed",
    fontWeight: "600",
  },

  footer: { marginTop: "auto", padding: "8px" },
  footerText: { color: "#4b5157", fontSize: "11px" },
};
