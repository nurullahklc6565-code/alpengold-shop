/**
 * Demo ürün seed scripti.
 * Mevcut "tavsan" / "Test Kategori" gibi dummy kayıtları temizler,
 * ardından 10 gerçekçi demo ürün ekler.
 *
 * Çalıştır: npx tsx prisma/seed-demo.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Sabit ID'ler (mevcut DB'den alındı) ────────────────────────────────────
const MARKET_ID   = "cmq0m59r10001yh1asenza596"; // Türkiye pazarı
const CURRENCY_ID = "cmq030r1h0003yhyp7wniubak"; // TRY

// ─── Yardımcı: basit slug ───────────────────────────────────────────────────
function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ışİŞ]/g, (c) => ({ i: "i", ı: "i", İ: "i", Ş: "s", ş: "s" }[c] ?? c))
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Kategoriler ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Saat",               position: 1 },
  { name: "Gözlük",             position: 2 },
  { name: "Telefon Aksesuarı",  position: 3 },
  { name: "Çanta",              position: 4 },
  { name: "Parfüm",             position: 5 },
  { name: "Ayakkabı",           position: 6 },
  { name: "Cüzdan",             position: 7 },
  { name: "Kulaklık",           position: 8 },
  { name: "Takı",               position: 9 },
  { name: "Ev Aksesuarı",       position: 10 },
];

// ─── Ürün tanımları ──────────────────────────────────────────────────────────
type VariantDef = {
  sku: string;
  options: Record<string, string>;
  price: number;
  compareAt?: number;
  stock: number;
  lowStock?: number;
};

type ProductDef = {
  name: string;
  description: string;
  category: string;
  vendor: string;
  tags: string[];
  imageFile: string;
  imageAlt: string;
  variants: VariantDef[];
};

const PRODUCTS: ProductDef[] = [
  {
    name: "Clasico Deri Kayışlı Saat",
    description:
      "Zamansız tasarımı ve İtalyan deri kayışıyla her kombinasyona uyum sağlayan analog saat. " +
      "Mineral cam koruma, 50 metre su direnci ve paslanmaz çelik kasa. " +
      "Otomatik kurmalı Miyota hareketi ile günlük kullanımda mükemmel güvenilirlik.",
    category: "Saat",
    vendor: "Clasico",
    tags: ["saat", "analog", "deri", "erkek"],
    imageFile: "saat-klasik-001.jpg",
    imageAlt: "Clasico deri kayışlı analog saat — kahverengi deri kayış üzerinde gümüş kasa",
    variants: [
      { sku: "SAT-CLS-001-SLV", options: { Renk: "Gümüş / Kahverengi" }, price: 2890, compareAt: 3450, stock: 18, lowStock: 4 },
      { sku: "SAT-CLS-001-GLD", options: { Renk: "Altın / Siyah"      }, price: 3190, compareAt: 3750, stock: 10, lowStock: 3 },
    ],
  },
  {
    name: "Aviator Güneş Gözlüğü",
    description:
      "Klasik havacı formuyla tasarlanan bu güneş gözlüğü %100 UV400 koruma sunar. " +
      "Polarize cam, hafif titanyum çerçeve ve ayarlanabilir burun pedleri ile uzun süreli konfor. " +
      "Kılıf ve temizleme bezi dahildir.",
    category: "Gözlük",
    vendor: "Optima",
    tags: ["güneş gözlüğü", "aviator", "polarize", "uv400"],
    imageFile: "gozluk-aviator-001.jpg",
    imageAlt: "Titanyum çerçeveli aviator güneş gözlüğü — yuvarlak polarize cam",
    variants: [
      { sku: "GZL-AVT-001-GLD", options: { Çerçeve: "Altın" }, price: 1250, stock: 35 },
      { sku: "GZL-AVT-001-SLV", options: { Çerçeve: "Gümüş" }, price: 1250, stock: 28 },
      { sku: "GZL-AVT-001-BLK", options: { Çerçeve: "Siyah"  }, price: 1350, stock: 42 },
    ],
  },
  {
    name: "Tam Koruma Deri Telefon Kılıfı",
    description:
      "Gerçek dana derisi yüzey ve dayanıklı polimer iç yapı ile hem estetik hem de maksimum koruma. " +
      "MagSafe uyumlu, kablosuz şarj desteği mevcut. " +
      "Kart yuvası ve ince profil ile ceple mükemmel uyum.",
    category: "Telefon Aksesuarı",
    vendor: "CaseArt",
    tags: ["telefon kılıfı", "deri", "magsafe", "iphone"],
    imageFile: "telefon-kilif-001.jpg",
    imageAlt: "Koyu kahverengi deri telefon kılıfı — MagSafe kart yuvası",
    variants: [
      { sku: "TLF-KLF-001-14P",  options: { Model: "iPhone 14 Pro"  }, price: 490, compareAt: 650, stock: 55 },
      { sku: "TLF-KLF-001-15P",  options: { Model: "iPhone 15 Pro"  }, price: 490, compareAt: 650, stock: 70 },
      { sku: "TLF-KLF-001-16P",  options: { Model: "iPhone 16 Pro"  }, price: 520, compareAt: 680, stock: 80 },
      { sku: "TLF-KLF-001-S24U", options: { Model: "Samsung S24 Ultra" }, price: 480, compareAt: 630, stock: 45 },
    ],
  },
  {
    name: "İtalyan Deri Omuz Çantası",
    description:
      "Floransa'dan ithal yumuşak dantel derisi ile el yapımı. Sıkı dikişler ve güçlendirilmiş metal tokalar. " +
      "İçinde laptop bölmesi, fermuarlı cep ve iki açık bölme ile günlük ihtiyacınızı karşılar. " +
      "Omuz askısı ayarlanabilir, uzun saplı kullanım da mümkün.",
    category: "Çanta",
    vendor: "Fiorenza",
    tags: ["çanta", "deri", "omuz çantası", "italyan"],
    imageFile: "canta-001.jpg",
    imageAlt: "Krem bej İtalyan deri omuz çantası — altın metal tokalar",
    variants: [
      { sku: "CNT-ITA-001-CRM", options: { Renk: "Krem"  }, price: 4200, compareAt: 5500, stock: 12, lowStock: 3 },
      { sku: "CNT-ITA-001-TAN", options: { Renk: "Taba"  }, price: 4200, compareAt: 5500, stock: 9,  lowStock: 3 },
      { sku: "CNT-ITA-001-BLK", options: { Renk: "Siyah" }, price: 4200, compareAt: 5500, stock: 15, lowStock: 4 },
    ],
  },
  {
    name: "Oud & Amber Erkek Parfümü",
    description:
      "Doğu'nun mistik ruhunu Batı'nın zarafetiyle buluşturan kokusu ile kalıcı bir iz bırakır. " +
      "Üst notalar: bergamot ve taze baharat. Orta notalar: Oud ağacı ve sandal ağacı. " +
      "Dip notalar: amber, misk ve kederli vetiver. 8 saat üzeri kalıcılık.",
    category: "Parfüm",
    vendor: "Noir Ateliers",
    tags: ["parfüm", "oud", "amber", "erkek", "edp"],
    imageFile: "parfum-001.jpg",
    imageAlt: "Oud & Amber erkek parfümü — amber renkli cam şişe siyah kapak",
    variants: [
      { sku: "PRF-OUD-001-50ML",  options: { Hacim: "50 ml"  }, price: 1890, stock: 30 },
      { sku: "PRF-OUD-001-100ML", options: { Hacim: "100 ml" }, price: 2750, compareAt: 3100, stock: 22, lowStock: 5 },
    ],
  },
  {
    name: "Minimal Koşu Ayakkabısı",
    description:
      "Ultra hafif EVA taban ve breathable örgü üst yüzey ile günlük antrenman ve şehir kullanımına uygun. " +
      "Belirgin burnu ve clean silüeti ile spor kıyafetlerin yanı sıra günlük kombinlere de eşlik eder. " +
      "Yıkanabilir iç tabanlık, hafızalı köpük destekli topuk.",
    category: "Ayakkabı",
    vendor: "Stride",
    tags: ["ayakkabı", "spor", "koşu", "minimal"],
    imageFile: "ayakkabi-001.jpg",
    imageAlt: "Kırmızı ve beyaz minimal koşu ayakkabısı — yan profil",
    variants: [
      { sku: "AYK-KSU-001-40", options: { Numara: "40" }, price: 2199, compareAt: 2799, stock: 8  },
      { sku: "AYK-KSU-001-41", options: { Numara: "41" }, price: 2199, compareAt: 2799, stock: 15 },
      { sku: "AYK-KSU-001-42", options: { Numara: "42" }, price: 2199, compareAt: 2799, stock: 20 },
      { sku: "AYK-KSU-001-43", options: { Numara: "43" }, price: 2199, compareAt: 2799, stock: 18 },
      { sku: "AYK-KSU-001-44", options: { Numara: "44" }, price: 2199, compareAt: 2799, stock: 10, lowStock: 3 },
    ],
  },
  {
    name: "İnce Deri Kartlık",
    description:
      "Full-grain dana derisi ve RFID bloklama teknolojisiyle kişisel verilerinizi korur. " +
      "6 kart yuvası, iç bölme ve dış para gözü. Cep dostu 6 mm ince profil. " +
      "Kullandıkça renk derinleşen patina etkisi ile özgün karakterini kazanır.",
    category: "Cüzdan",
    vendor: "Slimline",
    tags: ["cüzdan", "kartlık", "deri", "rfid", "ince"],
    imageFile: "cuzdan-001.jpg",
    imageAlt: "Açık kahverengi ince deri kartlık — üç kart yuvalı katlanabilir tasarım",
    variants: [
      { sku: "CZD-KRT-001-TAN", options: { Renk: "Taba"  }, price: 650, stock: 60 },
      { sku: "CZD-KRT-001-BLK", options: { Renk: "Siyah" }, price: 650, stock: 50 },
      { sku: "CZD-KRT-001-BRN", options: { Renk: "Koyu Kahve" }, price: 650, stock: 45 },
    ],
  },
  {
    name: "Pro Gürültü Önleyici Kulaklık",
    description:
      "40 dB aktif gürültü önleme (ANC), 30 saate kadar pil ömrü ve katlanabilir tasarım. " +
      "40 mm özel sürücü ile canlı bas ve kristal net orta frekas. " +
      "Bluetooth 5.3, multipoint bağlantı (2 cihaz eş zamanlı), USB-C hızlı şarj. " +
      "Bellek köpüklü kulak pedleri ile saatlerce konforlu kullanım.",
    category: "Kulaklık",
    vendor: "SonicLab",
    tags: ["kulaklık", "anc", "bluetooth", "kulak üstü", "gürültü önleme"],
    imageFile: "kulaklık-001.jpg",
    imageAlt: "Gümüş-siyah over-ear kulaklık — gürültü önleyici bluetooth",
    variants: [
      { sku: "KLK-PRO-001-SLV", options: { Renk: "Gümüş / Siyah" }, price: 3499, compareAt: 4200, stock: 15, lowStock: 4 },
      { sku: "KLK-PRO-001-BLK", options: { Renk: "Mat Siyah"      }, price: 3499, compareAt: 4200, stock: 18, lowStock: 4 },
    ],
  },
  {
    name: "14 Ayar Altın Zincir Kolye",
    description:
      "Türk ustalığıyla üretilen 14 ayar (585) sarı altın. 45 cm zincir boyu, 1.5 mm tel kalınlığı. " +
      "Kelebek kilit ile güvenli takma, tüm boyunlara uygun geometri. " +
      "Sertifikalı kuyum güvencesi. Hediye kutusunda teslim edilir.",
    category: "Takı",
    vendor: "GoldCraft",
    tags: ["kolye", "altın", "14 ayar", "takı", "hediye"],
    imageFile: "kolye-altin-001.jpg",
    imageAlt: "14 ayar altın zincir kolye — beyaz arka plan üzerinde parlak sarı altın",
    variants: [
      { sku: "TKI-KLY-001-45CM", options: { Uzunluk: "45 cm" }, price: 5600, stock: 8,  lowStock: 2 },
      { sku: "TKI-KLY-001-50CM", options: { Uzunluk: "50 cm" }, price: 6200, stock: 6,  lowStock: 2 },
    ],
  },
  {
    name: "El Yapımı Beton Mumluk Seti",
    description:
      "Atölye ortamında beton dökümle üretilen 3'lü mumluk seti. " +
      "Her parça biriciktir; hafif renk farklılıkları el yapımı karakterin yansımasıdır. " +
      "S, M, L boyutlarında geniş ya da ince mum uyumlu tasarım. " +
      "Taban koruyucu ped dahil, çizilmeye karşı güvenli kullanım.",
    category: "Ev Aksesuarı",
    vendor: "ConcreteLab",
    tags: ["mumluk", "beton", "el yapımı", "dekorasyon", "set"],
    imageFile: "mumluk-001.jpg",
    imageAlt: "El yapımı beton mumluk seti — üç farklı boy, sade minimalist tasarım",
    variants: [
      { sku: "EV-MML-001-SET3", options: {}, price: 380, compareAt: 480, stock: 55 },
    ],
  },
];

// ─── Ana fonksiyon ───────────────────────────────────────────────────────────
async function main() {
  console.log("🧹 Eski demo veriler temizleniyor...");

  // "tavsan" ve alakasız test ürünlerini sil
  const testSlugs = ["tavsan"];
  for (const s of testSlugs) {
    const p = await prisma.product.findUnique({ where: { slug: s } });
    if (p) {
      await prisma.product.delete({ where: { id: p.id } });
      console.log(`  Silindi: ${s}`);
    }
  }

  // "Test Kategori" sil
  const testCat = await prisma.category.findUnique({ where: { slug: "test-kategori" } });
  if (testCat) {
    await prisma.category.delete({ where: { id: testCat.id } });
    console.log("  Silindi: Test Kategori");
  }

  console.log("\n📂 Kategoriler oluşturuluyor...");
  const catMap = new Map<string, string>(); // name → id

  for (const cat of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: slug(cat.name) } });
    if (existing) {
      catMap.set(cat.name, existing.id);
      console.log(`  Mevcut: ${cat.name}`);
    } else {
      const created = await prisma.category.create({
        data: {
          name:     cat.name,
          slug:     slug(cat.name),
          active:   true,
          position: cat.position,
        },
      });
      catMap.set(cat.name, created.id);
      console.log(`  ✓ Oluşturuldu: ${cat.name}`);
    }
  }

  console.log("\n📦 Ürünler ekleniyor...");

  for (const def of PRODUCTS) {
    const productSlug = slug(def.name);

    // Zaten varsa atla
    const existing = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (existing) {
      console.log(`  Atlandı (mevcut): ${def.name}`);
      continue;
    }

    const categoryId = catMap.get(def.category) ?? null;
    const imageUrl   = `/uploads/2026/06/${def.imageFile}`;

    // Transaction: product + image + variant(s) + inventory + price
    await prisma.$transaction(async (tx) => {
      // Ürün
      const product = await tx.product.create({
        data: {
          name:        def.name,
          slug:        productSlug,
          description: def.description,
          categoryId,
          status:      "ACTIVE",
          vendor:      def.vendor,
          tags:        def.tags,
          taxClass:    "standard",
        },
      });

      // Ana görsel
      const image = await tx.productImage.create({
        data: {
          productId: product.id,
          url:       imageUrl,
          alt:       def.imageAlt,
          position:  0,
          isPrimary: true,
        },
      });

      // Varyantlar
      for (const vDef of def.variants) {
        const variant = await tx.productVariant.create({
          data: {
            productId:     product.id,
            sku:           vDef.sku,
            options:       vDef.options,
            basePrice:     vDef.price,
            compareAtPrice: vDef.compareAt ?? null,
            imageId:       image.id,
            active:        true,
          },
        });

        // Stok
        await tx.inventoryItem.create({
          data: {
            variantId:        variant.id,
            trackQuantity:    true,
            quantity:         vDef.stock,
            reserved:         0,
            lowStockThreshold: vDef.lowStock ?? null,
          },
        });

        // Pazar fiyatı (TRY)
        await tx.productVariantPrice.create({
          data: {
            variantId:     variant.id,
            marketId:      MARKET_ID,
            currencyId:    CURRENCY_ID,
            price:         vDef.price,
            compareAtPrice: vDef.compareAt ?? null,
          },
        });
      }
    });

    console.log(`  ✓ ${def.name}  [${def.variants.length} varyant, ${def.category}]`);
  }

  console.log("\n✅ Demo seed tamamlandı.");
  console.log("   10 ürün, 10 kategori, görseller /uploads/2026/06/ altında.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
