import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { marketService } from "@/server/services/market.service";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/pricing";

export const metadata: Metadata = { title: "Pazar Fiyatları" };

export default async function PricingPage() {
  const [markets, products] = await Promise.all([
    marketService.list(),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      take: 30,
      include: {
        variants: {
          where: { active: true },
          include: {
            prices: { include: { market: true, currency: true } },
          },
        },
      },
    }),
  ]);

  const totalVariants = products.reduce((n, p) => n + p.variants.length, 0);
  const totalPriceRecords = products.reduce(
    (n, p) => n + p.variants.reduce((vn, v) => vn + v.prices.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pazar Bazlı Fiyatlar"
        description="Aktif ürünlerin pazar fiyat durumu. Fiyat girmek için ürün detay sayfasını kullanın."
      />

      {/* Özet */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Aktif Ürün", value: products.length },
          { label: "Toplam Varyant", value: totalVariants },
          { label: "Fiyat Kaydı", value: totalPriceRecords },
          { label: "Aktif Pazar", value: markets.filter((m) => m.active).length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Ürün × Pazar fiyat durumu */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Ürün</th>
              {markets.slice(0, 4).map((m) => (
                <th key={m.id} className="px-4 py-3 text-center">
                  {m.name}
                  <span className="block font-normal normal-case text-gray-400">{m.defaultCurrency.code}</span>
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const firstVariant = product.variants[0];
              const variantCount = product.variants.length;
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">{variantCount} varyant</p>
                  </td>
                  {markets.slice(0, 4).map((market) => {
                    const price = firstVariant?.prices.find((p) => p.marketId === market.id);
                    const cur = price
                      ? { code: price.currency.code, symbol: price.currency.symbol, decimalDigits: price.currency.decimalDigits }
                      : { code: market.defaultCurrency.code, symbol: market.defaultCurrency.symbol, decimalDigits: market.defaultCurrency.decimalDigits };
                    return (
                      <td key={market.id} className="px-4 py-3 text-center">
                        {price ? (
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(Number(price.price), cur)}
                          </span>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            market.fallbackPricing === "BLOCK"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {market.fallbackPricing === "BLOCK" ? "Satışa Kapalı" : "Fallback"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${product.id}`} className="text-xs text-gray-500 hover:text-gray-900">
                      Fiyat Ekle →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
