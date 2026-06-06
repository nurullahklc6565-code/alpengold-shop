import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client";
import { stockMovementService } from "@/server/services/stock-movement.service";

// Yalnızca bu geçişlere izin verilir
const ALLOWED_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ["CONFIRMED", "CANCELLED"],
  CONFIRMED:  ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["DELIVERED"],
  DELIVERED:  [],
  CANCELLED:  [],
  REFUNDED:   [],
};

// Ödeme durumu geçişleri — ödeme olmadan PAID yapılamaz
const ALLOWED_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID:        ["PAID"],       // SUPER_ADMIN + zorunlu referans + audit
  PAID:          ["REFUNDED"],   // iade
  PARTIALLY_PAID:["PAID", "REFUNDED"],
  REFUNDED:      [],
};

export const orderService = {
  // ─── Listeleme ─────────────────────────────────────────────────────────
  async list(params: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
    page?: number;
    perPage?: number;
  } = {}) {
    const { status, paymentStatus, search, page = 1, perPage = 30 } = params;
    const where = {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(search && {
        OR: [
          { number: { contains: search, mode: "insensitive" as const } },
          { customer: { email: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          customer: { select: { id: true, email: true, firstName: true, lastName: true } },
          market: { select: { name: true } },
          currency: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  },

  // ─── Detay ─────────────────────────────────────────────────────────────
  async get(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            addresses: {
              include: { country: { select: { name: true } } },
              orderBy: { isDefault: "desc" },
              take: 1,
            },
          },
        },
        market: true,
        currency: true,
        shippingAddress: { include: { country: true } },
        billingAddress: { include: { country: true } },
        items: {
          include: {
            variant: {
              include: {
                product: { select: { id: true, name: true, slug: true } },
                inventory: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          include: { provider: { select: { name: true, code: true } } },
        },
      },
    });
  },

  // ─── Sipariş Durum Değiştirme ───────────────────────────────────────────
  async changeOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    staffId: string,
    reason?: string
  ) {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    const allowed = ALLOWED_ORDER_STATUS_TRANSITIONS[order.status];

    if (!allowed.includes(newStatus)) {
      throw new Error(`${order.status} → ${newStatus} geçişine izin verilmiyor.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      }),
      prisma.activityLog.create({
        data: {
          staffId,
          action: "order_status_changed",
          resource: "orders",
          resourceId: orderId,
          payload: {
            from: order.status,
            to: newStatus,
            reason: reason ?? null,
          },
        },
      }),
    ]);

    // İptal durumunda rezerve stoku serbest bırak
    if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
      const items = await prisma.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        await prisma.inventoryItem.updateMany({
          where: { variantId: item.variantId, trackQuantity: true },
          data: { reserved: { decrement: item.quantity } },
        });
      }
    }

    return updated;
  },

  // ─── Ödeme Durum Değiştirme (SUPER_ADMIN + zorunlu referans) ───────────
  async changePaymentStatus(
    orderId: string,
    newStatus: PaymentStatus,
    staffId: string,
    params: {
      role: string;
      reason: string;
      paymentReference?: string; // PAID için zorunlu
    }
  ) {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    const allowed = ALLOWED_PAYMENT_TRANSITIONS[order.paymentStatus];

    if (!allowed.includes(newStatus)) {
      throw new Error(`${order.paymentStatus} → ${newStatus} ödeme geçişine izin verilmiyor.`);
    }

    // PAID geçişi için SUPER_ADMIN yetkisi ve referans zorunlu
    if (newStatus === "PAID") {
      if (params.role !== "SUPER_ADMIN") {
        throw new Error("Ödeme durumunu PAID olarak değiştirmek için SUPER_ADMIN yetkisi gereklidir.");
      }
      if (!params.paymentReference?.trim()) {
        throw new Error("PAID geçişi için ödeme referans numarası zorunludur.");
      }
      if (!params.reason?.trim()) {
        throw new Error("PAID geçişi için gerekçe açıklaması zorunludur.");
      }
    }

    if (!params.reason?.trim()) {
      throw new Error("Ödeme durumu değişikliği için gerekçe zorunludur.");
    }

    const [updated] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: newStatus },
      }),
      prisma.activityLog.create({
        data: {
          staffId,
          action: "payment_status_changed",
          resource: "orders",
          resourceId: orderId,
          payload: {
            from: order.paymentStatus,
            to: newStatus,
            reason: params.reason,
            paymentReference: params.paymentReference ?? null,
            changedByRole: params.role,
          },
        },
      }),
    ]);

    // PAID geçişinde stok rezervasyonu gerçek düşüme dönüşür
    if (newStatus === "PAID" && order.paymentStatus === "UNPAID") {
      const items = await prisma.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        await prisma.inventoryItem.updateMany({
          where: { variantId: item.variantId, trackQuantity: true },
          data: {
            quantity: { decrement: item.quantity },
            reserved: { decrement: item.quantity },
          },
        });
      }
    }

    return updated;
  },

  // ─── Kargo / Fulfillment Güncelleme ─────────────────────────────────────
  async updateFulfillment(
    orderId: string,
    data: {
      fulfillmentStatus?: FulfillmentStatus;
      trackingNumber?: string | null;
      carrierCode?: string | null;
      adminNote?: string | null;
    },
    staffId: string
  ) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(data.fulfillmentStatus && { fulfillmentStatus: data.fulfillmentStatus }),
        ...("trackingNumber" in data && { trackingNumber: data.trackingNumber }),
        ...("carrierCode" in data && { carrierCode: data.carrierCode }),
        ...("adminNote" in data && { adminNote: data.adminNote }),
      },
    });

    await prisma.activityLog.create({
      data: {
        staffId,
        action: "fulfillment_updated",
        resource: "orders",
        resourceId: orderId,
        payload: {
          fulfillmentStatus: data.fulfillmentStatus ?? null,
          trackingNumber: data.trackingNumber ?? null,
          carrierCode: data.carrierCode ?? null,
        },
      },
    });

    return order;
  },

  // ─── Dashboard İstatistikleri ───────────────────────────────────────────
  async getStats() {
    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      totalCustomers,
      activeProducts,
      recentOrders,
      lowStockItems,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: "UNPAID" } }),
      prisma.order.count({ where: { paymentStatus: "PAID" } }),
      prisma.customer.count(),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { email: true, firstName: true, lastName: true } },
          currency: true,
          market: { select: { name: true } },
        },
      }),
      prisma.inventoryItem.findMany({
        where: { trackQuantity: true, quantity: { lte: 5 } },
        include: {
          variant: {
            include: { product: { select: { name: true, slug: true } } },
          },
        },
        take: 10,
      }),
    ]);

    // Para birimi bazında gelir hesabı (canlı kur kullanılmaz)
    const revenueRaw = await prisma.order.groupBy({
      by: ["currencyId"],
      where: { paymentStatus: "PAID" },
      _sum: { totalPrice: true },
    });

    const currencyIds = revenueRaw.map((r) => r.currencyId);
    const currencies = await prisma.currency.findMany({
      where: { id: { in: currencyIds } },
      select: { id: true, code: true, symbol: true, decimalDigits: true },
    });

    const revenueByCurrency = revenueRaw.map((r) => {
      const cur = currencies.find((c) => c.id === r.currencyId);
      return { ...cur, total: Number(r._sum.totalPrice ?? 0) };
    });

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      totalCustomers,
      activeProducts,
      recentOrders,
      lowStockItems,
      revenueByCurrency,
    };
  },

  // ─── Belirli siparişin aktivite geçmişi ────────────────────────────────
  async getActivityLogs(orderId: string) {
    return prisma.activityLog.findMany({
      where: { resource: "orders", resourceId: orderId },
      orderBy: { createdAt: "desc" },
      include: { staff: { select: { email: true, firstName: true, lastName: true, role: { select: { name: true } } } } },
    });
  },
};
