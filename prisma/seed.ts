import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// ISO 4217 para birimleri — hardcode değil, standart veri seti
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", decimalDigits: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimalDigits: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", decimalDigits: 2 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", decimalDigits: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimalDigits: 0 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimalDigits: 2 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimalDigits: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", decimalDigits: 2 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimalDigits: 2 },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", decimalDigits: 2 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", decimalDigits: 2 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", decimalDigits: 2 },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", decimalDigits: 2 },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", decimalDigits: 2 },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", decimalDigits: 0 },
  { code: "RON", name: "Romanian Leu", symbol: "lei", decimalDigits: 2 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", decimalDigits: 2 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", decimalDigits: 2 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", decimalDigits: 2 },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", decimalDigits: 2 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", decimalDigits: 2 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", decimalDigits: 2 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", decimalDigits: 2 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", decimalDigits: 0 },
  { code: "ZAR", name: "South African Rand", symbol: "R", decimalDigits: 2 },
];

// ISO 3166 ülkeler — kısmi liste (admin panelden genişletilebilir)
const COUNTRIES = [
  { name: "United States", codeIso2: "US", codeIso3: "USA", phoneCode: "+1", flagEmoji: "🇺🇸" },
  { name: "United Kingdom", codeIso2: "GB", codeIso3: "GBR", phoneCode: "+44", flagEmoji: "🇬🇧" },
  { name: "Germany", codeIso2: "DE", codeIso3: "DEU", phoneCode: "+49", flagEmoji: "🇩🇪" },
  { name: "France", codeIso2: "FR", codeIso3: "FRA", phoneCode: "+33", flagEmoji: "🇫🇷" },
  { name: "Italy", codeIso2: "IT", codeIso3: "ITA", phoneCode: "+39", flagEmoji: "🇮🇹" },
  { name: "Spain", codeIso2: "ES", codeIso3: "ESP", phoneCode: "+34", flagEmoji: "🇪🇸" },
  { name: "Netherlands", codeIso2: "NL", codeIso3: "NLD", phoneCode: "+31", flagEmoji: "🇳🇱" },
  { name: "Belgium", codeIso2: "BE", codeIso3: "BEL", phoneCode: "+32", flagEmoji: "🇧🇪" },
  { name: "Sweden", codeIso2: "SE", codeIso3: "SWE", phoneCode: "+46", flagEmoji: "🇸🇪" },
  { name: "Norway", codeIso2: "NO", codeIso3: "NOR", phoneCode: "+47", flagEmoji: "🇳🇴" },
  { name: "Denmark", codeIso2: "DK", codeIso3: "DNK", phoneCode: "+45", flagEmoji: "🇩🇰" },
  { name: "Finland", codeIso2: "FI", codeIso3: "FIN", phoneCode: "+358", flagEmoji: "🇫🇮" },
  { name: "Poland", codeIso2: "PL", codeIso3: "POL", phoneCode: "+48", flagEmoji: "🇵🇱" },
  { name: "Czech Republic", codeIso2: "CZ", codeIso3: "CZE", phoneCode: "+420", flagEmoji: "🇨🇿" },
  { name: "Hungary", codeIso2: "HU", codeIso3: "HUN", phoneCode: "+36", flagEmoji: "🇭🇺" },
  { name: "Romania", codeIso2: "RO", codeIso3: "ROU", phoneCode: "+40", flagEmoji: "🇷🇴" },
  { name: "Turkey", codeIso2: "TR", codeIso3: "TUR", phoneCode: "+90", flagEmoji: "🇹🇷" },
  { name: "Russia", codeIso2: "RU", codeIso3: "RUS", phoneCode: "+7", flagEmoji: "🇷🇺" },
  { name: "Ukraine", codeIso2: "UA", codeIso3: "UKR", phoneCode: "+380", flagEmoji: "🇺🇦" },
  { name: "Switzerland", codeIso2: "CH", codeIso3: "CHE", phoneCode: "+41", flagEmoji: "🇨🇭" },
  { name: "Austria", codeIso2: "AT", codeIso3: "AUT", phoneCode: "+43", flagEmoji: "🇦🇹" },
  { name: "Portugal", codeIso2: "PT", codeIso3: "PRT", phoneCode: "+351", flagEmoji: "🇵🇹" },
  { name: "Greece", codeIso2: "GR", codeIso3: "GRC", phoneCode: "+30", flagEmoji: "🇬🇷" },
  { name: "Canada", codeIso2: "CA", codeIso3: "CAN", phoneCode: "+1", flagEmoji: "🇨🇦" },
  { name: "Australia", codeIso2: "AU", codeIso3: "AUS", phoneCode: "+61", flagEmoji: "🇦🇺" },
  { name: "New Zealand", codeIso2: "NZ", codeIso3: "NZL", phoneCode: "+64", flagEmoji: "🇳🇿" },
  { name: "Japan", codeIso2: "JP", codeIso3: "JPN", phoneCode: "+81", flagEmoji: "🇯🇵" },
  { name: "South Korea", codeIso2: "KR", codeIso3: "KOR", phoneCode: "+82", flagEmoji: "🇰🇷" },
  { name: "China", codeIso2: "CN", codeIso3: "CHN", phoneCode: "+86", flagEmoji: "🇨🇳" },
  { name: "India", codeIso2: "IN", codeIso3: "IND", phoneCode: "+91", flagEmoji: "🇮🇳" },
  { name: "Singapore", codeIso2: "SG", codeIso3: "SGP", phoneCode: "+65", flagEmoji: "🇸🇬" },
  { name: "Hong Kong", codeIso2: "HK", codeIso3: "HKG", phoneCode: "+852", flagEmoji: "🇭🇰" },
  { name: "United Arab Emirates", codeIso2: "AE", codeIso3: "ARE", phoneCode: "+971", flagEmoji: "🇦🇪" },
  { name: "Saudi Arabia", codeIso2: "SA", codeIso3: "SAU", phoneCode: "+966", flagEmoji: "🇸🇦" },
  { name: "Israel", codeIso2: "IL", codeIso3: "ISR", phoneCode: "+972", flagEmoji: "🇮🇱" },
  { name: "Brazil", codeIso2: "BR", codeIso3: "BRA", phoneCode: "+55", flagEmoji: "🇧🇷" },
  { name: "Mexico", codeIso2: "MX", codeIso3: "MEX", phoneCode: "+52", flagEmoji: "🇲🇽" },
  { name: "Argentina", codeIso2: "AR", codeIso3: "ARG", phoneCode: "+54", flagEmoji: "🇦🇷" },
  { name: "Colombia", codeIso2: "CO", codeIso3: "COL", phoneCode: "+57", flagEmoji: "🇨🇴" },
  { name: "Chile", codeIso2: "CL", codeIso3: "CHL", phoneCode: "+56", flagEmoji: "🇨🇱" },
  { name: "South Africa", codeIso2: "ZA", codeIso3: "ZAF", phoneCode: "+27", flagEmoji: "🇿🇦" },
  { name: "Nigeria", codeIso2: "NG", codeIso3: "NGA", phoneCode: "+234", flagEmoji: "🇳🇬" },
  { name: "Egypt", codeIso2: "EG", codeIso3: "EGY", phoneCode: "+20", flagEmoji: "🇪🇬" },
];

// Rol ve yetkiler
const ROLES = [
  { name: "SUPER_ADMIN" },
  { name: "ADMIN" },
  { name: "EDITOR" },
  { name: "VIEWER" },
];

const PERMISSIONS = [
  { resource: "products", action: "create" },
  { resource: "products", action: "read" },
  { resource: "products", action: "update" },
  { resource: "products", action: "delete" },
  { resource: "orders", action: "read" },
  { resource: "orders", action: "update" },
  { resource: "orders", action: "delete" },
  { resource: "customers", action: "read" },
  { resource: "customers", action: "update" },
  { resource: "customers", action: "delete" },
  { resource: "markets", action: "create" },
  { resource: "markets", action: "read" },
  { resource: "markets", action: "update" },
  { resource: "markets", action: "delete" },
  { resource: "countries", action: "read" },
  { resource: "countries", action: "update" },
  { resource: "currencies", action: "read" },
  { resource: "currencies", action: "update" },
  { resource: "shipping", action: "create" },
  { resource: "shipping", action: "read" },
  { resource: "shipping", action: "update" },
  { resource: "shipping", action: "delete" },
  { resource: "taxes", action: "create" },
  { resource: "taxes", action: "read" },
  { resource: "taxes", action: "update" },
  { resource: "taxes", action: "delete" },
  { resource: "payments", action: "read" },
  { resource: "payments", action: "update" },
  { resource: "discounts", action: "create" },
  { resource: "discounts", action: "read" },
  { resource: "discounts", action: "update" },
  { resource: "discounts", action: "delete" },
  { resource: "staff", action: "create" },
  { resource: "staff", action: "read" },
  { resource: "staff", action: "update" },
  { resource: "staff", action: "delete" },
  { resource: "settings", action: "read" },
  { resource: "settings", action: "update" },
];

async function main() {
  console.log("🌱 Seed başlıyor...");

  // Para birimleri
  for (const currency of CURRENCIES) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
  }
  console.log(`✅ ${CURRENCIES.length} para birimi yüklendi`);

  // Ülkeler
  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { codeIso2: country.codeIso2 },
      update: {},
      create: country,
    });
  }
  console.log(`✅ ${COUNTRIES.length} ülke yüklendi`);

  // Roller
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log(`✅ ${ROLES.length} rol yüklendi`);

  // Yetkiler
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
  }
  console.log(`✅ ${PERMISSIONS.length} yetki yüklendi`);

  // SUPER_ADMIN rolüne tüm yetkiler
  const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  const allPermissions = await prisma.permission.findMany();
  if (superAdminRole) {
    for (const perm of allPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: perm.id },
      });
    }
    console.log(`✅ SUPER_ADMIN rolüne ${allPermissions.length} yetki atandı`);
  }

  // Varsayılan admin kullanıcı
  const existingAdmin = await prisma.staffUser.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!existingAdmin && superAdminRole) {
    const passwordHash = await hash("Admin123456!", 12);
    await prisma.staffUser.create({
      data: {
        email: "admin@example.com",
        passwordHash,
        firstName: "Admin",
        lastName: "User",
        roleId: superAdminRole.id,
        active: true,
      },
    });
    console.log("✅ Varsayılan admin kullanıcı oluşturuldu: admin@example.com / Admin123456!");
    console.log("⚠️  Lütfen giriş yaptıktan sonra şifreyi değiştirin.");
  }

  // Varsayılan ayarlar
  await prisma.setting.upsert({
    where: { key: "store_name" },
    update: {},
    create: { key: "store_name", value: "My Store", group: "general" },
  });

  await prisma.setting.upsert({
    where: { key: "default_market_fallback" },
    update: {},
    create: { key: "default_market_fallback", value: "BLOCK", group: "pricing" },
  });

  console.log("✅ Varsayılan ayarlar yüklendi");

  // Ödeme sağlayıcıları
  const PAYMENT_PROVIDERS = [
    {
      name: "Stripe",
      code: "stripe",
      active: false,
      settingsSchema: {
        fields: [
          { key: "publishableKey", label: "Publishable Key", type: "text", envOverride: "STRIPE_PUBLISHABLE_KEY" },
          { key: "secretKey",      label: "Secret Key",      type: "password", envOverride: "STRIPE_SECRET_KEY" },
          { key: "webhookSecret",  label: "Webhook Secret",  type: "password", envOverride: "STRIPE_WEBHOOK_SECRET" },
        ],
      },
    },
    {
      name: "iyzico",
      code: "iyzico",
      active: false,
      settingsSchema: {
        fields: [
          { key: "apiKey",    label: "API Key",    type: "text",     envOverride: "IYZICO_API_KEY" },
          { key: "secretKey", label: "Secret Key", type: "password", envOverride: "IYZICO_SECRET_KEY" },
          { key: "baseUrl",   label: "Base URL",   type: "text",     envOverride: "IYZICO_BASE_URL", default: "https://sandbox-api.iyzipay.com" },
        ],
      },
    },
    {
      name: "PayPal",
      code: "paypal",
      active: false,
      settingsSchema: {
        fields: [
          { key: "clientId",     label: "Client ID",     type: "text",     envOverride: "PAYPAL_CLIENT_ID" },
          { key: "clientSecret", label: "Client Secret", type: "password", envOverride: "PAYPAL_CLIENT_SECRET" },
          { key: "webhookId",    label: "Webhook ID",    type: "text",     envOverride: "PAYPAL_WEBHOOK_ID" },
          { key: "sandbox",      label: "Sandbox Mode",  type: "boolean",  envOverride: "PAYPAL_SANDBOX", default: "true" },
        ],
      },
    },
  ];

  for (const provider of PAYMENT_PROVIDERS) {
    await prisma.paymentProvider.upsert({
      where: { code: provider.code },
      update: {},
      create: provider as Parameters<typeof prisma.paymentProvider.create>[0]["data"],
    });
  }
  console.log(`✅ ${PAYMENT_PROVIDERS.length} ödeme sağlayıcısı yüklendi`);

  console.log("🎉 Seed tamamlandı");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
