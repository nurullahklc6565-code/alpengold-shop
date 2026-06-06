import { prisma } from "@/lib/prisma";
import type { ShippingConditionType } from "@prisma/client";

export type CreateZoneData = {
  marketId: string;
  name: string;
};

export type CreateRateData = {
  zoneId: string;
  name: string;
  conditionType: ShippingConditionType;
  minValue?: number | null;
  maxValue?: number | null;
  rate: number;
  currencyId: string;
  freeAbove?: number | null;
  providerId?: string | null;
  active?: boolean;
};

export const shippingService = {
  // ─── Bölgeler ───────────────────────────────────────────────────────────
  async listZones(marketId?: string) {
    return prisma.shippingZone.findMany({
      where: marketId ? { marketId } : {},
      orderBy: { name: "asc" },
      include: {
        market: { select: { id: true, name: true, defaultCurrency: { select: { code: true, symbol: true, decimalDigits: true } } } },
        shippingCountries: { include: { country: { select: { id: true, name: true, codeIso2: true, flagEmoji: true } } } },
        rates: { where: { active: true }, include: { currency: true }, orderBy: { name: "asc" } },
        _count: { select: { rates: true, shippingCountries: true } },
      },
    });
  },

  async getZone(id: string) {
    return prisma.shippingZone.findUnique({
      where: { id },
      include: {
        market: {
          include: {
            defaultCurrency: true,
            marketCountries: { include: { country: { select: { id: true, name: true, codeIso2: true, flagEmoji: true } } } },
          },
        },
        shippingCountries: { include: { country: { select: { id: true, name: true, codeIso2: true, flagEmoji: true } } } },
        rates: { include: { currency: true, provider: true }, orderBy: { name: "asc" } },
      },
    });
  },

  async createZone(data: CreateZoneData) {
    return prisma.shippingZone.create({ data });
  },

  async updateZone(id: string, name: string) {
    return prisma.shippingZone.update({ where: { id }, data: { name } });
  },

  async deleteZone(id: string) {
    return prisma.shippingZone.delete({ where: { id } });
  },

  async addCountryToZone(zoneId: string, countryId: string) {
    return prisma.shippingZoneCountry.create({ data: { zoneId, countryId } });
  },

  async removeCountryFromZone(zoneId: string, countryId: string) {
    return prisma.shippingZoneCountry.delete({
      where: { zoneId_countryId: { zoneId, countryId } },
    });
  },

  // ─── Oranlar ────────────────────────────────────────────────────────────
  async createRate(data: CreateRateData) {
    return prisma.shippingRate.create({
      data: {
        zoneId: data.zoneId,
        name: data.name,
        conditionType: data.conditionType,
        minValue: data.minValue ?? null,
        maxValue: data.maxValue ?? null,
        rate: data.rate,
        currencyId: data.currencyId,
        freeAbove: data.freeAbove ?? null,
        providerId: data.providerId ?? null,
        active: data.active ?? true,
      },
      include: { currency: true },
    });
  },

  async updateRate(id: string, data: Partial<CreateRateData>) {
    return prisma.shippingRate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.conditionType && { conditionType: data.conditionType }),
        ...(data.rate !== undefined && { rate: data.rate }),
        ...(data.currencyId && { currencyId: data.currencyId }),
        ...("freeAbove" in data && { freeAbove: data.freeAbove ?? null }),
        ...("minValue" in data && { minValue: data.minValue ?? null }),
        ...("maxValue" in data && { maxValue: data.maxValue ?? null }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  },

  async deleteRate(id: string) {
    return prisma.shippingRate.delete({ where: { id } });
  },

  // ─── Sağlayıcılar ───────────────────────────────────────────────────────
  async listProviders() {
    return prisma.shippingProvider.findMany({ orderBy: { name: "asc" } });
  },

  async upsertProvider(code: string, name: string, active: boolean) {
    return prisma.shippingProvider.upsert({
      where: { code },
      update: { active },
      create: { code, name, active },
    });
  },
};
