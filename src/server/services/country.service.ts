import { prisma } from "@/lib/prisma";

export const countryService = {
  async list(params: { search?: string; active?: boolean; page?: number; perPage?: number } = {}) {
    const { search, active, page = 1, perPage = 50 } = params;
    const where = {
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { codeIso2: { contains: search, mode: "insensitive" as const } },
          { codeIso3: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.country.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          _count: { select: { marketCountries: true } },
        },
      }),
      prisma.country.count({ where }),
    ]);

    return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  },

  async get(id: string) {
    return prisma.country.findUnique({
      where: { id },
      include: {
        marketCountries: { include: { market: true } },
        _count: { select: { marketCountries: true } },
      },
    });
  },

  async toggleActive(id: string) {
    const country = await prisma.country.findUniqueOrThrow({ where: { id } });
    return prisma.country.update({
      where: { id },
      data: { active: !country.active },
    });
  },

  async bulkSetActive(ids: string[], active: boolean) {
    return prisma.country.updateMany({
      where: { id: { in: ids } },
      data: { active },
    });
  },
};
