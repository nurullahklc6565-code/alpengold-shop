"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth-helpers";
import { marketService } from "@/server/services/market.service";
import { z } from "zod";

const marketSchema = z.object({
  name: z.string().min(1, "Ad zorunludur").max(100),
  slug: z.string().max(100).optional(),
  defaultCurrencyId: z.string().min(1, "Para birimi zorunludur"),
  isDefault: z.boolean().optional(),
  active: z.boolean().optional(),
  fallbackPricing: z.enum(["BLOCK", "USE_BASE_PRICE", "USE_DEFAULT"]).optional(),
});

export type MarketActionState = { error?: string; success?: boolean };

export async function createMarketAction(
  _prev: MarketActionState,
  formData: FormData
): Promise<MarketActionState> {
  await requirePermission("markets", "create");

  const parsed = marketSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    defaultCurrencyId: formData.get("defaultCurrencyId"),
    isDefault: formData.get("isDefault") === "true",
    active: formData.get("active") !== "false",
    fallbackPricing: formData.get("fallbackPricing") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Geçersiz veri" };
  }

  try {
    await marketService.create(parsed.data);
    revalidatePath("/admin/markets");
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Pazar oluşturulamadı" };
  }
}

export async function updateMarketAction(
  id: string,
  _prev: MarketActionState,
  formData: FormData
): Promise<MarketActionState> {
  await requirePermission("markets", "update");

  const parsed = marketSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    defaultCurrencyId: formData.get("defaultCurrencyId"),
    isDefault: formData.get("isDefault") === "true",
    active: formData.get("active") !== "false",
    fallbackPricing: formData.get("fallbackPricing") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Geçersiz veri" };
  }

  try {
    await marketService.update(id, parsed.data);
    revalidatePath("/admin/markets");
    revalidatePath(`/admin/markets/${id}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Pazar güncellenemedi" };
  }
}

export async function deleteMarketAction(id: string): Promise<void> {
  await requirePermission("markets", "delete");
  await marketService.delete(id);
  revalidatePath("/admin/markets");
  redirect("/admin/markets");
}

export async function setDefaultMarketAction(id: string): Promise<void> {
  await requirePermission("markets", "update");
  await marketService.setDefault(id);
  revalidatePath("/admin/markets");
}

export async function addCountryToMarketAction(
  marketId: string,
  countryId: string
): Promise<{ error?: string }> {
  await requirePermission("markets", "update");
  try {
    await marketService.addCountry(marketId, countryId);
    revalidatePath(`/admin/markets/${marketId}`);
    return {};
  } catch {
    return { error: "Bu ülke zaten bu pazarda mevcut olabilir" };
  }
}

export async function removeCountryFromMarketAction(
  marketId: string,
  countryId: string
): Promise<void> {
  await requirePermission("markets", "update");
  await marketService.removeCountry(marketId, countryId);
  revalidatePath(`/admin/markets/${marketId}`);
}
