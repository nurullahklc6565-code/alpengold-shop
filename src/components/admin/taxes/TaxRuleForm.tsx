"use client";

import { useActionState } from "react";
import type { TaxActionState } from "@/server/actions/admin/tax";

type Country = { id: string; name: string; codeIso2: string; flagEmoji: string | null };
type Market = { id: string; name: string };
type Props = {
  createAction: (prev: TaxActionState, formData: FormData) => Promise<TaxActionState>;
  countries: Country[];
  markets: Market[];
};
const init: TaxActionState = {};

const TAX_CLASSES = [
  { value: "standard", label: "Standart" },
  { value: "reduced", label: "İndirimli" },
  { value: "zero", label: "Sıfır Oranlı" },
  { value: "exempt", label: "Muaf" },
];

export function TaxRuleForm({ createAction, countries, markets }: Props) {
  const [state, formAction, isPending] = useActionState(createAction, init);
  return (
    <form action={formAction} className="space-y-3">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">Vergi kuralı oluşturuldu.</p>}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Kural Adı *</label>
        <input name="name" required placeholder="Örn: Türkiye KDV %20" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ülke *</label>
          <select name="countryId" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            <option value="">Ülke seçin…</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.flagEmoji} {c.name} ({c.codeIso2})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Pazar (opsiyonel)</label>
          <select name="marketId" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            <option value="">— Tüm Pazarlar —</option>
            {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Oran * (0–1)</label>
          <input name="rate" type="number" step="0.01" min="0" max="1" required placeholder="0.20" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          <p className="text-xs text-gray-400 mt-0.5">0.20 = %20</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Vergi Sınıfı</label>
          <select name="taxClass" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            {TAX_CLASSES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Dahil/Ek</label>
          <select name="inclusionType" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            <option value="EXCLUSIVE">Fiyata Ek</option>
            <option value="INCLUSIVE">Fiyata Dahil</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
          <input type="checkbox" name="appliesToShipping" value="true" className="rounded border-gray-300" />
          Kargoya da uygula
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
          <input type="checkbox" name="active" value="true" defaultChecked className="rounded border-gray-300" />
          Aktif
        </label>
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-gray-600">Öncelik:</label>
          <input name="priority" type="number" defaultValue={0} className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>

      <button type="submit" disabled={isPending} className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
        {isPending ? "Oluşturuluyor…" : "Kural Oluştur"}
      </button>
    </form>
  );
}
