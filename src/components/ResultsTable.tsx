"use client";

import { useState } from "react";
import { ScreenerResponse, ScreenerResult } from "@/lib/api";

type SortKey = keyof ScreenerResult;

interface Props {
  response: ScreenerResponse;
}

export default function ResultsTable({ response }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "symbol");
    }
  };

  const sorted = [...response.results].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string") {
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    const na = Number(av);
    const nb = Number(bv);
    return sortAsc ? na - nb : nb - na;
  });

  const exportCSV = () => {
    const headers = [
      "Symbol",
      "Name",
      "Close",
      "Change%",
      "Volume",
      "Vol Spike",
      "RSI14",
      "EMA20",
      "EMA50",
      "MACD",
      "ADX14",
    ];
    const rows = sorted.map((r) =>
      [
        r.symbol,
        r.name,
        r.close,
        r.change_pct,
        r.volume,
        r.vol_spike,
        r.rsi14,
        r.ema20,
        r.ema50,
        r.macd,
        r.adx14,
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screener_${response.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (v: number | null | undefined, dec = 2) =>
    v != null ? v.toFixed(dec) : "-";

  const fmtVol = (v: number | null | undefined) => {
    if (v == null) return "-";
    if (v >= 1e7) return (v / 1e7).toFixed(2) + "Cr";
    if (v >= 1e5) return (v / 1e5).toFixed(2) + "L";
    return v.toLocaleString();
  };

  const columns: { key: SortKey; label: string; align?: string }[] = [
    { key: "symbol", label: "Symbol" },
    { key: "close", label: "Close", align: "right" },
    { key: "change_pct", label: "Chg%", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
    { key: "vol_spike", label: "Vol Spike", align: "right" },
    { key: "rsi14", label: "RSI", align: "right" },
    { key: "ema20", label: "EMA20", align: "right" },
    { key: "ema50", label: "EMA50", align: "right" },
    { key: "macd", label: "MACD", align: "right" },
    { key: "adx14", label: "ADX", align: "right" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">
          Results &mdash; {response.count} stocks
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({response.date})
          </span>
        </h2>
        <button
          onClick={exportCSV}
          className="text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortAsc ? "\u25B2" : "\u25BC"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.symbol}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                onClick={() => window.open(`/stock/${r.symbol}`, "_blank")}
              >
                <td className="px-3 py-2 font-medium text-blue-600">
                  {r.symbol}
                </td>
                <td className="px-3 py-2 text-right">{fmt(r.close)}</td>
                <td
                  className={`px-3 py-2 text-right font-medium ${
                    (r.change_pct ?? 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {fmt(r.change_pct)}%
                </td>
                <td className="px-3 py-2 text-right">{fmtVol(r.volume)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.vol_spike, 1)}x</td>
                <td className="px-3 py-2 text-right">{fmt(r.rsi14, 1)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.ema20)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.ema50)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.macd, 4)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.adx14, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No stocks match your conditions
          </div>
        )}
      </div>
    </div>
  );
}
