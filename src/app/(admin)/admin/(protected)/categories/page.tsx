import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { categoryService } from "@/server/services/category.service";

export const metadata: Metadata = { title: "Kategoriler" };

export default async function CategoriesPage() {
  const categories = await categoryService.list();
  const roots = categories.filter((c) => !c.parentId);

  return (
    <div>
      <PageHeader
        title="Kategoriler"
        description="Kategoriler hiyerarşik yapıyı destekler. Alt kategoriler oluşturabilirsiniz."
        actions={
          <Link href="/admin/categories/new" className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" />
            Yeni Kategori
          </Link>
        }
      />

      {categories.length === 0 ? (
        <EmptyState title="Henüz kategori yok" description="İlk kategorinizi oluşturun." action={<Link href="/admin/categories/new" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Yeni Kategori</Link>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Üst</th>
                <th className="px-4 py-3 text-left">Ürün</th>
                <th className="px-4 py-3 text-left">Alt</th>
                <th className="px-4 py-3 text-left">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cat.parentId && <span className="mr-2 text-gray-300">└</span>}
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{cat.parent?.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-600">{cat._count.products}</td>
                  <td className="px-4 py-3 text-gray-600">{cat._count.children}</td>
                  <td className="px-4 py-3"><StatusBadge active={cat.active} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/categories/${cat.id}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
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
