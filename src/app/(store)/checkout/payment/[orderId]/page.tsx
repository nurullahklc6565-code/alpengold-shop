import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { paymentService } from "@/server/services/payment.service";
import { prisma } from "@/lib/prisma";

/**
 * Stripe ödeme session'ını burada oluşturur ve kullanıcıyı Stripe'a yönlendirir.
 * Fiyat/tutar bilgisi yalnızca DB'den okunur — URL parametrelerine güvenilmez.
 */
export default async function PaymentRedirectPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, paymentStatus: true, number: true },
  });

  if (!order) return notFound();

  // Zaten ödenmiş → success sayfasına
  if (order.paymentStatus === "PAID") {
    redirect(`/checkout/success/${orderId}`);
  }

  let redirectUrl: string | null = null;

  try {
    const session = await paymentService.createSession(orderId);

    if (session.devMode || !session.redirectUrl) {
      redirect(`/checkout/success/${orderId}?dev=1`);
    }

    redirectUrl = session.redirectUrl;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ödeme başlatılamadı";

    return (
      <div className="store-body">
        <div className="max-w-[520px] mx-auto px-6 py-20 text-center">
          <p className="store-eyebrow text-[#a3a3a3] mb-2">Ödeme Hatası</p>
          <h1 className="store-section-title mb-4">Ödeme Başlatılamadı</h1>
          <p className="text-[13px] text-[#525252] mb-8">{msg}</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/cart"
              className="border border-[#0a0a0a] px-6 py-3 text-[13px] font-medium text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
            >
              Sepete Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (redirectUrl) redirect(redirectUrl);

  // Fallback (ulaşılmamalı)
  return (
    <div className="store-body">
      <div className="max-w-[520px] mx-auto px-6 py-20 text-center">
        <p className="text-[13px] text-[#525252]">Ödeme sayfasına yönlendiriliyorsunuz…</p>
      </div>
    </div>
  );
}
