import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { taxService } from "@/server/services/tax.service";
import { createTaxRuleAction, deleteTaxRuleAction, type TaxActionState } from "@/server/actions/admin/tax";
import { prisma } from "@/lib/prisma";
import { TaxRuleForm } from "@/components/admin/taxes/TaxRuleForm";

export const metadata: Metadata = { title: "Vergi Kuralları" };

const INCLUSION_LABELS: Record<string, string> = {
  INCLUSIVE: "Fiyata Dahil", EXCLUSIVE: "Fiyata Ek",
};

const TAX_CLASS_LABELS: Record<string, string> = {
  standard: "Standart", reduced: "İndirimli", zero: "Sıfır Oranlı", exempt: "Muaf",
};

export default async function TaxesPage() {
  const [rules, activeCountries, activeMarkets] = await Promise.all([
    taxService.list(),
    prisma.country.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, codeIso2: true, flagEmoji: true } }),
    prisma.market.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vergi Kuralları"
        description="Ülke ve pazar bazlı vergi oranları. Hiçbir oran kodda sabit değildir. Pazar bazlı kural ülke genel kuralını geçersiz kılar."
      />

      <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-4 text-sm text-blue-700 space-y-1">
        <p><strong>Kural Önceliği:</strong> Pazar bazlı kural → Ülke genel kuralı → Vergi yok (0)</p>
        <p><strong>Dahil:</strong> Fiyat vergisi içerir. Müşteriye ayrıca gösterilmez.</p>
        <p><strong>Ek:</strong> Vergi toplama eklenir. Sipariş özetinde ayrı satır olarak görünür.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kural listesi */}
        <div className="space-y-3">
          {rules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
              Henüz vergi kuralı tanımlanmadı.
            </div>
          ) : rules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{rule.name}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="rounded bg-gray-100 px-2 py-0.5">
                      {rule.country.flagEmoji} {rule.country.name}
                    </span>
                    {rule.market && (
                      <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5">
                        {rule.market.name}
                      </span>
                    )}
                    <span className="rounded bg-gray-100 px-2 py-0.5">
                      {TAX_CLASS_LABELS[rule.taxClass] ?? rule.taxClass}
                    </span>
                    <span className="font-semibold text-gray-900">
                      %{(Number(rule.rate) * 100).toFixed(0)}
                    </span>
                    <span className={rule.inclusionType === "INCLUSIVE" ? "text-green-600" : "text-amber-600"}>
                      {INCLUSION_LABELS[rule.inclusionType]}
                    </span>
                    {rule.appliesToShipping && (
                      <span className="rounded bg-amber-50 text-amber-700 px-2 py-0.5">Kargo dahil</span>
                    )}
                    <span className="text-gray-400">Öncelik: {rule.priority}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge active={rule.active} />
                  <form action={deleteTaxRuleAction.bind(null, rule.id)}>
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700">Sil</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Yeni kural formu */}
        <SectionCard title="Yeni Vergi Kuralı">
          <TaxRuleForm
            createAction={createTaxRuleAction}
            countries={activeCountries}
            markets={activeMarkets}
          />
        </SectionCard>
      </div>
    </div>
  );
}
