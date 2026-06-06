"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-helpers";
import { productService } from "@/server/services/product.service";

const productSchema = z.object({
  name: z.string().min(1, "Ad zorunludur").max(500),
  slug: z.string().max(500).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  taxClass: z.string().optional(),
  vendor: z.string().max(200).optional().nullable(),
  productType: z.string().max(200).optional().nullable(),
  seoTitle: z.string().max(300).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
});

const variantSchema = z.object({
  sku: z.string().min(1, "SKU zorunludur").max(100),
  options: z.record(z.string()).optional().default({}),
  basePrice: z.number().nonnegative("Fiyat negatif olamaz"),
  weight: z.number().nonnegative().optional().nullable(),
  active: z.boolean().optional(),
});

export type ProductActionState = { error?: string; success?: boolean; id?: string };

// ── Ürün ──────────────────────────────────────────────────────
export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requirePermission("products", "create");

  const tags = formData.getAll("tags").map(String).filter(Boolean);
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || null,
    categoryId: formData.get("categoryId") || null,
    status: formData.get("status") || "DRAFT",
    taxClass: formData.get("taxClass") || "standard",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  try {
    const product = await productService.create({
      ...parsed.data,
      vendor: (formData.get("vendor") as string) || null,
      productType: (formData.get("productType") as string) || null,
      tags,
      seoTitle: (formData.get("seoTitle") as string) || null,
      seoDescription: (formData.get("seoDescription") as string) || null,
    });

    // Görselleri kaydet
    const imageCount = parseInt((formData.get("image_count") as string) || "0");
    for (let i = 0; i < imageCount; i++) {
      const url = formData.get(`image_url_${i}`) as string;
      const alt = (formData.get(`image_alt_${i}`) as string) || undefined;
      if (url) await productService.addImage(product.id, url, alt);
    }

    // İlk varyantı kaydet
    const variantSku = (formData.get("variant_sku") as string)?.trim();
    if (variantSku) {
      const basePrice = parseFloat((formData.get("variant_basePrice") as string) || "0");
      const compareAt = formData.get("variant_compareAtPrice")
        ? parseFloat(formData.get("variant_compareAtPrice") as string)
        : null;
      const weight = formData.get("variant_weight")
        ? parseFloat(formData.get("variant_weight") as string)
        : null;
      const barcode = (formData.get("variant_barcode") as string) || null;
      const stock = parseInt((formData.get("variant_stock") as string) || "0");
      const lowStock = formData.get("variant_lowStock")
        ? parseInt(formData.get("variant_lowStock") as string)
        : null;

      // Seçenekleri parse et
      const optionsRaw = (formData.get("variant_options") as string) || "";
      const options: Record<string, string> = {};
      for (const pair of optionsRaw.split(",")) {
        const [k, v] = pair.split(":").map((s) => s.trim());
        if (k && v) options[k] = v;
      }

      const variant = await productService.createVariant({
        productId: product.id,
        sku: variantSku,
        barcode,
        options,
        basePrice,
        compareAtPrice: compareAt,
        weight,
        active: true,
      });

      // Stoku güncelle
      if (stock > 0 || lowStock !== null) {
        await productService.updateInventoryFull(variant.id, {
          quantity: stock,
          trackQuantity: true,
          lowStockThreshold: lowStock,
        });
      }
    }

    revalidatePath("/admin/products");
    return { success: true, id: product.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function updateProductAction(
  id: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requirePermission("products", "update");
  const tags = formData.getAll("tags").map(String).filter(Boolean);
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || null,
    categoryId: formData.get("categoryId") || null,
    status: formData.get("status") || undefined,
    taxClass: formData.get("taxClass") || undefined,
    vendor: formData.get("vendor") || null,
    productType: formData.get("productType") || null,
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await productService.update(id, { ...parsed.data, tags });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteProductAction(id: string): Promise<void> {
  await requirePermission("products", "delete");
  await productService.delete(id);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

// ── Varyant ───────────────────────────────────────────────────
export async function createVariantAction(
  productId: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requirePermission("products", "update");

  // options: "Renk:Kırmızı,Beden:M" formatını parse et
  const optionsRaw = formData.get("options") as string;
  let options: Record<string, string> = {};
  if (optionsRaw) {
    for (const pair of optionsRaw.split(",")) {
      const [k, v] = pair.split(":").map((s) => s.trim());
      if (k && v) options[k] = v;
    }
  }

  const parsed = variantSchema.safeParse({
    sku: formData.get("sku"),
    options,
    basePrice: parseFloat(formData.get("basePrice") as string),
    weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await productService.createVariant({ productId, ...parsed.data });
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "SKU zaten kullanımda olabilir" };
  }
}

export async function updateVariantAction(
  productId: string,
  variantId: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requirePermission("products", "update");
  const parsed = variantSchema.partial().safeParse({
    sku: formData.get("sku") || undefined,
    basePrice: formData.get("basePrice") ? parseFloat(formData.get("basePrice") as string) : undefined,
    weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
    active: formData.get("active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await productService.updateVariant(variantId, parsed.data);
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteVariantAction(productId: string, variantId: string): Promise<void> {
  await requirePermission("products", "update");
  await productService.deleteVariant(variantId);
  revalidatePath(`/admin/products/${productId}`);
}

/** Seçenek matrisi: birden fazla varyantı tek seferde oluştur */
export async function createVariantBatchAction(
  productId: string,
  variants: Array<{
    sku: string;
    options: Record<string, string>;
    basePrice: number;
    compareAtPrice?: number | null;
    weight?: number | null;
    barcode?: string | null;
    stock?: number;
  }>
): Promise<ProductActionState> {
  await requirePermission("products", "update");
  let created = 0;
  const errors: string[] = [];
  for (const v of variants) {
    try {
      const variant = await productService.createVariant({
        productId,
        sku: v.sku,
        barcode: v.barcode ?? null,
        options: v.options,
        basePrice: v.basePrice,
        compareAtPrice: v.compareAtPrice ?? null,
        weight: v.weight ?? null,
        active: true,
      });
      if ((v.stock ?? 0) > 0) {
        await productService.updateInventoryFull(variant.id, { quantity: v.stock ?? 0, trackQuantity: true });
      }
      created++;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }
  revalidatePath(`/admin/products/${productId}`);
  if (errors.length > 0) return { error: `${created} oluşturuldu, ${errors.length} hata: ${errors[0]}` };
  return { success: true };
}

/** Manuel stok düzeltme */
export async function manualStockAdjustAction(
  productId: string,
  variantId: string,
  quantity: number,
  reason: string,
  staffId: string
): Promise<{ error?: string }> {
  await requirePermission("products", "update");
  try {
    const { stockMovementService } = await import("@/server/services/stock-movement.service");
    await stockMovementService.log({
      variantId,
      type: "ADJUSTMENT",
      quantity,
      reason,
      staffId,
    });
    // Mevcut miktara ekle
    const inv = await import("@/lib/prisma").then((m) => m.prisma.inventoryItem.findUnique({ where: { variantId } }));
    const newQty = Math.max(0, (inv?.quantity ?? 0) + quantity);
    await productService.updateInventoryFull(variantId, { quantity: newQty });
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/stock");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

// ── Fiyatlandırma ─────────────────────────────────────────────
export async function upsertVariantPriceAction(
  productId: string,
  data: { variantId: string; marketId: string; currencyId: string; price: number; compareAtPrice?: number | null }
): Promise<{ error?: string }> {
  await requirePermission("products", "update");
  try {
    await productService.upsertVariantPrice(data);
    revalidatePath(`/admin/products/${productId}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fiyat kaydedilemedi" };
  }
}

export async function deleteVariantPriceAction(
  productId: string,
  variantId: string,
  marketId: string
): Promise<void> {
  await requirePermission("products", "update");
  await productService.deleteVariantPrice(variantId, marketId);
  revalidatePath(`/admin/products/${productId}`);
}

// ── Stok ──────────────────────────────────────────────────────
export async function updateInventoryAction(
  productId: string,
  variantId: string,
  data: { quantity: number; trackQuantity: boolean }
): Promise<{ error?: string }> {
  await requirePermission("products", "update");
  try {
    await productService.updateInventory(variantId, data);
    revalidatePath(`/admin/products/${productId}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Stok güncellenemedi" };
  }
}

// ── Görsel ────────────────────────────────────────────────────
export async function addProductImageAction(
  productId: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requirePermission("products", "update");
  const url = formData.get("url") as string;
  const alt = formData.get("alt") as string;
  if (!url) return { error: "URL zorunludur" };
  try {
    await productService.addImage(productId, url, alt);
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Görsel eklenemedi" };
  }
}

/** Upload akışında doğrudan URL ile görsel ekler — useActionState gerektirmez */
export async function addProductImageByUrlAction(
  productId: string,
  url: string,
  alt?: string
): Promise<void> {
  await requirePermission("products", "update");
  await productService.addImage(productId, url, alt ?? "");
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImageAction(productId: string, imageId: string): Promise<void> {
  await requirePermission("products", "update");
  await productService.deleteImage(imageId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function setPrimaryImageAction(productId: string, imageId: string): Promise<void> {
  await requirePermission("products", "update");
  await productService.setPrimaryImage(productId, imageId);
  revalidatePath(`/admin/products/${productId}`);
}
