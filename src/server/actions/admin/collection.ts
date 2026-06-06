"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-helpers";
import { collectionService } from "@/server/services/collection.service";

const schema = z.object({
  name: z.string().min(1, "Ad zorunludur").max(200),
  slug: z.string().max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().url("Geçerli URL giriniz").optional().or(z.literal("")),
  active: z.boolean().optional(),
});

export type CollectionActionState = { error?: string; success?: boolean };

export async function createCollectionAction(
  _prev: CollectionActionState,
  formData: FormData
): Promise<CollectionActionState> {
  await requirePermission("products", "create");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || null,
    imageUrl: formData.get("imageUrl") || undefined,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await collectionService.create({ ...parsed.data, imageUrl: parsed.data.imageUrl || null });
    revalidatePath("/admin/collections");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function updateCollectionAction(
  id: string,
  _prev: CollectionActionState,
  formData: FormData
): Promise<CollectionActionState> {
  await requirePermission("products", "update");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || null,
    imageUrl: formData.get("imageUrl") || undefined,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await collectionService.update(id, { ...parsed.data, imageUrl: parsed.data.imageUrl || null });
    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${id}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteCollectionAction(id: string): Promise<void> {
  await requirePermission("products", "delete");
  await collectionService.delete(id);
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}

export async function assignProductToCollectionAction(
  collectionId: string,
  productId: string
): Promise<{ error?: string }> {
  await requirePermission("products", "update");
  try {
    const { productService } = await import("@/server/services/product.service");
    await productService.assignCollection(productId, collectionId);
    revalidatePath(`/admin/collections/${collectionId}`);
    return {};
  } catch {
    return { error: "Bu ürün zaten bu koleksiyonda olabilir" };
  }
}

export async function removeProductFromCollectionAction(
  collectionId: string,
  productId: string
): Promise<void> {
  await requirePermission("products", "update");
  const { productService } = await import("@/server/services/product.service");
  await productService.removeCollection(productId, collectionId);
  revalidatePath(`/admin/collections/${collectionId}`);
}
