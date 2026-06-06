import type { Metadata } from "next";
import { getSettings } from "@/lib/utils/settings";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = { title: "İletişim" };

export default async function IletisimPage() {
  const s = await getSettings([
    "store_name", "store_email", "store_phone", "store_address",
    "contact_hours", "contact_map_url",
  ]);

  const items = [
    { icon: Mail,   label: "E-posta", value: s.store_email,   href: s.store_email ? `mailto:${s.store_email}` : undefined },
    { icon: Phone,  label: "Telefon", value: s.store_phone,   href: s.store_phone ? `tel:${s.store_phone}` : undefined },
    { icon: MapPin, label: "Adres",   value: s.store_address, href: undefined },
    { icon: Clock,  label: "Çalışma Saatleri", value: s.contact_hours || "Pazartesi – Cumartesi, 09:00 – 18:00", href: undefined },
  ].filter((i) => i.value);

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-gray-900">İletişim</h1>
      <p className="mt-2 text-sm text-gray-400">
        Sorularınız için bize ulaşın, en kısa sürede yanıt veririz.
      </p>

      <div className="mt-8 grid gap-4">
        {items.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5">
            <div className="shrink-0 rounded-lg bg-gray-900 p-2">
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
              {href ? (
                <a href={href} className="mt-1 block text-sm font-medium text-gray-900 hover:underline">
                  {value}
                </a>
              ) : (
                <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm text-gray-400">
              İletişim bilgileri henüz eklenmedi.
            </p>
            <p className="mt-1 text-xs text-gray-300">
              Admin → Site Ayarları → Genel Bilgiler bölümünden ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>

      {s.contact_map_url && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200">
          <iframe
            src={s.contact_map_url}
            width="100%"
            height="300"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block"
            title="Konum Haritası"
          />
        </div>
      )}
    </div>
  );
}
