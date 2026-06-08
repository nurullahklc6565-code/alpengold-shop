"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { useQuickView } from "./QuickViewProvider";
import { ProductDetails } from "./ProductDetails";
import { getProductQuickViewAction } from "@/server/actions/store/product";

type QuickViewProduct = NonNullable<Awaited<ReturnType<typeof getProductQuickViewAction>>>;

export function QuickViewModal() {
  const { isOpen, productSlug, closeQuickView } = useQuickView();
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Şu an gösterilen ürün, açılmak istenen ürünle eşleşmiyorsa yükleniyor demektir
  const isLoading = !product || product.slug !== productSlug;

  // Modal açıldığında ürün verisini getir.
  // Kapanırken state'i sıfırlamıyoruz — kapanma animasyonu sırasında
  // mevcut ürün görünür kalır, böylece yükleniyor ekranı titremez.
  useEffect(() => {
    if (!productSlug) return;
    let cancelled = false;
    getProductQuickViewAction(productSlug).then((data) => {
      if (cancelled) return;
      setProduct(data);
      setActiveImage(data?.images[0]?.url ?? null);
    });
    return () => { cancelled = true; };
  }, [productSlug]);

  // Açıkken arka plan kaymasını engelle
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // ESC ile kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeQuickView();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeQuickView]);

  return (
    <>
      {/* Arka plan örtüsü */}
      <div
        className={`fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeQuickView}
      />

      {/* Modal paneli */}
      <div
        className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`relative grid w-full max-w-[920px] max-h-[88vh] grid-cols-1 overflow-y-auto bg-white shadow-2xl transition-all duration-300 sm:grid-cols-2 sm:overflow-hidden ${
            isOpen ? "translate-y-0 scale-100" : "translate-y-3 scale-[0.98]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Kapat"
            onClick={closeQuickView}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center bg-white/90 text-[#0a0a0a] backdrop-blur-sm transition-colors hover:bg-white"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {isLoading || !product ? (
            <div className="col-span-full flex h-[420px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#a3a3a3]" />
            </div>
          ) : (
            <>
              {/* Görsel */}
              <div className="relative bg-[#f2f2f2] sm:h-full">
                <div className="relative aspect-square sm:aspect-auto sm:h-full">
                  {activeImage ? (
                    <Image src={activeImage} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-12 w-12 text-[#a3a3a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="absolute inset-x-3 bottom-3 flex gap-1.5 overflow-x-auto">
                    {product.images.map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => setActiveImage(img.url)}
                        className={`relative h-12 w-12 shrink-0 overflow-hidden border-2 bg-white transition-colors ${
                          activeImage === img.url ? "border-[#0a0a0a]" : "border-white/70 hover:border-[#a3a3a3]"
                        }`}
                      >
                        <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" sizes="48px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Detaylar */}
              <div className="flex flex-col p-6 sm:overflow-y-auto sm:p-8">
                {product.category && (
                  <p className="store-eyebrow mb-1.5">{product.category.name}</p>
                )}
                <h2 className="mb-4 font-serif text-[22px] font-medium leading-snug text-[#0a0a0a]">
                  {product.name}
                </h2>

                <ProductDetails
                  productId={product.id}
                  productSlug={product.slug}
                  productName={product.name}
                  vendor={product.vendor}
                  taxClass={product.taxClass}
                  fallbackPricing={product.fallbackPricing}
                  variants={product.variants}
                  isLoggedIn={product.isLoggedIn}
                  isFavorited={product.isFavorited}
                  shippingInfo={null}
                  onVariantChange={(imageUrl) => { if (imageUrl) setActiveImage(imageUrl); }}
                />

                <Link
                  href={`/products/${product.slug}`}
                  onClick={closeQuickView}
                  className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0a0a0a] underline underline-offset-4 hover:text-[#525252]"
                >
                  Tüm detayları görüntüle
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
