import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { storefrontProductService } from "@/server/services/storefront/storefront-product.service";
import { marketService } from "@/server/services/market.service";
import { getCustomerSession } from "@/lib/customer-session";
import { favoritesService } from "@/server/services/storefront/favorites.service";
import { productService } from "@/server/services/product.service";
import { taxService } from "@/server/services/tax.service";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/store/product/ProductDetailClient";
import { RelatedProducts } from "@/components/store/product/RelatedProducts";
import { ProductDescriptionAccordion } from "@/components/store/product/ProductDescriptionAccordion";
import { formatPrice } from "@/lib/utils/pricing";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    select: { name: true, seoTitle: true, seoDescription: true, description: true },
  });
  return {
    title: product?.seoTitle ?? product?.name ?? slug,
    description: product?.seoDescription ?? product?.description?.slice(0, 160) ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [market, defaultMarket, customerId] = await Promise.all([
    getActiveMarket(),
    marketService.findDefault(),
    getCustomerSession(),
  ]);

  if (!market) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="store-eyebrow text-[#a3a3a3]">Mağaza henüz yapılandırılmamış.</p>
        <Link href="/" className="mt-4 text-[13px] text-[#525252] underline">Ana Sayfaya Dön</Link>
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

  const product = await storefrontProductService.getBySlug(slug, marketCtx);
  if (!product) return notFound();

  const [isFavorited, relatedRaw] = await Promise.all([
    customerId ? favoritesService.isFavorited(customerId, product.id) : false,
    productService.getRelated(product.id, null, 4),
  ]);

  // Kargo bilgisi
  let shippingInfo: string | null = null;
  const shippingZone = await prisma.shippingZone.findFirst({
    where: { marketId: market.id },
    include: { rates: { where: { active: true }, include: { currency: true }, take: 1 } },
  });
  if (shippingZone?.rates[0]) {
    const rate = shippingZone.rates[0];
    const rateNum = Number(rate.rate);
    shippingInfo = rateNum === 0
      ? "Ücretsiz kargo"
      : `${formatPrice(rateNum, { code: rate.currency.code, symbol: rate.currency.symbol, decimalDigits: rate.currency.decimalDigits })} kargo`;
    if (rate.freeAbove) {
      shippingInfo += ` · ${formatPrice(Number(rate.freeAbove), { code: rate.currency.code, symbol: rate.currency.symbol, decimalDigits: rate.currency.decimalDigits })} üzeri ücretsiz`;
    }
  }

  // Vergi bilgisi
  const activeCountry = await prisma.country.findFirst({ where: { active: true } });
  const taxInfo = activeCountry ? await taxService.list({ countryId: activeCountry.id }) : [];
  const relevantTax = taxInfo.find((t) => t.taxClass === product.taxClass && t.active);

  const accordionItems = [
    ...(product.description ? [{
      title: "Ürün Açıklaması",
      body: product.description,
      defaultOpen: true,
    }] : []),
    {
      title: "Kargo & Teslimat",
      body: shippingInfo
        ? `${shippingInfo}. Siparişler 1–2 iş günü içinde kargoya verilir ve 2–4 iş günü içinde teslim edilir.`
        : "Siparişler 1–2 iş günü içinde kargoya verilir ve 2–4 iş günü içinde teslim edilir.",
    },
    {
      title: "İade Politikası",
      body: "Teslimattan itibaren 30 gün içinde, kullanılmamış ve orijinal ambalajında ürünlerinizi ücretsiz olarak iade edebilirsiniz.",
    },
  ];

  // Sağ kolon ek içeriği (server-rendered, client wrapper'a slot olarak geçilir)
  const rightSlot = (
    <>
      {/* Etiketler */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-6 border-b border-[#e5e5e5]">
          {product.tags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="border border-[#e5e5e5] px-3 py-1 text-[11px] text-[#525252] hover:border-[#a3a3a3] transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Accordion: açıklama / kargo / iade */}
      <ProductDescriptionAccordion items={accordionItems} />

      {/* Vergi ve koleksiyonlar */}
      <div className="pt-4 space-y-2">
        {relevantTax && (
          <p className="text-[11px] text-[#a3a3a3]">
            {relevantTax.inclusionType === "INCLUSIVE"
              ? `Fiyata %${(Number(relevantTax.rate) * 100).toFixed(0)} KDV dahildir`
              : `%${(Number(relevantTax.rate) * 100).toFixed(0)} KDV ayrıca eklenir`}
          </p>
        )}
        {product.collections.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] text-[#a3a3a3]">Koleksiyonlar:</span>
            {product.collections.map((col) => (
              <Link key={col.slug} href={`/collections/${col.slug}`}
                className="text-[11px] text-[#525252] underline underline-offset-2 hover:text-[#0a0a0a]">
                {col.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-[#e5e5e5] px-6 py-4 max-w-[1400px] mx-auto">
        <nav className="flex items-center gap-2 text-[12px] text-[#a3a3a3]">
          <Link href="/" className="hover:text-[#0a0a0a] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#0a0a0a] transition-colors">Ürünler</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/categories/${product.category.slug}`}
                className="hover:text-[#0a0a0a] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#0a0a0a]">{product.name}</span>
        </nav>
      </div>

      {/* Ana içerik — client wrapper (galeri ↔ varyant senkronizasyonu) */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <ProductDetailClient
          images={product.images}
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          categoryName={product.category?.name ?? null}
          vendor={product.vendor ?? null}
          taxClass={product.taxClass}
          fallbackPricing={market.fallbackPricing}
          variants={product.variants}
          isLoggedIn={!!customerId}
          isFavorited={isFavorited}
          shippingInfo={shippingInfo}
          rightSlot={rightSlot}
        />
      </div>

      {/* İlgili Ürünler */}
      {relatedRaw.length > 0 && (
        <div className="border-t border-[#e5e5e5] py-16">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="mb-8">
              <p className="store-eyebrow mb-2">Bunları da sevebilirsiniz</p>
              <h2 className="store-section-title">İlgili Ürünler</h2>
            </div>
          </div>
          <div className="max-w-[1400px] mx-auto px-6">
            <RelatedProducts
              products={relatedRaw.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                images: p.images,
                variants: p.variants.map((v) => ({
                  basePrice: Number(v.basePrice),
                  prices: v.prices.map((pr) => ({
                    marketId: pr.marketId,
                    price: Number(pr.price),
                    compareAtPrice: pr.compareAtPrice ? Number(pr.compareAtPrice) : null,
                    currency: { code: pr.currency.code, symbol: pr.currency.symbol, decimalDigits: pr.currency.decimalDigits },
                  })),
                })),
              }))}
              marketId={market.id}
              fallbackPricing={market.fallbackPricing}
              defaultMarketId={defaultMarket?.id ?? null}
              currency={marketCtx.currency}
            />
          </div>
        </div>
      )}
    </div>
  );
}
