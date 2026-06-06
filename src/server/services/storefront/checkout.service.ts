import { prisma } from "@/lib/prisma";
import { resolveVariantPrice } from "@/lib/utils/pricing";
import type { CartLineItem } from "@/lib/cart-cookie";
import type { MarketCtx } from "./cart.service";
import { emailService } from "@/server/services/email.service";
import { discountService } from "@/server/services/discount.service";
import { taxService } from "@/server/services/tax.service";
import { invoiceService } from "@/server/services/invoice.service";
import { stockMovementService } from "@/server/services/stock-movement.service";

export type CheckoutParams = {
  customerId: string;
  marketId: string;
  currencyId: string;
  shippingAddress: {
    firstName: string; lastName: string; company?: string;
    line1: string; line2?: string; city: string;
    province?: string; zip?: string; countryId: string; phone?: string;
  };
  shippingRateId: string | null;
  cartItems: CartLineItem[];
  marketCtx: MarketCtx;
  couponCode?: string;
};

export async function createOrder(params: CheckoutParams) {
  return prisma.$transaction(async (tx) => {
    const priceMarketIds = params.marketCtx.defaultMarketId
      ? [params.marketCtx.marketId, params.marketCtx.defaultMarketId]
      : [params.marketCtx.marketId];

    // Varyantları fiyat ve stok bilgisiyle getir
    const variantIds = params.cartItems.map((i) => i.variantId);
    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds }, active: true },
      include: {
        prices: {
          where: { marketId: { in: priceMarketIds } },
          include: { currency: true },
        },
        inventory: true,
      },
    });

    // Fiyat ve stok doğrulama
    const orderItems: Array<{
      variantId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      currencyId: string;
      variantSnapshot: Record<string, unknown>;
    }> = [];

    let subtotal = 0;

    for (const cartItem of params.cartItems) {
      const variant = variants.find((v) => v.id === cartItem.variantId);
      if (!variant) throw new Error(`Varyant bulunamadı: ${cartItem.variantId}`);

      // Stok kontrolü
      if (variant.inventory?.trackQuantity) {
        const available = variant.inventory.quantity - variant.inventory.reserved;
        if (available < cartItem.quantity) {
          throw new Error(`Yeterli stok yok: ${variant.sku}`);
        }
      }

      // Fiyat çözme
      const resolved = resolveVariantPrice({
        variant: {
          basePrice: Number(variant.basePrice),
          prices: variant.prices.map((p) => ({
            marketId: p.marketId,
            price: Number(p.price),
            compareAtPrice: null,
            currency: { code: p.currency.code, symbol: p.currency.symbol, decimalDigits: p.currency.decimalDigits },
          })),
        },
        marketId: params.marketCtx.marketId,
        fallbackPricing: params.marketCtx.fallbackPricing,
        marketCurrency: params.marketCtx.currency,
        defaultMarketId: params.marketCtx.defaultMarketId,
      });

      if (!resolved) throw new Error(`Bu ürün bu pazarda satışa kapalı: ${variant.sku}`);

      const unitPrice = resolved.price;
      const lineTotal = unitPrice * cartItem.quantity;
      subtotal += lineTotal;

      // Fiyatın para birimine ait currencyId bul
      const priceCurrencyRecord = variant.prices.find(
        (p) => p.marketId === params.marketCtx.marketId
      );
      const currencyId = priceCurrencyRecord?.currencyId ?? params.currencyId;

      orderItems.push({
        variantId: variant.id,
        quantity: cartItem.quantity,
        unitPrice,
        totalPrice: lineTotal,
        currencyId,
        variantSnapshot: {
          sku: variant.sku,
          options: variant.options,
          productId: variant.productId,
        },
      });

      // Stok rezervasyonu
      if (variant.inventory?.trackQuantity) {
        await tx.inventoryItem.update({
          where: { variantId: variant.id },
          data: { reserved: { increment: cartItem.quantity } },
        });
      }
    }

    // Kargo ücreti hesapla
    let shippingPrice = 0;
    if (params.shippingRateId) {
      const rate = await tx.shippingRate.findUnique({
        where: { id: params.shippingRateId },
      });
      if (rate) {
        shippingPrice = Number(rate.rate);
        // Ücretsiz kargo eşiği kontrolü
        if (rate.freeAbove && subtotal >= Number(rate.freeAbove)) {
          shippingPrice = 0;
        }
      }
    }

    // Kupon doğrulama ve indirim hesabı
    let discountPrice = 0;
    let couponId: string | null = null;
    const normalizedCoupon = params.couponCode?.trim().toUpperCase() || null;

    if (normalizedCoupon) {
      try {
        const coupon = await discountService.validateCoupon(normalizedCoupon, {
          subtotal,
          marketId: params.marketId,
          customerId: params.customerId,
        });
        discountPrice = coupon.discountAmount;
        couponId = coupon.couponId;
        if (coupon.isFreeShipping) shippingPrice = 0;
        await discountService.incrementUsage(couponId, tx);
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Kupon geçersiz");
      }
    }

    // Vergi hesabı (ülke + pazar bazlı, hardcode değil)
    const { taxAmount } = await taxService.calculateTax({
      subtotal,
      shippingPrice,
      countryId: params.shippingAddress.countryId,
      marketId: params.marketId,
      taxClass: "standard",
    });

    const totalPrice = Math.max(0, subtotal + shippingPrice + taxAmount - discountPrice);

    // Sipariş numarası üret
    const orderCount = await tx.order.count();
    const orderNumber = `#${String(10001 + orderCount).padStart(6, "0")}`;

    // Adres kaydet
    const address = await tx.address.create({
      data: { customerId: params.customerId, ...params.shippingAddress },
    });

    // Sipariş oluştur
    const order = await tx.order.create({
      data: {
        number: orderNumber,
        customerId: params.customerId,
        marketId: params.marketId,
        currencyId: params.currencyId,
        status: "PENDING",
        paymentStatus: "UNPAID",
        subtotalPrice: subtotal,
        shippingPrice,
        taxPrice: taxAmount,
        discountPrice,
        totalPrice,
        shippingAddressId: address.id,
        couponCode: params.couponCode ?? null,
        items: {
          create: orderItems.map((item) => ({
            variant: { connect: { id: item.variantId } },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            variantSnapshot: item.variantSnapshot as import("@prisma/client").Prisma.InputJsonValue,
          })),
        },
      },
    });

    return order;
  }).then(async (order) => {
    // Fatura oluştur (async — hata sipariş akışını durdurmaz)
    invoiceService.createForOrder(order.id).catch(console.error);

    // Stok rezervasyon hareketlerini logla
    for (const item of params.cartItems) {
      stockMovementService.log({
        variantId: item.variantId,
        type: "RESERVATION",
        quantity: -item.quantity,
        reason: "Sipariş rezervasyonu",
        reference: order.number,
      }).catch(console.error);
    }

    // Sipariş onay e-postası (async)
    emailService.sendOrderConfirmation(order.id).catch(console.error);
    return order;
  });
}

/** Sipariş pazarının kargo seçeneklerini getirir */
export async function getShippingOptions(marketId: string, countryId: string) {
  const zones = await prisma.shippingZone.findMany({
    where: {
      marketId,
      shippingCountries: { some: { countryId } },
    },
    include: {
      rates: {
        where: { active: true },
        include: { currency: true },
      },
    },
  });

  const rates = zones.flatMap((z) => z.rates);

  // Kargo tanımlı değilse ücretsiz kargo sun
  if (rates.length === 0) {
    return [{ id: null, name: "Standart Kargo", rate: 0, isFree: true }];
  }

  return rates.map((r) => ({
    id: r.id,
    name: r.name,
    rate: Number(r.rate),
    currencyCode: r.currency.code,
    isFree: false,
    freeAbove: r.freeAbove ? Number(r.freeAbove) : null,
  }));
}
