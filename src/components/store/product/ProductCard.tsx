"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import type { ResolvedPrice } from "@/lib/utils/pricing";
import type { FallbackPricing } from "@prisma/client";

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    imageAlt: string;
    secondImageUrl?: string | null;
    category: { name: string; slug: string } | null;
    resolvedPrice: ResolvedPrice | null;
  };
  fallbackPricing: FallbackPricing;
};

export function ProductCard({ product, fallbackPricing }: Props) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const hasSecond = !!product.secondImageUrl;

  return (
    <div
      className="store-card group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Görsel — 3:4 portrait */}
        <div className="relative overflow-hidden bg-[#f2f2f2]" style={{ aspectRatio: "3/4" }}>
          {product.imageUrl ? (
            <>
              {/* Birincil görsel */}
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                className={`object-cover transition-all duration-700 ${
                  hasSecond && hovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* İkinci görsel — hover'da görünür */}
              {hasSecond && (
                <Image
                  src={product.secondImageUrl!}
                  alt={product.imageAlt}
                  fill
                  className={`object-cover transition-all duration-700 ${
                    hovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  }`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
              {/* Hafif overlay — hover'da biraz koyulaşır */}
              <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
                hovered ? "opacity-[0.06]" : "opacity-0"
              }`} />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg className="h-10 w-10 text-[#a3a3a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Favori butonu */}
          <button
            type="button"
            aria-label={wishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-300 ${
              hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                wishlisted ? "fill-[#0a0a0a] text-[#0a0a0a]" : "text-[#525252]"
              }`}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </Link>

      {/* Bilgi */}
      <div className="mt-3 space-y-1">
        {product.category && (
          <p className="store-eyebrow">{product.category.name}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[14px] font-medium text-[#0a0a0a] leading-snug line-clamp-2 group-hover:text-[#525252] transition-colors">
            {product.name}
          </h3>
        </Link>
        <PriceDisplay resolved={product.resolvedPrice} fallbackBehavior={fallbackPricing} size="sm" />
      </div>
    </div>
  );
}
