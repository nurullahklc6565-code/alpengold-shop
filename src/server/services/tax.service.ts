import { prisma } from "@/lib/prisma";
import type { TaxInclusionType } from "@prisma/client";

export type CreateTaxRuleData = {
  name: string;
  countryId: string;
  marketId?: string | null;
  taxClass: string;
  rate: number;               // 0.20 = %20
  inclusionType: TaxInclusionType;
  appliesToShipping: boolean;
  priority: number;
  active: boolean;
};

export const taxService = {
  // ─── Admin CRUD ──────────────────────────────────────────────────────────
  async list(params: { countryId?: string; marketId?: string } = {}) {
    return prisma.taxRule.findMany({
      where: {
        ...(params.countryId && { countryId: params.countryId }),
        ...(params.marketId !== undefined && { marketId: params.marketId }),
      },
      orderBy: [{ countryId: "asc" }, { priority: "desc" }],
      include: {
        country: { select: { name: true, codeIso2: true, flagEmoji: true } },
        market: { select: { name: true } },
      },
    });
  },

  async get(id: string) {
    return prisma.taxRule.findUnique({
      where: { id },
      include: { country: true, market: true },
    });
  },

  async create(data: CreateTaxRuleData) {
    return prisma.taxRule.create({ data });
  },

  async update(id: string, data: Partial<CreateTaxRuleData>) {
    return prisma.taxRule.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.taxRule.delete({ where: { id } });
  },

  // ─── Vergi Hesaplama (checkout'ta kullanılır) ────────────────────────────
  /**
   * Vergi miktarını hesaplar.
   * Önce pazara özel kural arar; yoksa ülke genel kuralına düşer.
   * Hiçbir vergi oranı kodda sabit yazılmaz — tümü DB'den gelir.
   */
  async calculateTax(params: {
    subtotal: number;
    shippingPrice: number;
    countryId: string;
    marketId: string;
    taxClass?: string;
  }): Promise<{ taxAmount: number; effectiveRate: number; inclusionType: TaxInclusionType | null }> {
    const { subtotal, shippingPrice, countryId, marketId, taxClass = "standard" } = params;

    // Pazar bazlı kural varsa onu kullan (daha yüksek öncelik)
    const rule = await prisma.taxRule.findFirst({
      where: {
        countryId,
        taxClass,
        active: true,
        OR: [
          { marketId },        // pazar bazlı override
          { marketId: null },  // global kural
        ],
      },
      orderBy: [
        { marketId: "desc" }, // null değeri sonraya itilir → pazar bazlı önce
        { priority: "desc" },
      ],
    });

    if (!rule) {
      return { taxAmount: 0, effectiveRate: 0, inclusionType: null };
    }

    const rate = Number(rule.rate);
    let taxableAmount = subtotal;
    if (rule.appliesToShipping) taxableAmount += shippingPrice;

    let taxAmount: number;
    if (rule.inclusionType === "INCLUSIVE") {
      // Fiyat vergiye dahil: vergi = brüt * (rate / (1 + rate))
      taxAmount = taxableAmount * (rate / (1 + rate));
    } else {
      // Fiyat vergiye dahil değil: vergi = net * rate
      taxAmount = taxableAmount * rate;
    }

    return {
      taxAmount: Math.round(taxAmount * 100) / 100,
      effectiveRate: rate,
      inclusionType: rule.inclusionType,
    };
  },
};
