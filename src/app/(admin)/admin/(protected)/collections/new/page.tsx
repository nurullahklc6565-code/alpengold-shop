import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { CollectionForm } from "@/components/admin/collections/CollectionForm";

export const metadata: Metadata = { title: "Yeni Koleksiyon" };

export default function NewCollectionPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/collections" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Yeni Koleksiyon</h1>
      </div>
      <div className="max-w-lg">
        <SectionCard title="Koleksiyon Bilgileri">
          <CollectionForm />
        </SectionCard>
      </div>
    </div>
  );
}
