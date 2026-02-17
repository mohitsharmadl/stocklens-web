"use client";

import { useEffect, useState } from "react";
import { listScreeners, SavedScreener, runScreener, ScreenerResponse } from "@/lib/api";
import ResultsTable from "@/components/ResultsTable";

export default function ResultsPage() {
  const [screeners, setScreeners] = useState<SavedScreener[]>([]);
  const [selected, setSelected] = useState<SavedScreener | null>(null);
  const [results, setResults] = useState<ScreenerResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listScreeners().then(setScreeners).catch(console.error);
  }, []);

  const handleRun = async (s: SavedScreener) => {
    setSelected(s);
    setLoading(true);
    setResults(null);
    try {
      const res = await runScreener(s.conditions);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Saved Screeners</h1>

      {screeners.length === 0 && (
        <div className="text-gray-400 text-center py-12">
          No saved screeners yet. Create one from the{" "}
          <a href="/" className="text-blue-600 underline">
            Screener Builder
          </a>
          .
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {screeners.map((s) => (
          <div
            key={s.id}
            className={`bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-400 transition-colors ${
              selected?.id === s.id
                ? "border-blue-500 ring-2 ring-blue-100"
                : "border-gray-200"
            }`}
            onClick={() => handleRun(s)}
          >
            <h3 className="font-semibold text-sm">{s.name}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {s.conditions.length} condition
              {s.conditions.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {s.conditions.map((c, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {c.field} {c.op} {c.value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400">Running screener...</div>
      )}

      {results && <ResultsTable response={results} />}
    </div>
  );
}
