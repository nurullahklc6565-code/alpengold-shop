"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-helpers";
import type { FulfillmentStatus } from "@prisma/client";
import { orderService } from "@/server/services/order.service";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export type OrderActionState = { error?: string; success?: boolean };

// ─── Sipariş Durumu Değiştirme ────────────────────────────────────────────
export async function changeOrderStatusAction(
  orderId: string,
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const user = await requirePermission("orders", "update");

  const newStatus = formData.get("status") as OrderStatus;
  const reason = (formData.get("reason") as string) || undefined;

  if (!newStatus) return { error: "Durum seçilmedi" };

  try {
    await orderService.changeOrderStatus(orderId, newStatus, user.id, reason);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Durum değiştirilemedi" };
  }
}

// ─── Ödeme Durumu Değiştirme (SUPER_ADMIN + referans zorunlu) ─────────────
const paymentSchema = z.object({
  paymentStatus: z.enum(["PAID", "REFUNDED", "PARTIALLY_PAID"]),
  reason: z.string().min(5, "Gerekçe en az 5 karakter olmalı"),
  paymentReference: z.string().optional(),
});

export async function changePaymentStatusAction(
  orderId: string,
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const user = await requirePermission("payments", "update");

  const parsed = paymentSchema.safeParse({
    paymentStatus: formData.get("paymentStatus"),
    reason: formData.get("reason"),
    paymentReference: (formData.get("paymentReference") as string) || undefined,
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  try {
    await orderService.changePaymentStatus(orderId, parsed.data.paymentStatus as PaymentStatus, user.id, {
      role: user.role,
      reason: parsed.data.reason,
      paymentReference: parsed.data.paymentReference,
    });
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ödeme durumu değiştirilemedi" };
  }
}

// ─── Fulfillment / Kargo Takip ────────────────────────────────────────────
export async function updateFulfillmentAction(
  orderId: string,
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const user = await requirePermission("orders", "update");
  try {
    await orderService.updateFulfillment(
      orderId,
      {
        fulfillmentStatus: (formData.get("fulfillmentStatus") as FulfillmentStatus) || undefined,
        trackingNumber: (formData.get("trackingNumber") as string) || null,
        carrierCode: (formData.get("carrierCode") as string) || null,
        adminNote: (formData.get("adminNote") as string) || null,
      },
      user.id
    );
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kargo bilgisi güncellenemedi" };
  }
}
