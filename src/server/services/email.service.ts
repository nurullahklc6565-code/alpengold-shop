import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/pricing";

type EmailPayload = { to: string; subject: string; html: string };

async function send(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@example.com";

  if (!apiKey) {
    // Geliştirme modu: konsola yaz
    console.log("\n📧 [Email - Dev Mode]");
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log("---");
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, ...payload });
  } catch (err) {
    // Email hatası sipariş akışını durdurmamalı
    console.error("[Email] Gönderim hatası:", err);
  }
}

export const emailService = {
  async sendOrderConfirmation(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        currency: true,
        market: { select: { name: true } },
        shippingAddress: { include: { country: { select: { name: true } } } },
        items: {
          include: {
            variant: { include: { product: { select: { name: true } } } },
          },
        },
      },
    });

    if (!order) return;

    const cur = {
      code: order.currency.code,
      symbol: order.currency.symbol,
      decimalDigits: order.currency.decimalDigits,
    };

    const itemsHtml = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">${item.variant.product.name}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;">${formatPrice(Number(item.totalPrice), cur)}</td>
          </tr>`
      )
      .join("");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Sipariş Onayı</title></head>
      <body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="font-size:20px;font-weight:700;margin-bottom:4px;">Siparişiniz Alındı</h1>
        <p style="color:#6b7280;margin-top:0;">Sipariş No: <strong>${order.number}</strong></p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:12px;text-transform:uppercase;">Ürün</th>
              <th style="text-align:center;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:12px;text-transform:uppercase;">Adet</th>
              <th style="text-align:right;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:12px;text-transform:uppercase;">Tutar</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="text-align:right;margin-top:16px;">
          <p style="margin:4px 0;color:#6b7280;">Ara Toplam: ${formatPrice(Number(order.subtotalPrice), cur)}</p>
          ${Number(order.shippingPrice) > 0 ? `<p style="margin:4px 0;color:#6b7280;">Kargo: ${formatPrice(Number(order.shippingPrice), cur)}</p>` : ""}
          ${Number(order.discountPrice) > 0 ? `<p style="margin:4px 0;color:#16a34a;">İndirim: -${formatPrice(Number(order.discountPrice), cur)}</p>` : ""}
          <p style="margin:8px 0;font-size:18px;font-weight:700;">Toplam: ${formatPrice(Number(order.totalPrice), cur)}</p>
        </div>

        ${order.shippingAddress
          ? `<div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;">
              <p style="margin:0 0 4px;font-weight:600;">Teslimat Adresi</p>
              <p style="margin:0;color:#6b7280;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.line1}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.country.name}</p>
            </div>`
          : ""}

        <div style="margin-top:24px;text-align:center;">
          <a href="${appUrl}/account/orders" style="background:#111827;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
            Siparişimi Görüntüle
          </a>
        </div>

        <p style="margin-top:32px;color:#9ca3af;font-size:12px;text-align:center;">
          Bu e-posta ${order.market.name} pazarından gönderilmiştir.
        </p>
      </body>
      </html>`;

    await send({
      to: order.customer.email,
      subject: `Siparişiniz Alındı — ${order.number}`,
      html,
    });
  },

  async sendPaymentConfirmation(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, currency: true },
    });
    if (!order) return;

    const cur = { code: order.currency.code, symbol: order.currency.symbol, decimalDigits: order.currency.decimalDigits };
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

    await send({
      to: order.customer.email,
      subject: `Ödemeniz Onaylandı — ${order.number}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2>Ödemeniz Onaylandı ✓</h2>
          <p>Sipariş <strong>${order.number}</strong> için ödemeniz başarıyla alındı.</p>
          <p>Tutar: <strong>${formatPrice(Number(order.totalPrice), cur)}</strong></p>
          <a href="${appUrl}/account/orders" style="background:#111827;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
            Siparişimi Görüntüle
          </a>
        </div>`,
    });
  },

  async sendWelcome(customerId: string): Promise<void> {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

    await send({
      to: customer.email,
      subject: "Hoş Geldiniz!",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2>Merhaba, ${customer.firstName}!</h2>
          <p>Hesabınız başarıyla oluşturuldu. Alışverişe başlayabilirsiniz.</p>
          <a href="${appUrl}/products" style="background:#111827;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
            Alışverişe Başla
          </a>
        </div>`,
    });
  },
};
