import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { PaymentProviderCard } from "@/components/admin/payments/PaymentProviderCard";
import { paymentService } from "@/server/services/payment.service";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ödeme Sağlayıcıları" };

export default async function PaymentsPage() {
  const [providers, markets] = await Promise.all([
    paymentService.listProvidersForAdmin(),
    prisma.market.findMany({
      where: { active: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Ödeme Sağlayıcıları"
        description="Her sağlayıcı pazar bazında aktif/pasif yapılabilir. API anahtarları .env dosyasında tutulmalıdır."
      />

      {/* Güvenlik notu */}
      <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">Güvenlik Hatırlatması</p>
        <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
          <li>API anahtarlarını .env dosyasında tutun (örn: STRIPE_SECRET_KEY)</li>
          <li>Env var tanımlıysa DB&apos;deki değer kullanılmaz — env her zaman önceliklidir</li>
          <li>Webhook secret&apos;ı her zaman env var olarak saklayın, DB&apos;ye yazmayın</li>
          <li>Gerçek ödeme yapılması için Webhook URL&apos;i sağlayıcıda kayıt edilmiş olmalıdır</li>
        </ul>
      </div>

      {/* Webhook URL'leri */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-3 text-sm font-semibold text-gray-900">Webhook URL&apos;leri</p>
        <p className="mb-2 text-xs text-gray-500">
          Aşağıdaki URL&apos;leri sağlayıcı panellerinde webhook endpoint olarak kaydedin:
        </p>
        <div className="space-y-2">
          {providers.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-2.5">
              <span className="text-xs text-gray-500 w-16">{p.name}:</span>
              <code className="text-xs font-mono text-gray-700 select-all">
                {process.env.NEXT_PUBLIC_APP_URL ?? "https://yourdomain.com"}/api/webhooks/{p.code}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Sağlayıcı Kartları */}
      {providers.length === 0 ? (
        <p className="text-sm text-gray-400">Ödeme sağlayıcısı bulunamadı. Seed çalıştırın.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <PaymentProviderCard
              key={provider.id}
              provider={{
                ...provider,
                settingsSchema: provider.settingsSchema as { fields: Array<{ key: string; label: string; type: string; envOverride?: string; default?: string }> },
                configs: provider.configs.map((c) => ({
                  marketId: c.marketId,
                  configData: c.configData as Record<string, string>,
                })),
                marketPaymentProviders: provider.marketPaymentProviders.map((mp) => ({
                  marketId: mp.marketId,
                  active: mp.active,
                  market: mp.market,
                })),
              }}
              allMarkets={markets}
            />
          ))}
        </div>
      )}
    </div>
  );
}
