/**
 * SplashScreen.jsx — MarketMind·AI
 * Cinematic intro with SVG path draw, neon silver glow, kerning reveal.
 * Requires: framer-motion  →  npm install framer-motion
 *
 * Usage:
 *   import SplashScreen from './SplashScreen';
 *   // In your root (e.g. App.jsx or main.jsx):
 *   const [showSplash, setShowSplash] = useState(true);
 *   if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// TIMING CONSTANTS  (all in seconds)
// ─────────────────────────────────────────────────────────────────────────────
const T_DRAW_START   = 0.2;   // when stroke draw begins
const T_DRAW_DUR     = 1.6;   // how long the M+circle draw takes
const T_GLOW_START   = 1.6;   // glow blooms after draw finishes
const T_GLOW_DUR     = 0.8;
const T_TEXT_START   = 2.0;   // "MARKET MIND" fades up
const T_TEXT_DUR     = 0.7;
const T_TAGLINE      = 2.55;  // tagline fades
const T_HOLD         = 3.4;   // total hold before exit
const T_EXIT_DUR     = 0.9;   // exit transition duration

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const COL = {
  bg:         "#060d1a",        // near-black deep navy
  bgGrad1:    "#080f20",
  bgGrad2:    "#030912",
  stroke:     "#e2e8f0",        // silver-white for the draw stroke
  glowCore:   "#f1f5f9",        // bright core of glow
  glowMid:    "#94a3b8",        // mid silver
  glowOuter:  "#38bdf844",      // sky-cyan halo at edges
  accentCyan: "#06b6d4",
  accentIndigo:"#6366f1",
  text:       "#f1f5f9",
  sub:        "#64748b",
  gridLine:   "#0d1a2e",
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG LOGO — custom "M" monogram inside a precision circle
//
// The "M" is drawn as a single continuous path so stroke-dashoffset
// animation traces it cleanly. The outer ring is a separate <circle>.
// Both share the same neon-silver stroke.
//
// ViewBox: 0 0 120 120   →  centre = (60, 60)
// ─────────────────────────────────────────────────────────────────────────────
const LOGO_M_PATH =
  // M letterform: start bottom-left, up, diagonal to centre-bottom,
  // diagonal to top-right, down. Tight, geometric, monospaced feel.
  "M 28 86 L 28 34 L 60 62 L 92 34 L 92 86";

// Approximate total length for the M path (used for strokeDasharray).
// For a perfect result at runtime, use a useEffect + getTotalLength().
// We compute it precisely via SVG path geometry below.
// M: two vertical lines + two diagonals. Approx = 52+52+40+40 = ~184px
const M_PATH_LENGTH = 192;

// Circle radius 50, centre 60,60 → circumference = 2π×50 ≈ 314.16
const CIRCLE_R        = 50;
const CIRCLE_CIRC     = 2 * Math.PI * CIRCLE_R; // 314.16

// ─────────────────────────────────────────────────────────────────────────────
// SCANLINE GRID — atmospheric background lines
// ─────────────────────────────────────────────────────────────────────────────
function GridLines() {
  const hLines = Array.from({ length: 18 }, (_, i) => i);
  const vLines = Array.from({ length: 28 }, (_, i) => i);
  return (
    <motion.div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        pointerEvents: "none",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeIn" }}
    >
      <svg
        width="100%" height="100%"
        style={{ position: "absolute", inset: 0 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="gridFade" cx="50%" cy="50%" r="60%">
            <stop offset="0%"   stopColor={COL.gridLine} stopOpacity="0" />
            <stop offset="70%"  stopColor={COL.gridLine} stopOpacity="1" />
            <stop offset="100%" stopColor={COL.gridLine} stopOpacity="1" />
          </radialGradient>
        </defs>
        {/* Horizontal */}
        {hLines.map(i => (
          <line
            key={`h${i}`}
            x1="0%" y1={`${(i / 17) * 100}%`}
            x2="100%" y2={`${(i / 17) * 100}%`}
            stroke={COL.gridLine} strokeWidth="1" opacity="0.6"
          />
        ))}
        {/* Vertical */}
        {vLines.map(i => (
          <line
            key={`v${i}`}
            x1={`${(i / 27) * 100}%`} y1="0%"
            x2={`${(i / 27) * 100}%`} y2="100%"
            stroke={COL.gridLine} strokeWidth="1" opacity="0.4"
          />
        ))}
        {/* Vignette overlay via radial mask */}
        <rect width="100%" height="100%" fill="url(#gridFade)" />
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE DOTS — floating ambient specks
// ─────────────────────────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x:  `${5 + (i * 37.3) % 90}%`,
  y:  `${8 + (i * 53.7) % 84}%`,
  r:  i % 4 === 0 ? 1.5 : 1,
  delay: (i * 0.18) % 2.4,
  dur:   2.8 + (i % 5) * 0.4,
  color: i % 3 === 0 ? COL.accentCyan : i % 5 === 0 ? COL.accentIndigo : COL.glowMid,
}));

function Particles() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x, top: p.y,
            width: p.r * 2, height: p.r * 2,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 ${p.r * 4}px ${p.color}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0.3, 0.9, 0], scale: [0, 1, 0.8, 1.2, 0] }}
          transition={{
            delay: p.delay + 0.6,
            duration: p.dur,
            repeat: Infinity,
            repeatDelay: p.delay * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGO SVG — draw + glow
// ─────────────────────────────────────────────────────────────────────────────
function LogoMark({ phase }) {
  // phase: "hidden" | "drawing" | "glowing"
  const isDrawing = phase === "drawing" || phase === "glowing";
  const isGlowing = phase === "glowing";

  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>

      {/* ── Outer diffuse halo (only when glowing) ── */}
      <motion.div
        style={{
          position: "absolute",
          inset: -30,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COL.glowOuter} 0%, transparent 65%)`,
          filter: "blur(18px)",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={isGlowing
          ? { opacity: [0, 0.7, 0.5, 0.8, 0.6], scale: [0.6, 1.1, 1, 1.15, 1] }
          : { opacity: 0, scale: 0.6 }}
        transition={{ duration: T_GLOW_DUR, ease: "easeOut", times: [0,0.3,0.5,0.75,1], repeat: Infinity, repeatType: "mirror", repeatDelay: 0.5 }}
      />

      {/* ── Main SVG ── */}
      <svg
        viewBox="0 0 120 120"
        width="160" height="160"
        style={{ position: "relative", zIndex: 2, overflow: "visible" }}
      >
        <defs>
          {/* Neon silver glow filter for the circle */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur1" />
            <feGaussianBlur stdDeviation="5"   result="blur2" />
            <feGaussianBlur stdDeviation="10"  result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Tight glow for the M stroke */}
          <filter id="mGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="b1" />
            <feGaussianBlur stdDeviation="4"   result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient stroke for circle — silver centre, cyan tinge at ends */}
          <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={COL.accentCyan}   stopOpacity="0.9" />
            <stop offset="40%"  stopColor={COL.glowCore}     stopOpacity="1"   />
            <stop offset="70%"  stopColor={COL.glowMid}      stopOpacity="0.95"/>
            <stop offset="100%" stopColor={COL.accentIndigo} stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={COL.accentCyan} stopOpacity="0.85"/>
            <stop offset="50%"  stopColor={COL.glowCore}   stopOpacity="1"   />
            <stop offset="100%" stopColor={COL.accentCyan} stopOpacity="0.85"/>
          </linearGradient>
        </defs>

        {/* ── Circle ring ── */}
        <motion.circle
          cx="60" cy="60" r={CIRCLE_R}
          fill="none"
          stroke={isGlowing ? "url(#circleGrad)" : COL.stroke}
          strokeWidth={isGlowing ? 2.2 : 1.8}
          strokeLinecap="round"
          filter={isGlowing ? "url(#neonGlow)" : undefined}
          style={{
            // SVG stroke-dash trick: start fully hidden, animate to fully shown
            strokeDasharray: CIRCLE_CIRC,
            strokeDashoffset: CIRCLE_CIRC,
          }}
          animate={isDrawing ? {
            strokeDashoffset: 0,
          } : { strokeDashoffset: CIRCLE_CIRC }}
          transition={{
            duration: T_DRAW_DUR * 0.85,
            delay: T_DRAW_START,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        {/* ── M path ── */}
        <motion.path
          d={LOGO_M_PATH}
          fill="none"
          stroke={isGlowing ? "url(#mGrad)" : COL.stroke}
          strokeWidth={isGlowing ? 3.5 : 2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={isGlowing ? "url(#mGlow)" : undefined}
          style={{
            strokeDasharray: M_PATH_LENGTH,
            strokeDashoffset: M_PATH_LENGTH,
          }}
          animate={isDrawing ? {
            strokeDashoffset: 0,
          } : { strokeDashoffset: M_PATH_LENGTH }}
          transition={{
            duration: T_DRAW_DUR,
            delay: T_DRAW_START + 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {/* ── Corner tick marks — adds precision/instrument feel ── */}
        {isGlowing && [
          // top-left
          { x1: 10, y1: 22, x2: 10, y2: 14, x3: 10, y3: 14, x4: 18, y4: 14 },
          // top-right
          { x1: 110, y1: 22, x2: 110, y2: 14, x3: 110, y3: 14, x4: 102, y4: 14 },
          // bottom-left
          { x1: 10, y1: 98, x2: 10, y2: 106, x3: 10, y3: 106, x4: 18, y4: 106 },
          // bottom-right
          { x1: 110, y1: 98, x2: 110, y2: 106, x3: 110, y3: 106, x4: 102, y4: 106 },
        ].map((t, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.45 }}
            transition={{ delay: T_GLOW_START - T_DRAW_START + i * 0.06, duration: 0.3 }}>
            <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={COL.accentCyan} strokeWidth="1" strokeLinecap="round" />
            <line x1={t.x3} y1={t.y3} x2={t.x4} y2={t.y4}
              stroke={COL.accentCyan} strokeWidth="1" strokeLinecap="round" />
          </motion.g>
        ))}
      </svg>

      {/* ── Centre point pulse (appears after glow) ── */}
      {isGlowing && (
        <motion.div
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: 6, height: 6,
            borderRadius: "50%",
            background: COL.glowCore,
            boxShadow: `0 0 12px ${COL.glowCore}, 0 0 24px ${COL.accentCyan}`,
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.7, 1], scale: [0, 1.4, 1, 1.2] }}
          transition={{ delay: 0.1, duration: 0.6, ease: "backOut" }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LETTER-BY-LETTER KERNING REVEAL
// ─────────────────────────────────────────────────────────────────────────────
function KerningText({ text, delay, style = {} }) {
  const letters = text.split("").map((ch, i) => ({ ch, i }));
  return (
    <motion.span
      style={{ display: "inline-flex", gap: 0, ...style }}
      initial="hidden"
      animate="visible"
    >
      {letters.map(({ ch, i }) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          variants={{
            hidden: { opacity: 0, y: 14, letterSpacing: "-0.12em" },
            visible: { opacity: 1, y: 0, letterSpacing: ch === " " ? "0.3em" : "0.22em" },
          }}
          transition={{
            delay: delay + i * 0.045,
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TICKER — ambient financial numbers scrolling at bottom
// ─────────────────────────────────────────────────────────────────────────────
const TICKER_DATA = [
  "RELIANCE  ₹2,847  +1.1%", "HDFCBANK  ₹1,623  +0.8%",
  "TCS  ₹3,412  −0.4%",      "NIFTY 50  24,346  +0.6%",
  "SENSEX  80,182  +0.5%",   "BAJFINANCE  ₹6,920  +2.1%",
  "INFY  ₹1,587  +1.8%",     "SBIN  ₹812  +2.4%",
  "USD/INR  83.42  +0.1%",   "GOLD  ₹72,840  +0.3%",
];

function DataTicker({ visible }) {
  const repeated = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <motion.div
      style={{
        position: "absolute", bottom: 32, left: 0, right: 0,
        overflow: "hidden", height: 22,
        borderTop: `1px solid ${COL.accentCyan}18`,
        borderBottom: `1px solid ${COL.accentCyan}18`,
        background: `linear-gradient(90deg, ${COL.bg}, transparent 8%, transparent 92%, ${COL.bg})`,
      }}
      initial={{ opacity: 0 }}
      animate={visible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, delay: T_TAGLINE + 0.3 }}
    >
      <motion.div
        style={{
          display: "flex", alignItems: "center", gap: 0,
          whiteSpace: "nowrap",
          fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
          fontSize: 9, color: COL.sub,
          fontWeight: 500, letterSpacing: "0.06em",
        }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {repeated.map((item, i) => (
          <span key={i} style={{ padding: "0 28px" }}>
            <span style={{
              color: item.includes("−") ? "#ef4444" : item.includes("+") ? "#10b981" : COL.sub,
              marginLeft: 5
            }}>
              {item}
            </span>
            <span style={{ color: COL.accentCyan, opacity: 0.3, marginLeft: 24 }}>·</span>
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SPLASH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function SplashScreen({ onComplete }) {
  // Phase state machine
  const [phase, setPhase] = useState("hidden");
  // "hidden" → "drawing" → "glowing" → "textVisible" → "exiting"

  const [textVisible,    setTextVisible]    = useState(false);
  const [tickerVisible,  setTickerVisible]  = useState(false);
  const [exiting,        setExiting]        = useState(false);

  useEffect(() => {
    const timers = [];

    // Kick off draw
    timers.push(setTimeout(() => setPhase("drawing"),     T_DRAW_START  * 1000));
    // Bloom glow
    timers.push(setTimeout(() => setPhase("glowing"),     T_GLOW_START  * 1000));
    // Text reveal
    timers.push(setTimeout(() => setTextVisible(true),    T_TEXT_START  * 1000));
    // Ticker
    timers.push(setTimeout(() => setTickerVisible(true),  T_TAGLINE     * 1000));
    // Begin exit
    timers.push(setTimeout(() => setExiting(true),        T_HOLD        * 1000));
    // Call onComplete after exit anim
    timers.push(setTimeout(() => onComplete?.(),          (T_HOLD + T_EXIT_DUR + 0.1) * 1000));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {!exiting || true /* keep mounted during exit */}
      <motion.div
        key="splash"
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: `radial-gradient(ellipse at 50% 40%, ${COL.bgGrad1} 0%, ${COL.bgGrad2} 100%)`,
          overflow: "hidden",
          fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
        }}
        // EXIT: zoom-out + fade
        animate={exiting ? {
          scale: [1, 0.88],
          opacity: [1, 0],
          filter: ["blur(0px)", "blur(8px)"],
        } : { scale: 1, opacity: 1 }}
        transition={exiting ? {
          duration: T_EXIT_DUR,
          ease: [0.4, 0, 1, 1],
        } : {}}
        onAnimationComplete={() => {
          if (exiting) onComplete?.();
        }}
      >
        {/* ── Atmospheric layers ── */}
        <GridLines />
        <Particles />

        {/* ── Central radial glow behind logo ── */}
        <motion.div
          style={{
            position: "absolute",
            width: 480, height: 480,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COL.accentCyan}0a 0%, ${COL.accentIndigo}06 35%, transparent 65%)`,
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
          animate={phase === "glowing"
            ? { opacity: [0.4, 0.9, 0.6, 1, 0.7], scale: [0.9, 1.05, 1, 1.1, 1] }
            : { opacity: 0.2, scale: 0.8 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />

        {/* ── LOGO ── */}
        <motion.div
          style={{ position: "relative", zIndex: 2 }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
        >
          <LogoMark phase={phase} />
        </motion.div>

        {/* ── WORDMARK ── */}
        <motion.div
          style={{
            marginTop: 28, zIndex: 2,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}
        >
          {/* Main title */}
          <div style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "0.0em",
            color: COL.text,
            lineHeight: 1,
            display: "flex",
            alignItems: "baseline",
            gap: 0,
          }}>
            {textVisible && (
              <>
                <KerningText
                  text="MARKET"
                  delay={T_TEXT_START - T_TEXT_START} // relative 0
                  style={{ color: COL.text }}
                />
                <motion.span
                  style={{ color: COL.accentCyan, marginLeft: "0.22em", marginRight: "0.04em" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.42, duration: 0.3 }}
                >
                  ·
                </motion.span>
                <KerningText
                  text="MIND"
                  delay={0.3}
                  style={{ color: COL.text }}
                />
              </>
            )}
          </div>

          {/* Accent line */}
          <motion.div
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}
            initial={{ opacity: 0 }}
            animate={textVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${COL.accentCyan}66)` }} />
            <span style={{
              fontSize: 8.5, fontWeight: 700, letterSpacing: "0.32em",
              color: COL.accentCyan, textTransform: "uppercase",
            }}>
              AI
            </span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${COL.accentCyan}66, transparent)` }} />
          </motion.div>

          {/* Tagline */}
          <motion.p
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.28em",
              color: COL.sub,
              textTransform: "uppercase",
              margin: 0,
              marginTop: 2,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={tickerVisible ? { opacity: 0.7, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Professional Trading Terminal
          </motion.p>

          {/* Version chip */}
          <motion.div
            style={{
              marginTop: 4,
              padding: "3px 12px",
              borderRadius: 20,
              border: `1px solid ${COL.accentCyan}30`,
              background: `${COL.accentCyan}08`,
              fontSize: 7.5,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: `${COL.accentCyan}bb`,
              textTransform: "uppercase",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={tickerVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "backOut" }}
          >
            v8.0 · NSE · BSE · LIVE
          </motion.div>
        </motion.div>

        {/* ── Loading bar ── */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 72, left: "50%", transform: "translateX(-50%)",
            width: 220, height: 2,
            background: `${COL.accentCyan}18`,
            borderRadius: 2, overflow: "hidden",
            zIndex: 3,
          }}
          initial={{ opacity: 0 }}
          animate={textVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${COL.accentCyan}, ${COL.glowCore}, ${COL.accentIndigo})`,
              borderRadius: 2,
              boxShadow: `0 0 8px ${COL.accentCyan}`,
            }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              delay: T_TEXT_START - T_TEXT_START,
              duration: T_HOLD - T_TEXT_START - 0.3,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* ── Data ticker ── */}
        <DataTicker visible={tickerVisible} />

        {/* ── Corner decorations ── */}
        {["tl", "tr", "bl", "br"].map((pos) => (
          <motion.div
            key={pos}
            style={{
              position: "absolute",
              ...(pos.includes("t") ? { top: 20 } : { bottom: 20 }),
              ...(pos.includes("l") ? { left: 20 } : { right: 20 }),
              width: 20, height: 20,
              borderTop: pos.includes("t") ? `1px solid ${COL.accentCyan}44` : "none",
              borderBottom: pos.includes("b") ? `1px solid ${COL.accentCyan}44` : "none",
              borderLeft: pos.includes("l") ? `1px solid ${COL.accentCyan}44` : "none",
              borderRight: pos.includes("r") ? `1px solid ${COL.accentCyan}44` : "none",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + ["tl","tr","bl","br"].indexOf(pos) * 0.08, duration: 0.4 }}
          />
        ))}

      </motion.div>
    </AnimatePresence>
  );
}
