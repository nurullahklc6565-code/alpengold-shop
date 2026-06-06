import Link from "next/link";
import Image from "next/image";
import { resolveVariantPrice, formatPrice } from "@/lib/utils/pricing";
import type { FallbackPricing } from "@prisma/client";

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  images: Array<{ url: string; alt: string | null }>;
  variants: Array<{
    basePrice: number | string;
    prices: Array<{
      marketId: string;
      price: number | string;
      compareAtPrice: number | string | null;
      currency: { code: string; symbol: string; decimalDigits: number };
    }>;
  }>;
};

type Props = {
  products: RelatedProduct[];
  marketId: string;
  fallbackPricing: FallbackPricing;
  defaultMarketId: string | null;
  currency: { code: string; symbol: string; decimalDigits: number };
};

export function RelatedProducts({ products, marketId, fallbackPricing, defaultMarketId, currency }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-100 pt-10">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">İlgili Ürünler</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((p) => {
          const variant = p.variants[0];
          const resolved = variant
            ? resolveVariantPrice({
                variant: {
                  basePrice: Number(variant.basePrice),
                  prices: variant.prices.map((pr) => ({
                    marketId: pr.marketId,
                    price: Number(pr.price),
                    compareAtPrice: pr.compareAtPrice ? Number(pr.compareAtPrice) : null,
                    currency: pr.currency,
                  })),
                },
                marketId,
                fallbackPricing,
                marketCurrency: currency,
                defaultMarketId,
              })
            : null;

          return (
            <Link key={p.id} href={`/products/${p.slug}`} className="group">
              <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                {p.images[0] ? (
                  <Image
                    src={p.images[0].url}
                    alt={p.images[0].alt ?? p.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-2 space-y-0.5">
                <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-gray-600 transition-colors">
                  {p.name}
                </p>
                {resolved && (
                  <p className="text-sm font-semibold text-gray-700">
                    {formatPrice(resolved.price, resolved.currency)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
