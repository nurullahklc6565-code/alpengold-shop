import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { CollectionForm } from "@/components/admin/collections/CollectionForm";
import { CollectionProductManager } from "@/components/admin/collections/CollectionProductManager";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { collectionService } from "@/server/services/collection.service";
import { deleteCollectionAction } from "@/server/actions/admin/collection";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Koleksiyon Düzenle" };

export default async function CollectionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [collection, allProducts] = await Promise.all([
    collectionService.get(id),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, status: true },
    }),
  ]);
  if (!collection) return notFound();

  const deleteAction = deleteCollectionAction.bind(null, id);
  const assignedProducts = collection.productCollections.map((pc) => ({
    productId: pc.product.id,
    product: pc.product,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/collections"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{collection.name}</h1>
            <p className="text-sm text-gray-500">{collection._count.productCollections} ürün</p>
          </div>
        </div>
        <DeleteButton onDelete={deleteAction}
          confirmMessage={`"${collection.name}" koleksiyonunu silmek istediğinizden emin misiniz?`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Koleksiyon Bilgileri">
          <CollectionForm collection={collection} />
        </SectionCard>

        <SectionCard
          title="Koleksiyondaki Ürünler"
          description="Aktif ürünleri bu koleksiyona atayın. Bir ürün birden fazla koleksiyona eklenebilir."
        >
          <CollectionProductManager
            collectionId={id}
            assignedProducts={assignedProducts}
            availableProducts={allProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug, status: p.status }))}
          />
        </SectionCard>
      </div>
    </div>
  );
}
