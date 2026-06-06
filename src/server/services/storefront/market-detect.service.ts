import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Currency, Market } from "@prisma/client";

export type ActiveMarket = Market & { defaultCurrency: Currency };

const MARKET_COOKIE = "preferred_market_id";

/**
 * Aktif pazarı tespit eder. Öncelik sırası:
 *   1. Kullanıcının kayıtlı tercihi (cookie)
 *   2. CDN/proxy geo header'ı (CF-IPCountry, X-Geo-Country)
 *   3. DB'deki varsayılan pazar (isDefault=true)
 *   4. İlk aktif pazar (son çare)
 *
 * Hiçbir ülke koda bağımlı değildir — eşleşme DB'deki MarketCountry üzerinden yapılır.
 */
export async function getActiveMarket(): Promise<ActiveMarket | null> {
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);

  // ── 1. Kullanıcı tercihi (cookie) ────────────────────────────────────────
  const preferredId = cookieStore.get(MARKET_COOKIE)?.value;
  if (preferredId) {
    const market = await prisma.market.findFirst({
      where: { id: preferredId, active: true },
      include: { defaultCurrency: true },
    });
    if (market) return market;
    // cookie geçersiz kalmış olabilir → sonraki adıma geç
  }

  // ── 2. Geo header'dan ülke kodu tespiti ──────────────────────────────────
  const countryCode =
    headersList.get("cf-ipcountry") ||       // Cloudflare
    headersList.get("x-geo-country") ||      // Vercel Edge / diğer proxy'ler
    headersList.get("x-vercel-ip-country");  // Vercel

  if (countryCode && countryCode !== "XX" && countryCode !== "T1") {
    const market = await prisma.market.findFirst({
      where: {
        active: true,
        marketCountries: {
          some: { country: { codeIso2: countryCode.toUpperCase() } },
        },
      },
      include: { defaultCurrency: true },
    });
    if (market) return market;
    // Ülke hiçbir pazara atanmamış → varsayılana düş
  }

  // ── 3. Varsayılan pazar ───────────────────────────────────────────────────
  const defaultMarket = await prisma.market.findFirst({
    where: { isDefault: true, active: true },
    include: { defaultCurrency: true },
  });
  if (defaultMarket) return defaultMarket;

  // ── 4. Herhangi aktif pazar (son çare) ───────────────────────────────────
  return prisma.market.findFirst({
    where: { active: true },
    include: { defaultCurrency: true },
  });
}

/** Admin ayarına göre pazar tercihini cookie'ye yazar. */
export function buildMarketCookieHeader(marketId: string): string {
  // 30 gün geçerli, httpOnly değil (client'ın okuyabilmesi için)
  return `${MARKET_COOKIE}=${marketId}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}
