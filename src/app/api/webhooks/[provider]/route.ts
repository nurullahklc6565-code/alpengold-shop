import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/server/services/payment.service";

/**
 * Tüm ödeme sağlayıcılarının webhook endpoint'i.
 * İmza doğrulaması ZORUNLUDUR — doğrulanmadan sipariş PAID yapılmaz.
 *
 * Stripe: POST /api/webhooks/stripe  (Header: stripe-signature)
 * iyzico: POST /api/webhooks/iyzico  (Header: x-iyz-signature)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  // Raw body gerekli — imza doğrulama için parse edilmiş body kullanılamaz
  const payload = Buffer.from(await req.arrayBuffer());

  // Sağlayıcıya göre signature header'ı belirle
  const signatureHeaderMap: Record<string, string> = {
    stripe:  "stripe-signature",
    iyzico:  "x-iyz-signature",
    paypal:  "paypal-transmission-sig",
  };
  const signatureHeader = signatureHeaderMap[provider] ?? "x-signature";
  const signature = req.headers.get(signatureHeader) ?? "";

  try {
    await paymentService.processWebhook(provider, payload, signature);
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    console.error(`[Webhook/${provider}]`, message);

    // İmza hatası → 400 döndür (sağlayıcı retry yapar)
    // Beklenmeyen hata → 500
    const status = message.includes("imza") || message.includes("signature") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
