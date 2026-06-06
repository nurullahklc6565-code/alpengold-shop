"use client";

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export interface StickyActionBarProps {
  children: ReactNode;
  className?: string;
  show?: boolean;
  position?: "bottom" | "top";
}

/**
 * Form sayfalarında kullanılacak yapışkan kaydet/iptal bar'ı.
 * İçeriğin altında sabitlenerek her zaman görünür kalır.
 */
export function StickyActionBar({
  children,
  className,
  show = true,
  position = "bottom",
}: StickyActionBarProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "sticky z-20 flex items-center justify-between",
        "bg-white/95 backdrop-blur-sm border-zinc-200 shadow-md",
        "px-5 py-3.5",
        position === "bottom"
          ? "bottom-0 border-t rounded-b-xl"
          : "top-0 border-b rounded-t-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Sol taraf: durum bilgisi veya uyarı */
export function StickyActionBarInfo({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500">
      {children}
    </div>
  );
}

/** Sağ taraf: aksiyonlar */
export function StickyActionBarActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {children}
    </div>
  );
}
