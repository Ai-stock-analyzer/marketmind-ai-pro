import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy, Medal, Crown, Zap, TrendingUp, TrendingDown,
  Clock, ArrowUpRight, ArrowDownRight, Star, Flame,
  Target, Users, Wallet, Activity, ChevronRight,
  BarChart2, Shield, Swords, Timer, Award, Sparkles,
} from "lucide-react";

// ── DESIGN TOKENS (mirrors MarketMind AI) ─────────────────────────────────────
const T = {
  bg:      "#0f172a", surface: "#111827", panel:  "#1a2235", card:   "#1e2d45",
  border:  "#243044", border2: "#2d3f5f", text:   "#f1f5f9", sub:    "#94a3b8",
  muted:   "#4b6080", dim:     "#1e2d3d",
  cyan:    "#06b6d4", blue:    "#3b82f6", indigo: "#6366f1", violet: "#8b5cf6",
  emerald: "#10b981", green:   "#22c55e", red:    "#ef4444", rose:   "#f43f5e",
  amber:   "#f59e0b", orange:  "#f97316", yellow: "#eab308",
  sky:     "#38bdf8", purple:  "#a78bfa", teal:   "#14b8a6",
};

// ── CHAMPIONSHIP ACCENT TOKENS ────────────────────────────────────────────────
const C = {
  gold:        "#f5c542",
  goldLight:   "#fde68a",
  goldGlow:    "#f5c54244",
  goldDark:    "#92400e",
  silver:      "#cbd5e1",
  silverLight: "#f1f5f9",
  silverGlow:  "#cbd5e133",
  bronze:      "#d97706",
  bronzeLight: "#fcd34d",
  bronzeGlow:  "#d9770633",
};

// ── VIRTUAL WALLET CONSTANT ───────────────────────────────────────────────────
const INITIAL_BALANCE = 1_000_000; // ₹10,00,000

// ── AVATAR INITIALS GENERATOR ─────────────────────────────────────────────────
const avatarColors = [
  ["#06b6d4","#0e7490"], ["#8b5cf6","#6d28d9"], ["#10b981","#065f46"],
  ["#f59e0b","#92400e"], ["#ef4444","#991b1b"], ["#3b82f6","#1d4ed8"],
  ["#f43f5e","#9f1239"], ["#14b8a6","#0f766e"], ["#a78bfa","#7c3aed"],
  ["#22c55e","#15803d"],
];

// ── MOCK TRADE HISTORY DATA ───────────────────────────────────────────────────
const TRADE_TEMPLATES = [
  { sym:"RELIANCE", sector:"Energy"   },
  { sym:"HDFCBANK", sector:"Banking"  },
  { sym:"TCS",      sector:"IT"       },
  { sym:"INFY",     sector:"IT"       },
  { sym:"BAJFINANCE",sector:"NBFC"    },
  { sym:"ICICIBANK",sector:"Banking"  },
  { sym:"SBIN",     sector:"PSU Bank" },
  { sym:"WIPRO",    sector:"IT"       },
  { sym:"TATAMOTORS",sector:"Auto"    },
  { sym:"ADANIENT", sector:"Conglomerate"},
];

function genTrades(seed, count = 6) {
  const trades = [];
  let rng = seed * 1234567;
  const next = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647; };
  const baseTime = Date.now() - 3600000 * 8;
  for (let i = 0; i < count; i++) {
    const tmpl = TRADE_TEMPLATES[Math.floor(next() * TRADE_TEMPLATES.length)];
    const isBuy = next() > 0.42;
    const basePrice = 500 + next() * 3500;
    const qty = Math.floor(next() * 45 + 5);
    const pnlPct = (isBuy ? 1 : -1) * (next() * 6 - 1.5);
    const pnl = +(basePrice * qty * pnlPct / 100).toFixed(0);
    const time = new Date(baseTime + i * next() * 1800000);
    trades.push({
      sym: tmpl.sym,
      sector: tmpl.sector,
      type: isBuy ? "BUY" : "SELL",
      qty,
      price: +basePrice.toFixed(0),
      pnl,
      pnlPct: +pnlPct.toFixed(2),
      time: time.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }),
    });
  }
  return trades.sort((a, b) => b.pnl - a.pnl);
}

// ── MOCK LEADERBOARD DATA — 10 users ─────────────────────────────────────────
const MOCK_USERS_BASE = [
  { id:1,  name:"Arjun Mehta",    handle:"@arjunm",   avatar:"AM", colorIdx:0, pnlPct:+31.42, wins:28, trades:38, streak:7,  badge:"🔥 Hot Streak" },
  { id:2,  name:"Priya Sharma",   handle:"@priyas",   avatar:"PS", colorIdx:1, pnlPct:+24.88, wins:22, trades:31, streak:4,  badge:"⚡ Quick Scalper" },
  { id:3,  name:"Rohit Verma",    handle:"@rohitv",   avatar:"RV", colorIdx:2, pnlPct:+18.67, wins:19, trades:27, streak:3,  badge:"🎯 Accurate" },
  { id:4,  name:"Sneha Iyer",     handle:"@snehaf",   avatar:"SI", colorIdx:3, pnlPct:+12.44, wins:15, trades:24, streak:2,  badge:"📈 Consistent" },
  { id:5,  name:"Vikram Nair",    handle:"@vikramn",  avatar:"VN", colorIdx:4, pnlPct: +8.21, wins:12, trades:22, streak:1,  badge:"🌱 Rising Star" },
  { id:6,  name:"Kavya Reddy",    handle:"@kavyar",   avatar:"KR", colorIdx:5, pnlPct: +3.55, wins:10, trades:20, streak:0,  badge:"🔍 Analyst" },
  { id:7,  name:"Aditya Joshi",   handle:"@adityaj",  avatar:"AJ", colorIdx:6, pnlPct: -2.14, wins:8,  trades:18, streak:0,  badge:"💼 Learning" },
  { id:8,  name:"Meera Pillai",   handle:"@meerap",   avatar:"MP", colorIdx:7, pnlPct: -5.88, wins:7,  trades:17, streak:0,  badge:"📚 Student" },
  { id:9,  name:"Suresh Kumar",   handle:"@sureshk",  avatar:"SK", colorIdx:8, pnlPct:-10.22, wins:5,  trades:16, streak:0,  badge:"⚙️ Experimenting" },
  { id:10, name:"Ananya Bose",    handle:"@ananyab",  avatar:"AB", colorIdx:9, pnlPct:-14.77, wins:4,  trades:15, streak:0,  badge:"🌙 Night Trader" },
];

function buildUsers(base) {
  return base.map(u => {
    const portfolio = +(INITIAL_BALANCE * (1 + u.pnlPct / 100)).toFixed(0);
    const netPnl    = portfolio - INITIAL_BALANCE;
    const winRate   = +((u.wins / u.trades) * 100).toFixed(1);
    const trades    = genTrades(u.id, 6);
    return { ...u, portfolio, netPnl, winRate, trades };
  }).sort((a, b) => b.portfolio - a.portfolio)
    .map((u, i) => ({ ...u, rank: i + 1 }));
}

// ── SEASON TIMER CONFIG ───────────────────────────────────────────────────────
// Season ends next Monday 09:15 IST
function getSeasonEnd() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : (8 - day);
  const end = new Date(now);
  end.setDate(now.getDate() + daysUntilMonday);
  end.setHours(9, 15, 0, 0);
  return end;
}

// ── UTILITY ───────────────────────────────────────────────────────────────────
const fmtINR = n => Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const fmtINRFull = n => n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand   = (a, b) => Math.random() * (b - a) + a;

// ── RANK ACCENT HELPER ────────────────────────────────────────────────────────
function rankAccent(rank) {
  if (rank === 1) return { primary: C.gold,   secondary: C.goldLight,   glow: C.goldGlow,   label: "GOLD",   icon: "👑" };
  if (rank === 2) return { primary: C.silver, secondary: C.silverLight, glow: C.silverGlow, label: "SILVER", icon: "🥈" };
  if (rank === 3) return { primary: C.bronze, secondary: C.bronzeLight, glow: C.bronzeGlow, label: "BRONZE", icon: "🥉" };
  return { primary: T.sub, secondary: T.text, glow: "transparent", label: "", icon: "" };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── AVATAR ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }) {
  const [c1, c2] = avatarColors[user.colorIdx % avatarColors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 900, color: "#fff",
      letterSpacing: "-0.02em",
      boxShadow: `0 0 0 2px ${T.surface}, 0 0 0 3px ${c1}66`,
    }}>
      {user.avatar}
    </div>
  );
}

// ── PODIUM CARD (top 3) ───────────────────────────────────────────────────────
function PodiumCard({ user, onSelect, selected }) {
  const acc   = rankAccent(user.rank);
  const isPos = user.netPnl >= 0;
  const heights = { 1: 110, 2: 84, 3: 70 };
  const barH   = heights[user.rank] || 60;

  return (
    <div
      onClick={() => onSelect(user)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 0, cursor: "pointer", flex: user.rank === 1 ? "0 0 200px" : "0 0 170px",
        order: user.rank === 1 ? 2 : user.rank === 2 ? 1 : 3,
      }}
    >
      {/* Crown / medal above avatar */}
      <div style={{
        fontSize: user.rank === 1 ? 28 : 22,
        marginBottom: user.rank === 1 ? 6 : 4,
        filter: `drop-shadow(0 0 8px ${acc.primary})`,
        animation: user.rank === 1 ? "crownBob 2.4s ease-in-out infinite" : "none",
      }}>
        {acc.icon}
      </div>

      {/* Avatar with glow ring */}
      <div style={{
        padding: user.rank === 1 ? 3 : 2,
        borderRadius: "50%",
        background: `conic-gradient(${acc.primary}, ${acc.secondary}, ${acc.primary})`,
        boxShadow: `0 0 ${user.rank === 1 ? 24 : 14}px ${acc.glow}`,
        marginBottom: 8,
      }}>
        <Avatar user={user} size={user.rank === 1 ? 56 : 44} />
      </div>

      {/* Name + handle */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{
          fontSize: user.rank === 1 ? 11 : 10,
          fontWeight: 900, color: acc.secondary,
          letterSpacing: "0.04em",
          textShadow: `0 0 12px ${acc.primary}88`,
        }}>
          {user.name.split(" ")[0].toUpperCase()}
        </div>
        <div style={{ fontSize: 8, color: T.muted, marginTop: 1 }}>{user.handle}</div>
      </div>

      {/* P&L chip */}
      <div style={{
        background: `linear-gradient(135deg, ${acc.primary}22, ${acc.primary}11)`,
        border: `1px solid ${acc.primary}55`,
        borderRadius: 20, padding: "3px 10px", marginBottom: 8,
        fontSize: 9.5, fontWeight: 900,
        color: isPos ? T.emerald : T.red,
      }}>
        {isPos ? "+" : "−"}₹{fmtINR(user.netPnl)} ({isPos ? "+" : ""}{user.pnlPct.toFixed(2)}%)
      </div>

      {/* Podium bar */}
      <div style={{
        width: "100%", height: barH,
        background: user.rank === 1
          ? `linear-gradient(180deg, ${C.goldGlow} 0%, ${C.gold}22 40%, ${T.panel} 100%)`
          : user.rank === 2
          ? `linear-gradient(180deg, ${C.silverGlow} 0%, ${C.silver}18 40%, ${T.panel} 100%)`
          : `linear-gradient(180deg, ${C.bronzeGlow} 0%, ${C.bronze}18 40%, ${T.panel} 100%)`,
        border: `1px solid ${acc.primary}44`,
        borderBottom: "none",
        borderRadius: "8px 8px 0 0",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-start",
        paddingTop: 8,
        backdropFilter: "blur(4px)",
        transition: "box-shadow 0.2s",
        boxShadow: selected?.id === user.id ? `0 0 30px ${acc.primary}55, inset 0 0 20px ${acc.primary}11` : "none",
      }}>
        <div style={{
          fontSize: user.rank === 1 ? 20 : 15,
          fontWeight: 900, color: acc.primary,
          fontFamily: "monospace",
          textShadow: `0 0 16px ${acc.primary}`,
        }}>
          #{user.rank}
        </div>
        <div style={{ fontSize: 7.5, color: T.muted, marginTop: 2 }}>
          {user.winRate}% WIN
        </div>
      </div>
    </div>
  );
}

// ── COUNTDOWN TIMER ───────────────────────────────────────────────────────────
function SeasonTimer() {
  const [remaining, setRemaining] = useState(0);
  const [season]    = useState({ name: "WEEKLY BATTLE #14", prize: "₹50,000" });

  useEffect(() => {
    const end = getSeasonEnd().getTime();
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const totalSecs = Math.floor(remaining / 1000);
  const days  = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  const secs  = totalSecs % 60;
  const pad   = n => String(n).padStart(2, "0");

  const pct = clamp(1 - remaining / (7 * 24 * 3600 * 1000), 0, 1);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${T.panel}, #1a1f35)`,
      border: `1px solid ${T.border2}`,
      borderRadius: 14, padding: "14px 18px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background shimmer */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 14,
        background: `radial-gradient(ellipse at top right, ${T.indigo}0a 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            background: `linear-gradient(135deg, ${T.indigo}, ${T.violet})`,
            borderRadius: 8, padding: "5px 6px",
            boxShadow: `0 0 14px ${T.indigo}55`,
          }}>
            <Swords size={13} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: T.text, letterSpacing: "0.08em" }}>
              {season.name}
            </div>
            <div style={{ fontSize: 7.5, color: T.muted, marginTop: 1 }}>
              🏆 Prize Pool: <span style={{ color: C.gold, fontWeight: 800 }}>{season.prize}</span>
            </div>
          </div>
        </div>
        <div style={{
          background: `${T.amber}18`, border: `1px solid ${T.amber}44`,
          borderRadius: 20, padding: "3px 10px",
          fontSize: 8.5, fontWeight: 800, color: T.amber,
          display: "flex", alignItems: "center", gap: 4,
          animation: "timerPulse 2s ease-in-out infinite",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.amber, display: "inline-block" }} />
          LIVE
        </div>
      </div>

      {/* Big timer digits */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 10 }}>
        {[["DAYS", pad(days)], ["HRS", pad(hours)], ["MIN", pad(mins)], ["SEC", pad(secs)]].map(([label, val], i) => (
          <div key={label} style={{ display: "flex", alignItems: "flex-end", gap: i < 3 ? 4 : 0 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 26, fontWeight: 900, color: i === 3 && secs < 10 ? T.red : T.text,
                fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
                textShadow: i === 3 && secs < 10 ? `0 0 20px ${T.red}` : "none",
                transition: "color 0.3s, text-shadow 0.3s",
              }}>
                {val}
              </div>
              <div style={{ fontSize: 7, color: T.muted, fontWeight: 700, letterSpacing: "0.12em", marginTop: 2 }}>
                {label}
              </div>
            </div>
            {i < 3 && <div style={{ fontSize: 22, fontWeight: 900, color: T.border2, marginBottom: 10 }}>:</div>}
          </div>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ fontSize: 8, color: T.muted }}>Season Progress</div>
          <div style={{ width: 120, height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${pct * 100}%`,
              background: `linear-gradient(90deg, ${T.indigo}, ${T.violet})`,
              borderRadius: 3,
              transition: "width 1s linear",
              boxShadow: `0 0 8px ${T.indigo}88`,
            }} />
          </div>
          <div style={{ fontSize: 7.5, color: T.sub, fontWeight: 700 }}>
            {(pct * 100).toFixed(1)}% elapsed
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STATS ROW ─────────────────────────────────────────────────────────────────
function CompetitionStats({ users }) {
  const totalTrades = users.reduce((a, u) => a + u.trades, 0);
  const topGain     = Math.max(...users.map(u => u.pnlPct));
  const activeCount = users.filter(u => u.pnlPct > 0).length;

  const stats = [
    { label: "COMPETITORS", val: users.length, icon: Users,     color: T.cyan   },
    { label: "TOTAL TRADES", val: totalTrades,  icon: Activity,  color: T.indigo },
    { label: "TOP GAIN",     val: `+${topGain.toFixed(2)}%`, icon: TrendingUp, color: T.emerald },
    { label: "IN PROFIT",    val: `${activeCount}/${users.length}`, icon: Target, color: T.amber },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: T.panel, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: "10px 12px",
          display: "flex", alignItems: "center", gap: 9,
        }}>
          <div style={{
            background: `${s.color}18`, border: `1px solid ${s.color}33`,
            borderRadius: 8, padding: "6px",
          }}>
            <s.icon size={13} color={s.color} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 7, color: T.muted, letterSpacing: "0.1em", fontWeight: 800 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: T.text, marginTop: 1 }}>{s.val}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LEADERBOARD TABLE ROW ─────────────────────────────────────────────────────
function LeaderRow({ user, onSelect, selected, animDelay }) {
  const acc   = rankAccent(user.rank);
  const isTop = user.rank <= 3;
  const isPos = user.netPnl >= 0;
  const isSelected = selected?.id === user.id;

  return (
    <div
      onClick={() => onSelect(user)}
      style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr 140px 130px 90px 80px",
        alignItems: "center", gap: 8,
        padding: "10px 14px",
        borderRadius: 10,
        background: isSelected
          ? `linear-gradient(135deg, ${isTop ? acc.primary + "14" : T.cyan + "10"}, ${T.panel})`
          : isTop
          ? `linear-gradient(135deg, ${acc.primary}08, ${T.panel} 60%)`
          : T.panel,
        border: `1px solid ${isSelected ? (isTop ? acc.primary + "55" : T.cyan + "44") : isTop ? acc.primary + "28" : T.border}`,
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: isSelected ? `0 4px 20px ${isTop ? acc.primary + "22" : T.cyan + "18"}` : "none",
        animation: `rowFadeIn 0.4s ease both`,
        animationDelay: `${animDelay}ms`,
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.background = isTop
            ? `linear-gradient(135deg, ${acc.primary}12, ${T.card})` : T.card;
          e.currentTarget.style.borderColor = isTop ? acc.primary + "44" : T.border2;
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.background = isTop
            ? `linear-gradient(135deg, ${acc.primary}08, ${T.panel} 60%)` : T.panel;
          e.currentTarget.style.borderColor = isTop ? acc.primary + "28" : T.border;
        }
      }}
    >
      {/* Rank */}
      <div style={{ textAlign: "center" }}>
        {isTop ? (
          <div style={{
            fontSize: 14, fontWeight: 900, color: acc.primary,
            textShadow: `0 0 10px ${acc.primary}`,
            filter: `drop-shadow(0 0 4px ${acc.primary})`,
          }}>
            {acc.icon} {user.rank}
          </div>
        ) : (
          <div style={{ fontSize: 12, fontWeight: 800, color: T.muted }}>#{user.rank}</div>
        )}
      </div>

      {/* User info */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Avatar user={user} size={30} />
        <div>
          <div style={{
            fontSize: 10, fontWeight: 900,
            color: isTop ? acc.secondary : T.text,
            textShadow: isTop ? `0 0 8px ${acc.primary}44` : "none",
          }}>
            {user.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <span style={{ fontSize: 7.5, color: T.muted }}>{user.handle}</span>
            {user.streak > 0 && (
              <span style={{
                fontSize: 7, fontWeight: 800, color: T.orange,
                background: T.orange + "18", border: `1px solid ${T.orange}33`,
                borderRadius: 4, padding: "1px 5px",
                display: "flex", alignItems: "center", gap: 2,
              }}>
                <Flame size={8} /> {user.streak}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio value */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 900, color: T.text }}>
          ₹{fmtINRFull(user.portfolio)}
        </div>
        <div style={{ fontSize: 7.5, color: T.muted, marginTop: 1 }}>
          Started: ₹{fmtINRFull(INITIAL_BALANCE)}
        </div>
      </div>

      {/* Net P&L */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 900,
          color: isPos ? T.emerald : T.red,
          display: "flex", alignItems: "center", gap: 3,
        }}>
          {isPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {isPos ? "+" : "−"}₹{fmtINR(user.netPnl)}
        </div>
        <div style={{
          fontSize: 8.5, fontWeight: 800,
          color: isPos ? T.emerald : T.red, marginTop: 1,
        }}>
          {isPos ? "+" : ""}{user.pnlPct.toFixed(2)}%
        </div>
      </div>

      {/* Win rate */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 7, color: T.muted, fontWeight: 700 }}>ACCURACY</span>
          <span style={{
            fontSize: 8.5, fontWeight: 900,
            color: user.winRate >= 70 ? T.emerald : user.winRate >= 50 ? T.amber : T.red,
          }}>
            {user.winRate}%
          </span>
        </div>
        <div style={{ width: "100%", height: 4, background: T.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${user.winRate}%`,
            background: user.winRate >= 70 ? T.emerald : user.winRate >= 50 ? T.amber : T.red,
            borderRadius: 3,
            transition: "width 0.8s ease",
          }} />
        </div>
        <div style={{ fontSize: 7, color: T.muted, marginTop: 2 }}>
          {user.wins}W / {user.trades - user.wins}L
        </div>
      </div>

      {/* Badge */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span style={{
          fontSize: 8, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
          background: T.border, color: T.sub,
          whiteSpace: "nowrap", maxWidth: 76, overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {user.badge}
        </span>
      </div>
    </div>
  );
}

// ── RECENT TRADES PANEL ───────────────────────────────────────────────────────
function RecentTradesPanel({ user }) {
  if (!user) return null;
  const acc   = rankAccent(user.rank);
  const isTop = user.rank <= 3;

  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${isTop ? acc.primary + "44" : T.border2}`,
      borderRadius: 14, padding: "16px",
      boxShadow: isTop ? `0 0 24px ${acc.primary}18` : "none",
      animation: "rowFadeIn 0.3s ease both",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar user={user} size={32} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: isTop ? acc.secondary : T.text }}>
              {user.name}'s Recent Trades
            </div>
            <div style={{ fontSize: 7.5, color: T.muted, marginTop: 1 }}>
              {user.badge} · {user.winRate}% accuracy
            </div>
          </div>
        </div>
        <div style={{
          background: `${isTop ? acc.primary : T.cyan}18`,
          border: `1px solid ${isTop ? acc.primary : T.cyan}44`,
          borderRadius: 8, padding: "4px 10px",
          fontSize: 8, fontWeight: 900,
          color: isTop ? acc.primary : T.cyan,
        }}>
          #{user.rank} RANK
        </div>
      </div>

      {/* Trade rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {user.trades.map((tr, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "60px 90px 1fr 80px 80px",
            alignItems: "center", gap: 8,
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "7px 10px",
            borderLeft: `3px solid ${tr.pnl >= 0 ? T.emerald : T.red}`,
          }}>
            {/* Type badge */}
            <span style={{
              fontSize: 8.5, fontWeight: 900, padding: "2px 7px", borderRadius: 5,
              background: tr.type === "BUY" ? T.emerald + "22" : T.red + "22",
              color: tr.type === "BUY" ? T.emerald : T.red,
              border: `1px solid ${tr.type === "BUY" ? T.emerald : T.red}44`,
              textAlign: "center",
            }}>
              {tr.type}
            </span>

            {/* Symbol */}
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 900, color: T.text }}>{tr.sym}</div>
              <div style={{ fontSize: 7.5, color: T.muted }}>{tr.sector}</div>
            </div>

            {/* Qty × Price */}
            <div style={{ fontSize: 8, color: T.sub }}>
              {tr.qty} × ₹{tr.price.toLocaleString("en-IN")}
            </div>

            {/* P&L */}
            <div style={{
              fontSize: 9.5, fontWeight: 900,
              color: tr.pnl >= 0 ? T.emerald : T.red,
              display: "flex", alignItems: "center", gap: 2,
            }}>
              {tr.pnl >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {tr.pnl >= 0 ? "+" : "−"}₹{Math.abs(tr.pnl).toLocaleString("en-IN")}
            </div>

            {/* Time */}
            <div style={{ fontSize: 7.5, color: T.muted, textAlign: "right" }}>
              {tr.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── VIRTUAL WALLET CARD ───────────────────────────────────────────────────────
function VirtualWalletCard({ user }) {
  const pct  = ((user.portfolio / INITIAL_BALANCE) * 100).toFixed(1);
  const isPos = user.netPnl >= 0;
  const acc  = rankAccent(user.rank);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${T.card}, ${T.panel})`,
      border: `1px solid ${T.border2}`,
      borderRadius: 14, padding: "16px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${isPos ? T.emerald : T.red}18, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{
          background: `linear-gradient(135deg, ${T.amber}33, ${T.amber}11)`,
          border: `1px solid ${T.amber}44`, borderRadius: 9, padding: "7px",
        }}>
          <Wallet size={15} color={T.amber} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, color: T.sub, letterSpacing: "0.1em" }}>VIRTUAL WALLET</div>
          <div style={{ fontSize: 8, color: T.muted }}>{user.name}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Avatar user={user} size={28} />
        </div>
      </div>

      {/* Balance */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 8, color: T.muted, letterSpacing: "0.1em", marginBottom: 3 }}>CURRENT VALUE</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: "-0.02em", lineHeight: 1 }}>
          ₹{fmtINRFull(user.portfolio)}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5, marginTop: 4,
          fontSize: 10, fontWeight: 800,
          color: isPos ? T.emerald : T.red,
        }}>
          {isPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {isPos ? "+" : "−"}₹{fmtINR(user.netPnl)} ({isPos ? "+" : ""}{user.pnlPct.toFixed(2)}%)
          <span style={{ fontSize: 8, color: T.muted, fontWeight: 600 }}>vs ₹10L start</span>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 7.5, color: T.muted }}>Portfolio growth</span>
          <span style={{ fontSize: 8, fontWeight: 800, color: isPos ? T.emerald : T.red }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${clamp((user.portfolio / (INITIAL_BALANCE * 1.5)) * 100, 2, 100)}%`,
            background: isPos
              ? `linear-gradient(90deg, ${T.emerald}, ${T.teal})`
              : `linear-gradient(90deg, ${T.red}, ${T.rose})`,
            borderRadius: 3,
            boxShadow: `0 0 8px ${isPos ? T.emerald : T.red}66`,
            transition: "width 0.8s ease",
          }} />
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 7, color: T.muted, marginTop: 3,
        }}>
          <span>₹0</span>
          <span>₹10L (Start)</span>
          <span>₹15L (Max)</span>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 6, marginTop: 12,
        paddingTop: 12, borderTop: `1px solid ${T.border}`,
      }}>
        {[
          { l: "TRADES",   v: user.trades,           c: T.cyan   },
          { l: "WIN RATE", v: `${user.winRate}%`,     c: user.winRate >= 60 ? T.emerald : T.amber },
          { l: "RANK",     v: `#${user.rank}`,        c: acc.primary },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 7, color: T.muted, letterSpacing: "0.08em", marginBottom: 2 }}>{s.l}</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function PaperTradingLeaderboard() {
  const [users,       setUsers]     = useState(() => buildUsers(MOCK_USERS_BASE));
  const [selected,    setSelected]  = useState(null);
  const [viewTab,     setViewTab]   = useState("leaderboard"); // "leaderboard"|"wallet"
  const [filterMode,  setFilterMode]= useState("all");         // "all"|"profit"|"loss"
  const [sortKey,     setSortKey]   = useState("rank");
  const tickRef = useRef(0);

  // ── Simulate live rank updates ──────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current++;
      setUsers(prev => {
        const updated = prev.map(u => {
          const delta   = rand(-0.08, 0.12);
          const pnlPct  = +(u.pnlPct + delta).toFixed(2);
          const portfolio = +(INITIAL_BALANCE * (1 + pnlPct / 100)).toFixed(0);
          const netPnl  = portfolio - INITIAL_BALANCE;
          // randomly flip a trade outcome ~5% chance
          const newWins  = rand(0, 1) < 0.05
            ? clamp(u.wins + (rand(0,1)>0.5 ? 1 : -1), 0, u.trades)
            : u.wins;
          const winRate  = +((newWins / u.trades) * 100).toFixed(1);
          return { ...u, pnlPct, portfolio, netPnl, wins: newWins, winRate };
        });
        return updated
          .sort((a, b) => b.portfolio - a.portfolio)
          .map((u, i) => ({ ...u, rank: i + 1 }));
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // ── Update selected user when rankings change ───────────────────────────────
  useEffect(() => {
    if (selected) {
      setSelected(prev => users.find(u => u.id === prev.id) || null);
    }
  }, [users]);

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = users
    .filter(u =>
      filterMode === "all"    ? true :
      filterMode === "profit" ? u.netPnl >= 0 :
      u.netPnl < 0
    )
    .sort((a, b) =>
      sortKey === "rank"    ? a.rank - b.rank :
      sortKey === "pnl"     ? b.pnlPct - a.pnlPct :
      sortKey === "winrate" ? b.winRate - a.winRate :
      a.rank - b.rank
    );

  const top3 = users.filter(u => u.rank <= 3).sort((a, b) => a.rank - b.rank);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      fontFamily: "'JetBrains Mono','IBM Plex Mono','Courier New',monospace",
      padding: "0 0 40px 0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800;900&display=swap');
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes crownBob { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-5px) rotate(3deg)} }
        @keyframes timerPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes rowFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes glowPulse {
          0%,100%{box-shadow:0 0 10px ${C.gold}44}
          50%{box-shadow:0 0 28px ${C.gold}88, 0 0 50px ${C.gold}22}
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px }
        ::-webkit-scrollbar-track { background:${T.bg} }
        ::-webkit-scrollbar-thumb { background:${T.border2}; border-radius:4px }
        ::-webkit-scrollbar-thumb:hover { background:${T.indigo} }
      `}</style>

      {/* ── CHAMPIONSHIP HERO BANNER ──────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(180deg, #0a0f1e 0%, ${T.bg} 100%)`,
        borderBottom: `1px solid ${T.border}`,
        padding: "20px 24px 0",
        position: "relative", overflow: "hidden",
      }}>
        {/* Starfield dots */}
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 37 + 11) % 100}%`,
            top:  `${(i * 53 + 7)  % 100}%`,
            width: i % 3 === 0 ? 2 : 1,
            height: i % 3 === 0 ? 2 : 1,
            borderRadius: "50%",
            background: i % 4 === 0 ? C.gold : T.border2,
            opacity: 0.4 + (i % 5) * 0.12,
            pointerEvents: "none",
          }} />
        ))}

        {/* Gold top border line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.silver}, ${C.bronze}, transparent)`,
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          {/* Title */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                background: `linear-gradient(135deg, ${C.gold}33, ${C.gold}11)`,
                border: `1px solid ${C.gold}55`,
                borderRadius: 10, padding: "8px 10px",
                boxShadow: `0 0 20px ${C.gold}33`,
                animation: "glowPulse 3s ease-in-out infinite",
              }}>
                <Trophy size={20} color={C.gold} />
              </div>
              <div>
                <div style={{
                  fontSize: 20, fontWeight: 900, letterSpacing: "0.06em",
                  background: `linear-gradient(135deg, ${C.goldLight}, ${C.gold}, ${C.bronze})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  textShadow: "none",
                }}>
                  CHAMPIONSHIP ARENA
                </div>
                <div style={{ fontSize: 8, color: T.muted, letterSpacing: "0.2em", marginTop: 1 }}>
                  PAPER TRADING COMPETITION · SEASON 14
                </div>
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
              {[
                { id: "leaderboard", label: "🏆 Leaderboard", icon: Trophy },
                { id: "wallet",      label: "💼 My Wallet",   icon: Wallet },
              ].map(tab => (
                <button key={tab.id} onClick={() => setViewTab(tab.id)} style={{
                  background: viewTab === tab.id
                    ? `linear-gradient(135deg, ${C.gold}22, ${T.amber}18)` : "transparent",
                  border: `1px solid ${viewTab === tab.id ? C.gold + "66" : T.border}`,
                  borderRadius: 8, padding: "6px 14px",
                  fontSize: 9, fontWeight: 800,
                  color: viewTab === tab.id ? C.gold : T.muted,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.18s",
                }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live indicator + season info */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: T.emerald + "14", border: `1px solid ${T.emerald}30`,
              borderRadius: 20, padding: "5px 12px",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: T.emerald, display: "inline-block",
                boxShadow: `0 0 8px ${T.emerald}`,
                animation: "timerPulse 1.5s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: T.emerald }}>LIVE RANKINGS</span>
            </div>
            <div style={{
              fontSize: 8, color: T.muted, textAlign: "right",
              background: T.panel, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "5px 10px",
            }}>
              <div style={{ color: T.sub, fontWeight: 700 }}>Virtual Capital</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: C.gold, marginTop: 1 }}>
                ₹10,00,000 / trader
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Season timer */}
        <SeasonTimer />

        {/* Competition stats row */}
        <CompetitionStats users={users} />

        {viewTab === "leaderboard" && (
          <>
            {/* ── PODIUM ─────────────────────────────────────────────────────── */}
            <div style={{
              background: `linear-gradient(180deg, #0d1526 0%, ${T.panel} 100%)`,
              border: `1px solid ${T.border}`,
              borderRadius: 16, padding: "24px 20px 0",
              position: "relative", overflow: "hidden",
            }}>
              {/* Decorative ceiling glow */}
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 400, height: 60,
                background: `radial-gradient(ellipse, ${C.gold}18 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
                <Crown size={14} color={C.gold} />
                <span style={{
                  fontSize: 9.5, fontWeight: 900, letterSpacing: "0.14em",
                  color: C.gold, textTransform: "uppercase",
                }}>
                  Top Champions
                </span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.gold}44, transparent)` }} />
              </div>

              <div style={{
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                gap: 12, paddingBottom: 0,
              }}>
                {top3.map(u => (
                  <PodiumCard key={u.id} user={u} onSelect={setSelected} selected={selected} />
                ))}
              </div>
            </div>

            {/* ── FILTER + SORT BAR ──────────────────────────────────────────── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: T.panel, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "8px 14px",
            }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[
                  { id: "all",    label: "All Traders" },
                  { id: "profit", label: "▲ In Profit"  },
                  { id: "loss",   label: "▼ In Loss"    },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilterMode(f.id)} style={{
                    background: filterMode === f.id
                      ? f.id === "profit" ? T.emerald + "22"
                      : f.id === "loss"   ? T.red + "22"
                      : T.cyan + "18" : "transparent",
                    border: `1px solid ${filterMode === f.id
                      ? f.id === "profit" ? T.emerald
                      : f.id === "loss"   ? T.red
                      : T.cyan : T.border}`,
                    borderRadius: 7, padding: "4px 12px",
                    fontSize: 8.5, fontWeight: 800,
                    color: filterMode === f.id
                      ? f.id === "profit" ? T.emerald
                      : f.id === "loss"   ? T.red
                      : T.cyan : T.muted,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {f.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 7.5, color: T.muted }}>SORT BY:</span>
                {[
                  { id: "rank",    label: "Rank"     },
                  { id: "pnl",     label: "P&L"      },
                  { id: "winrate", label: "Win Rate"  },
                ].map(s => (
                  <button key={s.id} onClick={() => setSortKey(s.id)} style={{
                    background: sortKey === s.id ? T.indigo + "22" : "transparent",
                    border: `1px solid ${sortKey === s.id ? T.indigo : T.border}`,
                    borderRadius: 6, padding: "3px 10px",
                    fontSize: 8, fontWeight: 800,
                    color: sortKey === s.id ? T.indigo : T.muted,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── TABLE HEADER ───────────────────────────────────────────────── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr 140px 130px 90px 80px",
              gap: 8, padding: "4px 14px",
            }}>
              {["RANK", "TRADER", "PORTFOLIO", "NET P&L", "ACCURACY", "BADGE"].map(h => (
                <div key={h} style={{
                  fontSize: 7.5, fontWeight: 900, color: T.muted,
                  letterSpacing: "0.12em", textAlign: h === "RANK" ? "center" : "left",
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* ── LEADERBOARD ROWS ───────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {filtered.map((u, i) => (
                <LeaderRow
                  key={u.id} user={u}
                  onSelect={u2 => setSelected(prev => prev?.id === u2.id ? null : u2)}
                  selected={selected}
                  animDelay={i * 40}
                />
              ))}
            </div>

            {/* ── SELECTED USER TRADE HISTORY ────────────────────────────────── */}
            {selected && (
              <div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 7,
                  marginBottom: 10,
                }}>
                  <Activity size={12} color={T.cyan} />
                  <span style={{ fontSize: 9.5, fontWeight: 900, color: T.cyan, letterSpacing: "0.12em" }}>
                    RECENT TRADES · STRATEGY INSIGHTS
                  </span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${T.cyan}44, transparent)` }} />
                  <span style={{ fontSize: 8, color: T.muted }}>
                    Click any row to inspect strategy
                  </span>
                </div>
                <RecentTradesPanel user={selected} />
              </div>
            )}

            {/* ── TOP 3 TRADE HISTORIES ──────────────────────────────────────── */}
            {!selected && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                  <Star size={12} color={C.gold} />
                  <span style={{ fontSize: 9.5, fontWeight: 900, color: C.gold, letterSpacing: "0.12em" }}>
                    TOP 3 STRATEGIES · LEARN FROM THE BEST
                  </span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.gold}44, transparent)` }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {top3.map(u => (
                    <RecentTradesPanel key={u.id} user={u} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {viewTab === "wallet" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {users.map(u => (
              <VirtualWalletCard key={u.id} user={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
