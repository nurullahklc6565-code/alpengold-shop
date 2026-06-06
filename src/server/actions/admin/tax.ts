"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-helpers";
import { taxService } from "@/server/services/tax.service";

const schema = z.object({
  name: z.string().min(1, "Ad zorunludur"),
  countryId: z.string().min(1, "Ülke zorunludur"),
  marketId: z.string().optional().nullable(),
  taxClass: z.string().default("standard"),
  rate: z.number().min(0).max(1, "Oran 0–1 arasında olmalı (örn: 0.20 = %20)"),
  inclusionType: z.enum(["INCLUSIVE", "EXCLUSIVE"]).default("EXCLUSIVE"),
  appliesToShipping: z.boolean().default(false),
  priority: z.number().int().default(0),
  active: z.boolean().default(true),
});

export type TaxActionState = { error?: string; success?: boolean };

export async function createTaxRuleAction(
  _prev: TaxActionState,
  formData: FormData
): Promise<TaxActionState> {
  await requirePermission("taxes", "create");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    countryId: formData.get("countryId"),
    marketId: formData.get("marketId") || null,
    taxClass: formData.get("taxClass") || "standard",
    rate: parseFloat(formData.get("rate") as string),
    inclusionType: formData.get("inclusionType") || "EXCLUSIVE",
    appliesToShipping: formData.get("appliesToShipping") === "true",
    priority: parseInt(formData.get("priority") as string) || 0,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await taxService.create(parsed.data);
    revalidatePath("/admin/taxes");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function updateTaxRuleAction(
  id: string,
  _prev: TaxActionState,
  formData: FormData
): Promise<TaxActionState> {
  await requirePermission("taxes", "update");
  const parsed = schema.partial().safeParse({
    name: formData.get("name") || undefined,
    countryId: formData.get("countryId") || undefined,
    marketId: formData.get("marketId") || null,
    taxClass: formData.get("taxClass") || undefined,
    rate: formData.get("rate") ? parseFloat(formData.get("rate") as string) : undefined,
    inclusionType: formData.get("inclusionType") || undefined,
    appliesToShipping: formData.get("appliesToShipping") === "true",
    priority: formData.get("priority") ? parseInt(formData.get("priority") as string) : undefined,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await taxService.update(id, parsed.data);
    revalidatePath("/admin/taxes");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteTaxRuleAction(id: string): Promise<void> {
  await requirePermission("taxes", "delete");
  await taxService.delete(id);
  revalidatePath("/admin/taxes");
}
