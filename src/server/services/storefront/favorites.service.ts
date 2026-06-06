import { prisma } from "@/lib/prisma";

export const favoritesService = {
  async getByCustomer(customerId: string) {
    return prisma.wishlist.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
            variants: {
              where: { active: true },
              take: 1,
              select: { basePrice: true },
            },
          },
        },
      },
    });
  },

  async isFavorited(customerId: string, productId: string): Promise<boolean> {
    const rec = await prisma.wishlist.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    return !!rec;
  },

  async toggle(customerId: string, productId: string): Promise<boolean> {
    const existing = await prisma.wishlist.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    if (existing) {
      await prisma.wishlist.delete({
        where: { customerId_productId: { customerId, productId } },
      });
      return false; // kaldırıldı
    } else {
      await prisma.wishlist.create({ data: { customerId, productId } });
      return true; // eklendi
    }
  },

  async count(customerId: string): Promise<number> {
    return prisma.wishlist.count({ where: { customerId } });
  },

  async getProductIds(customerId: string): Promise<string[]> {
    const rows = await prisma.wishlist.findMany({
      where: { customerId },
      select: { productId: true },
    });
    return rows.map((r) => r.productId);
  },
};
