"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  id: string;
  active: boolean;
  onToggle: (id: string) => Promise<void>;
};

export function ToggleActiveButton({ id, active, onToggle }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => onToggle(id))}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50",
        active ? "bg-gray-900" : "bg-gray-200"
      )}
      aria-pressed={active}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          active ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}
