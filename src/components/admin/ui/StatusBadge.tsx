import { cn } from "@/lib/utils/cn";

type Props = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  size?: "sm" | "md";
};

export function StatusBadge({
  active,
  activeLabel = "Aktif",
  inactiveLabel = "Pasif",
  size = "sm",
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        active
          ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
          : "bg-gray-100 text-gray-600 ring-1 ring-gray-500/20"
      )}
    >
      <span className={cn("mr-1 h-1.5 w-1.5 rounded-full", active ? "bg-green-500" : "bg-gray-400")} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
