import Link from "next/link";
import { Search, User } from "lucide-react";
import { MarketSwitcher } from "./MarketSwitcher";
import { HeaderActions } from "./HeaderActions";
import { MobileMenu } from "./MobileMenu";
import { getSettings } from "@/lib/utils/settings";
import { prisma } from "@/lib/prisma";

type Props = { currentMarketId: string };

export async function StoreHeader({ currentMarketId }: Props) {
  const [categories, markets, s] = await Promise.all([
    prisma.category.findMany({
      where: { active: true, parentId: null },
      orderBy: { position: "asc" },
      take: 5,
      select: { name: true, slug: true },
    }),
    prisma.market.findMany({
      where: { active: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      include: { defaultCurrency: { select: { code: true, symbol: true } } },
    }),
    getSettings(["store_name", "store_logo_url"]),
  ]);

  const storeName = s.store_name || "STORE";

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* İnce üst şerit — premium dokunuş */}
      <div className="hidden border-b border-[#ededed] bg-[#0a0a0a] sm:block">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4d4d4]">
            Seçkin koleksiyonlara ücretsiz kargo
          </p>
          <MarketSwitcher markets={markets} currentMarketId={currentMarketId} />
        </div>
      </div>

      {/* Ana navigasyon */}
      <div className="border-b border-[#e5e5e5]">
        <div className="mx-auto grid h-[68px] sm:h-[76px] max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:gap-4 sm:px-6">
          {/* Sol: mobil menü + arama */}
          <div className="flex items-center justify-start gap-0.5 sm:gap-1">
            <MobileMenu categories={categories} storeName={storeName} />
            <Link
              href="/search"
              className="flex h-9 w-9 items-center justify-center text-[#525252] transition-colors hover:text-[#0a0a0a]"
              aria-label="Ara"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
          </div>

          {/* Orta: logo */}
          <Link href="/" className="min-w-0 shrink justify-self-center overflow-hidden">
            {s.store_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.store_logo_url} alt={storeName} className="h-7 sm:h-8 w-auto object-contain" />
            ) : (
              <span className="block truncate font-serif text-[16px] sm:text-[22px] font-semibold tracking-[0.10em] sm:tracking-[0.22em] text-[#0a0a0a]">
                {storeName}
              </span>
            )}
          </Link>

          {/* Sağ: hesap + favoriler + sepet */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <Link
              href="/account"
              className="hidden sm:flex h-9 w-9 items-center justify-center text-[#525252] transition-colors hover:text-[#0a0a0a]"
              aria-label="Hesabım"
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
            <HeaderActions />
          </div>
        </div>

        {/* Kategori navigasyonu — sade ve aralıklı */}
        {categories.length > 0 && (
          <nav className="hidden lg:block">
            <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-center gap-10 px-6">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#737373] transition-colors hover:text-[#0a0a0a]"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/collections"
                className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#0a0a0a] transition-colors hover:text-[#525252]"
              >
                Koleksiyonlar
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
