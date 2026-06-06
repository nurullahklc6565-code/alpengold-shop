import type { Metadata } from "next";
import Link from "next/link";
import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { storefrontProductService } from "@/server/services/storefront/storefront-product.service";
import { marketService } from "@/server/services/market.service";
import { ProductCard } from "@/components/store/product/ProductCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ürünler" };

export default async function ProductsStorePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const [market, defaultMarket, categories] = await Promise.all([
    getActiveMarket(),
    marketService.findDefault(),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  if (!market) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="store-eyebrow text-[#a3a3a3]">Pazar yapılandırılmamış</p>
      </div>
    );
  }

  const marketCtx = {
    marketId: market.id,
    fallbackPricing: market.fallbackPricing,
    defaultMarketId: defaultMarket?.id ?? null,
    currency: {
      code: market.defaultCurrency.code,
      symbol: market.defaultCurrency.symbol,
      decimalDigits: market.defaultCurrency.decimalDigits,
    },
  };

  const { products, total, totalPages, page } = await storefrontProductService.listForMarket(
    marketCtx,
    { search: sp.search, categorySlug: sp.category, page: parseInt(sp.page ?? "1") }
  );

  const activeCat = categories.find((c) => c.slug === sp.category);

  return (
    <div>
      {/* Başlık */}
      <div className="border-b border-[#e5e5e5] px-6 py-10 max-w-[1400px] mx-auto">
        <p className="store-eyebrow mb-2">Mağaza</p>
        <h1 className="store-section-title">{activeCat ? activeCat.name : "Tüm Ürünler"}</h1>
        {total > 0 && <p className="mt-2 text-[13px] text-[#a3a3a3]">{total} ürün</p>}
      </div>

      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex gap-12 py-10">

          {/* Sidebar */}
          <aside className="hidden lg:block w-[200px] shrink-0">
            <div className="sticky top-[80px] space-y-6">
              <form>
                {sp.category && <input type="hidden" name="category" value={sp.category} />}
                <input
                  name="search"
                  defaultValue={sp.search}
                  placeholder="Ürün ara…"
                  className="w-full border-b border-[#e5e5e5] pb-2 text-[13px] text-[#0a0a0a] placeholder:text-[#a3a3a3] bg-transparent outline-none focus:border-[#0a0a0a] transition-colors"
                />
              </form>

              <div>
                <p className="store-eyebrow mb-3">Kategoriler</p>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/products"
                      className={`block text-[13px] transition-colors ${!sp.category ? "font-semibold text-[#0a0a0a]" : "text-[#525252] hover:text-[#0a0a0a]"}`}>
                      Tümü
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link href={`/products?category=${cat.slug}`}
                        className={`block text-[13px] transition-colors ${sp.category === cat.slug ? "font-semibold text-[#0a0a0a]" : "text-[#525252] hover:text-[#0a0a0a]"}`}>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Ürün grid */}
          <div className="flex-1 min-w-0">
            {/* Mobil arama */}
            <form className="mb-6 lg:hidden">
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              <input name="search" defaultValue={sp.search} placeholder="Ürün ara…"
                className="w-full border-b border-[#e5e5e5] pb-2 text-[13px] text-[#0a0a0a] placeholder:text-[#a3a3a3] bg-transparent outline-none focus:border-[#0a0a0a] transition-colors" />
            </form>

            {/* Mobil kategori pills */}
            {categories.length > 0 && (
              <div className="mb-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
                {[{ name: "Tümü", slug: "" }, ...categories].map((cat) => (
                  <Link key={cat.slug || "all"} href={cat.slug ? `/products?category=${cat.slug}` : "/products"}
                    className={`shrink-0 border px-4 py-1.5 text-[12px] font-medium transition-colors ${
                      (cat.slug === "" && !sp.category) || sp.category === cat.slug
                        ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                        : "border-[#e5e5e5] text-[#525252] hover:border-[#0a0a0a]"
                    }`}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            {products.length === 0 ? (
              <div className="flex h-[40vh] flex-col items-center justify-center border border-dashed border-[#e5e5e5]">
                <p className="store-eyebrow text-[#a3a3a3]">Ürün bulunamadı</p>
                {sp.search && <p className="mt-2 text-sm text-[#525252]">"{sp.search}" için sonuç yok</p>}
                <Link href="/products" className="mt-6 text-[13px] font-medium text-[#0a0a0a] underline underline-offset-2">
                  Tüm ürünlere dön
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} fallbackPricing={market.fallbackPricing} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link key={p}
                        href={`/products?page=${p}${sp.category ? `&category=${sp.category}` : ""}${sp.search ? `&search=${sp.search}` : ""}`}
                        className={`flex h-9 w-9 items-center justify-center text-[13px] font-medium transition-colors ${p === page ? "bg-[#0a0a0a] text-white" : "text-[#525252] hover:text-[#0a0a0a]"}`}>
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
