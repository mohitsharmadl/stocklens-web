"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStock, StockDetail } from "@/lib/api";

export default function StockPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!symbol) return;
    getStock(symbol)
      .then(setStock)
      .catch(() => setError("Stock not found"));
  }, [symbol]);

  if (error) {
    return (
      <div className="text-center py-12 text-gray-400">{error}</div>
    );
  }

  if (!stock) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  const ind = stock.latest_indicators;
  const fmt = (v: number | null | undefined, dec = 2) =>
    v != null ? v.toFixed(dec) : "-";

  const fmtVol = (v: number | null | undefined) => {
    if (v == null) return "-";
    if (v >= 1e7) return (v / 1e7).toFixed(2) + "Cr";
    if (v >= 1e5) return (v / 1e5).toFixed(2) + "L";
    return v.toLocaleString();
  };

  const indicatorGrid = ind
    ? [
        { label: "Close", value: fmt(ind.close) },
        { label: "Change %", value: fmt(ind.change_pct) + "%" },
        { label: "Volume", value: fmtVol(ind.volume) },
        { label: "Vol Spike", value: fmt(ind.vol_spike, 1) + "x" },
        { label: "RSI (14)", value: fmt(ind.rsi14, 1) },
        { label: "EMA 9", value: fmt(ind.ema9) },
        { label: "EMA 20", value: fmt(ind.ema20) },
        { label: "EMA 50", value: fmt(ind.ema50) },
        { label: "SMA 20", value: fmt(ind.sma20) },
        { label: "SMA 50", value: fmt(ind.sma50) },
        { label: "SMA 200", value: fmt(ind.sma200) },
        { label: "MACD", value: fmt(ind.macd, 4) },
        { label: "MACD Signal", value: fmt(ind.macd_signal, 4) },
        { label: "ADX (14)", value: fmt(ind.adx14, 1) },
        { label: "ATR (14)", value: fmt(ind.atr14) },
        { label: "Supertrend", value: fmt(ind.supertrend) },
        {
          label: "Supertrend Dir",
          value:
            ind.supertrend_dir === 1
              ? "UP"
              : ind.supertrend_dir === -1
              ? "DOWN"
              : "-",
        },
        { label: "52W High", value: fmt(ind.high_52w) },
        { label: "52W Low", value: fmt(ind.low_52w) },
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{stock.symbol}</h1>
        <p className="text-gray-500 text-sm">{stock.name}</p>
        {stock.sector && (
          <p className="text-gray-400 text-xs mt-1">{stock.sector}</p>
        )}
        <div className="flex gap-2 mt-2">
          {stock.is_fno && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              F&O
            </span>
          )}
        </div>
      </div>

      {/* Indicator grid */}
      {indicatorGrid.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Latest Indicators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {indicatorGrid.map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 rounded-md px-3 py-2"
              >
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className="text-sm font-semibold mt-0.5">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent daily data */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <h2 className="text-lg font-semibold p-4 pb-2">
          Recent Daily Data
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Date
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                Open
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                High
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                Low
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                Close
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                Volume
              </th>
            </tr>
          </thead>
          <tbody>
            {stock.recent_data.map((d) => (
              <tr
                key={d.date}
                className="border-b border-gray-100"
              >
                <td className="px-3 py-2">{d.date}</td>
                <td className="px-3 py-2 text-right">{d.open.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{d.high.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{d.low.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-medium">
                  {d.close.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">{fmtVol(d.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {stock.recent_data.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No recent data available
          </div>
        )}
      </div>
    </div>
  );
}
