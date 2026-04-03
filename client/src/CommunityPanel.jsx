// ── CommunityPanel.jsx ────────────────────────────────────────────────────────
// Community Insights panel for MarketMind AI Terminal
// Sections: Live Sentiment Polls · Verified Traders Leaderboard · Trader's Feed
// Theme: Dark Glassmorphism — matches App.jsx design tokens exactly
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, TrendingDown, BadgeCheck, Users, Trophy,
  MessageSquare, Clock, ThumbsUp, Zap, BarChart2,
  ChevronUp, ChevronDown, Star, Flame, ArrowUpRight,
  ArrowDownRight, Activity, PieChart, Radio,
} from "lucide-react";

// ── DESIGN TOKENS (mirrors App.jsx T object) ──────────────────────────────────
const T = {
  bg:      "#0f172a",
  surface: "#111827",
  panel:   "#1a2235",
  card:    "#1e2d45",
  border:  "#243044",
  border2: "#2d3f5f",
  text:    "#f1f5f9",
  sub:     "#94a3b8",
  muted:   "#4b6080",
  dim:     "#1e2d3d",
  cyan:    "#06b6d4",
  blue:    "#3b82f6",
  indigo:  "#6366f1",
  violet:  "#8b5cf6",
  emerald: "#10b981",
  green:   "#22c55e",
  red:     "#ef4444",
  rose:    "#f43f5e",
  amber:   "#f59e0b",
  orange:  "#f97316",
  sky:     "#38bdf8",
  purple:  "#a78bfa",
  teal:    "#14b8a6",
};

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const POLLS_DATA = [
  {
    id: "REL",
    sym: "RELIANCE",
    question: "Will RELIANCE go Up or Down tomorrow?",
    sector: "Energy",
    price: 2847,
    change: +1.12,
    bullVotes: 1284,
    bearVotes: 516,
    totalVoters: 1800,
    expiresIn: "18h 24m",
    hotness: 94,
  },
  {
    id: "TCS",
    sym: "TCS",
    question: "Will TCS hold above ₹3,500 this week?",
    sector: "IT",
    price: 3412,
    change: -0.44,
    bullVotes: 740,
    bearVotes: 960,
    totalVoters: 1700,
    expiresIn: "2d 6h",
    hotness: 77,
  },
  {
    id: "BAJ",
    sym: "BAJFINANCE",
    question: "Bollinger breakout — can BAJFINANCE reach ₹7,400?",
    sector: "NBFC",
    price: 6920,
    change: +2.38,
    bullVotes: 2110,
    bearVotes: 490,
    totalVoters: 2600,
    expiresIn: "11h 05m",
    hotness: 98,
  },
  {
    id: "SBIN",
    sym: "SBIN",
    question: "Is SBIN a buy at current levels?",
    sector: "PSU Bank",
    price: 812,
    change: +0.62,
    bullVotes: 880,
    bearVotes: 620,
    totalVoters: 1500,
    expiresIn: "1d 14h",
    hotness: 61,
  },
];

const LEADERBOARD_DATA = [
  {
    rank: 1,
    name: "Arjun Mehta",
    handle: "@arjuntrader",
    avatar: "AM",
    avatarColor: "#06b6d4",
    verified: true,
    winRate: 84.2,
    totalTrades: 318,
    pnlMTD: "+₹2,84,400",
    pnlPct: "+18.4%",
    followers: 12400,
    specialty: "Swing Trader",
    badge: "🏆 Top Trader",
    allocation: [
      { label: "IT",      pct: 40, color: "#6366f1" },
      { label: "Banking", pct: 30, color: "#06b6d4" },
      { label: "FMCG",   pct: 15, color: "#10b981" },
      { label: "NBFC",   pct: 15, color: "#f59e0b" },
    ],
  },
  {
    rank: 2,
    name: "Priya Sharma",
    handle: "@priyapicks",
    avatar: "PS",
    avatarColor: "#a78bfa",
    verified: true,
    winRate: 79.8,
    totalTrades: 214,
    pnlMTD: "+₹1,62,200",
    pnlPct: "+14.1%",
    followers: 8900,
    specialty: "Positional",
    badge: "⚡ Momentum Pro",
    allocation: [
      { label: "Pharma",  pct: 35, color: "#10b981" },
      { label: "Energy",  pct: 25, color: "#f97316" },
      { label: "Realty",  pct: 20, color: "#38bdf8" },
      { label: "Auto",    pct: 20, color: "#a78bfa" },
    ],
  },
  {
    rank: 3,
    name: "Rahul Verma",
    handle: "@rahulfutures",
    avatar: "RV",
    avatarColor: "#f59e0b",
    verified: true,
    winRate: 76.3,
    totalTrades: 542,
    pnlMTD: "+₹98,600",
    pnlPct: "+11.7%",
    followers: 6100,
    specialty: "Options",
    badge: "🔥 Options Wizard",
    allocation: [
      { label: "Banking",   pct: 45, color: "#06b6d4" },
      { label: "IT",        pct: 30, color: "#6366f1" },
      { label: "Commodities",pct: 25, color: "#f59e0b" },
    ],
  },
  {
    rank: 4,
    name: "Sneha Kapoor",
    handle: "@sneha_value",
    avatar: "SK",
    avatarColor: "#10b981",
    verified: true,
    winRate: 72.1,
    totalTrades: 156,
    pnlMTD: "+₹71,800",
    pnlPct: "+9.2%",
    followers: 4300,
    specialty: "Value Investing",
    badge: "💎 Value Hunter",
    allocation: [
      { label: "PSU",     pct: 30, color: "#38bdf8" },
      { label: "FMCG",   pct: 30, color: "#10b981" },
      { label: "Metals",  pct: 20, color: "#f59e0b" },
      { label: "Pharma",  pct: 20, color: "#a78bfa" },
    ],
  },
];

const FEED_DATA = [
  {
    id: 1,
    trader: "Arjun Mehta",
    handle: "@arjuntrader",
    avatar: "AM",
    avatarColor: "#06b6d4",
    verified: true,
    type: "TRADE ALERT",
    typeColor: "#06b6d4",
    content: "TCS looking bullish above ₹3,500. Strong GenAI deal pipeline, Q1FY25 guidance awaited. Accumulate on dips with SL ₹3,280. Target ₹3,680 over 45 days. Risk:Reward = 1:2.4",
    stocks: ["TCS"],
    action: "BUY",
    time: "12 min ago",
    likes: 284,
    comments: 47,
    reposts: 31,
    isLiked: false,
  },
  {
    id: 2,
    trader: "Priya Sharma",
    handle: "@priyapicks",
    avatar: "PS",
    avatarColor: "#a78bfa",
    verified: true,
    type: "THESIS",
    typeColor: "#a78bfa",
    content: "BAJFINANCE Bollinger squeeze resolving on daily. Co-brand credit card scale-up + rural AUM expansion = dual growth engine. This is a multi-year compounding story. Not a trade, it's a position.",
    stocks: ["BAJFINANCE"],
    action: "BUY",
    time: "38 min ago",
    likes: 512,
    comments: 88,
    reposts: 64,
    isLiked: true,
  },
  {
    id: 3,
    trader: "Rahul Verma",
    handle: "@rahulfutures",
    avatar: "RV",
    avatarColor: "#f59e0b",
    verified: true,
    type: "OPTIONS ALERT",
    typeColor: "#f59e0b",
    content: "NIFTY 24400 CE looks attractive at ₹148. IV near 14% — relatively low. If Nifty holds 24250 today, this CE should hit ₹220-240. Hedge with 24200 PE at ₹98. Net debit ₹50.",
    stocks: ["NIFTY"],
    action: "CALL",
    time: "1h 14m ago",
    likes: 198,
    comments: 62,
    reposts: 24,
    isLiked: false,
  },
  {
    id: 4,
    trader: "Sneha Kapoor",
    handle: "@sneha_value",
    avatar: "SK",
    avatarColor: "#10b981",
    verified: true,
    type: "MARKET THESIS",
    typeColor: "#10b981",
    content: "PSU banks finally re-rating after years of underperformance. SBIN NPA journey from 3.97% → 0.57% is a textbook turnaround. YONO at 85M+ users is an underappreciated digital moat. ₹870 is realistic in 3 months.",
    stocks: ["SBIN", "PNB", "BOB"],
    action: "BUY",
    time: "2h 42m ago",
    likes: 341,
    comments: 55,
    reposts: 48,
    isLiked: false,
  },
  {
    id: 5,
    trader: "Arjun Mehta",
    handle: "@arjuntrader",
    avatar: "AM",
    avatarColor: "#06b6d4",
    verified: true,
    type: "TRADE ALERT",
    typeColor: "#ef4444",
    content: "METALS sector caution ⚠️ — China macro headwinds persisting. Tata Steel and Hindalco showing weakness below key support. Consider booking partial profits or tightening stop-losses. This sector is not for fresh longs.",
    stocks: ["TATASTEEL", "HINDALCO"],
    action: "SELL",
    time: "4h 08m ago",
    likes: 124,
    comments: 39,
    reposts: 17,
    isLiked: false,
  },
];

// ── UTILITY ───────────────────────────────────────────────────────────────────
const fmtINR = n => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── MINI PIE CHART ─────────────────────────────────────────────────────────────
function MiniPie({ slices, size = 52 }) {
  const r = size / 2;
  let cumAngle = -90;
  const segments = slices.map(s => {
    const startAngle = cumAngle;
    const sweep = (s.pct / 100) * 360;
    cumAngle += sweep;
    return { ...s, startAngle, sweep };
  });

  function polarToXY(angle, radius) {
    const rad = (angle * Math.PI) / 180;
    return [r + radius * Math.cos(rad), r + radius * Math.sin(rad)];
  }

  function describeArc(startAngle, sweep, innerR = 0, outerR = r - 1) {
    const start = polarToXY(startAngle, outerR);
    const end   = polarToXY(startAngle + sweep, outerR);
    const large = sweep > 180 ? 1 : 0;
    if (innerR === 0) {
      return `M ${r} ${r} L ${start[0]} ${start[1]} A ${outerR} ${outerR} 0 ${large} 1 ${end[0]} ${end[1]} Z`;
    }
    const iStart = polarToXY(startAngle + sweep, innerR);
    const iEnd   = polarToXY(startAngle, innerR);
    return `M ${start[0]} ${start[1]} A ${outerR} ${outerR} 0 ${large} 1 ${end[0]} ${end[1]} L ${iStart[0]} ${iStart[1]} A ${innerR} ${innerR} 0 ${large} 0 ${iEnd[0]} ${iEnd[1]} Z`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((s, i) => (
        <path
          key={i}
          d={describeArc(s.startAngle, s.sweep, r * 0.42, r - 1.5)}
          fill={s.color}
          opacity={0.92}
        />
      ))}
      {/* Inner ring */}
      <circle cx={r} cy={r} r={r * 0.38} fill={T.card} />
      <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke={T.border2} strokeWidth={0.5} />
    </svg>
  );
}

// ── SECTION HEADER ─────────────────────────────────────────────────────────────
function SH({ icon: Icon, title, right, color = T.cyan }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {Icon && <Icon size={13} color={color} strokeWidth={2.5} />}
        <span style={{ fontSize: 9.5, fontWeight: 900, color, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</span>
      </div>
      {right}
    </div>
  );
}

// ── BADGE ──────────────────────────────────────────────────────────────────────
function Badge({ children, color = T.cyan, style }) {
  return (
    <span style={{
      fontSize: 8, fontWeight: 800, padding: "2px 7px", borderRadius: 4,
      background: color + "22", color, border: `1px solid ${color}44`,
      letterSpacing: "0.04em", whiteSpace: "nowrap", ...style,
    }}>
      {children}
    </span>
  );
}

// ── LIVE POLL CARD ─────────────────────────────────────────────────────────────
function PollCard({ poll, onVote }) {
  const bullPct = Math.round((poll.bullVotes / poll.totalVoters) * 100);
  const bearPct = 100 - bullPct;
  const voted   = poll._voted;

  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border2}`,
      borderRadius: 12,
      padding: "14px 16px",
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = T.cyan + "88"}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.border2}
    >
      {/* HOT badge */}
      {poll.hotness >= 90 && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          display: "flex", alignItems: "center", gap: 3,
          background: T.orange + "22", border: `1px solid ${T.orange}55`,
          borderRadius: 5, padding: "2px 7px",
          fontSize: 7.5, fontWeight: 900, color: T.orange, letterSpacing: "0.08em",
        }}>
          <Flame size={9} /> HOT
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <div style={{
          background: `linear-gradient(135deg, ${T.cyan}33, ${T.indigo}33)`,
          border: `1px solid ${T.cyan}44`, borderRadius: 6, padding: "3px 8px",
          fontSize: 10, fontWeight: 900, color: T.cyan,
        }}>
          {poll.sym}
        </div>
        <Badge color={T.muted}>{poll.sector}</Badge>
        <span style={{ fontSize: 11, fontWeight: 900, color: T.text, marginLeft: "auto", paddingRight: poll.hotness >= 90 ? 54 : 0 }}>
          ₹{fmtINR(poll.price)}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: poll.change >= 0 ? T.emerald : T.red, display: "flex", alignItems: "center", gap: 1 }}>
          {poll.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(poll.change)}%
        </span>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: T.text, marginBottom: 12, lineHeight: 1.5, opacity: 0.9 }}>
        {poll.question}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", height: 8, borderRadius: 5, overflow: "hidden", gap: 1 }}>
          <div style={{
            width: `${bullPct}%`, background: `linear-gradient(90deg, ${T.emerald}, #00c878)`,
            borderRadius: "5px 0 0 5px", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          }} />
          <div style={{
            flex: 1, background: `linear-gradient(90deg, ${T.red}, #c0392b)`,
            borderRadius: "0 5px 5px 0",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: T.emerald }}>
            🐂 {bullPct}% Bullish · {poll.bullVotes.toLocaleString("en-IN")} votes
          </span>
          <span style={{ fontSize: 9, fontWeight: 800, color: T.red }}>
            {bearPct}% Bearish · {poll.bearVotes.toLocaleString("en-IN")} 🐻
          </span>
        </div>
      </div>

      {/* Vote Buttons */}
      {!voted ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onVote(poll.id, "bull")}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 7, border: `1px solid ${T.emerald}55`,
              background: T.emerald + "18", color: T.emerald, fontWeight: 900, fontSize: 10,
              cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 5, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.emerald + "33"; e.currentTarget.style.borderColor = T.emerald + "99"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.emerald + "18"; e.currentTarget.style.borderColor = T.emerald + "55"; }}
          >
            <TrendingUp size={11} /> Bullish
          </button>
          <button
            onClick={() => onVote(poll.id, "bear")}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 7, border: `1px solid ${T.red}55`,
              background: T.red + "18", color: T.red, fontWeight: 900, fontSize: 10,
              cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 5, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.red + "33"; e.currentTarget.style.borderColor = T.red + "99"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.red + "18"; e.currentTarget.style.borderColor = T.red + "55"; }}
          >
            <TrendingDown size={11} /> Bearish
          </button>
        </div>
      ) : (
        <div style={{
          textAlign: "center", padding: "7px 0", borderRadius: 7,
          background: T.cyan + "18", border: `1px solid ${T.cyan}44`,
          fontSize: 9, fontWeight: 900, color: T.cyan, letterSpacing: "0.06em",
        }}>
          ✓ VOTED · {poll._votedDir === "bull" ? "BULLISH" : "BEARISH"}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
        <Clock size={9} color={T.muted} />
        <span style={{ fontSize: 8, color: T.muted }}>Expires in {poll.expiresIn}</span>
        <span style={{ fontSize: 8, color: T.muted, marginLeft: "auto" }}>
          {poll.totalVoters.toLocaleString("en-IN")} votes
        </span>
      </div>
    </div>
  );
}

// ── TRADER LEADERBOARD CARD ────────────────────────────────────────────────────
function TraderCard({ trader, expanded, onToggle }) {
  const rankColors = ["#f5c542", "#c0c0c0", "#cd7f32", T.muted];

  return (
    <div
      style={{
        background: T.card, border: `1px solid ${expanded ? T.cyan + "55" : T.border2}`,
        borderRadius: 12, padding: "14px 16px", cursor: "pointer",
        transition: "all 0.2s", position: "relative", overflow: "hidden",
      }}
      onClick={onToggle}
      onMouseEnter={e => { if (!expanded) e.currentTarget.style.borderColor = T.border2 + "ff"; }}
      onMouseLeave={e => { if (!expanded) e.currentTarget.style.borderColor = T.border2; }}
    >
      {/* Rank accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, width: 3, height: "100%",
        background: trader.rank <= 3
          ? `linear-gradient(180deg, ${rankColors[trader.rank - 1]}, ${rankColors[trader.rank - 1]}88)`
          : `linear-gradient(180deg, ${T.muted}, ${T.muted}44)`,
        borderRadius: "12px 0 0 12px",
      }} />

      <div style={{ paddingLeft: 8 }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: expanded ? 12 : 0 }}>
          {/* Rank */}
          <div style={{
            fontSize: 14, fontWeight: 900, color: rankColors[Math.min(trader.rank - 1, 3)],
            width: 22, textAlign: "center", flexShrink: 0,
          }}>
            #{trader.rank}
          </div>

          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg, ${trader.avatarColor}55, ${trader.avatarColor}33)`,
            border: `2px solid ${trader.avatarColor}66`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900, color: trader.avatarColor, flexShrink: 0,
          }}>
            {trader.avatar}
          </div>

          {/* Name & handle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: T.text, whiteSpace: "nowrap" }}>{trader.name}</span>
              {trader.verified && (
                <BadgeCheck size={13} color={T.blue} strokeWidth={2.5} />
              )}
            </div>
            <div style={{ fontSize: 8, color: T.muted }}>{trader.handle} · {trader.specialty}</div>
          </div>

          {/* Win rate */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: T.emerald }}>{trader.winRate}%</div>
            <div style={{ fontSize: 7.5, color: T.muted }}>WIN RATE</div>
          </div>

          {/* Expand arrow */}
          <div style={{ color: T.muted, flexShrink: 0 }}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>

        {/* Compact metrics row when collapsed */}
        {!expanded && (
          <div style={{ display: "flex", gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
            <Badge color={T.cyan} style={{ fontSize: 7 }}>{trader.pnlPct} MTD</Badge>
            <Badge color={T.amber} style={{ fontSize: 7 }}>{trader.badge}</Badge>
            <Badge color={T.muted} style={{ fontSize: 7, marginLeft: "auto" }}>
              <Users size={8} style={{ display: "inline", marginRight: 3 }} />
              {(trader.followers / 1000).toFixed(1)}K
            </Badge>
          </div>
        )}

        {/* Expanded detail */}
        {expanded && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { l: "MTD P&L",     v: trader.pnlMTD,   c: T.emerald },
                { l: "MTD %",       v: trader.pnlPct,   c: T.emerald },
                { l: "Total Trades",v: trader.totalTrades, c: T.cyan },
                { l: "Followers",   v: `${(trader.followers / 1000).toFixed(1)}K`, c: T.amber },
              ].map((m, i) => (
                <div key={i} style={{
                  background: T.panel, borderRadius: 7, padding: "7px 8px",
                  border: `1px solid ${T.border}`,
                }}>
                  <div style={{ fontSize: 7, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{m.l}</div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: m.c }}>{m.v}</div>
                </div>
              ))}
            </div>

            {/* Portfolio Allocation */}
            <div style={{
              background: T.panel, borderRadius: 9, padding: "12px 14px",
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: T.sub, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                Portfolio Allocation
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <MiniPie slices={trader.allocation} size={56} />
                <div style={{ flex: 1 }}>
                  {trader.allocation.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 8.5, color: T.sub, flex: 1 }}>{s.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: T.text }}>{s.pct}%</span>
                      <div style={{ width: 48, height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: 4, width: `${s.pct}%`, background: s.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button style={{
                flex: 1, padding: "7px 0", borderRadius: 7, border: `1px solid ${trader.avatarColor}55`,
                background: trader.avatarColor + "18", color: trader.avatarColor, fontWeight: 900,
                fontSize: 9, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}>
                <Users size={10} /> Follow
              </button>
              <button style={{
                flex: 1, padding: "7px 0", borderRadius: 7, border: `1px solid ${T.border2}`,
                background: "transparent", color: T.sub, fontWeight: 900, fontSize: 9,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}>
                <BarChart2 size={10} /> View Trades
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── FEED POST ─────────────────────────────────────────────────────────────────
function FeedPost({ post, onLike }) {
  const actionColors = { BUY: T.emerald, SELL: T.red, CALL: T.amber, PUT: T.rose };
  const actionColor  = actionColors[post.action] ?? T.cyan;

  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, padding: "14px 16px",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = T.cyan + "44"}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.border2}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: `linear-gradient(135deg, ${post.avatarColor}55, ${post.avatarColor}22)`,
          border: `2px solid ${post.avatarColor}66`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 900, color: post.avatarColor, flexShrink: 0,
        }}>
          {post.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
            <span style={{ fontSize: 10.5, fontWeight: 900, color: T.text }}>{post.trader}</span>
            {post.verified && <BadgeCheck size={12} color={T.blue} strokeWidth={2.5} />}
            <span style={{ fontSize: 8, color: T.muted }}>{post.handle}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              fontSize: 7.5, fontWeight: 900, padding: "2px 7px", borderRadius: 4,
              background: post.typeColor + "22", color: post.typeColor,
              border: `1px solid ${post.typeColor}44`, letterSpacing: "0.06em",
            }}>
              {post.type}
            </span>
            <Badge color={actionColor}>{post.action}</Badge>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: T.muted, flexShrink: 0 }}>
          <Clock size={9} />
          <span style={{ fontSize: 8 }}>{post.time}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        fontSize: 10, color: T.text, lineHeight: 1.65, marginBottom: 10,
        opacity: 0.88, paddingLeft: 44,
      }}>
        {post.content}
      </div>

      {/* Stock tags */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, paddingLeft: 44 }}>
        {post.stocks.map((s, i) => (
          <span key={i} style={{
            fontSize: 8, fontWeight: 800, padding: "2px 8px", borderRadius: 4,
            background: T.cyan + "18", color: T.cyan,
            border: `1px solid ${T.cyan}33`, cursor: "pointer",
          }}>
            ${s}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{
        display: "flex", alignItems: "center", gap: 0, paddingLeft: 44,
        borderTop: `1px solid ${T.border}`, paddingTop: 9, marginTop: 4,
      }}>
        <button
          onClick={() => onLike(post.id)}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "4px 10px 4px 0",
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            color: post.isLiked ? T.rose : T.muted, fontSize: 9, fontWeight: 700,
            transition: "color 0.15s",
          }}
        >
          <ThumbsUp size={11} fill={post.isLiked ? T.rose : "none"} />
          {post.likes + (post.isLiked ? 1 : 0)}
        </button>
        <button style={{
          display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
          color: T.muted, fontSize: 9, fontWeight: 700,
        }}>
          <MessageSquare size={11} /> {post.comments}
        </button>
        <button style={{
          display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
          color: T.muted, fontSize: 9, fontWeight: 700,
        }}>
          <Activity size={11} /> {post.reposts}
        </button>
      </div>
    </div>
  );
}

// ── COMMUNITY STATS BANNER ─────────────────────────────────────────────────────
function CommunityStatsBanner({ polls, feed }) {
  const totalVotes = polls.reduce((a, p) => a + p.totalVoters, 0);
  const bullish    = polls.reduce((a, p) => a + p.bullVotes, 0);
  const bullPct    = Math.round((bullish / totalVotes) * 100);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${T.cyan}11, ${T.indigo}11)`,
      border: `1px solid ${T.cyan}33`,
      borderRadius: 12, padding: "12px 18px", marginBottom: 18,
      display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 24 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", background: T.emerald,
          boxShadow: `0 0 8px ${T.emerald}`, animation: "pulse 1.5s infinite",
        }} />
        <span style={{ fontSize: 8.5, fontWeight: 900, color: T.emerald, letterSpacing: "0.12em" }}>COMMUNITY LIVE</span>
      </div>
      {[
        { label: "ACTIVE POLLS", value: polls.length, color: T.cyan, icon: Radio },
        { label: "TOTAL VOTES",  value: totalVotes.toLocaleString("en-IN"), color: T.blue, icon: Users },
        { label: "COMMUNITY MOOD", value: `${bullPct}% BULLISH`, color: T.emerald, icon: TrendingUp },
        { label: "ALERTS TODAY", value: feed.length, color: T.amber, icon: Zap },
      ].map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} style={{
            display: "flex", flexDirection: "column", gap: 2,
            padding: "0 18px", borderLeft: `1px solid ${T.border2}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon size={9} color={s.color} />
              <span style={{ fontSize: 7, color: T.muted, fontWeight: 800, letterSpacing: "0.1em" }}>{s.label}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, color: s.color }}>{s.value}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function CommunityPanel() {
  const [polls,    setPolls]    = useState(POLLS_DATA);
  const [feed,     setFeed]     = useState(FEED_DATA);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState("polls"); // polls | leaders | feed

  function handleVote(pollId, dir) {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId || p._voted) return p;
      return {
        ...p,
        bullVotes:  dir === "bull" ? p.bullVotes + 1 : p.bullVotes,
        bearVotes:  dir === "bear" ? p.bearVotes + 1 : p.bearVotes,
        totalVoters: p.totalVoters + 1,
        _voted: true,
        _votedDir: dir,
      };
    }));
  }

  function handleLike(postId) {
    setFeed(prev => prev.map(p =>
      p.id !== postId ? p : { ...p, isLiked: !p.isLiked }
    ));
  }

  const tabs = [
    { id: "polls",   label: "Live Polls",    Icon: Radio,        color: T.cyan   },
    { id: "leaders", label: "Leaderboard",   Icon: Trophy,       color: T.amber  },
    { id: "feed",    label: "Trader's Feed", Icon: MessageSquare,color: T.violet },
  ];

  return (
    <div style={{
      padding: "18px 20px", overflowY: "auto", height: "100%",
      fontFamily: "'JetBrains Mono','IBM Plex Mono','Courier New',monospace",
      color: T.text,
    }}>

      {/* Community Stats Banner */}
      <CommunityStatsBanner polls={polls} feed={feed} />

      {/* Sub-tab Navigation */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 18,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: 4,
      }}>
        {tabs.map(t => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "8px 10px", borderRadius: 7, border: "none",
                background: active ? `linear-gradient(135deg, ${t.color}22, ${t.color}11)` : "transparent",
                color: active ? t.color : T.muted,
                outline: active ? `1px solid ${t.color}44` : "none",
                fontWeight: 900, fontSize: 9, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "0.06em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                transition: "all 0.15s",
              }}
            >
              <t.Icon size={11} />
              {t.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* ── POLLS TAB ── */}
      {activeTab === "polls" && (
        <div>
          <SH
            icon={Radio}
            title="Live Sentiment Polls"
            color={T.cyan}
            right={
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.emerald, animation: "pulse 1.5s infinite" }} />
                <span style={{ fontSize: 8, color: T.muted }}>Updated live</span>
              </div>
            }
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {polls.map(poll => (
              <PollCard key={poll.id} poll={poll} onVote={handleVote} />
            ))}
          </div>
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {activeTab === "leaders" && (
        <div>
          <SH
            icon={Trophy}
            title="Verified Traders Leaderboard"
            color={T.amber}
            right={<Badge color={T.amber}>This Month</Badge>}
          />
          {/* Legend */}
          <div style={{
            background: T.panel, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "8px 14px", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 16, fontSize: 8, color: T.muted,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <BadgeCheck size={10} color={T.blue} />
              <span>= Verified trader with proven track record</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <PieChart size={10} color={T.cyan} />
              <span>Click card to see portfolio allocation</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LEADERBOARD_DATA.map(trader => (
              <TraderCard
                key={trader.rank}
                trader={trader}
                expanded={expanded === trader.rank}
                onToggle={() => setExpanded(expanded === trader.rank ? null : trader.rank)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── FEED TAB ── */}
      {activeTab === "feed" && (
        <div>
          <SH
            icon={MessageSquare}
            title="Trader's Feed"
            color={T.violet}
            right={
              <div style={{ display: "flex", gap: 6 }}>
                {["All", "Alerts", "Thesis"].map(f => (
                  <button key={f} style={{
                    background: f === "All" ? T.violet + "22" : "transparent",
                    border: `1px solid ${f === "All" ? T.violet + "55" : T.border}`,
                    color: f === "All" ? T.violet : T.muted, borderRadius: 5,
                    padding: "3px 9px", fontSize: 8, fontWeight: 800, cursor: "pointer",
                    fontFamily: "inherit",
                  }}>
                    {f}
                  </button>
                ))}
              </div>
            }
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {feed.map(post => (
              <FeedPost key={post.id} post={post} onLike={handleLike} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(16,185,129,0.4)} 50%{opacity:0.6;box-shadow:0 0 0 5px rgba(16,185,129,0)} }
      `}</style>
    </div>
  );
}
