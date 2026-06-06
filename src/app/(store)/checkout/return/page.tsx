import type { Metadata } from "next";
import Link from "next/link";
import { PaymentPoller } from "./PaymentPoller";

export const metadata: Metadata = { title: "Ödeme İşleniyor" };

/**
 * Stripe'tan dönen kullanıcı bu sayfada bekler.
 * Ödeme durumu SADECE webhook aracılığıyla güncellenir.
 * Bu sayfadan gelen hiçbir parametre siparişi değiştirmez.
 */
export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const sp = await searchParams;
  const orderId = sp.orderId;

  if (!orderId) {
    return (
      <div className="store-body">
        <div className="max-w-[520px] mx-auto px-6 py-20 text-center">
          <p className="store-eyebrow text-[#a3a3a3] mb-4">Geçersiz Dönüş</p>
          <Link href="/" className="text-[13px] text-[#525252] underline">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="store-body">
      <div className="max-w-[520px] mx-auto px-6 py-20 text-center">

        {/* Dönen animasyon */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-16 h-16 border-2 border-[#e5e5e5]">
            <div className="absolute inset-0 border-2 border-transparent border-t-[#0a0a0a] animate-spin" />
          </div>
        </div>

        <p className="store-eyebrow mb-2">Lütfen Bekleyin</p>
        <h1 className="store-section-title mb-4">Ödemeniz İşleniyor</h1>
        <p className="text-[13px] text-[#525252] leading-relaxed">
          Ödeme sağlayıcısından onay bekleniyor. Bu sayfa otomatik olarak güncellenecek.
        </p>
        <p className="mt-2 text-[11px] text-[#a3a3a3]">
          Sayfayı kapatmayın — bu işlem birkaç saniye sürer.
        </p>

        {/* Client component: 3 saniyede bir sorgular, PAID olunca yönlendirir */}
        <PaymentPoller orderId={orderId} />

        <div className="mt-10 pt-6 border-t border-[#e5e5e5]">
          <Link
            href="/account/orders"
            className="text-[12px] text-[#a3a3a3] hover:text-[#0a0a0a] underline transition-colors"
          >
            Beklemek istemiyorsanız siparişlerinizi kontrol edin
          </Link>
        </div>
      </div>
    </div>
  );
}
