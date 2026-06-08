import { prisma } from "@/lib/prisma";
import type { BasePaymentAdapter } from "@/server/payments/adapters/base.adapter";
import { emailService } from "@/server/services/email.service";
import { stockMovementService } from "@/server/services/stock-movement.service";

type SettingsField = { key: string; envOverride?: string; default?: string };

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "charge.refunded",
]);

/**
 * Stripe aktif mi?
 *
 * Env öncelikli: STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET ikisi de varsa aktif.
 * Webhook secret zorunlu — yoksa live ödeme çalışmaz (güvenlik gereği).
 *
 * DB'de active=false olsa bile env key'leri varsa Stripe kullanılır.
 */
function isStripeConfiguredViaEnv(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

async function buildAdapter(providerCode: string, marketId?: string | null): Promise<BasePaymentAdapter> {
  if (providerCode === "stripe" && process.env.STRIPE_SECRET_KEY) {
    const { StripeAdapter } = await import("@/server/payments/adapters/stripe.adapter");
    return new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY });
  }

  const provider = await prisma.paymentProvider.findUnique({
    where: { code: providerCode },
    include: {
      configs: { where: { OR: [{ marketId: null }, ...(marketId ? [{ marketId }] : [])] } },
    },
  });
  if (!provider) throw new Error(`Ödeme sağlayıcısı bulunamadı: ${providerCode}`);

  const schema = provider.settingsSchema as { fields: SettingsField[] };
  const dbConfig = provider.configs.find((c) => c.marketId === marketId)
    ?? provider.configs.find((c) => c.marketId === null);
  const dbData = (dbConfig?.configData as Record<string, string>) ?? {};

  function resolve(field: SettingsField): string {
    if (field.envOverride && process.env[field.envOverride]) return process.env[field.envOverride]!;
    if (dbData[field.key]) return dbData[field.key];
    return field.default ?? "";
  }

  const fields = schema?.fields ?? [];
  const config = Object.fromEntries(fields.map((f) => [f.key, resolve(f)]));

  if (providerCode === "stripe") {
    if (!config.secretKey) {
      throw new Error("Stripe Secret Key yapılandırılmamış. Admin panelden veya .env dosyasından STRIPE_SECRET_KEY ayarlayın.");
    }
    const validPrefix = config.secretKey.startsWith("sk_test_") || config.secretKey.startsWith("sk_live_") || config.secretKey.startsWith("rk_");
    if (!validPrefix) {
      throw new Error(
        `Stripe Secret Key formatı geçersiz. "sk_test_..." veya "sk_live_..." ile başlamalıdır. ` +
        `Admin panelden (Ödeme Sağlayıcıları > Stripe > Secret Key) güncelleyin.`
      );
    }
    const { StripeAdapter } = await import("@/server/payments/adapters/stripe.adapter");
    return new StripeAdapter({ secretKey: config.secretKey });
  }

  throw new Error(`"${providerCode}" sağlayıcısı için adaptör henüz tanımlanmamış.`);
}

/**
 * Pazarın aktif ödeme sağlayıcısını döner.
 * Env ile yapılandırılmış Stripe, DB active durumundan önce gelir.
 */
async function getActiveProviderForMarket(marketId: string) {
  // Env önceliği: her iki key de varsa Stripe kullan (DB active durumuna bakılmaz)
  if (isStripeConfiguredViaEnv()) {
    const stripeProvider = await prisma.paymentProvider.findUnique({ where: { code: "stripe" } });
    if (stripeProvider) return stripeProvider;
  }

  const rec = await prisma.marketPaymentProvider.findFirst({
    where: { marketId, active: true, paymentProvider: { active: true } },
    include: { paymentProvider: true },
    orderBy: { paymentProvider: { name: "asc" } },
  });
  return rec?.paymentProvider ?? null;
}

export const paymentService = {
  // ─── Aktif Sağlayıcı Var Mı? (hafif kontrol) ────────────────────────────
  async hasActiveProvider(marketId: string): Promise<boolean> {
    const provider = await getActiveProviderForMarket(marketId);
    return provider !== null;
  },

  // ─── Ödeme Session Oluştur ──────────────────────────────────────────────
  async createSession(orderId: string) {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { currency: true, market: true },
    });

    if (order.paymentStatus !== "UNPAID") {
      throw new Error("Bu sipariş için ödeme zaten işlenmiş.");
    }

    const provider = await getActiveProviderForMarket(order.marketId);

    if (!provider) {
      return { paymentId: null, redirectUrl: null, providerName: null, devMode: true };
    }

    const adapter = await buildAdapter(provider.code, order.marketId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

    // Stripe success / cancel URL'leri env'den alınır
    const successBase = process.env.STRIPE_SUCCESS_URL ?? `${appUrl}/checkout/success`;
    const cancelBase  = process.env.STRIPE_CANCEL_URL  ?? `${appUrl}/checkout/cancel`;

    // success_url: /checkout/success/{orderId} veya env URL + /{orderId}
    const returnUrl = `${successBase}/${order.id}`;
    const cancelUrl = `${cancelBase}?orderId=${order.id}`;

    const session = await adapter.createPaymentSession({
      orderId: order.id,
      amount: Number(order.totalPrice),
      currencyCode: order.currency.code,
      returnUrl,
      cancelUrl,
      metadata: { orderNumber: order.number, marketId: order.marketId },
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        providerId: provider.id,
        status: "PENDING",
        amount: order.totalPrice,
        currencyId: order.currencyId,
        providerPaymentId: session.sessionId,
        webhookVerified: false,
        metadata: session.metadata as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    return {
      paymentId: payment.id,
      redirectUrl: session.redirectUrl ?? null,
      providerName: provider.name,
      devMode: false,
    };
  },

  // ─── Webhook İşleme (tek gerçek PAID kaynağı) ───────────────────────────
  async processWebhook(providerCode: string, payload: Buffer, signature: string): Promise<void> {
    const provider = await prisma.paymentProvider.findUnique({ where: { code: providerCode } });
    if (!provider) throw new Error(`Bilinmeyen sağlayıcı: ${providerCode}`);

    // Webhook secret env'den alınır (güvenlik — DB'de tutulmaz)
    const webhookSecret = process.env[`${providerCode.toUpperCase()}_WEBHOOK_SECRET`] ?? "";
    if (!webhookSecret) throw new Error(`${providerCode.toUpperCase()}_WEBHOOK_SECRET tanımlanmamış. Webhook imzası doğrulanamaz.`);

    const adapter = await buildAdapter(providerCode);
    const result = await adapter.verifyWebhook(payload, signature, webhookSecret);

    if (!result.valid) throw new Error("Webhook imza doğrulaması başarısız.");

    // Tanımadığımız eventleri sessizce atla
    if (!HANDLED_EVENTS.has(result.event)) return;

    // Boş providerPaymentId → atla (bilinmeyen event fallback)
    if (!result.providerPaymentId) return;

    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: result.providerPaymentId },
      include: { order: { select: { id: true, paymentStatus: true, number: true } } },
    });

    if (!payment) {
      // payment_intent.succeeded checkout.session.completed'dan sonra gelebilir ve
      // providerPaymentId artık pi_... olabilir — idempotent, loglayıp geç.
      console.warn(`[Webhook/${result.event}] Payment bulunamadı: ${result.providerPaymentId}`);
      return;
    }

    await prisma.$transaction(async (tx) => {
      if (result.status === "succeeded") {
        // Zaten ödenmişse idempotent — yinelenen webhookları atla
        if (payment.order.paymentStatus === "PAID") return;

        // checkout.session.completed için providerPaymentId'yi PI ID ile güncelle
        // Bu sayede ilerideki charge.refunded webhook'u PI ID ile arama yapabilir.
        const updateData: Record<string, unknown> = {
          status: "SUCCEEDED",
          webhookVerified: true,
        };
        if (result.secondaryId && result.secondaryId !== payment.providerPaymentId) {
          updateData.providerPaymentId = result.secondaryId;
          updateData.metadata = {
            ...(typeof payment.metadata === "object" && payment.metadata !== null ? payment.metadata : {}),
            sessionId: payment.providerPaymentId,
          };
        }
        await tx.payment.update({ where: { id: payment.id }, data: updateData });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        });

        // Rezervasyonu gerçek stok düşümüne dönüştür
        const items = await tx.orderItem.findMany({ where: { orderId: payment.orderId } });
        for (const item of items) {
          await tx.inventoryItem.updateMany({
            where: { variantId: item.variantId, trackQuantity: true },
            data: {
              quantity: { decrement: item.quantity },
              reserved: { decrement: item.quantity },
            },
          });
        }
      } else if (result.status === "refunded") {
        // Kısmi iade → PARTIALLY_PAID, tam iade → REFUNDED
        const orderPaymentStatus = result.isPartialRefund ? "PARTIALLY_PAID" : "REFUNDED";
        const orderStatus        = result.isPartialRefund ? "CONFIRMED"      : "REFUNDED";

        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "REFUNDED", webhookVerified: true },
        });
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: orderPaymentStatus, status: orderStatus },
        });
      } else if (result.status === "failed" || result.status === "cancelled") {
        if (payment.order.paymentStatus !== "UNPAID") return; // Zaten işlenmiş

        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED", webhookVerified: true },
        });

        // Stok rezervasyonunu serbest bırak
        const items = await tx.orderItem.findMany({ where: { orderId: payment.orderId } });
        for (const item of items) {
          await tx.inventoryItem.updateMany({
            where: { variantId: item.variantId, trackQuantity: true },
            data: { reserved: { decrement: item.quantity } },
          });
        }
      }
    });

    // Transaction sonrası async işlemler (hata akışı durdurmaz)
    if (result.status === "succeeded" && payment.order.paymentStatus !== "PAID") {
      emailService.sendPaymentConfirmation(payment.orderId).catch(console.error);

      const order = await prisma.order.findUnique({ where: { id: payment.orderId }, select: { number: true } });
      const items  = await prisma.orderItem.findMany({ where: { orderId: payment.orderId } });
      for (const item of items) {
        stockMovementService.log({
          variantId: item.variantId,
          type: "SALE",
          quantity: -item.quantity,
          reason: "Ödeme onayı — stok düşümü",
          reference: order?.number ?? undefined,
        }).catch(console.error);
      }
    }
  },

  // ─── Admin: Sağlayıcı Konfigürasyonu ────────────────────────────────────
  async saveProviderConfig(providerId: string, marketId: string | null, configData: Record<string, string>) {
    // Not: Prisma, @@unique bileşik anahtarında `null` değerini desteklemiyor
    // ("Argument marketId must not be null"), bu yüzden upsert yerine
    // findFirst + update/create kullanıyoruz. Önceki upsert `marketId ?? ""`
    // ile arıyordu ama satırlar `marketId: null` ile saklanıyordu — hiçbir zaman
    // eşleşmiyor ve her kayıtta yeni bir kopya satır oluşturuluyordu.
    const existing = await prisma.paymentProviderConfig.findFirst({
      where: { providerId, marketId },
    });
    // Mevcut config ile yeni değerleri birleştir (merge) — boş bırakılan alanlar
    // eskisini korur, böylece sadece secretKey değiştirirken publishableKey kaybolmaz.
    const existingData = (existing?.configData as Record<string, string>) ?? {};
    const merged: Record<string, string> = { ...existingData };
    for (const [k, v] of Object.entries(configData)) {
      if (v.trim()) merged[k] = v.trim();
    }
    const data = { configData: merged as import("@prisma/client").Prisma.InputJsonValue };
    if (existing) {
      return prisma.paymentProviderConfig.update({ where: { id: existing.id }, data });
    }
    return prisma.paymentProviderConfig.create({ data: { providerId, marketId, ...data } });
  },

  async toggleProvider(providerId: string, active: boolean) {
    return prisma.paymentProvider.update({ where: { id: providerId }, data: { active } });
  },

  async toggleMarketProvider(marketId: string, providerId: string, active: boolean) {
    return prisma.marketPaymentProvider.upsert({
      where: { marketId_paymentProviderId: { marketId, paymentProviderId: providerId } },
      update: { active },
      create: { marketId, paymentProviderId: providerId, active },
    });
  },

  async listProvidersForAdmin() {
    return prisma.paymentProvider.findMany({
      include: {
        configs: true,
        marketPaymentProviders: { include: { market: { select: { id: true, name: true } } } },
      },
      orderBy: { name: "asc" },
    });
  },

  async getOrderPaymentStatus(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true, status: true, number: true },
    });
  },
};
