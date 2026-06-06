import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { categoryService } from "@/server/services/category.service";
import { deleteCategoryAction } from "@/server/actions/admin/category";

export const metadata: Metadata = { title: "Kategori Düzenle" };

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, allCategories] = await Promise.all([
    categoryService.get(id),
    categoryService.listFlat(),
  ]);
  if (!category) notFound();

  const deleteAction = deleteCategoryAction.bind(null, category.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/categories" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{category.name}</h1>
            <p className="text-sm text-gray-500">{category._count.products} ürün</p>
          </div>
        </div>
        <DeleteButton onDelete={deleteAction} confirmMessage={`"${category.name}" kategorisini silmek istediğinizden emin misiniz?`} />
      </div>
      <div className="max-w-lg">
        <SectionCard title="Kategori Bilgileri">
          <CategoryForm category={category} categories={allCategories.filter((c) => c.id !== id)} />
        </SectionCard>
      </div>
    </div>
  );
}
