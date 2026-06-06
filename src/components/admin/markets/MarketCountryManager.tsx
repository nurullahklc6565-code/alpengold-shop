"use client";

import { useState, useTransition } from "react";
import { addCountryToMarketAction, removeCountryFromMarketAction } from "@/server/actions/admin/market";
import { X, Plus } from "lucide-react";

type Country = {
  id: string;
  name: string;
  codeIso2: string;
  flagEmoji: string | null;
};

type AssignedCountry = {
  countryId: string;
  country: Country;
};

type Props = {
  marketId: string;
  assignedCountries: AssignedCountry[];
  allActiveCountries: Country[];
};

export function MarketCountryManager({ marketId, assignedCountries, allActiveCountries }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [selectedId, setSelectedId] = useState("");

  const assignedIds = new Set(assignedCountries.map((ac) => ac.countryId));
  const available = allActiveCountries.filter((c) => !assignedIds.has(c.id));

  function handleAdd() {
    if (!selectedId) return;
    setError(undefined);
    startTransition(async () => {
      const result = await addCountryToMarketAction(marketId, selectedId);
      if (result.error) setError(result.error);
      else setSelectedId("");
    });
  }

  function handleRemove(countryId: string) {
    startTransition(() => removeCountryFromMarketAction(marketId, countryId));
  }

  return (
    <div>
      <div className="mb-3 flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Ülke Ekle</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            disabled={isPending || available.length === 0}
          >
            <option value="">
              {available.length === 0 ? "Eklenecek ülke kalmadı" : "Ülke seçin…"}
            </option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flagEmoji} {c.name} ({c.codeIso2})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedId || isPending}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ekle
        </button>
      </div>

      {error && (
        <p className="mb-2 text-xs text-red-600">{error}</p>
      )}

      {assignedCountries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
          Bu pazara henüz ülke atanmadı.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {assignedCountries.map(({ countryId, country }) => (
            <div
              key={countryId}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 pl-3 pr-1 py-1 text-sm text-gray-700"
            >
              <span>{country.flagEmoji ?? "🏳"}</span>
              <span className="font-medium">{country.name}</span>
              <span className="text-gray-400">({country.codeIso2})</span>
              <button
                type="button"
                onClick={() => handleRemove(countryId)}
                disabled={isPending}
                className="ml-1 flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
