import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ödeme İptal Edildi" };

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const sp = await searchParams;
  const orderId = sp.orderId;

  // Siparişi kontrol et — hâlâ UNPAID durumunda olmalı
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: { number: true, paymentStatus: true },
      })
    : null;

  return (
    <div className="store-body">
      <div className="max-w-[520px] mx-auto px-6 py-20 text-center">

        {/* İptal ikonu */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-[#e5e5e5]">
            <X className="h-7 w-7 text-[#a3a3a3]" strokeWidth={1.5} />
          </div>
        </div>

        <p className="store-eyebrow text-[#a3a3a3] mb-2">Ödeme Yapılmadı</p>
        <h1 className="store-section-title mb-4">Ödeme İptal Edildi</h1>

        {order ? (
          <p className="text-[13px] text-[#525252] mb-8">
            Sipariş <span className="font-semibold text-[#0a0a0a]">#{order.number}</span> oluşturuldu
            ancak ödeme tamamlanmadı. Siparişiniz korunuyor — ödemeyi tamamlamak için
            siparişlerim sayfanızdan devam edebilirsiniz.
          </p>
        ) : (
          <p className="text-[13px] text-[#525252] mb-8">
            Ödeme işlemini iptal ettiniz. Sepetiniz korunuyor, dilediğinizde tekrar deneyebilirsiniz.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cart"
            className="flex items-center justify-center border border-[#0a0a0a] px-6 py-3 text-[13px] font-medium text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
          >
            Sepete Dön
          </Link>
          {order && (
            <Link
              href="/account/orders"
              className="store-btn-primary flex items-center justify-center px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em]"
            >
              Siparişlerim
            </Link>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
          <Link href="/products" className="text-[12px] text-[#a3a3a3] hover:text-[#0a0a0a] underline transition-colors">
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}
