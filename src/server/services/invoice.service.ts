import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/pricing";

/** FAT-2026-000001 formatında benzersiz fatura numarası */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  const seq = String(count + 1).padStart(6, "0");
  return `FAT-${year}-${seq}`;
}

type InvoiceWithRelations = Awaited<ReturnType<typeof prisma.invoice.findUnique>> & {
  currency: { code: string; symbol: string; decimalDigits: number };
  customer: { firstName: string; lastName: string; email: string; addresses: Array<{ line1: string; city: string; country: { name: string } }> };
  order: {
    number: string;
    shippingPrice: unknown;
    discountPrice: unknown;
    items: Array<{ quantity: number; unitPrice: unknown; totalPrice: unknown; variant: { sku: string; product: { name: string } } }>;
    shippingAddress: { line1: string; city: string; country: { name: string } } | null;
  };
} | null;

export const invoiceService = {
  /** Sipariş oluşturulduğunda otomatik fatura oluştur */
  async createForOrder(orderId: string): Promise<string> {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { currency: true },
    });

    // Zaten fatura varsa mevcut numarayı dön
    const existing = await prisma.invoice.findUnique({ where: { orderId } });
    if (existing) return existing.number;

    const number = await generateInvoiceNumber();

    await prisma.invoice.create({
      data: {
        number,
        orderId: order.id,
        customerId: order.customerId,
        status: "ISSUED",
        subtotal: order.subtotalPrice,
        taxAmount: order.taxPrice,
        total: order.totalPrice,
        currencyId: order.currencyId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
      },
    });

    return number;
  },

  async getByOrder(orderId: string) {
    return prisma.invoice.findUnique({
      where: { orderId },
      include: { currency: true, customer: true },
    });
  },

  async getByNumber(number: string) {
    return prisma.invoice.findUnique({
      where: { number },
      include: {
        currency: true,
        customer: {
          include: { addresses: { where: { isDefault: true }, take: 1, include: { country: true } } },
        },
        order: {
          include: {
            items: {
              include: {
                variant: { include: { product: { select: { name: true } } } },
              },
            },
            shippingAddress: { include: { country: { select: { name: true } } } },
          },
        },
      },
    });
  },

  /** Fatura HTML içeriği (tarayıcıda yazdırılabilir/PDF) */
  buildHtml(invoice: InvoiceWithRelations): string {
    if (!invoice) return "<p>Fatura bulunamadı</p>";

    const cur = {
      code: invoice.currency.code,
      symbol: invoice.currency.symbol,
      decimalDigits: invoice.currency.decimalDigits,
    };

    const customer = invoice.customer;
    const addr = invoice.order.shippingAddress;
    const items = invoice.order.items;

    const storeName = "E-Ticaret Mağazası"; // settings'ten çekilebilir

    const rows = items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">
            ${item.variant.product.name}
            <br><span style="color:#9ca3af;font-size:11px;">SKU: ${item.variant.sku}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right;">${formatPrice(Number(item.unitPrice), cur)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;">${formatPrice(Number(item.totalPrice), cur)}</td>
        </tr>`
      )
      .join("");

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Fatura ${invoice.number}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827; padding:40px; font-size:13px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; border-bottom:2px solid #111827; padding-bottom:24px; }
    .store-name { font-size:24px; font-weight:700; color:#111827; }
    .invoice-meta { text-align:right; }
    .invoice-number { font-size:20px; font-weight:700; color:#111827; }
    .badge { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; background:#dcfce7; color:#166534; margin-top:4px; }
    .parties { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:32px; }
    .party-label { font-size:11px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
    table { width:100%; border-collapse:collapse; margin-bottom:24px; }
    thead tr { background:#f9fafb; }
    th { padding:10px 12px; text-align:left; font-size:11px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; border-bottom:2px solid #e5e7eb; }
    .totals { display:flex; justify-content:flex-end; }
    .totals-table { width:280px; }
    .totals-table td { padding:6px 0; font-size:13px; }
    .totals-table td:last-child { text-align:right; }
    .total-row td { font-size:16px; font-weight:700; border-top:2px solid #111827; padding-top:8px; }
    .footer { margin-top:40px; padding-top:16px; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:11px; text-align:center; }
    @media print {
      body { padding:20px; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#fef3c7;border:1px solid #d97706;padding:10px 16px;border-radius:8px;margin-bottom:24px;font-size:12px;color:#92400e;">
    💡 Yazdırmak veya PDF olarak kaydetmek için <strong>Ctrl+P</strong> (veya <strong>⌘+P</strong>) tuşlarına basın.
  </div>

  <div class="header">
    <div>
      <div class="store-name">${storeName}</div>
      <div style="color:#6b7280;margin-top:4px;">Fatura</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-number">${invoice.number}</div>
      <div style="color:#6b7280;margin-top:4px;">${new Date(invoice.createdAt).toLocaleDateString("tr-TR")}</div>
      <div class="badge">
        ${invoice.status === "PAID" ? "Ödendi" : invoice.status === "ISSUED" ? "Kesildi" : "Taslak"}
      </div>
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party-label">Satıcı</div>
      <div style="font-weight:600;">${storeName}</div>
    </div>
    <div>
      <div class="party-label">Müşteri / Alıcı</div>
      <div style="font-weight:600;">${customer.firstName} ${customer.lastName}</div>
      <div style="color:#6b7280;">${customer.email}</div>
      ${addr ? `<div style="color:#6b7280;margin-top:4px;">${addr.line1}, ${addr.city}<br>${addr.country.name}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Ürün</th>
        <th style="text-align:center;">Adet</th>
        <th style="text-align:right;">Birim Fiyat</th>
        <th style="text-align:right;">Toplam</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <table class="totals-table">
      <tbody>
        <tr>
          <td style="color:#6b7280;">Ara Toplam</td>
          <td>${formatPrice(Number(invoice.subtotal), cur)}</td>
        </tr>
        ${Number(invoice.order.shippingPrice) > 0 ? `
        <tr>
          <td style="color:#6b7280;">Kargo</td>
          <td>${formatPrice(Number(invoice.order.shippingPrice), cur)}</td>
        </tr>` : ""}
        ${Number(invoice.taxAmount) > 0 ? `
        <tr>
          <td style="color:#6b7280;">Vergi</td>
          <td>${formatPrice(Number(invoice.taxAmount), cur)}</td>
        </tr>` : ""}
        ${Number(invoice.order.discountPrice) > 0 ? `
        <tr>
          <td style="color:#16a34a;">İndirim</td>
          <td style="color:#16a34a;">-${formatPrice(Number(invoice.order.discountPrice), cur)}</td>
        </tr>` : ""}
        <tr class="total-row">
          <td>GENEL TOPLAM</td>
          <td>${formatPrice(Number(invoice.total), cur)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${invoice.notes ? `<div style="margin-top:24px;padding:12px;background:#f9fafb;border-radius:8px;"><span style="font-weight:600;">Not:</span> ${invoice.notes}</div>` : ""}

  <div class="footer">
    Sipariş No: ${invoice.order.number} · Fatura Tarihi: ${new Date(invoice.createdAt).toLocaleDateString("tr-TR")}
    ${invoice.dueDate ? ` · Vade: ${new Date(invoice.dueDate).toLocaleDateString("tr-TR")}` : ""}
  </div>
</body>
</html>`;
  },
};
