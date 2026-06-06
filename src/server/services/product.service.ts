import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils/slug";
import type { ProductStatus } from "@prisma/client";

export type CreateProductData = {
  name: string;
  slug?: string;
  description?: string | null;
  categoryId?: string | null;
  status?: ProductStatus;
  taxClass?: string;
  vendor?: string | null;
  productType?: string | null;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type CreateVariantData = {
  productId: string;
  sku: string;
  barcode?: string | null;
  options: Record<string, string>;
  basePrice: number;
  compareAtPrice?: number | null;
  weight?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  imageId?: string | null;
  active?: boolean;
};

export type UpsertVariantPriceData = {
  variantId: string;
  marketId: string;
  currencyId: string;
  price: number;
  compareAtPrice?: number | null;
};

export const productService = {
  // ─── Ürün ───────────────────────────────────────────────────
  async list(params: {
    search?: string;
    status?: ProductStatus;
    categoryId?: string;
    page?: number;
    perPage?: number;
  } = {}) {
    const { search, status, categoryId, page = 1, perPage = 30 } = params;
    const where = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { variants: { some: { sku: { contains: search, mode: "insensitive" as const } } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { variants: true, images: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);
    return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  },

  async get(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: {
          orderBy: { createdAt: "asc" },
          include: {
            inventory: true,
            prices: {
              include: { market: true, currency: true },
            },
          },
        },
        productCollections: {
          include: { collection: { select: { id: true, name: true } } },
        },
      },
    });
  },

  async create(data: CreateProductData) {
    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        description: data.description ?? null,
        categoryId: data.categoryId ?? null,
        status: data.status ?? "DRAFT",
        taxClass: data.taxClass ?? "standard",
        vendor: data.vendor ?? null,
        productType: data.productType ?? null,
        tags: data.tags ?? [],
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
      },
    });
  },

  async update(id: string, data: Partial<CreateProductData>) {
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug || generateSlug(data.name ?? "") }),
        ...("description" in data && { description: data.description ?? null }),
        ...("categoryId" in data && { categoryId: data.categoryId ?? null }),
        ...(data.status && { status: data.status }),
        ...(data.taxClass && { taxClass: data.taxClass }),
        ...("vendor" in data && { vendor: data.vendor ?? null }),
        ...("productType" in data && { productType: data.productType ?? null }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...("seoTitle" in data && { seoTitle: data.seoTitle ?? null }),
        ...("seoDescription" in data && { seoDescription: data.seoDescription ?? null }),
      },
    });
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  // ─── Varyant ────────────────────────────────────────────────
  async createVariant(data: CreateVariantData) {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId: data.productId,
          sku: data.sku,
          barcode: data.barcode ?? null,
          options: data.options,
          basePrice: data.basePrice,
          compareAtPrice: data.compareAtPrice ?? null,
          weight: data.weight ?? null,
          lengthCm: data.lengthCm ?? null,
          widthCm: data.widthCm ?? null,
          heightCm: data.heightCm ?? null,
          imageId: data.imageId ?? null,
          active: data.active ?? true,
        },
      });
      await tx.inventoryItem.create({
        data: { variantId: variant.id, quantity: 0, reserved: 0 },
      });
      return variant;
    });
  },

  async updateVariant(id: string, data: Partial<CreateVariantData>) {
    return prisma.productVariant.update({
      where: { id },
      data: {
        ...(data.sku && { sku: data.sku }),
        ...(data.options && { options: data.options }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...("weight" in data && { weight: data.weight ?? null }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  },

  async deleteVariant(id: string) {
    return prisma.productVariant.delete({ where: { id } });
  },

  // ─── Pazar Bazlı Fiyatlandırma ──────────────────────────────
  async upsertVariantPrice(data: UpsertVariantPriceData) {
    return prisma.productVariantPrice.upsert({
      where: { variantId_marketId: { variantId: data.variantId, marketId: data.marketId } },
      create: {
        variantId: data.variantId,
        marketId: data.marketId,
        currencyId: data.currencyId,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
      },
      update: {
        currencyId: data.currencyId,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
      },
    });
  },

  async deleteVariantPrice(variantId: string, marketId: string) {
    return prisma.productVariantPrice.deleteMany({
      where: { variantId, marketId },
    });
  },

  // ─── Stok ───────────────────────────────────────────────────
  async updateInventory(variantId: string, data: { quantity?: number; trackQuantity?: boolean }) {
    return prisma.inventoryItem.upsert({
      where: { variantId },
      create: { variantId, quantity: data.quantity ?? 0, trackQuantity: data.trackQuantity ?? true },
      update: {
        ...(data.quantity !== undefined && { quantity: Math.max(0, data.quantity) }),
        ...(data.trackQuantity !== undefined && { trackQuantity: data.trackQuantity }),
      },
    });
  },

  // ─── Koleksiyon atama ───────────────────────────────────────
  async assignCollection(productId: string, collectionId: string) {
    return prisma.productCollection.upsert({
      where: { productId_collectionId: { productId, collectionId } },
      create: { productId, collectionId },
      update: {},
    });
  },

  async removeCollection(productId: string, collectionId: string) {
    return prisma.productCollection.delete({
      where: { productId_collectionId: { productId, collectionId } },
    });
  },

  // ─── Görsel ─────────────────────────────────────────────────
  async addImage(productId: string, url: string, alt?: string) {
    const max = await prisma.productImage.aggregate({
      where: { productId },
      _max: { position: true },
    });
    const position = (max._max.position ?? -1) + 1;
    const isPrimary = position === 0;
    return prisma.productImage.create({
      data: { productId, url, alt: alt ?? null, position, isPrimary },
    });
  },

  async deleteImage(id: string) {
    return prisma.productImage.delete({ where: { id } });
  },

  async setPrimaryImage(productId: string, imageId: string) {
    await prisma.$transaction([
      prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
      prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
    ]);
  },

  // ─── İlgili Ürünler ─────────────────────────────────────────
  async getRelated(productId: string, categoryId: string | null, limit = 4) {
    return prisma.product.findMany({
      where: {
        id: { not: productId },
        status: "ACTIVE",
        ...(categoryId ? { categoryId } : {}),
      },
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          where: { active: true },
          take: 1,
          include: { prices: { include: { currency: true } } },
        },
      },
    });
  },

  // ─── Stok güncelleme (lowStockThreshold dahil) ───────────────
  async updateInventoryFull(
    variantId: string,
    data: { quantity?: number; trackQuantity?: boolean; lowStockThreshold?: number | null }
  ) {
    return prisma.inventoryItem.upsert({
      where: { variantId },
      create: {
        variantId,
        quantity: data.quantity ?? 0,
        trackQuantity: data.trackQuantity ?? true,
        lowStockThreshold: data.lowStockThreshold ?? null,
      },
      update: {
        ...(data.quantity !== undefined && { quantity: Math.max(0, data.quantity) }),
        ...(data.trackQuantity !== undefined && { trackQuantity: data.trackQuantity }),
        ...("lowStockThreshold" in data && { lowStockThreshold: data.lowStockThreshold ?? null }),
      },
    });
  },
};
