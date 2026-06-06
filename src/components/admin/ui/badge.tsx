import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

const VARIANTS = {
  default:  "bg-zinc-100 text-zinc-700 border-zinc-200",
  success:  "bg-green-50 text-green-700 border-green-200",
  warning:  "bg-amber-50 text-amber-700 border-amber-200",
  danger:   "bg-red-50 text-red-700 border-red-200",
  info:     "bg-blue-50 text-blue-700 border-blue-200",
  purple:   "bg-purple-50 text-purple-700 border-purple-200",
  orange:   "bg-orange-50 text-orange-700 border-orange-200",
  indigo:   "bg-indigo-50 text-indigo-700 border-indigo-200",
} as const;

const DOTS: Record<keyof typeof VARIANTS, string> = {
  default:  "bg-zinc-400",
  success:  "bg-green-500",
  warning:  "bg-amber-500",
  danger:   "bg-red-500",
  info:     "bg-blue-500",
  purple:   "bg-purple-500",
  orange:   "bg-orange-500",
  indigo:   "bg-indigo-500",
};

export type BadgeVariant = keyof typeof VARIANTS;

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  children,
  className,
}: BadgeProps) {
  const sizeClasses = {
    xs: "px-1.5 py-0 text-[11px] gap-1",
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        "whitespace-nowrap leading-none",
        VARIANTS[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn("rounded-full shrink-0", DOTS[variant], size === "md" ? "h-2 w-2" : "h-1.5 w-1.5")}
        />
      )}
      {children}
    </span>
  );
}

/* ─── Durum Badge'leri (domain-specific) ─────────────────────────────────── */

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: BadgeVariant; l: string }> = {
    PENDING:    { v: "warning",  l: "Bekliyor" },
    CONFIRMED:  { v: "info",     l: "Onaylandı" },
    PROCESSING: { v: "indigo",   l: "Hazırlanıyor" },
    SHIPPED:    { v: "purple",   l: "Kargoda" },
    DELIVERED:  { v: "success",  l: "Teslim Edildi" },
    CANCELLED:  { v: "default",  l: "İptal" },
    REFUNDED:   { v: "orange",   l: "İade" },
  };
  const cfg = map[status] ?? { v: "default" as BadgeVariant, l: status };
  return <Badge variant={cfg.v} dot>{cfg.l}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: BadgeVariant; l: string }> = {
    UNPAID:         { v: "danger",  l: "Ödenmedi" },
    PAID:           { v: "success", l: "Ödendi" },
    PARTIALLY_PAID: { v: "warning", l: "Kısmi Ödeme" },
    REFUNDED:       { v: "orange",  l: "İade Edildi" },
  };
  const cfg = map[status] ?? { v: "default" as BadgeVariant, l: status };
  return <Badge variant={cfg.v} dot>{cfg.l}</Badge>;
}

export function ProductStatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: BadgeVariant; l: string }> = {
    ACTIVE:   { v: "success", l: "Aktif" },
    DRAFT:    { v: "warning", l: "Taslak" },
    ARCHIVED: { v: "default", l: "Arşiv" },
  };
  const cfg = map[status] ?? { v: "default" as BadgeVariant, l: status };
  return <Badge variant={cfg.v} dot>{cfg.l}</Badge>;
}

export function FulfillmentBadge({ status }: { status: string }) {
  const map: Record<string, { v: BadgeVariant; l: string }> = {
    UNFULFILLED:          { v: "default", l: "Gönderilmedi" },
    PARTIALLY_FULFILLED:  { v: "info",    l: "Kısmen Gönderildi" },
    FULFILLED:            { v: "success", l: "Gönderildi" },
    RETURNED:             { v: "orange",  l: "İade" },
  };
  const cfg = map[status] ?? { v: "default" as BadgeVariant, l: status };
  return <Badge variant={cfg.v} dot>{cfg.l}</Badge>;
}

export function ActiveBadge({ active, activeLabel = "Aktif", inactiveLabel = "Pasif" }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <Badge variant={active ? "success" : "default"} dot>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}
