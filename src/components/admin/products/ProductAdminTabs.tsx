"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type Tab = { id: string; label: string; count?: number };
type Props = { tabs: Tab[]; children: ReactNode[] };

export function ProductAdminTabs({ tabs, children }: Props) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <div>
      {/* Tab başlıkları */}
      <div className="flex gap-0.5 overflow-x-auto border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              active === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                active === tab.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab içerikleri */}
      {tabs.map((tab, i) => (
        <div key={tab.id} className={active === tab.id ? "block" : "hidden"}>
          {children[i]}
        </div>
      ))}
    </div>
  );
}
