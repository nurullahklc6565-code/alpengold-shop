"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Item = { title: string; body: string; defaultOpen?: boolean };
type Props = { items: Item[] };

export function ProductDescriptionAccordion({ items }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(
    items.findIndex((i) => i.defaultOpen) ?? null
  );

  return (
    <div className="divide-y divide-[#e5e5e5] border-b border-[#e5e5e5]">
      {items.map((item, i) => {
        const open = openIdx === i;
        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="text-[13px] font-semibold text-[#0a0a0a]">{item.title}</span>
              {open
                ? <Minus className="h-4 w-4 shrink-0 text-[#a3a3a3]" strokeWidth={1.5} />
                : <Plus  className="h-4 w-4 shrink-0 text-[#a3a3a3]" strokeWidth={1.5} />
              }
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                open ? "max-h-[600px] pb-4 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <p className="text-[13px] text-[#525252] leading-relaxed whitespace-pre-wrap">
                {item.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
