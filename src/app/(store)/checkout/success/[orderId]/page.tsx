import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/pricing";

export const metadata: Metadata = { title: "Sipariş Alındı" };

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ dev?: string }>;
}) {
  const { orderId } = await params;
  const sp = await searchParams;
  const isDevMode = sp.dev === "1";

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      currency: true,
      market: { select: { name: true } },
      shippingAddress: { include: { country: { select: { name: true } } } },
      items: {
        include: {
          variant: { include: { product: { select: { name: true } } } },
        },
      },
    },
  });

  if (!order) return notFound();

  const currency = {
    code: order.currency.code,
    symbol: order.currency.symbol,
    decimalDigits: order.currency.decimalDigits,
  };

  return (
    <div className="store-body">
      <div className="max-w-[580px] mx-auto px-6 py-16">

        {/* Onay ikonu */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-[#0a0a0a] mb-6">
            <CheckCircle2 className="h-8 w-8 text-[#0a0a0a]" strokeWidth={1.5} />
          </div>
          <p className="store-eyebrow mb-2">Teşekkürler</p>
          <h1 className="store-section-title">Siparişiniz Alındı</h1>
          <p className="mt-3 text-[13px] text-[#525252]">
            Sipariş No:{" "}
            <span className="font-semibold text-[#0a0a0a]">#{order.number}</span>
          </p>
        </div>

        {/* Sipariş detay kutusu */}
        <div className="border border-[#e5e5e5]">

          {/* Ürün listesi */}
          <div className="p-5 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#525252]">
              Sipariş İçeriği
            </p>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-[13px]">
                <span className="text-[#0a0a0a]">
                  {item.variant.product.name}
                  <span className="text-[#a3a3a3]"> × {item.quantity}</span>
                </span>
                <span className="font-medium text-[#0a0a0a]">
                  {formatPrice(Number(item.totalPrice), currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Fiyat özeti */}
          <div className="border-t border-[#e5e5e5] p-5 space-y-2">
            <div className="flex justify-between text-[13px] text-[#525252]">
              <span>Ara Toplam</span>
              <span>{formatPrice(Number(order.subtotalPrice), currency)}</span>
            </div>
            {Number(order.discountPrice) > 0 && (
              <div className="flex justify-between text-[13px] text-emerald-600">
                <span>İndirim</span>
                <span>−{formatPrice(Number(order.discountPrice), currency)}</span>
              </div>
            )}
            {Number(order.shippingPrice) > 0 && (
              <div className="flex justify-between text-[13px] text-[#525252]">
                <span>Kargo</span>
                <span>{formatPrice(Number(order.shippingPrice), currency)}</span>
              </div>
            )}
            {Number(order.taxPrice) > 0 && (
              <div className="flex justify-between text-[13px] text-[#525252]">
                <span>Vergi</span>
                <span>{formatPrice(Number(order.taxPrice), currency)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#e5e5e5] flex justify-between text-[14px] font-semibold text-[#0a0a0a]">
              <span>Toplam</span>
              <span>{formatPrice(Number(order.totalPrice), currency)}</span>
            </div>
          </div>

          {/* Teslimat adresi */}
          {order.shippingAddress && (
            <div className="border-t border-[#e5e5e5] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#525252] mb-2">
                Teslimat Adresi
              </p>
              <div className="text-[13px] text-[#525252] space-y-0.5">
                <p className="font-medium text-[#0a0a0a]">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.country.name}</p>
              </div>
            </div>
          )}

          {/* Ödeme durumu */}
          <div className="border-t border-[#e5e5e5] p-5">
            {order.paymentStatus === "PAID" ? (
              <div className="flex items-center gap-2 text-[13px] text-emerald-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Ödemeniz onaylandı. Sipariş hazırlanmaya başlandı.
              </div>
            ) : isDevMode ? (
              <div className="text-[13px] text-[#525252]">
                <span className="font-medium text-[#0a0a0a]">Geliştirme Modu:</span>{" "}
                Ödeme sağlayıcısı yapılandırılmamış. Admin panelinden Stripe anahtarlarını ekleyin.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[13px] text-amber-700">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                Ödeme bekleniyor. Onay alındığında sipariş durumunuz güncellenecek.
              </div>
            )}
          </div>
        </div>

        {/* CTA'lar */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            href="/account/orders"
            className="flex items-center justify-center border border-[#0a0a0a] px-5 py-3 text-[13px] font-medium text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
          >
            Siparişlerim
          </Link>
          <Link
            href="/products"
            className="store-btn-primary flex items-center justify-center px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.06em]"
          >
            Alışverişe Devam
          </Link>
        </div>
      </div>
    </div>
  );
}
