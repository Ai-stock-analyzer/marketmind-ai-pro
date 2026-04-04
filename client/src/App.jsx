import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

// ── THEME CONTEXT ──────────────────────────────────────────────────────────────
export const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);
import {
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, BarChart, Bar, Cell, ReferenceLine, Area
} from "recharts";
import {
  LayoutDashboard, Brain, Eye, FlaskConical, Zap, Target, Activity,
  BarChart2, ChevronRight, ArrowUpRight, ArrowDownRight, AlertTriangle,
  Shield, CheckCircle2, XCircle, Flame, Star, Clock, TrendingUp,
  TrendingDown, Bell, Settings, Search, BookOpen, PieChart, Cpu,
  SlidersHorizontal, ShieldAlert, DollarSign, Filter,
  Landmark, GraduationCap, Repeat, Coins, Layers, BadgeCheck,
  PlayCircle, Wallet, ChevronDown, Sparkles, Globe,
  Wifi, WifiOff, Bolt, Link2, BookMarked,
  AreaChart, CandlestickChart, Percent,
  Newspaper, Wheat,
  ScanLine, Volume2, ArrowUpCircle, Calculator, UserCheck, Users,
  Gauge, ListFilter, Trophy, Map, ArrowUpDown,
  MessageSquare, Radio, ThumbsUp,
} from "lucide-react";
import CommunityPanel from "./CommunityPanel";
import StrategyBacktester from "./StrategyBacktester";
import PriceAlertSystem, { usePriceAlerts } from "./PriceAlertSystem";
import StrategyBuilder from "./StrategyBuilder";
// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const DARK_T = {
  bg:"#0f172a", surface:"#111827", panel:"#1a2235", card:"#1e2d45",
  border:"#243044", border2:"#2d3f5f", text:"#f1f5f9", sub:"#94a3b8", muted:"#4b6080", dim:"#1e2d3d",
  cyan:"#06b6d4", blue:"#3b82f6", indigo:"#6366f1", violet:"#8b5cf6",
  emerald:"#10b981", green:"#22c55e", red:"#ef4444", rose:"#f43f5e",
  amber:"#f59e0b", orange:"#f97316", yellow:"#eab308",
  sky:"#38bdf8", purple:"#a78bfa", teal:"#14b8a6",
};

const LIGHT_T = {
  bg:"#f1f5f9", surface:"#ffffff", panel:"#f8fafc", card:"#ffffff",
  border:"#e2e8f0", border2:"#cbd5e1", text:"#0f172a", sub:"#475569", muted:"#94a3b8", dim:"#e8f0f8",
  cyan:"#0891b2", blue:"#2563eb", indigo:"#4f46e5", violet:"#7c3aed",
  emerald:"#059669", green:"#16a34a", red:"#dc2626", rose:"#e11d48",
  amber:"#d97706", orange:"#ea580c", yellow:"#ca8a04",
  sky:"#0284c7", purple:"#7c3aed", teal:"#0d9488",
};

// T is set at render time via context; components that need it use getT()
let T = DARK_T;
const getT = () => T;

// ── GROWW-INSPIRED ACCENT TOKENS ──────────────────────────────────────────────
const G = {
  growwGreen: "#00d09c",
  growwDark:  "#1b2034",
  growwCard:  "#1e2640",
  growwBorder:"#2a3550",
  sipBlue:    "#4f8ef7",
  goldYellow: "#f5c542",
  etfPurple:  "#a259ff",
};

// ── MUTUAL FUNDS DATA ─────────────────────────────────────────────────────────
const MF_DATA = [
  { name:"Mirae Asset Large Cap", category:"Large Cap", rating:5, returns:{y1:18.4,y3:16.2,y5:14.8}, nav:92.34,  minSip:500,  risk:"Low",    aum:"₹34,210 Cr", tag:"TOP RATED" },
  { name:"Parag Parikh Flexi Cap", category:"Flexi Cap", rating:5, returns:{y1:22.1,y3:19.8,y5:18.3}, nav:68.12,  minSip:1000, risk:"Moderate",aum:"₹68,840 Cr", tag:"STAR FUND" },
  { name:"Axis Bluechip Fund",     category:"Large Cap", rating:4, returns:{y1:15.6,y3:13.9,y5:12.4}, nav:54.88,  minSip:500,  risk:"Low",    aum:"₹44,200 Cr", tag:"CONSISTENT"},
  { name:"SBI Small Cap Fund",     category:"Small Cap", rating:4, returns:{y1:34.2,y3:28.6,y5:24.1}, nav:138.44, minSip:500,  risk:"High",   aum:"₹22,100 Cr", tag:"HIGH RETURN"},
  { name:"HDFC Mid-Cap Opp.",      category:"Mid Cap",   rating:4, returns:{y1:28.7,y3:24.1,y5:20.8}, nav:116.22, minSip:1000, risk:"Moderate",aum:"₹58,400 Cr", tag:"POPULAR"  },
  { name:"Nippon India Index",     category:"Index Fund",rating:4, returns:{y1:16.8,y3:14.4,y5:13.1}, nav:33.21,  minSip:100,  risk:"Low",    aum:"₹9,820 Cr",  tag:"LOWEST COST"},
];

const LEARN_ARTICLES = [
  { title:"Stock Market Basics",       icon:"📈", time:"5 min", level:"Beginner", desc:"Learn how stock markets work, what are indices, and how shares are traded on NSE & BSE." },
  { title:"How to Invest in MF",       icon:"💼", time:"7 min", level:"Beginner", desc:"Step-by-step guide to choosing your first mutual fund, understanding NAV, expense ratio and exit load." },
  { title:"SIP Planner Guide",         icon:"📅", time:"6 min", level:"Beginner", desc:"Understand the power of compounding with SIP. Build a goal-based investment plan in 3 simple steps." },
  { title:"Understanding P/E Ratio",   icon:"🔢", time:"4 min", level:"Intermediate", desc:"Learn how to value a stock using P/E, PB ratio, and how to compare it with peers and sector averages." },
  { title:"ETFs vs Mutual Funds",      icon:"⚖️", time:"5 min", level:"Beginner", desc:"Discover the difference between ETFs and actively managed funds — cost, returns, and which suits you." },
  { title:"Digital Gold Explained",    icon:"🥇", time:"4 min", level:"Beginner", desc:"What is digital gold, how to buy it safely, how it's stored, and how returns compare with physical gold." },
];

const DIGITAL_GOLD = { price:7357.42, change:+0.34, changeAmt:+24.8, purity:"24K 99.9%", minBuy:10 };

const ETF_DATA = [
  { name:"Nifty 50 ETF (NIFTYBEES)", price:242.14, change:+0.44, aum:"₹22,400 Cr", expense:"0.04%", tracking:"Nifty 50"   },
  { name:"Nifty IT ETF (ITBEES)",     price:38.72,  change:-0.18, aum:"₹4,100 Cr",  expense:"0.30%", tracking:"Nifty IT"  },
  { name:"Gold ETF (GOLDBEES)",       price:58.94,  change:+0.28, aum:"₹8,700 Cr",  expense:"0.50%", tracking:"Gold Spot" },
  { name:"Banking ETF (BANKBEES)",    price:446.88, change:+0.62, aum:"₹6,200 Cr",  expense:"0.20%", tracking:"Bank Nifty"},
];

// ── OPTION CHAIN DATA (Upstox Inspired) ───────────────────────────────────────
const OPTION_CHAIN = [
  { strike:24200, callOI:182400, callOIChg:+12400, callIV:14.2, callLTP:312.4, callDelta:0.72, callGamma:0.0018, putLTP:48.2,  putIV:16.8, putOI:94200,  putOIChg:-4200, putDelta:-0.28, putGamma:0.0018 },
  { strike:24300, callOI:214800, callOIChg:+18200, callIV:13.1, callLTP:224.6, callDelta:0.61, callGamma:0.0024, putLTP:68.4,  putIV:15.6, putOI:142800, putOIChg:+6800, putDelta:-0.39, putGamma:0.0024 },
  { strike:24400, callOI:398400, callOIChg:+42000, callIV:12.4, callLTP:148.2, callDelta:0.48, callGamma:0.0031, putLTP:98.8,  putIV:14.2, putOI:312400, putOIChg:+24400,putDelta:-0.52, putGamma:0.0031, atm:true },
  { strike:24500, callOI:286200, callOIChg:-8400,  callIV:13.8, callLTP:88.6,  callDelta:0.34, callGamma:0.0028, putLTP:148.4, putIV:15.4, putOI:224600, putOIChg:-12600,putDelta:-0.66, putGamma:0.0028 },
  { strike:24600, callOI:142600, callOIChg:-24200, callIV:15.2, callLTP:42.4,  callDelta:0.19, callGamma:0.0019, putLTP:218.6, putIV:17.2, putOI:98400,  putOIChg:-8400, putDelta:-0.81, putGamma:0.0019 },
  { strike:24700, callOI:84200,  callOIChg:-18600, callIV:17.4, callLTP:18.2,  callDelta:0.09, callGamma:0.0011, putLTP:312.4, putIV:19.4, putOI:62800,  putOIChg:-2800, putDelta:-0.91, putGamma:0.0011 },
];

// ── ANGEL ONE ADVISORY DATA ────────────────────────────────────────────────────
const DAILY_IDEAS = [
  { sym:"RELIANCE",   action:"BUY",  target:3100, sl:2740, horizon:"15 Days", thesis:"Jio AGR revision + retail EBITDA expansion. Q4 preview bullish.", sector:"Energy",   conf:82, analyst:"AI Research" },
  { sym:"HDFCBANK",   action:"BUY",  target:1750, sl:1545, horizon:"30 Days", thesis:"NIM expansion post-HDFC merger synergies. Valuation gap with ICICI closing.", sector:"Banking",  conf:74, analyst:"AI Research" },
  { sym:"TCS",        action:"HOLD", target:3600, sl:3280, horizon:"60 Days", thesis:"GenAI deal pipeline building. Q1FY25 guidance awaited. Accumulate on dips.", sector:"IT",       conf:65, analyst:"AI Research" },
  { sym:"BAJFINANCE", action:"BUY",  target:7500, sl:6550, horizon:"21 Days", thesis:"Rural AUM kicker + co-brand credit card scale-up. Bollinger squeeze resolving.", sector:"NBFC",    conf:79, analyst:"AI Research" },
];

const SECTOR_VIEWS = [
  { sector:"IT",        view:"OVERWEIGHT",  change:"+2.1%",  reason:"USD strength, AI deal flow acceleration, H2 ramp-up", color:"#10b981" },
  { sector:"Banking",   view:"OVERWEIGHT",  change:"+1.4%",  reason:"Credit growth 15%+, NIM stable, NPA multi-year lows",  color:"#10b981" },
  { sector:"FMCG",      view:"NEUTRAL",     change:"-0.2%",  reason:"Rural recovery slow, input costs moderating",          color:"#f59e0b" },
  { sector:"Pharma",    view:"OVERWEIGHT",  change:"+1.8%",  reason:"US generics recovery, USFDA clearances accelerating",  color:"#10b981" },
  { sector:"Metals",    view:"UNDERWEIGHT", change:"-1.6%",  reason:"China slowdown, global demand uncertainty, INR risk",  color:"#ef4444" },
  { sector:"Realty",    view:"NEUTRAL",     change:"+0.3%",  reason:"Launches robust but rate sensitivity caps upside",     color:"#f59e0b" },
  { sector:"Auto",      view:"OVERWEIGHT",  change:"+0.9%",  reason:"EV traction + rural demand pickup post-monsoon",       color:"#10b981" },
  { sector:"Commodities",view:"UNDERWEIGHT",change:"-2.1%",  reason:"Global macro headwinds, crude volatility persistent",  color:"#ef4444" },
  { sector:"Currency",  view:"WATCH",       change:"USD/INR 83.42", reason:"RBI intervention caps sharp moves, range-bound", color:"#38bdf8" },
];

// ── SCREENER DATA (StockEdge Inspired) ────────────────────────────────────────
const SCREENER_DATA = {
  "52W High": [
    { sym:"BAJFINANCE", price:6920, high52:7124, pct:97.1, vol:"3.2x avg", sector:"NBFC",    signal:"Near ATH Breakout" },
    { sym:"ICICIBANK",  price:1102, high52:1148, pct:96.0, vol:"2.8x avg", sector:"Banking", signal:"Resistance test" },
    { sym:"HDFCLIFE",   price:624,  high52:638,  pct:97.8, vol:"1.9x avg", sector:"Insurance",signal:"52W High retest" },
    { sym:"LTIM",       price:5820, high52:5944, pct:97.9, vol:"2.1x avg", sector:"IT",       signal:"Consolidation breakout" },
  ],
  "Volume Surge": [
    { sym:"SBIN",       price:812,  volSurge:"5.8x", sector:"PSU Bank", signal:"FII accumulation detected",  change:+2.4 },
    { sym:"RELIANCE",   price:2847, volSurge:"4.2x", sector:"Energy",   signal:"Block deal + retail surge",  change:+1.1 },
    { sym:"INFY",       price:1587, volSurge:"3.9x", sector:"IT",       signal:"Results preview buy",        change:+1.8 },
    { sym:"TCS",        price:3412, volSurge:"3.2x", sector:"IT",       signal:"Institutional rebalancing",  change:-0.4 },
  ],
  "Technical Breakouts": [
    { sym:"BAJFINANCE", price:6920, pattern:"Bollinger Squeeze",   tf:"Daily",  conf:84, trigger:"Candle close > 6850" },
    { sym:"HDFCBANK",   price:1623, pattern:"Cup & Handle",        tf:"Weekly", conf:78, trigger:"Candle close > 1640" },
    { sym:"ICICIBANK",  price:1102, pattern:"Ascending Triangle",  tf:"Daily",  conf:81, trigger:"Break of ₹1,110" },
    { sym:"RELIANCE",   price:2847, pattern:"Bull Flag + Volume",  tf:"Hourly", conf:76, trigger:"Momentum > 2860" },
  ],
};

// ── 5PAISA BROKERAGE DATA ─────────────────────────────────────────────────────
const BROKERAGE_RATES = {
  retail:  { equity:20, fo:20,  currency:20,  commodity:20,  label:"Flat ₹20/order" },
  trader:  { equity:20, fo:20,  currency:20,  commodity:20,  label:"Flat ₹20/order" },
};

const rand   = (a,b) => Math.random()*(b-a)+a;
const randI  = (a,b) => Math.floor(rand(a,b));
const clamp  = (v,a,b) => Math.max(a,Math.min(b,v));
const fmtINR = n => n.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});

// ── STOCK DATA ────────────────────────────────────────────────────────────────
const STOCKS = {
  RELIANCE:{base:2847,sector:"Energy",mcap:"19.2L Cr",pe:24.8,pb:2.1,divYield:0.35,pledged:1.2,dte:0.61,beta:0.92,
    durability:82,valuation:56,momentum:76,dvm:["High","Fair","Bullish"],eps:114.6,
    roe:[14.2,15.8,17.1],profitCAGR:[8.2,11.4,14.7],
    entry:2810,sl:2740,target:3020,aiOdds:78,rsi:62,macd:1.4,sma20:2780,sma50:2720,
    featureImportance:{RSI:72,Sentiment:58,SMA:81,MACD:67,Volume:54},
    forensic:{pledgeFlag:false,dteFlag:false,promoterFlag:false,cashFlowFlag:false},
    pros:["Jio 450M+ subs — recurring high-margin revenue","EBITDA margins 17.4% vs sector 13.1%","FCF positive 8 consecutive quarters","Green energy capex → ESG re-rating 2030","Retail arm outpacing Amazon India growth"],
    cons:["Gross debt ₹2.76L Cr — significant balance sheet risk","Conglomerate discount caps P/E re-rating historically","Crude volatility causes ±22% quarterly EPS swings","Related-party transactions reduce earnings transparency"],
    swot:{S:["Diversified 6 verticals","Jio dominance","Strong FCF"],W:["High gross debt","Complexity"],O:["5G expansion","Green pivot","Retail"],T:["Regulatory risk","Crude volatility"]}},
  HDFCBANK:{base:1623,sector:"Banking",mcap:"12.4L Cr",pe:18.4,pb:3.1,divYield:1.12,pledged:0.0,dte:8.2,beta:0.78,
    durability:88,valuation:42,momentum:61,dvm:["High","Expensive","Neutral"],eps:88.1,
    roe:[16.8,17.4,18.1],profitCAGR:[12.1,15.3,18.8],
    entry:1590,sl:1545,target:1720,aiOdds:71,rsi:51,macd:-0.8,sma20:1608,sma50:1580,
    featureImportance:{RSI:55,Sentiment:74,SMA:68,MACD:48,Volume:62},
    forensic:{pledgeFlag:false,dteFlag:true,promoterFlag:false,cashFlowFlag:false},
    pros:["NIM 4.2% vs sector 3.1% — structural advantage","Gross NPA 1.26% — best-in-class private bank","CASA 47.6% — low-cost funding moat","HDFC Life + AMC = high-margin fee income","18%+ ROE sustained 5+ consecutive years"],
    cons:["Post-merger integration costs drag near-term EPS","P/B 3.1x limits further multiple expansion","Rate rises compress fixed-rate NIM book","Large unsecured book adds systemic risk"],
    swot:{S:["Best-in-class NIM","Ultra-low NPA","Premium franchise"],W:["Merger overhang","Premium valuation"],O:["Credit card growth","UPI monetization"],T:["Rate cycle","Fintech disruption"]}},
  TCS:{base:3412,sector:"IT",mcap:"12.4L Cr",pe:29.1,pb:14.2,divYield:1.56,pledged:0.0,dte:0.02,beta:0.65,
    durability:91,valuation:35,momentum:55,dvm:["High","Expensive","Neutral"],eps:117.3,
    roe:[44.8,46.2,48.1],profitCAGR:[9.4,11.2,13.5],
    entry:3380,sl:3280,target:3600,aiOdds:65,rsi:48,macd:-2.1,sma20:3420,sma50:3380,
    featureImportance:{RSI:48,Sentiment:82,SMA:61,MACD:55,Volume:44},
    forensic:{pledgeFlag:false,dteFlag:false,promoterFlag:false,cashFlowFlag:false},
    pros:["Margin 24.5% EBIT vs Infosys 21.3% — structural edge","₹55,000 Cr+ cash for buybacks & M&A","Fortune 500 clients ensure sticky revenues","GenAI pipeline accelerating at ₹12,000 Cr","35%+ dividend payout ratio — reliable income"],
    cons:["P/E 29x prices in perfection — limited upside","USD/INR appreciation compresses margins","BFSI 33% concentration amplifies banking cycle","Mid-senior attrition adds delivery risk"],
    swot:{S:["Global margin leader","Blue-chip clients","Cash fortress"],W:["Attrition","FX exposure"],O:["GenAI services","Cloud migration"],T:["Global recession","Visa restrictions"]}},
  INFY:{base:1587,sector:"IT",mcap:"6.6L Cr",pe:22.6,pb:8.4,divYield:2.18,pledged:0.0,dte:0.08,beta:0.71,
    durability:87,valuation:58,momentum:68,dvm:["High","Fair","Bullish"],eps:70.2,
    roe:[31.4,32.8,34.1],profitCAGR:[7.8,9.6,12.3],
    entry:1560,sl:1510,target:1690,aiOdds:73,rsi:58,macd:1.2,sma20:1565,sma50:1530,
    featureImportance:{RSI:61,Sentiment:69,SMA:74,MACD:58,Volume:52},
    forensic:{pledgeFlag:false,dteFlag:false,promoterFlag:false,cashFlowFlag:false},
    pros:["Large-deal TCV $4.5B in FY24 — multi-year visibility","Lean cost structure = best-in-class operating leverage","Cobalt cloud platform gaining enterprise traction","2.18% dividend yield — income cushion","Cheaper than TCS at 22x P/E — relative value"],
    cons:["Guidance cuts H1 FY24 damaged management credibility","CEO transition creates client relationship risk","Pricing compression in discretionary IT budgets","Attrition 12.9% — above pre-pandemic norms"],
    swot:{S:["Large deal book","Lean structure"],W:["CEO transition","Guidance cuts"],O:["Cobalt AI","Deal pipeline"],T:["Pricing pressure","Talent war"]}},
  BAJFINANCE:{base:6890,sector:"NBFC",mcap:"4.3L Cr",pe:34.2,pb:8.1,divYield:0.22,pledged:0.0,dte:3.8,beta:1.42,
    durability:85,valuation:32,momentum:79,dvm:["High","Expensive","Bullish"],eps:201.4,
    roe:[22.4,24.1,26.3],profitCAGR:[24.1,28.4,31.2],
    entry:6750,sl:6550,target:7400,aiOdds:81,rsi:68,macd:3.8,sma20:6800,sma50:6600,
    featureImportance:{RSI:77,Sentiment:65,SMA:71,MACD:82,Volume:68},
    forensic:{pledgeFlag:false,dteFlag:false,promoterFlag:false,cashFlowFlag:true},
    pros:["ROE 26%+ — highest among top-10 NBFCs","AUM growth 32% YoY across 7 verticals","Credit cost 1.4% — proprietary scoring models","Rural expansion unlocks massive addressable market","Co-brand credit card = annuity-like fee income"],
    cons:["P/E 34x P/B 8x — zero margin of safety","Unsecured 28% AUM — vulnerable in credit cycle","RBI digital lending scrutiny adds overhang","Rising repo rates compress NIM trajectory"],
    swot:{S:["Superior ROE 26%+","Explosive AUM"],W:["Premium valuation","Unsecured exposure"],O:["Rural lending","Co-brand"],T:["Credit cycle","Fintech"]}},
  SBIN:{base:812,sector:"PSU Bank",mcap:"7.2L Cr",pe:9.8,pb:1.4,divYield:1.84,pledged:0.0,dte:14.6,beta:1.18,
    durability:69,valuation:81,momentum:63,dvm:["Medium","Cheap","Bullish"],eps:82.9,
    roe:[14.4,15.8,17.2],profitCAGR:[42.1,38.6,22.4],
    entry:790,sl:760,target:870,aiOdds:67,rsi:55,macd:0.4,sma20:800,sma50:775,
    featureImportance:{RSI:58,Sentiment:71,SMA:65,MACD:54,Volume:76},
    forensic:{pledgeFlag:false,dteFlag:true,promoterFlag:false,cashFlowFlag:false},
    pros:["Cheapest large-cap bank at 9.8x P/E vs HDFC 18.4x","Sovereign backing eliminates existential risk","CASA 42% — advantageous in rate upcycle","YONO platform 85M+ registered users","Net NPA 0.57% from 3.97% in FY19 — turnaround"],
    cons:["D/E 14.6x — highest leverage among peers","Political lending interference is structural risk","PSU discount caps P/B at 1.5x historically","Capital adequacy 14.2% vs private peers 16-18%"],
    swot:{S:["Sovereign backing","Massive CASA"],W:["High leverage","Lower capital"],O:["Privatisation premium","YONO scale"],T:["Political interference","PSU discount"]}},
  ICICIBANK:{base:1102,sector:"Banking",mcap:"7.8L Cr",pe:17.2,pb:3.6,divYield:0.87,pledged:0.0,dte:7.1,beta:0.88,
    durability:86,valuation:54,momentum:72,dvm:["High","Fair","Bullish"],eps:64.1,
    roe:[15.8,17.2,18.9],profitCAGR:[18.4,22.1,26.8],
    entry:1080,sl:1040,target:1200,aiOdds:76,rsi:63,macd:1.8,sma20:1090,sma50:1060,
    featureImportance:{RSI:68,Sentiment:76,SMA:72,MACD:61,Volume:58},
    forensic:{pledgeFlag:false,dteFlag:true,promoterFlag:false,cashFlowFlag:false},
    pros:["ROE 18.9% — highest among all private banks","NPA journey 8.8%→2.16% — exceptional execution","iMobile 11M+ active users — digital acquisition moat","SME lending 18% of book = 25-30% higher yields","Retail-heavy 75% balance sheet — granular and stable"],
    cons:["Unsecured personal loan +28% YoY — late cycle risk","P/B 3.6x demands consistent 18%+ ROE delivery","Credit card ₹1.2L Cr exposure during RBI tightening","Digital infra capex impacts near-term returns"],
    swot:{S:["Best ROE class","Digital moat"],W:["Unsecured exposure","High capex"],O:["SME banking","iMobile"],T:["NPA cycle","Rate compression"]}},
};

const PEERS = {
  RELIANCE:  [{sym:"ONGC",pe:8.2,mcap:"3.4L Cr",div:4.8,roe:14.1},{sym:"BPCL",pe:6.4,mcap:"1.1L Cr",div:5.2,roe:18.4},{sym:"IOC",pe:5.1,mcap:"2.8L Cr",div:6.1,roe:12.8},{sym:"GAIL",pe:11.2,mcap:"1.2L Cr",div:3.4,roe:11.2}],
  HDFCBANK:  [{sym:"ICICI",pe:17.2,mcap:"7.8L Cr",div:0.87,roe:18.9},{sym:"KOTAK",pe:19.4,mcap:"3.6L Cr",div:0.11,roe:15.2},{sym:"AXIS",pe:13.8,mcap:"3.2L Cr",div:0.08,roe:16.8},{sym:"INDUS",pe:9.6,mcap:"0.9L Cr",div:1.24,roe:14.1}],
  TCS:       [{sym:"INFY",pe:22.6,mcap:"6.6L Cr",div:2.18,roe:34.1},{sym:"WIPRO",pe:18.4,mcap:"2.6L Cr",div:0.22,roe:16.8},{sym:"HCLT",pe:20.1,mcap:"4.8L Cr",div:3.12,roe:22.4},{sym:"TECHM",pe:26.8,mcap:"1.2L Cr",div:2.8,roe:14.6}],
  INFY:      [{sym:"TCS",pe:29.1,mcap:"12.4L Cr",div:1.56,roe:48.1},{sym:"WIPRO",pe:18.4,mcap:"2.6L Cr",div:0.22,roe:16.8},{sym:"HCLT",pe:20.1,mcap:"4.8L Cr",div:3.12,roe:22.4},{sym:"TECHM",pe:26.8,mcap:"1.2L Cr",div:2.8,roe:14.6}],
  BAJFINANCE:[{sym:"HDFC",pe:18.4,mcap:"12.4L Cr",div:1.12,roe:18.1},{sym:"CHOLA",pe:22.1,mcap:"1.1L Cr",div:0.44,roe:19.2},{sym:"M&MFIN",pe:14.2,mcap:"0.3L Cr",div:1.8,roe:14.8},{sym:"SHRIRAM",pe:12.8,mcap:"0.5L Cr",div:1.92,roe:16.4}],
  SBIN:      [{sym:"BOB",pe:7.2,mcap:"1.3L Cr",div:3.8,roe:16.2},{sym:"PNB",pe:12.4,mcap:"0.9L Cr",div:2.1,roe:12.8},{sym:"CANARA",pe:6.8,mcap:"0.9L Cr",div:2.8,roe:15.4},{sym:"UNION",pe:6.1,mcap:"0.8L Cr",div:3.4,roe:13.6}],
  ICICIBANK: [{sym:"HDFC",pe:18.4,mcap:"12.4L Cr",div:1.12,roe:18.1},{sym:"KOTAK",pe:19.4,mcap:"3.6L Cr",div:0.11,roe:15.2},{sym:"AXIS",pe:13.8,mcap:"3.2L Cr",div:0.08,roe:16.8},{sym:"INDUS",pe:9.6,mcap:"0.9L Cr",div:1.24,roe:14.1}],
};

const HOLLY_BASE=[
  {sym:"RELIANCE",signal:"Volume Breakout + MACD Cross",   dir:"BUY", conf:78,entry:2810,sl:2740,target:3020,tf:"Intraday"},
  {sym:"HDFCBANK",signal:"RSI Oversold Bounce",            dir:"BUY", conf:71,entry:1590,sl:1545,target:1720,tf:"Swing"},
  {sym:"TCS",     signal:"Death Cross Confirmed",          dir:"SELL",conf:85,entry:3380,sl:3470,target:3150,tf:"Swing"},
  {sym:"BAJFINANCE",signal:"Bollinger Squeeze Breakout",   dir:"BUY", conf:81,entry:6750,sl:6550,target:7400,tf:"Positional"},
  {sym:"SBIN",    signal:"Support Bounce + FII Flow",      dir:"BUY", conf:67,entry:790, sl:760, target:870, tf:"Swing"},
  {sym:"ICICIBANK",signal:"Trend Line Breakout + Volume",  dir:"BUY", conf:76,entry:1080,sl:1040,target:1200,tf:"Intraday"},
  {sym:"INFY",    signal:"Golden Cross + Sentiment Surge", dir:"BUY", conf:73,entry:1560,sl:1510,target:1690,tf:"Positional"},
];

const NEWS=[
  {text:"RBI holds repo rate at 6.5% — neutral policy stance",mood:"neutral",score:52},
  {text:"Sensex eyes 80,500 — FII net buyers for 3rd session",mood:"bullish",score:84},
  {text:"IT sector +2.1% on strong Q4 guidance from top-3",mood:"bullish",score:76},
  {text:"FII outflows slow ₹840Cr; DII buying ₹2,400Cr accelerates",mood:"bullish",score:68},
  {text:"Fed hawkishness — global macro headwinds on midcaps",mood:"bearish",score:32},
];

const BACKTEST_DATA=[
  {date:"Mar 1",pnl:1420,trades:8,wins:7},{date:"Mar 5",pnl:2180,trades:10,wins:8},
  {date:"Mar 8",pnl:980, trades:6,wins:5},{date:"Mar 12",pnl:3100,trades:12,wins:10},
  {date:"Mar 15",pnl:-420,trades:7,wins:3},{date:"Mar 19",pnl:1860,trades:9,wins:7},
  {date:"Mar 22",pnl:2540,trades:11,wins:9},{date:"Mar 26",pnl:1920,trades:8,wins:7},
  {date:"Mar 29",pnl:2800,trades:10,wins:9},
];

const WL_INIT=[
  {sym:"RELIANCE",qty:10,buyPrice:2810,sector:"Energy"},
  {sym:"TCS",     qty:5, buyPrice:3380,sector:"IT"},
  {sym:"HDFCBANK",qty:8, buyPrice:1600,sector:"Banking"},
  {sym:"INFY",    qty:15,buyPrice:1560,sector:"IT"},
];

const TKRS=Object.entries(STOCKS).map(([sym,d])=>({sym,base:d.base}));

function genTickers(prev){
  return TKRS.map(t=>{
    const old=prev?.find(p=>p.sym===t.sym);
    const price=old?old.price*(1+rand(-0.003,0.003)):t.base;
    const change=old?((price-old.price)/old.price)*100:rand(-1.5,1.5);
    return{sym:t.sym,price:+price.toFixed(2),change:+change.toFixed(2)};
  });
}

function genCandles(base,n=60){
  let o=base;
  return Array.from({length:n},(_,i)=>{
    const c=+(o*(1+rand(-0.014,0.014))).toFixed(2);
    const h=+(Math.max(o,c)*(1+rand(0,0.007))).toFixed(2);
    const l=+(Math.min(o,c)*(1-rand(0,0.007))).toFixed(2);
    const r={t:i,open:o,high:h,low:l,close:c,vol:randI(40000,1200000)};
    o=c; return r;
  });
}

function extendCandles(prev){
  const last=prev[prev.length-1];
  const o=last.close;
  const c=+(o*(1+rand(-0.01,0.01))).toFixed(2);
  const h=+(Math.max(o,c)*(1+rand(0,0.006))).toFixed(2);
  const l=+(Math.min(o,c)*(1-rand(0,0.006))).toFixed(2);
  return[...prev.slice(-59),{t:last.t+1,open:o,high:h,low:l,close:c,vol:randI(40000,1200000)}];
}

function genShadow(candles,stock){
  const last=candles[candles.length-1].close;
  const trend=stock.momentum>65?1:-0.3;
  return Array.from({length:12},(_,i)=>{
    const base=last*(1+trend*0.003*(i+1));
    const unc=last*0.008*(i+1);
    return{t:candles[candles.length-1].t+i+1,pred:+base.toFixed(2),upper:+(base+unc).toFixed(2),lower:+(base-unc).toFixed(2)};
  });
}

// ── PRIMITIVES ────────────────────────────────────────────────────────────────
const Card=({children,style})=>{
  const T=getT();
  return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px",...style}}>{children}</div>;
};

const SH=({icon:Icon,title,right,color})=>{
  const T=getT();
  const c=color||T.cyan;
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {Icon&&<Icon size={13} color={c} strokeWidth={2.5}/>}
        <span style={{fontSize:9.5,fontWeight:900,color:c,letterSpacing:"0.12em",textTransform:"uppercase"}}>{title}</span>
      </div>
      {right}
    </div>
  );
};

const Badge=({children,color,style})=>{
  const T=getT();
  const c=color||T.cyan;
  return(
    <span style={{fontSize:8.5,fontWeight:800,padding:"2px 8px",borderRadius:5,
      background:c+"22",color:c,border:`1px solid ${c}44`,letterSpacing:"0.04em",...style}}>
      {children}
    </span>
  );
};

const MiniBar=({value,max=100,color,height=5})=>{
  const T=getT();
  const c=color||T.cyan;
  return(
    <div style={{width:"100%",height,background:T.border,borderRadius:3,overflow:"hidden"}}>
      <div style={{height,width:`${(value/max)*100}%`,background:c,borderRadius:3,transition:"width 0.8s"}}/>
    </div>
  );
};

function ArcGauge({value,label,size=80}){
  const T = getT();
  const r=size*0.36,cx=size/2,cy=size*0.58;
  const toR=d=>d*Math.PI/180;
  const sA=-210,eA=30,span=eA-sA;
  const ang=sA+(value/100)*span;
  const pt=a=>[cx+r*Math.cos(toR(a)),cy+r*Math.sin(toR(a))];
  const arc=(a1,a2)=>{
    const[x1,y1]=pt(a1);const[x2,y2]=pt(a2);
    return`M ${x1} ${y1} A ${r} ${r} 0 ${(a2-a1)>180?1:0} 1 ${x2} ${y2}`;
  };
  const[nx,ny]=pt(ang);
  const color=value>65?T.emerald:value>40?T.amber:T.red;
  return(
    <svg width={size} height={size*0.72} viewBox={`0 0 ${size} ${size*0.72}`}>
      <path d={arc(sA,eA)} fill="none" stroke={T.border2} strokeWidth="5" strokeLinecap="round"/>
      <path d={arc(sA,ang)} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" style={{transition:"all 0.7s"}}/>
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={T.text} strokeWidth="2" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="3.5" fill={T.text}/>
      <text x={cx} y={cy*1.18} textAnchor="middle" fontSize={size*0.13} fontWeight="900" fill={color}>{value}%</text>
      <text x={cx} y={cy*1.36} textAnchor="middle" fontSize={size*0.09} fill={T.sub}>{label}</text>
    </svg>
  );
}

function CircleGauge({value,size=60,label}){
  const T = getT();
  const r=22,cx=30,cy=30,circ=2*Math.PI*r;
  const pct=clamp(value/100,0,1);
  const color=value>=70?T.emerald:value>=45?T.amber:T.red;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border2} strokeWidth="5"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${pct*circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 30 30)" style={{transition:"stroke-dasharray 0.8s"}}/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="900" fill={color}>{value}</text>
      </svg>
      {label&&<span style={{fontSize:7.5,color:T.sub,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</span>}
    </div>
  );
}

function TickerTape({tickers}){
  const T = getT();
  const d=[...tickers,...tickers];
  return(
    <div style={{background:T.dim,height:28,overflow:"hidden",display:"flex",alignItems:"center",borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:"flex",gap:30,whiteSpace:"nowrap",animation:"ticker 32s linear infinite",paddingLeft:20}}>
        {d.map((t,i)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:10}}>
            <span style={{color:T.muted,fontWeight:700}}>{t.sym}</span>
            <span style={{color:T.text,fontWeight:800}}>₹{fmtINR(t.price)}</span>
            <span style={{color:t.change>=0?T.emerald:T.red,display:"flex",alignItems:"center",gap:1}}>
              {t.change>=0?<ArrowUpRight size={10}/>:<ArrowDownRight size={10}/>}
              {Math.abs(t.change).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── TRADINGVIEW-STYLE CANVAS CHART ────────────────────────────────────────────
const TV_DARK = {
  bg:"#131722", grid:"#1e222d", border:"#2a2e39", text:"#d1d4dc", muted:"#5d606b",
  bull:"#26a69a", bullGlow:"#00ff88", bear:"#ef5350", bearGlow:"#ff1744",
  volume:"#363a45", rsiLine:"#f59e0b", rsiOB:"#ef535055", rsiOS:"#26a69a55",
  pred:"#818cf8", predBand:"#6366f122", crosshair:"#758696",
  sma20:"#f59e0b", sma9:"#22d3ee",
};
const TV_LIGHT = {
  bg:"#ffffff", grid:"#e8ecf2", border:"#d1d9e6", text:"#1e293b", muted:"#94a3b8",
  bull:"#059669", bullGlow:"#10b981", bear:"#dc2626", bearGlow:"#ef4444",
  volume:"#cbd5e1", rsiLine:"#d97706", rsiOB:"#dc262633", rsiOS:"#05966933",
  pred:"#4f46e5", predBand:"#4f46e522", crosshair:"#64748b",
  sma20:"#d97706", sma9:"#0891b2",
};
let TV = TV_DARK;

function computeRSI(closes, period=14){
  const rsi=[];
  for(let i=0;i<closes.length;i++){
    if(i<period){ rsi.push(null); continue; }
    let gains=0,losses=0;
    for(let j=i-period+1;j<=i;j++){
      const d=closes[j]-closes[j-1];
      if(d>0)gains+=d; else losses+=Math.abs(d);
    }
    const rs=losses===0?100:(gains/period)/(losses/period);
    rsi.push(+(100-100/(1+rs)).toFixed(2));
  }
  return rsi;
}

function computeSMA(closes, period){
  return closes.map((_,i)=>
    i<period-1?null:+(closes.slice(i-period+1,i+1).reduce((a,b)=>a+b,0)/period).toFixed(2)
  );
}

function ShadowChart({candles, shadow, isDark}){
  const canvasRef = useCallback(node=>{
    if(!node) return;
    drawChart(node, candles, shadow);
  },[candles, shadow]);

  const [mouse, setMouse] = useState(null);
  const containerRef      = useRef(null);
  const canvasElRef       = useRef(null);

  // redraw whenever candles/shadow/theme change
  useEffect(()=>{
    if(canvasElRef.current) drawChart(canvasElRef.current, candles, shadow, mouse);
  },[candles, shadow, mouse, isDark]);

  function drawChart(canvas, candles, shadow, mouse=null){
    const DPR  = window.devicePixelRatio||1;
    const W    = canvas.parentElement?.clientWidth  || 700;
    const H    = 420; // total canvas height
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W+"px";
    canvas.style.height = H+"px";
    const ctx = canvas.getContext("2d");
    ctx.scale(DPR, DPR);

    // Layout rows
    const PAD_L=58, PAD_R=12, PAD_TOP=10;
    const CANDLE_H = Math.round(H*0.55); // 55% for candles
    const VOL_H    = Math.round(H*0.12); // 12% volume
    const RSI_H    = Math.round(H*0.18); // 18% RSI
    const GAP      = 6;
    const PRED_H   = CANDLE_H; // predictions share candle pane

    const candleTop = PAD_TOP;
    const candleBot = candleTop + CANDLE_H;
    const volTop    = candleBot + GAP;
    const volBot    = volTop + VOL_H;
    const rsiTop    = volBot + GAP;
    const rsiBot    = rsiTop + RSI_H;

    const chartW = W - PAD_L - PAD_R;

    // ── deep charcoal background ──
    ctx.fillStyle = TV.bg;
    ctx.fillRect(0,0,W,H);

    const DISPLAY = 55; // candles to show
    const recent  = candles.slice(-DISPLAY);
    const all     = [...recent, ...shadow];

    // price domain
    const prices=[...recent.flatMap(c=>[c.high,c.low]),
                  ...shadow.flatMap(s=>[s.upper??s.pred,s.lower??s.pred])];
    const minP=Math.min(...prices)*0.9985;
    const maxP=Math.max(...prices)*1.0015;
    const priceH=maxP-minP;

    const toY=(p,top,bot)=>top+(bot-top)*(1-(p-minP)/priceH);
    const toX=(i,total)=>PAD_L+(i+0.5)*(chartW/total);

    // ── GRID ──
    ctx.strokeStyle=TV.grid;
    ctx.lineWidth=0.5;
    for(let i=0;i<=5;i++){
      const y=candleTop+(CANDLE_H/5)*i;
      ctx.beginPath(); ctx.moveTo(PAD_L,y); ctx.lineTo(W-PAD_R,y); ctx.stroke();
      // price labels
      const price=maxP-(priceH/5)*i;
      ctx.fillStyle=TV.muted; ctx.font="9px 'JetBrains Mono',monospace";
      ctx.textAlign="right";
      ctx.fillText("₹"+price.toFixed(0),PAD_L-4,y+3);
    }
    // RSI grid
    for(const lvl of [30,50,70]){
      const y=rsiTop+RSI_H*(1-(lvl-0)/100);
      ctx.strokeStyle=lvl===50?TV.grid:TV.muted+"44";
      ctx.setLineDash(lvl===50?[]:[3,5]);
      ctx.beginPath(); ctx.moveTo(PAD_L,y); ctx.lineTo(W-PAD_R,y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=TV.muted; ctx.textAlign="right"; ctx.font="8px monospace";
      ctx.fillText(lvl,PAD_L-4,y+3);
    }

    // ── PREDICTION BAND ──
    if(shadow.length>0){
      ctx.save();
      const lastReal=recent[recent.length-1];
      const predPts=[{pred:lastReal.close,upper:lastReal.close,lower:lastReal.close,t:0},...shadow];
      ctx.beginPath();
      predPts.forEach((s,i)=>{
        const x=toX(recent.length-1+i, DISPLAY+shadow.length);
        const y=toY(s.upper??s.pred,candleTop,candleBot);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      [...predPts].reverse().forEach((s,i)=>{
        const idx=predPts.length-1-i;
        const x=toX(recent.length-1+idx, DISPLAY+shadow.length);
        const y=toY(s.lower??s.pred,candleTop,candleBot);
        ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.fillStyle=TV.predBand;
      ctx.fill();
      // prediction line
      ctx.strokeStyle=TV.pred;
      ctx.lineWidth=1.5;
      ctx.setLineDash([6,4]);
      ctx.beginPath();
      predPts.forEach((s,i)=>{
        const x=toX(recent.length-1+i, DISPLAY+shadow.length);
        const y=toY(s.pred,candleTop,candleBot);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      // "AI PRED" label
      const lastPred=predPts[predPts.length-1];
      const labelX=toX(recent.length+shadow.length-1,DISPLAY+shadow.length);
      ctx.fillStyle=TV.pred; ctx.font="bold 8px monospace"; ctx.textAlign="left";
      ctx.fillText("AI↗",Math.min(labelX,W-PAD_R-20),toY(lastPred.pred,candleTop,candleBot)-4);
    }

    // ── SMA LINES ──
    const closes=recent.map(c=>c.close);
    const sma20=computeSMA(closes,20);
    const sma9 =computeSMA(closes,9);
    [[sma9,TV.sma9,1.2],[sma20,TV.sma20,1.4]].forEach(([sma,color,lw])=>{
      ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.beginPath(); let started=false;
      sma.forEach((v,i)=>{
        if(v==null){started=false;return;}
        const x=toX(i,DISPLAY); const y=toY(v,candleTop,candleBot);
        if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);
      });
      ctx.stroke();
    });

    // ── CANDLES ──
    const cw=Math.max(2,Math.floor((chartW/DISPLAY)*0.6));
    recent.forEach((c,i)=>{
      const bull=c.close>=c.open;
      const bodyColor  = bull?TV.bullGlow:TV.bearGlow;
      const wickColor  = bull?TV.bull:TV.bear;
      const x=toX(i,DISPLAY);
      const oY=toY(c.open, candleTop,candleBot);
      const cY=toY(c.close,candleTop,candleBot);
      const hY=toY(c.high, candleTop,candleBot);
      const lY=toY(c.low,  candleTop,candleBot);

      // wick
      ctx.strokeStyle=wickColor; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(x,hY); ctx.lineTo(x,lY); ctx.stroke();

      // body glow
      if(bull){
        const grd=ctx.createLinearGradient(0,Math.min(oY,cY),0,Math.max(oY,cY));
        grd.addColorStop(0,TV.bullGlow+"cc");
        grd.addColorStop(1,TV.bull+"99");
        ctx.fillStyle=grd;
      } else {
        const grd=ctx.createLinearGradient(0,Math.min(oY,cY),0,Math.max(oY,cY));
        grd.addColorStop(0,TV.bear+"99");
        grd.addColorStop(1,TV.bearGlow+"cc");
        ctx.fillStyle=grd;
      }
      const bodyTop=Math.min(oY,cY);
      const bodyH=Math.max(1,Math.abs(cY-oY));
      ctx.fillRect(x-cw/2, bodyTop, cw, bodyH);

      // border on body
      ctx.strokeStyle=bodyColor; ctx.lineWidth=0.5;
      ctx.strokeRect(x-cw/2,bodyTop,cw,bodyH);
    });

    // ── VOLUME BARS ──
    const maxVol=Math.max(...recent.map(c=>c.vol));
    recent.forEach((c,i)=>{
      const bull=c.close>=c.open;
      const x=toX(i,DISPLAY);
      const vh=VOL_H*(c.vol/maxVol)*0.9;
      ctx.fillStyle=bull?TV.bull+"88":TV.bear+"88";
      ctx.fillRect(x-cw/2, volBot-vh, cw, vh);
    });
    // vol label
    ctx.fillStyle=TV.muted; ctx.font="8px monospace"; ctx.textAlign="right";
    ctx.fillText("VOL",PAD_L-4,volTop+10);

    // ── RSI ──
    const rsiVals=computeRSI(closes);
    // OB/OS bands
    const ob70y=rsiTop+RSI_H*(1-70/100);
    const os30y=rsiTop+RSI_H*(1-30/100);
    ctx.fillStyle=TV.rsiOB;
    ctx.fillRect(PAD_L,rsiTop,chartW,ob70y-rsiTop);
    ctx.fillStyle=TV.rsiOS;
    ctx.fillRect(PAD_L,os30y,chartW,rsiBot-os30y);

    ctx.strokeStyle=TV.rsiLine; ctx.lineWidth=1.4;
    ctx.beginPath(); let rsiStarted=false;
    rsiVals.forEach((v,i)=>{
      if(v==null){rsiStarted=false;return;}
      const x=toX(i,DISPLAY);
      const y=rsiTop+RSI_H*(1-v/100);
      if(!rsiStarted){ctx.moveTo(x,y);rsiStarted=true;}else ctx.lineTo(x,y);
    });
    ctx.stroke();
    ctx.fillStyle=TV.muted; ctx.textAlign="right"; ctx.font="8px monospace";
    ctx.fillText("RSI 14",PAD_L-4,rsiTop+10);

    // ── PANEL LABELS ──
    ctx.fillStyle=TV.text+"44"; ctx.font="bold 8px monospace"; ctx.textAlign="left";
    ctx.fillText(`SMA9`,PAD_L+2,candleTop+12);
    ctx.fillStyle=TV.sma9+"cc"; ctx.fillText("─",PAD_L+32,candleTop+12);
    ctx.fillStyle=TV.text+"44"; ctx.fillText("SMA20",PAD_L+2,candleTop+22);
    ctx.fillStyle=TV.sma20+"cc"; ctx.fillText("─",PAD_L+38,candleTop+22);

    // ── CROSSHAIR ──
    if(mouse){
      const {mx,my}=mouse;
      ctx.strokeStyle=TV.crosshair; ctx.lineWidth=0.6; ctx.setLineDash([4,4]);
      // vertical
      ctx.beginPath(); ctx.moveTo(mx,candleTop); ctx.lineTo(mx,rsiBot); ctx.stroke();
      // horizontal (only in candle pane)
      if(my>candleTop&&my<candleBot){
        ctx.beginPath(); ctx.moveTo(PAD_L,my); ctx.lineTo(W-PAD_R,my); ctx.stroke();
        // price label on axis
        const hoverPrice=maxP-(((my-candleTop)/CANDLE_H)*priceH);
        ctx.setLineDash([]);
        ctx.fillStyle=TV.crosshair;
        ctx.fillRect(0,my-8,PAD_L-1,16);
        ctx.fillStyle=TV.bg; ctx.textAlign="right"; ctx.font="bold 9px monospace";
        ctx.fillText("₹"+hoverPrice.toFixed(0),PAD_L-5,my+3);
      }
      ctx.setLineDash([]);

      // tooltip — find nearest candle
      const idx=Math.round((mx-PAD_L)/(chartW/DISPLAY)-0.5);
      const c=recent[Math.max(0,Math.min(recent.length-1,idx))];
      if(c){
        const bull=c.close>=c.open;
        const tipX=Math.min(mx+10,W-170);
        const tipY=candleTop+10;
        ctx.fillStyle="#1e222d"; ctx.strokeStyle=TV.border;
        ctx.lineWidth=1; ctx.beginPath();
        ctx.roundRect?ctx.roundRect(tipX,tipY,155,72,5):ctx.rect(tipX,tipY,155,72);
        ctx.fill(); ctx.stroke();
        const col=bull?TV.bullGlow:TV.bearGlow;
        ctx.fillStyle=col; ctx.font="bold 9px monospace"; ctx.textAlign="left";
        ctx.fillText(`O: ₹${c.open}  H: ₹${c.high}`,tipX+8,tipY+16);
        ctx.fillText(`L: ₹${c.low}  C: ₹${c.close}`,tipX+8,tipY+30);
        ctx.fillStyle=TV.muted;
        ctx.fillText(`Vol: ${(c.vol/1000).toFixed(0)}K`,tipX+8,tipY+44);
        const chg=((c.close-c.open)/c.open*100);
        ctx.fillStyle=col;
        ctx.fillText(`${chg>=0?"+":""}${chg.toFixed(2)}%  ${bull?"▲":"▼"}`,tipX+8,tipY+60);
      }
    }

    // separator lines between panels
    ctx.strokeStyle=TV.border; ctx.lineWidth=1; ctx.setLineDash([]);
    [[volTop-2,volTop-2],[rsiTop-2,rsiTop-2]].forEach(([y])=>{
      ctx.beginPath(); ctx.moveTo(PAD_L,y); ctx.lineTo(W-PAD_R,y); ctx.stroke();
    });

    // right-edge live price tag
    if(recent.length>0){
      const lc=recent[recent.length-1];
      const ly=toY(lc.close,candleTop,candleBot);
      const bull=lc.close>=lc.open;
      ctx.fillStyle=bull?TV.bull:TV.bear;
      ctx.fillRect(W-PAD_R,ly-8,PAD_R+2,16);
      // blinking price line
      ctx.strokeStyle=(bull?TV.bullGlow:TV.bearGlow)+"aa";
      ctx.lineWidth=0.8; ctx.setLineDash([2,4]);
      ctx.beginPath(); ctx.moveTo(PAD_L,ly); ctx.lineTo(W-PAD_R,ly); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function handleMouseMove(e){
    const rect=e.currentTarget.getBoundingClientRect();
    setMouse({mx:e.clientX-rect.left, my:e.clientY-rect.top});
  }

  return(
    <div ref={containerRef} style={{
      position:"relative", background:TV.bg, borderRadius:8,
      overflow:"hidden", border:`1px solid ${TV.border}`}}>
      {/* TV-style toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",
        borderBottom:`1px solid ${TV.border}`,background:TV.bg}}>
        {[["1m","1MIN"],["5m","5MIN"],["15m","15MIN"],["1h","1HR"],["1D","DAY"],["1W","WEEK"]].map(([k,l],i)=>(
          <button key={k} style={{fontSize:9,fontWeight:i===4?900:600,
            color:i===4?TV.bullGlow:TV.muted,background:"transparent",
            border:i===4?`1px solid ${TV.bullGlow}44`:"none",
            borderRadius:4,padding:"2px 6px",cursor:"pointer",fontFamily:"monospace"}}>
            {k}
          </button>
        ))}
        <div style={{width:1,height:14,background:TV.border,margin:"0 4px"}}/>
        {["CANDLES","LINE","AREA"].map((t,i)=>(
          <button key={t} style={{fontSize:8,fontWeight:i===0?800:500,
            color:i===0?TV.text:TV.muted,background:"transparent",
            border:"none",cursor:"pointer",fontFamily:"monospace",padding:"2px 5px"}}>
            {t}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:10,fontSize:8,color:TV.muted,fontFamily:"monospace"}}>
          <span style={{color:TV.sma9}}>SMA 9</span>
          <span style={{color:TV.sma20}}>SMA 20</span>
          <span style={{color:TV.pred}}>AI PRED</span>
        </div>
      </div>
      <canvas
        ref={canvasElRef}
        style={{display:"block",cursor:"crosshair"}}
        onMouseMove={handleMouseMove}
        onMouseLeave={()=>setMouse(null)}
      />
    </div>
  );
}

// ── FEATURE IMPORTANCE ────────────────────────────────────────────────────────
function FeatureChart({data}){
  const T = getT();
  const items=Object.entries(data).map(([k,v])=>({f:k,v})).sort((a,b)=>b.v-a.v);
  const colors={RSI:T.cyan,Sentiment:T.violet,SMA:T.emerald,MACD:T.amber,Volume:T.sky};
  return(
    <ResponsiveContainer width="100%" height={118}>
      <BarChart data={items} layout="vertical" margin={{top:0,right:4,bottom:0,left:0}}>
        <CartesianGrid strokeDasharray="2 4" stroke={T.border} horizontal={false}/>
        <XAxis type="number" domain={[0,100]} tick={{fontSize:7.5,fill:T.muted}} tickFormatter={v=>`${v}%`} axisLine={false}/>
        <YAxis type="category" dataKey="f" tick={{fontSize:9,fill:T.sub,fontWeight:700}} axisLine={false} tickLine={false} width={56}/>
        <Tooltip formatter={v=>[`${v}%`,"Importance"]} contentStyle={{background:T.panel,border:`1px solid ${T.border2}`,borderRadius:6,fontSize:9}}/>
        <Bar dataKey="v" radius={[0,4,4,0]}>
          {items.map((e,i)=><Cell key={i} fill={colors[e.f]||T.cyan}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── HOLLY CARD ────────────────────────────────────────────────────────────────
function HollyCard({pick,riskMode,tickers,onSelect}){
  const T=getT();
  const tick=tickers.find(t=>t.sym===pick.sym);
  const price=tick?.price??pick.entry;
  const isAgg=riskMode==="aggressive";
  const adjOdds=isAgg?Math.min(pick.conf+8,98):Math.max(pick.conf-8,40);
  const adjSL=pick.dir==="BUY"?(isAgg?pick.sl*0.995:pick.sl*1.005):(isAgg?pick.sl*1.005:pick.sl*0.995);
  const rr=Math.abs((pick.target-pick.entry)/(pick.entry-adjSL)).toFixed(1);
  const isBuy=pick.dir==="BUY";

  return(
    <div onClick={()=>onSelect(pick.sym)}
      style={{background:T.panel,border:`1px solid ${T.border2}`,borderRadius:10,padding:"12px 14px",
        cursor:"pointer",transition:"all 0.18s",position:"relative",overflow:"hidden"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=isBuy?T.emerald:T.red;e.currentTarget.style.background=T.card;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.background=T.panel;}}>
      <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",
        background:isBuy?"linear-gradient(#10b981,#059669)":"linear-gradient(#ef4444,#b91c1c)",borderRadius:"10px 0 0 10px"}}/>
      <div style={{paddingLeft:6}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
              <span style={{fontSize:12,fontWeight:900,color:T.text}}>{pick.sym}</span>
              <Badge color={isBuy?T.emerald:T.red}>{pick.dir}</Badge>
              <Badge color={T.muted} style={{fontSize:7.5}}>{pick.tf}</Badge>
            </div>
            <div style={{fontSize:8,color:T.sub}}>{pick.signal}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:15,fontWeight:900,color:T.text}}>₹{fmtINR(price)}</div>
            <div style={{fontSize:8.5,color:(tick?.change??0)>=0?T.emerald:T.red,fontWeight:700,display:"flex",alignItems:"center",gap:1,justifyContent:"flex-end"}}>
              {(tick?.change??0)>=0?<ArrowUpRight size={10}/>:<ArrowDownRight size={10}/>}
              {Math.abs(tick?.change??0).toFixed(2)}%
            </div>
          </div>
        </div>
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:7.5,color:T.muted,fontWeight:700}}>AI ODDS</span>
            <span style={{fontSize:10,fontWeight:900,color:adjOdds>75?T.emerald:adjOdds>60?T.amber:T.red}}>{adjOdds}%</span>
          </div>
          <MiniBar value={adjOdds} color={adjOdds>75?T.emerald:adjOdds>60?T.amber:T.red} height={4}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
          {[{l:"Entry",v:`₹${pick.entry}`,c:T.cyan},{l:"Stop Loss",v:`₹${adjSL.toFixed(0)}`,c:T.red},{l:"Target",v:`₹${pick.target}`,c:T.emerald}].map((m,i)=>(
            <div key={i} style={{background:T.dim,borderRadius:6,padding:"5px 7px"}}>
              <div style={{fontSize:7,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>{m.l}</div>
              <div style={{fontSize:9.5,fontWeight:800,color:m.c,marginTop:1}}>{m.v}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:5,textAlign:"right"}}>
          <span style={{fontSize:8,color:T.sub}}>R:R = <span style={{color:T.amber,fontWeight:800}}>{rr}x</span></span>
        </div>
      </div>
    </div>
  );
}

// ── FORENSIC PANEL ────────────────────────────────────────────────────────────
function ForensicPanel({stock}){
  const T=getT();
  const flags=[
    {label:"Pledged Shares",value:`${stock.pledged.toFixed(1)}%`,flag:stock.pledged>5,critical:stock.pledged>15,
     detail:stock.pledged>15?"CRITICAL: Forced selling risk":stock.pledged>5?"WARNING: Margin call risk":"Clean promoter structure"},
    {label:"Debt-to-Equity",value:`${stock.dte.toFixed(1)}x`,flag:stock.dte>5,critical:stock.dte>10,
     detail:stock.dte>10?"CRITICAL: Solvency risk":stock.dte>5?"WARNING: High leverage":"Conservative balance sheet"},
    {label:"Promoter Hold.",value:stock.forensic.promoterFlag?"Declining":"Stable",flag:stock.forensic.promoterFlag,critical:false,
     detail:stock.forensic.promoterFlag?"Declining promoter stake — bearish":"Stable or increasing — bullish"},
    {label:"Cash Flow",value:stock.forensic.cashFlowFlag?"Diverging":"Aligned",flag:stock.forensic.cashFlowFlag,critical:false,
     detail:stock.forensic.cashFlowFlag?"Profit-cashflow divergence detected":"Earnings and cashflow aligned"},
  ];
  const crit=flags.filter(f=>f.critical).length;
  const warn=flags.filter(f=>f.flag&&!f.critical).length;
  const status=crit>0?"CRITICAL":warn>0?"WARNING":"CLEAN";
  const sc={CRITICAL:T.red,WARNING:T.amber,CLEAN:T.emerald}[status];
  return(
    <Card>
      <SH icon={ShieldAlert} title="Forensic AI Alert" color={sc} right={<Badge color={sc}>{status}</Badge>}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {flags.map((f,i)=>(
          <div key={i} style={{background:T.panel,border:`1px solid ${f.critical?T.red+"55":f.flag?T.amber+"44":T.border}`,borderRadius:8,padding:"8px 10px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:7.5,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{f.label}</span>
              {f.critical?<AlertTriangle size={11} color={T.red}/>:f.flag?<AlertTriangle size={11} color={T.amber}/>:<CheckCircle2 size={11} color={T.emerald}/>}
            </div>
            <div style={{fontSize:14,fontWeight:900,color:f.critical?T.red:f.flag?T.amber:T.emerald}}>{f.value}</div>
            <div style={{fontSize:7.5,color:T.sub,marginTop:3,lineHeight:1.4}}>{f.detail}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── DVM SCORECARD ──────────────────────────────────────────────────────────────
function DVMScorecard({stock,sc}){
  const T=getT();
  const dur=Math.round(sc.quality),val=Math.round(sc.valuation),mom=Math.round(sc.momentum);
  const[d,v,m]=stock.dvm;
  const overall=Math.round((dur+val+mom)/3);
  return(
    <Card>
      <SH icon={Target} title="DVM Scorecard"/>
      <div style={{display:"flex",justifyContent:"space-around",marginBottom:10}}>
        <CircleGauge value={dur} label="Durability"/>
        <CircleGauge value={val} label="Valuation"/>
        <CircleGauge value={mom} label="Momentum"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:10}}>
        {[{l:"Quality",d,c:d==="High"?T.emerald:d==="Medium"?T.amber:T.red},{l:"Value",d:v,c:v==="Cheap"?T.emerald:v==="Fair"?T.amber:T.red},{l:"Trend",d:m,c:m==="Bullish"?T.emerald:m==="Neutral"?T.amber:T.red}].map((b,i)=>(
          <div key={i} style={{background:T.panel,borderRadius:7,padding:"5px 8px",textAlign:"center"}}>
            <div style={{fontSize:7,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{b.l}</div>
            <div style={{fontSize:10,fontWeight:900,color:b.c}}>{b.d}</div>
          </div>
        ))}
      </div>
      <div style={{background:T.panel,borderRadius:8,padding:"8px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:7.5,color:T.muted,fontWeight:700,letterSpacing:"0.1em"}}>COMPOSITE SCORE</span>
          <span style={{fontSize:16,fontWeight:900,color:overall>=70?T.emerald:overall>=45?T.amber:T.red}}>{overall}/100</span>
        </div>
        <MiniBar value={overall} color={overall>=70?T.emerald:overall>=45?T.amber:T.red} height={6}/>
      </div>
    </Card>
  );
}

// ── PROS & CONS ───────────────────────────────────────────────────────────────
function ProsCons({stock}){
  const T=getT();
  return(
    <Card>
      <SH icon={Brain} title="AI Pros & Cons"/>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {stock.pros.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"5px 8px",background:T.panel,borderRadius:6,border:`1px solid ${T.emerald}1a`}}>
            <CheckCircle2 size={11} color={T.emerald} style={{marginTop:1,flexShrink:0}}/>
            <span style={{fontSize:8.5,color:T.text,opacity:0.9,lineHeight:1.5}}>{p}</span>
          </div>
        ))}
        {stock.cons.map((c,i)=>(
          <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"5px 8px",background:T.panel,borderRadius:6,border:`1px solid ${T.red}1a`}}>
            <XCircle size={11} color={T.red} style={{marginTop:1,flexShrink:0}}/>
            <span style={{fontSize:8.5,color:T.text,opacity:0.9,lineHeight:1.5}}>{c}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── PEER TABLE ────────────────────────────────────────────────────────────────
function PeerTable({sym,stock}){
  const T=getT();
  const peers=PEERS[sym]||[];
  const all=[{sym,pe:stock.pe,mcap:stock.mcap,div:stock.divYield,roe:stock.roe[2],isCurrent:true},...peers.map(p=>({...p,isCurrent:false}))];
  return(
    <Card>
      <SH icon={BarChart2} title="Peer Comparison"/>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr>{["Stock","P/E","Mkt Cap","Div%","ROE%","Rating"].map(h=>(
            <th key={h} style={{fontSize:7.5,color:T.muted,fontWeight:800,letterSpacing:"0.08em",padding:"4px 7px",
              textTransform:"uppercase",textAlign:h==="Stock"?"left":"right",borderBottom:`1px solid ${T.border}`}}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {all.map((p,i)=>{
            const pb=p.pe<12?{l:"CHEAP",c:T.emerald}:p.pe<22?{l:"FAIR",c:T.amber}:{l:"PRICEY",c:T.red};
            return(
              <tr key={i} style={{background:p.isCurrent?T.border+"40":"transparent"}}>
                <td style={{padding:"6px 7px",borderBottom:`1px solid ${T.border}`,fontSize:9}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    {p.isCurrent&&<div style={{width:3,height:14,borderRadius:2,background:T.cyan}}/>}
                    <span style={{fontWeight:p.isCurrent?900:600,color:p.isCurrent?T.cyan:T.text}}>{p.sym}</span>
                    {p.isCurrent&&<Badge color={T.cyan} style={{fontSize:7}}>YOU</Badge>}
                  </div>
                </td>
                <td style={{padding:"6px 7px",borderBottom:`1px solid ${T.border}`,fontSize:9,textAlign:"right",fontWeight:800,color:p.pe<15?T.emerald:p.pe>25?T.red:T.amber}}>{p.pe}x</td>
                <td style={{padding:"6px 7px",borderBottom:`1px solid ${T.border}`,fontSize:9,textAlign:"right",color:T.sub}}>{p.mcap}</td>
                <td style={{padding:"6px 7px",borderBottom:`1px solid ${T.border}`,fontSize:9,textAlign:"right",color:p.div>2?T.emerald:p.div>0.5?T.amber:T.muted,fontWeight:700}}>{typeof p.div==="number"?p.div.toFixed(2):p.div}%</td>
                <td style={{padding:"6px 7px",borderBottom:`1px solid ${T.border}`,fontSize:9,textAlign:"right",color:p.roe>20?T.emerald:p.roe>12?T.amber:T.sub,fontWeight:700}}>{typeof p.roe==="number"?p.roe.toFixed(1):p.roe}%</td>
                <td style={{padding:"6px 7px",borderBottom:`1px solid ${T.border}`,textAlign:"right"}}><Badge color={pb.c} style={{fontSize:7}}>{pb.l}</Badge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

// ── NIFTY 50 HEATMAP DATA ─────────────────────────────────────────────────────
const NIFTY50_BASE = [
  { sym:"RELIANCE",  name:"Reliance Industries",  sector:"Energy",       price:2847.35, chg:+1.24, high:2881.20, low:2831.50, mcap:1920 },
  { sym:"TCS",       name:"Tata Consultancy",     sector:"IT",           price:3412.80, chg:-0.38, high:3448.00, low:3398.10, mcap:1240 },
  { sym:"HDFCBANK",  name:"HDFC Bank",            sector:"Banking",      price:1623.45, chg:+0.72, high:1641.80, low:1611.20, mcap:1240 },
  { sym:"ICICIBANK", name:"ICICI Bank",           sector:"Banking",      price:1102.60, chg:+1.84, high:1118.90, low:1094.30, mcap:775  },
  { sym:"INFY",      name:"Infosys",              sector:"IT",           price:1569.14, chg:+0.07, high:1581.00, low:1558.60, mcap:652  },
  { sym:"HINDUNILVR",name:"HUL",                  sector:"FMCG",         price:2418.75, chg:-1.22, high:2445.00, low:2402.10, mcap:567  },
  { sym:"ITC",       name:"ITC Ltd",              sector:"FMCG",         price:428.90,  chg:+0.44, high:432.80,  low:424.50,  mcap:535  },
  { sym:"BAJFINANCE",name:"Bajaj Finance",        sector:"NBFC",         price:6920.40, chg:+2.14, high:7010.00, low:6842.00, mcap:417  },
  { sym:"SBIN",      name:"State Bank of India",  sector:"Banking",      price:818.30,  chg:+0.03, high:824.60,  low:812.40,  mcap:729  },
  { sym:"LT",        name:"L&T",                  sector:"Infra",        price:3580.25, chg:+0.91, high:3610.00, low:3558.80, mcap:492  },
  { sym:"KOTAKBANK", name:"Kotak Mahindra Bank",  sector:"Banking",      price:1742.60, chg:-0.55, high:1762.00, low:1731.20, mcap:347  },
  { sym:"WIPRO",     name:"Wipro",                sector:"IT",           price:481.25,  chg:-2.31, high:494.80,  low:478.40,  mcap:249  },
  { sym:"ASIANPAINT",name:"Asian Paints",         sector:"Consumer",     price:2841.50, chg:-1.68, high:2880.00, low:2826.70, mcap:271  },
  { sym:"AXISBANK",  name:"Axis Bank",            sector:"Banking",      price:1118.40, chg:+1.37, high:1132.00, low:1108.20, mcap:344  },
  { sym:"MARUTI",    name:"Maruti Suzuki",        sector:"Auto",         price:12480.00,chg:+0.62, high:12580.00,low:12388.00,mcap:376  },
  { sym:"SUNPHARMA", name:"Sun Pharma",           sector:"Pharma",       price:1628.90, chg:+2.48, high:1658.00, low:1612.40, mcap:390  },
  { sym:"ULTRACEMCO",name:"UltraTech Cement",     sector:"Cement",       price:10240.00,chg:-0.34, high:10328.00,low:10188.00,mcap:295  },
  { sym:"TITAN",     name:"Titan Company",        sector:"Consumer",     price:3324.60, chg:+1.02, high:3352.00, low:3298.40, mcap:295  },
  { sym:"NESTLEIND", name:"Nestle India",         sector:"FMCG",         price:2418.40, chg:-0.81, high:2440.00, low:2405.60, mcap:233  },
  { sym:"HCLTECH",   name:"HCL Technologies",     sector:"IT",           price:1482.30, chg:+0.18, high:1494.00, low:1471.60, mcap:401  },
  { sym:"M&M",       name:"Mahindra & Mahindra",  sector:"Auto",         price:2142.80, chg:+3.12, high:2182.00, low:2118.60, mcap:265  },
  { sym:"POWERGRID", name:"Power Grid",           sector:"Power",        price:328.45,  chg:+0.28, high:331.20,  low:325.80,  mcap:305  },
  { sym:"ADANIENT",  name:"Adani Enterprises",    sector:"Conglomerate", price:2842.60, chg:-2.84, high:2920.00, low:2818.40, mcap:323  },
  { sym:"ONGC",      name:"ONGC",                 sector:"Energy",       price:282.60,  chg:+0.71, high:285.40,  low:279.80,  mcap:355  },
  { sym:"NTPC",      name:"NTPC",                 sector:"Power",        price:388.70,  chg:+1.54, high:394.40,  low:384.20,  mcap:376  },
  { sym:"TATAMOTORS",name:"Tata Motors",          sector:"Auto",         price:958.40,  chg:+2.77, high:972.00,  low:944.80,  mcap:313  },
  { sym:"COALINDIA", name:"Coal India",           sector:"Mining",       price:488.20,  chg:-0.94, high:496.00,  low:484.60,  mcap:300  },
  { sym:"BAJAJFINSV",name:"Bajaj Finserv",        sector:"NBFC",         price:1624.80, chg:+0.48, high:1641.00, low:1612.40, mcap:259  },
  { sym:"TATASTEEL", name:"Tata Steel",           sector:"Metals",       price:168.40,  chg:-3.22, high:174.20,  low:166.80,  mcap:210  },
  { sym:"JSWSTEEL",  name:"JSW Steel",            sector:"Metals",       price:882.60,  chg:-2.41, high:906.00,  low:878.20,  mcap:214  },
  { sym:"TECHM",     name:"Tech Mahindra",        sector:"IT",           price:1284.60, chg:+1.68, high:1298.00, low:1272.40, mcap:124  },
  { sym:"GRASIM",    name:"Grasim Industries",    sector:"Diversified",  price:2342.80, chg:-0.12, high:2360.00, low:2328.40, mcap:154  },
  { sym:"HINDALCO",  name:"Hindalco",             sector:"Metals",       price:628.40,  chg:-1.84, high:642.00,  low:622.80,  mcap:141  },
  { sym:"INDUSINDBK",name:"IndusInd Bank",        sector:"Banking",      price:1424.60, chg:-0.66, high:1442.00, low:1412.40, mcap:111  },
  { sym:"BHARTIARTL",name:"Bharti Airtel",        sector:"Telecom",      price:1584.20, chg:+1.92, high:1604.00, low:1568.40, mcap:892  },
  { sym:"HDFCLIFE",  name:"HDFC Life",            sector:"Insurance",    price:624.40,  chg:+0.84, high:631.00,  low:618.80,  mcap:134  },
  { sym:"DIVISLAB",  name:"Divi's Laboratories",  sector:"Pharma",       price:4842.60, chg:+1.14, high:4888.00, low:4802.40, mcap:128  },
  { sym:"CIPLA",     name:"Cipla",                sector:"Pharma",       price:1408.40, chg:+0.58, high:1422.00, low:1396.80, mcap:113  },
  { sym:"DRREDDY",   name:"Dr. Reddy's Labs",     sector:"Pharma",       price:5842.60, chg:-0.44, high:5888.00, low:5802.40, mcap:97   },
  { sym:"EICHERMOT", name:"Eicher Motors",        sector:"Auto",         price:4284.60, chg:+0.36, high:4318.00, low:4258.40, mcap:117  },
  { sym:"HEROMOTOCO",name:"Hero MotoCorp",        sector:"Auto",         price:5142.60, chg:+0.22, high:5188.00, low:5102.40, mcap:102  },
  { sym:"BPCL",      name:"BPCL",                 sector:"Energy",       price:624.40,  chg:+1.44, high:634.00,  low:616.80,  mcap:135  },
  { sym:"TATACONSUM",name:"Tata Consumer",        sector:"FMCG",         price:1128.40, chg:+0.74, high:1142.00, low:1118.80, mcap:104  },
  { sym:"APOLLOHOSP",name:"Apollo Hospitals",     sector:"Healthcare",   price:6842.60, chg:+2.18, high:6920.00, low:6778.40, mcap:98   },
  { sym:"UPL",       name:"UPL Ltd",              sector:"Agri",         price:548.40,  chg:-1.14, high:558.00,  low:542.80,  mcap:42   },
  { sym:"BAJAJ-AUTO",name:"Bajaj Auto",           sector:"Auto",         price:9284.60, chg:+1.64, high:9348.00, low:9218.40, mcap:259  },
  { sym:"SBILIFE",   name:"SBI Life Insurance",   sector:"Insurance",    price:1484.60, chg:+0.94, high:1498.00, low:1472.40, mcap:149  },
  { sym:"LTIM",      name:"LTIMindtree",          sector:"IT",           price:5820.40, chg:+1.24, high:5888.00, low:5762.40, mcap:172  },
  { sym:"SHREECEM",  name:"Shree Cement",         sector:"Cement",       price:27842.60,chg:-0.58, high:28100.00,low:27642.40,mcap:100  },
  { sym:"ADANIPORTS",name:"Adani Ports",          sector:"Logistics",    price:1342.60, chg:+0.84, high:1358.00, low:1328.40, mcap:289  },
];

// ── HEATMAP COMPONENT ─────────────────────────────────────────────────────────
function MarketHeatmap() {
  const T=getT();
  const [stocks, setStocks] = useState(() =>
    NIFTY50_BASE.map(s => ({ ...s }))
  );
  const [tooltip, setTooltip] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [hoverSym, setHoverSym] = useState(null);
  const [sectorFilter, setSectorFilter] = useState("All");
  const containerRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setStocks(prev => prev.map(s => ({
        ...s,
        chg: parseFloat(Math.max(-5, Math.min(5, s.chg + (Math.random() - 0.5) * 0.12)).toFixed(2)),
        price: parseFloat((s.price * (1 + (Math.random() - 0.5) * 0.0006)).toFixed(2)),
      })));
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const sectors = ["All", ...Array.from(new Set(NIFTY50_BASE.map(s => s.sector))).sort()];
  const filtered = stocks.filter(s => sectorFilter === "All" || s.sector === sectorFilter);
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "gainers") return b.chg - a.chg;
    if (sortOrder === "losers")  return a.chg - b.chg;
    return 0;
  });

  const getColor = (chg) => {
    if (chg > 2)   return { bg:"#052e1c", border:"#10b981", text:"#6ee7b7", glow:"#10b98155" };
    if (chg > 0)   return { bg:"#071a13", border:"#34d399", text:"#a7f3d0", glow:"#34d39933" };
    if (chg > -2)  return { bg:"#2d0a14", border:"#fb7185", text:"#fecdd3", glow:"#fb718533" };
    return           { bg:"#2a0606", border:"#ef4444", text:"#fca5a5", glow:"#ef444455" };
  };

  const maxMcap = Math.max(...sorted.map(s => s.mcap));
  const getSize = (mcap) => {
    const r = mcap / maxMcap;
    if (r > 0.7) return { w:148, h:92 };
    if (r > 0.4) return { w:120, h:78 };
    if (r > 0.2) return { w:100, h:68 };
    if (r > 0.1) return { w:86,  h:60 };
    return              { w:74,  h:54 };
  };

  const handleMouseEnter = (e, stock) => {
    const rect = containerRef.current?.getBoundingClientRect();
    setTooltip({ stock, x: e.clientX - (rect?.left||0), y: e.clientY - (rect?.top||0) });
    setHoverSym(stock.sym);
  };
  const handleMouseLeave = () => { setTooltip(null); setHoverSym(null); };

  const gainers = stocks.filter(s => s.chg > 0).length;
  const losers  = stocks.filter(s => s.chg < 0).length;
  const avgChg  = (stocks.reduce((a,b) => a + b.chg, 0) / stocks.length).toFixed(2);

  return (
    <div style={{ fontFamily:"'JetBrains Mono',monospace", display:"flex", flexDirection:"column", gap:14 }}>

      {/* HEADER */}
      <div style={{
        background:"linear-gradient(135deg,#0a1628,#0d1f38)",
        border:`1px solid ${T.border}`, borderRadius:14, padding:"16px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:38, height:38,
            background:"linear-gradient(135deg,#10b981,#06b6d4)",
            borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 20px #10b98144",
          }}>
            <Map size={18} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:900, color:T.text, letterSpacing:"0.05em" }}>
              NIFTY 50 · MARKET HEATMAP
              <span style={{
                marginLeft:8, fontSize:7.5, fontWeight:800, padding:"2px 7px",
                borderRadius:4, background:"linear-gradient(135deg,#10b981,#06b6d4)", color:"#fff",
              }}>LIVE</span>
            </div>
            <div style={{ fontSize:8, color:T.sub, marginTop:2 }}>StockEdge-Style · Mcap Weighted · Auto-refresh 2.4s</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[
            { label:"ADVANCING", val:gainers, color:T.emerald },
            { label:"DECLINING",  val:losers,  color:T.red },
            { label:"AVG CHANGE", val:`${Number(avgChg)>=0?"+":""}${avgChg}%`, color:Number(avgChg)>=0?T.emerald:T.red },
          ].map(m => (
            <div key={m.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:7, color:T.muted, letterSpacing:"0.12em", marginBottom:2 }}>{m.label}</div>
              <div style={{ fontSize:15, fontWeight:900, color:m.color }}>{m.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", gap:7 }}>
          {[
            { id:"default", label:"Default" },
            { id:"gainers", label:"▲ Top Gainers" },
            { id:"losers",  label:"▼ Top Losers"  },
          ].map(btn => (
            <button key={btn.id} onClick={()=>setSortOrder(btn.id)} style={{
              background: sortOrder===btn.id
                ? btn.id==="gainers"?`${T.emerald}22`:btn.id==="losers"?`${T.red}22`:`${T.cyan}22`
                : T.card,
              border:`1.5px solid ${sortOrder===btn.id
                ? btn.id==="gainers"?T.emerald:btn.id==="losers"?T.red:T.cyan
                : T.border}`,
              borderRadius:8, padding:"7px 14px",
              color: sortOrder===btn.id
                ? btn.id==="gainers"?T.emerald:btn.id==="losers"?T.red:T.cyan
                : T.sub,
              fontSize:9, fontWeight:800, cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:5, transition:"all .18s",
            }}>
              <ArrowUpDown size={10}/>{btn.label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", maxWidth:520 }}>
          {sectors.map(sec => (
            <button key={sec} onClick={()=>setSectorFilter(sec)} style={{
              background:sectorFilter===sec?`${T.indigo}22`:"transparent",
              border:`1px solid ${sectorFilter===sec?T.indigo:T.border}`,
              borderRadius:5, padding:"3px 8px",
              color:sectorFilter===sec?T.indigo:T.muted,
              fontSize:7.5, fontWeight:800, cursor:"pointer", fontFamily:"inherit",
              transition:"all .15s",
            }}>{sec}</button>
          ))}
        </div>
      </div>

      {/* LEGEND */}
      <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
        {[
          { label:"> +2%",      bg:"#052e1c", border:"#10b981" },
          { label:"0% to +2%", bg:"#071a13", border:"#34d399" },
          { label:"0% to -2%", bg:"#2d0a14", border:"#fb7185" },
          { label:"< -2%",     bg:"#2a0606", border:"#ef4444" },
        ].map(l => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:l.bg, border:`1.5px solid ${l.border}` }}/>
            <span style={{ fontSize:8, color:T.sub }}>{l.label}</span>
          </div>
        ))}
        <span style={{ fontSize:7.5, color:T.muted, marginLeft:"auto" }}>Box size = Market Cap</span>
      </div>

      {/* HEATMAP GRID */}
      <div ref={containerRef} style={{ position:"relative" }}>
        <div style={{
          display:"flex", flexWrap:"wrap", gap:4, padding:12,
          borderRadius:14, background: T.dim, border:`1px solid ${T.border}`,
          minHeight:400,
        }}>
          {sorted.map(stock => {
            const col  = getColor(stock.chg);
            const size = getSize(stock.mcap);
            const isHov = hoverSym === stock.sym;
            return (
              <div key={stock.sym}
                onMouseEnter={e=>handleMouseEnter(e,stock)}
                onMouseLeave={handleMouseLeave}
                style={{
                  width:size.w, height:size.h,
                  background:col.bg,
                  border:`1.5px solid ${isHov?col.border:col.border+"77"}`,
                  borderRadius:8, cursor:"pointer",
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center",
                  gap:2, padding:"6px 4px", overflow:"hidden",
                  boxShadow:isHov?`0 0 18px ${col.glow},inset 0 0 10px ${col.glow}`:`inset 0 0 4px ${col.glow}`,
                  transform:isHov?"scale(1.05)":"scale(1)",
                  transition:"all .15s ease",
                  userSelect:"none", position:"relative",
                }}
              >
                {/* Glow overlay on hover */}
                {isHov && (
                  <div style={{
                    position:"absolute", inset:0, borderRadius:7,
                    background:`${col.border}18`, pointerEvents:"none",
                  }}/>
                )}
                <div style={{
                  fontSize:size.w>110?11:9, fontWeight:900,
                  color:col.text, letterSpacing:"0.03em", zIndex:1, textAlign:"center",
                }}>{stock.sym}</div>
                <div style={{
                  fontSize:size.w>110?8.5:7.5, color:col.text+"aa", zIndex:1,
                }}>₹{stock.price.toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
                <div style={{
                  fontSize:size.w>110?10:9, fontWeight:900, zIndex:1,
                  color:stock.chg>=0?"#6ee7b7":"#fca5a5",
                  background:stock.chg>=0?"#10b98118":"#ef444418",
                  padding:"1px 5px", borderRadius:4, marginTop:1,
                }}>
                  {stock.chg>=0?"+":""}{stock.chg.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* TOOLTIP */}
        {tooltip && (() => {
          const {stock,x,y} = tooltip;
          const col = getColor(stock.chg);
          const tipW = 208;
          const contW = containerRef.current?.offsetWidth || 900;
          const left  = x + tipW + 16 > contW ? x - tipW - 10 : x + 14;
          return (
            <div style={{
              position:"absolute", left, top:Math.max(4, y-64),
              zIndex:100, pointerEvents:"none",
              background:T.card, border:`1.5px solid ${col.border}`,
              borderRadius:10, padding:"12px 14px", width:tipW,
              boxShadow:`0 10px 40px #00000099, 0 0 16px ${col.glow}`,
              animation:"fadeIn 0.12s ease",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:900, color:col.text }}>{stock.sym}</div>
                  <div style={{ fontSize:7.5, color:T.sub, marginTop:1 }}>{stock.name}</div>
                  <div style={{ fontSize:7, color:T.muted, marginTop:1 }}>{stock.sector}</div>
                </div>
                <div style={{
                  background:stock.chg>=0?T.emerald+"22":T.red+"22",
                  border:`1px solid ${stock.chg>=0?T.emerald:T.red}44`,
                  borderRadius:6, padding:"4px 8px", height:"fit-content",
                  fontSize:11, fontWeight:900, color:stock.chg>=0?T.emerald:T.red,
                }}>
                  {stock.chg>=0?"+":""}{stock.chg.toFixed(2)}%
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:8 }}>
                {[
                  { label:"LTP",      val:`₹${stock.price.toLocaleString("en-IN")}` },
                  { label:"Mkt Cap",  val:`₹${stock.mcap.toLocaleString("en-IN")}B` },
                  { label:"Day High", val:`₹${stock.high.toLocaleString("en-IN")}` },
                  { label:"Day Low",  val:`₹${stock.low.toLocaleString("en-IN")}`  },
                ].map(m => (
                  <div key={m.label} style={{ background:T.panel, borderRadius:6, padding:"5px 7px" }}>
                    <div style={{ fontSize:7, color:T.muted, marginBottom:1 }}>{m.label}</div>
                    <div style={{ fontSize:9, fontWeight:800, color:T.text }}>{m.val}</div>
                  </div>
                ))}
              </div>
              {/* Day range bar */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:7, color:T.muted }}>Day Range</span>
                  <span style={{ fontSize:7, color:T.muted }}>
                    ₹{stock.low.toLocaleString("en-IN")} – ₹{stock.high.toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ height:5, background:T.border, borderRadius:3, overflow:"hidden", position:"relative" }}>
                  <div style={{
                    position:"absolute", left:0, top:0, height:"100%",
                    width:`${Math.max(5,Math.min(95,((stock.price-stock.low)/(stock.high-stock.low))*100))}%`,
                    background:stock.chg>=0
                      ?`linear-gradient(90deg,${T.emerald}66,${T.emerald})`
                      :`linear-gradient(90deg,${T.red}66,${T.red})`,
                    borderRadius:3,
                  }}/>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* SECTOR PERFORMANCE STRIP */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 16px" }}>
        <div style={{ fontSize:8.5, fontWeight:900, color:T.sub, letterSpacing:"0.12em", marginBottom:10 }}>
          ▸ SECTOR PERFORMANCE · CLICK TO FILTER
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {Array.from(new Set(NIFTY50_BASE.map(s=>s.sector))).sort().map(sec => {
            const ss = stocks.filter(s=>s.sector===sec);
            const avg = ss.reduce((a,b)=>a+b.chg,0)/ss.length;
            const col = getColor(avg);
            const active = sectorFilter===sec;
            return (
              <div key={sec} onClick={()=>setSectorFilter(active?"All":sec)} style={{
                background:col.bg, border:`1px solid ${active?col.border:col.border+"66"}`,
                borderRadius:8, padding:"7px 12px", cursor:"pointer",
                transition:"all .15s",
                boxShadow:active?`0 0 12px ${col.glow}`:undefined,
                outline:active?`2px solid ${col.border}`:undefined,
                minWidth:72, textAlign:"center",
              }}>
                <div style={{ fontSize:7.5, fontWeight:900, color:col.text, marginBottom:2 }}>{sec}</div>
                <div style={{ fontSize:10, fontWeight:900, color:avg>=0?"#6ee7b7":"#fca5a5" }}>
                  {avg>=0?"+":""}{avg.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// SPLASH SCREEN — pure React + CSS (no external dependencies)
// ═══════════════════════════════════════════════════════════════════

const SPLASH_COL = {
  bg:"#060d1a", bgGrad1:"#080f20", bgGrad2:"#030912",
  stroke:"#e2e8f0", glowCore:"#f1f5f9", glowMid:"#94a3b8",
  accentCyan:"#06b6d4", accentIndigo:"#6366f1",
  text:"#f1f5f9", sub:"#64748b", gridLine:"#0d1a2e",
};
const S_DRAW_START = 200;
const S_DRAW_DUR   = 1600;
const S_GLOW_START = 1700;
const S_TEXT_START = 2000;
const S_TAGLINE    = 2550;
const S_HOLD       = 3400;
const S_EXIT_DUR   = 900;
const LOGO_M_PATH  = "M 28 86 L 28 34 L 60 62 L 92 34 L 92 86";
const M_PATH_LEN   = 192;
const S_CIRCLE_R   = 50;
const S_CIRC       = +(2*Math.PI*S_CIRCLE_R).toFixed(2);
const SPLASH_TICKER_DATA = [
  "RELIANCE  ₹2,847  +1.1%","HDFCBANK  ₹1,623  +0.8%","TCS  ₹3,412  −0.4%",
  "NIFTY 50  24,346  +0.6%","SENSEX  80,182  +0.5%","BAJFINANCE  ₹6,920  +2.1%",
  "INFY  ₹1,587  +1.8%","SBIN  ₹812  +2.4%","USD/INR  83.42  +0.1%","GOLD  ₹72,840  +0.3%",
];
const SPLASH_PX = Array.from({length:20},(_,i)=>({
  id:i, left:`${5+(i*37.3)%90}%`, top:`${8+(i*53.7)%84}%`,
  size:i%4===0?3:2,
  color:i%3===0?"#06b6d4":i%5===0?"#6366f1":"#94a3b8",
  delay:`${(i*0.18)%2.4}s`, dur:`${2.8+(i%5)*0.4}s`,
}));

const SPLASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700;900&display=swap');
  @keyframes spFadeIn    {from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
  @keyframes spExit      {from{opacity:1;transform:scale(1);filter:blur(0px)}to{opacity:0;transform:scale(0.88);filter:blur(8px)}}
  @keyframes spGlowPulse {0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:0.9;transform:scale(1.08)}}
  @keyframes spLogoIn    {from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
  @keyframes spLetterIn  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spFadeUp    {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spTicker    {from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes spParticle  {0%,100%{opacity:0;transform:scale(0)}25%{opacity:0.8;transform:scale(1)}50%{opacity:0.3;transform:scale(0.7)}75%{opacity:0.9;transform:scale(1.2)}}
  @keyframes spBarFill   {from{width:0%}to{width:100%}}
  @keyframes spCorner    {from{opacity:0;transform:scale(0.4)}to{opacity:1;transform:scale(1)}}
  @keyframes spCentre    {0%{opacity:0;transform:translate(-50%,-50%) scale(0)}40%{opacity:1;transform:translate(-50%,-50%) scale(1.4)}70%{opacity:0.7;transform:translate(-50%,-50%) scale(1)}100%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}}
  @keyframes spHalo      {0%,100%{opacity:0.5;transform:scale(0.95)}50%{opacity:0.85;transform:scale(1.1)}}
  @keyframes spGridIn    {from{opacity:0}to{opacity:1}}
  .sp-circle{stroke-dasharray:${S_CIRC};stroke-dashoffset:${S_CIRC};transition:stroke-dashoffset ${S_DRAW_DUR*0.85}ms cubic-bezier(0.22,1,0.36,1) ${S_DRAW_START}ms}
  .sp-circle.sp-drawing{stroke-dashoffset:0}
  .sp-mpath{stroke-dasharray:${M_PATH_LEN};stroke-dashoffset:${M_PATH_LEN};transition:stroke-dashoffset ${S_DRAW_DUR}ms cubic-bezier(0.16,1,0.3,1) ${S_DRAW_START+150}ms}
  .sp-mpath.sp-drawing{stroke-dashoffset:0}
`;

function SplashScreen({ onComplete }) {
  const [phase,       setPhase]       = useState("hidden");
  const [textVisible, setTextVisible] = useState(false);
  const [tickerVis,   setTickerVis]   = useState(false);
  const [exiting,     setExiting]     = useState(false);
  const [mounted,     setMounted]     = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setMounted(true),          30);
    const t1 = setTimeout(() => setPhase("drawing"),       S_DRAW_START);
    const t2 = setTimeout(() => setPhase("glowing"),       S_GLOW_START);
    const t3 = setTimeout(() => setTextVisible(true),      S_TEXT_START);
    const t4 = setTimeout(() => setTickerVis(true),        S_TAGLINE);
    const t5 = setTimeout(() => setExiting(true),          S_HOLD);
    const t6 = setTimeout(() => onComplete?.(),            S_HOLD + S_EXIT_DUR + 100);
    return () => [t0,t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
  }, []);

  const isDrawing = phase==="drawing"||phase==="glowing";
  const isGlowing = phase==="glowing";
  const C = SPLASH_COL;

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9999,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background:`radial-gradient(ellipse at 50% 40%, ${C.bgGrad1} 0%, ${C.bgGrad2} 100%)`,
      overflow:"hidden",
      fontFamily:"'JetBrains Mono','IBM Plex Mono','Courier New',monospace",
      animation: exiting ? `spExit ${S_EXIT_DUR}ms cubic-bezier(0.4,0,1,1) forwards`
                         : mounted ? "spFadeIn 500ms ease-out forwards" : "none",
    }}>
      <style>{SPLASH_CSS}</style>

      {/* Grid */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",animation:"spGridIn 1.2s ease-in forwards"}}>
        <svg width="100%" height="100%" style={{position:"absolute",inset:0}} preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="spgf" cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor={C.gridLine} stopOpacity="0"/>
              <stop offset="70%"  stopColor={C.gridLine} stopOpacity="1"/>
              <stop offset="100%" stopColor={C.gridLine} stopOpacity="1"/>
            </radialGradient>
          </defs>
          {Array.from({length:18},(_,i)=>(<line key={`h${i}`} x1="0%" y1={`${(i/17)*100}%`} x2="100%" y2={`${(i/17)*100}%`} stroke={C.gridLine} strokeWidth="1" opacity="0.6"/>))}
          {Array.from({length:28},(_,i)=>(<line key={`v${i}`} x1={`${(i/27)*100}%`} y1="0%" x2={`${(i/27)*100}%`} y2="100%" stroke={C.gridLine} strokeWidth="1" opacity="0.4"/>))}
          <rect width="100%" height="100%" fill="url(#spgf)"/>
        </svg>
      </div>

      {/* Particles */}
      {SPLASH_PX.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:p.left,top:p.top,
          width:p.size,height:p.size,borderRadius:"50%",
          background:p.color,boxShadow:`0 0 ${p.size*4}px ${p.color}`,
          animation:`spParticle ${p.dur} ease-in-out ${p.delay} infinite`,
        }}/>
      ))}

      {/* Central glow */}
      <div style={{
        position:"absolute",width:480,height:480,borderRadius:"50%",
        background:`radial-gradient(circle,${C.accentCyan}0a 0%,${C.accentIndigo}06 35%,transparent 65%)`,
        filter:"blur(30px)",pointerEvents:"none",
        opacity:isGlowing?0.7:0.2,transition:"opacity 0.8s ease",
        animation:isGlowing?"spGlowPulse 3s ease-in-out infinite":"none",
      }}/>

      {/* Logo */}
      <div style={{position:"relative",zIndex:2,animation:"spLogoIn 500ms ease-out 50ms both"}}>
        {/* Halo */}
        <div style={{
          position:"absolute",inset:-30,borderRadius:"50%",
          background:`radial-gradient(circle,${C.accentCyan}22 0%,transparent 65%)`,
          filter:"blur(18px)",
          opacity:isGlowing?0.8:0,transition:"opacity 0.8s ease",
          animation:isGlowing?"spHalo 2s ease-in-out infinite":"none",
        }}/>
        <svg viewBox="0 0 120 120" width="160" height="160" style={{position:"relative",zIndex:2,overflow:"visible"}}>
          <defs>
            <filter id="spng" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="b1"/>
              <feGaussianBlur stdDeviation="5"   result="b2"/>
              <feGaussianBlur stdDeviation="10"  result="b3"/>
              <feMerge><feMergeNode in="b3"/><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="spmg" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.8" result="b1"/>
              <feGaussianBlur stdDeviation="4"   result="b2"/>
              <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <linearGradient id="spcg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={C.accentCyan}   stopOpacity="0.9"/>
              <stop offset="40%"  stopColor={C.glowCore}     stopOpacity="1"/>
              <stop offset="70%"  stopColor={C.glowMid}      stopOpacity="0.95"/>
              <stop offset="100%" stopColor={C.accentIndigo} stopOpacity="0.9"/>
            </linearGradient>
            <linearGradient id="spmg2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={C.accentCyan} stopOpacity="0.85"/>
              <stop offset="50%"  stopColor={C.glowCore}   stopOpacity="1"/>
              <stop offset="100%" stopColor={C.accentCyan} stopOpacity="0.85"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={S_CIRCLE_R} fill="none"
            stroke={isGlowing?"url(#spcg)":C.stroke}
            strokeWidth={isGlowing?2.2:1.8} strokeLinecap="round"
            filter={isGlowing?"url(#spng)":undefined}
            className={`sp-circle${isDrawing?" sp-drawing":""}`}/>
          <path d={LOGO_M_PATH} fill="none"
            stroke={isGlowing?"url(#spmg2)":C.stroke}
            strokeWidth={isGlowing?3.5:2.8}
            strokeLinecap="round" strokeLinejoin="round"
            filter={isGlowing?"url(#spmg)":undefined}
            className={`sp-mpath${isDrawing?" sp-drawing":""}`}/>
          {isGlowing && [
            {x1:10,y1:22,x2:10,y2:14,x3:10,y3:14,x4:18,y4:14},
            {x1:110,y1:22,x2:110,y2:14,x3:110,y3:14,x4:102,y4:14},
            {x1:10,y1:98,x2:10,y2:106,x3:10,y3:106,x4:18,y4:106},
            {x1:110,y1:98,x2:110,y2:106,x3:110,y3:106,x4:102,y4:106},
          ].map((t,i)=>(
            <g key={i} style={{opacity:0,animation:`spFadeUp 0.3s ease ${i*60}ms both`}}>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={C.accentCyan} strokeWidth="1" strokeLinecap="round"/>
              <line x1={t.x3} y1={t.y3} x2={t.x4} y2={t.y4} stroke={C.accentCyan} strokeWidth="1" strokeLinecap="round"/>
            </g>
          ))}
        </svg>
        {isGlowing && (
          <div style={{
            position:"absolute",top:"50%",left:"50%",width:6,height:6,borderRadius:"50%",
            background:C.glowCore,boxShadow:`0 0 12px ${C.glowCore},0 0 24px ${C.accentCyan}`,
            zIndex:3,animation:"spCentre 0.6s ease-out 100ms both",
          }}/>
        )}
      </div>

      {/* Wordmark */}
      <div style={{marginTop:28,zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
        <div style={{fontSize:28,fontWeight:900,color:C.text,lineHeight:1,display:"flex",alignItems:"baseline",gap:0}}>
          {textVisible && (<>
            {"MARKET".split("").map((ch,i)=>(
              <span key={i} style={{display:"inline-block",letterSpacing:"0.22em",opacity:0,
                animation:`spLetterIn 0.55s cubic-bezier(0.22,1,0.36,1) ${i*45}ms both`}}>{ch}</span>
            ))}
            <span style={{color:C.accentCyan,marginLeft:"0.22em",marginRight:"0.04em",opacity:0,
              animation:"spFadeUp 0.3s ease 420ms both"}}>·</span>
            {"MIND".split("").map((ch,i)=>(
              <span key={i} style={{display:"inline-block",letterSpacing:"0.22em",opacity:0,
                animation:`spLetterIn 0.55s cubic-bezier(0.22,1,0.36,1) ${300+i*45}ms both`}}>{ch}</span>
            ))}
          </>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,width:"100%",
          opacity:textVisible?1:0,transition:"opacity 0.5s ease 600ms"}}>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.accentCyan}66)`}}/>
          <span style={{fontSize:8.5,fontWeight:700,letterSpacing:"0.32em",color:C.accentCyan}}>AI</span>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.accentCyan}66,transparent)`}}/>
        </div>
        <p style={{fontSize:9,fontWeight:500,letterSpacing:"0.28em",color:C.sub,
          textTransform:"uppercase",margin:"2px 0 0 0",opacity:0,
          animation:tickerVis?"spFadeUp 0.6s ease forwards":"none"}}>
          Professional Trading Terminal
        </p>
        <div style={{marginTop:4,padding:"3px 12px",borderRadius:20,
          border:`1px solid ${C.accentCyan}30`,background:`${C.accentCyan}08`,
          fontSize:7.5,fontWeight:700,letterSpacing:"0.18em",
          color:`${C.accentCyan}bb`,textTransform:"uppercase",opacity:0,
          animation:tickerVis?"spFadeUp 0.4s ease 200ms both":"none"}}>
          v8.0 · NSE · BSE · LIVE
        </div>
      </div>

      {/* Progress bar */}
      {textVisible && (
        <div style={{position:"absolute",bottom:72,left:"50%",transform:"translateX(-50%)",
          width:220,height:2,background:`${C.accentCyan}18`,borderRadius:2,overflow:"hidden",zIndex:3,
          animation:"spFadeUp 0.4s ease forwards"}}>
          <div style={{height:"100%",
            background:`linear-gradient(90deg,${C.accentCyan},${C.glowCore},${C.accentIndigo})`,
            borderRadius:2,boxShadow:`0 0 8px ${C.accentCyan}`,
            animation:`spBarFill ${S_HOLD-S_TEXT_START-300}ms linear forwards`}}/>
        </div>
      )}

      {/* Ticker */}
      <div style={{position:"absolute",bottom:32,left:0,right:0,overflow:"hidden",height:22,
        borderTop:`1px solid ${C.accentCyan}18`,borderBottom:`1px solid ${C.accentCyan}18`,
        background:`linear-gradient(90deg,${C.bg},transparent 8%,transparent 92%,${C.bg})`,
        opacity:tickerVis?1:0,transition:"opacity 0.6s ease"}}>
        <div style={{display:"flex",alignItems:"center",whiteSpace:"nowrap",
          fontSize:9,color:C.sub,fontWeight:500,letterSpacing:"0.06em",height:"100%",
          animation:"spTicker 28s linear infinite"}}>
          {[...SPLASH_TICKER_DATA,...SPLASH_TICKER_DATA].map((item,i)=>(
            <span key={i} style={{padding:"0 28px"}}>
              <span style={{color:item.includes("−")?"#ef4444":item.includes("+")?"#10b981":C.sub}}>{item}</span>
              <span style={{color:C.accentCyan,opacity:0.3,marginLeft:24}}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Corner brackets */}
      {[
        {top:20,left:20,   borderTop:`1px solid ${C.accentCyan}44`,borderLeft:`1px solid ${C.accentCyan}44`,   animationDelay:"200ms"},
        {top:20,right:20,  borderTop:`1px solid ${C.accentCyan}44`,borderRight:`1px solid ${C.accentCyan}44`,  animationDelay:"280ms"},
        {bottom:20,left:20, borderBottom:`1px solid ${C.accentCyan}44`,borderLeft:`1px solid ${C.accentCyan}44`, animationDelay:"360ms"},
        {bottom:20,right:20,borderBottom:`1px solid ${C.accentCyan}44`,borderRight:`1px solid ${C.accentCyan}44`,animationDelay:"440ms"},
      ].map((s,i)=>{
        const {animationDelay,...rest} = s;
        return (
          <div key={i} style={{position:"absolute",width:20,height:20,...rest,
            opacity:0,animation:`spCorner 0.4s ease ${animationDelay} both`}}/>
        );
      })}
    </div>
  );
}

export default function App(){
  const[isDark,     setIsDark]    = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const[navTab,    setNavTab]    = useState("dashboard");
  const[sym,       setSym]       = useState("RELIANCE");
  const[tickers,   setTickers]   = useState(()=>genTickers(null));
  const[candles,   setCandles]   = useState(()=>genCandles(STOCKS.RELIANCE.base));
  const[shadow,    setShadow]    = useState([]);
  const[aiConf,    setAiConf]    = useState(78);
  const[moodVal,   setMoodVal]   = useState(67);
  const[blink,     setBlink]     = useState(false);
  const[sc,        setSc]        = useState({quality:82,valuation:56,momentum:76});
  const[riskMode,  setRiskMode]  = useState("conservative");
  const[qty,       setQty]       = useState(10);
  const[flash,     setFlash]     = useState(null);
  const[orderLog,  setOrderLog]  = useState([]);
  const[paperPnl,  setPaperPnl]  = useState(0);
  const[watchlist, setWatchlist] = useState(WL_INIT);
  const[newSym,    setNewSym]    = useState("");
  const[newQty,    setNewQty]    = useState("");
  const[newsIdx,   setNewsIdx]   = useState(0);
  const[hollyPicks,setHollyPicks]= useState(HOLLY_BASE);
  // ── Groww state ──────────────────────────────────────────────────────────────
  const[kycStatus, setKycStatus] = useState("verified"); // "verified"|"pending"|"none"
  const[sipActive, setSipActive] = useState({});          // { fundName: sipAmount }
  const[assetTab,  setAssetTab]  = useState("stocks");    // "stocks"|"etf"|"gold"
  const[learnOpen, setLearnOpen] = useState(null);        // article index or null
  const[sipModal,  setSipModal]  = useState(null);        // fund index or null
  const[sipAmt,    setSipAmt]    = useState(500);
  const[goldGrams, setGoldGrams] = useState(1);
  const[mfFilter,  setMfFilter]  = useState("all");       // "all"|"largecap"|"midcap"|"smallcap"|"index"
  // ── Zerodha Kite state ───────────────────────────────────────────────────────
  const[kiteStatus,setKiteStatus]= useState("connected");  // "connected"|"disconnected"
  const[chartOrder,setChartOrder]= useState(null);         // {type, price} for order-from-chart
  // ── Upstox Option Chain state ────────────────────────────────────────────────
  const[ocExpiry,  setOcExpiry]  = useState("27 Jun 2024");
  const[ocGreeks,  setOcGreeks]  = useState(true);
  const[ocTab,     setOcTab]     = useState("chain");       // "chain"|"builder"
  // ── Angel One Advisory state ─────────────────────────────────────────────────
  const[advisorTab,setAdvisorTab]= useState("ideas");      // "ideas"|"sectors"
  // ── StockEdge Screener state ──────────────────────────────────────────────────
  const[screenFilter,setScreenFilter] = useState("52W High");
  // ── 5paisa UI state ───────────────────────────────────────────────────────────
  const[uiMode,    setUiMode]    = useState("retail");     // "retail"|"trader"
  const[brokerTrade,setBrokerTrade]= useState({qty:100,price:2847,type:"Equity F&O"});
  const[brokerResult,setBrokerResult]= useState(null);

  // ── Price Alert System ────────────────────────────────────────────────────
  const {
    alerts:priceAlerts, toasts:alertToasts, notifPerm,
    addAlert, deleteAlert, toggleAlert, clearAll:clearAlerts, requestPermission,
  } = usePriceAlerts(tickers);
  // ── Theme sync ───────────────────────────────────────────────────────────────
  T  = isDark ? DARK_T  : LIGHT_T;
  TV = isDark ? TV_DARK : TV_LIGHT;

  const toggleTheme = () => setIsDark(d => !d);

  const stock  =STOCKS[sym];
  const selTick=tickers.find(t=>t.sym===sym);

  useEffect(()=>{
    const id=setInterval(()=>{
      setTickers(p=>genTickers(p));
      setCandles(p=>extendCandles(p));
      setAiConf(p=>clamp(p+rand(-3,3),42,98));
      setMoodVal(p=>clamp(p+rand(-2,2),15,95));
      setBlink(p=>!p);
      setSc(p=>({quality:clamp(p.quality+rand(-1.5,1.5),20,99),valuation:clamp(p.valuation+rand(-1.5,1.5),10,99),momentum:clamp(p.momentum+rand(-3,3),10,99)}));
      setHollyPicks(p=>p.map(pk=>({...pk,conf:clamp(pk.conf+rand(-2,2),40,98)})));
    },2200);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{setShadow(genShadow(candles,stock));},[candles,sym]);
  useEffect(()=>{const id=setInterval(()=>setNewsIdx(i=>(i+1)%NEWS.length),4500);return()=>clearInterval(id);},[]);

  const changeSym=useCallback(s=>{
    setSym(s);
    const st=STOCKS[s];
    if(st){setCandles(genCandles(st.base));setSc({quality:st.durability,valuation:st.valuation,momentum:st.momentum});}
  },[]);

  function execOrder(type){
    const price=selTick?.price??stock.base;
    const result=type==="BUY"?rand(-0.01,0.025):rand(-0.025,0.01);
    const tradePnl=+(price*qty*result).toFixed(2);
    setFlash(type);setTimeout(()=>setFlash(null),600);
    setPaperPnl(p=>+(p+tradePnl).toFixed(2));
    setOrderLog(p=>[{type,sym,qty,price,pnl:tradePnl,
      time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})},...p.slice(0,14)]);
  }

  function addWatch(){
    if(!newSym||!newQty)return;
    const tick=tickers.find(t=>t.sym===newSym.toUpperCase());
    if(!tick)return;
    setWatchlist(p=>[...p,{sym:tick.sym,qty:+newQty,buyPrice:tick.price,sector:STOCKS[tick.sym]?.sector??"Custom"}]);
    setNewSym("");setNewQty("");
  }

  const wlPL=watchlist.map(w=>{
    const tick=tickers.find(t=>t.sym===w.sym);
    const curr=tick?.price??w.buyPrice;
    return{...w,curr,pl:+((curr-w.buyPrice)*w.qty).toFixed(2),plPct:+(((curr-w.buyPrice)/w.buyPrice)*100).toFixed(2)};
  });

  const totalPnL=BACKTEST_DATA.reduce((a,b)=>a+b.pnl,0);
  const totalTrades=BACKTEST_DATA.reduce((a,b)=>a+b.trades,0);
  const totalWins=BACKTEST_DATA.reduce((a,b)=>a+b.wins,0);
  const winRate=((totalWins/totalTrades)*100).toFixed(1);
  const news=NEWS[newsIdx];

  const inp={background:T.panel,border:`1px solid ${T.border2}`,borderRadius:7,color:T.text,
    padding:"5px 10px",fontSize:10,outline:"none",fontFamily:"inherit"};

  const NAV=[
    {id:"dashboard",  Icon:LayoutDashboard, label:"Dashboard"},
    {id:"holly",      Icon:Zap,             label:"Holly AI"},
    {id:"insights",   Icon:Brain,           label:"Insights"},
    {id:"mf",         Icon:Landmark,        label:"Mutual Funds", badge:"NEW"},
    {id:"heatmap",     Icon:Map,             label:"Heatmap",      badge:"NEW"},
    {id:"options",    Icon:AreaChart,       label:"Option Chain", badge:"NEW"},
    {id:"advisory",   Icon:Newspaper,       label:"Advisory",     badge:"NEW"},
    {id:"screener",   Icon:ScanLine,        label:"Screener",     badge:"NEW"},
    {id:"brokerage",  Icon:Calculator,      label:"Brokerage",    badge:"NEW"},
    {id:"learn",      Icon:GraduationCap,   label:"Learn"},
    {id:"watchlist",  Icon:Eye,             label:"Watchlist"},
    {id:"backtesting",Icon:FlaskConical,    label:"Backtesting"},
    {id:"community",  Icon:Users,           label:"Community",    badge:"NEW"},
  ];

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return(
    <ThemeContext.Provider value={{isDark, toggleTheme}}>
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,
      fontFamily:"'JetBrains Mono','IBM Plex Mono','Courier New',monospace",
      display:"flex",flexDirection:"column",fontSize:12,
      transition:"background 0.3s ease, color 0.3s ease"}}>

      <TickerTape tickers={tickers}/>

      {/* HEADER */}
      <header style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"9px 20px",
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,#06b6d4,#6366f1)",borderRadius:10,
            display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px #6366f144"}}>
            <Cpu size={18} color="#fff" strokeWidth={2.5}/>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:900,color:T.text,letterSpacing:"0.04em"}}>
              MARKETMIND<span style={{color:T.cyan}}>·AI</span>
            </div>
            <div style={{fontSize:7.5,color:T.muted,letterSpacing:"0.2em"}}>PROFESSIONAL TRADING TERMINAL v7.0</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <ArcGauge value={Math.round(moodVal)} label="Mkt Mood" size={76}/>
          <div>
            <div style={{fontSize:11,fontWeight:900,color:moodVal>65?T.emerald:moodVal>40?T.amber:T.red}}>
              {moodVal>65?"BULLISH":moodVal>40?"NEUTRAL":"BEARISH"}
            </div>
            <div style={{fontSize:8,color:T.muted}}>NSE · BSE LIVE</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* ── KYC Status Badge ── */}
          <div style={{display:"flex",alignItems:"center",gap:5,background:
            kycStatus==="verified"?G.growwGreen+"18":kycStatus==="pending"?T.amber+"18":T.red+"18",
            border:`1px solid ${kycStatus==="verified"?G.growwGreen:kycStatus==="pending"?T.amber:T.red}44`,
            borderRadius:20,padding:"4px 10px",cursor:"pointer"}}
            onClick={()=>setKycStatus(s=>s==="verified"?"pending":s==="pending"?"none":"verified")}>
            <BadgeCheck size={12} color={kycStatus==="verified"?G.growwGreen:kycStatus==="pending"?T.amber:T.red}/>
            <span style={{fontSize:8.5,fontWeight:800,color:kycStatus==="verified"?G.growwGreen:kycStatus==="pending"?T.amber:T.red,letterSpacing:"0.05em"}}>
              KYC {kycStatus==="verified"?"VERIFIED":kycStatus==="pending"?"PENDING":"REQUIRED"}
            </span>
          </div>
          {/* ── Quick Invest Button ── */}
          <button onClick={()=>setNavTab("mf")} style={{
            background:`linear-gradient(135deg,${G.growwGreen},#00a87d)`,color:"#0a1628",
            border:"none",borderRadius:20,padding:"6px 16px",fontWeight:900,fontSize:10,
            cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,
            boxShadow:`0 4px 16px ${G.growwGreen}44`,letterSpacing:"0.04em",transition:"transform 0.15s"}}
            onMouseDown={e=>e.currentTarget.style.transform="scale(0.96)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
            <Sparkles size={11}/>INVEST
          </button>
          <div style={{background:paperPnl>=0?"#10b98118":"#ef444418",border:`1px solid ${paperPnl>=0?T.emerald:T.red}44`,
            borderRadius:8,padding:"5px 12px",textAlign:"center"}}>
            <div style={{fontSize:7.5,color:T.muted,letterSpacing:"0.1em"}}>PAPER P&L</div>
            <div style={{fontSize:13,fontWeight:900,color:paperPnl>=0?T.emerald:T.red}}>
              {paperPnl>=0?"+":""}₹{paperPnl.toLocaleString("en-IN",{maximumFractionDigits:0})}
            </div>
          </div>
          <div style={{background:T.emerald+"18",color:T.emerald,border:`1px solid ${T.emerald}30`,
            borderRadius:20,padding:"4px 12px",display:"flex",alignItems:"center",gap:6,fontSize:10}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:T.emerald,display:"inline-block",animation:"pulse 1.5s infinite"}}/>
            LIVE
          </div>
          <PriceAlertSystem tickers={tickers} defaultSym={sym} compact={true}/>
          {/* ── THEME TOGGLE ── */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              background: isDark ? "rgba(241,245,249,0.08)" : "rgba(15,23,42,0.07)",
              border: `1px solid ${isDark ? "rgba(241,245,249,0.15)" : "rgba(15,23,42,0.15)"}`,
              borderRadius: 20, padding: "5px 11px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              position: "relative", overflow: "hidden",
            }}
            onMouseEnter={e=>{e.currentTarget.style.background=isDark?"rgba(241,245,249,0.14)":"rgba(15,23,42,0.12)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=isDark?"rgba(241,245,249,0.08)":"rgba(15,23,42,0.07)";}}
          >
            {/* Track */}
            <div style={{
              width: 32, height: 16, borderRadius: 8, position: "relative",
              background: isDark
                ? "linear-gradient(135deg,#1e3a5f,#0f172a)"
                : "linear-gradient(135deg,#fde68a,#fbbf24)",
              border: `1px solid ${isDark?"#334155":"#f59e0b"}`,
              transition: "background 0.3s ease",
              flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: 2,
                left: isDark ? 2 : 16,
                width: 10, height: 10, borderRadius: "50%",
                background: isDark ? "#94a3b8" : "#ffffff",
                boxShadow: isDark ? "none" : "0 0 6px #fbbf2499",
                transition: "left 0.25s cubic-bezier(0.4,0,0.2,1), background 0.25s",
              }}/>
            </div>
            {/* Icon */}
            <span style={{
              fontSize: 12,
              filter: isDark ? "grayscale(0.3)" : "none",
              transition: "all 0.3s",
              lineHeight: 1,
            }}>
              {isDark ? "🌙" : "☀️"}
            </span>
            <span style={{
              fontSize: 8, fontWeight: 800,
              color: isDark ? "#94a3b8" : "#92400e",
              letterSpacing: "0.06em",
              fontFamily:"inherit",
            }}>
              {isDark ? "DARK" : "LIGHT"}
            </span>
          </button>
          <Settings size={15} color={T.muted} style={{cursor:"pointer"}}/>
        </div>
      </header>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* SIDEBAR */}
        <aside style={{width:158,background:T.surface,borderRight:`1px solid ${T.border}`,padding:"12px 8px",
          display:"flex",flexDirection:"column",gap:2,flexShrink:0,overflowY:"auto"}}>

          <div style={{fontSize:7,color:T.muted,fontWeight:900,letterSpacing:"0.18em",
            textTransform:"uppercase",padding:"0 6px",marginBottom:4}}>NAVIGATION</div>

          {NAV.map(({id,Icon,label,badge})=>{
            const active=navTab===id;
            return(
              <button key={id} onClick={()=>setNavTab(id)} style={{
                padding:"9px 10px",borderRadius:9,fontSize:9.5,fontWeight:700,cursor:"pointer",
                textAlign:"left",display:"flex",alignItems:"center",gap:7,fontFamily:"inherit",
                background:active?"linear-gradient(135deg,#06b6d420,#6366f128)":"transparent",
                color:active?T.cyan:T.muted,
                border:active?`1px solid ${T.cyan}30`:"1px solid transparent",
                width:"100%",transition:"all 0.15s"
              }}>
                <Icon size={13} strokeWidth={active?2.5:2}/>
                <span style={{flex:1}}>{label}</span>
                {badge&&<span style={{fontSize:7,fontWeight:900,background:G.growwGreen+"33",
                  color:G.growwGreen,border:`1px solid ${G.growwGreen}55`,borderRadius:4,
                  padding:"1px 4px",letterSpacing:"0.04em"}}>{badge}</span>}
                {active&&!badge&&<ChevronRight size={10} style={{marginLeft:"auto"}}/>}
              </button>
            );
          })}

          {/* Risk mode */}
          <div style={{marginTop:12,borderTop:`1px solid ${T.border}`,paddingTop:12}}>
            <div style={{fontSize:7.5,color:T.muted,fontWeight:800,letterSpacing:"0.12em",marginBottom:7,
              display:"flex",alignItems:"center",gap:5}}>
              <SlidersHorizontal size={10}/> RISK MODE
            </div>
            {["conservative","aggressive"].map(mode=>(
              <button key={mode} onClick={()=>setRiskMode(mode)} style={{
                width:"100%",padding:"6px 8px",borderRadius:7,marginBottom:3,fontSize:9,fontWeight:800,
                cursor:"pointer",textAlign:"left",fontFamily:"inherit",letterSpacing:"0.04em",
                background:riskMode===mode?(mode==="aggressive"?T.red+"22":T.emerald+"22"):"transparent",
                color:riskMode===mode?(mode==="aggressive"?T.red:T.emerald):T.muted,
                border:riskMode===mode?`1px solid ${mode==="aggressive"?T.red:T.emerald}44`:"1px solid transparent",
                display:"flex",alignItems:"center",gap:6
              }}>
                {mode==="aggressive"?<Flame size={11}/>:<Shield size={11}/>}
                {mode.charAt(0).toUpperCase()+mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Kite Connect API Status (Zerodha Inspired) */}
          <div style={{marginTop:10,borderTop:`1px solid ${T.border}`,paddingTop:10}}>
            <div style={{fontSize:7.5,color:T.muted,fontWeight:800,letterSpacing:"0.12em",marginBottom:6,
              display:"flex",alignItems:"center",gap:5}}>
              <Link2 size={10}/> KITE CONNECT API
            </div>
            <div onClick={()=>setKiteStatus(s=>s==="connected"?"disconnected":"connected")}
              style={{background:kiteStatus==="connected"?T.emerald+"12":T.red+"12",
                border:`1px solid ${kiteStatus==="connected"?T.emerald:T.red}44`,
                borderRadius:7,padding:"6px 8px",cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:8,fontWeight:800,color:kiteStatus==="connected"?T.emerald:T.red,letterSpacing:"0.06em"}}>
                  {kiteStatus==="connected"?"● CONNECTED":"○ DISCONNECTED"}
                </span>
                {kiteStatus==="connected"?<Wifi size={10} color={T.emerald}/>:<WifiOff size={10} color={T.red}/>}
              </div>
              <div style={{fontSize:7,color:T.muted}}>v3.0 · Tap to toggle</div>
            </div>

            {/* Varsity Learning Card */}
            <div style={{marginTop:8,background:"linear-gradient(135deg,#1a1f35,#1c2438)",
              border:`1px solid ${T.indigo}33`,borderRadius:7,padding:"8px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                <BookMarked size={11} color={T.indigo}/>
                <span style={{fontSize:8,fontWeight:900,color:T.indigo,letterSpacing:"0.06em"}}>VARSITY</span>
              </div>
              <div style={{fontSize:7.5,color:T.sub,lineHeight:1.5,marginBottom:5}}>
                Free trading courses by Zerodha. 14 modules · 500+ chapters
              </div>
              <button onClick={()=>setNavTab("learn")} style={{
                width:"100%",background:T.indigo+"22",color:T.indigo,
                border:`1px solid ${T.indigo}44`,borderRadius:5,
                padding:"4px 0",fontWeight:800,fontSize:7.5,cursor:"pointer",fontFamily:"inherit"}}>
                Open Learning Hub →
              </button>
            </div>
          </div>

          {/* Learn Quick Card */}
          <div style={{marginTop:10,borderTop:`1px solid ${T.border}`,paddingTop:10}}>
            <div style={{fontSize:7.5,color:T.muted,fontWeight:800,letterSpacing:"0.12em",marginBottom:7,
              display:"flex",alignItems:"center",gap:5}}>
              <GraduationCap size={10}/> LEARN
            </div>
            {[
              {label:"Stock Market Basics", tab:"learn"},
              {label:"How to Invest in MF", tab:"learn"},
              {label:"SIP Planner",          tab:"mf"},
            ].map((item,i)=>(
              <button key={i} onClick={()=>{setNavTab(item.tab);if(item.tab==="learn")setLearnOpen(i);}}
                style={{width:"100%",padding:"5px 7px",borderRadius:6,marginBottom:2,fontSize:8.5,
                  fontWeight:600,cursor:"pointer",textAlign:"left",fontFamily:"inherit",
                  background:"transparent",color:T.sub,border:"none",display:"flex",
                  alignItems:"center",gap:5,transition:"color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.color=T.indigo}
                onMouseLeave={e=>e.currentTarget.style.color=T.sub}>
                <ChevronRight size={9} color={T.indigo}/>{item.label}
              </button>
            ))}
          </div>

          {/* Active SIPs summary */}
          {Object.keys(sipActive).length>0&&(
            <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10,marginTop:4}}>
              <div style={{fontSize:7.5,color:G.growwGreen,fontWeight:800,letterSpacing:"0.12em",marginBottom:6,
                display:"flex",alignItems:"center",gap:5}}>
                <Repeat size={9}/> ACTIVE SIPs
              </div>
              {Object.entries(sipActive).slice(0,3).map(([name,amt],i)=>(
                <div key={i} style={{background:G.growwGreen+"0d",border:`1px solid ${G.growwGreen}22`,
                  borderRadius:5,padding:"4px 7px",marginBottom:3,fontSize:8}}>
                  <div style={{color:T.text,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",
                    textOverflow:"ellipsis"}}>{name.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{color:G.growwGreen,fontWeight:900}}>₹{amt}/mo</div>
                </div>
              ))}
            </div>
          )}

          {/* Order Log */}
          <div style={{marginTop:"auto",borderTop:`1px solid ${T.border}`,paddingTop:10}}>
            <div style={{fontSize:8,color:T.muted,fontWeight:700,letterSpacing:"0.1em",marginBottom:5}}>RECENT ORDERS</div>
            <div style={{maxHeight:120,overflowY:"auto"}}>
              {orderLog.length===0&&<div style={{fontSize:8,color:T.dim}}>No orders placed</div>}
              {orderLog.slice(0,5).map((o,i)=>(
                <div key={i} style={{background:o.type==="BUY"?"#10b98114":"#ef444414",
                  border:`1px solid ${o.type==="BUY"?T.emerald:T.red}28`,
                  borderRadius:6,padding:"4px 7px",marginBottom:3,fontSize:8}}>
                  <span style={{color:o.type==="BUY"?T.emerald:T.red,fontWeight:900}}>{o.type}</span> {o.sym}×{o.qty}<br/>
                  <span style={{color:T.muted}}>₹{o.price?.toFixed(0)} · </span>
                  <span style={{color:o.pnl>=0?T.emerald:T.red,fontWeight:700}}>{o.pnl>=0?"+":""}₹{o.pnl?.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{flex:1,overflowY:"auto",padding:14}}>

          {/* ══ DASHBOARD ══ */}
          {navTab==="dashboard"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 300px",gap:12,alignContent:"start"}}>

              {/* LEFT */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {/* Symbol selector */}
                <Card>
                  {/* ── Asset Type Pills ── */}
                  <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
                    {[
                      {id:"stocks",     label:"Stocks",       Icon:BarChart,  color:T.cyan},
                      {id:"etf",        label:"ETFs",          Icon:Layers,    color:G.etfPurple},
                      {id:"gold",       label:"Digital Gold",  Icon:Coins,     color:G.goldYellow},
                      {id:"commodities",label:"Commodities",   Icon:Wheat,     color:T.orange},
                      {id:"currency",   label:"Currency",      Icon:Globe,     color:T.sky},
                    ].map(({id,label,Icon:Ico,color})=>(
                      <button key={id} onClick={()=>setAssetTab(id)} style={{
                        display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,
                        fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"inherit",
                        background:assetTab===id?color+"25":"transparent",
                        color:assetTab===id?color:T.muted,
                        border:`1px solid ${assetTab===id?color+"66":T.border}`,
                        transition:"all 0.15s"
                      }}>
                        <Ico size={10} strokeWidth={2.5}/>{label}
                      </button>
                    ))}
                  </div>

                  {/* ── Stocks sub-view ── */}
                  {assetTab==="stocks"&&(
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:9}}>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {Object.keys(STOCKS).map(s=>{
                          const active=sym===s;
                          return(
                            <button key={s} onClick={()=>changeSym(s)} style={{
                              padding:"4px 10px",borderRadius:7,fontSize:9,fontWeight:800,cursor:"pointer",
                              background:active?"linear-gradient(135deg,#06b6d4,#6366f1)":T.border,
                              color:active?"#060c18":T.muted,border:"none",fontFamily:"inherit",transition:"all 0.15s"
                            }}>{s}</button>
                          );
                        })}
                      </div>
                      {selTick&&(
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:22,fontWeight:900,color:T.text}}>₹{fmtINR(selTick.price)}</div>
                          <div style={{fontSize:10,fontWeight:700,color:selTick.change>=0?T.emerald:T.red,display:"flex",alignItems:"center",gap:2,justifyContent:"flex-end"}}>
                            {selTick.change>=0?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>}
                            {Math.abs(selTick.change).toFixed(2)}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── ETF sub-view ── */}
                  {assetTab==="etf"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {ETF_DATA.map((e,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                          background:T.panel,borderRadius:7,padding:"7px 10px",border:`1px solid ${T.border}`}}>
                          <div>
                            <div style={{fontSize:9.5,fontWeight:800,color:T.text}}>{e.name}</div>
                            <div style={{fontSize:8,color:T.muted,marginTop:1}}>Tracks: {e.tracking} · Exp: {e.expense} · AUM: {e.aum}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:12,fontWeight:900,color:T.text}}>₹{e.price}</div>
                            <div style={{fontSize:9,color:e.change>=0?T.emerald:T.red,fontWeight:700}}>
                              {e.change>=0?"+":""}{e.change}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Digital Gold sub-view ── */}
                  {assetTab==="gold"&&(
                    <div style={{background:`linear-gradient(135deg,${G.goldYellow}12,${G.goldYellow}06)`,
                      border:`1px solid ${G.goldYellow}33`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <div>
                          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>DIGITAL GOLD · {DIGITAL_GOLD.purity}</div>
                          <div style={{fontSize:22,fontWeight:900,color:G.goldYellow}}>₹{fmtINR(DIGITAL_GOLD.price)}<span style={{fontSize:10,color:T.muted}}>/gm</span></div>
                          <div style={{fontSize:9,color:T.emerald,fontWeight:700,marginTop:2}}>
                            +₹{DIGITAL_GOLD.changeAmt} (+{DIGITAL_GOLD.change}%) today
                          </div>
                        </div>
                        <div style={{fontSize:32}}>🥇</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <button onClick={()=>setGoldGrams(g=>Math.max(0.1,+(g-0.1).toFixed(1)))}
                          style={{width:26,height:26,background:T.panel,border:`1px solid ${T.border2}`,
                          color:T.text,borderRadius:7,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>−</button>
                        <div style={{flex:1,background:T.panel,border:`1px solid ${G.goldYellow}44`,borderRadius:7,
                          padding:"5px 10px",textAlign:"center"}}>
                          <span style={{fontSize:11,fontWeight:900,color:G.goldYellow}}>{goldGrams} gm</span>
                          <span style={{fontSize:9,color:T.muted,marginLeft:6}}>≈ ₹{(DIGITAL_GOLD.price*goldGrams).toFixed(0)}</span>
                        </div>
                        <button onClick={()=>setGoldGrams(g=>+(g+0.1).toFixed(1))}
                          style={{width:26,height:26,background:T.panel,border:`1px solid ${T.border2}`,
                          color:T.text,borderRadius:7,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>+</button>
                      </div>
                      <button style={{width:"100%",background:`linear-gradient(135deg,${G.goldYellow},#e8a800)`,
                        color:"#1a1000",border:"none",borderRadius:9,padding:"9px 0",fontWeight:900,
                        fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",
                        justifyContent:"center",gap:6}}>
                        <Coins size={13}/>Buy {goldGrams}gm Gold · ₹{(DIGITAL_GOLD.price*goldGrams).toFixed(0)}
                      </button>
                      <div style={{fontSize:7.5,color:T.muted,textAlign:"center",marginTop:6}}>
                        Stored in MMTC-PAMP vaults · 24K 99.9% purity · SEBI regulated
                      </div>
                    </div>
                  )}

                  {/* DVM badges — only for stocks tab */}
                  {assetTab==="stocks"&&(
                    <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:900,color:T.cyan}}>{sym}</span>
                      <Badge color={T.muted}>{stock.sector}</Badge>
                      <Badge color={T.violet}>β {stock.beta}</Badge>
                      {stock.dvm.map((d,i)=>{
                        const c=i===0?(d==="High"?T.emerald:d==="Medium"?T.amber:T.red):i===1?(d==="Cheap"?T.emerald:d==="Fair"?T.amber:T.red):(d==="Bullish"?T.emerald:d==="Neutral"?T.amber:T.red);
                        return <Badge key={i} color={c}>{d}</Badge>;
                      })}
                    </div>
                  )}
                </Card>

                {/* TradingView-Style Chart */}
                <div style={{background:TV.bg,border:`1px solid ${TV.border}`,borderRadius:12,overflow:"hidden"}}>
                  <div style={{padding:"10px 14px",borderBottom:`1px solid ${TV.border}`,
                    display:"flex",alignItems:"center",justifyContent:"space-between",background:TV.bg}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Activity size={13} color={TV.bullGlow}/>
                      <span style={{fontSize:11,fontWeight:900,color:TV.text,fontFamily:"monospace",letterSpacing:"0.04em"}}>
                        {sym}
                      </span>
                      <span style={{fontSize:9,color:selTick?.change>=0?"#26a69a":"#ef5350",fontWeight:700,fontFamily:"monospace"}}>
                        ₹{(selTick?.price??stock.base).toFixed(2)}
                        {" "}{selTick?.change>=0?"+":""}{selTick?.change?.toFixed(2)}%
                      </span>
                    </div>
                    <div style={{display:"flex",gap:10,fontSize:8,fontFamily:"monospace",color:TV.muted}}>
                      <span>CANDLES · VOL · RSI14 · SMA9/20 · AI PRED</span>
                      {kiteStatus==="connected"&&
                        <span style={{color:"#26a69a",display:"flex",alignItems:"center",gap:3}}>
                          <Wifi size={9}/>KITE
                        </span>}
                    </div>
                  </div>
                  <ShadowChart candles={candles} shadow={shadow} isDark={isDark}/>
                  {/* Order-from-Chart UI (Zerodha Kite Inspired) */}
                  <div style={{display:"flex",gap:6,padding:"8px 10px",
                    borderTop:`1px solid ${TV.border}`,background:TV.bg,
                    alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:7.5,color:TV.muted,fontWeight:800,letterSpacing:"0.08em",flexShrink:0,fontFamily:"monospace"}}>ORDER FROM CHART:</span>
                    <span style={{fontSize:8,color:TV.muted,flex:1,fontFamily:"monospace"}}>
                      ₹{(selTick?.price??stock.base).toFixed(0)}
                    </span>
                    {[{l:"BUY @ MKT",c:"#26a69a",bg:"#26a69a"},{l:"SELL @ MKT",c:"#ef5350",bg:"#ef5350"},{l:"SET LIMIT",c:"#f59e0b",bg:"#f59e0b"}].map((b,i)=>(
                      <button key={i} onClick={()=>{
                        if(b.l.includes("BUY"))execOrder("BUY");
                        else if(b.l.includes("SELL"))execOrder("SELL");
                        else setChartOrder({type:"LIMIT",price:selTick?.price??stock.base});
                      }} style={{
                        background:b.bg+"20",color:b.c,border:`1px solid ${b.bg}55`,
                        borderRadius:5,padding:"4px 10px",fontSize:8,fontWeight:800,
                        cursor:"pointer",fontFamily:"monospace"}}>
                        {b.l}
                      </button>
                    ))}
                  </div>
                  {/* Indicator pills */}
                  <div style={{display:"flex",gap:8,padding:"6px 10px 8px",background:TV.bg,flexWrap:"wrap"}}>
                    {[
                      {l:"RSI",v:stock.rsi,c:stock.rsi>70?"#ef5350":stock.rsi<30?"#26a69a":"#f59e0b"},
                      {l:"MACD",v:stock.macd>0?`+${stock.macd}`:stock.macd,c:stock.macd>0?"#26a69a":"#ef5350"},
                      {l:"SMA20",v:`₹${stock.sma20}`,c:"#f59e0b"},
                      {l:"SMA50",v:`₹${stock.sma50}`,c:"#22d3ee"},
                    ].map((t,i)=>(
                      <div key={i} style={{background:TV.grid,borderRadius:5,padding:"4px 8px",border:`1px solid ${TV.border}`}}>
                        <div style={{fontSize:7,color:TV.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"monospace"}}>{t.l}</div>
                        <div style={{fontSize:10,fontWeight:800,color:t.c,marginTop:1,fontFamily:"monospace"}}>{t.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Execution */}
                <Card style={{border:flash==="BUY"?`2px solid ${T.emerald}`:flash==="SELL"?`2px solid ${T.red}`:`1px solid ${T.border}`,
                  background:flash==="BUY"?"#10b98110":flash==="SELL"?"#ef444410":T.card,transition:"all 0.3s"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
                    <SH icon={DollarSign} title="Paper Trade Execution" right={null}/>
                    {/* Upstox High-Speed Execution Badge */}
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,background:"linear-gradient(135deg,#f97316,#ef4444)",
                        borderRadius:6,padding:"3px 8px",boxShadow:"0 2px 8px #f9731644"}}>
                        <Bolt size={9} color="#fff"/>
                        <span style={{fontSize:7.5,fontWeight:900,color:"#fff",letterSpacing:"0.06em"}}>HIGH-SPEED</span>
                      </div>
                      <div style={{fontSize:7,color:T.muted,display:"flex",alignItems:"center",gap:3}}>
                        <span style={{width:5,height:5,borderRadius:"50%",background:T.emerald,display:"inline-block",animation:"pulse 1.5s infinite"}}/>
                        Co-location · &lt;1ms
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                    <div>
                      <div style={{fontSize:8,color:T.muted,marginBottom:5,letterSpacing:"0.1em",textTransform:"uppercase"}}>Quantity</div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:26,height:26,background:T.panel,border:`1px solid ${T.border2}`,color:T.text,borderRadius:7,cursor:"pointer",fontSize:16,fontFamily:"inherit"}}>−</button>
                        <input type="number" value={qty} onChange={e=>setQty(+e.target.value)} style={{...inp,width:62,textAlign:"center",fontWeight:900,fontSize:13}}/>
                        <button onClick={()=>setQty(q=>q+1)} style={{width:26,height:26,background:T.panel,border:`1px solid ${T.border2}`,color:T.text,borderRadius:7,cursor:"pointer",fontSize:16,fontFamily:"inherit"}}>+</button>
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:8,color:T.muted,marginBottom:5,letterSpacing:"0.1em",textTransform:"uppercase"}}>Est. Value</div>
                      <div style={{fontSize:16,fontWeight:900,color:T.cyan}}>₹{((selTick?.price??0)*qty).toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
                    </div>
                    <div style={{display:"flex",gap:10,marginLeft:"auto"}}>
                      <button onClick={()=>execOrder("BUY")} style={{
                        background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff",border:"none",
                        padding:"12px 28px",borderRadius:10,fontWeight:900,fontSize:14,cursor:"pointer",
                        boxShadow:"0 4px 20px #10b98133",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}
                        onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
                        onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
                        <TrendingUp size={15}/>BUY
                      </button>
                      <button onClick={()=>execOrder("SELL")} style={{
                        background:"linear-gradient(135deg,#b91c1c,#ef4444)",color:"#fff",border:"none",
                        padding:"12px 28px",borderRadius:10,fontWeight:900,fontSize:14,cursor:"pointer",
                        boxShadow:"0 4px 20px #ef444433",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}
                        onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
                        onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
                        <TrendingDown size={15}/>SELL
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* MIDDLE */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Card>
                  <SH icon={Brain} title="AI Confidence"/>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <ArcGauge value={Math.round(aiConf)} label={aiConf>60?"BUY":"SELL"} size={92}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:26,fontWeight:900,color:aiConf>60?T.emerald:T.red,opacity:blink?1:0.6,transition:"opacity 0.5s"}}>{Math.round(aiConf)}%</div>
                      <div style={{fontSize:12,fontWeight:800,color:aiConf>75?T.emerald:aiConf>60?T.teal:aiConf>45?T.amber:T.red,marginBottom:8}}>
                        {aiConf>75?"STRONG BUY":aiConf>60?"BUY":aiConf>45?"NEUTRAL":"STRONG SELL"}
                      </div>
                      <div style={{fontSize:8,color:T.muted,marginBottom:5}}>Model: MarketMind DL v4.1</div>
                      <MiniBar value={aiConf} color={aiConf>60?T.emerald:T.red} height={6}/>
                    </div>
                  </div>
                </Card>

                <Card>
                  <SH icon={BarChart2} title="Feature Importance"/>
                  <FeatureChart data={stock.featureImportance}/>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                    {Object.entries({RSI:T.cyan,Sentiment:T.violet,SMA:T.emerald,MACD:T.amber,Volume:T.sky}).map(([k,c])=>(
                      <span key={k} style={{fontSize:8,display:"flex",alignItems:"center",gap:3}}>
                        <span style={{width:8,height:8,borderRadius:2,background:c,display:"inline-block"}}/>
                        <span style={{color:T.sub}}>{k}</span>
                      </span>
                    ))}
                  </div>
                </Card>

                <Card>
                  <SH icon={BookOpen} title="Live Sentiment"/>
                  <div style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
                    <div style={{fontSize:28}}>{news.mood==="bullish"?"🚀":news.mood==="bearish"?"⚠️":"😐"}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,fontWeight:800,color:news.mood==="bullish"?T.emerald:news.mood==="bearish"?T.red:T.amber,marginBottom:3}}>
                        {news.mood.toUpperCase()}
                      </div>
                      <div style={{fontSize:8.5,color:T.sub,lineHeight:1.5}}>{news.text}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <MiniBar value={news.score} color={news.score>60?T.emerald:news.score>40?T.amber:T.red}/>
                    <span style={{fontSize:9,fontWeight:800,flexShrink:0}}>{news.score}/100</span>
                  </div>
                  <div style={{display:"flex",gap:3,marginTop:7}}>
                    {NEWS.map((_,i)=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:i===newsIdx?T.cyan:T.border2,transition:"background 0.4s"}}/>)}
                  </div>
                </Card>

                <Card style={{flex:1}}>
                  <SH icon={PieChart} title="Key Metrics"/>
                  {[
                    {k:"Market Cap",v:stock.mcap},{k:"P/E Ratio",v:`${stock.pe}x`,alert:stock.pe>30},
                    {k:"P/B Ratio",v:`${stock.pb}x`},{k:"EPS (TTM)",v:`₹${stock.eps}`},
                    {k:"Div Yield",v:`${stock.divYield.toFixed(2)}%`},
                    {k:"Pledged",v:`${stock.pledged.toFixed(1)}%`,alert:stock.pledged>5},
                    {k:"D/E Ratio",v:`${stock.dte.toFixed(1)}x`,alert:stock.dte>5},
                    {k:"52W High",v:`₹${(stock.base*1.18).toFixed(0)}`},
                    {k:"52W Low",v:`₹${(stock.base*0.78).toFixed(0)}`},
                  ].map((row,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.border}`,fontSize:9}}>
                      <span style={{color:T.sub}}>{row.k}</span>
                      <span style={{fontWeight:700,color:row.alert?T.amber:T.text,display:"flex",alignItems:"center",gap:3}}>
                        {row.alert&&<AlertTriangle size={9} color={T.amber}/>}{row.v}
                      </span>
                    </div>
                  ))}
                </Card>
              </div>

              {/* RIGHT */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <DVMScorecard stock={stock} sc={sc}/>

                <Card>
                  <SH icon={Search} title={`SWOT — ${sym}`}/>
                  {[{k:"S",l:"Strengths",c:T.emerald,items:stock.swot.S},{k:"W",l:"Weaknesses",c:T.red,items:stock.swot.W},{k:"O",l:"Opportunities",c:T.indigo,items:stock.swot.O},{k:"T",l:"Threats",c:T.amber,items:stock.swot.T}].map(s=>(
                    <div key={s.k} style={{marginBottom:7}}>
                      <div style={{fontSize:8,fontWeight:900,color:s.c,letterSpacing:"0.1em",marginBottom:3,
                        textTransform:"uppercase",display:"flex",alignItems:"center",gap:4}}>
                        <span style={{width:8,height:8,borderRadius:2,background:s.c,display:"inline-block"}}/>
                        {s.l}
                      </div>
                      {s.items.map((item,i)=>(
                        <div key={i} style={{fontSize:8,color:T.sub,marginBottom:2,paddingLeft:10,lineHeight:1.4,display:"flex",gap:4}}>
                          <span style={{color:s.c}}>›</span>{item}
                        </div>
                      ))}
                    </div>
                  ))}
                </Card>

                <ForensicPanel stock={stock}/>
              </div>
            </div>
          )}

          {/* ══ HOLLY AI ══ */}
          {navTab==="holly"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <Card style={{background:"linear-gradient(135deg,#1a1f35,#1c2438)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:44,height:44,background:"linear-gradient(135deg,#f59e0b,#ef4444)",
                      borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 24px #f59e0b44"}}>
                      <Zap size={22} color="#fff" strokeWidth={2.5}/>
                    </div>
                    <div>
                      <div style={{fontSize:16,fontWeight:900,color:T.text}}>Holly AI — Daily Alpha Picks</div>
                      <div style={{fontSize:9,color:T.sub}}>AI-generated trade ideas · Updated every session · {riskMode.toUpperCase()} mode active</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:8,color:T.muted}}>RISK MODE:</span>
                    {["conservative","aggressive"].map(m=>(
                      <button key={m} onClick={()=>setRiskMode(m)} style={{
                        padding:"6px 14px",borderRadius:8,fontSize:9,fontWeight:800,cursor:"pointer",
                        fontFamily:"inherit",transition:"all 0.15s",letterSpacing:"0.04em",
                        background:riskMode===m?(m==="aggressive"?"linear-gradient(135deg,#b91c1c,#ef4444)":"linear-gradient(135deg,#059669,#10b981)"):"transparent",
                        color:riskMode===m?"#fff":(m==="aggressive"?T.red:T.emerald),
                        border:`1px solid ${m==="aggressive"?T.red:T.emerald}${riskMode===m?"":"44"}`,
                        display:"flex",alignItems:"center",gap:5
                      }}>
                        {m==="aggressive"?<Flame size={11}/>:<Shield size={11}/>}
                        {m.charAt(0).toUpperCase()+m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginTop:14}}>
                  {[
                    {l:"Total Picks",v:hollyPicks.length,c:T.text},
                    {l:"Buy Signals",v:hollyPicks.filter(p=>p.dir==="BUY").length,c:T.emerald},
                    {l:"Sell Signals",v:hollyPicks.filter(p=>p.dir==="SELL").length,c:T.red},
                    {l:"Avg AI Odds",v:`${(hollyPicks.reduce((s,p)=>s+p.conf,0)/hollyPicks.length).toFixed(0)}%`,c:T.amber},
                    {l:"Mode Adj.",v:riskMode==="aggressive"?"+8%":"-8%",c:riskMode==="aggressive"?T.orange:T.teal},
                  ].map((s,i)=>(
                    <div key={i} style={{background:"#ffffff08",border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",textAlign:"center"}}>
                      <div style={{fontSize:7,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                      <div style={{fontSize:16,fontWeight:900,color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {hollyPicks.map((pick,i)=>(
                  <HollyCard key={i} pick={pick} riskMode={riskMode} tickers={tickers}
                    onSelect={s=>{changeSym(s);setNavTab("dashboard");}}/>
                ))}
              </div>

              <div style={{background:T.amber+"0d",border:`1px solid ${T.amber}22`,borderRadius:8,padding:"10px 14px",
                display:"flex",gap:8,alignItems:"flex-start"}}>
                <AlertTriangle size={14} color={T.amber} style={{marginTop:1,flexShrink:0}}/>
                <div style={{fontSize:8.5,color:T.sub,lineHeight:1.6}}>
                  <strong style={{color:T.amber}}>PAPER TRADING DISCLAIMER: </strong>
                  Holly AI picks are AI-generated signals for educational purposes only. Not SEBI registered investment advice. Past performance does not guarantee future returns. Always conduct independent due diligence. This is not financial advice.
                </div>
              </div>
            </div>
          )}

          {/* ══ INSIGHTS ══ */}
          {navTab==="insights"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <Card>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {Object.keys(STOCKS).map(s=>{
                      const active=sym===s;
                      return(
                        <button key={s} onClick={()=>changeSym(s)} style={{
                          padding:"4px 10px",borderRadius:7,fontSize:9,fontWeight:800,cursor:"pointer",
                          background:active?"linear-gradient(135deg,#06b6d4,#6366f1)":T.border,
                          color:active?"#060c18":T.muted,border:"none",fontFamily:"inherit",transition:"all 0.15s"
                        }}>{s}</button>
                      );
                    })}
                  </div>
                  {selTick&&(
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:14,fontWeight:900,color:T.text}}>₹{fmtINR(selTick.price)}</span>
                      <span style={{fontSize:10,fontWeight:700,color:selTick.change>=0?T.emerald:T.red}}>
                        {selTick.change>=0?"▲":"▼"} {Math.abs(selTick.change).toFixed(2)}%
                      </span>
                      <Badge color={T.muted}>{stock.sector}</Badge>
                    </div>
                  )}
                </div>
              </Card>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <DVMScorecard stock={stock} sc={sc}/>
                <ForensicPanel stock={stock}/>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <ProsCons stock={stock}/>
                <PeerTable sym={sym} stock={stock}/>
              </div>

              <Card>
                <SH icon={BarChart2} title="3-Year Financial Performance"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <div style={{fontSize:8,color:T.muted,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Profit Growth % (CAGR)</div>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={[{y:"FY22",v:stock.profitCAGR[0]},{y:"FY23",v:stock.profitCAGR[1]},{y:"FY24",v:stock.profitCAGR[2]}]}
                        margin={{top:0,right:4,bottom:0,left:0}}>
                        <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
                        <XAxis dataKey="y" tick={{fontSize:8,fill:T.muted}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize:8,fill:T.muted}} axisLine={false} tickLine={false} width={28} tickFormatter={v=>`${v}%`}/>
                        <Tooltip formatter={v=>[`${v.toFixed(1)}%`,"Profit Growth"]} contentStyle={{background:T.panel,border:`1px solid ${T.border2}`,borderRadius:6,fontSize:8}}/>
                        <Bar dataKey="v" radius={[3,3,0,0]}>
                          {[0,1,2].map(i=><Cell key={i} fill={stock.profitCAGR[i]>20?T.emerald:stock.profitCAGR[i]>10?T.amber:T.red}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <div style={{fontSize:8,color:T.muted,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Return on Equity %</div>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={[{y:"FY22",v:stock.roe[0]},{y:"FY23",v:stock.roe[1]},{y:"FY24",v:stock.roe[2]}]}
                        margin={{top:0,right:4,bottom:0,left:0}}>
                        <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
                        <XAxis dataKey="y" tick={{fontSize:8,fill:T.muted}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize:8,fill:T.muted}} axisLine={false} tickLine={false} width={28} tickFormatter={v=>`${v}%`}/>
                        <Tooltip formatter={v=>[`${v.toFixed(1)}%`,"ROE"]} contentStyle={{background:T.panel,border:`1px solid ${T.border2}`,borderRadius:6,fontSize:8}}/>
                        <Bar dataKey="v" radius={[3,3,0,0]}>
                          {[0,1,2].map(i=><Cell key={i} fill={stock.roe[i]>20?T.emerald:stock.roe[i]>12?T.indigo:T.amber}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:12}}>
                  {[
                    {l:"3Y Profit CAGR",v:`${stock.profitCAGR[2].toFixed(1)}%`,c:stock.profitCAGR[2]>20?T.emerald:stock.profitCAGR[2]>10?T.amber:T.red},
                    {l:"Latest ROE",v:`${stock.roe[2].toFixed(1)}%`,c:stock.roe[2]>20?T.emerald:stock.roe[2]>12?T.indigo:T.amber},
                    {l:"EPS (TTM)",v:`₹${stock.eps}`,c:T.cyan},
                  ].map((s,i)=>(
                    <div key={i} style={{background:T.panel,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                      <div style={{fontSize:7,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                      <div style={{fontSize:20,fontWeight:900,color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ WATCHLIST ══ */}
          {navTab==="watchlist"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <Card>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
                  <SH icon={Eye} title="Watchlist & Portfolio" right={null}/>
                  <div style={{display:"flex",gap:6}}>
                    <input value={newSym} onChange={e=>setNewSym(e.target.value.toUpperCase())} placeholder="SYMBOL" style={{...inp,width:85}}/>
                    <input value={newQty} onChange={e=>setNewQty(e.target.value)} placeholder="QTY" type="number" style={{...inp,width:65}}/>
                    <button onClick={addWatch} style={{background:T.cyan,color:"#060c18",border:"none",borderRadius:8,
                      padding:"5px 16px",fontWeight:900,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>+ Add</button>
                  </div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>{["Symbol","Sector","Qty","Buy Avg","LTP","P&L ₹","P&L %","Action"].map(h=>(
                      <th key={h} style={{fontSize:8,color:T.muted,fontWeight:800,letterSpacing:"0.08em",
                        paddingBottom:7,textTransform:"uppercase",textAlign:h==="Symbol"||h==="Sector"?"left":"right",
                        borderBottom:`1px solid ${T.border}`}}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {wlPL.map((w,i)=>(
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background=T.panel}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                        style={{transition:"background 0.15s"}}>
                        <td style={{padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:9}}>
                          <button onClick={()=>{changeSym(w.sym);setNavTab("dashboard");}}
                            style={{background:"none",border:"none",color:T.cyan,fontWeight:900,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{w.sym}</button>
                        </td>
                        <td style={{padding:"7px 8px",borderBottom:`1px solid ${T.border}`,fontSize:9,color:T.sub}}>{w.sector}</td>
                        <td style={{padding:"7px 8px",borderBottom:`1px solid ${T.border}`,fontSize:9,textAlign:"right",fontWeight:700}}>{w.qty}</td>
                        <td style={{padding:"7px 8px",borderBottom:`1px solid ${T.border}`,fontSize:9,textAlign:"right"}}>₹{w.buyPrice.toFixed(2)}</td>
                        <td style={{padding:"7px 8px",borderBottom:`1px solid ${T.border}`,fontSize:10,textAlign:"right",fontWeight:800}}>₹{w.curr.toFixed(2)}</td>
                        <td style={{padding:"7px 8px",borderBottom:`1px solid ${T.border}`,fontSize:9,textAlign:"right",fontWeight:800,color:w.pl>=0?T.emerald:T.red}}>
                          {w.pl>=0?"+":""}₹{w.pl.toLocaleString("en-IN")}
                        </td>
                        <td style={{padding:"7px 8px",borderBottom:`1px solid ${T.border}`,fontSize:9,textAlign:"right",fontWeight:800,color:w.plPct>=0?T.emerald:T.red}}>
                          {w.plPct>=0?"+":""}{w.plPct}%
                        </td>
                        <td style={{padding:"7px 8px",borderBottom:`1px solid ${T.border}`,textAlign:"right"}}>
                          <button onClick={()=>setWatchlist(p=>p.filter((_,j)=>j!==i))}
                            style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:14}}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              {(()=>{
                const tInv=wlPL.reduce((s,w)=>s+w.buyPrice*w.qty,0);
                const tCurr=wlPL.reduce((s,w)=>s+w.curr*w.qty,0);
                const tPL=wlPL.reduce((s,w)=>s+w.pl,0);
                const tPct=((tCurr-tInv)/tInv*100);
                return(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                    {[
                      {l:"Total Invested",v:`₹${tInv.toLocaleString("en-IN",{maximumFractionDigits:0})}`,c:T.text},
                      {l:"Current Value",v:`₹${tCurr.toLocaleString("en-IN",{maximumFractionDigits:0})}`,c:T.cyan},
                      {l:"Total P&L",v:`${tPL>=0?"+":""}₹${tPL.toLocaleString("en-IN",{maximumFractionDigits:0})}`,c:tPL>=0?T.emerald:T.red},
                      {l:"Returns",v:`${tPct>=0?"+":""}${tPct.toFixed(2)}%`,c:tPct>=0?T.emerald:T.red},
                    ].map(s=>(
                      <Card key={s.l}>
                        <div style={{fontSize:8,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>{s.l}</div>
                        <div style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div>
                      </Card>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══ BACKTESTING ══ */}
          {navTab==="backtesting"&&(
            <StrategyBacktester/>
          )}
          {/* ══ MUTUAL FUNDS & SIP ══ */}
          {navTab==="mf"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* Hero Banner */}
              <div style={{background:`linear-gradient(135deg,${G.growwDark},#1a2640)`,
                border:`1px solid ${G.growwGreen}33`,borderRadius:14,padding:"18px 22px",
                display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:34,height:34,background:`linear-gradient(135deg,${G.growwGreen},#00a87d)`,
                      borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Landmark size={17} color="#0a1628" strokeWidth={2.5}/>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:900,color:T.text}}>Mutual Funds & SIP</div>
                      <div style={{fontSize:8.5,color:T.sub}}>Top-rated funds · Start with ₹100 · SEBI regulated · Zero commission</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8}}>
                    {[
                      {l:"Active SIPs",    v:Object.keys(sipActive).length, c:G.growwGreen},
                      {l:"Monthly SIP",    v:`₹${Object.values(sipActive).reduce((a,b)=>a+b,0).toLocaleString("en-IN")}`, c:T.cyan},
                      {l:"Funds Available",v:"6 Funds",                     c:T.violet},
                      {l:"Min Investment", v:"₹100 SIP",                    c:G.goldYellow},
                    ].map((s,i)=>(
                      <div key={i} style={{background:"#ffffff0a",border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 14px"}}>
                        <div style={{fontSize:7,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{s.l}</div>
                        <div style={{fontSize:14,fontWeight:900,color:s.c}}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={()=>setSipModal(0)} style={{
                  background:`linear-gradient(135deg,${G.growwGreen},#00a87d)`,color:"#0a1628",
                  border:"none",borderRadius:12,padding:"12px 24px",fontWeight:900,fontSize:13,
                  cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,
                  boxShadow:`0 4px 24px ${G.growwGreen}55`}}>
                  <Repeat size={15}/>Start SIP Now
                </button>
              </div>

              {/* Filter Tabs */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[{id:"all",l:"All Funds"},{id:"Large Cap",l:"Large Cap"},{id:"Mid Cap",l:"Mid Cap"},
                  {id:"Small Cap",l:"Small Cap"},{id:"Index Fund",l:"Index"}].map(f=>(
                  <button key={f.id} onClick={()=>setMfFilter(f.id)} style={{
                    padding:"5px 14px",borderRadius:20,fontSize:9,fontWeight:800,cursor:"pointer",
                    fontFamily:"inherit",transition:"all 0.15s",
                    background:mfFilter===f.id?G.growwGreen+"28":"transparent",
                    color:mfFilter===f.id?G.growwGreen:T.muted,
                    border:`1px solid ${mfFilter===f.id?G.growwGreen+"66":T.border}`
                  }}>{f.l}</button>
                ))}
              </div>

              {/* Fund Cards Grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {MF_DATA.filter(f=>mfFilter==="all"||f.category===mfFilter).map((fund,i)=>{
                  const isActive=!!sipActive[fund.name];
                  const riskColor={Low:T.emerald,Moderate:T.amber,High:T.red}[fund.risk];
                  return(
                    <div key={i} style={{background:G.growwCard,border:`1px solid ${isActive?G.growwGreen+"55":G.growwBorder}`,
                      borderRadius:12,padding:"14px 16px",position:"relative",overflow:"hidden",
                      transition:"border-color 0.2s",cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=G.growwGreen+"44"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=isActive?G.growwGreen+"55":G.growwBorder}>
                      {isActive&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,
                        background:`linear-gradient(90deg,${G.growwGreen},#00a87d)`}}/>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div>
                          <div style={{fontSize:7.5,fontWeight:800,padding:"2px 7px",borderRadius:4,
                            background:G.growwGreen+"22",color:G.growwGreen,border:`1px solid ${G.growwGreen}44`,
                            display:"inline-block",marginBottom:5,letterSpacing:"0.06em"}}>{fund.tag}</div>
                          <div style={{fontSize:10.5,fontWeight:800,color:T.text,lineHeight:1.3}}>{fund.name}</div>
                          <div style={{fontSize:8,color:T.sub,marginTop:2}}>{fund.category} · AUM {fund.aum}</div>
                        </div>
                        <div style={{display:"flex",gap:1}}>
                          {Array.from({length:5}).map((_,si)=>(
                            <Star key={si} size={9} fill={si<fund.rating?G.goldYellow:"transparent"}
                              color={si<fund.rating?G.goldYellow:T.muted} strokeWidth={1.5}/>
                          ))}
                        </div>
                      </div>

                      {/* Returns Table */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:10}}>
                        {[{l:"1Y",v:fund.returns.y1},{l:"3Y",v:fund.returns.y3},{l:"5Y",v:fund.returns.y5}].map((r,ri)=>(
                          <div key={ri} style={{background:T.panel,borderRadius:6,padding:"5px 7px",textAlign:"center"}}>
                            <div style={{fontSize:7,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>{r.l} Returns</div>
                            <div style={{fontSize:11,fontWeight:900,color:T.emerald,marginTop:1}}>{r.v}%</div>
                          </div>
                        ))}
                      </div>

                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <div>
                          <div style={{fontSize:7,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>NAV</div>
                          <div style={{fontSize:10,fontWeight:800,color:T.text}}>₹{fund.nav}</div>
                        </div>
                        <div>
                          <div style={{fontSize:7,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Min SIP</div>
                          <div style={{fontSize:10,fontWeight:800,color:T.cyan}}>₹{fund.minSip}/mo</div>
                        </div>
                        <div style={{fontSize:8,fontWeight:800,padding:"3px 8px",borderRadius:5,
                          background:riskColor+"22",color:riskColor,border:`1px solid ${riskColor}44`}}>
                          {fund.risk} Risk
                        </div>
                      </div>

                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>setSipModal(i)} style={{
                          flex:1,background:isActive?G.growwGreen+"22":`linear-gradient(135deg,${G.growwGreen},#00a87d)`,
                          color:isActive?G.growwGreen:"#0a1628",border:isActive?`1px solid ${G.growwGreen}55`:"none",
                          borderRadius:8,padding:"8px 0",fontWeight:900,fontSize:10,cursor:"pointer",
                          fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                          <Repeat size={11}/>{isActive?`SIP Active ₹${sipActive[fund.name]}/mo`:"Start SIP"}
                        </button>
                        <button style={{
                          background:T.indigo+"22",color:T.indigo,border:`1px solid ${T.indigo}44`,
                          borderRadius:8,padding:"8px 14px",fontWeight:800,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
                          1-Click Invest
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SIP Modal */}
              {sipModal!==null&&(
                <div style={{position:"fixed",inset:0,background:"#000000aa",display:"flex",
                  alignItems:"center",justifyContent:"center",zIndex:9999}}
                  onClick={e=>{if(e.target===e.currentTarget)setSipModal(null);}}>
                  <div style={{background:G.growwCard,border:`1px solid ${G.growwGreen}44`,
                    borderRadius:16,padding:"24px 28px",width:380,maxWidth:"90vw"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                      <div style={{fontSize:13,fontWeight:900,color:T.text}}>Setup Monthly SIP</div>
                      <button onClick={()=>setSipModal(null)} style={{background:"none",border:"none",
                        color:T.muted,cursor:"pointer",fontSize:18}}>✕</button>
                    </div>
                    <div style={{fontSize:10,color:T.sub,marginBottom:14}}>{MF_DATA[sipModal]?.name}</div>
                    <div style={{fontSize:8,color:T.muted,fontWeight:700,letterSpacing:"0.1em",
                      textTransform:"uppercase",marginBottom:6}}>Monthly SIP Amount</div>
                    <div style={{display:"flex",gap:6,marginBottom:12}}>
                      {[500,1000,2000,5000].map(amt=>(
                        <button key={amt} onClick={()=>setSipAmt(amt)} style={{
                          flex:1,padding:"7px 0",borderRadius:8,fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",
                          background:sipAmt===amt?G.growwGreen+"28":"transparent",
                          color:sipAmt===amt?G.growwGreen:T.muted,
                          border:`1px solid ${sipAmt===amt?G.growwGreen+"66":T.border}`
                        }}>₹{amt}</button>
                      ))}
                    </div>
                    <input type="number" value={sipAmt} onChange={e=>setSipAmt(+e.target.value)}
                      style={{width:"100%",background:T.panel,border:`1px solid ${G.growwGreen}44`,
                      borderRadius:8,padding:"9px 12px",color:T.text,fontSize:13,fontWeight:800,
                      outline:"none",fontFamily:"inherit",marginBottom:14}}
                      placeholder="Custom amount"/>
                    <div style={{background:G.growwGreen+"0d",border:`1px solid ${G.growwGreen}22`,
                      borderRadius:8,padding:"8px 12px",marginBottom:14}}>
                      <div style={{fontSize:8,color:T.sub,lineHeight:1.6}}>
                        📅 SIP Date: <strong style={{color:T.text}}>1st of every month</strong><br/>
                        💹 Expected Return: <strong style={{color:T.emerald}}>{MF_DATA[sipModal]?.returns.y3}% p.a. (3Y)</strong><br/>
                        💼 10 Year Value: <strong style={{color:G.growwGreen}}>₹{Math.round(sipAmt*12*10*(1+0.15)).toLocaleString("en-IN")}</strong> est.
                      </div>
                    </div>
                    <button onClick={()=>{
                      setSipActive(p=>({...p,[MF_DATA[sipModal].name]:sipAmt}));
                      setSipModal(null);
                    }} style={{
                      width:"100%",background:`linear-gradient(135deg,${G.growwGreen},#00a87d)`,color:"#0a1628",
                      border:"none",borderRadius:10,padding:"12px 0",fontWeight:900,fontSize:13,cursor:"pointer",
                      fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                      <Repeat size={14}/>Confirm SIP — ₹{sipAmt}/month
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ OPTION CHAIN (Upstox Pro Inspired) ══ */}
          {navTab==="options"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#10111e,#181c2e)",
                border:`1px solid ${T.violet}33`,borderRadius:14,padding:"16px 20px",
                display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,background:"linear-gradient(135deg,#8b5cf6,#6366f1)",
                    borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",
                    boxShadow:"0 0 20px #8b5cf644"}}>
                    <AreaChart size={18} color="#fff"/>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:900,color:T.text}}>Advanced Option Chain
                      <span style={{marginLeft:8,fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:4,
                        background:"linear-gradient(135deg,#f97316,#ef4444)",color:"#fff"}}>UPSTOX PRO</span>
                    </div>
                    <div style={{fontSize:8.5,color:T.sub}}>NIFTY 50 · Expiry: {ocExpiry} · Real-time Greeks &amp; IV</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {["27 Jun 2024","25 Jul 2024","29 Aug 2024"].map(exp=>(
                    <button key={exp} onClick={()=>setOcExpiry(exp)} style={{
                      padding:"5px 12px",borderRadius:7,fontSize:8.5,fontWeight:800,cursor:"pointer",
                      fontFamily:"inherit",background:ocExpiry===exp?T.violet+"28":"transparent",
                      color:ocExpiry===exp?T.violet:T.muted,border:`1px solid ${ocExpiry===exp?T.violet+"66":T.border}`}}>
                      {exp}
                    </button>
                  ))}
                  <button onClick={()=>setOcGreeks(g=>!g)} style={{
                    padding:"5px 12px",borderRadius:7,fontSize:8.5,fontWeight:800,cursor:"pointer",
                    fontFamily:"inherit",background:ocGreeks?T.cyan+"22":"transparent",
                    color:ocGreeks?T.cyan:T.muted,border:`1px solid ${ocGreeks?T.cyan+"66":T.border}`,
                    display:"flex",alignItems:"center",gap:5}}>
                    <Gauge size={10}/> Greeks {ocGreeks?"ON":"OFF"}
                  </button>
                </div>
              </div>

              {/* ── Sub-Tab Switcher: Option Chain | Strategy Builder ── */}
              <div style={{display:"flex",gap:6,background:T.panel,border:`1px solid ${T.border}`,borderRadius:10,padding:4,alignSelf:"flex-start"}}>
                {[
                  {id:"chain",   label:"🔗 Option Chain"},
                  {id:"builder", label:"🧩 Strategy Builder"},
                ].map(tab=>(
                  <button key={tab.id} onClick={()=>setOcTab(tab.id)} style={{
                    padding:"7px 16px",borderRadius:7,fontSize:9,fontWeight:800,cursor:"pointer",
                    fontFamily:"inherit",transition:"all 0.15s",
                    background:ocTab===tab.id?`linear-gradient(135deg,${T.violet},${T.indigo})`:"transparent",
                    color:ocTab===tab.id?"#fff":T.muted,border:"none",
                    boxShadow:ocTab===tab.id?`0 4px 14px ${T.violet}44`:"none",
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {ocTab==="chain"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* IV Summary Strip */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                {[
                  {l:"NIFTY LTP",  v:"24,418",  c:T.cyan,  sub:"Underlying"},
                  {l:"ATM IV",     v:"14.2%",   c:T.violet,sub:"Implied Vol"},
                  {l:"IV Rank",    v:"34/100",  c:T.amber, sub:"30-day"},
                  {l:"PCR (OI)",   v:"0.82",    c:T.emerald,sub:"Put-Call Ratio"},
                  {l:"Max Pain",   v:"24,400",  c:T.red,   sub:"Strike"},
                ].map((s,i)=>(
                  <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px"}}>
                    <div style={{fontSize:7,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                    <div style={{fontSize:16,fontWeight:900,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:7.5,color:T.muted,marginTop:1}}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Option Chain Table */}
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"#ffffff06"}}>
                      {/* CALL headers */}
                      {ocGreeks
                        ?["OI","Δ OI","IV","Delta","Gamma","LTP"].map(h=>(
                          <th key={h} style={{padding:"9px 8px",fontSize:7.5,color:T.emerald,fontWeight:800,
                            letterSpacing:"0.08em",textAlign:"right",borderBottom:`1px solid ${T.border}`}}>{h}</th>))
                        :["OI","Δ OI","IV","LTP"].map(h=>(
                          <th key={h} style={{padding:"9px 8px",fontSize:7.5,color:T.emerald,fontWeight:800,
                            letterSpacing:"0.08em",textAlign:"right",borderBottom:`1px solid ${T.border}`}}>{h}</th>))
                      }
                      <th style={{padding:"9px 8px",fontSize:9,color:T.amber,fontWeight:900,textAlign:"center",
                        borderBottom:`1px solid ${T.border}`,background:T.amber+"0d"}}>STRIKE</th>
                      {/* PUT headers */}
                      {ocGreeks
                        ?["LTP","Delta","Gamma","IV","Δ OI","OI"].map(h=>(
                          <th key={h} style={{padding:"9px 8px",fontSize:7.5,color:T.red,fontWeight:800,
                            letterSpacing:"0.08em",textAlign:"left",borderBottom:`1px solid ${T.border}`}}>{h}</th>))
                        :["LTP","IV","Δ OI","OI"].map(h=>(
                          <th key={h} style={{padding:"9px 8px",fontSize:7.5,color:T.red,fontWeight:800,
                            letterSpacing:"0.08em",textAlign:"left",borderBottom:`1px solid ${T.border}`}}>{h}</th>))
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {OPTION_CHAIN.map((row,i)=>(
                      <tr key={i} style={{
                        background:row.atm?T.amber+"0d":"transparent",
                        borderLeft:row.atm?`3px solid ${T.amber}`:"3px solid transparent",
                        transition:"background 0.15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=row.atm?T.amber+"15":T.panel}
                        onMouseLeave={e=>e.currentTarget.style.background=row.atm?T.amber+"0d":"transparent"}>
                        {/* CALL side */}
                        <td style={{padding:"7px 8px",fontSize:8.5,textAlign:"right",color:T.sub,borderBottom:`1px solid ${T.border}`}}>{(row.callOI/1000).toFixed(0)}K</td>
                        <td style={{padding:"7px 8px",fontSize:8,textAlign:"right",color:row.callOIChg>=0?T.emerald:T.red,fontWeight:700,borderBottom:`1px solid ${T.border}`}}>{row.callOIChg>=0?"+":""}{(row.callOIChg/1000).toFixed(0)}K</td>
                        <td style={{padding:"7px 8px",fontSize:8.5,textAlign:"right",color:T.violet,fontWeight:700,borderBottom:`1px solid ${T.border}`}}>{row.callIV}%</td>
                        {ocGreeks&&<>
                          <td style={{padding:"7px 8px",fontSize:8,textAlign:"right",color:T.sky,borderBottom:`1px solid ${T.border}`}}>{row.callDelta.toFixed(2)}</td>
                          <td style={{padding:"7px 8px",fontSize:8,textAlign:"right",color:T.teal,borderBottom:`1px solid ${T.border}`}}>{row.callGamma.toFixed(4)}</td>
                        </>}
                        <td style={{padding:"7px 8px",fontSize:9.5,textAlign:"right",fontWeight:800,color:T.emerald,borderBottom:`1px solid ${T.border}`}}>{row.callLTP}</td>
                        {/* STRIKE */}
                        <td style={{padding:"7px 10px",fontSize:10,textAlign:"center",fontWeight:900,
                          color:row.atm?T.amber:T.text,background:row.atm?T.amber+"0d":T.panel+"80",
                          borderBottom:`1px solid ${T.border}`}}>
                          {row.strike.toLocaleString("en-IN")}
                          {row.atm&&<span style={{display:"block",fontSize:7,color:T.amber,fontWeight:800}}>ATM</span>}
                        </td>
                        {/* PUT side */}
                        <td style={{padding:"7px 8px",fontSize:9.5,textAlign:"left",fontWeight:800,color:T.red,borderBottom:`1px solid ${T.border}`}}>{row.putLTP}</td>
                        {ocGreeks&&<>
                          <td style={{padding:"7px 8px",fontSize:8,textAlign:"left",color:T.sky,borderBottom:`1px solid ${T.border}`}}>{row.putDelta.toFixed(2)}</td>
                          <td style={{padding:"7px 8px",fontSize:8,textAlign:"left",color:T.teal,borderBottom:`1px solid ${T.border}`}}>{row.putGamma.toFixed(4)}</td>
                        </>}
                        <td style={{padding:"7px 8px",fontSize:8.5,textAlign:"left",color:T.violet,fontWeight:700,borderBottom:`1px solid ${T.border}`}}>{row.putIV}%</td>
                        <td style={{padding:"7px 8px",fontSize:8,textAlign:"left",color:row.putOIChg>=0?T.emerald:T.red,fontWeight:700,borderBottom:`1px solid ${T.border}`}}>{row.putOIChg>=0?"+":""}{(row.putOIChg/1000).toFixed(0)}K</td>
                        <td style={{padding:"7px 8px",fontSize:8.5,textAlign:"left",color:T.sub,borderBottom:`1px solid ${T.border}`}}>{(row.putOI/1000).toFixed(0)}K</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Greeks Legend */}
              {ocGreeks&&(
                <div style={{display:"flex",gap:12,flexWrap:"wrap",background:T.card,border:`1px solid ${T.border}`,
                  borderRadius:10,padding:"10px 14px"}}>
                  <span style={{fontSize:7.5,color:T.muted,fontWeight:800,letterSpacing:"0.1em"}}>GREEKS GUIDE:</span>
                  {[
                    {g:"Delta (Δ)",  c:T.sky,    d:"Sensitivity to ₹1 move in underlying"},
                    {g:"Gamma (Γ)",  c:T.teal,   d:"Rate of change of Delta"},
                    {g:"IV",        c:T.violet, d:"Implied Volatility — market's fear gauge"},
                  ].map((g,i)=>(
                    <span key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:8}}>
                      <span style={{color:g.c,fontWeight:800}}>{g.g}</span>
                      <span style={{color:T.muted}}>— {g.d}</span>
                    </span>
                  ))}
                </div>
              )}
              </div>
              )}

              {/* ── Strategy Builder sub-tab ── */}
              {ocTab==="builder"&&(
                <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${T.violet}33`}}>
                  <StrategyBuilder/>
                </div>
              )}
            </div>
          )}

          {/* ══ ADVISORY & RESEARCH (Angel One Inspired) ══ */}
          {navTab==="advisory"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#1a1020,#1c1a2e)",
                border:`1px solid ${T.rose}33`,borderRadius:14,padding:"16px 20px",
                display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,background:"linear-gradient(135deg,#f43f5e,#e11d48)",
                    borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",
                    boxShadow:"0 0 20px #f43f5e44"}}>
                    <Newspaper size={18} color="#fff"/>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:900,color:T.text}}>Advisory &amp; Research
                      <span style={{marginLeft:8,fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:4,
                        background:"linear-gradient(135deg,#f43f5e,#e11d48)",color:"#fff"}}>ANGEL ONE AI</span>
                    </div>
                    <div style={{fontSize:8.5,color:T.sub}}>Daily stock ideas · Sector views · AI-powered analysis · Updated 9:15 AM IST</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {["ideas","sectors"].map(tab=>(
                    <button key={tab} onClick={()=>setAdvisorTab(tab)} style={{
                      padding:"7px 16px",borderRadius:8,fontSize:9,fontWeight:800,cursor:"pointer",
                      fontFamily:"inherit",transition:"all 0.15s",letterSpacing:"0.04em",
                      background:advisorTab===tab?"linear-gradient(135deg,#f43f5e,#e11d48)":"transparent",
                      color:advisorTab===tab?"#fff":T.muted,
                      border:`1px solid ${advisorTab===tab?T.rose:T.border}`}}>
                      {tab==="ideas"?"💡 Daily Ideas":"🏭 Sector Views"}
                    </button>
                  ))}
                </div>
              </div>

              {advisorTab==="ideas"&&(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                    {DAILY_IDEAS.map((idea,i)=>(
                      <div key={i} style={{background:T.card,border:`1px solid ${idea.action==="BUY"?T.emerald+"33":T.amber+"33"}`,
                        borderRadius:12,padding:"14px 16px",position:"relative",overflow:"hidden"}}>
                        <div style={{position:"absolute",top:0,left:0,right:0,height:3,
                          background:idea.action==="BUY"?`linear-gradient(90deg,${T.emerald},${T.teal})`:
                            idea.action==="SELL"?`linear-gradient(90deg,${T.red},${T.rose})`:`linear-gradient(90deg,${T.amber},${T.yellow})`}}/>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                              <span style={{fontSize:13,fontWeight:900,color:T.text}}>{idea.sym}</span>
                              <span style={{fontSize:8,fontWeight:900,padding:"2px 8px",borderRadius:5,
                                background:idea.action==="BUY"?T.emerald+"25":idea.action==="SELL"?T.red+"25":T.amber+"25",
                                color:idea.action==="BUY"?T.emerald:idea.action==="SELL"?T.red:T.amber,
                                border:`1px solid ${idea.action==="BUY"?T.emerald:idea.action==="SELL"?T.red:T.amber}44`}}>
                                {idea.action}
                              </span>
                              <span style={{fontSize:7.5,color:T.muted}}>{idea.sector}</span>
                            </div>
                            <div style={{fontSize:8,color:T.sub,lineHeight:1.5}}>{idea.thesis}</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                            <div style={{fontSize:7,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>AI Conf.</div>
                            <div style={{fontSize:16,fontWeight:900,color:idea.conf>75?T.emerald:idea.conf>60?T.amber:T.red}}>{idea.conf}%</div>
                          </div>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
                          {[{l:"Target",v:`₹${idea.target}`,c:T.emerald},{l:"Stop Loss",v:`₹${idea.sl}`,c:T.red},{l:"Horizon",v:idea.horizon,c:T.cyan}].map((m,j)=>(
                            <div key={j} style={{background:T.panel,borderRadius:6,padding:"5px 7px"}}>
                              <div style={{fontSize:7,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>{m.l}</div>
                              <div style={{fontSize:9.5,fontWeight:800,color:m.c,marginTop:1}}>{m.v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <MiniBar value={idea.conf} color={idea.conf>75?T.emerald:idea.conf>60?T.amber:T.red} height={4}/>
                          <button onClick={()=>{changeSym(idea.sym);setNavTab("dashboard");}} style={{
                            marginLeft:10,background:T.cyan+"22",color:T.cyan,border:`1px solid ${T.cyan}44`,
                            borderRadius:6,padding:"4px 10px",fontSize:8,fontWeight:800,cursor:"pointer",
                            fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
                            <CandlestickChart size={10}/>View Chart
                          </button>
                        </div>
                        <div style={{marginTop:6,fontSize:7.5,color:T.muted,display:"flex",alignItems:"center",gap:4}}>
                          <Brain size={9} color={T.rose}/> {idea.analyst} · Updated today
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:T.amber+"0d",border:`1px solid ${T.amber}22`,borderRadius:8,padding:"10px 14px",
                    display:"flex",gap:8,alignItems:"flex-start"}}>
                    <AlertTriangle size={13} color={T.amber} style={{marginTop:1,flexShrink:0}}/>
                    <div style={{fontSize:8.5,color:T.sub,lineHeight:1.6}}>
                      <strong style={{color:T.amber}}>ADVISORY DISCLAIMER:</strong> AI-generated research for educational purposes only. Not SEBI registered. Conduct your own due diligence before investing.
                    </div>
                  </div>
                </>
              )}

              {advisorTab==="sectors"&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {SECTOR_VIEWS.map((sv,i)=>{
                    const vColor=sv.view==="OVERWEIGHT"?T.emerald:sv.view==="UNDERWEIGHT"?T.red:sv.view==="WATCH"?T.sky:T.amber;
                    return(
                      <div key={i} style={{background:T.card,border:`1px solid ${vColor}33`,borderRadius:12,padding:"14px 16px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:900,color:T.text,marginBottom:3}}>{sv.sector}</div>
                            <span style={{fontSize:8,fontWeight:900,padding:"2px 8px",borderRadius:5,
                              background:vColor+"22",color:vColor,border:`1px solid ${vColor}44`}}>
                              {sv.view}
                            </span>
                          </div>
                          <div style={{fontSize:13,fontWeight:900,color:sv.change.startsWith("+")?T.emerald:sv.change.startsWith("-")?T.red:T.sky}}>
                            {sv.change}
                          </div>
                        </div>
                        <div style={{fontSize:8.5,color:T.sub,lineHeight:1.5}}>{sv.reason}</div>
                        <div style={{marginTop:8,height:3,borderRadius:2,background:T.border,overflow:"hidden"}}>
                          <div style={{height:"100%",width:sv.view==="OVERWEIGHT"?"70%":sv.view==="UNDERWEIGHT"?"30%":"50%",
                            background:vColor,borderRadius:2,transition:"width 0.5s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ POWER SCREENER (StockEdge Inspired) ══ */}
          {navTab==="screener"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#0e1a10,#101c14)",
                border:`1px solid ${T.emerald}33`,borderRadius:14,padding:"16px 20px",
                display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,background:"linear-gradient(135deg,#10b981,#059669)",
                    borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",
                    boxShadow:"0 0 20px #10b98144"}}>
                    <ScanLine size={18} color="#fff"/>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:900,color:T.text}}>Power Screener
                      <span style={{marginLeft:8,fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:4,
                        background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff"}}>STOCKEDGE</span>
                    </div>
                    <div style={{fontSize:8.5,color:T.sub}}>52W High · Volume Surge · Technical Breakouts · Updated every session</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {["52W High","Volume Surge","Technical Breakouts"].map(f=>(
                    <button key={f} onClick={()=>setScreenFilter(f)} style={{
                      padding:"7px 14px",borderRadius:8,fontSize:8.5,fontWeight:800,cursor:"pointer",
                      fontFamily:"inherit",transition:"all 0.15s",
                      background:screenFilter===f?"linear-gradient(135deg,#10b981,#059669)":"transparent",
                      color:screenFilter===f?"#fff":T.muted,
                      border:`1px solid ${screenFilter===f?T.emerald:T.border}`,
                      display:"flex",alignItems:"center",gap:5}}>
                      {f==="52W High"?<Trophy size={10}/>:f==="Volume Surge"?<Volume2 size={10}/>:<ArrowUpCircle size={10}/>}
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Screener Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {[
                  {l:"Stocks Scanned",v:"4,200+",  c:T.cyan},
                  {l:"Matching Criteria",v:SCREENER_DATA[screenFilter].length,c:T.emerald},
                  {l:"Scan Frequency",v:"Real-time",c:T.amber},
                  {l:"Last Updated",v:"9:30 AM",   c:T.violet},
                ].map((s,i)=>(
                  <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px"}}>
                    <div style={{fontSize:7,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                    <div style={{fontSize:16,fontWeight:900,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Screener Results */}
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
                <div style={{background:"#ffffff06",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,
                  display:"flex",alignItems:"center",gap:8}}>
                  <ListFilter size={13} color={T.emerald}/>
                  <span style={{fontSize:9,fontWeight:800,color:T.text,letterSpacing:"0.06em"}}>
                    {screenFilter.toUpperCase()} SCAN RESULTS
                  </span>
                  <span style={{fontSize:8,color:T.muted,marginLeft:"auto"}}>
                    {SCREENER_DATA[screenFilter].length} stocks matched
                  </span>
                </div>
                {screenFilter==="52W High"&&(
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr>{["Symbol","Sector","Price","52W High","% of High","Volume","Signal","Action"].map(h=>(
                        <th key={h} style={{padding:"8px 12px",fontSize:7.5,color:T.muted,fontWeight:800,
                          letterSpacing:"0.08em",textAlign:h==="Symbol"||h==="Sector"||h==="Signal"?"left":"right",
                          borderBottom:`1px solid ${T.border}`,textTransform:"uppercase"}}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {SCREENER_DATA["52W High"].map((r,i)=>(
                        <tr key={i} style={{transition:"background 0.12s"}}
                          onMouseEnter={e=>e.currentTarget.style.background=T.panel}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{padding:"9px 12px",fontSize:10,fontWeight:800,color:T.cyan,borderBottom:`1px solid ${T.border}`}}>
                            <button onClick={()=>{if(STOCKS[r.sym]){changeSym(r.sym);setNavTab("dashboard");}}}
                              style={{background:"none",border:"none",color:T.cyan,fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:10}}>{r.sym}</button>
                          </td>
                          <td style={{padding:"9px 12px",fontSize:8.5,color:T.sub,borderBottom:`1px solid ${T.border}`}}>{r.sector}</td>
                          <td style={{padding:"9px 12px",fontSize:9.5,fontWeight:800,textAlign:"right",borderBottom:`1px solid ${T.border}`}}>₹{r.price.toLocaleString("en-IN")}</td>
                          <td style={{padding:"9px 12px",fontSize:9,textAlign:"right",color:T.amber,fontWeight:700,borderBottom:`1px solid ${T.border}`}}>₹{r.high52.toLocaleString("en-IN")}</td>
                          <td style={{padding:"9px 12px",textAlign:"right",borderBottom:`1px solid ${T.border}`}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
                              <div style={{width:48,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}>
                                <div style={{width:`${r.pct}%`,height:"100%",background:r.pct>95?T.emerald:r.pct>85?T.amber:T.red,borderRadius:2}}/>
                              </div>
                              <span style={{fontSize:8.5,fontWeight:800,color:r.pct>95?T.emerald:r.pct>85?T.amber:T.red}}>{r.pct}%</span>
                            </div>
                          </td>
                          <td style={{padding:"9px 12px",fontSize:8.5,textAlign:"right",color:T.violet,fontWeight:700,borderBottom:`1px solid ${T.border}`}}>{r.vol}</td>
                          <td style={{padding:"9px 12px",fontSize:8,borderBottom:`1px solid ${T.border}`}}>
                            <span style={{background:T.emerald+"18",color:T.emerald,border:`1px solid ${T.emerald}33`,
                              borderRadius:5,padding:"2px 7px",fontWeight:700}}>{r.signal}</span>
                          </td>
                          <td style={{padding:"9px 12px",textAlign:"right",borderBottom:`1px solid ${T.border}`}}>
                            <button onClick={()=>execOrder("BUY")} style={{
                              background:T.emerald+"22",color:T.emerald,border:`1px solid ${T.emerald}44`,
                              borderRadius:6,padding:"4px 10px",fontSize:8,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
                              + BUY
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {screenFilter==="Volume Surge"&&(
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr>{["Symbol","Sector","Price","Change","Vol Surge","Signal","Action"].map(h=>(
                        <th key={h} style={{padding:"8px 12px",fontSize:7.5,color:T.muted,fontWeight:800,
                          letterSpacing:"0.08em",textAlign:h==="Symbol"||h==="Sector"||h==="Signal"?"left":"right",
                          borderBottom:`1px solid ${T.border}`,textTransform:"uppercase"}}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {SCREENER_DATA["Volume Surge"].map((r,i)=>(
                        <tr key={i} style={{transition:"background 0.12s"}}
                          onMouseEnter={e=>e.currentTarget.style.background=T.panel}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{padding:"9px 12px",borderBottom:`1px solid ${T.border}`}}>
                            <button onClick={()=>{if(STOCKS[r.sym]){changeSym(r.sym);setNavTab("dashboard");}}}
                              style={{background:"none",border:"none",color:T.cyan,fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:10}}>{r.sym}</button>
                          </td>
                          <td style={{padding:"9px 12px",fontSize:8.5,color:T.sub,borderBottom:`1px solid ${T.border}`}}>{r.sector}</td>
                          <td style={{padding:"9px 12px",fontSize:9.5,fontWeight:800,textAlign:"right",borderBottom:`1px solid ${T.border}`}}>₹{r.price.toLocaleString("en-IN")}</td>
                          <td style={{padding:"9px 12px",fontSize:9,textAlign:"right",fontWeight:800,
                            color:r.change>=0?T.emerald:T.red,borderBottom:`1px solid ${T.border}`}}>
                            {r.change>=0?"+":""}{r.change}%
                          </td>
                          <td style={{padding:"9px 12px",textAlign:"right",borderBottom:`1px solid ${T.border}`}}>
                            <span style={{fontSize:11,fontWeight:900,color:T.orange}}>{r.volSurge}</span>
                          </td>
                          <td style={{padding:"9px 12px",fontSize:8,borderBottom:`1px solid ${T.border}`}}>
                            <span style={{background:T.orange+"18",color:T.orange,border:`1px solid ${T.orange}33`,
                              borderRadius:5,padding:"2px 7px",fontWeight:700}}>{r.signal}</span>
                          </td>
                          <td style={{padding:"9px 12px",textAlign:"right",borderBottom:`1px solid ${T.border}`}}>
                            <button onClick={()=>execOrder("BUY")} style={{
                              background:T.cyan+"22",color:T.cyan,border:`1px solid ${T.cyan}44`,
                              borderRadius:6,padding:"4px 10px",fontSize:8,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
                              Analyse
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {screenFilter==="Technical Breakouts"&&(
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr>{["Symbol","Price","Pattern","Timeframe","Confidence","Trigger","Action"].map(h=>(
                        <th key={h} style={{padding:"8px 12px",fontSize:7.5,color:T.muted,fontWeight:800,
                          letterSpacing:"0.08em",textAlign:h==="Symbol"||h==="Pattern"||h==="Trigger"?"left":"right",
                          borderBottom:`1px solid ${T.border}`,textTransform:"uppercase"}}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {SCREENER_DATA["Technical Breakouts"].map((r,i)=>(
                        <tr key={i} style={{transition:"background 0.12s"}}
                          onMouseEnter={e=>e.currentTarget.style.background=T.panel}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{padding:"9px 12px",borderBottom:`1px solid ${T.border}`}}>
                            <button onClick={()=>{if(STOCKS[r.sym]){changeSym(r.sym);setNavTab("dashboard");}}}
                              style={{background:"none",border:"none",color:T.cyan,fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:10}}>{r.sym}</button>
                          </td>
                          <td style={{padding:"9px 12px",fontSize:9.5,fontWeight:800,textAlign:"right",borderBottom:`1px solid ${T.border}`}}>₹{r.price.toLocaleString("en-IN")}</td>
                          <td style={{padding:"9px 12px",fontSize:8.5,color:T.violet,fontWeight:700,borderBottom:`1px solid ${T.border}`}}>{r.pattern}</td>
                          <td style={{padding:"9px 12px",textAlign:"right",borderBottom:`1px solid ${T.border}`}}>
                            <span style={{fontSize:8,background:T.sky+"18",color:T.sky,border:`1px solid ${T.sky}33`,borderRadius:4,padding:"2px 6px",fontWeight:700}}>{r.tf}</span>
                          </td>
                          <td style={{padding:"9px 12px",textAlign:"right",borderBottom:`1px solid ${T.border}`}}>
                            <span style={{fontSize:10,fontWeight:900,color:r.conf>80?T.emerald:T.amber}}>{r.conf}%</span>
                          </td>
                          <td style={{padding:"9px 12px",fontSize:8,color:T.amber,borderBottom:`1px solid ${T.border}`}}>{r.trigger}</td>
                          <td style={{padding:"9px 12px",textAlign:"right",borderBottom:`1px solid ${T.border}`}}>
                            <button onClick={()=>execOrder("BUY")} style={{
                              background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff",border:"none",
                              borderRadius:6,padding:"4px 10px",fontSize:8,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
                              BUY NOW
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ══ BROKERAGE CALCULATOR (5paisa Inspired) ══ */}
          {navTab==="brokerage"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#140e1a,#1c1030)",
                border:`1px solid ${T.purple}33`,borderRadius:14,padding:"16px 20px",
                display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,background:"linear-gradient(135deg,#a78bfa,#7c3aed)",
                    borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",
                    boxShadow:"0 0 20px #a78bfa44"}}>
                    <Calculator size={18} color="#fff"/>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:900,color:T.text}}>Flat-Rate Brokerage Calculator
                      <span style={{marginLeft:8,fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:4,
                        background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"#fff"}}>5PAISA</span>
                    </div>
                    <div style={{fontSize:8.5,color:T.sub}}>Flat ₹20/order for all segments · Compare Retail vs Active Trader mode</div>
                  </div>
                </div>
                {/* UI Mode Toggle */}
                <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:10,padding:"4px",display:"flex",gap:4}}>
                  {[{id:"retail",l:"👤 Retail Investor",I:UserCheck},{id:"trader",l:"⚡ Active Trader",I:Users}].map(m=>(
                    <button key={m.id} onClick={()=>setUiMode(m.id)} style={{
                      padding:"7px 16px",borderRadius:7,fontSize:8.5,fontWeight:800,cursor:"pointer",
                      fontFamily:"inherit",transition:"all 0.2s",
                      background:uiMode===m.id?"linear-gradient(135deg,#a78bfa,#7c3aed)":"transparent",
                      color:uiMode===m.id?"#fff":T.muted,border:"none"}}>
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {/* Calculator */}
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
                    <Calculator size={14} color={T.purple}/>
                    <span style={{fontSize:11,fontWeight:900,color:T.text}}>Brokerage Calculator</span>
                    {uiMode==="trader"&&(
                      <span style={{fontSize:7.5,background:T.orange+"22",color:T.orange,border:`1px solid ${T.orange}44`,
                        borderRadius:5,padding:"2px 7px",fontWeight:800}}>ACTIVE TRADER MODE</span>
                    )}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                    {[
                      {l:"Trade Type",type:"select",opts:["Equity F&O","Equity Delivery","Equity Intraday","Currency F&O","Commodity"],key:"type"},
                      {l:"Quantity",type:"number",key:"qty",placeholder:"100"},
                      {l:"Price (₹)",type:"number",key:"price",placeholder:"2847"},
                    ].map((field,i)=>(
                      <div key={i}>
                        <div style={{fontSize:8,color:T.muted,fontWeight:700,letterSpacing:"0.08em",
                          textTransform:"uppercase",marginBottom:5}}>{field.l}</div>
                        {field.type==="select"
                          ?<select value={brokerTrade.type} onChange={e=>setBrokerTrade(p=>({...p,type:e.target.value}))}
                            style={{width:"100%",background:T.panel,border:`1px solid ${T.border2}`,borderRadius:7,
                              color:T.text,padding:"7px 10px",fontSize:10,outline:"none",fontFamily:"inherit"}}>
                            {field.opts.map(o=><option key={o} value={o}>{o}</option>)}
                          </select>
                          :<input type="number" value={brokerTrade[field.key]}
                            onChange={e=>setBrokerTrade(p=>({...p,[field.key]:+e.target.value}))}
                            style={{width:"100%",background:T.panel,border:`1px solid ${T.border2}`,borderRadius:7,
                              color:T.text,padding:"7px 10px",fontSize:10,outline:"none",fontFamily:"inherit"}}/>
                        }
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{
                    const turnover=brokerTrade.qty*brokerTrade.price;
                    const brokerage=Math.min(20,turnover*0.0003);
                    const stt=brokerTrade.type.includes("Delivery")?turnover*0.001:turnover*0.00025;
                    const sebi=turnover*0.000001;
                    const gst=(brokerage+sebi)*0.18;
                    const stamp=turnover*0.00003;
                    const total=brokerage+stt+sebi+gst+stamp;
                    setBrokerResult({turnover,brokerage,stt,sebi,gst,stamp,total,breakeven:total/brokerTrade.qty});
                  }} style={{
                    width:"100%",background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"#fff",
                    border:"none",borderRadius:10,padding:"12px 0",fontWeight:900,fontSize:13,
                    cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                    <Calculator size={15}/>Calculate Brokerage
                  </button>
                </div>

                {/* Results */}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {brokerResult?(
                    <>
                      <div style={{background:"linear-gradient(135deg,#1a1228,#14102c)",
                        border:`1px solid ${T.purple}44`,borderRadius:12,padding:"16px 18px"}}>
                        <div style={{fontSize:9,fontWeight:800,color:T.purple,letterSpacing:"0.1em",marginBottom:12,
                          display:"flex",alignItems:"center",gap:6}}>
                          <Percent size={12}/> COST BREAKDOWN
                        </div>
                        {[
                          {l:"Trade Turnover", v:`₹${brokerResult.turnover.toLocaleString("en-IN",{maximumFractionDigits:0})}`, c:T.cyan,     bold:false},
                          {l:"Brokerage",      v:`₹${brokerResult.brokerage.toFixed(2)}`,   c:T.text,     bold:false},
                          {l:"STT / CTT",      v:`₹${brokerResult.stt.toFixed(2)}`,         c:T.amber,    bold:false},
                          {l:"SEBI Charges",   v:`₹${brokerResult.sebi.toFixed(4)}`,        c:T.muted,    bold:false},
                          {l:"GST (18%)",      v:`₹${brokerResult.gst.toFixed(2)}`,         c:T.muted,    bold:false},
                          {l:"Stamp Duty",     v:`₹${brokerResult.stamp.toFixed(2)}`,       c:T.muted,    bold:false},
                          {l:"TOTAL COST",     v:`₹${brokerResult.total.toFixed(2)}`,       c:T.rose,     bold:true},
                          {l:"Breakeven/share",v:`₹${brokerResult.breakeven.toFixed(4)}`,   c:T.orange,   bold:true},
                        ].map((row,i)=>(
                          <div key={i} style={{display:"flex",justifyContent:"space-between",
                            padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:row.bold?10:9}}>
                            <span style={{color:T.sub,fontWeight:row.bold?800:400}}>{row.l}</span>
                            <span style={{color:row.c,fontWeight:row.bold?900:700}}>{row.v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{background:T.emerald+"0d",border:`1px solid ${T.emerald}22`,borderRadius:10,padding:"12px 14px"}}>
                        <div style={{fontSize:8.5,color:T.sub,lineHeight:1.7}}>
                          ✅ <strong style={{color:T.emerald}}>Flat ₹20 cap:</strong> You save vs % brokerage brokers on large trades.<br/>
                          📊 <strong style={{color:T.cyan}}>Cost efficiency:</strong> {((brokerResult.total/brokerResult.turnover)*100).toFixed(4)}% of trade value.<br/>
                          {uiMode==="trader"&&<>⚡ <strong style={{color:T.orange}}>Active Trader:</strong> Unlimited trades at ₹20 flat. Ideal for HFT/intraday.</>}
                        </div>
                      </div>
                    </>
                  ):(
                    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"28px",
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:10}}>
                      <Calculator size={32} color={T.border2}/>
                      <div style={{fontSize:10,color:T.muted,textAlign:"center",lineHeight:1.6}}>
                        Fill in the trade details and click<br/><strong style={{color:T.purple}}>Calculate Brokerage</strong> to see the breakdown
                      </div>
                    </div>
                  )}

                  {/* UI Mode Info */}
                  <div style={{background:uiMode==="retail"?T.sky+"0d":T.orange+"0d",
                    border:`1px solid ${uiMode==="retail"?T.sky:T.orange}22`,borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:9,fontWeight:800,color:uiMode==="retail"?T.sky:T.orange,marginBottom:6,
                      display:"flex",alignItems:"center",gap:5}}>
                      {uiMode==="retail"?<UserCheck size={12}/>:<Users size={12}/>}
                      {uiMode==="retail"?"RETAIL INVESTOR MODE":"ACTIVE TRADER MODE"}
                    </div>
                    <div style={{fontSize:8.5,color:T.sub,lineHeight:1.6}}>
                      {uiMode==="retail"
                        ?"Simplified interface with goal-based investing focus. Best for long-term wealth creation via SIP, MF, and ETFs. Minimal trading jargon."
                        :"Advanced interface with F&O, level-2 data, option chain access, and multi-order types. Co-location enabled for sub-millisecond execution."}
                    </div>
                    <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                      {(uiMode==="retail"
                        ?["SIP Investing","Goal Tracker","MF Screener","Digital Gold","Basic Charts"]
                        :["F&O Trading","Option Chain","Power Screener","Algo Orders","Level-2 Data"]
                      ).map((f,i)=>(
                        <span key={i} style={{fontSize:7.5,padding:"2px 7px",borderRadius:5,
                          background:(uiMode==="retail"?T.sky:T.orange)+"18",
                          color:uiMode==="retail"?T.sky:T.orange,
                          border:`1px solid ${uiMode==="retail"?T.sky:T.orange}33`,fontWeight:700}}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ LEARN / EDUCATION HUB ══ */}
          {navTab==="learn"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {/* Header */}
              <div style={{background:`linear-gradient(135deg,#1a1b38,#1a2235)`,
                border:`1px solid ${T.indigo}33`,borderRadius:14,padding:"18px 22px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{width:34,height:34,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                    borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <GraduationCap size={17} color="#fff" strokeWidth={2.5}/>
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:900,color:T.text}}>Education Hub</div>
                    <div style={{fontSize:8.5,color:T.sub}}>Learn investing from scratch · Curated for Indian markets · Completely free</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:4}}>
                  {[{l:"Articles",v:"6",c:T.indigo},{l:"Beginner",v:"4",c:T.emerald},{l:"Intermediate",v:"2",c:T.amber},{l:"Avg Read",v:"5 min",c:T.cyan}].map((s,i)=>(
                    <div key={i} style={{background:"#ffffff09",border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px"}}>
                      <div style={{fontSize:7,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>{s.l}</div>
                      <div style={{fontSize:14,fontWeight:900,color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIP Calculator Highlight Card */}
              <div style={{background:`linear-gradient(135deg,${G.growwGreen}12,${G.growwGreen}06)`,
                border:`1px solid ${G.growwGreen}33`,borderRadius:12,padding:"16px 18px",
                display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div>
                  <div style={{fontSize:11,fontWeight:900,color:G.growwGreen,marginBottom:4}}>📅 SIP Goal Planner</div>
                  <div style={{fontSize:9,color:T.sub,maxWidth:360,lineHeight:1.6}}>
                    Calculate how much you need to invest monthly to reach your financial goal. Try our interactive SIP planner with inflation adjustment.
                  </div>
                </div>
                <button onClick={()=>setNavTab("mf")} style={{
                  background:`linear-gradient(135deg,${G.growwGreen},#00a87d)`,color:"#0a1628",border:"none",
                  borderRadius:9,padding:"9px 18px",fontWeight:900,fontSize:10,cursor:"pointer",fontFamily:"inherit",
                  display:"flex",alignItems:"center",gap:5}}>
                  <Repeat size={11}/>Open SIP Planner
                </button>
              </div>

              {/* Article Grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {LEARN_ARTICLES.map((art,i)=>{
                  const isOpen=learnOpen===i;
                  const levelColor={Beginner:T.emerald,Intermediate:T.amber}[art.level];
                  return(
                    <div key={i}
                      style={{background:T.card,border:`1px solid ${isOpen?T.indigo+"55":T.border}`,
                        borderRadius:12,padding:"14px 16px",cursor:"pointer",transition:"all 0.18s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=T.indigo+"44"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=isOpen?T.indigo+"55":T.border}
                      onClick={()=>setLearnOpen(learnOpen===i?null:i)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <span style={{fontSize:26}}>{art.icon}</span>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                          <span style={{fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:4,
                            background:levelColor+"22",color:levelColor,border:`1px solid ${levelColor}44`}}>{art.level}</span>
                          <span style={{fontSize:8,color:T.muted,display:"flex",alignItems:"center",gap:3}}>
                            <Clock size={9}/>{art.time} read
                          </span>
                        </div>
                      </div>
                      <div style={{fontSize:11,fontWeight:800,color:T.text,marginBottom:5,lineHeight:1.3}}>{art.title}</div>
                      <div style={{fontSize:8.5,color:T.sub,lineHeight:1.5,marginBottom:10}}>{art.desc}</div>

                      {isOpen&&(
                        <div style={{background:T.panel,border:`1px solid ${T.indigo}22`,borderRadius:8,
                          padding:"10px 12px",marginBottom:10,animation:"fadeIn 0.2s ease"}}>
                          <div style={{fontSize:8,color:T.sub,lineHeight:1.7}}>
                            <strong style={{color:T.indigo,display:"block",marginBottom:4}}>📖 Key Takeaways:</strong>
                            {art.title==="Stock Market Basics"&&<>
                              • NSE and BSE are India's two main stock exchanges<br/>
                              • Nifty 50 and Sensex are market benchmark indices<br/>
                              • Demat + Trading account needed to start investing<br/>
                              • Market hours: 9:15 AM – 3:30 PM IST on weekdays
                            </>}
                            {art.title==="How to Invest in MF"&&<>
                              • NAV = Net Asset Value, the fund's per-unit price<br/>
                              • Lower expense ratio = more money stays invested<br/>
                              • Direct plans beat regular plans by 0.5–1.5% annually<br/>
                              • CRISIL/Morningstar ratings help compare fund quality
                            </>}
                            {art.title==="SIP Planner Guide"&&<>
                              • ₹5,000/month for 20 years at 12% = ₹49.9 Lakhs<br/>
                              • Rupee Cost Averaging smooths out market volatility<br/>
                              • Always link SIP to a specific financial goal<br/>
                              • Step-up SIP: increase amount 10% every year
                            </>}
                            {art.title==="Understanding P/E Ratio"&&<>
                              • P/E = Share Price ÷ Earnings Per Share (EPS)<br/>
                              • Nifty 50 historical average P/E = 20–22x<br/>
                              • Low P/E doesn't always mean undervalued — check sector<br/>
                              • Always compare P/E within the same industry
                            </>}
                            {art.title==="ETFs vs Mutual Funds"&&<>
                              • ETFs trade like stocks, MFs at end-of-day NAV<br/>
                              • Index ETFs are cheaper (expense ratio 0.04–0.15%)<br/>
                              • Active funds aim to beat index but charge more<br/>
                              • For beginners: simple Nifty 50 Index ETF works well
                            </>}
                            {art.title==="Digital Gold Explained"&&<>
                              • Stored in MMTC-PAMP vaults, 24K 99.9% purity<br/>
                              • Can be converted to physical gold or jewellery<br/>
                              • No making charges, no storage hassle<br/>
                              • SEBI regulated — safer than jewellery purchases
                            </>}
                          </div>
                        </div>
                      )}

                      <button style={{
                        width:"100%",background:isOpen?T.indigo+"22":"transparent",
                        color:T.indigo,border:`1px solid ${T.indigo}44`,borderRadius:8,
                        padding:"7px 0",fontWeight:800,fontSize:9,cursor:"pointer",fontFamily:"inherit",
                        display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                        <PlayCircle size={11}/>{isOpen?"Hide Article":"Read Article"}
                        <ChevronDown size={10} style={{transform:isOpen?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}/>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom CTA */}
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,
                padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div>
                  <div style={{fontSize:12,fontWeight:900,color:T.text,marginBottom:3}}>Ready to start investing?</div>
                  <div style={{fontSize:9,color:T.sub}}>Your KYC is <strong style={{color:kycStatus==="verified"?T.emerald:T.amber}}>{kycStatus}</strong>. You can start investing in stocks, MFs, ETFs and Digital Gold right now.</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setNavTab("mf")} style={{
                    background:`linear-gradient(135deg,${G.growwGreen},#00a87d)`,color:"#0a1628",border:"none",
                    borderRadius:9,padding:"9px 18px",fontWeight:900,fontSize:10,cursor:"pointer",fontFamily:"inherit",
                    display:"flex",alignItems:"center",gap:5}}>
                    <Landmark size={11}/>Start SIP
                  </button>
                  <button onClick={()=>setNavTab("dashboard")} style={{
                    background:T.cyan+"22",color:T.cyan,border:`1px solid ${T.cyan}44`,
                    borderRadius:9,padding:"9px 18px",fontWeight:900,fontSize:10,cursor:"pointer",fontFamily:"inherit",
                    display:"flex",alignItems:"center",gap:5}}>
                    <BarChart size={11}/>Trade Stocks
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ MARKET HEATMAP ══ */}
          {navTab==="heatmap"&&(
            <MarketHeatmap/>
          )}

          {/* ══ COMMUNITY INSIGHTS ══ */}
          {navTab==="community"&&(
            <CommunityPanel/>
          )}
        </main>
      </div>

      <footer style={{background:T.surface,borderTop:`1px solid ${T.border}`,padding:"5px 20px",
        display:"flex",justifyContent:"space-between",fontSize:8,color:T.muted}}>
        <span>MarketMind AI Terminal v8.0 · Zerodha Kite · Upstox Pro · Angel One · StockEdge · 5paisa · Paper Trading Only · Not SEBI Registered</span>
        <span style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:T.emerald,display:"inline-block"}}/>
          All systems nominal · Latency {randI(1,4)}ms · {new Date().toLocaleTimeString("en-IN")}
        </span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800;900&display=swap');
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(16,185,129,0.4)}50%{opacity:0.5;box-shadow:0 0 0 5px rgba(16,185,129,0)}}
        @keyframes fadeIn{0%{opacity:0;transform:translateY(-6px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes growwPulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,208,156,0.35)}50%{opacity:0.7;box-shadow:0 0 0 6px rgba(0,208,156,0)}}
        *{box-sizing:border-box;transition:background-color 0.25s ease,border-color 0.25s ease,color 0.2s ease;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${T.bg}}
        ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:${G.growwGreen}55}
      `}</style>
    </div>
    </ThemeContext.Provider>
  );
}
