import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { storefrontProductService } from "@/server/services/storefront/storefront-product.service";
import { marketService } from "@/server/services/market.service";
import { ProductCard } from "@/components/store/product/ProductCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const col = await prisma.collection.findUnique({ where: { slug }, select: { name: true } });
  return { title: col?.name ?? "Koleksiyon" };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [collection, market, defaultMarket] = await Promise.all([
    prisma.collection.findUnique({ where: { slug, active: true } }),
    getActiveMarket(),
    marketService.findDefault(),
  ]);

  if (!collection || !market) return notFound();

  const marketCtx = {
    marketId: market.id,
    fallbackPricing: market.fallbackPricing,
    defaultMarketId: defaultMarket?.id ?? null,
    currency: { code: market.defaultCurrency.code, symbol: market.defaultCurrency.symbol, decimalDigits: market.defaultCurrency.decimalDigits },
  };

  const { products, total } = await storefrontProductService.listForMarket(marketCtx, { collectionSlug: slug });

  return (
    <div>
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-gray-700">{collection.name}</span>
      </nav>

      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
        <p className="text-sm text-gray-500">{total} ürün</p>
      </div>
      {collection.description && <p className="mb-6 text-sm text-gray-500">{collection.description}</p>}

      {products.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400">Bu koleksiyonda ürün bulunamadı.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} fallbackPricing={market.fallbackPricing} />)}
        </div>
      )}
    </div>
  );
}
