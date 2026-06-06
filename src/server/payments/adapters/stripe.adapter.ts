import type {
  BasePaymentAdapter,
  PaymentSession,
  PaymentVerificationResult,
  WebhookVerificationResult,
} from "./base.adapter";

export class StripeAdapter implements BasePaymentAdapter {
  readonly code = "stripe";
  readonly name = "Stripe";

  private secretKey: string;

  constructor(config: { secretKey: string }) {
    this.secretKey = config.secretKey;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getStripe(): Promise<any> {
    try {
      const mod = await import(/* webpackIgnore: true */ "stripe");
      const Stripe = mod.default ?? mod;
      return new Stripe(this.secretKey);
    } catch {
      throw new Error("Stripe paketi kurulu değil. Kullanmak için: npm install stripe");
    }
  }

  async createPaymentSession(params: {
    orderId: string;
    amount: number;
    currencyCode: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentSession> {
    const stripe = await this.getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: params.currencyCode.toLowerCase(),
            product_data: { name: `Sipariş #${params.orderId}` },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        orderId: params.orderId,
        ...params.metadata,
      },
    });

    return {
      sessionId: session.id,
      redirectUrl: session.url ?? undefined,
      metadata: { sessionId: session.id },
    };
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerificationResult> {
    const stripe = await this.getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      success: session.payment_status === "paid",
      providerPaymentId: session.payment_intent as string,
      amount: (session.amount_total ?? 0) / 100,
      currencyCode: (session.currency as string)?.toUpperCase() ?? "",
    };
  }

  async verifyWebhook(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Promise<WebhookVerificationResult> {
    const stripe = await this.getStripe();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: { type: string; data: { object: any } };
    try {
      event = stripe.webhooks.constructEvent(payload, signature, secret);
    } catch {
      return { valid: false, event: "unknown", providerPaymentId: "", status: "failed" };
    }

    const obj = event.data.object;

    switch (event.type) {
      case "checkout.session.completed":
        // obj.id = cs_... (session ID — what we stored as providerPaymentId)
        // obj.payment_intent = pi_... (stored as secondaryId to enable future refund lookups)
        return {
          valid: true,
          event: event.type,
          providerPaymentId: obj.id as string,
          secondaryId: (obj.payment_intent as string | null) ?? undefined,
          status: "succeeded",
          amount: typeof obj.amount_total === "number" ? obj.amount_total / 100 : undefined,
        };

      case "payment_intent.succeeded":
        // obj.id = pi_... — fires after checkout.session.completed, idempotent in our handler
        return {
          valid: true,
          event: event.type,
          providerPaymentId: obj.id as string,
          status: "succeeded",
          amount: typeof obj.amount_received === "number" ? obj.amount_received / 100 : undefined,
        };

      case "payment_intent.payment_failed":
        return {
          valid: true,
          event: event.type,
          providerPaymentId: obj.id as string,
          status: "failed",
        };

      case "payment_intent.canceled":
        return {
          valid: true,
          event: event.type,
          providerPaymentId: obj.id as string,
          status: "cancelled",
        };

      case "charge.refunded": {
        // obj.payment_intent = pi_... (the PI we stored after checkout.session.completed)
        const isFullRefund = obj.refunded === true;
        return {
          valid: true,
          event: event.type,
          providerPaymentId: obj.payment_intent as string,
          status: "refunded",
          amount: typeof obj.amount_refunded === "number" ? obj.amount_refunded / 100 : undefined,
          isPartialRefund: !isFullRefund,
        };
      }

      default:
        // Unknown event — acknowledge but take no action
        return {
          valid: true,
          event: event.type,
          providerPaymentId: "",
          status: "failed",
        };
    }
  }

  async refundPayment(params: {
    providerPaymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<{ success: boolean; refundId: string }> {
    const stripe = await this.getStripe();

    const refund = await stripe.refunds.create({
      payment_intent: params.providerPaymentId,
      amount: params.amount ? Math.round(params.amount * 100) : undefined,
    });

    return { success: refund.status === "succeeded", refundId: refund.id };
  }
}
