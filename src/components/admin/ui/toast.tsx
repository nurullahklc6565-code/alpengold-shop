"use client";

import { Toaster as Sonner } from "sonner";
export { toast } from "sonner";

/**
 * Sonner Toaster bileşeni — admin layout içine bir kez eklenir.
 * Kullanım: import { toast } from "@/components/admin/ui/toast"
 *   toast.success("Kaydedildi")
 *   toast.error("Bir hata oluştu")
 *   toast.loading("İşleniyor...")
 *   toast.promise(promise, { loading, success, error })
 */
export function AdminToaster() {
  return (
    <Sonner
      position="bottom-right"
      offset={24}
      gap={8}
      duration={3500}
      richColors
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !shadow-lg !border !border-zinc-200 !bg-white !text-zinc-900",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-zinc-500",
          actionButton: "!bg-zinc-950 !text-white !rounded-lg !text-xs !font-medium",
          cancelButton: "!bg-zinc-100 !text-zinc-700 !rounded-lg !text-xs",
          closeButton: "!text-zinc-400 hover:!text-zinc-600",
          success: "!border-green-200 [&_[data-icon]]:!text-green-600",
          error: "!border-red-200 [&_[data-icon]]:!text-red-600",
          warning: "!border-amber-200 [&_[data-icon]]:!text-amber-600",
          info: "!border-blue-200 [&_[data-icon]]:!text-blue-600",
        },
      }}
    />
  );
}
