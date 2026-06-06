import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANTS = {
  primary:   "bg-zinc-950 text-white border border-zinc-950 hover:bg-zinc-800 hover:border-zinc-800 active:bg-zinc-900",
  secondary: "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100",
  ghost:     "bg-transparent text-zinc-600 border border-transparent hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200",
  danger:    "bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 active:bg-red-800",
  "danger-ghost": "bg-transparent text-red-600 border border-transparent hover:bg-red-50 hover:text-red-700 active:bg-red-100",
  success:   "bg-green-600 text-white border border-green-600 hover:bg-green-700 active:bg-green-800",
} as const;

const SIZES = {
  xs:  "h-7  px-2.5  text-xs  gap-1.5 rounded-md",
  sm:  "h-8  px-3    text-sm  gap-1.5 rounded-lg",
  md:  "h-9  px-4    text-sm  gap-2   rounded-lg",
  lg:  "h-10 px-5    text-sm  gap-2   rounded-xl",
  xl:  "h-11 px-6    text-base gap-2  rounded-xl",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Temel stiller
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "select-none whitespace-nowrap",
          // Variant
          VARIANTS[variant],
          // Size
          SIZES[size],
          // Disabled
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          // Full width
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" style={{ width: "1em", height: "1em" }} />
        ) : (
          icon && <span className="shrink-0 flex items-center">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {iconRight && !loading && (
          <span className="shrink-0 flex items-center">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
