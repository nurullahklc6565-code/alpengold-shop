"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/components/store/cart/CartProvider";

type Props = {
  variantId: string;
  quantity?: number;
  inStock: boolean;
  disabled?: boolean;
  className?: string;
};

export function AddToCartButton({ variantId, quantity = 1, inStock, disabled, className }: Props) {
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!inStock || disabled) return;
    startTransition(async () => {
      await addItem(variantId, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    });
  }

  if (!inStock) {
    return (
      <button
        disabled
        className={`flex items-center justify-center gap-2 border border-[#d4d4d4] bg-[#f5f5f5] py-3.5 text-[13px] font-semibold text-[#a3a3a3] cursor-not-allowed w-full ${className ?? ""}`}
      >
        Stokta Yok
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isPending || added || disabled}
      className={`flex items-center justify-center gap-2 py-3.5 text-[13px] font-semibold text-white transition-all w-full ${
        added
          ? "bg-[#166534] border border-[#166534]"
          : "store-btn-primary disabled:opacity-70"
      } ${className ?? ""}`}
    >
      {added ? (
        <><Check className="h-4 w-4" /> Sepete Eklendi</>
      ) : isPending ? (
        "Ekleniyor…"
      ) : (
        <><ShoppingCart className="h-4 w-4" /> Sepete Ekle</>
      )}
    </button>
  );
}
