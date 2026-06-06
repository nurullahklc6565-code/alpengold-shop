"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { ZoomIn, X } from "lucide-react";

type Img = { id: string; url: string; alt: string | null; isPrimary: boolean };
type Props = { images: Img[]; productName: string; variantImageUrl?: string | null };

export function ProductImageGallery({ images, productName, variantImageUrl }: Props) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  const displayUrl = variantImageUrl ?? images[idx]?.url ?? null;
  const displayAlt = images[idx]?.alt ?? productName;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  }

  return (
    <>
      <div className="flex gap-3">
        {/* Küçük resimler — dikey sol */}
        {images.length > 1 && (
          <div className="hidden md:flex flex-col gap-2 w-[72px] shrink-0">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setIdx(i)}
                className={cn(
                  "relative overflow-hidden bg-[#f2f2f2] transition-all",
                  "aspect-square",
                  i === idx
                    ? "ring-1 ring-[#0a0a0a] ring-offset-1"
                    : "opacity-55 hover:opacity-100"
                )}
              >
                <Image src={img.url} alt={img.alt ?? productName} fill
                  className="object-cover" sizes="72px" />
              </button>
            ))}
          </div>
        )}

        {/* Ana görsel */}
        <div className="flex-1">
          <div
            ref={imgRef}
            className="relative overflow-hidden bg-[#f2f2f2] cursor-zoom-in group/main"
            style={{ aspectRatio: "3/4" }}
            onMouseMove={handleMouseMove}
            onClick={() => setZoom(true)}
          >
            {displayUrl ? (
              <>
                <Image
                  src={displayUrl}
                  alt={displayAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/main:scale-[1.03]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Zoom hint */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1.5 opacity-0 group-hover/main:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="h-3.5 w-3.5 text-[#525252]" strokeWidth={1.5} />
                  <span className="text-[11px] text-[#525252] font-medium">Yakınlaştır</span>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-[#a3a3a3]">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-3 text-[12px]">Görsel yüklenmemiş</p>
              </div>
            )}
          </div>

          {/* Mobil thumbnail scroll */}
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto md:hidden pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden bg-[#f2f2f2] transition-all",
                    i === idx
                      ? "ring-1 ring-[#0a0a0a] ring-offset-1"
                      : "opacity-55 hover:opacity-100"
                  )}
                >
                  <Image src={img.url} alt={img.alt ?? productName} fill
                    className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / zoom overlay */}
      {zoom && displayUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-5 w-5 text-white" strokeWidth={1.5} />
          </button>

          {/* Önceki / Sonraki */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white text-xl"
                aria-label="Önceki"
              >‹</button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white text-xl"
                aria-label="Sonraki"
              >›</button>
            </>
          )}

          <div
            className="relative overflow-hidden cursor-zoom-in"
            style={{ width: "min(90vw, 600px)", aspectRatio: "3/4" }}
            onClick={(e) => e.stopPropagation()}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setPos({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              });
            }}
          >
            <Image
              src={displayUrl}
              alt={displayAlt}
              fill
              className="object-cover"
              sizes="90vw"
              style={{
                transformOrigin: `${pos.x}% ${pos.y}%`,
                transform: "scale(1)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
            />
          </div>

          {/* Alt thumbnail şeridi */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  className={cn(
                    "relative h-12 w-12 shrink-0 overflow-hidden transition-all",
                    i === idx ? "ring-1 ring-white" : "opacity-50 hover:opacity-100"
                  )}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="48px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
