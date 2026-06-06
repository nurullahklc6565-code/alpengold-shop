"use client";

import { useActionState } from "react";
import type { ShippingActionState } from "@/server/actions/admin/shipping";

type Currency = { id: string; code: string; symbol: string };
type Props = {
  createAction: (prev: ShippingActionState, formData: FormData) => Promise<ShippingActionState>;
  currencies: Currency[];
  defaultCurrencyId: string;
};
const init: ShippingActionState = {};

const CONDITION_OPTIONS = [
  { value: "FLAT", label: "Sabit Ücret" },
  { value: "BY_WEIGHT", label: "Ağırlığa Göre (kg)" },
  { value: "BY_ORDER_PRICE", label: "Sipariş Tutarına Göre" },
  { value: "BY_QUANTITY", label: "Adete Göre" },
];

export function RateCreateForm({ createAction, currencies, defaultCurrencyId }: Props) {
  const [state, formAction, isPending] = useActionState(createAction, init);
  return (
    <form action={formAction} className="space-y-3">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">Oran eklendi.</p>}

      <input name="name" required placeholder="Oran adı (örn: Standart Kargo)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Koşul Türü</label>
          <select name="conditionType" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            {CONDITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Para Birimi</label>
          <select name="currencyId" defaultValue={defaultCurrencyId} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            {currencies.map((c) => <option key={c.id} value={c.id}>{c.code} ({c.symbol})</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Min Değer</label>
          <input name="minValue" type="number" step="0.01" min="0" placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Max Değer</label>
          <input name="maxValue" type="number" step="0.01" min="0" placeholder="∞" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ücret *</label>
          <input name="rate" type="number" step="0.01" min="0" required defaultValue="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Ücretsiz Kargo Eşiği</label>
        <input name="freeAbove" type="number" step="0.01" min="0" placeholder="Doldurma = eşik yok" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        <p className="mt-0.5 text-xs text-gray-400">Sipariş bu tutarın üzerindeyse kargo ücretsiz olur.</p>
      </div>

      <button type="submit" disabled={isPending} className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
        {isPending ? "Ekleniyor…" : "Oran Ekle"}
      </button>
    </form>
  );
}
