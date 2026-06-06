"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { toggleFavoriteAction } from "@/server/actions/store/favorites";

type FavoritesContextValue = {
  favoriteIds: Set<string>;
  count: number;
  isFavorited: (productId: string) => boolean;
  toggle: (productId: string, productSlug: string, productName?: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ initialIds, children }: { initialIds: string[]; children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(initialIds));

  const isFavorited = useCallback((productId: string) => favoriteIds.has(productId), [favoriteIds]);

  const toggle = useCallback(async (productId: string, productSlug: string, productName?: string) => {
    const wasFavorited = favoriteIds.has(productId);

    // İyimser güncelleme
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      const result = await toggleFavoriteAction(productId, productSlug);
      const added = result?.added ?? !wasFavorited;

      // Sunucu sonucu farklıysa düzelt
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (added) next.add(productId);
        else next.delete(productId);
        return next;
      });

      const label = productName ? `"${productName}"` : "Ürün";
      if (added) {
        toast.success(`${label} favorilere eklendi`);
      } else {
        toast(`${label} favorilerden kaldırıldı`);
      }
    } catch {
      // Hata durumunda iyimser güncellemeyi geri al
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.add(productId);
        else next.delete(productId);
        return next;
      });
      toast.error("Favori işlemi başarısız oldu, tekrar deneyin");
    }
  }, [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, count: favoriteIds.size, isFavorited, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites, FavoritesProvider içinde kullanılmalıdır");
  return ctx;
}
