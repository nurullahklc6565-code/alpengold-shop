import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Koleksiyonlar" };

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
    select: { id: true, name: true, slug: true, imageUrl: true, description: true },
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Koleksiyonlar</h1>

      {collections.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <p className="text-sm text-gray-400">Henüz koleksiyon oluşturulmadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {col.imageUrl ? (
                  <Image
                    src={col.imageUrl}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
              </div>
              <div className="p-5">
                <h2 className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                  {col.name}
                </h2>
                {col.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{col.description}</p>
                )}
                <p className="mt-3 text-xs font-medium text-gray-400">Koleksiyonu Gör →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
