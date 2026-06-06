import Link from "next/link";
import { getSettings } from "@/lib/utils/settings";

const SETTING_KEYS = [
  "store_name", "store_email", "store_phone", "store_address",
  "social_instagram", "social_twitter", "social_facebook", "social_youtube", "social_tiktok",
  "footer_tagline", "footer_copyright",
];

export async function StoreFooter() {
  const s = await getSettings(SETTING_KEYS);

  const storeName = s.store_name || "Mağaza";
  const copyright = s.footer_copyright || `© ${new Date().getFullYear()} ${storeName}. Tüm hakları saklıdır.`;
  const tagline   = s.footer_tagline   || "Kaliteli ürünler, güvenli alışveriş.";

  const socials = [
    { key: "social_instagram", label: "Instagram", href: s.social_instagram },
    { key: "social_facebook",  label: "Facebook",  href: s.social_facebook  },
    { key: "social_twitter",   label: "X",         href: s.social_twitter   },
    { key: "social_youtube",   label: "YouTube",   href: s.social_youtube   },
    { key: "social_tiktok",    label: "TikTok",    href: s.social_tiktok    },
  ].filter((x) => x.href);

  const cols = [
    {
      title: "Mağaza",
      links: [
        { href: "/products",    label: "Tüm Ürünler"   },
        { href: "/categories",  label: "Kategoriler"   },
        { href: "/collections", label: "Koleksiyonlar" },
      ],
    },
    {
      title: "Müşteri Hizmetleri",
      links: [
        { href: "/account",               label: "Hesabım"                },
        { href: "/account/orders",        label: "Siparişlerim"           },
        { href: "/iletisim",              label: "İletişim"               },
        { href: "/sss",                   label: "Sıkça Sorulan Sorular"  },
        { href: "/iade-politikasi",       label: "İade Politikası"        },
      ],
    },
    {
      title: "Kurumsal",
      links: [
        { href: "/hakkimizda",                label: "Hakkımızda"                  },
        { href: "/gizlilik-politikasi",       label: "Gizlilik Politikası"         },
        { href: "/kullanim-sartlari",         label: "Kullanım Şartları"           },
        { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi"  },
      ],
    },
  ];

  return (
    <footer className="border-t border-[#e5e5e5] bg-[#0a0a0a] text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">

          {/* Marka sütunu */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="text-[16px] font-bold tracking-tight text-white">
              {storeName}
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#737373]">
              {tagline}
            </p>
            {(s.store_email || s.store_phone) && (
              <div className="mt-4 space-y-1">
                {s.store_email && (
                  <p className="text-[12px] text-[#737373]">{s.store_email}</p>
                )}
                {s.store_phone && (
                  <p className="text-[12px] text-[#737373]">{s.store_phone}</p>
                )}
              </div>
            )}
            {socials.length > 0 && (
              <div className="mt-5 flex gap-4">
                {socials.map((soc) => (
                  <a
                    key={soc.key}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-medium text-[#737373] hover:text-white transition-colors"
                  >
                    {soc.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link sütunları */}
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="store-eyebrow text-[#737373] mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-[#737373] hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-[#262626] pt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-[11px] text-[#525252]">{copyright}</p>
          {s.store_address && (
            <p className="text-[11px] text-[#525252]">{s.store_address}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
