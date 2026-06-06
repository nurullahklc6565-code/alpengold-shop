"use client";

import { useTransition, useState } from "react";
import { toggleCountryActive } from "@/server/actions/admin/country";
import { ToggleActiveButton } from "@/components/admin/ui/ToggleActiveButton";
import { cn } from "@/lib/utils/cn";

type CountryRow = {
  id: string;
  name: string;
  codeIso2: string;
  codeIso3: string;
  phoneCode: string;
  flagEmoji: string | null;
  active: boolean;
  _count: { marketCountries: number };
};

type Props = {
  countries: CountryRow[];
  total: number;
};

export function CountryTable({ countries, total }: Props) {
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const filtered = countries.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.codeIso2.toLowerCase().includes(search.toLowerCase()) ||
      c.codeIso3.toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && c.active) ||
      (filterActive === "inactive" && !c.active);
    return matchSearch && matchActive;
  });

  return (
    <div>
      {/* Filtreler */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Ülke, ISO kodu ara…"
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
        <span className="text-sm text-gray-500">{filtered.length} / {total} ülke</span>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Ülke</th>
              <th className="px-4 py-3 text-left">ISO-2</th>
              <th className="px-4 py-3 text-left">ISO-3</th>
              <th className="px-4 py-3 text-left">Tel Kodu</th>
              <th className="px-4 py-3 text-left">Pazar</th>
              <th className="px-4 py-3 text-left">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((country) => (
              <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{country.flagEmoji ?? "🏳"}</span>
                    <span className="font-medium text-gray-900">{country.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-gray-600">{country.codeIso2}</td>
                <td className="px-4 py-3 font-mono text-gray-600">{country.codeIso3}</td>
                <td className="px-4 py-3 text-gray-600">{country.phoneCode}</td>
                <td className="px-4 py-3 text-gray-600">
                  {country._count.marketCountries > 0 ? (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                      {country._count.marketCountries} pazar
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ToggleActiveButton
                    id={country.id}
                    active={country.active}
                    onToggle={toggleCountryActive}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            Sonuç bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
