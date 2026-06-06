import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: { py: "py-10", icon: "h-10 w-10", iconInner: "h-5 w-5", title: "text-sm", desc: "text-xs" },
    md: { py: "py-16", icon: "h-14 w-14", iconInner: "h-7 w-7", title: "text-base", desc: "text-sm" },
    lg: { py: "py-24", icon: "h-16 w-16", iconInner: "h-8 w-8", title: "text-lg", desc: "text-base" },
  }[size];

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", sizeClasses.py, className)}>
      {icon ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 mb-4",
            sizeClasses.icon
          )}
        >
          <span className={cn("flex", sizeClasses.iconInner)}>{icon}</span>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-zinc-100 mb-4",
            sizeClasses.icon
          )}
        >
          {/* Default empty box icon */}
          <svg
            className={cn("text-zinc-400", sizeClasses.iconInner)}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}

      <h3 className={cn("font-semibold text-zinc-900", sizeClasses.title)}>{title}</h3>

      {description && (
        <p className={cn("text-zinc-500 mt-1.5 max-w-sm", sizeClasses.desc)}>{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
