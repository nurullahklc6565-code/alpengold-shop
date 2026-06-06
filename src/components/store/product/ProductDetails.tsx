"use client";

import { useState } from "react";
import { Truck, RotateCcw, ShieldCheck, Info } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { AddToCartButton } from "./AddToCartButton";
import { FavoriteButton } from "./FavoriteButton";
import { QuantitySelector } from "./QuantitySelector";
import { cn } from "@/lib/utils/cn";
import type { ResolvedPrice } from "@/lib/utils/pricing";
import type { FallbackPricing } from "@prisma/client";

type Variant = {
  id: string; sku: string; barcode: string | null;
  options: Record<string, string>; weight: number | null; imageUrl: string | null;
  resolvedPrice: ResolvedPrice | null; baseCompareAtPrice: number | null;
  inStock: boolean; availableQuantity: number | null; lowStockThreshold: number | null;
};

type Props = {
  productId: string; productSlug: string; productName: string;
  vendor: string | null; taxClass: string; fallbackPricing: FallbackPricing;
  variants: Variant[]; isLoggedIn: boolean; isFavorited: boolean;
  shippingInfo: string | null;
  onVariantChange?: (imageUrl: string | null) => void;
};

export function ProductDetails({
  productId, productSlug, productName, vendor, fallbackPricing,
  variants, isLoggedIn, isFavorited, shippingInfo, onVariantChange,
}: Props) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity]     = useState(1);

  const selected   = variants.find((v) => v.id === selectedId) ?? variants[0];
  const optionKeys = Array.from(new Set(variants.flatMap((v) => Object.keys(v.options))));

  function selectVariant(id: string) {
    setSelectedId(id);
    setQuantity(1);
    onVariantChange?.(variants.find((v) => v.id === id)?.imageUrl ?? null);
  }

  if (!selected) {
    return <p className="text-[13px] text-[#a3a3a3]">Bu ürün için varyant bulunamadı.</p>;
  }

  const maxQty    = selected.availableQuantity ?? undefined;
  const isLowStock = selected.inStock &&
    selected.lowStockThreshold !== null && selected.availableQuantity !== null &&
    selected.availableQuantity <= selected.lowStockThreshold;

  return (
    <div className="space-y-6">

      {/* Marka */}
      {vendor && (
        <p className="store-eyebrow">{vendor}</p>
      )}

      {/* Fiyat */}
      <div>
        <PriceDisplay resolved={selected.resolvedPrice} fallbackBehavior={fallbackPricing} size="lg" />
      </div>

      {/* Stok */}
      {selected.inStock ? (
        isLowStock ? (
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-orange-600">
            Son {selected.availableQuantity} adet
          </p>
        ) : (
          <p className="text-[12px] text-[#525252]">Stokta mevcut</p>
        )
      ) : (
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#a3a3a3]">
          Stokta yok
        </p>
      )}

      {/* Seçenek grupları */}
      {optionKeys.map((key) => {
        const values = Array.from(new Set(variants.map((v) => v.options[key]).filter(Boolean)));
        return (
          <div key={key} className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#525252]">
              {key}:{" "}
              <span className="font-normal normal-case tracking-normal text-[#0a0a0a]">
                {selected.options[key]}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const match = variants.find(
                  (v) => v.options[key] === val &&
                    Object.keys(selected.options).filter((k) => k !== key)
                      .every((k) => v.options[k] === selected.options[k])
                );
                const isSelected  = selected.options[key] === val;
                const outOfStock  = match ? !match.inStock : true;
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={outOfStock && !match}
                    onClick={() => match && selectVariant(match.id)}
                    className={cn(
                      "relative min-w-[48px] border px-4 py-2 text-[13px] font-medium transition-all",
                      isSelected
                        ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                        : "border-[#e5e5e5] text-[#0a0a0a] hover:border-[#a3a3a3]",
                      outOfStock && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    {val}
                    {outOfStock && isSelected && (
                      <span className="absolute inset-x-0 top-1/2 h-px bg-white/60 -rotate-12 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Sepete ekle */}
      {selected.resolvedPrice ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={maxQty}
              disabled={!selected.inStock}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <AddToCartButton
                variantId={selected.id}
                quantity={quantity}
                inStock={selected.inStock}
              />
            </div>
            <FavoriteButton
              productId={productId}
              productSlug={productSlug}
              productName={productName}
              initialFavorited={isFavorited}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2 border border-[#e5e5e5] px-4 py-3">
            <Info className="h-4 w-4 text-[#a3a3a3] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#525252]">
              {fallbackPricing === "BLOCK"
                ? "Bu ürün seçili bölgede satışa sunulmamıştır."
                : "Bu ürün için fiyat bilgisi bulunamadı."}
            </p>
          </div>
          <FavoriteButton productId={productId} productSlug={productSlug} productName={productName}
            initialFavorited={isFavorited} isLoggedIn={isLoggedIn} />
        </div>
      )}

      {/* Kargo / avantajlar */}
      <div className="border-t border-[#e5e5e5] pt-5 space-y-3">
        {[
          { icon: Truck,      text: shippingInfo ?? "Hızlı ve güvenli kargo" },
          { icon: RotateCcw,  text: "30 gün içinde ücretsiz iade" },
          { icon: ShieldCheck, text: "Güvenli ödeme — SSL şifreleme" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-[13px] text-[#525252]">
            <Icon className="h-4 w-4 shrink-0 text-[#a3a3a3]" strokeWidth={1.5} />
            {text}
          </div>
        ))}
      </div>

      {/* SKU */}
      <p className="text-[11px] text-[#a3a3a3]">
        SKU: <span className="font-mono">{selected.sku}</span>
        {selected.barcode && <> · Barkod: <span className="font-mono">{selected.barcode}</span></>}
      </p>
    </div>
  );
}
