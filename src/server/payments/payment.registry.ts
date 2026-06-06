import type { BasePaymentAdapter } from "./adapters/base.adapter";

/**
 * Ödeme sağlayıcı kayıt sistemi.
 * Yeni adaptör eklemek için register() çağrısı yeterli — kod değişikliği gerekmez.
 */
class PaymentRegistry {
  private adapters = new Map<string, BasePaymentAdapter>();

  register(adapter: BasePaymentAdapter): void {
    this.adapters.set(adapter.code, adapter);
  }

  get(code: string): BasePaymentAdapter {
    const adapter = this.adapters.get(code);
    if (!adapter) {
      throw new Error(`Payment adapter not found: ${code}`);
    }
    return adapter;
  }

  getAll(): BasePaymentAdapter[] {
    return Array.from(this.adapters.values());
  }

  has(code: string): boolean {
    return this.adapters.has(code);
  }
}

export const paymentRegistry = new PaymentRegistry();

// Kurulu ve yapılandırılmış adaptörleri kayıt et
async function initializeAdapters() {
  if (process.env.STRIPE_SECRET_KEY) {
    const { StripeAdapter } = await import("./adapters/stripe.adapter");
    paymentRegistry.register(
      new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY })
    );
  }
  // İleride: iyzico, paypal adaptörleri buraya eklenir
}

// Sadece server ortamında çalışır
if (typeof window === "undefined") {
  initializeAdapters().catch(console.error);
}
