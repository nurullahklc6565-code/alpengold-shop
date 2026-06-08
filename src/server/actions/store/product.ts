"use server";

import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { marketService } from "@/server/services/market.service";
import { getCustomerSession } from "@/lib/customer-session";
import { favoritesService } from "@/server/services/storefront/favorites.service";
import { storefrontProductService } from "@/server/services/storefront/storefront-product.service";

/** Hızlı görüntüle modalı için ürün detayını pazar bağlamına göre çözüp döner */
export async function getProductQuickViewAction(slug: string) {
  const [market, defaultMarket, customerId] = await Promise.all([
    getActiveMarket(),
    marketService.findDefault(),
    getCustomerSession(),
  ]);

  if (!market) return null;

  const marketCtx = {
    marketId: market.id,
    fallbackPricing: market.fallbackPricing,
    defaultMarketId: defaultMarket?.id ?? null,
    currency: {
      code: market.defaultCurrency.code,
      symbol: market.defaultCurrency.symbol,
      decimalDigits: market.defaultCurrency.decimalDigits,
    },
  };

  const product = await storefrontProductService.getBySlug(slug, marketCtx);
  if (!product) return null;

  const isFavorited = customerId ? await favoritesService.isFavorited(customerId, product.id) : false;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    vendor: product.vendor,
    taxClass: product.taxClass,
    category: product.category,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
    variants: product.variants,
    fallbackPricing: product.fallbackPricing,
    isLoggedIn: !!customerId,
    isFavorited,
  };
}
