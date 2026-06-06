import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

/* ─── Card ───────────────────────────────────────────────────────────────── */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ghost" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  variant = "default",
  padding = "none",
  className,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default: "bg-white border border-zinc-200 shadow-sm",
    ghost:   "bg-transparent border border-zinc-100",
    filled:  "bg-zinc-50 border border-zinc-200",
  };
  const paddingClasses = {
    none: "",
    sm:   "p-4",
    md:   "p-5",
    lg:   "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Card Header ────────────────────────────────────────────────────────── */

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  border?: boolean;
  actions?: ReactNode;
}

export function CardHeader({
  border = true,
  actions,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between px-5 py-4",
        border && "border-b border-zinc-100",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {actions && (
        <div className="flex items-center gap-2 ml-4 shrink-0">{actions}</div>
      )}
    </div>
  );
}

/* ─── Card Title & Description ───────────────────────────────────────────── */

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold text-zinc-900", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-zinc-500 mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

/* ─── Card Content ───────────────────────────────────────────────────────── */

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

/* ─── Card Footer ────────────────────────────────────────────────────────── */

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export function CardFooter({
  border = true,
  className,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-3.5 bg-zinc-50",
        border && "border-t border-zinc-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Divider ────────────────────────────────────────────────────────────── */

export function CardDivider({ className }: { className?: string }) {
  return <div className={cn("border-t border-zinc-100 mx-5", className)} />;
}
