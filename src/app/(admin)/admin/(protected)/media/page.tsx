import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { MediaUploader } from "@/components/admin/media/MediaUploader";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Medya" };

export default async function MediaPage() {
  const mediaFiles = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medya Yöneticisi"
        description="Görsel, video ve döküman yönetimi"
      />

      <MediaUploader />

      {mediaFiles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center">
          <p className="text-sm font-medium text-gray-700">Henüz medya dosyası yüklenmedi</p>
          <p className="mt-2 text-xs text-gray-400">
            Yükleme alanını kullanarak dosya ekleyin.
          </p>
        </div>
      ) : (
        <MediaGrid files={mediaFiles} />
      )}
    </div>
  );
}
