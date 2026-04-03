"""
MarketMind AI — Strategy Backtester Engine
Quant-grade Python backtest with RSI, SMA, MACD, BB indicators.
Outputs JSON consumed by React StrategyBacktester component.
"""

import pandas as pd
import numpy as np
import json

# ── INDICATOR LIBRARY ─────────────────────────────────────────────────────────

def calc_rsi(series, period=14):
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))

def calc_sma(series, period):
    return series.rolling(period).mean()

def calc_ema(series, period):
    return series.ewm(span=period, adjust=False).mean()

def calc_macd(series, fast=12, slow=26, signal=9):
    macd_line = calc_ema(series, fast) - calc_ema(series, slow)
    signal_line = calc_ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram

def calc_bollinger(series, period=20, std_dev=2):
    sma = calc_sma(series, period)
    std = series.rolling(period).std()
    upper = sma + std_dev * std
    lower = sma - std_dev * std
    return upper, sma, lower

# ── BACKTEST ENGINE ───────────────────────────────────────────────────────────

def run_backtest(df, rules, initial_capital=100000):
    """
    rules: list of dicts like:
      {"indicator":"RSI","condition":"<","value":30,"action":"BUY"}
      {"indicator":"RSI","condition":">","value":70,"action":"SELL"}
    """
    df = df.copy()
    close = df["close"]

    # Compute all indicators
    df["rsi"]        = calc_rsi(close)
    df["sma20"]      = calc_sma(close, 20)
    df["sma50"]      = calc_sma(close, 50)
    df["ema9"]       = calc_ema(close, 9)
    df["macd"], df["macd_signal"], df["macd_hist"] = calc_macd(close)
    df["bb_upper"], df["bb_mid"], df["bb_lower"]   = calc_bollinger(close)
    df["volume_avg"] = calc_sma(df["volume"], 20)
    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)

    indicator_map = {
        "RSI":        "rsi",
        "SMA20":      "sma20",
        "SMA50":      "sma50",
        "EMA9":       "ema9",
        "MACD":       "macd",
        "MACD Signal":"macd_signal",
        "BB Upper":   "bb_upper",
        "BB Lower":   "bb_lower",
        "Price":      "close",
        "Volume":     "volume",
    }

    def eval_condition(row, indicator, condition, value):
        col = indicator_map.get(indicator, "close")
        v   = row[col]
        if   condition == "<":  return v < value
        elif condition == ">":  return v > value
        elif condition == "<=": return v <= value
        elif condition == ">=": return v >= value
        elif condition == "==": return abs(v - value) < 0.01
        return False

    # Separate buy / sell rules
    buy_rules  = [r for r in rules if r["action"] == "BUY"]
    sell_rules = [r for r in rules if r["action"] == "SELL"]

    # If no sell rule defined, default to RSI > 70 exit
    if not sell_rules:
        sell_rules = [{"indicator":"RSI","condition":">","value":70,"action":"SELL"}]

    capital     = initial_capital
    shares      = 0
    entry_price = 0
    position    = False
    trades      = []
    equity_curve = []
    buy_hold_start = df["close"].iloc[0]

    for i, row in df.iterrows():
        price = row["close"]
        date  = row["date"]

        if not position:
            # Check all buy rules (AND logic)
            buy_signal = all(eval_condition(row, r["indicator"], r["condition"], r["value"]) for r in buy_rules)
            if buy_signal and capital > price:
                shares = int(capital * 0.95 / price)  # invest 95% of capital
                if shares > 0:
                    cost        = shares * price
                    capital    -= cost
                    entry_price = price
                    position    = True
                    entry_date  = date
        else:
            # Check all sell rules (OR logic — exit on any)
            sell_signal = any(eval_condition(row, r["indicator"], r["condition"], r["value"]) for r in sell_rules)
            if sell_signal:
                proceeds  = shares * price
                pnl       = proceeds - shares * entry_price
                pnl_pct   = (price - entry_price) / entry_price * 100
                capital  += proceeds
                trades.append({
                    "entry_date": entry_date,
                    "exit_date":  date,
                    "entry_price": round(entry_price, 2),
                    "exit_price":  round(price, 2),
                    "shares":      shares,
                    "pnl":         round(pnl, 2),
                    "pnl_pct":     round(pnl_pct, 2),
                    "result":      "WIN" if pnl > 0 else "LOSS",
                })
                shares   = 0
                position = False

        total_equity   = capital + (shares * price)
        buy_hold_value = (price / buy_hold_start) * initial_capital
        equity_curve.append({
            "date":      date,
            "strategy":  round(total_equity, 2),
            "buyhold":   round(buy_hold_value, 2),
            "rsi":       round(row["rsi"], 2) if not np.isnan(row["rsi"]) else None,
            "price":     round(price, 2),
        })

    # Close open position at end
    if position:
        price    = df["close"].iloc[-1]
        proceeds = shares * price
        pnl      = proceeds - shares * entry_price
        pnl_pct  = (price - entry_price) / entry_price * 100
        capital += proceeds
        trades.append({
            "entry_date":  entry_date,
            "exit_date":   df["date"].iloc[-1],
            "entry_price": round(entry_price, 2),
            "exit_price":  round(price, 2),
            "shares":      shares,
            "pnl":         round(pnl, 2),
            "pnl_pct":     round(pnl_pct, 2),
            "result":      "WIN" if pnl > 0 else "LOSS",
        })

    final_equity = capital + (shares * df["close"].iloc[-1] if position else 0)

    # ── METRICS ───────────────────────────────────────────────────────────────
    total_trades  = len(trades)
    wins          = sum(1 for t in trades if t["result"] == "WIN")
    win_rate      = (wins / total_trades * 100) if total_trades else 0
    net_profit    = final_equity - initial_capital
    net_profit_pct= (net_profit / initial_capital) * 100

    buy_hold_ret  = (df["close"].iloc[-1] / df["close"].iloc[0] - 1) * 100

    # Max Drawdown
    eq_vals    = [e["strategy"] for e in equity_curve]
    peak       = initial_capital
    max_dd     = 0.0
    for v in eq_vals:
        if v > peak: peak = v
        dd = (peak - v) / peak * 100
        if dd > max_dd: max_dd = dd

    # Sharpe Ratio (annualised, simplified)
    daily_returns = pd.Series(eq_vals).pct_change().dropna()
    sharpe = (daily_returns.mean() / daily_returns.std() * np.sqrt(252)) if daily_returns.std() > 0 else 0

    # Avg Win / Avg Loss
    win_pnls  = [t["pnl"] for t in trades if t["result"] == "WIN"]
    loss_pnls = [t["pnl"] for t in trades if t["result"] == "LOSS"]
    avg_win   = np.mean(win_pnls)  if win_pnls  else 0
    avg_loss  = np.mean(loss_pnls) if loss_pnls else 0
    profit_factor = abs(sum(win_pnls) / sum(loss_pnls)) if loss_pnls and sum(loss_pnls) != 0 else 999

    # Sample equity curve (every 5th point to keep JSON lean)
    sampled_curve = equity_curve[::2]

    result = {
        "metrics": {
            "net_profit":       round(net_profit, 2),
            "net_profit_pct":   round(net_profit_pct, 2),
            "buy_hold_ret":     round(buy_hold_ret, 2),
            "win_rate":         round(win_rate, 2),
            "total_trades":     total_trades,
            "wins":             wins,
            "losses":           total_trades - wins,
            "max_drawdown":     round(max_dd, 2),
            "sharpe":           round(sharpe, 3),
            "avg_win":          round(avg_win, 2),
            "avg_loss":         round(avg_loss, 2),
            "profit_factor":    round(profit_factor, 3),
            "initial_capital":  initial_capital,
            "final_equity":     round(final_equity, 2),
            "start_date":       df["date"].iloc[0],
            "end_date":         df["date"].iloc[-1],
        },
        "trades":       trades,
        "equity_curve": sampled_curve,
    }
    return result

# ── RUN DEFAULT STRATEGIES ─────────────────────────────────────────────────────

df = pd.read_csv("/home/claude/reliance_data.csv")

strategies = {
    "RSI Oversold Bounce": [
        {"indicator":"RSI","condition":"<","value":35,"action":"BUY"},
        {"indicator":"RSI","condition":">","value":65,"action":"SELL"},
    ],
    "SMA Golden Cross": [
        {"indicator":"SMA20","condition":">","value":0,"action":"BUY"},   # placeholder — handled below
    ],
    "MACD Crossover": [
        {"indicator":"MACD","condition":">","value":0,"action":"BUY"},
        {"indicator":"MACD","condition":"<","value":0,"action":"SELL"},
    ],
    "Bollinger Band Mean Reversion": [
        {"indicator":"Price","condition":"<","value":0,"action":"BUY"},    # placeholder
    ],
}

# Run RSI strategy as the primary one
rsi_result = run_backtest(df, [
    {"indicator":"RSI","condition":"<","value":35,"action":"BUY"},
    {"indicator":"RSI","condition":">","value":65,"action":"SELL"},
])

macd_result = run_backtest(df, [
    {"indicator":"MACD","condition":">","value":0,"action":"BUY"},
    {"indicator":"MACD","condition":"<","value":0,"action":"SELL"},
])

# Pre-computed results for 4 presets the UI will show
all_results = {
    "RSI Oversold Bounce":            rsi_result,
    "MACD Crossover":                 macd_result,
}

print("=== RSI Strategy Metrics ===")
m = rsi_result["metrics"]
print(f"  Net Profit:   ₹{m['net_profit']:,.2f}  ({m['net_profit_pct']:+.2f}%)")
print(f"  Buy & Hold:   {m['buy_hold_ret']:+.2f}%")
print(f"  Win Rate:     {m['win_rate']:.1f}%  ({m['wins']}W / {m['losses']}L)")
print(f"  Max Drawdown: {m['max_drawdown']:.2f}%")
print(f"  Sharpe:       {m['sharpe']:.3f}")
print(f"  Trades:       {m['total_trades']}")
print(f"  Profit Factor:{m['profit_factor']}")
print(f"\n=== MACD Strategy Metrics ===")
m2 = macd_result["metrics"]
print(f"  Net Profit:   ₹{m2['net_profit']:,.2f}  ({m2['net_profit_pct']:+.2f}%)")
print(f"  Win Rate:     {m2['win_rate']:.1f}%")
print(f"  Max Drawdown: {m2['max_drawdown']:.2f}%")

# Save JSON for reference
with open("/home/claude/backtest_results.json", "w") as f:
    json.dump(rsi_result, f, indent=2)

print("\nSaved to backtest_results.json")
