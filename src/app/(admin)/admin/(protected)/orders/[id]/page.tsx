import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ExternalLink, Truck } from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { OrderStatusManager } from "@/components/admin/orders/OrderStatusManager";
import { FulfillmentForm } from "@/components/admin/orders/FulfillmentForm";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { orderService } from "@/server/services/order.service";
import { invoiceService } from "@/server/services/invoice.service";
import { formatPrice } from "@/lib/utils/pricing";

export const metadata: Metadata = { title: "Sipariş Detayı" };

const FULFILLMENT_LABEL: Record<string, string> = {
  UNFULFILLED: "Gönderilmedi",
  PARTIALLY_FULFILLED: "Kısmen Gönderildi",
  FULFILLED: "Gönderildi",
  RETURNED: "İade Edildi",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, order, activityLogs] = await Promise.all([
    requireAuth(),
    orderService.get(id),
    orderService.getActivityLogs(id),
  ]);

  if (!order) return notFound();

  const invoice = await invoiceService.getByOrder(id);
  const cur = { code: order.currency.code, symbol: order.currency.symbol, decimalDigits: order.currency.decimalDigits };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900">{order.number}</h1>
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                order.fulfillmentStatus === "FULFILLED" ? "bg-green-50 text-green-700 ring-green-600/20"
                : order.fulfillmentStatus === "PARTIALLY_FULFILLED" ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                : "bg-gray-100 text-gray-600 ring-gray-500/20"
              }`}>
                <Truck className="h-3 w-3" />
                {FULFILLMENT_LABEL[order.fulfillmentStatus]}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString("tr-TR")} · {order.market.name} · {cur.code}
              {order.trackingNumber && <span className="ml-2 font-mono text-blue-600">{order.carrierCode ? `${order.carrierCode}: ` : ""}{order.trackingNumber}</span>}
            </p>
          </div>
        </div>
        {/* Fatura butonu */}
        {invoice && (
          <a href={`/api/admin/invoices/${invoice.number}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <FileText className="h-4 w-4" />
            {invoice.number}
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Kalemleri */}
          <SectionCard title="Sipariş Kalemleri"
            description="Fiyatlar sipariş anında snapshotlanmış">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Ürün</th>
                    <th className="px-4 py-2.5 text-left">Adet</th>
                    <th className="px-4 py-2.5 text-left">Birim Fiyat</th>
                    <th className="px-4 py-2.5 text-left">Toplam</th>
                    <th className="px-4 py-2.5 text-left">Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => {
                    const inv = item.variant.inventory;
                    const available = inv ? inv.quantity - inv.reserved : null;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/admin/products/${item.variant.product.id}`}
                            className="font-medium text-gray-900 hover:underline">
                            {item.variant.product.name}
                          </Link>
                          <p className="text-xs text-gray-400 font-mono">{item.variant.sku}</p>
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{formatPrice(Number(item.unitPrice), cur)}</td>
                        <td className="px-4 py-3 font-semibold">{formatPrice(Number(item.totalPrice), cur)}</td>
                        <td className="px-4 py-3 text-xs">
                          {inv ? (
                            <span className={available !== null && available < 0 ? "text-red-600 font-semibold" : "text-gray-600"}>
                              {inv.quantity} stok · {inv.reserved} rezerve
                              {available !== null && <span className="text-gray-400"> ({available} serbest)</span>}
                            </span>
                          ) : <span className="text-gray-400">Takip yok</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-1.5 text-sm">
              {[
                ["Ara Toplam", formatPrice(Number(order.subtotalPrice), cur)],
                ...(Number(order.shippingPrice) > 0 ? [["Kargo", formatPrice(Number(order.shippingPrice), cur)]] : []),
                ...(Number(order.taxPrice) > 0 ? [["Vergi", formatPrice(Number(order.taxPrice), cur)]] : []),
                ...(Number(order.discountPrice) > 0 ? [["İndirim", `-${formatPrice(Number(order.discountPrice), cur)}`]] : []),
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-gray-600">
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Genel Toplam</span>
                <span>{formatPrice(Number(order.totalPrice), cur)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Ödeme Kayıtları */}
          {order.payments.length > 0 && (
            <SectionCard title="Ödeme Kayıtları">
              <div className="space-y-2">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{payment.provider.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{payment.providerPaymentId ?? "Referans yok"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(Number(payment.amount), cur)}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${payment.webhookVerified ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className="text-xs text-gray-400">
                          {payment.webhookVerified ? "Webhook doğrulandı" : "Doğrulanmadı"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Aktivite */}
          <SectionCard title="Aktivite Geçmişi">
            {activityLogs.length === 0 ? (
              <p className="text-sm text-gray-400">Henüz aktivite kaydı yok.</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => {
                  const payload = log.payload as Record<string, unknown> | null;
                  return (
                    <div key={log.id} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{log.staff.firstName} {log.staff.lastName}</span>
                          {" "}<span className="text-gray-500">({log.staff.role.name})</span>
                          {" "}→ <span className="font-mono text-xs">{log.action}</span>
                        </p>
                        {payload && (
                          <p className="text-xs text-gray-500">
                            {Boolean(payload.from) && Boolean(payload.to) && `${String(payload.from ?? "")} → ${String(payload.to ?? "")}`}
                            {Boolean(payload.reason) && <span className="ml-1 italic">&quot;{String(payload.reason ?? "")}&quot;</span>}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("tr-TR")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          {/* Durum Yönetimi */}
          <OrderStatusManager
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
            userRole={user.role}
          />

          {/* Kargo & Takip */}
          <SectionCard title="Kargo ve Takip">
            <FulfillmentForm
              orderId={order.id}
              currentFulfillmentStatus={order.fulfillmentStatus}
              currentTrackingNumber={order.trackingNumber}
              currentCarrierCode={order.carrierCode}
              currentAdminNote={order.adminNote}
            />
          </SectionCard>

          {/* Müşteri */}
          <SectionCard title="Müşteri">
            <div className="space-y-2 text-sm">
              <Link href={`/admin/customers/${order.customer.id}`}
                className="font-medium text-gray-900 hover:underline">
                {order.customer.firstName} {order.customer.lastName}
              </Link>
              <p className="text-gray-500">{order.customer.email}</p>
              {order.customer.phone && <p className="text-gray-500">{order.customer.phone}</p>}
            </div>
          </SectionCard>

          {/* Teslimat Adresi */}
          {order.shippingAddress && (
            <SectionCard title="Teslimat Adresi">
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}{order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ""} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country.name}</p>
                {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
              </div>
            </SectionCard>
          )}

          {/* Fatura */}
          {invoice ? (
            <SectionCard title="Fatura">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Fatura No</dt>
                  <dd className="font-mono font-semibold text-gray-900">{invoice.number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Durum</dt>
                  <dd className="text-gray-900">{invoice.status === "ISSUED" ? "Kesildi" : invoice.status === "PAID" ? "Ödendi" : "Taslak"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Tutar</dt>
                  <dd className="font-semibold">{formatPrice(Number(invoice.total), cur)}</dd>
                </div>
              </dl>
              <a href={`/api/admin/invoices/${invoice.number}`} target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
                <FileText className="h-4 w-4" />
                Faturayı Görüntüle / Yazdır
              </a>
            </SectionCard>
          ) : (
            <SectionCard title="Fatura">
              <p className="text-sm text-gray-400">Bu sipariş için fatura henüz oluşturulmadı.</p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
