"use client";

import { useActionState } from "react";
import {
  createDiscountAction,
  updateDiscountAction,
  type DiscountActionState,
} from "@/server/actions/admin/discount";
import type { Discount } from "@prisma/client";

type Market = { id: string; name: string };
type Props = { discount?: Discount | null; markets: Market[] };
const init: DiscountActionState = {};

const TYPE_LABELS = { PERCENTAGE: "Yüzde (%)", FIXED_AMOUNT: "Sabit Tutar", FREE_SHIPPING: "Ücretsiz Kargo" };
const APPLIES_LABELS = { ALL: "Tüm Ürünler", PRODUCT: "Belirli Ürün", CATEGORY: "Kategori", COLLECTION: "Koleksiyon", MARKET: "Pazar" };

export function DiscountForm({ discount, markets }: Props) {
  const action = discount ? updateDiscountAction.bind(null, discount.id) : createDiscountAction;
  const [state, formAction, isPending] = useActionState(action, init);

  const now = new Date();
  const defaultStart = discount?.startsAt
    ? new Date(discount.startsAt).toISOString().slice(0, 16)
    : now.toISOString().slice(0, 16);
  const defaultEnd = discount?.endsAt
    ? new Date(discount.endsAt).toISOString().slice(0, 16)
    : "";

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Güncellendi.</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
        <input name="name" required defaultValue={discount?.name} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Örn: Yaz İndirimi %20" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tür *</label>
          <select name="type" defaultValue={discount?.type ?? "PERCENTAGE"} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Değer *</label>
          <input name="value" type="number" step="0.01" min="0" required defaultValue={discount ? String(discount.value) : ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="10 veya 20.00" />
          <p className="mt-0.5 text-xs text-gray-400">Yüzde için: 10 = %10. Sabit için: 50 = 50 birim.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Geçerlilik Başlangıcı *</label>
          <input name="startsAt" type="datetime-local" required defaultValue={defaultStart} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
          <input name="endsAt" type="datetime-local" defaultValue={defaultEnd} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Sipariş Tutarı</label>
          <input name="minOrderValue" type="number" step="0.01" min="0" defaultValue={discount?.minOrderValue ? String(discount.minOrderValue) : ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pazar (opsiyonel)</label>
          <select name="marketId" defaultValue={discount?.marketId ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            <option value="">— Tüm Pazarlar —</option>
            {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="active" value="true" defaultChecked={discount?.active ?? true} className="rounded border-gray-300" />
        Aktif
      </label>

      <button type="submit" disabled={isPending} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
        {isPending ? "Kaydediliyor…" : discount ? "Güncelle" : "İndirim Oluştur"}
      </button>
    </form>
  );
}
