import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/server/services/payment.service";

/**
 * Ödeme durumu sorgulama endpoint'i.
 * Sadece paymentStatus ve status alanlarını döner.
 * Hassas sipariş bilgisi içermez.
 * Ödeme durumunu ASLA değiştirmez (read-only).
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId gerekli" }, { status: 400 });
  }

  const order = await paymentService.getOrderPaymentStatus(orderId);
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({
    paymentStatus: order.paymentStatus,
    status: order.status,
  });
}
