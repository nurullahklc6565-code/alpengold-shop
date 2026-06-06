"use client";

import { useActionState } from "react";
import { createMarketAction, updateMarketAction, type MarketActionState } from "@/server/actions/admin/market";
import type { Currency, Market } from "@prisma/client";

type Props = {
  currencies: Currency[];
  market?: Market | null;
  onSuccess?: () => void;
};

const FALLBACK_OPTIONS = [
  { value: "BLOCK", label: "Satışa Kapat — Bu pazarda fiyat yoksa ürün satılmasın" },
  { value: "USE_BASE_PRICE", label: "Temel Fiyatı Kullan — variant.base_price kullan" },
  { value: "USE_DEFAULT", label: "Varsayılan Pazarı Kullan — varsayılan pazarın fiyatını kullan" },
] as const;

const initialState: MarketActionState = {};

export function MarketForm({ currencies, market, onSuccess }: Props) {
  const action = market
    ? updateMarketAction.bind(null, market.id)
    : createMarketAction;

  const [state, formAction, isPending] = useActionState(action, initialState);

  if (state.success && onSuccess) onSuccess();

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {market ? "Pazar güncellendi." : "Pazar oluşturuldu."}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pazar Adı *</label>
          <input
            name="name"
            defaultValue={market?.name ?? ""}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Örn: Avrupa, Türkiye, Kuzey Amerika"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            name="slug"
            defaultValue={market?.slug ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Boş bırakılırsa otomatik oluşturulur"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Varsayılan Para Birimi *</label>
          <select
            name="defaultCurrencyId"
            defaultValue={market?.defaultCurrencyId ?? ""}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Para birimi seçin…</option>
            {currencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name} ({c.symbol})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Bu pazarda ödeme bu para birimiyle alınır.
          </p>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat Bulunamazsa</label>
          <select
            name="fallbackPricing"
            defaultValue={market?.fallbackPricing ?? "BLOCK"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {FALLBACK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="active"
              value="true"
              defaultChecked={market?.active ?? true}
              className="rounded border-gray-300"
            />
            Aktif
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="isDefault"
              value="true"
              defaultChecked={market?.isDefault ?? false}
              className="rounded border-gray-300"
            />
            Varsayılan Pazar
          </label>
          <p className="mt-0.5 text-xs text-gray-400 pl-5">
            Ülkeye eşleşme yoksa bu pazar kullanılır.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
        >
          {isPending ? "Kaydediliyor…" : market ? "Güncelle" : "Pazar Oluştur"}
        </button>
      </div>
    </form>
  );
}
