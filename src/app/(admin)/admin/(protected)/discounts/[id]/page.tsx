import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { DiscountForm } from "@/components/admin/discounts/DiscountForm";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { discountService } from "@/server/services/discount.service";
import { deleteDiscountAction, addCouponFormAction, deleteCouponAction } from "@/server/actions/admin/discount";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "İndirim Düzenle" };

async function CouponSection({ discountId }: { discountId: string }) {
  const coupons = await discountService.listCoupons(discountId);
  return (
    <SectionCard title="Kuponlar" description="Bu indirime bağlı kupon kodları">
      <form action={addCouponFormAction} className="flex gap-2 mb-4">
        <input type="hidden" name="discountId" value={discountId} />
        <input name="code" placeholder="YENILIK20" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 uppercase" style={{ textTransform: "uppercase" }} required />
        <input name="usageLimit" type="number" min="1" placeholder="Limit" className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Ekle</button>
      </form>

      <div className="space-y-2">
        {coupons.length === 0 ? (
          <p className="text-sm text-gray-400">Henüz kupon yok.</p>
        ) : coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
            <div className="flex items-center gap-3">
              <code className="text-sm font-mono font-bold text-gray-900">{c.code}</code>
              <span className="text-xs text-gray-500">{c.usedCount}/{c.usageLimit ?? "∞"} kullanım</span>
              {!c.active && <span className="text-xs text-red-500">Pasif</span>}
            </div>
            <form action={deleteCouponAction.bind(null, c.id)}>
              <button type="submit" className="text-xs text-red-500 hover:text-red-700">Sil</button>
            </form>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export default async function DiscountEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [discount, markets] = await Promise.all([
    discountService.getDiscount(id),
    prisma.market.findMany({ where: { active: true }, select: { id: true, name: true } }),
  ]);
  if (!discount) return notFound();

  const deleteAction = deleteDiscountAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/discounts" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">{discount.name}</h1>
        </div>
        <DeleteButton onDelete={deleteAction} confirmMessage={`"${discount.name}" indirimini silmek istediğinizden emin misiniz?`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="İndirim Bilgileri">
          <DiscountForm discount={discount} markets={markets} />
        </SectionCard>
        <CouponSection discountId={id} />
      </div>
    </div>
  );
}
