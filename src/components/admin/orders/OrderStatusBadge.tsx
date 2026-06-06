import { cn } from "@/lib/utils/cn";

const ORDER_STATUS_CONFIG = {
  PENDING:    { label: "Bekliyor",     cls: "bg-yellow-50 text-yellow-700 ring-yellow-600/20" },
  CONFIRMED:  { label: "Onaylandı",    cls: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  PROCESSING: { label: "Hazırlanıyor", cls: "bg-indigo-50 text-indigo-700 ring-indigo-600/20" },
  SHIPPED:    { label: "Kargoda",      cls: "bg-cyan-50 text-cyan-700 ring-cyan-600/20" },
  DELIVERED:  { label: "Teslim Edildi",cls: "bg-green-50 text-green-700 ring-green-600/20" },
  CANCELLED:  { label: "İptal",        cls: "bg-gray-100 text-gray-600 ring-gray-500/20" },
  REFUNDED:   { label: "İade",         cls: "bg-orange-50 text-orange-700 ring-orange-600/20" },
} as const;

const PAYMENT_STATUS_CONFIG = {
  UNPAID:         { label: "Ödenmedi",         cls: "bg-red-50 text-red-700 ring-red-600/20" },
  PAID:           { label: "Ödendi",           cls: "bg-green-50 text-green-700 ring-green-600/20" },
  PARTIALLY_PAID: { label: "Kısmi Ödeme",      cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  REFUNDED:       { label: "İade Edildi",      cls: "bg-orange-50 text-orange-700 ring-orange-600/20" },
} as const;

export function OrderStatusBadge({ status }: { status: keyof typeof ORDER_STATUS_CONFIG }) {
  const { label, cls } = ORDER_STATUS_CONFIG[status] ?? ORDER_STATUS_CONFIG.PENDING;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1", cls)}>
      {label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: keyof typeof PAYMENT_STATUS_CONFIG }) {
  const { label, cls } = PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.UNPAID;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1", cls)}>
      {label}
    </span>
  );
}
