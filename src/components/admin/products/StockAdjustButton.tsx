"use client";

import { useState, useTransition } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import { manualStockAdjustAction } from "@/server/actions/admin/product";

type Props = {
  productId: string;
  variantId: string;
  currentStock: number;
  staffId: string;
};

export function StockAdjustButton({ productId, variantId, currentStock, staffId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState<"add" | "subtract">("add");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  function handleSubmit() {
    const n = parseInt(qty);
    if (!n || n <= 0) return;
    const delta = type === "add" ? n : -n;
    startTransition(async () => {
      const result = await manualStockAdjustAction(productId, variantId, delta, reason || "Manuel düzeltme", staffId);
      if (result.error) {
        setMessage({ text: result.error, ok: false });
      } else {
        setMessage({ text: `Stok ${type === "add" ? "eklendi" : "düşüldü"}: ${n}`, ok: true });
        setQty(""); setReason("");
        setTimeout(() => { setOpen(false); setMessage(null); }, 1500);
      }
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
        Düzenle
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setOpen(false)}>
      <div className="w-80 rounded-xl bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Stok Düzeltme</h3>
        <p className="mb-3 text-xs text-gray-500">Mevcut stok: <strong>{currentStock}</strong></p>

        {message && (
          <p className={`mb-3 text-xs rounded px-3 py-2 ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {message.text}
          </p>
        )}

        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => setType("add")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm transition-colors ${type === "add" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <PlusCircle className="h-4 w-4" /> Ekle
          </button>
          <button type="button" onClick={() => setType("subtract")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm transition-colors ${type === "subtract" ? "border-red-400 bg-red-50 text-red-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <MinusCircle className="h-4 w-4" /> Düş
          </button>
        </div>

        <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)}
          placeholder="Miktar"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-gray-900" />
        <input value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Sebep (opsiyonel)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900" />

        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(false)}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50">
            İptal
          </button>
          <button type="button" onClick={handleSubmit} disabled={!qty || isPending}
            className="flex-1 rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
            {isPending ? "…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
