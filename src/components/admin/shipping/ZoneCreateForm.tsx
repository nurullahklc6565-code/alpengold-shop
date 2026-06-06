"use client";

import { useActionState } from "react";
import type { ShippingActionState } from "@/server/actions/admin/shipping";

type Market = { id: string; name: string };
type Props = {
  markets: Market[];
  createAction: (prev: ShippingActionState, formData: FormData) => Promise<ShippingActionState>;
};
const init: ShippingActionState = {};

export function ZoneCreateForm({ markets, createAction }: Props) {
  const [state, formAction, isPending] = useActionState(createAction, init);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-600 mb-1">Pazar *</label>
        <select name="marketId" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
          <option value="">Pazar seçin…</option>
          {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-600 mb-1">Bölge Adı *</label>
        <input name="name" required placeholder="Örn: Türkiye, Avrupa, Dünya" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <button type="submit" disabled={isPending} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
        {isPending ? "Oluşturuluyor…" : "Bölge Oluştur"}
      </button>
    </form>
  );
}
