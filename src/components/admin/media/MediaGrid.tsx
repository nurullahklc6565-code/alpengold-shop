"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Copy, CheckCheck, FileText, Video } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Media } from "@prisma/client";

interface Props {
  files: Media[];
}

export function MediaGrid({ files }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteFile = async (id: string, key: string) => {
    if (!confirm("Bu medya dosyasını silmek istediğinizden emin misiniz?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, key }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            "group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-opacity",
            (deletingId === file.id || isPending) && "opacity-50"
          )}
        >
          {/* Önizleme */}
          {file.type === "IMAGE" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.url}
              alt={file.alt ?? ""}
              className="aspect-square w-full object-cover"
            />
          ) : file.type === "VIDEO" ? (
            <div className="flex aspect-square items-center justify-center bg-gray-100">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center bg-gray-100">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          )}

          {/* Hover aksiyonları */}
          <div className="absolute inset-0 hidden flex-col items-end justify-between bg-black/30 p-2 group-hover:flex">
            <button
              type="button"
              onClick={() => deleteFile(file.id, file.key)}
              disabled={deletingId === file.id}
              className="rounded-full bg-red-500/90 p-1.5 text-white hover:bg-red-600 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => copyUrl(file.id, file.url)}
              className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-800 hover:bg-white"
            >
              {copiedId === file.id ? (
                <><CheckCheck className="h-3 w-3 text-green-600" /> Kopyalandı</>
              ) : (
                <><Copy className="h-3 w-3" /> URL Kopyala</>
              )}
            </button>
          </div>

          {/* Dosya bilgisi */}
          <div className="p-2">
            <p className="truncate text-xs text-gray-600">
              {file.key.split("/").pop()}
            </p>
            <p className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(0)} KB
              {file.width && file.height && ` · ${file.width}×${file.height}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
