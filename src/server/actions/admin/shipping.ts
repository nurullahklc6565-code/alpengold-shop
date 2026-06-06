"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-helpers";
import { shippingService } from "@/server/services/shipping.service";

export type ShippingActionState = { error?: string; success?: boolean };

const rateSchema = z.object({
  name: z.string().min(1, "Ad zorunludur"),
  conditionType: z.enum(["FLAT", "BY_WEIGHT", "BY_ORDER_PRICE", "BY_QUANTITY"]),
  rate: z.number().nonnegative("Oran negatif olamaz"),
  currencyId: z.string().min(1, "Para birimi zorunludur"),
  minValue: z.number().optional().nullable(),
  maxValue: z.number().optional().nullable(),
  freeAbove: z.number().optional().nullable(),
  active: z.boolean().default(true),
});

export async function createZoneAction(
  _prev: ShippingActionState,
  formData: FormData
): Promise<ShippingActionState> {
  await requirePermission("shipping", "create");
  const marketId = formData.get("marketId") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!marketId || !name) return { error: "Pazar ve bölge adı zorunludur" };
  try {
    const zone = await shippingService.createZone({ marketId, name });
    revalidatePath("/admin/shipping");
    redirect(`/admin/shipping/${zone.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteZoneAction(id: string): Promise<void> {
  await requirePermission("shipping", "delete");
  await shippingService.deleteZone(id);
  revalidatePath("/admin/shipping");
  redirect("/admin/shipping");
}

export async function addCountryToZoneAction(zoneId: string, countryId: string): Promise<{ error?: string }> {
  await requirePermission("shipping", "update");
  try {
    await shippingService.addCountryToZone(zoneId, countryId);
    revalidatePath(`/admin/shipping/${zoneId}`);
    return {};
  } catch {
    return { error: "Bu ülke zaten bu bölgede mevcut" };
  }
}

export async function removeCountryFromZoneAction(zoneId: string, countryId: string): Promise<void> {
  await requirePermission("shipping", "update");
  await shippingService.removeCountryFromZone(zoneId, countryId);
  revalidatePath(`/admin/shipping/${zoneId}`);
}

export async function createRateAction(
  zoneId: string,
  _prev: ShippingActionState,
  formData: FormData
): Promise<ShippingActionState> {
  await requirePermission("shipping", "create");
  const parsed = rateSchema.safeParse({
    name: formData.get("name"),
    conditionType: formData.get("conditionType") || "FLAT",
    rate: parseFloat(formData.get("rate") as string) || 0,
    currencyId: formData.get("currencyId"),
    minValue: formData.get("minValue") ? parseFloat(formData.get("minValue") as string) : null,
    maxValue: formData.get("maxValue") ? parseFloat(formData.get("maxValue") as string) : null,
    freeAbove: formData.get("freeAbove") ? parseFloat(formData.get("freeAbove") as string) : null,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await shippingService.createRate({ zoneId, ...parsed.data });
    revalidatePath(`/admin/shipping/${zoneId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteRateAction(zoneId: string, rateId: string): Promise<void> {
  await requirePermission("shipping", "delete");
  await shippingService.deleteRate(rateId);
  revalidatePath(`/admin/shipping/${zoneId}`);
}
