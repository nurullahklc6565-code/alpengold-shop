import { cn } from "@/lib/utils/cn";

const config = {
  ACTIVE: { label: "Aktif", cls: "bg-green-50 text-green-700 ring-green-600/20" },
  DRAFT: { label: "Taslak", cls: "bg-yellow-50 text-yellow-700 ring-yellow-600/20" },
  ARCHIVED: { label: "Arşiv", cls: "bg-gray-100 text-gray-600 ring-gray-500/20" },
} as const;

export function ProductStatusBadge({ status }: { status: keyof typeof config }) {
  const { label, cls } = config[status] ?? config.DRAFT;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1", cls)}>
      {label}
    </span>
  );
}
