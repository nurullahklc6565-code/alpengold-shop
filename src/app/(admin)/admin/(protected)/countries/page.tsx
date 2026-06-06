import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CountryTable } from "@/components/admin/countries/CountryTable";
import { countryService } from "@/server/services/country.service";

export const metadata: Metadata = { title: "Ülkeler" };

export default async function CountriesPage() {
  const { data: countries, total } = await countryService.list({ perPage: 250 });

  return (
    <div>
      <PageHeader
        title="Ülkeler"
        description={`${total} ülke yüklü. Aktif ülkeler pazarlara atanabilir.`}
      />
      <CountryTable countries={countries} total={total} />
    </div>
  );
}
