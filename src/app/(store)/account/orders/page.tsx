import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-session";
import { customerService } from "@/server/services/storefront/customer.service";
import { formatPrice } from "@/lib/utils/pricing";

export const metadata: Metadata = { title: "Siparişlerim" };

const STATUS_LABEL: Record<string, string> = {
  PAID:     "Ödendi",
  PENDING:  "Bekliyor",
  FAILED:   "Başarısız",
  REFUNDED: "İade",
};
const STATUS_COLOR: Record<string, string> = {
  PAID:     "text-emerald-600",
  PENDING:  "text-amber-600",
  FAILED:   "text-red-500",
  REFUNDED: "text-[#a3a3a3]",
};

export default async function OrdersPage() {
  const sessionId = await getCustomerSession();
  if (!sessionId) redirect("/account/login");

  const orders = await customerService.getOrders(sessionId);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      {/* Başlık */}
      <div className="mb-8 flex items-center gap-4 border-b border-[#e5e5e5] pb-6">
        <Link
          href="/account"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#e5e5e5] hover:border-[#a3a3a3] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#525252]" strokeWidth={1.5} />
        </Link>
        <div>
          <p className="store-eyebrow mb-1">Hesabım</p>
          <h1 className="store-section-title">Siparişlerim</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-[#e5e5e5] py-20 text-center">
          <p className="store-eyebrow text-[#a3a3a3]">Henüz sipariş yok</p>
          <Link href="/products" className="mt-5 inline-block store-btn-primary px-8 py-3 text-[13px]">
            Alışveriş Yap
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currency = {
              code: order.currency.code,
              symbol: order.currency.symbol,
              decimalDigits: order.currency.decimalDigits,
            };
            return (
              <div key={order.id} className="border border-[#e5e5e5]">
                {/* Sipariş başlık */}
                <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0a0a0a]">{order.number}</p>
                    <p className="text-[12px] text-[#a3a3a3]">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric", month: "long", year: "numeric",
                      })}{" "}
                      · {order.market.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-semibold text-[#0a0a0a]">
                      {formatPrice(Number(order.totalPrice), currency)}
                    </p>
                    <span className={`text-[11px] font-medium ${STATUS_COLOR[order.paymentStatus] ?? "text-[#a3a3a3]"}`}>
                      {STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Sipariş kalemleri */}
                <div className="divide-y divide-[#f2f2f2] px-5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <span className="text-[13px] text-[#525252]">
                        {item.variant.product.name}
                        <span className="text-[#a3a3a3]"> × {item.quantity}</span>
                      </span>
                      <span className="text-[13px] font-medium text-[#0a0a0a]">
                        {formatPrice(Number(item.totalPrice), currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
