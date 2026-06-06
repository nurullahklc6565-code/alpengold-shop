import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { orderService } from "@/server/services/order.service";
import { formatPrice } from "@/lib/utils/pricing";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Siparişler" };

const STATUS_OPTIONS = [
  { value: "", label: "Tümü" }, { value: "PENDING", label: "Bekliyor" },
  { value: "CONFIRMED", label: "Onaylandı" }, { value: "PROCESSING", label: "Hazırlanıyor" },
  { value: "SHIPPED", label: "Kargoda" }, { value: "DELIVERED", label: "Teslim Edildi" },
  { value: "CANCELLED", label: "İptal" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "Tüm Ödemeler" }, { value: "UNPAID", label: "Ödenmedi" },
  { value: "PAID", label: "Ödendi" }, { value: "REFUNDED", label: "İade" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { data: orders, total, totalPages, page } = await orderService.list({
    status: sp.status as OrderStatus || undefined,
    paymentStatus: sp.payment as PaymentStatus || undefined,
    search: sp.search,
    page: parseInt(sp.page ?? "1"),
  });

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams({
      ...(sp.status && { status: sp.status }),
      ...(sp.payment && { payment: sp.payment }),
      ...(sp.search && { search: sp.search }),
      ...overrides,
    });
    return `/admin/orders?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader title="Siparişler" description={`${total} sipariş`} />

      {/* Filtreler */}
      <div className="mb-4 flex flex-wrap gap-2">
        <form className="flex items-center gap-2 flex-wrap">
          <input name="search" defaultValue={sp.search} placeholder="Sipariş no veya müşteri e-posta…"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-900" />
          {STATUS_OPTIONS.map((o) => (
            <Link key={o.value} href={buildUrl({ status: o.value, page: "1" })}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${(sp.status ?? "") === o.value ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {o.label}
            </Link>
          ))}
          {PAYMENT_OPTIONS.map((o) => (
            <Link key={o.value} href={buildUrl({ payment: o.value, page: "1" })}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${(sp.payment ?? "") === o.value ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {o.label}
            </Link>
          ))}
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Sipariş</th>
              <th className="px-4 py-3 text-left">Müşteri</th>
              <th className="px-4 py-3 text-left">Pazar</th>
              <th className="px-4 py-3 text-left">Tutar</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3 text-left">Ödeme</th>
              <th className="px-4 py-3 text-left">Kargo</th>
              <th className="px-4 py-3 text-left">Tarih</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr><td colSpan={9} className="py-12 text-center text-sm text-gray-400">Sipariş bulunamadı.</td></tr>
            ) : orders.map((order) => {
              const cur = { code: order.currency.code, symbol: order.currency.symbol, decimalDigits: order.currency.decimalDigits };
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{order.number}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
                    <p className="text-xs text-gray-400">{order.customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{order.market.name}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(Number(order.totalPrice), cur)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                  <td className="px-4 py-3">
                    {order.fulfillmentStatus !== "UNFULFILLED" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.fulfillmentStatus === "FULFILLED" ? "bg-green-50 text-green-700"
                        : "bg-blue-50 text-blue-700"
                      }`}>
                        {order.fulfillmentStatus === "FULFILLED" ? "Gönderildi"
                        : order.fulfillmentStatus === "PARTIALLY_FULFILLED" ? "Kısmen"
                        : order.fulfillmentStatus === "RETURNED" ? "İade" : "—"}
                      </span>
                    )}
                    {order.trackingNumber && (
                      <p className="text-xs font-mono text-gray-400 mt-0.5">{order.trackingNumber}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                      Detay <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={buildUrl({ page: String(p) })}
              className={`h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-colors ${p === page ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
