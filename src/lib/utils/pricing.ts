import type { FallbackPricing } from "@prisma/client";

export type CurrencyInfo = {
  code: string;
  symbol: string;
  decimalDigits: number;
};

export type ResolvedPrice = {
  price: number;
  compareAtPrice: number | null;
  currency: CurrencyInfo;
  /**
   * true  → pazar için tanımlı kesin fiyat
   * false → fallback fiyat (base veya varsayılan pazar)
   */
  isExactMarketPrice: boolean;
};

type PriceRecord = {
  marketId: string;
  price: number;
  compareAtPrice: number | null;
  currency: CurrencyInfo;
};

type VariantForPricing = {
  basePrice: number;
  prices: PriceRecord[];
};

/**
 * Varyantın belirtilen pazar için fiyatını çözer.
 * Canlı kur çevirisi bu fonksiyona dahil değildir — sadece yardımcı bir özellik.
 * Ana fiyatlandırma her zaman admin tarafından elle girilmiş pazar fiyatıdır.
 *
 * @returns null → ürün bu pazarda satılmamalı (BLOCK veya price yok)
 */
export function resolveVariantPrice(params: {
  variant: VariantForPricing;
  marketId: string;
  fallbackPricing: FallbackPricing;
  marketCurrency: CurrencyInfo;
  defaultMarketId: string | null;
}): ResolvedPrice | null {
  const { variant, marketId, fallbackPricing, marketCurrency, defaultMarketId } = params;

  // ── Pazar için kesin fiyat var mı? ───────────────────────────────────────
  const exactPrice = variant.prices.find((p) => p.marketId === marketId);
  if (exactPrice) {
    return {
      price: exactPrice.price,
      compareAtPrice: exactPrice.compareAtPrice,
      currency: exactPrice.currency,
      isExactMarketPrice: true,
    };
  }

  // ── Kesin fiyat yok → fallback davranışı ─────────────────────────────────
  switch (fallbackPricing) {
    case "BLOCK":
      // Bu pazarda fiyat tanımlı değil → ürünü satma
      return null;

    case "USE_BASE_PRICE":
      // Varyantın temel fiyatını, pazarın para birimiyle göster
      return {
        price: variant.basePrice,
        compareAtPrice: null,
        currency: marketCurrency,
        isExactMarketPrice: false,
      };

    case "USE_DEFAULT":
      // Varsayılan pazarın fiyatını kullan
      if (!defaultMarketId) return null;
      const defaultPrice = variant.prices.find((p) => p.marketId === defaultMarketId);
      if (!defaultPrice) return null;
      return {
        price: defaultPrice.price,
        compareAtPrice: defaultPrice.compareAtPrice,
        currency: defaultPrice.currency,
        isExactMarketPrice: false,
      };
  }
}

/** Para birimini formatlı string'e çevirir. Hardcode sembol yoktur. */
export function formatPrice(price: number, currency: CurrencyInfo): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.decimalDigits,
    maximumFractionDigits: currency.decimalDigits,
  }).format(price);
}
