import type { Metadata } from "next";
import { getSetting } from "@/lib/utils/settings";

export const metadata: Metadata = { title: "İade ve Değişim Politikası" };

const VARSAYILAN = `İade ve Değişim Politikası

Ürünlerimizden memnun kalmamanız durumunda, teslim tarihinden itibaren 30 gün içinde iade veya değişim talebinde bulunabilirsiniz.

İade Koşulları
• Ürün kullanılmamış ve orijinal ambalajında olmalıdır.
• Ürünle birlikte fatura veya sipariş belgesi gönderilmelidir.
• Hijyen ürünler, özel sipariş ürünler ve indirimli ürünler iade kapsamı dışındadır.

İade Süreci
1. Hesabım bölümünden ilgili siparişi bulun ve "İade Talebi" oluşturun.
2. İade talebiniz 1 iş günü içinde onaylanır.
3. Kargo etiketini yazdırıp ürünü gönderin.
4. Ürün tarafımıza ulaştıktan sonra 3-5 iş günü içinde ödeme iade edilir.

Değişim
Farklı beden veya renk için değişim talebini aynı süreçle başlatabilirsiniz.`;

export default async function IadePolitikasiPage() {
  const content = (await getSetting("policy_returns")) || VARSAYILAN;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-gray-900">İade ve Değişim Politikası</h1>
      <div className="mt-8 prose prose-gray max-w-none text-sm leading-relaxed text-gray-600 whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
