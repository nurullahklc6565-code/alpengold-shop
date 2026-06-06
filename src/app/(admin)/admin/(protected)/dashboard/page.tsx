import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingCart, Users, Package, TrendingUp,
  AlertTriangle, CheckCircle, Plus, ArrowRight,
  Warehouse, CreditCard,
} from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import { Badge, OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { orderService } from "@/server/services/order.service";
import { formatPrice } from "@/lib/utils/pricing";

export const metadata: Metadata = { title: "Gösterge Paneli" };

/* ─── KPI Kartı ─────────────────────────────────────────────────────────── */

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  href,
  color = "default",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; label: string };
  href?: string;
  color?: "default" | "success" | "warning" | "danger" | "indigo";
}) {
  const iconColors = {
    default: "bg-zinc-100 text-zinc-500",
    success: "bg-green-100 text-green-600",
    warning: "bg-amber-100 text-amber-600",
    danger:  "bg-red-100 text-red-600",
    indigo:  "bg-indigo-100 text-indigo-600",
  };

  const content = (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-zinc-900 tabular-nums">{value}</p>
            {subtitle && (
              <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zinc-50">
            <span className={`text-xs font-medium ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-zinc-400">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

/* ─── Sayfa ─────────────────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const [user, stats] = await Promise.all([
    requireAuth(),
    orderService.getStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Karşılama */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Hoş geldiniz, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Package className="h-4 w-4" />}
          >
            <Link href="/admin/products/new">Yeni Ürün</Link>
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="Toplam Sipariş"
          value={stats.totalOrders}
          subtitle="Tüm zamanlar"
          icon={ShoppingCart}
          href="/admin/orders"
        />
        <KPICard
          title="Ödeme Bekleyen"
          value={stats.pendingOrders}
          subtitle={stats.pendingOrders > 0 ? "Aksiyon gerekiyor" : "Bekleyen yok"}
          icon={CreditCard}
          color={stats.pendingOrders > 0 ? "warning" : "success"}
          href="/admin/orders?payment=UNPAID"
        />
        <KPICard
          title="Toplam Müşteri"
          value={stats.totalCustomers}
          subtitle="Kayıtlı hesaplar"
          icon={Users}
          color="indigo"
          href="/admin/customers"
        />
        <KPICard
          title="Aktif Ürün"
          value={stats.activeProducts}
          subtitle="Yayındaki ürünler"
          icon={Package}
          color="success"
          href="/admin/products?status=ACTIVE"
        />
      </div>

      {/* Gelir */}
      {stats.revenueByCurrency.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <CardTitle>Onaylı Gelir</CardTitle>
            </div>
            <CardDescription>Para birimi bazında — kur çevirisi yapılmaz</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-4">
              {stats.revenueByCurrency.map((r) => r.code && (
                <div key={r.id} className="rounded-xl bg-green-50 border border-green-100 px-5 py-3.5">
                  <p className="text-xs font-medium text-green-600 mb-0.5">{r.code}</p>
                  <p className="text-2xl font-bold text-green-800 tabular-nums">
                    {formatPrice(r.total, { code: r.code, symbol: r.symbol!, decimalDigits: r.decimalDigits! })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alt Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Son Siparişler */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              actions={
                <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  Tümü <ArrowRight className="h-3 w-3" />
                </Link>
              }
            >
              <CardTitle>Son Siparişler</CardTitle>
            </CardHeader>
            {stats.recentOrders.length === 0 ? (
              <CardContent>
                <EmptyState
                  icon={<ShoppingCart className="h-full w-full" />}
                  title="Henüz sipariş yok"
                  description="Siparişler burada görünecek"
                  size="sm"
                />
              </CardContent>
            ) : (
              <div className="divide-y divide-zinc-50">
                {stats.recentOrders.map((order) => {
                  const cur = { code: order.currency.code, symbol: order.currency.symbol, decimalDigits: order.currency.decimalDigits };
                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900 font-mono">{order.number}</span>
                          <span className="text-xs text-zinc-400">{order.market.name}</span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {order.customer.firstName} {order.customer.lastName} · {order.customer.email}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                          {formatPrice(Number(order.totalPrice), cur)}
                        </span>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sağ kolon */}
        <div className="space-y-5">
          {/* Düşük Stok */}
          <Card>
            <CardHeader
              actions={
                <Link href="/admin/stock" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  Stok <ArrowRight className="h-3 w-3" />
                </Link>
              }
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <CardTitle>Düşük Stok</CardTitle>
                {stats.lowStockItems.length > 0 && (
                  <Badge variant="warning" size="xs">{stats.lowStockItems.length}</Badge>
                )}
              </div>
            </CardHeader>
            {stats.lowStockItems.length === 0 ? (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2.5 rounded-lg bg-green-50 px-3.5 py-3">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <p className="text-xs text-green-700 font-medium">Tüm stoklar normal</p>
                </div>
              </CardContent>
            ) : (
              <div className="divide-y divide-zinc-50">
                {stats.lowStockItems.slice(0, 6).map((item) => {
                  const avail = item.quantity - item.reserved;
                  const isOut = avail <= 0;
                  return (
                    <Link
                      key={item.variantId}
                      href={`/admin/products/${item.variant.product.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors group"
                    >
                      <div className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                        isOut ? "bg-red-100" : "bg-amber-100"
                      )}>
                        <Warehouse className={cn("h-3 w-3", isOut ? "text-red-500" : "text-amber-500")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-800 truncate">{item.variant.product.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{item.variant.sku}</p>
                      </div>
                      <Badge variant={isOut ? "danger" : "warning"} size="xs">
                        {isOut ? "Tükendi" : `${avail} adet`}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Hızlı Aksiyonlar */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { href: "/admin/products/new",    icon: Package,      label: "Yeni Ürün Ekle" },
                { href: "/admin/orders",           icon: ShoppingCart, label: "Siparişleri Görüntüle" },
                { href: "/admin/markets",          icon: TrendingUp,   label: "Pazar Yönet" },
                { href: "/admin/discounts/new",    icon: Package,      label: "İndirim Oluştur" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 hover:bg-zinc-50 transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 shrink-0" />
                    <span className="text-sm text-zinc-600 group-hover:text-zinc-900">{action.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-400 ml-auto shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper import
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
