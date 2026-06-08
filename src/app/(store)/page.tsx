import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { getCustomerSession } from "@/lib/customer-session";
import { storefrontProductService } from "@/server/services/storefront/storefront-product.service";
import { marketService } from "@/server/services/market.service";
import { getSettings } from "@/lib/utils/settings";
import { ProductCard } from "@/components/store/product/ProductCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ana Sayfa" };

const SETTING_KEYS = [
  "hero_title", "hero_description", "hero_cta_text", "hero_cta_url", "hero_image_url",
  "about_short", "store_name",
];

export default async function StorefrontHomePage() {
  const [market, defaultMarket, customerId, s, categories, collections] = await Promise.all([
    getActiveMarket(),
    marketService.findDefault(),
    getCustomerSession(),
    getSettings(SETTING_KEYS),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      take: 6,
      select: { id: true, name: true, slug: true, imageUrl: true, description: true },
    }),
    prisma.collection.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      take: 3,
      select: { id: true, name: true, slug: true, imageUrl: true, description: true },
    }),
  ]);

  if (!market) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-[13px] text-[#a3a3a3] uppercase tracking-widest">Yapılandırma Gerekli</p>
          <h1 className="mt-3 text-2xl font-bold text-[#0a0a0a]">Mağaza henüz hazır değil</h1>
          <p className="mt-2 text-sm text-[#525252]">Admin panelinden bir pazar oluşturun.</p>
        </div>
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

  const { products } = await storefrontProductService.listForMarket(marketCtx, { perPage: 8 });

  const heroTitle   = s.hero_title       || "Her Anın İçin\nTasarlandı";
  const heroDesc    = s.hero_description || "Zamanın ötesinde kalite. Birbirinden özel koleksiyonlar.";
  const heroCtaText = s.hero_cta_text    || "Keşfet";
  const heroCtaUrl  = s.hero_cta_url     || "/products";

  return (
    <div>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative h-[88vh] min-h-[620px] max-h-[880px] overflow-hidden bg-[#0a0a0a]">
        {s.hero_image_url ? (
          <>
            <Image
              src={s.hero_image_url}
              alt={heroTitle}
              fill
              className="object-cover opacity-65"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/70" />
          </>
        ) : (
          <div className="store-hero-fallback absolute inset-0" />
        )}

        {/* Koleksiyon vurgusu — sağ üstte zarif kart */}
        {collections[0] && (
          <Link
            href={`/collections/${collections[0].slug}`}
            className="absolute right-6 top-8 z-10 hidden items-center gap-3 border border-white/15 bg-white/[0.06] px-4 py-3 backdrop-blur-md transition-colors hover:bg-white/[0.12] sm:flex max-w-[270px]"
          >
            {collections[0].imageUrl && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden">
                <Image src={collections[0].imageUrl} alt={collections[0].name} fill className="object-cover" sizes="48px" />
              </div>
            )}
            <div className="min-w-0">
              <p className="store-eyebrow text-white/45">Öne Çıkan Koleksiyon</p>
              <p className="truncate text-[13px] font-medium text-white">{collections[0].name}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-white/40" strokeWidth={1.5} />
          </Link>
        )}

        <div className="relative flex h-full flex-col justify-end pb-16 px-6 max-w-[1400px] mx-auto sm:pb-20">
          <p className="store-eyebrow text-white/55 mb-5">
            {s.store_name || "Mağaza"} · {market.name} · {market.defaultCurrency.code}
          </p>
          <h1 className="font-serif text-white font-semibold leading-[1.02] tracking-tight whitespace-pre-line"
              style={{ fontSize: "clamp(2.75rem, 7.5vw, 6.5rem)" }}>
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-[15px] text-white/65 leading-relaxed">
            {heroDesc}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={heroCtaUrl}
              className="inline-flex items-center gap-2 rounded-none bg-white px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0a0a0a] transition-colors hover:bg-[#f2f2f2]"
            >
              {heroCtaText}
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 rounded-none border border-white/40 px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white/10"
            >
              Koleksiyonlar
            </Link>
          </div>
          {s.about_short && (
            <p className="mt-7 max-w-lg border-l border-white/20 pl-4 text-[12.5px] leading-relaxed text-white/40">
              {s.about_short}
            </p>
          )}
        </div>

        {/* Kaydırma ipucu */}
        <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">Aşağı kaydır</span>
          <span className="h-9 w-px bg-gradient-to-b from-white/35 to-transparent" />
        </div>
      </section>

      {/* ══ KATEGORILER ═══════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-20 px-6 max-w-[1400px] mx-auto">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="store-eyebrow mb-2">Kategoriler</p>
              <h2 className="store-section-title">Ne arıyorsunuz?</h2>
            </div>
            <Link href="/products" className="text-[13px] font-medium text-[#525252] hover:text-[#0a0a0a] transition-colors">
              Tüm ürünler →
            </Link>
          </div>

          {/* Büyük kategori blokları */}
          {categories.length >= 3 ? (
            <div className="grid grid-cols-12 gap-3">
              {/* İlk: büyük */}
              <Link
                href={`/categories/${categories[0].slug}`}
                className="store-card group col-span-12 md:col-span-7 relative overflow-hidden bg-[#0a0a0a]"
                style={{ aspectRatio: "16/9" }}
              >
                {categories[0].imageUrl ? (
                  <Image src={categories[0].imageUrl} alt={categories[0].name} fill
                    className="store-card-img object-cover opacity-75 group-hover:opacity-60"
                    sizes="(max-width: 768px) 100vw, 60vw" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="store-eyebrow text-white/50 mb-2">{categories[0].name}</p>
                  {categories[0].description && (
                    <p className="text-[13px] text-white/70 leading-relaxed mb-4 line-clamp-2 max-w-sm">
                      {categories[0].description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white border-b border-white/30 pb-0.5 group-hover:border-white transition-colors">
                    Keşfet
                  </span>
                </div>
              </Link>

              {/* Sağ sütun */}
              <div className="col-span-12 md:col-span-5 grid grid-rows-2 gap-3">
                {categories.slice(1, 3).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="store-card group relative overflow-hidden bg-[#0a0a0a]"
                  >
                    {cat.imageUrl ? (
                      <Image src={cat.imageUrl} alt={cat.name} fill
                        className="store-card-img object-cover opacity-75 group-hover:opacity-60"
                        sizes="40vw" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="store-eyebrow text-white/50 mb-1">{cat.name}</p>
                      <span className="text-white text-[12px] font-semibold uppercase tracking-[0.08em] border-b border-white/30 pb-0.5 group-hover:border-white transition-colors">
                        Keşfet
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Kalan kategoriler — küçük */}
              {categories.length > 3 && (
                <div className="col-span-12 grid grid-cols-3 gap-3 md:grid-cols-6">
                  {categories.slice(3).map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      className="store-card group relative overflow-hidden bg-[#0a0a0a]"
                      style={{ aspectRatio: "1/1" }}
                    >
                      {cat.imageUrl ? (
                        <Image src={cat.imageUrl} alt={cat.name} fill
                          className="store-card-img object-cover opacity-70 group-hover:opacity-55" sizes="15vw" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                        <span className="text-white text-[11px] font-semibold uppercase tracking-[0.07em] leading-tight line-clamp-2">
                          {cat.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* 1-2 kategori için basit grid */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="store-card group relative overflow-hidden bg-[#f2f2f2]"
                  style={{ aspectRatio: "16/9" }}
                >
                  {cat.imageUrl ? (
                    <Image src={cat.imageUrl} alt={cat.name} fill
                      className="store-card-img object-cover" sizes="50vw" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#e5e5e5] to-[#f2f2f2]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <p className="store-eyebrow text-white/70 mb-1">{cat.name}</p>
                    <span className="text-white text-[13px] font-medium">Keşfet →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══ ÖNE ÇIKAN ÜRÜNLER ════════════════════════════════════════════════ */}
      <section className="py-20 px-6 max-w-[1400px] mx-auto">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="store-eyebrow mb-2">Yeni Gelenler</p>
            <h2 className="store-section-title">Öne Çıkanlar</h2>
          </div>
          <Link href="/products" className="text-[13px] font-medium text-[#525252] hover:text-[#0a0a0a] transition-colors">
            Tümünü gör →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="border border-dashed border-[#e5e5e5] py-24 text-center">
            <p className="store-eyebrow text-[#a3a3a3]">Henüz ürün yok</p>
            <p className="mt-2 text-sm text-[#525252]">Admin panelinden ürün ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} fallbackPricing={market.fallbackPricing} isLoggedIn={!!customerId} />
            ))}
          </div>
        )}
      </section>

      {/* ══ KOLEKSİYONLAR — editorial ════════════════════════════════════════ */}
      {collections.length > 0 && (
        <section className="py-20 bg-[#f9f9f9]">
          <div className="px-6 max-w-[1400px] mx-auto">
            <div className="mb-10">
              <p className="store-eyebrow mb-2">Koleksiyonlar</p>
              <h2 className="store-section-title">Dünyamızı Keşfedin</h2>
            </div>
          </div>

          {/* Full-width horizontal scroll */}
          <div className="flex gap-3 px-6 max-w-[1400px] mx-auto">
            {collections.map((col, i) => (
              <Link
                key={col.slug}
                href={`/collections/${col.slug}`}
                className="store-card group relative shrink-0 overflow-hidden bg-[#e5e5e5]"
                style={{
                  width: i === 0 ? "min(55%, 700px)" : "min(35%, 440px)",
                  aspectRatio: "3/4",
                  flexShrink: 0,
                }}
              >
                {col.imageUrl ? (
                  <Image
                    src={col.imageUrl}
                    alt={col.name}
                    fill
                    className="store-card-img object-cover"
                    sizes="50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d4d4d4] to-[#e5e5e5]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-8 left-7 right-7">
                  <p className="store-eyebrow text-white/60 mb-2">{col.name}</p>
                  {col.description && (
                    <p className="text-[13px] text-white/80 leading-relaxed line-clamp-2 mb-4">
                      {col.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">
                    Koleksiyonu Gör
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══ HAKKIMIZDA ════════════════════════════════════════════════════════ */}
      {s.about_short && (
        <section className="py-24 px-6 max-w-[1400px] mx-auto">
          <div className="max-w-2xl">
            <p className="store-eyebrow mb-4">Hakkımızda</p>
            <p className="text-[18px] leading-relaxed text-[#262626] font-normal">
              {s.about_short}
            </p>
            <Link
              href="/hakkimizda"
              className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0a0a0a] border-b border-[#0a0a0a] pb-0.5 hover:text-[#525252] hover:border-[#525252] transition-colors"
            >
              Daha fazla
            </Link>
          </div>
        </section>
      )}

      {/* ══ AYIRICI BAR ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-[#e5e5e5]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 divide-x divide-[#e5e5e5] md:grid-cols-4">
            {[
              { label: "Hızlı Kargo",    sub: "2–4 iş günü teslimat" },
              { label: "Kolay İade",     sub: "30 gün içinde ücretsiz" },
              { label: "Güvenli Ödeme",  sub: "256-bit SSL şifreleme" },
              { label: "7/24 Destek",    sub: "Her zaman yanınızdayız" },
            ].map(({ label, sub }) => (
              <div key={label} className="py-8 px-6 text-center">
                <p className="text-[13px] font-semibold text-[#0a0a0a]">{label}</p>
                <p className="mt-1 text-[12px] text-[#a3a3a3]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
