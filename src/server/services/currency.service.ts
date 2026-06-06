import { prisma } from "@/lib/prisma";

export const currencyService = {
  async list(params: { search?: string; active?: boolean; page?: number; perPage?: number } = {}) {
    const { search, active, page = 1, perPage = 50 } = params;
    const where = {
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { symbol: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.currency.findMany({
        where,
        orderBy: { code: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          _count: { select: { markets: true } },
        },
      }),
      prisma.currency.count({ where }),
    ]);

    return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  },

  async listActive() {
    return prisma.currency.findMany({
      where: { active: true },
      orderBy: { code: "asc" },
    });
  },

  async get(id: string) {
    return prisma.currency.findUnique({ where: { id } });
  },

  async toggleActive(id: string) {
    const currency = await prisma.currency.findUniqueOrThrow({ where: { id } });
    return prisma.currency.update({
      where: { id },
      data: { active: !currency.active },
    });
  },
};
