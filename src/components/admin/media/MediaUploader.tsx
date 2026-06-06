"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/components/admin/ui/toast";
import { cn } from "@/lib/utils/cn";

type UploadState =
  | { status: "uploading"; name: string }
  | { status: "done"; name: string; url: string }
  | { status: "error"; name: string; message: string };

interface Props {
  onUploaded?: (media: { id: string; url: string; key: string }) => void;
  accept?: string;
  className?: string;
}

export function MediaUploader({
  onUploaded,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  className,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadState[]>([]);

  const uploadFile = useCallback(
    async (file: File) => {
      const name = file.name;
      setUploads((prev) => [...prev, { status: "uploading", name }]);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const { error } = await res.json();
          setUploads((prev) =>
            prev.map((u) =>
              u.name === name && u.status === "uploading"
                ? { status: "error", name, message: error }
                : u
            )
          );
          toast.error(error ?? "Yükleme başarısız");
          return;
        }

        const media = await res.json();
        setUploads((prev) =>
          prev.map((u) =>
            u.name === name && u.status === "uploading"
              ? { status: "done", name, url: media.url }
              : u
          )
        );
        toast.success(`${name} yüklendi`);
        onUploaded?.(media);
        router.refresh();
      } catch {
        setUploads((prev) =>
          prev.map((u) =>
            u.name === name && u.status === "uploading"
              ? { status: "error", name, message: "Bağlantı hatası" }
              : u
          )
        );
        toast.error("Sunucuya bağlanılamadı");
      }
    },
    [onUploaded, router]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const dismiss = (idx: number) =>
    setUploads((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 transition-colors select-none",
          dragOver
            ? "border-gray-900 bg-gray-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        )}
      >
        <Upload className="h-8 w-8 text-gray-400" />
        <p className="text-sm font-medium text-gray-700">
          Dosyaları sürükleyin veya tıklayın
        </p>
        <p className="text-xs text-gray-400">
          JPEG, PNG, WebP, GIF, SVG · Maks 10 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((u, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {u.status === "uploading" && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" />
              )}
              {u.status === "done" && (
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
              )}
              {u.status === "error" && (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              )}

              <span className="flex-1 truncate text-gray-700">{u.name}</span>

              {u.status === "error" && (
                <span className="shrink-0 text-xs text-red-500">{u.message}</span>
              )}
              {u.status === "done" && (
                <span className="shrink-0 text-xs text-green-600">Yüklendi</span>
              )}
              {u.status === "uploading" && (
                <span className="shrink-0 text-xs text-gray-400">Yükleniyor…</span>
              )}

              {u.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => dismiss(i)}
                  className="ml-1 shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
