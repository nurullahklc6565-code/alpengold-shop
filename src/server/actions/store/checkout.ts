"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { readCartCookie, encodeCartCookie, cartCookieOptions } from "@/lib/cart-cookie";
import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { marketService } from "@/server/services/market.service";
import { customerService } from "@/server/services/storefront/customer.service";
import { getCustomerSession } from "@/lib/customer-session";
import { createOrder, getShippingOptions } from "@/server/services/storefront/checkout.service";
import { validateCartForCheckout } from "@/server/services/storefront/cart.service";
import { paymentService } from "@/server/services/payment.service";
import { prisma } from "@/lib/prisma";

export type CheckoutState = { error?: string; success?: boolean };

const checkoutSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  firstName: z.string().min(1, "Ad zorunludur"),
  lastName: z.string().min(1, "Soyad zorunludur"),
  phone: z.string().optional(),
  line1: z.string().min(1, "Adres zorunludur"),
  line2: z.string().optional(),
  city: z.string().min(1, "Şehir zorunludur"),
  province: z.string().optional(),
  zip: z.string().optional(),
  countryId: z.string().min(1, "Ülke zorunludur"),
  shippingRateId: z.string().optional().nullable(),
});

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || undefined,
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    province: formData.get("province") || undefined,
    zip: formData.get("zip") || undefined,
    countryId: formData.get("countryId"),
    shippingRateId: (formData.get("shippingRateId") as string) || null,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const { email, firstName, lastName, phone, shippingRateId, ...addressData } = parsed.data;

  const [market, defaultMarket, cartItems] = await Promise.all([
    getActiveMarket(),
    marketService.findDefault(),
    readCartCookie(),
  ]);

  if (!market) return { error: "Aktif pazar bulunamadı" };
  if (cartItems.length === 0) return { error: "Sepetiniz boş" };

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

  // Sepet doğrulama
  const { valid, errors } = await validateCartForCheckout(cartItems, marketCtx);
  if (!valid) return { error: errors[0] };

  // Müşteri bul veya oluştur
  const sessionId = await getCustomerSession();
  let customerId: string;

  if (sessionId) {
    customerId = sessionId;
  } else {
    const guest = await customerService.findOrCreateGuest(email, firstName, lastName);
    customerId = guest.id;
  }

  const couponCode = (formData.get("couponCode") as string | null)?.trim().toUpperCase() || undefined;

  // Sipariş oluştur — yalnızca bu adım try/catch içinde olmalı.
  // redirect() Next.js'te özel bir NEXT_REDIRECT hatası fırlatır; bunu try/catch
  // içine almak yönlendirmeyi yutar ve kullanıcıyı yanlışlıkla /cart'a düşürür
  // (sepet zaten temizlendiği için boş sepet kontrolü devreye girer).
  let order;
  try {
    order = await createOrder({
      customerId,
      marketId: market.id,
      currencyId: market.defaultCurrencyId,
      shippingAddress: { firstName, lastName, phone, ...addressData },
      shippingRateId: shippingRateId ?? null,
      cartItems,
      marketCtx,
      couponCode,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Sipariş oluşturulamadı" };
  }

  // Sipariş başarıyla oluşturuldu → artık sepeti temizleyebiliriz
  const cookieStore = await cookies();
  cookieStore.set({ ...cartCookieOptions(), value: encodeCartCookie([]) });

  // Aktif ödeme sağlayıcısı var mı? (session oluşturmadan hafif kontrol)
  // Gerçek session /checkout/payment sayfasında tek seferlik oluşturulur.
  const hasProvider = await paymentService.hasActiveProvider(market.id);

  if (!hasProvider) {
    // Sağlayıcı yapılandırılmamış → geliştirme modunda başarı sayfasına yönlendir
    redirect(`/checkout/success/${order.id}?dev=1`);
  }

  // Ödeme sayfasına yönlendir — Stripe session orada oluşturulur
  redirect(`/checkout/payment/${order.id}`);
}
