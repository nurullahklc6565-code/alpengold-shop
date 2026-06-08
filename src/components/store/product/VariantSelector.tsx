"use client";

import { useState } from "react";
import { PriceDisplay } from "./PriceDisplay";
import type { ResolvedPrice } from "@/lib/utils/pricing";
import type { FallbackPricing } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

type Variant = {
  id: string;
  sku: string;
  options: Record<string, string>;
  resolvedPrice: ResolvedPrice | null;
  inStock: boolean;
  availableQuantity: number | null;
};

type Props = {
  variants: Variant[];
  fallbackPricing: FallbackPricing;
  selectedId?: string;
  onSelect?: (id: string) => void;
};

export function VariantSelector({ variants, fallbackPricing, selectedId: controlledId, onSelect }: Props) {
  const [internalId, setInternalId] = useState<string>(variants[0]?.id ?? "");
  const selectedId = controlledId ?? internalId;
  const setSelectedId = onSelect ?? setInternalId;
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  // Seçenek türlerini grupla (Renk, Beden vs.)
  const optionKeys = Array.from(
    new Set(variants.flatMap((v) => Object.keys(v.options)))
  );

  // Bir seçenek değeri için en uygun varyantı bulur. Önce mevcut diğer
  // seçimlerle birebir eşleşen varyantı arar; eksik/seyrek varyant
  // matrislerinde (tam ızgara olmayan) böyle bir kombinasyon yoksa, o
  // değere sahip herhangi bir varyanta (tercihen stokta olana) düşer.
  function variantForOptionValue(key: string, val: string) {
    const exact = variants.find((v) =>
      v.options[key] === val &&
      optionKeys.every((k) => k === key || v.options[k] === selected.options[k])
    );
    if (exact) return exact;

    const candidates = variants.filter((v) => v.options[key] === val);
    return candidates.find((v) => v.inStock) ?? candidates[0] ?? null;
  }

  return (
    <div className="space-y-4">
      {/* Seçenek grupları */}
      {optionKeys.map((key) => {
        const values = Array.from(new Set(variants.map((v) => v.options[key]).filter(Boolean)));
        return (
          <div key={key}>
            <p className="mb-2 text-sm font-medium text-gray-700">{key}</p>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const variantMatch = variantForOptionValue(key, val);
                const isSelected = selected.options[key] === val;
                const isOutOfStock = !variantMatch || !variantMatch.inStock;
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => variantMatch && setSelectedId(variantMatch.id)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      isSelected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-400",
                      isOutOfStock && "opacity-40 cursor-not-allowed line-through"
                    )}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Fiyat ve stok durumu */}
      {selected && (
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <PriceDisplay resolved={selected.resolvedPrice} fallbackBehavior={fallbackPricing} size="lg" />
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", selected.inStock ? "bg-green-500" : "bg-red-400")} />
            <span className="text-sm text-gray-600">
              {selected.inStock
                ? selected.availableQuantity !== null
                  ? `${selected.availableQuantity} adet mevcut`
                  : "Stokta var"
                : "Stokta yok"}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono">SKU: {selected.sku}</p>
        </div>
      )}
    </div>
  );
}
