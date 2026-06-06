import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { discountService } from "@/server/services/discount.service";
import { deleteCouponAction } from "@/server/actions/admin/discount";

export const metadata: Metadata = { title: "Kuponlar" };

export default async function CouponsPage() {
  const coupons = await discountService.listCoupons();

  return (
    <div>
      <PageHeader title="Kuponlar" description={`${coupons.length} kupon`}
        actions={
          <Link href="/admin/discounts/new" className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            Yeni İndirim + Kupon
          </Link>
        }
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Kod</th>
              <th className="px-4 py-3 text-left">İndirim</th>
              <th className="px-4 py-3 text-left">Kullanım</th>
              <th className="px-4 py-3 text-left">Müşteri Başına</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400">Henüz kupon yok. İndirim oluşturup kupon ekleyin.</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-gray-900">{c.code}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/discounts/${c.discountId}`} className="text-gray-700 hover:underline text-sm">
                    {c.discount.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.usedCount} / {c.usageLimit ?? "∞"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${c.onePerCustomer ? "text-amber-600" : "text-gray-400"}`}>
                    {c.onePerCustomer ? "Evet" : "Hayır"}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge active={c.active} /></td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteCouponAction.bind(null, c.id)}>
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
