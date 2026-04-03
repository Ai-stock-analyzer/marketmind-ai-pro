// ── PriceAlertSystem.jsx ──────────────────────────────────────────────────────
// MarketMind AI — Browser Push Notification Price Alert System
// Features: Alert Modal · Notification API · localStorage Persistence · Live Checks
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, BellRing, BellOff, Plus, Trash2, CheckCircle2,
  TrendingUp, TrendingDown, X, AlertTriangle, Zap,
  ChevronDown, ToggleLeft, ToggleRight, Volume2, VolumeX,
} from "lucide-react";

// ── DESIGN TOKENS (matches App.jsx) ──────────────────────────────────────────
const T = {
  bg:      "#0f172a", surface: "#111827", panel:  "#1a2235", card:   "#1e2d45",
  border:  "#243044", border2: "#2d3f5f", text:   "#f1f5f9", sub:    "#94a3b8",
  muted:   "#4b6080", dim:     "#1e2d3d",
  cyan:    "#06b6d4", blue:    "#3b82f6", indigo: "#6366f1", violet: "#8b5cf6",
  emerald: "#10b981", green:   "#22c55e", red:    "#ef4444", rose:   "#f43f5e",
  amber:   "#f59e0b", orange:  "#f97316",
};

const STOCKS_LIST = ["RELIANCE","HDFCBANK","TCS","INFY","BAJFINANCE","SBIN","ICICIBANK"];
const CONDITION_LABELS = { above: "crosses above ▲", below: "crosses below ▼", pct_up: "rises by % ▲", pct_down: "falls by % ▼" };
const LS_KEY = "mm_price_alerts_v2";

// ── STORAGE HELPERS ───────────────────────────────────────────────────────────
function loadAlerts() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? []; }
  catch { return []; }
}
function saveAlerts(alerts) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(alerts)); }
  catch { /* quota exceeded — silent fail */ }
}

// ── NOTIFICATION PERMISSION ───────────────────────────────────────────────────
async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    return perm;
  }
  return Notification.permission;
}

function fireNotification(alert, livePrice) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const body =
    alert.condition === "above"
      ? `${alert.sym} crossed ₹${alert.targetPrice.toLocaleString("en-IN")} ↑  (Live: ₹${livePrice.toLocaleString("en-IN",{maximumFractionDigits:2})})`
      : alert.condition === "below"
      ? `${alert.sym} fell below ₹${alert.targetPrice.toLocaleString("en-IN")} ↓  (Live: ₹${livePrice.toLocaleString("en-IN",{maximumFractionDigits:2})})`
      : `${alert.sym} moved ${alert.condition === "pct_up" ? "+" : "-"}${alert.targetPrice}% (Live: ₹${livePrice.toLocaleString("en-IN",{maximumFractionDigits:2})})`;

  const n = new Notification("🔔 MarketMind AI Alert", {
    body,
    icon: "https://api.dicebear.com/7.x/shapes/svg?seed=marketmind",
    badge: "https://api.dicebear.com/7.x/shapes/svg?seed=badge",
    tag: `mm-alert-${alert.id}`,
    requireInteraction: true,
  });
  n.onclick = () => { window.focus(); n.close(); };
  // Auto-close after 8s
  setTimeout(() => n.close(), 8000);
}

// ── MINI COMPONENTS ───────────────────────────────────────────────────────────
const Badge = ({ children, color = T.cyan }) => (
  <span style={{
    fontSize: 7.5, fontWeight: 800, padding: "2px 7px", borderRadius: 4,
    background: color + "22", color, border: `1px solid ${color}44`, letterSpacing: "0.04em",
  }}>
    {children}
  </span>
);

const Divider = () => <div style={{ height: 1, background: T.border, margin: "10px 0" }} />;

// ── ALERT MODAL ───────────────────────────────────────────────────────────────
function AlertModal({ open, onClose, onAdd, tickers, defaultSym }) {
  const [sym,       setSym]       = useState(defaultSym || "RELIANCE");
  const [condition, setCondition] = useState("above");
  const [target,    setTarget]    = useState("");
  const [note,      setNote]      = useState("");
  const [err,       setErr]       = useState("");

  const liveTick = tickers.find(t => t.sym === sym);
  const livePrice = liveTick?.price ?? 0;

  useEffect(() => {
    if (open) { setSym(defaultSym || "RELIANCE"); setTarget(""); setNote(""); setErr(""); }
  }, [open, defaultSym]);

  function handleAdd() {
    const val = parseFloat(target);
    if (!target || isNaN(val) || val <= 0) { setErr("Enter a valid target value."); return; }
    if ((condition === "above" || condition === "below") && val === livePrice) {
      setErr("Target must differ from current price."); return;
    }
    if ((condition === "pct_up" || condition === "pct_down") && (val <= 0 || val > 100)) {
      setErr("Enter a % between 0.1 and 100."); return;
    }
    onAdd({ sym, condition, targetPrice: val, note, createdAt: Date.now(), liveAtCreation: livePrice });
    onClose();
  }

  if (!open) return null;

  const inp = {
    background: T.dim, border: `1px solid ${T.border2}`, borderRadius: 8,
    color: T.text, padding: "8px 12px", fontSize: 11, fontFamily: "inherit",
    outline: "none", width: "100%",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(7,13,26,0.82)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.surface, border: `1px solid ${T.indigo}55`,
        borderRadius: 16, padding: "22px 24px", width: 400, maxWidth: "92vw",
        boxShadow: `0 0 50px ${T.indigo}22, 0 24px 60px #00000066`,
        animation: "alertSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: `linear-gradient(135deg,${T.amber},${T.orange})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 16px ${T.amber}44`,
            }}>
              <BellRing size={17} color="#0f172a" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>New Price Alert</div>
              <div style={{ fontSize: 8, color: T.muted }}>Browser notification on trigger</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", color: T.muted,
            padding: 4, borderRadius: 6, display: "flex",
          }}
            onMouseEnter={e => e.currentTarget.style.color = T.red}
            onMouseLeave={e => e.currentTarget.style.color = T.muted}
          >
            <X size={16} />
          </button>
        </div>

        {/* Stock Selector */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 8, color: T.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            Stock Symbol
          </label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {STOCKS_LIST.map(s => (
              <button key={s} onClick={() => setSym(s)} style={{
                padding: "5px 10px", borderRadius: 7, fontSize: 9, fontWeight: 800,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: sym === s ? T.cyan + "25" : T.dim,
                color: sym === s ? T.cyan : T.sub,
                border: `1px solid ${sym === s ? T.cyan + "66" : T.border}`,
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Live Price Badge */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
          padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 9, color: T.muted }}>Current Live Price</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.emerald, display: "inline-block", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 14, fontWeight: 900, color: T.emerald }}>
              ₹{livePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Condition */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 8, color: T.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            Condition
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {Object.entries(CONDITION_LABELS).map(([k, v]) => (
              <button key={k} onClick={() => setCondition(k)} style={{
                padding: "7px 8px", borderRadius: 7, fontSize: 8.5, fontWeight: 800,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "left",
                background: condition === k
                  ? (k.includes("up") || k === "above" ? T.emerald + "22" : T.red + "22")
                  : T.dim,
                color: condition === k
                  ? (k.includes("up") || k === "above" ? T.emerald : T.red)
                  : T.sub,
                border: `1px solid ${condition === k
                  ? (k.includes("up") || k === "above" ? T.emerald + "55" : T.red + "55")
                  : T.border}`,
              }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Target Value */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 8, color: T.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            {condition === "pct_up" || condition === "pct_down" ? "Percentage (%)" : "Target Price (₹)"}
          </label>
          <input
            type="number"
            value={target}
            onChange={e => { setTarget(e.target.value); setErr(""); }}
            placeholder={condition === "pct_up" || condition === "pct_down" ? "e.g. 3.5" : "e.g. 2900"}
            style={inp}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          {err && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 8.5, color: T.red }}>
              <AlertTriangle size={10} /> {err}
            </div>
          )}
        </div>

        {/* Note (optional) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 8, color: T.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Resistance breakout entry"
            style={{ ...inp, fontSize: 10 }}
            maxLength={80}
          />
        </div>

        {/* Preview */}
        {target && !isNaN(parseFloat(target)) && (
          <div style={{
            background: T.indigo + "12", border: `1px solid ${T.indigo}33`, borderRadius: 8,
            padding: "8px 12px", marginBottom: 14, fontSize: 9, color: T.sub, lineHeight: 1.6,
          }}>
            <span style={{ color: T.indigo, fontWeight: 800 }}>🔔 Preview: </span>
            Notify me when <strong style={{ color: T.cyan }}>{sym}</strong> {CONDITION_LABELS[condition]}{" "}
            <strong style={{ color: T.amber }}>
              {condition === "pct_up" || condition === "pct_down" ? `${target}%` : `₹${parseFloat(target).toLocaleString("en-IN")}`}
            </strong>
            {note && <span style={{ color: T.muted }}> — "{note}"</span>}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${T.border}`,
            background: "transparent", color: T.sub, fontWeight: 800, fontSize: 10,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Cancel
          </button>
          <button onClick={handleAdd} style={{
            flex: 2, padding: "9px 0", borderRadius: 8, border: "none",
            background: `linear-gradient(135deg,${T.amber},${T.orange})`,
            color: "#0f172a", fontWeight: 900, fontSize: 10,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: `0 4px 16px ${T.amber}44`,
          }}>
            <BellRing size={12} /> Set Alert
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ALERT LIST PANEL ──────────────────────────────────────────────────────────
function AlertPanel({ open, onClose, alerts, tickers, onDelete, onToggle, onClearAll }) {
  const [filter, setFilter] = useState("all"); // "all"|"active"|"triggered"

  const enriched = alerts.map(a => {
    const tick = tickers.find(t => t.sym === a.sym);
    const live = tick?.price ?? a.liveAtCreation ?? 0;
    let triggered = false;
    if      (a.condition === "above")    triggered = live >= a.targetPrice;
    else if (a.condition === "below")    triggered = live <= a.targetPrice;
    else if (a.condition === "pct_up")   triggered = live >= a.liveAtCreation * (1 + a.targetPrice / 100);
    else if (a.condition === "pct_down") triggered = live <= a.liveAtCreation * (1 - a.targetPrice / 100);
    const dist = ((live - a.targetPrice) / a.targetPrice * 100).toFixed(2);
    return { ...a, live, triggered, dist: +dist };
  });

  const filtered = enriched.filter(a => {
    if (filter === "active")    return !a.triggered && a.enabled !== false;
    if (filter === "triggered") return a.triggered;
    return true;
  });

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(7,13,26,0.78)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.surface, borderLeft: `1px solid ${T.border}`,
        width: 360, maxWidth: "92vw", height: "100vh", overflowY: "auto",
        padding: "18px 16px", animation: "slideFromRight 0.22s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BellRing size={15} color={T.amber} />
            <span style={{ fontSize: 13, fontWeight: 900, color: T.text }}>Price Alerts</span>
            <Badge color={T.amber}>{alerts.length}</Badge>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
            <X size={15} />
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
          {["all", "active", "triggered"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 8, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.06em",
              background: filter === f ? T.amber + "22" : "transparent",
              color: filter === f ? T.amber : T.muted,
              border: `1px solid ${filter === f ? T.amber + "55" : T.border}`,
            }}>
              {f}
            </button>
          ))}
          {alerts.length > 0 && (
            <button onClick={onClearAll} style={{
              marginLeft: "auto", padding: "4px 8px", borderRadius: 6, fontSize: 8, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit", background: T.red + "15",
              color: T.red, border: `1px solid ${T.red}33`,
            }}>
              Clear All
            </button>
          )}
        </div>

        {/* Alert Cards */}
        {filtered.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "48px 0", gap: 10,
          }}>
            <BellOff size={28} color={T.muted} />
            <div style={{ fontSize: 10, color: T.muted }}>
              {alerts.length === 0 ? "No alerts set. Click + to add one." : `No ${filter} alerts.`}
            </div>
          </div>
        )}

        {filtered.map(a => {
          const isUp = a.condition === "above" || a.condition === "pct_up";
          const condColor = isUp ? T.emerald : T.red;
          const pctToTarget = a.condition === "pct_up" || a.condition === "pct_down"
            ? null
            : (((a.targetPrice - a.live) / a.live) * 100).toFixed(2);

          return (
            <div key={a.id} style={{
              background: a.triggered ? T.amber + "0a" : T.card,
              border: `1px solid ${a.triggered ? T.amber + "55" : a.enabled === false ? T.border : condColor + "33"}`,
              borderRadius: 10, padding: "11px 13px", marginBottom: 8,
              opacity: a.enabled === false ? 0.55 : 1,
              transition: "all 0.2s",
              position: "relative", overflow: "hidden",
            }}>
              {a.triggered && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg,${T.amber},${T.orange})`,
                }} />
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: T.text }}>{a.sym}</span>
                  <Badge color={condColor}>{CONDITION_LABELS[a.condition].split(" ")[0]}</Badge>
                  {a.triggered && <Badge color={T.amber}>TRIGGERED</Badge>}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {/* Toggle */}
                  <button onClick={() => onToggle(a.id)} title={a.enabled === false ? "Enable" : "Disable"} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: a.enabled === false ? T.muted : T.emerald, display: "flex",
                  }}>
                    {a.enabled === false ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                  </button>
                  {/* Delete */}
                  <button onClick={() => onDelete(a.id)} style={{
                    background: "none", border: "none", cursor: "pointer", color: T.muted,
                    display: "flex", borderRadius: 4, padding: 2,
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = T.red}
                    onMouseLeave={e => e.currentTarget.style.color = T.muted}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Price info */}
              <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 7, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 1 }}>Target</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: condColor }}>
                    {a.condition === "pct_up" || a.condition === "pct_down"
                      ? `${a.targetPrice}%`
                      : `₹${a.targetPrice.toLocaleString("en-IN")}`}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 7, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 1 }}>Live</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: T.cyan }}>
                    ₹{a.live.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </div>
                </div>
                {pctToTarget !== null && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 7, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 1 }}>Distance</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: Math.abs(pctToTarget) < 1 ? T.amber : T.sub }}>
                      {pctToTarget > 0 ? "+" : ""}{pctToTarget}%
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar toward target */}
              {!a.triggered && (a.condition === "above" || a.condition === "below") && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${Math.min(100, Math.max(0,
                        a.condition === "above"
                          ? (a.live - a.liveAtCreation) / (a.targetPrice - a.liveAtCreation) * 100
                          : (a.liveAtCreation - a.live) / (a.liveAtCreation - a.targetPrice) * 100
                      ))}%`,
                      background: condColor,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              )}

              {a.note && (
                <div style={{ marginTop: 5, fontSize: 8, color: T.muted, fontStyle: "italic" }}>📝 {a.note}</div>
              )}

              <div style={{ marginTop: 4, fontSize: 7.5, color: T.muted }}>
                Set: {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TOAST NOTIFICATION (in-app) ───────────────────────────────────────────────
function AlertToast({ toasts }) {
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 10000,
      display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: T.surface, border: `1px solid ${T.amber}88`,
          borderRadius: 10, padding: "10px 14px", maxWidth: 300,
          boxShadow: `0 0 24px ${T.amber}33, 0 8px 32px #00000055`,
          display: "flex", alignItems: "flex-start", gap: 10,
          animation: "toastSlide 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          borderLeft: `3px solid ${T.amber}`,
        }}>
          <BellRing size={14} color={T.amber} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: T.amber, marginBottom: 2 }}>🔔 Price Alert Triggered</div>
            <div style={{ fontSize: 9, color: T.sub, lineHeight: 1.5 }}>{t.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PERMISSION BANNER ─────────────────────────────────────────────────────────
function PermissionBanner({ perm, onRequest }) {
  if (perm === "granted" || perm === "unsupported") return null;
  return (
    <div style={{
      background: T.amber + "12", border: `1px solid ${T.amber}33`,
      borderRadius: 8, padding: "8px 12px",
      display: "flex", alignItems: "center", gap: 8, fontSize: 8.5,
    }}>
      <AlertTriangle size={12} color={T.amber} />
      <span style={{ color: T.sub, flex: 1 }}>
        {perm === "denied"
          ? "Browser notifications blocked. Enable in browser settings for push alerts."
          : "Allow notifications to receive desktop alerts when prices are triggered."}
      </span>
      {perm !== "denied" && (
        <button onClick={onRequest} style={{
          background: `linear-gradient(135deg,${T.amber},${T.orange})`,
          border: "none", borderRadius: 5, padding: "4px 10px",
          color: "#0f172a", fontSize: 8, fontWeight: 900, cursor: "pointer", fontFamily: "inherit",
        }}>
          Allow
        </button>
      )}
    </div>
  );
}

// ── MAIN HOOK: usePriceAlerts ─────────────────────────────────────────────────
// Integrate this hook into your main App.jsx
export function usePriceAlerts(tickers) {
  const [alerts,   setAlerts]   = useState(() => loadAlerts());
  const [toasts,   setToasts]   = useState([]);
  const [notifPerm,setNotifPerm]= useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported"
  );
  const triggeredRef = useRef(new Set()); // IDs already fired this session

  // Persist to localStorage on every change
  useEffect(() => { saveAlerts(alerts); }, [alerts]);

  // ── LIVE PRICE CHECK (runs every time tickers update) ──────────────────────
  useEffect(() => {
    if (!tickers?.length) return;

    alerts.forEach(alert => {
      if (alert.enabled === false) return;
      if (triggeredRef.current.has(alert.id)) return; // already fired

      const tick = tickers.find(t => t.sym === alert.sym);
      if (!tick) return;
      const live = tick.price;

      let hit = false;
      if      (alert.condition === "above")    hit = live >= alert.targetPrice;
      else if (alert.condition === "below")    hit = live <= alert.targetPrice;
      else if (alert.condition === "pct_up")   hit = live >= alert.liveAtCreation * (1 + alert.targetPrice / 100);
      else if (alert.condition === "pct_down") hit = live <= alert.liveAtCreation * (1 - alert.targetPrice / 100);

      if (hit) {
        triggeredRef.current.add(alert.id);

        // 1. Browser push notification
        fireNotification(alert, live);

        // 2. In-app toast
        const message = `${alert.sym} ${CONDITION_LABELS[alert.condition]} ` +
          (alert.condition === "pct_up" || alert.condition === "pct_down"
            ? `${alert.targetPrice}%`
            : `₹${alert.targetPrice.toLocaleString("en-IN")}`) +
          ` — Live: ₹${live.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` +
          (alert.note ? ` (${alert.note})` : "");

        const toastId = Date.now() + Math.random();
        setToasts(p => [...p, { id: toastId, message }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== toastId)), 5500);

        // 3. Auto-disable once triggered (optional — keeps history)
        setAlerts(p => p.map(a => a.id === alert.id ? { ...a, triggeredAt: Date.now() } : a));
      }
    });
  }, [tickers, alerts]);

  function addAlert(data) {
    const newAlert = { ...data, id: `alert_${Date.now()}_${Math.random().toString(36).slice(2)}`, enabled: true };
    setAlerts(p => [newAlert, ...p]);
  }

  function deleteAlert(id) {
    triggeredRef.current.delete(id);
    setAlerts(p => p.filter(a => a.id !== id));
  }

  function toggleAlert(id) {
    triggeredRef.current.delete(id); // re-arm if re-enabled
    setAlerts(p => p.map(a => a.id === id ? { ...a, enabled: a.enabled === false ? true : false } : a));
  }

  function clearAll() {
    triggeredRef.current.clear();
    setAlerts([]);
  }

  async function requestPermission() {
    const perm = await requestNotificationPermission();
    setNotifPerm(perm);
  }

  return {
    alerts, toasts, notifPerm,
    addAlert, deleteAlert, toggleAlert, clearAll, requestPermission,
  };
}

// ── EXPORTED COMBINED UI COMPONENT ───────────────────────────────────────────
// Drop this anywhere in your JSX tree. It self-manages modal/panel state.
export default function PriceAlertSystem({ tickers, defaultSym, compact = false }) {
  const [modalOpen,  setModalOpen]  = useState(false);
  const [panelOpen,  setPanelOpen]  = useState(false);

  const {
    alerts, toasts, notifPerm,
    addAlert, deleteAlert, toggleAlert, clearAll, requestPermission,
  } = usePriceAlerts(tickers);

  const activeCount  = alerts.filter(a => a.enabled !== false && !a.triggeredAt).length;
  const triggeredCount = alerts.filter(a => a.triggeredAt).length;

  return (
    <>
      {/* ── BELL BUTTON (embed this in your header) ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {!compact && (
          <PermissionBanner perm={notifPerm} onRequest={requestPermission} />
        )}

        {/* Bell Icon with badge */}
        <button
          onClick={() => setPanelOpen(true)}
          title="Price Alerts"
          style={{
            position: "relative", background: "none", border: "none",
            cursor: "pointer", color: alerts.length > 0 ? T.amber : T.muted,
            display: "flex", alignItems: "center", padding: 4,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = T.amber}
          onMouseLeave={e => e.currentTarget.style.color = alerts.length > 0 ? T.amber : T.muted}
        >
          {alerts.length > 0 ? <BellRing size={15} /> : <Bell size={15} />}
          {activeCount > 0 && (
            <span style={{
              position: "absolute", top: -1, right: -1,
              width: 14, height: 14, borderRadius: "50%",
              background: `linear-gradient(135deg,${T.amber},${T.orange})`,
              color: "#0f172a", fontSize: 7.5, fontWeight: 900,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1.5px solid ${T.surface}`,
            }}>
              {activeCount > 9 ? "9+" : activeCount}
            </span>
          )}
        </button>

        {/* Add Alert button */}
        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: `linear-gradient(135deg,${T.amber}22,${T.orange}11)`,
            border: `1px solid ${T.amber}44`, borderRadius: 7,
            padding: "4px 9px", color: T.amber, fontSize: 8.5, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <Plus size={10} /> Alert
        </button>
      </div>

      {/* ── MODAL ── */}
      <AlertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addAlert}
        tickers={tickers}
        defaultSym={defaultSym}
      />

      {/* ── SIDE PANEL ── */}
      <AlertPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        alerts={alerts}
        tickers={tickers}
        onDelete={deleteAlert}
        onToggle={toggleAlert}
        onClearAll={clearAll}
      />

      {/* ── TOASTS ── */}
      <AlertToast toasts={toasts} />

      {/* ── PERMISSION BANNER (if panel is open) ── */}
      {panelOpen && notifPerm !== "granted" && notifPerm !== "unsupported" && (
        <div style={{ position: "fixed", bottom: 20, left: 20, zIndex: 10001, maxWidth: 320 }}>
          <PermissionBanner perm={notifPerm} onRequest={requestPermission} />
        </div>
      )}

      <style>{`
        @keyframes alertSlideIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes toastSlide {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50%      { opacity:.5; box-shadow: 0 0 0 5px rgba(16,185,129,0); }
        }
      `}</style>
    </>
  );
}
