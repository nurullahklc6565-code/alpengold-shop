import type { Metadata } from "next";
import { getSettings } from "@/lib/utils/settings";

export const metadata: Metadata = { title: "Mesafeli Satış Sözleşmesi" };

const VARSAYILAN = `Mesafeli Satış Sözleşmesi

6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında hazırlanmıştır.

Taraflar
Satıcı: Mağaza adı ve iletişim bilgileri site ayarlarından yönetilir.
Alıcı: Sipariş veren müşteri.

Konu
İşbu sözleşme, Alıcı'nın elektronik ortamda sipariş verdiği ürünlerin satışına ilişkin hak ve yükümlülükleri düzenler.

Teslimat
Ödeme onayından itibaren 2-5 iş günü içinde kargoya verilir.

Cayma Hakkı
Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.

Uyuşmazlık Çözümü
Uyuşmazlıklarda Türkiye Tüketici Mahkemeleri ve Tüketici Hakem Heyetleri yetkilidir.`;

export default async function MesafeliSatisPage() {
  const s = await getSettings(["policy_distance_sale", "store_name"]);
  const content = s.policy_distance_sale || VARSAYILAN;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-gray-900">Mesafeli Satış Sözleşmesi</h1>
      {s.store_name && <p className="mt-2 text-sm text-gray-400">{s.store_name}</p>}
      <div className="mt-8 prose prose-gray max-w-none text-sm leading-relaxed text-gray-600 whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
