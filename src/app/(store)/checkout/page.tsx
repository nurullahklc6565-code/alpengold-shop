import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { readCartCookie } from "@/lib/cart-cookie";
import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { marketService } from "@/server/services/market.service";
import { getCustomerSession } from "@/lib/customer-session";
import { resolveCart } from "@/server/services/storefront/cart.service";
import { getShippingOptions } from "@/server/services/storefront/checkout.service";
import { customerService } from "@/server/services/storefront/customer.service";
import { CheckoutForm } from "@/components/store/checkout/CheckoutForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage() {
  const [market, defaultMarket, cartItems, sessionId] = await Promise.all([
    getActiveMarket(),
    marketService.findDefault(),
    readCartCookie(),
    getCustomerSession(),
  ]);

  if (!market) return redirect("/");
  if (cartItems.length === 0) return redirect("/cart");

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

  const [cart, activeCountries, customer] = await Promise.all([
    resolveCart(cartItems, marketCtx),
    prisma.country.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, codeIso2: true, flagEmoji: true },
    }),
    sessionId ? customerService.findById(sessionId) : null,
  ]);

  const defaultCountry = customer?.addresses[0];
  const shippingOptions = await getShippingOptions(
    market.id,
    defaultCountry?.countryId ?? activeCountries[0]?.id ?? ""
  );

  return (
    <div className="store-body">
      <div className="max-w-[720px] mx-auto px-6 py-12">

        {/* Başlık */}
        <div className="mb-10 flex items-center gap-4">
          <Link
            href="/cart"
            className="flex h-9 w-9 items-center justify-center border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#0a0a0a]" />
          </Link>
          <div>
            <p className="store-eyebrow">Güvenli Alışveriş</p>
            <h1 className="store-section-title">Ödeme</h1>
          </div>
        </div>

        {/* Form */}
        <CheckoutForm
          cart={cart}
          countries={activeCountries}
          shippingOptions={shippingOptions}
          marketCurrencyCode={market.defaultCurrency.code}
          customerEmail={customer?.email}
        />
      </div>
    </div>
  );
}
