import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, Zap, Shield, Wifi,
  TrendingUp, TrendingDown, Activity
} from "lucide-react";

// ── EXACT SAME TOKENS AS App.jsx ─────────────────────────────────────────────
const DARK_T = {
  bg:"#0f172a", surface:"#111827", panel:"#1a2235", card:"#1e2d45",
  border:"#243044", border2:"#2d3f5f", text:"#f1f5f9", sub:"#94a3b8",
  muted:"#4b6080", dim:"#1e2d3d",
  cyan:"#06b6d4", blue:"#3b82f6", indigo:"#6366f1", violet:"#8b5cf6",
  emerald:"#10b981", green:"#22c55e", red:"#ef4444", rose:"#f43f5e",
  amber:"#f59e0b", orange:"#f97316", yellow:"#eab308",
  sky:"#38bdf8", purple:"#a78bfa", teal:"#14b8a6",
};
const LIGHT_T = {
  bg:"#f1f5f9", surface:"#ffffff", panel:"#f8fafc", card:"#ffffff",
  border:"#e2e8f0", border2:"#cbd5e1", text:"#0f172a", sub:"#475569",
  muted:"#94a3b8", dim:"#e8f0f8",
  cyan:"#0891b2", blue:"#2563eb", indigo:"#4f46e5", violet:"#7c3aed",
  emerald:"#059669", green:"#16a34a", red:"#dc2626", rose:"#e11d48",
  amber:"#d97706", orange:"#ea580c", yellow:"#ca8a04",
  sky:"#0284c7", purple:"#7c3aed", teal:"#0d9488",
};
// Exact same G tokens from App.jsx
const G = {
  growwGreen:"#00d09c", growwDark:"#1b2034", growwCard:"#1e2640",
  growwBorder:"#2a3550", sipBlue:"#4f8ef7", goldYellow:"#f5c542", etfPurple:"#a259ff",
};

// ── TICKERS ───────────────────────────────────────────────────────────────────
const BASE_TICKERS = [
  { sym:"RELIANCE",  price:"2,847.40", chg:"+1.12%", up:true  },
  { sym:"TCS",       price:"3,412.85", chg:"-0.38%", up:false },
  { sym:"HDFCBANK",  price:"1,623.20", chg:"+0.74%", up:true  },
  { sym:"INFY",      price:"1,587.65", chg:"+1.18%", up:true  },
  { sym:"BAJFINANCE",price:"6,891.00", chg:"+2.24%", up:true  },
  { sym:"SBIN",      price:"812.40",   chg:"-0.51%", up:false },
  { sym:"ICICIBANK", price:"1,102.30", chg:"+0.63%", up:true  },
  { sym:"NIFTY 50",  price:"24,402",   chg:"+0.48%", up:true  },
  { sym:"SENSEX",    price:"80,110",   chg:"+0.52%", up:true  },
  { sym:"USDINR",    price:"83.42",    chg:"-0.06%", up:false },
  { sym:"GOLD",      price:"7,357",    chg:"+0.34%", up:true  },
  { sym:"CRUDEOIL",  price:"6,842",    chg:"-1.12%", up:false },
];

const SPARK_UP   = [40,38,41,39,44,42,46,43,48,45,50,47,52,49,55];
const SPARK_DOWN = [55,53,57,51,48,50,46,49,43,47,41,44,38,42,36];

// ── SPARKLINE ─────────────────────────────────────────────────────────────────
const Sparkline = ({ data, color, w=80, h=26 }) => {
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  const id=`sp_${color.replace(/[^a-z0-9]/gi,"")}`;
  return (
    <svg width={w} height={h} style={{display:"block",flexShrink:0}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`}/>
    </svg>
  );
};

// ── TICKER STRIP ──────────────────────────────────────────────────────────────
const TickerStrip = ({ T, isDark }) => {
  const [tickers, setTickers] = useState(BASE_TICKERS);
  useEffect(() => {
    const iv = setInterval(() => {
      setTickers(prev => prev.map(t => {
        const delta = (Math.random()-0.5)*0.14;
        const raw = parseFloat(t.chg.replace("%","").replace("+","")) + delta;
        const up = raw >= 0;
        return { ...t, chg:`${up?"+":""}${raw.toFixed(2)}%`, up };
      }));
    }, 2400);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:36,zIndex:2,
        background:`linear-gradient(to right,${T.surface},transparent)`,pointerEvents:"none"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:36,zIndex:2,
        background:`linear-gradient(to left,${T.surface},transparent)`,pointerEvents:"none"}}/>
      <motion.div style={{display:"flex",whiteSpace:"nowrap"}}
        animate={{x:["0%","-50%"]}} transition={{duration:32,repeat:Infinity,ease:"linear"}}>
        {[...tickers,...tickers].map((t,i)=>(
          <div key={i} style={{
            display:"inline-flex",alignItems:"center",gap:7,
            padding:"5px 18px",borderRight:`1px solid ${T.border}`,
            fontFamily:"'JetBrains Mono',monospace",
          }}>
            <span style={{fontSize:8.5,fontWeight:700,color:T.sub,letterSpacing:"0.07em"}}>{t.sym}</span>
            <span style={{fontSize:8.5,fontWeight:700,color:T.text}}>{t.price}</span>
            <span style={{fontSize:8,fontWeight:700,color:t.up?DARK_T.emerald:DARK_T.red,
              display:"flex",alignItems:"center",gap:2}}>
              {t.up?<TrendingUp size={9}/>:<TrendingDown size={9}/>}{t.chg}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// ── STAT CARD ─────────────────────────────────────────────────────────────────
const StatCard = ({ T, icon:Icon, label, value, change, up, spark }) => (
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,
    padding:"10px 12px",display:"flex",flexDirection:"column",gap:6}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <Icon size={11} color={DARK_T.cyan} strokeWidth={2.5}/>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,
          color:T.sub,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</span>
      </div>
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,
        color:up?DARK_T.emerald:DARK_T.red}}>{change}</span>
    </div>
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:900,
        color:T.text,letterSpacing:"-0.02em"}}>{value}</span>
      <Sparkline data={spark} color={up?DARK_T.emerald:DARK_T.red}/>
    </div>
  </div>
);

// ── FLOAT INPUT ───────────────────────────────────────────────────────────────
const AuthInput = ({ T, isDark, label, type, value, onChange, icon:Icon, showToggle }) => {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const active = focused || value.length > 0;
  const inputType = showToggle ? (visible?"text":"password") : type;
  return (
    <div style={{position:"relative",width:"100%"}}>
      <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
        color:focused?G.growwGreen:T.muted,transition:"color 0.2s",
        display:"flex",alignItems:"center",pointerEvents:"none",zIndex:1}}>
        <Icon size={14} strokeWidth={2}/>
      </div>
      <motion.label
        animate={{y:active?-9:0,scale:active?0.74:1,color:focused?G.growwGreen:T.muted}}
        transition={{duration:0.17}}
        style={{position:"absolute",left:38,top:14,
          fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:500,
          transformOrigin:"left",pointerEvents:"none",zIndex:1}}>
        {label}
      </motion.label>
      <input
        type={inputType} value={value}
        onChange={onChange}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%",paddingTop:22,paddingBottom:8,
          paddingLeft:38,paddingRight:showToggle?40:14,
          background:isDark?T.dim:"#e8f4ff",
          color:T.text,
          border:`1px solid ${focused?G.growwGreen:T.border}`,
          borderRadius:8,outline:"none",
          fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:500,
          boxShadow:focused?`0 0 0 3px ${G.growwGreen}1a`:"none",
          transition:"border-color 0.2s,box-shadow 0.2s",
        }}/>
      {showToggle&&(
        <button onClick={()=>setVisible(v=>!v)} style={{
          position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
          background:"none",border:"none",cursor:"pointer",
          color:T.muted,display:"flex",alignItems:"center",padding:0}}>
          {visible?<EyeOff size={14}/>:<Eye size={14}/>}
        </button>
      )}
    </div>
  );
};

// ── GOOGLE ICON ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── SPLASH ────────────────────────────────────────────────────────────────────
const Splash = ({ isDark, onDone }) => {
  const T = isDark ? DARK_T : LIGHT_T;
  useEffect(()=>{ const t=setTimeout(onDone,2800); return()=>clearTimeout(t); },[onDone]);
  return (
    <motion.div style={{position:"fixed",inset:0,zIndex:100,background:T.bg,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden"}}
      exit={{opacity:0,scale:1.04,filter:"blur(8px)"}}
      transition={{duration:0.6,ease:[0.4,0,0.2,1]}}>

      {/* Grid — App.jsx bg pattern */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.04,pointerEvents:"none"}}>
        <defs><pattern id="sg" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={T.sub} strokeWidth="0.5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#sg)"/>
      </svg>

      {/* Glows */}
      <motion.div style={{position:"absolute",width:560,height:560,borderRadius:"50%",pointerEvents:"none",
        background:`radial-gradient(circle,${G.growwGreen}0c 0%,transparent 68%)`}}
        animate={{scale:[1,1.14,1],opacity:[0.5,1,0.5]}} transition={{duration:4,repeat:Infinity,ease:"easeInOut"}}/>
      <motion.div style={{position:"absolute",width:320,height:320,borderRadius:"50%",pointerEvents:"none",
        background:`radial-gradient(circle,${DARK_T.cyan}08 0%,transparent 65%)`}}
        animate={{scale:[1.1,0.94,1.1]}} transition={{duration:3.1,repeat:Infinity,ease:"easeInOut"}}/>

      {/* Logo ring */}
      <svg width="118" height="118" viewBox="0 0 118 118" fill="none" style={{marginBottom:22}}>
        <defs>
          <linearGradient id="splRing" x1="0" y1="0" x2="118" y2="118" gradientUnits="userSpaceOnUse">
            <stop stopColor={G.growwGreen}/>
            <stop offset="0.5" stopColor={DARK_T.cyan}/>
            <stop offset="1" stopColor={G.sipBlue}/>
          </linearGradient>
        </defs>
        <circle cx="59" cy="59" r="57" stroke={G.growwGreen} strokeWidth="0.5" strokeOpacity="0.18"/>
        <motion.circle cx="59" cy="59" r="53"
          stroke="url(#splRing)" strokeWidth="1.5" fill="none"
          strokeDasharray="333" strokeDashoffset="333"
          animate={{strokeDashoffset:0}} transition={{duration:1.4,ease:"easeOut"}}/>
        <circle cx="59" cy="59" r="45" fill={isDark?"#0c1625":"#edf4ff"}/>
        <motion.text x="59" y="76" textAnchor="middle"
          fill={isDark?"#f1f5f9":"#0f172a"}
          fontFamily="'JetBrains Mono',monospace" fontWeight="900" fontSize="44"
          initial={{opacity:0,y:84}} animate={{opacity:1,y:76}}
          transition={{delay:0.95,duration:0.5,ease:"easeOut"}}
          style={{filter:`drop-shadow(0 0 16px ${G.growwGreen}88)`}}>M</motion.text>
        <motion.circle cx="59" cy="103" r="3" fill={G.growwGreen}
          initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}}
          transition={{delay:1.4,duration:0.4,ease:[0.34,1.56,0.64,1]}}/>
      </svg>

      {/* Wordmark */}
      <motion.div style={{textAlign:"center"}}
        initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
        transition={{delay:1.1,duration:0.55}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:30,fontWeight:900,
          color:T.text,letterSpacing:"0.07em",textShadow:`0 0 32px ${G.growwGreen}44`}}>
          Market<span style={{color:G.growwGreen}}>Mind</span>
          <span style={{color:DARK_T.cyan,fontSize:13,fontWeight:700,marginLeft:4}}>AI</span>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:500,
          color:T.sub,letterSpacing:"0.38em",marginTop:5,textTransform:"uppercase"}}>
          Trading Terminal v8.0
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div style={{marginTop:40,width:160,height:2,background:T.border,borderRadius:2,overflow:"hidden"}}
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}}>
        <motion.div style={{height:"100%",borderRadius:2,
          background:`linear-gradient(90deg,${G.growwGreen},${DARK_T.cyan})`,transformOrigin:"left"}}
          initial={{scaleX:0}} animate={{scaleX:1}}
          transition={{delay:1.6,duration:1.0,ease:"easeInOut"}}/>
      </motion.div>
      <motion.div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:500,
        color:T.muted,letterSpacing:"0.36em",marginTop:10,textTransform:"uppercase"}}
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.7}}>
        Initializing Systems...
      </motion.div>

      {/* Scanline */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",opacity:0.022,
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,1) 2px,rgba(255,255,255,1) 3px)",
        backgroundSize:"100% 4px"}}/>
    </motion.div>
  );
};

// ── AUTH PAGE ─────────────────────────────────────────────────────────────────
const AuthPage = ({ isDark, toggleTheme }) => {
  const T = isDark ? DARK_T : LIGHT_T;
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const isIn = tab === "signin";

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(()=>setLoading(false), 1500);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",minHeight:"100vh",background:T.bg,
      fontFamily:"'JetBrains Mono',monospace"}}>

      {/* ── HEADER — same as App.jsx ── */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,
        padding:"0 20px",display:"flex",alignItems:"center",
        justifyContent:"space-between",height:44,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:28,height:28,borderRadius:7,
            background:`linear-gradient(135deg,${G.growwGreen},${DARK_T.cyan})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 0 12px ${G.growwGreen}55`,flexShrink:0}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:900,color:"#0a1628"}}>M</span>
          </div>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:900,
              color:T.text,letterSpacing:"0.06em",lineHeight:1}}>
              Market<span style={{color:G.growwGreen}}>Mind</span>
              <span style={{color:DARK_T.cyan,fontSize:9,marginLeft:3}}>AI</span>
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,
              color:T.muted,letterSpacing:"0.18em",textTransform:"uppercase"}}>Trading Terminal v8.0</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",
            background:T.card,border:`1px solid ${T.border}`,borderRadius:6}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:DARK_T.emerald,
              boxShadow:`0 0 6px ${DARK_T.emerald}`,animation:"pulse 2s infinite",display:"inline-block"}}/>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:T.sub,fontWeight:600}}>LIVE</span>
          </div>
          <button onClick={toggleTheme} style={{
            background:T.card,border:`1px solid ${T.border}`,borderRadius:6,
            padding:"4px 10px",cursor:"pointer",
            fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.sub,fontWeight:700,letterSpacing:"0.1em"}}>
            {isDark?"☀ LIGHT":"🌙 DARK"}
          </button>
        </div>
      </div>

      {/* ── TICKER ── */}
      <TickerStrip T={T} isDark={isDark}/>

      {/* ── BODY ── */}
      <div style={{display:"flex",flex:1}}>

        {/* ── LEFT PANEL ── */}
        <div className="auth-left" style={{
          flex:1,background:T.panel,borderRight:`1px solid ${T.border}`,
          display:"flex",flexDirection:"column",padding:"26px 22px",gap:14,
          overflow:"hidden",position:"relative",
        }}>
          {/* Grid */}
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.03,pointerEvents:"none"}}>
            <defs><pattern id="lpg" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M 44 0 L 0 0 0 44" fill="none" stroke={T.sub} strokeWidth="0.5"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#lpg)"/>
          </svg>
          <div style={{position:"absolute",top:0,left:0,width:260,height:260,pointerEvents:"none",
            background:`radial-gradient(circle at 0% 0%,${G.growwGreen}07 0%,transparent 65%)`}}/>
          <div style={{position:"absolute",bottom:0,right:0,width:220,height:220,pointerEvents:"none",
            background:`radial-gradient(circle at 100% 100%,${DARK_T.cyan}06 0%,transparent 65%)`}}/>

          {/* Section header — SH style */}
          <div style={{position:"relative",zIndex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              <Activity size={12} color={G.growwGreen} strokeWidth={2.5}/>
              <span style={{fontSize:9,fontWeight:900,color:G.growwGreen,
                letterSpacing:"0.12em",textTransform:"uppercase"}}>Live Market Overview</span>
            </div>
            <div style={{fontSize:22,fontWeight:900,color:T.text,lineHeight:1.2}}>
              Trade with<br/>
              <span style={{color:G.growwGreen,textShadow:`0 0 28px ${G.growwGreen}55`}}>Intelligence</span>
            </div>
            <div style={{fontSize:9,color:T.sub,marginTop:7,lineHeight:1.75,maxWidth:310}}>
              Institutional-grade AI signals · Real-time NSE/BSE data<br/>
              Risk analytics · Multi-asset execution
            </div>
          </div>

          {/* Stat cards — Card primitive */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,position:"relative",zIndex:1}}>
            <StatCard T={T} icon={TrendingUp}   label="NIFTY 50" value="24,402" change="+0.48%" up spark={SPARK_UP}/>
            <StatCard T={T} icon={TrendingUp}   label="SENSEX"   value="80,110" change="+0.52%" up spark={SPARK_UP}/>
            <StatCard T={T} icon={TrendingDown} label="USD/INR"  value="83.42"  change="-0.06%" up={false} spark={SPARK_DOWN}/>
            <StatCard T={T} icon={Activity}     label="VIX"      value="13.82"  change="+4.1%"  up={false} spark={SPARK_DOWN}/>
          </div>

          {/* Feature chips — exact badge style from App.jsx */}
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:8.5,fontWeight:900,color:T.sub,
              letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Platform Features</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {[
                ["AI Signals",G.growwGreen],["Option Chain",DARK_T.cyan],
                ["Backtesting",G.sipBlue],  ["Screener",DARK_T.violet],
                ["MF & ETF",G.goldYellow],  ["Community",DARK_T.teal],
                ["Paper Trade",DARK_T.emerald],["Risk Manager",DARK_T.rose],
              ].map(([label,color])=>(
                <span key={label} style={{
                  fontSize:8,fontWeight:700,color,
                  background:`${color}18`,border:`1px solid ${color}33`,
                  borderRadius:5,padding:"3px 8px",letterSpacing:"0.06em"}}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Stats strip — same as App.jsx bottom stat row */}
          <div style={{display:"flex",marginTop:"auto",position:"relative",zIndex:1,
            background:T.card,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
            {[["150+","Markets"],["<2ms","Latency"],["99.9%","Uptime"],["1M+","Traders"]].map(([v,l],i)=>(
              <div key={l} style={{flex:1,padding:"10px 0",textAlign:"center",
                borderRight:i<3?`1px solid ${T.border}`:"none"}}>
                <div style={{fontSize:14,fontWeight:900,color:G.growwGreen}}>{v}</div>
                <div style={{fontSize:7.5,color:T.muted,letterSpacing:"0.14em",
                  marginTop:2,textTransform:"uppercase"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{width:"100%",maxWidth:418,background:T.bg,
          display:"flex",alignItems:"center",justifyContent:"center",
          padding:"28px 24px",flexShrink:0}}>

          <motion.div style={{width:"100%"}}
            initial={{opacity:0,x:22}} animate={{opacity:1,x:0}}
            transition={{duration:0.55,ease:[0.16,1,0.3,1]}}>

            {/* Auth card — exact Card primitive */}
            <div style={{
              background:T.card,border:`1px solid ${T.border}`,borderRadius:14,
              padding:"22px 20px",
              boxShadow:isDark
                ?`0 8px 40px rgba(0,0,0,0.5),0 0 0 1px ${T.border2}44`
                :`0 8px 32px rgba(0,0,0,0.08)`,
            }}>

              {/* Logo row */}
              <motion.div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}
                initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                transition={{delay:0.15,duration:0.4}}>
                <div style={{width:34,height:34,borderRadius:8,flexShrink:0,
                  background:`linear-gradient(135deg,${G.growwGreen},${DARK_T.cyan})`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:`0 0 14px ${G.growwGreen}55`}}>
                  <span style={{fontSize:17,fontWeight:900,color:"#0a1628"}}>M</span>
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:900,color:T.text,letterSpacing:"0.06em"}}>
                    Market<span style={{color:G.growwGreen}}>Mind</span>
                    <span style={{color:DARK_T.cyan,fontSize:10,fontWeight:700,marginLeft:3}}>AI</span>
                  </div>
                  <div style={{fontSize:7.5,color:T.muted,letterSpacing:"0.22em",
                    textTransform:"uppercase",marginTop:1}}>Trading Terminal</div>
                </div>
              </motion.div>

              {/* Tab toggle — same pill as App.jsx nav */}
              <motion.div style={{display:"flex",marginBottom:18,padding:3,borderRadius:9,
                background:isDark?T.dim:T.panel,border:`1px solid ${T.border}`,gap:3}}
                initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                transition={{delay:0.22,duration:0.38}}>
                {["signin","signup"].map(t=>(
                  <button key={t} onClick={()=>setTab(t)} style={{
                    flex:1,padding:"8px 0",borderRadius:7,border:"none",
                    cursor:"pointer",position:"relative",zIndex:1,
                    fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",
                    color:tab===t?(isDark?"#0a1628":T.bg):T.muted,
                    background:"none",transition:"color 0.2s",fontFamily:"inherit"}}>
                    {tab===t&&(
                      <motion.div layoutId="authPill"
                        style={{position:"absolute",inset:0,borderRadius:7,zIndex:-1,
                          background:`linear-gradient(135deg,${G.growwGreen},${DARK_T.cyan})`,
                          boxShadow:`0 2px 14px ${G.growwGreen}44`}}
                        transition={{type:"spring",stiffness:440,damping:40}}/>
                    )}
                    {t==="signin"?"Sign In":"Sign Up"}
                  </button>
                ))}
              </motion.div>

              {/* Fields */}
              <AnimatePresence mode="wait">
                <motion.div key={tab}
                  initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-8}} transition={{duration:0.2}}
                  style={{display:"flex",flexDirection:"column",gap:11}}>

                  {!isIn&&(
                    <AuthInput T={T} isDark={isDark} label="Full Name"
                      type="text" value={name} onChange={e=>setName(e.target.value)} icon={User}/>
                  )}
                  <AuthInput T={T} isDark={isDark} label="Email Address"
                    type="email" value={email} onChange={e=>setEmail(e.target.value)} icon={Mail}/>
                  <AuthInput T={T} isDark={isDark} label="Password"
                    type="password" value={password} onChange={e=>setPassword(e.target.value)}
                    icon={Lock} showToggle/>

                  {isIn&&(
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:-4}}>
                      <button style={{fontSize:10,color:G.growwGreen,background:"none",
                        border:"none",cursor:"pointer",fontWeight:600,
                        letterSpacing:"0.06em",fontFamily:"inherit"}}>
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* CTA — same gradient button as App.jsx primary actions */}
                  <motion.button onClick={handleSubmit}
                    whileHover={{scale:1.02,boxShadow:`0 6px 24px ${G.growwGreen}55`}}
                    whileTap={{scale:0.97}}
                    style={{
                      width:"100%",padding:"12px 0",borderRadius:9,border:"none",
                      cursor:"pointer",position:"relative",overflow:"hidden",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                      background:`linear-gradient(135deg,${G.growwGreen},${DARK_T.cyan})`,
                      fontSize:11,fontWeight:900,color:"#0a1628",
                      letterSpacing:"0.18em",textTransform:"uppercase",
                      boxShadow:`0 4px 18px ${G.growwGreen}44`,
                      marginTop:3,fontFamily:"inherit",
                    }}>
                    <AnimatePresence mode="wait">
                      {loading?(
                        <motion.div key="sp" style={{width:15,height:15,borderRadius:"50%",
                          border:"2px solid rgba(10,22,40,0.3)",borderTopColor:"#0a1628"}}
                          animate={{rotate:360}} transition={{duration:0.65,repeat:Infinity,ease:"linear"}}
                          initial={{opacity:0}} exit={{opacity:0}}/>
                      ):(
                        <motion.span key="lb" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                          style={{display:"flex",alignItems:"center",gap:6}}>
                          <Zap size={13} strokeWidth={2.5}/>
                          {isIn?"Sign In":"Create Account"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {/* shimmer sweep */}
                    <motion.div style={{position:"absolute",inset:0,pointerEvents:"none",
                      background:"linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.18) 50%,transparent 72%)"}}
                      animate={{x:["-130%","220%"]}}
                      transition={{duration:2.2,repeat:Infinity,repeatDelay:1.2,ease:"easeInOut"}}/>
                  </motion.button>

                  {/* Divider */}
                  <div style={{display:"flex",alignItems:"center",gap:10,margin:"1px 0"}}>
                    <div style={{flex:1,height:1,background:T.border}}/>
                    <span style={{fontSize:8.5,color:T.muted,letterSpacing:"0.2em",fontWeight:600}}>OR</span>
                    <div style={{flex:1,height:1,background:T.border}}/>
                  </div>

                  {/* Google — secondary button style matching App.jsx */}
                  <motion.button
                    whileHover={{scale:1.015,background:isDark?T.panel:"#e8f0fe"}}
                    whileTap={{scale:0.97}}
                    style={{
                      width:"100%",padding:"10px 0",borderRadius:9,
                      display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                      background:isDark?T.dim:T.surface,
                      border:`1px solid ${T.border2}`,
                      fontSize:11,color:T.text,cursor:"pointer",fontWeight:700,
                      letterSpacing:"0.1em",transition:"background 0.2s",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.22)",fontFamily:"inherit",
                    }}>
                    <GoogleIcon/>Continue with Google
                  </motion.button>

                  {/* Footer link */}
                  <div style={{textAlign:"center",marginTop:2}}>
                    <span style={{fontSize:10,color:T.muted,fontWeight:500}}>
                      {isIn?"New to MarketMind? ":"Already have an account? "}
                    </span>
                    <button onClick={()=>setTab(isIn?"signup":"signin")}
                      style={{fontSize:10,color:G.growwGreen,background:"none",border:"none",
                        cursor:"pointer",fontWeight:700,letterSpacing:"0.04em",fontFamily:"inherit"}}>
                      {isIn?"Sign up free →":"Sign in →"}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Security footer — App.jsx footer badge style */}
              <div style={{marginTop:16,paddingTop:13,borderTop:`1px solid ${T.border}`,
                display:"flex",alignItems:"center",justifyContent:"center",gap:14,flexWrap:"wrap"}}>
                {[[Shield,"256-bit SSL"],[Wifi,"Live Data"],[Zap,"<2ms Latency"]].map(([Icon,label])=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:4}}>
                    <Icon size={9} color={T.muted} strokeWidth={2}/>
                    <span style={{fontSize:8,color:T.muted,letterSpacing:"0.1em",fontWeight:600}}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer — App.jsx footer style */}
            <div style={{marginTop:10,textAlign:"center",fontSize:7.5,
              color:T.muted,lineHeight:1.6,letterSpacing:"0.04em"}}>
              Paper Trading Only · Not SEBI Registered · AI signals for educational purposes
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── FOOTER — exact App.jsx footer ── */}
      <div style={{background:T.surface,borderTop:`1px solid ${T.border}`,
        padding:"5px 20px",display:"flex",justifyContent:"space-between",
        fontSize:8,color:T.muted,fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>
        <span>MarketMind AI Terminal v8.0 · NSE · BSE · MCX · Paper Trading Only · Not SEBI Registered</span>
        <span style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:DARK_T.emerald,
            display:"inline-block",animation:"pulse 2s infinite"}}/>
          All systems nominal · Latency 2ms · {new Date().toLocaleTimeString("en-IN")}
        </span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(16,185,129,0.4)}50%{opacity:0.6;box-shadow:0 0 0 5px rgba(16,185,129,0)}}
        *{box-sizing:border-box;}
        input::placeholder{color:${isDark?DARK_T.muted:LIGHT_T.muted};}
        input:-webkit-autofill{
          -webkit-box-shadow:0 0 0 100px ${isDark?DARK_T.dim:LIGHT_T.dim} inset !important;
          -webkit-text-fill-color:${isDark?DARK_T.text:LIGHT_T.text} !important;
        }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${isDark?DARK_T.bg:LIGHT_T.bg}}
        ::-webkit-scrollbar-thumb{background:${isDark?DARK_T.border2:LIGHT_T.border2};border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:${G.growwGreen}55}
        @media(max-width:900px){.auth-left{display:none!important}}
      `}</style>
    </div>
  );
};

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function MarketMindAuth() {
  const [phase, setPhase] = useState("splash");
  const [isDark, setIsDark] = useState(true);
  return (
    <AnimatePresence mode="wait">
      {phase==="splash"?(
        <Splash key="splash" isDark={isDark} onDone={()=>setPhase("auth")}/>
      ):(
        <motion.div key="auth" initial={{opacity:0}} animate={{opacity:1}}
          transition={{duration:0.45}} style={{minHeight:"100vh"}}>
          <AuthPage isDark={isDark} toggleTheme={()=>setIsDark(d=>!d)}/>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
