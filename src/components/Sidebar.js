"use client";
// src/components/Sidebar.js
// ─────────────────────────────────────────────────────────
// Apple Liquid Glass inspired (macOS Tahoe, WWDC 2025): each
// nav item is its own floating translucent "chip," not one
// flat highlight bar. Hover triggers a specular light-sweep
// across the glass plus a spring-eased scale-up — the web
// equivalent of Dock magnification. Real hover/pseudo-element
// behavior needs actual CSS, so the interactive bits use
// styled-jsx (built into Next.js, no extra install) while
// static layout stays as plain style objects like the rest
// of the app.
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { colors } from "@/lib/theme";

// ── Minimal hand-drawn line icons — no icon library dependency ──
const Icon = {
  inbox: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 12h4l2 3h6l2-3h4" />
      <path d="M5 12V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" />
      <path d="M3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" />
    </svg>
  ),
  batch: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="12 4 20 9 12 14 4 9" />
      <polyline points="4 13 12 18 20 13" />
    </svg>
  ),
  sent: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11l18-8-8 18-2-8-8-2z" />
    </svg>
  ),
  followups: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4v5h5" />
      <path d="M20 20v-5h-5" />
      <path d="M4.5 9a8 8 0 0 1 13.9-4.2M19.5 15a8 8 0 0 1-13.9 4.2" />
    </svg>
  ),
  settings: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="4" y1="7" x2="20" y2="7" /><circle cx="9" cy="7" r="2" fill={colors.bgBase} />
      <line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2" fill={colors.bgBase} />
      <line x1="4" y1="17" x2="20" y2="17" /><circle cx="7" cy="17" r="2" fill={colors.bgBase} />
    </svg>
  ),
  manual: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  team: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M14.8 14.2c2.6.5 4.7 2.6 4.7 5.8" />
    </svg>
  ),
  system: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <line x1="12" y1="16" x2="12" y2="20" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { key: "inbox",     label: "Inbox",       path: "/inbox",     icon: Icon.inbox     },
  { key: "batch",     label: "Batch",       path: "/batch",     icon: Icon.batch     },
  { key: "sent",      label: "Sent",        path: "/sent",      icon: Icon.sent      },
  { key: "followups", label: "Follow-Ups",  path: "/followups", icon: Icon.followups },
  { key: "settings",  label: "Settings",    path: "/settings",  icon: Icon.settings  },
  { key: "manual",    label: "Paste Email", path: "/manual",    icon: Icon.manual    },
];

const ADMIN_ITEMS = [
  { key: "admin",  label: "Team",   path: "/admin/users",  icon: Icon.team   },
  { key: "system", label: "System", path: "/admin/system", icon: Icon.system },
];

export default function Sidebar({ active }) {
  useLiquidGlassStyles();

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
      {/* User identity — its own glass chip */}
      <button
        onClick={() => router.push("/account")}
        className={`chip user-chip ${active === "account" ? "active" : ""}`}
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
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.path)}
              className={`chip nav-chip ${active === item.key ? "active" : ""}`}
            >
              <span className="chip-icon"><ItemIcon /></span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.footer}>
        <button onClick={handleSignOut} className="chip signout-chip">
          Sign Out
        </button>
      </div>

    </nav>
  );
}

// ── Liquid glass chip behavior — injected as a plain runtime
// <style> tag rather than Next.js's <style jsx> block. Same
// real CSS (:hover, ::before specular sweep, @keyframes), but
// delivered as an ordinary string the compiler has no special
// transform path for — avoids a Turbopack/styled-jsx compile
// hang seen on Next.js 16.2.9. Runs once; the id guard stops
// duplicate <style> tags piling up across navigations.
function useLiquidGlassStyles() {
  useEffect(() => {
    if (document.getElementById("liquid-glass-sidebar-styles")) return;

    const style = document.createElement("style");
    style.id = "liquid-glass-sidebar-styles";
    style.textContent = `
      /* Base state is plain text, no box at all — this is how
         every real sidebar pattern works (Mail.app, Finder,
         Linear, Notion). Only hover and active states introduce
         a visible glass surface; giving every idle item its own
         box is what read as "a wall of grey rectangles." */
      .chip {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 11px;
        width: 100%;
        text-align: left;
        cursor: pointer;
        border-radius: 15px;
        border: 1px solid transparent;
        background: transparent;
        color: #7c8985;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        padding: 10px 13px;
        transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.3s ease, border-color 0.25s ease,
                    background 0.25s ease, color 0.2s ease,
                    backdrop-filter 0.25s ease;
      }
      .nav-chip { margin-bottom: 3px; }

      .chip::before {
        content: "";
        position: absolute;
        top: -80%; left: -30%;
        width: 55%; height: 260%;
        background: linear-gradient(120deg, transparent 25%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.04) 62%, transparent 80%);
        transform: rotate(18deg) translateX(-60%);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.7s ease, opacity 0.3s ease;
      }

      /* Hover — this is where the glass surface actually appears */
      .chip:hover {
        transform: scale(1.03) translateY(-1px);
        background: linear-gradient(160deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 100%);
        backdrop-filter: blur(20px) saturate(160%);
        -webkit-backdrop-filter: blur(20px) saturate(160%);
        border-color: rgba(255,255,255,0.2);
        color: ${colors.textPrimary};
        box-shadow: 0 10px 26px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.16);
      }
      .chip:hover::before {
        opacity: 1;
        transform: rotate(18deg) translateX(140%);
      }
      .chip:active { transform: scale(0.985); }

      /* Active — strongest, most saturated state, plus a solid
         accent bar on the left as a second, color-independent
         signal (never rely on tint alone to convey "selected"). */
      .chip.active {
        background: linear-gradient(160deg, rgba(${colors.accentRGB},0.32) 0%, rgba(${colors.accentRGB},0.1) 100%);
        backdrop-filter: blur(20px) saturate(170%);
        -webkit-backdrop-filter: blur(20px) saturate(170%);
        border-color: rgba(110,231,183,0.5);
        color: ${colors.textPrimary};
        font-weight: 600;
        box-shadow: 0 6px 22px rgba(${colors.accentRGB},0.22), inset 0 1px 0 rgba(255,255,255,0.18),
                    inset 3px 0 0 ${colors.accent};
      }
      .chip.active .chip-icon { color: ${colors.accent}; }

      .chip-icon {
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; color: #5f6c68;
        transition: color 0.2s ease;
      }
      .chip:hover .chip-icon { color: ${colors.textPrimary}; }

      .chip:focus-visible {
        outline: 2px solid rgba(${colors.accentRGB},0.6);
        outline-offset: 2px;
      }

      .user-chip { margin-bottom: 16px; padding: 9px; border-radius: 17px; }
      .user-chip.active {
        background: linear-gradient(160deg, rgba(${colors.accentRGB},0.26) 0%, rgba(${colors.accentRGB},0.08) 100%);
        backdrop-filter: blur(20px) saturate(170%);
        -webkit-backdrop-filter: blur(20px) saturate(170%);
        border-color: rgba(110,231,183,0.45);
        box-shadow: 0 6px 18px rgba(${colors.accentRGB},0.18), inset 0 1px 0 rgba(255,255,255,0.16);
      }

      .signout-chip { justify-content: flex-start; color: #5f6c68; font-size: 12px; }
      .signout-chip:hover { color: #fca5a5; border-color: rgba(248,113,113,0.28); }
    `;
    document.head.appendChild(style);
  }, []);
}

const styles = {
  sidebar: {
    width: "236px",
    minWidth: "236px",
    minHeight: "100vh",
    // A faint self-tinted base, independent of whatever's
    // technically behind it — approximates Apple's "color
    // informed by surrounding content" even in browsers where
    // backdrop-filter-through-fixed-background is inconsistent.
    background: `linear-gradient(180deg, ${colors.sidebarTintTop} 0%, ${colors.sidebarTintBottom} 100%)`,
    backdropFilter: "blur(30px) saturate(150%)",
    WebkitBackdropFilter: "blur(30px) saturate(150%)",
    borderRight: `1px solid ${colors.glassBorder}`,
    display: "flex",
    flexDirection: "column",
    padding: "20px 14px",
    fontFamily: "'Segoe UI', sans-serif",
    position: "sticky",
    top: 0,
  },

  avatarWrap: { position: "relative", flexShrink: 0 },
  avatarImg: {
    width: "36px", height: "36px", borderRadius: "50%",
    objectFit: "cover", border: `1px solid ${colors.glassBorderStrong}`,
  },
  avatarFallback: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: `linear-gradient(160deg, rgba(${colors.accentRGB},0.9), rgba(${colors.accentRGB},0.55))`,
    color: "#06231a", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "14px", fontWeight: "700",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
  },
  crown: {
    position: "absolute", top: "-4px", right: "-4px",
    fontSize: "11px", color: "#fbbf24",
    background: "#0a0c0e", borderRadius: "50%",
    width: "15px", height: "15px",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  userInfo: { display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 },
  userName: {
    fontSize: "13px", fontWeight: "700", color: colors.textPrimary,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  adminPill: {
    fontSize: "9.5px", fontWeight: "700", color: colors.accent,
    background: colors.accentSoft, padding: "2px 8px",
    borderRadius: "999px", textTransform: "uppercase",
    width: "fit-content",
  },

  brand: { padding: "2px 10px", marginBottom: "14px" },
  brandText: {
    color: "#4d5854", fontWeight: "600", fontSize: "10.5px",
    textTransform: "uppercase", letterSpacing: "1.4px",
  },

  nav: { display: "flex", flexDirection: "column" },

  footer: { marginTop: "auto", paddingTop: "10px" },
};
