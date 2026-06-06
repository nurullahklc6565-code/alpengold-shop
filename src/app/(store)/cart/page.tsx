import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { readCartCookie } from "@/lib/cart-cookie";
import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { marketService } from "@/server/services/market.service";
import { resolveCart } from "@/server/services/storefront/cart.service";
import { CartItemRow } from "@/components/store/cart/CartItemRow";

export const metadata: Metadata = { title: "Sepet" };

export default async function CartPage() {
  const [market, defaultMarket, cartItems] = await Promise.all([
    getActiveMarket(),
    marketService.findDefault(),
    readCartCookie(),
  ]);

  if (!market || cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <ShoppingBag className="h-12 w-12 text-[#d4d4d4] mb-6" strokeWidth={1} />
        <h1 className="text-[22px] font-bold text-[#0a0a0a] tracking-tight">Sepetiniz boş</h1>
        <p className="mt-2 text-[14px] text-[#a3a3a3] max-w-xs">
          Alışverişe başlamak için ürünlere göz atın.
        </p>
        <Link
          href="/products"
          className="store-btn-primary mt-8 inline-block px-10 py-3.5 text-[13px]"
        >
          Alışverişe Başla
        </Link>
      </div>
    );
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

  const cart = await resolveCart(cartItems, marketCtx);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      {/* Başlık */}
      <div className="mb-10 border-b border-[#e5e5e5] pb-6">
        <p className="store-eyebrow mb-1">Alışveriş</p>
        <h1 className="store-section-title">
          Sepetim
          <span className="ml-3 text-[18px] font-normal text-[#a3a3a3]">({cart.itemCount})</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_380px]">

        {/* Sepet öğeleri */}
        <div>
          {cart.hasUnavailableItems && (
            <div className="mb-6 border border-orange-200 bg-orange-50 px-4 py-3">
              <p className="text-[13px] text-orange-700">
                Sepetinizde stok dışı veya bu pazarda satılmayan ürün(ler) var. Ödemeye geçmeden önce sepeti güncelleyin.
              </p>
            </div>
          )}

          <div className="divide-y divide-[#e5e5e5]">
            {cart.lines.map((line) => (
              <CartItemRow key={line.variantId} line={line} />
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/products"
              className="text-[13px] text-[#525252] hover:text-[#0a0a0a] transition-colors"
            >
              ← Alışverişe devam et
            </Link>
          </div>
        </div>

        {/* Sipariş özeti */}
        <div className="lg:sticky lg:top-[100px] lg:self-start">
          <div className="border border-[#e5e5e5] p-6 space-y-4">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.06em] text-[#0a0a0a]">
              Sipariş Özeti
            </h2>

            <div className="space-y-2 pt-2 border-t border-[#e5e5e5]">
              <div className="flex justify-between text-[13px] text-[#525252]">
                <span>Ara Toplam</span>
                <span className="font-medium text-[#0a0a0a]">{cart.formattedSubtotal}</span>
              </div>
              <div className="flex justify-between text-[12px] text-[#a3a3a3]">
                <span>Kargo</span>
                <span>Ödeme adımında hesaplanır</span>
              </div>
            </div>

            <div className="border-t border-[#e5e5e5] pt-4 flex justify-between text-[14px] font-semibold text-[#0a0a0a]">
              <span>Toplam</span>
              <span>{cart.formattedSubtotal}</span>
            </div>

            <Link
              href="/checkout"
              className={`block w-full py-4 text-center text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                cart.hasUnavailableItems
                  ? "bg-[#d4d4d4] text-white cursor-not-allowed pointer-events-none"
                  : "bg-[#0a0a0a] text-white hover:bg-[#262626]"
              }`}
            >
              Ödemeye Geç
            </Link>

            <p className="text-center text-[11px] text-[#a3a3a3]">
              Güvenli ödeme · SSL şifreleme
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
