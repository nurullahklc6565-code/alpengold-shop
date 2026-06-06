"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";

type Country = { id: string; name: string; codeIso2: string; flagEmoji: string | null };
type Props = {
  zoneId: string;
  assignedCountries: Country[];
  availableCountries: Country[];
  addAction: (zoneId: string, countryId: string) => Promise<{ error?: string }>;
  removeAction: (zoneId: string, countryId: string) => Promise<void>;
};

export function ZoneCountryManager({ zoneId, assignedCountries, availableCountries, addAction, removeAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [selectedId, setSelectedId] = useState("");

  function handleAdd() {
    if (!selectedId) return;
    setError(undefined);
    startTransition(async () => {
      const result = await addAction(zoneId, selectedId);
      if (result.error) setError(result.error);
      else setSelectedId("");
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-end gap-2">
        <div className="flex-1">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={isPending || availableCountries.length === 0}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          >
            <option value="">
              {availableCountries.length === 0
                ? "Tüm pazar ülkeleri atandı"
                : "Ülke seçin…"}
            </option>
            {availableCountries.map((c) => (
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
          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Ekle
        </button>
      </div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {assignedCountries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
          Henüz ülke atanmadı.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {assignedCountries.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 rounded-full bg-gray-100 pl-3 pr-1 py-1 text-sm text-gray-700">
              <span>{c.flagEmoji ?? "🏳"}</span>
              <span className="font-medium">{c.name}</span>
              <span className="text-gray-400">({c.codeIso2})</span>
              <button
                type="button"
                onClick={() => startTransition(() => removeAction(zoneId, c.id))}
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
