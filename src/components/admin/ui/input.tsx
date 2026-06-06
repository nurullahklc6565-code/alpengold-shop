"use client";

import { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

/* ─── Input ─────────────────────────────────────────────────────────────── */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      prefix,
      suffix,
      leftIcon,
      rightIcon,
      inputSize = "md",
      className,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const genId = useId();
    const id = idProp ?? genId;

    const sizeClasses = {
      sm: "h-7  text-xs  px-2.5",
      md: "h-9  text-sm  px-3",
      lg: "h-10 text-sm  px-3.5",
    };

    const hasLeft  = !!leftIcon  || !!prefix;
    const hasRight = !!rightIcon || !!suffix || !!error;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-zinc-700 select-none"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Sol icon / prefix */}
          {hasLeft && (
            <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none text-zinc-400">
              {leftIcon || (
                <span className="text-sm text-zinc-500">{prefix}</span>
              )}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(
              "w-full rounded-lg border bg-white",
              "transition-[border-color,box-shadow] duration-150",
              "placeholder:text-zinc-400",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-50",
              // Durum renkleri
              error
                ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
                : "border-zinc-200 hover:border-zinc-300",
              // Size
              sizeClasses[inputSize],
              // Sol boşluk
              hasLeft && (leftIcon ? "pl-9" : `pl-${(prefix?.length ?? 0) > 3 ? "12" : "8"}`),
              // Sağ boşluk
              hasRight && "pr-9",
              className
            )}
            {...props}
          />

          {/* Sağ icon / suffix / error icon */}
          {hasRight && (
            <div className="absolute right-0 inset-y-0 flex items-center pr-3 pointer-events-none">
              {error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : rightIcon ? (
                <span className="text-zinc-400">{rightIcon}</span>
              ) : (
                <span className="text-sm text-zinc-500">{suffix}</span>
              )}
            </div>
          )}
        </div>

        {/* Alt mesajlar */}
        {error ? (
          <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-red-600">
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs text-zinc-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

/* ─── Textarea ──────────────────────────────────────────────────────────── */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id: idProp, ...props }, ref) => {
    const genId = useId();
    const id = idProp ?? genId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-zinc-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          aria-invalid={!!error}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2",
            "text-sm text-zinc-900 placeholder:text-zinc-400",
            "transition-[border-color,box-shadow] duration-150",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-50",
            "resize-none",
            error
              ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
              : "border-zinc-200 hover:border-zinc-300",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-zinc-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

/* ─── Select ────────────────────────────────────────────────────────────── */

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  inputSize?: "sm" | "md";
}

export function Select({
  label,
  hint,
  error,
  placeholder,
  options,
  inputSize = "md",
  className,
  id: idProp,
  ...props
}: SelectProps) {
  const genId = useId();
  const id = idProp ?? genId;

  const sizeClasses = {
    sm: "h-7 text-xs px-2.5 pr-8",
    md: "h-9 text-sm px-3  pr-9",
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error}
          className={cn(
            "w-full appearance-none rounded-lg border bg-white",
            "transition-[border-color,box-shadow] duration-150",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-50",
            error
              ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
              : "border-zinc-200 hover:border-zinc-300",
            sizeClasses[inputSize],
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error ? (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
