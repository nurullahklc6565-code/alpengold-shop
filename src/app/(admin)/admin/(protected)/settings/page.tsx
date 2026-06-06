import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { requirePermission } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Site Ayarları" };

async function saveSettingAction(formData: FormData): Promise<void> {
  "use server";
  await requirePermission("settings", "update");
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;
  if (!key) return;
  await prisma.setting.upsert({
    where: { key },
    update: { value: value as unknown as import("@prisma/client").Prisma.InputJsonValue },
    create: { key, value: value as unknown as import("@prisma/client").Prisma.InputJsonValue, group: key.split("_")[0] },
  });
  revalidatePath("/admin/settings");
}

const AYAR_GRUPLARI = [
  {
    grup: "Genel Bilgiler",
    ayarlar: [
      { key: "store_name",    label: "Mağaza Adı",          type: "text",  placeholder: "Mağazanın adı" },
      { key: "store_email",   label: "İletişim E-postası",   type: "email", placeholder: "iletisim@magazaniz.com" },
      { key: "store_phone",   label: "Telefon",              type: "text",  placeholder: "+90 212 000 00 00" },
      { key: "store_address", label: "Adres",                type: "text",  placeholder: "İl, ilçe, cadde..." },
    ],
  },
  {
    grup: "Ana Sayfa Hero",
    ayarlar: [
      { key: "hero_title",       label: "Hero Başlık",        type: "text", placeholder: "Kaliteyi Keşfedin" },
      { key: "hero_description", label: "Hero Açıklama",      type: "text", placeholder: "İhtiyacınız olan her şey burada..." },
      { key: "hero_cta_text",    label: "Hero Buton Metni",   type: "text", placeholder: "Alışverişe Başla" },
      { key: "hero_cta_url",     label: "Hero Buton Linki",   type: "text", placeholder: "/products" },
      { key: "hero_image_url",   label: "Hero Arka Plan Görseli URL", type: "url", placeholder: "https://... (boş bırakırsanız koyu arka plan kullanılır)" },
    ],
  },
  {
    grup: "Hakkımızda & Footer",
    ayarlar: [
      { key: "about_short",      label: "Hakkımızda Kısa (Ana Sayfa)", type: "text", placeholder: "Mağazanız hakkında 1-2 cümle..." },
      { key: "about_full",       label: "Hakkımızda Tam Metin",        type: "text", placeholder: "Hakkımızda sayfası içeriği..." },
      { key: "footer_tagline",   label: "Footer Slogan",                type: "text", placeholder: "Kaliteli ürünler, güvenli alışveriş." },
      { key: "footer_copyright", label: "Footer Telif Hakkı",           type: "text", placeholder: "© 2026 Mağaza Adı" },
    ],
  },
  {
    grup: "İletişim (Ek)",
    ayarlar: [
      { key: "contact_hours",   label: "Çalışma Saatleri", type: "text", placeholder: "Pzt–Cts 09:00–18:00" },
      { key: "contact_map_url", label: "Google Maps Embed URL", type: "url", placeholder: "https://maps.google.com/maps?..." },
    ],
  },
  {
    grup: "Politika Sayfaları",
    ayarlar: [
      { key: "policy_returns",       label: "İade Politikası",               type: "text", placeholder: "İade şartları ve süreci..." },
      { key: "policy_privacy",       label: "Gizlilik Politikası",           type: "text", placeholder: "KVKK uyumlu gizlilik metni..." },
      { key: "policy_terms",         label: "Kullanım Şartları",             type: "text", placeholder: "Kullanım koşulları..." },
      { key: "policy_distance_sale", label: "Mesafeli Satış Sözleşmesi",    type: "text", placeholder: "6502 sayılı kanun kapsamında..." },
      { key: "faq_content",          label: "SSS (JSON dizi)",               type: "text", placeholder: '[{"q":"Soru?","a":"Cevap."}]' },
    ],
  },
  {
    grup: "Görünüm",
    ayarlar: [
      { key: "store_logo_url",    label: "Logo URL",    type: "url",  placeholder: "https://..." },
      { key: "store_favicon_url", label: "Favicon URL", type: "url",  placeholder: "https://.../favicon.ico" },
    ],
  },
  {
    grup: "SEO",
    ayarlar: [
      { key: "seo_title_suffix",   label: "SEO Başlık Eki",     type: "text", placeholder: " | Mağaza Adı" },
      { key: "seo_meta_description", label: "Varsayılan Meta Açıklaması", type: "text", placeholder: "Mağaza hakkında kısa açıklama" },
    ],
  },
  {
    grup: "Sosyal Medya",
    ayarlar: [
      { key: "social_instagram", label: "Instagram",  type: "url", placeholder: "https://instagram.com/..." },
      { key: "social_twitter",   label: "X (Twitter)", type: "url", placeholder: "https://twitter.com/..." },
      { key: "social_facebook",  label: "Facebook",   type: "url", placeholder: "https://facebook.com/..." },
      { key: "social_youtube",   label: "YouTube",    type: "url", placeholder: "https://youtube.com/..." },
      { key: "social_tiktok",    label: "TikTok",     type: "url", placeholder: "https://tiktok.com/..." },
    ],
  },
  {
    grup: "Fiyatlandırma",
    ayarlar: [
      {
        key: "default_market_fallback",
        label: "Fiyat Bulunamadığında",
        type: "select",
        options: [
          { value: "BLOCK",          label: "Satışa Kapat" },
          { value: "USE_BASE_PRICE", label: "Temel Fiyatı Kullan" },
          { value: "USE_DEFAULT",    label: "Varsayılan Pazar Fiyatını Kullan" },
        ],
      },
    ],
  },
  {
    grup: "Fatura",
    ayarlar: [
      { key: "invoice_prefix",       label: "Fatura Öneki",           type: "text",  placeholder: "FAT" },
      { key: "invoice_company_name", label: "Fatura Şirket Adı",       type: "text",  placeholder: "Şirket Unvanı" },
      { key: "invoice_tax_number",   label: "Vergi / TC Kimlik No",     type: "text",  placeholder: "1234567890" },
      { key: "invoice_bank_info",    label: "Banka IBAN Bilgisi",       type: "text",  placeholder: "TR..." },
      { key: "invoice_notes",        label: "Fatura Alt Notu",          type: "text",  placeholder: "Teşekkür notu vb." },
    ],
  },
  {
    grup: "E-posta",
    ayarlar: [
      { key: "email_from_name",  label: "Gönderici Adı",      type: "text",  placeholder: "Mağaza Adı" },
      { key: "email_from_addr",  label: "Gönderici E-posta",  type: "email", placeholder: "noreply@magazaniz.com" },
      { key: "email_smtp_host",  label: "SMTP Host",          type: "text",  placeholder: "smtp.gmail.com" },
      { key: "email_smtp_port",  label: "SMTP Port",          type: "text",  placeholder: "587" },
    ],
  },
  {
    grup: "Mağaza Durumu",
    ayarlar: [
      {
        key: "maintenance_mode",
        label: "Bakım Modu",
        type: "select",
        options: [
          { value: "false", label: "Kapalı — Mağaza açık" },
          { value: "true",  label: "Açık — Mağaza bakımda" },
        ],
      },
      {
        key: "storefront_visible",
        label: "Storefront Görünürlüğü",
        type: "select",
        options: [
          { value: "true",  label: "Herkese Açık" },
          { value: "false", label: "Gizli (sadece admin)" },
        ],
      },
    ],
  },
];

type Ayar = {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

function AyarSatiri({ ayar, deger }: { ayar: Ayar; deger: string }) {
  return (
    <form action={saveSettingAction} className="flex items-end gap-3">
      <input type="hidden" name="key" value={ayar.key} />
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">{ayar.label}</label>
        {ayar.type === "select" ? (
          <select name="value" defaultValue={deger}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            {ayar.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input name="value" type={ayar.type} defaultValue={deger}
            placeholder={ayar.placeholder}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        )}
      </div>
      <button type="submit"
        className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
        Kaydet
      </button>
    </form>
  );
}

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany();
  const settingMap = Object.fromEntries(settings.map((s) => [s.key, String(s.value).replace(/^"|"$/g, "")]));

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Site Ayarları" description="Mağazanızın genel yapılandırma ayarları" />

      {AYAR_GRUPLARI.map((grup) => (
        <SectionCard key={grup.grup} title={grup.grup}>
          <div className="space-y-4">
            {grup.ayarlar.map((ayar) => (
              <AyarSatiri key={ayar.key} ayar={ayar} deger={settingMap[ayar.key] ?? ""} />
            ))}
          </div>
        </SectionCard>
      ))}

      <SectionCard title="Tüm Kayıtlı Ayarlar" description="Ham değer listesi — salt okunur">
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500">Anahtar</th>
                <th className="px-3 py-2 text-left text-gray-500">Değer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {settings.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">{s.key}</td>
                  <td className="px-3 py-2 text-gray-600 truncate max-w-xs">{String(s.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
