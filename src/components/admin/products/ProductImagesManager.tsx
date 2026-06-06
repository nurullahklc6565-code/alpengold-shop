"use client";

import { useActionState, useState, useTransition, useRef, useCallback } from "react";
import { Star, Trash2, Plus, Upload, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/admin/ui/toast";
import {
  addProductImageAction,
  addProductImageByUrlAction,
  deleteProductImageAction,
  setPrimaryImageAction,
  type ProductActionState,
} from "@/server/actions/admin/product";
import { cn } from "@/lib/utils/cn";

type ImageItem = { id: string; url: string; alt: string | null; isPrimary: boolean; position: number };
type Props = { productId: string; images: ImageItem[] };
type UploadStatus = { status: "uploading" | "error"; name: string; message?: string };
const init: ProductActionState = {};

export function ProductImagesManager({ productId, images }: Props) {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"url" | "upload">("upload");
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addBound = addProductImageAction.bind(null, productId);
  const [state, formAction, addPending] = useActionState(addBound, init);

  const uploadAndAdd = useCallback(
    async (file: File) => {
      const name = file.name;
      setUploadStatuses((prev) => [...prev, { status: "uploading", name }]);

      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const { error } = await res.json();
          setUploadStatuses((prev) =>
            prev.map((s) =>
              s.name === name && s.status === "uploading"
                ? { status: "error", name, message: error }
                : s
            )
          );
          toast.error(error ?? "Yükleme başarısız");
          return;
        }
        const media = await res.json();
        const alt = name.replace(/\.[^.]+$/, "");
        startTransition(() => { void addProductImageByUrlAction(productId, media.url, alt); });
        setUploadStatuses((prev) => prev.filter((s) => s.name !== name));
        toast.success("Görsel eklendi");
      } catch {
        setUploadStatuses((prev) =>
          prev.map((s) =>
            s.name === name && s.status === "uploading"
              ? { status: "error", name, message: "Bağlantı hatası" }
              : s
          )
        );
        toast.error("Sunucuya bağlanılamadı");
      }
    },
    [productId, startTransition]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadAndAdd);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  function handleDelete(imageId: string) {
    startTransition(() => deleteProductImageAction(productId, imageId));
  }

  function handleSetPrimary(imageId: string) {
    startTransition(() => setPrimaryImageAction(productId, imageId));
  }

  return (
    <div className="space-y-4">
      {/* Mevcut görseller */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className={cn(
                  "aspect-square w-full rounded-xl object-cover border-2 transition-all",
                  img.isPrimary ? "border-gray-900" : "border-gray-200"
                )}
              />
              {img.isPrimary && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] text-white">
                  <Star className="h-2.5 w-2.5 fill-current" /> Ana
                </div>
              )}
              <div className="absolute inset-0 hidden group-hover:flex items-end justify-between p-2 bg-gradient-to-t from-black/40 to-transparent rounded-xl">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={isPending}
                    className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-800 hover:bg-white"
                  >
                    Ana Yap
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={isPending}
                  className="ml-auto rounded-full bg-red-500/90 p-1 text-white hover:bg-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yükleme hata ve spinner durumları */}
      {uploadStatuses.filter((s) => s.status === "error").map((s, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {s.name}: {s.message}
        </div>
      ))}
      {uploadStatuses.filter((s) => s.status === "uploading").map((s, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
          {s.name} yükleniyor…
        </div>
      ))}

      {/* Sekme */}
      <div className="flex rounded-lg border border-gray-200 p-0.5 w-fit">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "upload" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Upload className="h-3 w-3" /> Dosya Yükle
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "url" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Plus className="h-3 w-3" /> URL ile Ekle
        </button>
      </div>

      {/* Dosya yükleme alanı */}
      {tab === "upload" && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors select-none",
            dragOver
              ? "border-gray-900 bg-gray-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          )}
        >
          <Upload className="h-6 w-6 text-gray-400" />
          <p className="text-xs text-gray-500">
            Sürükleyin veya tıklayın · JPEG, PNG, WebP, GIF · Maks 10 MB
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* URL girişi */}
      {tab === "url" && (
        <form action={formAction} className="flex gap-2">
          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
          <input
            name="url"
            type="url"
            required
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <input
            name="alt"
            placeholder="Alt metin (opsiyonel)"
            className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            type="submit"
            disabled={addPending}
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
          >
            <Plus className="h-4 w-4" /> Ekle
          </button>
        </form>
      )}
    </div>
  );
}
