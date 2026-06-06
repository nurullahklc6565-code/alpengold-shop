"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-helpers";
import { currencyService } from "@/server/services/currency.service";

export async function toggleCurrencyActive(id: string) {
  await requirePermission("currencies", "update");
  await currencyService.toggleActive(id);
  revalidatePath("/admin/currencies");
}
