"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function QuantitySelector({ value, onChange, min = 1, max, disabled }: Props) {
  const clampedMax = max !== undefined ? Math.min(max, 100) : 100;

  return (
    <div className="flex items-center border border-[#e5e5e5] w-fit">
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-10 w-10 items-center justify-center text-[#525252] hover:bg-[#f5f5f5] disabled:opacity-40 transition-colors border-r border-[#e5e5e5]"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-10 text-center text-[13px] font-semibold text-[#0a0a0a] select-none">
        {value}
      </span>
      <button
        type="button"
        disabled={disabled || value >= clampedMax}
        onClick={() => onChange(Math.min(clampedMax, value + 1))}
        className="flex h-10 w-10 items-center justify-center text-[#525252] hover:bg-[#f5f5f5] disabled:opacity-40 transition-colors border-l border-[#e5e5e5]"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
