import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CurrencyTable } from "@/components/admin/currencies/CurrencyTable";
import { currencyService } from "@/server/services/currency.service";

export const metadata: Metadata = { title: "Para Birimleri" };

export default async function CurrenciesPage() {
  const { data: currencies, total } = await currencyService.list({ perPage: 100 });

  return (
    <div>
      <PageHeader
        title="Para Birimleri"
        description="Aktif para birimleri pazarlarda kullanılabilir. Pazar bazlı fiyatlandırma bu listeden yönetilir."
      />
      <CurrencyTable currencies={currencies} total={total} />
    </div>
  );
}
