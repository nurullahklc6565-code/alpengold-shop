import { prisma } from "@/lib/prisma";
import type { FallbackPricing } from "@prisma/client";
import { generateSlug } from "@/lib/utils/slug";

export type CreateMarketData = {
  name: string;
  slug?: string;
  defaultCurrencyId: string;
  isDefault?: boolean;
  active?: boolean;
  fallbackPricing?: FallbackPricing;
};

export type UpdateMarketData = Partial<CreateMarketData>;

export const marketService = {
  async list() {
    return prisma.market.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      include: {
        defaultCurrency: true,
        _count: { select: { marketCountries: true, orders: true } },
      },
    });
  },

  async get(id: string) {
    return prisma.market.findUnique({
      where: { id },
      include: {
        defaultCurrency: true,
        marketCountries: {
          orderBy: { country: { name: "asc" } },
          include: { country: true },
        },
        _count: {
          select: {
            marketCountries: true,
            orders: true,
            productVariantPrices: true,
            shippingZones: true,
          },
        },
      },
    });
  },

  async create(data: CreateMarketData) {
    const slug = data.slug || generateSlug(data.name);

    // Yeni pazar varsayılan olarak ayarlanıyorsa, diğerleri sıfırlanır
    if (data.isDefault) {
      await prisma.market.updateMany({ data: { isDefault: false } });
    }

    return prisma.market.create({
      data: {
        name: data.name,
        slug,
        defaultCurrencyId: data.defaultCurrencyId,
        isDefault: data.isDefault ?? false,
        active: data.active ?? true,
        fallbackPricing: data.fallbackPricing ?? "BLOCK",
      },
      include: { defaultCurrency: true },
    });
  },

  async update(id: string, data: UpdateMarketData) {
    if (data.isDefault) {
      await prisma.market.updateMany({
        where: { id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.market.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug || generateSlug(data.name ?? "") }),
        ...(data.defaultCurrencyId && { defaultCurrencyId: data.defaultCurrencyId }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.fallbackPricing && { fallbackPricing: data.fallbackPricing }),
      },
      include: { defaultCurrency: true },
    });
  },

  async delete(id: string) {
    // Varsayılan pazar silinemez
    const market = await prisma.market.findUniqueOrThrow({ where: { id } });
    if (market.isDefault) {
      throw new Error("Varsayılan pazar silinemez. Önce başka bir pazarı varsayılan yapın.");
    }
    return prisma.market.delete({ where: { id } });
  },

  async addCountry(marketId: string, countryId: string) {
    return prisma.marketCountry.create({
      data: { marketId, countryId },
    });
  },

  async removeCountry(marketId: string, countryId: string) {
    return prisma.marketCountry.delete({
      where: { marketId_countryId: { marketId, countryId } },
    });
  },

  async setDefault(id: string) {
    await prisma.market.updateMany({ data: { isDefault: false } });
    return prisma.market.update({
      where: { id },
      data: { isDefault: true, active: true },
    });
  },

  // Ülkenin hangi pazarda olduğunu bulur (market detection için)
  async findByCountry(countryCode: string) {
    return prisma.market.findFirst({
      where: {
        active: true,
        marketCountries: {
          some: { country: { codeIso2: countryCode } },
        },
      },
      include: { defaultCurrency: true },
    });
  },

  async findDefault() {
    return prisma.market.findFirst({
      where: { isDefault: true, active: true },
      include: { defaultCurrency: true },
    });
  },
};
