import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductCreateForm } from "@/components/admin/products/ProductCreateForm";
import { categoryService } from "@/server/services/category.service";
import { marketService } from "@/server/services/market.service";

export const metadata: Metadata = { title: "Yeni Ürün" };

export default async function NewProductPage() {
  const [categories, markets] = await Promise.all([
    categoryService.listFlat(),
    marketService.list(),
  ]);

  const marketsForForm = markets.map((m) => ({
    id: m.id,
    name: m.name,
    defaultCurrency: {
      id: m.defaultCurrencyId,
      code: m.defaultCurrency.code,
      symbol: m.defaultCurrency.symbol,
    },
  }));

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Yeni Ürün</h1>
          <p className="text-xs text-gray-400">Ürünü oluşturduktan sonra varyant, pazar fiyatı ve koleksiyon yönetimini detay sayfasından yapabilirsiniz.</p>
        </div>
      </div>

      <ProductCreateForm categories={categories} markets={marketsForForm} />
    </div>
  );
}
