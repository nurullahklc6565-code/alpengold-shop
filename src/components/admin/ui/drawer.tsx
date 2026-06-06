"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

const WIDTHS = {
  sm:   "max-w-sm",   // ~384px
  md:   "max-w-md",   // ~448px
  lg:   "max-w-lg",   // ~512px
  xl:   "max-w-xl",   // ~576px
  "2xl":"max-w-2xl",  // ~672px
  full: "max-w-full",
} as const;

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: keyof typeof WIDTHS;
  closeOnBackdrop?: boolean;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
  closeOnBackdrop = true,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // ESC ile kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Açık olunca body scroll'u kilitle
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        className={cn(
          "relative flex flex-col w-full h-full bg-white shadow-xl",
          "animate-slide-in-right",
          WIDTHS[width]
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
            <div>
              {title && (
                <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors ml-4 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-zinc-100 px-5 py-4 bg-zinc-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Drawer Footer Helper ───────────────────────────────────────────────── */

export function DrawerFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex items-center justify-end gap-3", className)}>
      {children}
    </div>
  );
}
