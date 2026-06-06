"use client";

import { useState, useTransition } from "react";
import { updateInventoryAction } from "@/server/actions/admin/product";
import { ToggleActiveButton } from "@/components/admin/ui/ToggleActiveButton";

type Variant = {
  id: string;
  sku: string;
  options: Record<string, string>;
  inventory: {
    quantity: number;
    reserved: number;
    trackQuantity: boolean;
  } | null;
};

type Props = { productId: string; variants: Variant[] };

export function InventoryPanel({ productId, variants }: Props) {
  if (variants.length === 0) {
    return <p className="text-sm text-gray-500">Stok takibi için önce varyant ekleyin.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left">Varyant</th>
            <th className="px-4 py-3 text-left">Takip</th>
            <th className="px-4 py-3 text-left">Stok</th>
            <th className="px-4 py-3 text-left">Rezerve</th>
            <th className="px-4 py-3 text-left">Mevcut</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {variants.map((v) => (
            <InventoryRow key={v.id} variant={v} productId={productId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InventoryRow({ variant, productId }: { variant: Variant; productId: string }) {
  const inv = variant.inventory ?? { quantity: 0, reserved: 0, trackQuantity: true };
  const [quantity, setQuantity] = useState(inv.quantity);
  const [trackQuantity, setTrackQuantity] = useState(inv.trackQuantity);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const opts = variant.options as Record<string, string>;
  const optLabel = Object.values(opts).join(" / ");

  function handleSave() {
    startTransition(async () => {
      await updateInventoryAction(productId, variant.id, { quantity, trackQuantity });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function handleToggleTrack(id: string) {
    const next = !trackQuantity;
    setTrackQuantity(next);
    await updateInventoryAction(productId, id, { quantity, trackQuantity: next });
  }

  const available = quantity - inv.reserved;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="font-mono text-xs text-gray-700">{variant.sku}</div>
        {optLabel && <div className="text-xs text-gray-400">{optLabel}</div>}
      </td>
      <td className="px-4 py-3">
        <ToggleActiveButton id={variant.id} active={trackQuantity} onToggle={handleToggleTrack} />
      </td>
      <td className="px-4 py-3">
        {trackQuantity ? (
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => { setQuantity(parseInt(e.target.value) || 0); setSaved(false); }}
            onBlur={handleSave}
            disabled={isPending}
            className="w-20 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
          />
        ) : (
          <span className="text-xs text-gray-400">Sınırsız</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 tabular-nums">{inv.reserved}</td>
      <td className="px-4 py-3">
        {trackQuantity ? (
          <span className={`text-xs font-semibold tabular-nums ${available > 5 ? "text-green-700" : available > 0 ? "text-amber-600" : "text-red-600"}`}>
            {available}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {saved && <span className="text-xs text-green-600">✓ Kaydedildi</span>}
        {isPending && <span className="text-xs text-gray-400">Kaydediliyor…</span>}
      </td>
    </tr>
  );
}
