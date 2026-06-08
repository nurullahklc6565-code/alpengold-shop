import { prisma } from "@/lib/prisma";
import { resolveVariantPrice } from "@/lib/utils/pricing";
import { unstable_cache } from "next/cache";
import type { FallbackPricing } from "@prisma/client";

/** "Yeni" rozeti gösterilecek ürünlerin oluşturulma süresi eşiği (gün) */
const NEW_PRODUCT_THRESHOLD_DAYS = 21;

type MarketContext = {
  marketId: string;
  fallbackPricing: FallbackPricing;
  defaultMarketId: string | null;
  currency: { code: string; symbol: string; decimalDigits: number };
};

/**
 * Storefront ürün sorguları.
 * Her fonksiyon marketCtx alır — doğrudan pazar ID'si hardcode edilmez.
 */
export const storefrontProductService = {
  // Ürün listesi: sadece bu pazarda fiyatı olan (veya fallback izni olan) aktif ürünler
  async listForMarket(
    marketCtx: MarketContext,
    params: { categorySlug?: string; collectionSlug?: string; search?: string; page?: number; perPage?: number } = {}
  ) {
    const { categorySlug, collectionSlug, search, page = 1, perPage = 24 } = params;

    const where = {
      status: "ACTIVE" as const,
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(collectionSlug && {
        productCollections: { some: { collection: { slug: collectionSlug } } },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const priceMarketIds = marketCtx.defaultMarketId
      ? [marketCtx.marketId, marketCtx.defaultMarketId]
      : [marketCtx.marketId];

    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 2 },
          variants: {
            where: { active: true },
            take: 1, // listede sadece ilk varyant fiyatını göster
            include: {
              inventory: true,
              prices: {
                where: { marketId: { in: priceMarketIds } },
                include: { currency: true },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Her ürün için pazar fiyatını çöz; BLOCK ise listeye dahil etme
    const products = rawProducts
      .map((p) => {
        const variant = p.variants[0];
        const resolved = variant
          ? resolveVariantPrice({
              variant: {
                basePrice: Number(variant.basePrice),
                prices: variant.prices.map((pr) => ({
                  marketId: pr.marketId,
                  price: Number(pr.price),
                  compareAtPrice: pr.compareAtPrice ? Number(pr.compareAtPrice) : null,
                  currency: {
                    code: pr.currency.code,
                    symbol: pr.currency.symbol,
                    decimalDigits: pr.currency.decimalDigits,
                  },
                })),
              },
              marketId: marketCtx.marketId,
              fallbackPricing: marketCtx.fallbackPricing,
              marketCurrency: marketCtx.currency,
              defaultMarketId: marketCtx.defaultMarketId,
            })
          : null;

        if (marketCtx.fallbackPricing === "BLOCK" && !resolved) return null;

        const inventory = variant?.inventory;
        const available = inventory ? inventory.quantity - inventory.reserved : null;
        const isLowStock = !!inventory?.trackQuantity &&
          inventory.lowStockThreshold !== null && available !== null &&
          available > 0 && available <= inventory.lowStockThreshold;

        const isNew = (Date.now() - p.createdAt.getTime()) / 86_400_000 <= NEW_PRODUCT_THRESHOLD_DAYS;

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.images[0]?.url ?? null,
          imageAlt: p.images[0]?.alt ?? p.name,
          secondImageUrl: p.images[1]?.url ?? null,
          category: p.category,
          resolvedPrice: resolved,
          isNew,
          isLowStock,
          lowStockQuantity: isLowStock ? available : null,
        };
      })
      .filter(Boolean) as Array<{
      id: string; name: string; slug: string; imageUrl: string | null;
      imageAlt: string; secondImageUrl: string | null;
      category: { name: string; slug: string } | null;
      resolvedPrice: ReturnType<typeof resolveVariantPrice>;
      isNew: boolean;
      isLowStock: boolean;
      lowStockQuantity: number | null;
    }>;

    return { products, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  },

  // Tekil ürün detayı — tüm varyantlar + fiyatlar
  async getBySlug(slug: string, marketCtx: MarketContext) {
    const priceMarketIds = marketCtx.defaultMarketId
      ? [marketCtx.marketId, marketCtx.defaultMarketId]
      : [marketCtx.marketId];

    const product = await prisma.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { position: "asc" } },
        variants: {
          where: { active: true },
          orderBy: { createdAt: "asc" },
          include: {
            image: true,
            inventory: true,
            prices: {
              where: { marketId: { in: priceMarketIds } },
              include: { currency: true },
            },
          },
        },
        productCollections: {
          include: { collection: { select: { name: true, slug: true } } },
        },
      },
    });

    if (!product) return null;

    // Varyantlar için fiyat çöz — ürün her zaman gösterilir, sadece sepet engellenebilir
    const variants = product.variants.map((v) => {
      const resolved = resolveVariantPrice({
        variant: {
          basePrice: Number(v.basePrice),
          prices: v.prices.map((p) => ({
            marketId: p.marketId,
            price: Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            currency: { code: p.currency.code, symbol: p.currency.symbol, decimalDigits: p.currency.decimalDigits },
          })),
        },
        marketId: marketCtx.marketId,
        fallbackPricing: marketCtx.fallbackPricing,
        marketCurrency: marketCtx.currency,
        defaultMarketId: marketCtx.defaultMarketId,
      });

      // Base compareAtPrice (pazar bazlı fiyat yoksa veya yoksa kullan)
      const baseCompare = v.compareAtPrice ? Number(v.compareAtPrice) : null;

      const available = v.inventory
        ? v.inventory.quantity - v.inventory.reserved
        : null;

      return {
        id: v.id,
        sku: v.sku,
        barcode: v.barcode,
        options: v.options as Record<string, string>,
        weight: v.weight ? Number(v.weight) : null,
        imageUrl: v.image?.url ?? null,
        resolvedPrice: resolved,
        baseCompareAtPrice: baseCompare,
        inStock: v.inventory?.trackQuantity
          ? (available ?? 0) > 0
          : true,
        availableQuantity: available,
        lowStockThreshold: v.inventory?.lowStockThreshold ?? null,
      };
    });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      taxClass: product.taxClass,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      category: product.category,
      images: product.images,
      collections: product.productCollections.map((pc) => pc.collection),
      variants,
      fallbackPricing: marketCtx.fallbackPricing,
    };
  },
};

