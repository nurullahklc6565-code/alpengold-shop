"use client";

import { useState, type ReactNode } from "react";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductDetails } from "./ProductDetails";
import type { FallbackPricing } from "@prisma/client";
import type { ResolvedPrice } from "@/lib/utils/pricing";

type Img = { id: string; url: string; alt: string | null; isPrimary: boolean };

type Variant = {
  id: string; sku: string; barcode: string | null;
  options: Record<string, string>; weight: number | null; imageUrl: string | null;
  resolvedPrice: ResolvedPrice | null; baseCompareAtPrice: number | null;
  inStock: boolean; availableQuantity: number | null; lowStockThreshold: number | null;
};

type Props = {
  images: Img[];
  productId: string;
  productSlug: string;
  productName: string;
  categoryName?: string | null;
  vendor: string | null;
  taxClass: string;
  fallbackPricing: FallbackPricing;
  variants: Variant[];
  isLoggedIn: boolean;
  isFavorited: boolean;
  shippingInfo: string | null;
  rightSlot?: ReactNode;
};

export function ProductDetailClient({
  images, productId, productSlug, productName, categoryName, vendor, taxClass,
  fallbackPricing, variants, isLoggedIn, isFavorited, shippingInfo,
  rightSlot,
}: Props) {
  const [variantImageUrl, setVariantImageUrl] = useState<string | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_420px] xl:gap-16 xl:grid-cols-[1.25fr_460px]">
        {/* Sol: Galeri */}
        <div>
          <ProductImageGallery
            images={images}
            productName={productName}
            variantImageUrl={variantImageUrl}
          />
        </div>

        {/* Sağ: Satın alma alanı — sticky */}
        <div className="lg:sticky lg:top-[120px] lg:self-start">
          <div className="pb-6 border-b border-[#e5e5e5]">
            {categoryName && <p className="store-eyebrow mb-2 text-[#a3a3a3]">{categoryName}</p>}
            <h1
              className="font-serif font-semibold leading-[1.15] tracking-tight text-[#0a0a0a]"
              style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.1rem)" }}
            >
              {productName}
            </h1>
          </div>

          <div className="py-6">
            <ProductDetails
              productId={productId}
              productSlug={productSlug}
              productName={productName}
              vendor={vendor}
              taxClass={taxClass}
              fallbackPricing={fallbackPricing}
              variants={variants}
              isLoggedIn={isLoggedIn}
              isFavorited={isFavorited}
              shippingInfo={shippingInfo}
              onVariantChange={setVariantImageUrl}
            />
          </div>
        </div>
      </div>

      {/* Alt: Açıklama, kargo/iade detayları, etiketler — tam genişlik */}
      {rightSlot && (
        <div className="mt-16 max-w-[760px] border-t border-[#e5e5e5] pt-12">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
