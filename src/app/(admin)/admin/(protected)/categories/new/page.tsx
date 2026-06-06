import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { categoryService } from "@/server/services/category.service";

export const metadata: Metadata = { title: "Yeni Kategori" };

export default async function NewCategoryPage() {
  const categories = await categoryService.listFlat();
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/categories" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Yeni Kategori</h1>
      </div>
      <div className="max-w-lg">
        <SectionCard title="Kategori Bilgileri">
          <CategoryForm categories={categories} />
        </SectionCard>
      </div>
    </div>
  );
}
