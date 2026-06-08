"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type QuickViewState = {
  isOpen: boolean;
  productSlug: string | null;
  openQuickView: (productSlug: string) => void;
  closeQuickView: () => void;
};

const QuickViewContext = createContext<QuickViewState | null>(null);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [productSlug, setProductSlug] = useState<string | null>(null);

  const openQuickView = useCallback((slug: string) => setProductSlug(slug), []);
  const closeQuickView = useCallback(() => setProductSlug(null), []);

  return (
    <QuickViewContext.Provider value={{ isOpen: !!productSlug, productSlug, openQuickView, closeQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView, QuickViewProvider içinde kullanılmalıdır");
  return ctx;
}
