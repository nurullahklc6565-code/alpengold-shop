"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-helpers";
import { categoryService } from "@/server/services/category.service";

const schema = z.object({
  name: z.string().min(1, "Ad zorunludur").max(200),
  slug: z.string().max(200).optional(),
  parentId: z.string().optional().nullable(),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

export type CategoryActionState = { error?: string; success?: boolean };

export async function createCategoryAction(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requirePermission("products", "create");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    parentId: formData.get("parentId") || null,
    imageUrl: formData.get("imageUrl") || undefined,
    description: formData.get("description") || undefined,
    featured: formData.get("featured") === "true",
    active: formData.get("active") === "true",
    position: formData.get("position") ? Number(formData.get("position")) : 0,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await categoryService.create({
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
      description: parsed.data.description || null,
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function updateCategoryAction(
  id: string,
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requirePermission("products", "update");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    parentId: formData.get("parentId") || null,
    imageUrl: formData.get("imageUrl") || undefined,
    description: formData.get("description") || undefined,
    featured: formData.get("featured") === "true",
    active: formData.get("active") === "true",
    position: formData.get("position") ? Number(formData.get("position")) : 0,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await categoryService.update(id, {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
      description: parsed.data.description || null,
    });
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requirePermission("products", "delete");
  await categoryService.delete(id);
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
