import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { invoiceService } from "@/server/services/invoice.service";

/**
 * Fatura yazdırma / PDF endpoint'i.
 * Admin oturumu zorunludur.
 * Tarayıcıda yeni sekmede açılır, Ctrl+P ile PDF olarak kaydedilebilir.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;

  // Admin auth kontrolü
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Yetki gerekli" }, { status: 401 });
  }

  const invoice = await invoiceService.getByNumber(number);
  if (!invoice) {
    return NextResponse.json({ error: "Fatura bulunamadı" }, { status: 404 });
  }

  const html = invoiceService.buildHtml(invoice);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
