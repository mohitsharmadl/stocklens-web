const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8091";

export interface Condition {
  field: string;
  op: string;
  value: string | number;
}

export interface ScreenerResult {
  symbol: string;
  name: string;
  sector?: string;
  close: number | null;
  change_pct: number | null;
  volume: number | null;
  vol_spike: number | null;
  rsi14: number | null;
  ema9: number | null;
  ema20: number | null;
  ema50: number | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  macd: number | null;
  macd_signal: number | null;
  adx14: number | null;
  atr14: number | null;
  supertrend: number | null;
  supertrend_dir: number | null;
  high_52w: number | null;
  low_52w: number | null;
}

export interface ScreenerResponse {
  count: number;
  date: string;
  results: ScreenerResult[];
}

export interface SavedScreener {
  id: number;
  name: string;
  conditions: Condition[];
  created_at: string;
  updated_at: string;
}

export interface Stock {
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  is_fno: boolean;
  market_cap?: number;
}

export interface StockDetail extends Stock {
  latest_indicators?: ScreenerResult;
  recent_data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export async function runScreener(conditions: Condition[]): Promise<ScreenerResponse> {
  const res = await fetch(`${API_BASE}/api/screener/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conditions }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Screener query failed");
  }
  return res.json();
}

export async function saveScreener(name: string, conditions: Condition[]): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/api/screeners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, conditions }),
  });
  if (!res.ok) throw new Error("Save failed");
  return res.json();
}

export async function listScreeners(): Promise<SavedScreener[]> {
  const res = await fetch(`${API_BASE}/api/screeners`);
  if (!res.ok) throw new Error("Failed to load screeners");
  return res.json();
}

export async function getScreener(id: number): Promise<SavedScreener> {
  const res = await fetch(`${API_BASE}/api/screeners/${id}`);
  if (!res.ok) throw new Error("Screener not found");
  return res.json();
}

export async function listStocks(page = 1, q = ""): Promise<{ stocks: Stock[]; total: number }> {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  const res = await fetch(`${API_BASE}/api/stocks?${params}`);
  if (!res.ok) throw new Error("Failed to load stocks");
  return res.json();
}

export async function getStock(symbol: string): Promise<StockDetail> {
  const res = await fetch(`${API_BASE}/api/stocks/${symbol}`);
  if (!res.ok) throw new Error("Stock not found");
  return res.json();
}

// Field definitions for the screener builder
export const FIELD_CATEGORIES = [
  {
    label: "Price",
    fields: [
      { value: "close", label: "Close" },
      { value: "open", label: "Open" },
      { value: "high", label: "High" },
      { value: "low", label: "Low" },
      { value: "change_pct", label: "Change %" },
    ],
  },
  {
    label: "Moving Averages",
    fields: [
      { value: "ema9", label: "EMA 9" },
      { value: "ema20", label: "EMA 20" },
      { value: "ema50", label: "EMA 50" },
      { value: "ema100", label: "EMA 100" },
      { value: "ema200", label: "EMA 200" },
      { value: "sma20", label: "SMA 20" },
      { value: "sma50", label: "SMA 50" },
      { value: "sma200", label: "SMA 200" },
    ],
  },
  {
    label: "Oscillators",
    fields: [
      { value: "rsi14", label: "RSI (14)" },
      { value: "macd", label: "MACD" },
      { value: "macd_signal", label: "MACD Signal" },
      { value: "macd_hist", label: "MACD Histogram" },
      { value: "adx14", label: "ADX (14)" },
      { value: "plus_di", label: "+DI" },
      { value: "minus_di", label: "-DI" },
    ],
  },
  {
    label: "Volatility",
    fields: [
      { value: "atr14", label: "ATR (14)" },
      { value: "bb_upper", label: "BB Upper" },
      { value: "bb_middle", label: "BB Middle" },
      { value: "bb_lower", label: "BB Lower" },
      { value: "supertrend", label: "Supertrend" },
      { value: "supertrend_dir", label: "Supertrend Dir" },
    ],
  },
  {
    label: "Volume",
    fields: [
      { value: "volume", label: "Volume" },
      { value: "vol_spike", label: "Volume Spike (x avg)" },
      { value: "vol_avg20", label: "Vol Avg 20" },
    ],
  },
  {
    label: "Price Levels",
    fields: [
      { value: "high_52w", label: "52W High" },
      { value: "low_52w", label: "52W Low" },
      { value: "high_20d", label: "20D High" },
      { value: "low_20d", label: "20D Low" },
    ],
  },
];

export const ALL_FIELDS = FIELD_CATEGORIES.flatMap((c) => c.fields);

export const OPERATORS = [
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "=", label: "=" },
  { value: "!=", label: "!=" },
  { value: "crossed_above", label: "Crossed Above" },
  { value: "crossed_below", label: "Crossed Below" },
];

export const PRESET_SCREENERS: { name: string; conditions: Condition[] }[] = [
  {
    name: "Bullish",
    conditions: [
      { field: "close", op: ">", value: "ema20" },
      { field: "ema20", op: ">", value: "ema50" },
      { field: "rsi14", op: ">", value: 50 },
      { field: "macd", op: ">", value: "macd_signal" },
      { field: "supertrend_dir", op: "=", value: 1 },
      { field: "vol_spike", op: ">", value: 1.2 },
    ],
  },
  {
    name: "Bearish",
    conditions: [
      { field: "close", op: "<", value: "ema20" },
      { field: "ema20", op: "<", value: "ema50" },
      { field: "rsi14", op: "<", value: 50 },
      { field: "macd", op: "<", value: "macd_signal" },
      { field: "supertrend_dir", op: "=", value: -1 },
      { field: "change_pct", op: "<", value: 0 },
    ],
  },
  {
    name: "Volume Breakout",
    conditions: [
      { field: "vol_spike", op: ">", value: 2 },
      { field: "change_pct", op: ">", value: 0 },
    ],
  },
  {
    name: "Oversold RSI",
    conditions: [{ field: "rsi14", op: "<", value: 30 }],
  },
  {
    name: "Golden Cross (EMA50 x EMA200)",
    conditions: [{ field: "ema50", op: "crossed_above", value: "ema200" }],
  },
  {
    name: "Near 52W High",
    conditions: [
      { field: "close", op: ">", value: "high_52w" },
    ],
  },
  {
    name: "Supertrend Buy Signal",
    conditions: [
      { field: "supertrend_dir", op: "=", value: 1 },
      { field: "prev_supertrend_dir", op: "=", value: -1 },
    ],
  },
];
