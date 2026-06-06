"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-helpers";
import { paymentService } from "@/server/services/payment.service";

export async function togglePaymentProviderAction(
  providerId: string,
  active: boolean
): Promise<void> {
  await requirePermission("payments", "update");
  await paymentService.toggleProvider(providerId, active);
  revalidatePath("/admin/payments");
}

export async function toggleMarketProviderAction(
  marketId: string,
  providerId: string,
  active: boolean
): Promise<void> {
  await requirePermission("payments", "update");
  await paymentService.toggleMarketProvider(marketId, providerId, active);
  revalidatePath("/admin/payments");
}

export async function saveProviderConfigAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requirePermission("payments", "update");

  const providerId = formData.get("providerId") as string;
  const marketId = (formData.get("marketId") as string) || null;

  // Form alanlarını config objesine dönüştür (key formatı: config_FIELDKEY)
  const configData: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("config_") && String(value).trim()) {
      configData[key.replace("config_", "")] = String(value);
    }
  }

  if (!providerId) return { error: "Provider ID eksik" };

  try {
    await paymentService.saveProviderConfig(providerId, marketId, configData);
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kayıt başarısız" };
  }
}
