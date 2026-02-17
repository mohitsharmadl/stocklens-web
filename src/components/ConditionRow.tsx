"use client";

import { Condition, FIELD_CATEGORIES, OPERATORS, ALL_FIELDS } from "@/lib/api";

interface Props {
  condition: Condition;
  onChange: (c: Condition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function ConditionRow({
  condition,
  onChange,
  onRemove,
  canRemove,
}: Props) {
  const isFieldValue = ALL_FIELDS.some((f) => f.value === condition.value);
  const isCrossover =
    condition.op === "crossed_above" || condition.op === "crossed_below";

  return (
    <div className="flex items-center gap-2 py-2">
      {/* Field selector */}
      <select
        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[160px]"
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value })}
      >
        {FIELD_CATEGORIES.map((cat) => (
          <optgroup key={cat.label} label={cat.label}>
            {cat.fields.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Operator */}
      <select
        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[130px]"
        value={condition.op}
        onChange={(e) => {
          const newOp = e.target.value;
          const newCond = { ...condition, op: newOp };
          // If switching to crossover, default value to a field
          if (
            (newOp === "crossed_above" || newOp === "crossed_below") &&
            typeof condition.value === "number"
          ) {
            newCond.value = "ema20";
          }
          onChange(newCond);
        }}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {/* Value: either a number input or field dropdown */}
      <div className="flex items-center gap-1">
        {!isCrossover && (
          <button
            type="button"
            className={`text-xs px-2 py-1 rounded ${
              !isFieldValue
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-500"
            }`}
            onClick={() => {
              if (isFieldValue) {
                onChange({ ...condition, value: 0 });
              }
            }}
          >
            #
          </button>
        )}
        {!isCrossover && (
          <button
            type="button"
            className={`text-xs px-2 py-1 rounded ${
              isFieldValue
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-500"
            }`}
            onClick={() => {
              if (!isFieldValue) {
                onChange({ ...condition, value: "ema20" });
              }
            }}
          >
            Field
          </button>
        )}

        {isFieldValue || isCrossover ? (
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[140px]"
            value={String(condition.value)}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
          >
            {FIELD_CATEGORIES.map((cat) => (
              <optgroup key={cat.label} label={cat.label}>
                {cat.fields.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        ) : (
          <input
            type="number"
            step="any"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[120px]"
            value={condition.value}
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...condition,
                value: v === "" ? 0 : parseFloat(v),
              });
            }}
          />
        )}
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed px-2 text-lg"
      >
        &times;
      </button>
    </div>
  );
}
