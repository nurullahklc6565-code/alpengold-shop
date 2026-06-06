"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { updateCartQuantityAction, removeFromCartAction } from "@/server/actions/store/cart";
import type { CartLine } from "@/server/services/storefront/cart.service";

type Props = { line: CartLine };

export function CartItemRow({ line }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleQty(qty: number) {
    startTransition(() => updateCartQuantityAction(line.variantId, qty));
  }
  function handleRemove() {
    startTransition(() => removeFromCartAction(line.variantId));
  }

  const opts = Object.entries(line.options);

  return (
    <div className={`flex gap-5 py-6 transition-opacity ${isPending ? "opacity-40 pointer-events-none" : ""}`}>
      {/* Görsel */}
      <div
        className="relative shrink-0 overflow-hidden bg-[#f2f2f2]"
        style={{ width: 100, aspectRatio: "3/4" }}
      >
        {line.imageUrl ? (
          <Image src={line.imageUrl} alt={line.productName} fill className="object-cover" sizes="100px" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[11px] text-[#a3a3a3]">Görsel yok</span>
          </div>
        )}
      </div>

      {/* Bilgi */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${line.productSlug}`}
              className="text-[14px] font-semibold text-[#0a0a0a] hover:text-[#525252] transition-colors leading-snug"
            >
              {line.productName}
            </Link>
            {opts.length > 0 && (
              <p className="mt-1 text-[12px] text-[#a3a3a3]">
                {opts.map(([k, v]) => `${k}: ${v}`).join("  ·  ")}
              </p>
            )}
            {!line.inStock && (
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-orange-600">
                Stok yetersiz
              </p>
            )}
          </div>
          {/* Sil */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="shrink-0 p-1 text-[#d4d4d4] hover:text-[#0a0a0a] transition-colors"
            aria-label="Kaldır"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Alt satır: miktar + fiyat */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center border border-[#e5e5e5]">
            <button
              type="button"
              onClick={() => handleQty(line.quantity - 1)}
              disabled={isPending || line.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-[#525252] hover:bg-[#f2f2f2] disabled:opacity-30 transition-colors"
            >
              <Minus className="h-3 w-3" strokeWidth={2} />
            </button>
            <span className="w-9 text-center text-[13px] font-medium text-[#0a0a0a]">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQty(line.quantity + 1)}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center text-[#525252] hover:bg-[#f2f2f2] disabled:opacity-30 transition-colors"
            >
              <Plus className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-[14px] font-semibold text-[#0a0a0a]">
              {line.formattedLineTotal ?? "—"}
            </p>
            {line.formattedPrice && line.quantity > 1 && (
              <p className="text-[11px] text-[#a3a3a3]">{line.formattedPrice} / adet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
