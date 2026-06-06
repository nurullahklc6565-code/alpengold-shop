import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
};

const VARIANTS = {
  default: "bg-gray-100 text-gray-600",
  success: "bg-green-100 text-green-600",
  warning: "bg-amber-100 text-amber-600",
  danger:  "bg-red-100 text-red-600",
};

export function StatsCard({ title, value, subtitle, icon: Icon, variant = "default" }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", VARIANTS[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
