"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  readCartCookie,
  encodeCartCookie,
  cartCookieOptions,
  type CartLineItem,
} from "@/lib/cart-cookie";
import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { marketService } from "@/server/services/market.service";
import { resolveCart, type CartData } from "@/server/services/storefront/cart.service";

/** Header sayaç ve mini sepet drawer'ı için güncel, fiyatlandırılmış sepet özetini döner */
export async function getCartSummaryAction(): Promise<CartData> {
  const [market, defaultMarket, items] = await Promise.all([
    getActiveMarket(),
    marketService.findDefault(),
    readCartCookie(),
  ]);

  if (!market) {
    return { lines: [], subtotal: 0, formattedSubtotal: "", itemCount: 0, hasUnavailableItems: false };
  }

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

  return resolveCart(items, marketCtx);
}

export async function addToCartAction(variantId: string, quantity = 1): Promise<void> {
  const items = await readCartCookie();
  const idx = items.findIndex((i) => i.variantId === variantId);

  const MAX_QTY = 100;
  if (idx >= 0) {
    items[idx].quantity = Math.min(MAX_QTY, Math.max(1, items[idx].quantity + quantity));
  } else {
    items.push({ variantId, quantity: Math.min(MAX_QTY, Math.max(1, quantity)) });
  }

  const cookieStore = await cookies();
  cookieStore.set({ ...cartCookieOptions(), value: encodeCartCookie(items) });
  revalidatePath("/cart");
}

export async function updateCartQuantityAction(variantId: string, quantity: number): Promise<void> {
  const items = await readCartCookie();
  const updated: CartLineItem[] = quantity <= 0
    ? items.filter((i) => i.variantId !== variantId)
    : items.map((i) => i.variantId === variantId ? { ...i, quantity } : i);

  const cookieStore = await cookies();
  cookieStore.set({ ...cartCookieOptions(), value: encodeCartCookie(updated) });
  revalidatePath("/cart");
}

export async function removeFromCartAction(variantId: string): Promise<void> {
  const items = await readCartCookie();
  const cookieStore = await cookies();
  cookieStore.set({
    ...cartCookieOptions(),
    value: encodeCartCookie(items.filter((i) => i.variantId !== variantId)),
  });
  revalidatePath("/cart");
}

export async function clearCartAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({ ...cartCookieOptions(), value: encodeCartCookie([]) });
  revalidatePath("/cart");
}
