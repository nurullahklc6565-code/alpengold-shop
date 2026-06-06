"use client";

import { useState } from "react";
import { VariantSelector } from "./VariantSelector";
import { AddToCartButton } from "./AddToCartButton";
import type { ResolvedPrice } from "@/lib/utils/pricing";
import type { FallbackPricing } from "@prisma/client";

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
};

export function ProductActions({ variants, fallbackPricing }: Props) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  return (
    <div className="space-y-4">
      <VariantSelector
        variants={variants}
        fallbackPricing={fallbackPricing}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {selected && (
        <AddToCartButton
          variantId={selected.id}
          inStock={selected.inStock}
          disabled={!selected.resolvedPrice}
        />
      )}
    </div>
  );
}
