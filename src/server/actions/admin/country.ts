"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-helpers";
import { countryService } from "@/server/services/country.service";

export async function toggleCountryActive(id: string) {
  await requirePermission("countries", "update");
  await countryService.toggleActive(id);
  revalidatePath("/admin/countries");
}

export async function bulkSetCountriesActive(ids: string[], active: boolean) {
  await requirePermission("countries", "update");
  await countryService.bulkSetActive(ids, active);
  revalidatePath("/admin/countries");
}
