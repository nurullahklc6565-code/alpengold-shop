"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Folder, Layers, Warehouse,
  ShoppingCart, Users, Tag, Ticket, Globe, Map,
  DollarSign, BadgeDollarSign, Truck, Receipt,
  CreditCard, ImageIcon, Settings, UserCog, ShieldCheck,
  Activity, Zap, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { hasPermission } from "@/lib/auth-helpers";
import type { StaffSession } from "@/lib/auth-helpers";

/* ─── Nav yapısı ────────────────────────────────────────────────────────── */

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: { resource: string; action: string };
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Genel",
    items: [
      { label: "Gösterge Paneli", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Katalog",
    items: [
      { label: "Ürünler",       href: "/admin/products",   icon: Package,   permission: { resource: "products",  action: "read" } },
      { label: "Kategoriler",   href: "/admin/categories", icon: Folder,    permission: { resource: "products",  action: "read" } },
      { label: "Koleksiyonlar", href: "/admin/collections",icon: Layers,    permission: { resource: "products",  action: "read" } },
      { label: "Stok",          href: "/admin/stock",      icon: Warehouse, permission: { resource: "products",  action: "read" } },
    ],
  },
  {
    label: "Satışlar",
    items: [
      { label: "Siparişler", href: "/admin/orders",    icon: ShoppingCart, permission: { resource: "orders",    action: "read" } },
      { label: "Müşteriler", href: "/admin/customers", icon: Users,        permission: { resource: "customers", action: "read" } },
    ],
  },
  {
    label: "Pazarlama",
    items: [
      { label: "İndirimler", href: "/admin/discounts", icon: Tag,    permission: { resource: "discounts", action: "read" } },
      { label: "Kuponlar",   href: "/admin/coupons",   icon: Ticket, permission: { resource: "discounts", action: "read" } },
    ],
  },
  {
    label: "Pazarlar & Fiyatlar",
    items: [
      { label: "Pazarlar",      href: "/admin/markets",    icon: Globe,           permission: { resource: "markets",    action: "read" } },
      { label: "Ülkeler",       href: "/admin/countries",  icon: Map,             permission: { resource: "countries",  action: "read" } },
      { label: "Para Birimleri",href: "/admin/currencies", icon: DollarSign,      permission: { resource: "currencies", action: "read" } },
      { label: "Pazar Fiyatları",href: "/admin/pricing",   icon: BadgeDollarSign, permission: { resource: "markets",    action: "read" } },
    ],
  },
  {
    label: "Kargo & Vergi",
    items: [
      { label: "Kargo Kuralları", href: "/admin/shipping", icon: Truck,   permission: { resource: "shipping", action: "read" } },
      { label: "Vergi Kuralları", href: "/admin/taxes",    icon: Receipt, permission: { resource: "taxes",    action: "read" } },
    ],
  },
  {
    label: "Ödeme & Medya",
    items: [
      { label: "Ödeme Sağlayıcıları", href: "/admin/payments", icon: CreditCard, permission: { resource: "payments", action: "read" } },
      { label: "Medya",               href: "/admin/media",    icon: ImageIcon },
    ],
  },
  {
    label: "Sistem",
    items: [
      { label: "Site Ayarları", href: "/admin/settings", icon: Settings,    permission: { resource: "settings", action: "read" } },
      { label: "Personel",      href: "/admin/staff",    icon: UserCog,     permission: { resource: "staff",    action: "read" } },
      { label: "Roller",        href: "/admin/roles",    icon: ShieldCheck, permission: { resource: "staff",    action: "read" } },
      { label: "Aktivite",      href: "/admin/activity", icon: Activity,    permission: { resource: "staff",    action: "read" } },
    ],
  },
];

/* ─── Bileşen ───────────────────────────────────────────────────────────── */

export function AdminSidebar({ user }: { user: StaffSession }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col bg-white border-r border-zinc-100">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-zinc-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-zinc-900 truncate">
          Yönetim Paneli
        </span>
      </div>

      {/* Navigasyon */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.permission || hasPermission(user, item.permission.resource, item.permission.action)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5",
                          "text-[13px] font-medium transition-all duration-150",
                          active
                            ? "bg-zinc-950 text-white"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[15px] w-[15px] shrink-0 transition-colors",
                            active ? "text-white" : "text-zinc-400 group-hover:text-zinc-600"
                          )}
                        />
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                            active ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-600"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Kullanıcı */}
      <div className="border-t border-zinc-100 p-3">
        <Link
          href="/admin/staff"
          className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-zinc-50 transition-colors group"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-zinc-900">{user.name}</p>
            <p className="truncate text-[10px] text-zinc-400">{user.role}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-500 shrink-0 transition-colors" />
        </Link>
      </div>
    </aside>
  );
}
