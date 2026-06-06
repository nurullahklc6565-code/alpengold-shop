import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { DiscountForm } from "@/components/admin/discounts/DiscountForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Yeni İndirim" };

export default async function NewDiscountPage() {
  const markets = await prisma.market.findMany({ where: { active: true }, select: { id: true, name: true } });
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/discounts" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Yeni İndirim</h1>
      </div>
      <div className="max-w-lg">
        <SectionCard title="İndirim Bilgileri">
          <DiscountForm markets={markets} />
        </SectionCard>
      </div>
    </div>
  );
}
