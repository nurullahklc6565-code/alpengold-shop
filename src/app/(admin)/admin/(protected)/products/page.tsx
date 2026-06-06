import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ProductStatusBadge } from "@/components/admin/ui/ProductStatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { productService } from "@/server/services/product.service";
import type { ProductStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Ürünler" };

const STATUS_OPTS: { value: string; label: string }[] = [
  { value: "", label: "Tümü" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "DRAFT", label: "Taslak" },
  { value: "ARCHIVED", label: "Arşiv" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = (sp.status as ProductStatus) || undefined;
  const search = sp.search || undefined;
  const page = parseInt(sp.page ?? "1");

  const { data: products, total, totalPages } = await productService.list({ status, search, page });

  return (
    <div>
      <PageHeader
        title="Ürünler"
        description={`${total} ürün`}
        actions={
          <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Yeni Ürün
          </Link>
        }
      />

      {/* Filtreler */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form className="flex items-center gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="Ürün adı veya SKU ara…"
            className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          {STATUS_OPTS.map((o) => (
            <Link
              key={o.value}
              href={`/admin/products?status=${o.value}${search ? `&search=${search}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${status === o.value || (!status && !o.value) ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {o.label}
            </Link>
          ))}
        </form>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Ürün bulunamadı"
          description={search ? "Arama kriterini değiştirin." : "İlk ürününüzü oluşturun."}
          action={!search ? <Link href="/admin/products/new" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Yeni Ürün</Link> : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Ürün</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Varyant</th>
                <th className="px-4 py-3 text-left">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.category?.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-600">{p._count.variants}</td>
                  <td className="px-4 py-3"><ProductStatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                      Düzenle <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
