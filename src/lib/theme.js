// src/lib/theme.js
// ─────────────────────────────────────────────────────────
// Shared glassmorphism design tokens. Import into any page's
// styles object rather than redefining blur/translucency
// values per file — one source of truth for the look.
// ─────────────────────────────────────────────────────────

// ── The ONE line that controls the app's accent color everywhere ──
// Every accent value below — buttons, tabs, the background mesh's
// dominant blobs, and every accent rgba() in Sidebar.js — derives
// from this single triplet now. Swap the whole app's accent hue
// by changing this one line, and only this one line.
const ACCENT_RGB = "52,211,153"; // emerald

// A fixed complementary hue for the background mesh's secondary
// blobs. Deliberately NOT tied to ACCENT_RGB — a background needs
// at least two colors to read as a "mesh" rather than one flat
// tinted patch, so this stays put even when you swap the accent.
const SECONDARY_RGB = "45,55,120"; // indigo

export const colors = {
  bgBase:      "#08090b",
  textPrimary: "#f1f3f2",
  textSecondary: "#9aa5a1",
  textMuted:   "#68736f",

  accentRGB:   ACCENT_RGB,
  accent:      `rgb(${ACCENT_RGB})`,
  accentSoft:  `rgba(${ACCENT_RGB},0.16)`,
  accentGlow:  `rgba(${ACCENT_RGB},0.35)`,
  accentBorder: `rgba(${ACCENT_RGB},0.4)`,

  danger:      "#f87171",
  dangerSoft:  "rgba(248,113,113,0.14)",

  glassBg:       "rgba(255,255,255,0.09)",
  glassBgStrong: "rgba(255,255,255,0.14)",
  glassBorder:       "rgba(255,255,255,0.13)",
  glassBorderStrong: "rgba(255,255,255,0.22)",

  // Sidebar's own self-tint, independent of backdrop-filter reach.
  // Kept as its own token (not hardcoded in Sidebar.js) so swapping
  // to a light variant actually reaches the sidebar too.
  sidebarTintTop:    "rgba(14,28,22,0.5)",
  sidebarTintBottom: "rgba(10,12,14,0.6)",
};

// The colorful wash behind every page — this is what makes the
// glass panels actually read as glass rather than just "slightly
// see-through gray." Every "dominant" blob below now uses
// ACCENT_RGB directly, so it follows whichever accent you pick;
// the "secondary" blobs stay on the fixed indigo counterpoint.
export const pageBackground = {
  background: `
    radial-gradient(ellipse 1100px 800px at 8% 8%, rgba(${ACCENT_RGB},0.5), transparent 58%),
    radial-gradient(ellipse 900px 750px at 92% 12%, rgba(${SECONDARY_RGB},0.5), transparent 55%),
    radial-gradient(ellipse 1000px 900px at 15% 92%, rgba(${ACCENT_RGB},0.35), transparent 55%),
    radial-gradient(ellipse 800px 700px at 85% 88%, rgba(${SECONDARY_RGB},0.38), transparent 55%),
    radial-gradient(ellipse 1200px 1000px at 50% 50%, rgba(${ACCENT_RGB},0.18), transparent 65%),
    linear-gradient(160deg, #0a1310 0%, #070a09 55%, #05070a 100%)
  `,
  backgroundAttachment: "fixed",
};

export const glass = {
  panel: {
    background: colors.glassBg,
    backdropFilter: "blur(22px) saturate(150%)",
    WebkitBackdropFilter: "blur(22px) saturate(150%)",
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  panelStrong: {
    background: colors.glassBgStrong,
    backdropFilter: "blur(26px) saturate(160%)",
    WebkitBackdropFilter: "blur(26px) saturate(160%)",
    border: `1px solid ${colors.glassBorderStrong}`,
    borderRadius: "20px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  // Primary action — now genuinely derives from ACCENT_RGB. This
  // was the biggest miss before: your main CTA buttons were stuck
  // on hardcoded emerald no matter what you set the accent to.
  buttonPrimary: {
    background: `linear-gradient(180deg, rgba(${ACCENT_RGB},0.9) 0%, rgba(${ACCENT_RGB},0.55) 100%)`,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: `1px solid rgba(${ACCENT_RGB},0.55)`,
    borderRadius: "999px",
    color: "#06231a",
    fontWeight: "700",
    boxShadow: `0 4px 16px rgba(${ACCENT_RGB},0.25), inset 0 1px 0 rgba(255,255,255,0.25)`,
    cursor: "pointer",
  },
  buttonSecondary: {
    background: colors.glassBg,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: `1px solid ${colors.glassBorderStrong}`,
    borderRadius: "999px",
    color: colors.textPrimary,
    fontWeight: "600",
    cursor: "pointer",
  },
  buttonDanger: {
    background: colors.dangerSoft,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(248,113,113,0.35)",
    borderRadius: "999px",
    color: "#fca5a5",
    fontWeight: "600",
    cursor: "pointer",
  },
  input: {
    background: "rgba(255,255,255,0.045)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: "14px",
    color: colors.textPrimary,
    outline: "none",
  },
  pill: {
    borderRadius: "999px",
  },

  pageHeader: {
    background: colors.glassBg,
    backdropFilter: "blur(24px) saturate(150%)",
    WebkitBackdropFilter: "blur(24px) saturate(150%)",
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: "22px",
    boxShadow: "0 8px 28px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
  },

  radiusOuter: "22px",
  radiusInner: "14px",
  radiusPill: "999px",

  tab: {
    borderRadius: "999px",
    border: "1px solid transparent",
    background: "transparent",
    color: colors.textSecondary,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "8px 18px",
    transition: "background 0.25s ease, border-color 0.25s ease, color 0.2s ease",
  },
  // Fixed: border now derives from accentRGB too — this was
  // hardcoded to a light emerald shade before.
  tabActive: {
    background: colors.accentSoft,
    border: `1px solid ${colors.accentBorder}`,
    color: colors.textPrimary,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
  },
};

export const type = {
  pageTitle: {
    fontSize: "25px",
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: "-0.3px",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: "13.5px",
    color: colors.textSecondary,
    margin: "4px 0 0 0",
    lineHeight: "1.5",
  },
  statNumber: {
    fontSize: "22px",
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: "-0.4px",
  },
  statLabel: {
    fontSize: "11px",
    color: colors.textMuted,
    marginTop: "2px",
  },
};

// ── Motion — real Apple pattern, not a plain fade ──────────
// Apple's own language: elements "materialize by modulating
// light bending and lensing," and things like sheets/menus
// "morph out of the buttons that present them." The web-safe
// approximation: animate blur + scale + opacity TOGETHER (not
// opacity alone) with a slight overshoot-then-settle timing,
// so it reads as condensing INTO focus rather than a flat fade.
//
// Delivered as a runtime-injected <style> tag rather than
// styled-jsx — same reasoning as Sidebar.js: avoids a real
// Turbopack compile hang seen with styled-jsx on this Next.js
// version. Call once per page that uses it; the id guard stops
// duplicate injection across re-renders/navigations.
export function ensureMotionStyles() {
  if (typeof document === "undefined") return; // SSR guard
  if (document.getElementById("liquid-glass-motion")) return;

  const style = document.createElement("style");
  style.id = "liquid-glass-motion";
  style.textContent = `
    @keyframes materializeIn {
      0%   { opacity: 0; transform: scale(0.92); filter: blur(14px); }
      60%  { opacity: 1; transform: scale(1.015); filter: blur(0px); }
      100% { opacity: 1; transform: scale(1); filter: blur(0px); }
    }
    @keyframes materializeBackdrop {
      0%   { opacity: 0; backdrop-filter: blur(0px); }
      100% { opacity: 1; backdrop-filter: blur(6px); }
    }
    .materialize-in {
      animation: materializeIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .materialize-backdrop {
      animation: materializeBackdrop 0.3s ease both;
    }
    /* The thin chromatic edge from the reference image — a
       sliver of soft color dispersion, not a tinted surface.
       Sits along the bottom edge of a glass panel only. */
    .chromatic-edge {
      position: relative;
    }
    .chromatic-edge::after {
      content: "";
      position: absolute;
      left: 8%; right: 8%; bottom: -1px;
      height: 1.5px;
      /* Sampled directly from Apple's own WWDC25 reference image —
         a real prism sweep (cyan / warm yellow / soft green-pink),
         not a guessed rainbow. */
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(188,225,233,0.4) 20%,
        rgba(241,229,177,0.45) 50%,
        rgba(185,235,200,0.4) 80%,
        transparent 100%);
      border-radius: 999px;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}
