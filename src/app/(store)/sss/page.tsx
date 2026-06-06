import type { Metadata } from "next";
import { getSetting } from "@/lib/utils/settings";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = { title: "Sıkça Sorulan Sorular" };

const VARSAYILAN_SSS = [
  { q: "Siparişim ne zaman kargoya verilir?", a: "Ödeme onaylandıktan sonra siparişiniz 1-2 iş günü içinde kargoya verilir." },
  { q: "Kargo ücreti ne kadar?", a: "Kargo ücretleri sipariş tutarı ve teslimat adresine göre checkout sırasında gösterilir." },
  { q: "İade ve değişim nasıl yapılır?", a: "Ürün tesliminden itibaren 30 gün içinde iade talebinde bulunabilirsiniz. Detaylar için İade Politikası sayfamızı inceleyin." },
  { q: "Faturamı nereden indirebilirim?", a: "Hesabım → Siparişlerim bölümünden siparişinizin yanındaki fatura indirme butonuna tıklayabilirsiniz." },
  { q: "Ödeme yöntemleri nelerdir?", a: "Kredi kartı, banka kartı ve desteklenen ödeme sağlayıcılarıyla ödeme yapabilirsiniz." },
  { q: "Siparişimi nasıl takip edebilirim?", a: "Sipariş onay e-postanızdaki takip numarasını kullanarak veya Hesabım → Siparişlerim bölümünden takip edebilirsiniz." },
];

export default async function SSSPage() {
  const raw = await getSetting("faq_content");

  let items: { q: string; a: string }[] = VARSAYILAN_SSS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) items = parsed;
    } catch {
      // geçersiz JSON — varsayılanı kullan
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-gray-900">Sıkça Sorulan Sorular</h1>
      <p className="mt-2 text-sm text-gray-400">
        Aradığınız cevabı bulamazsanız{" "}
        <a href="/iletisim" className="underline text-gray-600 hover:text-gray-900">bize ulaşın</a>.
      </p>

      <div className="mt-8 divide-y divide-gray-100 rounded-2xl border border-gray-100">
        {items.map(({ q, a }, idx) => (
          <details key={idx} className="group px-6 py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium text-gray-900 select-none list-none">
              {q}
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
