import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import { ProductStatusBadge } from "@/components/admin/ui/ProductStatusBadge";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { ProductInfoForm } from "@/components/admin/products/ProductInfoForm";
import { VariantManager } from "@/components/admin/products/VariantManager";
import { PricingGrid } from "@/components/admin/products/PricingGrid";
import { InventoryPanel } from "@/components/admin/products/InventoryPanel";
import { ProductImagesManager } from "@/components/admin/products/ProductImagesManager";
import { ProductAdminTabs } from "@/components/admin/products/ProductAdminTabs";
import { productService } from "@/server/services/product.service";
import { categoryService } from "@/server/services/category.service";
import { marketService } from "@/server/services/market.service";
import { deleteProductAction, updateProductAction } from "@/server/actions/admin/product";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ürün Düzenle" };

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [user, product, categories, markets] = await Promise.all([
    requireAuth(),
    productService.get(id),
    categoryService.listFlat(),
    marketService.list(),
  ]);
  if (!product) return notFound();

  const deleteAction = deleteProductAction.bind(null, id);

  const activeMarkets = markets.filter((m) => m.active).map((m) => ({
    id: m.id,
    name: m.name,
    defaultCurrency: m.defaultCurrency,
  }));

  const variantsForPricing = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    options: v.options as Record<string, string>,
    basePrice: Number(v.basePrice),
    prices: v.prices.map((p) => ({
      marketId: p.marketId,
      currencyId: p.currencyId,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    })),
  }));

  const variantsForInventory = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    options: v.options as Record<string, string>,
    inventory: v.inventory
      ? { quantity: v.inventory.quantity, reserved: v.inventory.reserved, trackQuantity: v.inventory.trackQuantity }
      : null,
  }));

  const variantsForManager = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    options: v.options as Record<string, string>,
    basePrice: Number(v.basePrice),
    weight: v.weight ? Number(v.weight) : null,
    active: v.active,
    inventory: v.inventory
      ? { quantity: v.inventory.quantity, reserved: v.inventory.reserved, trackQuantity: v.inventory.trackQuantity }
      : null,
  }));

  // Aktivite logu (ürünle ilgili)
  const activityLogs = await prisma.activityLog.findMany({
    where: { resource: "products", resourceId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { staff: { select: { email: true, firstName: true, lastName: true } } },
  });

  const tabs = [
    { id: "info", label: "Bilgiler" },
    { id: "images", label: "Görseller", count: product.images.length },
    { id: "variants", label: "Varyantlar", count: product.variants.length },
    { id: "pricing", label: "Pazar Fiyatları" },
    { id: "inventory", label: "Stok" },
    { id: "seo", label: "SEO" },
    { id: "activity", label: "Aktivite" },
  ];

  return (
    <div>
      {/* Başlık */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
              <ProductStatusBadge status={product.status} />
            </div>
            <p className="mt-0.5 text-xs text-gray-400">
              {product.variants.length} varyant ·{" "}
              {product.images.length} görsel ·{" "}
              {product.variants.reduce((n, v) => n + v.prices.length, 0)} pazar fiyatı
              {product.vendor ? ` · ${product.vendor}` : ""}
            </p>
          </div>
        </div>
        <DeleteButton
          onDelete={deleteAction}
          confirmMessage={`"${product.name}" ürününü silmek istediğinizden emin misiniz?`}
        />
      </div>

      {/* Tab'lı yapı */}
      <ProductAdminTabs tabs={tabs}>
        {/* Tab 1: Bilgiler */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard title="Ürün Bilgileri">
              <ProductInfoForm product={product} categories={categories} />
            </SectionCard>
          </div>
          <div className="space-y-4">
            <SectionCard title="Özet">
              <dl className="space-y-2 text-sm">
                {[
                  ["Varyant", product.variants.length],
                  ["Görsel", product.images.length],
                  ["Koleksiyon", product.productCollections.length],
                  ["Pazar fiyatı", product.variants.reduce((n, v) => n + v.prices.length, 0)],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium">{val}</dd>
                  </div>
                ))}
                {product.vendor && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Marka</dt>
                    <dd className="font-medium">{product.vendor}</dd>
                  </div>
                )}
                {product.tags.length > 0 && (
                  <div>
                    <dt className="text-gray-500 mb-1">Etiketler</dt>
                    <dd className="flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </SectionCard>
          </div>
        </div>

        {/* Tab 2: Görseller */}
        <SectionCard title="Ürün Görselleri"
          description="İlk görsel ana görsel olur. 'Ana Yap' ile değiştirebilirsiniz. Görsel URL'si girmeniz yeterlidir.">
          <ProductImagesManager productId={product.id} images={product.images} />
        </SectionCard>

        {/* Tab 3: Varyantlar */}
        <SectionCard title="Varyantlar"
          description="Her varyant ayrı SKU, fiyat ve stok bilgisine sahiptir. Seçenekler 'Renk:Kırmızı,Beden:M' formatında girilir.">
          <VariantManager productId={product.id} variants={variantsForManager} />
        </SectionCard>

        {/* Tab 4: Pazar Fiyatları */}
        <SectionCard title="Pazar Bazlı Fiyatlar"
          description="Her varyant için her pazarda ayrı fiyat girebilirsiniz. Fiyat girilmezse pazar fallback kuralı uygulanır. Hücreyi doldurup odak kaybettiğinde otomatik kaydedilir.">
          <PricingGrid productId={product.id} variants={variantsForPricing} markets={activeMarkets} />
        </SectionCard>

        {/* Tab 5: Stok */}
        <SectionCard title="Stok Yönetimi"
          description="Varyant bazlı stok takibi. Rezerve edilen miktar siparişlerden otomatik hesaplanır.">
          <InventoryPanel productId={product.id} variants={variantsForInventory} />
        </SectionCard>

        {/* Tab 6: SEO */}
        <div className="max-w-lg">
          <SectionCard title="SEO Ayarları">
            <form action={async (formData: FormData) => {
              "use server";
              await updateProductAction(id, {} as never, formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input name="slug" defaultValue={product.slug}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900" />
                <p className="mt-1 text-xs text-gray-400">
                  /products/{product.slug}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Başlığı</label>
                <input name="seoTitle" defaultValue={product.seoTitle ?? ""}
                  placeholder={product.name}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                <p className="mt-1 text-xs text-gray-400">Boş ise ürün adı kullanılır</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Açıklaması</label>
                <textarea name="seoDescription" rows={3} defaultValue={product.seoDescription ?? ""}
                  placeholder="Arama sonuçlarında görünecek açıklama (max 160 karakter)"
                  maxLength={160}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <button type="submit"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                SEO Kaydet
              </button>
            </form>
          </SectionCard>
        </div>

        {/* Tab 7: Aktivite */}
        <SectionCard title="Aktivite Geçmişi">
          {activityLogs.length === 0 ? (
            <p className="text-sm text-gray-400">Bu ürün için henüz aktivite kaydı yok.</p>
          ) : (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.staff.firstName} {log.staff.lastName}</span>
                      {" — "}<span className="font-mono text-xs text-gray-600">{log.action}</span>
                    </p>
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("tr-TR")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </ProductAdminTabs>
    </div>
  );
}
