"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getCartSummaryAction,
  addToCartAction,
  updateCartQuantityAction,
  removeFromCartAction,
} from "@/server/actions/store/cart";
import type { CartData } from "@/server/services/storefront/cart.service";

type CartContextValue = {
  cart: CartData;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refresh: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
};

const emptyCart: CartData = {
  lines: [],
  subtotal: 0,
  formattedSubtotal: "",
  itemCount: 0,
  hasUnavailableItems: false,
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ initialCart, children }: { initialCart: CartData; children: ReactNode }) {
  const [cart, setCart] = useState<CartData>(initialCart ?? emptyCart);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await getCartSummaryAction();
      setCart(next);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    await addToCartAction(variantId, quantity);
    await refresh();
    setIsDrawerOpen(true);
  }, [refresh]);

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    await updateCartQuantityAction(variantId, quantity);
    await refresh();
  }, [refresh]);

  const removeItem = useCallback(async (variantId: string) => {
    await removeFromCartAction(variantId);
    await refresh();
  }, [refresh]);

  // Sayfa odak kazandığında (örn. başka sekmede sepet değiştiyse) sepeti tazele
  useEffect(() => {
    function handleFocus() { refresh(); }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  return (
    <CartContext.Provider
      value={{ cart, isLoading, isDrawerOpen, openDrawer, closeDrawer, refresh, addItem, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart, CartProvider içinde kullanılmalıdır");
  return ctx;
}
