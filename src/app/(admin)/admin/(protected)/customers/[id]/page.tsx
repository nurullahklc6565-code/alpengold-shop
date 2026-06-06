import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { customerService } from "@/server/services/storefront/customer.service";
import { updateCustomerAction } from "@/server/actions/admin/customer";
import { formatPrice } from "@/lib/utils/pricing";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Müşteri Detayı" };

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await customerService.findById(id);
  if (!customer) return notFound();

  const orders = await prisma.order.findMany({
    where: { customerId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      currency: true,
      market: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });

  // Toplam harcama (ödenen siparişler)
  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const totalSpend = paidOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
  const lastOrder = orders[0];

  const saveAction = updateCustomerAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{customer.firstName} {customer.lastName}</h1>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${customer.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {customer.active ? "Aktif" : "Pasif"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Toplam Sipariş", value: orders.length },
          { label: "Ödenen Sipariş", value: paidOrders.length },
          { label: "Toplam Harcama", value: paidOrders.length > 0 ? `~${totalSpend.toFixed(2)}` : "—" },
          { label: "Son Sipariş", value: lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString("tr-TR") : "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Sipariş Geçmişi" description={`${orders.length} sipariş`}>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400">Henüz sipariş yok.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Sipariş No</th>
                      <th className="px-3 py-2.5 text-left">Pazar</th>
                      <th className="px-3 py-2.5 text-left">Ürün</th>
                      <th className="px-3 py-2.5 text-left">Tutar</th>
                      <th className="px-3 py-2.5 text-left">Durum</th>
                      <th className="px-3 py-2.5 text-left">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => {
                      const cur = { code: order.currency.code, symbol: order.currency.symbol, decimalDigits: order.currency.decimalDigits };
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5">
                            <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-gray-700 hover:underline">
                              {order.number}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-gray-500">{order.market.name}</td>
                          <td className="px-3 py-2.5 text-xs text-gray-500">{order._count.items} kalem</td>
                          <td className="px-3 py-2.5 font-semibold">{formatPrice(Number(order.totalPrice), cur)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex gap-1 flex-wrap">
                              <OrderStatusBadge status={order.status} />
                              <PaymentStatusBadge status={order.paymentStatus} />
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Müşteri Bilgileri">
            <dl className="space-y-2 text-sm">
              {[
                ["Ad Soyad", `${customer.firstName} ${customer.lastName}`],
                ["E-posta", customer.email],
                ["Telefon", customer.phone ?? "—"],
                ["Kayıt Tarihi", new Date(customer.createdAt).toLocaleDateString("tr-TR")],
                ["E-posta Doğrulama", customer.emailVerified ? "Doğrulandı" : "Doğrulanmadı"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <dt className="text-gray-500">{l}</dt>
                  <dd className="text-gray-900 text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <form action={saveAction} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durum</label>
                <select name="active" defaultValue={customer.active ? "true" : "false"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Admin Notu (müşteri görmez)</label>
                <textarea name="notes" rows={3} defaultValue={(customer as { notes?: string | null }).notes ?? ""}
                  placeholder="Müşteri hakkında dahili not…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <button type="submit"
                className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                Kaydet
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Kayıtlı Adresler">
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-gray-400">Kayıtlı adres yok.</p>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{addr.firstName} {addr.lastName}</p>
                    <p>{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.country.name}</p>
                    {addr.isDefault && <span className="text-xs text-blue-600">Varsayılan</span>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
