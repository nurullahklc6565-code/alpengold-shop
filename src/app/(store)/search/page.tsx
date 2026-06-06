import type { Metadata } from "next";
import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { storefrontProductService } from "@/server/services/storefront/storefront-product.service";
import { marketService } from "@/server/services/market.service";
import { ProductCard } from "@/components/store/product/ProductCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Arama" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim();
  const categoryFilter = sp.category;
  const sort = sp.sort ?? "relevance";

  const [market, defaultMarket, categories] = await Promise.all([
    getActiveMarket(),
    marketService.findDefault(),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!market) return null;

  const marketCtx = {
    marketId: market.id,
    fallbackPricing: market.fallbackPricing,
    defaultMarketId: defaultMarket?.id ?? null,
    currency: { code: market.defaultCurrency.code, symbol: market.defaultCurrency.symbol, decimalDigits: market.defaultCurrency.decimalDigits },
  };

  const { products, total } = query
    ? await storefrontProductService.listForMarket(marketCtx, {
        search: query,
        categorySlug: categoryFilter,
        perPage: 48,
      })
    : { products: [], total: 0 };

  const SORT_OPTIONS = [
    { value: "relevance", label: "Alakalı" },
    { value: "newest", label: "En Yeni" },
    { value: "price_asc", label: "Fiyat ↑" },
    { value: "price_desc", label: "Fiyat ↓" },
  ];

  return (
    <div>
      {/* Arama kutusu */}
      <div className="mb-6">
        <form>
          {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
          <div className="flex gap-2">
            <input
              name="q"
              defaultValue={query}
              placeholder="Ürün, marka veya kategori ara…"
              autoFocus
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button type="submit" className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
              Ara
            </button>
          </div>
        </form>
      </div>

      {query && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Sıralama */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/search?q=${encodeURIComponent(query)}${categoryFilter ? `&category=${categoryFilter}` : ""}&sort=${opt.value}`}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  sort === opt.value ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {/* Kategori filtresi */}
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={`/search?q=${encodeURIComponent(query)}&sort=${sort}`}
              className={cn("rounded-full px-3 py-1 text-xs transition-colors", !categoryFilter ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50")}
            >
              Tümü
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?q=${encodeURIComponent(query)}&category=${cat.slug}&sort=${sort}`}
                className={cn("rounded-full px-3 py-1 text-xs transition-colors", categoryFilter === cat.slug ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50")}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <span className="text-sm text-gray-500">{total} sonuç</span>
        </div>
      )}

      {query ? (
        products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400">
              <span className="font-medium text-gray-700">&ldquo;{query}&rdquo;</span> için sonuç bulunamadı.
            </p>
            <p className="mt-2 text-sm text-gray-400">Farklı kelimeler veya kategori filtresi deneyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} fallbackPricing={market.fallbackPricing} />
            ))}
          </div>
        )
      ) : (
        <div className="py-16 text-center">
          <p className="text-gray-400">Aramak istediğiniz ürünü, markayı veya kategoriyi yazın.</p>
          {categories.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-gray-700">Kategorilere göz at</p>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
