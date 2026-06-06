"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-helpers";
import { staffService } from "@/server/services/staff.service";

const createSchema = z.object({
  email: z.string().email("Geçerli e-posta girin"),
  password: z.string().min(8, "Şifre en az 8 karakter"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleId: z.string().min(1, "Rol seçin"),
});

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  roleId: z.string().optional(),
  active: z.boolean().optional(),
});

export type StaffActionState = { error?: string; success?: boolean };

export async function createStaffAction(
  _prev: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  await requirePermission("staff", "create");
  const parsed = createSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    const staff = await staffService.create(parsed.data);
    revalidatePath("/admin/staff");
    redirect(`/admin/staff/${staff.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function updateStaffAction(
  id: string,
  _prev: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  await requirePermission("staff", "update");
  const parsed = updateSchema.safeParse({
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
    roleId: formData.get("roleId") || undefined,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await staffService.update(id, parsed.data);
    revalidatePath("/admin/staff");
    revalidatePath(`/admin/staff/${id}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function resetStaffPasswordAction(
  id: string,
  _prev: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  await requirePermission("staff", "update");
  const password = formData.get("password") as string;
  if (!password || password.length < 8) return { error: "Şifre en az 8 karakter olmalı" };
  try {
    await staffService.resetPassword(id, password);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteStaffAction(id: string, requesterId: string): Promise<void> {
  await requirePermission("staff", "delete");
  await staffService.delete(id, requesterId);
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}
