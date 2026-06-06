import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { MarketForm } from "@/components/admin/markets/MarketForm";
import { MarketCountryManager } from "@/components/admin/markets/MarketCountryManager";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { marketService } from "@/server/services/market.service";
import { currencyService } from "@/server/services/currency.service";
import { countryService } from "@/server/services/country.service";
import { deleteMarketAction, setDefaultMarketAction } from "@/server/actions/admin/market";
import { revalidatePath } from "next/cache";

export const metadata: Metadata = { title: "Pazar Detayı" };

const FALLBACK_LABELS: Record<string, string> = {
  BLOCK: "Satışa Kapat",
  USE_BASE_PRICE: "Temel Fiyat Kullan",
  USE_DEFAULT: "Varsayılan Pazarı Kullan",
};

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [market, activeCurrencies, activeCountries] = await Promise.all([
    marketService.get(id),
    currencyService.listActive(),
    countryService.list({ active: true, perPage: 300 }),
  ]);

  if (!market) notFound();

  const deleteAction = deleteMarketAction.bind(null, market.id);
  const setDefaultAction = setDefaultMarketAction.bind(null, market.id);

  return (
    <div>
      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/markets"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">{market.name}</h1>
              {market.isDefault && (
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              )}
              <StatusBadge active={market.active} />
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {market.defaultCurrency.code} · {market._count.marketCountries} ülke
              · {market._count.orders} sipariş
              · {market._count.productVariantPrices} fiyat kaydı
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!market.isDefault && (
            <form action={setDefaultAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <Star className="h-3.5 w-3.5" />
                Varsayılan Yap
              </button>
            </form>
          )}
          {!market.isDefault && (
            <DeleteButton
              onDelete={deleteAction}
              confirmMessage={`"${market.name}" pazarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sol: Edit form */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Pazar Ayarları</h2>
          <MarketForm currencies={activeCurrencies} market={market} />
        </div>

        {/* Sağ: Ülkeler */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold text-gray-900">Atanmış Ülkeler</h2>
            <p className="mb-4 text-xs text-gray-500">
              Bu pazardan alışveriş yapabilecek ülkeler. Sadece aktif ülkeler listeye eklenebilir.
            </p>
            <MarketCountryManager
              marketId={market.id}
              assignedCountries={market.marketCountries}
              allActiveCountries={activeCountries.data}
            />
          </div>

          {/* İlişki özeti */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">İlişkili Modüller</h2>
            <dl className="space-y-2 text-sm">
              {[
                { label: "Fiyat kaydı", value: market._count.productVariantPrices },
                { label: "Kargo bölgesi", value: market._count.shippingZones },
                { label: "Sipariş", value: market._count.orders },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <dt className="text-gray-500">{row.label}</dt>
                  <dd className="font-medium text-gray-900">{row.value}</dd>
                </div>
              ))}
              <div className="flex justify-between">
                <dt className="text-gray-500">Fiyat bulunamazsa</dt>
                <dd className="font-medium text-gray-900">
                  {FALLBACK_LABELS[market.fallbackPricing]}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
