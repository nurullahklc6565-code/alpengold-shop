export interface PaymentSession {
  sessionId: string;
  redirectUrl?: string;
  clientSecret?: string;
  metadata: Record<string, string>;
}

export interface PaymentVerificationResult {
  success: boolean;
  providerPaymentId: string;
  amount: number;
  currencyCode: string;
  metadata?: Record<string, unknown>;
}

export interface WebhookVerificationResult {
  valid: boolean;
  event: string;
  /** Primary ID to look up the Payment record by providerPaymentId */
  providerPaymentId: string;
  /**
   * Secondary ID — only set for checkout.session.completed.
   * The Payment Intent ID (pi_...) to store for future refund lookups,
   * since refund webhooks carry the PI ID, not the session ID.
   */
  secondaryId?: string;
  status: "succeeded" | "failed" | "cancelled" | "refunded";
  amount?: number;
  /** True when this is a partial refund (charge.refunded but amount_refunded < amount) */
  isPartialRefund?: boolean;
}

export interface BasePaymentAdapter {
  readonly code: string;
  readonly name: string;

  createPaymentSession(params: {
    orderId: string;
    amount: number;
    currencyCode: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentSession>;

  verifyPayment(providerPaymentId: string): Promise<PaymentVerificationResult>;

  verifyWebhook(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Promise<WebhookVerificationResult>;

  refundPayment(params: {
    providerPaymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<{ success: boolean; refundId: string }>;
}
