export type NavItem = {
  label: string;
  href: string;
  icon: string;
  permission?: { resource: string; action: string };
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    label: "Genel",
    items: [
      { label: "Gösterge Paneli", href: "/admin/dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    label: "Katalog",
    items: [
      { label: "Ürünler", href: "/admin/products", icon: "Package", permission: { resource: "products", action: "read" } },
      { label: "Kategoriler", href: "/admin/categories", icon: "Folder", permission: { resource: "products", action: "read" } },
      { label: "Koleksiyonlar", href: "/admin/collections", icon: "Layers", permission: { resource: "products", action: "read" } },
      { label: "Stok Yönetimi", href: "/admin/stock", icon: "Warehouse", permission: { resource: "products", action: "read" } },
    ],
  },
  {
    label: "Satışlar",
    items: [
      { label: "Siparişler", href: "/admin/orders", icon: "ShoppingCart", permission: { resource: "orders", action: "read" } },
      { label: "Müşteriler", href: "/admin/customers", icon: "Users", permission: { resource: "customers", action: "read" } },
    ],
  },
  {
    label: "Pazarlama",
    items: [
      { label: "İndirimler", href: "/admin/discounts", icon: "Tag", permission: { resource: "discounts", action: "read" } },
      { label: "Kuponlar", href: "/admin/coupons", icon: "Ticket", permission: { resource: "discounts", action: "read" } },
    ],
  },
  {
    label: "Pazarlar & Fiyatlar",
    items: [
      { label: "Pazarlar", href: "/admin/markets", icon: "Globe", permission: { resource: "markets", action: "read" } },
      { label: "Ülkeler", href: "/admin/countries", icon: "Map", permission: { resource: "countries", action: "read" } },
      { label: "Para Birimleri", href: "/admin/currencies", icon: "DollarSign", permission: { resource: "currencies", action: "read" } },
      { label: "Pazar Fiyatları", href: "/admin/pricing", icon: "BadgeDollarSign", permission: { resource: "markets", action: "read" } },
    ],
  },
  {
    label: "Kargo & Vergi",
    items: [
      { label: "Kargo Kuralları", href: "/admin/shipping", icon: "Truck", permission: { resource: "shipping", action: "read" } },
      { label: "Vergi Kuralları", href: "/admin/taxes", icon: "Receipt", permission: { resource: "taxes", action: "read" } },
    ],
  },
  {
    label: "Ödeme",
    items: [
      { label: "Ödeme Sağlayıcıları", href: "/admin/payments", icon: "CreditCard", permission: { resource: "payments", action: "read" } },
    ],
  },
  {
    label: "İçerik",
    items: [
      { label: "Medya", href: "/admin/media", icon: "Image" },
      { label: "Site Ayarları", href: "/admin/settings", icon: "Settings", permission: { resource: "settings", action: "read" } },
    ],
  },
  {
    label: "Sistem",
    items: [
      { label: "Personel", href: "/admin/staff", icon: "UserCog", permission: { resource: "staff", action: "read" } },
      { label: "Roller", href: "/admin/roles", icon: "ShieldCheck", permission: { resource: "staff", action: "read" } },
      { label: "Aktivite", href: "/admin/activity", icon: "Activity", permission: { resource: "staff", action: "read" } },
    ],
  },
];
