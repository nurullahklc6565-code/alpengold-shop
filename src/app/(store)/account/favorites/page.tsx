import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-session";
import { favoritesService } from "@/server/services/storefront/favorites.service";
import { FavoriteButton } from "@/components/store/product/FavoriteButton";

export const metadata: Metadata = { title: "Favorilerim" };

export default async function FavoritesPage() {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/account/login");

  const favorites = await favoritesService.getByCustomer(customerId);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      {/* Başlık */}
      <div className="mb-8 flex items-center gap-4 border-b border-[#e5e5e5] pb-6">
        <Link
          href="/account"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#e5e5e5] hover:border-[#a3a3a3] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#525252]" strokeWidth={1.5} />
        </Link>
        <div>
          <p className="store-eyebrow mb-1">Hesabım</p>
          <h1 className="store-section-title">
            Favorilerim
            <span className="ml-3 text-[18px] font-normal text-[#a3a3a3]">({favorites.length})</span>
          </h1>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="border border-dashed border-[#e5e5e5] py-20 text-center">
          <Heart className="mx-auto h-10 w-10 text-[#e5e5e5] mb-4" strokeWidth={1} />
          <p className="store-eyebrow text-[#a3a3a3]">Henüz favori ürün yok</p>
          <Link href="/products" className="mt-5 inline-block store-btn-primary px-8 py-3 text-[13px]">
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {favorites.map(({ product }) => (
            <div key={product.id} className="store-card group relative">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative overflow-hidden bg-[#f2f2f2]" style={{ aspectRatio: "3/4" }}>
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.name}
                      fill
                      className="store-card-img object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-[11px] text-[#a3a3a3]">Görsel yok</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-0.5">
                  {product.category && (
                    <p className="store-eyebrow">{product.category.name}</p>
                  )}
                  <p className="text-[14px] font-medium text-[#0a0a0a] leading-snug line-clamp-2">
                    {product.name}
                  </p>
                  {product.variants[0] && (
                    <p className="store-price">
                      {Number(product.variants[0].basePrice).toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
              <div className="absolute top-3 right-3">
                <FavoriteButton
                  productId={product.id}
                  productSlug={product.slug}
                  productName={product.name}
                  initialFavorited={true}
                  isLoggedIn={true}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
