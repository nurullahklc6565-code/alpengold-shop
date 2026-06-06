"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";

export function MiniCartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingVariantId, setPendingVariantId] = useState<string | null>(null);

  // Drawer açıkken arka plan kaymasını engelle
  useEffect(() => {
    if (isDrawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isDrawerOpen]);

  // ESC ile kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    if (isDrawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, closeDrawer]);

  function handleQty(variantId: string, qty: number) {
    setPendingVariantId(variantId);
    startTransition(async () => {
      await updateQuantity(variantId, qty);
      setPendingVariantId(null);
    });
  }

  function handleRemove(variantId: string) {
    setPendingVariantId(variantId);
    startTransition(async () => {
      await removeItem(variantId);
      setPendingVariantId(null);
    });
  }

  function goTo(path: string) {
    closeDrawer();
    router.push(path);
  }

  return (
    <>
      {/* Arka plan örtüsü */}
      <div
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer paneli */}
      <aside
        className={`fixed right-0 top-0 z-[100] flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Sepet"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-5">
          <h2 className="text-[15px] font-semibold uppercase tracking-[0.12em] text-[#0a0a0a]">
            Sepetim {cart.itemCount > 0 && <span className="text-[#a3a3a3]">({cart.itemCount})</span>}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-1 text-[#525252] transition-colors hover:text-[#0a0a0a]"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* İçerik */}
        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f5]">
              <ShoppingBag className="h-7 w-7 text-[#a3a3a3]" strokeWidth={1.25} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#0a0a0a]">Sepetiniz boş</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#737373]">
                Beğendiğiniz ürünleri sepete ekleyin, burada görünsün.
              </p>
            </div>
            <button
              type="button"
              onClick={() => goTo("/products")}
              className="mt-2 border border-[#0a0a0a] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white"
            >
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="divide-y divide-[#f0f0f0]">
                {cart.lines.map((line) => {
                  const isRowPending = isPending && pendingVariantId === line.variantId;
                  const opts = Object.entries(line.options);
                  return (
                    <li
                      key={line.variantId}
                      className={`flex gap-4 py-5 transition-opacity ${isRowPending ? "opacity-40 pointer-events-none" : ""}`}
                    >
                      <div className="relative shrink-0 overflow-hidden bg-[#f2f2f2]" style={{ width: 84, aspectRatio: "3/4" }}>
                        {line.imageUrl ? (
                          <Image src={line.imageUrl} alt={line.productName} fill className="object-cover" sizes="84px" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-[10px] text-[#a3a3a3]">Görsel yok</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${line.productSlug}`}
                              onClick={closeDrawer}
                              className="text-[13px] font-semibold leading-snug text-[#0a0a0a] transition-colors hover:text-[#525252]"
                            >
                              {line.productName}
                            </Link>
                            {opts.length > 0 && (
                              <p className="mt-1 text-[11px] text-[#a3a3a3]">
                                {opts.map(([k, v]) => `${k}: ${v}`).join("  ·  ")}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(line.variantId)}
                            disabled={isPending}
                            className="shrink-0 p-1 text-[#d4d4d4] transition-colors hover:text-[#0a0a0a]"
                            aria-label="Ürünü kaldır"
                          >
                            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center border border-[#e5e5e5]">
                            <button
                              type="button"
                              onClick={() => handleQty(line.variantId, line.quantity - 1)}
                              disabled={isPending || line.quantity <= 1}
                              className="flex h-7 w-7 items-center justify-center text-[#525252] transition-colors hover:bg-[#f2f2f2] disabled:opacity-30"
                            >
                              <Minus className="h-3 w-3" strokeWidth={2} />
                            </button>
                            <span className="w-7 text-center text-[12px] font-medium text-[#0a0a0a]">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQty(line.variantId, line.quantity + 1)}
                              disabled={isPending}
                              className="flex h-7 w-7 items-center justify-center text-[#525252] transition-colors hover:bg-[#f2f2f2] disabled:opacity-30"
                            >
                              <Plus className="h-3 w-3" strokeWidth={2} />
                            </button>
                          </div>
                          <p className="text-[13px] font-semibold text-[#0a0a0a]">
                            {line.formattedLineTotal ?? "—"}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Alt bölüm: toplam + butonlar */}
            <div className="border-t border-[#e5e5e5] px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[13px] uppercase tracking-[0.1em] text-[#737373]">Ara Toplam</span>
                <span className="text-[17px] font-semibold text-[#0a0a0a]">{cart.formattedSubtotal}</span>
              </div>
              <p className="mb-4 text-[11px] leading-relaxed text-[#a3a3a3]">
                Kargo ve vergiler ödeme adımında hesaplanır.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => goTo("/checkout")}
                  className="w-full bg-[#0a0a0a] py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#262626]"
                >
                  Ödemeye Geç
                </button>
                <button
                  type="button"
                  onClick={() => goTo("/cart")}
                  className="w-full border border-[#0a0a0a] py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
                >
                  Sepete Git
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
