"use client";

import { cn } from "@/lib/utils";

type Range = 7 | 30 | 90;

interface DateRangeSelectorProps {
  value: Range;
  onChange: (range: Range) => void;
}

const options: { label: string; value: Range }[] = [
  { label: "7 días", value: 7 },
  { label: "30 días", value: 30 },
  { label: "90 días", value: 90 },
];

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
