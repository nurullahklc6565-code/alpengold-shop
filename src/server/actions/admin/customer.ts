"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function updateCustomerAction(
  id: string,
  formData: FormData
): Promise<void> {
  await requirePermission("customers", "update");
  await prisma.customer.update({
    where: { id },
    data: {
      active: formData.get("active") !== "false",
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/customers");
}
