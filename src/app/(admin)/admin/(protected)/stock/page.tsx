import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { stockMovementService } from "@/server/services/stock-movement.service";
import { StockAdjustButton } from "@/components/admin/products/StockAdjustButton";
import type { ProductStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Stok Yönetimi" };

const DURUM_ETIKET: Record<string, string> = {
  ACTIVE: "Aktif", DRAFT: "Taslak", ARCHIVED: "Arşiv",
};

const HAREKET_ETIKET: Record<string, string> = {
  PURCHASE: "Alım", SALE: "Satış", RETURN: "İade",
  ADJUSTMENT: "Düzeltme", RESERVATION: "Rezervasyon", RELEASE: "İptal",
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; low?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireAuth();

  // Ürün/varyant stok listesi
  const productWhere = {
    ...(sp.status && { status: sp.status as ProductStatus }),
    ...(sp.search && {
      OR: [
        { name: { contains: sp.search, mode: "insensitive" as const } },
        { variants: { some: { sku: { contains: sp.search, mode: "insensitive" as const } } } },
      ],
    }),
  };

  const [products, movements, stats] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      orderBy: { name: "asc" },
      take: 50,
      include: {
        category: { select: { name: true } },
        variants: {
          where: { active: true },
          include: { inventory: true },
          orderBy: { sku: "asc" },
        },
      },
    }),
    stockMovementService.listAll({ page: 1, perPage: 20 }),
    prisma.inventoryItem.aggregate({
      _sum: { quantity: true, reserved: true },
      _count: { _all: true },
    }),
  ]);

  // Düşük stoklu varyantlar
  const lowStockItems = await prisma.inventoryItem.findMany({
    where: {
      trackQuantity: true,
    },
    include: {
      variant: {
        include: { product: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { quantity: "asc" },
    take: 20,
  }).then((items) =>
    items.filter((item) => {
      const avail = item.quantity - item.reserved;
      const threshold = item.lowStockThreshold ?? 5;
      return avail <= threshold;
    })
  );

  const totalStock = stats._sum.quantity ?? 0;
  const totalReserved = stats._sum.reserved ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stok Yönetimi"
        description="Tüm varyantların stok durumu, hareketleri ve düşük stok uyarıları"
      />

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Toplam Stok</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalStock.toLocaleString("tr-TR")}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Rezerve</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{totalReserved.toLocaleString("tr-TR")}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Mevcut</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{(totalStock - totalReserved).toLocaleString("tr-TR")}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-amber-600">Düşük Stok</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-700">{lowStockItems.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol: Ürün/varyant stok listesi */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtreler */}
          <div className="flex flex-wrap gap-2">
            <form className="flex gap-2">
              <input name="search" defaultValue={sp.search} placeholder="Ürün adı veya SKU…"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              {["", "ACTIVE", "DRAFT", "ARCHIVED"].map((s) => (
                <Link key={s} href={`/admin/stock?status=${s}${sp.search ? `&search=${sp.search}` : ""}`}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${(sp.status ?? "") === s ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {s ? (DURUM_ETIKET[s] ?? s) : "Tümü"}
                </Link>
              ))}
            </form>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Ürün / SKU</th>
                  <th className="px-4 py-3 text-left">Stok</th>
                  <th className="px-4 py-3 text-left">Rezerve</th>
                  <th className="px-4 py-3 text-left">Mevcut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-sm text-gray-400">Ürün bulunamadı.</td></tr>
                ) : products.flatMap((product) =>
                  product.variants.map((variant, vi) => {
                    const inv = variant.inventory;
                    const available = inv ? inv.quantity - inv.reserved : null;
                    const threshold = inv?.lowStockThreshold ?? 5;
                    const isLow = inv?.trackQuantity && available !== null && available <= threshold;
                    const isOut = inv?.trackQuantity && available !== null && available <= 0;
                    return (
                      <tr key={variant.id} className={`hover:bg-gray-50 ${isOut ? "bg-red-50" : isLow ? "bg-amber-50" : ""}`}>
                        <td className="px-4 py-3">
                          {vi === 0 && (
                            <p className="font-medium text-gray-900 text-xs">{product.name}</p>
                          )}
                          <p className="font-mono text-xs text-gray-500">{variant.sku}</p>
                          {Object.entries(variant.options as Record<string, string>).map(([k, v]) => (
                            <span key={k} className="mr-1 text-xs text-gray-400">{k}: {v}</span>
                          ))}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {inv?.trackQuantity ? inv.quantity : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-amber-600">
                          {inv?.trackQuantity ? inv.reserved : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {inv?.trackQuantity && available !== null ? (
                            <span className={`font-semibold tabular-nums ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-green-700"}`}>
                              {available}
                              {isLow && !isOut && <AlertTriangle className="ml-1 inline h-3 w-3" />}
                            </span>
                          ) : <span className="text-gray-400">Sınırsız</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inv?.trackQuantity ? (
                            <StockAdjustButton
                              productId={product.id}
                              variantId={variant.id}
                              currentStock={inv.quantity}
                              staffId={user.id}
                            />
                          ) : (
                            <Link href={`/admin/products/${product.id}`}
                              className="text-xs text-gray-400 hover:text-gray-700">Düzenle</Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sağ: Son stok hareketleri */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Son Stok Hareketleri</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {movements.data.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">Henüz stok hareketi yok.</p>
              ) : movements.data.map((mv) => (
                <div key={mv.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {mv.quantity > 0
                        ? <TrendingUp className="h-4 w-4 text-green-500" />
                        : <TrendingDown className="h-4 w-4 text-red-400" />}
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          {mv.variant.product.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{mv.variant.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${mv.quantity > 0 ? "text-green-700" : "text-red-600"}`}>
                        {mv.quantity > 0 ? "+" : ""}{mv.quantity}
                      </p>
                      <p className="text-xs text-gray-400">{mv.before} → {mv.after}</p>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                    <span>{HAREKET_ETIKET[mv.type] ?? mv.type}</span>
                    <span>{new Date(mv.createdAt).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
