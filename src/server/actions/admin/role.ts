"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-helpers";
import { roleService } from "@/server/services/role.service";

export async function setRolePermissionsAction(
  roleId: string,
  formData: FormData
): Promise<void> {
  await requirePermission("staff", "update");

  const permissionIds = formData.getAll("permissions").map(String);
  await roleService.setRolePermissions(roleId, permissionIds);
  revalidatePath("/admin/roles");
}
