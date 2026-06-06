import { prisma } from "@/lib/prisma";
import type { StockMovementType } from "@prisma/client";

export const stockMovementService = {
  async log(params: {
    variantId: string;
    type: StockMovementType;
    quantity: number;   // +giriş / -çıkış
    reason?: string;
    reference?: string;
    staffId?: string;
  }) {
    // Mevcut stok miktarını al
    const inv = await prisma.inventoryItem.findUnique({
      where: { variantId: params.variantId },
    });
    const before = inv?.quantity ?? 0;
    const after = before + params.quantity;

    return prisma.stockMovement.create({
      data: {
        variantId: params.variantId,
        type: params.type,
        quantity: params.quantity,
        before,
        after,
        reason: params.reason ?? null,
        reference: params.reference ?? null,
        staffId: params.staffId ?? null,
      },
    });
  },

  async listForVariant(variantId: string) {
    return prisma.stockMovement.findMany({
      where: { variantId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        staff: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  },

  async listAll(params: {
    variantId?: string;
    type?: StockMovementType;
    page?: number;
    perPage?: number;
  } = {}) {
    const { variantId, type, page = 1, perPage = 50 } = params;
    const where = {
      ...(variantId && { variantId }),
      ...(type && { type }),
    };
    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          variant: {
            include: {
              product: { select: { name: true, slug: true } },
            },
          },
          staff: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);
    return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  },
};
