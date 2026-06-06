"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/store/favorites/FavoritesProvider";
import { cn } from "@/lib/utils/cn";

type Props = {
  productId: string;
  productSlug: string;
  productName?: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
};

export function FavoriteButton({ productId, productSlug, productName, isLoggedIn }: Props) {
  const { isFavorited, toggle } = useFavorites();
  const [isPending, startTransition] = useTransition();

  const favorited = isFavorited(productId);

  function handleClick() {
    if (!isLoggedIn) {
      window.location.href = `/account/login?callbackUrl=/products/${productSlug}`;
      return;
    }
    startTransition(async () => {
      await toggle(productId, productSlug, productName);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
        favorited
          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600",
        "disabled:opacity-50"
      )}
      title={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      <Heart className={cn("h-5 w-5", favorited && "fill-current")} />
    </button>
  );
}
