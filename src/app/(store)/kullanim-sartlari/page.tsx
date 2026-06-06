import type { Metadata } from "next";
import { getSetting } from "@/lib/utils/settings";

export const metadata: Metadata = { title: "Kullanım Şartları" };

const VARSAYILAN = `Kullanım Şartları

Bu web sitesini kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.

Genel Şartlar
Siteyi yalnızca yasal amaçlarla kullanabilirsiniz. Siteye zarar verebilecek, yasadışı veya başkalarının haklarını ihlal eden hiçbir faaliyette bulunamazsınız.

Fikri Mülkiyet
Sitedeki tüm içerik, marka ve görseller telif hakkı ile korunmaktadır. İzinsiz kopyalama ve dağıtım yasaktır.

Sorumluluk Sınırlaması
Sitenin kullanımından kaynaklanan doğrudan veya dolaylı zararlardan sorumlu değiliz.

Değişiklikler
Bu şartları önceden bildirmeksizin değiştirme hakkını saklı tutarız. Güncel şartlar her zaman bu sayfada yayınlanır.`;

export default async function KullanimSartlariPage() {
  const content = (await getSetting("policy_terms")) || VARSAYILAN;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-gray-900">Kullanım Şartları</h1>
      <div className="mt-8 prose prose-gray max-w-none text-sm leading-relaxed text-gray-600 whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
