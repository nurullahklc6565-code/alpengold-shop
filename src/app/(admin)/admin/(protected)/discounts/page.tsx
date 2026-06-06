import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { discountService } from "@/server/services/discount.service";

export const metadata: Metadata = { title: "İndirimler" };

const TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: "Yüzde", FIXED_AMOUNT: "Sabit Tutar", FREE_SHIPPING: "Ücretsiz Kargo",
};

export default async function DiscountsPage() {
  const discounts = await discountService.listDiscounts();

  return (
    <div>
      <PageHeader title="İndirimler" description={`${discounts.length} indirim`}
        actions={
          <Link href="/admin/discounts/new" className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Yeni İndirim
          </Link>
        }
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Ad</th>
              <th className="px-4 py-3 text-left">Tür</th>
              <th className="px-4 py-3 text-left">Değer</th>
              <th className="px-4 py-3 text-left">Kupon</th>
              <th className="px-4 py-3 text-left">Başlangıç</th>
              <th className="px-4 py-3 text-left">Bitiş</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {discounts.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">Henüz indirim yok.</td></tr>
            ) : discounts.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[d.type]}</td>
                <td className="px-4 py-3 text-gray-600">
                  {d.type === "PERCENTAGE" ? `%${d.value}` : d.type === "FREE_SHIPPING" ? "—" : String(d.value)}
                </td>
                <td className="px-4 py-3 text-gray-600">{d._count.coupons}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(d.startsAt).toLocaleDateString("tr-TR")}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{d.endsAt ? new Date(d.endsAt).toLocaleDateString("tr-TR") : "—"}</td>
                <td className="px-4 py-3"><StatusBadge active={d.active} /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/discounts/${d.id}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                    Düzenle <ChevronRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
