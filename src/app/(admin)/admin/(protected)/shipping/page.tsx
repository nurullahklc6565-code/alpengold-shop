import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Truck, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { shippingService } from "@/server/services/shipping.service";
import { marketService } from "@/server/services/market.service";
import { createZoneAction, type ShippingActionState } from "@/server/actions/admin/shipping";
import { formatPrice } from "@/lib/utils/pricing";
import { ZoneCreateForm } from "@/components/admin/shipping/ZoneCreateForm";

export const metadata: Metadata = { title: "Kargo Bölgeleri" };

const CONDITION_LABELS: Record<string, string> = {
  FLAT: "Sabit", BY_WEIGHT: "Ağırlığa Göre",
  BY_ORDER_PRICE: "Sipariş Tutarına Göre", BY_QUANTITY: "Adete Göre",
};

export default async function ShippingPage() {
  const [zones, markets] = await Promise.all([
    shippingService.listZones(),
    marketService.list(),
  ]);

  // Pazarlara göre grupla
  const zonesByMarket = markets.map((m) => ({
    market: m,
    zones: zones.filter((z) => z.marketId === m.id),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kargo Bölgeleri"
        description="Her pazar kendi kargo bölgelerine ve oranlarına sahip olabilir. Hiçbir kural kodda sabit değildir."
      />

      {/* Yeni bölge oluştur */}
      <SectionCard title="Yeni Kargo Bölgesi">
        <ZoneCreateForm markets={markets.map((m) => ({ id: m.id, name: m.name }))} createAction={createZoneAction} />
      </SectionCard>

      {/* Pazar bazında gruplandırılmış bölgeler */}
      {zonesByMarket.map(({ market, zones: mZones }) => (
        <div key={market.id}>
          <div className="mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">{market.name}</h2>
            <span className="text-xs text-gray-400">({market.defaultCurrency.code})</span>
          </div>

          {mZones.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
              Bu pazarda henüz kargo bölgesi yok.
            </div>
          ) : (
            <div className="space-y-3">
              {mZones.map((zone) => {
                const cur = {
                  code: zone.market.defaultCurrency.code,
                  symbol: zone.market.defaultCurrency.symbol,
                  decimalDigits: zone.market.defaultCurrency.decimalDigits,
                };
                return (
                  <Link
                    key={zone.id}
                    href={`/admin/shipping/${zone.id}`}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{zone.name}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                        <span>{zone._count.shippingCountries} ülke</span>
                        <span>{zone._count.rates} oran</span>
                        {zone.rates.length > 0 && (
                          <span>
                            {zone.rates.map((r) => (
                              <span key={r.id} className="mr-2">
                                {r.name}: {r.rate.toString() === "0"
                                  ? "Ücretsiz"
                                  : formatPrice(Number(r.rate), { code: r.currency.code, symbol: r.currency.symbol, decimalDigits: r.currency.decimalDigits })}
                                {" "}({CONDITION_LABELS[r.conditionType]})
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {zones.length === 0 && markets.length === 0 && (
        <EmptyState title="Pazar bulunamadı" description="Kargo bölgesi oluşturmak için önce bir pazar oluşturun." />
      )}
    </div>
  );
}
