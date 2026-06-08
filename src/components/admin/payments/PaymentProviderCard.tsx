"use client";

import { useActionState, useTransition } from "react";
import {
  togglePaymentProviderAction,
  toggleMarketProviderAction,
  saveProviderConfigAction,
} from "@/server/actions/admin/payment";
import { ToggleActiveButton } from "@/components/admin/ui/ToggleActiveButton";
import { cn } from "@/lib/utils/cn";

type Field = { key: string; label: string; type: string; envOverride?: string; default?: string };
type Market = { id: string; name: string };
type MarketProvider = { marketId: string; active: boolean };

type Props = {
  provider: {
    id: string; name: string; code: string; active: boolean;
    settingsSchema: { fields: Field[] };
    configs: Array<{ marketId: string | null; configData: Record<string, string> }>;
    marketPaymentProviders: Array<{ marketId: string; active: boolean; market: Market }>;
  };
  allMarkets: Market[];
};

const init = { error: undefined, success: undefined };

export function PaymentProviderCard({ provider, allMarkets }: Props) {
  const [configState, configAction, configPending] = useActionState(saveProviderConfigAction, init);
  const [togglePending, startToggle] = useTransition();

  const fields: Field[] = provider.settingsSchema?.fields ?? [];
  const globalConfig = provider.configs.find((c) => c.marketId === null)?.configData ?? {};

  async function handleToggle(id: string) {
    startToggle(() => togglePaymentProviderAction(id, !provider.active));
  }

  const envConfigured = fields.some(
    (f) => f.envOverride && typeof process !== "undefined" // client'da env yok, sadece bilgi
  );

  return (
    <div className={cn("rounded-xl border bg-white overflow-hidden", provider.active ? "border-gray-200" : "border-gray-100 opacity-70")}>
      {/* Başlık */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-600">
            {provider.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{provider.name}</p>
            <p className="text-xs text-gray-400 font-mono">{provider.code}</p>
          </div>
        </div>
        <ToggleActiveButton id={provider.id} active={provider.active} onToggle={handleToggle} />
      </div>

      {/* Konfigürasyon */}
      <div className="px-5 py-4 space-y-4">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">API Anahtarları</p>
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 mb-3">
            Güvenlik için anahtarları .env dosyasında tanımlamanız önerilir
            (örn: <code className="font-mono">{fields[0]?.envOverride ?? "PROVIDER_KEY"}</code>).
            Env var tanımlıysa buradaki değer kullanılmaz.
          </div>

          <form action={configAction} className="space-y-2" autoComplete="off">
            <input type="hidden" name="providerId" value={provider.id} />
            {fields.map((field) => {
              const isSecret = field.type === "password";
              // Sunucu "__CONFIGURED__" sentinel'i ile maskelenmiş değerleri işaretle
              const isConfigured = isSecret && globalConfig[field.key] === "__CONFIGURED__";
              return (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {field.label}
                    {field.envOverride && (
                      <span className="ml-1 text-gray-400">({field.envOverride})</span>
                    )}
                    {isConfigured && (
                      <span className="ml-1.5 text-[10px] text-green-600 font-normal">✓ kayıtlı</span>
                    )}
                  </label>
                  {isSecret ? (
                    // Gizli alanlar: tam değeri gösterme, boş input — yalnızca yeni değer girilince kaydet
                    <input
                      name={`config_${field.key}`}
                      type="password"
                      defaultValue=""
                      placeholder={isConfigured ? "Değiştirmek için yeni değer girin" : (field.envOverride ? `env: ${field.envOverride}` : "Değer girin")}
                      autoComplete="new-password"
                      data-1p-ignore
                      data-lpignore="true"
                      spellCheck={false}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                    />
                  ) : (
                    // Publish edilebilir alanlar (publishableKey vb.) düz text olarak göster
                    <input
                      name={`config_${field.key}`}
                      type="text"
                      defaultValue={globalConfig[field.key] ?? ""}
                      placeholder={field.envOverride ? `env: ${field.envOverride}` : field.default ?? ""}
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                    />
                  )}
                </div>
              );
            })}

            {configState.error && <p className="text-xs text-red-600">{configState.error}</p>}
            {configState.success && <p className="text-xs text-green-600">Kaydedildi.</p>}

            <button type="submit" disabled={configPending}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
              {configPending ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </form>
        </div>

        {/* Pazar atamaları */}
        {allMarkets.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Pazar Atamaları</p>
            <div className="space-y-1">
              {allMarkets.map((market) => {
                const mp = provider.marketPaymentProviders.find((m) => m.marketId === market.id);
                return (
                  <MarketToggleRow
                    key={market.id}
                    market={market}
                    providerId={provider.id}
                    active={mp?.active ?? false}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MarketToggleRow({ market, providerId, active }: { market: Market; providerId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50">
      <span className="text-sm text-gray-700">{market.name}</span>
      <ToggleActiveButton
        id={`${market.id}-${providerId}`}
        active={active}
        onToggle={async () => startTransition(() => toggleMarketProviderAction(market.id, providerId, !active))}
      />
    </div>
  );
}
