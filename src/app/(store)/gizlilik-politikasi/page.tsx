import type { Metadata } from "next";
import { getSettings } from "@/lib/utils/settings";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

const VARSAYILAN = `Gizlilik Politikası

Kişisel verilerinizin korunması bizim için önemlidir. Bu politika, hangi verileri topladığımızı ve nasıl kullandığımızı açıklar.

Toplanan Veriler
• Ad, soyad, e-posta adresi, telefon numarası
• Teslimat ve fatura adresleri
• Sipariş ve ödeme geçmişi
• Site kullanım verileri (çerezler aracılığıyla)

Verilerin Kullanımı
Verileriniz; siparişlerinizi işlemek, müşteri hizmetleri sunmak, yasal yükümlülükleri yerine getirmek ve hizmet kalitesini artırmak amacıyla kullanılır.

Veri Güvenliği
Kişisel verileriniz SSL şifreleme ile korunmakta ve yetkisiz erişime karşı güvence altına alınmaktadır.

Haklarınız
KVKK kapsamında verilerinize erişme, düzeltme, silme veya işlemeyi kısıtlama hakkına sahipsiniz.`;

export default async function GizlilikPolitikasiPage() {
  const s = await getSettings(["policy_privacy", "store_name"]);
  const content = s.policy_privacy || VARSAYILAN;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-gray-900">Gizlilik Politikası</h1>
      {s.store_name && <p className="mt-2 text-sm text-gray-400">{s.store_name}</p>}
      <div className="mt-8 prose prose-gray max-w-none text-sm leading-relaxed text-gray-600 whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
