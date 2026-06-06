"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

type Props = {
  onDelete: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
};

export function DeleteButton({
  onDelete,
  confirmMessage = "Bu kaydı silmek istediğinizden emin misiniz?",
  label,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(() => onDelete());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {label ?? (isPending ? "Siliniyor…" : "Sil")}
    </button>
  );
}
