import { prisma } from "@/lib/prisma";
import { resolveVariantPrice, formatPrice } from "@/lib/utils/pricing";
import type { CartLineItem } from "@/lib/cart-cookie";
import type { FallbackPricing } from "@prisma/client";

export type MarketCtx = {
  marketId: string;
  fallbackPricing: FallbackPricing;
  defaultMarketId: string | null;
  currency: { code: string; symbol: string; decimalDigits: number };
};

export type CartLine = {
  variantId: string;
  quantity: number;
  sku: string;
  productName: string;
  productSlug: string;
  options: Record<string, string>;
  imageUrl: string | null;
  resolvedPrice: ReturnType<typeof resolveVariantPrice>;
  lineTotal: number | null;
  formattedPrice: string | null;
  formattedLineTotal: string | null;
  inStock: boolean;
  availableQuantity: number | null;
};

export type CartData = {
  lines: CartLine[];
  subtotal: number;
  formattedSubtotal: string;
  itemCount: number;
  hasUnavailableItems: boolean;
};

export async function resolveCart(items: CartLineItem[], ctx: MarketCtx): Promise<CartData> {
  if (items.length === 0) {
    return {
      lines: [],
      subtotal: 0,
      formattedSubtotal: formatPrice(0, ctx.currency),
      itemCount: 0,
      hasUnavailableItems: false,
    };
  }

  const variantIds = items.map((i) => i.variantId);
  const priceMarketIds = ctx.defaultMarketId
    ? [ctx.marketId, ctx.defaultMarketId]
    : [ctx.marketId];

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, active: true },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      },
      inventory: true,
      prices: {
        where: { marketId: { in: priceMarketIds } },
        include: { currency: true },
      },
    },
  });

  const lines: CartLine[] = [];
  let subtotal = 0;
  let hasUnavailableItems = false;

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) { hasUnavailableItems = true; continue; }

    const resolved = resolveVariantPrice({
      variant: {
        basePrice: Number(variant.basePrice),
        prices: variant.prices.map((p) => ({
          marketId: p.marketId,
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          currency: { code: p.currency.code, symbol: p.currency.symbol, decimalDigits: p.currency.decimalDigits },
        })),
      },
      marketId: ctx.marketId,
      fallbackPricing: ctx.fallbackPricing,
      marketCurrency: ctx.currency,
      defaultMarketId: ctx.defaultMarketId,
    });

    const available = variant.inventory
      ? variant.inventory.quantity - variant.inventory.reserved
      : null;

    const inStock = available === null ? true : available >= item.quantity;
    if (!inStock) hasUnavailableItems = true;

    const lineTotal = resolved ? resolved.price * item.quantity : null;
    if (lineTotal) subtotal += lineTotal;

    lines.push({
      variantId: variant.id,
      quantity: item.quantity,
      sku: variant.sku,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      options: variant.options as Record<string, string>,
      imageUrl: variant.product.images[0]?.url ?? null,
      resolvedPrice: resolved,
      lineTotal,
      formattedPrice: resolved ? formatPrice(resolved.price, resolved.currency) : null,
      formattedLineTotal: lineTotal && resolved ? formatPrice(lineTotal, resolved.currency) : null,
      inStock,
      availableQuantity: available,
    });
  }

  return {
    lines,
    subtotal,
    formattedSubtotal: formatPrice(subtotal, ctx.currency),
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    hasUnavailableItems,
  };
}

/** Stok ve fiyat kontrolü — sipariş oluşturmadan önce çalışır */
export async function validateCartForCheckout(
  items: CartLineItem[],
  ctx: MarketCtx
): Promise<{ valid: boolean; errors: string[] }> {
  const cart = await resolveCart(items, ctx);
  const errors: string[] = [];

  for (const line of cart.lines) {
    if (!line.resolvedPrice) {
      errors.push(`"${line.productName}" bu pazarda satışa kapalı.`);
    }
    if (!line.inStock) {
      errors.push(`"${line.productName}" için yeterli stok yok.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
