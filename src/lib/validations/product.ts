import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  taxClass: z.string().default("standard"),
});

export const createVariantSchema = z.object({
  productId: z.string().cuid(),
  sku: z.string().min(1).max(100),
  options: z.record(z.string()),
  basePrice: z.number().nonnegative(),
  weight: z.number().nonnegative().optional(),
  active: z.boolean().default(true),
});

export const variantPriceSchema = z.object({
  variantId: z.string().cuid(),
  marketId: z.string().cuid(),
  currencyId: z.string().cuid(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type VariantPriceInput = z.infer<typeof variantPriceSchema>;
