import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Globe, Star } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { marketService } from "@/server/services/market.service";
import { currencyService } from "@/server/services/currency.service";
import { MarketForm } from "@/components/admin/markets/MarketForm";

export const metadata: Metadata = { title: "Pazarlar" };

const FALLBACK_LABELS: Record<string, string> = {
  BLOCK: "Satışa Kapat",
  USE_BASE_PRICE: "Temel Fiyat",
  USE_DEFAULT: "Varsayılan Pazar",
};

export default async function MarketsPage() {
  const [markets, activeCurrencies] = await Promise.all([
    marketService.list(),
    currencyService.listActive(),
  ]);

  return (
    <div>
      <PageHeader
        title="Pazarlar"
        description="Her pazar kendi para birimi, ülkeleri, kargo ve vergi kurallarına sahip olabilir."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol: Liste */}
        <div className="lg:col-span-2">
          {markets.length === 0 ? (
            <EmptyState
              title="Henüz pazar oluşturulmadı"
              description="Aşağıdaki formdan ilk pazarınızı oluşturun."
            />
          ) : (
            <div className="space-y-3">
              {markets.map((market) => (
                <Link
                  key={market.id}
                  href={`/admin/markets/${market.id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                      <Globe className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{market.name}</span>
                        {market.isDefault && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-mono">{market.defaultCurrency.code}</span>
                        <span>·</span>
                        <span>{market._count.marketCountries} ülke</span>
                        <span>·</span>
                        <span>{FALLBACK_LABELS[market.fallbackPricing]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{market._count.orders} sipariş</span>
                    <StatusBadge active={market.active} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sağ: Form */}
        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Yeni Pazar</h2>
            </div>
            {activeCurrencies.length === 0 ? (
              <p className="text-sm text-amber-600">
                Pazar oluşturmak için önce en az bir para birimini aktif edin.
              </p>
            ) : (
              <MarketForm currencies={activeCurrencies} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
