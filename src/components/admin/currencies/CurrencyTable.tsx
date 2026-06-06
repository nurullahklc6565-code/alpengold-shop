"use client";

import { useState } from "react";
import { toggleCurrencyActive } from "@/server/actions/admin/currency";
import { ToggleActiveButton } from "@/components/admin/ui/ToggleActiveButton";
import { cn } from "@/lib/utils/cn";

type CurrencyRow = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
  active: boolean;
  _count: { markets: number };
};

type Props = {
  currencies: CurrencyRow[];
  total: number;
};

export function CurrencyTable({ currencies, total }: Props) {
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const filtered = currencies.filter((c) => {
    const matchSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && c.active) ||
      (filterActive === "inactive" && !c.active);
    return matchSearch && matchActive;
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Kod, ad, sembol ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <div className="flex rounded-lg border border-gray-200 bg-white text-sm overflow-hidden">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={cn(
                "px-3 py-1.5 transition-colors",
                filterActive === f ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {f === "all" ? "Tümü" : f === "active" ? "Aktif" : "Pasif"}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">{filtered.length} / {total} para birimi</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Kod</th>
              <th className="px-4 py-3 text-left">Ad</th>
              <th className="px-4 py-3 text-left">Sembol</th>
              <th className="px-4 py-3 text-left">Ondalık</th>
              <th className="px-4 py-3 text-left">Pazarlar</th>
              <th className="px-4 py-3 text-left">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((currency) => (
              <tr key={currency.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-700">
                    {currency.code}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{currency.name}</td>
                <td className="px-4 py-3 font-mono text-gray-600">{currency.symbol}</td>
                <td className="px-4 py-3 text-gray-600">{currency.decimalDigits} basamak</td>
                <td className="px-4 py-3">
                  {currency._count.markets > 0 ? (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                      {currency._count.markets} pazar
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ToggleActiveButton
                    id={currency.id}
                    active={currency.active}
                    onToggle={toggleCurrencyActive}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">Sonuç bulunamadı.</div>
        )}
      </div>
    </div>
  );
}
