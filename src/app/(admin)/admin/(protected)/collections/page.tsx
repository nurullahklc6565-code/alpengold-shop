import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { collectionService } from "@/server/services/collection.service";

export const metadata: Metadata = { title: "Koleksiyonlar" };

export default async function CollectionsPage() {
  const collections = await collectionService.list();
  return (
    <div>
      <PageHeader
        title="Koleksiyonlar"
        description="Koleksiyonlar kategorilerden bağımsızdır. Bir ürün birden fazla koleksiyona atanabilir."
        actions={
          <Link href="/admin/collections/new" className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Yeni Koleksiyon
          </Link>
        }
      />
      {collections.length === 0 ? (
        <EmptyState title="Henüz koleksiyon yok" action={<Link href="/admin/collections/new" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Yeni Koleksiyon</Link>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Koleksiyon</th>
                <th className="px-4 py-3 text-left">Ürün</th>
                <th className="px-4 py-3 text-left">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{col.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{col.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{col._count.productCollections}</td>
                  <td className="px-4 py-3"><StatusBadge active={col.active} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/collections/${col.id}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
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
