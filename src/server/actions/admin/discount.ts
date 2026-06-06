"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-helpers";
import { discountService } from "@/server/services/discount.service";

const discountSchema = z.object({
  name: z.string().min(1, "Ad zorunludur"),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.number().min(0),
  appliesTo: z.enum(["ALL", "PRODUCT", "CATEGORY", "COLLECTION", "MARKET"]).default("ALL"),
  marketId: z.string().optional().nullable(),
  minOrderValue: z.number().nonnegative().optional().nullable(),
  startsAt: z.string().transform((s) => new Date(s)),
  endsAt: z.string().optional().nullable().transform((s) => (s ? new Date(s) : null)),
  active: z.boolean().default(true),
});

const couponSchema = z.object({
  code: z.string().min(3).toUpperCase().transform((s) => s.trim().toUpperCase()),
  discountId: z.string().min(1),
  usageLimit: z.number().int().positive().optional().nullable(),
  onePerCustomer: z.boolean().default(false),
});

export type DiscountActionState = { error?: string; success?: boolean };

export async function createDiscountAction(
  _prev: DiscountActionState,
  formData: FormData
): Promise<DiscountActionState> {
  await requirePermission("discounts", "create");
  const parsed = discountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    value: parseFloat(formData.get("value") as string),
    appliesTo: formData.get("appliesTo") || "ALL",
    marketId: formData.get("marketId") || null,
    minOrderValue: formData.get("minOrderValue") ? parseFloat(formData.get("minOrderValue") as string) : null,
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || null,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    const disc = await discountService.createDiscount(parsed.data);
    revalidatePath("/admin/discounts");
    redirect(`/admin/discounts/${disc.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function updateDiscountAction(
  id: string,
  _prev: DiscountActionState,
  formData: FormData
): Promise<DiscountActionState> {
  await requirePermission("discounts", "update");
  const parsed = discountSchema.partial().safeParse({
    name: formData.get("name"),
    type: formData.get("type") || undefined,
    value: formData.get("value") ? parseFloat(formData.get("value") as string) : undefined,
    appliesTo: formData.get("appliesTo") || undefined,
    marketId: formData.get("marketId") || null,
    minOrderValue: formData.get("minOrderValue") ? parseFloat(formData.get("minOrderValue") as string) : null,
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || null,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await discountService.updateDiscount(id, parsed.data);
    revalidatePath("/admin/discounts");
    revalidatePath(`/admin/discounts/${id}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteDiscountAction(id: string): Promise<void> {
  await requirePermission("discounts", "delete");
  await discountService.deleteDiscount(id);
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function createCouponAction(
  _prev: DiscountActionState,
  formData: FormData
): Promise<DiscountActionState> {
  await requirePermission("discounts", "create");
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    discountId: formData.get("discountId"),
    usageLimit: formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null,
    onePerCustomer: formData.get("onePerCustomer") === "true",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await discountService.createCoupon(parsed.data);
    revalidatePath("/admin/coupons");
    revalidatePath(`/admin/discounts/${parsed.data.discountId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteCouponAction(id: string): Promise<void> {
  await requirePermission("discounts", "delete");
  await discountService.deleteCoupon(id);
  revalidatePath("/admin/coupons");
}

/** Form action (prev state gerektirmeyen) — server component formları için */
export async function addCouponFormAction(formData: FormData): Promise<void> {
  await requirePermission("discounts", "create");
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const discountId = formData.get("discountId") as string;
  const usageLimitRaw = formData.get("usageLimit") as string;
  if (!code || !discountId) return;
  try {
    await discountService.createCoupon({
      code,
      discountId,
      usageLimit: usageLimitRaw ? parseInt(usageLimitRaw) : null,
      onePerCustomer: formData.get("onePerCustomer") === "true",
    });
    revalidatePath("/admin/coupons");
    revalidatePath(`/admin/discounts/${discountId}`);
  } catch (err) {
    console.error("[addCouponFormAction]", err);
  }
}
