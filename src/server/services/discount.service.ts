import { prisma } from "@/lib/prisma";
import type { DiscountType, DiscountAppliesTo } from "@prisma/client";

export type CreateDiscountData = {
  name: string;
  type: DiscountType;
  value: number;
  appliesTo?: DiscountAppliesTo;
  targetId?: string | null;
  marketId?: string | null;
  currencyId?: string | null;
  minOrderValue?: number | null;
  startsAt: Date;
  endsAt?: Date | null;
  active?: boolean;
};

export type CouponValidation = {
  couponId: string;
  discountAmount: number;
  isFreeShipping: boolean;
  discountType: DiscountType;
};

export const discountService = {
  // ─── Admin CRUD ─────────────────────────────────────────────────────────
  async listDiscounts() {
    return prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { coupons: true } } },
    });
  },

  async getDiscount(id: string) {
    return prisma.discount.findUnique({
      where: { id },
      include: { coupons: { orderBy: { createdAt: "desc" } } },
    });
  },

  async createDiscount(data: CreateDiscountData) {
    return prisma.discount.create({ data });
  },

  async updateDiscount(id: string, data: Partial<CreateDiscountData>) {
    return prisma.discount.update({ where: { id }, data });
  },

  async deleteDiscount(id: string) {
    return prisma.discount.delete({ where: { id } });
  },

  async listCoupons(discountId?: string) {
    return prisma.coupon.findMany({
      where: discountId ? { discountId } : {},
      orderBy: { createdAt: "desc" },
      include: { discount: { select: { name: true, type: true, value: true } } },
    });
  },

  async createCoupon(data: {
    code: string;
    discountId: string;
    usageLimit?: number | null;
    onePerCustomer?: boolean;
  }) {
    const exists = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (exists) throw new Error("Bu kupon kodu zaten kullanımda.");
    return prisma.coupon.create({ data });
  },

  async deleteCoupon(id: string) {
    return prisma.coupon.delete({ where: { id } });
  },

  // ─── Storefront: Kupon Doğrulama ────────────────────────────────────────
  async validateCoupon(
    code: string,
    params: {
      subtotal: number;
      marketId: string;
      customerId?: string | null;
    }
  ): Promise<CouponValidation> {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { discount: true },
    });

    if (!coupon || !coupon.active) throw new Error("Kupon kodu geçersiz veya aktif değil.");

    const discount = coupon.discount;
    const now = new Date();

    if (!discount.active) throw new Error("Bu indirim aktif değil.");
    if (discount.startsAt > now) throw new Error("Bu kupon henüz geçerli değil.");
    if (discount.endsAt && discount.endsAt < now) throw new Error("Bu kuponun süresi dolmuş.");

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new Error("Bu kuponun kullanım limiti dolmuştur.");
    }

    // Pazar kısıtlaması
    if (discount.marketId && discount.marketId !== params.marketId) {
      throw new Error("Bu kupon seçili pazarda geçerli değil.");
    }

    // Minimum sipariş tutarı
    if (discount.minOrderValue && params.subtotal < Number(discount.minOrderValue)) {
      throw new Error(
        `Bu kupon için minimum sipariş tutarı ${Number(discount.minOrderValue).toFixed(2)}.`
      );
    }

    // Müşteri başına kullanım
    if (coupon.onePerCustomer && params.customerId) {
      const used = await prisma.order.findFirst({
        where: { customerId: params.customerId, couponCode: code.trim().toUpperCase() },
      });
      if (used) throw new Error("Bu kuponu daha önce kullandınız.");
    }

    const discountAmount = calculateAmount(discount.type, Number(discount.value), params.subtotal);

    return {
      couponId: coupon.id,
      discountAmount,
      isFreeShipping: discount.type === "FREE_SHIPPING",
      discountType: discount.type,
    };
  },

  // Kupon kullanım sayısını artır (sipariş oluşumda transaction içinde çağrılır)
  async incrementUsage(couponId: string, tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) {
    const client = tx ?? prisma;
    return client.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  },
};

function calculateAmount(type: DiscountType, value: number, subtotal: number): number {
  switch (type) {
    case "PERCENTAGE":
      return Math.min((subtotal * value) / 100, subtotal);
    case "FIXED_AMOUNT":
      return Math.min(value, subtotal);
    case "FREE_SHIPPING":
      return 0; // kargo ücreti ayrıca sıfırlanır
  }
}
