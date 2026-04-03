import { useState, useMemo, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart, Line
} from "recharts";

// ── THEME TOKENS (matches your existing MarketMind theme) ─────────────────────
const T = {
  bg:       "#0f172a",
  surface:  "#111827",
  panel:    "#1a2235",
  card:     "#1e2d45",
  border:   "#243044",
  border2:  "#2d3f5f",
  text:     "#f1f5f9",
  sub:      "#94a3b8",
  muted:    "#4b6080",
  cyan:     "#06b6d4",
  blue:     "#3b82f6",
  indigo:   "#6366f1",
  violet:   "#8b5cf6",
  emerald:  "#10b981",
  green:    "#22c55e",
  red:      "#ef4444",
  rose:     "#f43f5e",
  amber:    "#f59e0b",
  orange:   "#f97316",
  sky:      "#38bdf8",
  teal:     "#14b8a6",
};

// ── OPTION CHAIN DATA (Nifty 50 ATM ~24400) ───────────────────────────────────
const OPTION_CHAIN = [
  { strike: 24000, callLTP: 468.2, putLTP: 28.4,  callIV: 18.2, putIV: 20.1, callOI: 84200,  putOI: 62800  },
  { strike: 24100, callLTP: 380.6, putLTP: 40.8,  callIV: 16.8, putIV: 18.4, callOI: 142600, putOI: 98400  },
  { strike: 24200, callLTP: 312.4, putLTP: 48.2,  callIV: 14.2, putIV: 16.8, callOI: 182400, putOI: 94200  },
  { strike: 24300, callLTP: 224.6, putLTP: 68.4,  callIV: 13.1, putIV: 15.6, callOI: 214800, putOI: 142800 },
  { strike: 24400, callLTP: 148.2, putLTP: 98.8,  callIV: 12.4, putIV: 14.2, callOI: 398400, putOI: 312400, atm: true },
  { strike: 24500, callLTP: 88.6,  putLTP: 148.4, callIV: 13.8, putIV: 15.4, callOI: 286200, putOI: 224600 },
  { strike: 24600, callLTP: 42.4,  putLTP: 218.6, callIV: 15.2, putIV: 17.2, callOI: 142600, putOI: 98400  },
  { strike: 24700, callLTP: 18.2,  putLTP: 312.4, callIV: 17.4, putIV: 19.4, callOI: 84200,  putOI: 62800  },
  { strike: 24800, callLTP: 8.6,   putLTP: 402.8, callIV: 19.1, putIV: 21.2, callOI: 48200,  putOI: 38400  },
];

const SPOT     = 24400;
const LOT_SIZE = 50;

// ── PRE-MADE STRATEGIES ───────────────────────────────────────────────────────
const STRATEGIES = {
  "Bull Call Spread": {
    color: T.emerald,
    icon: "📈",
    desc: "Buy lower strike Call, Sell higher strike Call. Profit if market rises moderately.",
    build: (chain) => {
      const ai = chain.findIndex(o => o.atm);
      return [
        { type: "CE", action: "BUY",  strike: chain[ai].strike,     premium: chain[ai].callLTP,     lots: 1 },
        { type: "CE", action: "SELL", strike: chain[ai + 2].strike,  premium: chain[ai + 2].callLTP, lots: 1 },
      ];
    },
  },
  "Bear Put Spread": {
    color: T.rose,
    icon: "📉",
    desc: "Buy higher strike Put, Sell lower strike Put. Profit if market falls moderately.",
    build: (chain) => {
      const ai = chain.findIndex(o => o.atm);
      return [
        { type: "PE", action: "BUY",  strike: chain[ai].strike,     premium: chain[ai].putLTP,     lots: 1 },
        { type: "PE", action: "SELL", strike: chain[ai - 2].strike,  premium: chain[ai - 2].putLTP, lots: 1 },
      ];
    },
  },
  "Iron Condor": {
    color: T.violet,
    icon: "🦅",
    desc: "Sell OTM Call + Put, Buy further OTM Call + Put. Profit if market stays range-bound.",
    build: (chain) => {
      const ai = chain.findIndex(o => o.atm);
      return [
        { type: "CE", action: "SELL", strike: chain[ai + 1].strike, premium: chain[ai + 1].callLTP, lots: 1 },
        { type: "CE", action: "BUY",  strike: chain[ai + 3].strike, premium: chain[ai + 3].callLTP, lots: 1 },
        { type: "PE", action: "SELL", strike: chain[ai - 1].strike, premium: chain[ai - 1].putLTP,  lots: 1 },
        { type: "PE", action: "BUY",  strike: chain[ai - 3].strike, premium: chain[ai - 3].putLTP,  lots: 1 },
      ];
    },
  },
  "Long Straddle": {
    color: T.amber,
    icon: "⚡",
    desc: "Buy ATM Call + Put. Profit from large move in either direction.",
    build: (chain) => {
      const atm = chain.find(o => o.atm);
      return [
        { type: "CE", action: "BUY", strike: atm.strike, premium: atm.callLTP, lots: 1 },
        { type: "PE", action: "BUY", strike: atm.strike, premium: atm.putLTP,  lots: 1 },
      ];
    },
  },
  "Short Strangle": {
    color: T.cyan,
    icon: "🎯",
    desc: "Sell OTM Call + Put. Profit from low volatility / time decay.",
    build: (chain) => {
      const ai = chain.findIndex(o => o.atm);
      return [
        { type: "CE", action: "SELL", strike: chain[ai + 2].strike, premium: chain[ai + 2].callLTP, lots: 1 },
        { type: "PE", action: "SELL", strike: chain[ai - 2].strike, premium: chain[ai - 2].putLTP,  lots: 1 },
      ];
    },
  },
  "Bull Put Spread": {
    color: T.sky,
    icon: "🐂",
    desc: "Sell higher strike Put, Buy lower strike Put. Collect premium in mild bullish market.",
    build: (chain) => {
      const ai = chain.findIndex(o => o.atm);
      return [
        { type: "PE", action: "SELL", strike: chain[ai].strike,     premium: chain[ai].putLTP,     lots: 1 },
        { type: "PE", action: "BUY",  strike: chain[ai - 2].strike, premium: chain[ai - 2].putLTP, lots: 1 },
      ];
    },
  },
};

// ── BLACK-SCHOLES (Simplified) ────────────────────────────────────────────────
function normalCDF(x) {
  const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

function calcLegPnL(leg, spotAtExpiry) {
  const intrinsic = leg.type === "CE"
    ? Math.max(spotAtExpiry - leg.strike, 0)
    : Math.max(leg.strike - spotAtExpiry, 0);
  const pnlPerShare = leg.action === "BUY"
    ? intrinsic - leg.premium
    : leg.premium - intrinsic;
  return pnlPerShare * leg.lots * LOT_SIZE;
}

function calcStrategyPnL(legs, spotAtExpiry) {
  return legs.reduce((sum, leg) => sum + calcLegPnL(leg, spotAtExpiry), 0);
}

// ── STATS CALCULATOR ─────────────────────────────────────────────────────────
function calcStats(legs) {
  if (!legs.length) return null;
  const lower = SPOT * 0.85;
  const upper = SPOT * 1.15;
  const range = [];
  for (let s = lower; s <= upper; s += 10) range.push(s);
  const pnls = range.map(s => calcStrategyPnL(legs, s));

  const maxProfit = Math.max(...pnls);
  const maxLoss   = Math.min(...pnls);

  const breakevens = [];
  for (let i = 1; i < pnls.length; i++) {
    if ((pnls[i-1] < 0 && pnls[i] >= 0) || (pnls[i-1] >= 0 && pnls[i] < 0)) {
      const frac = (0 - pnls[i-1]) / (pnls[i] - pnls[i-1]);
      breakevens.push(Math.round(range[i-1] + frac * (range[i] - range[i-1])));
    }
  }

  const pop = Math.round((pnls.filter(p => p > 0).length / pnls.length) * 100);

  const netPremium = legs.reduce((sum, leg) =>
    sum + (leg.action === "BUY" ? -leg.premium : leg.premium) * leg.lots * LOT_SIZE, 0);

  return { maxProfit, maxLoss, breakevens, pop, netPremium };
}

// ── PAYOFF GRAPH DATA ─────────────────────────────────────────────────────────
function buildPayoffData(legs) {
  const lower = SPOT * 0.87;
  const upper = SPOT * 1.13;
  const step  = (upper - lower) / 120;
  const data  = [];
  for (let s = lower; s <= upper; s += step) {
    const pnl = calcStrategyPnL(legs, s);
    data.push({
      spot:   Math.round(s),
      profit: pnl >= 0 ? +pnl.toFixed(0) : 0,
      loss:   pnl <  0 ? +pnl.toFixed(0) : 0,
      pnl:    +pnl.toFixed(0),
    });
  }
  return data;
}

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
function PayoffTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const pnl = payload.find(p => p.dataKey === "pnl")?.value ?? 0;
  const isProfit = pnl >= 0;
  return (
    <div style={{
      background: T.card, border: `1px solid ${isProfit ? T.emerald : T.red}66`,
      borderRadius: 10, padding: "10px 14px", fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      boxShadow: `0 4px 24px ${isProfit ? T.emerald : T.red}22`,
    }}>
      <div style={{ color: T.sub, marginBottom: 4 }}>
        Spot: <span style={{ color: T.text, fontWeight: 700 }}>
          ₹{Number(label).toLocaleString("en-IN")}
        </span>
      </div>
      <div style={{ color: isProfit ? T.emerald : T.red, fontWeight: 900, fontSize: 14 }}>
        {isProfit ? "+" : ""}₹{pnl.toLocaleString("en-IN")}
      </div>
      <div style={{ color: T.muted, fontSize: 9, marginTop: 2 }}>
        {isProfit ? "PROFIT ZONE ✅" : "LOSS ZONE ❌"}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function StrategyBuilder() {
  const [selectedStrategy, setSelectedStrategy] = useState("Bull Call Spread");
  const [legs, setLegs]     = useState(() => STRATEGIES["Bull Call Spread"].build(OPTION_CHAIN));
  const [animKey, setAnimKey] = useState(0);

  const handleStrategy = useCallback((name) => {
    setSelectedStrategy(name);
    setLegs(STRATEGIES[name].build(OPTION_CHAIN));
    setAnimKey(k => k + 1);
  }, []);

  const handleLegChange = (idx, field, value) => {
    setLegs(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      if (field === "strike") {
        const s   = +value;
        const row = OPTION_CHAIN.find(o => o.strike === s);
        const prem = l.type === "CE" ? row.callLTP : row.putLTP;
        return { ...l, strike: s, premium: prem };
      }
      if (field === "type") {
        const row  = OPTION_CHAIN.find(o => o.strike === l.strike);
        const prem = value === "CE" ? row.callLTP : row.putLTP;
        return { ...l, type: value, premium: prem };
      }
      return { ...l, [field]: field === "lots" || field === "premium" ? +value : value };
    }));
  };

  const removeLeg = (idx) => setLegs(prev => prev.filter((_, i) => i !== idx));

  const addCustomLeg = () => setLegs(prev => [...prev, {
    type: "CE", action: "BUY",
    strike: OPTION_CHAIN.find(o => o.atm).strike,
    premium: OPTION_CHAIN.find(o => o.atm).callLTP,
    lots: 1,
  }]);

  const stats      = useMemo(() => calcStats(legs), [legs]);
  const payoffData = useMemo(() => buildPayoffData(legs), [legs]);
  const stratMeta  = STRATEGIES[selectedStrategy];

  const fmtINR = n => {
    if (!isFinite(n)) return "Unlimited";
    return (n >= 0 ? "+" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");
  };

  // ── Stat cards config ──
  const statCards = stats ? [
    {
      label: "MAX PROFIT", icon: "🟢",
      value: fmtINR(stats.maxProfit),
      color: T.emerald,
      sub: stats.maxProfit >= 1e6 ? "Unlimited upside" : "At expiry",
    },
    {
      label: "MAX LOSS", icon: "🔴",
      value: fmtINR(stats.maxLoss),
      color: T.red,
      sub: stats.maxLoss <= -1e6 ? "Unlimited risk" : "At expiry",
    },
    {
      label: "BREAKEVEN(S)", icon: "⚖️",
      value: stats.breakevens.length
        ? stats.breakevens.map(b => `₹${b.toLocaleString("en-IN")}`).join(" / ")
        : "N/A",
      color: T.amber,
      sub: `${stats.breakevens.length} point${stats.breakevens.length !== 1 ? "s" : ""}`,
    },
    {
      label: "PROB. OF PROFIT", icon: stats.pop >= 60 ? "🎯" : stats.pop >= 40 ? "⚡" : "⚠️",
      value: `${stats.pop}%`,
      color: stats.pop >= 60 ? T.emerald : stats.pop >= 40 ? T.amber : T.red,
      sub: "Based on expiry range",
      showBar: true, barVal: stats.pop,
    },
  ] : [];

  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Courier New',monospace",
      background: T.bg, color: T.text, minHeight: "100vh",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.35)} 50%{box-shadow:0 0 0 7px rgba(99,102,241,0)} }
        .sb-btn:hover       { transform:translateY(-2px) !important; filter:brightness(1.1); }
        .sb-leg-row:hover   { background:${T.panel} !important; }
        .sb-x:hover         { background:rgba(239,68,68,.2) !important; color:${T.red} !important; }
        .sb-addleg:hover    { background:rgba(99,102,241,.25) !important; }
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${T.bg}}
        ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:4px}
        select option{background:${T.card};color:${T.text}}
        input[type=number]{-moz-appearance:textfield}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
      `}</style>

      {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: `linear-gradient(135deg,${T.panel},#151f35)`,
        borderBottom: `1px solid ${T.border}`,
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: `linear-gradient(135deg,${T.indigo},${T.violet})`,
            borderRadius: 10, padding: "9px 11px", fontSize: 20,
            boxShadow: `0 4px 18px ${T.indigo}55`, animation: "glow 3s ease infinite",
          }}>🧩</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: T.text, letterSpacing: ".06em" }}>
              OPTION STRATEGY BUILDER
            </div>
            <div style={{ fontSize: 8.5, color: T.sub, letterSpacing: ".14em", marginTop: 2 }}>
              MARKETMIND AI v2.0 · SENSIBULL-STYLE · NIFTY 50
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { label: "SPOT",     value: `₹${SPOT.toLocaleString("en-IN")}`, color: T.cyan   },
            { label: "LOT SIZE", value: LOT_SIZE,                            color: T.amber  },
            { label: "EXPIRY",   value: "27 MAR",                            color: T.emerald},
          ].map(m => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8, color: T.muted, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ══ STRATEGY SELECTOR ═══════════════════════════════════════════════ */}
        <div>
          <div style={{ fontSize: 8.5, color: T.muted, letterSpacing: ".14em", marginBottom: 10, fontWeight: 800 }}>
            ▸ SELECT STRATEGY TEMPLATE
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {Object.entries(STRATEGIES).map(([name, meta]) => {
              const active = selectedStrategy === name;
              return (
                <button key={name} className="sb-btn" onClick={() => handleStrategy(name)} style={{
                  background: active ? `${meta.color}18` : T.card,
                  border: `1.5px solid ${active ? meta.color : T.border}`,
                  borderRadius: 10, padding: "9px 13px",
                  color: active ? meta.color : T.sub,
                  cursor: "pointer", fontFamily: "inherit",
                  fontSize: 9.5, fontWeight: active ? 900 : 700,
                  transition: "all .2s ease",
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: active ? `0 4px 18px ${meta.color}33` : "none",
                }}>
                  <span style={{ fontSize: 15 }}>{meta.icon}</span>{name}
                </button>
              );
            })}
            <button className="sb-btn" onClick={() => { setSelectedStrategy("Custom"); setLegs([]); }} style={{
              background: T.card, border: `1.5px solid ${T.border}`,
              borderRadius: 10, padding: "9px 13px", color: T.muted,
              cursor: "pointer", fontFamily: "inherit", fontSize: 9.5, fontWeight: 700,
              transition: "all .2s", display: "flex", alignItems: "center", gap: 6,
            }}>
              ✏️ Custom Build
            </button>
          </div>
          {stratMeta && (
            <div style={{
              marginTop: 9, background: `${stratMeta.color}0c`,
              border: `1px solid ${stratMeta.color}30`, borderRadius: 8,
              padding: "7px 14px", fontSize: 9, color: T.sub,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: stratMeta.color, fontWeight: 900 }}>ℹ</span>
              {stratMeta.desc}
            </div>
          )}
        </div>

        {/* ══ MAIN GRID ═══════════════════════════════════════════════════════ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 16, alignItems: "start",
        }}>

          {/* LEFT — Legs Table ─────────────────────────────────────────────── */}
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, overflow: "hidden",
          }}>
            {/* Table Header */}
            <div style={{
              background: T.panel, padding: "11px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 9.5, fontWeight: 900, color: T.indigo, letterSpacing: ".12em" }}>
                📋 STRATEGY LEGS
              </span>
              <button className="sb-addleg" onClick={addCustomLeg} style={{
                background: `${T.indigo}1a`, border: `1px solid ${T.indigo}44`,
                borderRadius: 7, padding: "4px 12px", color: T.indigo,
                cursor: "pointer", fontFamily: "inherit", fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", gap: 4, transition: "all .2s",
              }}>+ Add Leg</button>
            </div>

            {/* Column Labels */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "28px 62px 72px 82px 96px 72px 34px",
              padding: "7px 16px", background: "#151f35",
              borderBottom: `1px solid ${T.border}`,
              fontSize: 7.5, color: T.muted, fontWeight: 800, letterSpacing: ".1em",
            }}>
              {["#","TYPE","ACTION","STRIKE","PREMIUM","LOTS",""].map(h => (
                <div key={h} style={{ textAlign: "center" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {legs.length === 0 ? (
              <div style={{ padding: "36px 16px", textAlign: "center", color: T.muted, fontSize: 10 }}>
                Select a strategy template or click "+ Add Leg" to start.
              </div>
            ) : legs.map((leg, idx) => (
              <div key={idx} className="sb-leg-row" style={{
                display: "grid",
                gridTemplateColumns: "28px 62px 72px 82px 96px 72px 34px",
                padding: "9px 16px", alignItems: "center",
                borderBottom: idx < legs.length - 1 ? `1px solid ${T.border}` : "none",
                transition: "background .15s",
                animation: `fadeUp .3s ease ${idx * .06}s both`,
              }}>
                {/* # badge */}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: leg.action === "BUY" ? `${T.emerald}1a` : `${T.red}1a`,
                  border: `1px solid ${leg.action === "BUY" ? T.emerald : T.red}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 7.5, fontWeight: 900,
                  color: leg.action === "BUY" ? T.emerald : T.red,
                }}>{idx + 1}</div>

                {/* TYPE */}
                <select value={leg.type} onChange={e => handleLegChange(idx, "type", e.target.value)} style={{
                  background: leg.type === "CE" ? `${T.cyan}15` : `${T.rose}15`,
                  border: `1px solid ${leg.type === "CE" ? T.cyan : T.rose}44`,
                  borderRadius: 6, padding: "3px 5px",
                  color: leg.type === "CE" ? T.cyan : T.rose,
                  fontFamily: "inherit", fontSize: 9, fontWeight: 800, cursor: "pointer", width: "100%",
                }}>
                  <option value="CE">CE 📈</option>
                  <option value="PE">PE 📉</option>
                </select>

                {/* ACTION */}
                <select value={leg.action} onChange={e => handleLegChange(idx, "action", e.target.value)} style={{
                  background: leg.action === "BUY" ? `${T.emerald}15` : `${T.red}15`,
                  border: `1px solid ${leg.action === "BUY" ? T.emerald : T.red}44`,
                  borderRadius: 6, padding: "3px 5px",
                  color: leg.action === "BUY" ? T.emerald : T.red,
                  fontFamily: "inherit", fontSize: 9, fontWeight: 800, cursor: "pointer", width: "100%",
                }}>
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>

                {/* STRIKE */}
                <select value={leg.strike} onChange={e => handleLegChange(idx, "strike", e.target.value)} style={{
                  background: T.panel, border: `1px solid ${T.border}`,
                  borderRadius: 6, padding: "3px 5px", color: T.text,
                  fontFamily: "inherit", fontSize: 9, fontWeight: 700, cursor: "pointer", width: "100%",
                }}>
                  {OPTION_CHAIN.map(o => (
                    <option key={o.strike} value={o.strike}>
                      {o.strike}{o.atm ? " ★" : ""}
                    </option>
                  ))}
                </select>

                {/* PREMIUM */}
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", fontSize: 8, color: T.muted }}>₹</span>
                  <input type="number" value={leg.premium}
                    onChange={e => handleLegChange(idx, "premium", e.target.value)}
                    style={{
                      background: T.panel, border: `1px solid ${T.border}`,
                      borderRadius: 6, padding: "3px 5px 3px 16px", color: T.amber,
                      fontFamily: "inherit", fontSize: 9, fontWeight: 800, width: "100%",
                    }}
                  />
                </div>

                {/* LOTS */}
                <input type="number" min={1} value={leg.lots}
                  onChange={e => handleLegChange(idx, "lots", e.target.value)}
                  style={{
                    background: T.panel, border: `1px solid ${T.border}`,
                    borderRadius: 6, padding: "3px 5px", color: T.violet,
                    fontFamily: "inherit", fontSize: 9, fontWeight: 800,
                    width: "100%", textAlign: "center",
                  }}
                />

                {/* × */}
                <button className="sb-x" onClick={() => removeLeg(idx)} style={{
                  background: "transparent", border: "none",
                  color: T.muted, cursor: "pointer", fontSize: 15,
                  padding: "2px 5px", borderRadius: 6, transition: "all .15s",
                }}>×</button>
              </div>
            ))}

            {/* Footer summary bar */}
            {legs.length > 0 && stats && (
              <div style={{
                background: T.panel, borderTop: `1px solid ${T.border}`,
                padding: "7px 16px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap",
              }}>
                <span style={{ fontSize: 8.5, color: T.muted }}>
                  NET PREMIUM:{" "}
                  <span style={{ fontWeight: 900, fontSize: 9.5, color: stats.netPremium < 0 ? T.red : T.emerald }}>
                    {stats.netPremium < 0 ? "DEBIT" : "CREDIT"} ₹{Math.abs(stats.netPremium).toLocaleString("en-IN")}
                  </span>
                </span>
                <span style={{ fontSize: 8.5, color: T.muted }}>
                  LEGS: <span style={{ color: T.cyan, fontWeight: 800 }}>{legs.length}</span>
                </span>
                <span style={{ fontSize: 8.5, color: T.muted }}>
                  LOTS: <span style={{ color: T.violet, fontWeight: 800 }}>{legs.map(l => l.lots).join("+")}</span>
                </span>
              </div>
            )}
          </div>

          {/* RIGHT — Stats Panel ────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {statCards.map((card, i) => (
              <div key={card.label} style={{
                background: `${card.color}0c`,
                border: `1px solid ${card.color}30`,
                borderRadius: 12, padding: "12px 14px",
                animation: `fadeUp .4s ease ${i * .07}s both`,
              }}>
                <div style={{ fontSize: 7.5, color: T.muted, fontWeight: 800, letterSpacing: ".12em", marginBottom: 4 }}>
                  {card.icon} {card.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: card.color, letterSpacing: ".01em" }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 8, color: T.muted, marginTop: 3 }}>{card.sub}</div>
                {card.showBar && (
                  <div style={{ marginTop: 7, height: 5, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${card.barVal}%`,
                      background: `linear-gradient(90deg,${T.emerald},${T.cyan})`,
                      borderRadius: 3, transition: "width .8s ease",
                    }} />
                  </div>
                )}
              </div>
            ))}

            {/* Risk:Reward */}
            {stats && isFinite(stats.maxProfit) && isFinite(stats.maxLoss) && stats.maxLoss !== 0 && (
              <div style={{
                background: `${T.indigo}0c`, border: `1px solid ${T.indigo}30`,
                borderRadius: 12, padding: "11px 14px",
              }}>
                <div style={{ fontSize: 7.5, color: T.muted, fontWeight: 800, letterSpacing: ".1em", marginBottom: 4 }}>
                  📐 RISK : REWARD RATIO
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: T.indigo }}>
                  1 : {Math.abs(stats.maxProfit / stats.maxLoss).toFixed(2)}
                </div>
                <div style={{ fontSize: 8, color: T.muted, marginTop: 3 }}>
                  {Math.abs(stats.maxProfit / stats.maxLoss) >= 1.5 ? "✅ Favorable R:R" : "⚠️ Review before placing"}
                </div>
              </div>
            )}

            {!stats && (
              <div style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: "28px 14px", textAlign: "center",
                color: T.muted, fontSize: 9.5,
              }}>
                Add legs to see analytics
              </div>
            )}
          </div>
        </div>

        {/* ══ PAYOFF GRAPH ════════════════════════════════════════════════════ */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 14, overflow: "hidden",
        }}>
          <div style={{
            background: T.panel, padding: "12px 20px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: T.violet, letterSpacing: ".12em" }}>
                📊 PAYOFF GRAPH AT EXPIRY
              </span>
              {stratMeta && (
                <span style={{
                  fontSize: 8, background: `${stratMeta.color}1a`,
                  color: stratMeta.color, border: `1px solid ${stratMeta.color}44`,
                  padding: "2px 8px", borderRadius: 4, fontWeight: 800,
                }}>{selectedStrategy}</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 8.5, color: T.muted }}>
              {[
                { color: T.emerald, label: "Profit Zone" },
                { color: T.red,     label: "Loss Zone"   },
                { color: T.amber,   label: "Spot Price", line: true },
                { color: T.cyan,    label: "Breakeven",  line: true },
              ].map(l => (
                <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {l.line
                    ? <span style={{ width: 18, height: 2, background: l.color, display: "inline-block" }} />
                    : <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, opacity: .7, display: "inline-block" }} />}
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {legs.length > 0 ? (
            <div style={{ padding: "16px 8px 12px 8px" }} key={animKey}>
              <ResponsiveContainer width="100%" height={290}>
                <ComposedChart data={payoffData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={T.emerald} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={T.emerald} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={T.red} stopOpacity={0.04} />
                      <stop offset="95%" stopColor={T.red} stopOpacity={0.45} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} opacity={0.5} />
                  <XAxis dataKey="spot" stroke={T.border2}
                    tick={{ fill: T.muted, fontSize: 8.5, fontFamily: "'JetBrains Mono',monospace" }}
                    tickFormatter={v => `₹${Number(v).toLocaleString("en-IN")}`}
                    tickCount={8}
                  />
                  <YAxis stroke={T.border2} width={56}
                    tick={{ fill: T.muted, fontSize: 8.5, fontFamily: "'JetBrains Mono',monospace" }}
                    tickFormatter={v => `${v >= 0 ? "+" : ""}${(v / 1000).toFixed(1)}K`}
                  />
                  <Tooltip content={<PayoffTooltip />} />
                  <ReferenceLine y={0}    stroke={T.sub}   strokeDasharray="4 3" strokeWidth={1.5} />
                  <ReferenceLine x={SPOT} stroke={T.amber} strokeDasharray="5 3" strokeWidth={1.5}
                    label={{ value: "SPOT", position: "top", fill: T.amber, fontSize: 7.5, fontFamily: "'JetBrains Mono',monospace" }}
                  />
                  {stats?.breakevens.map(be => (
                    <ReferenceLine key={be} x={be} stroke={T.cyan} strokeDasharray="3 4" strokeWidth={1}
                      label={{ value: `BE ₹${be.toLocaleString("en-IN")}`, position: "insideTopLeft", fill: T.cyan, fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}
                    />
                  ))}
                  <Area type="monotone" dataKey="profit" fill="url(#gProfit)" stroke={T.emerald}
                    strokeWidth={2} dot={false} activeDot={false}
                    isAnimationActive animationDuration={700}
                  />
                  <Area type="monotone" dataKey="loss" fill="url(#gLoss)" stroke={T.red}
                    strokeWidth={2} dot={false} activeDot={false}
                    isAnimationActive animationDuration={700}
                  />
                  <Line type="monotone" dataKey="pnl" stroke={T.indigo} strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, fill: T.indigo, stroke: T.text, strokeWidth: 1.5 }}
                    isAnimationActive animationDuration={900}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: "64px 16px", textAlign: "center", color: T.muted, fontSize: 10 }}>
              📉 Add strategy legs to see the Payoff Graph
            </div>
          )}
        </div>

        {/* ══ OPTION CHAIN REFERENCE ══════════════════════════════════════════ */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 14, overflow: "hidden",
        }}>
          <div style={{
            background: T.panel, padding: "11px 20px",
            borderBottom: `1px solid ${T.border}`,
            fontSize: 9.5, fontWeight: 900, color: T.sky, letterSpacing: ".12em",
          }}>
            🔗 OPTION CHAIN REFERENCE · NIFTY 50 · 27 MAR EXPIRY
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
              <thead>
                <tr style={{ background: "#151f35" }}>
                  {[
                    { h: "OI (K)",    c: `${T.cyan}0a`  },
                    { h: "IV%",       c: `${T.cyan}0a`  },
                    { h: "LTP",       c: `${T.cyan}0a`  },
                    { h: "─── CALL ───", c: `${T.cyan}0a` },
                    { h: "STRIKE",    c: "#151f35"       },
                    { h: "─── PUT ───",  c: `${T.rose}0a` },
                    { h: "LTP",       c: `${T.rose}0a`  },
                    { h: "IV%",       c: `${T.rose}0a`  },
                    { h: "OI (K)",    c: `${T.rose}0a`  },
                  ].map((col, i) => (
                    <th key={i} style={{
                      padding: "8px 10px", color: T.muted, fontWeight: 800, letterSpacing: ".08em",
                      textAlign: "center", borderBottom: `1px solid ${T.border}`,
                      background: col.c, fontSize: 8,
                    }}>{col.h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OPTION_CHAIN.map((row, i) => (
                  <tr key={row.strike} style={{
                    background: row.atm
                      ? `linear-gradient(90deg,${T.cyan}08,${T.cyan}14,${T.cyan}08)`
                      : i % 2 === 0 ? T.card : T.panel,
                    borderBottom: `1px solid ${T.border}`,
                  }}>
                    <td style={{ padding: "7px 10px", textAlign: "center", color: T.sub }}>{(row.callOI/1000).toFixed(0)}K</td>
                    <td style={{ padding: "7px 10px", textAlign: "center", color: T.amber }}>{row.callIV}%</td>
                    <td style={{ padding: "7px 10px", textAlign: "center", color: T.cyan, fontWeight: 800 }}>₹{row.callLTP}</td>
                    <td style={{ padding: "7px 10px", background: `${T.cyan}06` }}>
                      <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden", width: "80%", margin: "0 auto" }}>
                        <div style={{ height: "100%", width: `${Math.min(row.callOI/4000,100)}%`, background: T.cyan, borderRadius: 2 }} />
                      </div>
                    </td>
                    <td style={{
                      padding: "7px 14px", textAlign: "center",
                      fontWeight: 900, fontSize: 11,
                      color: row.atm ? T.amber : T.text,
                      background: row.atm ? `${T.amber}15` : "transparent",
                    }}>
                      {row.strike}{row.atm && <span style={{ fontSize: 7.5, color: T.amber, marginLeft: 4 }}>ATM</span>}
                    </td>
                    <td style={{ padding: "7px 10px", background: `${T.rose}06` }}>
                      <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden", width: "80%", margin: "0 auto" }}>
                        <div style={{ height: "100%", width: `${Math.min(row.putOI/4000,100)}%`, background: T.rose, borderRadius: 2 }} />
                      </div>
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "center", color: T.rose, fontWeight: 800 }}>₹{row.putLTP}</td>
                    <td style={{ padding: "7px 10px", textAlign: "center", color: T.amber }}>{row.putIV}%</td>
                    <td style={{ padding: "7px 10px", textAlign: "center", color: T.sub }}>{(row.putOI/1000).toFixed(0)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ DISCLAIMER ═══════════════════════════════════════════════════════ */}
        <div style={{
          fontSize: 8, color: T.muted, textAlign: "center",
          borderTop: `1px solid ${T.border}`, paddingTop: 12,
        }}>
          ⚠️ MarketMind AI · Paper Trading Only · Not SEBI Registered · Options carry risk of loss ·
          Black-Scholes is a simplified model · Consult a SEBI-registered advisor before trading
        </div>
      </div>
    </div>
  );
}
