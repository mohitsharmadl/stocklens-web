"use client";

import { useState } from "react";
import {
  Condition,
  ScreenerResponse,
  runScreener,
  saveScreener,
  PRESET_SCREENERS,
} from "@/lib/api";
import ConditionRow from "./ConditionRow";
import ResultsTable from "./ResultsTable";

export default function ScreenerBuilder() {
  const [conditions, setConditions] = useState<Condition[]>(
    PRESET_SCREENERS[0].conditions.map((c) => ({ ...c }))
  );
  const [results, setResults] = useState<ScreenerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveName, setSaveName] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  const updateCondition = (idx: number, c: Condition) => {
    setConditions((prev) => prev.map((p, i) => (i === idx ? c : p)));
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, { field: "rsi14", op: "<", value: 30 }]);
  };

  const removeCondition = (idx: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRun = async () => {
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await runScreener(conditions);
      setResults(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Query failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveName.trim()) return;
    try {
      const { id } = await saveScreener(saveName.trim(), conditions);
      setSaveMsg(`Saved as #${id}`);
      setSaveName("");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Save failed");
    }
  };

  const loadPreset = (preset: (typeof PRESET_SCREENERS)[0]) => {
    setConditions(preset.conditions.map((c) => ({ ...c })));
    setResults(null);
  };

  return (
    <div>
      {/* Preset screeners */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Quick Presets
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCREENERS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className="text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Condition builder */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="text-lg font-semibold mb-3">Conditions</h2>
        {conditions.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-xs text-gray-400 font-medium w-8">AND</span>
            )}
            {i === 0 && <span className="w-8" />}
            <ConditionRow
              condition={c}
              onChange={(updated) => updateCondition(i, updated)}
              onRemove={() => removeCondition(i)}
              canRemove={conditions.length > 1}
            />
          </div>
        ))}

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={addCondition}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Condition
          </button>

          <button
            onClick={handleRun}
            disabled={loading}
            className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Running..." : "Run Screener"}
          </button>
        </div>
      </div>

      {/* Save screener */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Screener name..."
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button
          onClick={handleSave}
          disabled={!saveName.trim()}
          className="text-sm px-4 py-1.5 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          Save
        </button>
        {saveMsg && (
          <span className="text-sm text-green-600">{saveMsg}</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results && <ResultsTable response={results} />}
    </div>
  );
}
