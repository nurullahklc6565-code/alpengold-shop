/**
 * Premium ürün seed scripti — mevcut demo ürünlerin tamamı silinip
 * 10 premium ürün, 10 yeni kategori ve yüksek kaliteli görseller eklenir.
 *
 * Çalıştır: npx tsx prisma/seed-premium.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MARKET_ID   = "cmq0m59r10001yh1asenza596";
const CURRENCY_ID = "cmq030r1h0003yhyp7wniubak"; // TRY

// ─── Kategoriler ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Kol Saatleri",          slug: "kol-saatleri",          position: 1  },
  { name: "Güneş Gözlükleri",      slug: "gunes-gozlukleri",      position: 2  },
  { name: "Deri Çantalar",         slug: "deri-cantalar",         position: 3  },
  { name: "Niş Parfümler",         slug: "nis-parfumler",         position: 4  },
  { name: "Kablosuz Kulaklıklar",  slug: "kablosuz-kulakliklar",  position: 5  },
  { name: "Premium Takılar",       slug: "premium-takilar",       position: 6  },
  { name: "Deri Cüzdanlar",        slug: "deri-cüzdanlar",        slug2: "deri-cuzdanlar", position: 7  },
  { name: "Akıllı Aksesuarlar",    slug: "akilli-aksesuarlar",    position: 8  },
  { name: "Dekorasyon Ürünleri",   slug: "dekorasyon-urunleri",   position: 9  },
  { name: "Koleksiyon Ürünleri",   slug: "koleksiyon-urunleri",   position: 10 },
];

// ─── Ürünler ─────────────────────────────────────────────────────────────────
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
  slug: string;
  description: string;
  vendor: string;
  category: string;
  tags: string[];
  imageFile: string;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  variants: VariantDef[];
};

const PRODUCTS: ProductDef[] = [
  // ─── 1. KOL SAATİ ──────────────────────────────────────────────────────────
  {
    name:    "Grand Calibre Otomatik Kronograf",
    slug:    "grand-calibre-otomatik-kronograf",
    vendor:  "Maison Horlogerie",
    category: "Kol Saatleri",
    description:
      "İsviçre kökenli otomatik ETA 7750 hareketi ve 48 saat güç rezervi ile donatılmış bu kronograf, " +
      "klasik bir el saatinin tüm değerini modern bir dokunuşla taşıyor. " +
      "316L paslanmaz çelik kasa, safir kristal cam, dönen çerçeve ve 100 metre su direnci. " +
      "İtalyan deri kayışı el dikişi ile bitirilmiş; toprak tonlarının sıcaklığı polished çelikle buluşuyor. " +
      "Her saat numaralı sertifikasıyla teslim edilir.",
    tags:    ["saat", "kronograf", "otomatik", "İsviçre", "lüks"],
    imageFile: "saat-premium-001.jpg",
    imageAlt:  "Grand Calibre kronograf kol saati — safir kristal cam, kahverengi deri kayış",
    seoTitle:       "Grand Calibre Otomatik Kronograf | Maison Horlogerie",
    seoDescription: "İsviçre ETA 7750 hareketi, safir kristal, 100m su direnci. Numaralı sertifikalı premium saat.",
    variants: [
      { sku: "SAT-GRC-001-SLV", options: { Kasa: "Gümüş / Taba Deri"  }, price: 8500,  compareAt: 10200, stock: 12, lowStock: 3 },
      { sku: "SAT-GRC-001-BLK", options: { Kasa: "PVD Siyah / Siyah"  }, price: 9200,  compareAt: 11000, stock: 8,  lowStock: 2 },
    ],
  },

  // ─── 2. GÜNEŞ GÖZLÜĞÜ ──────────────────────────────────────────────────────
  {
    name:    "Riviera Titanium Güneş Gözlüğü",
    slug:    "riviera-titanium-gunes-gozlugu",
    vendor:  "Optika Milano",
    category: "Güneş Gözlükleri",
    description:
      "Uçak sınıfı titanium çerçeve ve Carl Zeiss marka polarize camlarıyla Fransız Riviera'nın " +
      "güneşli şıklığını her yere taşıyın. %100 UV400 koruma, CR-39 lens ve ayarlanabilir titanyum " +
      "burun pedleri ile tam günlük yüksek konfor. 18 gram ağırlığıyla yüz üzerinde hissettirmiyor. " +
      "El yapımı menteşeler ve yaşam boyu garanti.",
    tags:    ["gözlük", "güneş gözlüğü", "titanium", "polarize", "zeiss"],
    imageFile: "gozluk-premium-001.jpg",
    imageAlt:  "Riviera titanium güneş gözlüğü — ince metal çerçeve, koyu polarize cam",
    seoTitle:       "Riviera Titanium Güneş Gözlüğü | Optika Milano",
    seoDescription: "Carl Zeiss polarize cam, uçak sınıfı titanium, UV400 koruma. 18 gram ultra hafif.",
    variants: [
      { sku: "GZL-RVR-001-GLD", options: { Çerçeve: "Altın / Koyu Kahve" }, price: 4800, compareAt: 5800, stock: 20, lowStock: 4 },
      { sku: "GZL-RVR-001-SLV", options: { Çerçeve: "Gümüş / Gri"        }, price: 4800, compareAt: 5800, stock: 18, lowStock: 4 },
      { sku: "GZL-RVR-001-BLK", options: { Çerçeve: "Mat Siyah / Siyah"  }, price: 5200, compareAt: 6300, stock: 22, lowStock: 5 },
    ],
  },

  // ─── 3. DERİ ÇANTA ─────────────────────────────────────────────────────────
  {
    name:    "Florentine El Yapımı Deri Postacı Çantası",
    slug:    "florentine-el-yapimi-deri-postaci-cantasi",
    vendor:  "Casa Fiorenza",
    category: "Deri Çantalar",
    description:
      "Floransa'nın tarihi Oltrarno bölgesindeki atölyede, nesiller boyu süregelen deri işleme " +
      "geleneğiyle üretilen postacı çantası. Full-grain Toscana derisi; kullandıkça koyulaşan " +
      "doğal patina etkisi kazanır. Bakır perçinler ve gizli manyetik kilit. " +
      "İç: 15 inç laptop bölmesi, fermuarlı cep, kalem yuvası. Omuz askısı ayarlanabilir ve çıkarılabilir. " +
      "Sanatçının imzasını taşıyan numaralı sertifika ile teslim edilir.",
    tags:    ["çanta", "deri", "postacı", "floransa", "el yapımı", "full-grain"],
    imageFile: "canta-premium-001.jpg",
    imageAlt:  "Florentine el yapımı deri postacı çantası — taba rengi, bakır tokalı",
    seoTitle:       "Florentine El Yapımı Deri Postacı Çantası | Casa Fiorenza",
    seoDescription: "Floransa yapımı full-grain Toscana derisi, numaralı sertifika, 15\" laptop bölmesi.",
    variants: [
      { sku: "CNT-FLR-001-TAN", options: { Renk: "Taba"          }, price: 12500, compareAt: 15000, stock: 10, lowStock: 2 },
      { sku: "CNT-FLR-001-BRN", options: { Renk: "Koyu Kahve"    }, price: 12500, compareAt: 15000, stock: 8,  lowStock: 2 },
      { sku: "CNT-FLR-001-BLK", options: { Renk: "Siyah"         }, price: 12500, compareAt: 15000, stock: 12, lowStock: 3 },
    ],
  },

  // ─── 4. NİŞ PARFÜM ─────────────────────────────────────────────────────────
  {
    name:    "Noir de Minuit Extrait de Parfum",
    slug:    "noir-de-minuit-extrait-de-parfum",
    vendor:  "Atelier Nocturne",
    category: "Niş Parfümler",
    description:
      "Gece yarısının sessiz zarafetinden ilham alan bu extrait, " +
      "Madagaskar vanilya, Suudi Arabistan oud'u ve Grasse'dan ithal iris absolu' nun " +
      "ender birleşimini taşır. %35 parfüm konsantrasyonu ile deri üzerinde 12+ saat kalıcılık sunar. " +
      "Üst notalar: bergamot, karabiber. Kalp notaları: oud, sandal ağacı, süsen. " +
      "Dip notalar: Madagaskar vanilyası, ağır misk, amber. " +
      "El kesilmiş kristal şişe ve ipek kılıflı sertifika kutusunda teslim edilir.",
    tags:    ["parfüm", "extrait", "oud", "niş", "lüks", "uniseks"],
    imageFile: "parfum-premium-001.jpg",
    imageAlt:  "Noir de Minuit extrait de parfum — siyah kapak, şeffaf kristal şişe",
    seoTitle:       "Noir de Minuit Extrait de Parfum | Atelier Nocturne",
    seoDescription: "%35 konsantrasyon, 12+ saat kalıcılık. Madagaskar vanilya, Grasse iris, Suudi oud.",
    variants: [
      { sku: "PRF-NDM-001-50ML",  options: { Hacim: "50 ml"  }, price: 5200,  stock: 25, lowStock: 5 },
      { sku: "PRF-NDM-001-100ML", options: { Hacim: "100 ml" }, price: 8900,  compareAt: 10500, stock: 15, lowStock: 3 },
    ],
  },

  // ─── 5. KABLOSUZ KULAKLIK ───────────────────────────────────────────────────
  {
    name:    "Auditus Planar Hi-Fi Kablosuz Kulaklık",
    slug:    "auditus-planar-hifi-kablosuz-kulaklik",
    vendor:  "Auditus Labs",
    category: "Kablosuz Kulaklıklar",
    description:
      "Stüdyo kalitesinde ses deneyimi için tasarlanan planar manyetik sürücü teknolojisi, " +
      "konvansiyonel dinamik sürücülerin ötesinde bir detay ve sahne genişliği sunar. " +
      "Aktif gürültü önleme (ANC) 42 dB'e ulaşırken, şeffaf mod dış dünyayı olduğu gibi " +
      "aktarır. Bluetooth 5.3 aptX Lossless, 36 saat pil (ANC kapalı 52 saat). " +
      "Çekirdek alüminyum çerçeve, Alman Pittards derisi kulak pedi, CNC işlemeli kumanda düğmeleri.",
    tags:    ["kulaklık", "planar", "hi-fi", "anc", "bluetooth", "lossless"],
    imageFile: "kulaklık-premium-001.jpg",
    imageAlt:  "Auditus planar hi-fi kulaklık — alüminyum çerçeve, deri kulak pedi, over-ear",
    seoTitle:       "Auditus Planar Hi-Fi Kablosuz Kulaklık | Auditus Labs",
    seoDescription: "Planar manyetik sürücü, 42dB ANC, aptX Lossless, 52 saat pil. Stüdyo kalitesi.",
    variants: [
      { sku: "KLK-ADP-001-SLV", options: { Renk: "Uzay Gümüşü" }, price: 9500,  compareAt: 11800, stock: 14, lowStock: 3 },
      { sku: "KLK-ADP-001-BLK", options: { Renk: "Onyx Siyah"   }, price: 9500,  compareAt: 11800, stock: 16, lowStock: 3 },
    ],
  },

  // ─── 6. PREMIUM TAKI ───────────────────────────────────────────────────────
  {
    name:    "18 Ayar Elmaslı Solitaire Kolye",
    slug:    "18-ayar-elmaskli-solitaire-kolye",
    vendor:  "Atelier Joaillier",
    category: "Premium Takılar",
    description:
      "GIA sertifikalı 0.50 karat, VS2 netliğinde ve F rengi tek taş elmas; " +
      "prong (pençe) yarma ile 18 ayar (750) beyaz altın kolye üzerinde maksimum ışık geçirgenliği sağlar. " +
      "Kırılmaya karşı güçlendirilmiş kelebek kilit, 45 cm fine chain. " +
      "Kalibrasyon belgesi ve GIA sertifikası orijinal kadife kutusu ile birlikte sunulur. " +
      "Yeniden boyutlandırma ve bakım hizmetleri ömür boyu ücretsizdir.",
    tags:    ["kolye", "elmas", "18 ayar", "beyaz altın", "GIA", "solitaire"],
    imageFile: "kolye-premium-001.jpg",
    imageAlt:  "18 ayar beyaz altın elmaslı solitaire kolye — tek taş elmas, parlak prong yarma",
    seoTitle:       "18 Ayar Elmaslı Solitaire Kolye | Atelier Joaillier",
    seoDescription: "GIA sertifikalı 0.50 karat F/VS2 elmas, 18 ayar 750 beyaz altın, ömür boyu bakım garantisi.",
    variants: [
      { sku: "TKI-SOL-001-45CM", options: { Uzunluk: "45 cm" }, price: 18500, stock: 6, lowStock: 2 },
      { sku: "TKI-SOL-001-50CM", options: { Uzunluk: "50 cm" }, price: 19800, stock: 4, lowStock: 1 },
    ],
  },

  // ─── 7. DERİ CÜZDAN ───────────────────────────────────────────────────────
  {
    name:    "Saffiano Deri Slim Bifold Cüzdan",
    slug:    "saffiano-deri-slim-bifold-cuzdan",
    vendor:  "Pelletteria Venezia",
    category: "Deri Cüzdanlar",
    description:
      "Prada'nın ikonik Saffiano dokusundan ilham alan çapraz desen kakma deri; " +
      "çizilme ve ıslaklığa karşı olağanüstü dayanıklılık sağlar. " +
      "8 kart yuvası, 2 gizli bölme, iç banknotluk ve RFID engelleme katmanı. " +
      "Kalınlık: 8 mm. İtalya'da elle rendelenip boyanan kenarlar. " +
      "Cüzdan kullanıldıkça renk derinleşir ve size özgü bir patina oluşturur.",
    tags:    ["cüzdan", "saffiano", "deri", "rfid", "bifold", "slim"],
    imageFile: "cuzdan-premium-001.jpg",
    imageAlt:  "Saffiano deri slim bifold cüzdan — çapraz desen, kahverengi, açık 8 kart yuvası",
    seoTitle:       "Saffiano Deri Slim Bifold Cüzdan | Pelletteria Venezia",
    seoDescription: "Çapraz desen Saffiano deri, 8 kart yuvası, RFID engelleme, 8mm ince profil.",
    variants: [
      { sku: "CZD-SAF-001-TAN", options: { Renk: "Taba"     }, price: 2800, stock: 40, lowStock: 8 },
      { sku: "CZD-SAF-001-BLK", options: { Renk: "Siyah"    }, price: 2800, stock: 35, lowStock: 8 },
      { sku: "CZD-SAF-001-BRN", options: { Renk: "Koyu Vişne" }, price: 3100, stock: 28, lowStock: 6 },
    ],
  },

  // ─── 8. AKILLI AKSESUAR ────────────────────────────────────────────────────
  {
    name:    "Horween Deri Apple Watch Kayışı",
    slug:    "horween-deri-apple-watch-kayisi",
    vendor:  "Strap Atelier",
    category: "Akıllı Aksesuarlar",
    description:
      "Chicago'nun köklü Horween tabakhanesinden temin edilen Shell Cordovan derisi; " +
      "dünyada kendi kaderine sahip az sayıda tabakhaneden birinin ürettiği, " +
      "doğrusal yapıdaki at derisi. Eşsiz derinlik ve doğal parlaklık kazanır, yıllarca sürer. " +
      "Apple Watch Series 4–10 ve Ultra ile tam uyumlu. " +
      "El dikişli, pirinç toka; doğru bant boyutu için bilekten ölçüm rehberi dahil.",
    tags:    ["apple watch", "kayış", "horween", "deri", "cordovan", "aksesuar"],
    imageFile: "aksesuar-watch-001.jpg",
    imageAlt:  "Horween Shell Cordovan deri Apple Watch kayışı — bordo rengi, el dikişli",
    seoTitle:       "Horween Deri Apple Watch Kayışı | Strap Atelier",
    seoDescription: "Horween Shell Cordovan deri, Apple Watch 4-10 & Ultra uyumlu, el dikişli, pirinç toka.",
    variants: [
      { sku: "AWK-HRW-001-38-40", options: { Beden: "38/40/41 mm", Renk: "Bordo"       }, price: 3800, compareAt: 4500, stock: 30, lowStock: 6 },
      { sku: "AWK-HRW-001-42-44", options: { Beden: "42/44/45/49 mm", Renk: "Bordo"    }, price: 3800, compareAt: 4500, stock: 28, lowStock: 6 },
      { sku: "AWK-HRW-002-38-40", options: { Beden: "38/40/41 mm", Renk: "Koyu Yeşil"  }, price: 3800, compareAt: 4500, stock: 22, lowStock: 5 },
      { sku: "AWK-HRW-002-42-44", options: { Beden: "42/44/45/49 mm", Renk: "Koyu Yeşil" }, price: 3800, compareAt: 4500, stock: 20, lowStock: 5 },
    ],
  },

  // ─── 9. DEKORASYON ─────────────────────────────────────────────────────────
  {
    name:    "El Üflemeli Murano Cam Vazo",
    slug:    "el-uflemeli-murano-cam-vazo",
    vendor:  "Vetreria Murano",
    category: "Dekorasyon Ürünleri",
    description:
      "Venedik yakınlarındaki Murano adasındaki dördüncü kuşak ustalar tarafından " +
      "tamamen el üflemeli teknikle üretilmiştir. Her parça biriciktir: renk dağılımı, " +
      "kabarcık yapısı ve cam akışı üretimden üretime farklılık gösterir. " +
      "Borosilikat cam tabanlı soda-kireç karışımı formül, donuk mat ve parlak renk katmanlarının " +
      "iç içe geçmesini sağlar. Orijinallik belgesi ve ustanın imzasıyla teslim edilir.",
    tags:    ["vazo", "murano", "el üflemeli", "cam", "dekorasyon", "koleksiyon"],
    imageFile: "dekor-vazo-001.jpg",
    imageAlt:  "El üflemeli Murano cam vazo — mavi-yeşil geçiş tonları, mat ve parlak katmanlar",
    seoTitle:       "El Üflemeli Murano Cam Vazo | Vetreria Murano",
    seoDescription: "Venedik Murano adası, dördüncü kuşak usta yapımı, orijinallik belgeli, her parça eşsiz.",
    variants: [
      { sku: "DKR-MRN-001-S", options: { Boy: "Küçük (22 cm)"  }, price: 4800,  compareAt: 5800, stock: 18, lowStock: 4 },
      { sku: "DKR-MRN-001-L", options: { Boy: "Büyük (38 cm)"  }, price: 7200,  compareAt: 8900, stock: 10, lowStock: 2 },
    ],
  },

  // ─── 10. KOLEKSİYON ────────────────────────────────────────────────────────
  {
    name:    "Heritage Altın Uçlu Dolma Kalem Koleksiyonu",
    slug:    "heritage-altin-uclu-dolma-kalem-koleksiyonu",
    vendor:  "Maison Scriptorium",
    category: "Koleksiyon Ürünleri",
    description:
      "1897'de Viyana'da kurulan Scriptorium'un sınırlı sayıdaki Heritage serisinden. " +
      "18 ayar (750) altın uç, el kazınmış nib desenler; çift altın toka. " +
      "Piston dolum sistemi; standart kartuş uyumlu. " +
      "Rulo siyah vulkanit kasa: elin sıcaklığıyla yavaşça parlayan dokusuz yüzey. " +
      "Küresel olarak her renkten yalnızca 500 adet üretilmektedir. " +
      "Numaralı sertifika, özel mürekkep şişesi ve deri kılıf ile sunulur.",
    tags:    ["dolma kalem", "koleksiyon", "18 ayar altın", "sınırlı üretim", "heritage", "lüks"],
    imageFile: "koleksiyon-kalem-001.jpg",
    imageAlt:  "Heritage koleksiyon dolma kalem — 18 ayar altın uç, siyah vulkanit kasa",
    seoTitle:       "Heritage Altın Uçlu Dolma Kalem | Maison Scriptorium",
    seoDescription: "1897 Viyana kökenli. 18 ayar altın uç, sınırlı 500 adet, numaralı sertifika, deri kılıf.",
    variants: [
      { sku: "KLK-HRT-001-BLK", options: { Renk: "Siyah Vulkanit", "Uç": "F (İnce)"   }, price: 6800,  compareAt: 8200, stock: 12, lowStock: 3 },
      { sku: "KLK-HRT-001-BRG", options: { Renk: "Bordo Vulkanit", "Uç": "M (Orta)"    }, price: 7200,  compareAt: 8800, stock: 8,  lowStock: 2 },
      { sku: "KLK-HRT-001-GRN", options: { Renk: "Koyu Yeşil",     "Uç": "B (Geniş)"  }, price: 7500,  compareAt: 9100, stock: 6,  lowStock: 2 },
    ],
  },
];

// ─── Ana fonksiyon ───────────────────────────────────────────────────────────
async function main() {
  console.log("🗑️  Mevcut demo ürünler temizleniyor...\n");

  // Tüm mevcut ürünleri sil (cascade: variant, image, inventory, price)
  const deleted = await prisma.product.deleteMany({});
  console.log(`   ${deleted.count} ürün silindi.`);

  // Mevcut kategorileri sil
  const deletedCats = await prisma.category.deleteMany({});
  console.log(`   ${deletedCats.count} kategori silindi.\n`);

  // ─── Kategoriler ────────────────────────────────────────────────────────────
  console.log("📂 Premium kategoriler oluşturuluyor...");
  const catMap = new Map<string, string>(); // name → id

  for (const cat of CATEGORIES) {
    const slugToUse = (cat as { slug2?: string }).slug2 ?? cat.slug;
    const created = await prisma.category.create({
      data: {
        name:     cat.name,
        slug:     cat.slug,
        active:   true,
        position: cat.position,
      },
    });
    catMap.set(cat.name, created.id);
    console.log(`   ✓ ${cat.name}`);
  }

  // ─── Ürünler ────────────────────────────────────────────────────────────────
  console.log("\n📦 Premium ürünler ekleniyor...\n");

  for (const def of PRODUCTS) {
    const categoryId = catMap.get(def.category) ?? null;
    const imageUrl   = `/uploads/2026/06/${def.imageFile}`;

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name:           def.name,
          slug:           def.slug,
          description:    def.description,
          categoryId,
          status:         "ACTIVE",
          vendor:         def.vendor,
          tags:           def.tags,
          taxClass:       "standard",
          seoTitle:       def.seoTitle,
          seoDescription: def.seoDescription,
        },
      });

      const image = await tx.productImage.create({
        data: {
          productId: product.id,
          url:       imageUrl,
          alt:       def.imageAlt,
          position:  0,
          isPrimary: true,
        },
      });

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

        await tx.inventoryItem.create({
          data: {
            variantId:         variant.id,
            trackQuantity:     true,
            quantity:          vDef.stock,
            reserved:          0,
            lowStockThreshold: vDef.lowStock ?? null,
          },
        });

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

    const prices  = def.variants.map((v) => v.price);
    const minP    = Math.min(...prices).toLocaleString("tr-TR");
    const maxP    = Math.max(...prices).toLocaleString("tr-TR");
    const priceStr = prices.length > 1 && minP !== maxP ? `${minP} – ${maxP} ₺` : `${minP} ₺`;

    console.log(`   ✓ ${def.name}`);
    console.log(`     ${def.category}  ·  ${def.variants.length} varyant  ·  ${priceStr}`);
    console.log(`     Görsel: ${imageUrl}\n`);
  }

  console.log("✅ Premium seed tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
