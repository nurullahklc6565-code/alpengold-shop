import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, X, Plus } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { shippingService } from "@/server/services/shipping.service";
import {
  deleteZoneAction,
  addCountryToZoneAction,
  removeCountryFromZoneAction,
  createRateAction,
  deleteRateAction,
} from "@/server/actions/admin/shipping";
import { currencyService } from "@/server/services/currency.service";
import { formatPrice } from "@/lib/utils/pricing";
import { ZoneCountryManager } from "@/components/admin/shipping/ZoneCountryManager";
import { RateCreateForm } from "@/components/admin/shipping/RateCreateForm";

export const metadata: Metadata = { title: "Kargo Bölgesi" };

const CONDITION_LABELS: Record<string, string> = {
  FLAT: "Sabit Ücret", BY_WEIGHT: "Ağırlığa Göre",
  BY_ORDER_PRICE: "Sipariş Tutarına Göre", BY_QUANTITY: "Adete Göre",
};

export default async function ShippingZonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [zone, activeCurrencies] = await Promise.all([
    shippingService.getZone(id),
    currencyService.listActive(),
  ]);
  if (!zone) return notFound();

  const deleteZone = deleteZoneAction.bind(null, id);
  const boundCreateRate = createRateAction.bind(null, id);

  // Pazardaki ülkeler (atanmamış olanlar seçilebilir)
  const allMarketCountries = zone.market.marketCountries.map((mc) => mc.country);
  const assignedCountryIds = new Set(zone.shippingCountries.map((sc) => sc.country.id));
  const availableCountries = allMarketCountries.filter((c) => !assignedCountryIds.has(c.id));

  const defaultCur = zone.market.defaultCurrency;
  const curInfo = { code: defaultCur.code, symbol: defaultCur.symbol, decimalDigits: defaultCur.decimalDigits };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/shipping" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{zone.name}</h1>
            <p className="text-sm text-gray-500">{zone.market.name} · {defaultCur.code}</p>
          </div>
        </div>
        <DeleteButton onDelete={deleteZone} confirmMessage={`"${zone.name}" bölgesini silmek istediğinizden emin misiniz?`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ülkeler */}
        <SectionCard
          title="Ülkeler"
          description={`Sadece ${zone.market.name} pazarına atanmış ülkeler listelenebilir.`}
        >
          <ZoneCountryManager
            zoneId={id}
            assignedCountries={zone.shippingCountries.map((sc) => sc.country)}
            availableCountries={availableCountries}
            addAction={addCountryToZoneAction}
            removeAction={removeCountryFromZoneAction}
          />
        </SectionCard>

        {/* Kargo Oranları */}
        <div className="space-y-4">
          <SectionCard title="Kargo Oranları">
            {zone.rates.length === 0 ? (
              <p className="text-sm text-gray-400">Henüz oran tanımlanmadı.</p>
            ) : (
              <div className="space-y-2">
                {zone.rates.map((rate) => {
                  const rateCur = { code: rate.currency.code, symbol: rate.currency.symbol, decimalDigits: rate.currency.decimalDigits };
                  const deleteRate = deleteRateAction.bind(null, id, rate.id);
                  return (
                    <div key={rate.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rate.name}</p>
                        <div className="text-xs text-gray-500 mt-0.5 space-x-2">
                          <span>{CONDITION_LABELS[rate.conditionType]}</span>
                          <span>·</span>
                          <span className="font-semibold">
                            {Number(rate.rate) === 0 ? "Ücretsiz" : formatPrice(Number(rate.rate), rateCur)}
                          </span>
                          {rate.freeAbove && (
                            <span className="text-green-600">
                              · {formatPrice(Number(rate.freeAbove), rateCur)} üzeri ücretsiz
                            </span>
                          )}
                        </div>
                      </div>
                      <form action={deleteRate}>
                        <button type="submit" className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Yeni Oran Ekle">
            <RateCreateForm
              createAction={boundCreateRate}
              currencies={activeCurrencies}
              defaultCurrencyId={activeCurrencies.find((c) => c.code === defaultCur.code)?.id ?? ""}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
